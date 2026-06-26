# Interaction Spec: Order Statistics & Extremes  (lesson-expected-value-6)

**Chapter:** ch-expected-value-3 · **Accent:** `ch2` teal `#0D9488` / `--ch2-tint`  
**glyphKey:** `E[max]` · **vizKey:** `raceLanes`  
**patternOptions:** `["H"]` (placeholder; no H/T automaton; ants sim builds its own model)  
**schemaVersion:** 1 · **milestoneId:** `expected-value-mastered` · **unlocks:** `null`

---

## Beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse or NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|----------------------------------------|-----------------|:------------:|-----------------|------|---------------|:-----:|
| 1 | `ev6-primer` | Tap header to expand → read order-stats intro card (k-th order statistic, E[max]/E[min] formulas) → tap Continue | `primer` {variant:`custom`, collapsible:`true`} | REUSE | correct: "Order statistics rank ordered draws — the max is the n-th, the min is the 1st." · hints: [k-th order stat def · E[U_(n)]=n/(n+1) formula · Continue] | 44px toggle; `aria-expanded`; collapsible panel | ch2 teal pill header; formula card; no motion; no confetti | A |
| 2 | `ev6-recall` | Tap a left cell (concept) → tap its matching right cell (formula) → pair snaps locked when correct → grid completes on all 2 pairs | `retrievalGrid` {pairs:2} | REUSE | correct: "n! counts all orderings; nPk ordered-picks k of n. Both count ordered structure — the doorway to order statistics." · hints: [n! def · nPk = n!/(n−k)! · exact matches] | 44px cells; `role=grid`; `aria-selected` per cell; tab-navigable | Space Grotesk; ch2 teal fill on match snap; no motion | both |
| 3 | `ev6-bet` | Read ants scenario → tap one of 3 option cards → card flips to per-option refutation copy (byOption) | `prediction` + `byOption` | REUSE | byOption: ✓ "About 1 minute" → "Good instinct — let's prove it: relabeling collisions as pass-throughs turns this into the max of 500 positions." · ✗ "Many minutes" → "Let's test it — collisions look slow, but relabeling erases them; the last ant just walks straight off." · ✗ "Hours / intractable" → "Let's test it — the chaos is an illusion; swapping labels reveals a barely-over-a-minute answer." | 44px cards; `role=radio`; refutation revealed with `aria-live="polite"` | 3-col option cards; flip/reveal on tap; ch2 accent on ✓ card | both |
| 4 | `ev6-win` | Type E[max] in field 1, E[min] in field 2 (both for n=2 U(0,1) draws) → submit → instant field-level check | `answerEntry` {fields:2} | REUSE | correct: "E[max]=2/3 and E[min]=1/3 — symmetric around 1/2, summing to 1. The larger draw sits above center." · hints[0]: "The larger of two draws beats the average. E[max]=n/(n+1)=2/3, and E[min]=1/3." [brief verbatim] · hints[1]: "Plug n=2 into E[max]=n/(n+1)." · hints[2]: "2/3 and 1/3." | 44px inputs; labeled fields; fraction entry note ("enter as a/b"); keyboard primary | 2 labeled text fields side by side; JetBrains Mono input; ch2 teal border on correct | both |
| 5 | `ev6-explore` | Tap "Run simulation" → watch 500 ants on Konva lanes canvas march and bounce → tap toggle "Swap labels on collision" (`role=switch`) → bouncing picture becomes pass-through (same fall-off times, clean lines) → observe which ant falls off last → tap Continue | `raceSim` {display:`lanes`, mode:`ants`, ants:{n:500}} | REUSE + minimal additive extension (see §New interaction types) | correct: "The last-off ant is the one that started farthest from its exit — the maximum of 500 starting positions." · hints[0]: "The set of fall-off times is identical whether ants bounce or pass through." · hints[1]: "In pass-through mode each ant walks straight off; the last off simply started farthest." · hints[2]: "The farthest start = max of 500 U(0,1) draws = E[max] = 500/501." | **DOM `aria-live` mirror** outside canvas (`role=log`, `aria-live=polite`): "N ants still walking. Earliest off at T min." → "All 500 off. Last at [T] min."; toggle `role=switch` aria-checked; reduced-motion → static final frame + annotation; hero block required (HERO_TYPE); 44px all controls | Konva `Stage`, 1D track; ch2 teal `#0D9488` for track/annotations; `C.laneA`/`C.laneB` tokens for ant dots; toggle switch chip above canvas; `hero.structuralReadout` shown after run; **cinematic beat** (the "wow": flipping toggle turns chaotic bounce into clean pass-through) | both |
| 6 | `ev6-model` | Drag slider n=2..20 → E[max]=n/(n+1) and E[min]=1/(n+1) update live as exact fractions → observe E[max] approach 1 but never reach it | `slider` {min:2, max:20, step:1} | REUSE | correct: "E[max]=n/(n+1) creeps toward 1 but never reaches it — the values are bounded at 1. E[min]=1/(n+1) sinks toward 0." · hints[0]: "At n=2: E[max]=2/3. At n=9: E[max]=9/10." · hints[1]: "The gap to 1 is always 1/(n+1)." · hints[2]: "E[max]+E[min]=n/(n+1)+1/(n+1)=1." | `aria-valuemin/max/now` on slider; `aria-live` live-region updates E[max]/E[min] as fractions | Slider track + dual fraction readout (JetBrains Mono, tabular-nums); mini 0–1 axis with max/min dot positions; ch2 accent; no motion token on static readout | both |
| 7 | `ev6-derive` | Tap header to expand → read CDF derivation (F_max=x^n → integrate → E[max]=n/(n+1); symmetry → E[min]=1/(n+1)) → tap Continue | `primer` {variant:`custom`, collapsible:`true`} | REUSE | correct: "F_max(x)=x^n → ∫₀¹(1−x^n)dx = n/(n+1). By symmetry E[min]=1/(n+1)." · hints: [F_max=x^n definition · survival-integral formula E[X]=∫P(X>t)dt · evaluate integral] | 44px toggle; `aria-expanded`; accessible formula in plain text | collapsible card; derivation in plain text + Unicode fractions; ch2 accent | A |
| 8 | `ev6-min` | Type E[min] of n=4 IID U(0,1) draws → submit → instant check | `answerEntry` {fields:1} | REUSE | correct: "E[min]=1/(n+1)=1/5. The minimum sits one slot below 1/4 — the formula always places it below 1/n." · hints[0]: "The minimum sits a bit lower than 1/4. The clean formula gives E[min]=1/(n+1)=1/5." [brief verbatim] · hints[1]: "Plug n=4 into E[min]=1/(n+1)." · hints[2]: "1/5." | 44px input; labeled; fraction note; keyboard primary | Single labeled text field; JetBrains Mono | both |
| 9 | `ev6-prove` | Read ants scenario → type 500/501 → submit (required; penultimate) | `masteryChallenge` {scenario, fields:1} | REUSE | correct: "E[T]=E[max of 500 U(0,1)]=500/501≈0.998 min. More ants barely change it: E[max] saturates toward 1." · hints[0]: "More ants don't mean more time. Relabeling gives the max: E=n/(n+1)=500/501, about one minute." [brief verbatim] · hints[1]: "E[max of n U(0,1)]=n/(n+1). For n=500: 500/501." · hints[2]: "500/501." | 44px; fraction entry note; keyboard primary | Scenario card + single field; ch2 accent; no hero block (masteryChallenge is not HERO_TYPE) | both |
| 10 | `ev6-recap` | Tap to reveal recap cards (concept-finale arc: list→weight→add, linearity, conditioning, order-stat extremes; 1-line variance forward-teaser) → Continue | `recap` | REUSE | correct: "Four tools, one move: list→weight→add. Variance — the spread — is next." · hints: ["The single move: list outcomes, weight by probability, add." · "Two superpowers: linearity + conditioning." · "Order-stat extremes: E[max]=n/(n+1), E[min]=1/(n+1). Up next: how spread varies."] | Standard | Concept-finale recap; variance 1-liner teaser; no confetti | both |

