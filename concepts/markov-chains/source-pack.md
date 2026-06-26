# Markov Chains — Source Pack (Source Miner / Fact-checker)

> Verified, cited problem set for `course-markov-chains` (≥8 lessons, 3–4 chapters).
> Ground truth = Green Book (`references/green-book.txt`, page markers) + web sources (URL + stated answer).
> **HARD CONSTRAINT honored:** every recorded answer is an EXACT rational a small (2–4 state)
> rational-probability chain reproduces. No invented/unsourced problems. Anything I could not fully
> verify is flagged explicitly.

---

## 1. Concept-level Green Book anchor

**Citation for the concept brief:**

> **§5.1 Markov Chain, p.53–57** (+ **§5.2 Martingale and Random Walk, p.58–62**) — Green Book,
> Ch.5 "Stochastic Process and Stochastic Calculus" (`references/green-book.txt` page markers; §5.1
> header verified at the PAGE 53 marker, §5.2 header at the PAGE 58 marker). §5.1 states the exact
> machinery we teach: the **Markov property / memorylessness** ("once the current state is known,
> past history has no bearing on the future," p.53); the **homogeneous chain** "completely described
> by an M×M transition matrix P and the initial probabilities" (p.53); the **transition graph**
> (Fig 5.1, p.54); the **path probability** P(X₀=i,X₁=j,…) = pᵢⱼ·pⱼₖ·⋯ (p.53); the **classification
> of states** (accessible, communicate, recurrent, transient, absorbing, p.54–55); the **first-step
> equations for absorption probability and expected time to absorption** ("the number 1 is added
> since it takes one step to reach the next state," p.54); the **gambler's-ruin chain** (p.54–55:
> from \$1 the player wins with probability **4/7**, per-step probabilities **1/3 / 2/3**); and the
> **dice chain "two consecutive 7s vs a single 12"** (p.55–56 → **7/13**), solved *both* by
> conditioning *and* by a Markov chain on states {S, 7, 7·7, 12}; plus the **coin chain HHH vs THH**
> (p.56: P(HHH first) = **1/8**, E[THH] = **8**). §5.2 adds the **random walk / symmetric random
> walk**, **martingale**, **stopping times / optional stopping**, **Wald's equality**, the
> **drunk-man-on-a-bridge** absorption (p.59: reach-the-end probability **17/100**, expected steps
> **1411**), and the closed form **E[n heads in a row] = 2ⁿ⁺¹ − 2** (p.60–61 → E[HH]=6, E[HHH]=14).
> Every headline is an exact rational that a 2–4 state chain with rational transition probabilities
> reproduces.

**Why it legitimately anchors the concept:** §5.1 *is literally a Markov-chain section* — it defines
the Markov property, the transition matrix/graph, state classification, and first-step analysis for
absorption probabilities and expected absorption times, and works the two canonical quant chains
(gambler's ruin and the dice/coin pattern chains). §5.2 extends the same state-thinking to random
walks and the optional-stopping/martingale view of the same absorption questions. This is the most
heavily Markov-chain-centric region of the Green Book and the standard quant-interview source for the
topic.

**GB-anchored vs WEB-anchored (per planned topic):**

| Topic | Anchor |
|---|---|
| 1 Markov property / memorylessness | **GB** p.53 (+ web weather) |
| 2 Transition diagram & matrix (rows sum to 1) | **GB** p.53–54 (+ web weather) |
| 3 Multi-step = matrix powers (Chapman–Kolmogorov) | **GB** p.53 (path prob) + **WEB** (exact Pⁿ) |
| 4 Classifying states (recurrent/transient/absorbing/communicating) | **GB** p.54–55 — **but periodicity is WEB** |
| 5 Absorption probability (first-step analysis) | **GB** p.54–57 (4/7, 7/13, 1/8) + **WEB** (i/N) |
| 6 Expected hitting / absorption time | **GB** p.54, p.59–61 (1411, 8, 14) + **WEB** (i(N−i)) |
| 7 Stationary distribution πP=π | **WEB ONLY** (absent from GB) |
| 8 Convergence / regular chains (Pⁿ→π) | **WEB ONLY** (absent from GB) |
| 9 Reversibility / detailed balance | **WEB ONLY** (absent from GB) |
| 10 PageRank | **WEB ONLY** (absent from GB) |
| 11 Synthesis (Ehrenfest urn / weather / maze) | **WEB ONLY** (absent from GB) |

---

## 2. Verified problem set (keyed by the 11 candidate topics)

Format per problem: **statement | source | stated answer (exact rational) | tiny-chain setup | exact?**
`[GB]` = Green Book, `[WEB]` = web (URL given in §5). All probabilities below are exact rationals.

### Topic 1 — Markov property / memorylessness  *(GB-anchored)*

- **[GB] What makes a process "memoryless"?** GB p.53 states the property directly: "once the
  current state is known, past history has no bearing on the future," and a chain is fully described
  by P + initial probabilities. **Answer:** conceptual (identify which stories are Markov). **Chain:**
  any P. **Exact? Y** (definitional).
- **[WEB] Two-state weather.** "If today is clear, tomorrow is clear w.p. 3/5; if rainy, rainy w.p.
  7/10." Identify it as a 2-state Markov chain (next day depends only on today). **Source:** Math.SE
  3336273. **Answer:** P = [[3/5,2/5],[3/10,7/10]] (a valid Markov chain). **Chain:** states {Clear,
  Rainy}; rows above. **Exact? Y.**

### Topic 2 — Transition diagram & matrix (rows sum to 1)  *(GB-anchored)*

- **[GB] Build P from a story.** GB p.53–54: "A Markov chain with M states can be completely
  described by an M×M transition matrix P and the initial probabilities"; rows are transition
  probabilities out of a state (sum to 1); the transition graph (Fig 5.1) is the visual. **Answer:**
  construct P (rows sum to 1). **Exact? Y.**
- **[WEB] Weather P (rows sum to 1).** **Source:** GeeksforGeeks (stationary-distribution page).
  **Answer / chain:** P = [[7/10,3/10],[4/10,6/10]] (each row sums to 1). **Exact? Y.**
- **[WEB] Clear/Rainy P.** **Source:** Math.SE 3336273. **Chain:** P = [[3/5,2/5],[3/10,7/10]].
  **Exact? Y.**

### Topic 3 — Multi-step transitions = matrix powers (Chapman–Kolmogorov)  *(GB path-prob + WEB exact Pⁿ)*

- **[GB] Path probability.** GB p.53: P(X₀=i, X₁=j, X₂=k, …) = pᵢⱼ·pⱼₖ·⋯ (product along the path).
  **Answer:** product of edge probs. **Exact? Y.**
- **[WEB] "Snow two days after rain?"** Land of Oz chain (states Rain/Nice/Snow),
  P = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]. The 2-step prob = (P²)_{Rain,Snow}. **Source:**
  Grinstead & Snell Ch.11, Table 11.1 (entry .375); UC Davis dis6 notes pose this exact question.
  **Answer:** **(P²)_{Rain,Snow} = 3/8**. (Full P² row Rain = (7/16, 3/16, 3/8).) **Chain:** 3-state
  Land of Oz above; compute P². **Exact? Y** (dyadic).

### Topic 4 — Classifying states (recurrent / transient / absorbing / communicating / periodicity)

- **[GB] Classification vocabulary + gambler's-ruin classes.** GB p.54–55 defines accessible,
  communicate, recurrent, transient, and absorbing, and classifies the gambler's-ruin chain (0 and N
  absorbing; interior transient). **Answer:** identify classes. **Exact? Y** (definitional).
