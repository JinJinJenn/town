# Town V5, batch 1: Rose Mint Pop

This is a real runtime update from V4, based on Jenn's selected pink-and-mint concept image. The concept image remains aspirational: this checkpoint does not substitute an illustration for the 3D game.

## Included

The world uses selectively enriched leaf, blossom, water, roof and road colors. Neutral surfaces and dynamic resident batches are not given a blanket saturation filter. Colors are converted in the appropriate color space before writing instance buffers. The brighter material colors also apply with soft contact shading switched off.

Rose Mint Pop is the new default cottage palette. The sofa and quilt use stronger pinks, cabinetry is mint, and accent textiles are green. The three previous palettes remain available. All four palettes recolor existing instances without allocating replacement geometry. V5 saves the selection separately at `town.palette.v5`; V4 preferences are not deleted.

The pink site layout has greener primary actions, stronger rose accents, and a two-by-two palette selector. The existing header, resident search, photo mode, cottage controls and responsive layout remain in place. Version labels identify Town V5.

Garden borders gain shared 30-triangle flower meshes. Clover Cottage gains a mint bed throw, rug edging, botanical wall art, kitchen handles and jars. Wall art is attached to the cutaway wall batches. The sofa's occupied center and front gate stay clear.

## Resume and verification

The source branch is `feat/checkpoint-05-rose-mint`. Its starting point is V4 commit `e7563f24f330c69237c911b2c4983eb0671466bc`. Existing checkpoints are retained. The integrated V5 runtime is `b5e3cf81799aa80ac08e2de0abc41945b8476d4b`.

`tools/integrate-v5.mjs` is an idempotent guarded development migration, not a runtime dependency. The review workflow commits integrated files before testing. Its trigger SHA may differ from the source SHA recorded in the archive's COMMIT.txt. Review run: https://github.com/JinJinJenn/town/actions/runs/42335239132. Inspect the actual result before claiming success.

Run `node tools/serve.mjs` from the complete package, then open http://127.0.0.1:4173/town/. A fresh checkout needs `npm ci --ignore-scripts` and `npm run vendor` first. Do not open index.html through file://.

Before declaring the release live, verify the deployment workflow and public `/town/__deployment.json` manifest. Do not confuse a feature-branch save with a published build.

## Next bounded art batch

Generated transparent assets have not been integrated in this batch. Suitable next assets are a small blossom-and-leaf UI corner ornament, a clover property emblem, and separate framed botanical prints. Generate and approve individual assets, preserve true alpha, crop transparent padding, keep lettering as live text, and test them in the real page before publishing. Do not replace navigable houses or furniture with a static scene image.

Keep the site copy in complete natural sentences. Do not add mock buttons for building, relationships or furniture placement until those features actually work. Keep this repo separate from Jenn's profile, mods, Cafe and Farm projects.
