# Town V7: start at home, fill in the details

V7 opens on the central furnished Clover Cottage with its roof removed, the property panel available, and the introduction dismissed. The camera remains isometric. This is not a first-person mode or a new resident spawning system. Reloading and generating a new neighborhood return to the furnished cottage; Tour, the overview button and R still let visitors explore. The optional `?view=town` URL starts at the neighborhood overview for previews.

## Added art

The real-time cottage gains wall panelling, cornices, pleated curtains and ties, framed botanical triptychs, kitchen backsplash tiles and utensils, woven rug lines and fringe, table books and flowers, ceramic dishes and fruit, a cutting board, a side table, a storage basket, quilt stitching, slippers, bath accessories, a mirror and towels. Wall-owned decorations follow the existing camera-aware cutaways. Most details use existing shared geometry and material batches, and the sofa interaction route is unchanged.

The neighborhood gains 436 deterministic border planting patches with grass, lavender spires and small flowers. Clover Cottage receives extra stone edging, layered flower clusters, front-fence blooms, two garden lanterns and two herb beds. New beds are positioned away from the pre-existing raised planter. Existing generated V6 artwork remains in use; this release does not generate new PNG artwork or replace playable furniture with illustrations.

48 garden motes and eight small steam particles use two instanced shader-effect batches and the simulation clock. Pause freezes their motion. The existing petals checkbox and reduced-motion setting control ambient effects. Steam is hidden when the cottage is closed. Resource disposal is covered by unit tests.

## Validation and scope

The V7 review workflow runs all unit tests and five focused browser tests covering startup, actual rendering, sofa round trips, saved palettes, pause, following, photo-view exit, 390/320-pixel layouts, rotated views, regeneration, reduced motion and missing decorative textures. Inspect the final run and retained screenshots before claiming a release is validated. Software-rendered Chromium is not a hardware FPS benchmark.

Source and deployment remain in JinJinJenn/town only. The public site is https://jinjinjenn.github.io/town/. Use the public __deployment.json and successful Pages browser check to verify the live source commit. Source archives include the pinned renderer and checksums. Existing checkpoints remain intact.

Furniture placement, new furnished houses, sleeping, needs and infinite streaming are still outside this release. Keep the UI copy natural and avoid adding controls for unimplemented mechanics.
