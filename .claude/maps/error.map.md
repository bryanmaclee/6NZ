# error.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Custom Error Types

No custom error types in scrml playground source. Playgrounds handle error conditions
via reactive string state (e.g. `@error = "..."`, `@status = "error: ..."`) rather than
thrown exceptions.

## Error Handling Patterns

Inline status strings — playground-three sets `@status` and `@error` reactives to
communicate load failure or DOM lookup failure (`"error: .cm-host not found"`).

Guard-style early returns — playground-zero's `classifyKeyup` returns early if key
not found in `@pressed`: `if (idx < 0) { return }`.

## Global Error Boundaries

None. No React `ErrorBoundary`, no Express error middleware, no global handler.

## Unhandled Error Risks

`proto/6nz-playable/test.js` — puppeteer smoke test is not run in CI; only run manually
via `node test.js`. No automated failure reporting.

Playground smoke tests (puppeteer, per-playground) are also manual — no CI trigger.

## Compiler Bugs Encountered (surfaced during playground work — filed to scrmlTS)

These are bugs in the scrmlTS compiler that affected playground authoring. Listed here
as context for anyone extending playground code; all were filed with repros:

| Bug | Symptom | Status |
|---|---|---|
| Bugs 1–6 | Various; surfaced during playground-zero | Fixed (scrmlTS S37) |
| Bug G | `fn name(p:T)->R` body dropped at codegen; implicit-return missing | Fixed |
| Bugs H, I, J, K | Surfaced during playground-four; filed with inline + sidecar repros | Filed to scrmlTS |

## Tags
#6nz #map #error #scrml #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
