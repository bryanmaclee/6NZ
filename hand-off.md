# 6nz — Session 9 Hand-Off

**Date:** 2026-04-21 → 2026-04-22
**Next hand-off filename:** `handOffs/hand-off-9.md`

## Session start state
- Session 8 rotated to `handOffs/hand-off-8.md`
- Working tree: `main` @ `348f4b3`, clean except two untracked playgrounds (`src/playground-two/`, `src/playground-three/`) carried over from session 8 without being committed
- `handOffs/incoming/` empty (only `read/` subdir)
- `user-voice.md` header-only
- Maps (`.claude/maps/`) still from session 2 cold run

## Session work

### Orientation and bug-G loop
- Surveyed the repo — 4 playgrounds (zero/one committed, two/three uncommitted), SPEC v0.5, stale master-list (S5), stale maps (S2), live playable prototype at bryanmaclee.github.io/6NZ/.
- Read inbound `2026-04-21-scrmlTS-to-6nz-bug-g-fixed.md` — `fn name() -> T { match … }` implicit-return shipped in scrmlTS `83e6896`/`d40afbe`.
- Restored `fn modeName(m: Mode) -> string { match m { … } }` in playground-one. Compiled cleanly, JS matches scrmlTS's expected shape, puppeteer smoke 4/5 (one unrelated markup `for-lift` re-render gap flagged in receipt).
- Bug G verification receipt sent; inbound archived.

### Committed three playgrounds (7292df6, e900547, 048bc25)
- `playground-one`: `fn` restoration commit.
- `playground-two`: hjkl + z-motion buffer editor committed as-is (with inline-noted compiler quirks: string `\n`, ternary-in-const, return-after-ternary-const, derived-reactive markup wiring).
- `playground-three`: CM6 probe committed at pre-runtime-verification state (to preserve failure-mode evidence of the esm.sh module-system gap).

### Runtime-verified playground-three (9/9 smoke)
- The esm.sh bridge works mechanically. Two fixes needed to turn it green:
  - Split `EditorView` import to `@codemirror/view@6` (the `codemirror` meta-package only re-exports `basicSetup`).
  - Pin `codemirror@6.0.2` explicitly — esm.sh resolves bare `@6` to a bogus `6.65.7` that serves CM5 legacy code.
- Per user direction, the committed playground-three was NOT updated with the fixes; instead, the full findings + workaround diff went into a scrmlTS message.
- Sent `2026-04-21-1010-6nz-to-scrmlTS-cm6-probe-findings-and-bug-batch.md` with: CM6 probe outcome, 4 concrete costs of no-module-system, 6 pending compiler quirks batched, preamble for user's direct follow-up on source-level `import`.

