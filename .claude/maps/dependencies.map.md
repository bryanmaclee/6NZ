# dependencies.map.md
# project: editor (6nz)
# updated: 2026-07-06T00:00:00Z  commit: 9af19a5

## Runtime Dependencies

Root `package.json`: no runtime dependencies.

## Dev / Build Dependencies

Root `package.json`:
- `@playwright/test@1.60.0` — sole test runner (`"test": "playwright test"`). Discovers all 12
  playground specs via `playwright.config.ts` (`testMatch: "**/*.pw.ts"`).

**S18: Puppeteer fully removed.** The 11 per-playground `test.js` harnesses that dynamically
required `puppeteer` / `puppeteer-core` from the scrml sibling repo were deleted this session and
ported to `@playwright/test` spec files (`app.pw.ts`). Puppeteer is no longer a dependency of this
repo in any form — direct, transitive, or sibling-resolved.

## Maintenance Tool Dependencies (scripts/)

`scripts/state.ts` — bun-runnable, **no npm deps**. Uses Node/Bun built-in modules only:

| Module | Usage |
|---|---|
| `node:child_process` (`execSync`) | `git rev-parse --short HEAD`, `git -C ../scrml rev-parse --short HEAD` |
| `node:fs` (`readdirSync`, `readFileSync`, `statSync`, `existsSync`, `writeFileSync`) | Walk src/, read changelog.md, read flogence-intake.md, write digest.md |
| `node:path` (`join`, `resolve`) | Resolve ROOT = repo root (`import.meta.dir + /..`) |

Run with `bun scripts/state.ts --digest` or `bun scripts/state.ts --check`. No bun lockfile or `bun.lockb` — the script is dependency-free.

## Test Helper Dependencies (src/_pw/)

`src/_pw/scrml-dev.ts` — no npm deps. Uses Node built-ins only (`node:child_process` for
`spawn`/`ChildProcess`). Imported by every `app.pw.ts` spec as `bootScrmlDev`/`killScrmlDev`.
See `test.map.md`.

## External Runtime Dependencies (per-playground, loaded via CDN at runtime)

| Playground | Library | Load mechanism |
|---|---|---|
| p3, p5, p7 | CodeMirror 6 (`@codemirror/view`, `@codemirror/state`, `codemirror`) | Dynamic `import()` from `esm.sh` inside scrml `^{}` block |
| p6, p8 | CodeMirror 6 + `@codemirror/autocomplete` + `@codemirror/lint` | Same CDN pattern |
| p6, p8 | scrml LSP server (`bun lsp/server.js`) | Via `bridge.js` child process |

No version pinning or lockfile for CDN-loaded libraries. Version is resolved by `esm.sh` at
runtime. **S18:** the p3/p5/p6/p7/p8 Playwright specs each install a `page.route(/https:\/\/esm\.sh\//, ...)`
resilience shim in the test (not the app) that pin-redirects `@codemirror/view` range requests to
`6.43.0` on an esm.sh 5xx — see `test.map.md`.

## Internal Module Graph

All playgrounds are authored as self-contained single-file scrml `<program>`s — a **6nz convention,
not a language limit.** scrml HAS a Module/Import System (SPEC §21/§41): stdlib `import {x} from
'scrml:NAME'`, relative-path `import {x} from './f.js'`, `vendor:`, and **cross-file scrml
component/engine splitting** (`<Component/>` / `<EngineName/>` use-site mount tags — tutorial.md §3.3
+ :551). What it lacks is **npm/bare-specifier** imports (`from 'lodash'` → `E-IMPORT-005`). So the
playgrounds *could* import each other; they simply don't (each is an isolated probe). Conceptual
build-on-top lineage below is re-implementation, NOT a forced limitation:

```
playground-zero  (classifier)  ──→ playground-two (classifier + mode machine + buffer)
playground-one   (mode machine) ─┘    ──→ playground-five (+ CM6)
                                               ──→ playground-seven (+ z-motion)
playground-three (CM6 probe)    ──→ playground-five, -six, -seven, -eight
playground-six   (LSP wire)     ──→ playground-eight (+ completion + hover)
playground-four  (undo tree)    ─── standalone
playground-nine  (editor IR)    ─── standalone (first non-CM6 playground)
playground-ten   (relevance nav) ── standalone (§36 input-state; canonical animationFrame @cell bridge S15)
playground-eleven (flonav)      ─── standalone (floView-shaped tree; first flogence-integration
                                     artifact) [NEW S18]
```

## External JS Integration Pattern

scrml has no **npm/CDN** `import` path (bare specifiers → `E-IMPORT-005`). Sanctioned path for external (npm-style) libraries:
1. Inject `<script>` at runtime loading ESM from `esm.sh`
2. Bridge exports to scrml via `window.__name` + `CustomEvent`
3. Trigger from scrml via `^{ loadCm() }` (side-effect block)

See `master-list.md §G` for full constraint list. `scrml vendor add` CLI (planned in scrml) will
eventually provide a cleaner path.

## Tags
#editor #6nz #map #dependencies #scrml #codemirror #playwright #bun

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [test.map.md](./test.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
