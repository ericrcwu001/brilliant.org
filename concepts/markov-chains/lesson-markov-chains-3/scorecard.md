# Scorecard: Multi-Step Transitions  (lesson-markov-chains-3)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | `explore-powers`/`read-another-entry` = G&S Land of Oz; (P²)R,S=3/8; `warmup-two-step` 2-state→12/25 (Math.SE 3336273); `mastery-three-day-snow` 25/64 constructed+engine-verified; one-path 1/8 GB §5.1. |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces 3/8, 7/16, 12/25, 25/64; validate green; markov.ts goldens. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; load ramps 2-state warmup→3-state Oz; matrix-power notation after JIT primer. |
| 4 | Misconceptions | Dept 1 | ✅ | 6 misconceptions elicited+refuted; `predict-two-day-snow` byOption 4 keys match options, exactly one `correct:true` (3/8). |
| 5 | Interactivity | Dept 2 | ✅ | every beat genuine DM: retrievalGrid, prediction, answerEntry×2, chainBoard:powers×2 (`explore-powers` hero / `read-another-entry` cell-tap, Check disabled until tap), tripletReveal, masteryChallenge; primer/recap exempt. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrieval opener `recall-total-prob`; early win `warmup-two-step`; required `mastery-three-day-snow` before `recap`; opener recalls (not re-teach) Penney/Bayes-4 LTP. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px tap/step + `aria-live`; `explore-powers` hero `reducedMotionFinalFrame`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 + eslint green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-chapman-kolmogorov` track:A; byOption `predict-two-day-snow`; interviewNote `model-ck-three-ways`. |

**Overall:** READY — 9/9 gates green; no harmful hint leak. The prior recap "Next up" nit is FIXED — it now points to L4 (classifying states: recurrent / transient / absorbing).
