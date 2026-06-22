# structure.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Entry Points

No unified entry point. Each playground is an independent scrml program:

| Entry point | How to run |
|---|---|
| `src/playground-zero/app.scrml` | `scrml dev src/playground-zero/app.scrml` |
| `src/playground-one/app.scrml` | `scrml dev src/playground-one/app.scrml` |
| `src/playground-two/app.scrml` | `scrml dev src/playground-two/app.scrml` |
| `src/playground-three/app.scrml` | `scrml dev src/playground-three/app.scrml` |
| `src/playground-four/app.scrml` | `scrml dev src/playground-four/app.scrml` |
| `src/playground-five/app.scrml` | `scrml dev src/playground-five/app.scrml` |
| `src/playground-six/app.scrml` | bridge: `bun src/playground-six/bridge.js` then `scrml dev ...` |
| `src/playground-seven/app.scrml` | `scrml dev src/playground-seven/app.scrml` |
| `src/playground-eight/app.scrml` | bridge: `bun src/playground-eight/bridge.js` then `scrml dev ...` |
| `src/playground-nine/app.scrml` | `scrml dev src/playground-nine/app.scrml` |
| `src/playground-ten/app.scrml` | `scrml dev src/playground-ten/app.scrml` |
| `proto/6nz-playable/index.html` | open in browser; deployed to GitHub Pages |

## Directory Ownership

```
6nz/
├── src/                       11 scrml-native playgrounds (p0–p10); all green vs scrml v0.7.0
│   ├── playground-zero/       Z-motion classifier (SPEC v0.4 §5)  — app.scrml, README.md
│   ├── playground-one/        vim-mode <engine> machine (5 modes) — app.scrml, README.md
│   ├── playground-two/        hjkl + z-motion on a line buffer    — app.scrml
│   ├── playground-three/      CM6 mount probe via esm.sh          — app.scrml
│   ├── playground-four/       undo tree on line-indexed buffer     — app.scrml
│   ├── playground-five/       vim modes on real CM6 surface        — app.scrml, test.js
│   ├── playground-six/        LSP diagnostics over WebSocket       — app.scrml, bridge.js, test.js
│   ├── playground-seven/      z-motion on CM6                     — app.scrml, test.js
│   ├── playground-eight/      LSP completion + hover on CM6        — app.scrml, bridge.js, test.js
│   ├── playground-nine/       editor IR + logical traversal        — app.scrml, test.js
│   └── playground-ten/        relevance-region navigator + §36     — app.scrml, test.js
├── proto/                     non-scrml prototypes (vanilla JS; scrml-only rule waived here)
│   ├── 6nz-playable/          playable prototype, 62 scenarios, deployed to GitHub Pages
│   └── z-motion-feel/         throwaway z-motion feel-test
├── z-motion-spec/             Z-motion spec — CC0 open source, separate from proprietary editor
│   ├── SPEC.md                v0.5 authoritative (sustained gestures + release-order)
│   ├── default-bindings.md    v0.3 companion binding table
│   ├── README.md              intro + licensing
│   └── LICENSE                CC0 1.0 Universal
├── docs/
│   └── changelog.md           session-by-session changelog (newest first)
├── .github/workflows/
│   └── pages.yml              deploys proto/6nz-playable/ to GitHub Pages on push to main
├── handOffs/                  session rotation archive + cross-repo messaging dropbox
│   ├── hand-off-{1-14}.md     rotated session records (out of scope for mapping)
│   └── incoming/              unread cross-repo messages; read/ subdir is archive
├── editor-README.md           locked high-level design principles
├── editor-architecture.md     detailed architecture reasoning for 6 locked concepts (last updated S5 2026-04-12)
├── master-list.md             live inventory, locked decisions, bug ledger (last updated S14 2026-06-20)
├── pa.md                      per-repo PA directives + session workflow
├── hand-off.md                current session state (S15)
├── user-voice.md              per-repo verbatim user log (append-only)
├── package.json               stub: name="editor", version="0.1.0", devDep: @playwright/test@1.60.0
└── README.md                  public-facing README (NOTE: contains stale "scrmlTS" link — see non-compliance)
```

## Key Scope Notes

- **No editor shell exists.** `src/` is 11 exploratory playgrounds. Editor proper is gated on
  in-process compiler API. LSP path (L1-L4) is reachable now for dev-time tooling.
- **No root-level build system.** No Makefile, no webpack. Playgrounds run via `scrml dev`.
  Per-playground `test.js` harnesses use Puppeteer (Node/Bun).
- **Compiler is sibling repo.** `../scrml/` (renamed from `scrmlTS` at S200). Current version
  dogfooded: v0.7.0 (`80f2c190`); fixes AD/AE at `14fb0230`/`faa213c5` are newer than baseline.
- **Two licensing zones.** `z-motion-spec/` is CC0 open source. All else is proprietary.

## Ignored / Generated Paths

`node_modules/`, `dist/` (per-playground compiled output), `.git/`, `.claude/`, `handOffs/`

## Tags
#editor #6nz #map #structure #playgrounds #scrml

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
