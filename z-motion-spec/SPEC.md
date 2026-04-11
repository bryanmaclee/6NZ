# Z-Motion Specification

**Version:** 0.2 (draft)
**License:** CC0 1.0 Universal (public domain)
**Status:** Core model locked. Default binding table (vim→z-motion)
unresolved (§9).

---

## 1. Introduction

Z-motion is a keyboard input grammar for modal text editors. It provides
**insert-mode equivalents** of the motions that traditional Vim offers only
in normal and visual modes. In a Z-motion editor, the user never has to
leave insert mode to navigate, select, or reposition the cursor.

The model is built on a specific editor behavior — **commit-on-release**
— which lets any held key retroactively become a modifier. Combined with a
short **hold threshold** and a physical **roll** gesture, the result is a
dense, user-configurable motion grammar that lives inside insert mode
without conflicting with normal typing.

This specification defines the input model, the grammar of a gesture, the
semantics an implementation must provide, and the calibration requirement.
It does not mandate default keybindings; a companion document provides a
suggested default table.

## 2. Purpose and positioning

Traditional Vim separates *typing* from *motion*. To move one word right,
a Vim user presses `Esc`, then `w`, then `i`. The mode switch is cheap for
experts but breaks the flow of composition for everyone else, and it is
the primary reason Vim has a reputation for difficulty.

Z-motion removes the mode switch. The user stays in insert mode forever.
Motions happen *while* typing — a held key plus a finger roll executes a
navigation command and returns control to typing, all without any visible
mode change.

This is not a Vim replacement. Z-motion implementations SHOULD preserve
traditional Vim normal/visual modes for users who want them. Z-motion is
an **addition**: the insert-mode motion layer Vim never had.

## 3. Terminology

- **Commit-on-release** — the editor behavior of committing a typed
  character on `KEYUP`, not `KEYDOWN`. See §4.
- **Hold threshold** — the minimum time a key must be continuously
  depressed before the editor considers it a candidate modifier (a
  potential z-motion hold key). Editor- and user-configurable.
- **Hold key** — a key that, during a z-motion gesture, is held down and
  modifies the interpretation of subsequent keys.
- **Roll** — a sequence of one or more keys pressed and released while a
  hold key is depressed past the hold threshold.
- **Roll key** — a single key inside a roll.
- **Roll window** — the maximum idle time between successive roll keys
  before the gesture commits.
- **Gesture** — a complete `[hold](roll)` pair from the moment the hold
  key passes the hold threshold until commit.
- **Binding** — a specific `[hold-key](roll-sequence)` pair mapped to a
  specific motion command. Bindings are concrete, not generalized.
- **Calibration** — the process of profiling a user's natural typing
  speed to set initial hold-threshold and roll-window values.

## 4. The commit-on-release mechanism

Z-motion depends on one property the editor MUST provide:

> **The editor does not commit a typed character until the key is
> released.**

Under this rule, every keystroke is a two-phase event: `KEYDOWN` places
the key in a tentative state; `KEYUP` either commits the character (if
nothing modified it) or discards it (if the key was interpreted as a
z-motion hold).

This property is what makes *any* key eligible to become a modifier
retroactively. A normal editor decides at `KEYDOWN` whether a key is a
character or a modifier; 6nz and other conforming editors defer that
decision until release.

### 4.1 Why this doesn't break typing

Commit-on-release alone would break fast typing: natural touch typing
overlaps keypresses (you press the next key before releasing the previous
one), and any naive "if two keys overlap, the first is a modifier" rule
would misfire constantly. The **hold threshold** (§5) solves this by
requiring the first key to be depressed *past a configurable duration*
before it can be interpreted as a hold. Fast rollover during typing
stays under the threshold; deliberate holds cross it.

## 5. Disambiguation: hold threshold + calibration

A key only becomes a z-motion hold when it has been continuously
depressed for at least `holdThreshold` milliseconds *and* at least one
other key is pressed while the first is still held. If either condition
fails, the keystrokes commit as ordinary characters on release, with
normal typing rollover.

