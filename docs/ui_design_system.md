# UI Design System: Clean Mathematical Notebook

## Design North Star

The interface should feel like a polished mathematical notebook come alive. The product is serious quant-interview prep, not a game and not a SaaS analytics product. The signed-in **home** is a **study desk spread** — streak tally, earned milestone seals, and the course path laid out on one page — not a grid of KPI tiles or colored metric blocks. The "wow" comes from clarity, tactile interaction, and motion that explains the math: a flip moves through the state machine, a tile snaps into an equation, and simulation converges toward theory.

## Product Design Principles

- **Notebook, not SaaS dashboard.** Use warm paper, ink, hairline rules, and subtle paper-grain texture. The home may surface habit and progress, but only through notebook metaphors: tally marks, stamped seals, index cards, and a vertical state-chain — never glass effects, generic gradients, donut charts, or colored KPI blocks.
- **Study desk home.** After sign-in, one scrollable page shows streak, milestones, and course path in that order. The learner should see momentum (what they have done) and direction (what to do next) without leaving the notebook world.
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

The app has two shells: **Home** (signed-in study desk) and **Lesson** (in-lesson beats). Both use the same centered page column and paper-grain background.

### Home Top Bar

Signed-in home only — no back control, no beat rail.

- **Left:** course wordmark, e.g. "Pattern Hitting Times" in IBM Plex Serif at label scale, `--ink`.
- **Right:** profile control (display-name initial in an ink ring, or a settings glyph). Opens display-name edit and sign-out.

Keep the bar lean: one hairline `--rule` bottom border, no streak here (streak lives in the habit panel below). On laptop, align to the centered page column.

### Lesson Top Bar

In-lesson only:

- Back control on the left (returns to home).
- Lesson short title and a horizontally scrollable per-beat progress rail in the center.
- Compact streak tally chip on the right (same tally component as home, smaller).

Use a lean bar, not a SaaS header. On laptop, the bar aligns to the centered page column.

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

- **Loading (content fetch):** home and lesson beats show a hairline skeleton of the layout, not a spinner. Home skeletons the habit panel, seal gallery, and index-card rows. Target is the under-2-second first-interaction budget.
- **Restoring work:** while hydrating a snapshot, show a brief "Restoring your work…" line in the prompt strip; reveal the interaction once committed state is applied.
- **Content / auth error:** inline ink message with a single `Retry` ghost action; never a blank screen. Auth field errors follow the `Inputs` spec.
- **Offline:** a persistent quiet banner, "Saved locally — syncs when you're back online." Interactions stay fully usable; writes are fire-and-forget.
- **Failed write:** non-blocking; do not interrupt the learner. If a restore fails entirely, offer "Start this lesson over" with the local mirror as the first fallback.
- **Empty / not-yet-started:** home shows the full study-desk layout per Signed-in Home; zero-day streak, one ghost seal, lesson 1 focused; no empty-state illustration.

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

**Home habit panel (primary streak surface):**

- Full-width `--paper-1` panel with `1px --rule` border and `--r-md` radius.
- Tally marks at **display scale** (largest type on the home page).
- Caption below: `{n}-day streak` in label style, `--graphite`.
- Optional one-line status in `--graphite-soft`, e.g. "Resume Pattern Hitting Times · beat 5" or "Start States & Streaks" — derived from the recommended next action, not a separate widget.
- If the learner has not qualified today: quiet `--mark` ink note, "Practice today to extend your streak." No countdown timers or red urgency.

**Lesson top-bar chip (compact):**

- Same tally component, smaller; tap opens home (optional) or is display-only.

### Milestones

Use a stamped seal, not a badge.

- Circular ink-ring seal, 56px mobile / 64px laptop.
- `--mark` accent glyph such as `HH ≠ HT`, `Σ`, or `✓×3` in IBM Plex Mono.
- Reduced motion: fade in only (applies to both moments below).

**Two earn moments (recap is primary):**

1. **Recap beat (primary):** on lesson completion, the seal **presses down with a short stamp animation** — the conclusive earn moment.
2. **Home return (secondary, quiet):** the **first** time Home loads after a new earn, the matching gallery seal does a quiet **ink fade-in** from ghost to inked (not a full stamp), then stays static on subsequent visits. Track a seen/unseen flag so the fade plays once. No re-staged celebration; the recap stamp is not repeated on Home.

**Milestone seal gallery (home):**

- Section label: "Milestones" in caption style, `--graphite-soft`.
- Horizontal scroll of **all course milestones** on a `--paper-1` shelf panel from the first visit; no visible scrollbar; upcoming seals peek at the right edge.
- **Fixed order** (lesson sequence, never sorted by earn date):
  1. `hh-ht-mastered` — HH vs HT Mastered (L1)
  2. `penneys-game-won` — Penney's Game Won (L2)
  3. `gamblers-ruin-solved` — Gambler's Ruin Solved (L3)
  4. `three-lessons-complete` — Three Lessons Complete (mid-course)
  5. `first-pattern-cracked` — First Pattern Cracked (L4)
  6. `state-machine-builder` — State Machine Builder (L5)
  7. `martingale-mastered` — Martingale Mastered (L6)
  8. `six-lessons-complete` — Six Lessons Complete (course completion)
