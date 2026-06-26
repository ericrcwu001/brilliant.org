# Interaction Spec: Coupon Collector  (lesson-expected-value-5)

Chapter `ch-expected-value-3`, accent `--ch2` teal `#0D9488`. Design tokens: Space Grotesk (headings/formula), Inter (body), JetBrains Mono tabular-nums (Σ panel). No confetti. The "wow": simulated progress visibly STALLING near the end, running Σ creeping to `14.7`.

---

## Beat table (final order)

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse or NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|----------------------------------------|-----------------|--------------|-----------------|------|--------------|-------|
| 1 | `ev5-primer-geom` | Tap collapsed card to expand; read E=1/p + H_N definition; tap "Got it" | `primer` variant:`custom` collapsible:true | reuse | None graded; "Got it" advances | 44 px tap zone; Enter key; reduced-motion: always-expanded | `--ch2` card tint; collapsed by default | A |
| 2 | `ev5-recall` | Tap left cell → matching right cell; mismatch → red flash → retry; match → `--ch2` fade-in; all 4 matched → submit | `retrievalGrid` | reuse | correct: "Good — each geometric wait costs 1/p; a full set chains several." hints[3] | 44 px cells; Tab+Enter; aria-live "n pairs remaining" | `--ch2` tint on match; shake on mismatch; no motion | both |
| 3 | `ev5-bet` | Tap one of 3 prediction chips; per-option inline note appears; no gate | `prediction` byOption | reuse | byOption 3-note (verbatim from brief); ✓ option = "Around 12–15" | 44 px chips; tap primary | `--ch2` selection ring; no motion | both |
| 4 | `ev5-win` | Type whole number into field; tap Submit; hints on wrong | `answerEntry` accept:`["6"]` | reuse | correct: "E=1/p=6 — the last type is the slowest, averaging 6 boxes alone." hints[3] | 44 px field+submit; keyboard Enter; aria-live on hint reveal | `--ch2` focus ring; no motion | both |
| 5 | `ev5-explore` | Tap "Draw box"; box reveals toy type; collected-type grid updates; running Σ panel increments; stage-prob pill shrinks; progress stalls near last type; set complete → "Run again" | `couponCollectorSim` n:6 hero | **NEW** | correct: "Set complete — the last type alone cost the most boxes." hints[3]; UNGRADED | 44 px "Draw box"; Space/Enter repeats draw; aria-live="polite" on (a) Σ total, (b) stage prob, (c) new-type found (aria-live="assertive"); reduced-motion: static final frame | **cinematic hero**; `--ch2` glow on new type found; stage-prob pill transitions; JetBrains Mono tabular-nums Σ panel; stall near end is the "wow" | both |
| 6 | `ev5-model` | Read formula card; tap "I see it" to acknowledge | `primer` variant:`custom` collapsible:false | reuse | correct: "E[full set]=N·H_N — linearity threads six geometric waits into one total." hints[3] | 44 px confirm tap; aria-label on Σ expression | `--ch2`; Space Grotesk formula display; per-stage terms appear sequentially; reduced-motion: fully visible static | both |
| 7 | `ev5-stage-scaffold` | Tap collapsed card to expand; read counting step: (N−k) new types → p=(N−k)/N → E=N/(N−k) | `primer` variant:`custom` collapsible:true | reuse | None graded; "Got it" advances | 44 px tap zone; reduced-motion: always-expanded | `--ch2` card tint | A |
| 8 | `ev5-stage` | Type fraction into field; tap Submit; hints on wrong | `answerEntry` accept:`["3/2","1.5"]` | reuse | correct: "p=4/6=2/3, E=1/p=3/2 — (N−k)/N falls as you collect, not constant 1/N." hints[3] | 44 px field+submit; keyboard Enter; aria-live on hint | `--ch2` focus ring; no motion | both |
| 9 | `ev5-prove` | Type fraction into field; tap Submit; hints on wrong; **REQUIRED** | `masteryChallenge` required:true | reuse | correct: "6·H₆=6·(49/20)=147/10. Growth is N·ln N — double the types, more than double the boxes." hints[3] | 44 px field+submit; keyboard Enter; aria-live on hint | `--ch2` focus ring; no motion | both |
| 10 | `ev5-recap` | Tap to reveal recap cards; read the close | `recap` required:true | reuse | correct: "A full set = sum of ever-longer geometric waits. N·H_N sets up the extremes ahead in L6." hints[3] | 44 px tap; aria-live | `--ch2` card; no confetti; reduced-motion: all cards visible | both |

