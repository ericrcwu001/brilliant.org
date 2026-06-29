# Scorecard: Put-Call Parity & No-Arbitrage  (lesson-options-2)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #5–#8, GB §6.1 p.70 L10820/L10840 (parity C−P=S−K·D); conversion-trade + bound web-sourced |
| 2 | Math correctness | Dept 3 Verify | ✅ | parityGap(8,2,100,95,1)=1; paritySolve P(C=10,S=100,K=100,D=1)=10; transfer paritySolve C(P=3,S=50,K=44,D=10/11)=13 — engine cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; primer model card faded; cold opener recalls dominance ("best no matter what") |
| 4 | Misconceptions | Dept 1 | ✅ | byOption: parity-sign errors, "discount the strike not the spot"; feed-forward |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/parityScale (C+K·D vs P+S balance; tilt = arbitrage gap; build the conversion) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | gate opt2-gate (correct put-call-parity; foils no-arbitrage-replication, payoff-construction); held-out transfer #8 (D=10/11, schemaId=put-call-parity); mastery (split); Continuity: dominance→no-arbitrage recall |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/tsc/vitest/build/eslint green; surgical |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | GATED; inclusivity + mastery gates pass |

**Overall:** READY — pricing forced by no-arbitrage; the conversion arbitrage is built, not described.
