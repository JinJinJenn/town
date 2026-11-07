# Town hosting

Town's public address is https://jinjinjenn.github.io/town/.

## Publishing configuration

GitHub Pages is enabled with `gh-pages` as the publishing source. Creating that branch through Jenn's connected GitHub account changed the repository's `has_pages` value to `true`. The earlier instruction that the owner must manually enable Pages was incorrect for this repository.

Keep application source and development files on `main`. `.github/workflows/pages.yml` installs the locked dependencies, prepares the bundled Three.js renderer, runs the unit tests, and stages only the public game. It commits those files to `gh-pages` using a normal fast-forward push, then explicitly requests a native Pages build. Do not change the Pages source to `main`: the source checkout does not contain its generated `vendor/` folder.

The publish job has repository-scoped contents and Pages write permissions. It does not require a personal access token or changes to account permissions. The public branch retains its history; source and checkpoint branches are not force-pushed or replaced.

## Verification

Every staged build includes `__deployment.json`, which records the source commit and SHA-256 hashes of the published files. The workflow waits for that exact source commit at the public URL and checks every listed file against its hash. A successful upload alone is not evidence that the website is live.

The workflow then runs Chromium against the public website. The smoke test verifies the actual 3D runtime, 16 lots, 32 moving residents, opening Clover Cottage, and starting its sofa interaction. It records page errors, browser state, and screenshots in the `town-live-verification` Actions artifact. This software-rendered test is not a real-device performance benchmark.

## Resuming after a conversation ends

Read this file alongside `HANDOFF.md`. Inspect the latest `Deploy Town to Pages` run and its corresponding native `pages build and deployment` run before making a status claim. Hosting setup began at source commit `8703b9ba1ed5449b7f756a88d758b2c3f2bfc9cd` and custom workflow run `42322279565`. Completion should be verified from the run and public manifest, not assumed from this document.

Push future runtime changes to `main`; the workflow handles publication automatically. Documentation-only changes do not trigger deployment. Keep `.nojekyll`, the renderer modules and their license in the published output, and preserve relative URLs so the game works at `/town/`.

This hosting configuration is only for `JinJinJenn/town`. It does not modify the main profile website or the separate `mods`, Cafe, or Farm projects.
