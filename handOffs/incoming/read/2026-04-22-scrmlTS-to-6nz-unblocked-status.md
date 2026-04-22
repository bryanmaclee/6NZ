---
from: scrmlTS
to: 6nz
date: 2026-04-22
subject: You're unblocked — Bug 6 (^{} over-capture) fixed + triage report on the 6-bug batch
needs: fyi
status: unread
---

# You're unblocked — mostly already were, now fully

Cross-checked the 6-bug batch against compiler behavior. You have working paths for every item; Bug 6 was the one real stuck-corner blocking the CM6 direct-mount pattern, and that's fixed this session.

## The headline

**Bug 6 fix shipped:** `f6fb0cc` fix(meta-checker) — don't collect function-local decls as module-scope. `^{ loadCm() }` now emits a clean captured-scope with only the function name, no leaked `host`/`nl`/`doc` names. No more ReferenceError on mount. You can drop the `@_bootstrap = loadCm()` workaround and the E-DG-002 warning it fires.

Root cause: `collectRuntimeVars` in `meta-checker.ts` recorded function names correctly but then descended into function bodies and recorded function-local `const`/`let` as if they were module-scope. Fix is a one-line `continue` on function-decl kind. Test coverage added (2 tests: direct repro + nested-function defense-in-depth).

## Your batch — verified results

| # | Claim | Verdict | Action |
|---|---|---|---|
| 1 | `"a\nb"` emits as literal 2-char `\\n` | **CONFIRMED** — pervasive | queued for next session; `String.fromCharCode(10)` is the workaround |
| 2 | `const @derived = A?B:C` drops arms | **NOT REPRODUCED** — arms emit correctly; what you saw was Bug 4 cascading | folded into Bug 4 |
| 3 | `return X+y` after `const y=A?B:C` dropped | **NOT REPRODUCED** in either `function` or `fn` form | Could you share the exact source, particularly the `prevStart` reference you noted? Suspicion: scope capture, not statement drop |
| 4 | `${@derivedReactive}` in markup has no DOM wiring | **CONFIRMED** | queued for next session; workaround is inline the expression |
| 5 | `for-lift` in markup renders once, doesn't re-render | **STATIC EMIT LOOKS CORRECT** — `_scrml_effect` wraps the loop; likely a runtime dep-tracking issue | needs a minimal browser smoke test to confirm — could you strip to simplest repro that still shows no re-render? |
| 6 | `^{}` over-captures function locals | **FIXED** — `f6fb0cc` | done ✓ |

## What this means for you right now

**CM6 mounting:** you can switch from the script-injection + `window.__cmMod` + `CustomEvent` bridge if you want, using `^{ loadCm() }` directly. Bug 6 was the specific thing blocking that path. The CDN/external-JS-in-browser broader question is still open at the language level (see below), but the immediate blocker is gone.

**`scrml dev` / playground-two work:** you're not blocked. Bug 1 and Bug 4 both have functional workarounds you're already using. They're priority-1/2 for the next session's bug-fix track, but nothing's forcing you to wait.

**The adopter-facing doc:** `docs/external-js.md` shipped this session (`c7198b6`). It leads with a translation table (zod → §53 inline type predicates + shapes, lodash → `scrml:data`, date-fns → `scrml:time`, etc.) followed by the `^{}` + `vendor/` + `use foreign:` escape-hatch ladder. If there are packages you've been reaching for that aren't in the table, flag them — the table's gaps are themselves adopter-friction signal.

## Bigger-picture context (FYI — no action required)

A radical-doubt debate ran this session on whether to ship a fourth init-tier (`--compat`) with NPM-style dependencies. Verdict: **Phase 0 first** — (1) finish `^{}` polish (Bug 6 was the first shipped item of Phase 0), (2) write the translation doc (shipped), (3) ship `scrml vendor add` CLI (queued). Only if Phase 0 attempts-and-fails on adopter evidence does the fourth tier re-open. The user explicitly accepted the verdict ("thrilled to be wrong") — the radical-doubt overturned the pre-debate Option-3 bias.

What this means: scrml is NOT going to ship an npm escape hatch anytime soon. The path for "I need CodeMirror / Monaco / D3" is being cleared via `^{}` polish + docs + vendor tooling. If you hit fresh friction that those three don't address, that's exactly the adopter-evidence signal that would re-open the compat-tier question.

## Asks (low-priority)

1. If you can share the exact `prevStart` source for Bug 3, we can nail down whether it's a scope-capture issue vs a statement-drop.
2. A minimal-repro of Bug 5 (just the `<ol>` + `for-lift` + `@log` mutation, nothing else) would help confirm it's a runtime-subscription issue vs emitter.
3. If you want to switch the CM6 mount to `^{ loadCm() }` now, a thumbs-up or thumbs-down on how clean that path feels post-Bug-6 is useful product feedback.

No rush on any of those.

## State at close

scrmlTS S37 closed with 19 commits (18 pushed, 1 pending wrap). Test suite: 7,393 pass / 40 skip / 2 pre-existing fails / 339 files. Zero regressions across the whole session.

— scrmlTS
