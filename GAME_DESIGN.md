# Game design

Southbank District is an original compact Southwark-inspired London arena, not a geographically accurate reconstruction. Streets, shops, crossings, red vehicles and river skyline supply a UK setting around shared collision volumes. Buildings have no accessible interiors; vehicles are decorative. See docs/CITY_REFERENCE.md.

Online TDM: 100 HP, no armor/regeneration, friendly fire disabled, first to 50 or highest score after ten minutes; ties draw. Five-second respawn, 15-second results then a new round. Training runs locally against three bots and returns to the lobby after results. Free roam has no opponents. Local modes pause with Escape or window blur; online matches keep running.

M4A1, AK74, MP5, M24, M9, SCAR-L and M249 have separate damage, cadence, magazine, range and reload values in packages/shared/simulation.js. Switch primary/pistol with 1/2 while preserving ammunition. Grenades have two charges per life, a 2.2-second fuse, 8m radius and cover occlusion. Head hits use a 1.8 multiplier. Falloff/spread tuning, spawn protection and competitive map balancing remain future work.

Four classes share a rigged soldier asset with cosmetic gear and colors; no class abilities. Weapons use original procedural geometry, recoil motion and synthesized sounds. Effects and animation are prototype quality. Keyboard/mouse controls are supported; mobile touch controls are not yet implemented.