### 5.1 Calibration is mandatory

A single global default for `holdThreshold` cannot serve all users: a
fast typist's rollover intervals are shorter than a slow typist's
deliberate holds, and vice versa. A conforming implementation MUST
provide a **calibration tool** that profiles the user's typing speed and
sets initial timing weights — at minimum `holdThreshold` and `rollWindow`
— tuned to that user's hands.

Calibration SHOULD:

- Run on first launch and be re-runnable on demand
- Measure the user's natural rollover intervals across common bigrams
  and trigrams
- Set `holdThreshold` at a safe margin above the user's observed maximum
  rollover interval
- Set `rollWindow` at a comfortable multiple of the user's observed
  median roll speed
- Expose the resulting weights for manual adjustment

Calibration output is user state, not spec state. Implementations are
free to choose the specific statistics and margins.

## 6. Grammar

A gesture is a finite sequence of physical events:

```
gesture       := hold-crosses-threshold roll commit
hold-down     := KEYDOWN(hold-key)
hold-crosses-threshold := hold-down ∧ (held ≥ holdThreshold)
roll          := roll-key+
roll-key      := KEYDOWN(k) KEYUP(k)   where k ≠ hold-key
commit        := KEYUP(hold-key)
              |  roll-window-timeout
```

### 6.1 Commit

A gesture commits when **either**:

1. The hold key is released (`KEYUP(hold-key)`), **or**
2. The roll window expires after the last roll key.

On commit, the editor executes the bound motion command as a single
atomic operation (one undo step, one macro event).

### 6.2 Abort

A gesture aborts — producing no motion *and* no typed character from the
hold key — if:

- The hold key is released before the hold threshold is reached AND at
  least one other key is already held (ambiguous rollover; editor MAY
  choose to commit the hold key as a character instead, per calibration)
- A modifier key (`Ctrl`, `Alt`, `Meta`) is pressed mid-gesture, unless
  the binding explicitly accepts modifiers
- The editor loses focus or changes context mid-gesture

Aborted gestures MUST NOT leave partial state visible to the user.

### 6.3 Release without roll

If a key is held past the hold threshold and then released with no
other key having been pressed, the editor commits it as an ordinary
typed character. No gesture occurred. Holding a key thoughtfully does
not destroy your text.

## 7. Binding model

**Each specific `[hold](roll)` pair is its own binding.** The grammar
does not generalize: `[w](jkl)` and `[w](uio)` are two distinct,
independent gestures that can be bound to two unrelated motions.

This is an intentional design choice. It:

- Maximizes the motion vocabulary (thousands of distinct gestures per
  hold key)
- Lets users author their own motion grammar from the ground up
- Keeps the implementation trivial — gestures are hashmap keys

Implementations MUST ship with a sensible default binding table so new
users have a working motion vocabulary on first launch. The default
table is defined in a companion document, not in this spec (§9).

### 7.1 User configuration

Every binding MUST be user-replaceable. The configuration surface MUST
allow:

- Adding a new `[hold](roll)` binding
- Overriding an existing default binding
- Removing a default binding
- Designating any key as a hold key (no key is privileged by the
  mechanism)

### 7.2 No generalization

An implementation MUST NOT synthesize bindings by pattern. If the user
binds `[w](j)` to "1 word right" and `[w](jk)` to "2 words right," an
unbound `[w](jkl)` does NOT automatically become "3 words right." It is
unbound until the user or the default table binds it.

(Default tables may populate a regular family of bindings for ergonomic
reasons, but the mechanism itself does not generalize.)

## 8. Directionality convention

Although the binding model is fully user-configurable, the spec
**recommends** a directional convention for the home-row roll keys to
keep defaults consistent across implementations:

- **Direction is physical roll direction across the home row.** Rolling
  fingers right moves the cursor right; rolling left moves it left.
- **Single-key mirror:** `j` alone = 1 right; `l` alone = 1 left. `k` is
  the pivot (convention for `k` alone: unbound in defaults).
