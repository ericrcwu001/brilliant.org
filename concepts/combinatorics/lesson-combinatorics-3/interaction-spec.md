# Interaction Spec: The Binomial Theorem  (lesson-combinatorics-3)

**Chapter:** ch-combinatorics-2 · accent `--ch1` (indigo `#4F46E5`)
**Prereqs:** lesson-combinatorics-2 (`nCk`, `C(52,5)`)
**glyphKey:** `(a+b)ⁿ` · **vizKey:** `sum`
**computeMastered keys:** `{l3-recall, l3-win, l3-applied, l3-prove}`
**Beat count:** 10 (8 brief beats + primer + Track-A scaffold)

---

## Beat Table

| # | beatId | mechanic + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|-----------------|-----------------|--------------|--------------------------|------|------------------------|-------|
| 1 | `l3-primer` | Read: card names `2ⁿ` as "double each step" and `Σ` as "sum over k". Collapsible. No response required. No grading. | `primer` (variant: `exponent`) | REUSE | ungraded; idle/body: "2ⁿ means multiply 2 by itself n times; Σ sums over all k values below" | Collapsible toggle ≥44px; body Inter 16px; no drag-only gate | Surface `--ergo-surface-2`; `--ergo-line` border; `--r-md`; title Space Grotesk 600; `--ch1` toggle accent; no motion | both |
| 2 | `l3-recall` | Tap left item → tap matching right item → pair snaps + `--ok` flash. **"Wow"**: realising `Σ2^L` from L1 equals Pascal's row sums is the same identity restated. First graded beat. | `retrievalGrid` | REUSE | correct: "Exactly — powers of two from L1 are Pascal's row sums in disguise." · hints: [1] "Tap a left item then its matching right item." [2] "2⁰+2¹+2²+2³ = 1+2+4+8 = 15; each Pascal row doubles; C(n,k) counts unordered subsets." [3] "Match all three pairs." | Pairs shuffled; each tap target ≥44px; keyboard: Tab between items, Space/Enter to select; `aria-live="polite"` announces each matched pair; no drag | Surface `--ergo-surface`; correct pair: `--ok-tint` flash + `--ok` border (`--dur-base`); JetBrains Mono for math values; `--shadow-sm` at rest; reduced-motion: color only | both |
| 3 | `l3-bet` | Tap one prediction chip. "Row 4 of Pascal's triangle: `1 4 6 4 1`. Add it up — guess the next row's total without building it." Ungraded; per-option refutation fires immediately. | `prediction` | REUSE | `byOption`: "25 — it's 5²" → "That's n² thinking. Row totals double (1,2,4,8,16…) → next is 2⁵=32." · "32 — it doubles" → "Yes — each row doubles: 16→32=2⁵. Setting a=b=1 makes every row sum 2ⁿ." [correct:true] · "Can't tell without building it" → "It's not random — every row sums to 2ⁿ, so 16 doubles to 32." | 3 chip buttons ≥44px; keyboard Tab + Space/Enter; `aria-label` per option; `aria-pressed` state; no drag | Chips `--ergo-surface` + `1px --ergo-line` at rest; selected chip: `--ch1` border + `--ch1-tint` fill; correct reveal: `--ok-tint`; wrong: `--bad-tint`; Inter 600; `--dur-base` transition; no motion budget spend | both |
| 4 | `l3-win` | Type the coefficient of `ab` in `(a+b)²`. Single numeric field. **"Wow"**: typing "2" is the first refutation of the freshman's dream — the cross term appears twice. Guaranteed early win. | `answerEntry` | REUSE | correct: "Right — 2 = C(2,1); the cross term shows up twice, ab+ba." · hints: [1] "Expand (a+b)(a+b) term by term." [2] "Freshman's dream says a²+b², but it misses two middle terms: a·b and b·a." [3] "a·b + b·a = 2ab → coefficient 2 = C(2,1)." | Input ≥44px height; keyboard-native; `aria-describedby` → label; wrong: short horizontal shake (transform only) + `--bad` border; reduced-motion: color only | Field `--ergo-surface` + `--ergo-line-2` border; correct: `--ok-tint` flash + `--ok` border; wrong: shake + `--bad` border; label Inter 500; value JetBrains Mono; no hero | both |
| 5 | `l3-scaffold-a` | Read: faded step-by-step expansion of `(a+b)²` with all terms pre-filled, mapping coefficients to `C(2,k)`. Track-A only, not graded. Bridges `l3-win` → `l3-explore`. | `primer` (variant: `custom`) | REUSE | ungraded; idle: "Notice 2 = C(2,1): two ways to pick one term from two factors. In (a+b)³ there are C(3,1)=3 such picks." | Card body ≥44px height; `text-wrap: balance` on heading; JetBrains Mono for the expansion steps; no drag | Surface `--ergo-surface`; `2px solid --ch1` left accent border; body Inter; expansion steps JetBrains Mono; `--r-md`; `--shadow-sm`; no motion | A |
| 6 | `l3-explore` | Tap each blank cell to reveal its value (= sum of two above). Row totals appear in right margin as `= 2ⁿ` after each row completes. Hovering/focusing a cell lights its symmetric twin. **HERO WOW**: build row 5 — watch the margin jump from `16 → 32 = 2⁵` while indigo mirror pairs glow. | `pascalTriangle` | **NEW** | ungraded; `hero.structuralReadout`: "Row 4 = 1+4+6+4+1 = 16 = 2⁴. Row 5 = 1+5+10+10+5+1 = 32 = 2⁵." `hero.slowFirst: true`. `hero.reducedMotionFinalFrame: true`. idle hints: [1] "Tap any blank cell to reveal its value." [2] "Each cell = sum of the two cells directly above it." [3] "After a row is complete the right margin shows its total as a power of 2." | Per-cell tap ≥44px (transparent overlay on small cells via `::before`); keyboard: row-major Tab order, Space/Enter to reveal; `role="button"` on unrevealed cells; `aria-live="polite"` fires: on cell reveal → `"C(n,k) = value"`; on row complete → `"Row n sums to sum = 2^n"`; on symmetry pair → `"C(n,k) mirrors C(n,n−k)"`; reduced-motion: full triangle pre-built (final frame) | **Hero beat**. DOM/SVG pyramid; cells `--ergo-surface-2` unrevealed → `--ch1-tint` fill + `--ch1` ink revealed, `--dur-slow` + `--ease-out`, compositor opacity + `scale(1.0→1.0)` (spring); row-sum label JetBrains Mono tabular-nums `--ch1`; symmetry pair: `2px solid --ch1` ring, `--dur-base` fade; hero: one cell at a time, `--dur-tell` stagger, compositor-only; reduced-motion: instant reveal; `--shadow-sm` on revealed cells; ONE cinematic moment — the row-5 total doubling | both |
| 7 | `l3-model` | Tap each of 3 lens cards to reveal three angles on `C(n,k)`. Align-and-articulate contrast (`comparison: true`). Introduces `(a+b)ⁿ` / `Σ` notation (grounded by `l3-explore` + `l3-primer`). | `tripletReveal` | REUSE | correct: "Three routes, one identity: C(n,k) is Pascal's cell, the binomial coefficient, and the combination count." · hints: [1] "Reveal all three lens cards." [2] "Setting a=b=1 in (a+b)ⁿ=ΣC(n,k)aⁿ⁻ᵏbᵏ gives ΣC(n,k)=2ⁿ — the row sum from l3-explore." [3] "C(n,n−k)=C(n,k): choosing k in = choosing n−k out. The row mirrors." | 3 tap cards ≥44px; keyboard Tab + Space/Enter per card; `aria-expanded`; `aria-live="polite"` announces each lens body on reveal; no drag | 3 cards `--ergo-surface` + `--shadow-sm`; unrevealed: `--ergo-surface-2` fill + `--ergo-ink-3` label; revealed: `--ch1-tint` fill + `--ch1` border; `display: 'cards'`; Space Grotesk 600 label; Inter body; `--dur-slow` reveal; reduced-motion: instant | both |
| 8 | `l3-applied` | Type "yes" or "no": is `(1+√2)ⁿ + (1−√2)ⁿ` always an integer? Single short-text field, accept `["yes"]`. Carries the GB p.36–37 interview note. | `answerEntry` | REUSE | correct: "Right — the odd-power √2 terms pair off and cancel, leaving twice the even terms: an integer." · hints: [1] "Expand each binomial with the theorem and add them together." [2] "k odd: C(n,k)(√2)ᵏ + C(n,k)(−√2)ᵏ = 0. The irrational pieces cancel in pairs." [3] "k even: 2·C(n,k)·2^(k/2) ∈ ℤ. Sum of integers is an integer → yes." · `interviewNote`: "GB p.36–37: (1+√2)¹⁰⁰+(1−√2)¹⁰⁰ is a positive integer I; since (1−√2)¹⁰⁰∈(0,1), floor((1+√2)¹⁰⁰) = I−1, so the 100th digit of (1+√2)¹⁰⁰ is 9." | Input ≥44px; placeholder "yes or no"; accept list case-normalised; `aria-describedby`; wrong: `--bad` border + hint strip | Field `--ergo-surface` + `--ergo-line-2`; correct: `--ok-tint`; wrong: `--bad-tint`; JetBrains Mono; no hero; `--dur-base` | both |
| 9 | `l3-prove` | Expand `(a+10b)³` using the binomial theorem; type the coefficient of `a²b`. `required: true`. `pattern` **UNSET**. Penultimate. | `masteryChallenge` | REUSE | correct: "Exactly — 30; row 3 is 1,3,3,1 and the b carries a 10: C(3,1)·a²·(10b) = 3·a²·10b = 30a²b." · hints: [1] "Write out four terms: Σ C(3,k) a^(3−k) (10b)^k for k=0,1,2,3." [2] "The a²b term is k=1: C(3,1)·a²·(10b)¹ = 3·10·a²b." [3] "3 × 10 = 30." | Input ≥44px; scenario panel readable at 200% zoom; keyboard-native; no drag | Surface `--ergo-surface-2` (scenario panel) + `--ergo-surface` (field); correct: `--ok-tint`; wrong: `--bad`; JetBrains Mono; `--shadow-sm` on scenario panel; no hero; `--dur-base` | both |
| 10 | `l3-recap` | Tap recap cards; bridge copy names Inclusion–Exclusion next. No grading. Last beat. | `recap` | REUSE | correct: "Binomial theorem: (a+b)ⁿ = ΣC(n,k)aⁿ⁻ᵏbᵏ. Each row sums to 2ⁿ. The triangle is symmetric. Next: when sets overlap, subtraction enters — Inclusion–Exclusion (L4)." · hints: [1] "(a+b)ⁿ = ΣC(n,k)aⁿ⁻ᵏbᵏ." [2] "Row n sums to 2ⁿ (set a=b=1)." [3] "Next: |A∪B| = |A|+|B|−|A∩B|." | Tap-through; cards ≥44px; no drag | Cards `--ergo-surface`; `3px solid --ch1` top border for chapter close; bridge card `--ergo-surface-2`; Space Grotesk 700 for theorem display; quiet `--dur-slow` fade-in; **no confetti**; reduced-motion: instant | both |

