# Lesson Brief: The Base-Rate Trap  (lesson-bayes-rule-2)

## Hook  (the bet)

"A test is **99% accurate**. You take it for a disease that strikes **1 person in 100**, and it comes
back **positive**. How worried should you be — 99%? 95%? …or much lower?"

## Core promise (one idea)

When a hypothesis is **rare**, even very strong evidence can leave it **improbable** — because a low
prior (base rate) acts like a heavy anchor the evidence must overcome. In odds form:
**posterior odds = prior odds × likelihood ratio**, and a tiny prior odds can cancel a huge likelihood
ratio. (1-in-100 disease: prior odds 1/99 × likelihood ratio 99 = **even odds = 50%**.)

## Display fields

- **glyphKey:** `1%`
- **vizKey:** `coin`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Disease in **1%** of people; test **99% sensitive, 99% specific**; you test positive. P(disease \| +)? | **1/2 (50%)** | https://www.quantblueprint.com/glossary/bayes-theorem and https://nishchalnishant.gitbook.io/artificial-intelligence/07-interview-prep/canonical-stats-questions (both state 50%) | ☐ engine ☑ source |
| 1000 coins, 1 is double-headed (999 fair); pick one at random, toss it and get **10 heads in a row**. P(double-headed \| 10 H)? | **1024/2023 ≈ 0.506** | Green Book p.38 §"Conditional Probability and Bayes' Formula" ("Unfair coin"), via Bayes' theorem | ☐ engine ☑ source |
| Same 99%/99% test at **10%** prevalence. P(disease \| +)? | **11/12 ≈ 91.7%** | PMC3055966 (post-test probabilities table: 10% → 91.7%) | ☐ engine ☑ source |
| Same 99%/99% test at **25%** prevalence. P(disease \| +)? | **33/34 ≈ 97.1%** | PMC3055966 (25% → 97.1%) | ☐ engine ☑ source |
| **Mastery (transfer):** **95%-accurate** test (95% sens, 95% spec), **1%** prevalence, positive. P(disease \| +)? | **19/118 ≈ 16%** | https://allendowney.github.io/BiteSizeBayes/05_test.html (Bayesville, ~16%) | ☐ engine ☑ source |

> Exact-rational check (Stage 2, `bayes.ts`): disease 1% = (0.99·0.01)/(0.99·0.01 + 0.01·0.99) =
> 99/198 = **1/2**; 10% = 99/108 = **11/12**; 25% = 2475/2550 = **33/34**; 95%-acc/1% =
> 95/590 = **19/118**. 1000-coins: (1·1/1000) / (1·1/1000 + (1/2)¹⁰·999/1000) = 1 / (1 + 999/1024) =
> **1024/2023**. All exact rationals (the disease decimals come from rational inputs).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-update` | Recall L1: "evidence rescales the prior" (the early win) | retrieval bridge from L1 | "the prior doesn't really matter" | yes (easy) | both |
| 2 | `open-bet` | Commit a gut answer to the 99%-test bet | surfaces base-rate neglect | "99% test ⇒ 99% sick" | no (`byOption`) | both |
| 3 | `name-base-rate` | Name "base rate / prior" just-in-time | vocabulary before the trap | — (JIT primer) | no | A |
| 4 | `explore-frequencies` | Drag prevalence on a 10,000-person array; watch false positives swamp true positives | the trap, made visible (natural frequencies) | "false positives are negligible" | no (hero) | both |
| 5 | `compute-ppv` | Read off 99 TP / (99 TP + 99 FP) = 1/2 | the posterior as a frequency ratio | "more positives are sick than healthy" | yes | both |
| 6 | `ten-heads` | GB 1000-coins: predict, then reveal P(unfair \| 10 H) = 1024/2023 | a rare prior barely yields to 10 H | "10 heads in a row ⇒ surely the trick coin" | yes | both |
| 7 | `base-rate-sweep` | Slide prevalence 1% → 10% → 25%; posterior climbs 1/2 → 11/12 → 33/34 | the prior is the dial, not the test | "only the test accuracy sets the answer" | yes | both |
| 8 | `triangulate-half` | Three lenses (frequencies / odds 1/99×99=1 / formula) all give 50% | why exactly half | "50% is a coincidence of the numbers" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** 95% test, 1% disease → ~16% (19/118) | transfer to new accuracy | "a weaker test changes the story qualitatively, not quantitatively" | yes | both |
| 10 | `recap` | Retrieval-first recap: rare hypothesis + strong evidence | consolidate base-rate trap | — | no | both |

Notes: `explore-frequencies` uses the new `bayesUpdate` type `display: 'tree'` (natural-frequency icon
array / confusion split) and carries the `hero` block; `base-rate-sweep` reuses `slider`; `ten-heads`,
`compute-ppv`, `mastery-challenge` reuse `answerEntry`/`masteryChallenge`; `triangulate-half` reuses
`tripletReveal`; opener reuses `retrievalGrid`. Include one `interviewNote` (base-rate fallacy / PPV is
the canonical screening + ML-class-imbalance interview question).

## Misconceptions (Specialist)

- **"99% accurate test ⇒ 99% chance I'm sick" (base-rate neglect).** Fires at `open-bet`. Refutation
  (`byOption`): *"You're reading P(positive | sick) = 99% as if it were P(sick | positive). With only
  1 in 100 sick, the 99 false alarms from the healthy 99% exactly match the 99 true positives → 50%."*
- **"False positives are rare, so they're negligible."** Fires at `explore-frequencies`. Refutation:
  *"Rare per person (1%), but applied to the huge healthy majority (9,900 people) they produce 99
  positives — as many as all the sick people combined."*
- **"10 straight heads must be the trick coin."** Fires at `ten-heads`. Refutation: *"10 heads is 1024×
  better evidence for the trick coin — but it started 999× less likely. 1024 vs 999 → 1024/2023, barely
  past 50%. (It takes the 10th head just to cross even.)"*
- **"Only the test's accuracy matters; the prevalence is background."** Fires at `base-rate-sweep`.
  Refutation: *"Hold the test fixed at 99% and only move the base rate: 1% → 50%, 10% → 92%, 25% → 97%.
  The prior is the dial."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-update` — recalls L1's *posterior ∝ prior × likelihood* (Continuity
  Report: L1 headline → L2 opener), specifically that the prior is a live factor.
- **guaranteed early win:** `recall-update` (graded recall of L1, not a base-rate computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — 95%-accurate test on the same
  1% disease → **19/118 ≈ 16%** (Downey), a clean transfer to a new accuracy.
- **spacing/interleaving:** the GB 1000-coins (`ten-heads`) interleaves the medical framing with the
  coin world of the corpus (same Bayes math, different costume) and **seeds L3's sequential view** of the
  very same coin; base rate / prior odds introduced here re-surface in L3 as what likelihood ratios must
  overcome. Exact-fraction posteriors (1/2, 11/12, 33/34, 1024/2023, 19/118) continue the corpus's
  fraction fluency.
