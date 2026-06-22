# primary.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Project Fingerprint

Language:   scrml (all playground source) + vanilla JS (bridge.js, test.js harnesses, proto/)
Framework:  CodeMirror 6 (architectural target; mounted in p3/p5/p6/p7/p8 via esm.sh bridge)
Runtime:    Browser (scrml dev server for playgrounds; GitHub Pages for proto)
Compiler:   scrml v0.7.0 (`80f2c190`) at `../scrml/`; newer fixes at `14fb0230`/`faa213c5` (not yet re-baselined)
Type:       purpose-built code editor — exploratory implementation phase (11 playgrounds; no editor shell yet)
Size:       ~97 source files (excl. node_modules, dist, .git)

## Map Index

| Map                  | Status  | Contents                                                        |
|----------------------|---------|-----------------------------------------------------------------|
| structure.map.md     | present | directory layout, 12 entry points (per-playground + bridges)   |
| dependencies.map.md  | present | root: @playwright/test; runtime: CM6 via CDN; internal lineage  |
| schema.map.md        | present | 5 scrml enum types, 5 reactive state shapes from playgrounds    |
| config.map.md        | present | 2 env vars (PORT, SCRML_DIR) in bridge.js; package.json stub    |
| build.map.md         | present | per-playground scrml dev commands; CI pipeline; test.js pattern |
| error.map.md         | present | inline status-string pattern; compiler bug ledger (AA open)     |
| test.map.md          | present | Puppeteer; 6 test.js harnesses (p5/p6/p7/p8/p9/p10); 103 total |
| infra.map.md         | present | GitHub Pages (proto only); no server deployment                 |
| api.map.md           | absent  | no routes or API surface                                        |
| state.map.md         | absent  | no centralized store (@reactives are per-playground only)       |
| events.map.md        | absent  | no event bus (DOM events only)                                  |
| auth.map.md          | absent  | no auth                                                         |
| domain.map.md        | absent  | no domain layer                                                 |
| style.map.md         | absent  | no design system (scoped CSS inside playground #{} blocks)      |
| i18n.map.md          | absent  | no i18n                                                         |
| migrations.map.md    | absent  | no database                                                     |
| jobs.map.md          | absent  | no background jobs                                              |

## File Routing

types / scrml enum types / reactive shapes    → schema.map.md
environment variables / config keys           → config.map.md
test patterns / smoke harnesses               → test.map.md
build commands / CI stages                    → build.map.md
directory layout / entry points               → structure.map.md
external packages / CDN libraries             → dependencies.map.md
error types / compiler bug ledger             → error.map.md
deployment / CI/CD / infra                    → infra.map.md

## Task-Shape Routing

**New playground authoring (next scrml exploration):**
1. `structure.map.md` — confirm playground number and directory convention
2. `schema.map.md` — review existing type shapes (Mode variants, NodeKind, EditKind)
3. `error.map.md` — check open compiler bugs (AA open; AD/AE resolved on newer SHA — re-test)
4. `test.map.md` — review test.js harness pattern before writing test

**Debugging a failing smoke test:**
1. `test.map.md` — confirm expected count and pass status per playground
2. `error.map.md` — check bug ledger for known regressions vs current compiler
3. `structure.map.md` — confirm bridge.js startup requirement for p6/p8

**Updating for new compiler (scrml version bump):**
1. `error.map.md` — check which bugs are newly resolved (AD/AE at `14fb0230`/`faa213c5`)
2. `schema.map.md` — check if type syntax changed (`:>` arm arrows, `<engine>` vs `<machine>` already migrated)
3. `dependencies.map.md` — update compiler SHA reference after re-baseline
4. `test.map.md` — record new pass counts per playground

**Editor architecture / design work:**
1. `structure.map.md` — understand current playground scope
2. `schema.map.md` — see existing IR/mode/state shapes
3. Read `editor-architecture.md` + `master-list.md §B` for locked decisions

**LSP / bridge work (p6 or p8 extension):**
1. `structure.map.md` — bridge.js location and startup order
2. `config.map.md` — PORT and SCRML_DIR env vars
3. `dependencies.map.md` — CDN-loaded CM6 packages
4. `error.map.md` — LSP-related compiler bugs

**Spec work (z-motion spec):**
1. `structure.map.md` — z-motion-spec/ layout
2. Read `z-motion-spec/SPEC.md` v0.5 directly
3. Check `non-compliance.report.md` — z-motion-spec/README.md is stale

**Don't know which (open-ended task brief from user):**
1. Read `primary.map.md` (this file) in full
2. Read **Task-Shape Routing** above and self-classify
3. If classification is genuinely unclear, surface to PA before consuming further context

## Use feedback loop

When this map's content was load-bearing for a dispatch outcome, the agent's final report should
note **"map content consulted: [list of map files]; load-bearing finding: [one sentence]"**. When
the map content was NOT useful, report **"maps consulted but not load-bearing"** so PA can
diagnose whether the wrong maps were named OR the map granularity is wrong.

## Key Facts

- **11 scrml-native playgrounds** (`src/playground-zero` through `playground-ten`), all GREEN
  vs scrml v0.7.0 (`80f2c190`). Re-baselined S14 (2026-06-19/20). p0–p4 have no test.js;
  p5–p10 each have a Puppeteer test.js harness. See `master-list.md §A` for per-playground details.
- **Compiler is `../scrml/`**, not `scrmlTS` (renamed S200). Current dogfooded version: v0.7.0
  `80f2c190`. Fixes for Bug AD/AE landed at `14fb0230`/`faa213c5` — newer than baseline; p1/p2/p5/p7/p10
  need a re-test pass to confirm. No migration needed for `<engine name=...>` (AE fix honored `name=`).
- **Compiler Bug AA is the only open 6nz-filed bug** vs current scrml. Symptom: bare tail `match`
  in a plain `function` is silently dropped. Workaround: `return match`. Low priority (lint regression).
- **External JS constraint**: scrml has no **npm/bare-specifier** `import` (`from 'lodash'` →
  `E-IMPORT-005`) — but it DOES have a full Import System (SPEC §21/§41): stdlib (`scrml:NAME`),
  relative-path JS, `vendor:`, and cross-file scrml component/engine splitting. npm/CDN libraries
  (CM6 etc.) still load at runtime via esm.sh CDN + CustomEvent bridge triggered by `^{ fn() }`. No
  version pinning. (S15 correction — prior "no source-level import" was wrong; see master-list §G.)
- **LSP L1-L4 reachable** via bridge.js (p6/p8 pattern). Capabilities: outline, hover, completions,
  go-to-def, diagnostics, signature help, code actions. In-process browser API still pending.
- **AF ruling (§36.6 by-design)**: `${<#id>.field}` markup interp is render-once, not reactive.
  Live editor chrome readout requires `@cell` bridge (animationFrame loop → write @cell → interpolate cell).
- **`proto/6nz-playable/`** is a vanilla-JS prototype deployed to GitHub Pages — NOT the real
  editor architecture. Input model is real; rendering architecture is not.
- **Two licensing zones**: `z-motion-spec/` is CC0 open source; all other 6nz code and docs are proprietary.

## Tags
#editor #6nz #map #primary #scrml #playgrounds #z-motion #exploratory-implementation

## Links
- [structure.map.md](./structure.map.md)
- [dependencies.map.md](./dependencies.map.md)
- [schema.map.md](./schema.map.md)
- [config.map.md](./config.map.md)
- [build.map.md](./build.map.md)
- [error.map.md](./error.map.md)
- [test.map.md](./test.map.md)
- [infra.map.md](./infra.map.md)
- [non-compliance.report.md](./non-compliance.report.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