**Beat field summary** (all beats): `pattern` UNSET everywhere — lesson `patternOptions:["H"]`. `ev5-model` carries `introducesSymbol:"N·H_N"`, `groundedBy:["ev5-win","ev5-explore"]`, `comparison:true`, `interviewNote`. `ev5-explore` carries `hero`. `ev5-prove` and `ev5-recap` carry `required:true`.

---

## New interaction types (for Wave 0)

### `couponCollectorSim`

**Frozen Zod schema** (add to `InteractionSchema` discriminated union in `src/content/schema.ts`):

```typescript
// couponCollectorSim — draw boxes until all N types collected. A live panel shows
// the running Σ N/(N−i+1) climbing toward N·H_N while the per-stage hit-prob
// (N−k)/N visibly shrinks (progress stalls near the end). DOM/SVG; tap "draw box".
z.object({
  type: z.literal('couponCollectorSim'),
  n: z.number().int().positive(),                   // coupon types N (e.g. 6)
  accept: z.array(z.string()).optional(),           // graded read-off of N·H_N (UNGRADED in L5 — omit)
})
```

**GRADED_TYPES**: do **NOT** add `couponCollectorSim` (ungraded in L5; `accept` absent in fixture). Future lessons may set `accept` to grade the read-off.

**Renderer: `CouponCollectorSimBeat.tsx`** — add dispatch entry in `src/lesson/beats/index.tsx`:
```typescript
case 'couponCollectorSim': return <CouponCollectorSimBeat beat={beat} />
```

**Engine dep: `src/engine/expectation.ts`**
- `harmonic(n): Rational` — H_N = Σ_{k=1}^{N} 1/k (exact rational)
- `couponCollector(n): Rational` — N · H_N (exact rational)

---

## Build decomposition (for Dept 3)

### Engine fns + goldens (`src/engine/expectation.ts`)

```typescript
/** H_N = 1 + 1/2 + 1/3 + … + 1/N  (exact rational, no floats) */
function harmonic(n: number): Rational
// harmonic(1) → {n:1, d:1}
// harmonic(2) → {n:3, d:2}
// harmonic(3) → {n:11, d:6}
// harmonic(6) → {n:49, d:20}       ← L5 golden (H₆ = 49/20)

/** N · H_N = expected draws to collect all N coupon types */
function couponCollector(n: number): Rational   // = ratMul({n, d:1}, harmonic(n))
// couponCollector(6) → {n:147, d:10}           ← L5 golden (147/10 = 14.7)

// Per-stage derived (not top-level exports; used inline in renderer + fixture assertions):
// stageWait(N, k) = N/(N−k)   (k types already held)
// stageWait(6, 0) → {n:1,  d:1}   = 1    (first type; p = 6/6)
// stageWait(6, 2) → {n:3,  d:2}   = 3/2  ← ev5-stage golden
// stageWait(6, 5) → {n:6,  d:1}   = 6    ← ev5-win golden
// stageWait(6, 6) → undefined/error (set already complete)
```

Stage-2 expectation cross-check: `couponCollector(6)` must equal `ratAdd` of the six `stageWait(6, k)` for k=0..5. Assert in `src/engine/expectation.test.ts`.

### Schema variant

Add to `InteractionSchema` discriminated union **after** the `retrievalGrid` entry (alphabetical placement not required; keep with EV-concept types):

```typescript
z.object({
  type: z.literal('couponCollectorSim'),
  n: z.number().int().positive(),
  accept: z.array(z.string()).optional(),
}),
```

