# Interaction Spec: Conditional & Total Expectation  (lesson-expected-value-4)

Chapter: `ch-expected-value-2` · Accent: `--ch1` indigo `#4F46E5` · `patternOptions: ["H"]` (placeholder; `beat.pattern` UNSET everywhere)

---

## Beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse or NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|-----------------------------------------|-----------------|--------------|-----------------|------|---------------|-------|
| 1 | `ev4-recall` | Tap a label on the left → system highlights it; tap its wait on the right → pair locks green; repeat until all pairs matched | `retrievalGrid` | reuse | **correct:** "Right — conditioning on the first flip *is* the law of total expectation. PHT's E[HH]=6 was its first instance." **hints:** [1] "Tap a label, then tap its wait." [2] "PHT's first-step gave E[HH]=6 by conditioning on whether the first flip was H or T." [3] "Match: E[HH] → 6." | 44px tap targets; keyboard: arrow-select + Enter; matched pair announced via `aria-live="polite"` | static pairs | both |
| 2 | `ev4-bet` | See 4 option chips → tap one → system reveals per-option refutation note; "About $7" chip carries `correct:true` | `prediction` (`byOption`) | reuse | **byOption** (verbatim from brief): "A little over $3.50" → note: "Let's test it — re-rolling on 4–6 adds value beyond one roll, so it climbs past $3.50." · "About $5" → note: "Let's test it — warmer, but the re-roll bonus pushes higher. Condition on the first roll and solve." · "About $7" → note: "Good instinct — let's prove it by conditioning on the first roll and solving the self-referential equation." *(correct:true)* · "Unbounded" → note: "Let's test it — re-rolls get geometrically rarer, so the value converges to a finite number." | 44px chips; keyboard: arrow-cycle + Space/Enter; per-option note via `aria-live="polite"` | — | both |
| 3 | `ev4-win` | Read coin-flip bet setup → type answer in fraction field → Submit → grade; hint ladder on wrong | `answerEntry` | reuse | **correct:** "Correct — ½·(7/2) + ½·0 = 7/4. Heads case pays the die's average; tails case pays nothing. Weight each by its probability." **hints:** [1] "Heads pays the die only half the time. Weight by P(case): ½·3.5 + ½·0 = 7/4." [2] "E[die] = 7/2 = 3.5. Apply total expectation: ½·3.5 + ½·0 = ?" [3] "½ × 3.5 = 1.75 = 7/4." | 44px input; keyboard-native entry; `aria-live="assertive"` for correct/incorrect verdict | — | both |
| 4 | `ev4-explore` | Tree root shown collapsed → tap each branch label to expand → branch fans out showing P(case) and E[X\|case]; self-referential branch shows loop-back arc → after all expanded, root recombines Σ P·value → equation appears and solves to E[X]=7 | `conditionalTree` | **NEW** | **correct (reveal after expand):** "The {4,5,6} branch loops back to the same game — E[X] appears on both sides. The equation ½·2 + ½·(5+E[X]) = E[X] solves to 7." **hints:** [1] "Tap each branch to see its probability and expected value." [2] "The {4,5,6} branch restarts the game — its value contains E[X] itself." [3] "Once all branches are expanded, the root adds them up. The loop forces you to solve for E[X]." | Branch labels ≥44px; keyboard: Tab to each branch, Enter/Space to expand; `aria-live="polite"` announces each expanded branch's `P(case)·value`; `aria-live="assertive"` for final solved E[X]=7; **reduced-motion final frame:** tree fully expanded, loop arc shown, E[X]=7 displayed statically | **HERO:** sequential branch expand 600ms/branch; SVG loop-back arc pulses `--ch1` on the `restart` case; equation appears below; E[X]=7 highlights with 400ms `--ch1` accent. No confetti. Reduced-motion: final-frame only | both |
| 5 | `ev4-model` | Read conditioning law card → tap "I see the difference" align-and-articulate button (averaging ≠ Bayes) → card reveals forward-flag and locks | `primer` {`variant:'custom'`} | reuse | **correct:** "Averaging over cases ≠ updating from evidence. Conditioning here: split → average within → weight by P(case). Belief-updating from new evidence is Bayes — a different machine, coming later." **hints:** [1] "Read the card once more." [2] "Key distinction: here P(case) is known in advance and we average. Bayes revises a probability given evidence." [3] "Continue when you see the difference." | Collapsible card; keyboard-focusable button; `aria-live="polite"` for expand/collapse state | — | both |
| 6 | `ev4-firststep` | Read dice game with {4,5,6} case highlighted → type the case value in short field → Submit → grade → hint ladder | `answerEntry` | reuse | **correct:** "Exactly — rolling {4,5,6} banks the expected face (5) and the game replays. That branch is worth 5 + E[X]." **hints:** [1] "Rolling 4–6 banks 5 and restarts the game, so that case is worth 5 + E[X], not just 5." [2] "E[face \| {4,5,6}] = (4+5+6)/3 = 5. But the game continues for another full turn." [3] "Write it: case value = 5 + E[X]." | 44px input; keyboard-native; `aria-live="assertive"` for verdict | — | both |
| 7 | `ev4-isolate` | Read worked-algebra card (E = ½·2 + ½·(5+E) → E/2 = 7/2 → E = 7 step-by-step) → tap Continue | `primer` {`variant:'custom'`} | reuse | **correct:** "Collect E on one side — it falls out cleanly at 7." **hints:** [1] "Expand the right side: 1 + 5/2 + E/2." [2] "Subtract E/2 from both sides: E/2 = 7/2." [3] "Multiply by 2: E = 7." | Collapsible; keyboard-focusable Continue; `aria-live="polite"` for expand | — | **A** |
| 8 | `ev4-prove` | Read dice game scenario → type E[X] in field → Submit → grade → hint ladder | `masteryChallenge` | reuse | **correct:** "E[X] = 7. Treat E[X] as the unknown: ½·2 + ½·(5+E[X]) = E[X] → 1 + 5/2 + E[X]/2 = E[X] → ½·E[X] = 7/2 → E[X] = 7." **hints:** [1] "E[X] on both sides isn't a dead end; treat it as the unknown and solve: ½·2 + ½·(5+E[X]) = 7." [2] "Expand: 1 + 5/2 + E[X]/2 = E[X]. Collect E[X] terms on one side." [3] "E[X] − E[X]/2 = 7/2 → ½·E[X] = 7/2 → E[X] = 7." | 44px input; keyboard-native; `aria-live="assertive"` for verdict; hint expansion accessible via button | — | both |
| 9 | `ev4-recap` | Tap to reveal recap cards | `recap` {} | reuse | **correct:** "Split the game into cases → average within each → weight by P(case). When a case restarts, E[X] appears on both sides — solve for it. Belief-updating from evidence is Bayes, coming later." **hints:** [1] "Reveal the cards." [2] "Split → average within → weight by P(case)." [3] "If the game loops, solve for E[X]." | Keyboard-navigable cards; `aria-live="polite"` per card reveal | — | both |

