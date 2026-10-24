# Game design

Ash District: compact 64m urban block with a central road, cross street, ten solid building/cover volumes, perimeter walls and decorative skyline. Alpha spawns southwest and Bravo northeast. Building volumes have no accessible interiors; elevated combat, stairs, vaulting and spawn protection are not implemented. The map is a functional blockout, not a finished balanced 5v5 map.

TDM: 100 HP, no armor/regeneration, friendly fire disabled, first to 50 or highest score after ten minutes, ties draw. Five-second respawn, 15-second results period then new round. No bots. All class choices currently share mechanics and change only saved selection; abilities/equipment balancing remains pending.

M4A1, AK74, MP5, M24 and M9 have separate damage, cadence, magazine and reload values in packages/shared/simulation.js. Actual server damage uses these values. Range currently gates hitscan; falloff, spread and per-weapon recoil tuning are pending. Synthesized shot/hit tones and primitive rifle motion are placeholders, not final spatial sound/animation.

Combat extension: G throws a server-simulated frag grenade (2 per life, 2.2-second fuse, 8m radius, cover occlusion, radial damage). 1/2 switches primary and pistol while preserving magazine state. Hitscan head intersections use a 1.8× multiplier. Muzzle and explosion meshes are short-lived placeholder effects.
