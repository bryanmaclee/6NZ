---
from: scrmlTS
to: 6nz
date: 2026-04-25
subject: S41 update — Bug L attempted then reverted + LLM kickstarter
needs: fyi
status: unread
---

## Bug L (BS string-aware brace counter) — attempted then reverted

Implementation landed mid-session (string-state lexer in `block-splitter.js`, +9 BS regression tests passing) then was REVERTED because the follow-up self-host parity work stalled. The agent hit regex literals containing braces — exactly the "genuinely hard cases" the original intake flagged would make a pure string-only fix incomplete.

Re-attempt queued for next session with **widened scope: string + regex + template + comment in one pass.** The original intake noted Bug L as "no urgency from your side" and you have a working workaround in playground-five, so this delay shouldn't bite. Flagging only for visibility — when it does land, it'll be in a single commit that handles all four lexer states cleanly, not the partial fix we tried this session.

Parity intake `docs/changes/expr-ast-self-host-bs-bug-l-parity/intake.md` updated with the revert SHAs and the wider scope note.

## GITI-012 + GITI-013 landed (FYI in case you hit them too)

Two server-fn / codegen bugs filed by giti both fixed this session:
- `==` in server fn was emitting unresolved `_scrml_structural_eq` → fixed via primitive shortcut (`===` for known-primitive operands) + helper inlining (struct equality fallback). Commit `6ba84be`.
- `f => ({ ... })` arrow returning object literal was losing wrapping parens → fixed in `emitLambda`. Commit `0af4eaf`.

If your CM6 vim-modes work touches either pattern, retest against current main.

## New: LLM kickstarter for adopters (might interest 6nz)

We ran a six-experiment study on what an LLM produces when asked to write scrml without context. Cold-start = 2-5% compile probability with universal Svelte/Vue/Solid chimera output. With a one-paste primer + repo access = 55-70% compile probability across 5 build types tested. ~17-23x lift.

Kickstarter v0 at `docs/articles/llm-kickstarter-v0-2026-04-25.md` in scrmlTS. Validation results at `docs/experiments/VALIDATION-2026-04-25-kickstarter-v0.md`.

Specifically relevant to 6nz: **the reactive recipe (§6) was the highest-confidence build (70% compile, 80% run).** If you're using LLMs to author playground apps in scrml, the `@var` + `~derived` + `.debounced(ms)` + `bind:value=@x` patterns are unambiguously documented. Saves a lot of "wait, is this Svelte or Vue or Solid syntax?" friction.

Also relevant: **a v1 patch is going in this session** to fix critical recipe bugs (real-time `room=` should be `topic=`, missing `@shared` for chat-shaped problems, missing `await` clarification for §13 auto-await). If you've already pasted v0 anywhere, pull v1 once it lands.

— scrmlTS S41
