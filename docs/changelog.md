# 6nz — Changelog

Dated session blocks, newest first. Per-repo session count.

---

## Session 18 — 2026-07-06 — Playwright migration complete + flonav prototype (flogence integration begins) + scrml dogfooding loop

**Three threads. (1) Completed the puppeteer→Playwright migration of all 11 playground smokes. (2) Amended the plan — integrate 6nz's editing ideas into flogence first — and built `playground-eleven` (flonav), the first integration prototype. (3) Ran a full dogfooding loop with scrml (5 `<each>`/input-layer findings → 4 fixes confirmed + 1 new root-cause) and flogence (integration accepted). Full sweep green: 13 tests (12 playgrounds + Bug AI xfail), 0 failed. Pushed.**

### Playwright migration (COMPLETE)
- All 11 playground smokes migrated `test.js` (puppeteer) → `app.pw.ts` (`@playwright/test`); the 11 old `test.js` deleted. Added `playwright.config.ts` (testMatch `**/*.pw.ts`, per-spec `scrml dev` boot, parallel-safe on distinct ports) + `src/_pw/scrml-dev.ts` shared helper. `npm test` is now the single source of truth.
- Method: piloted p9, then 10 worktree agents (one per playground) fanned the pattern; landed via file-delta. p0's Bug AI check ported as `test.fail()` (auto-flips when scrml fixes it).
- **esm.sh CDN outage** (R2 disk-full → 500 on `@codemirror/view` range tags) worked around with a `page.route` pin-redirect shim on the 5 CM6 playgrounds (kept as permanent hardening). Commits `69dedad` · `5b3f986` · `4048197` · `45685c6`.

### flonav prototype — `src/playground-eleven/` (flogence integration begins)
- **Plan amended:** standalone 6nz editor deferred; first integrate the editing ideas into flogence's cockpit. Surveyed flogence read-only; floView's node tree already has drill + one-open auto-collapse — the killer fit for cursor-as-PC.
- Built flonav: keyboard cursor over a floView-shaped node tree (fleet→project→facet→row) with `hjkl` nav + cursor-driven auto-collapse (p9 model) + a compiler-enforced NORMAL/INSERT/VISUAL `<engine>` (p1 model). INSERT composes+routes a prompt to the cursor node; **VISUAL** multi-selects a range + batch-routes one prompt to all selected nodes. Designed around the verified scrml `<each>` constraints (one keyboard surface, single-root rows, no `<textarea>`). 17-step Playwright smoke green. Commits `15464f5` · `c8bdc6e`.
- Sent flogence the integration mapping + the Playwright harness pattern; **flogence accepted** (nav-first, top-level project router first, harness yes — QUEUED/warm behind their region-leasing).

