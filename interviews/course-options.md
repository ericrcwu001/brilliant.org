# Interview Pack — Options, Payoffs & No-Arbitrage (`course-options`)

> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with `./node_modules/.bin/tsx interviews/_build/build-options-pack.ts`.

**Anchor:** A Practical Guide To Quantitative Finance Interviews (Xinfeng Zhou), Chapter 6 — Finance: §6.1 Option Pricing pp.69-73 (call/put payoffs max(S−K,0)/max(K−S,0) L10744; put-call parity C−P=S−K·e^(−rT) L10820/L10840; risk-neutral pricing price=e^(−rT)·E_Q[payoff] L11002/L11319; Black-Scholes c=S·N(d1)−K·e^(−rT)·N(d2) L11274, display-only); §6.2 The Greeks p.75 (Greek signs L11736; one-touch digital = 1/H L11741); §6.3 Option Portfolios & Exotics p.80 (straddle |S_T−K| L12552; bull spread bounded by e^(−rT)(K₂−K₁) Table 6.3 L12449); §6.4 Other pp.82-85 (min-variance two-stock 6/7,1/7 L12795); §4.5 optimal hedge ratio h=Cov/Var p.48 L7647; §5.3 backward induction p.61 L9497. Grounded by the concept source-dossier (22 sourced problems; 20 exact-rational graded + 2 Black-Scholes/continuous-Greek display-only).

**Engine:** `src/engine/options.ts` — every answer is engine-verified (exact rational, no floats).

**Counts:** 83 questions (hard 26, harder 36, brutal 21; 77 templated, 6 free-form).

## Templates

- `tmpl-payoff` — Option payoff at expiry (GB §6.1 p.69 L10744, §6.3 p.80 L12449/L12552): spreadPayoff(legs, S_T): single or multi-leg piecewise-linear payoff.
- `tmpl-parity-solve` — Solve for missing parity leg (GB §6.1 p.70 L10820/L10840): paritySolve(known): rearrange C−P=S−K·D for the missing quantity.
- `tmpl-parity-gap` — Put-call-parity arbitrage gap (GB §6.1 p.70 L10820/L10840): parityGap(C,P,S,K,D): compute (C−P)−(S−K·D) to detect conversion/reversal arb.
- `tmpl-bounds` — No-arbitrage price bounds (GB §6.3 p.80 L12501): callBounds/putBounds(S,K,D): lo/hi no-arb price bounds for a European option.
- `tmpl-rn-q` — Risk-neutral probability (GB §6.1 L11002): riskNeutralQ(u,d,R): q=(R−d)/(u−d), the no-arb weight on the binomial tree.
- `tmpl-binomial-price` — Binomial option price (n-step) (GB §5.3 L9497 + §6.1 L11002): binomialPrice(S,u,d,R,K,n,kind): exact rational price by risk-neutral backward induction.
- `tmpl-replicate` — Replicating delta and bond (GB §6.1 L11002 + §5.3 L9497): replicate(S,u,d,R,K,kind): Delta=(V_u−V_d)/(S(u−d)), bond=price−Delta·S.
- `tmpl-tree-terminal` — Multi-step tree terminal price (GB §5.3 L9497 + §6.1 L11319): treeTerminals(S,u,d,n)[i]: i-th terminal stock price (highest first) on an n-step tree.
- `tmpl-tree-weight` — Multi-step binomial node weight (GB §5.3 L9497 + §6.1 L11319): treeWeights(q,n)[i]: risk-neutral binomial weight at index i (C(n,n−i)·q^(n−i)·(1−q)^i).
- `tmpl-path-count` — Binomial path count (GB §5.3 L9497 + §6.1 L11319): pathCount(n,k): number of paths with exactly k up-moves in n steps = C(n,k).
- `tmpl-hedge-ratio` — Minimum-variance hedge ratio (GB §4.5 p.48 L7647): hedgeRatio(cov,varB): h*=Cov(A,B)/Var(B), the Cov/Var optimal hedge.
- `tmpl-min-var` — Two-stock minimum-variance weights (GB §6.4 p.82-83 L12795): minVarWeights(varA,varB,cov): wA, wB, varMin for the two-asset MVP.
- `tmpl-one-touch` — One-touch digital price (GB §6.2 p.75 L11741): oneTouchPrice(H): price = 1/H for a one-touch that pays $1 at first hitting of H (r=0, S0=1).
- `tmpl-greek-sign` — Greek sign (exact) (GB §6.2 p.75 L11736): greekSign(greek,kind): exact signed-integer sign of a Black-Scholes Greek (+1/−1/0).

## Questions

### tmpl-payoff#call-100-ST130  `hard`

**Prompt.** A European call with strike K = 100 expires at S_T = 130. What is the call payoff at expiry?

- **Answer (engine-verified):** `30`
- **Engine check:** `formatRational(spreadPayoff(legs('call','100'),F('130')))` → `30`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Payoff = max(S_T − K, 0) = max(130 − 100, 0) = 30. / Call pays only when S_T > K; since S_T = 130 > K = 100, payoff = 30.
- **Hint ladder:** (1) The call pays when S_T exceeds the strike. Is S_T = 130 above K = 100? (2) Call payoff formula: max(S_T − K, 0). With S_T above K, which branch of the max applies? (3) Since S_T > K here, max picks the first term; subtract K from S_T to find the payoff.
- **Follow-ups:** If you also hold a put at K = 100 (a straddle), what is the combined payoff at S_T = 130? / At what S_T does this call first pay a positive amount at expiry?

### tmpl-payoff#call-100-ST70  `hard`

**Prompt.** A European call with strike K = 100 expires at S_T = 70. What is the call payoff at expiry?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(spreadPayoff(legs('call','100'),F('70')))` → `0`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Payoff = max(S_T − K, 0) = max(70 − 100, 0) = 0. / Call pays only when S_T > K; since S_T = 70 < K = 100, payoff = 0.
- **Hint ladder:** (1) The call pays only when the stock finishes above the strike. Does S_T = 70 exceed K = 100? (2) Call payoff: max(S_T − K, 0). With S_T below K, the inner quantity is negative; what does max return? (3) When S_T − K is negative, max(·, 0) returns the floor — the call simply expires worthless.
- **Follow-ups:** If you also hold a put at K = 100 (a straddle), what is the combined payoff at S_T = 70? / At what S_T does this call first pay a positive amount at expiry?

### tmpl-payoff#put-100-ST70  `hard`

**Prompt.** A European put with strike K = 100 expires at S_T = 70. What is the put payoff at expiry?

- **Answer (engine-verified):** `30`
- **Engine check:** `formatRational(spreadPayoff(legs('put','100'),F('70')))` → `30`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Payoff = max(K − S_T, 0) = max(100 − 70, 0) = 30. / Put pays when K > S_T; since K = 100 > S_T = 70, payoff = 30.
- **Hint ladder:** (1) The put pays when the stock finishes below the strike. Is S_T = 70 below K = 100? (2) Put payoff formula: max(K − S_T, 0). With K above S_T, which branch of the max applies? (3) Since K > S_T, max picks the first term; subtract S_T from K to find the payoff.
- **Follow-ups:** By put-call parity (r = 0), if the call struck at K = 100 costs C, what must the put cost? / What is the straddle payoff (long call + long put at K = 100) at S_T = 70?

### tmpl-payoff#put-100-ST130  `hard`

**Prompt.** A European put with strike K = 100 expires at S_T = 130. What is the put payoff at expiry?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(spreadPayoff(legs('put','100'),F('130')))` → `0`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Payoff = max(K − S_T, 0) = max(100 − 130, 0) = 0. / Put pays when K > S_T; since K = 100 <= S_T = 130, payoff = 0.
- **Hint ladder:** (1) The put pays when the stock finishes below K. Does S_T = 130 lie below K = 100? (2) Put payoff: max(K − S_T, 0). With S_T above K, is K − S_T positive or negative? (3) When K − S_T is negative, max(·, 0) returns the floor — the put expires worthless.
- **Follow-ups:** By put-call parity (r = 0), if the call struck at K = 100 costs C, what must the put cost? / What is the straddle payoff (long call + long put at K = 100) at S_T = 130?

### tmpl-payoff#protective-put-100-ST130  `harder`

**Prompt.** A protective put: long one share and long a put with strike K = 100. At expiry S_T = 130, what is the total position payoff?

- **Answer (engine-verified):** `130`
- **Engine check:** `formatRational(spreadPayoff(legs('protective-put','100'),F('130')))` → `130`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Stock: 130. Put: max(100−130,0) = 0. Total = 130. / Protective-put payoff = max(S_T, K). With S_T = 130, K = 100: max(130,100) = 130.
- **Hint ladder:** (1) Two legs: long stock (payoff S_T) and long put (payoff max(K−S_T,0)). Evaluate each at the given S_T, then add. (2) With S_T above the strike K, the put is out of the money and expires worthless; which leg is the sole contributor? (3) Only the stock contributes at expiry; the total payoff equals the stock's terminal value S_T alone.
- **Follow-ups:** Show that the protective-put payoff equals max(S_T, K) algebraically. / Put-call parity links C + PV(K) = S + P. How does a protective put relate to a call plus a bond?

### tmpl-payoff#protective-put-100-ST80  `harder`

**Prompt.** A protective put: long one share and long a put with strike K = 100. At expiry S_T = 80, what is the total position payoff?

- **Answer (engine-verified):** `100`
- **Engine check:** `formatRational(spreadPayoff(legs('protective-put','100'),F('80')))` → `100`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Stock: 80. Put: max(100−80,0) = 20. Total = 100. / Protective-put payoff = max(S_T, K). With S_T = 80, K = 100: max(80,100) = 100.
- **Hint ladder:** (1) Two legs: long stock (payoff S_T) and long put (payoff max(K−S_T,0)). Evaluate each at the given S_T, then add. (2) With S_T below the strike K, the put is in the money; compute max(K−S_T,0) and the stock payoff S_T separately, then sum. (3) The two legs together yield S_T + (K − S_T) when S_T < K — the S_T terms cancel, leaving just the strike value.
- **Follow-ups:** Show that the protective-put payoff equals max(S_T, K) algebraically. / Put-call parity links C + PV(K) = S + P. How does a protective put relate to a call plus a bond?

### tmpl-payoff#straddle-100-ST130  `harder`

**Prompt.** A long straddle: long a call and a put, both struck at K = 100. At expiry S_T = 130, what is the total straddle payoff? (GB §6.3 L12552)

- **Answer (engine-verified):** `30`
- **Engine check:** `formatRational(spreadPayoff(legs('straddle','100'),F('130')))` → `30`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Call payoff: max(130−100,0). Put payoff: max(100−130,0). Sum = 30. / Straddle payoff = |S_T − K| = |130 − 100| = 30.
- **Hint ladder:** (1) Straddle = long call + long put at K = 100. Evaluate each leg's payoff at S_T = 130 and add. (2) Call payoff: max(S_T − K, 0) with S_T > K — this is positive. Put payoff: max(K − S_T, 0) with K < S_T — what does max return? (3) The put expires worthless when S_T > K; total payoff equals only the call's contribution. Evaluate max(S_T − K, 0) with these values.
- **Follow-ups:** Why does the straddle payoff equal |S_T − K|? Verify the formula for both cases S_T > K and S_T < K. / If the combined straddle premium is 30, for what two values of S_T does the position break even?

### tmpl-payoff#straddle-100-ST70  `harder`

**Prompt.** A long straddle: long a call and a put, both struck at K = 100. At expiry S_T = 70, what is the total straddle payoff? (GB §6.3 L12552)

- **Answer (engine-verified):** `30`
- **Engine check:** `formatRational(spreadPayoff(legs('straddle','100'),F('70')))` → `30`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Call payoff: max(70−100,0). Put payoff: max(100−70,0). Sum = 30. / Straddle payoff = |S_T − K| = |70 − 100| = 30.
- **Hint ladder:** (1) Straddle = long call + long put at K = 100. Evaluate each at S_T = 70 and add. (2) Put payoff: max(K − S_T, 0) with K > S_T — this is positive. Call payoff: max(S_T − K, 0) with S_T < K — what does max return? (3) The call expires worthless when S_T < K; total payoff equals only the put's contribution. Evaluate max(K − S_T, 0) with these values.
- **Follow-ups:** Why does the straddle payoff equal |S_T − K|? Verify the formula for both cases S_T > K and S_T < K. / If the combined straddle premium is 30, for what two values of S_T does the position break even?

