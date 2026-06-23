# 6nz — PA → deputy delta-log

The PA's append-only state stream for the vPA deputy (`vpa.md`). The PA is **single-writer** on this
file. One narrow exception: the deputy may append `(deputy) state` entries recording a dispatched-agent
completion during a PA-reboot gap (vpa.md F3). The deputy READS this each tick and absorbs entries past
its last-absorbed seq (tracked in `deputy-state.md`).

## Entry format

One entry per line (or short block), newest at the bottom:

`[seq] <type> <pointer> — <summary> [(vpa: <maintenance directive>)]`

- **seq** — monotonic integer, never reused.
- **type** — one of:
  - `land`  — work committed to main (pointer = SHA + files)
  - `disp`  — agent dispatched (pointer = agent-id + branch + brief)
  - `find`  — a finding / verification result (pointer = SHA / file)
  - `rule`  — a ratified decision / directive (pointer = where recorded)
  - `state` — session / board state change (pointer = file)
  - `msg`   — cross-repo message sent / received (pointer = path)
- **pointer** — a SHA / file / agent-id / msg-path the deputy derefs ONLY if a maintenance task needs it.
- **(vpa: …)** — OPTIONAL maintenance directive cast to the deputy (refresh maps · regen digest · track
  agent X). The PA never blocks on it (async cast; the PA-does-it fallback covers urgency). Deliberation-
  shaped directives must NOT appear here — the deputy declines them and routes back to the PA.

The deputy never edits existing entries; it only absorbs them (and, per F3, may append `(deputy) state`).

---

[1] land 3ee4bc5 src/playground-ten/app.scrml — p10 §36 input-state → canonical animationFrame @cell bridge; AG/AH NOT-REPRODUCED @ scrml dd5331e2.
[2] rule vpa.md — vPA deputy ADOPTED for 6nz (S15), scaled from scrml-support/vpa-scrml.md. Four functions incl. F4 (autonomous flogence inbox intake, bounded auto-act unattended). Surface partition + commit protocol per vpa.md.
[3] rule pa.md — flogence added as active cross-repo correspondent (outbox target + inbox source); F4 autonomy policy locked (bounded auto-act, unattended; flogence-scoped only).
[4] disp ad53b0237e06cbd4b — project-mapper dispatched (worktree-isolated) for a cold `.claude/maps/` refresh (maps predate all 11 playgrounds). (vpa: maps are your Function-2 surface — once the PA lands this refresh, keep them current incrementally.)
[5] land f44093a vpa.md·pa.md·handOffs/{delta-log,deputy-state,flogence-intake,digest}.md·scripts/state.ts — vPA deputy + flogence channel readiness infra committed.
[6] land 5fe64b7 .claude/maps/* — cold maps refresh landed (9 maps + non-compliance report; agent worktree cleaned). (vpa: maps now CURRENT — keep incremental going forward. `.claude/maps/non-compliance.report.md` lists currency-debt for the PA: README/editor-README scrmlTS+playground-omission, 2 stale playground READMEs, z-motion/proto README SPEC versions.)
[7] land 5fe64b7+ master-list.md·docs/changelog.md — S15 meta-docs (inventory + changelog block). [this entry's own commit]
[8] state origin/main — DIVERGENCE: a parallel S15 instance branched off d2e9667 and pushed 4 commits (944d360 maps+currency-sweep · 9682771 import-claim-correction · f0c9854 wrap · 1bb8cbb). Caught by the wrap-time coherence check (NOT session-start — fork hazard recurred). Track B = housekeeping + dogfood-confirm (p5 18/18, p7 17/17 @ d299798; Bug-AB loop closed; README/editor-README/p6/p8 scrmlTS→scrml).
[9] land 7cc58cf MERGE — reconciled origin/main (Track B) into local; BOTH sides kept. maps conflict resolved to Track B's as placeholder. (vpa: an INCREMENTAL maps refresh is dispatched to fold in the deputy infra — once landed, maps reflect the union; keep them current.)
[10] land a30f2f1 .claude/maps/{structure,dependencies,build,infra,primary,non-compliance} — union-state maps landed (deputy infra + flogence folded in); agent worktree cleaned; digest regenerated → current. Maps now reflect the FULL merged tree.
