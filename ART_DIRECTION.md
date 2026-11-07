# Checkpoint 03: the pastel garden concept

The approved concept is the pastel isometric neighborhood generated in this conversation. It is an art-direction reference, not a runtime background or evidence that an identical image has been achieved.

## What the reference asks of the game

The cafe is a recognizable pink landmark with striped fabric, outdoor tables, warm windows, and small storefront details. Gardens have layered foliage and dense pink, cream, and lavender flowers rather than a few isolated objects. The pond has plants, stones, a wooden bridge, and ducks. Trees have branching trunks and broad, soft, irregular crowns. Homes have cream trim, shutters, window boxes, and readable entrances. Lighting should give those shapes warmth and contact without washing the entire image out.

Preserve the playable scene: camera exploration, animated residents, deterministic plans, Clover Cottage's camera-aware cutaway, and Luca's complete sofa route. Decorations must not occupy the front gate, sidewalk, doorway, or interaction route. The concept's painterly blur is not permission to hide gameplay behind a still image or a heavy whole-screen blur.

## Implementation boundaries

The visual kit lives in `src/art.js`; `src/art-world.js` adds its independently seeded dressing to the existing world. `src/render-style.js` owns the lighting and optional full-screen contact-shading/highlight pass. The original geometry, world navigation, and home-activity modules remain separate. The home window-box pieces are compiled with the wall that owns them, so they disappear with that wall during a cutaway.

Additional geometry uses the existing instancing mechanism. The shader time advances with the simulation, and regeneration releases the added batch instances. The quality toggle in the help panel bypasses the full-screen pass. Rendering statistics separate the scene submission from the extra composite pass; they are not hardware frame-rate measurements.

No Blender export, AI image texture, external asset service, or new runtime dependency is required for this checkpoint. The approved concept can be kept with a downloaded handoff as a reference; it must never replace the real 3D view.

## Validation before publication

Run the existing unit and browser suites, plus deterministic planting-clearance and finite-geometry tests. Inspect actual browser screenshots in both rendering modes and the open cottage view. A passing test alone does not establish visual parity with the concept. Publish only after reviewing those images, then verify the public manifest and real WebGL runtime through the existing Pages workflow.

## Remaining distance to the concept

The reference is more densely composed and has painterly indirect lighting, detailed storefront glazing, more architecture variation, and more character activity than this finite prototype. This checkpoint is a deliberate real-time translation, not a claim of pixel-for-pixel reproduction. Additional art passes should retain the current interactive and performance safeguards.
