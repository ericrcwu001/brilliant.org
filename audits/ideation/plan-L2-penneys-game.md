# L2 — Penney's Game — Full Plan

**Lesson ID:** `lesson-penneys-game`  
**Course:** `course-pattern-hitting-times` (L2 of 6)  
**Milestone:** `penneys-game-won` → unlocks `lesson-gamblers-ruin`  
**Pattern universe:** eight length-3 words `{HHH, HHT, HTH, HTT, THH, THT, TTH, TTT}`; opener callback uses `{HH, HT}`  
**Authoring agent:** Agent 1 of 5 (quant canon + full beat/widget/engine plan)

---

## Research & sources

| Topic | Source | Use in lesson |
|-------|--------|---------------|
| Penney-Ante problem (1969) | Walter Penney, *J. Recreational Math.*, Problem 95 (1969) | Origin story; second-mover edge |
| Popular exposition | Martin Gardner, "Mathematical Games," *Scientific American* (Oct 1974) | Hook copy; classroom credibility |
| Conway leading numbers + worked odds | Y. Nishiyama, "Pattern matching probabilities and paradoxes," *IJPAM* 59(3) (2010); [plus.maths.org Penney feature](https://plus.maths.org/os/issue55/features/nishiyama/index) | `conwayLeadingNumbers`, AutocorrelationRuler, `7:1` headline |
| Formal odds formula | Integers paper (Colgate), Prop. 2.3 Conway algorithm: odds A over B = `(C(B,B)−C(B,A))/(C(A,A)−C(A,B))` | Engine golden tests; substitution beat target |
| Correlation polynomial | L. J. Guibas & A. M. Odlyzko, "String overlaps, pattern matching, and nontransitive games," *J. Combin. Theory A* 30 (1981), 183–208 | Cross-overlap as compact encoding; bridge to L4 |
| No-arbitrage derivation | "Penney's game odds from no-arbitrage," *Theory and Decision* (Springer, 2026) | Interview framing: overlap → betting chains → odds |
| Group-action / game length | arXiv:2009.06080 (*The Penney's Game with Group Action*) | Paradox beat (`THTH` vs `HTHH`); optional Extension note |
| HH vs HT race fairness | UW Math Circle Penney notes; Cambridge MLG Penney Ante slides | Opener tie despite `E=6` vs `4` |
| Quant interview canon | Zhou, *Green Book* Ch. 4–5; Crack, *Heard on the Street*; Mosteller #35-style runs; Joshi Markov drills | Interview relevance section |
| Engine cross-check | Repo `buildAutomaton` golden values: `E[HH]=6`, `E[HT]=4`, `E[THH]=8`, `E[HTH]=10`, `E[HHH]=14`, `E[HHT]=8` | Paradox beats; never hardcode in copy |

**Second-player rule (length 3, fair coin):** if Player A picks `a₁a₂a₃`, Player B's optimal response is **`B = (¬a₂) a₁ a₂`** (flip the middle bit, prepend to first two, drop the last). Examples: `HHH→THH`, `HHT→THH`, `HTH→HHT`, `HTT→HHT`, `THH→TTH`, `THT→TTH`, `TTH→HTT`, `TTT→HTT`.

---

## Core learning promise (one sentence)

**Model two patterns racing on one shared coin stream as a single chain with two absorbing outcomes; "who appears first" is decoupled from "how long you wait," the beats relation is non-transitive, and the second mover always has a winning counter.**

---

## Quant interview relevance

| Interview pattern | How this lesson answers it |
|-------------------|----------------------------|
| **"HH takes 6 flips, HT takes 4 — who wins if they race?"** (Green Book / street brainteaser follow-on) | Opener trap: tie at ½ each; teaches *question type* matters |
| **Penney's game / Penney-Ante** (classic trading-desk puzzle) | Full lesson spine; `7/8` headline is a standard "gotcha" |
| **"Pick second and win"** | Second-mover rule `B=(¬a₂)a₁a₂`; no global best pattern |
| **Absorption probability vs expected duration** | Same graph, different recurrence: win-prob has **no `1+`**, boundary **1/0** not **0** |
| **Non-transitivity / rock-paper-scissors** | DominanceWheel + TournamentHeatmap; `THH≻HHT≻HTT` but `THH⊁HTT` |
| **Overlap / autocorrelation** (Heard on the Street waiting-time drills) | Cross-overlap sets race odds; previews L4 `Σ2^L` without teaching it |
| **Martingale / no-arbitrage** (optional Extension beat) | Odds from fair betting chains (Springer 2026); bridge to L4 martingale |
| **Simulation sanity check** | MC win-rate must match exact rational odds within tolerance |

**What interviewers probe:** Can you resist "rarer/slower pattern wins"? Can you set up competing absorbing states? Do you reflexively add `1+` to a probability equation?

---

## Math reference (worked examples with numbers)

### A. Opener callback — `HH` vs `HT` on one stream

| Quantity | Value | Reason |
|----------|-------|--------|
| `E[HH]` | **6** | L1 engine golden |
| `E[HT]` | **4** | L1 engine golden |
| `P(HH first)` | **½** | Both need an `H` first; next flip is `H`→HH wins, `T`→HT wins |
| `P(HT first)` | **½** | Symmetric one-flip decider after first `H` |

**Struggle path:** pick HT "because 4 < 6" → empirical tally stays ~50/50.

### B. Headline duel — `A=HHH`, `B=THH`

**Elementary argument (Nishiyama):** `HHH` wins only if the stream begins `HHH` (probability `1/8`). Otherwise `THH` appears first (e.g. any `THH` substring, or `HH` then `T` before third `H`). So `P(THH first) = 7/8`, odds **7:1** for B.

**Conway leading numbers** (binary overlap index of suffixes of upper pattern against prefixes of lower):

| Pair | Alignment bits | Decimal |
|------|----------------|---------|
| `AA` (HHH over HHH) | `111` | **7** |
| `AB` (HHH over THH) | `000` | **0** |
| `BB` (THH over THH) | `100` | **4** |
| `BA` (THH over HHH) | `011` | **3** |

Odds B≻A = `(AA−AB):(BB−BA) = (7−0):(4−3) = 7:1` ⇒ `P(A first)=1/8`, `P(B first)=7/8`.

### C. Win-probability recurrence (combined race chain)

For each non-absorbing state `s`, let `w_s = P(A wins first | s)`.

\[
w_s = \sum_{c \in \{H,T\}} P(c)\, w_{\delta(s,c)}
\]

**Boundaries:** `w_{A\text{-absorb}} = 1`, `w_{B\text{-absorb}} = 0`. **No `1+` term** — this is the muscle-memory trap after three lessons of duration recurrences.

**Tiny worked chain — `HH` vs `HT`:** After first `H` (state "one H matched"), `w = ½·1 + ½·0 = ½`. Confirms tie.

**`HHH` vs `THH`:** Merged KMP product has ≤7 transient states for length-3 patterns *(review: verified — the actual max is **5** transient states across all 56 ordered length-3 pairs, and `HHH` vs `THH` is exactly 5: `{(0,0),(1,0),(0,1),(2,0),(1,2)}`)*; solve linear system → `w_{E0} = 1/8` for A (`HHH`).

### D. Expected game length (secondary; not a Required beat)

\(g_s = 1 + \sum_c P(c)\, g_{\delta(s,c)}\), both absorbing `g=0`. For `HHH` vs `THH`, literature gives mean flips ≈ **8** (shorter than `E[HHH]=14` because the race ends when *either* pattern hits).

### E. Full length-3 counter table (Player A → optimal B → B's odds)

| A (1st) | B (2nd, optimal) | Odds for B | `P(B first)` |
|---------|------------------|------------|--------------|
| HHH | THH | 7:1 | 7/8 |
| HHT | THH | 3:1 | 3/4 |
| HTH | HHT | 2:1 | 2/3 |
| HTT | HHT | 2:1 | 2/3 |
| THH | TTH | 2:1 | 2/3 |
| THT | TTH | 2:1 | 2/3 |
| TTH | HTT | 3:1 | 3/4 |
| TTT | HTT | 7:1 | 7/8 |

### F. Non-transitivity (sourced)

- `THH` beats `HHT` (3:1), `HHT` beats `HTT` *(review: this is **2:1** / P=2/3, **not** 3:1)*, but `THH` does **not** beat `HTT` *(review: `THH` vs `HTT` is an exact **1:1 TIE** (P=½), not a 2:1 loss; `TTH` is indeed the beater for `THH`)*.
- *(review: there is **NO** strict 3-cycle among the 8 length-3 words — verified by exhaustive search, 0 found. The shortest non-transitive loop is the **4-cycle** `THH ≻ HHT ≻ HTT ≻ TTH ≻ THH` with edge odds 3:1, 2:1, 3:1, 2:1. Use this 4-cycle for the DominanceWheel, not a 3-cycle.)*
- Directed "beats" graph on 8 nodes has **no maximum** — every pattern has a predator *(review: verified — `HHH` and `TTT` beat **nobody** strictly; every node has ≥1 strict predator)*.

### G. Paradox pairs (wait ≠ race strength)

| Matchup | `E[wait]` A | `E[wait]` B | Race odds | Lesson point |
|---------|-------------|-------------|-----------|--------------|
| `HHH` vs `HHT` | 14 | 8 | **1:1** (½ each) | Longer wait does not imply race win |
| `THTH` vs `HTHH` (length 4 Extension) | 20 | 18 | **9:5** for `THTH` (`P≈9/14`) | Longer wait can still win the race |

**Why `HHH` vs `HHT` ties:** Both require `HH` before deciding; the third flip is `H`→`HHH`, `T`→`HHT` with equal probability.

### H. Guibas–Odlyzko correlation (engine hook)

For patterns `X`, `Y` of length `m`, correlation `XY` is a binary string of length `m`: bit `i` is 1 iff suffix of `X` starting at position `i` matches prefix of `Y` of the same length. Conway leading number = interpret correlation as base-2 integer. Correlation polynomial: `XY(z) = \sum_i bit_i \cdot z^i`.

---

## Engine contract

New module: `src/engine/race.ts` — pure, dependency-free, exact-rational, golden-tested (mirrors `automaton.ts`).

### Types (extend `src/engine/types.ts`)

```ts
export type RaceOutcome = 'A' | 'B'

export type RaceAutomaton = {
  patternA: string
  patternB: string
  p: number
  states: AutomatonState[]           // merged progress labels, e.g. "H|∅", "HH|T"
  transitions: Transition[]
  /** Win-probability recurrences: constant MUST be 0; tile-check targets */
  winRecurrences: Record<StateId, WinRecurrence>
  winProbabilities: Record<StateId, number>  // w_s, A-first prob
  /** Optional: expected race length recurrences (constant 1+) for Extension */
  lengthRecurrences?: Record<StateId, CanonicalRecurrence>
  expectedLengths?: Record<StateId, number>
  absorbingA: StateId
  absorbingB: StateId
  substitutionSteps: SubstitutionStep[]  // for win-prob guided solve
}

export type WinRecurrence = {
  lhs: StateId
  constant: 0
  terms: Array<{ coeff: Rational; var: StateId }>
}
```

### Functions

| Function | Signature | Contract |
|----------|-----------|----------|
| `buildRaceAutomaton` | `(a, b, p) => RaceAutomaton` | Build merged-KMP **product** chain: state = paired progress on both patterns on the **same** stream. Cap pattern length ≤3 (≤5 transient states; *review: verified max 5, at `HHH` vs `THH`*). Two absorbers: A matched, B matched. Solve `w` via existing `solveLinearSystem` with boundary `w_A=1`, `w_B=0`, **no +1**. Reuse `prefixFunction` / `nextState` from `automaton.ts`. |
| `conwayLeadingNumbers` | `(a, b, q?) => { AA, AB, BB, BA }` | `q` default 2 (binary). Each value = correlation interpreted in base `q`. Bits from sliding `b` under `a` (Guibas–Odlyzko definition). |
| `correlation` | `(v, w) => { bits: number[]; cln: number; overlaps: number[] }` | Raw bit vector + Conway leading number + overlap lengths (shared with L4 AutocorrelationRuler). |
| `penneyOdds` | `(a, b) => { aBeatsB: Rational; bBeatsA: Rational }` | Returns odds **in favor of B** as rationals: `(AA−AB):(BB−BA)` reduced. `penneyOdds('HHH','THH').bBeatsA` = `{n:7,d:1}`. |
| `penneyProb` | `(a, b) => { pAFirst: Rational; pBFirst: Rational }` | `pAFirst = (BB−BA)/((AA−AB)+(BB−BA))` etc. |
| `bestBeater` | `(a: string) => string` | For length 3: `(¬a[1]) + a[0] + a[1]`. |
| `simulateRace` | `(a, b, p, rng) => RaceOutcome` | One shared stream; two KMP trackers; return first match. Deterministic given `rng`. |
| `simulateRaces` | `(a, b, p, n, rng) => { aWins, bWins }` | Batch helper for widgets. |
| `winMatrix` | `(patterns: string[], p) => Rational[][]` | `M[i][j] = P(patterns[i] first vs patterns[j])`. Powers TournamentHeatmap + DominanceWheel. |

### Golden tests (`src/engine/race.test.ts`)

```ts
// Odds
penneyOdds('HHH','THH') → bBeatsA = 7:1, pBFirst = 7/8
penneyOdds('HH','HT') → 1:1 each

// Win prob from automaton agrees with Conway
buildRaceAutomaton('HHH','THH',0.5).winProbabilities.E0 === 1/8

// MC (mulberry32, n=20000, seed pinned)
simulateRaces('HHH','THH',0.5,20000,rng).bWins/n ≈ 0.875 ± 0.02

// Paradox
penneyProb('HHH','HHT').pAFirst === 1/2
penneyProb('THTH','HTHH').pAFirst === 9/14  // length-4 Extension

// bestBeater
bestBeater('HHH') === 'THH'

// Non-transitivity spot check  (review: original three assertions had inverted
// signs / a wrong value; corrected below against the exact engine + Conway)
penneyProb('THH','HHT').pAFirst === 3/4   // THH BEATS HHT (3:1)
penneyProb('HHT','HTT').pAFirst === 2/3   // HHT BEATS HTT (2:1, NOT 3:1)
penneyProb('THH','HTT').pAFirst === 1/2   // THH only TIES HTT — loop must close
                                          // via the 4-cycle THH≻HHT≻HTT≻TTH≻THH
```

### Schema additions (`src/content/schema.ts`)

```ts
| { type: 'raceSim'; mode: 'single' | 'batch'; patternA: string; patternB: string; batchSize?: number }
| { type: 'autocorrelationRuler'; mode: 'cross' | 'self'; patternA: string; patternB?: string }
| { type: 'dominanceWheel'; patterns: string[] }
| { type: 'oddsDial'; patternA: string; patternB: string }  // optional thin hero
| { type: 'tournamentHeatmap'; patterns: string[] }
```

**Authoring caveat:** Generalize `equationDiagnosis.ts` for win-prob tile rows (constant 0, boundary 1/0) — do not leak HH `E0` duration copy.

---

## Beat-by-beat table (12 beats)

| # | beatId | phase | prompt (short) | interaction | widget detail | struggle / wrong-path | misconception | CTA |
|---|--------|-------|----------------|-------------|---------------|----------------------|---------------|-----|
| 1 | `open-bet` | Bet | You proved `E[HH]=6` but `E[HT]=4`. On **one** shared stream until HH or HT appears, who shows up first more often? | `prediction` | DOM radiogroup: "HT wins more", "HH wins more", "Tie — 50/50 each". Stores `initialRacePrediction`. | Pick HT because 4<6 | Faster expected wait ⇒ wins race | `Continue` after selection |
| 2 | `race-the-tie` | Explore | Run the HH vs HT duel. Watch the tally — does "faster wait" pull ahead? | `raceSim` **RaceTrack** | **RaceTrack** large: dual lanes (HH top, HT bottom), shared **CoinStream** ribbon. `Flip` / `Run 200 races`. Two converging bars + tally "HH · HT". Reduced-motion: instant final split. `aria-live`: "HH wins" / "HT wins". | Expect HT bar to dominate; tally hovers ~100:100 | Duration expertise transfers to race odds | `Flip` → gate ≥3 flips → `Run 200` → `Continue` |
| 3 | `first-step-split` | Model | After one `H` is on the board, one flip decides the race. Tap what happens on `H` vs `T`. | `stateTap` | Konva **RaceTrack** mini-graph: single shared state "one H" with two exits — tap edge on `H` (HH wins) vs `T` (HT wins). Graded vs `buildRaceAutomaton('HH','HT')`. Overlap edges from L1 `StateGraph` geometry. | Tap intermediate ∅ states; think multiple flips needed | Race can end before either pattern's solo wait time | `Check` → `Continue` |
| 4 | `new-contender` | Bet | Opponent locks `HHH`. You pick **second**. Can you guarantee an edge? | `prediction` | Options: "No — symmetric", "Yes — second mover can always counter", "Yes — pick `HHT` (shorter wait)". Trap: shorter-wait `HHT`. | "Pick `HHT` because E=8 vs 14" | Stronger/rarer pattern wins | `Continue` |
| 5 | `pick-your-counter` | Model | Choose your length-3 counter to beat `HHH`. We'll grade the **odds**, not your gut. | `patternPick` **graded** | 8 cards (length-3 alphabet). Engine: `penneyProb('HHH', pick).pBFirst`. Pass iff `bestBeater('HHH')` (=THH) or any pick with `P≥7/8`. **OddsDial** small preview updates on hover/tap. `maxHintLevel: 2`. | Pick `HHT` → odds check shows ~½ not 7:1 | Pick by own pattern strength, not cross-overlap | `Check` |
| 6 | `race-the-counter` | Prove | Race `THH` vs `HHH` — watch 7:1 emerge. | `raceSim` **RaceTrack** + **OddsDial** | Batch 200–500 races. **OddsDial** needle swings from 1:1 toward **7:1**; stacked outcome columns fill chip-by-chip. Theory line at `7/8`. Wrong prior prediction flagged on recap strip. | Early noise → "just luck"; call batch at n=20 | Small sample = truth | `Run 500 races` → `Continue` |
| 7 | `win-prob-tiles` | Model | Build the **win-probability** equation for the start state — same machine, new question. | `equationTiles` | Rows: `w_E0 = ½ w_{...} + ½ w_{...}` (engine `winRecurrences`). **No `1+`**, no `w=1` on B-absorber row. Prefilled absorbing row `w_A=1`, `w_B=0` (display labels `w_HHH`, `w_THH` optional). `maxHintLevel: 2`. | Reflexively add `1+` or `w=0` on A-absorber | Duration recurrence habits (`1+`, boundary 0) | `Check` |
| 8 | `solve-the-odds` | Model | Tap through substitutions to solve for `P(HHH first)`. | `substitution` | Steps from `buildRaceAutomaton('HHH','THH').substitutionSteps`; target **1/8**. Choose-the-step (not auto-reveal). Cut line: single "Show algebra". | Mis-order substitutions; carry duration algebra | Same solve as E[T] with same boundaries | `Substitute` / `Continue` |
| 9 | `conway-aligner` | Model | Conway's shortcut: slide `HHH` over `THH` and read the overlap numbers. | `autocorrelationRuler` **cross** | DOM mono rows 44px cells; ◀▶ shift; tap column same/diff. Builds `AA,AB,BB,BA`; live odds fraction `(AA−AB):(BB−BA)`. 3-step ladder per wrong bit. | Miss shifted match at `BA=011` | Odds are opaque without overlap picture | `Check` each register complete |
| 10 | `paradox-duel` | Prove | `HHH` waits longer than `HHT` — so `HHH` should win the race, right? | `raceSim` + `prediction` | Toggle matchups: **`HHH` vs `HHT`** (tie) and **`THTH` vs `HTHH`** (Extension, 9:14). **TournamentHeatmap** cell flashes. Pre-prediction per toggle. | Predict `HHH` dominates `HHT` | Longer wait ⇒ race winner | `Check` prediction then `Run races` |
| 11 | `non-transitive-loop` | Prove | Find a pattern that beats your pick — then one that beats *that*. | `dominanceWheel` | Konva ring of 8 length-3 words; tap node → green out-arrows (beats), red in-arrows (predators). Mini-quiz: "Tap a beater for `HTT`" → grade vs `winMatrix`. **TournamentHeatmap** 8×8 fills in background. | Hunt "best" pattern; each pick gets predator shown | Transitive dominance; global maximum exists | `Check` quiz → `Continue` |
| 12 | `recap` | Prove | Retrieve: race ≠ wait; P-recurrence; Conway odds; no best pattern. | `recap` | Retrieval chips before reveal: second-mover rule, `(AA−AB):(BB−BA)`, HH/HT tie. Belief update: opening bet vs final. Milestone stamp `penneys-game-won`. Bridge: "Next — same machine on a number line (Gambler's Ruin)." | — | — | `Finish lesson` |

**Required beats:** 1–11 except none optional; beat 10 may drop length-4 toggle on cut line. Beat 12 always Required.

**Extension (not Required, not in cut line):** `bias-race` — reuse `BiasChart`: drag `p`, watch `penneyProb(HHH,THH)` flip for extreme bias; never sets `needsReview`.

---

## Interactable widgets catalog (reused + new)

### New widgets

| Widget | Size | Manipulate | Visual response | Feedback loop | Build notes |
|--------|------|------------|-----------------|---------------|-------------|
| **RaceTrack / PatternDuel** | large | `Flip`; `Run N races`; swap A/B patterns (where allowed) | Dual KMP lanes advance/reset on shared stream; winner flash; tally bars converge | Wrong winner prediction → ladder points at cross-overlap (`AB` vs `BA`) | Konva lanes + DOM `CoinStream`; `simulateRace`; reduced-motion: final bars only |
| **OddsDial** | small | Passive (driven by batch) or scrub matchup | Gauge needle 0–100% or ratio ring; settles on rational odds | n<50: "keep racing" note | Konva arc; `aria-live` "7 to 1"; static in reduced-motion |
| **AutocorrelationRuler** | small | ◀▶ shift; tap same/diff per column | Green overlap columns; binary register; odds fraction updates | Wrong bit → 3-step ladder | DOM 44px grid; `correlation()`; shared with L4 self-mode |
| **DominanceWheel** | large | Tap node; trace cycle; quiz beater | Directed arrows; cycle highlight `--mark` | Quiz graded vs `winMatrix` | Konva radial `StateGraph` primitives |
| **TournamentHeatmap** | medium | Tap cell; hover preview odds | 8×8 grid color = `P(row first)`; non-transitive loop overlay | Cell quiz optional | Konva grid; pure `winMatrix` |

### Reused widgets (retargeted)

| Widget | L2 use | Motion / a11y |
|--------|--------|---------------|
| `prediction` | open-bet, new-contender, paradox pre-bet | DOM chips; neutral until graded beat |
| `patternPick` | pick-your-counter (**graded**) | 44px cards; engine odds check |
| `stateTap` | first-step-split | Konva edges; overlap highlight at L2 |
| `equationTiles` | win-prob-tiles (**P-targets**, not E-targets) | Tap-to-place; generalized diagnosis |
| `substitution` | solve-the-odds | Tap-to-advance; cut-line reveal |
| `theorySimChart` | optional win-rate variant on race-the-counter | Empirical win% line vs Conway |
| `BiasChart` | Extension bias-race | Drag `p`; exploratory |
| `recap` | finale | Retrieval-first |

**Tap-only:** all actions are buttons/chips; no drag required. **Reduced-motion:** races resolve to final tally; no lane travel, no needle animation, no swarm.

---

## Signature visual moments

1. **The tie that defies wait times (beats 2–3):** Hundreds of shared-stream races; HH and HT tally bars stay neck-and-neck while copy reminds `6 ≠ 4`. The one-flip decider at "one H" is tapped on the graph.

2. **7:1 emergence (beat 6):** RaceTrack swarm + **OddsDial** needle sweeps from noise to **7:1**; THH column stacks 7 chips for every 1 HHH — learner *watches* the second-mover steal.

3. **Conway aligner → closed odds (beat 9):** Sliding `HHH` over `THH`, `BA=011` lights green; fraction `(7−0):(4−3)` snaps — overlap becomes arithmetic.

4. **Paradox toggle (beat 10):** Heatmap cell `HHH–HHT` shows 50/50 gold split despite `14 vs 8` wait labels; `THTH–HTHH` shows longer-wait pattern leading.

5. **Non-transitive loop (beat 11):** DominanceWheel traces a directed cycle; TournamentHeatmap fills so "no best pattern" is a picture, not a lemma.

---

## Scaffolding & transferAttained

| Mechanism | Setting |
|-----------|---------|
| Faded hints | `maxHintLevel: 2` on `pick-your-counter`, `win-prob-tiles` (no level-3 reveal) |
| Prefilled rows | Absorbing win-prob boundaries; E0 duration row **not** shown |
| L1 callbacks | Explicit `6 vs 4` in open-bet; reuse `StateGraph` edge vocabulary |
| Engine labels | Win states labeled by pattern matched, not just `E2` |
| `transferAttained` | Cloud Function on lesson complete: **`true` iff** learner (a) picks winning counter for `HHH` (`THH` or `P≥7/8`) on `pick-your-counter` **without** hitting hint cap, AND (b) completes `win-prob-tiles` without hitting hint cap. Does **not** gate unlock. |
| `needsReview` | Reveal or ≥3 wrong on any Required beat (standard rule) |
| Spaced retrieval | Recap + course-path chip: second-mover rule, Conway fraction |

**Prerequisite mastery from L1:** states, transitions, first-step **duration** recurrence, simulation vs theory. **New muscle:** probability recurrence boundaries; cross-overlap.

---

## Cut line

If schedule slips, compress to **≤8 Required beats**:

| Keep | Drop or collapse |
|------|------------------|
| `open-bet` | `first-step-split` (fold explanation into race-the-tie copy) |
| `race-the-counter` (7:1 hero) | `race-the-tie` OR merge with open-bet |
| `pick-your-counter` (graded, capped hints) | `paradox-duel` (length-4) |
| `win-prob-tiles` OR `conway-aligner` (pick one path) | `solve-the-odds` → single "Show algebra" on one row |
| `non-transitive-loop` (DominanceWheel quiz only, no full heatmap) | `tournamentHeatmap` fill animation |
| `recap` | Extension `bias-race` |

Minimum viable wow: **one batch race to 7:1 + DominanceWheel cycle + Conway fraction**.

---

## Golden tests

| Layer | Test |
|-------|------|
| `conwayLeadingNumbers('HHH','THH')` | `{AA:7, AB:0, BB:4, BA:3}` |
| `penneyOdds('HHH','THH').bBeatsA` | `{n:7,d:1}` |
| `buildRaceAutomaton('HH','HT',0.5).winProbabilities.E0` | `0.5` |
| `buildRaceAutomaton('HHH','THH',0.5).winProbabilities.E0` | `0.125` |
| `penneyProb('HHH','HHT').pAFirst` | `1/2` |
| `bestBeater('HHH')` | `'THH'` |
| `winMatrix` on 8 length-3 words | Matches table in §Math D |
| `simulateRaces` MC | Within tolerance vs exact for pinned seed |
| Fixture validation | `lesson-penneys-game.json` Zod-valid; win tile targets match engine |
| Cross-engine | `expectedWaitFair` not used here; `buildAutomaton` E values only in paradox copy |

---

## Fixture skeleton (for implementer)

```json
{
  "lessonId": "lesson-penneys-game",
  "courseId": "course-pattern-hitting-times",
  "title": "Penney's Game: Who Gets There First?",
  "patternOptions": ["HHH","HHT","HTH","HTT","THH","THT","TTH","TTT"],
  "milestoneId": "penneys-game-won",
  "unlocks": "lesson-gamblers-ruin",
  "schemaVersion": 1,
  "beats": [ /* 12 beats per table above */ ]
}
```

**Milestone copy:** "Penney's Game Won — you can counter any pattern and read Conway odds."

---

## Implementation notes

- **Merged state count:** For length-3 vs length-3, product chain ≤ 7 transient states; mobile-safe.
- **StateGraph layout:** Light DAG layout option or fixed column order from engine `states[]`.
- **Win-prob equation tiles:** Bank uses `w` prefix or reuse `E` slots with beat-local labels — pick one convention in schema; checker reads `winRecurrences`.
- **Analytics:** `prediction_set` on race bets; `simulation_run` with `{n, matchup}`; `derived.initialRacePrediction`, `derived.counterPick`, `derived.conwayOddsVerified`.
- **No AI:** All feedback from fixture + engine; hint ladder only.

---

*Plan complete. Next artifact: `fixtures/lesson-penneys-game.json` authored from this table.*

---

## Plan assessment (Opus 4.8 review)

**Verdict: Solid-with-fixes.** The quant canon is strong, the spine (race ≠ wait → second-mover counter → Conway shortcut → non-transitivity) is the right story, and the engine contract is mostly sound. Two math claims in §F are wrong, the non-transitive structure is a 4-cycle (not a 3-cycle), and the formalism cluster (beats 7–9) is over-scoped for a tap-only lesson. Fix those and it's strong.

### Verified-math table (independently computed: exact rational Markov solve + Conway + Monte Carlo)

All values below were recomputed from scratch (Gauss-Jordan over rationals on the merged product chain, Conway leading numbers, and a pinned-seed `mulberry32` MC). ✓ = plan is right; ✗ = plan is wrong (corrected inline above).

| Claim in plan | Computed value | ✓/✗ |
|---|---|---|
| `HH` vs `HT` shared-stream race | ½ : ½ (MC 0.4998/0.5002) | ✓ |
| `E[HH]=6, E[HT]=4, E[HHT]=8, E[THH]=8, E[HTH]=10, E[HHH]=14` | identical | ✓ |
| Conway `{AA,AB,BB,BA}` for `HHH/THH` | `{7,0,4,3}` | ✓ |
| `P(THH first)` vs `HHH` (odds B≻A) | **7/8** (7:1); exact `w_{E0}=1/8`; MC 0.876 | ✓ |
| `HHH` vs `HHT` paradox race | **½ tie** | ✓ |
| Full counter table §E (all 8 rows) | matches exactly | ✓ |
| Second-mover rule `B=(¬a₂)a₁a₂` (all 8) | matches exactly | ✓ |
| `THTH` vs `HTHH` (length-4 extension) | `P(THTH)=9/14`, odds **9:5** for `THTH`; 7 transient states | ✓ |
| `THH` beats `HHT` | 3/4 (3:1) | ✓ |
| **`HHT` beats `HTT` "(3:1)"** | **2/3 (2:1)** | ✗ |
| **`THH` "does not beat `HTT` (only 2:1)"** | **exact ½ TIE** | ✗ |
| **"non-transitive 3-cycle"** (implied by §F + DominanceWheel) | **no strict 3-cycle exists**; shortest loop = **4-cycle** `THH≻HHT≻HTT≻TTH≻THH` | ✗ |
| Golden tests, §F spot-check signs (3 assertions) | all three inverted/wrong | ✗ |
| "≤7 transient states for length-3" | true but loose — **actual max 5** | ✓* |

Full 8×8 `P(row beats col)` (for `winMatrix` golden + heatmap):

```
        HHH    HHT    HTH    HTT    THH    THT    TTH    TTT
HHH      -     1/2    2/5    2/5    1/8   5/12   3/10    1/2
HHT     1/2     -     2/3    2/3    1/4    5/8    1/2   7/10
HTH     3/5    1/3     -     1/2    1/2    1/2    3/8   7/12
HTT     3/5    1/3    1/2     -     1/2    1/2    3/4    7/8
THH     7/8    3/4    1/2    1/2     -     1/2    1/3    3/5
THT    7/12    3/8    1/2    1/2    1/2     -     1/3    3/5
TTH    7/10    1/2    5/8    1/4    2/3    2/3     -     1/2
TTT     1/2   3/10   5/12    1/8    2/5    2/5    1/2     -
```

### Pedagogy notes

- **The spine is right.** Predict-before-reveal on the opener tie, the 7:1 emergence, and "find a predator" are all desirable-difficulty, retrieval-friendly moments. The L1→L2 transfer ("same machine, new question: probability not duration; boundary 1/0 not 0; no `1+`") is genuinely good and worth protecting.
- **Beats 7–9 are the sag.** Three formalism beats in a row (build a 5-row win-prob system → tap a 5-step substitution → Conway aligner) is a wall of algebra in a tap-only UI right after the emotional peak (7:1). The 5-state system in particular is ~3× the tile load of L1's HH system (2 states) and its dependency graph is **cyclic** (not a clean back-substitution chain), so a "tap-through substitution" doesn't map cleanly.
- **Non-transitivity is the headline that's mathematically softest in the plan.** Because there's no 3-cycle, the "tap a beater, then a beater of that" loop only closes after **four** hops. That's still a great picture — but the copy and the DominanceWheel highlight must commit to the 4-cycle, and the quiz "tap a beater for `HTT`" has a **unique** answer (`HHT` only), so it should be graded as a single-correct quiz, while "tap a beater for `HHH`" has five valid answers.
- **`pick-your-counter` (beat 5) grading is narrower than it reads.** Only `THH` achieves `P≥7/8` vs `HHH`, so "best beater OR `P≥7/8`" collapses to "exactly `THH`." Decide deliberately: grade *optimal* (`THH` only) vs grade *any winning counter* (`P>½` → `THH/TTH/HTH/HTT/THT`). The lesson's promise is "the second mover can always counter," which argues for accepting any `P>½` as correct with `THH` flagged as *optimal*.

### Scope / cut-line

12 is ~2 beats too long; the fat is in 7–9. Recommended **8-beat** spine (keeps every "wow"):

1. `open-bet` (predict HH/HT tie) → 2. `race-the-tie` (RaceTrack; fold `first-step-split`'s one-flip-decider into the reveal) → 3. `win-prob-tiles` **retargeted to HH vs HT** (2 states, 1 graded row; teaches no-`1+`/boundary-1-0 cleanly and cheaply) → 4. `new-contender` (predict you can counter HHH) → 5. `pick-your-counter` (graded) → 6. `race-the-counter` (7:1 hero + OddsDial) → 7. `conway-aligner` (the single formalization of *odds*) → 8. `non-transitive-loop` (DominanceWheel 4-cycle) + recap stamp.

This moves the win-prob formalism to the **2-state tie** (where it's elegant) and lets `HHH vs THH = 1/8` be shown by **Conway + simulation**, not by building/solving a 5-state system. `solve-the-odds` (substitution) and the full `tournamentHeatmap` and the length-4 toggle become Extensions.

### Beat-by-beat flags

| Beat | Flag |
|---|---|
| 2 `race-the-tie` | Win-*rate* convergence needs a **linear [0,1]** chart; `SimChart` is hard-wired to a log wait-time axis (`yLo=2`, "flips") — not reusable verbatim. |
| 3 `first-step-split` | The "one H" state for HH vs HT is the **race** state `(1,1)` with **two different absorbers** — `StateGraph` is linear/single-absorber and can't draw it as-is. |
| 5 `pick-your-counter` | `PatternPickBeat` is currently **passive (ungraded)**; needs grading + feedback keyed by the *picked* pattern (not the lesson pattern). |
| 7 `win-prob-tiles` | 5-row system on `HHH/THH` is too heavy → retarget to HH/HT; also `equationDiagnosis.ts` hints are duration-framed ("flip cost") and hard-coded to `{E0,E2}`. |
| 8 `solve-the-odds` | 5-state chain is cyclic → not a clean tap-through substitution; demote to "Show algebra" reveal (Extension). |
| 9 `conway-aligner` | Strongest novel beat — promote to *the* formalization. |
| 11 `non-transitive-loop` | Must use the **4-cycle**; `winMatrix` quiz answer counts vary (1 for `HTT`, 5 for `HHH`). |

### Prioritized recommended changes

1. **Fix §F math + DominanceWheel to the 4-cycle** `THH≻HHT≻HTT≻TTH≻THH` (done inline; engine must back it).
2. **Retarget `win-prob-tiles` to HH vs HT** (2 states, 1 graded row); show `1/8` via Conway + sim, not a built 5-row system.
3. **Cut to ~8 beats**; demote `solve-the-odds`, full `tournamentHeatmap`, and the length-4 toggle to Extensions.
4. **Decide `pick-your-counter` grading** (optimal-only vs any `P>½`); wire grading + pick-keyed feedback into `PatternPickBeat`.
5. **Generalize the grader path** for win-prob rows (constant-free / boundary 1-0) — see Risks.

---

## Implementation in the tech stack

**Architecture decision (applies to every widget):** `BeatProps.automaton` is built once in `LessonPlayer` as `buildAutomaton(patternOptions[0], 0.5)` — a *single*-pattern automaton. There is **no** race automaton in scope. Rather than plumb one through `LessonPlayer`, **each new beat builds its race structures locally from the engine** using `patternA`/`patternB` carried in its own interaction schema — exactly how `StateTapBeat` imports `nextStateOf` and `TheorySimChartBeat` imports `flipsToAbsorption` today. This keeps `LessonPlayer` generic and the new variants self-contained. Race states use **flat `E{n}` ids** (so `StateIdSchema` `/^E\d+$/`, equation tiles, and substitution all keep working) plus a separate display `label` (e.g. `"H·∅"`).

### Per-widget design

#### RaceTrack / PatternDuel — *large* — effort: High, risk: Medium
- **Reuse:** `CoinStream.tsx` (DOM ribbon, already aria-live) for the shared stream; `theme.C` (`heads`/`tails` per lane); `useElementWidth`; `Konva.Animation` + `node.to()` for lane pulse/winner flash (gate on `reducedMotion`); engine `simulateRace`/`simulateRaces`.
- **Konva sketch:** `<Stage>` (`'use no memo'`) with two horizontal lane `Group`s. Each lane = N KMP-progress cells (`Rect`s) that fill on advance / clear on reset, driven by stepping both trackers over one shared stream. Bottom: two tally bars (`Rect` widths) that converge; winner lane flashes via `node.to({scaleY})`. **Batch mode:** drive a time-based rAF loop (copy `TheorySimChartBeat`'s `tick` discipline — mutate `sumRef`/`countRef`, batch `setState`, cancel on unmount) calling `simulateRace` per trial.
- **Win-rate convergence chart:** `SimChart` is **not** reusable here (log wait-time axis). Add a sibling `RateChart` (linear y∈[0,1], theory line at `7/8`, dashed prediction marker, live head bead + value chip) — copy `SimChart`'s structure, swap the y-scale to linear. *(This is the main net-new Konva work.)*
- **Reduced motion:** render final tally bars + final win-rate instantly; no lane travel, no flash.
- **a11y / tap-only:** buttons `Flip` / `Run 500 races`; `role="status"` aria-live mirrors "THH 437 · HHH 63 — THH leads ~7:1". No drag.

#### OddsDial — *small* — effort: Low–Med, risk: Low
- **Reuse:** `theme.C` (two arcs heads/tails), `FONT_MONO`, `Konva.Animation`/`node.to()` for needle sweep, `useElementWidth`.
- **Konva sketch:** a half-gauge `Arc` (0→1 or ratio), a needle `Line` rotated to the current win-rate; center value chip `"7 : 1"` / `"87.5%"`. Driven by the parent batch (passive) — **fold into RaceSimBeat via `showOdds`, not its own interaction variant.**
- **Reduced motion:** needle drawn at final angle instantly.
- **a11y:** `role="status"` "THH wins about 7 in 8 (7 to 1)."

#### AutocorrelationRuler — *small* — effort: Med, risk: Low–Med
- **Reuse:** mostly **DOM** (like `CoinStream`) — a mono grid of 44px cells; minimal/no Konva. Engine `correlation()`/`conwayLeadingNumbers()` for grading.
- **Sketch:** top row = pattern A fixed; bottom row = pattern B at a tappable shift offset (◀▶ buttons); per overlap column a `aria-pressed` toggle "match/no-match" → builds the binary register → live `(AA−AB):(BB−BA)` fraction. Grade each register against `correlation()`.
- **Reduced motion:** no slide; render each alignment statically on shift.
- **a11y / tap-only:** every column + shift control is a button; aria-live "overlap length 2 → bit set; register 011 = 3."

#### DominanceWheel — *large* — effort: Med–High, risk: Medium
- **Reuse:** `StateGraph`'s **primitives** (`Circle`, `Arrow`, `theme.C`, node pulse via `node.to()`, traveling-dash `Konva.Animation`) — but **not** its layout (`StateGraph` is linear `xOf`; the wheel is **polar**). Engine `winMatrix`/`bestBeater`.
- **Konva sketch:** 8 nodes on a circle; tap a node → draw green out-arrows to everyone it beats (`P>½`) and red in-arrows from its predators; highlight the **4-cycle** `THH≻HHT≻HTT≻TTH≻THH` as a directed loop in `C.mark`. Quiz: "Tap a beater for `HTT`" graded vs `winMatrix` column (`>½`).
- **Reduced motion:** static arrows, no dash animation.
- **a11y / tap-only:** each node a button; description "THH beats HHH, HHT, TTT; beaten by TTH." Quiz answer is single-correct for `HTT` (`HHT`), multi-correct for `HHH`.

#### TournamentHeatmap — *medium* — effort: Low (DOM) / Med (Konva), risk: Low
- **Recommendation: render as a DOM `<table>`**, not Konva — it's static colored cells + text, and a table is far more accessible than a Konva grid (no canvas a11y story). Cell background = scale over `winMatrix[i][j]` (`C.tailsTint`→`C.headsTint`), diagonal blank, tap a cell → odds readout. Overlay the 4-cycle with `--mark` borders.
- **Reuse:** `winMatrix` (pure), CSS tokens. **Fold into the DominanceWheel beat as a background**, or keep as a thin standalone variant only if a dedicated beat survives the cut.
- **Reduced motion / a11y:** inherently static; real `<th>`/`<td>` with text values = screen-reader friendly; tap-only.

### Schema & engine changes (consolidated)

**Recommend adding only 3 closed-union variants** (fold OddsDial + TournamentHeatmap into the beats above as presentational components — every variant added is a real change to `InteractionSchema`, `beats/index.tsx` dispatch, `validate-fixtures.ts`, and `loader`):

```ts
// src/content/schema.ts — append to the InteractionSchema discriminatedUnion
z.object({
  type: z.literal('raceSim'),
  matchups: z
    .array(z.object({ a: z.string(), b: z.string(), label: z.string().optional() }))
    .min(1),                                   // >1 enables the paradox toggle
  mode: z.enum(['single', 'batch']),           // single = flip-by-flip; batch = Run N
  batchSize: z.number().int().positive().optional(),  // default 500
  showOdds: z.boolean().optional(),            // mount OddsDial + theory line
  predictFirst: z.boolean().optional(),        // optional per-matchup pre-prediction
}),
z.object({
  type: z.literal('autocorrelationRuler'),
  mode: z.enum(['cross', 'self']),
  patternA: z.string(),
  patternB: z.string().optional(),             // required for 'cross'
}),
z.object({
  type: z.literal('dominanceWheel'),
  patterns: z.array(z.string()).min(3),
  quiz: z.object({ target: z.string(), prompt: z.string().optional() }).optional(),
  heatmap: z.boolean().optional(),             // render TournamentHeatmap behind the wheel
}),
```

*If a standalone OddsDial/Heatmap beat is kept after the cut, add `z.object({ type: z.literal('oddsDial'), patternA: z.string(), patternB: z.string() })` and `z.object({ type: z.literal('tournamentHeatmap'), patterns: z.array(z.string()).min(2) })` — but prefer the component-reuse path.*

**`patternPick` grading (beat 5):** schema unchanged (`{patterns, mode}`); add grading **in the beat**: compute `penneyProb(props.pattern /* =HHH opponent */, pick).pBFirst`, pass if `>½` (or `===7/8` if grading optimal). Resolve feedback by the **picked** pattern via `feedback.byPattern[pick]` (note `resolveFeedback` currently keys by the *lesson* pattern, so this beat needs its own lookup). Uses `useHintLadder` for needsReview like `StateTapBeat`.

**LessonState additions (`beats/types.ts`):**
```ts
initialRacePrediction?: string   // open-bet (HH/HT)
counterPrediction?: string       // new-contender
counterPick?: string             // pick-your-counter (the chosen pattern)
raceWinRate?: number             // batch P(B first) for the recap
conwayOddsVerified?: boolean     // conway-aligner completed correctly
```
**ProgressDerived additions (`schema.ts`, `.loose()` already):** mirror `counterPick`, `conwayOddsVerified`, `raceWinRate` for analytics + `transferAttained`.

**Engine — `src/engine/race.ts`** (pure, dependency-free, exact-rational). First **export** `solveLinearSystem`, `prefixFunction`, and `nextState` from `automaton.ts` (currently private) to avoid duplication:
```ts
export type RaceOutcome = 'A' | 'B'
export type WinRecurrence = { lhs: StateId; constant: 0; terms: Array<{ coeff: Rational; var: StateId }> }
export type RaceAutomaton = {
  patternA: string; patternB: string; p: number
  states: AutomatonState[]            // flat E0..E{k-1}, label e.g. "H·∅"; +2 absorbers
  transitions: Transition[]
  absorbingA: StateId; absorbingB: StateId
  winRecurrences: Record<StateId, WinRecurrence>   // constant 0; CanonicalRecurrence-shaped
  winProbabilities: Record<StateId, number>        // w_s = P(A first | s)
  substitutionSteps: SubstitutionStep[]
}

export function buildRaceAutomaton(a: string, b: string, p: number): RaceAutomaton
// BFS the product (progressA,progressB) from (0,0) over {H,T} via nextState/prefixFunction,
// drop absorbing joints; w_s = ΣP(c)·w_next, boundary w_A=1 / w_B=0 (NO +1); solveLinearSystem.

export function correlation(x: string, y: string): { bits: number[]; cln: number; overlaps: number[] }
// bit k (k=1..L) = [suffix_k(x) === prefix_k(y)]; cln = Σ bit_k · 2^(k-1)
export function conwayLeadingNumbers(a: string, b: string): { AA: number; AB: number; BB: number; BA: number }
export function penneyOdds(a: string, b: string): { bBeatsA: Rational; aBeatsB: Rational } // (AA−AB):(BB−BA)
export function penneyProb(a: string, b: string): { pAFirst: Rational; pBFirst: Rational }
export function bestBeater(a: string): string            // length-3: (¬a[1]) + a[0] + a[1]
export function simulateRace(a: string, b: string, p: number, rng: () => number): RaceOutcome
export function simulateRaces(a: string, b: string, p: number, n: number, rng: () => number): { aWins: number; bWins: number }
export function winMatrix(patterns: string[], p: number): Rational[][]   // M[i][j]=P(patterns[i] first vs [j])
```

**Golden tests (`src/engine/race.test.ts`)** — all values verified by this review:
```ts
conwayLeadingNumbers('HHH','THH')           // {AA:7, AB:0, BB:4, BA:3}
penneyOdds('HHH','THH').bBeatsA             // {n:7, d:1}
penneyProb('HHH','THH').pAFirst             // {n:1, d:8}
buildRaceAutomaton('HHH','THH',0.5).winProbabilities.E0   // 0.125 ; states.length (transient) === 5
buildRaceAutomaton('HH','HT',0.5).winProbabilities.E0     // 0.5   ; transient === 2
penneyProb('HHH','HHT').pAFirst             // {n:1, d:2}
bestBeater('HHH')                           // 'THH'   (+ all 8 from §E)
penneyProb('THTH','HTHH').pAFirst           // {n:9, d:14}   (length-4 extension)
// non-transitivity (corrected):
penneyProb('THH','HHT').pAFirst             // 3/4
penneyProb('HHT','HTT').pAFirst             // 2/3   (NOT 3/4)
penneyProb('THH','HTT').pAFirst             // 1/2   (tie — no 3-cycle)
// 4-cycle closes: THH>HHT, HHT>HTT, HTT>TTH, TTH>THH all > 1/2
// winMatrix(8 words) matches the 8×8 table above
// MC: simulateRaces('HHH','THH',0.5,20000,mulberry32(s)).bWins/20000 ≈ 0.875 ± 0.02
```

**validate-fixtures plan:** `scripts/validate-fixtures.ts` currently hard-codes `buildAutomaton('HH')` and the `equation-tiles` beatId. Generalize: (1) `LessonSchema.safeParse(lesson-penneys-game.json)` (after the 3 variants land); (2) for the win-prob tiles beat, cross-check each `row.target` against `buildRaceAutomaton(a,b,0.5).winRecurrences[row.lhs]` (same `CanonicalRecurrence` shape, `constant:0`); (3) keep the existing HH duration check for L1. Engine goldens live in `race.test.ts`, not the fixture validator.

### Risks & open questions

1. **Grader for constant-free / boundary win-prob rows (biggest grader risk).** `equationChecker.checkRow` already compares `constant` generally, so `constant:0` rows pass coarse grading. But the per-slot `equationDiagnosis.diagnoseRow` assumes a leading `const` slot (`fillableCount = 1 + 2T`) and its hints are **duration-framed** ("the 1 flip cost", `const-zero` = "you still have to flip") — actively *wrong* for win-prob. **Recommendation:** for L2 win-prob tiles, **fall back to coarse `equationChecker` + authored hints** (no per-slot diagnosis), and keep the build to **1 graded row on HH vs HT**. Generalizing `diagnoseRow` (a `layout: 'withConstant' | 'constantFree'` + win-prob hint bank + de-hardcoding the `{E0,E2}` `classifyStateMistake`) is a real refactor — defer unless the 5-row build is kept.
2. **Race-automaton plumbing.** Confirmed `LessonPlayer` passes only a single-pattern automaton; new beats must self-build from the engine (above). Low risk if adopted, but it's a pattern every L2 beat depends on.
3. **`SimChart` is not the odds chart.** Its log wait-time axis can't show a [0,1] win-rate; a linear `RateChart` sibling is required for the 7:1 emergence. Don't promise `theorySimChart` reuse for win-rate.
4. **`StateGraph` is linear / single-absorber.** The race product graph branches and has **two** absorbers; `first-step-split` and any race-graph view need a small bespoke 2-absorber layout (or a 2D extension). Consider cutting `first-step-split` (fold into the RaceTrack reveal) to avoid this.
5. **Closed discriminated union.** Each variant touches schema + dispatch + validator + loader; the 3-variant recommendation (vs the plan's 5) is a deliberate risk reduction.
6. **5-state cyclic system.** `automaton.ts`'s `substitutionSteps` assume a near-chain; the `HHH/THH` race chain has mutual dependencies, so a tap-through substitution is messy → present `1/8` as a "Show algebra" reveal, not a guided per-step solve.
7. **Non-transitivity copy.** Must commit to the **4-cycle**; `winMatrix` quiz correctness counts vary per target (verify in the fixture: `HTT`→1 beater, `HHH`→5).
