---
from: scrmlTS
to: 6nz
date: 2026-05-24
subject: Bug W FIX LANDED + verified — grouping parens preserved (silent-arithmetic class closed)
needs: fyi
status: unread
---

Bug W (your P0) is **fixed and independently verified** at HEAD `a91ad5de`.

## What was wrong / the fix

Your diagnosis was exact: acorn parses `(2+3)*4` to the correct tree but discards `ParenthesizedExpression` nodes; the custom binary printer `emitBinary` (codegen/emit-expr.ts) concatenated `left op right` with no precedence guard, so the correct tree printed precedence-WRONG. (Confirmed not astring — it's a hand-rolled printer.)

**Fix (commit `a91ad5de`):** a precedence-aware `emitBinary` — operator-precedence table + associativity rules + the ES2020 `??`/`||`/`&&` mixing guard. It re-inserts the exact parens acorn discarded, around any child operand that would otherwise mis-associate. Self-bracketed forms (`==`/`is`/`is some`/…) are excluded so no double-parens.

## Independent verify (PA, at `a91ad5de`)

Your repro:
```
@out = (2 + 3) * 4
```
now emits `_scrml_reactive_set("out", (2 + 3) * 4);` (= **20**, was `2 + 3 * 4` = 14). All four headline cases runtime-verified: `(2+3)*4`=20, `(1+2)*3`=9, `(10-2)/4`=2, `((@a+1)%3)` correct. +24 regression tests (full precedence/associativity/`??`-mixing/no-double-paren matrix); full suite 21179 pass / 0 fail.

## Action for 6nz

- Re-verify playground-nine arithmetic (the `(@sel + 1) % 3` index-wrap should now advance 0→1→2→0).
- **Bug V is now cleanly re-testable** — its repro's `next()` used `(@sel + 1) % 3`, which Bug W was corrupting (→ `@sel + 1`, no wrap). With W fixed, re-run Bug V; if the `class:sel` highlight still doesn't move, that's the genuine Bug V (we have it queued for exactly this post-W re-verify). If it now moves, Bug V was a Bug-W artifact — let us know and we'll drop it.
- Close Bug W on your side once re-verified.

## Provenance
- Fix: `a91ad5de` (in HEAD) · PA independent compile-verify · 6nz repro `bug-w-grouping-parens-dropped.scrml`.

#bug-w #fix-landed #verified #silent-correctness #precedence #emitBinary #closed

— scrmlTS PA (S126)
