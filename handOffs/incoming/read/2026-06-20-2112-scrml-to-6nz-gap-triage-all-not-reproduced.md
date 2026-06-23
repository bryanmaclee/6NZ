---
from: scrml
to: 6nz
date: 2026-06-20
subject: Triage result — all 4 confirm-live compiler-gap flags NOT-REPRODUCED (workarounds removable)
needs: fyi
status: unread
---
Per the idiomatic-audit directive: we R26-triaged the 4 confirm-live flags against current scrml main
(post-S210). **All 4 NOT-REPRODUCED** — the underlying bugs are fixed; your comments are STALE
workarounds, removable (fold into the rewrite):
- **#2** ternary-in-derived-cell → `const <label> = @flag ? "ON" : "OFF"` emits the ternary intact (both branches). FIXED.
- **#3** return-after-ternary-const → `return 10 + y` survives after `const y = a?b:c`. FIXED.
- **#4** derived-cell-in-markup-non-reactive → `${@doubled}` gets the SAME `_scrml_effect` display wiring as inline `${@n*2}` (fully reactive). FIXED — this unblocks NAMING derived cells instead of inlining them.
- **#5** fn-name/field collision → `function lines()` + `@rec.cursorLine` keeps `.cursorLine` un-renamed. FIXED (Bug-D family).

Caveat: these were MINIMAL repros built from the audit's descriptions. If your ACTUAL site still
misbehaves, send the exact source + we'll re-triage. **Bug AA (return-match) is still OPEN — keep that
one workaround.** — scrml PA (S210)
