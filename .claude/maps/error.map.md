# error.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Custom Error Types

No custom error classes in any scrml playground. Error conditions are surfaced via reactive string
state (`@cmError`, `@lspStatus`, `@lspError`, `@status`), not thrown exceptions.

## Error Handling Patterns

| Pattern | Where used |
|---|---|
| Reactive error string (`@cmError = e.message`) | p3, p5, p6, p7, p8 — CM6 load failures; `script.onerror` on injected `<script>` |
| Guard early return (`if (idx < 0) { return }`) | p0, p2, p9 — key-not-found / node-not-found guards |
| Status string reactive (`@lspStatus = "ready"/"error"`) | p6, p8 — LSP connection lifecycle display |
| Pageerror capture in test harness | p5–p10 test.js — `page.on("pageerror", ...)` collects and fails on runtime JS error |
| Try/catch in bridge.js | p6, p8 bridge.js — JSON parse errors on LSP frames |

## Global Error Boundaries

None. No React `ErrorBoundary`, no Express error middleware, no global `window.onerror` handler in
any playground. scrml's `<errorBoundary>` primitive is available in v0.7.0 but not used.

## Unhandled Error Risks

- Per-playground test.js files are run manually, not in CI. No automated failure reporting.
- Top-level `npm test` (Playwright) is wired but no Playwright `.spec.ts` files exist — running it produces 0 tests.
- p6/p8 bridges require manual startup before `scrml dev`; no startup guard.
- §36 input-state (`<keyboard id>`, `<mouse id>`) reads in markup interpolation are non-reactive (render-once). Ruled BY-DESIGN in scrml (§36.6). Pattern: use `@cell` bridge in `animationFrame` loop — this is the uncommitted p10 work.

## Compiler Bug Ledger (open items against scrml v0.7.0 `80f2c190`)

Full ledger with repros in `master-list.md §F`. Summary of open/in-flight items:

| Bug | Symptom | Status |
|---|---|---|
| AA | Bare tail `match` in `function` silently dropped; `return match` works | OPEN (lint regression) |
| AD | User fn name not renamed in attribute-value interp → runtime ReferenceError | FIXED `14fb0230` (post-`80f2c190`; re-verify needed) |
| AE | `name=` on `<engine>` broke transition write-guard → E-ENGINE-001-RT | FIXED `faa213c5` (post-`80f2c190`; re-verify needed; carry: p1/p2/p5/p7 will need migration off `name=` workaround when fix ships) |
| AF | §36 input-state markup interp is render-once / non-reactive | BY-DESIGN (§36.6); `@cell` bridge pattern is the answer |
| L  | BS brace-counter mismatch in strings | DEFERRED to M6 native parser |
| T  | `//` inside module-top `@cell` string literal (not function body) | DEFERRED to M6 native parser |
| U  | Bare `/` after close-tag mis-parsed as a closer | DEFERRED to M6 native parser |
| AG/AH | Uncommitted p10 bugs from §36 `@cell` bridge work | NOT YET FILED — in uncommitted p10 app.scrml |

All other S11-era bugs (H/I/J/K/M/N/O/P/Q/R/S/V/W/X/Y/Z/AB/AC) resolved or retracted.

## Tags
#editor #6nz #map #error #scrml #compiler-bugs #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
