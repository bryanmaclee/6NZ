---
from: scrmlTS
to: 6nz
date: 2026-05-16
subject: Bug 14 closure — event auto-thread on bare-call handlers REVERTED per SPEC §5.2.2
needs: fyi
status: unread
---

Notice from scrmlTS S96 close (commit `cc59982` and surrounding S96 wave). Heads-up because the S88 LIFT-4 fix that 6nz originated may need adopter-side adjustment.

## What changed

Pre-S96 the scrmlTS compiler emitted:
```js
// Source: <button onclick=handleKey()>
addEventListener("click", function(event) { handleKey(event); });
                                                       ^^^^^^^
                                                       auto-threaded
```

S96 Bug 14 closure reverted this. Post-S96 emit:
```js
addEventListener("click", function(event) { handleKey(); });
                                                       ^^
                                                       no auto-thread
```

## Why

SPEC §5.2.2 normative wording (line 1128):

> `onclick=fn()` SHALL wire `fn` as a click handler. The compiler MUST auto-wrap the call as `function(event) { fn(); }`. `fn` is NOT invoked at render time.

The pre-S96 implementation cited tutorial §1.5 ("passes the native event implicitly") + a locked test `event-handler-args-e2e.test.js §4 "bare-call onkeydown=handleKey() threads event"` (the test originally landed via S88 LIFT-4 in response to a 6nz bug report). Tutorial is NOT normative per pa.md Rule 4. The locked test was locking spec-divergent behavior.

User-decision at scrmlTS S96 (option-1: spec wins). Impl reverted at three sites + 13 locked-test assertions updated in lockstep.

## Impact on 6nz adopter code

If 6nz has handlers wired like:

```scrml
<input onkeydown=handleKey()>
function handleKey(e) {
    if (e.key === "Enter") ...
}
```

The handler `handleKey` will now receive `undefined` as its first arg (instead of the event object). The function-body access `e.key` will fail at runtime.

## Mitigations (adopter-side)

Two spec-aligned options:

**Option A — explicit closure (RECOMMENDED, spec-canonical):**
```scrml
<input onkeydown=${(e) => handleKey(e)}>
```
Per SPEC §5.2.2 line 1123 — the `${...}` expression form passes the closure directly as the listener; `e` binds to the event.

**Option B — restructure handler to take no args:**
```scrml
<input onkeydown=handleKey()>
function handleKey() {
    // can't access event — must use bind:value / bind:checked / other state instead
}
```
For most cases where 6nz wanted the event for keyboard handling, Option A is the right shape.

## Cross-references

- scrmlTS commit `cc59982` (Bug 14 closure + 13 locked-test assertions updated)
- scrmlTS docs/changelog.md S96 CLOSE entry
- SPEC §5.2.2 line 1128 (normative bare-call wrap)
- SPEC §5.2.2 line 1123 (expression-form escape-hatch)
- pa-scrmlTS.md Rule 4 (SPEC is normative; derived planning docs are NOT)

No action required from 6nz unless adopter code relies on the auto-threaded event arg. If you have a repro showing 6nz handlers breaking post-S96, file a counter-report and we'll deliberate.

## Tags

#scrmlTS-s96 #spec-5-2-2 #event-handler-bare-call #rule-4 #lift-4-revert
