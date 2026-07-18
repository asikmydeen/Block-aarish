import { useRef, useEffect, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { CAR_SPECS, type CarKind, type CarInfo, drivingState, carsRegistry } from '../game/cars';
import { touchState } from './TouchControls';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

interface CarData {
  id: number;
  kind: CarKind;
  color: string;
  pos: THREE.Vector3;
  heading: number;
  speed: number;
  health: number;
  crashFlash: number;
}

const ENTER_RANGE = 3.5;
const REPAIR_RANGE = 4;
const REPAIR_AMOUNT = 4;

const CAR_SPAWNS: Array<{ x: number; z: number; heading: number; kind: CarKind; color: string }> = [
  { x: 12, z: -2, heading: Math.PI, kind: 'sedan', color: '#c0392b' },
  { x: -20, z: -2, heading: 0, kind: 'sports', color: '#2980d9' },
  { x: 35, z: -2, heading: Math.PI, kind: 'truck', color: '#d68a2e' },
  { x: -2, z: 15, heading: Math.PI / 2, kind: 'sedan', color: '#27ae60' },
  { x: -2, z: -30, heading: -Math.PI / 2, kind: 'sports', color: '#f1c40f' },
  { x: -2, z: 45, heading: Math.PI / 2, kind: 'truck', color: '#7f8c8d' },
];

function isSolid(world: WorldState, x: number, y: number, z: number): boolean {
  const b = world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
  return !!b && b !== 'air' && b !== 'water';
}

function findGroundY(world: WorldState, x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  for (let y = 30; y >= 0; y--) {
    const b = world.getBlock(ix, y, iz);
    if (b && b !== 'air' && b !== 'water') return y + 1;
  }
  return 13;
}

function createCars(): CarData[] {
  return CAR_SPAWNS.map((s, i) => ({
    id: i,
    kind: s.kind,
    color: s.color,
    pos: new THREE.Vector3(s.x, 13, s.z),
    heading: s.heading,
    speed: 0,
    health: CAR_SPECS[s.kind].maxHealth,
    crashFlash: 0,
  }));
}

interface CarsProps {
  world: WorldState;
  playerPosRef: MutableRefObject<THREE.Vector3>;
  touchMode: boolean;
  onDrivingChange: (info: CarInfo | null) => void;
  onCrash: (damage: number, broken: boolean) => void;
}

export function Cars({ world, playerPosRef, touchMode, onDrivingChange, onCrash }: CarsProps) {
  const { camera } = useThree();
  const [, getControls] = useKeyboardControls<Controls>();
  const carsRef = useRef<CarData[] | null>(null);
  if (carsRef.current === null) carsRef.current = createCars();
  const cars = carsRef.current;

  const drivingIdRef = useRef<number | null>(null);
  const groupRefs = useRef<(THREE.Group | null)[]>(cars.map(() => null));
  const smokeRefs = useRef<(THREE.Group | null)[]>(cars.map(() => null));
  const wheelRefs = useRef<THREE.Mesh[][]>(cars.map(() => []));

  const emitInfo = (car: CarData | null) => {
    if (!car) {
      onDrivingChange(null);
      return;
    }
    const spec = CAR_SPECS[car.kind];
    onDrivingChange({
      kind: car.kind,
      health: car.health,
      maxHealth: spec.maxHealth,
      speed: Math.abs(car.speed),
      broken: car.health <= 0,
    });
  };

  useEffect(() => {
    carsRegistry.toggleDrive = (playerPos: THREE.Vector3) => {
      if (drivingIdRef.current !== null) {
        const car = cars[drivingIdRef.current];
        car.speed = 0;
        // Find a clear exit spot beside the car
        const side = new THREE.Vector3(-Math.sin(car.heading), 0, Math.cos(car.heading));
        const candidates = [
          car.pos.clone().addScaledVector(side, 2),
          car.pos.clone().addScaledVector(side, -2),
          car.pos.clone().add(new THREE.Vector3(0, 0, 2)),
          car.pos.clone().add(new THREE.Vector3(2, 0, 0)),
        ];
        let exit = candidates[0];
        for (const c of candidates) {
          if (!isSolid(world, c.x, c.y, c.z) && !isSolid(world, c.x, c.y + 1, c.z)) {
            exit = c;
            break;
          }
        }
        exit.y = findGroundY(world, exit.x, exit.z);
        playerPosRef.current.copy(exit);
        drivingIdRef.current = null;
        drivingState.active = false;
        drivingState.justExited = true;
        emitInfo(null);
        return 'exited';
      }
      let bestId: number | null = null;
      let bestDist = ENTER_RANGE;
      for (const car of cars) {
        const d = Math.hypot(playerPos.x - car.pos.x, playerPos.z - car.pos.z);
        if (d < bestDist && Math.abs(playerPos.y - car.pos.y) < 3) {
          bestDist = d;
          bestId = car.id;
        }
      }
      if (bestId === null) return null;
      drivingIdRef.current = bestId;
      drivingState.active = true;
      emitInfo(cars[bestId]);
      return 'entered';
    };

    carsRegistry.repairNear = (playerPos: THREE.Vector3) => {
      let best: CarData | null = null;
      let bestDist = REPAIR_RANGE;
      for (const car of cars) {
        const spec = CAR_SPECS[car.kind];
        if (car.health >= spec.maxHealth) continue;
        const d = Math.hypot(playerPos.x - car.pos.x, playerPos.z - car.pos.z);
        if (d < bestDist) {
          bestDist = d;
          best = car;
        }
      }
      if (!best) return null;
      const spec = CAR_SPECS[best.kind];
      const wasBroken = best.health <= 0;
      best.health = Math.min(spec.maxHealth, best.health + REPAIR_AMOUNT);
      if (drivingIdRef.current === best.id) emitInfo(best);
      return { kind: best.kind, health: best.health, maxHealth: spec.maxHealth, wasBroken };
    };

    return () => {
      carsRegistry.toggleDrive = null;
      carsRegistry.repairNear = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cars, world, playerPosRef]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const drivingId = drivingIdRef.current;

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const spec = CAR_SPECS[car.kind];
      const isDriven = drivingId === car.id;
      car.crashFlash = Math.max(0, car.crashFlash - dt);

      if (isDriven) {
        const controls = getControls();
        let throttle = 0;
        let steer = 0;
        if (touchMode) {
          throttle = Math.abs(touchState.moveY) > 0.1 ? touchState.moveY : 0;
          steer = Math.abs(touchState.moveX) > 0.1 ? -touchState.moveX : 0;
        } else {
          if (controls.forward) throttle = 1;
          else if (controls.back) throttle = -0.6;
          if (controls.left) steer = 1;
          else if (controls.right) steer = -1;
        }
        const broken = car.health <= 0;
        if (broken) throttle = 0;

        if (throttle !== 0) {
          car.speed += throttle * spec.accel * dt;
        } else {
          car.speed *= Math.max(0, 1 - 2.0 * dt);
          if (Math.abs(car.speed) < 0.05) car.speed = 0;
        }
        car.speed = Math.max(-spec.maxSpeed * 0.4, Math.min(spec.maxSpeed, car.speed));

        if (steer !== 0 && Math.abs(car.speed) > 0.4) {
          const factor = Math.min(1, Math.abs(car.speed) / 5);
          car.heading += steer * spec.turnRate * factor * dt * Math.sign(car.speed);
        }

        if (car.speed !== 0) {
          const dirX = Math.cos(car.heading);
          const dirZ = Math.sin(car.heading);
          const nx = car.pos.x + dirX * car.speed * dt;
          const nz = car.pos.z + dirZ * car.speed * dt;
          // Probe ahead of the bumper in the direction of travel
          const probeDist = 1.5 * Math.sign(car.speed);
          const px = nx + dirX * probeDist;
          const pz = nz + dirZ * probeDist;
          const blocked =
            isSolid(world, px, car.pos.y + 0.3, pz) ||
            isSolid(world, px, car.pos.y + 1.2, pz);
          if (blocked) {
            const impact = Math.abs(car.speed);
            if (impact > 4) {
              const damage = Math.max(1, Math.round((impact - 3) / 2));
              car.health = Math.max(0, car.health - damage);
              car.crashFlash = 0.3;
              onCrash(damage, car.health <= 0);
              emitInfo(car);
            }
            car.speed = -car.speed * 0.25;
          } else {
            // Don't drive off cliffs steeper than 1 block or into water
            const groundY = findGroundY(world, nx, nz);
            if (Math.abs(groundY - car.pos.y) <= 1.2) {
              car.pos.x = nx;
              car.pos.z = nz;
              car.pos.y += (groundY - car.pos.y) * Math.min(1, dt * 10);
            } else {
              car.speed *= 0.5;
            }
          }
        }

        playerPosRef.current.set(car.pos.x, car.pos.y, car.pos.z);

        // Chase camera
        const camDist = 7;
        const cx = car.pos.x - Math.cos(car.heading) * camDist;
        const cz = car.pos.z - Math.sin(car.heading) * camDist;
        const cy = car.pos.y + 4;
        camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 6));
        camera.lookAt(car.pos.x, car.pos.y + 1.2, car.pos.z);
      }

      const g = groupRefs.current[i];
      if (g) {
        g.position.copy(car.pos);
        g.rotation.y = -car.heading + Math.PI / 2;
        // Crash shake
        if (car.crashFlash > 0) {
          g.position.y += Math.sin(car.crashFlash * 60) * 0.05;
        }
      }

      // Wheel spin
      const wheels = wheelRefs.current[i];
      for (const w of wheels) {
        if (w) w.rotation.x += car.speed * dt * 2.5;
      }

      // Smoke when broken or badly damaged
      const smoke = smokeRefs.current[i];
      if (smoke) {
        const damagedRatio = car.health / spec.maxHealth;
        const showSmoke = damagedRatio <= 0.35;
        smoke.visible = showSmoke;
        if (showSmoke) {
          const t = performance.now() * 0.002 + i;
          smoke.children.forEach((puff, j) => {
            const cycle = (t * (0.6 + j * 0.2)) % 1;
            puff.position.y = 1.2 + cycle * 1.6;
            puff.scale.setScalar(0.5 + cycle * 0.8);
            const mat = (puff as THREE.Mesh).material as THREE.MeshBasicMaterial;
            mat.opacity = 0.5 * (1 - cycle);
          });
        }
      }
    }
  });

  return (
    <>
      {cars.map((car, i) => {
        const isTruck = car.kind === 'truck';
        const isSports = car.kind === 'sports';
        const bodyLen = isTruck ? 3.4 : isSports ? 2.8 : 3.0;
        const bodyH = isTruck ? 1.0 : isSports ? 0.55 : 0.7;
        const bodyW = isTruck ? 1.5 : 1.3;
        return (
          <group
            key={car.id}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
          >
            {/* Body */}
            <mesh position={[0, 0.55 + bodyH / 2, 0]} castShadow>
              <boxGeometry args={[bodyW, bodyH, bodyLen]} />
              <meshLambertMaterial color={car.color} />
            </mesh>
            {/* Cabin */}
            {isTruck ? (
              <mesh position={[0, 1.55 + 0.35, bodyLen / 2 - 0.7]} castShadow>
                <boxGeometry args={[bodyW - 0.1, 0.7, 1.2]} />
                <meshLambertMaterial color="#aeb6bf" />
              </mesh>
            ) : (
              <mesh position={[0, 0.55 + bodyH + 0.3, isSports ? -0.3 : 0]} castShadow>
                <boxGeometry args={[bodyW - 0.2, 0.6, bodyLen * 0.5]} />
                <meshLambertMaterial color="#aed6f1" />
              </mesh>
            )}
            {/* Truck cargo bed */}
            {isTruck && (
              <mesh position={[0, 1.55 + 0.2, -bodyLen / 2 + 1.0]} castShadow>
                <boxGeometry args={[bodyW - 0.1, 0.4, 1.8]} />
                <meshLambertMaterial color="#6e6e6e" />
              </mesh>
            )}
            {/* Headlights */}
            <mesh position={[-0.4, 0.75, bodyLen / 2 + 0.01]}>
              <boxGeometry args={[0.2, 0.15, 0.05]} />
              <meshBasicMaterial color="#fff8c0" />
            </mesh>
            <mesh position={[0.4, 0.75, bodyLen / 2 + 0.01]}>
              <boxGeometry args={[0.2, 0.15, 0.05]} />
              <meshBasicMaterial color="#fff8c0" />
            </mesh>
            {/* Tail lights */}
            <mesh position={[-0.4, 0.75, -bodyLen / 2 - 0.01]}>
              <boxGeometry args={[0.18, 0.12, 0.05]} />
              <meshBasicMaterial color="#ff3b30" />
            </mesh>
            <mesh position={[0.4, 0.75, -bodyLen / 2 - 0.01]}>
              <boxGeometry args={[0.18, 0.12, 0.05]} />
              <meshBasicMaterial color="#ff3b30" />
            </mesh>
            {/* Wheels */}
            {[
              [-bodyW / 2 - 0.05, bodyLen / 2 - 0.6],
              [bodyW / 2 + 0.05, bodyLen / 2 - 0.6],
              [-bodyW / 2 - 0.05, -bodyLen / 2 + 0.6],
              [bodyW / 2 + 0.05, -bodyLen / 2 + 0.6],
            ].map(([wx, wz], wi) => (
              <mesh
                key={wi}
                position={[wx, 0.35, wz]}
                rotation={[0, 0, Math.PI / 2]}
                ref={(el) => {
                  if (el) wheelRefs.current[i][wi] = el;
                }}
                castShadow
              >
                <cylinderGeometry args={[0.35, 0.35, 0.25, 10]} />
                <meshLambertMaterial color="#1c1c1c" />
              </mesh>
            ))}
            {/* Smoke puffs (broken) */}
            <group
              ref={(el) => {
                smokeRefs.current[i] = el;
              }}
              position={[0, 0, bodyLen / 2 - 0.5]}
              visible={false}
            >
              {[0, 1, 2].map(j => (
                <mesh key={j} position={[(j - 1) * 0.15, 1.2, 0]}>
                  <boxGeometry args={[0.4, 0.4, 0.4]} />
                  <meshBasicMaterial color="#444" transparent opacity={0.5} depthWrite={false} />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}
    </>
  );
}
