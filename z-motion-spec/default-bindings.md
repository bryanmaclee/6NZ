# Z-Motion Default Bindings

**Companion to:** `SPEC.md` v0.4
**Status:** Draft v0.2 — recommendation, not requirement.
**Partially stale under v0.4** — see notice below.
**License:** CC0 1.0 Universal

---

## ⚠ v0.4 status notice

This draft was written against SPEC v0.3. Two changes in SPEC v0.4 make
parts of this document obsolete:

1. **FAMILY 2 (numeric count-hold) is dropped.** SPEC v0.4 §9 removes
   the count family as redundant with compound rolls and incompatible
   with keeping Shift out of the roll phase. The §2 section of this
   document is retained for historical context only — do NOT ship it.
2. **No calibration, no hold threshold, no roll window.** Any sentence
   in this document that references timing disambiguation is stale.
   The §5 classification rule (release order) replaces all of it.

FAMILY 1 (letter-hold / home-row-roll) and its bindings are otherwise
still valid under v0.4 and remain the default table. A clean rewrite
(default-bindings.md v0.3) is a planned follow-up.

---

## Purpose

Walks the canonical Vim motion set and proposes a `[hold-set](roll)`
binding for each, using the grammar in SPEC §6 and the directionality
conventions in SPEC §8 (including §8.1 left-hand rolls, §8.2 hand
pairing, §8.3 multi-key hold direction).

Recommendation only. Implementations are free to ship any default
table; users are free to remap everything.

## Two binding families

This table uses two orthogonal families layered on the same grammar:

1. **Letter-hold / home-row-roll.** The hold is a single letter whose
   mnemonic is the motion *unit* (e.g. `[w]` = word). The roll phase
   supplies *magnitude and direction* via §8 home-row rolls. Example:
   `[w](j)` = 1 word forward, `[w](jk)` = 2 words forward, `[w](l)` =
   1 word back.

2. **Numeric count-hold / vim-letter roll.** The hold is a digit `1`–`9`
   and the roll phase is a single Vim motion letter. `[3](w)` = 3
   words forward, i.e. Vim's `3w`. Counts ≥ 10 are out of scope —
   users who need larger counts fall back to traditional Vim normal
   mode.

Both families live in the same binding hashmap, per SPEC §7.2. A user
with strong Vim muscle memory can default to the count family; a user
who prefers pure rolls can default to the letter family; most will mix.

## Roll-phase conventions (recap from SPEC §8)

**Right-hand rolls (§8):**
- `j`(1R), `jk`(2R), `jkl`(3R), `jkl;`(4R)
- `l`(1L), `lk`(2L), `lkj`(3L), `lkj a`(4L)
- `k` = pivot (unbound by convention)

**Left-hand rolls (§8.1):**
- `a`(1R), `as`(2R), `asd`(3R), `asdf`(4R)
- `f`(1L), `fd`(2L), `fds`(3L), `fdsa`(4L)
- `d` = pivot (unbound by convention)

**Hand-pairing rule (§8.2):** every default binding puts the hold key
on the hand opposite the roll. Each family below is annotated with
**(hold-hand / roll-hand)** so the split-keyboard story is explicit.

**Multi-key hold direction (§8.3):** `[as]`, `[sd]` are rightward-rolled
holds; `[sa]`, `[ds]` are leftward-rolled. The same convention applies
on the right hand (`[jk]`/`[kj]`, etc.).

## Scope limits

- **Operators** (`d`, `c`, `y`) — deferred to SPEC v0.4+ §10.1. Letters
  `d`, `c`, `y` are **reserved** and NOT claimed as hold keys here.
- **Text objects** (`iw`, `a"`, `i(`, …) — SPEC §10.2 keeps them in
  normal/visual mode. Not bound.
- **Marks, macros, registers, jump list, change list** — out of scope
  for an insert-mode motion layer.

---

# FAMILY 1 — Letter-hold family

Each table lists a representative sample of the binding space;
implementations SHOULD populate the full 4-right / 4-left rolls for
count-compatible families unless noted otherwise.

## 1.1 Character motion (vim `h`, `l`)

**(right-hand hold / left-hand roll)** — hand pairing is forced: `h`
is right-index and would collide with any right-hand roll (same
finger), so the roll phase lives on the left hand.

**Hold key:** `h` — mnemonic "h for character unit." Overloads Vim's
`h`=left by reframing `h` as a *unit*, not a *direction*. The
direction is supplied by the roll: `[h](f)` gives back Vim's `h`
meaning for free.

