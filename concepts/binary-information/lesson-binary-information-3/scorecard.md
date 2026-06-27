# Scorecard: Group Testing (Poisoned Wine)  (lesson-binary-information-3)

> Verified against `fixtures/lesson-binary-information-3.json`,
> `src/content/lesson-binary-information-3.factcheck.test.ts`, `brief.md`, `interaction-spec.md`,
> `src/engine/binary.ts`, and `scripts/validate-fixtures.ts`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Headline poisoned-wine anchored to **GB §7.2 p.92** (1000 bottles, 10 mice, `1111101000`); corroborated by Brainstellar #31 (S8). 9 balls→2 = S5 (Math Is Fun); 8 balls→2 = S6 (suresolv); 600-bottle transfer derived from the same 2ᵏ≥N method. All cited in `brief.md`. |
| 2 | Math correctness | Dept 3 Verify | ✅ | Engine reproduces every accept: `l3-win`=4 (2²), `l3-apply`=2 (`weighingsForN(9,true)=2`), `l3-transfer`=10 (`bitsNeeded(600)=10`), `l3-prove`=10 (`bitsNeeded(1000)=10`). groupTest headlines: `l3-explore` culprit=176 items=256 → `"176"`; `l3-model` culprit=1000 items=1024 → `"1000"` — both = `fromBinary(toBinary(culprit))`, recomputed by `validate-fixtures §3f` (round-trip cross-check). Verified independently: toBinary(176)="10110000", toBinary(1000)="1111101000". |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet (`l3-bet` 10 mice/1000 bottles) → Explore (`l3-explore` poison a bottle, read death pattern) → Model (`l3-model` generalize k→2ᵏ, one round) → Prove (`l3-prove`). `l3-apply` (9 balls→2) deliberately seeds the base-3 world of L4 (base-2↔base-3 interleave). One objective/beat. |
| 4 | Misconceptions | Dept 1 | ✅ | 5 wrong models (one-mouse-per-bottle; k mice⇒k bottles; tests-must-be-sequential; can't-recover-from-pattern; weighing-is-binary). `l3-bet` byOption refutes "10 bottles"/"100 bottles"; correct="All 1000". `l3-win` hint refutes "k mice ⇒ k bottles". |
| 5 | Interactivity | Dept 2 | ✅ | `l3-explore` is genuine direct-manipulation (`bitBoard groupTest`: tap a bottle → mice light dead, recovered index updates live). `BitBoardBeat.tsx` `groupTest` renderer confirmed (item-columns × tester-rows, binary `aria-label`s). |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `l3-recall` (`retrievalGrid` k bits↔2ᵏ, first graded = early win). Required `masteryChallenge` `l3-prove` (accept `10`) immediately before recap. Transfer `l3-transfer` (track:'B', required:false, accept `10`) immediately precedes mastery. Continuity: in-concept 2ᵏ spaced re-surfacing (L1/L2 → testers); base-2↔base-3 confusable seeded for L4. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `groupTest` grid: `reducedMotion` flips cell state with no animation; `aria-live` mirrors death pattern + recovered index; columns labelled in binary via `aria-label`. 44px via CSS. e2e deferred to dev smoke + user-run. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; factcheck + goldens pass; zero new failures. Surgical reuse + `bitBoard`. e2e deferred. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | In `GATED` + `MASTERY_LESSONS`; mechanized inclusivity + mastery gates ran and passed. |

**Overall:** READY — parallel-binary-labeling arc with GB headline, every accept and both groupTest indices engine-reproduced, all 9 gates met.
