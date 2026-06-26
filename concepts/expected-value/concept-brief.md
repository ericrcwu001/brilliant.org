# Concept: Expected Value  (course-expected-value)

## Green Book anchor
- Expected value `E[X]=Σ x·P(x)` (discrete) — Green Book §4.4–4.5 *Discrete & Continuous Distributions / Expected value*, p.44 (Table 4.2 "Probability mass function, expected value and variance of discrete random variables"); the continuous analogue `E[X]=∫ x f(x) dx` is the same page's continuous table, with a worked integral example `E[X|X>0]=√(2/π)` for `X~N(0,1)` at p.21 (**irrational — used conceptually only, never as a graded answer**). The single definition every lesson rests on.
- Fair-die expectation `E = 7/2 = 3.5` — Green Book p.62 ("a simple dice game with one roll … 1, 2, 3, 4, 5, 6 each have 1/6 probability and your expected payoff [is] $3.5"); a clean exact-rational toy for L1's first graded `Σ x·P(x)` (GB-sourced, embedded in the p.62 DP dice game).
- Linearity of expectation `E[X+Y]=E[X]+E[Y]` — Green Book §4.5 *Sum of random variables*, p.47 ("holds whether or not [the variables] are independent of each other"); demonstrated by **connecting noodles**, p.47–48: `E[loops]=Σ_{k=1}^{n} 1/(2k−1)` (n=1→`1`, n=2→`4/3`, n=3→`23/15`), and by **first-ace**, p.48 (`E = 1 + 48·(1/5) = 53/5 = 10.6`).
- Indicator variables `E[1_A]=P(A)` — Green Book §2.7, p.31 (the "indicator variable (a binary dummy)" definition: a `0/1` variable whose mean is the event's probability); the linchpin trick that turns a count into `1 + Σ E[I_i]` (first-ace `53/5`, p.48) and a coupon part-B `E[distinct]=N(1−((N−1)/N)^m)` (p.49–50).
- Conditional & total expectation `E[X]=Σ E[X|case]P(case)` — Green Book §4.5 *Conditional expectation*, p.47 ("Law of total expectation"); the **dice game**, p.48, conditions on the first roll — `E[X] = ½·2 + ½·(5 + E[X]) ⟹ E[X] = 7` — which is exactly PHT's first-step recurrence, generalized.
- Coupon collector `E[full set]=N·H_N` — Green Book §4.5 *Coupon collection*, p.49–50 (each new type is a geometric wait with success `p=(N−i+1)/N`, so `E[X_i]=N/(N−i+1)`; summed ⇒ `N·H_N`); `N=6 ⇒ 6·(49/20) = 147/10 = 14.7` (exact rational).
- Order statistics & extremes — Green Book §4.6 *Order Statistics / Expected value of max and min*, p.50–51: for `n` IID Uniform(0,1), `E[max]=n/(n+1)` and `E[min]=1/(n+1)`; the **ants-on-a-string** finale, p.52, uses the relabel trick (collisions = passing-through) to collapse the answer to `E[time]=E[max of n U(0,1)]=n/(n+1)` (n=500 → `500/501`).
- **Out of scope / absent** — the *St. Petersburg paradox* is **NOT in the Green Book** (verified absent; do NOT build — see the ⚠️ row below). *Variance* appears only as a definition in the p.44 table (no worked problem) ⇒ at most a 1-beat forward-teaser to the future Variance / Covariance concept; not built here. *Kelly / risk-of-ruin* already lives in PHT `lesson-gamblers-ruin` ⇒ referenced, not rebuilt.

## One-line promise
Every "what's it worth on average?" question is the same move — list the outcomes, weight each by its probability, and add (`E[X]=Σ x·P(x)`) — then wield two superpowers: **linearity** (expectations of a sum always add, dependent or not) and **conditioning** (average the averages over the first step) to value bets far too tangled to ever simulate.

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)
- **domain:** Probability
- **domainOrder:** 0
- **order:** 1
- **status:** `live`
- **tagline:** What do you gain, on average, each play?
- **accent:** `ch4`
- **vizKey:** `sum`
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-expected-value-1 | The Weighted Average | ch4 | [lesson-expected-value-1, lesson-expected-value-2] |
| ch-expected-value-2 | The Expectation Toolkit | ch1 | [lesson-expected-value-3, lesson-expected-value-4] |
| ch-expected-value-3 | Expectation in Action | ch2 | [lesson-expected-value-5, lesson-expected-value-6] |

