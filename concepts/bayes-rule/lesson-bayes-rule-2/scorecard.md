# Scorecard: The Base-Rate Trap  (lesson-bayes-rule-2)

> Reviewer sign-off (Manager-delegated). Gates + pass conditions per `.cursor/skills/lesson-factory/qa-rubric.md`.
> Beats: `recall-update` → `open-bet` → `name-base-rate` → `explore-frequencies` → `compute-ppv` →
> `ten-heads` → `base-rate-sweep` → `triangulate-half` → `mastery-challenge` → `recap`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | `brief.md` table cites GB p.38 ("Unfair coin" 1000-coins → 1024/2023) + web sources: disease 1%/99% → 1/2 (quantblueprint; gitbook "Canonical Stats Questions"); PMC3055966 sweep (10%→91.7%, 25%→97.1%); Downey BiteSizeBayes (95%-acc → ~16%). All exact rationals. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `explore-frequencies` posterior **1/2** cross-checked live (`validate` bayes block; PPV via `naturalFrequencies` = `bayesPosterior[0]` = 99/198 = 1/2). `compute-ppv` 1/2, `ten-heads` 1024/2023, `base-rate-sweep` 1/2·11/12·33/34, `mastery` 19/118 all reproduced by engine goldens (`bayes.test.ts #6,#10,#7,#8,#9`; `validate` inline goldens). No floats. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove: `open-bet` (99% / 95% / 50%) → `explore-frequencies` (drag prevalence, 10,000-person confusion grid hero) → `compute-ppv` → `ten-heads`/`base-rate-sweep` → `triangulate-half`/`mastery`. One objective per beat; Track-A primer `name-base-rate` precedes the trap. Matches `interaction-spec.md`. |
| 4 | Misconceptions | Dept 1 | ✅ | `open-bet` `byOption` refutes base-rate neglect ("99% accurate ⇒ 99% sick" reads P(+\|sick) as P(sick\|+)) + "around 95%"; copy mirrors the brief's Misconception-Specialist (false positives are *not* negligible). |
| 5 | Interactivity | Dept 2 | ✅ | `explore-frequencies` (`display:'tree'`, hero): drag prevalence → `naturalFrequencies` recomputes the TP/FP/FN/TN grid + PPV live (`BayesUpdateBeat.tsx:183-258`), exact integer counts (99 TP vs 99 FP at 1%). Genuine direct-manipulation. (Visual rendering rides on the missing stylesheet — gate 8.) |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `recall-update` (first graded, `retrievalGrid`, early win) recalls L1's "evidence rescales the prior" per the Continuity Report (L1 headline → L2 opener). Required `mastery-challenge` (95%-test → 19/118) immediately before `recap` (`validate` mastery gate ✓). `ten-heads` interleaves the coin world + seeds L3's sequence; base-rate re-surfaces in L3. `interviewNote` on `compute-ppv` (PPV / class-imbalance). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `role="status" aria-live="polite"` TP/FP/PPV mirror (`:256-258`); confusion grid is a real `<table>` with `<th scope="row">` + per-cell `aria-label`; 44px prevalence range (`:224`); reduced-motion gates transitions + final frame. Matches the spec. |
| 8 | Technical implementation | Dept 3 + Reviewer | ❌ | `validate`/vitest/tsc/eslint/build green; diff surgical. **BLOCKER:** no `.bayes-*` stylesheet (shared with L1/L3) — the confusion grid renders as an unstyled HTML table and the prevalence/PPV affordances have no Ergo styling. "Uses design tokens" fails. e2e not run (rubric caveat). |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `lesson-bayes-rule-2` ∈ `GATED` + `MASTERY_LESSONS`; run prints "inclusivity gate: lesson-bayes-rule-2" + "mastery-challenge gate: lesson-bayes-rule-2" — gates run for real. |

## Issues
- **BLOCKER (gate 8 / design system):** shared missing `.bayes-*` CSS (see L1 scorecard). For L2 the `tree` confusion grid is the hero and falls back to browser-default table rendering — readable but off the Ergo bar. Fix: add the `.bayes-tree*` block (token-driven cell fills, e.g. `--ok-tint`/`--bad-tint` for TP/FP) to `beats-extended.css`.
- **Non-blocking:** brief `☐ engine` checkboxes unchecked despite full golden coverage (cosmetic).

**Overall:** NOT READY — 8/9 gates green; blocked solely by the missing `.bayes-*` stylesheet (gate 8). READY once `beats-extended.css` gains the Bayes block.
