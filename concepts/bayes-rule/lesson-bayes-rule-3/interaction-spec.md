# Interaction Spec: Stacking Evidence  (lesson-bayes-rule-3)

> Department 2. Grounded in `src/content/schema.ts` + the reuse renderers. Frozen `bayesUpdate` type, engine,
> and validate-fixtures edits in `../wave0-contracts.md`.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-stacking'`, `unlocks:null` (last lesson), `schemaVersion:1`. Glyph `2ᵏ`, viz `sum`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / NEW | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|-------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-base-rate` | Tap left → pick match → Check | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick chip → per-option note → Continue | `prediction` | reuse | `options` + `byOption` | radio ≥44px; `aria-live` | none | both |
| 3 | `posterior-is-prior` | Expand primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px | none | A |
| 4 | `due-vs-evidence` | Expand the contrast primer → Continue | `primer` | reuse | `variant:'gamblersFallacy'`, `title`, `body`, `collapsible:true` + beat-level `comparison:true` | disclosure ≥44px; static two-column body | none (tap-only) | both |
| 5 | `explore-sequence` | Flip the 1000-coin repeatedly → posterior bar climbs, snapping to the exact rational each step | `bayesUpdate` `display:'sequence'` | **NEW** | `display`,`hypotheses`,`priors`,`likelihoods`,`evidence`,`steps:10`,`interactive` + `hero` | "Flip" button ≥44px; visually-hidden `aria-live` announces each step's exact posterior; reduced-motion → final climbed frame (k=10) | DOM bar, CSS width transition per step; slow-first | both |
| 6 | `two-tests` | Type P(disease \| ++) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` + beat-level `interviewNote` | input ≥44px; Enter; `aria-live` | none | both |
| 7 | `coin-ladder` | Match k heads → posterior (2/3, 4/5, 8/9) → Check | `retrievalGrid` | reuse | `pairs:[…×3]` | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `triangulate-k10` | Reveal three lenses → converge on k = 10 | `tripletReveal` | reuse | `value:'k = 10'`, `lenses`, `display:'cards'` | cards ≥44px; `aria-live` | none | both |
| 9 | `mastery-challenge` | Type the smallest k with 2ᵏ > 999 → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields` — **no `pattern`** | input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal capstone recap | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 4 `due-vs-evidence`: brief said "reuses `primer` with `comparison:true`". Implemented as `primer`
  `variant:'gamblersFallacy'` (the named enum variant already exists in `schema.ts` for exactly the
  gambler's-fallacy interleave) with the beat-level `comparison:true` flag set. **Renderer note:** `PrimerBeat`
  has no special demo for `gamblersFallacy` (its `PrimerDemo` returns `null`), and `comparison` is metadata
  the primer renderer does not read — so the contrast is delivered as a **two-sided prose body** + an authored
  `title` (no new widget). This is the surgical choice (the single new-type budget is spent on `bayesUpdate`).
- Beat 5 `explore-sequence` uses `bayesUpdate` `display:'sequence'`, matching the brief. `steps:10` climbs
  k=1…10 (2/1001 → … → 1024/2023); the renderer snaps to the exact rational from `sequentialPosterior` each step.
- No other remaps. `coin-ladder` is the graded `retrievalGrid` (k→posterior), `two-tests`/`mastery-challenge`
  reuse `answerEntry`/`masteryChallenge`, `triangulate-k10` reuses `tripletReveal`.

## Feedback + hint ladders (actual copy)

**1 · `recall-base-rate`** — `correct`+`hints[3]`
- correct: "One positive left you at 50% because the base rate is the anchor. Now add a second clue."
- hints: `["From L2: a single 99% test on a 1% disease.", "One row is the headline number; one is the role of the prior.", "One test → 50%; base rate → the anchor evidence must overcome."]`
- pairs: `"One 99% test, 1% disease"→"Only 50%"`, `"The base rate"→"What evidence must overcome"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"Still about 50% — a re-test just confirms"` → `{note:"Independent evidence multiplies, it doesn't merely re-confirm.", correct:false}`
- `"Around 75%"` → `{note:"That averages the two 50%s. Bayes multiplies the odds instead.", correct:false}`
- `"Much higher — near 99%"` → `{note:"Right — each positive multiplies the odds by 99: 1 → 99 → 99%.", correct:true}`
- hints: `["No wrong guess — we'll multiply it out.", "Two 50%s don't average to 50%.", "Odds 1:1 × 99 = 99:1 → 99%."]`

**3 · `posterior-is-prior`** (primer)
- correct: "Chain it: today's posterior becomes tomorrow's prior; independent ⇒ multiply."
- hints: `["Carry yesterday's answer forward as today's prior.", "Independent evidence ⇒ multiply the likelihood ratios.", "posterior odds = prior odds × LR × LR."]`
- title: "Today's posterior is tomorrow's prior" · body: "After the first test, your 50% belief becomes the *prior* for the next test. If the tests are independent, their likelihood ratios multiply: posterior odds = prior odds × LR × LR."

**4 · `due-vs-evidence`** (primer `gamblersFallacy`, `comparison:true`)
- correct: "Never 'due' for the next flip; but the flips you've already seen still update *which coin* it is."
- hints: `["The gambler's fallacy is about the next outcome.", "Bayes is about which hypothesis you hold.", "Independent outcomes are exactly why their likelihoods multiply."]`
- title: "'Never due' vs 'each head is evidence'" · body: "Two different objects. **Given** the coin, the next flip is independent — you are never 'due' for a head. But the heads you've **already** seen update **which coin** you're holding. Independence of outcomes is exactly why their likelihoods multiply." (interleaves the gambler's-fallacy primer from `lesson-gamblers-ruin`.)

**5 · `explore-sequence`** (ungraded hero)
- correct: "Flip by flip the posterior climbs 2/1001 → 32/1031 → … → 1024/2023: big early jumps, then it crawls past 50% at the 10th head."
- hints: `["Flip repeatedly; each head multiplies the odds by 2.", "It's multiplicative in odds, not a fixed +amount in probability.", "After 10 heads: 1024/2023 — just over half."]`
- `hero.structuralReadout`: "Each head doubles the odds; it takes 10 straight heads (1024 vs 999) for the 1-in-1000 coin to pass 50%."

**6 · `two-tests`** — graded `correct`+`hints[3]`
- correct: "Odds 1:99 × 99 × 99 = 99:1 → **99/100**. Two independent positives multiply; they don't average."
- hints: `["Start at prior odds 1:99; each positive multiplies by its likelihood ratio 99.", "1/99 × 99 = 1 (=50%, the L2 anchor), then × 99 = 99.", "Odds 99:1 → 99/100."]`
- field: `{id:"p", label:"P(disease | two positive tests)", accept:["99/100"]}`
- `interviewNote` (satisfies GATED for L3): "Odds-form Bayes is the trader/quant mental model: stack independent evidence by multiplying likelihood ratios (equivalently, adding log-LRs). Two LR-99 positives on prior odds 1:99 give 99:1 → 99%."

**7 · `coin-ladder`** — graded `correct`+`hints[3]`
- correct: "The two-coin ladder is 2ᵏ/(2ᵏ+1): **2/3, 4/5, 8/9** — big early jumps, then diminishing (not a fixed +amount)."
- hints: `["Two coins (fair + two-headed); each head doubles the odds.", "k=1 → odds 2:1; k=2 → 4:1; k=3 → 8:1.", "2/3, 4/5, 8/9."]`
- pairs: `"1 head"→"2/3"`, `"2 heads"→"4/5"`, `"3 heads"→"8/9"`

**8 · `triangulate-k10`** (ungraded reveal)
- correct: "All three lenses cross 1/2 at exactly the **10th** head."
- hints: `["Reveal each lens.", "2^9 = 512 is still under 999.", "k = 10."]`
- lenses: `{label:"Odds doubling", body:"each head ×2; need odds > 1 ⇒ 2^k > 999"}`, `{label:"2^k vs 999", body:"2^9 = 512 < 999 < 1024 = 2^10"}`, `{label:"Formula", body:"2^k/(2^k+999) > 1/2 ⇔ 2^k > 999"}`

**9 · `mastery-challenge`** — graded `correct`+`hints[3]`
- correct: "Each head doubles the odds (×2), so you need 2ᵏ > 999 → **k = 10**. Strong evidence compounds fast."
- hints: `["You need the odds to pass 1:1, i.e. 2^k > 999.", "2^9 = 512 (too few); 2^10 = 1024 (enough).", "k = 10."]`
- scenario: "The 1-in-1000 double-headed coin keeps landing heads." · field: `{id:"k", label:"Smallest number of heads to make it more likely than not", accept:["10"], placeholder:"a whole number"}`

**10 · `recap`** (capstone)
- correct: "Independent evidence multiplies — today's posterior is tomorrow's prior — so posterior odds = prior odds × ∏ likelihood ratios."
- hints: `["Two independent positives: odds 1:99 → 1 → 99, i.e. 50% → 99%.", "Each head doubles the 1-in-1000 coin's odds; 10 heads to cross 50%.", "The whole concept in one line: posterior odds = prior odds × ∏ LRs."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y |
|--------|--------------------------|------------------------------|----------------------------------|------|
| recall-base-rate | n/a (recall of L2) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| open-bet | 99/100 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| posterior-is-prior | n/a primer ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| due-vs-evidence | n/a (interleave) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-sequence | 2ᵏ/(2ᵏ+999) → 1024/2023 (GB p.38) ✔ engine | repeated flip ✔ | hero readout ✔ | aria-live per step + final frame ✔ |
| two-tests | 99/100 (quantblueprint) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| coin-ladder | 2/3, 4/5, 8/9 ✔ engine | tap/drag match ✔ | triple ✔ | ✔ |
| triangulate-k10 | k=10 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | k=10 (2⁹<999<2¹⁰) ✔ engine | type integer ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED**: ≥1 primer ✔ (`posterior-is-prior`, `due-vs-evidence`); `prediction` `byOption` ✔; `interviewNote` ✔ (`two-tests`); first graded beat = `retrievalGrid` opener ✔; no `introducesSymbol` ⇒ notation-ladder satisfied. (The `gamblersFallacy` primer requirement in validate-fixtures is scoped to `id==='lesson-gamblers-ruin'`, so it does not apply here — but we use the variant anyway, which is valid.)
- **MASTERY_LESSONS**: last = `recap` ✔; penult = required `masteryChallenge`, **no `pattern`** ✔. (The answer `"10"` is an integer count, not a hitting-time, so the `buildAutomaton(pattern).E0` cross-check stays disabled by leaving `pattern` unset.)
- **bayesUpdate cross-check**: `explore-sequence` declares `posterior:"1024/2023"` at `steps:10` (checked via `sequentialPosterior(priors[0], likelihoods[0], likelihoods[1], steps)`).
