# Continuity Report — "Options, Payoffs & No-Arbitrage" (slug `options`, `course-options`, domain Quantitative Finance)

> **Survey basis — MCP PRESENT (dev + prod both queried).** Unlike the covariance report,
> the Firebase MCP **is connected** here. The shipped corpus was surveyed from **three**
> sources and cross-checked: (1) git **fixtures on branch `concept/options`** in this worktree
> (`/Users/ericwu/Developer/lf-options/fixtures/`); (2) **prod Firestore `brilliant-org`**
> (`courses`/`lessons`, default DB); (3) **dev Firestore `brilliant-org-dev`** (default DB).
> Findings — **prod = 8 live courses** (Probability: pattern-hitting-times, expected-value,
> markov-chains, bayes-rule, covariance; Combinatorics & Games: combinatorics, optimal-stopping,
> game-theory). **dev = 9 live courses** (the 8 **+ binary-information**, domain "Algorithms &
> Information"). **Branch fixtures = the same 9.** So **Binary & Information is in-dev (dev-seeded
> + fixtures) but NOT yet in prod**; everything else is live in both. **No options/finance course
> or lesson exists in prod, in dev, or in any fixture** (`courseId IN [course-options]` → empty;
> `domain IN [Finance, Quantitative Finance]` → empty; `status != live` → empty). Other branches
> exist — `concept/covariance`, `concept/binary-information`, `concept/markov-chains` (worktrees),
> `learning-science-overhaul`, `ls-beat-fixes`, `fix/interview-live`, `worktree-ls-on-by-default`,
> remotes `cursor/game-theory-lessons-c79f`, `cursor/optimal-stopping-acc4` — but were **not
> consulted**: branch `concept/options` already contains all 9 concepts and matches live dev, so
> it is treated as the shipped corpus. Every lessonId/beatId/schemaId quoted below was read
> directly from the fixture named beside it.

---

## Executive summary