### tmpl-payoff#bull-100_120-ST130  `harder`

**Prompt.** A bull call spread: long call at K = 100, short call at K = 120. At expiry S_T = 130, what is the net payoff? (GB Table 6.3 L12449)

- **Answer (engine-verified):** `20`
- **Engine check:** `formatRational(spreadPayoff(legs('bull','100-120'),F('130')))` → `20`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Long call (K=100): max(130−100,0) = 30. Short call (K=120): −max(130−120,0) = -10. Net = 20. / Bull spread payoff is capped at K2 − K1 = 20. With S_T = 130: net = 20.
- **Hint ladder:** (1) Bull spread: +call(K=100) − call(K=120). S_T = 130 exceeds both strikes — both calls are in the money. (2) Long call (K=100): payoff = S_T − K0. Short call (K=120): payoff = −(S_T − K1). Net = (S_T − K0) − (S_T − K1). (3) The S_T terms cancel, leaving K1 − K0 = 120 − 100; evaluate that difference.
- **Follow-ups:** What is the maximum payoff for this bull spread, and at what stock price is it achieved? / How does the payoff profile change if you reverse the position (bear spread)?

### tmpl-payoff#bull-100_120-ST90  `harder`

**Prompt.** A bull call spread: long call at K = 100, short call at K = 120. At expiry S_T = 90, what is the net payoff? (GB Table 6.3 L12449)

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(spreadPayoff(legs('bull','100-120'),F('90')))` → `0`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Long call (K=100): max(90−100,0) = 0. Short call (K=120): −max(90−120,0) = 0. Net = 0. / Bull spread payoff is capped at K2 − K1 = 20. With S_T = 90: net = 0.
- **Hint ladder:** (1) Bull spread: +call(K=100) − call(K=120). S_T = 90 is below both strikes. (2) Long call (K=100): max(S_T − K, 0) with S_T < K — what is the payoff? Short call (K=120): similarly. (3) Both calls expire worthless when S_T is below the lower strike; compute the net of the two floor values.
- **Follow-ups:** What is the maximum payoff for this bull spread, and at what stock price is it achieved? / How does the payoff profile change if you reverse the position (bear spread)?

### tmpl-payoff#butterfly-90_100_110-ST100  `brutal`

**Prompt.** A long butterfly: +1 call at K = 90, −2 calls at K = 100, +1 call at K = 110. At expiry S_T = 100, what is the total payoff? (GB §6.3 dossier problem #12)

- **Answer (engine-verified):** `10`
- **Engine check:** `formatRational(spreadPayoff(legs('butterfly','90-100-110'),F('100')))` → `10`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** +call(90): max(100−90,0)=10; −2×call(100): −2·max(100−100,0)=0; +call(110): max(100−110,0)=0. Total = 10. / Butterfly peaks at middle strike K=100; payoff = max(S_T−K0,0) − 2·max(S_T−K1,0) + max(S_T−K2,0) = 10.
- **Hint ladder:** (1) Three legs with quantities +1, −2, +1 at strikes 90, 100, 110. Evaluate max(S_T − K, 0) at each strike at S_T = 100. (2) Compute each raw payoff: max(100−90,0), max(100−100,0), max(100−110,0) — apply the max before multiplying by quantity. (3) Multiply each payoff by its signed quantity (+1, −2, +1 respectively) and sum the three products.
- **Follow-ups:** Sketch the butterfly payoff profile: for what range of S_T is the payoff positive? / Decompose this butterfly into two bull spreads and verify the payoff matches.

### tmpl-payoff#strangle-90_110-ST130  `brutal`

**Prompt.** A long strangle: long put at K = 90 and long call at K = 110. At expiry S_T = 130, what is the combined payoff? (GB §6.3 dossier problem #13)

- **Answer (engine-verified):** `20`
- **Engine check:** `formatRational(spreadPayoff(legs('strangle','90-110'),F('130')))` → `20`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Put (K=90): max(90−130,0)=0. Call (K=110): max(130−110,0)=20. Total = 20. / Strangle pays outside [90,110]; S_T = 130 > 110 (call ITM). Total = 20.
- **Hint ladder:** (1) Strangle: long put (K=90) + long call (K=110). Evaluate each at S_T = 130. (2) Call payoff: max(S_T − K, 0) with S_T=130, K=110 — is S_T > K? Put payoff: max(K − S_T, 0) with K=90 — is K > S_T? (3) Only the call is in the money here; the put expires worthless. Evaluate max(S_T − K_call, 0) with K_call = 110.
- **Follow-ups:** How does a strangle differ from a straddle with K = 110? Which has a lower upfront premium? / At what pair of stock prices does this strangle break even (ignoring premium)?

### tmpl-payoff#bull-90_110-ST100  `harder`

**Prompt.** A bull call spread: long call at K = 90, short call at K = 110. At expiry S_T = 100, what is the net payoff? (GB Table 6.3 L12449)

- **Answer (engine-verified):** `10`
- **Engine check:** `formatRational(spreadPayoff(legs('bull','90-110'),F('100')))` → `10`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Long call (K=90): max(100−90,0) = 10. Short call (K=110): −max(100−110,0) = 0. Net = 10. / Bull spread payoff is capped at K2 − K1 = 20. With S_T = 100: net = 10.
- **Hint ladder:** (1) Bull spread: +call(K=90) − call(K=110). S_T = 100 is between the two strikes. (2) Long call (K=90): S_T > K0 so it is in the money — compute max(S_T − 90, 0). Short call (K=110): S_T < K1 — what does it contribute? (3) Only the lower-strike call is in the money; the upper call expires worthless. Net payoff equals the long call's payoff only.
- **Follow-ups:** What is the maximum payoff for this bull spread, and at what stock price is it achieved? / How does the payoff profile change if you reverse the position (bear spread)?

### tmpl-payoff#strangle-90_110-ST80  `brutal`

**Prompt.** A long strangle: long put at K = 90 and long call at K = 110. At expiry S_T = 80, what is the combined payoff? (GB §6.3 dossier problem #13)

- **Answer (engine-verified):** `10`
- **Engine check:** `formatRational(spreadPayoff(legs('strangle','90-110'),F('80')))` → `10`
- **Source:** Green Book §6.1 p.69 L10744 (payoff max(S_T−K,0)/max(K−S_T,0)); §6.3 p.80 L12552 (straddle |S_T−K|), Table 6.3 L12449 (bull spread/butterfly/strangle)
- **Approaches:** Put (K=90): max(90−80,0)=10. Call (K=110): max(80−110,0)=0. Total = 10. / Strangle pays outside [90,110]; S_T = 80 < 90 (put ITM). Total = 10.
- **Hint ladder:** (1) Strangle: long put (K=90) + long call (K=110). Evaluate each at S_T = 80. (2) Put payoff: max(K − S_T, 0) with K=90, S_T=80 — is K > S_T? Call payoff: max(S_T − K, 0) with K=110 — is S_T > 110? (3) Only the put is in the money here; the call expires worthless. Evaluate max(K_put − S_T, 0) with K_put = 90.
- **Follow-ups:** How does a strangle differ from a straddle with K = 110? Which has a lower upfront premium? / At what pair of stock prices does this strangle break even (ignoring premium)?

### tmpl-parity-solve#solveForP-S100-K100-D1-prem10  `hard`

**Prompt.** Put-call parity (r ≥ 0): C − P = S − K·D where D = e^(−rT). Given C = 10, S = 100, K = 100, D = 1, find the missing put price P.

- **Answer (engine-verified):** `P = 10`
- **Engine check:** `formatRational(paritySolve({C:10,S:100,K:100,D:1}))` → `10`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problems #3-#5
- **Approaches:** Rearrange C − P = S − K·D: P = C + K·D − S = C + K·D − S = 10 + 100·1 − 100 = 10. / Put-call parity is a no-arbitrage identity; isolate the unknown by moving known quantities to the right-hand side.
- **Hint ladder:** (1) Write the parity identity: C − P = S − K·D. Which variable is unknown, and which are given? (2) Rearrange algebraically: isolate P on one side by moving known terms across. Compute K·D first. (3) P = C + K·D − S; substitute the given values and reduce.
- **Follow-ups:** If interest rates rise (D decreases), how does the parity-implied put price change? / Verify your answer by checking that C − P equals S − K·D with the values you found.

### tmpl-parity-solve#solveForC-S50-K44-D10_11-prem3  `harder`

**Prompt.** Put-call parity (r ≥ 0): C − P = S − K·D where D = e^(−rT). Given P = 3, S = 50, K = 44, D = 10/11, find the missing call price C.

- **Answer (engine-verified):** `C = 13`
- **Engine check:** `formatRational(paritySolve({P:3,S:50,K:44,D:10/11}))` → `13`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problems #3-#5
- **Approaches:** Rearrange C − P = S − K·D: C = P + S − K·D = P + S − K·D = 3 + 50 − 44·10/11 = 13. / Put-call parity is a no-arbitrage identity; isolate the unknown by moving known quantities to the right-hand side.
- **Hint ladder:** (1) Write the parity identity: C − P = S − K·D. Which variable is unknown, and which are given? (2) Rearrange algebraically: isolate C on one side by moving known terms across. Compute K·D first. (3) C = P + S − K·D; substitute the given values and reduce.
- **Follow-ups:** If interest rates rise (D decreases), how does the parity-implied call price change? / Verify your answer by checking that C − P equals S − K·D with the values you found.

### tmpl-parity-solve#solveForC-S100-K90-D1-prem5  `harder`

**Prompt.** Put-call parity (r ≥ 0): C − P = S − K·D where D = e^(−rT). Given P = 5, S = 100, K = 90, D = 1, find the missing call price C.

- **Answer (engine-verified):** `C = 15`
- **Engine check:** `formatRational(paritySolve({P:5,S:100,K:90,D:1}))` → `15`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problems #3-#5
- **Approaches:** Rearrange C − P = S − K·D: C = P + S − K·D = P + S − K·D = 5 + 100 − 90·1 = 15. / Put-call parity is a no-arbitrage identity; isolate the unknown by moving known quantities to the right-hand side.
- **Hint ladder:** (1) Write the parity identity: C − P = S − K·D. Which variable is unknown, and which are given? (2) Rearrange algebraically: isolate C on one side by moving known terms across. Compute K·D first. (3) C = P + S − K·D; substitute the given values and reduce.
- **Follow-ups:** If interest rates rise (D decreases), how does the parity-implied call price change? / Verify your answer by checking that C − P equals S − K·D with the values you found.

### tmpl-parity-solve#solveForP-S80-K100-D1-prem5  `brutal`

**Prompt.** Put-call parity (r ≥ 0): C − P = S − K·D where D = e^(−rT). Given C = 5, S = 80, K = 100, D = 1, find the missing put price P.

- **Answer (engine-verified):** `P = 25`
- **Engine check:** `formatRational(paritySolve({C:5,S:80,K:100,D:1}))` → `25`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problems #3-#5
- **Approaches:** Rearrange C − P = S − K·D: P = C + K·D − S = C + K·D − S = 5 + 100·1 − 80 = 25. / Put-call parity is a no-arbitrage identity; isolate the unknown by moving known quantities to the right-hand side.
- **Hint ladder:** (1) Write the parity identity: C − P = S − K·D. Which variable is unknown, and which are given? (2) Rearrange algebraically: isolate P on one side by moving known terms across. Compute K·D first. (3) P = C + K·D − S; substitute the given values and reduce.
- **Follow-ups:** If interest rates rise (D decreases), how does the parity-implied put price change? / Verify your answer by checking that C − P equals S − K·D with the values you found.

### tmpl-parity-gap#C8-P2-S100-K95-D1  `harder`

**Prompt.** You observe: C = 8, P = 2, S = 100, K = 95, D = 1. Compute the put-call-parity gap (C − P) − (S − K·D). Is there an arbitrage? If so, identify the trade. (GB §6.1 p.70 L10820/L10840)

- **Answer (engine-verified):** `gap = 1 — option side rich; sell C, buy P, buy stock, borrow K·D (conversion)`
- **Engine check:** `formatRational(parityGap(8,2,100,95,1))` → `1`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D, conversion/reversal arb); dossier problems #3-#5
- **Approaches:** C − P = 8 − 2. S − K·D = 100 − 95·1. Gap = (8−2) − (100−95·1) = 1. / Gap = 0 ⇒ no arb; gap > 0 ⇒ sell the option spread (conversion); gap < 0 ⇒ buy the option spread (reversal). Gap here = 1.
- **Hint ladder:** (1) Parity gap = (C − P) − (S − K·D). Compute each side separately. (2) Left side: C − P = 8 − 2. Right side: S − K·D = 100 − 95·1. Subtract right from left. (3) Take the difference of the two sides; if nonzero, identify whether to run a conversion (option side rich) or reversal (option side cheap).
- **Follow-ups:** If there is an arbitrage, what is the locked profit today, and how does it unwind at expiry? / Holding C, P, S constant, what value of K·D makes the gap exactly zero?

### tmpl-parity-gap#C6-P4-S100-K100-D1  `harder`

**Prompt.** You observe: C = 6, P = 4, S = 100, K = 100, D = 1. Compute the put-call-parity gap (C − P) − (S − K·D). Is there an arbitrage? If so, identify the trade. (GB §6.1 p.70 L10820/L10840)

- **Answer (engine-verified):** `gap = 2 — option side rich; sell C, buy P, buy stock, borrow K·D (conversion)`
- **Engine check:** `formatRational(parityGap(6,4,100,100,1))` → `2`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D, conversion/reversal arb); dossier problems #3-#5
- **Approaches:** C − P = 6 − 4. S − K·D = 100 − 100·1. Gap = (6−4) − (100−100·1) = 2. / Gap = 0 ⇒ no arb; gap > 0 ⇒ sell the option spread (conversion); gap < 0 ⇒ buy the option spread (reversal). Gap here = 2.
- **Hint ladder:** (1) Parity gap = (C − P) − (S − K·D). Compute each side separately. (2) Left side: C − P = 6 − 4. Right side: S − K·D = 100 − 100·1. Subtract right from left. (3) Take the difference of the two sides; if nonzero, identify whether to run a conversion (option side rich) or reversal (option side cheap).
- **Follow-ups:** If there is an arbitrage, what is the locked profit today, and how does it unwind at expiry? / Holding C, P, S constant, what value of K·D makes the gap exactly zero?

### tmpl-parity-gap#C3-P3-S100-K100-D1  `hard`

**Prompt.** You observe: C = 3, P = 3, S = 100, K = 100, D = 1. Compute the put-call-parity gap (C − P) − (S − K·D). Is there an arbitrage? If so, identify the trade. (GB §6.1 p.70 L10820/L10840)

- **Answer (engine-verified):** `gap = 0 — no arbitrage; parity holds exactly`
- **Engine check:** `formatRational(parityGap(3,3,100,100,1))` → `0`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D, conversion/reversal arb); dossier problems #3-#5
- **Approaches:** C − P = 3 − 3. S − K·D = 100 − 100·1. Gap = (3−3) − (100−100·1) = 0. / Gap = 0 ⇒ no arb; gap > 0 ⇒ sell the option spread (conversion); gap < 0 ⇒ buy the option spread (reversal). Gap here = 0.
- **Hint ladder:** (1) Parity gap = (C − P) − (S − K·D). Compute each side separately. (2) Left side: C − P = 3 − 3. Right side: S − K·D = 100 − 100·1. Subtract right from left. (3) Take the difference of the two sides; if nonzero, identify whether to run a conversion (option side rich) or reversal (option side cheap).
- **Follow-ups:** If there is an arbitrage, what is the locked profit today, and how does it unwind at expiry? / Holding C, P, S constant, what value of K·D makes the gap exactly zero?

### tmpl-bounds#call-S100-K90-D1-lo  `hard`

**Prompt.** No-arbitrage lower bound for a European call: S = 100, K = 90, D = 1. What is the tightest lower bound on the call price?

- **Answer (engine-verified):** `Lower bound = max(S − K·D, 0) = 10`
- **Engine check:** `formatRational(callBounds(100,90,1).lo)` → `10`
- **Source:** Green Book §6.3 p.80 L12501 / §6.1 no-arb bounds; dossier problem #6
- **Approaches:** Lower bound = max(S − K·D, 0) = max(100−90·1,0) = 10. / If C < S−K·D, sell the stock, buy the call, lend K·D — locked profit; so C ≥ S−K·D, and C ≥ 0.
- **Hint ladder:** (1) The call lower bound comes from a no-arbitrage argument. What is the static replication that sets the floor? (2) If C < S − K·D, you can sell stock, lend K·D, and buy C for a net profit today. What floor does this imply for C? (3) Lower bound = max(S − K·D, 0); evaluate S − K·D numerically, then apply the max with zero.
- **Follow-ups:** What is the corresponding upper bound on this call? / When S = K·D exactly (at-forward), what does the lower bound become?

### tmpl-bounds#call-S100-K90-D1-hi  `hard`

**Prompt.** No-arbitrage upper bound for a European call: S = 100, K = 90, D = 1. What is the tightest upper bound on the call price?

- **Answer (engine-verified):** `Upper bound = S (the stock price) = 100`
- **Engine check:** `formatRational(callBounds(100,90,1).hi)` → `100`
- **Source:** Green Book §6.3 p.80 L12501 / §6.1 no-arb bounds; dossier problem #6
- **Approaches:** Upper bound = S (the stock price). A call can never be worth more than the underlying stock. Bound = 100. / If C > S, sell C, buy stock — riskless profit at time 0; so C ≤ S.
- **Hint ladder:** (1) A call gives the right to buy stock at K. Can a right to buy ever be worth more than the asset itself? (2) If C > S, you could sell the call and buy the stock for a riskless profit; what does this imply about the maximum call price? (3) The upper bound is the stock price S itself; read off S from the given parameters.
- **Follow-ups:** What is the lower bound on this same call? / As K → 0, what does the call approach, and why does the upper bound become tight?

### tmpl-bounds#put-S100-K110-D1-lo  `hard`

**Prompt.** No-arbitrage lower bound for a European put: S = 100, K = 110, D = 1. What is the tightest lower bound on the put price?

- **Answer (engine-verified):** `Lower bound = max(K·D − S, 0) = 10`
- **Engine check:** `formatRational(putBounds(100,110,1).lo)` → `10`
- **Source:** Green Book §6.3 p.80 L12501 / §6.1 no-arb bounds; dossier problem #6
- **Approaches:** Lower bound = max(K·D − S, 0) = max(110·1−100,0) = 10. / If P < K·D − S, buy put, buy stock, borrow K·D — riskless profit; so P ≥ max(K·D−S,0).
- **Hint ladder:** (1) The put lower bound follows from a no-arbitrage replication. What position locks in a floor? (2) If P < K·D − S, you can buy the put, buy stock, and borrow K·D for a riskless profit today. What floor does this set? (3) Lower bound = max(K·D − S, 0); compute K·D − S numerically, then apply max with zero.
- **Follow-ups:** What is the upper bound for this put? / When S = K·D (at-forward), what is the lower bound?

### tmpl-bounds#put-S100-K110-D1-hi  `hard`

**Prompt.** No-arbitrage upper bound for a European put: S = 100, K = 110, D = 1. What is the tightest upper bound on the put price?

- **Answer (engine-verified):** `Upper bound = K·D (discounted strike) = 110`
- **Engine check:** `formatRational(putBounds(100,110,1).hi)` → `110`
- **Source:** Green Book §6.3 p.80 L12501 / §6.1 no-arb bounds; dossier problem #6
- **Approaches:** Upper bound = K·D (discounted strike) = 110·1 = 110. / Put payoff ≤ K at expiry; discounted back: P ≤ K·D. Upper bound = 110.
- **Hint ladder:** (1) The put payoff is at most K (when S_T = 0). What is the present value of that maximum payoff? (2) Maximum put payoff at expiry is K; discounting at rate D gives K·D as the upper bound today. (3) Upper bound = K·D; substitute K and D and multiply.
- **Follow-ups:** What is the lower bound for this same put? / As r → ∞ (D → 0), what happens to the put upper bound and why?

### tmpl-rn-q#u6_5-d4_5-R1  `hard`

**Prompt.** A one-step binomial tree has up factor u = 6/5, down factor d = 4/5, and gross risk-free rate R = 1 (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)

- **Answer (engine-verified):** `q = (R − d)/(u − d) = 1/2`
- **Engine check:** `formatRational(riskNeutralQ(6/5,4/5,1))` → `1/2`
- **Source:** Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7
- **Approaches:** q = (R − d)/(u − d) = (1 − 4/5)/(6/5 − 4/5) = 1/2. / q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).
- **Hint ladder:** (1) The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q. (2) Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R. (3) Compute numerator R − d and denominator u − d separately, then divide and reduce.
- **Follow-ups:** Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not. / Price a call with K = 100 on a tree with S = 100, u = 6/5, d = 4/5, R = 1 using this q.

### tmpl-rn-q#u3_2-d1_2-R11_10  `harder`

**Prompt.** A one-step binomial tree has up factor u = 3/2, down factor d = 1/2, and gross risk-free rate R = 11/10 (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)

- **Answer (engine-verified):** `q = (R − d)/(u − d) = 3/5`
- **Engine check:** `formatRational(riskNeutralQ(3/2,1/2,11/10))` → `3/5`
- **Source:** Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7
- **Approaches:** q = (R − d)/(u − d) = (11/10 − 1/2)/(3/2 − 1/2) = 3/5. / q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).
- **Hint ladder:** (1) The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q. (2) Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R. (3) Compute numerator R − d and denominator u − d separately, then divide and reduce.
- **Follow-ups:** Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not. / Price a call with K = 100 on a tree with S = 100, u = 3/2, d = 1/2, R = 11/10 using this q.

### tmpl-rn-q#u7_4-d3_4-R5_4  `harder`

**Prompt.** A one-step binomial tree has up factor u = 7/4, down factor d = 3/4, and gross risk-free rate R = 5/4 (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)

- **Answer (engine-verified):** `q = (R − d)/(u − d) = 1/2`
- **Engine check:** `formatRational(riskNeutralQ(7/4,3/4,5/4))` → `1/2`
- **Source:** Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7
- **Approaches:** q = (R − d)/(u − d) = (5/4 − 3/4)/(7/4 − 3/4) = 1/2. / q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).
- **Hint ladder:** (1) The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q. (2) Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R. (3) Compute numerator R − d and denominator u − d separately, then divide and reduce.
- **Follow-ups:** Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not. / Price a call with K = 100 on a tree with S = 100, u = 7/4, d = 3/4, R = 5/4 using this q.

### tmpl-rn-q#u4_3-d2_3-R1  `hard`

**Prompt.** A one-step binomial tree has up factor u = 4/3, down factor d = 2/3, and gross risk-free rate R = 1 (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)

- **Answer (engine-verified):** `q = (R − d)/(u − d) = 1/2`
- **Engine check:** `formatRational(riskNeutralQ(4/3,2/3,1))` → `1/2`
- **Source:** Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7
- **Approaches:** q = (R − d)/(u − d) = (1 − 2/3)/(4/3 − 2/3) = 1/2. / q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).
- **Hint ladder:** (1) The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q. (2) Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R. (3) Compute numerator R − d and denominator u − d separately, then divide and reduce.
- **Follow-ups:** Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not. / Price a call with K = 100 on a tree with S = 100, u = 4/3, d = 2/3, R = 1 using this q.

### tmpl-rn-q#u5_4-d3_4-R1  `hard`

**Prompt.** A one-step binomial tree has up factor u = 5/4, down factor d = 3/4, and gross risk-free rate R = 1 (so 1 unit grows to R). What is the risk-neutral probability q? (GB §6.1 L11002)

- **Answer (engine-verified):** `q = (R − d)/(u − d) = 1/2`
- **Engine check:** `formatRational(riskNeutralQ(5/4,3/4,1))` → `1/2`
- **Source:** Green Book §6.1 p.70 L11002 (risk-neutral pricing, q=(R−d)/(u−d)); dossier problem #7
- **Approaches:** q = (R − d)/(u − d) = (1 − 3/4)/(5/4 − 3/4) = 1/2. / q is the unique weight that makes the discounted stock a martingale: q·u + (1−q)·d = R ⇒ q = (R−d)/(u−d).
- **Hint ladder:** (1) The risk-neutral probability comes from the condition q·u·S + (1−q)·d·S = R·S. Rearrange for q. (2) Rearranging q·(u−d) = R−d gives q = (R−d)/(u−d). Substitute u, d, R. (3) Compute numerator R − d and denominator u − d separately, then divide and reduce.
- **Follow-ups:** Would q change if I told you the stock historically goes up 70% of the time? Explain why or why not. / Price a call with K = 100 on a tree with S = 100, u = 5/4, d = 3/4, R = 1 using this q.

### tmpl-binomial-price#call-S100-n1-K100-u6_5  `hard`

**Prompt.** Binomial tree (1-step): S = 100, u = 6/5, d = 4/5, R = 1 (gross risk-free). Price a European call with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `call price = 10`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,1,'call'))` → `10`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^1)·E_q[payoff] by backward induction / direct formula. Result = 10. / With q = (1−4/5)/(6/5−4/5), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^1. Price = 10.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 2 terminal stock prices S·u^k·d^(n−k). Step 3: compute the call payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^1. (2) q = (1−4/5)/(6/5−4/5). List terminal nodes S·u^k·d^(n−k) for k = 0…1 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(1,k)·q^k·(1−q)^(1−k). (3) Sum the weighted payoffs across all 2 terminals, then divide by R^1 to get the present value.
- **Follow-ups:** Now replicate this call: find Δ (shares) and B (bond) so the hedge portfolio matches the call's payoffs at both nodes. / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-binomial-price#call-S100-n1-K100-u7_4  `harder`

