# Concept: Markov Chains  (course-markov-chains)

## Green Book anchor

- **§5.1 Markov Chain, p.53–57** (+ **§5.2 Martingale and Random Walk, p.58–62**) — Green Book,
  Ch.5 "Stochastic Process and Stochastic Calculus" (`references/green-book.txt` page markers;
  §5.1 header verified at the p.53 marker, §5.2 at p.58). §5.1 *is* a Markov-chain section: it states
  the **Markov property / memorylessness** ("once the current state is known, past history has no
  bearing on the future," p.53), the **homogeneous chain** "completely described by an M×M transition
  matrix P and the initial probabilities" (p.53), the **transition graph** (Fig 5.1, p.54), the
  **path probability** `P(X₀=i,X₁=j,…)=pᵢⱼ·pⱼₖ·⋯` (p.53), the **classification of states**
  (accessible / communicate / recurrent / transient / absorbing, p.54–55), and **first-step analysis**
  for absorption probability and expected time ("the number 1 is added since it takes one step,"
  p.54). It works the canonical quant chains: **gambler's ruin** (from \$1, win w.p. **4/7**, p.54–55),
  the **dice chain** "single 12 vs two consecutive 7s" (p.55–56 → **7/13** / **6/13**), and the **coin
  chain** HHH-before-THH (p.56 → **1/8**, `E[THH]=8`); §5.2 adds the **random walk** / drunk-man
  bridge (p.59 → **17/100**, **1411**) and `E[n heads]=2ⁿ⁺¹−2` (p.60–61). It legitimately anchors the
  concept because this is the most Markov-centric region of the book and the standard quant-interview
  source — and every headline is an **exact rational** a small rational-probability chain reproduces.
- **GB-anchored (L1–L5) vs WEB-anchored (L6–L10).** L1–L5 are Green-Book sourced (Markov property,
  transition matrix, path-probability/multi-step, classification, absorption probability + expected
  absorption time). **Two GB lessons need a WEB sub-anchor:** L3's *exact `Pⁿ` values* (GB gives only
  the path-probability rule) and L4's *periodicity* (absent from GB). **L6–L10 are WEB-only**:
  stationary distribution, convergence/ergodicity, reversibility/detailed balance, and PageRank are
  **confirmed absent from the Green Book** (`rg -i` counts: `stationary`/`ergodic`/`reversible`/
  `detailed balance`/`periodic`/`PageRank` all **0**). See `concepts/markov-chains/source-pack.md` §3
  for the full verified, cited problem set (Green-Book pages + web URLs + stated exact-rational answers).

## One-line promise

Once you know where you are, the past is irrelevant — so stack each state's next-step probabilities
into a single transition matrix `P`, and then powers, fixed points, and balance equations of that one
matrix answer **every** question a chain can pose: where it goes next (`Pⁿ`), whether it gets stuck or
wanders forever (state classes), how long until absorption and with what probability (`(I−Q)⁻¹`), and
where it settles in the long run (`πP=π`) — the same machine that ranks the entire web.

## Manager decisions (arbitration — BINDING for Dept 2/3)

1. **Accent = `ch3`** (confirmed; overrides the stub's `ch1`). The four live Probability cards stay
   distinct — PHT `ch1` · Bayes `ch2` · **Markov `ch3`** · EV `ch4` — matching the Bayes precedent.
   Set `accent: "ch3"` on `fixtures/course-markov-chains.json` when authoring the course doc.
2. **PageRank graded answers = sourced only.** Grade L9 on the **sourced** d=1 4-node
   `(4/13,5/13,1/13,3/13)` and the symmetric 3-cycle `(1/3,1/3,1/3)` (clean for any rational `d`).
   The damped d=1/2 `(14/39,10/39,15/39)` is **enrichment only** and may appear ONLY if `markov.ts`
   reproduces it exactly (engine-verify-before-ship). The PageRank algorithm definition is the Stage-1
   source; the exact vector is Stage-2 engine truth. No invented graded answers.
3. **`chainBoard` folding = leaning FOLD; finalized in the Dept 1↔Dept 2 loop.** Default to folding the
   stationary/PageRank surface as a `chainBoard` display (honor the `raceSim`/`walkBoard`
   one-presentation-type convention). Dept 2 (Catalog/Reuse Auditor + Technical Planner) makes the final
   call, ratified at Wave 0. A sibling `stationarySolver` type is allowed only if folding measurably
   hurts the interaction.

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)

