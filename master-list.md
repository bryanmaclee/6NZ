# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-07-06 (**S18** — **(1) Playwright migration COMPLETE** — all 11 playground smokes `test.js`→`app.pw.ts` (`@playwright/test`); old `test.js` deleted; `npm test` is the gate; CM6 playgrounds carry a `page.route` esm.sh shim. **(2) `playground-eleven` (flonav) BUILT** — first flogence-integration prototype: hjkl nav + auto-collapse + NORMAL/INSERT/VISUAL modal `<engine>` over a floView-shaped tree; 17-step smoke green. **(3) Plan amended** — integrate 6nz editing ideas into flogence first (standalone editor deferred); flogence ACCEPTED (nav-first, top-level router, harness — QUEUED/warm). **(4) scrml dogfooding** — filed 5 `<each>`/input-layer findings; re-verified vs current source (0.7.1 @ `59dc5287`): F1/F2/F5 FIXED, **F3 STILL broken** (each-item factory `return _itemFrag.firstChild` — re-filed), F4 dispatched; also filed scrml-dev **live-reload-broken**. Global `scrml` binary STALE (0.7.0/`caa8803b`) vs source 0.7.1 — consider updating. Full sweep 13/13, 0 failed. See §F.) (S17 — **closed the p0–p4 smoke-test gap:** added `test.js` puppeteer smokes to playground-zero/one/two/three/four (5 worktree agents, landed). Sweep: p1 12/0 · p2 13/0 · p3 10/0 · p4 15/0 (incl. the §4.17 `${}`-in-tree regression guard) · p0 13/0 + **1 XFAIL**. The p0 xfail caught **NEW Bug AI** (`<each>/<empty>` fallback not torn down on empty→non-empty; R26-verified @ scrml `2dd135ff` via 13-line minimal repro; filed to scrml `...-0719-...`, see §F). All 11 playgrounds now have smokes. Prior S16 — **idiomatic-audit rewrite EXECUTED + pushed (`721660a`):** all 4 tiers — `<each>` sweep 0/11→6/11, render-per-state→`<match for=Mode>`, async string-flag→`<engine>`/typed-cell. 83/83 smoke + p0–p4 probe-green; scrml build moved 4× during the session (`a2137214`→`7c01b22a`), all re-verified. 3 new codegen findings sent to scrml (§4.17 `<pre>${}` raw-content drop; arrow-form `<engine>` no init-set; bare `.Variant` in ternary→string). Prior S15 — **strategic shift: 6nz → real app work, integrating into flogence as native editor + kb-nav platform** (beta testers imminent). **vPA deputy ADOPTED** (`vpa.md`) + flogence channel + F4 autonomous-inbox autonomy stood up pre-surge. p10 §36 → canonical `animationFrame` bridge; AG/AH NOT-REPRODUCED. **Reconciled a parallel S15 fork (merge):** folded in its cold maps refresh + currency sweep (scrmlTS→scrml across README/editor-README/p6/p8), Bug-AB loop closure + engine-`name=`/AE re-test green vs `d299798`, and the source-level-import-claim correction (scrml DOES have cross-file import — SPEC §21/§41).)

**Status:** Exploratory implementation phase, dogfood mode. **All ELEVEN scrml-native playgrounds GREEN against scrml v0.7.0 (`80f2c190`, S209)** — p0–p9 re-baselined (p3 CM6 ✓, p5 18/18, p6 7/7, p7 17/17, p8 9/9, p9 13/13; p0/p1/p2/p4 event-fix runtime-probed) + **playground-ten REBUILT (relevance-region navigator + §36 input-state), 19/19 runtime smoke.** The compiler is now `scrml` (renamed from `scrmlTS` at S200; dir `../scrml/`). The S14 re-baseline (p0–p9) found NO compiler bugs (all adopter-migration debt). **The p10 rebuild surfaced 2 NEW compiler bugs (AD, AE) + 1 §36 question (AF)** + recovered/re-verified the lost S13 p10 bug batch (X/Y/Z/AB/AC FIXED, AA open) — see §F. Bugs AD/AE/AF sent to scrml 2026-06-20. Migrations applied: `match` subject typing (E-TYPE-025 → annotate), `=>`→`:>` arm arrows, `const @x`→`const <x>`, `<machine>`→`<engine>` + explicit `initial=`, event-threading arrow-form (S96 revert), bridge LSP path (S200 rename). All S11-era bugs now resolved on scrml's side: **P/Q (fixed), R (retracted), M/N/O (fixed), V (fixed S139), S + W (VERIFIED fixed S14 via direct repro against v0.7.0 — W: `(2+3)*4` preserves parens; S: `return not` → `return null`)**; L/T/U deferred to M6 native parser. Editor scaffolding proper still waiting on in-process compiler API.

> **S13-origin provenance (reconciled at the 2026-06-20 fork merge; CONFIRMED by scrml reply `2026-06-20-1709`, S210).** The lost S13 batch was fixed upstream: X `e50ee9c2`, Z `88071273`, Y `93d8cab4`, AC `c6cd6538`. **AB FULLY CLOSED** via a two-landing chain — `5113f3ea` (write-routing half) + **`2ebd107a` (onTransition-firing half, S145)**; the second SHA post-dates `4c9079d2` (what S13 tested), which is exactly why S13 saw AB PARTIAL — our v0.7.0 re-verify (p10 19/19, transitions counter 0→1→2) matches current main. **AA OPEN** — confirmed both sides; it's a `W-MATCH-VALUE-UNUSED` lint-fire regression (the lint exists in source but stopped firing on the v0.7.0 bare-tail-`match` repro), not a missing feature; workaround `return match` / promote to `fn`. The AB probe also ratified **Fork-C1** (`effect=` on the `<engine>` opener; impl pending).

---

## A. What exists

