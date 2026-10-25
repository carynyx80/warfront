# Implementation status — London Operations 0.2

Implemented: original London/Southwark-inspired compact city arena; rigged textured CC0 operator with walk/run animation and procedural arm posing; four cosmetic classes; seven modeled selectable guns; first/third-person movement and combat; grenades, reloads, respawns, minimap and scoreboard. Local training has three labeled AI bots; free roam has none. Local play starts paused and pauses when controls are released.

Online multiplayer uses a separate authoritative WebSocket process with one in-memory room, guest identities, team assignment, health/ammunition validation and TDM rounds. Local practice is explicitly local and does not claim connected humans. The Vercel frontend supports local modes without a game server; online play needs an external WSS endpoint.

The model is an optimized CC0 asset with an AI-assisted source disclosed in its provenance file. Weapons and environment are original procedural geometry. The result is a browser prototype, not photorealistic AAA production. Vehicles are decorative; no driving, campaign, interiors, open-world streaming, touch controls or class abilities exist.

Accounts, persistent progression, matchmaking queues, database, inventory ownership and Web3 are not implemented. One room is not production-scale infrastructure. Authentication, recovery, lag compensation, anti-cheat hardening and 5v5 load testing remain outstanding. The original master brief's complete alpha acceptance is not satisfied.

Vercel build/routing, Docker configuration and CI are included. Repository upload does not imply an actual Vercel deployment or hosted multiplayer service. See TESTING.md for validation and DEPLOYMENT.md for setup.
