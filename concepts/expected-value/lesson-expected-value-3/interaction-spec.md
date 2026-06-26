# Interaction Spec: Indicator Variables  (lesson-expected-value-3)

Chapter: `ch-expected-value-2` · Accent: `--ch1` indigo `#4F46E5` · vizKey: `dice`
Engine fns: `indicatorExpectation`, `distinctAfterDraws`, `expectedValue` (first-ace)
All `beat.pattern` fields: **UNSET** (lesson `patternOptions:["H"]`, placeholder only)

---

## Beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse or NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|-----------------------------------------|-----------------|--------------|------------------|------|---------------|-------|
| 1 | `ev3-indicator-primer` | Tap/keyboard trigger → card expands → read body → collapse or continue | `primer {variant:'custom', collapsible:true}` | reuse | correct: "Good — a 0/1 switch whose mean is exactly P(A)." hints: ["1 when event fires, 0 otherwise.", "Its mean is its P of being 1.", "Continue."] | 44 px trigger; keyboard focus ring; expansion announced `aria-expanded` | Static `--ch1-tint` card; no motion on open; reduced-motion: card is pre-expanded | both |
| 2 | `ev3-recall` | Tap left tile → tap right tile → pair locks (green ✓) or bounces (red ✗) | `retrievalGrid` | reuse | correct: "Each value is P(A) — and now you know that's E[1_A] too." hints: ["Tap a probability, then its formula.", "Gambler's Ruin P(win)=i/N.", "Match the three."] | 44 px tiles; keyboard ↑↓ nav; match state announced via `aria-live='polite'` | 3-up grid; pairs shuffle on mount; lock animation on correct pair | both |
| 3 | `ev3-bet` | Tap one of three cards → refutation note slides up below card | `prediction` (byOption) | reuse | byOption — see §Feedback copy below | 44 px cards; keyboard; note text announced `aria-live='assertive'` | `--ch1` bordered option cards; slide-up note reveal; no reveal motion on reduced-motion | both |
| 4 | `ev3-win` | Type fraction → tap Submit → instant ✓ or hint-ladder step | `answerEntry` | reuse | correct: "E[1_ace]=P(ace)=4/52=1/13. No long sum — just P." hints: see §Feedback copy | 44 px submit; keyboard-primary (Enter submits); live inline validation on blur | JetBrains Mono input; inline ✓ pulse on correct; no confetti | both |
| 5 | `ev3-explore` | Tap "Draw card" (single) or "Run 100" (batch) → indicator light shows 1 (ace) or 0 (non-ace) → running average updates in real time → settles toward P(A)=1/13 | `coinSim {mode:'free', p:1/13}` | **reuse** + flagged extension (see §New interaction types) | gamblerNote: "Running average → 1/13 ≈ 0.077 as draws grow." | 44 px Draw + Run buttons; `aria-live='polite'` on running-average readout; reduced-motion: final-frame only | **CINEMATIC / hero**: `slowFirst:true` — first draw animated in 800 ms, then batch mode; running-average line animated (`transition: width 200ms ease`); `structuralReadout:"Running average settles to P(ace)=1/13"` ; `reducedMotionFinalFrame:true` | both |
| 6 | `ev3-model` | Tap trigger → card expands; tap formula term → inline tooltip gloss | `primer {variant:'custom', collapsible:true}` | reuse | correct: "E[1_A]=P(A) — probability and expectation are one and the same for a 0/1 indicator. A count is a sum of indicators, so E[count]=ΣP(A_i)." hints: ["E[1_A]=1·P(A)+0·P(Aᶜ)=P(A).", "Any count = Σ indicators; linearity (L2) adds their expectations.", "Continue."] | 44 px trigger; keyboard; tooltip role=`tooltip`, announced on focus | `introducesSymbol` glyph `𝟙ₐ` highlighted; `comparison:true` tap; formula tappable; no confetti | both |
| 7 | `ev3-scaffold` | Tap trigger → Track-A worked primer expands showing the 5-region setup | `primer {variant:'custom', collapsible:true}` | reuse | correct: "The key: 4 aces create 5 equal slots. Each non-ace lands in any slot with prob 1/5." hints: ["4 aces → 5 regions in any deck order.", "Each non-ace has P=1/5 of being leftmost.", "Continue."] | 44 px trigger; keyboard; expansion announced | Subdued `--ch1-tint` tint; static diagram of 5 regions; no motion | **A only** |
| 8 | `ev3-count` | Type fraction → tap Submit → instant ✓ or hint-ladder step | `answerEntry` | reuse | correct + hints: see §Feedback copy | 44 px submit; keyboard Enter submits; live validation | JetBrains Mono; inline ✓ | both |
| 9 | `ev3-prove` | Type fraction → tap Submit → instant ✓ or hint-ladder (required; NO `pattern` field) | `masteryChallenge` | reuse | correct + hints: see §Feedback copy; `interviewNote` on this beat | 44 px submit; keyboard-primary; inline ✓; no hint auto-reveal | Scenario card above entry field; `--ch1` ring on submit | both |
| 10 | `ev3-recap` | Tap to reveal recap cards in sequence | `recap` | reuse | correct: "Indicators: the bridge from probability to expectation. Sets up L5 — a full coupon set as a sum of waits." hints: ["E[1_A]=P(A).", "E[count]=ΣP(A_i) by linearity.", "L5 next."] | 44 px tap; keyboard; each card revealed via `aria-live` | Retrieval-first close; `--ch1` accent; no confetti | both |

