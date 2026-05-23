# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-05-23 (S11)

**Status:** Exploratory implementation phase, dogfood mode. Seven scrml-native playgrounds committed. CM6 mount verified end-to-end via esm.sh bridge; z-motion classifier shipped on CM6 in p7. Editor scaffolding proper still waiting on compiler API exposure in scrmlTS. S11 was the first session post-LSP-shipping arc in scrmlTS (S40→S122 gap on our side) — re-verified all 4 prior bugs, migrated playgrounds for v0.6 language changes, surfaced 3 new compiler bugs (P/Q/R) through real construction.

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
- [x][x] `src/playground-zero/` — **works.** Z-motion release-order classifier port (SPEC v0.4 §5). Surfaced 6 compiler bugs in the first hour; scrmlTS fixed all 6 same day. Puppeteer smoke 7/7 pass. (S11 migration: `reset` is now a reserved keyword → renamed local `function reset()` to `function clearLog()`.)
- [x][x] `src/playground-one/` — **works.** Vim-style mode state machine via scrml's `<machine>` primitive (5 modes: Insert / Normal / Visual / V-LINE / ToggleHold). Compiler-enforced legal transitions. (S11 migration: `reset` → `clearMode`.)
- [x][x] `src/playground-two/` — **works.** hjkl + z-motion rolls on a real buffer with visible cursor. Combines playground-zero's classifier and playground-one's mode machine against a rendered text buffer. Starts in NORMAL (vim convention). Puppeteer smoke 12/12 pass. (S11 migration: `reset` → `clearBuffer`.)
- [x][x] `src/playground-three/` — **works.** CM6 mount via esm.sh + `^{ loadCm() }` direct (post-Bug-6 simplification). 9/9 smoke checks pass — CM6 loads, mounts on a scrml-rendered div, keystrokes into CM6 update scrml-side reactives live. Module-system workaround cost is noisy but functional (see §G).
- [x][x] `src/playground-four/` — **works.** Keystroke-granular undo TREE on a line-indexed buffer. `u` walks parents, `Ctrl+R` walks youngest child, `-`/`=` walk chronologically across branches. 14/14 smoke checks pass. Zero pageerrors. Surfaced 4 new compiler bugs (H, I, J, K) during construction — all filed and all confirmed fixed S11. (S11 migration: `reset` → `clearHistory`.)
- [x][x] `src/playground-five/` — **works.** Vim modes on CM6. 18/18 smoke S10. S11 status: latent failures due to Bug P (runtime chunker dep gap) and likely Bug R (`if=` unmount no-op for mode badges); no source change needed beyond what S10 shipped.
- [x][x] `src/playground-six/` — **works.** LSP diagnostics over WebSocket. 6/7 smoke S11 (only failure is Bug P pageerror). S11 migrations: `null`→`not` in JSON-RPC init frame, bridge path made machine-portable via `import.meta.url`, sample doc dropped redundant `${...}` wrap.
- [x][x] `src/playground-seven/` — **works (z-motion on CM6 lands).** Release-order classifier from p2 grafted into p5's vim keymap. Insert mode: hold `h/j/k/l` + tap any key → cursor motion in that direction without leaving INSERT. 14/17 smoke pass: NORMAL/VISUAL motion + z-motion all PASS; 3 remaining failures all trace to Bug R. Surfaced 2 new compiler bugs (Q, R) during construction.
- [x][x] `src/playground-eight/` — **works (LSP completion + hover land).** Extends p6's diagnostics-over-WebSocket wiring with `textDocument/completion` (rendered in CM6's `@codemirror/autocomplete` UI) and `textDocument/hover` (rendered as a CM6 tooltip). **9/9 smoke pass**: CM6 mounts, LSP reaches ready, initial doc clean, typing `@` returns 57 completion items (first: `lift`) end-to-end through the bridge, typing `<` returns another completion batch, hover request path reachable, broken-doc round-trip returns full `E-SCOPE-001: Undeclared identifier ...` via LSP. Surfaced 2 new compiler bugs (S, T) during construction.

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
- [ ][ ] Config sharing infrastructure (`:km@username` — hosting, discovery, scope)

