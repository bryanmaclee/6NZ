# 6nz — Primary Agent Directives

## What is this repo?

**6nz** is the scrml ecosystem's **purpose-built code editor** — "Interactive Development Experience" for scrml development, written entirely in scrml. Currently in **design phase**; no implementation yet.

## Current state

- **Design decisions made** (see `editor-README.md` + scrml-support deep-dives)
- **Z-motion spec** planned (will be open source)
- **No source code yet** — compiler API exposure is a prerequisite

## Licensing split (user decision)

- **6nz editor implementation**: proprietary / commercial (the product)
- **Z-motion spec**: free + open source (CC0 1.0 Universal — locked in `z-motion-spec/LICENSE`), free for anyone to adopt

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

- **scrml** at `../scrml/` — compiler API (prerequisite for editor)
- **scrml-support** at `../scrml-support/` — editor research deep-dives:
  - `6nz-editor-2026-03-30.md`
  - `6nz-editor-research-2026-04-02.md`
  - `6nz-rendering-architecture-2026-04-02.md`
- **scrml8** — frozen archive

## What NOT to do

- Exploratory scrml implementation is encouraged — find out what works by writing. The editor shell, buffer model, input/event handling, mode machine, Z-motion classifier, config system, and UI primitives can all start now. Semantic features (relevance view content, live diagnostics, completions) remain gated on scrml compiler API exposure — don't scaffold those until the API is real.
- Do not import research docs here — they stay in scrml-support
- Do not conflate the editor (closed) with z-motion spec (open)

---

## Modern PA workflow (S209 — adopted from scrml's current PA practice)

Cross-cutting PA disciplines scrml developed; they apply to any ecosystem PA.

### "wrap" — a defined operation, not a vague directive
When the user says "wrap" (or you propose it), execute ALL of: (1) **hand-off** — update `hand-off.md`
per the density directive below; (2) **master-list** — current counts/statuses/inventory deltas;
(3) **CHANGELOG** — a new dated session block at the top of `docs/changelog.md`; (4) **inbox/outbox** —
process `handOffs/incoming/` (move read → `read/`), send any due cross-repo notices; (5) **test-suite** —
run + record pass/skip/fail (6nz: N/A until implementation exists); (6) **working-tree** —
verify clean OR commit pending work (no silent uncommitted state at close); (6b) **worktree-cleanup** —
`git worktree remove` every landed agent worktree, `git branch -D` its branch, `git worktree prune`;
(6c) **maps-refresh** — `project-mapper` incremental on the session's changed files, committed with an
EXPLICIT pathspec. (7) **push** — or surface push-pending explicitly in the hand-off. (8) **meta-docs** —
user-voice (new durable directives), findings, any meta-doc with state to record. "wrap" = all steps;
"wrap, no push" = 1–6 + 8 with 7 left explicit-pending.

### Hand-off context-density (never make the next PA re-acquire)
Err on the side of bloat to capture every in-flight thread, open question, state transition, and
recovered-from anomaly. Every thread gets its own section; every recovery is documented (what went
wrong + how it was recovered + what to watch); open questions enumerated at the TOP so the next
session surfaces them first; state-as-of-close tables; a file-modification inventory at close. Bloat
is acceptable; under-documentation is not.

### Commit / push hygiene
- Commit with an EXPLICIT pathspec (`git commit -- <files>`) whenever any non-isolated agent or
  parallel work is in flight — a bare `git commit` sweeps unrelated staged work into the commit.
- NEVER bypass the pre-commit hook (`--no-verify`) without explicit user authorization.
- Coherence check before any push: `git rev-list --left-right --count origin/main...HEAD` (catches a
  committed-leak-onto-a-local-ref, which `git status` cannot show); confirm the branch tip == the
  SHA you intend to push.
- Background-commit race: a `git commit` run in the background returns BEFORE its hook + commit
  finalize — commit in the FOREGROUND when you need the resulting SHA next, or wait for the
  completion signal before reading HEAD.

### Worktree isolation + path-discipline (dev-agent dispatch)
- Background implementation agents use `isolation: "worktree"` to avoid working-tree conflicts; the
  PA lands their work via file-delta (`git checkout <agent-branch> -- <files>`) AFTER a base-check —
  verify the agent's base vs current main: a clean clobber if main hasn't touched the file since the
  base, a cherry-pick if it has.
- A sub-agent must write ONLY worktree-relative paths; a main-absolute path silently leaks into the
  live checkout. The PA verifies `git status` post-dispatch shows no unexpected main-side file mods.

### R26 — verify before claim (bidirectional)
Verify against the REAL source before claiming a thing CLOSED (a regression test that synthesizes
state can miss the upstream bug) AND before claiming it OPEN / dispatching a fix (an observation can
be a stale read — if the symptom doesn't reproduce against the real current source, classify
NOT-REPRODUCED, not OPEN).

