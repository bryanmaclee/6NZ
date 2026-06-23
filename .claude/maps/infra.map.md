# infra.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Deployment

| Environment | Platform | What's deployed |
|---|---|---|
| production | GitHub Pages (`bryanmaclee.github.io/6NZ/`) | `proto/6nz-playable/index.html` only |

Nothing else is deployed. The scrml playgrounds under `src/` are development-only
(run via `scrml dev` local server). No staging environment. No server-side deployment.

## Cloud Resources

GitHub Pages — static hosting for the vanilla-JS prototype.
No other cloud resources (no database, no compute, no server, no CDN beyond GitHub Pages built-in).

## CI/CD

Provider: GitHub Actions
Workflow: `.github/workflows/pages.yml`
Deploy trigger: push to `main` filtering `proto/6nz-playable/**` or `pages.yml` + `workflow_dispatch`

Stages:
1. `build` — checkout, copy `proto/6nz-playable/index.html` + `README.md` to `_site/`, upload Pages artifact
2. `deploy` — deploy `_site/` to GitHub Pages (environment: `github-pages`)

No automated test run in CI. Smoke tests are manual only.

## Docker

No containers.

## External Services (runtime, dev-time only)

- `esm.sh` CDN — CM6 and related libraries loaded at runtime by p3/p5/p6/p7/p8
- scrml LSP server (`../scrml/lsp/server.js`) — spawned by bridge.js (p6, p8) for dev-time diagnostics/completion

## Tags
#editor #6nz #map #infra #github-pages #ci #github-actions

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
