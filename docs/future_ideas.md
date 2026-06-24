# Future Ideas & Remaining Lesson Plans

A running list of **deferred product features** and **authoring-ready specs** for the six-lesson
Pattern Hitting Times course. Detailed beat-by-beat plans (produced by five Composer 2.5 Fast
research agents, 2026-06-23) live in `audits/ideation/plan-L{2..6}-*.md`.

**Design priority:** every lesson is built around **interactable widgets** — not text walls.
Each lesson includes at least one **living graph + simulation** moment where the learner
*watches* theory emerge (converging win-rate bars, a walker swarm, three methods snapping to
one number). All widgets are engine-driven (pure math, instant feedback, no AI), tap-only +
reduced-motion completable, and styled in the Clean Mathematical Notebook identity.

---

## Course path (L1–L6)

| # | lessonId | Title | Status | Milestone | Unlocks |
|---|----------|-------|--------|-----------|---------|
| **L1** | `lesson-pattern-hitting-times` | Pattern Hitting Times | **Built** (flagship) | `hh-ht-mastered` | L2 |
| **L2** | `lesson-penneys-game` | Penney's Game: Who Gets There First? | **Built** | `penneys-game-won` | L3 |
| **L3** | `lesson-gamblers-ruin` | Gambler's Ruin: How a Fair Game Breaks You | **Built** | `gamblers-ruin-solved` | L4 |
| **L4** | `lesson-states-streaks` | Mixed Review & Streaks | **Built** | `first-pattern-cracked` | L5 |
| **L5** | `lesson-longer-patterns` | Longer Patterns & Overlap (THH vs HTH) | **Built** | `state-machine-builder` | L6 |
| **L6** | `lesson-overlap-shortcut` | The Overlap Shortcut: Read the Wait Off the Pattern | **Built** | `martingale-mastered` | — |

> **Canonical order (reconciled 2026-06-24):** this is the PRD / `CONTEXT.md` /
> `docs/proposed-lessons.md` §11 order, which the code (course fixture + milestones +
> unlock chain) follows: the **Overlap Shortcut is LAST** (concreteness fading puts the
> most idealized lesson at the end). An optional **L0 `lesson-first-heads`** on-ramp
> precedes L1 (ungated, `unlocks: null`). ⚠ **plan-L\* filename offset:**
> `audits/ideation/plan-L4-overlap-shortcut.md` is this course's **L6**, and
> `audits/ideation/plan-L6-longer-patterns.md` is this course's **L5**
> (`plan-L5-states-streaks.md` is L4). The math in those files is canonical; only the
> L-numbers in the filenames are off.

**Unlock order:** (L0 optional) → L1 → L2 → L3 → L4 → L5 → L6. Mid-course milestone
`three-lessons-complete` after L3; course completion `six-lessons-complete` after L6.

**Arc (one new variable per lesson after L1):**

```
L0  The First Heads (opt)   — the machine at minimum size (E[H]=2; on-ramp)
L1  Pattern Hitting Times   — learn the machine (states, overlap, recurrence, sim)
L2  Penney's Game           — vary the QUESTION  (how long → who's first)
L3  Gambler's Ruin          — vary the ARENA     (coin patterns → random walk)
L4  Mixed Review & Streaks  — consolidate        (interleaved checkpoint)
L5  Longer Patterns         — transfer           (novel THH vs HTH, faded hints)
L6  Overlap Shortcut        — vary the METHOD    (closed form Σ2^L + martingale, last)
```

---

## L1 — Pattern Hitting Times (reference)

**Built.** Why `E[HH]=6` but `E[HT]=4` via KMP state machine, near-miss edges, equation tiles,
substitution, slider prediction, theory-vs-sim convergence, overlap reveal, optional bias sandbox.

**Headline numbers:** `E[HH]=6`, `E[HT]=4`. **Insight:** overlap is memory.

**Existing widgets (reused by L2–L6):** `prediction`, `patternPick`, `coinSim` + Konva
`StateGraph` + DOM `CoinStream`, `stateTap`, `equationTiles`, `slider`, `substitution`,
`theorySimChart` / `SimChart`, `overlap`, `BiasChart`, `recap`.

Fixture: `fixtures/lesson-pattern-hitting-times.json` (11 beats).

---

## L2 — Penney's Game

