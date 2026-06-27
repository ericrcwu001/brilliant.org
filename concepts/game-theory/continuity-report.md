# Continuity Report — concept-game-theory

> Existing-corpus overlap survey (Corpus Cartographer + Manager synthesis). Produced before the
> Concept Brief is finalized; feeds the Architect (no redundant lessons) + Assessment Designer
> (turns every overlap into deliberate recall / interleaving — `inclusive-research-5`).

## Existing corpus surveyed

- **shipped (main + prod `brilliant-org`):** pattern-hitting-times (L0 + 6), **penneys-game** (race ≠
  wait, second-mover counter, `dominanceWheel` non-transitive 4-cycle), gamblers-ruin, states-streaks,
  longer-patterns, overlap-shortcut; expected-value 1–6; bayes-rule 1–8; combinatorics 1–6;
  markov-chains 1–10.
- **in-dev (concept branches + dev Firestore):** same set (this VM has no Firebase MCP access; survey
  is from `fixtures/lesson-*.json` + `concepts/*` on disk, which mirror the shipped/in-dev corpus).
- sources: `fixtures/lesson-*.json`, `fixtures/course-*.json`, `concepts/*/`, `docs/*`.

**No game theory exists yet** — only the coming-soon stub `fixtures/course-game-theory.json`. No
Nash / dominance / minimax / Nim / payoff-matrix content anywhere.

## Overlap analysis

| existing lesson / beat | overlapping idea | verdict | action |
|---|---|---|---|
| `lesson-penneys-game` / `non-transitive-loop` (`dominanceWheel` HHH→THH→TTH→HTT) | **cyclic / non-transitive dominance** — "no single best choice" | **reuse-as-recall** | L1 opens with a retrieval that recalls "Penney's has no dominant pattern", then generalizes to a *payoff* cycle (Rock-Paper-Scissors, L3). Do **not** re-teach non-transitivity from scratch. |
| `lesson-penneys-game` / `pick-your-counter`, mastery (second-mover, Conway) | **second-mover advantage / counter-picking** | **reuse-as-recall → pivot** | L5 (sequential) recalls "going second can win 7:1" then formalizes it as commitment / first-vs-second-mover (Stackelberg) and backward induction. |
| `lesson-markov-chains-9` / `recall-no-champion` | "ranking without a champion" ≈ no Condorcet winner / cyclic dominance | **interleave** | L3 mixed-strategy opener can interleave "no champion" with RPS's "no pure best move → randomize". |
| `lesson-expected-value-*` (E[X], totalExpectation) | **expected payoff of a strategy profile** | **prerequisite (reuse)** | L3/L4 mixed strategies compute expected payoffs; recall E[X] = Σ p·value rather than re-teach. A `primer` JIT card suffices. |
| `lesson-combinatorics-*` | counting strategies / outcomes | **tooling, not strategy** | not re-taught; combinatorics is a sibling course in the same "Combinatorics & Games" domain. |
| `lesson-gamblers-ruin` | fair-game / zero-sum *outcome* language | **background only** | mention zero-sum intuition; no recall beat needed. |

## Active-recall plan (learning science — inclusive-research-5)

- **retrieval warm-ups (each lesson opens with a graded `retrievalGrid`):**
  - L1 ← Penney's "no dominant pattern" + EV "Σ p·value" + the meaning of a payoff.
  - L2 ← L1 dominance (dominant strategy ⇒ easy; what if neither dominates?).
  - L3 ← L2 "some games have no pure equilibrium" + Penney/RPS "no single best move → randomize".
  - L4 ← L3 mixing + the idea of a guaranteed value (minimax).
  - L5 ← L1 prisoner's dilemma (one-shot) vs repeated; Penney's second-mover.
  - L6 ← L5 backward induction (fold from the end) generalizes to P/N positions.
- **interleaving:** L3 interleaves "pure-NE vs no-pure-NE" (mix vs don't); L6 interleaves Nim vs the
  subtraction game vs "is it forced?" (chocolate-bar invariant) so the learner discriminates
  *strategy* (Nim/Chomp) from *no-strategy/forced* (chocolate breaks).
- **spaced re-surfacing:** "best response" recurs L2→L3→L4; "backward induction" recurs L5→L6; the
  prisoner's dilemma payoff structure re-surfaces in L5 (finitely-repeated PD unravels).

## No-redundancy verdict

Game Theory teaches an entirely new toolkit (dominance, Nash, mixed strategies, minimax,
backward induction, combinatorial games). The single genuine overlap — **non-transitivity /
second-mover** from Penney's game — is deliberately converted to **recall + generalization**, never
re-taught. Gate 6 (assessment/continuity) is satisfied by the per-lesson retrieval openers above.
