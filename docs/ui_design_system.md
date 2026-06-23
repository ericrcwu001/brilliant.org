# UI Design System: Clean Mathematical Notebook

## Design North Star

The interface should feel like a polished mathematical notebook come alive. The product is serious quant-interview prep, not a game and not a dashboard. The "wow" comes from clarity, tactile interaction, and motion that explains the math: a flip moves through the state machine, a tile snaps into an equation, and simulation converges toward theory.

## Product Design Principles

- **Notebook, not dashboard.** Use warm paper, ink, hairline rules, and subtle paper-grain texture. Avoid SaaS cards, glass effects, generic gradients, and colored KPI blocks.
- **Math is the interface.** `H`, `T`, `E0`, `1/2`, arrows, equations, and state labels should do most of the visual work.
- **Motion explains.** Animations should map to mathematical events: flip, state transition, tile snap, substitution, convergence.
- **One thing per beat.** Each lesson screen should have one prompt, one interaction, one feedback area, and one primary action.
- **Tactile but serious.** Equation tiles should feel physical and satisfying without becoming childish.
- **Color is semantic.** Accent colors mark active states, coin outcomes, feedback, and predictions. They should not decorate.

## Responsive Strategy

Mobile-first. Laptop overrides at one breakpoint.

### Breakpoints

- **Mobile:** `<768px` — full-width small screen.
- **Laptop:** `>=768px` — centered page column.

```css
--bp-laptop: 768px;
--page-max: 960px;
```

### Page model

- **Mobile:** content uses the full viewport width with standard side padding.
- **Laptop:** content sits in a single centered column, max-width 900–960px (`--page-max`). The paper-grain background fills the entire viewport seamlessly — no visible page edge, no desk tone outside the column.
- **Bars:** top bar and sticky action bar align to the same centered column on laptop.

### Use the width (laptop)

- Canvas and chart regions expand to the full column width and grow taller (see Vertical fill).
- Side-by-side comparisons stay side-by-side; do not stack at laptop.
- Equation tile trays spread horizontally.

## Background Texture

Default page background is **paper-grain**: a very low-contrast fiber/noise texture on `--paper-0`. It should be barely perceptible — warmth and tactility, not decoration.

**Edge-confined grid policy:** full graph-paper grids appear only inside Konva canvas and chart regions where coordinates matter. Never use a repeating grid as the page background.

Alternates (documented menu — use only if paper-grain is rejected in review):

1. **Dot grid** — faint dots at intersections; ~80% less ink than a full grid.
2. **Plain warm paper** — no markings; cleanest, loses notebook cue.
3. **Margin rule** — single faint vertical margin line like a composition notebook.
4. **Faded grid** — full grid masked to fade at edges and behind text.
5. **Registration ticks** — sparse `+` marks at wide intervals.
6. **Single axis** — one faint horizontal and vertical axis pair.
7. **Ruled lines** — faint horizontal lines only (legal pad).
8. **Isometric grid** — sparse triangular grid; more distinctive, riskier.

## Color Tokens

### Paper and Ink

```css
--paper-0: #FCFAF5;        /* page background */
--paper-1: #F6F2E9;        /* raised panels and index cards */
--paper-2: #EFEADD;        /* wells, inactive trays, code-like fields */
--rule-faint: #E7E1D2;     /* canvas/chart grid lines, hairline guides */
--rule: #D8D1BF;           /* dividers and hairline borders */
--ink: #1B2230;            /* primary text */
--graphite: #4C4F59;       /* secondary text, inactive edges */
--graphite-soft: #7C7E87;  /* captions, placeholders, disabled text */
```

### Primary Accent: Quill Blue

```css
--quill: #2E4FB0;          /* active state, buttons, empirical line */
--quill-strong: #233E8C;   /* pressed and text-grade variant */
--quill-tint: #E5EAF7;     /* selected tile and drag-over fill */
```

### Coin Semantics

