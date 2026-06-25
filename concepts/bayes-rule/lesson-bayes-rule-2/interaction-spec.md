# Interaction Spec: The Base-Rate Trap  (lesson-bayes-rule-2)

> Department 2. Grounded in `src/content/schema.ts` + the reuse renderers. Frozen `bayesUpdate` type, engine,
> and validate-fixtures edits in `../wave0-contracts.md`.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-base-rate'`, `unlocks:'lesson-bayes-rule-3'`, `schemaVersion:1`. Glyph `1%`, viz `coin`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-update` | Tap left → pick match → Check | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick chip → per-option note → Continue | `prediction` | reuse | `options` + `byOption` | radio ≥44px; `aria-live` | none | both |
| 3 | `name-base-rate` | Expand primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px | none | A |
| 4 | `explore-frequencies` | Drag prevalence on a 10,000-person array → TP/FP/FN/TN cells re-fill → posterior = TP/(TP+FP) | `bayesUpdate` `display:'tree'` | **NEW** | `display`,`hypotheses`,`priors`,`likelihoods`,`population:10000`,`evidence`,`interactive` + `hero` | prevalence handle = range input (arrow-steppable) ≥44px; visually-hidden `aria-live` mirrors counts + PPV; reduced-motion → final confusion grid | DOM/SVG icon-array grid; CSS cell-count transition; slow-first | both |
| 5 | `compute-ppv` | Type PPV fraction → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` + beat-level `interviewNote` | input ≥44px; Enter; `aria-live` | none | both |
| 6 | `ten-heads` | Type P(unfair \| 10 H) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` | input ≥44px; `aria-live` | none | both |
| 7 | `base-rate-sweep` | Type the posterior at 1% / 10% / 25% → Check | `answerEntry` | reuse | `fields:[…×3]` | three inputs ≥44px; `aria-live` | none | both |
| 8 | `triangulate-half` | Reveal three lenses → converge on 1/2 | `tripletReveal` | reuse | `value:'1/2'`, `lenses`, `display:'cards'` | cards ≥44px; `aria-live` | none | both |
| 9 | `mastery-challenge` | Type P(disease \| +) for a 95% test → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields` — **no `pattern`** | input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal recap | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 7 `base-rate-sweep`: Dept-1 noted "reuses `slider`". **Remapped to `answerEntry`** (3 fields). The stock
  `SliderBeat` is an *ungraded* prediction-lock that writes `finalPrediction`/`theoreticalValue` from the H/T
  automaton and surfaces only its own integer value — it cannot grade nor show a reactive posterior (see
  wave0 Risk R-2). The *felt* "drag the dial" lives in beat 4 (`explore-frequencies`, the interactive tree);
  the sweep then asks the learner to lock the three exact posteriors. Net effect: **the stock `SliderBeat`
  is not used by Bayes at all**, so no SliderBeat generalization is required.
- Beat 4 `explore-frequencies` uses `bayesUpdate` `display:'tree'` (the natural-frequency confusion array),
  matching the brief. Beat 6 `ten-heads` is a single graded `answerEntry` (the brief's "predict, then reveal"
  is delivered as the GB framing in the prompt + the type-in answer); no separate `prediction` beat is added
  (keeps the 10-beat budget and the early-win/opener invariant intact).

## Feedback + hint ladders (actual copy)

**1 · `recall-update`** — `correct`+`hints[3]`
- correct: "Evidence rescales the prior — and a *rare* hypothesis starts low. Now watch a low prior fight back."
- hints: `["From L1: posterior ∝ prior × likelihood.", "One row says how to update; one says where a rare hypothesis begins.", "Evidence → rescale the prior; rare → low prior."]`
- pairs: `"Evidence updates your belief"→"Rescale the prior by the likelihood"`, `"A rare hypothesis"→"Starts with a low prior"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"About 99% — the test is 99% accurate"` → `{note:"That reads P(positive | sick) as if it were P(sick | positive). With only 1 in 100 sick, the false alarms catch up.", correct:false}`
- `"Around 95%"` → `{note:"Still too high — the base rate hasn't entered your estimate yet.", correct:false}`
- `"Much lower — around 50%"` → `{note:"Surprising but right — 99 true positives are matched by 99 false alarms.", correct:true}`
- hints: `["No wrong guess — we'll count actual people.", "99% is P(+|sick), not P(sick|+).", "On 10,000 people it lands at 50%."]`

**3 · `name-base-rate`** (primer)
- correct: "Base rate = the prior = how common it is *before* testing."
- hints: `["It's the prior, by another name.", "The test gives P(+|sick); you want P(sick|+).", "The base rate is the anchor the evidence must move."]`
- title: "Base rate (the prior)" · body: "The *base rate* is how common the hypothesis is **before** any test — the prior. A 99% test describes P(positive | sick); Bayes flips the arrow to P(sick | positive), and the base rate is the weight it must overcome."

**4 · `explore-frequencies`** (ungraded hero)
- correct: "Drag prevalence: at 1%, the 9,900 healthy produce 99 false alarms — as many as all 99 true positives. PPV = 99/(99+99) = 1/2."
- hints: `["Drag the prevalence and watch the false-positive column.", "Rare per person (1%) × a huge healthy crowd (9,900) = 99 false alarms.", "99 TP vs 99 FP → exactly half."]`
- `hero.structuralReadout`: "Of 10,000 people: 99 true positives and 99 false alarms → half of all positives are sick."

**5 · `compute-ppv`** — graded `correct`+`hints[3]`
- correct: "99 TP / (99 TP + 99 FP) = **1/2**. Among the positives, the sick and the false alarms are equal in number."
- hints: `["Count the people: 99 true positives, 99 false positives.", "PPV = TP/(TP+FP) — not the test's accuracy; the false positives are NOT negligible.", "99/(99+99) = 1/2."]`
- field: `{id:"ppv", label:"P(disease | positive) = TP / (TP + FP)", accept:["1/2"]}`
- `interviewNote` (satisfies GATED for L2): "Base-rate neglect / PPV is the canonical screening-test (and ML class-imbalance) interview question: prior odds 1:99 × a likelihood ratio of 99 = 1:1, so precision is 50% no matter how 'accurate' the test sounds."

**6 · `ten-heads`** — graded `correct`+`hints[3]`
- correct: "10 heads is 1024× better evidence for the trick coin — but it started 999× rarer. 1024 vs 999 → **1024/2023**, barely past 50%."
- hints: `["The trick coin was 1 in 1000; 10 fair heads have chance (1/2)^10 = 1/1024.", "Odds: 1 × 2^10 vs 999 → 1024 : 999 (the 10th head is what crosses even).", "1024/(1024+999) = 1024/2023."]`
- field: `{id:"p", label:"P(double-headed | 10 heads in a row)", accept:["1024/2023"]}`

**7 · `base-rate-sweep`** — graded `correct`+`hints[3]`
- correct: "Hold the test at 99% and move only the base rate: 1% → **1/2**, 10% → **11/12**, 25% → **33/34**. The prior is the dial."
- hints: `["Same 99%/99% test; only prevalence changes — recount TP vs FP at each.", "At 10%: 990 TP vs 90 FP. At 25%: 2475 TP vs 75 FP.", "1/2, 11/12, 33/34."]`
- fields: `{id:"p1", label:"1% prevalence", accept:["1/2"]}`, `{id:"p10", label:"10% prevalence", accept:["11/12"]}`, `{id:"p25", label:"25% prevalence", accept:["33/34"]}`

**8 · `triangulate-half`** (ungraded reveal)
- correct: "Frequencies, odds, and formula all give **1/2** — not a coincidence of the numbers."
- hints: `["Reveal each lens.", "1:99 × 99 = 1:1 is the cleanest one.", "All three say 1/2."]`
- lenses: `{label:"Frequencies", body:"99 true positives vs 99 false positives"}`, `{label:"Odds", body:"prior odds 1:99 × likelihood ratio 99 = 1:1"}`, `{label:"Formula", body:"(.01·.99)/(.01·.99 + .99·.01) = 99/198"}`

**9 · `mastery-challenge`** — graded `correct`+`hints[3]`
- correct: "95 TP vs 495 FP → 95/590 = **19/118** ≈ 16%. A weaker test lowers PPV quantitatively; the base-rate trap is the same shape."
- hints: `["10,000 people: 100 sick → 95 TP; 9,900 healthy × 5% → 495 FP.", "PPV = 95/(95+495) = 95/590.", "19/118."]`
- scenario: "A weaker test: **95% sensitive, 95% specific**, same **1%** disease, positive result." · field: `{id:"p", label:"P(disease | positive)", accept:["19/118"]}`

**10 · `recap`**
- correct: "When a hypothesis is rare, even strong evidence can leave it improbable: posterior odds = prior odds × likelihood ratio, and a tiny prior odds cancels a huge likelihood ratio."
- hints: `["1-in-100 disease + 99% test → 50%, because 99 false alarms match 99 true positives.", "Hold the test fixed and the base rate alone moves the answer 1/2 → 11/12 → 33/34.", "Next: stack a second independent test and the odds multiply."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y |
|--------|--------------------------|------------------------------|----------------------------------|------|
| recall-update | n/a (recall of L1) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| open-bet | 1/2 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-base-rate | n/a primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-frequencies | 1/2 ✔ engine (`naturalFrequencies`) | drag prevalence ✔ | hero readout ✔ | aria-live + final grid ✔ |
| compute-ppv | 1/2 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| ten-heads | 1024/2023 (GB p.38) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| base-rate-sweep | 1/2, 11/12, 33/34 (PMC3055966) ✔ engine | type ×3 ✔ | triple ✔ | ✔ |
| triangulate-half | 1/2 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 19/118 (Downey) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED**: ≥1 primer ✔ (`name-base-rate`); `prediction` `byOption` ✔; `interviewNote` ✔ (`compute-ppv`); first graded beat = `retrievalGrid` opener ✔; no `introducesSymbol` ⇒ notation-ladder satisfied.
- **MASTERY_LESSONS**: last = `recap` ✔; penult = required `masteryChallenge`, **no `pattern`** ✔.
- **bayesUpdate cross-check**: `explore-frequencies` declares `posterior:"1/2"` (tree; checked via `bayesPosterior(priors,likelihoods)[0]`, and the display fills from `naturalFrequencies`).