**Hook:** *"You proved HH is slower than HT (6 vs 4). So HT wins the race, right?"* (It's a
**tie** — ½ each.) *"Now pick any 3-flip pattern. I'll pick second and beat you 7 to 1."*

**Core promise:** Model two patterns racing on **one shared stream** as a chain with **two**
absorbing outcomes. "Who appears first" is decoupled from expected wait; the beats relation is
**non-transitive**; the second mover always has a winning counter.

**Quant grounding:** Penney-Ante (1969), Gardner (1974), Conway leading numbers (Nishiyama 2010),
Guibas–Odlyzko correlation polynomial (1981), Green Book / Heard on the Street / Joshi Markov drills.

**Key math (engine-verified):**

| Result | Value |
|--------|-------|
| `HH` vs `HT` race (despite E=6 vs 4) | **½ each** — one flip after first `H` decides |
| `HHH` vs `THH` | **`P(THH first) = 7/8`** — Conway odds 7:1 |
| Second-player rule (length 3) | `B = (¬a₂) a₁ a₂` beats any `A` |
| Paradox: `HHH`(E=14) vs `HHT`(E=8) | **1:1 race** despite different waits |

**12 beats (Bet → Explore → Model → Prove):**

| # | beatId | Widget / interaction | What the learner does |
|---|--------|----------------------|------------------------|
| 1 | `open-bet` | `prediction` | Bet HH vs HT race winner (trap: HT because 4<6) |
| 2 | `race-the-tie` | **`raceSim` / RaceTrack** | Run 200 shared-stream races; bars stay ~50/50 |
| 3 | `first-step-split` | `stateTap` on mini race graph | Tap: after one H, H→HH wins, T→HT wins |
| 4 | `new-contender` | `prediction` | Can second mover always counter `HHH`? |
| 5 | `pick-your-counter` | **`patternPick` (graded)** + OddsDial preview | Pick `THH` to beat `HHH`; engine grades odds |
| 6 | `race-the-counter` | **RaceTrack + OddsDial** | Watch **7:1 emerge** from 500 races |
| 7 | `win-prob-tiles` | `equationTiles` | Build **P-recurrence** (no `1+`, boundary 1/0) |
| 8 | `solve-the-odds` | `substitution` (choose-the-step) | Solve to `P(HHH first)=1/8` |
| 9 | `conway-aligner` | **AutocorrelationRuler** (cross) | Slide patterns; build `(AA−AB):(BB−BA)` |
| 10 | `paradox-duel` | `raceSim` + **TournamentHeatmap** | `HHH` vs `HHT` ties; longer wait can still win |
| 11 | `non-transitive-loop` | **DominanceWheel** | Trace the beats cycle; no best pattern |
| 12 | `recap` | `recap` | Retrieval: race ≠ wait; Conway; second-mover rule |

**Signature visuals:**

1. **The tie that defies wait times** — hundreds of races, bars neck-and-neck while copy says 6≠4.
2. **7:1 emergence** — OddsDial needle sweeps; THH column stacks 7 chips per 1 HHH.
3. **Conway aligner** — sliding `HHH` over `THH`, overlap bits become arithmetic.
4. **Non-transitive loop** — DominanceWheel + 8×8 TournamentHeatmap fill in.

**New engine:** `buildRaceAutomaton`, `conwayLeadingNumbers`, `penneyOdds`, `simulateRace`,
`winMatrix` (`src/engine/race.ts`).

**New widgets:** RaceTrack/PatternDuel, OddsDial, AutocorrelationRuler (cross), DominanceWheel,
TournamentHeatmap.

**Transfer signal:** `transferAttained` if winning counter for `HHH` + P-recurrence built without
hint cap (`maxHintLevel: 2` on setup beats).

**Full spec:** `audits/ideation/plan-L2-penneys-game.md`

---

## L3 — Gambler's Ruin

**Hook:** *"$2 in your pocket, $1 a hand, until $4 or $0. Fair coin — chance you go broke first?
How long at the table?"*

**Core promise:** First-step analysis is **arena-independent**. On a walk between walls `0` and
`N`, the same machine answers **probability** (`P_i = i/N`, no `1+`) and **duration**
(`D_i = i(N−i)`, with `1+`). A tiny house edge is catastrophic.

**Quant grounding:** Grinstead & Snell Ch. 12.2, Green Book Ch. 5.1, Joshi first-step analysis,
Mosteller puzzle framing, martingale-doubling trap (finite bankroll ⇒ ruin).

