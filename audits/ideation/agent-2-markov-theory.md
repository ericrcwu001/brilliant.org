# Agent 2 — Markov Chains & Stochastic Processes — Ideation

> Lens: the formal probability theory under the current course. The flagship lesson
> already does, in miniature, the four moves of finite Markov-chain analysis:
> **(1) states, (2) first-step recurrences, (3) solve a linear system, (4) confirm by
> simulation.** The engine even ships the general machinery — a rational Gauss-Jordan
> `solveLinearSystem`, seedable Monte-Carlo, and a left-to-right state graph. These
> proposals generalize "states + recurrences + expected times" into the standard
> stochastic-processes toolkit *while reusing that exact machinery*.

---

## Research notes (with sources)

### 1. Absorbing chains & first-step analysis (the engine's home turf)
For an absorbing chain in canonical form `P = [[Q, R], [0, I]]` (transient block `Q`,
transient→absorbing block `R`):

- **Fundamental matrix** `N = (I − Q)⁻¹ = I + Q + Q² + …`. Entry `n_ij` = expected number
  of visits to transient state `j` starting from `i`.
- **Expected steps to absorption** `t = N·1` (row sums of `N`).
- **Absorption probabilities** `B = N·R` (entry `b_ik` = P(absorbed in `k` | start `i`)).
- Sources: Grinstead & Snell, *Introduction to Probability*, Ch. 11.2 (Thms 11.4, 11.5)
  — LibreTexts mirror <https://stats.libretexts.org/Bookshelves/Probability_Theory/Introductory_Probability_(Grinstead_and_Snell)/11%3A_Markov_Chains/11.02%3A_Absorbing_Markov_Chains>;
  Wikipedia "Absorbing Markov chain" <https://en.wikipedia.org/wiki/Absorbing_Markov_chain>;
  Columbia IEOR 3106 notes <https://www.columbia.edu/~ww2040/IEOR3106F06/3106lec0928.pdf>.

**Key realization for the course:** the per-state recurrence the learner already builds,
`E_i = 1 + Σ_c P(c)·E_next`, is exactly one row of `(I − Q)·t = 1`. The current engine
*already* assembles `A = I − Q`, `b = 1`, and solves it. The whole flagship lesson is a
2×2 instance of the fundamental matrix.

### 2. Gambler's ruin — expected duration & ruin probability
1-D walk on `{0,…,N}`, `+1` w.p. `p`, `−1` w.p. `q=1−p`, absorbing at `0` and `N`.

- **Ruin probability** `r_k = p·r_{k+1} + q·r_{k-1}`, with `r_0 = 1`, `r_N = 0`.
  - Fair (`p=½`): `r_k = (N−k)/N` (linear).
  - Biased: `r_k = ((q/p)^k − (q/p)^N) / (1 − (q/p)^N)`.
- **Expected duration** `D_k = 1 + p·D_{k+1} + q·D_{k-1}`, with `D_0 = D_N = 0`.
  - Fair: `D_k = k(N−k)`.
  - Biased: `D_k = k/(q−p) − (N/(q−p))·(1−(q/p)^k)/(1−(q/p)^N)` (→ `k(N−k)` as `p→½`).
- Sources: Grinstead & Snell Ch. 12.2 — LibreTexts <https://stats.libretexts.org/Bookshelves/Probability_Theory/Introductory_Probability_(Grinstead_and_Snell)/12%3A_Random_Walks/12.02%3A_Gambler's_Ruin>;
  Wikipedia "Gambler's ruin" <https://en.wikipedia.org/wiki/Gambler%27s_ruin>;
  Zeilberger/Rutgers generalized duration <https://sites.math.rutgers.edu/~zeilberg/EM20/GamblersRuin.pdf>.

**Why it deepens the course:** introduces a genuinely new *quantity* — an absorption
**probability** — whose recurrence has **no `+1`** and a **boundary of 1** (vs. the
expected-time recurrence with a `+1` and boundary `0`). Same solver, new structure.

