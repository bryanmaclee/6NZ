# test.map.md
# project: editor (6nz)
# updated: 2026-06-24T00:00:00Z  commit: 2ab2f4d

## Test Framework

Root: `@playwright/test@1.60.0` is declared in `package.json`; `npm test` runs `playwright test`.
No Playwright test files exist — the Playwright suite is wired but empty and unused.

Per-playground: standalone Puppeteer harnesses (`test.js` in each playground directory).
These are independent of Playwright. Puppeteer is NOT installed at the repo root — it is
resolved from the scrml monorepo sibling via `NODE_PATH`.

Run command: `NODE_PATH=/home/bryan-maclee/scrmlMaster/scrml/node_modules node src/playground-N/test.js`

Each harness boots its own `scrml dev <app.scrml> --port 305N` child process, then drives it
headless. Port assignments: p0=3050, p1=3051, p2=3052, p3=3053, p4=3054, p5=3055 … p10=3060.

## Test Categories

| Playground | Test file | Checks | Notes |
|---|---|---|---|
| playground-zero | `src/playground-zero/test.js` | 12 check + 1 xfail | z-motion classifier; xfail for Bug AI (<each>/<empty> fallback leak) |
| playground-one | `src/playground-one/test.js` | 12 | vim-style Mode engine transitions |
| playground-two | `src/playground-two/test.js` | 12 | hjkl cursor + z-motion roll in INSERT |
| playground-three | `src/playground-three/test.js` | 10 | CM6 mount + scrml↔CM6 bridge |
| playground-four | `src/playground-four/test.js` | 15 | keystroke-granular undo tree + branch nav |
| playground-five | `src/playground-five/test.js` | 18 | — |
| playground-six | `src/playground-six/test.js` | 7 | bridge.js required (start before test) |
| playground-seven | `src/playground-seven/test.js` | 17 | — |
| playground-eight | `src/playground-eight/test.js` | 9 | bridge.js required (start before test) |
| playground-nine | `src/playground-nine/test.js` | 13 | — |
| playground-ten | `src/playground-ten/test.js` | 19 | — |

All 11 playgrounds (p0–p10) now have a `test.js` smoke harness.

Run p6/p8: start bridge first (`bun src/playground-six/bridge.js` or `bun src/playground-eight/bridge.js`),
then `node src/playground-N/test.js`.

## xfail Helper (p0 only)

`src/playground-zero/test.js` defines an `xfail(name, ok, detail, ref)` helper in addition
to the usual `check()`. It tracks a known-failing assertion without failing the suite:

- While the bug is present: logs `XFAIL: <name>` and does NOT count as a failure.
- If the assertion starts passing (bug fixed): logs `XPASS: <name> -- remove the xfail`
  and counts as a FAILURE — a loud signal to remove the xfail and promote the check.

Current xfail in p0:
- `"<empty> fallback cleared once log is non-empty"` — **Bug AI** (`scrml <each>/<empty>` codegen):
  the `<empty>` fallback is not torn down on the empty→non-empty transition. Filed 2026-06-24.

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
   (`"Serving"` or port number in stdout/stderr; 8 s fallback timeout)
2. Launches Puppeteer with `{ headless: "new", args: ["--no-sandbox"] }`
3. Registers `page.on("pageerror", ...)` to catch runtime JS errors
4. Dispatches keyboard events (type, keydown/keyup) and waits for DOM state
5. Asserts via a custom `check(name, condition, detail)` function that logs pass/fail
6. Reports total passed/failed at end; exits with non-zero on any failure

Assertion style: `check("description", booleanExpr, optionalDetail)` — explicit pass/fail logging.
Zero pageerrors (favicon-filtered) is always the final check in each harness.

p0 additionally uses `xfail(name, ok, detail, ref)` for tracked expected failures (see above).

## Tags
#editor #6nz #map #test #scrml #puppeteer #playgrounds #xfail

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
