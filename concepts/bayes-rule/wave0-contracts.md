# Wave-0 Contracts — concept-bayes-rule  (FROZEN for Dept 3)

Author: Department 2 (Interactive Experience / Design) + Wave-0 contract author. Everything below is verified
against the real codebase on branch `concept/bayes-rule` (worktree `.lf/bayes-rule/`). One new interaction type
(`bayesUpdate`), one new engine (`src/engine/bayes.ts`), DOM/SVG renderer (no Konva), every number an exact
rational. Design only — no source/fixtures are written in this wave.

**Reuse-first scorecard:** of 30 beats across L1–L3, **27 reuse** existing renderers
(`retrievalGrid`, `prediction`, `primer`, `answerEntry`, `masteryChallenge`, `tripletReveal`, `recap`) and **3**
are the single new `bayesUpdate` widget (the explore beats + one graded tap-partition). No other new types.

---

## 1. New interaction type `bayesUpdate`

Append this object as the **last member** of the `InteractionSchema` discriminated union in
`src/content/schema.ts` (immediately after the `tripletReveal` member, before the closing `])`). It reuses the
existing `RationalSchema` (already defined at the top of the file as `{ n: int, d: positive int }`) — **no new
schema primitive**. `discriminatedUnion('type', …)` keys on `type`, so placement order is irrelevant to
validation; appending keeps the diff additive.

```ts
  // Bayesian belief update (concept-bayes-rule, Wave 0). One new type, three
  // presentation displays (the codebase convention where `raceSim` folds
  // lanes/oddsDial/heatmap and `walkBoard` folds single/swarm/...):
  //   'bars'     — drag the prior split, pick the evidence, watch the 2-hypothesis posterior bar swing.
  //   'tree'     — natural-frequency icon array / confusion split the learner partitions; posterior = highlighted ÷ total.
  //   'sequence' — apply the evidence repeatedly; the posterior climbs, snapping to the exact rational each step.
  // All inputs are exact rationals (RationalSchema). The renderer computes every
  // displayed value via src/engine/bayes.ts; `posterior` is the engine-reproducible
  // headline (validation anchor) cross-checked by scripts/validate-fixtures.ts.
  z.object({
    type: z.literal('bayesUpdate'),
    display: z.enum(['bars', 'tree', 'sequence']),
    // Hypothesis labels. bars/sequence: focal = hypotheses[0]. tree: [positive-class, negative-class].
    hypotheses: z.array(z.string()).min(2),
    // Prior over the hypotheses (aligned to `hypotheses`). bars [1/2,1/2]; tree [prevalence, 1-prevalence];
    // sequence [rare, 1-rare]. Optional in Zod; required-where-needed is enforced in validate-fixtures.
    priors: z.array(RationalSchema).optional(),
    // P(evidence | each hypothesis), aligned to `hypotheses`. bars [1, 1/2];
    // tree [sensitivity, 1-specificity]; sequence the per-observation [pH, pNotH].
    likelihoods: z.array(RationalSchema).optional(),
    // Label of the single observed evidence, e.g. "heads", "a positive test".
    evidence: z.string().optional(),
    // tree only: icon-array size (3 for the equal-likelihood head tap; 10000 for the confusion grid).
    population: z.number().int().positive().optional(),
    // sequence only: how many identical observations to fold (the k the posterior climbs to).
    steps: z.number().int().positive().optional(),
    // The learner manipulates inputs (drag/partition) vs. a passive watch.
    interactive: z.boolean().optional(),
    // Engine-reproducible headline posterior as a reduced "n/d" (or integer) string — the validation anchor.
    posterior: z.string().optional(),
  }),
```

**Inferred-type note:** `export type Interaction = z.infer<typeof InteractionSchema>` (already at the bottom of
the file) automatically gains the `bayesUpdate` member — no separate type to maintain. `BeatSchema.interaction`
therefore accepts it with zero further change.

**Grading rule (frozen):** a `bayesUpdate` beat is **graded iff its beat-level `hero` block is absent**. The three
explore beats carry `hero` ⇒ ungraded "watch it resolve" (primary = Continue). `count-the-heads` has no `hero`
⇒ graded (Check → hint ladder → `reportNeedsReview`). This reuses the existing `hero` field; no new flag.

**Field usage matrix (the only valid shapes Dept 3 must support):**

| beat | display | hypotheses | priors | likelihoods | population | steps | evidence | hero? | posterior |
|------|---------|------------|--------|-------------|------------|-------|----------|-------|-----------|
| L1 `explore-update` | bars | ["Two-headed coin","Fair coin"] | [1/2, 1/2] | [1/1, 1/2] | — | — | "heads" | yes | "2/3" |
| L1 `count-the-heads` | tree | ["Two-headed coin","Fair coin"] | [1/2, 1/2] | [1/1, 1/2] | 3 | — | "heads" | no (graded) | "2/3" |
| L2 `explore-frequencies` | tree | ["Has the disease","Healthy"] | [1/100, 99/100] | [99/100, 1/100] | 10000 | — | "a positive test" | yes | "1/2" |
| L3 `explore-sequence` | sequence | ["Double-headed coin","Fair coin"] | [1/1000, 999/1000] | [1/1, 1/2] | — | 10 | "heads" | yes | "1024/2023" |
| L4 `explore-sources` | bars | ["Machine 1","Machine 2","Machine 3"] | [1/2, 3/10, 2/10] | [1/100, 2/100, 3/100] | — | — | "a defective part" | yes | "5/17" |
| L5 `explore-doors` | bars | ["Switch door","Your door","Opened door"] | [1/3, 1/3, 1/3] | [1/1, 1/2, 0/1] | — | — | "the host opens Door 3" | yes | "2/3" |
| L6 `explore-children` | bars | ["Both boys","Not both boys"] | [1/4, 3/4] | [1/1, 2/3] | — | — | "at least one is a boy" | yes | "1/3" |
| L7 `explore-pool` | bars | ["Is the source","Is not the source"] | [1/10001, 10000/10001] | [1/1, 1/1000000] | — | — | "the DNA matches" | yes | "100/101" |
| L8 `explore-cabs` | tree | ["Blue","Green"] | [15/100, 85/100] | [80/100, 20/100] | 100 | — | "the witness says blue" | yes | "12/29" |

(Rationals shown as `n/d` are `{ n, d }` objects, e.g. `1/2` = `{ "n": 1, "d": 2 }`; `0/1` = `{ "n": 0, "d": 1 }`.)

> **L4–L8 `bars` are non-slider (`interactive:false`)** — L4/L5 because they are **n > 2** (the prior is
> fixed), L6/L7 because their prior is **structurally fixed / too small** for the integer-percent slider.
> All five route through the §9 *direct* render (posteriors straight from `bayesPosterior`). **L8 `tree`**
> is interactive (draggable prevalence), reusing L2's confusion grid unchanged. Focal = `hypotheses[0]`
> for every row (the validator anchor `bayesPosterior(...)[0]`). Full shapes + per-beat copy: each
> lesson's `lesson-bayes-rule-{4..8}/interaction-spec.md`. **Remap:** L6 `explore-children` was Dept-1
> `tree`+`population:4`; Dept-2 remapped it to `bars` (n = 2, `interactive:false`) — see §9 and the L6 spec.

