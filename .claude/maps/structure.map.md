# structure.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Project Character

6nz is a scrml-native interactive development experience (code editor) — currently in
**exploratory implementation phase**. Design decisions are locked. 11 scrml playground apps
exist under `src/`, stress-testing the compiler and editor mechanics. Editor-proper work
(flogence-editor integration, real relevance-view, semantic features) is the next phase — the
playgrounds are the current primary subjects. Source is `.scrml`; JS files are harness-only.

## Entry Points

| File | Purpose |
|---|---|
| `src/playground-zero/app.scrml` | Z-motion release-order classifier (SPEC v0.4 §5) |
| `src/playground-one/app.scrml` | Vim-style mode state machine via scrml `<engine>` (5 modes) |
| `src/playground-two/app.scrml` | hjkl + z-motion rolls on a raw buffer with visible cursor |
| `src/playground-three/app.scrml` | CodeMirror 6 mount probe via esm.sh dynamic import |
| `src/playground-four/app.scrml` | Keystroke-granular undo tree on a line-indexed buffer |
| `src/playground-five/app.scrml` | Vim modes (Insert/Normal/Visual) on a real CM6 surface |
| `src/playground-six/app.scrml` | LSP diagnostics over WebSocket (CM6 + bridge.js) |
| `src/playground-seven/app.scrml` | Z-motion classifier grafted into vim-on-CM6 (p5 + p2) |
| `src/playground-eight/app.scrml` | LSP completion + hover on CM6 (extends p6) |
| `src/playground-nine/app.scrml` | Editor IR + logical traversal (step-into/out/sibling, auto-collapse) |
| `src/playground-ten/app.scrml` | Relevance-region navigator + §36 input-state panel |

Run pattern: `scrml dev src/playground-N/app.scrml`

## Directory Ownership

```
6nz/
├── src/                         11 scrml-native playgrounds (p0–p10); all green vs scrml v0.7.0
│   ├── playground-zero/         Z-motion classifier proof — app.scrml, README.md
│   ├── playground-one/          vim <engine> mode machine — app.scrml, README.md
│   ├── playground-two/          hjkl + z-motion on buffer — app.scrml
│   ├── playground-three/        CM6 mount probe via esm.sh — app.scrml
│   ├── playground-four/         undo tree on line-indexed buffer — app.scrml
│   ├── playground-five/         vim modes on CM6 — app.scrml, test.js
│   ├── playground-six/          LSP diagnostics/WebSocket — app.scrml, bridge.js, test.js
│   ├── playground-seven/        z-motion on CM6 — app.scrml, test.js
│   ├── playground-eight/        LSP completion+hover — app.scrml, bridge.js, test.js
│   ├── playground-nine/         editor IR + traversal — app.scrml, test.js
│   └── playground-ten/          relevance navigator + §36 — app.scrml, test.js [1 uncommitted change]
├── proto/                       non-scrml prototypes (vanilla JS; scrml-only rule waived)
│   ├── 6nz-playable/            playable prototype, 62 scenarios; deployed to GitHub Pages
│   └── z-motion-feel/           throwaway z-motion feel-test
├── z-motion-spec/               Z-motion spec — CC0 open source, separate from proprietary editor
│   ├── SPEC.md                  v0.5 authoritative (sustained gestures + release-order)
│   ├── default-bindings.md      v0.3 companion binding table (partially stale vs v0.5)
│   ├── README.md                intro + licensing
│   └── LICENSE                  CC0 1.0 Universal
├── docs/
│   ├── changelog.md             session-by-session changelog (newest first; S14 current)
│   └── hand-off-{1-14}.md       rotated session records (historical; out of scope for mapping)
├── .github/workflows/
│   └── pages.yml                deploys proto/6nz-playable/ to GitHub Pages on main push
├── handOffs/                    cross-repo message dropbox (incoming/, incoming/read/)
├── editor-README.md             locked high-level design principles (S4; still current)
├── editor-architecture.md       detailed arch reasoning — 6 locked concepts (last updated S5 2026-04-12)
├── master-list.md               live inventory + bug ledger (last updated S14 2026-06-20)
├── pa.md                        per-repo PA directives + session workflow (S209 practice)
├── hand-off.md                  current session state (S15 hand-off)
├── user-voice.md                verbatim user log (append-only)
├── package.json                 stub: name=editor, playwright devDep only
└── README.md                    public-facing README
```

## Harness Files (per-playground)

| File | Present in | Purpose |
|---|---|---|
| `test.js` | p5, p6, p7, p8, p9, p10 | Puppeteer smoke — boots `scrml dev`, drives page via headless Chrome |
| `bridge.js` | p6, p8 | Bun LSP bridge — spawns `scrml lsp/server.js --stdio`, forwards JSON-RPC over WebSocket |

LSP bridge ports: p6 = 3061, p8 = 3081. Puppeteer test ports: p5 = 3055, p6 = 3056, p7 = 3057, p8 = 3058, p9 = 3059, p10 = 3060.

## Compiler Reference

Compiler is sibling repo `../scrml/` (renamed from `scrmlTS` at S200). Resolved by bridge.js at
runtime via `new URL("../../../scrml", import.meta.url).pathname`. Env override: `SCRML_DIR` or
legacy `SCRMLTS_DIR`. Last dogfooded version: v0.7.0 (`80f2c190`). Current scrml HEAD: `dd5331e2`.

## Ignored / Generated Paths

`node_modules/`, `dist/` (per-playground compiled output, gitignored), `.git/`, `.claude/`

## Tags
#editor #6nz #map #structure #playgrounds #scrml

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
