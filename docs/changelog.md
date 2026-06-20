# 6nz — Changelog

Dated session blocks, newest first. Per-repo session count.

---

## Session 12 — 2026-06-19/20

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
- **11/11 playgrounds green** vs scrml v0.7.0. Working tree clean. Pushed to origin (S12).
