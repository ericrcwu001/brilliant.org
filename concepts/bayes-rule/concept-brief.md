# Concept: Bayes' Rule  (course-bayes-rule)

## Green Book anchor

- **Conditional probability & Bayes' formula** — Green Book, **Ch. 4 "Probability Theory," section
  "Conditional Probability and Bayes' Formula," p.37–42** (`references/green-book.txt` page markers).
  The section states the exact machinery we teach: **conditional probability** P(A|B) = P(A∩B)/P(B)
  (p.37), the **law of total probability** P(E) = Σ P(E|Fᵢ)P(Fᵢ) (p.37), and **Bayes' formula**
  P(A|B) = P(B|A)P(A) / P(B) (p.37). It is legitimate (and central) to teach because Bayes is one of
  the two most-tested ideas in the chapter and a quant-interview staple, with worked problems on these
  pages: the **two-children / boys-and-girls** problem → 1/3 (and the "meet a boy" variant → 1/2,
  p.37–38); the **1000-coins (one double-headed) → 10 heads** posterior → **1024/2023 ≈ 0.506** (p.38,
  the canonical base-rate update); plus **Monty Hall** → 2/3 and **dice-order** → 5/54 as conditioning
  cousins (p.40). Every headline number is an **exact rational**, so a pure `bayes.ts` reproduces it.

## One-line promise

**Evidence rescales belief in proportion to how well each hypothesis predicted it** — i.e.
posterior ∝ prior × likelihood, equivalently **posterior odds = prior odds × likelihood ratio** — the
single rule that updates a belief from one clue, survives a low base rate, and compounds across many clues.

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)

- **domain:** `Probability`
- **domainOrder:** `0`  (same Probability shelf as Pattern-Hitting-Times = 0, Expected-Value = 1,
  Markov-Chains = 2; kept from the stub)
- **order:** `3`  (4th Probability concept; no clash — kept from the stub)
- **status:** `live`  (**flipped from `coming_soon`** — this is the only field flipped on the stub's
  catalog identity; domain/domainOrder/order/tagline/accent/vizKey are all kept as-is, they are sound)
- **tagline:** `Update your beliefs when new evidence arrives.`  (43 chars ≤ 60 ✓ — kept from the stub)
- **accent:** `ch2`  (kept; ch1 is taken by the live Pattern-Hitting-Times card)
- **vizKey:** `twoNode`  (kept — a two-hypothesis prior→posterior update is literally two nodes)
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-bayes-rule-1 | The Update Rule | ch1 | [lesson-bayes-rule-1] |
| ch-bayes-rule-2 | Evidence in the Real World | ch2 | [lesson-bayes-rule-2, lesson-bayes-rule-3] |

> Every built lessonId (`lesson-bayes-rule-1/-2/-3`) appears in **exactly one** chapter's `lessonIds`,
> and every chapter lessonId is a built lesson — the catalog hard requirement is satisfied (see below).

## Lessons (ordered)

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-bayes-rule-1 | The Update Rule | New evidence rescales each hypothesis by how well it predicted that evidence: posterior ∝ prior × likelihood (2-hypothesis coin/urn → 2/3). | — | `2/3` | `twoNode` | GB p.37–38 (boys-girls 1/3, 1/2); web: two-coin → 2/3 (stats.stackexchange q514627; mathproblems.info/prob16s) |
| L2 | lesson-bayes-rule-2 | The Base-Rate Trap | When a hypothesis is rare, even very strong evidence leaves it improbable — the prior swamps the test. | L1 | `1%` | `coin` | GB p.38 (1000-coins → 1024/2023); web: disease 1%/99% → 1/2 (quantblueprint; gitbook "Canonical Stats Questions"); PMC3055966 (sweep) |
| L3 | lesson-bayes-rule-3 | Stacking Evidence | Independent evidence multiplies — today's posterior is tomorrow's prior — so repeated clues compound; posterior odds = prior odds × ∏ likelihood ratios. | L1, L2 | `2ᵏ` | `sum` | GB p.38 (1000-coins as a sequence → 2ᵏ/(2ᵏ+999), crosses ½ at k=10); web: two-coin sequential 2ᵏ/(2ᵏ+1) (q514627); two 99% tests → 99/100 (quantblueprint) |

**The arc (one through-line — odds form):** L1 establishes *prior × likelihood* on the cleanest
2-hypothesis update (→ 2/3). L2 makes the **prior odds** the star: a 1-in-100 disease + a 99% test is
prior odds 1/99 × likelihood ratio 99 = even odds = **50%** (and the GB 1000-coins needs 10 straight
heads just to crawl past 50%). L3 multiplies **likelihood ratios** across independent evidence so belief
compounds to near-certainty. Each lesson is one hard "click"; together they are
*posterior odds = prior odds × likelihood ratio*, the quant mental model — and every result is an exact
rational, so the engine reproduces all of them.

