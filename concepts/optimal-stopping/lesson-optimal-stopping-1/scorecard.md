# Scorecard: No Going Back  (lesson-optimal-stopping-1)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Anchored to the secretary problem (LibreTexts §12.9, Stanford AMDM L8). take-first/last/random = 1/n cited. |
| 2 | Math correctness | Dept 3 Verify | ✅ | `naiveSuccess(n)=1/n`; factcheck reproduces 1/3, 1/4, 1/10; `validate-fixtures` green. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; one idea (irrevocable choice caps blind rules at 1/n). |
| 4 | Misconceptions | Dept 1 | ✅ | `l1-bet` byOption refutes "1/2 coin-flip" and "2/3"; model refutes "later seats more likely". |
| 5 | Interactivity | Dept 2 | ✅ | `stoppingBoard` sequence runs (take-first miss/win); answerEntry counts; tripletReveal. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener (1/n recall); early win; required masteryChallenge before recap; recalls permutation counting (combinatorics). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | DOM/SVG renderer; reduced-motion final frame; aria-live; 44px range control. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; surgical diff; design tokens. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `validate-fixtures` inclusivity + mastery gates pass for lesson-optimal-stopping-1. |

**Overall:** READY — irrevocable choice caps every blind rule at 1/n; sets up the threshold rule.
