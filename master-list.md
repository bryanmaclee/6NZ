# 6nz — Master List

**Purpose:** Live inventory of the 6nz editor repo.

**Last updated:** 2026-04-11 (S3 — z-motion-spec scaffold)

**Status:** Design phase. No implementation yet.

---

## A. What exists

- [x][x] `editor-README.md` — design principles (focus-centered viewport, no file tree/tabs, NeoVim inspiration + mouse, total configurability)
- [x][x] `package.json` — stub (just name + version)
- [x][x] `z-motion-spec/` — v0.1 draft of the open-source Z-motion spec (CC0)
  - `README.md` — intro, motivation, licensing
  - `SPEC.md` — notation, grammar, semantics, seed vocabulary, open questions
  - `LICENSE` — CC0 1.0 dedication (links to canonical legal text)

## B. Design decisions (locked)

- CM6 + canvas overlay
- DOM text (not canvas-rendered text)
- NeoVim superset with zMotions `[hold](roll)` model
- Multi-cursor
- Offline-first PWA
- Lightning fast — open as instantly as the browser allows
- Z-motion spec is OPEN SOURCE (MIT/CC0), editor itself is proprietary

## C. Z-motion vocabulary (seed)

From user voice log + design sessions:
- `[f](jkl)` = hold f, roll jkl → move cursor 3 right
- `[w](jk)` = hold w, roll jk → 2 words forward
- `[w](l)` = 1 word reverse
- "Roll" metaphor — fluid, piano-like motion, not discrete keypresses
- Hold key selects mode (movement, selection, edit), rolled keys = magnitude + direction

Open design questions (in `../scrml-support/` context):
- jkl direction mapping — j=forward, k=continue, l=reverse?
- Roll detection timing
- Selection mode hold key
- Edit operation combos
- Composition with vim's visual mode / text objects

---

## D. Prerequisites (not in this repo)

- [ ][ ] **Compiler API exposure** — `scrmlTS` must expose a programmatic API so the editor can call into the compiler for semantic features (errors, completions, hover, etc.)
- [ ][ ] **Performance + PWA architecture spec** — authored before scaffolding
- [ ][ ] **scrml compiler in scrml** — needed so the editor (written in scrml) can embed the compiler directly

---

## E. Open work

### Not started
- [ ][ ] Compiler API exposure (in scrmlTS)
- [ ][ ] Performance + PWA architecture spec
- [ ][ ] Editor scaffolding (CM6 + canvas overlay)
- [~][~] Z-motion spec — v0.1 draft landed in `z-motion-spec/`; §8 open questions unresolved (direction mapping, roll window, hold threshold, selection hold, operator composition, multi-cursor)
- [ ][ ] 3 open design questions: live preview granularity, error display, real-time collab

### Cleanup (post-split)
- [ ][ ] Cold project map (minimal — repo is small)
- [ ][ ] Non-compliance audit (trivial — nothing to drift yet)

---

## F. Cross-repo

- **scrmlTS** — compiler API target
- **scrml-support** — all editor research:
  - `6nz-editor-2026-03-30.md`
  - `6nz-editor-research-2026-04-02.md`
  - `6nz-rendering-architecture-2026-04-02.md`
- **scrml8** — frozen archive
