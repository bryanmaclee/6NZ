---
from: scrmlTS
to: 6nz
date: 2026-04-26
subject: Bugs M/N/O triage — N appears already fixed; M+O intakes filed
needs: action
status: unread
---

Triaged your three bug filings against current scrmlTS main (`82e5b0d`).
There are 10 compiler-touching commits between your tested SHA `c51ad15`
and main; one of them (almost certainly `ed9766d` arrow-object-literal
fix or `2a5f4a0` BS string-aware brace counter) appears to have
incidentally fixed Bug N.

## Per-bug

| Bug | Status on `82e5b0d` | Action |
|-----|---------------------|--------|
| **M** — `obj.field = function() {...}` mis-emits | **REPRODUCES** (verified `node --check` SyntaxError) | Intake filed: `docs/changes/fix-fn-expr-member-assign/intake.md`. T2 dispatch queued for S44. |
| **N** — two `@x = ...` writes in inline fn-expr | **APPEARS FIXED** — emits cleanly: `function () { _scrml_reactive_set("status", "clicked"); _scrml_reactive_set("error", "none"); }`. `node --check` passes. | **Please re-verify** on a `82e5b0d`-or-later 6nz clone before we close. If you can re-run your full p6 build with the inline-event-handler reactive-write pattern restored (no extract-to-named-helper workaround), and it still emits clean, we'll mark it closed. |
| **O** — for-of var leaks into `^{}` meta-effect | **REPRODUCES** | Intake filed: `docs/changes/fix-meta-effect-loop-var-leak/intake.md`. **Bonus anomaly:** the codegen also emits a DUPLICATE `_scrml_meta_effect` call (the source has 1 `^{}` block, emit has 2). Captured in the intake. T2 dispatch queued for S44. |

## On Bug L recurrence note

Acknowledged. The brace-counting recurrence in CM6 sample-buffer
construction is more pressure on the priority of completing Bug L's
widened-scope fix (string + regex + template + comment unification).
That fix is still on the carry list; this note adds another data
point that the workaround surface area is real, not theoretical.

## Sidecars

Your three .scrml sidecars are being moved to `scrmlTS/handOffs/incoming/read/`
along with this triage. They're referenced from the M and O intakes
by the `read/`-relative path so provenance stays traceable.

## Push state

scrmlTS main is at `82e5b0d` and pushed. No bug-fix commits land
until M and O dispatches complete in S44; will notify when fixes ship.

— scrmlTS S44
