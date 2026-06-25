# Scorecard: Stacking Evidence  (lesson-bayes-rule-3)

> Reviewer sign-off (Manager-delegated). Gates + pass conditions per `.cursor/skills/lesson-factory/qa-rubric.md`.
> Beats: `recall-base-rate` → `open-bet` → `posterior-is-prior` → `due-vs-evidence` → `explore-sequence` →
> `two-tests` → `coin-ladder` → `triangulate-k10` → `mastery-challenge` → `recap`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | `brief.md` table cites GB p.38 (sequential "Unfair coin" → 2ᵏ/(2ᵏ+999), crosses ½ at k=10) + web: two-coin sequential 2ᵏ/(2ᵏ+1) (stats.stackexchange q514627); two 99% tests → 99/100 (quantblueprint). Exact rationals throughout. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `explore-sequence` posterior **1024/2023** cross-checked live (`validate` bayes block, `display:'sequence'` → `sequentialPosterior(1/1000,1,1/2,10)`). `two-tests` 99/100, `coin-ladder` 2/3·4/5·8/9, `triangulate-k10`/`mastery` k=10 (2⁹=512<999<1024=2¹⁰) all reproduced by engine goldens (`bayes.test.ts #17,#14-16,#18`). No floats. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove: `open-bet` (re-test) → `explore-sequence` (flip → posterior climbs hero) → `two-tests`/`coin-ladder` → `triangulate-k10`/`mastery`. Capstone synthesis (prior odds × ∏ LR). Track-A primer `posterior-is-prior` + `comparison` primer `due-vs-evidence`. Matches `interaction-spec.md`. |
| 4 | Misconceptions | Dept 1 | ✅ | `open-bet` `byOption` refutes "a re-test just confirms 50%" + "average to 75%" (independent evidence multiplies, doesn't average). `due-vs-evidence` (`comparison:true`) interleaves the gambler's-fallacy "never due" vs "each head is evidence" contrast from the Continuity Report. |
| 5 | Interactivity | Dept 2 | ✅ | `explore-sequence` (`display:'sequence'`, hero): tap "Flip" → posterior climbs step-by-step via `sequentialPosterior`, snapping to the exact rational each step (`BayesUpdateBeat.tsx:381-449`). Genuine direct-manipulation. (Visual climb rides on the missing stylesheet — gate 8.) |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `recall-base-rate` (first graded, `retrievalGrid`, early win) recalls L2's "one 99% test on 1% disease → 50%" (Continuity Report: L2 → L3 opener). Required `mastery-challenge` (smallest k → 10) immediately before the capstone `recap` (`validate` mastery gate ✓). `due-vs-evidence` is the corpus's sharpest interleave; GB 1000-coins re-surfaces a third time. `interviewNote` on `two-tests` (odds-form / log-LR stacking). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `role="status" aria-live="polite"` "After k observations: <posterior>" mirror (`:443-445`); reduced-motion starts the sequence at the final step (`useState(reducedMotion ? steps : 0)`, `:397`) so the final frame renders + Continue is reachable; "Flip"/"Continue" are native buttons (keyboard). Matches the spec. |
| 8 | Technical implementation | Dept 3 + Reviewer | ❌ | `validate`/vitest/tsc/eslint/build green; diff surgical. **BLOCKER:** no `.bayes-*` stylesheet (shared) — the `bayes-seq__track`/`__fill` progress meter has only an inline `width:%` (no height/color), so the posterior "climb" is invisible. "Uses design tokens" fails. e2e not run (rubric caveat). |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `lesson-bayes-rule-3` ∈ `GATED` + `MASTERY_LESSONS`; run prints "inclusivity gate: lesson-bayes-rule-3" + "mastery-challenge gate: lesson-bayes-rule-3" — gates run for real. |

## Issues
- **BLOCKER (gate 8 / design system):** shared missing `.bayes-*` CSS (see L1 scorecard). For L3 the `sequence` climb meter is the hero and is invisible without a styled track/fill. Fix: add the `.bayes-seq*` block (token-driven track `--ergo-surface-2` + `--chN` fill, `--dur-*` transition) to `beats-extended.css`.
- **Non-blocking:** brief `☐ engine` checkboxes unchecked despite full golden coverage (cosmetic).

**Overall:** NOT READY — 8/9 gates green; blocked solely by the missing `.bayes-*` stylesheet (gate 8). READY once `beats-extended.css` gains the Bayes block.
