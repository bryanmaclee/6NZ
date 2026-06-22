# config.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Environment Variables

No `.env.example` or `.env.template` at repo root.

Variables referenced in source (bridge.js in p6 and p8):

| Key | Required | Default | Description |
|---|---|---|---|
| `PORT` | optional | p6: `3061`, p8: `3081` | WebSocket port for the LSP bridge |
| `SCRML_DIR` | optional | `../../../scrml` (relative to bridge.js) | Path to scrml compiler repo |
| `SCRMLTS_DIR` | optional | same as `SCRML_DIR` | Legacy alias for `SCRML_DIR` (pre-S200 scrmlTS→scrml rename); still accepted |

`SCRML_DIR` default resolves via `new URL("../../../scrml", import.meta.url).pathname` — machine-portable.

## Feature Flags

No formal feature flags. Runtime toggle in playground-nine:

| Flag | Where | Default | Effect |
|---|---|---|---|
| `@autoCollapse` | `src/playground-nine/app.scrml` | `true` | Cursor-driven auto-collapse of IR tree (locked design principle) |

## Config Files

### package.json (repo root)
```
name:    "editor"
version: "0.1.0"
private: true
scripts.test: "playwright test"
devDependencies["@playwright/test"]: "1.60.0"
```

### .github/workflows/pages.yml
```
trigger:  push to main on proto/6nz-playable/** or .github/workflows/pages.yml; also workflow_dispatch
deploy:   GitHub Pages via actions/upload-pages-artifact + actions/deploy-pages
source:   proto/6nz-playable/index.html → _site/index.html
```

## Tags
#editor #6nz #map #config #scrml #bridge #lsp

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
