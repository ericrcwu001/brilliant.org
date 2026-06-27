# Interview Pack — Covariance & Correlation (`course-covariance`)

> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with `./node_modules/.bin/tsx interviews/_build/build-covariance-pack.ts`.

**Anchor:** A Practical Guide To Quantitative Finance Interviews (Xinfeng Zhou): Covariance / "General rules of variance and covariance" / correlation ρ on pp.47-48 (lines 7502-7660); "max/min correlation of 3 variables" pp.26-29 (lines 4579-4943, range min 7/25, max 1); "Correlation of max and min" pp.51-52 (lines 8059-8175, ρ=1/2); optimal hedge ratio p.48 (line 7647). Grounded by the concept source-dossier (13 sourced exact-rational problems).

**Engine:** `src/engine/covariance.ts` — every answer is engine-verified (exact rational, no floats).

**Counts:** 62 questions (hard 18, harder 29, brutal 15; 59 templated, 3 free-form).

## Templates

- `tmpl-variance` — Variance of a finite distribution (GB p.47-48): variance(pmf): fair die or Bernoulli indicator.
- `tmpl-cov-joint` — Covariance from a joint pmf (GB p.47-48): covariance(joint): Cov(X,Y)=E[XY]−E[X]E[Y] from a 2×2 table.
- `tmpl-cov-indicator` — Indicator covariance (GB p.47-48): covarianceIndicators(pAB,pA,pB)=P(A∩B)−P(A)P(B).
- `tmpl-var-linear` — Variance of a linear combination (GB p.48): varianceOfSum: Var(aX+bY)=a²VarX+b²VarY+2ab·Cov.
- `tmpl-cov-bilinear` — Cov(X, X+Y) by bilinearity (GB p.48): covBilinear(varX,covXY)=Var(X)+Cov(X,Y).
- `tmpl-rho-perfsq` — Correlation from perfect-square variances (GB p.48): rho/rhoSquared: rational ρ when σ_Xσ_Y is exact, else ρ².
- `tmpl-corr-range` — 3-variable correlation range (GB p.26-29): corrRange(ρ1,ρ2): the ρ(X,Z) interval for Pythagorean pairs.
- `tmpl-psd-det` — PSD determinant of a 3×3 correlation matrix (GB p.29): psdDeterminant3(r12,r13,r23): feasibility/boundary test.
- `tmpl-equicorr-min` — Minimum equicorrelation (atypicalquant / GB p.29): equicorrelationMin(n) = −1/(n−1).
- `tmpl-hedge-ratio` — Minimum-variance hedge ratio (GB p.48): optimalHedgeRatio(cov,varB)=Cov(A,B)/Var(B).
- `tmpl-order-stat` — Cov/ρ of min & max of two iid uniforms (GB p.51-52): orderStatCovUniform(): Cov=1/36, ρ=1/2.

## Questions

### tmpl-variance#die6  `hard`

