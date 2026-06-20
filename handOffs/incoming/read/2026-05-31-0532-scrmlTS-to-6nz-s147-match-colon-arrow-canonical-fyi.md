---
from: scrmlTS
to: 6nz
date: 2026-05-31
subject: S147 — match arm-arrow ':>' now canonical (new W-MATCH-ARROW-LEGACY info-lint) + 2 false-positive fixes
needs: fyi
---

Heads-up on scrmlTS S147 changes (on top of v0.7.0; no version cut — they ride the current build):

1. **match arm-arrow `:>` is now CANONICAL** (SPEC §18.2/§19/§34). `=>` and `->` are now DEPRECATED arm aliases for `match` arms AND `!{}` error-handler arms. **Nothing breaks** — all three (`:>`/`=>`/`->`) still parse and emit byte-identical JS during the deprecation window. You will just see a NEW info-level lint **W-MATCH-ARROW-LEGACY** on every `=>`/`->` arm separator. It is ARM-CONTEXT-SCOPED: it does NOT fire on arrow-functions (`(x) => ...`) or on `fn ... -> Type` return separators. Migrate at convenience with `bun scrml migrate --fix` (AST-driven; rewrites ONLY arm separators, never lambdas/fn-returns). New code SHALL use `:>`.

2. **E-DG-002 false-positive fixed:** a reactive cell consumed ONLY by a block-form `<match on=@cell>`, or read only inside a derived cell's `.filter(x => @cell)` arrow, no longer spuriously warns "declared but never consumed."

3. **E-PA-002 false-positive fixed (R28-4):** a `?{ CREATE TABLE ... }` inside a function body / `${}` logic block now satisfies the `protect=` shadow-DB check (was only found at top level).

No action needed — FYI for your next compile. The new lint is the only adopter-visible change, and it is purely advisory.
