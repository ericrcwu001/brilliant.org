# Reimagine the product as "Ergo" with a bright, premium, colorful identity

**Status:** accepted

**Supersedes: ADR-0002** ("Pivot the design north star to a bolder, cinematic Living Notebook")

The "Living Notebook" identity — warm paper, tally-mark streak, wax-seal milestones, Fraunces
display serif, letterpress/deboss depth — was a coherent design world, but user review and a
structured design grilling revealed three converging problems: (1) the aesthetic reads as
**plain, homemade, or elementary-school** to the target audience of quant-curious adults who
already associate warm-paper-and-serif with AI-generated defaults; (2) the course path renders
as a **thin flowchart** — graph-node dots with glyphs — giving no sense of a rich learning
journey or progress worth celebrating; (3) the product name "Pattern Hitting Times" was
borrowed from the flagship math topic and functions as a topic name, not a product identity,
making the brand unscalable beyond that single topic. The user's stated goal is a
**premium, brilliant.org-like feel** with visible progress, expressive (but not gamified)
motion, and a brandable product name that can grow.

Concretely, this decision renames the product to **Ergo**, replaces the notebook aesthetic
with a **bright, clean, colorful, cool-palette identity**, and adopts all eleven locked
design decisions from the subsequent design interview:

1. **Full reimagining away from the notebook** toward a brilliant.org-style premium world —
   the biggest-effort option, chosen deliberately over incremental fixes.
2. **Sophisticated, adult game-feel:** tasteful celebrations, visible light streaks and
   momentum cues; no Duolingo loudness, no mascot, no leagues, no hearts.
3. **"The math is the art":** math objects (coins, state machines, random walks, equation
   tiles, charts, counting tokens) are the signature illustration system, supplemented by a
   supporting geometric/abstract layer (chapter gradients, arcs, icons).
4. **Clean, bright, colorful palette:** cool near-white base (`--ergo-bg: #F7F8FB`), vibrant
   per-chapter color-coding, soft gradients, real depth via layered shadows. Light-only for
   now; dark deferred.
5. **Modern, precise type, no serif:** Space Grotesk (display) + Inter (body) + JetBrains
   Mono (math/mono). Self-hostable alternatives: General Sans or Geist (display), Hanken
   Grotesk (body), IBM Plex Mono (mono). Fraunces and IBM Plex are retired.
6. **Course path → rich vertical learning journey:** one refined lesson card per lesson, each
   with a mini math-visualization thumbnail, color-coded by chapter, connected by a
   chapter-gradient vertical rail; bold progress states; chapter section dividers. Structured
   vertical layout — not serpentine, not a Duolingo path.
7. **Modernized progress system:** clean weekly streak tracker (7-dot week rail, no flame)
   + a visible concepts-mastered medallion gallery (chapter-colored, math glyphs, earned vs
   locked) + per-lesson/chapter progress rings. Replaces tally marks and wax seals.
8. **"Ergo" positioning:** focused, brandable probability/quant-intuition product. Tagline
   candidates: "Reason about randomness." / "From hunch to proof." Home is structured so
   additional courses can be added later. The current 7 coin-pattern lessons (L0–L6) and the
   state-thinking throughline are kept.
9. **Keep the existing stack:** React 19, Konva, Motion, GSAP, KaTeX, custom CSS + Style
   Dictionary. Do not adopt Rive. Real interactive math viz stays Konva; the learning journey
   may be DOM + SVG.
10. **Spacing:** lessons focused (one-thing-per-beat) but composed (not empty); Home richer
    and denser; consistent 4px spacing scale.
11. **Implementation order:** spec → high-fidelity mock → Home + learning journey first →
    roll through lessons → polish.

Full token definitions, component specs, motion philosophy, and implementation phasing are in
`docs/ui_design_system.md` (Ergo Design System).

## Considered options

- **Evolve the notebook — additive thin layer (rejected).** Lower risk, minimal code change.
  Rejected because the warm-paper-plus-serif aesthetic is a 2026 AI-generation default, so
  the aesthetic alone no longer signals premium; and the course-path graph nodes remain a thin
  flowchart regardless of color changes. This path does not address the name scalability
  problem either.
