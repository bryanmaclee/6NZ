# structure.map.md
# project: editor (6nz)
# updated: 2026-07-06T00:00:00Z  commit: 9af19a5

## Entry Points

No unified entry point. Each playground is an independent scrml program:

| Entry point | How to run |
|---|---|
| `src/playground-zero/app.scrml` | `scrml dev src/playground-zero/app.scrml` |
| `src/playground-one/app.scrml` | `scrml dev src/playground-one/app.scrml` |
| `src/playground-two/app.scrml` | `scrml dev src/playground-two/app.scrml` |
| `src/playground-three/app.scrml` | `scrml dev src/playground-three/app.scrml` |
| `src/playground-four/app.scrml` | `scrml dev src/playground-four/app.scrml` |
| `src/playground-five/app.scrml` | `scrml dev src/playground-five/app.scrml` |
| `src/playground-six/app.scrml` | bridge: `bun src/playground-six/bridge.js` then `scrml dev ...` (manual dev; Playwright spec boots both itself) |
| `src/playground-seven/app.scrml` | `scrml dev src/playground-seven/app.scrml` |
| `src/playground-eight/app.scrml` | bridge: `bun src/playground-eight/bridge.js` then `scrml dev ...` (manual dev; Playwright spec boots both itself) |
| `src/playground-nine/app.scrml` | `scrml dev src/playground-nine/app.scrml` |
| `src/playground-ten/app.scrml` | `scrml dev src/playground-ten/app.scrml` |
| `src/playground-eleven/app.scrml` | `scrml dev src/playground-eleven/app.scrml` — **NEW S18** (flonav) |
| `proto/6nz-playable/index.html` | open in browser; deployed to GitHub Pages |

## Directory Ownership

```
6nz/
├── src/                       12 scrml-native playgrounds (p0–p11); all green vs scrml v0.7.0
│   ├── playground-zero/       Z-motion classifier (SPEC v0.4 §5)  — app.scrml, app.pw.ts, README.md
│   ├── playground-one/        vim-mode <engine> machine (5 modes) — app.scrml, app.pw.ts, README.md
│   ├── playground-two/        hjkl + z-motion on a line buffer    — app.scrml, app.pw.ts
│   ├── playground-three/      CM6 mount probe via esm.sh          — app.scrml, app.pw.ts
│   ├── playground-four/       undo tree on line-indexed buffer     — app.scrml, app.pw.ts
│   ├── playground-five/       vim modes on real CM6 surface        — app.scrml, app.pw.ts
│   ├── playground-six/        LSP diagnostics over WebSocket       — app.scrml, bridge.js, app.pw.ts
│   ├── playground-seven/      z-motion on CM6                     — app.scrml, app.pw.ts
│   ├── playground-eight/      LSP completion + hover on CM6        — app.scrml, bridge.js, app.pw.ts
│   ├── playground-nine/       editor IR + logical traversal        — app.scrml, app.pw.ts
│   ├── playground-ten/        relevance-region navigator + §36     — app.scrml, app.pw.ts
│   ├── playground-eleven/     flonav: floView-shaped tree, hjkl nav + auto-collapse +
│   │                            NORMAL/INSERT/VISUAL modal <engine> (first flogence-integration
│   │                            artifact) — app.scrml, app.pw.ts  [NEW S18]
│   └── _pw/                   shared Playwright helper — bootScrmlDev/killScrmlDev [NEW S18]
│       └── scrml-dev.ts
├── playwright.config.ts       Playwright root config: testDir "src", testMatch "**/*.pw.ts",
│                                fullyParallel, workers=3 (2 in CI), 60s timeout  [NEW S18]
├── scripts/                   repo maintenance scripts (bun-runnable; no npm deps)
│   └── state.ts               vPA deputy digest generator: --digest writes handOffs/digest.md,
│                                --check prints current|STALE (staleness guard for PA session-start)
├── proto/                     non-scrml prototypes (vanilla JS; scrml-only rule waived here)
│   ├── 6nz-playable/          playable prototype, 62 scenarios, deployed to GitHub Pages
│   └── z-motion-feel/         throwaway z-motion feel-test
├── z-motion-spec/             Z-motion spec — CC0 open source, separate from proprietary editor
│   ├── SPEC.md                v0.5 authoritative (sustained gestures + release-order)
│   ├── default-bindings.md    v0.3 companion binding table
│   ├── README.md              intro + licensing
│   └── LICENSE                CC0 1.0 Universal
├── docs/
│   └── changelog.md           session-by-session changelog (newest first)
├── .github/workflows/
│   └── pages.yml              deploys proto/6nz-playable/ to GitHub Pages on push to main
├── handOffs/                  session rotation archive + cross-repo messaging dropbox
│   ├── hand-off-{1-17}.md     rotated session records (out of scope for mapping)
│   ├── incoming/              unread cross-repo messages; read/ subdir is archive
│   ├── delta-log.md           PA→deputy state stream (PA single-writer; deputy reads each tick)
│   ├── deputy-state.md        deputy's durable re-hydration anchor (last-absorbed seq, heartbeat)
│   ├── flogence-intake.md     F4 intake queue — deputy files flogence bugs; PA triages → §F
│   └── digest.md              @generated session-start digest (regen via bun scripts/state.ts --digest)
├── vpa.md                     vPA (vice primary agent) deputy contract — 4 functions incl. F4 flogence intake
├── editor-README.md           locked high-level design principles
├── editor-architecture.md     detailed architecture reasoning for 6 locked concepts (last updated S5 2026-04-12)
├── master-list.md             live inventory, locked decisions, bug ledger (last updated S18 2026-07-06)
├── pa.md                      per-repo PA directives + session workflow (incl. S15 addendum — vPA deputy)
├── hand-off.md                current session state (S18)
├── user-voice.md              per-repo verbatim user log (append-only)
├── package.json                name="editor", version="0.1.0", devDep: @playwright/test@1.60.0,
│                                scripts.test="playwright test"  [test script is now live, not a stub — S18]
└── README.md                  public-facing README (NOTE: contains stale "scrmlTS" link — see non-compliance)
```