```css
--heads: #C0892C;
--heads-tint: #F6EAD2;
--tails: #2A7C88;
--tails-tint: #DCEDEF;
```

Heads and tails must always be paired with the letters `H` and `T`. Never rely on color alone.

### Feedback

```css
--correct: #2F8F5B;
--correct-text: #1F6E43;
--correct-tint: #E2F1E8;
--wrong: #CE4A3E;
--wrong-text: #A93529;
--wrong-tint: #F8E6E3;
--mark: #E8B23A;
--mark-wash: rgba(232, 178, 58, 0.22);
```

Use `--mark` as highlighter ink for hints, discovery moments, and prediction markers.

## Typography

Use the IBM Plex family for a scientific, engineered feel.

- **Body and UI:** IBM Plex Sans.
- **Math tiles, state labels, coin tokens, numeric values:** IBM Plex Mono.
- **Editorial title moments:** IBM Plex Serif, used sparingly.
- **Typeset final equations:** KaTeX / Computer Modern.

Fallbacks:

```css
--font-sans: "IBM Plex Sans", system-ui, "Segoe UI", Roboto, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Consolas, monospace;
--font-serif: "IBM Plex Serif", Georgia, "Times New Roman", serif;
```

Suggested type hierarchy (mobile / laptop):

- Display: 30px / 36px → 40px / 48px, 600, slight negative tracking.
- H1: 24px / 30px → 32px / 40px, 600.
- H2: 19px / 26px → 24px / 32px, 600.
- Body: 16px / 24px → 19px / 30px, 400.
- Caption: 13px / 18px → 15px / 22px.
- Label: 12px / 16px → 13px / 18px, 500, slight letter spacing.
- Math tile: 18px → 22px, IBM Plex Mono 500.

## Spacing, Radius, and Elevation

Use a 4px base and 8px rhythm:

```css
--s1: 4px;
--s2: 8px;
--s3: 12px;
--s4: 16px;
--s5: 24px;
--s6: 32px;
--s7: 48px;
--s8: 64px;
```

On laptop, bump vertical spacing between major regions one step (e.g. `--s5` → `--s6`).

### Vertical fill (laptop)

Canvas and interaction regions use a min-height of ~50–60vh and a larger internal scale so interactive elements grow taller within the wider page column.

Radius:

```css
--r-xs: 4px;
--r-sm: 6px;
--r-md: 8px;
--r-lg: 12px;
--r-pill: 999px;
```

Use flat surfaces by default. Shadows are only for lifted interactive elements.

```css
--e1: 0 1px 2px rgba(27, 34, 48, 0.06);
--e2: 0 6px 16px rgba(27, 34, 48, 0.14);
```

## Motion

Motion should be crisp, sparse, and meaningful.

```css
--dur-micro: 120ms;
--dur-base: 200ms;
--dur-slow: 360ms;
--dur-tell: 600ms;
--ease-out: cubic-bezier(.2, .7, .2, 1);
--ease-spring: cubic-bezier(.2, 1.2, .3, 1);
--ease-inout: cubic-bezier(.5, 0, .2, 1);
```

Signature motions:

- Flip token appears, state node pulses, and active edge travels in one synchronized beat.
- Equation tile lifts, slightly rotates, and snaps into a slot.
- Substitution value slides into an equation slot and simplifies in place.
- Empirical simulation line converges toward the theory line.
- Milestone stamp presses down like ink on paper.

Respect `prefers-reduced-motion`: replace travel, pulse, shake, and convergence animations with immediate state changes or short fades.

## App Shell

### Top Bar

Both mobile and laptop:

- Back control on the left.
- Lesson short title and a horizontally scrollable per-beat progress rail in the center.
- Streak chip on the right.

Use a lean bar, not a full dashboard header. On laptop, the bar aligns to the centered page column.

**Per-beat progress rail:**

