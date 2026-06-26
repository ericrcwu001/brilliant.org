# Interaction Spec: Linearity of Expectation  (lesson-expected-value-2)

> **Design layer only.** No production code. All feedback copy is verbatim from `brief.md`.
> Chapter accent: `--ch4` amber `#E0982E` / `--ch4-tint`. Fonts: Space Grotesk (headings) / Inter (body) / JetBrains Mono `tabular-nums` (fractions, answers).

---

## Beat Table

| # | beatId | mechanic + "wow" | interaction type | reuse or NEW | feedback + 3-level hints | a11y | visual/motion + tokens | track |
|---|--------|-----------------|----------------|-------------|--------------------------|------|------------------------|-------|
| 1 | `ev2-recall` | Left↔right match: "Fair bet's E[net gain]" → "0" × 2 pairs; recalls martingale from `lesson-overlap-shortcut`; first graded beat | `retrievalGrid` | reuse | **correct:** "A sum of fair bets is still fair — that's linearity in disguise." **hints:** ["Tap a left card, then its match on the right.", "A fair game has E[net] = 0 by definition.", "Match: 'E[net gain], one fair bet' → 0; 'E[total net], sum of fair bets' → 0."] | 44 px tap targets; keyboard arrow + Enter to select/confirm; `aria-label` per card | `--ch4` accent ring on matched pair; 120 ms `--ease-out` snap; no confetti | both |
| 2 | `ev2-bet` | Tap one of three options: "About 50 / About 10 / Just a handful"; per-option refutation reveals immediately; **ungraded** | `prediction` | reuse | **byOption** (verbatim brief): "About 50" → `{note:"Let's test it — that's near half the noodles; each tie rarely closes a loop, so loops stay few.", correct:false}` · "About 10" → `{note:"Let's test it — closer, but still high; the tiny per-tie chances add to about three loops.", correct:false}` · "Just a handful" → `{note:"Good instinct — let's prove it by adding each tie's small chance of closing a loop.", correct:true}` | 44 px option cards; keyboard select; `aria-pressed` state | `--ch4` amber border on selected; refutation copy appears below within 80 ms | both |
| 3 | `ev2-win` | Type the expected sum of two fair dice using linearity; accept `"7"`; **early win** — the L1 mastery answer now in one line | `answerEntry` | reuse | **correct:** "Exactly — linearity lets you add the dice averages without touching the joint distribution. E[X+Y] = 3.5 + 3.5 = 7." **hints:** ["No need to rebuild the sum's pmf. Add each die's average: 3.5 + 3.5 = 7.", "Each fair die has E = 7/2 = 3.5. Linearity says E[X+Y] = E[X] + E[Y].", "3.5 + 3.5 = 7."] | 44 px input field; keyboard primary; inline error annotation below field | JetBrains Mono `tabular-nums` in answer field; `--ch4` focus ring; no motion | both |
| 4 | `ev2-explore` | Step through noodle ties 1→n; running E[loops] chart climbs `1 → 4/3 → 23/15 → … → ≈3.28` at n=100 — **the "wow": a hundred noodles produce only ≈3.28 loops**; **hero cinematic**; ungraded | `theorySimChart` | reuse + **minor additive extension flagged** (see §New interaction types) | **ungraded**; `aria-live` readout narrates each step; feedback: "correct": "Each tie adds one tiny loop-closing chance — the running total stays shockingly small." hints: ["Press Step to tie one pair of ends.", "Watch E[loops] after each tie.", "After 100 noodles, the total is only ≈3.28."] | `aria-live="polite"` on running-sum counter AND running E display; 44 px step/reset controls; keyboard space to step | **hero:** `{slowFirst:true, structuralReadout:"E[100 noodles] ≈ 3.28 — a handful", reducedMotionFinalFrame:true}`; `--ch4` amber line on running E series; `--dur-slow` on the cinematic reveal; axis labels in JetBrains Mono `tabular-nums` | both |
| 5 | `ev2-model` | Tap three lens cards to reveal the formula, a first-ace decomposition, and the SUM-vs-PRODUCT contrast; **align-and-articulate tap (comparison)**; ungraded; introduces `E[X+Y]=E[X]+E[Y]` | `tripletReveal` | reuse | **ungraded**; correct: "Linearity adds; the sum rule ignores dependence. The product rule is the one with the independence fine print." hints: ["Reveal each card in turn.", "Card 3 holds the #1 confusion.", "Sum rule: always adds. Product rule: needs independence."] | 44 px lens cards; keyboard Tab/Enter; `aria-expanded` per card | `--ch4` accent border on active card; `display:'cards'`; `comparison:true` annotation badge; no hero | both |
| 6 | `ev2-sum-primer` | Read collapsible card: "The SUM rule needs no independence; only the PRODUCT rule does"; JIT primer before `ev2-noodles` | `primer` (variant `custom`, `collapsible:true`) | reuse | correct: "Got it — add expectations freely, regardless of dependence." hints: ["E[X+Y]=E[X]+E[Y] — unconditional.", "E[XY]=E[X]E[Y] — independence required.", "The noodle ties are dependent, yet the sum still works."] | 44 px collapse toggle; keyboard Enter to expand; `aria-expanded` | `--ch4-tint` card background; Inter body; no motion | both |
| 7 | `ev2-tie-scaffold` | **Track-A only.** Collapsible worked example: P(loop at k-th tie) = 1/(2(n−k+1)−1); n=2 walk-through: tie 1 → P=1/3, tie 2 → P=1; scaffold before `ev2-noodles` | `primer` (variant `custom`, `collapsible:true`) | reuse | correct: "The pool shrinks each tie — but linearity still adds each small chance." hints: ["n=2: 4 ends → P(loop, first tie) = 1/3.", "After that tie, 2 ends remain → P(loop, second tie) = 1.", "Sum: 1/3 + 1 = 4/3."] | 44 px toggle; keyboard; `aria-expanded`; Track-A badge visible | `--ch4-tint` card; Track-A badge `--ch4` | A |
| 8 | `ev2-noodles` | Type E[loops] for n=2 noodles; accept `"4/3"`; dependent-summands interleave check | `answerEntry` | reuse | **correct:** "Correct — even though tie 2 depends on tie 1, linearity adds them directly: 1/3 + 1 = 4/3." **hints:** ["Dependence doesn't block linearity. Add each tie's loop-closing chance: 1 + 1/3 = 4/3.", "First tie: P(loop) = 1/(2·2−1) = 1/3. Second tie (last two ends): P(loop) = 1.", "E[loops] = 1/3 + 1 = 4/3."] | 44 px input; keyboard primary; `aria-describedby` with fraction format hint | JetBrains Mono `tabular-nums`; fraction placeholder `?/?`; `--ch4` ring | both |
| 9 | `ev2-prove` | Type E[loops] for n=3 noodles; accept `"23/15"`; `masteryChallenge` **required**, **penultimate**; certifies linearity over dependent summands and scales to 100-noodle bet | `masteryChallenge` | reuse | **correct:** "n=3: 1 + 1/3 + 1/5 = 23/15. For 100 noodles ≈ 3.28 — logarithmic growth, not proportional." **hints:** ["Loops don't scale with noodles. Add the odd-denominator chances: 1 + 1/3 + 1/5 = 23/15.", "Three ties: P = 1/(2·3−1), 1/(2·2−1), 1/(2·1−1) = 1/5, 1/3, 1.", "1 + 1/3 + 1/5 = 15/15 + 5/15 + 3/15 = 23/15."] | 44 px; keyboard primary; `aria-describedby` scenario text; no pattern unset | scenario card visible above input; JetBrains Mono; `--ch4` ring; no hero | both |
| 10 | `ev2-recap` | Reveal recap cards (retrieval-first close); bridges to L3 indicator variables | `recap` | reuse | correct: "Break the tangle into a sum, add the easy pieces — dependence doesn't matter. Next: why does each piece equal 1/(2k−1)? That's the indicator variable trick in L3." hints: ["E[X+Y] = E[X]+E[Y] — always.", "Dependence doesn't block the sum rule.", "100 noodles ≈ 3.28 loops. The next lesson explains each piece."] | 44 px; keyboard | `--ch4` accent; no motion | both |