**Prompt.** A fair 6-sided die shows the faces 1 through 6, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `35/12`
- **Engine check:** `formatRational(variance(diePmf(6)))` → `35/12`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(6+1)/2; E[X²]=Σk²/6. For the fair 6-die this gives 35/12 = (6²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=6.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#die4  `hard`

**Prompt.** A fair 4-sided die shows the faces 1 through 4, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `5/4`
- **Engine check:** `formatRational(variance(diePmf(4)))` → `5/4`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(4+1)/2; E[X²]=Σk²/4. For the fair 4-die this gives 5/4 = (4²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=4.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#die8  `harder`

**Prompt.** A fair 8-sided die shows the faces 1 through 8, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `21/4`
- **Engine check:** `formatRational(variance(diePmf(8)))` → `21/4`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(8+1)/2; E[X²]=Σk²/8. For the fair 8-die this gives 21/4 = (8²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=8.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#die10  `harder`

**Prompt.** A fair 10-sided die shows the faces 1 through 10, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `33/4`
- **Engine check:** `formatRational(variance(diePmf(10)))` → `33/4`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(10+1)/2; E[X²]=Σk²/10. For the fair 10-die this gives 33/4 = (10²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=10.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#die12  `harder`

**Prompt.** A fair 12-sided die shows the faces 1 through 12, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `143/12`
- **Engine check:** `formatRational(variance(diePmf(12)))` → `143/12`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(12+1)/2; E[X²]=Σk²/12. For the fair 12-die this gives 143/12 = (12²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=12.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#die20  `brutal`

**Prompt.** A fair 20-sided die shows the faces 1 through 20, each equally likely. On the desk you are asked for the variance of a single roll. What is Var(X)?

- **Answer (engine-verified):** `133/4`
- **Engine check:** `formatRational(variance(diePmf(20)))` → `133/4`
- **Source:** Green Book p.47-48 (covariance/variance §, line 7502) — variance of a finite pmf; randomservices.org "Covariance" §5. A standard warm-up quant question.
- **Approaches:** Var(X)=E[X²]−E[X]². E[X]=(20+1)/2; E[X²]=Σk²/20. For the fair 20-die this gives 133/4 = (20²−1)/12. / Use the closed form Var(uniform{1..m}) = (m²−1)/12 with m=20.
- **Hint ladder:** (1) Variance needs two moments, not one. Which two? (2) Var(X)=E[X²]−(E[X])². Compute each moment by averaging over the equally-likely faces. (3) E[X]=(m+1)/2 and E[X²]=(1²+…+m²)/m; subtract the square of the first from the second.
- **Follow-ups:** If you roll this die twice independently, what is Var(X₁+X₂)? / How does this variance scale if every face value is doubled?

### tmpl-variance#bern1-2  `hard`

**Prompt.** An indicator X is 1 with probability 1/2 and 0 otherwise (a single Bernoulli trial — e.g. one tick going up). What is Var(X)?

- **Answer (engine-verified):** `1/4`
- **Engine check:** `formatRational(variance(bernoulliPmf(1/2)))` → `1/4`
- **Source:** Green Book p.47-48 (variance of an indicator) — Bernoulli variance p(1−p); a building-block desk question for indicator-covariance work.
- **Approaches:** For a 0/1 indicator E[X²]=E[X]=p, so Var(X)=p−p²=p(1−p) = (1/2)·(1/2) = 1/4. / Bernoulli variance is p(1−p); plug in p directly.
- **Hint ladder:** (1) For a 0/1 variable, how do E[X] and E[X²] relate? (2) They are equal (X²=X), so Var(X)=p−p². (3) That is p(1−p); substitute p.
- **Follow-ups:** For which p is this variance largest, and what is that maximum? / If Y is an independent copy, what is Cov(X,Y)?

### tmpl-variance#bern1-3  `harder`

**Prompt.** An indicator X is 1 with probability 1/3 and 0 otherwise (a single Bernoulli trial — e.g. one tick going up). What is Var(X)?

- **Answer (engine-verified):** `2/9`
- **Engine check:** `formatRational(variance(bernoulliPmf(1/3)))` → `2/9`
- **Source:** Green Book p.47-48 (variance of an indicator) — Bernoulli variance p(1−p); a building-block desk question for indicator-covariance work.
- **Approaches:** For a 0/1 indicator E[X²]=E[X]=p, so Var(X)=p−p²=p(1−p) = (1/3)·(2/3) = 2/9. / Bernoulli variance is p(1−p); plug in p directly.
- **Hint ladder:** (1) For a 0/1 variable, how do E[X] and E[X²] relate? (2) They are equal (X²=X), so Var(X)=p−p². (3) That is p(1−p); substitute p.
- **Follow-ups:** For which p is this variance largest, and what is that maximum? / If Y is an independent copy, what is Cov(X,Y)?

### tmpl-variance#bern3-10  `harder`

**Prompt.** An indicator X is 1 with probability 3/10 and 0 otherwise (a single Bernoulli trial — e.g. one tick going up). What is Var(X)?

- **Answer (engine-verified):** `21/100`
- **Engine check:** `formatRational(variance(bernoulliPmf(3/10)))` → `21/100`
- **Source:** Green Book p.47-48 (variance of an indicator) — Bernoulli variance p(1−p); a building-block desk question for indicator-covariance work.
- **Approaches:** For a 0/1 indicator E[X²]=E[X]=p, so Var(X)=p−p²=p(1−p) = (3/10)·(7/10) = 21/100. / Bernoulli variance is p(1−p); plug in p directly.
- **Hint ladder:** (1) For a 0/1 variable, how do E[X] and E[X²] relate? (2) They are equal (X²=X), so Var(X)=p−p². (3) That is p(1−p); substitute p.
- **Follow-ups:** For which p is this variance largest, and what is that maximum? / If Y is an independent copy, what is Cov(X,Y)?

### tmpl-cov-joint#1-0-0-1_2  `hard`

**Prompt.** A trading signal and a fill flag move together. Two 0/1 random variables X and Y have the joint distribution P(0,0)=1/2, P(0,1)=0/2, P(1,0)=0/2, P(1,1)=1/2. Compute Cov(X,Y).

- **Answer (engine-verified):** `1/4`
- **Engine check:** `formatRational(covariance(joint2x2(1,0,0,1,2)))` → `1/4`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=1/2. E[X]=P(X=1)=(0+1)/2; E[Y]=P(Y=1)=(0+1)/2. Cov=E[XY]−E[X]E[Y]=1/4. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#1-1-1-1_4  `hard`

**Prompt.** Two independent coin-flip signals. Two 0/1 random variables X and Y have the joint distribution P(0,0)=1/4, P(0,1)=1/4, P(1,0)=1/4, P(1,1)=1/4. Compute Cov(X,Y).

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(covariance(joint2x2(1,1,1,1,4)))` → `0`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=1/4. E[X]=P(X=1)=(1+1)/4; E[Y]=P(Y=1)=(1+1)/4. Cov=E[XY]−E[X]E[Y]=0. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#2-1-1-0_4  `harder`

**Prompt.** Two desks rarely fire at once. Two 0/1 random variables X and Y have the joint distribution P(0,0)=2/4, P(0,1)=1/4, P(1,0)=1/4, P(1,1)=0/4. Compute Cov(X,Y).

- **Answer (engine-verified):** `-1/16`
- **Engine check:** `formatRational(covariance(joint2x2(2,1,1,0,4)))` → `-1/16`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=0/4. E[X]=P(X=1)=(1+0)/4; E[Y]=P(Y=1)=(1+0)/4. Cov=E[XY]−E[X]E[Y]=-1/16. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#3-1-1-3_8  `harder`

**Prompt.** Two correlated up/down indicators. Two 0/1 random variables X and Y have the joint distribution P(0,0)=3/8, P(0,1)=1/8, P(1,0)=1/8, P(1,1)=3/8. Compute Cov(X,Y).

- **Answer (engine-verified):** `1/8`
- **Engine check:** `formatRational(covariance(joint2x2(3,1,1,3,8)))` → `1/8`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=3/8. E[X]=P(X=1)=(1+3)/8; E[Y]=P(Y=1)=(1+3)/8. Cov=E[XY]−E[X]E[Y]=1/8. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#2-1-1-2_6  `harder`

**Prompt.** A pair of weakly-linked alarms. Two 0/1 random variables X and Y have the joint distribution P(0,0)=2/6, P(0,1)=1/6, P(1,0)=1/6, P(1,1)=2/6. Compute Cov(X,Y).

- **Answer (engine-verified):** `1/12`
- **Engine check:** `formatRational(covariance(joint2x2(2,1,1,2,6)))` → `1/12`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=2/6. E[X]=P(X=1)=(1+2)/6; E[Y]=P(Y=1)=(1+2)/6. Cov=E[XY]−E[X]E[Y]=1/12. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#0-1-1-0_2  `brutal`

**Prompt.** Two strictly opposing positions. Two 0/1 random variables X and Y have the joint distribution P(0,0)=0/2, P(0,1)=1/2, P(1,0)=1/2, P(1,1)=0/2. Compute Cov(X,Y).

- **Answer (engine-verified):** `-1/4`
- **Engine check:** `formatRational(covariance(joint2x2(0,1,1,0,2)))` → `-1/4`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=0/2. E[X]=P(X=1)=(1+0)/2; E[Y]=P(Y=1)=(1+0)/2. Cov=E[XY]−E[X]E[Y]=-1/4. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-joint#5-1-1-5_12  `brutal`

**Prompt.** A strongly co-moving pair. Two 0/1 random variables X and Y have the joint distribution P(0,0)=5/12, P(0,1)=1/12, P(1,0)=1/12, P(1,1)=5/12. Compute Cov(X,Y).

- **Answer (engine-verified):** `1/6`
- **Engine check:** `formatRational(covariance(joint2x2(5,1,1,5,12)))` → `1/6`
- **Source:** Green Book p.47-48 (Cov(X,Y)=E[XY]−E[X]E[Y], lines 7502-7566) — covariance straight from a joint pmf; randomservices.org "Covariance".
- **Approaches:** E[XY]=P(1,1)=5/12. E[X]=P(X=1)=(1+5)/12; E[Y]=P(Y=1)=(1+5)/12. Cov=E[XY]−E[X]E[Y]=1/6. / For 0/1 variables only the (1,1) cell contributes to E[XY]; the marginals give E[X],E[Y].
- **Hint ladder:** (1) Cov(X,Y)=E[XY]−E[X]E[Y]. Get each piece from the table. (2) For 0/1 variables E[XY] is just P(X=1,Y=1); the marginals are the row/column sums for the 1-state. (3) Subtract the product of the two marginal 1-probabilities from the (1,1) cell.
- **Follow-ups:** Are X and Y independent here? How can you tell from Cov alone — and is Cov=0 sufficient? / What is the correlation ρ(X,Y) for this table?

### tmpl-cov-indicator#1-4_1-2_1-2  `hard`

**Prompt.** Two independent fair-coin events. Two events have P(A)=1/2, P(B)=1/2, and P(A∩B)=1/4. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(covarianceIndicators(1/4, 1/2, 1/2))` → `0`
- **Source:** Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.
- **Approaches:** Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=1/4−(1/2)(1/2)=0. / Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).
- **Hint ladder:** (1) The product 1_A·1_B is itself an indicator — of which event? (2) It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition. (3) Cov = P(A∩B) − P(A)P(B).
- **Follow-ups:** Is this covariance zero exactly when A and B are independent? Argue it. / What is the largest covariance two events with these marginals could have?

### tmpl-cov-indicator#1-2_1-2_1-2  `hard`

**Prompt.** Two events that always coincide. Two events have P(A)=1/2, P(B)=1/2, and P(A∩B)=1/2. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?

- **Answer (engine-verified):** `1/4`
- **Engine check:** `formatRational(covarianceIndicators(1/2, 1/2, 1/2))` → `1/4`
- **Source:** Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.
- **Approaches:** Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=1/2−(1/2)(1/2)=1/4. / Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).
- **Hint ladder:** (1) The product 1_A·1_B is itself an indicator — of which event? (2) It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition. (3) Cov = P(A∩B) − P(A)P(B).
- **Follow-ups:** Is this covariance zero exactly when A and B are independent? Argue it. / What is the largest covariance two events with these marginals could have?

### tmpl-cov-indicator#1-6_1-3_1-2  `harder`

**Prompt.** A card event and a coin event. Two events have P(A)=1/3, P(B)=1/2, and P(A∩B)=1/6. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(covarianceIndicators(1/6, 1/3, 1/2))` → `0`
- **Source:** Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.
- **Approaches:** Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=1/6−(1/3)(1/2)=0. / Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).
- **Hint ladder:** (1) The product 1_A·1_B is itself an indicator — of which event? (2) It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition. (3) Cov = P(A∩B) − P(A)P(B).
- **Follow-ups:** Is this covariance zero exactly when A and B are independent? Argue it. / What is the largest covariance two events with these marginals could have?

### tmpl-cov-indicator#1-12_1-4_1-3  `harder`

**Prompt.** Two thresholds on the same feed. Two events have P(A)=1/4, P(B)=1/3, and P(A∩B)=1/12. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(covarianceIndicators(1/12, 1/4, 1/3))` → `0`
- **Source:** Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.
- **Approaches:** Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=1/12−(1/4)(1/3)=0. / Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).
- **Hint ladder:** (1) The product 1_A·1_B is itself an indicator — of which event? (2) It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition. (3) Cov = P(A∩B) − P(A)P(B).
- **Follow-ups:** Is this covariance zero exactly when A and B are independent? Argue it. / What is the largest covariance two events with these marginals could have?

### tmpl-cov-indicator#1-10_1-5_1-2  `brutal`

**Prompt.** A rare trigger and a coin event. Two events have P(A)=1/5, P(B)=1/2, and P(A∩B)=1/10. Let X=1_A and Y=1_B be their indicators. What is Cov(X,Y)?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(covarianceIndicators(1/10, 1/5, 1/2))` → `0`
- **Source:** Green Book p.47-48 (indicator covariance) — Cov(1_A,1_B)=P(A∩B)−P(A)P(B); the canonical "are these events positively/negatively associated?" desk question.
- **Approaches:** Cov(1_A,1_B)=P(A∩B)−P(A)P(B)=1/10−(1/5)(1/2)=0. / Sign of the answer tells you whether the events are positively (>0), negatively (<0), or un-associated (=0).
- **Hint ladder:** (1) The product 1_A·1_B is itself an indicator — of which event? (2) It indicates A∩B, so E[1_A1_B]=P(A∩B). Now apply the covariance definition. (3) Cov = P(A∩B) − P(A)P(B).
- **Follow-ups:** Is this covariance zero exactly when A and B are independent? Argue it. / What is the largest covariance two events with these marginals could have?

### tmpl-var-linear#a1b1_vx35-12_vy35-12_c0-1  `hard`

**Prompt.** Two assets have Var(X)=35/12, Var(Y)=35/12, and Cov(X,Y)=0. For the portfolio P = X + Y, what is Var(P)?

- **Answer (engine-verified):** `35/6`
- **Engine check:** `formatRational(varianceOfSum(35/12, 35/12, 0/1))  // a=1,b=1: a²·VarX, b²·VarY, ab·Cov` → `35/6`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(X + Y) = 1²·35/12 + (1)²·35/12 + 2·(1)·(1)·(0) = 35/6. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a1b1_vx1-4_vy1-4_c1-4  `hard`

**Prompt.** Two assets have Var(X)=1/4, Var(Y)=1/4, and Cov(X,Y)=1/4. For the portfolio P = X + Y, what is Var(P)?

- **Answer (engine-verified):** `1`
- **Engine check:** `formatRational(varianceOfSum(1/4, 1/4, 1/4))  // a=1,b=1: a²·VarX, b²·VarY, ab·Cov` → `1`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(X + Y) = 1²·1/4 + (1)²·1/4 + 2·(1)·(1)·(1/4) = 1. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a1b-1_vx4-1_vy9-1_c-6-1  `harder`

**Prompt.** Two assets have Var(X)=4, Var(Y)=9, and Cov(X,Y)=-6. For the portfolio P = X − Y, what is Var(P)?

- **Answer (engine-verified):** `25`
- **Engine check:** `formatRational(varianceOfSum(4/1, 9/1, 6/1))  // a=1,b=-1: a²·VarX, b²·VarY, ab·Cov` → `25`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(X − Y) = 1²·4 + (-1)²·9 + 2·(1)·(-1)·(-6) = 25. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a2b3_vx4-1_vy9-1_c-6-1  `harder`

**Prompt.** Two assets have Var(X)=4, Var(Y)=9, and Cov(X,Y)=-6. For the portfolio P = 2X + 3Y, what is Var(P)?

- **Answer (engine-verified):** `25`
- **Engine check:** `formatRational(varianceOfSum(16/1, 81/1, -36/1))  // a=2,b=3: a²·VarX, b²·VarY, ab·Cov` → `25`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(2X + 3Y) = 2²·4 + (3)²·9 + 2·(2)·(3)·(-6) = 25. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a1b1_vx9-1_vy16-1_c6-1  `harder`

**Prompt.** Two assets have Var(X)=9, Var(Y)=16, and Cov(X,Y)=6. For the portfolio P = X + Y, what is Var(P)?

- **Answer (engine-verified):** `37`
- **Engine check:** `formatRational(varianceOfSum(9/1, 16/1, 6/1))  // a=1,b=1: a²·VarX, b²·VarY, ab·Cov` → `37`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(X + Y) = 1²·9 + (1)²·16 + 2·(1)·(1)·(6) = 37. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a1b1_vx25-1_vy4-1_c-3-1  `harder`

**Prompt.** Two assets have Var(X)=25, Var(Y)=4, and Cov(X,Y)=-3. For the portfolio P = X + Y, what is Var(P)?

- **Answer (engine-verified):** `23`
- **Engine check:** `formatRational(varianceOfSum(25/1, 4/1, -3/1))  // a=1,b=1: a²·VarX, b²·VarY, ab·Cov` → `23`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(X + Y) = 1²·25 + (1)²·4 + 2·(1)·(1)·(-3) = 23. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-var-linear#a3b-2_vx9-1_vy16-1_c6-1  `brutal`

**Prompt.** Two assets have Var(X)=9, Var(Y)=16, and Cov(X,Y)=6. For the portfolio P = 3X − 2Y, what is Var(P)?

- **Answer (engine-verified):** `73`
- **Engine check:** `formatRational(varianceOfSum(81/1, 64/1, -36/1))  // a=3,b=-2: a²·VarX, b²·VarY, ab·Cov` → `73`
- **Source:** Green Book p.48 ("General rules of variance and covariance", line 7582) — Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y); the bread-and-butter portfolio-variance desk question.
- **Approaches:** Var(3X − 2Y) = 3²·9 + (-2)²·16 + 2·(3)·(-2)·(6) = 73. / Expand by bilinearity: the cross term carries the 2ab·Cov, with the SIGN of ab.
- **Hint ladder:** (1) Variance of a linear combination has three pieces — two "own" terms and one cross term. (2) Var(aX+bY)=a²Var(X)+b²Var(Y)+2ab·Cov(X,Y). (3) Plug in a,b,Var(X),Var(Y),Cov — watch the sign on 2ab.
- **Follow-ups:** Which sign of Cov reduces the portfolio variance, and why is that the diversification benefit? / Holding X fixed, what weight on Y minimizes Var(P)?

### tmpl-cov-bilinear#vx35-12_c0-1  `hard`

**Prompt.** You hold X, and you are also exposed to the sum S = X + Y. Given Var(X)=35/12 and Cov(X,Y)=0, what is Cov(X, X+Y)?

- **Answer (engine-verified):** `35/12`
- **Engine check:** `formatRational(covBilinear(35/12, 0/1))` → `35/12`
- **Source:** Green Book p.48 (bilinearity of covariance) — Cov(X, X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y); randomservices.org "Covariance".
- **Approaches:** By bilinearity Cov(X,X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y)=35/12+(0)=35/12. / Cov(X,X) is exactly Var(X); the cross piece is Cov(X,Y).
- **Hint ladder:** (1) Covariance is linear in each argument — split the second slot. (2) Cov(X,X+Y)=Cov(X,X)+Cov(X,Y). What is Cov(X,X)? (3) Cov(X,X)=Var(X); add Cov(X,Y).
- **Follow-ups:** What does this become when X and Y are independent? / What is Cov(X+Y, X−Y) in terms of Var(X) and Var(Y)?

### tmpl-cov-bilinear#vx4-1_c-6-1  `harder`

**Prompt.** You hold X, and you are also exposed to the sum S = X + Y. Given Var(X)=4 and Cov(X,Y)=-6, what is Cov(X, X+Y)?

- **Answer (engine-verified):** `-2`
- **Engine check:** `formatRational(covBilinear(4/1, -6/1))` → `-2`
- **Source:** Green Book p.48 (bilinearity of covariance) — Cov(X, X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y); randomservices.org "Covariance".
- **Approaches:** By bilinearity Cov(X,X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y)=4+(-6)=-2. / Cov(X,X) is exactly Var(X); the cross piece is Cov(X,Y).
- **Hint ladder:** (1) Covariance is linear in each argument — split the second slot. (2) Cov(X,X+Y)=Cov(X,X)+Cov(X,Y). What is Cov(X,X)? (3) Cov(X,X)=Var(X); add Cov(X,Y).
- **Follow-ups:** What does this become when X and Y are independent? / What is Cov(X+Y, X−Y) in terms of Var(X) and Var(Y)?

### tmpl-cov-bilinear#vx9-1_c6-1  `harder`

**Prompt.** You hold X, and you are also exposed to the sum S = X + Y. Given Var(X)=9 and Cov(X,Y)=6, what is Cov(X, X+Y)?

- **Answer (engine-verified):** `15`
- **Engine check:** `formatRational(covBilinear(9/1, 6/1))` → `15`
- **Source:** Green Book p.48 (bilinearity of covariance) — Cov(X, X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y); randomservices.org "Covariance".
- **Approaches:** By bilinearity Cov(X,X+Y)=Cov(X,X)+Cov(X,Y)=Var(X)+Cov(X,Y)=9+(6)=15. / Cov(X,X) is exactly Var(X); the cross piece is Cov(X,Y).
- **Hint ladder:** (1) Covariance is linear in each argument — split the second slot. (2) Cov(X,X+Y)=Cov(X,X)+Cov(X,Y). What is Cov(X,X)? (3) Cov(X,X)=Var(X); add Cov(X,Y).
- **Follow-ups:** What does this become when X and Y are independent? / What is Cov(X+Y, X−Y) in terms of Var(X) and Var(Y)?

### tmpl-rho-perfsq#12-1_9-1_25-1_rho  `hard`

**Prompt.** Given Cov(X,Y)=12, Var(X)=9, Var(Y)=25, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `4/5`
- **Engine check:** `formatRational(rho(12/1, 9/1, 25/1).rho)` → `4/5`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=12/√(9·25). The variances are perfect squares so √ is exact: ρ=4/5. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-rho-perfsq#6-1_4-1_25-1_rho  `hard`

**Prompt.** Given Cov(X,Y)=6, Var(X)=4, Var(Y)=25, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `3/5`
- **Engine check:** `formatRational(rho(6/1, 4/1, 25/1).rho)` → `3/5`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=6/√(4·25). The variances are perfect squares so √ is exact: ρ=3/5. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-rho-perfsq#-8-1_16-1_25-1_rho  `harder`

**Prompt.** Given Cov(X,Y)=-8, Var(X)=16, Var(Y)=25, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `-2/5`
- **Engine check:** `formatRational(rho(-8/1, 16/1, 25/1).rho)` → `-2/5`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=-8/√(16·25). The variances are perfect squares so √ is exact: ρ=-2/5. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-rho-perfsq#20-1_25-1_16-1_rho  `harder`

**Prompt.** Given Cov(X,Y)=20, Var(X)=25, Var(Y)=16, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `1`
- **Engine check:** `formatRational(rho(20/1, 25/1, 16/1).rho)` → `1`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=20/√(25·16). The variances are perfect squares so √ is exact: ρ=1. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-rho-perfsq#-18-1_16-1_81-1_rho  `harder`

**Prompt.** Given Cov(X,Y)=-18, Var(X)=16, Var(Y)=81, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `-1/2`
- **Engine check:** `formatRational(rho(-18/1, 16/1, 81/1).rho)` → `-1/2`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=-18/√(16·81). The variances are perfect squares so √ is exact: ρ=-1/2. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-rho-perfsq#35-12_35-12_35-6_rhoSq  `brutal`

**Prompt.** Given Cov(X,Y)=35/12, Var(X)=35/12, Var(Y)=35/6, the correlation ρ here is irrational, so report the exact ρ² (the squared correlation / R²) instead.

- **Answer (engine-verified):** `1/2`
- **Engine check:** `formatRational(rhoSquared(35/12, 35/12, 35/6))` → `1/2`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ²=Cov²/(Var(X)·Var(Y))=(35/12)²/((35/12)(35/6))=1/2. / Here √(Var(X)·Var(Y)) is irrational so ρ itself is irrational (display-only); ρ² is the exact graded value.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Is √(Var(X)·Var(Y)) rational here? If not, ρ is irrational — square the relation to get ρ²=Cov²/(Var(X)·Var(Y)). (3) ρ² = Cov² / (Var(X)·Var(Y)); reduce the fraction.
- **Follow-ups:** Why is reporting ρ² (or a display-only "1/√2") the right move when ρ is irrational? / What fraction of Var(Y) is explained by X (the R²)?

### tmpl-rho-perfsq#1-36_1-18_1-18_rho  `harder`

**Prompt.** Given Cov(X,Y)=1/36, Var(X)=1/18, Var(Y)=1/18, what is the correlation ρ(X,Y)?

- **Answer (engine-verified):** `1/2`
- **Engine check:** `formatRational(rho(1/36, 1/18, 1/18).rho)` → `1/2`
- **Source:** Green Book p.48 (correlation coefficient ρ=Cov/(σ_Xσ_Y), line 7660) — definition-drill; ρ² is the always-rational graded quantity when σ_Xσ_Y is irrational.
- **Approaches:** ρ=Cov/√(Var(X)·Var(Y))=1/36/√(1/18·1/18). The variances are perfect squares so √ is exact: ρ=1/2. / Check the inputs make σ_Xσ_Y rational (perfect-square variances) before claiming a rational ρ.
- **Hint ladder:** (1) ρ normalizes covariance by the two standard deviations. Write ρ=Cov/(σ_Xσ_Y). (2) Are the variances perfect squares? If so √(Var(X)·Var(Y)) is exact and ρ is rational. (3) Compute σ_X, σ_Y, then divide the covariance by their product.
- **Follow-ups:** What does this ρ say about the linear fit between X and Y? / What covariance would make X and Y perfectly correlated here?

### tmpl-corr-range#4-5_4-5  `harder`

**Prompt.** Three random variables X, Y, Z satisfy ρ(X,Y)=4/5 and ρ(Y,Z)=4/5. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.

- **Answer (engine-verified):** `7/25,1`
- **Engine check:** `formatRangePair(corrRange(4/5, 4/5))  // "min,max"` → `7/25,1`
- **Source:** Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.
- **Approaches:** ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=4/5, ρ₂=4/5 (Pythagorean, so the √ are exact) this is 7/25,1. / Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).
- **Hint ladder:** (1) Correlations are cosines of angles between unit vectors — what does that constrain about the third angle? (2) The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂]. (3) sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).
- **Follow-ups:** At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there? / What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?

