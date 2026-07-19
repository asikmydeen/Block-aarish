export type PowerId = 'speed' | 'jump' | 'strength' | 'shield' | 'regen' | 'feather';

export interface PowerSpec {
  id: PowerId;
  code: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
}

export const POWERS: PowerSpec[] = [
  { id: 'speed', code: '247', name: 'Super Speed', icon: '⚡', desc: 'Run almost twice as fast', color: '#ffd24d' },
  { id: 'jump', code: '583', name: 'Super Jump', icon: '🦘', desc: 'Jump much higher', color: '#5ad1ff' },
  { id: 'strength', code: '916', name: 'Titan Strength', icon: '💪', desc: 'Weapons deal double damage', color: '#ff6b5a' },
  { id: 'shield', code: '342', name: 'Stone Skin', icon: '🛡️', desc: 'Take only half damage', color: '#b0bec5' },
  { id: 'regen', code: '775', name: 'Regeneration', icon: '💚', desc: 'Health recovers much faster', color: '#66ff8c' },
  { id: 'feather', code: '168', name: 'Feather Fall', icon: '🪶', desc: 'Low gravity — float like a feather', color: '#e0aaff' },
];

// Hundreds of secret numbers scattered across the world (y resolved from terrain at runtime).
// Each code maps to one of the 6 powers. Deterministic seeded generation so the world
// is the same every session.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SecretSpot {
  code: string;
  x: number;
  z: number;
  color: string;
  powerId: PowerId;
}

function generateSpots(): { spots: SecretSpot[]; codeToPower: Map<string, PowerSpec> } {
  const rand = mulberry32(20260719);
  const spots: SecretSpot[] = [];
  const codeToPower = new Map<string, PowerSpec>();
  const usedCodes = new Set<string>();
  const COUNT = 300;
  for (let i = 0; i < COUNT; i++) {
    let code = '';
    do {
      code = String(100 + Math.floor(rand() * 900));
    } while (usedCodes.has(code) && usedCodes.size < 890);
    if (usedCodes.has(code)) break;
    usedCodes.add(code);
    const power = POWERS[i % POWERS.length];
    // Spread across the world, avoid the exact spawn point
    let x = 0;
    let z = 0;
    do {
      x = Math.floor((rand() - 0.5) * 300);
      z = Math.floor((rand() - 0.5) * 300);
    } while (Math.abs(x - 8) < 5 && Math.abs(z - 8) < 5);
    spots.push({ code, x, z, color: power.color, powerId: power.id });
    codeToPower.set(code, power);
  }
  return { spots, codeToPower };
}

const generated = generateSpots();
export const SECRET_SPOTS: SecretSpot[] = generated.spots;
export const CODE_TO_POWER: Map<string, PowerSpec> = generated.codeToPower;

// Mutable multipliers read by Player/combat each frame.
export const powerState = {
  speedMult: 1,
  jumpMult: 1,
  gravityMult: 1,
  damageMult: 1,
  damageTakenMult: 1,
  fastRegen: false,
};

export function applyPowers(unlocked: ReadonlySet<PowerId>) {
  powerState.speedMult = unlocked.has('speed') ? 1.8 : 1;
  powerState.jumpMult = unlocked.has('jump') ? 1.55 : 1;
  powerState.gravityMult = unlocked.has('feather') ? 0.45 : 1;
  powerState.damageMult = unlocked.has('strength') ? 2 : 1;
  powerState.damageTakenMult = unlocked.has('shield') ? 0.5 : 1;
  powerState.fastRegen = unlocked.has('regen');
}
