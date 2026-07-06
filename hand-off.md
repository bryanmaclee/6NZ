# 6nz — Session 18 Hand-Off

**Date:** 2026-07-06 (S18)
**Next hand-off filename:** `handOffs/hand-off-18.md`
**Prev session:** S17 rotated to `handOffs/hand-off-17.md`. S17 wrap COMPLETE + pushed (HEAD `1563663`).
**This session HEAD (pre-wrap):** `9af19a5`; wrap commit on top. Pushed.

## Open questions (surface first)

1. **scrml F3 fix pending** — I re-filed F3 with the pinned root cause (`2026-07-06-0938-6nz-to-scrml-reverify-...`): the `<each>`-item factory does `return _itemFrag.firstChild`, so a multi-sibling iteration body mounts only the first child. Emit is correct; the mount drops the rest. `needs:action`. Watch inbox for the fix → then re-verify with `p2c-two-inputs-each` (both `.first` + `.second` should render).
2. **scrml F4 fix pending** — scrml dispatched a fix for the `<textarea>` RCDATA `${}` span-leak (unblocks the multi-line editor). When it lands, re-verify `probe3-textarea-content` (`.ta` value should be `hello`, not the span markup). scrml said it's an R26 candidate.
3. **My global `scrml` binary is STALE.** `scrml --version` = **0.7.0** (`caa8803b`); scrml's source main is **0.7.1** (`59dc5287`, s241). I tested/ran everything this session against the stale global; re-verified the scrml findings by running from source (`bun ../scrml/compiler/bin/scrml.js`). **Consider updating the global scrml binary** (operator/cross-repo action) so `scrml dev` + the playground smokes run against current — otherwise the suite validates against 0.7.0, not HEAD. This was the session's "verify source currency" lesson.
3b. **scrml dev live-reload is broken** (filed `2026-07-06-0925-...-dev-live-reload-broken`, needs:action): `/_scrml/live-reload` errors with `ERR_INCOMPLETE_CHUNKED_ENCODING` → console error every load + no hot-reload (edits don't reload the tab). Degrades a stale tab into a cryptic `_scrml_reactive_subscribe is not defined` red banner. **Workaround: hard-refresh during manual dev.** Doesn't affect the smoke harness (each spec boots fresh). Watch for scrml fix.
4. **flogence integration is QUEUED (warm), awaiting operator green-light.** flogence PA ACCEPTED the plan (`2026-07-06-0850-flogence-to-6nz-...QUEUED-navfirst-harness-yes`): nav-first sequence yes, **top-level project router first**, Playwright harness yes. Held behind their region-leasing work until the operator signals go. When it unblocks: kickoff = keyboard cursor over the top-level floView router, using the harness pattern I sent (`2026-07-06-0938-6nz-to-flogence-playwright-harness-pattern`). **The flonav prototype (`src/playground-eleven/`) is the template.**
5. **Deputy STILL never booted** (carried S15→S16→S17→S18). PA did all wrap maintenance itself. Consider smoke-testing before the flogence surge.
6. **playground-eleven further extensions** (optional, deferred): `z` manual fold, `gg`/`G` jump-to-top/bottom. NORMAL/INSERT/VISUAL all landed + smoked.

## State as of session start (S18 boot → close)

| Item | State |
|---|---|
| Coherence | `0 0` at wrap (origin/main == local; pushed). No fork. |
| Playgrounds | **12** (added `playground-eleven`). All green under **Playwright** — `npm test` = 13 tests (12 playgrounds + Bug AI xfail), 0 failed, exit 0. |
| Test harness | **MIGRATED puppeteer → Playwright.** All 11 old `test.js` deleted; each playground has `app.pw.ts`. `playwright.config.ts` + `src/_pw/scrml-dev.ts` helper. CM6 playgrounds carry a `page.route` esm.sh shim. |
| scrml findings (this session) | **F1/F2/F5 CONFIRMED FIXED** @ 0.7.1 (runtime). **F3 STILL BROKEN** (re-filed w/ root cause). **F4 LIVE** (scrml fix dispatched). bind:value not-reproduced (SSR caveat). Live-reload broken (filed). |
| Bug AI | still OPEN — `<each>/<empty>` fallback leak (filed S17); XFAIL-tracked in p0. (Distinct from the F1–F5 batch.) |
| scrml version | global binary **0.7.0** (`caa8803b`, STALE); source main **0.7.1** (`59dc5287`). |
| Maps | S18 incremental refresh (project-mapper) — playwright migration + playground-eleven. |
| Digest | regenerated at wrap HEAD. |
| delta-log | entries [1]–[29] (this session added [19]–[29]); single-writer = PA; none absorbed (no deputy). |
| flogence | integration ACCEPTED, QUEUED/warm. Harness pattern sent. |

## What happened this session (S18)

**Big multi-thread session: (1) completed the Playwright migration, (2) surveyed flogence + built the first integration prototype, (3) ran a full dogfooding loop with scrml (two findings batches → fixes confirmed + new root-cause) and flogence (integration accepted).**

### Thread 1 — Playwright migration COMPLETE
User moved all browser automation to Playwright. Confirmed install (1.60.0 + all 4 browsers). Migrated all 11 playground smokes puppeteer→`@playwright/test`: piloted p9, then fanned 10 worktree agents (Sonnet for the mechanical ones, Opus for xfail/CM6/bridge). Landed each via file-delta, cleaned worktrees. **esm.sh was mid-outage** (R2 disk-full → 500 on `@codemirror/view` range tags) — worked around with a `page.route` pin-redirect shim (kept as permanent hardening, user-ratified). Deleted the 11 old `test.js`. Commits: pilot `69dedad`, non-CM6 batch `5b3f986`, CM6 batch `4048197`, test.js removal `45685c6`. Pushed.

### Thread 2 — flogence integration (plan amendment)
**User amended the plan (2026-07-06):** standalone 6nz editor deferred; first integrate 6nz's editing ideas into flogence's text-editing modes. Surveyed flogence read-only (user-authorized). Findings: flogence is a monolithic `app.scrml` cockpit; all editing surfaces are plain single-line `<input>`; floView's node tree already has drill + one-open auto-collapse (the killer fit for cursor-as-PC). Built **`src/playground-eleven/` (flonav)** — keyboard cursor over a floView-shaped tree (hjkl + auto-collapse) + NORMAL/INSERT/VISUAL modal `<engine>`; INSERT routes a prompt to the cursor node, VISUAL multi-selects + batch-routes. 17-step smoke green. Commits `15464f5` (base), `c8bdc6e` (VISUAL). Sent flogence the integration mapping (`...0843...`) + the Playwright harness pattern (`...0938...`). flogence accepted (nav-first, top-level router, harness yes; QUEUED).

### Thread 3 — scrml dogfooding loop (the priority-#1 lane)
**User set standing directive: scrml enterprise/production-readiness is priority #1 above all; report every gap to scrml PA** (memory saved). Runtime-verified flogence's documented "fragile input layer" claims against scrml (per R26 — not relaying prose). Filed **5 `<each>`/input-layer findings** (`...0811...`): F1 expr-handler dead in `<each>`, F2 `<form onsubmit>` reload, F3 multi-sibling drop, F4 textarea RCDATA span-leak, F5 void-in-`<each>` compile error; bind:value NOT-REPRODUCED. scrml replied: 4/5 already fixed on s241 (I'd tested stale 0.7.0), F4 dispatched. **Re-verified against current source** (0.7.1): F1/F2/F5 confirmed fixed at runtime, **F3 STILL broken** — pinned to `return _itemFrag.firstChild` — re-filed (`...0938...`). Also filed the **live-reload-broken** dev-server finding (`...0925...`). Recovery note: F2's first automated verdict was a false-negative from the broken-live-reload HMR load event; distinguished real native-submit (URL gains `?`) from HMR noise.

## Recovered-from anomalies (watch)
- **Agent id↔label scramble (Playwright fan-out):** the auto-generated agent summaries didn't match my dispatch labels. Recovered by reading ground truth from each branch's committed file, not the summary. If you fan out worktree agents again, verify by committed artifact, not the notification summary.
- **zsh word-splitting:** `SCRML="bun /path.js"; $SCRML ...` does NOT split in zsh → the command silently didn't run and a lax grep reported false-green. Invoke `bun "$PATH"` directly; check for a positive success marker (`Compiled`), not just absence of `FAILED`.
- **Stale scrml binary vs source:** re-verify findings against `bun ../scrml/compiler/bin/scrml.js` (0.7.1), not the global `scrml` (0.7.0).

## File-modification inventory (this session)
- **New:** `playwright.config.ts`, `src/_pw/scrml-dev.ts`, `src/playground-{zero..ten}/app.pw.ts` (11), `src/playground-eleven/{app.scrml,app.pw.ts}`.
- **Deleted:** `src/playground-{zero..ten}/test.js` (11 puppeteer smokes).
- **Modified:** `.gitignore`, `package.json` (already had playwright test script), `handOffs/delta-log.md` ([19]–[29]), plus wrap docs (this file, `handOffs/hand-off-17.md` rotation, `docs/changelog.md`, `master-list.md`, `user-voice.md`, `.claude/maps/*`, `handOffs/digest.md`).
- **Cross-repo (one-way writes):** scrml inbox × 3 (`...0811...` 5 findings, `...0925...` live-reload, `...0938...` re-verify); flogence inbox × 2 (`...0843...` integration, `...0938...` harness). Received + archived: scrml `...0923...`, flogence `...0850...`.
- **Scratchpad (not in repo):** input-layer probes + drivers, live-reload repro, pg11 diagnostics.
