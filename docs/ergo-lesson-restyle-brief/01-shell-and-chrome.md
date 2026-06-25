# Ergo Lesson Restyle Brief — Part 1: Lesson Shell & Chrome

> **Series:** This is **Part 1** of the Ergo Lesson Restyle Brief. It covers the
> **lesson shell and chrome** — the frame around every beat: top bar, per-beat
> progress rail, prompt strip, interaction region wrapper, sticky action bar,
> buttons, feedback strip, coin stream, status banners, boot/skeleton, the
> completion takeover, and the view-transition choreography. The **beat
> interiors** (equation tiles, state graph, sim chart, sliders, race/walk/ledger
> heroes, recap internals, primers, etc.) are **Part 2** and are out of scope
> here except where they share a chrome token (flagged inline).
>
> **Status:** Draft / planning only. **No source, CSS, fixtures, or lesson code
> has been changed.** This document is the executable spec; a developer (or a
> follow-up subagent) should be able to implement it without re-deriving
> anything.
>
> **Target identity:** `docs/ui_design_system.md` (Ergo Design System). The bar
> to match is the shipped Home: `src/pages/StudyDesk.tsx` +
> `src/styles/surfaces/ergo-home.css` + `src/styles/surfaces/ergo-journey.css`,
> and the approved mock `mock/ergo-home.html` / `mock/ergo-home-shot.png`.

---

## 0. Foundation: the token reality, and the chapter-accent mechanism

Read this first — every section below depends on it.

### 0.1 The legacy tokens already resolve to Ergo values

`style-dictionary` was already rewritten and `src/styles/tokens.generated.css`
regenerated. The lesson chrome still references the **legacy notebook token
names**, but those names now alias Ergo values:

| Legacy token (used by chrome today) | Now resolves to | Ergo equivalent |
|---|---|---|
| `--paper-0` `#f7f8fb` | page background | `--ergo-bg` |
| `--paper-1` `#ffffff` | card surface | `--ergo-surface` |
| `--paper-2` `#f1f3f8` | well / tray | `--ergo-surface-2` |
| `--ink` `#161a27` | primary text | `--ergo-ink` |
| `--graphite` `#4b5268` | secondary text | `--ergo-ink-2` |
| `--graphite-soft` `#8a90a4` | caption / disabled | `--ergo-ink-3` |
| `--quill` / `--quill-strong` / `--quill-tint` | indigo brand trio | `--ergo-brand` / `--ergo-brand-strong` / `--ergo-brand-tint` |
| `--rule` `#e2e5ec` / `--rule-faint` `#eceef3` | hairline / divider | ≈ `--ergo-line` / `--ergo-line-2` (solid vs rgba) |
| `--heads` `#d99a2b` / `--heads-tint` | coin heads (amber) | `--heads` / `--heads-tint` |
| `--tails` `#0d9488` / `--tails-tint` | coin tails (teal) | `--tails` / `--tails-tint` |
| `--correct` `#16a36b` / `--correct-tint` / `--correct-text` `#0f7a4d` | success | `--ok` / `--ok-tint` (+ darker text) |
| `--wrong` `#e5484d` / `--wrong-tint` / `--wrong-text` `#b42318` | error | `--bad` / `--bad-tint` (+ darker text) |
| `--mark` `#e0982e` / `--mark-tint` / `--mark-wash` | hint / discovery (amber) | `--mark` / `--mark-tint` |
| `--e1` / `--paper-shadow-1` | soft lift (sm) | `--ergo-shadow-sm` |
| `--e2` / `--paper-shadow-2` | soft lift (md) | `--ergo-shadow-md` |
| `--paper-shadow-3` | overlay lift (lg) | `--ergo-shadow-lg` |

**Consequence:** lessons already render in cool-white + indigo + the right
type. What remains is **structural / depth / semantic** restyling, not a hex
swap. Two legacy tokens are *not* Ergo and must be **eliminated** from chrome:

- **`--press-deboss`** = `inset 0 1px 2px rgba(22,26,39,.12)` — the notebook
  "press-in" depth. Ergo presses are **compositor `transform: scale(.98)` only**
  (no inset shadow). Every chrome use of `--press-deboss` must be removed.
- **`--letterpress-ink`** / **`--edge-highlight`** — letterpress depth leftovers
  (not referenced in chrome scope today; do not introduce them).

### 0.2 Naming policy for this restyle

**Recommendation:** migrate the chrome rules to the **Ergo token names**
(`--ergo-*`, `--r-*`, `--ergo-shadow-*`, `--ring-focus`, `--font-display/sans/mono`,
chapter hues) so the lesson surfaces read like the shipped `ergo-home.css` /
`ergo-journey.css` and survive the eventual deletion of the legacy aliases.

- Where a legacy alias maps 1:1 (e.g. `--paper-1` → `--ergo-surface`), the rename
  is a **zero-visual-diff** change and de-risks future token cleanup.
- The genuine visual changes are concentrated and listed per component:
  deboss → transform press, hairline color, shadow tokens, **chapter accent**,
  type weight/scale, focus ring, radius confirmation.

If churn must be minimized for a given PR, keeping a legacy alias that already
resolves correctly is acceptable **except** for `--press-deboss` (always remove).

### 0.3 The chapter-accent mechanism (new — the core of "color-coding throughout")

The Ergo principle *"every CTA / connector / ring is keyed to its chapter color"*
must reach the lesson chrome. Today the chrome is mono-indigo (`--quill`). Add a
**single accent custom property** scoped to the lesson root, mirroring how
`ergo-journey.css` sets `--ch-glow` via `[data-ch="chN"]`.

**Lesson → chapter map** (from `CONTEXT.md` + `src/lesson/phases.ts`):

| lessonId | Lesson | Chapter | `data-ch` |
|---|---|---|---|
| `lesson-first-heads` | L0 First Heads | Foundations | `ch1` |
| `lesson-pattern-hitting-times` | L1 Pattern Hitting Times | Foundations | `ch1` |
| `lesson-penneys-game` | L2 Penney's Game | Racing & Walks | `ch2` |
| `lesson-gamblers-ruin` | L3 Gambler's Ruin | Racing & Walks | `ch2` |
| `lesson-states-streaks` | L4 States & Streaks | Mastery | `ch3` |
| `lesson-longer-patterns` | L5 Longer Patterns | Mastery | `ch3` |
| `lesson-overlap-shortcut` | L6 The Overlap Shortcut | Mastery | `ch3` |

**TSX:** `LessonPlayer` sets `data-ch` on the root `.lesson` element (both the
active and the completion-takeover returns). **CSS:** a small block (place at the
top of `shell.css`) resolves the accent trio + glow:

```css
/* Chapter accent — keyed off the lesson root. Mirrors ergo-journey [data-ch]. */
.lesson {
  --lesson-accent: var(--ergo-brand);
  --lesson-accent-tint: var(--ergo-brand-tint);
  --lesson-accent-glow: rgba(79, 70, 229, 0.18);
}
.lesson[data-ch='ch1'] { --lesson-accent: var(--ch1); --lesson-accent-tint: var(--ch1-tint); --lesson-accent-glow: rgba(79,70,229,.18); }
.lesson[data-ch='ch2'] { --lesson-accent: var(--ch2); --lesson-accent-tint: var(--ch2-tint); --lesson-accent-glow: rgba(13,148,136,.18); }
.lesson[data-ch='ch3'] { --lesson-accent: var(--ch3); --lesson-accent-tint: var(--ch3-tint); --lesson-accent-glow: rgba(240,88,74,.18); }
```

