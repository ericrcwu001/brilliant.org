# Wave-0 Contracts — concept-markov-chains  (FROZEN for Dept 3)

Author: Department 2 (Interactive Experience / Design) + Wave-0 contract author. Everything below is verified
against the real codebase on branch `concept/markov-chains` (worktree `.lf/markov-chains/`). **One** new
interaction type (`chainBoard`), **one** new engine (`src/engine/markov.ts`), one new Konva widget
(`ChainGraph.tsx`) for the graph display + DOM/SVG for the rest. **Every graded number is an exact rational.**
Design only — no source/fixtures are authored in this wave.

**Reuse-first scorecard:** of **104 beats** across L1–L10, **~83 reuse** existing renderers (`retrievalGrid`,
`prediction`, `primer`, `answerEntry`, `masteryChallenge`, `tripletReveal`, `recap`, `walkBoard`, `raceSim`,
`dominanceWheel`, `theorySimChart`) and **~21** are the single new `chainBoard` widget (the hero/explore +
read/classify/solve beats across all ten lessons). No other new interaction type.

**Folding decision (Manager #3 — FINALIZED by Dept 2): FOLD.** A single `chainBoard` type folds five
presentations via `display: 'diagram' | 'matrix' | 'powers' | 'distribution' | 'stationary'` (+ optional
`damping`), mirroring `raceSim` (lanes/oddsDial/heatmap), `walkBoard` (single/swarm/landscape/histogram), and
`bayesUpdate` (bars/tree/sequence). **No sibling `stationarySolver`** — the stationary/PageRank surface is
`display:'stationary'` (+`damping`). Folding does **not** hurt the interaction: the five displays share one
matrix model, one engine (`markov.ts`), one renderer, and one validator cross-check; splitting would duplicate
all four with zero pedagogical gain.

---

## 1. New interaction type `chainBoard`

Append this object as the **last member** of the `InteractionSchema` discriminated union in
`src/content/schema.ts` (immediately after the `couponCollectorSim` member, before the closing `])`). It reuses
the existing `RationalSchema` (top of file, `{ n:int, d:positive int }`) — **no new schema primitive**.
`discriminatedUnion('type', …)` keys on `type`, so placement is irrelevant to validation; appending keeps the
diff additive.

```ts
  // Markov chain board (concept-markov-chains, Wave 0). ONE new type, five
  // presentation displays (the codebase convention where `raceSim` folds
  // lanes/oddsDial/heatmap, `walkBoard` folds single/swarm/…, `bayesUpdate`
  // folds bars/tree/sequence):
  //   'diagram'      — the transition graph: read an edge, build/edit P (rows-sum-to-1 enforced),
  //                    tap-to-classify states, or watch a token hop (simulateChain).
  //   'matrix'       — the same chain as the grid P; also the fundamental-matrix solve (I−Q)⁻¹.
  //   'powers'       — iterate Pⁿ; read a chosen entry (Chapman–Kolmogorov; convergence).
  //   'distribution' — watch the state distribution evolve toward π.
  //   'stationary'   — solve πP=π, check detailed balance, or run the damped random surfer (PageRank).
  // All inputs are exact rationals (RationalSchema). The renderer computes every
  // displayed/graded value via src/engine/markov.ts; `headline` is the
  // engine-reproducible anchor cross-checked by scripts/validate-fixtures.ts.
  z.object({
    type: z.literal('chainBoard'),
    display: z.enum(['diagram', 'matrix', 'powers', 'distribution', 'stationary']),
    // Transition matrix P (row-stochastic), exact rationals, aligned to `labels`.
    // For PageRank (`damping` present) this is the surfer's row-stochastic link
    // matrix; an all-zero (dangling) row is allowed ONLY in that case and is
    // handled by the teleport term (markov.ts pagerank()).
    matrix: z.array(z.array(RationalSchema)),
    // State labels aligned to the matrix rows/cols, e.g. ["Clear","Rainy"],
    // ["Rain","Nice","Snow"]. Drives rendering + the aria-live mirror.
    labels: z.array(z.string()).min(2),
    // The engine operation this beat reads/grades against (selects the markov.ts
    // fn). Omit on a pure passive watch whose value needs no engine anchor.
    task: z
      .enum([
        'entry',      // matrixPower(P, step ?? 1)[cell.row][cell.col]  (diagram edge = P¹; powers = Pⁿ)
        'build',      // buildChain(matrix, labels): square + every row sums to 1
        'classify',   // classifyStates(P) → per-state {kind, class, period}
        'absorption', // absorptionProbabilities / expectedAbsorptionTime via (I−Q)⁻¹
        'stationary', // stationaryDistribution(P) solving πP=π, Σπ=1
        'balance',    // detailedBalance(P) / isReversible(P, π)
        'pagerank',   // pagerank(matrix, damping) = stationary of d·P + (1−d)/n·J
      ])
      .optional(),
    // diagram only: 'graph' (default free layout) vs 'line' (1-D birth–death
    // lattice, e.g. the Ehrenfest urn — reflecting boundaries live in P).
    layout: z.enum(['graph', 'line']).optional(),
    // powers/distribution: the step n to display / animate to (Pⁿ or step-n dist).
    step: z.number().int().nonnegative().optional(),
    // distribution: starting state index whose row the bars evolve from.
    start: z.number().int().nonnegative().optional(),
    // absorption/classify: indices of the absorbing states (the gambler's-ruin walls).
    absorbing: z.array(z.number().int().nonnegative()).optional(),
    // entry/return: which matrix cell the beat reads/grades.
    cell: z
      .object({ row: z.number().int().nonnegative(), col: z.number().int().nonnegative() })
      .optional(),
    // pagerank: damping d (surfer follows a link w.p. d, teleports uniformly w.p. 1−d).
    damping: RationalSchema.optional(),
    // The learner manipulates (drag edges / step / drag damping / tap a class) vs a passive watch.
    interactive: z.boolean().optional(),
    // Engine-reproducible headline anchor — a reduced "n/d" scalar, a comma-joined
    // vector "a/b,c/d,…" (distribution/stationary/pagerank/absorption vector), or a
    // comma-joined kind list for `classify` ("transient,recurrent,…"). Validation anchor.
    headline: z.string().optional(),
  }),
```

**Inferred-type note:** `export type Interaction = z.infer<typeof InteractionSchema>` (bottom of the file)
automatically gains the `chainBoard` member — no separate type to maintain. `BeatSchema.interaction` accepts it
with zero further change.

**Grading rule (FROZEN — mirrors `bayesUpdate` R-6):** a `chainBoard` beat is **graded iff its beat-level
`hero` block is absent.** The explore beats carry `hero` ⇒ ungraded "watch it resolve" (primary = Continue).
A graded `chainBoard` beat omits `hero`, runs the standard hint ladder (`useHintLadder` + `FeedbackStrip`), and
the renderer checks the learner's **direct manipulation** (tapped edge / tapped class / tapped node, a typed
entry, or a built P) against the engine truth selected by `(display, task, damping)`. **This reuses the
existing `hero` field; no new flag.**

