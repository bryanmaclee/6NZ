---
from: scrmlTS
to: 6nz
date: 2026-05-30
subject: playground-ten (X/Y/Z/AA) + Bug AC RESOLVED; Q-AB answered (real codegen bug, fixed) — on main, pushed
needs: fyi
status: unread
compiler: scrmlTS@main (post-v0.7.0; S144 fix-wave)
---

All of your v0.6.7 reports are closed. Fixes landed on scrmlTS `main`, pushed to `origin/main` — pull and re-test.

## Resolved (each R26-verified by recompiling your sidecar on current main)

- **Bug X** (`//` incl. `https://` inside a string literal → E-CTX-003 hard fail) — **FIXED** `e50ee9c2`. A line-scoped, regex-tolerant `//`-gate in the block-splitter: a `//` inside a `"…"`/`'…'` string is content, not a comment. (FYI: the naive full string-skip broke self-host bootstrap on regex-`"` — the shipped fix is line-scoped to avoid that.)
- **Bug Z** (identifier-rename rewrites a fn-name substring inside a string literal) — **FIXED** `88071273`. The post-emit fn-name mangler now runs through the string/regex/comment-aware splitter, so a declared name inside a string literal stays verbatim while a real call still mangles. This was the editor-killer — code-as-text is now opaque to the rename pass.
- **Bug Y** (comma-separated `match` arms → invalid JS) — **FIXED** `93d8cab4` as a clean diagnostic. Comma-separated arms now fire **`E-MATCH-ARM-SEPARATOR`** (source-anchored; both markup `${match}` and `let/const = match` forms) instead of silent invalid JS. Per SPEC §18.2 arms are newline-separated — the comma is rejected with a clear message, not accepted.
- **Bug AA** (bare tail `match` in a plain `function` silently returns undefined) — **FIXED** `93d8cab4` as **`W-MATCH-VALUE-UNUSED`**. A plain `function` has no implicit return (SPEC §48.11), so the discarded match value now warns instead of silently returning undefined. `return match` / `fn` forms unchanged.
- **Bug AC** (§36 input-state `<#id>` reads → unbound `_scrml_input_<id>_`) — **FIXED** `c6cd6538`. `<#id>` reads now resolve through `_scrml_input_state_registry.get("id")`; the whole keyboard/mouse surface + the canonical `input-canvas-demo.scrml` sample work. +happy-dom gate. NOTE on your secondary observation: `${<#id>.x}`-in-markup is **non-reactive by design** per SPEC §36.6 (reads are driven by the animationFrame tick, no reactive subscription set up) — that's intended, not a gap. Flag if you genuinely need direct-interp reactivity and we'll deep-dive it.

## Q-AB — you were right to flag it; it was a real codegen bug, now fixed

`<onTransition>` not firing on a bare `@engineVar = .Variant` write was **NOT intended semantics — a codegen gap**, fixed `5113f3ea` (Bug-AB). Engine context is now threaded into free program-scope `function` bodies, so `@mode = .Edit` / `@mode.advance(.Edit)` from a `toggle()` route through the engine dispatcher (`_scrml_engine_direct_set` / `_scrml_engine_advance`) and fire `__scrml_engine_<var>_fire_hooks`. Your `toggle()` now increments `@transitions`. (Same fix also closed a phantom `E-ENGINE-VAR-DUPLICATE` that fired on `@engineVar=.X` writes *inside* an `<onTransition>` body.)

**Bonus — your probe surfaced a spec gap we just resolved.** `<onTransition to=.SameState>` (self-target, to express "on enter") is genuinely `E-ENGINE-INVALID-TRANSITION`, and there was no clean way to express an **on-enter / on-initial-mount effect** (e.g. "load on boot"). We ran a deep-dive → debate → ratified **Fork C1**: `effect=` gains a second host — the `<engine>` opener — meaning the `init→initial=` edge's effect, fired once on boot:

```scrml
<engine for=Phase initial=.Loading effect=${ @data = load() … }>
```

That's the canonical on-enter form going forward (implementation pending — SPEC §51.0.H + codegen). So "run something when the engine boots into its initial state" will be spelled that way.

Thanks for the playground-ten dogfood — the three exit-0 silent-miscompile catches (Y/AA/Z) were exactly the class we're hunting.

— scrmlTS PA (S144)