---

## Feedback copy (verbatim from brief)

### ev3-bet (prediction · byOption)
```json
{
  "byOption": {
    "Around card 26": {
      "note": "Let's test it — 'halfway' assumes one ace, but four aces split the deck, pulling the first one much earlier."
    },
    "Around card 13": {
      "note": "Let's test it — warmer; four aces make five equal gaps, so the first ace averages near card 11."
    },
    "Around card 10": {
      "note": "Good instinct — let's prove it: five equal gaps from four aces put the first ace near 10.6.",
      "correct": true
    }
  }
}
```

### ev3-win (answerEntry · accept `["1/13","4/52"]`)
```json
{
  "correct": "E[1_ace] = P(ace) = 4/52 = 1/13. A 0/1 variable needs no long sum — its mean is just P.",
  "hints": [
    "A 0/1 variable needs no long sum. Its mean is just P(ace) = 4/52 = 1/13.",
    "There are 4 aces in 52 cards. P(ace) = 4/52.",
    "4/52 = 1/13."
  ]
}
```

### ev3-count (answerEntry · accept `["11/6"]`)
```json
{
  "correct": "E[distinct] = 6(1−(5/6)²) = 6·11/36 = 11/6 ≈ 1.83. The two draws can repeat a type, so it's below 2.",
  "hints": [
    "The two draws might repeat a type. Sum each type's chance of appearing: 6(1−(5/6)²) = 11/6.",
    "Let I_i = 1 if face i appears at least once. E[I_i] = 1 − P(never in 2 rolls) = 1 − (5/6)².",
    "6 · (1 − 25/36) = 6 · 11/36 = 11/6."
  ]
}
```

### ev3-prove (masteryChallenge · accept `["53/5","10.6"]`)
```json
{
  "correct": "E[first ace] = 1 + 48·(1/5) = 53/5 ≈ 10.6. Four aces carve five equal gaps; each non-ace has a 1/5 chance of landing before all aces.",
  "hints": [
    "Each non-ace adds only its 1/5 chance of preceding every ace, not a full card. That gives 53/5.",
    "Let I_i = 1 if non-ace i precedes all 4 aces. By symmetry (5 equal gaps), P(I_i=1)=1/5. Then E = 1 + 48·(1/5).",
    "1 + 48/5 = 5/5 + 48/5 = 53/5."
  ]
}
```

---

## Notation ladder

| introduces | symbol | beat | grounded by |
|-----------|--------|------|-------------|
| `E[1_A]=P(A)` | `𝟙ₐ` | `ev3-model` | `ev3-win` (computes E[1_ace]=1/13 first) |

`ev3-model` carries `introducesSymbol:"E[1_A]=P(A)"` and `groundedBy:["ev3-win"]`.
`ev3-model` carries `comparison:true` (learner articulates: probability = expectation for a 0/1 variable).

---

## New interaction types (for Wave 0)

**NONE new.** All 10 beats reuse existing schema types.

### Flagged reuse adaptation: `coinSim` for `ev3-explore`

`ev3-explore` reuses `coinSim { mode: 'free' }`. The existing widget streams 0/1 trials and displays a running rate — exactly the needed mechanic.

