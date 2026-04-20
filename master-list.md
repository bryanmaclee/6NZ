# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-04-12 (S5)

**Status:** Design phase. No implementation yet.

---

## A. What exists

- [x][x] `editor-README.md` — high-level design principles (focus-centered viewport, no file tree/tabs, NeoVim inspiration + mouse, total configurability, PWA architecture)
- [x][x] `editor-architecture.md` — detailed architecture reasoning (relevance view, inline-everything, editor IR, config sharing, split-block-to-file, normal-mode toggle key analysis)
- [x][x] `package.json` — stub (just name + version)
- [x][x] `z-motion-spec/` — v0.5 Z-motion spec (CC0)
  - `README.md` — intro, motivation, licensing
  - `SPEC.md` — v0.5: release-order classification (v0.4) + sustained gestures (v0.5)
  - `default-bindings.md` — v0.2 (partially stale against SPEC v0.5, needs v0.3 rewrite)
  - `LICENSE` — CC0 1.0 dedication
- [x][x] `proto/z-motion-feel/` — throwaway browser prototype for z-motion input grammar (vanilla JS, not scrml — lives under the `proto/` carve-out)

## B. Design decisions (locked)

- CM6 + canvas overlay (rendering architecture)
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

## D. Prerequisites (not in this repo)

- [ ][ ] **Compiler API exposure** — `scrmlTS` must expose a programmatic API so the editor can call into the compiler for semantic features. Cross-repo message sent S4 (`scrmlTS/handOffs/incoming/`). scrmlTS noted local-server-on-Bun is a smaller ask than browser-PWA.
- [ ][ ] **Performance + PWA architecture spec** — authored before scaffolding
- [ ][ ] **scrml compiler in scrml** — needed so the editor (written in scrml) can embed the compiler directly

---

## E. Open work

### Spec work (not blocked by compiler)
- [ ][ ] `default-bindings.md` v0.3 rewrite — remove FAMILY 2, add `[j]`/`[k]` vertical, update against SPEC v0.5
- [ ][ ] Shift-leak stripping — user locked "strip shift from roll," needs SPEC §5 or §11 note
- [ ][ ] Operator composition — move from §10.1 stub to full spec
- [ ][ ] Semantic landmark motions — hold-letter assignments, directionality, full vocabulary
- [ ][ ] Latch keys — key assignments, interaction with normal-mode toggle
- [ ][ ] Normal-mode toggle — key assignments (constrained: symmetrical, home row, index/middle finger, not t/y)

### Editor architecture (not blocked by compiler)
- [ ][ ] Relevance ranking algorithm for the viewport
- [ ][ ] Editor IR detailed design (node types, incremental update, serialization)
- [ ][ ] Logical traversal interaction with multi-cursor
- [ ][ ] Config sharing infrastructure (`:km@username` — hosting, discovery, scope)

### Blocked by compiler
- [ ][ ] Compiler API exposure (in scrmlTS — in progress, structured expression AST migration)
- [ ][ ] Editor scaffolding (CM6 + canvas overlay)
- [ ][ ] PWA architecture spec

---

## F. Cross-repo

- **scrmlTS** — compiler API target. Currently in multi-phase structured expression AST migration (S4 2026-04-11). Pushes compiler API further out.
- **scrml-support** — all editor research:
  - `6nz-editor-2026-03-30.md`
  - `6nz-editor-research-2026-04-02.md`
  - `6nz-rendering-architecture-2026-04-02.md`
- **scrml8** — frozen archive
