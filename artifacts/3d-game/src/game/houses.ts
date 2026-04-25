import { BlockType } from './terrain';
import { BlockUpdate } from './useWorld';

const FLOOR_TOP_Y = 12;

export type HouseStyle = 'cottage' | 'cabin' | 'modern' | 'futuristic' | 'tower';

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
  }
}

function buildCottage(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 4, d = 4, height = 3;
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
  for (let dx = -w - 1; dx <= w + 1; dx++) {
    for (let dz = -d - 1; dz <= d + 1; dz++) {
      const ridge = Math.max(0, Math.min(d, w) - Math.max(Math.abs(dx), Math.abs(dz)) + 1);
      const roofY = baseY + height + ridge;
      const edge = dx === -w - 1 || dx === w + 1 || dz === -d - 1 || dz === d + 1;
      set(updates, cx + dx, roofY, cz + dz, edge ? 'wood' : 'leaves');
    }
  }
}

function buildCabin(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 5, d = 6, height = 4;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < height; dy++) {
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
  for (let layer = 0; layer < 3; layer++) {
    const expand = 1 - layer;
    for (let dx = -w - expand; dx <= w + expand; dx++) {
      for (let dz = -d - expand; dz <= d + expand; dz++) {
        if (layer === 0) {
          const edge = dx === -w - 1 || dx === w + 1 || dz === -d - 1 || dz === d + 1;
          set(updates, cx + dx, baseY + height + layer, cz + dz, edge ? 'wood' : 'wood');
        } else {
          const distFromCenterX = Math.abs(dx);
          const distFromCenterZ = Math.abs(dz);
          if (distFromCenterX <= w - layer + 1 && distFromCenterZ <= d - layer + 1) {
            set(updates, cx + dx, baseY + height + layer, cz + dz, 'wood');
          }
        }
      }
    }
  }
}

function buildModern(updates: BlockUpdate[], cx: number, cz: number) {
  const baseY = FLOOR_TOP_Y + 1;
  const w = 5, d = 4, height = 4;
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      for (let dy = 0; dy < height; dy++) {
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
  for (let dx = -w; dx <= w; dx++) {
    for (let dz = -d; dz <= d; dz++) {
      set(updates, cx + dx, baseY + height, cz + dz, 'concrete');
    }
  }
  for (let dx = -w - 2; dx <= w + 2; dx++) {
    set(updates, cx + dx, baseY, cz - d - 2, 'stone');
  }
  for (let dz = -d - 1; dz <= d + 1; dz++) {
    set(updates, cx + w + 2, baseY, cz + dz, 'stone');
  }
  set(updates, cx - w - 1, baseY + height, cz - d, 'metal');
  set(updates, cx + w + 1, baseY + height, cz + d, 'metal');
}

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
}

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
  for (let dx = -w - 1; dx <= w + 1; dx++) {
    for (let dz = -d - 1; dz <= d + 1; dz++) {
      set(updates, cx + dx, baseY + height, cz + dz, 'metal');
    }
  }
  set(updates, cx, baseY + height + 1, cz, 'neon');
  set(updates, cx, baseY + height + 2, cz, 'neon');
  set(updates, cx, baseY + height + 3, cz, 'metal');
  set(updates, cx + 1, baseY + height + 3, cz, 'metal');
  set(updates, cx - 1, baseY + height + 3, cz, 'metal');
  set(updates, cx, baseY + height + 3, cz + 1, 'metal');
  set(updates, cx, baseY + height + 3, cz - 1, 'metal');
}
