# Architecture

The PlayCanvas browser sends normalized movement inputs with increasing sequence numbers and bounded angles. The Node server integrates at a 30 Hz target, resolves planar circle-versus-box movement, applies gravity, validates weapon state, traces muzzle-eye hitscan against enemy body bounds and map cover, and broadcasts snapshots. Clients replay unacknowledged movement and smooth remote transforms. Server-assigned guest IDs are tied to WebSocket connections; guest identities are not authenticated accounts.

Server values own health, ammo, scores, deaths, reload and respawn timers. Client damage/target values are ignored. Packet sizes, packet rates, room capacity and stale input sequences are bounded. This is foundational validation, not complete anti-cheat. Full snapshots, rather than deltas, are transmitted. No authoritative client positions are accepted. No rewind/lag compensation or reconnect tokens exist. Movement input expires after 500ms without a fresh packet.

A single process hosts one room and ephemeral state. It resets rounds after a 15-second results period. Persistent repositories, Colyseus rooms, account/session services, matchmaking queues, Redis presence and PostgreSQL match storage are not implemented. Web3 remains entirely separate and unavailable. Scale and recovery must be designed before public alpha.
