# Interaction Spec: Inclusion–Exclusion  (lesson-combinatorics-4)

Chapter **ch-combinatorics-2** · accent `--ch1` (indigo `#4F46E5`) · concept capstone.
Beat count: **10** (8 core + 1 primer + 1 Track-A scaffold). `l4-prove` is penultimate; `l4-recap` is last.

---

## Beat table

| # | beatId | mechanic + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|-----------------|-----------------|-------------|--------------------------|------|----------------------|-------|
| 1 | `l4-primer` | Read collapsible "Complement & Exact Fraction" card; tap "Got it" to proceed. Never graded. | `primer` (variant `custom`) | reuse | non-graded tap-through; caption: "P(Eᶜ) = 1 − P(E); exact fraction = count ÷ total." · h1 "P(E) = 1 − P(not E): count the easier opposite." · h2 "Probability = count ÷ total, reduced to lowest terms." · h3 "Continue to the counting beats." | collapsible toggle ≥44px; keyboard-focusable; `role=region` | `--ergo-surface`; `--ch1-tint` wash; Space Grotesk title; no motion | both |
| 2 | `l4-recall` | Tap left label → right match; all 3 pairs must match. **First graded beat — longest spacing gap across the full arc (L1+L2 retrieval).** | `retrievalGrid` | reuse | ✓ "All three — the toolkit we're extending now." · h1 "Tap a concept, then its counting rule." · h2 "Independent → multiply; mutually exclusive → add." · h3 "C(52,5) = 2,598,960." | ≥44px cells; Tab/Enter to select; `aria-live="polite"` announces each correct match | `--ch1` highlight on match; `--ok-tint` flash when all matched; `--ergo-surface-2` cells | both |
| 3 | `l4-bet` | Tap one of three option cards; card reveals refutation copy from brief. Ungraded. **Must use `byOption`.** | `prediction` | reuse | byOption — "About 183 (half of 365)" → note: "The 'half of 365' instinct — but you compare every pair, and pairs pile up fast. It tips at 23." / "About 50" → "Still high — 23 people already make 253 pairs, enough to pass even odds." / "Just 23" → correct:true, "Surprising but true — 23 people form 253 pairs, plenty for a likely match." | ≥44px tap targets; Tab/Enter; `aria-live` on reveal | option cards; `--mark-tint` on select; `--ch1` accent; `--dur-slow` reveal fade | both |
| 4 | `l4-win` | Type "24" into one field; submit. **Guaranteed early win** — pins letter #1, lets the other four shuffle freely. | `answerEntry` | reuse | ✓ "Right — 4! = 24; pin letter #1 and the other four shuffle freely." · h1 "How many letters remain free once letter #1 is fixed in its envelope?" · h2 "Four free letters → 4! arrangements." · h3 "4 × 3 × 2 × 1 = 24." | ≥48px input height; keyboard-native; `aria-required`; `aria-invalid` on wrong | JetBrains Mono input; `--ok-tint` flash on correct; no hero motion | both |
| 5 | `l4-explore` | Tap ± steppers (or drag) to adjust \|A\|, \|B\|, \|A∩B\|. **WOW**: on beat entry the overlap auto-animates from 0 → initial value while the live union readout visibly decrements — making the subtraction visceral. `introducesSymbol`:`"\|A∪B\|"` `groundedBy`:`["l4-primer","l4-recall"]`. | `vennCounter` | **NEW** | non-graded explore; "The overlap region is counted twice — the formula subtracts it back: \|A∪B\| = \|A\| + \|B\| − \|A∩B\|." · h1 "Push \|A∩B\| to its max — what happens to the union?" · h2 "Larger overlap → smaller union. Shared elements are double-counted without the correction." · h3 "Set \|A∩B\| = \|A\|: then A ⊆ B and \|A∪B\| = \|B\|." | steppers ≥44px (tap/keyboard **primary path**); drag additive only; `aria-live="polite"` announces \|A\|, \|B\|, \|A∩B\|, \|A∪B\| on every change; reduced-motion → static final frame | DOM/SVG; circles `--ch1-tint`; overlap fill `--mark-tint`; `--ch1` stroke; union readout Space Grotesk tabular-nums; hero: `{slowFirst:true, structuralReadout:"\|A∪B\| = \|A\| + \|B\| − \|A∩B\|", reducedMotionFinalFrame:true}`. **One cinematic moment per screen.** | both |
| 6 | `l4-model` | Tap three lens cards: (1) general alternating formula, (2) D₅ derangement calc, (3) P = 11/30. `comparison:true`. `introducesSymbol`:"\|A∪B∪C\|" `groundedBy`:["l4-explore"]. | `tripletReveal` | reuse | ✓ "Signs alternate — the over-count from each overlap tier cancels exactly." · h1 "Each pair of sets over-counts their intersection — subtract it." · h2 "5·4! − C(5,2)·3! + C(5,3)·2! − C(5,4)·1! + 1 = 76 land right somewhere; 120 − 76 = 44 all-wrong." · h3 "44 / 120 = 11/30." | ≥44px lens cards; Tab/Enter; `aria-expanded` per card | tripletReveal cards with `--ch1-tint` header; `--dur-slow` fade per reveal | both |
| 7 | `l4-birthday-scaffold` | Drag slider n = 2 … 50; watch P(shared birthday) rise on an SVG curve; a dashed threshold marks 0.5. Learner discovers n = 23 crossing empirically. Track-A only. | `slider` | reuse | non-graded; "Watch P(shared birthday) cross the 50% line." · h1 "Count how many pairs form among n people: C(n,2) = n(n−1)/2." · h2 "With 23 people there are 253 pairs — enough to exceed 50%." · h3 "The curve crosses ½ at exactly n = 23." | React Aria `useSlider`; thumb ≥44px; `aria-valuetext` shows computed P(shared) as a percentage; reduced-motion → static frame at n = 23 | slider + SVG probability curve; `--ch1` curve; `--bad` dashed threshold at 0.5; tabular-nums value display | A |
| 8 | `l4-birthday` | Type the complement formula into a single field; submit. **Course-level unlabeled tool-pick** — probability question solved by a combinatorics complement count. | `answerEntry` | reuse | ✓ "Right — count the easy opposite (all distinct) and subtract from 1: 1 − 365·364·⋯·343/365²³." · h1 "Count the complement — P(no shared birthday) first." · h2 "P(all distinct) = 365·364·⋯·343 / 365²³." · h3 "P(at least one shared) = 1 − that fraction." | keyboard-native; JetBrains Mono formula hint well below input; `aria-required` | `--ergo-surface-2` formula hint well; no hero | both |
| 9 | `l4-prove` | Two sequential type-in fields: (1) count = 624, (2) P = 1/4165. **Mastery poker capstone** — chains multiply → choose → exact-fraction. **`required:true`. Penultimate.** `pattern` left **unset**. | `masteryChallenge` | reuse | ✓ "Exactly — 13 ranks × 48 kickers = 624, over C(52,5) = 2,598,960 → 1/4165." · h1 "13 ranks; for each, the 5th card is any of 52 − 4 = 48 remaining cards." · h2 "13 × 48 = 624 four-of-a-kind hands." · h3 "624 / 2,598,960 = 1/4165." | ≥48px inputs; keyboard; `aria-required` on both fields; `aria-invalid` on wrong; both answers announced on correct | `--ergo-surface`; `--ch1` border on submit; tabular-nums inputs; `--ok-tint` flash | both |
| 10 | `l4-recap` | Tap through three recap cards: multiply → divide-by-order → subtract-overlaps. **Closes the Combinatorics arc.** | `recap` | reuse | ✓ "Three moves — multiply, choose, subtract overlaps — enough to count anything." · h1 "Count independent choices first (multiply)." · h2 "When order doesn't matter, divide out by the arrangements (nCk)." · h3 "When sets overlap, subtract what you double-counted." | tap/keyboard; `aria-live` announces each card reveal | `--ch1-tint` backdrop; Space Grotesk summary cards; lesson-complete light-streak triggered by lesson engine (NOT this beat's own hero — one cinematic moment per screen) | both |

---

## New interaction types (for Wave 0)

> **Poker-hand counter = `masteryChallenge` reuse (`l4-prove`), NOT a 5th new type.** Only `vennCounter` is new for L4. Total new Combinatorics types: **4** (`countingTree` L1, `selectionGrid` L2, `pascalTriangle` L3, `vennCounter` L4).

### `vennCounter` — VennCounterBeat.tsx

**Frozen Zod schema** (add to `InteractionSchema` discriminated union in `src/content/schema.ts`):

```ts
z.object({
  type: z.literal('vennCounter'),
  sets: z.union([z.literal(2), z.literal(3)]).optional(),       // default 2
  maxSize: z.number().int().positive().optional(),               // per-region cap, default 30
  initial: z.object({
    a: z.number().int(),
    b: z.number().int(),
    ab: z.number().int(),
  }).partial().optional(),
  accept: z.array(z.string()).optional(),                        // optional graded read-off of |A∪B|
})
```

`vennCounter` is an **ungraded explore widget** for L4: `accept` is absent on `l4-explore`. Do NOT add to `GRADED_TYPES` in validate-fixtures. MUST be added to:
1. `InteractionSchema` discriminated union (`src/content/schema.ts`)
2. BeatView dispatcher (`src/lesson/beats/index.tsx`)
3. New renderer `src/lesson/beats/VennCounterBeat.tsx`

---

## Build decomposition (for Dept 3)

### Engine — `src/engine/combinatorics.ts`

Pure, dependency-free, BigInt-exact, no floats. Functions required for L4, with goldens:

| function | signature | L4 golden |
|----------|-----------|-----------|
| `factorial` | `(n: bigint): bigint` | `factorial(5n) === 120n` |
| `nCk` | `(n: bigint, k: bigint): bigint` | `nCk(52n, 5n) === 2598960n` |
| `unionSize` | `(a: bigint, b: bigint, ab: bigint): bigint` | `unionSize(8n, 6n, 3n) === 11n` |
| `inclusionExclusion` | `(terms: {size: bigint, sign: 1 \| -1}[]): bigint` | at-least-one-correct sum `= 76n`; verify `factorial(5n) - 76n === 44n` |
| `derangements` | `(n: bigint): bigint` via `Dₙ=(n−1)(Dₙ₋₁+Dₙ₋₂)`, D₀=1n, D₁=0n | `derangements(5n) === 44n` |
| `reduce` | `(n: bigint, d: bigint): {n: bigint, d: bigint}` | `reduce(624n, 2598960n) → {n:1n, d:4165n}` |

Cross-check invariant: `factorial(5n) - derangements(5n) === 76n` (at-least-one-correct count).

### Schema — `src/content/schema.ts`

Add the frozen `vennCounter` variant (above) to `InteractionSchema`. No other schema changes needed for L4.

### Renderer — `VennCounterBeat.tsx`

Props: `{ interaction: VennCounterInteraction; feedback: Feedback; onComplete: () => void }`

Responsibilities:
1. **Stepper controls** (− / + buttons, ≥44px each) for |A|, |B|, |A∩B| — **primary tap + keyboard path**. `min=0`, `max=interaction.maxSize ?? 30`; clamp `ab ≤ min(a, b)` at all times.
2. **Drag handles** on circle radii — additive interaction, NOT the sole path. Steppers must fully substitute drag for a11y.
3. **SVG Venn diagram** — two overlapping circles; overlap fill `--mark-tint`; circle fills `--ch1-tint`; `--ch1` stroke. DOM/SVG (not Konva). Overlap region area scales linearly with `ab`.
4. **Live formula readout** — substituted display `|A∪B| = N + N − N = N` in Space Grotesk tabular-nums; recomputes on every stepper or drag event via `unionSize(a, b, ab)`.
5. **`aria-live="polite"` region**: announces "|A| = N, |B| = N, |A∩B| = N, |A∪B| = N" on each change.
6. **Hero animation** (fires once on beat entry, before user interaction): animate `ab` from `0` → `initial.ab` over `--dur-tell` (600ms) `--ease-out`; simultaneously the union readout decrements from `a+b` → `a+b-ab`. Makes "subtract the overlap" visceral. Reduced-motion: skip animation, render final frame immediately (`reducedMotionFinalFrame:true`).
7. **Graded mode** (if `accept` present): show Submit button after any interaction; check `String(unionSize(a,b,ab))` against accept list; wire to hint ladder like other graded beats.
8. **`sets:3` variant** (not used in L4 but must be implemented for completeness): extend SVG to three circles and use `inclusionExclusion`.

### `l4-prove` masteryChallenge fixture shape

```jsonc
{
  "beatId": "l4-prove",
  "required": true,
  // pattern: intentionally absent — engine cross-check uses combinatorics.ts, not pattern automaton
  "prompt": "A 5-card hand is dealt from a standard 52-card deck. How many hands are four of a kind? Then find the exact probability.",
  "interaction": {
    "type": "masteryChallenge",
    "scenario": "Each rank (A, 2, …, K) has exactly 4 cards in the deck. A four-of-a-kind hand uses all 4 cards of one rank plus any 1 other card.",
    "fields": [
      {
        "id": "four-count",
        "label": "Four-of-a-kind hands",
        "accept": ["624"],
        "placeholder": "?",
        "suffix": "hands"
      },
      {
        "id": "four-prob",
        "label": "P(four of a kind)",
        "accept": ["1/4165"],
        "placeholder": "?"
      }
    ]
  },
  "interviewNote": "P(four-of-a-kind) = 624/C(52,5) = 1/4165 (GB p.34 §4.2). Count = 13 ranks × 48 kickers = 624; C(52,5) = 2,598,960; reduce(624, 2598960) = 1/4165.",
  "feedback": {
    "correct": "Exactly — 13 ranks × 48 kickers = 624, over C(52,5) = 2,598,960 → 1/4165.",
    "hints": [
      "13 ranks; for each rank, the 5th card is any of 52 − 4 = 48 remaining cards.",
      "13 × 48 = 624 four-of-a-kind hands.",
      "624 / 2,598,960 = 1/4165."
    ]
  }
}
```

### `l4-recall` retrievalGrid fixture pairs

```jsonc
"pairs": [
  { "left": "independent choices",          "right": "multiply" },
  { "left": "mutually exclusive outcomes",   "right": "add" },
  { "left": "C(52,5)",                       "right": "2,598,960" }
]
```

### `l4-birthday` answerEntry accept list

```jsonc
"accept": [
  "1 − 365·364·⋯·343/365²³",
  "1-365*364*...*343/365^23",
  "1-(365*364*343/365^23)",
  "complement"
]
```

Renderer normalizes by stripping spaces and replacing · with * before matching. `"complement"` accepts the correct strategy even if the learner cannot write the full formula. Graded correct only when the engine confirms P(all distinct) < 0.5 at n=23 (narrative — no float in fixture; symbolic forms above are the accept strings).

### `l4-explore` vennCounter fixture shape

```jsonc
{
  "beatId": "l4-explore",
  "required": false,
  "prompt": "Adjust the set sizes and their overlap. Watch the union update live.",
  "interaction": {
    "type": "vennCounter",
    "sets": 2,
    "maxSize": 20,
    "initial": { "a": 8, "b": 6, "ab": 3 }
    // accept absent → ungraded explore widget
  },
  "introducesSymbol": "|A∪B|",
  "groundedBy": ["l4-primer", "l4-recall"],
  "hero": {
    "slowFirst": true,
    "structuralReadout": "|A∪B| = |A| + |B| − |A∩B|",
    "reducedMotionFinalFrame": true
  },
  "feedback": {
    "correct": "The overlap region is counted twice — the formula subtracts it back: |A∪B| = |A| + |B| − |A∩B|.",
    "hints": [
      "Push |A∩B| to its max — what happens to the union?",
      "Larger overlap → smaller union. Shared elements are double-counted without the correction.",
      "Set |A∩B| = |A|: then A ⊆ B and |A∪B| = |B|."
    ]
  }
}
```

### `l4-birthday-scaffold` slider fixture shape

```jsonc
{
  "beatId": "l4-birthday-scaffold",
  "required": false,
  "track": "A",
  "prompt": "Drag the slider to change the class size. When does P(two people share a birthday) cross 50%?",
  "interaction": { "type": "slider", "min": 2, "max": 50, "step": 1 },
  "feedback": {
    "correct": "Watch P(shared birthday) cross the 50% line.",
    "hints": [
      "Count how many pairs form among n people: C(n,2) = n(n−1)/2.",
      "With 23 people there are 253 pairs — enough to exceed 50%.",
      "The curve crosses ½ at exactly n = 23."
    ]
  }
}
```

The renderer computes `P(all distinct) = ∏(365−k)/365 for k=0…n-1` client-side using floating-point (display only). The graded `l4-birthday` beat uses the exact symbolic complement form.

### Fixture overview — `fixtures/lesson-combinatorics-4.json`

Mirrors `lesson-overlap-shortcut.json` shape:
- `lessonId: "lesson-combinatorics-4"`, `courseId: "course-combinatorics"`
- `patternOptions: []` — no H/T patterns; validate-fixtures must exempt combinatorics lessons (or gate check on `courseId !== "course-combinatorics"`)
- Beat order: `l4-primer` → `l4-recall` → `l4-bet` → `l4-win` → `l4-explore` → `l4-model` → `l4-birthday-scaffold` → `l4-birthday` → `l4-prove` → `l4-recap`
- `milestoneId: "combinatorics-mastered"`, `unlocks: null`, `schemaVersion: 1`

### `validate-fixtures.ts` additions

1. Add `"lesson-combinatorics-1"` … `"lesson-combinatorics-4"` to `GATED` and `MASTERY_LESSONS`.
2. **Combinatorics engine cross-checks** (run for `courseId === "course-combinatorics"` fixtures):
   - `l4-win` `accept["24"]`: assert `factorial(4n) === 24n`
   - `l4-prove` count field `accept["624"]`: assert `13n * 48n === 624n`
   - `l4-prove` prob field `accept["1/4165"]`: assert `reduce(624n, nCk(52n,5n))` → `{n:1n, d:4165n}`
   - `l4-recall` pair `C(52,5)→2,598,960`: assert `nCk(52n,5n) === 2598960n`
   - `l4-explore` initial union: assert `unionSize(8n,6n,3n) === 11n`
3. Assert first graded beat of `lesson-combinatorics-4` has `interaction.type === "retrievalGrid"` (`l4-recall`).
4. Assert `l4-prove` has `interaction.type === "masteryChallenge"`, `required === true`, at position `beats.length - 2` (penultimate).
5. Assert last beat has `interaction.type === "recap"` (`l4-recap`).
6. Assert ≥1 beat with `interaction.type === "primer"` per `lesson-combinatorics-4` fixture.
7. Assert ≥1 beat with `interviewNote` defined per `lesson-combinatorics-4` fixture.
8. Assert every beat with `interaction.type === "prediction"` has `feedback.byOption` (not `feedback.correct`).
9. Assert `computeMastered` keys `{l4-recall, l4-win, l4-birthday, l4-prove}` (all present in fixture).
10. `vennCounter` NOT in `GRADED_TYPES`; confirm no `required:true` `vennCounter` beat exists.

---

## DoR gap closures

### Primer — `l4-primer` (variant `custom`, collapsible)

Authored above in fixture shape section. Body covers:
- **Complement**: `P(E) + P(Eᶜ) = 1 → P(E) = 1 − P(Eᶜ)`. When the target event is messy, count its opposite and subtract.
- **Exact fraction**: probability = count ÷ total, reduced by GCD. Never approximate with decimals.

Never graded, never `required`. `collapsible: true` so Track-B learners who already know these can skip past. Placed first (beat #1) so it grounds both `l4-explore` (`introducesSymbol`) and `l4-birthday` (complement usage).

### Track-A scaffold — `l4-birthday-scaffold` (track `'A'`, `required: false`)

Birthday-curve slider between `l4-model` and `l4-birthday`. Learner drags n from 2→50 and watches P(shared birthday) cross 0.5 at n=23. Provides the empirical intuition pump before `l4-birthday` demands the symbolic complement derivation. Track-A learners who want to understand *why* 23 works benefit from seeing the curve; Track-B learners skip directly to `l4-birthday`. Because `track: 'A'` and `required: false`, the Cloud Function's required-beat check still passes for Track-B users.

### interviewNote fields

- **`l4-model`** (tripletReveal): `"Derangements via inclusion-exclusion: D₅ = 44; P(all wrong) = 44/120 = 11/30 (GB p.36 §4.2). Exact recurrence: Dₙ = (n−1)(Dₙ₋₁+Dₙ₋₂), D₀=1, D₁=0."`
- **`l4-prove`** (masteryChallenge): `"P(four-of-a-kind) = 1/4165 (GB p.34 §4.2). Count = 13 × 48 = 624; C(52,5) = 2,598,960; reduce(624, 2598960) = 1/4165."` — satisfies validate-fixtures `≥1 interviewNote` gate.

---

## Definition-of-Ready checklist (every beat)

| # | beatId | ☑ verified+sourced problem | ☑ concrete mechanic | ☑ feedback + 3 hints | ☑ a11y 44px + reduced-motion + aria-live |
|---|--------|-----------------------------|----------------------|----------------------|------------------------------------------|
| 1 | `l4-primer` | N/A (no-grade) | collapsible card tap-through ✓ | caption + 3 tap-through hints ✓ | toggle ≥44px; keyboard; `role=region` ✓ |
| 2 | `l4-recall` | GB p.33–34; L1+L2 retrieval ✓ | retrievalGrid tap-match ✓ | 3 hints ✓ | ≥44px cells; `aria-live` match announcement ✓ |
| 3 | `l4-bet` | GB p.36; 23 sourced ✓ | prediction tap+reveal ✓ | byOption 3 options; correct flagged ✓ | ≥44px; `aria-live` on reveal ✓ |
| 4 | `l4-win` | GB p.36; 4!=24 sourced ✓ | answerEntry type-in ✓ | 3 hints ✓ | ≥48px input; `aria-required`; `aria-invalid` ✓ |
| 5 | `l4-explore` | GB p.33; \|A∪B\| formula ✓ | vennCounter steppers+drag ✓ | 3 hints ✓ | steppers ≥44px; `aria-live` union readout; reduced-motion final frame ✓ |
| 6 | `l4-model` | GB p.33,36; D₅=44, 11/30 ✓ | tripletReveal tap-reveal ✓ | 3 hints ✓ | ≥44px lens cards; `aria-expanded` per card ✓ |
| 7 | `l4-birthday-scaffold` | GB p.36; n=23 threshold ✓ | slider drag ✓ | 3 hints ✓ | React Aria `useSlider`; thumb ≥44px; `aria-valuetext` ✓ |
| 8 | `l4-birthday` | GB p.36; complement form ✓ | answerEntry type-in ✓ | 3 hints ✓ | ≥48px input; `aria-required`; formula hint well ✓ |
| 9 | `l4-prove` | GB p.34; 624, 1/4165 ✓ | masteryChallenge 2-field ✓ | 3 hints ✓ | ≥48px inputs; `aria-required` both; `aria-invalid` ✓ |
| 10 | `l4-recap` | capstone arc close (brief §beat 8) | recap tap-through ✓ | 3 hints ✓ | tap/keyboard; `aria-live` per card ✓ |

---

## Dept1↔Dept2 readiness check

**(a)** = verified+sourced problem + answer in Dept-1 brief · **(b)** = interaction type + mechanic fully specified by Dept 2

| # | beatId | (a) Dept-1 brief | (b) Dept-2 spec | notes |
|---|--------|-----------------|-----------------|-------|
| 1 | `l4-primer` | ✓ brief §assessment/continuity: "≥1 primer (complement/fraction)" | ✓ variant `custom`; body drafted in DoR closures | — |
| 2 | `l4-recall` | ✓ pairs sourced GB p.33–34; L1+L2 retrieval confirmed as capstone opener | ✓ `retrievalGrid`; 3 pairs specified | — |
| 3 | `l4-bet` | ✓ 23 sourced GB p.36; byOption copy verbatim in brief §per-option feedback | ✓ `prediction` + `byOption`; 3 options | — |
| 4 | `l4-win` | ✓ 4!=24 GB p.36; accept + feedback verbatim in brief §per-option feedback | ✓ `answerEntry` 1-field; accept `["24"]` | — |
| 5 | `l4-explore` | ✓ \|A∪B\| formula GB p.33; ungraded sandbox confirmed in brief §beat 4 | ✓ `vennCounter` NEW; steppers+drag; hero spec; `initial:{a:8,b:6,ab:3}` | Wave 0 renderer needed |
| 6 | `l4-model` | ✓ D₅=44, P=11/30 GB p.36; alternating sum GB p.33; confirmed ungraded in brief §beat 5 | ✓ `tripletReveal` 3-lens; lenses specified; `comparison:true` | — |
| 7 | `l4-birthday-scaffold` | ✓ n=23 threshold GB p.36; Track-A scaffold authorized in brief §gate/DoR notes | ✓ `slider`; `track:'A'`; `required:false` | — |
| 8 | `l4-birthday` | ✓ complement form GB p.36; accept strings in brief §per-option feedback | ✓ `answerEntry` 1-field; 4 accept strings; formula hint well | — |
| 9 | `l4-prove` | ✓ 624, 1/4165 GB p.34; `masteryChallenge` + `required:true` authorized in brief §assessment | ✓ `masteryChallenge` 2-field; scenario authored; `pattern` **unset** | — |
| 10 | `l4-recap` | ✓ three counting moves as capstone in brief §beat 8 | ✓ `recap`; 3 card themes specified | — |

### Kickbacks to Dept 1

**None.** All problems sourced; answers engine-verified in the brief (every ☑ engine ☑ source row confirmed).

### Kickbacks to Dept 3 (handoff items)

1. `src/engine/combinatorics.ts` — add `factorial`, `nCk`, `unionSize`, `inclusionExclusion`, `derangements`, `reduce` with BigInt goldens listed above.
2. `src/content/schema.ts` — add frozen `vennCounter` variant to `InteractionSchema` discriminated union.
3. `src/lesson/beats/VennCounterBeat.tsx` — new renderer: steppers ≥44px, SVG Venn, `aria-live`, hero animation from ab=0, reduced-motion final frame.
4. `src/lesson/beats/index.tsx` — add `vennCounter` case to BeatView dispatcher.
5. `fixtures/lesson-combinatorics-4.json` — author per this spec (10 beats, order confirmed, `pattern` absent from `l4-prove`).
6. `scripts/validate-fixtures.ts` — extend per §Build decomposition: register L1–4 in `GATED`+`MASTERY_LESSONS`; add 10 engine cross-check assertions; exempt `patternOptions:[]` for `course-combinatorics`.

---

**VERDICT: READY** — Zero Dept-1 kickbacks. All problems Green-Book-sourced and engine-verified in the brief. All interaction mechanics specified. `vennCounter` renderer + engine functions are the only Wave 0 blockers (Dept 3). Poker-hand counter delivered via `masteryChallenge` reuse (`l4-prove`) — total new types for Combinatorics concept = **4**, not 5.