**Minor additive extension required (Dept 3):** Add an optional `p: number` field to `coinSim` (Bernoulli probability; defaults to `0.5` preserving all existing behavior). For `ev3-explore`, set `p: 1/13` (≈ 0.0769) to simulate drawing an ace from a 52-card deck. The widget labels the two outcomes "Ace (1)" / "Not ace (0)" when `p ≠ 0.5`; running average y-axis reads "Running average of indicator" and the theory line is drawn at `p`.

`gamblerNote` field repurposed: `"As draws grow, the average of 0s and 1s settles to P(ace) = 1/13 ≈ 0.077 — that is E[1_ace]."` Displayed once the running average has crossed within 0.01 of `p` for 20+ consecutive draws.

This is the **cinematic moment**: the running average visibly converging onto the theory line is the lesson's single "wow." Hero block present on this beat.

No schema type additions needed; `coinSim` already in `InteractionSchema`.

---

## Build decomposition (for Dept 3)

### Engine functions + goldens (`src/engine/expectation.ts`)

| function | signature | golden | source |
|----------|-----------|--------|--------|
| `indicatorExpectation` | `(p: Rational) → Rational` | `indicatorExpectation({n:4,d:52}) → {n:1,d:13}` | GB p.31 §2.7 |
| `distinctAfterDraws` | `(N: number, m: number) → Rational` | `distinctAfterDraws(6,2) → {n:11,d:6}` | GB p.49–50 §4.5 |
| first-ace via `expectedValue` + `indicatorExpectation` | `1 + 48 · indicatorExpectation({n:1,d:5})` | `→ {n:53,d:5}` | GB p.48 §4.5 + p.31 |

All three goldens hand-verified in brief. Freeze in Wave 0.

### Schema shapes (no new types)

| beat | type | key fields |
|------|------|-----------|
| `ev3-indicator-primer` | `primer` | `variant:'custom'`, `title`, `body`, `collapsible:true` |
| `ev3-recall` | `retrievalGrid` | `pairs:[{left,right}×3]` |
| `ev3-bet` | `prediction` | `options:[3]` |
| `ev3-win` | `answerEntry` | `fields:[{id,label,accept:["1/13","4/52"],placeholder}]` |
| `ev3-explore` | `coinSim` | `mode:'free'`, `p:1/13` (**extension**), `gamblerNote` |
| `ev3-model` | `primer` | `variant:'custom'`, `collapsible:true`; beat-level `introducesSymbol`, `groundedBy`, `comparison:true` |
| `ev3-scaffold` | `primer` | `variant:'custom'`, `collapsible:true`; beat-level `track:'A'`, `required:false` |
| `ev3-count` | `answerEntry` | `fields:[{id,label,accept:["11/6"],placeholder}]` |
| `ev3-prove` | `masteryChallenge` | `scenario`, `fields:[{id,label,accept:["53/5","10.6"]}]`; beat-level `required:true`, `interviewNote`, **no `pattern`** |
| `ev3-recap` | `recap` | — |

### Fixture JSON skeleton (`fixtures/lesson-expected-value-3.json`)

