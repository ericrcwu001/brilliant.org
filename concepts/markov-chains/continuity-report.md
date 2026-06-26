# Continuity Report — concept-markov-chains

Markov chains are the **generalization of the Pattern-Hitting-Times (PHT) state-machine spine**, so
unlike Bayes (a new tool) or Combinatorics (near-greenfield), the overlaps here are **dense and
structural**: the learner has already built absorbing chains by hand (HH/HT, THH/HTH), solved a
two-absorber birth-death chain (gambler's ruin), conditioned on a first step (PHT + Expected-Value),
and split a probability by cases (Bayes' law of total probability). The job is therefore **mostly
RE-USE** — convert PHT / gambler's-ruin / EV machinery into graded retrieval, spaced review, and
interleaving — and reserve net-new teaching for the genuinely new formalism (the transition matrix,
matrix powers, state classification, stationary `πP=π`, ergodic convergence, detailed balance,
PageRank). The single biggest risk is **re-teaching first-step analysis**; it is already shipped four
times and must be *recalled*, then lifted to matrix form.

> Lesson numbering below matches the finalized 10-lesson arc in `concept-brief.md`:
> **L1** Markov property · **L2** transition matrix (diagram ↔ matrix) · **L3** multi-step / matrix
> powers (Chapman–Kolmogorov) · **L4** classifying states · **L5** hitting & absorption · **L6**
> stationary distribution · **L7** convergence ("forgetting the start") · **L8** reversibility /
> detailed balance · **L9** PageRank · **L10** Markov in the Wild (interleaving capstone).

## Existing corpus surveyed

- **shipped (main + prod `brilliant-org`)** — 4 live concepts, 27 built lessons. `main` and
  `concept/markov-chains` are byte-identical for `fixtures/` + `src/engine/` (git-verified), so there
  are no hidden in-dev lessons.
  - **`course-pattern-hitting-times`** (domain Probability, order 0, `live`) — 7 lessons, the spine
    Markov generalizes:
    - `lesson-first-heads` — flip to first H, `E[H]=2` (geometric wait); `l0-flip` `gamblerNote` =
      **memorylessness** ("the coin has no memory"); feedback names the **absorbing state**.
    - `lesson-pattern-hitting-times` — `E[HH]=6` vs `E[HT]=4`; `primer-state` / `primer-graph`
      (**state & transition diagram**), `failure-edge` (`stateTap` transitions), `equation-tiles`
      (**first-step recurrence** `E0=1+½E1+½E0`, absorbing `E2=0`), `bias-sandbox` (**biased
      transition probs** via slider `p`), mastery `E[HHH]=14`.
    - `lesson-penneys-game` — two patterns race one stream (**absorption in a product chain**);
      `first-step-split` (first-step for a *probability*), `win-prob-tiles` (**hitting-prob vs
      hitting-time, "no +1"**), `race-the-counter` (7:1, Conway), `non-transitive-loop`
      (`dominanceWheel`).
    - `lesson-gamblers-ruin` — **birth-death chain, two absorbing barriers**; `boundary-edge`
      (absorbing $0/$4), `prob-tiles` (absorption prob `P₂=½P₃+½P₁`, no +1), `duration-tiles`
      (expected absorption time `D₂=1+½D₃+½D₁`), `guided-solve` (`P=i/N`, `D=i(N−i)`), `house-edge`
      (biased `p=0.4`; `interviewNote`: `(1−rⁱ)/(1−rᴺ), r=q/p`).
    - `lesson-states-streaks` — **interleaving checkpoint**; `mixed-primer` ("Mixed beats blocked"),
      `plus-one-or-not` (duration +1 vs prob no-+1), mastery Part A (`E[TT]=6`, pattern wait) vs
      Part B (`P₃=3/8`, walk) — **pick-the-tool, unlabeled**.
    - `lesson-longer-patterns` — transfer THH=8 / HTH=10; `failure-edge` (**partial reset** E2→E1,
      not to ∅ — richer transition structure), `overlap-ruler` (autocorrelation / Guibas–Odlyzko).
    - `lesson-overlap-shortcut` — capstone; `martingale` (`gamblerLedger`, optional-stopping / Li
      1980 ABRACADABRA, fair game `E[net]=0`), `triangulation` (`tripletReveal`: recurrence =
      martingale = simulation), mastery `E[HHHH]=30`.
  - **`course-expected-value`** (Probability, order 1, `live`) — 6 lessons:
    - `lesson-expected-value-1` — `E[X]=Σx·P(x)`; `ev1-explore` (`expectationScale` balance beam),
      `ev1-deepen` (**LLN**, long-run frequency = expectation).
    - `lesson-expected-value-2` — linearity `E[X+Y]=E[X]+E[Y]`; `ev2-recall` (fair bet `E[net]=0`).
    - `lesson-expected-value-3` — indicators `E[1_A]=P(A)`, `count=Σ indicators`; `ev3-recall`
      (gambler's-ruin `i/N`, PHT `7/8`, combinatorics `favorable/total`).
    - `lesson-expected-value-4` — **conditional & total expectation** `E[X]=Σ E[X|case]P(case)`;
      `ev4-recall` (recalls `E[HH]=6` = "condition on first flip"), `ev4-explore` (`conditionalTree`
      with self-referential **restart loop**), `ev4-model` ("PHT's E[HH]=6 came from the same move"),
      mastery `E[X]=7` (solve `E` on both sides).
    - `lesson-expected-value-5` — coupon collector `N·H_N`; `ev5-primer-geom` / `ev5-recall`
      (**geometric wait `E=1/p`**, `N/(N−k)`).
    - `lesson-expected-value-6` — order statistics `E[max]=n/(n+1)`, `E[min]=1/(n+1)`;
      ants-on-a-string. (Essentially orthogonal to Markov.)
  - **`course-bayes-rule`** (Probability, order 3, **`live`** — NOT "in-dev"; this corrects the
    kickoff brief) — 8 lessons: `lesson-bayes-rule-1` (`posterior ∝ prior×likelihood`;
    `recall-prob-split` reuses PHT "win-chance = split/no-+1 vs wait-time = +1"); `-2` (base-rate
    trap, PPV; law of total probability in the denominator); `-3` (`posterior-is-prior`
    **sequential/recursive update**, `due-vs-evidence` **gambler's-fallacy vs evidence** =
    memorylessness interleave); `-4` (`name-n-hypotheses` + `count-the-defects` **explicitly name "the
    law of total probability"** `P(E)=Σ P(E|Hᵢ)P(Hᵢ)`); `-5/-6/-7/-8` (Monty Hall, conditioning,
    prosecutor's fallacy, `spot-the-base-rate` interleaved capstone — orthogonal to Markov).
  - **`course-combinatorics`** (domain Combinatorics & Games, order 0, `live`) — 6 lessons: counting
    principle, perms/combos, binomial theorem, inclusion–exclusion, pigeonhole, counting
    probabilities. **Orthogonal** (counting, different domain) — no Markov dedupe.
- **in-dev (open `concept/*` branches + dev)** — **none.** `git branch -a` shows only `main` and
  `concept/markov-chains` (no `concept/bayes-rule` — bayes is already shipped to `main`). The only
  non-live courses are `coming_soon` stubs with empty `lessons[]` / `roadmap[]`:
  `course-markov-chains` (this), `course-optimal-stopping`, `course-game-theory`. There is **no built
  lesson to dedupe against outside the 27 shipped above.**
- **relevant engines** (one line each — reuse candidates for a future `src/engine/markov.ts`; none
  exists yet):
  - `automaton.ts` — **absorbing Markov chain** over KMP prefix-states: `transitions` (sparse
    transition matrix), `recurrences` (first-step eqns), `expectedTimes` (expected **hitting /
    absorption times**) via `solveLinearSystem` (Gauss-Jordan over exact rationals); `prefixFunction`;
    Rational toolkit `reduce / toRational / ratAdd / ratSub / ratMul / ratDiv / ratNum`.
  - `walk.ts` — **birth-death chain** (`buildWalk`): `reachProb` / `ruinProb` (**absorption
    probabilities**), `duration` (**expected absorption time**) via `solveInterior` +
    `solveLinearSystem`; `simulateWalk / traceWalk / batchWalkStats / walkDurationHistogram` (Monte-Carlo).
  - `race.ts` — **product of two chains** on one stream: `penneyOdds` (**absorption probabilities**),
    `conwayLeadingNumbers`, `winMatrix`, `simulateRace / traceRace / batchRace`.
  - `simulate.ts` — **generic chain Monte-Carlo**: `nextStateOf` (**one-step transition application**),
    `flipsToAbsorption` (sampled hitting time), `empiricalMean`, `mulberry32` (seedable RNG).
  - `expectation.ts` — `totalExpectation` (**first-step analysis solver**: self-referential `restart`
    → `solveLinearSystem`); `indicatorExpectation`, `harmonic`, `couponCollector` (`N·H_N`),
    `expectedValue` (`Σx·P(x)`).
  - `correlation.ts` — autocorrelation borders + `Σ2^k` (fair-coin hitting-time shortcut);
    `gamblerLedger` (martingale). (Alternative to first-step analysis, not chain machinery.)
  - `bayes.ts` — `bayesPosterior` (n-hyp **renormalization** = total-probability denominator),
    `sequentialPosterior` (fold k IID = **repeated application**, loose matrix-power analogue),
    `naturalFrequencies`.
  - `combinatorics.ts` — BigInt counting. **Orthogonal** (only the exact-arithmetic discipline carries).
  - `types.ts` — `Rational {n,d}`; `Transition.kind` (`advance | self-loop | reset`) +
    `AutomatonState.absorbing` — the **chain state/transition primitives** to generalize.

sources: `fixtures/lesson-*.json` + `fixtures/course-*.json` on `concept/markov-chains` (== `main`,
git-verified); `src/engine/*`. Firestore via Firebase MCP **skipped** — on-disk fixtures are
authoritative and branch parity is git-confirmed, so the MCP step would add nothing.

## Overlap analysis

| existing lesson/beat/engine | overlapping idea | verdict | action (→ planned Markov lesson/beat) |
|---|---|---|---|
| `lesson-first-heads` / `l0-flip` `gamblerNote`; `lesson-gamblers-ruin` / `gamblers-fallacy`; `lesson-bayes-rule-3` / `due-vs-evidence` | **memorylessness** ("coin has no memory"); the **absorbing state**; geometric `E=1/p` | **reuse-as-recall** | Open **L1 (Markov property)** with a `retrievalGrid` recalling "each flip ignores the past" → reveal it as *"the next state depends only on the current state."* Zero new teaching; it's the springboard. |
| `lesson-pattern-hitting-times` / `primer-graph`, `primer-state`, `failure-edge` (`stateTap`) | **transition diagram** (states + labeled H/T edges) | **reuse-as-pattern + reuse-as-recall** | **L2 (transition matrix)** reuses the `stateMachine` viz and `stateTap` design; open with a graded recall of the HH graph, then generalize beyond "prefix-of-a-pattern" states to arbitrary states (weather, Ehrenfest), and lay the diagram's edges into a grid. |
| `lesson-pattern-hitting-times` / `equation-tiles` (½/½ split), `bias-sandbox` (slider `p`); `lesson-gamblers-ruin` / `house-edge` (`p=0.4`) | each state's outgoing probabilities **sum to 1**; **non-uniform** transition probs | **reuse-as-recall** | **L2 (transition matrix)** opens by recalling the per-state ½/½ (and biased `p`) splits the learner already built, then **stacks the rows into a matrix** (rows sum to 1). Recall the bias-sandbox so "biased" isn't new. |
| `lesson-penneys-game` / `first-step-split`; `lesson-bayes-rule-3` / `posterior-is-prior`; `bayes.ts` `sequentialPosterior`; `simulate.ts` `nextStateOf` | **stepping the process forward repeatedly** / sequential one-step decomposition | **reuse-as-recall + dedupe(engine)** | **L3 (matrix powers / Chapman–Kolmogorov)** recalls "after the first flip, condition on where you are" → multi-step `Pⁿ`. Reuse `nextStateOf` iterated; cite `sequentialPosterior` as the same "apply, renormalize" move. |
| `lesson-bayes-rule-4` / `name-n-hypotheses`, `count-the-defects`; `bayes.ts` `bayesPosterior` | **law of total probability** `P(E)=Σ P(E|Hᵢ)P(Hᵢ)` | **reuse-as-recall** | **L3** names Chapman–Kolmogorov `P(X₂=k)=Σⱼ P(X₂=k|X₁=j)P(X₁=j)` as *"the law of total probability you used in Bayes, one step at a time."* Do **not** re-derive case-splitting. |
| `lesson-first-heads` (absorbing); `lesson-gamblers-ruin` / `boundary-edge`; `types.ts` `absorbing`, `Transition.kind` (`advance/self-loop/reset`) | **absorbing** vs non-absorbing; reset/self-loop = recurrence flavor | **reuse-as-recall + interleave** | **L4 (classifying states)** recalls absorbing ($0/$4, E_L) as the anchor, then teaches **transient / recurrent / periodic / communicating** as new. Interleave **"transient vs recurrent"**, and seed **"absorbing (stuck) vs ergodic (forgets)"** for L7. |
| `lesson-pattern-hitting-times` / `equation-tiles`, `guided-solve`; `lesson-gamblers-ruin` / `prob-tiles`, `duration-tiles`; `lesson-expected-value-4` / `ev4-model`, `ev4-explore` (`conditionalTree`); `automaton.expectedTimes`, `walk.reachProb` / `duration`, `expectation.totalExpectation` | **first-step analysis** for hitting **time** and absorption **probability** — shipped **4×** | **reuse-as-recall (HIGH dedupe risk)** | **L5 (general hitting/absorption)** — *the duplication-risk lesson.* Open with a `retrievalGrid` over `E0=1+½E1+½E0`, `P=i/N`, `E[X]=Σ E[X|case]P(case)`, then **immediately lift to matrix form**: `(I−Q)t = 1` and `B=(I−Q)⁻¹R`. Reuse `solveLinearSystem` + `totalExpectation`; **never re-derive**. |
| `lesson-penneys-game` / `win-prob-tiles`, `dominanceWheel`; `race.ts` `penneyOdds`, `winMatrix` | **absorption probability in a product chain**; ranking with **no single "best"** | **dedupe(engine) + interleave** | In **L5**, cite Penney's as *the* worked absorption-probability instance (reuse `penneyOdds`), don't rebuild. Carry `dominanceWheel`'s "no best pattern" forward to **L9 (PageRank)** as "ranking without a champion." |
| `lesson-penneys-game` / `prob-vs-duration`, `win-prob-tiles`; `lesson-states-streaks` / `plus-one-or-not`; `lesson-bayes-rule-1` / `recall-prob-split` | **hitting TIME (+1 each step) vs hitting PROBABILITY (no +1, just a split)** | **reuse-as-pattern (interleave)** | Reuse this exact `retrievalGrid` widget in **L5** as the interleave **"expected hitting time vs absorption probability"** — the corpus's most reusable discrimination, already authored three times. |
| `lesson-expected-value-5` / `ev5-primer-geom`, `ev5-recall` (`E=1/p`) | **geometric wait `E=1/p`** | **reuse-as-recall** | **L6 (stationary `πP=π`)** opens by recalling `E=1/p`, then reveals **Kac's formula**: mean return time to state `i` `= 1/πᵢ`. New formalism, familiar anchor. |
| `lesson-expected-value-1` / `ev1-explore` (`expectationScale`), `ev1-deepen` (**LLN**) | **weighted average**; long-run frequency = expectation | **reuse-as-recall** | **L6** frames `π` as the **long-run weighted average** of time-in-state (recall the balance beam). **L7 (convergence/ergodicity)** recalls LLN → **ergodic theorem** (time-average = space-average). |
| `lesson-first-heads` / `gamblers-fallacy` (memorylessness); `lesson-bayes-rule-3` / `due-vs-evidence` | "the past doesn't matter" | **interleave** | **L7** interleaves **"absorbing (never forgets — it's stuck) vs ergodic (forgets the start)"** — same memorylessness idea, opposite long-run fate; the contrast *is* the lesson. |
| `lesson-gamblers-ruin` (birth-death, symmetric `P=i/N`); `walk.ts` `buildWalk` | nearest-neighbor / **birth-death** structure | **reuse-as-recall** | **L8 (reversibility / detailed balance)** recalls the gambler's-ruin line graph as the canonical **reversible** chain; detailed balance `πᵢPᵢⱼ=πⱼPⱼᵢ` is natural there. Reuse `walk.ts` for the demo. |
| `lesson-overlap-shortcut` / `martingale` (`gamblerLedger`), `triangulation` (`tripletReveal`) | fair-game / optional-stopping proof; triple-lens convergence | **dedupe + reuse-as-pattern** | Offer the martingale only as an **optional aside** in L5 (don't make it core). **Reuse the `tripletReveal` design** for a Markov "recurrence = matrix solve = simulation" triangulation beat. |
| `lesson-expected-value-2` / `ev2-recall` (linearity); `lesson-expected-value-3` / `ev3-model` (`count=Σ 1_A`) | linearity / **count = sum of indicators** | **reuse-as-recall (light)** | In **L6**, expected number of visits to `j` `= Σ_t P(X_t=j)` (indicators + linearity) — recall, don't re-teach. Minor bridge. |
| `lesson-states-streaks` / `mixed-primer`, mastery Part A/B; `recap-streak` `interviewNote` | **interleaving design** (mixed, unlabeled, pick-the-tool) | **reuse-as-pattern** | Build the **L10 (Markov in the Wild) interleaving capstone** on this template: an unlabeled mastery mixing *hitting time*, *absorption probability*, and *stationary share* (+ "is this chain ergodic or absorbing?"). Copy the design, not the content. |
| `automaton.ts` (`buildAutomaton`, `solveLinearSystem`, `prefixFunction`, Rational toolkit); `walk.ts`; `race.ts`; `simulate.ts`; `expectation.totalExpectation`; `types.ts` | the chain math already exists in special-case form | **reuse-as-pattern** | **Build `src/engine/markov.ts` on top of these**: general `P` (n×n), `Pⁿ`, classify states, `(I−Q)t=1` / `(I−Q)⁻¹R`, `πP=π` (same `solveLinearSystem` + normalize), simulate via `nextStateOf` / `mulberry32`. One exact-math source of truth; no new linear-algebra copies. |
| `course-combinatorics` (all 6); `combinatorics.ts`; `lesson-expected-value-6` (order statistics) | counting / `nCk` / `2ⁿ`; extremes of IID draws | **no overlap** | None — different ideas; note only. (Only the shared exact-rational discipline carries over.) |

## Active-recall plan (learning science)

- **retrieval warm-ups (graded openers — one per new lesson where possible):**
  - memorylessness (`first-heads` `l0-flip` / `gamblers-fallacy`) → **L1** opener (`recall-no-memory`):
    "next depends only on where you are now."
  - HH state graph + the per-state ½/½ (and biased `p`) split (`pattern-hitting-times` `primer-graph`,
    `equation-tiles`, `bias-sandbox`; `gamblers-ruin` `house-edge`) → **L2** opener
    (`recall-rows-sum-to-1`): turn the diagram you know into a matrix whose rows sum to 1.
  - "condition on the first step" (`penneys-game` `first-step-split`; `bayes-rule-4` `count-the-defects`
    = law of total probability) → **L3** opener (`recall-total-prob`) → Chapman–Kolmogorov.
  - absorbing states (`first-heads`; `gamblers-ruin` `boundary-edge`) → **L4** opener (`recall-absorbing`).
  - first-step recurrence (`equation-tiles` `E0=1+½E1+½E0`; `gamblers-ruin` `prob-tiles` /
    `duration-tiles`; EV-4 `ev4-recall` `E[HH]=6`) → **L5** opener (`recall-first-step`) → lift to
    `(I−Q)t=1`.
  - geometric `E=1/p` (`ev5-recall`) → **L6** opener (`recall-geometric`) → Kac `1/πᵢ`.
  - LLN / long-run average (`ev1-deepen`, `expectationScale`) → **L7** opener (`recall-LLN`) → ergodic
    theorem.
  - gambler's-ruin birth-death symmetry → **L8** opener (`recall-birth-death`) → detailed balance.
  - Penney's `dominanceWheel` "no best" + `bayesPosterior` renormalization → **L9** opener
    (`recall-no-champion` / `recall-renormalize`) → PageRank ranking = stationary dist.
  - a mixed recall of the whole toolkit → **L10** opener (`recall-pick-the-tool`).
- **interleaving (confusable pairs, mixed mid-lesson):**
  - **hitting TIME vs hitting PROBABILITY** (reuse `penneys-game` `win-prob-tiles` / `states-streaks`
    `plus-one-or-not` / `bayes-rule-1` `recall-prob-split`) → an **L5** mixed `retrievalGrid`
    ("+1 per step" vs "no +1, just a split").
  - **transient vs recurrent** → an **L4** classification beat over a chain with both.
  - **absorbing vs stationary** → an **L6** beat: gambler's-ruin (gets stuck at a wall) vs a regular
    chain (settles to `π`) — same `πP=π` fixed-point lens, opposite meaning.
  - **absorbing (never forgets) vs ergodic (forgets the start)** → an **L7** beat folding in the
    memorylessness recall.
  - **course-level pick-the-tool** (model on `states-streaks` mastery): unlabeled scenarios where the
    learner must choose *hitting time / absorption probability / stationary share* (+ "ergodic or
    absorbing?") — the **L10** interleaving capstone.
- **spaced re-surfacing:**
  - **first-step analysis** recurs at **L3** (Chapman–Kolmogorov = multi-step first-step), **L5**
    (absorption / hitting), and **L6** (`πP=π` is the same one-step relation at its fixed point) —
    three spaced hits across the concept.
  - **memorylessness** introduced **L1**, contrasted at **L4** (absorbing never forgets), re-surfaced
    at **L7** (ergodic "forgetting the start" = memorylessness at the distribution level).
  - **the ½/½ transition split** (PHT) → matrix rows (**L2**) → the random surfer's uniform out-links
    (**L9**), closing the loop on "where do the probabilities come from."
  - **exact-rational fluency** (PHT `7/8`, `i/N`; EV; Bayes posteriors) continues through `πP=π`
    solutions and fundamental-matrix `(I−Q)⁻¹` entries — same `Rational` toolkit, same "answers stay
    exact fractions" habit.
