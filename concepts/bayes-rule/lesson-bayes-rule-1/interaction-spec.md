# Interaction Spec: The Update Rule  (lesson-bayes-rule-1)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> dispatcher (`src/lesson/beats/index.tsx`), and reuse renderers. The frozen `bayesUpdate` type, engine,
> and validate-fixtures edits live in `../wave0-contracts.md` — this spec maps every Dept-1 beat to a real
> interaction type and supplies the per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (see wave0 §5): `courseId:'course-bayes-rule'`,
> `patternOptions:["H"]` (safe H/T placeholder — the LessonPlayer builds `buildAutomaton(patternOptions[0])`
> and no Bayes beat reads the automaton), `milestoneId:'bayes-rule-update'`,
> `unlocks:'lesson-bayes-rule-2'`, `schemaVersion:1`. Glyph `2/3`, viz `twoNode`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-prob-split` | Tap a result on the left → pick its match on the (reordered) right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | tap+drag targets ≥44px; `aria-live` status mirrors "all matched / needs another look" (renderer built-in) | none (tap) | both |
| 2 | `open-bet` | Pick one chip → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-the-parts` | Read/expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A |
| 4 | `explore-update` | Drag the prior split → pick the evidence (heads) → posterior bar swings; loop the prior | `bayesUpdate` `display:'bars'` | **NEW** | `display`,`hypotheses`,`priors`,`likelihoods`,`evidence`,`interactive` + beat-level `hero` | bar handle = range input (arrow-key steppable) ≥44px; evidence buttons ≥44px; visually-hidden `aria-live` posterior mirror ("Posterior: 2 in 3"); reduced-motion → final settled bars | DOM bars, CSS width transition; slow-first per `hero.slowFirst` | both |
| 5 | `count-the-heads` | Tap the heads that belong to the two-headed coin (2 of 3) → Check | `bayesUpdate` `display:'tree'` | **NEW** | `display`,`hypotheses`,`priors`,`likelihoods`,`population:3`,`evidence`,`interactive` (no `hero` ⇒ graded) | 3 head-icon buttons ≥44px; `aria-live` count mirror; reduced-motion → static icons, no pop | DOM/SVG icon row, CSS tint on tap | both |
| 6 | `compute-posterior` | Type the exact posterior fraction → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` | text input + `suffix`; Enter submits; FeedbackStrip `aria-live` | none | both |
| 7 | `framing-flip` | Type two posteriors (the two framings) → Check | `answerEntry` | reuse | `fields:[…×2]` | two labelled inputs ≥44px; `aria-live` | none | both |
| 8 | `triangulate-23` | Reveal each of three lenses → they converge on 2/3 | `tripletReveal` | reuse | `value:'2/3'`, `lenses:[{label,body}]`, `display:'cards'` + beat-level `interviewNote` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(two-headed \| HH) → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 5 `count-the-heads`: Dept-1 sketched "`display:'bars'` then a tap-partition". The tap-partition is exactly the `tree` semantics (partition a tiny natural-frequency icon array; posterior = highlighted ÷ total), so it is assigned **`display:'tree'` with `population:3`**, not `bars`. `bars` stays on the felt drag beat (4).
- No other remaps in L1. Every other beat maps 1:1 to an existing real type.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle), `hints[1]`=Hint 2
(the misconception refutation), `hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets).
`required` graded beats that ever reach reveal report `needsReview`.

**1 · `recall-prob-split`** — `correct` + `hints[3]`
- correct: "A probability is a *split*, not a flip-count — and Bayes adds: that split can be **re-weighed** by evidence."
- hints: `["Warm-up from Penney's / Gambler's Ruin — no pressure.", "One quantity counts flips (+1 each); the other only splits the chance.", "Win-chance → a split (no +1); wait-time → +1 every flip."]`
- pairs: `"A win-chance (probability)"→"A split between outcomes — no +1"`, `"A wait-time (duration)"→"+1 on every flip"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"Still 50/50 — a head can't rule out either coin"` → `{note:"Both coins CAN show heads — but not equally often. The two-headed coin shows heads every time; the fair coin only half. Watch what 'how often' does.", correct:false}`
- `"More likely the two-headed coin"` → `{note:"Good instinct — a head is better explained by the two-headed coin. Let's find exactly how much.", correct:true}`
- `"It's certain — it must be the two-headed coin"` → `{note:"Strong — but a fair coin shows heads too (half the time). Evidence tilts the split; it rarely settles it.", correct:false}`
- hints: `["No wrong guess yet — commit and we'll weigh it.", "A head is twice as likely from the two-headed coin.", "It moves you 1/2 → 2/3 — not to certainty."]`

**3 · `name-the-parts`** (primer; copy = caption/aria)
- correct: "Prior → likelihood → posterior. Keep those three words."
- hints: `["Before, during, after.", "Likelihood = how well a hypothesis predicted what you saw.", "posterior ∝ prior × likelihood."]`
- title: "Prior, likelihood, posterior" · body: "Your belief **before** the flip is the *prior*. How well each coin predicts the flip you saw is the *likelihood*. Your updated belief **after** is the *posterior*. Bayes says: posterior ∝ prior × likelihood."

