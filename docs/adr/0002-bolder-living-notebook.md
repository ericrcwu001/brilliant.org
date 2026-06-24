# Pivot the design north star to a bolder, cinematic "Living Notebook"

**Status:** accepted

The UI design system originally optimized for **restraint** ("Clean Mathematical
Notebook": motion crisp and sparse, flat surfaces by default, *not a game"). A prior
premium-UI research council had also concluded "do not reskin — keep the bespoke
notebook and add a thin additive layer." We are deliberately reversing that emphasis: the
design north star is now a **bolder, cinematic identity with ambient motion** — a
mathematical notebook that has been *letterpressed and brought to life* — while keeping
the notebook metaphor, the warm light palette, and the serious quant-prep tone.

The decision rests on a positioning insight: warm-paper + hairline + editorial-serif is,
as of 2026, one of the **default looks AI tooling generates**, so the aesthetic alone no
longer signals "premium." Differentiation must come from (1) craft execution, (2) the
product's proprietary signatures (tally streak, wax-seal milestones, state-machine spine,
equation tiles, empirical→theory convergence), and (3) choreographed, cinematic motion.

Concretely, this pivot adopts a real stack and reverses several documented defaults:
add a **variable display serif (Fraunces)** above IBM Plex; introduce a **tactile
letterpress/deboss depth** layer (relaxing "flat by default"); make motion **cinematic +
ambient** on a **single timeline-token clock**; and take on a **full-foundational**
infrastructure: a **Style Dictionary** token pipeline (collapsing the hand-synced
`tokens.css` / `konva/theme.ts` / `motion/tokens.ts` triad), CSS Modules + cascade
layers, **Radix Primitives + React Aria** for interactive components, **GSAP** (free) for
SplitText/hero timelines, native **View Transitions**, and **KaTeX** for typeset results.
Full direction lives in `docs/ui_design_system.md` ("The Living Notebook").

## Considered options

- **Stay restrained / additive thin layer (rejected).** Lower risk and effort, preserves
  the existing build almost entirely. Rejected because the restrained aesthetic is now an
  AI-default look and would not move perceived quality; the user explicitly chose a bolder
  identity with animations.
- **Re-evaluate or replace the aesthetic; or go dark "lab/terminal" (rejected).** A
  larger "wow," but throws away the notebook moat and the built signatures, and reverses
  the light-only MVP. Rejected in favor of *intensifying* the existing world.
- **Bolder via type + motion only, keep flat surfaces and zero new deps (rejected).**
  Cheaper, but undershoots the chosen "tactile depth" and the full-foundational scope;
  leaves the three-token-source drift and monolithic CSS as a quality ceiling.

## Consequences

- **The prior "restraint / don't reskin" guidance is superseded.** `docs/ui_design_system.md`
  is the source of truth; older restraint language (and HANDOFF's "Premium Notebook"
  thin-layer verdict) no longer governs.
- **Larger, riskier surface than a thin layer.** New typeface, depth language, a second
  animation library (GSAP), a token pipeline, component migration, and CSS restructure —
  staged in the doc's migration phasing (0: foundations → 1: depth & type → 2: motion
  choreography → 3: components & states).
- **Tone risk is managed by explicit Restraint Rails** (motion budget, low-amplitude
  pausable ambient, semantic-only color, no confetti, full reduced-motion parity). "Alive"
  must never become "gamified" or slow.
- **Performance pressure increases.** Fraunces, GSAP, KaTeX, Radix, and React Aria add
  weight against an under-2s budget and an already-large single entry chunk; code-splitting,
  lazy-loading, and font subsetting become mandatory, and Playwright visual-regression
  guards the polish.
- **Confetti is replaced** by the wax-seal ink stamp as the completion moment (keep the
  "Lesson complete" text node for existing e2e selectors).
- **Single token source becomes load-bearing:** Style Dictionary emits CSS + Konva +
  Motion/GSAP tokens, removing the `--mark-wash` 0.22-vs-0.30 class of drift.
- **MVP stays light-only;** dark mode remains post-MVP.