**Prompt.** Binomial tree (1-step): S = 100, u = 7/4, d = 3/4, R = 5/4 (gross risk-free). Price a European call with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `call price = 30`
- **Engine check:** `formatRational(binomialPrice(100,7/4,3/4,5/4,100,1,'call'))` → `30`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^1)·E_q[payoff] by backward induction / direct formula. Result = 30. / With q = (5/4−3/4)/(7/4−3/4), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^1. Price = 30.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 2 terminal stock prices S·u^k·d^(n−k). Step 3: compute the call payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^1. (2) q = (5/4−3/4)/(7/4−3/4). List terminal nodes S·u^k·d^(n−k) for k = 0…1 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(1,k)·q^k·(1−q)^(1−k). (3) Sum the weighted payoffs across all 2 terminals, then divide by R^1 to get the present value.
- **Follow-ups:** Now replicate this call: find Δ (shares) and B (bond) so the hedge portfolio matches the call's payoffs at both nodes. / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-binomial-price#put-S100-n1-K100-u6_5  `harder`

**Prompt.** Binomial tree (1-step): S = 100, u = 6/5, d = 4/5, R = 1 (gross risk-free). Price a European put with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `put price = 10`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,1,'put'))` → `10`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^1)·E_q[payoff] by backward induction / direct formula. Result = 10. / With q = (1−4/5)/(6/5−4/5), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^1. Price = 10.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 2 terminal stock prices S·u^k·d^(n−k). Step 3: compute the put payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^1. (2) q = (1−4/5)/(6/5−4/5). List terminal nodes S·u^k·d^(n−k) for k = 0…1 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(1,k)·q^k·(1−q)^(1−k). (3) Sum the weighted payoffs across all 2 terminals, then divide by R^1 to get the present value.
- **Follow-ups:** Now replicate this put: find Δ (shares) and B (bond) so the hedge portfolio matches the put's payoffs at both nodes. / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-binomial-price#call-S100-n2-K100-u6_5  `brutal`

**Prompt.** Binomial tree (2-step): S = 100, u = 6/5, d = 4/5, R = 1 (gross risk-free). Price a European call with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `call price = 11`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,2,'call'))` → `11`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^2)·E_q[payoff] by backward induction / direct formula. Result = 11. / With q = (1−4/5)/(6/5−4/5), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^2. Price = 11.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 3 terminal stock prices S·u^k·d^(n−k). Step 3: compute the call payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^2. (2) q = (1−4/5)/(6/5−4/5). List terminal nodes S·u^k·d^(n−k) for k = 0…2 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(2,k)·q^k·(1−q)^(2−k). (3) Sum the weighted payoffs across all 3 terminals, then divide by R^2 to get the present value.
- **Follow-ups:** Verify by put-call parity: does the complementary put price satisfy C − P = S − K·R^(−2)? / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-binomial-price#call-S100-n3-K100-u6_5  `brutal`

