# JinJinJenn Town V9

A cozy 3D neighborhood in live mode. Visit Clover Cottage, follow residents, gather the neighbors, change the time of day and watch them settle into conversations.

Play: https://jinjinjenn.github.io/town/

V9 replaces the normal HTML game interface with a compact GPU-rendered glyph/icon HUD. The 32 residents now travel on connected sidewalks, visit the furnished cottage in rotating groups and use a reserved sofa. The V8 world, decorative props and shared rendering assets remain.

This is a finite live-mode prototype, not a full Sims clone. It has 16 lots, one furnished home, a cafe and two parks. There is no build mode, needs system or relationship simulation. Most props remain decorative.

## Run

Packaged checkpoint with vendor/: node tools/serve.mjs, then http://127.0.0.1:4173/town/.
Fresh checkout: npm ci --ignore-scripts; npm run vendor; npm run dev.

## Controls

Drag to pan; pinch/scroll to zoom; right-drag or Q/E to rotate. Select residents by clicking them or using the GPU roster. Space pauses. 1/2/3 change speed. H returns home, R opens the overview, G gathers neighbors, F follows, and X queues sofa use or stands up. Escape opens options.

## Verify and continue

npm test runs generation, geometry and live-mode tests. node tools/review-v9.mjs runs WebGL/UI acceptance checks after Playwright Chromium is installed. Main automatically publishes through Pages with public-file hash checks and a live-mode browser check.

Read HANDOFF.md and V9_CHECKPOINT.md. Keep old checkpoints intact and save source before long tests. Independent project, not affiliated with EA or Maxis.
