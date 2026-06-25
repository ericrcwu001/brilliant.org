# Ergo Lesson Restyle Brief — Part 2: Beats & Math Visualizations

> **Scope:** the in-lesson experience — every beat in `src/lesson/beats/*`, the equation
> tiles/slots, the sliders/number-lines, the Konva visualizations (`StateGraph`, `SimChart`,
> `BiasChart`), the shared math-viz language, and the beat CSS
> (`src/styles/surfaces/beats.css` + `beats-extended.css`). This is the **"math is the art"**
> centerpiece — the lesson screens must hit the same premium bar as the reimagined signed-in
> Home.
>
> **Companion docs:** `docs/ui_design_system.md` (the Ergo spec, the authority), Part 1 of this
> brief (Home/journey — when written), `docs/adr/0003-ergo-bright-reimagining.md` (rationale),
> `CONTEXT.md` (glossary).
>
> **This is a planning document. It changes no code.** Every recommendation is written so an
> implementer can execute it file-by-file with the e2e/VR guardrails in §5.

---

## 0. TL;DR — what actually has to happen

The global tokens, fonts, and the Konva `theme.ts` literals were **already** swapped to Ergo
(cool near-white base, indigo brand, chapter hues, Space Grotesk / Inter / JetBrains Mono). So
the lesson **already renders in Ergo colors**. What remains is *elevation*, not recoloring:

1. **Plumb the chapter hue into the lesson.** Today every beat and every canvas is hard-wired to
   indigo (`--quill` / `C.quill`). Nothing keys off the lesson's chapter. The single biggest
   visible win is making **L2/L3 read teal** and **L4/L5/L6 read coral** — accent borders, slot
   states, slider thumbs, graph nodes, chart curves, hero bars. (L0/L1 stay indigo, so the
   flagship barely moves — see the VR note in §5.)
2. **Retire the notebook-era depth language inside lessons.** `--press-deboss` (inset deboss),
   the `--mark-wash` highlighter washes, and the "deboss-settle" drop animation are Living
   Notebook holdovers still living in `beats.css`/`beats-extended.css`/`shell.css`. Replace with
   the Ergo soft-shadow + chapter-tint system per `docs/ui_design_system.md` §"Depth & Shadows".
3. **Make the canvases gorgeous and consistent with Home.** The in-lesson `StateGraph` should
   read as the *same object* as the journey thumbnail (`MathViz.tsx`): chapter-tinted nodes,
   2px strokes, JetBrains Mono labels, tasteful active glow, true device-pixel hairlines,
   tabular numerals.

Everything below is the detailed version of those three moves, plus the family-by-family plan,
the e2e/VR risk table, and the file-by-file checklist.

---

## 1. North star — "math is the art" for in-lesson visuals

The Home momentum band and journey are rich; the lesson is **focused** (one-thing-per-beat) but
must be held to the *same craft bar*. In the lesson, the math object **is** the hero: the state
machine, the converging simulation curve, the equation the learner assembles, the random walk
between two walls. These are the proprietary illustration system — they should look authored,
precise, and cinematic, never like generic form controls on a white page.

### 1.1 Depth discipline (soft, layered — never deboss/paper)

Per `docs/ui_design_system.md` §"Depth & Shadows", the only depth language is the shadow token
trio. Inside lessons:

| Use | Token (Ergo) | Today (replace) |
|-----|--------------|-----------------|
| Resting tiles, cards, chips, canvas frame | `--ergo-shadow-sm` (`--shadow-sm`) | mixed: `--press-deboss`, `--e1` |
| Tile in flight (drag), hovered card, feedback strip | `--ergo-shadow-md` | `--paper-shadow-2` |
| Modal/dialog/celebration overlays | `--ergo-shadow-lg` | `--paper-shadow-3` |
| Focus ring (all interactive targets) | `--ring-focus` | `outline: 2px solid var(--quill)` |

**Hard removals (notebook depth):**

- **`--press-deboss`** (`inset 0 1px 2px rgba(22,26,39,.12)`) — appears on `.btn:not(:disabled):active`
  (`beats.css:761`), `.slot--filled` (`beats.css:992`), the `.slot--drop-flash` keyframe end state
  (`beats.css:1102`), `.token` (`shell.css:353`), `.compare__card--on` (`shell.css:324`), and
  `.balance__range` (`beats-extended.css:650`). The Ergo `:active` is **compositor-only
  `transform: scale(0.98)`** with no inset shadow. A filled slot/tile gets a *raised* soft
  shadow (`--ergo-shadow-sm`), not a pressed-in look.
- **Highlighter `--mark-wash`** (`rgba(224,152,46,.18)`) as a *background wash* — `.hint-note--mark`
  (`beats.css:67`), `.slot--glow` (`beats.css:1036`), `.recap__mark` (`beats.css:525`),
  `.numline__marklabel` (`beats.css:1281`), `.eqprogress--invalid` (`beats.css:812`), and the
  Konva focus beam in `CourseSpine.tsx:173`. The semantic intent (hint / discovery) is fine, but
  switch to the **solid** `--mark-tint` fill + `--mark` border/left-rule so it reads as a clean
  Ergo callout, not a marker swipe.
- **Deboss-settle animation** — the `.slot--drop-flash` keyframe (`beats.css:1097-1104`) animates
  *from* `--paper-shadow-2` *to* `--press-deboss`. Replace with the spec's tile-snap: a brief
  **chapter-color border flash** + settle to `--ergo-shadow-sm` (see §2.2).
- **`canvas-frame` grid texture** (`shell.css:367-378`) is a faint `feTurbulence`-era cousin: two
  `linear-gradient` hairline grids at 24px. The Ergo surface is flat cool-white. **Recommendation:**
  keep an *extremely* faint plot grid only inside chart beats (it aids reading), but drop the grid
  from non-chart canvases (state graph, overlap, walk) so they sit on a clean
  `--ergo-surface`/`--ergo-surface-2` panel with `--ergo-line` border + `--ergo-shadow-sm`.

### 1.2 Gradient & glow discipline (tasteful, semantic, ≤ one per surface)

Bright + colorful ≠ loud. Gradients/glows are reserved for the *living* math, never chrome:

- **Coin sheen.** The Home mock (`mock/ergo-home.html:730-736`) gives the coin a `radialGradient`
  off-white→tint highlight. Adopt the same subtle sheen on in-lesson coin tokens (`.coin`) and the
  Konva state-graph active node — a single soft radial, not a metal gradient.
- **Active node glow.** The active state-machine node gets a soft chapter-hue halo (Konva
  `shadowColor`/`shadowBlur`, or the CSS `--ch-glow` already defined per `[data-ch]` in
  `ergo-journey.css:9-12`). One node, low amplitude, pulses on flip (`--flip-beat`).
- **Simulation area + head.** `SimChart` already paints a vertical gradient area under the
  empirical curve and a glowing head bead (`SimChart.tsx:220-258`) — keep this, just re-key the
  color from indigo to the chapter accent.
- **Connector/progress fills** can use chapter-gradient (matching the journey rail), but inside a
  beat keep flat accent fills unless the gradient *is* the data (e.g. the L2 TournamentHeatmap
  diverging scale `C.heatLo → C.heatMid → C.heatHi`).

**Never:** drop shadows on text, gradient buttons, glow on resting controls, more than one
cinematic gradient per beat.

### 1.3 Chapter color-coding is the throughline (the central change)

`docs/ui_design_system.md` §"Chapter color-coding" mandates that *every* lesson surface accents
in its chapter hue. The lesson→chapter map already exists in code:

