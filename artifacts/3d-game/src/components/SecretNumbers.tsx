import { useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { SECRET_SPOTS, powerState } from '../game/powers';

const VIEW_DIST = 38;
const RESOLVE_DIST = 60;

function findGroundY(world: WorldState, x: number, z: number): number | null {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  for (let y = 50; y >= 0; y--) {
    const b = world.getBlock(ix, y, iz);
    if (b && b !== 'air' && b !== 'water') return y + 1;
  }
  return null;
}

interface SecretNumbersProps {
  world: WorldState;
  found: ReadonlySet<string>;
  playerPosRef: MutableRefObject<THREE.Vector3>;
}

export function SecretNumbers({ world, found, playerPosRef }: SecretNumbersProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>(SECRET_SPOTS.map(() => null));
  const baseYs = useRef<(number | null)[]>(SECRET_SPOTS.map(() => null));
  const resolveTimer = useRef(0);

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    const px = playerPosRef.current.x;
    const pz = playerPosRef.current.z;

    // Periodically resolve/refresh ground height for nearby spots (chunks load dynamically)
    resolveTimer.current -= delta;
    const doResolve = resolveTimer.current <= 0;
    if (doResolve) resolveTimer.current = 0.5;

    for (let i = 0; i < SECRET_SPOTS.length; i++) {
      const s = SECRET_SPOTS[i];
      const dx = s.x - px;
      const dz = s.z - pz;
      const distSq = dx * dx + dz * dz;

      if (s.fixedY !== undefined) {
        baseYs.current[i] = s.fixedY;
      } else if (doResolve && distSq < RESOLVE_DIST * RESOLVE_DIST) {
        const gy = findGroundY(world, s.x, s.z);
        if (gy !== null) baseYs.current[i] = gy;
      }

      const g = groupRefs.current[i];
      if (!g) continue;
      const baseY = baseYs.current[i];
      // Indoor numbers stay sneaky: Eagle Eye doesn't reveal them from afar.
      const viewDist = s.fixedY !== undefined ? 14 : VIEW_DIST * powerState.codeVisionMult;
      if (baseY === null || distSq > viewDist * viewDist || found.has(s.code)) {
        g.visible = false;
        continue;
      }
      g.visible = true;
      g.position.set(s.x, baseY + 1.0 + Math.sin(t * 1.5 + i * 1.3) * 0.2, s.z);
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
              fontSize={0.75}
              color={s.color}
              outlineWidth={0.05}
              outlineColor="#000000"
              anchorX="center"
              anchorY="middle"
            >
              {s.code}
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  );
}
