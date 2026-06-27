# Scorecard: Look, Then Leap  (lesson-optimal-stopping-2)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Threshold rule + n=3→1/2, n=4→11/24 (LibreTexts §12.9; Tokyo 2020 P3 confirms 1/4+1/8+1/12=11/24). |
| 2 | Math correctness | Dept 3 Verify | ✅ | `secretarySuccess`/`optimalCutoff` reproduce 1/2, 11/24, 5/12, 13/30; factcheck (9 tests) + `validate-fixtures` green. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Discover the cutoff that beats 1/n; one idea per beat; concreteness fading. |
| 4 | Misconceptions | Dept 1 | ✅ | `l2-bet` byOption refutes "still 1/3" and "2/3"; explore shows the curve falls past the peak. |
| 5 | Interactivity | Dept 2 | ✅ | `stoppingBoard` sequence (win) + cutoff curve (drag r, peak 11/24); answerEntry pins r*+p*. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener recalls L1's 1/n; early win; required masteryChallenge (13/30) before recap. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | reduced-motion final frame; aria-live headline; 44px slider. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; surgical; tokens. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery gates pass for lesson-optimal-stopping-2. |

**Overall:** READY — the look-then-leap threshold smashes the 1/n cap.
