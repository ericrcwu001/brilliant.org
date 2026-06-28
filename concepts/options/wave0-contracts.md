# Wave-0 Frozen Contracts — Options Pricing (`course-options`)

> Stage-3 (Dept 3 / Coding). These contracts are FROZEN. Stage-4 per-lesson builds
> consume them and MUST NOT modify the schema member, engine signatures, renderer/
> grading slots, or the validate-fixtures cross-check. Committed on branch
> `concept/options`.

## 1. Schema — the single new discriminated-union member

Added to `src/content/schema.ts` immediately after the `covarianceBoard` block. ONE new
member, four display modes:

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  legs: z.array(z.object({
    kind: z.enum(['call', 'put', 'stock', 'bond']),
    K: RationalSchema.optional(),
    qty: RationalSchema,
  })).optional(),
  tree: z.object({
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema, K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call', 'put']),
  }).optional(),
  sigma: RationalSchema.optional(),
  markS: RationalSchema.optional(),
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),
})
```

- **Four display modes:** `payoffDiagram` (P/L at expiry via `spreadPayoff`),
  `binomialTree` (risk-neutral lattice price), `parityScale` (put–call parity balance),
  `greeksSlider` (Δ/Γ/Θ/ρ sensitivity — display-only, no engine anchor).
- `RationalSchema` is the existing `{ n: int, d: positive-int }` (plain-number) — the
  engine bridges it via `toBig` / `fromBig` (see §2).
- **NOT a `HERO_TYPE`** and **NOT in `GRADED_TYPES`**. Graded reads use `answerEntry` /
  `masteryChallenge`; the explore beats carry an engine-reproducible `headline` only.
- `greeksSlider` is display-only: it is **exempted** from the validate-fixtures §3h
  cross-check (Black–Scholes / continuous-Greeks are floats and must NEVER reach an
  `accept` list).

## 2. Engine — `src/engine/options.ts` (BigRational, exact, dependency-free)

**BigRational `{n:bigint;d:bigint}` decision (FROZEN):** mirrors `optimalStopping.ts`.
The denominator is normalised positive, `reduce` throws on `d=0`. The `toBig` / `fromBig`
/ `ratToNumber` / `formatRational` bridge connects the BigInt kernel to the plain-number
`RationalSchema` used in fixtures and `validate-fixtures`. No float is ever produced on a
graded/anchored path (`ratToNumber` and `blackScholesCall` / `continuousGreek` are
display-only).

### Types (FROZEN)
```ts
export type BigRational = { n: bigint; d: bigint }
export type Kind = 'call' | 'put'
export type Leg = {
  kind: 'call' | 'put' | 'stock' | 'bond'
  K?: BigRational
  qty: BigRational
}
```

### Public signatures (FROZEN)
```ts
export function toBig(r: { n: number; d: number }): BigRational
export function fromBig(r: BigRational): { n: number; d: number }
export function formatRational(r: BigRational): string
export function ratToNumber(r: BigRational): number          // display-only, never graded

// L1 — Payoffs
export function callPayoff(ST: BigRational, K: BigRational): BigRational
export function putPayoff(ST: BigRational, K: BigRational): BigRational
export function spreadPayoff(legs: Leg[], ST: BigRational): BigRational

// L2 — Put–Call Parity
export function parityGap(C: BigRational, P: BigRational, S: BigRational, K: BigRational, D: BigRational): BigRational
export function paritySolve(known: { C?: BigRational; P?: BigRational; S?: BigRational; K?: BigRational; D?: BigRational }): BigRational
export function callBounds(S: BigRational, K: BigRational, D: BigRational): { lo: BigRational; hi: BigRational }

// L3 — Binomial Pricing
export function riskNeutralQ(u: BigRational, d: BigRational, R: BigRational): BigRational
export function binomialPrice(S: BigRational, u: BigRational, d: BigRational, R: BigRational, K: BigRational, n: number, kind: Kind): BigRational
export function replicate(S: BigRational, u: BigRational, d: BigRational, R: BigRational, K: BigRational, kind: Kind): { delta: BigRational; bond: BigRational }

