# Verification

Run `pnpm test` (Node's built-in runner, no browser dependency). The script writes an actual pass/fail summary and timestamp to dist/build-report.json for /dev.

Seven tests passed on 2026-10-24:

- Data-driven weapon configuration invariants.
- Diagonal movement normalization, world bounds and cover collision.
- Hitscan intersection and miss.
- Spawn health/ammunition reset.
- Grenade damage falloff.
- Match timer reaches a deterministic draw.
- Integration: two actual WebSocket clients join opposite teams, move across the map, observe each other's positions, fire server-validated damage, eliminate and score, respawn after five seconds, reload, switch weapon without refreshing ammo, throw a grenade and observe its fuse/removal, and remove a disconnected participant.

Browser checks in the Codex in-app browser: /dev renders the 3D scene; two browser tabs joined Alpha/Bravo; V changes FPS/TPS; held W moves through the environment; held fire reduced ammo from 30 to 25. Reload completed with 30/115 ammo after firing five rounds; TPS then displayed the full soldier. Pointer lock is rejected by this embedded browser; fallback drag-to-aim keeps play functional. No claim of a full browser-vs-browser combat session is made. The displayed frame rate is measured per client, not a hardware benchmark.

Not executed: 5v5 human play/load, production container, Vercel deployment, network impairment, server restart/reconnect recovery, auth/database/inventory tests, contract tests, target-hardware 60 FPS benchmark. Those systems are absent or not configured. The master acceptance checklist is incomplete. Tests named for match completion validate timer/draw; 50-kill end and subsequent round reset are implemented but not directly covered by the current automated suite.

## GitHub/Vercel readiness verification

A fresh directory with no node_modules passed `pnpm@10.28.0 install --frozen-lockfile --ignore-scripts`. A production-style build (`VERCEL=1`, example secure WSS endpoint) generated the engine, license and public config module. Two added tests cover explicit SPA routing/static asset preservation and production endpoint validation (rejecting insecure protocols and embedded credentials). Nine automated tests passed locally. This verifies packaging, not an actual Vercel deployment or reachability of the example server.
