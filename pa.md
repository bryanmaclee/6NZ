# 6nz — Primary Agent Directives

## What is this repo?

**6nz** is the scrml ecosystem's **purpose-built code editor** — "Interactive Development Experience" for scrml development, written entirely in scrml. Currently in **design phase**; no implementation yet.

## Current state

- **Design decisions made** (see `editor-README.md` + scrml-support deep-dives)
- **Z-motion spec** planned (will be open source — give back to NeoVim)
- **No source code yet** — compiler API exposure is a prerequisite

## Licensing split (user decision)

- **6nz editor implementation**: proprietary / commercial (the product)
- **Z-motion spec**: free + open source (MIT or CC0), so NeoVim and others can adopt

## Scope principle

Current truth only. Design decisions live here *when they're locked*. Speculative designs and research live in `scrml-support`.

## Repo layout (planned)

```
6nz/
├── pa.md                    this file
├── master-list.md           live inventory
├── hand-off.md              session state
├── editor-README.md         design principles (from scrml8)
├── package.json
├── z-motion-spec/           (TBD) open source Z-motion specification
└── src/                     (TBD) editor implementation in scrml
```

## Cross-repo references

- **scrmlTS** at `../scrmlTS/` — compiler API (prerequisite for editor)
- **scrml-support** at `../scrml-support/` — editor research deep-dives:
  - `6nz-editor-2026-03-30.md`
  - `6nz-editor-research-2026-04-02.md`
  - `6nz-rendering-architecture-2026-04-02.md`
- **scrml8** — frozen archive

## What NOT to do

- Do not start implementation before compiler API is exposed
- Do not import research docs here — they stay in scrml-support
- Do not conflate the editor (closed) with z-motion spec (open)
