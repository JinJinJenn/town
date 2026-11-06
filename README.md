# JinJinJenn Town 🏡

A cozy, procedurally generated 3D neighborhood and interactive little-world experience for [JinJinJenn](https://jinjinjenn.github.io/).

**Planned site:** https://jinjinjenn.github.io/town/

## Vision

Explore an endlessly expanding, pastel low-poly town filled with homes, cafes, gardens, parks, and residents going about their lives. Watch the town like a screensaver, or interact: explore houses, follow residents, decorate lots, and discover Jenn's mods and games.

Town is a standalone project, separate from Jenn's Cafe and Farm. The website can link to it without embedding its source.

## Technical direction

- **Runtime:** Three.js with a WebGL2-first browser target; evaluate WebGPU later.
- **World:** Deterministic seeded generation, streets first, then blocks, lots, houses, interiors, and decorations.
- **Streaming:** Chunk-based loading/unloading with Web Workers for generation and a bounded main-thread GPU upload budget.
- **Rendering:** Shared geometry, instancing, LODs, cozy lighting, and lightweight animated environment shaders.
- **Residents:** Varied modular characters, articulated animations, daily activities, and scalable simulation.
- **Art pipeline:** Blender + bpy modular asset kit, exported to browser-friendly assets with useful placement metadata.
- **Interaction:** Isometric camera tour, free exploration, selection, cutaway houses, decorating, day/night controls.
- **Website:** Responsive presentation and an in-game portal to Jenn's Sims 4 mods, projects, and devlog.

These are goals, not claims about completed features.

## First playable milestone

- [ ] Browser scene boots locally and from GitHub Pages.
- [ ] One attractive generated neighborhood with streets, lots, gardens, and several house archetypes.
- [ ] A recognizable cafe landmark.
- [ ] Animated residents with varied appearances and simple routines.
- [ ] Camera tour and manual exploration.
- [ ] Basic house selection and decorating.
- [ ] Deterministic seed and chunk streaming.
- [ ] Mobile-friendly layout and sensible performance budgets.

## Recovery note

An earlier ChatGPT Work session on November 6, 2026 reported a prototype with generated neighborhoods, furnished houses, articulated residents, a Blender kit, decorating, and portfolio UI. That session reached its conversation limit before its source could be verified in this repository. **Do not assume the previous prototype has been recovered or committed here.** Preserve any recovered files separately and audit them before integration.

The earlier experiments originated around `TrentSterling/jenns-cafe`; Town should remain independent.

## Local development

The runtime, build commands, and deployment workflow will be documented once source files are added. Do not assume a working build exists yet.

## Publishing

GitHub Pages should deploy this repository at `/town/`. Use relative URLs or a configurable base path for all assets so it works both locally and on GitHub Pages.

## Attribution

Independent fan-created cozy life-simulation project. Not affiliated with Electronic Arts or Maxis.
