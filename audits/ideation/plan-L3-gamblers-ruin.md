# L3 Plan — Gambler's Ruin (`lesson-gamblers-ruin`)

**Agent:** 2 of 5 (Markov / first-passage lens)  
**Course position:** L3 on unlock path (after L2 Penney's Game, before L4 Overlap Shortcut)  
**Milestone:** `gamblers-ruin-solved` · unlocks `lesson-overlap-shortcut` · contributes to `three-lessons-complete`  
**Headline:** *"How a Fair Game Still Breaks You"*  
**One-line:** The same first-step machine on a number line with two walls → a **probability** *and* a **duration**; a tiny edge is catastrophic.

**Canonical IDs:** `lessonId: lesson-gamblers-ruin` · `courseId: course-pattern-hitting-times` · `patternOptions: []` (parameter-driven: `N`, `i`, `p` — not H/T pattern strings)

> (review: `patternOptions: []` will **crash** the player as written. `LessonPlayer.tsx` does `const pattern = lesson.patternOptions[0]; buildAutomaton(pattern, 0.5)`, and `buildAutomaton(undefined,…)` throws on its `/^[HT]+$/` guard. Use a harmless placeholder `patternOptions: ["HH"]` (the walk beats ignore that automaton and build their own model) **or** guard the `buildAutomaton` call in `LessonPlayer`. See "Implementation" → "How the walk model reaches beats".)

---

## Research (with sources)

### Textbook & formal sources

| Topic | Result | Source |
|---|---|---|
| Fair ruin probability (reach `N` before `0`) | `P_i = i/N`; ruin `= (N−i)/N` | Grinstead & Snell, *Introduction to Probability*, Ch. 12.2 "Gambler's Ruin" — [LibreTexts mirror](https://stats.libretexts.org/Bookshelves/Probability_Theory/Introductory_Probability_(Grinstead_and_Snell)/12%3A_Random_Walks/12.02%3A_Gambler%27s_Ruin) |
| Fair expected duration to absorption | `D_i = i(N−i)`; peaks at midpoint | Grinstead & Snell Ch. 12.2; derivation via `D_{k+1}−D_k` arithmetic sequence — [Math.SE 1533005](https://math.stackexchange.com/questions/1533005/gamblers-ruin-stopping-time) |
| Biased win probability | `P_i = (1−r^i)/(1−r^N)`, `r = q/p` | Columbia IEOR notes (first-step on `P_{i+1}−P_i`) — [ks20 FE Notes PDF](http://www.columbia.edu/~ks20/FE-Notes/4700-07-Notes-GR.pdf); [Wikipedia Gambler's ruin](https://en.wikipedia.org/wiki/Gambler%27s_ruin) |
| Biased expected duration | `D_i = i/(q−p) − (N/(q−p))·(1−r^i)/(1−r^N)` | Grinstead & Snell Ch. 12.2; agent-2 markov notes cross-check |
| Absorbing-chain view | `B = N·R` gives exit odds; `t = N·1` gives duration | Grinstead & Snell Ch. 11.2 absorbing chains — ties to existing `solveLinearSystem` |
| Martingale doubling fails | Fair game ⇒ EV = 0; finite bankroll ⇒ positive ruin prob; optional stopping | Wikipedia [Martingale (betting system)](https://en.wikipedia.org/wiki/Martingale_(betting_system)); Fiveable [Applications of martingales](https://fiveable.me/stochastic-processes/unit-10/applications-martingales/study-guide/SS7v0wB5rGaY0qqk) |
| Pólya recurrence vs transience | Symmetric walk on `ℤ^d` recurrent for `d=1,2`, transient for `d≥3` | MIT 18.095 [Pólya notes PDF](https://math.mit.edu/classes/18.095/lect2/notes.pdf); Kakutani quote in [Dartmouth handout](https://math.dartmouth.edu/~pw/math100w13/mare.pdf) |
| Infinite opponent / level crossing | Fair player vs infinite bankroll ⇒ ruin w.p. 1 (1-D recurrent return to 0) | Wikipedia Gambler's ruin; wikidoc Random walk "gambler's ruin" section |

### Quant-interview canon

| Source | Gambler's-ruin role |
|---|---|
| Zhou, *A Practical Guide to Quantitative Finance Interviews* (Green Book), Ch. 5.1 Markov chains | First-passage / hitting-time prototype; expected steps + barrier odds |
| Joshi, *Quant Job Interview Questions and Answers* | First-step analysis on walks; "probability A before B" |
| Mosteller, *Fifty Challenging Problems in Probability* | Classic puzzle framing ($i vs $N−i stakes) |
| Crack, *Heard on the Street* | Fair-game intuition traps; bankroll / sizing stories |
| techinterview.org, "Random Walks and Stopping Times" | `P(hit +N before −M) = M/(N+M)` fair case; biased `(1−(q/p)^M)/(1−(q/p)^{N+M})`; trading ruin analogy |

**Interview frequency:** Tier-1 staple alongside "expected rolls until double-six" and Penney's. Tests whether the candidate can (a) write **two** recurrences from one graph, (b) resist "fair ⇒ 50/50 is safe," (c) connect a microscopic edge to macroscopic ruin.

### Repo alignment

- **Continues L1:** same `solveLinearSystem`, `equationTiles`, `stateTap`, `substitution`, `theorySimChart`, `BiasChart`, `StateGraph` left-to-right layout.
- **Continues L2:** win-probability recurrence (no `+1`, boundary 1/0) now on a **line** instead of a merged pattern chain; learner must not reflexively add flip cost.
- **Sets up L4:** martingale / fair-casino beat is a one-line teaser ("optional stopping will re-derive waits a new way"); overlap shortcut deferred.
- **Engine gap:** `simulate.ts` has `flipsToAbsorption` for single-absorber automata; L3 needs `buildWalk` + `simulateWalk` recording **which wall** and **step count**.
- **Authoring caveat:** `equationDiagnosis.ts` is HH-specific — L3 needs generalized diagnosis for `P`-tiles (constant 0/1, vars `P0..PN`) and `D`-tiles, or row-level `equationChecker` fallback.

> (review: the coupling is **wider than just `equationDiagnosis`** and is the single biggest authoring risk. `diagnoseRow`/`checkRow` are pure and generic and will work, BUT: (i) `equationDiagnosis`'s *fallback* hint `wrong-var-generic` literally says "one flip finishes **HH** and the other resets" — wrong for a walk; (ii) `EquationTilesBeat.tsx` hard-codes HH chrome: `E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `E0_TERM_TIPS`, `TOKEN_TIPS`, the `renderStaticRow` note ("Absorbing state — HH matched"), and `isExampleRow` keys on `lhs==='E0'` (but E0 is a *boundary* in the walk, not the worked interior row); (iii) on solve it writes `theoreticalValue: automaton.expectedTimes['E0']` — the placeholder HH value, not `P_2`/`D_2`. ⇒ Reuse the **pure graders** but ship a dedicated `WalkEquationTilesBeat` with walk chrome + fixture-authored hints; do not retrofit the flagship beat. Same story for `SliderBeat` (writes `theoreticalValue: automaton.expectedTimes.E0`).)

---

## Core learning promise (one idea)

First-step analysis is **arena-independent**. On a 1-D random walk between absorbing walls `0` and `N`, the same Markov machine answers **two different questions**:

1. **Probability:** `P_i = P(reach N before 0 | start i)` — recurrence has **no `1+`**, boundaries **`P_0=0`, `P_N=1`**.
2. **Duration:** `D_i = E[steps until absorption | start i]` — recurrence has the familiar **`1+`**, boundaries **`D_0 = D_N = 0`**.

Fair coin: **`P_i = i/N`** and **`D_i = i(N−i)`**. Against a deep pocket (large `N`) or a tiny house edge ( `p < ½` ), ruin is near-certain — and a fair game is **not** safe.

---

## Quant relevance

- **Risk of ruin / stop-loss:** Every sizing discussion reduces to "probability of hitting zero before target."
- **First-passage template:** `P(A before B)` and `E[T_{A∪B}]` appear in trading, credit, and MC pricing interviews.
- **House edge amplification:** A 48/52 coin is not "slightly worse" — from the middle of a finite ladder, ruin jumps to ~69% (`N=4`, `i=2`, `p=0.4`).

> (review: number/label mismatch — verified by engine. `48/52` is `p=0.48`, which gives ruin **≈ 54%**, not 69%. The **~69%** figure is `p=0.40` (a `60/40` coin), as the parenthetical itself says. Pick one framing: either keep the dramatic `p=0.40` demo and call it a "60/40 / 10-point edge", or demo `p=0.48` and quote "even a 2-point edge → ruin ≈ 54%". Ladder of verified values from the middle: `p=0.49→52%`, `0.48→54%`, `0.45→60%`, `0.40→69%`. NB: the closed form is `0/0` at `p=0.5` (`r=1`) — `walk.ts.closedForm.reach` must special-case `r===1 → i/N`.)
- **Martingale trap:** Doubling after losses has EV 0 in a fair game but **guaranteed** failure with finite bankroll and table limits — interviewers use this to test optional-stopping intuition (full proof lives in L4).
- **Kelly / sizing foreshadow:** L3 ends with "edge × finite horizon × absorbing boundary" — no Kelly formula, but the emotional core of why sizing matters.

**Productive wrong paths (interview-shaped):**

- "Fair coin ⇒ can't go broke before $N."
- "Ruin probability is 50% from the middle" (true only when `P(reach N) = 50%`, i.e. fair *and* symmetric stakes — still not "safe").
- Adding `1+` to the **probability** recurrence (habit from L1/L2 duration and L2 win-prob contrast).
- "Expected duration grows linearly with stake" (it's **`i(N−i)`**, parabolic, max at center).
- "A 2% edge ⇒ ~2% more ruin" (response is **nonlinear**, cliff near `p = ½`).

---

## The math (worked, engine-verifiable)

### Model

- States `0, 1, …, N` (wealth). `0` and `N` absorbing.
- From interior `i`: `+1` w.p. `p`, `−1` w.p. `q = 1−p`.
- Engine labels: `E0..EN` aligned with wealth; `H` = up, `T` = down (reuse coin semantics).

### Probability recurrence (reach `N`)

`P_i = p·P_{i+1} + q·P_{i−1}` for `1 ≤ i ≤ N−1`, with **`P_0 = 0`**, **`P_N = 1`**.

| Case | Closed form | Ruin prob |
|---|---|---|
| Fair `p = ½` | `P_i = i/N` | `(N−i)/N` |
| Biased `p ≠ ½`, `r = q/p` | `P_i = (1 − r^i)/(1 − r^N)` | `1 − P_i` |

**Worked (fair, `N=4`):**

| `i` | `P_i` (reach 4) | Ruin | `D_i = i(N−i)` |
|---|---|---|---|
| 1 | ¼ | ¾ | 3 |
| 2 | ½ | ½ | **4** (max) |
| 3 | ¾ | ¼ | 3 |

**Worked (house edge, `N=4`, `i=2`, `p=0.4`, `r=1.5`):**

- `P_2 = (1 − 1.5²)/(1 − 1.5⁴) = (1 − 2.25)/(1 − 5.0625) ≈ **0.308**` ⇒ **ruin ≈ 0.692**.
- `D_2 ≈ 2/0.2 − (4/0.2)·0.308 ≈ **3.85**` (still finite, but win odds collapsed).

> (review: all three prose values **verified ✓** by exact-rational solve at `p=2/5`, `q=3/5`. The *exact* values — which the golden tests must assert, not decimal approximations — are `P_2 = 4/13 ≈ 0.30769`, `ruin = 9/13 ≈ 0.69231`, `D_2 = 50/13 ≈ 3.84615`. Independently confirmed by Gauss-Jordan over rationals and by direct first-step solve.)

**Infinite bankroll limit (`N → ∞`, fair, fixed `i`):** `P_i → 0` — you almost surely go broke first. Links to 1-D recurrence (walk returns to 0 infinitely often, but that is a *different* stopping rule).

### Duration recurrence

`D_i = 1 + p·D_{i+1} + q·D_{i−1}` for `1 ≤ i ≤ N−1`, with **`D_0 = D_N = 0`**.

Fair closed form: **`D_i = i(N−i)`** — symmetric parabola, peak at `i = N/2`.

### Distribution shape (simulation teaching point)

- Mean duration is **`i(N−i)`**, but the **step-count distribution is heavy-tailed** (long back-and-forth before absorption). Mean-only charts understate variance — motivates **DistributionHistogram**.
- For fair walk, duration variance scales like **`O(N⁴)`** at the center (order-of-magnitude authorship note for copy, not a graded target).

### Pólya teaser (Extension beat only)

- 1-D symmetric walk on all of `ℤ` (no upper wall): **recurrent** (returns to start w.p. 1) but **null-recurrent** (expected return time infinite).
- 3-D symmetric walk: **transient** — "drunk bird never comes home" (Kakutani).
- Lesson copy: one sentence + optional diagram; **not tested**. Bridges to post-MVP "random walks in higher dimensions."

### Martingale-doubling teaser (misconception beat)

- Strategy: double bet after each loss on a fair coin. Requires unbounded bankroll for guaranteed recovery.
- With bankroll `B`, can tolerate at most `⌊log₂ B⌋` consecutive losses before bust.
- Optional stopping / bounded martingale ⇒ **no free lunch**; frequent small wins, rare catastrophic loss. Full martingale proof deferred to L4.

---

## Engine

### New module: `src/engine/walk.ts`

Pure, dependency-free, exact-rational, golden-testable — same style as `automaton.ts`.

```ts
type Wealth = number // 0..N

type WalkAutomaton = {
  N: number
  p: number
  states: AutomatonState[]           // E0..EN, labels "0".."N"
  transitions: Transition[]          // H: i→i+1 advance, T: i→i−1 "reset" toward 0
  // Probability system (tile targets)
  reachProbRecurrences: Record<StateId, CanonicalRecurrence>  // constant 0, no +1
  reachProbs: Record<StateId, Rational>                         // P_i, P_0=0, P_N=1
  ruinProbs: Record<StateId, Rational>                           // 1 - P_i
  // Duration system (tile targets)
  durationRecurrences: Record<StateId, CanonicalRecurrence>    // constant 1
  expectedDurations: Record<StateId, number>                    // D_i, D_0=D_N=0
  substitutionSteps: {
    reach: SubstitutionStep[]   // guided solve for P_2 etc.
    duration: SubstitutionStep[]
  }
  // Closed forms for charts (cross-check)
  closedForm: {
    reach(i: number): Rational
    duration(i: number): number
  }
}

function buildWalk(N: number, p: number): WalkAutomaton

type WalkOutcome = { end: 0 | 'N'; steps: number; path: Wealth[] }

function simulateWalk(
  start: Wealth,
  walk: WalkAutomaton,
  rng: () => number,
): WalkOutcome

function batchWalkStats(
  start: Wealth,
  walk: WalkAutomaton,
  n: number,
  rng: () => number,
): {
  ruinRate: number
  winRate: number
  meanSteps: number
  stepHistogram: Array<{ bin: [number, number]; count: number }>
}
```

**Implementation notes:**

- Reuse exported `solveLinearSystem` from `automaton.ts` (or factor to `src/engine/linear.ts` if needed — prefer **import from automaton** to minimize diff).
- **Reach system:** For each transient `i`, row `P_i − p·P_{i+1} − q·P_{i−1} = 0`; replace row `0` with `P_0 = 0`, row `N` with `P_N = 1`. Equivalent to `(I−Q)·P = b` with `b` encoding boundaries.
- **Duration system:** Same `(I−Q)` structure as flagship: `D_i = 1 + p·D_{i+1} + q·D_{i−1}` ⇒ row of `(I−Q)` with RHS `1`.
- **Transition kinds:** `H` from `i` → `i+1` is `advance`; `T` from `i` → `i−1` is `reset` (visual: arrow bends back — reuse flagship reset curve).
- **Cap:** `N ≤ 6` for mobile legibility (7 nodes max on WalkBoard).
- **Default lesson parameters:** `N = 4`, `i = 2`, `p = 0.5` (matches hook "$2 until $4 or $0").

### Schema additions (`src/content/schema.ts`)

Extend `InteractionSchema`:

```ts
| { type: 'walkBoard'; mode: 'single' | 'sandbox' | 'liveSolve'; defaultN: number; defaultStart: number; defaultP: number; maxN: number }
| { type: 'walkerSwarm'; count: number; defaultN: number; defaultStart: number; defaultP: number }
| { type: 'distributionHistogram'; metric: 'duration' | 'outcome'; binCount: number }
| { type: 'ruinLandscape'; mode: 'reach' | 'duration' | 'both' }
| { type: 'theorySimChart'; variant: 'walkRuin' | 'walkDuration' }  // extend existing
```

> (review: two corrections to this block, verified against `src/content/schema.ts`.
> 1. **`theorySimChart` cannot be "extended" as drawn.** The real variant is field-less — `z.object({ type: z.literal('theorySimChart') })` — and `TheorySimChartBeat` is hard-wired to `automaton.expectedTimes[...]` + `flipsToAbsorption(automaton)` (single-absorber). Adding `variant` is a real schema edit **and** forces either a branch inside that beat or (cleaner) a **new** `walkSimChart` variant + `WalkSimChartBeat`. Recommend the new variant — don't entangle the working flagship beat.
> 2. **The Zod tile coefficients force the fair coin.** `equationChecker.probToRational` grades **only** `'1/2'` (returns `null` for `'p'`/`'1-p'` → reported as wrong-coeff), and `TileSchema.prob` is the closed enum `['1/2','p','1-p']` (no `'2/5'`/`'3/5'`). So the two equation beats (5–6) are **gradable only at `p=0.5`** with `1/2` tiles; the biased recurrence is chart/landscape-only. See "Biased-prob tile gap".)

### Fixture shape

- `patternOptions: []` or `["walk"]` placeholder — lesson is **parameter-driven**, not pattern-pick.
- Store authored defaults: `{ N: 4, start: 2, p: 0.5 }` in fixture metadata (new optional `lessonParams` object — schema bump v2 if needed).

> (review: `["walk"]` is also unsafe — `buildAutomaton("walk",…)` throws (`/^[HT]+$/`). Use `["HH"]` as the inert placeholder, **or** carry `defaultN/defaultStart/defaultP` inside each walk interaction variant (the proposed schema already does this) so no lesson-level params object is needed and the placeholder automaton is simply unused. Prefer the per-interaction params — it avoids a `LessonSchema` bump.)

---

## Beat-by-beat (12 beats)

| # | beatId | interaction | phase | Required | Teaches (one thing) | Wrong-path it manufactures |
|---|--------|-------------|-------|----------|---------------------|----------------------------|
| 1 | `open-bet` | `prediction` | Bet | ✓ | Fair ≠ safe; ask P(ruin first) from $2 targeting $4. | "0% — it's fair" / "50% so I'm fine" / "martingale doubling guarantees profit." |
| 2 | `walk-once` | `walkBoard` (`single`) | Explore | ✓ | One token performs a random walk until a wall absorbs it. | Expect paths to "even out" and wander forever. |
| 3 | `boundary-edge` | `stateTap` | Model | ✓ | From interior `i`: H→`i+1`, T→`i−1`; walls `0` and `N` absorb. | Tap wrong neighbor; miss that walls stop the walk. |
| 4 | `ruin-board` | `walkBoard` (`liveSolve`) | Model | ✓ | Drag **start**, **walls** (`N`), **bias** `p`; outcome bar + `E[duration]` recompute live. | Drag start toward a wall and expect bar not to tilt; expect linear response to `p`. |
| 5 | `ruin-tiles` | `equationTiles` | Model | ✓ | **Probability** recurrence: `P_i = p·P_{i+1} + q·P_{i−1}` — **no `1+`**, boundaries `P_0=0`, `P_N=1`. | Reflexively add `1+` (L1/L2 habit); swap boundary 0/1. |
| 6 | `duration-tiles` | `equationTiles` | Model | ✓ | **Duration** recurrence: `D_i = 1 + p·D_{i+1} + q·D_{i−1}`, boundaries `D_0=D_N=0`. Side-by-side contrast with beat 5. | Drop the `1+`; use boundary 1; conflate `P` and `D` rows. |
| 7 | `predict-both` | `slider` (dual) | Model | ✓ | Lock guesses for **P(ruin)** and **D_2** before the solve. | Guess duration linear in stake (~2 flips); guess ruin 0% or 50% without reasoning. |
| 8 | `guided-solve` | `substitution` | Model | ✓ | Tap through symmetric solve to **`P_2 = ½`**, **`D_2 = 4`**. | Mis-order substitutions; apply duration algebra to P-system. |
| 9 | `swarm-prove` | `walkerSwarm` + `theorySimChart` (`walkRuin`) | Prove | ✓ | Release ~100 walkers; ruin bar fills toward **`i/N`**; toggle duration mean → **`i(N−i)`**. | Trust noise at n<200; call early variance "the formula is wrong." |
| 10 | `duration-spread` | `distributionHistogram` | Prove | ✓ | Bin 1,000 walk lengths; fat tail vs mean marker at **`D_i`**. | "Mean tells the whole story" — histogram shows skew/heavy tails. |
| 11 | `house-edge` | `walkBoard` + `ruinLandscape` + `BiasChart` | Prove | ✓ | Drag `p` off ½; **`P_i` landscape warps** from line to cliff; **`N=4, p=0.4, i=2`** ruin ≈ 69%. | Expect gentle linear shift; believe 48/52 ≈ "almost fair." |
| 12 | `recap` | `recap` | Prove | ✓ | Retrieval: `P=i/N`, `D=i(N−i)`; fair vs infinite bankroll; tiny edge; P vs D recurrence contrast. | — |

**Extension (optional, does not block completion):**

| beatId | interaction | phase | Teaches |
|---|---|---|---|
| `infinite-wall` | `walkerSwarm` + narrative | Prove | Fair walk on `ℤ` returns to 0 w.p. 1 (Pólya `d=1`); 3-D transient teaser. |
| `martingale-trap` | `prediction` | Bet | Doubling strategy busts with finite bankroll (setup for L4 martingale). |

---

## Interactable widgets

### WalkBoard / RuinBoard *(new, large — lesson centerpiece)*

| Dimension | Spec |
|---|---|
| **Manipulate** | Drag **start token** and **wall handle** (sets `N`; left wall fixed at 0); **coin-bias** slider `p` (also DOM stepper for tap-only). Buttons: **Walk once**, **Reset**. |
| **Responds** | Stacked **outcome bar** (reach-`N` vs ruin); **`E[duration]`** readout; faint **ruin-heat ribbon** under the lattice tinting each position by `P(ruin)`; single-walk **sparkline** on "Walk once." |
| **Feedback loop** | Dragging start toward `0` visibly raises ruin slice; nudging `p` below ½ collapses win slice — aha lives in the drag. Graded beats check predictions against engine values. |
| **Build** | Konva lattice reusing `StateGraph` node layout (number line); draggable handles commit on **drag-end** only; DOM slider + `aria-live` numeric mirror; reduced-motion: instant bar updates, no token travel. |
| **Engine** | `buildWalk(N,p)` → `reachProbs`, `expectedDurations`; `simulateWalk(i, …)` for sparkline. |

### WalkerSwarm *(new, medium)*

| Dimension | Spec |
|---|---|
| **Manipulate** | **Release 100** (or **Release 500**); optional pause. |
| **Responds** | ~100 tokens step in parallel (batched Konva animation, seeded `mulberry32`); each **flashes** on absorption (green = reached `N`, red = ruin); aggregate **outcome bar** fills toward theoretical split. |
| **Feedback loop** | If learner predicted wrong side in beat 1, swarm visually refutes; tally text `aria-live`: "ruin 51 · win 49 of 100." |
| **Build** | Konva particle layer over WalkBoard lattice; imperative animation (`reactCompiler: false`); reduced-motion: instant final tallies + static dots at walls. |

### RuinLandscape *(new, small)*

| Dimension | Spec |
|---|---|
| **Manipulate** | Coupled to WalkBoard **`p`** slider (and optional **`N`**). |
| **Responds** | Two curves over start positions `i = 0..N`: **`P_i = i/N`** (fair) warps to **`(1−r^i)/(1−r^N)`** as `p` moves; optional **`D_i`** parabola overlay. |
| **Feedback loop** | At `p=0.5` the reach curve is a straight line; at `p=0.48` the line **bends** — house edge made visible. |
| **Build** | Konva line chart reusing `BiasChart` axis/theme; closed-form evaluation only (no MC). |

### DistributionHistogram *(new, medium — debuts here, reusable in Coupon Collector etc.)*

| Dimension | Spec |
|---|---|
| **Manipulate** | **Run 1,000 walks**; optional bin-width toggle (auto vs coarse). |
| **Responds** | Live Konva histogram of **steps-to-absorption**; vertical markers at **mean** `D_i` and optional **±1σ**; secondary mode bins **outcome** (ruin vs win) for low `N`. |
| **Feedback loop** | Mean marker aligns with theory line while long bins extend far right — teaches "mean ≠ typical." |
| **Build** | Konva bars + `SimChart` axes; DOM table fallback for a11y; bins from `batchWalkStats`. |

### Reused (retargeted)

| Widget | L3 role |
|---|---|
| `prediction` | Opening bet + optional martingale trap |
| `stateTap` | Walk transitions on the line graph |
| `equationTiles` ×2 | P-system then D-system (contrast is the lesson) |
| `slider` | Dual prediction lock (ruin % and duration) |
| `substitution` | Guided solve to `½` and `4` |
| `theorySimChart` | Walk variant: running ruin rate or mean duration vs theory |
| `BiasChart` | Ruin-vs-`p` cliff for fixed `(N,i)` |
| `recap` | Retrieval-first summary |

---

## Signature visual moments (graph + simulation)

1. **Swarm release (beat 9).** ~100 tokens fan out from start `i=2`; the screen becomes a living random walk. Red/green flashes accumulate at walls; the **outcome bar** creeps toward **50/50** while a **duration mean chip** climbs toward **4**. The learner *watches* fair-not-safe happen in bulk.

2. **Landscape warp (beat 11).** Learner drags `p` from **0.50 → 0.40**. The **`P_i` curve** — straight at fair — **kinks into a cliff** favoring ruin; the WalkBoard outcome bar collapses; **`BiasChart`** dot slides down the ruin-vs-`p` curve. One motion, three linked views, same engine.

3. **Histogram fat tail (beat 10).** After the mean converges, the **DistributionHistogram** keeps growing **long bins** at 20–80 steps while the mean marker sits at **4** — visceral proof that **`i(N−i)`** is an average over wildly variable paths.

4. **Recurrence contrast (beats 5–6).** On correct tile submission, the UI **highlights** the lone difference: **`+1` present vs absent**, **boundary `1` vs `0`**. Same graph picture, two equations — the muscle-memory trap from L2 Penney's pays off.

---

## Faded scaffolding / transfer signal

| Beat | Scaffolding |
|---|---|
| `ruin-tiles`, `duration-tiles` | `maxHintLevel: 2` (no level-3 reveal on the contrast beats) |
| `guided-solve` | Full 3-level ladder allowed (or collapse to "Show algebra" per PRD cut line) |
| `boundary-edge` | Standard ladder |

**`transferAttained = true`** iff the learner builds **both** the P-recurrence **and** the D-recurrence on beats 5–6 **without hitting the hint cap** (mirrors L2 Penney's P-tiles transfer flag).

**`needsReview`:** per global PRD rule (reveal or ≥3 wrong checks on Required beats).

**Derived fields on completion:** `{ N, start, p, predictedRuin, predictedDuration, empiricalRuinRate, empiricalMeanSteps, theoreticalRuin, theoreticalDuration }`.

---

## Cut line (if schedule slips)

Priority order to drop/compress (never drop the contrast):

1. **Drop Extension beats** (`infinite-wall`, `martingale-trap`).
2. **Merge beats 9–10:** swarm + histogram in one Prove screen (histogram static after 500 runs).
3. **Collapse beat 8:** replace multi-step `substitution` with single **"Show algebra"** reveal after prediction lock (PRD-permitted for L3).
4. **Reduce to 10 beats:** drop `walk-once` (merge into `ruin-board` first visit); drop `duration-spread` (mean-only sim).
5. **Minimum viable L3 (8 beats):** `open-bet` → `ruin-board` → `ruin-tiles` → `duration-tiles` → `predict-both` → `swarm-prove` → `house-edge` → `recap`.

**Never cut:** P vs D recurrence contrast; at least one live simulation vs theory; house-edge cliff.

---

## Golden tests

Add `src/engine/walk.test.ts` (and optional MC fuzz). All exact values at `p=0.5` via rationals; MC with `mulberry32(42)`.

### Exact (`buildWalk`)

| Test | Expected |
|---|---|
| `reachProb(N=4, i=2, p=0.5)` | `1/2` |
| `reachProb(N=4, i=1, p=0.5)` | `1/4` |
| `reachProb(N=4, i=3, p=0.5)` | `3/4` |
| `duration(N=4, i=2, p=0.5)` | `4` |
| `duration(N=4, i=1, p=0.5)` | `3` |
| `duration(N=4, i=3, p=0.5)` | `3` |
| `reachProb(N=4, i=2, p=0.4)` | ~~`308/1000` reduced~~ **`4/13`** exact (review: `308/1000`=`77/250`≠`4/13`; the engine is exact-rational so assert `{n:4,d:13}`, not a decimal) |
| `ruinProb(N=4, i=2, p=0.4)` | **`9/13`** exact (review: added — the headline ~69% number deserves its own exact assertion) |
| `duration(N=4, i=2, p=0.4)` | `50/13 ≈ 3.846` exact (review: was `≈3.846` only; `D` is also exact-rational at `p=2/5`, so assert `{n:50,d:13}`) |
| `P_0 = 0`, `P_N = 1`, `D_0 = D_N = 0` | boundary sanity |
| `reachProb` recurrence tiles match `reachProbRecurrences` | cross-check fixture validator |
| `duration` recurrence tiles match `durationRecurrences` | cross-check fixture validator |
| Symmetry fair: ~~`P_i = P_{N-i}`~~ → `P_i(reach) = 1 − P_{N−i}(reach) = ruin_{N−i}` | `P_1=1/4`, `P_3=3/4` so `P_i ≠ P_{N−i}` (review: original equality is false; the true mirror is reach-from-`i` equals ruin-from-`N−i`. The `i=N/2` case `P_2=ruin_2=1/2` is just the fixed point of that map) |

### Simulation (`simulateWalk` / `batchWalkStats`)

| Test | Expected (10k trials, seed fixed) |
|---|---|
| Empirical ruin rate `(N=4, i=2, p=0.5)` | within **±0.02** of `0.5` |
| Empirical mean steps `(N=4, i=2, p=0.5)` | within **±0.15** of `4` |
| Empirical ruin `(N=4, i=2, p=0.4)` | within **±0.02** of `0.692` |
| Single walk always terminates | `steps < 100_000` |

### Regression guards

- `buildWalk(4, 0.5).expectedDurations.E2 === 4` agrees with manual first-step solve.
- WalkBoard default view matches flagship golden aesthetic (no new solver drift).

---

## Authored copy hooks (for fixture author)

**Opening prompt:** "You have **$2**. Flip a fair coin: heads **+$1**, tails **−$1**, until you hit **$4** or **$0**. The coin is fair — what's the chance you go **broke first**? And how many flips will it take?"

**Post-swarm reveal:** "Half the walkers went broke — on a **fair** coin. Starting closer to zero tilts worse; the formula is **`P(win) = i/N`**, not 'fair ⇒ safe'."

**House-edge reveal:** "A **40%** heads coin isn't a small disadvantage. From the middle, you win only **~31%** of the time. Casinos don't need to cheat — a **2%** edge is enough."

**Recap retrieval chips:** (1) P-recurrence boundary values? (2) Duration at `i=2, N=4`? (3) What changes when `p` drops below ½?

---

## Dependencies & build order

1. **`walk.ts` + golden tests** (unblocks everything)
2. **Generalize `equationDiagnosis` or scoped L3 checker** for `P`/`D` tile rows
3. **`WalkBoard`** (beats 2, 4, 11)
4. **`WalkerSwarm` + theorySimChart walk variant** (beat 9)
5. **`DistributionHistogram`** (beat 10)
6. **`RuinLandscape`** (beat 11 — can ship as WalkBoard overlay v1)
7. **Fixture `fixtures/lesson-gamblers-ruin.json`** + course node `built: true` + seed

**Estimated new surface:** 1 engine file (~120 LOC) + 4 Konva views (WalkBoard largest) + 1 beat view per interaction reuse.

---

## Links

- Proposal spine: `docs/proposed-lessons.md` § Gambler's Ruin (L5 label in doc = L3 in course path)
- PRD phase: `docs/mvp_prd.md` Phase 21
- Widget inventory: `audits/ideation/agent-4-widgets.md`
- Markov theory notes: `audits/ideation/agent-2-markov-theory.md`
- Quant canon: `audits/ideation/agent-1-quant-canon.md`

---

## Plan assessment (Opus 4.8 review)

**Verdict: Solid-with-fixes.** The lesson *design* is strong — the core idea (first-step analysis is arena-independent; one graph yields a probability **and** a duration; fair ≠ safe) is exactly the transferable skill, and the staging (predict → watch one walk → model → build both recurrences → predict → solve → swarm-refute → histogram → house-edge cliff → recap) is pedagogically sound and continuous with L1/L2. **All of the plan's prose math checks out** (verified by exact-rational solve). The fixes are concentrated in (1) a few golden-test/copy *numbers*, and (2) the *implementation mapping*, where the plan under-estimates how HH-coupled the existing beat components are. None of the fixes touch the lesson's spine.

### Pedagogy notes

- **The P-vs-D contrast is the lesson, and it's well-built.** Putting both recurrences on the *same* `StateGraph` line and highlighting the lone differences is the right move. One refinement: the contrast is really **two** differences, and learners conflate the second one. Make both explicit:
  - leading term: `+1` (duration) vs `+0` (probability);
  - boundaries: `D_0 = D_N = 0` (symmetric, "both walls are free") vs `P_0 = 0, P_N = 1` (**asymmetric** — the walls mean *opposite* things). The plan leans on "no 1+"; give the asymmetric-boundary idea equal billing, because "why is one boundary 1?" is the deeper stumble.
- **"Fair ≠ safe" is earned, not asserted** — the swarm (bulk refutation) + histogram (mean ≠ typical) + house-edge cliff is a genuinely good three-punch. Keep all three "never cut" items.
- **Retrieval recap + transfer flag** mirror the flagship; good. But the recap must be *re-authored* for the walk (the existing `RecapBeat` is 100% HH narrative — see implementation).
- **Tap-only completability holds** *if* every graded interaction is the existing tap-tile / tap-chip / tap-stepper kind. The new widgets (WalkBoard drag, swarm) must stay **exploratory/ungraded** (no completion gated on a drag) — the plan already does this (graded beats are `stateTap`, `equationTiles`, `substitution`, `recap`). Keep drag strictly for aha, never for a gate.

### Verified-math table

Computed independently via Gauss-Jordan over rationals **and** direct first-step solve (`p=2/5, q=3/5`); decimals are exact-rational values.

| Claim in plan | Computed (exact) | ✓/✗ |
|---|---|---|
| Fair `P_i = i/N` → `P_1,P_2,P_3` | `1/4, 1/2, 3/4` | ✓ |
| Fair ruin from `i=2` | `1/2` | ✓ |
| Fair `D_i = i(N−i)` → `D_1,D_2,D_3` | `3, 4, 3` | ✓ |
| Fair `N=4,i=2` → `P=½, D=4` | `P=1/2, D=4` | ✓ |
| Biased `p=0.4`: `P_2 ≈ 0.308` | `4/13 = 0.30769` | ✓ (exact `4/13`) |
| Biased `p=0.4`: ruin `≈ 0.692` / `~69%` | `9/13 = 0.69231` | ✓ |
| Biased `p=0.4`: `D_2 ≈ 3.85` | `50/13 = 3.84615` | ✓ |
| Copy: "win only `~31%`" (`p=0.4`) | `30.77%` | ✓ (rounds to 31%) |
| Golden test: `reachProb(p=0.4) = 308/1000` | `4/13` (`308/1000=77/250 ≠ 4/13`) | ✗ → assert `{n:4,d:13}` |
| Golden test: symmetry `P_i = P_{N−i}` | `P_1=1/4 ≠ P_3=3/4` | ✗ → `P_i(reach)=ruin_{N−i}` |
| Copy (line ~65): "`48/52` coin → `~69%` ruin" | `p=0.48→54%`; `~69%` is `p=0.40` | ✗ → relabel |
| Copy: "a **2%** edge is enough" beside a `p=0.40` demo | `p=0.40` is a **10-pt** edge | ✗ → relabel demo or use `p=0.48` |
| Infinite bankroll `P_i→0` (`N→∞`, fair) | `i/N → 0` | ✓ |
| Closed form `reach(i)` at `p=0.5` | `r=1` ⇒ `0/0`; special-case `→ i/N` | ⚠ guard required |

### Scope realism / cut line

- **12 required beats is too long** for one MVP sitting, and the *new-component* count is higher than the plan's "1 beat view per interaction reuse" implies (see implementation — `equationTiles`, `slider`, `theorySimChart`, `recap` are **not** reusable as-is). Recommend shipping the plan's own **"Minimum viable L3 (8 beats)"** as v1, then adding swarm-histogram polish. The plan's cut-line ordering is good; I'd promote it from "if schedule slips" to "the v1 plan."
- The **Extension** beats (`infinite-wall` Pólya, `martingale-trap`) are genuinely optional and untested — keep them last and unblocking, exactly as written.
- Concrete recommended v1 (9 beats, preserves the contrast + one live sim + cliff): `open-bet`(prediction) → `walk-once`/`ruin-board`(walkBoard, merged) → `boundary-edge`(stateTap) → `ruin-tiles`(equationTiles, fair) → `duration-tiles`(equationTiles, fair) → `predict-both`(slider) → `guided-solve`(substitution) → `house-edge`(walkBoard+ruinLandscape) → `recap`. Add `swarm-prove` + `duration-spread` once WalkerSwarm/Histogram are built.

### Beat-by-beat flags

- **Beat 1 `open-bet`** — ✓ reuses `PredictionBeat` unchanged (single `feedback`, not `byPattern`). Options carry the three traps well.
- **Beats 2 & 4 `walk-once`/`ruin-board`** — new `WalkBoard`. Keep ungraded. Beat 2/4 overlap heavily; merge for v1.
- **Beat 3 `boundary-edge`** — reuses `stateTap` cleanly *if* the walk model exposes `transitions` in `Automaton` shape (it should). Good a11y/tap fit.
- **Beats 5–6 `ruin-tiles`/`duration-tiles`** — **author at `p=0.5`** (only `'1/2'` is gradable). P-row carries a leading `const:0` tile (the grader always reserves slot 0 for the constant) — this *is* the visible "0 vs 1" contrast, so embrace it. Needs `WalkEquationTilesBeat` (flagship beat is HH-chromed). `maxHintLevel:2` on the contrast is a good transfer signal.
- **Beat 7 `predict-both` (slider "dual")** — **not supported**: `slider` schema is `{min,max,step}` and `SliderBeat` writes a single `finalPrediction` + `theoreticalValue=E0`. Use **two** `slider` beats (ruin %, then duration) via beatId routing, or a new `dualSlider` variant; add a `predictedRuin` LessonState field.
- **Beat 8 `guided-solve`** — reuses `SubstitutionBeat`, but it stores **one** `theoreticalValue`. To land both `P_2=½` and `D_2=4`, run two stepper passes or store the reach answer in a new field. Authoring-driven, so low-risk.
- **Beat 9 `swarm-prove`** — label bug: "ruin bar fills toward `i/N`" — the **ruin** bar fills toward `(N−i)/N`; the **reach** bar fills toward `i/N` (equal only at `i=N/2`). Also the ruin-*rate* convergence cannot reuse `SimChart` (its y-axis is hard-coded log from `yLo=2`); prove ruin with the swarm's outcome bar, reuse `SimChart` only for the duration mean.
- **Beat 10 `duration-spread`** — new `DistributionHistogram`. Mean marker reuses `SimChart` math; bars are new.
- **Beat 11 `house-edge`** — `RuinLandscape` (new, BiasChart-templated, linear y). Fix the `48/52`/`2%` copy (above).
- **Beat 12 `recap`** — needs a new `WalkRecapBeat`; the existing one hard-codes HH/HT throughout.

### Prioritized recommended changes

1. **Fix the three number/copy errors** (golden `4/13`; symmetry relation; `48/52`↔`p=0.40` / "2% edge"). Cheap, correctness-critical. *(inline-tagged above.)*
2. **Author equation beats at `p=0.5` only** and plan the biased coin as chart/landscape-only (tile grader limit). Add the `r=1` special-case to `closedForm.reach`.
3. **Re-scope to ~9 beats for v1** (the plan's MVP-8 + `guided-solve`); defer swarm+histogram.
4. **Budget for new beat components, not reuse**: `WalkBoardBeat`, `WalkEquationTilesBeat`, `WalkSliderBeat`(or dual), `WalkSimChartBeat`, `WalkRecapBeat`, plus the three pure-new widgets. Reuse is at the **pure-module + Konva-primitive** layer, not the beat layer.
5. **Extend `scripts/validate-fixtures.ts`** to validate `lesson-gamblers-ruin.json` and cross-check the two equation beats against `buildWalk(4,0.5)` (else they bypass the engine-vs-tiles guard entirely).
6. **Guard `LessonPlayer`** so `patternOptions` doesn't crash `buildAutomaton` (placeholder `["HH"]` or a branch).

---

## Implementation in the tech stack

Grounding facts (verified in source 2026-06-23):

- `LessonPlayer.tsx` builds **one** `automaton = buildAutomaton(patternOptions[0], 0.5)` and passes it to **every** beat via `BeatProps.automaton`. A walk needs a *different* model → the cleanest path is **self-contained walk beats** that build `buildWalk(N,p)` from fields on their own interaction object, leaving the placeholder `automaton` unused. No `BeatProps` change is strictly required for the *new* beats; the *reused-but-coupled* beats (`equationTiles`, `slider`, `theorySimChart`, `recap`) instead get **walk-specific siblings** because they read `automaton.expectedTimes.E0`.
- `StateGraph.tsx` consumes only `automaton.{states,transitions}` and draws `advance` arrows forward / `reset` arrows curving below / rings on every `absorbing` node. A `WalkAutomaton` whose `states`/`transitions` use the existing `AutomatonState`/`Transition` types renders **directly** (E0 and EN both ring as absorbing; `H:i→i+1` is `advance`, `T:i→i−1` is `reset`). Widen `StateGraph`'s prop to `Pick<Automaton,'states'|'transitions'>` (or pass a compatible object) — a one-line type change, no redraw logic touched.
- `solveLinearSystem` is **private** in `automaton.ts` → **export it** (one word) and import from `walk.ts`. `mulberry32` is already exported from `simulate.ts`.
- Konva canvas files must start with `'use no memo'` (React Compiler opt-out) and import colors only from `konva/theme.ts` (`C`, `FONT_MONO`).

### WalkBoard / RuinBoard *(new, large — centerpiece)*

- **Reuse:** `StateGraph` layout math (`xOf`, `radius`, `nodeY`, padX) for the lattice; `theme` (`C.heads`/`C.tails` for ±1 edges, `C.correct`/`C.wrong` for win/ruin); `useElementWidth`; DOM `<input type="range" step="any">` bias slider pattern lifted verbatim from `BiasSandboxBeat`. Engine: `buildWalk`, `simulateWalk`.
- **Konva sketch:** `WalkBoard({ width, height, walk, start, onStart, onN, reducedMotion, lastWalk })`.
  - *Layout:* nodes `0..N` on a horizontal line (`xOf(i)`), 0 and N drawn as absorbing rings; a faint `ruin-heat` `Rect` strip under each cell tinted `lerp(C.correct,C.wrong, ruinProbs[i])`.
  - *Draggables:* start token = a `Circle` `draggable dragBoundFunc`-clamped to the rail, `onDragEnd` snaps to nearest node → `onStart(i)`; wall handle = a `Rect`/`Circle` at node N, `onDragEnd` snaps → `onN(N')` (clamp `2 ≤ N ≤ maxN=6`). Commit on drag-end only (no per-drag recompute storms).
  - *Responds:* a stacked outcome `Rect` bar (`reach` green vs `ruin` red, widths = `reachProbs[start]` / `ruinProbs[start]`), an `E[duration]` value chip (`expectedDurations[Estart]`), and on "Walk once" a single `simulateWalk` path drawn as a step polyline (`Line`).
  - *Animation:* "Walk once" tweens the token across `outcome.path` via a time-based rAF (mutate `node.x()` then `layer.batchDraw()`, same discipline as `StateGraph`'s `Konva.Animation`); flash the wall it hits.
- **Reduced motion:** no token travel — jump to the absorbing wall, render the path polyline statically, update bar/readout instantly.
- **a11y / tap path:** drags are *exploratory only* (never a gate). Tap parity: `−/+` DOM steppers for start and N, the DOM bias slider, and a `role="status" aria-live="polite"` mirror — `"Start $2, walls $0/$4, p(H)=0.50 — reach 50%, ruin 50%, E[duration] 4."`
- **Schema variant (exact):**

```ts
z.object({
  type: z.literal('walkBoard'),
  mode: z.enum(['single', 'sandbox', 'liveSolve']),
  defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1),
  maxN: z.number().int().min(2).max(6),
})
```

- **State/derived:** none graded. If `liveSolve` should seed the recap, write `reachProbability`/`ruinProbability`/`theoreticalValue` to `LessonState` (new fields). No `TileSchema` change.
- **Effort/risk:** **High effort, low math risk.** Risk is interaction polish (drag clamp/snap, mobile hit targets) — not correctness.

### WalkerSwarm *(new, medium)*

- **Reuse:** WalkBoard lattice geometry; `mulberry32` (seeded, reproducible); `batchWalkStats` for the aggregate, `simulateWalk` per token for paths; `theme`.
- **Konva sketch:** `WalkerSwarm({ width, height, walk, start, count, seed, reducedMotion })`.
  - *Pre-simulate* all `count` walks up front (pure, instant): store `paths: Wealth[][]` + outcomes. Animation is then pure tweening of precomputed data — decouples RNG from rAF.
  - *Draw:* one `Layer`, `count` `Circle` tokens (`listening=false`, `perfectDrawEnabled(false)`); a shared rAF advances one integer `tick`; each frame set `token.x()` to `xOf(path[k][min(tick,len)])` with small y-jitter to de-overlap, then a **single** `layer.batchDraw()`. On a token's absorption frame, set fill green/red. Aggregate outcome bar fills toward `winRate`/`ruinRate`.
- **~100-token perf strategy:** the cost is draws-per-frame, not node count. One `batchDraw()` per frame for ~100 nodes is fine; never `setState` per token. For "Release 500", animate a capped 100 and apply the remaining 400 to the tally instantly (or step 5 ticks/frame). Optionally `layer.cache()` static tokens at the walls.
- **Reduced motion:** skip rAF entirely — render final tally text + two static dot-clusters sized by count at the walls.
- **a11y / tap:** buttons "Release 100" / "Release 500" / "Pause"; `aria-live` tally `"ruin 51 · win 49 of 100"`.
- **Schema variant (exact):**

```ts
z.object({
  type: z.literal('walkerSwarm'),
  count: z.number().int().min(1).max(500),
  defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1),
  seed: z.number().int().optional(), // default mulberry32(42) for deterministic e2e
})
```

- **State/derived:** optional `empiricalRuinRate`, `simRuns` (reuse) in `LessonState`. No tile change.
- **Effort/risk:** **Medium effort, low risk** once the precompute-then-tween split is in place.

### RuinLandscape *(new, small–medium)*

- **Reuse:** `BiasChart.tsx` is the **structural template** (axes, gridlines, dashed vertical guide at current value, per-curve marker + value chip, staggered chips, `theme`). The *only* real change is **linear y on [0,1]** instead of `BiasChart`'s log-flips axis, and **x = wealth `0..N`** (RuinLandscape) — with an optional second mode **x = p** for the beat-11 "ruin-vs-p" dot. Fork into `RuinLandscape` rather than overloading `BiasChart` (keep the flagship chart untouched).
- **Konva sketch:** `RuinLandscape({ width, height, N, p, mode })` where `mode: 'reach'|'duration'|'both'`.
  - *reach curve:* points `{ i, closedForm.reach(i,N,p) }` for `i=0..N`, linear y∈[0,1]; straight line at `p=0.5`, convex "cliff" as `p<0.5`. *duration overlay:* `{ i, D_i }` scaled to a secondary right axis (parabola).
  - Recompute the whole curve on each `p` (cheap: `N≤6`). Marker dot at the lesson's `start`.
- **Reduced motion:** static curve at the current `p`; no tween between curves (the redraw is instantaneous anyway).
- **a11y / tap:** coupled to the same DOM bias slider as WalkBoard; `aria-live` `"At p=0.48 the reach curve bows below the fair line; ruin from $2 = 54%."`
- **Schema variant (exact):**

```ts
z.object({
  type: z.literal('ruinLandscape'),
  mode: z.enum(['reach', 'duration', 'both']),
  defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1),
})
```

- **Effort/risk:** **Low–medium effort, low risk** (strong template). One correctness guard: `closedForm.reach` must special-case `r===1 → i/N` (else `0/0` at `p=0.5`).

### DistributionHistogram *(new, medium)*

- **Reuse:** `SimChart` axis/tick/`theme` conventions and the mean-marker idea; `batchWalkStats.stepHistogram` for bins; DOM `<table>` fallback for a11y.
- **Konva sketch:** `DistributionHistogram({ width, height, bins, mean, sigma?, reducedMotion })`.
  - Vertical `Rect` bars per `bin`; a solid ink vertical `Line` at `mean = D_i` with a `theory 4` chip; optional dashed `±1σ`. Linear x = step count, linear y = frequency. The visual point is bars extending far right (20–80 steps) while the mean sits at 4.
  - *Animation:* grow bar heights with a short tween as 1,000 walks tally in batches (rAF, batch the count like `TheorySimChartBeat`).
- **Reduced motion:** render the final histogram instantly, no growth tween.
- **a11y / tap:** "Run 1,000 walks" button; `role="status"` summary `"mean 4 steps; longest bin at 20–30; 8% of walks took >24 steps"`; full bin table in an expandable `<details>`.
- **Schema variant (exact):**

```ts
z.object({
  type: z.literal('distributionHistogram'),
  metric: z.enum(['duration', 'outcome']),
  binCount: z.number().int().min(2).max(40),
  defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1),
  runs: z.number().int().min(1).max(10000).default(1000),
})
```

- **Effort/risk:** **Medium effort, low risk.** Bin-edge choice is the only fiddly part (use `batchWalkStats` to own binning so the engine is the single source of truth).

### WalkSimChart (the convergence proof) *(reuse + new beat)*

- **Reuse:** `SimChart.tsx` **as-is for the duration mean** (`theory = D_start = 4`; `points` = running mean steps; identical to `TheorySimChartBeat`'s loop but calling `simulateWalk` instead of `flipsToAbsorption`). The ruin-*rate* line **cannot** reuse `SimChart` (fixed log y from `yLo=2`); prove ruin via the WalkerSwarm outcome bar instead.
- **New beat:** `WalkSimChartBeat` — a near-copy of `TheorySimChartBeat` with `simulateWalk(start,walk,rng)` and `theory = walk.expectedDurations[Estart]`.
- **Schema:** add a **new** `walkSimChart` variant (do **not** widen the field-less `theorySimChart`):

```ts
z.object({
  type: z.literal('walkSimChart'),
  metric: z.enum(['duration']), // ruin-rate handled by the swarm bar, not this chart
  defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1),
})
```

- **Effort/risk:** **Low effort, low risk** (duration path is a direct analogue of the working flagship beat).

### Reused beats — honest status

| Interaction | Reuse verdict |
|---|---|
| `prediction` | ✅ `PredictionBeat` **as-is** (single `feedback`, pattern-agnostic). |
| `stateTap` | ✅ as-is, given walk `transitions` in `Automaton` shape. |
| `substitution` | ✅ `SubstitutionBeat` as-is, but stores **one** `theoreticalValue` → use two passes / extra field for `P_2` + `D_2`. |
| `equationTiles` | ⚠️ **new `WalkEquationTilesBeat`** — reuse pure `checkRow`/`diagnoseRow`, but the flagship beat hard-codes HH chrome (`E0_WORKED_EXPLANATION`, `STATE_LEGEND`, `TOKEN_TIPS`, `renderStaticRow` note, `isExampleRow==='E0'`) and writes `theoreticalValue=automaton.E0`. |
| `slider` | ⚠️ **new/forked** — `SliderBeat` writes `theoreticalValue=automaton.expectedTimes.E0`; also no dual-slider. |
| `theorySimChart` | ⚠️ **new `walkSimChart`** (above). |
| `recap` | ❌ **new `WalkRecapBeat`** — existing one is wall-to-wall HH/HT narrative. |

### Schema & engine changes (consolidated)

**`src/content/schema.ts`** — append five variants to the closed `InteractionSchema` union (each a `z.object` with a literal `type`):

```ts
// add inside z.discriminatedUnion('type', [ ... ]) :
z.object({ type: z.literal('walkBoard'), mode: z.enum(['single','sandbox','liveSolve']),
  defaultN: z.number().int().min(2).max(6), defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1), maxN: z.number().int().min(2).max(6) }),
z.object({ type: z.literal('walkerSwarm'), count: z.number().int().min(1).max(500),
  defaultN: z.number().int().min(2).max(6), defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1), seed: z.number().int().optional() }),
z.object({ type: z.literal('ruinLandscape'), mode: z.enum(['reach','duration','both']),
  defaultN: z.number().int().min(2).max(6), defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1) }),
z.object({ type: z.literal('distributionHistogram'), metric: z.enum(['duration','outcome']),
  binCount: z.number().int().min(2).max(40), defaultN: z.number().int().min(2).max(6),
  defaultStart: z.number().int().min(1), defaultP: z.number().min(0).max(1),
  runs: z.number().int().min(1).max(10000).default(1000) }),
z.object({ type: z.literal('walkSimChart'), metric: z.enum(['duration']),
  defaultN: z.number().int().min(2).max(6), defaultStart: z.number().int().min(1),
  defaultP: z.number().min(0).max(1) }),
```

- **`TileSchema`:** **no change** — equation beats are authored at `p=0.5` using the existing `'1/2'` prob tile and `const:0`/`const:1`. (Biased tiles would require either new prob enum members **and** a `probToRational` extension; deliberately out of scope — the biased coin is chart-only.)
- **`LessonState`** (`beats/types.ts`): add `reachProbability?: number`, `ruinProbability?: number`, `predictedRuin?: number`, `empiricalRuinRate?: number`. (`theoreticalValue`, `finalPrediction`, `empiricalMean`, `simRuns`, `equationTiles` reused.)
- **`ProgressDerivedSchema`** is `.loose()`, so new keys validate — **but** `LessonPlayer.advance()` forwards only a fixed `derived` block to `completeLesson`; to persist `ruinProbability`/`predictedRuin`, **extend that block** (and the `completeLesson` payload), else the data is dropped silently.
- **`beats/index.tsx`:** add `case 'walkBoard' | 'walkerSwarm' | 'ruinLandscape' | 'distributionHistogram' | 'walkSimChart'` → respective new beat; route walk `equationTiles`/`slider`/`recap` to the walk siblings (by `lessonId === 'lesson-gamblers-ruin'` or a `lesson.kind` flag).
- **`LessonPlayer.tsx`:** guard `buildAutomaton(patternOptions[0] ?? 'HH', 0.5)` so `[]`/`['walk']` can't crash; walk beats ignore that automaton.

**`src/engine/automaton.ts`:** `export function solveLinearSystem(...)` (currently private).

**`src/engine/walk.ts`** (new, pure, exact-rational; mirrors `automaton.ts`):

```ts
import type { Automaton, AutomatonState, CanonicalRecurrence, Rational,
  StateId, SubstitutionStep, Transition } from './types'
import { solveLinearSystem } from './automaton'   // newly exported
import { mulberry32 } from './simulate'           // already exported

export type Wealth = number // 0..N

export type WalkAutomaton = {
  N: number
  p: number
  states: AutomatonState[]      // E0..EN; E0 & EN absorbing → render via StateGraph
  transitions: Transition[]     // H: i→i+1 (advance), T: i→i−1 (reset)
  reachProbRecurrences: Record<StateId, CanonicalRecurrence>   // constant 0, terms [p·E_{i+1}, q·E_{i-1}] (H then T order)
  reachProbs: Record<StateId, Rational>                        // P_i, P_0=0, P_N=1
  ruinProbs: Record<StateId, Rational>                         // 1 − P_i
  durationRecurrences: Record<StateId, CanonicalRecurrence>    // constant 1, same term order
  expectedDurations: Record<StateId, number>                   // D_i, D_0=D_N=0
  substitutionSteps: { reach: SubstitutionStep[]; duration: SubstitutionStep[] }
  closedForm: { reach(i: number): Rational; duration(i: number): number } // reach special-cases r===1 → i/N
}

export function buildWalk(N: number, p: number): WalkAutomaton

export type WalkOutcome = { end: 0 | 'N'; steps: number; path: Wealth[] }
export function simulateWalk(start: Wealth, walk: WalkAutomaton,
  rng?: () => number): WalkOutcome   // ±1 with p; cap steps < 100_000 like flipsToAbsorption

export function batchWalkStats(start: Wealth, walk: WalkAutomaton, n: number,
  rng?: () => number): {
    ruinRate: number; winRate: number; meanSteps: number
    stepHistogram: Array<{ bin: [number, number]; count: number }>
  }
```

Implementation notes: build both linear systems with `solveLinearSystem` — **reach** uses boundary rows `P_0=0`, `P_N=1` (RHS encodes the `1` at the `N` wall) and interior `P_i − p·P_{i+1} − q·P_{i−1} = 0`; **duration** is the same `(I−Q)` with RHS `1` and `D_0=D_N=0`. Emit recurrence `terms` in **`[H→E_{i+1}, T→E_{i−1}]`** order so `JSON.stringify` matches authored fixture targets.

**`scripts/validate-fixtures.ts`** (currently only validates the flagship + cross-checks `buildAutomaton('HH',0.5)`):

```ts
// 1) schema-validate the new fixture
const ruin = validate('lesson-gamblers-ruin.json', LessonSchema)
// 2) cross-check both equation beats against the engine (fair coin)
const walk = buildWalk(4, 0.5)
for (const [beatId, recs] of [
  ['ruin-tiles',     walk.reachProbRecurrences],
  ['duration-tiles', walk.durationRecurrences],
] as const) {
  const beat = ruin.beats.find(b => b.beatId === beatId)
  if (beat?.interaction.type !== 'equationTiles') process.exit(1)
  for (const row of beat.interaction.rows)
    assert(JSON.stringify(recs[row.lhs]) === JSON.stringify(row.target))
}
```

Without this, the walk equation beats **bypass** the engine-vs-tiles guard the flagship enjoys.

### Golden tests (`src/engine/walk.test.ts`)

Exact (rationals): `reach(4,1,½)=1/4`, `reach(4,2,½)=1/2`, `reach(4,3,½)=3/4`; `duration(4,·,½)=3,4,3`; boundaries `P_0=0,P_4=1,D_0=D_4=0`; **biased** `reach(4,2,2/5)={n:4,d:13}`, `ruin={n:9,d:13}`, `duration(4,2,2/5)={n:50,d:13}`; mirror `reach(i)=1−reach(N−i)`. Recurrence shape: `reachProbRecurrences.E2 == {lhs:'E2',constant:0,terms:[{coeff:{n:1,d:2},var:'E3'},{coeff:{n:1,d:2},var:'E1'}]}` and `durationRecurrences.E2` same with `constant:1`. Sim (`mulberry32(42)`, 10k): ruin `½±0.02`, meanSteps `4±0.15`, biased ruin `9/13±0.02`; `simulateWalk` always terminates (`steps<100000`).

### Risks & open questions

1. **Beat-component coupling is the real cost (highest).** `equationTiles`, `slider`, `theorySimChart`, `recap` all read the HH `automaton` and/or hard-code HH copy → four new walk-sibling beats. This is the biggest delta from the plan's "1 beat view per interaction reuse." Decide early: **fork beats** (recommended, surgical, flagship untouched) vs **parameterize shared beats** (DRY but risks the working L1).
2. **Tile grader hard-limits the equation beats to the fair coin** (`probToRational` only knows `'1/2'`). Locks beats 5–6 to `p=0.5`; biased recurrence is chart-only. Open Q: is the fair-only algebra acceptable pedagogically? (Yes — the *contrast* is fair-coin; bias lives in the landscape.)
3. **`closedForm.reach` `0/0` at `p=0.5`** (`r=1`): must special-case `→ i/N`, or charts NaN exactly at the default. Engine-side, easy, but easy to forget.
4. **`SimChart` log axis** can't render a [0,1] ruin rate → prove ruin with the swarm bar, reuse `SimChart` only for the duration mean. (Decision, not a blocker.)
5. **`recap` rewrite** is non-trivial: re-author the retrieval question (P-vs-D boundary contrast), the hero verdict (`P=½, D=4`, plus the biased cliff), and the mechanism rows.
6. **Two answers, one `theoreticalValue`:** `LessonState`/`completeLesson` are single-value-shaped. Add `reachProbability`/`ruinProbability` and thread them through `LessonPlayer.advance` → `completeLesson` (loose schema won't help if the value never leaves the client).
7. **`maxN≤6` and `N≥2`** must be enforced both in schema and drag clamp (7 nodes is the legibility ceiling on mobile).
