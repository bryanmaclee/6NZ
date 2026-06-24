# primary.map.md
# project: editor (6nz)
# updated: 2026-06-24T00:00:00Z  commit: 2ab2f4d

## Project Fingerprint

Language:   scrml (all playground source) + vanilla JS (bridge.js, test.js harnesses, proto/) + TypeScript (scripts/state.ts — bun-runnable, no emit)
Framework:  CodeMirror 6 (architectural target; mounted in p3/p5/p6/p7/p8 via esm.sh bridge)
Runtime:    Browser (scrml dev server for playgrounds; GitHub Pages for proto) + Bun (scripts/state.ts maintenance tool)
Compiler:   scrml v0.7.0 (`80f2c190`) at `../scrml/`; newer fixes at `14fb0230`/`faa213c5` (not yet re-baselined)
Type:       purpose-built code editor — exploratory implementation phase (11 playgrounds; no editor shell yet)
Size:       ~115 source files (excl. node_modules, dist, .git)

## Map Index

| Map                  | Status  | Contents                                                        |
|----------------------|---------|-----------------------------------------------------------------|
| structure.map.md     | present | directory layout, 12 entry points, scripts/ + vpa.md + handOff seams |
| dependencies.map.md  | present | root: @playwright/test; scripts/state.ts bun tool (no deps); CM6 CDN |
| schema.map.md        | present | 8 scrml enum types (incl. CmPhase/LspPhase×2 new S16), 6 reactive state shapes, engine table |
| config.map.md        | present | 2 env vars (PORT, SCRML_DIR) in bridge.js; package.json stub    |
| build.map.md         | present | per-playground scrml dev commands; vPA deputy bun commands; CI  |
| error.map.md         | present | inline status-string pattern; compiler bug ledger (AA open + Bug AI new S17) |
| test.map.md          | present | Puppeteer; 11 test.js harnesses (p0–p10); ~131 total checks; p0 xfail (Bug AI) |
| infra.map.md         | present | GitHub Pages (proto only); vPA deputy system; cross-repo table  |
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
build commands / CI stages / bun maintenance  → build.map.md
directory layout / entry points               → structure.map.md
external packages / CDN libraries / bun tools → dependencies.map.md
error types / compiler bug ledger             → error.map.md
deployment / CI/CD / infra / vPA deputy       → infra.map.md
vPA deputy contract + functions               → infra.map.md (also: read vpa.md directly)
flogence channel / intake queue               → infra.map.md § Cross-repo Correspondents

## Task-Shape Routing

**New playground authoring (next scrml exploration):**
1. `structure.map.md` — confirm playground number and directory convention
2. `schema.map.md` — review existing type shapes (Mode variants, NodeKind, EditKind, CmPhase, LspPhase)
3. `error.map.md` — check open compiler bugs (AA open; AD/AE resolved on newer SHA — re-test)
4. `test.map.md` — review test.js harness pattern before writing test

**Debugging a failing smoke test:**
1. `test.map.md` — confirm expected count and pass status per playground
2. `error.map.md` — check bug ledger for known regressions vs current compiler
3. `structure.map.md` — confirm bridge.js startup requirement for p6/p8

**Updating for new compiler (scrml version bump):**
1. `error.map.md` — check which bugs are newly resolved (AD/AE at `14fb0230`/`faa213c5`)
2. `schema.map.md` — check if type syntax changed (`:>` arm arrows, `<engine>` vs `<machine>` already migrated; `<each>`/`<match>`/`<empty>` Tier-1 idioms now canonical)
3. `dependencies.map.md` — update compiler SHA reference after re-baseline
4. `test.map.md` — record new pass counts per playground

**Editor architecture / design work:**
1. `structure.map.md` — understand current playground scope
2. `schema.map.md` — see existing IR/mode/state shapes + engine table
3. Read `editor-architecture.md` + `master-list.md §B` for locked decisions

**LSP / bridge work (p6 or p8 extension):**
1. `structure.map.md` — bridge.js location and startup order
2. `config.map.md` — PORT and SCRML_DIR env vars
3. `dependencies.map.md` — CDN-loaded CM6 packages
4. `error.map.md` — LSP-related compiler bugs
5. `schema.map.md` — LspPhase enum shape for p6 vs p8

**Spec work (z-motion spec):**
1. `structure.map.md` — z-motion-spec/ layout
2. Read `z-motion-spec/SPEC.md` v0.5 directly
3. Check `non-compliance.report.md` — z-motion-spec/README.md is stale

