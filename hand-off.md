# 6nz — Session 13 Hand-Off

**Date:** 2026-05-29
**Next hand-off filename:** `handOffs/hand-off-13.md`

## Session start state
- Session 12 rotated to `handOffs/hand-off-12.md`
- Started on `main` @ `6db4f26` (S12 close). Pulled `origin/main`; it had diverged
  (origin +1: a batch of 10 misrouted scrmlTS→6nz inbox messages; local +3: S12 Bug S/W
  close + playwright deps). No file overlap → **rebased local 3 onto origin** cleanly,
  pushed (`0fa1cbb..238653f`).

## Session work

### Reconciled origin + processed 10 inbox messages (all → `incoming/read/`)
- Headline: **Bug V RESOLVED** upstream (`2026-05-28-1613-...-bug-v-RESOLVED.md`) + a
  **resume-dogfooding directive** (`2026-05-29-0727`): build/use **v0.6.7** (tag `18de30ba`);
  several silent-miscompiles fixed (Bug 57/58/59/61); high-value targets = engines (§51),
  list-churn (Bug-V neighborhood), input-state (§36). Route-around list noted (Bug 54 `:let`,
  Bug 60 nested-compound render-by-tag, 6nz-U/L/T, `${@x/}`).
- The other 8 were older (Apr–May 16), mostly superseded (M/N/O shipped, Bug P closed, Bug L
  reverted, Bug-14 event-auto-thread revert — playgrounds already post-date it). One actionable
  carry-forward: **multi-close `<//>` → `</></>` editor auto-expansion** (Emmet-style, default off)
  → logged to master-list §E "Editor architecture".

### Re-verified p9 against v0.6.7 — 13/13 green (unchanged)
- Toolchain confirmed: `scrml` v0.6.7 (`~/.bun/bin/scrml`, backed by scrmlTS `feab1207`).
- p9 left as a stable regression anchor; its single-string Bug-V workaround NOT retired in-place
  (p10 proves the canonical for-lift+class form instead).

### Built playground-ten — relevance-region navigator — 17/17 green (v0.6.7)
- `6nz/src/playground-ten/{app.scrml,test.js}`. Multiple focused code regions + one mode
  `<engine>` (NAV/EDIT). j/k focus · J/K reorder · o insert · x remove · Enter→type→Esc.
- **Bug-V fix EMPIRICALLY CONFIRMED on a fresh surface:** reactive `class:focused`/`style:opacity`
  on a for-lift `<li>` reading global `@focusId` follows focus, stays correct through reorder,
  exactly-one-focused holds across insert/remove. (3 of the core asserts target this directly.)
- §51 engine: `match @mode` badge + behaviour gating work (after AA workaround). `<onTransition>`
  left out pending AB's answer.

### Surfaced 4 bugs + 1 engine question (all v0.6.7) — filed to scrmlTS
Filed `scrmlTS/handOffs/incoming/2026-05-29-1015-6nz-to-scrmlTS-playground-ten-bugs-x-y-z-aa-ab.md`
+ 5 sidecars (`…-sidecars/`). Each reproduces; signatures re-verified.
- **Bug X (HIGH)** — `//`/URL inside a string literal → `E-CTX-003` hard fail, misleading error
  (string-unaware comment scanner). Broadens M6-deferred Bug T (now also fn-body + markup interp).
- **Bug Z (HIGH)** — identifier-rename rewrites a fn-name substring INSIDE a string literal
  (`"handleKey(e)"` → `"_scrml_handleKey_3(e)"`). Silent; severe for an editor.
- **Bug Y (MED)** — comma-separated `match` arms → `return X ,;` invalid JS, exit-0 silent miscompile.
- **Bug AA (MED)** — bare tail `match` in a plain `function` → value-discarding IIFE → returns
  `undefined`. `return match` / `fn … -> T` are fine. Silent.
- **Question AB** — `<onTransition>` doesn't fire on a bare `@engineVar = .Variant` write from
  program scope (plain reactive_set bypasses dispatcher; handler table emitted empty). `@mode`
  itself is reactive. Asked for the canonical dispatching trigger.

Three of these (Y/Z/AA) are exit-0 silent miscompiles — the shape scrmlTS asked us to hunt.

