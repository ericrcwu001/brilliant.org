# Interaction Spec: What is Expected Value?  (lesson-expected-value-1)

---

## Beat Table

> Column order: `# | beatId | mechanic (manipulate → respond → loop) + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track`
>
> Hard-gate reminders in column headers: **ev1-recall = first graded beat (retrievalGrid); ev1-prove = masteryChallenge required penultimate; ev1-recap = recap last; pattern UNSET on every beat.**

| # | beatId | mechanic (manipulate → respond → loop) + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|-------------------------------------------------|-----------------|--------------|--------------------------|------|------------------------|-------|
| 1 | `ev1-recall` | Learner taps a left-column phrase, then its matching right-column value; widget locks the pair on match; submit button appears when both pairs matched; success reveals "You already computed an expected value — you just didn't name it." | `retrievalGrid` | reuse | **correct:** "Exactly — E[H] = 2 was an expected value all along. Now we name the move." · **hints:** [1] "Tap a phrase, then its matching value." [2] "The geometric wait is 1/p; p = 1/2, so E = 2." [3] "Match: 'Average flips until first H' → E[H] = 2; 'P(H) on any flip' → 1/2." | Tap targets ≥44 px; keyboard: Tab focus, Space select; `aria-live="polite"` announces each successful pair-lock and final success; screen-reader label on each cell | Static layout; --ergo-surface-2 cells; matched pair highlight --ch4 with --ring-focus; no motion required | both |
| 2 | `ev1-bet` | Learner taps one of three cards (Good / Bad / Fair); per-option refutation note appears immediately below the tapped card; ungraded — advance on any tap; loop: tapping a different card swaps the note | `prediction` | reuse | **byOption (HARD GATE — no alternative):** `"A good deal"` → {note: "Good instinct — let's prove it: compute the average payoff and check it beats the $3 ticket.", correct: true} · `"A bad deal"` → {note: "Let's test it — if the average payoff tops $3, the ticket's a bargain. Let's compute it.", correct: false} · `"Exactly fair"` → {note: "Let's test it — '$3 is the middle of 1–6' skips the weighting; the balance point sits a half-dollar higher.", correct: false} | Cards ≥44 px; keyboard: Tab + Enter; `aria-live="polite"` on note region; no drag | Cards --ergo-surface-2 border --r-md; selected state --ch4 ring; note text --ergo-ink-2 Inter; no motion | both |
| 3 | `ev1-primer` | Collapsible card; default expanded; learner reads, taps "Continue" or collapses; not graded; advance immediately | `primer` (variant: `average`) | reuse | **correct:** "A weighted average: each value scaled by its probability. That is all E[X] is." · **hints:** [1] "Read the card." [2] "Weight = probability = how often that value occurs." [3] "Continue when ready." | Collapse toggle ≥44 px; keyboard Enter; `aria-expanded` on toggle; not announced as interactive checkpoint | Card --ergo-surface radius --r-md; title Space Grotesk medium; body Inter; --shadow-sm; collapsible chevron --ergo-ink-3 | both |
| 4 | `ev1-win` | Learner types the expected payoff of one fair-die roll in a fraction field; submit; 3-level hint ladder unlocks on wrong; **guaranteed early win** | `answerEntry` | reuse | **correct:** "E = (1+2+3+4+5+6)/6 = 21/6 = 7/2 = $3.50 — a half-dollar above the $3 ticket. The ticket is a steal." · **hints:** [1] "The average needn't be rollable. Sum 1+…+6 = 21, divide by 6 → 3.5." [2] "Each face shows with probability 1/6. E = 1·(1/6)+2·(1/6)+⋯+6·(1/6) = (1+2+3+4+5+6)/6." [3] "21/6 = 7/2. Type 7/2." | Input ≥44 px touch height; --ring-focus on focus; `aria-invalid` on wrong; `aria-live` announces hint level + correct; keyboard-native (no drag) | Input JetBrains Mono tabular-nums; --ergo-surface-2 border; suffix "$" --ergo-ink-2; --ok tint on correct; --bad tint on wrong | both |
| 5 | `ev1-explore` | **"wow" / hero beat.** Learner taps each face value (1–6) to place its 1/6 probability weight on the beam; the fulcrum slides continuously toward the running E[X] after every tap; when all 6 weights are placed the beam locks and shows "E[X] = 7/2"; **the cinematic moment**: the fulcrum visibly slides from the initial label-midpoint toward 3.5 as weights accumulate, making EV a physical balance point; drag additive (secondary — increments weight on drag) | `expectationScale` | **NEW** | **Ungraded — no accept field; advance on all weights placed.** · **correct:** "The die balances at E[X] = 7/2. That is the fair price — not 3 (the visual midpoint of 1–6 on the beam), but the probability-weighted balance point." · **hints:** [1] "Tap each number to place its weight (1/6 for a fair die)." [2] "Each of the six faces is equally likely: P(x) = 1/6." [3] "Place all six weights and watch the beam settle." | Outcome circles ≥44 px diameter; keyboard: Tab between outcomes, Space to assign weight, +/- keys to increment/decrement; `aria-live="polite"` announces running E[X] fraction after each weight assignment (e.g. "E[X] = 1/6, fulcrum at 1.0"); reduced-motion: skip animation, render final balanced state immediately; drag additive only (secondary input) | DOM/SVG (NOT Konva); beam SVG axis on --ergo-bg; outcome circles --ergo-surface-2; weight chips --ch4-tint; fulcrum pin triangle --ch4; running fraction JetBrains Mono tabular-nums; fulcrum CSS `transition: transform var(--dur-slow) var(--ease-out)` compositor-only; `hero: {slowFirst:true, structuralReadout:"E[X] = 7/2 — the fair die's balance point.", reducedMotionFinalFrame:true}`; ONE cinematic moment per screen; no confetti | both |
| 6 | `ev1-model` | Learner reads the formalized definition card; taps a "continuous analogue" disclosure to reveal the √(2/π) aside; comparison tap aligns the discrete formula against the continuous integral; introduces `E[X]=Σx·P(x)` | `primer` (variant: `custom`) | reuse | **correct:** "E[X] = Σ x·P(x) — list every outcome, weight each by its probability, add. The balance point of the distribution, not the midpoint of its labels." · **hints:** [1] "Read the formula card." [2] "The balance point of the distribution, not the midpoint of the label range." [3] "Tap the 'continuous analogue' toggle to see why EV can be irrational." | Read-only card; disclosure toggle ≥44 px; `aria-expanded` on toggle; reduced-motion: no CSS transition | Card --ergo-surface radius --r-lg --shadow-sm; formula JetBrains Mono size up-1; body Inter; disclosure chevron --ch4; `--s4` between formula and body | both |
| 7 | `ev1-deepen` | **Track A only.** Learner watches a simulation chart: many die rolls stream in, and the running average converges toward 3.5; a horizontal theory line shows E[X]=3.5; learner taps "I see it" to advance; optional interaction: slider controls trial count | `theorySimChart` | reuse | **correct:** "The empirical mean converges to E[X] = 3.5 — the balance point is the long-run average. This is the Law of Large Numbers in action." · **hints:** [1] "Watch the running average (jagged line) drift toward the theory line at 3.5." [2] "Run more trials — the convergence tightens." [3] "The long-run frequency matches the theoretical expected value." | Track-A only; "I see it" tap ≥44 px; slider if present ≥44 px; reduced-motion: static chart at final convergence state | Chart --ergo-surface; theory line --ch4 dashed; empirical scatter/line --ch4-tint; axis labels Inter tabular-nums; `--s2` tick spacing | A |
| 8 | `ev1-pmf` | Two-field answerEntry: (1) learner counts ordered pairs that sum to 5, enters P(sum=5); (2) learner computes E for a shown 3-outcome pmf; submit; 3-level hints cover both fields; **interleave check — unlabeled count → weight** | `answerEntry` | reuse | **correct:** "P(sum=5)=4/36=1/9 — four ordered pairs (1+4, 2+3, 3+2, 4+1). E[payout]=3·(1/4)+5·(1/2)+7·(1/4)=5. The 11 two-dice sums are NOT equally likely — the counts differ." · **hints:** [1] "The eleven sums aren't equally likely. Count the ways each sum happens, then weight by those counts." [2] "For sum=5: (1,4),(2,3),(3,2),(4,1) — that is 4 ordered pairs out of 36. For field 2: multiply each payout by its probability and add." [3] "P(sum=5)=4/36=1/9. E=3·(1/4)+5·(1/2)+7·(1/4)=3/4+10/4+7/4=20/4=5." | Both inputs ≥44 px; `aria-live` per field; keyboard-native; `aria-invalid` on wrong; `aria-describedby` links each input to its label | Two stacked inputs --s4 gap; same style as ev1-win; field-2 suffix "$" | both |
| 9 | `ev1-prove` | **Mastery challenge. required:true. pattern UNSET (CRITICAL).** Learner reads 11-outcome triangular pmf table (displayed in scenario card), enters E[X] = Σ x·P(x); 3-level hint ladder; no advance until correct; verified by `expectation.ts`, NOT `buildAutomaton` | `masteryChallenge` | reuse | **correct:** "E=252/36=7. Triangular weights peak at 7 and pull the balance point there. The midpoint of 2–12 is also 7 — a coincidence of symmetry (the pmf is symmetric around 7). An asymmetric pmf won't be so tidy." · **hints:** [1] "Eyeballing the middle gives 6, but the weights peak at 7. Sum x·P(x) over the triangular pmf." [2] "Group by symmetry: P(k)=P(14−k). Pairs (2,12),(3,11),(4,10),(5,9),(6,8) each contribute equally. P(7)=6/36 alone." [3] "Σ x·P(x)=(2·1+3·2+4·3+5·4+6·5+7·6+8·5+9·4+10·3+11·2+12·1)/36=252/36=7." | Input ≥44 px; scenario card reads above fields; `aria-live` on hint/correct; same input style as ev1-win | Scenario card --ergo-surface-2 radius --r-md --s3 padding; pmf table Inter tabular-nums; same input/feedback colors | both |
| 10 | `ev1-recap` | Reveal-cards recap; learner taps each card to flip/reveal; final card has variance teaser; advance | `recap` | reuse | **correct:** "List → weight → add: E[X]=Σ x·P(x). The balance point of the distribution, not the midpoint of its labels. Next: how expectations add — even when things are tangled." · **hints:** [1] "Read each recap card." [2] "The three-step move (list → weight → add) runs every expected-value question." [3] "Tap to continue." | Flip targets ≥44 px; keyboard Enter; `aria-live` on card reveal | Cards --ergo-surface radius --r-md; accent stripe --ch4; forward teaser italic --ergo-ink-2; --shadow-sm | both |