- **[WEB] Irreducible / aperiodic / ergodic 3-state.** "Cloudy town" chain
  P = [[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]] is irreducible (all states communicate), aperiodic
  (p₂₂>0), hence ergodic. **Source:** Rochester ECE440 HW5 #2. **Answer:** ergodic (unique π).
  **Exact? Y** (structural).
- **[WEB] Periodicity (NOT in GB).** Basic Ehrenfest urn with m=2: states {0,1,2},
  P = [[0,1,0],[1/2,0,1/2],[0,1,0]] has **period 2** (you can only return to a state in an even
  number of steps). **Source:** stats.libretexts 16.8 / phys.libretexts 12.3 (Ehrenfest). **Answer:**
  periodic, period 2. **Chain:** 3-state above. **Exact? Y** (structural).

### Topic 5 — Absorption probability (generalized first-step analysis)

- **[GB] Gambler's ruin → 4/7.** From \$1, with per-step up-probability 2/3 and down 1/3 on
  {0,1,2,3} (0 & 3 absorbing), the player reaches \$3 first with probability **4/7** (GB p.54–55,
  verified in text: "4/7", "1/3", "2/3"; intermediate a₂ = **6/7**). First-step eqns a₁=⅓a₀+⅔a₂,
  a₂=⅓a₁+⅔a₃, a₀=0, a₃=1. **Chain:** states {0,1,2,3}; up 2/3, down 1/3; absorbing 0,3. **Answer:**
  a₁ = **4/7**, a₂ = 6/7. **Exact? Y.**