## Key Scope Notes

- **No editor shell exists.** `src/` holds 12 exploratory playgrounds (p0–p11). Editor proper is
  gated on in-process compiler API. LSP path (L1-L4) is reachable now for dev-time tooling.
  `playground-eleven` (flonav) is the first artifact aimed at flogence integration rather than the
  standalone editor shell.
- **No root-level build system.** No Makefile, no webpack. Playgrounds run via `scrml dev`.
- **S18: test harnesses fully migrated to Playwright.** Every playground's smoke test is now
  `app.pw.ts` (`@playwright/test`), colocated with `app.scrml`. The old per-playground `test.js`
  (Puppeteer) files are DELETED. A shared helper lives at `src/_pw/scrml-dev.ts`. See `test.map.md`
  and `build.map.md`.
- **Compiler is sibling repo.** `../scrml/` (renamed from `scrmlTS` at S200). Current version
  dogfooded: v0.7.0 (`80f2c190`); fixes AD/AE at `14fb0230`/`faa213c5` are newer than baseline.
  (`master-list.md` §5 as of S18 references further scrml source movement — see that file directly
  for the latest SHA; not re-verified in this incremental map pass.)
- **Two licensing zones.** `z-motion-spec/` is CC0 open source. All else is proprietary.
- **vPA deputy adopted S15.** `vpa.md` (root) is the deputy contract. `scripts/state.ts` is its
  digest-generator tool. The `handOffs/` seam files (`delta-log.md`, `deputy-state.md`,
  `flogence-intake.md`, `digest.md`) form the PA↔deputy communication surface.
- **flogence cross-repo channel.** 6nz is becoming the native editor + kb-nav platform for the
  `flogence` project (`../flogence/`). Inbound flogence messages arrive via `handOffs/incoming/`;
  deputy auto-intakes bounded flogence messages (F4) unattended. `playground-eleven` is the first
  concrete flogence-integration prototype (floView-shaped node tree).

## Ignored / Generated Paths

`node_modules/`, `dist/` (per-playground compiled output), `test-results/`, `playwright-report/`
(Playwright run artifacts — gitignored S18), `.claude/worktrees/` (gitignored S18), `.git/`,
`.claude/`, `handOffs/` (session archives and historical hand-offs), `handOffs/incoming/read/`
(archived cross-repo messages)

## Tags
#editor #6nz #map #structure #playgrounds #scrml #playwright #vpa-deputy #flogence

## Links
- [primary.map.md](./primary.map.md)
- [test.map.md](./test.map.md)
- [build.map.md](./build.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
