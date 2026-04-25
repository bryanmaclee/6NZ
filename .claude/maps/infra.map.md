# infra.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Deployment

| Environment | Platform | What's deployed |
|---|---|---|
| production | GitHub Pages (`bryanmaclee.github.io/6NZ/`) | `proto/6nz-playable/index.html` only |

Nothing else is deployed. The scrml playgrounds under `src/` are development-only
(`scrml dev` local server). No staging environment.

## Cloud Resources

GitHub Pages — static hosting for the vanilla-JS prototype.
No other cloud resources (no database, no compute, no CDN beyond GitHub Pages built-in).

## CI/CD

Provider: GitHub Actions
Workflow: `.github/workflows/pages.yml`
Deploy trigger: push to `main` (path filter: `proto/6nz-playable/**` or the workflow file itself) + manual dispatch

## Docker

No containers.

## Tags
#6nz #map #infra #github-pages #ci

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