**Prompt.** Binomial tree (3-step): S = 100, u = 6/5, d = 4/5, R = 1 (gross risk-free). Price a European call with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `call price = 74/5`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,3,'call'))` → `74/5`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^3)·E_q[payoff] by backward induction / direct formula. Result = 74/5. / With q = (1−4/5)/(6/5−4/5), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^3. Price = 74/5.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 4 terminal stock prices S·u^k·d^(n−k). Step 3: compute the call payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^3. (2) q = (1−4/5)/(6/5−4/5). List terminal nodes S·u^k·d^(n−k) for k = 0…3 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(3,k)·q^k·(1−q)^(3−k). (3) Sum the weighted payoffs across all 4 terminals, then divide by R^3 to get the present value.
- **Follow-ups:** Verify by put-call parity: does the complementary put price satisfy C − P = S − K·R^(−3)? / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-binomial-price#put-S100-n2-K100-u6_5  `brutal`

**Prompt.** Binomial tree (2-step): S = 100, u = 6/5, d = 4/5, R = 1 (gross risk-free). Price a European put with K = 100 using risk-neutral pricing. (GB §5.3 L9497, §6.1 L11002)

- **Answer (engine-verified):** `put price = 11`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,2,'put'))` → `11`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 backward induction L9497; web-sourced tree mechanics (Cudina UT-Austin; Worrall ECO-30004; AnalystPrep)
- **Approaches:** q = (R−d)/(u−d). Price = (1/R^2)·E_q[payoff] by backward induction / direct formula. Result = 11. / With q = (1−4/5)/(6/5−4/5), compute terminal payoffs, weight by q^k·(1−q)^(n−k)·C(n,k), sum, discount by 1/R^2. Price = 11.
- **Hint ladder:** (1) Step 1: find risk-neutral q = (R−d)/(u−d). Step 2: list the 3 terminal stock prices S·u^k·d^(n−k). Step 3: compute the put payoff at each terminal. Step 4: take the q-weighted expectation and discount by 1/R^2. (2) q = (1−4/5)/(6/5−4/5). List terminal nodes S·u^k·d^(n−k) for k = 0…2 and apply max(S_T−K,0) or max(K−S_T,0). Assign binomial weights C(2,k)·q^k·(1−q)^(2−k). (3) Sum the weighted payoffs across all 3 terminals, then divide by R^2 to get the present value.
- **Follow-ups:** Verify by put-call parity: does the complementary call price satisfy C − P = S − K·R^(−2)? / How does the price change as n → ∞ (toward the Black-Scholes limit)?

### tmpl-replicate#call-delta-u6_5  `harder`

**Prompt.** One-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1. Find the replicating delta Δ for a call with K = 100. (Delta = (V_u − V_d)/(S·(u−d)))

- **Answer (engine-verified):** `Δ = 1/2; full replication: Δ = 1/2, B = -40, price = 10`
- **Engine check:** `formatRational(replicate(100,6/5,4/5,1,100,'call').delta)` → `1/2`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)
- **Approaches:** V_u = max(S·u − K, 0) or max(K−S·u, 0). V_d likewise. Δ = (V_u − V_d)/(S·(u−d)) = 1/2. / Δ is the share count that cancels risk; it also equals the hedge ratio Cov(V,S)/Var(S) in this tree. Δ = 1/2.
- **Hint ladder:** (1) Replicating delta Δ = (V_u − V_d)/(S·(u−d)). First compute V_u and V_d — the call payoffs at the up and down nodes. (2) S·u = 120, S·d = 80. Compute the call payoff at each node: max(S_node − K, 0). (3) With V_u and V_d in hand, form (V_u − V_d) / (S·(u−d)) and reduce the fraction.
- **Follow-ups:** Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the call payoffs). / How does the delta relate to the risk-neutral probability q?

### tmpl-replicate#call-bond-u6_5  `brutal`

**Prompt.** One-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1. The call replicating portfolio is {Δ = 1/2, B = ?}. Find the bond position B. (B = price − Δ·S)

- **Answer (engine-verified):** `B = -40; full replication: Δ = 1/2, B = -40, price = 10`
- **Engine check:** `formatRational(replicate(100,6/5,4/5,1,100,'call').bond)` → `-40`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)
- **Approaches:** Price = 10 (risk-neutral). Δ = 1/2. B = price − Δ·S = 10 − 1/2·100 = -40. / B is the bond (lending if positive, borrowing if negative). For a long call replication you borrow. B = -40.
- **Hint ladder:** (1) The replicating portfolio satisfies: call price = Δ·S + B. You already have Δ = 1/2; find the risk-neutral price first. (2) Risk-neutral price = (1/R)·[q·V_u + (1−q)·V_d] = 10. Then B = price − Δ·S = 10 − 1/2·100. (3) Compute 10 − 1/2·100 and reduce; a negative result means you are borrowing to finance the hedge.
- **Follow-ups:** Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the call payoffs). / What does the sign of B tell you about whether you are lending or borrowing in this replication?

### tmpl-replicate#call-delta-u7_4  `harder`

**Prompt.** One-step binomial tree: S = 100, u = 7/4, d = 3/4, R = 5/4. Find the replicating delta Δ for a call with K = 100. (Delta = (V_u − V_d)/(S·(u−d)))

- **Answer (engine-verified):** `Δ = 3/4; full replication: Δ = 3/4, B = -45, price = 30`
- **Engine check:** `formatRational(replicate(100,7/4,3/4,5/4,100,'call').delta)` → `3/4`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)
- **Approaches:** V_u = max(S·u − K, 0) or max(K−S·u, 0). V_d likewise. Δ = (V_u − V_d)/(S·(u−d)) = 3/4. / Δ is the share count that cancels risk; it also equals the hedge ratio Cov(V,S)/Var(S) in this tree. Δ = 3/4.
- **Hint ladder:** (1) Replicating delta Δ = (V_u − V_d)/(S·(u−d)). First compute V_u and V_d — the call payoffs at the up and down nodes. (2) S·u = 175, S·d = 75. Compute the call payoff at each node: max(S_node − K, 0). (3) With V_u and V_d in hand, form (V_u − V_d) / (S·(u−d)) and reduce the fraction.
- **Follow-ups:** Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the call payoffs). / How does the delta relate to the risk-neutral probability q?

### tmpl-replicate#put-delta-u6_5  `harder`

**Prompt.** One-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1. Find the replicating delta Δ for a put with K = 100. (Delta = (V_u − V_d)/(S·(u−d)))

- **Answer (engine-verified):** `Δ = -1/2; full replication: Δ = -1/2, B = 60, price = 10`
- **Engine check:** `formatRational(replicate(100,6/5,4/5,1,100,'put').delta)` → `-1/2`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)
- **Approaches:** V_u = max(S·u − K, 0) or max(K−S·u, 0). V_d likewise. Δ = (V_u − V_d)/(S·(u−d)) = -1/2. / Δ is the share count that cancels risk; it also equals the hedge ratio Cov(V,S)/Var(S) in this tree. Δ = -1/2.
- **Hint ladder:** (1) Replicating delta Δ = (V_u − V_d)/(S·(u−d)). First compute V_u and V_d — the put payoffs at the up and down nodes. (2) S·u = 120, S·d = 80. Compute the put payoff at each node: max(K − S_node, 0). (3) With V_u and V_d in hand, form (V_u − V_d) / (S·(u−d)) and reduce the fraction.
- **Follow-ups:** Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the put payoffs). / How does the delta relate to the risk-neutral probability q?