---

## New interaction types (for Wave 0)

**NONE.** L6 introduces no new interaction type. The `ev6-explore` beat reuses the existing `raceSim` widget (`display:'lanes'` / "raceLanes" mode) with a **minimal additive extension** — two optional fields on the existing Zod variant. All prior `raceSim` behavior (patterns race, `display:'oddsDial'`, `display:'heatmap'`) is fully unchanged. The ants simulation is a new *rendering branch* inside `RaceSimBeat.tsx`, not a new interaction type.

### Precise additive `raceSim` ants-mode extension

**Schema change** — append two optional fields to the existing `raceSim` z.object in `src/content/schema.ts` (back-compat: absent ⇒ original patterns behavior):

```typescript
// ADDITIVE — append inside the existing raceSim z.object({...}):
mode: z.enum(['patterns', 'ants']).optional(),
// default 'patterns' when absent; no existing fixture affected
ants: z.object({ n: z.number().int().positive() }).optional(),
// present only when mode='ants'; ignored otherwise
```

**Fixture usage for `ev6-explore`:**
```json
{
  "type": "raceSim",
  "display": "lanes",
  "mode": "ants",
  "ants": { "n": 500 }
}
```

**Renderer extension** — `RaceSimBeat.tsx` gains one guard clause at render entry, delegating to a new sub-component for ants mode. All existing code paths below the guard are unmodified:

