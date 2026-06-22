# non-compliance.report.md
# project: editor (6nz)
# generated: 2026-06-22T00:00:00Z
# scan mode: FULL_COLD_START (S15 cold refresh)

## Summary

Total docs scanned: 17
Compliant: 9
Non-compliant: 5
Uncertain: 3

Docs scanned (excludes `handOffs/`, `.claude/`, `node_modules/`, `dist/`):
`README.md`, `editor-README.md`, `editor-architecture.md`, `master-list.md`, `pa.md`,
`user-voice.md`, `hand-off.md`, `docs/changelog.md`,
`z-motion-spec/SPEC.md`, `z-motion-spec/README.md`, `z-motion-spec/default-bindings.md`,
`proto/README.md`, `proto/6nz-playable/README.md`,
`src/playground-zero/README.md`, `src/playground-one/README.md`,
`LICENSE.md`

---

## Non-compliant docs

### README.md
**Reason:** grep-mismatch + content-heuristic
**Detail:** Three stale items:
1. Line 3: `[scrml](../scrmlTS)` — links to `../scrmlTS` which does not exist. Compiler dir renamed to `scrml` at S200.
2. Lines 5-6: "Status: design phase. No implementation yet — awaiting compiler API exposure in scrmlTS." — 11 working scrml playgrounds exist; compiler is named `scrml` not `scrmlTS`; LSP L1-L4 is reachable.
3. "What's here" section omits all 11 `src/` playgrounds and the `docs/` directory entirely.
**Suggested disposition:** Update in-place. Fix link target to `scrml`. Update status to "exploratory implementation phase". Add src/ mention. Low urgency (the live site is the proto, not this README).

---

### editor-README.md
**Reason:** grep-mismatch + content-heuristic
**Detail:** Two stale items:
1. Line 10 (approximately): "remains gated on scrmlTS compiler API exposure" — compiler renamed to `scrml` at S200.
2. Playground list section mentions only p0–p4; there are now 11 playgrounds (p0–p10). Status says "6 playgrounds" or similar.
3. Same "scrmlTS" text repeated in the status block.
**Suggested disposition:** Update in-place. Replace `scrmlTS` → `scrml`. Expand or defer playground list to `master-list.md`. Low urgency (pa.md and master-list.md are authoritative for agents).

---

### master-list.md §A entry for default-bindings.md
**Reason:** content-heuristic (internal inconsistency within the same file)
**Detail:** §A line reads: `default-bindings.md — v0.2, partially stale against SPEC v0.5. v0.3 rewrite planned.`
But §E confirms: `default-bindings.md v0.3 rewrite — DONE S10 (commit 0ffb452)`. The file itself
is v0.3 (header confirms this). The §A checklist entry was never updated to reflect v0.3 completion.
**Suggested disposition:** Update §A entry to reflect `v0.3, companion to SPEC v0.5` status.

---

### src/playground-zero/README.md
**Reason:** grep-mismatch + content-heuristic
**Detail:** Line ~21 references a historical inbox message path containing `scrmlTS`:
`../../handOffs/incoming/read/2026-04-20-1700-scrmlTS-to-6nz-all-6-bugs-fixed.md`.
Also, line ~41: "Smoke test now passes: TAP / ROLL / HOLD" but the playground has no test.js —
the smoke counts referenced are from manual or historical testing notes that may be documented
elsewhere. Minor: no test.js exists but the README says "Smoke test passes".
**Suggested disposition:** The historical inbox reference is a cross-repo provenance note; acceptable
as-is unless a naming-consistency pass is done. Smoke test claim: note "no automated test.js; runtime-probed S14".

---

### src/playground-one/README.md
**Reason:** grep-mismatch
**Detail:** Line 2 says `< machine>` (with a space) — this is the old scrml `<machine>` syntax.
As of v0.7.0 migration (S14), all `<machine>` tags were renamed to `<engine>`. The README still
describes the old primitive name and says "Bug G to scrmlTS" — compiler renamed to `scrml`.
Line 43: "Puppeteer-driven, 8/8 functional tests pass" — playground-one has no test.js.
**Suggested disposition:** Update `<machine>` → `<engine>`, `scrmlTS` → `scrml`. Clarify that
p1 has no automated test harness (runtime-probed S14).

---

## Uncertain docs (needs human review)

### z-motion-spec/README.md
**Reason:** content-heuristic
**Detail:** Layout block inside reads `SPEC.md — v0.1 specification`. The actual SPEC.md is v0.5.
The layout listing also omits `default-bindings.md` entirely. This README appears to be from the
v0.1 era and was never updated through v0.2–v0.5 revisions.
**What to check:** Update layout block to show SPEC.md v0.5 and include `default-bindings.md v0.3`.

---

### proto/README.md
**Reason:** content-heuristic (partially stale)
**Detail:** "6nz is blocked on scrmlTS compiler API exposure" — compiler renamed. Also: the
"Current prototypes" section only lists `z-motion-feel/` and omits `6nz-playable/` (the deployed
prototype with 62 scenarios, live on GitHub Pages). If `proto/6nz-playable/` was added after this
README was written, it was never added to the list.
**What to check:** Update `scrmlTS` → `scrml`. Add `6nz-playable/` to the current prototypes list.

---

### proto/6nz-playable/README.md
**Reason:** uncertain — needs human review
**Detail:** Not read in this scan (proto/ is generally in scope here since it's actively deployed).
The prototype was built against an older spec version; the README may reference SPEC v0.3 or v0.4
while SPEC is now v0.5. The file exists and is deployed.
**What to check:** Verify the README version references (SPEC version, feature set) match what the
live prototype actually implements. Proto/ content is explicitly throwaway per proto/README.md rules.

---

## Tags
#non-compliance #project-mapper #cleanup #editor #6nz

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
