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
- Other project repos (scrmlTS, scrml-support, giti) — **except** writing message files into their `handOffs/incoming/` (see Cross-repo messaging below)

### Session-start checklist (this repo only)
1. Read `pa.md` (this file)
2. Read `hand-off.md`
3. List `handOffs/incoming/*.md` (ignore `read/` subdir); if any exist, surface to user
4. Read the last ~10 entries from `/home/bryan-maclee/scrmlMaster/scrml-support/user-voice.md`
5. Rotate `hand-off.md` → `handOffs/hand-off-<N>.md`
6. Create fresh `hand-off.md`
7. **FIRST SESSION ONLY:** run `project-mapper` cold to produce `.claude/maps/` + non-compliance report
8. Prompt user about incremental map refresh on subsequent sessions
9. Report: caught up + inbox + next priority

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
- Do not edit files in other repos (the user will open a different Claude instance). The single exception is dropping message files into `<sibling>/handOffs/incoming/` — see Cross-repo messaging below.
- Do not modify scrml8 (frozen)
- Do not commit to main directly
- Do not bypass pre-commit hooks without explicit user authorization
- Do not run resource-mapper in write mode on scrml8 (frozen)
- Do not treat stale sources as authoritative — check currency flags

---

## Cross-repo messaging (dropbox)

**You are the PA for 6nz.** Your own inbox is `handOffs/incoming/` in this repo.

The four ecosystem projects (scrmlTS, scrml-support, giti, 6nz) communicate asynchronously through file-based dropboxes. Each repo owns `handOffs/incoming/` — unread messages sit there; once this PA reads and acts on them, they move to `handOffs/incoming/read/`.

**This is the ONE sanctioned exception** to "do not write into sibling repos." PAs may write message files into a sibling's `handOffs/incoming/` — nothing else in the sibling repo is touched.

### Inbox (this PA reads)
- `/home/bryan/scrmlMaster/6NZ/handOffs/incoming/` — unread
- `/home/bryan/scrmlMaster/6NZ/handOffs/incoming/read/` — archive

### Outbox targets (this PA may write into)
- scrmlTS:       `/home/bryan/scrmlMaster/scrmlTS/handOffs/incoming/`
- scrml:         `/home/bryan/scrmlMaster/scrml/handOffs/incoming/`
- scrml-support: `/home/bryan/scrmlMaster/scrml-support/handOffs/incoming/`
- giti:          `/home/bryan/scrmlMaster/giti/handOffs/incoming/`
- master:        `/home/bryan/scrmlMaster/handOffs/incoming/`

### Message file format

Filename: `YYYY-MM-DD-HHMM-<from>-to-<to>-<slug>.md`
Example: `2026-04-11-1432-6nz-to-scrmlTS-compiler-api-request.md`

```markdown
---
from: 6nz
to: scrmlTS
date: 2026-04-11
subject: <one-line subject>
needs: reply | action | fyi
status: unread
---

<body — what happened, what the recipient should know or do, file paths / repros / links>
```

### Session-start: check incoming

Add to the session-start checklist (after reading `hand-off.md`):
- List `handOffs/incoming/*.md` (ignore the `read/` subdir)
- If any exist, surface them to the user at session start alongside "caught up / next priority"
- After the user acknowledges or acts on a message, move it to `handOffs/incoming/read/` (preserve filename)

### Sending a message

When this PA needs to tell another project something (compiler API need, z-motion spec update, design decision locked):
1. Confirm with the user what to send and to whom
2. Write the message file directly into the target's `handOffs/incoming/` (absolute path above)
3. Log the send in this repo's `hand-off.md` so there's a local trail

### Push coordination via master

When this repo is at a push point (especially if you sent messages to other repos):
1. Send a `needs: push` message to master (`/home/bryan/scrmlMaster/handOffs/incoming/`)
2. List which repos are affected (this repo + any repos you dropped messages into)
3. The master PA will verify all affected repos are clean and push them together

### Agent staging via master

Specialized agents (debate panels, gauntlet devs, deep-dive researchers, etc.) are stored in `~/.claude/agentStore/` and are NOT loaded by default. When a task requires agents not in this repo's `.claude/agents/`:

**Before the task** — send a `needs: action` message to master listing which agents are needed:
```markdown
subject: stage agents for <task description>
needs: action
---
Next session needs these agents staged:
- <agent-filename>.md
- <agent-filename>.md
Target: 6NZ
```
The master PA will copy them into this repo's `.claude/agents/` and tell the user to launch a new session.

**After the task** — send a `needs: action` message to master requesting cleanup:
```markdown
subject: task complete — clean up staged agents
needs: action
---
<Task> complete. Remove staged agents from 6NZ.
Agents to remove: <agent-filename>.md, <agent-filename>.md
```

### Scope of the exception
- **Allowed:** creating new `.md` files inside `<sibling>/handOffs/incoming/`
- **NOT allowed:** reading, editing, or deleting anything else in a sibling repo. Messages are a one-way write; the sibling's PA reads them in its own session.
