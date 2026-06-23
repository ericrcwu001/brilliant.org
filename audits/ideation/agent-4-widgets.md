# Agent 4 — Interaction & Widget Design — Ideation

**Lens:** interactable widgets as the primary teaching surface. Every concept below is
introduced by *doing*, with instant deterministic feedback from the pure engine. New
widgets are invented only where they earn their keep, and each is specced down to
canvas-vs-DOM, held state, the pure engine call, and the reduced-motion / tap-only
fallback so it is buildable on the current React + Konva + pure-engine stack.

**Design through-line discovered in the code:** the engine is a *first-step-analysis
machine*. `buildAutomaton` turns any H/T pattern into states + transitions + canonical
recurrences and then solves a linear system over exact rationals (`solveLinearSystem`,
Gauss–Jordan). Monte Carlo is a separate pure stream (`flipsToAbsorption`). **Almost
every new widget I propose is "point that same machine at a new chain and render the
result live."** That is what makes an aggressive widget slate feasible.

---

## Inventory of existing widgets (what they do + how they're built)

Read from source. Each beat view composes `BeatShell` (interaction region → inline
`FeedbackStrip` → sticky action bar with primary / secondary / tertiary actions).

| # | Widget (`interaction.type`) | Canvas/DOM | Held state | Engine call | Feedback / cadence |
|---|---|---|---|---|---|
| 1 | **PredictionBeat** (`prediction`) | DOM radiogroup chips | `selected` | none (pure UI) | ungraded "bet"; neutral `note` strip; stores `initialPrediction` |
| 2 | **PatternPickBeat** (`patternPick`) | DOM compare cards | none | none | passive; no strip |
| 3 | **CoinSimBeat** (`coinSim`) | Konva `StateGraph` (node pulse + traveling-dash edge) + DOM `CoinStream` + active prefix-state chip | committed `stream`, `state`, `flipCount`, `sawChange`, `activeEdge`, `pulseKey`, `phase` | `nextStateOf` per flip; `overlapHighlights` for the scripted near-miss replay | exit gate (≥`minFlips` & ≥1 prefix change) → guided replay; per-frame data never in state; reduced-motion lands instantly on near-miss |
| 4 | **StateTapBeat** (`stateTap`) | Konva `StateGraph` (static, highlights overlap edges) + DOM tap-choice state chips | `picks`, `solved` | graded vs `nextStateOf` | 3-step `useHintLadder`; per-card grade; overlap edges emphasized at level ≥2; `maxHintLevel` cap; per-card copy from `stateTapHints` |
| 5 | **EquationTilesBeat** (`equationTiles`) | DOM tap-to-place tiles → equation slots; worked E0 `PrefilledRow` + `InfoTip` | `filled`, `selTile`, `selSlot`, `checked`, `solved` | targets from `automaton.recurrences`; `equationDiagnosis` (diagnoseRow / hintForMistake / aggregateProgress) | green-locks correct tiles, targeted glow at L2, L3 reveal via `correctFill`; "Try again" keeps correct tiles; stores `theoreticalValue` |
| 6 | **SliderBeat** (`slider`) | DOM number-line w/ ticks + locked `--mark` flag | `value`, `moved`, `locked` | reads `expectedTimes.E0` | ungraded; stores `finalPrediction` + `theoreticalValue` |
| 7 | **SubstitutionBeat** (`substitution`) | DOM tap-to-advance stepper | `revealed`, `showedAll` | renders `automaton.substitutionSteps` | "Substitute" one step / "Show algebra" all; stores final `theoreticalValue` |
| 8 | **TheorySimChartBeat** (`theorySimChart`) | Konva `SimChart` (log-y, linear-x, gradient area, live head bead + value chip, prediction marker, ±band) | `points[]`, `running`, `batchStart` + rAF refs (`sum`,`count`) | `flipsToAbsorption` per trial | time-based rAF batch (≈5s / 500), running mean converges to theory; "Run 500 more" / "Run again"; persists `empiricalMean`+`simRuns` only |
| 9 | **OverlapBeat** (`overlap`) | side-by-side Konva mini `StateGraph`s + DOM notes | none (memoized automata) | `buildAutomaton` per pattern; `overlapHighlights` | narrative; reset vs self-loop edge highlight |
| 10 | **BiasSandboxBeat** (`slider` by `beatId`) | DOM continuous bias slider + Konva `BiasChart` (E-vs-p curves, live guide + per-line dots/chips) + DOM symbolic recurrence cards | `p` | precomputed curve samples + live `buildAutomaton(p)` | exploratory; never graded / never blocks |
| 11 | **RecapBeat** (`recap`) | DOM generate-then-reveal: retrieval chips → hero verdict + mechanism rows + belief-update trio | `picked`, `revealedAnyway` | `buildAutomaton` contrast; `e1Memory`; reads `lessonState` | retrieval before praise; numbers always from engine; `needsReview` softens copy |

