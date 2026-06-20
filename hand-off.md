# 6nz — Session 12 Hand-Off

**Date:** 2026-06-19
**Next hand-off filename:** `handOffs/hand-off-12.md`

## Open questions (surface first)
1. **Direction for S12** — re-baseline all 9 playgrounds against scrml v0.7.0+, vs. build playground-ten on a high-value target (scrml is asking for `<keyboard>`/`<mouse>` input-state §36 — a natural fit for a keyboard-driven editor), vs. currency/housekeeping first. Awaiting user steer.
2. **Compiler version to dogfood against** — scrml is now at `/home/bryan-maclee/scrmlMaster/scrml/` (renamed from scrmlTS). v0.7.0 = `c5dbf15d`; S147/S148 ride on top at `a0f61a20`. We last tested against v0.6.x-era `dc073b94`.

## Session start state
- Session 11 rotated to `handOffs/hand-off-11.md`.
- Working tree: `main`, **1 commit ahead of origin/main, unpushed** — `e6fc5e8` "pa: modernize" (06-19) + `0fa1cbb` "deliver 10 inbox messages" (05-29). The pa-modernize commit already updated pa.md scrmlTS→scrml paths (S200 rename) and adopted scrml's modern PA disciplines (wrap/density/commit-hygiene/worktree/R26/context-budget/crash-recovery).
- **14 unread inbox messages** (10 committed via `0fa1cbb` after a caps-`6NZ/` misrouting fix on scrml's side; 4 untracked, newest). Triage below.

## Inbox triage (14 messages)

### Action-bearing
- **`2026-06-16-1725-s200-repo-rename`** (needs: action) — scrmlTS→scrml, scrml→scrml-native (dirs + GitHub). **pa.md paths ALREADY updated** in `e6fc5e8`. master-list.md + docs still say "scrmlTS" → currency pass needed. → mostly done; archive after currency sweep.
- **`2026-05-29-0727-resume-dogfooding`** (needs: action) — pull v0.6.7 (now superseded by v0.7.0), resume dogfooding. Headline: **report anything that compiles clean but is runtime-broken** (5 silent-miscompiles found on 8 shipped surfaces in their S140 audit). High-value targets for 6nz: **engines/state-machines (§51 hierarchy)**, **lifecycle annotations (§14.12)**, **list-churn (Bug-V neighborhood, now fixed)**, **input-state types §36 `<keyboard>`/`<mouse>`/`<gamepad>` (≈0 adoption — "uniquely high-signal" for an editor)**. Do NOT re-report Bug 54 (`:let` on `<column>`), Bug 60 (nested compound render-by-tag), `${@x/}` self-closing-slot.
- **`2026-05-04-0958-multi-close-editor-option`** (needs: action) — language dropped Move 7 (`<//>` multi-close); **editor should add Emmet-style auto-expand `<//>`→`</></>`** (default off). v0.next-era ask, no rush. → track in master-list editor backlog.

### Bug closures (FYI — verify + archive)
- **`2026-05-28-1613-bug-v-RESOLVED`** — Bug V (`class:NAME` on for-lift reused nodes) RESOLVED at S139 (v0.6.4), root cause = `_scrml_tracking_paused` global bleed across nested effect scopes; fix brackets inner `fn()` with save/null/restore. Covers `class:`/`style:`/attr-interp/`textContent`/`bind:value` in reconciled list items. **We can drop p9's `${treeText()}` single-string workaround** and restore per-line `class:cursor=` binding.
- **`2026-05-23-2200-bug-p-closed`** — Bug P CLOSED `d570341d` (already verified our side S11). Loop closed.

### Version / syntax FYI
- **`2026-05-30-0900-v0-7-0-available`** — v0.7.0 cut (`c5dbf15d`). block-`<match>` in `<each>` renders per-item; `<engine>` `:`-shorthand + `//` comment block-split fixed; variant-progression `(.A to .B)` lifecycle enforcement fires; `<errorBoundary>` functional. Still-open: R28-1c (`<each>` same-key in-place field mutation doesn't re-render per-item — use `@items=[...]` array-ref replacement).
- **`2026-05-31-0532-s147-match-colon-arrow`** + **`2026-05-31-1100-match-given-colon-shipped`** — match/`!{}`-handler/given arm separator `:>` now canonical; `=>`/`->` deprecated → `W-MATCH-ARROW-LEGACY` / `W-GIVEN-ARROW-LEGACY` (info-level, non-fatal, byte-identical emit). Migrate with `bun scrml migrate <dir> --fix` (AST-driven; lambdas + fn-returns untouched). Our src has no match/given arms using these (only a comment in p4) → no migration needed yet.

### Event-threading revert (FYI — but R26-flagged latent risk in OUR code)
- **`2026-05-16-1200`** + **`2026-05-16-1450`** (duplicate pair) — S96 (`cc59982`): `onclick=fn()` bare-call no longer auto-threads `event` (SPEC §5.2.2 alignment). Emits `function(event){ fn(); }` — `fn` gets no event arg. **R26 grep finding: p0/p1/p2/p4 use bare `onkeydown=handleKeyDown()` / `onkeyup=handleKeyUp()`** — if those handlers read `e.key`, they now get `undefined` at runtime (compiles clean, breaks live). Fix: arrow form `${(e) => handleKeyDown(e)}`. p9 already uses explicit `handleKey(event)` → safe. **VERIFY before claiming broken.**

### Superseded (April–May, archive)
- **`2026-04-25-1100-s41-fixes-and-kickstarter`** — Bug L revert (known), GITI-012/013, LLM kickstarter v0.
- **`2026-04-26-0919-s42-close`** — kickstarter v1, A1-A6 fixes, F4 routing-leak, examples 15-22.
- **`2026-04-26-1430-bugs-mno-triage`** — M/N/O triage; all confirmed fixed in S11. Superseded.
- **`2026-04-26-1530-bugs-mo-shipped`** — M+O shipped + N confirmation request; N confirmed fixed S11, closure already sent. Superseded.

## S12 session work — RE-BASELINE all 10 playgrounds against scrml v0.7.0 (`80f2c190`, S209)

User picked "Re-baseline all 9 vs v0.7.0." Result: **all 10 playgrounds compile-clean + runtime-green against v0.7.0. NO compiler bugs found** — every breakage was adopter-migration debt from v0.7.0's deliberate tightening.

### Environment fix (S200 rename fallout)
- The global `scrml` command was BROKEN: `~/.bun/bin/scrml` → `scrmlts` pkg → `/home/.../scrmlTS` (dir renamed to `scrml` at S200). Repointed `~/.bun/install/global/node_modules/scrmlts` → `…/scrml`. `scrml --version` → 0.7.0. (This is the exact routing hazard the S200 rename message warned about — it broke the user's global `scrml` everywhere, not just our harness.)

### Compile-layer migrations (10/10 now compile clean)
- **E-TYPE-025** (NEW v0.7.0 strictness — `match` requires a typed subject) hard-failed p2 + p9. Fix: annotate the match-subject params — `kindGlyph(k: NodeKind)` / `kindName(k: NodeKind)` (p9), `modeName(m: Mode)` (p2). Classified our-code-migration, not a bug. (DX note candidate for scrml: exhaustive `.Variant` shorthand arguably could drive inference; they chose "narrow first" deliberately.)
- **`scrml migrate src/ --fix`** handled the bulk mechanically: whitespace `< db>`→`<db>` (×3 incl p2), `<machine>`→`<engine>` (×4), `=>`/`->` arm-arrows → `:>` (×15+13), `const @x`→`const <x>` (×15+2). NOTE: migrate FAILS its parse-verify on a file with a pre-existing hard error, so p2/p9 had to be E-TYPE-025-fixed FIRST, then re-migrated.
- **W-ENGINE-INITIAL-MISSING** on p1/p2/p5/p7 after `<machine>`→`<engine>`: added explicit `initial=`. **Caught a real latent mismatch** — p2/p5/p7 intend `.Normal` (vim convention) but their engine's FIRST state-child is `.Insert`, so the compiler default ("first child") would've silently declared the wrong start state. `initial=.Normal` (p2/p5/p7), `initial=.Insert` (p1).

### Runtime-layer fixes (the "compiles clean but runtime-broken" class)
- **Event-threading revert (S96)** — p0/p1/p2/p4 used bare-call `onkeydown=handleKeyDown()`; post-S96 emit is `function(event){ handleKeyDown(); }` (event bound, NOT passed). Handlers read `e.key`/`e.preventDefault()` → undefined → TypeError on first keystroke. Compiled clean; broke live. R26-VERIFIED the break (emit `handleKeyDown()`) AND the fix (emit `(e) => handleKeyDown(e)`). Fix = arrow form `onkeydown=${(e) => handleKeyDown(e)}` (×7 sites). Runtime-probed: p2 NORMAL→INSERT, p4 type-char (e.preventDefault ok), p0 classifier, p1 boots clean — all zero pageerrors. Correct SPEC §5.2.2 behavior; our migration, not a bug.
- **Bridge LSP path (S200 rename)** — p6/p8 `bridge.js` resolved the LSP via `../../../scrmlTS` (gone). Fixed → `../../../scrml`; env override now accepts `SCRML_DIR` || legacy `SCRMLTS_DIR`.

### Runtime smoke results vs v0.7.0
- Harnessed: **p3 CM6 mount ✓, p5 18/18, p6 7/7, p7 17/17, p8 9/9, p9 13/13.** (p8 completion items 57→58 — LSP grew.)
- Unharnessed but event-fix runtime-probed: **p0, p1, p2, p4** (zero pageerrors + observable transitions).

### Bug status re-verified against v0.7.0 (direct repros)
- **Bug W (CRITICAL paren-drop) — VERIFIED FIXED.** `(2+3)*4` → emit `(2 + 3) * 4`; `(1+2)*(3+4)` preserved.
- **Bug S (`return not`→`return !const`) — VERIFIED FIXED.** Emits `return null;` + clean `const`; `node --check` passes.
- From inbox: P/Q fixed, R retracted, M/N/O fixed, V fixed (S139). L/T/U M6-deferred. **Net: every S11 bug resolved except the 3 M6-deferred parser ones.**

## S12 (cont'd) — playground-ten rebuilt (relevance-region navigator + §36 input-state), 19/19

User said "kick off pg10." Discovery: **p10 already existed and was lost.** A 6nz instance ("S13", 2026-05-29) built p10 against v0.6.7 and filed bugs X/Y/Z/AA/AB + AC to scrml — but the source landed in the misrouted caps-`6NZ/` clone (now empty) and never reached this repo; our hand-off had no record. Only the 6 bug repros survived in scrml's `read/` archive.

### Recovered + re-verified the lost bug batch against v0.7.0
Compiled each surviving repro against v0.7.0: **X/Y/Z/AB/AC FIXED, AA still OPEN** (full table in master-list §F). X (// in string) + Z (rename-in-string) were HIGH and editor-critical — both fixed.

### Rebuilt playground-ten (`src/playground-ten/{app.scrml,test.js}`)
Relevance-region navigator: for-lift region list (`class:focused`/`style:opacity` reading global `@focusId`), `<engine>` Nav/Edit machine + `<onTransition>`, region titles with fn-names + URLs, `match @mode` badge, `<keyboard>`/`<mouse>` §36 panel. **19/19 runtime smoke** against v0.7.0. Live-confirmed: Bug-V (class:focused through nav + churn), Bug AB (onTransition fires), Bug Z + X (verbatim string render).

### Cross-repo traffic log
- **Out to master** (needs:push) — `../handOffs/incoming/2026-06-20-1418-6nz-to-master-needs-push.md`. Requests coordinated push of 6nz (clean, ahead of origin) + flags scrml as push-affected (received the 6nz p10 bug message). User-authorized push this session. **Push is queued with master, NOT yet on origin** — master does the actual push.
- **Out to scrml** (1 message + 3 sidecars) — `../scrml/handOffs/incoming/2026-06-20-1217-6nz-to-scrml-p10-bugs-ad-ae-af-plus-s13-status.md` + `2026-06-20-1217-6nz-p10-bug-sidecars/{bug-ad,bug-ae,question-af}.scrml`. Delivers: S13 batch re-verification (X/Y/Z/AB/AC fixed, AA open — closes the dropped S13 loop), Bug AD, Bug AE, Question AF. All 3 repros R26-verified against v0.7.0 (AD: bare-name emit; AE: runtime E-ENGINE-001-RT via puppeteer; AF: no-effect-wrapper emit). **scrml is now push-affected** — include it in the next master push coordination.

### 3 NEW findings (sent to scrml 2026-06-20)
- **Bug AD (HIGH)** — user fn in an ATTRIBUTE-value interp (`class="x-${fn()}"`) emits the bare un-renamed name → runtime `ReferenceError`. exit-0, node --check OK, runtime-broken. `@cell` refs rewrite fine in the same spot; textContent interp renames correctly; only the attr-interp user-fn path is missed. Z-family. Minimal repro confirmed. Workaround in p10: derived cell / avoid fn in attr interp.
- **Bug AE (HIGH)** — `name=` on an `<engine>` breaks the transition write-guard: guard reads `__scrml_transitions_<EngineName>` (never defined) while the rule table is built under the variable name (`__scrml_engine_<var>_transitions`) → `E-ENGINE-001-RT` on every legal transition. Confirmed by comparing the `name=` form vs the canonical no-`name=` form (latter wires correctly). Workaround in p10: canonical `<engine for=Mode initial=.Nav>` form (no name=).
- **Question AF** — `${<#input>.field}` §36 read in markup renders the initial value once, emits NO `_scrml_effect` wrapper → never updates on input (confirmed at emit level: modeBadge textContent gets an effect, the input-state read does not). By-design (read in animationFrame loop) or codegen gap? Real limitation for an editor's live input display.

### My-code issues fixed during the build (not compiler bugs)
- Indexed for-lift `@regions[i]` in a reactive binding crashes on array shrink (stale index → undefined.id). Fixed by item-binding `for (const r of @regions)` (matches the original p10).
- `class=@badgeClass` (bare `@cell` in an unquoted attribute) emits the LITERAL string "badgeClass", not a reactive binding — switched to `class:NAME=expr` toggle form. (Possible minor scrml observation: bare `@cell` unquoted attr value silently becomes a literal; not filed — `${...}` interp / `class:` are the canonical forms.)

## S12 (cont'd) — scrml triage reply received + push

**Inbound `2026-06-20-1339-scrml-to-6nz-p10-bugs-triaged` (archived):** AD + AE both FILED HIGH + DISPATCHED (fixes in flight); S13 batch confirmed; AA tracked for a lint; AF is a pending design ruling (render-once may be by-design — rAF→`@cell` is the supported live pattern). AE root re-classified: `name=` is not a valid `<engine>` attr (valid: `for=`/`initial=`/`var=`/`derived=`); the fix will REJECT it as a compile error.

⚠️ **CARRY (future-break, not urgent):** when scrml's AE fix lands, `<engine name=...>` becomes a COMPILE ERROR. **p1/p2/p5/p7 all use `<engine name=ModeMachine ...>`** (p1:138, p2:324, p5:309, p7:396) — they compile fine now (against `41422726`, fix not landed) but will need migration: drop `name=`, remove the separate `@mode: ModeMachine` declaration, let the engine own `@mode` via `initial=` (or use `var=`). Requires re-smoke of p1/p5/p7 after. Watch for scrml's "AD/AE landed" ping, then migrate.

## Open / carried items
- **p9 Bug-V workaround still in place** — p9 renders the tree as one `${treeText()}` string with a textual "> " cursor marker (Bug V workaround). Bug V is fixed (S139) so this CAN be reverted to per-line `class:cursor=` binding. NOT done this session (p9 is green as-is); optional cleanup.
- **Multi-close editor feature** (`<//>`→`</></>` Emmet expand) — scrml's S54 ask; tracked, v0.next-era, no rush. Belongs in master-list editor backlog (NOT yet added).
- **master-list currency** — header/status updated; per-playground version stamps in §A + §F cross-repo still say "scrmlTS"/`dc073b94` in places → finish currency sweep before/at wrap.
- **DX note to scrml (optional, low pri):** E-TYPE-025 could infer subject type from exhaustive `.Variant` patterns. Not filed (their deliberate choice).
- **Inbox archived** — all 14 processed messages moved to `handOffs/incoming/read/` (incoming now empty). Multi-close ask preserved in master-list §E before archiving.

## WRAP (S12 close — 2026-06-20)
All wrap steps executed:
1. **hand-off** — this file (full density). 2. **master-list** — currency + §F bug ledger + p10 entry + triage outcomes. 3. **CHANGELOG** — `docs/changelog.md` created with the S12 block (first changelog for the repo). 4. **inbox/outbox** — incoming empty (14 archived); sent: p10 bug batch → scrml, needs:push → master, triage reply processed. 5. **test-suite** — 6nz has no unit suite; playground smoke status verified this session: **11/11 green** (re-baseline + p10). 6. **working-tree** — clean (all committed). 6b. **worktree-cleanup** — N/A (no agent worktrees dispatched this session; `git worktree list` = main only). 6c. **maps-refresh** — DEFERRED (see carry; `.claude/maps/` predate ALL playgrounds → needs a `project-mapper` COLD run, not incremental — flagged for next session). 7. **push** — direct to origin at close (user-authorized "wrap and push"). 8. **meta-docs** — user-voice S12 entry appended; findings captured in §F + changelog.

## State as of close
| Item | State |
|---|---|
| Push | **pushed to origin/main at S12 close** (direct, user-authorized). 7 wrap+work commits (`e6fc5e8`..wrap tip). |
| Working tree | clean (`dist/` gitignored). |
| Playgrounds | **11/11 GREEN against scrml v0.7.0** — p0–p9 re-baselined + p10 rebuilt (19/19). |
| Bugs | S11 batch resolved except L/T/U (M6-deferred). S13/p10 batch: X/Y/Z/AB/AC fixed, AA open; AD/AE FILED HIGH + DISPATCHED by scrml, AF pending design ruling. |
| Env | global `scrml` command repointed → v0.7.0 (was broken by S200 rename). |
| Inbox | all 15 processed → `read/`; incoming empty. |
| ⚠️ Top carry | when scrml's AE fix lands, `<engine name=...>` → compile error. **p1/p2/p5/p7 use `<engine name=ModeMachine ...>`** — migrate off `name=` (let engine own the cell / use `var=`) + re-smoke. Not urgent (fix not landed). |
| Carry 2 | `.claude/maps/` stale (pre-playgrounds) → `project-mapper` cold run next session. |
| Carry 3 | Multi-close editor feature (`<//>`→`</></>`) in master-list §E backlog (scrml S54 ask, v0.next-era). |

## File-modification inventory (this session)
- `hand-off.md` → rotated to `handOffs/hand-off-11.md`; fresh `hand-off.md` (this file).
- `src/playground-zero/app.scrml` — arrow-form key handlers.
- `src/playground-one/app.scrml` — migrate (engine/const/arrow), arrow-form handlers, `initial=.Insert`.
- `src/playground-two/app.scrml` — `modeName(m: Mode)`, migrate, arrow-form handlers, `initial=.Normal`.
- `src/playground-four/app.scrml` — migrate (const/arrow), arrow-form handler.
- `src/playground-five/app.scrml` — migrate, `initial=.Normal`.
- `src/playground-six/app.scrml` — migrate (whitespace/const); `bridge.js` — LSP path scrmlTS→scrml.
- `src/playground-seven/app.scrml` — migrate, `initial=.Normal`.
- `src/playground-eight/bridge.js` — LSP path scrmlTS→scrml. (app.scrml unchanged — was already clean.)
- `src/playground-nine/app.scrml` — `kindGlyph(k: NodeKind)`/`kindName(k: NodeKind)`, migrate (arrow/const).
- `master-list.md` — currency pass + §F bug ledger (S13-recovery + AD/AE/AF) + p10 entry (§A/§E) + status.
- `src/playground-ten/{app.scrml,test.js}` — NEW (rebuild; 19/19 smoke).
- Env: `~/.bun/install/global/node_modules/scrmlts` symlink repointed (outside repo).
