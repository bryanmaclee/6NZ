# 6nz — Session 10 Hand-Off

**Date:** 2026-04-25 →
**Next hand-off filename:** `handOffs/hand-off-10.md`

## Session start state
- Session 9 rotated to `handOffs/hand-off-9.md`
- Working tree: `main` @ `e5a0752`, clean
- `handOffs/incoming/` empty (only `read/` subdir with 7 archived inbounds)
- `user-voice.md` header-only (no contentful entries this repo)
- Maps (`.claude/maps/`) still from session 2 cold run — stale

## Session work

### Maps refresh (commit `6561d24`)
- project-mapper cold-rerun (S2 maps were ~2 weeks stale, pre-playgrounds, pre-pa-edits, pre-SPEC-v0.5).
- Rewrote primary, structure, dependencies, schema, config, build, error, test maps; added new infra map (GitHub Pages CI warranted it); skipped api/state/events/auth/domain/style/i18n/migrations/jobs (not present in repo).
- Non-compliance report flagged 4 items: default-bindings.md (v0.2 vs SPEC v0.5), editor-README.md Structure section (claimed "no source"), z-motion-spec/README.md (SPEC version + missing default-bindings listing), proto/6nz-playable/README.md (contradictory "what works" vs "intentionally missing").

### Doc-fix triple (commit `0acabcc`)
- editor-README.md Structure: rewrote to describe 5 playgrounds + proto carve-out + spec; status header changed from "Design Phase" to "Exploratory implementation phase" with editor-proper still gated.
- z-motion-spec/README.md: fixed SPEC.md v0.1 → v0.5; added default-bindings.md to listing.
- proto/6nz-playable/README.md: tagged each "What works" entry as Mock or Real; reframed "What's intentionally missing" to absent-entirely; closing paragraph clarifies headline-concepts present as mockups only.

### default-bindings.md v0.3 rewrite (commit `0ffb452`)
- Drop FAMILY 2 (numeric count-hold) entirely.
- Replace `[sd]`/`[ds]` multi-key vertical with direct letter holds `[j]` (down) and `[k]` (up).
- Add §11 undo hold family `[u]` — first default to exercise SPEC §6.4 sustained gestures (added in SPEC v0.5).
- Add shift-leak-from-rolls flag pending SPEC §5/§11 clarification.
- Remove v0.4 staleness notice — companion to SPEC v0.5 now.

### Re-file Bugs H/I/J/K to scrmlTS
- User asked to re-file the four bugs from playground-four (originally bundled with Bug 4/5 verification on 2026-04-22). Reconstructed from playground-four source + S9 hand-off descriptions.
- 5 files dropped into scrmlTS inbox: dedicated message (`2026-04-25-0106-6nz-to-scrmlTS-refile-bugs-h-i-j-k.md`) with all four reports inline + summary table; 4 sidecar `.scrml` repros.

### S40 LSP unlock + L5 defer reply
- Inbound `2026-04-24-2245-scrmlTS-to-6nz-s40-lsp-and-bun-sql.md`: scrmlTS S40 closed with LSP L1+L2+L3 (108 new tests). Three commits: `e1827e6` (L1), `14cc1d1` (L2), `24712f5` (L3). Capabilities: outline, hover-with-signatures, completions across all contexts, cross-file go-to-def, cross-file diagnostics, SQL-column completion, component-prop completion, import-clause completion. L4 in progress; L5 deferred or skipped pending 6nz spatial-panel input. Bun.SQL codegen change `?{}` → `await _scrml_sql\`...\`` (no impact on current playgrounds).
- Read deep-dive at `scrmlTS/docs/deep-dives/lsp-enhancement-scoping-2026-04-24.md`.
- Outbound `2026-04-25-0120-6nz-to-scrmlTS-l5-defer-and-thanks-for-l1-l3.md`: recommend defer L5 indefinitely (spatial panels supersede inline semantic-tokens-as-coloring); keep `endLine`/`endCol` Span work as standalone item; queued playground-six (LSP→CM6 surface); no L4 asks.

### master-list S10 refresh + session housekeeping (commit `5de4524`)
- §D split compiler-API prereq into LSP-shipped (semantic features reachable via stdio child-process) vs in-process API still needed for browser-PWA.
- §E added playground-six (LSP integration); maps refresh marked done.
- §F added LSP unlock entry, Bun.SQL note, H/I/J/K re-file note.
- hand-off-9 rotated; user-voice S10 entry appended; archived inbound moved to `read/`.

