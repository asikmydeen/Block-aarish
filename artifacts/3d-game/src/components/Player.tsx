import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { WorldState } from '../game/useWorld';
import { BlockType } from '../game/terrain';
import { PLACEABLE_BLOCKS, INTERACTIVE_BLOCKS } from '../game/blockColors';
import { touchState, consumeLookDelta, consumeBreak, consumePlace } from './TouchControls';
import { combatRegistry, getWeapon, type WeaponType } from '../game/combat';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.3;
const MOVE_SPEED = 5.0;
const SPRINT_SPEED = 8.0;
const JUMP_VELOCITY = 8.0;
const GRAVITY = -20.0;
const REACH = 5;

interface PlayerProps {
  world: WorldState;
  onBlockInteract: (type: 'break' | 'place', wx: number, wy: number, wz: number, blockType?: BlockType) => void;
  onInteract?: (wx: number, wy: number, wz: number) => void;
  selectedBlock: BlockType;
  onPositionChange: (pos: THREE.Vector3) => void;
  touchMode: boolean;
  playerPosRef: MutableRefObject<THREE.Vector3>;
  respawnSignal: number;
  weapon: WeaponType;
}

function raycastBlocks(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  getBlock: (x: number, y: number, z: number) => BlockType | undefined,
  maxDist: number
): { hit: boolean; pos?: THREE.Vector3; normal?: THREE.Vector3; blockPos?: THREE.Vector3 } {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);

  const dx = Math.sign(direction.x);
  const dy = Math.sign(direction.y);
  const dz = Math.sign(direction.z);

  const stepX = dx !== 0 ? (dx > 0 ? (x + 1 - origin.x) : (origin.x - x)) / Math.abs(direction.x) : Infinity;
  const stepY = dy !== 0 ? (dy > 0 ? (y + 1 - origin.y) : (origin.y - y)) / Math.abs(direction.y) : Infinity;
  const stepZ = dz !== 0 ? (dz > 0 ? (z + 1 - origin.z) : (origin.z - z)) / Math.abs(direction.z) : Infinity;

  let tMaxX = stepX;
  let tMaxY = stepY;
  let tMaxZ = stepZ;

  const tDeltaX = dx !== 0 ? 1 / Math.abs(direction.x) : Infinity;
  const tDeltaY = dy !== 0 ? 1 / Math.abs(direction.y) : Infinity;
  const tDeltaZ = dz !== 0 ? 1 / Math.abs(direction.z) : Infinity;

  let face = new THREE.Vector3();

  for (let i = 0; i < maxDist * 10; i++) {
    const block = getBlock(x, y, z);
    if (block && block !== 'air' && block !== 'water') {
      return {
        hit: true,
        pos: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
        normal: face.clone(),
        blockPos: new THREE.Vector3(x, y, z),
      };
    }

    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      if (tMaxX > maxDist) break;
      x += dx;
      face.set(-dx, 0, 0);
      tMaxX += tDeltaX;
    } else if (tMaxY < tMaxZ) {
      if (tMaxY > maxDist) break;
      y += dy;
      face.set(0, -dy, 0);
      tMaxY += tDeltaY;
    } else {
      if (tMaxZ > maxDist) break;
      z += dz;
      face.set(0, 0, -dz);
      tMaxZ += tDeltaZ;
    }
  }

  return { hit: false };
}

