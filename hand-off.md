# 6nz — Session 15 Hand-Off

**Date:** 2026-06-22 (S15 start)
**Next hand-off filename:** `handOffs/hand-off-15.md`

## Open questions (surface first)
1. **Direction for S15** — awaiting user steer. Carried candidates from S14:
   - Confirmation re-test of p1/p2/p5/p7/p10 against scrml's newer SHAs (`faa213c5`/`14fb0230`, both newer than the `80f2c190` we baselined on) — confirms AB/AD/AE fixes hold. (Not a migration; `<engine name=...>` was HONORED, not rejected.)
   - `.claude/maps/` cold `project-mapper` run (Carry 2 — maps predate ALL playgrounds).
   - p9 Bug-V workaround revert (`${treeText()}` single-string → per-line `class:cursor=`) now that Bug V is fixed (S139). Optional cleanup.
   - Multi-close editor feature (`<//>`→`</></>` Emmet expand) — scrml S54 ask, v0.next-era backlog (master-list §E).
   - Build a new high-value playground / start real editor-shell exploration (pa.md §"What NOT to do" now permits exploratory shell/buffer/mode-machine/Z-motion work).

## Session start state
- Session 14 rotated to `handOffs/hand-off-14.md`.
- Working tree at session start: `main`, **up to date with origin/main** (0/0), clean except 1 untracked inbox message (below).
- **1 unread inbox message** (see triage).

