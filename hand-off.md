# 6nz — Session 11 Hand-Off

**Date:** 2026-05-23 →
**Next hand-off filename:** `handOffs/hand-off-11.md`

## Session start state
- Session 10 rotated to `handOffs/hand-off-10.md`
- Working tree: `main` @ `0c3dd50`, clean
- `handOffs/incoming/` empty (only `read/` subdir with 10 archived inbounds)
- ~1 month gap since S10 (2026-04-25 → 2026-05-23); scrmlTS jumped S40→S122

## Session work

### scrmlTS catch-up + Bugs L/M/N/O re-verification
- Surveyed scrmlTS history since our anchor `c51ad15`. ~300+ commits across 80 sessions: v0.6.0 release tagged, v0.7 native-parser arc in flight (M5-swap + dual-pipeline canary at 998/1000 strict-pass), LSP L1-L4 shipped, GITI dogfooding heavily (GITI-014 fixed today, GITI-015 filed by them this morning), corpus-sweep PLAN queued post-M6.
- Re-tested all 4 of our S10 sidecar bugs against current main (`18b90f12`):
  - **Bug L** — STILL OPEN. Fix `2a5f4a06` was reverted at `529f0312`; awaiting native-parser M6 subsumption of BS. `String.fromCharCode(123/125)` workaround stays in p5+p6.
  - **Bug M** — FIXED at `08ca2f83`. `ws.onopen = function() {...}` emits cleanly.
  - **Bug N** — FIXED (pending-6nz-confirmation since 2026-04-26; closure-loop closed S11). Two consecutive `@x =` writes in inline fn emit cleanly with proper parens; node --check passes.
  - **Bug O** — FIXED at `50b431e2`. Meta-effect frozen-scope correctly excludes for-of loop var.

### Playground smoke against current scrmlTS — 5 of 7 broken, all migrated
- Smoke surfaced 2 language migrations needed:
  - **`reset` is now a reserved keyword** (E-RESERVED-IDENTIFIER, §6.8) — broke playgrounds zero/one/two/four. Renamed local `function reset()` to contextual `clearLog`/`clearMode`/`clearBuffer`/`clearHistory`.
  - **`null` is rejected** (E-SYNTAX-042) — broke p6. Migrated 2 `processId: null` / `rootUri: null` sites in the LSP initialize JSON-RPC frame to `: not`.
- p6 bridge.js had hardcoded `/home/bryan-maclee/...` path; switched to `import.meta.url`-relative so it works across machines.
- p6 sample doc dropped redundant `${...}` wrap (v0.3+ auto-lift) to keep LSP diagnostic count at 0.
- Post-migration: all 7 playgrounds compile clean. Runtime smoke for p5 + p6 reveals Bug P (see below).

### Bug P filed — runtime chunker tree-shake gap (HIGH)
- `_scrml_destroy_scope` (in always-included `scope` chunk) calls `_scrml_stop_scope_timers` (in conditional `timers` chunk). When the compile unit doesn't directly use timer functions, the `timers` chunk is tree-shaken and the always-included scope teardown then references an undefined symbol.
- Symptom: `ReferenceError: _scrml_stop_scope_timers is not defined` on any scope teardown, killing all subsequent reactive effects.
- Affects every adopter app that doesn't import scrml:time and trigger reactive scope teardowns. Discovered via p5 (12/18 pass; 6 cascading failures) and p6 (6/7 pass; one pageerror).
- Filed at `scrmlTS/handOffs/incoming/2026-05-23-0719-6nz-to-scrmlTS-bugs-l-m-n-o-status-plus-bug-p.md` + sidecar `2026-05-23-0719-bug-p-stop-scope-timers-runtime-chunker-gap.scrml`. The message also delivers L/M/N/O closure confirmations.
- Suggested fix shape (no patch sent): add a chunker dependency edge from `scope` → `timers`, or move `_scrml_stop_scope_timers` into the `scope` chunk.