---

## New interaction types (for Wave 0)

### `pascalTriangle` — tap to build Pascal's triangle

**Frozen Zod schema** (add to `InteractionSchema` discriminated union in `src/content/schema.ts`):

```ts
// pascalTriangle — tap to build Pascal's triangle. Each cell reveals as C(n,k)
// (= sum of the two above); each row's running total doubles (2^n); the
// symmetric pair C(n,k)=C(n,n-k) mirrors live. DOM/SVG, tap-to-reveal.
z.object({
  type: z.literal('pascalTriangle'),
  rows: z.number().int().positive(),          // rows to build (e.g. 5 => rows 0..5)
  reveal: z.enum(['tap', 'all']).optional(),  // default 'tap'
  showRowSums: z.boolean().optional(),        // show the 2^n running total per row
  showSymmetry: z.boolean().optional(),       // mirror-highlight C(n,k)=C(n,n-k)
  accept: z.array(z.string()).optional(),     // optional graded read-off (a cell or row sum)
})
```

**Renderer**: `src/lesson/beats/PascalTriangleBeat.tsx`

**Engine dep**: `src/engine/combinatorics.ts` — `nCk(n, k): bigint`, `pascalRow(n): bigint[]`

**Graded status**: `pascalTriangle` is **ungraded** in L3 (`l3-explore` has no `accept`). Do **NOT** add to `GRADED_TYPES`. **DO** add to `InteractionSchema` union + `BeatView` dispatcher + `PascalTriangleBeat.tsx` renderer.

