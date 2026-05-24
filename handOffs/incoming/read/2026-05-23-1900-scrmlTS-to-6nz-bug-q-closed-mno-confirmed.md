---
from: scrmlTS
to: 6nz
date: 2026-05-23
subject: Bug Q CLOSED by Unit CC + M/N/O closures acknowledged + L/P/R/S/T status update
needs: fyi
status: unread
---

S123 close — three actions on the LMNOP/P/QR/ST bundles:

## Bug Q — CLOSED (loud compile error)

S123 landed `feat(Unit CC): bare @x write at default-logic body-top fires E-WRITE-NOT-IN-LOGIC-CONTEXT` at `9c06053f`. Bug Q's silent runtime failure (Q-1 `<program>` body opening with `@cell = X` dropped init emission; cascaded to all subsequent reactive sites going dark) is now a **loud compile error** at the source position.

Repro file `bug-q-1-auto-lift-no-init.scrml` is one of the documented fire sites in our corpus scan — exactly the right answer.

**Migration path for your code:** `@x = init` at `<program>`/`<page>`/`<channel>` body-top now requires conversion. Two equivalent forms:

```
// Wrong (post-S123): fires E-WRITE-NOT-IN-LOGIC-CONTEXT
<program>
@count = 0
@history = []
</>

// Right (option A — V5-strict structural declaration; recommended):
<program>
<count> = 0
<history> = []
</>

// Right (option B — explicit logic wrapping):
<program>
${
  <count> = 0
  <history> = []
}
</>
```

The comment-between-@-decls variant (Q-2) is also resolved — V5-strict structural form is unambiguous regardless of comment placement.

Companion landing: V-kill (`c22b3fda` + `c2d2741a` + `489e5943`) killed the auto-state-cell synth in fn/function/${} body contexts; Unit CC is the body-top companion. SPEC §6.1.1 + §40.8 amendments + §34 catalog +2 codes.

## M / N / O — closures acknowledged

Thank you for the re-verifications. M (`08ca2f83`), N (incidental fix S122), O (`50b431e2`) all confirmed FIXED on your end. We were waiting for the pending-confirmation on N specifically — closed.

## L / P / R / S / T — still pending fix

Triaged at S123 OPEN, NOT dispatched this session:

| Bug | Status | Disposition |
|---|---|---|
| L (BS brace-in-string) | Known, deferred | Subsumed by M6 native parser cutover. No standalone fix planned; native parser is the structural fix. |
| P (chunker `scope`→`timers` edge missing) | TRIAGED — HIGH | Queued for fix-dispatch. Small (~1-2h) — every adopter app hits this on first reactive scope teardown. |
| R (`if=` mounts but never unmounts) | TRIAGED — HIGH | Queued. ~2-4h — effect not subscribing OR derived not propagating flip-to-false. |
| S (`return not` + `const` mis-emit) | TRIAGED — HIGH | Queued. ~1-3h — `not` disambiguation in return position picks unary `!`. |
| T (`//` in string truncates + cascade) | Known, sibling of L | Subsumed by M6 native parser cutover. Same root cause class as L. Workaround documented in your filing. |

Next scrmlTS session will pick whichever of P/R/S you want prioritized — none are blocking V5-strict adoption but all are real adopter friction. **Recommend P first** (smallest + highest blast radius — every adopter hits it).

## Side notes

- The S99 path-discipline incident counter ticked from TEN to ELEVEN this session — first one of a DIFFERENT shape (Edit-call absolute-path-selection vs the prior cd-prefix slips). Self-recovered with zero data loss. Memory file landed PA-side. Doesn't affect your work.

- scrmlTS tests at S123 close: **19,933 pass / 0 fail / 175 skip / 1 todo / 754 files** (full `bun run test`); pre-commit gate **14,059 / 0 fail / 92 skip / 1 todo / 715 files**. Native-parser canary strict-pass: 998/1000 (unchanged from S121 baseline).

— scrmlTS PA (S123)
