# Continuity Report — concept-expected-value

## Existing corpus surveyed
- shipped (main + prod `brilliant-org`) — 7 live lessons under `course-pattern-hitting-times` (domain: Probability); these teach *waiting times / Markov*, NOT averaging — but the learner has already **computed expected values by example**:
  - `lesson-first-heads` — flip until the first H; the geometric warm-up `E[H] = 2`.
  - `lesson-pattern-hitting-times` — flagship: `E[HH] = 6` vs `E[HT] = 4` by first-step / Markov states.
  - `lesson-penneys-game` — two patterns race on one stream; non-transitivity (Conway), going-second wins.
  - `lesson-gamblers-ruin` — random walk to a barrier; `P(win) = i/N`, `E[duration] = i(N−i)`; risk of ruin.
  - `lesson-states-streaks` — interleaved checkpoint mixing wait / race / walk problems unlabeled.
  - `lesson-longer-patterns` — transfer to `THH = 8` vs `HTH = 10`; overlap / autocorrelation.
  - `lesson-overlap-shortcut` — capstone `E[wait] = Σ 2^(overlap length)`, proved by a fair-game martingale.
- in-dev (open `concept/*` branches + dev `brilliant-org-dev`) — `concept/combinatorics`, 6 lessons under `course-combinatorics` (domain: Combinatorics & Games); supplies the `P(x)` **weights**, not the averaging:
  - `lesson-combinatorics-1` — The Counting Principle (multiplication rule; `n!`).
  - `lesson-combinatorics-2` — Permutations & Combinations (`nPk` vs `nCk`).
  - `lesson-combinatorics-3` — The Binomial Theorem (`nCk` as coefficients; row sum `2ⁿ`).
  - `lesson-combinatorics-4` — Inclusion–Exclusion (`|A∪B| = |A|+|B|−|A∩B|`; poker counts).
  - `lesson-combinatorics-5` — The Pigeon Hole Principle (existence; `⌈N/H⌉`).
  - `lesson-combinatorics-6` — Counting Probabilities (`P = favorable / total`).
- OFF-LIMITS / future: `concept/bayes-rule` (belief-updating — NOT averaging; L4 forward-flags to it) and a future **Variance / Covariance** concept (#3) that owns spread of outcomes.
sources: fixtures/lesson-*.json per branch; Firestore lessons/* + courses/* (dev+prod via Firebase MCP)

**Overlap verdict: ADJACENT, not greenfield.** PHT already made the learner *compute* expected values (`E[H]=2`, `E[HH]=6`) and *condition on a first step* — so Expected Value must **name and generalize** what PHT did by example (reuse-as-recall), never re-derive it. Combinatorics supplies the `P(x)` weights inside `E[X]=Σ x·P(x)` (tool-interleave). Gambler's-ruin risk-of-ruin is referenced, not rebuilt (dedupe). Variance is scope-OUT to concept #3. No new lesson re-teaches geometric waiting times, counting, or ruin.

## Overlap analysis
| existing lesson/beat | overlapping idea | verdict | action |
|----------------------|------------------|---------|--------|
| `lesson-first-heads` (`E[H]=2`) | "expected value" already computed, never named | reuse-as-recall | open L1 with a graded retrieval of `E[H]=2`, then reveal it was an `E[X]=Σ x·P(x)` all along (GB p.44); do NOT re-derive the geometric series |
| `lesson-pattern-hitting-times` (`E[HH]=6`, first-step `E=1+½E₁+½E₀`) | conditioning on the first flip **is** the law of total expectation | reuse-as-recall | frame L4 as the *general* law `E[X]=Σ E[X\|case]P(case)` (GB p.47), retrieving the PHT first-step as its first instance; do NOT re-derive hitting times |
| `lesson-gamblers-ruin` (`P(win)=i/N`, risk of ruin) | "a bad bet ruins you" / repeated play | dedupe | reference "risk of ruin" in L2's fair-game beat; do NOT build a Kelly / ruin lesson — keep only the *complementary* LLN angle "a positive edge compounds to certainty" as new |
| `lesson-overlap-shortcut` / martingale (fair game `E[net]=0`) | a fair bet has zero expected gain | reuse-as-recall | retrieve "fair game ⇒ `E[net]=0`" to open L2 linearity (a sum of fair bets is still fair); recall, not re-teach |
| `lesson-combinatorics-2 / -6` (`nCk`, `P=favorable/total`) | the `P(x)` weights inside `E[X]=Σ x·P(x)` | tool-interleave | recall "count → weight": an unlabeled micro-count produces the pmf in L1, the per-stage `(N−k)/N` in L5, and the order-stat `P` in L6; do NOT re-teach counting |
| (future) Variance / Covariance · `concept/bayes-rule` | spread of outcomes · belief-updating | scope-OUT / forward-flag | mention variance once as a 1-beat teaser (definition only, GB p.44); keep L4 to *averaging* and forward-flag belief-updating to the future Bayes concept |

## Active-recall plan (learning science — inclusive-research-5)
- retrieval warm-ups:
  - `E[H]=2` (`lesson-first-heads`) → L1 opener — then name it `E[X]=Σ x·P(x)` (GB p.44).
  - first-step `E[HH]=6` (`lesson-pattern-hitting-times`) → L4 opener — reveal it *was* the law of total expectation (GB p.47–48).
  - exact probabilities `i/N`, `7/8`, `favorable/total` (PHT + combinatorics) → L3 indicators — `E[1_A]=P(A)` (GB p.31).
  - fair game `E[net]=0` (martingale capstone) → L2 linearity opener (GB p.47).
- interleaving:
  - one **unlabeled** combinatorics micro-count that produces a `P(x)` weight, dropped into L1 (the pmf), L5 (per-stage `(N−k)/N`), and L6 (order-stat `P`) — the learner must pick "count → weight" with no label (mirrors `lesson-states-streaks`' design).
  - confusable pair **"sum of expectations" vs "expectation of a product"** → an L2 beat where dependence is *allowed* for the sum (GB p.47–48, noodles) but a product is not — pre-empts the #1 linearity error.
- spaced re-surfacing:
  - **linearity** (L2, GB p.47) recurs in L3 (a count = `Σ` indicators, GB p.48), L5 (a full set = `Σ` geometric waits, GB p.49–50), and L6 (extremes via order-stat sums, GB p.50–51) — spaced across four lessons.
  - **conditioning on the first step** (L4, GB p.47–48) re-surfaces the PHT first-step it generalized, ~3 lessons after the learner last met it — closing the loop from the prior course.