- **domain:** `Probability`  (kept from stub — Probability shelf, `domainOrder` 0: PHT order 0,
  Expected-Value order 1, **Markov order 2**, Bayes order 3; all live, no clash)
- **domainOrder:** `0`  (kept)
- **order:** `2`  (kept — 3rd Probability concept by `order`)
- **status:** `live`  (**flipped from `coming_soon`** — the primary identity flip)
- **tagline:** `Where does a memoryless process settle?`  (39 chars ≤ 60 ✓ — kept from stub;
  foreshadows stationary/convergence)
- **accent:** `ch3`  (**deliberate change from the stub's `ch1`** so the four live Probability cards
  are distinct: PHT `ch1`, Bayes `ch2`, **Markov `ch3`**, EV `ch4`. ⚠️ **Manager may veto → keep
  `ch1`**; the only cost of `ch1` is a card-color clash with Pattern-Hitting-Times.)
- **vizKey:** `fourNode`  (kept — a 4-node chain is the concept's emblem)
- **completionMilestoneId:** `markov-chains-complete`  (kept). `title` / `description` / `persona`
  kept from the stub (sound).
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-markov-chains-1 | The Memoryless Machine | ch1 | [lesson-markov-chains-1, lesson-markov-chains-2, lesson-markov-chains-3] |
| ch-markov-chains-2 | Reaching States | ch2 | [lesson-markov-chains-4, lesson-markov-chains-5] |
| ch-markov-chains-3 | The Long Run | ch3 | [lesson-markov-chains-6, lesson-markov-chains-7, lesson-markov-chains-8] |
| ch-markov-chains-4 | Ranking & Synthesis | ch4 | [lesson-markov-chains-9, lesson-markov-chains-10] |

> Every built lessonId (`lesson-markov-chains-1` … `-10`) appears in **exactly one** chapter; coverage
> is consecutive and complete (3 + 2 + 3 + 2 = 10). `accent`s `ch1`–`ch4` stay inside the `ch1`–`ch5`
> enum. This satisfies the chapters-coverage gate (`scripts/validate-fixtures.ts` §7, ADR-0004) that
> otherwise renders lessons invisible via the silent Pattern-Hitting-Times fallback.

## Lessons (ordered — 10)

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-markov-chains-1 | The Markov Property | A process is memoryless when the next state depends only on the current one, not the path that led there — spot which stories are Markov. | — | `P(·\|now)` | twoNode | **GB** p.53 (memorylessness); web 2-state weather `P=[[3/5,2/5],[3/10,7/10]]` (Math.SE 3336273) |
| L2 | lesson-markov-chains-2 | The Transition Matrix | Stack each state's outgoing probabilities into the rows of a matrix `P` (every row sums to 1) and read the diagram and the matrix as one object. | L1 | `Σrow=1` | stateMachine | **GB** p.53–54 (M×M `P`, rows sum to 1, Fig 5.1); web `P=[[7/10,3/10],[4/10,6/10]]` (GeeksforGeeks); clear/rainy (Math.SE 3336273) |
| L3 | lesson-markov-chains-3 | Multi-Step Transitions | The n-step probabilities are the entries of `Pⁿ` — Chapman–Kolmogorov is the law of total probability, one step at a time. | L2 | `Pⁿ` | fourNode | **GB** p.53 (path prob `pᵢⱼ·pⱼₖ·⋯`); **web** Land of Oz `(P²)_Rain,Snow=3/8` (Grinstead & Snell Ch.11 Table 11.1; UC Davis dis6) |
| L4 | lesson-markov-chains-4 | Classifying States | Sort states into recurrent / transient / absorbing / communicating classes and find a chain's period — the structure that decides its fate. | L2, L3 | `R/T/A` | stateMachine | **GB** p.54–55 (classes; gambler's-ruin classes); **web** periodicity Ehrenfest m=2 → period 2 (stats.libretexts 16.8); ergodic 3-state (Rochester ECE440 HW5 #2) |
| L5 | lesson-markov-chains-5 | Hitting Times & Absorption | Lift first-step analysis to matrix form: absorption `(I−Q)⁻¹R` and expected hitting time `(I−Q)t=1`. | L3, L4 | `(I−Q)⁻¹` | randomWalk | **GB** p.54–57 (gambler's ruin **4/7**, a₂=6/7; dice **7/13** / **6/13**; coin **1/8**, `E[THH]=8`), p.59 (drunk-man **17/100**, **1411**); **web** drunkard `i/N=(1/4,1/2,3/4)`, `i(N−i)=(3,4,3)` (Grinstead & Snell Ex.11.13–15) |
| L6 | lesson-markov-chains-6 | The Stationary Distribution | `π` solves `πP=π` with `Σπ=1` — the long-run share of time in each state; Kac's mean return time is `1/πᵢ`. | L3 | `πP=π` | fourNode | **WEB** 3-state **(1/5,2/5,2/5)** (Rochester ECE440 HW5 #2); 2-state (3/7,4/7) (Math.SE 3336273); general (b/(a+b),a/(a+b)) (Math.SE 259852). *(absent from GB)* |
| L7 | lesson-markov-chains-7 | Convergence: Forgetting the Start | For a regular chain every row of `Pⁿ` converges to the same `π` — the chain forgets where it started. | L6 | `Pⁿ→π` | twoNode | **WEB** Land of Oz `Pⁿ→(2/5,1/5,2/5)`, exact dyadic at every finite n (Grinstead & Snell Ch.11 Table 11.1). *(absent from GB)* |
| L8 | lesson-markov-chains-8 | Reversibility & Detailed Balance | A chain is reversible when detailed balance `πᵢpᵢⱼ=πⱼpⱼᵢ` holds — the fast route to `π` for birth–death chains. | L6 | `πᵢpᵢⱼ=πⱼpⱼᵢ` | randomWalk | **WEB** Ehrenfest `π=C(m,i)/2ᵐ` → m=2 **(1/4,1/2,1/4)**, m=3 (1/8,3/8,3/8,1/8) (stats.libretexts 16.8; phys.libretexts 12.3). *(absent from GB)* |
| L9 | lesson-markov-chains-9 | PageRank | Rank a web of links by making it a Markov chain: the random surfer with damping `d`, whose stationary distribution **is** PageRank. | L6, L7 | `PR` | fourNode | **WEB** 4-node d=1 **(4/13,5/13,1/13,3/13)** (practicaldsc.org); 3-cycle (1/3,1/3,1/3) any rational d (theorempath.com); ⚠️**constructed** d=1/2 → (14/39,10/39,15/39) — engine-verify (Wikipedia + arXiv math/0612079). *(absent from GB)* |
| L10 | lesson-markov-chains-10 | Markov in the Wild | Pick the right tool for an unlabeled chain — hitting time, absorption probability, or stationary share — across Ehrenfest, weather, and the drunkard's walk. | L5, L6, L9 | `mix` | dice | **WEB** synthesis: Ehrenfest (1/4,1/2,1/4), weather `π`, drunkard `i/N` & `i(N−i)` (reuses L5/L6/L8 sources). *(absent from GB)* |

> ⚠️ **Manager double-checks (exact-rational):** state L5's **dice event precisely** — `7/13` =
> P(**single 12** first), `6/13` = P(**two consecutive 7s** first) (`source-pack.md` §4 correction).
> L5's drunk-man expected steps = **1411** (= 17·83; the GB OCR shows "1441"). L9's d=1/2 vector
> **(14/39,10/39,15/39) is a construction, not a stated source** — recompute in `markov.ts` before it
> ships; author L9's graded answer on the *sourced* d=1 4-node `(4/13,5/13,1/13,3/13)` and use the
> symmetric 3-cycle `(1/3,1/3,1/3)` (clean for any rational `d`) to teach the damping mechanism.

**The arc (one through-line).** L1–L3 build the **machine**: memorylessness (the only thing that
matters is *now*), then the transition matrix `P` that encodes it, then `Pⁿ` that runs it forward.
L4–L5 ask **where it goes**: which states you can get stuck in vs. wander forever, and the matrix form
of first-step analysis that prices reaching and returning. L6–L8 ask **where it ends up**: the
fixed-point `πP=π`, the fact that a regular chain *forgets its start* (`Pⁿ→π`), and the detailed-balance
shortcut to `π`. L9–L10 **apply** it: PageRank is just a stationary distribution, and the capstone makes
the learner choose the tool unlabeled. Every graded answer is an exact rational a 2–4-state rational
chain reproduces. The single biggest reuse risk — **first-step analysis, already shipped 4×** (PHT
`equation-tiles`/`guided-solve`, gambler's-ruin `prob-tiles`/`duration-tiles`, EV-4 `totalExpectation`)
— is handled by making L5 *retrieval-then-lift*, never re-derivation (see `continuity-report.md`, L5 row).

Per-lesson **Bet → Explore → Model → Prove**, tagged **RETRIEVAL** (of PHT/EV/Bayes — see
`continuity-report.md`) vs **net-new**:

- **L1 — The Markov Property.** **BET:** does the coin/weather "remember" its streak? (gambler's-fallacy
  trap). **EXPLORE:** step a 2-state weather chain (`chainBoard:diagram`); the next state is drawn only
  from the current row. **MODEL:** name *memorylessness* — `P(Xₙ₊₁|past)=P(Xₙ₊₁|Xₙ)`. **PROVE:** classify
  which stories are Markov; identify the weather `P`. **RETRIEVAL** opener `recall-no-memory` reuses PHT
  `l0-flip`/`gamblers-fallacy` + Bayes-3 `due-vs-evidence`; *net-new* = lifting "the coin has no memory"
  to "the next state depends only on the current state."
- **L2 — The Transition Matrix.** **BET:** predict a row's missing entry (does it sum to 1?). **EXPLORE:**
  build/edit the graph and watch its rows populate the matrix (`chainBoard:diagram↔matrix`); reuse PHT's
  `stateMachine` + `stateTap`. **MODEL:** the transition matrix `P`, rows sum to 1 (Fig 5.1). **PROVE:**
  construct a valid `P` from a story, e.g. `[[7/10,3/10],[4/10,6/10]]`. **RETRIEVAL** opener
  `recall-rows-sum-to-1` reuses PHT `primer-graph`/`equation-tiles` ½/½ split + `bias-sandbox` biased `p`;
  *net-new* = stacking rows into a matrix and going beyond prefix-of-a-pattern states.
- **L3 — Multi-Step Transitions.** **BET:** P(snow two days after rain) — one path vs. *all* paths (trap:
  forget to sum). **EXPLORE:** iterate `Pⁿ` (`chainBoard:powers`). **MODEL:** Chapman–Kolmogorov = "the
  law of total probability you used in Bayes, one step at a time." **PROVE:** `(P²)_Rain,Snow=3/8`.
  **RETRIEVAL** opener `recall-total-prob` reuses Penney's `first-step-split` + Bayes-4 `count-the-defects`
  and `bayes.ts sequentialPosterior`; *net-new* = matrix powers as the bookkeeping for every path.
- **L4 — Classifying States.** **BET:** will you return for sure, or maybe never? (recurrent vs.
  transient). **EXPLORE:** a chain with transient + recurrent + absorbing states (`chainBoard:diagram`);
  tap to classify, toggle to see period (Ehrenfest m=2). **MODEL:** recurrent / transient / absorbing /
  communicating classes; period = gcd of return lengths. **PROVE:** gambler's-ruin classes (0,N absorbing,
  interior transient); Ehrenfest period 2. **RETRIEVAL** opener `recall-absorbing` reuses PHT `first-heads`
  / `boundary-edge` + `types.ts absorbing`; *net-new* = transient / recurrent / periodic / communicating.
- **L5 — Hitting Times & Absorption (HIGH dedupe risk).** **BET:** hitting **time** vs hitting
  **probability** — "+1 per step" or "no +1, just a split"? (the corpus's most-reused discrimination).
  **EXPLORE:** recall via `walkBoard` (gambler's ruin) and `raceSim` (Penney's), then solve `(I−Q)⁻¹R` /
  `(I−Q)t=1` on the `chainBoard`. **MODEL:** generalized first-step analysis in matrix form. **PROVE:**
  `4/7` (a₂=6/7); dice `7/13`/`6/13`; coin `1/8`, `E[THH]=8`; drunkard `(1/4,1/2,3/4)`, `(3,4,3)`;
  drunk-man `17/100`, `1411`. **RETRIEVAL** opener `recall-first-step` is a `retrievalGrid` over
  `E0=1+½E1+½E0` (PHT `equation-tiles`), `i/N` (`prob-tiles`), `Σ E[X|case]P(case)` (EV-4 `ev4-recall`),
  plus the `win-prob-tiles`/`plus-one-or-not` time-vs-probability grid; reuse `solveLinearSystem` +
  `totalExpectation` + `penneyOdds`. **The only net-new is the matrix lift** — never re-derive.
- **L6 — The Stationary Distribution.** **BET:** where does the chain settle — does the start matter?
  **EXPLORE:** watch the distribution evolve toward `π` (`chainBoard:distribution`) + a `stationary`
  solver for `πP=π`. **MODEL:** `πP=π`, `Σπ=1`; Kac's `1/πᵢ`. **PROVE:** `(1/5,2/5,2/5)`; `(3/7,4/7)`;
  `(b/(a+b),a/(a+b))`. **RETRIEVAL** opener `recall-geometric` reuses EV-5 `ev5-recall` (`E=1/p` → Kac) +
  EV-1 `ev1-deepen` balance beam (long-run weighted average). **Interleave:** absorbing (stuck at a wall)
  vs. stationary (settles to `π`) — same fixed-point lens, opposite meaning. *Net-new* = the `πP=π`
  fixed point.
- **L7 — Convergence.** **BET:** do all starting states reach the same long-run distribution? **EXPLORE:**
  iterate `Pⁿ` and watch all rows collapse (`chainBoard:powers→distribution`). **MODEL:** regular/ergodic
  chains, `Pⁿ→π`; ergodic theorem (time-avg = space-avg). **PROVE:** Land of Oz `Pⁿ→(2/5,1/5,2/5)`,
  exact dyadic at every finite n. **RETRIEVAL** opener `recall-LLN` reuses EV-1 `ev1-deepen` (LLN →
  ergodic theorem) + L1 memorylessness. **Interleave:** absorbing (never forgets — stuck) vs. ergodic
  (forgets the start) — the contrast *is* the lesson. *Net-new* = convergence/ergodicity.
- **L8 — Reversibility & Detailed Balance.** **BET:** can you guess `π` without solving the whole system?
  **EXPLORE:** the Ehrenfest birth–death walk (reuse `walkBoard`); check `πᵢpᵢⱼ=πⱼpⱼᵢ` edge by edge.
  **MODEL:** reversibility / detailed balance ⇒ binomial stationary. **PROVE:** Ehrenfest `C(m,i)/2ᵐ` →
  `(1/4,1/2,1/4)`, `(1/8,3/8,3/8,1/8)`. **RETRIEVAL** opener `recall-birth-death` reuses PHT gambler's-ruin
  symmetry (`walk.ts buildWalk`). *Net-new* = detailed balance / reversibility.
- **L9 — PageRank.** **BET:** which page is most important? (trap: most in-links wins). **EXPLORE:** a link
  graph with a damping dial (`chainBoard:distribution`/`stationary` + `damping`). **MODEL:** PageRank =
  stationary of the random surfer `G = d·M + (1−d)/n·J`. **PROVE:** d=1 4-node `(4/13,5/13,1/13,3/13)`;
  3-cycle `(1/3,1/3,1/3)` for any rational d; (enrichment, engine-verified) d=1/2 `(14/39,10/39,15/39)`.
  **RETRIEVAL** opener `recall-no-champion`/`recall-renormalize` reuses Penney's `dominanceWheel`
  ("ranking without a champion") + `bayes.ts bayesPosterior` renormalization; the ½/½ split → the surfer's
  uniform out-links. *Net-new* = damping and "ranking = stationary distribution."
- **L10 — Markov in the Wild (interleaving capstone).** **BET:** for an unlabeled scenario, *which* tool?
  (hitting time / absorption probability / stationary share / "ergodic or absorbing?"). **EXPLORE:** a
  `masteryChallenge` + `retrievalGrid` mixing Ehrenfest, weather, and the drunkard — modeled on PHT
  `lesson-states-streaks` mastery Part A/B. **MODEL:** name the discriminating question for each.
  **PROVE:** mixed exact rationals — `(1/4,1/2,1/4)`, weather `π`, `i/N` & `i(N−i)`. **RETRIEVAL /
  INTERLEAVE** opener `recall-pick-the-tool` copies the `states-streaks` design (not its content) — the
  unlabeled pick-the-tool capstone. *Net-new* = the synthesis itself.

## New engine(s) / widget(s) anticipated (for Wave 0)

- **engine: `src/engine/markov.ts`** — pure, dependency-free, **exact rational** (reuses the `Rational`
  type from `src/engine/types.ts` and `reduce / toRational / ratAdd / ratSub / ratMul / ratDiv / ratNum`
  + `solveLinearSystem` from `src/engine/automaton.ts`; Monte-Carlo via `nextStateOf`/`mulberry32` from
  `src/engine/simulate.ts`; **no floats on any graded path**). One general n×n source of truth that
  subsumes the four special-case engines (`automaton.ts`, `walk.ts`, `race.ts`, `expectation.ts`):
  - `buildChain(P: Rational[][], labels: string[])` — validate square + each row sums to 1 (rejects
    non-stochastic input; mirrors `buildAutomaton`'s guard).
  - `matrixPower(P, n): Rational[][]` — exact `Pⁿ` (Chapman–Kolmogorov). Golden: `(P²)_Rain,Snow=3/8`.
  - `classifyStates(P)` → per-state `{ class, kind: 'recurrent'|'transient'|'absorbing', period }`
    (communicating classes via reachability; `period` = gcd of return-cycle lengths). Golden:
    gambler's-ruin {0,N} absorbing / interior transient; Ehrenfest m=2 period 2.
  - `absorptionProbabilities(P, absorbing): Rational[][]` = `(I−Q)⁻¹R` via `solveLinearSystem`. Goldens:
    `4/7`, `6/7`, `7/13`, `6/13`, `1/8`, `i/N=(1/4,1/2,3/4)`.
  - `expectedAbsorptionTime(P, absorbing): Rational[]` solving `(I−Q)t=1`. Goldens: `E[THH]=8`,
    `(3,4,3)`, drunk-man `1411`.
  - `stationaryDistribution(P): Rational[]` solving `πP=π, Σπ=1` (augmented system → `solveLinearSystem`).
    Goldens: `(1/5,2/5,2/5)`, `(3/7,4/7)`, `(4/19,15/19)`.
  - `kacReturnTime(P, i): Rational` = `1/πᵢ`.
  - `isReversible(P, π): boolean` / `detailedBalance(P): { reversible, pi }` (check `πᵢpᵢⱼ=πⱼpⱼᵢ`).
    Goldens: Ehrenfest `(1/4,1/2,1/4)`, `(1/8,3/8,3/8,1/8)`.
  - `pagerank(linkGraph, damping): Rational[]` = stationary of `d·M+(1−d)/n·J`. Goldens: `(1/3,1/3,1/3)`,
    `(4/13,5/13,1/13,3/13)`; **verify the constructed** `(14/39,10/39,15/39)` before use.
  - `simulateChain(P, start, steps, rng=mulberry32(seed))` — Monte-Carlo stepping (reuses
    `nextStateOf`'s pattern + `mulberry32`); feeds `theorySimChart` only (sampling, never graded).
  - **2-stage fact-check goldens (engine ⇄ source-pack):** `3/8` · `4/7`,`6/7`,`7/13`,`6/13`,`1/8` ·
    `8`,`(3,4,3)`,`1411` · `(1/5,2/5,2/5)`,`(3/7,4/7)`,`(4/19,15/19)` · Land-of-Oz `Pⁿ→(2/5,1/5,2/5)` ·
    `(1/4,1/2,1/4)`,`(1/8,3/8,3/8,1/8)` · `(1/3,1/3,1/3)`,`(4/13,5/13,1/13,3/13)`.
- **interaction type(s) — exactly ONE new presentation-folded type** (matching the convention where
  `raceSim` folds `lanes/oddsDial/heatmap` and `walkBoard` folds `single/swarm/landscape/histogram`):
  - **`chainBoard`** — `display: 'diagram' | 'matrix' | 'powers' | 'distribution'`, engine dep
    `markov.ts`, renderer `src/lesson/beats/ChainBoardBeat.tsx` + dispatcher entry in `beats/index.tsx`.
    - `diagram` (L1/L2/L4): build/edit the transition graph (drag edges, set rational probs;
      rows-sum-to-1 enforced; dyna-linked to the matrix).
    - `matrix` (L2): the same chain as `P` (diagram ↔ matrix).
    - `powers` (L3/L7): iterate `Pⁿ`; read a chosen row/entry (Chapman–Kolmogorov; convergence).
    - `distribution` (L6/L7/L9): watch the state distribution evolve toward `π`.
    - **Folded stationary/PageRank display** (recommended: a 5th `display: 'stationary'` carrying an
      optional `damping: Rational`) — solve `πP=π`, check detailed balance, and run the random surfer
      (L6/L8/L9). *Open question for Dept 2/3:* fold as above vs. a sibling `stationarySolver` type;
      recommendation is to fold, honoring the one-presentation-type convention.
  - **Reused interaction types (no new work):** `prediction` (per-option `byOption` bets), `primer`
    (JIT naming: Markov property, transition matrix, Chapman–Kolmogorov, recurrent/transient/absorbing/
    period, stationary, ergodic, detailed balance, damping), `answerEntry` + `masteryChallenge`
    (exact-fraction answers: `3/8`, `4/7`, `7/13`, `1/8`, `πP=π` solutions, PageRank fractions),
    `retrievalGrid` (graded openers + the HIGH-reuse time-vs-probability interleave), `tripletReveal`
    (Markov "recurrence = matrix solve = simulation" triangulation — reuse the PHT design), `recap`
    (generate-then-reveal), `theorySimChart` (empirical mean → engine value), and `walkBoard`/`raceSim`
    + `dominanceWheel` for the gambler's-ruin / Penney's / Ehrenfest recalls (L5, L8, L9).
- **Wave-0 gate wiring (per the validate-fixtures pattern):** add the gated `lesson-markov-chains-*` to
  `scripts/validate-fixtures.ts` `GATED` / `MASTERY_LESSONS`; teach the validator to cross-check
  `chainBoard`/`stationary` headline targets against `markov.ts`; the §7 chapters-coverage gate
  (ADR-0004) already enforces every built lessonId in exactly one chapter — confirm the 10-in-4 coverage
  passes.

## Catalog hard-requirement check

- **10 built lessons:** `lesson-markov-chains-1` … `lesson-markov-chains-10` (sequential). ✓
- **Chapters cover all 10, each in exactly one:** ch-markov-chains-1 → {L1,L2,L3}; -2 → {L4,L5};
  -3 → {L6,L7,L8}; -4 → {L9,L10}. 3 + 2 + 3 + 2 = 10; no lesson omitted; no chapter references a
  non-built lesson (passes `validate-fixtures.ts` §7 / ADR-0004). ✓
- **accent ∈ {ch1..ch5}:** concept `ch3` (recommended; stub `ch1`); chapters `ch1,ch2,ch3,ch4`. ✓
- **per-lesson vizKey ∈ {coin, stateMachine, raceLanes, randomWalk, twoNode, fourNode, sum, dice}:**
  twoNode, stateMachine, fourNode, stateMachine, randomWalk, fourNode, twoNode, randomWalk, fourNode,
  dice — all in-enum. ✓  Concept `vizKey: fourNode` ∈ enum. ✓
- **glyphKey:** free-form short emblems (`P(·|now)`, `Σrow=1`, `Pⁿ`, `R/T/A`, `(I−Q)⁻¹`, `πP=π`,
  `Pⁿ→π`, `πᵢpᵢⱼ=πⱼpⱼᵢ`, `PR`, `mix`). ✓
- **`CourseSchema` identity fields present** (domain/domainOrder/order/status/tagline/accent/vizKey/
  chapters) → the concept card renders and the per-concept journey renders all 10 lessons (no PHT
  fallback). ✓