---

## New Interaction Types (for Wave 0)

### `expectationScale` — Weighted-Average Balance Beam

**Frozen Zod schema (verbatim — do not diverge):**

```ts
// expectationScale — a weighted-average BALANCE BEAM. Each outcome sits at its
// value x along the beam; the learner places probability weight P(x) on each;
// the fulcrum slides to E[X]=Σ x·P(x) — EV as the physical balance point.
// DOM/SVG; tap-to-assign weight (tap an outcome, tap +/- weight) OR drag (drag additive).
z.object({
  type: z.literal('expectationScale'),
  outcomes: z.array(z.object({
    x: z.number(),                                                       // position on the beam (outcome value)
    label: z.string().optional(),
    weight: z.object({ n: z.number().int(), d: z.number().int().positive() }).optional(), // preset P(x) Rational; omit → learner assigns
  })),
  accept: z.array(z.string()).optional(),                               // optional graded read-off of E[X] (UNGRADED in L1 — omit)
})
```

**Schema placement:** Add to `InteractionSchema` discriminated union in `src/content/schema.ts`.

**DO NOT add to `GRADED_TYPES`** — `expectationScale` is ungraded in L1 (`accept` omitted in fixture). Add to:
1. `InteractionSchema` union (schema.ts)
2. BeatView dispatcher (`src/lesson/beats/index.tsx` → `case 'expectationScale': return <ExpectationScaleBeat .../>`)
3. New renderer: `src/lesson/beats/ExpectationScaleBeat.tsx`