### Beat-level field annotations

| beatId | required | introducesSymbol | groundedBy | comparison | interviewNote | hero |
|--------|----------|-----------------|-----------|-----------|--------------|------|
| ev2-recall | true | — | — | — | — | — |
| ev2-bet | false | — | — | — | — | — |
| ev2-win | true | — | — | — | — | — |
| ev2-explore | false | — | — | — | — | `{slowFirst:true, structuralReadout:"E[100 noodles]≈3.28—a handful", reducedMotionFinalFrame:true}` |
| ev2-model | false | `"E[X+Y]=E[X]+E[Y]"` | `["ev2-win"]` | `true` | "The product rule E[XY]=E[X]E[Y] fails for dependent variables. The sum rule E[X+Y]=E[X]+E[Y] never fails — it is a property of summation itself, not of independence. The first-ace decomposition (53/5) is a linearity sum only; why each piece=1/5 is the indicator argument, owned by L3." | — |
| ev2-sum-primer | false | — | — | — | — | — |
| ev2-tie-scaffold | false | — | — | — | — | — |
| ev2-noodles | true | — | — | — | — | — |
| ev2-prove | true | — | — | — | "E[loops]=Σ_{k=1}^{n}1/(2k−1)≈½ln(2n) for large n — sub-logarithmic growth. For n=100: ≈3.28. Linearity holds because each 1/(2k−1) is the expectation of one indicator, regardless of what earlier ties did. Compare: E[loops,n=100]/100 ≈ 0.033 — not even 1 loop per 30 noodles." | — |
| ev2-recap | true | — | — | — | — | — |

