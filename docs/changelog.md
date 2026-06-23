# 6nz — Changelog

Dated session blocks, newest first. Per-repo session count.

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
- Merged `origin/main` (the parallel instance's 4 commits `944d360`/`9682771`/`f0c9854`/`1bb8cbb`) into local. Kept BOTH sides — Track A's deputy/flogence/p10 + Track B's currency sweep + dogfood confirmations. `.claude/maps/` re-run cold post-merge for the union state. The two S15 narratives folded into this block. The fork recurred because session-start ran no coherence check — flagged for a `pa.md` fix.

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
