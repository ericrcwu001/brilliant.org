# Interaction Spec: Base Rates in the Wild  (lesson-bayes-rule-8)

> Department 2 (Interactive Experience / Design). Grounded in `src/content/schema.ts`, the dispatcher, and
> the reuse renderers. The frozen `bayesUpdate` type, engine, the n-hypothesis `bars` delta, and
> validate-fixtures edits live in `../wave0-contracts.md` (§9). This spec maps every Dept-1 beat to a real
> interaction type and supplies the per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-wild'`, `unlocks:null` (last lesson of the concept), `schemaVersion:1`. Glyph `12/29`, viz `coin`.
>
> **Concept capstone — interleaved.** This lesson stays 2-hypothesis (n = 2) and **reuses L2's
> natural-frequency `tree`** (confusion grid + draggable prevalence) verbatim in a new costume — no n > 2
> rendering, **renders identically** to L2 (only the numbers and `population` differ).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / extend | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|----------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-direction` | Tap left → pick match → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick a chance-it-was-blue chip → per-option note → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | radio ≥44px; `aria-live` note | none | both |
| 3 | `name-base-rate-wild` | Expand the contrast primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` + beat-level `comparison:true` | disclosure ≥44px; static two-column body | none (tap-only) | A |
| 4 | `explore-cabs` | Drag the green/blue mix on a 100-cab array → false "blue" calls swamp true ones; PPV = 12/29 | `bayesUpdate` `display:'tree'` **n=2** | reuse (like L2) | `display`,`hypotheses` (×2),`priors` (×2 = [15/100,85/100]),`likelihoods` (×2 = [80/100,20/100]),`population:100`,`evidence`,`interactive` + beat-level `hero` | prevalence handle = range input (arrow-steppable) ≥44px; visually-hidden `aria-live` mirrors counts + PPV; reduced-motion → final confusion grid | DOM/SVG icon-array grid; CSS cell-count transition; slow-first | both |
| 5 | `compute-taxicab` | Type P(actually blue \| witness says blue) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` | input ≥44px; Enter; `aria-live` | none | both |
| 6 | `spam-costume` | Type P(spam \| flagged) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` + beat-level `interviewNote` | input ≥44px; `aria-live` | none | both |
| 7 | `spot-the-base-rate` | Match each unlabeled scenario to its base rate + move → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `triangulate-12-29` | Reveal three lenses → converge on 12/29 | `tripletReveal` | reuse | `value:'12/29'`, `lenses:[{label,body}]`, `display:'cards'` | cards ≥44px; `aria-live` | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(fraud \| flagged) under dramatic class imbalance → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the concept-capstone recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 4 `explore-cabs`: matches the brief (`bayesUpdate` `display:'tree'`, `population:100`). It reuses
  L2's `TreeLargeDisplay` (confusion grid with a draggable prevalence) **verbatim** — here the prevalence
  is the **blue-cab base rate** (default 15%), the "test" is the witness's "blue" call, and the grid fills
  12 true-blue / 17 false-blue → PPV = **12/29**. At the canonical 15% the four counts are exact integers
  (12 / 3 / 17 / 68); the slider is the same control L2 ships (no renderer change).
- Beat 3 `name-base-rate-wild`: the brief's "`primer` with `comparison:true`" is authored as
  `variant:'custom'` (no enum variant fits) plus the beat-level `comparison:true` flag (the same pattern
  L3's `due-vs-evidence` used). `PrimerBeat` renders the contrast as a two-sided prose body — no new widget.
- Beat 7 `spot-the-base-rate`: the brief's "interleaved mixed-review checkpoint (modeled on
  `lesson-states-streaks`)" is delivered as a graded `retrievalGrid` matching unlabeled scenarios to their
  base rate + move (disease / cab / spam / coin).
- No other remaps.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics: `hints[0]`=gentle, `hints[1]`=misconception refutation, `hints[2]`=revealed answer ("Try again"
resets). `required` graded beats that reach reveal report `needsReview`.

