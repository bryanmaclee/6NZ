# config.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Environment Variables

No `.env.example` or `.env.template` at repo root.

Variables referenced in `bridge.js` files (playground-six and playground-eight):

| Key | Required | Default | Description |
|---|---|---|---|
| `PORT` | optional | p6: `3061`, p8: `3081` | WebSocket port for the LSP bridge |
| `SCRML_DIR` | optional | resolved relative to bridge.js | Path to the scrml compiler repo (`../scrml/`) |
| `SCRMLTS_DIR` | optional | same as SCRML_DIR | Legacy alias for `SCRML_DIR` (pre-S200 rename); still accepted |

Note: `SCRML_DIR` default resolves via `new URL("../../../scrml", import.meta.url).pathname` —
machine-portable since S200 migration. `SCRMLTS_DIR` remains accepted but is a stale name.

## Feature Flags

No formal feature flags. Playgrounds have per-playground boolean reactive cells that function
as runtime toggles:
- `@autoCollapse` (playground-nine) — toggles cursor-driven auto-collapse on/off; default `true`

## Config Files

### package.json (repo root)
- `name`: "editor"
- `version`: "0.1.0"
- `private`: true
- `scripts.test`: "playwright test"
- `devDependencies["@playwright/test"]`: "1.60.0"

### proto/6nz-playable/package.json (prototype only — not the editor)
- `name`: "6nz-playable"
- `version`: "1.0.0"
- (Puppeteer and other dev deps for the vanilla-JS prototype smoke tests)

### .github/workflows/pages.yml
- Trigger: push to `main` on `proto/6nz-playable/**` or `.github/workflows/pages.yml`
- Deploy target: GitHub Pages

## Tags
#editor #6nz #map #config #scrml #bridge #lsp

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