- **Earned:** full ink ring, glyph in `--mark`, title on hover/focus (laptop) or beneath (mobile).
- **Unearned:** ghost seal — dashed `--graphite-soft` ring, glyph at 30% opacity, title in `--graphite-soft`. All unearned seals are visible from day one (stamp-album preview, not a progress bar).
- Mobile: ~2.5 seals visible. Laptop: ~4.
- Tapping an earned seal is optional (shows earned date + source lesson in a quiet inline expansion); tapping a ghost shows milestone title + unlock hint only. Never blocks navigation.

## Auth-First Onboarding

Flow:

1. Landing page.
2. Sign in or create account.
3. Confirm display name.
4. Home (study desk: habit panel, milestone gallery, course path).
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

## Signed-in Home (Study Desk)

The signed-in home is a single vertically scrolling page — **dashboard-lite reframed as a notebook spread**. Three regions, top to bottom: habit panel, milestone seal gallery, course path. No tabs, no sidebar, no metric grid.

### Page skeleton

```text
[home top bar: wordmark / profile]
[habit panel: streak tally + one-line next-action status]
[milestone seal gallery: earned + next ghost seals]
[section label: "Course"]
[course path: vertical graph-node chain]
[section label: "On the roadmap"]
[roadmap node stubs]
```

On laptop, all regions align to the centered page column (`--page-max`). Vertical rhythm between major regions: `--s6` mobile, `--s7` laptop.

### Habit panel

- First content below the home top bar; establishes momentum before the path.
- Contains the primary streak tally (see Streak spec) and one derived **status line** pointing at the recommended lesson action (e.g. "Resume Pattern Hitting Times · beat 5").
- **No primary button** in the habit panel. The status line is text-only; the focused lesson path node's detail panel holds the sole `Start`, `Resume`, or `Review` button.
- Background: `--paper-1`, flat (no shadow). A single hairline `--rule` border — not a floating SaaS card.

### Milestone seal gallery

- Second region; see Milestones spec.
- Separated from the habit panel by `--s5` / `--s6`.
- If no milestones earned yet: all eight seals render as ghosts (full stamp-album preview).

### Recommended-action priority

The habit-panel status line and the course path must agree on the next action, in this order:

1. **Resume** — any in-progress lesson with a saved snapshot. An active session always wins focus; review never interrupts it.
2. **Review** — most recent `needsReview` completed lesson, **only when no lesson is in progress** (between lessons). Sets the `--mark` ring + "Review recommended" on that node and the focused detail panel.
3. **Start** — next unlocked lesson not yet started.
4. **Replay** — all lessons mastered; status reads "Course complete" and points at optional review or roadmap preview.

The matching course-path node gets **focus emphasis** (quill ring; detail panel pinned open). Only one node is focused at a time.

**`needsReview` while a lesson is in progress:** Resume stays focused. The `needsReview` lesson keeps its `--mark` ring and surfaces "Review recommended" via hover/focus detail only — it does not steal the pinned focus or the primary CTA. The habit-panel status line may carry a quiet `--mark` note (e.g. "Review recommended on Pattern Hitting Times") beneath the Resume status, but the single primary button still resumes the active lesson.

### Home loading and empty states

- **Loading:** skeleton the three regions — tally stroke placeholders, circular seal ghosts, spine + node dots — not a centered spinner.
- **First visit (no progress):** habit panel shows `0-day streak`; gallery shows all eight milestone ghosts; L1 node focused with detail panel open; roadmap stubs visible below.

## Course Path (Graph Nodes)

The course path is the **third region of the signed-in home** (not a separate route in MVP). Lessons are **graph nodes** on a vertical spine — not index cards. Reuse the state-graph node vocabulary (circles, ink rings, mono glyphs) from the in-lesson Konva graphs. **Rendering (Q17/Q18):** a single Konva `<Stage>` draws the spine + a parallel transparent DOM-button overlay carries focus / keyboard / 44px / `aria`; detail panels are DOM (see `docs/adr/0001-konva-course-path-spine.md`).

### Spine and node layout

- Section label "Course" in caption style above the chain.
- A central `--rule-faint` vertical rule connects node dots (same geometry as lesson state graphs).
- Each lesson is one **path node**: a circle on the spine + a mono **lesson glyph** inside or centered on the dot (IBM Plex Mono).
- **At rest (non-focused):** glyph inside the node dot only — no lesson number, no title.
- **Detail panel (hover / focus on non-focused):** title (H2), one-line hook (`--graphite`), status caption — no primary button.
- **Focused node (recommended action):** detail panel **pinned open on load** without hover; includes title, hook, status, and the sole primary `Start`, `Resume`, or `Review` button. Quill ring + `--mark-wash` beam to panel.

