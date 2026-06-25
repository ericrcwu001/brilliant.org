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
| ch-bayes-rule-3 | More Than Two Hypotheses | ch3 | [lesson-bayes-rule-4, lesson-bayes-rule-5] |
| ch-bayes-rule-4 | Reading the Evidence Right | ch4 | [lesson-bayes-rule-6, lesson-bayes-rule-7, lesson-bayes-rule-8] |

> Every built lessonId (`lesson-bayes-rule-1` … `lesson-bayes-rule-8`) appears in **exactly one**
> chapter's `lessonIds`, and every chapter lessonId is a built lesson — the catalog hard requirement is
> satisfied (see below). **Surgical:** the original two chapters are **unchanged**; ch3/ch4 are appended.
> Coverage is consecutive and balanced (1, 2, 2, 3) and `accent`s `ch1`–`ch4` stay inside the `ch1`–`ch5`
> enum.

## Lessons (ordered)

| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-bayes-rule-1 | The Update Rule | New evidence rescales each hypothesis by how well it predicted that evidence: posterior ∝ prior × likelihood (2-hypothesis coin/urn → 2/3). | — | `2/3` | `twoNode` | GB p.37–38 (boys-girls 1/3, 1/2); web: two-coin → 2/3 (stats.stackexchange q514627; mathproblems.info/prob16s) |
| L2 | lesson-bayes-rule-2 | The Base-Rate Trap | When a hypothesis is rare, even very strong evidence leaves it improbable — the prior swamps the test. | L1 | `1%` | `coin` | GB p.38 (1000-coins → 1024/2023); web: disease 1%/99% → 1/2 (quantblueprint; gitbook "Canonical Stats Questions"); PMC3055966 (sweep) |
| L3 | lesson-bayes-rule-3 | Stacking Evidence | Independent evidence multiplies — today's posterior is tomorrow's prior — so repeated clues compound; posterior odds = prior odds × ∏ likelihood ratios. | L1, L2 | `2ᵏ` | `sum` | GB p.38 (1000-coins as a sequence → 2ᵏ/(2ᵏ+999), crosses ½ at k=10); web: two-coin sequential 2ᵏ/(2ᵏ+1) (q514627); two 99% tests → 99/100 (quantblueprint) |
| L4 | lesson-bayes-rule-4 | Which Hypothesis? | Generalize the 2-hypothesis rule to **N**: posteriorᵢ = priorᵢ·Lᵢ / Σⱼ priorⱼ·Lⱼ — given a defective item, decide which of several sources produced it. | L1, L2 | `1/N` | `fourNode` | GB p.37 §Bayes' formula + law of total probability; classic factories/machines/suppliers Bayes (interview pack `multi-source-defect`) → 2-factory P(A)=**3/8**, 3-machine P(M1)=**5/17** |
| L5 | lesson-bayes-rule-5 | The Host's Clue | Monty Hall as a **3-hypothesis** update: the host's *action* is the evidence, and its likelihood depends on his rules — switching wins **2/3**. | L4 | `door` | `dice` | GB **p.40** (Monty Hall → 2/3); en.wikipedia.org/wiki/Monty_Hall_problem (100-door → 99/100); Rosenthal "Monty Hall, Monty Fall, Monty Crawl" (random host → 1/2) |
| L6 | lesson-bayes-rule-6 | The Question Behind the Clue | The **exact event you condition on** sets the update: "at least one boy" → **1/3** but "this child is a boy" → **1/2**; Bertrand's box → **2/3**. | L1, L5 | `1/3` | `twoNode` | GB **p.37–38** (two children → 1/3 and 1/2); en.wikipedia.org/wiki/Bertrand%27s_box_paradox (→ 2/3) |
| L7 | lesson-bayes-rule-7 | Reading Evidence Backwards | P(E\|H) ≠ P(H\|E): a "one-in-a-million" match is **not** a one-in-a-million chance of innocence — the prosecutor's fallacy; cold-hit DNA → **100/101**. | L2 | `H\|E` | `twoNode` | en.wikipedia.org/wiki/Prosecutor%27s_fallacy (cold-hit DNA → 100/101); GB p.37 §Bayes' formula |
| L8 | lesson-bayes-rule-8 | Base Rates in the Wild | Spot and fix **base-rate neglect** across costumes — eyewitness, spam, fraud, disease: *name the base rate, then update*. Taxicab → **12/29**. | L2, L7 | `12/29` | `coin` | Tversky & Kahneman taxicab (en.wikipedia.org/wiki/Base_rate_fallacy → 12/29); spam/fraud precision (interview pack `spam-precision` → 99/107, 95/1094) |