Thereafter, chrome that should be chapter-coded uses `var(--lesson-accent)` /
`var(--lesson-accent-tint)` / `var(--lesson-accent-glow)`:

- **primary CTA fill** (`.btn--primary`)
- **prompt kicker** ("Extension") and the **lesson-title overline**
- **active rail segment** + completed rail fill
- **active prefix-state chip** in the coin stream
- **compact streak** numeral accent
- **completion medallion** hue

**Decision — primary CTA is chapter-hued, not brand.** The Home detail-card CTA
("Start lesson") is chapter-colored; continuing that same hue through the
lesson's Continue/Check/Finish keeps the journey visually coherent (Design
System §"Buttons → Primary (chapter color): use when a clear chapter context
exists"). Chapter 1 *is* indigo, so L0/L1 are visually identical to the brand
default. The **focus ring stays brand indigo** (`--ring-focus`) on every target,
per the Design System (it is a fixed UI signal, not a chapter signal).

---

## 1. Section overview — how the lesson shell should feel in Ergo

Today the shell is the **Living Notebook**: a `--paper-0` page, hairline-`--rule`
chrome, **deboss** press states, an **ink-stamp wax seal** on completion, a
**tally-mark** streak, a **paper-grain grid** behind canvases, and Fraunces-era
type weights (display at 500). The structure is sound; the *material* is wrong.

**Target feel (Ergo):**

- **Bright, layered, not pressed.** Cool near-white page (`--ergo-bg`), crisp
  white trays (`--ergo-surface`) lifting on **soft shadows** (`--ergo-shadow-sm/md`).
  Depth is *lift*, never *deboss*. No inset shadows, no paper grain, no letterpress.
- **Chapter-coded.** The lesson wears its chapter hue (`--lesson-accent`) on the
  primary CTA, the progress rail, the prompt kicker, the state chip, and the
  completion medallion. A learner can tell "I'm in Racing & Walks (teal)" at a
  glance — matching the Home journey they came from.
- **Composed, generous, one-thing-per-beat.** Keep the calm single-column layout;
  bump nothing busy. The prompt is the hero of each screen.
- **Type is the premium lever.** Prompt in **Space Grotesk** (`--font-display`)
  at display-section weight **600** (up from 500). Math/coins/numerals in
  **JetBrains Mono** (`--font-mono`) with **`tabular-nums`** for any aligned or
  animated figure (streak count, sim stats). Body/labels in **Inter**.
- **Quiet, choreographed motion.** Keep the beat↔beat slide and the synchronized
  coin-flip; replace the wax-stamp completion with the Ergo **medallion-earn +
  chapter light-streak**. One cinematic moment per screen; ambient stays
  pausable; reduced-motion fully parity.
- **Uniform with Home.** Same tokens, same radii (`--r-md` controls, `--r-lg`
  panels), same shadows, same focus ring, same fonts. There is no "nice screen"
  and "plain screen."

---

## 2. Component-by-component restyle plan

Each subsection: **Current state** (what renders + classes, with file refs) →
**Target Ergo state** → **Exact changes** (rules, tokens, structure).

### 2.1 `src/lesson/LessonPlayer.tsx` — shell composition, accent, banners, completion

**Current state.** Renders the `.lesson` root twice (active branch and `done`
takeover). The active branch composes: `.topbar` (back `←`, `.topbar__center`
with `.topbar__title` + `.rail-row` [`PhaseRail` + optional `.biaschip`], and a
`<StreakTally compact>`); then `StatusNote` banners (offline / restoring /
error); then `<section class="prompt">` (optional `.prompt__kicker` "Extension" +
`.prompt__text`); then `<BeatView>`. The `done` takeover re-renders `.topbar`,
then `<LessonCelebration>` wrapping `.done-note` (text **"Lesson complete ✓ …"**
+ a `<MilestoneSeal earned stamped>` wax seal + a `.done-note__error` retry),
then `.actionbar` with the primary "Back to course path".

```425:444:/Users/ericwu/Developer/brilliant.org/src/lesson/LessonPlayer.tsx
  return (
    <div className="lesson">
      <header className="topbar">
        <button
          type="button"
          className="topbar__back"
          onClick={atStart ? onExit : back}
          disabled={atStart && !canExit}
          aria-label={atStart && canExit ? 'Back to course path' : 'Previous beat'}
        >
          ←
        </button>
        <div className="topbar__center">
          <span className="topbar__title">{lesson.title}</span>
          <div className="rail-row">
            <PhaseRail
              beatId={beat.beatId}
              lessonId={lesson.lessonId}
              reducedMotion={reducedMotion}
            />
```

**Target Ergo state.** Same structure; the root carries the chapter accent; the
top bar reads as a bright Ergo header; the completion takeover swaps the wax seal
for an Ergo medallion. **No user-visible label/text changes** (e2e-load-bearing).

**Exact changes (TSX only — styling lives in CSS):**

1. **Chapter accent.** Compute `data-ch` from a `lessonId → ch` map (table in §0.3)
   and apply to **both** `.lesson` roots:
   ```tsx
   const CHAPTER_BY_LESSON: Record<string, string> = {
     'lesson-first-heads': 'ch1',
     'lesson-pattern-hitting-times': 'ch1',
     'lesson-penneys-game': 'ch2',
     'lesson-gamblers-ruin': 'ch2',
     'lesson-states-streaks': 'ch3',
     'lesson-longer-patterns': 'ch3',
     'lesson-overlap-shortcut': 'ch3',
   }
   const chapter = CHAPTER_BY_LESSON[lesson.lessonId] // undefined → brand fallback
   // both returns:
   <div className="lesson" data-ch={chapter}>
   ```
2. **Completion takeover medallion** (see §2.13): replace
   `<MilestoneSeal meta={milestone} earned stamped />` with the Ergo
   `<ConceptMedallion meta={milestone} earned earning hueVar={chapter} />`
   (medallion-earn animation) — keeping the `.done-note` **"Lesson complete"**
   text node exactly. *(Cross-area dependency — see §2.13.)*
3. **Status banners** — no TSX change; they already use `<StatusNote tone>`.
   Styling is §2.11. Keep the three usages (offline / restoring / error) and the
   `role="status"` / `data-testid` contract.
4. **Keep** all `aria-label`s, the `←` back affordance (or upgrade to an SVG
   chevron — see §2.2), the `done-note__error` "Try again" `.btn--secondary`,
   and the focus-to-CTA-on-complete effect.

### 2.2 `shell.css` — `.topbar` (top bar)

**Current state** (`shell.css` 25–99): sticky grid `44px 1fr auto`, `background:
var(--paper-0)`, `border-bottom: 1px solid var(--rule)`, half-px border on 2dppx.
`.topbar__back` 44×44, `--graphite` glyph, hover `--paper-1`/`--ink`, disabled
`--graphite-soft`, **focus `outline: 2px solid var(--quill)`**. `.topbar__title`
12px uppercase `.04em` `--graphite` (an overline). `.streak` pill: `--rule`
border, `--font-mono`, `--graphite-soft`.

**Target Ergo state.** A clean bright header that matches `.ergo-topbar`
(`ergo-home.css` 14–30): inherits `--ergo-bg`, single `--ergo-line` hairline,
back button in `--ergo-ink-2` with a **`--ring-focus`** ring, title as an Inter
label tinted toward the chapter, and a detoxed compact streak (§2.12).

