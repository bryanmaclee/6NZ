# schema.map.md
# project: editor (6nz)
# updated: 2026-06-22T00:00:00Z  commit: d2e9667

## scrml Types (enum declarations)

Types are declared with scrml's `type Name:enum = { ... }` syntax.
No TypeScript `.d.ts`, model files, or DB schemas exist. All types live inside `<program>` scrml files.

### Mode (playground-one)  [`src/playground-one/app.scrml`]
```
type Mode:enum = { Insert, Normal, Visual, VisualLine, ToggleHold }
```
Full 5-mode vim-style set; used with `<engine>` primitive; compiler enforces legal transitions.

### Mode (playground-two / playground-five / playground-seven)  [multiple app.scrml files]
```
type Mode:enum = { Insert, Normal, Visual }
```
3-mode subset used in buffer + CM6 playgrounds.

### Mode (playground-ten)  [`src/playground-ten/app.scrml`]
```
type Mode:enum = { Nav, Edit }
```
2-mode relevance-region navigator (Nav = browse, Edit = insert text into selected region).

### NodeKind (playground-nine)  [`src/playground-nine/app.scrml`]
```
type NodeKind:enum = { Program, Component, State, Func, Markup }
```
Editor IR node categories; used with kindGlyph/kindName helper functions.

### EditKind (playground-four)  [`src/playground-four/app.scrml`]
```
type EditKind:enum = { Initial, InsertChar, Backspace, NewLine }
```
Undo-tree node kind — what type of edit the node represents.

## Reactive State Shapes (key @cell declarations per playground)

scrml reactive state uses `@varName` declarations inside `${}` logic blocks.

### playground-zero — Z-motion classifier
```
@pressed: Array<{ key: string, releasedDuringLifetime: number }>  — currently-held keys, press order
@lastEvent: string   — last classification result string
@log: string[]       — classification log for display
```

### playground-four — undo tree
```
@nodes: Array<UndoNode>  — flat array of undo tree nodes (indexed by id)
@currentId: number       — id of the currently-active node

// UndoNode shape:
{ id, parent, children: number[], kind: EditKind, meta, lines: string[], cursorLine, cursorCol, time }
```

### playground-nine — editor IR
```
@nodes: Array<IRNode>     — flat-indexed node tree (the editor IR sketch)
@cursorId: number         — id of the node currently under the cursor
@collapsed: number[]      — manually collapsed node ids (used only when autoCollapse=false)
@autoCollapse: boolean    — cursor-position-driven auto-collapse (locked design principle)
@lastAction: string       — status display string

// IRNode shape (inferred from source):
{ id, kind: NodeKind, label, parent: number, children: number[] }
```

### playground-ten — relevance-region navigator
```
@regions: Array<Region>   — list of relevance regions
@focusId: number          — id of the currently-focused region
@nextId: number           — auto-increment id for inserted regions
@transitions: number      — counter incremented by <onTransition> (Bug AB live-verify)
@lastAction: string       — status display string

// Region shape (inferred from source):
{ id, title }
```

## Database Models

No schema files. No database.

## GraphQL / Proto

No GraphQL or proto files.

## Tags
#editor #6nz #map #schema #scrml #types #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
