# 6nz — deputy-state (vPA durable anchor)

The deputy's own re-hydration anchor. **Written by the DEPUTY each tick** (not the PA). Seeded by the
PA at vpa adoption (S15) so the first deputy boot has an anchor; the deputy overwrites the live fields
below from then on. The PA READS this at boot + at each `deputy-maint` integration (the ACK + HEARTBEAT
tell it whether its `(vpa:)` casts landed and how current the deputy's state is).

## Live state
- last-absorbed delta seq: **0** (no deputy has booted yet — delta-log seeded with entries [1]–[4])
- deputy-maint tip SHA: **—** (no deputy worktree provisioned yet)
- owed maintenance: **—**
- digest: **not yet generated** — run `bun scripts/state.ts --digest`

## ACK log
(none yet — no `(vpa:)` directives absorbed)

## HEARTBEAT
`heartbeat: not-yet-booted — deputy adopted by PA S15 (2026-06-22)`

## Route to PA
(none)