### Push (4 commits to origin/main: 6561d24, 0acabcc, 0ffb452, 5de4524)
- pa.md says push goes through master-PA coordination; master inbox path (`/home/bryan-maclee/scrmlMaster/handOffs/incoming/`) doesn't exist on this machine. User authorized push directly this turn ("commit push go").
- scrmlTS now has 8 unread files in its inbox from us (4 sidecars + 1 message for H/I/J/K re-file; 1 message for L5 defer; plus an unrelated giti message). scrmlTS's PA will read + push on its next session; we're not coordinating that.

### Built playground-six — LSP diagnostics over WebSocket (commit `ceedd99`)
- Wire: `browser <-- WebSocket --> bridge.js <-- stdio --> scrmlTS LSP`. Bridge is a Bun script that spawns `bun lsp/server.js --stdio` as a child process and exposes WebSocket on PORT (default 3061). One JSON frame per LSP message in either direction. WS frame from browser → Content-Length-prefixed write to LSP stdin. LSP stdout → header-parse → forward each frame as one WS message.
- scrml-side: CM6 mounts via the same esm.sh bridge as p3; opens WebSocket; sends `initialize`; on response sends `initialized` + `textDocument/didOpen`. CM6's updateListener fires `textDocument/didChange` (Full sync, per LSP capabilities `textDocumentSync: 1`) on every edit. `publishDiagnostics` notifications update the @diagnostics reactive.
- Smoke: 7/7 pass. CM6 mounts → LSP reaches "ready" → clean buffer has 0 diagnostics → replacing with broken scrml surfaces diagnostics → diag panel renders text → replacing back with clean scrml returns to 0 → no pageerrors.
- LICENSE.md added at repo root: copyright + all rights reserved except `z-motion-spec/` (CC0 1.0). Repo is public on GitHub for transparency, not as an open-source release.
- **Three new codegen bugs surfaced** during construction. Each has minimal repro + sidecar filed at `scrmlTS/handOffs/incoming/2026-04-26-1041-*`:
  - **Bug M** — `obj.field = function() {...}` member-assignment of a function expression mis-emits as two statements (assignment with empty RHS + orphaned function literal). Workaround: `addEventListener` instead of property assignment.
  - **Bug N** — two consecutive `@x = ...` reactive writes inside an INLINE function expression mis-emit (first loses closing paren; second emits as `_scrml_reactive_get(...) = ...`). SAME pattern in named function bodies emits cleanly. Workaround: extract handler bodies to named helpers; pass single-call wrapper to addEventListener.
  - **Bug O** — for-of loop variable in markup `${ for (x of @list) { lift ... } }` leaks into the surrounding meta-effect closure as a free identifier when a `^{ ... }` block exists. Workaround: render list as a single string via helper function instead of for-lift.
  - Bug L recurrence (already filed): sample-doc construction with `${` and `}` in concatenated string literals trips BS's brace counter. Same `String.fromCharCode(123/125)` workaround.

### Built playground-five — vim modes on CM6 (commit `fd687e4`)
- Architecture: CM6 owns the document; scrml owns `@mode` (Insert/Normal/Visual) and intercepts keystrokes via a CAPTURE-phase keydown listener on `.cm-host` so we run before CM6's contenteditable handler. Cleanest mode gating without fighting CM6's keymap precedence.
- Normal: every keystroke suppressed; recognized commands dispatch CM6 selection updates (h/j/k/l motion, 0/$ line anchors, i/a enter Insert, v enters Visual, Esc stays in Normal). Insert: only Esc is intercepted; CM6 handles typing natively. Visual: like Normal but motions extend the selection.
- Cursor motion via `view.dispatch({ selection: { anchor, head } })`. Up/down line-aware via `doc.lineAt()` and `doc.line(n)`. Position reactives synced from CM6's updateListener.
- 18/18 puppeteer smoke pass (CM6 mount, mode toggles, hjkl motion, NORMAL key suppression, INSERT typing, VISUAL extension, no pageerrors). Boots `scrml dev` on port 3055.
- Surfaced **Bug L** during construction: BS not string-aware in brace counting — `{` and `}` split across separate string literals trip BS's brace counter, manifesting as bogus "Unclosed 'logic'/'program'" errors. Sibling of the `\n`-not-interpreted-in-strings issue from playground-two. Filed to scrmlTS at `2026-04-25-0155-6nz-to-scrmlTS-bug-l-bs-unbalanced-brace-in-string.md` with inline + sidecar repro. Workaround in p5: avoid raw braces in the sample doc.

