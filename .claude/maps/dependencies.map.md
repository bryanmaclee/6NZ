# dependencies.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Runtime Dependencies

Root `package.json`: no runtime dependencies declared.

## Dev / Build Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@playwright/test` | `1.60.0` | Top-level test runner (`scripts.test = "playwright test"`) |

Per-playground `test.js` harnesses use Puppeteer, resolved dynamically:
```js
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }
```
Puppeteer is NOT in root `package.json` — test.js files resolve it from `NODE_PATH` pointing at
`../scrml/node_modules` (see playground test.js comments: `NODE_PATH=$scrml/node_modules`).

## External Runtime Libraries (CDN-loaded per playground)

Loaded at runtime via `esm.sh` — no lockfile, no npm install.

| Playground | Library | Pinned version | Purpose |
|---|---|---|---|
| p3, p5, p6, p7, p8 | `codemirror@6.0.2` | yes | BasicSetup meta-package |
| p3, p5, p6, p7, p8 | `@codemirror/view@6` | `@6` | EditorView |
| p5, p6, p7, p8 | `@codemirror/state@6` | `@6` | EditorState |
| p8 | `@codemirror/autocomplete@6` | `@6` | CM6 autocomplete UI |
| p5, p6, p7, p8 | `@codemirror/lint@6` | `@6` | CM6 lint/diagnostic markers |

CDN load mechanism (p3 pattern): inject `<script type="module">` at runtime via `document.createElement`,
expose loaded module on `window.__cmMod`, dispatch `CustomEvent('cm-loaded')`, scrml listens via
`window.addEventListener`.

## External Process Dependencies

| Tool | How invoked | Used by |
|---|---|---|
| `scrml dev <file>` | CLI; resolved from PATH | All playgrounds (development serve) |
| `bun lsp/server.js --stdio` | Child process via `Bun.spawn` | `bridge.js` in p6, p8 |

Bridge resolves scrml dir at runtime: `new URL("../../../scrml", import.meta.url).pathname`.
Env overrides: `SCRML_DIR` (preferred) or `SCRMLTS_DIR` (legacy, pre-S200 rename).

## Internal Module Graph

All playgrounds are self-contained single-file `<program>` apps. No scrml `import` between them.
Conceptual build-on-top lineage (re-implementation, not import dependency):

```
p0 (classifier)       ─┐
p1 (mode machine)     ─┴─> p2 (classifier + mode + buffer)
                                └─> p5 (+ CM6) ──> p7 (+ z-motion)
p3 (CM6 probe)        ────────────> p5, p6, p7, p8
p6 (LSP diagnostics)  ────────────> p8 (+ completion + hover)
p4 (undo tree)        ─── standalone
p9 (editor IR)        ─── standalone (first non-CM6, first real editor-proper progress)
p10 (relevance nav)   ─── standalone (§36 input-state; rebuilt S14; 1 uncommitted change)
```

## Tags
#editor #6nz #map #dependencies #scrml #codemirror #playwright #lsp

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
