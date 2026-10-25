# WARFRONT — London Operations

A playable PlayCanvas browser shooter set in an original Southwark-inspired London district. Includes local training, free roam, and a separate authoritative Node/WebSocket multiplayer server. This is an indie prototype, not a GTA-scale open world or Call of Duty-quality production.

## Run

Use Node.js 24 and pnpm 10.28.0:

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm dev
```

Open http://localhost:3000. Choose training against three clearly labeled AI bots, free roam, or online multiplayer. The armory offers seven weapons and four cosmetic operator classes. Local training pauses until you deploy and when you press Escape or leave the window.

WASD move, Shift sprint, C crouch, Space jump, mouse aim, left click fire, right click aim, R reload, V first/third person, 1 primary, 2 pistol, G grenade, Tab scoreboard, Esc release/pause local play. Embedded browsers may reject pointer lock; drag to aim is supported. Keyboard and mouse are required; mobile touch controls are not implemented.

## Deploy to Vercel

Import [carynyx80/warfront](https://github.com/carynyx80/warfront), repository root `./`, preset **Other**. The checked-in `vercel.json` supplies install/build/output settings. Training and free roam work on the static deployment. Online multiplayer requires a separately hosted persistent server and the public build variable `WARFRONT_SERVER_URL=wss://your-server.example`. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Included

- London-inspired streets, textured facades, shopfronts, road markings, Thames-inspired skyline and decorative vehicles.
- Locally bundled, textured and rigged CC0 soldier with walk/run animation, arm posing and cosmetic gear. Optimized to 42,000 triangles; four classes share this base model.
- Seven original modeled weapons: M4A1, AK74, MP5, M24, M9, SCAR-L and M249, with distinct combat statistics, inspection and persistent browser loadout.
- FPS/TPS cameras, collision, jumping, sprint/crouch, shooting/reload, hit feedback, grenades, death/respawn, minimap and scoreboard.
- Online server validation, movement prediction, remote smoothing, 50-kill/10-minute TDM and automatic next rounds.

## Scope and source

`dist/` contains client source and assets; `packages/shared/` holds shared movement and weapon data; `services/game-server/` runs multiplayer; `tests/` covers simulation, real WebSocket integration, practice and deployment packaging. Run `pnpm test` for verification. The build generates the engine bundle and public endpoint config.

One in-memory multiplayer room, no accounts, persistence, reconnect recovery, lag compensation or class abilities. No drivable vehicles, interiors, campaign or streamed open world. Advanced visual polish, mobile controls, load testing and production infrastructure remain future work. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md).

PlayCanvas is MIT licensed. The operator license, source and modifications are documented in [docs/ASSETS.md](docs/ASSETS.md). City/weapon geometry and synthesized audio are original. Fonts fall back to system fonts offline. No GTA or Call of Duty assets are included.
