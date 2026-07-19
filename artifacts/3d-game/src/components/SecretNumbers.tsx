import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { SECRET_SPOTS } from '../game/powers';

function findGroundY(world: WorldState, x: number, z: number): number | null {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  for (let y = 40; y >= 0; y--) {
    const b = world.getBlock(ix, y, iz);
    if (b && b !== 'air' && b !== 'water') return y + 1;
  }
  return null;
}

interface SecretNumbersProps {
  world: WorldState;
  found: ReadonlySet<string>;
}

export function SecretNumbers({ world, found }: SecretNumbersProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>(SECRET_SPOTS.map(() => null));
  const baseYs = useRef<(number | null)[]>(SECRET_SPOTS.map(() => null));
  const resolveTimer = useRef(0);

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // Periodically resolve/refresh ground height (chunks load dynamically)
    resolveTimer.current -= delta;
    if (resolveTimer.current <= 0) {
      resolveTimer.current = 0.5;
      for (let i = 0; i < SECRET_SPOTS.length; i++) {
        const s = SECRET_SPOTS[i];
        const gy = findGroundY(world, s.x, s.z);
        if (gy !== null) baseYs.current[i] = gy;
      }
    }

    for (let i = 0; i < SECRET_SPOTS.length; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const baseY = baseYs.current[i];
      if (baseY === null) {
        g.visible = false;
        continue;
      }
      g.visible = !found.has(SECRET_SPOTS[i].code);
      g.position.set(SECRET_SPOTS[i].x, baseY + 1.6 + Math.sin(t * 1.5 + i * 1.3) * 0.25, SECRET_SPOTS[i].z);
    }
  });

  return (
    <>
      {SECRET_SPOTS.map((s, i) => (
        <group
          key={s.code}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          visible={false}
        >
          <Billboard>
            <Text
              fontSize={1.1}
              color={s.color}
              outlineWidth={0.06}
              outlineColor="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {s.code}
            </Text>
          </Billboard>
          <pointLight color={s.color} intensity={6} distance={7} />
        </group>
      ))}
    </>
  );
}