### Playground track (exploratory scrml — unblocked)
- [x] playground-zero — Z-motion classifier
- [x] playground-one — mode state machine via `<machine>`
- [x] playground-two — hjkl + z-motion on a real buffer
- [x] playground-three — CM6 mount probe (esm.sh bridge)
- [x] playground-four — undo tree on line-indexed buffer
- [x] playground-five — vim modes on CM6 (capture-phase keydown gates CM6; hjkl/0/$/i/a/v/Esc; 18/18 smoke S10; latent Bug P/R failures S11 retest). Surfaced Bug L.
- [x] playground-six — LSP diagnostics over WebSocket. Bridge spawns scrmlTS LSP via stdio + exposes WS; CM6 mounts, scrml-side WS client speaks JSON-RPC; clean → broken → clean transitions correctly produce 0 → N → 0 diagnostics. 7/7 smoke S10; 6/7 S11 retest (one pageerror = Bug P). Surfaced 3 new codegen bugs (M, N, O) + 1 Bug L recurrence.
- [x] playground-seven — z-motion on CM6. Release-order classifier from p2 grafted into p5's vim keymap. Insert mode: hold `h/j/k/l` + tap any key → cursor nudges in that direction without leaving INSERT or typing the rolled key. 14/17 smoke (3 mode-badge detection failures trace to Bug R). Surfaced 2 new compiler bugs (Q, R) during construction.
- [x] playground-eight — completion + hover on the LSP-wired CM6 surface. Extends p6 wire with `textDocument/completion` + `textDocument/hover` over the same WebSocket bridge. End-to-end working: typing `@` returns 57 completion items from the LSP, first `lift`. Hover request path reachable. 8/9 smoke. Surfaced 2 new compiler bugs (S, T).
- [ ] playground-nine (suggested) — first scrml file that isn't a CM6 demo: editor IR + node-tree shape. Take playground-four's `@nodes` shape and start designing the real editor IR: node types, traversal, mutation. No CM6, no LSP — just exercising the scrml type system + reactive engine on the IR shape the editor proper will use.
- [ ] playground-ten (suggested) — multi-buffer / relevance-region surface. Three or four scrml-rendered code spans sharing one mode state machine. Tests `^{}` ambient sharing across markup regions and probes whether the relevance-view's "multiple focused code regions" model actually composes.

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
- **S11 retest (2026-05-23) — scrmlTS jumped S40 → S122 (~80 sessions, 300+ commits) during the gap.** Highlights affecting 6nz: v0.6.0 release tagged, v0.7 native parser arc in flight, LSP L1-L4 shipped (signature help + code actions live), Bug 14 SPEC §5.2.2 revert (`onclick=fn()` no longer auto-threads event), new `E-RESERVED-IDENTIFIER` on `function reset()` (use `clearXxx()`), `null` → `not` strictness (E-SYNTAX-042), `W-PROGRAM-REDUNDANT-LOGIC` actively recommending bare-decl v0.3 auto-lift form. Also corpus-sweep PLAN queued post-M6 (runtime-verify every example).
- **Bugs L/M/N/O closure-out S11.**
  - Bug L (BS brace-counter): fix at `2a5f4a06` was reverted at `529f0312`; **still open**, awaiting native-parser M6 subsumption. `String.fromCharCode(123/125)` workaround in p5+p6 stays.
  - Bug M (member-assign of fn expr): **fixed** at `08ca2f83`. Verified `ws.onopen = function () { ... };` emits cleanly.
  - Bug N (consecutive `@x =` in inline fn): **fixed**. scrmlTS had it pending-6nz-confirmation since 2026-04-26; closure message sent S11.
  - Bug O (for-of leaks into `^{}` meta-effect): **fixed** at `50b431e2`. Frozen-scope object correctly excludes the loop var.
- **Bug P filed S11 — runtime chunker tree-shake gap.** `_scrml_destroy_scope` (always-included `scope` chunk) calls `_scrml_stop_scope_timers` (conditional `timers` chunk). Apps that don't use timer functions get a runtime tree-shaken without the call target → `ReferenceError: _scrml_stop_scope_timers is not defined` on any scope teardown, halting all subsequent reactive effects. HIGH — every adopter app hits this. Filed at `2026-05-23-0719-6nz-to-scrmlTS-bugs-l-m-n-o-status-plus-bug-p.md` + sidecar.
- **Bugs Q + R filed S11 — both surfaced building playground-seven.**
  - Bug Q (auto-lift init gap): `<program>` body's bare `@cell = X` declarations don't get `_scrml_init_set` emission when (Q-1) the body starts with `@cell` instead of fn/type, or (Q-2) `@cell` decls are separated from each other by a comment block. Compile-clean → runtime undefined → bare dependency probe throws at module load → halts the rest of init including `DOMContentLoaded`-wired `if=` markup. Workaround: precede `@cell` decls with a function, keep `@cell` decls contiguous, or use the redundant `${...}` wrap that `W-PROGRAM-REDUNDANT-LOGIC` warns against.
  - Bug R (`if=` unmount no-op): `if=@derived` mounts the controlled template on first true, but the unmount path never fires when the derived flips to false. Three siblings with mutually-exclusive `if=` (e.g. mode badges) accumulate visible clones instead of alternating. Emit has both mount and unmount functions — the unmount call site exists in the effect — so the failure is in subscription or derived propagation. Adopter impact: every mode-badge / signed-in-vs-out / accordion pattern.
  - Filed at `2026-05-23-0735-6nz-to-scrmlTS-bugs-q-r-from-playground-seven.md` + two sidecars.
- **Bugs S + T filed S11 — both surfaced building playground-eight.**
  - Bug S (`return not` mis-emit): the literal `not` in `return` position emits as unary `!` instead of `null`/`undefined`. When the next statement is `const`, the bundle becomes `return !const ...` — SyntaxError at parse time, the whole page dies. Workaround: use `return null` (which compiles fine in return position despite §42.7 rejecting `null` in value-assignment positions — flagging the inconsistency too).
  - Bug T (`//` in string literal): BS preprocessing treats `//` inside `"..."` as line-comment start. The string is truncated AND all subsequent `@cell` module-level declarations are silently dropped from init (same cascade shape as Bug Q). Sibling of Bug L (BS not string-aware on `{`/`}`); both close together at native-parser M6. Workaround: build URLs via `"file:" + String.fromCharCode(47) + String.fromCharCode(47) + "/path"`.
  - Filed at `2026-05-23-0757-6nz-to-scrmlTS-bugs-s-t-from-playground-eight.md` + 1 sidecar.
- **End-to-end LSP completion confirmed working S11 via p8.** Bridge → scrmlTS LSP → 57 completion items returned at logic-position `@`, first item `lift`. L1-L4 stack reachable through our WebSocket wire. Tooling that wants live completion / diagnostics / hover / signature help / code actions can build on this pattern today.
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