---

## 2. Dispatcher entry

In `src/lesson/beats/index.tsx`, add the import beside the other beat imports and one `case` in `BeatView`'s
switch (placed with the other shared widgets, e.g. after the `tripletReveal` case):

```tsx
import { BayesUpdateBeat } from './BayesUpdateBeat'
```

```tsx
    case 'bayesUpdate':
      return <BayesUpdateBeat {...props} />
```

No `beatId` routing is needed (unlike `slider`, which forks `bias-sandbox`): one renderer serves all three
displays. The `default: return <ContinueStub …>` branch already covers the type until the renderer lands, so
the dispatcher change is purely additive.

---

## 3. Renderer `src/lesson/beats/BayesUpdateBeat.tsx`

**Contract.** A function component `export function BayesUpdateBeat(props: BeatProps)`. It narrows
`props.beat.interaction` to the `bayesUpdate` member (early-returns `null` otherwise, matching every sibling
renderer). It ignores `automaton`/`pattern` (Bayes is automaton-free) and composes `<BeatShell>` exactly like
the other beats. **DOM/SVG + CSS transitions only — no Konva.**

**Why DOM/SVG, not Konva:** the three displays are bars (width-animated divs), an icon array (CSS grid of
buttons/`<span>`s), and a climbing bar — all trivially DOM/SVG. DOM gives real focusable controls (44px buttons,
range inputs) for free a11y, RTL-queryable nodes for unit/e2e tests, and lighter bundle. Konva in this repo is
reserved for graph layout (`src/lesson/konva/StateGraph`); Bayes needs none. **No Konva is justified anywhere
in this widget.**

**Reads from the interaction:** `display`, `hypotheses`, `priors`, `likelihoods`, `evidence`, `population`,
`steps`, `interactive`, `posterior`. **Reads from props:** `reducedMotion`, `isLast`, `onAdvance`,
`reportNeedsReview`, `beat.hero`, and (graded mode only) the hint ladder via
`resolveFeedback(beat.feedback, pattern)` + `useHintLadder(...)` (same wiring as `AnswerEntryBeat`).

**All displayed values via `src/engine/bayes.ts`** (never hardcoded), formatted by the small n/d helper
`formatRational` (§4). Specifically:
- `bars`: focal posterior = `bayesPosterior(priors, likelihoods)[0]`; the two bars render
  `bayesPosterior(...)[0]` and `[1]` as width %. Dragging the prior re-derives both live.
- `tree`:
  - **Confusion grid (hero, e.g. `explore-frequencies`)** — `naturalFrequencies(priors[0], likelihoods[0],
    ratSub(ONE, likelihoods[1]), population)` gives `{ tp, fp, fn, tn, ppv }`; the icon array renders the four
    integer cell counts and the posterior reads `ppv` (= `bayesPosterior(priors, likelihoods)[0]`). Dragging
    prevalence updates `priors` and re-fills the cells.
  - **Equal-likelihood tap (graded, e.g. `count-the-heads`, small `population`)** — the icons are the reduced
    integer ratio of `priors[i]·likelihoods[i]` (here 2:1 → 3 icons); the learner taps the focal-class icons;
    Check passes iff the tapped set equals the focal count (`= bayesPosterior(...)[0]` numerator over total).
- `sequence`: per step k = 1…`steps`, the bar snaps to `sequentialPosterior(priors[0], likelihoods[0],
  likelihoods[1], k)`; the headline equals `…(…, steps)` = `posterior`.

**Completion / answer reporting:**
- Ungraded (hero) → after the learner interacts at least once (or immediately, if `interactive` is false),
  the `BeatShell` primary is `{ label: isLast ? 'Finish' : 'Continue', enabled: true, onClick: onAdvance }`.
  The widget writes nothing to `lessonState` (the generic non-flagship recap reads no Bayes specifics).
- Graded → primary is `Check` (enabled once a partition is chosen); on correct → `ladder.submitCorrect()` then
  primary becomes Continue/Finish; on wrong → `ladder.submitWrong()` advances the hint ladder; reaching the
  reveal calls `reportNeedsReview` via `useHintLadder` (same as `AnswerEntryBeat`). Feedback strip is the shared
  `FeedbackStrip` (already `role="status" aria-live="polite"`).

**`hero` block requirement:** the three explore beats **need** the beat-level `hero` block
(`{ slowFirst: true, structuralReadout: <plain number sentence>, reducedMotionFinalFrame: true }`) — it both
drives the slow-first paced first instance and the structural readout, and (per the grading rule above) marks
the beat ungraded. `count-the-heads` must **omit** `hero` (graded). Exact `structuralReadout` strings are in each
lesson's interaction-spec.

**a11y (frozen):**
- **44px tap paths:** prior-split handle = a native `<input type="range">` (arrow-key steppable) ≥44px; evidence
  pick + Flip = `<button>` ≥44px; tree icons = `<button>` ≥44px each.
- **aria-live mirror:** a visually-hidden `<p role="status" aria-live="polite">` mirrors the current posterior
  and counts in words on every manipulation, e.g. "Posterior: 2 in 3" / "99 true positives, 99 false positives —
  half are sick" / "After 10 heads: 1024 in 2023". (This is *in addition* to the FeedbackStrip's own aria-live
  for the graded verdict.)
- **reduced-motion:** when `reducedMotion` is true, render the **final frame** with no transitions — bars at
  their settled widths, the sequence at k = `steps`, the confusion grid fully filled. Honors
  `hero.reducedMotionFinalFrame: true`.

---

## 4. Engine `src/engine/bayes.ts`

Pure, dependency-free, **exact rational**. Reuses the toolkit already exported from `src/engine/automaton.ts`
(`reduce`, `ratAdd`, `ratSub`, `ratMul`, `ratDiv`, `ratNum`) and the `Rational` type from `src/engine/types.ts`.
No floats anywhere.

```ts
import type { Rational } from './types'
import { reduce, ratAdd, ratSub, ratMul, ratDiv } from './automaton'

const ONE: Rational = { n: 1, d: 1 }

// --- internal helpers ---
function ratPow(r: Rational, k: number): Rational {        // k >= 0
  let acc = ONE
  for (let i = 0; i < k; i++) acc = ratMul(acc, r)
  return acc
}

// odds n:d  ->  probability n/(n+d). Exact. (Exposed: the renderer shows odds as a probability bar.)
export function oddsToProb(o: Rational): Rational {
  return reduce(o.n, o.n + o.d)
}

// The "small n/d helper": reduced "n/d", or just "n" when the denominator is 1.
export function formatRational(r: Rational): string {
  const x = reduce(r.n, r.d)
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`
}

// --- frozen public API ---

// Two-hypothesis posterior P(H|E) = prior·pH / (prior·pH + (1-prior)·pNotH).
export function bayesUpdate(prior: Rational, pEgivenH: Rational, pEgivenNotH: Rational): Rational {
  const num = ratMul(prior, pEgivenH)
  const other = ratMul(ratSub(ONE, prior), pEgivenNotH)
  return ratDiv(num, ratAdd(num, other))
}

