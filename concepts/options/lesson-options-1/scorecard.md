# Scorecard: Payoffs & the Contract  (lesson-options-1)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | dossier #1–#4, GB §6.1 p.69 L10744 (payoff max), p.70 L10800 (protective put), §6.3 L12552 (straddle) — all cited |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine self-check + per-fixture cross-check green; callPayoff(130,100)=30, putPayoff(70,100)=30, protective put max(S_T,100)→130/100, straddle→30/30 |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; thin payoff on-ramp (tripletReveal) faded; cold retrievalGrid opener recalling E[X] |
| 4 | Misconceptions | Dept 1 | ✅ | byOption refutations (call/put sign, intrinsic vs time value); feed-forward, no person-verdict |
| 5 | Interactivity | Dept 2 | ✅ | optionBoard/payoffDiagram (drag/compose legs, live hockey-stick) |
| 6 | Assessment / mastery / discrimination / continuity | Dept 1 | ✅ | which-method gate opt1-gate (correct payoff-construction; foils put-call-parity, no-arbitrage-replication ⊂ CONFUSABLE); held-out transfer #4 straddle (heldOut/track B, schemaId=payoff-construction); mastery (density split); opt1-compare same-method costume; Continuity: opens on E[X] recall, no re-teach |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px taps, reduced-motion final frame, aria-live mirror |
| 8 | Technical implementation | Dept 3 | ✅ | validate-fixtures ✓, tsc ✓, vitest ✓ (788 focused), build ✓, eslint ✓; surgical (fixture only) |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | in GATED set; inclusivity + mastery gates pass |

**Overall:** READY — payoff literacy on the exact piecewise-linear core; Black-Scholes never graded.