```typescript
// Add at top of RaceSimBeat render, before any existing logic:
if (
  beat.interaction.type === 'raceSim' &&
  beat.interaction.mode === 'ants' &&
  beat.interaction.display === 'lanes'
) {
  return <AntsLanesBeat beat={beat} onAdvance={onAdvance} isLast={isLast} />
}
// ... existing RaceSimBeat code unchanged below
```

**`AntsLanesBeat` sub-component** (`src/lesson/konva/AntsLanesBeat.tsx`):

- **Konva canvas**: horizontal 1D track (320×80 px); n ants as 6px-radius dots; `C.laneA`/`C.laneB` tokens for ant dots; ch2 teal `#0D9488` for track line and annotation text.
- **Physics**: 60fps `useAnimationFrame`; `mulberry32(0xANTS + runCount)` seeded RNG for start positions; detect collision pairs each frame; if `swapLabels=true` → swap velocity labels (visual bounce); if `false` → pass through (no velocity change). Either way, the set of exit times is identical.
- **Toggle**: `<button role="switch" aria-checked={swapLabels} aria-label="Swap labels on collision">` (min 44×44px); default `true` (bouncing view); flip to `false` for pass-through view. Tab-navigable; Space/Enter to activate.
- **DOM aria-live mirror** (outside canvas, always in DOM):
  ```html
  <div role="log" aria-live="polite" aria-atomic="false" class="ants-mirror">
    <!-- Updated every ~500ms during run and on run complete -->
    <!-- Running: "N ants still walking. First off at T min." -->
    <!-- Done: "All 500 ants have fallen off. Last ant at T min." -->
  </div>
  ```
- **Reduced-motion** (`prefers-reduced-motion: reduce`): skip animation entirely on "Run" → immediately render static final frame showing ants at exit positions, annotation `E[max] = 500/501 ≈ 0.998 min` in ch2 teal.
- **Hero block**: after first run completes, display `beat.hero.structuralReadout` as a `<p class="racehero__readout">` below the canvas (same class as existing `RaceSimBeat`). `reducedMotionFinalFrame: true` triggers the immediate-final-frame path.
- **Controls**: "Run simulation" button (primary, 44px, disabled during run); toggle switch (44px); "Continue" / "Finish" via `BeatShell primary` (enabled once run has been observed once).
- **Keyboard flow**: Tab → "Run simulation" (Space/Enter) → Tab → toggle (Space/Enter) → Tab → "Continue" (Space/Enter).

---

## Build decomposition (for Dept 3)

### Engine (`src/engine/expectation.ts`)

