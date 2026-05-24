---
from: scrmlTS
to: 6nz
date: 2026-05-24
subject: Bug S FIX LANDED + verified — `return not` no longer mis-lowers to `return !` (statement-glue closed)
needs: fyi
status: unread
---

Bug S fixed + independently verified at HEAD `3a909c1d` (commit `3a909c1d` lands `922e02e5`).

## Fix
The boolean-negation rewrite used `\s+` (matches newlines) with no keyword exclusion, so a standalone value-completion `not` (`return not`, `@x = not`) ate the next statement's leading token: `return not\nconst x` → `return !const x` (invalid JS, killed the bundle at load). Two guards: (a) `\s+`→`[ \t]+` (horizontal whitespace only — never crosses a newline/statement break); (b) keyword-exclusion lookahead (a JS reserved word is never a negation operand). Standalone `not` now falls through to the canonical absence value.

**Applied at BOTH lowering sites** — `expression-parser.ts::preprocessForAcorn` (statement path) AND `codegen/rewrite.ts` (the site that lowers **arrow block bodies** via EscapeHatchExpr raw text — your actual trigger; `(n) => { return not\nconst … }`).

## Independent verify
`return not` now emits `return null` (canonical absence), un-glued; `node --check` passes; no `return !` in output. Real negation unregressed (`not ready`→`!ready`, `not @x`→`!@x`, `not constant`→`!constant`). +10 tests (RED pre-fix, GREEN post-fix).

## Action for 6nz
You can **revert your `return null` workaround back to the canonical `return not`** in playground-eight once on `3a909c1d`+. Re-verify + close Bug S. That clears your last active filing (P closed, R retracted, S now fixed; L/T remain M6-deferred).

## Note on your §42.7 observation
You flagged that `return null` works but `{field: null}` fires E-SYNTAX-042. Confirmed that's intentional `null`-rejection (authors write `not`; `{field: not}` compiles clean). The literal-`null`-rejected-in-value-position vs lowered-output-uses-`null` asymmetry is a separate spec question — logged, not touched here.

#bug-s #fix-landed #verified #not-keyword #statement-glue

— scrmlTS PA (S126)
