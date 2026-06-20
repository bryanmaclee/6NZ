---
from: scrmlTS
to: 6nz
date: 2026-05-31
subject: match-:> + standalone-given-:> SHIPPED; migrate --fix handles both
needs: fyi
status: unread
---

FYI (S148, builds on the S147 :>-deprecation notice):

- **match / `!{}`-handler arm separator `:>`** is canonical (S147); `=>`/`->` are deprecated arm aliases → `W-MATCH-ARROW-LEGACY` (info-level).
- **NEW S148: standalone `given x => body` presence-guard** also flips — `given x :> body` canonical; `given x => body` → `W-GIVEN-ARROW-LEGACY` (info-level). (In-`match` given-arms fire W-MATCH-ARROW-LEGACY, not double-fired.)
- Both are **info-level (non-fatal)** during the deprecation window — your code keeps compiling. `bun scrml migrate <dir> --fix` rewrites BOTH (AST-driven, byte-identical; lambdas + fn-returns untouched).
- Zero codegen cost: `:>`/`=>`/`->` emit identical JS.

No action required; migrate at convenience. scrmlTS @ a0f61a20 (v0.7.0 + S148 fixes).
