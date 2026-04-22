# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-04-22 (S9)

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

- [ ][ ] **Compiler API exposure** — still pending. `scrmlTS` must expose a programmatic API so the editor can call into the compiler for semantic features (completion, live diagnostics, relevance-region resolution). Cross-repo message sent session 4; scrmlTS noted local-server-on-Bun is a smaller ask than browser-PWA.
- [ ][ ] **Performance + PWA architecture spec** — authored before scaffolding
- [ ][ ] **scrml compiler in scrml** — needed so the editor (written in scrml) can embed the compiler directly

**Note:** Exploratory implementation is now explicitly unblocked — editor shell / buffer / input / modes / Z-motion / config / UI primitives can all start now (and several have, see §A). Only semantic features (completion, live diagnostics, relevance view content) remain gated on compiler API exposure.

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
- [ ] playground-five (suggested) — CM6 + vim-modes integration: merge two's state machine + hjkl onto three's real CM6 surface. Moves us from "toy textareas" to "actually driving CM6." Expected to surface friction around CM6's own keymap vs scrml-side handlers.

### Housekeeping (not blocked)
- [ ][ ] `.claude/maps/` refresh (stale since S2, pre-playgrounds)

### Blocked by compiler API (scrmlTS)
- [ ][ ] Editor scaffolding beyond playgrounds (CM6 + canvas overlay, real IR, real relevance view content)
- [ ][ ] PWA architecture spec (depends on knowing compiler API shape)
- [ ][ ] Live diagnostics, completions, semantic relevance region, compile-on-keystroke preview

---

## F. Cross-repo

### scrmlTS (compiler)
- Session 9 interaction was dense: scrmlTS shipped fixes for Bug G, 1, 3, 4, 5, 6 across the span (scrmlTS S37 closed at commit `9540518` with 7,393 tests pass; all six fixes landed pre-close, zero regressions). 6nz filed four more (H, I, J, K) from playground-four with inline + sidecar repros per the new pa.md rule.
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