### tmpl-corr-range#3-5_3-5  `harder`

**Prompt.** Three random variables X, Y, Z satisfy ρ(X,Y)=3/5 and ρ(Y,Z)=3/5. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.

- **Answer (engine-verified):** `-7/25,1`
- **Engine check:** `formatRangePair(corrRange(3/5, 3/5))  // "min,max"` → `-7/25,1`
- **Source:** Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.
- **Approaches:** ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=3/5, ρ₂=3/5 (Pythagorean, so the √ are exact) this is -7/25,1. / Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).
- **Hint ladder:** (1) Correlations are cosines of angles between unit vectors — what does that constrain about the third angle? (2) The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂]. (3) sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).
- **Follow-ups:** At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there? / What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?

### tmpl-corr-range#4-5_3-5  `brutal`

**Prompt.** Three random variables X, Y, Z satisfy ρ(X,Y)=4/5 and ρ(Y,Z)=3/5. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.

- **Answer (engine-verified):** `0,24/25`
- **Engine check:** `formatRangePair(corrRange(4/5, 3/5))  // "min,max"` → `0,24/25`
- **Source:** Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.
- **Approaches:** ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=4/5, ρ₂=3/5 (Pythagorean, so the √ are exact) this is 0,24/25. / Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).
- **Hint ladder:** (1) Correlations are cosines of angles between unit vectors — what does that constrain about the third angle? (2) The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂]. (3) sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).
- **Follow-ups:** At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there? / What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?