- One segment per lesson beat (beats 1–9 and 11); horizontally scrollable with no visible scrollbar; upcoming beats peek at the right edge.
- Mobile: ~4 beats visible at once. Laptop: ~6 beats visible at once.
- Each segment shows complete / current / upcoming state.
- Beats are color-grouped by phase tint (Bet, Explore, Model, Prove); no separate phase label.
- Phase mapping: Bet = beats 1–2, Explore = beat 3, Model = beats 4–7, Prove = beats 8–9 + 11.
- Extension bias sandbox (beat 10) is an off-rail "Try bias" chip and never appears in the rail.

### Sticky Action Bar

Every lesson beat should have a sticky bottom action bar with one primary action:

- `Flip`
- `Check`
- `Lock prediction`
- `Continue`
- `Run simulation`

Secondary actions, such as `Hint` or `Show explanation`, should be visually quieter.

On laptop, align to the centered page column (same max-width as content).

Beat-to-primary-action map (flagship lesson):

| Beat | Primary action | Enabled when |
|------|----------------|--------------|
| 1 Open with the bet | `Continue` | a prediction is selected |
| 2 Choose / compare | `Continue` | compare mode confirmed |
| 3 Simulate & watch state machine | `Flip` → `Continue` | `Flip` (single + batch) until ≥3 flips and one prefix change; primary swaps to `Continue` after the guided replay reaches the annotated near-miss |
| 4 Find the failure edge | `Check` | a next-state is tapped |
| 5 Build equations | `Check` | all slots in the active row(s) are filled |
| 6 Refine prediction | `Lock prediction` | slider has been moved |
| 7 Guided substitution | `Continue` | the final value is derived |
| 8 Theory vs simulation | `Run simulation` | always |
| 9 Discover overlap | `Continue` | always |
| 10 Bias sandbox (Extension) | `Skip` / `Continue` | always; never required |
| 11 Review and next step | `Continue` | always |

`Hint` appears as a quiet secondary action only on `Check` beats (4, 5). On the `lesson-longer-patterns` transfer lesson, the `failure-edge` and `equation-tiles` beats cap the hint ladder at level 2 (the level-3 reveal is suppressed).

## Laptop Interaction

- Hover affordances on buttons, equation tiles, and graph nodes: subtle lift (`--e1`) or `--quill-tint` fill; cursor changes to pointer on interactive targets.
- Drag is mouse-driven on laptop; tap-to-place remains available as an equivalent path.
- Keyboard focus rules unchanged; hover does not replace visible focus rings.

## Screen States

Every data-backed screen must define non-happy-path states. Match the notebook identity: hairline skeletons over spinners where possible, quiet ink copy, no SaaS toasts with drop shadows.

- **Loading (content fetch):** course path and lesson beats show a hairline skeleton of the layout, not a spinner. Target is the under-2-second first-interaction budget.
- **Restoring work:** while hydrating a snapshot, show a brief "Restoring your work…" line in the prompt strip; reveal the interaction once committed state is applied.
- **Content / auth error:** inline ink message with a single `Retry` ghost action; never a blank screen. Auth field errors follow the `Inputs` spec.
- **Offline:** a persistent quiet banner, "Saved locally — syncs when you're back online." Interactions stay fully usable; writes are fire-and-forget.
- **Failed write:** non-blocking; do not interrupt the learner. If a restore fails entirely, offer "Start this lesson over" with the local mirror as the first fallback.
- **Empty / not-yet-started:** course path shows available and locked nodes per the Course Path spec; no empty-state illustration.

## Component Specs

### Buttons

- Height: 48px.
- Radius: `--r-md`.
- Font: IBM Plex Sans 600.
- Primary: `--quill` fill, `--paper-0` text.
- Secondary: paper fill, `1.5px --ink` border.
- Ghost: `--quill-strong` text, no border.
- Disabled: `--paper-2` fill, `--graphite-soft` text.
- Focus ring: `2px --quill`, offset by 2px.

### Inputs

Use notebook-line inputs for auth and display name:

