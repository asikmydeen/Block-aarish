import { BlockType } from './terrain';
import { BlockUpdate } from './useWorld';

const FLOOR_TOP_Y = 12;

export type HouseStyle = 'cottage' | 'cabin' | 'modern' | 'futuristic' | 'tower' | 'skyscraper' | 'apartment';

export interface HouseSpec {
  cx: number;
  cz: number;
  style: HouseStyle;
}

export const HOUSES: HouseSpec[] = [
  { cx: 22, cz: 6, style: 'cottage' },
  { cx: -12, cz: 18, style: 'cabin' },
  { cx: 8, cz: -18, style: 'modern' },
  { cx: -22, cz: -10, style: 'futuristic' },
  { cx: 28, cz: -22, style: 'tower' },
  { cx: -28, cz: 22, style: 'cottage' },
  { cx: 55, cz: 10, style: 'skyscraper' },
  { cx: -55, cz: -10, style: 'skyscraper' },
  { cx: 40, cz: -40, style: 'apartment' },
  { cx: -40, cz: 40, style: 'apartment' },
];

export function generateHouseUpdates(): BlockUpdate[] {
  const updates: BlockUpdate[] = [];
  for (const h of HOUSES) {
    buildHouse(updates, h);
  }
  return updates;
}

function set(updates: BlockUpdate[], wx: number, wy: number, wz: number, type: BlockType) {
  updates.push({ wx, wy, wz, type });
}

function buildHouse(updates: BlockUpdate[], h: HouseSpec) {
  switch (h.style) {
    case 'cottage':
      buildCottage(updates, h.cx, h.cz);
      break;
    case 'cabin':
      buildCabin(updates, h.cx, h.cz);
      break;
    case 'modern':
      buildModern(updates, h.cx, h.cz);
      break;
    case 'futuristic':
      buildFuturistic(updates, h.cx, h.cz);
      break;
    case 'tower':
      buildTower(updates, h.cx, h.cz);
      break;
    case 'skyscraper':
      buildSkyscraper(updates, h.cx, h.cz);
      break;
    case 'apartment':
      buildApartment(updates, h.cx, h.cz);
      break;
  }
}

// ── Interior furniture helpers ─────────────────────────────────────────────

function addKitchen(updates: BlockUpdate[], cx: number, cz: number, baseY: number) {
  // L-shaped counter along back-left corner
  set(updates, cx, baseY, cz, 'wood');
  set(updates, cx - 1, baseY, cz, 'wood');
  set(updates, cx, baseY, cz - 1, 'wood');
  // Stove on counter (metal block one above the counter row)
  set(updates, cx - 1, baseY + 1, cz, 'metal');
  // Sink (glass pane look: glass block on counter)
  set(updates, cx, baseY + 1, cz - 1, 'glass');
}

function addBathroom(updates: BlockUpdate[], cx: number, cz: number, baseY: number) {
  // Toilet: stone block in corner
  set(updates, cx, baseY, cz, 'stone');
  // Sink: glass block beside it
  set(updates, cx - 1, baseY, cz, 'glass');
  // Bathtub suggestion: row of stone blocks
  set(updates, cx, baseY, cz - 1, 'stone');
  set(updates, cx, baseY, cz - 2, 'stone');
}

// Ascending staircase: places blocks at rising Y so player can walk up
function addStairs(
  updates: BlockUpdate[],
  startX: number,
  startY: number,
  startZ: number,
  dirX: number,
  dirZ: number,
  steps: number
) {
  for (let i = 0; i < steps; i++) {
    set(updates, startX + dirX * i, startY + i, startZ + dirZ * i, 'wood');
  }
}

// ── Cottage ────────────────────────────────────────────────────────────────
// Single-storey wood cottage with pitched roof.
// Interior: kitchen (back-left) + bathroom (back-right).