**Key math (`N=4`, fair, start `i=2`):**

| Quantity | Fair | Biased (`p=0.4`, `i=2`) |
|----------|------|---------------------------|
| P(reach $4) | **½** | **≈0.31** |
| P(ruin) | **½** | **≈0.69** |
| E[duration] | **4** = 2×(4−2) | ≈3.85 |

**11–12 beats:**

| # | beatId | Widget / interaction | What the learner does |
|---|--------|----------------------|------------------------|
| 1 | `open-bet` | `prediction` | P(broke first)? (trap: "fair ⇒ safe") |
| 2 | `walk-once` | **WalkBoard** (single) | One token random-walks to a wall |
| 3 | `ruin-board` | **WalkBoard (live solve)** | Drag start, walls, `p`; bars + duration update live |
| 4 | `boundary-edge` | `stateTap` | Tap ±1 neighbors; identify absorbing walls |
| 5 | `ruin-tiles` | `equationTiles` | Build **P-recurrence** (no `1+`, boundary 1/0) |
| 6 | `duration-tiles` | `equationTiles` | Build **D-recurrence** (`1+` returns) |
| 7 | `predict-duration` | `slider` | Lock guess for `D_2` |
| 8 | `guided-solve` | `substitution` | Solve to P=½, D=4 |
| 9 | `prove-sim` | `theorySimChart` (walk) | Empirical ruin-rate → `i/N`; mean steps → `i(N−i)` |
| 10 | `house-edge` | **WalkBoard + WalkerSwarm + RuinLandscape** | ~100 tokens at once; drag `p`, landscape **warps** |
| 11 | `recap` | `recap` | `P=i/N`, `D=i(N−i)`; fair still ruins you vs infinite bankroll |

**Signature visuals:**

1. **Walker swarm** — ~100 tokens walk simultaneously; outcome bar fills; each absorption flashes.
2. **Living ruin landscape** — `P_i = i/N` line warps into a cliff as `p` drops below ½.
3. **DistributionHistogram** — duration bins fill into a fat tail (mean ≠ typical path).

**New engine:** `buildWalk(N,p)`, `simulateWalk`, `batchWalkStats` (`src/engine/walk.ts`).

**New widgets:** WalkBoard/RuinBoard, WalkerSwarm, RuinLandscape, DistributionHistogram.

**Full spec:** `audits/ideation/plan-L3-gamblers-ruin.md`

---

## L4 — The Overlap Shortcut (Conway + Martingale)

**Hook:** *"You solved four linear systems for 6, 4, 8, 10. A quant hands you `THTH` and 30
seconds. There's a one-line rule — let's earn it, and prove it with a casino that can't profit."*

**Core promise:** For a fair coin, **`E[wait] = Σ 2^L`** over every self-overlap length `L`
(including full pattern). A **fair-betting martingale** proves why: money in = `T` flips, money
out = Σ 2^L (surviving gamblers = overlaps).

**Quant grounding:** Guibas–Odlyzko (1981), Conway leading number, Li (1980) martingale /
optional stopping, ABRACADABRA, Green Book "expected flips until pattern X" under time pressure.

**Key math (cross-checked vs `buildAutomaton`):**

| Pattern | Borders | Σ 2^L | Engine E0 |
|---------|---------|-------|-----------|
| `HT` | {2} | 4 | 4 ✓ |
| `HH` | {2,1} | 4+2 = **6** | 6 ✓ |
| `THH` | {3} | 8 | 8 ✓ |
| `HTH` | {3,1} | 8+2 = **10** | 10 ✓ |
| `HHH` | {3,2,1} | 8+4+2 = **14** | 14 ✓ |
| `HTHT` | {4,2} | 20 | — |
| Die "66" | {2,1} | 6²+6 = **42** | Extension |

**12 beats (retrieval-heavy capstone):**