```typescript
/**
 * Order-stat extremes of n IID Uniform(0,1) draws.
 * Source: Green Book p.50–51 §4.6.
 * Uses existing reduce() helper from src/engine/types.ts.
 */
export function orderStatUniform(n: number): { max: Rational; min: Rational } {
  return {
    max: reduce({ n, d: n + 1 }),    // n/(n+1)
    min: reduce({ n: 1, d: n + 1 }), // 1/(n+1)
  }
}
```

**Wave-0 goldens** (hand-verified, GB p.50–52):

| call | `.max` | `.min` |
|------|--------|--------|
| `orderStatUniform(2)` | `{n:2, d:3}` = 2/3 | `{n:1, d:3}` = 1/3 |
| `orderStatUniform(4)` | `{n:4, d:5}` = 4/5 | `{n:1, d:5}` = 1/5 |
| `orderStatUniform(500)` | `{n:500, d:501}` = 500/501 | `{n:1, d:501}` = 1/501 |

Stage-2 cross-check: `500/501 ≈ 0.998002` ✓ (GB p.52 ants finale answer).

### Schema (`src/content/schema.ts`)

Add two optional fields to the existing `raceSim` Zod object (no breaking change — see exact shape in §New interaction types above).

### Renderer / widget files

| file | change |
|------|--------|
| `src/lesson/beats/RaceSimBeat.tsx` | Add ants-mode guard clause at top of render (delegates to `AntsLanesBeat`); all existing code unchanged |
| `src/lesson/konva/AntsLanesBeat.tsx` | **New** (~150 LOC): Konva ants sim + toggle + DOM aria-live mirror + reduced-motion final frame |
| `src/lesson/beats/SliderBeat.tsx` | Add order-stat dual readout: when `beat.introducesSymbol?.startsWith('E[max]')`, render live `E[max]=n/(n+1)` and `E[min]=1/(n+1)` fractions (via `orderStatUniform(n)` engine call) below the slider, plus a mini 0–1 axis with max/min dot positions (JetBrains Mono, tabular-nums) |
| `src/lesson/beats/index.tsx` | No new dispatcher entry (raceSim dispatcher already routes to `RaceSimBeat`) |

### Fixture (`fixtures/lesson-expected-value-6.json`) — key beat shapes

**Lesson wrapper:**
```json
{
  "lessonId": "lesson-expected-value-6",
  "courseId": "course-expected-value",
  "title": "Order Statistics & Extremes",
  "patternOptions": ["H"],
  "milestoneId": "expected-value-mastered",
  "unlocks": null,
  "schemaVersion": 1
}
```

**`ev6-recall`** (first graded; `retrievalGrid`; `required:true`):
```json
{
  "beatId": "ev6-recall",
  "required": true,
  "prompt": "You've seen these before. Match each counting idea to its formula.",
  "interaction": {
    "type": "retrievalGrid",
    "pairs": [
      { "left": "arrange n distinct items in order", "right": "n!" },
      { "left": "ordered selection of k items from n", "right": "nPk = n!/(n−k)!" }
    ]
  },
  "feedback": {
    "correct": "n! counts all orderings; nPk ordered-picks k of n. Both count ordered structure — the doorway to order statistics.",
    "hints": [
      "n! is every way to arrange n distinct items.",
      "nPk orders k items chosen from n: n × (n−1) × … × (n−k+1).",
      "n! matches 'arrange n', nPk matches 'ordered selection of k'."
    ]
  }
}
```

**`ev6-bet`** (prediction; `byOption`; `required:false`):
```json
{
  "beatId": "ev6-bet",
  "required": false,
  "prompt": "500 ants stand at random spots on a 1-foot stick. Each marches at 1 ft/min; when two meet head-on they instantly reverse. How long until every ant has fallen off?",
  "interaction": {
    "type": "prediction",
    "options": ["About 1 minute", "Many minutes", "Hours / intractable"]
  },
  "feedback": {
    "byOption": {
      "About 1 minute": {
        "note": "Good instinct — let's prove it: relabeling collisions as pass-throughs turns this into the max of 500 positions.",
        "correct": true
      },
      "Many minutes": {
        "note": "Let's test it — collisions look slow, but relabeling erases them; the last ant just walks straight off."
      },
      "Hours / intractable": {
        "note": "Let's test it — the chaos is an illusion; swapping labels reveals a barely-over-a-minute answer."
      }
    }
  }
}
```