- **[GB] Dice: single 12 before two consecutive 7s → 7/13.** Two players bet on the running sum of
  two dice; one bets a single **12** appears first, the other bets **two consecutive 7s** appear
  first. GB p.55–56 (conditioning *and* a chain on {S, 7, 7·7, 12}). **Answer:**
  **P(single 12 first) = 7/13**; **P(two consecutive 7s first) = 6/13** (complement). **Chain:**
  per-roll P(7)=6/36, P(12)=1/36, P(other)=29/36; S→{12}:1/36, S→7:6/36, S→S:29/36; 7→{7·7}:6/36,
  7→{12}:1/36, 7→S:29/36. **Exact? Y.**  ⚠️ **See the correction note in §4** — `7/13` is the
  *12-first* probability; the *two-consecutive-7s-first* probability is `6/13`.
- **[GB] Coin HHH before THH → 1/8.** GB p.56. **Chain:** states {S,H,HH,HHH(abs),"T"-collapse};
  fair coin (each edge 1/2). **Answer:** P(HHH before THH) = **1/8** (the only way is the first three
  flips = HHH). **Exact? Y.**
- **[WEB] Random walk absorbed at ends → i/N.** Drunkard's walk on corners {0,1,2,3,4}, 0 & 4
  absorbing, interior symmetric (½ each way). P(reach the bar at 4 | start at i) = **i/4**:
  state 1 → **1/4**, state 2 → **1/2**, state 3 → **3/4**. **Source:** Grinstead & Snell Ex.11.13–15
  (B = NR). **Chain:** 5-state birth–death, ½/½. **Exact? Y.** (General fair gambler's ruin: i/N.)

### Topic 6 — Expected hitting / absorption time

- **[GB] Expected steps to absorption (general).** GB p.54 gives the first-step equations for
  expected absorption time ("the number 1 is added since it takes one step to reach the next state").
  **Answer:** solve tᵢ = 1 + Σⱼ pᵢⱼ tⱼ (t=0 at absorbing). **Exact? Y.**
- **[GB] Drunk man on a bridge → 17/100 and 1411.** Symmetric random walk starting at the 17th meter
  of a 100-m bridge, absorbed at 0 or 100. **Source:** GB p.59. **Answer:** P(reach the 100-m end
  first) = **17/100** (= 0.17, stated); expected steps to absorption = **1411** (= 17·83; OCR shows
  "1441", the intended value is i(N−i)=17·83=1411). **Chain:** 0..100 symmetric (½/½), or scaled.
  **Exact? Y** for 17/100; 1411 is exact (flag the OCR digit).
- **[GB] Expected tosses for n heads in a row → 2ⁿ⁺¹−2.** GB p.60–61. **Answer:** E[1 head]=2,
  **E[HH]=6**, **E[HHH]=14**; also **E[THH]=8** (GB p.56, stated). **Chain:** run-length states
  {S,H,HH,(HHH)}, fair coin. **Exact? Y** (integers).
- **[WEB] Drunkard's walk expected steps → i(N−i).** Grinstead & Snell Ex.11.15: t = Nc = **(3,4,3)**
  for start states 1,2,3 on {0..4} (= i(4−i)). **Source:** Grinstead & Snell Ch.11. **Chain:** 5-state
  symmetric. **Exact? Y.**

### Topic 7 — Stationary distribution πP=π  *(WEB ONLY — absent from GB)*

- **[WEB] 2-state "fraction of clear days."** P = [[3/5,2/5],[3/10,7/10]]. **Source:** Math.SE
  3336273. **Answer:** π = **(3/7, 4/7)** (clear, rainy). **Chain:** 2-state above. **Exact? Y.**
- **[WEB] 2-state π.** P = [[7/10,3/10],[4/10,6/10]]. **Source:** GeeksforGeeks. **Answer:**
  π = **(4/7, 3/7)**. **Exact? Y.**
- **[WEB] 2-state π (asymmetric).** P = [[1/4,3/4],[1/5,4/5]]. **Source:** Rochester ECE440 HW5 #1.
  **Answer:** π = **(4/19, 15/19)** (long-run fraction in state 1 = 4/19). **Exact? Y.**
- **[WEB] 3-state "cloudy town" long-run fractions.** P = [[0,1/2,1/2],[1/4,1/2,1/4],[1/4,1/4,1/2]].
  **Source:** Rochester ECE440 HW5 #2. **Answer:** π = **(1/5, 2/5, 2/5)** (sunny 1/5, cloudy 2/5,
  rainy 2/5). **Chain:** 3-state above. **Exact? Y.** ← *best 3-state interview example.*
