import { BlockUpdate } from './useWorld';

const FLOOR_TOP_Y = 12;

export interface HouseSpec {
  cx: number;
  cz: number;
  width: number;
  depth: number;
  height: number;
}

export const HOUSES: HouseSpec[] = [
  { cx: 22, cz: 6, width: 6, depth: 6, height: 4 },
  { cx: -10, cz: 18, width: 5, depth: 7, height: 4 },
  { cx: 6, cz: -16, width: 7, depth: 5, height: 3 },
  { cx: -20, cz: -8, width: 5, depth: 5, height: 4 },
];

export function generateHouseUpdates(): BlockUpdate[] {
  const updates: BlockUpdate[] = [];
  for (const h of HOUSES) {
    addHouse(updates, h);
  }
  return updates;
}

function addHouse(updates: BlockUpdate[], h: HouseSpec) {
  const baseY = FLOOR_TOP_Y + 1;
  const halfW = Math.floor(h.width / 2);
  const halfD = Math.floor(h.depth / 2);

  for (let dx = -halfW; dx <= halfW; dx++) {
    for (let dz = -halfD; dz <= halfD; dz++) {
      for (let dy = 0; dy < h.height; dy++) {
        const onEdge =
          dx === -halfW || dx === halfW || dz === -halfD || dz === halfD;
        if (!onEdge) continue;
        const isDoor = dz === -halfD && dx === 0 && dy < 2;
        const isWindow =
          (dy === 1 || dy === 2) &&
          ((dx === halfW && (dz === -1 || dz === 1)) ||
            (dx === -halfW && (dz === -1 || dz === 1)) ||
            (dz === halfD && (dx === -1 || dx === 1)));
        if (isDoor || isWindow) continue;
        updates.push({ wx: h.cx + dx, wy: baseY + dy, wz: h.cz + dz, type: 'wood' });
      }
    }
  }

  for (let dx = -halfW - 1; dx <= halfW + 1; dx++) {
    for (let dz = -halfD - 1; dz <= halfD + 1; dz++) {
      const edge =
        dx === -halfW - 1 || dx === halfW + 1 || dz === -halfD - 1 || dz === halfD + 1;
      const ridgeFactor = Math.max(0, halfD - Math.abs(dz));
      const roofY = baseY + h.height + Math.min(2, Math.floor(ridgeFactor / 2));
      updates.push({
        wx: h.cx + dx,
        wy: roofY,
        wz: h.cz + dz,
        type: edge ? 'wood' : 'leaves',
      });
    }
  }

  updates.push({
    wx: h.cx,
    wy: baseY + h.height + 3,
    wz: h.cz,
    type: 'wood',
  });
}
