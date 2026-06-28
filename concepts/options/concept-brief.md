# Concept: Options, Payoffs & No-Arbitrage  (course-options)

> Stage-1 Concept Brief — Department 1 (Curriculum / Learning Science). Sibling artifacts in this dir:
> `continuity-report.md` (overlap → recall conversions), `source-dossier.md` (the verified, cited,
> exact-rational problem set — 22 numbered problems, 20 engine-graded + 2 display-only). Every lesson
> below anchors to numbered dossier problems. This is the **first concept of a brand-new fourth domain,
> "Quantitative Finance."**

## Green Book anchor
Grounded in *A Practical Guide To Quantitative Finance Interviews* (Xinfeng Zhou),
`/Users/ericwu/Developer/brilliant.org/references/green-book.txt`, **Chapter 6 — Finance** (with two
cross-chapter methods):
- **§6.1 Option Pricing — p.69-73** (L10727+): call/put payoffs `max(S−K,0)` / `max(K−S,0)` (L10744),
  the protective-put identity `max(S_T−K,0)+K = max(S_T,K)` (L10800), **put-call parity
  `C − P = S − K·e^(−rT)`** (L10820/L10840), American-vs-European facts, **risk-neutral pricing
  `price = e^(−rT)·E_Q[payoff]`** (L11002/L11319), the Black-Scholes-Merton PDE (L11183), the
  **Black-Scholes formula** `c = S·N(d1) − K·e^(−rT)·N(d2)` + its 5 assumptions (L11274/L11360).
- **§6.2 The Greeks — p.75** (L11736): Greek **signs** (Δ, Γ, Θ, vega, ρ) + the exact **one-touch
  digital = 1/H** no-arbitrage replication (L11741).
- **§6.3 Option Portfolios & Exotics — p.80** (L12519): straddle `|S_T−K|` (L12552), **bull call
  spread** bounded by `e^(−rT)(K₂−K₁)` (Table 6.3, L12449-12503), butterfly, **digital ≈ tight bull
  spread** (L12591).
- **§6.4 Other — p.82-85**: **min-variance two-stock portfolio ⇒ 6/7 in A, 1/7 in B** (L12795), VaR,
  duration/convexity, forwards-vs-futures.
- **§5.3 Dynamic Programming / backward induction — p.61** (L9497): the method binomial pricing *is*
  (roll option values backward through the lattice). **§4.5 Optimal hedge ratio
  `h = ρσ_A/σ_B = Cov(A,B)/Var(B)` — p.48** (L7647): the exact min-variance hedge = the option delta in
  a new costume.

*Why legitimate to teach:* §6.1-§6.4 is a named GB chapter explicitly about option pricing as an
interview topic. The GB prices vanilla options by **risk-neutral expectation** + **no-arbitrage
replication** and teaches **backward induction** in §5.3, but it prints no explicit u/d lattice — so
every binomial problem is GB-anchored to §6.1 risk-neutral + §5.3 backward induction and **web-sourced**
for the tree mechanics (anchor-and-source rule), with rational u,d,R chosen for exactness and
hand-verified in `source-dossier.md` §1.

