# Idiomatic-audit rewrite — progress

**Change-id:** idiomatic-rewrite
**Source directive:** `handOffs/incoming/2026-06-20-2109-scrml-to-6nz-idiomatic-audit-rewrite-plan.md`
**Audit:** `../scrml-support/docs/deep-dives/6nz-idiomatic-audit-2026-06-20.md`
**Compiler baseline:** scrml `a2137214` (S215) — note: NEWER than the audit's v0.7.0 `80f2c190` / dogfood `dd5331e2`/`d299798`.
**Commit cadence:** per tier (user, S16). No push until authorized.

Append-only. Timestamped lines: what was done, what's next, blockers.

---

## 2026-06-23 (S16) — pre-flight (R26 gates) — ALL CLEARED
- #1 baseline: 11/11 compile clean + `node --check` OK on `a2137214`; p9 13/13 runtime smoke (Puppeteer harness confirmed). No regression from the S215 bump.
- #2 Bug V: FIXED on `a2137214` — `class:`-on-for-lift compiles inside a reactive `_scrml_effect` re-reading deps (verified via minimal repro emit + p10's live per-row binding). Tier-0b unblocked.
- #3 gaps #2/#3/#4/#5: ALL NOT-REPRODUCED on `a2137214` (emit-inspected). Ternary both-branches (#2), return-after-ternary-const survives (#3), derived-cell-in-markup wired (#4), fn/field collision no longer mangles `.field` (#5). → stale workaround comments in p2/p4 to be removed on rewrite. → route confirm-or-fix NOT-REPRODUCED note back to scrml (needs user OK).

## Tier 0 — `<each>` sweep — COMPLETE (6/6)
- **p0** event log `${for…lift}` → `<each in=@log key=__index__>` + `<empty>`. compile+node-check OK; probe: empty-state renders, no page errors.
- **p1** transition log → `<each in=@log key=__index__>` + `<empty>`. compile+node-check OK; probe OK.
- **p10** region list → `<each in=@regions as r key=@.id>` + `<empty>`, preserved `class:focused`/`style:opacity`. **19/19** (key=@.id added: inference needs a declared struct type, untyped array literal → W-EACH-KEY-001; id-keying is also more correct given insert/remove churn). Bug-V neighborhood fully validated on canonical `<each>`.
- **p9** `treeText` string-accumulator → per-line `<each in=@visible key=@.id>` with reactive `class:cursor`. **13/13** (test.js `treeLines()` updated to read `.line` elements). Confirms derived cell `const <visible> = visibleLines()` tracks deps THROUGH the fn call. Line rendered as single concatenated interp (adjacent `${}${}` drops literal inter-space inside `<each>` body, §4.18.3).
- **p6** `describeDiagnostics` accumulator → `<ul class="diag-list">` + `<each in=@diagnostics key=__index__>` + `<li class="diag-item">${describeDiagnostic(@.)}</li>`. deleted dead accumulator + stale Bug-O comment. **7/7**.
- **p4** `renderTree` accumulator → `treeRowsOf()` flatten + derived `const <treeRows>` + `<each in=@treeRows key=@.id>` with `class:current`. KEPT `renderBuffer` (caret-in-text, per audit) BUT reverted its gap-#4 inlining workaround (`@nodes[@current]`→`curNode()`) + removed stale comment (gap #4 NOT-REPRODUCED, re-confirmed for the exact `${fn(helper())}` shape). probe: buffer "[ ]"→"hi[ ]" on type, tree 1→3 rows, current row tracked.

### FINDING — §4.17 raw-content broke `<pre>${...}` on the current build
`<pre>`/`<code>` bodies are raw-content (§4.17) — `${...}` ships LITERALLY (lint `W-INTERP-IN-RAW-CONTENT`). On the current scrml build, p4 (`.buffer` + `.tree`) and p6 (`.diag-list`) were SILENTLY rendering literal `${...}` — masked because p4 has no smoke and p6's smoke check is length-only. The Tier-0 rewrite fixed all three (tree/diag→`<each>` in `<div>`/`<ul>`; buffer `<pre>`→`<div class="buffer">`, CSS already `white-space: pre-wrap`). Likely a §4.17 enforcement tightening since the audit baseline (80f2c190). → candidate note to scrml + argues for adding p0–p4 smokes.

### Compiler moved mid-session
scrml HEAD: session-start `a2137214` (S215) → mid-session `96745d34`. All 11 compile clean + Tier-0 smokes green (p9 13/13, p6 7/7, p10 19/19) on `96745d34`. Moving dogfood target — record SHA per commit.

### `<each>` adoption: 0/11 → 6/11 (the audit's headline red flag, removed where lists exist)