| Gesture        | Motion           | Vim equivalent |
|----------------|------------------|----------------|
| `[h](a)`       | 1 char right     | `l`            |
| `[h](as)`      | 2 chars right    | `2l`           |
| `[h](asd)`     | 3 chars right    | `3l`           |
| `[h](asdf)`    | 4 chars right    | `4l`           |
| `[h](f)`       | 1 char left      | `h`            |
| `[h](fd)`      | 2 chars left     | `2h`           |
| `[h](fds)`     | 3 chars left     | `3h`           |
| `[h](fdsa)`    | 4 chars left     | `4h`           |

Single-char moves are slightly more expensive than a bare arrow key;
the win is staying on the home row *and* never leaving insert mode.

## 1.2 Word motion — forward/back start (vim `w`, `b`)

**(left-hand hold / right-hand roll)**
**Hold key:** `w` — "word unit."

| Gesture        | Motion               | Vim equivalent |
|----------------|----------------------|----------------|
| `[w](j)`       | 1 word forward       | `w`            |
| `[w](jk)`      | 2 words forward      | `2w`           |
| `[w](jkl)`     | 3 words forward      | `3w`           |
| `[w](jkl;)`    | 4 words forward      | `4w`           |
| `[w](l)`       | 1 word back          | `b`            |
| `[w](lk)`      | 2 words back         | `2b`           |
| `[w](lkj)`     | 3 words back         | `3b`           |
| `[w](lkj a)`   | 4 words back         | `4b`           |

## 1.3 Word motion — end (vim `e`, `ge`)

**(left-hand hold / right-hand roll)**
**Hold key:** `e` — "end of word unit."

| Gesture        | Motion                   | Vim equivalent |
|----------------|--------------------------|----------------|
| `[e](j)`       | end of next word         | `e`            |
| `[e](jk)`      | end of 2nd word forward  | `2e`           |
| `[e](jkl)`     | end of 3rd word forward  | `3e`           |
| `[e](l)`       | end of previous word     | `ge`           |
| `[e](lk)`      | end of 2nd word back     | `2ge`          |
| `[e](lkj)`     | end of 3rd word back     | `3ge`          |

## 1.4 Line anchors (vim `0`, `^`, `$`)

**(left-hand hold / right-hand roll)** — single-roll only; no
compounding (line anchors are discrete positions, not countable).

**Hold key:** `a` — "line anchor." Mnemonic is admittedly weak; see
§4 (flagged).

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[a](l)`       | start of line       | `0`            |
| `[a](lk)`      | first non-blank     | `^`            |
| `[a](j)`       | end of line         | `$`            |

Other rolls under `[a]` are **intentionally unbound** in the default
table (reserved for user extensions).

## 1.5 Vertical line motion (vim `j`, `k`) — MULTI-KEY HOLD

**(left-hand multi-key hold / right-hand roll)** — this is the first
default binding that uses a multi-key hold (SPEC §6.1, §8.3).

**Hold sets:**
- `[sd]` = forward (down) — rightward-rolled left-hand hold (ring →
  middle)
- `[ds]` = back (up) — leftward-rolled left-hand hold (middle → ring)

Direction comes from the hold's own press-order roll; the roll phase
supplies magnitude only.

| Gesture        | Motion               | Vim equivalent |
|----------------|----------------------|----------------|
| `[sd](j)`      | 1 line down          | `j`            |
| `[sd](jk)`     | 2 lines down         | `2j`           |
| `[sd](jkl)`    | 3 lines down         | `3j`           |
| `[sd](jkl;)`   | 4 lines down         | `4j`           |
| `[ds](j)`      | 1 line up            | `k`            |
| `[ds](jk)`     | 2 lines up           | `2k`           |
| `[ds](jkl)`    | 3 lines up           | `3k`           |
| `[ds](jkl;)`   | 4 lines up           | `4k`           |

Note the roll phase reuses the rightward roll `j`/`jk`/… for magnitude
regardless of vertical direction. The leftward-roll vocabulary
(`l`/`lk`/…) is **unbound** under `[sd]` and `[ds]`, reserved for
user-defined variants (e.g. scrolled-viewport motion).

This family replaces what would otherwise require two dedicated letter
holds (`[j]` and `[k]`), freeing those letters for user bindings and
demonstrating the pattern for any other "forward/back" family that
wants to free up its roll phase for magnitude only.

## 1.6 Document / viewport (vim `gg`, `G`, `H`, `M`, `L`)

**(left-hand hold / right-hand roll)**
**Hold key:** `g` — "document / viewport scope."

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[g](l)`       | top of document     | `gg`           |
| `[g](j)`       | bottom of document  | `G`            |
| `[g](lk)`      | top of viewport     | `H`            |
| `[g](jk)`      | bottom of viewport  | `L`            |
| `[g](k)`       | middle of viewport  | `M`            |

