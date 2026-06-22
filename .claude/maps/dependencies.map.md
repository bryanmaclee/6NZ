# dependencies.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Runtime Dependencies

Root `package.json`: no runtime dependencies. Stub only.

## Dev / Build Dependencies

Root `package.json`:
- `@playwright/test@1.60.0` — top-level test runner (Playwright; scripts: `"test": "playwright test"`)

Per-playground `test.js` harnesses use Puppeteer, loaded dynamically:
```js
try { puppeteer = require("puppeteer"); }
catch { puppeteer = require("puppeteer-core"); }
```
No Puppeteer in root `package.json` — test.js files resolve it from the playground's own `node_modules`
or the system. The p5/p6/p7/p8/p9/p10 test harnesses follow this pattern.

## External Runtime Dependencies (per-playground, loaded via CDN at runtime)

| Playground | Library | Load mechanism |
|---|---|---|
| p3, p5, p7 | CodeMirror 6 (`@codemirror/view`, `@codemirror/state`, `codemirror`) | Dynamic `import()` from `esm.sh` inside scrml `^{}` block |
| p6, p8 | CodeMirror 6 + `@codemirror/autocomplete` + `@codemirror/lint` | Same CDN pattern |
| p6, p8 | scrml LSP server (`bun lsp/server.js`) | Via `bridge.js` child process |

No version pinning or lockfile for CDN-loaded libraries. Version is resolved by `esm.sh` at runtime.

## Internal Module Graph

All playgrounds are self-contained scrml `<program>` files — scrml has no source-level `import`.
Conceptual build-on-top lineage (not imports):

```
playground-zero  (classifier)  ──→ playground-two (classifier + mode machine + buffer)
playground-one   (mode machine) ─┘    ──→ playground-five (+ CM6)
                                               ──→ playground-seven (+ z-motion)
playground-three (CM6 probe)    ──→ playground-five, -six, -seven, -eight
playground-six   (LSP wire)     ──→ playground-eight (+ completion + hover)
playground-four  (undo tree)    ─── standalone
playground-nine  (editor IR)    ─── standalone (first non-CM6 playground)
playground-ten   (relevance nav) ── standalone (§36 input-state; rebuilt S14)
```

## External JS Integration Pattern

scrml has no source-level `import`. Sanctioned path for external libraries:
1. Inject `<script>` at runtime loading ESM from `esm.sh`
2. Bridge exports to scrml via `window.__name` + `CustomEvent`
3. Trigger from scrml via `^{ loadCm() }` (side-effect block)

See `master-list.md §G` for full constraint list. `scrml vendor add` CLI (planned in scrml) will
eventually provide a cleaner path.

## Tags
#editor #6nz #map #dependencies #scrml #codemirror #playwright

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