| # | beatId | Widget / interaction | What the learner does |
|---|--------|----------------------|------------------------|
| 1 | `recall-grid` | `prediction` (match) | Match 6,4,8,10 to patterns before the rule |
| 2 | `self-overlap` | **AutocorrelationRuler** (self) | Slide `HH` over itself; discover borders |
| 3 | `overlap-to-power` | tap chips | Each border → `2^L` term |
| 4 | `sum-it` | **SumTiles / TermLedger** | Assemble `4+2=6`; omit k=1 trap |
| 5 | `casino-intuition` | **GamblerLedger** + fairness meter | Flip; watch parlay stacks rise/bust |
| 6 | `who-survives` | `stateTap` on ledger | Tap surviving gamblers at stop (= overlaps) |
| 7 | `apply-THH` | ruler + SumTiles | Transfer: `{3}` → 8 |
| 8 | `apply-HTH` | ruler + SumTiles | Transfer: `{3,1}` → 10 (k=1 trap) |
| 9 | `cross-check` | `theorySimChart` | Sim mean → shortcut value |
| 10 | `surprise-pattern` | `prediction` + ruler | **`HHH` → 14**, not ~8 by length |
| 11 | `triangulation` | **TriangulationStrip** | Recurrence + martingale + sim **snap to one value** |
| 12 | `recap` | `recap` | Course capstone; three methods, one number |

**Signature visuals:**

1. **AutocorrelationRuler** — shift pattern over itself; `2^L` chips animate into running total.
2. **Gambler army skyline** — stacks double, busts collapse, survivors glow gold at stop.
3. **Triangulation** — three markers on one axis snap together; fairness meter converges.

**New engine:** `correlation()`, `expectedWaitFair()`, `gamblerLedger()` (`src/engine/correlation.ts`).

**Golden contract:** `expectedWaitFair(p) === buildAutomaton(p, 0.5).expectedTimes.E0` for all
curated patterns.

**Full spec:** `audits/ideation/plan-L4-overlap-shortcut.md`

---

## L5 — States & Streaks

**Positioning:** **Not a cold-open warm-up.** L5 comes after L1–L4; the learner already owns 6, 4,
7/8, `i(N−i)`, and `Σ 2^L`. L5 strips the problem to its skeleton — one target `H`, two states,
**E[H]=2** — and shows every tool collapses to the same answer.

**Hook:** *"You've raced patterns, walked to ruin, and read the wait off overlap. Now the whole
problem fits on two nodes."*

**Core promise:** Model first-`H` waiting as the simplest absorbing chain; derive **E[H]=2**;
recognize it as geometric waiting (`1/p`), overlap sum (`2¹`), and mean recurrence (`1/π_H=2`).

**Quant trap:** "P(H)=½ on one flip ⇒ wait 1 flip" — wrong; expectation is **2**.

**12 beats:**

| # | beatId | Widget / interaction | What the learner does |
|---|--------|----------------------|------------------------|
| 1 | `open-hook` | `prediction` | Bet flips until first H (trap: **1**) |
| 2 | `course-retrieval` | **retrievalGrid** (NEW) | Match 6, 4, 7/8, `i(N−i)`, `Σ2^L` to prior lessons |
| 3 | `simulate-first-h` | `coinSim` + **FirstSuccessTimeline** | Flip until H; timeline stacks wait lengths |
| 4 | `minimal-graph-hero` | **StateGraph heroTwoNode** | Enlarged 2-node graph (~60vh); trace flips |
| 5 | `reset-edge` | `stateTap` | T→self-loop on ∅; H→absorb (contrast vs HH reset) |
| 6 | `one-plus-check` | `prediction` | Pick duration vs probability recurrence shape |
| 7 | `equation-tiles` | `equationTiles` | Build `E0 = 1 + ½E1 + ½E0`, `E1 = 0` |
| 8 | `refine-prediction` | `slider` | Lock E[H] before solve |
| 9 | `guided-solve` | `substitution` | Tap through to **E0 = 2** |
| 10 | `theory-vs-sim` | `theorySimChart` | Empirical mean → **2** (signature convergence) |
| 11 | `three-ways-to-two` | **tripletReveal** (NEW) | Expand: first-step / Σ2^L / 1/p = Kac |
| 12 | `recap` | `recap` | Every method agrees on 2; tease L6 transfer |

**Signature visuals:**

1. **Hero 2-node graph** — the whole course machinery on two circles.
2. **FirstSuccessTimeline** — hollow T ticks, gold H tick freezes the run; batch mean → 2.
3. **Retrieval grid** — course numbers mapped to lessons before the easy solve.

**Engine:** `buildAutomaton("H", 0.5)` → `E0 = 2` (add golden test).

**New widgets:** retrievalGrid, FirstSuccessTimeline, StateGraph `heroTwoNode`, tripletReveal.