**HERO_TYPES — do NOT add `chainBoard`** (see §6). It would force a `hero` block on the many *graded*
`chainBoard` beats (read-the-edge, classify-first, balance-one-edge, …), falsely failing them. The hero/graded
split rides the beat-level `hero` block + the new chainBoard cross-check, exactly as `bayesUpdate` does.

**GRADED_TYPES — do NOT add `chainBoard`** (see §6). Unnecessary: every Markov lesson's first graded beat is
its `retrievalGrid` opener (`recall-*`), so the "guaranteed early win / retrieval opener" invariant already
holds. `chainBoard` graded beats are still graded in the renderer; the gate simply doesn't assert on them.

### Field-usage matrix — the only valid shapes Dept 3 must support

Rationals shown as `n/d` are `{n,d}` objects (`1/2` = `{ "n":1,"d":2 }`, `0/1` = `{ "n":0,"d":1 }`).
"hero?" = carries the beat-level `hero` block ⇒ ungraded. Matrices abbreviated; full P in each lesson spec.

| lesson · beat | display | task | key fields | hero? | headline |
|---|---|---|---|---|---|
| L1 `read-the-edge` | diagram | entry | weather P, `cell:{1,1}`, `interactive` | no (graded) | `7/10` |
| L1 `step-the-weather` | diagram | — | weather P, `interactive` (simulateChain) | **yes** | `7/10` |
| L2 `build-the-board` | diagram | build | weather P, `interactive` (diagram↔matrix mirror) | **yes** | `1` (rows) |
| L2 `build-from-story` | matrix | build | `[[7/10,3/10],[4/10,6/10]]`, `interactive` | no (graded) | `1` (rows) |
| L3 `explore-powers` | powers | entry | LandOfOz P, `step` iterate | **yes** | `3/8` |
| L3 `read-another-entry` | powers | entry | LandOfOz P, `step:2`, `cell:{0,0}` | no (graded) | `7/16` |
| L4 `classify-first` | diagram | classify | small absorbing chain | no (graded) | `absorbing` |
| L4 `classify-board` | diagram | classify | hero 4-state P, `interactive` | **yes** | `2` (period) |
| L4 `classify-and-group` | diagram | classify | hero 4-state P | no (graded) | `transient,recurrent,recurrent,absorbing` |
| L4 `ehrenfest-period` | diagram | classify | Ehrenfest m=2 P | no (graded) | `2` |
| L4 `transient-vs-recurrent` | diagram | absorption | `[[0,1,0],[1/2,0,1/2],[0,0,1]]`, `absorbing:[2]`, `cell:{1,1}` | no (graded) | `1/2` |
| L5 `solve-matrix` | matrix | absorption | gambler up-2/3 P, `absorbing:[0,3]` | **yes** | `4/7,6/7` |
| L6 `read-the-share` | distribution | stationary | GfG weather `[[7/10,3/10],[4/10,6/10]]`, `cell:{0,0}` | no (graded) | `4/7` |
| L6 `watch-it-settle` | distribution | stationary | weather P, `start` both | **yes** | `3/7,4/7` |
| L7 `early-power` | powers | entry | weather P, `step:2`, `cell:{0,0}` | no (graded) | `12/25` |
| L7 `explore-collapse` | powers | — | weather→LandOfOz P, `step` iterate | **yes** | `3/7,4/7` |
| L7 `approach-pi` | distribution | stationary | weather P, `cell:{0,0}` | no (graded) | `3/7` |
| L7 `periodic-trap` | powers | classify | Ehrenfest m=2 P (period 2) | no (graded) | `oscillates` |
| L8 `balance-one-edge` | stationary | balance | Ehrenfest m=2 P, given π₀ | no (graded) | `1/2` |
| L8 `ehrenfest-walk` | diagram | balance | Ehrenfest m=2 P, `layout:'line'`, `interactive` | **yes** | `1/4,1/2,1/4` |
| L8 `telescope-to-pi` | stationary | balance | Ehrenfest m=2 P | no (graded) | `1/4,1/2,1/4` |
| L8 `reversible-or-not` | stationary | balance | directed 3-cycle `[[0,1,0],[0,0,1],[1,0,0]]` | no (graded) | `not-reversible` |
| L9 `weight-by-source` | diagram | pagerank | 4-node link P, `damping:{1,1}` | no (graded) | `2` (page index) |
| L9 `explore-damping` | stationary | pagerank | 3-cycle link P, `damping` draggable, `interactive` | **yes** | `1/3,1/3,1/3` |
| L9 `damping-saves-sink` | stationary | pagerank | dangling/2-cycle sink P, `damping` | no (graded) | `unique` |
| L10 `classify-one` | diagram | classify | weather P | no (graded) | `ergodic` |
| L10 `explore-mixed` | diagram | classify | Ehrenfest/weather/drunkard P (cycled), `interactive` | **yes** | `ergodic` |

