# test.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## Test Framework

Root: `@playwright/test@1.60.0` is declared; `npm test` runs `playwright test`.
No Playwright test files exist yet — the Playwright suite is wired but empty.

Per-playground: standalone Puppeteer harnesses (`test.js` in each playground directory).
These are independent of Playwright and run via `node src/playground-N/test.js`.

## Test Categories

| Playground | Test file | Smoke count | Status (vs scrml v0.7.0) |
|---|---|---|---|
| playground-zero | none (no test.js) | 7 checks embedded in p0 README | runtime-probed S14 |
| playground-one | none (no test.js) | — | runtime-probed S14 |
| playground-two | none (no test.js) | 12 checks documented | runtime-probed S14 |
| playground-three | none (no test.js) | 9 checks documented | CM6 ✓ S14 |
| playground-four | none (no test.js) | 14 checks documented | runtime-probed S14 |
| playground-five | `src/playground-five/test.js` | 18/18 | PASS S14 |
| playground-six | `src/playground-six/test.js` | 7/7 | PASS S14 |
| playground-seven | `src/playground-seven/test.js` | 17/17 | PASS S14 |
| playground-eight | `src/playground-eight/test.js` | 9/9 | PASS S14 |
| playground-nine | `src/playground-nine/test.js` | 13/13 | PASS S14 |
| playground-ten | `src/playground-ten/test.js` | 19/19 | PASS S14 (rebuilt) |
| proto/6nz-playable | (prototype) | 62 scenarios | manual; not scrml source |

Run individual: `node src/playground-N/test.js`
Run p6/p8: start bridge first (`bun src/playground-six/bridge.js`), then `node src/playground-six/test.js`

## Fixtures & Factories

No separate fixture files. Each `test.js` defines inline scenario data.

p6/p8 test.js — sample scrml source strings embedded inline:
```js
const SAMPLE_DOC = `<program>\n${...}\n`
```

p9/p10 test.js — DOM assertions against rendered tree structure; no fixture objects.

## Pattern

Tests are Puppeteer-driven real-browser scenarios. Each harness:
1. Spawns `scrml dev` as a child process, waits for the dev server to be ready
2. Launches Puppeteer, navigates to `http://localhost:3000`
3. Registers `page.on("pageerror", ...)` to catch runtime JS errors
4. Dispatches keyboard events (type, keydown/keyup) and waits for DOM state
5. Asserts via a custom `check(name, condition, detail)` function that logs pass/fail
6. Reports total passed/failed at end; exits with non-zero on any failure

Assertion style: `check("description", booleanExpr, optionalDetail)` — explicit pass/fail logging.
Zero pageerrors is always the final check in each harness.

## Tags
#editor #6nz #map #test #scrml #puppeteer #playwright #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
