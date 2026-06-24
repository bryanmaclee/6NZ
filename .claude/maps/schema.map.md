# schema.map.md
# project: editor (6nz)
# updated: 2026-06-23T19:06:22-06:00  commit: 721660a

## scrml Types (enum declarations)

Types are declared with scrml's `type Name:enum = { ... }` syntax.
No TypeScript `.d.ts`, model files, or DB schemas exist. All types live inside `<program>` scrml files.

### Mode (playground-one)  [`src/playground-one/app.scrml`]
```
type Mode:enum = { Insert, Normal, Visual, VisualLine, ToggleHold }
```
Full 5-mode vim-style set; used with named `<engine name=ModeMachine for=Mode>`; compiler enforces legal transitions.
Rendered via `<match for=Mode on=@mode>` state-child blocks (S16 idiom).

### Mode (playground-two / playground-five / playground-seven)  [multiple app.scrml files]
```
type Mode:enum = { Insert, Normal, Visual }
```
3-mode subset used in buffer + CM6 playgrounds; `<engine name=ModeMachine for=Mode>` in each.
Rendered via `<match for=Mode on=@mode>` state-child blocks (S16 idiom).

### Mode (playground-four)  [`src/playground-four/app.scrml`]
```
type Mode:enum = { Insert, Normal }
```
2-mode undo-tree editor; governed by an anonymous `<engine for=Mode initial=.Insert>`.
Rendered via `<match for=Mode on=@mode>` state-child blocks (S16 idiom).

### Mode (playground-ten)  [`src/playground-ten/app.scrml`]
```
type Mode:enum = { Nav, Edit }
```
2-mode relevance-region navigator (Nav = browse, Edit = insert text into selected region).
Governed by anonymous `<engine for=Mode initial=.Nav>` with `<onTransition>` callbacks.

### NodeKind (playground-nine)  [`src/playground-nine/app.scrml`]
```
type NodeKind:enum = { Program, Component, State, Func, Markup }
```
Editor IR node categories; used with `kindGlyph`/`kindName` helper functions.

### EditKind (playground-four)  [`src/playground-four/app.scrml`]
```
type EditKind:enum = { Initial, InsertChar, Backspace, NewLine }
```
Undo-tree node kind — what type of edit the node represents.

### CmPhase (playground-three)  [`src/playground-three/app.scrml`]
```
type CmPhase:enum = { Loading, Ready, Failed }
```
CM6 load lifecycle; replaces prior `@status` string flag. Declared as a typed cell
(`<cmPhase>: CmPhase = .Loading`) rather than `<engine>` — no smoke test gates p3,
so the lower-risk Tier-1 typed-cell form was used (S16 PA ruling). Projected to a
status string via `cmLabel(p: CmPhase)`.

### LspPhase (playground-six)  [`src/playground-six/app.scrml`]
```
type LspPhase:enum = { Disconnected, Connecting, Initializing, Ready, Failed, Closed }
```
LSP connection lifecycle; replaces prior `@lspStatus` string flag. Governed by
`<engine for=LspPhase initial=.Disconnected>` in markup (legal transitions enforced).
Projected to a display string via `lspLabel(p: LspPhase)`.

### LspPhase (playground-eight)  [`src/playground-eight/app.scrml`]
```
type LspPhase:enum = { Idle, WsOpen, Ready, WsError, WsClosed }
```
LSP connection lifecycle for the completion+hover playground; a distinct variant from p6's.
Governed by `<engine for=LspPhase initial=.Idle>` in markup. Projected via `lspLabel(p: LspPhase)`.

## Reactive State Shapes (key @cell declarations per playground)

scrml reactive state uses `@varName` declarations inside `${}` logic blocks.
Typed cells use `<cellName>: Type = initial` syntax; engines auto-declare `@mode`.

### playground-zero — Z-motion classifier
```
@pressed: Array<{ key: string, releasedDuringLifetime: number }>  — currently-held keys, press order
@lastEvent: string   — last classification result string
@log: string[]       — classification log for display
```
List rendered via `<each in=@log key=__index__>` + `<empty>` (S16 Tier-1 idiom).