### scrml dogfooding (priority-#1: production-readiness)
- **Standing directive set:** scrml enterprise-readiness is priority #1; report every gap to scrml PA (memory saved).
- Runtime-verified flogence's "fragile input layer" claims (R26, not relaying prose). Filed **5 `<each>`/input-layer findings**: F1 expr-handler dead in `<each>`, F2 `<form onsubmit>`→reload, F3 multi-sibling drop, F4 `<textarea>` RCDATA span-leak, F5 void-in-`<each>` compile error. bind:value NOT-REPRODUCED (SSR caveat).
- scrml: 4/5 already fixed on s241 (I'd tested stale global 0.7.0). **Re-verified against current source (0.7.1 @ `59dc5287`):** F1/F2/F5 confirmed fixed at runtime; **F3 STILL broken** — pinned to the each-item factory `return _itemFrag.firstChild` (mounts only the first sibling) — re-filed. F4 fix dispatched by scrml.
- Also filed the **scrml dev live-reload broken** finding (`/_scrml/live-reload` → `ERR_INCOMPLETE_CHUNKED_ENCODING` → no hot-reload → cryptic stale-tab banner).

### Notes
- Global `scrml` binary is stale (0.7.0/`caa8803b`) vs source (0.7.1/`59dc5287`) — consider updating so smokes run against HEAD.
- Deputy still never booted (carried) — PA did all wrap maintenance.

---

## Session 17 — 2026-06-24 — closed the p0–p4 smoke-test gap (all 11 playgrounds now have smokes); surfaced + filed Bug AI

**Closed open-thread #3 — the p0–p4 smoke-test gap (no `test.js`; the cost was the S16 §4.17 silent breakage in p4 sliding through). Added puppeteer smokes to playground-zero/one/two/three/four; all 11 playgrounds (p0–p10) now have smokes. Full wrap suite: 11/11 green — 146 checks passed + 1 tracked XFAIL, 0 failed (@ scrml `2dd135ff`). The p0 xfail caught NEW Bug AI, R26-verified + filed to scrml.**

### Method
- Verified the harness end-to-end first (existing p9 smoke 13/13 against live `scrml dev` 0.7.0 + puppeteer from `../scrml/node_modules`) before writing anything.
- 5 worktree-isolated agents (one per playground) read each `app.scrml` + wrote `test.js` off the p9 (non-CM6) / p5 (CM6) templates, each self-verified green. PA landed via `git checkout <branch> -- <file>` (clean clobber), ran an independent sweep, cleaned up all 5 worktrees/branches. Committed `2ab2f4d` (smokes + master-list §F + delta-log).

### Full suite (wrap record, @ scrml `2dd135ff`)
p0 13+1xfail · p1 12 · p2 13 · p3 10 (CM6 clean off esm.sh) · p4 15 (incl. §4.17 `${}`-in-tree-text regression guard — S16 `<pre>`→`<div>` fix holds) · p5 18 · p6 7 · p7 17 · p8 9 · p9 13 · p10 19. **= 146 passed, 1 xfail, 0 failed; every playground exits 0.**

### Bug AI (NEW) — `<each>/<empty>` fallback leak
- The p0 smoke's check-6 caught it; left failing per R26, then **independently R26-verified** via a 13-line minimal repro: `<each>` with an `<empty>` body does NOT tear down the fallback on the **empty→non-empty** transition (first item appended *beside* leftover fallback text). Reverse edge (→empty via `@items=[]`) is correct. Distinct from R28-1c (repro uses the array-ref workaround, still leaks). General to any `<each>…<empty>`.
- **Disposition:** p0 check-6 → tracked **XFAIL** (`xfail()` helper added to `playground-zero/test.js`); suite stays green + flips to XPASS/suite-fail when scrml fixes it. **Filed to scrml** `2026-06-24-0719-...-bug-AI-each-empty-fallback-leak.md` (`needs:action`, inline repro + cmd + SHA + expected/actual + labeled-unverified hypothesis). master-list §F (Bug AI row) updated.

### Notes
- Two scrml replies now pending: S16 codegen findings (`2026-06-23-1917`) + Bug AI (`2026-06-24-0719`).
- Deputy still never booted (carried) — PA did all wrap maintenance (digest regen, maps incremental) itself.

---

## Session 16 — 2026-06-23 — idiomatic-audit rewrite EXECUTED (all tiers) + pushed; 3 new codegen findings to scrml

**Executed scrml's 2026-06-20 per-repo idiomatic-rewrite directive (the inbox `needs:action` item). All 4 tiers landed + pushed to origin (`721660a`). Verified green: 83/83 runtime smoke (p5/6/7/8/9/10) + p0–p4 probe-green. The scrml compiler moved 4× during the session (`a2137214`→`96745d34`→`346b4357`→`7c01b22a`); everything re-verified on the latest.**

### Pre-flight (R26 gates) — cleared
- Baseline 11/11 compile-clean + node --check on current main. Bug V FIXED (class:-on-for-lift re-evaluates). Gaps #2/#3/#4/#5 NOT-REPRODUCED (emit-inspected) → stale workaround comments removed.

### The rewrite
- **Tier 0 `42ac2d0` — `<each>` sweep, 0/11 → 6/11.** p0/p1 event+transition logs (`${for…lift}`→`<each in=@log key=__index__>`+`<empty>`); p10 region list (`<each in=@regions as r key=@.id>`, `class:focused`/`style:opacity` preserved, 19/19 incl. insert/remove churn); p9 `treeText` accumulator → per-line `<each in=@visible>` + reactive `class:cursor` (13/13); p6 `describeDiagnostics` → `<ul>/<each>/<li>` (7/7); p4 `renderTree` → `treeRowsOf` flatten + derived `<treeRows>` + `<each>`.
- **Tier 1 `5760de6` — render-per-state → `<match for=Mode on=@mode>`.** p1/p2/p5/p7 mode badges; all `const <isX>` derived-booleans deleted; p2 cursor `class:` bindings inlined to `(@mode == Mode.X)`.
- **Tier 2 `25a63d2` — async string-flag → typed state.** p6/p8 `@lspStatus` → `<engine for=LspPhase>` (7/7, 9/9); p3 `@status`/`@error` → typed cell `<cmPhase>: CmPhase`; p4 `@mode` string → `enum`+state-child `<engine>` + `<match>` badge. Status strings now pure projections (lspLabel/cmLabel/modeName value-return match).
- **Tier 3 `721660a` — polish.** p9 done in T0; p5/p7/p8 `@cmStatus`/`@diagSummary` ruled leave-as-is (host-bridge status strings).

### Findings sent to scrml (`2026-06-23-1917`, needs:action)
- Part A: gaps #2/#3/#4/#5 NOT-REPRODUCED (closure).
- Part B (new codegen, w/ repros): **§4.17 `<pre>`/`<code>` raw-content silently drops `${...}`** (broke p4/p6 rendering on current main, info-lint only — fixed `<pre>`→`<div>`); **arrow-form `<engine>` (`.A => .B`) emits no initial-state set** (governed cell undefined at mount; state-child form `<A rule=.B/>` works — used for p4); **bare `.Variant` in a ternary value position → string literal**.

### Notes
- p0–p4 have no `test.js` (probe-only) — the §4.17 silent breakage in p4 went unnoticed because of this. Smoke-gap flagged for the real-app-work surge.
- Push model: direct (S15), coherence-checked (`0 4` → fast-forward). Deputy never booted (digest STALE all session; maintenance by PA).

---

## Session 15 — 2026-06-23 — pre-surge readiness (vPA deputy + flogence) + housekeeping/dogfood-confirm; reconciled a parallel fork

**Two S15 instances ran in parallel off the S14 tip `d2e9667` and were reconciled by merge this session. Strategic inflection: 6nz moves from exploratory playgrounds into REAL app work — it integrates into flogence as the native text editor + kb-nav platform, with human beta testers imminent. User decision: stand the PA-continuity system up NOW, pre-surge ("full proactive build"), not migrate peri-surge.**

### Track A — pre-surge readiness

**p10 §36 input-state → canonical animationFrame bridge (R26):**
- Found uncommitted in-flight p10 work (the §36 `@cell` bridge) carrying two "to-be-filed" compiler bugs against scrml `8c27805e`: **AG** (`animationFrame` fails scope-resolution, E-SCOPE-001) + **AH** (§36 device registration only emitted from markup `<#id>` reads, not timer/logic bodies).
- **R26-verified both against current `dd5331e2`: NOT-REPRODUCED** — minimal + full repros compile clean, emit `animationFrame` + `_scrml_input_mouse_create` from the loop body. Fixed upstream; never filed (saved two false bug reports).
- Converted p10's §36 panel from the `<timer>`+forced-markup-read workaround to the **canonical §36.6 `animationFrame` loop**; dropped the stale bug comments. **19/19 smoke**, reactive readout confirmed (`x 0→123`). Commit `3ee4bc5`.

**vPA deputy ADOPTED + flogence channel (commit `f44093a`):**
- **`vpa.md`** — 6nz deputy contract, scaled from `../scrml-support/vpa-scrml.md` (6nz lacks scrml's state.ts/flograph/dock/@gap machinery → thinner surface). **4 functions:** disjoint-surface maintenance (maps/changelog/digest), digest curation, reboot-gap bridge, **+ F4 autonomous flogence inbox intake** (the 6nz-specific one). Load-bearing constraint + commit/surface-partition model identical to scrml's.
- **F4 autonomy = "bounded auto-act, unattended"** (user-ratified): the deputy auto-intakes `from: flogence` status/FYI/version/bug-report (files bugs to `handOffs/flogence-intake.md`, **never triages**), surfaces design/scope/live-build/ambiguous + all non-flogence senders. The deputy FILES; the PA TRIAGES.
- **`pa.md`** — flogence outbox target; the autonomy policy; the PA-side deputy addendum (digest freshness-guard, delta-log single-writer, `git merge deputy-maint` integration, surface partition, wrap-time digest regen, F4 promotion); session-start step 0.
- **Seams:** `handOffs/{delta-log,deputy-state,flogence-intake,digest}.md` + `scripts/state.ts` (`--digest`/`--check`, dependency-free, bun-runnable).
- **Memory:** project direction recorded (`6nz-to-flogence-and-vpa-adoption`).

### Track B — housekeeping + dogfood-confirmation (parallel instance, merged in)

**Currency sweep (from the non-compliance report):**
- `README.md` — dead `../scrmlTS` link → `../scrml`; status → exploratory phase (11 playgrounds); added `src/`.
- `editor-README.md` — "Five playgrounds" → eleven; `scrmlTS`→`scrml`; p0–p4 list → p0–p10 + master-list pointer.
- `master-list.md §A` — `default-bindings.md` "v0.3 planned" → "v0.3 done S10".
- p6/p8 source — user-visible "scrmlTS LSP" strings/comments → "scrml" (compile-verified).

**Bug-AB loop closed (R26-verified):** processed the last unread inbox message (`2026-05-30 bug-ab-fixed`); **re-ran p10 harness against compiler `d299798`: 19/19**, both AB guards green. Archived the message.

**Engine `name=` / Bug-AE confirmation re-test (vs `d299798`):** all four `<engine name=ModeMachine for=Mode>` playgrounds confirmed (newer than the `80f2c190` baseline + AE fix `faa213c5`): **p5 18/18, p7 17/17** harnessed, **p1/p2 compile clean**, no `E-ENGINE-001-RT`. §36/AF non-reactivity matches the by-design ruling. **Net: no open 6nz-filed bug against `d299798`** except L/T/U (M6-deferred).

**Source-currency corrections (user audit):**
- **Corrected the "scrml has no source-level import" claim** (was wrong in the maps + master-list §G). scrml HAS an Import System (SPEC §21/§41): stdlib `scrml:NAME`, relative `./f.js`, `vendor:`, and **cross-file scrml component/engine splitting** (tutorial §3.3 + :551). What it lacks is npm/bare-specifier imports (`E-IMPORT-005`). Load-bearing for integration — playgrounds *can* compose across files.
- **Noted kickstarter v2** (`scrml/docs/articles/llm-kickstarter-v2-2026-05-04.md`) supersedes our frozen v0/v1 local records.

**Cross-repo:** out to scrml `2026-06-22-0804-...bug-ab-confirmed-plus-engine-name-retest` (fyi); out to master (needs:push). **Discussed (no code):** playground-eleven sketch — first cross-file `<EngineName/>` composition (mode engine + z-motion classifier + CM6 buffer + relevance panel across multiple `.scrml`).

### Reconciliation (merge)
- Merged `origin/main` (the parallel instance's 4 commits `944d360`/`9682771`/`f0c9854`/`1bb8cbb`) into local. Kept BOTH sides — Track A's deputy/flogence/p10 + Track B's currency sweep + dogfood confirmations. `.claude/maps/` re-run cold post-merge for the union state. The two S15 narratives folded into this block.
- **`pa.md` root-cause fixes:** (1) session-start **coherence check** (`git fetch` + `rev-list --left-right`) — the fork recurred (S14 + S15) because that check only ran at wrap; moved it to step 0. (2) **direct push** — master no longer orchestrates pushes (user directive); the PA pushes 6nz directly after auth, gated by the coherence check.
- **Pushed direct to origin** `1a32ba4` (then `eed5fa7`) — full merged S15 stack live; coherence `0 0`.

---

## Session 14 (continued) — 2026-06-20 — fork reconciliation + dogfood-batch closure + re-test

**Discovered the "lost S13 instance" had actually pushed to origin (local/origin diverged at `0fa1cbb`). Merged the two histories, renumbered (the June fork mislabeled itself "S12" → S14), processed three scrml replies that closed the entire p10 dogfood batch, and re-verified the fixes against a newer compiler build.**

- **Merge `f4b9b64`** — reconciled local S14 (v0.7.0 re-baseline + p10 19/19) with the parallel origin S12/S13 fork (v0.6.7 p10 18/18 + bug findings). Kept ours on conflicts; salvaged playwright deps, p8 `return not` revert, 4 inbox messages, origin's S13 hand-off (→ `hand-off-13.md`).
- **Renumber** — the June engagement is one S14 session (origin held the real S12/S13). Corrected the false "pushed to origin at close" claims (that push never landed — non-FF vs origin S13).
- **scrml replies processed** — AB CLOSED `2ebd107a`; AD `14fb0230`; AE `faa213c5`/equivalent (scrml HONORED `<engine name=N>`, did NOT reject it — reversed the migration carry); AF RULED BY-DESIGN (§36.6; use the `@cell` bridge for live editor-chrome readout). AA remains open (low-pri lint regression).
- **Next-build re-test @ `8c27805e`** — AB (p10 onTransition 0→1→2 runtime), AD (emit fn-rename), AE (coherent transition table + p5 18/18 / p7 17/17 `name=` engines green); all 11 playgrounds compile-clean + `node --check` OK, no regression. **p10 batch now closed except AA.**
- **Cross-repo:** inquiries to scrml (answered) + master (push-provenance + supersede the stale needs:push). Pushed `f4b9b64..d2e9667` to origin.

---

## Session 14 — 2026-06-19/20

**Re-baseline all playgrounds against scrml v0.7.0 + rebuild playground-ten; dogfood yield: recovered the lost S13 bug batch + 2 new HIGH compiler bugs.**

### Environment
- Revived the globally-broken `scrml` command (the S200 scrmlTS→scrml rename had dangled the bun global symlink → repointed to `../scrml`, v0.7.0).

### Re-baseline (p0–p9 vs scrml v0.7.0 `80f2c190`)
- **All 10 re-baselined green.** No compiler bugs — every breakage was adopter-migration debt from v0.7.0's deliberate tightening:
  - `E-TYPE-025` (match needs typed subject) → annotated `kindGlyph/kindName(k: NodeKind)` (p9), `modeName(m: Mode)` (p2).
  - `scrml migrate --fix` (45 rewrites): `=>`→`:>` arm arrows, `const @x`→`const <x>`, `<machine>`→`<engine>`, `< db>` whitespace.
  - `W-ENGINE-INITIAL-MISSING` → explicit `initial=` on p1/p2/p5/p7 (caught a real latent start-state mismatch: p2/p5/p7 intend `.Normal` but the engine's first state-child is `.Insert`).
  - Event-threading revert (S96): p0/p1/p2/p4 bare-call `onkeydown=handleKeyDown()` → arrow form `${(e)=>handleKeyDown(e)}` (7 sites; were silently runtime-broken since May).
  - p6/p8 LSP bridge path `scrmlTS`→`scrml` (S200 rename).
- Verified: p3 CM6 mount, p5 18/18, p6 7/7, p7 17/17, p8 9/9, p9 13/13; p0/p1/p2/p4 event-fix runtime-probed.
- Confirmed Bug W (CRITICAL paren-drop) and Bug S (`return not`) fixed in v0.7.0 via direct repro.

### playground-ten — REBUILT (relevance-region navigator + §36 input-state), 19/19
- "kick off pg10" surfaced that p10 had been built (S13, 2026-05-29) and lost to the misrouted caps-`6NZ/` clone. Recovered the bug batch from surviving repros, re-verified, and rebuilt against v0.7.0.
- **Recovered S13 batch re-verification:** X/Y/Z/AB/AC fixed, AA open.
- Live-confirmed Bug-V (`class:focused` through nav + churn), Bug AB (`<onTransition>` fires), Bug Z/X (verbatim string render).
- **New finds:** Bug AD (HIGH — user fn in attribute-value interp → bare-name ReferenceError), Bug AE (HIGH — engine `name=` → broken transition write-guard / E-ENGINE-001-RT), Question AF (§36 input-state markup read non-reactive).

### Cross-repo
- Sent the p10 bug batch (AD/AE/AF + S13 status) to scrml with 3 R26-verified sidecars.
- scrml triaged within the hour (S210): **AD + AE FILED HIGH + DISPATCHED**, AA tracked for a lint, AF a pending design ruling. ⚠️ Carry: when the AE fix lands, `<engine name=...>` becomes a compile error — p1/p2/p5/p7 will need migration off `name=`.

### Housekeeping
- Processed + archived all 14 inbound messages; master-list currency pass (scrmlTS→scrml, v0.7.0); pa.md already modernized + rename-pathed earlier today.

### State at wrap
- **11/11 playgrounds green** vs scrml v0.7.0. Working tree clean. (S14 first-half push to origin did NOT land — non-FF vs the parallel origin S13 fork; reconciled 2026-06-20 by merging origin in (`f4b9b64`) and pushing the merged tip.)