- Label above the field.
- Only a bottom rule by default.
- Focus state thickens the rule and turns it `--quill`.
- Errors use `--wrong-text` helper copy and `--wrong` rule.

### Equation Tiles

Equation tiles are the signature tactile component.

- Minimum hit area: 44px by 44px.
- Face: `--paper-0`.
- Border: `1px --rule`.
- Radius: `--r-sm`.
- Font: IBM Plex Mono 500.
- Drag/lift: `--e2`, scale `1.04`, slight rotation.
- Snap: spring settle.
- Correct: `--correct-tint` flash and `--correct` border.
- Wrong: short horizontal shake and `--wrong` border; reduced motion uses color only.

Tile category markers:

- State variable (`E0`, `E1`): `--quill`.
- Probability (`1/2`, `p`, `1-p`): `--heads`.
- Constant (`0`, `1`): `--graphite`.
- Operator (`+`, `=`, `-`): `--ink`.

### Equation Slots

- Dashed rectangle aligned to the equation baseline.
- Empty: `1.5px dashed --graphite-soft`.
- Drag-over: `1.5px dashed --quill` with `--quill-tint` fill.
- Filled: solid border and paper fill.

### Prediction Slider

Style as a number line:

- Mono tick labels.
- Thumb is a quill-blue ink dot.
- Locked prediction leaves a `--mark` marker.
- Marker later appears in the theory-vs-simulation chart.

### Feedback Strip

Feedback appears inline above the sticky action bar, not in a modal.

- Correct: `--correct` rule, short explanatory sentence.
- Incorrect level 1: conceptual nudge.
- Incorrect level 2: relevant state edge or slot glows with `--mark-wash`.
- Incorrect level 3: reveal the correct tile or step, then mark `needsReview`.

### Streak

Use tally marks, not a flame. This keeps the habit loop inside the notebook identity.

- Render the count as pen tally strokes plus label, e.g. `12-day streak`.
- Every fifth day uses the diagonal slash.
- On increment, draw the new stroke with a short stroke-dash animation.

### Milestones

Use a stamped seal, not a badge.

- Circular ink-ring seal.
- `--mark` accent glyph such as `HH != HT`, `Σ`, or `✓x3`.
- On earn, press the seal down with a short stamp animation.
- Reduced motion: fade in only.

## Auth-First Onboarding

Flow:

1. Landing page.
2. Sign in or create account.
3. Confirm display name.
4. Course path.
5. Start or resume lesson.

Landing hero:

- Headline: "Why does `HH` take longer to appear than `HT`?"
- Subline: "State thinking for quant interviews."
- A small live preview of the 3-node state machine pulsing through a flip sequence.
- Primary CTA: `Create account`.
- Secondary CTA: `Sign in`.

Landing hero (laptop):

- Centered within the page column.
- Display-scale headline and subline per laptop type hierarchy.
- Larger live state-machine preview.

The tone should be confident and terse. Avoid generic marketing copy and exaggerated excitement.

## Course Path

Use a vertical number-line / state-chain path.

- A central rule connects lesson nodes.
- Each lesson appears as an index-card row attached to the line.
- Mastered node: filled quill-blue state plus milestone stamp; label "Completed", or "Fully mastered" when `transferAttained` is true.
- `needsReview` node: completed state with a `--mark` ring and a "Review recommended" caption; the course-path CTA points here before "Start next lesson".
- Available node: ink ring with `Start` or `Resume`.
- Locked node: faint rule and lock glyph.
- Roadmap nodes appear below a divider as "On the roadmap" and are not tappable.

Course path (laptop):

- Centered vertical state-chain column within the page max-width.
- Larger index-card rows and type scale per laptop hierarchy.

The path should always expose the next recommended action:

- Resume current lesson.
- Start next unlocked lesson.
- Review a `needsReview` lesson.

## Flagship Lesson Layout

Every beat uses this skeleton (mobile and laptop):

