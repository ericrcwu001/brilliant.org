# Continuity Report — concept-combinatorics

## Existing corpus surveyed
- shipped (main + prod `brilliant-org`) — all 7 live lessons sit under ONE course `course-pattern-hitting-times` (domain: Probability); none teaches counting:
  - `lesson-first-heads` — flip until the first H; the geometric warm-up `E[H] = 2`.
  - `lesson-pattern-hitting-times` — flagship: `E[HH] = 6` vs `E[HT] = 4` by first-step / Markov states.
  - `lesson-penneys-game` — two patterns race on one stream; non-transitivity (Conway), going-second wins ~7:1.
  - `lesson-gamblers-ruin` — random walk to a barrier; `P(win) = i/N`, `E[duration] = i(N−i)`.
  - `lesson-states-streaks` — interleaved checkpoint mixing wait / race / walk problems unlabeled.
  - `lesson-longer-patterns` — transfer to `THH = 8` vs `HTH = 10`; overlap/autocorrelation.
  - `lesson-overlap-shortcut` — capstone `E[wait] = Σ 2^(overlap length)`, proved by a fair-game martingale.
- in-dev (open `concept/*` branches + dev `brilliant-org-dev`): `bayes-rule` is in flight but OFF-LIMITS and unrelated (conditional probability, not counting). No combinatorics work exists anywhere — this concept is new ground.
sources: fixtures/lesson-*.json per branch; Firestore lessons/* + courses/* (dev+prod via Firebase MCP)

**Overlap verdict: near-GREENFIELD.** The shipped corpus never teaches counting, permutations, combinations, the binomial theorem, or inclusion–exclusion. There is **no `dedupe`** — nothing to drop or re-teach. Only three *thin* recall bridges exist, and all are converted to retrieval/interleaving below (never new teaching of probability or waiting times).

## Overlap analysis
| existing lesson/beat | overlapping idea | verdict | action |
|----------------------|------------------|---------|--------|
| `lesson-overlap-shortcut` (`E[wait] = Σ 2^L`) | powers-of-two fluency (`2ⁿ`) | reuse-as-recall | open L3 (Binomial) with a graded retrieval of the `Σ 2^L` shortcut, then reveal that a Pascal row also sums to `2ⁿ` (GB p.33) — recall, not re-teach |
| probability lessons (`E[H]=2`, `i/N`, `7/8`) — exact-fraction reasoning | turning a count into an exact rational probability | reuse-as-recall | in L2/L4, retrieve "answers stay exact fractions," then divide a count by a count (dice-order `1/3!` GB p.40; four-of-a-kind `/ C(52,5)` GB p.34) |
| `lesson-first-heads` / `lesson-pattern-hitting-times` (implicit "count the ways") | counting outcomes behind a simple probability | reuse-as-recall | L1 opener retrieves the implicit "count the ways" they already used, then names it the multiplication rule (GB p.33) |
| `lesson-gamblers-ruin` (shares GB p.42 neighborhood) | none — adjacent page only | no overlap | none; GB p.42 teaches random-walk ruin there, we cite p.42 only for the *aces-into-piles* permutation count (`4!` ways) — different idea, no collision |

## Active-recall plan (learning science — inclusive-research-5)
- retrieval warm-ups:
  - `Σ 2^L` overlap shortcut (`lesson-overlap-shortcut`) → L3 binomial opener (Pascal row sum `= 2ⁿ`, GB p.33).
  - "answers stay exact fractions" (probability lessons) → L2/L4 count-to-probability beats (`1/3!` GB p.40; poker probabilities GB p.34).
  - implicit "count the ways" (`lesson-first-heads` / `lesson-pattern-hitting-times`) → L1 counting-principle opener (GB p.33).
- interleaving:
  - confusable pair **nPk vs nCk** → one mixed `selectionGrid` beat in L2 where an order-on/off toggle forces the discrimination (ordered vs unordered, `×k!` apart; GB p.33).
  - confusable pair **add vs multiply** (independent choices multiply; mutually-exclusive cases add) → a mixed beat in L1 and again in L4 (GB p.33, p.36).
  - course-level: interleave one combinatorics count with a probability question so the learner must pick the tool *unlabeled* — mirrors `lesson-states-streaks`' design.
- spaced re-surfacing:
  - the multiplication rule (L1, GB p.33) recurs in L2 (`nPk` is a product), L3 (paths down Pascal's triangle), and L4 (poker product counts, GB p.34) — spaced across all four lessons.
  - `2ⁿ` recurs: L1 counts length-n binary strings `= 2ⁿ` → L3 binomial row sum `= 2ⁿ` (GB p.33); a ~2-lesson gap closes the loop on powers-of-two carried over from the prior course.
  - count→exact-fraction conversion recurs L2 (`1/3!`, GB p.40) → L4 (poker probabilities, GB p.34), reinforcing the prior course's rational-answer habit.
