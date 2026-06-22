# 6nz

A purpose-built code editor for the [scrml](../scrml) ecosystem — an
"Interactive Development Experience" written entirely in scrml.

**Status:** exploratory implementation phase. Eleven scrml-native playgrounds
(`src/playground-zero` … `playground-ten`) stress-test the language and compiler
ahead of editor-proper work. The editor proper (real IR, relevance view content,
live diagnostics, completion) remains gated on scrml compiler API exposure.

## Try it

[**Live playground →**](https://bryanmaclee.github.io/6NZ/) — a playable prototype
of the editor feel: vim normal/visual, Z-motion insert layer, syntax highlighting,
command palette, virtual workspace. Vanilla JS on a textarea (not the real editor
architecture, but the input model is real). Source at
[`proto/6nz-playable/`](./proto/6nz-playable/).

## What's here

- [`editor-README.md`](./editor-README.md) — design principles (focus-centered
  viewport, NeoVim superset + mouse, CM6 + canvas overlay, offline-first PWA).
- [`z-motion-spec/`](./z-motion-spec/) — the Z-motion input specification.
  Open source (CC0), free for anyone to adopt. The grammar is stable; the
  default key bindings are a working draft and open to change.
- [`src/`](./src/) — eleven scrml-native playgrounds (p0–p10) exercising the
  language against the live compiler. Exploratory; not the editor proper.
- [`master-list.md`](./master-list.md) — live inventory and locked decisions.

## Licensing

- **6nz editor** — proprietary / commercial.
- **Z-motion spec** — CC0, free to adopt. See [`z-motion-spec/LICENSE`](./z-motion-spec/LICENSE).