### pa.md policy updates (via master)
- Sent `2026-04-21-0930-6nz-to-master-allow-self-push-with-user-check.md` asking for "no direct commits to main" rule to be relaxed across all per-repo pa.md files.
- Master replied 2026-04-22 `0534` with two authorized edits combined:
  1. Relax commit-auth rule (my original ask).
  2. NEW: cross-repo bug reports must carry reproducer source (inline fenced ` ```scrml ` or sidecar `.scrml` file).
- Both edits applied to `6NZ/pa.md` (commit `c4a742b`); confirmation reply sent to master.

### playground-three simplification to `^{ loadCm() }` (commit 1f18fe9)
- Read inbound `2026-04-22-scrmlTS-to-6nz-unblocked-status.md` — scrmlTS triaged the 6-bug batch:
  - Bugs 1, 4 CONFIRMED + queued
  - Bug 2 NOT REPRO (was cascading from Bug 4)
  - Bug 3 NOT REPRO — wanted exact `prevStart` source
  - Bug 5 STATIC EMIT LOOKS CORRECT — wanted minimal repro
  - Bug 6 FIXED, commit `f6fb0cc` (meta-checker no longer collects function-local decls as module-scope)
- Bigger-picture: scrmlTS ran a radical-doubt debate on a fourth init-tier with NPM deps. Verdict: Phase 0 first (`^{}` polish + docs + `scrml vendor add`). NO npm escape hatch coming anytime soon; user accepted the verdict.
- Replaced `@_bootstrap = loadCm()` workaround with `^{ loadCm() }` direct-mount (Bug 6 unblocks this). Recompile: zero warnings, 9/9 smoke pass. Committed.

### Bug 3 + Bug 5 minimal repros (to scrmlTS)
- **Bug 3** — minimal repro `bug3-return-after-ternary-const.scrml`: one function `broken(base, limit)` with `const min = base < limit ? base : limit; return base + min`. Confirmed `return` dropped in isolation. Not a scope-capture issue as hypothesized.
- **Bug 5** — my earlier description was wrong: list **doesn't fail to re-render**, it **re-renders AND accumulates** (3 → 8 → 15 `<li>` after 0/1/2 clicks). Traced mechanism in compiled JS: wrapper div creation + `_scrml_lift` inside `_scrml_effect` that re-fires on every `@items` change. Fix hypothesis: move wrapper creation outside the effect.
- Sent `2026-04-22-0730-6nz-to-scrmlTS-bug-6-verified-and-bug-3-5-repros.md` with thumbs up on Bug 6 fix, both repros inline + sidecar, diagnoses + fix hypotheses.

### scrmlTS shipped Bug 1 + Bug 3 fixes
- Inbound `2026-04-22-scrmlTS-to-6nz-bug-1-and-bug-3-fixed.md`:
  - **Bug 1** (`41aa7c0`): string literal escapes were double-escaped at 8 emit sites. New helper `reemitJsStringLiteral` interprets escapes then `JSON.stringify`s.
  - **Bug 3** (`3778d76`): `<` in `base < limit` was being treated as a tag opener. Before-token check now distinguishes less-than (after value-producing token) vs tag-opener.
- Both verified locally in minimal repros against scrmlTS HEAD `3778d76`.
- Terse verification receipt sent.

### playground-four built (commit 4b97865)
- Scope per user direction ("more complex shape"): line-indexed buffer (`@lines: string[]`), keystroke-granular tree nodes, real branching, `u` (parent), `Ctrl+R` (youngest child), `-`/`=` (chronological back/forward), tree view rendered as string via depth-first walk with explicit stack.
- Data shape: `@nodes: [{id, parent, children[], kind, meta, lines[], cursorLine, cursorCol, time}]`. Every edit commits a new node. Tree preserves branches on undo-then-edit.
- Final smoke test: **14/14 pass**, zero pageerrors. Typing, mode toggle, undo, branch creation, `g-`/`g+` chronological nav, tree + buffer render all correct.

### Four new compiler bugs surfaced during playground-four construction
Minimal repros built, tested, sent to scrmlTS with inline + sidecar per the new reproducer rule.

- **Bug H** — `function name(arg: T) -> ReturnType { match … }` parses but codegen emits `function X(c) { (function() { … })(); }` with no leading `return` — always returns undefined. Siblings of Bug G but for `function` keyword (not `fn`).
- **Bug I** — Name-mangling bleed (Bug D family recurrence). Module-scope `function lines()` causes compiler to rename `n.lines` inside a `.map` callback's return record literal to `n._scrml_lines_N`. scrmlTS previously fixed the DOM-method-access path of Bug D; this record-literal-rhs path still hits. Triggered across three field names in playground-four (`lines`, `cursorLine`, `cursorCol`). Worked around by renaming helpers (`cnLines`, `cnLineNum`, `cnColNum`).
- **Bug J** — Markup `${fn(helper().field)}` emits no display wiring. Distinct from Bug 4. Fix 4 was for named derived reactive refs; this is about the interpolation-dep extractor not recursing into helper-function bodies to find indirect `@refs`. Worked around by inlining reactive refs in the interpolation: `${renderBuffer(@nodes[@current].lines, …)}`.
- **Bug K** — Synchronous reactive effect throwing out of `@x = …` halts the caller mid-function. `commit()` was losing 3 writes per keystroke. Design-question-shaped: `@x = value` looks like a statement but executes unbounded effects synchronously. Fix-directions proposed: try/catch effects (eventually-consistent), batch effects to microtask, or explicit `batch(…)` wrapper. Fixed on my side with a single atomic `@nodes = …` write.

### scrmlTS shipped Bug 4 + Bug 5 fixes mid-construction
- Inbound `2026-04-22-scrmlTS-to-6nz-bug-4-and-bug-5-fixed.md` (HEAD `adbc30c`):
  - **Bug 5** (`b37769c`): pure-keyed-reconcile blocks now skip the outer `_scrml_effect` wrap. Narrow scope — mixed case (for-lift + if in same logic block) still buggy, under follow-on.
  - **Bug 4** (`adbc30c`): `collectReactiveVarNames` now includes `reactive-derived-decl`; `ctx.derivedNames` threaded through `emitExprField`. Named derived reactive refs get proper DOM wiring.
  - scrmlTS pre-emptively flagged playground-four's profile ("heavy reactive derived chains + tree mutation — not battle-tested on deep trees"); offered to investigate minimal repros of any derived/stale oddities.
- Tested whether my Bug J was subsumed by the Bug 4 fix: reverted my buffer workaround to the original `curNode().lines` form. Still fails (buffer pane empty). Confirmed Bug J is distinct from Bug 4.
- Composed bundled message `2026-04-22-0940-6nz-to-scrmlTS-bugs-4-5-verified-playground-four-surfaces-4-new.md` with Bug 4 + Bug 5 verification + 4 new bug reports (H, I, J, K). Each bug has inline fenced ` ```scrml ` block and sidecar `.scrml` file next to the message per the new pa.md rule.

## Key decisions captured
- **pa.md rule change** — "no direct commits to main" replaced by "commits allowed after explicit user authorization in the current session; confirm before first commit and before push." Master authorized 2026-04-22; applied locally same session.
- **pa.md rule addition** — cross-repo bug reports must carry minimal reproducer (inline fenced or sidecar `.scrml`), self-contained, minimal, version-stamped, with expected vs actual.
- **NPM escape hatch NOT coming** — scrmlTS decided via debate to pursue Phase 0 (`^{}` polish + docs + `scrml vendor add` CLI) before reconsidering an npm-style init tier. User accepted the verdict ("thrilled to be wrong").
- **playground-four data shape** — `@nodes: [{id, parent, children[], kind, meta, lines[], cursorLine, cursorCol, time}]` with atomic immutable updates. This is effectively the shape the real editor's IR will need, minus the editor-side concerns (inline expansion markers, relevance annotations).

## Cross-repo traffic log
- **Out to scrmlTS (4 messages):** Bug G verified · CM6 probe + 6-bug batch · Bug 6 verified + Bug 3/5 repros · Bugs 4/5 verified + 4 new bug reports.
- **Out to master (2 messages):** pa.md commit-auth relaxation request · confirmation that both edits applied.
- **In from scrmlTS (4 messages, all archived):** Bug G fixed · unblocked status (6-bug triage + radical-doubt outcome) · Bug 1 + Bug 3 fixed · Bug 4 + Bug 5 fixed.
- **In from master (1 message, archived):** pa.md edits authorized (combined).

## Current state at close
- `main` @ `7bd7248` — 5 new commits this session (c4a742b, 1f18fe9, 4b97865, 7bd7248 + the earlier 7292df6/e900547/048bc25 triple).
- Working tree clean except in-progress hand-off.md (being written now).
- `handOffs/incoming/`: empty (only `read/` subdir with 4 archived inbounds).
- `user-voice.md`: no contentful entries yet this repo.

## Open items for next session
- **master-list.md stale** (S5, "no implementation yet") — 4 working playgrounds now + working CM6 mount. 10-min refresh.
- **.claude/maps/ stale** (S2 cold run, pre-playgrounds). Worth a project-mapper incremental refresh.
- **default-bindings.md v0.2 → v0.3 rewrite** — tracked in master-list §E, not blocked on anything.
- **Playground-five target undecided.** Suggested next (per mid-session discussion): CM6 + vim-modes integration — merging playground-two state machine + hjkl onto playground-three's real CM6 surface. Would move us from "toy textareas" to "actually driving CM6."
- **Awaiting scrmlTS triage** on 4 new bugs (H, I, J, K). And on the Bug 5 mixed-case follow-on.
