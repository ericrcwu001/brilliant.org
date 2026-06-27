# Continuity Report — "Covariance & Correlation" (slug `covariance`, `course-covariance`, domain Probability)

> **Survey basis — MCP absent.** The Firebase MCP is **not connected** in this environment.
> This entire report is built from **git + fixtures on branch `main`** in the read-only main
> checkout (`/Users/ericwu/Developer/brilliant.org/fixtures/`). No live corpus, no Firestore
> reads. Branches `concept/markov-chains`, `cursor/game-theory-lessons-c79f`, and
> `cursor/optimal-stopping-acc4` exist but were **not** consulted; `main`'s fixtures are treated
> as the shipped corpus per the brief. Every lessonId, title, and beatId quoted below was read
> directly from the fixture named beside it.

---

## Executive summary

- **Top 3 overlaps (all Expected Value):** (1) **product rule `E[XY]=E[X]E[Y]` vs sum rule** is
  *already explicitly taught* in `lesson-expected-value-2.json` (`ev2-model`, `ev2-sum-primer`) —
  the exact hinge covariance pivots on → **retrieval, never re-teach**; (2) **`E[X]=Σx·P(x)` /
  weighted-average / balance-point** owned by `lesson-expected-value-1.json` → recall chip;
  (3) **independence** taught in `lesson-bayes-rule-3.json`, `lesson-expected-value-2.json`,
  `lesson-markov-chains-1.json` → assume-known, but teach-fresh the converse trap.
- **The one boundary that matters most:** the corpus teaches expectation of a *single* variable
  and of a *sum*, and `E[XY]=E[X]E[Y]` **only as a fact about independence**. It teaches **nothing**
  about how two variables co-move. **Variance, standard deviation, `Cov(X,Y)=E[XY]−E[X]E[Y]`, the
  correlation coefficient ρ, and joint pmfs are TEACH-FRESH.** (`variance` occurs only as a
  "next up" teaser in `ev6-recap`; `covariance`/`correlation` occur nowhere except the unrelated
  string-overlap "autocorrelation" in pattern-hitting.)
- **Highest-value conversion:** `lesson-expected-value-6.json`'s recap ends *"Variance — the spread
  — is next… how spread varies."* Covariance is the *designed* successor — open by **retrieving**
  that promise, not re-deriving E[X].
- **Reuse, don't reinvent:** every EV lesson already opens with a graded `retrievalGrid` and closes
  with a generate-then-reveal `recap`; `lesson-states-streaks.json` is a shipped interleaved
  mixed-review checkpoint. Clone these per `inclusive-research-5-progression-assessment.md`.

---

## 1. Existing corpus surveyed

7 shipped concepts, all `status: "live"`. Lesson inventory pulled from the `course-*.json` and
`lesson-*.json` fixtures actually read. Headline glyphs/symbols are from each fixture's
`glyphKey` / `introducesSymbol` fields.