## One-line promise
**Two portfolios with the same payoff must cost the same — so you can price and hedge any option by the
trade that cannot lose.**
(Theme: no-arbitrage as the engine of all option value — from the piecewise-linear payoff, through the
put-call-parity identity and no-arb bounds, to replication, the risk-neutral measure q, the binomial
tree, and the delta hedge — with Black-Scholes reached as the continuous limit but never graded.)

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)
- **courseId:** `course-options`
- **title:** Options, Payoffs & No-Arbitrage
- **domain:** `Quantitative Finance`  *(NEW — the macro shelf's 4th domain row)*
- **domainOrder:** `3`  (Probability=0, Combinatorics & Games=1, Algorithms & Information=2 → Finance=3)
- **order:** `0`  (first concept in the new domain)
- **status:** `live`
- **tagline:** `Price the trade that cannot lose.`  (32 chars ≤ 60)
- **accent:** `ch2`  (the two most-recent new-domain leads both took `ch5` — covariance and
  binary-information; `ch2` keeps the new Finance row visually distinct and resolves to a real Konva hex.
  Per binary-information flag #1, `chapters.ts CHAPTER_HEX` only defines ch1–ch4 — so all **chapter**
  accents below stay inside ch1–ch4; the per-card `accent` enum is ch1–ch5.)
- **vizKey:** `twoNode`  (the binomial **up/down node** is the concept's defining glyph; `twoNode` is the
  established "two-things / two-outcomes" thumbnail (Bayes / Markov-L1 / covariance). Runner-up `sum`
  reads as the EV Σ-family and undersells the no-arb branch.)
- **completionMilestoneId:** `options-complete`  (mirrors the corpus convention `covariance-complete` /
  `binary-information-complete`)
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-options-1 | The Contract & No-Arbitrage | ch2 | [lesson-options-1, lesson-options-2] |
| ch-options-2 | Composing & Pricing | ch4 | [lesson-options-3, lesson-options-4] |
| ch-options-3 | Trees, Greeks & the Wild | ch1 | [lesson-options-5, lesson-options-6] |

**Coverage proof (the catalog's hard requirement for a LIVE concept):** the union of chapter
`lessonIds` = {lesson-options-1, -2, -3, -4, -5, -6} = the complete six-lesson set; 2+2+2 = 6; no
lessonId is duplicated and none is omitted, so every built lesson renders inside exactly one chapter
(satisfies the `validate-fixtures.ts §7` chapters-coverage gate; avoids the silent fallback to
Pattern-Hitting-Times' chapters that would render the new lessons invisible).

## Lessons (ordered)
Beat arc per lesson is the standard **Bet → Explore → Model → Prove** (matching the
`lesson-expected-value-*` / `lesson-covariance-*` shape: a graded `retrievalGrid` cold opener, an
ungraded `prediction` bet, an explore widget, a `primer`/`tripletReveal` model card with
`introducesSymbol`, graded `answerEntry` / which-method `prediction.gate`, a held-out transfer, a
`masteryChallenge` prove beat, and a `recap` close). Sequence respects teach-fresh order: payoffs →
parity/no-arb → composition → one-step pricing → multi-step tree/limit → synthesis.

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors (dossier #) |
|---|----------|-------|--------------------|---------|----------|--------|----------------------------|
| L1 | lesson-options-1 | Payoffs & the Contract | Read & compose option payoffs — long/short call & put as piecewise-linear `max(·,0)`; intrinsic vs time value; the protective-put identity `max(S_T,K)`. | `lesson-expected-value-1` | (S−K)⁺ | twoNode | **#1, #2, #3, #4[t]** — GB §6.1 p.69 L10744, p.70 L10800; §6.3 p.80 L12552 |
| L2 | lesson-options-2 | Put-Call Parity & No-Arbitrage | Derive `C − P = S − K·D` as a no-arb identity (r=0 ⇒ `C−P=S−K`); spot the arbitrage gap & build the conversion trade; bound a call/put by no-arbitrage. | `lesson-options-1`, `lesson-game-theory-1` | C−P | twoNode | **#5, #6, #7, #8[t]** — GB §6.1 p.70 L10820/L10840 |
| L3 | lesson-options-3 | Spreads & Straddles | Compose multi-leg payoffs (bull spread, butterfly, straddle, strangle); read caps & break-points; bound a spread's price `0 ≤ c₁−c₂ ≤ K₂−K₁` by no-arbitrage. | `lesson-options-1` | c₁−c₂ | sum | **#9, #10, #11, #12[t]** — GB §6.3 p.80 L12449-12503, L12527-12566 |
| L4 | lesson-options-4 | One-Step Binomial: Price by Replication | Price by replication (Δ shares + bond B) **and** by the risk-neutral measure `q=(R−d)/(u−d)`; show hedge cost = price; `price = (1/R)·E_q[payoff]`. | `lesson-options-2`, `lesson-expected-value-1`, `lesson-game-theory-5` | q | twoNode | **#13, #14, #15, #16[t]** — GB §6.1 risk-neutral L11002 + §5.3 backward L9497; web (Cudina, Worrall, AnalystPrep) |
| L5 | lesson-options-5 | Multi-Step Binomial → Black-Scholes | Fold a multi-step tree by backward induction; weight nodes `nCk·q^k(1−q)^(n−k)`; reach Black-Scholes as the **display-only** continuous limit (sliders). | `lesson-options-4`, `lesson-combinatorics-3` | nCk | randomWalk | **#17, #18, #19 (BS display-only), #20[t]** — GB §5.3 L9497 + §6.1 L11319; BS L11274/L11360 |
| L6 | lesson-options-6 | Synthesis: Hedging, Greeks & In the Wild | Show the option **delta = the Cov/Var hedge ratio**; read the exact Greek **signs**; pick the right tool (delta-hedge vs replicate vs q-price) on unlabeled problems. | `lesson-options-1`…`5`, `lesson-covariance-5`, `lesson-covariance-3` | Δ | twoNode | **#21, #22**, Greek-signs note, one-touch digital[t] — GB §6.2 p.75 L11736/L11741; §6.4 p.82-85; §4.5 p.48 L7647 |

**All 22 dossier problems placed:** L1 #1,#2,#3,#4 · L2 #5,#6,#7,#8 · L3 #9,#10,#11,#12 · L4 #13,#14,#15,#16
· L5 #17,#18,#19,#20 · L6 #21,#22 + the one-touch-digital transfer + the Greek-signs sign-item. The two
`exact-verifiable: NO` items (BS price #19; continuous Greeks) are honored **display-only /
sourced-reference**, never an `accept` — exactly as the covariance concept graded **ρ² (rational)**
instead of the irrational ρ.

**Per-lesson `milestoneId` (for the fixture; `built:true`):** `opt-payoffs`, `opt-parity`,
`opt-spreads`, `opt-replication`, `opt-tree`, `opt-synthesis`.

**Retrieval openers baked in** (per `continuity-report.md` §3a; each a COLD recall of a *prior*
concept, not a primer): L1 → "what is a fair bet worth? `E[X]=Σx·P(x)`, fair die → 7/2"
(`ev1-recall`) → "an option is a bet that bends at the strike"; L2 → "a move best no matter what the
opponent does is …?" → *dominant* (`game-theory-1 l1-recall`) → "arbitrage is a dominant money-pump";
L4 → "state `E[X]` over outcomes" (`ev1-*`) → productive-failure twist "average payoff under the *real*
odds? — no, discounted average under **q**"; L5 → "sum of Pascal row n = ? · `C(n,k)` counts ?" → "2ⁿ /
size-k subsets" (`combinatorics-3 l3-recall`); L6 → "state `Var(X+Y)` · the hedge ratio `h*`?" →
"`Var+Var+2Cov` / `h*=Cov/Var=−2/3`" (`cov3-win`, `cov5-win`) + "σ = SD = spread" (`cov1`). The single
**cumulative interleaved capstone checkpoint** lives in **L6**, cloned from
`lesson-states-streaks.json`'s mixed-review design — **no scheduler** (the unlock order *is* the
spacing).

## Concept arc (Bet → Explore → Model → Prove, across lessons)
- **Ch1 The Contract & No-Arbitrage** — *the identity first.* **L1** grounds the option as a
  piecewise-linear bet (draw the payoff before any pricing). **L2** turns the no-free-lunch intuition
  into the exact `C−P=S−K·D` identity and the conversion arbitrage — pricing is *forced* by
  no-arbitrage, not chosen.
- **Ch2 Composing & Pricing** — *build it, then price it.* **L3** composes legs into spreads/straddles
  (payoffs add; prices are bounded by no-arb). **L4** prices the simplest non-trivial option two
  equivalent ways — **replication** (Δ, B) and the **risk-neutral q** — and proves they agree
  (hedge cost = discounted q-expectation). This is where the marquee misconception (q = the real
  probability / a Bayes posterior) is drilled.
- **Ch3 Trees, Greeks & the Wild** — *scale it, then choose the tool.* **L5** folds the multi-step tree
  by backward induction and weights nodes with the recalled `C(n,k)`; Black-Scholes appears only as the
  slider-driven continuous limit (display-only). **L6** is the cumulative interleaved capstone: the
  option **delta is the hedge ratio you already know**, the Greek **signs** are exact, and the learner
  must *choose* the method on unlabeled problems.

## New engine(s) / widget(s) anticipated (for Wave 0)

### EXACT-RATIONAL / N(·) CONSTRAINT (this concept's central design risk)
**Black-Scholes `c = S·N(d1) − K·e^(−rT)·N(d2)` and the continuous Greeks Δ=N(d1), Γ, vega, Θ are
irrational** (`N(·)` is the standard-normal CDF; CRR `u=e^(σ√Δt)` and `R=e^(rΔt)` are irrational
exponentials). The pure, dependency-free, **NO-float** engine therefore:
1. **Grades only the exact discrete no-arbitrage core** — piecewise-linear payoffs, put-call parity
   with a **rational discount D**, no-arb bounds, and the **binomial tree with u,d,R chosen as exact
   rationals** so `q=(R−d)/(u−d)`, price, Δ, bond B, and the n-step weights `nCk·q^k(1−q)^(n−k)` are all
   rational. (Prefer `r=0 ⇒ D=1, R=1`; otherwise a given rational `D=1/(1+r)` / `R=11/10` / `R=5/4`.)
2. **Demotes Black-Scholes & continuous Greeks to display-only** — reached via sliders as the continuous
   limit; any number printed (e.g. "≈ 10.45", N(d1)) is a **sourced reference**, passed through a
   `ratToNumber`-style escape, and is **excluded from `validate-fixtures` golden `accept`s.**
3. **Grades the binomial Δ, not N(d1); grades variances/weights, not √-of-variance** — the option's
   graded delta is `Δ=(V_u−V_d)/(S(u−d))` (rational); min-variance grades the **weights (6/7, 1/7)** and
   **Var (27/700)**, never the irrational σ=√(27/700). (Same "grade the square, not the root" discipline
   as ρ²/Cov in covariance.) Greek **signs** are graded as exact qualitative facts; Greek **magnitudes**
   are display-only.

### Engine — `src/engine/options.ts` (NEW FILE; pure, exact rational, NO floats)
**Rational-type reconciliation flag (checked — Wave-0/Dept-3 must resolve):** existing
`src/engine/types.ts` defines `Rational = { n: number; d: number }` (plain JS `number`), and the fixture
`RationalSchema` is `z.number().int()`. JS numbers are exact only while n, d stay < 2⁵³ — but the tree's
`5ⁿ` denominators, the `nCk·q^k(1−q)^(n−k)` products, and powers like `(6/5)³=216/125` blow up denominators
and risk overflow under repeated multiplication. Mirroring the covariance dossier, `options.ts` should use
a **local `BigRational {n:bigint; d:bigint}`** (as `optimalStopping.ts`/`combinatorics.ts` do) with a
display-only `ratToNumber` escape. **Flag to Wave-0/Dept-3:** reconcile the engine's `BigRational` with the
fixture `RationalSchema` (the identical flag covariance raised — resolve once, shared).

Proposed public surface (all in/out exact rationals unless marked display-only; `Rat = BigRational`):

```ts
type Rat  = { n: bigint; d: bigint }            // exact; NO floats
type Kind = 'call' | 'put'
type Leg  = { kind: 'call' | 'put' | 'stock' | 'bond'; K?: Rat; qty: Rat }  // qty<0 = short

// L1 — payoffs (piecewise-linear, exact)
export function callPayoff(ST: Rat, K: Rat): Rat            // max(S_T − K, 0)
export function putPayoff(ST: Rat, K: Rat): Rat             // max(K − S_T, 0)
export function legPayoff(leg: Leg, ST: Rat): Rat
export function spreadPayoff(legs: Leg[], ST: Rat): Rat     // Σ qty·legPayoff → bull/butterfly/straddle/strangle/protective-put

// L2 — put-call parity & no-arb bounds (D = rational discount; D=1 when r=0)
export function parityGap(C: Rat, P: Rat, S: Rat, K: Rat, D: Rat): Rat     // (C−P) − (S − K·D); 0 ⇒ fair, ≠0 ⇒ arb
export function paritySolve(known: Partial<{C,P,S,K,D}>): Rat             // solve the one missing leg
export function parityArbLeg(C: Rat, P: Rat, S: Rat, K: Rat, D: Rat): { trade: Leg[]; profitToday: Rat }  // conversion/reversal
export function callBounds(S: Rat, K: Rat, D: Rat): { lo: Rat; hi: Rat }  // max(S−K·D,0) ≤ C ≤ S
export function putBounds(S: Rat, K: Rat, D: Rat):  { lo: Rat; hi: Rat }  // max(K·D−S,0) ≤ P ≤ K·D

// L4 — one-step binomial (u,d,R given exact rationals; CRR e^(σ√Δt) REJECTED as a graded input)
export function riskNeutralQ(u: Rat, d: Rat, R: Rat): Rat                 // (R − d)/(u − d)
export function binomialPrice(S: Rat, u: Rat, d: Rat, R: Rat, K: Rat, n: number, kind: Kind): Rat   // (1/Rⁿ)·Σ weight·payoff
export function replicate(S: Rat, u: Rat, d: Rat, R: Rat, K: Rat, kind: Kind): { delta: Rat; bond: Rat }
//   delta = (V_u − V_d)/(S(u−d)); bond = price − delta·S

// L5 — multi-step tree
export function treeTerminals(S: Rat, u: Rat, d: Rat, n: number): Rat[]   // S·u^k·d^(n−k)
export function treeWeights(q: Rat, n: number): Rat[]                     // nCk·q^k(1−q)^(n−k)  (Σ = 1)
export function pathCount(n: number, k: number): bigint                   // nCk (reuse combinatorics.ts)

// L6 — hedging / portfolio / exotic (Cov/Var algebra, exact)
export function hedgeRatio(cov: Rat, varB: Rat): Rat                      // Cov/Var  (= the option Δ, new costume)
export function minVarWeights(varA: Rat, varB: Rat, cov: Rat): { wA: Rat; wB: Rat; varMin: Rat }
export function oneTouchPrice(H: Rat): Rat                                // 1/H  (martingale S₀=1, r=0)
export function greekSign(greek: 'delta'|'gamma'|'theta'|'vega'|'rho', kind: Kind): -1 | 0 | 1  // exact SIGN only

// DISPLAY-ONLY boundary — NEVER an `accept`; excluded from validate-fixtures goldens
export function ratToNumber(x: Rat): number                              // plotting escape hatch
export function blackScholesCall(S:number,K:number,r:number,sigma:number,T:number): number  // c=S·N(d1)−K·e^(−rT)·N(d2) — irrational, sourced reference
export function continuousGreek(...): number                             // Δ=N(d1), Γ, vega, Θ — irrational, display-only
```

**Engine goldens (`options.test.ts` + cross-checked in `validate-fixtures.ts`, like the
combinatorics/EV self-checks). Every graded fixture answer is one of these exact rationals:**
- **Payoffs:** `callPayoff(130,100)=30`, `callPayoff(70,100)=0`; `putPayoff(70,100)=30`,
  `putPayoff(130,100)=0`; protective put `max(S_T,100)`: 130→**130**, 80→**100**; straddle `|S_T−100|`:
  130→**30**, 70→**30**; bull(100,120): 130→**20** (cap), 110→**10**, 90→**0**; butterfly(90,100,110):
  100→**10**, 90/110→**0**; strangle(put90,call110): 130→**20**, 100→**0**, 70→**20**.
- **Parity / bounds (r=0 unless noted):** `parityGap(8,2,100,95,1)=1` (arb profit $1 → conversion);
  `paritySolve P (C=10,S=100,K=100,D=1)=10`; `paritySolve C (P=3,S=50,K=44,D=10/11)=13`;
  `callBounds(100,90,1)={lo:10, hi:100}`.
- **One-step binomial:** canonical (S=100,u=6/5,d=4/5,R=1,K=100): `riskNeutralQ=1/2`, `binomialPrice
  call=10`, `replicate={delta:1/2, bond:−40}`, hedge cost=**10**; **put** same tree: price=**10**,
  `replicate={delta:−1/2, bond:60}`, parity C−P=0 ✓; sourced twin (S=100,u=7/4,d=3/4,R=5/4): `q=1/2`,
  price=**30**, `{delta:3/4, bond:−45}`; q-drill `riskNeutralQ(3/2,1/2,11/10)=3/5`.
- **Multi-step (S=100,u=6/5,d=4/5,R=1):** `treeTerminals(·,2)={144,96,64}`; `treeWeights(1/2,2)=
  {1/4,1/2,1/4}`; `binomialPrice n=2 call=11` (intermediate C_u=22, C_d=0); `pathCount(2,1)=2`,
  `pathCount(2,0)=pathCount(2,2)=1`; 3-step top: `pathCount(3,3)=1`, terminal `100·(6/5)³=864/5 (172.8)`.
- **Hedge / portfolio:** `hedgeRatio(6,9)=2/3`, `hedgeRatio(−6,9)=−2/3`; `minVarWeights(1/25, 9/100,
  3/100)={wA:6/7, wB:1/7, varMin:27/700}`.
- **Exotic:** `oneTouchPrice(5/4)=4/5`, `oneTouchPrice(2)=1/2`.
- **DISPLAY-ONLY (NEVER an `accept`):** any `blackScholesCall(...)`, `N(d1)/N(d2)`, continuous Γ/vega/Θ,
  implied vol, σ inferred from a tree, and every "which tool?" forwards/futures/VaR/duration fact.

### New interaction type — exactly ONE, folded (the `covarianceBoard` / `chainBoard` / `stoppingBoard` precedent)
Per the continuity report's reuse-first directive, the whole beat arc reuses shipped types — openers
`retrievalGrid`, bets `prediction`, which-method gates `prediction.gate`, model cards
`primer`/`tripletReveal`, faded derivations `equationTiles`, the BS continuous-limit control the shipped
`slider` (ungraded), graded reads `answerEntry`, the capstone `masteryChallenge`, close `recap`. The only
genuinely-new *visual* objects (the hockey-stick payoff diagram, the u/d lattice, the no-arb scale) are
rendered by no existing widget. Propose **one** new discriminated-union member, four `display` modes
folded under it:

```ts
z.object({
  type: z.literal('optionBoard'),
  display: z.enum(['payoffDiagram', 'binomialTree', 'parityScale', 'greeksSlider']),
  legs: z.array(z.object({                                   // payoffDiagram / parityScale
    kind: z.enum(['call','put','stock','bond']),
    K: RationalSchema.optional(),
    qty: RationalSchema,                                     // <0 = short
  })).optional(),
  tree: z.object({                                          // binomialTree (no directly-nested arrays — Firestore-safe)
    S0: RationalSchema, u: RationalSchema, d: RationalSchema,
    R: RationalSchema, K: RationalSchema,
    n: z.number().int(), kind: z.enum(['call','put']),
  }).optional(),
  sigma: RationalSchema.optional(),                          // greeksSlider (illustrative continuous limit; display-only)
  markS: RationalSchema.optional(),                          // the S_T read-off marker
  labels: z.array(z.string()).optional(),
  interactive: z.boolean().optional(),
  headline: z.string().optional(),                          // reduced "n/d" payoff / price / parity gap / Δ — the validation anchor
})
```
- **`payoffDiagram`** — hockey-stick payoff vs `S_T`; drag/compose legs; the piecewise-linear curve
  redraws live; `headline` = payoff at `markS`. **L1, L3, L6.**
- **`binomialTree`** — the u/d lattice; tap a node to read S, the q-weight, and the rolled-back option
  value; a side panel shows the replicating `{delta, bond}`; `headline` = price or Δ. **L4, L5, L6.**
- **`parityScale`** — the no-arbitrage balance: `C + K·D` on one pan vs `P + S` on the other; the tilt
  *is* the arbitrage gap; build the conversion trade; `headline` = `parityGap`. **L2.**
- **`greeksSlider`** — **DISPLAY-ONLY** continuous limit: the shipped `slider` drives σ (or steps n→∞)
  to morph the binomial price toward the BS curve and show Greek **signs**; every number is a
  `ratToNumber` sourced reference, **never** an `accept`. **L5, L6.**

All graded inputs are exact rationals; the renderer computes every value via `src/engine/options.ts`;
`headline` is the engine-reproducible anchor cross-checked by `validate-fixtures.ts` (the `greeksSlider`
view is exempt — display-only). `optionBoard` is **not graded, not a HERO_TYPE** (graded reads use
`answerEntry` / `masteryChallenge`); folding four views under one `type` keeps the Wave-0 schema delta to
a **single** new member, matching the `chainBoard`/`covarianceBoard`/`stoppingBoard` precedent.

> ⚠️ **FALSE-OVERLAP — do NOT reuse `payoffMatrix`.** The shipped `payoffMatrix`
> (`PayoffMatrixBeat.tsx`, `lesson-game-theory-1..4`) is a **2-player strategic bimatrix** (strategies ×
> strategies, dual `(row,col)` cells, tasks `dominance`/`bestResponse`) — **NOT** an option payoff
> diagram (single-axis payoff vs spot `S_T`, the hockey-stick). Name collision only; reusing it would
> mis-model the concept (the options analogue of covariance's `correlation.ts`/autocorrelation false
> overlap flagged by the continuity report). `optionBoard display:'payoffDiagram'` is the correct,
> separate widget.

### Wave-0 wiring the build wave MUST do (else gates pass vacuously / lessons render invisible)
1. Add `lesson-options-1..6` to **`GATED`** and **`MASTERY_LESSONS`** in `scripts/validate-fixtures.ts`
   (else the inclusivity + mastery gates silently skip them).
2. Add `optionBoard` to `InteractionSchema` (the discriminated union) + a `BeatView` dispatch case in
   `src/lesson/beats/index.tsx`; add an engine cross-check block validating each `headline` (skip
   `greeksSlider`).
3. Add the six lessonIds to `chapters.ts`'s `LESSON_CHAPTER` mapping (ch2/ch4/ch1 per the table) so the
   lesson shell resolves an accent hex (only ch1–ch4 have hexes — chapter accents kept inside that set).
4. Add the **six new method ids** to `src/content/methods.ts` (`METHODS`) **and** the symmetric
   `CONFUSABLE` edges below — including the **reverse edges on the seven existing ids** and
   `backward-induction.domains += 'options'` (the `methods.test.ts` symmetry case will fail otherwise).
5. Author `src/engine/options.ts` + `options.test.ts` reproducing every golden above (Stage-2 math gate),
   with the BS/continuous-Greek functions behind the display-only boundary.

## Learning-science coverage (`learning-science.md` — concept level)

### New `methods.ts` `schemaId`s (Wave-0 additions; `domains: ['options']`)
Everything options *is* is teach-fresh (the continuity report's corpus grep returns zero finance hits), so
six new deep-structure method ids are required. The binomial tree is **not** minted as a duplicate of
`backward-induction` — it is its own options-specific id (`binomial-pricing`) that is **CONFUSABLE** with
`backward-induction` (deep-structure near-miss), and `backward-induction`'s `domains` gains `'options'`.

| id | name | domains | within-options CONFUSABLE | cross-domain CONFUSABLE (existing ids) |
|----|------|---------|---------------------------|----------------------------------------|
| `payoff-construction` | Payoff construction | `['options']` | put-call-parity, no-arbitrage-replication | — |
| `put-call-parity` | Put–call parity | `['options']` | payoff-construction, no-arbitrage-replication | — |
| `no-arbitrage-replication` | No-arbitrage replication | `['options']` | payoff-construction, put-call-parity, risk-neutral-pricing, delta-hedging | dominance-nash |
| `risk-neutral-pricing` | Risk-neutral pricing | `['options']` | no-arbitrage-replication, binomial-pricing | conditioning, linearity-indicators, prior-update |
| `binomial-pricing` | Binomial pricing | `['options']` | risk-neutral-pricing, delta-hedging | backward-induction, first-step-analysis, recursion-self-reference |
| `delta-hedging` | Delta hedging | `['options']` | no-arbitrage-replication, binomial-pricing | linearity-indicators |

**Full new-id `CONFUSABLE` map (add verbatim; symmetric within the new ids):**

```ts
'payoff-construction':       ['put-call-parity', 'no-arbitrage-replication'],
'put-call-parity':          ['payoff-construction', 'no-arbitrage-replication'],
'no-arbitrage-replication': ['payoff-construction', 'put-call-parity', 'risk-neutral-pricing', 'delta-hedging', 'dominance-nash'],
'risk-neutral-pricing':     ['no-arbitrage-replication', 'binomial-pricing', 'conditioning', 'linearity-indicators', 'prior-update'],
'binomial-pricing':         ['risk-neutral-pricing', 'delta-hedging', 'backward-induction', 'first-step-analysis', 'recursion-self-reference'],
'delta-hedging':            ['no-arbitrage-replication', 'binomial-pricing', 'linearity-indicators'],
```

**REVERSE edges Wave-0 MUST add to the existing ids (or `methods.test.ts` symmetry fails — the relation
is symmetric and every entry must be a valid id):**
- `dominance-nash`            → **add** `no-arbitrage-replication`  *(an arbitrage is a strictly-dominant money-pump)*
- `conditioning`             → **add** `risk-neutral-pricing`     *(price by conditioning on the first step's q-outcomes)*
- `linearity-indicators`     → **add** `risk-neutral-pricing` **and** `delta-hedging`  *(price = a linear combination of payoffs; the hedge ratio = a risk-cancelling linear coefficient)*
- `prior-update`             → **add** `risk-neutral-pricing`     *(refutes the "q = Bayes-updated p" misconception)*
- `backward-induction`       → **add** `binomial-pricing`  **AND** `domains` **+= `'options'`**  *(the tree IS a backward fold)*
- `first-step-analysis`      → **add** `binomial-pricing`         *(forward first-step vs backward fold — the L5 foil)*
- `recursion-self-reference` → **add** `binomial-pricing`         *(naive recursion vs the structured q-weighted fold)*

*Note on `delta-hedging ↔ (the covariance hedge ratio)`:* the option delta and the statistical hedge
ratio `h=Cov/Var` (`lesson-covariance-5`) are the **same deep method** in two costumes, but this
`lf-options` `methods.ts` snapshot ships **no covariance/hedge-ratio id** (only the binary-information
ids were added; covariance's beats currently tag a cross-domain id). So `delta-hedging`'s registered
cross-domain anchor is **`linearity-indicators`** (a hedge ratio is a least-squares / regression
coefficient). **Flag for Wave-0:** if/when the covariance concept registers a dedicated `hedge-ratio`
(or `covariance`) id, add the symmetric `delta-hedging ↔ <that id>` edge then; until then the
"same method, different costume" interleave below pairs the two **by surface**.

### Which-method gates (spec-13 / §2.2) — one graded `prediction.gate` per lesson
Each: `gate.correct == that beat's schemaId`, `optionMethods` = correct + distractors drawn **only** from
`CONFUSABLE[correct]`, `options[]` are positionally-aligned DISPLAY labels, prompt is **label-stripped**
(surface story only). All foils below are verified ⊂ `CONFUSABLE[correct]`.

| lesson | gate `correct` (= schemaId) | foils (from `CONFUSABLE[correct]`) | the confusion it drills |
|--------|-----------------------------|------------------------------------|--------------------------|
| L1 | `payoff-construction` | `put-call-parity`, `no-arbitrage-replication` | "is this a cash-value (payoff) read, a parity identity, or a pricing/replication?" |
| L2 | `put-call-parity` | `no-arbitrage-replication`, `payoff-construction` | "apply the parity identity vs build the replicating portfolio from scratch" |
| L3 | `payoff-construction` | `put-call-parity`, `no-arbitrage-replication` | "compose legs to read a spread payoff vs price/parity arguments" |
| L4 | `risk-neutral-pricing` | `linearity-indicators`, `conditioning`, `prior-update` | **the marquee:** discounted `E_q` vs expectation under the *real* p (linearity) vs a first-step average (conditioning) vs a Bayes posterior (prior-update) |
| L5 | `binomial-pricing` | `backward-induction`, `first-step-analysis`, `recursion-self-reference` | **the headline:** the q-weighted backward fold over the lattice vs bare backward induction vs forward first-step vs naive recursion |
| L6 | `delta-hedging` | `linearity-indicators`, `no-arbitrage-replication`, `binomial-pricing` | "the share count that cancels risk (= the Cov/Var hedge ratio) vs the static replication vs re-pricing the tree" |

### Cross-lesson interleaving / "same method, different costume" (§2.7)
- **`payoff-construction` (L1 single call/put) ≡ (L3 spreads/straddles compose) ≡ (L6 mixed):** one
  schema (read piecewise-linear value), three surfaces — the explicit `retrievalGrid`/compare beat.
- **`risk-neutral-pricing` × physical p (EV) × Bayesian posterior (Bayes) → L4:** interleave an EV
  "expected payoff under p" item, a Bayes "update p with evidence" item, and a "solve q from
  no-arbitrage" item so the learner sorts **physical vs risk-neutral vs posterior** by hand (continuity
  report §3b). Foils are exactly `CONFUSABLE[risk-neutral-pricing]`.
- **`binomial-pricing` ≡ `backward-induction` → L5:** the tree is the *same method* (fold from expiry) on
  a new surface (`lesson-game-theory-5` / `lesson-optimal-stopping-4`); the L5 gate makes the
  discrimination graded.
- **`delta-hedging` ≡ the covariance hedge ratio `h=Cov/Var` → L6:** the continuity report's headline —
  pair the option delta with `cov5-win`'s statistical min-variance hedge (one risk-cancelling ratio, two
  costumes; surface-paired pending the covariance id, see flag above).
- **`no-arbitrage-replication` ≡ dominance ("no free move") → L2:** interleave "find the dominant
  strategy" (`game-theory-1 l1-recall`) with "find the arbitrage" — both are "spot the strictly-better
  free move."
- **path-count `nCk` (Comb) vs node weight `nCk·q^k(1−q)^(n−k)` → L5:** interleave a pure "count the
  up/down paths to this node" item with a "probability of this node" item so counting and weighting stay
  distinct (continuity report §3b).

### Held-out transfer per lesson (spec-24 / §2.3)
Each lesson carries exactly one `heldOut:true, track:'B', required:false` graded beat with a `schemaId`
**equal to that lesson's mastery-challenge method**, on a visibly fresh surface, placed **immediately
before** the mastery challenge, engine-verified, and excluded from the visible/required walk:

| lesson | mastery `schemaId` | held-out transfer (dossier #, fresh surface) | engine golden |
|--------|--------------------|----------------------------------------------|---------------|
| L1 | `payoff-construction` | **#4** straddle `\|S_T−100\|` (vs the call payoff) | 30, 30 |
| L2 | `put-call-parity` | **#8** rational discount `D=10/11`, S=50,K=44,P=3 → solve C | **13** |
| L3 | `payoff-construction` | **#12** strangle (put90 + call110) at 130/100/70 | 20, 0, 20 |
| L4 | `risk-neutral-pricing` | **#16** price the **put** on the #13 tree (K=100); check parity | price 10, Δ=−1/2, B=60 |
| L5 | `binomial-pricing` | **#20** 3-step tree: paths to top `uuu` & its terminal | 1 path; 864/5 |
| L6 | `delta-hedging` | **#22** min-variance **two-stock** portfolio (σ_A=1/5,σ_B=3/10,ρ=1/2) | wA=6/7, wB=1/7, Var=27/700 |

> **L6 reconciliation note (spec-24 same-`schemaId` rule):** the parent floated the **one-touch digital**
> (price=1/H, #L6 transfer-candidate) as L6's transfer, but its method is **no-arbitrage-replication**
> (replicate by buying 1/H shares), not the L6 mastery method **delta-hedging** — so it would violate
> "transfer `schemaId` == mastery `schemaId`." Resolution: L6's held-out transfer is **#22** (a fresh
> *delta-hedging* surface — the Cov/Var minimization restruck as portfolio weights), and the **one-touch
> digital is kept as a separate graded "exotic in the wild" beat tagged `no-arbitrage-replication`**
> (H=5/4→4/5, H=2→1/2), which also gives `no-arbitrage-replication` a clean graded checkpoint. The Greek
> **signs** item (call Δ + , put Δ − , Γ + , vega + , Θ − , call ρ + , put ρ − ) is graded on the exact
> sign only (`greekSign`), magnitudes display-only.

### Interview Pack stance (§3)
**Brutal by default** for the quant-intensity audience: the `course-options` pool floor is `hard` and
every pooled question is **full-concept synthesis** — read a position's payoff → invoke parity/no-arb to
bound or solve → price it on a binomial tree → hedge it with the delta — always strictly harder than any
lesson's mastery challenge, with a follow-up chain ("now flip r to 1/4", "now price the put and verify
parity", "now state the hedge"). Tiers `hard | harder | brutal` drive a **tier-aware** `hidden.rubric` +
interviewer prompt so a brutal multi-step replication is not graded on the `hard` rubric (Track A sees
`hard`). The **feed-forward report** ships five "next fix" cards across the concept's five method spines
(payoffs · parity/no-arbitrage · risk-neutral pricing · the binomial tree · delta-hedging), a
**predicted-vs-measured calibration delta**, and a one-sentence **`pressureNote`** framing the result as
*under-pressure retrieval* — **no person-level verdict, no hire signal** (ADR-0010). **Calibration is the
celebrated number** (per-question confidence → Brier/overconfidence delta; correctly-low confidence on a
brutal item is rewarded). **Engine-verify-before-serve** is the iron rule: every pooled and runtime
question is anchored+sourced and reproduced by `src/engine/options.ts` exact rationals; anything the
engine cannot verify — any Black-Scholes price, any continuous Greek — is **rejected from the graded
pool** and may appear only as display-only context.
