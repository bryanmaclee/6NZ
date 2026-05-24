# 6nz — Session 12 Hand-Off

**Date:** 2026-05-24
**Next hand-off filename:** `handOffs/hand-off-12.md`

## Session start state
- Session 11 rotated to `handOffs/hand-off-11.md`
- Working tree: `main` @ `f9ac69c`, clean (plus 2 unread inbounds in `handOffs/incoming/`)
- Two inbounds from scrmlTS (both `needs: fyi`) re Bug W:
  - `2026-05-24-0717-scrmlTS-to-6nz-bug-w-in-progress-v-u-disposition.md` — Bug W CONFIRMED CRITICAL, fix in flight; V queued post-W; U logged minor; meta-effect-freeze acknowledged (not filing).
  - `2026-05-24-0735-scrmlTS-to-6nz-bug-w-FIX-LANDED-verified.md` — **Bug W FIXED + verified at scrmlTS HEAD `a91ad5de`.** Precedence-aware `emitBinary`; 21179 pass / 0 fail. Action for 6nz: re-verify p9 arithmetic, re-test Bug V (now W is no longer confounding its repro), close Bug W on our side.

## Carried-in open items (from S11)
- **Bug W** — FIXED upstream at `a91ad5de`, pending our re-verify + close.
- **Bug V** — `class:NAME=expr` on for-lift not reactive; re-testable now W is fixed (its repro used `(@sel+1)%3`, corrupted by W). If highlight still stuck → genuine V; if it moves → was a W artifact.
- **Bug S** — `return not` + `const` → `return !const`; queued HIGH upstream; `return null` workaround in place.
- **Bug L + T** — deferred to M6 native parser (BS string-awareness). Workarounds hold.
- **Bug U** — minor, logged upstream; likely subsumed by M6.
- Durable lessons: wrap reactive-cell writes at body-top in `${...}`; run a `${...}`-wrapped control before filing reactive bugs; don't let a `^{}` meta-effect write what a render interpolation reads same-tick.
- Suggested next playgrounds (master-list §E): playground-ten (multi-buffer/relevance-region), p9 IR follow-ups (inline-expansion, relevance annotations, IR↔disk round-trip).

## Session work

### Processed 2 scrmlTS inbounds re Bug W (both moved to `read/`)
- `0717` (in-progress) + `0735` (fix-landed at `a91ad5de`). scrmlTS asked us to re-verify p9 arithmetic + re-test Bug V now that W no longer confounds it.

### Bug W — VERIFIED FIXED, closed our side
- scrmlTS checkout sits exactly at `a91ad5de` (the fix); `scrml` runs from `compiler/bin/scrml.js` so it reflects HEAD.
- Emit check: `(2+3)*4`, `(1+2)*3`, `(10-2)/4` all preserve grouping parens (no corrupted forms). Root cause (their side): acorn discards `ParenthesizedExpression`; hand-rolled `emitBinary` had no precedence guard → fixed with precedence-aware paren re-insertion.
- Runtime check: the Bug V repro's `(@sel+1)%3` index-wrap advances `0→1→2→0` (was stuck pre-fix).
- p9 recompiles clean against `a91ad5de`, `node --check` on client bundle OK — no regression.

