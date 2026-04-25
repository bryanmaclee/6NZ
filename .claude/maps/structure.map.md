# structure.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Entry Points

No unified application entry point. Each playground is invoked individually:

| Entry point | How to run |
|---|---|
| `src/playground-zero/app.scrml` | `scrml dev src/playground-zero/app.scrml` |
| `src/playground-one/app.scrml`  | `scrml dev src/playground-one/app.scrml`  |
| `src/playground-two/app.scrml`  | `scrml dev src/playground-two/app.scrml`  |
| `src/playground-three/app.scrml`| `scrml dev src/playground-three/app.scrml`|
| `src/playground-four/app.scrml` | `scrml dev src/playground-four/app.scrml` |
| `proto/6nz-playable/index.html` | open in browser (also deployed to GitHub Pages) |
| `proto/6nz-playable/test.js`    | `node test.js` (puppeteer smoke tests for the prototype) |

## Directory Ownership

```
6nz/
├── src/                      scrml-native playground experiments (stress-tests against scrmlTS)
│   ├── playground-zero/      Z-motion release-order classifier — app.scrml, README.md
│   ├── playground-one/       vim-mode state machine via <machine> primitive — app.scrml, README.md
│   ├── playground-two/       hjkl + z-motion on a line-indexed text buffer — app.scrml
│   ├── playground-three/     CodeMirror 6 mount probe (esm.sh bridge) — app.scrml
│   └── playground-four/      keystroke-granular undo tree on line-indexed buffer — app.scrml
├── proto/                    throwaway non-scrml prototypes (scrml-only rule waived inside here)
│   ├── 6nz-playable/         vanilla-JS playable prototype; deployed to GitHub Pages; puppeteer tests
│   └── z-motion-feel/        older single-file z-motion input grammar feel-test (throwaway)
├── z-motion-spec/            Z-motion input specification — CC0 open source, separate from editor
│   ├── SPEC.md               v0.5 authoritative spec (sustained gestures + release-order classification)
│   ├── default-bindings.md   v0.2 companion binding table (partially stale against v0.5; v0.3 planned)
│   ├── README.md             intro, motivation, licensing, status
│   └── LICENSE               CC0 1.0 Universal dedication
├── .github/
│   └── workflows/
│       └── pages.yml         CI/CD: deploys proto/6nz-playable/ to GitHub Pages on push to main
├── handOffs/                 session hand-off rotation + cross-repo messaging dropbox
│   ├── hand-off-{1-9}.md     rotated session records (sessions 1–9, excluded from mapping)
│   └── incoming/             unread cross-repo messages; read/ subdir is archive
├── editor-README.md          locked high-level design principles (focus-centered viewport, CM6, PWA)
├── editor-architecture.md    detailed architecture reasoning for 6 locked concepts (updated S5, 2026-04-12)
├── master-list.md            live inventory, locked decisions, prerequisites, open work (updated S9, 2026-04-22)
├── pa.md                     per-repo PA directives (updated 2026-04-22: commit-auth relaxation, bug-report rule)
├── package.json              stub: name="editor", version="0.1.0", private=true — no real deps
├── README.md                 public-facing description; links to live playground
└── user-voice.md             per-repo verbatim user log (append-only; per-repo as of 2026-04-14)
```

## Ignored / Generated Paths

- `node_modules/` (inside `proto/6nz-playable/` — puppeteer only)
- `.git/`
- `.claude/maps/` (this directory — not mapped recursively)
- `handOffs/` (historical records, excluded per scope rules)

## Key Scope Notes

- **No editor source proper.** `src/` contains only exploratory playgrounds. The 6nz editor implementation does not exist yet — it is gated on scrmlTS compiler API exposure.
- **No root-level build system.** No Makefile, no webpack, no unified test runner. Playgrounds run via `scrml dev`; prototype uses Node + puppeteer.
- **No backend, no API, no database.**
- **Two licensing zones:** `z-motion-spec/` is CC0 open source; all other 6nz code and docs are proprietary.

## Tags
#6nz #map #structure #scrml #playgrounds #z-motion

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
