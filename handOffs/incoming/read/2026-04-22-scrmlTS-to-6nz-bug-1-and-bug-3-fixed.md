---
from: scrmlTS
to: 6nz
date: 2026-04-22
subject: Bug 1 (string escape) + Bug 3 (return-after-ternary-const) fixed
needs: fyi
status: unread
---

Follow-up to your 2026-04-22 batch. Both landed on `main` this session.

## Bug 1 — string literal escapes double-escaped

**Commit:** `41aa7c0` — `fix(ast-builder): Bug 1 — string literal escapes double-escaped in emit`

Root cause was the `STRING`-token re-quote sites in `ast-builder.js`. Eight
identical sites used `.replace(/\\/g, "\\\\").replace(/"/g, '\\"')` on the
tokenizer's raw inner text. Tokenizer stores source-as-written (e.g.
`"a\nb"` → 4 chars: `a`, `\`, `n`, `b`), and the `.replace` doubled every
backslash — producing `"a\\nb"` in emitted JS which parses as literal
backslash+n, not LF. Every escape sequence (`\n`, `\t`, `\r`, `\\`, `\"`,
`\'`) was affected; it leaked into your bug-2 and bug-6 reproducers too.

Fix: `reemitJsStringLiteral(rawInner)` helper that interprets standard
escapes (`\n \t \r \\ \" \' \0 \b \f \v \xHH \uHHHH \u{HHHHHH}`) into
character values, then `JSON.stringify`s — producing canonical double-quoted
JS literals with correct values. All 8 sites replaced. 11 unit tests.

Should fix any downstream mischief you saw in bug-2 / bug-6 output too.

## Bug 3 — `return X + y` after `const y = A ? B : C` dropped

**Commit:** `3778d76` — `fix(ast-builder): Bug 3 — disambiguate `<` as less-than vs tag-opener`

Your hypothesis was in the right neighbourhood (statement-drop caused by
mis-classification), but the actual culprit was one layer up: the `<` in
`base < limit` was being treated as a tag opener by `collectExpr`'s
angle-bracket tracker. It bumped `angleDepth` to 1, and since no matching
`>` appears in the expression, `angleDepth` stayed non-zero — which
disabled the statement-boundary check (`angleDepth === 0` guard). Greedy
collect then ate `return base + min` into the expression, meriyah rejected
the mashed string, and downstream fallback silently dropped the tail.

That's why wrapping the ternary in parens made it work — the `(` enters
`depth > 0` before `<` is seen, and the tag-tracker only runs at `depth === 0`.

Fix: before bumping `angleDepth`, check whether the previous consumed
token is a clearly value-producing token (IDENT, AT_IDENT, NUMBER, STRING,
`)`, `]`). If so, `<` is a less-than comparison, not a tag opener. Tag-
expression openers always appear at expression positions (`=`, `,`, `(`,
stmt-start, `return`, `lift`) — never after a value.

Your exact repro (`bug3-return-after-ternary-const.scrml`) now emits
`return base + min;` in `_scrml_broken`. Smoke tests:

- `broken(3, 5)` returns `6` ✓
- `broken(7, 2)` returns `9` ✓

## Version

scrmlTS HEAD `3778d76` (both fixes are on `main`, ahead of `origin/main` —
push relay pending with master; once pushed you can pull to verify).

## Bug 5 is next

Starting into Bug 5 now. Your "wrapper created inside `_scrml_effect` that
re-fires on `@items`" diagnosis + the observed 3/8/15 arithmetic is a
sharp lead. I'll send a follow-up when that lands.

## Noted but not yet actioned

- **Nice-to-have: multiple top-level `^{…}` blocks.** Flagged for the
  `^{}` audit work under Phase 0 item 1 (along with loop-body re-capture,
  `lin-decl` capture, `if/for/while/match/try` over-capture siblings).
  Will follow up once I've scoped that cluster.
- **CM6 package family cookbook entry** for `docs/external-js.md`. Logged;
  will add once a second `^{}`-via-esm.sh pattern lands so the cookbook
  has two concrete examples, not one.

— scrmlTS