function buildCottage(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 4, d = 4, height = 3;

  // Walls
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < height; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isDoor = dz === -d && dx === 0 && dy < 2;
        if (isDoor) continue;
        const isWindow = dy === 1 && (
          (dx === -w && dz === 0) ||
          (dx === w && dz === 0) ||
          (dz === d && (dx === -1 || dx === 1))
        );
        set(updates, cx + dx, baseY + dy, cz + dz, isWindow ? 'glass' : 'wood');
      }
    }
  }

  // Pitched roof
  for (let dx = -w - 1; dx <= w + 1; dx++) {
    for (let dz = -d - 1; dz <= d + 1; dz++) {
      const ridge = Math.max(0, Math.min(d, w) - Math.max(Math.abs(dx), Math.abs(dz)) + 1);
      const roofY = baseY + height + ridge;
      const edge = dx === -w - 1 || dx === w + 1 || dz === -d - 1 || dz === d + 1;
      set(updates, cx + dx, roofY, cz + dz, edge ? 'wood' : 'leaves');
    }
  }

  // Interior: kitchen at back-left, bathroom at back-right
  addKitchen(updates, cx - 2, cz + 2, baseY);
  addBathroom(updates, cx + 2, cz + 2, baseY);
}

// ── Cabin ──────────────────────────────────────────────────────────────────
// Two-storey log cabin. Ground floor: living area + kitchen. Upper floor: bedroom.

function buildCabin(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 5, d = 6;
  const floor1H = 4;
  const floor2H = 3;

  // ── Ground floor walls ──
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < floor1H; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isDoor = dz === -d && dx === 0 && dy < 2;
        if (isDoor) continue;
        const isWindow = (dy === 1 || dy === 2) && (
          ((dx === -w || dx === w) && (dz === -2 || dz === 0 || dz === 2)) ||
          (dz === d && (dx === -2 || dx === 0 || dx === 2))
        );
        set(updates, cx + dx, baseY + dy, cz + dz, isWindow ? 'glass' : 'wood');
      }
    }
  }

  // ── Inter-floor slab (ceiling of floor 1 / floor of floor 2) ──
  for (let dx = -w + 1; dx <= w - 1; dx++) {
    for (let dz = -d + 1; dz <= d - 1; dz++) {
      set(updates, cx + dx, baseY + floor1H, cz + dz, 'wood');
    }
  }
  // Outer ring of slab (on top of walls)
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      const onEdge = dx === -w || dx === w || dz === -d || dz === d;
      if (onEdge) set(updates, cx + dx, baseY + floor1H, cz + dz, 'wood');
    }
  }

  // ── Staircase: corner of interior, ascending toward front ──
  // Starts at back-right interior corner, climbs 4 steps toward front
  addStairs(updates, cx + w - 1, baseY, cz + d - 1, 0, -1, floor1H);

  // ── Second floor walls ──
  const f2Base = baseY + floor1H;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 1; dy <= floor2H; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isWindow2 = dy === 1 && (
          ((dx === -w || dx === w) && (dz === 0)) ||
          (dz === -d && (dx === -2 || dx === 2)) ||
          (dz === d && (dx === 0))
        );
        set(updates, cx + dx, f2Base + dy, cz + dz, isWindow2 ? 'glass' : 'wood');
      }
    }
  }

  // ── Second floor roof (flat layered) ──
  const roofBase = f2Base + floor2H + 1;
  for (let layer = 0; layer < 3; layer++) {
    const expand = 1 - layer;
    for (let dx = -w - expand; dx <= w + expand; dx++) {
      for (let dz = -d - expand; dz <= d + expand; dz++) {
        if (layer === 0) {
          set(updates, cx + dx, roofBase + layer, cz + dz, 'wood');
        } else {
          const distFromCenterX = Math.abs(dx);
          const distFromCenterZ = Math.abs(dz);
          if (distFromCenterX <= w - layer + 1 && distFromCenterZ <= d - layer + 1) {
            set(updates, cx + dx, roofBase + layer, cz + dz, 'wood');
          }
        }
      }
    }
  }

  // ── Ground floor interior: kitchen (back-left) ──
  addKitchen(updates, cx - 3, cz + 4, baseY);

  // ── Second floor interior: bathroom ──
  addBathroom(updates, cx + 3, cz + 4, f2Base + 1);
}

