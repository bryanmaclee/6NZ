# playground-one

**Vim-style mode state machine — scrml-native.** Uses scrml's `< machine>`
primitive so the compiler enforces legal mode transitions.

## Modes

| Mode | Key | Purpose |
|---|---|---|
| **Insert** | default | typing (6nz's default — z-motion lives here) |
| **Normal** | `Esc` | motions + operators + actions |
| **Visual** | `v` from Normal | character-wise selection |
| **V-LINE** | `V` from Normal | line-wise selection |
| **TOGGLE-HOLD** | `Ctrl` hold from Insert | tap-repeatable normal commands while held (SPEC §10.3) |

## Legal transitions (machine-enforced)

```
Insert     => Normal | ToggleHold
Normal     => Insert | Visual | VisualLine
Visual     => Normal | VisualLine | Insert
VisualLine => Normal | Visual | Insert
ToggleHold => Insert
```

Any attempt to write `@mode = Mode.Visual` from Insert directly is rejected
at compile time — the machine forces the grammar.

## Run

```bash
scrml dev src/playground-one/app.scrml
```

Click the textarea, then drive it: `Esc` / `i` / `a` / `o` / `v` / `V` /
`Ctrl` hold.

## Smoke test

Puppeteer-driven, 8/8 functional tests pass (Insert→Normal→Visual→V-LINE→Normal→Insert→TOGGLE-HOLD→Insert).

## Known compiler bug encountered

`fn name(p: T) -> ReturnType { body }` drops its body at codegen — emits
an empty `function` wrapper and leaks body text at module scope, producing
invalid JS. Filed as Bug G to scrmlTS
(`../../handOffs/incoming/read/...-fn-decl-body-dropped.md` once archived).
Workaround in this file: use `function` instead of `fn` — noted inline at
the `modeName` definition.
