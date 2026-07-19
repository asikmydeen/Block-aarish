import * as THREE from 'three';

export type WeaponType = 'hand' | 'sword' | 'blaster';

export interface WeaponSpec {
  id: WeaponType;
  name: string;
  damage: number;
  range: number;
}

export const WEAPONS: WeaponSpec[] = [
  { id: 'hand', name: 'Hand', damage: 1, range: 3 },
  { id: 'sword', name: 'Sword', damage: 3, range: 3.5 },
  { id: 'blaster', name: 'Blaster', damage: 2, range: 50 },
];

export function getWeapon(id: WeaponType): WeaponSpec {
  return WEAPONS.find(w => w.id === id) ?? WEAPONS[0];
}

// The Zombies component registers a hit-test/damage function here so the
// Player can attack without prop-drilling through the scene graph.
export type ZombieHitFn = (
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  maxDist: number,
  damage: number
) => THREE.Vector3 | null;

export const combatRegistry: {
  hitZombies: ZombieHitFn | null;
  // Game registers this to react to zombie kills (vampire heal, note drops).
  onZombieKilled: ((pos: THREE.Vector3) => void) | null;
} = {
  hitZombies: null,
  onZombieKilled: null,
};