```json
{
  "lessonId": "lesson-expected-value-3",
  "courseId": "course-expected-value",
  "title": "Indicator Variables",
  "patternOptions": ["H"],
  "milestoneId": "indicator-mastered",
  "unlocks": "lesson-expected-value-4",
  "schemaVersion": 1,
  "beats": [
    {
      "beatId": "ev3-indicator-primer",
      "required": false,
      "prompt": "Before we start — what is a 0/1 indicator variable?",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "The indicator: a 0/1 switch",
        "body": "An **indicator variable** 1_A equals **1** when event A happens, and **0** when it doesn't. Nothing more — it's a switch. Its expected value is exactly the probability the switch turns on: E[1_A] = P(A).",
        "collapsible": true
      },
      "feedback": {
        "correct": "Good — a 0/1 switch whose mean is exactly P(A). Let's recall some probabilities you already computed.",
        "hints": [
          "An indicator is 1 when the event fires, 0 otherwise.",
          "Its expected value is its probability of being 1.",
          "Continue."
        ]
      }
    },
    {
      "beatId": "ev3-recall",
      "required": true,
      "prompt": "You've computed these probabilities before. Match each situation to its value — they're each secretly E[1_A] for the right indicator.",
      "interaction": {
        "type": "retrievalGrid",
        "pairs": [
          { "left": "P(win) in Gambler's Ruin, starting at i chips of N", "right": "i/N" },
          { "left": "P(winning the streak bet, PHT lesson)", "right": "7/8" },
          { "left": "P(event A occurs), combinatorics style", "right": "favorable/total" }
        ]
      },
      "feedback": {
        "correct": "Each value is P(A) — and now you know that's E[1_A] too. Probability and expectation collapse into one for a 0/1 variable.",
        "hints": [
          "Tap a probability description, then its formula.",
          "Gambler's Ruin P(win | start i, goal N) = i/N.",
          "Match all three."
        ]
      }
    },
    {
      "beatId": "ev3-bet",
      "required": false,
      "prompt": "Shuffle a 52-card deck and flip one card at a time. How deep do you expect to dig before the first ace turns up — about halfway?",
      "interaction": {
        "type": "prediction",
        "options": ["Around card 26", "Around card 13", "Around card 10"]
      },
      "feedback": {
        "byOption": {
          "Around card 26": {
            "note": "Let's test it — 'halfway' assumes one ace, but four aces split the deck, pulling the first one much earlier."
          },
          "Around card 13": {
            "note": "Let's test it — warmer; four aces make five equal gaps, so the first ace averages near card 11."
          },
          "Around card 10": {
            "note": "Good instinct — let's prove it: five equal gaps from four aces put the first ace near 10.6.",
            "correct": true
          }
        }
      }
    },
    {
      "beatId": "ev3-win",
      "required": true,
      "prompt": "Draw one card at random from a shuffled 52-card deck. Let 1_ace = 1 if it's an ace, 0 otherwise. What is E[1_ace]?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "e-indicator",
            "label": "E[1_ace]",
            "accept": ["1/13", "4/52"],
            "placeholder": "?"
          }
        ]
      },
      "feedback": {
        "correct": "E[1_ace] = P(ace) = 4/52 = 1/13. A 0/1 variable needs no long sum — its mean is just P.",
        "hints": [
          "A 0/1 variable needs no long sum. Its mean is just P(ace) = 4/52 = 1/13.",
          "There are 4 aces in 52 cards. P(ace) = 4/52.",
          "4/52 = 1/13."
        ]
      }
    },
    {
      "beatId": "ev3-explore",
      "required": false,
      "prompt": "Draw cards one at a time. Each draw records a 1 (ace) or 0 (not ace). Watch the running average settle.",
      "interaction": {
        "type": "coinSim",
        "mode": "free",
        "gamblerNote": "As draws grow, the average of 0s and 1s settles to P(ace) = 1/13 ≈ 0.077 — that is E[1_ace]."
      },
      "hero": {
        "slowFirst": true,
        "structuralReadout": "Running average settles to P(ace) = 1/13 as draws grow.",
        "reducedMotionFinalFrame": true
      },
      "feedback": {
        "correct": "The average of 0s and 1s is the hit-rate — and the hit-rate is P(ace). That's E[1_A]=P(A) in motion.",
        "hints": [
          "Run a large batch and watch the average stabilize.",
          "The running average of 0s and 1s equals the fraction of aces drawn.",
          "That fraction converges to P(ace) = 1/13."
        ]
      }
    },
    {
      "beatId": "ev3-model",
      "required": false,
      "comparison": true,
      "introducesSymbol": "E[1_A]=P(A)",
      "groundedBy": ["ev3-win"],
      "prompt": "Tap the formula terms to see why E[1_A]=P(A) — and how any count becomes a sum of probabilities.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "The indicator trick",
        "body": "**E[1_A] = 1·P(A) + 0·P(Aᶜ) = P(A).** The only nonzero value is 1, taken with probability P(A).\n\nAny count of events is a sum of 0/1 indicators: **count = Σ 1_{A_i}**. By linearity (from L2, no independence needed): **E[count] = Σ E[1_{A_i}] = Σ P(A_i)**. A messy expectation collapses to a sum of plain probabilities you already know how to compute.",
        "collapsible": true
      },
      "feedback": {
        "correct": "E[1_A]=P(A) — probability and expectation are one and the same for a 0/1 indicator. A count is a sum of indicators, so E[count]=ΣP(A_i) by linearity.",
        "hints": [
          "E[1_A] = 1·P(A) + 0·P(Aᶜ) = P(A).",
          "Any count = Σ indicators; linearity (L2) adds their expectations without needing independence.",
          "Continue."
        ]
      }
    },
    {
      "beatId": "ev3-scaffold",
      "required": false,
      "track": "A",
      "prompt": "Before the mastery challenge: a closer look at the five-region argument.",
      "interaction": {
        "type": "primer",
        "variant": "custom",
        "title": "Five equal gaps",
        "body": "Place 4 aces randomly among 52 cards. They divide the deck into **5 regions**: before ace 1, between aces 1–2, 2–3, 3–4, and after ace 4.\n\nEach of the 48 non-aces is equally likely to land in any of these 5 positions relative to the 4 aces. So **P(non-ace i precedes all 4 aces) = 1/5**.\n\nLet I_i = 1 if non-ace i comes before all aces. E[I_i] = 1/5 for each i. The expected position of the first ace = 1 (for the ace itself) + Σ E[I_i] over all 48 non-aces.",
        "collapsible": true
      },
      "feedback": {
        "correct": "The key: 4 aces create 5 equal slots. Each non-ace lands in any slot with probability 1/5.",
        "hints": [
          "4 aces → 5 regions in any deck order.",
          "Each non-ace has P=1/5 of being positioned before all aces.",
          "Continue."
        ]
      }
    },
    {
      "beatId": "ev3-count",
      "required": true,
      "prompt": "Roll a fair 6-sided die twice (N=6 faces, m=2 rolls). Let I_i = 1 if face i appears at least once. What is the expected number of distinct faces seen?",
      "interaction": {
        "type": "answerEntry",
        "fields": [
          {
            "id": "e-distinct",
            "label": "E[distinct faces]",
            "accept": ["11/6"],
            "placeholder": "?"
          }
        ]
      },
      "feedback": {
        "correct": "E[distinct] = 6(1−(5/6)²) = 6·11/36 = 11/6 ≈ 1.83. The two rolls can land on the same face, so it's below 2.",
        "hints": [
          "The two rolls might repeat a face. Sum each face's chance of appearing: 6(1−(5/6)²) = 11/6.",
          "E[I_i] = 1 − P(face i never appears in 2 rolls) = 1 − (5/6)².",
          "6 · (1 − 25/36) = 6 · 11/36 = 11/6."
        ]
      }
    },
    {
      "beatId": "ev3-prove",
      "required": true,
      "prompt": "Mastery challenge: use indicator variables to find the expected number of cards turned over before (and including) the first ace.",
      "interaction": {
        "type": "masteryChallenge",
        "scenario": "Four aces divide the 52 cards into 5 equally likely positions for each non-ace. Let I_i = 1 if non-ace i precedes all 4 aces. There are 48 non-aces. What is E[first ace position]?",
        "fields": [
          {
            "id": "e-first-ace",
            "label": "E[cards until first ace]",
            "accept": ["53/5", "10.6"],
            "placeholder": "?",
            "suffix": "cards"
          }
        ]
      },
      "interviewNote": "The 5-equal-gaps argument (Green Book p.48): four aces create five 'slots' in any random ordering of 52 cards. By symmetry, each of the 48 non-aces lands in any of the five slots with equal probability 1/5. So P(non-ace i precedes all aces) = 1/5. Therefore E[first ace] = 1 + Σ_{i=1}^{48} E[I_i] = 1 + 48·(1/5) = 53/5 ≈ 10.6. Clean interview answer: no casework, no recursion, just one symmetry observation.",
      "feedback": {
        "correct": "E[first ace] = 1 + 48·(1/5) = 53/5 ≈ 10.6. Four aces carve five equal gaps; by symmetry each non-ace has a 1/5 chance of landing before all aces.",
        "hints": [
          "Each non-ace adds only its 1/5 chance of preceding every ace, not a full card. That gives 53/5.",
          "Let I_i = 1 if non-ace i precedes all 4 aces. By symmetry (5 equal gaps), P(I_i=1)=1/5. E = 1 + 48·(1/5).",
          "1 + 48/5 = 5/5 + 48/5 = 53/5."
        ]
      }
    },
    {
      "beatId": "ev3-recap",
      "required": true,
      "prompt": "Reveal the recap cards — the indicator bridge in three moves.",
      "interaction": { "type": "recap" },
      "feedback": {
        "correct": "Indicators: the bridge from probability to expectation. A count of events = a sum of probabilities you already know. Sets up L5 — a full coupon set as a sum of geometric waits.",
        "hints": [
          "E[1_A]=P(A).",
          "E[count]=ΣP(A_i) by linearity, no independence needed.",
          "L5 next: coupon collector via the same trick."
        ]
      }
    }
  ]
}
```