---

## Build decomposition (for Dept 3)

### Engine — `src/engine/combinatorics.ts`

Exact-integer only (BigInt, no floats). Must reproduce every cited number.

```ts
export function factorial(n: number): bigint
export function nPk(n: number, k: number): bigint       // n! / (n-k)!
export function nCk(n: number, k: number): bigint       // n! / (k! * (n-k)!)
export function pascalRow(n: number): bigint[]           // [C(n,0), C(n,1), …, C(n,n)]
```

**Golden tests (must pass):**

| expression | expected |
|------------|----------|
| `pascalRow(4)` | `[1n, 4n, 6n, 4n, 1n]`, sum `16n = 2n**4n` |
| `pascalRow(3)` | `[1n, 3n, 3n, 1n]`, sum `8n = 2n**3n` |
| `pascalRow(5)` | `[1n, 5n, 10n, 10n, 5n, 1n]`, sum `32n = 2n**5n` |
| `nCk(2, 1)` | `2n` (coeff of `ab` in `(a+b)²`) |
| `nCk(3, 1)` | `3n` (base coeff before ×10 in `l3-prove`) |
| `nCk(3, 1) * 10n` | `30n` (final coeff of `a²b` in `(a+10b)³`) |
| `nCk(n, k) === nCk(n, n-k)` | symmetry invariant for all row 0..5 |
| `Σ pascalRow(n)` | `2n**BigInt(n)` for all n 0..6 |