### tmpl-corr-range#12-13_12-13  `brutal`

**Prompt.** Three random variables X, Y, Z satisfy ρ(X,Y)=12/13 and ρ(Y,Z)=12/13. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.

- **Answer (engine-verified):** `119/169,1`
- **Engine check:** `formatRangePair(corrRange(12/13, 12/13))  // "min,max"` → `119/169,1`
- **Source:** Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.
- **Approaches:** ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=12/13, ρ₂=12/13 (Pythagorean, so the √ are exact) this is 119/169,1. / Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).
- **Hint ladder:** (1) Correlations are cosines of angles between unit vectors — what does that constrain about the third angle? (2) The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂]. (3) sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).
- **Follow-ups:** At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there? / What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?

### tmpl-corr-range#3-5_12-13  `brutal`

**Prompt.** Three random variables X, Y, Z satisfy ρ(X,Y)=3/5 and ρ(Y,Z)=12/13. What is the full range of possible values of ρ(X,Z)? Give the minimum and maximum.

- **Answer (engine-verified):** `16/65,56/65`
- **Engine check:** `formatRangePair(corrRange(3/5, 12/13))  // "min,max"` → `16/65,56/65`
- **Source:** Green Book p.26-29 ("max/min correlation of 3 variables", lines 4579-4943) — the geometric/PSD correlation-range classic; a famous Jane Street / desk interview question.
- **Approaches:** ρ(X,Z) ∈ [ρ₁ρ₂ − √(1−ρ₁²)√(1−ρ₂²), ρ₁ρ₂ + √(1−ρ₁²)√(1−ρ₂²)]. With ρ₁=3/5, ρ₂=12/13 (Pythagorean, so the √ are exact) this is 16/65,56/65. / Geometric view: place unit vectors at angles arccos(ρ); ρ(X,Z) ranges as the third angle swings, bounded by the angle sum/difference. The bounds are exactly where the 3×3 correlation matrix is singular (PSD boundary).
- **Hint ladder:** (1) Correlations are cosines of angles between unit vectors — what does that constrain about the third angle? (2) The third cosine lies in [cos(θ₁+θ₂), cos(θ₁−θ₂)] = [ρ₁ρ₂ − sinθ₁sinθ₂, ρ₁ρ₂ + sinθ₁sinθ₂]. (3) sinθ = √(1−ρ²); the bounds are ρ₁ρ₂ ± √(1−ρ₁²)√(1−ρ₂²).
- **Follow-ups:** At each bound, what is the determinant of the 3×3 correlation matrix, and why must it be exactly 0 there? / What goes wrong with this clean answer if ρ₁ or ρ₂ is not a Pythagorean value?

