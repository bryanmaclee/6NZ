# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-04-25 (S10)

**Status:** Exploratory implementation phase. Four scrml-native playgrounds committed. CM6 mount verified end-to-end via esm.sh bridge. Editor scaffolding proper still waiting on compiler API exposure in scrmlTS.

---

## A. What exists

### Docs (repo root)
- [x][x] `editor-README.md` — high-level design principles (focus-centered viewport, no file tree/tabs, NeoVim inspiration + mouse, total configurability, PWA architecture)
- [x][x] `editor-architecture.md` — detailed architecture reasoning (relevance view, inline-everything, editor IR, config sharing, split-block-to-file, normal-mode toggle analysis)
- [x][x] `pa.md` — per-repo PA directives, updated 2026-04-22 with commit-auth relaxation + cross-repo reproducer-required rule
- [x][x] `README.md` — public-facing; links to the live playground
- [x][x] `package.json` — stub (name + version only)

### Z-motion specification (`z-motion-spec/`)
- [x][x] `SPEC.md` — v0.5 (release-order classification + sustained gestures; CC0)
- [x][x] `README.md` — intro, motivation, licensing, status
- [x][x] `LICENSE` — CC0 1.0 dedication
- [ ][x] `default-bindings.md` — v0.2, **partially stale against SPEC v0.5**. v0.3 rewrite planned: drop FAMILY 2, add `[j]`/`[k]` vertical, update against sustained gestures.

### Non-scrml prototypes (`proto/` carve-out)
- [x][x] `proto/6nz-playable/` — vanilla-JS playable prototype on a textarea. Live at <https://bryanmaclee.github.io/6NZ/> via GitHub Pages. 62 scenarios passing. Input model matches the spec; editor architecture does not.
- [x][x] `proto/z-motion-feel/` — older throwaway for z-motion input grammar (vanilla JS)

### Scrml-native source (`src/`)
- [x][x] `src/playground-zero/` — **works.** Z-motion release-order classifier port (SPEC v0.4 §5). Surfaced 6 compiler bugs in the first hour; scrmlTS fixed all 6 same day. Puppeteer smoke 7/7 pass. Proves the stack can handle event-stream + state-machine work the input layer needs.
- [x][x] `src/playground-one/` — **works.** Vim-style mode state machine via scrml's `<machine>` primitive (5 modes: Insert / Normal / Visual / V-LINE / ToggleHold). Compiler-enforced legal transitions. Uses `fn modeName(m: Mode) -> string { match … }` (post-Bug-G restoration, verified end-to-end).
- [x][x] `src/playground-two/` — **works.** hjkl + z-motion rolls on a real buffer with visible cursor. Combines playground-zero's classifier and playground-one's mode machine against a rendered text buffer. Starts in NORMAL (vim convention). Puppeteer smoke 12/12 pass.
- [x][x] `src/playground-three/` — **works.** CM6 mount via esm.sh + `^{ loadCm() }` direct (post-Bug-6 simplification). 9/9 smoke checks pass — CM6 loads, mounts on a scrml-rendered div, keystrokes into CM6 update scrml-side reactives live. Module-system workaround cost is noisy but functional (see §G).
- [x][x] `src/playground-four/` — **works.** Keystroke-granular undo TREE on a line-indexed buffer. `u` walks parents, `Ctrl+R` walks youngest child, `-`/`=` walk chronologically across branches. 14/14 smoke checks pass. Zero pageerrors. Surfaced 4 new compiler bugs (H, I, J, K) during construction — all filed with minimal repros.

### Infrastructure
- [x][x] `.github/workflows/pages.yml` — deploys `proto/6nz-playable/` to GitHub Pages
- [x][x] `handOffs/` — session rotation + incoming/read dropbox
- [ ][x] `.claude/maps/` — session 2 cold run, **stale** (pre-playgrounds, pre-pa-updates)

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