**1 · `recall-direction`** — `correct` + `hints[3]`
- correct: "Two tools you already own: the conditional points one way (L7), and a rare prior swamps strong evidence (L2). Now spot them in the wild."
- hints: `["From L7: P(E|H) ≠ P(H|E).", "From L2: a rare base rate can outweigh a very strong test.", "Reliability of the witness is forward; what you want is backward, weighted by the base rate."]`
- pairs: `"P(E | H) ≠ P(H | E)"→"the conditional points one way (L7)"`, `"A rare prior"→"swamps even strong evidence (L2)"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"About 80% — the witness is 80% reliable"` → `{note:"That's P(says blue | blue), not P(blue | says blue). Of 100 cabs the witness calls 'blue' on 12 of the 15 blue AND 17 of the 85 green → 12/29 ≈ 41%.", correct:false}`
- `"Under half — most cabs are green"` → `{note:"Right — the 85% green base rate produces 17 false 'blue' calls, swamping the 12 true ones → 12/29.", correct:true}`
- `"About 15% — that's the blue base rate"` → `{note:"15% is the prior, before the witness. The 80% testimony lifts it — but only to 12/29, not all the way to 80%.", correct:false}`
- hints: `["No wrong guess — we'll count 100 cabs.", "80% is P(says blue | blue), not P(blue | says blue).", "12 true 'blue' vs 17 false 'blue' → 12/29."]`

**3 · `name-base-rate-wild`** (primer, `comparison:true`; copy = caption/aria)
- correct: "Two numbers: the one they **hand you** (the witness's 80%) and the one you must **look up** (the 15% base rate). Real judgments hide the second."
- hints: `["The reliability is given; the base rate is not — you fetch it.", "P(says blue | blue) is handed to you; P(blue) you look up.", "Name the base rate, then update."]`
- title: "The number you look up" · body: "Every real judgment has a number someone hands you (a witness's reliability, a test's accuracy, a model's recall) and a number you have to **go look up** (how common the thing is — the base rate). Base-rate neglect is forgetting the second. The fix is one habit: **name the base rate, then update.**"

**4 · `explore-cabs`** (ungraded hero; copy = aria/caption)
- correct: "Hold the witness at 80% and drag the cab mix: at 15% blue, the 85 green cabs yield 17 false 'blue' calls — more than the 12 true ones. PPV = 12/(12+17) = 12/29."
- hints: `["Drag the green/blue mix and watch the false-'blue' column.", "Rare blue (15) × a reliable-ish witness still loses to 85 green × a 20% error.", "12 true 'blue' vs 17 false 'blue' → 12/29."]`
- `hero.structuralReadout`: "Of 100 cabs the witness calls 'blue' on 12 of 15 blue and 17 of 85 green → 12 of 29 → 12/29."

**5 · `compute-taxicab`** — graded `correct` + `hints[3]`
- correct: "12 true-blue calls / (12 true + 17 false) = **12/29 ≈ 41%** — under half. The 80% is P(says blue | blue), not P(blue | says blue)."
- hints: `["Of 100 cabs: 15 blue, 85 green. The witness is right 80% of the time either way.", "True 'blue' = 15·80% = 12; false 'blue' = 85·20% = 17.", "12/(12+17) = 12/29."]`
- field: `{id:"blue", label:"P(actually blue | witness says blue)", accept:["12/29"]}`

