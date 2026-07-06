# non-compliance.report.md
# project: editor (6nz)
# generated: 2026-07-06T00:00:00Z
# scan mode: INCREMENTAL_UPDATE (S18 Playwright migration + playground-eleven; base: S17 incremental)

## Summary

Total docs scanned: 19 (18 from prior scan + `docs/changes/idiomatic-rewrite/progress.md` noted;
`playground-eleven` has no README.md yet)
Compliant: 14
Non-compliant: 3 (1 carried-forward narrowed, 2 new)
Resolved since last scan: 5
Uncertain: 2

Docs scanned (excluding `handOffs/`, `.claude/`, `node_modules/`, `dist/`):
`editor-README.md`, `editor-architecture.md`, `master-list.md`, `pa.md`, `README.md`,
`user-voice.md`, `hand-off.md`, `docs/changelog.md`, `vpa.md`,
`z-motion-spec/SPEC.md`, `z-motion-spec/README.md`, `z-motion-spec/default-bindings.md`,
`z-motion-spec/LICENSE` (not a doc — skipped),
`proto/README.md`, `proto/6nz-playable/README.md`,
`src/playground-zero/README.md`, `src/playground-one/README.md`,
`LICENSE.md`, `docs/changes/idiomatic-rewrite/progress.md` (historical session log — see note below)

Note: `handOffs/incoming/` messages are out of scope — `handOffs/` excluded per mapper scope rules.

---

## RESOLVED since S17 scan (re-verified this pass — no action needed)

### package.json `"test"` script — RESOLVED

Previously flagged: `@playwright/test` declared but no spec files existed, making `npm test` a
no-op that didn't match the actual (Puppeteer) test tooling. **As of S18, this is resolved for
real**: all 11 original `test.js` Puppeteer harnesses were deleted and ported to `@playwright/test`
spec files (`app.pw.ts`), plus a new 12th spec for `playground-eleven`. `npm test` now discovers
and runs all 12 specs via `playwright.config.ts`. The declared test framework now matches the
actual test tooling in use. Verified: `find src -name test.js` returns nothing; `find src -name
"*.pw.ts"` returns 12 files.

### README.md — RESOLVED

Previously flagged for a stale `../scrmlTS` link and a "design phase, no implementation yet"
status line. Re-checked this pass: `grep -n "scrmlTS\|design phase" README.md` returns no matches.
The file has been updated since the S17 scan.

### editor-README.md — RESOLVED (prior finding); see new minor lag below

Previously flagged for `scrmlTS` references and a playground list capped at p0–p4. Re-checked:
no `scrmlTS` matches; the file now reads "Eleven scrml-native playgrounds exist" and lists
`playground-zero … playground-ten`. The original finding is resolved. See **new finding** below —
this count is now one session behind (`playground-eleven` shipped this session).

### src/playground-six/app.scrml — RESOLVED (app.scrml itself); bridge.js narrowed finding carried forward

Previously flagged for `scrmlTS` in the app.scrml comment block and UI subtitle. Re-checked:
`grep -n "scrmlTS" src/playground-six/app.scrml` returns no matches — the scrml source file itself
is clean. `bridge.js` still has one stale line (see new finding below, narrowed scope).

### src/playground-eight/app.scrml and bridge.js — RESOLVED

Previously flagged for `scrmlTS` references in both files. Re-checked: neither file contains
`scrmlTS` anymore (both `app.scrml` and `bridge.js` are clean; `bridge.js` line 4 correctly reads
"Spawns scrml's LSP"). Fully resolved — no narrowing needed here (contrast with p6 below).

### master-list.md §A default-bindings.md entry — RESOLVED

Previously flagged for an internal inconsistency (§A said "v0.2, planned" while §E said "DONE
S10"). Re-checked: §A line 27 now reads `[x][x] default-bindings.md — v0.3 (rewritten S10, commit
0ffb452; companion to SPEC v0.5)...` — consistent with §E. Resolved.

### z-motion-spec/README.md — RESOLVED

Previously flagged (uncertain) for showing `SPEC.md — v0.1 specification` in its layout block.
Re-checked: line 61 now reads `SPEC.md   v0.5 specification`. Resolved.

---

## Non-compliant docs (current findings)

### src/playground-six/bridge.js (comment, line 4) — NARROWED FINDING

**Reason:** content-heuristic (stale terminology in a source comment)
**Detail:** Line 4: `// Spawns scrmlTS's LSP (`bun lsp/server.js --stdio`) and exposes it` — still
uses the pre-S200-rename name. Line 19 also says "LSP at scrmlTS via SCRMLTS_DIR env". Line 26
correctly documents the rename (`Dir renamed scrmlTS→scrml at S200; env override accepts SCRML_DIR
or legacy SCRMLTS_DIR`), so the legacy env-var name is intentional back-compat, not stale — only
the line-4 and line-19 prose is stale terminology. This is a much narrower finding than the S17
version (which also covered `app.scrml`, now clean). The companion file `playground-eight/bridge.js`
does NOT have this issue (already says "Spawns scrml's LSP").
**Suggested disposition:** Update line 4 to "Spawns scrml's LSP" and line 19's prose to say "scrml"
(keep `SCRMLTS_DIR` as the documented legacy env fallback name — that's a real back-compat surface,
not a typo). Low priority — functional, cosmetic only.

