# non-compliance.report.md
# project: 6nz
# generated: 2026-04-25T00:00:00Z
# scan mode: FULL_COLD_START (S10 cold refresh)

## Summary

Total docs scanned: 14
Compliant: 10
Non-compliant: 2
Uncertain: 2

Docs scanned (excluding handOffs/, .claude/):
`editor-README.md`, `editor-architecture.md`, `master-list.md`, `pa.md`, `README.md`,
`user-voice.md`, `z-motion-spec/SPEC.md`, `z-motion-spec/README.md`,
`z-motion-spec/default-bindings.md`, `proto/README.md`, `proto/6nz-playable/README.md`,
`src/playground-zero/README.md`, `src/playground-one/README.md`, `hand-off.md`

---

## Non-compliant docs

### z-motion-spec/default-bindings.md

**Reason:** content-heuristic + spec-draft
**Detail:** The document's own header states `Companion to: SPEC.md v0.4` and carries an explicit
`⚠ v0.4 status notice` flagging two items as stale against the current spec: (1) FAMILY 2
(numeric count-hold) is marked "do NOT ship" because SPEC v0.4 §9 dropped it; (2) any timing
language (hold threshold, roll window) is stale. The authoritative spec is now v0.5 (sustained
gestures, 2026-04-12). `default-bindings.md` is v0.2, pegged to v0.3 grammar. The document
itself acknowledges v0.3 alignment is partially stale and a v0.3 rewrite is planned.

Additionally, `z-motion-spec/README.md` says the repository layout contains `SPEC.md v0.1
specification` — a stale copy of the README that hasn't been updated to reflect v0.5.

**Specific stale content:**
- All of `# FAMILY 2 — Numeric count-hold family` section — explicitly dropped in SPEC v0.4 §9
- `master-list.md §E` also calls `default-bindings.md` v0.2 "partially stale against SPEC v0.5"
  and queues a v0.3 rewrite

**Suggested disposition:** Do not move this file. Keep it in-place but scope is to rewrite as
`default-bindings.md` v0.3: drop FAMILY 2 entirely, add `[j]`/`[k]` vertical motion per
master-list §E, update SPEC references to v0.5. Tracked as open work in `master-list.md §E`.

---

### editor-README.md — `## Structure` section and "decision pending" line

**Reason:** content-heuristic + grep-mismatch
**Detail:** Two issues in the same file:

1. The last sentence under `## Architecture` reads:
   `"No source exists yet — implementation is blocked on scrmlTS compiler API exposure."`
   This is now partially wrong. `src/` exists and contains 5 working scrml playgrounds
   (as of S8–S9). The editor _proper_ is still blocked; exploratory playgrounds are not.
   The sentence over-states the block.

2. The `## Deep Dive` section at the bottom includes paths like
   `../scrml-support/docs/deep-dives/6nz-editor-2026-03-30.md` — these are out-of-repo
   cross-references that are correct in spirit but cannot be verified from this repo.
   Not flagging as non-compliant (they are explicitly described as living in scrml-support).

**Suggested disposition:** Update the `## Structure` section in `editor-README.md` to say
"Exploratory implementation in progress — see `master-list.md §A` for current playground
inventory. Editor proper awaits scrmlTS compiler API exposure." Do not expand further.

---

## Uncertain docs (needs human review)

### z-motion-spec/README.md

**Reason:** content-heuristic
**Detail:** The repository layout block inside the README reads:
```
z-motion-spec/
├── README.md    this file
├── SPEC.md      v0.1 specification
└── LICENSE      CC0 1.0 public domain dedication
```
It says "v0.1 specification" for SPEC.md — but the actual SPEC.md is v0.5. This is
a stale README that was likely written when v0.1 was the current version. The actual
file layout is also missing `default-bindings.md`.

**What to check:** Update the layout block in `z-motion-spec/README.md` to show the
correct SPEC version (v0.5) and include `default-bindings.md` in the listing.

---

### proto/6nz-playable/README.md — "What's intentionally missing" contradiction

**Reason:** content-heuristic
**Detail:** The section `## What's intentionally missing` says:
> "The 6nz headline concepts (relevance view, inline expansion, focus-centered viewport) — those require the compiler API"

However, the `## What works` section documents that **relevance region**, **inline expansion**,
and **focus-centered viewport** ARE implemented (as mocks/heuristics). The "intentionally
missing" list and the "what works" list describe the same features with opposite verdicts.

The contradiction is consistent with the prototype having evolved past its initial README.

**What to check:** Reconcile `## What works` (lines 37–40: relevance region, inline expansion,
focus-centered viewport are listed as working mockups) with `## What's intentionally missing`
(same features listed as missing). Clarify that these are *compiler-backed* versions that are
missing, not the prototype-level mocks. This is a docs accuracy issue, not a structural one.

---

## Tags
#non-compliance #project-mapper #cleanup #6nz

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
