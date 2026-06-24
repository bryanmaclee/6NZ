# 6nz — Session 17 Hand-Off

**Date:** 2026-06-23 (S17)
**Next hand-off filename:** `handOffs/hand-off-17.md`
**Prev session:** S16 rotated to `handOffs/hand-off-16.md`. S16 wrap COMPLETE + pushed (HEAD `1563663`).
(Note: hand-off-16.md prose says "WRAP NOT DONE" — that is a stale mid-wrap snapshot. The wrap
**was** completed afterward in `3fea8a9` (changelog/master-list/hand-off/digest/inbox-archive),
`8b92a32` (maps incremental), `1563663` (user-voice). Trust git history + this file, not that prose.)

## Open questions (surface first)
1. **scrml reply to the S16 codegen findings** — watch the inbox. Sent `2026-06-23-1917-6nz-to-scrml-idiomatic-rewrite-findings.md` (`needs:action`): Part A (gaps #2/#3/#4/#5 NOT-REPRODUCED, closure) + Part B 3 new findings w/ repros — **§4.17 `<pre>`/`<code>` raw-content silently drops `${...}`**; **arrow-form `<engine>` (`.A => .B`) emits no initial-state set** (use state-child form); **bare `.Variant` in a ternary value position → string literal**. No reply in inbox yet (inbox empty at S17 boot).
2. **Next substantive work — real-app-work surge** (S15 strategic shift: 6nz → flogence's native editor + kb-nav platform; beta testers imminent). Candidate first exercises:
   - **playground-eleven** — first cross-file `<EngineName/>` composition (scrml HAS cross-file import, SPEC §21/§41). Sketch carried from S15. Natural first real-app exercise.
   - **flogence intro message** — outbox channel open (`../flogence/handOffs/incoming/`), nothing sent yet. Outward-facing → confirm with user before sending.
3. **Smoke-test gap: p0–p4 have NO `test.js`** (probe-only). The S16 §4.17 silent breakage in p4 went unnoticed because of this. Consider adding p0–p4 smokes heading into real-app-work.
4. **Deputy still never booted** (carried S15→S16→S17) — vPA system stood up but unverified (heartbeat: `not-yet-booted`; ACK log empty; last-absorbed delta seq 0). Open a 2nd instance → "read vpa.md and boot" to smoke-test before the surge. Until then PA does all maintenance itself.
5. **Digest STALE at boot** — regenerated at `3fea8a9` but HEAD moved past it (`8b92a32`,`1563663`). Read cold per addendum. No deputy up to keep it fresh; PA regens at next settled commit / wrap.
6. **p1/p5/p7 on arrow+`name=` engines** (working, pre-existing) — left un-churned despite the arrow-form finding. `name=` is now valid + wired (AE resolved). Leave-as-is unless a reason surfaces.

## State as of session start (S17 boot)
| Item | State |
|---|---|
| Coherence | `0 0` (origin/main == local main == `1563663`); clean working tree. No fork. |
| Digest | **STALE** (`bun scripts/state.ts --check`) → distrusted; read cold per addendum. |
| Deputy | ADOPTED, **never booted** (heartbeat: not-yet-booted; ACK log empty; seq 0). |
| flogence-intake | empty (no queued bugs). |
| Inbox | **empty** (idiomatic-audit msg acted-on + archived → `incoming/read/`). No scrml reply yet. |
| Playgrounds | 11/11 green. S16 idiomatic rewrite landed + pushed (83/83 smoke + p0–p4 probe-green). |
| Maps | union-state + S16 incremental, current at `8b92a32`. |
| Bugs | AA OPEN (low-pri lint regression, workaround exists). AG/AH NOT-REPRODUCED. AB/AD/AE resolved+verified. AF by-design. L/T/U M6-deferred. 3 new S16 findings sent, awaiting scrml. |
| delta-log | entries [1]–[14] all landed; single-writer = PA. None absorbed (no deputy). |

## What happened this session (S17) — closed the p0–p4 smoke-test gap (open thread #3) + surfaced Bug AI; WRAPPED + PUSHED

**Two commits: `2ab2f4d` (smokes + master-list §F + delta-log) + the S17 wrap commit (changelog/hand-off/rotation/maps/digest/user-voice). `wrap and push` — pushed to origin. Full wrap suite: 11/11 green (146 passed + 1 xfail, 0 failed @ scrml `2dd135ff`).**

1. **Verified the harness first** — ran the existing p9 smoke as ground truth: 13/13 green against live `scrml dev` 0.7.0 + puppeteer (in `../scrml/node_modules`; tests run with `NODE_PATH=/home/bryan-maclee/scrmlMaster/scrml/node_modules`). Pattern proven before writing anything.
2. **5 worktree agents** (one per playground) each read its `app.scrml`, wrote `src/playground-N/test.js` off the p9 (non-CM6) / p5 (CM6) templates, and verified green. PA landed each via `git checkout <branch> -- <file>` (clean clobber — none pre-existed), then ran an **independent sweep** @ scrml `2dd135ff`:
   - **p1 12/0 · p2 13/0 · p3 10/0** (CM6 loaded clean off esm.sh, no env caveat) **· p4 15/0** (incl. the §4.17 `${}`-in-tree-text regression guard — the S16 `<pre>`→`<div>` fix holds) **· p0 13/0 + 1 XFAIL**.
   - All 11 playgrounds now have `test.js` smokes.
3. **NEW Bug AI** (surfaced by the p0 smoke, left failing per R26): `<each>` with an `<empty>` fallback does **not** tear down the fallback on the **empty→non-empty** transition — the first item is appended *beside* the leftover fallback text. Reverse edge (→empty via `@items=[]`) is correct. **R26-verified** via a 13-line minimal repro (in scratchpad) @ scrml `2dd135ff`. Distinct from R28-1c (repro uses the `@items=[...]` array-ref workaround, still leaks). General to any `<each>…<empty>`.
   - **Disposition (user-chosen):** p0 check-6 → **XFAIL + track** (suite stays green, exit 0; auto-flips to XPASS/suite-fail when scrml fixes it → prompts removal). Implemented an `xfail()` helper in `src/playground-zero/test.js`.
   - **Filed to scrml** (user-authorized): `../scrml/handOffs/incoming/2026-06-24-0719-6nz-to-scrml-bug-AI-each-empty-fallback-leak.md` (`needs:action`) — inline repro + cmd + SHA + expected/actual table + an UNVERIFIED root-cause hypothesis (labeled).
4. **Meta:** master-list §F (Bug AI row + S17 header) + delta-log [15]–[17]. Committed `2ab2f4d` with explicit pathspec (7 files). Cleaned up all 5 agent worktrees + branches.

## Open questions / pending (surface first next session)
1. **scrml reply pending — now TWO threads:** (a) S16 codegen findings (`2026-06-23-1917`: §4.17 / arrow-form `<engine>` / bare `.Variant`); (b) **Bug AI** (`2026-06-24-0719`). Watch the inbox.
2. ~~Push pending~~ **DONE** — wrapped + pushed S17.
3. ~~WRAP not done~~ **DONE** — changelog S17, rotation committed, digest regenerated at settled HEAD (verified `current`), maps incremental (test/primary/non-compliance), user-voice S17, full suite recorded. Pushed.
4. **Non-compliance flag (S17, project-mapper):** `package.json` declares `@playwright/test` + `"test": "playwright test"` but the real smokes are puppeteer node scripts run via `NODE_PATH=../scrml/node_modules`; `npm test` is a no-op. Disposition pending — either drop the playwright dep + wire a real `test` script (run all 11), or document the run convention. See `.claude/maps/non-compliance.report.md`.
5. **Real-app-work surge** (carried) — playground-eleven (cross-file `<EngineName/>`) or flogence intro message (outbox open, nothing sent — needs user OK).
6. **Deputy still never booted** (carried) — PA did all maintenance; digest+maps current at wrap. Smoke-test before the surge.

## File-modification inventory (this session)
- **Commit 1 (`2ab2f4d`):** `src/playground-{zero,one,two,three,four}/test.js` (new), `master-list.md`, `handOffs/delta-log.md`.
- **Commit 2 (S17 wrap):** `docs/changelog.md` (S17 block), `hand-off.md` (this file), `handOffs/hand-off-16.md` (S16 rotation), `handOffs/digest.md` (regen), `handOffs/delta-log.md` ([18]), `.claude/maps/{test,primary,non-compliance.report}.map.md`, `user-voice.md` (S17). Pushed.
- **Cross-repo (one-way write):** `../scrml/handOffs/incoming/2026-06-24-0719-...-bug-AI-...md`.
- **Scratchpad (not in repo):** minimal Bug AI repro `each-empty-repro.scrml` + `repro-driver.js`.
