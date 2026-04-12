# 6nz — Editor Architecture

**Purpose:** Detailed design reasoning for 6nz's core architectural
concepts. These are directionally locked decisions from S4 design
sessions. `editor-README.md` has the high-level principles; this
document has the *why* and *how*.

**Last updated:** 2026-04-12 (S5)

---

## 1. Focus-Centered Viewport as Relevance View

### What it is

The viewport is NOT a scrolling window over a file. It is a
**composed view** with two distinct regions:

- **Edit region** (center): the 3-5 lines the developer is actively
  working on, plus 1-2 context lines above and below. This is
  LINE-level centering — the cursor line is always near screen center,
  but the cursor character is not pinned horizontally.

- **Relevance region** (surrounding the edit region): the rest of the
  visible screen, populated with **semantically relevant lines** pulled
  from anywhere in the project. Not file-continuous — these lines are
  chosen by relevance to what's in the edit region.

### What goes in the relevance region

When the cursor is on a line, the editor surfaces lines that help
the developer understand or work with that line without navigating
away. Examples:

- **Declarations** of symbols used on the cursor line (variable
  definitions, function signatures, type declarations)
- **Callers / dependents** — who calls this function, who reads this
  variable
- **Sibling implementations** — other branches of the same match/switch,
  other methods on the same component
- **Import origins** — where an imported symbol is defined, what it
  exposes
- **Test coverage** — relevant test assertions for the cursor context

The exact relevance algorithm is implementation-defined and expected
to evolve. The architectural commitment is: **the viewport is a
composed view, not a scroll position.**

### Why not traditional scrolling

Traditional editors show the file as a long document and the viewport
is a window you slide up and down. This means:

- Related code that's far apart in the file requires the developer to
  scroll back and forth, holding context in their head
- The screen is full of code that's *near* the cursor but not
  *relevant* to it — the lines just above might be an unrelated
  function
- The developer has to actively navigate to find declarations,
  callers, types — or rely on hover popups that obscure the code