**Engine dependency:** `src/engine/expectation.ts` → `expectedValue(pmf:{x:Rational;p:Rational}[]):Rational`. The renderer calls this after each weight assignment to recompute the live fulcrum position.

**Note on Konva theme:** `expectationScale` is DOM/SVG, not Konva canvas. It reads `--ch4` directly from CSS. No Konva theme mirror needed for ch4.

---

## Build Decomposition (for Dept 3)

### 1. Engine: `src/engine/expectation.ts`

Pure, exact-rational, no floats. Reuses `Rational = {n:number, d:number}` from `src/engine/types.ts` and `reduce / toRational / ratAdd / ratMul` from `src/engine/automaton.ts`.

**L1-scope functions and goldens:**

```ts
import type { Rational } from './types'
import { ratAdd, ratMul, reduce } from './automaton'

// Core Σ x·P(x) — accumulate with exact-rational arithmetic.
export function expectedValue(pmf: { x: Rational; p: Rational }[]): Rational {
  return reduce(
    pmf.reduce<Rational>(
      (acc, { x, p }) => ratAdd(acc, ratMul(x, p)),
      { n: 0, d: 1 }
    )
  )
}
```

**Wave-0 goldens (L1 scope; hand-verified against GB p.44, p.62):**

| call | pmf | result | decimal check |
|------|-----|--------|---------------|
| `expectedValue(fairDie)` | [{x:1,p:1/6},{x:2,p:1/6},…,{x:6,p:1/6}] | `{n:7,d:2}` | 3.5 ✓ |
| `expectedValue(twoDiceSum)` | [{x:2,p:1/36},{x:3,p:2/36},…,{x:7,p:6/36},…,{x:12,p:1/36}] | `{n:7,d:1}` | 7 ✓ |
| `expectedValue(threeOutcome)` | [{x:3,p:1/4},{x:5,p:1/2},{x:7,p:1/4}] | `{n:5,d:1}` | 5 ✓ (ev1-pmf field 2) |

