# Interview Pack Scorecard — course-options

Pack: `interviews/course-options.json` (+ `.md` mirror) · generator `interviews/_build/build-options-pack.ts` · engine `src/engine/options.ts`.
Counts: **83 total** — hard 26 / harder 36 / brutal 21 · templated 77 / free-form 6.

| # | gate | status | evidence |
|---|------|--------|----------|
| 1 | Source fidelity | ✅ | GB Ch.6 (§6.1–§6.4) anchor; every question sourced to the dossier / GB locus |
| 2 | Real quant-style | ✅ | templates span the desk canon: payoff reads, parity/arb gap, no-arb bounds, risk-neutral q, binomial price, replicating (Δ,B), tree terminals/weights, min-var hedge, one-touch, Greek signs |
| 3 | Engine-verified pool | ✅ | `validate-interview-packs`: course-options **83/83 recomputed**; `interviewPack.options.test.ts` **85 passed** — every `engineCheck.verified:true`, exact rationals |
| 4 | De-duplicated | ✅ | structural gates pass (unique fingerprints) |
| 5 | Interviewer prompt | ✅ | no-answer-leak; escalating hint ladder; grounding clause; **feed-forward "next fix" cards, tier-scaled rubric, pressureNote — NO hire-signal/person-verdict** (ADR-0010) |
| 6 | Generator prompt | ✅ | real-quant-style + GB-anchored + engine-verify-before-serve + avoid-list + self-rejection; prefers engine-backed templates |
| 7 | Difficulty | ✅ | floor=hard; tiers tagged (26/36/21); follow-up chains present |
| 8 | Asset hygiene | ✅ | validates against `InterviewPackSchema`; `.md` mirror generated; functions copy-in-sync drift guard passes |
| 9 | Leak guard | ✅ | `functions/src/interview.leak.test.ts` — 2 passed |
| 10 | Pressure & feed-forward (LS §3) | ✅ | brutal floor for the quant-intensity gate; tier-aware `hidden.rubric`; feed-forward report + predicted-vs-measured calibration + pressureNote; per-question confidence; **no person-level verdict anywhere** |

**Overall:** READY — Black-Scholes / continuous Greeks excluded from the graded pool (irrational); every served answer is an exact-rational the options engine reproduces.