**Exact changes:**

- `.topbar`: `background: var(--ergo-bg)`; `border-bottom: 1px solid var(--ergo-line)`.
  Optionally add an on-scroll lift (progressive enhancement): when the page is
  scrolled, apply `box-shadow: var(--ergo-shadow-sm)` (needs a scroll listener or
  `:has()`-based heuristic — **optional**, default to hairline only). Drop the
  `@media (resolution >= 2dppx)` half-px tweak (the rgba `--ergo-line` already
  reads as a true hairline).
- `.topbar__back`: keep 44×44 + `--r-md`. `color: var(--ergo-ink-2)`; hover
  `background: var(--ergo-surface-2); color: var(--ergo-ink)`; disabled
  `color: var(--ergo-ink-3)`. **Replace focus** outline with:
  ```css
  .topbar__back:focus-visible { outline: 2px solid transparent; box-shadow: var(--ring-focus); }
  ```
  *(transparent outline preserves a visible focus indicator under Windows High
  Contrast / forced-colors, where `box-shadow` is dropped.)* **Optional polish:**
  swap the `←` text glyph for an inline SVG arrow (Home uses inline SVGs
  throughout) for crisper rendering; keep the `aria-label`.
- `.topbar__title`: keep compact, recolor to `color: var(--ergo-ink-2)`; consider
  `font-family: var(--font-sans)`, weight 600, `letter-spacing: .02em`, **sentence
  case** (drop `text-transform: uppercase`) so it reads as the lesson name rather
  than a system overline — or keep the overline but tint it `--lesson-accent`.
  Recommendation: Inter 13px/600 `--ergo-ink-2`, no uppercase. Keep ellipsis
  truncation.
- `.streak` wrapper: `border-color: var(--ergo-line)`; background
  `var(--ergo-surface)`; numeral in `tabular-nums`. Full streak detox in §2.12.

### 2.3 `PhaseRail.tsx` + `shell.css` — per-beat progress rail

**Current state.** `PhaseRail` emits an `<ol class="rail">` of `<li>` segments,
each `rail__seg rail__seg--{phase} rail__seg--{state}` with a `<span class="rail__bar">`;
`aria-current="step"` on the current segment.

```26:37:/Users/ericwu/Developer/brilliant.org/src/lesson/PhaseRail.tsx
    <ol className="rail" aria-label="Lesson progress">
      {segments.map((seg) => (
        <li
          key={seg.beatId}
          ref={seg.state === 'current' ? currentRef : undefined}
          className={`rail__seg rail__seg--${seg.phase.toLowerCase()} rail__seg--${seg.state}`}
          aria-current={seg.state === 'current' ? 'step' : undefined}
        >
          <span className="rail__bar" />
        </li>
      ))}
    </ol>
```

CSS (`shell.css` 113–179): a 4px-tall bar, colored **by phase** —
`bet→--quill`, `explore→--heads`, `model→--tails`, `prove→--correct` — with
`upcoming` dimmed (opacity .3) and `current` taller (6px) + `--e1` shadow.

**Problem.** With the remap, the rail is a 4-color rainbow of
indigo/amber/teal/green. In Ergo, **amber=`--heads` and teal=`--tails` are
reserved coin-outcome colors** and teal is also `--ch2`; reusing them for
unrelated phases is a semantic collision, and a multi-hue rail competes with the
chapter accent.

**Target Ergo state — recommended: state-colored, chapter-hued rail.** Color by
**progress state**, not phase: completed + current segments fill with
`--lesson-accent`; upcoming segments are `--ergo-line-2`. The current segment is
slightly taller with a soft chapter glow. Phase grouping survives as **rhythm
only** (an extra gap between phase groups), not as four hues. This is cleaner,
on-brand, and uses the `--seg--{state}` classes the component already emits — so
**no PhaseRail.tsx change is required** for the recommended path.

**Exact changes (CSS):**

```css
.rail__bar {
  display: block;
  height: 4px;
  border-radius: var(--r-pill);
  background: var(--ergo-line-2);              /* default = upcoming */
  transition: height var(--dur-micro) var(--ease-out),
              background-color var(--dur-micro) var(--ease-out);
}
/* Completed + current fill with the chapter hue */
.rail__seg--complete .rail__bar,
.rail__seg--current  .rail__bar { background: var(--lesson-accent); }
.rail__seg--upcoming .rail__bar { background: var(--ergo-line-2); }
/* Current: taller + soft chapter glow (not a hard shadow) */
.rail__seg--current .rail__bar {
  height: 6px;
  box-shadow: 0 0 0 3px var(--lesson-accent-glow);
}
.rail__seg:hover .rail__bar { filter: brightness(0.95); }
```

- **Remove** the four `.rail__seg--{phase} { --seg-tint }` color rules (or keep
  the classes inert for future use; they are not test-load-bearing). If you want a
  whisper of phase structure, add `margin-left` between the first segment of each
  phase group instead of recoloring.
- **Reduced motion:** the height/background transitions are covered by the global
  backstop; the `box-shadow` glow is static (fine). No pulse animation on the rail
  (keep ambient out of the chrome).
- **Alternative (if four-phase color is desired):** remap the phase tints to
  *non-coin* hues — `bet→--ch1`, `explore→--ch5` (violet), `model→--ch4` (amber
  is `--mark`, acceptable), `prove→--ok` — but this still fights the chapter
  accent and is **not recommended**.

### 2.4 `shell.css` — `.biaschip` ("Try bias" off-rail extension chip)

**Current state** (181–201): dashed `--rule` pill, `--font-mono`,
`--graphite-soft`; `.biaschip--active` solid `--mark` border + `--mark-wash` bg +
`--ink`. Rendered in `.rail-row` when `biasChipState(beat) !== 'hidden'`.

**Target Ergo state.** A quiet discovery chip. `--mark`/`--mark-tint` (amber) is
the correct Ergo "discovery / extension" signal, so the active state is already
on-system; idle should use Ergo neutrals.

**Exact changes:**

- `.biaschip`: `border: 1px dashed var(--ergo-line-2)`; `color: var(--ergo-ink-3)`;
  `font-family: var(--font-sans)` (12–13px, weight 500) — it is a label, not a
  formula; keep `--r-pill`. Ensure padding keeps a comfortable height (≥28px;
  it is non-interactive so 44px is not required, but give it air).
- `.biaschip--active`: `border: 1px solid var(--mark)`; `background:
  var(--mark-tint)`; `color: var(--ergo-ink)`. (Active state is conveyed by text
  + border-style + fill, not color alone.)

### 2.5 `shell.css` — `.prompt` (prompt strip)

**Current state** (203–231): padding `--s5 --s4 --s4` (`--s6 --s4 --s5` laptop).
`.prompt__kicker` mono uppercase `--quill-strong`. `.prompt__text`
`--font-display`, `clamp(1.375rem, 4vw, 2rem)`, **weight 500**, `-0.02em`,
`text-wrap: balance`. `.prompt__text code` `--paper-2` bg + `--r-xs`.

**Target Ergo state.** The hero of each beat: Space Grotesk at display-section
weight, chapter-tinted kicker, mono inline-code on a clean tray.

**Exact changes:**

- `.prompt__text`: bump **weight to 600** (Space Grotesk display weight used on
  Home titles); scale to `clamp(1.5rem, 4vw, 2.25rem)`; keep `-0.02em`,
  `font-optical-sizing: auto`, `text-wrap: balance`, `line-height: 1.2`. Add
  `font-variant-numeric: tabular-nums` (prompts often contain `E[HH]=6`-style
  figures). Color `var(--ergo-ink)`.
