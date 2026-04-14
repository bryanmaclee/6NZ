# 6nz-playable — concept prototype

**Throwaway. Not real 6nz.** Vanilla HTML/JS on a `<textarea>`. Real 6nz will be CM6 + scrml once the compiler API is exposed.

## What this is

A single-file prototype so early adopters can *type into* a thing that feels like 6nz — enough to get the concepts across without waiting on the real implementation.

Open `index.html` in a browser. No build. No server needed (File System Access API works on `file://` in Chromium; Firefox falls back to download/upload).

## What works

- Open / Save / Save As via File System Access API (Chromium) or download+upload fallback
- Vim modes: `Esc` → normal, `i`/`a`/`o`/`I`/`A`/`O` → insert, `v`/`V` → visual
- Core vim motions: `h j k l`, `w b e`, `0 ^ $`, `gg G`, `H M L`, `{ }`, `%`, `f/F/t/T<char>`, `; ,`, `n N`, `*`, counts (`3w` etc.)
- Core vim edits: `x X`, `dd yy`, `D C Y`, `dw cw d$ c$ y$`, `diw ciw yaw` (subset), `p P`, `u`, `Ctrl+R`, `r<c>`, `J`, `~`, `>> <<`
- Ex commands: `:w :q :wq :e :<N>` (line jump)
- Search: `/pat`, `?pat`, `n N`, `*`
- Visual mode: motions extend selection; `d c y x > < y ~` operate on selection; `V` for line-visual
- **Z-motions in insert mode** (SPEC v0.5 release-order classifier):
  - `[h]` char motion — `[h](a..asdf)` right 1–4, `[h](f..fdsa)` left 1–4
  - `[w]` word forward/back
  - `[e]` word-end forward/back
  - `[sd]` / `[ds]` vertical (multi-key hold)
  - `[a]` line anchors (`l`=0, `lk`=^, `j`=$)
  - `[g]` doc/viewport (`l`=gg, `j`=G, `k`=M, `lk`=H, `jk`=L)
  - `[p]` paragraph forward/back
  - `[m](d)` match `%`
  - `[u](g)` undo (sustained: `[u](g,g,g)` undoes three steps)

## What's intentionally missing

- Syntax highlighting (it's a plain textarea)
- Registers beyond the unnamed one
- Macros, marks, jump list, change list
- Multi-cursor
- The 6nz headline concepts (relevance view, inline expansion, focus-centered viewport) — those require the compiler API
- LSP, intellisense, any scrml-aware anything
- Dot-repeat (`.`)

## Defaults chosen (sane, changeable later)

- Line numbers always on (no `:set nu` needed)
- Tab = 2 spaces (textarea default)
- No normal-mode toggle hold key (SPEC §10.3) — use `Esc` instead; toggle keys interact with find-char (`[f]`) awkwardly enough that this prototype skips them
- Z-motion `[u](b)` is aliased to `[u](g)` — no separate "motion boundary" tier tracked in this demo

## Known warts

- `f`/`t` find-char is implemented in normal mode, NOT as a z-motion hold — z-motion `[f](<char>)` would require accepting arbitrary letters as roll keys, which collides with typing. Left for a later pass.
- Visual-line selection highlighting uses the browser's native selection; it extends one line at a time but doesn't always look like vim.
- The undo stack is homegrown and only snapshots full text. Motion-boundary undo tiers from SPEC §6.4.4 are collapsed into "granular."
- Paste after yank (`p`) approximates vim's cursor behavior but isn't pixel-perfect.
- No `.` (dot-repeat).

## Testing

`node test.js` runs a puppeteer harness against `index.html` — 54 scenarios covering normal motions, edits, operators, visual mode, z-motions, and plain typing. Each scenario resets state via `window.__6nz_reset(text, pos)`, enters the target mode, dispatches key events, and asserts `{ text, pos, mode }`.

Currently: **54 passed, 0 failed.**

## Why textarea, not CM6

The existing `proto/z-motion-feel/index.html` proved the release-order classifier works on a raw textarea. Rebuilding against CodeMirror 6 would double the surface area for no prototype-relevant gain. Real 6nz will be CM6 — this demo isn't.
