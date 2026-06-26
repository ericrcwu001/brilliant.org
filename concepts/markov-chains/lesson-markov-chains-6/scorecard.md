# Scorecard: The Stationary Distribution  (lesson-markov-chains-6)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | WEB-anchored (stationary/Kac absent from GB): (3/7,4/7) Math.SE 3336273; π(Sunny)=4/7 GeeksforGeeks (`read-the-share`); cloudy (1/5,2/5,2/5) + Kac sunny 5 Rochester ECE440 HW5#2. |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces 4/7, (3/7,4/7), 7/3, (1/5,2/5,2/5), Kac 5; validate green; goldens + factcheck. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove→consolidate; πP=π felt at the hero, then proven at `solve-pi`. |
| 4 | Misconceptions | Dept 1 | ✅ | `settle-bet` byOption (start-dependence / freezes), one `correct:true`; "stationary = stuck/absorbing" refuted at `absorbing-vs-stationary`. |
| 5 | Interactivity | Dept 2 | ✅ | **FIXED.** `read-the-share` is now a typed long-run-share input graded vs `stationary[cellRow]`; the settled bars are VALUE-LESS and there is no "Stationary:" readout (interaction test: input present, no `>4/7<`, no `Stationary:`, Check disabled initially) — no auto-pass, no leak. `watch-it-settle` hero now renders BOTH starts (Started Clear / Started Rainy) converging to π. Other beats genuine DM (`solve-pi`/`kac-return` answerEntry, tripletReveal, retrievalGrid). |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener (`recall-geometric`); required `mastery-cloudy-town` before `recap`; interleave `absorbing-vs-stationary`; the early-win read-off is now genuinely graded. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px input + `aria-live`; hero `reducedMotionFinalFrame` → settled bars on reduced motion. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. interaction test) + eslint green; surgical renderer fix (DistributionDisplay graded input + dual-start hero). |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-stationary` track:A; byOption `settle-bet`; interviewNote `mastery-cloudy-town`. |

**Overall:** READY — prior blocker fixed: `read-the-share` is now a real graded read-off (typed share vs engine π, value-less bars, no leak) and `watch-it-settle` shows both starts converging; regression-tested.