// ── Modern ─────────────────────────────────────────────────────────────────
// Flat-roof concrete/glass house with second floor and interior rooms.

function buildModern(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 5, d = 4;
  const floor1H = 4;
  const floor2H = 3;

  // ── Ground floor walls ──
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < floor1H; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isDoor = dz === -d && (dx === 0 || dx === 1) && dy < 2;
        if (isDoor) continue;
        const isFrontGlass = dz === -d && (dx === -2 || dx === -1) && (dy === 1 || dy === 2);
        const isSidePane = (dx === -w || dx === w) && (dy === 1 || dy === 2);
        const isBackPane = dz === d && (dy === 1 || dy === 2);
        const isGlass = isFrontGlass || isSidePane || isBackPane;
        let material: BlockType = 'concrete';
        if (dy === 0) material = 'stone';
        if (isGlass) material = 'glass';
        set(updates, cx + dx, baseY + dy, cz + dz, material);
      }
    }
  }

  // ── Floor slab between floors ──
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      set(updates, cx + dx, baseY + floor1H, cz + dz, 'concrete');
    }
  }

  // ── Staircase (interior front-left corner) ──
  addStairs(updates, cx - w + 1, baseY, cz - d + 1, 0, 1, floor1H);

  // ── Second floor walls ──
  const f2Base = baseY + floor1H;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 1; dy <= floor2H; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isSideGlass = (dx === -w || dx === w) && dy === 1;
        const isBackGlass = dz === d && dy === 1;
        const isGlass = isSideGlass || isBackGlass;
        set(updates, cx + dx, f2Base + dy, cz + dz, isGlass ? 'glass' : 'concrete');
      }
    }
  }

  // ── Flat roof over second floor ──
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      set(updates, cx + dx, f2Base + floor2H + 1, cz + dz, 'concrete');
    }
  }

  // ── Rooftop railing ──
  const roofY = f2Base + floor2H + 1;
  for (let dx = -w; dx <= w; dx++) {
    set(updates, cx + dx, roofY + 1, cz - d, 'metal');
    set(updates, cx + dx, roofY + 1, cz + d, 'metal');
  }
  for (let dz = -d; dz <= d; dz++) {
    set(updates, cx - w, roofY + 1, cz + dz, 'metal');
    set(updates, cx + w, roofY + 1, cz + dz, 'metal');
  }

  // Decorative poles
  set(updates, cx - w - 1, baseY + floor1H, cz - d, 'metal');
  set(updates, cx + w + 1, baseY + floor1H, cz + d, 'metal');

  // ── Interior rooms ──
  addKitchen(updates, cx + 3, cz + 2, baseY);
  addBathroom(updates, cx + 3, cz - 2, baseY);
  addBathroom(updates, cx + 3, cz + 2, f2Base + 1);
}

// ── Futuristic ─────────────────────────────────────────────────────────────
// Cylindrical metal/glass pod with interior bathroom.