### Renderer + props (`src/lesson/beats/CouponCollectorSimBeat.tsx`)

DOM/SVG widget (no Konva); reads CSS `--ch2` (`#0D9488`) and `--ch2-tint` from the DOM.

**Props** (from `Beat & { interaction: { type: 'couponCollectorSim'; n: number; accept?: string[] } }`):
- `n` — coupon types count
- `slowFirst` — from `beat.hero?.slowFirst`; drives 500 ms/box auto-advance on first run

**Widget anatomy:**

| Region | Description |
|--------|-------------|
| Toy grid | N pill cells labeled 1…N; collected → `--ch2` fill; uncollected → muted; `--ch2` glow pulse on newly found type |
| "Draw box" button | 44 px min-height; Space/Enter fires one draw; disabled once set complete |
| Σ panel | JetBrains Mono tabular-nums; displays `"6/6 + 6/5 + 6/4 + … = {runningDecimal}"` updating each step; `aria-live="polite"` wraps the running total only |
| Stage-prob pill | `"Next-new prob: (N−k)/N = {n−k}/{n} ≈ {decimal}"` updating on each new-type discovery; `aria-live="polite"` |
| Stage list | Collapsible; one row per stage; lights `--ch2` when that stage completes |
| New-type announcement | `aria-live="assertive"` region: `"Found type {x}! {k} of {n} collected. Next-new probability: {(n−k)/n}."` |

**Hero mode** (`beat.hero.slowFirst = true`): first run auto-advances at 500 ms/box so the learner watches the stall; after set-complete the learner takes over and draws manually on subsequent runs.

**Reduced-motion final frame** (`@media (prefers-reduced-motion: reduce)`): skip animation; render final state — all N types filled, Σ = `"N·H_N = 147/10 = 14.7"` displayed statically; "Draw box" replaced by "Show final state" which jumps immediately to complete.

**Live Σ panel contract:**
```
After k types collected, stages 0..(k−1) are complete. Display:
  terms = [6/6, 6/5, …, 6/(n−k+1)]  (completed stages)
  runningTotal = sum of terms as decimal (e.g. "5.70" after 4 of 6 found)
  Panel: "6/6 + 6/5 + 6/4 + 6/3 = 5.70 …"
```

### Fixture JSON (`fixtures/lesson-expected-value-5.json`)