> The `P(sum=5)=4/36=1/9` answer in ev1-pmf is verified by counting (not by `expectedValue`); the engine cross-check in Stage-2 validate-fixtures checks that `accept[0]` for ev1-win and ev1-prove match `expectedValue` output reduced to lowest terms.

Full `expectation.ts` with all 8 functions (L1–L6 scope) is shared; only `expectedValue` fires in L1. The additional functions (`totalExpectation`, `indicatorExpectation`, `harmonic`, `couponCollector`, `distinctAfterDraws`, `orderStatUniform`, `noodleLoops`) are authored in Wave 0 but unused until L2–L6.

### 2. Schema Variant

Add to `InteractionSchema` in `src/content/schema.ts` (the frozen Zod above). No other schema changes needed for L1. The `primer` variant `average` and `theorySimChart` types already exist in the union.

### 3. Renderer: `src/lesson/beats/ExpectationScaleBeat.tsx`

**Props interface:**

```ts
interface ExpectationScaleBeatProps {
  outcomes: { x: number; label?: string; weight?: { n: number; d: number } }[]
  accept?: string[]           // undefined in L1 (ungraded)
  hero?: { slowFirst: boolean; structuralReadout: string; reducedMotionFinalFrame: true }
  onComplete: () => void
  reducedMotion: boolean      // from prefers-reduced-motion media query
}
```

**Behavior spec:**

- **DOM/SVG** (not Konva). CSS custom property `--ch4` read directly.
- **Beam layout:** horizontal `<svg>` axis; outcome circles positioned at `x / x_max * beamWidth` (scaled); circles are `r=22px` (≥44px diameter tap target).
- **Weight assignment:**
  - Primary: tap an outcome circle to increment its weight by 1/d (where d is the total number of outcomes for uniform case; renderer infers denominator from outcome count unless overridden by preset `weight`)
  - Secondary: drag adds additional weight incrementally
  - Keyboard: `Tab` focuses outcome circles, `Space` to assign, `ArrowUp`/`ArrowDown` or `+`/`-` to adjust
- **Fulcrum:** SVG `<polygon>` triangle below the beam axis; x-position updated on each weight change via `transform: translateX(...)` (compositor-only); CSS `transition: transform var(--dur-slow) var(--ease-out)` (skipped if `reducedMotion`)
- **Live readout:** `<div aria-live="polite" aria-atomic="true">` updates on each weight change: e.g. `"E[X] = 7/6 — fulcrum at 1.17"` (fraction rendered via JetBrains Mono `tabular-nums`)
- **Advance condition:** all outcomes have weight assigned AND weights sum to 1 (verified via `reduce(Σp)`); calls `onComplete`
- **Reduced-motion path:** if `reducedMotion || !hero.slowFirst`, skip CSS transition; render final balanced frame immediately (beam tilted to equilibrium, fulcrum at correct x, readout shows `E[X] = 7/2`)
- **Hero slow-first path:** first weight placement: `var(--dur-slow)` transition and a brief pause (`var(--dur-tell)`) before the learner can place the second weight — draws attention to the fulcrum sliding

### 4. `scripts/validate-fixtures.ts` Stage-2 Extension

```
// New Stage-2 checks for expected-value lessons:
// 1. Register lesson-expected-value-1..6 in GATED + MASTERY_LESSONS sets.
// 2. Assert ev1-recall is type 'retrievalGrid' AND the first required beat.
// 3. Assert ev1-prove is type 'masteryChallenge' AND required:true AND has no 'pattern' field.
// 4. Assert ev1-recap is type 'recap' AND the last beat.
// 5. Assert every 'prediction' beat uses 'byOption' feedback (not 'correct'/'byPattern').
// 6. Assert ≥1 primer beat, ≥1 Track-A beat (track:'A', required:false), ≥1 interviewNote.
// 7. Stage-2 expectation cross-check: for answerEntry/masteryChallenge beats in GATED lessons,
//    reduce accept[0] and assert it equals expectedValue(pmf) from expectation.ts,
//    where pmf is supplied via a '_enginePmf' annotation on the beat (Dept-3 adds this
//    annotation to ev1-win, ev1-pmf field-2, and ev1-prove for the cross-check).
```

### 5. Fixture JSON — `fixtures/lesson-expected-value-1.json`

Full fixture targeting the `LessonSchema` shape (mirrors `lesson-overlap-shortcut.json`):