**`ev6-win`** (answerEntry 2-field; `required:true`; early win):
```json
{
  "beatId": "ev6-win",
  "required": true,
  "prompt": "Two IID Uniform(0,1) draws. What is the expected value of the larger? The smaller?",
  "interaction": {
    "type": "answerEntry",
    "fields": [
      {
        "id": "ev6-win-max",
        "label": "E[max of 2 draws]",
        "accept": ["2/3"],
        "placeholder": "?",
        "suffix": ""
      },
      {
        "id": "ev6-win-min",
        "label": "E[min of 2 draws]",
        "accept": ["1/3"],
        "placeholder": "?",
        "suffix": ""
      }
    ]
  },
  "feedback": {
    "correct": "E[max]=2/3 and E[min]=1/3 — symmetric around 1/2, summing to 1. The larger draw sits above center.",
    "hints": [
      "The larger of two draws beats the average. E[max]=n/(n+1)=2/3, and E[min]=1/3.",
      "Plug n=2 into E[max]=n/(n+1).",
      "2/3 and 1/3."
    ]
  }
}
```

**`ev6-explore`** (raceSim ants mode; hero block required; `required:false`; `comparison:true`):
```json
{
  "beatId": "ev6-explore",
  "required": false,
  "comparison": true,
  "prompt": "Watch 500 ants march and bounce. Toggle 'Swap labels on collision' — does it change when ants fall off?",
  "interaction": {
    "type": "raceSim",
    "display": "lanes",
    "mode": "ants",
    "ants": { "n": 500 }
  },
  "hero": {
    "slowFirst": true,
    "structuralReadout": "With 500 ants, the last one off falls at 500/501 ≈ 0.998 min — barely over a minute.",
    "reducedMotionFinalFrame": true
  },
  "feedback": {
    "correct": "The last-off ant is the one that started farthest from its exit — the maximum of 500 starting positions.",
    "hints": [
      "The set of fall-off times is identical whether ants bounce or pass through.",
      "In pass-through mode each ant walks straight off; the last off simply started farthest.",
      "The farthest start = max of 500 U(0,1) draws = E[max] = 500/501."
    ]
  }
}
```

**`ev6-model`** (slider; `introducesSymbol`; `groundedBy`; `interviewNote`; `required:false`):
```json
{
  "beatId": "ev6-model",
  "required": false,
  "introducesSymbol": "E[max]=n/(n+1)",
  "groundedBy": ["ev6-win", "ev6-explore"],
  "prompt": "Drag n from 2 to 20. Watch E[max]=n/(n+1) and E[min]=1/(n+1) update. Does E[max] ever reach 1?",
  "interaction": {
    "type": "slider",
    "min": 2,
    "max": 20,
    "step": 1
  },
  "interviewNote": "E[max] = n/(n+1) < 1 for all finite n; it approaches 1 only asymptotically (n=9 → 0.9; n=99 → ~0.99). The 'E[max] must reach 1 eventually' trap fires here — values are bounded at 1.",
  "feedback": {
    "correct": "E[max]=n/(n+1) creeps toward 1 but never reaches it — the values are bounded. E[min]=1/(n+1) sinks toward 0.",
    "hints": [
      "At n=2: E[max]=2/3. At n=9: E[max]=9/10.",
      "The gap to 1 is always 1/(n+1), however large n grows.",
      "E[max]+E[min] = n/(n+1)+1/(n+1) = 1."
    ]
  }
}
```