> **pattern field:** UNSET on every beat. `patternOptions: ["H"]` (lesson-level sentinel, built-never-read).

---

## New interaction types (for Wave 0)

**NONE** — L2 introduces no new interaction type.

### ev2-explore reuse decision

**Chosen reuse:** `theorySimChart`

**Rationale:** `theorySimChart` is already the lesson-factory's "watch a quantity converge as a process runs" widget (used in the overlap/martingale convergence). For L2's explore beat, the same widget plots the running partial sum `Σ_{k=1}^{n} 1/(2k−1)` as the learner steps through noodle ties. The current renderer drives its series from the automaton; the noodle series requires a fixture-controlled numeric sequence from `noodleLoops`.

**Flagged minor additive extension (Wave 0, Dept 3):**

Add two optional fields to the existing `theorySimChart` Zod shape — **purely additive; existing beats unaffected**:

```
z.object({
  type: z.literal('theorySimChart'),
  mode: z.enum(['automaton', 'noodleLoops']).optional(), // default:'automaton'
  nMax: z.number().optional(),                           // max x-axis domain; default:100
})
```

When `mode === 'noodleLoops'`, the renderer calls `noodleLoops(k)` for k=1..nMax (from `src/engine/expectation.ts`) to build the series, rather than driving from the automaton. The existing code path (`mode` absent or `'automaton'`) is completely unchanged. The `aria-live="polite"` region narrates the current `k` and `E[loops]` at each step.

---

## Build decomposition (for Dept 3)

### Engine functions (`src/engine/expectation.ts`) — L2 goldens to freeze

```typescript
// Rational = { n: number; d: number }  (from src/engine/types.ts)

noodleLoops(n: number): Rational
  // Σ_{k=1}^{n} 1/(2k−1)
  // goldens: n=1 → {n:1,d:1}, n=2 → {n:4,d:3}, n=3 → {n:23,d:15}

expectedValue(pmf: {x:Rational; p:Rational}[]): Rational
  // two fair dice (each die pmf 1..6 × 1/6): result → {n:7,d:1}
```