**Shared infra I will reuse heavily:** `BeatShell`, `FeedbackStrip`
(idle/correct/note/hint), `useHintLadder` (3-step ladder + L3 reveal + `needsReview`,
`byPattern` resolution), `CoinStream` (DOM coins + chip + `aria-live`), Konva `theme.C`
palette + `edgeColor` + `FONT_MONO`, `useElementWidth`. Konva files carry `'use no
memo'`, use `listening={false}` layers, and animate imperatively (`node.to(...)`,
`Konva.Animation` dash travel) — **never** committing per-frame React state.

**Hard rules the inventory encodes (and that every new widget below obeys):** one
interaction per beat; instant specific feedback; 3-step hint ladder on graded beats;
44px tap targets with a tap-only path (no drag ever required); reduced-motion completes
the lesson; Konva only for canvas heroes; engine stays pure + dependency-free + golden-
tested at p=0.5; colors from tokens; H/T never encoded by color alone.

---

## Candidate lessons (ranked to MAXIMIZE great interactive widgets)

### 1. **"Rig the Bet: Penney's Game"**  *(top pick — most new widget surface)*

**Hook:** *"Let your opponent choose their HHH/HTT pattern first. Then you choose — and
you win more than half the time. Always."*

**Core learning promise:** overlap is not just *how long you wait*; it decides *who wins
a head-to-head race*. The learner discovers **non-transitivity** by hand and leaves able
to construct the winning counter-pattern for any opponent choice.

**Explicit link to current concepts:** this is the payoff of the flagship's "overlap is
memory" insight. Reuses STATES & TRANSITIONS (now a *combined* race chain), FIRST-STEP
ANALYSIS → RECURRENCES and the LINEAR-SYSTEM SOLVE (now solving for a **win
probability** instead of an expected time), SIMULATION vs THEORY (win-rate convergence),
and PARAMETER SENSITIVITY (a biased coin can *reverse* who wins).

**The math (correct, sourced):** for length-3 strings the second player wins by choosing
**B = (¬a₂), a₁, a₂** given opponent A = a₁a₂a₃ (e.g. A = HHH → B = THH wins 7:1). Exact
odds come from **Conway's leading-number algorithm**: odds in favor of A over B =
`(C(B,B) − C(B,A)) / (C(A,A) − C(A,B))`, where `C(X,Y)` is the binary overlap number of
X's suffixes against Y's prefixes. Worked: A=HHH,B=THH → AA=7, AB=0, BB=4, BA=3 → B wins
`(7−0)/(4−3)=7` → 7:1, P(B)=7/8. The whole win-probability table is **also** obtainable
by first-step analysis on the product chain of the two KMP automata — i.e. the engine
the app already has. Sources: Nishiyama/Conway (plus.maths.org), arXiv:2107.06952 Prop
2.3, Springer *Theory and Decision* no-arbitrage derivation.

**Beat-by-beat (11 beats):**

1. **Open bet** — *prediction* · Bet. "Opponent locks HHH. You may pick any triple. Can
   you guarantee an edge?" (trap option: "no — it's symmetric").
2. **One race** — *patternDuel (single)* · Explore. Watch one shared coin stream; two
   tracker chips race to completion; first pattern to appear wins the round.
3. **Duel arena** — *patternDuel (batch)* — **centerpiece** · Prove. Run hundreds of
   shared-stream races; two win-rate bars converge live to the true odds.
4. **Build the steal** — *patternBuilder* · Model. Tap 3 H/T tiles to *construct* your
   counter-pattern; the duel re-runs instantly so you feel each bit's effect.
