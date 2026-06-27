# Scorecard: The Correlation Triangle: 3-Variable Bounds  (lesson-covariance-6)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | every problem cited+sourced — GB pp.26-29,48 (#10,#11,#12,#13); see source-dossier.md + brief.md |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces explore corrRange(4/5,4/5)={7/25,1}; win ρ=4/5; mastery min 7/25/max 1/equicorr −1/2/hedge −2/3; covariance.test.ts + lesson-covariance-6.factcheck.test.ts green; validate-fixtures §3f cross-check green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove arc; one objective/beat; notation-ladder (introducesSymbol/groundedBy) passes validate-fixtures |
| 4 | Misconceptions | Dept 1 | ✅ | per-option (byOption) refutations on predictions; the #1 trap Cov=0 ⇏ independence elicited + refuted |
| 5 | Interactivity | Dept 2 | ✅ | every beat is genuine direct-manipulation; joint Definition-of-Ready held (Dept1↔Dept2 loop) |
| 6 | Assessment / mastery / continuity | Dept 1 + Cartographer | ✅ | graded retrievalGrid opener + guaranteed early win + required masteryChallenge before recap; validate-fixtures mastery gate green (non-vacuous); continuity overlaps → recall/interleave, no re-teach |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px tap targets, reduced-motion final frame, aria-live mirror (CovarianceBoardBeat + shared beats) |
| 8 | Technical implementation | Dept 3 Verify + Reviewer | ✅* | validate-fixtures + vitest + tsc(--noEmit) + vite build + eslint all green; surgical diff; design tokens. *e2e DEFERRED → user-run (playwright webServer uses `npm run dev`, forbidden here) |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | validate-fixtures inclusivity + mastery-challenge gates pass for lesson-covariance-6 (added to GATED + MASTERY_LESSONS — non-vacuous) |

**Overall:** READY — all 9 gates green (gate 8 e2e is the single user-run remainder, per qa-rubric).
