# Interaction Spec: Counting Probabilities  (lesson-combinatorics-6)

Chapter **ch-combinatorics-3** · accent `--ch3` (coral `#F0584A` / `--ch3-tint`) · Combinatorics concept capstone (probability finale).
Beat count: **10** (8 core + 1 primer + 1 Track-A scaffold). `l6-prove` is penultimate; `l6-recap` is last.

---

## Beat table

| # | beatId | mechanic + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|-----------------|-----------------|-------------|--------------------------|------|----------------------|-------|
| 1 | `l6-primer` | Read collapsible "P = favorable ÷ total" card; tap "Got it" to proceed. Never graded. | `primer` (variant `custom`) | reuse | non-graded tap-through; caption: "P(event) = favorable count ÷ total count, reduced to lowest terms." · h1 "Count the outcomes you want; count all possible outcomes." · h2 "To reduce: divide numerator and denominator by their GCD. Example: 624 / 2,598,960 → GCD=624 → 1/4165." · h3 "Continue to the counting beats." | collapsible toggle ≥44px; keyboard-focusable; `role=region` | `--ergo-surface`; `--ch3-tint` wash; Space Grotesk title; no motion | both |
| 2 | `l6-recall` | Tap left label → right match; all 3 pairs must match. **First graded beat — retrieves L4 four-of-a-kind probability + L2 dice probability across the widest spacing gap in the arc, then generalizes to the formula.** | `retrievalGrid` | reuse | ✓ "Both probabilities and the formula — each a favorable ÷ total." · h1 "Tap a label, then its match." · h2 "Four-of-a-kind: 624 / 2,598,960 = 1/4165 (L4)." · h3 "Dice strictly-increasing (L2): 20 / 216 = 5/54. P(event) = favorable ÷ total." | ≥44px cells; Tab/Enter to select; `aria-live="polite"` announces each correct match | `--ch3` highlight on match; `--ok-tint` flash when all matched; `--ergo-surface-2` cells | both |
| 3 | `l6-bet` | Tap one of three ranking cards (rarest → most common); card reveals refutation copy from brief. Ungraded. **Must use `byOption`.** | `prediction` | reuse | byOption — "Four-of-a-kind → full house → two pairs" → correct:true, "Good gut — but a hunch isn't proof. Let's count each hand and watch the ranking hold up." / "Two pairs → full house → four-of-a-kind" → "Let's test it — counting may flip your gut. We'll divide each count by the total and compare." / "Full house → four-of-a-kind → two pairs" → "Let's test it — feel isn't enough; the counts pin down the true order." | ≥44px tap targets; Tab/Enter; `aria-live` on reveal | option cards; `--mark-tint` on select; `--ch3` accent; `--dur-slow` reveal fade | both |
| 4 | `l6-win` | Type `1/4165` into one field; submit. **Guaranteed early win** — uses the count 624 already owned from L4, one division away from a probability. | `answerEntry` | reuse | ✓ "Exactly — 624 / 2,598,960 reduces to 1/4165. The count became a probability with one division." · h1 "624 is the *count*, not the odds. A probability is favorable ÷ total — divide 624 by 2,598,960." · h2 "624 / 2,598,960 — reduce by dividing both by their GCD (624): 1/4165." · h3 "1/4165. One division turns the count into the probability." | ≥48px input height; keyboard-native; `aria-required`; `aria-invalid` on wrong | JetBrains Mono input; `--ok-tint` flash on correct; no hero motion | both |
| 5 | `l6-explore` | Tap 4 factor chips to include them in the full house count; the running product builds toward 3744 and the fraction live-reduces. **WOW**: when the 4th chip clicks into place "3744 / 2,598,960" SNAPS to "6 / 4165" — scale-down + numeral-swap in JetBrains Mono tabular-nums. `hero:{slowFirst:true, structuralReadout:"3744 / 2,598,960 → 6 / 4165", reducedMotionFinalFrame:true}`. `groundedBy:["l6-win","l6-recall"]`. | `probabilityCounter` | **NEW** | non-graded explore; "13 · C(4,3) · 12 · C(4,2) = 3744; P = 3744/2,598,960 = 6/4165." · h1 "Tap each chip to multiply it into the favorable count." · h2 "13 · 4 · 12 · 6 = 3744 full house hands." · h3 "3744 / 2,598,960 = 6/4165." | chip tap targets ≥44px; Tab/Space to toggle each chip; `aria-pressed` per chip; `aria-live="polite"` announces running product + reduced fraction on every toggle; reduced-motion → final frame (all chips selected, 6/4165 shown) | DOM/SVG; chip grid `--ch3-tint` fill, `--ch3` stroke; running product + live fraction JetBrains Mono tabular-nums; snap animation raw→reduced (`--dur-tell`, `--ease-out`, compositor-only `transform`+`opacity`); **one cinematic moment per screen** | both |
| 6 | `l6-model` | Tap three lens cards: (1) the general formula, (2) four-of-a-kind worked, (3) full house worked — all converging on "P = favorable / total" over the shared denominator 4165. `comparison:true`. `introducesSymbol:"P=favorable/total"` `groundedBy:["l6-win","l6-explore"]`. | `tripletReveal` | reuse | ✓ "Same formula, same denominator — count, then divide, then compare." · h1 "Each example applies P = favorable ÷ total." · h2 "Four of a kind: 624/2,598,960 = 1/4165; full house: 3744/2,598,960 = 6/4165." · h3 "Shared denominator 4165: ranking is purely by numerator." | ≥44px lens cards; Tab/Enter; `aria-expanded` per card | tripletReveal cards `--ch3-tint` header; `--dur-slow` fade per reveal | both |
| 7 | `l6-rank` | Tap hands into rarest-first order (or Up/Down keys to reorder); each card shows its reduced fraction over the shared denominator 4165. **Graded check** — the "aha": both fractions share denominator 4165, so numerators (1 < 6) ARE the sole ranking signal. | `handRanker` | **NEW** | ✓ "Right — same denominator (4165), so the bigger top wins: 6/4165 beats 1/4165. Full house is more common." · h1 "Bigger numerator means *more* common, not rarer. Over 4165, 6 outranks 1 — full house beats four-of-a-kind." · h2 "Four of a kind: 1/4165. Full house: 6/4165. Same denominator — compare the tops." · h3 "Rarest first: four of a kind (1/4165), then full house (6/4165)." | tap-sequence primary (tap a card to place it into the next ranked slot); Up/Down arrow keys to reorder focused card; drag additive only; `aria-live="polite"` announces position changes + fractions; hand cards ≥44px | DOM; hand cards `--ergo-surface-2`; reduced fraction JetBrains Mono tabular-nums; correct order `--ok-tint` flash; `--ch3` accent on active card | both |
| 8 | `l6-pairs-scaffold` | Tap 4 factor chips for the two-pairs count: C(13,2)=78 pair-ranks, C(4,2)=6 twice for suit choices, 44 kickers; watch 78·6·6·44 = 123,552 reduce to 198/4165. **Ungraded Track-A scaffold before the mastery challenge.** | `probabilityCounter` | **NEW** (same type as `l6-explore`) | non-graded; "78 · 6 · 6 · 44 = 123,552 → P = 198/4165." · h1 "Two pair-ranks chosen unordered: C(13,2) = 78." · h2 "Each rank's suit choice: C(4,2) = 6; both together = 36." · h3 "Kicker: any card not of the two chosen ranks = 44. 78 · 36 · 44 = 123,552." | same as `l6-explore` (chip ≥44px; Tab/Space; `aria-pressed`; `aria-live`; reduced-motion final frame) | same chip grid pattern; no separate hero (l6-explore owns the cinematic moment for `probabilityCounter`) | A |
| 9 | `l6-prove` | Two sequential type-in fields: (1) count = 123,552, (2) P = 198/4165. **Mastery capstone** — chains C(13,2) → two C(4,2)s → kicker 44 → divide by C(52,5) → reduce → slot into full ranking. `required:true`. Penultimate. `pattern` **UNSET**. | `masteryChallenge` | reuse | ✓ "Exactly — 78·6·6·44 = 123,552, so 198/4165. Re-rank: 1 < 6 < 198 — two pairs is most common." · h1 "Don't use 13×12 for the two ranks — 'kings & sevens' = 'sevens & kings.' Pick them unordered: C(13,2) = 78." · h2 "C(13,2)·C(4,2)²·44 = 78·6·6·44 = 123,552 two-pairs hands." · h3 "P = 123,552 / 2,598,960 = 198/4165." | ≥48px inputs; Tab between fields; `aria-required` both; `aria-invalid` on wrong; both answers announced on correct | `--ergo-surface`; `--ch3` border on submit; tabular-nums inputs; `--ok-tint` flash | both |
| 10 | `l6-recap` | Tap through three recap cards: **count → divide → rank**. **Closes the Combinatorics concept arc.** `required:true`. | `recap` | reuse | ✓ "Count, divide, rank — the probability engine closes the Combinatorics arc." · h1 "Count favorable outcomes with multiplication and combinations." · h2 "Divide by C(52,5) = 2,598,960 to convert a count into a probability." · h3 "Shared denominator 4165: rank by numerator — 1 < 6 < 198." | tap/keyboard; `aria-live` announces each card reveal | `--ch3-tint` backdrop; Space Grotesk summary cards; lesson-complete triggered by lesson engine (NOT this beat's own hero — one cinematic moment per screen) | both |

---

## New interaction types (for Wave 0)

> **Probability ranking finale = `probabilityCounter` (ungraded, `l6-explore` + `l6-pairs-scaffold`) + `handRanker` (graded, `l6-rank`).** Only these two types are new for L6. Total new Combinatorics concept types: **6** (`countingTree` L1, `selectionGrid` L2, `pascalTriangle` L3, `vennCounter` L4, `probabilityCounter` L6, `handRanker` L6).

### `probabilityCounter` — ProbabilityCounterBeat.tsx

**Frozen Zod schema** (add to `InteractionSchema` discriminated union in `src/content/schema.ts`):

```ts
z.object({
  type: z.literal('probabilityCounter'),
  factors: z.array(z.object({ label: z.string(), value: z.number().int().positive() })),
  total: z.number().int().positive(),          // denominator (e.g. 2598960)
  accept: z.array(z.string()).optional(),      // optional graded read-off of the reduced fraction (omit in L6)
})
```

`probabilityCounter` is an **ungraded explore widget** for L6: `accept` is absent on both `l6-explore` and `l6-pairs-scaffold`. Do **NOT** add to `GRADED_TYPES` in validate-fixtures. MUST be added to:
1. `InteractionSchema` discriminated union (`src/content/schema.ts`)
2. BeatView dispatcher (`src/lesson/beats/index.tsx`)
3. New renderer `src/lesson/beats/ProbabilityCounterBeat.tsx`

### `handRanker` — HandRankerBeat.tsx

**Frozen Zod schema** (add to `InteractionSchema` discriminated union in `src/content/schema.ts`):

```ts
z.object({
  type: z.literal('handRanker'),
  hands: z.array(z.object({ label: z.string(), favorable: z.number().int().positive() })),
  total: z.number().int().positive(),          // shared denominator (e.g. 2598960)
  order: z.enum(['rarestFirst', 'commonestFirst']).optional(), // expected order; default 'rarestFirst'
})
```

`handRanker` is **GRADED** (`l6-rank`). **ADD `handRanker` to `GRADED_TYPES`** in validate-fixtures. MUST be added to:
1. `InteractionSchema` discriminated union (`src/content/schema.ts`)
2. BeatView dispatcher (`src/lesson/beats/index.tsx`)
3. New renderer `src/lesson/beats/HandRankerBeat.tsx`

---

## Build decomposition (for Dept 3)

### Engine — `src/engine/combinatorics.ts`

L6 engine additions (pure, BigInt-exact, no floats) — building on the L4 foundation (`nCk`, `reduce` already present):

| function | signature | L6 golden |
|----------|-----------|-----------|
| `probabilityFromCounts` | `(fav: number, total: number): {n: bigint, d: bigint}` | `probabilityFromCounts(624, 2598960) → {n:1n, d:4165n}` |
| — | — | `probabilityFromCounts(3744, 2598960) → {n:6n, d:4165n}` |
| — | — | `probabilityFromCounts(123552, 2598960) → {n:198n, d:4165n}` |
| — | — | `probabilityFromCounts(20, 216) → {n:5n, d:54n}` |

`probabilityFromCounts` is a thin wrapper: `return reduce(BigInt(fav), BigInt(total))`. The `reduce` function (already in L4) carries the GCD work. `nCk(52n, 5n) === 2598960n` (L4 golden, re-verified for L6).

Cross-check invariants:
- `probabilityFromCounts(Number(nCk(13n,2n) * nCk(4n,2n) * nCk(4n,2n) * 44n), 2598960)` → `{n:198n, d:4165n}` (two-pairs formula end-to-end)
- `13n * 4n * 12n * 6n === 3744n` (full house chip product)

### Schema — `src/content/schema.ts`

Add both frozen Zod variants above to `InteractionSchema` discriminated union. No other schema changes needed for L6.

### Renderer — `ProbabilityCounterBeat.tsx`

Props: `{ interaction: ProbabilityCounterInteraction; feedback: Feedback; onComplete: () => void }`

Responsibilities:
1. **Chip grid** — each factor chip is a toggle button (≥44px) displaying `{label}: {value}`; tap to include/exclude from the running product. Keyboard: Tab between chips; Space/Enter to toggle. `aria-pressed` per chip.
2. **Running favorable count** — live product of all toggled-on chips (shows "—" when none selected). JetBrains Mono tabular-nums.
3. **Live fraction display** — raw fraction `favorable / total` (top line) → reduced fraction via `probabilityFromCounts(favorable, total)` (bottom line, `{n}/{d}`). When favorable = 0: show "— / {total}". When `accept` absent: display-only, no Submit.
4. **`aria-live="polite"` region**: announces "Favorable: {N}, Probability: {n}/{d}" on every chip toggle.
5. **Hero animation** (fires once on beat entry, `slowFirst:true`): auto-selects chips one-by-one at `--dur-base` intervals; after final chip, pause 400 ms, then the **snap**: raw fraction ("3744 / 2,598,960") → reduced form ("6 / 4165") with scale-down + numeral-swap at `--dur-tell` `--ease-out`. Compositor-only (`transform`, `opacity` — no layout shifts). Reduced-motion: skip animation, render final frame immediately (`reducedMotionFinalFrame:true`).
6. **Graded mode** (if `accept` present): show Submit after any interaction; match `${n}/${d}` against accept list; wire to hint ladder like other graded beats.
7. DOM/SVG only — no Konva.

### Renderer — `HandRankerBeat.tsx`

Props: `{ interaction: HandRankerInteraction; feedback: Feedback; onComplete: () => void }`

Responsibilities:
1. **Hand cards** in a vertical column. Each card shows: name, favorable count, reduced fraction `{n}/{d}` (via `probabilityFromCounts(favorable, total)`). JetBrains Mono tabular-nums for fractions.
2. **Initial state**: hands displayed in a seeded-shuffle order (never the correct answer — seed from `beatId`). Cards occupy numbered slots ("Rarest", "More common", …).
3. **Tap-sequence primary path**: tap a card to select it → it animates into the next available ranked slot. After all cards are placed, Submit fires automatically. "Reset" button (≥44px) clears selection.
4. **Keyboard path**: Tab focuses a card; Up/Down arrow keys move the focused card up/down in the current ranking (`aria-live` announces move); Enter confirms placement when all slots are filled.
5. **Drag** (additive only): drag a card to reorder. Tap-sequence + keyboard must fully substitute drag for a11y compliance.
6. **Graded check**: engine sorts hands by `favorable` ascending (`rarestFirst`, default) or descending (`commonestFirst`). Correct when learner's order matches engine order.
7. **`aria-live="polite"` region**: announces position changes ("Four of a kind moved to position 1") and the full ranking summary on Submit.
8. On correct: `--ok-tint` flash + announce. On incorrect: hint ladder; highlight out-of-order pair.
9. DOM only — no Konva.

### Fixture shapes — `fixtures/lesson-combinatorics-6.json`

Mirrors `lesson-overlap-shortcut.json` shape:
- `lessonId: "lesson-combinatorics-6"`, `courseId: "course-combinatorics"`
- `patternOptions: []` — no H/T patterns; validate-fixtures must exempt combinatorics lessons (gate check on `courseId !== "course-combinatorics"`)
- Beat order: `l6-primer` → `l6-recall` → `l6-bet` → `l6-win` → `l6-explore` → `l6-model` → `l6-rank` → `l6-pairs-scaffold` → `l6-prove` → `l6-recap`
- `milestoneId: "combinatorics-mastered"`, `unlocks: null`, `schemaVersion: 1`

#### `l6-recall` retrievalGrid pairs

```jsonc
"pairs": [
  { "left": "four-of-a-kind (5-card hand)",           "right": "1/4165" },
  { "left": "3 dice in strictly-increasing order",    "right": "5/54" },
  { "left": "P(event) for equally-likely outcomes",   "right": "favorable ÷ total" }
]
```

#### `l6-bet` prediction fixture shape

```jsonc
{
  "beatId": "l6-bet",
  "required": false,
  "prompt": "Gut check only — rank these three poker hands from rarest to most common: four-of-a-kind, full house, two pairs.",
  "interaction": {
    "type": "prediction",
    "options": [
      "Four-of-a-kind → full house → two pairs",
      "Two pairs → full house → four-of-a-kind",
      "Full house → four-of-a-kind → two pairs"
    ]
  },
  "feedback": {
    "byOption": {
      "Four-of-a-kind → full house → two pairs": {
        "note": "Good gut — but a hunch isn't proof. Let's count each hand and watch the ranking hold up.",
        "correct": true
      },
      "Two pairs → full house → four-of-a-kind": {
        "note": "Let's test it — counting may flip your gut. We'll divide each count by the total and compare."
      },
      "Full house → four-of-a-kind → two pairs": {
        "note": "Let's test it — feel isn't enough; the counts pin down the true order."
      }
    }
  }
}
```

#### `l6-win` answerEntry fixture shape

```jsonc
{
  "beatId": "l6-win",
  "required": true,
  "prompt": "In L4 you counted 624 four-of-a-kind hands. C(52,5) = 2,598,960 total 5-card hands exist. What is P(four of a kind)?",
  "interaction": {
    "type": "answerEntry",
    "fields": [
      {
        "id": "foak-prob",
        "label": "P(four of a kind)",
        "accept": ["1/4165", "624/2598960", "624/2,598,960"],
        "placeholder": "?"
      }
    ]
  },
  "feedback": {
    "correct": "Exactly — 624 / 2,598,960 reduces to 1/4165. The count became a probability with one division.",
    "hints": [
      "624 is the *count*, not the odds. A probability is favorable ÷ total — divide 624 by 2,598,960.",
      "624 / 2,598,960 — reduce by dividing both by their GCD (624): 1/4165.",
      "1/4165. One division turns the count into the probability."
    ]
  }
}
```

#### `l6-explore` probabilityCounter fixture shape

```jsonc
{
  "beatId": "l6-explore",
  "required": false,
  "prompt": "Tap each factor chip to include it in the full house count. Watch the count build and the fraction live-reduce.",
  "interaction": {
    "type": "probabilityCounter",
    "factors": [
      { "label": "Triple rank (13 choices)", "value": 13 },
      { "label": "Triple suits C(4,3)",      "value": 4  },
      { "label": "Pair rank (12 choices)",   "value": 12 },
      { "label": "Pair suits C(4,2)",        "value": 6  }
    ],
    "total": 2598960
    // accept absent → ungraded explore widget
  },
  "groundedBy": ["l6-win", "l6-recall"],
  "hero": {
    "slowFirst": true,
    "structuralReadout": "3744 / 2,598,960 → 6 / 4165",
    "reducedMotionFinalFrame": true
  },
  "feedback": {
    "correct": "13 · C(4,3) · 12 · C(4,2) = 13·4·12·6 = 3744. P = 3744 / 2,598,960 = 6/4165.",
    "hints": [
      "Tap each chip to multiply it into the favorable count.",
      "13 · 4 · 12 · 6 = 3744 full house hands.",
      "3744 / 2,598,960 = 6/4165."
    ]
  }
}
```

#### `l6-model` tripletReveal fixture shape

```jsonc
{
  "beatId": "l6-model",
  "required": false,
  "comparison": true,
  "introducesSymbol": "P=favorable/total",
  "groundedBy": ["l6-win", "l6-explore"],
  "interviewNote": "The shared denominator 4165 is exact: gcd(2,598,960, 624)=624 → 1/4165; gcd(2,598,960, 3744)=624 → 6/4165; gcd(2,598,960, 123,552)=624 → 198/4165. Over denominator 4165, ranking reduces to numerator order: 1 < 6 < 198 → four-of-a-kind < full house < two pairs. GB p.34 §4.2.",
  "prompt": "Tap each lens to see the same formula applied three ways.",
  "interaction": {
    "type": "tripletReveal",
    "value": "P = favorable / total",
    "display": "cards",
    "lenses": [
      {
        "label": "The Formula",
        "body": "For equally-likely outcomes: P(event) = favorable count ÷ total count. Reduce to lowest terms with the GCD."
      },
      {
        "label": "Four of a Kind",
        "body": "Favorable: 624. Total: 2,598,960. P = 624 / 2,598,960 = 1/4165."
      },
      {
        "label": "Full House",
        "body": "Favorable: 3744. Total: 2,598,960. P = 3744 / 2,598,960 = 6/4165. Both fractions share denominator 4165."
      }
    ]
  },
  "feedback": {
    "correct": "Same formula, same denominator — count, then divide, then compare.",
    "hints": [
      "Each example applies P = favorable ÷ total.",
      "Four of a kind: 624/2,598,960 = 1/4165; full house: 3744/2,598,960 = 6/4165.",
      "Shared denominator 4165: ranking is purely by numerator."
    ]
  }
}
```

#### `l6-rank` handRanker fixture shape

```jsonc
{
  "beatId": "l6-rank",
  "required": true,
  "prompt": "Rank these two hands from rarest to most common. Tap a hand to place it in order, or use Up/Down arrow keys to reorder.",
  "interaction": {
    "type": "handRanker",
    "hands": [
      { "label": "Four of a kind", "favorable": 624  },
      { "label": "Full house",     "favorable": 3744 }
    ],
    "total": 2598960,
    "order": "rarestFirst"
  },
  "feedback": {
    "correct": "Right — same denominator (4165), so the bigger top wins: 6/4165 beats 1/4165. Full house is more common.",
    "hints": [
      "Bigger numerator means *more* common, not rarer. Over 4165, 6 outranks 1 — full house beats four-of-a-kind.",
      "Four of a kind: 1/4165. Full house: 6/4165. Same denominator — compare the tops.",
      "Rarest first: four of a kind (1/4165), then full house (6/4165)."
    ]
  }
}
```

#### `l6-pairs-scaffold` Track-A probabilityCounter fixture shape

```jsonc
{
  "beatId": "l6-pairs-scaffold",
  "required": false,
  "track": "A",
  "prompt": "Before the mastery challenge: build the two-pairs count. C(13,2)=78 chooses the two pair-ranks; C(4,2)=6 picks each rank's suits; 44 is the kicker count.",
  "interaction": {
    "type": "probabilityCounter",
    "factors": [
      { "label": "Choose 2 ranks C(13,2)",  "value": 78 },
      { "label": "Rank-1 suits C(4,2)",     "value": 6  },
      { "label": "Rank-2 suits C(4,2)",     "value": 6  },
      { "label": "Kicker (44 cards)",       "value": 44 }
    ],
    "total": 2598960
    // accept absent → ungraded scaffold
  },
  "feedback": {
    "correct": "78 · 6 · 6 · 44 = 123,552 two-pairs hands. P = 123,552 / 2,598,960 = 198/4165.",
    "hints": [
      "Two pair-ranks chosen unordered: C(13,2) = 78.",
      "Each rank's suit choice: C(4,2) = 6; both together = 36.",
      "Kicker: any card not of the two chosen ranks = 44. 78 · 36 · 44 = 123,552."
    ]
  }
}
```

#### `l6-prove` masteryChallenge fixture shape

```jsonc
{
  "beatId": "l6-prove",
  "required": true,
  // pattern: intentionally absent — engine cross-check uses combinatorics.ts, not pattern automaton
  "prompt": "From scratch: how many two-pairs hands are in a 5-card deck? Then find P(two pairs). Finally, confirm the full ranking: four-of-a-kind, full house, two pairs.",
  "interaction": {
    "type": "masteryChallenge",
    "scenario": "Two pairs: choose 2 ranks unordered (C(13,2)), choose the suits for each rank (C(4,2) each), then pick a kicker card from the 44 cards not of those ranks.",
    "fields": [
      {
        "id": "two-pair-count",
        "label": "Two-pairs hands",
        "accept": ["123552", "123,552"],
        "placeholder": "?",
        "suffix": "hands"
      },
      {
        "id": "two-pair-prob",
        "label": "P(two pairs)",
        "accept": ["198/4165"],
        "placeholder": "?"
      }
    ]
  },
  "interviewNote": "P(two pairs) = 123,552/2,598,960 = 198/4165 (GB p.34 §4.2). Count: C(13,2)·C(4,2)²·44 = 78·6·6·44 = 123,552; the '44 = 52 − 8' kicker bars both chosen ranks' 8 cards. GB OCR garbles printed integer to '123,582'; formula 78×6×6×44 = 123,552 unambiguous (engine: probabilityFromCounts(123552, 2598960) = 198/4165).",
  "feedback": {
    "correct": "Exactly — 78·6·6·44 = 123,552, so 198/4165. Re-rank: 1 < 6 < 198 — two pairs is most common.",
    "hints": [
      "Don't use 13×12 for the two ranks — 'kings & sevens' = 'sevens & kings.' Pick them unordered: C(13,2) = 78.",
      "C(13,2)·C(4,2)²·44 = 78·6·6·44 = 123,552 two-pairs hands.",
      "P = 123,552 / 2,598,960 = 198/4165."
    ]
  }
}
```

#### `l6-recap` recap fixture shape

```jsonc
{
  "beatId": "l6-recap",
  "required": true,
  "prompt": "Tap through the recap cards — count → divide → rank closes the Combinatorics concept.",
  "interaction": { "type": "recap" },
  "feedback": {
    "correct": "Count, divide, rank — the probability engine closes the Combinatorics arc.",
    "hints": [
      "Count favorable outcomes with multiplication and combinations.",
      "Divide by C(52,5) = 2,598,960 to convert a count into a probability.",
      "Shared denominator 4165: rank by numerator — 1 < 6 < 198."
    ]
  }
}
```

### `validate-fixtures.ts` additions (L6 extension)

1. Add `"lesson-combinatorics-1"` … `"lesson-combinatorics-6"` to `GATED` and `MASTERY_LESSONS`.
2. **Combinatorics engine cross-checks** (extend L4's block; run for `courseId === "course-combinatorics"` fixtures):
   - `l6-win` accept `"1/4165"`: assert `probabilityFromCounts(624, 2598960) → {n:1n, d:4165n}`
   - `l6-explore` factor product: assert `13n * 4n * 12n * 6n === 3744n`; assert `probabilityFromCounts(3744, 2598960) → {n:6n, d:4165n}`
   - `l6-rank` hand order: assert engine sort of `[{favorable:624},{favorable:3744}]` ascending → `[624, 3744]` (four-of-a-kind first)
   - `l6-pairs-scaffold` factor product: assert `78n * 6n * 6n * 44n === 123552n`
   - `l6-prove` count field `accept["123552"]`: assert `nCk(13n,2n) * nCk(4n,2n) * nCk(4n,2n) * 44n === 123552n`
   - `l6-prove` prob field `accept["198/4165"]`: assert `probabilityFromCounts(123552, 2598960) → {n:198n, d:4165n}`
   - `l6-recall` pairs: assert `probabilityFromCounts(624, 2598960).d === 4165n`; assert `probabilityFromCounts(20, 216) → {n:5n, d:54n}`
3. Assert first graded beat of `lesson-combinatorics-6` has `interaction.type === "retrievalGrid"` (`l6-recall`).
4. Assert `l6-prove` has `interaction.type === "masteryChallenge"`, `required === true`, at position `beats.length - 2` (penultimate).
5. Assert last beat has `interaction.type === "recap"` (`l6-recap`).
6. Assert ≥1 beat with `interaction.type === "primer"` per `lesson-combinatorics-6`.
7. Assert ≥1 beat with `interviewNote` defined per `lesson-combinatorics-6`.
8. Assert every beat with `interaction.type === "prediction"` has `feedback.byOption` (not `feedback.correct`).
9. Assert `computeMastered` keys `{l6-recall, l6-win, l6-rank, l6-prove}` all present in fixture.
10. `probabilityCounter` NOT in `GRADED_TYPES`; `handRanker` IN `GRADED_TYPES`; confirm no `required:true` `probabilityCounter` beat exists.
11. Assert ≥1 beat with `track === 'A'` per `lesson-combinatorics-6`.

---

## DoR gap closures

### Primer — `l6-primer` (variant `custom`, collapsible)

Authored above in fixture shapes. Body covers:
- **P = favorable / total**: For equally-likely outcomes (e.g. all 5-card hands from a shuffled deck), the probability of any event is the count of *favorable* outcomes divided by the count of *all* outcomes.
- **Reducing to lowest terms**: Divide both numerator and denominator by their GCD. Example: 624 / 2,598,960 → GCD = 624 → 1/4165. The fraction is exact; never approximate with decimals.

Never graded, never `required`. `collapsible: true` so Track-B learners who already know P = favorable/total can skip. Placed first (beat #1) so it grounds `l6-win` (early win refutes "the count *is* the probability"), `l6-explore` (the hero), and the full hint ladder.

### Track-A scaffold — `l6-pairs-scaffold` (track `'A'`, `required: false`)

Two-pairs `probabilityCounter` between `l6-rank` and `l6-prove`. Track-A learners who want to internalize the two-pairs factor breakdown before the mastery challenge build it themselves: tap C(13,2)=78, C(4,2)=6 twice, and 44 as chips, watching 123,552 reduce to 198/4165. This supplies the full formula in direct-manipulation form before the type-in mastery challenge — reducing first-hint recourse at `l6-prove`. Track-B learners skip directly to `l6-prove` (required-beat check still passes because `l6-pairs-scaffold` is `required:false`, `track:'A'`).

### interviewNote fields

- **`l6-model`** (tripletReveal): `"The shared denominator 4165 is exact: gcd(2,598,960, 624)=624 → 1/4165; gcd(2,598,960, 3744)=624 → 6/4165; gcd(2,598,960, 123,552)=624 → 198/4165. Over denominator 4165, ranking reduces to numerator order: 1 < 6 < 198 → four-of-a-kind < full house < two pairs. GB p.34 §4.2."` — satisfies validate-fixtures `≥1 interviewNote` gate.
- **`l6-prove`** (masteryChallenge): `"P(two pairs) = 123,552/2,598,960 = 198/4165 (GB p.34 §4.2). Count: C(13,2)·C(4,2)²·44 = 78·6·6·44 = 123,552; the '44 = 52 − 8' kicker bars both chosen ranks' 8 cards. GB OCR garbles printed integer to '123,582'; formula 78×6×6×44 = 123,552 unambiguous (engine: probabilityFromCounts(123552, 2598960) = 198/4165)."` — explicitly references the brief's source note.

---

## Definition-of-Ready checklist (every beat)

| # | beatId | ☑ verified+sourced problem | ☑ concrete mechanic | ☑ feedback + 3 hints | ☑ a11y 44px + reduced-motion + aria-live |
|---|--------|-----------------------------|----------------------|----------------------|------------------------------------------|
| 1 | `l6-primer` | N/A (no-grade) | collapsible card tap-through ✓ | caption + 3 tap-through hints ✓ | toggle ≥44px; keyboard; `role=region` ✓ |
| 2 | `l6-recall` | GB p.34 (1/4165) + GB p.40 (5/54) engine-verified ✓ | retrievalGrid tap-match ✓ | 3 hints ✓ | ≥44px cells; `aria-live` match announcement ✓ |
| 3 | `l6-bet` | GB p.34; byOption copy verbatim from brief ✓ | prediction tap+reveal ✓ | byOption 3 options; correct flagged ✓ | ≥44px; `aria-live` on reveal ✓ |
| 4 | `l6-win` | GB p.34; 624/2,598,960=1/4165 engine-verified ✓ | answerEntry type-in ✓ | 3 hints ✓ | ≥48px input; `aria-required`; `aria-invalid` ✓ |
| 5 | `l6-explore` | GB p.34; full house 3744/2,598,960=6/4165 engine-verified ✓ | probabilityCounter chip-tap ✓ | 3 hints ✓ | chip ≥44px; `aria-pressed`; `aria-live` product+fraction; reduced-motion final frame ✓ |
| 6 | `l6-model` | GB p.34; P=favorable/total + both examples engine-verified ✓ | tripletReveal tap-reveal ✓ | 3 hints ✓ | ≥44px lens cards; `aria-expanded` per card ✓ |
| 7 | `l6-rank` | GB p.34; 1/4165 < 6/4165 engine-verified; numerator ranking ✓ | handRanker tap-sequence + Up/Down keyboard ✓ | 3 hints ✓ | tap ≥44px; Up/Down keyboard; `aria-live` position changes; drag additive only ✓ |
| 8 | `l6-pairs-scaffold` | GB p.34; 78·6·6·44=123,552 engine-verified ✓ | probabilityCounter chip-tap (Track-A) ✓ | 3 hints ✓ | chip ≥44px; `aria-pressed`; `aria-live`; reduced-motion final frame ✓ |
| 9 | `l6-prove` | GB p.34; 123,552→198/4165 engine-verified (formula corrects GB OCR) ✓ | masteryChallenge 2-field ✓ | 3 hints ✓ | ≥48px inputs; `aria-required` both; `aria-invalid` ✓ |
| 10 | `l6-recap` | capstone arc close (brief §beat 8) | recap tap-through ✓ | 3 hints ✓ | tap/keyboard; `aria-live` per card ✓ |

---

## Dept1↔Dept2 readiness check

**(a)** = verified+sourced problem + answer in Dept-1 brief · **(b)** = interaction type + mechanic fully specified by Dept 2

| # | beatId | (a) Dept-1 brief | (b) Dept-2 spec | notes |
|---|--------|-----------------|-----------------|-------|
| 1 | `l6-primer` | ✓ brief §assessment/continuity: "≥1 primer (P=favorable/total + reducing a fraction)" | ✓ variant `custom`; body drafted in DoR closures | — |
| 2 | `l6-recall` | ✓ GB p.34 (1/4165) + GB p.40 (5/54); retrieval across full arc confirmed in §assessment | ✓ `retrievalGrid`; 3 pairs specified | — |
| 3 | `l6-bet` | ✓ GB p.34; byOption copy verbatim in brief §per-option feedback; ungraded confirmed | ✓ `prediction` + `byOption`; 3 options | — |
| 4 | `l6-win` | ✓ GB p.34; 624/2,598,960=1/4165; accept + feedback verbatim in brief | ✓ `answerEntry` 1-field; 3 accept strings | — |
| 5 | `l6-explore` | ✓ GB p.34; full house 3744/2,598,960=6/4165; ungraded hero confirmed in brief §beat 4 | ✓ `probabilityCounter` NEW; chip-tap + hero spec; `factors` + `total` fully specified | Wave 0 renderer needed |
| 6 | `l6-model` | ✓ GB p.34; P=favorable/total formula; ungraded confirmed in brief §beat 5 | ✓ `tripletReveal` 3-lens; lenses + `value` + `display` specified; `comparison:true` | — |
| 7 | `l6-rank` | ✓ GB p.34; 1/4165 vs 6/4165; graded check confirmed in brief §beat 6 | ✓ `handRanker` NEW; 2 hands, `total`, `order:"rarestFirst"` specified | Wave 0 renderer needed |
| 8 | `l6-pairs-scaffold` | ✓ GB p.34; 78·6·6·44=123,552; Track-A scaffold authorized in brief §gate/DoR notes | ✓ `probabilityCounter` NEW (same type); `track:'A'`; `required:false` | Wave 0 renderer reuse |
| 9 | `l6-prove` | ✓ GB p.34; 123,552→198/4165; `masteryChallenge`+`required:true` + `pattern` unset authorized | ✓ `masteryChallenge` 2-field; scenario authored; `pattern` **unset** | — |
| 10 | `l6-recap` | ✓ count→divide→rank as concept close in brief §beat 8 | ✓ `recap`; 3 card themes: count / divide / rank | — |

### Kickbacks to Dept 1

**None.** All problems sourced (GB p.34, p.40); answers engine-verified in the brief (every ☑ engine ☑ source row confirmed). Two-pairs OCR note (formula 78×6×6×44 = **123,552**, not garbled "123,582") called out and corrected per the brief's own source note.

### Kickbacks to Dept 3 (handoff items)

1. `src/engine/combinatorics.ts` — add `probabilityFromCounts(fav:number, total:number):{n:bigint,d:bigint}` wrapping `reduce`; L6 goldens listed in §Engine above.
2. `src/content/schema.ts` — add frozen `probabilityCounter` + `handRanker` variants to `InteractionSchema` discriminated union.
3. `src/lesson/beats/ProbabilityCounterBeat.tsx` — new renderer: chip grid ≥44px with `aria-pressed`, `aria-live` product+fraction, hero auto-select animation, reduced-motion final frame.
4. `src/lesson/beats/HandRankerBeat.tsx` — new renderer: tap-sequence + Up/Down keyboard + additive drag, `aria-live` position changes, graded engine sort check.
5. `src/lesson/beats/index.tsx` — add `probabilityCounter` + `handRanker` cases to BeatView dispatcher.
6. `fixtures/lesson-combinatorics-6.json` — author per this spec (10 beats, order confirmed, `pattern` absent from `l6-prove`).
7. `scripts/validate-fixtures.ts` — extend per §Build decomposition: register L1–6 in `GATED`+`MASTERY_LESSONS`; add 11 L6 engine cross-check assertions; `handRanker` IN `GRADED_TYPES`; `probabilityCounter` NOT in `GRADED_TYPES`.

---

**VERDICT: READY** — Zero Dept-1 kickbacks. All problems Green-Book-sourced and engine-verified in the brief. All interaction mechanics specified. `probabilityCounter` + `handRanker` renderers + `probabilityFromCounts` engine wrapper are the only Wave 0 blockers (Dept 3). `probabilityCounter` is **ungraded** (no `GRADED_TYPES` entry); `handRanker` is **graded** (add to `GRADED_TYPES`). Total new Combinatorics concept types = **6**.