**4 · `explore-update`** (ungraded hero; copy = aria/caption)
- correct: "Drag the prior and the posterior bar swings — one head moves 1/2 → 2/3, never to certainty."
- hints: `["Drag the prior split, then pick the evidence (heads).", "Evidence tilts the split; it doesn't prove or erase a coin.", "At a 1/2 prior, a single head lands you at 2/3."]`
- `hero.structuralReadout`: "A head leaves 2 of 3 equally-likely heads on the two-headed coin → 2/3."

**5 · `count-the-heads`** — graded `correct` + `hints[3]`
- correct: "Two of the three equally-likely heads sit on the two-headed coin → **2/3**."
- hints: `["The two-headed coin offers two heads (one per face); the fair coin offers one.", "Of the 3 equally-likely heads, tap the 2 that belong to the two-headed coin — the two H-sides are NOT 'the same' head.", "2 of 3 heads are the two-headed coin's → P = 2/3."]`

**6 · `compute-posterior`** — graded `correct` + `hints[3]`
- correct: "(½·1)/(½·1 + ½·½) = (½)/(¾) = **2/3**. The 100% likelihood is weighed by the prior and renormalized."
- hints: `["Don't stop at the likelihood (1). Weigh it by the prior, then divide by the total chance of a head.", "Numerator ½·1; denominator ½·1 + ½·½ = ¾ (posterior = likelihood is the trap).", "(½)/(¾) = 2/3."]`
- field: `{id:"posterior", label:"P(two-headed | heads)", accept:["2/3"], placeholder:"e.g. 1/2"}`

**7 · `framing-flip`** — graded `correct` + `hints[3]`
- correct: "'At least one is a boy' removes only girl-girl → **1/3**. 'This specific child is a boy' is stronger evidence → **1/2**. The framing of the clue changes the update."
- hints: `["Same family, two different clues — list {bb, bg, gb, gg} and remove what each clue rules out.", "'At least one boy' keeps {bb, bg, gb} → 1 of 3. 'This child is a boy' points at one child → 1 of 2.", "At-least-one → 1/3; this-child → 1/2."]`
- fields: `{id:"atleast", label:"P(both boys | at least one is a boy)", accept:["1/3"]}`, `{id:"thischild", label:"P(both boys | this child is a boy)", accept:["1/2"]}`

**8 · `triangulate-23`** (ungraded reveal)
- correct: "Formula, frequencies, and odds all land on **2/3** — not a trick of one method."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 2/3."]`
- lenses: `{label:"Formula", body:"(½·1)/(½·1+½·½) = (½)/(¾)"}`, `{label:"Frequencies", body:"3 equally-likely heads, 2 on the two-headed coin"}`, `{label:"Odds", body:"prior odds 1:1 × likelihood ratio 2:1 = 2:1"}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L1): "The two-coin update is the cleanest Bayes warm-up: posterior odds = prior odds × likelihood ratio (1:1 × 2:1 = 2:1 → 2/3). Naming the likelihood ratio out loud *is* the answer."

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "The fair coin's likelihood is now (½)²=¼: (½·1)/(½·1 + ½·¼) = (½)/(⅝) = **4/5**. A second head DOES move a settled belief."
- hints: `["A second head is more evidence — recompute, don't keep 2/3.", "Fair-coin likelihood is ½·½=¼; numerator ½·1, denominator ½·1 + ½·¼ = ⅝.", "(½)/(⅝) = 4/5."]`
- scenario: "Same two coins (one fair, one two-headed). You flip the chosen coin and see heads **twice** (HH)." · field: `{id:"hh", label:"P(two-headed | HH)", accept:["4/5"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "Evidence rescales belief in proportion to how well each hypothesis predicted it: posterior ∝ prior × likelihood, then renormalize."
- hints: `["A head moves 1/2 → 2/3 because 2 of 3 equally-likely heads are the two-headed coin's.", "The prior never drops out — you weigh the likelihood by it and divide by the total.", "Next up: when the prior is tiny, even strong evidence barely moves it."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-prob-split | n/a (recall of L0/PHT) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 2/3 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-the-parts | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-update | 2/3 ✔ engine (wave0 golden) | drag prior + pick evidence ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| count-the-heads | 2/3 ✔ engine | tap-partition 3 icons ✔ | triple ✔ | aria-live count ✔ |
| compute-posterior | 2/3 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| framing-flip | 1/3 & 1/2 (GB p.37–38) ✔ | type ×2 ✔ | triple ✔ | ✔ |
| triangulate-23 | 2/3 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 4/5 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-1`): ≥1 primer ✔ (`name-the-parts`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`triangulate-23`); first graded beat is the `retrievalGrid` opener ✔; no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied (see wave0 §6 for why we do **not** ground a both-track beat by the track-A-only primer).
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (so the `buildAutomaton(pattern).E0 ∈ accept` cross-check is skipped — a Bayes fraction is not a hitting-time).
- **bayesUpdate beats** (`explore-update`, `count-the-heads`) are cross-checked against `bayes.ts` via the new validate-fixtures block (wave0 §6): both declare `posterior:"2/3"`.
