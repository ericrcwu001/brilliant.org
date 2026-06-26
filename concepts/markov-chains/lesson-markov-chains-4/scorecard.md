# Scorecard: Classifying States  (lesson-markov-chains-4)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Classes GB §5.1 p.54–55; periodicity WEB (Ehrenfest m=2→2, stats.libretexts 16.8), ergodic 3-state (Rochester ECE440 HW5#2); `transient-vs-recurrent` 1/2 + `mastery-challenge` 2/9 engine-verified. |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces absorbing, kinds `transient,recurrent,recurrent,absorbing`, period 2, 1/2, 2/9; validate green; chainBoard headline gate. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; concreteness fades PHT/ruin recall→abstract chains→ruin mastery. (See N3 in Overall re `ehrenfest-period` prompt↔mechanic fit.) |
| 4 | Misconceptions | Dept 1 | ✅ | 6 brief misconceptions elicited+refuted; `open-bet` byOption: 3 specific per-option refutations, exactly one `correct:true`. |
| 5 | Interactivity | Dept 2 | ✅ | **FIXED.** `transient-vs-recurrent` (diagram+absorption) is now a typed fraction input graded via `returnProbability` composed from the engine — `Check` disabled until input, answer 1/2 never pre-rendered (interaction test: `chainboard-absorb` control present, no `>1/2<` leak, returnProbability(R3,0,[2])=1/2). `classify-first`/`classify-and-group`/`ehrenfest-period` are genuine R/T/A chips; `classify-board` is a hero. No softlock/auto-pass. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener (`recall-absorbing`); early win; required `masteryChallenge` before `recap`; interleave `transient-vs-recurrent`; lesson now completable end-to-end. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px chips/inputs + `aria-live`; hero `classify-board` `reducedMotionFinalFrame`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. interaction test) + eslint green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-the-classes` track:A; byOption `open-bet`; interviewNote `classify-and-group`. |

**Overall:** READY — prior blocker fixed: `transient-vs-recurrent` is now a real graded absorption-probability input (engine-composed `returnProbability`, no leak, regression-tested). **N3 (minor, non-blocking — recommend FIX):** `ehrenfest-period`'s prompt asks *"What is the period?"* but the graded control is per-state R/T/A classification, which can't express a period; reword the prompt to ask for the per-state classification (period 2 stays the engine-verified headline + feedback takeaway). Fixture-only, no renderer change.
