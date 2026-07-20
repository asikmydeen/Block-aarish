import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "./lib/logger";

interface PlayerState {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
}

export function setupMultiplayer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/api/mp" });
  const players = new Map<WebSocket, PlayerState>();
  let nextId = 1;

  wss.on("connection", (ws) => {
    const id = String(nextId++);
    logger.info({ id }, "mp: player connected");

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === "join") {
          players.set(ws, {
            id,
            name: typeof msg.name === "string" ? msg.name.slice(0, 20) : `Player ${id}`,
            color: typeof msg.color === "string" ? msg.color.slice(0, 9) : "#ff8800",
            x: 8,
            y: 15,
            z: 8,
            yaw: 0,
          });
          ws.send(JSON.stringify({ type: "welcome", id }));
        } else if (msg.type === "state") {
          const p = players.get(ws);
          if (p) {
            const clamp = (v: unknown, limit: number) => {
              const n = Number(v);
              return Number.isFinite(n) ? Math.max(-limit, Math.min(limit, n)) : 0;
            };
            p.x = clamp(msg.x, 100000);
            p.y = clamp(msg.y, 1000);
            p.z = clamp(msg.z, 100000);
            p.yaw = clamp(msg.yaw, 10);
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      players.delete(ws);
      logger.info({ id }, "mp: player disconnected");
    });
    ws.on("error", () => {
      players.delete(ws);
    });
  });

  // Broadcast the full roster 10x per second.
  setInterval(() => {
    if (players.size === 0) return;
    const roster = Array.from(players.values());
    const payload = JSON.stringify({ type: "players", players: roster });
    for (const ws of players.keys()) {
      if (ws.readyState === WebSocket.OPEN) ws.send(payload);
    }
  }, 100);

  return wss;
}