**Invariants** the engine must enforce (unit-test with assertions):
- `Σ pascalRow(n) === 2n**BigInt(n)` (row sum = 2ⁿ)
- `pascalRow(n)[k] === pascalRow(n)[n - k]` (symmetry)
- `pascalRow(n)[k] === pascalRow(n-1)[k-1] + pascalRow(n-1)[k]` (Pascal recursion, k ∈ 1..n-1)

### Schema — `src/content/schema.ts`

Add the frozen `pascalTriangle` Zod object to the `InteractionSchema` discriminated union (verbatim from above). Freeze in Wave 0 before fixture authoring.

### Renderer — `src/lesson/beats/PascalTriangleBeat.tsx`

| Concern | Spec |
|---------|------|
| Layout | Centered SVG/DOM pyramid. Row `n` has `n+1` cells, horizontally centered. |
| Cell sizing | Min `44×44px` (CSS `min-width: 44px; min-height: 44px`). On narrow mobile (< 375px) cells may shrink to `38×38px` with a transparent `::before` hit-target overlay expanding to ≥44px. |
| Cell states | **Unrevealed**: `--ergo-surface-2` fill, dashed `--ergo-line` border, empty. **Revealed**: `--ch1-tint` fill, `--ch1` text (JetBrains Mono), `1px solid --ch1` border. Transition: `--dur-slow` + `--ease-out`, compositor `opacity` + `scale(1.05 → 1.0)`. |
| Keyboard nav | Row-major Tab order (L→R, top→bottom). Unrevealed cells: `role="button"` + `tabIndex={0}`. Revealed cells: `role="cell"` + `tabIndex={-1}`. Space/Enter reveals. |
| `aria-live` | A visually-hidden `<div role="status" aria-live="polite">` updates on: (1) cell reveal → `"C(${n},${k}) = ${value}"`; (2) row completion → `"Row ${n} complete. Sum = ${sum} = 2 to the power ${n}"`; (3) symmetry pair highlight → `"C(${n},${k}) = C(${n},${n-k}) = ${value}"`. |
| `showRowSums` | After all cells in row `n` are revealed, animate in a right-margin label `= 2^n` (JetBrains Mono, `--ch1`, `--dur-slow` fade). |
| `showSymmetry` | On focus/hover of any revealed cell `(n,k)`, add CSS class `.sym-hi` to both `(n,k)` and `(n,n-k)` simultaneously (`2px solid --ch1` ring, `--dur-base` fade). Remove on blur. |
| Hero choreography | If `beat.hero` present: auto-reveal cells sequentially, `--dur-tell` delay between cells, reading left→right top→bottom. If `prefers-reduced-motion: reduce` is set, skip to final frame (all cells revealed synchronously). |
| Reduced motion | `useReducedMotion()` hook. When true: bypass all reveal transitions, render complete triangle immediately (as if `reveal: 'all'`). The final frame is the definitive reduced-motion experience. |
| No drag | Zero drag interactions. Tap + keyboard only. |

**Dispatcher** (`src/lesson/beats/index.tsx`):
```ts
case 'pascalTriangle':
  return <PascalTriangleBeat beat={beat} />;
```

### Fixture fields (match `lesson-overlap-shortcut.json` exemplar shape)

Key structural fields for `fixtures/lesson-combinatorics-3.json`:

