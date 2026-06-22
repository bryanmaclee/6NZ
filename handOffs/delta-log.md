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