5. **Conway aligner** — *correlationGrid* · Model. Slide A over B; tap each offset
   "match / no-match"; the binary leading number assembles and the odds pop out.
6. **Non-transitivity wheel** — *dominanceWheel* · Prove. All 8 triples on a ring with
   "beats" arrows; tap any node to trace the cycle and find that *every* pattern is
   beaten by another.
7. **Win-prob recurrence** — *equationTiles (reuse)* · Model. First-step analysis on a
   small race chain: `P(s) = ½P(s→H) + ½P(s→T)`.
8. **Predict your edge** — *slider (reuse)* · Prove. Lock a guess for P(you win) %.
9. **Theory vs simulation** — *theorySimChart (reuse, win-rate variant)* · Prove. The
   empirical win rate converges to the Conway odds line.
10. **Bias breaker** — *parameterDial / biasSandbox (reuse)* · Explore. Drag p; watch an
    odds curve bend and, for some matchups, **flip** sign.
11. **Recap** — *recap (reuse)* · Prove. Retrieve *why* second-mover wins (overlap, not
    rarity), reveal the counter-pattern recipe, bridge to weighted coins.

**Interactable widgets:**

- **PatternDuel / Duel Arena** *(NEW, large)* — the centerpiece.
  - *Manipulation:* tap **Race** (single) or **Run 200 races** (batch).
  - *Live response:* a single shared coin stream feeds **two** KMP trackers rendered as
    chips advancing along their pattern; the first to complete flashes a win; batch mode
    fills two converging win-rate bars + a running tally (e.g. "you 138 · them 62").
  - *Instant-feedback loop:* every race result nudges the bars toward the exact odds; the
    learner *sees* 7:1 emerge, then can compare to the theory line.
  - *Canvas vs DOM:* Konva for the dual race track + a thin progress sweep (reuse
    `SimChart` conventions for the win-rate convergence); DOM `CoinStream` for the shared
    flips with `aria-live`; DOM bars as the accessible mirror.
  - *Engine computes:* `buildRace(A,B,p)` = product of the two automata with two
    absorbing states, solved by the **existing** `solveLinearSystem` for exact
    P(A-first); `simulateRace(A,B,p,rng)` returns the winner of one shared stream (a
    two-tracker variant of `flipsToAbsorption`).
  - *Reduced motion / tap-only:* batch result appears as final bars with no per-race
    animation; single race renders as a static stream + verdict. Buttons only; no drag.
  - *Reuse?* new component, but reuses solver + `SimChart` + `CoinStream` patterns.

- **CorrelationGrid (Conway aligner)** *(NEW, small)* — learn the algorithm by running it.
  - *Manipulation:* the learner shifts one pattern under the other (tap ◀/▶ to change
    offset) and taps each aligned column "same / different."
  - *Live response:* matched full-overlaps light green; the leading binary number builds
    digit by digit; the odds fraction updates.
  - *Instant-feedback loop:* a wrong "same/different" tap is graded against the engine's
    correlation immediately (red column), with the 3-step ladder.
  - *Canvas vs DOM:* pure DOM — mono letter cells in a CSS grid (tactile like equation
    tiles), 44px cells.
  - *Engine computes:* `conwayCorrelation(X,Y)` pure fn → bit vector + decimal; reuses
    the prefix-comparison logic already implied by `prefixFunction`.
  - *Reduced motion / tap-only:* no animation needed; offset stepping is tap-based.
  - *Reuse?* new, but trivial; reuses tile/slot styling + hint ladder.

- **DominanceWheel** *(NEW, large)* — see non-transitivity.
  - *Manipulation:* tap a pattern node on the ring; optionally toggle "show full
    tournament."
  - *Live response:* outgoing green arrows to everyone it beats, incoming red from its
    predator; tapping around the ring traces a directed cycle (the "rock-paper-scissors"
    loop) that proves no pattern is best.
  - *Instant-feedback loop:* a mini quiz — "tap the pattern that beats the highlighted
    one" — grades against the pairwise matrix.
  - *Canvas vs DOM:* Konva radial graph (reuses `StateGraph` node/arrow primitives +
    `theme` colors).
  - *Engine computes:* `winMatrix(patterns,p)` = pairwise `buildRace` solve → 8×8 odds.
  - *Reduced motion / tap-only:* arrows static; highlight on tap; no travel dashes.
  - *Reuse?* new Konva view, reuses node/arrow drawing + solver.

