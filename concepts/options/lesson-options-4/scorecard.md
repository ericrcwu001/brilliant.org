# Scorecard: One-Step Binomial — Price by Replication  (lesson-options-4)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #13–#16, GB §6.1 risk-neutral L11002 + §5.3 backward L9497; tree mechanics web-sourced (Cudina/Worrall/AnalystPrep) |
| 2 | Math correctness | Dept 3 Verify | ✅ | canonical (S=100,u=6/5,d=4/5,R=1,K=100): q=1/2, price=10, Δ=1/2, B=−40, hedge cost=10; twin price=30,Δ=3/4,B=−45; transfer put price=10,Δ=−1/2,B=60, parity C−P=0 — engine cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | replicate-then-price; faded model card; cold opener recalls E[X] then the productive-failure twist (real p vs q) |
| 4 | Misconceptions | Dept 1 | ✅ | **marquee:** byOption refutes "q = the real probability / a Bayes posterior / a first-step average"; feed-forward |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/binomialTree (tap node → S/q-weight/value; {Δ,B} panel; reveal hedge = price) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | gate opt4-gate (correct risk-neutral-pricing; foils linearity-indicators, conditioning, prior-update ⊂ CONFUSABLE); held-out transfer #16 (schemaId=risk-neutral-pricing); mastery (split, q-prefill assist); interleaves p vs q vs posterior |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/tsc/vitest/build/eslint green; surgical |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | GATED; inclusivity + mastery gates pass |

**Overall:** READY — the price is the cost of the replicating hedge; q is a no-arb measure, not a probability.
