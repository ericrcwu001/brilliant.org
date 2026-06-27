# Scorecard: Bit Tricks  (lesson-binary-information-5)

> Verified against `fixtures/lesson-binary-information-5.json`,
> `src/content/lesson-binary-information-5.factcheck.test.ts`, `brief.md`, `interaction-spec.md`,
> `src/engine/binary.ts`, and `scripts/validate-fixtures.ts`.

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | Power-of-2 test `(x&(x−1))==0` + multiply-by-shift `(x<<3)−x` anchored to **GB §7.2 p.92** (GB1/GB2), corroborated by S12 (LeetCode 231). popcount = S13 (LeetCode 191); Single Number `[4,1,2,1,2]`→4 = S11 (LeetCode 136); transfer `[7,3,5,3,7]`→5 = same XOR method; nim-sum recall = `lesson-game-theory-6`. All cited in `brief.md`. |
| 2 | Math correctness | Dept 3 Verify | ✅ | Engine reproduces every accept: `l5-win`=true (`isPowerOfTwo(16)=true`, `isPowerOfTwo(5)=false`), `l5-apply`=3 (`popcount(11)=3`), `l5-transfer`=5 (`xorAll([7,3,5,3,7])=5`), `l5-prove`=4 (`xorAll([4,1,2,1,2])=4`). bitBoard headlines: `l5-explore` op=`and-x-minus-1` value=12 → `"1000"` (=toBinary(12&11)=toBinary 8); `l5-model` op=`shift` a=6 k=3 → `"110000"` (=toBinary(6<<3)=toBinary 48) — both recomputed by `validate-fixtures §3f`. Recall nim-sum `xorAll([3,4,5])=2` verified. Factcheck passes. |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet (`l5-bet` find the loner) → Explore (`l5-explore` apply `x&(x−1)`, lowest bit vanishes) → Model (`l5-model` shifts double, `(x<<3)−x=7x`) → Prove (`l5-prove` Single Number). One objective/beat. Primer establishes "bitwise = every bit, independently, at once" before the tricks. |
| 4 | Misconceptions | Dept 1 | ✅ | 5 wrong models (XOR-is-game-rule; loner-needs-sort/hash; bit-ops-treat-blob; pow2-needs-division; shift-unrelated-to-multiply). `l5-bet` byOption refutes "Sort first"/"Count each"; correct="XOR them (4)". `l5-win` hint shows `16&15=0` refuting repeated division. |
| 5 | Interactivity | Dept 2 | ✅ | `l5-explore` genuine direct-manipulation (`bitBoard register` op=`and-x-minus-1`: tap Apply, lowest 1-bit clears step by step → popcount). `l5-model` shift visualization. `BitBoardBeat.tsx` op-rendering confirmed (`bi-bitboard__op` aria-live). |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | Retrieval opener `l5-recall` (`retrievalGrid` nim-sum, first graded = early win). Required `masteryChallenge` `l5-prove` (accept `4`) immediately before recap. Transfer `l5-transfer` (track:'B', required:false, accept `5`) immediately precedes mastery. Continuity: game-theory-6 XOR overlap reused-as-recall then taught bitwise (per-bit no-carry parity); XOR re-surfaces in L6; shift = ×2 re-surfaces L1 powers-of-two motif. |
| 7 | Accessibility & mobile | Dept 2 | ✅ | `BitBoardBeat.tsx` register/op: `reducedMotion` updates value instantly (no flip animation); `aria-live`+`aria-atomic` op readout; `aria-pressed`/`aria-label` per bit. 44px via CSS. e2e deferred to dev smoke + user-run. |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint green; factcheck + goldens pass; zero new failures. Surgical reuse + `bitBoard` op modes. e2e deferred. |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | In `GATED` + `MASTERY_LESSONS`; mechanized inclusivity + mastery gates ran and passed. |

**Overall:** READY — GB §7.2 bit-trick one-liners, every accept and both bitBoard op-headlines engine-reproduced, all 9 gates met.
