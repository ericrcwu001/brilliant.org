# Scorecard: Convergence  (lesson-markov-chains-7)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | WEB-only (absent from GB): weather 12/25 · π=(3/7,4/7) (Math.SE 3336273); Land-of-Oz Pⁿ→(2/5,1/5,2/5) (G&S Ch.11 Tbl 11.1); Ehrenfest m=2 oscillates (stats.libretexts 16.8). |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces 12/25, 3/7, `periodicVerdict(ehr2)=oscillates`; validate green; factcheck. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; Pⁿ→π named after grounding; one objective/beat. |
| 4 | Misconceptions | Dept 1 | ✅ | `open-bet` byOption (head-start sticks / washes-out / depends), one `correct:true`; "π exists ⇒ Pⁿ converges" refuted at the now-graded `periodic-trap`. |
| 5 | Interactivity | Dept 2 | ✅ | **FIXED.** `periodic-trap` (powers+classify) now grades a converge/oscillate verdict via two chips ("Converges to π" / "Oscillates forever") checked against `periodicVerdict` — `Check` disabled until a chip is tapped (interaction test: both chips present, oscillates≠converges). `approach-pi` (distribution) is now a typed share input with value-less bars (interaction test: input present, no `chainboard-dist__value`). `early-power` cell-tap; `explore-collapse` hero. No softlock/auto-pass. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrievalGrid opener (`recall-LLN`); required `mastery-challenge` before `recap`; `interleave-forgets` (L1/L6); lesson completable. **Required-flag HARMONIZED:** `open-bet`/`explore-collapse`/`model-ergodic`/`recap` now `required:true` (only track:A `name-regular-ergodic` stays false). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px chips/inputs + `aria-live`; hero `explore-collapse` `reducedMotionFinalFrame`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. interaction test) + eslint green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-regular-ergodic` track:A; byOption `open-bet`; interviewNote `periodic-trap`. |

**Overall:** READY — prior blocker fixed: `periodic-trap` now grades a converge/oscillate verdict (engine `periodicVerdict`), `approach-pi` is a real graded read-off, and the required-flag is harmonized; regression-tested.
