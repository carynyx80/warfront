# Verification

Run `pnpm build` then `pnpm test` under Node.js 24. The test runner writes its actual result to ignored dist/build-report.json for the development panel.

The suite covers weapon data, normalized movement and cover, ray intersections, spawn resets, grenade falloff, deterministic match completion, and two real WebSocket clients joining, moving, damaging, eliminating, respawning, reloading, switching, throwing grenades and disconnecting. Deployment tests check static routes and public endpoint validation. Six local practice regressions cover ammo/input validation, grenade collisions, dead-player action blocking, completed-round damage guards, pause/timer preservation and socket cleanup.

Browser checks cover the textured rigged operator and seven-gun armory, equipment persistence, weapon inspection, city rendering, movement, FPS/TPS switching and ammunition consumption. Embedded browser pointer lock may be rejected; drag-to-aim is available. Frame rate is measured on the current client and is not a target-hardware benchmark.

Not verified: 5v5 human load, mobile devices, network impairment, production Vercel/container deployment, full graphical browser-vs-browser combat, server recovery or authentication/persistence systems. Those systems are absent or require separate infrastructure. Automated timer tests do not replace competitive playtesting or a full 50-kill match acceptance test.

Final London update verification: all 15 automated tests passed locally on 25 October 2026, including both real WebSocket tests. Production asset packaging passed.