| Concept (courseId) | Domain / order | Lessons (lessonId → title) [source fixture] |
|---|---|---|
| **Pattern Hitting Times** (`course-pattern-hitting-times`) | Probability, order 0 | `lesson-first-heads` → *Watch the First Heads* (E[H]=2, optional warm-up); `lesson-pattern-hitting-times` → *Pattern Hitting Times* (E[HH]=6 vs E[HT]=4); `lesson-penneys-game` → *Penney's Game*; `lesson-gamblers-ruin` → *Gambler's Ruin* (P(ruin)=i/N); `lesson-states-streaks` → *Mixed Review & Streaks* (interleaved checkpoint); `lesson-longer-patterns` → *Longer Patterns & Overlap* (THH/HTH); `lesson-overlap-shortcut` → *The Overlap Shortcut* (E=Σ2^L). [`course-pattern-hitting-times.json` + the 7 lesson fixtures] |
| **Expected Value** (`course-expected-value`) — **closest neighbor** | Probability, order 1 | `lesson-expected-value-1` → *What is Expected Value?* (E[X]=Σx·P(x), fair die = 7/2); `lesson-expected-value-2` → *Linearity of Expectation* (E[X+Y]=E[X]+E[Y]; **product-vs-sum rule**); `lesson-expected-value-3` → *Indicator Variables* (E[1_A]=P(A)); `lesson-expected-value-4` → *Conditional & Total Expectation* (E[X]=Σ E[X\|case]P(case)); `lesson-expected-value-5` → *Coupon Collector* (N·H_N from geometric waits); `lesson-expected-value-6` → *Order Statistics & Extremes* (E[max]=n/(n+1)). [`course-expected-value.json` + 6 lesson fixtures] |
| **Bayes' Rule** (`course-bayes-rule`) | Probability, order 3 | `lesson-bayes-rule-1` *The Update Rule*; `-2` *The Base-Rate Trap*; `-3` *Stacking Evidence* (**independent evidence multiplies**); `-4` *Which Hypothesis?*; `-5` *The Host's Clue* (Monty); `-6` *The Question Behind the Clue*; `-7` *Reading Evidence Backwards* (P(E\|H)≠P(H\|E)); `-8` *Base Rates in the Wild*. [`course-bayes-rule.json` + grep of lesson fixtures] |
| **Markov Chains** (`course-markov-chains`) | Probability, order 2 | `lesson-markov-chains-1` *The Markov Property* (**"memoryless ≠ independent"**); `-2` *The Transition Matrix*; `-3` *Multi-Step Transitions* (Pⁿ); `-4` *Classifying States*; `-5` *Hitting Times & Absorption*; `-6` *The Stationary Distribution* (πP=π); `-7` *Convergence*; `-8` *Reversibility & Detailed Balance*; `-9` *PageRank*; `-10` *Markov in the Wild*. [`course-markov-chains.json`] |
| **Optimal Stopping** (`course-optimal-stopping`) | Combinatorics & Games, order 1 | `lesson-optimal-stopping-1` *No Going Back* (1/n); `-2` *Look, Then Leap*; `-3` *The 37% Rule* (1/e); `-4` *Why 37% Works*; `-5` *Stopping in the Wild*. [`course-optimal-stopping.json`] |
| **Game Theory** (`course-game-theory`) | Combinatorics & Games, order 2 | `lesson-game-theory-1` *Dominance & the Prisoner's Dilemma*; `-2` *Nash Equilibrium*; `-3` *Mixed Strategies*; `-4` *Zero-Sum & Minimax*; `-5` *Sequential Games & Backward Induction*; `-6` *Winning Strategies: Nim & Symmetry*. [`course-game-theory.json`] |
| **Combinatorics** (`course-combinatorics`) | Combinatorics & Games, order 0 | `lesson-combinatorics-1` *The Counting Principle* (**independent choices multiply**); `-2` *Permutations & Combinations* (nPk, nCk); `-3` *The Binomial Theorem*; `-4` *Inclusion–Exclusion* (\|A∪B\|); `-5` *The Pigeon Hole Principle*; `-6` *Counting Probabilities* (P=favorable/total). [`course-combinatorics.json`] |

**Corpus-wide search for covariance-adjacent ideas** (grep across all `lesson-*.json` on `main`):

- `variance` → **one hit only**: `lesson-expected-value-6.json`, in the `ev6-recap` feedback line
  *"Variance — the spread — is next."* It is **announced, never taught.**
- `standard deviation` / `std dev` / SD → **zero hits.** Not taught anywhere.
- `covariance` / `correlation` → hits **only** in `lesson-longer-patterns.json` and
  `lesson-overlap-shortcut.json`, both in `autocorrelationRuler` / "Guibas–Odlyzko correlation set"
  interviewNotes. This is **string self-overlap** (combinatorics on patterns), **not** statistical
  covariance/correlation — *no conceptual overlap with the new concept.*
- `E[XY]` / "product rule" → `lesson-expected-value-2.json` (the sum-vs-product warning) and
  `lesson-combinatorics-1.json` ("independent choices multiply"). These are the only places the
  *product of two variables / independence-multiplication* idea is touched.
