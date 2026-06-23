# Agent 5 — Curriculum & Pedagogy — Ideation

> Lens: learning-path architect. Goal: the next 3 lessons must form a coherent,
> well-sequenced deepening of the existing path, every beat pedagogically
> load-bearing per `docs/beat-audit-rubric.md`, and the beat lists must be
> ready-to-author against the existing engine + interaction types.

---

## Path analysis: where the learner is, and the right next 3 steps

### What the learner can already do after Lesson 3

The first three lessons build one tight machine, the "forward / expectation"
toolkit, and they do it by varying nothing but pattern length:

| Lesson | Pattern(s) | Result | New capability |
|---|---|---|---|
| L1 `states-streaks` | `H` | E=2 | A question becomes a **state machine**; absorbing state = 0. |
| L2 `pattern-hitting-times` (flagship) | `HH` vs `HT` | 6 vs 4 | **Overlap is memory**: advance / self-loop / reset edges; first-step recurrences; linear solve; theory⇄sim; bias (p) sensitivity teased. |
| L3 `longer-patterns` (transfer) | `THH` vs `HTH` | 8 vs 10 | The method **transfers** to a novel length-3 pair, hints **faded** (`maxHintLevel: 2`), `transferAttained` signal. |

Concretely, the learner now owns: (1) STATES, (2) TRANSITIONS
advance/self-loop/reset, (3) OVERLAP / autocorrelation, (4) first-step analysis
→ RECURRENCES, (5) linear-system solve for EXPECTED HITTING TIME, (6) SIMULATION
vs THEORY, (7) PARAMETER SENSITIVITY (p, seen only in the sandbox).

### The pedagogical gap and the design principle for the next 3

