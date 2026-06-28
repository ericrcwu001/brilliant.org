# Source Dossier — Options, Payoffs & No-Arbitrage (`course-options`, Finance)

## Executive summary
- **Green Book anchor:** grounded in *A Practical Guide To Quantitative Finance Interviews* (Xinfeng Zhou), **Chapter 6 — Finance**: **§6.1 Option Pricing** (p.69-73, L10727+) — price direction in S/K/σ/r/T, American-vs-European, **put-call parity C − P = S − K·e^(−rT)** (p.70, L10820/L10840), dividends, risk-neutral pricing & the Black-Scholes-Merton PDE (p.71-72, L11002/L11183), the **Black-Scholes formula c = S·N(d1) − K·e^(−rT)·N(d2) and its 5 assumptions** (p.72-73, L11274/L11360); **§6.2 The Greeks** (p.75, L11736) — Δ=N(d1), Γ, Θ, vega, plus the exact **one-touch digital = 1/H** no-arb problem (p.75, L11741); **§6.3 Option Portfolios & Exotics** (p.80, L12519) — straddle, **bull spread bounded by e^(−rT)(K₂−K₁)** (L12449), digital ≈ bull spread (L12591); **§6.4 Other** (p.82, L12754) — **min-variance two-stock portfolio → 6/7 in A, 1/7 in B** (L12795), VaR, duration/convexity, forwards-vs-futures. Binomial pricing is anchored to §6.1 **risk-neutral valuation** (L11002/L11319) + §6.1 **no-arb replication** (L11741) + **§5.3 Dynamic Programming / backward induction** (p.61, L9497), and sourced to academic/interview references for the explicit u/d tree. The **optimal hedge ratio h = ρσ_A/σ_B = Cov/Var** is **§4.5, p.48, L7647**.
- **Problems assembled: 22** (18 core + transfer candidates per lesson). **20 are `exact-verifiable: YES`** (rational, reproducible by a pure no-float engine); **2 are `NO`** (Black-Scholes price and continuous Greeks — irrational `N(·)`, kept display-only / sourced-reference, never graded).
- **The whole exactness play:** the GRADED spine is the **exact discrete no-arbitrage core** — piecewise-linear payoffs, put-call parity with a rational discount D, no-arb bounds, and the **binomial tree with u, d, R chosen as exact rationals** so q=(R−d)/(u−d), the price, Δ, and bond B are all rational. Black-Scholes is the *continuous limit* explored with sliders (display-only), exactly as the covariance concept graded **ρ² (rational)** instead of the irrational ρ. The clean canonical anchor **S₀=100, u=6/5, d=4/5, R=1 (r=0) ⇒ q=1/2, call K=100 ⇒ price=10, Δ=1/2, B=−40, hedge cost 50−40=10** is hand-verified below and corroborated by a fully-worked academic source.

---

## 1. Green Book anchor map

Absolute ground-truth path (gitignored; grep the **main checkout**, not this worktree):
`/Users/ericwu/Developer/brilliant.org/references/green-book.txt`. OCR is noisy — line numbers below are from direct reads; page markers are the `===== PAGE n =====` scan markers.

