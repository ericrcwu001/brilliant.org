# Scorecard: Spreads & Straddles  (lesson-options-3)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #9–#12, GB §6.3 p.80 L12449–12503 (bull spread + bound), L12527–12566 (straddle/strangle family) |
| 2 | Math correctness | Dept 3 Verify | ✅ | bull(100,120)→20(cap)/10/0; butterfly(90,100,110) peak 10, wings 0; transfer strangle(90,110)→20/0/20 — engine cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | compose-by-doing; faded model card; cold opener recalls L1 payoff |
| 4 | Misconceptions | Dept 1 | ✅ | byOption: leg-sign/cap errors, "a spread is unbounded"; feed-forward |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/payoffDiagram (multi-leg drag, hero block; caps & break-points read live) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | gate opt3-gate (correct payoff-construction; CONFUSABLE foils); held-out transfer #12 strangle; mastery (split); opt3-compare (same method, new costume) |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/tsc/vitest/build/eslint green; surgical |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | GATED; inclusivity + mastery gates pass |

**Overall:** READY — payoffs add; prices are no-arb bounded (0 ≤ c₁−c₂ ≤ K₂−K₁).
