# infra.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Deployment

| Environment | Platform | What's deployed |
|---|---|---|
| production | GitHub Pages (`bryanmaclee.github.io/6NZ/`) | `proto/6nz-playable/index.html` (vanilla-JS prototype only) |

Nothing else is deployed. The 11 scrml playgrounds under `src/` are development-only (run via
`scrml dev` local server). No staging environment. No server-side compute.

## Cloud Resources

GitHub Pages — static hosting for the vanilla-JS prototype only.
No other cloud resources (no database, no server, no CDN beyond GitHub Pages built-in).

## CI/CD

Provider: GitHub Actions
Workflow: `.github/workflows/pages.yml`
Deploy trigger: push to `main` filtering `proto/6nz-playable/**` or `.github/workflows/pages.yml`; also `workflow_dispatch`

Stages:
1. `build` — `actions/checkout@v4`, copy `proto/6nz-playable/index.html` + `README.md` to `_site/`, `actions/upload-pages-artifact`
2. `deploy` — `actions/deploy-pages` (environment: `github-pages`)

No automated test run in CI. All smoke tests are manual.

## Docker

No containers.

## External Services (dev-time only)

| Service | Used by | Purpose |
|---|---|---|
| `esm.sh` CDN | p3, p5, p6, p7, p8 | CodeMirror 6 and related libraries loaded at runtime via dynamic import |
| `../scrml/lsp/server.js` | bridge.js in p6, p8 | scrml LSP child process for diagnostics/completion/hover |

## Tags
#editor #6nz #map #infra #github-pages #ci #github-actions

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