### tmpl-psd-det#4-5_4-5_7-25  `harder`

**Prompt.** Risk wants to know if a correlation estimate sits on the feasibility boundary. A proposed 3×3 correlation matrix has off-diagonals ρ₁₂=4/5, ρ₁₃=4/5, ρ₂₃=7/25. Compute its determinant (det = 1 + 2ρ₁₂ρ₁₃ρ₂₃ − ρ₁₂² − ρ₁₃² − ρ₂₃²). Is the matrix a valid correlation matrix at this point?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(psdDeterminant3(4/5, 4/5, 7/25))` → `0`
- **Source:** Green Book p.29 (PSD correlation-matrix condition, lines 4924-4944) — det≥0 is the boundary/feasibility test behind the 3-variable correlation range; atypicalquant.net.
- **Approaches:** det = 1 + 2·(4/5)·(4/5)·(7/25) − (4/5)² − (4/5)² − (7/25)² = 0. / A correlation matrix must be PSD ⇔ det≥0 (with leading minors ≥0). det=0 ≥ 0 → feasible (det=0 means exactly on the boundary / singular).
- **Hint ladder:** (1) Write out the 3×3 determinant of [[1,a,b],[a,1,c],[b,c,1]] symbolically. (2) It equals 1 + 2abc − a² − b² − c². Substitute the three correlations. (3) Evaluate; det≥0 (with positive leading minors) is required for a valid correlation matrix.
- **Follow-ups:** If det=0, what does that say about the three variables (linear dependence)? / Holding ρ₁₂ and ρ₁₃ fixed, what range of ρ₂₃ keeps det≥0?

### tmpl-psd-det#4-5_4-5_1-1  `harder`

**Prompt.** A quoted correlation triple looks suspiciously extreme. A proposed 3×3 correlation matrix has off-diagonals ρ₁₂=4/5, ρ₁₃=4/5, ρ₂₃=1. Compute its determinant (det = 1 + 2ρ₁₂ρ₁₃ρ₂₃ − ρ₁₂² − ρ₁₃² − ρ₂₃²). Is the matrix a valid correlation matrix at this point?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(psdDeterminant3(4/5, 4/5, 1/1))` → `0`
- **Source:** Green Book p.29 (PSD correlation-matrix condition, lines 4924-4944) — det≥0 is the boundary/feasibility test behind the 3-variable correlation range; atypicalquant.net.
- **Approaches:** det = 1 + 2·(4/5)·(4/5)·(1) − (4/5)² − (4/5)² − (1)² = 0. / A correlation matrix must be PSD ⇔ det≥0 (with leading minors ≥0). det=0 ≥ 0 → feasible (det=0 means exactly on the boundary / singular).
- **Hint ladder:** (1) Write out the 3×3 determinant of [[1,a,b],[a,1,c],[b,c,1]] symbolically. (2) It equals 1 + 2abc − a² − b² − c². Substitute the three correlations. (3) Evaluate; det≥0 (with positive leading minors) is required for a valid correlation matrix.
- **Follow-ups:** If det=0, what does that say about the three variables (linear dependence)? / Holding ρ₁₂ and ρ₁₃ fixed, what range of ρ₂₃ keeps det≥0?

