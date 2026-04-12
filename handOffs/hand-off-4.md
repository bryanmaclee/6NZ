# 6nz — Session 4 Hand-Off

**Date:** 2026-04-11
**Next hand-off filename:** `handOffs/hand-off-4.md`
**Session closed at:** `main` @ `f66e23b` — pushed to `origin/main`

## Session start state
- Session 3 rotated to `handOffs/hand-off-3.md`
- Working tree clean on `main` @ `c2f8c4f`, 3 commits ahead of `origin/main`
- `handOffs/incoming/` empty
- Maps (`.claude/maps/`) fresh as of `740a75b` (session 2 cold run)
- No source code yet — design phase

## Session work

1. **README.md stub resolved** (`b034f6a`). Non-compliance flag from session 2 (stub-or-real?) — chose real, replaced `# 6nz` with a short current-truth public-facing summary. Status, what's here, licensing split. No aspirational structure.

2. **Task #6 — vim→z-motion default binding table drafted** (`ded3645`, later heavily revised). First pass authored `z-motion-spec/default-bindings.md` v0.1 walking canonical vim motions; revised in-session to v0.2 as design evolved (see below).

3. **SPEC bumped v0.2 → v0.3 → v0.4.** Multiple in-session revisions as the user introduced new constraints:
   - **v0.3** (`ded3645`): multi-key hold sets (ordered, press-order significant, `[sd]` ≠ `[ds]`), left-hand roll mirror (`a s d f` convention), hand-pairing rule (default bindings put hold and roll on opposite hands), multi-key hold directionality inherits §8 press-order. Resolved the v0.1 `[h]+[j]` same-finger-same-hand bug in char motion. Added multi-key vertical motion `[sd]`/`[ds]`.
   - **v0.4** (`f66e23b`): **major simplification** — replaced the timer-based hold-threshold / calibration / roll-window model with **release-order classification**. No clocks. A candidate is a HOLD iff another key was pressed and released during its lifetime; a ROLL iff an earlier candidate is still down at keyup; a TAP otherwise. Dropped FAMILY 2 (numeric count-hold) as redundant with compound rolls and incompatible with "Shift stays out of the roll phase." Added §10.3 normal-mode toggle keys. Breaking change vs v0.3: calibration conformance removed, `holdThreshold`/`rollWindow` fields gone; binding identities unchanged. `default-bindings.md` marked partially stale with a prominent v0.4 status notice (clean rewrite deferred).

4. **Browser prototype `proto/z-motion-feel/`** (`da954e0`, revised in-session). First non-spec touch of the input grammar. Single HTML file, vanilla JS, ~475 lines, no build. Implements SPEC v0.4 release-order classification, letter-family bindings (`[h]` char, `[w]` word-start, `[e]` word-end, `[j]`/`[k]` vertical, `[a]` line anchors), and the `[f]` normal-mode toggle with eager promotion on first hjkl keydown. Initial version implemented the v0.3 timer model with calibration; user typed with it, reported "hold threshold is making motions awkward, the keyboard already gets things right on rollover," which directly drove the v0.4 simplification.

5. **`proto/` carve-out established.** Scrml-only rule (saved as durable memory last session) now has one documented exception: `6nz/proto/` is a throwaway test-ground for concept prototypes in any language until scrmlTS exposes the compiler API. Nothing under `proto/` ships; anything else in the repo is still scrml-only. `proto/README.md` explains the scope.

6. **Cross-repo message sent to scrmlTS**: `compiler API exposure blocks all real 6nz implementation work` (FYI, no deadline). Enumerates the five minimum compiler-API surfaces 6nz needs (programmatic parse, incremental compile, JS emission + source maps, diagnostics stream, PWA-embeddability), notes the scrml-only constraint is load-bearing, points at this session's SPEC v0.4 and prototype as evidence design is converging faster than the compiler is exposing surface area. File: `scrmlTS/handOffs/incoming/2026-04-11-1900-6nz-to-scrmlTS-compiler-api-blocks-all-6nz-work.md`.

7. **Memory additions.** Three durable memory entries landed this session: (a) "writing code IS debugging code" — the cursor-as-virtual-PC / step-into-out / auto-collapse philosophy is load-bearing on every editor feature decision. (b) "always look for config options" — for any binary design choice, default to making it user-configurable; matches the chad-centered / total-configurability principle. (c) Updated the existing "scrml-only constraint" memory with the `proto/` carve-out. All three in `~/.claude/projects/-home-bryan-scrmlMaster-6NZ/memory/`.

8. **Editor concept surface expanded.** User shared several large design ideas that didn't land as code/spec this session but are captured in conversation context and need future expansion: (a) **Focus-centered viewport as relevance view** — the focused edit region is 3–5 lines + 1–2 context lines on each side (LINE-level centering, not character — correction from the editor-README's "cursor at screen center" wording), and the rest of the screen surfaces *semantically relevant* lines (declarations of symbols used on the cursor line, etc.) rather than file-continuous scrolling. The viewport is a composed view, not a scrolling window. (b) **Inline-everything file navigation** — scrml's logical nesting means files are a packaging choice, not a semantic boundary. 6nz treats the project as a single conceptual document, inlining imported components where referenced. Two traversal modes: *lexical* (up/down/left/right) and *logical* (step-into / step-out / step-over, same mental model as debugging). Auto-collapse is cursor-position-driven, never manually managed. (c) **Editor IR model** — decouple on-disk canonical scrml from in-editor representation. The editor works in an IR that supports inline expansion, relevance composition, logical traversal. Save = IR → canonical → disk; load = disk → canonical → IR. (d) **Public `:km@username` config sharing** — any non-sensitive config publishable by username, versioned, stackable secondary layers, sanitization on upload. Use case: sit at someone else's computer, pull your config in, work in your own environment immediately. (e) **Split-block-to-file** as a cheap IR operation.