### Context-budget wrap-timing (1M context)
This PA runs on a 1M-token window. Do NOT suggest wrap on context-% alone above ~50% remaining. The
default wrap-suggestion threshold is ~15–20% remaining. Earlier wrap only with a real reason (a
natural stopping point, a user signal, or context-density degrading). The user tracks budget as a
pacing tool — honor their explicit budget signals over conservative reflexes.

### Background-agent crash-recovery
When dispatching any background agent, instruct it to: commit after each meaningful change (don't
batch; WIP commits are fine) and update a progress file (`docs/changes/<change-id>/progress.md`)
after each step. The branch + progress file are how the next agent (or the PA) picks up after a crash.

### The flogence satellite system — vPA-deputy ADOPTED S15 (2026-06-22)
scrml built a PA-continuity satellite system — **vPA-deputy** (token-thinning maintenance sidecar:
session-start digest + a PA→deputy delta-log), **sPA** (speciality work-list execution that lands on
a branch the PA re-integrates), **cPA** (an always-on latency-bridge concierge).

**6nz has ADOPTED the vPA-deputy** (S15), proactively, ahead of the real-app-work surge (6nz integrates
into flogence as its native editor + kb-nav platform; flogence beta testers imminent). The contract is
`vpa.md` at the 6nz root — a **scaled** adaptation of `../scrml-support/vpa-scrml.md` (6nz has no
`state.ts`/flograph/dock/`@gap` machinery, so it owns a thinner surface + adds a 6nz-specific Function 4:
autonomous flogence inbox intake). The PA-side contract is the **"S15 addendum — vPA deputy (PA side)"**
section below. sPA / cPA are NOT adopted (contracts in `scrml-support` if 6nz ever needs them).

### S15 addendum — vPA deputy (PA side)
The deputy (`vpa.md`) runs alongside you as a second instance. Your side of the contract:

- **Session-start step 0 — read the digest, with a freshness guard.** Read `handOffs/digest.md` at start
  IFF it stamps `digest: current` (run `bun scripts/state.ts --check`). If it reports `STALE` or is absent,
  **DISTRUST it and fall back to the authoritative reads** (a drifted digest is worse than reading cold).
  Then read `handOffs/deputy-state.md` (the ACK tells you whether your `(vpa:)` casts landed; the HEARTBEAT
  tells you how current the deputy's state is) and `handOffs/flogence-intake.md` (flogence bugs the deputy
  queued while you were away — see F4 promotion).
- **delta-log single-writer.** You are single-writer on `handOffs/delta-log.md` — append an entry
  (`land`/`disp`/`find`/`rule`/`state`/`msg`) as you work, with a `(vpa: …)` maintenance directive when you
  want the deputy to do a maintenance act. Never block on it (async cast; you-do-it fallback covers urgency).
- **Integrate `deputy-maint`.** At your commit-points + at wrap + on boot: `git merge deputy-maint` (clean by
  construction — disjoint surface). The deputy NEVER advances main's HEAD; you integrate.
- **Surface partition — don't fight the deputy.** It owns `.claude/maps/*`, `docs/changelog.md`,
  `handOffs/{digest.md, deputy-state.md, flogence-intake.md}` + the flogence-message archival. You own
  everything substantive incl. `master-list.md §F`. When a deputy IS up, prefer a `(vpa:)` cast over editing
  a deputy-owned file directly (avoids a merge race). When NO deputy is up, do the maintenance yourself
  (regen digest via `bun scripts/state.ts --digest`, refresh maps, extend changelog, process flogence msgs).
- **Wrap-time digest regen** (the load-bearing tick): at wrap, poke the deputy for a FINAL tick (regen digest
  at the settled HEAD) + merge it — so the post-wrap start finds `digest: current` and thins. No deputy up →
  regen it yourself.
- **F4 promotion** (session-start): drain `handOffs/flogence-intake.md` — for each queued flogence bug, do
  the triage the deputy deliberately did NOT (reproduce / classify / severity per R26), promote the real ones
  into `master-list.md §F`, then strike the queue line. The deputy FILES; you TRIAGE.

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

### What this PA reads + writes locally (user-voice)
- `user-voice.md` (at repo root) — verbatim user log scoped to this repo (read + append only; never truncate)
- Historical shared log archived at `../scrml-support/user-voice-archive.md` (read-only reference)

### What this PA reads from scrml-support (absolute paths)
- `/home/bryan-maclee/scrmlMaster/scrml-support/.claude/resource-maps/` — cross-repo resource graph (via `resource-mapper`, PA-driven)
- `/home/bryan-maclee/scrmlMaster/scrml-support/docs/deep-dives/` — research context (on demand)
- `/home/bryan-maclee/scrmlMaster/scrml-support/design-insights.md` — debate outcomes (on demand)

