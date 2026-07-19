export type PowerId =
  | 'speed'
  | 'jump'
  | 'strength'
  | 'shield'
  | 'regen'
  | 'feather'
  | 'reach'
  | 'turbo'
  | 'chassis'
  | 'mechanic'
  | 'doublejump'
  | 'fear'
  | 'crit'
  | 'vitality'
  | 'loot';

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
  { id: 'reach', code: '429', name: 'Long Arms', icon: '🦾', desc: 'Break and place blocks from twice as far', color: '#ffa94d' },
  { id: 'turbo', code: '651', name: 'Turbo Driver', icon: '🏎️', desc: 'Cars you drive go 50% faster', color: '#4dd2ff' },
  { id: 'chassis', code: '384', name: 'Steel Chassis', icon: '🚙', desc: 'Your car takes half crash damage', color: '#9fb4c7' },
  { id: 'mechanic', code: '527', name: 'Master Mechanic', icon: '🔧', desc: 'One press of R fully repairs a car', color: '#ffd166' },
  { id: 'doublejump', code: '893', name: 'Double Jump', icon: '🐰', desc: 'Jump again in mid-air', color: '#8affc1' },
  { id: 'fear', code: '236', name: 'Fear Aura', icon: '👻', desc: 'Zombies move much slower near you', color: '#c8b6ff' },
  { id: 'crit', code: '714', name: 'Lucky Strike', icon: '🍀', desc: '25% chance to deal double damage', color: '#7bed9f' },
  { id: 'vitality', code: '962', name: 'Vitality', icon: '❤️', desc: 'Max health raised to 16', color: '#ff8fa3' },
  { id: 'loot', code: '345', name: 'Lucky Looter', icon: '💰', desc: 'Chests hold much more loot', color: '#f9c74f' },
];

// Hundreds of secret numbers scattered across the world (y resolved from terrain at runtime).
// Each code maps to one of the 15 powers. Deterministic seeded generation so the world
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

// Mutable multipliers read by Player/combat/cars/zombies each frame.
export const powerState = {
  speedMult: 1,
  jumpMult: 1,
  gravityMult: 1,
  damageMult: 1,
  damageTakenMult: 1,
  fastRegen: false,
  reachMult: 1,
  carSpeedMult: 1,
  carDamageTakenMult: 1,
  fullRepair: false,
  doubleJump: false,
  zombieSpeedMult: 1,
  critChance: 0,
  maxHealth: 10,
  lootLuck: false,
};

export function applyPowers(unlocked: ReadonlySet<PowerId>) {
  powerState.speedMult = unlocked.has('speed') ? 1.8 : 1;
  powerState.jumpMult = unlocked.has('jump') ? 1.55 : 1;
  powerState.gravityMult = unlocked.has('feather') ? 0.45 : 1;
  powerState.damageMult = unlocked.has('strength') ? 2 : 1;
  powerState.damageTakenMult = unlocked.has('shield') ? 0.5 : 1;
  powerState.fastRegen = unlocked.has('regen');
  powerState.reachMult = unlocked.has('reach') ? 2 : 1;
  powerState.carSpeedMult = unlocked.has('turbo') ? 1.5 : 1;
  powerState.carDamageTakenMult = unlocked.has('chassis') ? 0.5 : 1;
  powerState.fullRepair = unlocked.has('mechanic');
  powerState.doubleJump = unlocked.has('doublejump');
  powerState.zombieSpeedMult = unlocked.has('fear') ? 0.55 : 1;
  powerState.critChance = unlocked.has('crit') ? 0.25 : 0;
  powerState.maxHealth = unlocked.has('vitality') ? 16 : 10;
  powerState.lootLuck = unlocked.has('loot');
}
