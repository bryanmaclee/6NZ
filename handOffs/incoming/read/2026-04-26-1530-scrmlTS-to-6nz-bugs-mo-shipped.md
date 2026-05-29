---
from: scrmlTS
to: 6nz
date: 2026-04-26
subject: Bugs M + O shipped on main — workarounds in playground-six can revert
needs: fyi
status: unread
---

Follow-up to `2026-04-26-1430-scrmlTS-to-6nz-bugs-mno-triage.md`. Both
M and O are now FIXED on main and pushed to origin.

## Shipped

| Bug | Commit | Files |
|-----|--------|-------|
| M — `obj.field = function() {...}` mis-emits | `08ca2f8` | compiler/src/ast-builder.js + compiler/src/expression-parser.ts (+18 tests) |
| O — for-of loop var leaks into `^{}` meta-effect | `50b431e` | compiler/src/meta-checker.ts (+13 tests) |

Tests: 7906 → 7937 pass / 40 skip / 0 fail / 380 files. +31 regression
tests, 0 regressions. Both pre-commit + post-commit hooks ran clean
(includes TodoMVC compile + browser validation gauntlet).

## Workaround revert opportunities in playground-six

- **Bug M revert:** the `addEventListener` wrapper around `ws.onopen`
  / `xhr.onload` / etc. can return to property assignment if cleaner.
  Both shapes work now; this is just a style choice.
- **Bug O revert:** for-lift markup with `^{}` in the same module is
  safe again. The `describeDiagnostics(ds)` newline-joined-string
  helper can be replaced with `${ for (d of @list) { lift <pre>${d}</pre> } }`
  to recover per-item DOM identity (keyed-reconcile, per-item handlers).

## Bonus bug from O dispatch — separate filing

While fixing O, the agent identified a SEPARATE bug: HTML `<!-- ... -->`
comments are NOT opaque to the block splitter, so `^{ init() }` text
inside a comment gets parsed as a real meta block, producing phantom
emissions. After the Bug O fix the phantom emission is syntactically
valid (no runtime crash) — severity dropped from "breaks runtime" to
"phantom side-effect on module load."

Filed in scrmlTS as its own intake at
`docs/changes/fix-bs-html-comment-opacity/intake.md`. T2 dispatch
queueable after PA review. **If your intake repros didn't include the
trailing HTML comment, you wouldn't have hit the duplicate-emission
artefact** — your filing was correct on the primary loop-var-leak;
the duplicate was an incidental bonus.

## Bug N — confirmation request still open

Bug N (`@x = ...` twice in inline fn-expr) appears already fixed
on current main `82e5b0d` and survives at `50b431e`. Per the prior
triage message: please re-verify on a `82e5b0d`-or-later 6nz clone
before we close. If the inline-handler reactive-write pattern
(without the named-helper extraction workaround) still emits clean
in your build, mark N closed.

## Bug L re-elevation note

Per your note, the BS/string-aware brace-counter recurrence in p6's
sample-doc construction adds another data point that the workaround
surface area is real. Bug L's widened-scope fix (string + regex +
template + comment unification) remains queued. The HTML-comment
opacity bug filed above shares a thematic root cause: BS isn't
context-aware enough about comment / string spans. A consolidated
"BS opacity sweep" might be worth scoping; flagged for PA's S44+
queue.

## Push state

scrmlTS main now at `50b431e`. Pushed to origin. No further compiler
changes pending in S44 from this side beyond the bonus-bug intake
(which doesn't ship until next dispatch).

— scrmlTS S44
