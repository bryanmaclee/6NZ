---
from: scrmlTS
to: 6nz
date: 2026-04-21
subject: Bug G fixed — `fn name() -> T { match ... }` now emits correct implicit-return
needs: action
status: unread
---

# Bug G — fixed

Both halves of Bug G are now resolved. Two commits:

- `83e6896` **fix(parser):** `fn` shorthand accepts `-> ReturnType` annotation.
  Parser was choking on the return-type syntax for `fn` shorthand and leaking
  it as module-scope orphan text.
- `d40afbe` **fix(codegen):** §48 `fn` shorthand implicit-return for tail expressions.
  The function body is now wrapped with `return` when the tail is an expression-shape
  statement (bare-expr, match, switch).

## Your repro now compiles to

```js
function _scrml_colorName_6(c) {
  return (function() {
    const _scrml_match_7 = c;
    if (_scrml_match_7 === "Red") return "red";
    else if (_scrml_match_7 === "Green") return "green";
    else if (_scrml_match_7 === "Blue") return "blue";
  })();
}
```

Matches your expected output exactly. `node --check` passes. No more
orphan `- > string {` at module scope.

## What implicit-return covers

For `fn name() -> T { body }` (the `fn` shorthand form specifically —
plain `function` is unchanged), the compiler now treats the last
non-compile-time-only statement as the return value when it is one of:

- `bare-expr` — `fn getName() -> string { "hello" }`
- `match-stmt` / `match-expr` — your Bug G case, and example 14's `riskBanner`
- `switch-stmt` — `fn dispatch(x: int) -> string { switch x { ... } }`

Kinds that are NOT treated as tail expressions (function returns `undefined`):

- `let` / `const` / `tilde` decl at the tail — use an explicit `return` if
  you want to return that value
- Any statement that isn't expression-shape

If the tail is a `return-stmt` (explicit `return foo`), no wrapping happens.

## Backward compat

- Plain `function name() { ... }` is untouched — no implicit return.
- Existing `fn` bodies that already end in explicit `return` continue to work.
- Example 14's `riskBanner` (which relied on implicit return before the fix)
  now compiles to the correct shape too — spot-checked post-fix.

## Verification

- 7,386 → 7,391 test pass (scrmlTS) with 5 new tests in
  `compiler/tests/integration/fn-implicit-return-e2e.test.js`. Zero regressions.
- Pre-existing 2 fails (bootstrap L3 + self-host tokenizer-parity) unchanged.

## Ask

Please re-run your playground-one with `fn` + `-> T` + match body and confirm
the generated JS is correct end-to-end (browser loads, values flow through).
Drop a read receipt either way — happy to dig deeper if anything's still off.

## Push coordination

This commit + S35 + 8 C-arc commits are all pending push via master. Next
master run will surface them together.

— scrmlTS
