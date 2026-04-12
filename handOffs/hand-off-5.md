# 6nz — Session 5 Hand-Off

**Date:** 2026-04-12
**Next hand-off filename:** `handOffs/hand-off-5.md`

## Session start state
- Session 4 rotated to `handOffs/hand-off-4.md`
- Working tree clean on `main` @ `71da0ee`
- `handOffs/incoming/` empty
- Maps (`.claude/maps/`) fresh as of `740a75b` (session 2 cold run)
- No source code yet — design phase
- SPEC at v0.4; `default-bindings.md` at v0.2 (marked partially stale)

## Session work

1. **SPEC bumped v0.4 → v0.5: sustained gestures.** The hold key's roll phase is now a stream, not a single shot. While the hold is active, the user can issue repeated taps (`g,g,g`) or repeated rolls (`jkl,jkl,jkl`) — each fires its binding independently. Roll events delimited by quiescence. Every v0.4 single-shot gesture is a sustained gesture with one roll event (fully backward compatible). New sections: §6.4, §6.4.1–§6.4.4. Grammar updated in §6, commit semantics updated in §6.2.

2. **Undo hold family designed (§6.4.2, §6.4.4).** Three tiers: granular `[u](g)` (finest-grain, tap-repeatable), motion-boundary `[u](b)`, undo-tree `[u](t)` (visual pane). Sustained gestures make this natural — hold `[u]`, tap until satisfied, release. Insert-mode undo granularity spec'd: motion boundaries replace vim's mode-transition boundaries. Normal-mode `u` unchanged (6nz is a superset of nvim).

3. **`editor-architecture.md` created.** Full design reasoning for the five S4 editor concepts that were previously compressed into one-liners in the S4 hand-off: (1) focus-centered viewport as relevance view, (2) inline-everything file navigation with logical traversal, (3) editor IR, (4) public config sharing `:km@username`, (5) split-block-to-file. Each section has the design reasoning, the constraints, the interactions with other systems, and the open questions.

4. **Normal-mode toggle key analysis (§6 of editor-architecture.md).** New constraint from user: keys must be symmetrical, home row, index or middle finger — NOT t/y (uncomfortable reach). Collision analysis shows every comfortable home-row index/middle key is already claimed by z-motion families. Tension documented, not resolved.

5. **`master-list.md` updated from S3 → S5.** Was stale — still referenced v0.1 spec, missing proto/, missing all S4/S5 design work. Now reflects SPEC v0.5, sustained gestures, undo family, editor-architecture.md, current open work items.

## Key decisions captured

- **6nz is a superset of nvim** — everything that works in nvim works in 6nz. Normal-mode undo works as expected. Z-motion features are additions, not replacements. (Already stated in §10 but reinforced as a first-class design principle this session.)
- **Sustained gestures** — hold key acts as a mode key; roll phase is a stream of events, not a single gesture. General grammar-level mechanic, not undo-specific.
- **Undo granularity tiers** — granular (per-keystroke/word), motion-boundary (edits between cursor moves), undo-tree (full branching history). Motion boundary replaces vim's insert-mode-session as the natural undo group in z-motion.
- **Specific key combos in undo examples are illustrative, not locked** — user explicitly noted these are example assignments.
- **Redo is `[U]` (shifted undo hold)** — shift determines hold identity at keydown; shift is released immediately after. No ergonomic penalty. Mirrors undo family: `[U](g)` redo granular, `[U](b)` redo to boundary, `[U](t)` redo tree.
- **Shift on hold keys is captured at keydown, releasable immediately** — clarification of SPEC §9/§11 "shift is a hold-identity modifier." The shifted identity is locked when the key goes down; shift does not need to be held throughout the gesture.

## Cross-repo messages sent
- `needs: push` to master PA — `2026-04-12-1600-6nz-to-master-needs-push.md`. 6nz + scrml-support affected.