### tmpl-replicate#put-bond-u6_5  `brutal`

**Prompt.** One-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1. The put replicating portfolio is {Δ = -1/2, B = ?}. Find the bond position B. (B = price − Δ·S)

- **Answer (engine-verified):** `B = 60; full replication: Δ = -1/2, B = 60, price = 10`
- **Engine check:** `formatRational(replicate(100,6/5,4/5,1,100,'put').bond)` → `60`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); bond=price−delta·S (Cudina UT-Austin; Worrall ECO-30004)
- **Approaches:** Price = 10 (risk-neutral). Δ = -1/2. B = price − Δ·S = 10 − -1/2·100 = 60. / B is the bond (lending if positive, borrowing if negative). For a put replication you lend. B = 60.
- **Hint ladder:** (1) The replicating portfolio satisfies: put price = Δ·S + B. You already have Δ = -1/2; find the risk-neutral price first. (2) Risk-neutral price = (1/R)·[q·V_u + (1−q)·V_d] = 10. Then B = price − Δ·S = 10 − -1/2·100. (3) Compute 10 − -1/2·100 and reduce; a negative result means you are borrowing to finance the hedge.
- **Follow-ups:** Verify: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (both should match the put payoffs). / What does the sign of B tell you about whether you are lending or borrowing in this replication?

### tmpl-tree-terminal#n2-i0-u6_5  `harder`

**Prompt.** On a 2-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 0 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[0] = S·u^(2−0)·d^0 = 144`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,2)[0])` → `144`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 0 → S·u^(2−0)·d^0 = 100·(6/5)^2·(4/5)^0 = 144. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 2, i = 0; compute u^2 and d^0 separately. (3) Multiply S by u^2 and then by d^0; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[0] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-terminal#n2-i1-u6_5  `harder`

**Prompt.** On a 2-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 1 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[1] = S·u^(2−1)·d^1 = 96`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,2)[1])` → `96`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 1 → S·u^(2−1)·d^1 = 100·(6/5)^1·(4/5)^1 = 96. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 2, i = 1; compute u^1 and d^1 separately. (3) Multiply S by u^1 and then by d^1; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[1] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-terminal#n2-i2-u6_5  `harder`

**Prompt.** On a 2-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 2 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[2] = S·u^(2−2)·d^2 = 64`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,2)[2])` → `64`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 2 → S·u^(2−2)·d^2 = 100·(6/5)^0·(4/5)^2 = 64. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 2, i = 2; compute u^0 and d^2 separately. (3) Multiply S by u^0 and then by d^2; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[2] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-terminal#n3-i0-u6_5  `brutal`

**Prompt.** On a 3-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 0 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[0] = S·u^(3−0)·d^0 = 864/5`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,3)[0])` → `864/5`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 0 → S·u^(3−0)·d^0 = 100·(6/5)^3·(4/5)^0 = 864/5. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 3, i = 0; compute u^3 and d^0 separately. (3) Multiply S by u^3 and then by d^0; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[0] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-terminal#n3-i1-u6_5  `brutal`

**Prompt.** On a 3-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 1 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[1] = S·u^(3−1)·d^1 = 576/5`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,3)[1])` → `576/5`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 1 → S·u^(3−1)·d^1 = 100·(6/5)^2·(4/5)^1 = 576/5. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 3, i = 1; compute u^2 and d^1 separately. (3) Multiply S by u^2 and then by d^1; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[1] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-terminal#n3-i2-u6_5  `brutal`

**Prompt.** On a 3-step binomial tree with S = 100, u = 6/5, d = 4/5, list the terminal stock prices highest-first. What is the stock price at index i = 2 (zero-based, highest first)?

- **Answer (engine-verified):** `Terminal[2] = S·u^(3−2)·d^2 = 384/5`
- **Engine check:** `formatRational(treeTerminals(100,6/5,4/5,3)[2])` → `384/5`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Index i = 2 → S·u^(3−2)·d^2 = 100·(6/5)^1·(4/5)^2 = 384/5. / Terminals are ordered highest to lowest: T[0]=S·u^n, T[1]=S·u^(n−1)·d, …, T[n]=S·d^n.
- **Hint ladder:** (1) Terminals are ordered highest to lowest: index i corresponds to (n−i) up-moves and i down-moves. Identify the formula for T[i]. (2) T[i] = S·u^(n−i)·d^i. Substitute S = 100, u = 6/5, d = 4/5, n = 3, i = 2; compute u^1 and d^2 separately. (3) Multiply S by u^1 and then by d^2; combine the fractions and reduce.
- **Follow-ups:** What is the call payoff max(T[2] − K, 0) at this terminal if K = 100? / What risk-neutral weight (binomial probability) corresponds to this node with q = 1/2?

### tmpl-tree-weight#q1_2-n2-i0  `harder`

**Prompt.** On a 2-step binomial tree with risk-neutral probability q = 1/2, what is the risk-neutral weight (probability) at index i = 0 (ordered highest-first, so 2 up-moves and 0 down-moves)?

- **Answer (engine-verified):** `Weight[0] = C(2,2)·q^2·(1−q)^0 = 1/4`
- **Engine check:** `formatRational(treeWeights(1/2,2)[0])` → `1/4`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Weight[0] = C(2,2)·q^2·(1−q)^0 = C(2,2)·(1/2)^2·(1/2)^0 = 1/4. / The weight is the binomial probability of exactly 2 up-moves in 2 steps.
- **Hint ladder:** (1) The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with 2 up-moves and 0 down-moves. (2) With n = 2 and 2 up-moves: C(2,2) = 2!/(2!·0!). Compute this binomial coefficient, then multiply by q^2 and (1−q)^0. (3) Multiply C(2,2) by q^2 and by (1−q)^0; express all factors as fractions and multiply out.
- **Follow-ups:** Verify that all weights for n = 2 sum to one. / What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?

### tmpl-tree-weight#q1_2-n2-i1  `harder`

**Prompt.** On a 2-step binomial tree with risk-neutral probability q = 1/2, what is the risk-neutral weight (probability) at index i = 1 (ordered highest-first, so 1 up-moves and 1 down-moves)?

- **Answer (engine-verified):** `Weight[1] = C(2,1)·q^1·(1−q)^1 = 1/2`
- **Engine check:** `formatRational(treeWeights(1/2,2)[1])` → `1/2`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Weight[1] = C(2,1)·q^1·(1−q)^1 = C(2,1)·(1/2)^1·(1/2)^1 = 1/2. / The weight is the binomial probability of exactly 1 up-moves in 2 steps.
- **Hint ladder:** (1) The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with 1 up-moves and 1 down-moves. (2) With n = 2 and 1 up-moves: C(2,1) = 2!/(1!·1!). Compute this binomial coefficient, then multiply by q^1 and (1−q)^1. (3) Multiply C(2,1) by q^1 and by (1−q)^1; express all factors as fractions and multiply out.
- **Follow-ups:** Verify that all weights for n = 2 sum to one. / What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?

### tmpl-tree-weight#q1_2-n2-i2  `harder`

**Prompt.** On a 2-step binomial tree with risk-neutral probability q = 1/2, what is the risk-neutral weight (probability) at index i = 2 (ordered highest-first, so 0 up-moves and 2 down-moves)?

- **Answer (engine-verified):** `Weight[2] = C(2,0)·q^0·(1−q)^2 = 1/4`
- **Engine check:** `formatRational(treeWeights(1/2,2)[2])` → `1/4`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Weight[2] = C(2,0)·q^0·(1−q)^2 = C(2,0)·(1/2)^0·(1/2)^2 = 1/4. / The weight is the binomial probability of exactly 0 up-moves in 2 steps.
- **Hint ladder:** (1) The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with 0 up-moves and 2 down-moves. (2) With n = 2 and 0 up-moves: C(2,0) = 2!/(0!·2!). Compute this binomial coefficient, then multiply by q^0 and (1−q)^2. (3) Multiply C(2,0) by q^0 and by (1−q)^2; express all factors as fractions and multiply out.
- **Follow-ups:** Verify that all weights for n = 2 sum to one. / What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?

### tmpl-tree-weight#q1_2-n3-i0  `brutal`

**Prompt.** On a 3-step binomial tree with risk-neutral probability q = 1/2, what is the risk-neutral weight (probability) at index i = 0 (ordered highest-first, so 3 up-moves and 0 down-moves)?

- **Answer (engine-verified):** `Weight[0] = C(3,3)·q^3·(1−q)^0 = 1/8`
- **Engine check:** `formatRational(treeWeights(1/2,3)[0])` → `1/8`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Weight[0] = C(3,3)·q^3·(1−q)^0 = C(3,3)·(1/2)^3·(1/2)^0 = 1/8. / The weight is the binomial probability of exactly 3 up-moves in 3 steps.
- **Hint ladder:** (1) The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with 3 up-moves and 0 down-moves. (2) With n = 3 and 3 up-moves: C(3,3) = 3!/(3!·0!). Compute this binomial coefficient, then multiply by q^3 and (1−q)^0. (3) Multiply C(3,3) by q^3 and by (1−q)^0; express all factors as fractions and multiply out.
- **Follow-ups:** Verify that all weights for n = 3 sum to one. / What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?

### tmpl-tree-weight#q1_2-n3-i1  `brutal`

**Prompt.** On a 3-step binomial tree with risk-neutral probability q = 1/2, what is the risk-neutral weight (probability) at index i = 1 (ordered highest-first, so 2 up-moves and 1 down-moves)?

- **Answer (engine-verified):** `Weight[1] = C(3,2)·q^2·(1−q)^1 = 3/8`
- **Engine check:** `formatRational(treeWeights(1/2,3)[1])` → `3/8`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** Weight[1] = C(3,2)·q^2·(1−q)^1 = C(3,2)·(1/2)^2·(1/2)^1 = 3/8. / The weight is the binomial probability of exactly 2 up-moves in 3 steps.
- **Hint ladder:** (1) The weight at index i is C(n, n−i)·q^(n−i)·(1−q)^i, counting paths with 2 up-moves and 1 down-moves. (2) With n = 3 and 2 up-moves: C(3,2) = 3!/(2!·1!). Compute this binomial coefficient, then multiply by q^2 and (1−q)^1. (3) Multiply C(3,2) by q^2 and by (1−q)^1; express all factors as fractions and multiply out.
- **Follow-ups:** Verify that all weights for n = 3 sum to one. / What is the corresponding terminal stock price (S = 100, u = 6/5, d = 4/5) at this index?

### tmpl-path-count#n2-k1  `hard`

**Prompt.** On a 2-step binomial tree, how many distinct paths lead to exactly 1 up-moves (and 1 down-moves)?

- **Answer (engine-verified):** `C(2,1) = 2`
- **Engine check:** `String(pathCount(2,1))` → `2`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** C(2,1) = 2!/(1!·1!) = 2. / Count the number of ways to choose which 1 of the 2 steps are "up"; the rest are "down" by default.
- **Hint ladder:** (1) The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!). (2) Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term. (3) Simplify by cancelling shared factors between numerator and denominator before multiplying out.
- **Follow-ups:** What is C(2, 1) — the count of paths with 1 up-moves — and why does it equal C(2,1)? / How does pathCount relate to the binomial weight at the corresponding tree node?

### tmpl-path-count#n3-k3  `hard`

**Prompt.** On a 3-step binomial tree, how many distinct paths lead to exactly 3 up-moves (and 0 down-moves)?

