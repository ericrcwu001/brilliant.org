# Scorecard: The 37% Rule  (lesson-optimal-stopping-3)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Convergence of r*/n and p* to 1/e ≈ 0.368 (Wikipedia "Secretary problem"; LibreTexts table n=3..20). |
| 2 | Math correctness | Dept 3 Verify | ✅ | `optimalCutoff` table reproduced (n=10→4,3349/8400; n=50→19; n=100→38); `Math.round(100/e)=37`; factcheck (9) + validate green. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | One idea (scale-free 37% limit); convergence table makes the limit concrete. |
| 4 | Misconceptions | Dept 1 | ✅ | `l3-bet` byOption refutes "basically 0%" and "50%"; the rule barely decays with n. |
| 5 | Interactivity | Dept 2 | ✅ | `stoppingBoard` convergence table + cutoff curve (n=10 peak ≈40%); answerEntry. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L2 optima (1/2, 11/24, 13/30); required masteryChallenge (37%, 37%) before recap. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | convergence table is semantic; reduced-motion safe; aria-live. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; surgical; tokens. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery gates pass for lesson-optimal-stopping-3. |

**Overall:** READY — both the threshold fraction and the success probability converge to 1/e.
