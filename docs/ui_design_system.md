# Ergo Design System

> **Supersedes: "The Living Notebook" (`docs/ui_design_system.md` prior to this file).**
> All notebook-metaphor language (warm paper, letterpress/deboss, paper grain, tally marks,
> wax seals) is retired. Where this document and any older notes disagree, this document wins.
> The rationale and migration consequences are in `docs/adr/0003-ergo-bright-reimagining.md`.

---

## Design North Star

**Ergo** is a probability and quant-intuition product. The interface should feel like a
world-class interactive learning product — clean cool-white surfaces, vibrant per-chapter
colors, math objects as the primary illustration system, and tasteful motion that rewards real
understanding. The signed-in **Home** is a rich, structured page — a **momentum band** (streak
tracker and concepts-mastered gallery) followed by the **learning journey** — readable at a
glance, dense with meaning, never cluttered. The "wow" comes from three compounding sources:

1. **Craft execution** — optical precision, exact spacing, smooth compositor-only transitions.
   The things generic UIs get wrong. Every surface held to the same bar.
2. **Math as art** — coin faces, state machines, random walks, equation tiles, simulation
   charts, and counting tokens are the signature illustration system. Each lesson node is a
   mini math visualization. Supporting that system is a geometric/abstract layer (chapter
   gradients, arcs, icons). Nothing is decorated for its own sake — the math IS the visual.
3. **Tasteful motion** — visible momentum cues (progress arcs, light streaks on lesson
   completion), ambient state-machine breathing, choreographed lesson-enter sequences.
   Never Duolingo-loud, no mascot, no leagues, no hearts. The taste is brilliant.org.

## What "Premium" Means Here

**Premium is execution, not loudness.** Bright + clean + colorful does not mean loud.
Restraint lives in the **motion budget** (one cinematic moment per screen, ambient is
secondary), **semantic color** (chapter hues carry meaning, never decorate), and the
**no-gamification discipline** (no confetti, no urgency timers, no points-juice).

**Premium is the math-as-art signatures.** Every lesson has one signature math object
that appears in the journey card, the detail panel, and the lesson beats: the coin flip for
L0/L1, the state machine for L1, race lanes for L2, the bounded random walk for L3, the
2-node graph for L4, the 4-node chain for L5, and the token sum for L6. These are
proprietary; no other product has them; we make them precise and cinematic.

**Premium is uniform.** The landing, the home, and every lesson beat are held to the same
bar — same tokens, same type, same depth language. There is no "nice screen" and "plain
screen."

## Product Design Principles

- **Bright, clean, colorful world.** Cool near-white base (`--ergo-bg`), crisp white
  surfaces (`--ergo-surface`), vibrant chapter hues, soft gradients, real visual depth.
  Light-only for now; dark is deferred.
- **Math objects as illustration.** Coins (always with H/T letters), state machines,
  charts, equation tiles, and counting tokens do the visual work. These are the glyph
  system for the product. Supporting abstract shapes and chapter-gradient fills frame them.
- **Chapter color-coding throughout.** Every lesson, medallion, progress ring, connector
  segment, and detail card CTA button is keyed to its chapter color. The journey is readable
  by color at a glance.
- **One thing per beat.** Each lesson screen has one prompt, one interaction, one feedback
  area, and one primary action.
- **Sophisticated, adult game-feel.** Visible progress (rings, medallions, streak tracker).
  Tasteful completion celebrations. No coins-to-spend, no league tables, no loss mechanics.
- **Color is semantic.** Chapter hues code chapter identity. `--ok`/`--bad` code feedback.
  `--heads`/`--tails` code coin outcomes (always with H/T letters — never color alone).
  Color never decorates.
- **Composed, not empty.** Lessons are focused (one-thing-per-beat) but not sparse. Home
  is richer and denser than the lessons. Consistent 4px spacing scale throughout.

---

## Design Tokens

Include verbatim in `style-dictionary/tokens/`. The token pipeline (Style Dictionary) emits
these as CSS custom properties, a resolved Konva JS theme, and Motion/GSAP timeline tokens.
No literal hex or duration in components; no hand-synced token triad.