- **Answer (engine-verified):** `C(3,3) = 1`
- **Engine check:** `String(pathCount(3,3))` → `1`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** C(3,3) = 3!/(3!·0!) = 1. / Count the number of ways to choose which 3 of the 3 steps are "up"; the rest are "down" by default.
- **Hint ladder:** (1) The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!). (2) Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term. (3) Simplify by cancelling shared factors between numerator and denominator before multiplying out.
- **Follow-ups:** What is C(3, 0) — the count of paths with 0 up-moves — and why does it equal C(3,3)? / How does pathCount relate to the binomial weight at the corresponding tree node?

### tmpl-path-count#n4-k2  `harder`

**Prompt.** On a 4-step binomial tree, how many distinct paths lead to exactly 2 up-moves (and 2 down-moves)?

- **Answer (engine-verified):** `C(4,2) = 6`
- **Engine check:** `String(pathCount(4,2))` → `6`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** C(4,2) = 4!/(2!·2!) = 6. / Count the number of ways to choose which 2 of the 4 steps are "up"; the rest are "down" by default.
- **Hint ladder:** (1) The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!). (2) Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term. (3) Simplify by cancelling shared factors between numerator and denominator before multiplying out.
- **Follow-ups:** What is C(4, 2) — the count of paths with 2 up-moves — and why does it equal C(4,2)? / How does pathCount relate to the binomial weight at the corresponding tree node?

### tmpl-path-count#n5-k2  `harder`

**Prompt.** On a 5-step binomial tree, how many distinct paths lead to exactly 2 up-moves (and 3 down-moves)?

- **Answer (engine-verified):** `C(5,2) = 10`
- **Engine check:** `String(pathCount(5,2))` → `10`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** C(5,2) = 5!/(2!·3!) = 10. / Count the number of ways to choose which 2 of the 5 steps are "up"; the rest are "down" by default.
- **Hint ladder:** (1) The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!). (2) Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term. (3) Simplify by cancelling shared factors between numerator and denominator before multiplying out.
- **Follow-ups:** What is C(5, 3) — the count of paths with 3 up-moves — and why does it equal C(5,2)? / How does pathCount relate to the binomial weight at the corresponding tree node?

### tmpl-path-count#n4-k3  `harder`

**Prompt.** On a 4-step binomial tree, how many distinct paths lead to exactly 3 up-moves (and 1 down-moves)?

- **Answer (engine-verified):** `C(4,3) = 4`
- **Engine check:** `String(pathCount(4,3))` → `4`
- **Source:** Green Book §5.3 L9497 + §6.1 L11319; binomial path-count canon
- **Approaches:** C(4,3) = 4!/(3!·1!) = 4. / Count the number of ways to choose which 3 of the 4 steps are "up"; the rest are "down" by default.
- **Hint ladder:** (1) The number of paths with exactly k up-moves in n steps is the binomial coefficient C(n,k) = n!/(k!(n−k)!). (2) Apply the factorial formula C(n,k) = n!/(k!·(n−k)!) with the given n and k; expand each factorial term. (3) Simplify by cancelling shared factors between numerator and denominator before multiplying out.
- **Follow-ups:** What is C(4, 1) — the count of paths with 1 up-moves — and why does it equal C(4,3)? / How does pathCount relate to the binomial weight at the corresponding tree node?

### tmpl-hedge-ratio#cov6-varB9  `hard`

**Prompt.** You are long asset A and will short h units of asset B to minimize Var(A − h·B). Given Cov(A,B) = 6 and Var(B) = 9, what is the optimal hedge ratio h*? (GB §4.5 p.48 L7647)

- **Answer (engine-verified):** `h* = Cov(A,B)/Var(B) = 6/9 = 2/3`
- **Engine check:** `formatRational(hedgeRatio(6,9))` → `2/3`
- **Source:** Green Book §4.5 p.48 L7647 (h* = Cov/Var); dossier problem #16
- **Approaches:** Minimize Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²Var(B). Differentiate w.r.t. h and set to zero: h* = Cov(A,B)/Var(B) = 6/9 = 2/3. / h* is also the OLS slope of A on B: h* = ρ·σ_A/σ_B = Cov(A,B)/Var(B) = 2/3.
- **Hint ladder:** (1) Write Var(A − h·B) as a function of h and differentiate; set the derivative to zero to find the minimizer. (2) Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²·Var(B). Derivative w.r.t. h: −2·Cov + 2h·Var(B) = 0. (3) Solving: h* = Cov(A,B)/Var(B); substitute Cov = 6 and Var(B) = 9 and reduce.
- **Follow-ups:** What residual variance Var(A − h*·B) remains at the optimal hedge? / How does h* relate to the option delta Δ = (V_u−V_d)/(S(u−d)) on a binomial tree?

### tmpl-hedge-ratio#cov-6-varB9  `hard`

**Prompt.** You are long asset A and will short h units of asset B to minimize Var(A − h·B). Given Cov(A,B) = -6 and Var(B) = 9, what is the optimal hedge ratio h*? (GB §4.5 p.48 L7647)

- **Answer (engine-verified):** `h* = Cov(A,B)/Var(B) = -6/9 = -2/3`
- **Engine check:** `formatRational(hedgeRatio(-6,9))` → `-2/3`
- **Source:** Green Book §4.5 p.48 L7647 (h* = Cov/Var); dossier problem #16
- **Approaches:** Minimize Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²Var(B). Differentiate w.r.t. h and set to zero: h* = Cov(A,B)/Var(B) = -6/9 = -2/3. / h* is also the OLS slope of A on B: h* = ρ·σ_A/σ_B = Cov(A,B)/Var(B) = -2/3.
- **Hint ladder:** (1) Write Var(A − h·B) as a function of h and differentiate; set the derivative to zero to find the minimizer. (2) Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²·Var(B). Derivative w.r.t. h: −2·Cov + 2h·Var(B) = 0. (3) Solving: h* = Cov(A,B)/Var(B); substitute Cov = -6 and Var(B) = 9 and reduce.
- **Follow-ups:** What residual variance Var(A − h*·B) remains at the optimal hedge? / How does h* relate to the option delta Δ = (V_u−V_d)/(S(u−d)) on a binomial tree?

### tmpl-hedge-ratio#cov12-varB16  `harder`

**Prompt.** You are long asset A and will short h units of asset B to minimize Var(A − h·B). Given Cov(A,B) = 12 and Var(B) = 16, what is the optimal hedge ratio h*? (GB §4.5 p.48 L7647)

- **Answer (engine-verified):** `h* = Cov(A,B)/Var(B) = 12/16 = 3/4`
- **Engine check:** `formatRational(hedgeRatio(12,16))` → `3/4`
- **Source:** Green Book §4.5 p.48 L7647 (h* = Cov/Var); dossier problem #16
- **Approaches:** Minimize Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²Var(B). Differentiate w.r.t. h and set to zero: h* = Cov(A,B)/Var(B) = 12/16 = 3/4. / h* is also the OLS slope of A on B: h* = ρ·σ_A/σ_B = Cov(A,B)/Var(B) = 3/4.
- **Hint ladder:** (1) Write Var(A − h·B) as a function of h and differentiate; set the derivative to zero to find the minimizer. (2) Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²·Var(B). Derivative w.r.t. h: −2·Cov + 2h·Var(B) = 0. (3) Solving: h* = Cov(A,B)/Var(B); substitute Cov = 12 and Var(B) = 16 and reduce.
- **Follow-ups:** What residual variance Var(A − h*·B) remains at the optimal hedge? / How does h* relate to the option delta Δ = (V_u−V_d)/(S(u−d)) on a binomial tree?

### tmpl-hedge-ratio#cov8-varB25  `harder`

**Prompt.** You are long asset A and will short h units of asset B to minimize Var(A − h·B). Given Cov(A,B) = 8 and Var(B) = 25, what is the optimal hedge ratio h*? (GB §4.5 p.48 L7647)

- **Answer (engine-verified):** `h* = Cov(A,B)/Var(B) = 8/25 = 8/25`
- **Engine check:** `formatRational(hedgeRatio(8,25))` → `8/25`
- **Source:** Green Book §4.5 p.48 L7647 (h* = Cov/Var); dossier problem #16
- **Approaches:** Minimize Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²Var(B). Differentiate w.r.t. h and set to zero: h* = Cov(A,B)/Var(B) = 8/25 = 8/25. / h* is also the OLS slope of A on B: h* = ρ·σ_A/σ_B = Cov(A,B)/Var(B) = 8/25.
- **Hint ladder:** (1) Write Var(A − h·B) as a function of h and differentiate; set the derivative to zero to find the minimizer. (2) Var(A−h·B) = Var(A) − 2h·Cov(A,B) + h²·Var(B). Derivative w.r.t. h: −2·Cov + 2h·Var(B) = 0. (3) Solving: h* = Cov(A,B)/Var(B); substitute Cov = 8 and Var(B) = 25 and reduce.
- **Follow-ups:** What residual variance Var(A − h*·B) remains at the optimal hedge? / How does h* relate to the option delta Δ = (V_u−V_d)/(S(u−d)) on a binomial tree?

### tmpl-min-var#varA1_25-varB9_100-cov3_100-wA  `brutal`

**Prompt.** Two assets with Var(A) = 1/25, Var(B) = 9/100, Cov(A,B) = 3/100. Find the minimum-variance portfolio weights and variance. What is the weight in asset A (w_A)? (GB §6.4 p.82-83 L12795)

- **Answer (engine-verified):** `w_A = 6/7; full solution: w_A = 6/7, w_B = 1/7, Var_min = 27/700`
- **Engine check:** `formatRational(minVarWeights(1/25,9/100,3/100).wA)` → `6/7`
- **Source:** Green Book §6.4 p.82-83 L12795 (min-variance two-stock, 6/7 in A, 1/7 in B); dossier problem #20
- **Approaches:** w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (9/100 − 3/100)/(1/25 + 9/100 − 2·3/100) = 6/7; w_B = 1 − w_A = 1/7; Var_min = 27/700. / The minimum-variance frontier formula: dVAR/dw = 0 gives w_A = (σ_B² − σ_{AB})/(σ_A² + σ_B² − 2σ_{AB}).
- **Hint ladder:** (1) Minimize Var(w_A·A + w_B·B) = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov subject to w_A + w_B = 1. Substitute w_B = 1 − w_A. (2) After substituting, differentiate w.r.t. w_A and set to zero: the formula for w_A is (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov). (3) Compute denominator = Var(A) + Var(B) − 2·Cov and numerator = Var(B) − Cov; divide and reduce.
- **Follow-ups:** Verify w_A + w_B = 1. / How does Var_min compare to Var(A) and Var(B) individually?

### tmpl-min-var#varA1_25-varB9_100-cov3_100-wB  `brutal`

**Prompt.** Two assets with Var(A) = 1/25, Var(B) = 9/100, Cov(A,B) = 3/100. Find the minimum-variance portfolio weights and variance. What is the weight in asset B (w_B)? (GB §6.4 p.82-83 L12795)

- **Answer (engine-verified):** `w_B = 1/7; full solution: w_A = 6/7, w_B = 1/7, Var_min = 27/700`
- **Engine check:** `formatRational(minVarWeights(1/25,9/100,3/100).wB)` → `1/7`
- **Source:** Green Book §6.4 p.82-83 L12795 (min-variance two-stock, 6/7 in A, 1/7 in B); dossier problem #20
- **Approaches:** w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (9/100 − 3/100)/(1/25 + 9/100 − 2·3/100) = 6/7; w_B = 1 − w_A = 1/7; Var_min = 27/700. / The minimum-variance frontier formula: dVAR/dw = 0 gives w_A = (σ_B² − σ_{AB})/(σ_A² + σ_B² − 2σ_{AB}).
- **Hint ladder:** (1) Minimize Var(w_A·A + w_B·B) = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov subject to w_A + w_B = 1. Substitute w_B = 1 − w_A. (2) After substituting, differentiate w.r.t. w_A and set to zero: the formula for w_A is (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov). (3) Compute denominator = Var(A) + Var(B) − 2·Cov and numerator = Var(B) − Cov; divide and reduce.
- **Follow-ups:** Verify w_A + w_B = 1. / How does Var_min compare to Var(A) and Var(B) individually?

