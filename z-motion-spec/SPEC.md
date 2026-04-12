# Z-Motion Specification

**Version:** 0.5 (draft)
**License:** CC0 1.0 Universal (public domain)
**Status:** v0.5 introduces **sustained gestures** — while a hold is
active, the roll phase is a stream of events, not a single shot. Each
roll event fires its binding independently. This enables hold-as-mode
patterns (undo, search, marks) where the user repeats or varies actions
without releasing the hold key. Built on v0.4's release-order
classification (no clocks, no calibration).

---

## 1. Introduction

Z-motion is a keyboard input grammar for modal text editors. It provides
**insert-mode equivalents** of the motions that traditional Vim offers only
in normal and visual modes. In a Z-motion editor, the user never has to
leave insert mode to navigate, select, or reposition the cursor.

The model is built on a specific editor behavior — **commit-on-release**
— which lets any held key retroactively become a modifier. Combined with
**release-order classification** (§5) and a physical **roll** gesture,
the result is a dense, user-configurable motion grammar that lives inside
insert mode without conflicting with normal typing.

This specification defines the input model, the classification rule, the
grammar of a gesture, and the semantics an implementation must provide.
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
- **Candidate** — a key that has been pressed and has not yet been
  classified. A candidate becomes a tap, a hold, or a roll at its
  keyup (see §5).
- **Tap** — a candidate classified as an ordinary typed character. Its
  character is inserted into the text at keyup.
- **Hold** — a candidate classified as a gesture modifier. No character
  is typed; the gesture's binding is looked up and executed at the
  hold's keyup (its *commit*).
- **Roll** — a candidate classified as a constituent of an active
  gesture. No character is typed; the key's identity contributes to
  the binding lookup.
- **Release order** — the order in which keys are released relative to
  the keys pressed during their lifetime. Release order is the sole
  disambiguator between typing and gestures; see §5.
- **Gesture** — the complete event sequence from the first keydown of a
  hold to that hold's keyup, including any rolls that classified during
  its lifetime.
- **Binding** — a specific `[hold-set](roll-sequence)` pair mapped to a
  motion command. Bindings are concrete, not generalized.
- **Hold set** — the ordered sequence of hold keys in a gesture, in
  press order. A hold set with one key is the common case; a set with
  N ≥ 2 keys is a **multi-key hold**, and the order is significant
  (`[sd]` ≠ `[ds]`).

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
overlaps keypresses (you press the next key before releasing the
previous one). A naive "if two keys overlap, the first is a modifier"
rule would misfire constantly on every rollover.

The disambiguator is **release order**, not overlap. Typing and
gestures have different release-order signatures:

- **Typing `he`**: `h` is pressed, `e` is pressed (while `h` still
  down), `h` is released first, then `e`. The first-pressed key is
  also the first-released. No key was pressed *and released* during
  `h`'s lifetime. Both are taps.
- **Gesture `[h](e)`**: `h` is pressed, `e` is pressed (while `h`
  still down), `e` is released first (while `h` still down), then
  `h`. A key was pressed *and released* during `h`'s lifetime. `h`
  is a hold, `e` is a roll.

This signature is robust: no matter how fast or slow the user types,
natural rollover always releases in press order, so every candidate
classifies as a tap. A deliberate gesture releases the inner keys
before the outer key, classifying the outer key as a hold
retroactively. The keyboard itself disambiguates; no clock is
involved.

## 5. Classification via release order

Each candidate (§3) is classified at its keyup into one of three roles:

> **A candidate `K` is a HOLD iff at least one other key was pressed
> AND released during `K`'s lifetime (between its keydown and its
> keyup). Otherwise, `K` is a TAP, unless another key pressed before
> `K` is still held at `K`'s keyup time, in which case `K` is a ROLL.**

Collapsed:

- **HOLD** — another key came and went during my lifetime.
- **ROLL** — an earlier key is still down when I'm released.
- **TAP** — neither.

Classification consequences at keyup:

- TAP → the candidate's character is inserted into the text.
- HOLD → the gesture commits (§6.2). No character is typed for this
  key.
- ROLL → no character is typed; the roll participates in an active
  gesture that will commit when its hold releases.

