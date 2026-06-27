# Scorecard: Mixed Strategies  (lesson-game-theory-3)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Matching Pennies, Rock-Paper-Scissors, AKQ bluff, Battle of the Sexes mix — cited in `../source-dossier.md` §L3. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `mixedValue2x2(MP)=0` (p ½), `mixedValue2x2(Morra)=-1/12` (p 7/12), `mixedNash2x2(BoS).p=3/5`, `pureNashEquilibria(MP)=[]`; factcheck + validate cross-check. |
| 3 | Learning science | Dept 1 | ✅ | Indifference principle: no-pure-NE → randomize → exact fractions. |
| 4 | Misconceptions | Dept 1 | ✅ | `l3-bet` byOption refutes deterministic RPS; "randomize ≠ always 50/50" (Morra 7/12). |
| 5 | Interactivity | Dept 2 | ✅ | `payoffMatrix` mix indifference slider; answerEntry. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L2 "no pure NE"; required `l3-prove` (Morra 7/12, −1/12). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px slider, aria-live readouts, reduced-motion frame at p*. |
| 8 | Technical implementation | Dept 3 | ✅ | all gates green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `✓ inclusivity gate: lesson-game-theory-3` + mastery gate. |

**Overall:** READY — mixed-strategy equilibrium via the indifference principle.
