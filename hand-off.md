# 6nz — Session 7 Hand-Off

**Date:** 2026-04-14
**Next hand-off filename:** `handOffs/hand-off-7.md`

## Session start state
- Session 6 rotated to `handOffs/hand-off-6.md`
- Working tree: clean on `main` @ `8fe77e4`
- `handOffs/incoming/` empty
- `user-voice.md` header-only (per-repo log started 2026-04-14; historical archived in scrml-support)
- Maps (`.claude/maps/`) from session 2 cold run — may need refresh
- No source code yet — design phase
- SPEC at v0.5; `editor-architecture.md` present
- `master-list.md` at S5

## Session work

- **Playable concept prototype built**: `proto/6nz-playable/index.html` (1330 lines, single file, vanilla JS on textarea)
  - Scope chosen: open/edit/save files + vim normal/visual + z-motion insert layer
  - File I/O via File System Access API with download+upload fallback
  - Vim normal: hjkl/wbe/0^$/ggG/HML/{}/%/f-t-char/;,//n/*/ counts, operators d/c/y/>/< on motions + iw/aw subset, actions x/X/D/C/Y/p/P/u/J/~/o/O/i/I/a/A, ex :w/:q/:wq/:e/:N
  - Vim visual: motions extend sel, d/c/y/x/>/</y/~ on sel, V for line-visual
  - Z-motions: `[h]/[w]/[e]/[sd]/[ds]/[a]/[g]/[p]/[m]/[u]` families (letter-hold family from default-bindings.md + sustained undo)
  - Line numbers, status line, toolbar, cmdline, F1 help panel
- **Decision recorded** (README.md): stayed on textarea vs CM6 because existing z-motion-feel proto proved the classifier works there — doubling surface area for CM6 wins nothing prototype-wise
- **Intentionally deferred**: syntax highlighting, registers, macros, marks, multi-cursor, relevance view / inline expansion (compiler-gated), LSP, dot-repeat
- **Puppeteer test harness added** (`test.js`, 54 scenarios): drives the page with real key events, reads back textarea value/cursor/mode. Run `node test.js`. Uses `window.__6nz_reset(text, pos)` hook for per-scenario state isolation.
- **Bugs surfaced by tests → fixed**:
  1. `parseCount` matched lone `0` as count → broke `0` line-start motion. Restricted count regex to `[1-9]\d*`.
  2. `applyOp` double-expanded linewise ranges for `dd`/`yy`. Added `preExpanded` flag from `parseNormal`.
  3. Multi-key hold `[sd](j)` only promoted first earlier pending candidate to HOLD. Now promotes all earlier still-down pending candidates (SPEC §6.1 correct interpretation: rollIdx's press-and-release happened within the lifetime of every earlier-pressed candidate).
  4. Visual mode motions used `selectionStart` as cursor, which is always the min end — repeated motions didn't advance. Added separate `visualActive` tracker.
  5. `snapshot()` early-returned when `lastSnapshotText` matched current value → undo stack stayed empty on first edit. Now always pushes current state.

## Key decisions captured

- Prototype lives under `proto/6nz-playable/` — throwaway, `scrml-only` rule waived per `proto/README.md`
- `[f](<char>)` find-char z-motion deferred (collides with typing letters as rolls); find-char accessed via normal mode only in this proto
- No normal-mode toggle hold (SPEC §10.3) in this proto — Esc is the mode switch
- `[u](b)` aliased to `[u](g)` — motion-boundary tier from SPEC §6.4.4 collapsed to granular in demo