function buildFuturistic(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 4, d = 4, height = 5;

  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      const distSq = dx * dx + dz * dz;
      if (distSq > (w + 0.5) * (w + 0.5)) continue;
      for (let dy = 0; dy < height; dy++) {
        const isShellAtY =
          distSq > (w - 0.5) * (w - 0.5) ||
          (dy === 0) ||
          (dy === height - 1);
        if (!isShellAtY) continue;
        const isDoor = dz === -d && dx === 0 && dy < 2;
        if (isDoor) continue;
        let material: BlockType = 'metal';
        const isGlassBand = dy === 2 || dy === 3;
        if (isGlassBand && distSq > (w - 1) * (w - 1)) {
          material = 'glass';
        }
        if (dy === 0) material = 'metal';
        if (dy === height - 1) material = 'metal';
        set(updates, cx + dx, baseY + dy, cz + dz, material);
      }
    }
  }

  // Spire
  for (let r = 0; r < 3; r++) {
    for (let dx = -w + r; dx <= w - r; dx++) {
      for (let dz = -d + r; dz <= d - r; dz++) {
        const distSq = dx * dx + dz * dz;
        if (distSq > (w - r) * (w - r)) continue;
        if (distSq < (w - r - 1) * (w - r - 1)) continue;
        set(updates, cx + dx, baseY + height + r, cz + dz, 'metal');
      }
    }
  }
  set(updates, cx, baseY + height + 3, cz, 'neon');
  set(updates, cx + 2, baseY + height, cz - 2, 'neon');
  set(updates, cx - 2, baseY + height, cz + 2, 'neon');
  set(updates, cx - w - 1, baseY, cz, 'neon');
  set(updates, cx + w + 1, baseY, cz, 'neon');

  // Interior bathroom pod
  addBathroom(updates, cx + 2, cz + 2, baseY + 1);
}

// ── Tower ──────────────────────────────────────────────────────────────────
// Narrow concrete/glass tower with antenna.

function buildTower(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 3, d = 3, height = 9;

  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < height; dy++) {
        const onEdge = dx === -w || dx === w || dz === -d || dz === d;
        if (!onEdge) continue;
        const isDoor = dz === -d && dx === 0 && dy < 2;
        if (isDoor) continue;
        const isFloor = dy % 3 === 0 && dy > 0;
        const inWindowBand = dy % 3 === 1;
        const isWindow = inWindowBand && (
          (dx === -w && dz === 0) ||
          (dx === w && dz === 0) ||
          (dz === d && (dx === -1 || dx === 1)) ||
          (dz === -d && (dx === -2 || dx === 2))
        );
        let material: BlockType = isFloor ? 'metal' : 'concrete';
        if (isWindow) material = 'glass';
        set(updates, cx + dx, baseY + dy, cz + dz, material);
      }
    }
  }

  // Roof slab
  for (let dx = -w - 1; dx <= w + 1; dx++) {
    for (let dz = -d - 1; dz <= d + 1; dz++) {
      set(updates, cx + dx, baseY + height, cz + dz, 'metal');
    }
  }

  // Antenna
  set(updates, cx, baseY + height + 1, cz, 'neon');
  set(updates, cx, baseY + height + 2, cz, 'neon');
  set(updates, cx, baseY + height + 3, cz, 'metal');
  set(updates, cx + 1, baseY + height + 3, cz, 'metal');
  set(updates, cx - 1, baseY + height + 3, cz, 'metal');
  set(updates, cx, baseY + height + 3, cz + 1, 'metal');
  set(updates, cx, baseY + height + 3, cz - 1, 'metal');

  // Interior stairwell at each floor + lobby bathroom
  addStairs(updates, cx + w - 1, baseY, cz + d - 1, 0, -1, 3);
  addStairs(updates, cx + w - 1, baseY + 3, cz + d - 1, 0, -1, 3);
  addStairs(updates, cx + w - 1, baseY + 6, cz + d - 1, 0, -1, 3);
  addBathroom(updates, cx - 1, cz + 1, baseY + 1);
}

// ── Skyscraper ─────────────────────────────────────────────────────────────
// Tall glass-and-concrete office tower with repeating floor bands,
// lobby, internal stairwell, and rooftop observation deck.

