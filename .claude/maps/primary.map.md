# primary.map.md
# project: editor (6nz)
# updated: 2026-07-06T00:00:00Z  commit: 9af19a5

## Project Fingerprint

Language:   scrml (all playground source) + TypeScript (Playwright specs `*.pw.ts`, shared helper
            `src/_pw/scrml-dev.ts`, `scripts/state.ts` — bun-runnable, no emit) + vanilla JS (bridge.js)
Framework:  CodeMirror 6 (architectural target; mounted in p3/p5/p6/p7/p8 via esm.sh bridge)
Runtime:    Browser (scrml dev server for playgrounds; GitHub Pages for proto) + Bun (scripts/state.ts
            maintenance tool) + Node (Playwright test runner)
Compiler:   scrml v0.7.0 (`80f2c190`) at `../scrml/`; newer fixes at `14fb0230`/`faa213c5` (last
            directly verified by this mapper; `master-list.md`'s S18 entry references further scrml
            source movement — read that file directly for the current dogfood SHA before relying on
            a specific version here)
Type:       purpose-built code editor — exploratory implementation phase (12 playgrounds; no editor
            shell yet); playground-eleven is the first flogence-integration prototype
Size:       ~120 source files (excl. node_modules, dist, .git)

## Map Index

| Map                  | Status  | Contents                                                        |
|----------------------|---------|-------------------------------------------------------------------|
| structure.map.md     | present | directory layout, 13 entry points, src/_pw/, playwright.config.ts |
| dependencies.map.md  | present | root: @playwright/test only (Puppeteer fully removed S18); CM6 CDN |
| schema.map.md        | present | 8 scrml enum types, 6 reactive state shapes, engine table (not re-scanned this pass — playground-eleven's new NodeKind/Mode enum usage not yet reflected there) |
| config.map.md        | present | 2 env vars (PORT, SCRML_DIR) in bridge.js; package.json stub    |
| build.map.md         | present | per-playground scrml dev commands incl. p11; `npm test` now live (was wired-but-empty pre-S18) |
| error.map.md         | present | inline status-string pattern; compiler bug ledger (not re-scanned this pass) |
| test.map.md          | present | Playwright (`@playwright/test`); 12 `app.pw.ts` specs (p0–p11); Puppeteer retired S18 |
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
test patterns / Playwright smoke specs        → test.map.md
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
4. `test.map.md` — review the `app.pw.ts` Playwright spec pattern + shared `src/_pw/scrml-dev.ts` helper before writing a new spec

**Debugging a failing smoke test:**
1. `test.map.md` — confirm expected step count and pass status per playground (Playwright, not Puppeteer)
2. `error.map.md` — check bug ledger for known regressions vs current compiler
3. `structure.map.md` — confirm whether the playground needs bridge.js (p6/p8; the spec now boots it itself)

**Updating for new compiler (scrml version bump):**
1. `error.map.md` — check which bugs are newly resolved (AD/AE at `14fb0230`/`faa213c5`)
2. `schema.map.md` — check if type syntax changed (`:>` arm arrows, `<engine>` vs `<machine>` already migrated; `<each>`/`<match>`/`<empty>` Tier-1 idioms now canonical)
3. `dependencies.map.md` — update compiler SHA reference after re-baseline
4. `test.map.md` — record new pass counts per playground; watch p0's `test.fail()` Bug AI case for an unexpected pass

**Editor architecture / design work:**
1. `structure.map.md` — understand current playground scope
2. `schema.map.md` — see existing IR/mode/state shapes + engine table
3. Read `editor-architecture.md` + `master-list.md §B` for locked decisions

**LSP / bridge work (p6 or p8 extension):**
1. `structure.map.md` — bridge.js location and startup order
2. `config.map.md` — PORT and SCRML_DIR env vars
3. `dependencies.map.md` — CDN-loaded CM6 packages
4. `test.map.md` — how the Playwright spec now boots bridge.js + scrml dev itself (SCRML_DIR resolution across worktree layouts)
5. `error.map.md` — LSP-related compiler bugs
6. `schema.map.md` — LspPhase enum shape for p6 vs p8

**Flogence-integration prototype work (playground-eleven and successors):**
1. `structure.map.md` — playground-eleven's role as first flogence-integration artifact
2. `src/playground-eleven/app.scrml` directly — floView-shaped node tree, modal `<engine>`, auto-collapse pattern
3. `test.map.md` — the 18-step `app.pw.ts` smoke pattern for this playground
4. `infra.map.md` § Cross-repo Correspondents — flogence channel context

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

- **12 scrml-native playgrounds** (`src/playground-zero` through `playground-eleven`). p0–p10 all
  GREEN vs scrml v0.7.0 (`80f2c190`), re-baselined S14 (2026-06-19/20). `playground-eleven` (flonav)
  is NEW S18 — the first flogence-integration prototype (floView-shaped node tree + hjkl nav +
  cursor-driven auto-collapse + a NORMAL/INSERT/VISUAL modal `<engine>`); its 17-step `app.pw.ts`
  smoke is green. See `master-list.md §A` for per-playground details.
- **S18: Puppeteer-to-Playwright migration COMPLETE.** All 12 playground smokes are now
  `@playwright/test` spec files (`app.pw.ts`), colocated with each playground's `app.scrml`. The 11
  original `test.js` Puppeteer harnesses were DELETED. `npm test` (= `playwright test`) is now a
  real, populated gate — the prior S17 finding that the Playwright suite was "wired but empty" is
  RESOLVED (see `non-compliance.report.md`). A shared helper (`src/_pw/scrml-dev.ts`,
  `bootScrmlDev`/`killScrmlDev`) replaces the hand-rolled spawn/readiness logic every old harness
  duplicated. `playwright.config.ts` (root) drives discovery; CM6 playgrounds (p3/p5/p6/p7/p8)
  carry a `page.route` esm.sh resilience shim (pins `@codemirror/view` range requests to `6.43.0`
  on an esm.sh 5xx).
- **Compiler is `../scrml/`**, not `scrmlTS` (renamed S200). This map's Project Fingerprint reflects
  v0.7.0 `80f2c190` as last directly verified; `master-list.md`'s S18 entry references further scrml
  movement (a 0.7.1-era SHA) from ongoing dogfooding — read that file directly for the current
  source SHA before relying on a specific version here. Fixes for Bug AD/AE landed at
  `14fb0230`/`faa213c5`.
- **Compiler Bug AA is open** vs current scrml. Symptom: bare tail `match` in a plain `function` is
  silently dropped. Workaround: `return match`. Low priority (lint regression).
- **Bug AI is tracked as a Playwright `test.fail()` expected-failure case in `playground-zero/app.pw.ts`**
  (was a Puppeteer `xfail()` helper call before S18). Symptom: `<each>/<empty>` fallback is not torn
  down on the empty→non-empty transition. Filed 2026-06-24, still open. If scrml fixes it, the
  `test.fail()` case will unexpectedly PASS and flip the whole suite red — the signal to delete the
  annotation and fold the check into the main step sequence.
- **S16 idiomatic rewrites (all 11 pre-existing playgrounds):** List renders use Tier-1
  `<each in=… key=…>` + `<empty>` structural element (p0/p1/p4/p6/p9/p10). Mode badges use
  `<match for=Mode on=@mode>` state-child blocks (p1/p2/p4/p5/p7/p10). Async lifecycle string-flags
  converted to typed enums: `CmPhase` (p3 typed cell), `LspPhase` (p6/p8 engines), `Mode` (p4 engine
  — was string). See `schema.map.md` for full enum shapes and engine table.
- **External JS constraint**: scrml has no **npm/bare-specifier** `import` (`from 'lodash'` →
  `E-IMPORT-005`) — but it DOES have a full Import System (SPEC §21/§41): stdlib (`scrml:NAME`),
  relative-path JS, `vendor:`, and cross-file scrml component/engine splitting. npm/CDN libraries
  (CM6 etc.) still load at runtime via esm.sh CDN + CustomEvent bridge triggered by `^{ fn() }`. No
  version pinning at the app layer (the test-level esm.sh shim is a Playwright-only network patch).
- **LSP L1-L4 reachable** via bridge.js (p6/p8 pattern). Capabilities: outline, hover, completions,
  go-to-def, diagnostics, signature help, code actions. In-process browser API still pending.
- **AF ruling (§36.6 by-design)**: `${<#id>.field}` markup interp is render-once, not reactive.
  Live editor chrome readout requires `@cell` bridge (animationFrame loop → write @cell → interpolate cell).
  p10 was rewritten to the canonical animationFrame `@cell` bridge in S15.
- **vPA deputy adopted S15 (2026-06-22).** Contract: `vpa.md` (root). Tool: `bun scripts/state.ts --digest|--check`.
  Communication surfaces: `handOffs/{delta-log,deputy-state,flogence-intake,digest}.md`.
- **flogence is a cross-repo correspondent** (`../flogence/`). 6nz is becoming its native editor +
  kb-nav platform; `playground-eleven` is the first concrete integration artifact. As of S18 the
  plan is amended to integrate 6nz editing ideas into flogence first (standalone editor deferred) —
  see `master-list.md` directly for the current strategic framing. Inbound flogence messages arrive
  via `handOffs/incoming/`; deputy auto-intakes bounded flogence messages (F4) unattended.
- **`proto/6nz-playable/`** is a vanilla-JS prototype deployed to GitHub Pages — NOT the real
  editor architecture. Input model is real; rendering architecture is not.
- **Two licensing zones**: `z-motion-spec/` is CC0 open source; all other 6nz code and docs are proprietary.

## Tags
#editor #6nz #map #primary #scrml #playgrounds #playwright #z-motion #exploratory-implementation #vpa-deputy #flogence

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