### 5.1 No timers, no calibration

Release-order classification has no time dimension. There is no hold
threshold, no roll window, and no user calibration — the v0.3 fields
`holdThreshold` and `rollWindow` are removed. A conforming
implementation MUST NOT introduce timers as part of the classification
rule, because doing so reintroduces the tuning problem release-order
was designed to eliminate.

Implementations MAY still use short debounce or sanity timeouts for
defensive reasons (e.g., discarding a pending gesture if the editor
loses focus for longer than N seconds), but these are recovery
mechanisms, not classification.

### 5.2 Retroactive classification

A candidate's role is not known at its keydown — only at its keyup,
and only by looking at what has happened to earlier-pressed candidates
since then. This is why §4's commit-on-release is required: if
characters committed on keydown, a hold could never retroactively be
classified as a hold (the character would already be in the text).

In practice, an implementation tracks each in-flight candidate in
press order. On every keyup, the releasing key's classification is
determined by:

1. Is any earlier candidate still down? → this key is a ROLL; that
   earlier candidate becomes (or stays) a HOLD.
2. Otherwise, was any key pressed-and-released during this key's
   lifetime? → this key is a HOLD; commit the gesture.
3. Otherwise → this key is a TAP; insert its character.

## 6. Grammar

A gesture is derived from the classified candidates (§5):

```
gesture       := hold-set roll-phase commit
hold-set      := ordered list of candidates classified as HOLD, in press order
roll-phase    := roll-event+
roll-event    := ordered list of candidates classified as ROLL, in press order
                 (between the previous roll-event's last keyup and this one's last keyup)
commit        := KEYUP of the final still-active HOLD candidate
```

A gesture may contain **one or many roll events**. A single roll
event followed by hold release is the common case (a **single-shot
gesture**, the only form in v0.4). Multiple roll events before hold
release form a **sustained gesture** (§6.4).

Classification (tap / hold / roll) happens at each candidate's keyup
per §5. The gesture itself does not exist as a distinct construct
until a candidate is classified as HOLD — at that moment, earlier
ROLL candidates (which were classified when they released while that
candidate was still down) are retroactively acknowledged as members
of the gesture.

### 6.1 Hold set formation

The hold set accumulates naturally out of release-order classification.
Any candidate whose lifetime contained at least one key that was
pressed and released becomes a HOLD. When multiple candidates overlap
with rolls, all of them can become holds — a **multi-key hold**
(`[sd]`, `[wG]`, etc.). Press order of the holds determines binding
identity: `[sd]` and `[ds]` are two distinct bindings that MAY be
mapped to unrelated motions.

There is no "freeze" step in v0.4; it was an artifact of the v0.3
timer-driven model. Under release-order rules, the hold set is
whatever set of candidates satisfy the "something came and went during
my lifetime" predicate, evaluated independently for each candidate at
its own keyup.

### 6.2 Commit

A gesture commits when the **last still-active hold** is released —
the outermost hold in the sense that no other hold key is still down
at its keyup.

**Single-shot gestures** (one roll event): on commit, the editor
looks up the binding `[hold-set](roll-event)`, executes the bound
action as a single atomic operation (one undo step, one macro event),
and discards all gesture state.

**Sustained gestures** (multiple roll events, §6.4): each roll event
fires its binding independently as it completes, *before* the hold
releases. Commit (hold release) ends the sustained phase and discards
gesture state. If no roll event occurred during the hold's lifetime,
the hold key falls through to TAP classification per §5 — its
character is typed.

If a binding lookup is unbound, that roll event commits as a
**no-op**: no action is executed, no partial state remains visible.
Implementations SHOULD surface unbound gestures to the user in a
non-intrusive way (e.g., a status indicator).

### 6.3 Abort

A gesture aborts if any of the following happens before commit:

- A modifier key (`Ctrl`, `Alt`, `Meta`) is pressed mid-gesture,
  unless the binding explicitly accepts modifiers
- The editor loses focus or changes context mid-gesture

Aborted gestures MUST NOT leave partial state visible to the user.

Note: the v0.3 "release without roll" case (a hold key released with
no rolls) is no longer a separate abort condition. Under §5 release-
order classification, a candidate with no rolls in its lifetime is
simply a TAP — its character is typed at keyup. No special handling
is required.

