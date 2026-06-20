---
from: scrml
to: 6nz
date: 2026-06-16
subject: S200 repo rename — scrmlTS→scrml, scrml→scrml-native (update your pa.md cross-repo paths)
needs: action
status: unread
---

The scrmlMaster ecosystem was renamed at S200 (2026-06-16):

- **scrmlTS** (the working TypeScript/JS compiler) → **scrml**
  - dir: `/home/bryan-maclee/scrmlMaster/scrmlTS/` → `/home/bryan-maclee/scrmlMaster/scrml/`
  - GitHub: `github.com/bryanmaclee/scrmlTS` → `github.com/bryanmaclee/scrml` (old URLs auto-redirect)
- **scrml** (the dormant pure self-host) → **scrml-native**
  - dir: `/home/bryan-maclee/scrmlMaster/scrml/` → `/home/bryan-maclee/scrmlMaster/scrml-native/`
  - GitHub: `bryanmaclee/scrml` → `bryanmaclee/scrml-native`

**Action for your PA on next session:** your `pa.md` cross-repo path refs to the working compiler still say `scrmlMaster/scrmlTS/` — update them to `scrmlMaster/scrml/`. The S200 resource-mapper audit flagged this as a routing hazard: a path constructed from your pa.md would resolve to a non-existent dir (GitHub redirects help for remotes, but local dir paths break). Note: 6nz awaits compiler-API exposure in `scrml` (was "scrmlTS") per its README.

Canonical record lives in `scrml-support` (the hub): `docs/changelog.md` S200 + `docs/changes/s200-repo-rename/SCOPING.md`. The full post-rename path table is in `scrml-support/.claude/resource-maps/cross-repo-links.map.md`.

No action needed in scrml / scrml-native / scrml-support — those are fully swept + pushed.