> **Mastery beats are NOT chainBoard.** Where a Dept-1 brief says "masteryChallenge wraps/over chainBoard"
> (L2 b9, L4 b10, L8 b9, L9 b9), the **penult beat is a pure `masteryChallenge` type-in** (gate-required, no
> `pattern`); the chainBoard surface lives in that lesson's preceding hero/solve beat. `masteryChallenge` and
> `chainBoard` are distinct schema members and are never combined in one beat. (Each affected spec states this
> remap explicitly.)

---

## 2. Dispatcher entry

In `src/lesson/beats/index.tsx`, add the import beside the other beat imports and one `case` in `BeatView`'s
switch (placed with the other shared widgets, after the `tripletReveal` case):

```tsx
import { ChainBoardBeat } from './ChainBoardBeat'
```
```tsx
    case 'chainBoard':
      return <ChainBoardBeat {...props} />
```

No `beatId` routing is needed (one renderer serves all five displays). The `default: return <ContinueStub …>`
branch already covers the type until the renderer lands, so the dispatcher change is purely additive.

---

## 3. Renderer `src/lesson/beats/ChainBoardBeat.tsx` (+ Konva `ChainGraph.tsx`)

**Contract.** `export function ChainBoardBeat(props: BeatProps)`. Narrows `props.beat.interaction` to the
`chainBoard` member (early-returns `null` otherwise, like every sibling). It **ignores `automaton`/`pattern`**
(Markov is automaton-free) and composes `<BeatShell>` exactly like the other beats.

**Display → sub-view (all values via `markov.ts`, never hardcoded; formatted by the small `formatRational` /
`formatVector` helpers, §4):**
- `diagram` → **`ChainGraph`** (new Konva widget, below). Read mode taps/reads an edge (`entry`); build mode
  drags edges / steps rational probs with rows-sum-to-1 enforced (`build`); classify mode taps a node to label
  it R/T/A and reads the period (`classify`); `interactive` hero mode animates a token via `simulateChain`.
  `layout:'line'` lays the nodes on a 1-D lattice (the Ehrenfest urn) and labels each edge's forward/back flow.
- `matrix` → a DOM/SVG grid of the rational P (build mode = editable cells with a live row-sum check; the L5
  `absorption` mode renders the `Q`/`R` split and the resolved fundamental matrix `N=(I−Q)⁻¹`, `B=NR`).
