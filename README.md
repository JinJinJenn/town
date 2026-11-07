# JinJinJenn Town V10

A small pink-and-mint neighborhood with a living 3D household and GPU-rendered controls.

Play at https://jinjinjenn.github.io/town/. Clover Cottage opens with paired conversations, two residents having drinks and Luca watching television. Neighbors visit, leave and circulate outside.

Select a person, then click the dining table or TV/sofa for a contextual activity. Space pauses; 1/2/3 set speed; H focuses home; G gathers neighbors; F follows. T or X queues/stops TV; B queues/stops a drink. R shows the neighborhood, Q/E rotate, drag pans, and scroll/pinch zooms. The portrait roster and options are GPU-rendered. There is no build mode.

## Run and check

Packaged checkpoint: run `node tools/serve.mjs`, then open http://127.0.0.1:4173/town/. Fresh Git checkout: `npm ci --ignore-scripts`, `npm run vendor`, `npm run dev`. Do not open index.html with file://.

Run `npm test` for unit tests. Install Playwright Chromium, then `node tools/review-v10.mjs` for the focused browser review. `SITE_URL` selects a public-site smoke check. Main publishes through the existing Pages workflow; passing screenshots and review data are tracked in docs/v10-captures/.

Read HANDOFF.md and V10_CHECKPOINT.md for scope and recovery. This remains a bounded prototype, not a full needs, relationship, job, building or furniture-placement simulation. Normal visible UI is WebGL; HTML only hosts the canvas and error fallback.
