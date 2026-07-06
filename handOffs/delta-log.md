# 6nz — PA → deputy delta-log

The PA's append-only state stream for the vPA deputy (`vpa.md`). The PA is **single-writer** on this
file. One narrow exception: the deputy may append `(deputy) state` entries recording a dispatched-agent
completion during a PA-reboot gap (vpa.md F3). The deputy READS this each tick and absorbs entries past
its last-absorbed seq (tracked in `deputy-state.md`).

## Entry format

One entry per line (or short block), newest at the bottom:

`[seq] <type> <pointer> — <summary> [(vpa: <maintenance directive>)]`

- **seq** — monotonic integer, never reused.
- **type** — one of:
  - `land`  — work committed to main (pointer = SHA + files)
  - `disp`  — agent dispatched (pointer = agent-id + branch + brief)
  - `find`  — a finding / verification result (pointer = SHA / file)
  - `rule`  — a ratified decision / directive (pointer = where recorded)
  - `state` — session / board state change (pointer = file)
  - `msg`   — cross-repo message sent / received (pointer = path)
- **pointer** — a SHA / file / agent-id / msg-path the deputy derefs ONLY if a maintenance task needs it.
- **(vpa: …)** — OPTIONAL maintenance directive cast to the deputy (refresh maps · regen digest · track
  agent X). The PA never blocks on it (async cast; the PA-does-it fallback covers urgency). Deliberation-
  shaped directives must NOT appear here — the deputy declines them and routes back to the PA.

The deputy never edits existing entries; it only absorbs them (and, per F3, may append `(deputy) state`).

---