```json
{
  "lessonId": "lesson-expected-value-1",
  "courseId": "course-expected-value",
  "title": "What is Expected Value?",
  "patternOptions": ["H"],
  "milestoneId": "ev-fundamentals",
  "unlocks": "lesson-expected-value-2",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "ev1-recall",
      "required": true,
      "prompt": "Back in Watch the First Heads you found that a fair coin takes 2 flips on average until the first Heads. Match each statement to its value.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "Average flips until first Heads", "right": "E[H] = 2" },
          { "left": "P(H) on any single flip", "right": "1/2" }
        ]
      },
      "feedback": {
        "correct": "Exactly — E[H] = 2 was an expected value all along. Now we name the move.",
        "hints": [
          "Tap a phrase, then its matching value.",
          "The geometric wait is 1/p; with p = 1/2 that gives E = 2.",
          "Match: 'Average flips until first H' → E[H] = 2; 'P(H) on any flip' → 1/2."
        ]
      }
    },
    {
      "beatId": "ev1-bet",
      "required": false,
      "prompt": "A casino offers you one roll of a fair die, paid that many dollars. A ticket costs $3. Before computing: is a $3 ticket a good deal, a bad deal, or exactly fair?",
      "interaction": {
        "type": "prediction",
        "options": ["A good deal", "A bad deal", "Exactly fair"]
      },
      "feedback": {
        "byOption": {
          "A good deal": {
            "note": "Good instinct — let's prove it: compute the average payoff and check it beats the $3 ticket.",
            "correct": true
          },
          "A bad deal": {
            "note": "Let's test it — if the average payoff tops $3, the ticket's a bargain. Let's compute it.",
            "correct": false
          },
          "Exactly fair": {
            "note": "Let's test it — '$3 is the middle of 1–6' skips the weighting; the balance point sits a half-dollar higher.",
            "correct": false
          }
        }
      }
    },
    {
      "beatId": "ev1-primer",
      "required": false,
      "prompt": "Quick reminder before we calculate — read the card, then continue.",
      "interaction": {
        "type": "primer",
        "variant": "average",
        "title": "Weighted averages",
        "body": "A plain average treats every value equally — that is a special case where each weight is 1/n. A weighted average scales each value by how likely it is: multiply each value by its weight, then sum. When the weights are probabilities, you get the expected value.",
        "collapsible": true
      },
      "feedback": {
        "correct": "Weighted average: each value scaled by its probability.",
        "hints": [
          "Read the card.",
          "Weight = probability = how often that value occurs.",
          "Continue when ready."
        ]
      }
    },
    {
      "beatId": "ev1-win",
      "required": true,
      "prompt": "One roll of a fair die — you are paid the face value. What is the expected payoff? Enter as a fraction (e.g. 3/2).",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "ev",
            "label": "Expected payoff",
            "accept": ["7/2", "21/6"],
            "placeholder": "?/?",
            "suffix": "$"
          }
        ]
      },
      "feedback": {
        "correct": "E = (1+2+3+4+5+6)/6 = 21/6 = 7/2 = $3.50 — a half-dollar above the $3 ticket. The ticket is a steal.",
        "hints": [
          "The average needn't be rollable. Sum 1+…+6 = 21, divide by 6 → 3.5.",
          "Each face shows with probability 1/6. E = 1·(1/6)+2·(1/6)+⋯+6·(1/6) = (1+2+3+4+5+6)/6.",
          "21/6 = 7/2. Type 7/2."
        ]
      }
    },
    {
      "beatId": "ev1-explore",
      "required": false,
      "prompt": "Tap each face value to place its probability weight on the beam. Watch the fulcrum slide to the balance point.",
      "interaction": {
        "type": "expectationScale",
        "outcomes": [
          { "x": 1, "label": "1" },
          { "x": 2, "label": "2" },
          { "x": 3, "label": "3" },
          { "x": 4, "label": "4" },
          { "x": 5, "label": "5" },
          { "x": 6, "label": "6" }
        ]
      },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "E[X] = 7/2 — the fair die's balance point.",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "The die balances at E[X] = 7/2 — that is the fair price, not the visual midpoint of the labels.",
        "hints": [
          "Tap each number to place its weight (1/6 for a fair die).",
          "Each of the six faces is equally likely: P(x) = 1/6.",
          "Place all six weights and watch the beam settle."
        ]
      }
    },
    {
      "beatId": "ev1-model",
      "required": false,
      "introducesSymbol": "E[X]=Σx·P(x)",
      "groundedBy": ["ev1-win", "ev1-explore"],
      "comparison": true,
      "interviewNote": "Interview framing: E[X|X>0] = √(2/π) ≈ 0.798 for X∼N(0,1) shows EV can be irrational; the clean rationals here (7/2, 7) are a feature of these toy distributions, not a general rule. The 'fair price' of any bet equals its expected value — casinos profit on the delta between the ticket price and E[X].",
      "prompt": "You just saw it on the beam. Now name it.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "E[X] = Σ x · P(x)",
        "body": "The expected value of a discrete random variable X is the probability-weighted sum of all its outcomes — list each possible value x, multiply by its probability P(x), and add.\n\nFor a continuous variable (e.g. X∼N(0,1) truncated to X > 0), the sum becomes an integral: E[X] = ∫ x f(x) dx. For that distribution, E[X|X>0] = √(2/π) ≈ 0.798 — irrational. The clean fractions 7/2 and 7 in this lesson are a feature of these particular toy distributions, not a general rule.",
        "collapsible": false
      },
      "feedback": {
        "correct": "E[X] = Σ x·P(x) — the balance point of the distribution, not the midpoint of its labels.",
        "hints": [
          "Read the formula card.",
          "The balance point of the distribution, not the midpoint of the label range.",
          "Tap the continuous-analogue disclosure to see why EV can be irrational."
        ]
      }
    },
    {
      "beatId": "ev1-deepen",
      "required": false,
      "track": "A",
      "prompt": "Watch many die rolls. Does the running average settle where the balance beam predicted?",
      "interaction": { "type": "theorySimChart" },
      "feedback": {
        "correct": "The empirical mean converges to E[X] = 3.5 — the balance point is the long-run average. This is the Law of Large Numbers.",
        "hints": [
          "Watch the running mean (jagged line) drift toward the theory line at 3.5.",
          "Run more trials — the convergence tightens.",
          "Long-run frequency = theoretical expected value."
        ]
      }
    },
    {
      "beatId": "ev1-pmf",
      "required": true,
      "prompt": "Roll two fair dice. (1) How many ordered pairs (d₁, d₂) sum to 5? Express as P(sum = 5). (2) A separate game pays $3 with probability 1/4, $5 with probability 1/2, $7 with probability 1/4. What is E[payout]?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "prob5",
            "label": "P(sum = 5)",
            "accept": ["1/9", "4/36"],
            "placeholder": "?/?"
          },
          {
            "id": "ev-short",
            "label": "E[payout] — 3-outcome game",
            "accept": ["5"],
            "placeholder": "?",
            "suffix": "$"
          }
        ]
      },
      "feedback": {
        "correct": "P(sum=5)=4/36=1/9 — four ordered pairs (1+4, 2+3, 3+2, 4+1). E[payout]=3·(1/4)+5·(1/2)+7·(1/4)=20/4=5. The 11 two-dice sums are NOT equally likely — their counts differ.",
        "hints": [
          "The eleven sums aren't equally likely. Count the ways each sum happens, then weight by those counts.",
          "For sum=5: (1,4),(2,3),(3,2),(4,1) — that is 4 ordered pairs out of 36. For E: multiply each payout by its probability and add.",
          "P(sum=5)=4/36=1/9. E=3·(1/4)+5·(1/2)+7·(1/4)=3/4+10/4+7/4=20/4=5."
        ]
      }
    },
    {
      "beatId": "ev1-prove",
      "required": true,
      "interviewNote": "Shortcut check: by linearity of expectation (next lesson), E[sum of two dice] = E[die₁]+E[die₂] = 7/2+7/2 = 7. The triangular-pmf Σ x·P(x) certifies the same answer the hard way — these two routes agreeing is the sanity check.",
      "prompt": "Mastery challenge — the sum of two fair dice, the hard way. The table shows all 11 outcomes (sums 2 through 12) with their triangular weights (1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1)/36. Compute E[X] = Σ x·P(x). Enter a whole number or simplified fraction.",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Two fair dice — sum the full non-uniform pmf. Weights peak at P(7)=6/36. The midpoint of 2–12 is 7 by symmetry. Is E[X] always the midpoint? Compute to find out.",
        "fields": [
          {
            "id": "ev-two-dice",
            "label": "E[sum of two dice]",
            "accept": ["7", "252/36"],
            "placeholder": "?"
          }
        ]
      },
      "feedback": {
        "correct": "E=252/36=7. Triangular weights peak at 7 and pull the balance point there. The midpoint of 2–12 is also 7 — a coincidence of symmetry (the pmf is symmetric around 7). An asymmetric pmf won't be so tidy.",
        "hints": [
          "Eyeballing the middle gives 6, but the weights peak at 7. Sum x·P(x) over the triangular pmf.",
          "Group by symmetry: P(k)=P(14−k). Pairs (2,12),(3,11),(4,10),(5,9),(6,8) each contribute k·P(k)+(14−k)·P(k)=14·P(k). P(7)=6/36 contributes alone.",
          "Σ x·P(x)=(2·1+3·2+4·3+5·4+6·5+7·6+8·5+9·4+10·3+11·2+12·1)/36=252/36=7."
        ]
      }
    },
    {
      "beatId": "ev1-recap",
      "required": true,
      "prompt": "The move that ran through this whole lesson.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "List → weight → add: E[X]=Σ x·P(x). The balance point of the distribution, not the midpoint of its labels. Next: how expectations add — even when things are tangled.",
        "hints": [
          "Read each recap card.",
          "The three-step move (list → weight → add) runs every expected-value question.",
          "Tap to continue."
        ]
      }
    }
  ]
}
```