### Docs (repo root)
- [x][x] `editor-README.md` — high-level design principles (focus-centered viewport, no file tree/tabs, NeoVim inspiration + mouse, total configurability, PWA architecture)
- [x][x] `editor-architecture.md` — detailed architecture reasoning (relevance view, inline-everything, editor IR, config sharing, split-block-to-file, normal-mode toggle analysis)
- [x][x] `pa.md` — per-repo PA directives. **S15: flogence outbox target + "Flogence message autonomy" policy (F4) + "S15 addendum — vPA deputy (PA side)" + session-start step 0 (digest/deputy-state/intake).** (Earlier: S14 modern-PA disciplines; 2026-04-22 commit-auth relaxation + reproducer-required rule.)
- [x][x] `vpa.md` — **NEW (S15)** — 6nz vPA deputy contract, scaled from `../scrml-support/vpa-scrml.md`. 4 functions (maintenance · digest · reboot-bridge · F4 flogence-intake). Bootstrap: 2nd instance → "read vpa.md and boot".
- [x][x] `README.md` — public-facing; links to the live playground
- [x][x] `package.json` — node project (playwright devDep); `scripts.test = playwright test`

### Z-motion specification (`z-motion-spec/`)
- [x][x] `SPEC.md` — v0.5 (release-order classification + sustained gestures; CC0)
- [x][x] `README.md` — intro, motivation, licensing, status
- [x][x] `LICENSE` — CC0 1.0 dedication
- [x][x] `default-bindings.md` — v0.3 (rewritten S10, commit `0ffb452`; companion to SPEC v0.5). Dropped FAMILY 2, added `[j]`/`[k]` vertical holds + `[u]` undo hold for SPEC §6.4 sustained gestures.

### Non-scrml prototypes (`proto/` carve-out)
- [x][x] `proto/6nz-playable/` — vanilla-JS playable prototype on a textarea. Live at <https://bryanmaclee.github.io/6NZ/> via GitHub Pages. 62 scenarios passing. Input model matches the spec; editor architecture does not.
- [x][x] `proto/z-motion-feel/` — older throwaway for z-motion input grammar (vanilla JS)

### Scrml-native source (`src/`)
- [x][x] `src/playground-zero/` — **works.** Z-motion release-order classifier port (SPEC v0.4 §5). Surfaced 6 compiler bugs in the first hour; scrmlTS fixed all 6 same day. Puppeteer smoke 7/7 pass. (S11 migration: `reset` is now a reserved keyword → renamed local `function reset()` to `function clearLog()`.)
- [x][x] `src/playground-one/` — **works.** Vim-style mode state machine via scrml's `<machine>` primitive (5 modes: Insert / Normal / Visual / V-LINE / ToggleHold). Compiler-enforced legal transitions. (S11 migration: `reset` → `clearMode`.)
- [x][x] `src/playground-two/` — **works.** hjkl + z-motion rolls on a real buffer with visible cursor. Combines playground-zero's classifier and playground-one's mode machine against a rendered text buffer. Starts in NORMAL (vim convention). Puppeteer smoke 12/12 pass. (S11 migration: `reset` → `clearBuffer`.)
- [x][x] `src/playground-three/` — **works.** CM6 mount via esm.sh + `^{ loadCm() }` direct (post-Bug-6 simplification). 9/9 smoke checks pass — CM6 loads, mounts on a scrml-rendered div, keystrokes into CM6 update scrml-side reactives live. Module-system workaround cost is noisy but functional (see §G).
- [x][x] `src/playground-four/` — **works.** Keystroke-granular undo TREE on a line-indexed buffer. `u` walks parents, `Ctrl+R` walks youngest child, `-`/`=` walk chronologically across branches. 14/14 smoke checks pass. Zero pageerrors. Surfaced 4 new compiler bugs (H, I, J, K) during construction — all filed and all confirmed fixed S11. (S11 migration: `reset` → `clearHistory`.)
- [x][x] `src/playground-five/` — **works. 18/18 smoke** against `dc073b94`. Vim modes on CM6. (S11 retest dipped to 12/18 on Bug P; restored to 18/18 once scrmlTS fixed Bug P at `d570341d`.) No source change since S10.
- [x][x] `src/playground-six/` — **works. 7/7 smoke** against `dc073b94`. LSP diagnostics over WebSocket. (S11 retest dipped to 6/7 on Bug P; restored once Bug P fixed.) S11 migrations: `null`→`not` in JSON-RPC init frame, bridge path made machine-portable via `import.meta.url`, sample doc dropped redundant `${...}` wrap.
- [x][x] `src/playground-seven/` — **works (z-motion on CM6 lands). 17/17 smoke** against `dc073b94`. Release-order classifier from p2 grafted into p5's vim keymap. Insert mode: hold `h/j/k/l` + tap any key → cursor motion in that direction without leaving INSERT. (Was 14/17 on the bare-body-top form; the 3 mode-badge failures were a Bug Q init artifact — cleared after the `${...}` wrap migration, which also confirmed Bug R was not real.) Surfaced compiler bugs Q + R(retracted) during construction.
- [x][x] `src/playground-nine/` — **works (editor IR + logical traversal). 13/13 smoke.** First non-CM6 playground; actual editor-proper progress. Flat-indexed node-tree IR (editor-architecture.md §3). Logical traversal (step into/out/sibling via l/h/j/k), cursor-driven auto-collapse (the locked "writing code IS debugging code" / auto-collapse-never-manually-managed principle), recursive tree-walk renderer (exercises scrml recursion). Fold state is COMPUTED from @cursorId (not mutated) after a write-during-render race froze the earlier mutate-via-meta-effect design. Surfaced 3 compiler bugs (W critical, V, U).
- [x][x] `src/playground-eight/` — **works (LSP completion + hover land).** Extends p6's diagnostics-over-WebSocket wiring with `textDocument/completion` (rendered in CM6's `@codemirror/autocomplete` UI) and `textDocument/hover` (rendered as a CM6 tooltip). **9/9 smoke pass** (against v0.7.0 the LSP now returns 58 completion items, was 57): CM6 mounts, LSP reaches ready, initial doc clean, typing `@` returns completion items (first: `lift`) end-to-end through the bridge, typing `<` returns another completion batch, hover request path reachable, broken-doc round-trip returns full `E-SCOPE-001: Undeclared identifier ...` via LSP. Surfaced 2 new compiler bugs (S, T) during construction. (S14: bridge LSP path scrmlTS→scrml.)
- [x][x] `src/playground-ten/` — **works (relevance-region navigator + §36 input-state). 19/19 smoke** against v0.7.0. REBUILD of the lost S13 p10 (original source landed in the misrouted caps-`6NZ/` clone, never reached the repo; only its 5 bug repros survived). Exercises: for-lift `<li class:focused= / style:opacity=>` reading global `@focusId` via item-binding `for (const r of @regions)` (Bug-V neighborhood — live-confirmed through nav + insert/remove churn, exactly one focused row always); `<engine for=Mode initial=.Nav>` Nav/Edit machine with `<onTransition>` (Bug AB live-confirmed — transitions counter increments through the dispatcher); region titles containing a declared fn-name (`"handleKey(e)"`) + URLs (`"https://..."`) rendering verbatim (Bug Z + X live-confirmed); `match @mode` badge via `return match` (Bug AA workaround); `<keyboard>`/`<mouse>` §36 panel. Surfaced **Bug AD** (fn-name not renamed in attribute-value interp → runtime ReferenceError), **Bug AE** (engine `name=` breaks the transition write-guard → E-ENGINE-001-RT), **Question AF** (§36 input-state markup interp is render-once / non-reactive). **S15: §36 panel converted from the `<timer>`+forced-markup-read workaround to the canonical §36.6 `animationFrame` @cell bridge** — the two transient gaps that forced the workaround (**AG** `animationFrame` scope-resolution, **AH** device registration from a non-markup read) are both **NOT-REPRODUCED @ scrml `dd5331e2`** (R26-verified; fixed upstream, never filed). Still 19/19 smoke, reactive readout confirmed (`x 0→123` on mouse-move).

