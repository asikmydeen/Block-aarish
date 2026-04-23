export type BlockType = 'air' | 'grass' | 'dirt' | 'stone' | 'sand' | 'wood' | 'leaves' | 'water' | 'snow' | 'coal' | 'iron' | 'bedrock';

export interface Block {
  type: BlockType;
}

const CHUNK_SIZE = 16;
const WORLD_HEIGHT = 32;

function noise(x: number, z: number, seed: number): number {
  let n = Math.sin(x * 127.1 + z * 311.7 + seed * 74.3) * 43758.5453123;
  return n - Math.floor(n);
}

function smoothNoise(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);

  const a = noise(ix, iz, seed);
  const b = noise(ix + 1, iz, seed);
  const c = noise(ix, iz + 1, seed);
  const d = noise(ix + 1, iz + 1, seed);

  return a + (b - a) * ux + (c - a) * uz + (d - a + a - b - c + b + c - d) * ux * uz;
}

function fbm(x: number, z: number, seed: number, octaves: number = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, z * frequency, seed + i * 100) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / max;
}

export function getTerrainHeight(worldX: number, worldZ: number, seed: number = 42): number {
  const scale = 0.05;
  const height = fbm(worldX * scale, worldZ * scale, seed);
  return Math.floor(height * 20) + 5;
}

function shouldPlaceTree(worldX: number, worldZ: number, seed: number): boolean {
  const v = noise(worldX * 3.7 + 11.3, worldZ * 3.7 + 23.7, seed + 500);
  return v > 0.93;
}

export function generateChunk(chunkX: number, chunkZ: number, seed: number = 42): Map<string, BlockType> {
  const blocks = new Map<string, BlockType>();

  const treePositions: Set<string> = new Set();

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const worldX = chunkX * CHUNK_SIZE + lx;
      const worldZ = chunkZ * CHUNK_SIZE + lz;
      const surfaceY = getTerrainHeight(worldX, worldZ, seed);

      if (shouldPlaceTree(worldX, worldZ, seed) && surfaceY > 7 && surfaceY < 20) {
        treePositions.add(`${lx},${lz}`);
      }

      for (let y = 0; y <= WORLD_HEIGHT; y++) {
        const key = `${lx},${y},${lz}`;
        if (y === 0) {
          blocks.set(key, 'bedrock');
        } else if (y < surfaceY - 4) {
          const stoneNoise = noise(worldX * 0.5, y * 0.5, seed + worldZ * 0.5 + 999);
          if (stoneNoise > 0.9) {
            blocks.set(key, 'iron');
          } else if (stoneNoise > 0.82) {
            blocks.set(key, 'coal');
          } else {
            blocks.set(key, 'stone');
          }
        } else if (y < surfaceY) {
          blocks.set(key, 'dirt');
        } else if (y === surfaceY) {
          if (surfaceY <= 6) {
            blocks.set(key, 'sand');
          } else if (surfaceY >= 22) {
            blocks.set(key, 'snow');
          } else {
            blocks.set(key, 'grass');
          }
        } else if (y <= 5 && y > surfaceY) {
          blocks.set(key, 'water');
        }
      }
    }
  }

  for (const pos of treePositions) {
    const [lxStr, lzStr] = pos.split(',');
    const lx = parseInt(lxStr);
    const lz = parseInt(lzStr);
    const worldX = chunkX * CHUNK_SIZE + lx;
    const worldZ = chunkZ * CHUNK_SIZE + lz;
    const surfaceY = getTerrainHeight(worldX, worldZ, seed);

    const trunkHeight = 4 + Math.floor(noise(worldX * 7.1, worldZ * 7.1, seed + 300) * 3);

    for (let ty = 1; ty <= trunkHeight; ty++) {
      const key = `${lx},${surfaceY + ty},${lz}`;
      blocks.set(key, 'wood');
    }

    const leafTop = surfaceY + trunkHeight;
    for (let ly = leafTop - 2; ly <= leafTop + 1; ly++) {
      const radius = ly >= leafTop ? 1 : 2;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius && Math.abs(dz) === radius) continue;
          const llx = lx + dx;
          const llz = lz + dz;
          if (llx < 0 || llx >= CHUNK_SIZE || llz < 0 || llz >= CHUNK_SIZE) continue;
          const lkey = `${llx},${ly},${llz}`;
          if (!blocks.get(lkey) || blocks.get(lkey) === 'air') {
            blocks.set(lkey, 'leaves');
          }
        }
      }
    }
  }

  return blocks;
}
