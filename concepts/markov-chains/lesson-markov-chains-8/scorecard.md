# Scorecard: Reversibility & Detailed Balance  (lesson-markov-chains-8)
| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | All WEB (reversibility absent from GB): Ehrenfest π=C(m,i)/2ᵐ (stats.libretexts 16.8 / phys.libretexts 12.3); directed-cycle π=(1/3,1/3,1/3) CONSTRUCTED counterexample. Graded values match: `balance-one-edge` 1/2, `telescope-to-pi` (1/4,1/2,1/4), `mastery-ehrenfest-m3` (1/8,3/8,3/8,1/8), `reversible-or-not` not-reversible. |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces all four (`detailedBalance` pi/reversible); validate green; goldens. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; concreteness-fades urn→single edge→telescope→m=3; glyph πᵢpᵢⱼ=πⱼpⱼᵢ after primer. |
| 4 | Misconceptions | Dept 1 | ✅ | 4 misconceptions elicited+refuted; `guess-pi-bet` byOption (2 targeted refutations), one `correct:true`; "every chain reversible" refuted at `reversible-or-not`. |
| 5 | Interactivity | Dept 2 | ✅ | All graded beats genuine DM. **S2:** `balance-one-edge` now grades a typed π scalar and `telescope-to-pi` a typed π vector — both vs `detailedBalance` with a **P-only render** (no π / no reversibility verdict shown); `reversible-or-not` grades Reversible/Not-reversible chips. `Check` disabled until input (interaction test: no 'Detailed balance'/'irreversible'/'Stationary distribution'/'1/4,1/2,1/4' leak; inputs/chips present). Hero `ehrenfest-walk`; primer/recap exempt. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Opener `recall-birth-death`; early win `balance-one-edge`; REQUIRED `mastery-ehrenfest-m3` before `recap`; interleave `reversible-or-not`; continuity = recall of gambler's-ruin birth–death. **Required-flag HARMONIZED:** `guess-pi-bet` + `triplet-reveal` now `required:true` (only track:A `name-detailed-balance` false). |
| 7 | Accessibility & mobile | Dept 2 | ✅ | ≥44px inputs/chips + `aria-live`; hero `ehrenfest-walk` `reducedMotionFinalFrame` + `structuralReadout`. |
| 8 | Technical implementation | Dept 3 | ✅ | validate + tsc + vitest 1111/1111 (incl. interaction test S2 cases) + eslint green; surgical. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | inclusivity + mastery pass; primer `name-detailed-balance` track:A; byOption `guess-pi-bet`; interviewNote `telescope-to-pi`. |

**Overall:** READY — 9/9 gates green; S2 hardened the balance beats to grade typed π / reversibility chips with a P-only render (no π leak, regression-tested), and the required-flag is harmonized.