**The arc (one through-line — odds form):** L1 establishes *prior × likelihood* on the cleanest
2-hypothesis update (→ 2/3). L2 makes the **prior odds** the star: a 1-in-100 disease + a 99% test is
prior odds 1/99 × likelihood ratio 99 = even odds = **50%** (and the GB 1000-coins needs 10 straight
heads just to crawl past 50%). L3 multiplies **likelihood ratios** across independent evidence so belief
compounds to near-certainty. Each lesson is one hard "click"; together L1–L3 are
*posterior odds = prior odds × likelihood ratio*, the quant mental model — and every result is an exact
rational, so the engine reproduces all of them.

**The expansion (L4–L8 — the same rule, harder to see):** once the rule is solid for two hypotheses,
L4–L8 stress where it *looks* wrong. **L4** generalizes the count: the identical "rescale by how well
each hypothesis predicted the evidence, then renormalize" move over **N** sources (defective item →
which factory). **L5 (Monty Hall)** makes the **evidence an agent's action** — the host's choice, not
just "a goat appeared," is the data, and its likelihood comes from his rules → switch wins 2/3 (a 3-bar
update). **L6** isolates the lurking subtlety L5 exposed: the **exact event you condition on** is the
whole ballgame ("≥1 boy" → 1/3 vs "this child is a boy" → 1/2; Bertrand → 2/3). **L7** fixes the
direction — **P(E|H) ≠ P(H|E)** (the prosecutor's fallacy: a one-in-a-million DNA match is not a
one-in-a-million chance of innocence → 100/101). **L8** is the applied, interleaved capstone — *name the
base rate, then update* — spotting base-rate neglect in the wild (taxicab → 12/29; spam/fraud precision).
L6–L8 are "read the evidence right": **what** did you observe (L6), **which way** does the conditional
point (L7), **did you keep the prior** (L8). Every L4–L8 headline is an exact rational the existing
`bayes.ts` reproduces (all 22 confirmed) — **no new engine, pure reuse**; the only build delta is letting
the `bayesUpdate` widget draw **n > 2** bars (below).

## New engine(s) / widget(s) anticipated (for Wave 0)

### L4–L8 build delta (the ONLY new capability — read first)

**Pure reuse, with one renderer generalization.** L4–L8 need **no new engine function** and **no new
interaction type**. All 22 L4–L8 headline/mastery answers are reproduced by the *already-frozen*
`src/engine/bayes.ts` (`bayesPosterior`, `bayesUpdate`, `naturalFrequencies`, `oddsToProb`/`posteriorOdds`)
— confirmed by running the engine. They reuse the frozen `bayesUpdate` widget (`bars`/`tree`/`sequence`)
and the existing `prediction`/`answerEntry`/`masteryChallenge`/`retrievalGrid`/`tripletReveal`/`primer`/
`recap` types.

