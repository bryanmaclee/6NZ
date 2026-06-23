# infra.map.md
# project: editor (6nz)
# updated: 2026-06-23T00:00:00Z  commit: 358aca4

## Deployment

| Environment | Platform | What's deployed |
|---|---|---|
| production | GitHub Pages (`bryanmaclee.github.io/6NZ/`) | `proto/6nz-playable/index.html` only |

Nothing else is deployed. The scrml playgrounds under `src/` are development-only
(run via `scrml dev` local server). No staging environment. No server-side deployment.

## Cloud Resources

GitHub Pages — static hosting for the vanilla-JS prototype.
No other cloud resources (no database, no compute, no server, no CDN beyond GitHub Pages built-in).

## CI/CD

Provider: GitHub Actions
Workflow: `.github/workflows/pages.yml`
Deploy trigger: push to `main` filtering `proto/6nz-playable/**` or `pages.yml` + `workflow_dispatch`

Stages:
1. `build` — checkout, copy `proto/6nz-playable/index.html` + `README.md` to `_site/`, upload Pages artifact
2. `deploy` — deploy `_site/` to GitHub Pages (environment: `github-pages`)

No automated test run in CI. Smoke tests are manual only.

## Docker

No containers.

## vPA Deputy System  (adopted S15, 2026-06-22)

A token-thinning maintenance sidecar — a second Claude instance that runs alongside the PA and
handles projection/maintenance (not deliberation). Contract: `vpa.md` (repo root).

### Communication surfaces (file-based)

| File | Owner | Purpose |
|---|---|---|
| `handOffs/delta-log.md` | PA (single-writer) | Append-only state stream — `land`/`disp`/`find`/`rule`/`state`/`msg` entries; `(vpa:)` directive casts |
| `handOffs/deputy-state.md` | Deputy | Durable re-hydration anchor — last-absorbed seq, deputy-maint tip SHA, ACK log, HEARTBEAT |
| `handOffs/flogence-intake.md` | Deputy (files); PA (triages) | F4 queue — deputy files inbound flogence bugs; PA promotes → master-list.md §F |
| `handOffs/digest.md` | Deputy / PA fallback | @generated session-start digest; regen via `bun scripts/state.ts --digest` |
| `scripts/state.ts` | Deputy tool | Digest generator + freshness check (bun, no deps) |

### Deputy functions

| # | Function | Status |
|---|---|---|
| 1 | Digest curation — per-tick regen of `handOffs/digest.md` | LIVE |
| 2 | Disjoint-surface maintenance — maps, changelog, digest, deputy-state | LIVE |
| 3 | Reboot-gap bridge — monitor dispatched agents across PA wrap→reboot | LIVE |
| 4 | Autonomous flogence inbox intake — bounded auto-intake of `from: flogence` messages | LIVE (6nz-specific) |

### Surface partition

**Deputy owns (derived/maintenance):** `.claude/maps/*`, `docs/changelog.md`,
`handOffs/digest.md`, `handOffs/deputy-state.md`, `handOffs/flogence-intake.md`

**PA owns (substantive):** `src/*.scrml`, `pa.md`, `vpa.md`, `master-list.md`, `hand-off.md`,
`handOffs/delta-log.md` (except F3 narrow append), design decisions, bug triage

### Worktree model

Deputy runs in a sibling worktree (`../6nz-deputy-maint` on branch `deputy-maint`) — outside
`.claude/worktrees/` to avoid PA wrap-6b cleanup sweep. PA integrates via `git merge deputy-maint`
at commit-points + at wrap + on boot. Deputy NEVER advances main's HEAD.

## Cross-repo Correspondents

| Repo | Path | Relationship |
|---|---|---|
| scrml (compiler) | `../scrml/` | Sibling repo — dogfooded compiler; current v0.7.0 `80f2c190` |
| flogence | `../flogence/` | Satellite project — 6nz is becoming its native editor + kb-nav platform; flogence beta testers imminent; inbound messages via `handOffs/incoming/` |
| scrml-support | `../scrml-support/` | Research archive + canonical vPA model (`vpa-scrml.md`) |

## External Services (runtime, dev-time only)

- `esm.sh` CDN — CM6 and related libraries loaded at runtime by p3/p5/p6/p7/p8
- scrml LSP server (`../scrml/lsp/server.js`) — spawned by bridge.js (p6, p8) for dev-time diagnostics/completion

## Tags
#editor #6nz #map #infra #github-pages #ci #github-actions #vpa-deputy #flogence

## Links
- [primary.map.md](./primary.map.md)
- [build.map.md](./build.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