## Lessons (ordered)
| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-expected-value-1 | What is Expected Value? | `E[X]=Σ x·P(x)` — the weighted average / fair price of a bet (fair die `= 7/2`). | — | E[X] | sum | GB p.44, p.62 (p.21 mention) |
| L2 | lesson-expected-value-2 | Linearity of Expectation | `E[X+Y]=E[X]+E[Y]`, dependent or not — sum a tangle of bets one at a time. | L1 | Σ | sum | GB p.47–48 |
| L3 | lesson-expected-value-3 | Indicator Variables | `E[1_A]=P(A)`; count an expectation as `1 + Σ E[I_i]`. | L2 | 𝟙ₐ | dice | GB p.31, p.48, p.50 |
| L4 | lesson-expected-value-4 | Conditional & Total Expectation | `E[X]=Σ E[X\|case]P(case)`; condition on the first step. | L1 | E[X\|Y] | twoNode | GB p.47–48 |
| L5 | lesson-expected-value-5 | Coupon Collector | `E[full set]=N·H_N` from a sum of geometric waits (`N=6 ⇒ 14.7`). | L2, L3 | N·Hₙ | sum | GB p.49–50 |
| L6 | lesson-expected-value-6 | Order Statistics & Extremes | `E[max]=n/(n+1)`, `E[min]=1/(n+1)`; ants-on-a-string. | L1 | E[max] | raceLanes | GB p.50–52 |

> ⚠️ **St. Petersburg paradox — NEEDS-WEB-SOURCE (Manager)** if ever revived as enrichment: it is **absent from the Green Book** (verified). Omitted from the arc above; do NOT build it from an uncited source.

## New engine(s) / widget(s) anticipated (for Wave 0)
- engine: `src/engine/expectation.ts` — pure, dependency-free, **exact rational only** (reuses the existing `Rational` type in `src/engine/types.ts` and the `reduce / toRational / ratAdd / ratSub / ratMul / ratDiv` helpers + `solveLinearSystem` in `src/engine/automaton.ts` — no floats, matching the probability / KMP engine discipline):
  - `expectedValue(pmf: { x: Rational; p: Rational }[]) → Rational` — the core `Σ x·P(x)` (fair die `7/2`, GB p.62).
  - `totalExpectation(cases: { p: Rational; value: Rational }[]) → Rational` — `Σ E[X|case]P(case)` (GB p.47); the **self-referential** dice game `½·2 + ½·(5 + E[X]) = 7` (GB p.48) solved by reusing `solveLinearSystem` (the same util PHT's first-step equations use).
  - `indicatorExpectation(p: Rational) → Rational` — `E[1_A]=P(A)` (GB p.31), the building block for `1 + Σ E[I_i]` (first-ace `53/5`, GB p.48).
  - `harmonic(n) → Rational` and `couponCollector(n) = n·H_n → Rational` — `N=6 ⇒ 147/10` (GB p.49–50).
  - `distinctAfterDraws(N, m) → Rational` — coupon part B `N(1 − ((N−1)/N)^m)` (GB p.50).
  - `orderStatUniform(n) → { max: Rational; min: Rational }` — `{ n/(n+1), 1/(n+1) }` (GB p.50–51); ants `n=500 ⇒ 500/501` (GB p.52).
  - `noodleLoops(n) → Rational` — `Σ_{k=1}^{n} 1/(2k−1)` (n=2→`4/3`, n=3→`23/15`, GB p.47–48), the linearity demo.
  - two-stage fact-check goldens (engine ⇄ source): `7/2`, `53/5`, `7`, `4/3`, `23/15`, `147/10`, `500/501`.
- interaction type(s):
  - `expectationScale` — **NEW**: a weighted-average balance beam; drag each outcome's weight `P(x)` onto the beam and the fulcrum slides to `E[X]=Σ x·P(x)`, making "the balance point of the distribution" physical (L1).
  - `conditionalTree` / `caseBranch` — **NEW**: expand a one-step case tree; each branch carries `P(case)` and `E[X|case]`, and the root recombines them as `Σ E[X|case]P(case)` — including the self-referential dice-game loop (L4).
  - `couponCollectorSim` — **NEW**: draw boxes until the set is complete; a live `Σ N/(N−i+1)` panel converges to `N·H_N` as the per-stage `(N−k)/N` hit-probability shrinks (L5).
  - reuse: `prediction` / `primer` / `answerEntry` / `retrievalGrid` / `masteryChallenge` / `theorySimChart`, plus a raceLanes-style sim for the ants finale (L6).