---

### src/playground-one/README.md — NEW FINDING (S18)

**Reason:** grep-mismatch (test tooling claim no longer matches code)
**Detail:** Line 40: "Puppeteer-driven, 8/8 functional tests pass (Insert→Normal→Visual→V-LINE→
Normal→Insert→TOGGLE-HOLD→Insert)." Puppeteer was fully retired this session — `playground-one`'s
test is now `src/playground-one/app.pw.ts` (`@playwright/test`, 12 `test.step()`s per
`test.map.md`), not a Puppeteer `test.js`. The "8/8" count also does not match either the old
`test.js` (12 checks, per the pre-migration `test.map.md`) or the new Playwright spec (12 steps) —
this claim appears to have been stale even before the migration.
**Suggested disposition:** Update the README to describe the Playwright spec and its actual step
count (12), or drop the specific count and point to `npx playwright test src/playground-one` as
the authoritative check. Low priority — informational README only, does not affect test execution.

---

### editor-README.md — NEW FINDING (S18, minor lag)

**Reason:** content-heuristic (undercounts playgrounds by one)
**Detail:** Line 7: "Eleven scrml-native playgrounds exist"; line 113: "`src/playground-zero` …
`playground-ten` — eleven scrml-native playgrounds". `playground-eleven` (flonav) shipped this
session, making the true count twelve (p0–p11). This is a same-session lag, not aspirational
content — low severity, expected to be caught in the next full doc pass.
**Suggested disposition:** Bump "eleven" → "twelve" and extend the range to `playground-eleven` the
next time this file is touched. Very low priority.

---

## Source-code comment drift (informational — not a doc, flagged for completeness)

### src/playground-eleven/app.pw.ts (header comment, lines 3-16)

**Reason:** content-heuristic (comment undercounts actual test steps)
**Detail:** The top-of-file summary comment enumerates 13 asserted behaviors (steps 1–13,
NORMAL/INSERT modal behavior + tree nav + auto-collapse). The actual spec body has 17 numbered
`test.step()` calls — steps 13–16 cover VISUAL-mode multi-select + batch-route behavior added in a
later commit this session (`S18: playground-eleven VISUAL mode — multi-select + batch-route`)
without updating the header comment. Not a `.md` doc, so outside the strict non-compliance scan
scope, but flagged here since it's a direct byproduct of this session's changes and is easy to fix
alongside them.
**Suggested disposition:** Extend the header comment to list steps 14–17 (VISUAL selection extend,
batch-route, Esc-clears-selection, no-page-errors), or simplify it to a one-line summary + "see
test.step() calls for the full sequence." Very low priority.

---

## Uncertain docs (needs human review)

### src/playground-zero/README.md

**Reason:** grep-mismatch (minor)
**Detail:** Line 21: references `../../handOffs/incoming/read/2026-04-20-1700-scrmlTS-to-6nz-all-6-bugs-fixed.md`
— the filename contains `scrmlTS`, reflecting the pre-rename era. The file path is a historical
reference to a read inbox message, not a live link to source code; likely acceptable as-is (history).
Unchanged since the S17/S15 scans.
**What to check:** Decide if historical inbox message references in playground READMEs are acceptable.
If yes, no action needed. If scrmlTS→scrml rename should be reflected everywhere, update the filename reference.

---

### docs/changes/idiomatic-rewrite/progress.md

**Reason:** uncertain — needs human review (directory-location heuristic)
**Detail:** This is a session-progress log (S16 idiomatic-rewrite work) sitting under `docs/changes/`,
not under an excluded `archive/` path. Its content is historical/session-log in tone (describes what
was done, past tense, with commit-style notes) rather than aspirational or a design proposal, so it
does not clearly trip the aspirational-content heuristics. However, `docs/changes/` is not one of
the mapper's standard exclusion paths (`archive/`, `handOffs/`), so it was scanned rather than
skipped by convention.
**What to check:** Decide whether `docs/changes/` should be added to this project's exclusion
convention (alongside `archive/`) so future scans skip it by default, or whether it should continue
to be scanned as a live doc.

---

## Tags
#non-compliance #project-mapper #cleanup #editor #6nz #playwright

## Links
- [primary.map.md](./primary.map.md)
- [test.map.md](./test.map.md)
- [structure.map.md](./structure.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