- [x][~] **Compiler API exposure (LSP path)** — **partially shipped S40** (2026-04-24). scrmlTS shipped LSP L1+L2+L3 (108 new tests). `bun run lsp/server.js --stdio` exposes: outline (`documentSymbolProvider`), hover with signatures, completions (HTML/scrml/SQL/keywords) with triggers `< @ $ ? ^ # . : = space`, cross-file go-to-def, cross-file diagnostics, plus three scrml-unique completions (SQL column from `<db>` schema, component prop, import-clause). L4 (signature help + code actions) in progress; L5 (semantic tokens) deferred at our request — see §F. Architecture: 3-file split (`server.js` thin transport + `handlers.js` testable handlers + `workspace.js` cross-file cache). For 6nz this means semantic features (completion, live diagnostics, cross-file resolution) are reachable today via the LSP, before any in-process compiler API. Direct programmatic API for browser-PWA embedding still pending and remains the long-term path.
- [ ][ ] **Performance + PWA architecture spec** — authored before scaffolding
- [ ][ ] **scrml compiler in scrml** — needed so the editor (written in scrml) can embed the compiler directly

**Note:** Exploratory implementation is unblocked, AND semantic features are now reachable through the LSP rather than fully gated on a programmatic API. The editor proper still needs the in-process compiler eventually (browser-PWA can't shell out to a Bun child process at runtime), but for development-time tooling and any near-term playground that wants live diagnostics or completions, the LSP is the path.

---

## E. Open work

### Spec work (not blocked)
- [ ][ ] `default-bindings.md` v0.3 rewrite — remove FAMILY 2, add `[j]`/`[k]` vertical, update against SPEC v0.5
- [ ][ ] Shift-leak stripping — user locked "strip shift from roll," needs SPEC §5 or §11 note
- [ ][ ] Operator composition — move from §10.1 stub to full spec
- [ ][ ] Semantic landmark motions — hold-letter assignments, directionality, full vocabulary
- [ ][ ] Latch keys — key assignments, interaction with normal-mode toggle
- [ ][ ] Normal-mode toggle — key assignments (constrained: symmetrical, home row, index/middle finger, not t/y)

### Editor architecture (not blocked)
- [ ][ ] Relevance ranking algorithm for the viewport
- [ ][ ] Editor IR detailed design (node types, incremental update, serialization) — playground-four's `@nodes` tree shape is a rough sketch of the per-edit-node side of this
- [ ][ ] Logical traversal interaction with multi-cursor
- [ ][ ] Config sharing infrastructure (`:km@username` — hosting, discovery, scope)

### Playground track (exploratory scrml — unblocked)
- [x] playground-zero — Z-motion classifier
- [x] playground-one — mode state machine via `<machine>`
- [x] playground-two — hjkl + z-motion on a real buffer
- [x] playground-three — CM6 mount probe (esm.sh bridge)
- [x] playground-four — undo tree on line-indexed buffer
- [x] playground-five — vim modes on CM6 (capture-phase keydown gates CM6; hjkl/0/$/i/a/v/Esc; 18/18 smoke). Surfaced Bug L (BS not string-aware in brace counting).
- [ ] playground-six (now possible, post-S40 LSP) — wire the scrmlTS LSP into a CM6 surface via stdio child-process. Exercise outline / completion / cross-file go-to-def / SQL-column completion from a live editor. First playground that integrates with the actual compiler.
- [ ] playground-seven (suggested) — z-motion on CM6: graft playground-two's release-order classifier into playground-five's keymap so insert-mode `[h](roll)` etc. drive CM6 selection without leaving Insert.

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

### scrmlTS (compiler)
- Session 9 interaction was dense: scrmlTS shipped fixes for Bug G, 1, 3, 4, 5, 6 across the span (scrmlTS S37 closed at commit `9540518` with 7,393 tests pass; all six fixes landed pre-close, zero regressions). 6nz filed four more (H, I, J, K) from playground-four with inline + sidecar repros per the new pa.md rule. Re-filed S10 (2026-04-25) as a dedicated message + standalone sidecars; scrmlTS replied that all four had landed in S39 (commits `39782f0`/`6b3e63f`/`4c4679d`+`ad02884`/`686ffcd`) — retested against `c51ad15` and confirmed all four fixed.
- **Bug L surfaced S10** during playground-five construction. BS not string-aware in brace counting: `{` and `}` split across separate string literals trip BS's brace counter, manifesting as bogus "Unclosed 'logic' / 'program'" errors. Sibling of the `\n`-not-interpreted issue from playground-two. Filed 2026-04-25 with inline + sidecar repro.
- **S40 LSP unlock (2026-04-24).** scrmlTS shipped LSP L1+L2+L3 in three commits (`e1827e6` / `14cc1d1` / `24712f5`); 108 new tests. Capabilities: outline, hover-with-signatures, completions across all contexts (HTML / scrml / SQL / keywords), cross-file go-to-def, cross-file diagnostics, plus three scrml-unique completions (SQL column from `<db>` schema, component prop, import-clause). L4 (signature help + code actions) in progress. **L5 (semantic tokens) deferred at our request** — 6nz's locked CM6 + canvas overlay + spatial-panels architecture supersedes inline semantic-token coloring as our annotation strategy. Reply sent 2026-04-25.
- **Bun.SQL codegen shape change** (`cd8dea1` Phase 1 + `9ef0ccb` Phase 2): `?{}` blocks now emit `await _scrml_sql\`...\`` (was `_scrml_db.query("...").all()`). Doesn't affect any current 6nz playground (none use SQL); flagged for any future SQL-touching playground.
- **No npm escape hatch is coming**. scrmlTS ran a radical-doubt debate on a fourth init-tier (`--compat`) with npm-style deps. Verdict: **Phase 0 first** — (1) `^{}` polish (Bug 6 was the first shipped item), (2) `docs/external-js.md` translation table (shipped `c7198b6`), (3) `scrml vendor add` CLI (queued). Only if Phase 0 attempts-and-fails on adopter evidence does the fourth tier re-open. User accepted the verdict.
- Implication for 6nz: the path for "I need CM6 / Monaco / D3" is through `^{}` polish + `vendor/` + translation docs, not `import`. Playground-three's esm.sh bridge is the current best pattern for libraries that have to load from a CDN; a second working example + a CM6-family cookbook entry are waiting to land.

### scrml-support (research)
- Still houses deep-dive research. Not directly consulted this session; resource-mapper not run.

### scrml8 — frozen archive.

---

## G. External-JS integration constraints

Evidence from `src/playground-three` + session-9 discussion. Standing reference for anyone working on new external-JS playgrounds. scrmlTS's Phase 0 path (`^{}` polish + `vendor/` + `scrml vendor add` CLI + `docs/external-js.md` translation table) is aimed at making these constraints progressively less sharp without introducing an npm escape hatch. Section exists to inform playground authors of current reality, not to argue for a different direction.

1. **No source-level `import`.** Every external dep requires the script-injection + `window.__name` + `CustomEvent` bridge. Three primitives to express what `import` expresses in one line.
2. **No `import *` in the bridge.** Because the ESM is inside a string, each symbol has to be named individually (`{basicSetup}`, `{EditorView}`) and re-bundled onto the bridge object.
3. **No build-time resolution.** `scrml dev` / `scrml build` never see the external package. All loading is runtime, async, and out-of-band from scrml's reactive graph.
4. **Async load is invisible to scrml.** The only way to trigger the load from scrml was `@_bootstrap = loadCm()` (which fires `E-DG-002` — correctly — because `_bootstrap` is never consumed). Bug 6 fix unblocked `^{ loadCm() }` which is cleaner, but same underlying constraint: the load is out-of-band.
5. **No version pinning / lockfile.** The `@6` → `6.65.7` CM5 surprise from esm.sh's semver resolution would be impossible with a `package.json` + lockfile.
