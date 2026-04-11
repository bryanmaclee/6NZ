# primary.map.md
# project: editor (6nz)
# updated: 2026-04-11T00:00:00Z  commit: 41bce06

## Project Fingerprint

Language:   scrml (planned; none written yet) — stub package.json only
Framework:  CodeMirror 6 + canvas overlay (design decision locked, not implemented)
Runtime:    Browser PWA (design decision locked, not implemented)
Type:       purpose-built code editor — design phase
Size:       6 files (5 docs + 1 stub manifest)

## Map Index

| Map                  | Status  | Contents                                               |
|----------------------|---------|--------------------------------------------------------|
| structure.map.md     | present | directory layout, planned dirs, no entry points        |
| dependencies.map.md  | present | 0 declared deps; CM6 + scrmlTS compiler anticipated    |
| schema.map.md        | present | 0 types/models (no source)                             |
| config.map.md        | present | 3 manifest fields; no env vars                         |
| build.map.md         | present | 0 commands, no CI, no Docker                           |
| error.map.md         | present | 0 error types (no source)                              |
| test.map.md          | present | no framework, 0 test files                             |
| api.map.md           | absent  | no routes or API surface (no source)                   |
| state.map.md         | absent  | no state management (no source)                        |
| events.map.md        | absent  | no event system (no source)                            |
| auth.map.md          | absent  | no auth (no source)                                    |
| domain.map.md        | absent  | no domain layer (no source)                            |
| style.map.md         | absent  | no styling system (no source)                          |
| i18n.map.md          | absent  | no i18n (no source)                                    |
| infra.map.md         | absent  | no infra config (no source)                            |
| migrations.map.md    | absent  | no migrations (no source)                              |
| jobs.map.md          | absent  | no jobs/workers (no source)                            |

## File Routing

types / interfaces / models           → schema.map.md
API routes / endpoints                → api.map.md (absent — no source)
environment variables / config keys   → config.map.md
test patterns / fixtures              → test.map.md
build commands / CI stages            → build.map.md
directory layout / entry points       → structure.map.md
external packages                     → dependencies.map.md
auth flows / guards                   → auth.map.md (absent — no source)
store shape / selectors               → state.map.md (absent — no source)
event topics / payload shapes         → events.map.md (absent — no source)
business rules / domain models        → domain.map.md (absent — no source)
error types / handling patterns       → error.map.md

## Key Facts

- No source code exists; implementation is blocked on scrmlTS compiler API exposure (upstream repo)
- The editor will be written entirely in scrml and compiled by the scrml compiler (dogfooding)
- Architecture is locked: PWA, CodeMirror 6 as editing surface, canvas overlay for custom rendering
- DOM text is used for rendered text (not canvas-rendered); canvas is overlay only
- Z-motion spec (`[hold](roll)` chord model) will be open source MIT/CC0; editor itself is proprietary
- Planned SQLite-backed config store (`app.db.sql`) for editor settings, recent files, snippets
- `editor-README.md` contains one non-compliant section (planned file tree + stale "decision pending" line) — see non-compliance.report.md

## Tags
#editor #6nz #map #primary #design-phase

## Links
- [structure.map.md](./structure.map.md)
- [dependencies.map.md](./dependencies.map.md)
- [schema.map.md](./schema.map.md)
- [config.map.md](./config.map.md)
- [build.map.md](./build.map.md)
- [error.map.md](./error.map.md)
- [test.map.md](./test.map.md)
- [non-compliance.report.md](./non-compliance.report.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