// General n-hypothesis posterior, normalized: posterior_i = prior_i·L_i / Σ_j prior_j·L_j.
export function bayesPosterior(priors: Rational[], likelihoods: Rational[]): Rational[] {
  const unnorm = priors.map((p, i) => ratMul(p, likelihoods[i]))
  const Z = unnorm.reduce((a, b) => ratAdd(a, b), { n: 0, d: 1 })
  return unnorm.map((u) => ratDiv(u, Z))
}

// Odds form: posterior odds = prior odds × likelihood ratio.
export function posteriorOdds(priorOdds: Rational, likelihoodRatio: Rational): Rational {
  return ratMul(priorOdds, likelihoodRatio)
}

// Fold k independent identical observations (today's posterior is tomorrow's prior).
// = prior·pH^k / (prior·pH^k + (1-prior)·pNotH^k). Equals iterating bayesUpdate k times.
export function sequentialPosterior(
  prior: Rational, pEgivenH: Rational, pEgivenNotH: Rational, k: number,
): Rational {
  const num = ratMul(prior, ratPow(pEgivenH, k))
  const other = ratMul(ratSub(ONE, prior), ratPow(pEgivenNotH, k))
  return ratDiv(num, ratAdd(num, other))
}

// Natural frequencies over a population. Returns exact counts + PPV.
//   sick = prior·pop; healthy = (1-prior)·pop
//   tp = sick·sens; fn = sick·(1-sens); tn = healthy·spec; fp = healthy·(1-spec)
//   ppv = tp / (tp + fp)
export function naturalFrequencies(
  prior: Rational, sensitivity: Rational, specificity: Rational, population: number,
): { tp: Rational; fp: Rational; fn: Rational; tn: Rational; ppv: Rational } {
  const pop: Rational = { n: population, d: 1 }
  const sick = ratMul(prior, pop)
  const healthy = ratMul(ratSub(ONE, prior), pop)
  const tp = ratMul(sick, sensitivity)
  const fn = ratMul(sick, ratSub(ONE, sensitivity))
  const tn = ratMul(healthy, specificity)
  const fp = ratMul(healthy, ratSub(ONE, specificity))
  const ppv = ratDiv(tp, ratAdd(tp, fp))
  return { tp, fp, fn, tn, ppv }
}
```

> Note: `oddsToProb` and `formatRational` are small additions beyond the five signatures Dept-1 specified —
> `oddsToProb` because the odds-form beats must render a probability bar, and `formatRational` because it is the
> "small n/d helper" the renderer + validator format with. Both are exact and additive.

### Golden answer table (the Stage-2 fact-check goldens the engine MUST reproduce)

Collected from all three Lesson Briefs. `bayes.ts` reproduces every one exactly; `bayes.test.ts` pins them and
`validate-fixtures` re-asserts the fixture-facing subset (§6).

| # | scenario (source) | engine call | result |
|---|-------------------|-------------|--------|
| 1 | two-coin, 1 head (stackexchange 514627) | `bayesUpdate(1/2, 1, 1/2)` | **2/3** |
| 2 | two-coin, HH (transfer) | `sequentialPosterior(1/2, 1, 1/2, 2)` | **4/5** |
| 3 | boys-girls, ≥1 boy (GB p.37–38) | `bayesUpdate(1/4, 1, 2/3)` | **1/3** |
| 4 | boys-girls, "meet a boy" contrast (GB p.37–38) | `bayesUpdate(1/4, 1, 1/3)` | **1/2** |
| 5 | two-urn (textbook; GB-anchored) | `bayesUpdate(1/2, 2/3, 1/3)` | **2/3** |
| 6 | disease 1% (quantblueprint) | `bayesUpdate(1/100, 99/100, 1/100)` ⟺ `naturalFrequencies(1/100, 99/100, 99/100, 10000).ppv` | **1/2** |
| 7 | disease 10% (PMC3055966) | `bayesUpdate(1/10, 99/100, 1/100)` ⟺ `naturalFrequencies(1/10, …, 10000).ppv` | **11/12** |
| 8 | disease 25% (PMC3055966) | `bayesUpdate(1/4, 99/100, 1/100)` | **33/34** |
| 9 | disease 95%-acc/1% (Downey) | `bayesUpdate(1/100, 95/100, 5/100)` ⟺ `naturalFrequencies(1/100, 95/100, 95/100, 10000).ppv` | **19/118** |
| 10 | 1000-coins, 10 H (GB p.38) | `bayesPosterior([1/1000, 999/1000], [1, 1/1024])[0]` ⟺ `sequentialPosterior(1/1000, 1, 1/2, 10)` | **1024/2023** |
| 11 | 1000-coin sequential k=1 | `sequentialPosterior(1/1000, 1, 1/2, 1)` | **2/1001** |
| 12 | …k=5 | `sequentialPosterior(1/1000, 1, 1/2, 5)` | **32/1031** |
| 13 | …k=10 | `sequentialPosterior(1/1000, 1, 1/2, 10)` | **1024/2023** |
| 14 | two-coin sequential k=1 | `sequentialPosterior(1/2, 1, 1/2, 1)` | **2/3** |
| 15 | …k=2 | `sequentialPosterior(1/2, 1, 1/2, 2)` | **4/5** |
| 16 | …k=3 | `sequentialPosterior(1/2, 1, 1/2, 3)` | **8/9** |
| 17 | two 99% tests (quantblueprint) | `oddsToProb(posteriorOdds(posteriorOdds(1/99, 99/1), 99/1))` | **99/100** |
| 18 | smallest k with 2ᵏ > 999 (GB p.38) | `sequentialPosterior(1/1000,1,1/2,9) < 1/2 < sequentialPosterior(…,10)` | **k = 10** |

(Rows 6/7/9 note the two equivalent engine paths — formula and natural-frequency — both exact and both pinned.)

---

## 5. Fixture plan

### 5a. `fixtures/lesson-bayes-rule-{1,2,3}.json` — required `LessonSchema` fields

All three share `courseId:"course-bayes-rule"`, `schemaVersion:1`, and **`patternOptions:["H"]`**.

> **Why `["H"]`:** `LessonSchema` requires `patternOptions: string[]`, and the LessonPlayer builds
> `buildAutomaton(patternOptions[0])` for `BeatProps.automaton`
> (`src/lesson/LessonPlayer.tsx` lines 128–130, which already guards a non-H/T value → `'H'`). No Bayes beat
> reads the automaton, and **no Bayes beat type triggers the `validate-fixtures` `buildAutomaton` cross-check**
> (that fires only on `equationTiles` beats with `beat.pattern`, and on a `masteryChallenge` with `pattern` set
> — we set neither). `["H"]` is the minimal valid placeholder (E[H]=2, inert).

| field | lesson-bayes-rule-1 | lesson-bayes-rule-2 | lesson-bayes-rule-3 |
|-------|---------------------|---------------------|---------------------|
| `lessonId` | `lesson-bayes-rule-1` | `lesson-bayes-rule-2` | `lesson-bayes-rule-3` |
| `title` | "The Update Rule" | "The Base-Rate Trap" | "Stacking Evidence" |
| `patternOptions` | `["H"]` | `["H"]` | `["H"]` |
| `milestoneId` | `bayes-rule-update` | `bayes-rule-base-rate` | `bayes-rule-stacking` |
| `unlocks` | `lesson-bayes-rule-2` | `lesson-bayes-rule-3` | `null` |
| `schemaVersion` | `1` | `1` | `1` |

**Beat lists** (beatId / interaction.type / required / track) — exactly the interaction-spec tables:

| # | L1 | L2 | L3 |
|---|----|----|----|
| 1 | recall-prob-split · retrievalGrid · req · both | recall-update · retrievalGrid · req · both | recall-base-rate · retrievalGrid · req · both |
| 2 | open-bet · prediction · req · both | open-bet · prediction · req · both | open-bet · prediction · req · both |
| 3 | name-the-parts · primer · **opt** · A | name-base-rate · primer · **opt** · A | posterior-is-prior · primer · **opt** · A |
| 4 | explore-update · bayesUpdate(bars) · req · both · **hero** | explore-frequencies · bayesUpdate(tree) · req · both · **hero** | due-vs-evidence · primer(gamblersFallacy) · **opt** · both |
| 5 | count-the-heads · bayesUpdate(tree) · req · both | compute-ppv · answerEntry · req · both | explore-sequence · bayesUpdate(sequence) · req · both · **hero** |
| 6 | compute-posterior · answerEntry · req · both | ten-heads · answerEntry · req · both | two-tests · answerEntry · req · both |
| 7 | framing-flip · answerEntry · req · both | base-rate-sweep · answerEntry · req · both | coin-ladder · retrievalGrid · req · both |
| 8 | triangulate-23 · tripletReveal · req · both | triangulate-half · tripletReveal · req · both | triangulate-k10 · tripletReveal · req · both |
| 9 | mastery-challenge · masteryChallenge · **req** · both | mastery-challenge · masteryChallenge · **req** · both | mastery-challenge · masteryChallenge · **req** · both |
| 10 | recap · recap · req · both | recap · recap · req · both | recap · recap · req · both |

Track-A-only beats (the JIT primers) are `required:false` (per the `BeatSchema` rule: track-exclusive beats must
be `required:false` so the Cloud Function's required-beat check, which sees the full fixture, always passes).
`due-vs-evidence` is `track:both` but `required:false` (a reading primer, like the others). The
`masteryChallenge` beats carry **no `pattern`** field.

### 5b. `fixtures/course-bayes-rule.json` — enrichment (flip the stub to a live, navigable concept)

Keep `courseId`, `title`, `description`, `persona`, `completionMilestoneId:"bayes-rule-complete"`,
`schemaVersion:1`, `domain:"Probability"`, `domainOrder:0`, `order:3`, `tagline`, `accent:"ch2"`,
`vizKey:"twoNode"` exactly as the stub has them. Change **only** `status` and add `chapters`/`lessons`:

```json
{
  "status": "live",
  "chapters": [
    { "id": "ch-bayes-rule-1", "label": "The Update Rule", "accent": "ch1", "lessonIds": ["lesson-bayes-rule-1"] },
    { "id": "ch-bayes-rule-2", "label": "Evidence in the Real World", "accent": "ch2", "lessonIds": ["lesson-bayes-rule-2", "lesson-bayes-rule-3"] }
  ],
  "lessons": [
    { "lessonId": "lesson-bayes-rule-1", "title": "The Update Rule",     "summary": "Two coins, one flip: a head pushes 1/2 → 2/3. Evidence rescales each hypothesis by how well it predicted the evidence.", "milestoneId": "bayes-rule-update",     "built": true, "glyphKey": "2/3", "vizKey": "twoNode" },
    { "lessonId": "lesson-bayes-rule-2", "title": "The Base-Rate Trap",  "summary": "A 99% test on a 1-in-100 disease still leaves you at 50% — the prior is a heavy anchor strong evidence must overcome.", "milestoneId": "bayes-rule-base-rate", "built": true, "glyphKey": "1%",  "vizKey": "coin" },
    { "lessonId": "lesson-bayes-rule-3", "title": "Stacking Evidence",   "summary": "Independent evidence multiplies: today's posterior is tomorrow's prior, so repeated clues compound to near-certainty.", "milestoneId": "bayes-rule-stacking",  "built": true, "glyphKey": "2ᵏ",  "vizKey": "sum" }
  ],
  "roadmap": []
}
```

> **`chapters[]` is mandatory and load-bearing.** `resolveChapters(course)`
> (`src/pages/studyDesk.model.ts` lines 232–242) returns `course.chapters` when present and non-empty, **else
> falls back to `ERGO_CHAPTERS` (Pattern-Hitting-Times' chapters)**. `CourseJourney`
> (`src/pages/CourseJourney.tsx` lines 77–81) renders `chapters.map(...)` and drops any chapter whose
> `lessonIds` match no node (`chNodes.length === 0`). So a *live* `course-bayes-rule` with no `chapters[]` would
> inherit PHT's lessonIds → every section empty → **the three Bayes lessons render invisible.** Each built
> lessonId must appear in exactly one chapter (verified by §6). `vizKey`s (`twoNode`, `coin`, `sum`) are all in
> the `MathVizKind` set; `glyphKey`s are free-form node dots.

---

## 6. `scripts/validate-fixtures.ts` edits (exact)

**(a) Imports** — add the engine + a Rational shim at the top:

```ts
import {
  bayesPosterior, sequentialPosterior, naturalFrequencies,
  posteriorOdds, oddsToProb, bayesUpdate, formatRational,
} from '../src/engine/bayes'
import type { Rational } from '../src/engine/types'
```

**(b) Gate-set additions** — extend the existing hardcoded sets:

```ts
const GATED = new Set([
  'lesson-penneys-game', 'lesson-gamblers-ruin', 'lesson-states-streaks',
  'lesson-longer-patterns', 'lesson-overlap-shortcut',
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // ← add (L1–L3)
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // ← add (L4–L8, this wave)
])
```
```ts
const MASTERY_LESSONS = new Set([
  'lesson-pattern-hitting-times', 'lesson-penneys-game', 'lesson-gamblers-ruin',
  'lesson-states-streaks', 'lesson-longer-patterns', 'lesson-overlap-shortcut',
  'lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3', // ← add (L1–L3)
  'lesson-bayes-rule-4', 'lesson-bayes-rule-5', 'lesson-bayes-rule-6',
  'lesson-bayes-rule-7', 'lesson-bayes-rule-8',                         // ← add (L4–L8, this wave)
])
```

**HERO_TYPES — do NOT add `bayesUpdate`.** `HERO_TYPES` *requires* a `hero` block on **every** beat of that
type, but `count-the-heads` is a graded, non-hero `bayesUpdate`. Adding `bayesUpdate` to `HERO_TYPES` would
falsely fail it. The three explore beats' `hero` blocks are a Dept-2 Definition-of-Ready item, enforced instead
by the bayes cross-check (each hero explore beat is `interactive` and carries a `posterior`).

**GRADED_TYPES — do NOT add `bayesUpdate`.** It is unnecessary (each lesson's first graded beat is the
`retrievalGrid` opener, so the "guaranteed early win / retrieval opener" invariant already holds) and keeps the
gate change minimal. `count-the-heads` is still graded *in the renderer*; the gate simply doesn't assert on it.

**(c) Bayes engine cross-check** — a new block after the equation-tiles cross-check (§3 in the file). For every
`bayesUpdate` beat that declares a `posterior`, recompute via `bayes.ts` and assert equality:

```ts
const toR = (r: { n: number; d: number }): Rational => ({ n: r.n, d: r.d })
let bayesChecked = 0
for (const lesson of lessons) {
  for (const beat of lesson.beats) {
    const it = beat.interaction
    if (it.type !== 'bayesUpdate' || !it.posterior) continue
    const priors = (it.priors ?? []).map(toR)
    const likelihoods = (it.likelihoods ?? []).map(toR)
    if (priors.length < 2 || priors.length !== likelihoods.length) {
      fail(`${lesson.lessonId}/${beat.beatId}: bayesUpdate needs priors & likelihoods of equal length ≥ 2`)
    }
    let result: Rational
    if (it.display === 'sequence') {
      if (!it.steps) fail(`${lesson.lessonId}/${beat.beatId}: sequence needs steps`)
      result = sequentialPosterior(priors[0], likelihoods[0], likelihoods[1], it.steps)
    } else {
      result = bayesPosterior(priors, likelihoods)[0] // bars & tree: focal posterior (= tree PPV)
    }
    if (formatRational(result) !== it.posterior) {
      fail(`${lesson.lessonId}/${beat.beatId}: declared posterior ${it.posterior} ≠ engine ${formatRational(result)}`)
    }
    bayesChecked++
  }
}
console.log(`✓ bayesUpdate posteriors match bayes.ts (${bayesChecked} beats)`)
```

**(d) Bayes engine goldens** — an inline golden block (mirrors the existing `E[H] = 2` golden in §2 of the file)
so `bayes.ts` correctness fails CI directly, independent of fixtures:

```ts
const R = (n: number, d = 1): Rational => ({ n, d })
const G: Array<[string, Rational, string]> = [
  ['two-coin H',        bayesUpdate(R(1,2), R(1), R(1,2)),               '2/3'],
  ['two-coin HH',       sequentialPosterior(R(1,2), R(1), R(1,2), 2),    '4/5'],
  ['boys-girls',        bayesUpdate(R(1,4), R(1), R(2,3)),               '1/3'],
  ['two-urn',           bayesUpdate(R(1,2), R(2,3), R(1,3)),             '2/3'],
  ['disease 1%',        bayesUpdate(R(1,100), R(99,100), R(1,100)),      '1/2'],
  ['disease 10%',       bayesUpdate(R(1,10), R(99,100), R(1,100)),       '11/12'],
  ['disease 25%',       bayesUpdate(R(1,4), R(99,100), R(1,100)),        '33/34'],
  ['95%-acc/1%',        bayesUpdate(R(1,100), R(95,100), R(5,100)),      '19/118'],
  ['1000-coin 10H',     sequentialPosterior(R(1,1000), R(1), R(1,2), 10),'1024/2023'],
  ['two 99% tests',     oddsToProb(posteriorOdds(posteriorOdds(R(1,99), R(99,1)), R(99,1))), '99/100'],
]
for (const [name, got, want] of G) {
  if (formatRational(got) !== want) fail(`bayes golden ${name}: expected ${want}, got ${formatRational(got)}`)
}
// disease 1% via natural frequencies (the tree display path).
if (formatRational(naturalFrequencies(R(1,100), R(99,100), R(99,100), 10000).ppv) !== '1/2') {
  fail('bayes golden: naturalFrequencies disease 1% ppv ≠ 1/2')
}
// "more likely than not" crosses at k = 10, not k = 9.
{
  const half = R(1,2)
  const lt = (a: Rational, b: Rational) => a.n * b.d < b.n * a.d
  const k9 = sequentialPosterior(R(1,1000), R(1), R(1,2), 9)
  const k10 = sequentialPosterior(R(1,1000), R(1), R(1,2), 10)
  if (!(lt(k9, half) && lt(half, k10))) fail('bayes golden: 1000-coin should cross 1/2 at k = 10')
}
console.log('✓ bayes.ts goldens (2/3, 1/2, 1024/2023, 99/100, k=10, …)')
```

**(e) Chapters-coverage assertion** — a new block (kills the "invisible lessons" trap for *every* course that
declares chapters, so it guards PHT too):

```ts
const lessonIdsBuiltFixture = new Set(lessons.map((l) => l.lessonId))
for (const file of courseFiles) {
  const course = readJson(file) as {
    courseId: string
    chapters?: { id: string; lessonIds: string[] }[]
    lessons?: { lessonId: string; built: boolean }[]
  }
  const chapters = course.chapters ?? []
  if (chapters.length === 0) continue // coming-soon stubs with no chapters are exempt
  const builtNodes = (course.lessons ?? []).filter((l) => l.built).map((l) => l.lessonId)
  const chapterIds = chapters.flatMap((c) => c.lessonIds)

  // every chapter lessonId is a built lesson node…
  for (const id of chapterIds) {
    if (!builtNodes.includes(id)) fail(`${file}: chapter references non-built lesson "${id}"`)
  }
  // …and has a real lesson fixture…
  for (const id of builtNodes) {
    if (!lessonIdsBuiltFixture.has(id)) fail(`${file}: built lesson node "${id}" has no lesson-*.json fixture`)
    // …appearing in EXACTLY one chapter.
    const count = chapterIds.filter((c) => c === id).length
    if (count !== 1) fail(`${file}: built lesson "${id}" appears in ${count} chapters (must be exactly 1)`)
  }
  console.log(`✓ chapters-coverage: ${course.courseId}`)
}
```

**(f) interviewNote / notation-ladder confirmation.** No generalization needed:
- **interviewNote** — the existing GATED rule (`beats.some((b) => b.interviewNote)`) is satisfied by L1
  (`triangulate-23`), L2 (`compute-ppv`), L3 (`two-tests`). (Dept-1's L1 brief omitted one; this spec adds it.)
- **notation-ladder** — the bayes lessons author **no `introducesSymbol`** beats, so the per-track ordering
  check is vacuously satisfied. This is deliberate: the only candidate grounding (the `prior/likelihood/posterior`
  primer `name-the-parts`) is **track-A-only**, so tagging a `track:both` beat (`compute-posterior`) with
  `groundedBy:["name-the-parts"]` would FAIL the gate in track B (the grounding isn't visible). Bayes uses words,
  not Greek symbols, and the JIT primer precedes any use by construction — so no tags are the correct, safe
  choice.

---

## 7. Functions / milestones — does the lesson "complete" + award milestones?

**Dev build (`/dev/lesson/:lessonId`) — NO change needed; fully data-driven.**
- `src/content/devLessons.ts` builds its lesson map with `import.meta.glob('../../fixtures/lesson-*.json')` —
  every `fixtures/lesson-bayes-rule-*.json` is auto-included at build time with **zero registration**.
- The dev route passes **no `persistence`** to `LessonPlayer`, so `persist = false`
  (`LessonPlayer.tsx` line 61). `completeLesson`/`recordQualifyingAction` only fire when `persist` is true
  (lines 349, 370). Finishing the last beat sets `done` and shows the celebration + `BadgeStamp meta={milestone}`,
  where `milestone = milestoneMeta(lesson.milestoneId)` falls back to `{ id, title: id, glyph: '★' }` for an
  unregistered id (`src/habit/milestones.ts` lines 39–41) — **nothing breaks.** So the three lessons play and
  "complete" end-to-end on dev with no Functions/milestone change.

**Seeded / authed build (`/lesson/:lessonId`) — completion + unlock are data-driven; only milestone *seals*
need additive registration.**
- `completeLesson` (`functions/src/index.ts`) loads `lessons/{lessonId}` from Firestore, verifies required
  beats, writes `completionStatus:'completed'`, and unlocks `lesson.unlocks`. **No hardcoded lesson list** — it
  works for any seeded lesson. Requires `npm run seed` to upload the three lesson fixtures + the enriched course
  doc. ⇒ **completion + the L1→L2→L3 unlock chain need NO Functions change.**
- Milestone *awarding* uses the hardcoded `LESSON_MILESTONES` map (`functions/src/milestones.ts`). For the new
  lessons' seals to actually be granted server-side (and the course-completion `bayes-rule-complete` to fire),
  add the additive registration below. **This is NOT required for the lesson to complete/unlock** — milestone
  awarding is best-effort (wrapped in `try/catch` in `index.ts` lines 208–213); without it, completion still
  succeeds, only the seal isn't written.

Minimal additive change **(only if server-awarded seals are wanted on the seeded build)**:

```ts
// functions/src/milestones.ts — add to LESSON_MILESTONES:
'lesson-bayes-rule-1': 'bayes-rule-update',
'lesson-bayes-rule-2': 'bayes-rule-base-rate',
'lesson-bayes-rule-3': 'bayes-rule-stacking',
```

The existing `awardMilestonesForCompletion` only awards PHT's mid/course milestones (its `MID_COURSE_PATH` /
`FULL_COURSE_PATH` are PHT-specific). To award the per-concept `bayes-rule-complete`, generalize it with a small
per-concept completion table (the one **non-additive** touch — see Risk R-3):

```ts
// functions/src/milestones.ts
const CONCEPT_COMPLETIONS: Array<{ milestone: string; path: string[] }> = [
  { milestone: 'bayes-rule-complete',
    path: ['lesson-bayes-rule-1', 'lesson-bayes-rule-2', 'lesson-bayes-rule-3'] },
]
// inside awardMilestonesForCompletion, after the existing FULL_COURSE_PATH block:
for (const { milestone, path } of CONCEPT_COMPLETIONS) {
  const done = await Promise.all(path.map((id) => isLessonCompleted(db, uid, id)))
  if (done.every(Boolean) && (await awardMilestone(db, uid, milestone, lessonId))) newly.push(milestone)
}
```

And (display-only, additive) register the seals on the client so the gallery/recap show real titles/glyphs
instead of the `★` fallback — `src/habit/milestones.ts` `MILESTONE_SEQUENCE` (+ `MILESTONE_LESSONS`):

```ts
{ id: 'bayes-rule-update',     title: 'The Update Rule',    glyph: '2/3' },
{ id: 'bayes-rule-base-rate',  title: 'The Base-Rate Trap', glyph: '1%' },
{ id: 'bayes-rule-stacking',   title: 'Stacking Evidence',  glyph: '2ᵏ' },
{ id: 'bayes-rule-complete',   title: "Bayes' Rule Mastered", glyph: '✓×3' },
```

`functions/src/streaks.ts` is fully data-driven (no lesson-specific logic) — **no change**.

---

## 8. Risk register (anything not purely additive)

| # | Risk | Severity | Evidence | Minimal surgical fix |
|---|------|----------|----------|----------------------|
| R-1 | **`course-bayes-rule` flipped to `live` without `chapters[]`** → `resolveChapters` falls back to `ERGO_CHAPTERS` (PHT), `CourseJourney` drops every empty chapter → the three lessons render **invisible**. | **High (must-fix)** | `studyDesk.model.ts` 232–242; `CourseJourney.tsx` 77–81 | Ship the §5b `chapters[]` (covers all three, each in exactly one chapter) **and** the §6(e) chapters-coverage CI assertion so the trap fails CI. |
| R-2 | **`SliderBeat` reuse for a graded/reactive Bayes beat.** Stock `SliderBeat` is an *ungraded* prediction-lock: it writes `finalPrediction`/`theoreticalValue = automaton.expectedTimes.E0` (meaningless for Bayes) and surfaces only its own integer value — it cannot grade nor show a live posterior, and `slider` is excluded from `GRADED_TYPES`. | Medium → **eliminated** | `SliderBeat.tsx` 95–108; `validate-fixtures.ts` `GRADED_TYPES` | **Don't use `SliderBeat`.** Remap `base-rate-sweep` → `answerEntry` (3 fields); put the live prevalence dial inside `bayesUpdate` `display:'tree'`. Net: zero SliderBeat changes. (If a future design truly wants a live slider→posterior readout, fold it into `bayesUpdate`, never `SliderBeat`.) |
| R-3 | **Milestone seals on the seeded build.** Per-lesson seals + `bayes-rule-complete` are not awarded unless registered; `awardMilestonesForCompletion`'s course-completion is PHT-hardcoded. | Medium (seeded build only; not required for completion/unlock) | `functions/src/milestones.ts` 14–42, 79–115; `index.ts` 208–213 (best-effort) | §7: add 3 `LESSON_MILESTONES` lines (additive) + a small `CONCEPT_COMPLETIONS` table (the one non-additive touch) + client `MILESTONE_SEQUENCE` entries. **Not needed for the lesson to complete or unlock.** |
| R-4 | **GATED set additions impose new invariants.** Adding the 3 lessonIds requires: ≥1 primer, every `prediction` `byOption`, an `interviewNote`, a `retrievalGrid` first-graded opener. Dept-1's **L1 brief specified no `interviewNote`**. | Medium (additive, must-author) | `validate-fixtures.ts` 137–204 | This spec adds the L1 `interviewNote` on `triangulate-23`; all other GATED rules already satisfied (see each spec's Gate notes). |
| R-5 | **`masteryChallenge` with a `pattern` field** would trigger `buildAutomaton(pattern).E0 ∈ accept`, which fails for a Bayes fraction. | Low (avoidable) | `validate-fixtures.ts` 258–264 | Leave `pattern` **unset** on all three `masteryChallenge` beats (answers are Bayes fractions / a count, not hitting-times). |
| R-6 | **`bayesUpdate` is sometimes a hero, sometimes graded** — a single type-level gate can't express it. | Low (design decision) | grading rule §1; `HERO_TYPES`/`GRADED_TYPES` | Do **not** add `bayesUpdate` to `HERO_TYPES`/`GRADED_TYPES`; gate the hero/graded split on the beat-level `hero` block (renderer) + the bayes cross-check (CI). Documented in §6(b). |
| R-7 | **`patternOptions` must be valid H/T.** A non-H/T `patternOptions[0]` would otherwise break `buildAutomaton`. | Low (guarded) | `LessonPlayer.tsx` 128–130 (guards → `'H'`); `OverlapBeat`/`BiasSandboxBeat` map `buildAutomaton` over all options (unused by Bayes) | Author `patternOptions:["H"]` on all three lessons (§5a). |

**Everything else is purely additive:** the `bayesUpdate` schema member, the dispatcher case, the new
`BayesUpdateBeat.tsx`, the new `bayes.ts` (+ `bayes.test.ts`), the three lesson fixtures, the course enrichment
(only `status` flips; chapters/lessons are added), and the validate-fixtures cross-check + golden + coverage
blocks. No existing renderer, engine, or fixture is modified.

---

## 9. L4–L8 expansion — the n-hypothesis `bars` delta (the ONLY new build work)

> Author: Department 2, Wave-0 contract. L4–L8 are **pure reuse** of the already-frozen `bayesUpdate`
> type, `bayes.ts` engine, and the §1–§8 widgets, with **exactly one renderer generalization**: letting
> `bayesUpdate` `display:'bars'` draw **n > 2** hypotheses (and a 2-hypothesis `interactive:false` static
> frame, which shares that same code). **No new interaction type, no new engine function.** All 15 L4–L8
> headline/mastery answers reproduce exactly via the existing `bayesPosterior` (verified). The per-beat
> shapes are the L4–L8 rows in the §1 matrix; per-beat copy is in `lesson-bayes-rule-{4..8}/interaction-spec.md`.

### 9.1 What changes and what does NOT

| area | change for L4–L8? |
|------|-------------------|
| `src/content/schema.ts` (`bayesUpdate`) | **none** — `hypotheses.min(2)` + array `priors`/`likelihoods` already impose no upper bound; `0/1` is a valid `RationalSchema`. |
| `src/engine/bayes.ts` | **none** — `bayesPosterior(priors, likelihoods)` is already general n-way and normalizes over zero-likelihood hypotheses. |
| `src/lesson/beats/index.tsx` dispatcher | **none** — one `case 'bayesUpdate'` already serves all displays. |
| `src/lesson/beats/BayesUpdateBeat.tsx` — `BarsDisplay` | **THE delta** — generalize the hardcoded 2-bar body to map over `hypotheses.length` (§9.2). |
| `src/styles/.../beats-extended.css` | **+1 fill color** — add `.bayes-bars__fill--h2` (third hypothesis, for n = 3 in L4/L5); the renderer assigns `--h{i}` by index. Trivial, additive. |
| `TreeLargeDisplay` / `TreeSmallDisplay` (`tree`) | **none** — see §9.4. |
| `SequenceDisplay` (`sequence`) | **none** — L4–L8 use no `sequence`. |
| `scripts/validate-fixtures.ts` | **+10 lessonIds** to two sets (§9.5); the bayes cross-check + chapters-coverage are already generic. |

### 9.2 `BarsDisplay` — frozen n-hypothesis contract

The current `BarsDisplay` hardcodes two hypotheses: `livePrior = [pct, 100-pct]`, two `--h0/--h1` fills, one
binary drag-slider, focal posterior from the slider. Generalize it with a single branch on a **direct vs.
slider** predicate — the slider path stays **byte-for-byte unchanged**:

```ts
const n = ix.hypotheses.length
const priors      = ix.priors      ?? [{n:1,d:2}, {n:1,d:2}]   // 2-hyp defaults unchanged
const likelihoods = ix.likelihoods ?? [{n:1,d:1}, {n:1,d:2}]