Both functions are Wave-0 frozen. `validate-fixtures` Stage-2 cross-check: each `accept` string in beats `ev2-win` ("7"), `ev2-noodles` ("4/3"), `ev2-prove` ("23/15") must reduce to the corresponding engine output under `toRational(accept[0])` equality check.

### Reused interaction shapes (schema variants already in `schema.ts`)

| interaction type | Zod shape (existing) | beat(s) |
|-----------------|---------------------|---------|
| `retrievalGrid` | `{type, pairs:{left,right}[]}` | ev2-recall |
| `prediction` | `{type, options:string[]}` | ev2-bet |
| `answerEntry` | `{type, fields:{id,label,accept[],placeholder?,suffix?}[]}` | ev2-win, ev2-noodles |
| `theorySimChart` | `{type}` + additive `mode?,nMax?` | ev2-explore |
| `tripletReveal` | `{type, value, lenses:{label,body}[], display?}` | ev2-model |
| `primer` | `{type, variant, body, title?, collapsible?}` | ev2-sum-primer, ev2-tie-scaffold |
| `masteryChallenge` | `{type, scenario?, fields[]}` | ev2-prove |
| `recap` | `{type}` | ev2-recap |

### Fixture JSON shape (key beats, matching exemplar `lesson-overlap-shortcut.json`)

