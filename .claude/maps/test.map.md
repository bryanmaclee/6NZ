# test.map.md
# project: editor (6nz)
# updated: 2026-07-06T00:00:00Z  commit: 9af19a5

## Test Framework

Runner: `@playwright/test@1.60.0` (root `package.json` devDependency)
Config: `playwright.config.ts` (root)
Run all: `npm test`  (= `playwright test`)
Run single: `npx playwright test src/playground-<name>` (e.g. `src/playground-nine`)

**S18: Puppeteer migration complete.** All 11 original `src/playground-*/test.js` Puppeteer
harnesses were DELETED and ported to `@playwright/test` spec files named `app.pw.ts`, colocated
beside each playground's `app.scrml`. Puppeteer is no longer used anywhere in this repo. The
`package.json` "test" script now genuinely reflects the test tooling in use (the S17
non-compliance finding on this mismatch is RESOLVED — see `non-compliance.report.md`).

`playwright.config.ts`: `testDir: "src"`, `testMatch: "**/*.pw.ts"`, `fullyParallel: true`,
`workers: process.env.CI ? 2 : 3`, `timeout: 60_000`, `reporter: [["list"]]`,
`use: { browserName: "chromium", headless: true, launchOptions: { args: ["--no-sandbox"] } }`.
No top-level `webServer` block — each spec boots its own `scrml dev` in `beforeAll` (see below),
so specs are parallel-safe by construction (no shared server, no port contention).

## Shared Helper  [`src/_pw/scrml-dev.ts`]

`bootScrmlDev(appPath, port): Promise<ChildProcess>` — spawns `scrml dev <app> --port <port>`,
resolves once stdout/stderr contains `"Serving"` or the port number (8s fallback timeout).
`killScrmlDev(proc)` — kills the child process; swallows already-dead errors.

Usage in every spec:
```ts
import { bootScrmlDev, killScrmlDev } from "../_pw/scrml-dev";
test.beforeAll(async () => { dev = await bootScrmlDev(APP, PORT); });
test.afterAll(() => killScrmlDev(dev));
```
This replaces the hand-rolled `spawn` + fixed-timeout readiness logic that lived in every
Puppeteer `test.js`.

## Test Categories

All specs are single-file smokes under `src/playground-<name>/app.pw.ts` — no separate
unit/integration/e2e split; every spec is an in-browser end-to-end smoke against a live
`scrml dev` instance.

| Playground | Spec file | test.step() count | Port(s) | Notes |
|---|---|---|---|---|
| playground-zero | `src/playground-zero/app.pw.ts` | 11 steps + 1 separate `test.fail()` case | 3050 | z-motion classifier; Bug AI tracked via native Playwright `test.fail()` (was `xfail()` helper) |
| playground-one | `src/playground-one/app.pw.ts` | 12 | 3051 | vim-style Mode engine transitions |
| playground-two | `src/playground-two/app.pw.ts` | 12 | 3052 | hjkl cursor + z-motion roll in INSERT |
| playground-three | `src/playground-three/app.pw.ts` | 10 | 3053 | CM6 mount + scrml↔CM6 bridge; esm.sh route shim |
| playground-four | `src/playground-four/app.pw.ts` | 13 | 3054 | keystroke-granular undo tree + branch nav |
| playground-five | `src/playground-five/app.pw.ts` | 18 | 3055 | vim modes on CM6; esm.sh route shim |
| playground-six | `src/playground-six/app.pw.ts` | 7 | SCRML_PORT=3066, BRIDGE_PORT=3061 | boots bridge.js AND scrml dev itself (both spawned in `beforeAll`, `SCRML_DIR` resolved for worktree layouts); esm.sh route shim |
| playground-seven | `src/playground-seven/app.pw.ts` | 17 | 3057 | z-motion on CM6; esm.sh route shim |
| playground-eight | `src/playground-eight/app.pw.ts` | 8 | SCRML_PORT=3085, BRIDGE_PORT=3081 | boots bridge.js AND scrml dev itself; esm.sh route shim |
| playground-nine | `src/playground-nine/app.pw.ts` | 12 | 3059 | editor IR + logical traversal |
| playground-ten | `src/playground-ten/app.pw.ts` | 15 | 3060 | relevance-region navigator + §36 |
| playground-eleven | `src/playground-eleven/app.pw.ts` | 18 | 3070 | **NEW S18** — flonav keyboard nav + modal prompt (see `structure.map.md`) |

