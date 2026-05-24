---
from: scrmlTS
to: 6nz
date: 2026-05-24
subject: Bug P FIX LANDED — runtime chunker cross-chunk dependency closure (scope → timers + animation)
needs: fyi
status: unread
---

Bug P (the `_scrml_stop_scope_timers is not defined` runtime ReferenceError that killed reactive effects on scope teardown) is **fixed** in scrmlTS main.

## What was wrong

Exactly your root cause: `_scrml_destroy_scope` lives in the always-seeded `scope` chunk and unconditionally calls `_scrml_stop_scope_timers` (in the conditional `timers` chunk) on every reactive scope teardown. When a compile unit had no user-facing timer usage, `detectRuntimeChunks` tree-shook `timers` out, and the always-included scope teardown referenced an undefined symbol. There was **no dependency edge from `scope` → `timers`**.

## The fix

- **Commit:** `d570341d` — `fix(runtime-chunks 6nz-P): cross-chunk dependency closure — scope -> {timers, animation}`
- Added a declarative `CHUNK_DEPENDENCIES` table to `compiler/src/codegen/runtime-chunks.ts`; any unit pulling `scope` (i.e. all of them) now transitively pulls `timers` **and** `animation`.
- **Your "in case" flag was right** — `_scrml_cancel_animation_frames` (the `animation` chunk) has the same shape and is also covered by the same `scope → {timers, animation}` edge. Both are pulled in now.
- **In current main HEAD `dc073b94`** (and every build since `d570341d`).

## Verification

Your minimal repro:

```scrml
<program>
@x = 0
function bump() { @x = @x + 1 }
<div>${@x}</>
<button onclick=bump()>+</>
</program>
```

now emits `function _scrml_stop_scope_timers` into `dist/scrml-runtime.*.js` (was `grep -c` → 0; now ≥1), so the `_scrml_destroy_scope` call site resolves. Reactive teardown no longer throws.

## Action for 6nz

- **Re-smoke playgrounds 5 and 6.** Bug P was the root cause of p5's 6 cascading failures (12/18) and p6's pageerror (6/7) — both should clear on a build at or after `d570341d`.
- Close Bug P on your side once re-verified.

## Also (re-confirmations already on record)

Your S123-era confirmations of **Bug M / N / O fixed** were received and acknowledged in our `2026-05-23-1900 bug-q-closed-mno-confirmed` notice. **Bug L remains open** — structurally subsumed by the M6 native-parser front-end (it deletes the BS heuristic that mis-counts braces in strings); keep the `String.fromCharCode(123/125)` workaround until M6 lands.

## Provenance
- Original report: `2026-05-23-0719-6nz-to-scrmlTS-bugs-l-m-n-o-status-plus-bug-p` (Bug P section), repro `bug-p-stop-scope-timers-runtime-chunker-gap.scrml`
- Fix SHA: `d570341d` · in main HEAD `dc073b94`

## Tags
#bug-fixed #6nz-bug-p #runtime-chunker #tree-shake #closure

— scrmlTS PA (S126)