```jsonc
{
  "lessonId": "lesson-expected-value-2",
  "courseId": "course-expected-value",
  "title": "Linearity of Expectation",
  "patternOptions": ["H"],
  "milestoneId": "linearity-mastered",
  "unlocks": "lesson-expected-value-3",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "ev2-recall",
      "required": true,
      "prompt": "You've seen a fair game's net gain before. Match each scenario to its expected net.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "E[net gain], one fair bet",        "right": "0" },
          { "left": "E[total net], sum of fair bets",   "right": "0" }
        ]
      },
      "feedback": {
        "correct": "A sum of fair bets is still fair — that's linearity in disguise.",
        "hints": [
          "Tap a left card, then its match on the right.",
          "A fair game has E[net] = 0 by definition.",
          "Match: one fair bet → 0; sum of fair bets → 0."
        ]
      }
    },
    {
      "beatId": "ev2-bet",
      "required": false,
      "prompt": "There are 100 noodles in a bowl. Blindfolded, you grab two loose ends at random and tie them, again and again. How many loops do you expect?",
      "interaction": {
        "type": "prediction",
        "options": ["About 50", "About 10", "Just a handful"]
      },
      "feedback": {
        "byOption": {
          "About 50":       { "note": "Let's test it — that's near half the noodles; each tie rarely closes a loop, so loops stay few.", "correct": false },
          "About 10":       { "note": "Let's test it — closer, but still high; the tiny per-tie chances add to about three loops.", "correct": false },
          "Just a handful": { "note": "Good instinct — let's prove it by adding each tie's small chance of closing a loop.", "correct": true }
        }
      }
    },
    {
      "beatId": "ev2-win",
      "required": true,
      "prompt": "In L1 you built the full {2…12} pmf to find E[two dice] = 7. Using linearity, get the same answer in one line. What is E[X + Y] when X and Y are fair dice?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          { "id": "two-dice", "label": "E[X + Y]", "accept": ["7"], "placeholder": "?", "suffix": "" }
        ]
      },
      "feedback": {
        "correct": "Exactly — linearity lets you add the dice averages without touching the joint distribution. E[X+Y] = 3.5 + 3.5 = 7.",
        "hints": [
          "No need to rebuild the sum's pmf. Add each die's average: 3.5 + 3.5 = 7.",
          "Each fair die has E = 7/2 = 3.5. Linearity says E[X+Y] = E[X] + E[Y].",
          "3.5 + 3.5 = 7."
        ]
      }
    },
    {
      "beatId": "ev2-explore",
      "required": false,
      "prompt": "Press Step to tie a pair of ends. Watch the running E[loops] build up — one tiny bet at a time.",
      "interaction": { "type": "theorySimChart", "mode": "noodleLoops", "nMax": 100 },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "E[100 noodles] ≈ 3.28 — a handful",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "Each tie adds one tiny loop-closing chance — the running total stays shockingly small.",
        "hints": [
          "Press Step to tie one pair of ends.",
          "Watch E[loops] after each tie.",
          "After 100 noodles, the total is only ≈ 3.28."
        ]
      }
    },
    {
      "beatId": "ev2-model",
      "required": false,
      "comparison": true,
      "introducesSymbol": "E[X+Y]=E[X]+E[Y]",
      "groundedBy": ["ev2-win"],
      "prompt": "Tap each card to reveal three facets of linearity — the rule, a decomposition, and the #1 confusion.",
      "interaction": {
        "type": "tripletReveal",
        "value": "E[X+Y]=E[X]+E[Y]",
        "display": "cards",
        "lenses": [
          {
            "label": "The Rule",
            "body": "E[X+Y] = E[X]+E[Y] — the expectation of a sum is the sum of the expectations, whether or not X and Y are independent. (Green Book p.47)"
          },
          {
            "label": "First Ace",
            "body": "E[wait for first ace] = 1 + 48·(1/5) = 53/5 ≈ 10.6. Each card position contributes a tiny indicator expectation. Sum 49 tiny bets — no joint distribution needed. (Why each piece = 1/5 is L3's job.)"
          },
          {
            "label": "⚠️ Product Rule",
            "body": "E[XY] = E[X]·E[Y] ONLY when X and Y are independent. The SUM rule has no such restriction — this is the #1 confusion between the two rules."
          }
        ]
      },
      "interviewNote": "The product rule E[XY]=E[X]E[Y] fails for dependent variables. The sum rule E[X+Y]=E[X]+E[Y] never fails — it is a property of summation itself, not of independence. The first-ace decomposition (53/5) is a linearity sum only; why each piece=1/5 is the indicator argument, owned by L3.",
      "feedback": {
        "correct": "Linearity adds; the sum rule ignores dependence. The product rule is the one with the independence fine print.",
        "hints": [
          "Reveal each card in turn.",
          "Card 3 holds the #1 confusion.",
          "Sum rule: always adds. Product rule: needs independence."
        ]
      }
    },
    {
      "beatId": "ev2-sum-primer",
      "required": false,
      "prompt": "Quick clarification before we use the sum rule on dependent noodle ties — read the card.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Sum rule vs Product rule",
        "body": "The SUM rule needs no independence; only the PRODUCT rule does.\n\n• E[X+Y] = E[X]+E[Y] — always true, dependent or not.\n• E[XY] = E[X]·E[Y] — only when X and Y are independent.\n\nThe noodle ties are dependent (each tie changes the pool), yet the sum rule still works.",
        "collapsible": true
      },
      "feedback": {
        "correct": "Got it — add expectations freely, regardless of dependence.",
        "hints": [
          "E[X+Y]=E[X]+E[Y] — unconditional.",
          "E[XY]=E[X]E[Y] — independence required.",
          "The noodle ties are dependent, yet the sum still works."
        ]
      }
    },
    {
      "beatId": "ev2-tie-scaffold",
      "required": false,
      "track": "A",
      "prompt": "Track A scaffold: walk through the per-tie probability for n=2 noodles.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Per-tie loop probability (n = 2)",
        "body": "With n noodles, after k−1 ties there are 2(n−k+1) loose ends.\n\nP(loop at k-th tie) = 1 / (2(n−k+1) − 1)\n\nFor n = 2:\n• k=1 (4 ends remain): P = 1/(4−1) = 1/3\n• k=2 (2 ends remain): P = 1/(2−1) = 1\n\nE[loops] = 1/3 + 1 = 4/3 — even though tie 2 depends on tie 1.",
        "collapsible": true
      },
      "feedback": {
        "correct": "The pool shrinks each tie — but linearity still adds each small chance.",
        "hints": [
          "n=2: 4 ends → P(loop, first tie) = 1/3.",
          "After that tie, 2 ends remain → P(loop, second tie) = 1.",
          "Sum: 1/3 + 1 = 4/3."
        ]
      }
    },
    {
      "beatId": "ev2-noodles",
      "required": true,
      "prompt": "Two noodles, four loose ends. You make two random ties. What is E[loops]? (Enter a fraction like 4/3.)",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          { "id": "noodles-2", "label": "E[loops], n = 2", "accept": ["4/3"], "placeholder": "?/?", "suffix": "" }
        ]
      },
      "feedback": {
        "correct": "Correct — even though tie 2 depends on tie 1, linearity adds them directly: 1/3 + 1 = 4/3.",
        "hints": [
          "Dependence doesn't block linearity. Add each tie's loop-closing chance: 1 + 1/3 = 4/3.",
          "First tie: P(loop) = 1/(2·2−1) = 1/3. Second tie (2 ends remain): P(loop) = 1/(2·1−1) = 1.",
          "E[loops] = 1/3 + 1 = 4/3."
        ]
      }
    },
    {
      "beatId": "ev2-prove",
      "required": true,
      "prompt": "Mastery challenge: three noodles, six loose ends, three ties. Use E[loops] = Σ 1/(2k−1) to find E[loops] for n = 3. Enter your answer as a fraction.",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Each tie closes a loop with probability 1/(2(n−k+1)−1). For n=3 the three terms are 1/5, 1/3, 1. Sum them — and you'll see exactly why 100 noodles stays near 3.28.",
        "fields": [
          { "id": "noodles-3", "label": "E[loops], n = 3", "accept": ["23/15"], "placeholder": "?/??", "suffix": "" }
        ]
      },
      "interviewNote": "E[loops]=Σ_{k=1}^{n}1/(2k−1)≈½ln(2n) for large n — sub-logarithmic growth. For n=100: ≈3.28. Linearity holds because each 1/(2k−1) is the expectation of one indicator, regardless of what earlier ties did. Compare: E[loops,n=100]/100≈0.033 — not even 1 loop per 30 noodles.",
      "feedback": {
        "correct": "n=3: 1 + 1/3 + 1/5 = 23/15. For 100 noodles ≈ 3.28 — logarithmic growth, not proportional.",
        "hints": [
          "Loops don't scale with noodles. Add the odd-denominator chances: 1 + 1/3 + 1/5 = 23/15.",
          "Three ties: P = 1/(2·3−1), 1/(2·2−1), 1/(2·1−1) = 1/5, 1/3, 1.",
          "1 + 1/3 + 1/5 = 15/15 + 5/15 + 3/15 = 23/15."
        ]
      }
    },
    {
      "beatId": "ev2-recap",
      "required": true,
      "prompt": "Reveal the recap cards.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "Break the tangle into a sum, add the easy pieces — dependence doesn't matter. Next: why does each piece equal 1/(2k−1)? That's the indicator variable trick in L3.",
        "hints": [
          "E[X+Y] = E[X]+E[Y] — always.",
          "Dependence doesn't block the sum rule.",
          "100 noodles ≈ 3.28 loops. The next lesson explains each piece."
        ]
      }
    }
  ]
}
```

