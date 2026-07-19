import { useState, useCallback, useEffect, useRef, Suspense, type MutableRefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useWorld } from '../game/useWorld';
import { World } from '../components/World';
import { Player } from '../components/Player';
import { GameUI } from '../components/GameUI';
import { TouchControls, isTouchDevice } from '../components/TouchControls';
import { Villagers } from '../components/Villagers';
import { Zombies } from '../components/Zombies';
import { BlockType } from '../game/terrain';
import { PLACEABLE_BLOCKS } from '../game/blockColors';
import { generateHouseUpdates } from '../game/houses';
import { ChestUI, Toast, LootItem, generateLoot } from '../components/InteractionUI';
import { WEAPONS, type WeaponType } from '../game/combat';
import { Cars } from '../components/Cars';
import { generateRoadUpdates } from '../game/roads';
import { CAR_SPECS, type CarInfo, type CarKind, carsRegistry, drivingState } from '../game/cars';
import { CODE_TO_POWER, type PowerId, applyPowers, powerState } from '../game/powers';
import { SecretNumbers } from '../components/SecretNumbers';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.jump, keys: ['Space'] },
];

function GameScene({
  world,
  selectedBlock,
  onBlockInteract,
  onInteract,
  onPositionChange,
  touchMode,
  playerPosRef,
  respawnSignal,
  onDamagePlayer,
  alive,
  weapon,
  onDrivingChange,
  onCrash,
  onNearCar,
}: {
  world: ReturnType<typeof useWorld>;
  selectedBlock: BlockType;
  onBlockInteract: (type: 'break' | 'place', wx: number, wy: number, wz: number, blockType?: BlockType) => void;
  onInteract: (wx: number, wy: number, wz: number) => void;
  onPositionChange: (pos: THREE.Vector3) => void;
  touchMode: boolean;
  playerPosRef: MutableRefObject<THREE.Vector3>;
  respawnSignal: number;
  onDamagePlayer: (amount: number) => void;
  alive: boolean;
  weapon: WeaponType;
  onDrivingChange: (info: CarInfo | null) => void;
  onCrash: (damage: number, broken: boolean) => void;
  onNearCar: (kind: CarKind | null) => void;
}) {
  return (
    <>
      <color attach="background" args={['#87CEEB']} />
      <fog attach="fog" args={['#c8e8ff', 60, 180]} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[100, 150, 100]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <hemisphereLight color="#87CEEB" groundColor="#4a6741" intensity={0.3} />

      <Sky sunPosition={[100, 50, 100]} />
      <Stars radius={300} depth={50} count={3000} factor={4} />

      <World world={world} />
      <Villagers world={world} />
      <Cars
        world={world}
        playerPosRef={playerPosRef}
        touchMode={touchMode}
        onDrivingChange={onDrivingChange}
        onCrash={onCrash}
        onNearCar={onNearCar}
      />
      <Zombies
        world={world}
        playerPosRef={playerPosRef}
        onDamagePlayer={onDamagePlayer}
        alive={alive}
      />
      <Player
        world={world}
        onBlockInteract={onBlockInteract}
        onInteract={onInteract}
        selectedBlock={selectedBlock}
        onPositionChange={onPositionChange}
        touchMode={touchMode}
        playerPosRef={playerPosRef}
        respawnSignal={respawnSignal}
        weapon={weapon}
      />
    </>
  );
}

