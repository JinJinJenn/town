# JinJinJenn Town V12

A pink-and-mint procedural neighborhood with a furnished cutaway cottage, 32 residents, GPU-rendered live-mode controls, player command queues and Sims-style household interactions.

Play at https://jinjinjenn.github.io/town/.

V12 expands V11's direct control instead of adding another decorative pass. Select a resident, click clear terrain for **Go here**, click supported seating for **Sit**, click the table for **Have a drink**, the television for **Watch TV**, or another resident for **Chat**. Commands share the existing six-action GPU queue and can be cancelled individually.

Socials are no longer pair-only. Conversation circles can hold several residents, new Sims can join an existing social, directed Chat keeps the requested Sim as the selected resident's preferred partner, and members can leave without collapsing the whole group.

The first functional outdoor seating pass covers Clover Cottage's bistro chairs, lounger and garden bench plus park picnic benches, chess chairs and park benches. It does not yet make every decorative chair on every procedural residential lot interactive.

P or 0 pauses, 1/2/3 changes speed, Space or N selects the next resident, and X/Delete cancels the selected resident's commands. Drag/WASD/arrows pan, right-drag or Q/E rotates, wheel/pinch zooms, H focuses home, R shows the neighborhood and F follows the selected resident. There is no build mode.

The visible game interface remains WebGL/GPU-rendered. Text, portraits, context actions and queue controls share the existing atlas and HUD batch; HTML is only the canvas host and fatal-error fallback.

## Run and verify locally

A packaged checkpoint includes the pinned renderer. Run `node tools/serve.mjs`, then open `http://127.0.0.1:4173/town/`. A fresh checkout needs `npm ci --ignore-scripts` and `npm run vendor` first. Do not use `file://`.

Run `npm test` for the unit suite. Install Playwright Chromium and run `node tools/review-v12.mjs` for the focused browser review. Accepted screenshots and counters are in `docs/v12-captures/`.

Read `HANDOFF.md` and `V12_CHECKPOINT.md` before continuing. Main deploys through the established Pages workflow and the public build is verified separately.

Town remains a simplified live-mode prototype, not a complete Sims 4 clone. Only Clover Cottage is fully furnished and walkable inside; needs, careers, relationship progression, build/buy and broad object-interaction coverage are still future work. Town is not affiliated with EA or Maxis.