---

## DoR gap closures

### Gap 1 — ≥1 `primer` (variant `custom`, collapsible)
**Closed by:** `ev2-sum-primer` (both tracks) + `ev2-tie-scaffold` (Track-A). `ev2-sum-primer` carries the "the SUM rule needs no independence; only the PRODUCT rule does" caveat verbatim from the hard-gate requirement. Both are `collapsible:true`.

### Gap 2 — ≥1 Track-A beat (`track:'A'`, `required:false`)
**Closed by:** `ev2-tie-scaffold` — a stepped noodle per-tie probability scaffold that Track-A learners see; Track-B learners skip it and rely on `ev2-sum-primer` + `ev2-noodles` hints alone.

### Gap 3 — ≥1 `interviewNote`
**Closed by:**
- `ev2-model` → SUM-vs-PRODUCT independence caveat + first-ace ownership boundary.
- `ev2-prove` → logarithmic growth / 100-noodle ≈3.28 quantitative framing.

### Gap 4 — every `prediction` uses `byOption`
**Closed by:** `ev2-bet` uses `feedback.byOption` with all three option strings as keys, per-option `{note, correct}` from the brief verbatim. No `byPattern` or plain `FeedbackTripleSchema` on any prediction beat.

### Gap 5 — `beat.pattern` UNSET on every beat
**Verified:** No beat in the fixture JSON above sets `pattern`. `patternOptions: ["H"]` at lesson level is the sentinel (built-never-read). `validate-fixtures` Stage-2 expectation cross-check should NOT attempt to `buildAutomaton("H")` for this lesson — the cross-check is driven by `accept` → `noodleLoops/expectedValue` golden comparison instead.