// L4 — Multi-step Trees
export function treeTerminals(S: BigRational, u: BigRational, d: BigRational, n: number): BigRational[]
export function treeWeights(q: BigRational, n: number): BigRational[]
export function pathCount(n: number, k: number): bigint

// L5 — Portfolio Theory
export function hedgeRatio(cov: BigRational, varB: BigRational): BigRational
export function minVarWeights(varA: BigRational, varB: BigRational, cov: BigRational): { wA: BigRational; wB: BigRational; varMin: BigRational }
export function oneTouchPrice(H: BigRational): BigRational

// L6 — Greeks
export function greekSign(greek: string, kind: Kind): -1 | 0 | 1

// Display-only (FLOATS — NEVER on a graded path)
export function blackScholesCall(...): number
export function continuousGreek(...): number
```

`blackScholesCall` and `continuousGreek` are display-only and NEVER an `accept`. They
produce floats and are strictly fenced from the grading path.

### §5 dossier goldens reproduced exactly (FROZEN)
These are asserted by `validate-fixtures.ts` §6d on every run:

| label | result |
|---|---|
| canonical tree q=1/2, price call | 10 |
| canonical tree Δ call | 1/2 |
| canonical tree B call | −40 |
| canonical tree price put | 10 |
| canonical tree Δ put | −1/2 |
| canonical tree B put | 60 |
| twin price (u=7/4,d=3/4,R=5/4) | 30 |
| twin Δ | 3/4 |
| twin B | −45 |
| 2-step price n=2 | 11 |
| treeTerminals(100,6/5,4/5,2) | 144, 96, 64 |
| treeWeights(1/2,2) | 1/4, 1/2, 1/4 |
| minVarWeights wA | 6/7 |
| minVarWeights wB | 1/7 |
| minVarWeights varMin | 27/700 |
| oneTouchPrice(5/4) | 4/5 |
| parityGap(8,2,100,95,1) | 1 |
| paritySolve C (P=3,S=50,K=44,D=10/11) | 13 |

## 3. Method ids and registry entries

Six new lesson ids (domains `['options']`):
```
lesson-options-1
lesson-options-2
lesson-options-3
lesson-options-4
lesson-options-5
lesson-options-6
```

New CONFUSABLE block (to be added to `src/content/methods.ts`):
options concepts share surface with probability concepts; confusable entries capture
the risk-neutral Q vs real-world P confusion, call/put payoff sign errors, and
replication vs pricing conflation.

Seven reverse edges (to be added to the method graph): the standard 7 cross-links
from `backward-induction` to `options` (forward-induction in trees), and from parity
to arbitrage detection.

`backward-induction.domains += 'options'` — backward induction in binomial trees is
the same algorithmic primitive as in game trees; the method registry entry must list
`'options'` in its domains array.

## 4. Renderer / dispatcher / CSS slots (FROZEN)

- **Renderer:** `src/lesson/beats/OptionBoardBeat.tsx` — `export function OptionBoardBeat(props: BeatProps)`,
  dispatches on `it.display` into:
  - `PayoffDiagramDisplay` — P/L curve at expiry rendered in SVG; `spreadPayoff` at `markS`.
  - `BinomialTreeDisplay` — risk-neutral lattice SVG; `binomialPrice` headline.
  - `ParityScaleDisplay` — balance-scale SVG illustrating put–call parity; `parityGap` headline.
  - `GreeksSliderDisplay` — Black–Scholes sensitivity sliders (display-only; no headline).
  Uses `chapterColor(props.lessonId)` for SVG strokes. Reduced-motion final frame;
  one `aria-live` mirror per view; 44px tap targets. **Ungraded — advances on Continue**
  (same shape as `StoppingBoardBeat` / `CovarianceBoardBeat`).
- **Dispatcher:** `src/lesson/beats/index.tsx` — `case 'optionBoard': return <OptionBoardBeat {...props} />`.
- **CSS:** `src/styles/surfaces/options.css` (classes `optboard__*` / `optboard--*`, tokens only,
  reduced-motion block), imported in `src/styles/app.css`.

## 5. validate-fixtures wiring (FROZEN)

### §3h — optionBoard engine cross-check
`scripts/validate-fixtures.ts` §3h: for every `optionBoard` beat with a `headline`,
recompute via `options.ts` (switch on `display`) and assert equality:

- `payoffDiagram` → `optFmt(optSpreadPayoff(legs.map(toOptLeg), optToBig(markS)))`.
  Requires `legs` + `markS` present; else `fail`.
- `binomialTree` → `optFmt(optBinomialPrice(S0,u,d,R,K,n,kind))`. If headline equals
  price string, pass. Else if `tree.n === 1`, also check `optFmt(optReplicate(...).delta)`;
  if it matches, pass. Else `fail` with both expected values.
- `parityScale` → `optFmt(optParityGap(C,P,S,K,D))` using the legs-carry-values
  convention (see §6). Requires all four leg kinds present and `bond.K` present; else `fail`.
- `greeksSlider` → **`continue` (display-only, exempt)**.

A beat with no `headline` is skipped (passive display). It is a **no-op when no options
fixtures exist** (verified: `✓ optionBoard headlines match options.ts (0 beats)`).

### §6d — options engine self-check
`scripts/validate-fixtures.ts` §6d: `{ ... }` block asserting every §5 dossier golden
above. Runs unconditionally on every `tsx scripts/validate-fixtures.ts` invocation.
Emits `✓ options engine self-check (Stage-2 anchor)`.

### GATED and MASTERY_LESSONS
`lesson-options-1` through `lesson-options-6` are added to both the `GATED` set and
the `MASTERY_LESSONS` set in a `// concept-options (Wave-0 contract).` section.