### tmpl-min-var#varA1_25-varB9_100-cov3_100-varMin  `brutal`

**Prompt.** Two assets with Var(A) = 1/25, Var(B) = 9/100, Cov(A,B) = 3/100. Find the minimum-variance portfolio weights and variance. What is the minimum portfolio variance (Var_min)? (GB §6.4 p.82-83 L12795)

- **Answer (engine-verified):** `Var_min = 27/700; full solution: w_A = 6/7, w_B = 1/7, Var_min = 27/700`
- **Engine check:** `formatRational(minVarWeights(1/25,9/100,3/100).varMin)` → `27/700`
- **Source:** Green Book §6.4 p.82-83 L12795 (min-variance two-stock, 6/7 in A, 1/7 in B); dossier problem #20
- **Approaches:** w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (9/100 − 3/100)/(1/25 + 9/100 − 2·3/100) = 6/7; w_B = 1 − w_A = 1/7; Var_min = 27/700. / The minimum-variance frontier formula: dVAR/dw = 0 gives w_A = (σ_B² − σ_{AB})/(σ_A² + σ_B² − 2σ_{AB}).
- **Hint ladder:** (1) Minimize Var(w_A·A + w_B·B) = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov subject to w_A + w_B = 1. Substitute w_B = 1 − w_A. (2) After substituting, differentiate w.r.t. w_A and set to zero: the formula for w_A is (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov). (3) Compute denominator = Var(A) + Var(B) − 2·Cov and numerator = Var(B) − Cov; divide and reduce.
- **Follow-ups:** Verify w_A + w_B = 1. / How does Var_min compare to Var(A) and Var(B) individually?

### tmpl-one-touch#H5_4  `hard`

**Prompt.** A one-touch digital option pays $1 the first time the asset reaches the level H = 5/4, starting from S_0 = 1, with r = 0. What is the fair price of this digital? (GB §6.2 p.75 L11741)

- **Answer (engine-verified):** `one-touch price = 1/H = 4/5`
- **Engine check:** `formatRational(oneTouchPrice(5/4))` → `4/5`
- **Source:** Green Book §6.2 p.75 L11741 (one-touch digital = 1/H); dossier problem #18
- **Approaches:** At r = 0 the stock is a martingale. Replication: buy 1/H shares. If the asset hits H, 1/H shares × H = 1 = the payoff. Cost today: (1/H) × S_0 = 1/H = 4/5. / Optional stopping + martingale: E_Q[S_T] = S_0 = 1. The payout is 1 at the first hitting time τ, so price = E_Q[1{τ<∞}] = S_0/H = 1/H.
- **Hint ladder:** (1) The one-touch is replicated by holding 1/H shares. If S hits H, the shares are worth 1. How much does the replicating portfolio cost today? (2) Replicating portfolio: hold 1/H shares at price S_0 = 1. Cost = 1/H · S_0. Since S_0 is given, evaluate 1/H. (3) Price = 1/H with H = 5/4; compute this fraction and reduce.
- **Follow-ups:** Verify: if S_0 = 1 and you hold 1/H shares, the payoff is exactly $1 when S first reaches H. / How does the price change if H decreases toward 1? What does H = 1 imply?

### tmpl-one-touch#H2  `hard`

**Prompt.** A one-touch digital option pays $1 the first time the asset reaches the level H = 2, starting from S_0 = 1, with r = 0. What is the fair price of this digital? (GB §6.2 p.75 L11741)

- **Answer (engine-verified):** `one-touch price = 1/H = 1/2`
- **Engine check:** `formatRational(oneTouchPrice(2))` → `1/2`
- **Source:** Green Book §6.2 p.75 L11741 (one-touch digital = 1/H); dossier problem #18
- **Approaches:** At r = 0 the stock is a martingale. Replication: buy 1/H shares. If the asset hits H, 1/H shares × H = 1 = the payoff. Cost today: (1/H) × S_0 = 1/H = 1/2. / Optional stopping + martingale: E_Q[S_T] = S_0 = 1. The payout is 1 at the first hitting time τ, so price = E_Q[1{τ<∞}] = S_0/H = 1/H.
- **Hint ladder:** (1) The one-touch is replicated by holding 1/H shares. If S hits H, the shares are worth 1. How much does the replicating portfolio cost today? (2) Replicating portfolio: hold 1/H shares at price S_0 = 1. Cost = 1/H · S_0. Since S_0 is given, evaluate 1/H. (3) Price = 1/H with H = 2; compute this fraction and reduce.
- **Follow-ups:** Verify: if S_0 = 1 and you hold 1/H shares, the payoff is exactly $1 when S first reaches H. / How does the price change if H decreases toward 1? What does H = 1 imply?

### tmpl-one-touch#H5_2  `harder`

**Prompt.** A one-touch digital option pays $1 the first time the asset reaches the level H = 5/2, starting from S_0 = 1, with r = 0. What is the fair price of this digital? (GB §6.2 p.75 L11741)

- **Answer (engine-verified):** `one-touch price = 1/H = 2/5`
- **Engine check:** `formatRational(oneTouchPrice(5/2))` → `2/5`
- **Source:** Green Book §6.2 p.75 L11741 (one-touch digital = 1/H); dossier problem #18
- **Approaches:** At r = 0 the stock is a martingale. Replication: buy 1/H shares. If the asset hits H, 1/H shares × H = 1 = the payoff. Cost today: (1/H) × S_0 = 1/H = 2/5. / Optional stopping + martingale: E_Q[S_T] = S_0 = 1. The payout is 1 at the first hitting time τ, so price = E_Q[1{τ<∞}] = S_0/H = 1/H.
- **Hint ladder:** (1) The one-touch is replicated by holding 1/H shares. If S hits H, the shares are worth 1. How much does the replicating portfolio cost today? (2) Replicating portfolio: hold 1/H shares at price S_0 = 1. Cost = 1/H · S_0. Since S_0 is given, evaluate 1/H. (3) Price = 1/H with H = 5/2; compute this fraction and reduce.
- **Follow-ups:** Verify: if S_0 = 1 and you hold 1/H shares, the payoff is exactly $1 when S first reaches H. / How does the price change if H decreases toward 1? What does H = 1 imply?

### tmpl-greek-sign#delta-call  `hard`

**Prompt.** What is the sign of delta for a European call option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `delta/call sign = 1 (positive (+1)): Delta > 0 for calls: as S rises, call value rises (long stock sensitivity).`
- **Engine check:** `String(greekSign('delta','call'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Delta > 0 for calls: as S rises, call value rises (long stock sensitivity). / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) delta measures how the option value changes with respect to the stock price S. Think about the direction for a call. (2) For a call: as S increases, does the call value increase or decrease? (3) Delta > 0 for calls: as S rises, call value rises (long stock sensitivity). Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#delta-put  `hard`

**Prompt.** What is the sign of delta for a European put option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `delta/put sign = -1 (negative (−1)): Delta < 0 for puts: as S rises, put value falls (short stock sensitivity).`
- **Engine check:** `String(greekSign('delta','put'))` → `-1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Delta < 0 for puts: as S rises, put value falls (short stock sensitivity). / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) delta measures how the option value changes with respect to the stock price S. Think about the direction for a put. (2) For a put: as S increases, does the put value increase or decrease? (3) Delta < 0 for puts: as S rises, put value falls (short stock sensitivity). Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#gamma-call  `hard`

**Prompt.** What is the sign of gamma for a European call option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `gamma/call sign = 1 (positive (+1)): Gamma > 0 for calls: the delta itself increases as S rises (convexity).`
- **Engine check:** `String(greekSign('gamma','call'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Gamma > 0 for calls: the delta itself increases as S rises (convexity). / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) gamma measures how the option value changes with respect to the stock price S (second derivative). Think about the direction for a call. (2) For a call: as S increases, does the call value increase or decrease? (3) Gamma > 0 for calls: the delta itself increases as S rises (convexity). Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#vega-call  `hard`

**Prompt.** What is the sign of vega for a European call option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `vega/call sign = 1 (positive (+1)): Vega > 0 for calls: higher volatility increases the chance of a large payoff.`
- **Engine check:** `String(greekSign('vega','call'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Vega > 0 for calls: higher volatility increases the chance of a large payoff. / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) vega measures how the option value changes with respect to volatility σ. Think about the direction for a call. (2) For a call: as σ increases, does the call value increase or decrease? (3) Vega > 0 for calls: higher volatility increases the chance of a large payoff. Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#theta-call  `hard`

**Prompt.** What is the sign of theta for a European call option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `theta/call sign = -1 (negative (−1)): Theta < 0 for calls: time decay reduces option value as expiry approaches.`
- **Engine check:** `String(greekSign('theta','call'))` → `-1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Theta < 0 for calls: time decay reduces option value as expiry approaches. / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) theta measures how the option value changes with respect to time to expiry T. Think about the direction for a call. (2) For a call: as time passes (T decreases) increases, does the call value increase or decrease? (3) Theta < 0 for calls: time decay reduces option value as expiry approaches. Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#rho-put  `harder`

**Prompt.** What is the sign of rho for a European put option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `rho/put sign = -1 (negative (−1)): Rho < 0 for puts: higher rates reduce the PV of the strike, making puts worth less.`
- **Engine check:** `String(greekSign('rho','put'))` → `-1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Rho < 0 for puts: higher rates reduce the PV of the strike, making puts worth less. / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) rho measures how the option value changes with respect to the interest rate r. Think about the direction for a put. (2) For a put: as r increases, does the put value increase or decrease? (3) Rho < 0 for puts: higher rates reduce the PV of the strike, making puts worth less. Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#gamma-put  `harder`

**Prompt.** What is the sign of gamma for a European put option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `gamma/put sign = 1 (positive (+1)): Gamma > 0 for puts: same as calls — both exhibit positive convexity.`
- **Engine check:** `String(greekSign('gamma','put'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Gamma > 0 for puts: same as calls — both exhibit positive convexity. / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) gamma measures how the option value changes with respect to the stock price S (second derivative). Think about the direction for a put. (2) For a put: as S increases, does the put value increase or decrease? (3) Gamma > 0 for puts: same as calls — both exhibit positive convexity. Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#theta-put  `harder`

**Prompt.** What is the sign of theta for a European put option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `theta/put sign = -1 (negative (−1)): Theta < 0 for puts: time decay also hurts puts (both erode with passage of time).`
- **Engine check:** `String(greekSign('theta','put'))` → `-1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Theta < 0 for puts: time decay also hurts puts (both erode with passage of time). / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) theta measures how the option value changes with respect to time to expiry T. Think about the direction for a put. (2) For a put: as time passes (T decreases) increases, does the put value increase or decrease? (3) Theta < 0 for puts: time decay also hurts puts (both erode with passage of time). Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#vega-put  `harder`

