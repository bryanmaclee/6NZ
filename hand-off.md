# 6nz — Session 8 Hand-Off

**Date:** 2026-04-20
**Next hand-off filename:** `handOffs/hand-off-8.md`

## Session start state
- Session 7 rotated to `handOffs/hand-off-7.md`
- Working tree: clean on `main` @ `b175559`
- `handOffs/incoming/` empty
- `user-voice.md` header-only (no contentful entries yet for this repo)
- Maps (`.claude/maps/`) still from session 2 cold run — refresh may be due
- Playable prototype at `proto/6nz-playable/` (index.html + test.js, 62 scenarios passing)
- GitHub Pages workflow present at `.github/workflows/pages.yml`
- SPEC at v0.5; `editor-architecture.md` present
- No production source yet — design phase

## Session work

- **Verified GitHub Pages is live** at https://bryanmaclee.github.io/6NZ/ (HTTP 200, 95 KB, serving prototype). Initial deploy failed red — fixed by flipping repo Settings → Pages → Source = "GitHub Actions".
- **Audited scrmlTS blurb about 6nz** (5 claims: focus-centered viewport / NeoVim-superset + mouse / CM6 + canvas overlay / offline-first PWA / Z-motion CC0) — all accurate against locked decisions here. No correction message sent.
- **Tightened `pa.md:16`** — "MIT or CC0" → "CC0 1.0 Universal (locked in `z-motion-spec/LICENSE`)". Decision has been locked since session 3; pa.md was stale.
- **Dropped "NeoVim can adopt" predictions** from pa.md, README.md, z-motion-spec/README.md — framing sounded too confident. Kept factual lineage references (Z-motion extends Vim/NeoVim motion grammar; 6nz is a NeoVim-inspired superset).
- **Softened keybinding framing across repo** to make explicit that specific key assignments are provisional (grammar is stable, key map is a working draft). Updated: `master-list.md` §B + §C (replaced "Locked binding families" with "Provisional binding families" + prominent note; reframed "NeoVim superset" as aspirational), `z-motion-spec/README.md` (Status section rewritten from stale v0.1 text), `z-motion-spec/default-bindings.md` (strengthened header disclaimer), `editor-README.md` §3 (added provisional-bindings note), `README.md` (one-liner in z-motion-spec bullet).
- **Added playground link to top-level README** — "Try it" section pointing at https://bryanmaclee.github.io/6NZ/.
- **Direction change: exploratory scrml implementation is now unblocked.** Corrected prior mental model (scrml already targets browser — JS/HTML/CSS output; Bun is build-time only, never a runtime). Real blocker narrows to: can scrml consume CM6 cleanly? — and user's stance is "try it, find out empirically, don't wait for a report." Updated `pa.md`: replaced "Do not start implementation before compiler API is exposed" with "Exploratory scrml implementation is encouraged — editor shell / buffer / input / modes / Z-motion / config / UI primitives can start now; semantic features still gated on compiler API." Added read-only scrmlTS access to `pa.md` for language-reference lookups (spec/tutorial/examples) while authoring 6nz source.
- **First scrml-native 6nz source written** at `src/playground-zero/` — Z-motion release-order classifier port. Stack end-to-end functional (scrml init / compile / dev all work, compiled output is structurally sound, reactive state + markup + CSS all compile fine). But **6 compiler bugs surfaced** in the first hour:
  - Bug A: `onkeydown=fn()` event attribute drops event arg (contradicts tutorial §1.5). Repros on scrmlTS's own `01e-bindings.scrml`.
  - Bug B: `let x = A; if (c) x = B` emits shadow `const x = B`.
  - Bug C: Multi-statement arrow bodies (`.map((e,i) => { ... })`) silently dropped.
  - Bug D: Name mangling bleeds onto DOM method access (`classList.toggle` → `classList._scrml_toggle_7` when a user fn `toggle()` exists). Repros on scrmlTS's own `01e-bindings.scrml`.
  - Bug E: `^{}` meta block at program root emits Object.freeze with no commas → JS SyntaxError, app never loads.
  - Bug F: `let` + reassign inside else-branch mis-classified as derived-reactive declaration.
  - Combination of A+E currently means there is NO way to write a scrml app that reads keyboard event properties.
- **Bug report filed** to scrmlTS at `../scrmlTS/handOffs/incoming/2026-04-20-1251-6nz-to-scrmlTS-compiler-bugs-playground-zero.md` — 6 bugs with minimal repros + full attempted source inline (so scrmlTS can verify scrml grammar).
- **playground-zero kept** as evidence: `app.idiomatic-blocked.scrml` (canonical tutorial-following attempt, blocked on A/B/C/D), `app.workaround-broken.scrml` (^{} escape-hatch attempt, produces invalid JS via E/F), `README.md` documenting state. Both files will be unblocked / cleaned up when scrmlTS fixes the codegen bugs.

## Key decisions captured

- (no new locked decisions this session — doc-hygiene + verification only)
