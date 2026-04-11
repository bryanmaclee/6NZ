# non-compliance.report.md
# project: editor (6nz)
# generated: 2026-04-11T00:00:00Z
# scan mode: FULL_COLD_START

## Summary

Total docs scanned: 5
Compliant: 4
Non-compliant: 1
Uncertain: 1

Docs scanned: `editor-README.md`, `hand-off.md`, `master-list.md`, `pa.md`, `README.md`
(`package.json` is not a doc; `handOffs/hand-off-1.md` excluded per scope rules.)

---

## Non-compliant docs

### editor-README.md

**Reason:** content-heuristic + grep-mismatch

**Detail:** The `## Structure (preliminary — under revision)` section lists an entire planned
source tree — `src/routes/`, `src/components/`, `src/state/`, `src/helpers/`, `src/runtime/`,
`app.db.sql`, and 12 named `.scrml` files — none of which exist in the repo. The section heading
itself says "preliminary — under revision", confirming it describes aspirational state. The
`## Deep Dive` section references `docs/deep-dives/6nz-editor-2026-03-30.md` which does not
exist under this repo (it lives in `scrml-support`). The path is wrong for this repo.

Additionally, the decision line "CM6 vs custom minimal: evaluated, decision pending" contradicts
`master-list.md` section B which records "CM6 + canvas overlay" as a **locked** decision.
The README has not been updated to reflect the locked state.

**Suggested disposition:** Update `editor-README.md` — remove the `## Structure` section
(or replace with a single sentence: "Planned structure is tracked in `master-list.md`"); correct
the `## Deep Dive` path to reference the scrml-support location properly (e.g. `../scrml-support/docs/deep-dives/...`); update "decision pending" to reflect the locked CM6 decision.

---

## Uncertain docs (needs human review)

### README.md

**Reason:** content is a single line (`# 6nz`), which is compliant as a stub, but it is unclear
whether this is intentional long-term or a placeholder that should mirror the pa.md project
description.

**What to check:** Decide if `README.md` should remain a stub or be updated to reflect the
design-phase summary (what 6nz is, status, link to `editor-README.md`). No action needed if
stub-by-intent.

---

## Tags
#non-compliance #project-mapper #cleanup #editor #6nz

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
