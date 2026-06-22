# error.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Custom Error Types

No custom error classes in any scrml playground. Error conditions are surfaced via reactive
string state (e.g. `@status`, `@cmError`, `@lspStatus`), not thrown exceptions.

## Error Handling Patterns

| Pattern | Where used |
|---|---|
| Reactive error string (`@cmError = e.message`) | p5, p8 — CM6 load failures; `onerror` on injected `<script>` |
| Guard early return (`if (idx < 0) { return }`) | p0, p9 — key-not-found / node-not-found guards |
| Pageerror capture in test harness | All test.js harnesses — `page.on("pageerror", ...)` collects and fails on any runtime JS error |
| Status-string reactive (`@lspStatus = "ready" / "error"`) | p6, p8 — LSP connection lifecycle display |

## Global Error Boundaries

None. No React `ErrorBoundary`, no Express error middleware, no global JS `window.onerror` handler.
Scrml's `<errorBoundary>` primitive is available in v0.7.0 but not used in any current playground.

## Unhandled Error Risks

- Playground test.js files are run manually, not in CI. No automated failure reporting for scrml playground regressions.
- The top-level `npm test` (Playwright) is wired but no Playwright test files exist yet — running it would report 0 tests or an error.
- p6/p8 bridges require manual startup before `scrml dev`; no guard if bridge is missing.

## Compiler Bug Ledger (current status vs scrml v0.7.0)

These are bugs in the scrml compiler (sibling repo `../scrml/`) surfaced by playground work.
Full ledger with repros is in `master-list.md §F`. Summary of open/relevant items:

| Bug | Symptom | Status vs v0.7.0 |
|---|---|---|
| AA | bare tail `match` in a plain `function` silently dropped (value-discard) | OPEN — workaround: `return match` |
| L | BS brace-counter mismatch in strings | DEFERRED to M6 native parser |
| T | `//` inside a module-top `@cell` string literal (not function body) | DEFERRED to M6 native parser |
| U | bare `/` after a close-tag mis-parsed as a closer | DEFERRED to M6 native parser |
| AD | user fn in attribute-value interp (`class="${fn()}"`) emitted without rename | RESOLVED `14fb0230` (newer than `80f2c190` baseline — re-test needed) |
| AE | `name=` on `<engine>` broke transition write-guard | RESOLVED `faa213c5` (newer than baseline — re-test needed) |

All other S11-era bugs (H/I/J/K/L/M/N/O/P/Q/R/S/T/V/W) resolved or deferred.

## Tags
#editor #6nz #map #error #scrml #compiler-bugs #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
