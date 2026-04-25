# schema.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## scrml Types (from playground source)

Types are declared with scrml's `type Name:enum = { ... }` syntax.
No TypeScript `.d.ts` or model files exist. All types live inside `<program>` scrml files.

### EditKind  [`src/playground-four/app.scrml`]
```
type EditKind:enum = { Initial, InsertChar, Backspace, NewLine }
```
Variant of a tree node — what kind of edit the node represents.

### Mode (playground-one)  [`src/playground-one/app.scrml`]
```
type Mode:enum = { Insert, Normal, Visual, VisualLine, ToggleHold }
```
Vim-style editor mode. Used with `<machine>` primitive; compiler enforces legal transitions.

### Mode (playground-two)  [`src/playground-two/app.scrml`]
```
type Mode:enum = { Insert, Normal, Visual }
```
Simpler 3-mode subset used in playground-two (no VisualLine or ToggleHold).

## Reactive State Shapes (from playground source)

scrml reactive state uses `@varName` syntax. Shapes below are the logical data models.

### playground-zero — classifier state
```
@pressed: Array<{ key: string, releasedDuringLifetime: number }>
@lastEvent: string
@log: string[]
```

### playground-four — undo tree node
```
// Node shape (per @nodes array, indexed by id):
{
  id: number,
  parent: number,      // -1 for root
  children: number[],
  kind: EditKind,
  meta: string,
  lines: string[],
  cursorLine: number,
  cursorCol: number,
  time: number
}
```

### playground-three — CM6 bridge state
```
@charCount: number
@lineCount: number
@docPreview: string
@status: string
@error: string
```

## Database Models

No schema files. No database.

## GraphQL / Proto

No GraphQL or proto files.

## Tags
#6nz #map #schema #scrml #types #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