- [x][x] `src/playground-eleven/` — **NEW (S18). flonav — the first flogence-integration prototype.** Keyboard cursor-as-PC over a floView-shaped node tree (fleet→project→facet→row) with `hjkl` nav + cursor-driven auto-collapse (p9 model) + a compiler-enforced **NORMAL/INSERT/VISUAL** `<engine>` (p1 model). INSERT composes+routes a prompt to the cursor node; **VISUAL** multi-selects a contiguous range + batch-routes one prompt to all selected nodes. Built around the verified scrml `<each>` constraints (single keyboard surface, single-root rows, no `<textarea>`). Compiles @ scrml 0.7.0; **17-step Playwright smoke green.** The template for the flogence editing-modes integration (nav-first, top-level project router — accepted, QUEUED).

**S18 — ALL 11 playground smokes MIGRATED puppeteer→Playwright.** The 11 `test.js` files were deleted; each playground now has `app.pw.ts` (`@playwright/test`). Gate = `npm test` (`playwright test`); `playwright.config.ts` + `src/_pw/scrml-dev.ts` helper drive per-spec `scrml dev` boot on distinct ports. CM6 playgrounds (p3/p5/p6/p7/p8) carry a `page.route` esm.sh pin-redirect shim (permanent hardening, ratified). The 'puppeteer smoke N/N' counts on the entries above are historical; current gate = **13 tests (12 playgrounds + Bug AI xfail), 0 failed** (against the stale global `scrml` 0.7.0 — see §F re: updating the binary).

### Infrastructure
- [x][x] `.github/workflows/pages.yml` — deploys `proto/6nz-playable/` to GitHub Pages
- [x][x] `handOffs/` — session rotation + incoming/read dropbox
- [~][x] `.claude/maps/` — **S15: cold refresh dispatched to project-mapper** (was stale pre-playgrounds); landing pending agent completion
- [x][x] `scripts/state.ts` — **NEW (S15)** — lightweight digest generator for the deputy (`--digest`/`--check`); projects machine-truth (HEAD · playgrounds · dogfood SHA · maps-staleness · recent sessions · intake count), points to §F for the bug board
- [x][x] `handOffs/delta-log.md` — **NEW (S15)** — PA→deputy state stream (PA single-writer; format header inside)
- [x][x] `handOffs/deputy-state.md` — **NEW (S15)** — deputy's durable re-hydration anchor (last-absorbed seq · ACK · heartbeat)
- [x][x] `handOffs/flogence-intake.md` — **NEW (S15)** — F4 intake queue (deputy files flogence bugs here; PA triages → §F)
- [x][x] `handOffs/digest.md` — **NEW (S15)** — seeded session-start digest (deputy regens per-tick)

## B. Design decisions (locked)

- CM6 + canvas overlay (rendering architecture) — CM6 side verified mountable this session via esm.sh bridge (playground-three)
- DOM text (not canvas-rendered text)
- NeoVim-inspired modal model (aspirational target: cover what a NeoVim power user expects — specific key assignments remain provisional)
- Z-motions: `[hold](roll)` model with release-order classification (no clocks)
- Sustained gestures: hold key as mode key, roll phase is a stream (v0.5)
- Multi-cursor
- Offline-first PWA — in the runtime, not beside it
- Lightning fast — open as instantly as the browser allows
- Z-motion spec is OPEN SOURCE (CC0), editor itself is proprietary
- Focus-centered viewport is a relevance view, not a scrolling window (see `editor-architecture.md` §1)
- Inline-everything file navigation with logical traversal (step-into/out/over) (see §2)
- Editor IR decouples on-disk scrml from in-editor representation (see §3)
- Auto-collapse is cursor-position-driven, never manually managed
- "Writing code IS debugging code" — cursor-as-virtual-PC philosophy is load-bearing
- Everything is user-configurable with sensible defaults

## C. Z-motion vocabulary (current)

SPEC v0.5 — `z-motion-spec/SPEC.md`

**Core mechanics:**
- Release-order classification: HOLD (key came and went during my lifetime), ROLL (earlier key still down at my keyup), TAP (neither). No timers.
- Sustained gestures: hold stays active, roll phase is a stream of events. Repeated taps `(g,g,g)` and repeated rolls `(jkl,jkl,jkl)` fire independently.
- Commit-on-release: characters commit on KEYUP, not KEYDOWN.

**Provisional binding families (illustrative, NOT locked):**

> The specific key assignments below are placeholders — SPEC v0.5 defines the
> *grammar* (hold+roll, release-order classification, sustained gestures), not
> the key map. Every concrete binding in this repo is subject to revision once
> implementation experience tells us what works under the fingers. Treat these
> as "what we're playing with right now," not "what 6nz will ship."

- `[h]` — char motion, left-hand rolls
- `[w]` — word motion
- `[e]` — word-end motion
- `[a]` — line anchor hold
- `[j]`/`[k]` — vertical motion (down/up), left-hand roll for count (caps at 4)
- `[A]`/`[H]` etc — shifted-letter holds are distinct bindings
- Operators `[dw]`, `[yw]`, `[cw]` etc — form is provisional (operator-first multi-key hold)

