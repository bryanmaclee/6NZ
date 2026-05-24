# 6nz — Session 11 Hand-Off

**Date:** 2026-05-23 → 2026-05-24
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

### Bugs S + T filed — surfaced building playground-eight
- **Bug S (`return not` mis-emits as `return !`):** the `not` keyword in return position is emitted as unary boolean negation instead of `null`/`undefined`. The next statement (a `const` declaration) gets glued onto the `!`, producing `return !const ...` — invalid JS, `node --check` fails, the entire bundle dies at parse time. Workaround: use `return null` (which compiles fine in return position despite §42.7 rejecting `null` in value-assignment positions). Hypothesis: parser disambiguation site between unary-negation `not` and absence-sentinel `not` doesn't account for the "completion of a `return` statement with no operand" position.
- **Bug T (`//` inside string literal):** BS preprocessing treats `//` as line-comment start regardless of string-literal context. A string like `"file:///path"` is truncated to `"file:"` AND all subsequent `@cell` module-level declarations are silently dropped from init (same cascade shape as Bug Q). Sibling of Bug L (BS not string-aware on `{`/`}`). The adopter-visible failure is "I added an absolute URL with `//` and now my whole page renders empty." Workaround: build URLs via `"file:" + String.fromCharCode(47) + String.fromCharCode(47) + "/path"`.
- Filed at `scrmlTS/handOffs/incoming/2026-05-23-0757-6nz-to-scrmlTS-bugs-s-t-from-playground-eight.md` + 1 sidecar (`bug-t-double-slash-in-string-truncates-and-cascades.scrml`).

## Cross-repo traffic log
- **Out to scrmlTS** (1 message + 1 sidecar): `2026-05-23-0719-6nz-to-scrmlTS-bugs-l-m-n-o-status-plus-bug-p.md` — closes L/M/N/O loop (L still open / fix reverted; M+N+O confirmed fixed by emit + node --check), files new Bug P with minimal repro. Bug N closure explicitly addresses scrmlTS's pending-confirmation ping from 2026-04-26 (their reply message never landed on this clone).
- **Out to scrmlTS** (1 message + 2 sidecars): `2026-05-23-0735-6nz-to-scrmlTS-bugs-q-r-from-playground-seven.md` — files two new compiler bugs surfaced during playground-seven construction. Q (auto-lift drops @cell init) HIGH; R (if= mounts but never unmounts) HIGH-but-narrower.
- **Out to scrmlTS** (1 message + 1 sidecar): `2026-05-23-0757-6nz-to-scrmlTS-bugs-s-t-from-playground-eight.md` — two new bugs from p8 construction. S (`return not` mis-emits as `return !`, gluing next `const` → SyntaxError) HIGH. T (`//` inside string literal eats line + cascades to drop subsequent @cell inits) HIGH, sibling of Bug L.