| Green Book locus | page / line | What it legitimizes (one line) |
|---|---|---|
| **§6.1 Option Pricing** (header) | p.69 · L10727 | The whole concept: vanilla call/put pricing, the no-arbitrage spine. |
| Price direction of options (Table 6.1: S,K,σ,r,T,div) | p.69-70 · L10741-10862 | Qualitative comparative statics (↑/↓/?) — call payoff `max(S−K,0)`, put `max(K−S,0)` (L10744). |
| **Put-call parity** `c − p = S − K·e^(−rT)` | p.70 · L10772-10840, hdr L10890 | The exact no-arb identity (L2); protective put `max(S_T−K,0)+K = max(S_T,K)` (L10800). |
| American vs European; never early-exercise an American call on a non-div stock | p.70-71 · L10861-10920 | American call = European call (no-div); early-exercise direction facts. |
| Dividends | p.70 · L10852 | Why dividends flip the call/put inequalities (display/reference). |
| **Risk-neutral pricing** (price = discounted risk-neutral expectation) | p.71/73 · L11002, L11319-11335 | The engine of binomial pricing: `price = e^(−rT)·E_Q[payoff]` (anchors L4/L5). |
| **Black-Scholes-Merton PDE** (Δ-hedged riskless portfolio, Feynman-Kac) | p.72 · L11183-11264 | The continuous limit; legitimizes "price = cost of the hedge" (display/reference). |
| **Black-Scholes formula** `c=S·N(d1)−K·e^(−rT)·N(d2)`, `p=K·e^(−rT)·N(−d2)−S·N(−d1)`; d1,d2 | p.72-73 · L11274-11288, L11297 | The closed form (L5) — **irrational `N(·)` ⇒ display-only**. |
| **BS assumptions** (1 no div, 2 const known r, 3 GBM const μ,σ, 4 no costs/taxes & divisible, 5 short-sale proceeds usable) | p.73 · L11360-11419 | Sourced fact: what BS requires (a clean graded recall/which-assumption item). |
| **§6.2 The Greeks** (Δ=∂V/∂S, Γ, Θ, vega, ρ) | p.75 · L11736-11754 | Greek **signs** (exact) + delta as hedge ratio (L6). |
| **One-touch digital**: pays $1 first time martingale S (S₀=1, r=0) hits $H ⇒ price **1/H** | p.75 · L11717-11765 | Exact no-arb replication (buy 1/H shares); a fully-rational exotic (L6 transfer). |
| Delta of a European call = **N(d1)** | p.75-76 · L11770-11825 | Continuous delta is **irrational ⇒ display-only**; binomial Δ replaces it as graded. |
| **§6.3 Option Portfolios & Exotic Options** (header) | p.80 · L12519 | Composing payoffs (L3): spreads, straddles, butterflies, digitals. |
| Straddle = long call + long put (same K); payoff `|S_T−K|`; bet on volatility | p.80 · L12527-12566 | Straddle payoff + "when to use" (L3). |
| **Bull call spread**: long c(K₁), short c(K₂), K₁<K₂; price bounded **0 ≤ c₁−c₂ ≤ e^(−rT)(K₂−K₁)** | p.80 · L12449-12503 (Table 6.3) | Spread payoff table + exact price bound (L3). |
| **Digital ≈ bull spread**: long 1/(2ε) c(K−ε), short 1/(2ε) c(K+ε) → cash-or-nothing as ε→0 | p.80-81 · L12591-12611 | Binary option as the limit of a tight spread (L3/L6). |
| **§6.4 Other Finance Questions** (header) | p.82 · L12754 | The "in the wild / which tool?" synthesis (L6). |
| **Min-variance two-stock portfolio**: r̄ equal, σ_A=20%, σ_B=30%, ρ=0.5 ⇒ **w_A=6/7, w_B=1/7** | p.82-83 · L12795-12986 | Exact min-variance weights (L6) — same Cov/Var algebra as the hedge ratio. |
| Value at Risk (percentile of loss; not sub-additive) | p.83 · L12990 | Risk-management fact (L6 "which tool?", display/reference). |
| Duration & convexity of a bond | p.83-84 · L13037-13057 | Fixed-income comparative statics (L6, display/reference). |
| Forwards vs futures (MtM daily; equal price if r deterministic; futures ≥ forward if value +corr with rates) | p.84-85 · L13246-13346 | Forward/future distinction (L6 "which tool?", display/reference). |
| **§4.5 Optimal hedge ratio** `h = ρσ_A/σ_B = Cov(A,B)/Var(B)` minimizing Var(r_A − h·r_B) | **p.48 · L7647-7676** | Exact min-variance hedge from finite pmf (L6) — Cov/Var is always rational. |
| **§5.3 Dynamic Programming** (backward induction over stages) | p.61 · L9497 | The method binomial pricing *is*: roll option values backward through the tree (L4/L5). |