- **Top 4 overlaps (all recall, never re-teach):**
  1. **Expected value `E[X]=Σx·P(x)` as "the fair price of a bet"** is owned by
     `lesson-expected-value-1.json` (`ev1-recall`, `ev1-win`, `ev1-model`; summary literally says
     *"the weighted average / fair price of a bet"*). Risk-neutral pricing = **discounted
     expectation under a *new* measure q** — pure retrieval of E[X], then teach the measure change.
  2. **Min-variance hedging** recalls **`Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)`** (`lesson-covariance-3`
     `cov3-win`/`cov3-model`/`cov3-mastery`) **and the optimal hedge ratio `h*=Cov/Var=−2/3`**
     (`lesson-covariance-5` `cov5-win`/`cov5-mastery`, dossier #13). The option **delta is that
     same hedge ratio** in a new costume.
  3. **Multi-step binomial-tree node weights = `C(n,k)`** — direct retrieval of the binomial
     theorem / Pascal (`lesson-combinatorics-3` `l3-recall`, `l3-explore` `pascalTriangle`,
     `l3-model` `C(n,k)`, `l3-prove`; row sums to 2ⁿ).
  4. **No-arbitrage = "no free money"** is a **dominance/equilibrium** flavor (`lesson-game-theory-1`
     `l1-recall`/`l1-bet`/`l1-win`, schemaId `dominance-nash`): an arbitrage is a strictly dominant
     money-pump rational markets eliminate.
- **The one boundary that matters most (teach-fresh):** the corpus prices **nothing**. It teaches
  expectation under the **real/physical** probabilities and the counting/co-movement machinery, but
  has **zero** content on **pricing by no-arbitrage**, the **change of measure to the risk-neutral
  q**, or **discounting / present value** — a corpus-wide grep for `discount`/`present value`/
  `interest rate`/`time value` returns **zero hits**, and for `no-arbitrage`/`risk-neutral`/
  `put-call`/`strike`/`payoff diagram`/`replicat` returns **zero hits**. **Everything options *is*
  is teach-fresh** (payoff diagrams, intrinsic/time value, put-call parity, no-arb bounds,
  replication, the measure q, one-/multi-step binomial pricing, the Greeks & their signs, delta as
  the dynamic hedge ratio, σ as a volatility input, discounting). **Everything it *builds on* is
  shipped recall** (E[X], Var/Cov, the hedge ratio, nCk/Pascal, dominance, backward induction).
- **Highest-value conversion:** `lesson-expected-value-1` already frames `E[X]` as the *fair price
  of a bet (fair die → 7/2)*. Risk-neutral pricing is the **designed successor** — open the pricing
  lesson by **retrieving that framing** ("you priced a fair bet by `Σx·P(x)`; an option is a bet —
  but under *which* probabilities?"), then teach q + discounting fresh.
- **Method reuse — the binomial tree is `backward-induction`, already in the registry.** `methods.ts`
  ships `backward-induction` (domains `game-theory`, `optimal-stopping`; CONFUSABLE with
  `first-step-analysis`, `recursion-self-reference`, `threshold-rule`, `dominance-nash`). The tree
  is priced by folding from expiry — the *same method, new surface*. The L4 which-method gate writes
  itself: `correct = backward-induction`, foils straight from `CONFUSABLE[backward-induction]`.
  (Options extends that id's `domains` and adds new finance ids — `risk-neutral-pricing`,
  `replication-no-arbitrage` — as Wave-0 registry additions; those *methods* are teach-fresh.)
- **FALSE OVERLAP flagged (name collision):** the shipped **`payoffMatrix`** widget
  (`PayoffMatrixBeat.tsx`, used in `lesson-game-theory-1..4`) is a **2-player strategic bimatrix**
  (strategies × strategies, dual `(row,col)` payoffs) — **NOT** an option **payoff diagram**
  (single-axis payoff vs spot `S_T` at expiry, the hockey-stick). Do **not** reuse it for options;
  a new payoff-diagram widget is required. This is the options analogue of covariance's
  `correlation.ts`/"autocorrelation" false overlap.
- **Reuse, don't reinvent:** every lesson already opens with a graded `retrievalGrid` and closes
  with a generate-then-reveal `recap`; `lesson-states-streaks.json` is a working interleaved
  mixed-review checkpoint (*"Interleaving > blocking. You practice discriminating."*). Clone these
  per `inclusive-research-5-progression-assessment.md`; author no new interaction types for recall.

---

## 1. Existing corpus surveyed

9 shipped concepts (8 live in prod, all 9 live in dev + fixtures). Inventory pulled from the
`course-*.json` fixtures and confirmed against live `courses` docs in `brilliant-org` (prod) and
`brilliant-org-dev` (dev). Headline glyphs are each fixture's `glyphKey`.

| Concept (courseId) | Domain / order | Lessons (lessonId → title) [source] |
|---|---|---|
| **Pattern Hitting Times** (`course-pattern-hitting-times`) | Probability, dOrder 0 / order 0 | `lesson-first-heads` *Watch the First Heads* (E[H]=2); `lesson-pattern-hitting-times` *Pattern Hitting Times* (E[HH]=6 vs E[HT]=4); `lesson-penneys-game` *Penney's Game*; `lesson-gamblers-ruin` *Gambler's Ruin* (P(ruin)=i/N); `lesson-states-streaks` *Mixed Review & Streaks* (interleaved checkpoint); `lesson-longer-patterns` *Longer Patterns & Overlap*; `lesson-overlap-shortcut` *The Overlap Shortcut* (E=Σ2^L, fair-game martingale). |
| **Expected Value** (`course-expected-value`) — **a core neighbor** | Probability, 0 / 1 | `lesson-expected-value-1` *What is Expected Value?* (**E[X]=Σx·P(x), "fair price of a bet"**, fair die 7/2); `-2` *Linearity* (E[X+Y]=E[X]+E[Y]); `-3` *Indicator Variables*; `-4` *Conditional & Total Expectation*; `-5` *Coupon Collector*; `-6` *Order Statistics & Extremes*. |
| **Markov Chains** (`course-markov-chains`) | Probability, 0 / 2 | `-1` *The Markov Property*; `-2` *Transition Matrix*; `-3` *Multi-Step* (Pⁿ); `-4` *Classifying States*; `-5` *Hitting Times & Absorption* (`(I−Q)⁻¹`, first-step); `-6` *Stationary π*; `-7` *Convergence*; `-8` *Reversibility*; `-9` *PageRank*; `-10` *In the Wild*. |
| **Bayes' Rule** (`course-bayes-rule`) | Probability, 0 / 3 | `-1` *The Update Rule*; `-2` *Base-Rate Trap*; `-3` *Stacking Evidence* (independent evidence multiplies); `-4` *Which Hypothesis?*; `-5` *The Host's Clue* (Monty); `-6` *The Question Behind the Clue*; `-7` *Reading Evidence Backwards*; `-8` *Base Rates in the Wild*. |
| **Covariance & Correlation** (`course-covariance`) — **a core neighbor** | Probability, 0 / 4 | `lesson-covariance-1` *Spread: Variance & SD* (Var=E[X²]−E[X]², **σ**); `-2` *Covariance: Leftover of the Product Rule* (Cov=E[XY]−E[X]E[Y]); `lesson-covariance-3` *Variance of a Sum: The Cross Term* (**Var(X+Y)=Var+Var+2Cov**); `-4` *Correlation ρ* (ρ∈[−1,1]; Cov=0 ⇏ indep); `-5` *Correlation Triangle* (PSD bounds; **hedge ratio h*=Cov/Var=−2/3**, dossier #13); `-6` *Synthesis*. |
| **Combinatorics** (`course-combinatorics`) — **a core neighbor** | Combinatorics & Games, dOrder 1 / order 0 | `-1` *Counting Principle* (multiply independent choices); `lesson-combinatorics-2` *Permutations & Combinations* (**nPk vs nCk**); `lesson-combinatorics-3` *The Binomial Theorem* (**C(n,k) are the coefficients of (a+b)ⁿ; Pascal; row sum 2ⁿ; `pascalTriangle`**); `-4` *Inclusion–Exclusion*; `-5` *Pigeonhole*; `-6` *Counting Probabilities* (P=favorable/total). |
| **Optimal Stopping** (`course-optimal-stopping`) | Combinatorics & Games, 1 / 1 | `-1` *No Going Back* (1/n); `-2` *Look, Then Leap*; `-3` *The 37% Rule* (1/e); `-4` *Why 37% Works* (backward/threshold); `-5` *Stopping in the Wild*. |
| **Game Theory** (`course-game-theory`) | Combinatorics & Games, 1 / 2 | `lesson-game-theory-1` *Dominance & the Prisoner's Dilemma* (**dominance/equilibrium; `payoffMatrix` widget**, schemaId `dominance-nash`); `-2` *Nash Equilibrium*; `-3` *Mixed Strategies*; `-4` *Zero-Sum & Minimax*; `lesson-game-theory-5` *Sequential Games & Backward Induction* (**schemaId `backward-induction`**); `-6` *Nim & Symmetry*. |
| **Binary & Information** (`course-binary-information`) — **in-dev: dev+fixtures, NOT prod** | Algorithms & Information, dOrder 2 / order 0 | `-1` *Every Number Is Bits* (2ⁿ); `-2` *Bits as Information* (⌈log₂N⌉); `-3` *Group Testing*; `-4` *The Scale Speaks Base-3*; `-5` *Bit Tricks* (XOR); `-6` *Encoding the Answer*. |

**Corpus-wide search for options-adjacent ideas** (grep across all `lesson-*.json` on branch
`concept/options`, cross-checked vs live dev/prod):

- `option` / `call` / `put` / `strike` / `payoff diagram` / `no-arbitrage` / `risk-neutral` /
  `put-call` / `replicat` / `Black–Scholes` / `expiry` / `in the money` → **zero finance hits.**
  (A broad grep "matches" `call`/`put` etc., but **only** as ordinary prose verbs — no finance
  sense anywhere. The finance-specific phrase grep returns **nothing**.)
- `discount` / `present value` / `interest rate` / `time value` → **zero hits.** Discounting is
  **absent from the entire corpus** — a teach-fresh prerequisite, not a recall.
- `payoffMatrix` → hits **only** in game-theory (`lesson-game-theory-1..4`, `PayoffMatrixBeat.tsx`,
  `game-theory-payoff.css`). **Name collision, not a concept overlap** (strategic bimatrix ≠ option
  payoff diagram). Flagged below.
- `binomial` / `pascal` / `nCk` → `lesson-combinatorics-2/-3/-4/-5`, `lesson-markov-chains-8`,
  `lesson-binary-information-6` (binomial *theorem / coefficients*; **no binomial *pricing***).
- `backward-induction` / `first-step-analysis` / `recursion-self-reference` → live **method ids** in
  `src/content/methods.ts`, used across game-theory, markov, optimal-stopping, pattern-hitting,
  expected-value. **Method reuse**, surface is new (see L4).
- `hedge` → `lesson-covariance-5` (`cov5-win`/`cov5-mastery`) + covariance `source-dossier.md` #13
  (`h*=Cov(A,B)/Var(B)=−2/3`). The **statistical** hedge ratio — the seed for the option delta.

**Conclusion of the survey:** options sits in a genuine gap and opens a **new fourth domain**
("Quantitative Finance", `domainOrder 3`). Everything options *builds on* — expectation, variance/
covariance, the hedge ratio, binomial coefficients, dominance, backward induction — is shipped and
recallable. Everything options *is* — payoffs, parity, no-arbitrage, replication, the risk-neutral
measure, binomial pricing, the Greeks, discounting — is absent. No engine exists either
(`src/engine/` has no option/binomial/payoff module), so the build is greenfield.

---

## 2. Overlap analysis

Verdicts: **dedupe** = reference the prior result, do NOT re-teach; **retrieval / spaced-review /
interleaving** = convert the overlap into an active-recall or discrimination beat;
**false-overlap** = a name/shape collision to flag and avoid; **teach-fresh** = not an overlap,
new to the whole corpus.

| Existing lesson / beat | Overlapping idea | Verdict | Action — assume-known vs teach-fresh |
|---|---|---|---|
| **`lesson-expected-value-1` / `ev1-recall`, `ev1-win`, `ev1-model`** (E[X]=Σx·P(x); summary: *"the weighted average / fair price of a bet"*, fair die 7/2) | **expectation as the fair price of a bet** | **retrieval (highest priority)** | **Assume-known:** `E[X]=Σx·P(x)` and "a fair bet is worth its expectation." **Teach-fresh:** an option's fair value is a *discounted* expectation under the **risk-neutral measure q**, not the physical p. Open the pricing lesson (L3) with a graded `retrievalGrid` recalling "fair die → 7/2 / `E[X]=Σx·P(x)`" (mirror `ev1-recall`), then spring: "under *which* probabilities, and why discounted?" Never re-derive E[X]. |
| `lesson-expected-value-2` / `ev2-*` (linearity, dependence-free) | expectation of a sum / portfolio | **dedupe** | **Assume-known.** A portfolio's expected payoff adds linearly. Reference when building a replicating portfolio's value; the teach-fresh punchline is that *price* comes from **no-arbitrage replication**, not from averaging payoffs under p. |
| **(absent) discounting / present value** — grep returns **zero hits** | **time value of money / discount factor** | **teach-fresh (not an overlap — flag the gap)** | The corpus never discounts. `PV = e^{−rT}·E_q[payoff]` (or `1/(1+r)` one-step) is **wholly new**. Flag in continuity so the Architect budgets a thin worked-example on-ramp (§2.8) for the discount factor — there is no prior beat to recall it from. |
| **`lesson-covariance-1` / `cov1-recall`, `cov1-win`, `cov1-model`** (Var(X)=E[X²]−E[X]²; SD = σ = spread) | **volatility σ as spread/standard deviation** | **retrieval** | **Assume-known:** σ is the standard deviation = spread around the mean. **Teach-fresh:** σ as an **annualized volatility input** that drives an option's value (more spread ⇒ more option value). Recall "SD = √Var = spread" before introducing σ; don't re-teach variance. |
| **`lesson-covariance-3` / `cov3-win`, `cov3-model`, `cov3-mastery`** (Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)) | **variance of a hedged position picks up a `2Cov` cross term** | **retrieval (high priority)** | **Assume-known:** the cross term — variances add cleanly *only* when Cov=0. **Teach-fresh:** minimizing a hedged portfolio's variance `Var(asset − h·hedge)` is the *motivation* for the hedge ratio and, later, delta. Open the hedging lesson (L5) by recalling the cross term, then minimize it. |
| **`lesson-covariance-5` / `cov5-win`, `cov5-mastery`** (optimal hedge ratio `h*=Cov/Var = −6/9 = −2/3`, dossier #13) | **the hedge ratio `h = Cov/Var`** | **retrieval (high priority) + "same method, different costume"** | **Assume-known:** `h*=Cov(A,B)/Var(B)` minimizes hedged variance (a single division, no ρ). **Teach-fresh:** the option **delta `Δ = ∂V/∂S`** *is* this hedge ratio in a new costume — the share count that makes a hedged book locally riskless, **re-struck each step** (dynamic). Interleave `cov5-win` (statistical h) with the option delta as one schema, two surfaces (§2.7). Caveat (mirrors `cov5` interaction-spec): the hedge already requires *selecting* the Cov/Var formula — keep the early options-hedge beat a guaranteed win, not the hardest type. |
| `lesson-covariance-4` / `cov4-interleave`, `cov4-recall` (ρ; **Cov=0 ⇏ independence**) | uncorrelated ≠ independent | **interleaving (light)** | **Assume-known.** Not central to options L1–L6. Optional discrimination foil only (e.g. "zero correlation between two legs does not make a spread riskless"). Reference; do not build a lesson around it. |
| **`lesson-combinatorics-3` / `l3-recall`, `l3-explore` (`pascalTriangle`), `l3-model` (C(n,k)), `l3-prove`** (binomial theorem; C(n,k) are the (a+b)ⁿ coefficients; row sum 2ⁿ) | **multi-step binomial-tree node weights `= C(n,k)`** | **retrieval (high priority)** | **Assume-known:** `C(n,k)` counts the size-k subsets / the number of up-down **paths** to a terminal node; Pascal symmetry; rows sum to 2ⁿ. **Teach-fresh:** those counts **weight risk-neutral probabilities** `C(n,k) q^k (1−q)^{n−k}` on the pricing tree. Open the tree lesson (L4) with `l3-recall`-style retrieval ("sum of Pascal row n = 2ⁿ", "C(n,k) counts size-k subsets"), then build the q-weighted tree fresh. |
| `lesson-combinatorics-2` / `l2-*` (nPk vs nCk) | order doesn't matter at a terminal node | **dedupe / supporting recall** | **Assume-known:** reaching a terminal node is an *unordered* count (nCk), the up-moves' order is irrelevant. Reference inside L4; no separate beat. |
| **`lesson-game-theory-1` / `l1-recall`, `l1-bet`, `l1-win`** (strict dominance; "a move best no matter what others do"; PD), schemaId `dominance-nash` | **no-arbitrage = "no free money" (a dominance/equilibrium flavor)** | **interleaving + retrieval (light)** | **Assume-known:** the *shape* of a dominant move / a stable, no-deviation equilibrium. **Teach-fresh:** the **no-arbitrage argument** — two portfolios with identical payoffs must have identical price, else a strictly dominant money-pump exists that markets compete away to equilibrium. Open the parity/bounds lesson (L2) by recalling `l1-recall`'s "best no matter what" pair, then reframe arbitrage as that money-pump. Light touch — analogy, not a dependency. |
| **`lesson-game-theory-1..4` / `payoffMatrix` widget (`PayoffMatrixBeat.tsx`)** | the word **"payoff"** | **FALSE-OVERLAP — flag & avoid** | **Not an overlap.** `payoffMatrix` is a **strategic bimatrix** (rows×cols = strategies, each cell a dual `(row,col)` payoff, tasks `dominance`/`bestResponse`). An **option payoff diagram** is a single-axis **payoff vs spot `S_T`** hockey-stick. **Do not reuse the widget**; options needs a NEW payoff-diagram interaction. Documented to pre-empt a build-time mis-reuse (the options analogue of covariance's `correlation.ts` autocorrelation false overlap). |
| **`lesson-game-theory-5` / `l5-recall`, `l5-win`, `l5-prove`** (schemaId **`backward-induction`**) + `lesson-markov-chains-5` (absorption / first-step), `lesson-optimal-stopping-4` (threshold/backward) | **the binomial tree is priced by backward induction (fold from expiry)** | **method-reuse retrieval + which-method gate** | **Assume-known (method):** `backward-induction` already exists in `methods.ts` (domains game-theory, optimal-stopping) — fold a tree from the end. **Teach-fresh (surface):** applying it to *discounted q-expectations* on a price tree. Build L4's which-method gate `correct = backward-induction`, distractors **exactly** `CONFUSABLE[backward-induction]` = `first-step-analysis`, `recursion-self-reference`, `threshold-rule` — genuine near-misses. Register the new finance domain on the existing id (Wave-0), don't mint a duplicate. |
| `lesson-pattern-hitting-times`, `lesson-markov-chains-*` (`first-step-analysis`, `recursion-self-reference`) | one-step pricing recursion (price_now = discounted q-average of up/down) | **interleaving (light, method-level)** | **Assume-known (method shape):** conditioning on the first step / self-reference. Use **as the foils** in L4's gate (the tree is *backward induction from expiry*, not forward first-step), not as a taught dependency. |
| `lesson-bayes-rule-*` (posterior update; reweighting hypotheses by likelihood) | "reweighted probabilities" surface resemblance to the risk-neutral q | **false-analogy — flag (no overlap)** | **Not an overlap.** The risk-neutral q is a **no-arbitrage change of measure**, **not** a Bayesian posterior. Flag explicitly so the misconception "q is just Bayes' updated p" is pre-refuted; interleave a Bayes "update with evidence" item against a "solve for q from no-arbitrage" item to force the discrimination (§2.7). |
| `lesson-optimal-stopping-*` (irrevocable stop; threshold rule) | American-option early exercise = an optimal-stopping problem | **out-of-scope forward link (note only)** | **Not converted** for L1–L6 (European focus). Note for a future "American options" lesson that optimal-stopping/`threshold-rule` is the recall hook; do not build it now. |
| **`lesson-binary-information-1..6`** (bits, ⌈log₂N⌉, base-3, XOR) | — | **none — confirmed no overlap** | Checked per brief: information bounds / bit tricks have **no** options content (no pricing, no payoffs). State explicitly so the boundary is documented. (Also note: this concept is **in-dev only** — dev + fixtures, not prod.) |

**Assume-known vs teach-fresh, distilled:**

- **ASSUME-KNOWN (recall, never re-teach):** `E[X]=Σx·P(x)` and "expectation = fair price of a bet"
  (EV L1 `ev1-*`); linearity of expectation (EV L2); variance / **SD = σ = spread** (Cov L1
  `cov1-*`); the variance-of-a-sum **`2Cov` cross term** (Cov L3 `cov3-*`); the **hedge ratio
  `h=Cov/Var`** (Cov L5 `cov5-*`); **`C(n,k)`/Pascal/binomial coefficients & row-sum 2ⁿ** (Comb
  L2/L3 `l2-*`/`l3-*`, `pascalTriangle`); **dominance / no-deviation equilibrium** (GT L1 `l1-*`,
  `dominance-nash`); **backward induction** as a method (GT L5 `l5-*`, OS L4; `methods.ts`
  `backward-induction`); first-step / recursion as confusable methods (PHT, Markov).
- **TEACH-FRESH (new to the entire corpus):** **option payoff functions** (long/short call & put,
  the hockey-stick **payoff diagram** — needs a NEW widget); intrinsic vs **time value**;
  **put-call parity**; **no-arbitrage bounds & the replication argument**; the **risk-neutral
  measure q** and **risk-neutral pricing = discounted E_q[payoff]**; **discounting / present value /
  the discount factor** (absent everywhere); the **one-step and multi-step binomial pricing model**;
  the **Greeks and their signs**; **delta as the dynamic hedge ratio `∂V/∂S`** (the costume change
  on `h=Cov/Var`); **σ as a volatility pricing input**. New engine + payoff-diagram + tree widgets
  are all greenfield.

---

## 3. Active-recall plan (learning science — inclusive-research-5)

Grounded in `audits/ideation/inclusive-research-5-progression-assessment.md` and
`learning-science.md` §2.5 (cold retrieval opener), §2.6 (expanding-gap spacing), §2.7
(interleaving confusable deep structure + `CONFUSABLE` foils). The corpus already ships the exact
machinery: every lesson opens with a graded `retrievalGrid` and closes with a generate-then-reveal
`recap`, and `lesson-states-streaks.json` is a working interleaved mixed-review checkpoint. **Clone
these; invent no new interaction types for recall.** Plan attaches to a proposed six-lesson arc
(Cartographer's skeleton; the Architect finalizes):

> **L1** Payoff diagrams (long/short call & put) · **L2** Put-call parity & no-arbitrage bounds ·
> **L3** One-step binomial: replication & the risk-neutral measure q · **L4** Multi-step binomial
> tree (backward induction + C(n,k) node weights) · **L5** Hedging & the Greeks (delta = the hedge
> ratio; σ) · **L6** Synthesis (cumulative interleaved capstone).

### (a) Retrieval warm-ups — one cold cued-recall opener per lesson (graded `retrievalGrid`/single-select)

Per §2.5 (testing effect) — each is genuine recall of a *prior* concept, not a primer:

- **L1 (Payoffs):** *"Recall: what is a fair bet worth?"* → `E[X]=Σx·P(x)` (fair die → 7/2),
  callback to `ev1-recall`/`ev1-win`. Bridge: "an option is a bet whose payoff bends at the strike —
  first, draw the payoff."
- **L2 (Parity & no-arbitrage):** *"A move that's best no matter what the opponent does is …?"* →
  "dominant" (direct recall of `lesson-game-theory-1` `l1-recall`). Bridge: "an arbitrage is a
  dominant money-pump — markets erase it, which *forces* prices."
- **L3 (Risk-neutral pricing):** *"State `E[X]` for a payoff over outcomes."* → `Σ x·P(x)` (recall
  `ev1-*`). Then the productive-failure twist (§2.12): "price = average payoff under the *real*
  odds?" → no: discounted average under **q**.
- **L4 (Binomial tree):** *"Sum of row n of Pascal's triangle = ? · `C(n,k)` counts ?"* → "2ⁿ /
  size-k subsets" (recall `lesson-combinatorics-3` `l3-recall`, `l3-explore`). Then build node weight
  `C(n,k) q^k(1−q)^{n−k}`. **Plus the which-method gate** (below).
- **L5 (Hedging & Greeks):** *"State `Var(X+Y)` for two variables · what is the hedge ratio `h*`?"* →
  "`Var(X)+Var(Y)+2Cov(X,Y)` / `h*=Cov/Var`" (recall `cov3-win`, `cov5-win`; `−6/9=−2/3`). Bridge:
  "delta is that same `h` — re-struck every step." Also recall σ = SD = spread (`cov1`).
- **L6 (Synthesis):** cumulative cold retrieval mixing payoff, parity, q-pricing, tree, and delta —
  unlabeled (see capstone).

### (b) Interleaving pairs — which prior CONFUSABLE concept mixes into which options lesson, and why

Per §2.7 (interleave **confusable** categories only; `CONFUSABLE` foils, never random):

- **`backward-induction` × `first-step-analysis` / `recursion-self-reference` → L4 which-method
  gate.** The single highest-value interleave: the tree is *folded from expiry* (backward
  induction), **not** forward first-step or naive recursion. Foils are **exactly**
  `CONFUSABLE[backward-induction]` from `methods.ts`. Label-stripped prompt; `gate.correct =
  backward-induction = schemaId`.
- **Risk-neutral q × real-world p (EV) — and × Bayesian posterior (Bayes) → L3.** The #1 options
  misconception is "q = the real probability" (and the secondary "q = Bayes-updated p"). Interleave
  an EV "expected payoff under p" item, a Bayes "update p with evidence" item, and a "solve q from
  no-arbitrage" item so the learner sorts **physical vs risk-neutral vs posterior** by hand.
- **Hedge ratio `h=Cov/Var` (Cov L5) × option delta `∂V/∂S` (new) → L5.** The "same method,
  different costume" comparison (§2.7): a `retrievalGrid`/compare beat pairing the statistical
  min-variance hedge with the option delta — one schema (a risk-cancelling ratio), two surfaces.
- **No-arbitrage/dominance (GT L1) × option mispricing → L2.** Interleave a "find the dominant
  strategy" game item with a "find the arbitrage" pricing item — both are "spot the strictly-better
  free move."
- **Path-count `C(n,k)` (Comb) × node risk-neutral probability → L4.** Interleave a pure "count the
  up-down paths to this node = `C(n,k)`" item with a "probability of this node = `C(n,k)q^k(1−q)^{n−k}`"
  item, so counting and weighting stay distinct.

### (c) Spaced re-surfacing — load-bearing prior results recur at expanding gaps

Per §2.6 (the unlock order *is* the spacing schedule). Each prior result re-surfaces across the
options arc at growing gaps, then once more in the capstone:

```
E[X]=Σx·P(x) / "fair price of a bet"   (EV L1, ev1-*)
        → L1 opener (an option is a bet to price)          [gap: cross-domain]
        → L3 risk-neutral pricing = discounted E_q[payoff] [gap: +2]
        → L6 capstone                                       [gap: +3]
C(n,k) / Pascal row-sum 2ⁿ             (Comb L2/L3, l3-*)
        → L4 tree node weight C(n,k)q^k(1−q)^{n−k}          [gap: cross-domain]
        → L6 capstone
Var(X+Y) cross term + hedge h=Cov/Var   (Cov L3/L5, cov3-*/cov5-*)
        → L5 delta = the dynamic hedge ratio                [gap: cross-domain]
        → L6 capstone
backward induction                      (GT L5 / OS L4; methods.ts)
        → L4 which-method gate (vs first-step / recursion)  [gap: cross-domain]
        → L6 capstone
dominance / "no free move"              (GT L1, l1-*)
        → L2 no-arbitrage opener                            [gap: cross-domain]
        → L6 capstone
σ = SD = spread                         (Cov L1, cov1-*)
        → L5 volatility input                               [gap: cross-domain]
```

**Cumulative interleaved capstone (L6) — clone `lesson-states-streaks.json`'s mixed-review design.**
A single checkpoint that mixes payoff-reading, parity/no-arbitrage, q-pricing, backward-induction
tree, and delta-hedging **unlabeled** (states-streaks: *"mix waiting, racing, and walking so you can
tell the tools apart the way a real problem arrives — unlabeled"*; *"Interleaving > blocking. You
practice discriminating."*). Mirror its beat shape: graded `retrievalGrid` discrimination beats +
`masteryChallenge`, **every graded beat schemaId-tagged**, a held-out transfer (`heldOut:true,
track:'B', required:false`) before the mastery challenge. **No scheduler** — the unlock order plus
this one capstone *is* the spacing (consistent with §6.4 of the research doc).

---

## Appendix — sources read for this report

**Live Firestore (Firebase MCP, read-only):** `firestore_list_databases` (prod `brilliant-org`,
dev `brilliant-org-dev`); `firestore_list_collections` (`courses`, `lessons`, `users`);
`firestore_query_collection` on prod `courses` (`status==live` → 8 docs; `courseId IN
[course-options, course-binary-information]` → empty; `status!=live` → empty; `domain IN
[Finance, Quantitative Finance]` → empty; `courseId==course-options` lessons → empty);
`firestore_list_documents` on dev `courses` (9 docs, incl. `course-binary-information`).

**Fixtures (branch `concept/options`):** course inventories `course-pattern-hitting-times`,
`course-expected-value`, `course-markov-chains`, `course-bayes-rule`, `course-covariance`,
`course-combinatorics`, `course-optimal-stopping`, `course-game-theory`, `course-binary-information`.
Lesson fixtures read in full: `lesson-game-theory-1.json`, `lesson-combinatorics-3.json`. Lesson
fixtures inspected via targeted grep (beatIds/schemaIds/keywords): `lesson-expected-value-1`,
`lesson-covariance-1/-2/-3/-4/-5`, `lesson-combinatorics-2`, `lesson-game-theory-5`,
`lesson-states-streaks`, plus a corpus-wide grep of all `lesson-*.json` for option/payoff/
no-arbitrage/risk-neutral/discount/binomial/pascal/hedge/backward-induction.

**Source/registry:** `src/content/methods.ts` (method ids + `CONFUSABLE` map),
`concepts/covariance/source-dossier.md` (hedge ratio #13), `concepts/covariance/concept-brief.md`,
`concepts/covariance/lesson-covariance-5/{brief,interaction-spec}.md`, `src/lesson/beats/`
(`PayoffMatrixBeat.tsx` — false-overlap confirmation). Confirmed **no** `src/engine/option*`,
`binomial*`, or `payoff*` module exists.

**Learning science:** `.cursor/skills/lesson-factory/learning-science.md` §2.5/§2.6/§2.7;
`.cursor/skills/lesson-factory/artifacts.md` §2; `audits/ideation/inclusive-research-5-progression-assessment.md`.
Format mirrors the exemplar `concepts/covariance/continuity-report.md`.
