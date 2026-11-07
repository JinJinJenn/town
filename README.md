# JinJinJenn Town

[Play Town](https://jinjinjenn.github.io/town/) · [Jenn's mods](https://jinjinjenn.github.io/mods/)

Town is a playable pastel neighborhood made for JinJinJenn. Explore its homes and parks, follow the residents, and open Clover Cottage to see its furnished rooms. It is a standalone Three.js project at `/town/`, separate from Jenn's mods site and the Cafe and Farm games.

## V4: a pink home for the neighborhood

The website has a rose-pink layout with responsive navigation, clearer panels, and direct links to Jenn's other work. Open Residents to search the actual population by name and find someone in town. Open photo mode to frame the scene and save a PNG without the website panels. Rendering quality and drifting-petal settings are available in the controls dialog and persist between visits.

The cottage has cream walls, curtains, books and shelves, flowers, table settings, a sofa throw, quilt details, and bathroom accessories. Flowering trees have added blossom detail, and optional petals drift through the gardens. These are rendered geometry and shader effects, not a still image behind the website.

The world has 16 lots, including Jenn's cafe and two parks, with 32 articulated residents. Clover Cottage is the one furnished home. Select Visit Clover Cottage to hide its roof and camera-facing walls. Ask Luca to sit, or select the sofa, and Luca walks through the front gate and doorway to the seat. Send Luca outside reverses the journey. Pause also freezes this interaction.

The bed and other furnishings are decorative. This prototype does not yet include furniture placement, full life-simulation AI, relationships, multiplayer or infinite generation. The world uses WebGL2; the website interface uses HTML and CSS. No Blender installation is needed.

## Run the packaged ZIP

Extract the complete archive, run `node tools/serve.mjs` in its folder, and open `http://127.0.0.1:4173/town/`. The archive includes the pinned renderer and its license, so it does not need a CDN or npm install just to run. Do not double-click index.html; JavaScript modules need an HTTP server.

## Develop from a checkout

Use Node.js 20 or later:

```sh
npm ci
npm run vendor
npm run dev
```

Three.js is pinned to 0.180.0. The vendor command copies its modules and license into vendor/. Test with:

```sh
npm test
npx playwright install chromium
npm run test:browser
```

CI splits visual, interaction and interface browser checks into separate jobs and retains source and test evidence even when a check fails. Check the run's actual conclusion rather than assuming a packaged archive passed. Screenshots from software-rendered Chromium are not real-device performance measurements.

## Controls

Drag or use WASD/arrows to move, scroll or pinch to zoom, and right-drag or Q/E to rotate. R or the home button resets the camera. Select residents or buildings in the scene. Residents in the header opens name search; selecting a person exposes Follow. Tour drifts around the neighborhood, Pause freezes the simulation, and Evening changes the lighting. New town creates another seed; the controls dialog accepts a specific seed.

Photo mode hides the site controls while preserving camera movement. Save photo exports the rendered scene, and Escape or Back to Town returns to the interface. The controls dialog also contains quality, soft shading and petal settings. Reduced-motion preference turns the petal effect off by default.

## Checkpoints and publication

`HANDOFF.md` explains the current implementation, verification and limits. `HOSTING.md` describes automatic publication from main to gh-pages. Checkpoint and backup branches preserve earlier versions. Only consider a new version live after the published deployment manifest matches its source commit and the public-site verification succeeds.

Keep new work in small committed milestones. Verify files before calling a branch a backup. Generated runtime files belong on gh-pages; maintain source and tests on main. Never overwrite Jenn's Cafe, Farm, mods or main website from this repository.

Independent project; not affiliated with Electronic Arts or Maxis.
