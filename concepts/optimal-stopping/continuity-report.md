# Continuity Report — concept-optimal-stopping

## Existing corpus surveyed
- shipped (main + committed fixtures): pattern-hitting-times path (lesson-first-heads,
  lesson-pattern-hitting-times, lesson-penneys-game, lesson-gamblers-ruin, lesson-states-streaks,
  lesson-longer-patterns, lesson-overlap-shortcut), **course-expected-value** (L1–6: weighted
  averages, linearity, indicators, conditional/total expectation, coupon collector = N·H_N, order
  stats), **course-bayes-rule** (L1–8), **course-combinatorics** (L1–6: product rule, nPk/nCk,
  Pascal, inclusion–exclusion, pigeonhole, poker probability), **course-markov-chains** (L1–10).
- coming-soon stubs: course-optimal-stopping (this concept), course-game-theory.
sources: `fixtures/lesson-*.json` + `fixtures/course-*.json` on this branch (the Firebase MCP / dev
project were not reachable from this environment; the committed fixtures are the authoritative corpus).

## Overlap analysis
| existing lesson/beat | overlapping idea | verdict | action |
|----------------------|------------------|---------|--------|
| (none) secretary problem / optimal stopping | the core mechanic | **net-new** | no dedupe — no existing lesson teaches stopping rules |
| combinatorics L1–L2 (product rule, n!, nPk) | counting the n! equally-likely arrival orders; (n−1)! orders put the best first | reuse-as-recall | L1 opens by recalling that n items have n! orders, then counts the "best-first" fraction = (n−1)!/n! = 1/n |
| expected-value L5 (coupon collector = N·Hₙ, harmonic numbers Σ1/k) | the success formula's Σ_{j=r}^{n} 1/(j−1) is a partial harmonic sum | reuse-as-recall + interleave | L4 surfaces "harmonic sum" as prior knowledge and frames pₙ(r) as Hₙ₋₁−Hᵣ₋₂ |
| probability basics (uniform 1/n) | take-first / take-random both = 1/n | reuse-as-recall | L1 retrieval opener grids "pick 1 of n at random → 1/n" |
| markov/PHT (expectation over a random process) | thinking in "what happens on average over random orders" | conceptual only | no beat needed; tone carries over |

## Active-recall plan (learning science — inclusive-research-5)
- **retrieval warm-ups:** uniform 1/n (basic prob) → `l1-recall`; n! arrival orders (combinatorics) →
  referenced in `l1-count`; harmonic sum Σ1/k (EV coupon collector) → `l4-recall`.
- **interleaving:** "multiply vs add" and "order matters vs not" (combinatorics) are deliberately NOT
  re-taught; instead L1 reuses permutation counting as a *tool*. L4 interleaves the harmonic sum from EV.
- **spaced re-surfacing:** the single threshold rule (skip ~37%, take first record) recurs across
  L2 (discover) → L3 (limit) → L4 (derive) → L5 (apply), each time retrieved before it is extended.
