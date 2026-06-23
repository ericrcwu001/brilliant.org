# Proposed Next Lessons — Pattern Hitting Times course

**What this is.** A proposal for the **3 lessons that come after the current flagship**
(`lesson-pattern-hitting-times`, "why `E[HH]=6` but `E[HT]=4`"). It was produced by
5 parallel research agents (quant-interview canon, Markov-chain theory, combinatorics-on-
words, interaction/widget design, and curriculum/pedagogy), each grounded in the repo
(engine, schema, widget catalog, design system, beat rubric) and in the math literature.
Their full notes live in `audits/ideation/agent-{1..5}-*.md`.

**The headline.** All five agents independently converged on the same spine:
**Penney's Game** (recommended by all 5) and a deep **overlap/martingale** lesson
(recommended by 4) plus **Gambler's Ruin** (recommended by 4). The proposed slate is:

| # | Lesson | One-line | Varies | Recommended by |
|---|--------|----------|--------|----------------|
| **L4** | **Penney's Game** — "The Bet Where Going Second Wins" | Two patterns race on one stream; who appears *first* is decoupled from expected wait, and it's **non-transitive**. | the **question** (how long → who's first) | A1#1, A2, A3, A4#1, A5#1 (all 5) |
| **L5** | **Gambler's Ruin** — "How a Fair Game Still Breaks You" | The same first-step machine on a number line with two walls → a **probability** *and* a **duration**; a tiny edge is catastrophic. | the **arena** (coin patterns → random walk) | A1#2, A2#1, A4#3, A5 (alt) |
| **L6** | **The Overlap Shortcut** — "Read the Wait Off the Pattern" | `E[wait] = Σ 2^(overlap length)`, proved by a **fair-casino martingale**; re-derives 6, 4, 8, 10 in one line. | the **method** (solve a system → a closed form) | A1#3, A3#1+#2, A5#2 |

Each lesson is **10–12 beats**, **problem-first**, **no AI**, completable tap-only + reduced-
motion, and—per your priority—**packed with interactable widgets**: ~a dozen new ones across the
slate (plus heavy reuse of the existing 10), and **every lesson has at least one living graph +
simulation you watch resolve** — a swarm of races settling on 7:1, ~100 walkers flowing to the walls
while the ruin curve warps, three methods snapping onto one value. See [§6](#widget-catalog).

---

## Table of contents

1. [Why these three (cross-agent convergence)](#why-these-three)
2. [How they continue the current lesson](#how-they-continue)
3. [Lesson L4 — Penney's Game](#l4-penneys-game)
4. [Lesson L5 — Gambler's Ruin](#l5-gamblers-ruin)
5. [Lesson L6 — The Overlap Shortcut (Conway + Martingale)](#l6-overlap-shortcut)
6. [New interactable-widget catalog](#widget-catalog)
7. [Engine & schema additions](#engine-additions)
8. [Course-path integration (IDs, unlock order, milestones)](#course-path)
9. [Alternates considered & deferred](#alternates)
10. [Math sources](#sources)

---

<a name="why-these-three"></a>
## 1. Why these three (cross-agent convergence)

Five agents, five lenses, one slate. The vote tally:

| Candidate lesson | A1 quant | A2 markov | A3 pattern | A4 widgets | A5 curric. | In slate? |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| **Penney's Game** | #1 | ✓ (bridge) | #3 | #1 | #1 | **Yes (unanimous)** |
| **Gambler's Ruin** | #2 | #1 | — | #3 | alt/L7 | **Yes** |
| **Overlap shortcut / Martingale** | #3 | ✓ | #1 & #2 | (in L2) | #2 | **Yes** |
| Weighted Coins & Dice | bridge | — | — | — | #3 | Alternate |
| Fundamental Matrix | — | #2 | — | — | — | Deferred |
| Stationary / Mean recurrence | — | #3 | — | — | — | Deferred |
| Coupon Collector | #4 | — | — | #4 | future | Deferred |
| Litt's Game (clumping) | — | — | #4 | — | — | Deferred |

The three picks aren't just popular—they form a deliberate arc. Borrowing A5's framing,
each lesson changes **exactly one variable** from the base course, so the learner reuses the
machine they already trust and isolates one genuinely new idea:

```
Base (L1–L3):   fair coin · one pattern · EXPECTED TIME · solved by a state system
L4 Penney's:    vary the QUESTION   (how long  →  who's first)
L5 Gambler's:   vary the ARENA      (coin patterns → a walk between two walls)
L6 Shortcut:    vary the METHOD     (solve a system → a one-line closed form + proof)
```

Ordering rationale: **Penney's first** (stays on the fair coin, only competition is new, and
delivers the biggest "wow" to sustain momentum); **Gambler's Ruin second** (proves the method
is an arena-independent tool); **the Shortcut last** (it's a *retrieval capstone*—it re-derives
`6, 4, 8, 10` a new way, so it only lands once the learner has computed them the long way).

---

<a name="how-they-continue"></a>
## 2. How they continue the current lesson

The flagship installs seven transferable ideas. Every proposed lesson explicitly re-uses a
subset and extends one:

| Current-lesson concept | L4 Penney's | L5 Gambler's Ruin | L6 Overlap Shortcut |
|---|---|---|---|
| **States** | combined race chain (progress on *both* patterns) | wealth `0..N` on a line | self-overlap positions |
| **Transitions** (advance/self-loop/reset) | forks toward **two** absorbing states | ±1 steps to two walls | borders = the reset depths |
| **Overlap is memory** | **cross**-overlap decides the race | (n/a) | self-overlap **is the closed form** (`Σ2^L`) |
| **First-step recurrence** | a **win-probability** recurrence (no `1+`, boundary 1/0) | **two** recurrences: probability *and* duration | re-derived by a martingale, not first-step |
| **Linear-system solve** | same rational solver, new boundaries | same solver, twice | bypassed by the shortcut, validated against it |
| **Simulation vs theory** | empirical win-rate → Conway odds | empirical ruin-rate/duration → `i/N`, `i(N−i)` | empirical mean → the `Σ2^L` value |
| **Parameter sensitivity (p)** | a biased coin can **flip** who wins | the **house edge** is the emotional core | the base generalizes (`Σ q^L`, e.g. dice) |

A single object threads all three: the **overlap set**. In the flagship it was a near-miss edge;
in L4 it becomes the cross-correlation that decides a race; in L6 it becomes a sum of `2^L` chips
and a row of surviving gamblers. The **AutocorrelationRuler** widget (below) is literally the
same component in self-mode (L6) and cross-mode (L4).

---

<a name="l4-penneys-game"></a>
## 3. Lesson L4 — Penney's Game: "The Bet Where Going Second Wins"

**Hook.** *"You proved `HH` is slower than `HT` (6 vs 4). So on one shared stream of flips,
`HT` shows up first more often — right?"* (It's a perfect **tie**, ½ each.) *"Now pick any
3-flip pattern. I'll pick second and beat you 7 to 1."*

**Core learning promise (one idea).** Model two patterns racing on **one** coin stream as a
single absorbing chain with **two** absorbing states; "appears first" is **decoupled** from
"expected wait," and the beats-relation is **non-transitive**—there is no best pattern, and the
second mover always has an edge.

**Why it matters for quant.** The canonical intuition-breaker (Penney 1969; Gardner 1974;
Conway). Interviewers use it to see whether you can resist "the stronger/rarer pattern wins" and
reason about competing absorbing states ("which event happens first")—and the second-mover edge
is a clean no-arbitrage story.

### The math (worked, engine-verifiable)

- **Combined automaton.** State = longest current suffix of the stream that is a prefix of `A`
  **or** `B` (KMP over the merged pattern set). Two absorbing states: `A matched`, `B matched`.
- **Win probability** `w_s = P(A first | state s)`: `w_s = Σ_c P(c)·w_{δ(s,c)}`, with
  `w_{A}=1`, `w_{B}=0`. *No `1+` term*—this is the muscle-memory trap the lesson exploits.
  Solved by the existing rational `solveLinearSystem`.
- **Expected game length** `g_s = 1 + Σ_c P(c)·g_{δ(s,c)}`, both absorbing `= 0`.
- **Conway's leading-number shortcut.** Odds `B≻A = (AA − AB) : (BB − BA)`, where `XY` is the
  base-2 overlap number of `X`'s suffixes against `Y`'s prefixes.
- **Worked headline.** `A=HHH`, `B=THH`: `AA=7, AB=0, BB=4, BA=3` ⇒ `B` wins
  `(7−0):(4−3) = 7:1`, i.e. **`P(THH first)=7/8`**. (Reason: reaching `HHH` requires first
  building `HH`, and the flip before it is almost always a `T`—which *is* the start of `THH`.)
- **The opener tie.** `HH` vs `HT` on a shared stream: both need an `H` first; the very next
  flip decides (`H`→HH, `T`→HT), so **½ each**—despite `6 ≠ 4`. Perfect callback to the flagship.
- **Second-player rule (length 3).** Beat `a₁a₂a₃` with `B = (¬a₂) a₁ a₂`. So `HHH→THH`,
  `HHT→THH`, `HTH→HHT`, `HTT→HHT`, … The "beats" arrows form a **cycle** (rock-paper-scissors).
- **Non-transitivity, sourced.** `THH ≻ HHT` and `HHT ≻ HTT`, yet `THH ⊁ HTT`.
- **Paradox beat.** `HHH (E=14)` vs `HHT (E=8)` is a **1:1 tie**; `THTH (E=20)` *beats*
  `HTHH (E=18)` at `9/14`—so a longer expected wait can win the race.

### Beat-by-beat (11 beats)

| # | beatId | interaction | phase | Teaches (one thing) | Wrong-path it manufactures |
|---|--------|-------------|-------|---------------------|----------------------------|
| 1 | `open-bet` | `prediction` | Bet | "Who's first" ≠ "how long." | Pick `HT` "because 4<6"; it's a tie. |
| 2 | `race-the-tie` | **raceSim** (new) | Explore | `HH` vs `HT` tie at ~50/50 on a shared stream. | Expect `HT` to dominate; tally won't budge. |
| 3 | `first-step-split` | `stateTap` | Model | From "one H", `H`→HH wins, `T`→HT wins—one flip decides. | Tap extra intermediate states. |
| 4 | `new-contender` | `prediction` | Bet | Length-3: a second mover can win big. | Believe `HHH` is unbeatable. |
| 5 | `pick-your-counter` | `patternPick` (graded) | Model | Odds depend on overlap **with the opponent**, not your pattern's strength. | Pick a "strong-looking" `HHT`; lose the odds check. |
| 6 | `race-the-counter` | **raceSim** (batch) | Prove | Empirical `P(THH first)` → 0.875. | Call early noise "luck." |
| 7 | `win-prob-tiles` | `equationTiles` | Model | The **win-probability** recurrence: no `1+`, boundaries 1/0. | Reflexively place a `1+` cost (3 lessons of habit). |
| 8 | `solve-the-odds` | `substitution` (choose-the-step) | Model | Solve the P-system to `7/8`. | Mis-order the substitutions. |
| 9 | `conway-aligner` | **autocorrelationRuler** (cross mode) | Model | Conway numbers: slide `A` under `B` for `AB≠BA`; odds `=(AA−AB):(BB−BA)`. | Miss a shifted match. |
| 10 | `non-transitive-loop` | **dominanceWheel** (new) | Prove | The wow: every pattern has a beater; the relation cycles. | "Just pick the best one"—each pick gets a beater shown. |
| 11 | `recap` | `recap` | Prove | Race ≠ wait; P-recurrence; overlap sets odds; no best pattern. | (retrieval-first recap) |

**Faded scaffolding / transfer signal.** Cap hints at `maxHintLevel: 2` on `pick-your-counter`
and `win-prob-tiles` (mirrors L3). `transferAttained = true` iff the learner picks a *winning*
counter for `HHH` **and** builds the P-recurrence without hitting the cap.

### Interactable widgets (the heart of the lesson)

**Signature visual moment — the odds emerge.** The Prove beats are a live spectacle: hundreds of
races stream across the shared-stream **RaceTrack** while a **win-probability needle (OddsDial)**
swings and settles on **7:1**, and two stacked outcome columns fill chip-by-chip — you literally
*watch* `THH` pull away from `HHH`. Then the **DominanceWheel** lights its non-transitive cycle as a
glowing rock-paper-scissors loop, and a **TournamentHeatmap** of all 8×8 matchups fills in so "no
best pattern" is something you *see*, not read.

- **RaceTrack / PatternDuel** *(new, large — centerpiece).* Two lanes (A top, B bottom), each a
  compact matched-prefix progress chain reusing `StateGraph` geometry; one shared `CoinStream`
  ribbon feeds both. *Manipulate:* `Flip` (single) or `Run 200 races` (batch); pick/swap
  patterns. *Responds:* each lane advances/resets per flip (the **reset is the overlap lesson in
  motion**), the winner flashes, two converging win-rate bars + a live tally ("you 138 · them 62")
  approach the Conway odds. *Feedback loop:* a wrong winner prediction triggers the ladder pointed
  at the cross-overlap (`AB` vs `BA`). *Build:* Konva lanes/ribbon + DOM `aria-live` "A wins / B
  wins" + DOM bars as the accessible mirror; reduced-motion resolves instantly and animates only
  the tally.
- **AutocorrelationRuler (cross mode)** *(new, small — shared with L6).* Two mono rows; the learner
  taps ◀/▶ to shift one pattern under the other and taps each aligned column "same/different."
  Matching full-overlaps light green; the binary leading number assembles; the odds fraction
  updates. *Feedback loop:* each tap is graded against the engine's correlation, 3-step ladder on a
  miss. Pure DOM (44px cells, tactile like equation tiles).
- **DominanceWheel** *(new, large).* The 8 length-3 patterns on a ring with "beats" arrows. *Manipulate:*
  tap a node → outgoing green arrows to everyone it beats, incoming red from its predator; a mini
  quiz "tap the pattern that beats this one" grades against the pairwise matrix. *Responds:* tracing
  the ring reveals a directed cycle—visual proof there's no best pattern. *Build:* Konva radial graph
  reusing `StateGraph` node/arrow primitives + `winMatrix(patterns,p)`.
- **Reused:** `prediction`, `patternPick` (now **graded + high-agency**, which fixes the cycle-1
  "passive confirmation screen" finding), `equationTiles` (P-targets), `substitution`
  (choose-the-step, fixing the cycle-1 low-agency reveal), `theorySimChart` (win-rate target line),
  optional bias sandbox (a biased coin can flip the winner), `recap`.

**Feasibility.** *New engine (pure, golden-testable):* `buildRaceAutomaton(a,b,p)` (merged-KMP
product chain, two absorbers; the trickiest new math, but bounded—cap at length-3, ≤7 merged
states) and `conwayLeadingNumbers(a,b,q)`. Golden test: `penneyOdds(HHH,THH)=7:1` and MC win-rate
within tolerance (seeded `mulberry32`). *New widgets:* RaceTrack (large), DominanceWheel (large),
AutocorrelationRuler (small). Everything else reuses the catalog.

**Misconceptions targeted.** "faster expected wait ⇒ wins the race"; "there's a strongest pattern";
"adding a `1+` cost to a probability recurrence"; "pick your counter by your own pattern's strength."

---

<a name="l5-gamblers-ruin"></a>
## 4. Lesson L5 — Gambler's Ruin: "How a Fair Game Still Breaks You"

**Hook.** *"You have \$2. Flip a fair coin: heads +\$1, tails −\$1, until you hit \$4 or \$0.
The coin is fair—so what's the chance you go broke first, and how long will it take?"*

**Core learning promise (one idea).** First-step analysis isn't about coin patterns—it's a
**universal tool**. On a walk between two barriers it computes **two** things: a **probability**
(reach the top before broke?) and an **expected duration**—and it shows that against a deep-pocketed
opponent ruin is near-certain, and a *tiny* edge is catastrophic.

**Why it matters for quant.** The single most-asked Markov / first-passage problem (Green Book Ch. 5,
Mosteller, Joshi). It is the prototype for risk-of-ruin, stop-loss/target reasoning, and "probability
of hitting one barrier before another."

### The math (worked, engine-verifiable)

- States `0..N` (wealth), `0` and `N` absorbing; up prob `p`, down `q = 1−p`.
- **Reach-`N` probability** `P_i = p·P_{i+1} + q·P_{i-1}`, `P_0=0`, `P_N=1`.
  - Fair (`p=½`): **`P_i = i/N`** (linear). Ruin `= (N−i)/N`.
  - Biased: `P_i = (1−r^i)/(1−r^N)`, `r = q/p`.
- **Expected duration** `D_i = 1 + p·D_{i+1} + q·D_{i-1}`, `D_0 = D_N = 0`. Fair: **`D_i = i(N−i)`**.
- **Worked, `N=4`, fair:** `i=2` → `P=½`, `D = 2·2 = 4`; `i=1` → `P=¼`, `D = 1·3 = 3`. The midpoint
  lasts longest.
- **Worked, the house edge (`N=4`, `i=2`, `p=0.4`, `r=1.5`):**
  `P = (1−1.5²)/(1−1.5⁴) ≈ 0.31` ⇒ **ruin ≈ 0.69**. A 10-cent edge turns a coin-flip into a 31%
  shot. As `N→∞` (the casino's bankroll), a *fair* player is ruined with **probability 1**.

The two recurrences are the whole lesson: the **probability** recurrence has **no `1+`** and
boundary `1`; the **duration** recurrence has the familiar `1+` and boundary `0`. Building them
back-to-back is a direct compare/contrast with everything the learner already knows.

### Beat-by-beat (11 beats)

| # | beatId | interaction | phase | Teaches (one thing) | Wrong-path |
|---|--------|-------------|-------|---------------------|-----------|
| 1 | `open-bet` | `prediction` | Bet | Fair ≠ safe; ask for P(broke first). | "0%, it's fair" / "always 50/50." |
| 2 | `walk-once` | **walkBoard** (single) | Explore | A token random-walks to a wall. | Expect it to "even out" and never end. |
| 3 | `ruin-board` | **walkBoard** (live solve) | Model/Prove | Drag start, walls, and `p`; P(reach N) vs P(ruin) + duration recompute live. | Drag toward a wall and expect the bar not to tilt. |
| 4 | `boundary-edge` | `stateTap` | Model | From `i`, H→`i+1`, T→`i−1`; the two walls absorb. | Tap the wrong neighbor / miss a wall. |
| 5 | `ruin-tiles` | `equationTiles` | Model | The **probability** recurrence—**no `1+`**, boundary 1/0. | Reflexively add a `1+` cost. |
| 6 | `duration-tiles` | `equationTiles` | Model | The **duration** recurrence—`1+` returns, boundary 0. | Drop the `1+`; mix up the boundary. |
| 7 | `predict-duration` | `slider` | Model | Commit a guess for `D_2`. | Guess linear in stake. |
| 8 | `guided-solve` | `substitution` (choose-the-step) | Model | Solve to `P_2=½`, `D_2=4`. | Mis-order the symmetric solve. |
| 9 | `prove-sim` | `theorySimChart` (walk variant) | Prove | Empirical ruin-rate → `i/N`; mean steps → `i(N−i)`. | Trust a tiny sample. |
| 10 | `house-edge` | **walkBoard** + `BiasChart` | Prove | Ruin-vs-`p` has a cliff near ½; a small edge is brutal. | Expect a gentle, linear response. |
| 11 | `recap` | `recap` | Prove | `P=i/N`, `D=i(N−i)`; fair still ruins you vs an infinite bankroll. | (retrieval-first) |

**Faded scaffolding / transfer signal.** Cap hints on `ruin-tiles` + `duration-tiles`;
`transferAttained = true` iff both recurrences are built without reveal (the probability-vs-time
contrast is the transferable skill).

### Interactable widgets

**Signature visual moment — the walker swarm + living landscape.** Release a **swarm of ~100 tokens
(WalkerSwarm)** that random-walk the number line at once, each flashing as it's absorbed at a wall,
while the outcome bar fills and a **ruin-probability landscape** (`P_i = i/N`) plus the **duration
parabola** (`i(N−i)`) draw themselves from the data. Drag the bias `p` and the whole landscape
**warps live** from a straight line into a steep cliff — the house edge made visible — then the
**DistributionHistogram** fills bin-by-bin into its fat-tailed shape. The most cinematic graph +
simulation moment in the slate.

- **WalkBoard / RuinBoard** *(new, large — the single most tactile widget in the slate).* A 1-D
  lattice lane. *Manipulate:* drag the **start token** and both **wall handles** (0 and N), and a
  **coin-bias** control (all three also exposed as sliders for the tap-only path). *Responds:* a
  stacked **outcome bar** (reach-N vs ruin) and an **E[duration]** readout recompute on every change;
  "Walk" plays one trajectory as a sparkline; a faint **ruin-heat ribbon** tints each start position
  by its ruin probability so the learner sees the whole landscape at once. *Feedback loop:* dragging
  toward a wall visibly tilts the bar; nudging `p` off ½ collapses the favorable outcome—the "aha"
  lives in the drag. *Build:* Konva lattice + draggable handles (commit on drag-end only, per the
  tile-layer rule) + heat ribbon; DOM sliders + numeric `aria-live` mirror; reduced-motion updates
  bars instantly with no token animation. Reuses `StateGraph`'s left-to-right node layout (it *is* a
  number line) + the rational `solveLinearSystem` (twice).
- **DistributionHistogram** *(new, medium — debuts here, broadly reusable).* "Run 1,000 walks" bins
  outcomes (durations / which wall) into a live Konva histogram with mean & ±σ markers—showing the
  famously **fat** duration spread that the current mean-only `SimChart` cannot. DOM table fallback.
- **Reused:** `prediction`, `stateTap` (pointed at the walk chain), `equationTiles` ×2 (the
  probability/time contrast), `slider`, `substitution`, `theorySimChart` (walk variant), `BiasChart`
  (ruin-vs-`p` curve), `recap`.

**Feasibility.** *New engine (pure):* `buildWalk(N,p)` (birth–death band, two absorbers; returns the
same `Automaton`-shaped contract) + a ruin-probability boundary vector + `simulateWalk` recording
which end absorbed. **Lowest new-math cost in the slate**—the solver and chart already exist; only
the builder and the WalkBoard view are new. Keep `N ≤ 6` for mobile legibility.

**Misconceptions targeted.** "a fair game can't ruin you"; "a small per-step edge ≈ a small overall
edge"; "expected duration is short / linear in stake" (it's `i(N−i)`, peaking in the middle);
conflating the probability recurrence (no `1+`, boundary 1) with the time recurrence (`1+`, boundary 0).

---

<a name="l6-overlap-shortcut"></a>
## 5. Lesson L6 — The Overlap Shortcut: "Read the Wait Off the Pattern" (Conway + Martingale)

**Hook.** *"You solved four linear systems to get `6, 4, 8, 10`. A quant hands you `HTHT` and 30
seconds. There's a one-line rule—let's earn it, and prove it with a casino that can't make a profit."*

**Core learning promise (one idea).** For a fair coin, the expected wait is
**`E[wait] = Σ 2^(overlap length)`** over every prefix that is also a suffix (including the full
length)—and a **fair-betting (martingale) argument** shows *why* it's exact: money in `=` flips `= T`,
money out `= Σ 2^L` (only the gamblers aligned to a self-overlap survive), so `E[T] = Σ 2^L`.

**Why it matters for quant.** "Expected flips until `THTH`?" takes minutes by recurrence and seconds
by the slide trick. More deeply, **martingales + optional stopping + no-arbitrage** are the dividing
line between "can grind a recurrence" and "thinks like a quant"—the same instinct behind derivatives
pricing. This is the canonical `ABRACADABRA` problem (Li 1980; Gardner), explicitly deferred from the
MVP, taught by *doing*.

### The math (worked, cross-checked against the engine's golden values)

- **Autocorrelation / borders.** The overlaps of a word are the lengths `L` where the length-`L`
  prefix equals the length-`L` suffix (always including the full `L=ℓ`). These are exactly the KMP
  borders the engine's `prefixFunction` already finds, and the flagship's `overlapHighlights`.
- **Fair-coin closed form.** `E[A] = Σ_{borders L} 2^L = 2 · (Conway leading number)`. Verified:

  | Pattern | borders | `Σ 2^L` | engine `E[E0]` |
  |---|---|---|---|
  | `HT` | {2} | 4 | 4 ✓ |
  | `HH` | {2,1} | 4+2 = **6** | 6 ✓ |
  | `THH` | {3} | 8 | 8 ✓ |
  | `HTH` | {3,1} | 8+2 = **10** | 10 ✓ |
  | `HHH` | {3,2,1} | 8+4+2 = **14** | 14 ✓ |
  | `HTHT` | {4,2} | 16+4 = **20** | — |

  The *only* reason `HH` (6) beats `HT` (4) is the extra `2¹` term—the length-1 self-overlap that the
  flagship renders as `HH`'s near-miss reset. **Overlap → an extra `2^L` term → a longer wait.**
- **Martingale proof.** A fresh \$1 gambler enters before each flip and bets the pattern, parlaying
  on each correct flip (a fair 2:1 payout) and busting on a wrong one. At stop time `T`: total
  wagered `= T` (one gambler per flip); total held `= Σ_{overlaps L} 2^L` (a gambler `L` letters in
  holds `2^L` and is still alive iff its run is a border). Fairness (optional stopping) ⇒
  `E[T] = Σ 2^L`. Ledger: `HH → $4+$2 = 6`; `HT → $4 = 4`; `HHH → $8+$4+$2 = 14`.
- **Generalization.** Over a `q`-letter alphabet, `E = Σ q^L`. Die "two sixes": `6²+6¹ = 42`.
  `ABRACADABRA` (q=26): `26¹¹+26⁴+26¹`.
- **Correctness contract.** `expectedWaitFair(pattern) === buildAutomaton(pattern, 0.5).expectedTimes.E0`
  for every curated pattern—the two engines must agree (a strong golden test). *Note:* we use the
  rigorous `2·CLN` values (14, 10); one stray preprint prints `16`/`14` and is wrong.

### Beat-by-beat (11 beats)

| # | beatId | interaction | phase | Teaches (one thing) | Wrong-path |
|---|--------|-------------|-------|---------------------|-----------|
| 1 | `recall-grid` | `prediction` (match) | Bet | Spaced retrieval of `6,4,8,10`; tease "one rule for all." | Misremember a value → instant correction. |
| 2 | `self-overlap` | **autocorrelationRuler** (self) | Explore | Overlaps = shifts where prefix=suffix. | Find only the trivial full overlap; miss `HH`'s shift-1. |
| 3 | `overlap-to-power` | `stateTap`-like | Model | Each overlap `L` contributes `2^L`. | Assign `2^L` to a non-matching shift. |
| 4 | `sum-it` | **sumTiles** (new) | Model | `E = Σ 2^L`; `HH → 4+2 = 6`. | Omit the `k=1` term → get 4 (known-wrong for HH). |
| 5 | `casino-intuition` | **gamblerLedger** (new) | Explore | *Why*: money in `= T`, money out `= Σ2^L`. | Step gamblers; see most bust, a few survive. |
| 6 | `who-survives` | `stateTap` (on the ledger) | Model | Survivors ≡ the overlaps. | Tap a busted gambler. |
| 7 | `apply-THH` | ruler + sumTiles | Model | Transfer: `THH → {3} → 8`. | Invent spurious `TH`/`HH` overlaps. |
| 8 | `apply-HTH` | ruler + sumTiles | Model | Transfer: `HTH → {3,1} → 10`. | Miss the `H_H` shift-1 → get 8 (known-wrong). |
| 9 | `cross-check` | `theorySimChart` | Prove | Simulation → the shortcut's value; three methods agree. | "New trick, probably approximate." |
| 10 | `surprise-pattern` | `prediction` + ruler | Prove | `HHH → {3,2,1} → 14`, vs same-length `THH = 8`. | Predict ~8 by length; it's 14. |
| 11 | `recap` | `recap` | Prove | `Σ2^L` over self-overlaps; the casino reason; matches states + sim. | (course-capstone milestone) |

**Faded scaffolding / transfer signal.** Most retrieval-heavy lesson (testing effect): it re-solves
known problems a new way. Cap hints on `apply-THH` + `apply-HTH`; `transferAttained = true` iff both
clear without reveal. An optional Extension generalizes the base (payout `=1/P`, `Σ q^L`, the
`ABRACADABRA` cameo) and bridges to a future Weighted-Coins/Dice lesson.

### Interactable widgets

**Signature visual moment — the triangulation.** The payoff is three methods agreeing on one number:
on a single value axis (**TriangulationStrip**) the **recurrence** solve drops a marker, the
**martingale chips** sum to a marker, and the **simulation mean** converges a line — all snapping onto
the same value. Around it, the **GamblerLedger** flows like a city skyline (parlay-stacks rise, busts
collapse, the few overlap-aligned survivors glow gold) and the **fairness meter** shows money-in and
money-out lines converging. Overlap stops being a metaphor and becomes a picture.

- **AutocorrelationRuler (self mode)** *(new, small — the shared hero, also used in L4).* A fixed top
  pattern and a draggable/`Shift →` bottom copy. *Manipulate:* shift the copy one cell at a time;
  optionally tap the predicted match-bit (1/0). *Responds:* overlapping cells flash ✓/✗ (never color
  alone); a bit drops into the autocorrelation register; each `1` animates a `2^L` chip into a running
  **expected-wait total**. *Feedback loop:* a wrong bit-tap triggers the 3-step ladder
  ("compare these two cells" → highlight the mismatch → reveal the bit). Konva travel + DOM 44px taps
  + `aria-live` register; reduced-motion snaps shifts. Drives the pure `correlation()`.
- **SumTiles / TermLedger** *(new, small — broadly reusable).* Generalizes `equationTiles` from one
  equation to a **series**: tap a `2^L` chip per overlap into a running ledger; the partial sum updates
  and snaps onto the theory value when complete (`6 = 4+2`). *Feedback loop:* a wrong/duplicate term is
  rejected with a targeted hint; the final sum is checked against `expectedTimes.E0`. Reuses tile
  components + `--correct` flash. (Also powers the Gambler's-Ruin/coupon series sums.)
- **GamblerLedger ("the gambler army")** *(new, medium — the martingale visual).* A shared `CoinStream`
  across the top; a grid where row `t` is the gambler who entered before flip `t`. *Manipulate:* `Flip`
  to drive the stream; **tap the survivors** at the stop; **place `2^L` chips** into the total.
  *Responds:* stacks double on a win, busts grey out, survivors glow `--mark`, the payout total tallies
  and is compared to the flip count (the **fairness meter**, a thin `SimChart` variant where mean(in)
  and mean(out) converge to the same value). *Feedback loop:* mis-tapping a busted gambler →
  ladder ("did this run stay a prefix of the pattern?" → highlight its first wrong flip → reveal).
  Konva chips + DOM tap layer + `aria-live`; reduced-motion shows instant stacks. Pure `gamblerLedger`.
- **Reused:** `prediction`/match, `stateTap` (survivor grading), `theorySimChart`, `recap`, plus the
  flagship `overlap` mini-graphs to bridge "alive gambler ≡ overlap ≡ near-miss edge."

**Feasibility.** *New engine (pure, low cost):* `correlation(v,w)` / `autocorrelation(pattern,q)` →
`{bits, overlaps, sum}` (≈30 lines off the existing `prefixFunction`) and `gamblerLedger(pattern,
stream)` (deterministic given stream + pattern). Golden tests: the agreement contract above, and
`gamblerLedger` payout `=== expectedWaitFair`. *Pedagogy risk* (optional stopping is the most abstract
idea in the slate) is mitigated by re-deriving numbers the learner already proved and never invoking
measure theory—the "fair game ⇒ in = out" instinct carries it.

**Misconceptions targeted.** "`E = 1/P(pattern)` so `E[HH]=4`"; "only the full overlap counts" (the
`k=1` omission, surfaced again from the flagship); "longer pattern ⇒ longer wait" (`HHH=14` vs
`THH=8`); "a clever stopping rule beats a fair game."

---

<a name="widget-catalog"></a>
## 6. New interactable-widget catalog

A dozen new widgets — five substantial carriers (RaceTrack, WalkBoard, AutocorrelationRuler,
GamblerLedger, DominanceWheel) plus lighter visual heroes — power the slate; all run on the same
pure-engine pattern (*build a chain → solve a rational linear system → Monte-Carlo a stream*), so the
engineering is incremental. Ranked by reuse value:

| Widget | Lessons | Size | Manipulate → respond → feedback | Build sketch |
|---|---|---|---|---|
| **RaceTrack / PatternDuel** | L4 | large | run shared-stream races → two converging win-rate bars + tally → ladder on wrong-winner | Konva dual lane + `CoinStream`; `buildRaceAutomaton` solved by existing solver; `simulateRace` |
| **WalkBoard / RuinBoard** | L5 | large | drag start/walls/bias → outcome bar + duration + ruin-heat ribbon → "aha" is in the drag | Konva lattice, commit-on-drag-end; `buildWalk` + two solver passes; DOM slider mirror |
| **AutocorrelationRuler** | L4 (cross) + L6 (self) | small | shift a pattern under (itself/another) + tap match bits → leading number + `2^L` total → ladder per bit | DOM mono rows + offset; pure `correlation()` from `prefixFunction` |
| **GamblerLedger + fairness meter** | L6 | medium | flip + tap survivors + place chips → doubling stacks, payout tally vs flip count → ladder | Konva chips + DOM grid; pure `gamblerLedger`; `SimChart` variant |
| **DominanceWheel** | L4 | large | tap a pattern → beats/loses arrows; trace the cycle → mini-quiz graded vs matrix | Konva radial graph reusing `StateGraph` primitives; `winMatrix` |
| **SumTiles / TermLedger** | L6 (+L5) | small | tap `2^L`/series chips → running sum snaps to closed form → reject wrong term | reuse equation-tile components + `--correct` flash |
| **DistributionHistogram** | L5 (+future) | medium | "Run 1,000" → live binned histogram + mean/±σ markers | Konva bars reusing `SimChart` axes/theme; binning is pure UI |
| **OddsDial** | L4 | small | races stream in → a needle swings and settles on the live odds (7:1) | Konva gauge fed one `Rational`; reduced-motion = static split |
| **TournamentHeatmap** | L4 | medium | scan an 8×8 who-beats-whom grid → the non-transitive cycle lights as a loop | Konva grid colored by `winMatrix`; pure |
| **WalkerSwarm** | L5 | medium | release ~100 tokens that walk at once → each flashes at its wall; outcome bar fills | Konva particle layer over seeded `simulateWalk`; imperative anim |
| **RuinLandscape** | L5 | small | drag `p` → the `P_i=i/N` line warps into a steep curve across all starts | Konva line reusing `BiasChart` conventions; closed-form |
| **TriangulationStrip** | L6 | small | recurrence + martingale + simulation markers converge on one value with a snap | reuses `SimChart` value axis; three markers |

Reused verbatim or retargeted across all three: `prediction`, `patternPick`, `coinSim`/`StateGraph`/
`CoinStream`, `stateTap`, `equationTiles` (+ `equationDiagnosis`), `slider`, `substitution`,
`theorySimChart`/`SimChart`, `overlap`, `BiasChart`, `recap`, `hintLadder`, `useReducedMotion`,
`useElementWidth`, `mulberry32`.

> **Authoring caveat (flagged by the curriculum agent).** `equationDiagnosis.ts` per-slot hint copy is
> hardwired to the `HH` `{E0,E2}` target. The L4 win-probability tiles and L5 biased/duration tiles
> need either a generalized diagnosis table or a fallback to the coarser row-level `equationChecker.ts`.
> Budget this; don't let HH-specific copy leak into new lessons.

### Visual & motion design (pretty *and* honest)

- **One hero per beat, inside the notebook identity.** Cinematic but never game-y: ink + paper,
  `--quill` (active/empirical), `--heads`/`--tails` for coins, hairline `--rule-faint` grids, KaTeX
  numerals, the milestone-stamp / streak-tally vocabulary. The "wow" comes from motion that *maps to
  the math* (a race resolving, a landscape warping, three methods snapping together) — the same
  principle as the existing flip → node-pulse → edge-travel moment.
- **Everything animated is engine-driven.** The new visuals are Konva canvas heroes fed by the
  *existing* pure sims (`simulateRace`, `simulateWalk`, `flipsToAbsorption`) with a seeded
  `mulberry32`, animated **imperatively on a Konva layer** — no per-frame React state, no writes
  during animation (the rule `SimChart`/`StateGraph` already follow) — so they hold ~60fps on mobile.
- **Reduced-motion + tap-only never lose the lesson.** Each hero has a reduced-motion path that skips
  travel/particles and renders the final curve, bars, or markers instantly, plus a DOM/`aria-live`
  mirror (odds readout, tally text, bin table) so the beat stays completable and legible without motion.

---

<a name="engine-additions"></a>
## 7. Engine & schema additions

All pure, dependency-free, exact-rational, golden-testable—matching `src/engine/automaton.ts` style.

```ts
// src/engine/race.ts        (L4)
buildRaceAutomaton(a: string, b: string, p: number): RaceAutomaton  // merged-KMP product, 2 absorbers
conwayLeadingNumbers(a: string, b: string, q: number): { AA; AB; BB; BA }
penneyOdds(a: string, b: string): { aBeatsB: Rational; bBeatsA: Rational }   // (AA−AB):(BB−BA)
bestBeater(a: string): string                                                 // (¬a₂)a₁…a_{ℓ-1}
simulateRace(a, b, p, rng): 'A' | 'B'          // one shared stream, two KMP tracks
winMatrix(patterns: string[], p: number): Rational[][]                        // DominanceWheel

// src/engine/walk.ts        (L5)
buildWalk(N: number, p: number): Automaton     // birth–death band, absorbing 0 and N
simulateWalk(i, N, p, rng): { end: 0 | 'N'; steps: number }
// solve twice with the existing solveLinearSystem: P (boundary 1/0, no +1) and D (+1, boundary 0)

// src/engine/correlation.ts (L6)
correlation(v: string, w: string): { bits: number[]; cln: number; overlaps: number[] }
expectedWaitFair(pattern: string): number      // Σ 2^L  (=== expectedTimes.E0; the golden contract)
gamblerLedger(pattern: string, stream: string): { rows: {enter; stack; alive}[]; payout: number }
```

**Schema (`src/content/schema.ts`).** Add to the `Interaction` discriminated union, same style as
today: `raceSim`, `walkBoard`, `autocorrelationRuler`, `gamblerLedger`, `sumTiles`, `dominanceWheel`
(+ `distributionHistogram` as a `theorySimChart` variant). Each new beat view composes `BeatShell`
(region → `FeedbackStrip` → sticky action bar) and a Konva-or-DOM hero exactly like the existing 10.

**`StateGraph` layout.** L4's combined chain is a small DAG and L5's walk is a number line; both want a
light layout option beyond strict left-to-right. Either accept a tidy linear order of merged states or
add a positions-per-node prop (small).

---

<a name="course-path"></a>
## 8. Course-path integration

| Order | lessonId | title | milestoneId | unlocks |
|---|---|---|---|---|
| L1 | `lesson-states-streaks` | States & Streaks | `first-pattern-cracked` | `lesson-pattern-hitting-times` |
| L2 | `lesson-pattern-hitting-times` | Pattern Hitting Times | `hh-ht-mastered` | `lesson-longer-patterns` |
| L3 | `lesson-longer-patterns` | Longer Patterns & Overlap | `state-machine-builder` | **`lesson-penneys-game`** |
| **L4** | **`lesson-penneys-game`** | Penney's Game: Who Gets There First? | `penneys-game-won` | `lesson-gamblers-ruin` |
| **L5** | **`lesson-gamblers-ruin`** | Gambler's Ruin: How a Fair Game Breaks You | `gamblers-ruin-solved` | `lesson-overlap-shortcut` |
| **L6** | **`lesson-overlap-shortcut`** | The Overlap Shortcut: Read the Wait Off the Pattern | `martingale-mastered` | `null` |

- `courseId`: `course-pattern-hitting-times` (unchanged).
- **Course-completion milestone:** add `full-course-mastered` on finishing all six; keep
  `three-lessons-complete` as the mid-course mark.
- **patternOptions:** L4 the eight length-3 words `["HHH","HHT","HTH","HTT","THH","THT","TTH","TTT"]`
  (race/counter set) with the `HH`/`HT` opener; L5 is parameter-driven (`N`, `p`) rather than pattern-
  driven—store walk params in the interaction (or extend the schema); L6 `["HH","HT","THH","HTH","HHH"]`
  (retrieval/transfer set) + die "66" in the Extension.
- **Roadmap after the slate:** promote **Weighted Coins & Dice** and **Coupon Collector** to the
  visible-but-locked roadmap nodes (the prior `lesson-weighted-coins` stub stays).

---

<a name="alternates"></a>
## 9. Alternates considered & deferred

Strong ideas that didn't make the top 3, with the reason:

- **Weighted Coins & Dice** *(A5#3, A1 bridge).* Generalizes `½ → p, 1−p` (tiles already exist),
  finds the golden-ratio crossing where `E[HH]=E[HT]`, reuses the already-built `BiasChart`. **Deferred**
  because it adds the **fewest new widgets** (your priority is widgets) and its bias-sensitivity story is
  partly covered by L5's house-edge sandbox and the flagship's existing bias sandbox. **Best alternate**
  if you'd prefer a gentler consolidation lesson as L5 instead of Gambler's Ruin.
- **The Fundamental Matrix** *(A2#2).* The theory capstone—every recurrence is a row of `(I−Q)t=1`,
  with `N=(I−Q)⁻¹` giving expected time (row sums) and exit odds (`N·R`). Its **Fundamental-Matrix
  "x-ray" card** (tap a cell for expected visits, sweep a row to sum into the hitting time) is a gorgeous
  widget. **Deferred** as more abstract/linear-algebra-forward than the persona needs right now; a great
  **Phase-3 "theory" capstone** once the three concrete lessons land.
- **Stationary Distributions & Mean Recurrence** *(A2#3).* Pivots to ergodic chains: return time
  `= 1/π_i` (Kac), recasting even the warm-up's `E[H]=2`. **Deferred**—it's a different sub-field
  (long-run behavior) and breaks the "absorbing/first-passage" through-line of this slate.
- **Coupon Collector** *(A1#4, A4#4).* `E = n·H_n ≈ 14.7` via a sum of geometrics; lovely
  CollectionGrid + PhaseLadder widgets. **Deferred** to the roadmap—it leans hardest on the self-loop
  mechanics the flagship already taught and wants a larger alphabet, so it pairs naturally with Weighted
  Coins & Dice.
- **Litt's Game / clumping** *(A3#4).* `HT` beats `HH` on *frequency* over 100 flips even with equal
  expected counts (overlap → clumping → variance). **Deferred** as a future "Variance & Tails" capstone;
  it's off the expected-wait spine and its proof is variance-level.

---

<a name="sources"></a>
## 10. Math sources

Compiled from the agents' research (full citations in `audits/ideation/`):

- **Penney's game / Conway numbers / non-transitivity.** Penney, "Problem 95: Penney-Ante," *J.
  Recreational Math.* (1969); Gardner, "Mathematical Games," *Scientific American* (1974); Nishiyama,
  "Pattern matching probabilities and paradoxes," *IJPAM* 59(3) (2010); *The Penney's Game with Group
  Action*, arXiv:2009.06080 (Conway leading number, `E=2·CLN`, second-player theorem, game length);
  "Penney's game odds from no-arbitrage," *Theory and Decision* (Springer, 2026).
- **Autocorrelation / correlation polynomial / closed form.** Guibas & Odlyzko, "String overlaps,
  pattern matching, and nontransitive games," *J. Combin. Theory A* 30 (1981); Flajolet & Sedgewick,
  *Analytic Combinatorics* §I.4.2; Wikipedia, "Autocorrelation (words)."
- **Martingale / optional stopping (ABRACADABRA).** Li, "A martingale approach to the study of
  occurrence of sequences of patterns," *Ann. Probability* 8 (1980); Williams, *Probability with
  Martingales*; Doob's Optional Stopping Theorem.
- **Gambler's ruin / random walks / Markov chains.** Grinstead & Snell, *Introduction to Probability*,
  Ch. 11–12 (absorbing chains, fundamental matrix, gambler's ruin); Norris, *Markov Chains*; Ross,
  *Introduction to Probability Models*, Ch. 4; Pólya's recurrence theorem; Kac's lemma.
- **Quant-interview canon.** Zhou, *A Practical Guide to Quantitative Finance Interviews* (the Green
  Book), Ch. 4–5; Crack, *Heard on the Street*; Mosteller, *Fifty Challenging Problems in Probability*;
  Joshi, *Quant Job Interview Questions and Answers*.

All worked values were cross-checked against this repo's engine golden values
(`E[HH]=6, E[HT]=4, E[THH]=8, E[HTH]=10, E[HHH]=14`); where a source disagreed (one preprint printing
`HHH=16`), the rigorous `2·CLN` value is used.

---

### Appendix — agent ideation files

- `audits/ideation/agent-1-quant-canon.md` — quant-interview canon (Penney's, Gambler's Ruin, Martingale Casino, Coupon Collector)
- `audits/ideation/agent-2-markov-theory.md` — Markov theory (Gambler's Ruin, Fundamental Matrix, Stationary/Recurrence, Penney's)
- `audits/ideation/agent-3-pattern-theory.md` — combinatorics on words (Conway shortcut, Gambler Army/martingale, Penney's, Litt's game)
- `audits/ideation/agent-4-widgets.md` — interaction design (Penney's, Longer Patterns reshaped, Gambler's Ruin, Coupon; + 14 reusable widget primitives)
- `audits/ideation/agent-5-curriculum.md` — curriculum/pedagogy (Penney's, Weighted Coins, Martingale; sequencing, scaffolding, cut lines)