- `powers` → the grid iterates `matrixPower(P, k)` for k = 1…`step`; a tapped `cell` reads its path-sum value.
- `distribution` → DOM bars (the width-animated pattern from `BayesUpdateBeat`'s bars) evolving from `start`
  toward `stationaryDistribution(P)`; the settled bar is the `stationary` read-off.
- `stationary` → bars + the balance/solve readout: `solve` shows `πP=π`; `balance` shows each edge's
  `πᵢpᵢⱼ` vs `πⱼpⱼᵢ`; `pagerank` adds a damping control (`damping`) and the Google-matrix mix.

**Konva `ChainGraph.tsx` (NEW, sibling to `StateGraph.tsx`).** `StateGraph` is hardwired to the H/T
`Automaton` (edges are `'H'|'T'`, labels are matched-prefixes) and is shipped/used by coin-sim, overlap, and
bias-sandbox — so it is **reused as a pattern, not mutated**. `ChainGraph` renders an arbitrary chain: `n`
nodes (free graph or 1-D `line` layout), **rational** edge labels, self-loops, optional absorbing double-ring,
and the same flip choreography (node pulse + one-shot energy packet along the active edge) for the
`simulateChain` token. It imports `konva/theme.ts` (`C`, `accentFor`, `hexToRgba`, `FONT_MONO`) and
`chapterColor(lessonId)` for the **`ch3`** accent (Markov is `accent:'ch3'`, base `#F05A4A`). matrix / powers /
distribution / stationary are **DOM/SVG + CSS transitions** — no Konva needed (mirrors `WalkBoardBeat` SVG and
`BayesUpdateBeat` bars).

**Reads from the interaction:** `display`, `matrix`, `labels`, `task`, `layout`, `step`, `start`, `absorbing`,
`cell`, `damping`, `interactive`, `headline`. **Reads from props:** `reducedMotion`, `isLast`, `onAdvance`,
`reportNeedsReview`, `lessonId`, `beat.hero`, and (graded mode only) the hint ladder via
`resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)` (same wiring as `AnswerEntryBeat`).

**Completion / answer reporting (mirrors `BayesUpdateBeat`):**
- Ungraded (hero) → primary `{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }`;
  writes nothing lesson-specific.
- Graded → primary `Check`; on correct → `ladder.submitCorrect()` → Continue/Finish; on wrong →
  `ladder.submitWrong()` advances the hint ladder; reaching reveal calls `reportNeedsReview`. Feedback strip is
  the shared `FeedbackStrip` (`role="status" aria-live="polite"`).

**a11y (FROZEN):**
- **44px tap paths:** every node, edge handle, matrix cell, classify chip, and the damping control is a native
  `<button>`/`<input type="range">` ≥44px (arrow-key steppable). Bars are non-interactive `<div>`s.
- **aria-live mirror:** a visually-hidden `<p role="status" aria-live="polite">` mirrors the current readout in
  words on every manipulation, e.g. "P(rain tomorrow | rain today) = 7 in 10", "After 8 steps: clear 3 in 7,
  rainy 4 in 7", "State 1: transient — return probability 1 in 2", "Forward flow 1/4, back-flow 1/4 — balanced".
  (In addition to the FeedbackStrip's own aria-live for the graded verdict.)
- **reduced-motion:** when `reducedMotion`, render the **final frame** (token at its absorbing/settled node, bars
  at settled widths, `Pⁿ` rows already collapsed), no transitions — honoring `hero.reducedMotionFinalFrame:true`.
  The single walk/sim still steps discretely (watching it IS the content, like `WalkBoardBeat`).

---

## 4. Engine `src/engine/markov.ts`

Pure, dependency-free, **exact rational**. Reuses the toolkit from `src/engine/automaton.ts`
(`reduce`, `toRational`, `ratAdd`, `ratSub`, `ratMul`, `ratDiv`, `ratNum`, `solveLinearSystem`), the `Rational`
type from `src/engine/types.ts`, and `mulberry32` / the `nextStateOf` pattern from `src/engine/simulate.ts`
(Monte-Carlo only — never on a graded path). **No floats anywhere graded.** One general n×n source of truth
that subsumes the four special-case engines (`automaton.ts`, `walk.ts`, `race.ts`, `expectation.ts`).

```ts
import type { Rational } from './types'
import { reduce, toRational, ratAdd, ratSub, ratMul, ratDiv, ratNum, solveLinearSystem } from './automaton'
import { mulberry32 } from './simulate'

export type Chain = { P: Rational[][]; labels: string[]; n: number }
export type StateClass = {
  index: number
  class: number                                   // communicating-class id
  kind: 'recurrent' | 'transient' | 'absorbing'
  period: number                                  // gcd of return-cycle lengths (1 = aperiodic)
}

// Validate square + every row sums to 1 (rejects non-stochastic input; mirrors buildAutomaton's guard).
export function buildChain(P: Rational[][], labels: string[]): Chain

// Exact Pⁿ (Chapman–Kolmogorov). matrixPower(P,0)=I, matrixPower(P,1)=P.
export function matrixPower(P: Rational[][], n: number): Rational[][]

// Communicating classes (reachability), kind, and period (gcd of return lengths).
export function classifyStates(P: Rational[][]): StateClass[]

// B = (I−Q)⁻¹R via solveLinearSystem. Rows = transient states, cols = absorbing states.
export function absorptionProbabilities(P: Rational[][], absorbing: number[]): Rational[][]

// t solving (I−Q)t = 1 (the +1 is the constant 1). Indexed by transient state.
export function expectedAbsorptionTime(P: Rational[][], absorbing: number[]): Rational[]

// π solving πP=π, Σπ=1 (augmented system → solveLinearSystem).
export function stationaryDistribution(P: Rational[][]): Rational[]

// Kac mean return time = 1/πᵢ.
export function kacReturnTime(P: Rational[][], i: number): Rational

// Detailed balance: reversible iff πᵢpᵢⱼ = πⱼpⱼᵢ for every edge (π = stationaryDistribution).
export function isReversible(P: Rational[][], pi: Rational[]): boolean
export function detailedBalance(P: Rational[][]): { reversible: boolean; pi: Rational[] }

// PageRank = stationary of G = d·M + (1−d)/n·J. `linkGraph` is the row-stochastic
// surfer matrix; an all-zero (dangling) row is treated as uniform teleport.
export function pagerank(linkGraph: Rational[][], damping: Rational): Rational[]

// Monte-Carlo stepping (reuses nextStateOf's pattern + mulberry32). Feeds theorySimChart ONLY.
export function simulateChain(P: Rational[][], start: number, steps: number, rng?: () => number): number[]

// Formatting helpers (the renderer + validator format with these).
export function formatRational(r: Rational): string          // reduced "n/d", or "n" when d=1
export function formatVector(v: Rational[]): string          // comma-joined formatRational
```

### Golden answer table (the Stage-2 fact-check goldens the engine MUST reproduce)

Collected from all ten Lesson Briefs + `source-pack.md`. `markov.ts` reproduces every one exactly;
`markov.test.ts` pins them and `validate-fixtures` re-asserts the fixture-facing subset (§6). Floats shown only
as readability glosses; the engine values are exact rationals.

| # | scenario (lesson · source) | engine call | result |
|---|---|---|---|
| 1 | weather one-step (L1 · Math.SE 3336273) | `matrixPower(weather,1)[1][1]` | **7/10** |
| 2 | Land-of-Oz 2-step Rain→Snow (L3 · G&S Table 11.1) | `matrixPower(oz,2)[0][2]` | **3/8** |
| 3 | Land-of-Oz 2-step Rain→Rain (L3) | `matrixPower(oz,2)[0][0]` | **7/16** |
| 4 | weather 2-step clear→clear (L3/L7) | `matrixPower(weather,2)[0][0]` | **12/25** |
| 5 | weather 2-step rainy→clear (L7) | `matrixPower(weather,2)[1][0]` | **39/100** |
| 6 | Land-of-Oz 3-step Rain→Snow (L3 · constructed) | `matrixPower(oz,3)[0][2]` | **25/64** |
| 7 | gambler up-2/3 absorption (L4/L5/L10 · GB p.54–55) | `absorptionProbabilities(gr,[0,3])` (start 1,2 → reach 3) | **4/7, 6/7** |
| 8 | symmetric walk i/N (L5/L10 · G&S Ex.11.13) | `absorptionProbabilities(sym5,[0,4])` (start 1,2,3) | **1/4, 1/2, 3/4** |
| 9 | symmetric walk i(N−i) (L5/L10 · G&S Ex.11.15) | `expectedAbsorptionTime(sym5,[0,4])` | **3, 4, 3** |
| 10 | dice 12-first (L5 · GB p.55–56 + 5 web) | `absorptionProbabilities(dice4,[…])` (single-12 state) | **7/13** (two-7s = **6/13**) |
| 11 | E[THH] (L5 · GB p.56) | `expectedAbsorptionTime(thh,[absorb])[∅]` | **8** |
| 12 | drunk-man steps (L5 · GB p.59) | `expectedAbsorptionTime(sym100,[0,100])[17]` | **1411** (=17·83) |
| 13 | return prob, transient (L4 · constructed) | `absorptionProbabilities(...)` (home 1 absorbing) | **1/2** |
| 14 | gambler return prob (L4 mastery · constructed) | `absorptionProbabilities(...)` | **2/9** |
| 15 | Ehrenfest m=2 period (L4/L7) | `classifyStates(ehr2)[0].period` | **2** |
| 16 | weather stationary (L6/L7/L10 · Math.SE 3336273) | `stationaryDistribution(weather)` | **3/7, 4/7** |
| 17 | GfG weather stationary (L6) | `stationaryDistribution(gfg)` | **4/7, 3/7** |
| 18 | asymmetric 2-state stationary (L6 · Rochester HW5 #1) | `stationaryDistribution([[1/4,3/4],[1/5,4/5]])` | **4/19, 15/19** |
| 19 | cloudy-town stationary (L6/L10 · Rochester HW5 #2) | `stationaryDistribution(cloudy)` | **1/5, 2/5, 2/5** |
| 20 | Kac sunny / clear (L6) | `kacReturnTime(cloudy,0)` / `kacReturnTime(weather,0)` | **5** / **7/3** |
| 21 | Land-of-Oz limit (L7 · G&S Table 11.1) | `stationaryDistribution(oz)` | **2/5, 1/5, 2/5** |
| 22 | Ehrenfest m=2 reversible (L8/L10) | `detailedBalance(ehr2)` | reversible, **1/4, 1/2, 1/4** |
| 23 | Ehrenfest m=3 reversible (L8) | `detailedBalance(ehr3)` | reversible, **1/8, 3/8, 3/8, 1/8** |
| 24 | directed 3-cycle (L8) | `detailedBalance(cyc3)` | **NOT reversible** (π = 1/3,1/3,1/3) |
| 25 | PageRank 3-cycle, any d (L9 · theorempath) | `pagerank(cyc3, 85/100)` = `pagerank(cyc3, 1/2)` | **1/3, 1/3, 1/3** |
| 26 | PageRank 4-node d=1 (L9 · practicaldsc) | `pagerank(link4, 1/1)` | **4/13, 5/13, 1/13, 3/13** |
| 27 | PageRank d=1/2 enrichment (L9 · CONSTRUCTED) | `pagerank(link3, 1/2)` | **verify → 14/39,10/39,15/39** (NOT GRADED) |

> **Manager #2 (graded answers — sourced only):** L9's **graded** PageRank answers are the **sourced** d=1
> 4-node `(4/13,5/13,1/13,3/13)` and the symmetric 3-cycle `(1/3,1/3,1/3)`. Row 27 (`14/39,10/39,15/39`) is a
> **construction, not a stated source** — it ships **only** as the `explore-damping` enrichment aside **iff
> `pagerank()` reproduces it exactly**; it is never a graded `headline`.

---

## 5. Fixture plan

### 5a. `fixtures/lesson-markov-chains-{1..10}.json` — required `LessonSchema` fields

All ten share `courseId:"course-markov-chains"`, `schemaVersion:1`, and **`patternOptions:["H"]`** (the safe
H/T placeholder — `LessonPlayer` builds `buildAutomaton(patternOptions[0])`; **no Markov beat reads the
automaton**, and no `chainBoard`/reuse beat triggers the `buildAutomaton` cross-check — that fires only on
`equationTiles` with `beat.pattern`, and on a `masteryChallenge` with `pattern` set, and we set neither).

| lesson | title | milestoneId | unlocks | glyphKey | vizKey |
|---|---|---|---|---|---|
| L1 markov-chains-1 | The Markov Property | `markov-chains-property` | markov-chains-2 | `P(·\|now)` | `twoNode` |
| L2 markov-chains-2 | The Transition Matrix | `markov-chains-matrix` | markov-chains-3 | `Σrow=1` | `stateMachine` |
| L3 markov-chains-3 | Multi-Step Transitions | `markov-chains-multistep` | markov-chains-4 | `Pⁿ` | `fourNode` |
| L4 markov-chains-4 | Classifying States | `markov-chains-classify` | markov-chains-5 | `R/T/A` | `stateMachine` |
| L5 markov-chains-5 | Hitting Times & Absorption | `markov-chains-hitting` | markov-chains-6 | `(I−Q)⁻¹` | `randomWalk` |
| L6 markov-chains-6 | The Stationary Distribution | `markov-chains-stationary` | markov-chains-7 | `πP=π` | `fourNode` |
| L7 markov-chains-7 | Convergence | `markov-chains-convergence` | markov-chains-8 | `Pⁿ→π` | `twoNode` |
| L8 markov-chains-8 | Reversibility & Detailed Balance | `markov-chains-reversible` | markov-chains-9 | `πᵢpᵢⱼ=πⱼpⱼᵢ` | `randomWalk` |
| L9 markov-chains-9 | PageRank | `markov-chains-pagerank` | markov-chains-10 | `PR` | `fourNode` |
| L10 markov-chains-10 | Markov in the Wild | `markov-chains-wild` | `null` | `mix` | `dice` |

`masteryChallenge` beats carry **no `pattern`** (Markov answers are fractions/vectors, not hitting-times).

### 5b. `fixtures/course-markov-chains.json` — flip the stub to a live, navigable concept

Per `concept-brief.md`: `accent:"ch3"`, `status:"live"`, `domain:"Probability"`, `domainOrder:0`, `order:2`,
`tagline:"Where does a memoryless process settle?"`, `vizKey:"fourNode"`,
`completionMilestoneId:"markov-chains-complete"`. **`chapters[]` is mandatory and load-bearing** (else
`resolveChapters` falls back to PHT's `ERGO_CHAPTERS` and the ten lessons render invisible — same trap as Bayes
R-1; §6/§7 enforce it):

```json
"chapters": [
  { "id": "ch-markov-chains-1", "label": "The Memoryless Machine", "accent": "ch1", "lessonIds": ["lesson-markov-chains-1","lesson-markov-chains-2","lesson-markov-chains-3"] },
  { "id": "ch-markov-chains-2", "label": "Reaching States",        "accent": "ch2", "lessonIds": ["lesson-markov-chains-4","lesson-markov-chains-5"] },
  { "id": "ch-markov-chains-3", "label": "The Long Run",           "accent": "ch3", "lessonIds": ["lesson-markov-chains-6","lesson-markov-chains-7","lesson-markov-chains-8"] },
  { "id": "ch-markov-chains-4", "label": "Ranking & Synthesis",    "accent": "ch4", "lessonIds": ["lesson-markov-chains-9","lesson-markov-chains-10"] }
]
```

Every built lessonId appears in **exactly one** chapter (3+2+3+2 = 10). `lessons[]` carries all ten `built:true`
nodes (table 5a). The `unlocks` chain is L1→…→L10→`null`.

---

## 6. `scripts/validate-fixtures.ts` edits (exact)

**(a) Imports** — add the engine + reuse the existing `Rational` import:

```ts
import {
  buildChain, matrixPower, classifyStates, absorptionProbabilities, expectedAbsorptionTime,
  stationaryDistribution, kacReturnTime, detailedBalance, pagerank, formatRational, formatVector,
} from '../src/engine/markov'
```

**(b) Gate-set additions** — append the 10 lessonIds to **both** `GATED` and `MASTERY_LESSONS`:

```ts
'lesson-markov-chains-1','lesson-markov-chains-2','lesson-markov-chains-3','lesson-markov-chains-4',
'lesson-markov-chains-5','lesson-markov-chains-6','lesson-markov-chains-7','lesson-markov-chains-8',
'lesson-markov-chains-9','lesson-markov-chains-10',
```

**HERO_TYPES — do NOT add `chainBoard`.** It would require a `hero` block on every `chainBoard` beat, but the
graded ones (`read-the-edge`, `classify-first`, `balance-one-edge`, …) must NOT carry one (graded ⇔ no hero).
`walkBoard` and `raceSim` stay in `HERO_TYPES`, so the L5/L10 `walkBoard`/`raceSim` replays still need their
`hero` blocks (`slowFirst:false`) — independent of `chainBoard`.

**GRADED_TYPES — do NOT add `chainBoard`.** Every lesson's first graded beat is its `retrievalGrid` opener, so
the early-win/opener invariant already holds; keeping the change minimal.

**(c) chainBoard engine cross-check** — a new block after the bayes cross-check (§3b). For every `chainBoard`
beat with a `headline`, recompute via `markov.ts` (switch on `display`/`task`/`damping`) and assert equality:

```ts
const toR = (r: { n: number; d: number }): Rational => ({ n: r.n, d: r.d })
let chainChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'chainBoard' || !it.headline) continue
    const P = it.matrix.map((row) => row.map(toR))
    let got: string
    switch (it.task) {
      case 'entry': {
        const Pn = matrixPower(P, it.step ?? 1)
        const { row = 0, col = 0 } = it.cell ?? {}
        got = formatRational(Pn[row][col]); break
      }
      case 'build':       { buildChain(P, it.labels); got = '1' /* every row sums to 1 */; break }
      case 'classify': {
        const cls = classifyStates(P)
        const hasAbsorbing = cls.some((c) => c.kind === 'absorbing')
        // A transient state's return-gcd is undefined/0, so a bare-integer period
        // anchor reads a RECURRENT/absorbing class's period, not cls[0] (L4 classify-board).
        const recPeriod = (cls.find((c) => c.kind !== 'transient') ?? cls[0]).period
        if (/^\d+$/.test(it.headline)) got = String(recPeriod)                         // period scalar (L4)
        else if (it.headline === 'absorbing') got = hasAbsorbing ? 'absorbing' : 'ergodic' // L4 classify-first
        else if (it.headline === 'ergodic')   got = hasAbsorbing ? 'absorbing' : 'ergodic' // L10 classify-one/explore-mixed
        else if (it.headline === 'oscillates') got = recPeriod > 1 ? 'oscillates' : 'converges' // L7 periodic-trap
        else got = cls.map((c) => c.kind).join(',')                                    // kind-list (L4 classify-and-group)
        break
      }
      case 'absorption': {
        const B = absorptionProbabilities(P, it.absorbing ?? [])
        got = it.headline.includes(',') ? formatVector(B.flat()) : formatRational(B.flat()[0])
        break
      }
      case 'stationary':  { const pi = stationaryDistribution(P)
        got = it.cell ? formatRational(pi[it.cell.row]) : formatVector(pi); break }
      case 'balance':     { const db = detailedBalance(P)
        // single-edge solve (e.g. L8 balance-one-edge → π₁) reads `cell`; mirrors the `stationary` branch.
        got = !db.reversible ? 'not-reversible'
            : it.cell ? formatRational(db.pi[it.cell.col])
            : formatVector(db.pi); break }
      case 'pagerank': {
        if (!it.damping) fail(`${lesson.lessonId}/${beat.beatId}: pagerank needs damping`)
        const pr = pagerank(P, toR(it.damping))
        if (it.headline === 'unique') got = 'unique'        // damping d<1 ⇒ G regular ⇒ unique π (L9 damping-saves-sink)
        else if (/^\d+$/.test(it.headline)) {               // top-ranked page label (L9 weight-by-source)
          let best = 0
          for (let i = 1; i < pr.length; i++) if (pr[i].n * pr[best].d > pr[best].n * pr[i].d) best = i
          got = it.labels[best]
        } else got = formatVector(pr)                        // the π vector (L9 explore-damping)
        break
      }
      default: continue   // passive hero with no engine-anchored headline
    }
    if (got !== it.headline) {
      fail(`${lesson.lessonId}/${beat.beatId}: declared headline ${it.headline} ≠ engine ${got}`)
    }
    chainChecked++
  }
}
console.log(`✓ chainBoard headlines match markov.ts (${chainChecked} beats)`)
```

> Categorical headlines (`absorbing`, `ergodic`, `oscillates`, `unique`, `not-reversible`, `transient,…`) are
> string-matched against the formatted engine output; numeric/vector headlines via `formatRational`/`formatVector`.
> The `classify`/`pagerank` weight beats (L9 `weight-by-source` → page index, L10 `classify-one` → `ergodic`)
> use the simplest engine-derivable anchor (a state index / "has-no-absorbing-state" boolean) — each spec states
> the exact derivation.

**(d) markov.ts inline goldens** — a golden block mirroring the `E[H]=2` and bayes goldens (§2/§2b of the file)
so `markov.ts` correctness fails CI directly, independent of fixtures. Assert the §4 golden table:
`matrixPower(oz,2)[0][2]='3/8'`; `absorptionProbabilities(gr,[0,3])` → `4/7,6/7`;
`expectedAbsorptionTime(sym5,[0,4])` → `3,4,3`; `stationaryDistribution(weather)='3/7,4/7'`;
`stationaryDistribution(cloudy)='1/5,2/5,2/5'`; `detailedBalance(ehr2)` reversible `1/4,1/2,1/4`;
`detailedBalance(cyc3).reversible===false`; `pagerank(link4,{n:1,d:1})='4/13,5/13,1/13,3/13'`;
`pagerank(cyc3,{n:85,d:100})='1/3,1/3,1/3'`; `kacReturnTime(cloudy,0)='5'`. (Full list = §4 table.)

**(e) Chapters-coverage (§7 in the file) — NO code change.** The existing generic block already enforces every
built lessonId in exactly one chapter; it just needs `course-markov-chains.json` enriched per §5b.

**(f) interviewNote / notation-ladder.** Each lesson satisfies the existing GATED rules: ≥1 `primer` (the
`name-*` JIT primer); every `prediction` uses `byOption`; **one `interviewNote` per lesson** (L1
`name-memoryless`, **L2 `read-as-one` ← Dept-2 ADD**, L3 `model-ck-three-ways`, L4 `classify-and-group`, **L5
`solve-matrix` ← Dept-2 ADD**, L6 `mastery-cloudy-town`, L7 `periodic-trap`, L8 `telescope-to-pi`, L9
`mastery-fourNode`, L10 `discriminate`); the first graded beat is the `retrievalGrid` opener (`recall-*`); the
last beat is `recap`, preceded by a **required `masteryChallenge` with no `pattern`**. **No `introducesSymbol`
tags** ⇒ the per-track notation-ladder check is vacuously satisfied (the only candidate groundings are the
track-A-only `name-*` primers; tagging a `track:both` beat would fail the gate in track B — same reasoning as
Bayes §6f).

---

## 7. `walkBoard` / `walk.ts` decision (Manager's known Wave-0 gate item) — **NO EXTENSION NEEDED**

The flag: "walkBoard/walk.ts may need reflecting position-dependent birth–death boundaries (Ehrenfest, L8)."
**Resolution (Dept 2): do NOT extend `walk.ts` or `walkBoard`.** Rationale (surgical, budget-respecting):
- The Ehrenfest reflecting, position-dependent boundaries (`P(i→i+1)=(m−i)/m`, `P(i→i−1)=i/m`, reflect at 0/m)
  are **intrinsic to the transition matrix P** — `chainBoard` expresses them for free (it's just a stochastic
  P), with `simulateChain` for the animated token and `detailedBalance` for the edge-flow readout.
- So **L8's Ehrenfest hero `ehrenfest-walk` is remapped from `walkBoard` → `chainBoard` `display:'diagram'`,
  `layout:'line'`** (a 1-D urn lattice 0–1–…–m). This keeps the one-new-type budget, needs zero changes to the
  shipped `walk.ts`/`walkBoard` (constant-`p` **absorbing** gambler's-ruin), and shows detailed balance better
  than `walkBoard` (which is money-labeled and gambler's-ruin-specific).
- `walkBoard`/`walk.ts` remain **reused as-is** for the **absorbing** gambler's-ruin/drunkard recalls/heroes
  (L5 `walk-recall`, L10 `walk-recall`) — already fully supported. L8's `recall-birth-death` opener is a
  `retrievalGrid` (text recall), not an actual `walkBoard` render, so L8 needs no reflecting walk at all.

**Net: no `walk.ts`/`walkBoard` change in this concept.** (Rejected alternative: an additive
`buildBirthDeath(probs)` in `walk.ts` + a reflecting `walkBoard` display — more build surface, mutates a shipped
hero widget, and duplicates what P + `chainBoard` already do.)

---

## 8. Risk register (anything not purely additive)

| # | Risk | Severity | Evidence | Minimal surgical fix |
|---|---|---|---|---|
| R-1 | `course-markov-chains` flipped `live` without `chapters[]` → `resolveChapters` falls back to PHT's `ERGO_CHAPTERS`, `CourseJourney` drops empty chapters → all 10 lessons render **invisible**. | **High** | `studyDesk.model.ts` `resolveChapters`; `CourseJourney.tsx`; bayes R-1 | Ship §5b `chapters[]` (4 chapters, each lesson in exactly one) — the §7 coverage gate already fails CI otherwise. |
| R-2 | `chainBoard` is sometimes hero, sometimes graded — a single type-level gate can't express it. | Low (decided) | grading rule §1; bayes R-6 | Do **not** add `chainBoard` to `HERO_TYPES`/`GRADED_TYPES`; ride the beat-level `hero` block + the §6c cross-check. |
| R-3 | PageRank dangling node ⇒ a non-row-stochastic `matrix` would fail `buildChain`. | Low | L9 `damping-saves-sink` | `pagerank()` accepts a sub-stochastic link matrix and treats a zero row as uniform teleport; `chainBoard` `matrix` is only `buildChain`-validated for `task:'build'`. Dangling rows are legal **only** with `damping` present. |
| R-4 | `masteryChallenge` with a `pattern` would trigger `buildAutomaton(pattern).E0 ∈ accept`, failing for a Markov fraction/vector. | Low (avoidable) | `validate-fixtures.ts` mastery gate | Leave `pattern` **unset** on all 10 `masteryChallenge` beats. |
| R-5 | GATED adds new invariants; Dept-1 **L2 & L5 briefs specified no `interviewNote`**. | Medium (must-author) | `validate-fixtures.ts` GATED block | This contract adds L2 `interviewNote` on `read-as-one` and L5 on `solve-matrix`; all other GATED rules already hold (per each spec's Gate notes). |
| R-6 | Konva `StateGraph` reuse for arbitrary rational edges would force mutating a shipped widget (coin-sim/overlap/bias-sandbox). | Medium → eliminated | `StateGraph.tsx` (H/T `Automaton`-bound) | Add a **new** `ChainGraph.tsx` (reuses `konva/theme.ts`), reuse-as-pattern; do not mutate `StateGraph`. |
| R-7 | `patternOptions` must be valid H/T or `buildAutomaton` breaks. | Low (guarded) | `LessonPlayer.tsx` (guards → `'H'`) | Author `patternOptions:["H"]` on all 10 lessons (§5a). |
| R-8 | Milestone seals on the seeded build are PHT-hardcoded (not required for completion/unlock). | Low (seeded only) | bayes §7 / R-3 | Optional, additive: register 10 `LESSON_MILESTONES` + a `CONCEPT_COMPLETIONS` entry for `markov-chains-complete` + client `MILESTONE_SEQUENCE` seals. Not needed for completion/unlock on the dev build. |

**Everything else is purely additive:** the `chainBoard` schema member, the dispatcher case, the new
`ChainBoardBeat.tsx` + `ChainGraph.tsx`, the new `markov.ts` (+ `markov.test.ts`), the 10 lesson fixtures, the
course enrichment (only `status` flips; chapters/lessons added), and the validate-fixtures cross-check + golden
blocks. No existing renderer, engine, or fixture is modified.

---

## 9. Per-lesson beat map (which beats use `chainBoard`, which reuse)

| L | #beats | chainBoard beats (display) | reuse types used |
|---|---|---|---|
| 1 | 10 | `read-the-edge` (diagram), `step-the-weather` (diagram·hero) | retrievalGrid×2, prediction×2, primer, tripletReveal, masteryChallenge, recap |
| 2 | 10 | `build-the-board` (diagram·hero), `build-from-story` (matrix) | retrievalGrid×2, prediction, primer, answerEntry, tripletReveal, masteryChallenge, recap |
| 3 | 10 | `explore-powers` (powers·hero), `read-another-entry` (powers) | retrievalGrid, prediction, primer, answerEntry×2, tripletReveal, masteryChallenge, recap |
| 4 | 11 | `classify-first`, `classify-board` (hero), `classify-and-group`, `ehrenfest-period`, `transient-vs-recurrent` (all diagram) | retrievalGrid, prediction, primer, tripletReveal, masteryChallenge, recap |
| 5 | 11 | `solve-matrix` (matrix·hero) | retrievalGrid×2, prediction, primer, walkBoard, answerEntry, raceSim, tripletReveal, masteryChallenge, recap |
| 6 | 11 | `read-the-share` (distribution), `watch-it-settle` (distribution·hero) | retrievalGrid×2, prediction, primer, answerEntry×2, tripletReveal, masteryChallenge, recap |
| 7 | 11 | `early-power` (powers), `explore-collapse` (powers·hero), `approach-pi` (distribution), `periodic-trap` (powers) | retrievalGrid×2, prediction, primer, tripletReveal, masteryChallenge, recap |
| 8 | 10 | `balance-one-edge`, `ehrenfest-walk` (diagram·line·hero), `telescope-to-pi`, `reversible-or-not` (stationary) | retrievalGrid, prediction, primer, tripletReveal, masteryChallenge, recap |
| 9 | 10 | `weight-by-source` (diagram), `explore-damping` (stationary·damping·hero), `damping-saves-sink` (stationary·damping) | retrievalGrid, prediction, primer, answerEntry, tripletReveal, masteryChallenge, recap |
| 10 | 10 | `classify-one` (diagram), `explore-mixed` (diagram·hero) | retrievalGrid×2, prediction, primer, walkBoard, masteryChallenge×2, recap |

**Heroes (carry `hero` block):** L1 `step-the-weather`, L2 `build-the-board`, L3 `explore-powers`, L4
`classify-board`, L5 `solve-matrix` (+ `walk-recall`/`race-recall` `slowFirst:false`, HERO_TYPES), L6
`watch-it-settle`, L7 `explore-collapse`, L8 `ehrenfest-walk`, L9 `explore-damping`, L10 `explore-mixed` (+
`walk-recall` `slowFirst:false`, HERO_TYPES).
