# Interaction Spec: Reading Evidence Backwards  (lesson-bayes-rule-7)

> Department 2 (Interactive Experience / Design). Grounded in `src/content/schema.ts`, the dispatcher, and
> the reuse renderers. The frozen `bayesUpdate` type, engine, the n-hypothesis `bars` delta, and
> validate-fixtures edits live in `../wave0-contracts.md` (§9). This spec maps every Dept-1 beat to a real
> interaction type and supplies the per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-direction'`, `unlocks:'lesson-bayes-rule-8'`, `schemaVersion:1`. Glyph `H|E`, viz `twoNode`.
>
> **This lesson stays 2-hypothesis** (n = 2) and needs **no n > 2 rendering**. But its prior is *tiny*
> (1/10001), which the 2-hypothesis drag-slider (integer percent) cannot represent — so `explore-pool`
> uses the wave0 §9 **direct render** (`interactive:false`, posterior straight from
> `bayesPosterior(priors, likelihoods)`), the same code path that draws the n > 2 bars. This is exactly
> *why* the §9 direct path is gated on `interactive === false` as well as `n > 2`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / extend | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|----------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-base-rate` | Tap left → pick match → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick a chance-of-innocence chip → per-option note → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | radio ≥44px; `aria-live` note | none | both |
| 3 | `name-the-direction` | Expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `explore-pool` | Watch P(source \| match) settle at 100/101 — high, but not one-in-a-million (2 bars, fixed) | `bayesUpdate` `display:'bars'` **n=2** | reuse (direct, `interactive:false`) | `display`,`hypotheses` (×2),`priors` (×2 = [1/10001,10000/10001]),`likelihoods` (×2 = [1,1/1000000]),`evidence`,`interactive:false`,`posterior:"100/101"` + beat-level `hero` | two labeled bars (focal "Is the source" tiny prior → 100/101 posterior); visually-hidden `aria-live` mirrors both posteriors; reduced-motion → final settled bars | DOM bars, CSS width transition; slow-first per `hero.slowFirst` | both |
| 5 | `flip-the-conditional` | Type P(innocent \| match) then P(source \| match) → Check | `answerEntry` | reuse | `fields:[…×2]` | two inputs ≥44px; Enter; `aria-live` | none | both |
| 6 | `cold-vs-cause` | Type the posterior under two priors (cold hit vs probable cause) → Check | `answerEntry` | reuse | `fields:[…×2]` + beat-level `interviewNote` | two inputs ≥44px; `aria-live` | none | both |
| 7 | `name-the-fallacy` | Match each costume to the backward read it hides → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `triangulate-100-101` | Reveal three lenses → converge on 100/101 | `tripletReveal` | reuse | `value:'100/101'`, `lenses:[{label,body}]`, `display:'cards'` | cards ≥44px; `aria-live` | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(source \| match) for a **million-person** database trawl → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- **Beat 4 `explore-pool`: kept `display:'bars'` (n = 2), but `interactive:false` instead of a live
  pool-size drag.** Rationale (surgical, no new renderer work):
  - The brief wants "drag the suspect-pool size; watch P(source\|match) slide." The 2-hypothesis bars
    slider drags the **prior as an integer percent (0–100)** — it cannot represent the lesson's interesting
    priors (1/10001 ≈ 0.01%, 1/1,000,001 ≈ 0.0001%), which all round to 0%. A live drag here is
    impossible **without a new (log-scale / pool-count) slider**, which is out of scope (the only new build
    item is the n > 2 generalization).
  - Setting `interactive:false` routes the beat through the wave0 §9 **direct path**, which computes the
    posterior straight from `bayesPosterior(priors, likelihoods)` — so the hero renders the **exact**
    100/101 from the tiny declared prior (the integer-percent slider would otherwise quantize 1/10001 → 0%
    and wrongly show a 0 posterior). The "pool is the hidden lever" intuition is delivered as discrete
    comparison in the graded `cold-vs-cause` (two priors → two posteriors) and the `mastery-challenge`
    (a million-person trawl → 1/2).
  - L7 still "renders identically" to a 2-hypothesis bars beat (two bars); only the *source* of the bar
    widths changes (exact engine output vs. the quantized slider).
- No other remaps. `flip-the-conditional`/`cold-vs-cause`/`mastery-challenge` reuse
  `answerEntry`/`masteryChallenge`; `name-the-fallacy` reuses `retrievalGrid`; the opener reuses `retrievalGrid`.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics: `hints[0]`=gentle, `hints[1]`=misconception refutation, `hints[2]`=revealed answer ("Try again"
resets). `required` graded beats that reach reveal report `needsReview`.

**1 · `recall-base-rate`** — `correct` + `hints[3]`
- correct: "P(positive \| sick) is how good the test is; P(sick \| positive) is what you actually want — and they're different. Same swap is the whole of today's lesson."
- hints: `["From L2: a 99% test on a 1% disease still left you at 50%.", "One side describes the evidence (forward); one is the belief you want (backward).", "Accuracy of the evidence ≠ probability of the hypothesis."]`
- pairs: `"P(positive | sick) = 99%"→"how good the test is (forward)"`, `"P(sick | positive) = 50%"→"how likely you're sick (backward)"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"About 1 in a million — the match is that rare"` → `{note:"That's P(match | innocent) read backward. With 10,000 other innocents who could match by chance, the odds are 100:1 → he's the source 100/101, innocent only 1/101.", correct:false}`
- `"You can't tell without the size of the suspect pool"` → `{note:"Exactly — the pool is the hidden prior. A pool of 10,001 possible sources puts him at 100/101, not 999,999/1,000,000.", correct:true}`
- `"Basically certain he's guilty"` → `{note:"Strong, but not one-in-a-million-certain. The cold-hit pool leaves a real 1/101 chance he's innocent.", correct:false}`
- hints: `["No wrong guess — we'll flip the conditional.", "1-in-a-million is P(match | innocent), not P(innocent | match).", "Pool of 10,001 → odds 100:1 → 100/101."]`

**3 · `name-the-direction`** (primer; copy = caption/aria)
- correct: "P(E\|H) reads **forward** (evidence given a hypothesis); P(H\|E) reads **backward** (hypothesis given the evidence). They are different numbers."
- hints: `["The conditional bar | has a direction.", "'1 in a million innocents match' is forward; 'he's innocent with prob 1 in a million' is backward.", "Bayes is the machine that flips forward into backward — using the prior."]`
- title: "Forward vs backward" · body: "P(evidence | hypothesis) is **not** P(hypothesis | evidence). 'One in a million **innocents** match' (forward) is not 'one in a million chance he's **innocent**' (backward). To flip the arrow you need Bayes — and the **prior** (here, the size of the suspect pool you searched)."

**4 · `explore-pool`** (ungraded hero; copy = aria/caption)
- correct: "One true source plus about one coincidental match among 10,000 innocents → odds 100:1 → P(source) = 100/101 ≈ 99%. Strong evidence — but a thousandfold weaker than 'one in a million.'"
- hints: `["The match is near-certain for the true source and one-in-a-million for each innocent.", "But there are ~10,000 innocents, so ~1/100 of a coincidental match is expected.", "1 true vs 1/100 false → 100:1 → 100/101."]`
- `hero.structuralReadout`: "1 true source vs ~1/100 expected false matches among 10,000 innocents → odds 100:1 → 100/101."

**5 · `flip-the-conditional`** — graded `correct` + `hints[3]`
- correct: "From the pool: P(innocent \| match) = 1/101, so P(source \| match) = **100/101**. The 1-in-a-million was P(match \| innocent) — the *forward* number; flipping it through the pool lands at 1/101 backward."
- hints: `["Among ~101 expected matches (1 true + ~100 coincidental over the whole pool), how many are innocent?", "About 1 of every 101 matches is innocent → P(innocent | match) = 1/101.", "1/101 and 100/101."]`
- fields: `{id:"innocent", label:"P(innocent | match)", accept:["1/101"]}`, `{id:"source", label:"P(he is the source | match)", accept:["100/101"]}`

**6 · `cold-vs-cause`** — graded `correct` + `hints[3]`
- correct: "Same 1-in-a-million match, two priors: a **cold hit** (1 of 10,001) → **100/101**; **probable cause** first (prior 1/2) → **1,000,000/1,000,001 ≈ 1**. The match's probative value is set by the prior, not the match alone."
- hints: `["The likelihood ratio (1,000,000) is identical in both — only the prior odds differ.", "Cold hit: prior odds 1:10,000 × 1,000,000 = 100:1. Probable cause: 1:1 × 1,000,000 = 1,000,000:1.", "100/101 and 1,000,000/1,000,001."]`
- fields: `{id:"cold", label:"Cold hit (1 of 10,001): P(source | match)", accept:["100/101"]}`, `{id:"cause", label:"Probable cause (prior 1/2): P(source | match)", accept:["1000000/1000001"]}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L7): "The prosecutor's fallacy / cold-hit DNA is a canonical quant/stats interview question (interview pack `showcase-prosecutors-fallacy`). The clean frame is odds: posterior odds = prior odds × likelihood ratio. The match's LR (1,000,000) never changes; the **searched pool is the prior**, and it alone decides whether the hit means 100/101 or 1/2."

