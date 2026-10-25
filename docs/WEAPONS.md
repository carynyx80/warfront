# Original procedural weapon assets

`dist/game/weapons.js` contains seven original, runtime-generated firearm models:

| ID | Visual details |
| --- | --- |
| `M4A1` | Tan ventilated handguard, telescoping stock, magazine, vertical foregrip, reflex optic and barrel brake |
| `AK74` | Timber furniture, swept magazine, gas tube, charging handle and protected iron sights |
| `MP5` | Tubular receiver, short handguard, wire stock, curved magazine and compact reflex optic |
| `M24` | Olive stock, bolt handle, telescopic sight, adjustment turrets and folded bipod |
| `M9` | Short slide, barrel, grip panels, slide serrations, trigger guard and iron sights |
| `SCAR-L` | Tan receiver, folding stock, side rails, angled foregrip and holographic optic |
| `M249` | Wide receiver, ammunition box, exposed cartridges, carrying handle and folded bipod |

These are stylized original geometric assets inspired by the broad shapes of real firearm categories. No game models, textures, trademarks, or artwork from Call of Duty or Grand Theft Auto are included. Their geometry is authored in this repository and has no external asset downloads or licenses to provision. The models improve silhouettes and mechanical detail but are not scanned or photorealistic AAA assets.

## Integration

```js
import { createWeapon, WEAPON_DETAILS, weaponIcon } from '/game/weapons.js';

// Initialize the PlayCanvas application first.
const weapon = createWeapon(pc, 'M4A1');
handSocket.addChild(weapon);

// The returned root is positioned at its trigger-hand grip.
// Forward is local -Z; geometry is sized in meters.
const muzzleWorldPosition = weapon.muzzle.getPosition();
const supportHandPosition = weapon.supportHand;

// Optional first-person rendering disables weapon shadows.
const viewWeapon = createWeapon(pc, 'M24', { viewmodel: true });
camera.addChild(viewWeapon);

// Remove individual equipped entities normally.
weapon.destroy();

// Labels and original SVG silhouettes for the loadout interface:
const details = WEAPON_DETAILS.M4A1;
const iconMarkup = weaponIcon('M4A1');
```

Each root also has `weaponId` and `userData` containing serializable local muzzle and support-hand positions. Unsupported IDs fall back to `M4A1`. `weaponIcon()` also handles unsupported input safely; arbitrary caller input is never inserted into its SVG markup.

Meshes are combined by material into a small number of draw calls, then cached with shared physically based materials per graphics device. Equipping another instance reuses those GPU resources. The cache retains its own mesh reference so destroying an individual instance does not invalidate later instances. All rifles point in the same direction and use the same grip convention. The pistol is sized to approximately 24 cm; long guns are approximately 0.77–1.23 m.

Weapon damage, fire rate, reload times, ammunition, switching, and server validation are defined separately by the authoritative simulation. This module provides visual assets only.
