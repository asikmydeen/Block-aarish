import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface RemotePlayer {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
}

interface RemotePlayersProps {
  playerPosRef: MutableRefObject<THREE.Vector3>;
  onStatusChange: (status: 'connecting' | 'online' | 'offline', count: number) => void;
}

const NAMES = ['Blocky', 'Miner', 'Digger', 'Crafty', 'Rocky', 'Sandy', 'Pebble', 'Boulder'];
const COLORS = ['#ff6b5a', '#5ad1ff', '#8affc1', '#ffd24d', '#e0aaff', '#f9c74f', '#48cae4', '#ff8fa3'];

export function RemotePlayers({ playerPosRef, onStatusChange }: RemotePlayersProps) {
  const { camera } = useThree();
  const [players, setPlayers] = useState<RemotePlayer[]>([]);
  const myIdRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const groupRefs = useRef<Map<string, THREE.Group>>(new Map());
  const targetsRef = useRef<Map<string, RemotePlayer>>(new Map());

  useEffect(() => {
    let closed = false;
    let ws: WebSocket | null = null;
    let sendTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      onStatusChange('connecting', 0);
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/api/mp`);
      wsRef.current = ws;

      ws.onopen = () => {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 90 + 10);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        ws?.send(JSON.stringify({ type: 'join', name, color }));
        sendTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            const p = playerPosRef.current;
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            ws.send(JSON.stringify({
              type: 'state',
              x: p.x, y: p.y, z: p.z,
              yaw: Math.atan2(dir.x, dir.z),
            }));
          }
        }, 100);
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'welcome') {
            myIdRef.current = msg.id;
          } else if (msg.type === 'players') {
            const others = (msg.players as RemotePlayer[]).filter(p => p.id !== myIdRef.current);
            for (const p of others) targetsRef.current.set(p.id, p);
            for (const id of Array.from(targetsRef.current.keys())) {
              if (!others.some(p => p.id === id)) targetsRef.current.delete(id);
            }
            setPlayers(prev => {
              const sameIds = prev.length === others.length && prev.every((p, i) => others[i]?.id === p.id);
              return sameIds ? prev : others;
            });
            onStatusChange('online', others.length);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (sendTimer) clearInterval(sendTimer);
        sendTimer = null;
        if (!closed) {
          onStatusChange('offline', 0);
          setPlayers([]);
          targetsRef.current.clear();
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      closed = true;
      if (sendTimer) clearInterval(sendTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      wsRef.current = null;
    };
    // Connect once per mount; camera/playerPosRef are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly move avatars toward their latest network position.
  useFrame((_, delta) => {
    const k = Math.min(1, delta * 10);
    for (const [id, g] of groupRefs.current) {
      const t = targetsRef.current.get(id);
      if (!t) continue;
      g.position.x += (t.x - g.position.x) * k;
      g.position.y += (t.y - g.position.y) * k;
      g.position.z += (t.z - g.position.z) * k;
      g.rotation.y += (t.yaw - g.rotation.y) * k;
    }
  });

  return (
    <>
      {players.map(p => (
        <group
          key={p.id}
          position={[p.x, p.y, p.z]}
          ref={(el) => {
            if (el) groupRefs.current.set(p.id, el);
            else groupRefs.current.delete(p.id);
          }}
        >
          {/* Body */}
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.6, 1.0, 0.35]} />
            <meshStandardMaterial color={p.color} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ffd9b3" />
          </mesh>
          {/* Legs */}
          <mesh position={[-0.15, 0.1, 0]}>
            <boxGeometry args={[0.25, 0.5, 0.3]} />
            <meshStandardMaterial color="#3a5a8c" />
          </mesh>
          <mesh position={[0.15, 0.1, 0]}>
            <boxGeometry args={[0.25, 0.5, 0.3]} />
            <meshStandardMaterial color="#3a5a8c" />
          </mesh>
          <Billboard position={[0, 2.1, 0]}>
            <Text fontSize={0.32} color="#ffffff" outlineWidth={0.03} outlineColor="#000000" anchorX="center" anchorY="middle">
              {p.name}
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  );
}
