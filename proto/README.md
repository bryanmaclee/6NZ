# proto/ — Throwaway Concept Prototypes

**Not the real 6nz.** Nothing in this directory will ship.

This is a scratch area for concept prototypes — typically vanilla HTML/JS —
built to test design ideas *before* the scrmlTS compiler API is exposed and
real 6nz implementation can begin. The `scrml-only` rule that governs the
rest of this repo is waived **inside `proto/`** and only inside `proto/`.

## Why it exists

6nz is blocked on scrmlTS compiler API exposure. A faithful implementation
in scrml can't run in a browser today. But several design decisions —
especially the z-motion input grammar — can only be validated by actually
using them with your hands. Spec work gets only so far; at some point you
have to type into a real text surface and find out whether a gesture feels
right.

Prototypes in this directory exist to answer those "does it feel right?"
questions cheaply and fast, so the answers can feed back into the spec
before the real implementation starts.

## Rules

- Anything under `proto/` is throwaway. Do not plan for it to survive.
- Anything under `proto/` may use any language (vanilla JS/HTML/CSS is the
  default; nothing bigger than that should be needed).
- Nothing under `proto/` is imported or linked from real 6nz code.
- Prototypes are not versioned as products. Commit them, rewrite them,
  delete them — no migration concerns.
- When a prototype answers its question, fold the learning back into the
  relevant spec document (`z-motion-spec/`, `editor-README.md`, etc.), not
  back into the prototype.

## Current prototypes

- `z-motion-feel/` — browser-based tester for the z-motion input grammar.
  Single HTML file, vanilla JS, no build. Implements SPEC v0.3 §6 (commit-
  on-release, hold threshold, roll window, hold-set formation, commit) and
  a small fixed binding set from `default-bindings.md` v0.2 (letter family,
  single-key holds only). See its own notes inside `index.html`.