### Per-lesson glyphs (fixed)

| L | Glyph | Lesson |
|---|-------|--------|
| 1 | `HH` | Pattern Hitting Times |
| 2 | `A≻B` | Penney's Game |
| 3 | `i/N` | Gambler's Ruin |
| 4 | `H` | States & Streaks |
| 5 | `THH` | Longer Patterns & Overlap |
| 6 | `Σ2^L` | The Overlap Shortcut |

- **Active beam (focused node only):** a thin vertical `--mark-wash` hairline connects the quill ring on the dot to the detail panel — a flat 2D nod to a "light column," not a 3D glow stack.
- Detail panel placement: to the right of the node on laptop. **Mobile (Q19)** diverges to a responsive layout — the focused node becomes a full-width DOM card (glyph + title + hook + live preview + CTA) atop a compact Konva rail of the remaining glyph-only nodes (see `docs/home-study-desk.md` §2.4).

### Focused detail panel — live preview

The **focused node's detail panel hosts a small looping live preview** of that lesson's signature interaction — the node dot keeps its static glyph; the motion lives in the panel. This is the single cinematic moment on Home (mirrors the landing-page state-machine motif), scoped to the focused lesson only. Non-focused panels (hover/focus) show title + hook + status with **no** preview.

- Layout in the focused panel: title (H2) → hook (`--graphite`) → live preview region → status caption → primary CTA.
- Preview region: edge-confined grid (`--rule-faint`) where coordinates matter, per the Background Texture policy; height ~120–160px mobile, taller on laptop; never taller than the CTA's reach.
- Each preview loops gently and is **engine-driven where the engine exists** (reuse pure sims + seeded `mulberry32`); decorative-only loops are acceptable for not-yet-built lessons.

Per-lesson preview intent:

| L | Glyph | Live preview |
|---|-------|--------------|
| 1 | `HH` | 3-node state graph pulsing through a flip sequence (reuse `StateGraph`) |
| 2 | `A≻B` | Two race lanes ticking; tally drifting toward 7:1 |
| 3 | `i/N` | A token random-walking between two walls on a number line |
| 4 | `H` | 2-node graph flipping until the first `H` |
| 5 | `THH` | 4-node chain advancing then resetting on a near-miss |
| 6 | `Σ2^L` | `2^L` chips dropping into a running sum landing on 6 |

- **Reduced motion:** render the preview's final/representative static frame (no loop), per the global reduced-motion rule; the panel stays legible and the lesson reachable.
- **Performance:** Konva previews use the same imperative-layer rule as in-lesson graphs (no per-frame React state); keep Home within the under-2-second first-interaction budget — lazy-load the preview after the spine and CTA paint.
- **Build phasing (honesty):** only L1 is built, so ship the **L1 preview first** (reuse `StateGraph`); L2–L6 previews are authored as each lesson is built. Until then, a focused-but-unbuilt lesson shows a static glyph placeholder in the preview region (no fabricated animation).

### Node states

- **Focused (recommended action):** `--quill` ring, soft pulse (respect reduced motion); detail panel **pinned open** on load; primary CTA in panel. Beam to panel.
- **Available (not focused):** ink ring; detail on hover/focus only; no CTA unless this node becomes focused.
- **Completed (non-focused):** **filled quill dot** (solid `--quill` center, glyph in `--paper-0` or `--mark` on fill) vs hollow ink ring for available — progress visible at a glance without title or hover. Slight opacity recede (`~0.72`) optional until hover.
- **needsReview:** completed styling + `--mark` ring; detail panel shows "Review recommended"; takes focus priority over Start next.
- **Locked:** faint `--rule-faint` ring, lock glyph overlay, glyph at 30% opacity; detail panel on hover shows title + hook + "Locked" only — no prerequisite copy.

### Interaction

- **Laptop:** `mouseenter` / `focus` opens detail panel; `mouseleave` / `blur` closes unless this is the focused node (focused stays open).
- **Mobile / touch:** first **tap** opens detail panel; second tap on focused node's CTA enters lesson. Tap elsewhere closes non-focused panels.
- **Keyboard:** arrow keys move along spine; `Enter` opens focused node / activates CTA when focused node is selected.
- Minimum hit target on each node dot: 44px (padding around glyph if needed).

### Roadmap stubs

Below "On the roadmap": smaller graph nodes (reduced dot size), title + hook in detail on hover only, not tappable.

Course path (laptop):

- Centered spine column within `--page-max`; detail panels align to a consistent right column so the chain reads like a labeled graph.

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
   - Recap, milestone stamp, next lesson recommendation. The **recap** shows "Fully mastered" when `transferAttained`, else "Completed"; the course-path node stays binary (completed / `needsReview`).

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