function buildSkyscraper(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 4, d = 4;
  const numFloors = 7;        // 7 floors × 4 blocks each = 28 blocks tall
  const floorHeight = 4;
  const totalHeight = numFloors * floorHeight;

  for (let floor = 0; floor < numFloors; floor++) {
    const floorBase = baseY + floor * floorHeight;
    const isGroundFloor = floor === 0;

    for (let dx = -w; dx <= w; dx++) {
      for (let dz = -d; dz <= d; dz++) {
        for (let dy = 0; dy < floorHeight; dy++) {
          const onEdge = dx === -w || dx === w || dz === -d || dz === d;
          if (!onEdge) continue;

          // Door: ground floor front, two blocks wide
          const isDoor = isGroundFloor && dz === -d && (dx === 0 || dx === 1) && dy < 2;
          if (isDoor) continue;

          // Slab row at bottom of each floor band
          const isFloorBand = dy === 0 && floor > 0;

          // Window bands: rows 1 and 2 within each floor segment (skip corners for structure)
          const isWindowRow = dy === 1 || dy === 2;
          const isCorner = (dx === -w || dx === w) && (dz === -d || dz === d);
          const isWindow = isWindowRow && !isCorner;

          // Ground floor: mostly glass facade
          const isGroundGlass = isGroundFloor && (dy === 1 || dy === 2) && !isCorner;

          let material: BlockType = 'concrete';
          if (isFloorBand) material = 'metal';
          if (isWindow || isGroundGlass) material = 'glass';
          if (dy === 0 && floor === 0) material = 'stone'; // foundation row

          set(updates, cx + dx, floorBase + dy, cz + dz, material);
        }
      }
    }

    // Floor slab (interior only) between floors
    if (floor > 0) {
      for (let dx = -w + 1; dx <= w - 1; dx++) {
        for (let dz = -d + 1; dz <= d - 1; dz++) {
          set(updates, cx + dx, floorBase, cz + dz, 'concrete');
        }
      }
    }

    // Stairwell column at back-right corner of interior: one step per floor
    if (floor < numFloors - 1) {
      addStairs(updates, cx + w - 1, floorBase, cz + d - 1, 0, -1, floorHeight);
    }

    // Add bathroom on floors 2, 4 (zero-indexed 1, 3)
    if (floor === 1 || floor === 3) {
      addBathroom(updates, cx - w + 2, cz + d - 2, floorBase + 1);
    }
    // Kitchen/break-room on floor 3
    if (floor === 2) {
      addKitchen(updates, cx + w - 2, cz + d - 2, floorBase + 1);
    }
  }

  // Rooftop observation deck
  const roofY = baseY + totalHeight;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      set(updates, cx + dx, roofY, cz + dz, 'metal');
    }
  }
  // Railing around roof edge
  for (let dx = -w; dx <= w; dx++) {
    set(updates, cx + dx, roofY + 1, cz - d, 'metal');
    set(updates, cx + dx, roofY + 1, cz + d, 'metal');
  }
  for (let dz = -d + 1; dz <= d - 1; dz++) {
    set(updates, cx - w, roofY + 1, cz + dz, 'metal');
    set(updates, cx + w, roofY + 1, cz + dz, 'metal');
  }
  // Spire / antenna
  set(updates, cx, roofY + 1, cz, 'metal');
  set(updates, cx, roofY + 2, cz, 'metal');
  set(updates, cx, roofY + 3, cz, 'metal');
  set(updates, cx, roofY + 4, cz, 'neon');
  set(updates, cx, roofY + 5, cz, 'neon');
  set(updates, cx, roofY + 6, cz, 'metal');
}

// ── Apartment ──────────────────────────────────────────────────────────────
// Mid-rise apartment block: 3 floors, multiple unit doors, front balconies,
// interior stairwell, bathroom + kitchen per floor.