[1] land 3ee4bc5 src/playground-ten/app.scrml — p10 §36 input-state → canonical animationFrame @cell bridge; AG/AH NOT-REPRODUCED @ scrml dd5331e2.
[2] rule vpa.md — vPA deputy ADOPTED for 6nz (S15), scaled from scrml-support/vpa-scrml.md. Four functions incl. F4 (autonomous flogence inbox intake, bounded auto-act unattended). Surface partition + commit protocol per vpa.md.
[3] rule pa.md — flogence added as active cross-repo correspondent (outbox target + inbox source); F4 autonomy policy locked (bounded auto-act, unattended; flogence-scoped only).
[4] disp ad53b0237e06cbd4b — project-mapper dispatched (worktree-isolated) for a cold `.claude/maps/` refresh (maps predate all 11 playgrounds). (vpa: maps are your Function-2 surface — once the PA lands this refresh, keep them current incrementally.)
[5] land f44093a vpa.md·pa.md·handOffs/{delta-log,deputy-state,flogence-intake,digest}.md·scripts/state.ts — vPA deputy + flogence channel readiness infra committed.
[6] land 5fe64b7 .claude/maps/* — cold maps refresh landed (9 maps + non-compliance report; agent worktree cleaned). (vpa: maps now CURRENT — keep incremental going forward. `.claude/maps/non-compliance.report.md` lists currency-debt for the PA: README/editor-README scrmlTS+playground-omission, 2 stale playground READMEs, z-motion/proto README SPEC versions.)
[7] land 5fe64b7+ master-list.md·docs/changelog.md — S15 meta-docs (inventory + changelog block). [this entry's own commit]
[8] state origin/main — DIVERGENCE: a parallel S15 instance branched off d2e9667 and pushed 4 commits (944d360 maps+currency-sweep · 9682771 import-claim-correction · f0c9854 wrap · 1bb8cbb). Caught by the wrap-time coherence check (NOT session-start — fork hazard recurred). Track B = housekeeping + dogfood-confirm (p5 18/18, p7 17/17 @ d299798; Bug-AB loop closed; README/editor-README/p6/p8 scrmlTS→scrml).
[9] land 7cc58cf MERGE — reconciled origin/main (Track B) into local; BOTH sides kept. maps conflict resolved to Track B's as placeholder. (vpa: an INCREMENTAL maps refresh is dispatched to fold in the deputy infra — once landed, maps reflect the union; keep them current.)
[10] land a30f2f1 .claude/maps/{structure,dependencies,build,infra,primary,non-compliance} — union-state maps landed (deputy infra + flogence folded in); agent worktree cleaned; digest regenerated → current. Maps now reflect the FULL merged tree.
[11] land 42ac2d0 src/playground-{zero,one,four,six,nine,ten}/app.scrml + p9 test.js + docs/changes/idiomatic-rewrite/progress.md — idiomatic rewrite Tier 0: <each> sweep, 0/11→6/11. Bug V fixed + gaps #2/#3/#4/#5 NOT-REPRODUCED (stale comments removed). FINDING: §4.17 raw-content broke <pre>${...} (p4/p6 silently literal) — fixed. Verified @ scrml 96745d34 (moved from a2137214 mid-session). (vpa: when you boot, the digest is STALE — regen at the settled HEAD; maps will need an incremental refresh for the 6 changed app.scrml once the rewrite tiers land.)
[12] land 5760de6 src/playground-{one,two,five,seven}/app.scrml — idiomatic rewrite Tier 1: render-per-state → <match for=Mode on=@mode>. Derived <isX> booleans deleted; p2 cursor class: bindings inlined to (@mode==Mode.X); p2 stale gap #2/#3/#4 comments removed (NOT-REPRODUCED). p5 18/18, p7 17/17, p1/p2 probe-green. Verified @ scrml 346b4357. p4 Tier-1 badge deferred → folds in after its Tier-2 enum+engine promotion.
[13] land 25a63d2 src/playground-{three,four,six,eight}/app.scrml — idiomatic rewrite Tier 2: async-lifecycle string-flag → engine/typed-cell. p6/p8 <engine for=LspPhase> (7/7, 9/9); p3 <cmPhase>: CmPhase typed cell; p4 @mode string → enum + state-child <engine> + <match> badge. FINDINGS: §4.17 <pre>${} raw-content (Tier 0) + arrow-form engine init-emission unreliable (use state-child form) + bare .Variant in ternary→string. Verified @ scrml 7c01b22a (4 compiler bumps over session). String-flag anti-pattern eliminated repo-wide.
[14] msg ../scrml/handOffs/incoming/2026-06-23-1917-6nz-to-scrml-idiomatic-rewrite-findings.md — sent to scrml: Part A (gaps #2/#3/#4/#5 NOT-REPRODUCED, closure) + Part B (3 new codegen findings w/ repros: §4.17 <pre>${} raw-content drop; arrow-form <engine> no init-set; bare .Variant in ternary→string). needs:action. 6nz rewrite pushed @ 721660a.
[15] land src/playground-{zero,one,two,three,four}/test.js — closed the p0–p4 smoke-test gap (5 worktree agents, each read its app.scrml + wrote a puppeteer smoke off the p9/p5 template, verified green; PA landed via file-delta from each agent branch). Independent sweep @ scrml 2dd135ff: p1 12/0 · p2 13/0 · p3 10/0 (CM6 clean off esm.sh) · p4 15/0 (incl. §4.17 ${}-in-tree regression guard) · p0 13/0 + 1 XFAIL. All 11 playgrounds now have smokes. (vpa: 5 new test.js under src/playground-{0..4}/ — incremental maps refresh due for the test-map/structure when you boot.)
[16] find Bug AI — <each>/<empty> fallback NOT torn down on empty→non-empty transition (first item appended beside leftover fallback text). R26-verified @ scrml 2dd135ff via a 13-line minimal repro (reverse edge non-empty→empty is correct). Distinct from R28-1c (repro uses @items=[...] array-ref workaround, still leaks). General to any <each>…<empty>. Surfaced by the p0 smoke → marked XFAIL (auto-flips to XPASS/suite-fail when fixed). master-list §F updated.
[17] msg ../scrml/handOffs/incoming/2026-06-24-0719-6nz-to-scrml-bug-AI-each-empty-fallback-leak.md — filed Bug AI to scrml with inline minimal repro + cmd + SHA (2dd135ff) + expected-vs-actual table + an UNVERIFIED root-cause hypothesis (labeled as such). needs:action.
[18] state S17 WRAPPED — full suite 11/11 green (146 passed + 1 xfail @ scrml 2dd135ff); maps incremental refreshed (test/primary/non-compliance via project-mapper, package.json playwright-mismatch flagged); digest regenerated at settled HEAD; changelog S17 + user-voice S17 + hand-off finalized; pushed to origin. (vpa: no deputy booted this session — PA did all maintenance; digest+maps current at wrap.)
[19] find scrml <each>/input-layer — runtime-verified 4 real defects + 1 not-reproduced @ scrml 0.7.0 (caa8803b), via minimal scrml probes driven by headless Chromium. (F1) expr-form event handlers `onX=${(e)=>…}` silently DEAD inside `<each>` (bare-ref works — workaround); (F2) `<form onsubmit>` in `<each>` → native submit RELOADS page (data loss); (F3) `<each>` renders only FIRST element of a multi-sibling body, extras silently dropped (wrap in single root = workaround); (F4) reactive `${}` inside `<textarea>` leaks `<span data-scrml-logic>` as literal value; (F5 DX) bare void elem (`<input>`/`<br>`) in `<each>` → misleading E-CTX-001/003 pointing at wrong element (self-close = workaround). NOT-REPRODUCED: `bind:value` no-listener (works in plain SPA at 0.7.0; flogence's was `<program db>` SSR — may be SSR-specific/fixed). Probes in scratchpad.
[20] msg ../scrml/handOffs/incoming/2026-07-06-0811-6nz-to-scrml-each-inputlayer-findings.md — filed the 5 findings to scrml (needs:action) with inline minimal repros + cmd + SHA + expected/actual. Surfaced during flogence text-editing integration scoping; per user directive (scrml production-readiness = priority #1, report all gaps to scrml PA).
[21] land src/playground-eleven/{app.scrml,app.pw.ts} — flonav prototype: first flogence-integration artifact. Keyboard cursor-as-PC over a floView-shaped node tree (fleet->project->facet->row) with hjkl nav + cursor-driven auto-collapse (p9 model) + NORMAL/INSERT modal via <engine> (p1 model); INSERT composes+routes a prompt to the cursor node. One keyboard surface owns the mode — no <input>/<textarea>/per-row-handler, so it's clear of the F1-F5 <each> defects filed [20]. Compiles @ scrml 0.7.0; 13-step app.pw.ts smoke green; full sweep 13/13 (12 playgrounds + Bug AI xfail). Vehicle for the flogence editing-modes integration.
[22] msg ../flogence/handOffs/incoming/2026-07-06-0843-6nz-to-flogence-editing-modes-integration.md — sent to flogence: 6nz editing-modes integration hand-off (prototype playground-eleven + idea->surface mapping + nav-first recommended sequence + the 5 scrml input-layer findings/workarounds + Playwright-harness offer). needs:reply. Cross-repo write (sanctioned dropbox). Coordination through operator.
[23] msg ../scrml/handOffs/incoming/2026-07-06-0925-6nz-to-scrml-dev-live-reload-broken.md — filed to scrml (needs:action): scrml dev live-reload channel broken. (A) /_scrml/live-reload chunked stream terminates with ERR_INCOMPLETE_CHUNKED_ENCODING → console error on every page load (reproduced on 3 apps). (B) source edits do NOT hot-reload the open tab (deterministic repro: edit VERSION_A→B, tab stays VERSION_A, 0 auto-reloads). Downstream observed: stale long-lived tab → cryptic `_scrml_reactive_subscribe is not defined` red banner (per-app tree-shaken runtime hashing; labeled hypothesis, not fully isolated). Surfaced when operator hit the banner testing playground-eleven. Fix dir: keep the stream open/reconnect + build-id staleness check. Workaround: manual refresh.
