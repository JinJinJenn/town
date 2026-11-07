# Town V6: illustrated gardens and a living 3D neighborhood

## Resume here

Source belongs to `JinJinJenn/town`. The public game is https://jinjinjenn.github.io/town/ and the runtime art gallery is https://jinjinjenn.github.io/town/assets/v6/. Do not change Jenn's separate profile, mods, Cafe or Farm repositories.

V6 starts from V5 commit `4f354acd19918c68f3fc57726ea06078dc0d479b`. The mixed-media work is on `feat/checkpoint-06-mixed-media`. Integrated source is `46e4523364d5d9a503772515a3646182e946587b`; the release may add documentation afterward without changing the tested runtime. Preserve older checkpoints and downloaded thread/source kits.

## Implemented scope

The neighborhood still has 16 lots, 32 articulated residents, a cafe, two parks, and one furnished cutaway cottage. Buildings, couches, other furniture and people remain real 3D. Luca's sofa route, camera controls, Tour, Pause, evening lighting, deterministic regeneration, four saved furniture palettes, resident search/following and photo-view exit remain implemented. Photo view is not an image-file export feature.

V6 adds 64 illustrated hedge cards, 32 planter cards and three decorative blank garden noticeboards, rendered in three instanced batches. Cards face the camera while their bottom centers stay anchored to garden positions. Alpha testing writes depth only for visible artwork; 3D buildings can occlude them. They are decorative and are not added to resident navigation or furniture interactions.

Five generated art derivatives are used: hedge, planter, sign, UI corner and petal. The existing 96 animated petals now sample the cropped painted petal texture. Pause and reduced-motion behavior are retained. Floral corner art decorates live UI panels without intercepting clicks. Help has an illustrated-garden toggle saved in localStorage as `town.illustrated.v6`; drifting petals retain their separate toggle.

Artwork loads asynchronously from the same origin. Failed decorative textures must not prevent the core 3D game from booting. Shared textures survive world regeneration; per-world card geometries/materials/instances and replacement petal geometry are disposed when the world is replaced.

## Asset provenance and limits

The assets are compact WebP derivatives of generated PNG artwork from this thread. They are 96px-class runtime textures for small rendered props, with a 68x46 petal, NOT full-resolution originals. Original PNGs and the complete thread art kit remain in the user's downloaded archives. `assets/v6/manifest.json` identifies sources and SHA-256 hashes. Do not claim all source artwork has been published.

The complete cottage, gate and bench illustrations remain concept/source artwork rather than replacements for playable 3D objects. This release does not implement furniture placement, additional furnished homes, sleeping, needs, relationships, vehicles or infinite streaming. Do not add fake controls implying those features exist.

## Code map

- `src/v6-media.js`: deterministic card placement, shared texture loading, instanced billboard shader, illustrated-petal integration and cleanup.
- `src/v6.css`: floral UI ornament, pink header styling and gallery-link presentation.
- `assets/v6/`: five WebP images, their manifest, and the runtime-art gallery.
- `src/main.js`: media lifecycle, toggle, evening tint, regeneration and debug stats.
- `src/v5-look.js`, `src/home-polish.js`: Rose Mint materials, shared flowers, cottage detail and four palettes.
- `src/v4-world.js`: existing instanced petal animation and reduced-motion behavior.
- `src/v4-ui.js`: residents, photo view, and saved palette controls.
- `tests/v6.test.mjs`: deterministic layout and binary artwork checks.
- `tests/browser/v6.spec.js`: production rendering, sofa/palette/follow/photo regression, phone layout, media toggle, rotation, resource reuse, gallery and load-failure fallback.

`tools/integrate-v6.mjs` is an idempotent development migration, not a browser dependency. Native application source is already committed. The review workflow can make a bot integration commit before testing; its trigger SHA differs from the tested source recorded in `COMMIT.txt`.

## Run, review and publish

Packaged checkpoint: `node tools/serve.mjs`, then http://127.0.0.1:4173/town/. The package includes the pinned renderer. Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`. Do not open index.html using file://.

`npm test` runs 26 unit tests. Install Chromium with `npx playwright install --with-deps chromium`, then run `npx playwright test tests/browser/v6.spec.js` for six focused V6 browser tests. Inspect their actual run results and screenshots; a source commit is not evidence of a passing test. Software-rendered Chromium does not certify hardware frame rates or every legacy regression suite.

Review run: https://github.com/JinJinJenn/town/actions/runs/42343874501. Artifacts include actual tested source, bundled renderer, screenshots, `COMMIT.txt`, and checksums even if a test fails.

The established Pages workflow stages `src/`, `assets/`, `vendor/`, index.html and style.css, pushes the generated site to gh-pages, explicitly requests a Pages build, verifies public commit/file hashes, and runs a live WebGL smoke test. Read `HOSTING.md`; do not require the user to enable Pages again. The public `/town/__deployment.json` is the source of truth for the deployed source SHA. Confirm it and the final Pages result before calling a release live.

Keep working in bounded, committed batches. Do not overwrite old checkpoint branches, force-push another project, or label concept art as live gameplay.