- **Reused:** `equationTiles`, `slider`, `theorySimChart` (win-rate target line instead
  of expected-time), `biasSandbox`/`parameterDial`, `recap`, `prediction`.

**Feasibility/effort:** PatternDuel **large new** · CorrelationGrid **small new** ·
DominanceWheel **large new** · engine `conwayCorrelation`/`buildRace`/`simulateRace`
**small new (pure)** · everything else **reuse**.

**Targeted misconceptions:** "sequential choice is symmetric / fair"; "the rarer or
longer pattern wins"; "dominance is transitive (A>B, B>C ⇒ A>C)"; "you must pick a single
globally-best pattern."

---

### 2. **"Longer Patterns & Overlap: THH vs HTH"**  *(the planned next lesson, reshaped to be widget-first)*

**Hook:** *"Both are length 3. One waits 8 flips on average, the other 10. Same length —
where do the extra 2 flips come from?"*

**Core learning promise:** generalize the flagship method to length-3, and make the
driver — **self-overlap (borders)** — directly visible and manipulable, culminating in
the border-sum formula.

**Explicit link to current concepts:** this is roadmap lesson #3 and the natural next
step. Same STATES/TRANSITIONS/OVERLAP/FIRST-STEP/LINEAR-SOLVE/SIM/SENSITIVITY, now on a
4-state graph (E0..E3) with *deeper* resets, so the learner sees the method scale.

**The math (correct, sourced):** fair-coin **border-sum formula** `E[τ] = Σ_{ℓ∈borders} 2^ℓ`
(borders = lengths that are both prefix and suffix, always including L). THH borders {3}
→ E=8; HTH borders {1,3} → E=2+8=10. The leading 2^L is the "frequency" term 1/P(T);
each *proper* border is an extra startup penalty (the reset depth). The engine's
`solveLinearSystem` already yields these exactly; a `borders()` helper gives the same
number a second way (great cross-check / golden test). Sources: Riis (QMUL) border-sum
notes, arXiv:2009.06080 (correlation polynomials / Conway leading number), Solov'ev–
Nielsen–Blom formula (arXiv:2410.13426).

**Beat-by-beat (12 beats):**

1. **Open bet** — *prediction* · Bet. THH vs HTH vs "tie (both length 3)".
2. **Compare** — *patternPick (reuse)* · Bet.
3. **Simulate** — *coinSim (reuse)* · Explore. Now a 4-node graph; feel the deeper reset.
4. **Self-overlap ruler** — *overlapRuler* — **centerpiece** · Model. Slide a copy of the
   pattern over itself to discover its borders → reset target.
5. **Find the failure edges** — *stateTap (reuse)* · Model. Several near-miss edges; some
   reset to E0, some to E1.
6. **Build the recurrences** — *equationTiles (reuse)* · Model. E0,E1,E2 rows.
7. **Refine prediction** — *slider (reuse)* · Prove.
8. **Guided solve** — *substitution (reuse)* · Model. Solve the 3-equation system.
9. **Theory vs simulation** — *theorySimChart (reuse)* · Prove.
10. **Border-sum ledger** — *termLedger* · Prove. Tap each border to drop a `2^ℓ` tile
    into a running sum that lands exactly on E.
11. **Overlap compare** — *overlap (reuse)* · Prove. THH vs HTH mini-graphs side by side.
12. **Recap** — *recap (reuse)* · Prove.

**Interactable widgets:**

- **OverlapRuler (self-overlap slider)** *(NEW, small)* — make autocorrelation tactile.
  - *Manipulation:* drag (or tap ◀/▶) a translucent copy of the pattern sliding across a
    fixed copy; at each shift the overlapping window is checked.
  - *Live response:* columns where the shifted copy matches glow green; when an entire
    overlap matches, that shift is tagged a **border** and its length ℓ is recorded with
    a `2^ℓ` chip; the implied reset depth is annotated on the state graph.
  - *Instant-feedback loop:* "is this shift a border? tap yes/no" graded against the
    engine; the discovered borders feed beat 10's ledger.
  - *Canvas vs DOM:* DOM mono letter rows + offset (cleanest, scales at 200% text);
    optional Konva tie-line to the matching `StateGraph` reset edge.
  - *Engine computes:* `borders(pattern)` from `prefixFunction` (already in `automaton.ts`).
  - *Reduced motion / tap-only:* offset steps via buttons; matches shown as color + ✓,
    no slide animation.
  - *Reuse?* new, tiny; reuses prefix-function + tile styling.

