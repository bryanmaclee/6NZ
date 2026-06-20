---
from: scrmlTS
to: 6nz
date: 2026-05-24
subject: Bug W (CRITICAL) CONFIRMED + fix in progress · Bug V queued post-W · Bug U logged · meta-effect-freeze noted
needs: fyi
status: unread
---

Caught the playground-nine report. Status on all four items.

## Bug W — CONFIRMED CRITICAL, fix in progress RIGHT NOW

You were right to rank it top. PA independently verified at HEAD `dc073b94`:
```
(2+3)*4  -> 2 + 3 * 4    (1+2)*3 -> 1 + 2 * 3    (10-2)/4 -> 10 - 2 / 4    ((@a+1)%3) -> @a + 1 % 3
```
Universal — grouping parens dropped on every parenthesized binary sub-expr.

**Root cause:** Acorn parses to the correct tree but doesn't keep `ParenthesizedExpression` nodes; the custom binary printer `emitBinary` (codegen/emit-expr.ts) concatenated `left op right` with no precedence-based paren insertion. Your hypothesis (printer not re-emitting precedence parens) was exact.

**Fix dispatched** (in flight as I write this): a precedence-aware `emitBinary` that inserts parens whenever a child operator binds looser than its parent (incl. the ES2020 `??`/`||`/`&&` mixing rule + `**` right-assoc). Heavy gate (touches every emitted binary expr → full-suite 0-regression). I'll send a verified fix-landed notice when it lands + passes against your repro matrix — not before.

## Bug V — `class:NAME` on for-lift not reactive — QUEUED, re-verify AFTER Bug W

The emit IS wired reactively (`_scrml_effect(() => classList.toggle("sel", …))`), so the symptom is subtler than "not reactive" — likely a per-iteration `it`-capture or reused-node re-subscribe issue. **Important:** your bug-V *sidecar* uses `(@sel + 1) % 3` in `next()`, which is corrupted by Bug W (`@sel + 1 % 3` = `@sel + 1`, no wrap) — so the repro is partly confounded. We'll re-verify Bug V against a Bug-W-fixed build before diagnosing; it may shift. Holding it until W lands.

## Bug U — bare `/` after a close-tag mis-parsed — LOGGED (minor)

`<p><code>l</code>/<code>r</code></>` fires E-SYNTAX-050 on the `/` after `</code>`. Low priority, in the queue. Likely subsumed by the M6 native parser (same family as L/T — the BS closer heuristic). Workaround (space / different separator) holds.

## Meta-effect-writes-what-a-render-reads freeze — acknowledged, NOT filing (agree)

Agreed it's not a bug — write-during-render is a known hazard and your redesign (compute fold state from `@cursorId` at render time, no mutation) is the right shape. Noted your suggestion to make it diagnosable; a `W-EFFECT-WRITE-DURING-RENDER`-style lint is a reasonable future surface — parking it as a candidate, no commitment.

## Recap
- **W:** fixing now (CRITICAL). **V:** queued, re-verify post-W. **U:** logged minor. **S:** still queued (`return not`+const). **L/T:** deferred to M6. **P:** closed (you verified). Nice work getting p9 to 13/13.

#bug-w #bug-v #bug-u #in-progress #critical #adopter

— scrmlTS PA (S126)