export default function Game() {
  const world = useWorld();
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('dirt');
  const [weapon, setWeapon] = useState<WeaponType>('hand');
  const [playerPos, setPlayerPos] = useState(() => new THREE.Vector3(8, 18, 8));
  const [isLocked, setIsLocked] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [touchMode, setTouchMode] = useState(() => isTouchDevice());
  const [started, setStarted] = useState(false);
  const [health, setHealth] = useState(10);
  const [respawnSignal, setRespawnSignal] = useState(0);
  const [showDeath, setShowDeath] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [chestLoot, setChestLoot] = useState<LootItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [nearCar, setNearCar] = useState<CarKind | null>(null);
  const [unlockedPowers, setUnlockedPowers] = useState<Set<PowerId>>(new Set());
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const codeOpenRef = useRef(false);
  const chestOpenRef = useRef(false);
  const openCodeBoxRef = useRef<(() => void) | null>(null);
  const [enteredCodes, setEnteredCodes] = useState<Set<string>>(new Set());
  const playerPosRef = useRef(new THREE.Vector3(8, 18, 8));
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthRef = useRef(10);
  const aliveRef = useRef(true);

  useEffect(() => {
    world.setBlocks([...generateHouseUpdates(), ...generateRoadUpdates()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    healthRef.current = health;
  }, [health]);

  useEffect(() => {
    aliveRef.current = !showDeath;
  }, [showDeath]);

  const handleDamagePlayer = useCallback((amount: number) => {
    if (!aliveRef.current || healthRef.current <= 0) return;
    const reduced = Math.max(1, Math.ceil(amount * powerState.damageTakenMult));
    const next = Math.max(0, healthRef.current - reduced);
    if (next === healthRef.current) return;
    healthRef.current = next;
    setHealth(next);
    setIsFlashing(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setIsFlashing(false), 250);
    if (next <= 0) {
      aliveRef.current = false;
      setShowDeath(true);
      // Force out of any car so respawn isn't overridden by driving sync
      if (drivingState.active) {
        carsRegistry.toggleDrive?.(playerPosRef.current);
      }
    }
  }, []);

  const handleRespawnGuard = useCallback(() => {
    if (drivingState.active) {
      carsRegistry.toggleDrive?.(playerPosRef.current);
    }
  }, []);

  const handleRespawn = useCallback(() => {
    handleRespawnGuard();
    playerPosRef.current.set(8, 18, 8);
    drivingState.justExited = true;
    healthRef.current = powerState.maxHealth;
    aliveRef.current = true;
    setHealth(powerState.maxHealth);
    setShowDeath(false);
    setRespawnSignal(s => s + 1);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const handleInteract = useCallback((wx: number, wy: number, wz: number) => {
    const bt = world.getBlock(wx, wy, wz);
    if (bt === 'door') {
      world.setBlock(wx, wy, wz, 'air');
      const above = world.getBlock(wx, wy + 1, wz);
      const below = world.getBlock(wx, wy - 1, wz);
      if (above === 'door') world.setBlock(wx, wy + 1, wz, 'air');
      if (below === 'door') world.setBlock(wx, wy - 1, wz, 'air');
    } else if (bt === 'chest') {
      setChestLoot(generateLoot(powerState.lootLuck));
      setChestOpen(true);
      if (document.pointerLockElement) document.exitPointerLock();
    } else if (bt === 'bed') {
      healthRef.current = powerState.maxHealth;
      setHealth(powerState.maxHealth);
      showToast('You slept soundly. Full health restored.');
    }
  }, [world, showToast]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (health >= powerState.maxHealth || health <= 0) return;
    const t = setInterval(() => {
      setHealth(h => (h < powerState.maxHealth && h > 0 ? h + 1 : h));
    }, powerState.fastRegen ? 1200 : 4000);
    return () => clearInterval(t);
  }, [health, unlockedPowers]);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (codeOpenRef.current) return;
      if (e.key === 'c' || e.key === 'C') {
        if (e.repeat) return;
        openCodeBoxRef.current?.();
        return;
      }
      const num = parseInt(e.key);
      if (num >= 1 && num <= PLACEABLE_BLOCKS.length) {
        setSelectedBlock(PLACEABLE_BLOCKS[num - 1]);
      }
      if (e.key === 'q' || e.key === 'Q') {
        if (drivingState.active) return;
        setWeapon(w => {
          const idx = WEAPONS.findIndex(spec => spec.id === w);
          return WEAPONS[(idx + 1) % WEAPONS.length].id;
        });
      }
      if (e.key === 'e' || e.key === 'E') {
        if (e.repeat) return;
        const res = carsRegistry.toggleDrive?.(playerPosRef.current);
        if (res === 'occupied') {
          showToastRef.current?.('That car already has a driver!');
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        if (drivingState.active) return;
        const res = carsRegistry.repairNear?.(playerPosRef.current);
        if (res) {
          const name = CAR_SPECS[res.kind].name;
          if (res.wasBroken && res.health > 0) {
            showToastRef.current?.(`${name} engine restarted! (${res.health}/${res.maxHealth})`);
          } else if (res.health >= res.maxHealth) {
            showToastRef.current?.(`${name} fully repaired!`);
          } else {
            showToastRef.current?.(`Repairing ${name}... (${res.health}/${res.maxHealth})`);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const showToastRef = useRef<((msg: string) => void) | null>(null);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  const handleCrash = useCallback((damage: number, broken: boolean) => {
    if (broken) {
      showToast('Car wrecked! Get out (E) and press R to repair it.');
    } else {
      showToast(`Crash! Car took ${damage} damage.`);
    }
  }, [showToast]);

  const openCodeBox = useCallback(() => {
    if (drivingState.active) {
      showToastRef.current?.('Stop the car first! (E to get out)');
      return;
    }
    if (chestOpenRef.current || !aliveRef.current) return;
    codeOpenRef.current = true;
    setCodeOpen(true);
    setCodeValue('');
    if (document.pointerLockElement) document.exitPointerLock();
  }, []);

  useEffect(() => {
    chestOpenRef.current = chestOpen;
  }, [chestOpen]);

  useEffect(() => {
    openCodeBoxRef.current = openCodeBox;
  }, [openCodeBox]);

  const closeCodeBox = useCallback(() => {
    codeOpenRef.current = false;
    setCodeOpen(false);
    setCodeValue('');
  }, []);

  const handleCodeSubmit = useCallback(() => {
    const entered = codeValue.trim();
    if (!entered) return;
    const match = CODE_TO_POWER.get(entered);
    if (!match) {
      showToast('Nothing happened... that number holds no power.');
    } else if (enteredCodes.has(entered)) {
      showToast('You already used that number!');
    } else {
      setEnteredCodes(prev => {
        const next = new Set(prev);
        next.add(entered);
        return next;
      });
      setUnlockedPowers(prev => {
        if (prev.has(match.id)) {
          // Bonus for finding another number of an already-active power
          const healed = Math.min(powerState.maxHealth, healthRef.current + 2);
          healthRef.current = healed;
          setHealth(healed);
          showToast(`${match.icon} Another ${match.name} number! Bonus: +2 health.`);
          return prev;
        }
        const next = new Set(prev);
        next.add(match.id);
        applyPowers(next);
        showToast(`${match.icon} ${match.name} unlocked! ${match.desc}`);
        return next;
      });
    }
    codeOpenRef.current = false;
    setCodeOpen(false);
    setCodeValue('');
  }, [codeValue, enteredCodes, showToast]);

  const handleCarButton = useCallback(() => {
    const res = carsRegistry.toggleDrive?.(playerPosRef.current);
    if (res === 'occupied') {
      showToast('That car already has a driver!');
    }
  }, [showToast]);

  const handleRepairButton = useCallback(() => {
    if (drivingState.active) return;
    const res = carsRegistry.repairNear?.(playerPosRef.current);
    if (res) {
      const name = CAR_SPECS[res.kind].name;
      showToast(res.health >= res.maxHealth ? `${name} fully repaired!` : `Repairing ${name}... (${res.health}/${res.maxHealth})`);
    }
  }, [showToast]);

  const handleBlockInteract = useCallback((
    type: 'break' | 'place',
    wx: number,
    wy: number,
    wz: number,
    blockType?: BlockType
  ) => {
    if (type === 'break') {
      world.setBlock(wx, wy, wz, 'air');
    } else if (type === 'place' && blockType) {
      world.setBlock(wx, wy, wz, blockType);
    }
  }, [world]);

  const handlePositionChange = useCallback((pos: THREE.Vector3) => {
    setPlayerPos(pos.clone());
  }, []);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    if (!gl.getContext()) {
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a2e',
        color: 'white',
        fontFamily: 'monospace',
        textAlign: 'center',
        padding: 32,
      }}>
        <div>
          <div style={{ fontSize: 24, marginBottom: 16, color: '#ff6b6b' }}>WebGL Not Available</div>
          <div style={{ color: '#aaa', maxWidth: 400 }}>
            This game requires WebGL to run. Please open the app in a modern browser window.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#87CEEB' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          gl={{
            antialias: true,
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={handleCreated}
          camera={{ fov: 75, near: 0.05, far: 500, position: [8, 18, 8] }}
          shadows
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <GameScene
              world={world}
              selectedBlock={selectedBlock}
              onBlockInteract={handleBlockInteract}
              onInteract={handleInteract}
              onPositionChange={handlePositionChange}
              touchMode={touchMode}
              playerPosRef={playerPosRef}
              respawnSignal={respawnSignal}
              onDamagePlayer={handleDamagePlayer}
              alive={!showDeath}
              weapon={weapon}
              onDrivingChange={setCarInfo}
              onCrash={handleCrash}
              onNearCar={setNearCar}
            />
            <SecretNumbers world={world} found={enteredCodes} playerPosRef={playerPosRef} />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <GameUI
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
        position={playerPos}
        isLocked={touchMode ? started : isLocked}
        touchMode={touchMode}
        onToggleTouchMode={() => setTouchMode(t => !t)}
        onStart={() => setStarted(true)}
        health={health}
        maxHealth={powerState.maxHealth}
        weapon={weapon}
        onSelectWeapon={setWeapon}
        carInfo={carInfo}
        nearCar={nearCar}
        onCarButton={handleCarButton}
        onRepairButton={handleRepairButton}
        unlockedPowers={unlockedPowers}
        onCodeButton={openCodeBox}
      />

      {isFlashing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(220, 30, 30, 0.25)',
            pointerEvents: 'none',
            zIndex: 150,
          }}
        />
      )}

      {showDeath && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            color: 'white',
            fontFamily: 'monospace',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#ff4d4d' }}>YOU DIED</div>
          <div style={{ color: '#bbb' }}>The zombies got you.</div>
          <button
            onClick={handleRespawn}
            style={{
              marginTop: 12,
              background: '#7CFC00',
              color: '#102',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            Respawn
          </button>
        </div>
      )}

      <TouchControls enabled={touchMode && started && !showDeath} />

      {codeOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
            fontFamily: 'monospace',
          }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) closeCodeBox();
          }}
        >
          <div
            style={{
              background: '#1a1a2e',
              border: '2px solid #8a4fd0',
              borderRadius: 12,
              padding: '24px 28px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 280,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#c9a0ff' }}>🔢 Secret Code</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>
              Found a glowing number in the world? Type it here to unlock a special power!
            </div>
            <input
              autoFocus
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') handleCodeSubmit();
                if (e.key === 'Escape') closeCodeBox();
              }}
              inputMode="numeric"
              placeholder="Enter number..."
              style={{
                background: '#0d0d1a',
                border: '1px solid #555',
                borderRadius: 8,
                padding: '10px 12px',
                color: 'white',
                fontSize: 20,
                fontFamily: 'monospace',
                letterSpacing: 4,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCodeSubmit}
                style={{
                  flex: 1,
                  background: '#8a4fd0',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                Unlock
              </button>
              <button
                onClick={closeCodeBox}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {chestOpen && (
        <ChestUI
          loot={chestLoot}
          onClose={() => setChestOpen(false)}
        />
      )}

      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