**Beat flags summary**

| beatId | `required` | `track` | `hero` | `introducesSymbol` | `groundedBy` | `comparison` | `interviewNote` | `pattern` |
|--------|-----------|---------|--------|-------------------|-------------|-------------|----------------|----------|
| `ev4-recall` | `true` | `both` | — | — | — | — | — | **UNSET** |
| `ev4-bet` | `false` | `both` | — | — | — | — | — | **UNSET** |
| `ev4-win` | `true` | `both` | — | — | — | — | — | **UNSET** |
| `ev4-explore` | `false` | `both` | `slowFirst:true, structuralReadout:"E[X]=7 …", reducedMotionFinalFrame:true` | — | — | — | — | **UNSET** |
| `ev4-model` | `false` | `both` | — | `"E[X]=Σ E[X\|case]P(case)"` | `["ev4-win","ev4-explore"]` | `true` | — | **UNSET** |
| `ev4-firststep` | `true` | `both` | — | — | — | — | — | **UNSET** |
| `ev4-isolate` | `false` | `A` | — | — | — | — | — | **UNSET** |
| `ev4-prove` | `true` | `both` | — | — | — | — | `"E[X] on both sides → isolate & solve (treat E[X] as the unknown); conditioning ≠ Bayes (here we average over cases, not update from evidence)."` | **UNSET** |
| `ev4-recap` | `true` | `both` | — | — | — | — | — | **UNSET** |

