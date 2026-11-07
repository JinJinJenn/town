# JinJinJenn Town V11

A small pink-and-mint neighborhood with a furnished cutaway cottage, 32 residents and a GPU-rendered live-mode interface.

Play at https://jinjinjenn.github.io/town/.

V11 makes the household directly controllable. Select a portrait, click clear floor or an accessible sidewalk, and choose **Go here**. Commands appear in a six-action queue; click an action to cancel it. The first player order interrupts autonomous behavior, and later orders run in order. The dining table and television have contextual actions, and clicking another resident offers Chat or Select resident.

P or 0 pauses, 1/2/3 sets speed, and Space or N selects the next resident. X/Delete cancels the selected resident's actions. Drag to pan, right-drag to rotate, and scroll or pinch to zoom. H returns home and R shows the neighborhood. There is no build mode.

The scene and visible game interface use WebGL. Contexts, portraits, text and queue controls share one atlas and one HUD batch. The HTML page only hosts the canvas and a fatal-error fallback.

## Run locally

The downloadable checkpoint includes the renderer: run `node tools/serve.mjs`, then open `http://127.0.0.1:4173/town/`. A fresh checkout needs `npm ci --ignore-scripts` and `npm run vendor` first. Do not open index.html directly with file://.

Run `npm test` for the unit suite. Install Playwright Chromium and run `node tools/review-v11.mjs` for real browser input and layout checks. Accepted screenshots and review counters are in `docs/v11-captures/`.

Read `HANDOFF.md` and `V11_CHECKPOINT.md` before continuing. Keep changes bounded and checkpoint them before expensive tests. Main deploys automatically through the established Pages workflow; deployment must be verified separately from a successful source commit.

This is a simplified live-mode prototype, not a full life simulator. Only Clover Cottage is furnished and walkable inside. Needs, jobs, relationships and build/buy systems are not implemented. Most neighborhood props remain decorative. Town is not affiliated with EA or Maxis.