- **Multi-key rolls compound outward:**
  - `jk` = 2 right, `jkl` = 3 right, `jkl;` = 4 right
  - `lk` = 2 left, `lkj` = 3 left, `;lkj` = 4 left
- **Hold key supplies the unit.** `[h](jk)` = 2 characters right; `[w](jk)`
  = 2 words right; `[b](jk)` would be redundant — see the vim-mapping
  document for the canonical defaults.

The letters `j`, `k`, `l` are **positional stand-ins**, not semantic
directions. A user with a different keyboard layout (Dvorak, Colemak) or
different hand preference SHOULD re-map these; the directionality is
physical, not alphabetical.

This convention is normative for default binding tables only. Users who
configure their own bindings are free to ignore it.

## 9. Default binding table (deferred)

The spec intentionally does NOT lock a default binding table in v0.2.
Authoring the default table is a separate task: walk the canonical vim
motion set (w, b, e, f, t, F, T, h, j, k, l, 0, $, ^, gg, G, {, }, (, ),
%, *, #, n, N, iw, aw, i", a(, etc.) and propose a logical z-motion
binding for each.

That document will be published alongside this spec as
`default-bindings.md` once drafted. It is a recommendation, not a
requirement — implementations are free to ship any default table they
want, but SHOULD publish the one they use.

## 10. Composition with existing Vim features

Z-motion is designed as a **superset** — it coexists with traditional
Vim normal/visual modes rather than replacing them. An implementation
MAY provide traditional Vim modes alongside z-motion, and the two MUST
NOT interfere:

- In insert mode: z-motion gestures are active; commit-on-release
  applies; taps below the hold threshold are ordinary characters.
- In normal/visual mode (if present): traditional Vim motions apply;
  z-motion is inactive; commit-on-release is moot (no characters are
  being typed).

A user who prefers pure z-motion MAY configure the editor to omit
normal/visual modes entirely and stay in insert mode always. A user who
prefers pure Vim MAY disable z-motion gestures and get a conventional
Vim experience. Both MUST be supported.

### 10.1 Operators (d, c, y)

Operator composition with z-motion is **deferred to v0.3.** The design
space is:

- `d` held, then a z-motion gesture completes → delete the range
- Or: `[d](w)(jk)` as a compound gesture — hold d, tap w, roll jk
- Or: a dedicated "operator hold" phase

The right answer depends on calibration and ergonomics. v0.2
implementations MAY experiment.

### 10.2 Text objects

Text objects (`iw`, `a"`, `i(`, etc.) are untouched by z-motion in v0.2.
They continue to work inside normal/visual mode as in Vim.

## 11. Conformance

A conforming Z-motion implementation MUST:

1. Provide commit-on-release for typed characters (§4)
2. Implement the grammar in §6, including commit, abort, and
   release-without-roll rules
3. Provide a calibration tool that profiles the user and sets initial
   `holdThreshold` and `rollWindow` (§5.1)
4. Treat each `[hold](roll)` pair as an independent binding with no
   pattern generalization (§7.2)
5. Allow any key to be designated as a hold key (§7.1)
6. Ship a default binding table and document it

A conforming implementation MAY:

- Provide traditional Vim normal/visual modes alongside z-motion
- Add operator composition experimentally (§10.1)
- Provide visual feedback for in-progress gestures
- Extend the binding model with chords, modifiers, or macros, provided
  the base grammar remains intact

## 12. Change log

- **v0.2 (2026-04-11)** — Major rewrite against corrected model.
  - Added commit-on-release as the enabling mechanism (§4)
  - Added hold threshold + mandatory calibration (§5)
  - Locked directional convention: physical roll, `j`=right, `l`=left
    (§8); removed v0.1's Vim `l=right` confusion
  - Framed z-motions as insert-mode equivalents of Vim normal/visual
    motions (§2)
  - Locked binding model: specific per-gesture, no generalization (§7)
  - Deferred default binding table to companion document (§9)
  - Deferred operator composition to v0.3 (§10.1)
- **v0.1 (2026-04-11)** — Initial draft. Superseded.
