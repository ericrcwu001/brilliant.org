# Agent 1 — Quant Interview Canon — Ideation

Lens: **"Quant Interview Canon" researcher.** I map the actual body of probability
questions asked in quant trading/HFT interviews to lessons that are natural
sequels to *Pattern Hitting Times* (HH vs HT via state thinking) **and** are
teachable through the existing React + Konva + pure-engine widget catalog.

Anchors I designed against:
- **North star:** `docs/core_instructions.md` — learn by doing, depth over breadth,
  one hard idea made to click; no AI in content.
- **Cadence + contract:** `docs/mvp_prd.md` — one concept per beat (prompt → one
  interaction → instant specific feedback → short explanation → one primary
  action), 3-step hint ladder, `buildAutomaton(pattern, p)` engine contract.
- **Identity + a11y:** `docs/ui_design_system.md` — Clean Mathematical Notebook,
  Konva for state graph / chart only, 44px tap-only + reduced-motion paths.
- **Rubric:** `docs/beat-audit-rubric.md` — Bet → Explore → Model → Prove arc;
  P1–P5 pedagogy (one objective per beat, productive struggle, escalating
  feedback, interaction fit, non-redundancy).

Concepts the new lessons must explicitly extend (from the flagship):
**(1)** model a process as **STATES**; **(2)** **TRANSITIONS** as
advance/self-loop/reset; **(3)** **OVERLAP / autocorrelation** as memory;
**(4)** first-step analysis → **RECURRENCE**; **(5)** solve a linear system for an
**EXPECTED HITTING TIME**; **(6)** **SIMULATION vs THEORY** (law of large
numbers); **(7)** **PARAMETER SENSITIVITY** (bias `p`).

---

## Research notes (with sources)

### The canonical source texts (the "body of questions")