**Anchoring note on binomial trees.** The Green Book prices vanilla options by **risk-neutral expectation** (§6.1) and **no-arbitrage replication** (the digital 1/H argument, L11741), and teaches **backward induction** in §5.3 — but it does **not** print an explicit u/d lattice. So every binomial *problem* below is **GB-anchored to §6.1 risk-neutral + §5.3 backward induction** and **web-sourced** for the explicit tree mechanics (per the anchor-and-source rule). The specific rational parameters are chosen for exactness and **hand-verified** here.

---

## 2. Numbered problem set

Legend: **EV** = `exact-verifiable` (**Y** = rational, engine-graded / **N** = irrational, display-only/sourced-reference). **L#** = proposed lesson. Rows tagged **[transfer]** are the per-lesson held-out Track-B transfer candidates (same method, fresh surface).

### L1 — Payoffs & the contract
| # | Statement (exact-rational params) | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 1 | Long call, K=100. Payoff at expiry if S_T=130? if S_T=70? | **30**; **0** | GB §6.1 p.69 L10744 (`payoff=max(S−K,0)`) | Y | L1 |
| 2 | Long put, K=100. Payoff if S_T=70? if S_T=130? Intrinsic value at S=80? | **30**; **0**; intrinsic **20** | GB §6.1 p.69 L10744 (`max(K−S,0)`); moneyness Table 6.1 | Y | L1 |
| 3 | Protective put: long stock + long put(K=100). Show terminal value = `max(S_T,K)`; value at S_T=130 and S_T=80. | `max(S_T,100)` ⇒ **130**, **100** | GB §6.1 p.70 L10800 (`max(S_T−K,0)+K=max(S_T,K)`) | Y | L1 |
| 4 **[transfer]** | Long straddle, K=100 (fresh surface vs call payoff). Terminal payoff = `|S_T−K|`; value at S_T=130 and S_T=70. | `|S_T−100|` ⇒ **30**, **30** | GB §6.3 p.80 L12552 (`|S_T−K|`) | Y | L1 |