---

## DoR gap closures

### Gap 1: `primer {variant:'custom'}` — what a 0/1 indicator is

**Closed by:** `ev3-indicator-primer` (beat 1, both tracks, `required:false`, collapsible).
Body verbatim: "An **indicator variable** 1_A equals **1** when event A happens, and **0** when it doesn't. Its expected value is exactly P(A)."
Also closed by `ev3-model` (beat 6) which formalizes `E[1_A]=P(A)` with tappable formula terms.

### Gap 2: Track-A scaffold (`track:'A'`, `required:false`)

**Closed by:** `ev3-scaffold` (beat 7). Exclusive to Track A; `required:false`.
Provides the step-by-step 5-region argument before `ev3-prove`, reducing first-attempt struggle for learners who need more scaffolding. Track-B learners go directly from `ev3-count` to `ev3-prove`.

### Gap 3: `interviewNote` — the 5-equal-gaps first-ace argument

**Closed by:** `interviewNote` on `ev3-prove` (beat 9).
Full copy: "The 5-equal-gaps argument (Green Book p.48): four aces create five 'slots' in any random ordering of 52 cards. By symmetry, each of the 48 non-aces lands in any of the five slots with equal probability 1/5. So P(non-ace i precedes all aces) = 1/5. Therefore E[first ace] = 1 + Σ_{i=1}^{48} E[I_i] = 1 + 48·(1/5) = 53/5 ≈ 10.6. Clean interview answer: no casework, no recursion, just one symmetry observation."