function buildApartment(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 7, d = 5;
  const numFloors = 3;
  const floorHeight = 4;

  for (let floor = 0; floor < numFloors; floor++) {
    const floorBase = baseY + floor * floorHeight;
    const isGroundFloor = floor === 0;

    // ── Walls ──
    for (let dx = -w; dx <= w; dx++) {
      for (let dz = -d; dz <= d; dz++) {
        for (let dy = 0; dy < floorHeight; dy++) {
          const onEdge = dx === -w || dx === w || dz === -d || dz === d;
          if (!onEdge) continue;

          // Unit doors on ground floor front: three doors at evenly spaced positions
          const unitDoorPositions = [-4, 0, 4];
          const isDoor = isGroundFloor && dz === -d &&
            unitDoorPositions.includes(dx) && dy < 2;
          if (isDoor) continue;

          // Floor band at base of upper floors
          const isFloorBand = dy === 0 && floor > 0;

          // Windows: rows 1-2, spaced along walls (not corners)
          const isCorner = (dx === -w || dx === w) && (dz === -d || dz === d);
          const isFrontWindow = dz === -d && (dy === 1 || dy === 2) && !isCorner &&
            !unitDoorPositions.includes(dx);
          const isSideWindow = (dx === -w || dx === w) && (dy === 1 || dy === 2) &&
            (dz === -2 || dz === 0 || dz === 2);
          const isBackWindow = dz === d && (dy === 1 || dy === 2) &&
            (Math.abs(dx) === 2 || dx === 0);
          const isWindow = isFrontWindow || isSideWindow || isBackWindow;

          let material: BlockType = 'concrete';
          if (isFloorBand) material = 'stone';
          if (isWindow) material = 'glass';
          if (dy === 0 && floor === 0) material = 'stone';

          set(updates, cx + dx, floorBase + dy, cz + dz, material);
        }
      }
    }

    // ── Interior floor slab (above ground floor and up) ──
    if (floor > 0) {
      for (let dx = -w + 1; dx <= w - 1; dx++) {
        for (let dz = -d + 1; dz <= d - 1; dz++) {
          set(updates, cx + dx, floorBase, cz + dz, 'wood');
        }
      }
    }

    // ── Front balconies: extend 2 blocks out from front wall ──
    if (floor > 0) {
      for (let dx = -w + 1; dx <= w - 1; dx++) {
        // Balcony floor
        set(updates, cx + dx, floorBase, cz - d - 1, 'concrete');
        set(updates, cx + dx, floorBase, cz - d - 2, 'concrete');
      }
      // Balcony railing
      for (let dx = -w + 1; dx <= w - 1; dx++) {
        set(updates, cx + dx, floorBase + 1, cz - d - 2, 'metal');
      }
      set(updates, cx - w + 1, floorBase + 1, cz - d - 1, 'metal');
      set(updates, cx + w - 1, floorBase + 1, cz - d - 1, 'metal');
    }

    // ── Stairwell at back-right interior corner ──
    if (floor < numFloors - 1) {
      addStairs(updates, cx + w - 1, floorBase, cz + d - 1, 0, -1, floorHeight);
    }

    // ── Interior rooms ──
    // Kitchen: back-left of each unit section
    addKitchen(updates, cx - 5, cz + 3, floorBase + 1);
    addKitchen(updates, cx + 1, cz + 3, floorBase + 1);
    // Bathroom: back-right of each unit section
    addBathroom(updates, cx + 5, cz + 3, floorBase + 1);
    addBathroom(updates, cx - 1, cz + 3, floorBase + 1);
  }

  // ── Flat roof ──
  const roofY = baseY + numFloors * floorHeight;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      set(updates, cx + dx, roofY, cz + dz, 'concrete');
    }
  }
  // Parapet walls
  for (let dx = -w; dx <= w; dx++) {
    set(updates, cx + dx, roofY + 1, cz - d, 'concrete');
    set(updates, cx + dx, roofY + 1, cz + d, 'concrete');
  }
  for (let dz = -d; dz <= d; dz++) {
    set(updates, cx - w, roofY + 1, cz + dz, 'concrete');
    set(updates, cx + w, roofY + 1, cz + dz, 'concrete');
  }
  // Rooftop water tower (decorative)
  set(updates, cx + w - 2, roofY + 1, cz + d - 2, 'metal');
  set(updates, cx + w - 2, roofY + 2, cz + d - 2, 'metal');
  set(updates, cx + w - 2, roofY + 3, cz + d - 2, 'water');
  set(updates, cx + w - 3, roofY + 2, cz + d - 2, 'metal');
  set(updates, cx + w - 1, roofY + 2, cz + d - 2, 'metal');
}