The base toolkit answers exactly one question ("how long, on a fair coin, by one
method"). A coherent deepening should **vary exactly one dimension per lesson**
(desirable difficulty + interleaving, the Phase-3 themes in
`core_instructions.md`) so each new lesson reuses the machine and isolates one
new idea:

```
Base (L1–L3):  fair coin · single pattern · EXPECTED TIME · STATE method
L4 Penney's:   vary the QUESTION  (how long  →  who's first)
L5 Weighted:   vary the COIN      (1/2        →  p, 1−p, then a die)
L6 Martingale: vary the METHOD    (solve a system → a one-line shortcut)
```

This ordering is deliberate (prereqs → targets):

- **Penney's first** keeps the fair coin, so the only new variable is
  *competition* (two absorbing states). It reuses overlap most directly and
  delivers the biggest "wow" (non-transitivity) to sustain momentum.
- **Weighted Coins second** is a consolidation-by-generalization: it turns the
  flagship's `1/2` into `p`/`1−p` (tiles that already exist) and formalizes the
  bias sandbox. Placing a "consolidate" lesson between two hard lessons gives a
  healthy hard → consolidate → hard-capstone rhythm.
- **Martingale last** is the capstone: it re-derives *every* prior number a new
  way, so it depends on the learner having computed `6, 4, 8, 10` the long way
  and on the generalized coin/alphabet from L5. Maximum spaced retrieval.

> Alternative sequencing worth a product call: ship **Weighted Coins as L4**
> (gentler ramp right after the L3 transfer) and Penney's as L5. I recommend
> Penney's-first for motivation, but the difficulty argument for Weighted-first
> is legitimate.

---

## Candidate lessons (4 proposed, ranked)

Ranked by pedagogical value × fit × buildability. The recommended **slate of 3**
is candidates 1–3; candidate 4 is the best alternate / future L7.

1. **Penney's Game — "Who Gets There First?"** (`lesson-penneys-game`)
2. **The Martingale Shortcut — "The Fair-Casino Trick"** (`lesson-martingale-shortcut`)
3. **Weighted Coins & Dice — "When the Coin Isn't Fair"** (`lesson-weighted-coins`)
4. *(cut/alternate)* **Gambler's Ruin & First-Passage Walks** (`lesson-gamblers-ruin`)

> The slate is delivered in **unlock order** L4 → L5 → L6 = Penney's → Weighted →
> Martingale (see the ordered slate section). The candidate *ranking* above is by
> pedagogical strength; the *unlock order* is by prerequisite/difficulty.

Notation in the beat tables: **Phase** = Bet/Explore/Model/Prove; **Struggle** =
the productive wrong-path the beat manufactures; **Misconception** = the authored
misconception it targets; **Widget** = interaction + canvas surface.

---

## Candidate 1 — Penney's Game: "Who Gets There First?"  `lesson-penneys-game`

**Hook.** "You wait for `HH`; your friend waits for `HT`, on the *same* stream of
flips. You proved `HH` is slower (6 vs 4). So your friend wins the race, right?"
(They tie.)

**Single core learning promise.** *Model two patterns racing on one coin stream
as a single absorbing Markov chain and compute the probability one beats the
other — discovering that "appears first" is decoupled from "expected wait" and is
non-transitive.*

**Prerequisite link.** Reuses L2/L3 states + overlap + first-step analysis, but
swaps the **expected-time** recurrence (constant `1 +`, absorbing value 0) for
the **win-probability** recurrence (constant `0` inside, absorbing boundary `1`
or `0`). The overlap insight returns as Conway's leading numbers.

### Beat-by-beat (11 beats)

| # | beatId | type | Phase | Teaches (one thing) | Struggle / wrong-path | Misconception targeted | Widget |
|---|--------|------|-------|--------------------|----------------------|------------------------|--------|
| 1 | `open-bet` | prediction | Bet | The question is now "who's first," not "how long." | Pick `HT` "because E[HT]=4<6"; it's actually a tie. | Faster expected wait ⇒ wins the race. | 3 options; large `HH`/`HT` tokens. |
| 2 | `race-sim` | coinSim→**raceSim** | Explore | The race resolves the flip *after the first H*. | Predict `HT` dominance; the win tally stubbornly sits ~50/50. | Expectation gap implies a first-passage gap. | One stream + two pattern trackers + win tally (new). |
| 3 | `first-step-split` | stateTap | Model | First-step analysis on a *two-absorber* graph: from "one H", `H`→HH wins, `T`→HT wins. | Tap extra intermediate states instead of "one flip decides". | The race "needs more flips" to resolve. | Merged mini-graph; tap winner on H / on T. |
| 4 | `new-contender` | prediction | Bet | Length-3 makes it interesting: a second mover can win. | Opponent picks `HHH`; learner believes no pattern beats it. | A given pattern can't be reliably beaten. | 3 options ("yes/no/depends"). |
| 5 | `pick-your-counter` | patternPick (graded) | Model | Pick `B` to beat `A=HHH`; odds depend on **overlap with the opponent**, not your pattern's strength. | Pick a "strong-looking" `B` (e.g. `HHT`) and lose the odds check; best is `THH` (7:1). | Choose by your own pattern's strength, not the overlap with A. | 8 pattern cards; engine returns P(B first). **Faded: `maxHintLevel: 2`.** |
| 6 | `race-sim-3` | raceSim | Prove | Empirical P(B first) converges to the computed odds. | Small samples look noisy; learner must run enough. | "It was luck," not structure. | raceSim with win-probability convergence. |
| 7 | `win-prob-tiles` | equationTiles | Model | The **win-probability** recurrence: `P_s = ½P_a + ½P_b`, boundary `P=1`/`P=0`, **no `1 +` cost**. | Reflexively place a `1 +` flip cost (3 lessons of muscle memory) → targeted fail. | Probabilities accumulate a per-flip cost like expectations. | Existing tile builder; const `0`/`1`, prob `½`, race-state vars. |
| 8 | `solve-the-odds` | substitution | Model | Solve the P-system for `P(B beats A)` (e.g. 7/8). | Before each fold, **choose which state to substitute** (fixes cycle-1 passivity). | Solving is a passive reveal. | Tap-to-substitute; choose-the-next-step variant. |
| 9 | `conway-shortcut` | overlap→**overlapSlide** | Model | Conway leading numbers: slide patterns over each other; odds `=(AA−AB)/(BB−BA)`. | Miscount an overlap by missing a shifted match. | Odds come from pattern *length*, not overlap. | Drag/shift one pattern under another; matches light up (new, shared with L6). |
| 10 | `non-transitive-loop` | overlap→**oddsLoop** | Prove | The wow: `HHT▸HTT▸TTH▸THH▸HHT` — each beats the next; no best pattern. | "Just pick the best one" — every choice the learner taps gets a beater shown. | There exists a single strongest pattern. | Tap a pattern → widget names its beater; loops (new, lightweight DOM). |
| 11 | `recap` | recap | Prove | Race ≠ wait; P-recurrence (no `1 +`, boundaries 1/0); overlap sets odds; non-transitivity. | — | — | Recap card; tease L5 ("does an unfair coin shift the odds?"). |

**Scaffolding / transfer.** Faded on the two "setup" beats (`pick-your-counter`,
`win-prob-tiles`) at `maxHintLevel: 2`, mirroring L3. `transferAttained = true`
iff the learner picks a *winning* counter for `HHH` (beat 5) **and** builds the
P-recurrence (beat 7) without reaching the cap. Interleaving: beat 1 forces a
direct compare of "expected time" (retrieved) vs "first-passage" (new).

**Interactable widgets (summary).** prediction · **raceSim** (new) · stateTap ·
patternPick (now graded, high-agency) · equationTiles (reused, P-targets) ·
substitution (choose-the-step) · **overlapSlide** (new) · **oddsLoop** (new) ·
recap. **Engine:** `buildRaceAutomaton(a,b,p)` (product chain; absorption
probabilities via existing `solveLinearSystem`) and `conwayLeadingNumbers(a,b,q)`.

**P1–P5 & cycle-1 avoidance.** P1: one promise (win-probability of a race), each
beat traces to it. P2: every beat manufactures a wrong path (the `HT`-wins trap,
the `1 +` habit trap, the "no best pattern" impossibility). P3: misconceptions
are explicit and per-pattern feedback already supported by the schema
(`byPattern`). P4: raceSim/overlapSlide match the math exactly; no decorative
elements. P5: distinct from L2 (different *question*, not a re-skin). It directly
fixes the cycle-1 findings — the old passive `pattern-pick` becomes a **graded,
high-agency counter-pick** (P-1), and `solve-the-odds` uses the choose-the-step
agency bump (P-2).

**Misconceptions targeted.** faster expected wait ⇒ wins the race · "there's a
strongest pattern" · adding a `1 +` cost to a probability recurrence · picking a
counter by your own pattern's strength instead of overlap with the opponent.

---

## Candidate 2 — The Martingale Shortcut: "The Fair-Casino Trick"  `lesson-martingale-shortcut`

**Hook.** "You solved four linear systems to get `6, 4, 8, 10`. A quant gives you
`HTHTHT` and 30 seconds. There's a one-line rule — let's earn it."

**Single core learning promise.** *A pattern's expected wait equals the sum of
`2^k` over every way the pattern overlaps itself (its autocorrelation), a
shortcut you can justify with a fair-betting (martingale) argument and that
reproduces every answer you computed the long way.*

**Prerequisite link.** Capstone re-derivation: it depends on the learner *already
knowing* `E[HH]=6, E[HT]=4, E[THH]=8, E[HTH]=10` (so the shortcut's output is a
retrieval check), formalizes the flagship's "expert note" (Σ over prefix-suffix
overlaps), reuses L4's overlap-sliding, and generalizes L5's biased/large
alphabet (payout `=1/P`, base `q`).