`[g](k)` is the one place the pivot `k` is bound — "middle" has no
handed direction, so the pivot is its natural home.

Numeric line jump (`<N>G` in Vim) is handled by the **count family**
below: `[4](G)` = jump to line 4. See §2.

## 1.7 Paragraph (vim `{`, `}`)

**(right-hand hold / left-hand roll)**
**Hold key:** `p` — "paragraph unit."

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[p](a)`       | next paragraph      | `}`            |
| `[p](as)`      | 2 paragraphs forward| `2}`           |
| `[p](asd)`     | 3 paragraphs forward| `3}`           |
| `[p](f)`       | previous paragraph  | `{`            |
| `[p](fd)`      | 2 paragraphs back   | `2{`           |
| `[p](fds)`     | 3 paragraphs back   | `3{`           |

Sentence motion (vim `(`, `)`) is **omitted from defaults** — rarely
used in code, and `p` is already overloaded. Users can bind `[s]` if
they want it, or use the count family's `[N])` / `[N](` with Shift.

## 1.8 Match (vim `%`)

**(right-hand hold / left-hand roll)**
**Hold key:** `m` — "match."

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[m](d)`       | jump to matching pair | `%`          |

Matching is a pair toggle — no direction. The pivot roll (`d` on the
left hand) is the natural single-key home. Other rolls under `[m]`
are reserved for future scope-jump extensions.

## 1.9 Search iteration (vim `n`, `N`)

**(right-hand hold / left-hand roll)**
**Hold key:** `n` — "next search match."

| Gesture        | Motion                      | Vim equivalent |
|----------------|-----------------------------|----------------|
| `[n](a)`       | next search match           | `n`            |
| `[n](as)`      | 2nd next match              | `2n`           |
| `[n](asd)`     | 3rd next match              | `3n`           |
| `[n](f)`       | previous search match       | `N`            |
| `[n](fd)`      | 2nd previous match          | `2N`           |
| `[n](fds)`     | 3rd previous match          | `3N`           |

Search *initiators* (`*`, `#`) remain **omitted** — better served by
the editor's search UI.

## 1.10 Find-char (vim `f<char>`, `t<char>`)

**(left-hand hold / right-hand type char)**
**Hold keys:** `f` (find) and `t` (till). **Direction convention is
exempt** for this family — the roll alphabet is "any letter" (the
target character), so §8 directionality does not apply. Implementations
using this binding MUST document the exemption.

| Gesture            | Motion                          | Vim equivalent |
|--------------------|---------------------------------|----------------|
| `[f](<char>)`      | find next `<char>`              | `f<char>`      |
| `[t](<char>)`      | till next `<char>`              | `t<char>`      |

Back-directions (`F`, `T`) are **omitted** — they require Shift-aware
holds which SPEC §6.3 treats as aborts unless the binding explicitly
accepts modifiers. Users who want them can bind Shift-accepting
variants explicitly.

---

# FAMILY 2 — Numeric count-hold family

**(digit hold / vim-letter roll)**

Each digit `1`–`9` is a hold key. The roll phase is a single Vim
motion letter. The result is count-prefixed Vim semantics inside
insert mode.

**Hand pairing:** digits span both hands (`1 2 3 4 5` left, `6 7 8 9 0`
right). Users SHOULD pick the digit on the hand opposite the vim
letter they intend to roll, per SPEC §8.2. For example:

- Rolling `w` (left hand) → prefer right-hand digit `6`–`9`.
- Rolling `l` (right hand) → prefer left-hand digit `1`–`5`.

The binding is the same regardless of which digit — `[3](w)` and
`[7](w)` both mean "jump forward 3 words vs. 7 words."

**`0` is unbound as a count** — Vim already uses `0` as "line start,"
and a leading-zero count is not meaningful.

| Gesture       | Motion                                   | Vim equivalent |
|---------------|------------------------------------------|----------------|
| `[3](w)`      | 3 words forward                          | `3w`           |
| `[5](b)`      | 5 words back                             | `5b`           |
| `[2](e)`      | end of 2nd word forward                  | `2e`           |
| `[7](l)`      | 7 chars right                            | `7l`           |
| `[4](h)`      | 4 chars left                             | `4h`           |
| `[3](j)`      | 3 lines down                             | `3j`           |
| `[2](k)`      | 2 lines up                               | `2k`           |
| `[9]($)`*     | `$` applied 9 times (end of 9th line)    | `9$`           |
| `[4](G)`*     | jump to line 4                           | `4G`           |
| `[2]())`*     | 2 sentences forward                      | `2)`           |

*Shift-aware vim letters (`$`, `G`, `)`, etc.) require the
implementation to whitelist Shift in the roll phase — same caveat as
§1.10 and SPEC §6.3. Implementations that want the full count family
SHOULD accept Shift in roll-position for digit holds.

## 2.1 Overlap with the letter family is intentional

`[3](w)` and `[w](jkl)` both mean "3 words forward." Users pick
whichever fits their muscle memory. The binding table stores both.

## 2.2 Counts ≥ 10 are out of scope

The grammar's effective single-digit cap is a deliberate simplification.
Users who need `23w`-style navigation should drop into traditional Vim
normal mode (SPEC §10), which conforming editors SHOULD continue to
support.

## 2.3 Digits are exclusive to family 2

None of `0`–`9` are claimed as hold keys by the letter family, and
letters are not hold keys in the count family. The two families never
collide in the hashmap.

---

## 3. Hold-key allocation summary

### Letter holds (family 1)

| Hold          | Hand   | Roll hand | Unit                       |
|---------------|--------|-----------|----------------------------|
| `h`           | right  | left      | character                  |
| `w`           | left   | right     | word (start)               |
| `e`           | left   | right     | word (end)                 |
| `a`           | left   | right     | line anchor                |
| `g`           | left   | right     | document / viewport        |
| `p`           | right  | left      | paragraph                  |
| `m`           | right  | left      | match (pair toggle)        |
| `n`           | right  | left      | search iteration           |
| `f`           | left   | right*    | find-char forward          |
| `t`           | left   | right*    | till-char forward          |
| `[sd]`/`[ds]` | left   | right     | vertical line motion       |

*`[f]` / `[t]` rolls are exempt from §8 directionality — the roll key
is the target character, not a direction.

### Digit holds (family 2)

| Hold   | Hand  | Roll               | Unit           |
|--------|-------|--------------------|----------------|
| `1`–`5`| left  | any vim motion     | count prefix   |
| `6`–`9`| right | any vim motion     | count prefix   |
| `0`    | unbound (Vim uses `0` = line start)     |

### Reserved for future work
- `d`, `c`, `y` — reserved for operator composition (SPEC §10.1,
  v0.4+). **Default tables MUST NOT claim them.**
- `k` (single) and `d` (single) — pivot keys per §8 / §8.1.

### Unallocated (available for user extensions)
- Remaining letters: `q r s u i o v x z b`
- All multi-key holds not listed above (e.g. `[as]`, `[sa]`, `[df]`,
  `[jk]`, `[kj]`, etc.)

---

## 4. Ambiguous / flagged

Issues carried forward from v0.1 or discovered during this revision:

1. **WORD motion** (vim `W`/`B`/`E`) — still unbound by default. Needs
   Shift-accepting holds or a dedicated letter; omitted.
2. **Find-char back** (`F`/`T`) — Shift-aware; omitted.
3. **Line-anchor mnemonic** — `[a]` has no inherent "line anchor"
   meaning; real user testing should confirm or replace.
4. **Numeric line jump `<N>G`** — resolved via count family `[N](G)`
   for single-digit N. Multi-digit line jumps fall back to Vim normal
   mode or a command palette.
5. **Sentence motion** — unbound in letter family; accessible via
   count family `[N])` / `[N](` with Shift.
6. **Search initiators `*`/`#`** — still omitted; better served by
   the editor's search UI.
7. **Shift-in-roll** — the count family needs Shift to cover `$`, `G`,
   `)`, etc. Either the implementation whitelists Shift in the roll
   phase or those gestures are unavailable. Flagged for SPEC v0.4.

---

## 5. Change log

- **v0.2 (2026-04-11)** — Rewrite against SPEC v0.3.
  - Every family annotated with **(hold-hand / roll-hand)** — the
    hand-pairing rule (SPEC §8.2) is now explicit per binding
  - §1.1 character motion moved to left-hand rolls, fixing the
    same-finger collision (`h` + `j` are both right index) that made
    the v0.1 table physically impossible
  - §1.5 vertical line motion added using multi-key hold `[sd]`/`[ds]`
    — first default binding to exercise SPEC §6.1 and §8.3
  - FAMILY 2 added: numeric count-hold family (`[3](w)` etc.), giving
    Vim-style count-prefixed motions as a second binding vocabulary
    layered on the same grammar
  - Numeric line jump ambiguity (v0.1 §7) resolved via `[N](G)` for
    single-digit N
- **v0.1 (2026-04-11)** — Initial draft. Right-hand-rolls-only; no
  vertical line motion; no count family; `[h]` had a same-finger bug.
  Superseded.
