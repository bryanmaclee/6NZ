# Z-Motion Specification

**Version:** 0.3 (draft)
**License:** CC0 1.0 Universal (public domain)
**Status:** Core model locked. v0.3 adds multi-key hold sets, left-hand
roll mirror, and hand-pairing rule. Default binding table drafted in
`default-bindings.md` — recommendation, not requirement.

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
- **Binding** — a specific `[hold-set](roll-sequence)` pair mapped to a
  specific motion command. Bindings are concrete, not generalized.
- **Hold set** — the ordered sequence of hold-keys that have crossed
  the hold threshold and remain depressed when the roll phase begins.
  A hold set with one key is the common case; a set with N ≥ 2 keys is
  a **multi-key hold**, and the order is significant (`[sd]` ≠ `[ds]`).
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
gesture       := hold-phase roll commit
hold-phase    := hold-entry+
hold-entry    := KEYDOWN(k) ∧ (held ≥ holdThreshold)
hold-set      := ordered list of hold-entry keys, in threshold-cross order
roll          := roll-key+
roll-key      := KEYDOWN(k) KEYUP(k)   where k is not in hold-set
commit        := KEYUP(any k in hold-set)
              |  roll-window-timeout
```

### 6.1 Hold set formation

The hold set is built incrementally. Each key pressed and held past
`holdThreshold` joins the hold set, in the order it crossed the
threshold. A single-key hold set is the common case; a set of N ≥ 2
keys is a **multi-key hold**, and the order of keys in the set is a
**significant part of the binding identity** — `[sd]` and `[ds]` are
two distinct bindings that MAY be mapped to unrelated motions.

The hold set **freezes** the moment the first roll-key press arrives.
From that point on, any new keypress is interpreted as a roll-key even
if it is held long enough to cross the threshold. This keeps the
grammar unambiguous: once a gesture enters the roll phase, it cannot
transition back to collecting hold-keys.

### 6.2 Commit

A gesture commits when **either**:

1. Any key in the hold set is released (`KEYUP`), **or**
2. The roll window expires after the last roll key.

On commit, the editor executes the bound motion command as a single
atomic operation (one undo step, one macro event). Remaining keys in
the hold set, if any, are released without triggering further gestures.

### 6.3 Abort

A gesture aborts if any of the following happens before commit:

- No key has crossed the hold threshold by the time any pending hold
  key is released (fast rollover — the keys commit as ordinary typed
  characters in press order; no motion executes)
- A modifier key (`Ctrl`, `Alt`, `Meta`) is pressed mid-gesture, unless
  the binding explicitly accepts modifiers
- The editor loses focus or changes context mid-gesture

Aborted gestures MUST NOT leave partial state visible to the user.

### 6.4 Release without roll

If every key in the hold set is released without any roll-key having
been pressed, the editor commits the held keys as ordinary typed
characters in press order. No gesture occurred. Holding keys
thoughtfully — or abandoning a half-formed gesture — does not destroy
your text.

## 7. Binding model

**Each specific `[hold-set](roll)` pair is its own binding.** The
grammar does not generalize: `[w](jkl)` and `[w](uio)` are two distinct,
independent gestures that can be bound to two unrelated motions.
Multi-key holds extend this further — `[sd](jkl)` and `[ds](jkl)` are
two more distinct bindings, unrelated to `[s](jkl)`, `[d](jkl)`, or
each other (see §6.1 and §8.3).

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

### 8.1 Left-hand mirror

The same convention applies in mirror image to the left-hand home row:

- `a` alone = 1 right (pinky starts, roll proceeds outward toward the
  index finger — physically rightward across the left half of the
  keyboard)
- `f` alone = 1 left (index starts, roll proceeds outward toward the
  pinky)
- `d` is the pivot (convention: `d` alone is unbound in defaults)
- Compound rolls, outward from the starting finger:
  - `as` = 2 right, `asd` = 3 right, `asdf` = 4 right
  - `fd` = 2 left, `fds` = 3 left, `fdsa` = 4 left

The left-hand rolls exist so default bindings can place the hold key on
one hand and the roll phase on the other (see §8.2). The letters
`a s d f` are positional stand-ins just like `j k l ;` — non-QWERTY
layouts SHOULD re-map them.

### 8.2 Hand-pairing rule

Default bindings SHOULD place the hold key(s) and the roll key(s) on
**opposite hands**. A right-hand hold drives left-hand rolls; a
left-hand hold drives right-hand rolls. This rule exists because:

- On an ordinary keyboard, same-hand hold-plus-roll is cramped and in
  some finger-column layouts is physically impossible (the hold key
  and a roll key may be the same finger — e.g. `h` and `j` on the
  right index).
- On a split keyboard, same-hand gestures leave the other half idle
  and forfeit the ergonomic win of cross-hand parallelism.
- Cross-hand gestures keep the hold-hand stable while the roll-hand is
  mobile, which matches how fingers actually work.

The rule applies to **default binding tables only**. Users configuring
their own bindings MAY violate it when their own hand topology allows.

### 8.3 Multi-key hold directionality

A multi-key hold (§6.1) inherits the §8 directionality from its own
press order, as if the hold set itself were a small roll:

- `[as]` is a rightward-rolled hold (left-hand pinky → ring; physically
  right) → recommended for "forward" semantics within its family.
- `[sa]` is a leftward-rolled hold → recommended for "back" semantics.
- `[jk]`, `[kl]` rightward on the right hand; `[kj]`, `[lk]` leftward.
- `[sd]` rightward; `[ds]` leftward.

Multi-key holds whose keys span both hands, or whose keys are not a
contiguous home-row sequence, have no defined direction under this
convention — they are still legal bindings, but default tables SHOULD
NOT use them to encode forward/back.

This directional convention applies only to the hold phase. The roll
phase that follows still uses its own §8/§8.1 directionality
independently.

## 9. Default binding table

A draft default binding table is published alongside this spec in
`default-bindings.md`. It is a recommendation, not a requirement —
implementations are free to ship any default table they want, but
SHOULD publish the one they use.

The draft uses two orthogonal binding families layered on the same
grammar:

- **Letter-hold / home-row-roll.** A letter whose mnemonic is the
  motion unit (e.g. `[w]` = word) holds, while the roll phase supplies
  magnitude and direction via §8 home-row rolls. Example: `[w](jk)` =
  2 words forward.
- **Numeric count-hold / vim-letter roll.** A digit `1`–`9` holds, and
  the roll phase is a single vim motion letter. `[3](w)` = 3 words
  forward, equivalent to Vim's `3w`. Counts ≥ 10 are out of scope —
  users who need larger counts SHOULD fall back to traditional Vim
  normal mode (see §10).

Both families coexist because every `[hold-set](roll)` pair is an
independent binding (§7.2). A user with strong Vim muscle memory can
live entirely in the count family; a user who prefers pure rolls can
live entirely in the letter family; most will mix.

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
4. Treat each `[hold-set](roll)` pair as an independent binding with no
   pattern generalization (§7.2). Multi-key hold sets MUST be
   distinguished by press order (§6.1): `[sd]` and `[ds]` are distinct.
5. Allow any key to be designated as a hold key (§7.1)
6. Ship a default binding table and document it

A conforming implementation MAY:

- Provide traditional Vim normal/visual modes alongside z-motion
- Add operator composition experimentally (§10.1)
- Provide visual feedback for in-progress gestures
- Extend the binding model with chords, modifiers, or macros, provided
  the base grammar remains intact

## 12. Change log

- **v0.3 (2026-04-11)** — Multi-key holds and left-hand mirror.
  - §3: added "hold set" and "multi-key hold" terms
  - §6: grammar extended to support hold sets; added §6.1 defining
    hold set formation, freeze rule, and significance of press order;
    §6.2–6.4 renumbered and rewritten for multi-key language
  - §7: binding is `[hold-set](roll)`; multi-key distinction noted
  - §8.1: left-hand home-row roll convention (mirror of right-hand)
  - §8.2: hand-pairing rule — hold on one hand, roll on the other
  - §8.3: multi-key hold directionality — hold-set press order inherits
    §8 convention
  - §9: no longer deferred — `default-bindings.md` draft published;
    numeric count-hold family recognized alongside letter-hold family
  - §11: conformance updated for hold-set language
  - Backward compatible: every v0.2 binding remains valid (a single-key
    hold set is still a valid hold set)
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
