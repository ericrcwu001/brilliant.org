# Concept: Combinatorics  (course-combinatorics)

## Green Book anchor
- Basic principle of counting (multiplication rule) — Green Book §4.2 *Combinatorial Analysis*, p.33 ("Basic principle of counting: Let S be a set of length-k sequences …"); reused as the engine of the chess-tournament count (p.35) and the birthday problem's `365ⁿ` (p.36). Legitimate, and the foundation everything else rests on.
- Permutations (`nPk`; `n!` full arrangements) — Green Book §4.2, p.33 ("Permutation: A rearrangement of objects into a distinct sequence"); permutation-probability applications at p.40 (dice in strictly-increasing order `= 1/3! = 1/6`) and p.42 (four aces dealt into four piles `= 4!` arrangements).
- Combinations (`nCk`; unordered selection) — Green Book §4.2, p.33 ("Combination: an unordered collection … order doesn't matter"; property: there are `C(n,k)` combinations of `n` objects taken `k` at a time), with the poker count `C(52,5) = 2,598,960` total five-card hands at p.34.
- Binomial theorem — Green Book §4.2, p.33 (stated); applied at p.36–37 ("Applying the binomial theorem for `(x+y)` …": the `(1+√2)ⁿ` integer problem and the cubic-of-an-integer last-digits problem).
- Inclusion–Exclusion principle — Green Book §4.2, p.33 (stated: `|E₁∪E₂| = |E₁| + |E₂| − |E₁∩E₂|`, plus the general n-set signed sum); worked at p.36 ("This problem is a classic example for the Inclusion-Exclusion Principle" — the mis-addressed-letters derangement).
- Poker-hand counting (capstone application of all of the above) — Green Book §4.2 *Poker hands*, p.34 (four-of-a-kind `= 13 × 48`; full house; total hands `= C(52,5) = 2,598,960`).
- Hooks — Green Book §2 *Brain Teasers*: two-guards "Door to offer" logic puzzle and the "Last ball" parity invariant (14 red balls ⇒ red-count parity never flips ⇒ last ball is blue), p.7–8; counterfeit-coin **weighing** puzzles (one weighing of `1+2+…+10` coins, p.10; base-3 weighings, p.12) — counting/logic, NOT coin-flip waiting times.
- Enrichment / optional — Green Book p.89: the Knuth (Fisher–Yates) shuffle, "shuffle a deck of 52 cards so that every permutation is equally likely" → there are `n!` orderings (a natural permutations call-back for L2).

## One-line promise
Every counting question is the same move: break it into independent choices you **multiply**, decide whether **order** matters (divide it out for combinations), and **subtract the overlaps** you double-counted — so you can size a set far too large to ever list.

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)
- **domain:** Combinatorics & Games
- **domainOrder:** 1
- **order:** 0
- **status:** `live`
- **tagline:** Count cleverly to avoid counting everything.
- **accent:** `ch5`
- **vizKey:** `dice`
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-combinatorics-1 | Counting Foundations | ch5 | [lesson-combinatorics-1, lesson-combinatorics-2] |
| ch-combinatorics-2 | Structure & Overlap | ch1 | [lesson-combinatorics-3, lesson-combinatorics-4] |

## Lessons (ordered)
| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-combinatorics-1 | The Counting Principle | Multiply independent choices to count outcomes — and arrange a full set with factorials — without ever listing them. | — | × | dice | GB p.33; hooks GB p.7–8, p.10 |
| L2 | lesson-combinatorics-2 | Permutations & Combinations | Tell ordered selection (`nPk`) from unordered selection (`nCk`) and know when order matters. | L1 | (n k) | dice | GB p.33–34, p.40, p.42 (opt. p.89) |
| L3 | lesson-combinatorics-3 | The Binomial Theorem | See that `nCk` ARE the coefficients of `(a+b)ⁿ`: Pascal symmetry, and each row sums to `2ⁿ`. | L2 | (a+b)ⁿ | sum | GB p.33; applied GB p.36–37 |
| L4 | lesson-combinatorics-4 | Inclusion–Exclusion | Count overlapping sets via `|A∪B| = |A| + |B| − |A∩B|`, then count poker hands. | L3 | ∪ | sum | GB p.33, p.36, p.34 |

## New engine(s) / widget(s) anticipated (for Wave 0)
- engine: `src/engine/combinatorics.ts` — pure, dependency-free, **exact integers only** (BigInt, no floats — matching the probability/KMP engine discipline): `factorial(n)`, `nPk(n,k)`, `nCk(n,k)`, a Pascal-row builder with the `Σ row = 2ⁿ` and `C(n,k)=C(n,n−k)` invariants, and `inclusionExclusion([...sets])` for the general signed sum (`|A∪B|=|A|+|B|−|A∩B|` and beyond). Must reproduce every cited number for the two-stage fact-check: `C(52,5)=2,598,960` and four-of-a-kind `=13×48` (GB p.34), `1/3!` (GB p.40), `4!` aces-into-piles (GB p.42).
- interaction type(s):
  - `countingTree` — expand a product-rule tree; each added level multiplies the branch count, with a live running product (L1).
  - `selectionGrid` — pick `k` of `n` with an **order on/off** toggle so the learner feels `nPk` vs `nCk` (same selection, `×k!` apart) (L2).
  - `pascalTriangle` — tap to build Pascal's triangle; each cell reveals as `C(n,k)`, each row sums to `2ⁿ`, and symmetry mirrors live (L3).
  - `vennCounter` — drag set sizes and their overlap; the `|A∪B|` signed sum and the double-counted region update together (L4 capstone, incl. the poker-hand counter).