```css
/* ── base (cool light) ── */
--ergo-bg:         #F7F8FB;   /* page background */
--ergo-surface:    #FFFFFF;   /* card / panel surface */
--ergo-surface-2:  #F1F3F8;   /* wells, trays, secondary panels */
--ergo-ink:        #161A27;   /* primary text */
--ergo-ink-2:      #4B5268;   /* secondary text */
--ergo-ink-3:      #8A90A4;   /* captions, placeholders, disabled */
--ergo-line:       rgba(22,26,39,.08);   /* hairline borders */
--ergo-line-2:     rgba(22,26,39,.14);   /* dividers */

/* ── brand ── */
--ergo-brand:        #4F46E5;
--ergo-brand-strong: #4338CA;
--ergo-brand-tint:   #EEF0FE;

/* ── chapter hues + tints ── */
--ch1:      #4F46E5;   /* Foundations, indigo    */  --ch1-tint: #EEF0FE;
--ch2:      #0D9488;   /* Racing & Walks, teal   */  --ch2-tint: #E2F4F1;
--ch3:      #F0584A;   /* Mastery, coral         */  --ch3-tint: #FDECEA;
--ch4:      #E0982E;   /* Roadmap, amber (muted) */  --ch4-tint: #FBF0DD;
--ch5:      #7C5CF0;   /* spare, violet          */  --ch5-tint: #F1ECFE;

/* ── semantic ── */
--ok:      #16A36B;  --ok-tint:   #E4F6EE;
--bad:     #E5484D;  --bad-tint:  #FDECEC;
--mark:    #E0982E;  --mark-tint: #FBF0DD;

/* ── coins (always paired with H / T letters) ── */
--heads:      #D99A2B;  --heads-tint: #FBF0DD;
--tails:      #0D9488;  --tails-tint: #E2F4F1;

/* ── depth (soft layered shadows — not deboss/paper) ── */
--shadow-sm: 0 1px 2px rgba(22,26,39,.06), 0 1px 3px rgba(22,26,39,.04);
--shadow-md: 0 6px 16px rgba(22,26,39,.08);
--shadow-lg: 0 16px 40px rgba(22,26,39,.12);
--ring-focus: 0 0 0 3px rgba(79,70,229,.35);

/* ── radius ── */
--r-sm: 8px;  --r-md: 12px;  --r-lg: 16px;  --r-xl: 20px;  --r-pill: 999px;

/* ── spacing (4px base) ── */
--s1: 4px;   --s2: 8px;   --s3: 12px;  --s4: 16px;
--s5: 24px;  --s6: 32px;  --s7: 48px;  --s8: 64px;

/* ── type ── */
--font-display: 'Space Grotesk', 'General Sans', system-ui, sans-serif;
--font-body:    'Inter', 'Hanken Grotesk', system-ui, sans-serif;
--font-mono:    'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;
```

### Motion timeline tokens

```css
--dur-micro:  120ms;
--dur-base:   200ms;
--dur-slow:   360ms;
--dur-tell:   600ms;
--ease-out:   cubic-bezier(.2, .7, .2, 1);
--ease-spring: cubic-bezier(.2, 1.2, .3, 1);
--ease-inout: cubic-bezier(.5, 0, .2, 1);

/* master clocks for choreographed sequences */
--flip-beat:      520ms;   /* one synchronized flip (coin + node + edge) */
--celebrate-beat: 480ms;   /* lesson-complete light-streak + ring settle */
```

---

## Palette & Color System

### Base palette

The page background (`--ergo-bg`) is a cool near-white, not warm paper. Cards sit on
`--ergo-surface` (pure white) with `--shadow-sm` for lift. Secondary panels and wells use
`--ergo-surface-2`. Borders are `--ergo-line` (hairline, 1px) or `--ergo-line-2` (dividers).

### Chapter color-coding

Every chapter has a **hue** and a **tint**. The hue is used for connector segments,
medallion fills, progress rings, active-card borders, and CTA buttons. The tint is used for
card backgrounds on hover/active state, medallion backgrounds for locked states, and chip fills.

| Chapter | Name | Hue | Tint |
|---------|------|-----|------|
| Ch 1 | Foundations (L0, L1) | `--ch1` indigo `#4F46E5` | `--ch1-tint` |
| Ch 2 | Racing & Walks (L2, L3) | `--ch2` teal `#0D9488` | `--ch2-tint` |
| Ch 3 | Mastery (L4, L5, L6) | `--ch3` coral `#F0584A` | `--ch3-tint` |
| Roadmap | (amber, muted) | `--ch4` amber `#E0982E` | `--ch4-tint` |

The roadmap chapter uses amber at reduced opacity or a muted weight to signal
"not yet available" — it should feel directional, not active.

### Coin semantics

`--heads` (golden amber) and `--tails` (teal) are always paired with the letters `H` and `T`.
Never rely on color alone — the letter is required for accessibility.

### Feedback semantics

`--ok` / `--ok-tint` for correct, `--bad` / `--bad-tint` for incorrect,
`--mark` / `--mark-tint` for hints and discovery moments. These are not chapter colors
and must not be confused with chapter hues.

---

## Typography

Type is a top premium lever. The chosen pairing is clean, modern, precise — no serifs.

### Roles

| Role | Family | Use |
|------|--------|-----|
| **Display** | **Space Grotesk** (self-hosted, variable weight) | Hero headlines, section moments, oversized numerals. Geometric, contemporary, distinctive. |
| **Body & UI** | **Inter** (self-hosted, variable) | Paragraphs, controls, captions, labels, metadata. |
| **Math / mono** | **JetBrains Mono** (self-hosted, variable) | Equation tiles, state labels, coin tokens, numeric values, code. |
| **Typeset results** | **KaTeX / Computer Modern** | Final typeset equations in recap and explanation blocks. Its mathematical voice deliberately contrasts the sans stack — authentic, not decorative. |

**Self-hostable alternatives** (drop in if licensing or subsetting requires it):
- Display: **General Sans** or **Geist** — similar geometric-sans character, comparable weight range.
- Body: **Hanken Grotesk** — slightly warmer, excellent at small sizes.
- Mono: **IBM Plex Mono** — slightly narrower, strong mathematical voice.

### Loading & no-shift fallbacks

- Self-host variable builds: `@fontsource-variable/space-grotesk`, `@fontsource-variable/inter`,
  `@fontsource-variable/jetbrains-mono`. Subset Space Grotesk to the display character set.
- Generate metric-adjusted fallback faces (Capsize or Fontaine) with `size-adjust`,
  `ascent-override`, `descent-override`, `line-gap-override` to eliminate layout shift on swap.
