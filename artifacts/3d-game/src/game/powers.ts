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

// Where each secret number hides in the world (y resolved from terrain at runtime)
export const SECRET_SPOTS: Array<{ code: string; x: number; z: number; color: string }> = [
  { code: '247', x: 35, z: -6, color: '#ffd24d' },
  { code: '583', x: -22, z: -14, color: '#5ad1ff' },
  { code: '916', x: 55, z: 14, color: '#ff6b5a' },
  { code: '342', x: -40, z: 44, color: '#b0bec5' },
  { code: '775', x: 8, z: -52, color: '#66ff8c' },
  { code: '168', x: -58, z: -58, color: '#e0aaff' },
];

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
