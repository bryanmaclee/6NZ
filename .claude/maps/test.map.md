# test.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## Test Framework

Root: `@playwright/test@1.60.0` declared; `npm test` runs `playwright test`.
No Playwright `.spec.ts` files exist yet — the Playwright suite is wired but empty.

Per-playground: standalone Puppeteer harnesses (`test.js` in each playground that has one).
Run individually: `NODE_PATH=$scrml/node_modules node src/playground-N/test.js`

## Test Categories

| Playground | test.js | Smoke checks | Status vs scrml v0.7.0 |
|---|---|---|---|
| playground-zero | none | (runtime-probed S14) | green — event-fix applied |
| playground-one | none | (runtime-probed S14) | green — event-fix applied |
| playground-two | none | (runtime-probed S14) | green — event-fix applied |
| playground-three | none | (runtime-probed S14) | CM6 mounts ✓ |
| playground-four | none | (runtime-probed S14) | green — event-fix applied |
| playground-five | `test.js` | 18 | PASS S14 |
| playground-six | `test.js` | 7 | PASS S14 (bridge required on port 3061) |
| playground-seven | `test.js` | 17 | PASS S14 |
| playground-eight | `test.js` | 9 | PASS S14 (bridge required on port 3081) |
| playground-nine | `test.js` | 13 | PASS S14 |
| playground-ten | `test.js` | 19 | PASS S14 (REBUILT S14) |

Total Puppeteer smoke assertions: 83 across 6 harnesses.

## What test.js harnesses assert (by playground)

- **p5 (18):** CM6 loads and mounts; Normal badge present; i→INSERT; Esc→NORMAL; v→VISUAL; v in VISUAL→NORMAL; hjkl move cursor; no page errors.
- **p6 (7):** CM6 mounts; LSP reaches ready; typing sends diagnostics; page is error-free.
- **p7 (17):** Same as p5 + z-motion: INSERT TAP of 'h' types 'h'; INSERT hold 'j'+tap → cursor down, no type; hold 'k'→up; hold 'l'→right; mode stays INSERT; no page errors.
- **p8 (9):** CM6 mounts; LSP reaches ready; initial doc clean; typing '@' returns completions (first: `lift`); typing '<' returns completions; hover path reachable; broken doc returns E-SCOPE-001 via LSP; no page errors.
- **p9 (13):** Tree renders recursive walk; initial cursor at root; auto-collapse ON initially; step-into/step-out/sibling/prev work; toggle fold; auto-collapse OFF expands; recursion works; no page errors.
- **p10 (19):** 4 regions render (for-lift); title "handleKey(e)" verbatim (Bug Z); URL "https://..." verbatim (Bug X); initial focus=0, badge=NAV; j/k navigate; exactly one .focused row; .focused MOVES with j/k (Bug-V); Enter toggles Nav↔Edit; badge updates; @transitions increments (Bug AB); o inserts/x removes; .focused stays correct under churn; no page errors.

## Fixtures & Factories

No separate fixture files. Each `test.js` defines inline scenario data and sample doc strings.
p6/p8 inject sample scrml source directly into the CM6 editor via keyboard dispatch.

## Pattern

Each harness:
1. Spawns `scrml dev <app.scrml> --port N` as child process; waits for `"Serving"` string on stdout
2. Launches Puppeteer headless Chrome; navigates to `http://localhost:N/`
3. Registers `page.on("pageerror", ...)` to collect runtime JS errors
4. Dispatches keyboard events via `page.keyboard.down/up/press/type`; waits via `page.waitForFunction` or `sleep()`
5. Asserts via a custom `check(name, bool, detail)` helper — logs pass/fail to stdout
6. Reports total pass/fail count; exits non-zero on any failure or collected page error

Zero pageerrors is always the final assertion. No mocks or stubs — all tests drive real scrml-compiled pages.

## Tags
#editor #6nz #map #test #scrml #puppeteer #playwright #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