The relevance view inverts this: the screen always shows what matters,
regardless of where it lives in the file (or which file it's in).

### Correction from editor-README.md

`editor-README.md` §1 says "cursor at screen center." This is
imprecise. It's LINE-level centering: the cursor's line is centered,
but the cursor character moves freely within that line. The document
moves vertically to keep the edit region centered; the developer
never scrolls.

### Open questions

- Relevance ranking algorithm — how to weight declarations vs callers
  vs siblings vs tests
- Transition animation — when the cursor moves to a new line and the
  relevance region recomposes, how to make the change legible (not
  jarring)
- Manual pinning — can the developer pin a line to the relevance
  region so it stays visible regardless of cursor position?
- Density — how many relevance lines to show vs how much empty space
  to preserve for readability

---

## 2. Inline-Everything File Navigation

### What it is

scrml's logical nesting means files are a **packaging choice**, not a
semantic boundary. A component defined in one file and imported into
another is semantically part of the importing context. 6nz treats the
project as a **single conceptual document** and inlines imported
components where they're referenced.

When the cursor is on a line that references an imported component,
that component's definition can be expanded inline — not in a separate
tab, not in a split pane, but directly in the document flow, nested
under the reference.

### Two traversal modes

6nz provides two ways to move through code, mirroring the two ways
developers think about structure:

**Lexical traversal** — up/down/left/right through the text as
written. This is traditional cursor movement. Lines appear in
document order. Moving down from line 10 goes to line 11.

**Logical traversal** — step-into / step-out / step-over, using the
same mental model as a debugger:

- **Step into**: on a component reference, expand its definition
  inline and move the cursor into it. The reference becomes a nested
  scope.
- **Step out**: collapse the current inline expansion and return the
  cursor to the reference that opened it. The nested scope folds back
  to a single line.
- **Step over**: move to the next sibling at the current nesting
  level, skipping over inline expansions.

This is the direct application of the "writing code IS debugging code"
principle: the cursor is a virtual program counter, and navigating
code structure works exactly like stepping through execution.

### Auto-collapse

Inline expansions are **cursor-position-driven**. When the cursor
leaves an inline expansion (via step-out, or by moving lexically past
it), the expansion auto-collapses. The developer never manually
manages fold state. The rule is simple: what the cursor is in stays
expanded; everything else collapses.

This means the visible document is always focused on the developer's
current context. Moving the cursor reshapes what's expanded, like a
flashlight illuminating the part of the codebase you're looking at.

### Why files are a packaging choice

In most editors, files are the primary organizational unit. You "open
a file" and work in it. But in scrml, a component defined in
`button.scrml` and used in `form.scrml` is logically *part of* the
form. The file boundary is an artifact of how source is stored on
disk, not a reflection of the code's structure.

6nz treats files as storage containers, not semantic boundaries. The
developer navigates the *logical structure* (components, scopes,
definitions) rather than the *physical structure* (files, directories).
Files still exist on disk — they're just not the primary navigation
unit in the editor.

### Interaction with the relevance view (§1)

Inline expansion and the relevance view are complementary:

- The **relevance region** shows related lines passively — the
  developer doesn't have to do anything to see declarations and
  callers
- **Inline expansion** is active — the developer explicitly steps
  into a reference to see its full definition in-flow

The relevance region answers "what else matters here?" The inline
expansion answers "show me the details of *this specific thing*."

### Open questions

- Depth limit — how many levels of inline nesting before the view
  becomes unusable?
- Multi-file edits — if the developer edits an inline expansion, the
  change applies to the source file. How to make this clear visually?
- Breadcrumb / trail — when nested 3 levels deep, how does the
  developer know where they are?
- Performance — inline expansion requires the compiler to resolve
  imports and provide AST context on demand

---

## 3. Editor IR (Intermediate Representation)

### What it is

The on-disk canonical `.scrml` source and the in-editor
representation are **decoupled**. The editor does not work directly
on the text file. Instead:

```
disk → canonical scrml → Editor IR → display
                 ↑                       ↓
              (save)                 (render)
```

- **Load**: read `.scrml` from disk → parse to canonical AST → expand
  into Editor IR (inline expansions, relevance annotations, fold
  state, logical nesting)
- **Edit**: all edits happen on the Editor IR
- **Save**: Editor IR → canonical AST → write `.scrml` to disk

### Why decouple

The inline-everything model (§2) and the relevance view (§1) both
require the editor to display code in a form that doesn't match how
it's stored on disk:

- Inline expansions show code from other files nested into the current
  view — that nesting doesn't exist on disk
- The relevance region composes lines from across the project into a
  single viewport — those lines aren't contiguous on disk
- Logical traversal operates on semantic structure (component
  boundaries, scope nesting) — the text file is flat

Without an IR, the editor would have to constantly translate between
"what the developer sees" and "what's on disk," with every keystroke
touching both representations. The IR makes the editor's internal
model match what the developer sees, and translation to/from disk
happens only at load and save boundaries.

### What the IR must support

- **Inline expansion**: a reference node in the IR can expand to
  include the full subtree of the referenced definition, drawn from
  another file's IR
- **Relevance composition**: the IR can attach "relevance annotations"
  to nodes — pointers to other nodes elsewhere in the project that
  are semantically related
- **Logical traversal**: the IR's tree structure directly supports
  step-into / step-out / step-over without requiring the editor to
  reconstruct scope boundaries from flat text
- **Edit locality**: an edit to an inline-expanded node writes through
  to the correct source location in the IR, which writes through to
  the correct file on save
- **Cursor-driven fold state**: the IR tracks which expansions are
  active (cursor is inside them) and which are collapsed

### Relationship to the compiler AST

The Editor IR is NOT the compiler's AST. It's a higher-level
structure that may reference compiler AST nodes but adds
editor-specific concerns (fold state, relevance, display layout).
The compiler AST is an input to the IR construction, not the IR
itself.

### Open questions

- IR serialization — editor state (which expansions were open,
  cursor position, relevance pins) MUST persist across sessions
  (locked S5). Mechanism TBD (workspace file? hidden metadata?).
- Incremental update — when the developer types a character, how much
  of the IR needs to recompute? The IR must be at least as incremental
  as the compiler
- Multi-cursor — how do multiple cursors interact with cursor-driven
  fold state? Each cursor has its own expansion context?

---

## 4. Public Config Sharing (`:km@username`)

### What it is

Any non-sensitive configuration is publishable by username. The
notation `:km@username` (keymap at username) loads that user's
published config as a layer.

### Use case

Sit down at someone else's computer (or a fresh install). Pull your
config:

```
:km@bryan
```

Your keybindings, motion preferences, UI layout, color scheme — all
loaded. You're working in your own environment immediately, on
someone else's machine.

### Config stacking

Configs are **stackable secondary layers**:

- **Base layer**: the editor's defaults (Layer 0 from editor-README.md
  §5)
- **Primary layer**: the local user's config (Layers 1-3)
- **Secondary layers**: pulled `:km@username` configs, applied in
  order on top

This means you can compose configs. Pull a coworker's keybindings
but keep your own color scheme. Pull a community-published motion
vocabulary but override three bindings you don't like.

### Versioning

Published configs are versioned. `:km@bryan` gets the latest;
`:km@bryan@v3` gets a specific version. The developer's local config
always wins over pulled layers (explicit override). Pulled configs
are cached locally and updated on demand, not automatically.

### Sanitization

On upload, configs are sanitized to strip anything sensitive:

- No file paths, project names, or directory structures
- No API keys, tokens, or credentials
- No plugin configs that reference local resources

The sanitization is aggressive — it's better to strip too much and
require the user to re-add a preference than to leak something
sensitive.

### Open questions

- Hosting — where do published configs live? (Centralized registry?
  Git-based? IPFS? Tied to giti?)