`computeMastered` keys on: `{ev4-recall, ev4-win, ev4-firststep, ev4-prove}` (from brief).

---

## New interaction types (for Wave 0)

### `conditionalTree` — frozen Zod schema (Wave 0; do not diverge)

```ts
// conditionalTree — expand a one-step CASE tree. Each branch carries P(case) and
// either a literal E[X|case] (`value`) or a self-referential `restart` (the case
// banks `add` and replays the SAME game → worth add + E[X]). The root recombines
// Σ P·value (+ Σ P·(add+E[X])) and SOLVES for E[X] when any case restarts.
// DOM/SVG; tap-to-expand each branch.
z.object({
  type: z.literal('conditionalTree'),
  cases: z.array(z.object({
    label: z.string(),
    p: z.object({ n: z.number().int(), d: z.number().int().positive() }),                       // P(case)
    value: z.object({ n: z.number().int(), d: z.number().int().positive() }).optional(),         // literal E[X|case]
    restart: z.object({ add: z.object({ n: z.number().int(), d: z.number().int().positive() }) }).optional(), // case worth add + E[X] (self-referential)
  })),
  accept: z.array(z.string()).optional(),                                                          // optional graded read-off of E[X] (UNGRADED in L4 — omit)
})
```

**Placement in `schema.ts`:** add this variant to `InteractionSchema`'s `z.discriminatedUnion('type', [...])` array.

**UNGRADED in L4** — do NOT add `'conditionalTree'` to `GRADED_TYPES`; DO add to the dispatcher and schema union.

### Renderer: `ConditionalTreeBeat.tsx`

New file at `src/lesson/beats/ConditionalTreeBeat.tsx`. Add dispatch entry in `src/lesson/beats/index.tsx` alongside other beat types.

**Props shape (from Zod inference):**
```ts
type ConditionalTreeProps = {
  beat: Beat & { interaction: { type: 'conditionalTree'; cases: CaseNode[]; accept?: string[] } }
  onComplete: () => void
}
type CaseNode = {
  label: string
  p: Rational
  value?: Rational       // literal E[X|case]
  restart?: { add: Rational }  // self-referential; worth add + E[X]
}
```