**Prompt.** What is the sign of vega for a European put option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `vega/put sign = 1 (positive (+1)): Vega > 0 for puts: higher volatility also benefits puts (symmetric payoff spreading).`
- **Engine check:** `String(greekSign('vega','put'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Vega > 0 for puts: higher volatility also benefits puts (symmetric payoff spreading). / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) vega measures how the option value changes with respect to volatility σ. Think about the direction for a put. (2) For a put: as σ increases, does the put value increase or decrease? (3) Vega > 0 for puts: higher volatility also benefits puts (symmetric payoff spreading). Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### tmpl-greek-sign#rho-call  `harder`

**Prompt.** What is the sign of rho for a European call option? Answer +1, 0, or −1. (GB §6.2 p.75 L11736)

- **Answer (engine-verified):** `rho/call sign = 1 (positive (+1)): Rho > 0 for calls: higher rates reduce the PV of the strike, making calls worth more.`
- **Engine check:** `String(greekSign('rho','call'))` → `1`
- **Source:** Green Book §6.2 p.75 L11736 (Greek signs; magnitude N(d1) display-only); dossier problem #17
- **Approaches:** Rho > 0 for calls: higher rates reduce the PV of the strike, making calls worth more. / Recall the Black-Scholes magnitudes are irrational (they involve N(d1)); only the SIGN is exact and graded here.
- **Hint ladder:** (1) rho measures how the option value changes with respect to the interest rate r. Think about the direction for a call. (2) For a call: as r increases, does the call value increase or decrease? (3) Rho > 0 for calls: higher rates reduce the PV of the strike, making calls worth more. Report +1 for positive, −1 for negative — magnitudes are irrational (N(d1)) and are NOT the graded answer.
- **Follow-ups:** Name a situation (in terms of moneyness or time) where this Greek is largest in magnitude. / Which Greek is the same sign for both calls and puts, and why?

### ff-canonical-hedge-cost  `brutal`

**Prompt.** Canonical one-step tree: S = 100, K = 100, u = 6/5, d = 4/5, r = 0. Price the call by building the replicating hedge — find Δ and B so that Δ·S_u + B = V_u and Δ·S_d + B = V_d — then show the hedge cost Δ·S + B equals the risk-neutral price.

- **Answer (engine-verified):** `price = 10; Δ = 1/2, B = −40. Hedge cost = 1/2·100 + (−40) = 50 − 40 = 10. Risk-neutral: q = 1/2, price = (1/1)·[1/2·20 + 1/2·0] = 10. Both routes agree.`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,1,'call'))` → `10`
- **Source:** Green Book §6.1 risk-neutral L11002 + §5.3 L9497; delta=(V_u−V_d)/(S(u−d)); dossier problem #8 (canonical tree)
- **Approaches:** System: Δ·120 + B = 20, Δ·80 + B = 0. Subtract: Δ·40 = 20 ⇒ Δ = 1/2. Back-sub: B = −40. Cost = 1/2·100 − 40 = 10. / Risk-neutral shortcut: q = (R−d)/(u−d) = (1−4/5)/(6/5−4/5) = 1/2. Price = (1/R)·[q·V_u + (1−q)·V_d] = 1·[1/2·20 + 1/2·0] = 10.
- **Hint ladder:** (1) Set up the two replication equations: Δ·S_u + B = V_u and Δ·S_d + B = V_d. First compute S_u, S_d, V_u, V_d. (2) S_u = 120, S_d = 80. V_u = max(120−100,0) = 20, V_d = max(80−100,0) = 0. Subtract the two equations to isolate Δ. (3) Subtracting gives Δ·(S_u − S_d) = V_u − V_d; solve for Δ, back-sub to get B, then compute Δ·S + B as the hedge cost.
- **Follow-ups:** Verify both replication equations hold: Δ·S_u + B·R = V_u and Δ·S_d + B·R = V_d (R = 1 here). / Now compute the risk-neutral price independently using q = 1/2. Do the two approaches give the same answer?

### ff-parity-put-from-call  `hard`

**Prompt.** r = 0, S = 100, K = 100, and you observe a call price C = 10. Using put-call parity, find the fair put price P.

- **Answer (engine-verified):** `P = 10. Parity: C − P = S − K·D = 100 − 100·1 = 0, so P = C = 10.`
- **Engine check:** `formatRational(paritySolve({C:10,S:100,K:100,D:1}))` → `10`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (put-call parity C−P=S−K·D); dossier problem #3
- **Approaches:** C − P = S − K·D = 100 − 100 = 0 ⇒ P = C = 10. / Rearrange: P = C − (S − K·D) = 10 − 0 = 10.
- **Hint ladder:** (1) Write put-call parity: C − P = S − K·D. You know C, S, K, D. Rearrange to isolate P. (2) S − K·D = 100 − 100·1. Compute this first, then rearrange C − P = (that value) for P. (3) After computing S − K·D, isolate P: P = C − (S − K·D). Substitute and simplify.
- **Follow-ups:** Why does C = P when S = K and r = 0? Give an intuitive argument. / If you buy the call and sell the put, what position have you created? What is its payoff at expiry?

### ff-conversion-arb-gap  `harder`

**Prompt.** Market quotes: S = 100, K = 95, r = 0 (D = 1), C = 8, P = 2. Compute the put-call parity gap (C − P) − (S − K·D). If nonzero, identify the arbitrage trade and the locked profit.

- **Answer (engine-verified):** `gap = 1 > 0. Option side is overpriced. Conversion trade: sell C, buy P, buy S, borrow K·D = 95. Net cash today = (8 − 2) − (100 − 95) = 6 − 5 = 1 (locked profit). The position self-liquidates at expiry.`
- **Engine check:** `formatRational(parityGap(8,2,100,95,1))` → `1`
- **Source:** Green Book §6.1 p.70 L10820/L10840 (parity arb, conversion/reversal); dossier problem #5
- **Approaches:** (C − P) − (S − K·D) = (8 − 2) − (100 − 95·1) = 6 − 5 = 1. Positive gap ⇒ conversion arb: sell C, buy P, buy stock, borrow K. / Parity says C − P = S − K (r=0). Here LHS = 6 > RHS = 5, so the LHS is rich; sell it and buy the RHS.
- **Hint ladder:** (1) Parity gap = (C − P) − (S − K·D). Compute the left side (option spread) and the right side (stock minus discounted strike) separately. (2) Left side: C − P = 8 − 2 = 6. Right side: S − K·D = 100 − 95·1 = 5. Now subtract right from left to get the gap. (3) If the gap is positive, the option side is overpriced; run a conversion — sell the option spread and buy the synthetic forward — locking in the gap as profit.
- **Follow-ups:** What does the conversion trade look like at expiry when S_T > 95? When S_T < 95? / If the gap were negative, what trade would you run instead (reversal)?

### ff-two-step-call-price  `brutal`

**Prompt.** Two-step binomial tree: S = 100, u = 6/5, d = 4/5, R = 1 (r = 0), K = 100. Three terminal nodes exist at expiry. Price the European call by risk-neutral backward induction.

- **Answer (engine-verified):** `price = 11. q = 1/2. Terminals: S·u² = 144 (payoff 44), S·u·d = 96 (payoff 0), S·d² = 64 (payoff 0). Weights: 1/4, 1/2, 1/4. Price = 1/4·44 + 1/2·0 + 1/4·0 = 11.`
- **Engine check:** `formatRational(binomialPrice(100,6/5,4/5,1,100,2,'call'))` → `11`
- **Source:** Green Book §5.3 backward induction L9497 + §6.1 risk-neutral L11002; dossier problem #10
- **Approaches:** q = (1−4/5)/(6/5−4/5) = 1/2. Terminals: 144 (payoff 44), 96 (payoff 0), 64 (payoff 0). Weights: C(2,2)·(1/2)² = 1/4, C(2,1)·(1/2)² = 1/2, C(2,0)·(1/2)² = 1/4. Price = 1·(1/4·44) = 11. / Backward induction: at t=1 up-node: call = (1/1)·[1/2·44 + 1/2·0] = 22. At t=1 down-node: call = 0. At t=0: price = (1/1)·[1/2·22 + 1/2·0] = 11.
- **Hint ladder:** (1) Map out the 3 terminal stock prices: S·u², S·u·d, S·d². Compute the call payoff max(S_T − K, 0) at each. Find q first. (2) q = (R−d)/(u−d). Terminals: 100·(6/5)², 100·(6/5)·(4/5), 100·(4/5)². Payoffs: apply max(·−100,0). Binomial weights: C(2,k)·q^k·(1−q)^(2−k). (3) Price = (1/R²)·∑ weight_k · payoff_k; with R = 1, just sum the weighted payoffs over the three terminals.
- **Follow-ups:** Price the put with K = 100 on the same two-step tree and verify parity: C − P = S − K·R^(−2). / What are the replicating Δ and B at each of the two t=1 nodes?

### ff-delta-is-hedge-ratio  `brutal`

**Prompt.** Canonical one-step tree: S = 100, u = 6/5, d = 4/5, r = 0. The call delta is Δ = (V_u − V_d)/(S(u−d)). Show that this equals the Cov/Var hedge ratio from portfolio theory and compute the common value.

- **Answer (engine-verified):** `Δ = 1/2. Delta route: (V_u − V_d)/(S(u−d)) = (20 − 0)/(100·2/5) = 20/40 = 1/2. Hedge-ratio route: Cov(V,S)/Var(S). V = (20, 0) with q=1/2: E[V]=10, E[S]= 100, Cov = q·20·120 + (1−q)·0·80 − 10·100 = 1200 − 1000 = 200. Var(S) = q·120² + (1−q)·80² − 100² = (14400+6400)/2 − 10000 = 10400 − 10000 = 400. h = 200/400 = 1/2.`
- **Engine check:** `formatRational(replicate(100,6/5,4/5,1,100,'call').delta)` → `1/2`
- **Source:** Green Book §4.5 p.48 L7647 (h* = Cov/Var) + §6.1 L11002 (delta); dossier problems #8, #16
- **Approaches:** Δ = (V_u − V_d)/(S(u−d)) = (20 − 0)/(100·(2/5)) = 20/40 = 1/2. / Cov/Var: Cov(V,S) = E[VS] − E[V]E[S] = (1/2·20·120 + 1/2·0·80) − 10·100 = 1200 − 1000 = 200. Var(S) = 400. h = 200/400 = 1/2.
- **Hint ladder:** (1) Compute the call delta two ways: (1) directly as (V_u − V_d)/(S(u−d)), and (2) as Cov(V,S)/Var(S) using the risk-neutral distribution with q = 1/2. (2) Delta route: V_u = max(120−100,0) = 20, V_d = 0. S(u−d) = 100·(6/5−4/5) = 100·(2/5) = 40. Divide (V_u − V_d) by 40. (3) For the hedge-ratio route: compute E[V], E[S], E[VS] under q; then Cov = E[VS] − E[V]E[S] and Var(S) = E[S²] − E[S]²; take the ratio.
- **Follow-ups:** Why must the delta route and the Cov/Var route give the same answer? / What does Δ = 1/2 mean for the replicating portfolio?

### ff-min-var-weight-A  `brutal`

**Prompt.** Two-stock minimum-variance portfolio (Green Book §6.4). σ_A = 1/5, σ_B = 3/10, ρ = 1/2. Hence Var(A) = 1/25, Var(B) = 9/100, Cov(A,B) = ρ·σ_A·σ_B = 3/100. Find the minimum-variance weight in asset A (w_A).

- **Answer (engine-verified):** `w_A = 6/7. Denominator = Var(A) + Var(B) − 2·Cov = 1/25 + 9/100 − 6/100 = 4/100 + 9/100 − 6/100 = 7/100. Numerator = Var(B) − Cov = 9/100 − 3/100 = 6/100. w_A = (6/100)/(7/100) = 6/7.`
- **Engine check:** `formatRational(minVarWeights(1/25,9/100,3/100).wA)` → `6/7`
- **Source:** Green Book §6.4 p.82-83 L12795 (min-variance two-stock, w_A = 6/7, w_B = 1/7); dossier problem #20
- **Approaches:** w_A = (Var(B) − Cov)/(Var(A) + Var(B) − 2·Cov) = (9/100 − 3/100)/(1/25 + 9/100 − 6/100) = (6/100)/(7/100) = 6/7. / This is the canonical Green Book §6.4 example: σ_A = 1/5, σ_B = 3/10, ρ = 1/2 ⇒ w_A = 6/7 ≈ 85.7% in A.
- **Hint ladder:** (1) The minimum-variance weight formula is w_A = (Var(B) − Cov(A,B))/(Var(A) + Var(B) − 2·Cov(A,B)). First compute Var(A), Var(B), Cov(A,B) from the given σ and ρ. (2) Var(A) = σ_A² = (1/5)² = 1/25. Var(B) = (3/10)² = 9/100. Cov = ρ·σ_A·σ_B = (1/2)·(1/5)·(3/10) = 3/100. Now compute numerator and denominator. (3) Numerator = Var(B) − Cov = 9/100 − 3/100. Denominator = Var(A) + Var(B) − 2·Cov. Reduce both to a common denominator before dividing.
- **Follow-ups:** What is the minimum portfolio variance Var_min = w_A²·Var(A) + w_B²·Var(B) + 2·w_A·w_B·Cov? / What is w_B = 1 − w_A? Verify Var_min < Var(A) and Var_min < Var(B).

