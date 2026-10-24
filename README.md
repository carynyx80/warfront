# WARFRONT — playable combat prototype

A real PlayCanvas 3D browser client and separate Node/WebSocket authoritative Team Deathmatch server. This is an early functional prototype, **not the complete alpha described in the master brief**.

## Deploy to Vercel

Import [carynyx80/warfront](https://github.com/carynyx80/warfront) with repository root `./` and preset **Other**. `vercel.json` supplies install/build/output settings. Set the public build variable `WARFRONT_SERVER_URL` to your separately hosted `wss://` game server. See [DEPLOYMENT.md](DEPLOYMENT.md) for exact steps. Vercel serves the client; live combat requires that external server.

## Run

Node.js 24 and pnpm are required.

```sh
corepack enable
pnpm install --ignore-scripts
pnpm build
pnpm dev
```

Open http://localhost:3000/dev for live telemetry and game, /lobby to select callsign and weapon, or /play for the game. Open a second browser window to fight another human. No training bots or artificial players are included. The in-app browser may reject pointer lock; click then drag to aim there. Chrome/Edge desktop pointer lock is preferred.

WASD move, Shift sprint, C crouch, Space jump, mouse aim, left click fire, right click aim, R reload, V FPS/TPS, Tab scoreboard, Esc release. Clicking the scene enters controls. Guest name and loadout are stored in your browser only.

## Included

Procedural original urban map and soldiers, directional limb animation, collision against cover, gravity/jump, FPS rifle and over-shoulder camera, five configurable firearms, ammunition/reload/fire-rate validation, server hitscan and obstruction tests, team balance up to ten players, 30 Hz target simulation, 50-kill/10-minute TDM, five-second respawn, results, automatic next round, real connected-player scoreboard, movement prediction/replay and remote smoothing, telemetry, and CI/container/Vercel preparation.

## Important limits

One in-memory room, no accounts or durable statistics, no reconnect recovery or lag compensation, no skeletal GLB assets, no capsule physics or vertical map traversal, no class abilities, no wallet or contracts. No production security certification or 5v5 load test. See IMPLEMENTATION_STATUS.md and TESTING.md for exact verification. Host the game server separately before claiming public online play.

## Source layout

`dist/` client source and static assets; `services/game-server/` authoritative simulation host; `packages/shared/` map and movement/weapon data; `tests/` unit and real WebSocket integration tests; `infrastructure/` container config. Static client is deliberately build-light. The requested Next.js/React/Colyseus/PostgreSQL stack remains a future migration, not a claimed implementation.

PlayCanvas is MIT licensed. Procedural geometry and synthesized audio are original; no third-party military assets are bundled. Fonts use Google Fonts and fall back to system fonts offline.

Combat extension: G throws a server-simulated frag grenade (2 per life, 2.2-second fuse, 8m radius, cover occlusion, radial damage). 1/2 switches primary and pistol while preserving magazine state. Hitscan head intersections use a 1.8× multiplier. Muzzle and explosion meshes are short-lived placeholder effects.