### 6.4 Sustained gestures

In a sustained gesture, the hold key remains active after the first
roll event completes, and the user may issue **additional roll events**
before releasing the hold. Each roll event fires its binding
independently as it completes — the user does not wait for hold
release to see the effect.

The sustained phase begins when the first roll event completes (the
hold is now confirmed via §5 classification). It ends when the hold
key is released (§6.2 commit). During the sustained phase:

- **Repeated taps** — a single key pressed and released while the
  hold is active constitutes one roll event. Each tap fires the
  binding `[hold](key)` independently. Example: `[u](g,g,g)` fires
  `[u](g)` three times in sequence.
- **Repeated rolls** — a multi-key roll sequence pressed and released
  while the hold is active constitutes one roll event. Each roll
  fires the binding `[hold](roll-sequence)` independently. Example:
  `[h](jkl,jkl,jkl)` fires `[h](jkl)` three times in sequence.
- **Mixed events** — taps and rolls may be freely interspersed within
  a single sustained gesture. Each roll event fires its own binding
  lookup. Example: `[u](g,g,b)` fires `[u](g)` twice, then `[u](b)`
  once.

Roll events within a sustained phase are delimited by **quiescence**
— the moment when no roll-phase key is down (only the hold key
remains). The next keydown after quiescence begins a new roll event.

#### 6.4.1 Why sustained gestures

Single-shot gestures (v0.4) require the user to release and re-hold
for every action. For motions like "3 characters right" this is fine
— `[h](jkl)` is one fluid gesture. But for iterative operations
(undo, search-next, mark cycling), re-holding per step is clumsy.
Sustained gestures let the hold key act as a **mode key**: hold it
down, tap or roll as many times as needed, release when done.

This is analogous to how a Vim user holds Shift and taps a key
repeatedly — the modifier stays down, the action repeats. The hold
key is a z-motion modifier.

#### 6.4.2 Undo as a motivating example

The undo hold family illustrates sustained gestures naturally:

| Gesture | Effect |
|---|---|
| `[u](g)` | Undo one granular step (finest grain the editor tracks) |
| `[u](g,g,g)` | Undo three granular steps (three taps while holding) |
| `[u](b)` | Undo to last motion boundary |
| `[u](t)` | Open undo tree pane, enter undo-navigation mode |

With sustained gestures, the user holds `[u]`, taps `g` until the
edit is where they want it, and releases. No mode switch, no count
prefix, no release-and-rehold. The hold key is the undo context;
the taps are the repetitions.

(These bindings are illustrative — the default binding table defines
the actual assignments. The letters `u`, `g`, `b`, `t` are examples,
not reserved by this section.)

#### 6.4.3 Interaction with single-shot gestures

Every single-shot gesture from v0.4 is a sustained gesture with
exactly one roll event — the two models are **fully compatible**.
An implementation that supports sustained gestures automatically
supports single-shot gestures. No existing binding changes meaning.

The distinction is behavioral, not syntactic: a sustained gesture
is simply a gesture where the user does not release the hold key
immediately after the first roll event.

#### 6.4.4 Undo granularity in insert mode

Traditional Vim defines an undo unit as the span between entering
and leaving insert mode. In a z-motion editor where the user may
remain in insert mode indefinitely, this boundary does not exist.

Conforming implementations that support the undo hold family MUST
track undo at a finer granularity than mode transitions. The
recommended tiers are:

1. **Granular** — the finest unit the editor tracks (individual
   characters, words, or paste operations, at the implementation's
   discretion)
2. **Motion boundary** — the span of edits between cursor movements
   (any z-motion gesture, mouse click, or arrow key that changes
   cursor position closes the current undo group and opens a new one)
3. **Undo tree** — the full history with branching, navigable via a
   dedicated pane

Implementations MAY define additional tiers. The undo hold family
binds each tier to a distinct roll key within the sustained gesture,
giving the user direct access to the granularity they want.

In normal mode (entered via §10.3 toggle or traditional Esc), Vim's
standard undo behavior (`u`, `Ctrl-R`, `:undolist`, etc.) MUST
continue to work as expected. Z-motion undo is an **additional**
insert-mode interface, not a replacement.

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