- **[WEB] General 2-state formula.** For P = [[1−a,a],[b,1−b]], π = **(b/(a+b), a/(a+b))**.
  **Source:** Math.SE 259852. **Exact? Y** (for rational a,b).

### Topic 8 — Convergence / "forgetting the start" / regular chains  *(WEB ONLY — absent from GB)*

- **[WEB] Land of Oz Pⁿ → π.** P = [[1/2,1/4,1/4],[1/2,0,1/2],[1/4,1/4,1/2]]. As n grows, **all rows
  of Pⁿ converge** to the same vector w, independent of the start. **Source:** Grinstead & Snell
  Ch.11, Ex.11.1–11.2, Table 11.1. **Answer:** w = **(2/5, 1/5, 2/5)** (= .4,.2,.4); finite powers are
  exact dyadic rationals, e.g. P² row Rain = (7/16, 3/16, 3/8), P⁶ ≈ rows (2/5,1/5,2/5). **Chain:**
  3-state above. **Exact? Y** (exact at every finite n; limit = π).

### Topic 9 — Reversibility / detailed balance  *(WEB ONLY — absent from GB)*

- **[WEB] Ehrenfest urn is reversible (detailed balance).** m balls between two urns; pick one at
  random and move it: P(i→i+1)=(m−i)/m, P(i→i−1)=i/m. Detailed balance πᵢ pᵢ,ᵢ₊₁ = πᵢ₊₁ pᵢ₊₁,ᵢ
  ⇒ **π(i) = C(m,i)/2ᵐ** (Binomial(m, 1/2)). **Source:** stats.libretexts 16.8; phys.libretexts 12.3;
  Lancaster math332 §4.7; UBC Lecture 3. **Answer / chains:**
  - m=2: states {0,1,2}, P=[[0,1,0],[1/2,0,1/2],[0,1,0]], π = **(1/4, 1/2, 1/4)**.
  - m=3: states {0,1,2,3}, π = **(1/8, 3/8, 3/8, 1/8)**.
  **Exact? Y.** ← clean small reversible/birth–death example.

### Topic 10 — PageRank  *(WEB ONLY — absent from GB)*

- **[WEB] 3-page cycle, with damping.** Pages A→B→C→A; random surfer with damping d (the canonical
  d=85/100, or d=1/2 — both rational). By symmetry, **π = (1/3, 1/3, 1/3)** for *any* d. **Source:**
  theorempath.com PageRank; askfilo 3-page-cycle. **Chain:** 3-cycle column-stochastic M;
  Google matrix d·M + (1−d)/3·J. **Exact? Y.** ← guaranteed-clean teaching example.
- **[WEB] 4-page link graph (ranking = stationary distribution, d=1 / no teleport).** Pages 1–4,
  links 1→2, 2→{1,4}, 3→{1,4}, 4→{1,2,3}; column-stochastic A; solve x = Ax. **Source:** EECS 398
  (practicaldsc) PageRank. **Answer:** **(4/13, 5/13, 1/13, 3/13)** (page 2 > 1 > 4 > 3). **Chain:**
  4-state link matrix above. **Exact? Y** (denominator 13). ← clean *non-trivial distinct* fractions.
- **[CONSTRUCTED — engine-computed, not a stated-source answer] 3-node with damping d=1/2.** Links
  1→{2,3}, 2→3, 3→1; Google recurrence r = d·M·r + (1−d)/N (Wikipedia formula), d=1/2, N=3. **Result
  (I solved the 3×3 system over ℚ and verified):** r = **(14/39, 10/39, 15/39)**. **Source for the
  *method*:** Wikipedia PageRank (formula) + arXiv math/0612079 (justifies d=1/2). **Provenance:** the
  tiny graph + the answer are *my construction/computation*, offered as a clean damped instance; the
  numbers are not lifted from a source. **Exact? Y** (verify with the engine before use).

