# Scorecard: Multi-Step Binomial → Black-Scholes  (lesson-options-5)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #17–#20, GB §5.3 backward L9497 + §6.1 risk-neutral L11319; BS formula #19 GB §6.1 L11274 (display-only) |
| 2 | Math correctness | Dept 3 Verify | ✅ | 2-step (S=100,u=6/5,d=4/5,R=1,K=100): terminals 144/96/64, weights 1/4·1/2·1/4, price=11; transfer 3-step uuu = 1 path, terminal 864/5; pathCount 1/2/1 — engine cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | fold-the-tree by doing; BS reached only as the slider limit; cold opener recalls Pascal/nCk row-sum 2ⁿ |
| 4 | Misconceptions | Dept 1 | ✅ | byOption: "BS is graded", path-count vs node-weight conflation; feed-forward |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/binomialTree (multi-step fold) + greeksSlider (DISPLAY-ONLY continuous limit, no accept) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | gate opt5-gate (correct binomial-pricing; foils backward-induction, first-step-analysis, recursion-self-reference); held-out transfer #20 (schemaId=binomial-pricing); mastery (split, same-method Part A/B); nCk interleave |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/tsc/vitest/build/eslint green; **Black-Scholes/continuous Greeks never an accept** (greeksSlider exempt from §3h) |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | GATED; inclusivity + mastery gates pass |

**Overall:** READY — node weights are nCk·qᵏ(1−q)ⁿ⁻ᵏ; Black-Scholes is reached, never engine-graded.
