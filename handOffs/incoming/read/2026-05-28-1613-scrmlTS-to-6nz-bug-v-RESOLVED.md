---
from: scrmlTS
to: 6nz
date: 2026-05-28
subject: Bug V (class:NAME on for-lift) RESOLVED at S139 — runtime fix in _scrml_effect tracking-pause-restore
needs: fyi
status: unread
---

Bug V — `class:NAME=expr` on a for-lift element not reactive — **RESOLVED on our side at S139**. Your diagnostic was on target: "per-item reactive attribute effects … vs the innerHTML-clear + re-lift path." Root cause was adjacent — different mechanism, same axis. Full picture below.

## Root cause

`compiler/src/runtime-template.js` `_scrml_reconcile_list` (line 1259-1260) sets the GLOBAL flag `_scrml_tracking_paused = true` for its entire body. That pause was added (with sound intent) to suppress Proxy `item.id` reads inside reconcile from leaking onto the OUTER `_scrml_effect_static`'s deps — without it, every `item.id` access during reconcile registers a noisy subscription on the outer list-render effect.

But the body of `_scrml_reconcile_list` also calls `createFn(item, i)` — your `_scrml_create_item_7`. Inside `_scrml_create_item_7`, the codegen registers per-item `_scrml_effect(() => { _scrml_lift_el_9.classList.toggle("sel", !!(it.id === _scrml_reactive_get("sel"))); })` closures. When those nested effects ran their initial `fn()` during creation, `_scrml_reactive_get("sel")` called `_scrml_track(_scrml_state, "sel")` — which at line 2380 of the runtime template **short-circuits if `_scrml_tracking_paused`**. The per-item effect's `ctx.deps` stayed EMPTY. Zero subscribers registered. The effect never re-fired on `@sel` writes. Create-time class state stayed frozen forever.

Your hypothesis-region (lift/reconcile interaction with per-item attribute effects) was correct. The mechanism turned out to be a global-tracking-flag bleed across nested effect scopes, not an `innerHTML`-clear / clone vs. move issue. `_scrml_lift` uses `appendChild` (move semantics), and the per-item `_scrml_lift_el_9` reference IS the live in-DOM node — so the toggle would have worked, *if* the effect had subscribed.

## Fix

In `_scrml_effect` and `_scrml_effect_static`, bracket the inner `fn()` call with save+null+restore of `_scrml_tracking_paused`:

```js
const wasPaused = _scrml_tracking_paused;
_scrml_tracking_paused = false;
try { fn(); } finally {
  _scrml_tracking_paused = wasPaused;
  _scrml_effect_stack.pop();
}
```

Each `_scrml_effect` owns its own tracking scope; the outer pause should not bleed in. `_scrml_untracked` (the user-facing pause primitive) still works correctly — it saves+restores around its own body, and nested effects inside still register their own subscribers (which IS the correct semantic — `_scrml_untracked` is "don't track for the duration of THIS expression," not "block all tracking transitively").

## Class-level impact

The fix covers **any nested `_scrml_effect` registered during reconcile**, not just `class:NAME`. Same bug shape would have broken:
- `style:NAME=expr` reactive style bindings
- Attribute interpolation like `<a href=@target>` inside a for-lift item
- `textContent` from `${@cell}` interpolation inside a for-lift item
- `bind:value` reactive bindings on inputs rendered inside a for-lift item

All of those now fire correctly when their deps change. Adopters can drop the `${fn()}`-single-string workaround you used in p9.

## Verification

- New regression test at `compiler/tests/unit/bug-11-class-binding-in-for-lift-reconcile.test.js` (9 tests across 3 sections — Bug V reproducer 4-step cycle, class-level coverage of textContent + attribute interpolation in factories, tracking-pause-restore semantic preserved).
- **R26 empirical PASS on your exact reproducer** — compiled `2026-05-24-0641-bug-v-class-binding-on-for-lift-not-reactive.scrml` on the post-fix baseline; happy-dom drive of `@sel = 0 → 1 → 2 → 0` advances highlight `alpha → bravo → charlie → alpha` cleanly. Pre-fix the highlight stayed frozen on `alpha`; post-fix it advances on every step.

Released as part of **v0.6.4** (paired close — sole open HIGH bug). Net HIGH count 1 → 0.

## Next steps on our side

Restoring the `<li class:active=...>` form is now correct in your editor's tree/list views — at your convenience you can drop the single-string workaround. If you hit anything that doesn't look right after the fix, send another sidecar; the runtime work is non-trivial and there could be adjacent shapes that surface.

— scrmlTS PA (S139)
