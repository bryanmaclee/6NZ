# 6NZ — The scrml Interactive Development Experience

A purpose-built code editor for scrml development, built entirely in scrml.

## Status: Exploratory implementation phase

Design decisions are locked (see below). Eleven scrml-native playgrounds exist
under `src/` (p0–p10), stress-testing the language and compiler ahead of
editor-proper work. Editor scaffolding (real IR, real relevance view content,
live diagnostics, completion) remains gated on scrml compiler API exposure.

## Design Principles

### 1. Focus-Centered Viewport
Whatever is under the cursor is always at screen center. The document moves, not the viewport.
No traditional scrolling — typewriter-style centering applied to the entire editing experience.

### 2. No File Tree / Tabs / Panes
The file tree is an on-demand navigator, not a permanent sidebar. No tabs. No split panes as
the primary model. Files are accessed, not "opened." The editor shows one thing: the code
you're working on.

### 3. NeoVim Inspiration + Full Mouse
Keyboard-first UX (modes, motions, composable commands), but the mouse is a first-class citizen.
Both input methods must feel native. The goal is to help devs break mouse dependency while never
gate-keeping them.

**Specific keybindings are provisional.** What's in `z-motion-spec/default-bindings.md` and
the `master-list.md` binding tables is a working draft — the grammar is stable, but every
concrete key assignment is open to change.

### 4. Spatial Intelligence Panels
Every type of contextual information has a fixed, predictable screen location — never a popup
that obscures the code behind it. The dev's eyes learn where to look:

- **Live evaluation** — "what would console.log print for cursor target?"
- **Compiled JS output** — "what does the output JS look like for this element?"
- **Dependency chain** — "what depends on / is depended on by this?"

No LSP hover boxes covering the code you're trying to reference.

### 5. Total Configurability
Everything is configurable — more than NeoVim. But scripting custom configuration from scratch
is completely opt-in. The default experience must be excellent without any configuration.

**Config layers:**
- Layer 0: Beautiful defaults, everything click-accessible
- Layer 1: GUI-driven keybind/preference customization
- Layer 2: Declarative config file
- Layer 3: Full scripting API (the "giga-chad" layer)

**Emotional target:** Feel like a NeoVim power user while having VS Code accessibility.
Not a compromise — both simultaneously.

### 6. PWA Architecture — In the Runtime, Not Beside It

6NZ is a PWA running in the browser. This is a strategic advantage, not a limitation.
The dev's app compiles to JS that runs in the same browser environment as the editor.
6NZ is *inside* the runtime, not talking to it over a wire.

**What this enables:**

- **Browser dev tools are always one F12 away.** Console, network, elements, performance
  profiler, debugger — all work on the compiled output. No remote debugging setup.
  F12 is the escape hatch for when you need raw JS inspection.

- **Live preview iframe.** The compiler runs in ~42ms per file. 6NZ compiles on keystroke
  and injects output into a preview iframe. The dev sees their app update live. The
  browser's dev tools can inspect that iframe. 6NZ captures console output from it.

- **Console capture for the eval panel.** Override `console.log/warn/error` in the
  preview iframe scope. Pipe output back to 6NZ's eval panel. The browser sees generic
  JS; 6NZ maps it back to scrml source lines via source maps.

- **Source-mapped debugging.** The compiler emits source maps that map generated JS back
  to `.scrml` source lines. Set a breakpoint in the browser debugger → it highlights
  the scrml source in 6NZ, not the compiled JS.

- **`~{}` test panel.** scrml's inline test sigil (`~{}`) compiles to runtime assertions.
  6NZ runs these in the preview iframe and shows pass/fail inline in the editor — a
  testing experience that no generic dev tools can provide.

- **scrml-native dev tools > generic dev tools.** The spatial intelligence panels (eval
  preview, compiled JS view, dependency chain) *are* the dev tools — just ones that
  understand scrml. They know about `@var` reactivity, `?{}` SQL queries, server/client
  boundaries, `lin` consumption. Chrome DevTools never will.

**What a PWA can't do:** Programmatically open/control the DevTools panel (Chrome DevTools
Protocol requires an extension or remote debugging). But 6NZ doesn't need to — its panels
replace the need for most dev tools interactions. F12 is the escape hatch, not the workflow.

## Architecture
- PWA — runs in the browser, adjacent to the runtime environment
- Built in scrml (dogfooding / self-hosting)
- Integrates with the scrml compiler for live intelligence (compile-on-keystroke)
- Compiles with the scrml compiler
- Preview iframe for live app rendering + console capture
- Source maps for scrml → JS debugging

## Deep Dive

Research lives in `../scrml-support/docs/deep-dives/`:
- `6nz-editor-2026-03-30.md` — architecture analysis
- `6nz-editor-research-2026-04-02.md`
- `6nz-rendering-architecture-2026-04-02.md`

Rendering decision: **CM6 + canvas overlay — locked** (see `master-list.md` §B).

## Structure

Live inventory is tracked in `master-list.md`. Current shape:

- `src/playground-zero` … `playground-ten` — eleven scrml-native playgrounds
  (Z-motion classifier, mode state machine, hjkl + z-motion buffer, CM6
  mount probe, keystroke-granular undo tree, LSP-bridged diagnostics/completion,
  relevance-region navigator, …). See `master-list.md` for the current
  per-playground inventory. Exploratory; not the editor.
- `proto/6nz-playable/` — vanilla-JS playable prototype (deployed to GitHub
  Pages). Concept demo, not the editor.
- `proto/z-motion-feel/` — older throwaway for z-motion input grammar.
- `z-motion-spec/` — open-source (CC0) Z-motion specification.

The editor proper (CM6 + canvas overlay, real IR, relevance view content,
live diagnostics, completion) is gated on scrml compiler API exposure.
Exploratory scrml work — editor shell, buffer model, input/event handling,
mode machine, Z-motion classifier, config system, UI primitives — is
unblocked and underway in the playgrounds.
