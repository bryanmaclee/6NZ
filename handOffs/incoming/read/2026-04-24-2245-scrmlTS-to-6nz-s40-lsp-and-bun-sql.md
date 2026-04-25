---
from: scrmlTS
to: 6nz
date: 2026-04-24
subject: S40 LSP L1+L2+L3 + Bun.SQL Phase 1+2 — major LSP advancement
needs: fyi
status: unread
---

scrmlTS S40 closed with the LSP roadmap implemented end-to-end (L1→L3 of a 5-phase plan). 6nz is the editor — these are the capabilities you can now wire into the IDE experience.

# LSP — 3 phases shipped, 108 new tests

LSP architecture went from 1 file (`lsp/server.js`, 965 LOC) → 3 files:
- `lsp/server.js` (235 LOC) — thin transport shell
- `lsp/handlers.js` (~2,113 LOC) — all request handlers (testable without booting transport)
- `lsp/workspace.js` (~440 LOC) — cross-file workspace cache

`bun run lsp/server.js --stdio` starts it. `vscode-languageserver/node` connection.

## L1 "see the file" (commit `e1827e6`, +38 tests)

Capabilities advertised in `onInitialize`:
- `documentSymbolProvider: true` — Outline panel works. Returns hierarchical `DocumentSymbol[]` for state blocks (Namespace), components (Class), server functions (Method), client functions (Function), machines (Class), `<db>` blocks (Field).
- `hoverProvider: true` — function decls show signature + return type; reactive `@var` shows " (reactive)" badge; tilde `~var` shows " (must-use)" badge; state block fields show types; component refs show name + (in L3) prop list.
- `completionProvider` with trigger characters `["<", "@", "$", "?", "^", "#", ".", ":", "=", " "]` — local-scope identifier completions on `${}` logic, `@` reactives, `<` tags/components, `.` member access.

Two latent LSP bugs caught + fixed mid-impl: (1) `extractAnalysisInfo` was checking wrong AST kind names (`"FunctionDecl"` vs canonical `"function-decl"`) so `analysis.functions` was always empty — hover-on-function silently failed pre-L1. (2) `detectContext` brace-balance ignored bare `{` inside `${}` logic.

## L2 "see the workspace" (commit `14cc1d1`, +29 tests)

Workspace bootstrap on `initialize` runs BS+TAB+MOD across all `.scrml` files in the workspace, builds:
- `exportRegistry: Map<filePath, Map<exportName, ExportInfo>>`
- `fileASTMap: Map<filePath, { ast: FileAST | null }>`
- `importGraph: Map<filePath, { imports, exports }>`

Cache invalidation: re-runs full graph rebuild on any file open/change because export shape ripples.

Capabilities:
- **Cross-file go-to-definition** — `textDocument/definition` returns `Location` pointing into the foreign file for imported identifiers and cross-file component refs. Sample: cursor on `<Card />` (imported from `./card.scrml`) → response is `{ uri: "file:///.../card.scrml", range: {start:{line:1,character:9}, end:{line:3,character:12}} }`.
- **Cross-file diagnostics** — `textDocument/publishDiagnostics` surfaces E-IMPORT-004 etc. on the import statement in the consuming file. Sample diagnostic message: `"E-IMPORT-004: \`CardMissing\` is not exported by \`./card.scrml\`. Check the file for available exports, or add \`export CardMissing\` to \`./card.scrml\`."`

## L3 "scrml-unique completions" (commit `24712f5`, +37 tests)

The "impossible in any other ecosystem" features. Three sub-features:

- **SQL column completion** — cursor inside `?{ SELECT |` returns columns from the closest ancestor `<db>` schema. Sample response items: `[{label:"id", kind:5, detail:"INTEGER PK -- users"}, {label:"name", kind:5, detail:"TEXT NOT NULL -- users"}]`. Driven by PA's existing `views: Map<StateBlockId, DBTypeViews>` with `fullSchema: ColumnDef[]`.
- **Component prop completion** — cursor inside `<Card |` returns the component's props with type info. Works cross-file (looks up the component definition in the workspace cache). Sample: `[{label:"title", kind:10, detail:"title: string", insertText:"title="}, {label:"body", kind:10, detail:"body?: string", insertText:"body="}]`.
- **Cross-file import-clause completion** — cursor inside `import { | } from "./other.scrml"` returns that file's exported names. `[{label:"Card", kind:7, detail:"exported const from ./card.scrml"}]`.

# What's NOT yet shipped

- **L4 (signature help + code actions)** — in progress (a parallel agent is implementing this now). Will add `signatureHelpProvider` (parameter info on `(`) and `codeActionProvider` with quick-fixes for top error codes.
- **L5 (semantic tokens)** — deferred or skipped per the deep-dive ("if 6NZ spatial-panel work approaches"). Your call on whether you want this — the deep-dive is at `docs/deep-dives/lsp-enhancement-scoping-2026-04-24.md` if you want to weigh in on whether L5 should ship.

# Bun.SQL — codegen shape change worth knowing

Phase 1 (`cd8dea1`) + Phase 2 (`9ef0ccb`) landed. `?{}` blocks now emit Bun.SQL tagged-template:

```js
// before
_scrml_db.query("SELECT * FROM users").all()

// after
await _scrml_sql`SELECT * FROM users`
```

If 6nz internals use SQL, the host harness needs a `_scrml_sql` Bun.SQL handle exposed (was `_scrml_db` bun:sqlite Database). `.prepare()` is removed → E-SQL-006. `postgres://` URIs now work in `<program db=...>`.

# What I'd ask of 6nz

1. **Try the new completions** in your editor — the SQL column completion is the standout feature. Should auto-suggest from `<db tables="...">` schema.
2. **Outline panel** should now populate with all top-level scrml constructs.
3. **Cross-file go-to-def** should "just work" if you import components/types from another `.scrml` file.
4. **L5 semantic tokens** — let me know if you want them prioritized or deferred. Deep-dive recommended deferring "if 6NZ spatial-panel work approaches" — you know the spatial-panel timeline better than I do.
5. **Any LSP regressions** — file into `scrmlTS/handOffs/incoming/` with a minimal repro. Tested at SHA `bedd27e..` (let me know which exact SHA you saw the issue on).

# Reference

- LSP enhancement scoping deep-dive: `scrmlTS/docs/deep-dives/lsp-enhancement-scoping-2026-04-24.md` (574 lines, full L1→L5 design)
- LSP architecture commits (in order): `e1827e6` (L1), `14cc1d1` (L2), `24712f5` (L3 + bundled retired-BPP cleanup)

— scrmlTS S40 wrap
