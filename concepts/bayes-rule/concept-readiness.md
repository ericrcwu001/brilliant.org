# Concept Readiness — Bayes' Rule  (course-bayes-rule)

> Manager-delegated reviewer sign-off. One-screen summary per `qa-rubric.md` §"Concept-level readiness".
> Build is mechanically green on `concept/bayes-rule` @ `1dc7a62` (base `3bfcd9e`): `validate-fixtures`,
> 294 vitest, tsc, eslint, vite build all pass (independently re-ran `validate-fixtures` + the 55 bayes
> vitest during review). e2e was **not** run (rubric caveat: Playwright `webServer` uses `npm run dev`).

## Catalog card  (auto-registers in the macro home `/`)

| field | value |
|-------|-------|
| courseId | `course-bayes-rule` |
| domain / domainOrder / order | Probability / 0 / 3 (4th Probability concept; no clash) |
| status | `live` (flipped from `coming_soon`) |
| tagline | "Update your beliefs when new evidence arrives." (46 chars ≤ 60 ✓) |
| accent | `ch2` ✓ (enum ch1–ch5) |
| vizKey | `twoNode` ✓ (enum coin/stateMachine/raceLanes/randomWalk/twoNode/fourNode/sum/dice) |

**Chapters → lessons** (every built lessonId in exactly one chapter; mechanized by `validate-fixtures.ts`
§6 "chapters-coverage: course-bayes-rule" ✓ — no fallback to PHT chapters, no invisible lessons):

| chapter | label | accent | lessons |
|---------|-------|--------|---------|
| ch-bayes-rule-1 | The Update Rule | ch1 | L1 `lesson-bayes-rule-1` (glyph `2/3`, viz `twoNode`) |
| ch-bayes-rule-2 | Evidence in the Real World | ch2 | L2 `lesson-bayes-rule-2` (`1%`, `coin`), L3 `lesson-bayes-rule-3` (`2ᵏ`, `sum`) |

## Lesson verdicts

| lesson | title | gates | verdict |
|--------|-------|-------|---------|
| L1 | The Update Rule | 8/9 ✅ · gate 8 ❌ | **NOT READY** (CSS blocker only) |
| L2 | The Base-Rate Trap | 8/9 ✅ · gate 8 ❌ | **NOT READY** (CSS blocker only) |
| L3 | Stacking Evidence | 8/9 ✅ · gate 8 ❌ | **NOT READY** (CSS blocker only) |

Math, pedagogy, misconceptions, assessment/mastery/continuity, and accessibility are green across all
three (see per-lesson scorecards). The single blocker is shared and additive.

## Headline citations + engine cross-check

Green Book anchor: **Ch.4 §"Conditional Probability and Bayes' Formula," p.37–42**. Every headline is an
exact rational independently reproduced by `src/engine/bayes.ts` (pure, no floats — reuses
`reduce/ratAdd/ratSub/ratMul/ratDiv` from `automaton.ts`):

| lesson | headline | source | engine | cross-check |
|--------|----------|--------|--------|-------------|
| L1 | two-coin, 1 head → **2/3** | q514627 / mathproblems.info (GB p.37–38) | `bayesPosterior` | `validate` bayes block (`explore-update`,`count-the-heads`) |
| L1 | boys-girls 1/3 ; "meet a boy" 1/2 ; HH → 4/5 | GB p.37–38 | `bayesUpdate`/`sequentialPosterior` | `bayes.test.ts #3,#4,#2` |
| L2 | 99% test, 1% disease → **1/2** | quantblueprint / gitbook | `naturalFrequencies`=`bayesPosterior` | `validate` (`explore-frequencies`) + `#6` |
| L2 | 1000-coins, 10 H → **1024/2023** ; sweep 11/12, 33/34 ; 95%-acc → 19/118 | GB p.38 ; PMC3055966 ; Downey | `sequentialPosterior`/`bayesUpdate` | `bayes.test.ts #10,#7,#8,#9` |
| L3 | sequence → **1024/2023** ; two tests → 99/100 ; ladder 2/3,4/5,8/9 ; cross at **k=10** | GB p.38 ; quantblueprint | `sequentialPosterior`/`oddsToProb∘posteriorOdds` | `validate` (`explore-sequence`) + `#17,#14-16,#18` |

`validate-fixtures` prints **"bayesUpdate posteriors match bayes.ts (4 beats)"** (the 4 in-lesson
`bayesUpdate` heroes), and the inclusivity + mastery-challenge gates **run for all 3 lessons** (the
documented vacuous-pass trap is closed: lessonIds are wired into `GATED`/`MASTERY_LESSONS`).

