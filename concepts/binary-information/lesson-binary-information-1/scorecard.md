# Scorecard: Every Number Is Bits  (lesson-binary-information-1)

> QA Verification Engineer + Dept-1/Dept-2 critic sign-off. Verified by reading the fixture
> (`fixtures/lesson-binary-information-1.json`), the factcheck test
> (`src/content/lesson-binary-information-1.factcheck.test.ts`), `brief.md`, `interaction-spec.md`,
> the engine (`src/engine/binary.ts`), and the mechanized gate wiring in `scripts/validate-fixtures.ts`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Concept anchored to GB §7.2 p.92 (`concept-brief.md`). Every problem cited in `brief.md` table: gold rod = S1 (GeeksforGeeks, "2 cuts → 1,2,4"); `1000=1111101000` = GB §7.2 p.92 (GB6); `100=1100100` = S17; recall opener (2ⁿ strings) = `lesson-combinatorics-1`. No invented/unsourced problems. |
| 2 | Math correctness | Dept 3 Verify | ✅ | Engine reproduces every graded value: `toBinary(7)="111"`, `toBinary(100)="1100100"`, `toBinary(43)="101011"`, `toBinary(1000)="1111101000"`, `powersOfTwo(7)=[4,2,1]` (largest=4). bitBoard headlines `l1-explore="111"` (=toBinary 7), `l1-model="1111101000"` (=toBinary 1000) recomputed by `validate-fixtures §3f`; binary engine §2e self-check passed; factcheck test passes. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet (`l1-bet` gold rod) → Explore (`l1-explore` build N from bit toggles) → Model (`l1-model` uniqueness via delta) → Prove (`l1-prove`). One objective/beat; concreteness-fading from concrete rod → register → abstract 1000; no symbol before referent (primer defines "a bit = is this power in the sum?" before binary notation). |
| 4 | Misconceptions | Dept 1 | ✅ | 5 wrong models elicited+refuted (brief §Misconceptions). `l1-bet` prediction uses `byOption` notes refuting "6 cuts"/"3 cuts"; correct="2 cuts". Hint ladders on `l1-win`/`l1-apply`/`l1-prove` refute "equal pieces" and "binary of 100 = digits 1-0-0". |
| 5 | Interactivity | Dept 2 | ✅ | `l1-explore`/`l1-model` are genuine direct-manipulation (`bitBoard register`, toggle bits → live value+delta), renderer `BitBoardBeat.tsx` confirmed. No text-wall fake reveals; primer is the only read-card and it is `required:false`. |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `l1-recall` (`retrievalGrid`, first graded beat = guaranteed early win, not the hardest type). Required `masteryChallenge` `l1-prove` (accept `1111101000`) immediately before recap. Held-out transfer `l1-transfer` (track:'B', required:false, accept `101011`) immediately precedes mastery. Continuity: combinatorics-1 2ⁿ overlap turned into graded recall (reuse-as-recall), not re-taught. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `BitBoardBeat.tsx` consumes `reducedMotion` (final-frame render via `isStatic`), `aria-live="polite"` value mirror, `aria-pressed`+`aria-label` per bit; tap-target sizing via CSS. e2e deferred to dev smoke + user-run per `qa-rubric.md` (playwright webServer uses forbidden `npm run dev`). |
| 8 | Technical implementation | Dept 3 | ✅ | validate-fixtures "All fixtures valid"; vitest factcheck + 47 binary goldens pass (zero new failures; the 57 fails are pre-existing interviewPack.bayes baseline); tsc no new errors; eslint clean; vite build OK. Surgical diff (reuses `answerEntry`/`prediction`/`primer`/`retrievalGrid`/`masteryChallenge`/`recap` + new `bitBoard`). e2e deferred (gate-8 note). |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | `lesson-binary-information-1` is in `GATED` + `MASTERY_LESSONS` (validate-fixtures.ts lines 673/849); mechanized inclusivity + mastery-challenge gates ran on it and passed (not vacuous). |

**Overall:** READY — full Bet→Explore→Model→Prove arc, every graded accept and both bitBoard headlines engine-reproduced, all 9 gates genuinely met.