### What this PA reads from scrml (absolute paths, read-only)
- `/home/bryan-maclee/scrmlMaster/scrml/` — scrml language reference: spec, tutorial, examples, syntax docs. Read-only for language lookup while authoring 6nz source. No writes. Do not infer scrml's current roadmap/state from its code — that's cross-repo coordination, which still goes through the user.

### What this PA does NOT touch
- Any file outside this repo (except the reads listed above from scrml-support and scrml)
- `~/projects/scrml8/` — FROZEN, read-only archive
- Other project repos (scrml-support, giti, and scrml beyond read-only language reference) — **except** writing message files into their `handOffs/incoming/` (see Cross-repo messaging below)

### Session-start checklist (this repo only)
0. **COHERENCE CHECK FIRST (S15+ — non-negotiable).** Before anything else: `git fetch origin` then
   `git rev-list --left-right --count origin/main...HEAD`. **A non-zero LEFT count means origin has commits
   you don't — a parallel instance ran (the S14 + S15 fork hazard).** STOP and reconcile (merge origin in,
   keep both, resolve conflicts) BEFORE doing any new work — do NOT build on a diverged base. A non-zero
   RIGHT count alone is just unpushed local work. (This check existed only at wrap-time, which is why the
   fork went unnoticed until close TWICE — S14 and S15. It belongs at the START.)