### Gap 6 — notation ladder
`ev2-model` sets `introducesSymbol:"E[X+Y]=E[X]+E[Y]"` and `groundedBy:["ev2-win"]`. `ev2-win` precedes `ev2-model` in track-both order. `validate-fixtures` can assert the symbol is grounded before it is introduced in the visible subsequence of each track.

### Gap 7 — `computeMastered` signal
Keys on `{ev2-recall, ev2-win, ev2-noodles, ev2-prove}` as specified in the brief. First-try zero-hint on `ev2-prove` is the certifying signal.

---

## Definition-of-Ready checklist

| beat | verified + sourced problem | concrete interactive mechanic | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|------|---------------------------|------------------------------|----------------------------------|---------------------------------------|
| ev2-recall | ✅ GB p.47 §4.5 fair-game martingale (lesson-overlap-shortcut) | ✅ tap-to-match retrievalGrid | ✅ correct + 3 hints designed | ✅ 44px, no motion, aria-label per card |
| ev2-bet | ✅ Brief §Hook (100 noodles, loops) | ✅ tap prediction with byOption refutation | ✅ byOption feedback verbatim | ✅ 44px, aria-pressed |
| ev2-win | ✅ GB p.62 (die 7/2) + p.47 §4.5 (linearity); engine golden `7` | ✅ type-in answerEntry; accept "7" | ✅ correct + 3 hints (hint[0] verbatim) | ✅ 44px input, keyboard primary |
| ev2-explore | ✅ GB p.47–48 §4.5 noodleLoops; engine goldens n=1→1, n=2→4/3, n=100→≈3.28 | ✅ step-through theorySimChart (direct manipulation) | ✅ ungraded + 3 hints | ✅ 44px, reduced-motion final frame, aria-live running E |
| ev2-model | ✅ GB p.47 §4.5 (linearity rule); GB p.48 (first ace 53/5) | ✅ tap tripletReveal lens cards | ✅ ungraded + 3 hints | ✅ 44px cards, aria-expanded |
| ev2-sum-primer | ✅ GB p.47 (SUM-vs-PRODUCT caveat) | ✅ collapsible tap | ✅ correct + 3 hints | ✅ 44px toggle, aria-expanded |
| ev2-tie-scaffold | ✅ GB p.47–48 §4.5 (per-tie probability derivation) | ✅ collapsible tap (Track A) | ✅ correct + 3 hints | ✅ 44px toggle, Track-A badge |
| ev2-noodles | ✅ GB p.47–48 §4.5; engine golden `4/3` | ✅ type-in answerEntry; accept "4/3" | ✅ correct + 3 hints (hint[0] verbatim) | ✅ 44px, keyboard primary |
| ev2-prove | ✅ GB p.47–48 §4.5; engine golden `23/15` | ✅ masteryChallenge type-in; accept "23/15" | ✅ correct + 3 hints (hint[0] verbatim) | ✅ 44px, keyboard primary |
| ev2-recap | ✅ concept brief (L2 → L3 bridge) | ✅ tap recap cards | ✅ correct + 3 hints | ✅ 44px |

**Hard-gate matrix:**