---

## Definition-of-Ready checklist

| beat | verified+sourced | concrete mechanic | feedback+3 hints | a11y covered |
|------|-----------------|-------------------|-----------------|--------------|
| `ev3-indicator-primer` | ☑ GB p.31 §2.7 | ☑ expand/collapse tap | ☑ | ☑ 44px, `aria-expanded` |
| `ev3-recall` | ☑ sources: `lesson-gamblers-ruin`, PHT streaks, `lesson-combinatorics-6` | ☑ tap-to-pair | ☑ | ☑ 44px, `aria-live` |
| `ev3-bet` | ☑ GB p.48 (53/5 answer) | ☑ tap option card | ☑ byOption (3) | ☑ 44px, `aria-live` |
| `ev3-win` | ☑ GB p.31 §2.7 (1/13) | ☑ type + submit | ☑ 3 hints | ☑ 44px, keyboard Enter |
| `ev3-explore` | ☑ GB p.31 (E[1_A]=P(A) demonstrated) | ☑ draw/batch + live avg | ☑ gamblerNote + 3 hints | ☑ 44px, `aria-live` on avg, reduced-motion final frame |
| `ev3-model` | ☑ GB p.31 §2.7 + p.47 linearity | ☑ expand + tap formula | ☑ 3 hints | ☑ 44px, tooltip role |
| `ev3-scaffold` | ☑ GB p.48 (5-region) | ☑ expand/collapse | ☑ 3 hints | ☑ 44px |
| `ev3-count` | ☑ GB p.49–50 §4.5 (11/6) | ☑ type + submit | ☑ 3 hints | ☑ 44px, keyboard Enter |
| `ev3-prove` | ☑ GB p.48 + p.31 (53/5) | ☑ type + submit | ☑ 3 hints | ☑ 44px, keyboard Enter |
| `ev3-recap` | ☑ (retrieval close) | ☑ tap-to-reveal | ☑ 3 hints | ☑ 44px |

**Hard gate check:**
- [x] `ev3-recall` = `retrievalGrid`, first graded beat
- [x] `ev3-prove` = `masteryChallenge`, `required:true`, beat 9 of 10 (penultimate)
- [x] `ev3-recap` = `recap`, beat 10 of 10 (last)
- [x] ≥1 `primer {variant:'custom'}` (beats 1, 6, 7)
- [x] ≥1 `interviewNote` (beat 9: `ev3-prove`)
- [x] ≥1 Track-A (`track:'A'`, `required:false`) (beat 7: `ev3-scaffold`)
- [x] Every `prediction` uses `byOption` (beat 3: `ev3-bet`)
- [x] `beat.pattern` UNSET on all 10 beats
- [x] NO new schema type — `ev3-explore` reuses `coinSim` (extension flagged)
- [x] `ev3-win` = guaranteed early win (beat 4, graded, fast success)
- [x] Notation ladder: `ev3-model` `introducesSymbol:"E[1_A]=P(A)"` `groundedBy:["ev3-win"]`
- [x] `hero` on `ev3-explore` (cinematic convergence moment)
- [x] `aria-live` on `ev3-explore` running average

