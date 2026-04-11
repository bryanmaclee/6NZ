# Z-Motion

**An open specification for a piano-roll input model for modal text editors.**

Z-motion is a keyboard input grammar that extends the Vim/NeoVim motion
tradition with a two-phase **hold + roll** gesture. The *hold key* selects a
mode or verb; the *rolled keys* determine magnitude and direction in one
fluid, piano-like motion.

This repository contains the specification only. Reference implementations,
including the 6NZ editor, are developed separately.

## Status

**v0.1 — draft.** The notation, grammar, and core concepts are stable enough
to discuss and implement against. Timing thresholds, direction mapping, and
composition with existing Vim text objects are **open questions** — see
`SPEC.md` §8.

## Why another motion system?

Vim motions are composable and fast, but they are *serial*: each keystroke
completes before the next begins. Long motions become long key sequences
(`5wwwbb` etc.), and muscle memory has to manage discrete counts.

Z-motion replaces the serial count with a **roll**: a brief gesture across
adjacent keys that the editor interprets as a single compound motion. The
hold key stays depressed; the rolled keys arrive in sequence but within a
small time window. The result is one motion, not N keystrokes.

- `[f](jkl)` = hold `f`, roll `j→k→l` → move 3 characters right
- `[w](jk)` = hold `w`, roll `j→k` → move 2 words forward
- `[w](l)` = hold `w`, tap `l` → move 1 word backward
- `[w](lkj)` = hold `w`, roll `l→k→j` → move 3 words backward

The editor detects the roll as a gesture, not as a series of keypresses. The
mental model is physical — like rolling fingers across piano keys — rather
than counted (`5w`).

## Licensing

The Z-motion specification is published under **CC0 1.0 Universal** (public
domain dedication). You may implement it, extend it, fork it, embed it in a
proprietary product, or adopt it into NeoVim or any other editor without
attribution or permission.

Z-motion draws directly on the NeoVim/Vim motion tradition. Publishing the
specification in the public domain is an intentional act of reciprocity.

See `LICENSE` for the full dedication text.

## Repository layout

```
z-motion-spec/
├── README.md    this file
├── SPEC.md      v0.1 specification
└── LICENSE      CC0 1.0 public domain dedication
```

## Contributing

The spec is currently authored as part of the 6NZ editor project. Open
questions in `SPEC.md` §8 are the natural starting point for discussion.

## Relationship to 6NZ

6NZ is a purpose-built editor for the scrml language and the first
implementation target for Z-motion. The editor is a commercial product; the
Z-motion spec is not part of that product and carries no commercial
restriction.