## Inbox triage (1 message) — PROCESSED + ARCHIVED
- **`2026-05-30-1500-scrmlTS-to-6nz-bug-ab-fixed`** (needs: fyi) — Bug-AB REOPENED + FULLY FIXED @ `2ebd107a` (origin/main `948d3f2f`, on v0.7.0). Was a parser-coverage gap: canonical engine-DIRECT `<onTransition from=.X to=.Y>` (direct child of `<engine>`, per SPEC §51.0.H) was dropped at parse time because the engine-body scanner only accepted PascalCase openers. Fixed via `scanForEngineDirectOnTransitions`. Asked 6nz to re-add the p10 `<onTransition>`/`@transitions` regression guard + confirm.
  - **CLOSED S15 (R26-verified).** The guard already existed from the S14 p10 rebuild: app.scrml uses the canonical engine-direct `<onTransition from=.Nav to=.Edit>` / `from=.Edit to=.Nav>` children (lines 170–175); test.js asserts the `@transitions` increment explicitly (`Bug AB: <onTransition> fired (transitions 0->1)` line 130 + `Enter again -> NAV + transitions 2` line 134). **Re-ran p10 harness against the CURRENT compiler (`d299798`, v0.7.0, newer than the message's `948d3f2f` and our `80f2c190` baseline): 19/19 pass**, both AB guards green. The two §36 NOTEs in the output are the by-design AF behavior (input-state is live-read, not subscribable per §36.6), not failures. → message **moved to `read/`; incoming empty.**
  - **CONFIRMATION SENT** → `../scrml/handOffs/incoming/2026-06-22-0804-6nz-to-scrml-bug-ab-confirmed-plus-engine-name-retest.md` (needs: fyi). Folds in the engine-`name=`/AE re-test below. **scrml is now push-affected** — include it in the next master push coordination.

## S15 — engine `name=` / AE confirmation re-test (vs `d299798`)
Re-tested all four `<engine name=ModeMachine for=Mode>` playgrounds against the current compiler tip `d299798` (v0.7.0; newer than our `80f2c190` baseline + the AE fix `faa213c5`). Since scrml S210 HONORED `name=` (didn't reject it), this confirms the write-guard/transitions-table now keys correctly for the `name=` form:
- **p5 — 18/18**, **p7 — 17/17** (both harnessed, full mode-transition coverage, no `E-ENGINE-001-RT`).
- **p1, p2 — compile clean** (no harness; `<engine name=...>` accepted; identical codegen path to p5/p7).
- **p10 — 19/19** (canonical no-`name=` `<engine for=Mode>` form; Bug-AB `<onTransition>` guard green).
- §36 (AF): markup-interp non-reactivity observed in p10, matches the by-design §36.6 ruling — recorded, not flagged.
- **Net: no open 6nz-filed bug against `d299798`** except L/T/U (M6-deferred parser items).

## Carried items from S14 (still open)
- **Confirmation re-test** of p1/p2/p5/p7/p10 vs newer scrml SHAs (AB/AD/AE all landed after our `80f2c190` baseline). Confirmation, not migration.
- **master-list currency** — S14 reported a residual sweep needed (some §A/§F cross-repo stamps may still say "scrmlTS"/`dc073b94`). Verify + finish.
- **`.claude/maps/` cold run** (Carry 2).
- **p9 Bug-V workaround revert** (optional cleanup).
- **Multi-close editor feature** in master-list §E backlog (scrml S54, v0.next-era).
- **DX note to scrml (optional, low pri)** — E-TYPE-025 could infer match-subject type from exhaustive `.Variant` patterns. Not filed (their deliberate choice).

## State as of start (carried from S14 close)
| Item | State |
|---|---|
| Push | S14 landed on origin via merge `f4b9b64`; current tip == origin/main (0/0). |
| Playgrounds | 11/11 GREEN against scrml v0.7.0 (p0–p9 re-baselined + p10 rebuilt 19/19) as of S14. |
| Bugs | S11 batch resolved except L/T/U (M6-deferred). p10/S13 batch: X/Y/Z/AB/AC/AD/AE all FIXED; AA OPEN; AF ruled BY-DESIGN (§36.6). |
| Env | global `scrml` → v0.7.0 (repointed S14 after S200 rename). |
| Inbox | 1 unread (bug-ab-fixed, 05-30 FYI — see triage). |

## S15 — source-currency corrections (import claim + kickstarter)
Two stale/wrong facts surfaced by user audit + corrected:
1. **"scrml has no source-level import" was WRONG** (it was in `944d360`'s maps + master-list §G — a pre-existing belief, not introduced by S15). scrml HAS a full Import System (SPEC §21/§41): stdlib `import {x} from 'scrml:NAME'`, relative-path `./f.js`, `vendor:`, AND **cross-file scrml component/engine splitting** (`<Component/>`/`<EngineName/>` mount tags — tutorial.md §3.3 + :551). What it lacks is **npm/bare-specifier** imports (`from 'lodash'` → `E-IMPORT-005`). Corrected in: `master-list.md §G item 1`, `.claude/maps/dependencies.map.md` (×2), `.claude/maps/primary.map.md`. **Implication for integration:** playgrounds CAN compose across files — multi-file editor shell is a language feature, not a fake. (Cross-file engine mount is UNPROVEN in our playgrounds — first integration playground would be the first to exercise it; high dogfood signal.)
2. **Kickstarter is at v2** (`scrml/docs/articles/llm-kickstarter-v2-2026-05-04.md`). Our local records froze at v0/v1 (archived April inbox). Noted in master-list scrml-status section. Not blocking.

Also confirmed: I did NOT read scrml's PRIMER this session (cited SPEC/tutorial directly). PRIMER currency for reference: self-declared header "2026-06-03 (S160)" but last git-touched `1870b404` **2026-06-15 (S195)** — header lags actual.

## WRAP (S15 close — 2026-06-22)
All wrap steps executed:
1. **hand-off** — this file (full density). 2. **master-list** — header → S15; §A default-bindings v0.3; §G import-claim corrected; kickstarter-v2 note in scrml-status. 3. **CHANGELOG** — S15 block added at top of `docs/changelog.md`. 4. **inbox/outbox** — incoming EMPTY (bug-ab archived → read/); sent: bug-ab+re-test confirmation → scrml, needs:push → master. 5. **test-suite** — no unit suite; playground smoke run THIS session: **p5 18/18, p7 17/17, p10 19/19** all green vs `d299798` (p1/p2 compile-clean). 6. **working-tree** — committed (see inventory). 6b. **worktree-cleanup** — N/A (project-mapper ran in main checkout, not a worktree; `git worktree list` = main only). 6c. **maps-refresh** — DONE this session (cold run, committed `944d360` + corrections `9682771`). 7. **push** — needs:push sent to master; 6nz + scrml push-affected; **NOT yet on origin** (master coordinates). 8. **meta-docs** — user-voice S15 appended; source-currency feedback memory saved.

## State as of close
| Item | State |
|---|---|
| Push | **PENDING master coordination.** 6nz local `main` ahead of origin (commits below); scrml also push-affected (received the bug-ab confirmation message). needs:push sent to master. |
| Commits this session (unpushed) | `944d360` (cold maps + currency fixes), `9682771` (import-claim correction + kickstarter-v2 note), + wrap-bookkeeping commit (this close). |
| Working tree | clean after wrap commit (`dist/` gitignored). |
| Playgrounds | 11/11 green vs scrml v0.7.0; **p5/p7/p10 re-confirmed green vs current tip `d299798`** this session. |
| Bugs | No open 6nz-filed bug vs `d299798` except L/T/U (M6-deferred parser). AA was the prior open item — confirmed it's a lint-fire regression, low pri, workaround `return match`. |
| Inbox | EMPTY (bug-ab-fixed processed → read/). |
| Compiler | scrml at `../scrml/`, tip `d299798` (v0.7.0). We last *re-baselined* at `80f2c190`; p5/p7/p10 spot-confirmed at `d299798`. |
| ⚠️ Carry | **Source-of-truth correction landed**: scrml HAS imports (§21/§41) incl. cross-file component/engine splitting. Kickstarter now v2 (our records were v0/v1). |

## Open / carried items (for S16)
1. **Full re-baseline vs `d299798`** — only p5/p7/p10 spot-confirmed this session; p0/p1/p2/p3/p4/p6/p8/p9 still sit on the `80f2c190` baseline. Low risk (no relevant compiler change known) but not verified.
2. **playground-eleven (first integration)** — sketch in changelog + below. Composes mode-engine + z-motion + CM6 buffer + relevance panel across multiple `.scrml` files; first cross-file `<EngineName/>` mount exercise. Design fork: shell-owns-props (A) vs shared store module (B) — start with A.
3. **p9 Bug-V workaround revert** (`${treeText()}` → per-line `class:cursor=`) — optional cleanup, Bug V fixed S139.
4. **Multi-close editor feature** (`<//>`→`</></>` Emmet expand) — scrml S54 ask, v0.next-era, master-list §E backlog.

### playground-eleven sketch (captured for S16)
Files: `app.scrml` (shell, owns `@buffer`/`@cursor`/`@mode`) + `mode-engine.scrml` (`<ModeMachine>`) + `zmotion.scrml` (classifier) + `buffer-view.scrml` (`<BufferView/>` CM6 mount) + `relevance-panel.scrml` (`<RelevancePanel/>`). Proves: cross-file engine mount, shared reactive state across composed components, end-to-end input pipeline (keydown → classifier → mode engine → buffer mutation → view + relevance both update). Traps: component state-scope isolation (shell owns the pipeline), §36/AF readouts need the `@cell` bridge.

## File-modification inventory (this session)
- `hand-off.md` → rotated to `handOffs/hand-off-14.md`; fresh `hand-off.md` (this file).
- `.claude/maps/*` — all 10 cold-regenerated (`944d360`); `dependencies.map.md` + `primary.map.md` import-claim corrected (`9682771`).
- `README.md`, `editor-README.md` — currency (link/status/playground-count/scrmlTS→scrml) (`944d360`).
- `master-list.md` — §A default-bindings; p6/p8 currency note; §G import-claim correction + kickstarter-v2 note; status header → S15 (`944d360` + `9682771` + wrap).
- `src/playground-six/app.scrml`, `src/playground-eight/{app.scrml,bridge.js}` — "scrmlTS LSP"→"scrml" strings/comments (`944d360`).
- `docs/changelog.md` — S15 block (wrap).
- `user-voice.md` — S15 verbatim entries (wrap).
- `handOffs/incoming/read/2026-05-30-1500-…-bug-ab-fixed.md` — archived from incoming.
- **Sent (sibling repo, not in our tree):** `../scrml/handOffs/incoming/2026-06-22-0804-6nz-to-scrml-bug-ab-confirmed-plus-engine-name-retest.md`; `../handOffs/incoming/2026-06-22-…-6nz-to-master-needs-push.md`.
