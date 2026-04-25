# primary.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Project Fingerprint

Language:   scrml (all playground source) + vanilla JS (proto/6nz-playable/)
Framework:  CodeMirror 6 (locked architectural target; mounted in playground-three via esm.sh bridge)
Runtime:    Browser (scrml dev server for playgrounds; GitHub Pages for proto)
Type:       purpose-built code editor — exploratory implementation phase (no editor proper yet)
Size:       ~20 source files (5 scrml playgrounds + 1 JS prototype + 14 docs)

## Map Index

| Map                  | Status  | Contents                                                        |
|----------------------|---------|-----------------------------------------------------------------|
| structure.map.md     | present | directory layout, 6 entry points (per-playground)              |
| dependencies.map.md  | present | root stub (0 deps); proto/6nz-playable has puppeteer            |
| schema.map.md        | present | 3 scrml enum types, 3 reactive state shapes from playgrounds    |
| config.map.md        | present | 2 stub package.json files; 0 env vars                           |
| build.map.md         | present | per-playground scrml dev commands; 1 CI pipeline                |
| error.map.md         | present | inline status-string pattern; 8 compiler bugs filed to scrmlTS  |
| test.map.md          | present | puppeteer; 62 scenarios (proto) + 7/8/12/9/14 (playgrounds)    |
| infra.map.md         | present | GitHub Pages deployment for proto/6nz-playable/                 |
| api.map.md           | absent  | no routes or API surface                                        |
| state.map.md         | absent  | no centralized store (scrml @reactives are per-playground only) |
| events.map.md        | absent  | no event bus (DOM events only, no emitter system)               |
| auth.map.md          | absent  | no auth                                                         |
| domain.map.md        | absent  | no domain layer                                                 |
| style.map.md         | absent  | no design system (scoped CSS inside each playground's #{} block)|
| i18n.map.md          | absent  | no i18n                                                         |
| migrations.map.md    | absent  | no database                                                     |
| jobs.map.md          | absent  | no background jobs                                              |

## File Routing

types / interfaces / models           → schema.map.md
scrml enum types / reactive shapes    → schema.map.md
API routes / endpoints                → api.map.md (absent)
environment variables / config keys   → config.map.md
test patterns / fixtures              → test.map.md
build commands / CI stages            → build.map.md
directory layout / entry points       → structure.map.md
external packages                     → dependencies.map.md
auth flows / guards                   → auth.map.md (absent)
store shape / selectors               → state.map.md (absent)
event topics / payload shapes         → events.map.md (absent)
business rules / domain models        → domain.map.md (absent)
error types / handling patterns       → error.map.md
deployment / CI/CD                    → infra.map.md

## Key Facts

- **No editor source proper.** `src/` contains 5 scrml playgrounds (stress-tests against scrmlTS compiler). The 6nz editor itself does not yet exist — only semantic features (completions, live diagnostics, relevance view content) remain gated on scrmlTS compiler API exposure; exploratory UI/input work is unblocked.
- **Playground inventory (S8–S9):** zero=Z-motion classifier, one=mode machine via `<machine>`, two=hjkl+z-motion on buffer, three=CM6 mount via esm.sh bridge, four=undo tree on line-indexed buffer. All 5 pass their smoke tests.
- **External JS constraint:** No `import` in scrml source. External libraries (e.g. CM6) load at runtime via script-injection + `window.__name` + CustomEvent bridge, triggered by `^{ fn() }`. No build-time resolution, no lockfile.
- **`^{}` direct call syntax** (post-Bug-6 fix in scrmlTS) is the current preferred pattern for triggering out-of-band async loads from scrml.
- **Z-motion spec** (`z-motion-spec/SPEC.md`) is CC0 open-source at v0.5 (sustained gestures); companion `default-bindings.md` is v0.2 and partially stale against v0.5 (v0.3 rewrite queued).
- **proto/6nz-playable/** is a throwaway vanilla-JS prototype deployed to GitHub Pages (`https://bryanmaclee.github.io/6NZ/`); it is NOT the real editor architecture.
- **pa.md** was updated 2026-04-22: commit-auth rule relaxed (commits to main allowed after explicit per-session authorization) + cross-repo bug reports must include a self-contained minimal scrml reproducer.

## Tags
#6nz #map #primary #scrml #playgrounds #z-motion #exploratory-implementation

## Links
- [structure.map.md](./structure.map.md)
- [dependencies.map.md](./dependencies.map.md)
- [schema.map.md](./schema.map.md)
- [config.map.md](./config.map.md)
- [build.map.md](./build.map.md)
- [error.map.md](./error.map.md)
- [test.map.md](./test.map.md)
- [infra.map.md](./infra.map.md)
- [non-compliance.report.md](./non-compliance.report.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
