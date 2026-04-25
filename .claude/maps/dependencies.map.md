# dependencies.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Runtime Dependencies

Root `package.json` is a stub: `{"name": "editor", "version": "0.1.0", "private": true}`.
No runtime dependencies declared at repo root.

## Dev / Build Dependencies

Root: none declared.

`proto/6nz-playable/package.json` (prototype only — not the editor):
- `puppeteer@^24.40.0` — headless browser used to run smoke tests for the playable prototype

## Internal Module Graph

Playground interdependencies (conceptual, not import-based — scrml has no source-level `import`):

- `playground-two` builds on concepts from `playground-zero` (classifier) and `playground-one` (mode machine) — same patterns, not imports
- `playground-three` is independent (CM6 probe)
- `playground-four` is independent (undo tree)
- All playgrounds are self-contained `<program>` scrml files

## External JS Integration (current pattern)

scrml has no source-level `import`. The working pattern for external libraries (from playground-three):
1. Inject a `<script>` tag at runtime that loads the ESM from a CDN (e.g. `esm.sh`)
2. Bridge the loaded exports back to scrml via `window.__name` + `CustomEvent`
3. Trigger from scrml via `^{ loadCm() }` (direct call in a side-effect block)

This is the only sanctioned path until `scrml vendor add` CLI lands in scrmlTS.

## Tags
#6nz #map #dependencies #scrml #proto

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
