# Implementation status

## Foundation, movement and combat — prototype implemented

Files: dist/client.js, style.css, index.html; packages/shared/simulation.js; services/game-server/server.js.

Playable: original rendered 3D map, procedural soldiers with animated legs, planar collision, jump/gravity, sprint/crouch camera, FPS/TPS switching, ADS field of view, shooting, reload, HP/death/respawn, team scores, scoreboard, result overlay. Server validates fire cadence/ammo and obstacle visibility. Dev panel consumes live telemetry. Production dev route is denied unless authorized by header.

## Multiplayer/TDM — prototype implemented, alpha incomplete

Real humans synchronize over WebSocket with team balancing and ten-player capacity. Two automated clients verified movement synchronization, server damage, elimination, scores, reload, respawn and disconnect cleanup. Two browser tabs joined the same room on opposing teams. Browser perspective switching and actual 3D rendering verified. Complete mouse-aim combat between two graphical browsers is not verified. Ten human clients, latency/loss simulation, recovery, benchmark targets and production deploy are not verified.

## Visual polish — placeholder quality

Military interface, procedural scene/soldier/weapon, fog/shadow lighting, basic limb motion, synthesized audio. No licensed character assets, skeletal state machine, spatial audio, advanced FX, compression/streaming/LOD or graphics presets. Not realistic visual quality.

## Accounts, progression and Web3 — not implemented

Routes explicitly explain unavailable systems. No fake balances, online counts, rankings or marketplace actions. No database, social/email auth, durable inventory or contract ownership. No contract or paid transactions.

## Deployment — prepared

CI, Docker, Vercel/static hosting configuration, env example, documentation. Hosted static client publication is separate from live multiplayer container deployment; consult deployment report. No external game server credentials were supplied.

## Next milestone

Extract tested room simulation, add authenticated sessions and persistent PostgreSQL match records, robust multiple-room matchmaking, capsule collisions and skeletal assets. Then verify two desktop-browser combat sessions, match completion, 5v5 load and recovery. The master brief's MVP/alpha acceptance is **not fully satisfied**.

Combat extension: G throws a server-simulated frag grenade (2 per life, 2.2-second fuse, 8m radius, cover occlusion, radial damage). 1/2 switches primary and pistol while preserving magazine state. Hitscan head intersections use a 1.8× multiplier. Muzzle and explosion meshes are short-lived placeholder effects.

Publication status: private site registration succeeded; source credential submission to the official helper was rejected by automatic approval policy. Source publication and deployment were not completed. Local source is committed to Git and can be run using README.md.

GitHub/Vercel preparation: repository root is configured for static Vercel deployment, explicit client routes preserve asset/JSON delivery, /dev redirects home on Vercel, Node and pnpm versions are pinned, generated engine/config artifacts are produced during build, and WARFRONT_SERVER_URL configures the external multiplayer endpoint. This does not claim an actual Vercel or container deployment.

Readiness verification: clean pnpm 10.28.0 frozen install and production-style build passed; automated suite expanded to nine passing tests including route safety and build-time endpoint validation. GitHub upload does not imply an actual Vercel deployment.
