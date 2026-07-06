# build.map.md
# project: editor (6nz)
# updated: 2026-07-06T00:00:00Z  commit: 9af19a5

## Development Commands

Root `package.json` scripts:
```
npm test   →   playwright test   (runs all 12 playground Playwright smokes; see test.map.md)
```

**S18: `npm test` is now a real, populated test run** — the S17-era note that "the Playwright
suite is wired but empty" no longer applies. All 12 playground specs (`src/playground-*/app.pw.ts`)
are discovered by `playwright.config.ts`'s `testMatch: "**/*.pw.ts"`.

Per-playground dev (individual, not unified):
```
scrml dev src/playground-zero/app.scrml       run p0 (Z-motion classifier)
scrml dev src/playground-one/app.scrml        run p1 (mode machine)
scrml dev src/playground-two/app.scrml        run p2 (hjkl + z-motion buffer)
scrml dev src/playground-three/app.scrml      run p3 (CM6 probe)
scrml dev src/playground-four/app.scrml       run p4 (undo tree)
scrml dev src/playground-five/app.scrml       run p5 (vim modes on CM6)
bun src/playground-six/bridge.js              start p6 LSP bridge (port 3061) — manual dev only
scrml dev src/playground-six/app.scrml        run p6 (LSP diagnostics on CM6)
bun src/playground-eight/bridge.js            start p8 LSP bridge (port 3081) — manual dev only
scrml dev src/playground-eight/app.scrml      run p8 (completion + hover on CM6)
scrml dev src/playground-seven/app.scrml      run p7 (z-motion on CM6)
scrml dev src/playground-nine/app.scrml       run p9 (editor IR + logical traversal)
scrml dev src/playground-ten/app.scrml        run p10 (relevance navigator + §36)
scrml dev src/playground-eleven/app.scrml     run p11 (flonav — keyboard orchestration nav + modal prompt) [NEW S18]
```

Manual bridge-start above is for interactive dev only — the Playwright specs for p6/p8 spawn
their own bridge + `scrml dev` child processes in `beforeAll` (see `test.map.md`).

Per-playground smoke tests (`@playwright/test`, run individually or via `npm test`):
```
npx playwright test src/playground-zero       p0: 11 steps + 1 tracked expected-failure (Bug AI)
npx playwright test src/playground-one        p1: 12 steps
npx playwright test src/playground-two        p2: 12 steps
npx playwright test src/playground-three      p3: 10 steps
npx playwright test src/playground-four       p4: 13 steps
npx playwright test src/playground-five       p5: 18 steps
npx playwright test src/playground-six        p6: 7 steps (boots bridge + scrml dev itself)
npx playwright test src/playground-seven      p7: 17 steps
npx playwright test src/playground-eight      p8: 8 steps (boots bridge + scrml dev itself)
npx playwright test src/playground-nine       p9: 12 steps
npx playwright test src/playground-ten        p10: 15 steps
npx playwright test src/playground-eleven     p11: 18 steps [NEW S18]
```

**S18: Puppeteer fully retired.** The `NODE_PATH=.../scrml/node_modules node src/playground-N/test.js`
run command and the 11 `test.js` harnesses it invoked are gone (deleted this session — see
`test.map.md`).

## vPA Deputy Maintenance Commands  [`scripts/state.ts`]

```
bun scripts/state.ts --digest   (re)write handOffs/digest.md — session-start digest
bun scripts/state.ts --check    print "current" | "STALE" — PA session-start freshness guard
```

- `--digest` projects: HEAD SHA, dogfood scrml SHA, playground inventory, maps staleness, recent
  changelog sessions, flogence intake count. Writes to `handOffs/digest.md`.
- `--check` compares mtime of digest vs source set (src/, .claude/maps/, changelog.md,
  master-list.md, delta-log.md, flogence-intake.md, hand-off.md). Reports `STALE` if any source is
  newer than the digest.
- No deps — bun built-ins only. Run at start of each deputy tick and by PA at wrap-time when no
  deputy is up.

## Build & Release

No root-level build tooling. No Makefile, no bundler config.
Playgrounds are built and served by `scrml dev` (scrml compiler's dev server, located at `../scrml/`).
`proto/6nz-playable/index.html` is a self-contained single-file HTML — no build step.

## CI/CD Pipeline  [`.github/workflows/pages.yml`]

**Deploy playground to GitHub Pages**
Triggers: push to `main` filtering `proto/6nz-playable/**` or `.github/workflows/pages.yml`; also `workflow_dispatch`

| Stage | What it does |
|---|---|
| build | checkout → copy `proto/6nz-playable/index.html` + `README.md` to `_site/` → upload Pages artifact |
| deploy | deploys `_site/` to GitHub Pages |

Live URL: `https://bryanmaclee.github.io/6NZ/`

Note: this workflow does not run `npm test` / the Playwright suite — it only deploys the static
`proto/6nz-playable/` prototype. There is no CI job that runs the playground smokes; they are
run locally / by the PA on demand.

## Docker

No Dockerfile, no docker-compose.

## Tags
#editor #6nz #map #build #ci #github-pages #scrml #playwright #bun #vpa-deputy

## Links
- [primary.map.md](./primary.map.md)
- [infra.map.md](./infra.map.md)
- [dependencies.map.md](./dependencies.map.md)
- [test.map.md](./test.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