**Cut line:** 12 → 7 beats (keep simulate, one graded check, theory-vs-sim, recap).

**Full spec:** `audits/ideation/plan-L5-states-streaks.md`

---

## L6 — Longer Patterns & Overlap (transfer)

**Positioning:** **Final transfer lesson.** Novel length-3 pair **THH vs HTH** without hand-holding.
No HH/HT recap in the opener. Faded scaffolding on setup beats.

**Hook:** *"Both length 3. One waits 8 flips, the other 10. Same length — where do the extra 2
flips come from?"*

**Core promise:** Apply the full toolkit to an unseen pattern pair: build 4-state automaton,
identify overlap-breaking near-miss, assemble 4-row recurrences, solve, validate via border-sum
and simulation.

**Key math:**

| Pattern | Borders | Σ 2^L | Near-miss signature |
|---------|---------|-------|---------------------|
| `THH` | {3} only | **8** | `E2` on T → reset to `E1` (partial, not ∅) |
| `HTH` | {1, 3} | **2+8 = 10** | `E1` on H → **self-loop** (k=1 border, like HT) |

**12 beats:**

| # | beatId | Widget / interaction | What the learner does |
|---|--------|----------------------|------------------------|
| 1 | `open-bet` | `prediction` | THH vs HTH vs tie — **no HH/HT mention** |
| 2 | `pattern-pick` | `patternPick` (compare) | Lock THH vs HTH |
| 3 | `simulate` | `coinSim` (4-state) | Feel deeper graph; guided near-miss replay |
| 4 | `overlap-ruler` | **OverlapRuler / AutocorrelationRuler** | Discover borders before graded setup |
| 5 | `failure-edge` | `stateTap` | **Transfer setup #1** — tap near-miss targets |
| 6 | `equation-tiles` | `equationTiles` (4 rows) | **Transfer setup #2** — build full system |
| 7 | `refine-prediction` | `slider` | Lock numeric prediction |
| 8 | `guided-solve` | `substitution` | Tap through 4-state algebra |
| 9 | `theory-vs-sim` | `theorySimChart` | MC convergence for both patterns |
| 10 | `border-sum-ledger` | **TermLedger / SumTiles** | `2³=8` vs `2¹+2³=10` snap into place |
| 11 | `overlap-compare` | `overlap` + side-by-side 4-node graphs | Reset vs self-loop contrast |
| 12 | `recap` | `recap` | **Fully mastered** badge if transferAttained |

**Signature visual:** Side-by-side **4-node mini-graphs** + **TermLedger** below — near-miss edges
highlighted, border-sum tiles assemble 8 vs 10.

**Transfer signal:** `transferAttained = true` iff learner passes `failure-edge` AND
`equation-tiles` for **both** THH and HTH without hitting hint cap (`maxHintLevel: 2` on setup
beats). Learner-facing label: **"Fully mastered"** vs **"Completed"**.

**Full spec:** `audits/ideation/plan-L6-longer-patterns.md`

---

## Interactable widget catalog (course-wide)

Every lesson reuses the L1 widget stack and adds lesson-specific heroes. All animations are
**engine-driven** (Konva imperative layer, commit on drag-end, `mulberry32` seeded MC, no
per-frame React state). Reduced-motion paths render final curves/markers instantly with
`aria-live` DOM mirrors.

| Widget | Lessons | Visual / learning role |
|--------|---------|------------------------|
| **RaceTrack / PatternDuel** | L2 | Shared-stream dual lanes; win-rate bars converge to Conway odds |
| **OddsDial** | L2 | Gauge needle sweeps to 7:1 as races batch |
| **TournamentHeatmap** | L2 | 8×8 who-beats-whom grid; paradox cells light up |
| **DominanceWheel** | L2 | Non-transitive cycle traced on a ring |
| **AutocorrelationRuler** | L2 (cross), L4 (self), L6 | Slide pattern(s); overlap bits → `2^L` total |
| **WalkBoard / RuinBoard** | L3 | Drag start/walls/bias; outcome bar + duration live |
| **WalkerSwarm** | L3 | ~100 tokens walk at once; absorption flashes |
| **RuinLandscape** | L3 | `P_i=i/N` curve warps with bias slider |
| **DistributionHistogram** | L3 | Fat-tailed duration bins vs mean marker |
| **SumTiles / TermLedger** | L4, L6 | Tap `2^L` chips; running sum snaps to closed form |
| **GamblerLedger + fairness meter** | L4 | Parlay skyline; money-in/out lines converge |
| **TriangulationStrip** | L4 | Three methods snap to one value on one axis |
| **retrievalGrid** | L5 | Match course numbers to prior lessons |
| **FirstSuccessTimeline** | L5 | Per-run wait-length ticks below coin stream |
| **StateGraph heroTwoNode** | L5 | Full-viewport 2-node graph hero |
| **tripletReveal** | L5 | Three lenses (first-step / Σ2^L / Kac) → 2 |
| **OverlapRuler** | L6 | Self-overlap discovery before transfer grading |

