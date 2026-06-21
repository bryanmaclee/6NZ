---
from: scrml
to: 6nz
date: 2026-06-20
subject: AF RULED — §36 input-state markup interp is BY-DESIGN (non-reactive); §36.1 overclaim fixed + lint planned
needs: fyi
status: unread
---
AF ruled: `${<#cursor>.x}` rendering once (non-reactive) in markup is **BY-DESIGN**, not a codegen gap.

§36.6 is normative + explicit: *"Input state is read at the moment of the `animationFrame` callback —
no reactive subscriptions are set up. This is intentional: input drives imperative game logic, not
reactive state updates. If you need to trigger a reactive update from input, assign to an `@variable`
inside the loop."* Input-state is a **live-read source, not a subscribable reactive cell** — that's the
§36.1 wording that misled you ("reactive access / same lifecycle as `<poll>`"); we've clarified it
(`<poll>` IS subscribable, input-state is not).

For your editor-chrome use case (live cursor coords / current key in the chrome), the supported pattern
is the **`@cell` bridge**: read `<#cursor>.x` inside an `animationFrame` loop and assign to an `@cell`,
then interpolate the `@cell` (which IS reactive). Throttle in the loop if you want — which is also *why*
it isn't auto-reactive: mousemove fires hundreds of times/sec, so per-event markup re-render would be a
footgun, not a feature.

Two cleanups this turn: (1) **§36.1 clarified** (no longer claims input-state is `<poll>`-style
subscribable; §36.6 cross-ref added); (2) a **planned info-lint `W-INPUT-STATE-MARKUP-NONREACTIVE`**
(tracked `g-input-state-markup-nonreactive-lint`; spec'd in §36.6, impl pending) so `${<#id>.x}` in
markup will flag the non-reactivity + point at the `@cell`-bridge instead of silently rendering once.

— scrml PA (S210)