### 3. Simple random walks: recurrence vs transience (Pólya)
Simple symmetric walk on `ℤ^d` is **recurrent** for `d = 1, 2` (returns w.p. 1) and
**transient** for `d ≥ 3` (positive escape probability). Equivalent to whether `Σ uₙ`
(return-probability series, `uₙ ~ n^(−d/2)`) diverges.
- Sources: Levin & Peres, "Pólya's theorem" notes <https://pages.uoregon.edu/dlevin/polya.pdf>;
  MIT 18.095 lecture notes <https://math.mit.edu/classes/18.095/lect2/notes.pdf>.
- Subtlety worth teaching: in 1-D the walk is recurrent **but null-recurrent** — return is
  certain, yet *expected* return time is infinite. The tiniest drift makes it transient.

### 4. Mean recurrence time = 1 / stationary probability (Kac)
For an irreducible positive-recurrent chain with stationary `π` (`π = πP`, `Σπ = 1`):
the mean return time `m_i = E_i[T_i⁺] = 1/π_i` (Kac's lemma). `π_i` is also the long-run
fraction of time spent in `i`.
- Sources: Aldous, Stat 205B notes, Thm 21 "`π(x) = 1/E_xT_x`"
  <https://www.stat.berkeley.edu/~aldous/205B/MC_lec.pdf>; Kac's recurrence lemma
  <https://siamak.isoperimetric.info/teaching/markov/files/equilibrium-2.pdf>;
  Keeler, positive recurrence <https://hpaulkeeler.com/tag/stationary-distribution/>.

**Callback:** the warm-up lesson's `E[first H] = 2` is the simplest instance — for the
"is it H?" process `π_H = ½`, so the mean gap between heads is `1/π_H = 2`.

### 5. Birth–death chains & detailed balance
Nearest-neighbor chain on `{0,…,n}` with up-rate `p_i`, down-rate `q_i`. Reversible; the
stationary distribution from detailed balance is `π_i ∝ (p_0···p_{i-1})/(q_1···q_i)`.
Gambler's ruin is a birth–death chain with absorbing ends; the **Ehrenfest urn** is the
canonical ergodic birth–death chain (`π = Binomial(n, ½)`).
- Sources: Siegrist, *Probability/Stats/Stochastic Processes* 16.21
  <https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/16%3A_Markov_Processes/16.21%3A_Continuous-Time_Birth-Death_Chains>;
  Chen/Saloff-Coste, "Spectral computations for birth and death chains"
  <https://ar5iv.labs.arxiv.org/html/1305.0353> (gives `π(i)=c(p_0···p_{i-1})/(q_1···q_i)`);
  Lalley, UChicago Stat 312 HW7 (detailed balance ⇒ stationary)
  <http://galton.uchicago.edu/~lalley/Courses/312/HW7.pdf>.

### 6. Competing patterns: Penney's game & Conway numbers (bridge to overlap)
Two players pick length-3 patterns; the one appearing first wins. Non-transitive; the
**second player always has an edge**. Conway's leading-number formula: odds of `B` over
`A` are `(AA − AB)/(BB − BA)`, where `XY` is the overlap "correlation" of `X`'s suffixes
with `Y`'s prefixes (read in base 2). Example: `A=HHH`, `B=THH` ⇒ `(7−0)/(4−3)=7` ⇒
`P(B wins)=7/8`.
- Sources: Nishiyama, "Winning odds" (Conway algorithm worked) <https://plus.maths.org/os/issue55/features/nishiyama/index>;
  Springer "Penney's game odds from no-arbitrage" <https://link.springer.com/article/10.1007/s11238-026-10123-w>.
- Related autocorrelation result (ties to our overlap insight): expected wait for pattern
  `T` over a `q`-letter alphabet is `E[L_T] = Σ q^k` over self-overlap lengths `k`
  (ABRACADABRA / martingale argument). For fair binary patterns this is `Σ 2^k` over
  prefix=suffix overlaps — the "expert note" already in the flagship overlap beat.
  Sources: "Coins, Fair Casinos, Martingales" <https://asdia.dev/expository/abracadabra.pdf>;
  Lutsko, "Monkeys typing and martingales" <https://chrislutsko.com/files/Abracadabra.pdf>.

### Textbook touchstones
Grinstead & Snell *Introduction to Probability* (Ch. 11–12); Norris *Markov Chains*
(Ch. 1: class structure, hitting times, recurrence, invariant distributions); Ross
*Introduction to Probability Models* (Ch. 4: Markov chains, gambler's ruin, mean times).

### What the engine already gives us (lean on this)
- `buildAutomaton` is **general** for any H/T pattern; the UI just curates a few.
- `solveLinearSystem(A, b)` is a **general rational Gauss-Jordan** — it can solve *any*
  small system: expected times, ruin probabilities, absorption probabilities, `π = πP`,
  balance equations. (Extending it to augment with `I` yields the full inverse `N`.)
- `flipsToAbsorption` / `empiricalMean` / seedable `mulberry32` give reproducible Monte-Carlo.
- `StateGraph` lays states **left-to-right on a line** — already a number line; ideal for
  walks/birth–death. `SimChart` plots a running mean vs. a theory line. `BiasChart` plots a
  quantity vs. a swept parameter. The canonical `equationTiles` checker grades any
  `const + Σ coeff·var` recurrence.

---

## Candidate lessons (ranked)

### #1 — Gambler's Ruin: Will You Hit the Wall? `(lesson-gamblers-ruin)`

**Hook.** "You have \$2. You flip a fair coin: heads +\$1, tails −\$1, until you reach
\$4 or go broke. The game is *fair* — so what's the chance you go broke first? And how
many flips will it take?"

**Core learning promise.** Generalize a single hitting time into a walk with **two
absorbing barriers**, and learn to compute **two different things** about it: the
**probability** of each ending and the **expected duration** — and to see that a fair
game still ruins you, and a tiny edge compounds.

**Explicit link to current concepts.** Same four moves: states (positions `0..N`),
first-step recurrence, linear solve, simulation check. The expected-duration recurrence
`D_k = 1 + p·D_{k+1} + q·D_{k-1}` is *structurally identical* to `E_i = 1 + Σ P·E_next`
from the flagship — only the graph changed (a line, two absorbing ends). The new idea is
the **ruin-probability** recurrence `r_k = p·r_{k+1} + q·r_{k-1}` — **same shape, but no
`+1` and boundaries `{1, 0}`** — a perfect compare-and-contrast with what they know.

**Why it matters for quant.** This is *the* canonical quant-interview Markov problem.
Ruin probability, expected duration, "is a martingale strategy safe with finite
bankroll?" (no), and the asymmetry a small edge creates are bread-and-butter.

**The math, concretely.**
- Fair, `N=4`, start `k=2`: ruin `r_2 = (4−2)/4 = 1/2`; duration `D_2 = 2·(4−2) = 4`.
  Start `k=1`: `r_1 = 3/4`, `D_1 = 3`. (The midpoint takes longest: `D` is `k(N−k)`.)
- Biased, `p=0.4` (`q/p=1.5`), `N=4`, `k=2`: win prob `=(1−1.5²)/(1−1.5⁴)=0.308`, so
  **ruin `≈0.69`** — a mere 40/60 step bias ruins you ~69% of the time from the middle.
  Duration `D_2 = 2/0.2 − (4/0.2)·0.308 ≈ 3.85`.
- **Engine must compute:** a new `buildWalk(N, p)` (birth–death band: `k→k+1` advance on
  H, `k→k−1` on T, absorbing at `0` and `N`). Then **two** linear solves via the existing
  `solveLinearSystem`: duration (`A=I−Q`, `b=1`) and ruin (`A=I−Q`, `b = q·e_0`-style
  boundary vector). Simulation extended to record *which* end absorbed. No new solver, no
  new chart engine.

**Beat-by-beat (Bet → Explore → Model → Prove).**
1. `open-bet` — **prediction** [Bet]. "Fair game from \$2 of \$4: P(broke first)?" Traps:
   "0%, it's fair", "50%", "the game never ends".
2. `pick-stakes` — **patternPick-style chooser** [Bet]. Confirm `N=4`, start `k=2`, fair
   coin (compare-mode analog: "ruin vs. duration" are the two things we'll find).
3. `walk-sim` — **coinSim on the walk** [Explore]. Flip; token walks the number line;
   absorbs at an end. Gate after ≥1 absorption; guided replay shows one ruin + one win run.
4. `boundary-edge` — **stateTap** [Model]. "From `k=1`, on T you go to ___ (absorbed/ruined);
   on H to ___." Identify both absorbing boundaries.
5. `ruin-equation` — **equationTiles** [Model]. Build `r_1 = ½ r_2 + ½ r_0` with boundary
   tiles `r_0=1`, `r_4=0`. **The teach: no `+1`.** (Worked row `r_2` shown as example.)
6. `duration-equation` — **equationTiles** [Model]. Build `D_1 = 1 + ½ D_2 + ½ D_0`.
   Side-by-side with beat 5: "spot the `+1`, spot the boundary flip `1 → 0`."
7. `refine-prediction` — **slider** [Model]. Predict ruin probability (0–100%) *and*
   duration; both become chart markers.
8. `guided-solve` — **substitution** [Model]. Tap through the (symmetric, 3-unknown)
   solve to `r_2 = ½`, `D_2 = 4`.
9. `prove-ruin` — **theorySimChart** [Prove]. Run thousands of walks; empirical ruin
   *frequency* converges to `r_k`; toggle to empirical mean *duration* → `k(N−k)`.
10. `bias-sweep` — **BiasChart slider** [Prove, Extension]. Drag `p`: ruin-vs-`p` S-curve
    and duration-vs-`p` curve update live. The "house edge compounds" reveal.
11. `infinite-wall` — **simulation histogram** [Prove, Extension]. Remove the target wall
    (`N→∞`): fair walk still returns to `0` w.p. 1 (recurrent) but *expected* time is
    infinite; add a hair of downward drift → it escapes forever (transient). Cite Pólya.
12. `recap` — **recap** [Prove]. "Fair ≠ safe: `r=1−k/N`. Duration is `k(N−k)`. A tiny edge
    is catastrophic. Next: the matrix that does all of this at once."

**Interactable widgets.**
- *(reused)* **prediction / slider / substitution / theorySimChart / recap** — verbatim
  roles; `SimChart`'s theory line just points at `r_k` or `D_k`.
- *(reused, retargeted)* **coinSim → "Walk-to-the-Wall"**: the existing `StateGraph` is
  already a horizontal line of nodes; drive the active node along it as the token walks.
  Learner taps **Flip** (or **+1 / −1** buttons); the token slides, the active node pulses,
  and a **live dual gauge** shows the running empirical ruin% and step count. Absorbs at a
  double-ringed end. Instant per-flip feedback; `aria-live` announces position.
- *(reused, retargeted)* **equationTiles ×2**: the canonical checker grades both the ruin
  recurrence (const `0`/`1`, prob `½`/`p`/`1−p`, state vars `r_k`) and the duration
  recurrence. The *contrast* between the two rows is the whole lesson — surfaced by showing
  them stacked with the `+1` and boundary differences highlighted on correct submission.
- *(reused)* **BiasChart**: `p`-slider → two curves (ruin%, duration). Tap a `p` to read
  exact values; the fair point `p=½` is annotated.
- *(new, small)* **dual-outcome readout chip**: after each simulated batch, two tally
  strips (ruined / cashed-out) fill proportionally toward `r_k` and `1−r_k`.

**Feasibility.** *Reusable:* `solveLinearSystem`, `flipsToAbsorption`, `StateGraph`,
`SimChart`, `BiasChart`, `equationTiles` checker, all DOM beats. *New (small):*
`buildWalk(N,p)` builder (birth–death band, two absorbing states); a ruin-probability
boundary vector for the solver; `simulate` records the absorbing end; a back-step edge
style (or reuse the existing `reset` curve). No new math kernels.

**Targeted misconceptions.** "A fair game can't ruin you." "A small per-step edge ≈ a
small overall edge" (ruin is wildly asymmetric). "Expected duration is short" (it's
quadratic, maxed at the middle). Conflating the **probability** recurrence (no `+1`,
boundary `1`) with the **time** recurrence (`+1`, boundary `0`). "Martingale doubling
beats the casino" (finite bankroll ⇒ ruin).

---

### #2 — The Fundamental Matrix: One Formula for Every Hitting Time `(lesson-fundamental-matrix)`

**Hook.** "You've solved a dozen of these recurrences one state at a time. What if a
*single matrix* answered every 'how long?' and 'which way does it end?' question at once?"

**Core learning promise.** See that **all** first-step recurrences are the rows of
`(I − Q)·t = 1`, that `N = (I − Q)⁻¹` collects **expected visit counts**, that
**expected time = row sums of `N`**, and that **`B = N·R` gives the exit probabilities**
(the same "ruin probability" from Lesson 1, now read straight off the matrix).

**Explicit link to current concepts.** This is the grand unification of everything built
so far. The engine *already* forms `A = I − Q` and solves `A·t = 1`; this lesson makes
that hidden object visible and manipulable. The flagship's `E0,E1` system is literally a
2×2 fundamental-matrix problem.

**Why it matters for quant.** Interviewers love "expected number of rolls/steps until X,"
"probability you finish in state A vs B," and board-game/tennis problems. The fundamental
matrix is the one tool that dispatches all of them; knowing `t = N·1` and `B = N·R` cold
is a real edge.

**The math, concretely (worked example: tennis deuce).**
States: transient `{deuce, ad-server, ad-receiver}`, absorbing `{game-server,
game-receiver}`; server wins a point w.p. `p`.
- `p=½`: `I−Q = [[1,−½,−½],[−½,1,0],[−½,0,1]]`, `det=½`, and
  `N = [[2,1,1],[1,1.5,0.5],[1,0.5,1.5]]`.
- `t = N·1 = (4, 3, 3)` → **from deuce, 4 more points on average** (`n_{deuce,deuce}=2`
  expected visits to deuce). `B = N·R = ((½,½), …)` → **server wins 50%** (fair).
- General `p`: expected points from deuce `= 2/(1−2pq)`; server win prob from deuce
  `= p²/(p²+q²)`. At `p=0.6`: `≈3.85` points, **win prob `0.69`** (edge amplified).
- **Engine must compute:** a generic `chainFromSpec(states, weightedEdges)` builder (for
  non-pattern chains), and a `fundamentalMatrix()` that augments the existing Gauss-Jordan
  with `I` to return full `N`, plus `B = solve(A, R)` column-by-column. All on the present
  rational kernel.

**Beat-by-beat.**
1. `open-bet` — **prediction** [Bet]. "From deuce (fair), expected points to finish?"
   Traps: 2, "it can go forever", 4.
2. `name-states` — **stateTap / chooser** [Bet]. Identify the 3 transient + 2 absorbing
   states of deuce.
3. `build-Q` — **transition-matrix tiles (new)** [Explore]. Fill the `Q` grid (rows=from,
   cols=to) with `p`, `q`, `0`. Per-cell instant check vs. engine.
4. `one-row` — **equationTiles** [Model]. Build the deuce row `t_d = 1 + p·t_{ad-s} +
   q·t_{ad-r}`; caption: "this row *is* row `deuce` of `(I − Q)t = 1`."
5. `meet-N` — **Fundamental-Matrix "x-ray" (new)** [Model]. Reveal `N = (I−Q)⁻¹`; tap any
   cell `n_ij` → "expected visits to `j` from `i`"; the visit count animates onto the graph.
6. `rows-to-times` — **Fundamental-Matrix x-ray (new)** [Model]. Sweep a row; the entries
   slide together and sum into `t_i` (the expected time). "Row sum = hitting time."
7. `refine-prediction` — **slider** [Model]. Predict `t_deuce`; mark it.
8. `guided-solve` — **substitution** [Model]. Tap through `t_deuce = 4`.
9. `exit-odds` — **x-ray toggle `N·R` (new)** [Prove]. Same matrix, multiplied by `R`,
   yields server-vs-receiver win odds — "the ruin probability from last lesson, for free."
10. `prove-sim` — **theorySimChart** [Prove]. Simulate deuce games; mean points → 4, win
    frequency → 0.5 (or `p²/(p²+q²)`).
11. `bias-sweep` — **BiasChart** [Prove, Extension]. Sweep `p`: win-prob S-curve
    `p²/(p²+q²)` and expected-points curve.
12. `recap` — **recap** [Prove]. "Every recurrence you've built was a row of `(I−Q)t=1`.
    One inverse `N` gives expected time (row sums) *and* exit odds (`N·R`)."

**Interactable widgets.**
- *(new — the signature)* **Fundamental-Matrix "x-ray" card.** A DOM matrix of `N`'s
  entries (44px cells). **Tap a cell** → callout "expected visits to `j` from `i`" with the
  matching node glowing on the `StateGraph`. **Tap/sweep a row** → the row's cells detach,
  slide together, and *add up into the expected hitting time* `t_i` (reduced-motion: they
  just label-sum instantly). **Toggle `t = N·1 ↔ B = N·R`** → the right rail morphs from
  "expected time" to "exit probabilities." This turns the course's central linear algebra
  into a tactile object — abstract matrix → thing you poke. Instant, deterministic.
- *(new — small)* **transition-matrix tile grid.** The `equationTiles` idea in 2-D: tap a
  cell, tap a probability tile (`p`/`q`/`0`); the engine grades the whole `Q` per cell.
- *(reused)* **StateGraph** (deuce layout: deuce centered, ad-states flanking, games as the
  two double-ringed ends — a small layout extension), **equationTiles**, **slider**,
  **substitution**, **theorySimChart**, **BiasChart**, **prediction**, **recap**.

**Feasibility.** *Reusable:* the whole solver/sim/chart stack; the deuce expected-time
solve is already what the engine does internally. *New:* `chainFromSpec` builder;
`fundamentalMatrix()` (augment Gauss-Jordan with `I`); the matrix x-ray + transition-grid
widgets; a non-linear `StateGraph` layout (positions per node). The x-ray widget is the
main build; everything under it already exists.

**Targeted misconceptions.** "`N`'s entries are probabilities" (they're visit counts; can
exceed 1). "Expected time is a single matrix entry" (it's the **row sum**). "Exit odds are
50/50" (deuce with edge `p` is `p²/(p²+q²)`, super-linear). "The matrix is just notation"
(it's the entire system of first-step equations, at once).

---

### #3 — Coming Back: Stationary Distributions & Mean Recurrence Time `(lesson-stationary-recurrence)`

**Hook.** "A frog hops forever among 3 lily pads. Which pad does it come back to fastest —
and is that the same as the pad it spends the most time on?"

**Core learning promise.** Pivot from **absorbing** chains (time to *leave*) to **ergodic**
chains (time to *return*). Learn the stationary distribution `π = πP`, that `π_i` is the
**long-run fraction of time** in `i`, and that the **mean recurrence time is `1/π_i`**
(Kac). Two faces of one number.

**Explicit link to current concepts.** Everything so far measured time to *first reach* a
target. Return time is a hitting time *back to the start* — the mirror image. And the
warm-up's `E[first H] = 2` is revealed to be `1/π_H = 1/½`: mean recurrence in disguise.
The same `solveLinearSystem` now solves `π = πP` (with a normalization row).

**Why it matters for quant.** Long-run averages, "fraction of time in a state," ergodicity,
queue occupancy, and "expected time between events" all reduce to `π` and `1/π`. The
fraction-of-time ↔ return-time duality is a frequently tested insight.

**The math, concretely (worked example: Ehrenfest urn, `n=2`).**
States = balls in the left box `{0,1,2}`. From `1`: go to `0` or `2` w.p. ½ each; from `0`
or `2`: forced back to `1`.
- Stationary `π = Binomial(2, ½) = (¼, ½, ¼)`. **Detailed balance:** `π_0·1 = π_1·½`
  ⇒ `¼ = ¼` ✓ (reversible birth–death).
- **Mean recurrence** `m_i = 1/π_i`: `m_0 = m_2 = 4`, `m_1 = 2`. The *most-visited* state
  returns *fastest*; the corners are rare and slow.
- **Engine must compute:** `buildErhenfest(n)` (or generic `chainFromSpec`); solve
  `π = πP` by feeding `(Pᵀ − I)` plus a `Σπ = 1` row into `solveLinearSystem`; `m_i = 1/π_i`
  (rational reciprocal). Simulation extended to track time-in-state occupancy and gaps
  between visits.

**Beat-by-beat.**
1. `open-bet` — **prediction** [Bet]. "Return fastest to the middle or a corner? Is
   'time spent' the same as 'how often you return'?"
2. `meet-chain` — **coinSim (ergodic)** [Explore]. Step the frog/urn; no absorption — it
   loops forever. Watch the active node wander.
3. `occupancy` — **live occupancy histogram (new)** [Explore]. As it steps, three bars fill
   toward `π = (¼, ½, ¼)`. "Half the time in the middle."
4. `balance-edge` — **stateTap** [Model]. "Probability into state 1 must equal probability
   out" — identify the balancing edges.
5. `balance-equation` — **equationTiles** [Model]. Build a balance row, e.g.
   `π_1 = π_0·1 + π_2·1` (coeffs are transition probs; vars are `π`s). New recurrence flavor.
6. `guess-pi` — **stationary-bar widget (new)** [Model]. Drag three bars (sum locked to 1)
   to *guess* `π`; engine grades against the true `π`; a "detailed-balance scale" tips level
   only when balance holds.
7. `refine-prediction` — **slider** [Model]. Predict `m_1` (mean return to the middle).
8. `kac-reveal` — **substitution / narrative** [Prove]. Derive `m_i = 1/π_i`; `m_1 = 2`,
   `m_0 = 4`.
9. `prove-sim` — **theorySimChart** [Prove]. Empirical mean return time → `1/π_i`; toggle to
   occupancy → `π_i`. Same simulation, two readouts.
10. `duality` — **side-by-side reveal (overlap-style)** [Prove]. "fraction of time `= π_i`"
    next to "mean gap between visits `= 1/π_i`" — one number, two views.
11. `callback` — **narrative** [Prove, Extension]. `E[first H] = 2 = 1/π_H`: the very first
    lesson was secretly mean recurrence. Birth–death `π ∝ ∏ up/down` (Ehrenfest = binomial).
12. `recap` — **recap** [Prove]. Hitting (leave) ↔ recurrence (return) ↔ occupancy, unified.

**Interactable widgets.**
- *(new)* **occupancy histogram.** A `SimChart`-style Konva panel of bars (one per state)
  that fill toward `π` as the chain steps; a faint target band marks the true `π_i`. Live,
  converging, instant.
- *(new)* **stationary-bar guesser + detailed-balance scale.** Three draggable bars summing
  to 1; the learner places their guess; engine flashes correct/off-by per bar. A small
  beam-balance graphic visibly levels only when `π_i P_{ij} = π_j P_{ji}` — a tactile
  detailed-balance check. Tap-only fallback: stepper buttons per bar.
- *(reused, retargeted)* **coinSim** (ergodic, never absorbs), **equationTiles** (balance
  rows — needs `π`-variable tiles, a small token addition), **theorySimChart** (theory line
  at `1/π_i` or `π_i`), **stateTap**, **slider**, **substitution**, **recap**,
  **overlap-style side-by-side** for the duality reveal.

**Feasibility.** *Reusable:* solver (for `π = πP`), sim core, `StateGraph`, `SimChart`
shell, most beats. *New (small):* `buildErhenfest`/`chainFromSpec`; stationary solve setup;
occupancy + return-gap tracking in `simulate`; the occupancy-histogram and stationary-bar
widgets; `π`-variable tiles for the balance equation.

**Targeted misconceptions.** "Stationary = uniform." "Most-visited state returns slowest"
(it's fastest — `m_i = 1/π_i`). Inverting the duality (using `π_i` for the return time).
Confusing one-time hitting/absorption with long-run stationarity. "It only works if it
starts in `π`" (convergence vs. stationarity).

---

### #4 — Penney's Game: Racing Patterns `(lesson-penneys-game)` — strong, but already a roadmap stub

**Hook.** "Let me pick my coin pattern *after* you pick yours — and I'll still win more
than half the time. Always."

**Core learning promise.** Competing absorbing states: model two patterns racing in one
coin stream, compute **who wins** (an absorption probability) and **how long the race
lasts** (expected absorption time), and discover **non-transitivity** (no best pattern).

**Explicit link to current concepts.** Direct sequel to the flagship's overlap/"memory"
insight and the `THH`/`HTH` transfer lesson. Build a **product automaton** tracking
progress toward *both* patterns with two absorbing states; the **win probability is exactly
the ruin-probability tool from Lesson 1 / the `N·R` exit-odds from Lesson 2.**

**Why it matters for quant.** A famous "intuition-breaking" interview favorite; teaches that
choosing *second* with overlap information is an edge, and that "stronger than" can cycle.

**The math, concretely.** `A = HHH`, `B = THH`: only way `A` wins is the first three flips
are `HHH` (prob 1/8), so **`P(B wins) = 7/8`.** Conway: `(AA − AB)/(BB − BA) =
(7 − 0)/(4 − 3) = 7` ⇒ odds 7:1. **Engine must compute:** `buildPenneyProduct(A, B)` (states
= joint match-progress, two absorbing); win prob and game length via the *existing*
absorption-probability + expected-time solves. Optional: a Conway-number calculator
(pure string overlap, base 2) to cross-check.

**Beats (sketch, 9–11).** `open-bet` prediction ("can player 2 always win?") → `pick-A`
patternPick → `auto-counter` (reveal player-2's overlap-based counter) → `race-sim` coinSim
(two progress tracks) → `win-edge` stateTap → `conway-tiles` equationTiles (assemble
`(AA−AB)/(BB−BA)`) → `refine-prediction` slider (P(win)) → `prove-sim` theorySimChart
(empirical win frequency → 7/8) → `cycle` non-transitivity reveal (the 4-pattern beat-loop)
→ `recap`.

**Interactable widgets.** *(reused)* prediction, patternPick, coinSim (extended to a
**dual-progress race** view), stateTap, equationTiles (grade the Conway ratio), slider,
theorySimChart, recap. *(new)* a **non-transitivity ring** — tap pattern X, see which Y
beats it, forming a visible cycle (the "rock-paper-scissors of coins"); a **Conway-number
calculator** that slides one pattern under another and lights up overlaps.

**Feasibility.** *Reusable:* solver/sim/charts/most beats. *New:* product-automaton builder
(the trickiest of the four — joint state space and its `StateGraph` layout); dual-progress
coinSim; Conway calculator. Higher build cost than #1–#3, and it's already the named
roadmap stub — hence ranked #4 here despite being a great fit.

---

## Recommended slate of 3 (ordered) and why they cohere

**1 → Gambler's Ruin** · **2 → The Fundamental Matrix** · **3 → Stationary & Mean Recurrence**

This is a deliberate arc through the theory of "time" in Markov chains:

- **Lesson 1 widens the question.** The course knows one hitting time on one absorbing
  target. Gambler's ruin adds a *second* absorbing barrier and a *second kind of answer* —
  an absorption **probability** — using the same first-step/linear-solve/simulate loop.
  Learners meet the `+1`-vs-no-`+1` recurrence contrast and the `p`-sweep, on the most
  tactile possible object (a token on a number line). Best first because it's the canonical
  quant problem and reuses the most existing UI.
- **Lesson 2 unifies the method.** Having solved many recurrences by hand, learners see they
  were always filling rows of `(I − Q)t = 1`, and that one matrix `N = (I−Q)⁻¹` yields
  expected time (row sums) **and** the exit odds (`N·R`) — which retroactively explains the
  *ruin probability* of Lesson 1. This is the theory capstone of the **absorbing** thread:
  it compresses everything into one object and one formula.
- **Lesson 3 turns the question around.** With "time to leave" fully understood, we ask
  "time to return," pivoting to **ergodic** chains: `π = πP`, fraction-of-time `= π_i`, and
  mean recurrence `= 1/π_i`. It reframes the entire course — even the first lesson's
  `E[H]=2` — as instances of one duality, and connects birth–death/detailed balance back to
  the gambler's-ruin chain from Lesson 1.

Together they take the learner from *one hitting time* → *general absorption (time and
probability)* → *the matrix behind all of it* → *the recurrence/stationary dual*, with
every lesson reusing the engine's general linear solver, Monte-Carlo, and state-graph —
depth over breadth, one hard idea per lesson, many interactable widgets each.

**Single best widget idea:** the **Fundamental-Matrix "x-ray" card** (Lesson 2) — a tappable
`N = (I−Q)⁻¹`: tap a cell to see *expected visits*, sweep a row to watch it *sum into the
expected hitting time*, and toggle to `N·R` to read *exit odds*. It makes the course's
central piece of linear algebra into something you can touch — the most "make a hard idea
click" widget in the slate. (Closest runner-up: Lesson 1's "Walk-to-the-Wall" number-line
simulator with a live ruin%/duration dual gauge and a bias slider — the most immediately
buildable, since it's `coinSim` + `StateGraph` + `SimChart` retargeted.)
