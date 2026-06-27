# Scorecard: Winning Strategies: Nim & Symmetry  (lesson-game-theory-6)  — CONCEPT FINALE

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Nim/Bouton (Wikipedia), 21/subtraction (NYU), coins-on-a-table (techinterview), **chocolate-bar invariant (Green Book)** — cited in `../source-dossier.md` §L6. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `subtractionWinningMove(10,3)=2`, `7%4=3`, `nimSum([3,4,5])=2`, `nimSum([1,4,5])=0` (mover loses), `6·8−1=47`; factcheck + validate cross-check. |
| 3 | Learning science | Dept 1 | ✅ | P/N positions → subtraction (mod k+1) → Nim (XOR) → symmetry/invariant; interleaves "strategy vs forced". |
| 4 | Misconceptions | Dept 1 | ✅ | `l6-bet` byOption refutes "first player always wins"; "bigger heap wins"; "every game has a strategy". |
| 5 | Interactivity | Dept 2 | ✅ | `nimBoard` token removal (nim + subtraction). |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L5 backward induction; required `l6-prove` (nim-sum 0 ⇒ lose); recap closes the whole arc. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px token taps, aria-live nim-sum/win-lose, reduced-motion frame. |
| 8 | Technical implementation | Dept 3 | ✅ | all gates green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `✓ inclusivity gate: lesson-game-theory-6` + mastery gate. |

**Overall:** READY — impartial-game winning strategies (nim-sum, parity, symmetry); concept finale.
