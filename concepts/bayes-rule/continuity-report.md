# Continuity Report — concept-bayes-rule

Survey of the shipped + planned corpus before the Bayes' Rule Concept Brief is finalized. Goal: never
re-teach covered ground; convert every conceptual overlap into deliberate **retrieval practice, spaced
review, or interleaving** (`inclusive-research-5`). Bayes is a **new tool** (belief update), largely
orthogonal to the corpus's state-machine spine — so the overlaps are about *probability literacy*
(probability-as-a-split, exact fractions, independence), not about the Bayes mechanic itself.

## Existing corpus surveyed

- **shipped (main + prod `brilliant-org`)** — one live concept, `course-pattern-hitting-times`
  (domain Probability, order 0, status `live`), 7 built lessons:
  - `lesson-first-heads` — optional on-ramp: flip to the first heads, E[H] = 2 (geometric wait).
  - `lesson-pattern-hitting-times` — flagship: E[HH] = 6 vs E[HT] = 4 via states → recurrence → solve.
  - `lesson-penneys-game` — two patterns race one stream; **win-probability** (absorption), 7:1
    second-mover edge; the **"who's first is not how long"** / **"a win-chance has no +1, just a split"**
    distinction; non-transitive `dominanceWheel`.
  - `lesson-gamblers-ruin` — same first-step machine on a number line: **P(ruin) = i/N**
    (a probability recurrence, "no +1"), duration i(N−i); **gambler's-fallacy primer ("never due")**.
  - `lesson-states-streaks` — interleaved mixed-review checkpoint (waiting vs racing vs walking,
    unlabeled) — the corpus's template for interleaving.
  - `lesson-longer-patterns` — transfer to THH vs HTH (E = 8, 10).
  - `lesson-overlap-shortcut` — capstone: E[wait] = Σ 2^(overlap) via a fair-game martingale.
- **in-dev (open `concept/*` branches + dev `brilliant-org-dev`)** — five `coming_soon` course stubs
  with **zero built lessons** (empty `lessons[]`/`roadmap[]`): `course-expected-value` (order 1),
  `course-markov-chains` (order 2), `course-bayes-rule` (order 3 — this concept), and (other domain)
  `course-combinatorics`, `course-optimal-stopping`, `course-game-theory`. None ship lessons yet, so
  there is **no built lesson to dedupe against** outside Pattern-Hitting-Times.

sources: `fixtures/lesson-*.json` + `fixtures/course-*.json` on `concept/bayes-rule` (identical to
`main`). Firestore `lessons/*` + `courses/*` (dev + prod) cross-check is the Corpus Cartographer's
Firebase-MCP step at concept kickoff; from the fixtures, only `course-pattern-hitting-times` is `live`
with built lessons, so this report treats those 7 as the dedupe surface.

## Overlap analysis

| existing lesson / beat | overlapping idea | verdict | action |
|------------------------|------------------|---------|--------|
| `lesson-penneys-game` / `win-prob-tiles`, `prob-vs-duration` | "A win-CHANCE is not a wait-TIME — **no +1, just a split**" | **reuse-as-recall** | Open **L1** with a graded `retrievalGrid` recalling "a probability splits between outcomes." Bayes extends it: a probability can also be **revised by evidence** (posterior ∝ prior × likelihood). No re-teach of the distinction — it's the springboard. |
| `lesson-gamblers-ruin` / `prob-tiles`, `guided-solve`, `mastery-challenge` | Probabilities computed as **exact fractions** (P = i/N = 3/10; 1/2); `answerEntry`/`masteryChallenge` accept-lists | **reuse-as-recall** | Inherit the fraction-fluency UX wholesale (every Bayes answer is an exact rational: 2/3, 1/2, 1024/2023). L1 retrieval reactivates "a probability is a clean fraction," so the Bayes posteriors land on familiar ground. |
| `lesson-gamblers-ruin` / `gamblers-fallacy` primer ("you're never due"; coin has no memory) | **Independence** of fair flips | **reuse-as-recall + interleave** | **L3** interleaves it as a sharp contrast (`comparison: true`): "never due" updates a *future outcome* (fallacy); Bayes updates *which hypothesis you hold* (legitimate). Same independent flips, two different objects — the contrast is the lesson, not a re-teach. |
| `lesson-penneys-game` / `recall-6-4`, `first-step-split`; `lesson-gamblers-ruin` / `recall-overlap`, `boundary-edge` | **Conditioning on "what happens next"** (first-step / law-of-total-probability flavor) | **reuse-as-recall** | Bayes' denominator P(E) = Σ P(E|Hᵢ)P(Hᵢ) is the same "split by cases and weight" move learners already do in first-step analysis. L1/L2 name it (law of total probability) and point back, rather than re-deriving case-splitting from scratch. |
| `lesson-pattern-hitting-times` (+ `lesson-longer-patterns`, `lesson-overlap-shortcut`) | **States → recurrence → solve** (the KMP/automaton spine) | **dedupe (orthogonal — do NOT import)** | Bayes deliberately uses a **different tool**: no state graph, no E[T] solve. Acknowledge once in L1's framing ("you've been timing processes; now you'll *weigh hypotheses*") and move on. Zero re-teach; zero borrowed machinery. |
| `lesson-overlap-shortcut` (martingale "fair game ⇒ money in = money out"); `course-expected-value` (stub) | **Weighted average of outcomes** | **reuse-as-recall (light) + forward-link** | The Bayes normalizer is a weighted average of likelihoods; nod to it, but `course-expected-value` ships no lessons, so there is nothing to dedupe — note the forward-link for the Architect, don't build EV here. |
| `lesson-states-streaks` (interleaved mixed-review design) | **Interleaving pattern** (mixed, unlabeled tools) | **reuse-as-pattern** | Copy its *design*, not its content: L3's mastery mixes a coin-sequence update with a disease re-test so the learner must pick the move (multiply LRs) without a label. |

