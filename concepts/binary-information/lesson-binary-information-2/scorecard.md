# Scorecard: Bits as Information  (lesson-binary-information-2)

> Verified against `fixtures/lesson-binary-information-2.json`,
> `src/content/lesson-binary-information-2.factcheck.test.ts`, `brief.md`, `interaction-spec.md`,
> `src/engine/binary.ts`, and `scripts/validate-fixtures.ts`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | GB §7.2 p.92 concept anchor. Problems cited: 1–100→7 = S2 (programmerinterview); 1–1000→10 = S4 (Glassdoor/Meta); 1–10⁶→20 = S3 (Aaronson "Twenty Questions"); 1–500→9 derived from same ⌈log₂N⌉ method; pigeonhole recall = `lesson-combinatorics-5`. All sourced. |
| 2 | Math correctness | Dept 3 Verify | ✅ | Engine reproduces every accept: `bitsNeeded(100)=7` (`l2-win`), `bitsNeeded(1000)=10` (`l2-prove`), `bitsNeeded(1_000_000)=20` (`l2-apply`), `bitsNeeded(500)=9` (`l2-transfer`). bitBoard headlines: `l2-explore` `questions` n=1000 → `"10"` (=String bitsNeeded 1000); `l2-model` `register` value=1000 → `"1111101000"` (=toBinary 1000) — both recomputed by `validate-fixtures §3f`. Factcheck passes. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet (`l2-bet` 1–1000) → Explore (`l2-explore` interactive halving game) → Model (`l2-model` the inverse of L1's 2ⁿ + pigeonhole proof) → Prove (`l2-prove`). One objective/beat. The L1↔L2 2ⁿ-forward vs ⌈log₂N⌉-inverse confusable is surfaced explicitly at `l2-model`. |
| 4 | Misconceptions | Dept 1 | ✅ | 5 wrong models (linear "more possibilities ⇒ more questions"; "rules out one item"; "log₂N=N/2"; "round 500→512 so 8"; "a scheme beats ⌈log₂N⌉"). `l2-bet` byOption refutes "500"/"100"; correct="10". `l2-transfer` hint explicitly refutes the 500→8 error (answer is exponent 9). |
| 5 | Interactivity | Dept 2 | ✅ | `l2-explore` is genuine direct-manipulation (`bitBoard questions`: tap Yes/No, range halves live, step counter). `l2-model` toggles bits → 2ᵏ readout. No fake reveals. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `l2-recall` (`retrievalGrid`, first graded = early win). Required `masteryChallenge` `l2-prove` (accept `10`) immediately before recap `l2-recap`. Transfer `l2-transfer` (track:'B', required:false, accept `9`) immediately precedes mastery. Continuity: combinatorics-5 pigeonhole overlap reused-as-recall then inverted into the lower-bound proof — not re-taught. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `BitBoardBeat.tsx` `questions` display: `reducedMotion` collapses range without slide; per-answer `aria-live`; Yes/No buttons carry `aria-label`. 44px via CSS. e2e deferred to dev smoke + user-run. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; factcheck passes; zero new vitest failures. Surgical reuse + `bitBoard`. e2e deferred. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | In `GATED` + `MASTERY_LESSONS`; mechanized inclusivity + mastery gates ran and passed. |

**Overall:** READY — inverse-of-L1 arc is clean, every ⌈log₂N⌉ accept and both bitBoard headlines engine-reproduced, all 9 gates met.
