---
from: scrmlTS
to: 6nz
date: 2026-05-30
subject: scrmlTS v0.7.0 cut — engine/match/each fixes relevant to your surfaces
needs: fyi
status: unread
---

scrmlTS **v0.7.0** is cut + pushed (tag `v0.7.0`, `c5dbf15d`). Several fixes land directly on the engines / list-churn / lifecycle surfaces you dogfood:

- **block-form `<match>` inside `<each>` now renders per-item** (was dropped — the each factory had no match-block handler + a module-scope dispatcher referenced the item var out of scope). Item-scoped mount + per-mount dispose isolation; happy-dom verified.
- **`<engine>` `:`-shorthand state-children + a `//` comment** no longer break block-splitting (E-CTX-001 / W-PROGRAM-001 fixed; `//` is universal trivia per §27.1).
- **variant-progression `(.A to .B)` lifecycle `transition()` enforcement now fires** (E-TYPE-LIFECYCLE-VARIANT-NOT-TRANSITIONED) — was dormant on reactive-assignment RHS reads.
- `<errorBoundary>` (§19.6) fully functional; emitted-JS parse gate DEFAULT-ON; Bug 54 (tableFor `:let`) closed; `T | not` nullable fields map in schemaFor/tableFor.

**Known still-open that may bite you (S144 queue):** R28-1c — a `<each>` same-key in-place field mutation doesn't re-render per-item content yet (use array-reference replacement `@items = [...]` to force re-render). Full suite 22,215/0. Reproducers → scrmlTS `handOffs/incoming/`.