**7 · `name-the-fallacy`** — graded `correct` + `hints[3]` (the interleave)
- correct: "Same backward read in three costumes — DNA, medicine, weather. Each confuses P(E\|H) with P(H\|E)."
- hints: `["Each statement quotes a forward conditional as if it were the backward one.", "Match by which arrow is given vs which is claimed.", "DNA: P(match|innocent); medical: P(+|sick); weather: P(rain|clouds) — none is its flip."]`
- pairs: `"DNA: 1-in-a-million match"→"P(match | innocent), not P(innocent | match)"`, `"Medical (L2): 99% test"→"P(positive | sick), not P(sick | positive)"`, `"Weather: P(rain | clouds)"→"not the same as P(clouds | rain)"`

**8 · `triangulate-100-101`** (ungraded reveal)
- correct: "The Bayes formula, the odds ratio, and the 'blow the pool up ×100' picture all give **100/101** — not a rounding of one-in-a-million."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 100/101."]`
- lenses: `{label:"Formula", body:"(1/10001·1) / (1/10001·1 + 10000/10001·1/1,000,000) = (1)/(1 + 1/100)"}`, `{label:"Odds", body:"prior odds 1:10,000 × likelihood ratio 1,000,000 = 100:1 → 100/101"}`, `{label:"Pool ×100", body:"Among ~101 expected matches in the pool, 100 are the (one) true source's vs ~1 innocent → 100/101"}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "Trawl a **1,000,001-person** database with a 1/1,000,000 profile: about 1 true source vs ~1 coincidental match → odds 1:1 → **1/2**. A *bigger* search makes a cold hit **weaker**, not stronger — more innocents means more chances to match."
- hints: `["More people searched = more expected coincidental matches.", "Pool 1,000,001: prior odds 1:1,000,000 × LR 1,000,000 = 1:1.", "1/2."]`
- scenario: "A cold hit found by trawling a **database of 1,000,001 people**; the same 1-in-1,000,000 random-match profile." · field: `{id:"milliondb", label:"P(he is the source | match)", accept:["1/2"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "P(E\|H) ≠ P(H\|E): the conditional points one way. Flip it with Bayes — and restore the prior (the pool) you forgot."
- hints: `["'1 in a million innocents match' is not '1 in a million chance he's innocent' → 100/101.", "The match's LR is fixed; the searched pool is the prior that sets its meaning.", "Next up: spotting base-rate neglect in the wild — name the base rate, then update."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-base-rate | n/a (recall of L2) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 100/101 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-the-direction | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-pool | 100/101 ✔ engine (`bayesPosterior`, n=2, tiny prior) | watch 2-bar resolve ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| flip-the-conditional | 1/101 & 100/101 (Prosecutor's fallacy) ✔ engine | type ×2 ✔ | triple ✔ | ✔ |
| cold-vs-cause | 100/101 & 1,000,000/1,000,001 ✔ engine | type ×2 ✔ | triple ✔ | ✔ |
| name-the-fallacy | n/a (interleave) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| triangulate-100-101 | 100/101 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 1/2 (database cold hit) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-7`): ≥1 primer ✔ (`name-the-direction`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`cold-vs-cause`); first graded beat is the `retrievalGrid` opener ✔ (`recall-base-rate`); no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied.
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (1/2 is a Bayes fraction, not a hitting-time).
- **bayesUpdate cross-check**: `explore-pool` declares `posterior:"100/101"`; the validator recomputes `bayesPosterior(priors, likelihoods)[0]` with `priors=[1/10001,10000/10001]`, `likelihoods=[1,1/1000000]` (focal = `hypotheses[0]` = Is the source) → 100/101. n = 2, the existing path — no validator change. The cross-check uses the **declared** rationals (not the slider), so it is unaffected by the `interactive:false` render.
