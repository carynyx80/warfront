# Southbank District: city reference and implementation

Southbank District is an original compact combat arena inspired by Southwark,
London. It is **not a measured reconstruction**, a navigable map of real London,
or a reproduction of another game's level. Building fronts, businesses, vehicle
liveries and landmark silhouettes are newly authored for WARFRONT.

## Primary references

- [Southwark Council, Borough High Street conservation area appraisal](https://www.southwark.gov.uk/sites/default/files/2024-08/Borough%20High%20Street%20conservation%20area%20appraisal.pdf): London stock brick, red brick, pale stone detailing, vertical windows, horizontal parapets and timber shop fronts informed the material palette and facade proportions. No photographs or textures were copied.
- [Southwark Council, conservation area descriptions](https://www.southwark.gov.uk/planning-environment-and-building-control/planning/design-and-conservation/conservation-areas/list): the dense warehouse streets and small commercial frontages of Bermondsey Street, Bear Gardens and Old Barge House Alley informed the district's sense of enclosure and riverside industrial character.
- [London & Partners / Visit London, South Bank area guide](https://www.visitlondon.com/things-to-do/london-areas/south-bank/things-to-do-south-bank): the relationship between a riverside promenade, observation wheel and distant city skyline informed the background composition. The in-game wheel, clock tower and glass spires are original simplified designs.

References accessed 24 October 2026. The skyline deliberately compresses distances
and combines viewpoints for readable orientation in a small multiplayer map.

## Visual features

- Procedural stock-brick, red-brick, limestone, asphalt, paving and glass textures.
- Two-storey play-space warehouse/shop buildings, sash windows, stone lintels,
  parapets, chimneys, roof plant and original shop signs.
- Double yellow lines, zebra crossing, approach markings and UK left-driving cues.
- Red phone kiosks, red double-decker exterior, black taxi exterior, bus stop,
  street lamps and trees beyond the playable collision boundary.
- Embankment, river, bridge and original London-inspired skyline silhouettes.
- Subtle chips and wear; colour and contrast remain readable in daylight or dusk.

## Collision and performance contract

`dist/game/city.js` exports `buildCity(app, pc, boxes)`. It reads the authoritative
collider array supplied by the caller and renders the same ten solid volume
centres and dimensions. It returns `name`, `bounds`, `root`, `update(dt)` and
geometry `stats`. It creates no lights or cameras.

Major props and background buildings are outside x/z ±31 or inside an existing
collider footprint. Flat street surfaces introduce no additional collision. Sills,
fascias and surface wear project only a small distance from the original wall;
the existing player-radius collision clearance covers that detail. Rooftop
chimneys and ventilation are decorative, non-walkable detail above the roofs.

Static triangles are merged into one render entity per material at build time.
Shared facade/road/vehicle materials keep most meshes batched. Shop signs create
small extra material groups. The deterministic texture generator needs no asset
network requests, external fonts, runtime image service or third-party licence.
There is no expensive per-frame city simulation; `update` is intentionally a
no-op. Distant skyline geometry is part of the actual 3D scene.

## Integration guidance

Use a warm directional sun, cool ambient fill and pale atmospheric distance fog.
A sun intensity around 1.6–2.0 and ambient around RGB (0.50, 0.56, 0.60) keep the
streets bright enough to identify opponents. Start fog beyond 38m and end it
around 150–180m. Use a camera far clip of at least 180m for the whole skyline.
Prefer a menu camera near (8, 4.5, 24), looking toward (-2, 2.5, -6), to show the
crossing and shops. The recommended in-game camera remains the player's normal
first/third-person camera. Avoid adding a second city ground plane or the previous
prototype's generic building geometry during integration.

This map raises visual richness using original geometry, but it does not claim
AAA photogrammetry, destructible interiors, or GTA-scale open-world streaming.
