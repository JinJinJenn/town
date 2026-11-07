# V9 work checkpoint: GPU live mode

Baseline: 9b67f1f847d9712c87770a1255a061aae1ff1b7d (V8). Branch: feat/checkpoint-09-gpu-live-mode.

The user requests a lightweight live mode with GPU glyph rendering instead of visible HTML text/buttons, smoother resident movement, and residents gathering inside Clover Cottage and circulating through the neighborhood. No build mode.

Implementation scope: one reusable glyph/icon atlas and batched GPU HUD on the existing WebGL renderer; compact selection and time controls; connected sidewalk navigation, safe interior routes and reserved social destinations; distance-driven gait and smoothly limited facing. Keep existing V8 geometry, instancing, garden atlas and mobile quality defaults. Retain the real sofa interaction, not fake furniture controls. Do not pack every resident onto a single point: stagger visits, keep the neighborhood populated, and verify all residents can visit over time.

This file records intended work, not completed features. Save code before browser checks. Test actual WebGL rendering, HUD pointer/keyboard controls, 320/390px layouts, pause/speed, social arrivals/departures, sofa use, regeneration and resource reuse. Preserve captures and update this document with actual results before publishing. Main currently remains V8 until the next checkpoint is verified and fast-forwarded. Leave other Jenn repositories unchanged.