**Reused everywhere:** `prediction`, `coinSim`, `StateGraph`, `CoinStream`, `stateTap`,
`equationTiles`, `slider`, `substitution`, `theorySimChart`, `overlap`, `BiasChart`, `recap`.

---

## New engine modules (summary)

| Module | Functions | Lessons |
|--------|-----------|---------|
| `src/engine/race.ts` | `buildRaceAutomaton`, `penneyOdds`, `simulateRace`, `winMatrix` | L2 |
| `src/engine/walk.ts` | `buildWalk`, `simulateWalk`, `batchWalkStats` | L3 |
| `src/engine/correlation.ts` | `correlation`, `expectedWaitFair`, `gamblerLedger` | L4, L6 |
| `src/engine/automaton.ts` | `buildAutomaton("H", 0.5)` golden E0=2 | L5 |

**Schema additions** (`src/content/schema.ts`): `raceSim`, `walkBoard`, `autocorrelationRuler`,
`gamblerLedger`, `sumTiles`, `dominanceWheel`, `retrievalGrid`, `tripletReveal`, `overlapRuler`.

**Authoring caveat:** generalize `equationDiagnosis.ts` beyond HH-specific hints before L2/L3
win-probability and duration tile beats.

---

## Roadmap after L6 (not yet planned)

| lessonId | Title | Why deferred |
|----------|-------|--------------|
| `lesson-weighted-coins` | Weighted Coins & Dice | Generalize `½ → p, 1−p`; golden-ratio crossing; reuses BiasChart |
| `lesson-coupon-collector` | Coupon Collector | `E = n·H_n`; CollectionGrid + PhaseLadder widgets |
| `lesson-fundamental-matrix` | The Fundamental Matrix | Matrix x-ray capstone; `(I−Q)⁻¹` unifies all recurrences |
| `lesson-stationary-recurrence` | Stationary & Mean Recurrence | Ergodic pivot: `π = πP`, return time `= 1/π_i` |

---

## Deferred product features

### Mastery: Performance-Threshold Signal

**Status:** Not in MVP. MVP uses `completion = mastery` (finish all beats once → node mastered →
next unlocks).

**The idea:** Replace pure completion with a performance-based mastery signal derived from
interactions the learner *already* does — no extra quiz UI.

**Signals to track per lesson:**

- Transition tiles correct on first try (core state-thinking skill).
- Prediction within tolerance (slider gate before the solve).
- Overlap / concept question correct on first attempt.
- Whether the learner triggered a full-answer reveal or used many hints.

**Proposed rule:** Mastered if ≥ ~80% first-try correctness with no full-answer reveals.
Otherwise **"completed, needs review."**

**Path behavior:** Next-step recommender points back to weak nodes. Honest resurface after
repeated misses.

**Why deferred:** `completion = mastery` is enough for the Phase 1 gate. L6 already introduces
a richer signal via `transferAttained` / "Fully mastered" on the transfer lesson.

**Natural next step (Phase 3):** Separate retrieval check on a fresh pattern; hook for spaced
repetition.

---

## Sources (math)

- Guibas & Odlyzko (1981) — correlation polynomial, Penney odds
- Li (1980) — martingale approach to pattern occurrence
- Nishiyama (2010) / Gardner (1974) / Penney (1969) — Penney's game
- arXiv:2009.06080 — Conway leading numbers, game length
- Grinstead & Snell — absorbing chains, gambler's ruin (Ch. 11–12)
- Zhou, *Green Book* — quant interview Markov / expected-value canon
- Joshi, Mosteller, Crack — interview problem collections

All worked values cross-checked against repo engine golden tests at `p = 0.5`.