```jsonc
{
  "lessonId": "lesson-combinatorics-3",
  "courseId": "course-combinatorics",
  "title": "The Binomial Theorem",
  "patternOptions": [],          // no coin patterns; combinatorics lesson
  "milestoneId": "binomial-theorem-mastered",
  "unlocks": "lesson-combinatorics-4",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "l3-primer",
      "required": false,
      "prompt": "Quick primer — what 2ⁿ and Σ mean before we build Pascal's triangle.",
      "interaction": {
        "type": "primer",
        "variant": "exponent",
        "title": "Exponents and Σ",
        "body": "2³ means 2 × 2 × 2 = 8 — the exponent counts how many times you multiply. Σ (sigma) means 'sum over all the values below.' We'll use both in the binomial theorem.",
        "collapsible": true
      },
      "feedback": {
        "correct": "Good — 2ⁿ doubles each step; Σ sums them all.",
        "hints": [
          "2¹=2, 2²=4, 2³=8 — each is double the one before.",
          "Σₖ f(k) means add f(k) for every k in the range.",
          "Continue."
        ]
      }
    },
    {
      "beatId": "l3-recall",
      "required": true,
      "prompt": "Before we continue: match each expression to its value. These come from L1 and L2.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "2⁰+2¹+2²+2³", "right": "15" },
          { "left": "Sum of row n of Pascal's triangle", "right": "2ⁿ" },
          { "left": "C(n,k) counts", "right": "size-k subsets of n objects" }
        ]
      },
      "maxHintLevel": 2,
      "feedback": {
        "correct": "Exactly — powers of two from L1 are Pascal's row sums in disguise.",
        "hints": [
          "Tap a left item then its matching right item.",
          "2⁰+2¹+2²+2³ = 1+2+4+8 = 15; each Pascal row doubles; C(n,k) = unordered-selection count.",
          "Match all three pairs."
        ]
      }
    },
    {
      "beatId": "l3-bet",
      "required": false,
      "prompt": "Here's row 4 of Pascal's triangle:  1  4  6  4  1. Add it up — and guess the next row's total without building it.",
      "interaction": {
        "type": "prediction",
        "options": ["25 — it's 5²", "32 — it doubles", "Can't tell without building it"]
      },
      "feedback": {
        "byOption": {
          "25 — it's 5²":                     { "note": "That's n² thinking. Row totals double each step (1,2,4,8,16…) → next is 2⁵=32." },
          "32 — it doubles":                  { "note": "Yes — each row doubles: 16→32=2⁵. Setting a=b=1 makes every row sum 2ⁿ.", "correct": true },
          "Can't tell without building it":   { "note": "It's not random — every row sums to 2ⁿ, so 16 doubles to 32." }
        }
      }
    },
    {
      "beatId": "l3-win",
      "required": true,
      "prompt": "Expand (a+b)². What is the coefficient of the ab term?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          { "id": "coeff-ab", "label": "Coefficient of ab in (a+b)²", "accept": ["2"], "placeholder": "?" }
        ]
      },
      "maxHintLevel": 3,
      "feedback": {
        "correct": "Right — 2 = C(2,1); the cross term shows up twice, ab+ba.",
        "hints": [
          "Expand (a+b)(a+b) term by term.",
          "Freshman's dream says a²+b², but it misses two middle terms: a·b and b·a.",
          "a·b + b·a = 2ab → coefficient 2 = C(2,1)."
        ]
      }
    },
    {
      "beatId": "l3-scaffold-a",
      "required": false,
      "track": "A",
      "prompt": "Track A: here's the full (a+b)² expansion — see how the coefficients come from C(2,k) before building the full triangle.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Why the coefficients are 1, 2, 1",
        "body": "(a+b)² = (a+b)(a+b)\n         = a·a + a·b + b·a + b·b\n         = a²  +  2ab  +  b²\n\nCoefficients: 1, 2, 1 = C(2,0), C(2,1), C(2,2).\nThese are row 2 of Pascal's triangle.\n\nIn general: the coefficient of aⁿ⁻ᵏbᵏ in (a+b)ⁿ is C(n,k) — the number of ways to pick which k of the n factors contribute the b.",
        "collapsible": false
      },
      "feedback": {
        "correct": "The cross terms are the key — they give C(n,k) counts.",
        "hints": [
          "Notice 2 = C(2,1): two ways to pick one 'b' from two factors.",
          "In (a+b)³ there are C(3,1)=3 ways to pick one b from three factors.",
          "That's why the a²b coefficient is always C(n,1)."
        ]
      }
    },
    {
      "beatId": "l3-explore",
      "required": false,
      "prompt": "Tap each cell to build Pascal's triangle row by row. Each cell is the sum of the two directly above it — watch the running total in the right margin.",
      "interaction": {
        "type": "pascalTriangle",
        "rows": 5,
        "reveal": "tap",
        "showRowSums": true,
        "showSymmetry": true
      },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "Row 4 = 1+4+6+4+1 = 16 = 2⁴. Row 5 = 1+5+10+10+5+1 = 32 = 2⁵.",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "Every row doubles the last — the same 2ⁿ powers from L1, reappearing as Pascal's row sums.",
        "hints": [
          "Tap any blank cell to reveal its value.",
          "Each cell = sum of the two cells directly above it.",
          "After a whole row is revealed the right margin shows its total as a power of 2."
        ]
      }
    },
    {
      "beatId": "l3-model",
      "required": false,
      "introducesSymbol": "(a+b)ⁿ/Σ",
      "groundedBy": ["l3-explore", "l3-primer"],
      "comparison": true,
      "prompt": "Three ways to read the same identity — tap each card to reveal.",
      "interaction": {
        "type": "tripletReveal",
        "value": "C(n,k)",
        "lenses": [
          {
            "label": "Pascal's triangle cell (n,k)",
            "body": "Every cell = C(n,k), the same combination count from L2. Row 4's entries 1, 4, 6, 4, 1 are C(4,0) through C(4,4)."
          },
          {
            "label": "Binomial theorem at a=b=1",
            "body": "(a+b)ⁿ = Σₖ C(n,k) aⁿ⁻ᵏ bᵏ. Set a=b=1: Σₖ C(n,k) = 2ⁿ. That's exactly the row sum you just built."
          },
          {
            "label": "Symmetry C(n,k) = C(n,n−k)",
            "body": "Choosing k objects in = choosing n−k objects out. The row mirrors: C(5,2) = C(5,3) = 10."
          }
        ],
        "display": "cards"
      },
      "feedback": {
        "correct": "Three routes, one identity: C(n,k) is Pascal's cell, the binomial coefficient, and the combination count.",
        "hints": [
          "Reveal all three lens cards.",
          "Setting a=b=1 in (a+b)ⁿ=ΣC(n,k)aⁿ⁻ᵏbᵏ gives ΣC(n,k)=2ⁿ — the row sum you built in l3-explore.",
          "C(n,n−k)=C(n,k): choosing k items in is the same as choosing n−k items out."
        ]
      }
    },
    {
      "beatId": "l3-applied",
      "required": true,
      "prompt": "Is (1+√2)ⁿ + (1−√2)ⁿ always an integer? Type yes or no.",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          { "id": "integer-check", "label": "Always an integer?", "accept": ["yes", "Yes", "YES"], "placeholder": "yes or no" }
        ]
      },
      "maxHintLevel": 3,
      "interviewNote": "GB p.36–37: (1+√2)¹⁰⁰+(1−√2)¹⁰⁰ is a positive integer I; since (1−√2)¹⁰⁰∈(0,1), floor((1+√2)¹⁰⁰) = I−1, so the 100th digit of (1+√2)¹⁰⁰ is 9.",
      "feedback": {
        "correct": "Right — the odd-power √2 terms pair off and cancel, leaving twice the even terms: an integer.",
        "hints": [
          "Expand each binomial with the theorem and add the two expansions together.",
          "k odd: C(n,k)(√2)ᵏ + C(n,k)(−√2)ᵏ = 0. The irrational pieces cancel in pairs.",
          "k even: 2·C(n,k)·2^(k/2) ∈ ℤ. Sum of integers is an integer → yes."
        ]
      }
    },
    {
      "beatId": "l3-prove",
      "required": true,
      "prompt": "Mastery challenge: expand (a+10b)³ using the binomial theorem. What is the coefficient of the a²b term?",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Any integer x can be written as a + 10b where a is its ones digit (0–9). Expanding (a+10b)³ via the binomial theorem lets you control the last digits of x³. Use row 3 of Pascal's triangle: 1, 3, 3, 1.",
        "fields": [
          { "id": "coeff-a2b", "label": "Coefficient of a²b in (a+10b)³", "accept": ["30"], "placeholder": "?" }
        ]
      },
      "maxHintLevel": 3,
      "feedback": {
        "correct": "Exactly — 30; row 3 is 1,3,3,1 and the b carries a 10: C(3,1)·a²·(10b) = 3·a²·10b = 30a²b.",
        "hints": [
          "Write out four terms: Σ C(3,k) a^(3−k) (10b)^k for k=0,1,2,3.",
          "The a²b term is k=1: C(3,1)·a²·(10b)¹ = 3·a²·10b.",
          "3 × 10 = 30."
        ]
      }
    },
    {
      "beatId": "l3-recap",
      "required": true,
      "prompt": "Reveal the recap — and the bridge to what comes next.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "Binomial theorem: (a+b)ⁿ = ΣC(n,k)aⁿ⁻ᵏbᵏ. Each row sums to 2ⁿ. The triangle is symmetric. Next: when sets overlap, subtraction enters — Inclusion–Exclusion (L4).",
        "hints": [
          "(a+b)ⁿ = ΣC(n,k)aⁿ⁻ᵏbᵏ.",
          "Row n sums to 2ⁿ (set a=b=1).",
          "Next: |A∪B| = |A|+|B|−|A∩B|."
        ]
      }
    }
  ]
}
```