```json
{
  "lessonId": "lesson-expected-value-5",
  "courseId": "course-expected-value",
  "title": "Coupon Collector",
  "patternOptions": ["H"],
  "milestoneId": "coupon-collector-mastered",
  "unlocks": "lesson-expected-value-6",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "ev5-primer-geom",
      "required": false,
      "track": "A",
      "prompt": "Quick recap before the boxes — read the card, then continue.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Geometric wait and the harmonic sum",
        "body": "If each try succeeds with probability p, the expected number of tries is E = 1/p. Chaining N such waits with shrinking probabilities gives the harmonic sum H_N = 1 + 1/2 + 1/3 + … + 1/N. For N = 6: H₆ = 1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6 = 49/20 = 2.45.",
        "collapsible": true
      },
      "feedback": {
        "correct": "E = 1/p — the building block for every stage ahead.",
        "hints": [
          "E = 1/p for a geometric wait.",
          "H_N is the sum of 1/k for k = 1 to N.",
          "Continue."
        ]
      }
    },
    {
      "beatId": "ev5-recall",
      "required": true,
      "prompt": "Before the boxes, match each random wait to its expected count.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "Each try succeeds with prob p", "right": "E = 1/p" },
          { "left": "Fair coin flip (p = 1/2)", "right": "E = 2" },
          { "left": "One face of a fair die (p = 1/6)", "right": "E = 6" },
          { "left": "Next new type (k of N held)", "right": "E = N/(N−k)" }
        ]
      },
      "feedback": {
        "correct": "Good — each geometric wait costs 1/p; a full set chains several such waits.",
        "hints": [
          "Tap a description, then its expected wait.",
          "p = 1/6 gives E = 6; p = 1/2 gives E = 2.",
          "E = N/(N−k) is the per-stage formula when k types are held."
        ]
      }
    },
    {
      "beatId": "ev5-bet",
      "required": false,
      "prompt": "You want the full set of 6 toy types. Each cereal box is equally likely to hold any one of the 6. How many boxes do you expect to buy?",
      "interaction": {
        "type": "prediction",
        "options": ["Just over 6", "About 8", "Around 12–15"]
      },
      "feedback": {
        "byOption": {
          "Just over 6": {
            "note": "Let's test it — the first toys come fast, but the last ones drag, more than doubling the total."
          },
          "About 8": {
            "note": "Let's test it — closer, but the rare final toys push it higher."
          },
          "Around 12–15": {
            "note": "Good instinct — let's prove it by summing the ever-longer waits for each new toy.",
            "correct": true
          }
        }
      }
    },
    {
      "beatId": "ev5-win",
      "required": true,
      "prompt": "You've found 5 of the 6 toy types. Only one is still missing, and it appears in 1 of every 6 boxes. How many more boxes do you expect to buy?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "last-type",
            "label": "Expected boxes for the last type",
            "accept": ["6"],
            "placeholder": "?",
            "suffix": "boxes"
          }
        ]
      },
      "feedback": {
        "correct": "E = 1/p = 1/(1/6) = 6 — the last type is the slowest, averaging 6 boxes alone.",
        "hints": [
          "Only 1 of 6 boxes now helps, so the last type isn't quick: E = 1/p = 6.",
          "p = 1/6, so E = 1/p = 6.",
          "E = 6."
        ]
      }
    },
    {
      "beatId": "ev5-explore",
      "required": false,
      "prompt": "Tap 'Draw box' to open cereal boxes until you've collected all 6 toy types. Watch the running expected total Σ N/(N−i+1) build, and notice how the per-stage hit-probability (N−k)/N shrinks as you collect.",
      "interaction": {
        "type": "couponCollectorSim",
        "n": 6
      },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "On average, the full set of 6 takes 147/10 = 14.7 boxes — the running Σ N/(N−i+1) converges to N·H₆.",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "Set complete — it took far more than 6 boxes, and the last type alone cost the most.",
        "hints": [
          "Keep drawing until all 6 toy types appear.",
          "Watch how the last type stalls the running total.",
          "Σ N/(N−i+1) converges to N·H_N ≈ 14.7."
        ]
      }
    },
    {
      "beatId": "ev5-model",
      "required": false,
      "introducesSymbol": "N·H_N",
      "groundedBy": ["ev5-win", "ev5-explore"],
      "comparison": true,
      "interviewNote": "N·H_N ~ N·ln N for large N (the integral approximation of the harmonic series). The rare last type alone costs N boxes — that single stage explains why total cost grows faster than linear; doubling N more than doubles the expected boxes. For N = 6: 14.7 boxes; for N = 52 (a full card deck): ≈ 236.",
      "prompt": "Each stage i is a geometric wait with success probability p = (N−i+1)/N, so it costs N/(N−i+1) boxes on average. By linearity of expectation (L2), E[full set] = Σ_{i=1}^{N} N/(N−i+1) = N·H_N.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "E[full set] = N·H_N",
        "body": "Six geometric waits, each longer than the last:\n  Stage 1: 6/6 = 1  (first type; p=1)\n  Stage 2: 6/5 = 1.2\n  Stage 3: 6/4 = 1.5\n  Stage 4: 6/3 = 2\n  Stage 5: 6/2 = 3\n  Stage 6: 6/1 = 6  ← the slow one\nSum = 14.7 = 6·H₆ = N·H_N. Linearity (L2) lets us add these waits without worrying about dependence between stages.",
        "collapsible": false
      },
      "feedback": {
        "correct": "E[full set] = N·H_N — linearity threads six geometric waits into one total.",
        "hints": [
          "Each stage i has hit-prob (N−i+1)/N and wait N/(N−i+1).",
          "Sum six such waits using linearity.",
          "N·H_N = 6·(49/20) = 147/10."
        ]
      }
    },
    {
      "beatId": "ev5-stage-scaffold",
      "required": false,
      "track": "A",
      "prompt": "Counting step — read, then try the next problem.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Count the new types",
        "body": "When you hold k of N types, exactly (N−k) of the N possible box outcomes show a new type. So: p = (N−k)/N, and E = 1/p = N/(N−k). Example: k = 2, N = 6 → (N−k) = 4 new types out of 6 → p = 4/6 = 2/3 → E = 3/2.",
        "collapsible": true
      },
      "feedback": {
        "correct": "p = (N−k)/N — count the new types, not 1/N.",
        "hints": [
          "N−k of the N box outcomes are new.",
          "p = (N−k)/N.",
          "E = N/(N−k)."
        ]
      }
    },
    {
      "beatId": "ev5-stage",
      "required": true,
      "prompt": "You hold 2 of the 6 toy types. A box shows a new type if it holds one of the 4 types you don't have yet. What's the expected number of boxes until your next new toy?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "next-new",
            "label": "Expected boxes for next new type",
            "accept": ["3/2", "1.5"],
            "placeholder": "?",
            "suffix": "boxes"
          }
        ]
      },
      "feedback": {
        "correct": "p = 4/6 = 2/3, so E = 1/p = 3/2. The hit-prob is (N−k)/N, falling as you collect.",
        "hints": [
          "With 2 types held, 4 of 6 boxes are new, so p = 4/6 and E = 3/2.",
          "p = (N−k)/N = 4/6 = 2/3.",
          "E = N/(N−k) = 6/4 = 3/2."
        ]
      }
    },
    {
      "beatId": "ev5-prove",
      "required": true,
      "prompt": "Mastery challenge: you buy boxes until you hold the full set of N = 6 toy types. Sum the six geometric waits. Give the expected total as an exact fraction.",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Each new type costs N/(N−k) boxes on average. Sum all six stages — but remember, the last few are expensive.",
        "fields": [
          {
            "id": "full-set",
            "label": "E[full set of 6 types]",
            "accept": ["147/10"],
            "placeholder": "?",
            "suffix": ""
          }
        ]
      },
      "feedback": {
        "correct": "6·H₆ = 6·(49/20) = 147/10 = 14.7. Growth is N·ln N — double the types, more than double the boxes.",
        "hints": [
          "Cost grows like N·ln N, not linearly. Sum the six waits: 6·H₆ = 6·(49/20) = 147/10.",
          "H₆ = 1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6 = 49/20.",
          "6·(49/20) = 294/20 = 147/10."
        ]
      }
    },
    {
      "beatId": "ev5-recap",
      "required": true,
      "prompt": "Reveal the recap cards to lock in the collection formula.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "A full set = sum of ever-longer geometric waits; N·H_N sets up the extremes ahead in L6.",
        "hints": [
          "Each new type is a geometric wait with shrinking hit-probability.",
          "Linearity sums them into N·H_N.",
          "N = 6 gives exactly 147/10 = 14.7."
        ]
      }
    }
  ]
}
```