## Key decisions captured (not yet in docs)

Things the user locked this session that need to land in the next spec or doc edit pass:

- **Vertical line motion:** Option A — single-letter hold `[j]` down, `[k]` up, count via left-hand roll (`[j](a|as|asd|asdf)`). Caps at 4 per gesture; larger counts fall through to the normal-mode toggle. `[j]`/`[k]` as primary holds (no multi-key `[sd]`/`[ds]` needed for this case).
- **Semantic landmark motions (seed list):** blank line, matching indent, line containing `{` (generalizable to any nominated char), fold boundary. Down/up direction mirrors existing families. Hold-letter assignments TBD.
- **Operator composition:** operator-first multi-key hold (`[dw](j)`, `[d$](k)`, `[dd](k)`, `[yw](j)`). Shifted-letter operator siblings `[D]`/`[C]`/`[Y]` cover vim's `D`/`C`/`Y`. Deferred to SPEC v0.5+ (in §10.1 stub now).
- **Latch keys:** one per hand. Multi-key latching. Release on roll commit (not latch release). Fully consumed (not typed). Activation immediate on KEYDOWN (no threshold). Key assignments deferred.
- **Normal-mode toggle keys:** one per hand. Scope is the *whole* vim normal-mode vocabulary (motions + edits). Hold-while-active (not tap-to-toggle). Prototype uses `[f]` for left hand with hjkl only; right-hand key + full vocabulary TBD.
- **Shift is a hold-identity modifier only.** `[a]` ≠ `[A]`. Shift is transparent to the roll phase; leaks into roll are stripped by the parser (self-correcting behavior) — SPEC §11 doesn't yet capture the stripping decision, needs a note.
- **`[a]` and `[h]` allocations stay as-is.** `[a]` = line anchor hold (mnemonic weak but keep); `[h]` = char motion hold with left-hand rolls (Vim `h`=left mnemonic preserved via the roll direction, not the hold).

## Open questions still parked

- Still-parked normal-mode details: key assignments, exact coexistence semantics with z-motion gestures while the toggle is held.
- Still-parked latch details: key assignments.
- Semantic landmark motions: full vocabulary (beyond seed), hold-letter allocation, directionality.
- Vertical motion counts > 4: fall through to normal-mode toggle confirmed; no dedicated z-motion primitive for "many lines at once."
- Shift-leak behavior: user said "strip shift from roll"; this needs an explicit SPEC §5 or §11 note in a later revision.
- `[f]` conflicts with the future find-char hold family in `default-bindings.md`. When find-char lands, either the normal-mode toggle moves off `f` or find-char gets reassigned. Flagged in the prototype, not yet in the spec.

## Commits this session
- `b034f6a` — `README.md`: replace stub with current-truth summary
- `ded3645` — `z-motion-spec`: v0.3 multi-key holds + default bindings v0.2
- `da954e0` — `proto/z-motion-feel`: throwaway browser tester for the z-motion grammar
- `f66e23b` — `z-motion-spec`: v0.4 — release-order classification

Pushed to `origin/main` at session close.

## Notes for next session

- SPEC is at v0.4. Next expected bump is v0.5 — operator composition moving from sketch to lock, or landmark motions / latch formalization.
- `default-bindings.md` is still labeled v0.2 but marked partially stale against SPEC v0.4 at the top. A clean v0.3 rewrite is a focused task when you're ready — remove FAMILY 2, add `[j]`/`[k]` vertical, update directionality references.
- The prototype `proto/z-motion-feel/index.html` is the canonical "does this feel right" test bed. Add more bindings or new state transitions to it when testing new ideas. It's throwaway — rewrite freely.
- The scrmlTS inbox message is FYI — no reply is expected, but a reply may come through `6nz/handOffs/incoming/` eventually. Check at next session start per `pa.md` step 3.
- `.claude/maps/` is still fresh as of `740a75b` (session 2). The repo grew this session (`proto/`, revised spec files) but nothing drastic changed the topology. Incremental refresh is optional; cold re-run is not needed.
- Editor concept surface (focus viewport, inline-everything, editor IR, keymap sharing, landmark motions) is the biggest source of future spec work and can begin anytime — none of it is blocked by the compiler.
- Memory now has three entries beyond session 3's scrml-only constraint: "writing code IS debugging code," "always look for config options," and the scrml-only constraint with the `proto/` carve-out. Honor them without prompting.

## Upstream awareness (from user-voice, not this repo's work)
- scrmlTS session 4 committed to a multi-phase **structured expression AST migration** (scope comparable to original compiler bring-up). Lin enforcement parked until Phase 2 lands. Pushes compiler-API availability further out — the cross-repo message sent this session makes the 6nz dependency visible in scrmlTS roadmap decisions.