---

## DoR gap closures

### 1. Primer (variant: `exponent`) — `l3-primer`

- **Why required**: `l3-recall` immediately retrieves `2ⁿ` + `Σ2^L` from L1. `l3-model` introduces `Σₖ C(n,k)aⁿ⁻ᵏbᵏ`. Without a JIT refresher, learners who are fuzzy on exponents or sigma notation stumble at the notation before the idea lands.
- **Design**: `variant: 'exponent'` (existing variant in the schema); `collapsible: true` so confident Track-B learners can skip it; body text matches the `exponent-primer` pattern from `lesson-overlap-shortcut.json` (beat `exponent-primer`). Accent `--ch1`.
- **Notation ladder**: `l3-model` carries `introducesSymbol: "(a+b)ⁿ/Σ"` and `groundedBy: ["l3-explore", "l3-primer"]`. `validate-fixtures` must confirm `l3-primer` precedes `l3-model` in the both-track visible subsequence.

### 2. Track-A scaffold — `l3-scaffold-a`

- **Why required**: Track-A learners benefit from seeing the explicit `(a+b)²` derivation (coefficients `1,2,1 = C(2,0..2)`) before tap-building the full triangle. Without it, the jump from "I typed 2" (`l3-win`) to "now build 6 rows" (`l3-explore`) is steep for learners who don't immediately see why.
- **Design**: `primer` `variant: 'custom'`; `track: 'A'`; `required: false`; placed between `l3-win` (beat 4) and `l3-explore` (beat 6); `collapsible: false` (Track-A should read it fully, but `required: false` means they can advance); body in JetBrains Mono for the step-by-step derivation.
- **Track-B impact**: zero — `track: 'A'` gates render entirely; Track-B flows directly from `l3-win` → `l3-explore`.

