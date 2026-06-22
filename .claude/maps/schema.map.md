# schema.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: 3ee4bc5

## scrml Types (enum declarations)

Types are declared with scrml's `type Name:enum = { ... }` syntax inside `<program>` `${}` blocks.
No TypeScript `.d.ts`, model files, Prisma, GraphQL, or DB schemas exist.

### Mode (playground-one)  [src/playground-one/app.scrml]
```
type Mode:enum = { Insert, Normal, Visual, VisualLine, ToggleHold }
```
Full 5-mode vim set. Used with `<engine name=ModeMachine for=Mode initial=.Insert>`. Compiler
enforces legal transitions. Helper: `fn modeName(m: Mode) -> string { match m { ... } }`

### Mode (playground-two, playground-five, playground-seven)  [multiple app.scrml]
```
type Mode:enum = { Insert, Normal, Visual }
```
3-mode subset used in buffer + CM6 playgrounds. Each has its own `<engine for=Mode initial=.Normal>`.

### Mode (playground-ten)  [src/playground-ten/app.scrml]
```
type Mode:enum = { Nav, Edit }
```
2-mode navigator. Used with unnamed `<engine for=Mode initial=.Nav>` (Bug AE workaround: no `name=`).

### NodeKind (playground-nine)  [src/playground-nine/app.scrml]
```
type NodeKind:enum = { Program, Component, State, Func, Markup }
```
Editor IR node categories. Helpers: `kindGlyph(k: NodeKind)` (single char), `kindName(k: NodeKind)`.

### EditKind (playground-four)  [src/playground-four/app.scrml]
```
type EditKind:enum = { Initial, InsertChar, Backspace, NewLine }
```
Undo-tree node kind. Helper: `fn kindLabel(k: EditKind) -> string { match k { ... } }` (uses `fn`
shorthand for implicit-return; `function` form had a codegen bug dropping the `return` from match-IIFE).

## Reactive State Shapes (key @cell declarations per playground)

### playground-zero — Z-motion classifier  [src/playground-zero/app.scrml]
```
@pressed  Array<{ key: string, releasedDuringLifetime: number }>  — held keys in press order
@lastEvent  string                                                 — last classification result
@log  string[]                                                     — recent classifications (12 max)
```

### playground-one — mode machine  [src/playground-one/app.scrml]
```
@mode: ModeMachine  Mode   — current editor mode (engine-typed)
@lastKey  string           — last key pressed
@lastTrigger  string       — trigger string for last transition
@log  string[]             — transition log (15 entries max)
```

### playground-two — buffer + cursor  [src/playground-two/app.scrml]
```
@mode: ModeMachine  Mode   — current mode
@buffer  string            — full document text (newlines = charCode 10)
@cursor  number            — cursor position (byte index into @buffer)
@_selAnchor  number        — visual selection anchor
@pressed  Array<{ key: string, releasedDuringLifetime: number }>  — z-motion classifier state
@lastEvent  string         — last event description for status
```

### playground-three — CM6 probe  [src/playground-three/app.scrml]
```
@charCount  number    — document character count from CM6 updateListener
@lineCount  number    — document line count from CM6 updateListener
@docPreview  string   — first 100 chars of CM6 doc (live-updating)
@status  string       — CM6 load status
@error  string        — error message if load failed
```

### playground-four — undo tree  [src/playground-four/app.scrml]
```
@nodes  Array<UndoNode>   — flat-indexed undo tree arena
@currentId  number        — active node id

// UndoNode shape:
{ id: number, parent: number, children: number[], kind: EditKind,
  meta: string, lines: string[], cursorLine: number, cursorCol: number, time: number }
```

### playground-five — vim on CM6  [src/playground-five/app.scrml]
```
@mode: ModeMachine  Mode   — current mode
@cursorLine  number        — CM6 cursor line (1-indexed, from updateListener)
@cursorCol  number         — CM6 cursor column (1-indexed)
@docLength  number         — document length
@lineCount  number         — line count
@cmStatus  string          — CM6 load status
@cmError  string           — CM6 load error
@lastEvent  string         — last event description
```

### playground-six — LSP diagnostics  [src/playground-six/app.scrml]
```
@cmStatus, @cmError        — CM6 load status (same pattern as p5)
@lspStatus  string         — WebSocket connection state ("disconnected"/"ready"/etc)
@lspError  string          — LSP error message
@diagCount  number         — count of active diagnostics
@diagnostics  Array<any>   — raw LSP diagnostic objects
@cursorLine, @cursorCol, @docLength, @lineCount  — same as p5
@nextId  number            — JSON-RPC request ID counter
@docUri  string            — "file:///playground-six.scrml" (fixed URI sent to LSP)
```

### playground-seven — z-motion on CM6  [src/playground-seven/app.scrml]
Same reactive cells as p5 plus:
```
@pressed  Array<{ key: string, releasedDuringLifetime: number }>  — z-motion classifier state
```

### playground-eight — LSP completion + hover  [src/playground-eight/app.scrml]
```
@docUri, @docVersion  — LSP document identity
@docLength, @lineCount  — doc metrics
@cmStatus, @cmError   — CM6 load
@lspStatus  string    — "idle" / "ready" / "error"
@lspMsgsIn, @lspMsgsOut  number  — message counters
@diagCount  number
@diagSummary  string
@lastCompletion  string   — last received completion item label
@completionCount  number
@lastHover  string        — last received hover content
@hoverCount  number
```

### playground-nine — editor IR  [src/playground-nine/app.scrml]
```
@nodes  Array<IRNode>    — flat-indexed node arena
@cursorId  number        — cursor node id
@collapsed  number[]     — manually collapsed node ids (only when autoCollapse=false)
@autoCollapse  boolean   — cursor-position-driven auto-collapse (locked design principle)
@lastAction  string      — status display

// IRNode shape:
{ id: number, kind: NodeKind, label: string, parent: number, children: number[] }
```

### playground-ten — relevance navigator  [src/playground-ten/app.scrml]
```
@regions  Array<Region>  — relevance region list
@focusId  number         — focused region id
@nextId   number         — auto-increment id for new regions (starts at 4)
@transitions  number     — incremented by <onTransition> (Bug AB live-verify)

// Region shape:
{ id: number, title: string, body: string, url: string }
```

## Database Models

No database.

## GraphQL / Proto

No GraphQL or proto files.

## Tags
#editor #6nz #map #schema #scrml #types #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