- **The one delta — `bayesUpdate` `bars` (and `tree`) must render `n > 2` hypotheses.** L4 (3 sources)
  and L5 (3 doors) update **three** hypotheses at once; the current `BayesUpdateBeat.tsx` sketch assumes
  two bars / a two-class tree. This is a **renderer-only** change:
  - **Schema already supports it:** `hypotheses: z.array(z.string()).min(2)` and array `priors`/
    `likelihoods` (wave0-contracts §1) impose no upper bound.
  - **Engine already supports it:** `bayesPosterior(priors, likelihoods)` is general n-hypothesis and
    normalizes over all of them (including **zero-likelihood** hypotheses — Monty's opened door → a
    `0/1` posterior, which the renderer must draw as a 0-height bar).
  - **Validator already supports it:** the wave0 bayes cross-check asserts `bayesPosterior(priors,
    likelihoods)[0] === posterior` — i.e. it checks the **focal = `hypotheses[0]`**. So author the focal
    hypothesis **first** (L5 Monty: `hypotheses[0]` = the *switch* door → `2/3`; L4: `hypotheses[0]` =
    Factory A → `3/8`). No validator change.
  - Net for Dept 2/3: generalize `BayesUpdateBeat.tsx` to map over `hypotheses.length` bars/cells (and
    render a 0 bar) instead of hardcoding two. L6 keeps `n = 2` (two-children, 4-outcome `tree`) and
    states Bertrand's 3-card case via `answerEntry`/`tripletReveal`, so n>2 is needed **only for L4 & L5**
    (L6's Bertrand may optionally adopt the new n=3 bars once they exist).
- **Field-usage rows to append to the wave0 matrix** (all displayed values via `bayes.ts`):

| beat | display | hypotheses (focal-first) | priors | likelihoods | population | hero? | posterior |
|------|---------|--------------------------|--------|-------------|------------|-------|-----------|
| L4 `explore-sources` | bars | ["Machine 1","Machine 2","Machine 3"] | [1/2,3/10,2/10] | [1/100,2/100,3/100] | — | yes | "5/17" |
| L5 `explore-doors` | bars | ["Switch door","Your door","Opened door"] | [1/3,1/3,1/3] | [1/1,1/2,0/1] | — | yes | "2/3" |
| L6 `explore-children` | tree | ["Both boys","Not both boys"] | [1/4,3/4] | [1/1,2/3] | 4 | yes | "1/3" |
| L7 `explore-pool` | bars | ["Is the source","Is not"] | [1/10001,10000/10001] | [1/1,1/1000000] | — | yes | "100/101" |
| L8 `explore-cabs` | tree | ["Blue","Green"] | [15/100,85/100] | [80/100,20/100] | 100 | yes | "12/29" |

  (`count-the-…` graded taps stay non-hero, as in L1's `count-the-heads`.)

### Engine + widget (unchanged from L1–L3 — context)

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

- 8 built lessons: `lesson-bayes-rule-1` … `lesson-bayes-rule-8`.
- `chapters[]` covers all 8, each in **exactly one** chapter: ch-bayes-rule-1 → {L1};
  ch-bayes-rule-2 → {L2, L3}; ch-bayes-rule-3 → {L4, L5}; ch-bayes-rule-4 → {L6, L7, L8}. ✅ No lesson is
  omitted; no chapter references a non-built lesson. (This must be reflected when the course doc's
  `chapters[]`/`lessons[]` are enriched in Wave 0 — extend the §5b course fixture + the §6(e)
  chapters-coverage assertion to all 8.)
- `accent` ∈ {ch1..ch5} (concept `ch2`; chapters `ch1`–`ch4`) ✓; `vizKey` ∈ {coin, stateMachine,
  raceLanes, randomWalk, twoNode, fourNode, sum, dice} (concept `twoNode`) ✓; per-lesson `vizKey`s
  (`twoNode`, `coin`, `sum`, `fourNode`, `dice`, `twoNode`, `twoNode`, `coin`) all in-enum ✓.
- `CourseSchema` fields present (domain/domainOrder/order/status/tagline/accent/vizKey/chapters) → the
  card renders and the per-concept journey renders all 8 lessons (no fallback to PHT chapters).