### playground-one — vim-mode engine
```
@mode: ModeMachine = Mode.Insert   — governed by <engine name=ModeMachine for=Mode>
@lastKey: string
@lastTrigger: string
@log: string[]
```
Mode badge rendered via `<match for=Mode on=@mode>` state-child blocks.
Log rendered via `<each in=@log key=__index__>` + `<empty>`.

### playground-three — CM6 probe
```
<cmPhase>: CmPhase = .Loading    — typed cell (Tier-1, not engine); CmPhase enum above
@charCount: number
@lineCount: number
@docPreview: string
@error: string
```

### playground-four — undo tree
```
@mode: Mode = .Insert            — governed by <engine for=Mode initial=.Insert> (anonymous)
@nodes: Array<UndoNode>          — flat array of undo tree nodes (indexed by id)
@current: number                 — id of the currently-active node
@nextId: number
@status: string
@__lastKey: string

// UndoNode shape:
{ id, parent, children: number[], kind: EditKind, meta, lines: string[], cursorLine, cursorCol, time }

// derived (const cell):
const <treeRows> = treeRowsOf(@nodes, @current)
```
Tree rendered via `<each in=@treeRows key=@.id>`. Mode badge via `<match for=Mode on=@mode>`.

### playground-nine — editor IR
```
@nodes: Array<IRNode>     — flat-indexed node tree (the editor IR sketch)
@cursorId: number         — id of the node currently under the cursor
@collapsed: number[]      — manually collapsed node ids (used only when autoCollapse=false)
@autoCollapse: boolean    — cursor-position-driven auto-collapse (locked design principle)
@lastAction: string       — status display string

// IRNode shape (inferred from source):
{ id, kind: NodeKind, label, parent: number, children: number[] }

// derived (const cells):
const <cursorLabel> = labelOf(@cursorId)
const <collapsedCount> = countCollapsed()
const <visible> = visibleLines()
```
Tree rendered via `<each in=@visible key=@.id>` + `<empty>` (S16 Tier-1 idiom).

### playground-ten — relevance-region navigator
```
@mode: Mode              — governed by <engine for=Mode initial=.Nav> with <onTransition>
@regions: Array<Region>  — list of relevance regions
@focusId: number         — id of the currently-focused region
@nextId: number          — auto-increment id for inserted regions
@transitions: number     — counter incremented by <onTransition> (Bug AB live-verify)
@lastAction: string      — status display string
@cursorX: number         — §36 animationFrame @cell bridge
@cursorY: number
@lastKey: string

// Region shape (inferred from source):
{ id, title, body, url }
```
Regions rendered via `<each in=@regions as r key=@.id>` + `<empty>` (S16 Tier-1 idiom).

## Engine Declarations (markup structural elements)

Engines in markup govern typed enum cells and enforce legal transitions at compile time.

| Playground | Element | Type | initial | Notes |
|---|---|---|---|---|
| p1 | `<engine name=ModeMachine for=Mode>` | Mode (5-arm) | `.Insert` | named; auto-declares `@mode: ModeMachine` |
| p2 | `<engine name=ModeMachine for=Mode>` | Mode (3-arm) | `.Normal` | named |
| p4 | `<engine for=Mode initial=.Insert>` | Mode (2-arm) | `.Insert` | anonymous |
| p5 | `<engine name=ModeMachine for=Mode>` | Mode (3-arm) | `.Normal` | named |
| p6 | `<engine for=LspPhase initial=.Disconnected>` | LspPhase (6-arm) | `.Disconnected` | anonymous; LSP lifecycle |
| p7 | `<engine name=ModeMachine for=Mode>` | Mode (3-arm) | `.Normal` | named |
| p8 | `<engine for=LspPhase initial=.Idle>` | LspPhase (5-arm) | `.Idle` | anonymous; LSP lifecycle |
| p10 | `<engine for=Mode initial=.Nav>` | Mode (2-arm) | `.Nav` | anonymous; has `<onTransition>` callbacks |

## Database Models

No schema files. No database.

## GraphQL / Proto

No GraphQL or proto files.

## Tags
#editor #6nz #map #schema #scrml #types #playgrounds #enum #engine #each #match

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
