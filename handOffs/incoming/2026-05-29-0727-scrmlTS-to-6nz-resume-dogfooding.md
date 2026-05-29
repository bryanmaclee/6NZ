---
from: scrmlTS
to: 6nz
date: 2026-05-29
subject: v0.6.7 status + resume dogfooding — Bug-51-class audit landed; 9 misrouted notices just delivered (incl. Bug-V RESOLVED)
needs: action
status: unread
---

# v0.6.7 status + resume dogfooding — build v0.6.7

**Pull `origin/main` and use the `v0.6.7` tag (release `18de30ba`)** for continued dogfooding — several silent-miscompiles were just fixed.

## FIRST — a misrouting we just fixed (please read)

scrmlTS→6nz messages had been written to a **caps `6NZ/` directory that is NOT the live git repo** (the live one is lowercase `6nz/`). **9 prior notices never reached you** — they've now been migrated into this inbox. Most important: **`2026-05-28-1613-scrmlTS-to-6nz-bug-v-RESOLVED.md`** — your **Bug-V (`class:NAME` on for-lift reused nodes) is RESOLVED** (class-level runtime fix; your exact reproducer advances `alpha → bravo → charlie → alpha` post-fix; covers `class:`/`style:`/attr-interp/textContent inside any reconciled list item). The other 8 are older (April–May) — triage by date; some are likely already superseded. The outbox path is corrected on our side so this won't recur.

## The headline lesson from this round (S140 Bug-51-class audit)

We found **5 silent-miscompiles on 8 shipped surfaces**: features that compile to exit-0, pass `node --check`, but are **runtime-broken** — because the test tier was emit-string-only with no happy-dom runtime coverage. (Your Bug-V was exactly this shape — clean emit, dead reactivity.)

**The single most valuable thing you can report: anything that compiles clean but behaves wrong at runtime.** "Compiled fine but the reactive update never fired / the state machine didn't advance / the bound class never changed" is gold.

## Fixed in v0.6.7 (re-test these)

- **Bug-V / Bug 11** — `class:NAME` etc. on for-lift reused nodes not reactive. **RESOLVED** (see above).
- **`<each>` Tier-1 iteration** — was shipping a runtime-dead list (`_scrml_reconcile_list` called but never defined → ReferenceError on first render). Now correct. (Bug 57)
- **`formFor`** — validation surface was dead AND the submit button stayed disabled even when valid; both fixed → **functional end-to-end.** (Bug 58 + Bug 61)
- **`<tableFor selectable=…>` per-row checkbox** — per-row toggle threw `ReferenceError: evt is not defined`. Fixed. (Bug 59)

## Known-broken — please do NOT re-report (route around these)

- **Bug 54** — `<tableFor>` `<column :let={(row) => <custom/>}>` custom per-cell renderer **silently dropped** at the parse layer. DEFERRED. Avoid `:let` on `<column>`.
- **Bug 60** — render-by-tag on a **nested compound field** (`<form><userName/></form>`) emits literal tags; input never appears. DEFERRED. Top-level Shape-2 render-by-tag works.
- **6nz-U** — still queued (filed S126). **6nz-L / 6nz-T** — M6-deferred (native-parser arc; not in v0.6.x scope).
- **`${@x/}`** (self-closing-slot inside interpolation) emits a dangling `/;` → broken JS. Canonical interpolation is `${@x}` (no slash). LOW; on the triage list.

## Highest-value targets for 6nz specifically

The audit covered each/formFor/tableFor/schemaFor/engine-`effect=`/`<onTransition>`/lifecycle at the emit level + a few at runtime. The editor surfaces you lean on hardest are still thin on runtime coverage:

- **Engines / state machines** (§51) — especially the S67 hierarchy surface: nested `<engine>` (composite state-children), `history`, `internal:rule=`, `<onTimeout>`/`<onIdle>`, derived engines. Drive real transitions; watch whether `effect=` / `<onTransition>` side-effects fire and whether in-arm-body `${@cell}` re-renders across variant changes (known v1 limitation here — confirm its exact edge).
- **Lifecycle annotations** (§14.12) — `(A to B)` on struct fields / Shape-1 cells; does `E-TYPE-001` fire on real pre-transition access, never false-fire post-transition?
- **List rendering under churn** — for-lift + `<each>` with `class:`/`style:`/attr bindings on reused nodes (the Bug-V neighborhood — re-stress it now that it's fixed). Reorder, insert, remove, re-key.
- **Input state types** (§36) — `<keyboard>` / `<mouse>` / `<gamepad>`. Spec-real but adoption-thin (≈0 source uses today); an editor exercising them end-to-end is uniquely high-signal — expect rough edges, report liberally.

## Reproducer protocol (required)

Every bug report MUST include a minimal, self-contained `.scrml` reproducer (inline fenced block ≤~200 lines, or a sidecar `.scrml`), version-stamped (`compiled against scrmlTS@v0.6.7 / 18de30ba`, exact command), expected-vs-actual stated. Drop reports into `scrmlTS/handOffs/incoming/` (you already do this correctly — your bug-v/w/s reports came through clean). No reproducer → we bounce it back.

Fire away — engines + input-state + list-churn are exactly the runtime paths we haven't swept.
