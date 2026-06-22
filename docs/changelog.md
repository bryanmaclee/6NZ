# 6nz — Changelog

Dated session blocks, newest first. Per-repo session count.

---

## Session 15 — 2026-06-22

**Housekeeping + dogfood-confirmation session: cold maps refresh, source-currency sweep, Bug-AB loop closed, engine-`name=`/AE re-test green against the current compiler tip.**

### Maps
- **Cold `project-mapper` run** — all 10 `.claude/maps/` regenerated (were stale from 2026-04-27, pre-dating p5–p10, the scrmlTS→scrml rename, and v0.7.0) + fresh non-compliance report.

### Currency fixes (from the non-compliance report)
- `README.md` — dead `../scrmlTS` link → `../scrml`; status → exploratory phase (11 playgrounds); added `src/`.
- `editor-README.md` — "Five playgrounds" → eleven; `scrmlTS`→`scrml`; p0–p4 list → p0–p10 + master-list pointer.
- `master-list.md §A` — `default-bindings.md` "v0.3 planned" → "v0.3 done S10".
- p6/p8 source — user-visible "scrmlTS LSP" strings/comments → "scrml" (compile-verified).
- (Mapper finding #5 — z-motion-spec/README "v0.1" — was a **false positive**; file already v0.5. Skipped.)

### Bug-AB loop closed (R26-verified)
- Processed the last unread inbox message (`2026-05-30 bug-ab-fixed`). p10's `<onTransition>`/`@transitions` guard already in place from the S14 rebuild; **re-ran p10 harness against current compiler `d299798`: 19/19**, both AB guards green (`transitions 0->1`, `Enter again → 2`). Archived the message; inbox empty.

### Engine `name=` / Bug-AE confirmation re-test (vs `d299798`)
- All four `<engine name=ModeMachine for=Mode>` playgrounds confirmed against the current tip (newer than the `80f2c190` baseline + the AE fix `faa213c5`): **p5 18/18, p7 17/17** (harnessed, full transitions, no `E-ENGINE-001-RT`); **p1/p2 compile clean**. AE fix confirmed at runtime.
- §36/AF: markup-interp non-reactivity observed in p10 — matches the by-design §36.6 ruling; recorded, not flagged.
- **Net: no open 6nz-filed bug against `d299798`** except L/T/U (M6-deferred parser items).

### Source-currency corrections (user audit)
- **Corrected the "scrml has no source-level import" claim** (was wrong in the maps + master-list §G — a long-standing belief). scrml HAS an Import System (SPEC §21/§41): stdlib `scrml:NAME`, relative `./f.js`, `vendor:`, and **cross-file scrml component/engine splitting** (tutorial §3.3 + :551). What it lacks is npm/bare-specifier imports (`E-IMPORT-005`). Load-bearing for the integration question — playgrounds *can* compose across files.
- **Noted kickstarter v2** (`scrml/docs/articles/llm-kickstarter-v2-2026-05-04.md`) supersedes our frozen v0/v1 local records.

### Cross-repo
- **Out to scrml** — `2026-06-22-0804-6nz-to-scrml-bug-ab-confirmed-plus-engine-name-retest.md` (needs: fyi): Bug-AB confirmed + engine-`name=`/AE re-test all green + §36/AF by-design observation. **scrml push-affected.**
- **Out to master** — needs:push (this wrap).

### Discussed (no code)
- First-integration playground (playground-eleven) sketch: composes mode engine (p1/p2) + z-motion classifier (p0/p7) + CM6 buffer (p3/p5) + relevance panel (p10) across **multiple `.scrml` files** — would be the first 6nz exercise of cross-file `<EngineName/>` mount. Not built; design notes in hand-off.

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
