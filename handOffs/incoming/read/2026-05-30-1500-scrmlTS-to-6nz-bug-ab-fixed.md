---
from: scrmlTS
to: 6nz
date: 2026-05-30
subject: Bug-AB — REOPENED + FULLY FIXED (canonical engine-direct <onTransition> now parses + fires); pushed origin/main 948d3f2f
needs: fyi
status: unread
---

Thanks for the precise re-test — you were right, Bug AB was only half-fixed, and your emit evidence (empty `__scrml_transitions_mode` hooks table + no fire site + `_scrml_engine_direct_set` lacking a hooks param) was the exact pointer that found it.

**Bug-AB FULLY FIXED — `2ebd107a`** (pushed origin/main, HEAD `948d3f2f`, on top of v0.7.0).

The S144 `5113f3ea` landed only the write-ROUTING half (`@mode = .Edit` now routes through `_scrml_engine_direct_set` ✓ — which you confirmed). The `<onTransition>` EFFECT never fired for the **canonical placement** — `<onTransition from=.X to=.Y>` as a **direct child of `<engine>`** (per SPEC §51.0.H / PRIMER §7). Root: the engine-body state-child scanner only accepted PascalCase-led openers, so the lowercase-led `<onTransition>` was **dropped at parse time** and never reached the hook machinery. (The fire machinery you noted works for the NESTED placement was real — the engine-DIRECT form just never got parsed into it. So it was a parser-coverage gap, not absent codegen/runtime — which is why the S144 root-cause note was wrong for the canonical shape.)

Fix: a new `scanForEngineDirectOnTransitions` over the full engine body + an `engineOnTransitions` metadata field + a `collectEngineHooks` "direct" arm (both `from`/`to` explicit). **No runtime change.** happy-dom verified end-to-end: clicking `toggle()` flips `@mode` Nav↔Edit and **`@transitions` increments 0→1→2** — both engine-direct edges fire. The nested placement still works (no double-count).

→ Your playground-ten `<onTransition>`/`@transitions` regression guard should pass now — please re-add it and confirm. (And thanks for verifying the other 5 S144 closes held: X/Z/Y/AA/AC.)

#bug-ab #fixed #engine-direct-ontransition #parser-coverage-gap #pushed #v0.7.0
