# structure.map.md
# project: editor (6nz)
# updated: 2026-04-11T00:00:00Z  commit: 41bce06

## Entry Points

None — no source code exists yet. Implementation is blocked on scrmlTS compiler API exposure.

## Directory Ownership

```
6nz/
├── .claude/               Claude agent settings and (now) maps
│   └── maps/              machine-readable navigation maps (this dir)
├── handOffs/              historical session hand-offs (excluded from mapping)
├── editor-README.md       locked design principles: viewport, architecture, z-motion, PWA
├── hand-off.md            live session state (current hand-off doc)
├── master-list.md         live inventory: what exists, design decisions, prerequisites, open work
├── pa.md                  primary agent directives for this repo
├── package.json           stub manifest (name + version only)
└── README.md              one-liner title only
```

## Planned (does not exist yet)

```
6nz/
├── z-motion-spec/         open-source Z-motion motion vocabulary specification (MIT/CC0)
└── src/                   editor implementation in scrml (proprietary/commercial)
```

## Ignored / Generated Paths

- `.git/` — version control internals
- `.jj/` — jujutsu VCS internals
- `node_modules/` — not present; no deps installed
- `handOffs/` — historical session records, excluded per scope rules

## Tags
#editor #6nz #map #structure #design-phase

## Links
- [primary.map.md](./primary.map.md)
- [master-list.md](../../master-list.md)
- [pa.md](../../pa.md)