- **TermLedger / SumBuilder** *(NEW, small)* — generalize EquationTiles from one equation
  to a **series**.
  - *Manipulation:* tap each border length to add its `2^ℓ` term tile to a running ledger.
  - *Live response:* the partial sum updates and snaps onto the theory value when complete
    (`8 = 2³`, `10 = 2¹ + 2³`).
  - *Instant-feedback loop:* adding a wrong/duplicate term is rejected with a ladder hint;
    the final sum is checked against `expectedTimes.E0`.
  - *Canvas vs DOM:* DOM, reuses equation-tile look and `--correct` flash.
  - *Engine computes:* `borders()` + powers; cross-checked against the linear solve.
  - *Reduced motion / tap-only:* color-only correct/wrong; tap to add.
  - *Reuse?* new but built from existing tile components; **reusable across lessons**
    (coupon-collector `Σ n/(n−k+1)`, geometric-series sums, etc.).

- **Reused:** `coinSim`, `stateTap`, `equationTiles`, `slider`, `substitution`,
  `theorySimChart`, `overlap`, `recap`, `prediction`, `patternPick`. (Highest reuse of
  the three — lowest effort, strongest continuity.)

**Feasibility/effort:** OverlapRuler **small new** · TermLedger **small new** · the rest
**reuse** (the engine already builds 4-state automata; only content fixtures change).

**Targeted misconceptions:** "length sets the wait"; "all length-3 patterns are equal";
"rarity = wait" (both appear with the same per-window frequency, 1/8).

---

### 3. **"Gambler's Ruin: Walk to the Wall"**  *(diverge — a new chain, same method, most tactile new widget)*

**Hook:** *"$5 in your pocket, $1 a hand. Reach $10 or go broke. Which comes first — and
how long will you be at the table?"*

**Core learning promise:** the first-step / linear-solve method is **not about coins** —
it solves *any* Markov chain. Here it's a 1D random walk with absorbing walls, giving
ruin probability and expected duration; and a tiny bias produces a *huge* swing.

**Explicit link to current concepts:** STATES become wealth levels, TRANSITIONS become
±1 steps (with absorbing walls instead of a match state), FIRST-STEP ANALYSIS gives the
same recurrence shape, the LINEAR-SYSTEM SOLVE now yields a **probability** and a
**duration**, and PARAMETER SENSITIVITY (p) is dramatic. It explicitly reframes the
flagship's "expected hitting time" as one instance of a general absorbing-chain solve.

**The math (correct, sourced):** start i, walls 0 and N, p=win, q=1−p, ρ=q/p.
Fair (p=½): P(reach N)=i/N, **E[duration]=i(N−i)**. Biased: P(reach N)=`(1−ρ^i)/(1−ρ^N)`,
`E[duration] = (1/(q−p))·(i − N·(1−ρ^i)/(1−ρ^N))`. Recurrences from first-step analysis:
`P_i = pP_{i+1}+qP_{i−1}`, `D_i = 1 + pD_{i+1}+qD_{i−1}`, with the wall boundary
conditions. Sources: MIT 6.042 random-walks notes, Aldridge MATH2750, Lalley (UChicago)
biased-walk notes.

**Beat-by-beat (10 beats):**

1. **Open bet** — *prediction* · Bet. From $5 toward $10-or-$0, more likely $10 or $0?
   (trap: "always 50/50").
2. **Walk once** — *walkBoard (single)* · Explore. A token random-walks between the walls;
   a coin stream drives ±1.
3. **Ruin board** — *walkBoard (live solve)* — **centerpiece** · Model/Prove. Drag the
   start, the walls, and p; a stacked bar shows P(reach N) vs P(ruin) and an E[duration]
   readout, recomputed instantly.
4. **First step on the walk** — *stateTap (reuse, on the walk chain)* · Model. Tap where a
   ±1 step lands.