- Discovery — how do you find good configs to try? Community
  curation? Popularity? Category tags?
- Scope — is it just keymaps (`:km@`) or all config (`:cfg@`)? What
  about just z-motion bindings (`:zm@`)?
- Conflict resolution — when two pulled layers disagree, who wins?
  (Last-applied? Explicit priority? Error?)

---

## 5. Split-Block-to-File

### What it is

A block of code (a component, a scope, a definition) can be extracted
from its current location into a new file as a **cheap IR operation**.
The block is replaced with an import reference, and the extracted
code becomes the new file's content.

### Why it's cheap

In a traditional editor, extracting code to a new file requires:
1. Cut the code
2. Create a new file
3. Paste the code
4. Add the import statement in the original file
5. Fix any references

In 6nz, because the Editor IR (§3) already models inline expansion,
splitting a block out is just the reverse operation: collapse an
inline scope into a reference and write the scope's content to a new
file. The IR already knows the scope boundaries, the references, and
the import structure. The operation is:

1. IR: detach subtree, create file node, replace with import reference
2. Save: write both files

Two steps. No clipboard, no manual import fixup.

### Relationship to inline expansion

Split-to-file is the inverse of step-into (§2). If step-into expands
a reference to show the definition inline, split-to-file collapses
an inline definition into a reference and externalizes the content.
They're the same operation in opposite directions.

### Open questions

- Naming — where does the new file go? What's it named? (Auto-suggest
  from the block's identifier? Prompt the developer?)
- Undo — is this one undo step or two? (One makes sense — it's one
  logical operation that produces two file writes)
- Threshold — should the editor suggest splitting when a file gets
  too long? Or is that too opinionated?

---

## 6. Normal-Mode Toggle Keys

### Current state (SPEC §10.3)

The spec defines normal-mode toggle keys: hold a designated key, and
while held, other keys fire as Vim normal-mode commands (tap-
repeatable, on KEYDOWN, honoring OS key repeat). Release exits the
mode. The prototype uses `[f]` for the left hand with hjkl only.

### Constraints (locked)

- **One per hand** — symmetrical access. The left hand has one, the
  right hand has one. Either hand can toggle normal mode.
- **Home row, index or middle finger** — must be a comfortable,
  quick-access key. Not `t`/`y` (uncomfortable reach for something
  used frequently). Not pinky (already occupied by `a`/`;`).
- **Hold-while-active** — not tap-to-toggle. Hold to enter, release
  to exit. Same philosophy as z-motion holds.
- **Scope: full Vim normal-mode vocabulary** — not just hjkl. Motions
  + edits + everything.

### Viable key candidates (QWERTY)

Given the constraints (home row or index/middle, symmetrical, one
per hand), the candidates are:

| Left hand | Right hand | Notes |
|---|---|---|
| `f` | `j` | Both index finger. `f` is in the prototype. But `j` is a vertical motion hold `[j]` and `f` collides with find-char. |
| `d` | `k` | Both middle finger. `d` is the left-hand roll pivot (currently unbound in defaults). `k` is the right-hand roll pivot (also unbound). But `d` is reserved for operator composition (`[dw]`, `[dd]`). |
| `g` | `h` | Both index finger (reach row). `g` is not home row — violates constraint. `h` is char-motion hold `[h]`. |

The collision analysis:
- **`f`**: conflicts with find-char hold family (not yet specced but
  natural mnemonic). If `f` is the toggle, find-char needs a different
  key.
- **`j`**: conflicts with vertical motion hold `[j]` (locked decision
  from S4). Can't be both.
- **`d`**: reserved for operator composition `[d...]` (§10.1). Can't
  be both.
- **`k`**: currently unbound pivot. No collision. But paired with
  what on the left?
- **`h`**: char-motion hold `[h]` (locked). Can't be both.

### The tension

Every comfortable home-row index/middle key is already claimed or
reserved by z-motion families. The normal-mode toggle needs dedicated
keys that don't participate in the z-motion grammar at all — but
the z-motion grammar was designed to use every home-row key.

### Open questions

- Which keys? The collision analysis above narrows it but doesn't
  resolve it. Possible paths:
  - Accept `f`/`j` and relocate the conflicting families (find-char
    moves off `f`, vertical motion moves off `j`)
  - Accept a non-home-row key if it's comfortable enough (but user
    explicitly rejected `t`/`y`)
  - Use a modifier combo (Ctrl+key, CapsLock) instead of a plain
    letter — but this breaks the "any key can be a hold" purity
  - Latch keys (§10 concept) might interact — if latch + normal-mode
    toggle share a mechanism, the key budget changes
- Coexistence — when the toggle is held, z-motion gestures are
  inactive (§10.3). But what about sustained gestures (§6.4) that
  were mid-flight? Edge case or impossible by construction?
- Visual feedback — how does the developer know normal mode is active?
  Cursor shape? Status line? Viewport tint?