**Key renderer behavior:**
- Root node renders as a single expandable source labeled "Roll die."
- Each case branch is a `<button>` (≥44px) collapsed to show only the label; aria-expanded="false" initially.
- On tap/Enter: branch expands to show `P = p.n/p.d` and either `E[X|case] = value.n/value.d` (literal) or the `restart` branch showing `add.n/add.d + E[X]` with a curved SVG loop-back arc from the restart node back to the root.
- After ALL branches expanded: the root recombines and displays `Σ P·E[X|case]`, then—if any `restart` branch present—shows the linear equation and animates the solve to `E[X] = totalExpectation(cases).n/d`.
- `aria-live="polite"` region: updates with each branch expansion text. `aria-live="assertive"` region: fires once with `"E[X] = <value>"` after solve.
- Reduced-motion (`prefers-reduced-motion: reduce`): skip all animation; render final frame directly (tree fully expanded, loop arc static, E[X] shown).
- Color tokens: branch lines `--ch1` (#4F46E5); loop-back arc `--ch1` with dashed stroke; solved E[X] chip background `--ch1-tint`.
- Font: `Space Grotesk` for labels; `JetBrains Mono tabular-nums` for fractions and the solved equation.

### Engine dependency: `src/engine/expectation.ts`

```ts
totalExpectation(cases: Array<{ p: Rational; value?: Rational; restart?: { add: Rational } }>): Rational
```

- For all-literal cases: `Σ p_i · value_i` via `ratAdd` / `ratMul`.
- For cases with ≥1 `restart`: builds the equation `E = Σ_literal p_i·value_i + Σ_restart p_j·(add_j + E)`, rewrites as `(1 − Σ_restart p_j)·E = Σ_literal p_i·value_i + Σ_restart p_j·add_j`, then solves via the existing **`solveLinearSystem`** utility (imported from `src/engine/automaton.ts`) — the same function PHT first-step equations use.

---

## Build decomposition (for Dept 3)

### Engine functions + goldens (`src/engine/expectation.ts`)

| function | signature | golden | source |
|----------|-----------|--------|--------|
| `totalExpectation` (literal) | `(cases: Case[]) → Rational` | coin-die: `{n:7,d:4}` | GB p.47 |
| `totalExpectation` (self-referential) | `(cases: Case[]) → Rational` | dice game: `{n:7,d:1}` | GB p.48 |

**Coin-die trace** (literal, no `restart`):
```
cases = [
  { p:{n:1,d:2}, value:{n:7,d:2} },   // heads → die, E[die]=7/2
  { p:{n:1,d:2}, value:{n:0,d:1} }    // tails → $0
]
Σ p_i·value_i = (1/2)·(7/2) + (1/2)·0 = 7/4  ✓
```

**Dice game trace** (self-referential, `solveLinearSystem` path):
```
cases = [
  { p:{n:1,d:2}, value:{n:2,d:1} },              // {1,2,3}: E[face]=2, literal
  { p:{n:1,d:2}, restart:{add:{n:5,d:1}} }        // {4,5,6}: E[face]=5, restart
]
Build: E = (1/2)·2 + (1/2)·(5+E)
     → E = 1 + 5/2 + E/2
     → E − E/2 = 7/2
     → (1 − 1/2)·E = 7/2
     → E = 7   ✓  (via solveLinearSystem from automaton.ts)
```

**Stage-2 expectation cross-check** (Wave 0 CI gate): `validate-fixtures` calls `totalExpectation` on L4's `conditionalTree` beat's `cases` array and asserts result equals `{n:7,d:1}`. Coin-die self-check via `ev4-win`'s `accept` list normalization (answer `"7/4"` matches `{n:7,d:4}`).

### Schema variant (`src/content/schema.ts`)

Add to `InteractionSchema` discriminated union — insert after the `retrievalGrid` variant:

```ts
z.object({
  type: z.literal('conditionalTree'),
  cases: z.array(z.object({
    label: z.string(),
    p: RationalSchema,
    value: RationalSchema.optional(),
    restart: z.object({ add: RationalSchema }).optional(),
  })),
  accept: z.array(z.string()).optional(),
}),
```

No other schema changes needed. `RationalSchema` is already defined at the top of the file.

### Renderer + widget (`ConditionalTreeBeat.tsx`) — key implementation notes

1. **SVG layout**: root circle at top-center; branch lines fan down at equal angles. For 2 cases: ±35° from vertical. Scale: root 48px diameter, branch nodes 40px, hit zones ≥44px via padding.
2. **Loop-back arc**: when a `restart` case is present, draw a cubic Bézier from the restart leaf back to the root circle. Use `stroke: var(--ch1)`, `stroke-dasharray: 4 4`, `fill: none`. Animate `stroke-dashoffset` from full to 0 (600ms, `ease-out`). Skip under `prefers-reduced-motion`.
3. **Equation solve animation**: after all branches expanded, insert a `<div aria-live="assertive">` block below the SVG. Append the equation text token by token (100ms/token). Final token is `"= 7"` (highlighted with `--ch1` background). Under `prefers-reduced-motion`, insert the full equation at once.
4. **Keyboard contract**: `Tab` focuses branches left-to-right; `Enter`/`Space` expands; focus moves to the branch's revealed content after expand; `Escape` does nothing (no collapse once expanded).
5. **Ungraded dispatch**: `ConditionalTreeBeat` calls `onComplete()` after the solve animation completes (or immediately on reduced-motion). No grading; no submit button.

### Fixture JSON (`fixtures/lesson-expected-value-4.json`)

```json
{
  "lessonId": "lesson-expected-value-4",
  "courseId": "course-expected-value",
  "title": "Conditional & Total Expectation",
  "patternOptions": ["H"],
  "milestoneId": "conditional-expectation-mastered",
  "unlocks": "lesson-expected-value-5",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "ev4-recall",
      "required": true,
      "prompt": "By now you know PHT's answer. Match the pattern to the expected wait it produces via first-step conditioning.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "Expected flips until HH", "right": "6" },
          { "left": "Method used", "right": "condition on first flip" }
        ]
      },
      "feedback": {
        "correct": "Right — conditioning on the first flip is the law of total expectation. PHT's E[HH]=6 was its first instance.",
        "hints": [
          "Tap a label, then tap its matching value.",
          "PHT's first-step gave E[HH]=6 by conditioning on whether the first flip was H or T.",
          "Match: E[HH] → 6."
        ]
      }
    },
    {
      "beatId": "ev4-bet",
      "required": false,
      "prompt": "Roll a die. Get {1,2,3}: collect the face and stop. Get {4,5,6}: collect the face and roll again, adding to your total. What is a single play worth?",
      "interaction": {
        "type": "prediction",
        "options": ["A little over $3.50", "About $5", "About $7", "Unbounded"]
      },
      "feedback": {
        "byOption": {
          "A little over $3.50": {
            "note": "Let's test it — re-rolling on 4–6 adds value beyond one roll, so it climbs past $3.50."
          },
          "About $5": {
            "note": "Let's test it — warmer, but the re-roll bonus pushes higher. Condition on the first roll and solve."
          },
          "About $7": {
            "note": "Good instinct — let's prove it by conditioning on the first roll and solving the self-referential equation.",
            "correct": true
          },
          "Unbounded": {
            "note": "Let's test it — re-rolls get geometrically rarer, so the value converges to a finite number."
          }
        }
      }
    },
    {
      "beatId": "ev4-win",
      "required": true,
      "prompt": "Simpler first. Flip a fair coin: heads → roll a die and keep it; tails → get $0. What is this bet worth? (Give your answer as a fraction, e.g. 3/4.)",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "coin-die",
            "label": "Value of the bet",
            "accept": ["7/4", "1.75", "1 3/4"],
            "placeholder": "?/?",
            "suffix": "dollars"
          }
        ]
      },
      "feedback": {
        "correct": "Correct — ½·(7/2) + ½·0 = 7/4. Heads case pays the die's average; tails case pays nothing. Weight each by its probability.",
        "hints": [
          "Heads pays the die only half the time. Weight by P(case): ½·3.5 + ½·0 = 7/4.",
          "E[die] = 7/2 = 3.5. Apply total expectation: ½·3.5 + ½·0 = ?",
          "½ × 3.5 = 1.75 = 7/4."
        ]
      }
    },
    {
      "beatId": "ev4-explore",
      "required": false,
      "prompt": "Back to the dice game. Tap each branch to expand the case tree — then watch the root recombine. One branch loops back.",
      "interaction": {
        "type": "conditionalTree",
        "cases": [
          {
            "label": "Roll {1, 2, 3}",
            "p": { "n": 1, "d": 2 },
            "value": { "n": 2, "d": 1 }
          },
          {
            "label": "Roll {4, 5, 6}",
            "p": { "n": 1, "d": 2 },
            "restart": { "add": { "n": 5, "d": 1 } }
          }
        ]
      },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "E[X] = 7 (½·2 + ½·(5+E[X]) = E[X] solved by isolating E[X]).",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "The {4,5,6} branch loops back to the same game — E[X] appears on both sides. The equation ½·2 + ½·(5+E[X]) = E[X] solves to 7.",
        "hints": [
          "Tap each branch to see its probability and expected value.",
          "The {4,5,6} branch restarts the game — its value contains E[X] itself.",
          "Once all branches are expanded, the root adds them up. The loop forces you to solve for E[X]."
        ]
      }
    },
    {
      "beatId": "ev4-model",
      "required": false,
      "introducesSymbol": "E[X]=Σ E[X|case]P(case)",
      "groundedBy": ["ev4-win", "ev4-explore"],
      "comparison": true,
      "prompt": "Those two examples used the same move. Read the law — then tap to confirm you see why averaging is not the same as belief-updating.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Law of Total Expectation",
        "body": "E[X] = Σ E[X|case]·P(case). Split the game into cases → average the value within each case → weight by how likely each case is. If a case restarts the game, E[X] appears on both sides → solve for it. PHT's E[HH]=6 came from the same move (condition on the first flip). Note: conditioning here means averaging over known cases — revising a probability when you see evidence is Bayes, a different machine (coming later).",
        "collapsible": false
      },
      "feedback": {
        "correct": "Averaging over cases ≠ updating from evidence. Conditioning here: split → average within → weight by P(case). Belief-updating from new evidence is Bayes — a different machine, coming later.",
        "hints": [
          "Read the card once more.",
          "Key distinction: here P(case) is known in advance and we average. Bayes revises a probability given evidence.",
          "Continue when you see the difference."
        ]
      }
    },
    {
      "beatId": "ev4-firststep",
      "required": true,
      "prompt": "Set up the dice game equation. The {4,5,6} case: you bank the expected face for that set, then the game restarts. What is that case worth? (Type the full expression, e.g. 5+E[X].)",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "highcase",
            "label": "Value of the {4, 5, 6} case",
            "accept": ["5+E[X]", "E[X]+5", "5+E", "E+5", "5 + E[X]", "E[X] + 5"],
            "placeholder": "? + E[X]"
          }
        ]
      },
      "feedback": {
        "correct": "Exactly — rolling {4,5,6} banks the expected face (5) and the game replays. That branch is worth 5 + E[X].",
        "hints": [
          "Rolling 4–6 banks 5 and restarts the game, so that case is worth 5 + E[X], not just 5.",
          "E[face | {4,5,6}] = (4+5+6)/3 = 5. But the game continues for another full turn.",
          "Write it: case value = 5 + E[X]."
        ]
      }
    },
    {
      "beatId": "ev4-isolate",
      "required": false,
      "track": "A",
      "prompt": "See how E[X] on both sides becomes a clean solve — read each step.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Isolating E[X]",
        "body": "Start: E = ½·2 + ½·(5+E). Expand: E = 1 + 5/2 + E/2. Subtract E/2 from both sides: E − E/2 = 7/2, so ½·E = 7/2. Multiply both sides by 2: E = 7.",
        "collapsible": true
      },
      "feedback": {
        "correct": "Collect E on one side — it falls out cleanly at 7.",
        "hints": [
          "Expand the right side: 1 + 5/2 + E/2.",
          "Subtract E/2 from both sides: E/2 = 7/2.",
          "Multiply by 2: E = 7."
        ]
      }
    },
    {
      "beatId": "ev4-prove",
      "required": true,
      "interviewNote": "E[X] on both sides → isolate and solve (treat E[X] as the unknown: ½·2 + ½·(5+E[X]) = E[X] → E[X] = 7); conditioning ≠ Bayes (here we average over cases, not update from evidence).",
      "prompt": "Mastery challenge: set up and solve the self-referential dice game equation. What is a single play worth?",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Roll a die. Get {1,2,3}: collect the face and stop. Get {4,5,6}: collect the face and roll again, adding to your total. Set up E[X] = ½·2 + ½·(5+E[X]) and solve.",
        "fields": [
          {
            "id": "ev",
            "label": "E[X] =",
            "accept": ["7"],
            "placeholder": "?",
            "suffix": "dollars"
          }
        ]
      },
      "feedback": {
        "correct": "E[X] = 7. Treat E[X] as the unknown: expand ½·2 + ½·(5+E[X]) = E[X] → 1 + 5/2 + E[X]/2 = E[X] → ½·E[X] = 7/2 → E[X] = 7.",
        "hints": [
          "E[X] on both sides isn't a dead end; treat it as the unknown and solve: ½·2 + ½·(5+E[X]) = 7.",
          "Expand: 1 + 5/2 + E[X]/2 = E[X]. Collect E[X] terms on one side.",
          "E[X] − E[X]/2 = 7/2 → ½·E[X] = 7/2 → E[X] = 7."
        ]
      }
    },
    {
      "beatId": "ev4-recap",
      "required": true,
      "prompt": "Tap to reveal the lesson's core moves.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "Split the game into cases → average within each → weight by P(case). When a case restarts, E[X] appears on both sides — solve for it. Belief-updating from evidence is Bayes, coming later.",
        "hints": [
          "Reveal the cards.",
          "Split → average within → weight by P(case).",
          "If the game loops, solve for E[X]."
        ]
      }
    }
  ]
}
```

**Wave 0 Dept 3 register tasks** (not in this fixture — separate scripts step):
- Add `"lesson-expected-value-1"` through `"lesson-expected-value-6"` to `GATED` array.
- Add same IDs to `MASTERY_LESSONS` array.
- These registrations gate the unlock chain and enable `computeMastered` for all six EV lessons.

---

## DoR gap closures

### Primer (`variant:'custom'`)

`ev4-model` (beat 5, `required:false`, `track:'both'`) is the concept primer. Body (verbatim requirement):

> "conditioning = average within cases, then weight by P(case); if a case restarts the game, E[X] appears on both sides → solve. PHT's E[HH]=6 was instance #1 (condition on first flip). Conditioning here means averaging — Bayes (belief-updating from evidence) is a different machine."

This beat also carries `comparison:true`, `introducesSymbol`, and `groundedBy` to satisfy the notation-ladder rule (symbol `E[X]=Σ E[X|case]P(case)` must not appear before `ev4-win` and `ev4-explore` in any track's visible subsequence).

### Track-A scaffold

`ev4-isolate` (beat 7, `required:false`, `track:'A'`) is a collapsible `primer` {`variant:'custom'`} that walks through the three algebra steps for isolating E[X] from the self-referential equation. Fires only on Track A between `ev4-firststep` and `ev4-prove`, de-risking the mastery challenge for learners who need the intermediate step shown.

### `interviewNote`

Located on `ev4-prove` (beat 8):

> "E[X] on both sides → isolate and solve (treat E[X] as the unknown: ½·2 + ½·(5+E[X]) = E[X] → E[X] = 7); conditioning ≠ Bayes (here we average over cases, not update from evidence)."

Covers both required topics: the fixed-point solve technique and the Bayes distinction.

---

## Definition-of-Ready checklist

Every beat:

- [x] **Verified + sourced problem** — all answers in beat table trace to GB p.47–48 (total expectation, law statement, dice game `E[X]=7`, coin-die `7/4`); PHT retrieval traces to shipped `lesson-pattern-hitting-times`. No `⚠️ NEEDS-WEB-SOURCE` rows.
- [x] **Concrete interactive mechanic** — every beat has direct manipulation: tap-to-match (`ev4-recall`), option chip tap (`ev4-bet`), free-entry field (`ev4-win`, `ev4-firststep`, `ev4-prove`), tap-to-expand tree (`ev4-explore`), align-and-articulate tap (`ev4-model`), collapsible card tap (`ev4-isolate`, `ev4-recap`).
- [x] **Instant feedback + 3-level hints** — every graded beat has `feedback.correct` + `hints:[3]`; `ev4-bet` has `byOption` with `correct:true` marked; ungraded beats have `correct` + `hints:[3]` for reveal.
- [x] **a11y (44px, reduced-motion, aria-live)** — all tap targets ≥44px; `ev4-explore` has `aria-live="polite"` per branch + `aria-live="assertive"` for solve; `reducedMotionFinalFrame:true` on hero; keyboard-primary for all beats (Tab/Enter/Space/arrows per beat type).

Lesson-level gates:

- [x] `ev4-recall` = `retrievalGrid` first graded beat ✓
- [x] `ev4-prove` = `masteryChallenge` `required:true` penultimate ✓
- [x] `ev4-recap` = `recap {}` last beat ✓
- [x] ≥1 `primer` {`variant:'custom'`} — `ev4-model` + `ev4-isolate` ✓
- [x] ≥1 Track-A beat — `ev4-isolate` (`track:'A'`, `required:false`) ✓
- [x] ≥1 `interviewNote` — `ev4-prove` ✓
- [x] Every `prediction` beat uses `byOption` feedback — `ev4-bet` ✓
- [x] `beat.pattern` UNSET everywhere — no `pattern` field in any beat ✓ (`ev4-prove` answer `E[X]=7` is a total-expectation fixed point, NOT an H/T recurrence; unset keeps it off `buildAutomaton` cross-check)
- [x] `conditionalTree` is UNGRADED in L4 — `accept` omitted from `ev4-explore` interaction; beat NOT in `GRADED_TYPES` ✓
- [x] Notation ladder — `ev4-model` `introducesSymbol:"E[X]=Σ E[X|case]P(case)"` comes after `ev4-win` + `ev4-explore` in beat order ✓
- [x] `computeMastered` keys on `{ev4-recall, ev4-win, ev4-firststep, ev4-prove}` (all `required:true` graded) ✓
- [x] Wave 0 engine goldens: `totalExpectation` → coin-die `{n:7,d:4}`, dice game `{n:7,d:1}` ✓

---

## Dept 1 ↔ Dept 2 readiness check

| beat | source present | mechanic clear | feedback copy ready | a11y covered | status |
|------|---------------|---------------|-------------------|-------------|--------|
| `ev4-recall` | ✓ GB p.47–48 + PHT shipped | ✓ tap-to-match | ✓ verbatim brief | ✓ 44px + aria-live | READY |
| `ev4-bet` | ✓ GB p.48 | ✓ option chip tap | ✓ verbatim brief (all 4 options) | ✓ 44px + aria-live | READY |
| `ev4-win` | ✓ GB p.47 + p.62 | ✓ free-entry field | ✓ verbatim brief | ✓ 44px + aria-live | READY |
| `ev4-explore` | ✓ GB p.48 (dice game) | ✓ tap-to-expand tree; loop-back arc; auto-solve | ✓ reveal copy ready | ✓ aria-live (polite + assertive) + reduced-motion final frame + hero | READY |
| `ev4-model` | ✓ GB p.47 (law statement) | ✓ align-and-articulate tap | ✓ primer body + correct reveal | ✓ collapsible + keyboard | READY |
| `ev4-firststep` | ✓ GB p.48 | ✓ free-entry short field | ✓ verbatim brief | ✓ 44px + aria-live | **KICKBACK (minor):** accept list covers `["5+E[X]","E[X]+5","5+E","E+5",…]` — Dept 1 to confirm this set is exhaustive for common student inputs, or scope field to a numeric-only subpart (e.g. "Bank amount before replay" → accept `["5"]`) and revise prompt accordingly. |
| `ev4-isolate` | ✓ derived from GB p.48 (same equation) | ✓ stepped card | ✓ correct reveal | ✓ collapsible + keyboard | READY |
| `ev4-prove` | ✓ GB p.48 (exact quote) | ✓ free-entry field | ✓ verbatim brief + full solve trace | ✓ 44px + aria-live | READY |
| `ev4-recap` | ✓ derived from GB p.47–48 | ✓ card reveal | ✓ forward-flag Bayes | ✓ keyboard-navigable | READY |

**VERDICT: READY** — 1 minor kickback to Dept 1 on `ev4-firststep` accept-list scope (symbolic vs numeric). All hard gates pass. `conditionalTree` schema + renderer + engine goldens frozen and ready for Wave 0 build.