## New engine(s) / widget(s) anticipated (for Wave 0)

- **engine: `src/engine/bayes.ts`** — pure, dependency-free, **exact rational** (reuses
  `reduce / ratAdd / ratMul / ratDiv / toRational` already exported from `src/engine/automaton.ts`; no
  floats). Computes the discrete Bayes update and its odds form:
  - `bayesUpdate(prior: Rational, pEgivenH: Rational, pEgivenNotH: Rational): Rational` — 2-hypothesis
    posterior P(H|E) = (prior·pEgivenH) / (prior·pEgivenH + (1−prior)·pEgivenNotH).
  - `bayesPosterior(priors: Rational[], likelihoods: Rational[]): Rational[]` — general n-hypothesis,
    normalized (powers the 1000-coins → fair-vs-unfair collapse and the bars/tree displays).
  - `posteriorOdds(priorOdds: Rational, likelihoodRatio: Rational): Rational` and
    `sequentialPosterior(prior, pEgivenH, pEgivenNotH, k)` — fold k independent identical observations
    (powers L3's 2ᵏ/(2ᵏ+999) and the "how many heads to cross ½" → 10 result).
  - `naturalFrequencies(prior, sensitivity, specificity, population)` → `{ tp, fp, fn, tn, ppv }` (exact)
    — powers L2's icon-array / confusion-split display and the 99/(99+99) = 1/2 readout.
- **interaction type(s) — exactly ONE new type, presentation-folded (matches the codebase convention
  where `raceSim` folds lanes/oddsDial/heatmap and `walkBoard` folds single/swarm/landscape/histogram):**
  - **`bayesUpdate`** — direct-manipulation belief update. `display: 'bars' | 'tree' | 'sequence'`.
    - `bars` (L1): drag the prior split, pick the evidence, watch the two-hypothesis posterior bar swing.
    - `tree` (L2): a natural-frequency icon array / confusion split (e.g. 10,000 people or 1000 coins)
      that the learner partitions; the posterior reads off as highlighted ÷ total.
    - `sequence` (L3): apply evidence repeatedly; the posterior bar climbs per observation, snapping to
      the exact rational each step.
    - Schema shape (Wave-0 sketch, to be frozen by Dept 2/3): `{ type:'bayesUpdate', display,
      hypotheses: string[], priors?: Rational[], likelihoods?: Rational[][], evidence?: string,
      population?: number, interactive?: boolean }`; engine dep `bayes.ts`; renderer
      `src/lesson/beats/BayesUpdateBeat.tsx` + dispatcher entry in `beats/index.tsx`.
- **Reused interaction types (no new work):** `prediction` (bets, `byOption`), `slider` (drag prior /
  prevalence / "k heads"), `answerEntry` + `masteryChallenge` (exact-fraction posteriors),
  `retrievalGrid` (graded openers + interleaving), `primer` (JIT naming: prior/likelihood/posterior,
  base-rate, "today's posterior is tomorrow's prior"), `tripletReveal` (triangulate
  formula = frequencies = odds), `recap`.
- **Wave-0 gate wiring (per `qa-rubric.md`):** add `lesson-bayes-rule-1/-2/-3` to
  `scripts/validate-fixtures.ts` `GATED` / `MASTERY_LESSONS` sets, teach `validate-fixtures` to
  cross-check the new `bayesUpdate` targets against `bayes.ts`, and add the **chapters-coverage
  assertion** (every built lessonId in exactly one `course.chapters[].lessonIds`) so the "invisible
  lessons" trap fails CI.

## Catalog hard-requirement check (LIVE concept)

- 3 built lessons: `lesson-bayes-rule-1`, `lesson-bayes-rule-2`, `lesson-bayes-rule-3`.
- `chapters[]` covers all 3, each in exactly one chapter: ch-bayes-rule-1 → {L1};
  ch-bayes-rule-2 → {L2, L3}. ✅ No lesson is omitted; no chapter references a non-built lesson.
- `accent` ∈ {ch1..ch5} (`ch2`) ✓; `vizKey` ∈ {coin, stateMachine, raceLanes, randomWalk, twoNode,
  fourNode, sum, dice} (`twoNode`) ✓; per-lesson `vizKey`s (`twoNode`, `coin`, `sum`) all in-enum ✓.
- `CourseSchema` fields present (domain/domainOrder/order/status/tagline/accent/vizKey/chapters) → the
  card renders and the per-concept journey renders all 3 lessons (no fallback to PHT chapters).