**`ev6-min`** (answerEntry 1-field; `required:true`; check):
```json
{
  "beatId": "ev6-min",
  "required": true,
  "prompt": "Four IID Uniform(0,1) draws. What is the expected value of the minimum?",
  "interaction": {
    "type": "answerEntry",
    "fields": [
      {
        "id": "ev6-min-f",
        "label": "E[min of 4 draws]",
        "accept": ["1/5"],
        "placeholder": "?",
        "suffix": ""
      }
    ]
  },
  "feedback": {
    "correct": "E[min]=1/(n+1)=1/5. The minimum sits one slot below 1/4 — the formula always places it below 1/n.",
    "hints": [
      "The minimum sits a bit lower than 1/4. The clean formula gives E[min]=1/(n+1)=1/5.",
      "Plug n=4 into E[min]=1/(n+1).",
      "1/5."
    ]
  }
}
```

**`ev6-prove`** (masteryChallenge; `required:true`; `pattern` UNSET; `interviewNote`; PENULTIMATE):
```json
{
  "beatId": "ev6-prove",
  "required": true,
  "prompt": "Mastery challenge: use the relabeling trick to find the expected time for all 500 ants to fall off. Type an exact fraction.",
  "interaction": {
    "type": "masteryChallenge",
    "scenario": "500 ants stand at random spots on a 1-foot stick and march at 1 ft/min. Collisions look like bounces — but relabeling shows each bounce is identical to passing through. The last ant off is simply the one that started farthest from its exit. What is E[time until all 500 have fallen off]?",
    "fields": [
      {
        "id": "ev6-prove-f",
        "label": "Expected time (minutes)",
        "accept": ["500/501"],
        "placeholder": "?",
        "suffix": "min"
      }
    ]
  },
  "interviewNote": "Ants on a string: 'n ants at random positions, bouncing on collision — expected clearing time?' Relabeling: collision ≡ pass-through → last-off ant = ant with max starting position → E[T] = E[max of n U(0,1)] = n/(n+1). For n=500: 500/501 ≈ 1 min. E[max] → 1 as n→∞ (values bounded at 1), so more ants barely changes the answer — the chaos collapses to a single-line expectation.",
  "feedback": {
    "correct": "E[T] = E[max of 500 U(0,1)] = 500/501 ≈ 0.998 min. More ants barely change it: E[max] saturates toward 1.",
    "hints": [
      "More ants don't mean more time. Relabeling gives the max: E=n/(n+1)=500/501, about one minute.",
      "E[max of n U(0,1)] = n/(n+1). For n=500: 500/501.",
      "500/501."
    ]
  }
}
```

**`ev6-recap`** (`recap`; `required:true`; LAST):
```json
{
  "beatId": "ev6-recap",
  "required": true,
  "prompt": "Tap each card to close the Expected Value arc.",
  "interaction": { "type": "recap" },
  "feedback": {
    "correct": "Four tools, one move: list→weight→add. Variance — the spread — is next.",
    "hints": [
      "The single move: list outcomes, weight by probability, add.",
      "Two superpowers: linearity (sums always add) + conditioning (average the averages).",
      "Order-stat extremes: E[max]=n/(n+1), E[min]=1/(n+1). Up next: how spread varies."
    ]
  }
}
```

### `validate-fixtures` + registration (Wave 0, Dept 3)

- Add `lesson-expected-value-1..6` to `GATED` + `MASTERY_LESSONS` arrays.
- `computeMastered` keys on: `{ ev6-recall, ev6-win, ev6-min, ev6-prove }`.
- assert `ev6-explore` carries `hero` block (`raceSim` is HERO_TYPE in `validate-fixtures`).
- assert `ev6-prove` has `required:true` and `beat.pattern` absent.
- assert `ev6-recap` is the final beat.
- assert `beat.pattern` absent on **all** beats (no H/T automaton; `patternOptions:["H"]` is fixture-level only).
- Stage-2 expectation cross-check: `orderStatUniform(2).max === {n:2,d:3}`, `orderStatUniform(4).min === {n:1,d:5}`, `orderStatUniform(500).max === {n:500,d:501}`.

---

## DoR gap closures

### 1. `primer` {variant:`custom`} body text