### tmpl-psd-det#1-2_1-2_1-2  `hard`

**Prompt.** A simple equicorrelated triple. A proposed 3×3 correlation matrix has off-diagonals ρ₁₂=1/2, ρ₁₃=1/2, ρ₂₃=1/2. Compute its determinant (det = 1 + 2ρ₁₂ρ₁₃ρ₂₃ − ρ₁₂² − ρ₁₃² − ρ₂₃²). Is the matrix a valid correlation matrix at this point?

- **Answer (engine-verified):** `1/2`
- **Engine check:** `formatRational(psdDeterminant3(1/2, 1/2, 1/2))` → `1/2`
- **Source:** Green Book p.29 (PSD correlation-matrix condition, lines 4924-4944) — det≥0 is the boundary/feasibility test behind the 3-variable correlation range; atypicalquant.net.
- **Approaches:** det = 1 + 2·(1/2)·(1/2)·(1/2) − (1/2)² − (1/2)² − (1/2)² = 1/2. / A correlation matrix must be PSD ⇔ det≥0 (with leading minors ≥0). det=1/2 ≥ 0 → feasible (det=0 means exactly on the boundary / singular).
- **Hint ladder:** (1) Write out the 3×3 determinant of [[1,a,b],[a,1,c],[b,c,1]] symbolically. (2) It equals 1 + 2abc − a² − b² − c². Substitute the three correlations. (3) Evaluate; det≥0 (with positive leading minors) is required for a valid correlation matrix.
- **Follow-ups:** If det=0, what does that say about the three variables (linear dependence)? / Holding ρ₁₂ and ρ₁₃ fixed, what range of ρ₂₃ keeps det≥0?

### tmpl-psd-det#1-2_1-2_-1-2  `brutal`

**Prompt.** A triple right at the equicorrelation floor. A proposed 3×3 correlation matrix has off-diagonals ρ₁₂=1/2, ρ₁₃=1/2, ρ₂₃=-1/2. Compute its determinant (det = 1 + 2ρ₁₂ρ₁₃ρ₂₃ − ρ₁₂² − ρ₁₃² − ρ₂₃²). Is the matrix a valid correlation matrix at this point?

- **Answer (engine-verified):** `0`
- **Engine check:** `formatRational(psdDeterminant3(1/2, 1/2, -1/2))` → `0`
- **Source:** Green Book p.29 (PSD correlation-matrix condition, lines 4924-4944) — det≥0 is the boundary/feasibility test behind the 3-variable correlation range; atypicalquant.net.
- **Approaches:** det = 1 + 2·(1/2)·(1/2)·(-1/2) − (1/2)² − (1/2)² − (-1/2)² = 0. / A correlation matrix must be PSD ⇔ det≥0 (with leading minors ≥0). det=0 ≥ 0 → feasible (det=0 means exactly on the boundary / singular).
- **Hint ladder:** (1) Write out the 3×3 determinant of [[1,a,b],[a,1,c],[b,c,1]] symbolically. (2) It equals 1 + 2abc − a² − b² − c². Substitute the three correlations. (3) Evaluate; det≥0 (with positive leading minors) is required for a valid correlation matrix.
- **Follow-ups:** If det=0, what does that say about the three variables (linear dependence)? / Holding ρ₁₂ and ρ₁₃ fixed, what range of ρ₂₃ keeps det≥0?

### tmpl-equicorr-min#n3  `hard`

**Prompt.** 3 random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?

- **Answer (engine-verified):** `-1/2`
- **Engine check:** `formatRational(equicorrelationMin(3))` → `-1/2`
- **Source:** atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.
- **Approaches:** The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(3−1)ρ≥0 ⇒ ρ≥−1/(3−1) = -1/2. / Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.
- **Hint ladder:** (1) Negative correlations can't all be too strong at once — variance of the sum can't go negative. (2) Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0. (3) Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).
- **Follow-ups:** What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets? / At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?

### tmpl-equicorr-min#n4  `harder`

**Prompt.** 4 random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?

- **Answer (engine-verified):** `-1/3`
- **Engine check:** `formatRational(equicorrelationMin(4))` → `-1/3`
- **Source:** atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.
- **Approaches:** The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(4−1)ρ≥0 ⇒ ρ≥−1/(4−1) = -1/3. / Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.
- **Hint ladder:** (1) Negative correlations can't all be too strong at once — variance of the sum can't go negative. (2) Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0. (3) Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).
- **Follow-ups:** What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets? / At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?