5. **Build the recurrence** — *equationTiles (reuse)* · Model. `P_i = pP_{i+1}+qP_{i−1}`.
6. **Predict the duration** — *slider (reuse)* · Prove. Guess E[duration] for the set-up.
7. **Guided solve** — *substitution (reuse)* · Model. Telescope to `i(N−i)` (fair case).
8. **Theory vs simulation** — *theorySimChart (reuse, walk variant)* · Prove. Empirical
   duration / ruin rate converge.
9. **Ruin vs bias** — *parameterDial / biasSandbox (reuse)* · Explore. P(ruin) vs p shows
   a sharp transition — "the house edge is brutal."
10. **Recap** — *recap (reuse)* · Prove.

**Interactable widgets:**

- **WalkBoard / RuinBoard** *(NEW, large)* — the single most tactile new widget.
  - *Manipulation:* drag a **start token** along a number-line lattice and drag two
    **wall handles** (0 and N); a coin-bias control sets p. (All three also exposed as
    sliders for the tap-only path.)
  - *Live response:* a stacked **outcome bar** (reach-N vs ruin) and an **E[duration]**
    readout recompute on every change; "Walk" plays one random trajectory as a path /
    sparkline; a faint **ruin-heat ribbon** tints each start position by its ruin
    probability so the learner sees the whole landscape, not one number.
  - *Instant-feedback loop:* dragging the start toward a wall visibly tilts the bar;
    nudging p off ½ collapses the favorable outcome — the lesson's "aha" is in the drag.
  - *Canvas vs DOM:* Konva for the lattice lane, draggable handles (commit state on drag
    end only, per the tile-layer rule), token path, and heat ribbon; DOM sliders +
    numeric readouts as the accessible mirror with `aria-live`.
  - *Engine computes:* `buildWalk(N,p)` → birth–death chain; reuse `solveLinearSystem`
    twice (hitting probabilities and expected absorption time); `simulateWalk(i,N,p,rng)`
    for Monte Carlo. All pure, all rational-exact for the duration in the fair case.
  - *Reduced motion / tap-only:* no token animation (final path drawn statically or just
    the bar updates); handles are sliders; bars update instantly.
  - *Reuse?* new Konva view; reuses solver, `SimChart` conventions, slider styling.

- **DistributionHistogram** *(NEW, medium — debuts here, reusable)* — show spread, not
  just the mean.
  - *Manipulation:* "Run 1,000 walks"; optionally toggle mean / ±σ markers.
  - *Live response:* outcomes (durations, or which wall) bin into a live Konva histogram;
    mean and variance markers settle — duration has a famously **fat** spread, which the
    current single-mean `SimChart` cannot show.
  - *Instant-feedback loop:* compare the histogram mean to the theory line from beat 3.
  - *Canvas vs DOM:* Konva (reuses `SimChart` axes/`theme`); DOM table fallback of bin
    counts.
  - *Engine computes:* `simulateWalk` samples; binning is pure UI.
  - *Reduced motion / tap-only:* bars drawn once at end; button-driven.
  - *Reuse?* new, but directly reusable by coupon-collector (long tail) and any variance
    lesson.

- **Reused:** `stateTap` (pointed at the walk chain), `equationTiles`, `slider`,
  `substitution`, `theorySimChart`, `biasSandbox`/`parameterDial`, `recap`, `prediction`.

**Feasibility/effort:** WalkBoard **large new** · DistributionHistogram **medium new** ·
`buildWalk`/`simulateWalk` **small new (pure)** · the rest **reuse**.

**Targeted misconceptions:** "a fair game means 50/50 to hit either wall regardless of
where you start"; "doubling my bankroll doubles my win chance" (it's linear in i, but
**duration** is i(N−i) — peaks in the middle); "a tiny house edge barely matters" (ruin
probability swings sharply with p).

---

### 4. **"Coupon Collector: Complete the Set"**  *(optional 4th — strong collection widgets)*

**Hook:** *"Six stickers, random packs. You'll need way more than six packs — and the
last sticker is the worst."*

**Core learning promise:** an expected hitting time can be a **sum of independent
geometric waits**; the last few coupons dominate; growth is `n·H_n ≈ n ln n`, not linear.

**Explicit link:** STATES = # distinct collected; TRANSITIONS = advance (new) or
self-loop (duplicate); the expected wait is FIRST-STEP analysis collapsing to a sum of
geometric expectations; SIM vs THEORY and SENSITIVITY (over n) carry over.