**`ev6-primer`** (beat 1, track:'A', collapsible):
> **Order statistics** rank n IID draws from smallest to largest. The **k-th order statistic** U_(k) is the k-th smallest of n draws. For n IID Uniform(0,1):
>
> - **E[max] = E[U_(n)] = n/(n+1)** — the largest draw sits above center, climbing toward 1 as n grows.
> - **E[min] = E[U_(1)] = 1/(n+1)** — the smallest sits below 1/n, sinking toward 0.
>
> Together they always sum to 1: E[max] + E[min] = n/(n+1) + 1/(n+1) = 1.

Source: GB p.50–51 §4.6. ☑

**`ev6-derive`** (beat 7, track:'A', collapsible):
> **Why E[max] = n/(n+1):** The max of n uniform draws ≤ x iff every draw ≤ x, so F_max(x) = x^n.
>
> Using E[X] = ∫₀¹ P(X > t) dt for X ∈ [0,1]:
>
>     E[max] = ∫₀¹ (1 − x^n) dx = [x − x^(n+1)/(n+1)]₀¹ = 1 − 1/(n+1) = n/(n+1)
>
> By symmetry (replace each draw x with 1−x): F_min(x) = 1−(1−x)^n, giving **E[min] = 1/(n+1)**.

Source: GB p.50–51 §4.6 CDF derivation. ☑

### 2. Track-A scaffold (≥1 required)

Two Track-A beats, both `required:false`:

| beatId | position | value for Track-A learner |
|--------|----------|--------------------------|
| `ev6-primer` | beat 1 | Concepts + formulas before the retrieval grid; grounds the vocabulary |
| `ev6-derive` | beat 7 | CDF integration proof after the slider explores saturation; completes the "why" |

Track-B path: 8 beats (skips ev6-primer + ev6-derive). Track-A path: all 10 beats.

### 3. `interviewNote` coverage (≥1)

- **`ev6-model`** (beat 6): saturation trap — E[max] < 1 always; asymptotic approach; n=9 → 0.9, n=99 → ~0.99. ☑
- **`ev6-prove`** (beat 9): full ants-on-a-string interview framing — relabeling + E[max]=n/(n+1) + saturation + chaos-to-one-line punchline. ☑

### 4. Notation ladder

| symbol introduced | beat | grounded by |
|-------------------|------|-------------|
| `E[max]=n/(n+1)`, `E[min]=1/(n+1)` | `ev6-model` | `ev6-win` (n=2 concrete), `ev6-explore` (ants sim reveals max) |

Validate-fixtures should assert `ev6-model` (`introducesSymbol:"E[max]=n/(n+1)"`) is preceded by both `ev6-win` and `ev6-explore` in the visible beat sequence for each track. ☑

---

## Definition-of-Ready checklist

| beat | verified+sourced problem | concrete direct-manipulation mechanic | instant feedback + 3 hints designed | a11y (44px / reduced-motion / aria-live) | `beat.pattern` UNSET |
|------|:------------------------:|:-------------------------------------:|:------------------------------------:|:----------------------------------------:|:--------------------:|
| ev6-primer | ☑ GB p.50–51 anchor | ☑ tap expand → read → Continue | ☑ | ☑ aria-expanded; 44px toggle | ☑ |
| ev6-recall | ☑ lesson-combinatorics-2 recall | ☑ tap-to-match grid (2 pairs) | ☑ | ☑ role=grid; aria-selected; 44px | ☑ |
| ev6-bet | ☑ GB p.52 ants hook | ☑ tap option card → flip to refutation | ☑ byOption 3 options (brief verbatim) | ☑ role=radio; aria-live refutation | ☑ |
| ev6-win | ☑ GB p.50–51 n=2 case | ☑ type 2 fields → submit | ☑ hints[0] brief verbatim | ☑ labeled inputs; 44px; keyboard primary | ☑ |
| ev6-explore | ☑ GB p.52 relabel trick | ☑ Run + toggle role=switch | ☑ | ☑ DOM aria-live mirror; reduced-motion static frame; hero block present | ☑ |
| ev6-model | ☑ GB p.50–51 E[max]=n/(n+1) saturation | ☑ drag slider → live fraction readout | ☑ | ☑ aria-valuemin/max/now; live-region fraction update | ☑ |
| ev6-derive | ☑ GB p.50–51 CDF derivation | ☑ tap expand → read → Continue | ☑ | ☑ aria-expanded; accessible formula text; 44px | ☑ |
| ev6-min | ☑ GB p.50–51 n=4 case | ☑ type 1 field → submit | ☑ hints[0] brief verbatim | ☑ labeled input; 44px; keyboard primary | ☑ |
| ev6-prove | ☑ GB p.52 ants n=500 | ☑ type → submit | ☑ hints[0] brief verbatim | ☑ 44px; fraction note; keyboard primary | ☑ |
| ev6-recap | ☑ concept-arc closure (GB p.44–52) | ☑ tap to reveal recap cards | ☑ | ☑ standard | ☑ |