**Designed, bindings even looser:**
- Undo hold family (`[u]` illustrative) — granular, motion-boundary, undo-tree tiers
- Semantic landmark motions — blank line, matching indent, `{`, fold boundary (seed list, no assignments)
- Latch keys — concept locked, key assignments TBD
- Normal-mode toggle — concept locked, key assignments constrained (see `editor-architecture.md` §6)

## D. Prerequisites

- [x][~] **Compiler API exposure (LSP path)** — **L1-L4 shipped** (S40-S42, 2026-04-24 through ~05-01). 161+ LSP tests total. `bun run lsp/server.js --stdio` exposes: outline (`documentSymbolProvider`), hover with signatures, completions (HTML/scrml/SQL/keywords) with triggers `< @ $ ? ^ # . : = space`, cross-file go-to-def, cross-file diagnostics, three scrml-unique completions (SQL column from `<db>` schema, component prop, import-clause), signature help, and quick-fix code actions for E-IMPORT-004/005, E-LIN-001, E-PA-007, E-SQL-006. L5 (semantic tokens) deferred indefinitely (6nz spatial-panels supersede inline coloring). For 6nz this means semantic features (completion, live diagnostics, cross-file resolution, code actions) are reachable today via the LSP. Direct programmatic API for browser-PWA embedding still pending and remains the long-term path.
- [ ][ ] **Performance + PWA architecture spec** — authored before scaffolding
- [ ][ ] **scrml compiler in scrml** — needed so the editor (written in scrml) can embed the compiler directly