**The math (correct, sourced):** phase i (already hold i−1) success prob
`p_i=(n−i+1)/n`, geometric wait `E=n/(n−i+1)`; total `E[T]=n·H_n`; `Var≈π²n²/6`.
Sources: Wikipedia / Brilliant wiki coupon-collector, MathStackExchange derivation.

**Beat-by-beat (9 beats):** open bet (packs for a 6-set?) → **collection grid** (open
packs, fill album, dups flash) → **phase ladder** (per-phase wait bars; the last towers)
→ highlight "the last coupon" → **term ledger** (assemble `Σ n/(n−k+1)`) → predict total
(slider) → theory vs sim (histogram shows the fat tail) → n-sensitivity curve
(`E(n)=nH_n`) → recap.

**Interactable widgets:**

- **CollectionGrid** *(NEW, medium):* tap **Open pack** → a uniform coupon lands; new
  ones fill a 44px-cell grid, duplicates flash a dup-counter. DOM grid; engine = pure
  draw via injected RNG + per-phase expectations; reduced-motion = instant cell fill;
  tap-only by construction.
- **PhaseLadder** *(NEW, small):* n stacked horizontal bars, bar i ∝ `n/(n−i+1)`; the
  final bars visibly tower — a visceral "why the last coupon is brutal." DOM bars; engine
  = phase expectations; tap a bar → its geometric detail. Reusable for any multi-stage
  wait.
- **Reused:** `termLedger` (from lesson 2), `slider`, `theorySimChart` +
  `DistributionHistogram`, `parameterDial` (over n), `recap`, `prediction`.

**Feasibility/effort:** CollectionGrid **medium new** · PhaseLadder **small new** ·
`couponPhases`/`simulateCollect` **small new (pure)** · rest **reuse**.

**Targeted misconceptions:** "n coupons ⇒ ~n draws"; underestimating the last-coupon
tail; "linear in n" vs `n ln n`.

---

## Catalog of NEW reusable widget primitives (beyond any single lesson)

Ranked by how much they'd enrich the app. Each is a 2–3 sentence build sketch; all are
powered by the existing pure-engine + Konva/DOM patterns.

1. **DualTrackRace (PatternDuel).** A shared coin stream drives two automata to
   absorption with live converging win-rate bars and a tally. Build: `buildRace` product
   chain solved by the existing `solveLinearSystem`, a shared-stream `simulateRace`, and a
   Konva race lane reusing `SimChart`/`CoinStream`. Powers Penney, any head-to-head, and
   "which of two events happens first" problems.

2. **WalkBoard (DraggableNumberLineWalk).** A 1D lattice with draggable absorbing walls +
   start token and a coin-bias control; outcome probabilities and expected duration
   recompute live. Build: `buildWalk(N,p)` birth–death chain + two solver passes; Konva
   lattice with commit-on-drag-end; DOM sliders as the tap-only mirror. Powers ruin,
   random walks, and general hitting-time-to-boundary problems.

3. **CorrelationGrid (Conway aligner).** A DOM grid where the learner slides one pattern
   under another and taps match/no-match to *run* the overlap algorithm and read off the
   leading number + odds. Build: pure `conwayCorrelation`, equation-tile styling, hint
   ladder. Powers Penney odds, overlap/autocorrelation lessons.

4. **TermLedger (SumBuilder).** Generalizes EquationTiles from one equation to a *series*:
   tap term tiles that accumulate into a running sum that snaps onto the closed form.
   Build: reuse tile components + `--correct` flash; engine supplies the term list and the
   target. Powers border-sum, coupon-collector, geometric series, any `Σ` identity.

5. **MarkovChainSandbox (generalized StateGraph).** A node+edge Konva chain that the
   engine solves (hitting times / absorption probabilities) and renders live, decoupled
   from "coin patterns." Build: lift `StateGraph` to take an arbitrary
   states/transitions object; add generic `solveAbsorptionProb` / `solveExpectedSteps`
   pure fns alongside the existing solver. The backbone for every chain-based lesson.

6. **DistributionHistogram.** Live Monte-Carlo histogram with mean/±σ markers — shows the
   *whole* outcome distribution, which the current mean-only `SimChart` can't. Build:
   Konva bars reusing `SimChart` axes + `theme`; binning is pure UI over existing
   simulate fns. Powers variance/spread for ruin duration, coupon tail, CLT demos.