All 12 playgrounds (p0–p11) now have a Playwright `app.pw.ts` smoke spec. p6/p8 no longer need a
manually-started bridge process before running the test — the spec itself spawns both the bridge
and `scrml dev` in `beforeAll` and resolves `SCRML_DIR` across both canonical and git-worktree
repo layouts.

**CM6 esm.sh resilience shim (p3/p5/p6/p7/p8 only):** these 5 specs install a `page.route(/https:\/\/esm\.sh\//, ...)`
handler. esm.sh intermittently 500s on semver-RANGE meta lookups (e.g. `@codemirror/view@^6.x`)
while exact-pinned builds stay cached and serve 200. On a 5xx, the shim refetches the same module
pinned to `6.43.0` (the newest cached 6.x) so CM6 can still mount deterministically. It touches
only third-party CDN network transport — never the app, never an assertion — and is a no-op when
esm.sh serves the range normally.

## xfail / Expected-Failure Pattern (p0 only)

The old Puppeteer `xfail(name, ok, detail, ref)` helper (which logged `XFAIL`/`XPASS` without
failing the suite) is gone. Playwright has a native mechanism: `src/playground-zero/app.pw.ts`
defines the Bug AI check as its own `test("Bug AI — <each>/<empty> fallback leak (tracked xfail)", ...)`
that opens with `test.fail(true, "<reason>")`. Playwright then expects this test to fail; if it
unexpectedly PASSES (bug fixed), Playwright flips the whole suite red — the signal to delete the
annotation and fold the assertion back into the main step sequence.

Current tracked expected-failure in p0:
- `"<empty> fallback cleared once log is non-empty"` — **Bug AI** (`scrml <each>/<empty>` codegen):
  the `<empty>` fallback is not torn down on the empty→non-empty transition. Filed 2026-06-24.
  Still open as of S18.

## Fixtures & Factories

No separate fixture files. Each `app.pw.ts` defines inline scenario data and DOM-read helper
functions (`readField`, `activeMode`, `readCursor`, `treeLines`, etc.) local to the spec.

p6/p8 specs embed sample scrml source strings inline (`SAMPLE_DOC` / similar) for diagnostics
and completion scenarios.

## Pattern

Each spec is one sequential `test()` (the interaction is a state machine — each keypress/action
builds on the last), subdivided into numbered `test.step()` blocks for granular reporting:
1. `test.beforeAll` boots `scrml dev` (and bridge.js for p6/p8) via `bootScrmlDev`, then waits a
   fixed settle delay (~1500ms) since the dev server's readiness log can precede first-serve
   readiness.
2. `page.goto(URL, { waitUntil: "domcontentloaded" })`, then `page.waitForFunction(...)` polls for
   the app's actual mount signal (not just page load).
3. Registers `page.on("pageerror", ...)` and a filtered `page.on("console", ...)` to catch runtime
   JS errors (favicon/404 noise filtered).
4. Drives via `page.keyboard.press/type` and small `waitForTimeout` settle waits between actions.
5. Asserts via Playwright's native `expect(value, message).toBe(...)` inside each `test.step`.
6. `test.afterAll` calls `killScrmlDev` (and kills the bridge process for p6/p8).
7. "No page errors" is always the final step in each spec.

Assertion style: Playwright `expect()` with a descriptive message argument for failure context,
one `expect` (or a small cluster) per numbered `test.step`.

## Tags
#editor #6nz #map #test #scrml #playwright #playgrounds #xfail

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [structure.map.md](./structure.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