### Two replies arrived from scrmlTS post-push, retest + final confirm
- Inbound `2026-04-25-2300-scrmlTS-to-6nz-bugs-h-i-j-k-fixed-in-s39.md` (`needs: action`): all 4 bugs were already fixed in S39 — we tested against `9540518` (S37 close) but fixes landed S39 between then and our re-file. They asked for retest on current main, especially Bug I (which targeted spaced-member-access; uncertain whether the fix also covered our helper-name-vs-record-field collision case).
- Inbound `2026-04-25-2305-scrmlTS-to-6nz-l5-defer-acked.md` (`needs: fyi`): L5 dropped from active roadmap. `endLine`/`endCol` Span work kept as standalone follow-up. **L4 LANDED** at `c51ad15` — signature help + quick-fix code actions for E-IMPORT-004/005, E-LIN-001, E-PA-007, E-SQL-006 (+53 LSP tests, 157 total). LSP arc complete: L1+L2+L3+L4 live, L5 dropped. Playground-six guidance: vanilla `Content-Length:`-prefixed JSON-RPC over stdio, sync completions, `rootUri` needed for L2/L3 cross-file features.
- Retested all 4 against scrmlTS local at `c51ad15`. **All 4 confirmed fixed** including Bug I's helper-name-vs-record-field case (lookbehind covers both patterns). Authoring notes flagged: original Bug J sidecar tripped BS on `<pre>` markup inside `//` comments at file root; original Bug K used non-scrml `throw` + `== null` (compiler correctly flagged E-ERROR-006 + E-SYNTAX-042). Minimal scrml-idiomatic versions of both compile cleanly.
- Outbound `2026-04-25-0130-6nz-to-scrmlTS-bugs-h-i-j-k-all-confirmed-fixed.md` (`needs: fyi`): all 4 confirmed fixed with emit/runtime evidence; flagged the authoring bugs in our own sidecars; noted the 4 workarounds in playground-four are no longer load-bearing but won't revert in this turn (cosmetic only; the workaround state is the bug-evidence record).
- Both inbounds archived to `read/`.

## Cross-repo traffic log
- **Out to scrmlTS** (1 message + 4 sidecars): re-file of Bugs H/I/J/K from playground-four. Original sent 2026-04-22 in a bundled "Bug 4/5 verified + 4 new" message; user asked to re-file the four as a dedicated message in case the bundling made them easy to overlook.
  - `2026-04-25-0106-6nz-to-scrmlTS-refile-bugs-h-i-j-k.md`
  - sidecars: `bug-h-function-match-no-return.scrml`, `bug-i-name-mangle-record-literal.scrml`, `bug-j-interp-dep-extractor-no-helper-recurse.scrml`, `bug-k-effect-throw-halts-caller.scrml`
- **In from scrmlTS** (1 message, archived): `2026-04-24-2245-scrmlTS-to-6nz-s40-lsp-and-bun-sql.md` — S40 closed with LSP L1+L2+L3 (108 new tests; outline, hover, completions across all contexts, cross-file go-to-def, cross-file diagnostics, SQL-column completion, component-prop completion, import-clause completion). L4 (signature help + code actions) in progress. L5 (semantic tokens) deferred or skipped pending 6nz spatial-panel input. Bun.SQL codegen shape change (`?{}` → `await _scrml_sql\`...\``); doesn't bite any current playground.
- **Out to scrmlTS** (1 message): `2026-04-25-0120-6nz-to-scrmlTS-l5-defer-and-thanks-for-l1-l3.md` — recommend defer L5 indefinitely (spatial panels supersede semantic-tokens-as-coloring); keep `endLine`/`endCol` Span work as a standalone item; queue **playground-six** to wire the LSP into a real CM6 surface; no L4 asks; Bun.SQL change noted, no impact.
- **Out to scrmlTS** (1 message + 1 sidecar): `2026-04-25-0155-6nz-to-scrmlTS-bug-l-bs-unbalanced-brace-in-string.md` — Bug L: BS not string-aware in brace counting; surfaced during playground-five construction; sibling of the `\n`-in-strings issue.
- **Out to scrmlTS** (1 message + 3 sidecars): `2026-04-26-1041-6nz-to-scrmlTS-bugs-m-n-o-from-playground-six.md` — three new codegen bugs (M, N, O) from playground-six construction; each with minimal repro + workaround documentation; Bug L recurrence noted (no new filing).

## Open items carried in from S9
- master-list refreshed at S9 close — accurate as of 2026-04-22
- `.claude/maps/` stale (S2, pre-playgrounds) — incremental refresh worth doing
- `default-bindings.md` v0.2 → v0.3 rewrite — tracked in master-list §E, not blocked
- Playground-five suggested: CM6 + vim-modes integration (merge two's state machine + hjkl onto three's real CM6 surface)
- Awaiting scrmlTS triage on Bugs H, I, J, K + Bug 5 mixed-case follow-on
