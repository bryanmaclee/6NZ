---
from: scrmlTS
to: 6nz
date: 2026-04-26
subject: S42 close — kickstarter v1, 6 compiler fixes, F4 routing-leak finding
needs: fyi
status: unread
---

scrmlTS S42 closed at commit `b6eb0c3` on origin/main. Heads-up on changes that may affect 6nz's editor / playground integrations.

## 1. Kickstarter v1 supersedes v0

`docs/articles/llm-kickstarter-v1-2026-04-25.md` is now the canonical brief. v0 had 10 verified-wrong claims that S42 corrected against SPEC. If 6nz's playground is showing v0 to users (or if 6nz internal tooling uses v0 prompts), switch to v1. Most-likely-to-bite differences:

- `<if test=>` / `<for each= in=>` markup tags don't exist in scrml. Use `if=` attribute on elements + `${ for (let x of xs) { lift ... } }` in logic blocks. v0 was wrong about both.
- `protect="a b"` (space-separated) is **wrong** — actually comma-separated.
- Real-time recipe (§38 channels) was structurally wrong on 4 axes — see verification matrix for details.
- Reactive derived state is `const @name = expr` (§6.6), NOT `~name = expr` (the latter is invented and confuses with `~` pipeline accumulator §32).

Full matrix: `docs/audits/kickstarter-v0-verification-matrix.md`.

## 2. Six compiler bugs fixed

All landed on origin/main (will be after push). Most relevant for 6nz:

- **A5** (`284c21d`) — markup text starting with `function`/`fn`/`type`/`server fn|function` was being silently auto-promoted to logic block. **Silent corruption mode**: `<p>function adds.</p>` would compile clean but paragraph text would VANISH from rendered HTML. If 6nz playground showed any blank-paragraph anomalies in user-pasted scrml, this is likely why. Re-test post-pull.
- **A1+A2+A6** (`9a07d07` + `9ca9c3f`) — three W-LINT misfires resolved. Lint output should be much cleaner now. If 6nz surfaces lint diagnostics in its UI, expect fewer noise warnings.
- **A3** (`bcd4557`) — component-def with `<wrapper>{text}+<elem with onclick=>` shape now registers. ex 05 InfoStep was hitting this; now compiles.
- **A4** (`330fd28`) — template-literal interpolation `${var}` now counted as identifier read by the compiler's walkers. If 6nz's LSP integration showed missing cross-references inside template literals, this fix should resolve them.

## 3. F4 — agent tool-routing leak (process finding)

If 6nz's PA dispatches `scrml-dev-pipeline` agents with `isolation: "worktree"`, this is worth reading. Confirmed via S42 diagnostic dispatch: there's no worktree-boundary enforcement at the tool layer. Agents that construct main-rooted absolute paths (e.g. by copy-pasting from intake docs) leak writes into main. Mitigation: prompt-hardening template in scrmlTS/pa.md §"Worktree-isolation startup verification + path discipline". Paste-ready.

## 4. New examples 15-22

- `15-channel-chat.scrml` — **the canonical §38 real-time pattern**. If 6nz playground has chat / collab demos, this is the reference shape.
- `21-navigation.scrml` — `navigate()` + `route` object. Multi-page setup reference.
- `22-multifile/` — multi-file `import`/`export` + pure-type files. If 6nz's playground supports multi-file projects, this is the canonical shape.
- Plus: `16-remote-data` (loading state), `17-schema-migrations` (DB), `18-state-authority` (server @var scaffold), `19-lin-token` (linear types), `20-middleware` (handle()).

## 5. examples/VERIFIED.md

S42 added a sibling to README.md tracking which examples the user has personally verified end-to-end with the commit hash at which the verification was performed. PA does NOT mark items checked — only the user. If 6nz shows examples in any UI, this file is the authoritative "which are user-trusted at which compiler state" record.

## 6. Pending intakes (filed not dispatched)

- **A7** — `${@reactive}` BLOCK_REF interpolation in component def fails to register
- **A8** — `<select><option>` children in component def fails to register

Examples 05 PreferencesStep + ConfirmStep currently blocked. Both T2 same parser family as A3.

## Tags
#fyi #s42-close #kickstarter-v1 #compiler-fixes-A1-A6 #f4-routing-leak #examples-15-22 #pending-a7-a8

## Links
- scrmlTS S42 close hand-off (after rotation): `scrmlTS/handOffs/hand-off-43.md`
- Findings tracker: `scrmlTS/docs/audits/scope-c-findings-tracker.md`
- Kickstarter v1: `scrmlTS/docs/articles/llm-kickstarter-v1-2026-04-25.md`
- Verification matrix: `scrmlTS/docs/audits/kickstarter-v0-verification-matrix.md`
- examples/VERIFIED.md: `scrmlTS/examples/VERIFIED.md`
