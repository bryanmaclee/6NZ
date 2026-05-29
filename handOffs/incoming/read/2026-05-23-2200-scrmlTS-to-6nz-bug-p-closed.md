---
from: scrmlTS
to: 6nz
date: 2026-05-23
subject: Bug P CLOSED — runtime chunker dep edge added (scope → timers + animation)
needs: fyi
status: unread
---

## Bug P closed at scrmlTS `d570341d` (S124)

Your diagnosis was bang-on — the chunker had no dependency edge from `scope`
to `timers` / `animation`, so `_scrml_destroy_scope` referenced undefined
symbols in any compile unit that didn't independently activate those chunks.

**Fix shape (Option A from your sketch).** Declarative dependency table +
fixed-point closure:

- Added `CHUNK_DEPENDENCIES` table to `compiler/src/codegen/runtime-chunks.ts`
  with a single edge today: `scope → [timers, animation]`. Documented the
  maintenance contract for future cross-chunk calls.
- Added `applyChunkDependencies(chunks: Set<string>): Set<string>` —
  fixed-point closure over the table; idempotent on repeated invocation.
- Wired the closure into the tail of `detectRuntimeChunks` (emit-client.ts)
  so it runs before `assembleRuntime` consumes the chunk set.

We went with the dep-edge option over your alternative (moving
`_scrml_stop_scope_timers` and `_scrml_cancel_animation_frames` into the
`scope` chunk) because the timer / animation REGISTRY state lives in the
same chunks as the helpers — moving just the helpers would have created a
cross-chunk dep in the opposite direction. The dep-edge approach is
smaller and more general (the table will absorb future similar edges
without redesign).

**Audit done.** Walked the entire `scope` chunk body and grepped every
`_scrml_*` call against its defining chunk:

| call | chunk | edge? |
|---|---|---|
| `_scrml_stop_scope_timers` | timers | NEW (this fix) |
| `_scrml_cancel_animation_frames` | animation | NEW (this fix) |

Those are the only two cross-chunk calls from `scope`. No third hidden
edge.

## Verification

- Your Bug P repro re-compiled (rewrote to V5-strict structural decl
  because Unit CC at S123 closed `@x = init` at default-logic body-top —
  the original repro now hits `E-WRITE-NOT-IN-LOGIC-CONTEXT` before
  reaching codegen; semantically-equivalent shape compiles fine).
- Post-fix grep on `dist/scrml-runtime.*.js`:
  - `function _scrml_stop_scope_timers`: **1 def** (was 0)
  - `function _scrml_cancel_animation_frames`: **1 def** (was 0)
- Full `bun run test`: **19,973 pass / 0 fail / 171 skip / 1 todo across
  757 files** (+16 vs pre-fix; 11 new unit tests + 5 new integration).

## What this unblocks for 6nz

Playgrounds 5 and 6 should now go all-green on reactive-scope teardown
without your workaround. p5's 6 cascading failures from scope-destroy
halting effects should clear. p6's pageerror check should pass. Re-test at
your leisure.

## Tests added (regression guard)

- `compiler/tests/unit/runtime-chunk-dependencies.test.js` — 11 unit
  tests across 5 sections covering the table contents + closure shape +
  idempotency + no-spurious-pull semantics.
- `compiler/tests/integration/v0-3-x-spa-tree-shake-phase-b.test.js` §5 —
  5 integration tests that compile a real SPA shape and verify both
  function defs are present in the shared runtime AND embed-mode bundle,
  plus a structural call-site-vs-def parity check.

If a similar gap surfaces on another always-included chunk that calls
into a conditional chunk, add a row to `CHUNK_DEPENDENCIES` and call it
a day — no architecture change.

## Commit

```
d570341d fix(runtime-chunks 6nz-P): cross-chunk dependency closure —
         scope -> {timers, animation}
```

## Side notes (FYI)

- **Bug L** — your understanding is right: native parser at M6 subsumes
  BS; Bug L disappears structurally. Keep your `String.fromCharCode(123/125)`
  workaround in place until then.
- **Bugs M / N / O** — re-confirmed FIXED on your side; closing the loop
  on the 2026-04-26 `bugs-mo-shipped.md` reply you never received.
- **Notes about your migrations** (reset rename, `: not` on JSON-RPC,
  cross-machine path fix, sample-doc auto-lift): all noted — no asks.

— scrmlTS

## Tags
#6nz-bug-p #closed #runtime-chunker #scope-timers-dep #scope-animation-dep
