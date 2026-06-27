# Scorecard: Dominance & the Prisoner's Dilemma  (lesson-game-theory-1)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | PD (Wikipedia), guess-⅔-average (Nagel 1995/Wikipedia), traveler's dilemma (Basu) — all cited in `../source-dossier.md` §L1. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `iesdsSolution(PD)=(1,1)`, `pureNashEquilibria(PD)=[(1,1)]`, 3×3 IESDS survivor `(1,0)`; reproduced in factcheck + validate-fixtures headline cross-check. |
| 3 | Learning science | Dept 1 | ✅ | Bet→Explore→Model→Prove; one idea/beat; concreteness-fading (PD → IESDS → 2/3-average). |
| 4 | Misconceptions | Dept 1 | ✅ | `l1-bet` byOption refutes "cooperate is stable" + "mixed". |
| 5 | Interactivity | Dept 2 | ✅ | `payoffMatrix` dominance/bestResponse tapping; no text walls. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls Penney non-transitivity (continuity-report); guaranteed early win; required `l1-prove` masteryChallenge. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px cells/headers; aria-live; reduced-motion final frame. |
| 8 | Technical implementation | Dept 3 | ✅ | validate-fixtures + tsc + vitest + build green; surgical diff. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `✓ inclusivity gate: lesson-game-theory-1` + `✓ mastery-challenge gate`. |

**Overall:** READY — dominance + the prisoner's dilemma, every number engine-verified.