---

## DoR Gap Closures

### Gap 1 — Primer variant `average`

**What:** The existing `primer` enum value `'average'` in `src/content/schema.ts` covers this. No schema change needed.

**Placement:** Beat 3 (`ev1-primer`), inserted between `ev1-bet` and `ev1-win` — JIT pre-teach so the learner has the "weighted average" frame before they compute their first Σ x·P(x).

**Body authored by Dept 2** (since `variant:'average'` is a named slot whose display text is Dept-2's responsibility):
> "A plain average treats every value equally — that is a special case where each weight is 1/n. A weighted average scales each value by how likely it is: multiply each value by its weight, then sum. When the weights are probabilities, you get the expected value."

**Hard gate satisfied:** ≥1 `primer` ✓

---

### Gap 2 — Track-A scaffold

**What:** Beat 7 (`ev1-deepen`) — `theorySimChart`, `track:'A'`, `required:false`.

**Rationale:** Track-A learners get a Law-of-Large-Numbers demonstration connecting the balance-beam physical intuition to the frequentist long-run average, before formalizing with ev1-pmf. Track-B learners skip directly from ev1-model to ev1-pmf without loss.

**Schema:** `theorySimChart` already exists in `InteractionSchema`. No schema change.

**Hard gate satisfied:** ≥1 Track-A beat with `required:false` ✓. Since it is track-exclusive, `required:false` is mandatory per `BeatSchema` note.

---

### Gap 3 — Interview notes

**Beat `ev1-model` interviewNote:**
> "Interview framing: E[X|X>0]=√(2/π)≈0.798 for X∼N(0,1) shows EV can be irrational; the clean rationals here (7/2, 7) are a feature of these toy distributions, not a general rule. The 'fair price' of any bet equals its expected value — casinos profit on the delta between the ticket price and E[X]."

**Beat `ev1-prove` interviewNote:**
> "Shortcut check: by linearity of expectation (next lesson), E[sum of two dice]=E[die₁]+E[die₂]=7/2+7/2=7. The triangular-pmf Σ x·P(x) certifies the same answer the hard way — these two routes agreeing is the sanity check."

**Hard gate satisfied:** ≥2 interviewNotes (≥1 required) ✓

---

## Definition-of-Ready Checklist (per beat)

| beatId | ☐ verified+sourced problem | ☐ concrete interactive mechanic | ☐ instant feedback + 3-level hints | ☐ a11y (44px, reduced-motion, aria-live) |
|--------|---------------------------|-------------------------------|-------------------------------------|-------------------------------------------|
| ev1-recall | ✅ PHT E[H]=2; GB p.44; shipped lesson-first-heads | ✅ retrievalGrid tap-match | ✅ correct + 3 hints | ✅ 44px cells; aria-live pair-lock; no motion |
| ev1-bet | ✅ $3 ticket vs fair die; GB p.62 (EV=3.50) | ✅ prediction 3-option tap; byOption refutations verbatim | ✅ byOption (3 notes) — ungraded; no hint ladder needed | ✅ 44px cards; aria-live note reveal |
| ev1-primer | ✅ Definition of weighted average (not graded; JIT pre-teach) | ✅ tap-to-expand collapsible card | ✅ advance on read; 3 passive hints | ✅ 44px toggle; aria-expanded |
| ev1-win | ✅ Fair die E=21/6=7/2; GB p.62 ☑ engine ☑ | ✅ answerEntry fraction field; submit | ✅ correct + 3 hints (hint[0] verbatim from brief) | ✅ 44px input; aria-invalid; aria-live; ring-focus |
| ev1-explore | ✅ Fair die balance beam = ev1-win visual reinforce (not separately graded) | ✅ expectationScale tap-assign; fulcrum SVG animation | ✅ correct + 3 hints; advance on all weights placed | ✅ 44px outcome circles; aria-live running E[X]; reduced-motion final frame; drag additive only |
| ev1-model | ✅ E[X]=Σx·P(x) definition GB p.44 ☑; continuous aside GB p.21 ☑ (mention only, never graded) | ✅ primer card + disclosure toggle (comparison:true) | ✅ correct + 3 hints | ✅ 44px toggle; aria-expanded; reduced-motion: no CSS transition |
| ev1-deepen | ✅ Law of Large Numbers (conceptual; no graded number) | ✅ theorySimChart + "I see it" advance tap | ✅ correct + 3 hints | ✅ 44px advance tap; reduced-motion: static final chart |
| ev1-pmf | ✅ P(sum=5)=4/36=1/9 counting + GB p.44 ☑ engine ☑; short E={3,5,7} pmf E=5 (Dept-2 design, GB p.44 definition ✓) | ✅ answerEntry 2 fields; submit | ✅ correct + 3 hints (hint[0] verbatim from brief) | ✅ 44px inputs; aria-live per field; aria-invalid |
| ev1-prove | ✅ Two-dice E=252/36=7; GB p.62+p.47 ☑ engine ☑; pattern UNSET ✓ | ✅ masteryChallenge 1 field; required; scenario table | ✅ correct + 3 hints (hint[0] verbatim from brief) | ✅ 44px input; aria-live; aria-invalid |
| ev1-recap | ✅ No graded problem (recap) | ✅ reveal-cards tap | ✅ correct + 3 prompts | ✅ 44px flip targets; aria-live card reveal |

---

## Dept1 ↔ Dept2 Readiness Check

For each beat: **(a)** verified+sourced problem from Dept-1 brief? **(b)** concrete mechanic + feedback designed by Dept-2?

| beatId | (a) D1 problem verified? | (b) D2 mechanic+feedback designed? | kickbacks |
|--------|--------------------------|-------------------------------------|-----------|
| ev1-recall | ✅ PHT E[H]=2 recall; GB p.44; shipped lesson ☑ | ✅ retrievalGrid; 2 pairs; 3-level hints; correct copy | — |
| ev1-bet | ✅ $3 ticket scenario; GB p.62 anchor ☑ | ✅ prediction; byOption copy verbatim from brief ☑ | — |
| ev1-primer | ✅ Weighted average definition (JIT pre-teach; no graded answer needed) | ✅ primer(average) body authored; collapsible; advance | — |
| ev1-win | ✅ Fair die E=7/2; GB p.62 ☑ engine ☑; accept "7/2" ☑ | ✅ answerEntry; hints verbatim from brief ☑ | — |
| ev1-explore | ✅ Fair die balance beam (same verified answer, visual reinforce); ungraded ☑ | ✅ expectationScale NEW; hero spec; renderer spec; aria-live; reduced-motion | — |
| ev1-model | ✅ E[X]=Σx·P(x) definition GB p.44 ☑; continuous aside GB p.21 ☑ (mention only) | ✅ primer(custom); introduces symbol; groundedBy ☑; interviewNote ☑ | — |
| ev1-deepen | ✅ Law of Large Numbers (conceptual; no graded number; Track-A enrichment) | ✅ theorySimChart; Track-A; required:false ☑ | — |
| ev1-pmf | ✅ P(sum=5)=4/36=1/9 counting ☑ engine ☑; **field-2 short E pmf {3,5,7}→5** is a Dept-2 design choice not explicitly specified in the brief; brief says "then a short Σ x·P(x)" without a specific pmf | ✅ answerEntry; hint[0] verbatim from brief ☑; field-2 accept "5" (3/4+10/4+7/4=5, engine-verifiable) | **Minor:** Dept-1 should sign off on the specific 3-outcome pmf {$3,prob=1/4; $5,prob=1/2; $7,prob=1/4} for field-2, to confirm it fits the "unlabeled count→weight" pedagogical intent. Not a blocker — Dept-2 will accept a swap if Dept-1 prefers a dice-derived pmf. |
| ev1-prove | ✅ Two-dice E=252/36=7; GB p.62+p.47 ☑ engine ☑; required:true ☑; pattern UNSET ☑ | ✅ masteryChallenge; scenario table; hints verbatim from brief ☑; interviewNote ☑ | — |
| ev1-recap | ✅ No graded problem (recap beat) | ✅ recap type; variance teaser in correct copy; required:true ✓ | — |

---

### VERDICT: **READY**

All 10 beats have verified+sourced problems (Dept-1 brief) and concrete mechanics+feedback (Dept-2 design). One minor kickback on `ev1-pmf` field-2 (specific 3-outcome pmf needs Dept-1 sign-off) — this is **non-blocking** and does not delay Wave-0 work on the engine, schema, or renderer.

**Wave-0 freeze items:**
1. `expectationScale` Zod schema (above) → add to `InteractionSchema` union in `schema.ts`
2. `src/engine/expectation.ts` → `expectedValue(pmf):Rational` with goldens: fair die `{n:7,d:2}`, two-dice `{n:7,d:1}`, 3-outcome `{n:5,d:1}`
3. `ExpectationScaleBeat.tsx` renderer → props, DOM/SVG layout, aria-live, reduced-motion, hero slow-first
4. `validate-fixtures.ts` → add `lesson-expected-value-1..6` to `GATED`+`MASTERY_LESSONS`; Stage-2 expectation cross-check; ev1-prove pattern-unset assertion
5. `computeMastered` keys on `{ev1-recall, ev1-win, ev1-pmf, ev1-prove}` (per brief assessment section)