## Tier 1 — render-per-state → `<match for=Mode on=@mode>` — COMPLETE (4/4; p4 deferred to post-Tier-2)
Replaced `const <isX>` derived-booleans + `if=`-per-badge with `<match for=Mode on=@mode>` state-child arms (SPEC §18). Engines were already correct — only the rendering was flag-shaped.
- **p5** (3 modes): badge → `<match>`; booleans deleted. **18/18** (validated the pattern first).
- **p7** (3 modes): same. **17/17**.
- **p1** (5 modes Insert/Normal/Visual/VisualLine/ToggleHold): badge → `<match>`; booleans deleted. probe: badge transitions Insert→Normal→Visual reactively.
- **p2** (3 modes): badge → `<match>`; booleans ALSO fed the cursor `class:` bindings (L347) → inlined those to `(@mode == Mode.X)`; booleans deleted. ALSO removed stale gap #2/#3/#4 comments (all NOT-REPRODUCED). probe: badge + cursor-class track (block-cursor→insert-cursor).
- p4 NOT done here — its `@mode` is a string `"insert"/"normal"`; folds into Tier 1 AFTER Tier-2 enum+engine promotion.
Verified @ scrml 346b4357 (compiler bumped a2137214→96745d34→346b4357 over the session). All 11 compile clean; p5/p7 smokes green.

## Tier 2 — async-lifecycle string-flag → engine/typed-cell — COMPLETE (4/4)
User ruling (S16): engine where smoke-backed, typed-cell where not.
- **p6** `@lspStatus` 6-string-flag → `<engine for=LspPhase initial=.Disconnected>` (Disconnected/Connecting/Initializing/Ready/Failed/Closed); transition rules mapped to the WS event flow; reads/writes converted; `lspLabel` projects the phase to the display string; diagnostics gating via `@lspPhase == LspPhase.Ready`. **7/7**.
- **p8** `@lspStatus` 5-string-flag → `<engine for=LspPhase initial=.Idle>` (Idle/WsOpen/Ready/WsError/WsClosed; onclose has no guard → WsError→WsClosed allowed); completion/hover gating via `@lspPhase != LspPhase.Ready`. **9/9**.
- **p3** `@status`/`@error` CM6-load flag → typed enum cell `<cmPhase>: CmPhase = .Loading` (Loading/Ready/Failed) + `cmLabel` projection; `@error` kept for detail. (No smoke → typed-cell per ruling.) probe: status shows "CM6 loaded and mounted" after load.
- **p4** `@mode` string "insert"/"normal" → `type Mode:enum {Insert,Normal}` + `<engine>` (state-child form) + `<match for=Mode on=@mode>` badge (folds in the deferred Tier-1) + `modeName` projection. probe: initial INSERT, type→buffer inserts, Esc→NORMAL, i→INSERT.

### FINDING — arrow-form `<engine>` init emission is unreliable
p4's `<engine for=Mode initial=.Insert>` with arrow transitions (`.Insert => .Normal`) compiled the OLD `__scrml_transitions_mode` path and emitted NO top-level `_scrml_reactive_set("mode", ...)` init — so `@mode` was undefined at mount, the `<match>` rendered empty, and keystrokes fell through to Normal-mode handling. Adding `name=` did NOT fix it (p1/p5/p7 use arrow+name= and DO emit the init — unexplained context difference). Switching to the STATE-CHILD form (`<Insert rule=.Normal/>`, p10's AE-safe canonical form) emitted the newer `__scrml_engine_mode_transitions` path WITH the init set → works. Also: bare `.Variant` literals in a ternary value position (`? .Normal : .Insert`) compiled to string literals; use if/else with direct `= .Variant`. → candidate notes to scrml. p1/p5/p7 left on arrow+name= (working, pre-existing; not churned).

### Tier 2 status-string projections
Engine/typed-state is the source of truth; the human-readable status strings are now pure projections (lspLabel/cmLabel/modeName value-return match). p5/p7 `@cmStatus` + p8 `@cmStatus`/`@diagSummary` left as host-bridge status strings (Tier-3 borderline; primary state already typed).
Verified @ scrml 7c01b22a (compiler bumped 4× over the session). All 11 compile clean; p6 7/7, p8 9/9; p3/p4 probe-green.

## Tier 3 — polish — COMPLETE (no new edits)
- p9 `treeText`→`<each>` already landed in Tier 0.
- p5/p7 `@cmStatus` (+ p8 `@cmStatus`/`@diagSummary`): RULED leave-as-is. These are host-bridge status strings (what the CM6 loader reports), not state 6nz owns; lower priority, and each file's PRIMARY state (mode) is already a proper engine. Per the audit's open question + flag #6, the PA rules per file: not worth an engine.

## REWRITE COMPLETE — all tiers landed
Tier 0 `42ac2d0` · Tier 1 `5760de6` · Tier 2 `25a63d2`. `<each>` 0/11→6/11; render-per-state booleans eliminated; async string-flag lifecycles → typed state repo-wide. No push yet (per user). Pending: final full smoke run; cross-repo notes (4 gaps NOT-REPRODUCED + §4.17 + arrow-engine findings) need user OK; master-list/changelog/maps refresh at wrap.
