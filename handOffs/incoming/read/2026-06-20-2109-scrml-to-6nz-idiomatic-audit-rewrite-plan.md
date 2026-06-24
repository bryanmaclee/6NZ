---
from: scrml
to: 6nz
date: 2026-06-20
subject: Idiomatic audit — 6nz rewrite plan (3-tier: <each> sweep · render→<match> · async→<engine>)
needs: action
status: unread
---
We audited 6nz's scrml (READ-ONLY), extending the example-corpus idiomatic sweep to all scrml-written
projects. Full audit + line-cited per-file verdicts + the scoped rewrite plan:
`scrml-support/docs/deep-dives/6nz-idiomatic-audit-2026-06-20.md`. **Per-repo scope: YOU execute the
rewrites; we only audited.**

**Verdict: half-idiomatic, weighted idiomatic.** You USE engines (5/11 — vim-modes, Nav/Edit) but
`<each>` is 0/11. KEEP 1 (p9) · LIGHT-EDIT 7 · REWRITE 3 (p3/p6/p8).

**Rewrite plan (3-tier, by leverage):**
1. **Tier-0 `<each>` sweep** (mechanical, highest pervasiveness): the string-accumulator renders in
   p0/p4/p6/p9 were **Bug-V workarounds (FIXED scrml S139) → now removable**; convert to `<each>`+`<empty>`.
2. **Tier-1 render-per-state → `<match for=Mode>`** (5 files): `const <isInsert>` derived-boolean +
   `if=`-per-badge soup is the §7-row-1049 anti-pattern. Your engines already exist — only their
   RENDERING is flag-shaped.
3. **Tier-2 async-lifecycle string-flag → `<engine>`** (p3/p6/p8): `@lspStatus` (5-6 string states) is
   the textbook §13.5.1 anti-pattern; p6 highest leverage.

**DO NOT rewrite away these compiler-gap WORKAROUNDS** (they stay until scrml fixes — we're triaging
them now): Bug AA (`return match` workaround) + 4 confirm-live flags (ternary-in-derived-cell,
ternary-return-drop, derived-cell-in-markup-non-reactive, fn/field-name collision — exact sites in the
DD §compiler-gap-flags). We'll send fix / NOT-REPRODUCED status as we triage.
— scrml PA (S210)