```text
[top bar: back / title + beat rail / streak]
[prompt strip: one question or instruction]
[Konva canvas or interaction region]
[controls, if needed]
[sticky action bar: primary action + hint]
```

On laptop, all regions align to the centered page column. Canvas and chart regions expand to full column width and use the laptop min-height (~50–60vh) where applicable.

Screen-by-screen direction:

1. **Open with the bet**
   - Large `HH` and `HT` tokens.
   - Learner predicts which takes longer.

2. **Choose or compare pattern**
   - Side-by-side `HH` and `HT` compare cards only, both pre-selected in compare mode. No length-3 pickers in this lesson; length-3 lives in `Longer Patterns & Overlap`.

3. **Simulate and watch the state machine**
   - Coin stream appends left to right with the active state chip; the three-node graph is visible and pulses on each flip.
   - `Flip` (single + batch) is the primary action; after the exit gate it swaps to `Continue`, then a short guided replay travels the active edge to the annotated near-miss.

4. **Find the failure edge**
   - Side-by-side transition prompts; stack vertically on mobile, remain side-by-side on laptop.
   - Learner taps the next state for a near-miss.

5. **Build equations**
   - Equation skeletons and tile tray; tray spreads horizontally on laptop.
   - Tap-to-place first, drag as enhancement.

6. **Refine prediction**
   - Number-line slider.
   - Locked prediction becomes a chart marker.

7. **Guided substitution**
   - Tap to substitute the next known value.
   - Optional drag-to-substitute if time permits.

8. **Theory vs simulation**
   - Empirical line, theory line, and prediction marker; chart fills column width on laptop.

9. **Discover overlap**
   - Side-by-side `HH` and `HT` mini-graphs; stack vertically on mobile, remain side-by-side on laptop.
   - Highlight reset vs self-loop.

10. **Bias sandbox** (Extension)
   - Optional slider for coin bias `p`; reachable via the off-rail "Try bias" chip.

11. **Review and next step**
   - Recap, milestone stamp, next lesson recommendation. Course path shows "Fully mastered" when `transferAttained`, else "Completed".

## Konva Visual Rules

On laptop, scale canvases and charts to the full column width. Use edge-confined grid (`--rule-faint`) inside canvas/chart regions only, per the Background Texture policy.

### State Graph

- Nodes are circles with matched-prefix labels: `∅`, `H`, `HH`.
- Active node uses `--quill` stroke and a soft pulse.
- Absorbing node uses `--correct` double ring.
- `H` edges use `--heads`; `T` edges use `--tails`.
- Self-loops arc above; reset edges curve below.
- Active edge thickens and shows a traveling dash.
- Laptop: scale the graph to fill the column width; min-height ~50–60vh on beats that center the state machine.

### Tile Layer

- Keep static shapes on a static layer.
- Move dragged tiles to an active drag layer.
- Commit React state on tap/place or drag end, not during every drag frame.
- Do not write to Firestore during animation.

### Simulation Chart

- Theory line: solid ink.
- Empirical line: quill blue.
- Prediction marker: dashed mark/highlighter line.
- Use labels and dash patterns so the chart is readable without color.
- Laptop: chart fills column width and grows taller.

## Accessibility

- All interactive targets must be at least 44px.
- Do not rely on color alone.
- Equation tile placement must support a non-drag path: select tile, then select slot.
- Canvas interactions need DOM equivalents or `aria-live` summaries for flips, state changes, and feedback.
- Keyboard focus must be visible.
- Reduced-motion mode must still allow the lesson to be completed.
- Test at 200% text scaling without clipping core actions.

## Implementation Notes

- Keep all tokens in one source of truth, such as `theme.ts` plus CSS custom properties. Include responsive tokens: `--bp-laptop`, `--page-max`.
- Avoid literal hex values in components.
- MVP is light-only. Dark mode is post-MVP.
- Self-host fonts if possible to protect the under-2-second lesson load target.
- The signature demo moment is the first synchronized flip: coin token, node pulse, and edge travel should feel exact.
