# Konva course-path spine with a parallel DOM accessibility overlay

**Status:** accepted

The signed-in Home ("study desk") renders its course-path spine — the vertical
rule, node dots, per-lesson glyphs, and the `--mark-wash` focus beam — in a single
Konva `<Stage>`, matching the in-lesson `StateGraph` so the desk reads as the same
"living diagram." Because a `<canvas>` has no DOM semantics, interaction and
accessibility are provided by a **parallel layer of transparent, absolutely
positioned DOM buttons** (one per node) carrying focus, keyboard-arrow navigation,
44px hit targets, and `aria`; the detail panels are ordinary DOM. We chose this
over the simpler, recommended DOM/SVG spine to keep Home visually unified with the
lesson hero on the product's first signed-in screen.

## Considered options

- **DOM/SVG spine (rejected).** Dots/glyphs/beam as HTML/CSS/SVG: renders on the
  critical path, natively accessible, and keeps Konva isolated to the deferred
  preview. Rejected only because it would not match the Konva `StateGraph` visual
  language on Home.
- **Konva canvas-only with an offscreen DOM fallback (rejected).** Reimplements
  focus/hit-testing inside the Stage. Lighter DOM, but higher accessibility risk
  and custom canvas focus logic.

## Consequences

- Konva is now **eager on Home's critical path** (the spine cannot defer-mount like
  the looping preview). This revises the rationale of the perf decision
  (`docs/home-study-desk.md` Q15), not its conclusion (no code-split for the gate):
  the spine must stay lightweight, and only the looping preview defers + pauses
  offscreen.
- The same nodes have **two representations** (Konva visual + DOM overlay) that must
  be kept in sync — positions, states, and labels are authored once and projected
  to both.
- **Mobile diverges** (`docs/home-study-desk.md` Q19): the single-Stage model is the
  *laptop* layout. On mobile the focused node is a DOM card (with an inner Konva
  preview) atop a compact Konva rail of the remaining glyph-only nodes — so mobile
  is not literally one Stage.
- `prefers-reduced-motion` renders a static Konva frame.
