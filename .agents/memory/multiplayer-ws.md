---
name: Multiplayer WebSocket routing
description: How realtime multiplayer connects through the shared proxy in this workspace
---
The shared reverse proxy at localhost:80 passes WebSocket upgrades on /api paths to the api-server. Clients should connect same-origin (`ws(s)://location.host/api/...`) — works in both dev preview and production, no ports or custom URLs needed.
**Why:** verified by handshake test through the proxy; direct ports are blocked by convention.
**How to apply:** attach `WebSocketServer({ server, path: "/api/<name>" })` to the http server returned by `app.listen` in api-server; restart its workflow after changes (dev script rebuilds via esbuild).