### Topic 11 — Synthesis / applications  *(WEB ONLY)*

- **[WEB] Ehrenfest urn (diffusion, reversible, binomial stationary).** As topic 9: π(i)=C(m,i)/2ᵐ;
  capstone tying diffusion + reversibility + stationary. **Source:** stats.libretexts 16.8 etc.
  **Exact? Y** (m=2 → (1/4,1/2,1/4); m=3 → (1/8,3/8,3/8,1/8)).
- **[WEB] Weather (stationary + convergence).** Land of Oz / clear–rainy (topics 7–8). **Exact? Y.**
- **[WEB] Mouse-in-maze / drunkard (absorption).** Grinstead & Snell Drunkard's walk is the canonical
  "absorbed at exits" maze chain (topics 5–6): i/N and i(N−i). **Exact? Y.**

---

## 3. Confirmation of what is ABSENT from the Green Book

Searches run with shell `rg -c -i "<term>" references/green-book.txt` (the Grep tool cannot see this
index-excluded file; `rg` and Read can). **Counts (whole 96-page file):**

| term | hits | term | hits |
|---|---|---|---|
| `stationary` | **0** | `reversible` | **0** |
| `steady state` | **0** | `reversibility` | **0** |
| `steady-state` | **0** | `detailed balance` | **0** |
| `PageRank` | **0** | `periodic` | **0** |
| `ergodic` | **0** | `periodicity` | **0** |
| | | `aperiodic` | **0** |

**Conclusion (confirmed):** stationary distribution, steady state, convergence/ergodicity,
reversibility/detailed balance, periodicity, and PageRank are **NOT in the Green Book**. Topics 7, 8,
9, 10 and the **periodicity** sub-part of topic 4 (and topic 11's Ehrenfest framing) **must be
WEB-sourced** (done above). The Green Book legitimately anchors the *concept* (§5.1 Markov Chain) and
topics 1–6 (Markov property, transition matrix, path probability/multi-step, classification minus
periodicity, absorption probability, expected absorption time).

Page-marker map (verified): PAGE 53→§5.1 header; 54; 55; 56; 57; 58→§5.2 header; 59; 60; 61; 62.
So **§5.1 Markov Chain = p.53–57**, **§5.2 Martingale and Random Walk = p.58–62**.

---

## 4. Exact-rational feasibility notes (+ the one correction)

- **All four "absent" topics have at least one clean rational example** (requirement met):
  - **Stationary:** 2-state (3/7,4/7), (4/7,3/7), (4/19,15/19); **3-state (1/5,2/5,2/5)**. ✔
  - **Convergence:** Land of Oz Pⁿ → **(2/5,1/5,2/5)**, exact dyadic at every finite n. ✔
  - **Detailed balance:** Ehrenfest **(1/4,1/2,1/4)** (m=2), **(1/8,3/8,3/8,1/8)** (m=3). ✔
  - **PageRank:** **(1/3,1/3,1/3)** (3-cycle, any rational d) and **(4/13,5/13,1/13,3/13)** (4-node,
    d=1), both sourced; plus a constructed d=1/2 → **(14/39,10/39,15/39)**. ✔
- **⚠️ CORRECTION to the brief's dice claim (important).** The prompt said "two consecutive 7s before
  a single 12 → P(A) = 7/13." Verified against the GB text **and 5 independent web sources**: the
  exact split is **P(single 12 first) = 7/13** and **P(two consecutive 7s first) = 6/13**. So **7/13
  is the 12-first probability** (the GB's "P(A)=7/13" with A = the 12-bettor, consistent with the GB's
  own Markov-chain label "12 (A wins)"); the *two-consecutive-7s-first* event is its complement
  **6/13**. Both are clean rationals from the same 4-state chain {S, 7, 7·7, 12}. Architect: state the
  event precisely (12-first = 7/13, two-7s-first = 6/13).
- **Drunk-man expected steps:** OCR renders the value as "1441"; the correct exact value is
  **i(N−i) = 17·83 = 1411**. The probability **17/100** is printed cleanly ("0.17"). Use 17/100 as the
  headline; 1411 as the expected-time companion.
- **PageRank with non-trivial damping:** I could not find a *published* worked example whose damped
  (d≠1) stationary vector is given as exact fractions — most sources print decimals (e.g. the d=0.85
  3-node example ≈ .387/.214/.399 is **not** a clean rational). The clean sourced options are the
  symmetric 3-cycle (1/3,1/3,1/3) and the d=1 4-node (4/13,…). For a *damped distinct-fraction*
  example use the **constructed** d=1/2 → (14/39,10/39,15/39) and recompute it in the engine before
  shipping (flagged as constructed, not source-stated).
- **Everything else is comfortably exact-rational.** Gambler's ruin (4/7, 6/7, i/N), dice (7/13,
  6/13), coin (1/8, 6, 8, 14), drunkard (i/4, i(4−i)=3,4,3) are all small rational chains.

