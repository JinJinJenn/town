# V8: simple 3D prop variety

Baseline: 62d900bb3ec21c0487ed74f9bf98feb10c4b078e (combined V7). Scope: add recognizable low-poly garden, cafe, park and cottage objects using the existing shared geometry/material batches. Preserve the cottage-first view, sofa path, cutaway walls, palettes and phone quality settings. No image-generation replacement for gameplay.

Work in bounded source commits. Do not overwrite earlier checkpoints or concurrent changes. Before publishing, run the unit suite and capture desktop/phone rendering and key interaction regressions. Record actual object counts and draw calls rather than claiming an unmeasured FPS gain. This initial checkpoint records intent, not completed features.
