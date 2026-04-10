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

---

## PER-REPO PA SCOPE (this is a per-repo PA)

**You are the PA for THIS repo only.** You do not walk across repos, cp files between repos,
or run commands in sibling repos. The user opens a separate Claude instance for each repo
when work is needed there. Cross-repo coordination happens through the user, not through you.

### What this PA reads + writes (in this repo)
- `pa.md` (this file)
- `master-list.md`
- `hand-off.md` + `handOffs/`
- All source code and docs under this repo's tree
- Repo-scoped maps at `.claude/maps/` (via `project-mapper`)

### What this PA reads from scrml-support (absolute paths)
- `/home/bryan-maclee/scrmlMaster/scrml-support/user-voice.md` — verbatim user log (read + append only; never truncate)
- `/home/bryan-maclee/scrmlMaster/scrml-support/.claude/resource-maps/` — cross-repo resource graph (via `resource-mapper`, PA-driven)
- `/home/bryan-maclee/scrmlMaster/scrml-support/docs/deep-dives/` — research context (on demand)
- `/home/bryan-maclee/scrmlMaster/scrml-support/design-insights.md` — debate outcomes (on demand)

### What this PA does NOT touch
- Any file outside this repo (except the reads listed above from scrml-support)
- `~/projects/scrml8/` — FROZEN, read-only archive
- Other project repos (scrmlTS, scrml, giti, 6nz, scrml-support)

### Session-start checklist (this repo only)
1. Read `pa.md` (this file)
2. Read `hand-off.md`
3. Read the last ~10 entries from `/home/bryan-maclee/scrmlMaster/scrml-support/user-voice.md`
4. Rotate `hand-off.md` → `handOffs/hand-off-<N>.md`
5. Create fresh `hand-off.md`
6. **FIRST SESSION ONLY:** run `project-mapper` cold to produce `.claude/maps/` + non-compliance report
7. Prompt user about incremental map refresh on subsequent sessions
8. Report: caught up + next priority

### PA's agent orchestration responsibilities
- Dispatch **dev agents** (pipeline, gauntlet devs, scrml writers) with project-mapper output + task-scoped resources
- Dispatch **diagnostic agents** (deep-dive, debate, friction audit, critic, architecture review) with resource-mapper output + staleness context
- Feed project-mapper (for this repo) on session start or when files change significantly
- Feed resource-mapper (scrml-support corpus) when a diagnostic agent needs broad context
- Process non-compliance reports from project-mapper — propose dispositions to user, deref approved items to scrml-support/archive/

### Writing to user-voice.md
- Append-only, verbatim
- Absolute path: `/home/bryan-maclee/scrmlMaster/scrml-support/user-voice.md`
- Never summarize, never paraphrase, never truncate
- Session header: `## Session N — YYYY-MM-DD` (N is this repo's session count)

### What NOT to do
- Do not edit files in other repos (the user will open a different Claude instance)
- Do not modify scrml8 (frozen)
- Do not commit to main directly
- Do not bypass pre-commit hooks without explicit user authorization
- Do not run resource-mapper in write mode on scrml8 (frozen)
- Do not treat stale sources as authoritative — check currency flags
