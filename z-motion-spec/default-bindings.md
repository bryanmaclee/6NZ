# Z-Motion Default Bindings

**Companion to:** `SPEC.md` v0.5
**Status:** Draft v0.3 — recommendation, not requirement.
**All bindings below are provisional.** Specific key assignments are a working
draft. Expect revision once implementation experience tells us what actually
feels good under the fingers. The spec mechanism is stable; the key map is not.
**License:** CC0 1.0 Universal

---

## Purpose

Walks the canonical Vim motion set and proposes a `[hold-set](roll)`
binding for each, using the grammar in SPEC §6 and the directionality
conventions in SPEC §8 (including §8.1 left-hand rolls, §8.2 hand
pairing, §8.3 multi-key hold direction).

Recommendation only. Implementations are free to ship any default
table; users are free to remap everything.

## Single binding family

The default table uses one family: **letter-hold / home-row-roll.** The
hold is a single letter whose mnemonic is the motion *unit* (e.g. `[w]`
= word). The roll phase supplies *magnitude and direction* via SPEC §8
home-row rolls. Example: `[w](j)` = 1 word forward, `[w](jk)` = 2 words
forward, `[w](l)` = 1 word back.

(SPEC v0.4 §9 dropped the v0.3 numeric count-hold family as redundant
with compound rolls and incompatible with keeping Shift out of the roll
phase. Compound rolls cap at 4 per direction, which covers the vast
majority of in-flight count needs; users who want larger jumps fall
back to traditional Vim normal mode or the editor's command palette.)

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

- **Operators** (`d`, `c`, `y`) — deferred to SPEC §10.1. Letters
  `d`, `c`, `y` are **reserved** and NOT claimed as hold keys here.
- **Text objects** (`iw`, `a"`, `i(`, …) — SPEC §10.2 keeps them in
  normal/visual mode. Not bound.
- **Marks, macros, registers, jump list, change list** — out of scope
  for an insert-mode motion layer.

---

# Letter-hold family

Each table lists a representative sample of the binding space;
implementations SHOULD populate the full 4-right / 4-left rolls for
count-compatible families unless noted otherwise.

## 1. Character motion (vim `h`, `l`)

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

## 2. Word motion — forward/back start (vim `w`, `b`)

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

## 3. Word motion — end (vim `e`, `ge`)

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

## 4. Line anchors (vim `0`, `^`, `$`)

**(left-hand hold / right-hand roll)** — single-roll only; no
compounding (line anchors are discrete positions, not countable).

**Hold key:** `a` — "line anchor." Mnemonic is admittedly weak; see
§7 (flagged).

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[a](l)`       | start of line       | `0`            |
| `[a](lk)`      | first non-blank     | `^`            |
| `[a](j)`       | end of line         | `$`            |

Other rolls under `[a]` are **intentionally unbound** in the default
table (reserved for user extensions).

## 5. Vertical line motion (vim `j`, `k`)

**(right-hand hold / left-hand roll)** — direct letter holds. The
hold letter encodes direction (`j` = down, `k` = up) and the roll
phase supplies magnitude only.

**Hold keys:** `j` (down) and `k` (up) — direct from Vim's vertical
motion alphabet. No multi-key hold needed; the hold itself names the
direction.

| Gesture        | Motion               | Vim equivalent |
|----------------|----------------------|----------------|
| `[j](a)`       | 1 line down          | `j`            |
| `[j](as)`      | 2 lines down         | `2j`           |
| `[j](asd)`     | 3 lines down         | `3j`           |
| `[j](asdf)`    | 4 lines down         | `4j`           |
| `[k](a)`       | 1 line up            | `k`            |
| `[k](as)`      | 2 lines up           | `2k`           |
| `[k](asd)`     | 3 lines up           | `3k`           |
| `[k](asdf)`    | 4 lines up           | `4k`           |

The leftward-roll vocabulary (`f`/`fd`/…) is **unbound** under `[j]`
and `[k]`, reserved for user-defined variants (e.g. half-page jumps,
viewport-relative motion).

(v0.2 routed vertical motion through multi-key holds `[sd]`/`[ds]` to
avoid claiming `j` and `k`. v0.3 reverses that: direct letter holds
are simpler and `j`/`k` are the natural mnemonic. The `[sd]`/`[ds]`
slot is now available for user extensions.)

## 6. Document / viewport (vim `gg`, `G`, `H`, `M`, `L`)

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

Numeric line jump (`<N>G` in Vim) is not in the default table —
multi-digit line jumps fall back to traditional Vim normal mode or
the editor's command palette / `:<N>` ex command.

## 7. Paragraph (vim `{`, `}`)

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
they want it.

## 8. Match (vim `%`)

**(right-hand hold / left-hand roll)**
**Hold key:** `m` — "match."

| Gesture        | Motion              | Vim equivalent |
|----------------|---------------------|----------------|
| `[m](d)`       | jump to matching pair | `%`          |

Matching is a pair toggle — no direction. The pivot roll (`d` on the
left hand) is the natural single-key home. Other rolls under `[m]`
are reserved for future scope-jump extensions.

## 9. Search iteration (vim `n`, `N`)

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

## 10. Find-char (vim `f<char>`, `t<char>`)

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
variants explicitly (`[F]`, `[T]` are distinct holds per SPEC §11).

## 11. Undo (sustained gesture — SPEC §6.4)

**(left-hand hold / right-hand roll)** — the first default binding to
exercise SPEC §6.4 sustained gestures. The hold remains active across
multiple roll events; each event fires its binding independently.

**Hold key:** `u` — "undo."

| Gesture           | Motion                                     | Vim equivalent     |
|-------------------|--------------------------------------------|--------------------|
| `[u](g)`          | undo one granular step                     | `u`                |
| `[u](g,g,g)`      | undo three granular steps (sustained)      | `u u u`            |
| `[u](b)`          | undo to last motion boundary               | (no direct)        |
| `[u](t)`          | open undo tree pane                        | (no direct)        |
| `[u](r)`          | redo one granular step                     | `Ctrl-R`           |
| `[u](r,r,r)`      | redo three granular steps (sustained)      | `Ctrl-R Ctrl-R Ctrl-R` |

Sustained behavior (SPEC §6.4): hold `u`, tap `g` repeatedly, release
when the buffer is where you want it. No re-hold per step. Mixing is
allowed: `[u](g,g,b)` undoes two granular steps then back to the
previous motion boundary in one sustained gesture.

Implementations supporting `[u]` MUST track undo at finer-than-mode-
transition granularity per SPEC §6.4.4. Recommended tiers: granular
(`g`), motion boundary (`b`), undo tree (`t`). Implementations MAY
add tiers; the `r` (redo) binding above is one such addition.

(Letter `u` was reserved for user extensions in v0.2 §3 and is now
claimed by the default table. The change is non-breaking — v0.2 had
no default `[u]` binding.)

---

## 12. Hold-key allocation summary

| Hold   | Hand   | Roll hand | Unit                       |
|--------|--------|-----------|----------------------------|
| `h`    | right  | left      | character                  |
| `w`    | left   | right     | word (start)               |
| `e`    | left   | right     | word (end)                 |
| `a`    | left   | right     | line anchor                |
| `j`    | right  | left      | vertical down              |
| `k`    | right  | left      | vertical up                |
| `g`    | left   | right     | document / viewport        |
| `p`    | right  | left      | paragraph                  |
| `m`    | right  | left      | match (pair toggle)        |
| `n`    | right  | left      | search iteration           |
| `f`    | left   | right*    | find-char forward          |
| `t`    | left   | right*    | till-char forward          |
| `u`    | left   | right     | undo (sustained)           |

*`[f]` / `[t]` rolls are exempt from §8 directionality — the roll key
is the target character, not a direction.

### Reserved for future work
- `d`, `c`, `y` — reserved for operator composition (SPEC §10.1).
  **Default tables MUST NOT claim them.**
- `k` (single, in roll-position) and `d` (single, in roll-position)
  — pivot keys per §8 / §8.1.

### Unallocated (available for user extensions)
- Remaining letters: `q r s i o v x z b`
- All multi-key holds (e.g. `[as]`, `[sa]`, `[df]`, `[sd]`, `[ds]`,
  `[jk]`, `[kj]`, etc.)

---

## 13. Ambiguous / flagged

Issues carried forward from v0.2 or discovered during this revision:

1. **WORD motion** (vim `W`/`B`/`E`) — still unbound by default.
   Shifted-letter holds (`[W]`, `[B]`, `[E]`) are the natural slot
   per SPEC §11. Omitted from defaults pending implementation
   experience.
2. **Find-char back** (`F`/`T`) — Shifted-letter holds, available
   per SPEC §11; omitted from defaults.
3. **Line-anchor mnemonic** — `[a]` has no inherent "line anchor"
   meaning; real user testing should confirm or replace.
4. **Numeric line jump `<N>G`** — no z-motion default. Falls back to
   ex command (`:<N>`) or normal-mode `<N>G`.
5. **Sentence motion** — unbound; users can claim `[s]` if needed.
6. **Search initiators `*`/`#`** — omitted; better served by the
   editor's search UI.
7. **Shift-leak from rolls** — when a user holds a letter (e.g. `[w]`)
   and accidentally rolls a shifted character (`J` instead of `j`),
   the binding lookup misses. Implementations SHOULD strip Shift from
   roll keys when looking up bindings (the hold-vs-roll distinction
   is positional, not modifier-based). SPEC §11 requires Shift to
   produce a *distinct hold* (`[a]` ≠ `[A]`), but does not yet pin
   down roll-side Shift handling. Flagged for SPEC §5 or §11 note.

---

## 14. Change log

- **v0.3 (2026-04-25)** — Rewrite against SPEC v0.5.
  - Dropped FAMILY 2 (numeric count-hold) entirely. SPEC v0.4 §9
    removed it; this doc had carried a "do NOT ship" warning since.
  - §5 vertical line motion: replaced multi-key hold `[sd]`/`[ds]`
    with direct letter holds `[j]` (down) and `[k]` (up). Simpler
    mnemonic, same magnitude rolls, frees `[sd]`/`[ds]` for user
    extensions.
  - §11 (new): undo hold family `[u]` as the first default binding
    to exercise SPEC §6.4 sustained gestures (added in SPEC v0.5).
    Three tiers per SPEC §6.4.4: granular (`g`), motion boundary
    (`b`), undo tree (`t`). Redo (`r`) added as an extension tier.
  - §13 (formerly §4): added shift-leak-from-rolls as a flagged
    item pending SPEC clarification.
  - Removed v0.4 status notice — no longer stale.
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
