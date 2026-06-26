# Concept: Optimal Stopping  (course-optimal-stopping)

## Green Book anchor
- **The Secretary Problem** (a.k.a. Best-Choice / Marriage / Sultan's-Dowry problem) — the canonical
  optimal-stopping question in the quant-interview canon. The repo's `references/green-book.txt` is
  gitignored and **absent in this checkout**, so this concept is anchored to the sourced quant-interview
  canon (lesson-factory rule #2's allowed path) and **every number is engine-verified** (rule #3, Stage 2):
  - Statistics LibreTexts §12.9 "The Secretary Problem" — success formula + the n=3..20 optimal table.
  - Wikipedia "Secretary problem" — the 1/e stopping rule; selects the best ~37% of the time for any n.
  - Stanford AMDM Lecture 8 — take-first = 1/n; explore-half ≥ 1/4; optimal x* = 1/e derivation.
  - Univ. of Tokyo Grad. Eng. Math 2020 Problem 3 — p₄(2) = 1/4 + 1/8 + 1/12 = 11/24.
  - techinterview.org "The Secretary Problem and the 1/e Rule" — quant-desk framing.

## One-line promise
When you must choose irrevocably from candidates arriving in random order, one threshold — **look at
about 37%, then leap at the first record** — maximizes your chance of landing the single best.

## Catalog fields  (auto-registers the concept in the macro home when seeded)
- **domain:** Combinatorics & Games
- **domainOrder:** 1
- **order:** 1
- **status:** `live`
- **tagline:** Know when to commit for the best outcome.
- **accent:** `ch3`
- **vizKey:** raceLanes
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-optimal-stopping-1 | The Best-Choice Problem | ch3 | [lesson-optimal-stopping-1, lesson-optimal-stopping-2] |
| ch-optimal-stopping-2 | The 37% Rule | ch4 | [lesson-optimal-stopping-3, lesson-optimal-stopping-4, lesson-optimal-stopping-5] |

## Lessons (ordered)
| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-optimal-stopping-1 | No Going Back | The irrevocable-choice game; every fixed/random rule wins exactly 1/n | — | 1/n | raceLanes | LibreTexts §12.9; Stanford L8 |
| L2 | lesson-optimal-stopping-2 | Look, Then Leap | The threshold rule beats 1/n: reject r−1, take first record; n=3→1/2, n=4→11/24 | L1 | r−1 | twoNode | LibreTexts §12.9; Tokyo 2020 P3 |
| L3 | lesson-optimal-stopping-3 | The 37% Rule | Optimal cutoff r*/n and success p* both converge to 1/e ≈ 0.368 | L2 | 1/e | sum | Wikipedia; LibreTexts table |
| L4 | lesson-optimal-stopping-4 | Why 37% Works | Derive pₙ(r)=(r−1)/n·Σ1/(j−1) from the position decomposition; harmonic link | L3 | Σ | dice | Tokyo 2020 P3; Stanford L8 |
| L5 | lesson-optimal-stopping-5 | Stopping in the Wild | Apply the one rule to hiring/apartments/marriage; recognize the pattern; finale | L4 | e | stateMachine | Wikipedia; techinterview.org |

## New engine(s) / widget(s) anticipated (for Wave 0)
- engine: `src/engine/optimalStopping.ts` — exact BigInt rationals: `secretarySuccess(n,r)`,
  `naiveSuccess(n)`, `successCurve(n)`, `optimalCutoff(n)`, `runStrategy(order,cutoff)`,
  `formatRational`, `ratToNumber`. Verified by brute-force permutation enumeration in goldens.
- interaction type: `stoppingBoard` — folds three displays (codebase convention, cf. raceSim /
  walkBoard / chainBoard): `sequence` (watch one irrevocable run resolve), `cutoff` (the
  success-vs-cutoff curve; drag the threshold), `convergence` (r*/n and p* approaching 1/e). NOT
  graded / NOT a HERO_TYPE; the `headline` is the engine-reproducible validation anchor.