---

## 5. Citations (deduplicated)

**Green Book** — `references/green-book.txt`: §5.1 Markov Chain **p.53–57**, §5.2 Martingale and
Random Walk **p.58–62** (gambler's ruin 4/7; dice 7/13 & 6/13; coin HHH/THH 1/8 & E[THH]=8;
drunk-man 17/100 & 1411; E[n heads]=2ⁿ⁺¹−2).

**Stationary distribution**
- https://math.stackexchange.com/questions/3336273/clear-days-rainy-days-markov-chain-problem  → (3/7, 4/7)
- https://www.geeksforgeeks.org/engineering-mathematics/how-to-find-stationary-distribution-of-markov-chain/  → (4/7, 3/7)
- https://www.hajim.rochester.edu/ece/sites/gmateos/ECE440/Homework/hw_5_markov_chains_solution.pdf  → (4/19,15/19) and 3-state (1/5,2/5,2/5)
- https://math.stackexchange.com/questions/259852/how-to-compute-the-stationary-distribution-of-a-2-times-2-transition-probabili  → π=(b/(a+b),a/(a+b))

**Convergence / regular chains (Land of Oz)**
- https://natanaso.github.io/ece276b/ref/Grinstead-Snell-Ch11.pdf  → Pⁿ→(2/5,1/5,2/5); Table 11.1; Drunkard's walk i/4, t=(3,4,3)
- https://www.cs.ucdavis.edu/~amenta/w04/dis6.pdf  → Land of Oz Chapman–Kolmogorov ("snow 2 days after rain" via P²)

**Reversibility / detailed balance (Ehrenfest)**
- https://stats.libretexts.org/Bookshelves/Probability_Theory/Probability_Mathematical_Statistics_and_Stochastic_Processes_(Siegrist)/16%3A_Markov_Processes/16.08%3A_The_Ehrenfest_Chains  → π=C(m,i)/2ᵐ
- https://phys.libretexts.org/Bookshelves/Mathematical_Physics_and_Pedagogy/Computational_Physics_(Chong)/12%3A_Markov_Chains/12.03%3A_The_Ehrenfest_Model
- https://www.lancaster.ac.uk/~prendivs/accessible/math332/lec332.tex/Ch4.S7.html
- https://personal.math.ubc.ca/~holmescerfon/teaching/asa22/handout-Lecture3_2022.pdf

**PageRank**
- https://theorempath.com/topics/pagerank-algorithm  → 3-cycle (1/3,1/3,1/3); formula π=αMπ+(1−α)1/n
- https://practicaldsc.org/wn25/guides/linear-algebra/pagerank/  → 4-node (4/13,5/13,1/13,3/13)
- https://en.wikipedia.org/wiki/PageRank  → PR=(1−d)/N+d·Σ PR/L; d=0.85 standard
- https://arxiv.org/pdf/math/0612079  → mathematical case for damping d=1/2

**Dice problem cross-check (7/13 vs 6/13)**
- https://math.stackexchange.com/questions/4494380/probability-you-get-12-before-two-consecutive-7s  → 7/13 (12 first); 4-state transition matrix
- https://math.stackexchange.com/questions/2325821/probability-2-dice-rolled-two-players  → P(A=12 first)=7/13, P(B=two 7s)=6/13
- https://math.stackexchange.com/questions/1300430/rolling-two-dice-what-is-the-probability-that-two-consecutive-7s-happens-earl  → P(two 7s)=6/13
- https://math.stackexchange.com/questions/1204067/comparing-the-probabilities-of-rolling-a-12-or-two-consecutive-7s-first-wit  → 7/13 / 6/13
- https://ernie55ernie.github.io/quantitative%20interview/2025/05/21/dice-question.html  → 7/13 (12 first)