### 3. Interview note — `l3-applied`

- **Beat**: `l3-applied` carries `interviewNote`.
- **Content**: GB p.36–37 — the "100th digit of `(1+√2)¹⁰⁰` = 9" conclusion. The integer-pairing structure (`l3-applied`'s teach) is exactly what makes the digit argument work: `(1+√2)¹⁰⁰ + (1−√2)¹⁰⁰ = I ∈ ℤ` and `(1−√2)¹⁰⁰ ∈ (0,1)` pins `floor((1+√2)¹⁰⁰) = I−1`.
- **Placement rationale**: the interview note belongs on the beat that teaches the underlying mechanism (odd-power cancellation), not the beat that states the theorem. Learners who just worked the cancellation have the context to understand why the digit conclusion follows.

---

## Definition-of-Ready checklist (every beat)

| # | beatId | ☑ verified+sourced problem | ☑ concrete interactive mechanic | ☑ feedback + 3 hints | ☑ a11y (44px · reduced-motion · aria-live) |
|---|--------|---------------------------|--------------------------------|----------------------|--------------------------------------------|
| 1 | `l3-primer` | n/a (primer) | tap-to-expand collapsible card | idle body copy | toggle ≥44px; no aria-live needed; no drag |
| 2 | `l3-recall` | ☑ GB p.33 §4.2 + L1 bridge: `2⁰+2¹+2²+2³=15`; `2ⁿ` growth; `nCk` = count | match-pairs tap | ✅ | shuffle; ≥44px; `aria-live` "pair matched"; no drag |
| 3 | `l3-bet` | ☑ GB p.33 §4.2: row 4 sums to 16; row sums = 2ⁿ; next = 32 | single-tap prediction chips | `byOption` (schema-required for `prediction`) | ≥44px chips; `aria-pressed`; no drag |
| 4 | `l3-win` | ☑ GB p.33 §4.2 + engine: coeff of `ab` in `(a+b)²` = 2 = C(2,1) | type-in numeric field | ✅ correct + 3 hints | ≥44px input; keyboard-native; `aria-describedby`; shake = transform only |
| 5 | `l3-scaffold-a` | n/a (scaffold primer) | read card | idle body copy | card readable at 200% zoom; no drag |
| 6 | `l3-explore` | ☑ GB p.33 §4.2: C(n,k) cells; row sum=2ⁿ; symmetry C(n,k)=C(n,n−k) | tap-to-reveal DOM/SVG triangle | hero + idle hints | ≥44px per cell (overlay); keyboard Tab+Space/Enter; `aria-live` per cell + row + pair; reduced-motion final frame ✓ |
| 7 | `l3-model` | ☑ GB p.33 §4.2: binomial theorem stated; a=b=1 ⇒ ΣC(n,k)=2ⁿ; C(n,k)=C(n,n−k) | tap 3 lens cards | ✅ correct + 3 hints | ≥44px cards; `aria-expanded`; `aria-live` per reveal; no drag |
| 8 | `l3-applied` | ☑ GB p.36–37 §4.2: `(1+√2)ⁿ+(1−√2)ⁿ∈ℤ`; odd terms cancel (engine reproduces integer-pairing structure) | type-in text field | ✅ correct + 3 hints + `interviewNote` | ≥44px input; `aria-describedby`; no drag |
| 9 | `l3-prove` | ☑ GB p.37 §4.2: `(a+10b)³` coeff of `a²b` = 30 (engine: `nCk(3,1)*10 = 30`); `pattern` UNSET | type-in numeric field | ✅ correct + 3 hints | ≥44px input; keyboard-native; `aria-describedby`; no drag |
| 10 | `l3-recap` | n/a (recap closure + bridge) | tap-through cards | bridge copy | ≥44px; no drag |

### Hard gate checks

- [x] `l3-recall` = `retrievalGrid`, first graded beat ✓
- [x] `l3-bet` = `prediction` with `byOption` feedback (not `FeedbackTripleSchema`) ✓
- [x] `l3-prove` = `masteryChallenge`, `required: true`, beat 9 (penultimate); `pattern` field **UNSET** ✓
- [x] `l3-recap` = `recap`, beat 10 (last) ✓
- [x] ≥1 `primer` (`l3-primer`, `variant: 'exponent'`) ✓
- [x] ≥1 `interviewNote` (`l3-applied`) ✓
- [x] ≥1 `track: 'A'` beat (`l3-scaffold-a`, `required: false`) ✓
- [x] `pascalTriangle` beat (`l3-explore`) has `hero` block with `reducedMotionFinalFrame: true` ✓
- [x] `l3-model` has `introducesSymbol` + `groundedBy: ["l3-explore", "l3-primer"]` ✓
- [x] All tap targets ≥44px ✓
- [x] Zero drag-only interactions ✓
- [x] `aria-live` fires for every `pascalTriangle` cell reveal, row-sum reveal, and symmetry-pair highlight ✓
- [x] Motion budget: ONE cinematic moment per screen (the `l3-explore` hero row-5 doubling) ✓
- [x] No confetti anywhere ✓
- [x] All feedback copies sourced verbatim from brief (no invented copy) ✓

### Wave 0 action items (Dept 3)

- [ ] Add `pascalTriangle` to `InteractionSchema` union — `src/content/schema.ts`
- [ ] Add `case 'pascalTriangle'` to `BeatView` dispatcher — `src/lesson/beats/index.tsx`
- [ ] Create `src/lesson/beats/PascalTriangleBeat.tsx` (tap + keyboard + `aria-live`; cell reveal = sum-of-two-above; row-sum + symmetry highlight)
- [ ] Implement `nCk` + `pascalRow` in `src/engine/combinatorics.ts` with golden tests (see goldens table above)
- [ ] Add `lesson-combinatorics-1..4` to `GATED` + `MASTERY_LESSONS` in `scripts/validate-fixtures.ts`
- [ ] Extend `validate-fixtures` to engine-cross-check `accept` values in combinatorics `answerEntry` / `masteryChallenge` beats against `combinatorics.ts`

---

## Dept1↔Dept2 readiness check

| # | beatId | (a) verified+sourced problem | (b) concrete interactive mechanic | status |
|---|--------|------------------------------|-----------------------------------|--------|
| 1 | `l3-primer` | n/a | JIT primer card | ✅ |
| 2 | `l3-recall` | ☑ GB p.33 + L1 bridge (`lesson-overlap-shortcut`) | match-pairs tap | ✅ |
| 3 | `l3-bet` | ☑ GB p.33 §4.2 (row sums 2ⁿ; row 4 = 16; next = 32) | single-tap prediction chips | ✅ |
| 4 | `l3-win` | ☑ GB p.33 §4.2 + engine (`nCk(2,1)=2`) | type-in numeric | ✅ |
| 5 | `l3-scaffold-a` | n/a | read scaffold card | ✅ |
| 6 | `l3-explore` | ☑ GB p.33 §4.2 (C(n,k) cells; 2ⁿ row sums; symmetry) | tap-to-reveal triangle | ✅ |
| 7 | `l3-model` | ☑ GB p.33 §4.2 (binomial theorem; a=b=1; symmetry) | tap 3 lens cards | ✅ |
| 8 | `l3-applied` | ☑ GB p.36–37 §4.2 (integer pairing ☑ engine; digit conclusion ☑ source) | type-in text | ✅ |
| 9 | `l3-prove` | ☑ GB p.37 §4.2 (`(a+10b)³`; coeff 30 ☑ engine) | type-in numeric | ✅ |
| 10 | `l3-recap` | n/a | tap-through recap | ✅ |

**Kickbacks to Dept 1:** none. The brief has no ⚠️ `NEEDS-WEB-SOURCE` rows; all problems carry `☑ engine ☑ source`. Feedback copy is lifted verbatim from the brief's per-option section. No corrections required.

**VERDICT: READY** — conditional on Wave 0 `pascalTriangle` implementation (Dept 3 must freeze the Zod schema + `nCk`/`pascalRow` engine signatures before fixture authoring begins).

---

*L3 engine functions to freeze in Wave 0:* `nCk(n, k): bigint`, `pascalRow(n): bigint[]` with invariants `Σrow=2ⁿ` and `C(n,k)=C(n,n−k)`.
*New-type schema need:* `pascalTriangle` added to `InteractionSchema` discriminated union (frozen Zod above), `BeatView` dispatcher entry, `PascalTriangleBeat.tsx` renderer.