### Built playground-seven — z-motion on CM6
- Goal: graft p2's release-order classifier into p5's vim keymap. Insert mode hold `h/j/k/l` + tap any key → cursor nudges in that direction WITHOUT leaving Insert and WITHOUT typing the rolled key.
- Implementation:
  - CAPTURE-phase keydown on `.cm-host` (defers `h/j/k/l` to keyup, intercepts non-motion keys when a hold is active to fire motion instead of CM6 typing).
  - Bubble-phase keyup classifies the release as TAP/HOLD/ROLL. TAP types the letter via `view.dispatch({changes,selection})`; HOLD just cleans up; ROLL fires motion in the outer hold's direction.
  - Bumps each held key's `releasedDuringLifetime` on every intervening non-hold release, so a hold's eventual keyup classifies as HOLD (not TAP).
- Smoke: 14/17 pass. All NORMAL/VISUAL motion + z-motion in INSERT confirmed working — `[j](x) moves down line 1→2 no type`, `[k](x) moves up`, `[l](x) moves right`, `mode still INSERT after z-motions`. Two compiler bugs surfaced during construction (Q + R, see below); the 3 remaining smoke failures all trace to Bug R.

### Bugs Q + R filed — surfaced building playground-seven
- **Bug Q (`<program>` auto-lift init gap):** bare `@cell = X` declarations in `<program>` body don't get `_scrml_init_set` emission when (Q-1) the body starts with `@cell` instead of fn/type, or (Q-2) `@cell` decls are separated from each other by a comment block. Variant matrix probed and locked. Workaround: precede `@cell` decls with a function, keep all `@cell` decls contiguous (no comment lines between). Compile is clean but runtime is undefined; the bare dependency-extraction probe at module top throws on undefined property access and halts the rest of init — cascades into the DOMContentLoaded handler never running, which silently breaks all `if=` markup.
- **Bug R (`if=` unmount no-op):** `if=@derivedReactive` mounts on first true but the unmount path never fires on flip-to-false. Three sibling mode-badges in p7 with mutually-exclusive `if=` accumulate visible clones instead of alternating. Emit looks plausible (both mount and unmount controllers exist; the effect has the else-branch unmount call) — failure is in subscription or derived-flip propagation. Adopter impact: every mode-badge / signed-in-vs-out / accordion pattern using mutually-exclusive `if=@derived` is silently broken.
- Filed at `scrmlTS/handOffs/incoming/2026-05-23-0735-6nz-to-scrmlTS-bugs-q-r-from-playground-seven.md` + two sidecars (`bug-q-1-auto-lift-no-init.scrml`, `bug-r-if-unmount-no-op.scrml`).

## Cross-repo traffic log
- **Out to scrmlTS** (1 message + 1 sidecar): `2026-05-23-0719-6nz-to-scrmlTS-bugs-l-m-n-o-status-plus-bug-p.md` — closes L/M/N/O loop (L still open / fix reverted; M+N+O confirmed fixed by emit + node --check), files new Bug P with minimal repro. Bug N closure explicitly addresses scrmlTS's pending-confirmation ping from 2026-04-26 (their reply message never landed on this clone).
- **Out to scrmlTS** (1 message + 2 sidecars): `2026-05-23-0735-6nz-to-scrmlTS-bugs-q-r-from-playground-seven.md` — files two new compiler bugs surfaced during playground-seven construction. Q (auto-lift drops @cell init) HIGH; R (if= mounts but never unmounts) HIGH-but-narrower.

## Open items carried to S12
- Awaiting scrmlTS triage on Bugs L (reopen for native-parser M6 follow-through), P, Q, R.
- Bug L workarounds (FromCharCode for braces in sample docs) stay in p5/p6/p7 until native-parser M6 ships.
- playground-eight (suggested) — completion + hover on the LSP-wired CM6 surface (p6 + LSP L1-L4 capabilities). Unblocked.
- Smoke-test scripts only exist for p5/p6/p7. Earlier playgrounds (zero/one/two/four) have no committed puppeteer harness; they compile clean post-migration but formal smoke coverage is a separate work item.
- Master-list §A `default-bindings.md` status was inconsistent (S10 commit `0ffb452` shipped v0.3 but §E still showed `[ ][ ]`); reconciled to `[x]` this session.