- `font-display: optional` for body where a first-paint fallback is acceptable;
  `swap` (with metric overrides) for display. Protect the under-2-second lesson budget.

### Type craft

- **Numerals.** `font-variant-numeric: tabular-nums` for all aligned/animated figures:
  streak count, progress percentages, sim stats. Beautiful aligned numbers replace KPI tiles.
- **Slashed zero / stylistic sets.** Enable JetBrains Mono's slashed zero and relevant
  `ss0x` sets via `font-feature-settings` for a precise mathematical voice.
- **Line quality.** `text-wrap: balance` on headings; `text-wrap: pretty` on body (progressive
  enhancement). No orphaned words in lesson prompts.
- **Fluid scale.** `clamp()`-based sizes for smooth mobile→laptop scaling.

### Type scale (mobile → laptop)

| Level | Size/leading | Weight | Family |
|-------|-------------|--------|--------|
| Display (hero) | `clamp(2.5rem, 6vw, 4.5rem)` / 1.1 | 700 | Space Grotesk |
| Display (section) | `clamp(1.75rem, 3.5vw, 2.5rem)` / 1.2 | 600 | Space Grotesk |
| H1 | 24/30 → 32/40 | 600 | Space Grotesk |
| H2 | 19/26 → 24/32 | 600 | Space Grotesk |
| Body | 16/24 → 18/28 | 400 | Inter |
| Caption | 13/18 → 14/20 | 400 | Inter |
| Label | 12/16 → 13/18 | 500 | Inter |
| Math tile | 18 → 22 | 500 | JetBrains Mono |
| Streak numeral | `clamp(2rem, 5vw, 3.5rem)` | 700 | Space Grotesk |

---

## Depth & Shadows

Depth is **soft and layered** — surfaces lift gently off the page background with
low-contrast shadows. This is not flat design and not heavy SaaS elevation.