---

## Dept1↔Dept2 readiness check

| beat | D1 intent | D2 mechanic | aligned? | kickbacks |
|------|-----------|-------------|----------|-----------|
| `ev3-indicator-primer` | JIT primer: what a 0/1 indicator is | `primer {variant:'custom', collapsible:true}` | ✅ | — |
| `ev3-recall` | Retrieval opener; recall prior probabilities as secretly E[1_A] | `retrievalGrid` 3-pair tap | ✅ | ⚠️ **KICKBACK D1**: Confirm exact left-column strings for the 7/8 (PHT streaks) and `favorable/total` (combinatorics-6) pairs match what those lessons actually taught. Brief cites lesson IDs but not the exact problem wording. |
| `ev3-bet` | Elicit "~26" misconception before refuting | `prediction byOption` 3 options | ✅ | — |
| `ev3-win` | Guaranteed early win; E[1_ace]=1/13; refutes "EV needs a long sum" | `answerEntry` single field | ✅ | — |
| `ev3-explore` | Direct manipulation: 0/1 indicator stream, running avg → P(A), `dice` viz | `coinSim {mode:'free'}` + hero | ✅ | ⚠️ **KICKBACK D3**: `coinSim` needs optional `p: number` extension. Dept 3 must confirm this is unblocked (additive, no existing breakage) before fixture is frozen. |
| `ev3-model` | Formalize E[1_A]=P(A); count=Σ indicators ⇒ E[count]=ΣP(A_i) | `primer {variant:'custom', collapsible:true}` + `comparison:true` | ✅ | — |
| `ev3-scaffold` | Track-A scaffold: 5-region argument walkthrough | `primer {variant:'custom'}` Track-A only | ✅ | — |
| `ev3-count` | Check: distinct after m=2 of N=6 = 11/6; bridge to L5 | `answerEntry` accept `"11/6"` | ✅ | — |
| `ev3-prove` | Mastery challenge: first ace via indicators = 53/5; `required:true`; NO `pattern` | `masteryChallenge` no `pattern` field | ✅ | ⚠️ **KICKBACK D3**: `validate-fixtures` must be updated to skip the `equationTiles`/`pattern` cross-check for `masteryChallenge` beats where `pattern` is intentionally absent. |
| `ev3-recap` | Retrieval-first close; sets up L5 | `recap` | ✅ | — |

### Kickback summary

1. **D1 (Curriculum):** Confirm exact `retrievalGrid` left-column strings for `7/8` (PHT streaks lesson) and `favorable/total` (lesson-combinatorics-6) match those lessons' actual framing. Low risk; purely editorial.

2. **D3 (Engineering):** Confirm `coinSim` `p` extension is greenlit. Required before `ev3-explore` fixture can be committed. Expected: 2–4 line additive change to schema + renderer; no test breakage.

3. **D3 (Engineering):** Confirm `validate-fixtures` handles absent `beat.pattern` on `masteryChallenge` beats without false CI failures. Required before `ev3-prove` fixture can be committed.

4. **Wave 0 gate (D3):** Register `lesson-expected-value-1` through `lesson-expected-value-6` in both `GATED` and `MASTERY_LESSONS` constants. Stage-2 expectation cross-check: engine goldens `1/13`, `11/6`, `53/5` must reproduce exactly from `src/engine/expectation.ts`.

### VERDICT

**CONDITIONAL PASS.** All 10 beats are designed, sourced, and mechanically specified. Three kickbacks must clear before Dept 3 can commit fixtures:
- `retrievalGrid` pair strings: D1 editorial confirmation (blocker: low)
- `coinSim` `p` extension: D3 schema confirmation (blocker: low)
- `validate-fixtures` pattern-absent handling: D3 tooling (blocker: low)

None of the kickbacks require design rework. Dept 3 may begin engine implementation (`indicatorExpectation`, `distinctAfterDraws`, first-ace `expectedValue`) immediately — those are fully frozen.