### L2 — Put-Call Parity
| # | Statement | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 5 | State put-call parity for European options on a non-dividend stock; with r=0 simplify. | `C − P = S − K·e^(−rT)`; r=0 ⇒ **C − P = S − K** | GB §6.1 p.70 L10820/L10840 | Y | L2 |
| 6 | r=0, S=100, K=100, market C=10. Find P by parity. | P = C−(S−K) ⇒ **10** | GB §6.1 p.70 L10840; [quant.SE proof](https://quant.stackexchange.com/questions/50178/proving-the-put-call-parity) | Y | L2 |
| 7 | r=0, S=100, K=95. Market quotes C=8, P=2. Is there arbitrage? Give the gap and the trade. | Gap=(C−P)−(S−K)=6−5=**1**; **conversion**: sell call, buy put, buy stock, borrow 95 ⇒ +$1 today, $0 at expiry | GB §6.1 L10840 + [Derivatives Atlas](https://phucnguyenvan.com/concept/parity-arbitrage), [Quantt](https://www.quantt.co.uk/resources/put-call-parity-explained) | Y | L2 |
| 8 **[transfer]** | Rational discount D=10/11 (so K·D), S=50, K=44, P=3 (fresh surface). Find the no-arb C. | C = P+S−K·D = 3+50−40 = **13** | GB §6.1 L10820 (parity with discount D); [Ryan O'Connell](https://ryanoconnellfinance.com/put-call-parity/) | Y | L2 |

### L3 — Spreads & Straddles
| # | Statement | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 9 | Bull call spread: long c(K₁=100), short c(K₂=120). Payoff at S_T=130, 110, 90? Max payoff? | **20, 10, 0**; capped at K₂−K₁=**20** | GB §6.3 p.80 L12449-12503 (Table 6.3) | Y | L3 |
| 10 | No-arb price bound for that bull spread (r=0). | 0 ≤ c₁−c₂ ≤ e^(−rT)(K₂−K₁) ⇒ **0 ≤ price ≤ 20** | GB §6.3 p.80 L12501-12503 | Y | L3 |
| 11 | Long butterfly: long c(90), short 2·c(100), long c(110). Payoff at S_T=100 (peak)? at 90 or 110? | peak **10**; **0** at the wings | GB §6.3 p.80 L12531 ("butterfly" in list); spread algebra L12449 | Y | L3 |
| 12 **[transfer]** | Strangle (fresh surface): long put(K₁=90) + long call(K₂=110). Payoff at S_T=130, 100, 70? | **20, 0, 20** | GB §6.3 p.80 L12527-12566 (straddle/strangle family) | Y | L3 |

### L4 — One-Step Binomial: price by replication
| # | Statement | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 13 | **Canonical.** S₀=100, u=6/5, d=4/5, R=1 (r=0). Call K=100. Find risk-neutral q, price, Δ, bond B; show hedge cost = price. | q=(R−d)/(u−d)=**1/2**; C_u=20,C_d=0 ⇒ price=**10**; Δ=(C_u−C_d)/(S(u−d))=**1/2**; B=**−40**; hedge cost=½·100−40=**10** | GB §6.1 risk-neutral L11002 + §5.3 backward L9497; sourced [Cudina/UT-Austin](https://web.ma.utexas.edu/users/mcudina/m339d-lecture-fourteen-binomial-option-pricing-one-period.pdf), [Worrall ECO-30004](https://www.timworrall.com/eco-30004/binomialone.pdf) | Y | L4 |
| 14 | **Sourced twin (r≠0).** S₀=100 → 175 (up) / 75 (down), r=1/4, call K=100. Find q, price, Δ, B. | q=(r−d)/(u−d)=**1/2**; price=**30**; Δ=**3/4**; B=**−45** (cost 75−45=30) | [Worrall ECO-30004](https://www.timworrall.com/eco-30004/binomialone.pdf) (fully worked, stated answers) | Y | L4 |
| 15 | Risk-neutral-q drill: u=3/2, d=1/2, R=11/10. Compute q. | q=(11/10−1/2)/(3/2−1/2)=(6/10)/1=**3/5** | [AnalystPrep one-period binomial](https://analystprep.com/cfa-level-1-exam/derivatives/one-period-binomial-model-2/); GB §6.1 risk-neutral L11319 | Y | L4 |
| 16 **[transfer]** | Same tree as #13 (100;120/80, r=0) but **price the PUT**, K=100 (fresh surface). Find price, Δ, B; check parity. | P_u=0,P_d=20 ⇒ price=**10**; Δ=**−1/2**; B=**+60**; parity C−P=10−10=0=S−K ✓ | GB §6.1 parity L10840 + risk-neutral L11002; [Worrall](https://www.timworrall.com/eco-30004/binomialone.pdf) ("repeat for a put") | Y | L4 |

### L5 — Multi-Step Binomial → Black-Scholes
| # | Statement | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 17 | **Two-step tree.** S₀=100, u=6/5, d=4/5, R=1, K=100, 2 steps. Terminal nodes & risk-neutral weights? Price? | terminals **144 / 96 / 64**, weights **1/4, 1/2, 1/4**; only 144 ITM (payoff 44) ⇒ price=**11** (node C_u=22, C_d=0) | GB §5.3 backward induction L9497 + §6.1 risk-neutral L11319; [Cudina](https://web.ma.utexas.edu/users/mcudina/m339d-lecture-fourteen-binomial-option-pricing-one-period.pdf) | Y | L5 |
| 18 | Path counting in an n-step tree: weight of the k-up node = `nCk·q^k(1−q)^(n−k)`. For n=2 how many paths reach the middle node? the top? | middle **C(2,1)=2**; top **C(2,0)=… =1**; bottom **1** | combinatorics + GB §5.3 L9497; [Ryan O'Connell tree](https://ryanoconnellfinance.com/binomial-option-pricing-model/) | Y | L5 |
| 19 | Black-Scholes formula for a European call & its assumptions (continuous limit). | `c = S·N(d1) − K·e^(−rT)·N(d2)`; assumptions: no div, const known r, GBM const σ, no costs/divisible, short-proceeds usable | GB §6.1 p.72-73 L11274-11288, L11360-11419 | **N** (N(·) irrational ⇒ display-only / sourced reference; never graded) | L5 |
| 20 **[transfer]** | Three-step tree (fresh surface), u=6/5,d=4/5,R=1: how many of the 8 price paths end at the single top node uuu, and what is its terminal price? | **1** path; terminal **100·(6/5)³ = 864/5 = 172.8** | GB §5.3 L9497; binomial path-count canon (Cudina/O'Connell, above) | Y | L5 |

### L6 — Synthesis / In the Wild
| # | Statement | Exact answer | Source | EV | L |
|---|---|---|---|---|---|
| 21 | **Min-variance hedge.** Long 1 share A; short h shares B. Cov(A,B)=6, Var(B)=9. Optimal h? (Then sign-flip Cov=−6.) | h*=Cov/Var=6/9=**2/3** (and **−2/3**) | GB §4.5 p.48 L7647-7676 (`h=ρσ_A/σ_B`) | Y | L6 |
| 22 | **Min-variance portfolio (GB).** Stocks A,B equal expected return; σ_A=20%, σ_B=30%, ρ=0.5. Weights minimizing variance? | w_A=(σ_B²−ρσ_Aσ_B)/(σ_A²+σ_B²−2ρσ_Aσ_B)=0.06/0.07=**6/7** in A, **1/7** in B; Var=**27/700** | GB §6.4 p.82-83 L12795-12986 (stated "6/7 in A, 1/7 in B") | Y | L6 |

> **Greek-signs item (L6, ungraded-or-sign-graded):** call Δ∈(0,1) **+**, put Δ∈(−1,0) **−**, Γ **+** (long), vega **+** (long), Θ typically **−** (long), call ρ **+**, put ρ **−**. Source GB §6.2 p.75 L11736-11790. **EV: Y for the SIGN** (exact qualitative); the *magnitude* Δ=N(d1) is irrational ⇒ display-only. Pair with the binomial Δ=1/2 (#13) as the exact graded delta.
>
> **One-touch digital (L6 transfer candidate, fully exact):** a martingale stock (S₀=1, r=0) — option pays $1 the first time S reaches $H. Price = **1/H** (e.g. H=5/4 ⇒ **4/5**, H=2 ⇒ **1/2**), replicated by buying 1/H shares. GB §6.2 p.75 L11741-11765. **EV: Y.**
>
> **"Which tool?" fork (L6, conceptual/reference):** forwards-vs-futures (GB §6.4 L13254-13346), VaR (L12990), duration/convexity (L13037) — used for a which-method gate / discrimination, not engine-graded numerics.

---

## 3. REJECTED / irrational items (kept out of the GRADED set — mirror the covariance dossier)

- **Black-Scholes price** `c = S·N(d1) − K·e^(−rT)·N(d2)` (GB §6.1 L11274): `N(·)` is the standard-normal CDF → **irrational, no closed-form rational value.** **REJECTED as graded.** Handled **display-only / sourced-reference**: shown as the continuous limit explored with sliders/plots; any numeric printed (e.g. "≈ 10.45") is a *sourced reference value*, never an `accept`. The graded price is the **binomial price (exact rational)** — problems #13/#14/#17.
- **Continuous Greeks** Δ=N(d1), Γ=N′(d1)/(Sσ√T), vega=S·N′(d1)·√T, Θ (all carry `N`/`N′`): **irrational ⇒ REJECTED as graded.** Replaced by **(a) exact Greek *signs*** (#21 note) and **(b) the exact *binomial* delta** Δ=(C_u−C_d)/(S(u−d)) (#13/#16). This is the direct analogue of grading **ρ²** instead of the irrational ρ in the covariance concept.
- **CRR parametrization** u=e^(σ√Δt), d=e^(−σ√Δt): the up/down factors are **irrational exponentials.** **REJECTED as graded inputs.** The engine takes **u, d, R as given exact rationals** (e.g. 6/5, 4/5, 1) so the whole tree — q, price, Δ, B, multi-step weights — stays rational. (The σ→u,d map is shown only as illustrative continuous-limit context.)
- **Risk-neutral q with an irrational gross return** R=e^(rΔt): irrational. **Reformulated** — use R as an exact rational (R=1 for r=0, or R=1+r / R=11/10 / R=5/4 with rational r) so q=(R−d)/(u−d) is rational (problems #13-#17).
- **Implied volatility** (invert BS for σ): no closed form, irrational. **REJECTED as graded.** Mentioned only as a concept (the slider's inverse).
- **Min-variance σ itself** √(27/700) (problem #22): irrational. **Grade the weights (6/7, 1/7) and the variance (27/700), never the standard deviation** — same "grade the square, not the root" rule as ρ²/Cov in covariance.
- **General "probability GBM ever reaches H"** with drift/discounting: involves exponentials → irrational in general. **Kept only the r=0 martingale case** (price 1/H, #one-touch), which collapses to an exact rational.
- **Straddle/strangle *break-even* via the premium when the premium is a BS price:** the break-evens K ± (premium) are only rational if the premium is rational. **Use binomial/rational premiums** (or grade the *payoff* at given S_T, which is always exact) — never a BS-priced break-even.

---

## 4. Exactness-risk ledger (where keeping graded answers exact is hard → the exact resolution)

- **Risk #1 — The headline formula is irrational.** Black-Scholes is *the* options formula but `N(·)` makes it non-rational. **Resolution:** demote BS to the **display-only continuous limit** (sliders/plots, sourced reference numbers); make the **binomial tree the graded spine** (price = e^(−rT)·E_Q, all rational). BS is *reached* by the lesson, never *graded* by the engine.
- **Risk #2 — Greeks are irrational.** Δ=N(d1), Γ, vega, Θ all carry `N`/`N′`. **Resolution:** grade only the **signs** (exact) and the **binomial delta** Δ=(C_u−C_d)/(S(u−d)) (exact rational). Magnitudes via the normal CDF are display-only.
- **Risk #3 — CRR tree inputs are irrational.** u=e^(σ√Δt) etc. **Resolution:** the engine's binomial inputs are **(u, d, R) as exact rationals**; never derive them from σ inside the graded path. Pick u·d, R so q, price, Δ, B, and n-step weights are rational (the 6/5, 4/5, R=1 family is the cleanest; q=1/2).
- **Risk #4 — Discounting introduces e^(−rT).** Any r>0 continuous discount is irrational. **Resolution:** prefer **r=0 ⇒ D=1** (parity becomes C−P=S−K; tree gross return R=1), or a **given exact-rational discount** D=1/(1+r) / R=11/10 / R=5/4. Parity, bounds, and tree prices then stay rational.
- **Risk #5 — Volatility/σ is generically irrational** and √-of-variance appears in portfolio risk. **Resolution:** grade **variances and weights, not standard deviations** (min-variance #22 grades 6/7, 1/7, Var=27/700; never √). Same discipline as ρ²/Cov in covariance.
- **Risk #6 — Spread/straddle break-evens depend on the premium.** **Resolution:** grade **payoffs at given S_T** (always exact piecewise-linear) and use **rational premiums** for any break-even arithmetic; never a BS-priced break-even.
- **Risk #7 — "Which tool?" facts (forwards/futures, VaR, duration) are qualitative.** **Resolution:** use them in **discrimination gates / sign questions**, not numeric `accept`s; any number shown is a sourced reference.

---

## 5. Engine-golden candidates (exact numbers `src/engine/options.ts` + `validate-fixtures` must reproduce)

All as `BigRational {n,d}` (mirror `optimalStopping.ts` / `combinatorics.ts`). Represent payoffs, parity gaps, binomial q/price/Δ/B, n-step weights, hedge ratios as exact rationals; expose any BS/continuous-Greek number through a `ratToNumber`-style **display-only** path that is **never** an `accept`.

**Payoffs (piecewise-linear, exact):**
- call(K=100): S_T=130 → **30**; S_T=70 → **0**. put(K=100): S_T=70 → **30**; S_T=130 → **0**.
- straddle(K=100)=|S_T−100|: S_T=130 → **30**; S_T=70 → **30**.
- bull spread(K₁=100,K₂=120): S_T=130 → **20** (cap), 110 → **10**, 90 → **0**.
- butterfly(90,100,110): peak at 100 → **10**; wings (90,110) → **0**.
- strangle(put 90, call 110): S_T=130 → **20**, 100 → **0**, 70 → **20**.

**Put-call parity (r=0 unless noted):**
- fair identity: C − P = S − K (general: C − P = S − K·D).
- gap(S=100,K=95,C=8,P=2) = (C−P)−(S−K) = 6 − 5 = **1** (arbitrage profit; conversion trade).
- solve P (S=100,K=100,C=10) → **10**. solve C (D=10/11,S=50,K=44,P=3) → **13**.

**No-arbitrage bounds (r=0):** call: `max(S−K,0) ≤ C ≤ S` → (S=100,K=90): **10 ≤ C ≤ 100**. put: `max(K−S,0) ≤ P ≤ K`.

**One-step binomial:**
- canonical (S=100,u=6/5,d=4/5,R=1,K=100): q=**1/2**, C_u=**20**, C_d=**0**, price=**10**, Δ=**1/2**, B=**−40**, hedge cost=**10**.
- put on same tree (K=100): price=**10**, Δ=**−1/2**, B=**+60**.
- sourced twin (S=100,Su=175,Sd=75,r=1/4,K=100): q=**1/2**, price=**30**, Δ=**3/4**, B=**−45**.
- q-drill (u=3/2,d=1/2,R=11/10): q=**3/5**.

**Two/multi-step binomial (S=100,u=6/5,d=4/5,R=1):**
- 2-step terminals: **144, 96, 64**; risk-neutral weights **1/4, 1/2, 1/4**; call K=100 price=**11**; intermediate C_u=**22**, C_d=**0**.
- path counts: C(2,0)=**1**, C(2,1)=**2**, C(2,2)=**1**; 3-step top uuu: **1** path, terminal **864/5 (=172.8)**.

**Hedge / portfolio (Cov/Var algebra, exact):**
- optimal hedge ratio: Cov=6,Var=9 → h=**2/3**; Cov=−6,Var=9 → h=**−2/3**.
- min-variance two-stock (σ_A=1/5,σ_B=3/10,ρ=1/2): w_A=**6/7**, w_B=**1/7**, Var=**27/700**.

**Exotic (exact):** one-touch digital (S₀=1,r=0): H=5/4 → price **4/5**; H=2 → price **1/2** (price = 1/H).

**Display-only (sourced reference, NEVER an `accept`):** any Black-Scholes price, N(d1)/N(d2), continuous Γ/vega/Θ, implied vol, σ from a tree, and every "which tool?" forwards/futures/VaR/duration fact.

---

### Reproducibility contract for `src/engine/options.ts`
Pure, dependency-free, exact. Public surface (all rational in/out): `callPayoff/putPayoff(S_T,K)`, `spreadPayoff(legs,S_T)`, `parityGap(C,P,S,K,D)` & `parityArbLeg(...)`, `callBounds/putBounds(S,K,D)`, `riskNeutralQ(u,d,R)`, `binomialPrice(S,u,d,R,K,n,kind)`, `replicate(S,u,d,R,K)` → {delta,bond}, `treeWeights(q,n)` (= nCk q^k(1−q)^(n−k)), `hedgeRatio(cov,varB)`, `minVarWeights(varA,varB,cov)`, `oneTouchPrice(H)`. Black-Scholes / continuous Greeks live behind a **display-only** `ratToNumber`-style boundary and are excluded from `validate-fixtures` golden `accept`s. Every graded fixture answer above is one of these exact rationals.