```
src/pages/studyDesk.model.ts
  ERGO_CHAPTERS / chapterForLesson(lessonId) → { hueVar: 'ch1' | 'ch2' | 'ch3' }
  ch1 indigo : lesson-first-heads, lesson-pattern-hitting-times       (L0, L1)
  ch2 teal   : lesson-penneys-game, lesson-gamblers-ruin              (L2, L3)
  ch3 coral  : lesson-states-streaks, lesson-longer-patterns,
               lesson-overlap-shortcut                                (L4, L5, L6)
```

Today nothing consumes it inside the lesson. **Recommended mechanism (do this once, reuse
everywhere):**

**A. DOM/CSS side — a local `--accent` triad keyed by `data-ch`.**

1. In `LessonPlayer.tsx`, set the chapter attribute on the lesson root (`<div className="lesson">`,
   `LessonPlayer.tsx:426` and the `done` branch at `:361`):
   ```tsx
   import { chapterForLesson } from '../pages/studyDesk.model'
   const ch = chapterForLesson(lessonId)?.hueVar ?? 'ch1'
   // ...
   <div className="lesson" data-ch={ch} data-reduced={reducedMotion ? '' : undefined}>
   ```
2. Add a per-chapter accent block (new rules, near the top of `beats.css`, mirroring the existing
   `[data-ch]` precedent in `ergo-journey.css:8-12`). There is **no `--chN-strong` token today**,
   so define the strong step with `color-mix` (or add `--chN-strong` to the token pipeline — see
   §6):
   ```css
   .lesson[data-ch='ch1'] { --accent: var(--ch1); --accent-tint: var(--ch1-tint); --accent-glow: rgba(79,70,229,.18); }
   .lesson[data-ch='ch2'] { --accent: var(--ch2); --accent-tint: var(--ch2-tint); --accent-glow: rgba(13,148,136,.18); }
   .lesson[data-ch='ch3'] { --accent: var(--ch3); --accent-tint: var(--ch3-tint); --accent-glow: rgba(240,88,74,.18); }
   .lesson { --accent: var(--ch1); --accent-tint: var(--ch1-tint); --accent-strong: var(--ergo-brand-strong); --accent-glow: rgba(79,70,229,.18); }
   .lesson[data-ch] { --accent-strong: color-mix(in oklch, var(--accent), black 12%); }
   ```
3. **Sweep `--quill` → `--accent`, `--quill-tint` → `--accent-tint`, `--quill-strong` →
   `--accent-strong`** across `beats.css`, `beats-extended.css`, and the lesson-shell parts of
   `shell.css` (`.prompt__kicker`, `.compare__card`, `.token--state`, `.token-row`/`.token`,
   `.region`/`.stub`). This is a mechanical find/replace **of token names inside values only** —
   it changes **no class names**, so it is e2e-safe (see §5). Because `--quill` == `--ch1` ==
   indigo, **L0/L1 are pixel-identical** after the sweep; only L2–L6 change.

**B. Konva side — pass the accent hex down as a prop.**

The Konva renderer can't read CSS variables, so `theme.ts` mirrors tokens. Add a resolver and
thread an `accent` prop from `LessonPlayer` → `BeatView` → each canvas:

```ts
// src/lesson/konva/theme.ts  (proposed addition)
export const CHAPTER_ACCENT = {
  ch1: { base: TOKENS.ch1, tint: TOKENS.ch1Tint, glow: 'rgba(79,70,229,0.20)' },
  ch2: { base: TOKENS.ch2, tint: TOKENS.ch2Tint, glow: 'rgba(13,148,136,0.20)' },
  ch3: { base: TOKENS.ch3, tint: TOKENS.ch3Tint, glow: 'rgba(240,88,74,0.20)' },
} as const
export const accentFor = (hueVar: string) =>
  CHAPTER_ACCENT[hueVar as keyof typeof CHAPTER_ACCENT] ?? CHAPTER_ACCENT.ch1
```

`LessonPlayer` already computes `ch`; pass `accent={accentFor(ch)}` into `BeatView`, and from
there into `StateGraph` / `SimChart` / `BiasChart` / the inline SVGs (`WalkBoardBeat`,
`BalanceSolveBeat`). Default to ch1 so the flagship is unchanged.

> **Decision to confirm with design:** edges stay **coin-semantic** (`H` gold `--heads`, `T` teal
> `--tails`) in *every* chapter — they encode the flip, not the chapter, and the spec forbids
> color-only meaning, so they always carry the H/T letter. Only **nodes, fills, active states,
> curves, thumbs, bars** take the chapter accent. (Note the teal collision: in ch2 the accent and
> the `T` edge are both teal — keep nodes filled-tint + the `T` edge a saturated stroke so they
> stay distinct, and rely on the H/T glyph.)

### 1.4 Consistency with the Home `MathViz` system

The Home journey thumbnails (`src/lesson/mathviz/MathViz.tsx`) and the in-lesson Konva canvases
are **two renderers of one glyph system**. They must look like the same product. Today they
diverge: `MathViz` tints every node in the chapter hue at `fillOpacity≈0.12` with a 1.8px
`currentColor` stroke and JetBrains Mono labels; the in-lesson `StateGraph` draws **gray** nodes
(`C.paper0` fill, `C.graphite` stroke) and a green absorbing ring. §3 and §4 close that gap.

---

## 2. Per-interaction-family restyle plan

The 21 live beats (dispatcher `src/lesson/beats/index.tsx`) group into seven interaction
families. For each: the current treatment, the target Ergo treatment, exact classes/tokens, and
the state/motion/a11y rules. **All class names are preserved** unless explicitly flagged.

### Family A — Selection cards (prediction / compare / MCQ-style / retrieval)

**Beats:** `PredictionBeat` (`.chips`, `.chip--select`, `.chip--on`), `PatternPickBeat`
(`.compare`, `.compare__card`, `.compare__card--tap`, `.compare__card--on`, `.compare__preview`),
`DominanceWheelBeat` (`.wheel__options .token`), `RecapBeat` retrieval (`.chips`, `.chip--select`,
`.chip--correct`, `.chip--wrong`). Shared option look lives in `shell.css` (`.chip`, `.compare__*`,
`.token`) + `beats.css` (`.chip--select`, `.chip--on`, `.chip--correct`, `.chip--wrong`).

| Aspect | Current | Target (Ergo) |
|--------|---------|---------------|
| Resting card | `1px solid --rule`, `--paper-0`, no shadow (`shell.css:277-286`) | `1px solid --ergo-line`, `--ergo-surface`, `--ergo-shadow-sm`, `--r-md` |
| Hover | `border-color: --quill` (`beats.css:685`) | `border-color: --accent`, lift to `--ergo-shadow-md`, `transform: translateY(-1px)` (compositor-only) |
| Selected (`--on`) | `1.5px --quill` + `--quill-tint` (`beats.css:688-693`) | `1.5px --accent` + `--accent-tint` bg + `--accent-strong` text |
| Compare `--on` | `--press-deboss, 0 0 0 3px --quill-tint` (`shell.css:324`) | **drop deboss**; `box-shadow: 0 0 0 3px var(--accent-tint)` ring + `--ergo-shadow-sm` |
| Correct / wrong | `--correct`/`--wrong` tints (`beats.css:412-427`) | unchanged values (`--ok`/`--bad` are semantic, not chapter) — keep, but ensure the `✓`/`✗` glyph + text accompany color (already does in `RecapBeat`) |
| Focus | `outline: 2px solid --quill` (`beats.css:694`) | `box-shadow: var(--ring-focus)` (brand indigo 3px), `outline: none` |
| `.compare__card` resting border is `1.5px --quill` even when not selected (`shell.css:298`) | always indigo | → `--accent`; consider de-emphasizing to `--ergo-line` until tapped so the tinted fill carries identity |