**6 · `spam-costume`** — graded `correct` + `hints[3]`
- correct: "Same move, ML costume: of 100 emails, 20 spam → 99% recall ≈ 19.8 caught; 80 ham × 2% ≈ 1.6 false flags → precision = 198/(198+16) = **99/107 ≈ 93%**. (Recall 99% ≠ precision.)"
- hints: `["Recall is P(flagged | spam); you want precision P(spam | flagged).", "Per 10,000: 2000 spam × 99% = 1980 true flags; 8000 ham × 2% = 160 false flags.", "1980/(1980+160) = 99/107."]`
- field: `{id:"spam", label:"P(spam | flagged)", accept:["99/107"]}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L8): "PPV / precision under class imbalance is the canonical ML/quant base-rate question (interview pack `spam-precision`); the taxicab is its psychology classic (`showcase-taxicab`). The one-liner: a flag's precision is prior odds × likelihood ratio — recall (sensitivity) alone tells you nothing about precision until you weigh the base rate."

**7 · `spot-the-base-rate`** — graded `correct` + `hints[3]` (the concept's interleaved capstone checkpoint)
- correct: "Four costumes, one rule: **name the base rate, weight the evidence, renormalize.** Only the disguise changes."
- hints: `["For each, ask: what's the prior (base rate), and how strong is the evidence?", "A rare base rate (disease, fraud) drags a strong test down; a common one (no rare prior) doesn't.", "1% → 1/2, 85% green → 12/29, 1/1000 fraud → 95/1094, fair coin → 2/3."]`
- pairs: `"1% disease, 99% test, positive"→"rare base rate → PPV only 1/2"`, `"85% green cabs, 80% witness says blue"→"common-class base rate → 12/29"`, `"1-in-1000 fraud, model flags it"→"very rare base rate → 95/1094"`, `"Fair vs two-headed coin, one head"→"no rare base rate → 2/3"`

**8 · `triangulate-12-29`** (ungraded reveal)
- correct: "The formula, the 12-vs-17 frequency count, and the odds ratio all give **12/29** — not a quirk of these numbers."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 12/29."]`
- lenses: `{label:"Formula", body:"(15/100·80/100) / (15/100·80/100 + 85/100·20/100) = (12/100)/(29/100)"}`, `{label:"Frequencies", body:"Of 100 cabs: 12 true-blue calls vs 17 false-blue calls → 12 of 29"}`, `{label:"Odds", body:"prior odds 15:85 × likelihood ratio 80/20 = 4 → 60:85 = 12:17 → 12/29"}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "Per 100,000 transactions: 100 fraud × 95% = 95 true flags; 99,900 honest × 1% = 999 false flags → precision = 95/(95+999) = **95/1094 ≈ 8.7%**. A great-sounding model + a rare base rate ⇒ most flags are false alarms."
- hints: `["Recall 95% is P(flagged | fraud); you want P(fraud | flagged).", "Fraud is 1-in-1000. 95 true flags vs ~999 false flags over the honest majority.", "95/(95+999) = 95/1094."]`
- scenario: "A fraud model with **95% recall** and a **1% false-positive rate** flags a transaction; fraud occurs in **1 of every 1000** transactions." · field: `{id:"fraud", label:"P(fraud | flagged)", accept:["95/1094"]}`

**10 · `recap`** (concept capstone; `correct`=principle, `hints`=takeaways)
- correct: "Real judgments hide the base rate — the number you have to look up. **Name the base rate, then update**: weight the evidence by how well each hypothesis predicted it, and renormalize. Same rule, every costume."
- hints: `["A reliable witness, a sharp test, a high-recall model — none beats a rare enough base rate (12/29, 1/2, 95/1094).", "P(says blue | blue) ≠ P(blue | says blue); recall ≠ precision; accuracy ≠ P(hypothesis).", "That closes Bayes' Rule: evidence rescales belief in proportion to how well each hypothesis predicted it."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-direction | n/a (recall of L7/L2) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 12/29 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-base-rate-wild | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-cabs | 12/29 ✔ engine (`naturalFrequencies`, pop 100) | drag prevalence ✔ | hero readout ✔ | aria-live counts + PPV + final grid ✔ |
| compute-taxicab | 12/29 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| spam-costume | 99/107 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| spot-the-base-rate | n/a (interleave capstone) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| triangulate-12-29 | 12/29 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 95/1094 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-8`): ≥1 primer ✔ (`name-base-rate-wild`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`spam-costume`); first graded beat is the `retrievalGrid` opener ✔ (`recall-direction`); no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied.
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (95/1094 is a Bayes fraction, not a hitting-time).
- **bayesUpdate cross-check**: `explore-cabs` declares `posterior:"12/29"`; the validator recomputes `bayesPosterior(priors, likelihoods)[0]` with `priors=[15/100,85/100]`, `likelihoods=[80/100,20/100]` (focal = `hypotheses[0]` = Blue) → 12/29 (≡ the `naturalFrequencies(...).ppv` the tree fills from). n = 2, the existing path — no validator change.
