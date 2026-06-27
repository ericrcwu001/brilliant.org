# Interview Pack Scorecard — concept-game-theory

`interviews/course-game-theory.json` (+ `.md` mirror). Built by
`interviews/_build/build-game-theory-pack.ts` (self-verifying). **51 questions** —
hard 16 / harder 25 / brutal 10; 40 templated, 11 free-form.

| # | gate | pass condition | status | evidence |
|---|------|----------------|--------|----------|
| 1 | Source fidelity | concept Green-Book-anchored; every question cited | ✅ | `greenBookAnchor` cites GB Ch.2 (pirates p.3, tiger&sheep p.4, chocolate bar); every question's `source` from `source-dossier.md`. |
| 2 | Real quant-style | reads like real quant-interview questions, not arbitrary puzzles | ✅ | PD, matching pennies, Morra, pirates, Nim, the 21/race game, centipede — the standard canon. |
| 3 | Engine-verified pool | every templated answer reproduced by the engine; `verified:true` | ✅ | build self-verify: 40/40 templated reproduced by `src/engine/gameTheory.ts`; `recomputeGameTheory` added to `scripts/validate-interview-packs.ts` for the same cross-check. |
| 4 | De-duplicated | all fingerprints unique | ✅ | 51 unique fingerprints (self-verify). |
| 5 | Interviewer prompt | no-leak; escalating hints; grounding clause; structured scoring | ✅ | `interviewerPrompt` includes NO-ANSWER-LEAK + GROUNDING (treat hidden as engine-verified ground truth) + 3-rung hints + 1–5 rubric scoring. |
| 6 | Generator prompt | real-quant-style + anchored + engine-verify-before-serve + avoid-list | ✅ | `generatorPrompt` scopes the 8 engine-backed templates, mandates engineCheck + self-rejection + avoid-list fingerprints. |
| 7 | Difficulty | floor = hard; tiers tagged; follow-up chains present | ✅ | tiers hard/harder/brutal; every question has ≥1 (usually 2) `followUps`. |
| 8 | Asset hygiene | JSON validates (versioned, self-describing); `.md` mirror; NOT seeded/deployed | ✅ | `version:1`; passes `InterviewPackSchema`; `.md` rendered; lives under `interviews/` (seed glob matches only `fixtures/` → never seeded/deployed). |

**No-leak gate:** the build's `hintRungLeaks` check confirms hint rungs 2 & 3 never state the final answer (method-only).

> Note: the global `validate:interviews` currently halts on the **pre-existing** older-format
> `course-bayes-rule/combinatorics/markov` packs (they don't conform to the current strict
> `InterviewPackSchema`) before reaching this pack — so the build script is the authoritative
> verifier here. The `recomputeGameTheory` extension added to `validate-interview-packs.ts` makes the
> game-theory pool cross-checked the moment those older packs are migrated.

**Overall:** READY — 51 engine-verified, sourced, de-duplicated questions; committed, not deployed.