**Reduced motion:** hover lift and `:active` scale collapse under the global backstop
(`beats.css:1343`). Keep selection feedback color-only.

### Family B — Equation tiles + slots (the signature interaction)

**Beats/CSS:** `EquationTilesBeat` (`.eqtiles`, `.eqline`, `.eqline--build`, `.eqline__body`,
`.eqline__lhs`, `.eqline__op`, `.slot`, `.slot--{const,prob,var}`, `.slot--{filled,empty,selected,
glow,locked,correct,wrong,drop-flash,dragover}`, `.token`, `.token--{const,prob,state,placed,
selected}`, `.token-row`, `.palette`); shared `.token`/`.token-row` in `shell.css:335-363`.
Adjacent tile/slot users: `SumTilesBeat` (`.sumtiles__slot`, `.sumtiles__slot--filled`),
`RetrievalGridBeat` (`.retgrid__slot--*`). This is the `docs/ui_design_system.md` §"Equation
tiles (signature)" + §"Equation slots" surface — hold it to the highest bar.

**Tiles (`.token`) — target:**
- Face `--ergo-surface`, `1px solid --ergo-line-2`, `--r-sm`, JetBrains Mono 500, **`--ergo-shadow-sm`
  at rest** (replace the `--press-deboss` on `.token`, `shell.css:353`).
- **Category coloring** (spec): state variable → `--ergo-brand`/`--accent`; probability →
  `--heads`; constant → `--ergo-ink-3`; operator → `--ergo-ink`. Today `.token--state` →
  `--quill` (`shell.css:356`), `.token--prob` → `--heads`, `.token--const` → `--graphite`. Re-key
  `--token--state` to `--accent`; keep prob amber, constant to `--ergo-ink-3`.
- **Lift (drag):** `--ergo-shadow-md`, `scale(1.04)`, slight rotate — already done via Motion
  `whileDrag` in `EquationTilesBeat.tsx:850`, but it references `boxShadow: 'var(--paper-shadow-2)'`
  → change to `var(--ergo-shadow-md)`. Hover `whileHover={{ y:-3, scale:1.04 }}` (`:848`) stays.
- **Selected (`.token--selected`):** `1.5px --accent` + `--accent-tint` + `--ergo-shadow-sm`
  (replace `--e1`/deboss, `beats.css:1137-1141`).

**Slots (`.slot`) — target:**
- Empty: `1.5px dashed --ergo-ink-3` (matches spec; today `--graphite-soft`, same hex — fine,
  optionally rename).
- Drag-over (`.slot--dragover`): `1.5px dashed --accent` + `--accent-tint` fill (spec). Today
  `--quill` (`beats.css:1040-1045, 1088-1091` — note this rule is **duplicated**; consolidate).
- Filled (`.slot--filled`): solid `1.5px --ergo-line-2`, `--ergo-surface`, **`--ergo-shadow-sm`**
  (replace `--press-deboss`, `beats.css:992`).
- Filled category text: `.slot--prob` → `--heads`, `.slot--var` → `--accent` (was `--quill`,
  `beats.css:1007`), `.slot--const` → `--ergo-ink-3`.
- **Snap-correct (`.slot--correct`):** `--ok` border + `--ok-tint` bg + the spring `slot-flash`
  scale (`beats.css:1054-1057`) — keep, plus add the spec's **brief border-color flash to the
  chapter accent on placement** (see drop-flash below). Wrong (`.slot--wrong`): `--bad` border +
  `slot-shake` (`beats.css:1058-1060`); reduced motion → color only (already gated `:1054`).
- **`.slot--glow` (targeted hint):** today highlighter `--mark-wash`+`--mark` (`beats.css:1035-1038`)
  → solid `--mark-tint` bg + `--mark` border (keep amber = discovery semantic, drop the wash).
- **`.slot--drop-flash` (the snap):** replace the deboss-settle keyframe (`beats.css:1093-1104`)
  with a chapter-accent border pulse that settles to the resting shadow:
  ```css
  @keyframes slot-drop-settle {
    0%   { box-shadow: 0 0 0 0 var(--accent-tint); border-color: var(--accent); }
    100% { box-shadow: var(--ergo-shadow-sm);      border-color: var(--ergo-line-2); }
  }
  ```
- **Locked (`.slot--locked`):** `--ergo-surface-2` bg, dashed, `--ergo-ink-3` (today `--paper-2`/
  `--graphite`, `beats-extended.css:300-305` — same hexes, optionally rename).

**`SumTilesBeat`/`RetrievalGrid` slots:** re-key `.sumtiles__slot--filled` (`beats-extended.css:
1099-1105`) and `.retgrid__slot--sel` (`beats-extended.css:378-383`) from `--quill`/`--quill-tint`/
`--quill-strong` → accent triad; `--correct`/`--wrong` states stay semantic.

### Family C — Sliders & number-line

**Beats/CSS:** `SliderBeat` (`.numline`, `.numline__value`, `.numline__track`, `.numline__rule`,
`.numline__tick(--major)`, `.numline__ticklabel`, `.numline__mark`, `.numline__marklabel`,
`.numline__markflag`, `.numline__thumb`, `.numline__range`, `--locked`/`--still`), `BiasSandboxBeat`
(`.bias__*`, `.bias__range`, `.bias__thumb`), `BalanceSolveBeat` (`.balance__range` native input),
plus the `WalkBoardBeat` steppers/knob (`.walkboard__stepper`, `.walkboard__knob-input`). All built
on `useSliderControl` (React Aria `useSlider`) except `BalanceSolveBeat` and the walk knob, which
use native `<input type=range>`. This is `docs/ui_design_system.md` §"Prediction slider".

