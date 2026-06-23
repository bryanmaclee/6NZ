# non-compliance.report.md
# project: editor (6nz)
# generated: 2026-06-23T00:00:00Z
# scan mode: INCREMENTAL_UPDATE (S15 deputy/flogence additions; base: FULL_COLD_START 2026-06-22)

## Summary

Total docs scanned: 18
Compliant: 11
Non-compliant: 5
Uncertain: 2

Docs scanned (excluding `handOffs/`, `.claude/`, `node_modules/`, `dist/`):
`editor-README.md`, `editor-architecture.md`, `master-list.md`, `pa.md`, `README.md`,
`user-voice.md`, `hand-off.md`, `docs/changelog.md`, `vpa.md`,
`z-motion-spec/SPEC.md`, `z-motion-spec/README.md`, `z-motion-spec/default-bindings.md`,
`z-motion-spec/LICENSE` (not a doc — skipped),
`proto/README.md`, `proto/6nz-playable/README.md`,
`src/playground-zero/README.md`, `src/playground-one/README.md`,
`LICENSE.md`

Note: `handOffs/incoming/` messages (2 untracked files as of S15) are out of scope —
`handOffs/` is excluded per mapper scope rules.

---

## New additions (S15 incremental scan — all compliant)

### vpa.md — COMPLIANT

Current-truth contract for the vPA deputy system adopted S15. All referenced files exist:
`scripts/state.ts`, `handOffs/delta-log.md`, `handOffs/deputy-state.md`,
`handOffs/flogence-intake.md`, `handOffs/digest.md`, `master-list.md`, `docs/changelog.md`,
`.claude/maps/`, `pa.md`. No aspirational or stale content. Compliant.

---

## Non-compliant docs (carried from FULL_COLD_START — no change to findings)

### README.md

**Reason:** grep-mismatch + content-heuristic
**Detail:** Three stale items in the current `README.md`:
1. Line 3: `[scrml](../scrmlTS)` — links to the old `scrmlTS` repo path. Compiler was renamed
   to `scrml` at S200 (dir `../scrml/`). The link target `../scrmlTS` does not exist.
2. Line 6-7: "Status: design phase. No implementation yet — awaiting compiler API exposure in scrmlTS."
   — 11 working playgrounds exist; the compiler is now named `scrml`, not `scrmlTS`; LSP L1-L4
   is reachable. The status line is badly stale.
3. The "What's here" section omits all mention of the 11 `src/` playgrounds and the `docs/` directory.
**Suggested disposition:** Update in-place. Fix the `scrmlTS` link to `scrml`. Update status to
reflect exploratory implementation phase. Add a brief `src/` mention.

---

### editor-README.md

**Reason:** content-heuristic + grep-mismatch
**Detail:** Two stale items:
1. Line 10: "remains gated on scrmlTS compiler API exposure" — compiler renamed to `scrml` at S200.
2. Line 113: "src/playground-zero … playground-four" — lists only p0–p4. There are now 11
   playgrounds (p0–p10). The structure section in this doc describes only 5 playgrounds and is
   missing p5–p10.
3. Line 122: same "gated on scrmlTS" text repeated.
**Suggested disposition:** Update in-place. Replace `scrmlTS` with `scrml`. Expand the playground
list to p0–p10 or just reference `master-list.md` for the current inventory.

---

### src/playground-six/app.scrml (comment block)

**Reason:** content-heuristic (stale terminology in source comments)
**Detail:** Line 7 comment: `browser <-- WebSocket --> bridge.js <-- stdio --> scrmlTS LSP`
and line in the rendered UI subtitle: "CM6 buffer wired to scrmlTS LSP via WebSocket bridge."
The compiler is named `scrml`, not `scrmlTS` (renamed S200). These are user-visible strings
and source comments.
**Suggested disposition:** Update comments and the `<p class="subtitle">` string in the scrml
source to say "scrml LSP" instead of "scrmlTS LSP". Low priority — functional, just stale naming.

---

### src/playground-eight/app.scrml (comment block and bridge.js)

**Reason:** content-heuristic (stale terminology in source comments and bridge comment)
**Detail:** `app.scrml` comments reference "scrmlTS S40 LSP capabilities", "scrmlTS's L1-L4 LSP arc",
and "scrmlTS LSP" in the wire diagram and subtitle string. `bridge.js` comment block still says
"Spawns scrmlTS's LSP" in the header (though the code itself was updated with S200 rename note).
Same issue as p6.
**Suggested disposition:** Update comment blocks and UI subtitle string to say `scrml`. Low priority.

---

### master-list.md §A — `default-bindings.md` entry

**Reason:** content-heuristic (internal inconsistency)
**Detail:** Line 26 in §A reads:
`default-bindings.md — v0.2, partially stale against SPEC v0.5. v0.3 rewrite planned.`
But §E line 112 confirms: `default-bindings.md v0.3 rewrite — DONE S10 (commit 0ffb452)`.
The §A checklist entry was never updated to reflect the v0.3 completion.
The file itself (`z-motion-spec/default-bindings.md`) is indeed v0.3 — the §A entry is stale.
**Suggested disposition:** Update §A entry to `[x][x] default-bindings.md — v0.3 (rewritten S10;
companion to SPEC v0.5)`. No file move needed.

---

## Uncertain docs (needs human review)

### z-motion-spec/README.md

**Reason:** content-heuristic
**Detail:** The file layout block inside reads: `SPEC.md — v0.1 specification`. The actual
SPEC.md is v0.5. The layout listing also omits `default-bindings.md`. This README appears
to be from the initial v0.1 era and was never updated.
**What to check:** Update layout block to show SPEC.md v0.5 + include default-bindings.md.

---

### src/playground-zero/README.md

**Reason:** grep-mismatch (minor)
**Detail:** Line 21: references `../../handOffs/incoming/read/2026-04-20-1700-scrmlTS-to-6nz-all-6-bugs-fixed.md`
— the filename contains `scrmlTS`, reflecting the pre-rename era. The file path is a historical
reference to a read inbox message, not a live link to source code; likely acceptable as-is (history).
**What to check:** Decide if historical inbox message references in playground READMEs are acceptable.
If yes, no action needed. If scrmlTS→scrml rename should be reflected everywhere, update the filename reference.

---

## Tags
#non-compliance #project-mapper #cleanup #editor #6nz

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