export function Player({ world, onBlockInteract, onInteract, selectedBlock, onPositionChange, touchMode, playerPosRef, respawnSignal, weapon }: PlayerProps) {
  const { camera, gl } = useThree();
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(8, 18, 8));
  const isGroundedRef = useRef(false);
  const [, getControls] = useKeyboardControls<Controls>();
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isLockedRef = useRef(false);
  const highlightRef = useRef<THREE.Mesh>(null);
  const weaponGroupRef = useRef<THREE.Group>(null);
  const weaponInnerRef = useRef<THREE.Group>(null);
  const swingTimerRef = useRef(0);
  const tracerRef = useRef<THREE.Mesh>(null);
  const tracerTimerRef = useRef(0);
  const weaponRef = useRef(weapon);

  useEffect(() => {
    weaponRef.current = weapon;
  }, [weapon]);

  const showTracer = (from: THREE.Vector3, to: THREE.Vector3) => {
    const tracer = tracerRef.current;
    if (!tracer) return;
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const len = Math.max(0.1, from.distanceTo(to));
    tracer.position.copy(mid);
    tracer.lookAt(to);
    tracer.scale.set(1, 1, len);
    tracer.visible = true;
    tracerTimerRef.current = 0.09;
  };

  const performAttack = (dir: THREE.Vector3): boolean => {
    const w = weaponRef.current;
    const spec = getWeapon(w);
    swingTimerRef.current = 0.25;
    const muzzle = camera.position
      .clone()
      .add(new THREE.Vector3(0.3, -0.25, 0).applyQuaternion(camera.quaternion))
      .addScaledVector(dir, 0.4);
    const hitPoint = combatRegistry.hitZombies?.(camera.position.clone(), dir, spec.range, spec.damage) ?? null;
    if (hitPoint) {
      if (w === 'blaster') showTracer(muzzle, hitPoint);
      return true;
    }
    if (w === 'blaster') {
      const result = raycastBlocks(camera.position, dir, world.getBlock, spec.range);
      if (result.hit && result.blockPos && result.pos) {
        showTracer(muzzle, result.pos);
        onBlockInteract('break', result.blockPos.x, result.blockPos.y, result.blockPos.z);
      } else {
        showTracer(muzzle, camera.position.clone().addScaledVector(dir, spec.range));
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (respawnSignal === 0) return;
    positionRef.current.set(8, 18, 8);
    velocityRef.current.set(0, 0, 0);
    if (playerPosRef?.current) playerPosRef.current.set(8, 18, 8);
  }, [respawnSignal, playerPosRef]);

  useEffect(() => {
    if (touchMode) {
      isLockedRef.current = true;
      return;
    }
    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };
    const handleLockChange = () => {
      isLockedRef.current = !!document.pointerLockElement;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return;
      const sensitivity = 0.002;
      yawRef.current -= e.movementX * sensitivity;
      pitchRef.current -= e.movementY * sensitivity;
      pitchRef.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRef.current));
    };

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl, touchMode]);

  useEffect(() => {
    if (touchMode) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!isLockedRef.current) return;
      if (e.button === 0) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        if (performAttack(dir)) return;
        const result = raycastBlocks(camera.position, dir, world.getBlock, REACH);
        if (result.hit && result.blockPos) {
          const { x, y, z } = result.blockPos;
          onBlockInteract('break', x, y, z);
        }
      }
      if (e.button === 2) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const result = raycastBlocks(camera.position, dir, world.getBlock, REACH);
        if (result.hit && result.blockPos && result.normal) {
          const { x: bx, y: by, z: bz } = result.blockPos;
          const bt = world.getBlock(bx, by, bz);
          if (bt && INTERACTIVE_BLOCKS.has(bt) && onInteract) {
            onInteract(bx, by, bz);
          } else {
            const px = bx + result.normal.x;
            const py = by + result.normal.y;
            const pz = bz + result.normal.z;
            const playerBlockX = Math.floor(positionRef.current.x);
            const playerBlockY = Math.floor(positionRef.current.y);
            const playerBlockZ = Math.floor(positionRef.current.z);
            if (
              !(px === playerBlockX && pz === playerBlockZ && (py === playerBlockY || py === playerBlockY + 1))
            ) {
              onBlockInteract('place', px, py, pz, selectedBlock);
            }
          }
        }
      }
    };

    const handleContextMenu = (e: Event) => e.preventDefault();

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, world.getBlock, onBlockInteract, selectedBlock, touchMode]);

  useFrame((_, delta) => {
    const controls = getControls();
    const dt = Math.min(delta, 0.05);

    if (touchMode) {
      const { dx, dy } = consumeLookDelta();
      const sensitivity = 0.005;
      yawRef.current -= dx * sensitivity;
      pitchRef.current -= dy * sensitivity;
      pitchRef.current = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitchRef.current));
    }

    const yaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yawRef.current, 0));
    const pitch = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitchRef.current, 0, 0));
    camera.quaternion.copy(yaw).multiply(pitch);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yaw);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(yaw);
    forward.y = 0;
    forward.normalize();

    const moveDir = new THREE.Vector3();

    if (touchMode) {
      if (Math.abs(touchState.moveX) > 0.05 || Math.abs(touchState.moveY) > 0.05) {
        moveDir.add(forward.clone().multiplyScalar(touchState.moveY));
        moveDir.add(right.clone().multiplyScalar(touchState.moveX));
      }
    } else {
      if (controls.forward) moveDir.add(forward);
      if (controls.back) moveDir.sub(forward);
      if (controls.right) moveDir.add(right);
      if (controls.left) moveDir.sub(right);
    }

    const sprint = !touchMode && controls.forward && !controls.back;
    const speed = sprint ? SPRINT_SPEED : MOVE_SPEED;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(speed);
    }

    velocityRef.current.x = moveDir.x;
    velocityRef.current.z = moveDir.z;

    const wantJump = touchMode ? touchState.jump : controls.jump;
    if (wantJump && isGroundedRef.current) {
      velocityRef.current.y = JUMP_VELOCITY;
      isGroundedRef.current = false;
    }

    if (touchMode) {
      if (consumeBreak()) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        if (!performAttack(dir)) {
          const result = raycastBlocks(camera.position, dir, world.getBlock, REACH);
          if (result.hit && result.blockPos) {
            onBlockInteract('break', result.blockPos.x, result.blockPos.y, result.blockPos.z);
          }
        }
      }
      if (consumePlace()) {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const result = raycastBlocks(camera.position, dir, world.getBlock, REACH);
        if (result.hit && result.blockPos && result.normal) {
          const { x: bx, y: by, z: bz } = result.blockPos;
          const bt = world.getBlock(bx, by, bz);
          if (bt && INTERACTIVE_BLOCKS.has(bt) && onInteract) {
            onInteract(bx, by, bz);
          } else {
            const px = bx + result.normal.x;
            const py = by + result.normal.y;
            const pz = bz + result.normal.z;
            const playerBlockX = Math.floor(positionRef.current.x);
            const playerBlockY = Math.floor(positionRef.current.y);
            const playerBlockZ = Math.floor(positionRef.current.z);
            if (
              !(px === playerBlockX && pz === playerBlockZ && (py === playerBlockY || py === playerBlockY + 1))
            ) {
              onBlockInteract('place', px, py, pz, selectedBlock);
            }
          }
        }
      }
    }

    velocityRef.current.y += GRAVITY * dt;

    const pos = positionRef.current.clone();

    pos.x += velocityRef.current.x * dt;
    const bx = world.getBlock(Math.floor(pos.x - PLAYER_RADIUS), Math.floor(pos.y), Math.floor(pos.z)) ||
               world.getBlock(Math.floor(pos.x + PLAYER_RADIUS), Math.floor(pos.y), Math.floor(pos.z)) ||
               world.getBlock(Math.floor(pos.x - PLAYER_RADIUS), Math.floor(pos.y + 1), Math.floor(pos.z)) ||
               world.getBlock(Math.floor(pos.x + PLAYER_RADIUS), Math.floor(pos.y + 1), Math.floor(pos.z));
    if (bx && bx !== 'air' && bx !== 'water') {
      pos.x = positionRef.current.x;
      velocityRef.current.x = 0;
    }

    pos.z += velocityRef.current.z * dt;
    const bz = world.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z - PLAYER_RADIUS)) ||
               world.getBlock(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z + PLAYER_RADIUS)) ||
               world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 1), Math.floor(pos.z - PLAYER_RADIUS)) ||
               world.getBlock(Math.floor(pos.x), Math.floor(pos.y + 1), Math.floor(pos.z + PLAYER_RADIUS));
    if (bz && bz !== 'air' && bz !== 'water') {
      pos.z = positionRef.current.z;
      velocityRef.current.z = 0;
    }

    pos.y += velocityRef.current.y * dt;
    const feetY = Math.floor(pos.y - 0.05);
    const headY = Math.floor(pos.y + PLAYER_HEIGHT);
    const groundBlock = world.getBlock(Math.floor(pos.x), feetY, Math.floor(pos.z));
    if (groundBlock && groundBlock !== 'air' && groundBlock !== 'water' && velocityRef.current.y <= 0) {
      pos.y = feetY + 1;
      velocityRef.current.y = 0;
      isGroundedRef.current = true;
    } else {
      isGroundedRef.current = false;
    }

    const ceilBlock = world.getBlock(Math.floor(pos.x), headY, Math.floor(pos.z));
    if (ceilBlock && ceilBlock !== 'air' && ceilBlock !== 'water' && velocityRef.current.y > 0) {
      velocityRef.current.y = 0;
    }

    if (pos.y < -10) {
      pos.set(8, 18, 8);
      velocityRef.current.set(0, 0, 0);
    }

    positionRef.current.copy(pos);
    if (playerPosRef?.current) playerPosRef.current.copy(pos);
    camera.position.set(pos.x, pos.y + PLAYER_HEIGHT - 0.1, pos.z);

    onPositionChange(positionRef.current);

    world.loadChunksAround(pos.x, pos.z);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const result = raycastBlocks(camera.position, dir, world.getBlock, REACH);
    if (highlightRef.current) {
      if (result.hit && result.blockPos) {
        highlightRef.current.visible = true;
        highlightRef.current.position.set(
          result.blockPos.x + 0.5,
          result.blockPos.y + 0.5,
          result.blockPos.z + 0.5
        );
      } else {
        highlightRef.current.visible = false;
      }
    }

    // Weapon viewmodel follows the camera
    if (weaponGroupRef.current) {
      weaponGroupRef.current.position.copy(camera.position);
      weaponGroupRef.current.quaternion.copy(camera.quaternion);
    }
    swingTimerRef.current = Math.max(0, swingTimerRef.current - dt);
    if (weaponInnerRef.current) {
      const st = swingTimerRef.current;
      const swing = st > 0 ? Math.sin(((0.25 - st) / 0.25) * Math.PI) : 0;
      weaponInnerRef.current.rotation.x = -swing * 0.9;
      const bobT = performance.now() * 0.006;
      const moving = Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.z) > 0.5;
      weaponInnerRef.current.position.y = -0.3 + (moving ? Math.sin(bobT) * 0.015 : 0);
    }

    // Tracer fade
    if (tracerRef.current) {
      tracerTimerRef.current = Math.max(0, tracerTimerRef.current - dt);
      tracerRef.current.visible = tracerTimerRef.current > 0;
    }
  });

  return (
    <>
      <mesh ref={highlightRef} visible={false}>
        <boxGeometry args={[1.01, 1.01, 1.01]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Blaster tracer beam */}
      <mesh ref={tracerRef} visible={false}>
        <boxGeometry args={[0.035, 0.035, 1]} />
        <meshBasicMaterial color="#39ffcb" transparent opacity={0.9} />
      </mesh>

      {/* First-person weapon viewmodel */}
      <group ref={weaponGroupRef}>
        <group ref={weaponInnerRef} position={[0.35, -0.3, -0.6]}>
          {/* Sword */}
          <group visible={weapon === 'sword'} rotation={[0.35, 0, -0.35]}>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.07, 0.72, 0.02]} />
              <meshBasicMaterial color="#d7e0ea" />
            </mesh>
            <mesh position={[0, 0.28, 0.011]}>
              <boxGeometry args={[0.02, 0.72, 0.005]} />
              <meshBasicMaterial color="#9fb2c4" />
            </mesh>
            <mesh position={[0, -0.11, 0]}>
              <boxGeometry args={[0.22, 0.05, 0.06]} />
              <meshBasicMaterial color="#8a6a30" />
            </mesh>
            <mesh position={[0, -0.25, 0]}>
              <boxGeometry args={[0.06, 0.24, 0.06]} />
              <meshBasicMaterial color="#5a3d1a" />
            </mesh>
          </group>
          {/* Blaster */}
          <group visible={weapon === 'blaster'} rotation={[0, -0.08, 0]}>
            <mesh position={[0, 0, -0.16]}>
              <boxGeometry args={[0.09, 0.1, 0.48]} />
              <meshBasicMaterial color="#3a3f4a" />
            </mesh>
            <mesh position={[0, 0.07, -0.05]}>
              <boxGeometry args={[0.06, 0.04, 0.16]} />
              <meshBasicMaterial color="#22262e" />
            </mesh>
            <mesh position={[0, -0.13, 0.05]} rotation={[0.35, 0, 0]}>
              <boxGeometry args={[0.07, 0.22, 0.1]} />
              <meshBasicMaterial color="#2a2e36" />
            </mesh>
            <mesh position={[0, 0, -0.42]}>
              <boxGeometry args={[0.055, 0.055, 0.08]} />
              <meshBasicMaterial color="#39ffcb" />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}