## 6. parityScale legs convention (FROZEN)

For `display: 'parityScale'`, the four legs carry the put–call parity inputs with
`qty` = dollar value:

| leg kind | carries |
|---|---|
| `call` | C (call price) — `callLeg.qty` |
| `put` | P (put price) — `putLeg.qty` |
| `stock` | S (spot price) — `stockLeg.qty` |
| `bond` | K (strike, discount factor denom) — `bondLeg.K`; D (discount factor) — `bondLeg.qty` |

Headline = `parityGap(C, P, S, K, D)`.

The `bond` leg is the only leg that uses its optional `K` field (for the strike /
present-value denominator); all other legs carry their value solely in `qty`. The
cross-check requires all four kinds present and `bond.K` non-null; `fail` otherwise.

## 7. binomialTree headline convention (FROZEN)

`headline` = the option price computed by `binomialPrice(S0,u,d,R,K,n,kind)`.

Exception: a **one-step** (`tree.n === 1`) beat MAY instead use the **replication
delta** (`replicate(...).delta`) as its headline when the pedagogical focus is
delta-hedging rather than pricing. The cross-check tests the price string first; if it
doesn't match and `n === 1`, it tests the delta string; otherwise it `fail`s with both
expected values.

Multi-step (`n ≥ 2`) beats always use the price string.

## 8. Course scaffold (FROZEN)

`fixtures/course-options.json` exists and contains:
- Catalog card (`courseId: 'course-options'`, `title`, `domain`, `status: 'live'`, accent, vizKey).
- Three chapters with their `lessonIds` arrays.
- Six lesson nodes (`lesson-options-1..6`) with `built: false`.
- `roadmap: []` (no prerequisite roadmap edges yet).

Stage-4 per-lesson builds flip `built: true` and add `fixtures/lesson-options-N.json`.
These can be built in parallel (no shared-file contention). A single serial integration
step in Stage 4 flips all six nodes to `built: true` and adds the lesson fixture files.