## Active-recall plan (learning science — `inclusive-research-5`)

- **retrieval warm-ups (graded openers, the guaranteed early win):**
  - Penney's/Gambler's *"a probability splits — no +1"* → **L1 opener** (`retrievalGrid`: match
    "a win-chance" → "a split, no +1" / "a wait-time" → "+1 each flip"). Reactivates probability-as-a-fraction.
  - **L1 headline** (posterior = 2/3) → **L2 opener** (`retrievalGrid`: "evidence rescales the prior";
    "a rare hypothesis starts low").
  - **L2 headline** (one 99% test on a 1%-rare disease → only 50%) → **L3 opener**.
- **interleaving (confusable pairs, mixed mid-lesson):**
  - Gambler's-fallacy **"never due"** ⇄ Bayes **"each head IS evidence"** → **L3** `comparison` primer +
    a mixed mastery (`bayes-rule-3` `mastery-challenge`): independence of the *next flip* vs updating the
    *hypothesis*.
  - **"probability vs time"** (Penney's/Gambler's) ⇄ **"prior vs posterior"** (Bayes): both are
    splits, but Bayes *re-weights* the split after evidence → woven into L1 `model` beats.
- **spaced re-surfacing:**
  - **Exact-fraction posteriors** recur at every gap: L1 (2/3, 4/5), L2 (1/2, 1024/2023, 19/118),
    L3 (2ᵏ/(2ᵏ+999), crosses ½ at k = 10) — echoing PHT's 7/8 and i/N, each a few lessons apart.
  - **Base rate / prior odds** introduced L2, re-surfaced L3 as the thing likelihood ratios must
    overcome (prior odds × likelihood ratio) — the concept's one through-line, spaced across two lessons.

## Addendum — how L4–L8 recall/interleave L1–L3 (8-lesson expansion)

The expansion adds **no new external corpus to dedupe against** (the in-dev survey above is unchanged —
PHT is still the only other live concept). The job is purely *internal*: each new lesson opens with a
**graded retrieval of a prior Bayes lesson** (every opener recalls at least one of L1–L3) and **never
re-teaches** the rule — it stresses it where intuition breaks. No L4–L8 beat re-derives prior × likelihood
or the base-rate trap; those are recalled and re-applied.

**Retrieval warm-ups (graded openers — the guaranteed early win):**
- **L1 headline** (rescale by likelihood, renormalize) → **L4 opener** (`recall-update-rule`),
  generalized to N hypotheses.
- **L4 + L1** (N-way update; likelihood = how well each hypothesis predicts the evidence) → **L5 opener**
  (`recall-n-update`).
- **L5 + L1** (the host's *choice* was the evidence; the L1 `framing-flip` 1/3 vs 1/2) → **L6 opener**
  (`recall-monty`).
- **L2 headline** (P(+|sick) = 99% but P(sick|+) = 50% — the directional swap) → **L7 opener**
  (`recall-base-rate`).
- **L7 + L2** (P(E|H) ≠ P(H|E); a rare prior swamps strong evidence) → **L8 opener** (`recall-direction`).

**Interleaving (confusable pairs / mixed, mid-lesson):**
- **L4 `share-vs-rate`** re-applies **L2's** base-rate idea (big prior/output-share vs higher
  likelihood/defect-rate) — the base-rate trap in a factory costume.
- **L6 `clue-match`** folds **L5's Monty** ("the host's protocol was the clue") into the same "what did you
  condition on?" frame as two-children and Bertrand — one principle, four costumes.
- **L7 `name-the-fallacy`** interleaves the **L2 medical** case, the DNA case, and everyday "P(A|B) vs
  P(B|A)" — one direction-error in many disguises.
- **L8 `spot-the-base-rate`** is the **concept's interleaved capstone** (modeled on `lesson-states-streaks`):
  unlabeled, mixed scenarios — **disease (L2)**, cab, spam, coin — the learner must pick the move without a
  label, exactly the states-streaks design the report flagged for reuse.

**Spaced re-surfacing:**
- **L1's `framing-flip`** (boys-girls 1/3 vs 1/2) re-surfaces **two chapters later** as the whole point of
  **L6**.
- **L2's natural-frequency tree** is reused as the **L8 `explore-cabs`** widget (same confusion array, new
  costume); **L2's 1/2 disease anchor** is recalled in **L8** as an interleave (spaced review).
- **L3's odds form** (prior odds × likelihood ratio) re-surfaces in **L7's** triangulation (1:10,000 ×
  1,000,000 = 100:1 → 100/101).
- **Exact-fraction posteriors** continue at every gap — L4 (3/8, 5/17, 25/48), L5 (2/3, 99/100, 1/2),
  L6 (1/3, 1/2, 2/3, 1/7), L7 (100/101, 1/2), L8 (12/29, 99/107, 95/1094) — **closing** the fraction-fluency
  thread that began with PHT's 7/8 and i/N.

**Bridges that seed the next lesson:** L5's random-host ("Monty Fall") mastery → **1/2** plants "the
protocol behind the clue matters," which **L6** develops; L4's N-way `bayesPosterior` machinery is the
launch pad for **L5** (Monty as a 3-hypothesis update). New mechanic flagged for Wave-0: the `bayesUpdate`
`bars`/`tree` renderer must draw **n > 2 hypotheses** (L4 sources, L5 doors) — schema/engine/validator
already support it; renderer-only change.
