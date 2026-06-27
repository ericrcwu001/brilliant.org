# Scorecard: Zero-Sum & Minimax  (lesson-game-theory-4)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Saddle point, minimax theorem (von Neumann 1928), 2×2 value formula, Two-finger Morra — cited in `../source-dossier.md` §L4. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `saddlePoint([[3,5],[2,4]])=3`, `saddlePoint([[4,6],[3,5]])=4`, `mixedValue2x2([[1,3],[4,2]])=5/2` (p ½), Morra `-1/12`; factcheck + validate cross-check. |
| 3 | Learning science | Dept 1 | ✅ | Saddle (pure value) first, then mixed value when none exists; maximin = minimax. |
| 4 | Misconceptions | Dept 1 | ✅ | `l4-bet` byOption refutes "always randomize" + "luck decides the value". |
| 5 | Interactivity | Dept 2 | ✅ | `payoffMatrix` value (row-min/col-max highlight) + mix slider. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L3 mixing; required `l4-prove` (value 5/2, p ½). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, aria-live, reduced-motion. |
| 8 | Technical implementation | Dept 3 | ✅ | all gates green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `✓ inclusivity gate: lesson-game-theory-4` + mastery gate. |

**Overall:** READY — the value of a zero-sum game (saddle + minimax).