0b. **(deputy era, S15+)** Read `handOffs/digest.md` IFF `bun scripts/state.ts --check` reports `current` (else DISTRUST + read cold); read `handOffs/deputy-state.md` (ACK + heartbeat — did your `(vpa:)` casts land? how current is the deputy?); drain `handOffs/flogence-intake.md` (queued flogence bugs → triage per R26 → promote real ones to `master-list.md §F`, strike the line). See "S15 addendum — vPA deputy (PA side)".
1. Read `pa.md` (this file)
2. Read `hand-off.md`
3. List `handOffs/incoming/*.md` (ignore `read/` subdir); if any exist, surface to user
4. Read the last ~10 **contentful** entries from `user-voice.md` (this repo's root) — skip non-contentful messages (acks, "keep going", "continue", "yes", "ok"); if any of the last 10 are non-contentful, read that many more so you end up with ~10 substantive entries
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
- Path: `user-voice.md` at this repo's root (per-repo as of 2026-04-14)
- Never summarize, never paraphrase, never truncate
- Session header: `## Session N — YYYY-MM-DD` (N is this repo's session count)
- Only append user statements relevant to **this repo**; if a statement concerns a sibling repo, drop a message into their `handOffs/incoming/` instead

### Commit authorization
Commits to main are allowed only after explicit user authorization in the current session. Confirm with the user before the first commit of a session, and before any push. Authorization stands for the scope specified, not beyond. **Push-to-origin is done DIRECTLY by this PA after explicit user authorization (S15: master no longer orchestrates pushes).** Force-push / hook bypass / destructive ops stay explicitly-authorized-only.

### What NOT to do
- Do not edit files in other repos (the user will open a different Claude instance). The single exception is dropping message files into `<sibling>/handOffs/incoming/` — see Cross-repo messaging below.
- Do not modify scrml8 (frozen)
- Do not bypass pre-commit hooks without explicit user authorization
- Do not run resource-mapper in write mode on scrml8 (frozen)
- Do not treat stale sources as authoritative — check currency flags

---

## Cross-repo messaging (dropbox)

**You are the PA for 6nz.** Your own inbox is `handOffs/incoming/` in this repo.

The ecosystem projects (scrml, scrml-support, giti, 6nz) communicate asynchronously through file-based dropboxes. Each repo owns `handOffs/incoming/` — unread messages sit there; once this PA reads and acts on them, they move to `handOffs/incoming/read/`.

**This is the ONE sanctioned exception** to "do not write into sibling repos." PAs may write message files into a sibling's `handOffs/incoming/` — nothing else in the sibling repo is touched.

### Inbox (this PA reads)
- `/home/bryan-maclee/scrmlMaster/6nz/handOffs/incoming/` — unread
- `/home/bryan-maclee/scrmlMaster/6nz/handOffs/incoming/read/` — archive

### Outbox targets (this PA may write into)
- **flogence** (primary integration partner — 6nz is its native editor + kb-nav platform): `/home/bryan-maclee/scrmlMaster/flogence/handOffs/incoming/`
- scrml (formerly scrmlTS): `/home/bryan-maclee/scrmlMaster/scrml/handOffs/incoming/`
- scrml-native (formerly scrml): `/home/bryan-maclee/scrmlMaster/scrml-native/handOffs/incoming/`
- scrml-support: `/home/bryan-maclee/scrmlMaster/scrml-support/handOffs/incoming/`
- giti:          `/home/bryan-maclee/scrmlMaster/giti/handOffs/incoming/`
- master:        `/home/bryan-maclee/scrmlMaster/handOffs/incoming/`

### Message file format

Filename: `YYYY-MM-DD-HHMM-<from>-to-<to>-<slug>.md`
Example: `2026-04-11-1432-6nz-to-scrml-compiler-api-request.md`

```markdown
---
from: 6nz
to: scrml
date: 2026-04-11
subject: <one-line subject>
needs: reply | action | fyi
status: unread
---

<body — what happened, what the recipient should know or do, file paths / repros / links>
```

### Cross-repo bug reports — reproducer source required

When this PA files a bug report into another repo's `handOffs/incoming/` — or when this PA receives one — the report MUST include a minimal scrml reproducer:
- **Inline** as a ` ```scrml ` fenced block in the message body (preferred for ≤ ~200 lines), OR
- **Sidecar file** dropped next to the message: `YYYY-MM-DD-HHMM-<slug>.scrml` (same stem as the `.md`)

Reproducer must be:
- **Self-contained** — runnable against the receiving repo's current compiler without external setup
- **Minimal** — smallest scrml that still exhibits the bug
- **Version-stamped** — exact command used and compiler SHA (e.g., `scrml compile repro.scrml` against `scrml@ccae1f6`)
- **Expected vs actual** — state both in the report body

As SENDER (6nz's typical role): attach the offending scrml (from a `playground-*` file if that's where the bug surfaced) every time. As RECEIVER (rare): do not begin diagnosis without the reproducer — reply-request source before acting.

### Session-start: check incoming

Add to the session-start checklist (after reading `hand-off.md`):
- List `handOffs/incoming/*.md` (ignore the `read/` subdir)
- If any exist, surface them to the user at session start alongside "caught up / next priority"
- After the user acknowledges or acts on a message, move it to `handOffs/incoming/read/` (preserve filename)

### Flogence message autonomy (F4 — bounded auto-act, unattended)
**User-ratified S15.** Messages `from: flogence` are subject to **autonomous deputy intake** (`vpa.md` § F4) —
the deputy, on its loop, handles them WITHOUT a session running. The boundary (the deputy FILES, never DECIDES):
- **Auto-intake + archive** (deputy moves `incoming/ → read/`): status · FYI · version/doc notice · bug report
  (with reproducer → filed to `handOffs/flogence-intake.md` for PA triage).
- **Surface** (deputy leaves in `incoming/`, routes to PA via `deputy-state.md`): design-decision replies ·
  6nz↔flogence scope/architecture changes · anything touching the live build · anything ambiguous.

This autonomy is **flogence-scoped ONLY** — messages from scrml / scrml-support / giti / master still surface
to the user at session-start per the rule above (no auto-act). **When no deputy is up,** the PA applies the
SAME boundary itself at session-start: auto-process the low-risk flogence msgs, queue bugs to the intake file,
surface the rest.

### Sending a message

When this PA needs to tell another project something (compiler API need, z-motion spec update, design decision locked):
1. Confirm with the user what to send and to whom
2. Write the message file directly into the target's `handOffs/incoming/` (absolute path above)
3. Log the send in this repo's `hand-off.md` so there's a local trail

### Pushing (DIRECT — S15+; master no longer orchestrates pushes)

This PA pushes its OWN repo directly to origin after explicit user authorization. There is no master
push round-trip. At a push point:
1. **Coherence check** (the same one that's now session-start step 0): `git fetch origin` +
   `git rev-list --left-right --count origin/main...HEAD`. A non-zero **LEFT** count means origin diverged
   (a parallel instance) — **reconcile (merge origin in) BEFORE pushing; never force-push over it.**
2. Confirm the branch tip is the SHA you intend, then `git push origin main`.
3. If you dropped messages into sibling repos' inboxes, that's each sibling PA's concern — they push their
   own repo. You are responsible only for pushing 6nz.

### Agent authoring (no central store)

There is no central `agentStore`. When a task requires an agent not already in this repo's `.claude/agents/`, author the expert agent `.md` file directly into `.claude/agents/` (the directory is gitignored — agents are local, not committed). The forge's research can be returned-not-written if a write fails. No master-staging round-trip is needed.

### Scope of the exception
- **Allowed:** creating new `.md` files inside `<sibling>/handOffs/incoming/`
- **NOT allowed:** reading, editing, or deleting anything else in a sibling repo. Messages are a one-way write; the sibling's PA reads them in its own session.