### Beat-by-beat (11 beats)

| # | beatId | type | Phase | Teaches (one thing) | Struggle / wrong-path | Misconception targeted | Widget |
|---|--------|------|-------|--------------------|----------------------|------------------------|--------|
| 1 | `recall-grid` | prediction | Bet | Spaced retrieval of `6,4,8,10`; tease "one rule for all." | Misremember a value → immediate correction. | "Each pattern needs its own system." | Match patterns→{6,4,8,10}. |
| 2 | `self-overlap` | overlap→**overlapSlide** | Explore | Autocorrelation = the set of shifts `k` where prefix=suffix. | Find only the trivial full overlap; miss the shift-1 match in `HH`. | Only the full-length overlap counts. | Slide a copy of the pattern under itself; matches light (new, shared w/ L4). |
| 3 | `overlap-to-power` | stateTap-like | Model | Each matching overlap `k` contributes `2^k` (fair binary). | Assign `2^k` to a non-matching shift. | All shifts contribute / wrong base. | Tap `2^k` chips onto each lit overlap. |
| 4 | `sum-it` | **sumTiles** | Model | `E[wait] = Σ 2^k`; for `HH`, `4+2 = 6`. | Omit the `k=1` term → get `4` (which they *know* is wrong for HH). | The partial overlap is ignorable (gives HT's 4 for HH). | Assemble the sum; result snaps to the remembered `6` (new). |
| 5 | `casino-intuition` | **bettingLadder** | Explore | *Why*: fair casino, money in `=` flips `=T`, money out `=Σ2^k`. | Step a gambler and see most go bust; only overlapping ones survive. | The formula is a coincidence with no reason. | Overlapping gamblers betting on the pattern; payout tally (new). |
| 6 | `apply-THH` | overlapSlide + sumTiles | Model | Transfer: `THH` overlaps `{3}` → `2^3 = 8`. | Invent spurious `TH`/`HH` partial overlaps. | Length-3 must have partial overlaps. | Reused slider+sum. **Faded: `maxHintLevel: 2`.** |
| 7 | `apply-HTH` | overlapSlide + sumTiles | Model | Transfer: `HTH` overlaps `{3,1}` → `8+2 = 10`. | Miss the `H_H` shift-1 overlap → get `8` (known-wrong). | The subtle k=1 overlap doesn't exist. | Reused slider+sum. **Faded: `maxHintLevel: 2`.** |
| 8 | `cross-check` | theorySimChart | Prove | Simulation converges to the shortcut's value — three methods agree. | Trust the shortcut without checking; chart settles on it anyway. | "New trick, probably approximate." | Existing convergence chart. |
| 9 | `surprise-pattern` | prediction + overlapSlide | Prove | The payoff: `HHH` overlaps `{3,2,1}` → `8+4+2 = 14`, vs `THH=8` (same length!). | Predict `~8` by length; it's `14`. | Pattern length determines the wait. | Predict, then derive via the slider. |
| 10 | `biased-generalize` | slider/prediction *(Extension)* | Prove | Generalize the base: payout `=1/P`; `E=Σ ∏1/P`; (26-letter `ABRACADABRA` cameo). | Keep base 2 for a biased coin. | The base is always 2. | Light reveal/explore; ties to L5. |
| 11 | `recap` | recap | Prove | Σ`2^k` over self-overlaps; the casino reason; matches states + sim; instant on any pattern. | — | — | Recap; course-complete milestone. |

**Scaffolding / transfer.** This is the most retrieval-heavy lesson: it *re-solves
known problems a new way* (testing effect). Interleaving is explicit — beats 6–7
mix `THH`/`HTH` and beat 9 throws an unblocked novel pattern. Faded hints on
beats 6–7; `transferAttained = true` iff both are cleared without reveal. Beat 4's
omit-the-`k=1` wrong path *is* the central flagship misconception, surfaced again
(spaced).

**Interactable widgets (summary).** prediction/match · **overlapSlide** (new,
shared with L4) · overlap-to-power tap · **sumTiles** (new) · **bettingLadder**
(new) · theorySimChart (reused) · slider. **Engine:** `autocorrelation(pattern,
q)` → `{overlaps, contributions, sum}`, a pure function with a powerful golden
test: `Σ q^k === buildAutomaton(pattern, 1/q).expectedTimes.E0` for
`HH/HT/THH/HTH` (the two engines must agree).

**P1–P5 & cycle-1 avoidance.** P1: a single closed-form promise. P2: exceptional —
the omit-the-partial-overlap trap and the `HHH=14` surprise are real productive
failures, not click-through. P3: feedback can compare the shortcut to the
learner's *remembered* number, the strongest possible "why." P4: `overlapSlide`
makes "overlap is memory" literally tactile. P5: it's a *method* lesson, never a
re-skin of L2. No passive beats — even the recap is preceded by a self-derived
surprise.

**Misconceptions targeted.** "each pattern needs its own system" · only the full
overlap counts (the `k=1` omission, reproduced deliberately) · pattern length
sets the wait (`HHH=14` vs `THH=8`) · the base is always 2.

---

## Candidate 3 — Weighted Coins & Dice: "When the Coin Isn't Fair"  `lesson-weighted-coins`

**Hook.** "Bias the coin toward heads (`p=0.7`). One of `E[HH]`, `E[HT]` drops a
lot; the other actually *rises*. Which?" (They cross.)

**Single core learning promise.** *The state method is coin-agnostic — replace
`1/2` with `p` and `1−p` and the expected wait becomes a function of `p` you can
reason about, including the bias that reverses which pattern is slower and the
limits as the coin gets extreme.*

**Prerequisite link.** Directly generalizes the flagship recurrence
(`½ → p, 1−p`, tiles that **already exist**) and promotes the exploration-only
bias sandbox into a **graded** build + a sensitivity analysis using the
already-built `BiasChart`.

### Beat-by-beat (11 required + 1 extension)

| # | beatId | type | Phase | Teaches (one thing) | Struggle / wrong-path | Misconception targeted | Widget |
|---|--------|------|-------|--------------------|----------------------|------------------------|--------|
| 1 | `open-bet` | prediction | Bet | Bias affects the two patterns **differently**. | Pick "both shrink"; in fact `E[HT]` *rises* at `p=0.7`. | Bias rescales all waits equally. | 3 options. |
| 2 | `predict-curve` | prediction/slider | Bet | Limit intuition: as heads vanish (`p→0`), `E[HH]→∞`. | Predict a finite limit. | Expected time stays bounded. | Pick-the-curve / sketch a slider. |
| 3 | `param-sim` | coinSim (p-slider) | Explore | The automaton *structure* is unchanged; only edge weights change. | Expect new states to appear when biased. | A biased coin changes the states. | Existing state graph + a `p` slider. |
| 4 | `weighted-edges` | stateTap-like | Model | Advance edges carry `p` (on H); reset/self-loop carry `1−p` (on T). | Put `p` on the tail edges. | `p` attaches to outcomes uniformly. | Tap `p`/`1−p` onto each of the 4 edges. **Faded: `maxHintLevel: 2`.** |
| 5 | `biased-tiles` | equationTiles | Model | The parameterized recurrence: `E0=1+pE1+(1−p)E0`, etc. | Swap `p`↔`1−p` (put `1−p` on advance). | Either weight can sit anywhere. | Existing tiles incl. `p`,`1-p` tokens. **Faded: `maxHintLevel: 2`.** |
| 6 | `solve-symbolic` | substitution | Model | Solve to `E[HH]=(1+p)/p²` (and `E[HT]=1/(p(1−p))`). | Choose-the-step; mis-order substitutions. | Algebra with a parameter is intractable. | Tap-to-substitute, choose-the-step. |
| 7 | `sensitivity-curve` | theorySimChart→**BiasChart** | Prove | Both curves vs `p`; they **cross**. | Hunt for where `HH` overtakes `HT`. | `HH` is always slower than `HT`. | Existing `BiasChart` (already built). |
| 8 | `crossing-predict` | slider | Model | The equality point is the golden ratio `p=(√5−1)/2≈0.618`. | Drag to find equality; overshoot. | Crossing is at `p=0.5`. | Slider with live equality feedback. |
| 9 | `extreme-limits` | prediction | Prove | Asymptotics: `p→0 ⇒ E[HH]→∞`; `p→1 ⇒ E[HT]→∞`. | Tap a bounded limit. | Waits saturate at the extremes. | Tap limit behavior. |
| 10 | `theory-vs-sim` | theorySimChart | Prove | At a chosen biased `p`, simulation converges to the closed form. | — | Closed form ≠ simulation under bias. | Existing chart, theory at chosen `p`. |
| 11 | `recap` | recap | Prove | `½→p,1−p`; the crossing; the limits; the method is coin-agnostic. | — | — | Recap; tease L6 ("one line for all of this"). |
| E | `dice-sandbox` | coinSim *(Extension)* | off-rail | The method generalizes to a 3+ symbol alphabet (a die/spinner). | Free exploration; never graded. | Only binary coins work. | Multi-symbol sim (engine alphabet ext). |

**Scaffolding / transfer.** Faded on `weighted-edges` + `biased-tiles`.
`transferAttained = true` iff the biased recurrence is built and the crossing/
limits are found without reveal. The dice beat is an Extension (like the flagship
bias sandbox): never required, never sets `needsReview`, so the (non-tile-able)
`1/6`-style probabilities never block completion. Interleaving: `open-bet` makes
the learner compare `HH` vs `HT` *behavior*, not just values.

**Interactable widgets (summary).** prediction · coinSim (p-adjustable) ·
edge-weight tap · equationTiles (**reuses existing `p`/`1-p` tiles**) ·
substitution · **BiasChart (already built)** · slider · multi-symbol sim
(extension). **Engine:** `buildAutomaton(pattern, p)` already supports any `p`;
only the dice extension needs `buildAutomatonMulti(pattern, alphabetProbs)`
(Extension-only, behind a cut line).

**P1–P5 & cycle-1 avoidance.** P1: one promise (coin-agnostic method + sensitivity).
P2: the order-reversal and golden-ratio crossing are genuine discoveries; the
crossing hunt is an active search, not a passive watch. P3: `p`↔`1−p` swap is a
crisp, targetable mistake. P4: `BiasChart` already exists and fits perfectly. P5:
it generalizes rather than repeats L2 (different *coin*). Most buildable of the
three (one new engine entry point, gated to an extension).

**Misconceptions targeted.** bias rescales all waits equally · `HH` always slower
than `HT` · `p`↔`1−p` edge swap · waits bounded as `p→0/1` · "only binary works."

---

## Candidate 4 (cut / alternate) — Gambler's Ruin & First-Passage Walks  `lesson-gamblers-ruin`

**Why it's strong.** Classic quant staple; reuses first-step analysis + linear
solve; introduces **two absorbing barriers** on a position chain. Results:
`P(hit N before 0 | start k) = k/N`; expected duration `= k(N−k)` (fair); biased
uses the `(q/p)` ratio. Beat sketch (~10): bet on fair-walk symmetry → walk-sim →
boundary-condition stateTap → `P`-recurrence tiles (`P_k=½P_{k−1}+½P_{k+1}`) →
solve to `k/N` → duration recurrence → biased ratio reveal → sim → recap.

**Why I cut it from this slate.** Its core idea (probability of reaching one
absorber before another) **overlaps Penney's Game** at the concept level, so
shipping both violates "one new thing per lesson." Keep it as the **alternate**
(swap in for Penney's if the team prefers a random-walk thread over competing
patterns) or as a **future L7** after the slate. It pairs naturally with a later
coupon-collector lesson (`E=nH_n`) to form a second "expected-time" mini-arc.

---

## Recommended ordered slate of 3 + course-path narrative

### Ordered slate (unlock order)

| Order | lessonId | title | milestoneId | one-line core promise |
|---|---|---|---|---|
| L4 | `lesson-penneys-game` | Penney's Game: Who Gets There First? | `penneys-game-won` | Compute the probability one pattern beats another to first appearance — and find it's non-transitive. |
| L5 | `lesson-weighted-coins` | Weighted Coins & Dice: When the Coin Isn't Fair | `beyond-the-fair-coin` | The state method is coin-agnostic; bias can reverse which pattern is slower. |
| L6 | `lesson-martingale-shortcut` | The Martingale Shortcut: The Fair-Casino Trick | `martingale-shortcut` | A pattern's expected wait is `Σ 2^k` over its self-overlaps — one line, any pattern. |

- **courseId:** `course-pattern-hitting-times` (unchanged).
- **Unlock order:** `lesson-states-streaks → lesson-pattern-hitting-times →
  lesson-longer-patterns → lesson-penneys-game → lesson-weighted-coins →
  lesson-martingale-shortcut`. Set `unlocks` on L3 to `lesson-penneys-game`, L4→
  L5, L5→L6, L6→`null`.
- **Course-completion milestone:** add `all-patterns-mastered` on finishing all
  six (the existing `three-lessons-complete` can remain as the mid-course mark).
- **`patternOptions`:** L4 `["HH","HT","HHH","THH"]` (compare/race set); L5
  `["HH","HT"]`; L6 `["HH","HT","THH","HTH","HHH"]` (retrieval/transfer set).
- **Roadmap after the slate:** promote `lesson-gamblers-ruin` and a
  `lesson-coupon-collector` to the visible-but-locked roadmap.

### Course-path narrative (one paragraph)

*States & Streaks* turns a probability question into a tiny machine of states
(`E[H]=2`). *Pattern Hitting Times* reveals that **overlap is memory**: `HH`
waits longer than `HT` (6 vs 4) because a near-miss for `HH` throws progress
away. *Longer Patterns & Overlap* proves the method transfers (`THH=8`,
`HTH=10`) with the hints faded. Then the path deepens by **changing one variable
at a time**: *Penney's Game* changes the **question** from "how long" to "who's
first," exposing that `HH` and `HT` actually *tie* despite 6≠4, and that "who
wins" is non-transitive — there is no best pattern. *Weighted Coins & Dice*
changes the **coin**, turning `1/2` into `p` and `1−p`, where bias can even
*reverse* which pattern is slower (they cross at the golden ratio). Finally,
*The Martingale Shortcut* changes the **method**: a fair-casino argument collapses
every wait into a single line — the sum of `2^k` over a pattern's self-overlaps —
reproducing `6, 4, 8, 10` and predicting new ones (`HHH=14`) in seconds. The
learner leaves able to **model, solve, generalize, and shortcut**: precisely the
toolkit a quant interview probes.

### Reuse map (what's free vs. new)

- **Reused as-is:** prediction, stateTap, equationTiles (incl. `p`/`1-p` tiles),
  substitution (choose-the-step variant from cycle-1), theorySimChart, recap,
  `BiasChart`, `buildAutomaton`, `solveLinearSystem`, `flipsToAbsorption`.
- **New engine (pure, golden-testable):** `buildRaceAutomaton(a,b,p)` +
  absorption-probability solve (L4); `conwayLeadingNumbers(a,b,q)` (L4);
  `autocorrelation(pattern,q)` (L6, cross-checked against `expectedTimes`);
  `buildAutomatonMulti` (L5 dice, extension-only).
- **New widgets:** `raceSim`, `overlapSlide` (shared L4/L6), `oddsLoop` (L4),
  `sumTiles` + `bettingLadder` (L6), edge-weight tap (L5). All feasible with
  React + Konva + a deterministic engine; none need AI.
- **Authoring caveat (flag):** `equationDiagnosis.ts` per-slot hint copy is
  hardwired to the `HH` `{E0,E2}` target. The L4 win-probability tiles and L5
  biased tiles need either a generalized diagnosis table or a fall-back to the
  coarser row-level `equationChecker.ts`. Budget this; don't let HH-specific
  copy leak into new lessons.

---

## Cut lines (which beats survive if a lesson must shrink)

Each survivor set keeps a complete Bet→Explore→Model→Prove arc with at least one
graded struggle beat and the lesson's signature insight; all reuse existing
interaction types so they're build-cheap.

- **L4 Penney's (11 → 7 required):** keep `open-bet`, `race-sim`,
  `pick-your-counter` (the high-agency core), `win-prob-tiles`, `solve-the-odds`,
  `non-transitive-loop` (the wow), `recap`. Drop `first-step-split`, `race-sim-3`,
  `new-contender`, `conway-shortcut` (fold the leading-number idea into the loop
  reveal's explanation).
- **L5 Weighted (11 → 8 required + drop extension):** keep `open-bet`,
  `param-sim`, `biased-tiles`, `solve-symbolic`, `sensitivity-curve` (BiasChart),
  `crossing-predict`, `theory-vs-sim`, `recap`. Drop `predict-curve`,
  `weighted-edges` (fold into tiles), `extreme-limits` (fold into recap), and the
  `dice-sandbox` extension first of all.
- **L6 Martingale (11 → 7 required):** keep `recall-grid`, `self-overlap`,
  `sum-it`, `casino-intuition` (the *why*), `apply-HTH` (the harder transfer with
  the k=1 trap), `surprise-pattern` (`HHH=14`), `recap`. Drop `overlap-to-power`
  (fold into `sum-it`), `apply-THH` (keep only the harder `HTH`), `cross-check`
  (the surprise already validates), `biased-generalize` (extension).

If the whole slate must shrink to fit a gate, ship **L4 Penney's alone** first —
it is the strongest standalone deepening, reuses the most existing widgets, and
fixes both open cycle-1 findings by construction.