| Element | Current | Target |
|---------|---------|--------|
| Thumb dot | `--quill` fill, `2px --paper-0` ring, `--e1` (`beats.css:1303-1313`, `bias` `:319-329`) | `--accent` fill, `2px --ergo-surface` ring, `--ergo-shadow-sm` |
| Big value readout `.numline__value` | `--quill` / locked `--quill-strong` (`beats.css:1215-1219`) | `--accent` / locked `--accent-strong`; add `font-variant-numeric: tabular-nums` (already mono) |
| Locked-thumb | `--graphite-soft` (`beats.css:1315`) | `--ergo-ink-3` (same hex; keep) |
| Locked **mark** line + label | `--mark` line + `--mark-wash` label bg (`beats.css:1260-1290`) | keep `--mark` line (it's the discovery marker that reappears in `SimChart`), but swap label bg to **solid `--mark-tint`** |
| Focus | `outline: 2px solid --quill` via `:has(:focus-visible)` (`beats.css:1330`) | `--ring-focus` ring on the thumb dot |
| Active scale | `scale(1.12)` (`beats.css:1335`, `bias` `:344`) | keep (compositor-only, already reduced-motion gated) |
| `.balance__range` | `accent-color: --quill`, **`--press-deboss`** (`beats-extended.css:649-650`) | `accent-color: --accent`; **drop the deboss**; focus → `--ring-focus` |
| Ticks/rule | `--rule` / `--graphite-soft` (`beats.css:1233-1248`) | `--ergo-line` rule, `--ergo-ink-3` major ticks |

`useSliderControl.ts` itself is **headless** (React Aria) and needs **no change** — it returns the
prop bag; all visuals live in CSS. Preserve `.numline__range` / `.bias__range` / `.balance__range`
(load-bearing e2e selectors, §5).

### Family D — State-graph interactions (Konva hero)

**Beats:** `CoinSimBeat` (`.coinsim`, `.coinsim__legend`, `.coinsim__stream`, `.coin--{H,T,inline}`
+ `StateGraph`), `StateTapBeat` (`.tapbeat`, `.tap-card`, `.tap-card__q`, `.tap-choices`,
`.statechip`, `--on/--correct/--wrong`, `.statechip__{label,id}`, `.tap-card__hint` + `StateGraph`),
`OverlapBeat` (`.overlap__cols`, `.overlap__col`, `.overlap__cap`, `.overlap__note`, `.overlap__tap`,
`.statechip` + two `StateGraph`s), `PrimerBeat` graph demo (`.primer__graph` + `StateGraph`,
`labelMode="dual"`). The canvas itself is detailed in §3.

DOM treatments:
- **`.tap-card`** (`beats.css:112-119`): `--paper-1` + `1px --rule` + **`--paper-shadow-2`** → `--ergo-surface`
  + `1px --ergo-line` + `--ergo-shadow-sm`.
- **`.statechip`** (`beats.css:139-186`): resting `1.5px --rule` on `--paper-0`; hover/`--on`/focus
  use `--quill`(-tint) → re-key to `--accent`(-tint). `--correct`/`--wrong` stay semantic. `.statechip__id`
  → `--ergo-ink-3`. Keep `.statechip__label`/`.statechip__id` (used by `OverlapBeat`).
- **`.tap-card__hint`** stays `--wrong` (it only shows for a wrong pick). 
- **Coin tokens** `.coin--H`/`.coin--T` (`beats.css:28-35`): keep `--heads`/`--tails` (semantic);
  add the subtle radial sheen (§1.2) for the premium read; `.coin--latest` lift → `--ergo-shadow-sm`.
- **`.coinsim__legend`** swatches (`beats-extended.css:990-998`): keep gold/teal edge keys.

### Family E — Charts & simulation convergence

**Beats:** `TheorySimChartBeat` (`.simbeat`, `.sim-status`, `.sim-stats`, `.sim-stat`,
`.sim-stat--quill`, `.sim-progress`, `.sim-progress__bar`, `.sim-readout` + `SimChart`),
`BiasSandboxBeat` (`.bias__chart` + `BiasChart`), `FirstSuccessTimeline` (`.fst*` in
`beats-extended.css:157-284`, used by the "average" `PrimerBeat`). The canvases are §3.

| Element | Current | Target |
|---------|---------|--------|
| `.sim-stat--quill b` (empirical value) | `--quill` (`beats.css:227`) | `--accent`; keep `tabular-nums` (`:218`) |
| `.sim-stat--ink b` (theory) | `--ink` | keep (theory is the neutral reference line) |
| `.sim-progress__bar` | `linear-gradient(--quill,--quill-strong)` (`beats.css:243`) | `linear-gradient(--accent, --accent-strong)` |
| `.fst__theory` dashed line + label | `--quill`/`--quill-strong` (`beats-extended.css:176-187`) | `--accent` (the convergence target the empirical bars approach) |
| `.fst__bar` | `--heads` | keep amber (sample bars) or move to `--accent` for chapter unity — **recommend `--accent`** |
| `.fst__mean` | `--graphite` solid | keep neutral mean line |

The chart **convergence choreography** already meets the spec (Konva tween, ≤30fps batch via
`useProgressiveRuns`, no per-frame React state — `TheorySimChartBeat.tsx:36-84`). Don't touch the
animation contract; only re-key colors in `SimChart` (§3.2).

### Family F — Lesson-specific heroes (race / walk / ledger / ruler / triplet / substitution)

**Beats/CSS** (`beats-extended.css:710-954`): `RaceSimBeat` (`.racehero*`, `.heatmap`),
`WalkBoardBeat` (`.walkboard*` + inline SVG), `GamblerLedgerBeat` (`.ledger*`),
`AutocorrelationRulerBeat` (`.ruler*`), `TripletRevealBeat` (`.triplet*`), `SubstitutionBeat`
(`.substeps`, `.substep`, `.substep__result`), `DominanceWheelBeat` (`.wheel*`, Family A).

- **`RaceSimBeat`** is the worst color-debt: `.racehero__fill--a` = `--quill` and `.racehero__fill--b`
  = **hardcoded `#b26a2b`** (`beats-extended.css:761-766`); `--flip--a`/`--flip--b` likewise
  (`:802-807`). Meanwhile `theme.ts` already defines `laneA #4F46E5` / `laneB #E0982E` and the
  heatmap scale `heatLo/heatMid/heatHi`. **Target:** lane A → `--accent` (teal in L2), lane B →
  `--ch4`/`--mark` amber (the second racer stays a contrasting hue, not chapter); **delete the
  `#b26a2b` literal.** The heatmap (`RaceSimBeat.tsx:82-93`) already pulls from `C.heatHi/heatLo/
  paper2/paper0` — fine; ensure those read crisply on cool-white.
- **`WalkBoardBeat`** (inline SVG, `WalkBoardBeat.tsx`): the start node, walker, landscape curve,
  and histogram bars are all `C.quill` (`:237, :265, :324, :377`). Re-key to the passed `accent`
  (teal for L3). Keep `C.ruin`/`C.win`/`C.ruinTint`/`C.winTint` (the two walls are semantic
  red/green = lose/win, not chapter). Hairlines `C.rule` → ensure crisp.
- **`GamblerLedgerBeat`**: `.ledger__sum`/`.ledger__mean` numbers `--quill` (`beats-extended.css:
  894`) → `--accent`; `.ledger__col` panels → `--ergo-surface` + `--ergo-line` + `--ergo-shadow-sm`.
- **`AutocorrelationRulerBeat`**: `.ruler__row--border` uses `--correct` (a true match = correct,
  keep); `.ruler__cell--match` `--correct-text` (keep). Panels to Ergo surface tokens.
- **`TripletRevealBeat`**: `.triplet__card--open` border `--quill` (`beats-extended.css:524`),
  `.triplet__value` `--quill` (`:537`) → `--accent`. Cards → Ergo surface/line/shadow.
- **`SubstitutionBeat`**: `.substep__result` `--quill-strong` (`beats.css:1181`) → `--accent-strong`;
  keep the `substep-slide` enter animation (reduced-motion gated by `isNewest`/`reducedMotion`,
  `SubstitutionBeat.tsx:77`).

All hero panels currently use `--paper-1`/`--rule`/`--paper-shadow-1`; standardize to
`--ergo-surface` / `--ergo-line` / `--ergo-shadow-sm` + `--r-md`/`--r-lg`.

### Family G — Primers, answer-entry, recap, and the beat shell

- **`PrimerBeat`** (`.primer*`, `beats-extended.css:5-100`): disclosure + card to Ergo surface
  tokens; `.primer__kicker`/`.primer__chevron`/`.primer__cell--on` `--quill*` → `--accent*`; the
  graph demo legend swatches (`.primer__key-mark--{h,t,node,ring}`) keep gold/teal/green semantics.
- **`AnswerEntryBeat`** (`.answer-entry*`, `beats-extended.css:102-155`): input focus `--quill`
  → `--accent`; `--correct`/`--wrong` field states stay semantic; this is the spec's §"Inputs"
  treatment (label above, `1.5px --ergo-line-2`, focus `--ring-focus`).
- **`RecapBeat`** (`.recap*`, `beats.css:390-606`, `beats-extended.css:330-338`): drop the
  notebook "ink seal" framing — `.recap__seal` is a 1.5px ink pill (`beats.css:461-471`); keep as
  a quiet mono chip but consider the chapter accent. `.recap__mark` highlighter (`:522-527`) →
  solid `--mark-tint`. `.recap__belief` `--quill`/`--quill-tint` (`beats-extended.css:330-336`) →
  `--accent`. The reveal animation `recap-reveal` (`:438-450`) is reduced-motion gated — keep.
  **Note:** `RecapBeat` still imports `MilestoneSeal` (`RecapBeat.tsx:17, :405, :128, :235`); the
  wax-seal is a retired concept (`CONTEXT.md` "Milestone seal"). Coordinate with Part 1 / the
  celebration redesign — out of scope here, but **flag** that the recap stamp should become the
  medallion-earn moment, and **keep the "Lesson complete" text node** (`LessonPlayer.tsx:381`,
  asserted by e2e) intact.
- **`BeatShell` + action bar** (`BeatShell.tsx`, `.region`/`.feedback`/`.actionbar`/`.btn*` in
  `beats.css`/`shell.css`):
  - `.feedback` strip (`beats.css:610-625`): drop the `--paper-shadow-2` (`:616`) → `--ergo-shadow-sm`;
    `--correct`/`--wrong` left-border + tint stay. This is `docs/ui_design_system.md` §"Feedback strip".
  - `.btn--primary` (`beats.css:733-740`): `--quill`/`--quill-strong` → **`--accent`/`--accent-strong`**
    so the primary CTA is chapter-colored (spec §"Buttons" — "Primary (chapter color)"). Hover adds
    `--ergo-shadow-sm`. `.btn--ghost` text `--quill-strong` → `--accent-strong`.
  - `.btn:active` (`beats.css:760-763`): **drop `--press-deboss`**, keep `transform: scale(0.98)`.
  - `.btn:focus-visible` → `--ring-focus`.
  - `.btn:disabled` `--paper-2`/`--graphite-soft` → `--ergo-surface-2`/`--ergo-ink-3` (spec).

---

## 3. Konva visualization restyle (`StateGraph` / `SimChart` / `BiasChart`)

All three mount a `<Stage>` with `'use no memo'` and read colors from the `C` palette in
`src/lesson/konva/theme.ts`. None currently key off chapter. The plan: add the `accent` prop
(§1.3-B), re-key indigo → accent, align node vocabulary to Home `MathViz`, add tasteful glow,
crisp hairlines, tabular numerals — **without** introducing per-frame React state.

### 3.1 `StateGraph.tsx` — the visual hero

Current node rendering (`StateGraph.tsx:341-401`): inactive nodes are **gray** (`fill C.paper0`,
`stroke C.graphite`), active is `C.quillTint`/`C.quill`, absorbing ring is **green** `C.correct`,
labels `C.ink`/`C.quill`. This does **not** match Home `MathViz` (chapter-tinted nodes, dashed
accent absorbing ring).

**Target (accept `accent: { base, tint, glow }`):**

| Element | Current | Target |
|---------|---------|--------|
| Inactive node fill / stroke | `C.paper0` / `C.graphite` (`:352-354`) | `accent.base` @ `fillOpacity 0.10` / `accent.base` stroke `1.8` (mirrors `MathViz` `StateMachineViz`/`TwoNodeViz`) |
| Active node fill / stroke | `C.quillTint` / `C.quill`, sw 3 (`:352-354`) | `accent.tint` / `accent.base`, sw 3, **+ `shadowColor accent.glow`, `shadowBlur 12`** (the active glow; clear on non-active) |
| Absorbing ring | solid green `C.correct` `r+5` (`:358-369`) | **dashed `accent.base` ring** (`dash=[3,2]`, `r+5`), matching `MathViz` `StateMachineViz.tsx:123-132`. *(Alt: keep green if design wants "done"=green — confirm. Recommend accent for Home parity.)* |
| Node label | `C.ink` / active `C.quillStrong` (`:382`) | `C.ink` / active `accent.strong` (pass strong or `C.ink`) |
| Dual id sub-label | `C.graphite` / active `C.quill` (`:398`) | `C.graphiteSoft` / active `accent.base` |
| Edges (H/T) | `edgeColor()` gold/teal (`:60`, `:247`) | **unchanged** (coin semantics) |
| Highlight edge glow | `C.mark` shadow (`:256`) | keep amber (discovery), or `accent.glow` — recommend keep `C.mark` (consistent discovery cue) |
| Energy packet | edge-color circle (`:196-203`) | keep; optionally add `shadowBlur` for a comet trail (still one-shot, `--flip-beat`) |

**Animation polish:** the synchronized-flip choreography (pulse @ ~80ms, one-shot packet
@ ~120ms→`FLIP_BEAT`, `StateGraph.tsx:101-239`) already matches the spec's "synchronized flip"
and is **imperative Konva** (no per-frame setState) — **keep exactly**. Reduced motion already
short-circuits (`:130`). Add only: animate the active node's `shadowBlur` 0→12→steady inside the
existing `node.to()` pulse so the glow blooms with the pulse.

**Hairlines / device pixels:** Konva strokes at `strokeWidth: 1` blur on HiDPI when they straddle
a pixel. For the absorbing ring and any 1px rules, set `Stage` `pixelRatio={window.devicePixelRatio}`
(Konva default is fine) and round node centers (`xOf`) to `Math.round(x) + 0.5` for crisp 1px; or
bump rules to `1.5`. Note `react-konva` `<Text>` has no `font-variant-numeric` — but JetBrains
Mono (`FONT_MONO`) ships tabular figures, so numeric labels already align.

### 3.2 `SimChart.tsx` — theory vs simulation

Re-key the **empirical** series to the accent; leave **theory** ink and **prediction** amber
(they're the neutral reference and the learner's discovery mark, per spec §"Feedback strip" L2):

| Element | Current (`SimChart.tsx`) | Target |
|---------|--------------------------|--------|
| Empirical curve | `C.quill`, sw 2.5 (`:231-237`) | `accent.base` |
| Area gradient | `C.quillFill`→`C.quillFillFade` (`:227`) | accent-derived rgba (add `accentFill`/`accentFillFade` to `theme.ts` or compute) |
| Head glow + bead | `C.quillGlow` / `C.quill` (`:250-258`) | `accent.glow` / `accent.base` |
| Live value chip | `C.quill` fill, `C.paper0` text (`:259-281`) | `accent.base` fill, `--ergo-surface` text |
| Run-count x label | `C.quill` when n>0 (`:172`) | `accent.base` |
| Theory line + label | `C.ink` sw 2 (`:186-198`) | keep |
| Prediction dashed | `C.mark` (`:200-218`) | keep (the locked `--mark` marker continuity) |
| Convergence band | `C.inkBand` (`:108-114`) | keep (faint neutral) |
| Grid / axes | `C.ruleFaint` / `C.rule` (`:117-128`) | keep, but verify crisp 1px on HiDPI |

Numerals (ticks, chip, theory/you labels) already use `FONT_MONO` → tabular. Keep the
≤30fps batched draw contract.

### 3.3 `BiasChart.tsx` — already parametric

`BiasChart` takes a per-series `color` prop (`BiasChart.tsx:178-204, 226-268`) — it's already
the most "Ergo-ready" canvas. The only color decisions live in the caller `BiasSandboxBeat.tsx:15-18`
(`SERIES_COLORS = { HH: C.quill, HT: C.tails }`). Since this beat **compares two patterns**, keep
two distinct hues but make HH the chapter accent and HT a clear contrast (`C.tails` or `C.mark`).
Vertical guide `C.graphiteSoft`, marker rings, and value chips are fine; verify the chip shadow
(`shadowBlur 4`, `:251`) reads on cool-white. Hairlines as §3.1.

### 3.4 `CourseSpine.tsx` — orphaned (exclude / flag for deletion)

`CourseSpine.tsx` is the **retired** Konva course-path spine (`CONTEXT.md` "Course path / course
spine"). It is imported by **no rendering code** — `src/pages/CourseJourney.tsx` only mentions it
in a header comment (`CourseJourney.tsx:2`), and the live Home journey is DOM+SVG
(`ergo-journey.css` + `MathViz`). **Do not restyle it.** Per AGENTS.md §3 ("mention, don't delete
unrelated dead code"), flag it: `src/lesson/konva/CourseSpine.tsx` (and its `SpineHandle`/`SpineItem`
exports) appear to be safe to delete in a separate cleanup once a grep confirms no remaining
imports. It still carries notebook vocabulary (`C.markWash` focus beam, padlock) — another reason
it must not ship as-is, hence: remove rather than restyle.

### 3.5 Performance guardrails (reaffirm)

- **No per-frame React state** during canvas animation — already honored everywhere
  (`StateGraph` imperative Konva; `SimChart`/race/walk/ledger via `useProgressiveRuns` flushing
  ≤30fps; `WalkBoardBeat` single-walk does one `setState` per lattice step, `:129-139`). Keep it.
- New glow/`shadowBlur` adds GPU cost; apply it to **one** node (active) and the **one** head
  bead, not every node/point. Don't animate `shadowBlur` in a `Konva.Animation` loop beyond the
  existing one-shot pulse.
- Keep `'use no memo'` on all three canvases (React Compiler opt-out, `vite.config.ts`).
- Canvas mount is width-driven via `useElementWidth`/ResizeObserver — unchanged.

---

## 4. Consistency: in-lesson Konva viz ⇄ Home SVG `MathViz`

**Recommendation: treat them as one glyph system with two renderers, and align the visual
constants — do not literally share components.** `MathViz.tsx` is a static 88×60 thumbnail (no
interaction, no animation, `currentColor` so the card sets the hue); the in-lesson `StateGraph`/
`SimChart` are interactive, animated, width-fluid Konva stages. Reusing one for the other is the
wrong abstraction. Instead, make them *look identical at rest*:

| Constant | Home `MathViz` | In-lesson Konva (target) |
|----------|----------------|--------------------------|
| Node fill | chapter hue @ `fillOpacity 0.12` (`MathViz.tsx:96-100`) | `accent.base` @ `0.10–0.12` |
| Node stroke | chapter hue, `1.8` (`:99-100`) | `accent.base`, `1.8` |
| Absorbing | dashed double-ring, `currentColor` (`:123-132`) | dashed accent ring (§3.1) |
| Labels | JetBrains Mono 700 (`:85-90`) | `FONT_MONO` (already) |
| Edges | gold/teal arrows w/ `H`/`T` letters | gold/teal (already, `edgeColor`) |
| Coin | `H` glyph + radial sheen (mock) | `.coin--H/T` + sheen (§2-D) |

**Concretely:**
1. Add the `accent` prop path (§1.3-B) so the lesson graph picks up the same chapter hue the
   journey thumbnail uses. After this, L2's in-lesson state graph and L2's journey card show the
   same teal object — the core "consistency" win.
2. Extract a tiny shared constants module, e.g. `src/lesson/vizVocab.ts`, exporting
   `NODE_FILL_OPACITY = 0.12`, `NODE_STROKE = 1.8`, `ABSORBING_DASH = [3,2]`, and the H/T edge
   color resolver, imported by **both** `MathViz.tsx` and the Konva canvases, to prevent drift.
   (Optional but recommended; otherwise the two will diverge again on the next tweak.)
3. Keep the renderers separate. `MathViz` stays SVG/`currentColor` (cheap, themeable, lazy on
   the journey); Konva stays the interactive hero. The *vocabulary* is shared; the *plumbing* is not.

---

## 5. e2e / VR risk

The lesson is covered by Playwright specs that the user runs manually. **Class names and button
labels are load-bearing.** The restyle is overwhelmingly **values-only** (token swaps, shadow
swaps) and changes **no** class names — so functional e2e is safe if the rules below are honored.
VR snapshots **will** move for L2–L6 and must be re-baselined.

### 5.1 Load-bearing selectors (confirmed via grep of `e2e/`)

| Selector / locator | Used by | Action |
|---|---|---|
| `.actionbar .btn--primary`, `.btn--primary`, `.btn` | `helpers.ts:8`, `remaining-lessons.spec.ts:9` | **Preserve** (restyle values only) |
| `.token-row`, `.eqline--build`, `.eqline--build .slot`, `.slot` | `helpers.ts:30`, `remaining-lessons.spec.ts:84-91` | **Preserve** (Family B) |
| `.tap-card` + `role=radio` `E0/E2/E3/E1` | `helpers.ts:54-56`, `remaining-lessons.spec.ts:163` | **Preserve** (Family D) |
| `.hint-note--mark` | `helpers.ts:50`, `remaining-lessons.spec.ts:107` | **Preserve** the class even after dropping the highlighter wash |
| `.numline__range` | `helpers.ts:71` | **Preserve** |
| `.balance__range` | `helpers.ts:79`, `remaining-lessons.spec.ts` | **Preserve** |
| `.overlap__tap .statechip` | `helpers.ts:173` | **Preserve** |
| `.answer-entry__input` | `remaining-lessons.spec.ts:22` | **Preserve** |
| `.retgrid__slot`, `.retgrid__palette` | `remaining-lessons.spec.ts:68-71` | **Preserve** |
| `.wheel__options .token` | `remaining-lessons.spec.ts:135` | **Preserve** |
| `.ruler__row` | `remaining-lessons.spec.ts:194, 202` | **Preserve** |
| `.sumtiles__chips .token` | `remaining-lessons.spec.ts:194, 204` | **Preserve** |
| `.triplet__card` | `remaining-lessons.spec.ts:208` | **Preserve** |
| `.done-note` (text "Lesson complete") | `helpers.ts:99`, `remaining-lessons.spec.ts:112` | **Preserve** text node (`LessonPlayer.tsx:381`) |
| `section.prompt` (VR anchor), `.ergo-journey` (VR anchor) | `vr/surfaces.spec.ts:32, 26` | **Preserve** |
| Button labels: `Flip`, `Continue`, `Finish`, `Check`, `Lock prediction`, `Now your turn`, `Step`, `Reveal recap`, `Run \d+…` | both specs | **Preserve** label strings (don't rename CTAs) |
| `aria-pressed` on tiles, `role=radio/radiogroup` | both specs | **Preserve** ARIA |

**Renames required:** **none.** Every change in this brief is a CSS value swap, a token rename
*inside values*, or a Konva color prop. If an implementer is tempted to rename a class (e.g.
`.slot--var` → `.slot--state` for naming parity, or `--quill` → `--accent` as a *class* anywhere),
**stop** — keep the class, change only the declaration. If a rename ever becomes unavoidable,
it must land in the **same commit** as the matching `e2e/` update (and a VR re-baseline).

### 5.2 VR snapshots

`e2e/vr/surfaces.spec.ts` captures **full-page** screenshots at `maxDiffPixelRatio: 0.02` for two
projects (`vr-desktop`, `vr-mobile`):

- `dev-home.png` — Home (Part 1's surface; included for completeness).
- `dev-lesson-flagship.png` — `/dev/lesson` = `lesson-pattern-hitting-times` (**ch1 indigo**).
- `dev-lesson-penneys.png` — `/dev/lesson/lesson-penneys-game` (**ch2 teal**).

**Key insight:** because `--quill` == `--ch1` == indigo, the `--quill → --accent` sweep is a
**no-op for the flagship**. `dev-lesson-flagship.png` should move only by the *depth* changes
(deboss→shadow, highlighter→tint) — small, intentional diffs. `dev-lesson-penneys.png` will move
**substantially** (indigo→teal) — expected; re-baseline with `--update-snapshots`.

**Recommendation:** the current VR set has **no coral (ch3) lesson** and only one teal surface.
Add VR cases for one lesson per remaining chapter to lock the new accenting — e.g.
`dev-lesson-gamblers` (`lesson-gamblers-ruin`, teal hero/walk) and `dev-lesson-overlap`
(`lesson-overlap-shortcut`, coral sum/ledger). This is the spec's §"Performance Budget" /
"Protect polish" guardrail. (Adding spec cases is an e2e change, so it's the user's call when to
run them; flag it.)

### 5.3 Reduced-motion

The global backstop `* { transition/animation-duration: 0.01ms !important }` lives at
`beats.css:1343-1348` and `prefers-reduced-motion` guards wrap every keyframe (`slot-flash`,
`slot-shake`, `slot-drop-settle`, `recap-reveal`, `substep-slide`, `coinsim__stream` fade, the
node pulse). The reduced-motion VR project must stay green: ensure the new `slot-drop-settle`
border-flash and any node-glow bloom are inside `@media (prefers-reduced-motion: no-preference)`
or collapse to the final frame.

---

## 6. File-by-file change checklist (this brief's scope)

> Legend: **[plumb]** chapter-hue wiring · **[depth]** remove notebook depth · **[accent]** indigo→chapter ·
> **[konva]** canvas color/polish · **[flag]** note only, coordinate elsewhere.

**Wiring (do first):**

- [ ] `src/lesson/LessonPlayer.tsx` — **[plumb]** import `chapterForLesson`; set `data-ch` on both
  `.lesson` roots (`:361`, `:426`); compute `accent = accentFor(ch)` and pass `accent` through
  `<BeatView>` props (`:477-501`).
- [ ] `src/lesson/beats/types.ts` — **[plumb]** add an optional `accent?: { base: string; tint:
  string; glow: string }` to the `BeatProps` type (`types.ts:21-57`; it currently has no accent
  field). Optional so the dev route / non-canvas beats can omit it (default to ch1 in the canvas).
- [ ] `src/lesson/beats/index.tsx` — **[plumb]** forward `accent` to the canvas-bearing beats
  (`CoinSimBeat`, `StateTapBeat`, `OverlapBeat`, `PrimerBeat`, `EquationTilesBeat`,
  `TheorySimChartBeat`, `BiasSandboxBeat`, `WalkBoardBeat`, `BalanceSolveBeat`).
- [ ] `src/lesson/konva/theme.ts` — **[konva]** add `CHAPTER_ACCENT` + `accentFor()`; optionally
  `accentFill`/`accentFillFade` for the sim area; **delete** the stray `#b26a2b` dependency by
  routing race lane B through `C.laneB`/`--mark`.
- [ ] `style-dictionary/tokens/color.json` (+ regenerate `tokens.generated.{css,ts}` via
  `scripts/build-tokens.ts`) — **[accent]** *optional but recommended:* add `--ch1-strong /
  ch2-strong / ch3-strong` so `--accent-strong` is a real token instead of `color-mix`. Do **not**
  hand-edit the generated files.

**CSS (values-only sweeps — no class renames):**

- [ ] `src/styles/surfaces/beats.css` — **[plumb]** add the `.lesson[data-ch]` accent triad block;
  **[accent]** `--quill*`→`--accent*` across `.coinstream__chip`, `.statechip*`, `.sim-stat--quill`,
  `.sim-progress__bar`, `.chip--on`, `.eqtiles__*`, `.eqline*`, `.slot*`, `.token*`, `.palette`,
  `.numline*`, `.btn--primary/--ghost`; **[depth]** drop `--press-deboss` (`:761, :992, :1102`),
  swap `.feedback` `--paper-shadow-2`→`--ergo-shadow-sm` (`:616`), convert `--mark-wash` washes
  (`:67, :812, :525, :1036, :1281`) to solid `--mark-tint`; rewrite the `slot-drop-settle` keyframe
  (`:1097-1104`); de-duplicate the two `.slot--dragover` rules (`:1040, :1088`).
- [ ] `src/styles/surfaces/beats-extended.css` — **[accent]** `--quill*`→`--accent*` across
  `.primer__*`, `.answer-entry__input` focus, `.recap__belief`, `.retgrid__slot--sel`,
  `.sumtiles__slot--filled`/`.sumtiles__chips .token--placed`/`.sumtiles__eq-result`,
  `.triplet__card--open`/`.triplet__value`, `.ledger__sum/__mean`, `.racehero__fill--a`/`--flip--a`;
  **[depth]** drop `--press-deboss` on `.balance__range` (`:650`); **delete `#b26a2b`** literals
  (`:765, :806`) → `--mark`/`--ch4`; standardize hero panels to `--ergo-surface`/`--ergo-line`/
  `--ergo-shadow-sm`.
- [ ] `src/styles/surfaces/shell.css` — **[depth]** drop `--press-deboss` on `.token` (`:353`) and
  `.compare__card--on` (`:324`); **[accent]** `.prompt__kicker` (`:213`), `.compare__card*`
  (`:298-324`), `.token--state` (`:356`) → `--accent*`; **[depth]** evaluate the `.canvas-frame`
  grid texture (`:367-378`) — keep faint grid for chart beats only, else flat `--ergo-surface-2`;
  `.btn`/focus rings → `--ring-focus`.

**Konva canvases:**

- [ ] `src/lesson/konva/StateGraph.tsx` — **[konva]** accept `accent`; re-key inactive/active node
  fill+stroke to accent (`:341-401`); switch absorbing ring to dashed accent (`:358-369`) [confirm
  vs green]; add active-node glow in the existing pulse; crisp hairlines; edges unchanged.
- [ ] `src/lesson/konva/SimChart.tsx` — **[konva]** accept `accent`; re-key empirical curve/area/
  head/chip/run-label (`:172, :220-281`); theory ink + prediction amber unchanged.
- [ ] `src/lesson/beats/BiasSandboxBeat.tsx` — **[accent]** re-key `SERIES_COLORS` (`:15-18`) so
  the primary series is the chapter accent; `BiasChart.tsx` needs no structural change.
- [ ] `src/lesson/beats/WalkBoardBeat.tsx` — **[konva]** thread `accent` into the inline SVG:
  start node (`:237`), walker (`:265`), landscape curve (`:324`), histogram bars (`:377`); keep
  ruin/win semantic colors.
- [ ] `src/lesson/beats/BalanceSolveBeat.tsx` — **[accent]** the inline SVG pan discs/beam use
  `var(--quill)` literals (`:196, :203`) → `var(--accent)`; `--correct` balanced state stays.
- [ ] `src/lesson/beats/RaceSimBeat.tsx` — **[konva]** heatmap already uses `C.heatHi/Lo/paper2/0`
  (`:82-93`) — verify contrast; ensure lane colors come from `theme.ts`, not CSS literals.

**Tile/token components (motion props):**

- [ ] `src/lesson/beats/EquationTilesBeat.tsx` — **[depth]** `whileDrag` `boxShadow:
  'var(--paper-shadow-2)'` (`:850`) → `'var(--ergo-shadow-md)'`. No class changes.

**Flag-only (coordinate, do not restyle here):**

- [ ] `src/lesson/konva/CourseSpine.tsx` — **[flag]** orphaned/retired; exclude from restyle,
  candidate for deletion (no live imports; only a comment ref in `CourseJourney.tsx`).
- [ ] `src/lesson/beats/RecapBeat.tsx` / `MilestoneSeal` — **[flag]** wax-seal is retired; recap
  "earn" should become the medallion moment (Part 1 / celebration scope). Keep the
  "Lesson complete ✓" text node intact for e2e.
- [ ] `e2e/vr/surfaces.spec.ts` — **[flag]** after the restyle, `--update-snapshots` for
  `dev-lesson-penneys` (+ flagship's small depth diffs); **recommend adding** a coral (ch3) and a
  teal-hero (gamblers) VR case. User runs Playwright.

**Out of scope (named for awareness, untouched):** `MathViz.tsx` (Home thumbnails — already Ergo;
only touched if extracting the shared `vizVocab.ts` constants in §4), `ergo-journey.css` (Home),
`CourseJourney.tsx`/`StudyDesk.tsx` (Home), `FirstSuccessTimeline` colors covered under Family E.

---

## Appendix A — Beat inventory (dispatcher → component → family → key selectors → canvas)

| `interaction.type` | Component | Family | Load-bearing selectors | Canvas / viz |
|---|---|---|---|---|
| `prediction` | `PredictionBeat` | A | `.chips`, `.chip--select`, `.chip--on`, `role=radio` | — |
| `patternPick` | `PatternPickBeat` | A | `.compare__card(--tap/--on)`, `.compare__preview`, `aria-pressed` | — |
| `dominanceWheel` | `DominanceWheelBeat` | A | `.wheel__options .token`, `.token--selected/--placed` | — |
| `recap` | `RecapBeat` | A/G | `.chip--select`, `.recap__*`, `.done-note` (text) | KaTeX verdict |
| `equationTiles` | `EquationTilesBeat` | B | `.token-row`, `.eqline--build .slot`, `.slot--*`, `.token--*`, `aria-pressed` | `StateGraph` (split) |
| `sumTiles` | `SumTilesBeat` | B/F | `.sumtiles__chips .token`, `.sumtiles__slot--filled`, `aria-pressed` | — |
| `retrievalGrid` | `RetrievalGridBeat` | B | `.retgrid__slot(--*)`, `.retgrid__palette` | — |
| `slider` (refine) | `SliderBeat` | C | `.numline__range`, `.numline__*` | feeds `SimChart` mark |
| `slider` (bias-sandbox) | `BiasSandboxBeat` | C/E | `.bias__range`, `.bias__*` | `BiasChart` |
| `balanceSolve` | `BalanceSolveBeat` | C/F | `.balance__range`, `.balance__*` | inline SVG beam |
| `stateTap` | `StateTapBeat` | D | `.tap-card`, `.statechip(--*)`, `role=radio` | `StateGraph` |
| `coinSim` | `CoinSimBeat` | D | `.coinsim*`, `.coin--{H,T}`, `.hint-note--mark`, `Flip`/`Step` | `StateGraph` + `CoinStream` |
| `overlap` | `OverlapBeat` | D | `.overlap__tap .statechip`, `.overlap__*` | 2× `StateGraph` |
| `primer` | `PrimerBeat` | G/D | `.primer__*`, `.primer__cell--on` | `StateGraph` (graph), `FirstSuccessTimeline` (average) |
| `theorySimChart` | `TheorySimChartBeat` | E | `.simbeat`, `.sim-stat*`, `.sim-progress*`, `Run \d+…` | `SimChart` |
| `raceSim` | `RaceSimBeat` | F | `.racehero*`, `.heatmap`, `Run \d+…` | DOM bars + heatmap |
| `walkBoard` | `WalkBoardBeat` | F | `.walkboard*` | inline SVG (lattice/landscape/histogram) |
| `gamblerLedger` | `GamblerLedgerBeat` | F | `.ledger*`, `Run \d+…` | DOM ledger |
| `autocorrelationRuler` | `AutocorrelationRulerBeat` | F | `.ruler__row`, `.ruler__*` | DOM ruler |
| `tripletReveal` | `TripletRevealBeat` | F | `.triplet__card`, `.triplet__*` | DOM lenses |
| `substitution` | `SubstitutionBeat` | F | `.substep(--*)`, `.substep__result` | DOM stepper |
| `answerEntry` | `AnswerEntryBeat` | G | `.answer-entry__input(--*)` | — |
| *(fallback)* | `ContinueStub` | — | `.stub` | — |

> `McqBeat` was **deleted** (git status `D src/lesson/beats/McqBeat.tsx`); the dispatcher routes
> the former MCQ to `answerEntry`/`retrievalGrid`. No `mcq` case remains in `index.tsx`.

## Appendix B — Notebook-era tokens still live in lesson CSS (target for retirement)

These exist in `tokens.generated.css` as **aliases that already resolve to Ergo hexes**, so they
render correctly but carry notebook *names/treatments*. Migrate names where cheap; the **must-fix**
is the *treatment* (deboss/highlighter), not the alias.

| Token | Value | Where used | Action |
|---|---|---|---|
| `--press-deboss` | `inset 0 1px 2px rgba(22,26,39,.12)` | `.btn:active`, `.slot--filled`, `.token`, `.compare__card--on`, `.balance__range`, `slot-drop-settle` | **Remove** — Ergo `:active` is `scale(0.98)`; filled = raised `--ergo-shadow-sm` |
| `--mark-wash` | `rgba(224,152,46,.18)` | `.hint-note--mark`, `.slot--glow`, `.recap__mark`, `.numline__marklabel`, `.eqprogress--invalid`, `CourseSpine` beam | **Replace** with solid `--mark-tint` |
| `--paper-shadow-1/2/3` | = `--ergo-shadow-sm/md/lg` | feedback, tap-card, primers, panels | Rename to `--ergo-shadow-*` (value-identical) |
| `--e1` / `--e2` | = `--paper-shadow-1/2` | thumbs, tokens, hovers | Rename to `--ergo-shadow-sm/md` |
| `--quill` / `--quill-strong` / `--quill-tint` | indigo / `#4338CA` / `#EEF0FE` | **everywhere** in beats | Replace with `--accent` triad (keyed by `data-ch`) |
| `--paper-0/1/2` | `#f7f8fb` / `#fff` / `#f1f3f8` | backgrounds | Rename to `--ergo-bg`/`--ergo-surface`/`--ergo-surface-2` (value-identical) |
| `--ink` / `--graphite` / `--graphite-soft` | `#161A27` / `#4B5268` / `#8A90A4` | text | Rename to `--ergo-ink`/`-ink-2`/`-ink-3` (value-identical) |
| `--rule` / `--rule-faint` | `#e2e5ec` / `#eceef3` (opaque) | borders, grid | Consider moving hairlines to `--ergo-line`/`--ergo-line-2` (rgba) for true Ergo hairlines — *(visual diff; batch with VR)* |
| `--letterpress-ink` / `--edge-highlight` | white inset highlights | (legacy) | Remove if unreferenced in lesson scope |
| `--r-xs` | `4px` | small radii in beats | Keep (below Ergo `--r-sm 8px`; harmless) |

> Renaming the value-identical aliases (`--paper-*`, `--ink`, `--graphite*`, `--e1/2`,
> `--paper-shadow-*`) is **VR-neutral** (no pixel change) and clarifies intent, but it is a large
> mechanical diff — sequence it after the accent + depth work so VR re-baselines happen once.
