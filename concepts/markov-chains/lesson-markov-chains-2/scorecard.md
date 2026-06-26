# Scorecard: The Transition Matrix  (lesson-markov-chains-2)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Graded values = brief table: `recall-rows-sum-to-1` 1/2·3/5·1; `predict-the-missing-edge` 7/10; `fill-the-row` 2/5; `build-from-story` story P `[[7/10,3/10],[4/10,6/10]]`; `mastery-challenge` Oz, seed 3/8. Sources: Math.SE 3336273, GeeksforGeeks, G&S Tbl 11.1. |
| 2 | Math correctness | Dept 3 Verify | ✅ | validate "All fixtures valid." + factcheck; engine reproduces 2/5, 7/10, 3/8; `buildChain` accepts weather/story. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; one objective/beat; concreteness fades coin→weather P→3-state Oz. |
| 4 | Misconceptions | Dept 1 | ✅ | `predict-the-missing-edge` byOption refutes symmetry / needs-story per option; keys match options, exactly one `correct:true`. |
| 5 | Interactivity | Dept 2 | ✅ | **FIXED.** `spot-the-invalid` now has 3 DISTINCT match-targets → no eviction softlock (dup-rights scan clean; interaction test asserts all rights distinct). **S1** `build-from-story` is now an empty editable-cell build, `Check` gated on filled∧rows=1, graded vs P; the target P is NEVER pre-rendered (interaction test: no 7/10·3/10·4/10·6/10 leak, `chainboard-build__input` present, Check disabled initially). All beats genuine direct-manipulation; no auto-pass. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener (`recall-rows-sum-to-1`), early win (`fill-the-row`), required `masteryChallenge` before `recap`; lesson now completable end-to-end (softlock gone). Continuity = recall (PHT ½/½, gambler p). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | hero `build-the-board` `reducedMotionFinalFrame`; ≥44px taps + `aria-live` (RetrievalGridBeat; build inputs `minHeight:44px`). |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. `ChainBoardBeat.interaction.test` 77/77) + eslint green; surgical fixture + renderer fix. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery gates pass; primer `name-the-matrix` track:A required:false; byOption on `predict-the-missing-edge`; interviewNote `read-as-one`. |

**Overall:** READY — both prior blockers fixed: `spot-the-invalid` match-targets are now distinct (softlock gone) and `build-from-story` (S1) is a real empty-cell build graded vs P with no target leak; regression-tested (interaction test 77/77).