## Interview Pack  (`interviews/course-bayes-rule.md` / `.json`, v1.0.0 — committed-but-NOT-deployed)

- **57 questions**, tiers Hard 12 · Harder 36 · Brutal 9; 9 engine-backed templates + 6 free-form
  showcases (Monty Hall, taxicab, Bertrand's box, prosecutor's fallacy, two 1000-coin thresholds);
  fingerprints all unique (57/57). Interviewer + generator prompts present with the no-leak / grounding /
  engine-verify-before-serve / avoid-list clauses.
- ⚠️ **Caveat (non-blocking for the lessons; blocks the Interview-Pack Scorecard):** all 57 are flagged
  `"verified": true`, but **8 records** (6 `oddsUpdateProb`, 2 `smallestKCross`) name `engineCheck.fn`
  functions that **`bayes.ts` does not export** (it exports `bayesUpdate, bayesPosterior, posteriorOdds,
  sequentialPosterior, naturalFrequencies, oddsToProb, formatRational`), and **no committed test/script
  re-verifies the pool** (`validate-fixtures` only covers `fixtures/`). So "100% engine-verified" is
  self-asserted, not reproducible by the committed engine for those 8. The pack is dormant (never seeded),
  so this does not affect the lesson dev deploy — but the Interview-Pack sign-off is not earned until the
  engine exposes `oddsUpdateProb`/`smallestKCross` (or the records remap to `oddsToProb∘posteriorOdds` +
  a threshold helper) **and** a committed pool-verifier asserts `formatRational(fn(args)) === answer` for
  all 57.

## Issues (classified)

- **BLOCKER (1) — missing `.bayes-*` stylesheet.** `BayesUpdateBeat.tsx` references `bayes-bars*/tree*/
  icons*/seq*` BEM classes that exist in **no** stylesheet (`git grep bayes -- src/**/*.css` = none; the
  diff changes no `.css`). The central widget renders unstyled: the prior/posterior bars and the sequence
  climb meter have only an inline `width:%` (no height/background/flex) → the signature "watch the
  posterior swing/climb" is **visually invisible**; the confusion grid degrades to a bare HTML table.
  Mechanized checks can't catch it (className strings are valid TS; eslint has no undefined-class rule;
  vite build doesn't require the classes; jsdom ignores CSS). **Fix (additive, ~low-risk):** add a
  `.bayes-*` block to `src/styles/surfaces/beats-extended.css` using only `--ergo-*`/`--chN`/`--s*`/`--r-*`
  tokens, mirroring the existing race/walk/ledger blocks. The component hardcodes no colors → no `.tsx`
  change needed. Then verify rendering in `/` + `/concept/course-bayes-rule`.
- **Non-blocking:** (a) Interview-pack engine-verification gap above. (b) brief problem tables show
  `☐ engine` unchecked though the goldens reproduce every value (stale checkbox). (c) `count-the-heads`
  uses a hardcoded `🪙` glyph for both hypotheses (distinguished by `aria-label`/CSS tint).

## Overall: **NO-GO for dev deploy (as-is) — single blocker**

The concept is exemplary on correctness (exact-rational engine, 4 live cross-checks, 294 vitest),
pedagogy (Bet→Explore→Model→Prove, byOption refutations, retrieval openers + required mastery challenges,
continuity recall/interleave mapped 1:1 from the Continuity Report), surgical-ness (one engine, one folded
interaction type, additive validate wiring that closes the vacuous-pass trap), and accessibility
(aria-live mirrors, 44px, reduced-motion final frame, keyboard). It is held back by exactly one thing: the
new `bayesUpdate` beat has no CSS, so its hero widget is unstyled.

**Flip to GO the moment the `.bayes-*` stylesheet lands in `beats-extended.css` and the concept is verified
rendering on `/` + the per-concept journey** — no math/pedagogy/a11y/architecture rework is required. The
Interview Pack stays committed-but-dormant and is out of scope for this GO; resolve its engine-verification
gap before activating it.

---

- **Design system:** ❌ Fail/blocker — component correctly uses zero hardcoded colors but its `bayes-*`
  classes have no stylesheet at all; add a token-driven block to `beats-extended.css` (no `.tsx` change).
- **Accessibility:** ✅ Strong — `role="status" aria-live="polite"` mirrors in all four displays, 44px
  range/button targets, reduced-motion final-frame + keyboard-native controls; semantic confusion `<table>`.