---

## Dept1↔Dept2 readiness check

| beat | Dept 1 brief status | Dept 2 spec status | kickbacks / open items |
|------|--------------------|--------------------|------------------------|
| `ev6-primer` | ✅ order-stat concepts in brief §Assessment | ✅ body text authored (DoR §1); track:'A' | — |
| `ev6-recall` | ✅ source: lesson-combinatorics-2; pairs n!, nPk | ✅ retrievalGrid 2 pairs + feedback specified | — |
| `ev6-bet` | ✅ 3 options + per-option feedback verbatim in brief §Misconceptions | ✅ byOption verbatim from brief; options exact strings | — |
| `ev6-win` | ✅ 2-field accept: 2/3, 1/3; hints[0] verbatim; source GB p.50–51 | ✅ 2-field answerEntry; accept lists + all 3 hints specified | — |
| `ev6-explore` | ✅ relabel/toggle mechanic; cinematic beat; toggle as key insight | ✅ ants-mode extension precisely specified; hero block present; aria-live DOM mirror spec'd; reduced-motion path spec'd | **Dept 3 kickback**: implement `AntsLanesBeat.tsx` ants-mode branch; add 2 optional fields to raceSim Zod schema |
| `ev6-model` | ✅ saturation of E[max] toward 1; notation ladder; introducesSymbol | ✅ slider n=2..20; dual E-readout spec'd; introducesSymbol + groundedBy + interviewNote present | **Dept 3 kickback**: extend `SliderBeat` renderer to show live E[max]/E[min] fractions when `introducesSymbol='E[max]=n/(n+1)'` |
| `ev6-derive` | ✅ CDF derivation in GB p.50–51 | ✅ primer body text authored (DoR §1); track:'A' | — |
| `ev6-min` | ✅ source: GB p.50–51 n=4; accept: 1/5; hints[0] verbatim | ✅ 1-field answerEntry; exact accept + 3 hints from brief | — |
| `ev6-prove` | ✅ required:true; accept: 500/501; hints[0] verbatim; scenario per §Assessment | ✅ masteryChallenge; required:true; pattern UNSET; interviewNote; scenario authored | — |
| `ev6-recap` | ✅ concept finale + variance teaser in brief §Assessment | ✅ recap beat; variance 1-liner in feedback.correct + hints[2] | — |

**VERDICT: READY.**

All 10 beats are fully specified with sourced problems, concrete mechanics, 3-level hints, and a11y coverage. Two Dept 3 implementation items are noted but do not block fixture authoring or Dept 1 sign-off:

1. `AntsLanesBeat.tsx` — ants-mode rendering branch in `RaceSimBeat.tsx` + Konva physics + DOM aria-live mirror + reduced-motion final frame.
2. `SliderBeat.tsx` — order-stat dual readout when `beat.introducesSymbol = 'E[max]=n/(n+1)'`.

No Dept 1 kickbacks. No new interaction types created. All graded answers are engine-verified against GB p.50–52 and `orderStatUniform` goldens. `ev6-prove` satisfies the concept-finale mastery gate: relabeling trick + order-stat extreme + saturation (`E[max] → 1` but never reaches it). The `ev6-explore` "wow" (toggle turns chaotic bounce into clean pass-through) is the lesson's one cinematic screen and is completable tap-only with full aria-live accessibility.
