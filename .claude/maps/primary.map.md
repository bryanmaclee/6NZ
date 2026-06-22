# primary.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Project Fingerprint

Language:   scrml (all playground source) + vanilla JS (bridge.js, test.js harnesses, proto/)
Framework:  CodeMirror 6 (mounted in p3/p5/p6/p7/p8 via esm.sh CDN bridge)
Runtime:    Browser (scrml dev server for playgrounds; GitHub Pages for proto/)
Compiler:   scrml v0.7.0 (`80f2c190`) at `../scrml/`; Bug AD/AE fixes at `14fb0230`/`faa213c5` (newer, pending re-test)
Type:       purpose-built code editor — exploratory implementation phase, entering real-app work (flogence-editor integration)
Size:       ~97 source files (excl. node_modules, dist, .git)

## Map Index

| Map                  | Status  | Contents                                                        |
|----------------------|---------|-----------------------------------------------------------------|
| structure.map.md     | present | directory layout, 11 entry points (per-playground), harness files |
| dependencies.map.md  | present | root: @playwright/test; runtime: CM6 via CDN; bridge/LSP chain |
| schema.map.md        | present | 5 scrml enum types, 11 reactive state shapes (all playgrounds)  |
| config.map.md        | present | 3 env vars (PORT, SCRML_DIR, SCRMLTS_DIR) in bridge.js; package.json |
| build.map.md         | present | per-playground scrml dev commands; Puppeteer test ports; CI pipeline |
| error.map.md         | present | inline status-string pattern; compiler bug ledger (AA open, AG/AH unfiled) |
| test.map.md          | present | Puppeteer; 6 test.js harnesses (p5–p10); 83 total smoke assertions |
| infra.map.md         | present | GitHub Pages (proto only); no server deployment; esm.sh CDN     |
| api.map.md           | absent  | no routes or API surface                                        |
| state.map.md         | absent  | no centralized store (@reactives are per-playground only)       |
| events.map.md        | absent  | no event bus (DOM keyboard/mouse events only)                   |
| auth.map.md          | absent  | no auth                                                         |
| domain.map.md        | absent  | no domain layer yet                                             |
| style.map.md         | absent  | no design system (scoped CSS inside per-playground #{} blocks)  |
| i18n.map.md          | absent  | no i18n                                                         |
| migrations.map.md    | absent  | no database                                                     |
| jobs.map.md          | absent  | no background jobs                                              |

## File Routing

scrml enum types / reactive shapes            → schema.map.md
environment variables / config keys           → config.map.md
test patterns / smoke harnesses               → test.map.md
build commands / CI stages                    → build.map.md
directory layout / entry points               → structure.map.md
external packages / CDN libraries             → dependencies.map.md
error types / compiler bug ledger             → error.map.md
deployment / CI/CD / infra                    → infra.map.md

## Task-Shape Routing

**New playground authoring:**
1. `structure.map.md` — confirm playground number and directory convention
2. `schema.map.md` — review existing type shapes (Mode variants, NodeKind, EditKind)
3. `error.map.md` — check open compiler bugs (AA open; AD/AE resolved on newer SHA — re-test)
4. `test.map.md` — review test.js harness pattern before writing smoke test

**Debugging a failing smoke test:**
1. `test.map.md` — confirm expected count and pass status per playground
2. `error.map.md` — check bug ledger for known regressions vs current compiler
3. `structure.map.md` — confirm bridge.js startup requirement for p6/p8

**Updating for new compiler (scrml version bump):**
1. `error.map.md` — check which bugs are newly resolved (AD/AE at `14fb0230`/`faa213c5`)
2. `schema.map.md` — check if type syntax changed
3. `dependencies.map.md` — update compiler SHA reference after re-baseline
4. `test.map.md` — record new pass counts per playground

**LSP / bridge work (p6 or p8 extension):**
1. `structure.map.md` — bridge.js location and startup order
2. `config.map.md` — PORT and SCRML_DIR env vars
3. `dependencies.map.md` — CDN-loaded CM6 packages
4. `error.map.md` — LSP-related compiler bugs

**Editor architecture / design work:**
1. `structure.map.md` — understand current playground scope
2. `schema.map.md` — existing IR/mode/state shapes
3. Read `editor-architecture.md` + `master-list.md §B` for locked decisions

**Idiomatic-audit rewrite (S15 candidate work):**
1. `schema.map.md` — existing reactive state shapes to understand refactor targets
2. `error.map.md` — Bug AA status (affects `return match` vs bare `match` decision)
3. `structure.map.md` — playground file inventory for scope

## Key Facts

- **11 scrml-native playgrounds** (p0–p10), all GREEN vs scrml v0.7.0 (`80f2c190`). Re-baselined
  S14 (2026-06-19/20). p0–p4 have no test.js; p5–p10 each have Puppeteer smoke harnesses.
- **One uncommitted change**: `src/playground-ten/app.scrml` (+45/-3 — the §36 input-state
  `@cell` bridge implementing the AF by-design pattern). Not in S14 close. Needs commit + AG/AH
  bug reports to scrml. Verify against current scrml `dd5331e2` before filing.
- **Compiler is `../scrml/`** (renamed from `scrmlTS` at S200). Current dogfooded: v0.7.0
  `80f2c190`. Bug AD/AE fixed at `14fb0230`/`faa213c5` (newer than baseline). Note: AE fix
  HONORED `<engine name=N>` — the workaround in p1/p2/p5/p7/p10 (`name=` removed) must be
  checked when AE fix ships whether to re-add `name=`.
- **Bug AA is the only open 6nz-filed bug** vs current scrml. Symptom: bare tail `match` in a
  plain `function` silently dropped. Workaround: `return match` or `fn` shorthand. Low priority.
- **§36.6 by-design ruling (AF)**: `${<#id>.field}` markup interp is render-once, not reactive.
  Live editor-chrome readout requires `@cell` bridge (animationFrame loop → write @cell → interpolate).
- **LSP L1-L4 reachable** via bridge.js (p6/p8 pattern). WS port 3061 (p6), 3081 (p8).
  Capabilities covered: diagnostics (p6), completion + hover (p8). In-process browser API pending.
- **External JS constraint (corrected)**: scrml DOES have a full import system (SPEC §21/§41) for
  stdlib, relative-path JS, vendor, and cross-file scrml components. It does NOT support bare
  npm specifiers (`from 'lodash'` → E-IMPORT-005). CDN libs load via esm.sh + CustomEvent bridge.
- **Entering real-app work**: S15 direction candidates include idiomatic-audit rewrite (inbox,
  needs:action from scrml) and §36 @cell bridge commit. Flogence-editor integration is the next
  phase of editor-proper work — not yet started.
- **Two licensing zones**: `z-motion-spec/` is CC0 open source; all other code/docs are proprietary.
- **proto/6nz-playable/**: vanilla-JS prototype live on GitHub Pages — input model real, rendering arch is not.

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