- `.prompt__kicker`: `color: var(--lesson-accent)`; keep mono **or** switch to
  Inter label (12px/600, `.06em`, uppercase) to match Home's chapter labels.
  Recommendation: Inter label, chapter-tinted.
- `.prompt__text code`: `background: var(--ergo-surface-2)`; `font-family:
  var(--font-mono)`; `border-radius: var(--r-xs)`; `color: var(--ergo-ink)`.
- Keep `<section class="prompt">` element + class — **e2e + VR anchor**
  (`smoke.spec.ts`, `vr/surfaces.spec.ts`). Do not rename.

### 2.6 `shell.css` — `.region` (interaction wrapper) + `.canvas-frame`

**Current state.** `.region` (235–250): `flex: 1 1 auto`, padding, laptop
`min-height: 55vh`; it is the beat↔beat view-transition target. `.canvas-frame`
(367–378): a 1px `--rule` framed box whose background is an **edge-confined faint
grid** (`linear-gradient(... --rule-faint ...)` 24px) over `--paper-0` — a
**paper-grain remnant**.

**Target Ergo state.** `.region` is an invisible layout wrapper (keep). The
canvas frame is a clean Ergo panel — **no grid texture**.

**Exact changes:**

- `.region`: no visual change; it inherits `--ergo-bg`. Keep padding + laptop
  `min-height`. (It is the `view-transition-name: beat-region` target — §3.)
- `.canvas-frame`: **remove the two grid `linear-gradient` layers and
  `background-blend-mode`.** Use `background: var(--ergo-surface)` (or
  `--ergo-surface-2` for a "well" feel under the canvas), `border: 1px solid
  var(--ergo-line)`, `border-radius: var(--r-lg)`, keep `overflow: hidden;
  line-height: 0`. *(`.canvas-frame` wraps Konva beats — it lives in `shell.css`
  so it is chrome here, but coordinate the inner Konva theme with Part 2 /
  `src/lesson/konva/theme.ts`.)*
- **Boundary note:** `shell.css` also defines beat primitives `.stub`, `.chips`,
  `.chip`, `.compare*`, `.token-row`, `.token` (252–363). These are **Part 2**
  (beat interiors); leave them here but only the `--press-deboss` on `.token`
  (353) and `.compare__card--on` (324) is a chrome-rule concern — see §0.1 (remove
  deboss). The rest is Part 2.

### 2.7 `BeatShell.tsx` + `beats.css` — sticky action bar & buttons (the core)

**Current state.** `BeatShell` renders `<footer class="actionbar">` with optional
secondary/tertiary (ghost by default) and a primary (`primary` variant default),
each `className={`btn btn--${variant}`}`.

```47:57:/Users/ericwu/Developer/brilliant.org/src/lesson/BeatShell.tsx
      <footer className="actionbar">
        {secondary && (
          <button
            type="button"
            className={`btn btn--${secondary.variant ?? 'ghost'}`}
            onClick={secondary.onClick}
            disabled={secondary.enabled === false}
          >
            {secondary.label}
          </button>
        )}
```

CSS (`beats.css` 699–763, `components.css` 8–20):
- `.actionbar`: sticky bottom, `gap --s3`, `background: var(--paper-0)`,
  `border-top: 1px solid var(--rule)`, safe-area padding.
- `.btn`: `flex 1 1 auto`, 48px, `--r-md`, Inter 600 16px, `transition: background,
  box-shadow`.
- `.btn--primary`: `--quill` fill / `--paper-0` text; hover `--quill-strong` +
  `--e1`.
- `.btn--ghost`: `flex 0 0 auto`, transparent, `--quill-strong` text; hover
  `--paper-1` + `--paper-shadow-1`.
- `.btn--secondary`: `--paper-0` fill, **`--ink` 1.5px border**, `--ink` text;
  active **`--press-deboss`** + scale.
- `.btn:disabled`: `--paper-2` / `--graphite-soft`.
- `.btn:focus-visible`: **`outline: 2px solid var(--quill)`**.
- `.btn:active`: **`--press-deboss`** + `transform: scale(.98)`.

**Target Ergo state.** A bright bottom **tray** with a chapter-hued primary, an
Ergo secondary/ghost, brand focus ring, and a **transform-only** press (no
deboss) — matching `.ergo-detail__cta` (`ergo-journey.css` 461–498).

**Exact changes:**

- `.actionbar`: `background: var(--ergo-surface)`; `border-top: 1px solid
  var(--ergo-line)`; **optional** upward lift to separate it from scrolling
  content: `box-shadow: 0 -2px 8px rgba(22,26,39,.05)` (there is no upward shadow
  token; this small inline value is acceptable, or omit and rely on the hairline).
  Keep `position: sticky; bottom: 0`, `flex-wrap: wrap`, safe-area padding. Drop
  the 2dppx half-px override.
- `.btn`: keep 48px / `--r-md` / Inter 600 16px. Update transition to include
  `transform`: `transition: background var(--dur-micro) var(--ease-out),
  box-shadow var(--dur-micro) var(--ease-out), transform var(--dur-micro)
  var(--ease-out)`.
- `.btn--primary`:
  ```css
  .btn--primary { background: var(--lesson-accent); color: #fff; }
  .btn--primary:hover:not(:disabled) { box-shadow: var(--ergo-shadow-sm); filter: brightness(0.96); }
  ```
  *(Chapter-agnostic hover via `filter` since only `--ch1` has a `-strong` token;
  matches `ergo-journey.css`'s `filter: brightness()` CTA hover. White text on
  `--ch2`/`--ch3`/`--ch1` all pass AA.)*
- `.btn--secondary` (`components.css`): `background: var(--ergo-surface)`;
  `border: 1.5px solid var(--ergo-line-2)` (lighter than full ink — Design System
  §Buttons); `color: var(--ergo-ink)`. Hover `background: var(--ergo-surface-2)` +
  `box-shadow: var(--ergo-shadow-sm)`. Active: **remove `--press-deboss`**, keep
  `transform: scale(.98)`.
- `.btn--ghost`: `color: var(--ergo-brand)` (ghost is a quiet utility — Hint / Show
  explanation — and the Design System specifies **brand**, not chapter). Hover
  `background: var(--ergo-surface-2)` (drop the paper-shadow). Keep `flex 0 0 auto`.
- `.btn:disabled`: `background: var(--ergo-surface-2)`; `color: var(--ergo-ink-3)`
  (1:1 rename).
- `.btn:focus-visible`:
  ```css
  .btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--ring-focus); }
  ```
- `.btn:active`: **drop `--press-deboss`**, keep `transform: scale(.98)`.
- **Preserve** `.actionbar`, `.btn`, `.btn--primary`, `.btn--secondary`,
  `.btn--ghost` class names and all button label text — **e2e-load-bearing**
  (`helpers.ts:8`, `remaining-lessons.spec.ts:9` locate `.actionbar .btn--primary`;
  many specs click by button label).
- **BeatShell.tsx:** no structural change required. Because `.btn--primary` now
  pulls `--lesson-accent`, every beat's primary auto-chapter-themes. *(Optional:
  add an icon slot to `PrimaryAction` for a trailing arrow on "Continue" like the
  Home CTA — defer unless desired; it would touch `BeatShell.tsx` + all beats.)*

