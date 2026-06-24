# UI Design System: The Living Notebook

A mathematical notebook that has been **letterpressed and brought to life**: pressed
ink on warm paper, a bolder editorial type voice, and cinematic motion that
*dramatizes the math*. This is the evolution of the original "Clean Mathematical
Notebook" — same world, more crafted, more alive.

> **Direction note (pivot).** Earlier guidance optimized for restraint ("motion crisp
> and sparse, not a game"). We have deliberately pivoted toward a **bolder, cinematic
> identity with ambient motion**, while keeping the notebook metaphor and the product's
> serious tone. The rationale, trade-offs, and the adopted stack are recorded in
> `docs/adr/0002-bolder-living-notebook.md`. Where this document and older notes
> disagree, this document wins.

## Design North Star

The interface should feel like a **mathematical notebook that has been pressed into
warm paper and then animated** — the math doesn't just sit there, it *moves through its
own logic*. The product is serious quant-interview prep, not a game and not a SaaS
analytics product. The signed-in **home** is a **study desk spread** — streak tally,
earned milestone seals, and the course path laid out on one page — not a grid of KPI
tiles. The "wow" comes from three compounding sources:

1. **Craft execution** — true device-pixel hairlines, real paper grain, optical type,
   pressed-ink depth, exact motion. The things generic UIs get wrong.
2. **Proprietary signatures** — the tally streak, the wax-seal milestones, the
   state-machine spine, the equation tiles, the empirical→theory convergence. Nothing
   else has these; we make them cinematic.
3. **Choreographed motion** — a flip moves through the state machine on one timeline, a
   tile is lifted and pressed into an equation, a seal stamps the page, simulation
   converges toward theory. Motion explains *and* delights.

## What "Premium" Means Here

**Premium is not the palette.** Warm paper + hairlines + an editorial serif is, as of
2026, one of the default looks AI tools generate. The aesthetic alone no longer reads as
expensive. So we win on **execution quality** and on **the moments only this product
has** — not on the color scheme.

**Premium is bolder, but never gamified.** We are intentionally louder than before:
oversized display type, tactile pressed depth, ambient living motifs, page-to-page
choreography. The discipline that keeps this *serious* lives in the **Restraint Rails**
(see Motion): a strict motion budget, low-amplitude ambient motion that pauses when
idle, semantic-only color, no confetti, and full reduced-motion parity. Expressive in
service of comprehension; never decoration for its own sake.

**Premium is uniform.** Every surface inherits the same primitive layer (tokens, type,
depth, motion). There is no "nice screen" and "plain screen" — the landing, the study
desk, and every lesson beat are held to the same bar.

## Product Design Principles

- **Notebook, brought to life.** Warm paper, pressed ink, hairline rules, real
  paper-grain, and now **tactile depth** (letterpress, deboss, layered-paper shadows).
  Surface progress through notebook metaphors only: tally marks, stamped seals, index
  cards, and a vertical state-chain — never glass, generic gradients, donut charts, or
  colored KPI blocks.
- **Study desk home.** After sign-in, one scrollable page shows streak, milestones, and
  course path in that order — momentum (what's done) and direction (what's next) without
  leaving the notebook world.
- **Math is the interface.** `H`, `T`, `E0`, `1/2`, arrows, equations, and state labels
  do most of the visual work; the display type frames them with editorial weight.
- **Motion is cinematic and explanatory.** Animations map to mathematical events (flip,
  state transition, tile snap, substitution, convergence) and are choreographed on a
  shared timeline so they read as one intentional system.
- **Tactile depth by default.** Stamped, pressable elements (seals, equation tiles,
  buttons) carry real letterpress depth and respond to interaction. Depth is restrained
  and warm — paper, not plastic; never glass.
- **One thing per beat.** Each lesson screen has one prompt, one interaction, one
  feedback area, and one primary action.
- **Expressive, never a game.** Ambient motion is low-amplitude and pausable; there are
  no points-juice, no confetti, no urgency timers. The tone stays confident and terse.
- **Color is semantic.** Accent colors mark active states, coin outcomes, feedback, and
  predictions. They never decorate. Depth and type carry the drama; color carries
  meaning.

## Brand Voice & Typography

Type is the single biggest premium lever, and the loudest part of the bolder identity.

### Roles

| Role | Family | Use |
|------|--------|-----|
| **Display** | **Fraunces** (variable; `opsz`, `wght`, low `SOFT`/`WONK`) | Hero and section moments — oversized, optical, editorial. The bold voice. |
| **Body & UI** | IBM Plex Sans | Paragraphs, controls, captions, labels. |
| **Math / mono** | IBM Plex Mono | Equation tiles, state labels, coin tokens, numeric values. |
| **Editorial mid-tier** | IBM Plex Serif | Course wordmark and quieter editorial lines; the bridge between Plex and Fraunces. |
| **Typeset results** | **KaTeX / Computer Modern** | Final, *typeset* equations (results), not interactive tiles. Its Computer-Modern voice deliberately contrasts Plex — that authentic "typeset" feel is wanted. |

> **Fraunces vs. Newsreader.** Fraunces is the default for its optical-sizing axis and
> editorial character. If a quieter, more classic-literary voice is preferred, Newsreader
> is the drop-in alternative — swap `--font-display` only.

```css
--font-display: "Fraunces", "IBM Plex Serif", Georgia, "Times New Roman", serif;
--font-sans: "IBM Plex Sans", system-ui, "Segoe UI", Roboto, sans-serif;
--font-mono: "IBM Plex Mono", ui-monospace, "SF Mono", Consolas, monospace;
--font-serif: "IBM Plex Serif", Georgia, "Times New Roman", serif;
```

### Variable fonts, loading, and no-shift fallbacks

- **Self-host variable builds** where they exist (`@fontsource-variable/ibm-plex-sans`,
  `@fontsource-variable/ibm-plex-mono`, Fraunces variable). IBM Plex Serif ships largely
  static — load two static weights. Protect the under-2-second lesson budget.
- **Metric-adjusted fallbacks** to eliminate layout shift on swap. Generate
  `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` with
  Capsize or Fontaine and register a matched fallback face per family.
- **`font-display: optional`** for body where a first-paint fallback is acceptable;
  `swap` *with* metric overrides elsewhere. Subset Fraunces to the display character set.

### Type craft (the details that read as premium)

- **Optical sizing.** Fraunces has a real `opsz` axis — let display sizes use it
  (`font-optical-sizing: auto`). Note: IBM Plex has **no** `opsz` axis, so this is a
  no-op for Plex; don't rely on it there.
- **Numerals.** `font-variant-numeric: tabular-nums` for any aligned/animated figures
  (sim stats, ledgers, streak counts); old-style figures for serif prose. Beautiful
  aligned numbers are our premium "data" treatment — they replace colored KPI tiles.
- **Slashed zero / stylistic sets.** Enable IBM Plex Mono's slashed-zero and relevant
  `ss0x`/`cv0x` sets via `font-feature-settings` for a technical, mathematical voice.
- **Line quality.** `text-wrap: balance` on headings, `text-wrap: pretty` on body to
  kill orphans (progressive enhancement).
- **Fluid scale.** `clamp()`-based sizes so display moments scale smoothly between mobile
  and laptop instead of stepping at one breakpoint.

### Type hierarchy (mobile → laptop)

- **Display (hero):** `clamp(2.5rem, 6vw, 5rem)`, Fraunces, `opsz` high, 500–600, tight
  tracking (`-0.02em`). The cinematic moment; one per screen at most.
- **Display (section):** `clamp(1.75rem, 4vw, 2.75rem)`, Fraunces, 500.
- **H1:** 24/30 → 32/40, 600 (Plex Sans or Fraunces small).
- **H2:** 19/26 → 24/32, 600.
- **Body:** 16/24 → 19/30, 400.
- **Caption:** 13/18 → 15/22.
- **Label:** 12/16 → 13/18, 500, slight tracking.
- **Math tile:** 18 → 22, IBM Plex Mono 500.

## Color & Ink

The palette is **kept** — bolder comes from depth and type, not new hues. Deepen via
contrast and pressed-ink depth, not saturation. Author tints in `oklch()` for
perceptual evenness (the token pipeline emits both `oklch` and hex fallbacks).

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

Heads and tails must always be paired with the letters `H` and `T`. Never rely on color
alone.

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

> **Token drift watch.** Historically `--mark-wash` was mirrored at `0.30` in the Konva
> theme vs `0.22` in CSS. The single token pipeline (see Animation & Token Architecture)
> removes this class of drift — all surfaces consume one source.

- **MVP is light-only.** Dark mode is post-MVP. The bolder direction is achieved within
  the warm light palette; we did **not** adopt a dark "lab" surface.

## Depth, Letterpress & Texture

This is the new tactile layer. The goal: surfaces feel **pressed into paper**, not
floated on glass.

### Tactile depth language

- **Deboss / letterpress** for stamped, identity-bearing elements (milestone seals,
  equation tiles at rest, the recap stamp): a faint inset shadow plus a 1px top edge
  highlight so the element reads as pressed into the sheet with ink catching the rim.
- **Layered-paper shadows** for raised cards (index cards, detail panels): soft, warm,
  low-contrast — paper lifting slightly off paper, never a hard SaaS drop shadow.
- **Multiply ink.** Ink-colored marks over paper use `mix-blend-mode: multiply` so they
  read as absorbed into the fiber rather than painted on top.
- **Press response.** Pressable elements deepen on `:active` (deboss increases, element
  scales ~0.98) — a physical "press" that pairs with the motion micro-interactions.

```css
/* Depth + press tokens (emitted by the token pipeline to CSS + JS) */
--paper-shadow-1: 0 1px 2px rgba(27, 34, 48, 0.06);                  /* = legacy --e1 */
--paper-shadow-2: 0 6px 16px rgba(27, 34, 48, 0.12);                 /* = legacy --e2 */
--paper-shadow-3: 0 16px 40px rgba(27, 34, 48, 0.14);               /* cinematic cards (sparingly) */
--press-deboss: inset 0 1px 2px rgba(27, 34, 48, 0.14);             /* pressed-into-paper */
--edge-highlight: 0 1px 0 rgba(255, 255, 255, 0.55);               /* letterpress rim light */
--letterpress-ink: 0 1px 0 rgba(255, 255, 255, 0.5);               /* text-shadow for pressed ink */
```

`--e1` / `--e2` remain as aliases for `--paper-shadow-1/2` so existing components keep
working during migration.

### Paper grain

Default page background stays **paper-grain**: a barely-perceptible grayscale fiber/noise
via SVG `feTurbulence` on `--paper-0`, rendered **once and static** (never animated —
that's expensive), low opacity, `multiply`. Warmth and tactility, not decoration.

### Hairlines (device-pixel)

True hairlines are a premium tell. `1px` borders blur on HiDPI; render real
device-pixel hairlines:

```css
.hairline { border: 1px solid var(--rule); }
@media (resolution >= 2dppx) {
  .hairline { border-width: 0.5px; }
}
```

In Konva, set `pixelRatio` to the device ratio and use 1px strokes so canvas hairlines
match the DOM. Prefer ruled rows over zebra-striping or shadows for the ledger look.

### Edge-confined grid policy

Full graph-paper grids appear **only** inside Konva canvas and chart regions where
coordinates matter (`--rule-faint`). Never use a repeating grid as the page background.

### Background texture alternates

Documented menu — use only if paper-grain is rejected in review:

1. **Dot grid** — faint dots at intersections; ~80% less ink than a full grid.
2. **Plain warm paper** — no markings; cleanest, loses notebook cue.
3. **Margin rule** — single faint vertical margin line like a composition notebook.
4. **Faded grid** — full grid masked to fade at edges and behind text.
5. **Registration ticks** — sparse `+` marks at wide intervals.
6. **Single axis** — one faint horizontal and vertical axis pair.
7. **Ruled lines** — faint horizontal lines only (legal pad).
8. **Isometric grid** — sparse triangular grid; more distinctive, riskier.

## Motion: Choreography & Timeline

Motion is now a first-class part of the identity. It is **cinematic and explanatory**,
choreographed on a shared clock, and bounded by hard Restraint Rails.

### Philosophy

- Every signature animation maps to a mathematical event and is **choreographed**, not
  merely transitioned. Independent animators (Motion spring, Konva tween, Konva
  animation, GSAP timeline) must share one timeline so they read as a single beat.
- Ambient motion exists to make the world feel **alive**, never to entertain. It is
  low-amplitude, slow, and pauses when not needed.

### Timeline tokens (one source of truth)

All durations, easings, and springs come from one token source, emitted to CSS, JS
(Motion/GSAP), and Konva by the pipeline — so nothing drifts and no magic numbers live in
components.

```css
--dur-micro: 120ms;
--dur-base: 200ms;
--dur-slow: 360ms;
--dur-tell: 600ms;
--ease-out: cubic-bezier(.2, .7, .2, 1);
--ease-spring: cubic-bezier(.2, 1.2, .3, 1);
--ease-inout: cubic-bezier(.5, 0, .2, 1);

/* Master clocks for choreographed sequences */
--flip-beat: 520ms;        /* one synchronized flip (coin + node + edge) */
--stamp-beat: 480ms;       /* milestone seal press + ink bloom */
```

The flip clock defines phase offsets consumed by all three animators: coin appears
(0ms) → node pulses (~80ms) → edge "packet" travels (~120ms→`--flip-beat`). The Konva
imperative layer **imports** these tokens (no hardcoded `0.12`/`0.2`/`14`/`600`).

### Signature choreographies (the showpieces)

- **The synchronized flip.** Coin token springs in, the active state node pulses, and a
  single **one-shot "energy packet" travels the active edge** (∅→H→HH) — all on
  `--flip-beat`. This replaces the old looping dash marquee; the edge animates *once* per
  flip so it reads as "the flip traveled the machine." The product's defining moment.
- **Equation tile lift & press.** Tiles are draggable: lift with `--paper-shadow-2`,
  ~1.04 scale and a slight rotation, then **press into the slot** with a spring settle
  and a deboss flash. Tap-to-place remains the equivalent, tested path; drag is the
  enhancement layer.
- **Wax-seal stamp.** On lesson completion the milestone seal presses down
  (`--stamp-beat`): scale-down impact + a brief ink bloom + the deboss settling — ink
  pressed onto paper.
- **Spine traversal.** On entering a lesson, the course-spine focus travels to the node
  before the View Transition into the lesson.
- **Convergence.** The empirical simulation line animates toward the theory line; the
  prediction marker resolves against it.
- **Streak stroke-on.** A new tally mark draws with a stroke-dash animation on increment
  (previously missing).

### Ambient living motifs

Restrained, continuous motion that makes the world breathe:

- **Breathing state machine** on the landing hero and Home focused-preview — nodes pulse
  gently through a flip sequence at low amplitude.
- **Living paper** — an extremely subtle, slow movement reserved for hero surfaces only;
  the page grain itself stays static.

**Ambient caps (mandatory):** amplitude small enough to be felt, not watched; long, slow
periods; **pause when the tab is hidden, the element is offscreen, or the user is idle**;
fully removed under reduced motion. Ambient motion must never compete with the prompt or
the primary action.

### Page & state transitions

Use the **native View Transitions API** (0 KB, progressive enhancement) for
home↔lesson, beat↔beat, and list↔detail morphs, gated by
`if (document.startViewTransition)`. The hand-rolled SPA router triggers transitions; the
spine→lesson and recap→home morphs are the marquee cases.

### Display-type reveals

Oversized Fraunces headlines reveal with **GSAP SplitText** (per-line/word), driven off
the shared timeline. Reserve GSAP for these reveals and a few hero/recap timelines; do
not reimplement basic transitions GSAP-or-Motion would duplicate.

### Micro-interactions

Every interactive target has hover (subtle lift or `--quill-tint`), press
(deboss + ~0.98 scale), and a visible `:focus-visible` ring (or ink underline). This
includes the primary lesson buttons (previously hover-only), equation tiles, state-tap
chips, graph-node overlays, and seals.

### Restraint Rails & performance

The discipline that keeps "alive" from becoming "busy" or slow:

- **Motion budget.** At most one cinematic moment per screen; ambient is secondary and
  pausable; no confetti, no points-juice, no urgency timers.
- **Compositor-only.** Animate `transform`/`opacity`. Never animate layout properties or
  run heavy filters in loops; grain is static.
- **No per-frame React state.** Canvas animation stays imperative (Konva
  tween/animation). Fix the theory-vs-sim sweep to batch to ≤30fps or tween the Konva
  line imperatively rather than `setState` per rAF frame.
- **No Firestore during animation.** Persist on commit/debounce only.
- **Reduced-motion parity.** Every signature has a reduced-motion equivalent (final
  frame / fade / instant state). Keep the project's own `useReducedMotion` (live-updating)
  and `<MotionConfig reducedMotion="user">`; the global `* { …0.01ms !important }` rule
  remains the backstop. GSAP and View Transitions must also branch on reduced motion.
- **Budget.** Under-2-second first interaction. Lazy-load GSAP, KaTeX, and lesson
  previews after first paint; code-split routes (the entry bundle must not ship every
  page + Konva + Firebase eagerly).

## Animation & Token Architecture

The implementation foundation that makes the above sustainable and uniform.

### Toolset matrix (right tool per layer)

| Layer | Tool | Use |
|-------|------|-----|
| DOM micro-interactions, springs, presence, layout | **`motion`** (`LazyMotion` + `m`) | Coins, tiles, beat enter/exit, hover/press, `layoutId`. |
| Cinematic DOM timelines + big-type reveals | **GSAP** (free; `@gsap/react`) | SplitText headline reveals; hero/recap multi-step sequences. |
| Canvas signatures | **Konva** (`Konva.Tween` / `Konva.Animation`) | State graph, sim chart, spine, bias chart. `'use no memo'` stays on all Konva mounts (React Compiler). |
| Routing / state morphs | **Native View Transitions** (+ scroll-driven where apt) | Page and beat transitions; 0 KB, feature-gated. |

### Token pipeline (single source)

- **Style Dictionary** is the single source of truth. It emits: CSS custom properties
  (`tokens.css`), the Konva JS theme (resolved values), and the Motion/GSAP timeline
  tokens — replacing the hand-synced `tokens.css` / `konva/theme.ts` / `motion/tokens.ts`
  triad and the class of drift it caused.
- Author tokens in DTCG format; emit `oklch` with hex fallback; one place to change a
  hue, a duration, or a spring.

### CSS architecture

- **Cascade layers** (`@layer tokens, base, surface, components, utilities`) for
  predictable ordering.
- **`@property`** for typed, animatable custom properties (e.g., animatable color/length
  tokens; prevents invalid values).
- **CSS Modules per surface** — split the monolithic `app.css` (~3,500 lines) by surface
  so a change to one primitive can't regress unrelated screens. Tokens stay global; layout
  and component rules are scoped.

### Accessible interactive components

- **Radix Primitives** for dialog, dropdown menu, popover, tooltip, tabs, and toast —
  styled entirely with our tokens via `data-*` attributes (no imposed look). (Base UI is
  an acceptable equivalent if standardizing differently.)
- **React Aria hooks** (`useSlider`, `useNumberField`) for the bespoke number-line slider
  and any numeric inputs — best-in-class behavior while we keep 100% of the visuals.
- These replace the native `<input range>` and ad-hoc tooltip/menu CSS, closing
  keyboard/focus/ARIA gaps that are the invisible half of "premium."

### Math typesetting

- **KaTeX** for typeset final equations (results, recap), rendered into a small memoized
  component (call `katex.renderToString`, lazy-loaded). Interactive equation **tiles**
  stay IBM Plex Mono (they are being manipulated, not typeset). Temml→MathML at build
  time is an acceptable zero-client-JS alternative; avoid MathJax (heavy).

## Responsive Strategy

Mobile-first. Laptop overrides at one breakpoint; display type scales fluidly across it.

### Breakpoints

```css
--bp-laptop: 768px;
--page-max: 960px;
```

### Page model

- **Mobile (`<768px`):** content uses the full viewport width with standard side padding.
- **Laptop (`>=768px`):** content sits in a single centered column, max-width 900–960px
  (`--page-max`). The paper-grain background fills the entire viewport seamlessly — no
  visible page edge, no desk tone outside the column.
- **Bars:** top bar and sticky action bar align to the same centered column on laptop.

### Use the width (laptop)

- Canvas and chart regions expand to full column width and grow taller (see Vertical
  fill).
- Side-by-side comparisons stay side-by-side; do not stack at laptop.
- Equation tile trays spread horizontally.

## Spacing, Radius, and Elevation

Use a 4px base and 8px rhythm:

```css
--s1: 4px;  --s2: 8px;  --s3: 12px; --s4: 16px;
--s5: 24px; --s6: 32px; --s7: 48px; --s8: 64px;
```

On laptop, bump vertical spacing between major regions one step (e.g. `--s5` → `--s6`).

### Vertical fill (laptop)

Canvas and interaction regions use a min-height of ~50–60vh and a larger internal scale
so interactive elements grow taller within the wider page column.

### Radius

```css
--r-xs: 4px; --r-sm: 6px; --r-md: 8px; --r-lg: 12px; --r-pill: 999px;
```

Elevation is now **tactile depth** (see Depth, Letterpress & Texture), not flat-by-
default. Use deboss/letterpress for pressed elements, layered-paper shadows for raised
cards, and reserve `--paper-shadow-3` for the rare cinematic surface.

## App Shell

Two shells: **Home** (signed-in study desk) and **Lesson** (in-lesson beats). Both use
the same centered page column and paper-grain background, and morph into each other via
View Transitions.

### Home Top Bar

Signed-in home only — no back control, no beat rail.

- **Left:** course wordmark (IBM Plex Serif at label scale, `--ink`).
- **Right:** profile control (display-name initial in an ink ring, or settings glyph);
  opens display-name edit and sign-out.

Keep the bar lean: one hairline `--rule` bottom border, no streak here. On laptop, align
to the centered column.

### Lesson Top Bar

In-lesson only:

- Back control on the left (returns to home, via View Transition).
- Lesson short title and a horizontally scrollable per-beat progress rail in the center.
- Compact streak tally chip on the right (same tally component as home, smaller).

**Per-beat progress rail:**

- One segment per lesson beat; horizontally scrollable with no visible scrollbar;
  upcoming beats peek at the right edge.
- Mobile: ~4 beats visible. Laptop: ~6 beats visible (preserve the peek + scroll; do not
  stretch segments edge-to-edge).
- Each segment shows complete / current / upcoming state.
- Beats are color-grouped by phase tint (Bet, Explore, Model, Prove); no phase label.
- Phase mapping: Bet = 1–2, Explore = 3, Model = 4–7, Prove = 8–9 + 11.
- Extension bias sandbox (beat 10) is an off-rail "Try bias" chip and never appears in
  the rail.

### Sticky Action Bar

Every lesson beat has a sticky bottom action bar with one primary action (`Flip`,
`Check`, `Lock prediction`, `Continue`, `Run simulation`). Secondary actions (`Hint`,
`Show explanation`) are visually quieter. On laptop, align to the centered column.

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

`Hint` appears as a quiet secondary action only on `Check` beats (4, 5). On the
`lesson-longer-patterns` transfer lesson, the `failure-edge` and `equation-tiles` beats
cap the hint ladder at level 2 (the level-3 reveal is suppressed).

## Laptop Interaction

- Hover affordances on buttons, equation tiles, and graph nodes: subtle lift
  (`--paper-shadow-1`) or `--quill-tint` fill; pointer cursor on interactive targets.
- Press states deboss; drag is mouse-driven on laptop with tap-to-place as an equivalent
  path.
- Keyboard focus rules unchanged; hover and press never replace visible focus rings.

## Screen States

Every data-backed screen must define non-happy-path states in the notebook identity:
hairline skeletons over spinners, quiet ink copy, no SaaS toasts with drop shadows.

- **Loading (content fetch):** home and lesson beats show a hairline skeleton of the
  layout, not a spinner. Home skeletons the habit panel, seal gallery, and index-card
  rows. Target the under-2-second first-interaction budget.
- **Restoring work:** while hydrating a snapshot, show a brief "Restoring your work…"
  line in the prompt strip; reveal the interaction once committed state is applied.
- **Content / auth error:** inline ink message with a single `Retry` ghost action; never
  a blank screen. Auth field errors follow the `Inputs` spec (rule turns `--wrong`).
- **Offline:** a persistent quiet banner — "Saved locally — syncs when you're back
  online." Interactions stay fully usable; writes are fire-and-forget.
- **Failed write:** non-blocking; do not interrupt the learner. If a restore fails
  entirely, offer "Start this lesson over" with the local mirror as the first fallback.
- **Empty / not-yet-started:** home shows the full study-desk layout; zero-day streak,
  one ghost seal, lesson 1 focused; no empty-state illustration.

> These states (offline banner, "Restoring…", `Retry` ghost, failed-write recovery) are
> part of the premium bar — they are currently under-implemented and must be built.

## Component Specs

### Buttons

- Height 48px; radius `--r-md`; font IBM Plex Sans 600.
- Primary: `--quill` fill, `--paper-0` text. Secondary: paper fill, `1.5px --ink` border.
  Ghost: `--quill-strong` text, no border. Disabled: `--paper-2` fill, `--graphite-soft`.
- **Micro-interaction:** hover lifts (`--paper-shadow-1`); `:active` debosses + scales
  ~0.98 (this applies to the primary lesson buttons too, not just landing/auth).
- Focus ring: `2px --quill`, offset 2px.

### Inputs

Notebook-line inputs for auth and display name:

- Label above the field; only a bottom rule by default.
- Focus thickens the rule and turns it `--quill`.
- **Error state:** the bottom rule turns `--wrong` and `--wrong-text` helper copy shows
  (field-level treatment, not text-only).

### Equation Tiles (signature)

- Min hit area 44×44; face `--paper-0`; border `1px --rule`; radius `--r-sm`; font IBM
  Plex Mono 500; at rest a faint deboss.
- **Drag/lift:** `--paper-shadow-2`, scale 1.04, slight rotation.
- **Snap:** spring settle into slot + deboss flash. Tap-to-place is the equivalent,
  tested path.
- Correct: `--correct-tint` flash + `--correct` border. Wrong: short horizontal shake +
  `--wrong` border (reduced motion → color only).

Tile category markers: state variable (`E0`,`E1`) `--quill`; probability (`1/2`,`p`,`1-p`)
`--heads`; constant (`0`,`1`) `--graphite`; operator (`+`,`=`,`-`) `--ink`.

### Equation Slots

- Dashed rectangle on the equation baseline. Empty: `1.5px dashed --graphite-soft`.
  Drag-over: `1.5px dashed --quill` + `--quill-tint`. Filled: solid border, paper fill,
  faint deboss.

### Prediction Slider

Number-line styling, built on React Aria `useSlider`:

- Mono tick labels; thumb is a quill-blue ink dot; locked prediction leaves a `--mark`
  marker that later appears in the theory-vs-simulation chart.

### Feedback Strip

Inline above the sticky action bar, never a modal.

- Correct: `--correct` rule + short explanatory sentence.
- Incorrect L1: conceptual nudge. L2: relevant state edge / slot glows `--mark-wash`.
  L3: reveal the correct tile/step, then mark `needsReview`.

### Tooltips, Menus, Dialogs

Built on Radix Primitives, dressed in tokens: paper fill, hairline border, layered-paper
shadow; quiet, no SaaS chrome. No drop-shadow toasts — use the inline/margin-note status
instead.

### Streak

Tally marks, not a flame (keeps the habit loop in the notebook identity).

- Count as pen tally strokes plus label, e.g. `12-day streak`; every fifth day is the
  diagonal slash.
- **On increment, draw the new stroke with a stroke-dash animation** (reduced motion:
  appears instantly).
- Home habit panel is the primary surface (tally at display scale, caption below,
  optional one-line status). Lesson top bar carries the compact variant.

### Milestones (signature)

Stamped wax-seal, not a badge.

- Circular ink-ring seal, 56px mobile / 64px laptop, with a **letterpress deboss** so it
  reads as pressed into the page; `--mark` accent glyph (e.g. `HH ≠ HT`, `Σ`, `✓×3`) in
  IBM Plex Mono.
- **Recap stamp (primary earn):** the seal presses down on lesson completion
  (`--stamp-beat`: impact + ink bloom + deboss settle).
- **Home fade-in (secondary, quiet):** the first time Home loads after a new earn, the
  matching gallery seal inks from ghost to inked once, then stays static.
- Gallery shows **all** course milestones in fixed lesson order from the first visit
  (earned = full ink ring + `--mark` glyph; unearned = ghost: dashed `--graphite-soft`
  ring, glyph at 30%). Reduced motion: fade only.

### Completion moment

The lesson-complete takeover stays full-screen (done-note text + earned seal + sticky
"Back to course path", scroll-to-top + focus the CTA). **Replace the confetti** with the
on-brand cinematic: the wax-seal **ink stamp** + a restrained settle. No colored paper
bits. (Keep the "Lesson complete" text node so existing e2e selectors hold.)

## Auth-First Onboarding

Flow: Landing → Sign in / create account → Confirm display name → Welcome (offer the
optional introduction, L0) → Home → Start or resume.

Landing hero:

- Headline (Fraunces display, SplitText reveal): "Why does `HH` take longer to appear
  than `HT`?"
- Subline: "State thinking for quant interviews."
- A live, **breathing** 3-node state machine pulsing through a flip sequence.
- Primary CTA `Create account`; secondary `Sign in`. Tone confident and terse — no
  generic marketing copy, no exaggerated excitement.

Laptop: centered in the column; display-scale headline + larger live state-machine
preview.

## Signed-in Home (Study Desk)

A single vertically scrolling page — dashboard-lite reframed as a notebook spread. Three
regions, top to bottom: habit panel, milestone seal gallery, course path. No tabs, no
sidebar, no metric grid. Regions reveal with a quiet stagger on load (reduced motion:
appear at once).

```text
[home top bar: wordmark / profile]
[habit panel: streak tally + one-line next-action status]
[milestone seal gallery: earned + ghost seals]
[section label: "Course"]
[course path: vertical graph-node chain]
[section label: "On the roadmap"]
[roadmap node stubs]
```

On laptop, all regions align to the centered column; vertical rhythm `--s6` mobile,
`--s7` laptop.

### Habit panel

- First content below the top bar; establishes momentum before the path.
- Primary streak tally + one derived **status line** for the recommended action
  (e.g. "Resume Pattern Hitting Times · beat 5"). **No button** here — the status line is
  text; the focused path node's detail panel holds the sole CTA.
- Background `--paper-1`, single hairline `--rule` border — a pressed panel, not a
  floating SaaS card.

### Recommended-action priority

Habit-panel status and the course path must agree, in order: **Resume** (any in-progress
snapshot wins) → **Review** (most recent `needsReview`, only when nothing is in progress)
→ **Start** (next unlocked) → **Replay** (all mastered). The matching node gets focus
emphasis (quill ring; pinned detail panel). A `needsReview` flag never steals focus from
an active Resume — it shows as a `--mark` ring + hover detail + an optional quiet note.

### Home loading & empty states

- **Loading:** skeleton the three regions (tally placeholders, circular seal ghosts,
  spine + node dots) — no spinner.
- **First visit:** `0-day streak`; all milestone ghosts; L1 focused with detail open;
  roadmap stubs below.

## Course Path (Graph Nodes)

The third region of Home. Lessons are **graph nodes** on a vertical spine — not index
cards — reusing the in-lesson Konva graph vocabulary. Rendering: a single Konva `<Stage>`
draws the spine + a parallel transparent DOM-button overlay carries focus / keyboard /
44px / `aria`; detail panels are DOM (see `docs/adr/0001-konva-course-path-spine.md`).
Entering a lesson plays the spine traversal, then a View Transition into the lesson.

### Spine and node layout

- Section label "Course" above the chain; a central `--rule-faint` vertical rule connects
  node dots.
- Each lesson is one path node: a circle on the spine + a mono lesson glyph.
- **At rest (non-focused):** glyph inside the dot only — no number, no title.
- **Detail (hover / focus on non-focused):** title (H2), one-line hook, status — no CTA.
- **Focused node:** detail panel pinned open on load (title, hook, status, sole primary
  CTA) + quill ring + `--mark-wash` beam + a small looping live preview.

### Per-lesson glyphs (fixed)

| L | Glyph | Lesson |
|---|-------|--------|
| 1 | `HH` | Pattern Hitting Times |
| 2 | `A≻B` | Penney's Game |
| 3 | `i/N` | Gambler's Ruin |
| 4 | `H` | States & Streaks |
| 5 | `THH` | Longer Patterns & Overlap |
| 6 | `Σ2^L` | The Overlap Shortcut |

Detail panel: right of the node on laptop. Mobile diverges (see
`docs/home-study-desk.md` §2.4): the focused node becomes a full-width DOM card (glyph +
title + hook + live preview + CTA) atop a compact Konva rail of the remaining glyph-only
nodes.

### Focused detail panel — live preview

The focused node's detail panel hosts a small looping live preview of that lesson's
signature interaction (the dot keeps its static glyph; motion lives in the panel) — the
single cinematic Home moment, mirroring the landing motif. Non-focused panels show no
preview.

| L | Glyph | Live preview |
|---|-------|--------------|
| 1 | `HH` | 3-node state graph pulsing through a flip sequence (reuse `StateGraph`) |
| 2 | `A≻B` | Two race lanes ticking; tally drifting toward 7:1 |
| 3 | `i/N` | A token random-walking between two walls on a number line |
| 4 | `H` | 2-node graph flipping until the first `H` |
| 5 | `THH` | 4-node chain advancing then resetting on a near-miss |
| 6 | `Σ2^L` | `2^L` chips dropping into a running sum landing on 6 |

- **Reduced motion:** render the representative static frame.
- **Performance:** previews use the imperative-layer rule (no per-frame React state);
  lazy-load after the spine and CTA paint. Only L1 is built today — ship the L1 preview
  first; L2–L6 previews are authored as each lesson is built; a focused-but-unbuilt
  lesson shows a static glyph placeholder (no fabricated animation).

### Node states

- **Focused:** `--quill` ring, soft pulse (respect reduced motion); detail pinned open;
  CTA in panel; beam to panel.
- **Available (not focused):** ink ring; detail on hover/focus; no CTA.
- **Completed (non-focused):** filled quill dot (glyph in `--paper-0`/`--mark`); slight
  opacity recede until hover.
- **needsReview:** completed styling + `--mark` ring; detail shows "Review recommended";
  takes focus priority over Start next.
- **Locked:** faint `--rule-faint` ring, lock glyph, glyph at 30%; detail shows title +
  hook + "Locked" only.

### Interaction & roadmap stubs

- Laptop: `mouseenter`/`focus` opens detail; `mouseleave`/`blur` closes unless focused.
- Mobile/touch: first tap opens detail; second tap on the focused CTA enters; tap
  elsewhere closes non-focused panels.
- Keyboard: arrow keys move along spine; `Enter` opens / activates the focused CTA.
- Min hit target 44px per dot.
- Roadmap stubs (below "On the roadmap"): smaller graph nodes, title + hook on hover only,
  not tappable.

## Flagship Lesson Layout

Every beat — and every lesson — is held to the premium bar. Beat skeleton:

```text
[top bar: back / title + beat rail / streak]
[prompt strip: one question or instruction]
[Konva canvas or interaction region]
[controls, if needed]
[sticky action bar: primary action + hint]
```

On laptop, all regions align to the centered column; canvas/chart regions expand to full
width and use the laptop min-height (~50–60vh) where applicable.

Screen-by-screen direction is unchanged in structure (open the bet → compare → simulate &
watch the state machine → find the failure edge → build equations → refine prediction →
guided substitution → theory vs simulation → discover overlap → bias sandbox → review),
now executed with the choreographed flip, tactile tiles, and the cinematic recap stamp.
The **synchronized flip** in beat 3 is the signature demo moment.

## Konva Visual Rules

On laptop, scale canvases and charts to full column width. Use edge-confined grid
(`--rule-faint`) inside canvas/chart regions only.

### State Graph

- Nodes are circles with matched-prefix labels (`∅`, `H`, `HH`). Active node `--quill`
  stroke + soft pulse; absorbing node `--correct` double ring. `H` edges `--heads`, `T`
  edges `--tails`. Self-loops arc above; reset edges curve below.
- **Active edge animates as a one-shot traveling packet on `--flip-beat`** (not a
  perpetual marquee). Laptop: scale to fill width; min-height ~50–60vh where the machine
  is centered.

### Tile Layer

- Static shapes on a static layer; dragged tiles on an active drag layer. Commit React
  state on tap/place or drag end, not every drag frame. No Firestore during animation.

### Simulation Chart

- Theory line solid ink; empirical line quill blue; prediction marker dashed
  mark/highlighter. Labels + dash patterns so it's readable without color.
- **Animate convergence imperatively** (Konva tween or ≤30fps batch) — not `setState` per
  rAF frame. Laptop: fill width and grow taller.

### Engine & rendering constraints

- Timeline tokens are **imported** by the imperative layer (no magic durations).
- Set Konva `pixelRatio` to the device ratio; 1px strokes for true hairlines.
- All Konva mounts keep `'use no memo'` (React Compiler).

## Accessibility

- All interactive targets ≥44px. Never rely on color alone.
- Equation tile placement supports a non-drag path (select tile, then slot).
- Canvas interactions need DOM equivalents or `aria-live` summaries for flips, state
  changes, and feedback.
- Keyboard focus must be visible (ring or ink underline). Interactive components use
  Radix / React Aria so roles, focus order, and keyboard behavior are correct.
- **Reduced-motion parity:** every signature, ambient motif, GSAP reveal, and View
  Transition has a reduced-motion equivalent; the lesson must be fully completable.
- Test at 200% text scaling without clipping core actions.

## Performance Budget

- **Under-2-second first interaction.** Code-split routes; do not eagerly import every
  page + Konva + Firebase. Add error boundaries.
- **Lazy-load** GSAP, KaTeX, and lesson previews after first paint.
- **Fonts:** self-hosted variable builds, subset (especially Fraunces display), metric-
  adjusted fallbacks to prevent layout shift.
- **Motion:** compositor-only properties; static grain; ambient pauses offscreen/idle;
  no per-frame React state during canvas animation.
- **Protect polish with Playwright visual-regression** snapshots on key surfaces (incl.
  the reduced-motion project) so the premium bar can't silently regress.

## Implementation Notes

- **Single token source:** Style Dictionary emits CSS vars + resolved Konva theme +
  Motion/GSAP timeline tokens. No literal hex/duration in components; no hand-synced
  triad. (`--mark-wash` and friends live in exactly one place.)
- **CSS:** cascade layers + `@property`; split `app.css` into CSS Modules per surface;
  device-pixel hairlines.
- **Type:** self-host variable IBM Plex + Fraunces; metric fallbacks; feature settings;
  fluid `clamp` scale.
- **Stack:** keep `motion`; add GSAP (SplitText + hero/recap timelines); native View
  Transitions for routing; Radix Primitives + React Aria hooks for interactive
  components; KaTeX for typeset results. Konva remains the hero canvas.
- **MVP is light-only.** Dark mode is post-MVP.
- **The signature demo moment is the first synchronized flip:** coin token, node pulse,
  and the one-shot edge packet must feel exact, on one clock.

### Suggested migration phasing

> Hand-off execution plan (sub-agent team, waves, file ownership, DoD gates):
> `docs/build-brief-living-notebook.md`.

0. **Foundations:** Style Dictionary single-source tokens; cascade layers + `@property`;
   variable fonts + Fraunces + metric fallbacks; code-split routes + error boundaries.
1. **Depth & type pass:** letterpress/deboss tokens applied to seals, tiles, buttons,
   cards; device-pixel hairlines; display tier on hero/section moments.
2. **Motion choreography:** unified timeline tokens; one-shot flip packet + master flip
   clock; streak stroke-on; equation-tile drag layer; replace confetti with the ink
   stamp; View Transitions for home↔lesson and beat↔beat; GSAP SplitText reveals; ambient
   breathing motifs with caps.
3. **Components & states:** migrate slider/number inputs to React Aria, menus/tooltips/
   dialogs to Radix; build offline/restoring/retry/failed-write states; add KaTeX typeset
   results; Playwright visual-regression ratchet.