- `joint` distribution → `lesson-expected-value-2.json` only ("add the dice averages without
  touching the joint distribution"; "no joint distribution needed") — joint pmfs are *named and
  side-stepped*, never constructed.

**Conclusion of the survey:** the new concept sits in a genuine gap. Everything covariance *builds
on* (expectation, linearity, independence, counting joint outcomes) is shipped; everything
covariance *is* (variance, the covariance formula, ρ, joint pmfs, scatter/co-movement) is absent.

---

## 2. Overlap analysis

Verdicts: **dedupe** = reference the prior result, do NOT re-teach; **retrieval / spaced-review /
interleaving** = convert the overlap into an active-recall or discrimination beat.

| Existing lesson / beat | Overlapping idea | Verdict | Action — assume-known vs teach-fresh |
|---|---|---|---|
| `lesson-expected-value-1` / `ev1-model`, `ev1-explore` (the `expectationScale` balance beam) | **E[X]=Σx·P(x)**, the "balance point," weighted average | **retrieval** | **Assume-known:** the definition and the balance-point intuition. **Teach-fresh:** that the *spread around* that balance point (variance) and the *joint* balance of two variables (covariance) are new objects. Open Covariance L1 with a `retrievalGrid` chip "E[fair die] → 7/2" (mirrors `ev1-recall`). Do **not** re-explain weighted averages. |
| `lesson-expected-value-1` / `ev1-primer` ("Weighted averages" primer) | weighted average = Σ value·weight | **dedupe** | **Assume-known.** Reference only; covariance reuses the identical Σ-weighting machinery for `E[XY]`. A primer here would be redundant for any learner who finished EV (expertise-reversal risk, §2.10 of the research doc). |
| **`lesson-expected-value-2` / `ev2-model` (triplet "⚠️ Product Rule" card) + `ev2-sum-primer`** | **`E[XY]=E[X]E[Y]` holds *only* under independence; sum rule always holds** | **retrieval** (highest priority) | **THE hinge.** **Assume-known:** that `E[XY]=E[X]·E[Y]` requires independence — this is *already taught explicitly here.* **Teach-fresh:** the *gap* `E[XY]−E[X]E[Y]` is itself a measurable quantity = **Cov(X,Y)**, nonzero exactly when the product rule fails. Open the covariance-defining lesson by retrieving "When does E[XY]=E[X]E[Y]?" → answer "only if independent," then reveal: "the leftover is what we'll name covariance." Re-teaching the product rule would waste the corpus's best setup. |
| `lesson-expected-value-2` / `ev2-recall`, `ev2-win`, `ev2-prove` (linearity, dependence-free; "without touching the joint distribution") | **E[X+Y]=E[X]+E[Y]**, dependence-free | **dedupe** | **Assume-known.** Reference when deriving `Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)` — the contrast ("linearity needed no independence, but *variance of a sum* does pick up a cross term") is a teach-fresh punchline that *leans on* the dedup'd linearity fact. |
| `lesson-expected-value-2` (joint distribution *named but skipped*) | **joint pmf of (X,Y)** | **teach-fresh (not overlap)** | EV deliberately avoids joint distributions ("no joint distribution needed"). Covariance **must teach the joint pmf fresh** — it is the first concept in the corpus that genuinely needs the table P(X=x, Y=y). Flag in continuity: this is *new*, not a recall. |
| `lesson-expected-value-3` / `ev3-model`, `ev3-indicator-primer` (E[1_A]=P(A); count=Σ indicators) | indicator variables; E of a 0/1 variable | **interleaving** (light) | **Assume-known.** Optional reuse: covariance of two indicators `Cov(1_A,1_B)=P(A∩B)−P(A)P(B)` is a clean worked example that *interleaves* indicators (EV L3) with the new covariance formula — a discrimination win, not a dependency. Use only as an optional "go-deeper"/interview beat. |
| `lesson-expected-value-4` / `ev4-model` (Law of Total Expectation; explicit *"conditioning ≠ Bayes"*) | conditional expectation E[X\|case] | **dedupe** | **Assume-known.** Covariance L's may use E[X\|Y] when motivating regression-to-the-mean / conditional means, but should reference, not re-derive. Preserve EV's own boundary note ("averaging over cases ≠ belief-updating"). |
| `lesson-expected-value-6` / `ev6-recap` (*"Variance — the spread — is next… how spread varies"*) | **variance / spread** | **retrieval + spaced-review (the designed hand-off)** | **Teach-fresh:** variance and SD are *not taught* — EV only promises them. The very first covariance lesson should retrieve this promise ("EV ended by saying *spread* comes next — here it is") to create a spaced callback across the EV→Covariance seam (§2.6 spacing). Variance(X), SD, and the variance-of-a-sum cross term are all **teach-fresh**. |
| `lesson-bayes-rule-3` / `bayes3-*` ("independent evidence multiplies"; "the next flip is independent") | **independence** | **interleaving** | **Assume-known:** the *meaning* of independence and that independent things multiply. **Teach-fresh — critical converse trap:** **independence ⇒ Cov=0, but Cov=0 ⇏ independence.** Interleave a Bayes-style "are these independent?" item with a covariance item so the learner discriminates "uncorrelated" from "independent" (a classic misconception). |
| `lesson-markov-chains-1` / `mc1` (*"Memoryless ≠ independent"*) | independence vs dependence framing | **interleaving** (light) | **Assume-known.** Useful contrast source: Markov already drills "dependence is not absence-of-structure." Covariance can reuse this framing to motivate "dependence has a *sign and magnitude* — that's what covariance measures." Reference, don't re-teach. |
| `lesson-markov-chains-6` (stationary π), `-2/-3` (transition matrix, Pⁿ) | "joint" / matrix structure | **dedupe (no real overlap)** | Stationary distributions and transition matrices are a *different* notion of joint behavior (over time, one variable). Covariance's joint pmf is over *two variables at one time*. No retrieval value; note in continuity only to pre-empt a false-overlap claim. |
| `lesson-combinatorics-1` / `comb1-*` ("independent choices multiply"; counting sequences) + `lesson-combinatorics-6` (P=favorable/total) | counting to build a pmf; multiply independent choices | **retrieval** (supporting) | **Assume-known:** how to count outcomes and turn counts into probabilities — exactly the skill needed to *fill a joint pmf table* `P(X=x,Y=y)`. Open the joint-pmf lesson with a one-line combinatorics recall ("P = favorable/total"), then teach the 2-D table fresh. |
| `lesson-combinatorics-4` (Inclusion–Exclusion, \|A∪B\|=\|A\|+\|B\|−\|A∩B\|) | "+ correction term for overlap" structural analogy | **interleaving** (optional, analogy only) | **Assume-known** as a *shape* analogy: `Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)` has the same "sum of parts plus a correction for how they overlap" silhouette as inclusion–exclusion. Purely an optional intuition hook — **not** a mathematical dependency; do not imply they are the same theorem. |
| `lesson-gamblers-ruin` / `gr` ("each flip is independent — no 'due'"), `lesson-first-heads` ("coin has no memory") | independence of repeated trials | **dedupe** | **Assume-known.** No covariance content; these reinforce the independence intuition the converse-trap teach-fresh beat will exploit. Reference at most. |
| **Game Theory, Optimal Stopping** (`course-game-theory.json`, `course-optimal-stopping.json`) | independence/expectation reuse | **none — confirmed no overlap** | Checked per brief: Game Theory L4 uses "independently enforce" (strategic, not statistical independence); Optimal Stopping uses 1/n, 1/e expectations but no two-variable co-movement. **No covariance overlap; nothing to convert.** State explicitly so the boundary is documented. |

**Assume-known vs teach-fresh, distilled:**

- **ASSUME-KNOWN (recall, never re-teach):** E[X]=Σx·P(x) and the balance-point picture (EV L1);
  linearity E[X+Y]=E[X]+E[Y] (EV L2); the product rule `E[XY]=E[X]E[Y]` *and its independence
  precondition* (EV L2 — already taught); E[1_A]=P(A) (EV L3); conditional/total expectation
  (EV L4); independence's meaning and "independent ⇒ multiply" (Bayes L3, Combinatorics L1);
  counts → probabilities (Combinatorics L1, L6).
- **TEACH-FRESH (new to the entire corpus):** variance Var(X) and standard deviation; the **joint
  pmf** table P(X=x,Y=y); **`Cov(X,Y)=E[XY]−E[X]E[Y]`** and its sign/meaning (co-movement);
  `Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)`; the **correlation coefficient** ρ=Cov/(σ_Xσ_Y) and its
  [−1,1] bound; scatter/linear-relationship intuition; and the **converse trap** Cov=0 ⇏
  independence.

---

## 3. Active-recall plan

Grounded in `audits/ideation/inclusive-research-5-progression-assessment.md`. The corpus already
ships the exact machinery this plan needs — every EV lesson opens with a graded `retrievalGrid`
recall beat (`ev1-recall`…`ev6-recall`), closes with a generate-then-reveal `recap`, and
`lesson-states-streaks.json` is a working interleaved mixed-review checkpoint. **Clone these
patterns; do not invent new interaction types.**

### (a) Retrieval warm-ups — one-line cued-recall openers (one per covariance lesson)

Per §2.5 (testing effect: 61% vs 40% at 1 week) and §4.2 ("make every L2+ lesson open with a
retrieval warm-up"). Each is a graded `retrievalGrid`/single-select, mirroring `ev2-recall`:

- **Cov-L1 (Variance / spread):** *"Recall E[X] for a fair die."* → 7/2 (callback to
  `ev1-win`/`ev1-recall`). Then: *"EV's last lesson said one thing was 'next' — what?"* → "the
  spread (variance)" (spaced callback to `ev6-recap`). This stitches the EV→Covariance seam.
- **Cov-L (Covariance defined):** *"State when `E[XY]=E[X]E[Y]` is allowed."* → "only when X,Y are
  independent" (direct retrieval of `ev2-model`'s ⚠️ Product Rule card). Then spring: "so what is
  `E[XY]−E[X]E[Y]` when they're *not*?"
- **Cov-L (Variance of a sum):** *"State linearity of expectation."* → "E[X+Y]=E[X]+E[Y], always"
  (retrieval of `ev2-recall`/`ev2-win`). Then contrast: "does the *variance* of a sum add as
  cleanly?" (productive-failure bet, §2.12).
- **Cov-L (Correlation ρ):** *"Recall: covariance has units of X×Y."* (from the prior covariance
  lesson) → motivates the unit-free ρ.
- **Cov-L (Joint pmf / counting):** *"P(event) = ?"* → "favorable / total" (retrieval of
  `lesson-combinatorics-6`) before building the 2-D joint table.

### (b) Interleaving pairs — which prior concept to mix into which covariance lesson, and why

Per §2.7 (mixed practice 63% vs 20% blocked; interleaving builds *discrimination*). Pair each new
covariance idea with the prior concept it is most *confused with*:

- **Independence (Bayes L3 / Markov L1) × Covariance-defined lesson.** The headline discrimination:
  **uncorrelated ≠ independent.** Interleave a Bayes-style "independent? multiply the likelihoods"
  item with a "Cov=0 but dependent" counterexample so the learner sorts the two by hand. This is
  the single most valuable interleave — it attacks the #1 covariance misconception directly.
- **Product rule vs sum rule (EV L2) × Variance-of-a-sum lesson.** Mix items where the sum rule
  applies dependence-free against items where the variance cross term `2Cov` appears — forcing the
  learner to discriminate "expectations always add" from "variances only add when Cov=0."
- **Indicators (EV L3) × Covariance worked example.** Interleave `Cov(1_A,1_B)=P(A∩B)−P(A)P(B)`
  with plain `E[1_A]=P(A)` recall so indicators are re-exercised in a two-variable setting.
- **Counting / joint pmf (Combinatorics L1, L6) × Joint-distribution lesson.** Interleave a
  one-variable "count the outcomes → P" item with a two-variable joint-cell item.

### (c) Spaced re-surfacing — which prior results reappear later in the covariance arc

Per §2.6 (optimal gap grows with retention interval) — the unlock order *is* the spacing schedule,
exactly as the research doc models for PHT (§6.4). Re-surface each load-bearing prior result at
expanding gaps across the covariance arc:

```
E[X]=Σx·P(x)            (EV L1)  → recalled at Cov-L1 opener        [gap: across-course]
                                 → reused when computing E[XY]      [gap: +1 lesson]
Product rule E[XY]=E[X]E[Y] req. independence  (EV L2)
                                 → opener of the Cov-defining lesson [gap: across-course]
                                 → re-surfaced in the ρ lesson (Cov=0 case)  [gap: +2]
Linearity E[X+Y]=E[X]+E[Y]      (EV L2)
                                 → contrasted in Var-of-a-sum lesson [gap: across-course]
                                 → re-surfaced in the covariance capstone (the 2Cov cross term)
Independence (Bayes L3 / Markov L1 / Combinatorics L1)
                                 → interleaved in the Cov-defining lesson
                                 → re-surfaced as the converse-trap in the capstone
"Variance is next" promise      (EV L6 recap)
                                 → cashed in at the very first covariance lesson
```

Implement purely as the standard retrieval-opener beat per lesson + one cumulative
interleaved capstone checkpoint (cloned from `lesson-states-streaks.json`'s mixed-review design) —
no scheduler needed, consistent with §6.4 of the research doc.

---

## Appendix — fixtures read for this report (all on `main`, read-only)

Course fixtures: `course-expected-value.json`, `course-bayes-rule.json`, `course-combinatorics.json`,
`course-markov-chains.json`, `course-optimal-stopping.json`, `course-game-theory.json`,
`course-pattern-hitting-times.json`.
Lesson fixtures read in full: `lesson-expected-value-1.json`, `-2`, `-3`, `-4`, `-6`
(`-5` summarized via grep). Lesson fixtures inspected via targeted grep: `lesson-expected-value-5.json`,
`lesson-bayes-rule-3.json`, `lesson-markov-chains-1.json`, `lesson-markov-chains-6.json`,
`lesson-combinatorics-1.json`, `lesson-game-theory-4.json`, `lesson-gamblers-ruin.json`,
`lesson-first-heads.json`, `lesson-longer-patterns.json`, `lesson-overlap-shortcut.json`, plus a
corpus-wide grep of all `lesson-*.json` for variance/SD/covariance/correlation/independence/
joint/E[XY].
Research doc: `audits/ideation/inclusive-research-5-progression-assessment.md`.