### Probed §36 input-state (the flagged "uniquely high-signal" surface) — Bug AC filed
Filed `scrmlTS/handOffs/incoming/2026-05-29-1130-6nz-to-scrmlTS-bug-ac-input-state-undefined-ref.md` + sidecar.
- **Bug AC (HIGH)** — every `<#id>` read of a `<keyboard>`/`<mouse>` input-state compiles to a bare
  undefined identifier `_scrml_input_<id>_` (`_scrml_input_cursor_.x`, `_scrml_input_keys_.pressed(...)`).
  Element registers into `_scrml_input_state_registry` fine, but reads use a name that's never bound →
  `ReferenceError` on first access. Exit-0, node --check OK, **entire §36 surface runtime-dead** — and the
  shipped canonical `input-canvas-demo.scrml` is itself broken (compile-only gate). Secondary flag: getters
  read plain closure vars (no reactive subscription) → direct `${<#x>.x}` interp likely non-reactive even
  once bound. No 6nz playground depends on §36 — pure probe.

## S144 turnaround (2026-05-30) — scrmlTS fixed 6; 6nz re-tested @ HEAD `4c9079d2` (v0.7.0): 5 CLOSED, AB PARTIAL
Inbox `2026-05-30-0945-...-AC-resolved-QAB-answered.md` → re-tested each sidecar + happy-dom drives.
Re-test/close-signal sent `2026-05-30-1130-6nz-to-scrmlTS-s144-5closed-AB-partial.md`.
- **X** `e50ee9c2` ✅ · **Z** `88071273` ✅ · **Y** `93d8cab4` ✅ (`E-MATCH-ARM-SEPARATOR`) · **AA** `93d8cab4` ✅ (`W-MATCH-VALUE-UNUSED`) · **AC** `c6cd6538` ✅ (reads via registry; renders, no crash; getters non-reactive by-design §36.6).
- **AB `5113f3ea` — PARTIAL / reopened.** Write-routing landed (`@mode=.X` → `_scrml_engine_direct_set` → dispatcher; `@mode` reactivity + `match` work). BUT `<onTransition>` effects still never fire: codegen emits `__scrml_transitions_mode = {}` empty (bodies not emitted, table not passed) AND runtime `_scrml_engine_direct_set` has no hook-firing. Needs a second landing.
- Bonus: AB probe → scrmlTS ratified **Fork-C1** (`effect=` on `<engine>` opener; impl pending).
- **p10 now 18/18** (17 + live Bug-Z guard `"handleKey(e)"` verbatim); `<onTransition>` pulled back out until AB's second half lands. scrml binary v0.7.0 (bun-wired to source — reflects HEAD live).

## Carried-in open items / route-arounds
- **AB second-half** (onTransition effect-firing) awaiting scrmlTS. Until then drive engine state via `@var = .Variant` (works via dispatcher); don't rely on `<onTransition>` effects.
  drive engine state via `@var = .Variant` (works) and don't rely on `<onTransition>` effects.
- Route around (per scrmlTS): Bug 54 (`<column :let=>`), Bug 60 (nested-compound render-by-tag),
  6nz-U/L/T, `${@x/}`. X/Y/Z/AA workarounds documented inline in p10.
- Canonical scrml gotchas re-confirmed this session: cell decls are `<name> = …` (bare, not `${}`-
  wrapped at `<program>` top — W-PROGRAM-REDUNDANT-LOGIC); functions called BARE (`foo()`, not
  `@foo()` — `@` is cells only; `@foo()` silently emits `_scrml_reactive_get(...)()` → runtime crash);
  `<engine>`/`<onTransition>` must be declaration-region children (a closed `${}` block pushes later
  siblings into markup → emitted literally); `<onTransition>` NESTS inside `<engine>`, dotted
  `from=.X to=.Y`, `${}` body.

## Suggested next playgrounds / work (master-list §E)
- p10 follow-ups: promote Tier-0 `${for…lift}` → `<each>`; `^{}` ambient sharing across regions;
  richer §51 (nested engines / `history` / `<onTimeout>`/`<onIdle>`) once AB lands.
- Input-state types (§36 `<keyboard>`/`<mouse>`/`<gamepad>`) — scrmlTS flagged as ≈0 adoption,
  uniquely high-signal; a dedicated playground would be valuable.
- Re-test X/Y/Z/AA/AB against the next scrmlTS tag when fixes land.
