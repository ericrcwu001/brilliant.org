# Scorecard: Sequential Games & Backward Induction  (lesson-game-theory-5)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | **Pirate game (Green Book p.3)**, **Tiger & sheep (Green Book p.4)**, centipede (Wikipedia/MIT 14.12), entry deterrence — cited in `../source-dossier.md` §L5. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `backwardInduction` SPE payoffs: entry `2,1`, scaffold `3,0`, centipede `1,0` (path Take); `pirateGame(5,100)=[98,0,1,0,1]`, `pirateGame(3,100)=[99,0,1]`, `tigerSheepEaten(100)=false`; factcheck + validate cross-check. |
| 3 | Learning science | Dept 1 | ✅ | Backward induction: small tree → centipede → pirates; fold from the end. |
| 4 | Misconceptions | Dept 1 | ✅ | `l5-bet` byOption refutes "fair split"/"senior tossed"; centipede "rational cooperate". |
| 5 | Interactivity | Dept 2 | ✅ | `gameTree` fold-by-backward-induction. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L1 PD (one-shot) + Penney second-mover; required `l5-prove` (pirate 3/100 + tiger&sheep). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px node taps, aria-live SPE, reduced-motion folded frame. |
| 8 | Technical implementation | Dept 3 | ✅ | all gates green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `✓ inclusivity gate: lesson-game-theory-5` + mastery gate. |

**Overall:** READY — backward induction, anchored to the Green Book pirate & tiger-and-sheep teasers.
