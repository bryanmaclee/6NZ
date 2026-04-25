# test.map.md
# project: 6nz
# updated: 2026-04-25T00:00:00Z  commit: e5a0752

## Test Framework

No unified test runner. No root-level test config.

Per-playground smoke tests are driven by puppeteer via `proto/6nz-playable/test.js`
and equivalent per-playground harnesses. Each playground's smoke test is run via:
```
node test.js        (from proto/6nz-playable/)
scrml dev + puppeteer   (pattern for src/playground-* tests)
```

## Test Categories

| Playground | Test file | Count | How run |
|---|---|---|---|
| playground-zero  | (no separate test file; smoke built-in) | 7 checks | puppeteer, manual |
| playground-one   | (no separate test file)                 | 8 checks | puppeteer, manual |
| playground-two   | (no separate test file)                 | 12 checks | puppeteer, manual |
| playground-three | (no separate test file)                 | 9 checks | puppeteer, manual |
| playground-four  | (no separate test file)                 | 14 checks | puppeteer, manual |
| proto/6nz-playable | `proto/6nz-playable/test.js`          | 62 scenarios | `node test.js` |

All smoke tests are manual — no CI trigger. All currently pass (last verified S9, 2026-04-22).

## Fixtures & Factories

`proto/6nz-playable/test.js` — inline scenario objects with shape:
```js
{ seed: { text, cursorOffset }, steps: string[], expect: { text, cursor } | null }
```

No separate fixture files.

## Pattern

Tests are puppeteer-driven real-browser scenarios. Each test seeds the editor with
an initial buffer and cursor position, dispatches a sequence of key events (using
explicit hold/release helpers for z-motion gestures), and asserts on final buffer
state and cursor offset. Assertion style: `assertEqual(actual, expected)` with
console-reported pass/fail counts.

## Tags
#6nz #map #test #scrml #puppeteer #playgrounds

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
