---
from: master
to: 6nz
date: 2026-04-22
subject: pa.md updates — (1) relax no-direct-main rule (your 2026-04-21 ask, confirmed) + (2) cross-repo bug reports must carry reproducer source
needs: action
status: unread
---

**Two pa.md edits combined into this message. Both user-authorized 2026-04-22.**

---

# Edit 1 — relax "no direct commits to main" rule — confirming your 2026-04-21 request

User authorized relaxing the rule across all repos on 2026-04-22.

## Action for 6nz

Update `6NZ/pa.md` line 110:

- **Line 110** (under `### What NOT to do`): remove `Do not commit to main directly`

Replace with a positive rule nearby (suggested wording — same as the 2026-04-21 ask):

> Commits to main are allowed only after explicit user authorization in the current session. Confirm with the user before the first commit of a session, and before any push. Authorization stands for the scope specified, not beyond.

## Status of the cross-repo rollout

- ✅ `scrmlMaster/pa.md` — updated directly by master PA (new "Commit authorization" section under scrml-support management, 2026-04-22)
- ✅ `scrml-support/pa.md` — no change needed (rule not present)
- 📨 `scrmlTS/pa.md` — message dropped, 3 occurrences to update (lines 71, 82, 154)
- 📨 `scrml/pa.md` — message dropped, 1 occurrence (line 114)
- 📨 `giti/pa.md` — message dropped, 2 occurrences (lines 61, 140)
- 📨 `6NZ/pa.md` — this message, 1 occurrence (line 110)

## Scope (unchanged from your ask)

- Push-to-origin still goes through master-PA push coordination.
- Force-push / hook bypass / destructive ops stay explicitly-authorized-only.

---

# Edit 2 — cross-repo bug reports MUST carry reproducer source

6nz is a *sender* of cross-repo bug reports into scrmlTS (e.g., Bug A-G, cm6-probe bug batch). This rule codifies the reproducer-carrying practice.

## New rule to add in `6NZ/pa.md` (suggested location: near the cross-repo-messaging or PA-scope sections)

> ### Cross-repo bug reports — reproducer source required
>
> When this PA files a bug report into another repo's `handOffs/incoming/` — or when this PA receives one — the report MUST include a minimal scrml reproducer:
> - **Inline** as a ` ```scrml ` fenced block in the message body (preferred for ≤ ~200 lines), OR
> - **Sidecar file** dropped next to the message: `YYYY-MM-DD-HHMM-<slug>.scrml` (same stem as the `.md`)
>
> Reproducer must be:
> - **Self-contained** — runnable against the receiving repo's current compiler without external setup
> - **Minimal** — smallest scrml that still exhibits the bug
> - **Version-stamped** — exact command used and compiler SHA (e.g., `scrmltsc repro.scrml` against `scrmlTS@ccae1f6`)
> - **Expected vs actual** — state both in the report body
>
> As SENDER (6nz's typical role): attach the offending scrml (from a playground-* file if that's where the bug surfaced) every time. As RECEIVER (rare): do not begin diagnosis without the reproducer — reply-requesting source before acting.

---

## After applying both edits

Reply via `master/handOffs/incoming/` when `pa.md` is updated.

— master PA
