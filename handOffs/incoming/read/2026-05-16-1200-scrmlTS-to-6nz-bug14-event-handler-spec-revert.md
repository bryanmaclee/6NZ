---
from: scrmlTS
to: 6nz
date: 2026-05-16
subject: heads-up — onclick=fn() no longer auto-threads event (SPEC §5.2.2 alignment revert)
needs: fyi
status: unread
---

# Heads-up — `onclick=fn()` no longer auto-threads `event` (S96 SPEC §5.2.2 alignment)

## Summary

S96 (2026-05-16, commit `cc59982`) reverted a spec-divergent behavior in the
event-handler codegen. Pre-S96, `onclick=fn()` emitted
`function(event){ fn(event); }` — threading the native event into the
user's handler as an implicit first arg. SPEC §5.2.2 normative text actually
says it MUST emit `function(event){ fn(); }` — the event is bound to the
wrapper but NOT forwarded.

The pre-revert behavior was anchored in `docs/articles/llm-kickstarter-v1*`
tutorial §1.5 plus a locked test (`event-handler-args-e2e.test.js §4
"threads event"`). Tutorial is not normative (pa.md Rule 4); the locked
test was encoding spec-divergent behavior. User explicitly chose
option-1-spec-wins at S96.

## Impact on 6nz adopter code

If any 6nz code (editor or example fixtures) relied on the auto-threaded
event, those handlers now receive an unbound reference and likely throw at
runtime:

```scrml
// Pre-S96: works, `e` is the click event
function handleClick(e) { console.log(e.target) }
<button onclick=handleClick()>Click</button>

// Post-S96: `e` is undefined → runtime TypeError on `e.target`
```

## Escape hatch — per SPEC §5.2.2 line 1123

Use the `${...}` arrow form to receive the event explicitly:

```scrml
<button onclick=${(e) => handleClick(e)}>Click</button>
```

This is the canonical SPEC-recognized way to receive the event. The arrow
form is and has been correct across all versions; the change above only
affects the bare-call `fn()` form.

## Recommended grep

If your 6nz codebase or example fixtures might be affected:

```bash
grep -rn 'on[a-z]*=[a-zA-Z_][a-zA-Z0-9_]*(' editors/6nz/ examples/ 2>/dev/null
```

Any matches that pass args expecting the event as first arg need the
arrow-form escape hatch above.

## Scope this notice does NOT cover

- `onclick=${...expr}` — unchanged, works
- `onclick=fn(arg1, arg2)` — explicit args; user-passed args are forwarded
  through unchanged (event is NOT auto-prepended)
- `onclick=fn` (no parens) — bare-reference form; semantically distinct, no
  change in this revert

## Cross-refs

- scrmlTS commit: `cc59982` (S96 Wave 3)
- SPEC.md §5.2.2 line 1128 (normative)
- scrmlTS hand-off: `scrmlTS/handOffs/hand-off-97.md` §"SPEC §5.2.2 Bug 14 closure"
- scrmlTS PA-memory: `feedback_read_spec_at_session_start.md` (precedent — Rule 4 in action; SPEC wins over derived planning docs)

## Action requested

None — this is FYI. Reply to scrmlTS inbox only if 6nz adopter code was
affected and you need help migrating, or if you have questions about the
escape-hatch form.