**Note:** Exploratory implementation is unblocked, AND semantic features are now reachable through the LSP rather than fully gated on a programmatic API. The editor proper still needs the in-process compiler eventually (browser-PWA can't shell out to a Bun child process at runtime), but for development-time tooling and any near-term playground that wants live diagnostics or completions, the LSP is the path.

---

## E. Open work

### Spec work (not blocked)
- [x] `default-bindings.md` v0.3 rewrite — DONE S10 (commit `0ffb452`); drops FAMILY 2, adds `[j]`/`[k]` vertical holds, adds `[u]` undo hold for SPEC §6.4 sustained gestures.
- [ ][ ] Shift-leak stripping — user locked "strip shift from roll," needs SPEC §5 or §11 note
- [ ][ ] Operator composition — move from §10.1 stub to full spec
- [ ][ ] Semantic landmark motions — hold-letter assignments, directionality, full vocabulary
- [ ][ ] Latch keys — key assignments, interaction with normal-mode toggle
- [ ][ ] Normal-mode toggle — key assignments (constrained: symmetrical, home row, index/middle finger, not t/y)

### Editor architecture (not blocked)
- [ ][ ] Relevance ranking algorithm for the viewport
- [ ][ ] Editor IR detailed design (node types, incremental update, serialization) — playground-four's `@nodes` tree shape is a rough sketch of the per-edit-node side of this
- [ ][ ] Logical traversal interaction with multi-cursor
- [ ][ ] **Live-readout chrome via the `@cell` bridge** — for any live cursor-coords / current-key display in the editor chrome, read `<#id>.x` inside an `animationFrame` loop and assign to an `@cell`, then interpolate the `@cell` (reactive). Direct `${<#id>.x}` markup interp is non-reactive BY DESIGN (§36.6, scrml AF ruling 2026-06-20) — renders once. Throttle in the loop. (A `W-INPUT-STATE-MARKUP-NONREACTIVE` lint is planned upstream to catch the wrong form.)
- [ ][ ] Config sharing infrastructure (`:km@username` — hosting, discovery, scope)
- [ ][ ] **Multi-close auto-expand** (`<//>`→`</></>`, `<///>`→`</></></>`) — Emmet-style type-time expansion, default OFF. scrml dropped Move 7 from the grammar (S54) and asked the editor to own the typing-density ergonomic instead (inbox `2026-05-04-...-multi-close-editor-option`, v0.next-era, no rush). Optional refinements: smart-close (expand to real tag names from open-tag tracking), configurable abbrev char, ghost-text preview.

### Playground track (exploratory scrml — unblocked)
> **S16 idiomatic rewrite (DONE, pushed `721660a`).** All 11 playgrounds rewritten to current scrml idiom per scrml's 2026-06-20 audit: `<each>` (Tier-1 iteration, was 0/11 → now 6/11 where lists exist), `<match for=Mode on=@mode>` (render-per-state, replacing `const <isX>`+`if=` badges), `<engine for=LspPhase>`/typed enum cells (async lifecycle, replacing `@lspStatus`/`@status`/`@mode` string flags). The carried "promote Tier-0 `${for…lift}` → `<each>`" debt (below) is RESOLVED. 83/83 smoke + p0–p4 probe-green. See `docs/changes/idiomatic-rewrite/progress.md`.
- [x] playground-zero — Z-motion classifier
- [x] playground-one — mode state machine via `<machine>`
- [x] playground-two — hjkl + z-motion on a real buffer
- [x] playground-three — CM6 mount probe (esm.sh bridge)
- [x] playground-four — undo tree on line-indexed buffer
- [x] playground-five — vim modes on CM6 (capture-phase keydown gates CM6; hjkl/0/$/i/a/v/Esc; 18/18 smoke S10; latent Bug P/R failures S11 retest). Surfaced Bug L.
- [x] playground-six — LSP diagnostics over WebSocket. Bridge spawns scrmlTS LSP via stdio + exposes WS; CM6 mounts, scrml-side WS client speaks JSON-RPC; clean → broken → clean transitions correctly produce 0 → N → 0 diagnostics. 7/7 smoke S10; 6/7 S11 retest (one pageerror = Bug P). Surfaced 3 new codegen bugs (M, N, O) + 1 Bug L recurrence.
- [x] playground-seven — z-motion on CM6. Release-order classifier from p2 grafted into p5's vim keymap. Insert mode: hold `h/j/k/l` + tap any key → cursor nudges in that direction without leaving INSERT or typing the rolled key. 14/17 smoke (3 mode-badge detection failures trace to Bug R). Surfaced 2 new compiler bugs (Q, R) during construction.
- [x] playground-eight — completion + hover on the LSP-wired CM6 surface. Extends p6 wire with `textDocument/completion` + `textDocument/hover` over the same WebSocket bridge. End-to-end working: typing `@` returns 57 completion items from the LSP, first `lift`. Hover request path reachable. 8/9 smoke. Surfaced 2 new compiler bugs (S, T).
- [x] playground-nine — editor IR + logical traversal. Flat-indexed node-tree IR; step into/out/sibling traversal; cursor-driven auto-collapse (computed, not mutated); recursive tree-walk renderer. 13/13 smoke. First non-CM6 playground; real editor-proper progress. Surfaced bugs W (critical, paren-drop), V (class-on-for-lift), U (slash-after-closetag).
- [x] playground-ten — relevance-region navigator + §36 input-state. for-lift region list with reactive `class:focused`/`style:opacity` reading global `@focusId` (item-binding); `<engine>` Nav/Edit machine + `<onTransition>`; verbatim fn-name/URL string rendering; `<keyboard>`/`<mouse>` §36 panel. 19/19 smoke. Rebuild of the lost S13 p10. Surfaced bugs AD (attr-interp fn-rename), AE (engine `name=` guard), AF (§36 markup non-reactive question). (Follow-ups carried from the S13 build: promote Tier-0 `${for…lift}` → `<each>`; `^{}` ambient sharing across regions; richer §51 — nested engines / history / onTimeout; `effect=` on the `<engine>` opener per Fork-C1.)

### Housekeeping (not blocked)
- [x][x] `.claude/maps/` refresh — done S10 (commit `6561d24`)

### Blocked by in-process compiler API (browser-PWA)
- [ ][ ] Editor scaffolding beyond playgrounds (CM6 + canvas overlay, real IR, real relevance view content)
- [ ][ ] PWA architecture spec (depends on knowing compiler API shape)
- [ ][ ] Compile-on-keystroke preview that runs in-browser without a server roundtrip

### Reachable via LSP (was: blocked by compiler API)
- [ ][ ] Live diagnostics in dev-time playgrounds (LSP `textDocument/publishDiagnostics`)
- [ ][ ] Completions in dev-time playgrounds (LSP `textDocument/completion`, including SQL-column)
- [ ][ ] Cross-file go-to-def in dev-time playgrounds (LSP `textDocument/definition`)
- [ ][ ] Semantic relevance region preview from LSP `textDocument/documentSymbol` + cross-file references

---

## F. Cross-repo

> **S14 currency note (2026-06-19).** The compiler repo was renamed **scrmlTS → `scrml`** at S200 (dir `../scrml/`; GitHub `bryanmaclee/scrml`, old URLs auto-redirect). The dormant self-host `scrml` → `scrml-native`. Current compiler: **v0.7.0 `80f2c190` (S209).** All historical "scrmlTS" / `dc073b94` references below are pre-rename, pre-v0.7.0 — read them as history. **S14 re-baselined all 10 playgrounds green against v0.7.0** (see top status + hand-off-12). Bug ledger now: **P/Q/M/N/O/V/S/W all FIXED** (S/W verified S14 via direct repro), **R retracted**, **L/T/U deferred to M6 native parser**. No 6nz-filed bug is open against v0.7.0 except the 3 M6-deferred parser ones. v0.7.0 notes relevant to us: block-`<match>` in `<each>` renders per-item; `<engine>` `:`-shorthand + `//` block-split fixed; variant-progression `(.A to .B)` lifecycle enforcement fires; `<errorBoundary>` functional. Still-open upstream (R28-1c): `<each>` same-key in-place field mutation doesn't re-render per-item — use `@items=[...]` array-ref replacement.

### Bug ledger — S13-recovery + p10 rebuild (verified against v0.7.0, S14)

The lost S13 (2026-05-29) playground-ten filed bugs X/Y/Z/AA/AB + AC to scrml (against v0.6.7); none was tracked here. Re-verified all 6 against v0.7.0 via the surviving repros, then rebuilt p10 which surfaced 3 more.

| Bug | What | v0.7.0 status |
|---|---|---|
| **X** | `//` (incl. `https://`) in a string literal → hard parse fail (E-CTX-003) | ✅ FIXED — compiles, URL preserved verbatim in emit |
| **Y** | comma-separated `match` arms → broken JS (`return X ,;`) | ✅ FIXED — now loud `E-MATCH-ARM-SEPARATOR` |
| **Z** | rename pass mangles a fn-name substring *inside a string literal* | ✅ FIXED — string literals opaque to rename |
| **AA** | bare tail `match` in a plain `function` silently dropped (value-discard IIFE) | ❌ OPEN — confirmed both sides (scrml S210). `W-MATCH-VALUE-UNUSED` lint-fire regression (lint exists but stopped firing on the v0.7.0 repro). Workaround `return match` / promote to `fn` |
| **AB** | `<onTransition>` didn't fire on bare `@mode=.Variant` write | ✅ **CLOSED @ `2ebd107a`** (S145 — the onTransition-firing half; the earlier `5113f3ea` was only write-routing). Post-dates `4c9079d2` (why S13 saw it PARTIAL). Live-confirmed in p10 v0.7.0 (counter 0→1→2) |
| **AC** | `<#cursor>` §36 input-state read → undefined-ref pageerror | ✅ FIXED — reads via `_scrml_input_state_registry` |
| **AD** | *(NEW, p10)* user fn called in an ATTRIBUTE-value interp (`class="x-${fn()}"`) emits the bare un-renamed name → runtime `ReferenceError`. `@cell` refs rewrite fine in the same spot; only user-fn names missed; textContent interp renames correctly. exit-0, node --check OK, runtime-broken. | ✅ **RESOLVED @ `14fb0230` + RE-VERIFIED 2026-06-20 @ `8c27805e`** — emit now renames the fn inside the attr interp (`box-${_scrml_tag_4()}`, was bare `tag`). Workaround in p10 (derived cell) can be retired |
| **AE** | *(NEW, p10)* `name=` on an `<engine>` breaks the transition write-guard — guard reads `__scrml_transitions_<EngineName>` (never defined) while the rule table is built under the variable name → `E-ENGINE-001-RT` on every legal transition. | ✅ **RESOLVED + RE-VERIFIED 2026-06-20 @ `8c27805e`** — scrml **HONORED `<engine name=N>`** (§51 P1), NOT rejected; write-guard + transitions table + governed var now all key on the `@mode` cell (emit: a single `__scrml_engine_mode_transitions = {Nav:[Edit],Edit:[Nav]}`; no mismatched name-table, no `E-ENGINE-001-RT`). p5 18/18 + p7 17/17 (both `name=` engines) runtime-green. **No migration needed** (reverses the earlier reject-name= triage). (Note: the message's `faa213c5` is not an ancestor of `8c27805e` — the fix landed under different provenance; confirmed empirically) |
| **AF** | *(NEW, p10, question)* `${<#input>.field}` in markup renders the initial value once and emits NO reactive effect → never updates on input. Read-in-loop is the only reactive path. | ✅ **RULED BY-DESIGN** (scrml S210, `...-1833`) — §36.6 normative: input-state is a live-read source, NOT a subscribable cell (intentional: mousemove fires 100s/sec; per-event markup re-render would be a footgun). The §36.1 "reactive access / `<poll>`-style" wording that misled us is now clarified. Correct pattern for editor chrome = **`@cell` bridge** (read `<#id>.x` in an `animationFrame` loop → assign to an `@cell` → interpolate the cell, which IS reactive; throttle in the loop). Planned info-lint `W-INPUT-STATE-MARKUP-NONREACTIVE` |
| **AI** | *(NEW, S17, p0 smoke)* `<each>` with an `<empty>` fallback body does NOT tear down the fallback on the **empty→non-empty** transition — the first item is appended *beside* the leftover fallback text (`<div …each-mount>EMPTY-FALLBACK<li>item 1</li></div>`). Reverse edge (non-empty→empty via `@items=[]`) is correct (`replaceChildren()`). Distinct from R28-1c (repro uses the `@items=[...]` array-ref workaround and still leaks). General — 13-line minimal repro, any `<each>…<empty>`. | ❌ **OPEN — filed to scrml 2026-06-24 (`...-0719-...-bug-AI-each-empty-fallback-leak.md`, needs:action), R26-verified @ scrml `2dd135ff`.** Surfaced as the 1 failing check in 6nz's new `playground-zero` smoke → marked **XFAIL** (Bug AI ref) so the suite stays green + auto-flips to XPASS/suite-fail when fixed. Low/cosmetic for us now; bites the common empty-state list idiom (will matter for the flogence editor surge) |

Bugs AD/AE/AF + the X/Y/Z/AB/AC-fixed + AA-open status were **sent to scrml 2026-06-20** (`../scrml/handOffs/incoming/2026-06-20-1217-...` + 3 sidecars). scrml is push-affected.

**scrml triage reply #1 (`2026-06-20-1339`, archived):** S13 batch confirmed. AD/AE FILED HIGH + DISPATCHED; AA tracked for a lint; AF pending design ruling. This reply's AE plan was to **REJECT** `name=` as an invalid attr — **REVERSED by reply #2 (see below).**

**scrml reply #2 (`2026-06-20-1709`, S210, processed S14):** the corroboration answer to our 1624 inquiry + AD/AE resolutions. **AB FULLY CLOSED @ `2ebd107a`** (S145 onTransition-firing half). **AA OPEN** (lint-fire regression). **AD RESOLVED @ `14fb0230`**. **AE RESOLVED @ `faa213c5` — scrml HONORED `<engine name=N>` (§51 P1) instead of rejecting it.** ✅ **CARRY RESOLVED (was: migrate p1/p2/p5/p7 off `name=`): NO MIGRATION NEEDED** — `<engine name=ModeMachine ...>` is now valid + correctly wired on current main. AD/AE/AB land NEWER than `80f2c190` → **RE-VERIFIED 2026-06-20 against the new build `8c27805e`:** AB (p10 `<onTransition>` 0→1→2 at runtime), AD (emit fn-rename in attr interp), AE (single coherent transition table + p5 18/18 / p7 17/17 `name=` engines runtime-green); **all 11 playgrounds compile clean + `node --check` OK — no regression from the `80f2c190→8c27805e` bump.** **AF RULED BY-DESIGN** (reply #3 `2026-06-20-1833`): §36 input-state markup interp is non-reactive by design (§36.6); use the **`@cell` bridge** for live editor-chrome readout. **Net p10 batch: X/Y/Z/AB/AC closed, AD/AE resolved + re-verified, AF by-design — only AA remains open (low-pri lint regression).**

### S18 — `<each>`/input-layer findings (flogence-integration verification) + scrml-dev live-reload

Runtime-verified flogence's documented "fragile input layer" (R26, not relaying prose) and filed to scrml. **Tested first at the stale global `scrml` 0.7.0 (`caa8803b`); re-verified against current source 0.7.1 (`59dc5287`, s241)** — 4 of 5 had already been fixed by GITI-033 (`690d7739`, which rewrote the `<each>`-body lowering).

| # | What | status @ scrml 0.7.1 (`59dc5287`) |
|---|---|---|
| **F1** | expr-form handler `on…=${(e)=>…}` silently dead inside `<each>` (bare-ref `on…=fn(event)` works — the workaround) | ✅ **FIXED** — runtime-confirmed (handler fires) |
| **F2** | `<form onsubmit>` inside `<each>` doesn't wire → native submit RELOADS the page | ✅ **FIXED** — runtime-confirmed (fires, no reload; earlier "broken" verdict was an HMR false-negative) |
| **F3** | multi-sibling `<each>` body → only the FIRST element renders | ❌ **OPEN** — emit is correct (both `createElement` emitted) but the each-item factory does `return _itemFrag.firstChild`, mounting only the first sibling. **Root cause pinned + re-filed** (`2026-07-06-0938-...-reverify-...`, needs:action). Workaround: single root per iteration |
| **F4** | reactive `${}` inside `<textarea>` leaks `<span data-scrml-logic>` as literal text (blocks multi-line editor) | 🔧 **LIVE — scrml fix DISPATCHED** (RCDATA carve-out; scrml root-caused emit-html.ts content-interp; R26 candidate). Unblocks the flogence/6nz multi-line editor when it lands |
| **F5** | bare void `<input>`/`<br>` inside `<each>` → misleading `E-CTX-001/003` compile error | ✅ **FIXED** — all 4 prior cases now compile |
| — | `bind:value` wires no listener | ❌ **NOT-REPRODUCED** (plain SPA, both sides). Likely SSR `<program db>`-specific or already fixed; parked pending an SSR repro |

Filed: `2026-07-06-0811-...-each-inputlayer-findings.md` (5 findings). scrml reply `2026-07-06-0923-...` (4/5 already fixed, F4 dispatched). 6nz re-verify reply `2026-07-06-0938-...` (F1/F2/F5 confirmed, F3 root-caused).

**scrml-dev live-reload BROKEN** (filed `2026-07-06-0925-...-dev-live-reload-broken.md`, needs:action): `/_scrml/live-reload` chunked stream terminates with `ERR_INCOMPLETE_CHUNKED_ENCODING` → (A) console error on every page load, (B) source edits don't hot-reload the tab (verified: edit VERSION_A→B, tab stays A), degrading a stale tab into a cryptic `_scrml_reactive_subscribe is not defined` red banner. Dev-UX/production-readiness. **Workaround: hard-refresh.** Doesn't affect the smoke harness (each spec boots fresh).

**⚠️ Global `scrml` binary is STALE:** `scrml --version` = 0.7.0 (`caa8803b`); source main = 0.7.1 (`59dc5287`). The playground gate currently runs against 0.7.0. Consider rebuilding/reinstalling the global binary so `scrml dev` + smokes validate against HEAD.

### scrmlTS (compiler) — historical (pre-S200 rename / pre-v0.7.0)
- **S11 retest (2026-05-23) — scrmlTS jumped S40 → S122 (~80 sessions, 300+ commits) during the gap.** Highlights affecting 6nz: v0.6.0 release tagged, v0.7 native parser arc in flight, LSP L1-L4 shipped (signature help + code actions live), Bug 14 SPEC §5.2.2 revert (`onclick=fn()` no longer auto-threads event), new `E-RESERVED-IDENTIFIER` on `function reset()` (use `clearXxx()`), `null` → `not` strictness (E-SYNTAX-042), `W-PROGRAM-REDUNDANT-LOGIC` actively recommending bare-decl v0.3 auto-lift form. Also corpus-sweep PLAN queued post-M6 (runtime-verify every example).
- **Bugs L/M/N/O closure-out S11.**
  - Bug L (BS brace-counter): fix at `2a5f4a06` was reverted at `529f0312`; **still open**, awaiting native-parser M6 subsumption. `String.fromCharCode(123/125)` workaround in p5+p6 stays.
  - Bug M (member-assign of fn expr): **fixed** at `08ca2f83`. Verified `ws.onopen = function () { ... };` emits cleanly.
  - Bug N (consecutive `@x =` in inline fn): **fixed**. scrmlTS had it pending-6nz-confirmation since 2026-04-26; closure message sent S11.
  - Bug O (for-of leaks into `^{}` meta-effect): **fixed** at `50b431e2`. Frozen-scope object correctly excludes the loop var.
- **Bug P filed S11 — runtime chunker tree-shake gap — FIXED + VERIFIED.** `_scrml_destroy_scope` (always-included `scope` chunk) called `_scrml_stop_scope_timers` (conditional `timers` chunk); apps without timer usage got a runtime missing the call target → `ReferenceError` on scope teardown, halting all reactive effects. scrmlTS fixed at `d570341d` (S126) — added a `CHUNK_DEPENDENCIES` table giving `scope → {timers, animation}`; our "in case" `animation` flag was covered too. Verified against `dc073b94`: repro emits the function definition; p5 back to 18/18, p6 back to 7/7. **Closed.**
- **Bugs Q + R filed S11 — both surfaced building playground-seven.**
  - Bug Q (auto-lift init gap) — **FIXED as a breaking error (S123, `9c06053f`).** scrmlTS made the silent failure LOUD: bare `@x = init` at `<program>`/`<page>`/`<channel>` body-top now fires `E-WRITE-NOT-IN-LOGIC-CONTEXT`. Default-logic auto-lifts *declarations* only (`<cell> = ...` structural form, `function f() {}`); reactive-cell *writes* must be wrapped in `${...}`. This broke p7+p8 (shipped S11 with bare body-top cells); both migrated to the `${...}` wrap (matches p5/p6). The error message is excellent (names cell, points at both fix forms). Correct call — the loud error is the right resolution.
  - Bug R (`if=` unmount no-op) — **RETRACTED. Was a Bug Q artifact, not a real bug.** The repro used bare body-top `@on = true` (Bug Q territory); the broken init left the `if=` effect subscription half-wired so unmount never fired. Re-tested with the `${...}` wrap on `dc073b94`: `if=@derived` mounts AND unmounts correctly (toggle alternates ON/OFF cleanly). p7's mode badges now alternate correctly → 17/17. Asked scrmlTS to pull it from their fix queue. Lesson: `${...}`-wrapped control run before filing any reactive-behavior bug.
  - Filed at `2026-05-23-0735-6nz-to-scrmlTS-bugs-q-r-from-playground-seven.md` + two sidecars; retraction + Q-migration confirmation at `2026-05-24-0609-6nz-to-scrmlTS-q-migrated-bug-r-RETRACTED-p-s-priority.md`.
- **Bugs S + T filed S11 — both surfaced building playground-eight.**
  - Bug S (`return not` mis-emit) — **TRIAGED HIGH, queued (the only active fix left from our filings).** The literal `not` in `return` position emits as unary `!` instead of `null`/`undefined`. When the next statement is `const`, the bundle becomes `return !const ...` — SyntaxError at parse time, the whole page dies. Workaround: use `return null` (compiles fine in return position despite §42.7 rejecting `null` in value-assignment positions). We recommended S as next-up after P landed.
  - Bug T (`//` in string literal) — **deferred to M6 native parser** (sibling of Bug L). BS preprocessing treats `//` inside `"..."` as line-comment start; string truncated AND subsequent `@cell` decls dropped (Bug Q cascade shape). Scope refinement: bites only at module-top `@cell = "...//..."` declaration context, NOT inside function bodies (p8's `lspWsUrl()` returns `"ws://localhost:..."` fine). Workaround: build URLs via `String.fromCharCode(47)` concatenation.
  - Filed at `2026-05-23-0757-6nz-to-scrmlTS-bugs-s-t-from-playground-eight.md` + 1 sidecar.
- **End-to-end LSP completion confirmed working S11 via p8.** Bridge → scrmlTS LSP → 57 completion items returned at logic-position `@`, first item `lift`. L1-L4 stack reachable through our WebSocket wire. Tooling that wants live completion / diagnostics / hover / signature help / code actions can build on this pattern today.
- **Bugs U + V + W filed S11 day-2 — surfaced building playground-nine (editor IR).**
  - **Bug W (CRITICAL)** — grouping parens dropped in emit. `(2 + 3) * 4` compiles to `2 + 3 * 4` = 14, not 20. Silent arithmetic corruption, no diagnostic, affects every parenthesized binary expression (reactive or not). Ranked above the entire open queue — correctness bug in the most basic expression form. Filed `2026-05-24-0641-...-bugs-v-w-from-playground-nine.md` + sidecar.
  - **Bug V** — `class:NAME=expr` on a for-lift element is evaluated create-time only; never re-evaluates when the dep changes. Selection-highlight in a rendered list silently stuck. Adopter-common (file lists, menus, tabs, mode badges, our tree view). Workaround: render the list as one reactive `${fn()}` string. Filed with sidecar.
  - **Bug U (minor)** — bare `/` immediately after a close-tag mis-parsed as a closer (`<code>l</code>/<code>r</code>` → E-SYNTAX-050); `/` between plain text is fine. Trivial workaround (spaces / different separator).
  - Render-ordering hazard (NOT filed): a `^{}` meta-effect writing `@collapsed` while a render interpolation reads it froze the render after one tick. Fixed by computing fold state from `@cursorId` instead of mutating. Flagged in the message as a possible diagnostic opportunity, not a bug.
- **S40 LSP unlock (2026-04-24).** scrmlTS shipped LSP L1+L2+L3 in three commits (`e1827e6` / `14cc1d1` / `24712f5`); 108 new tests. Capabilities: outline, hover-with-signatures, completions across all contexts (HTML / scrml / SQL / keywords), cross-file go-to-def, cross-file diagnostics, plus three scrml-unique completions (SQL column from `<db>` schema, component prop, import-clause). L4 (signature help + code actions) in progress. **L5 (semantic tokens) deferred at our request** — 6nz's locked CM6 + canvas overlay + spatial-panels architecture supersedes inline semantic-token coloring as our annotation strategy. Reply sent 2026-04-25.
- **Bun.SQL codegen shape change** (`cd8dea1` Phase 1 + `9ef0ccb` Phase 2): `?{}` blocks now emit `await _scrml_sql\`...\`` (was `_scrml_db.query("...").all()`). Doesn't affect any current 6nz playground (none use SQL); flagged for any future SQL-touching playground.
- **No npm escape hatch is coming**. scrmlTS ran a radical-doubt debate on a fourth init-tier (`--compat`) with npm-style deps. Verdict: **Phase 0 first** — (1) `^{}` polish (Bug 6 was the first shipped item), (2) `docs/external-js.md` translation table (shipped `c7198b6`), (3) `scrml vendor add` CLI (queued). Only if Phase 0 attempts-and-fails on adopter evidence does the fourth tier re-open. User accepted the verdict.
- Implication for 6nz: the path for "I need CM6 / Monaco / D3" is through `^{}` polish + `vendor/` + translation docs, not an npm `import`. Playground-three's esm.sh bridge is the current best pattern for libraries that have to load from a CDN; a second working example + a CM6-family cookbook entry are waiting to land.
- **Kickstarter currency (S15 note, 2026-06-22).** The LLM adopter "kickstarter" brief is now at **v2 — `scrml/docs/articles/llm-kickstarter-v2-2026-05-04.md`** (authoritative per the scrml PRIMER footer). Our local records only ever captured **v0** (S41, archived) and **v1** (S42, archived `…/read/2026-04-26-0919-…-kickstarter-v1.md`); v1 superseded v0 with 10 corrected claims, and **v2 supersedes v1**. We never pulled v2. If any 6nz tooling or playground ever surfaces a kickstarter prompt, use v2. (Not blocking anything today — recorded so the next PA doesn't treat our v0/v1 inbox trail as current.)

### scrml-support (research)
- Still houses deep-dive research. Not directly consulted this session; resource-mapper not run.

### scrml8 — frozen archive.

---

## G. External-JS integration constraints

Evidence from `src/playground-three` + session-9 discussion. Standing reference for anyone working on new external-JS playgrounds. scrmlTS's Phase 0 path (`^{}` polish + `vendor/` + `scrml vendor add` CLI + `docs/external-js.md` translation table) is aimed at making these constraints progressively less sharp without introducing an npm escape hatch. Section exists to inform playground authors of current reality, not to argue for a different direction.

1. **No npm/CDN `import`.** scrml *does* have an Import System (SPEC §21/§41) — stdlib (`import {x} from 'scrml:NAME'`), relative-path JS (`import {x} from './f.js'`), `vendor:`, and cross-file scrml component/engine splitting. What it lacks is **bare-specifier / npm** imports (`from 'lodash'` → `E-IMPORT-005`); there is no registry, lockfile, or auto-fetch. So an external CDN library (CM6, Monaco, D3) can't be `import`ed — it requires the script-injection + `window.__name` + `CustomEvent` bridge instead. (Correction S15: the prior "no source-level import" phrasing here was wrong — it conflated "no npm" with "no imports." See `pa.md` reads of scrml `tutorial.md` §3.3 + `external-js.md` + SPEC §21/§41.)
2. **No `import *` in the bridge.** Because the ESM is inside a string, each symbol has to be named individually (`{basicSetup}`, `{EditorView}`) and re-bundled onto the bridge object.
3. **No build-time resolution.** `scrml dev` / `scrml build` never see the external package. All loading is runtime, async, and out-of-band from scrml's reactive graph.
4. **Async load is invisible to scrml.** The only way to trigger the load from scrml was `@_bootstrap = loadCm()` (which fires `E-DG-002` — correctly — because `_bootstrap` is never consumed). Bug 6 fix unblocked `^{ loadCm() }` which is cleaner, but same underlying constraint: the load is out-of-band.
5. **No version pinning / lockfile.** The `@6` → `6.65.7` CM5 surprise from esm.sh's semver resolution would be impossible with a `package.json` + lockfile.