- **Xinfeng Zhou, *A Practical Guide to Quantitative Finance Interviews* (2008)** —
  "the Green Book." Ch. 4 *Probability Theory* (expected value, conditional
  probability/Bayes, variance) is the most-tested chapter; Ch. 5 *Stochastic
  Process* opens with **5.1 Markov Chain** (first-passage / expected hitting
  time, gambler's ruin). Industry reviews note Markov-chain + expected-value
  problems dominate Jane Street / Citadel / IMC screens.
- **Timothy Falcon Crack, *Heard on the Street: Quantitative Questions from Wall
  Street Job Interviews*** — brainteasers + probability at mid difficulty;
  expected-number-of-tosses, dice waiting times, fair-game arguments.
- **Frederick Mosteller, *Fifty Challenging Problems in Probability with
  Solutions* (1965)** — the classic well; gambler's-ruin variants, runs, and
  expected-waiting-time problems framed as puzzles.
- **Mark Joshi, *Quant Job Interview Questions and Answers*** — explicit
  Markov-chain / first-step-analysis expected-time and stopping problems.
- **Walter Penney (1969), "Problem 95: Penney-Ante," *Journal of Recreational
  Mathematics*** — the racing-patterns game; popularized by **Martin Gardner**
  (*Scientific American*, 1974).
- **John H. Conway** — the *leading-number* algorithm for Penney odds (no
  published proof; reconstructed by **Y. Nishiyama**, *IJPAM* 59(3), 2010, via
  Collings's waiting-time theorems).
- **L. J. Guibas & A. M. Odlyzko (1981), "String overlaps, pattern matching, and
  nontransitive games," *J. Combinatorial Theory A*** — the **correlation /
  autocorrelation polynomial**; expected wait for binary pattern `A` is
  `2 · (autocorrelation read in base 2)`.
- **S.-Y. R. Li (1980), "A martingale approach to the study of occurrence of
  sequences of patterns," *Annals of Probability*** + **David Williams,
  *Probability with Martingales*** — the **"ABRACADABRA" casino / optional
  stopping** derivation. Underpinned by **Doob's Optional Stopping Theorem**.

### Key results I will teach (all engine-computable, all verified across sources)

| Problem | Result | Source method |
|---|---|---|
| `E[HH]`, `E[HT]` (flagship) | 6, 4 | recurrence / overlap |
| `E[THH]`, `E[HTH]` (L3) | 8, 10 | recurrence / overlap |
| `E[HHH]` | 14 = 2³+2²+2¹ | autocorrelation |
| Two consecutive 6s (die) | **42** = 6²+6¹ | autocorrelation, q=6 |
| Roll `1·2·3·4·5·6` in order | 6⁶ = 46,656 | no self-overlap ⇒ q^L |
| Penney `THH` vs `HHH` | **THH wins 7/8** (7:1) | absorption prob / Conway |
| Penney 2nd-player rule | beat `X₁X₂X₃` with `(¬X₂)X₁X₂` | Conway / Guibas–Odlyzko |
| Gambler's ruin, fair | win prob `i/N`; duration `i(N−i)` | first-step analysis |
| Gambler's ruin, biased | win prob `(1−r^i)/(1−r^N)`, `r=q/p` | first-step analysis |
| Coupon collector (die) | `6·H₆ = 14.7` | sum of geometrics |

### The four methods behind the canon (and which the flagship already owns)

1. **First-step analysis → linear recurrence → solve the system** — *already the
   spine of the flagship.* It generalizes verbatim to **gambler's ruin** (a walk
   on a line) and to **Penney's game** (two absorbing states), and to **coupon
   collector** (advance/self-loop chain).
2. **Absorbing Markov chains** — adds a *second output* next to expected time:
   the **absorption probability** (`P(A before B)`, `P(ruin)`). Same solver, new
   boundary conditions.
3. **Martingale / Optional Stopping (the "fair casino")** — a *second, elegant
   method* that re-derives the very waiting times the learner solved by
   recurrence, and exposes the **autocorrelation closed form** directly.
4. **Correlation / Conway leading numbers** — the closed form for waiting times
   and Penney odds; the formal name for the flagship's "overlap is memory."

### Strongest sequels (and why), at a glance

- **Penney's Game** — already roadmap #4; the canon's marquee *wow* result
  (non-transitivity), stays in the coin-pattern world, and upgrades "expected
  time" → "who wins" (absorption probability). **Highest payoff.**
- **Gambler's Ruin** — the single most ubiquitous Markov/first-step problem;
  *cleanest method-generalization* (same recurrence machine, brand-new arena),
  and `StateGraph` already lays out a line of nodes. **Cheapest high-value build.**
- **Martingale Casino** — the most beautiful idea; a second lens that re-derives
  `6, 4, 8, 10` and Penney's odds from overlap alone. **Best capstone**, highest
  pedagogy risk (abstraction), mitigated by re-deriving numbers they already
  trust.
- **Coupon Collector (dice)** — solid and very interview-common, but mechanically
  closest to the existing self-loop work and needs a larger alphabet; best as the
  **bridge into roadmap #5 (Weighted Coins & Dice).**

---

## Candidate lessons (ranked)

### Candidate 1 — Penney's Game: the coin race nobody should take *(rank #1)*

**Hook.** "Let me pick my coin pattern *after* you pick yours — and I'll still win
more than half the time. Every time."

**Core learning promise (one idea).** In a *race* between two patterns, the winner
is decided by **overlap between the patterns, not by either pattern's own expected
wait** — and the "who-beats-whom" relation is **non-transitive**, so there is no
best pattern (the second mover always has an edge).

**Explicit link to flagship concepts.** Extends **(1) states** to a *combined*
automaton tracking progress on **both** patterns at once; **(2) transitions** now
fork toward *two* absorbing states; **(3) overlap** graduates from "self-overlap
slows you down" to "cross-overlap decides the race"; **(4)/(5)** first-step
analysis now solves for an **absorption probability** `P(A before B)` *and* an
expected game length — same linear-solve, new boundary conditions; **(6)** race
simulation converges to the Conway odds; **(7)** an optional `p`-bias sandbox
shows how the edge shifts.

**Why it matters for quant interviews.** The textbook non-transitive / second-mover
problem (Penney 1969, Conway, Gardner; Guibas–Odlyzko). Interviewers use it to
test whether you can resist the "stronger pattern wins" trap and reason with
competing absorbing states — the same structure as "which barrier do I hit
first," "which order do events occur."

**The math, concretely.**
- *Combined automaton.* State = the longest current suffix of the flip stream that
  is a prefix of `A` **or** `B` (KMP over the merged pattern set). Two absorbing
  states: `A matched`, `B matched`.
- *Absorption probability.* With `w_s = P(A before B | state s)`:
  `w_s = Σ_c P(c)·w_{δ(s,c)}`, with `w_{Amatched}=1`, `w_{Bmatched}=0`. Same
  rational Gauss–Jordan solver already in `src/engine/automaton.ts`.
- *Expected game length.* `g_s = 1 + Σ_c P(c)·g_{δ(s,c)}`, both absorbing = 0.
- *Worked example (the headline).* `A = HHH` vs `B = THH`. Solving the combined
  chain gives **`P(THH before HHH) = 7/8`** — `THH` wins 7:1, even though
  `E[HHH]=14 > E[THH]=8` already *hinted* `THH` is faster. The reason `THH`
  crushes `HHH`: the only way to reach `HHH` is to first build `HH`, and the flip
  *before* that first `H` was either the start or a `T` — so `THH` almost always
  completes first.
- *Worked example (non-transitivity).* The second-player rule: to beat opponent's
  `X₁X₂X₃`, choose **`Y = (¬X₂) X₁ X₂`**. Opponent `HHH` → you `THH` (7:1);
  opponent `THH` → you `TTH`; opponent `TTH` → you `HTT`; opponent `HTT` → you
  `HHT`; opponent `HHT` → you `THH`. The arrows form a **cycle** — exactly like
  rock-paper-scissors — so "best pattern" cannot exist.
- *What the engine must compute:* `buildPenney(a, b, p)` → combined states,
  forked transitions (toward two absorbing ids), the two solved vectors
  (`winProbA[state]`, `gameLength[state]`), and Conway odds `(AA−AB)/(BB−BA)` for
  the live counter dial. Reuses `prefixFunction`, `classifyKind`, the rational
  arithmetic, and `solveLinearSystem` already in the engine.

**Beat-by-beat (11 beats).**
1. **Bet** — `prediction`: "You take `HHH`. I take `THH`. Who appears first?" Trap
   option: "`HHH` — it's just as likely in any 3 flips." *(Bet)*
2. **Bet** — `prediction`: "Does the pattern with the *shorter* expected wait
   always win the race?" Surfaces the wrong mental model up front. *(Bet)*
3. **Explore** — `coinSim` **race mode** (NEW): one shared coin stream feeds two
   progress tracks; first to complete its pattern wins. Learner flips and watches
   `THH` repeatedly beat `HHH`. *(Explore)*
4. **Model** — `stateTap` on the **combined** graph: "After `…HH`, a `T` — whose
   progress survives?" Tap where the merged state goes. *(Model)*
5. **Model** — `overlap` (cross): highlight how `THH`'s prefix `TH` swallows
   `HHH`'s near-misses — the cross-overlap that decides the race. *(Model)*
6. **Model** — `equationTiles`: build the absorption-probability row
   `w_s = 1/2 w_{·} + 1/2 w_{·}` for one interior state (boundary tiles `w=1`,
   `w=0` provided). *(Model)*
7. **Model** — `slider`: predict `P(THH wins)` on a 0–1 probability number line.
   *(Model)*
8. **Model** — `substitution`: tap through the solve to `7/8`. *(Model)*
9. **Prove** — `theorySimChart` **race variant** (NEW series): run many races;
   empirical win-fraction for `THH` converges to `0.875`. *(Prove)*
10. **Prove** — **"Beat the Opponent"** counter-builder (NEW, the signature beat):
    the app locks in an opponent pattern; the learner taps to build their own 3
    tiles; a live win-probability dial updates each placement; reaching a >½
    pattern is the win. Then a **non-transitivity cycle** reveal animates
    `HHT→HTT→TTH→THH→HHT`. *(Prove)*
11. **Prove** — `recap`: generate-then-reveal "why is there no best pattern?",
    hero verdict `THH ≻ HHH (7:1)`, the second-player rule, bridge to the casino
    lesson. *(Prove)*

**INTERACTABLE WIDGETS** (the heart of the lesson):
- *`prediction` (reused, beats 1–2).* Manipulate: tap a chip. Responds: neutral
  "good guess" ack (ungraded bet, per `PredictionBeat`). Loop: commits the
  misconception so the race can refute it.
- *Race `coinSim` (NEW, extends `CoinSimBeat`/`CoinStream`/`StateGraph`, beat 3).*
  Manipulate: `Flip` (single + batch). Responds: the shared coin token appends;
  **two** progress chips advance/reset on their own tracks; the first pattern to
  complete flashes a winner banner; `aria-live` announces "stream …THH — THH
  wins." Loop: repeated flips make the 7:1 *felt* before it's proved. Gate:
  `Continue` after ≥1 completed race.
- *Combined-graph `stateTap` (reused, beat 4).* Manipulate: tap the next merged
  state for a near-miss. Responds: green/red per `StateTapBeat`, with the
  engine's edge as ground truth; hint ladder escalates nudge → glow the edge →
  reveal. Loop: forces the insight that one pattern's near-miss is the other's
  progress.
- *Cross-`overlap` (reused `OverlapBeat`, beat 5).* Manipulate: none (narrative),
  but side-by-side mini graphs highlight the *cross* edges. Responds: captions
  "`THH` keeps progress where `HHH` resets." Loop: names the race-deciding
  structure.
- *`equationTiles` (reused, beat 6).* Manipulate: tap-to-place coefficient/state
  tiles for an absorption-probability row. Responds: canonical-form check
  (`equationDiagnosis`), per-slot green lock, targeted hint. Loop: the learner
  *assembles* `P`-recurrence, not just `E`-recurrence — same widget, new meaning
  (constant term is `0`, boundaries are `1`/`0`).
- *Probability `slider` (reused, beat 7).* Manipulate: drag on a 0–1 line.
  Responds: locked `--mark` marker that reappears on the convergence chart. Loop:
  commit a number, then watch simulation judge it.
- *`substitution` (reused, beat 8).* Manipulate: tap-to-advance. Responds: each
  engine step folds in; lands on `7/8`. Loop: directs the algebra without typing.
- *Race `theorySimChart` (NEW series in `SimChart`, beat 9).* Manipulate:
  `Run 500 races`, `Run more`. Responds: empirical `P(THH wins)` curve sweeps
  toward a `0.875` theory line (the existing live-converging chart, retargeted to
  a probability in `[0,1]`). Loop: LLN confirms the odds.
- ***"Beat the Opponent" dial (NEW, beat 10 — best widget).*** Manipulate: the
  opponent's 3 tiles are locked; the learner taps H/T into three of their own
  slots (tap-only, 44px). Responds **instantly (<100ms, pure engine)**: a
  Konva/SVG **win-probability dial** swings as each tile lands, green past 50%;
  an inline reads "`P(you win) = 7/8`." Hint ladder: L1 "match the opponent's
  first two flips, but lead with the flip that blocks them"; L2 glow the
  prepend slot; L3 reveal `Y=(¬X₂)X₁X₂`. Then a tap "Next opponent" cycles
  through several, proving *every* choice is beatable. Closer: the
  **non-transitivity cycle** graph animates the dominance loop.
- *`recap` (reused, beat 11).* Manipulate: tap the "why no best pattern?"
  retrieval chip before the reveal. Responds: hero `THH ≻ HHH`, the rule, and the
  forward bridge. Loop: retrieval-first ending (matches `RecapBeat`).

**Feasibility.** *Reused:* `prediction`, `stateTap`, `overlap`, `equationTiles`,
`slider`, `substitution`, `recap`, plus `CoinStream`, the rational solver,
`prefixFunction`. *New work:* (a) `buildPenney(a,b,p)` engine module (medium — a
merged-trie KMP + two boundary solves; the hardest new math but bounded, and
unit-testable against the 7/8 golden); (b) race mode for `coinSim` and a dual
progress track (medium); (c) the win-probability **dial** + counter-builder
(medium, DOM tiles + a small Konva gauge); (d) the non-transitivity cycle graph
(small Konva). `StateGraph`'s strict left-to-right layout is the one friction
point — a combined automaton is a small DAG, so either accept a tidy linear order
of merged states or add a light 2-row layout prop. **Risk:** combined-graph
readability on mobile; mitigate by capping the lesson to length-3 patterns (≤7
merged states).

**Targeted misconceptions.**
- "The pattern that's individually faster/likelier wins the race" (it's about
  *cross*-overlap; `THH` beats `HHH` 7:1).
- "Beating relation is transitive, so a best pattern exists" (it's a cycle).
- "Going second is a disadvantage" (here it's a guaranteed edge).

---

### Candidate 2 — Gambler's Ruin: how a fair game still breaks you *(rank #2)*

**Hook.** "Flip for $1 a round until you hit $0 or $100. It's a *fair* coin — so
how does the house always win?"

**Core learning promise (one idea).** First-step analysis isn't about coin
patterns — it's a **universal tool**. On a random walk between two barriers it
computes **both** a probability (will I reach the top before going broke?) **and**
an expected duration — and it reveals that against a deep-pocketed opponent ruin
is near-certain, and a *tiny* edge against you is catastrophic.

**Explicit link to flagship concepts.** Re-grounds **(1) states** as *wealth*
on a number line (not matched-prefix), **(2) transitions** as up/down steps,
**(4) first-step analysis** → the *same* `E_i = 1 + p·E_{i+1} + q·E_{i-1}` shape
the learner already built, **(5) solving the linear system** now for *two*
quantities (ruin probability `P_i` and duration `D_i`), and **(7) parameter
sensitivity** becomes the emotional core — sweeping the bias `p` (the house edge)
bends the ruin curve dramatically. **(6)** simulation confirms `i/N` and `i(N−i)`.

**Why it matters for quant interviews.** Gambler's ruin is the single most asked
Markov/first-passage problem (Green Book Ch. 5, Mosteller, Joshi). It's the
prototype for risk-of-ruin, stop-loss/target reasoning, and "probability of
hitting one barrier before another" — daily quant intuition.

**The math, concretely.**
- *States* `0..N` (wealth), `0` and `N` absorbing; up prob `p`, down `q=1−p`.
- *Ruin/target probability* `P_i = P(reach N before 0)`:
  `P_i = p·P_{i+1} + q·P_{i-1}`, `P_0=0`, `P_N=1`.
  Fair (`p=½`): **`P_i = i/N`** (linear!). Biased: `P_i = (1−r^i)/(1−r^N)`,
  `r=q/p`.
- *Expected duration* `D_i = 1 + p·D_{i+1} + q·D_{i-1}`, `D_0=D_N=0`.
  Fair: **`D_i = i(N−i)`**.
- *Worked example.* `N=4`, start `i=2`, fair: `P_2 = 2/4 = ½`, `D_2 = 2·2 = 4`.
  Start `i=1`: `P_1 = ¼`, `D_1 = 1·3 = 3`.
- *Worked example (the house edge).* `N=4`, `i=2`, `p=0.4` (`q/p=1.5`):
  `P_2 = (1−1.5²)/(1−1.5⁴) = (−1.25)/(−4.0625) ≈ 0.31`. A 10-cent edge turns a
  50/50 shot into ~31%. Push `N→∞` (the casino's bankroll) and a fair player is
  ruined with **probability 1**.
- *What the engine must compute:* `buildRandomWalk(N, p)` → states `0..N`,
  up/down transitions, two canonical recurrences (`P` with constant `0`; `D` with
  constant `1`), and the two solved vectors (reuse `solveLinearSystem`). Closed
  forms `i/N`, `i(N−i)`, `(1−r^i)/(1−r^N)` for the slider/sandbox readouts.

**Beat-by-beat (10 beats).**
1. **Bet** — `prediction`: "Fair coin, start at $2 of $4. Chance you reach $4
   before $0?" Trap: "Can't say without simulating." *(Bet)*
2. **Explore** — `coinSim` **walk mode** (NEW): a token on a 0..N number line
   moves left/right per flip until it hits a barrier; learner flips and watches a
   few walks end in ruin or target. *(Explore)*
3. **Model** — `stateTap`: "From $i, a win goes to ‚ and a loss to ‚?" tap the two
   neighbors (advance both directions). *(Model)*
4. **Model** — `equationTiles`: build the **ruin-probability** row
   `P_i = 1/2 P_{i+1} + 1/2 P_{i-1}` (constant `0`; boundary tiles `P_0=0`,
   `P_N=1`). *(Model)*
5. **Model** — `equationTiles`: build the **duration** row
   `D_i = 1 + 1/2 D_{i+1} + 1/2 D_{i-1}` (the `1+` flip cost returns!). *(Model)*
6. **Model** — `slider`: predict the duration `D_2`. *(Model)*
7. **Model** — `substitution`: tap-solve the small system to `P_2=½`, `D_2=4`.
   *(Model)*
8. **Prove** — `theorySimChart`: run many walks; empirical ruin-fraction → `i/N`
   and empirical mean duration → `i(N−i)`. *(Prove)*
9. **Prove** — **house-edge sandbox** (NEW chart): drag bias `p`; a **ruin-prob
   vs p** curve and the `P_i` value update live, snapping from ½ at `p=0.5` to
   near-certain ruin as `p` dips. *(Prove)*
10. **Prove** — `recap`: hero `P_i = i/N`, `D_i = i(N−i)`, and "a fair game is the
    *best* deal you'll ever be offered, and it still ruins you against an infinite
    bankroll." *(Prove)*

**INTERACTABLE WIDGETS:**
- *Walk `coinSim` (NEW, big reuse of `StateGraph` + `CoinStream`).* Manipulate:
  `Flip`. Responds: the active node steps along the `0..N` line (StateGraph
  already lays nodes out left-to-right and pulses the active one); the coin stream
  records W/L; hitting `0` or `N` flashes ruin/target; `aria-live` reads the
  wealth each step. Loop: makes "absorbing barrier" physical. **Key reuse win:**
  the line of wealth states *is* the existing graph layout.
- *Bidirectional `stateTap` (reused).* Manipulate: tap up- and down-neighbors.
  Responds: engine-checked green/red; hint glows the correct neighbor. Loop:
  cements the birth-death transition.
- *Two `equationTiles` beats (reused).* Manipulate: tap-to-place. Responds:
  canonical check. Loop: the learner builds a **probability** recurrence
  (constant `0`) and a **time** recurrence (constant `1`) back to back — the
  contrast (no `1+` vs `1+`) is the whole lesson in two tile rows. *(Engine note:
  the tile bank gains `P`/`D` state tokens and `0` constant — already supported
  kinds.)*
- *Duration `slider` (reused).* Manipulate: drag. Responds: locked marker feeds
  the chart. Loop: predict-then-verify.
- *`substitution` (reused).* Manipulate: tap-advance. Responds: folds to `½`, `4`.
- *Dual `theorySimChart` (reused/extended).* Manipulate: `Run`. Responds: two
  converging series (ruin fraction → `i/N`; mean steps → `i(N−i)`). Loop: LLN on
  *both* outputs at once.
- *House-edge sandbox (NEW, reuses `BiasChart` pattern).* Manipulate: drag `p`
  (continuous). Responds: a **ruin-probability-vs-p** curve with a live dot, plus
  expected-duration readout; the curve's cliff near `p=0.5` is the payoff. Loop:
  feel how brutal a small edge is. *(Direct analog of the flagship's
  `BiasSandboxBeat` + `BiasChart`, retargeted from `E` to `P_ruin`.)*
- *`recap` (reused).* Retrieval chip "why does a fair game still ruin you?", then
  the two closed forms.

**Feasibility.** *Reused:* essentially the **entire** widget catalog
(`prediction`, `stateTap`, `equationTiles`, `slider`, `substitution`,
`theorySimChart`, `recap`), `StateGraph`, `CoinStream`, `BiasChart`, the rational
solver. *New work:* (a) a small pure `buildRandomWalk(N, p)` module returning the
same `Automaton`-shaped contract (low — it's a birth-death chain; the solver
already exists); (b) wiring `coinSim`/`theorySimChart` to a walk instead of a
pattern (low–medium); (c) retargeting `BiasChart` to plot `P_ruin(p)` (low).
**Lowest new-widget cost of all candidates** — `StateGraph`'s linear node layout
fits a number line perfectly. Keep `N` small (≤6) for graph legibility on mobile.

**Targeted misconceptions.**
- "A fair game means I'm 50/50 to win regardless of bankroll" (true for ruin
  prob symmetric `N`, but people misjudge how a *deep-pocketed* opponent guarantees
  ruin as `N→∞`).
- "A small house edge barely matters" (it makes ruin near-certain).
- "Expected duration scales linearly with my stake" (it's `i(N−i)`, peaking in the
  middle).

---

### Candidate 3 — The Martingale Casino: beat the algebra with a fair bet *(rank #3)*

**Hook.** "You spent a whole lesson solving equations to get `E[HH]=6`. Watch me
get it in ten seconds — with a casino that can't make a profit."

**Core learning promise (one idea).** A **fair game has zero expected profit**, so
"money in = money out." Stake one gambler per flip; the only gamblers who cash out
at the moment the pattern appears are the ones aligned with the pattern's
**self-overlaps**. Therefore **`E[wait] = Σ 2^k` over every prefix that is also a
suffix** — the closed form behind every waiting time in the course.

**Explicit link to flagship concepts.** This is the formal payoff of **(3)
overlap / autocorrelation**: the "memory" the learner *felt* in HH vs HT is
literally the set of surviving gamblers. It provides a **second, independent
derivation** of **(5) the expected hitting time** — a theory-vs-theory check that
complements **(6) simulation-vs-theory**. It reframes **(1)/(4)** (states/
recurrence) as *one* route to an answer the martingale reaches another way, and
generalizes to any alphabet (**(7)**: `Σ q^k`, e.g. dice).

**Why it matters for quant interviews.** Optional stopping / martingale arguments
are the dividing line between "can grind a recurrence" and "thinks like a quant"
(Green Book stochastic chapter; Li 1980; the ABRACADABRA staple). The fair-game
"no free lunch" instinct is the same one used for pricing and no-arbitrage.

**The math, concretely.**
- *Setup.* Before each flip a fresh gambler bets $1 that the upcoming flips spell
  the pattern; a correct flip doubles the stake (fair odds), a wrong flip wipes
  the gambler out. Let `T` = first time the pattern appears.
- *Fair game ⇒* total staked `= T` (one $1 gambler per flip); total paid out at
  `T` = `Σ_{k: prefix_k = suffix_k} 2^k` (only gamblers aligned with a
  prefix-suffix overlap are still alive). Optional Stopping ⇒ `E[T]` = that sum.
- *Worked examples (these re-derive the whole course):*
  - `HH`: overlaps at `k=2` (HH) and `k=1` (H) ⇒ `2²+2¹ = 6` ✓
  - `HT`: overlap only at `k=2` ⇒ `2² = 4` ✓
  - `THH`: only `k=3` ⇒ `2³ = 8` ✓
  - `HTH`: `k=3` and `k=1` ⇒ `2³+2¹ = 10` ✓
  - `HHH`: `k=3,2,1` ⇒ `8+4+2 = 14` ✓
  - die "66": `k=2,1` with `q=6` ⇒ `6²+6¹ = 42` ✓
- *What the engine must compute:* it already has `prefixFunction`; expose
  `autocorrelation(pattern)` → the set of overlap lengths `{k}`, and
  `Σ q^k`. For the optional Penney tie-in, `crossCorrelation(a,b)`. Validate the
  sum against the existing `expectedTimes` golden values (they must match exactly).

**Beat-by-beat (9 beats).**
1. **Bet** — `prediction`: "Is there a way to get `E[HH]` without solving any
   equations?" Trap: "No — you must solve the system." *(Bet)*
2. **Explore** — **casino timeline** (NEW): a row of gamblers enters flip by flip;
   the learner flips until `HH` appears and watches most gamblers bust while a few
   survive. *(Explore)*
3. **Model** — `stateTap`-style **"who's still alive?"**: at the stopping flip,
   tap the gamblers who cash out (those aligned to a prefix=suffix). *(Model)*
4. **Model** — `overlap`: highlight the self-overlaps of `HH` (`k=1,2`) on the
   mini state graph — the exact edges from the flagship. *(Model)*
5. **Model** — **overlap-sum tiles** (NEW, `equationTiles` cousin): assemble
   `E = 2² + 2¹` from `2^k` tiles, one per surviving gambler; checker verifies the
   sum. *(Model)*
6. **Model** — `slider`: predict `E[HHH]` *using the rule* before revealing.
   *(Model)*
7. **Prove** — `theorySimChart`: simulate `HHH`; empirical mean → `14`, matching
   the `2³+2²+2¹` tiles. *(Prove)*
8. **Prove** — **pattern lab** (NEW): a small picker (`HH`, `HT`, `THH`, `HTH`,
   `HHH`, and die "66"); for each, the overlap set lights up and the `Σ q^k` total
   updates live, re-deriving every number from the course (and `42`). *(Prove)*
9. **Prove** — `recap`: the fair-game principle, the closed form, and the
   triangulation "recurrence = martingale = simulation all give 6." *(Prove)*

**INTERACTABLE WIDGETS:**
- *Casino timeline (NEW, DOM + light Konva, beats 2–3).* Manipulate: `Flip`, and
  tap-to-mark which gamblers survive. Responds: each flip, a new gambler row
  appears; correct-streak rows glow and "double," wrong rows gray out; at the
  stop, the survivors (the overlaps) pulse and their `2^k` payouts sum on screen.
  Instant feedback compares the learner's "alive" taps to the engine's
  autocorrelation set (green/red + hint). Loop: the abstract martingale becomes a
  countable row of winners.
- *Self-`overlap` (reused `OverlapBeat`, beat 4).* Manipulate: none (narrative).
  Responds: the `HH` graph highlights `k=1,2` overlaps. Loop: connects "surviving
  gambler" ↔ "prefix=suffix" ↔ the flagship's reset/self-loop edges.
- *Overlap-sum tiles (NEW variant of `equationTiles`, beat 5).* Manipulate:
  tap-place `2^k` tiles (one per overlap). Responds: canonical-sum checker (reuse
  the `equationDiagnosis` per-slot pattern) flashes green at `2²+2¹`; wrong tiles
  get a targeted hint ("only count `k` where the first `k` = last `k`"). Loop:
  the learner *computes* the closed form, not just reads it.
- *Rule `slider` (reused, beat 6).* Manipulate: drag to predict `E[HHH]`.
  Responds: locked marker → chart. Loop: apply the new rule before proof.
- *`theorySimChart` (reused, beat 7).* Manipulate: `Run`. Responds: empirical mean
  → `14`. Loop: simulation ratifies the martingale closed form.
- *Pattern lab (NEW, beat 8 — the generalization engine).* Manipulate: tap a
  pattern chip (incl. a die face-pair). Responds **instantly**: the overlap
  positions light on a mini graph and the `Σ q^k` total animates to the answer
  (`HH→6`, `HT→4`, `THH→8`, `HTH→10`, `HHH→14`, `66→42`). Loop: one widget
  re-derives the entire course + the dice headline, making the closed form
  *general*.
- *`recap` (reused, beat 9).* Retrieval chip "why can't a clever bettor beat a
  fair game?", then the closed form + triangulation.

**Feasibility.** *Reused:* `prediction`, `overlap`, `slider`, `theorySimChart`,
`recap`, `equationDiagnosis` checker pattern, `prefixFunction`, `StateGraph`.
*New work:* (a) expose `autocorrelation`/`crossCorrelation` from the engine (low —
the prefix function is already there; just surface the overlap set + `Σ q^k`); (b)
the casino-timeline widget (medium — the one genuinely new visual; DOM rows +
small Konva glow, fully deterministic); (c) the overlap-sum tile variant (low–
medium — a constrained reuse of the tile checker); (d) the pattern lab
(low — picker + the new engine call). **Pedagogy risk is the headline concern**
(optional stopping is the most abstract idea in the slate); mitigated by (i)
re-deriving numbers the learner already proved, and (ii) never invoking measure
theory — the "fair game ⇒ in = out" instinct carries it.

**Targeted misconceptions.**
- "There's a stopping rule that beats a fair game" (no — that's the whole point).
- "Expected wait is always `1/P(pattern) = 2^n`" (only when the pattern can't
  self-overlap; otherwise add the overlap terms).
- "Longer pattern ⇒ always longer wait" (overlaps, not length, set the total).

---

### Candidate 4 — Coupon Collector / "Roll all six" *(rank #4 — honorable mention & bridge to roadmap #5)*

**Hook.** "How many die rolls to see all six faces at least once? (It's not 6, and
it's not 12 — it's about 15.)"

**Core learning promise (one idea).** When you can split a wait into independent
**phases**, the total expected time is the **sum of geometric waits**, and the
*last* coupon dominates — collecting the final face alone takes 6 rolls on
average, so the whole job is `6·H₆ ≈ 14.7`.

**Explicit link to flagship concepts.** Reuses **(1) states** = number of distinct
faces collected `0..6`; **(2) transitions** are pure **advance** (new face, prob
`(6−k)/6`) vs **self-loop** (repeat, prob `k/6`) — the *same* self-loop the
flagship used, now with a *growing* self-loop probability; **(4)/(5)** recurrence
`E_k = 1 + (k/6)E_k + ((6−k)/6)E_{k+1}` solves to `6/(6−k)` per phase; **(6)**
simulation → `14.7`; **(7)** generalizes to `n` faces (`n·H_n ≈ n ln n`).

**Why it matters for quant interviews.** A Jane-Street favorite and Green Book
expected-value staple; the canonical "decompose into a sum of geometrics" move,
and the gateway to harmonic-number asymptotics.

**The math, concretely.** `E[T] = Σ_{k=0}^{5} 6/(6−k) = 6(1+½+⅓+¼+⅕+⅙) = 6·H₆ =
14.7`. Phase `k→k+1` is geometric with success prob `(6−k)/6`, so mean
`6/(6−k)`. *What the engine must compute:* `buildCollector(n)` → states `0..n`,
advance/self-loop transitions with probs `(n−k)/n` and `k/n`, the recurrence
row per state, and the solved `E_k` (reuse the solver); the per-phase
`6/(6−k)` for the chart.

**Beat-by-beat (9 beats).** 1. `prediction` — guess rolls for all six (trap: "6")
*(Bet)*. 2. roll-sim with a **6-cell face grid** that lights up (NEW; extends
`coinSim`) *(Explore)*. 3. `stateTap` — "you have 4 faces; does this roll advance
or self-loop?" *(Model)*. 4. `equationTiles` — build `E_k = 1 + (k/6)E_k +
((6−k)/6)E_{k+1}` *(Model)*. 5. **phase-bar widget** — the `6/(6−k)` cost of each
phase as growing bars; the last phase towers *(Model)*. 6. `slider` — predict the
total *(Model)*. 7. `substitution` — sum the phases to `14.7` *(Model)*. 8.
`theorySimChart` — empirical mean → `14.7` *(Prove)*. 9. `recap` — sum-of-
geometrics + the "last coupon dominates" insight, bridge to weighted dice *(Prove)*.

**INTERACTABLE WIDGETS.** Reused: `prediction`, `stateTap`, `equationTiles`
(needs `k/6` fraction tokens + a self-loop slot — small bank extension), `slider`,
`substitution`, `theorySimChart`, `recap`, `StateGraph` (advance + self-loop is
*exactly* what it already draws). New: (a) the **face-collection grid** (6 cells
that fill as faces appear; the hero visual) + roll-sim wiring; (b) a **phase-cost
bar** widget showing each `6/(6−k)` (could even reuse `BiasChart`-style Konva).
Manipulation/feedback loops mirror the flagship (flip→graph responds; tap→
graded; tiles→canonical check; run→converge).

**Feasibility.** *Reused:* most of the catalog + `StateGraph` (self-loop chain is
its native shape). *New work:* `buildCollector(n)` (low), the face grid (low–
medium), `k/n` probability tiles in the checker (low — needs new `prob` tokens
beyond `1/2,p,1-p`). **Lowest math risk.** Down-ranked only because it leans
hardest on mechanics the flagship already taught (self-loops) and needs a larger
alphabet — making it the natural *content* of roadmap #5 rather than a wholly new
idea.

**Targeted misconceptions.** "All six takes ~6 rolls" (it's ~15); "each new face
is equally hard" (the last takes 6× the first); "`n` faces ⇒ `~n` rolls"
(`~n ln n`).

---

## Recommended slate of 3 (ordered) — and why they cohere

**L4 → Penney's Game · L5 → Gambler's Ruin · L6 → The Martingale Casino.**

This trio is a deliberate arc around the **absorbing-Markov-chain** spine that the
flagship implicitly opened, escalating one shared thread — *absorption* — while
each lesson lands a distinct, hard "click":

1. **L4 Penney's Game** keeps the learner in the **familiar coin-pattern world**
   but flips the question from "how long until my pattern?" to "**whose pattern
   wins?**" This introduces **competing absorbing states** and the new output
   **absorption probability** `P(A before B)`, and pays off with the canon's
   biggest *wow* — **non-transitivity**. Lowest conceptual ramp, highest emotional
   payoff; it's already roadmap #4.
2. **L5 Gambler's Ruin** takes the *exact* first-step-analysis machine and moves
   it **off pattern-matching onto a number line**, proving the method is a
   **universal tool** (the meta-skill the product sells). It **reuses absorption
   probability** from L4, **re-introduces the `1+` duration recurrence** from the
   flagship, and makes **parameter sensitivity (`p`)** the star via the house-edge
   sandbox. It is also the **cheapest to build** (the whole widget catalog +
   `StateGraph`'s line layout transfer almost untouched), de-risking the slate.
3. **L6 The Martingale Casino** is the **capstone**: a second, elegant lens that
   **re-derives everything the learner already proved** — `E[HH]=6`, `HT=4`,
   `THH=8`, `HTH=10`, and even L4's Penney odds — from **overlap alone**, via the
   fair-game / optional-stopping argument. It promotes the flagship's intuitive
   "overlap is memory" into the **closed-form autocorrelation rule** (`Σ q^k`),
   and ends the course on its most beautiful idea while *triangulating*
   recurrence = martingale = simulation.

Why they cohere: **one method (first-step analysis / absorbing chains), three
escalating arenas (racing patterns → random walk → fair-game stopping), and a
through-line on overlap** — L4 shows cross-overlap *decides races*, L6 shows
self-overlap *is* the closed form, and L5 proves the underlying recurrence machine
generalizes anywhere. Each is depth-first (8–11 beats, many interactable widgets),
no-AI, and built mostly from the existing catalog plus one signature new widget
apiece. **Honorable mention (Candidate 4, Coupon Collector)** is the natural
content for the existing roadmap stub #5 *(Weighted Coins & Dice)* and a gentle
interleave if a lighter lesson is wanted between the heavier three.
