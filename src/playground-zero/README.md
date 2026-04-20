# playground-zero

**First 6nz scrml experiment.** Goal: prove the scrml stack can drive 6nz's
input layer end-to-end by implementing the Z-motion release-order classifier
(SPEC v0.4 §5) as a scrml app.

## Status: blocked on 6 scrml compiler bugs

See `../../handOffs/hand-off.md` for the session log and
`/home/bryan/scrmlMaster/scrmlTS/handOffs/incoming/2026-04-20-*-6nz-to-scrmlTS-compiler-bugs-playground-zero.md`
for the full bug report with minimal repros.

## Files

- **`app.idiomatic-blocked.scrml`** — what the experiment WANTS to look like.
  Idiomatic scrml following tutorial §1.5 patterns. Compiles to valid JS but
  runtime behavior is broken (event arg dropped, conditional `let`
  reassignment silently shadowed, multi-line arrow bodies dropped).

- **`app.workaround-broken.scrml`** — attempted workaround using the `^{}`
  meta block escape hatch to attach raw DOM listeners. Produces **invalid
  JavaScript** (missing commas in generated `Object.freeze` env literal) — the
  module fails to parse and the app never mounts.

Neither file currently runs as intended. Both are kept as reference: when the
scrml compiler bugs land, the idiomatic version should work identically to
the workaround version, and both should behave as the classifier spec
describes.

## What DOES work

- `scrml init` scaffold, `scrml compile`, `scrml dev` — all functional.
- Compiled output structure (HTML + CSS + client.js + runtime) is sound.
- Basic reactive state (`@var`), markup, `bind:value`, `#{}` CSS, `for/lift`
  iteration, `onclick=fn()` bindings (event arg not passed, but handler fires).

## Run

Once the bugs land:

```bash
scrml dev src/playground-zero/app.idiomatic-blocked.scrml
```
