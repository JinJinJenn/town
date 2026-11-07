# JinJinJenn Town V8

A cozy, procedural 3D neighborhood for JinJinJenn, with a furnished cutaway cottage, animated residents, gardens and a pink-and-mint interface.

Play: https://jinjinjenn.github.io/town/

V8 adds 36 simple-3D prop recipes and 113 placed props to the default neighborhood. These include gardening equipment, patio furniture, laundry lines, birdhouses, park play equipment, a pastry cart and cottage accessories. The new props are decorative; the existing sofa interaction remains functional.

The neighborhood currently contains 16 lots, 32 residents, one furnished home, a cafe and two parks. It opens at Clover Cottage. Camera exploration, Tour, Pause, evening lighting, resident following, seeded regeneration, cutaway walls and four saved furniture palettes are available. The scene mixes actual 3D objects with illustrated garden cards.

## Run locally

Fresh checkout: `npm ci --ignore-scripts`, `npm run vendor`, then `npm run dev`.
A packaged checkpoint already includes the renderer: run `node tools/serve.mjs`.
Open http://127.0.0.1:4173/town/ rather than opening index.html through file://.

## Tests and recovery

`npm test` runs the unit suite. `.github/workflows/v8-review.yml` prepares the exact V7 baseline and runs matched captures and regression checks. Passing screenshots and metrics are committed under `docs/v8-captures/`. Read `HANDOFF.md` and `V8_CHECKPOINT.md` before continuing. Older checkpoint branches remain preserved.

Main publishes automatically using the existing gh-pages workflow, including public-file hash verification and a live-site WebGL smoke test. Read `HOSTING.md` and check the public deployment manifest for the actual published commit.

This is an independent game experiment, not affiliated with Electronic Arts or Maxis. It is separate from JinJinJenn's profile, mods, Cafe and Farm repositories.