- **Hero-home-only refresh — update Home but leave lessons unchanged (rejected).** Faster
  than a full reimagining but creates a split identity: a premium-looking Home leading into
  notebook-style lessons. The jarring seam undermines both surfaces. Rejected in favor of a
  consistent system.
- **Rich dark palette — dark "lab/terminal" aesthetic (rejected).** High visual impact, but
  diverges from the bright-and-accessible target, defers dark-mode as a feature rather than a
  base, and requires redesigning all lesson canvases for dark backgrounds. The user's stated
  reference is brilliant.org (light), not a terminal emulator.
- **Full gamification — points, leagues, hearts (rejected).** Visible progress mechanics are
  wanted, but the discipline mechanic (hearts/lives) and social-ranking layer (leagues) are
  explicitly not wanted. They would undermine the product's serious adult tone and contradict
  "sophisticated, adult game-feel."
- **Keep the serif display font — Fraunces or Newsreader (rejected).** Serif display was the
  primary type lever in the notebook identity. Moving to a clean-colorful world while keeping
  a serif display creates a mixed-signal identity — the type still reads "notebook." Space
  Grotesk is cohesive with the bright palette and brilliant.org reference.
- **Bespoke-illustration system — commission custom illustrations (rejected).** Adding a
  custom character or scene illustration layer would require ongoing asset production and
  risks visual inconsistency with the interactive math objects. The "math is the art"
  principle gives us a self-generating, always-coherent illustration system tied to the
  content itself.
- **Adopt Rive for animated illustrations (rejected).** Rive would add a new runtime dependency
  and require recreating interactive math animations in a separate tool. The existing Konva +
  Motion + GSAP stack already covers all animation needs and is battle-tested in the codebase.

## Consequences

- **ADR-0002 is superseded.** The Living Notebook direction — warm paper, Fraunces, tally
  marks, wax seals, letterpress/deboss, paper grain — is retired. ADR-0002 was accepted and
  acted on; this decision reverses its direction, not its process.
- **`docs/ui_design_system.md` is replaced** by the Ergo Design System. All notebook-
  metaphor language in that document is gone. Any other docs referencing notebook-specific
  tokens, Fraunces, IBM Plex, or `--paper-*` / `--quill` / `--ink` tokens must be updated.
- **Large migration.** All design tokens must be rewritten in `style-dictionary/tokens/*.json`
  to the Ergo set and regenerated (`tokens.generated.css`, `tokens.generated.ts`). The Konva
  theme (`src/lesson/konva/theme.ts`) must be resynced. Many lesson-beat components reference
  old token names directly.
- **Many notebook signatures are retired.** The tally-mark streak component, the wax-seal
  milestone stamp, the letterpress deboss depth layer, paper-grain backgrounds, and the IBM
  Plex / Fraunces typefaces are removed from the system. Their UI functions are replaced by
  the weekly streak dot rail, the concepts-mastered medallion gallery, soft layered shadows,
  cool-white surfaces, and the Space Grotesk / Inter / JetBrains Mono type stack.
- **Product rename from "Pattern Hitting Times" to "Ergo"** is a branding change that touches
  the wordmark, landing page copy, `CONTEXT.md`, and any user-visible strings. The math topic
  "pattern hitting times" remains accurate for the core content; it is no longer the product
  name.
- **Performance pressure is sustained.** Space Grotesk, Inter, and JetBrains Mono replace
  Fraunces and IBM Plex; total font weight is comparable. GSAP, KaTeX, Radix, and React Aria
  remain; their lazy-loading and code-splitting requirements are unchanged.
- **Confetti (if any remained) is replaced** by the tasteful light-streak + medallion-earn
  completion celebration. The "Lesson complete" text node is preserved for e2e selector
  stability.
- **MVP stays light-only.** Dark mode remains post-MVP.
- **CONTEXT.md is updated** to rename the product, add Ergo-system glossary terms, and
  annotate retired notebook terms as superseded.
