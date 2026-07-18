---
name: R3F registry lifecycle
description: Pattern for module-level callback registries (combat, cars) in the 3D game.
---

The game wires cross-component actions (attack hits, car enter/repair) through module-level registry objects that scene components populate in `useEffect`.

**Rule:** register the handlers once (`useEffect` with `[]` deps, cleanup on unmount only) and read unstable values (the `useWorld()` object, callback props) via refs updated each render.

**Why:** `useWorld()` returns a fresh object every render, so including it in the effect deps tears down and re-registers handlers on every render — cleanup briefly sets them to `null`, causing intermittent no-op key presses (was the suspected cause of a "can't enter the car" bug). Flagged by code review July 2026.

**How to apply:** any new registry (like `combatRegistry`, `carsRegistry`) or similar effect that closes over `world` or callback props should use the worldRef/callbackRef pattern seen in `Cars.tsx`.