### Built playground-eight — LSP completion + hover on CM6
- Extends p6's diagnostics-over-WebSocket wiring with two more LSP surfaces: `textDocument/completion` (rendered via CM6's `@codemirror/autocomplete` UI) and `textDocument/hover` (rendered as a CM6 tooltip above the symbol). Bridge wire same as p6: browser ↔ WS ↔ bridge.js ↔ stdio ↔ scrmlTS LSP. Window-side pending-promise map indexed by JSON-RPC id resolves LSP responses back to CM6's source callbacks.
- Smoke: **9/9 pass**. CM6 mounts → LSP reaches ready → initial doc clean → **typing `@` returns 57 completion items (first: `lift`) end-to-end through the bridge** → typing `<` returns another completion batch → hover request path reachable → broken doc (undeclared identifier) returns full `E-SCOPE-001` diagnostic via LSP. (Initial probe used `@x = (` which silently compiles clean — parser tolerates unclosed paren — so the test was fixed to use an undeclared identifier instead. The compiler's tolerance of unclosed parens is noted but not filed as a bug; could be intentional partial-edit tolerance.)
- **End-to-end confirmation:** scrmlTS S40-S42's LSP L1-L4 stack reaches us through the WebSocket bridge cleanly. Any future tooling that wants live diagnostics / completion / hover / signature help / code actions can build on this pattern today, without waiting for the in-process compiler API.

## S11 day-2 (2026-05-24) — scrmlTS round-trip: P fixed, Q migrated, R retracted

Two inbounds arrived overnight from scrmlTS and were processed:

### Inbound 1 — `2026-05-23-1900-scrmlTS-to-6nz-bug-q-closed-mno-confirmed.md` (archived)
- **Bug Q CLOSED (S123, `9c06053f`)** — but as a BREAKING CHANGE. Bare `@x = init` at `<program>`/`<page>`/`<channel>` body-top now fires `E-WRITE-NOT-IN-LOGIC-CONTEXT`. Default-logic auto-lifts *declarations* only; reactive-cell *writes* are logic and need `${...}` (or use V5-strict `<cell> = ...` structural form). This is the loud-error resolution of the silent failure I filed — correct call.
- M/N/O closures acknowledged on their side.
- L/P/R/S/T triaged: L+T deferred to M6 native parser; P/R/S queued HIGH; they recommended P first.

### Inbound 2 — `2026-05-24-0606-scrmlTS-to-6nz-bug-p-fix-landed.md` (archived)
- **Bug P FIXED (S126, `d570341d`)** — added a `CHUNK_DEPENDENCIES` table to runtime-chunks.ts; `scope → {timers, animation}`. Our "in case" animation-chunk flag was covered too. In HEAD `dc073b94`.

### Actions taken
- **Migrated p7 + p8 for E-WRITE** — wrapped each logic block (functions + reactive-cell writes) in `${...}`, matching p5/p6. Both recompile clean.
- **Bug P verified fixed** — repro emits `function _scrml_stop_scope_timers` (was 0). Re-smoked the two affected playgrounds: **p5 back to 18/18, p6 back to 7/7.** Bug P closed on our side.
- **Bug R RETRACTED** — re-tested the repro wrapped in `${...}` on `dc073b94`: `if=@derived` mounts AND unmounts correctly (toggle alternates ON/OFF cleanly). Bug R was a downstream artifact of Bug Q's broken init (half-wired if= subscription), NOT a standalone if= bug. p7's mode badges now alternate → **17/17.** Asked scrmlTS to pull Bug R from their fix queue.
- **Reply sent** — `2026-05-24-0609-6nz-to-scrmlTS-q-migrated-bug-r-RETRACTED-p-s-priority.md`: P verified, Q migrated, R retracted, priority now S-only (P done, R gone, L+T deferred). Plus Bug T scope refinement (only bites module-top declaration context, not function-body strings — p8's `lspWsUrl()` `"ws://..."` compiles fine).

### Net state (against scrmlTS `dc073b94`)
**All four CM6 playgrounds fully green: p5 18/18, p6 7/7, p7 17/17, p8 9/9.** Bug status: M/N/O/P fixed+verified, Q fixed (loud error, migrated), R retracted, S active (queued), L+T deferred to M6.

## S11 day-2 (cont'd) — playground-nine + bugs U/V/W

### Built playground-nine — editor IR + logical traversal (13/13)
- First non-CM6 playground; actual editor-proper progress (not a demo). Models the Editor IR (editor-architecture.md §3) as a flat-indexed node-tree arena.
- Implements: logical traversal (step into/out/sibling via l/h/j/k), cursor-driven auto-collapse (the locked "writing code IS debugging code" / auto-collapse-never-manually-managed principle), recursive tree-walk renderer (walk() calls itself — exercises scrml recursion, a surface prior playgrounds didn't hit).
- **Design note:** fold state is COMPUTED from @cursorId at render time, not mutated. The first design mutated a @collapsed array via `applyAutoCollapse()` + a `^{ applyAutoCollapse() }` meta-effect; that created a write-during-render race (render reads @collapsed, meta-effect writes it, same tick) and the tree froze after exactly one update while the status panel kept updating. Recomputing visibility from cursor position removed the hazard entirely and is a truer expression of the design principle. Lesson: don't have a meta-effect write what a render interpolation reads.
- 13/13 smoke: recursive render, all traversal, auto-collapse on/off, manual fold under auto-off, deep-descendant recursion, no pageerrors.

### Three bugs surfaced building p9 — filed `2026-05-24-0641-...-bugs-v-w-from-playground-nine.md` + 2 sidecars
- **Bug W (CRITICAL)** — grouping parens dropped in emit. `(2 + 3) * 4` → `2 + 3 * 4` = 14 not 20. Silent arithmetic corruption, no diagnostic, affects EVERY parenthesized binary expression (reactive or not): `(1+2)*3`→`1+2*3`, `(10-2)/4`→`10-2/4`, `(@r+1)%3`→`@r+1%3`. Found by accident — an index-wrap `(@sel+1) % 3` advanced 0→1→2→3 instead of 0→1→2→0. Ranked above the whole open queue; it's a correctness bug in the most basic expression form. Workaround: none clean — must avoid relying on grouping parens around binary ops until fixed (rewrite to avoid the grouping, or split into intermediate consts where the precedence is unambiguous).
- **Bug V** — `class:NAME=expr` on a for-lift element is create-time only; never re-evaluates when the dep changes. Selection-highlight in a rendered list silently stuck. Hit it on p9's cursor-line highlight (`class:cursor=ln.isCursor`). Workaround applied in p9: render the tree as a single reactive `${treeText()}` string with a textual "> " cursor marker instead of per-line class binding.
- **Bug U (minor)** — bare `/` right after a close-tag (`</code>/<code>`) mis-parsed as a closer → E-SYNTAX-050; `/` between plain text is fine. Trivial workaround (spaces / different separator). Folded into the same message.

## Open items carried to S12
- **Bug W (CRITICAL)** — grouping parens dropped in emit → silent wrong arithmetic. Filed `2026-05-24-0641`. Highest-priority correctness bug; recommended to scrmlTS as above the rest of the queue. No clean workaround — avoid grouping parens around binary ops, or split into intermediate consts, until fixed.
- **Bug V** — `class:NAME=expr` on a for-lift not reactive. Workaround in p9 (single reactive string render). Affects any selection-highlight-in-a-list; will bite the editor's real tree/list views — track for fix.
- Awaiting scrmlTS fix for **Bug S** (`return not` + `const` → `return !const`; queued HIGH; clean `return null` workaround in place).
- Bug L + T deferred to M6 native parser (both BS string-awareness siblings). Workarounds hold: FromCharCode for braces (L) in p5/p6/p7 sample docs; FromCharCode for `//` (T) in p8's module-top URL. Note Bug T only bites module-top `@cell = "...//..."` — function-body strings are fine.
- **Bug Q lesson — durable source discipline:** at `<program>`/`<page>`/`<channel>` body-top, wrap all reactive-cell writes in `${...}` (or use `<cell> = ...` structural form). Bare `@x = init` is now a compile error. Every future playground starts with the `${...}` logic wrap.
- **Bug-filing lesson — durable:** before filing any "weird reactive behavior" bug, run a `${...}`-wrapped control. Bug R was a false positive that cost a real retraction; the bare-body-top form produces subtly broken codegen that masquerades as other bugs.
- Compiler tolerance observation (not filed): `@x = (` (unclosed paren) compiles clean. Could be intentional partial-edit tolerance.
- Smoke-test scripts now exist for p5/p6/p7/p8. Earlier playgrounds (zero/one/two/four) still have no committed puppeteer harness; they compile clean post-migration but formal smoke coverage is a separate work item.
- Master-list §A `default-bindings.md` status reconciled to `[x]` (S10 commit `0ffb452` shipped v0.3).
- Durable lesson (logged): don't have a `^{}` meta-effect write a reactive that a render interpolation reads on the same tick — the render freezes after one update. Compute derived display state from primary reactives at render time instead.
- Suggested next playgrounds (in master-list §E):
  - playground-ten: multi-buffer / relevance-region surface — multiple scrml-rendered code spans sharing one mode state machine via `^{}` ambient; probes whether the relevance-view's "multiple focused code regions" model composes. (Be wary of Bug V if any list-selection highlight is involved; use the single-string render pattern.)
  - editor IR follow-ups for p9: inline-expansion (a reference node expands to include a referenced definition's subtree), relevance annotations, IR↔disk save round-trip. Each is a fresh dogfood surface.
