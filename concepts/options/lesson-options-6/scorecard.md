# Scorecard: Synthesis — Hedging, Greeks & In the Wild  (lesson-options-6)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #21–#22 + Greek-signs note + one-touch; GB §6.2 p.75 L11736/L11741, §6.4 p.82 L12795, §4.5 p.48 L7647 |
| 2 | Math correctness | Dept 3 Verify | ✅ | hedgeRatio(6,9)=2/3, (−6,9)=−2/3; minVarWeights(1/25,9/100,3/100)→wA 6/7, wB 1/7, Var 27/700; oneTouchPrice(5/4)=4/5,(2)=1/2; Greek signs exact — engine cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | cumulative interleaved capstone (cloned states-streaks design); two cold retrieval openers; greeksSlider display-only |
| 4 | Misconceptions | Dept 1 | ✅ | byOption: delta sign, "σ is graded", which-tool confusion; feed-forward, no person-verdict |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/greeksSlider (display-only) + answerEntry sign-selector (greekSign) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | gate opt6-gate (correct delta-hedging; foils linearity-indicators, no-arbitrage-replication, binomial-pricing); separate one-touch checkpoint (no-arbitrage-replication); held-out transfer #22 (schemaId=delta-hedging); mastery (split, multi-part); **delta = Cov/Var hedge ratio** interleave (covariance recall) |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/tsc/vitest/build/eslint green; surgical |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | GATED; inclusivity + mastery gates pass |

**Overall:** READY — the option delta is the hedge ratio you already know; choose the tool on unlabeled problems.
