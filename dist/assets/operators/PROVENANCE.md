# Rigged operator asset

- Source: Grab3D, [Soldier](https://grab3d.com/models/characters/soldier/).
- Original download: https://grab3d.com/dl/soldier-rigged/soldier-rigged.glb
- Source license: https://grab3d.com/dl/soldier/LICENSE.txt; exact downloaded text is adjacent in LICENSE.txt.
- License: CC0 1.0 Universal public-domain dedication by Grab3D.
- Source disclosure: AI-assisted mesh/textures (Meshy), cleaned up and checked in Blender. This disclosure is preserved for redistributors.
- Retrieved: 24 October 2026.

The source is a textured 1.8m soldier with 24 skeletal joints and embedded run/walk clips. WARFRONT reduces the original 278,969 triangles to 42,000 with meshoptimizer's attribute-aware simplifier, preserving UVs, normal directions, joint indices and weights. Embedded base-color, normal, and metallic/roughness JPEG textures and both animations are retained. The shipped GLB is approximately 3.6 MiB. No character asset from Call of Duty or Grand Theft Auto is included.

Runtime additions in game/operators.js include original team identification, cosmetic class gear, rifle attachment, two-bone arm pose adjustment, procedural idle/reload movement and a fallback loading mesh. Classes share the same base model; they are not four independently scanned people. This is an optimized independently sourced character, not a claim of AAA character fidelity or motion-capture quality.