### tmpl-equicorr-min#n5  `harder`

**Prompt.** 5 random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?

- **Answer (engine-verified):** `-1/4`
- **Engine check:** `formatRational(equicorrelationMin(5))` → `-1/4`
- **Source:** atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.
- **Approaches:** The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(5−1)ρ≥0 ⇒ ρ≥−1/(5−1) = -1/4. / Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.
- **Hint ladder:** (1) Negative correlations can't all be too strong at once — variance of the sum can't go negative. (2) Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0. (3) Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).
- **Follow-ups:** What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets? / At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?

### tmpl-equicorr-min#n10  `brutal`

**Prompt.** 10 random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?

- **Answer (engine-verified):** `-1/9`
- **Engine check:** `formatRational(equicorrelationMin(10))` → `-1/9`
- **Source:** atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.
- **Approaches:** The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(10−1)ρ≥0 ⇒ ρ≥−1/(10−1) = -1/9. / Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.
- **Hint ladder:** (1) Negative correlations can't all be too strong at once — variance of the sum can't go negative. (2) Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0. (3) Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).
- **Follow-ups:** What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets? / At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?

### tmpl-equicorr-min#n100  `brutal`

**Prompt.** 100 random variables are equicorrelated: every pair has the SAME correlation ρ. What is the most NEGATIVE value ρ can take while this remains possible?

- **Answer (engine-verified):** `-1/99`
- **Engine check:** `formatRational(equicorrelationMin(100))` → `-1/99`
- **Source:** atypicalquant.net "minimal pairwise correlation" / Green Book p.29 PSD material — equicorrelation eigenvalue 1+(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). A classic desk brain-teaser.
- **Approaches:** The equicorrelation matrix has eigenvalue 1+(n−1)ρ (once) and 1−ρ (n−1 times). PSD ⇒ 1+(100−1)ρ≥0 ⇒ ρ≥−1/(100−1) = -1/99. / Variance of the sum: Var(ΣXᵢ)=n+n(n−1)ρ≥0 ⇒ ρ≥−1/(n−1). Attained when the standardized variables sum to 0.
- **Hint ladder:** (1) Negative correlations can't all be too strong at once — variance of the sum can't go negative. (2) Var(X₁+…+Xₙ) (unit variances) = n + n(n−1)ρ ≥ 0. (3) Solve n + n(n−1)ρ ≥ 0 for ρ: ρ ≥ −1/(n−1).
- **Follow-ups:** What does the bound approach as n→∞, and what does that mean about many mutually-negatively-correlated assets? / At ρ=−1/(n−1), what is Var(X₁+…+Xₙ)?

### tmpl-hedge-ratio#c-6-1_v9-1  `hard`

**Prompt.** You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=-6 and Var(B)=9, what hedge ratio h minimizes the variance?

- **Answer (engine-verified):** `-2/3`
- **Engine check:** `formatRational(optimalHedgeRatio(-6/1, 9/1))` → `-2/3`
- **Source:** Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.
- **Approaches:** Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=-6/9=-2/3. / Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).
- **Hint ladder:** (1) Write the variance of the hedged position as a function of h and minimize. (2) Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero. (3) h* = Cov(A,B)/Var(B).
- **Follow-ups:** What residual variance is left at the optimal h (in terms of Var(A) and ρ)? / How does h* relate to the regression slope and to ρ?

### tmpl-hedge-ratio#c12-1_v16-1  `hard`

**Prompt.** You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=12 and Var(B)=16, what hedge ratio h minimizes the variance?

- **Answer (engine-verified):** `3/4`
- **Engine check:** `formatRational(optimalHedgeRatio(12/1, 16/1))` → `3/4`
- **Source:** Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.
- **Approaches:** Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=12/16=3/4. / Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).
- **Hint ladder:** (1) Write the variance of the hedged position as a function of h and minimize. (2) Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero. (3) h* = Cov(A,B)/Var(B).
- **Follow-ups:** What residual variance is left at the optimal h (in terms of Var(A) and ρ)? / How does h* relate to the regression slope and to ρ?

### tmpl-hedge-ratio#c-3-1_v4-1  `harder`

**Prompt.** You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=-3 and Var(B)=4, what hedge ratio h minimizes the variance?

- **Answer (engine-verified):** `-3/4`
- **Engine check:** `formatRational(optimalHedgeRatio(-3/1, 4/1))` → `-3/4`
- **Source:** Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.
- **Approaches:** Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=-3/4=-3/4. / Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).
- **Hint ladder:** (1) Write the variance of the hedged position as a function of h and minimize. (2) Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero. (3) h* = Cov(A,B)/Var(B).
- **Follow-ups:** What residual variance is left at the optimal h (in terms of Var(A) and ρ)? / How does h* relate to the regression slope and to ρ?

### tmpl-hedge-ratio#c8-1_v25-1  `harder`

**Prompt.** You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=8 and Var(B)=25, what hedge ratio h minimizes the variance?

- **Answer (engine-verified):** `8/25`
- **Engine check:** `formatRational(optimalHedgeRatio(8/1, 25/1))` → `8/25`
- **Source:** Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.
- **Approaches:** Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=8/25=8/25. / Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).
- **Hint ladder:** (1) Write the variance of the hedged position as a function of h and minimize. (2) Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero. (3) h* = Cov(A,B)/Var(B).
- **Follow-ups:** What residual variance is left at the optimal h (in terms of Var(A) and ρ)? / How does h* relate to the regression slope and to ρ?

### tmpl-hedge-ratio#c-10-1_v4-1  `brutal`

**Prompt.** You are long 1 unit of asset A and will short h units of asset B to minimize the variance of A − hB. Given Cov(A,B)=-10 and Var(B)=4, what hedge ratio h minimizes the variance?

- **Answer (engine-verified):** `-5/2`
- **Engine check:** `formatRational(optimalHedgeRatio(-10/1, 4/1))` → `-5/2`
- **Source:** Green Book p.48 ("optimal hedge ratio", line 7647) — minimize Var(r_A−h·r_B) ⇒ h*=Cov(A,B)/Var(B); the canonical hedging desk question.
- **Approaches:** Minimize Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B) over h: d/dh=0 ⇒ h*=Cov(A,B)/Var(B)=-10/4=-5/2. / Equivalently h* is the OLS regression slope of A on B; it is ρ·σ_A/σ_B = Cov/Var(B).
- **Hint ladder:** (1) Write the variance of the hedged position as a function of h and minimize. (2) Var(A−hB)=Var(A)−2h·Cov(A,B)+h²Var(B); set the derivative in h to zero. (3) h* = Cov(A,B)/Var(B).
- **Follow-ups:** What residual variance is left at the optimal h (in terms of Var(A) and ρ)? / How does h* relate to the regression slope and to ρ?

### tmpl-order-stat#cov  `harder`

**Prompt.** Draw two independent Uniform(0,1) values and let Y=min and Z=max. What is Cov(Y,Z)?

