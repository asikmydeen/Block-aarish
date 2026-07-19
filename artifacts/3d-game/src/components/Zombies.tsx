import { useRef, useEffect, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { powerState } from '../game/powers';
import { combatRegistry } from '../game/combat';

interface ZombieData {
  id: number;
  pos: THREE.Vector3;
  dir: number;
  walkTimer: number;
  attackCooldown: number;
  walking: boolean;
  speed: number;
  attacking: boolean;
  health: number;
  dead: boolean;
  respawnTimer: number;
  hitTimer: number;
}

const FLOOR_TOP_Y = 12;
const SPAWN_POINTS: Array<[number, number]> = [
  [40, 40],
  [-40, 30],
  [30, -40],
  [-35, -35],
  [50, 0],
  [-50, 10],
  [0, 50],
  [10, -55],
];

const DETECTION_RANGE = 22;
const ATTACK_RANGE = 1.6;
const ATTACK_COOLDOWN = 1.0;
const ATTACK_DAMAGE = 1;

function findGroundY(world: WorldState, x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  for (let y = 30; y >= 0; y--) {
    const b = world.getBlock(ix, y, iz);
    if (b && b !== 'air' && b !== 'water') return y + 1;
  }
  return FLOOR_TOP_Y + 1;
}

function isSolid(world: WorldState, x: number, y: number, z: number): boolean {
  const b = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
  return !!b && b !== 'air' && b !== 'water';
}

function createZombies(): ZombieData[] {
  return SPAWN_POINTS.map((p, i) => ({
    id: i,
    pos: new THREE.Vector3(p[0], FLOOR_TOP_Y + 1, p[1]),
    dir: Math.random() * Math.PI * 2,
    walkTimer: 1 + Math.random() * 2,
    attackCooldown: 0,
    walking: true,
    speed: 1.4 + Math.random() * 0.8,
    attacking: false,
    health: 5,
    dead: false,
    respawnTimer: 0,
    hitTimer: 0,
  }));
}

interface ZombiesProps {
  world: WorldState;
  playerPosRef: MutableRefObject<THREE.Vector3>;
  onDamagePlayer: (amount: number) => void;
  alive: boolean;
}

export function Zombies({ world, playerPosRef, onDamagePlayer, alive }: ZombiesProps) {
  const dataRef = useRef<ZombieData[] | null>(null);
  if (dataRef.current === null) {
    dataRef.current = createZombies();
  }
  const zombies = dataRef.current;

  const groupRefs = useRef<(THREE.Group | null)[]>(zombies.map(() => null));
  const limbRefs = useRef<{ leftArm: THREE.Mesh | null; rightArm: THREE.Mesh | null; leftLeg: THREE.Mesh | null; rightLeg: THREE.Mesh | null }[]>(
    zombies.map(() => ({ leftArm: null, rightArm: null, leftLeg: null, rightLeg: null }))
  );

  useEffect(() => {
    const firstBlockT = (origin: THREE.Vector3, dir: THREE.Vector3, maxDist: number): number => {
      const step = 0.2;
      const p = new THREE.Vector3();
      for (let t = step; t <= maxDist; t += step) {
        p.copy(origin).addScaledVector(dir, t);
        if (isSolid(world, p.x, p.y, p.z)) return t;
      }
      return Infinity;
    };

    combatRegistry.hitZombies = (origin, dir, maxDist, damage) => {
      let best: { z: ZombieData; t: number } | null = null;
      for (const z of zombies) {
        if (z.dead) continue;
        const center = new THREE.Vector3(z.pos.x, z.pos.y + 1.0, z.pos.z);
        const toC = center.clone().sub(origin);
        const t = toC.dot(dir);
        if (t < 0 || t > maxDist) continue;
        const closest = origin.clone().addScaledVector(dir, t);
        if (closest.distanceToSquared(center) < 0.85 * 0.85) {
          if (!best || t < best.t) best = { z, t };
        }
      }
      if (!best) return null;
      // Occlusion: a solid block between the player and the zombie stops the attack
      if (firstBlockT(origin, dir, best.t) < best.t) return null;
      const z = best.z;
      z.health -= damage;
      z.hitTimer = 0.2;
      const kx = z.pos.x + dir.x * 0.6;
      const kz = z.pos.z + dir.z * 0.6;
      if (!isSolid(world, kx, z.pos.y, kz) && !isSolid(world, kx, z.pos.y + 1, kz)) {
        z.pos.x = kx;
        z.pos.z = kz;
      }
      if (z.health <= 0) {
        z.dead = true;
        z.respawnTimer = 8;
        combatRegistry.onZombieKilled?.(new THREE.Vector3(z.pos.x, z.pos.y, z.pos.z));
      }
      return new THREE.Vector3(z.pos.x, z.pos.y + 1.0, z.pos.z);
    };
    return () => {
      combatRegistry.hitZombies = null;
    };
  }, [zombies, world]);

  useFrame((_, delta) => {
    if (!playerPosRef?.current) return;
    const dt = Math.min(delta, 0.1);
    const t = performance.now() * 0.005;
    const player = playerPosRef.current;

    for (let i = 0; i < zombies.length; i++) {
      const z = zombies[i];
      const g0 = groupRefs.current[i];

      if (z.dead) {
        z.respawnTimer -= dt;
        if (g0) {
          // fall over then hide
          if (z.respawnTimer > 7) {
            g0.visible = true;
            g0.rotation.z = Math.min(Math.PI / 2, (8 - z.respawnTimer) * 5);
          } else {
            g0.visible = false;
          }
        }
        if (z.respawnTimer <= 0) {
          const sp = SPAWN_POINTS[z.id % SPAWN_POINTS.length];
          z.pos.set(sp[0], FLOOR_TOP_Y + 1, sp[1]);
          z.health = 5;
          z.dead = false;
          z.hitTimer = 0;
          z.attackCooldown = 1;
        }
        continue;
      }
      if (g0 && !g0.visible) g0.visible = true;
      z.hitTimer = Math.max(0, z.hitTimer - dt);

      const dx = player.x - z.pos.x;
      const dz = player.z - z.pos.z;
      const distToPlayer = Math.hypot(dx, dz);

      const seesPlayer = alive && distToPlayer < DETECTION_RANGE * powerState.zombieDetectMult;

      if (seesPlayer) {
        z.dir = Math.atan2(dz, dx);
        z.walking = distToPlayer > ATTACK_RANGE;
      } else {
        z.walkTimer -= dt;
        if (z.walkTimer <= 0) {
          z.dir += (Math.random() - 0.5) * Math.PI;
          z.walkTimer = 2 + Math.random() * 3;
          z.walking = Math.random() > 0.3;
        }
      }

      if (z.walking) {
        const speed = (seesPlayer ? z.speed * 1.4 : z.speed * 0.8) * powerState.zombieSpeedMult;
        const nx = z.pos.x + Math.cos(z.dir) * speed * dt;
        const nz = z.pos.z + Math.sin(z.dir) * speed * dt;
        const blocked =
          isSolid(world, nx, z.pos.y, nz) || isSolid(world, nx, z.pos.y + 0.5, nz);
        if (!blocked) {
          z.pos.x = nx;
          z.pos.z = nz;
        } else if (!seesPlayer) {
          z.dir += Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        } else {
          z.dir += (Math.random() - 0.5) * 0.6;
        }
      }

      z.pos.y = findGroundY(world, z.pos.x, z.pos.z);

      z.attackCooldown -= dt;
      const verticalDelta = Math.abs(player.y - z.pos.y);
      z.attacking = false;
      if (
        seesPlayer &&
        distToPlayer < ATTACK_RANGE &&
        verticalDelta < 2.5 &&
        z.attackCooldown <= 0
      ) {
        onDamagePlayer(ATTACK_DAMAGE);
        z.attackCooldown = ATTACK_COOLDOWN;
        z.attacking = true;
      }

      const g = groupRefs.current[i];
      if (g) {
        g.position.set(z.pos.x, z.pos.y, z.pos.z);
        g.rotation.y = -z.dir + Math.PI / 2;
        g.rotation.z = z.hitTimer > 0 ? 0.25 : 0;
      }

      const limbs = limbRefs.current[i];
      const swing = z.walking ? Math.sin(t * 5 + z.id) * 0.7 : 0;
      const armForward = -Math.PI / 2.2;
      const attackPunch = z.attackCooldown > ATTACK_COOLDOWN - 0.25 ? 0.4 : 0;
      if (limbs.leftArm) limbs.leftArm.rotation.x = armForward + swing * 0.3 - attackPunch;
      if (limbs.rightArm) limbs.rightArm.rotation.x = armForward - swing * 0.3 - attackPunch;
      if (limbs.leftLeg) limbs.leftLeg.rotation.x = -swing;
      if (limbs.rightLeg) limbs.rightLeg.rotation.x = swing;
    }
  });

  const skin = '#6e8a3a';
  const skinDark = '#516b25';
  const shirt = '#4a4226';
  const pants = '#2c2418';

  return (
    <>
      {zombies.map((z, i) => (
        <group
          key={z.id}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
        >
          <mesh
            position={[-0.13, 0.4, 0]}
            ref={(el) => {
              limbRefs.current[i].leftLeg = el;
            }}
            castShadow
          >
            <boxGeometry args={[0.22, 0.8, 0.22]} />
            <meshLambertMaterial color={pants} />
          </mesh>
          <mesh
            position={[0.13, 0.4, 0]}
            ref={(el) => {
              limbRefs.current[i].rightLeg = el;
            }}
            castShadow
          >
            <boxGeometry args={[0.22, 0.8, 0.22]} />
            <meshLambertMaterial color={pants} />
          </mesh>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.55, 0.75, 0.32]} />
            <meshLambertMaterial color={shirt} />
          </mesh>
          <mesh
            position={[-0.38, 1.15, 0]}
            ref={(el) => {
              limbRefs.current[i].leftArm = el;
            }}
            castShadow
          >
            <boxGeometry args={[0.2, 0.7, 0.2]} />
            <meshLambertMaterial color={skinDark} />
          </mesh>
          <mesh
            position={[0.38, 1.15, 0]}
            ref={(el) => {
              limbRefs.current[i].rightArm = el;
            }}
            castShadow
          >
            <boxGeometry args={[0.2, 0.7, 0.2]} />
            <meshLambertMaterial color={skinDark} />
          </mesh>
          <mesh position={[0, 1.72, 0]} castShadow>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshLambertMaterial color={skin} />
          </mesh>
          <mesh position={[-0.11, 1.76, 0.235]}>
            <boxGeometry args={[0.08, 0.07, 0.02]} />
            <meshBasicMaterial color="#ff2a1a" />
          </mesh>
          <mesh position={[0.11, 1.76, 0.235]}>
            <boxGeometry args={[0.08, 0.07, 0.02]} />
            <meshBasicMaterial color="#ff2a1a" />
          </mesh>
          <mesh position={[0, 1.6, 0.235]}>
            <boxGeometry args={[0.18, 0.04, 0.02]} />
            <meshBasicMaterial color="#1a0a05" />
          </mesh>
        </group>
      ))}
    </>
  );
}