The default table uses a single binding family:

- **Letter-hold / home-row-roll.** A letter whose mnemonic is the
  motion unit (e.g. `[w]` = word) holds, while the roll phase supplies
  magnitude and direction via §8 home-row rolls. Example: `[w](jk)` =
  2 words forward.

Shifted-letter holds (`[W]`, `[F]`, `[$]`, `[G]`, etc.) extend the
hold alphabet without changing the family structure — `[a]` and `[A]`
are distinct bindings, per §7.2. Shift is a hold-identity modifier,
not a roll-phase modifier; the roll phase remains pure lowercase
home-row keys.

(The v0.3 draft proposed a second "numeric count-hold" family where a
digit `1`–`9` held and a vim motion letter rolled. That family was
dropped in v0.4 as redundant — compound rolls already provide counts,
and count-prefixing shifted vim letters would have required Shift
inside the roll phase, which §5 and §8 keep clean.)

## 10. Composition with existing Vim features

Z-motion is designed as a **superset** — it coexists with traditional
Vim normal/visual modes rather than replacing them. An implementation
MAY provide traditional Vim modes alongside z-motion, and the two MUST
NOT interfere:

- In insert mode: z-motion gestures are active; commit-on-release
  applies; candidates classified as TAP per §5 are ordinary typed
  characters.
- In normal/visual mode (if present): traditional Vim motions apply;
  z-motion is inactive; commit-on-release is moot (no characters are
  being typed).

A user who prefers pure z-motion MAY configure the editor to omit
normal/visual modes entirely and stay in insert mode always. A user who
prefers pure Vim MAY disable z-motion gestures and get a conventional
Vim experience. Both MUST be supported.

### 10.1 Operators (d, c, y)

Operator composition with z-motion is **deferred to v0.5+**. The
leading candidate is **operator-first multi-key hold**: the operator
letter is the first key of a multi-key hold, and the remaining key(s)
identify the motion. Examples:

- `[dw](j)` — delete 1 word forward (= Vim `dw`)
- `[dw](jk)` — delete 2 words forward (= Vim `d2w`)
- `[d$](k)` — delete to end of line (= Vim `d$`)
- `[dd](k)` — delete current line (= Vim `dd`)
- `[yw](j)` — yank 1 word forward

This composes naturally with §6.1 multi-key holds and §8.3 press-order
directionality. Letters `d`, `c`, `y`, `D`, `C`, `Y` are **reserved**
for operator use and MUST NOT be claimed by default letter-hold
bindings. Pre-v0.5 implementations MAY experiment with the form.

### 10.2 Text objects

Text objects (`iw`, `a"`, `i(`, etc.) are untouched by z-motion.
They continue to work inside normal/visual mode as in Vim.

### 10.3 Normal-mode toggle keys

A conforming implementation MAY designate one or more hold keys as
**normal-mode toggle keys**. While such a key is held, the editor
interprets a specified subset of other keys as traditional Vim normal-
mode commands — tap-repeatable, fired immediately, ignoring the
z-motion classification rule.

The canonical use case is keeping `h j k l` (and eventually more of
the vim normal vocabulary) available for single-step navigation
without paying the gesture overhead. Designated toggle keys SHOULD
appear one per hand so that cross-hand tapping is always available.

Semantics:

- A normal-mode toggle key is promoted **eagerly** — the first
  in-scope tap while it is held switches to normal-mode immediately,
  rather than waiting for release-order classification. This
  eliminates the keyup latency on the first move.
- While the toggle is held, its subsequent in-scope key presses fire
  on keydown (honoring OS key repeat).
- Releasing the toggle exits the mode. If no in-scope key was fired
  during the hold, the toggle key itself is typed as a character
  (falling back to §5 TAP classification); otherwise it is consumed
  silently.
- A normal-mode toggle and a z-motion gesture MUST NOT overlap on
  the same hold key — implementations choose one role per key.

The exact in-scope vocabulary is implementation-defined; the
`default-bindings.md` companion document proposes a starting set.

## 11. Conformance

A conforming Z-motion implementation MUST:

1. Provide commit-on-release for typed characters (§4)
2. Classify every candidate at keyup per §5 release-order rules, with
   no time-based thresholds in the classification path (§5.1)
3. Implement the grammar in §6, including commit and abort rules
4. Treat each `[hold-set](roll)` pair as an independent binding with
   no pattern generalization (§7.2). Multi-key hold sets MUST be
   distinguished by press order (§6.1): `[sd]` and `[ds]` are distinct.
5. Allow any key to be designated as a hold key (§7.1). Shift, when
   applied to a hold key, produces a **distinct** hold (`[a]` ≠ `[A]`).
6. Ship a default binding table and document it

A conforming implementation MAY:

- Provide traditional Vim normal/visual modes alongside z-motion
- Provide normal-mode toggle keys (§10.3)
- Add operator composition experimentally (§10.1)
- Provide visual feedback for in-progress gestures
- Extend the binding model with chords, modifiers, or macros, provided
  the base grammar remains intact

## 12. Change log

- **v0.5 (2026-04-12)** — Sustained gestures.
  - §6 grammar: `roll-sequence` generalized to `roll-phase := roll-event+`.
    A gesture may now contain multiple roll events before hold release.
    Single-shot gestures (one roll event) remain the common case and are
    fully backward compatible.
  - §6.2 commit: rewritten for both single-shot and sustained cases.
    Sustained gestures fire per-event; commit ends the sustained phase.
  - §6.4 (new): sustained gestures — repeated taps, repeated rolls, and
    mixed events within a single hold. Roll events delimited by
    quiescence (no roll-phase key down).
  - §6.4.1: motivation — hold-as-mode for iterative operations.
  - §6.4.2: undo hold family as motivating example. Three tiers of undo
    granularity (granular, motion boundary, undo tree) accessed via
    different roll keys within one sustained `[u]` hold.
  - §6.4.3: backward compatibility — every v0.4 single-shot gesture is
    a sustained gesture with exactly one roll event.
  - §6.4.4: undo granularity in insert mode. Because z-motion users may
    never leave insert mode, undo boundaries cannot depend on mode
    transitions. Motion-boundary undo groups and fine-grained undo tiers
    defined as requirements for implementations supporting the undo hold
    family. Normal-mode undo (Vim `u`) unchanged.
  - **Non-breaking:** all v0.4 bindings and behavior are preserved.
    Sustained gestures are a superset.
- **v0.4 (2026-04-11)** — Release-order classification. Major
  simplification, validated by live prototype (`6nz/proto/z-motion-feel/`).
  - §3: terminology reworked around candidate/tap/hold/roll and
    release order. Removed hold threshold, roll window, calibration.
  - §4.1: rewritten — typing vs gestures are disambiguated by release
    order, not by a clock. `he` vs `[h](e)` differ only in which key
    releases first.
  - §5: replaced entirely. No timers, no calibration. A candidate is
    a HOLD iff another key was pressed and released during its
    lifetime; a ROLL iff an earlier candidate is still down at its
    keyup; a TAP otherwise. Implementations MUST NOT introduce timers
    into the classification rule.
  - §6: grammar rewritten. Hold set is derived from classification,
    not accumulated through a threshold. v0.3 "freeze rule" and
    "release-without-roll" cases are gone — they were artifacts of
    the timer model.
  - §9: dropped the numeric count-hold family as redundant with
    compound rolls and incompatible with "Shift stays out of the roll
    phase." Default table is now single-family (letter-hold).
  - §10.1: operator composition updated with operator-first multi-key
    hold sketch; deferred to v0.5+. `d`, `c`, `y` and their shifted
    siblings are reserved.
  - §10.3: new — normal-mode toggle keys (hold-while-active, eager
    promotion, one-per-hand). Validates the prototype's `[f]`+hjkl
    implementation.
  - §11: conformance simplified — no calibration requirement; shift
    distinct-hold rule explicit.
  - **Breaking:** v0.3's calibration conformance requirement is
    removed. Any v0.3 implementation that depended on `holdThreshold`
    or `rollWindow` will need rework. The binding identities (`[hold-set](roll)`)
    are unchanged — existing bindings still apply.
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
