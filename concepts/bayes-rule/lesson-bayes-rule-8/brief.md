# Lesson Brief: Base Rates in the Wild  (lesson-bayes-rule-8)

## Hook  (the bet)

"A hit-and-run at night. A witness — tested to be **80% reliable** in the dark — swears the cab was
**blue**. Case closed? Except **85% of the city's cabs are green**. So how sure should the jury be the
cab was blue — 80%, or something the human brain almost never guesses?"

## Core promise (one idea)

Real judgments **hide the base rate** — the number you have to go look up. *Name the base rate, then
update.* Once you weigh the witness's 80% against the 15% prior, "blue" is only **12/29 ≈ 41%** — under
half. Same move tames spam filters, fraud models, and medical screens. (Concept capstone — interleaved.)

## Display fields

- **glyphKey:** `12/29`
- **vizKey:** `coin`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| 85% green / 15% blue cabs; witness 80% reliable; says **blue**. P(actually blue)? | **12/29 (≈ 41%)** | Tversky & Kahneman, taxicab base-rate problem; en.wikipedia.org/wiki/Base_rate_fallacy; interview pack `showcase-taxicab` (#34) | ☑ engine ☑ source |
| Natural-frequency view: of 100 cabs, witness calls "blue" 12 truly-blue + 17 falsely → 12/29. | **12/29** | same (Gigerenzer natural-frequency rendering) | ☑ engine ☑ source |
| Spam filter: 20% of mail is spam, 99% recall, 2% false-positive rate; flagged. P(spam)? | **99/107** | en.wikipedia.org/wiki/Base_rate_fallacy (spam/precision); interview pack `spam-precision` (#7) | ☑ engine ☑ source |
| **Callback (interleave L2):** 1% disease, 99% sensitive/99% specific, positive. P(sick)? | **1/2** | quantblueprint.com/glossary/bayes-theorem; interview pack `screening-ppv` (#1) | ☑ engine ☑ source |
| **Mastery (transfer):** fraud model 95% recall, 1% false-positive rate, 1-in-1000 fraud; flagged. P(fraud)? | **95/1094 (≈ 8.7%)** | en.wikipedia.org/wiki/Base_rate_fallacy (precision under class imbalance); interview pack `spam-precision` (brutal #1) | ☑ engine ☑ source |

> Exact-rational check (`bayesUpdate`, **all confirmed**): taxicab = `bayesUpdate(15/100, 80/100, 20/100)`
> = (0.12)/((0.12)+(0.17)) = **12/29**; spam = `bayesUpdate(20/100, 99/100, 2/100)` = 198/214 = **99/107**;
> disease = `bayesUpdate(1/100, 99/100, 1/100)` = **1/2** (the L2 anchor, re-surfaced); fraud =
> `bayesUpdate(1/1000, 95/100, 1/100)` = 95/(95+999) = **95/1094**. Natural-frequency taxicab (100 cabs):
> 12 true-blue calls vs 17 false-blue calls → 12/29.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-direction` | Recall L7/L2: "P(E\|H) ≠ P(H\|E)" + "a rare prior swamps strong evidence" (the early win) | retrieval bridge from L7 (+L2) | "the witness's reliability IS the answer" | yes (easy) | both |
| 2 | `open-bet` | Commit a chance-it-was-blue to the 80% witness | surfaces base-rate neglect | "80% reliable ⇒ 80% it was blue" | no (`byOption`) | both |
| 3 | `name-base-rate-wild` | Contrast "the number they hand you" (reliability) vs "the number you look up" (base rate) | the hidden prior, named | — (JIT primer, `comparison`) | no | A |
| 4 | `explore-cabs` | Drag the green/blue mix on a 100-cab array; watch false "blue" calls swamp true ones | base-rate neglect, made visible | "false IDs are negligible" | no (hero) | both |
| 5 | `compute-taxicab` | Assemble 12 true / (12 + 17) → 12/29 | the posterior as a frequency ratio | "more 'blue' calls are right than wrong" | yes | both |
| 6 | `spam-costume` | Same move, ML costume: 20% spam, 99% recall, 2% FPR → precision 99/107 | one rule, new domain | "a 99%-recall filter is 99% precise" | yes | both |
| 7 | `spot-the-base-rate` | Interleaved capstone: unlabeled scenarios (disease, cab, spam, coin) → tag base rate + likelihood, pick the move | transfer across the whole concept | "each domain needs its own rule" | yes | both |
| 8 | `triangulate-12-29` | Three lenses (formula / 12-vs-17 frequency / odds 15:85 × 4 = 60:85) → 12/29 | robustness of 12/29 | "12/29 is a quirk of these numbers" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** fraud model flag → 95/1094 | transfer to a dramatic class imbalance | "a great-sounding model ⇒ a flag is probably right" | yes | both |
| 10 | `recap` | Concept capstone recap: name the base rate, then update | consolidate the through-line | — | no | both |

Notes: `explore-cabs` reuses the `bayesUpdate` type `display: 'tree'` with `population: 100` (the
natural-frequency confusion array from L2, in a new costume) and carries the `hero` block;
`compute-taxicab`, `spam-costume`, `mastery-challenge` reuse `answerEntry`/`masteryChallenge`;
`spot-the-base-rate` reuses `retrievalGrid` as the concept's **interleaved mixed-review checkpoint**
(modeled on `lesson-states-streaks`); `name-base-rate-wild` reuses `primer` with `comparison: true`;
`triangulate-12-29` reuses `tripletReveal`; opener reuses `retrievalGrid`. Put one `interviewNote` on
`spam-costume` ("PPV / precision under class imbalance — the canonical ML/quant base-rate question —
`spam-precision`; the taxicab is its psychology classic — `showcase-taxicab`"). No n>2 rendering required.

## Misconceptions (Specialist)

- **"The witness is 80% reliable, so it's 80% likely the cab was blue" (base-rate neglect).** Fires at
  `open-bet`/`explore-cabs`. Refutation (`byOption`): *"Of 100 cabs the witness calls 'blue' on 12 of the
  15 blue ones **and** on 17 of the 85 green ones — 29 calls, only 12 correct → **12/29 ≈ 41%**, under
  half. 80% is P(says blue | blue), not P(blue | says blue)."*
- **"The base rate is background — once you have a witness/test it drops out."** Fires at `explore-cabs`.
  Refutation: *"Hold the witness at 80% and move only the cab mix — the answer tracks it. The prior is a
  live factor (just like L2)."*
- **"A 99%-recall spam/fraud model that flags you ⇒ you're probably the positive class."** Fires at
  `spam-costume`/`mastery-challenge`. Refutation: *"With 1-in-1000 fraud, a 1% false-alarm rate over 999
  honest transactions drowns the true ones → only **95/1094 ≈ 9%**. Recall isn't precision."*
- **"Courts, inboxes, and clinics each need their own rule."** Fires at `spot-the-base-rate`. Refutation:
  *"Same rule everywhere — name the base rate, weight the evidence by how well each hypothesis predicted
  it, renormalize. Only the costume changes."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-direction` — recalls **L7** (P(E|H) ≠ P(H|E)) and **L2** (a rare prior
  swamps strong evidence) (Continuity Report: L7 + L2 → L8 opener), set up as "now spot it in the wild."
- **guaranteed early win:** `recall-direction` (graded recall, not the taxicab computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — fraud-model precision →
  **95/1094**; a dramatic class-imbalance transfer (the modern base-rate trap).
- **spacing/interleaving:** `spot-the-base-rate` is the **concept's interleaved capstone** — unlabeled,
  mixed costumes (disease L2 / cab / spam / coin) that force the learner to pick the move, modeled on
  `lesson-states-streaks`; `explore-cabs` reuses **L2's natural-frequency tree** in a new costume; the
  disease callback re-surfaces L2's 1/2 a chapter later (spaced review); exact-fraction posteriors (12/29,
  99/107, 1/2, 95/1094) **close** the corpus's fraction-fluency thread that began with PHT's 7/8 and i/N.
