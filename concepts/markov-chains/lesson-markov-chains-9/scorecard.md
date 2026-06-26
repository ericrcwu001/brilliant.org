# Scorecard: PageRank  (lesson-markov-chains-9)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Graded = SOURCED vectors: `confirm-symmetry`/`explore-damping` (1/3,1/3,1/3) theorempath; `mastery-fourNode` (4/13,5/13,1/13,3/13) practicaldsc. Constructed d=1/2 vector absent from fixture. WEB-only (no GB). factcheck cross-checks every graded number. |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces (1/3,1/3,1/3) and (4/13,5/13,1/13,3/13); validate green; goldens. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; PageRank = L6 stationary of the damped Google matrix, recalled not re-taught. |
| 4 | Misconceptions | Dept 1 | ✅ | `open-bet` byOption (most-in-links trap), one `correct:true`; damping/dangling-sink misconceptions refuted at `explore-damping`/`damping-saves-sink`. |
| 5 | Interactivity | Dept 2 | ✅ | `weight-by-source` (diagram+pagerank) node buttons now show LABELS ONLY (prompt reworded → "tap the top-ranked page"); `explore-damping` hero damping slider; `damping-saves-sink` grades unique/not-unique chips. `Check` disabled until a tap. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | **FIXED.** `weight-by-source` no longer renders any PageRank value, so the `mastery-fourNode` vector (4/13,5/13,1/13,3/13) is NO LONGER pre-displayed (interaction test: no 4/13·5/13·1/13·3/13 in render; node label "2" present; `damping-saves-sink` shows no LINK4 4/13). The capstone mastery now genuinely assesses. Opener `recall-no-champion`; required mastery before recap; L6/L7 (π / convergence) interleave; continuity = recall. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px buttons/slider + `aria-live`; hero `explore-damping` `reducedMotionFinalFrame`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. interaction test no-leak cases) + eslint green; surgical (node labels only; `markov.ts` unchanged). |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-the-surfer` track:A; byOption `open-bet`; interviewNote `mastery-fourNode`. |

**Overall:** READY — prior gate-6 leak fixed: the graded PageRank diagram now shows node labels only, so the capstone mastery vector is no longer pre-displayed (regression-tested no-leak). Micro-nit (non-blocking, N3-class): `damping-saves-sink`'s prompt says "toggle damping off then on," but the slider lives on the preceding `explore-damping` hero — the graded control here is the unique/not-unique chip; optional prompt softening.