---

## DoR gap closures

### 1. Primer `custom` (≥1 required, collapsible)

Two collapsible primers delivered; one non-collapsible formula card:

- **ev5-primer-geom** (beat #1, Track A): body = "If each try succeeds with prob p, E = 1/p. Chaining N such waits with shrinking p gives H_N = 1 + 1/2 + … + 1/N. For N = 6: H₆ = 49/20 = 2.45." Collapsible; activates before ev5-recall so the retrieval grid is not a cold start for Track-A learners; Track-B bypasses.
- **ev5-stage-scaffold** (beat #7, Track A): body = "k types held → (N−k) new → p = (N−k)/N → E = N/(N−k). Example: k=2, N=6 → p=4/6=2/3 → E=3/2." Collapsible; scaffolds the unlabeled count→weight step immediately before ev5-stage.
- **ev5-model** (beat #6, both tracks): non-collapsible formula card showing the six-stage sum; carries `introducesSymbol`/`groundedBy`/`comparison`/`interviewNote`. Always visible since it's the formula introduction.

### 2. Track-A scaffold (≥1 required: `track:'A'`, `required:false`)

Both ev5-primer-geom (#1) and ev5-stage-scaffold (#7) carry `track:'A'`, `required:false`. Track-B learners traverse the 8-beat core path (ev5-recall → ev5-bet → ev5-win → ev5-explore → ev5-model → ev5-stage → ev5-prove → ev5-recap) without either scaffold card. Track-A learners see both primers in order; neither gates progress.

### 3. `interviewNote` (≥1 required)

Placed on **ev5-model** (beat #6):
> "N·H_N ~ N·ln N for large N (the integral approximation of the harmonic series). The rare last type alone costs N boxes — that single stage explains why total cost grows faster than linear; doubling N more than doubles the expected boxes. For N = 6: 14.7 boxes; for N = 52 (a full card deck): ≈ 236."

---

## Definition-of-Ready checklist

- [x] All problems sourced: GB p.49–50 §4.5 (coupon collector, geometric waits, per-stage formula); GB p.44 Table 4.2 (E=1/p recall)
- [x] Concrete interactive mechanic per beat: every beat has direct manipulation (tap/type) or explicit acknowledgement — no passive narration
- [x] 3-level hints per graded beat: ev5-recall, ev5-win, ev5-stage, ev5-prove each carry `hints:[h1, h2, h3]`; ungraded beats carry hints for context only
- [x] `beat.pattern` UNSET on every beat; lesson `patternOptions:["H"]` (placeholder for validate-fixtures)
- [x] Notation ladder: ev5-model carries `introducesSymbol:"N·H_N"`, `groundedBy:["ev5-win","ev5-explore"]`; symbol first grounded (ev5-win shows p=1/6⇒E=6; ev5-explore shows the running Σ) before named
- [x] ev5-recall = first graded beat (`retrievalGrid`, beat #2) ✓
- [x] ev5-prove = `masteryChallenge`, `required:true`, penultimate (beat #9) ✓; `pattern` UNSET ✓
- [x] ev5-recap = `recap`, `required:true`, last (beat #10) ✓
- [x] ≥1 `primer` variant:`custom`, collapsible: ev5-primer-geom and ev5-stage-scaffold ✓
- [x] ≥1 Track-A (`track:'A'`, `required:false`): ev5-primer-geom (#1) and ev5-stage-scaffold (#7) ✓
- [x] ≥1 `interviewNote`: ev5-model ✓ (`N·H_N ~ N·ln N; rare last type costs N boxes`)
- [x] Every `prediction` beat uses `byOption` feedback: ev5-bet ✓
- [x] `couponCollectorSim` ungraded in L5: no `accept` field in ev5-explore fixture ✓
- [x] `couponCollectorSim` NOT in `GRADED_TYPES` (Dept 3 Wave 0 action)
- [x] a11y: all tap targets ≥44 px; keyboard-primary (Enter/Space) for answerEntry/masteryChallenge/couponCollectorSim; aria-live="polite" on Σ panel and stage-prob; aria-live="assertive" on new-type discovery; reduced-motion final frames defined for ev5-explore (static complete) and primers (always-expanded)
- [x] Wave 0 schema: add `couponCollectorSim` to union + dispatcher + `CouponCollectorSimBeat.tsx` (Dept 3 action)
- [x] Register `lesson-expected-value-1…6` in `GATED` + `MASTERY_LESSONS` (Dept 3 action)
- [x] `computeMastered` keys: `{ev5-recall, ev5-win, ev5-stage, ev5-prove}` (from brief; Dept 3 action)
- [x] Stage-2 engine cross-check: `harmonic(6)={n:49,d:20}`; `couponCollector(6)={n:147,d:10}`; `stageWait(6,5)={n:6,d:1}`; `stageWait(6,2)={n:3,d:2}`; sum of six `stageWait(6,k)` for k=0..5 must equal `couponCollector(6)` ✓
- [x] ev5-bet feedback verbatim from brief §Misconceptions ✓
- [x] ev5-win hints[0] verbatim: "Only 1 of 6 boxes now helps, so the last type isn't quick: E=1/p=6." ✓
- [x] ev5-stage hints[0] verbatim: "With 2 types held, 4 of 6 boxes are new, so p=4/6 and E=3/2." ✓
- [x] ev5-prove hints[0] verbatim: "Cost grows like N·ln N, not linearly. Sum the six waits: 6·H₆=6·(49/20)=147/10." ✓

---

## Dept1↔Dept2 readiness check

| beat | Dept1 spec requirement | Dept2 delivery | kickback |
|------|----------------------|---------------|---------|
| ev5-primer-geom | ≥1 primer (custom, collapsible) + ≥1 Track-A (`required:false`) | `primer` variant:`custom`, collapsible:true, track:`A`, body covers E=1/p + H_N + N=6 example | — |
| ev5-recall | `retrievalGrid`; E=1/p recall; "first graded" | 4 pairs: general E=1/p, p=1/2, p=1/6, per-stage N/(N−k); matches brief "recall geometric wait + counting" | — |
| ev5-bet | `prediction`; `byOption`; 3 options; feedback verbatim from brief | `byOption` with 3 notes verbatim from brief §Misconceptions; ✓ = "Around 12–15" | — |
| ev5-win | `answerEntry`; accept `"6"`; "guaranteed early win"; refutes "last type is as quick as first" | accept:`["6"]`; correct copy and hints[0] verbatim from brief; misconception refuted in correct copy | — |
| ev5-explore | `couponCollectorSim`; ungraded; N=6; hero; NEW type | NEW; n:6; no `accept`; `hero` block (slowFirst, structuralReadout, reducedMotionFinalFrame); aria-live + reduced-motion spec'd | **Wave 0 Dept3 build required** for schema/renderer/engine |
| ev5-model | introduces `N·H_N`; linearity over geometric waits; `interviewNote`; ungraded | `primer` variant:`custom` (formula card); `introducesSymbol:"N·H_N"`; `groundedBy:["ev5-win","ev5-explore"]`; `comparison:true`; `interviewNote` present | Dept3 note: `theorySimChart` (listed in reuse catalog) skipped in favor of `primer` — no schema change needed; confirm acceptable |
| ev5-stage-scaffold | ≥1 Track-A scaffold; unlabeled count→weight step | `primer` variant:`custom`, track:`A`, collapsible:true; body shows k=2,N=6 example → p=4/6 → E=3/2 | — |
| ev5-stage | `answerEntry`; accept `"3/2"`; check; refutes "prob=1/N regardless" | accept:`["3/2","1.5"]`; hints[0] verbatim from brief; misconception "1/N" refuted in correct copy | — |
| ev5-prove | `masteryChallenge`; `required:true`; accept `"147/10"`; `pattern` UNSET; penultimate | `required:true`; no `pattern`; accept:`["147/10"]`; scenario + 3 hints from brief; hints[0] verbatim | — |
| ev5-recap | `recap`; `required:true`; last beat; sets up L6 | `required:true`; last beat (#10); correct copy references L6 ("extremes ahead") | — |

**VERDICT: READY** — 10/10 beats spec-complete. No Dept-1 kickbacks. Two Dept-3 Wave 0 actions gate the build:
1. Implement `couponCollectorSim` schema union entry + `CouponCollectorSimBeat.tsx` renderer + `harmonic`/`couponCollector` engine fns with goldens + dispatcher entry.
2. Register `lesson-expected-value-1…6` in `GATED` + `MASTERY_LESSONS`; set `computeMastered` keys to `{ev5-recall, ev5-win, ev5-stage, ev5-prove}`.

One Dept-3 confirmation: `theorySimChart` skipped for ev5-model (no-pattern rendering unspecified); `primer` variant:`custom` used instead — no schema change required.
