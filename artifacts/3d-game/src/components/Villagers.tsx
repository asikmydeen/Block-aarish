import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { HOUSES } from '../game/houses';

interface VillagerData {
  id: number;
  pos: THREE.Vector3;
  dir: number;
  walkTimer: number;
  breakTimer: number;
  walking: boolean;
  shirtColor: string;
  pantsColor: string;
  speed: number;
  homeX: number;
  homeZ: number;
}

const FLOOR_TOP_Y = 12;

const SHIRT_COLORS = ['#c0392b', '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#16a085', '#e67e22'];
const PANTS_COLORS = ['#34495e', '#2c3e50', '#7f5539', '#5d4037', '#3e2723'];
const SKIN_COLORS = ['#f5cba7', '#dda47b', '#a47148', '#8d5524', '#f8d8b3'];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

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

function createVillagers(): VillagerData[] {
  const list: VillagerData[] = [];
  let id = 0;
  for (const h of HOUSES) {
    const count = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      list.push({
        id: id++,
        pos: new THREE.Vector3(
          h.cx + (Math.random() - 0.5) * 4,
          FLOOR_TOP_Y + 1,
          h.cz + (Math.random() - 0.5) * 4 + 4,
        ),
        dir: Math.random() * Math.PI * 2,
        walkTimer: 1 + Math.random() * 2,
        breakTimer: 4 + Math.random() * 6,
        walking: true,
        shirtColor: pick(SHIRT_COLORS, id * 3),
        pantsColor: pick(PANTS_COLORS, id * 5),
        speed: 1.0 + Math.random() * 0.6,
        homeX: h.cx,
        homeZ: h.cz,
      });
    }
  }
  return list;
}

interface VillagersProps {
  world: WorldState;
}

export function Villagers({ world }: VillagersProps) {
  const dataRef = useRef<VillagerData[] | null>(null);
  if (dataRef.current === null) {
    dataRef.current = createVillagers();
  }
  const villagers = dataRef.current;

  const groupRefs = useRef<(THREE.Group | null)[]>(villagers.map(() => null));
  const limbRefs = useRef<{ leftArm: THREE.Mesh | null; rightArm: THREE.Mesh | null; leftLeg: THREE.Mesh | null; rightLeg: THREE.Mesh | null }[]>(
    villagers.map(() => ({ leftArm: null, rightArm: null, leftLeg: null, rightLeg: null }))
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = performance.now() * 0.006;

    for (let i = 0; i < villagers.length; i++) {
      const v = villagers[i];

      v.walkTimer -= dt;
      if (v.walkTimer <= 0) {
        const distFromHome = Math.hypot(v.pos.x - v.homeX, v.pos.z - v.homeZ);
        if (distFromHome > 14) {
          v.dir = Math.atan2(v.homeZ - v.pos.z, v.homeX - v.pos.x);
        } else {
          v.dir += (Math.random() - 0.5) * Math.PI;
        }
        v.walkTimer = 1.5 + Math.random() * 3;
        v.walking = Math.random() > 0.2;
      }

      if (v.walking) {
        const nx = v.pos.x + Math.cos(v.dir) * v.speed * dt;
        const nz = v.pos.z + Math.sin(v.dir) * v.speed * dt;
        const blocked =
          isSolid(world, nx, v.pos.y, nz) || isSolid(world, nx, v.pos.y + 0.5, nz);
        if (!blocked) {
          v.pos.x = nx;
          v.pos.z = nz;
        } else {
          v.dir += Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        }
      }

      v.pos.y = findGroundY(world, v.pos.x, v.pos.z);

      v.breakTimer -= dt;
      if (v.breakTimer <= 0) {
        v.breakTimer = 5 + Math.random() * 8;
        const reachX = v.pos.x + Math.cos(v.dir) * 1.1;
        const reachZ = v.pos.z + Math.sin(v.dir) * 1.1;
        const candidates: Array<[number, number, number]> = [
          [Math.floor(reachX), Math.floor(v.pos.y), Math.floor(reachZ)],
          [Math.floor(reachX), Math.floor(v.pos.y) + 1, Math.floor(reachZ)],
          [Math.floor(v.pos.x), Math.floor(v.pos.y) - 1, Math.floor(v.pos.z)],
        ];
        const PROTECTED: Set<string> = new Set(['bedrock', 'glass', 'metal', 'concrete', 'neon', 'wood']);
        for (const [bx, by, bz] of candidates) {
          const block = world.getBlock(bx, by, bz);
          if (block && block !== 'air' && block !== 'water' && !PROTECTED.has(block)) {
            world.setBlock(bx, by, bz, 'air');
            break;
          }
        }
      }

      const g = groupRefs.current[i];
      if (g) {
        g.position.set(v.pos.x, v.pos.y, v.pos.z);
        g.rotation.y = -v.dir + Math.PI / 2;
      }

      const limbs = limbRefs.current[i];
      const swing = v.walking ? Math.sin(t * 4 + v.id) * 0.6 : 0;
      if (limbs.leftArm) limbs.leftArm.rotation.x = swing;
      if (limbs.rightArm) limbs.rightArm.rotation.x = -swing;
      if (limbs.leftLeg) limbs.leftLeg.rotation.x = -swing;
      if (limbs.rightLeg) limbs.rightLeg.rotation.x = swing;
    }
  });

  return (
    <>
      {villagers.map((v, i) => {
        const skin = pick(SKIN_COLORS, v.id * 7);
        return (
          <group
            key={v.id}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
          >
            {/* Legs */}
            <mesh
              position={[-0.13, 0.4, 0]}
              ref={(el) => {
                limbRefs.current[i].leftLeg = el;
              }}
              castShadow
            >
              <boxGeometry args={[0.2, 0.8, 0.2]} />
              <meshLambertMaterial color={v.pantsColor} />
            </mesh>
            <mesh
              position={[0.13, 0.4, 0]}
              ref={(el) => {
                limbRefs.current[i].rightLeg = el;
              }}
              castShadow
            >
              <boxGeometry args={[0.2, 0.8, 0.2]} />
              <meshLambertMaterial color={v.pantsColor} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[0.5, 0.7, 0.3]} />
              <meshLambertMaterial color={v.shirtColor} />
            </mesh>
            {/* Arms */}
            <mesh
              position={[-0.35, 1.15, 0]}
              ref={(el) => {
                limbRefs.current[i].leftArm = el;
              }}
              castShadow
            >
              <boxGeometry args={[0.18, 0.65, 0.2]} />
              <meshLambertMaterial color={v.shirtColor} />
            </mesh>
            <mesh
              position={[0.35, 1.15, 0]}
              ref={(el) => {
                limbRefs.current[i].rightArm = el;
              }}
              castShadow
            >
              <boxGeometry args={[0.18, 0.65, 0.2]} />
              <meshLambertMaterial color={v.shirtColor} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow>
              <boxGeometry args={[0.42, 0.42, 0.42]} />
              <meshLambertMaterial color={skin} />
            </mesh>
            {/* Eyes */}
            <mesh position={[-0.1, 1.74, 0.22]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshBasicMaterial color="#111" />
            </mesh>
            <mesh position={[0.1, 1.74, 0.22]}>
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          </group>
        );
      })}
    </>
  );
}