### 2.8 `FeedbackStrip.tsx` + `beats.css` — inline feedback strip

**Current state.** `FeedbackStrip` renders `<div class="feedback feedback--{tone}">`
(`tone` ∈ correct/wrong/none) with `role="status" aria-live="polite"`, a
`.feedback__label` (e.g. "Correct" / "Hint 2" / "Answer"), `.feedback__text`,
and an optional `.feedback__retry` "Try again".

CSS (`beats.css` 608–664): `.feedback` `border-left: 3px solid --rule`, bg
`--paper-1`, **`box-shadow: var(--paper-shadow-2)`**. `--correct`/`--wrong`
variants tint left-border + bg; labels in mono uppercase `--correct-text` /
`--wrong-text`. `.feedback__retry` `--ink` 1.5px border, `--paper-0`, min 44px.

**Target Ergo state.** A flat, bright inline note (never a modal, no heavy
shadow): tinted left-border + tint fill + hairline, with a small **icon** added
for color-never-alone parity (Design System §Accessibility: feedback = color +
icon + text).

**Exact changes:**

- `.feedback`: `background: var(--ergo-surface)`; `border: 1px solid var(--ergo-line)`;
  `border-left: 3px solid var(--ergo-line-2)`; `box-shadow: var(--ergo-shadow-sm)`
  (or remove shadow entirely for a flatter note); keep `--r-md`, margins.
- `.feedback--correct`: `border-left-color: var(--ok)`; `background: var(--ok-tint)`.
- `.feedback--wrong`: `border-left-color: var(--bad)`; `background: var(--bad-tint)`.
- `.feedback__label`: keep small; `--correct-text` / `--wrong-text` (the darker
  variants keep AA on the tints). Mono is fine; Inter label also acceptable.
- `.feedback__retry`: restyle as a mini-secondary — `border: 1.5px solid
  var(--ergo-line-2)`; `background: var(--ergo-surface)`; `color: var(--ergo-ink)`;
  keep `min-height: 44px`; add `:focus-visible { outline: 2px solid transparent;
  box-shadow: var(--ring-focus) }` and `:active { transform: scale(.98) }`. Keep
  the **"Try again"** text.
- **`FeedbackStrip.tsx` (optional, recommended):** prepend a small inline status
  glyph in `.feedback__label` per kind — `✓` (correct), `!` (wrong/hint reveal),
  `•`/lightbulb (hint) — so feedback never relies on color alone. Wrap it
  `aria-hidden` since the label text already announces. This is the one in-scope
  TSX change to `FeedbackStrip`.

### 2.9 `CoinStream.tsx` + `beats.css` — coin stream & active-state chip

**Current state.** `CoinStream` renders `.coinstream` → `.coinstream__row`
(`aria-hidden`) of `m.span.coin.coin--{H|T}` (newest gets `.coin--latest`),
followed by the `m.span.coinstream__chip` (active prefix-state label), plus a
visually-hidden `aria-live` announcement. New coins spring in (`SPRING`); the
chip pops on state change (`SPRING_SOFT`).

CSS (`beats.css` 16–56): `.coin` 32×32 pill, mono 600; `.coin--H`
`--heads-tint`/`--heads`; `.coin--T` `--tails-tint`/`--tails`; `.coin--latest`
`--e1`. `.coinstream__chip` 1.5px `--quill` border, `--quill-tint` bg, mono,
`--quill-strong`.

**Target Ergo state.** Coins are already on-system (amber heads / teal tails,
always lettered — Design System coin semantics ✓). Refine borders and tie the
**state chip** to the chapter accent (it is a math/state object — Design System
tile category "state variable → brand", upgraded here to chapter for cohesion).

**Exact changes:**

- `.coin`: keep size/mono/letters. `border: 1px solid var(--ergo-line)` (or keep
  tint-only). Leave `.coin--H` / `.coin--T` mapping (these *are* `--heads`/`--tails`).
- `.coin--latest`: keep `--e1` → write as `var(--ergo-shadow-sm)`.
- `.coinstream__chip`: `border: 1.5px solid var(--lesson-accent)`; `background:
  var(--lesson-accent-tint)`; `color: var(--lesson-accent)` (or `--ergo-ink` for
  contrast); keep mono + `--r-md`. *(If you prefer the chip to stay brand-indigo
  as a fixed "state" signal independent of chapter, use `--ergo-brand`; chapter is
  recommended for journey cohesion.)*
- **CoinStream.tsx:** no change. Springs are compositor-only and already align with
  the `--flip-beat` Konva node pulse (§3). Reduced motion is handled globally.

### 2.10 `components.css` — boot screen, skeletons, (secondary button → §2.7)

**Current state.** `.bootscreen` (auth resolving): mono `--quill-strong` brand
kicker, `--graphite` caption, `.skeleton` lines. `.skeleton`: `--paper-2` base +
shimmer gradient using `--paper-1` (reduced-motion disables shimmer).

**Target Ergo state.** Boot + skeletons consistent with `ergo-home.css`'s
skeleton (`--ergo-surface` blocks + soft pulse).

**Exact changes:**

- `.bootscreen`: `min-height: 100dvh` (match `.lesson`). Recolor caption
  `var(--ergo-ink-2)`. **Recommendation:** replace the mono `--quill-strong`
  `.bootscreen__brand` kicker with the **"Ergo" wordmark in `--font-display`**
  weight 600 `--ergo-ink` (mirror `.ergo-wordmark`) so first paint already reads
  as Ergo.
- `.skeleton`: `background: var(--ergo-surface-2)`; shimmer gradient mid-stop
  `var(--ergo-surface)`; bump radius to `--r-md`. (Or adopt the `ergo-home.css`
  opacity-pulse approach for visual unity — either is acceptable; keep the
  `prefers-reduced-motion` guard.)
- `.btn--secondary`: covered in §2.7 (remove deboss, Ergo border/fill).
- **Boundary note:** `.walkboard__*` rules in `components.css` (86–128) are
  **Part 2** (L3 beat) — leave them; only the global token sweep (`--quill`,
  `--graphite*`) applies, which already resolves correctly.

### 2.11 `ui.css` — `.ui-status-note` (offline / restoring / error banners)

**Current state** (`ui.css` 27–50): `StatusNote` renders
`<p role="status" data-testid="status-note" data-tone class="ui-status-note">`.
CSS: left-border 2px, `--graphite` text; `info→--quill`(+`--quill-tint` border),
`offline→--graphite-soft`(+`--rule-faint`), `error→--wrong-text`(+`--wrong-tint`).
Consumed in `LessonPlayer` for the three persistence states.

