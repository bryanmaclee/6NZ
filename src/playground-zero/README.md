# playground-zero

**First 6nz scrml experiment — working.** A port of the Z-motion release-order
classifier (SPEC v0.4 §5) from the vanilla-JS playable prototype into scrml.
Proves the stack can handle the event-stream + state-machine work that 6nz's
input layer needs.

## Run

```bash
scrml dev src/playground-zero/app.scrml
```

Then focus the textarea and press keys. Status line shows the last
classification (TAP / ROLL / HOLD) and currently-held keys.

## History

Session 8 (2026-04-20): First scrml-native 6nz source. Surfaced 6 compiler
bugs on the first attempt. scrmlTS fixed all 6 the same day (see
`../../handOffs/incoming/read/2026-04-20-1700-scrmlTS-to-6nz-all-6-bugs-fixed.md`).
Smoke test now passes: TAP / ROLL / HOLD classifications, clear button,
multi-key rolls all behave per spec.