// DIRECT render iff there are >2 hypotheses, OR the prior is declared fixed.
const direct = n > 2 || ix.interactive === false

if (!direct) {
  // ── PATH A: 2-hypothesis drag-slider — the EXISTING body, BYTE-FOR-BYTE UNCHANGED ──
  //   priorPct state, livePrior = [priorPct/100, (100-priorPct)/100],
  //   post = bayesPosterior(livePrior, likelihoods), two stacked --h0/--h1 fills,
  //   focal value = formatRational(post[0]).  (L1 explore-update is the only caller today.)
} else {
  // ── PATH B: DIRECT render (n>2 and/or interactive:false) ──
  const post = bayesPosterior(priors, likelihoods)   // length n, EXACT, may contain 0/1 entries
  // Render two grouped rows, each mapping over i = 0 … n-1:
  //   • a "Prior" group:     n labeled bars, width%[i] = round(100 * priors[i].n / priors[i].d)
  //   • a "Posterior" group: n labeled bars, width%[i] = round(100 * post[i].n  / post[i].d)   // 0 ⇒ 0-width
  //   each bar: label = ix.hypotheses[i]; fill class = `bayes-bars__fill--h${Math.min(i, 2)}`
  //   focal readout (the headline shown by the bar group) = formatRational(post[0])
  //   NO slider is rendered (the binary drag applies only on Path A); `interacted` starts TRUE
  //   so the BeatShell primary (Continue/Finish) is enabled immediately.
}
```

**Key frozen facts (must hold):**
- **Data source.** On Path B every width comes from `bayesPosterior(priors, likelihoods)` (and `priors[i]`
  for the prior group) — never from the slider. This is *why* Path B is also taken for `interactive:false`
  at n = 2: L7's prior (1/10001) and L6's structurally-fixed 1/4 cannot round-trip through the
  integer-percent slider (1/10001 → 0% → a wrong `0` posterior), but `bayesPosterior` reproduces the exact
  100/101 and 1/3.
- **Focal = `hypotheses[0]`.** The headline readout and the validator anchor are both
  `formatRational(bayesPosterior(priors, likelihoods)[0])`. Authors place the focal hypothesis first
  (L4 = Machine 1 → 5/17; L5 = Switch door → 2/3; L6 = Both boys → 1/3; L7 = Is the source → 100/101).
- **Monty's 0-bar (L5).** `likelihoods = [1, 1/2, 0]` ⇒ `bayesPosterior(...) = [2/3, 1/3, 0]`. The
  opened-door bar is **0-width but still labeled** ("Opened door") in the hypotheses/label text and in the
  aria-live summary. No special-casing — `0/1` falls straight out of the map.
- **2-hypothesis path is untouched.** Path A fires only when `n === 2 && interactive !== false` — i.e.
  exactly L1 `explore-update` today. Its code, DOM, and behavior are unchanged; **L1–L3 render
  identically.** No existing fixture takes Path B (no shipped n = 2 bars beat sets `interactive:false`),
  so Path B is purely additive.
- **"Render identically" for L6–L8.** L6/L7 are 2-hypothesis renderings (two bars) via Path B; L8 is a
  2-hypothesis `tree` (§9.4). None of them invoke any >2 layout, and none change L1–L3.

### 9.3 a11y for n bars (frozen)

- **Each bar labeled.** Every hypothesis bar carries its `hypotheses[i]` label as adjacent text (and the
  posterior value as text). 0-width bars keep their label (L5 opened door reads "Opened door — 0").
- **aria-live summary lists all n posteriors.** The visually-hidden `<p role="status" aria-live="polite">`
  mirrors the full vector in words, e.g.
  - L4: "Posterior: Machine 1 5 in 17, Machine 2 6 in 17, Machine 3 6 in 17."
  - L5: "Posterior: Switch door 2 in 3, Your door 1 in 3, Opened door 0 in 1."
  - L6/L7 (n = 2): "Posterior: Is the source 100 in 101, Is not the source 1 in 101."
- **44px.** Path B renders no slider; the only focusable control is the BeatShell primary (≥44px). Bars are
  non-interactive `<div>`s (no tap target needed). (Path A keeps its ≥44px range input.)
- **reduced-motion.** When `reducedMotion`, render the **final frame** (bars at settled widths, no width
  transition), honoring `hero.reducedMotionFinalFrame: true`. Same rule already in `.bayes-bars__fill`.

### 9.4 `tree` / icon-array — no n>2 handling needed (confirmed)

State explicitly: **the `tree` display and its tap-partition stay 2-class; no n>2 work.**
- L4 and L5 (the only n > 2 beats) use **`bars`**, not `tree`.
- **L6 `explore-children` was remapped off `tree`** (Dept-1 had `tree`+`population:4`) onto `bars` (n = 2,
  `interactive:false`). Reason: `TreeLargeDisplay`'s only affordance is a *prior-prevalence* drag, but the
  two-children prior is structurally fixed at 1/4, and at `population:4` the integer-percent slider yields
  non-integer family counts off the 25% multiples. `bars` Path B renders the exact 1/3 with **zero**
  renderer change; the 4-family enumeration moves to the graded `count-the-families` + the 400-family
  `triangulate-13` lens. (Details in the L6 spec.)
- **L8 `explore-cabs` reuses L2's `tree` verbatim** at `population:100` (draggable blue-cab base rate,
  PPV = 12/29). It is **n = 2** and behaves exactly like L2's `explore-frequencies`; the canonical 15% mix
  fills exact integer counts (12 / 3 / 17 / 68).
- `TreeSmallDisplay` (the L1 `count-the-heads` tap-partition) is **focal-vs-rest = 2-class** and is **not
  used by L4–L8** — unchanged.

### 9.5 `scripts/validate-fixtures.ts` additions for L4–L8 (exact)

1. **Gate sets — add the 5 lessonIds to both sets** (already shown in §6(b)): append
   `'lesson-bayes-rule-4' … 'lesson-bayes-rule-8'` to `GATED` and to `MASTERY_LESSONS`.
2. **Bayes cross-check — NO change.** The §3b block (`validate-fixtures.ts` ~133–157) already computes
   `bayesPosterior(priors, likelihoods)[0]` for non-`sequence` displays and asserts it equals the declared
   `posterior`. It is **already n-way** (`bayesPosterior` over the full arrays; focal = `hypotheses[0]`),
   so it covers L4/L5's **n = 3** rows (incl. the `0/1` likelihood) and L6/L7/L8's n = 2 rows with **zero
   edits**. The existing `priors.length === likelihoods.length && ≥ 2` guard already passes for length-3.
3. **Chapters-coverage — NO change to the block.** The §6(e) assertion (`validate-fixtures.ts` ~339–360)
   is generic over every course's `chapters[]`/`lessons[]`. It just needs the **course doc enriched to all
   8 lessons / 4 chapters** (§9.6); the assertion then verifies each of L1–L8 sits in exactly one chapter.
4. **Goldens (§2b) — OPTIONAL, recommended.** The fixture cross-check (#2) already guards every declared
   posterior once the fixtures exist. For fixture-*independent* CI coverage, append the L4–L8 headlines to
   the inline golden array (all verified):
   `bayesPosterior([1/2,3/10,2/10],[1/100,2/100,3/100])[0] = 5/17`;
   `bayesPosterior([25/100,20/100,55/100],[5/100,3/100,1/100])[0] = 25/48`;
   `bayesPosterior([1/3,1/3,1/3],[1,1/2,0])[0] = 2/3`;
   `bayesPosterior([1/3,1/3,1/3],[1/2,1/2,0])[0] = 1/2`;
   `bayesUpdate(1/8,1,6/7) = 1/7`; `bayesUpdate(1/10001,1,1/1000000) = 100/101`;
   `bayesUpdate(1/1000001,1,1/1000000) = 1/2`; `bayesUpdate(15/100,80/100,20/100) = 12/29`;
   `bayesUpdate(20/100,99/100,2/100) = 99/107`; `bayesUpdate(1/1000,95/100,1/100) = 95/1094`.

**No new gate-invariant code is needed.** The 5 lessons satisfy the **existing** GATED + MASTERY invariants
(per each spec's Gate notes), namely: ≥1 `primer`; every `prediction` uses `byOption`; **one `interviewNote`
per lesson** (L4 `count-the-defects`, L5 `compute-23`, L6 `bertrand`, L7 `cold-vs-cause`, L8 `spam-costume`);
the **first graded beat is the `retrievalGrid` opener** (`recall-*`); the last beat is `recap`, preceded by a
**required `masteryChallenge` with no `pattern`**. No `introducesSymbol` tags ⇒ the notation-ladder check is
vacuously satisfied (§6f). `HERO_TYPES`/`GRADED_TYPES` are **not** extended for `bayesUpdate` (R-6): the
hero/graded split rides the beat-level `hero` block (all five explore beats carry it ⇒ ungraded).

### 9.6 Course-doc enrichment for the 8-lesson concept (fixture, Wave 1)

`fixtures/course-bayes-rule.json` extends the §5b stub to all 8 lessons (the §6(e) assertion enforces it):
- **`chapters[]`** gains the two appended chapters from `concept-brief.md`:
  `{ id:"ch-bayes-rule-3", label:"More Than Two Hypotheses", accent:"ch3", lessonIds:["lesson-bayes-rule-4","lesson-bayes-rule-5"] }`
  and `{ id:"ch-bayes-rule-4", label:"Reading the Evidence Right", accent:"ch4", lessonIds:["lesson-bayes-rule-6","lesson-bayes-rule-7","lesson-bayes-rule-8"] }`.
  (ch-1/ch-2 unchanged; every L1–L8 lessonId appears in exactly one chapter.)
- **`lessons[]`** gains L4–L8 nodes (`built:true`, with `milestoneId`/`glyphKey`/`vizKey` per the table below).
- **`unlocks` chain.** Each L4–L8 lesson fixture sets `unlocks` to its successor (L4→L5→L6→L7→**L8→null**),
  and **L3's fixture `unlocks` flips `null → "lesson-bayes-rule-4"`** so the path is continuous L1…L8. (This
  is the one edit to an L1–L3 *fixture* value; the L3 *design* doc is not otherwise touched.)

| lesson | milestoneId | unlocks | glyphKey | vizKey |
|--------|-------------|---------|----------|--------|
| L4 lesson-bayes-rule-4 | `bayes-rule-nway` | lesson-bayes-rule-5 | `1/N` | `fourNode` |
| L5 lesson-bayes-rule-5 | `bayes-rule-monty` | lesson-bayes-rule-6 | `door` | `dice` |
| L6 lesson-bayes-rule-6 | `bayes-rule-condition` | lesson-bayes-rule-7 | `1/3` | `twoNode` |
| L7 lesson-bayes-rule-7 | `bayes-rule-direction` | lesson-bayes-rule-8 | `H\|E` | `twoNode` |
| L8 lesson-bayes-rule-8 | `bayes-rule-wild` | `null` | `12/29` | `coin` |

(Optional, seeded build only — mirrors §7: register the 5 new `LESSON_MILESTONES` + the client
`MILESTONE_SEQUENCE` seals, and extend `CONCEPT_COMPLETIONS`' `bayes-rule-complete` path to all 8. Not
required for completion/unlock on the dev build.)