**Target Ergo state.** A quiet inline note (Design System: "inline status notes
replace drop-shadow toasts"), Ergo-tinted, optionally icon-led for clarity.

**Exact changes (cross-file: `ui.css` is not in the listed scope but hosts these
in-scope banners — coordinate):**

- `.ui-status-note`: `color: var(--ergo-ink-2)`; `border-left: 2px solid
  var(--ergo-line-2)`; `font-family: var(--font-sans)`, caption size.
- `[data-tone='info']`: `color: var(--ergo-brand)`; `border-left-color:
  var(--ergo-brand-tint)`.
- `[data-tone='offline']`: `color: var(--ergo-ink-3)`; `border-left-color:
  var(--ergo-line)`.
- `[data-tone='error']`: `color: var(--bad)` (or `--wrong-text` for stronger
  contrast); `border-left-color: var(--bad-tint)`.
- **Preserve** `role="status"`, `data-testid="status-note"`, and `data-tone`
  (FROZEN API per `StatusNote.tsx`). **Optional:** add a small `aria-hidden` icon
  per tone for color-never-alone (text already conveys meaning).

### 2.12 Compact streak — `shell.css` `.streak` + `StreakTally.tsx` *(cross-file)*

**Current state.** `LessonPlayer` top bar renders `<StreakTally count compact>`.
`StreakTally` draws **pen tally-mark strokes** as inline SVG (a retired
notebook metaphor — ADR-0003 §"tally marks … retired"), wrapped by `.streak`.

**Target Ergo state.** A clean compact streak with **no tally marks, no flame** —
a count in tabular-nums + a short label, matching the Home weekly-streak voice
(`WeeklyStreak`).

**Exact changes:**

- `.streak` (shell.css): pill, `background: var(--ergo-surface)`, `border: 1px
  solid var(--ergo-line)`, `--r-pill`; numeral in `--font-mono` (or
  `--font-display`) with `font-variant-numeric: tabular-nums`, accent
  `var(--lesson-accent)` or `--ergo-brand`; label in `--ergo-ink-2`.
- **`StreakTally.tsx` (cross-file, `src/habit/`):** replace the tally-SVG render
  with a count + label (e.g. `12` + "day streak", em dash at 0). **Safe:** the
  Home uses `WeeklyStreak` (not `StreakTally`), so editing `StreakTally` only
  affects the lesson top bar; **no e2e asserts streak**. *(Alternative: introduce a
  small lesson-local compact streak and stop importing `StreakTally` in the
  lesson — but editing the shared component is simpler and removes a retired
  metaphor app-wide.)* **Flag for coordination** since `StreakTally` is owned by
  the habit area.

### 2.13 Completion takeover — `MilestoneSeal` → `ConceptMedallion` *(cross-file)*

**Current state.** The `done` takeover wraps `.done-note` (with the e2e-critical
**"Lesson complete ✓ …"** text) and renders `<MilestoneSeal meta earned stamped>`
— the **wax-seal ink-stamp** (`.seal--stamped`), a retired notebook metaphor
(ADR-0003).

```378:388:/Users/ericwu/Developer/brilliant.org/src/lesson/LessonPlayer.tsx
        <LessonCelebration>
          <div className="done-note">
            <p>
              Lesson complete ✓
              {mastered
                ? ' · fully mastered'
                : needsReview
                  ? ' · review recommended'
                  : ''}
              {completion?.unlockedLessonId ? ' · next lesson unlocked' : ''}
            </p>
```

**Target Ergo state.** The Ergo **concept medallion** (chapter-hued, math glyph)
performs the earn, paired with the chapter **light-streak** (motion §3). Wax
seals are retired in favor of medallions (Design System §Medallions; CONTEXT.md
"Concept-mastered medallion").

**Exact changes:**

- Replace `<MilestoneSeal meta={milestone} earned stamped />` with:
  ```tsx
  <ConceptMedallion meta={milestone} earned earning hueVar={chapter ?? 'ergo-brand'} />
  ```
  `milestone` is already loaded (`milestoneMeta(lesson.milestoneId)`); `chapter`
  is the §2.1 value. The medallion's earn animation lives in `ergo-home.css`
  (`.ergo-medallion--earning`).
- **Keep the `.done-note` `<p>` text node verbatim** ("Lesson complete …") — e2e
  asserts it (`helpers.ts:99,184`, `remaining-lessons.spec.ts:112`).
- `.done-note` (beats.css 765–770): recolor verdict to `var(--ergo-ink)`,
  Space Grotesk weight 600, centered; the medallion sits above. `.done-note__error`
  (role=alert) restyles via the §2.7 `.btn--secondary` changes; keep its text.
- **Flag:** `ConceptMedallion`/`MilestoneSeal` live in `src/habit/`; the medallion
  CSS is in `ergo-home.css` (Home scope, already shipped). This swap is the one
  structural cross-area change — coordinate with the habit/Home owners.
  *(Lower-effort fallback if coordination is blocked: keep `MilestoneSeal` but
  restyle `.seal*` to an Ergo medallion look — circular `--lesson-accent` fill +
  white mono glyph + `--ergo-shadow-sm`, drop `seal--stamped` ink animation. The
  medallion swap is preferred.)*

### 2.14 `beats-extended.css` — scope note

`beats-extended.css` is **almost entirely Part 2** (beat interiors: primers,
answer-entry, FST timeline, balance scale, race/walk/ledger heroes, retrieval
grid, sumtiles, ruler, triplet, etc.). **No chrome-specific rules require
Part-1 changes.** Its `--press-deboss` / `--paper-shadow*` / `--rule` / `--quill`
references are swept by the global token migration (Part 0/Part 2): replace
`--press-deboss` with transform-press or `--ergo-shadow-sm`, and rename the
aliases. The only chrome-adjacent rule is `.coinsim__stream--dim` (Track-A coin
dimming, 308–315) — leave as-is (opacity only).

---

## 3. Motion

The shell's motion budget: **one cinematic moment per screen**, compositor-only
(`transform`/`opacity`), ambient pausable, full reduced-motion parity. The
restyle keeps the existing choreography and only re-skins it + upgrades the
completion moment.

### 3.1 Beat enter / exit (view transition)

- **Current:** `withViewTransition(doAdvanceBeat, 'beat')` /
  `withViewTransition(doBackBeat, 'beat')`. `shell.css` tags `.region` with
  `view-transition-name: beat-region` under `:root[data-vt='beat']` and slides it
  (`vt-beat-out` → `translateX(-12px)`+fade; `vt-beat-in` ← `translateX(12px)`+fade)
  over `--dur-base` `--ease-inout`.
- **Ergo:** **keep verbatim** — it is already compositor-only and token-paced.
  Optionally rename `--dur-base`/`--ease-inout` usages (already Ergo). No change.

### 3.2 Home → lesson hero morph

- **Current:** `:root[data-vt='home-lesson']` shares `view-transition-name:
  lesson-hero` between `.lesson-hero-source` (the active CourseJourney card on
  Home — already tagged) and `.prompt__text` (lesson side), morphing over
  `--flip-beat` (520ms) `--ease-inout`.
- **Ergo:** keep. The morph target is `.prompt__text`, which is now heavier
  (Space Grotesk 600) — verify the FLIP still reads cleanly at the new weight/size
  (it should; the transition animates the group box, not glyph weight). No rule
  change required; re-check visually after §2.5.

### 3.3 CoinStream synchronized flip (the signature)

- **Current:** new coin springs in (`SPRING`, stiffness 520/damping 30); the
  active-state chip pops on state change (`SPRING_SOFT`), choreographed with the
  Konva node-pulse + edge-travel on the same flip (`--flip-beat`).
- **Ergo:** keep the springs (compositor `transform`/`opacity`). The only skin
  change is the chip now wears `--lesson-accent` (§2.9). Reduced motion is honored
  via `<MotionConfig reducedMotion="user">` + the global CSS backstop. No timing
  change.

### 3.4 Completion celebration

- **Current:** `LessonCelebration` springs the done card in (`SPRING_CELEBRATE`,
  the "licensed bounce"); confetti already removed; the wax-stamp seal was the
  cinematic beat.
- **Ergo target:** swap the cinematic beat to the **medallion earn** (scale
  0.8→1.0 + `--ergo-shadow-md` flash, via `.ergo-medallion--earning`, §2.13)
  **plus a chapter-hue light-streak arc** crossing the card on `--stamp-beat`
  (480ms; the generated `--stamp-beat` is the celebrate clock). The light-streak
  is a GSAP/Motion compositor-only `transform` sweep in `var(--lesson-accent)`.
  Keep `LessonCelebration`'s spring as the card entrance. **No confetti, no paper
  bits.** *(The light-streak is the one net-new motion; if deferred, the medallion
  earn alone satisfies the Ergo completion bar.)*

### 3.5 Reduced-motion parity (must preserve)

- `withViewTransition` already **skips** the transition (calls `fn()` directly)
  under `prefers-reduced-motion` — both beat slide and hero morph collapse to an
  instant cut.
- The global backstop `* { animation-duration: .01ms !important;
  transition-duration: .01ms !important }` (end of `beats.css`) stays.
- All springs run under `<MotionConfig reducedMotion="user">`; the medallion-earn
  has a `@media (prefers-reduced-motion: reduce) { animation: none }` rule in
  `ergo-home.css`. The light-streak (3.4) **must** branch to instant/none under
  reduced motion. The lesson must be fully completable at zero motion.

---

## 4. Accessibility

- **≥44px targets.** `.topbar__back` 44×44 ✓ (keep). `.btn` 48px ✓. `.feedback__retry`
  `min-height: 44px` ✓ (keep on restyle). Non-interactive elements (coins, the
  `.coinstream__chip` label, `.biaschip`, rail `<li>`s) are exempt but should keep
  comfortable sizing. If the back `←` becomes an SVG button, keep the 44×44 box.
- **Focus rings.** Migrate every `outline: 2px solid var(--quill)` in scope
  (`.topbar__back`, `.btn`, add to `.feedback__retry`) to
  `outline: 2px solid transparent; box-shadow: var(--ring-focus)` so focus is
  visible in both normal and forced-colors modes. Focus ring is **brand indigo**
  on all targets regardless of chapter.
- **Color never alone.** Coins carry H/T letters ✓. Feedback adds an icon to the
  label (§2.8) on top of text + color. Rail "current" uses `aria-current="step"` +
  a height change (not hue alone). `.biaschip--active` uses text + border-style +
  fill. Status notes carry text (+ optional icon). The chapter accent is always
  paired with the lesson title / context, never the sole signal.
- **aria-live.** Preserve `FeedbackStrip` `role="status" aria-live="polite"`,
  `CoinStream`'s visually-hidden `role="status"` announcement, and `StatusNote`
  `role="status"`. **Recommendation:** add a visually-hidden `aria-live` (or
  `role="status"`) wrapper around the completion verdict so "Lesson complete" is
  announced (today focus moves to the CTA, which helps but does not announce the
  verdict).
- **200% zoom / text scaling.** The desktop `--fs: 1.15` bump + `clamp()` prompt
  scale must not clip core actions. The top-bar grid (`44px 1fr auto`) relies on
  the rail's `overflow-x: auto` and the title's ellipsis — keep both. The
  `.actionbar` `flex-wrap: wrap` lets buttons stack at large scales — keep. Verify
  at 200% that the rail scrolls (not clips) and the action bar wraps rather than
  overflowing.

---

## 5. e2e / VR risk table (Part-1 scope)

Greps run against `e2e/` (`helpers.ts`, `smoke.spec.ts`, `remaining-lessons.spec.ts`,
`vr/surfaces.spec.ts`). **Load-bearing selectors/text in my scope:**

| Selector / text | Used by (e2e) | In-scope file | Restyle impact | Action |
|---|---|---|---|---|
| `.actionbar .btn--primary` | `helpers.ts:8`, `remaining-lessons.spec.ts:9` | `beats.css` | restyle only (bg/border/shadow/press) | **PRESERVE** class names `.actionbar`, `.btn`, `.btn--primary` |
| `.btn--secondary`, `.btn--ghost` | clicked via button label/role | `beats.css`/`components.css` | restyle only | **PRESERVE** class names |
| Button **labels** "Continue/Check/Finish/Flip/Lock prediction/Reveal recap/Run N…/Now your turn/Step/Back to course path" | many specs (`getByRole('button',{name})`) | `BeatShell`/beats (Part 2) + `LessonPlayer` | restyle does not touch text | **PRESERVE** all label text + roles |
| `section.prompt` (anchor) | `vr/surfaces.spec.ts:32,38` | `shell.css` + `LessonPlayer` | restyle padding/type | **PRESERVE** `<section class="prompt">` element + class |
| `.prompt__text` | `smoke.spec.ts:11` | `shell.css` + `LessonPlayer` | restyle type; also VT morph target | **PRESERVE** class |
| `.done-note` + "Lesson complete" | `helpers.ts:99,184`, `remaining-lessons.spec.ts:112` | `beats.css` + `LessonPlayer` | restyle + medallion swap | **PRESERVE** class **and** the exact "Lesson complete" text node |
| `.hint-note--mark` | `helpers.ts:50,130`, `remaining-lessons.spec.ts:107` | `beats.css` (coin-sim hint) | Part 2 content; restyle won't rename | **PRESERVE** (note: Part 2) |
| `data-testid="status-note"`, `data-tone`, `role="status"` | not asserted today, **FROZEN API** | `StatusNote.tsx` / `ui.css` | restyle colors only | **PRESERVE** attributes |

**Not load-bearing (safe to restyle; no e2e selector depends on them):**
`.topbar*`, `.rail*` (+ `aria-label="Lesson progress"`), `.region`, `.coin*`,
`.coinstream*`, `.streak`, `.biaschip`, `.feedback*` (the wrapper; `--mark` hint
is separate), `.canvas-frame`, `.celebration`, `.bootscreen*`, `.skeleton`, back
button `aria-label`s. **No renames are needed in Part 1** — all proposed changes
are restyle-in-place, so no spec edits are required.

**Visual-regression (VR) — MUST re-baseline.** Every chrome change repaints the
lesson surfaces snapshotted by `e2e/vr/surfaces.spec.ts`:

- `e2e/vr/__screenshots__/vr-desktop/dev-lesson-flagship.png`
- `e2e/vr/__screenshots__/vr-desktop/dev-lesson-penneys.png`
- `e2e/vr/__screenshots__/vr-mobile/dev-lesson-flagship.png`
- `e2e/vr/__screenshots__/vr-mobile/dev-lesson-penneys.png`

After implementing, **re-capture** with the VR config
(`playwright.vr.config.ts`, e.g. `--update-snapshots`) and **review the diffs**
to confirm the change is intentional. `dev-home.png` is Home (out of scope) and
should **not** change (Part 1 touches no Home file); if it moves, something leaked
into shared tokens — investigate. *(No new lessons are snapshotted yet; if L3–L6
VR is added, expect those to baseline against the restyled chrome.)* The user runs
Playwright manually — call this out in the implementing PR.

---

## 6. File-by-file change checklist (Part-1 scope)

A developer can execute these in order. Each is restyle-in-place unless marked
**[TSX]** or **[cross-file]**.

**A. `src/styles/surfaces/shell.css`**
- [ ] Add the `.lesson` / `.lesson[data-ch='chN']` chapter-accent block (§0.3).
- [ ] `.topbar`: `--ergo-bg` bg, `--ergo-line` bottom hairline; drop 2dppx half-px rule; (optional) on-scroll `--ergo-shadow-sm` (§2.2).
- [ ] `.topbar__back`: `--ergo-ink-2`/hover `--ergo-surface-2`+`--ergo-ink`/disabled `--ergo-ink-3`; focus → `--ring-focus` (transparent outline) (§2.2).
- [ ] `.topbar__title`: `--ergo-ink-2`, Inter 600, drop uppercase (or chapter-tint) (§2.2).
- [ ] `.streak`: Ergo pill (`--ergo-surface`/`--ergo-line`), tabular-nums accent (§2.12).
- [ ] `.rail__bar` + `--seg--{state}`: state-colored chapter rail; remove per-phase hues; current = +height + chapter glow (§2.3).
- [ ] `.biaschip` / `--active`: Ergo neutrals idle, `--mark`/`--mark-tint` active (§2.4).
- [ ] `.prompt__text` (weight 600, scale, tabular-nums), `.prompt__kicker` (chapter accent), `.prompt__text code` (`--ergo-surface-2`) (§2.5).
- [ ] `.canvas-frame`: remove grid gradients + blend-mode; clean `--ergo-surface` + `--ergo-line` + `--r-lg` (§2.6).
- [ ] Remove `--press-deboss` from `.token` (353) and `.compare__card--on` (324) — replace with `--ergo-shadow-sm` at rest / transform press (§0.1; coordinate boundary with Part 2).
- [ ] View transitions (`:root[data-vt=...]`): **no change** (§3.1–3.2).

**B. `src/styles/surfaces/beats.css`**
- [ ] `.actionbar`: `--ergo-surface` tray, `--ergo-line` top hairline, (optional) upward lift; drop 2dppx rule (§2.7).
- [ ] `.btn` transition: add `transform`; `.btn--primary` → `--lesson-accent` fill + hover shadow/brightness (§2.7).
- [ ] `.btn--ghost` → `--ergo-brand` text, `--ergo-surface-2` hover (§2.7).
- [ ] `.btn:disabled` → `--ergo-surface-2`/`--ergo-ink-3`; `.btn:focus-visible` → `--ring-focus`; `.btn:active` → drop deboss, keep `scale(.98)` (§2.7).
- [ ] `.feedback*`: `--ergo-surface`+hairline+`--ergo-shadow-sm`; `--ok`/`--bad` tints; `.feedback__retry` mini-secondary + `--ring-focus` (§2.8).
- [ ] `.coin` border `--ergo-line`; `.coin--latest` `--ergo-shadow-sm`; `.coinstream__chip` → `--lesson-accent` trio (§2.9).
- [ ] `.done-note` → `--ergo-ink`, Space Grotesk 600, centered; keep text (§2.13).
- [ ] Keep the reduced-motion backstop block at file end.

**C. `src/styles/surfaces/components.css`**
- [ ] `.btn--secondary`: `--ergo-surface` fill, `--ergo-line-2` 1.5px border, `--ergo-ink` text; hover `--ergo-surface-2`+shadow; active drop deboss + `scale(.98)` (§2.7).
- [ ] `.skeleton`: `--ergo-surface-2` base, `--ergo-surface` shimmer, `--r-md` (§2.10).
- [ ] `.bootscreen`: `100dvh`, `--ergo-ink-2` caption; replace mono kicker with Space Grotesk "Ergo" wordmark (§2.10).

**D. `src/styles/surfaces/beats-extended.css`**
- [ ] **No Part-1 chrome change** (Part 2). Token sweep handled there (§2.14).

**E. `src/styles/surfaces/ui.css` [cross-file]**
- [ ] `.ui-status-note` + tones → Ergo colors; preserve `role`/`data-testid`/`data-tone` (§2.11).

**F. `src/lesson/LessonPlayer.tsx` [TSX]**
- [ ] Add `CHAPTER_BY_LESSON` map + `data-ch={chapter}` on **both** `.lesson` roots (§0.3 / §2.1).
- [ ] Completion takeover: `MilestoneSeal` → `ConceptMedallion` (hue = chapter); keep `.done-note` "Lesson complete" text (§2.13) **[cross-file dep]**.
- [ ] No change to status-banner wiring, labels, or aria.

**G. `src/lesson/FeedbackStrip.tsx` [TSX, optional]**
- [ ] Prepend an `aria-hidden` tone icon to `.feedback__label` (color-never-alone) (§2.8).

**H. `src/lesson/PhaseRail.tsx`**
- [ ] **No change** (recommended state-colored rail uses existing `--seg--{state}` classes) (§2.3).

**I. `src/lesson/CoinStream.tsx`**
- [ ] **No change** (chip re-skin is CSS) (§2.9).

**J. `src/lesson/BeatShell.tsx`**
- [ ] **No change required** (primary auto-themes via `.btn--primary` → `--lesson-accent`). Optional trailing-arrow icon slot deferred (§2.7).

**K. Cross-file flags (coordinate with habit / Home owners)**
- [ ] `src/habit/StreakTally.tsx`: remove tally-mark SVG; render count + label (lesson top bar only; no e2e/Home regression) (§2.12).
- [ ] `src/habit/ConceptMedallion.tsx` + `ergo-home.css` `.ergo-medallion*`: reused by the completion takeover (already shipped; verify `hueVar`/`earning` props) (§2.13).

**L. Verification (run manually)**
- [ ] `dev/lesson` (flagship) + `dev/lesson/lesson-penneys-game` look Ergo on desktop + mobile; chapter accent visibly differs (indigo L1 vs teal L2 vs coral L4+).
- [ ] e2e functional specs pass unchanged (no selector/text drift).
- [ ] Re-baseline the four lesson VR snapshots; confirm `dev-home.png` is unchanged.
- [ ] Reduced-motion project: beats complete; no slide/spring; completion still reachable.

---

### Appendix — token cheat-sheet for implementers

Use Ergo names (left); these resolve via `tokens.generated.css`. Avoid
`--press-deboss` (remove), `--letterpress-ink`, `--edge-highlight`.

- Surfaces: `--ergo-bg` (page) · `--ergo-surface` (card/tray) · `--ergo-surface-2` (well)
- Ink: `--ergo-ink` · `--ergo-ink-2` · `--ergo-ink-3`
- Lines: `--ergo-line` (hairline) · `--ergo-line-2` (divider)
- Brand: `--ergo-brand` · `--ergo-brand-strong` · `--ergo-brand-tint`
- Chapter accent (set on `.lesson[data-ch]`): `--lesson-accent` · `--lesson-accent-tint` · `--lesson-accent-glow`
- Chapters: `--ch1..ch5` (+`-tint`) — ch1 indigo, ch2 teal, ch3 coral, ch4 amber
- Semantic: `--ok`/`--ok-tint` · `--bad`/`--bad-tint` · `--mark`/`--mark-tint` (+ legacy `--correct-text` `--wrong-text` for AA label contrast)
- Coins: `--heads`/`--heads-tint` (amber) · `--tails`/`--tails-tint` (teal)
- Depth: `--ergo-shadow-sm` · `--ergo-shadow-md` · `--ergo-shadow-lg` · `--ring-focus`
- Radius: `--r-xs 4` · `--r-sm 8` · `--r-md 12` · `--r-lg 16` · `--r-xl 20` · `--r-pill`
- Space: `--s1 4` … `--s8 64` · Type: `--font-display` (Space Grotesk) · `--font-sans` (Inter) · `--font-mono` (JetBrains Mono)
- Motion: `--dur-micro/base/slow/tell` · `--ease-out/spring/inout` · `--flip-beat 520` · `--stamp-beat 480`