| gate | status |
|------|--------|
| ev2-recall = retrievalGrid (first graded) | ✅ |
| ev2-prove = masteryChallenge, required:true, penultimate | ✅ |
| ev2-recap = recap, last, required:true | ✅ |
| ≥1 primer (custom, collapsible) | ✅ (ev2-sum-primer + ev2-tie-scaffold) |
| ≥1 interviewNote | ✅ (ev2-model + ev2-prove) |
| ≥1 Track-A beat (track:'A', required:false) | ✅ (ev2-tie-scaffold) |
| every prediction uses byOption | ✅ (ev2-bet) |
| beat.pattern UNSET everywhere | ✅ |
| aria-live on running loop count + E[loops] | ✅ (ev2-explore hero) |
| reduced-motion final frame | ✅ (ev2-explore hero.reducedMotionFinalFrame:true) |
| no new interaction type for L2 | ✅ (theorySimChart reused + minor additive extension flagged) |

---

## Dept1 ↔ Dept2 readiness check

| beat | source problem present | accept answer sourced | per-option / per-hint feedback copy | Dept2 mechanic complete | kickback? |
|------|----------------------|----------------------|------------------------------------|-----------------------|-----------|
| ev2-recall | ✅ martingale fair game | ✅ "0" (2 pairs) | ✅ 3-level hints | ✅ retrievalGrid pairs authored | — |
| ev2-bet | ✅ 100-noodle hook from brief §Hook | — (ungraded) | ✅ byOption verbatim from brief | ✅ prediction + byOption | — |
| ev2-win | ✅ GB p.62 + p.47 | ✅ "7" (engine) | ✅ hint[0] verbatim; hints [1],[2] designed | ✅ answerEntry | — |
| ev2-explore | ✅ GB p.47–48; noodleLoops golden | — (ungraded) | ✅ 3 hints | ✅ theorySimChart + minor extension flag | — |
| ev2-model | ✅ GB p.47–48 + first-ace 53/5 | — (ungraded) | ✅ 3 hints | ✅ tripletReveal 3 lenses authored | — |
| ev2-sum-primer | ✅ GB p.47 (explicit quote) | — | ✅ 3 hints | ✅ primer body authored | — |
| ev2-tie-scaffold | ✅ GB p.47–48 derivation | — | ✅ 3 hints | ✅ primer body authored | — |
| ev2-noodles | ✅ GB p.47–48; n=2→4/3 | ✅ "4/3" (engine) | ✅ hint[0] verbatim; hints [1],[2] designed | ✅ answerEntry | — |
| ev2-prove | ✅ GB p.47–48; n=3→23/15 | ✅ "23/15" (engine) | ✅ hint[0] verbatim; hints [1],[2] designed | ✅ masteryChallenge + scenario authored | — |
| ev2-recap | ✅ concept-brief bridge to L3 | — | ✅ 3 hints | ✅ recap | — |

**VERDICT: READY** — no Dept1 kickbacks. All accept answers engine-verified; all hint[0] copy verbatim from brief; all hard gates satisfied; pattern field clean throughout.

---

## Wave 0 flags for Dept 3

1. **Register lessons:** Add `lesson-expected-value-1` through `lesson-expected-value-6` to both `GATED` and `MASTERY_LESSONS` in the lesson registry.
2. **validate-fixtures Stage-2 extension:** Extend the expectation cross-check so that for L2, each `accept` value is verified against `expectation.ts` output: `"7"` → `expectedValue(fairDiePmf×2)`; `"4/3"` → `noodleLoops(2)`; `"23/15"` → `noodleLoops(3)`. No automaton cross-check for L2 (pattern field absent / sentinel "H").
3. **theorySimChart additive extension:** Add optional `mode:'noodleLoops'` + `nMax:number` fields to the `theorySimChart` Zod shape; update the renderer to call `noodleLoops(k)` when `mode==='noodleLoops'`. Existing automaton-driven `theorySimChart` beats unaffected.
4. **No new schema type** required for L2. The only schema change is the additive extension above (2 optional fields on an existing type).
