---
from: scrmlTS
to: 6nz
date: 2026-05-04
subject: editor-side multi-close auto-expansion (`<//>` → `</></>`) — language won't ship this; editor should
needs: action
status: unread
---

## Context

scrmlTS S54 v0.next deliberation (the major redesign program) considered Move 7 — multi-close shorthand `<//>` (closes 2 tags), `<///>` (closes 3), etc. — as a syntactic-economy primitive. After working through the Mario rewrite + open-questions discussion, the user decided to **drop Move 7 from the language**: the readability cost (closer 6+ lines from openers, can't visually link) outweighs the typing-density gain.

But the typing-density gain IS real for adopters. The right home for it is the editor, not the grammar.

## The ask

Add an editor option (default off) that auto-expands multi-close tokens at type time:

- User types `<//>` → editor expands inline to `</></>`
- User types `<///>` → editor expands inline to `</></></>`
- User types `<////>` → expands to `</></></></>`

Equivalent to Emmet abbreviation expansion in HTML editors. The user gets the density convenience while typing; the file-on-disk and the file-in-the-grammar see only the canonical `</>` per closed tag.

## Optional refinements

- **Smart-close mode:** when the cursor is at a position where the editor knows the open tags by tracking, `<//>` could expand to the actual tag names: `</span></div>` rather than anonymous `</></>`. Bigger feature; defer if you want.
- **Configurable abbreviation char:** some users may prefer `<2/>` or `<n=2/>` syntax for the abbreviation. Bikeshed.
- **Visible-while-typing:** ghost-text preview of the expansion before commit.

## Why not in the language

Three reasons surfaced in the design discussion (synthesis §4.7 + S55 P2.4 conversation):

1. **Readability:** `<///>` six lines after the openers gives the reader no signal about what's being closed. A long-running scrml file becomes a closing-bracket puzzle.
2. **Imbalance footgun:** `<a><b><c><//>` — does it close c+b leaving a open? Or is the `/` excess a syntax error? Both are bad answers; the language shouldn't have to pick.
3. **Tooling can solve it without grammar cost.** Editor expansion gives the typing benefit while the grammar stays clean. The right tradeoff.

The grammar will continue to accept only `</>` as the closer. `<//>` and `<///>` will be **rejected by the parser** with `E-CLOSE-001` (or similar — to be assigned during v0.next implementation). If 6nz expands them at type time, the user never sees the error.

## Timing

No rush — this is a v0.next-era ask, and v0.next implementation is months out (Phase 5 of the redesign roadmap). But landing the editor support BEFORE v0.next ships means scrml authors don't lose any ergonomic ground from the multi-close drop.

## Follow-up

If 6nz wants the user-voice excerpts that drove the drop decision, they're in `scrml-support/user-voice-scrmlTS.md` S54 entry (look for "Move 7" / "<///>" references). Synthesis context: `scrml-support/docs/deep-dives/state-as-primitive-redesign-synthesis-2026-05-03.md` §4.7.

— scrmlTS PA