### Bug V — GENUINE, confirmed post-W (root cause = lift/reconcile runtime, not codegen)
- Re-ran the Bug V sidecar against `a91ad5de` under puppeteer. `@sel` advances `0→1→2→0` correctly, but the `.sel` highlight stays frozen on the first item (alpha/id 0) all 3 clicks; only "matches" on click 3 because `@sel` wraps to 0. Exactly one `.item.sel` always — the create-time winner.
- Static emit confirms the per-item effect IS correctly scoped (own `it`, own `_scrml_lift_el_9`, reads `@sel`) → codegen is fine. The failure is the `innerHTML="" + _scrml_lift(wrapper)` / reconcile path: the reactive toggle never reaches the live DOM node (clone-vs-move or create-time-effect-on-orphaned-node). Diagnostic + hypothesis sent to scrmlTS.
- So Bug V is NOT a Bug-W artifact (W's fix only removed the confound). Workaround (single reactive `${fn()}` string) holds in p9.

### Reply sent to scrmlTS
- `2026-05-24-0800-6nz-to-scrmlTS-bug-w-VERIFIED-closed-bug-v-GENUINE.md` — W verified/closed, V genuine with full lift-path diagnostic + emit excerpt, p9 clean, U/S acked, plus the puppeteer→playwright tooling FYI (we'd been borrowing their puppeteer via NODE_PATH).

### Test tooling — local package.json stood up (playwright, new tests only)
- User confirmed: adopt playwright for FUTURE harnesses; leave p5–p9 on puppeteer until touched; migrate opportunistically.
- Found 6nz has no local `node_modules` — all smoke harnesses borrow puppeteer from scrmlTS via `NODE_PATH`. scrmlTS migrated to playwright (still ships both today), so the borrow is a latent silent-breakage risk.
- Added `@playwright/test@1.60.0` (matches scrmlTS) to `package.json` + `test` script. `.gitignore` already covers `node_modules/` + `dist/`. **`npm install` + browser download NOT yet run** (heavy fetch) — flagged for user go-ahead.

### Harness note (process)
- Fighting puppeteer-from-node fd-inheritance: spawning `scrml dev` + headless chrome from a node script kept the Bash tool's pipe open → process killed (exit 144) with lost stdout. Resolution that works: have the node harness write results synchronously to an absolute file path per-line (not rely on buffered console.log), kill the child by port, internal watchdog timer. (This is exactly the lifecycle pain playwright's test runner removes — reinforces the tooling decision.)
- Caution logged: a broad `pkill chrome` during debugging may have caught the user's real browser. Only target test instances by port/script from now on.

### Bug S — VERIFIED FIXED + closed (mid-session inbound)
- Inbound `0809` arrived during the session: Bug S fixed at scrmlTS `3a909c1d` (HEAD moved `a91ad5de`→`3a909c1d`). Two-guard fix (`\s+`→`[ \t]+` + keyword-exclusion) at both lowering sites.
- Reverted p8's `return null` workaround → canonical `return not` (7 sites in completion/hover sources) + dropped the stale "Bug S workaround" comment. p8 recompiles clean, `node --check` OK, all once-glued sites emit clean `return null;` (zero `return !`). Bare-adjacency repro (`return not` then `const`) also un-glued.
- Reply `2026-05-24-0814-6nz-to-scrmlTS-bug-s-VERIFIED-closed-workaround-reverted.md` sent; inbound archived. **Clears our last active filing — only Bug V remains open (scrmlTS side).**

## Open items carried to S13
- **Bug V** (genuine) — awaiting scrmlTS post-W diagnosis of the lift/reconcile path. Workaround (single `${fn()}` string render) holds; will bite the editor's real tree/list selection-highlight views. **The single open bug from 6nz's dogfooding now** (P/Q/R/S/W all resolved).
- **Bug L + T** — deferred to M6 native parser (BS string-awareness). Workarounds hold.
- **Bug U** — minor, logged upstream; M6-family.
- **Playwright install** — run `npm install` + `npx playwright install chromium` in 6nz to make the local dep real (large download; pending user go-ahead). First new harness should be authored on playwright.
- Durable lessons still in force: `${...}`-wrap body-top reactive writes; run a `${...}`-wrapped control before filing reactive bugs; don't let a `^{}` meta-effect write what a render interpolation reads same-tick.
- Suggested next playgrounds (master-list §E): playground-ten (multi-buffer/relevance-region — author on playwright; mind Bug V if any list-selection highlight), p9 IR follow-ups (inline-expansion, relevance annotations, IR↔disk round-trip).
