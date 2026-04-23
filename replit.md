# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### 3d-game (Craftworld)
- **Path**: `artifacts/3d-game/`
- **Preview**: `/` (root)
- **Stack**: React + Vite + React Three Fiber + Drei + Three.js
- **Description**: Minecraft-like 3D block exploration game
- **Features**:
  - Procedurally generated terrain using fractal Brownian motion
  - First-person camera with pointer lock
  - Block breaking (left click) and placing (right click)
  - 7 placeable block types, 12 total block types
  - Chunk-based world (16x16 chunks), dynamic loading
  - Gravity, jumping, AABB collision detection
  - Trees, water, snow, ore generation
  - Inventory hotbar (keys 1-7)
  - Coordinate display, crosshair, help overlay
- **Key files**:
  - `src/game/terrain.ts` — World generation
  - `src/game/useWorld.ts` — World state management
  - `src/components/ChunkMesh.tsx` — Greedy mesh rendering
  - `src/components/Player.tsx` — Player physics + controls
  - `src/components/GameUI.tsx` — HUD elements
  - `src/pages/Game.tsx` — Main game entry