**vPA deputy boot / maintenance:**
1. Read `vpa.md` (the contract) directly
2. `infra.map.md` — surface partition, communication files, worktree model
3. `build.map.md` — bun scripts/state.ts --digest / --check commands
4. `structure.map.md` — handOffs/ seam file layout

**Flogence integration / intake:**
1. `infra.map.md` § Cross-repo Correspondents + § vPA Deputy System / F4
2. `structure.map.md` — handOffs/incoming/ and flogence-intake.md location
3. Read `vpa.md` § F4 directly for the exact F4 boundary

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
  vs scrml v0.7.0 (`80f2c190`). Re-baselined S14 (2026-06-19/20). All 11 playgrounds now have
  Puppeteer test.js harnesses (p0–p4 added S17; p5–p10 existed from S14). See `master-list.md §A`
  for per-playground details.
- **Compiler is `../scrml/`**, not `scrmlTS` (renamed S200). Current dogfooded version: v0.7.0
  `80f2c190`. Fixes for Bug AD/AE landed at `14fb0230`/`faa213c5` — newer than baseline; p1/p2/p5/p7/p10
  need a re-test pass to confirm. No migration needed for `<engine name=...>` (AE fix honored `name=`).
- **Compiler Bug AA is open** vs current scrml. Symptom: bare tail `match` in a plain `function` is
  silently dropped. Workaround: `return match`. Low priority (lint regression).
- **Bug AI (new S17) is tracked as an xfail in p0/test.js.** Symptom: `<each>/<empty>` fallback is
  not torn down on the empty→non-empty transition. Filed 2026-06-24. If scrml fixes it, p0/test.js
  check 6 will flip to XPASS and the suite will fail — prompting removal of the xfail.
- **S16 idiomatic rewrites (all 11 playgrounds):** List renders now use Tier-1 `<each in=… key=…>` +
  `<empty>` structural element (p0/p1/p4/p6/p9/p10). Mode badges now use `<match for=Mode on=@mode>`
  state-child blocks (p1/p2/p4/p5/p7/p10). Async lifecycle string-flags converted to typed enums:
  `CmPhase` (p3 typed cell), `LspPhase` (p6/p8 engines), `Mode` (p4 engine — was string). See
  `schema.map.md` for full enum shapes and engine table.
- **External JS constraint**: scrml has no **npm/bare-specifier** `import` (`from 'lodash'` →
  `E-IMPORT-005`) — but it DOES have a full Import System (SPEC §21/§41): stdlib (`scrml:NAME`),
  relative-path JS, `vendor:`, and cross-file scrml component/engine splitting. npm/CDN libraries
  (CM6 etc.) still load at runtime via esm.sh CDN + CustomEvent bridge triggered by `^{ fn() }`. No
  version pinning. (S15 correction — prior "no source-level import" was wrong; see master-list §G.)
- **LSP L1-L4 reachable** via bridge.js (p6/p8 pattern). Capabilities: outline, hover, completions,
  go-to-def, diagnostics, signature help, code actions. In-process browser API still pending.
- **AF ruling (§36.6 by-design)**: `${<#id>.field}` markup interp is render-once, not reactive.
  Live editor chrome readout requires `@cell` bridge (animationFrame loop → write @cell → interpolate cell).
  p10 was rewritten to the canonical animationFrame `@cell` bridge in S15.
- **vPA deputy adopted S15 (2026-06-22).** Contract: `vpa.md` (root). Tool: `bun scripts/state.ts --digest|--check`.
  Deputy runs on `deputy-maint` branch in sibling worktree `../6nz-deputy-maint`. Communication surfaces:
  `handOffs/{delta-log,deputy-state,flogence-intake,digest}.md`. PA integrates via `git merge deputy-maint`.
- **flogence is a new cross-repo correspondent** (`../flogence/`). 6nz is becoming its native editor
  + kb-nav platform. Flogence beta testers imminent. Inbound messages via `handOffs/incoming/`; deputy
  auto-intakes bounded flogence messages (F4) unattended between sessions.
- **`proto/6nz-playable/`** is a vanilla-JS prototype deployed to GitHub Pages — NOT the real
  editor architecture. Input model is real; rendering architecture is not.
- **Two licensing zones**: `z-motion-spec/` is CC0 open source; all other 6nz code and docs are proprietary.

## Tags
#editor #6nz #map #primary #scrml #playgrounds #z-motion #exploratory-implementation #vpa-deputy #flogence

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