7. **DominanceWheel (RelationGraph).** A radial directed graph of items with "beats /
   dominates" arrows; tap to trace cycles and expose non-transitivity. Build: Konva ring
   reusing node/arrow primitives; engine supplies a pairwise relation matrix. Powers
   Penney, non-transitive dice, tournament problems.

8. **OverlapRuler (SelfOverlapSlider).** Slide a pattern over itself (or another) to
   discover borders/overlaps, with matched windows lighting up. Build: DOM mono rows +
   offset; engine = `borders()`/`prefixFunction` (already present). Powers autocorrelation
   and KMP-depth intuition.

9. **CollectionGrid.** A fill-the-set grid driven by random draws with duplicate feedback.
   Build: DOM 44px cells, pure draw via injected RNG, per-phase expectations. Powers
   coupon collector, birthday/occupancy problems.

10. **PhaseLadder (WaitBars).** Stacked horizontal bars proportional to per-stage expected
    waits, making "the last stage dominates" visceral. Build: DOM bars; engine supplies
    the per-stage expectations. Powers coupon collector and any staged-wait process.

11. **ProbabilityTree.** An interactive first-step tree: tap p-weighted branches to expand
    one level and connect the picture to the recurrence the learner builds. Build: DOM/SVG
    nodes; engine = transition probabilities from any chain. Powers first-step analysis
    across every lesson; a gentle on-ramp before `equationTiles`.

12. **ParameterDial (generalized BiasSandbox).** A reusable "drag a parameter → recompute
    curves + live markers" wrapper around *any* engine quantity vs *any* parameter (p, n,
    N). Build: lift `BiasSandboxBeat` + `BiasChart` to accept a `{param, range,
    quantityFn}` config. Powers every sensitivity beat without bespoke code.

13. **OddsBeam (BalanceBeam).** A small odds/ratio visual (e.g. 7:1) as a tilting beam or
    split bar that animates as parameters change. Build: DOM/Konva, fed a single ratio;
    reduced-motion = static split. Powers Penney odds, ruin probabilities, any A:B.

14. **StreamScrubber (ScrubbableReplay).** A timeline scrubber to replay a coin stream /
    walk step-by-step, scrubbing back and forth. Build: store the committed event list,
    render a slider over it (no per-frame state); pairs perfectly with reduced motion and
    study/review. Powers any sim beat.

---

## Recommended slate of 3 lessons (ordered) and why

1. **Rig the Bet: Penney's Game.** Highest new-widget yield (Duel Arena, Conway aligner,
   Dominance Wheel) and the most satisfying payoff of the flagship's "overlap is memory"
   insight — it turns a passive fact into a game the learner can *win*. Non-transitivity
   is a genuine "wow" that's hard to teach with prose and trivial to teach with a wheel +
   a duel you can run 200 times.

2. **Longer Patterns & Overlap (THH vs HTH).** Already the roadmap's next lesson and the
   lowest-effort to ship: it reuses almost every existing widget and adds only two small,
   broadly reusable primitives (OverlapRuler, TermLedger). It cements the method at
   length-3 and makes autocorrelation *manipulable*, which the flagship only hinted at.

3. **Gambler's Ruin: Walk to the Wall.** Deliberately diverges to a new Markov chain to
   prove the method generalizes, and it earns the **WalkBoard** — the single most tactile
   new widget (drag the walls, watch ruin probability tilt) plus the **DistributionHist-
   ogram** debut. Bias sensitivity here is dramatic and sets up the "Weighted Coins &
   Dice" roadmap stub.

**Why this slate maximizes hands-on learning:** it introduces ~5 high-value new
primitives (Duel race, Conway aligner, Dominance wheel, Overlap ruler, Walk board) and a
reusable series-builder + histogram, *while* reusing all 10 existing widgets. Crucially,
every new widget is powered by the **same pure-engine pattern** — build a chain, solve a
linear system over rationals, Monte-Carlo a stream — so the engineering is incremental
and the *pedagogy* compounds: each lesson reinforces "first-step analysis is one machine
you can point at any random process," which is exactly the transferable skill a quant
interview rewards.