- **Answer (engine-verified):** `1/36`
- **Engine check:** `formatRational(orderStatCovUniform().cov)` → `1/36`
- **Source:** Green Book p.51-52 ("Correlation of max and min", lines 8059-8175) — order-statistic synthesis; the answer Cov=1/36, ρ=1/2 is a celebrated desk result.
- **Approaches:** Y·Z = min·max = X₁X₂ always ⇒ E[YZ]=E[X₁]E[X₂]=1/4. E[Y]=1/3, E[Z]=2/3 ⇒ Cov=1/4−2/9=1/36. / Key trick: min·max equals the product of the originals, so E[min·max] needs no order-statistic integral.
- **Hint ladder:** (1) Is there a slick identity for min·max of two numbers? (2) min·max = X₁·X₂, so E[YZ]=E[X₁]E[X₂]=1/4 with no integral. (3) Subtract E[min]E[max]=(1/3)(2/3) from 1/4.
- **Follow-ups:** What are Var(min) and Var(max), and hence ρ(min,max)? / Why is the covariance positive even though one is the min and the other the max?

### tmpl-order-stat#rho  `brutal`

**Prompt.** Draw two independent Uniform(0,1) values and let Y=min and Z=max. What is the correlation ρ(Y,Z)?

- **Answer (engine-verified):** `1/2`
- **Engine check:** `formatRational(orderStatCovUniform().rho)` → `1/2`
- **Source:** Green Book p.51-52 ("Correlation of max and min", lines 8059-8175) — order-statistic synthesis; the answer Cov=1/36, ρ=1/2 is a celebrated desk result.
- **Approaches:** Cov(Y,Z)=1/36; Var(Y)=Var(Z)=E[Y²]−E[Y]²=1/6−1/9=1/18. ρ=(1/36)/(1/18)=1/2. / Key trick: min·max equals the product of the originals, so E[min·max] needs no order-statistic integral.
- **Hint ladder:** (1) Is there a slick identity for min·max of two numbers? (2) min·max = X₁·X₂, so E[YZ]=E[X₁]E[X₂]=1/4 with no integral. (3) Cov=1/36 and Var(min)=Var(max)=1/18; divide.
- **Follow-ups:** Why are min and max positively correlated despite min ≤ max always holding? / Does this ρ change for n iid uniforms as n grows?

### ff-uncorrelated-not-independent  `brutal`

**Prompt.** Let X be symmetric about 0 (say X = ±1 with equal probability, or X~Uniform[−1,1]) and let Y = X². Compute Cov(X,Y) and ρ(X,Y). Are X and Y independent? Reconcile your two answers.

- **Answer (engine-verified):** `Cov=0, ρ=0 (but dependent) — yet X and Y are dependent because Y=X² is a function of X.`
- **Engine check:** `formatRational(covariance([{x:-1,y:1,p:1/2},{x:1,y:1,p:1/2}]))  // E[XY]−E[X]E[Y] gives Cov=0` → `Cov=0, ρ=0 (but dependent)`
- **Source:** randomservices.org "Covariance" / USNA Math 431 — the canonical "uncorrelated does not imply independent" desk question (Green Book ρ-section context).
- **Approaches:** Cov(X,X²)=E[X³]−E[X]E[X²]. Symmetry about 0 kills all odd moments: E[X³]=0 and E[X]=0, so Cov=0 ⇒ ρ=0. / Independence fails because Y=X² is determined by X; ρ only measures the LINEAR relationship, and the dependence here is purely even/quadratic.
- **Hint ladder:** (1) Which moments of a symmetric-about-0 variable vanish, and which moment does Cov(X,X²) need? (2) Cov(X,X²)=E[X³]−E[X]E[X²]; for a symmetric X both odd moments E[X³] and E[X] are forced to a single value — which? (3) With those odd moments pinned, evaluate Cov; then separately ask whether knowing X determines Y (independence) — the two questions have different answers.
- **Follow-ups:** Give a different dependent-but-uncorrelated pair. / What kind of dependence WOULD ρ detect?

### ff-perfect-correlation-table  `hard`

**Prompt.** Two 0/1 variables move in lockstep: P(0,0)=P(1,1)=1/2 and P(0,1)=P(1,0)=0. Compute Cov(X,Y) and the correlation ρ(X,Y). What value of ρ do you expect before computing, and why?

- **Answer (engine-verified):** `Cov=1/4, ρ=1 — perfect positive correlation, since Y=X exactly.`
- **Engine check:** `formatRational(covariance(joint2x2(1,0,0,1,2)))  // Cov=1/4; formatRational(rho(1/4,1/4,1/4).rho)             // ρ=1` → `Cov=1/4, ρ=1`
- **Source:** Green Book p.47-48 (Cov definition) / randomservices.org — the ρ=±1 boundary case showing perfect linear dependence.
- **Approaches:** E[XY]=P(1,1)=1/2, E[X]=E[Y]=1/2 ⇒ Cov=1/2−1/4=1/4. Var(X)=Var(Y)=1/4 ⇒ ρ=(1/4)/√((1/4)(1/4))=1. / Because Y=X with probability 1, the relationship is perfectly linear, so ρ must be exactly 1 — the computation confirms it.
- **Hint ladder:** (1) Read the table: with all mass on the diagonal, how are X and Y related as random variables? (2) They take the same value every time — what does an exact functional relationship imply about where ρ must sit? (3) Compute Cov=E[XY]−E[X]E[Y] from the (1,1) cell and the marginals, then normalize: ρ=Cov/√(VarX·VarY).
- **Follow-ups:** Change the table to P(0,1)=P(1,0)=1/2: now what are Cov and ρ? / What is the maximum |Cov| achievable for two 0/1 variables each with mean 1/2?

### ff-two-dice-cov-and-varsum  `hard`

**Prompt.** You roll two independent fair six-sided dice, X₁ and X₂. State Cov(X₁,X₂) and Var(X₁+X₂), and explain why the covariance term drops out.

- **Answer (engine-verified):** `Cov=0, Var(X₁+X₂)=35/6 (independence ⇒ Cov=0; 35/12+35/12=35/6).`
- **Engine check:** `formatRational(variance(diePmf(6)))                       // Var(die)=35/12; formatRational(varianceOfSum(35/12, 35/12, 0))            // Var(X1+X2)=35/6` → `Cov=0, Var(X₁+X₂)=35/6`
- **Source:** Green Book p.47-48 ("General rules of variance and covariance") / randomservices.org — the independence ⇒ Cov=0, Var of a sum building block.
- **Approaches:** Independent ⇒ Cov=0. Var(X₁+X₂)=Var(X₁)+Var(X₂)+2Cov=35/12+35/12+0=35/6. / Each fair die has Var=35/12; for independent variables variances add.
- **Hint ladder:** (1) What does independence force the cross term Cov(X₁,X₂) to be in Var(X₁+X₂)? (2) With that cross term gone, Var(X₁+X₂) reduces to a sum of the two single-die variances. (3) Recall (or derive) the variance of one fair six-sided die, then combine the two pieces.
- **Follow-ups:** What is Cov(X₁, X₁+X₂)? / How would Var(X₁+X₂) change if the dice were positively correlated?