**No deboss, no letterpress, no paper grain.** Those were the Living Notebook's depth
language. The Ergo system uses only the shadow tokens defined above.

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px …(.06), 0 1px 3px …(.04)` | Default card lift; journey cards at rest |
| `--shadow-md` | `0 6px 16px …(.08)` | Hovered/active cards; equation tiles in flight |
| `--shadow-lg` | `0 16px 40px …(.12)` | Detail panel; modal-like overlays |
| `--ring-focus` | `0 0 0 3px rgba(79,70,229,.35)` | Focus ring for all interactive targets |

Cards at rest use `--shadow-sm` and `border: 1px solid var(--ergo-line)`. On hover, lift
to `--shadow-md`. The active/focused lesson card uses the chapter-color border
(`2px solid var(--chN)`) instead of the hairline.

Buttons use no shadow at rest; hover adds `--shadow-sm`; `:active` scales to 0.98 (no
deboss — compositor-only `transform`).

---

## Spacing & Radius

4px base grid. Bump vertical spacing between major regions one step on laptop.

```
--s1: 4px   --s2: 8px   --s3: 12px  --s4: 16px
--s5: 24px  --s6: 32px  --s7: 48px  --s8: 64px
```

Radius vocabulary:

| Token | Value | Use |
|-------|-------|-----|
| `--r-sm` | 8px | Chips, badges, small elements |
| `--r-md` | 12px | Buttons, inputs, medallions |
| `--r-lg` | 16px | Lesson cards, panels |
| `--r-xl` | 20px | Detail card overlay |
| `--r-pill` | 999px | Progress ring labels, pill badges |

---

## Home

A single vertically scrolling page. Three regions top to bottom: top bar, momentum band,
learning journey. No tabs, no sidebar, no metric grid.

```text
[home top bar: "Ergo" wordmark / profile avatar]
[momentum band: streak tracker · concepts-mastered gallery]
[section divider]
[learning journey: chapter sections + lesson cards + connector rail]
[roadmap section: muted amber cards, locked]
```

Regions reveal with a quiet stagger on load (reduced motion: appear at once). Laptop vertical
rhythm `--s6` mobile, `--s7` laptop. Content max-width 960px, centered.

### Home top bar

- **Left:** "Ergo" wordmark — Space Grotesk 700, `--ergo-ink`, at label-to-H2 scale. No subtitle.
- **Right:** profile avatar — user initial in a filled circle (`--ergo-ink`, 36px); opens
  display-name edit and sign-out. No streak count in the top bar (that lives in the momentum band).
- Single `1px --ergo-line` bottom border. No background fill — inherits `--ergo-bg`.

### Momentum band

The momentum band sits directly below the top bar and is the first content the user sees.
It contains two side-by-side regions:

**Left — Weekly streak tracker:**
- A large tabular numeral (`streak count`, Space Grotesk 700, `--ergo-brand`, display scale)
  followed by "day streak" in body weight.
- Below the numeral: a 7-dot week rail labeled M T W T F S S. Each dot is 8px, filled
  `--ergo-brand` for completed days, hollow (ring only) for today if not yet completed,
  `--ergo-surface-2` for future days. Dots are evenly spaced.
- No flame icon, no fire emoji, no tally marks.

**Right — Concepts-mastered gallery:**
- Label "Concepts mastered" in caption weight above the row.
- A horizontal row of circular medallions (see Medallions spec below), one per concept
  in fixed course order.
- Earned medallions: colored background (`--chN`), white math glyph, full opacity.
- Locked medallions: `--ergo-surface-2` background, `--ergo-ink-3` glyph, lock icon overlay.

On mobile, the momentum band stacks: streak tracker above, concepts-mastered gallery below.
On laptop, they sit side-by-side with a vertical `--ergo-line` divider between them.

The band sits on `--ergo-surface` with `--shadow-sm` and `--r-lg`, `--s5` internal padding.

### Learning journey

The learning journey is the third region of Home. It is a structured vertical list —
**not a serpentine/Duolingo path, not a Konva graph-node chain**. It is DOM + SVG, with:

- A vertical **connector rail** on the left (a thin `<svg>` line, `4px` wide, chapter-gradient
  per segment, connecting the lesson node circles).
- Full-width **lesson cards** to the right of the rail (DOM, `--ergo-surface`, `--shadow-sm`,
  `--r-lg`, `border: 1px solid var(--ergo-line)`).
- **Chapter section dividers** above the first lesson of each chapter (ALL CAPS, caption
  weight, `--chN` color, letter-spacing `.08em`).
- **Roadmap section** at the bottom: "COMING SOON" or equivalent divider above muted amber
  cards at reduced opacity; not enterable.

Each journey card has:
- **Left thumbnail** (96×96px, `--r-md`, `--ergo-surface-2` background): the lesson's
  signature math viz (static or gently animated — see viz map below). On mobile, 72×72px.
- **Right body** (flex-grow): lesson number + title (H2), one-line description (body),
  chapter color chip (small pill, `--chN-tint` background, `--chN` text). Completed
  lessons show a small checkmark chip instead. In-progress lessons show a progress label.

Node circles on the connector rail:
- 28px circles; fill `--chN` for completed (with a `✓` inside in white); ring `--chN` for active;
  ring `--ergo-line-2` for available-but-not-started; ring `--ergo-line` muted for locked.
- Connected by the rail; the rail segment between two lessons uses a gradient from the
  upper lesson's chapter color to the lower lesson's chapter color (or the same if same chapter).

Active lesson card:
- Left border `2px solid var(--chN)` (chapter color of the active lesson).
- Background `--ergo-surface` with a faint `--chN-tint` wash.
- The active lesson's circle on the rail is larger (32px) with a pulse ring (motion, see below).
- Clicking/tapping the active card opens the **detail card** (see below).

---

## Course Journey Component

### Node states

| State | Circle | Card border | Card background |
|-------|--------|-------------|----------------|
| Completed | Filled `--chN`, white `✓` | `1px --ergo-line` | `--ergo-surface` |
| Active | Ring `--chN`, 32px, pulse | `2px --chN` | `--ergo-surface` + `--chN-tint` wash |
| Available | Ring `--ergo-line-2`, 28px | `1px --ergo-line` | `--ergo-surface` |
| Locked | Ring `--ergo-line`, 24px, lock glyph | `1px --ergo-line` | `--ergo-surface-2` at 0.6 opacity |
| Roadmap | Ring `--ch4` at 0.4, 24px | `1px --ergo-line` | `--ergo-surface-2` at 0.5 opacity |

### Connector

The connector is a `4px`-wide `<svg>` `<line>` / `<path>` running the full height of the
journey. Each segment between two consecutive lessons uses a linear gradient from `--chN` of
the upper lesson to `--chN` of the lower lesson. Completed segments are fully opaque;
upcoming segments are at `0.25` opacity. The connector never crosses or branches.

### Progress rings

Progress rings appear in two contexts:
1. **Lesson detail card** — a single arc ring (40px, chapter color stroke on
   `--ergo-surface-2` track, `4px` stroke) with a bold percentage numeral centered inside.
2. **Chapter section header** — a compact ring (20px) showing the fraction of that chapter's
   lessons completed; optionally shown as "2/3" text next to the chapter label.

Rings are SVG `<circle>` elements with `stroke-dasharray`/`stroke-dashoffset` for the arc.
Animate `stroke-dashoffset` on mount (compositor-only via CSS transition, not JS per-frame).
Reduced motion: render final frame immediately.

### Chapter section dividers

A chapter section divider sits above the first lesson card of each chapter:

```text
FOUNDATIONS OF PROBABILITY       ○ 2/2
```

- All-caps label, `--chN` color, `font: 500 12px/16px var(--font-body)`, letter-spacing `.08em`.
- Chapter progress ring (20px) and fraction label on the right.
- `--s5` margin above, `--s3` margin below.
- A faint `1px --ergo-line` horizontal rule below the divider row.

### Active detail card

When a lesson is active (or when any lesson is tapped/clicked on mobile, or hovered/focused
on laptop), a **detail card** appears. On laptop it floats to the right of the journey
(`position: fixed` or sticky column beside the journey); on mobile it slides up from the
bottom as a bottom sheet.

Detail card contents:
- Chapter label: `"CHAPTER N · CHAPTER NAME"` — caption, `--chN`, letter-spacing `.06em`.
- Lesson title — H1, `--ergo-ink`, Space Grotesk 700.
- Progress ring — 48px, chapter color.
- Description — 2–3 lines of body text.
- Metadata row: clock icon + "N min" · bar-chart icon + difficulty level.
- Primary CTA button — chapter color fill, `--r-pill`, "Start lesson →" or "Continue →".

The detail card uses `--ergo-surface`, `--shadow-lg`, `--r-xl`, `border: 1px solid var(--ergo-line)`.

### Lesson → signature math viz map

Each lesson card's thumbnail shows the lesson's signature math object. Listed by lesson order
(L0–L6 plus roadmap):

| Lesson | Chapter | Signature viz |
|--------|---------|---------------|
| L0 First Heads | Ch 1 (indigo) | Single coin face (heads side, `--heads` amber) |
| L1 Pattern Hitting Times | Ch 1 (indigo) | 3-node state machine (∅ → H → HH); animated pulse |
| L2 Penney's Game | Ch 2 (teal) | Two race lanes, tallying toward a ratio |
| L3 Gambler's Ruin | Ch 2 (teal) | Random walk token between two walls |
| L4 States & Streaks | Ch 3 (coral) | 2-node graph (∅ → H) |
| L5 Longer Patterns | Ch 3 (coral) | 4-node chain advancing then resetting |
| L6 The Overlap Shortcut | Ch 3 (coral) | Σ2^L tokens summing to a total |
| Roadmap: Weighted Coins & Dice | Ch 4 (amber, muted) | Dice face with dot pattern |

Thumbnails for available and completed lessons may be static (final representative frame).
The **active lesson** thumbnail is gently animated (looping, low amplitude). Reduced motion:
all thumbnails are static. Lazy-load thumbnail animations after journey paint.

---

## Component Specs

### Buttons

- Height 48px; radius `--r-md` (secondary/ghost) or `--r-pill` (primary CTA); `font: 600 16px
  var(--font-body)`.
- **Primary (chapter color):** `--chN` fill, white text. Use when a clear chapter context exists.
  Brand default: `--ergo-brand` fill.
- **Secondary:** `--ergo-surface` fill, `1.5px solid --ergo-line-2` border, `--ergo-ink` text.
- **Ghost:** `--ergo-brand` text, no border, no fill. Use for secondary actions (Hint,
  Show explanation).
- **Disabled:** `--ergo-surface-2` fill, `--ergo-ink-3` text.
- **Micro-interaction:** hover adds `--shadow-sm`; `:active` scales to 0.98 (transform only).
- **Focus ring:** `--ring-focus` (brand indigo, 3px offset).
- Min width: enough for the label + `--s4` horizontal padding each side.

### Cards

Base card: `--ergo-surface`, `1px solid var(--ergo-line)`, `--shadow-sm`, `--r-lg`.
Hover: `--shadow-md`. Active/selected: chapter-color `2px` left border + `--chN-tint` background wash.
Internal padding: `--s4` mobile, `--s5` laptop.

### Lesson cards

Lesson cards are the journey's primary unit. In addition to base card styles:
- Fixed `min-height: 80px` mobile, `96px` laptop.
- Two-column layout: thumbnail left (fixed 72/96px), body right.
- Thumbnail: `--r-md`, `--ergo-surface-2` background, Konva or SVG math viz.
- Body: lesson number chip (small pill, `--ergo-surface-2` fill, `--ergo-ink-2`), title (H2),
  one-line description (body, `--ergo-ink-2`), chapter color chip.
- Locked cards: all text at `--ergo-ink-3`; thumbnail at 40% opacity; no hover lift.

### Medallions (concepts-mastered)

Medallions replace wax seals. They are circular icon-badges keyed to individual concepts
(not just lessons), displayed in a horizontal gallery in the momentum band.

- **Size:** 48px mobile, 56px laptop.
- **Earned:** filled circle (`--chN` background), white math glyph (JetBrains Mono, centered),
  `--shadow-sm`. Glyph examples: `E[X]`, `σ²`, `ρ`, `Σ`, `P(A|B)`, `λ`.
- **Locked:** `--ergo-surface-2` background, `--ergo-ink-3` glyph at 40%, small lock icon
  overlay at bottom-right (12px, `--ergo-ink-3`).
- **Earn animation:** on lesson completion, the matching medallion transitions from locked to
  earned — scale from 0.8 → 1.0 with `--shadow-md` flash, then settles. The first time Home
  loads after earning, the medallion quietly fades from locked styling to earned. Reduced
  motion: instant swap.
- **Gallery:** fixed order (concept unlock order), always all visible from day one. Horizontal
  scroll on mobile if overflow; fixed row on laptop.

### Progress rings

SVG arc rings. `stroke-dasharray = circumference`; `stroke-dashoffset` drives the fill.
CSS transition on `stroke-dashoffset` (duration `--dur-slow`, ease `--ease-out`).

- Track: `--ergo-surface-2` or `--ergo-line`.
- Fill: `--chN` (chapter color of the lesson).
- Percentage label: Space Grotesk 700, tabular-nums, centered.

### Inputs (auth / display name)

- Label above the field; `--ergo-surface` fill; `1px solid --ergo-line-2` border; `--r-md`.
- Focus: border becomes `2px solid --ergo-brand`; `--ring-focus` shadow.
- **Error state:** border `--bad`; `--bad-tint` background; helper copy in `--bad` below the field.
  Field-level treatment, not text-only.
- Min height 48px for tap targets.

### Equation tiles (signature)

Math objects being dragged or placed. Not the same as the KaTeX typeset result.

- Min hit area 44×44px; `--ergo-surface` face; `1px solid --ergo-line-2` border;
  `--r-sm`; JetBrains Mono 500; `--shadow-sm` at rest.
- **Lift (drag):** `--shadow-md`, scale 1.04, slight rotation. Compositor-only.
- **Snap into slot:** spring settle + a brief border-color flash to chapter color.
  Tap-to-place is the equivalent, fully tested path.
- **Correct:** `--ok-tint` background flash + `--ok` border. **Wrong:** short horizontal
  shake + `--bad` border. Reduced motion → color only, no shake.
- Tile category coloring: state variable → `--ergo-brand`; probability → `--heads`;
  constant → `--ergo-ink-3`; operator → `--ergo-ink`.

### Equation slots

Dashed placeholder rectangles on the equation baseline.
Empty: `1.5px dashed --ergo-ink-3`. Drag-over: `1.5px dashed --ergo-brand` + `--ergo-brand-tint`
fill. Filled: solid border, `--ergo-surface` fill, `--shadow-sm`.

### Prediction slider

Number-line styling, built on React Aria `useSlider`. Mono tick labels, tabular-nums.
Thumb: brand indigo filled dot, 16px, `--ring-focus` on focus. Locked prediction leaves a
`--mark` marker line that later reappears in the theory-vs-simulation chart.

### Feedback strip

Inline above the sticky action bar; never a modal.
Correct: `--ok` left border + explanatory sentence. Incorrect L1: conceptual nudge.
L2: relevant slot or edge glows `--mark-tint`. L3: reveal correct tile/step, mark `needsReview`.

### Tooltips, menus, dialogs

Built on Radix Primitives, dressed in Ergo tokens: `--ergo-surface` fill, `1px --ergo-line`
border, `--shadow-md`; `--r-md`. No heavy SaaS chrome. Inline status notes replace
drop-shadow toasts.

---

## Motion

Motion is choreographed and purposeful, never decorative loudness. The discipline that
keeps this premium rather than gamified is the **Restraint Rails** defined at the end of
this section.

### Toolset matrix

| Layer | Tool | Use |
|-------|------|-----|
| DOM micro-interactions, springs, presence, layout | **`motion`** (`LazyMotion` + `m`) | Coins, tiles, lesson-card enter/exit, hover/press, `layoutId` morphs. |
| Cinematic DOM timelines + big-type reveals | **GSAP** (free, `@gsap/react`) | SplitText headline reveals on landing; hero/celebration sequences. |
| Canvas signatures | **Konva** (`Konva.Tween` / `Konva.Animation`) | State graph, sim chart, journey thumbnails, bias chart. `'use no memo'` on all Konva mounts. |
| Routing / state morphs | **Native View Transitions** (+ scroll-driven where apt) | Home↔lesson, beat↔beat. 0 KB, feature-gated by `document.startViewTransition`. |

### Signature choreographies

- **The synchronized flip.** Coin token springs in, the active state-machine node pulses,
  and a one-shot energy packet travels the active edge — all on `--flip-beat` (520ms). The
  packet animates once per flip (not a looping marquee). This is the product's defining moment.
- **Lesson completion celebration.** On lesson complete: the matching concept medallion
  scales up with `--shadow-lg` → settles; a brief light-streak arc in chapter color crosses
  the screen (GSAP, compositor-only `transform`); then a quiet fade-in of the recap text.
  Duration: `--celebrate-beat`. **No confetti. No colored paper bits.**
- **Equation tile snap.** Tile lifts (`--shadow-md`, scale 1.04) then spring-settles into the
  slot with a chapter-color border flash.
- **Journey traversal.** On entering a lesson, the journey scroll-positions to the active
  node, then a View Transition morphs into the lesson shell.
- **Convergence.** The empirical simulation line animates toward the theory line via Konva
  tween (≤30fps batch, not `setState` per rAF frame).
- **Streak increment.** When a new day dot earns its fill, it scales 0.8 → 1.0 with
  `--ease-spring`. Reduced motion: instant fill.
- **Medallion earn.** Scale 0.8 → 1.0, `--shadow-md` flash, settle. Reduced motion: fade.

### Ambient living motifs

- **Breathing state machine** — on the landing hero and in the active journey card thumbnail:
  nodes pulse gently through a flip sequence at low amplitude.
- **Active lesson pulse ring** — the active node circle on the connector has a slow repeating
  outward ring pulse (scale 1 → 1.4, opacity 1 → 0, period ~2s).

**Ambient caps (mandatory):** amplitude small enough to be felt, not watched; long periods;
**pause when the tab is hidden, element is offscreen, or user is idle**; fully removed under
reduced motion. Ambient motion must never compete with the prompt or primary action.

### Page transitions

Native View Transitions API for home↔lesson and beat↔beat morphs, gated by
`if (document.startViewTransition)`. The journey→lesson morph and the lesson→home return
are the marquee cases. Pair with `view-transition-name` on the journey card and lesson shell.

### Reduced-motion parity

Every signature has a reduced-motion equivalent: final frame / instant swap / opacity-only
fade. Keep `useReducedMotion` (live-updating) and `<MotionConfig reducedMotion="user">`.
GSAP timelines branch on `prefers-reduced-motion`. View Transitions collapse to an instant
cut. The lesson must be fully completable at zero motion.

The global `* { transition-duration: 0.01ms !important }` backstop rule remains active.

### Restraint Rails

- **Motion budget:** at most one cinematic moment per screen; ambient is secondary and
  pausable; no confetti, no urgency timers.
- **Compositor-only:** animate `transform` and `opacity` exclusively. Never animate layout
  properties, `border-radius`, or `box-shadow` in tight loops.
- **No per-frame React state** during canvas animation. Canvas stays imperative (Konva
  tween/animation).
- **No Firestore during animation.** Persist on commit/debounce only.

---

## Accessibility

- All interactive targets ≥44px. This includes node circles (use a transparent hit-target
  overlay if the visible circle is smaller), medallions, and equation tiles.
- Never rely on color alone. Coins always carry H/T letters. Chapter color is supplemented
  by shape (connector node fill vs ring) and label. Feedback uses color + icon + text.
- Equation tile placement supports a non-drag path (select tile, then slot).
- Canvas interactions (state machine, sim chart) need DOM equivalents or `aria-live` summaries
  for flips, state changes, and feedback.
- Keyboard focus must be visible: `--ring-focus` ring or chapter-color underline. Use
  Radix Primitives (dialog, dropdown, popover, tooltip, tabs) and React Aria hooks
  (`useSlider`, `useNumberField`) so roles, focus order, and keyboard behavior are correct.
- Test at 200% text scaling without clipping core actions.
- ARIA labels for progress rings: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.

---

## Responsive Strategy

Mobile-first. One breakpoint for laptop overrides; display type scales fluidly.

```css
--bp-laptop: 768px;
--page-max: 960px;
```

### Page model

- **Mobile (<768px):** full viewport width, `--s4` side padding. Journey cards stack
  full-width. Detail card appears as a bottom sheet (slides up from bottom edge).
  Momentum band stacks vertically (streak above, gallery below).
- **Laptop (≥768px):** centered column, max `--page-max`. Journey sits in the left ~60%;
  detail card floats in the right ~38% as a sticky panel. Momentum band side-by-side.
  Canvas/chart regions expand to full column width.

### Mobile journey divergence

On mobile, the journey renders as a stacked full-width list. The connector rail is a
narrow left margin `<svg>` column (24px wide). Lesson cards fill the remaining width.
The detail card appears as a bottom sheet with a drag handle; opening it does not re-route.

On laptop, the detail card is a persistent sticky panel to the right of the journey rail.
Hovering a lesson card opens its detail; clicking/tapping enters the lesson.

---

## Performance Budget

- **Under-2-second first interaction.** Code-split routes; do not eagerly ship every page +
  Konva + Firebase in the entry bundle. Add error boundaries.
- **Lazy-load** GSAP, KaTeX, and journey thumbnail animations after first paint.
- **Fonts:** self-hosted variable builds, subset Space Grotesk to display characters, metric-
  adjusted fallbacks to prevent layout shift.
- **Motion:** compositor-only properties; ambient pauses offscreen/idle; no per-frame React
  state during canvas animation.
- **Protect polish** with Playwright visual-regression snapshots on key surfaces (including
  a reduced-motion project) so the premium bar cannot silently regress.

---

## Implementation Notes

- **Rewrite `style-dictionary/tokens/*.json`** to the Ergo token set defined above.
  Regenerate `tokens.generated.css` and `tokens.generated.ts`. Resync the Konva theme
  (`src/lesson/konva/theme.ts`) to the new values.
- **Light-only.** Dark mode is deferred post-MVP. Do not add dark-mode branches now.
- **CSS:** cascade layers (`@layer tokens, base, surface, components, utilities`);
  `@property` for typed/animatable custom properties; CSS Modules per surface. The
  monolithic `app.css` split is already begun — continue it for new surfaces.
- **Type:** self-host variable builds for Space Grotesk, Inter, JetBrains Mono; metric
  fallbacks; `font-feature-settings` for slashed zero + tabular-nums; fluid `clamp` scale.
- **Stack:** keep `motion`; keep GSAP for SplitText + hero/celebration timelines; native
  View Transitions for routing; Radix Primitives + React Aria for interactive components;
  KaTeX for typeset results; Konva remains the hero canvas. **Do not adopt Rive.**
- **Keep the "Lesson complete" text node** so existing e2e selectors hold through the
  celebration redesign.

### Implementation phasing

0. **Token rewrite:** Style Dictionary to Ergo tokens; regenerate CSS + Konva theme +
   motion tokens; cascade layers + `@property`; variable fonts + metric fallbacks.
1. **Home shell:** momentum band (streak dots + medallion gallery); learning journey
   (DOM+SVG connector, chapter dividers, lesson cards, detail card panel).
2. **Lesson beats:** migrate to Ergo type + color tokens; equation tiles, state machine,
   sim chart in chapter palette.
3. **Motion + celebration:** light-streak completion; synchronized flip; medallion earn;
   streak-dot animation; View Transitions; ambient thumbnail breathing.
4. **Polish + accessibility:** progress rings; Playwright visual-regression; all
   screen states (loading skeletons, error, offline, empty).

---

## Concept Catalog / Macro Home

The **Concept Catalog** is the signed-in root screen (`/`). It replaced the old
direct-to-journey entry and is the first thing a signed-in learner sees after onboarding.
Two primary vertical regions:

```text
[top bar: "Ergo" wordmark / profile avatar]  ← same chrome as per-concept path
[resume hero: "Continue learning" — active concept card, full-width]
[domain shelves: one labeled horizontal carousel per domain, ordered by domainOrder]
```

Content max-width 960px, centered. Same top bar as the per-concept path (`--ergo-bg`,
`1px --ergo-line` bottom border).

### Resume hero

A full-width feature card surfacing the most-recently-active in-progress concept. If nothing
is in progress, shows the recommended first-to-start concept; if all are mastered, the most
recently reviewed. Contains:

- **Concept thumbnail** — `MathViz` component keyed by `vizKey`, or `ConceptMedallion` at
  96px, on an `--chN-tint` wash background (accent field → chapter token).
- **Title** — Space Grotesk 700, `--ergo-ink`.
- **Tagline** — Inter 400, `--ergo-ink-2`, one line.
- **Per-concept progress ring** — SVG arc, `--chN` stroke, `aria-valuenow`, bold percentage
  numeral centered.
- **Primary CTA** — "Continue →" / "Start →" / "Review →"; `--chN` fill, `--r-pill`.

Base card: `.ergo-card` with `--shadow-lg` and `--r-xl`. Background tinted with
`--chN-tint` as a subtle wash behind the content.

### Domain shelves

Each domain is a `<section aria-label="<Domain name>">` containing a labeled heading and a
scrollable horizontal row of concept cards. Domains are ordered by their `domainOrder` value;
concepts within each domain by their `order` value.

**Carousel interaction:**

- **Desktop** — visible left / right chevron buttons (`aria-label="Scroll left"` /
  `"Scroll right"`); buttons hidden at scroll start / end via `IntersectionObserver`;
  `--ring-focus` on focus.
- **Mobile** — swipe + peeking next card (the last visible card is clipped at ~70% to signal
  more content); no chevrons.
- **Keyboard** — `ArrowLeft` / `ArrowRight` moves focus between cards within the carousel;
  `Tab` exits to the next shelf.
- **ARIA** — `role="region"` on the shelf; each card is `role="group"` with
  `aria-label="<concept title>"`. Progress rings carry `aria-valuenow`, `aria-valuemin="0"`,
  `aria-valuemax="100"`, `aria-label="<N>% complete"`.
- **Scroll** — `scroll-snap-type: x mandatory`; `scroll-snap-align: start` on each card.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables smooth-scroll and
  snap animations; chevron click jumps instantly.

### Concept cards

Each card in a domain carousel:

- **Thumbnail** (square, `--r-md`, 96px): the concept's `vizKey` math visualization
  (`MathViz`, lazy-loaded) or a `ConceptMedallion`; background is `--chN-tint` (from the
  concept's `accent` field, defaulting to `--ch1`). Active concept thumbnail is gently
  animated; others static.
- **Title** — Space Grotesk 600, `--ergo-ink`.
- **Tagline** — Inter 400, `--ergo-ink-2`, one line, truncated at overflow.
- **Progress ring** — `aria-valuenow` SVG arc in accent color; shown only if the learner has
  started the concept.
- **Status CTA:**
  - Live, not started → ghost button "Start →" (accent color).
  - Live, in progress → progress ring + "Continue →".
  - Live, mastered → "Review →".
  - Coming soon → `"Coming soon"` label, `--ergo-ink-3`, no interaction; card at 0.6 opacity.
- **Base style** — `.ergo-card`: `--ergo-surface`, `1px solid var(--ergo-line)`,
  `--shadow-sm`, `--r-lg`, `--s4` padding. Hover: `--shadow-md` (skipped for coming-soon
  cards). Active/tapped: `2px solid var(--chN)` left border + `--chN-tint` wash.

### Tokens and components reused

| Element | Reused from |
|---------|-------------|
| Concept thumbnail | `MathViz` (existing, keyed by `vizKey`) |
| Medallion in hero / card | `ConceptMedallion` (48/56px; `--chN` / locked styling) |
| Streak banner (optional) | `WeeklyStreak` (carried from per-concept path) |
| Card base | `.ergo-card` (surface, border, radius, shadow tokens) |
| Chapter accent | `--ch1` … `--ch5` / `--ch1-tint` … `--ch5-tint` |
| Progress ring | SVG `stroke-dashoffset` arc; `aria-valuenow`; `--chN` stroke |
| Typography | Space Grotesk 600/700 (titles), Inter 400 (tagline / captions) |
| Spacing | `--s4` card padding, `--s5` shelf row gap, `--s6`–`--s7` section gap |
| Shadows / radius | `--shadow-sm` / `--shadow-lg`, `--r-lg` / `--r-xl` |

New surface CSS lives in `src/styles/surfaces/ergo-catalog.css` (hero, shelf rows, carousel +
chevrons, snap, focus rings); uses **only** `--ergo-*` / `--chN` tokens — no `--paper-*` /
legacy tokens.

### Concept-open morph

Selecting a live concept triggers the `concept-open` shared-element View Transition via
`document.startViewTransition`:

- The tapped card's thumbnail + title receive `view-transition-name: concept-hero-<conceptId>`.
- The same name is applied to the concept page header on the per-concept path, so the
  thumbnail + title morph in-place across the route boundary.
- Other catalog cards fade out during the transition; the concept page fades in.
- Chapter accent color (`data-ch` attribute on the transitioning element) carries through.
- **Reduced motion** — `prefers-reduced-motion: reduce` → plain navigation; no morph; instant
  cut (the `::view-transition-*` pseudo-elements are suppressed).
- **Feature gate** — `if (document.startViewTransition)` wraps every invocation; unsupported
  browsers fall back to direct navigation.
- **Analytics** — `concept_selected` event fires on tap; `catalog_viewed` fires on mount.
