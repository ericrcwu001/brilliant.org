# Scorecard: Hitting Times & Absorption  (lesson-markov-chains-5)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Dice 7/13 = P(single 12 first), 6/13 = two-7s; drunkard 17/100, 1411 (OCR "1441" corrected); gambler 4/7, 6/7 (GB p.54–55); i/4 & i(4−i) (G&S Ex.11.13–15). Constructed dice item labeled + engine-verified. |
| 2 | Math correctness | Dept 3 Verify | ✅ | factcheck + markov.ts reproduce 4/7,6/7 · 1/4,1/2,3/4 · 7/13; validate green. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; one objective/beat; 10 reuse + 1 net-new (the matrix lift); concreteness-fade walk→matrix. |
| 4 | Misconceptions | Dept 1 | ✅ | 4 misconceptions elicited+refuted; `time-or-prob-bet` byOption (the +1 is the cost of a step), exactly one `correct:true`. |
| 5 | Interactivity | Dept 2 | ✅ | every beat genuine DM except scaffolding (`recap`, `lift-to-matrix` primer); 3 heroes run/step sims (`walk-recall`, `race-recall`, `solve-matrix`); no ContinueStub/auto-pass. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Opener `recall-first-step`; early win `iN-early-win` (required answerEntry); required `mastery-dice` before `recap`; interleave `time-vs-prob`; continuity = recall (no first-step re-derivation). **Required-flag HARMONIZED:** the 6 track:both ungraded beats (bet, 3 heroes incl. net-new `solve-matrix`, recap) are now `required:true` — only track:A `lift-to-matrix` stays `required:false`. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px + `aria-live` via reuse renderers; all 3 heroes `reducedMotionFinalFrame` + `structuralReadout`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 + eslint green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `lift-to-matrix` track:A; byOption `time-or-prob-bet`; interviewNote `solve-matrix`; walkBoard+raceSim carry hero blocks. |

**Overall:** READY — 9/9 gates green; every graded answer engine-verified, all interactions genuine, and the required-flag deviation is now harmonized (track:both ungraded beats flipped to `required:true`).
