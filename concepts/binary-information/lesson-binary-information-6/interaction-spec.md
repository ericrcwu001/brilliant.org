# Interaction Spec: Encoding the Answer  (lesson-binary-information-6)

> The NEW `bitBoard` Zod shape is frozen in
> `lesson-binary-information-1/interaction-spec.md → ## New interaction types (for Wave 0)`.
> L6 reuses `bitBoard` display `register` (`op:'xor'`) for the missing-number column cancellation
> and `retrievalGrid` for the mixed-interleave + spaced-review beats.

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l6-recall` | Mixed interleave: tap a scenario (left), tap/drag its tool (right) — {1–1000 yes/no ↔ ⌈log₂⌉=10; 12 coins ↔ base-3 weighing; loner in a list ↔ XOR-all; binary strings ↔ 2ⁿ}; Check grades all 4 | `retrievalGrid` | reuse | triple: ✓ "Same family — pick the base from the test's alphabet." · H1 "Yes/no → base-2; balance → base-3; pairs → XOR." · H2 "Match each scenario to its unit of information." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 2 | `l6-bet` | Tap one chip ("Sum then subtract" / "Scan for it" / **"XOR index⊕value (2)"**) → per-option note; advance commits | `prediction` (`byOption`) | reuse | byOption: ✓ "XOR index⊕value (2)" → "Right — present numbers cancel; 2 is the gap." · ✗ "Sum then subtract" → "Works, but XOR avoids overflow and is L5's loner trick." · ✗ "Scan for it" → "Worth testing — XOR-all finds it in one pass." | radiogroup, 44px chips, `aria-checked` | chips | both |
| 3 | `l6-primer` | Tap-expand "match the encoding to the test's alphabet (2 vs 3 answers)" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (ungraded). Body: base-2 for yes/no, base-3 for a balance, XOR for pairing | 44px tap, `aria-expanded`; static | collapse/expand | A (required:false) |
| 4 | `l6-win` | Type the missing number in `[0,1,3]` (0…3) → Check vs accept `["2"]` → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "XOR {0,1,2,3} with {0,1,3} leaves 2." · H1 "XOR all indices 0..3, then XOR in every value." · H2 "Equal terms cancel; the missing 2 remains." · H3 reveal `2` | numeric input, `aria-label`, Enter submits | input | both |
| 5 | `l6-explore` | `bitBoard`/`register` (`op:'xor'`): tap each index then each value chip to fold it in → bits cancel column-by-column live; the running XOR value updates; when all folded, the gap appears; reset | `bitBoard` (`display:'register'`, `op:'xor'`, `interactive:true`) | **NEW** | per-fold `aria-live` "folded 3 → running XOR 0011; …; gap = 2." Ungraded. Hints: H1 "XOR is per-bit parity." H2 "Each column toggles when a 1 lands there." H3 "Survivor = the missing value." | index/value chips ≥44px; per-bit `aria-label`; `aria-live` mirrors running XOR; reduced-motion = columns toggle with no flash | bit columns; running XOR readout | both |
| 6 | `l6-model` | Interleave: tap a left scenario ("distinguish 27 items"), tap/drag the better tool ("a balance: ⌈log₃27⌉=3 vs 5 yes/no"); Check grades — the alphabet sets the rate | `retrievalGrid` | reuse | triple: ✓ "A balance — base-3 needs 3 weighings vs 5 yes/no." · H1 "Compare the alphabets." · H2 "3ⁿ grows faster than 2ⁿ, so base-3 needs fewer tests." · H3 reveal pair | tap-only, 44px, `aria-live`; `comparison:true`; `interviewNote` here | left↔right grid | both |
| 7 | `l6-spaced` | Spaced re-surfacing: tap a left context ("binary strings", "Pascal's rows", "pattern-overlap waits"), tap/drag its 2ⁿ face ("2ⁿ strings", "row sum 2ⁿ", "Σ2^L"); Check grades — 2ⁿ is everywhere | `retrievalGrid` | reuse | triple: ✓ "2ⁿ is the doubling signature across the corpus." · H1 "Where else has doubling appeared?" · H2 "Strings (2ⁿ), Pascal rows (sum 2ⁿ), overlap waits (Σ2^L)." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 8 | `l6-transfer` | **Held-out transfer.** Type the missing number in `[0,1,3,4]` (0…4) → Check vs accept `["2"]` | `answerEntry` (`track:'B'`, `required:false`) | reuse | triple: ✓ "XOR {0..4} with the values leaves 2." · H1 "Same method, longer array." · H2 "XOR indices 0..4, then the values; the gap survives." · H3 reveal `2` | numeric input | input | B |
| 9 | `l6-prove` | **Mastery (required).** Type the missing number in `[9,6,4,2,3,5,7,0,1]` (0…9) → Check vs accept `["8"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "XOR all indices 0..9 with the values → 8." · H1 "Cancellation handles any length." · H2 "Fold indices then values; doubles vanish." · H3 reveal `8` | scenario + numeric input, `aria-label` | scenario + input | both |
| 10 | `l6-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** `l6-recall` (`retrievalGrid`) is the first graded beat (opener + early-win).
`l6-model`, `l6-spaced` are graded `retrievalGrid` checks (not the hardest type). `l6-transfer`
(B / required:false) immediately precedes `l6-prove` (`masteryChallenge`, required) → `l6-recap`.

> **Design decision (`l6-spaced` widget — Manager FYI):** the brief offered `sumTiles` *or*
> `retrievalGrid`. The committed `sumTiles` (`src/lesson/beats/SumTilesBeat.tsx`) derives its chips
> from `autocorrelation(beat.pattern)` (the PHT Σ2^L engine) and has **no schema fields** — it cannot
> render an arbitrary "where does 2ⁿ show up" grid without a renderer/schema change. I route
> `l6-spaced` to a graded `retrievalGrid` instead (zero scope creep, no new type). Same applies to
> L1's `l1-explore` (brief named `sumTiles`; routed to `bitBoard register`). **Recommend keeping
> `sumTiles` out of this concept** unless the Manager wants a Dept-2/Dept-3 generalization of it.

## New interaction types (for Wave 0)
See `lesson-binary-information-1/interaction-spec.md`. L6 uses `bitBoard` `register`+`op:'xor'`
(`headline === toBinary(xorAll([...]))` for the folded operands). The missing-number answers are
graded via `answerEntry`/`masteryChallenge`.

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l6-recall` | (static pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l6-bet` | `missingNumber([3,0,1])=2` | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l6-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,collapsible}` |
| `l6-win` | `missingNumber([0,1,3])=2` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l6-explore` | `xorAll`,`toBinary` | **`BitBoardBeat.tsx`** `register`+`op:'xor'` | `interaction.{display:'register',op,operands,interactive:true,headline}` |
| `l6-model` | `bitsNeeded(27n)=5`,`weighingsForN(27n,true)=3` | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback`, `comparison:true`, `interviewNote` |
| `l6-spaced` | (static 2ⁿ pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l6-transfer` | `missingNumber([0,1,3,4])=2` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `track:'B'`, `required:false` |
| `l6-prove` | `missingNumber([9,6,4,2,3,5,7,0,1])=8` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l6-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3): `missingNumber([3n,0n,1n])=2n`, `missingNumber([0n,1n,3n])=2n`,
`missingNumber([0n,1n,3n,4n])=2n`, `missingNumber([9n,6n,4n,2n,3n,5n,7n,0n,1n])=8n`,
`bitsNeeded(27n)=5`, `weighingsForN(27n,true)=3`. (`missingNumber` = `xorAll(indices) ⊕ xorAll(values)`.)

## Definition-of-Ready checklist

| beat | verified+sourced | direct-manipulation | instant feedback + 3-level hints | a11y |
|------|:---:|:---:|:---:|:---:|
| `l6-recall` | ✓ mixed corpus | ✓ tap-match | ✓ | ✓ |
| `l6-bet` | ✓ S15 ([3,0,1]→2) | ✓ chip | ✓ byOption | ✓ |
| `l6-primer` | ✓ (JIT) | ✓ tap-expand | n/a | ✓ |
| `l6-win` | ✓ [0,1,3]→2 | ✓ type-in | ✓ | ✓ |
| `l6-explore` | ✓ S15 (XOR cancel) | ✓ fold chips → live XOR | ✓ live + hints | ✓ |
| `l6-model` | ✓ L3 vs L4 (27) | ✓ tap-match | ✓ | ✓ |
| `l6-spaced` | ✓ combo-1/-3, overlap | ✓ tap-match | ✓ | ✓ |
| `l6-transfer` | ✓ [0,1,3,4]→2 | ✓ type-in | ✓ | ✓ |
| `l6-prove` | ✓ S15 (→8) | ✓ type-in | ✓ | ✓ |
| `l6-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `bitBoard`.
