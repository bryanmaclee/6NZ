# build.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Development Commands

Root `package.json` has no `scripts` field.

Playground dev (per-playground, not unified):
```
scrml dev src/playground-zero/app.scrml     run playground-zero in dev mode
scrml dev src/playground-one/app.scrml      run playground-one
scrml dev src/playground-two/app.scrml      run playground-two
scrml dev src/playground-three/app.scrml    run playground-three (CM6 probe)
scrml dev src/playground-four/app.scrml     run playground-four (undo tree)
```

Prototype smoke tests:
```
cd proto/6nz-playable && node test.js       run puppeteer test harness against index.html
```

## Build & Release

No build tooling configured at repo root. No `Makefile`, no bundler config.
Playgrounds are built/served by `scrml dev` (the scrmlTS compiler's dev server).
`proto/6nz-playable/index.html` is a self-contained single-file HTML — no build step.

## CI/CD Pipeline  [`.github/workflows/pages.yml`]

**Deploy playground to GitHub Pages**
Triggers: push to `main` (path filter: `proto/6nz-playable/**` or `pages.yml`) + `workflow_dispatch`

| Stage | What it does |
|---|---|
| build | `actions/checkout@v4` → copies `proto/6nz-playable/index.html` + `README.md` to `_site/` → uploads Pages artifact |
| deploy | deploys `_site/` to GitHub Pages environment |

Live URL: `https://bryanmaclee.github.io/6NZ/`

## Docker

No Dockerfile, no docker-compose.

## Tags
#6nz #map #build #ci #github-pages #scrml

## Links
- [primary.map.md](./primary.map.md)
- [infra.map.md](./infra.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
