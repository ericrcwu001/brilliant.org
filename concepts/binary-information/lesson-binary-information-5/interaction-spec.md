# Interaction Spec: Bit Tricks  (lesson-binary-information-5)

> The NEW `bitBoard` Zod shape is frozen in
> `lesson-binary-information-1/interaction-spec.md → ## New interaction types (for Wave 0)`.
> L5 uses `bitBoard` display `register` with the `op` field (`and-x-minus-1` / `shift` / `xor`),
> which shows the bitwise operation as per-bit rows.

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l5-recall` | Tap a left prompt ("nim-sum {3,4,5}", "a ⊕ a"), tap/drag its match ("2", "0") → slot fills; Check grades pairs, then pivots: XOR is bitwise parity | `retrievalGrid` | reuse | triple: ✓ "Nim-sum is just XOR — per-bit, no-carry parity." · H1 "Add column by column with no carry." · H2 "3⊕4⊕5 = 011⊕100⊕101 = 010 = 2; a⊕a=0." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 2 | `l5-bet` | Tap one chip ("Sort first" / "Count each" / **"XOR them (4)"**) → per-option note; advance commits | `prediction` (`byOption`) | reuse | byOption: ✓ "XOR them (4)" → "Right — pairs cancel; 4 survives." · ✗ "Sort first" → "Worth testing — XOR-all is one pass, no sorting." · ✗ "Count each" → "Worth testing — equal values XOR to 0; no tally needed." | radiogroup, 44px chips, `aria-checked` | chips | both |
| 3 | `l5-primer` | Tap-expand "bitwise = every bit, independently, at once" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (ungraded). Body: AND/OR/XOR/shift act per column of bits | 44px tap, `aria-expanded`; static | collapse/expand | A (required:false) |
| 4 | `l5-win` | Type whether 16 is a power of 2 (via `x&(x-1)`) → Check vs accept `["true","yes"]` → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "16 & 15 = 0 ⇒ power of 2." · H1 "Compute x & (x−1)." · H2 "16=10000, 15=01111 share no 1-bit ⇒ AND=0." · H3 reveal `true` | text input, `aria-label`, Enter submits | input | both |
| 5 | `l5-explore` | `bitBoard`/`register` (`op:'and-x-minus-1'`): tap **Apply** to run `x & (x−1)` once → the lowest 1-bit visibly clears, the value drops, a step counter ticks; repeat until 0 → the step count is the popcount; reset | `bitBoard` (`display:'register'`, `op:'and-x-minus-1'`, `interactive:true`) | **NEW** | per-apply `aria-live` "lowest 1-bit cleared: 12 → 8 (1 op)." Ungraded. Hints: H1 "x−1 flips the lowest 1 and the zeros below it." H2 "AND keeps only the higher 1-bits." H3 "Repeat to 0; the count is the set bits." | Apply/Reset ≥44px; per-bit `aria-label`; `aria-live` mirrors value+op count; reduced-motion = bit clears with no flash | bit row; lowest-bit highlight; op counter | both |
| 6 | `l5-model` | `bitBoard`/`register` (`op:'shift'`): drag/step a shift amount k → bits slide left, value ×2ᵏ; a side panel shows `(x<<3)−x = 7x`; headline = `toBinary(multiplyByShift(a,k))` | `bitBoard` (`display:'register'`, `op:'shift'`) | **NEW** | `aria-live` "x<<3 = 8x; 8x − x = 7x." Ungraded. `interviewNote` here; `comparison:true` (AND-mask vs XOR-parity) | shift stepper ≥44px; `aria-live`; reduced-motion = bits jump to shifted position | bit row sliding; ×2ᵏ readout | both |
| 7 | `l5-apply` | Type the set-bit count of 11 → Check vs accept `["3"]` | `answerEntry` | reuse | triple: ✓ "11 = 1011 → three 1-bits." · H1 "Clear the lowest 1-bit repeatedly with n&(n−1)." · H2 "Steps to reach 0 = the count." · H3 reveal `3` | numeric input, `aria-label` | input | both |
| 8 | `l5-transfer` | **Held-out transfer.** Type the lone number in `[7,3,5,3,7]` (XOR-all) → Check vs accept `["5"]` | `answerEntry` (`track:'B'`, `required:false`) | reuse | triple: ✓ "XOR cancels the pairs; 5 survives." · H1 "XOR everything together." · H2 "7⊕3⊕5⊕3⊕7: the doubles vanish." · H3 reveal `5` | numeric input | input | B |
| 9 | `l5-prove` | **Mastery (required).** Type the lone number in `[4,1,2,1,2]` (XOR-all) → Check vs accept `["4"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "XOR-all: 1,1 and 2,2 cancel, leaving 4." · H1 "XOR every element." · H2 "Equal values XOR to 0; the loner remains." · H3 reveal `4` | scenario + numeric input, `aria-label` | scenario + input | both |
| 10 | `l5-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** `l5-recall` (`retrievalGrid`) is the first graded beat (opener + early-win).
`l5-transfer` (B / required:false) immediately precedes `l5-prove` (`masteryChallenge`, required) →
`l5-recap`.

## New interaction types (for Wave 0)
See `lesson-binary-information-1/interaction-spec.md`. L5 exercises the `register` `op` headlines:
- `op:'and-x-minus-1'`: `headline === toBinary(value & (value-1))` — e.g. 12 → `"1000"` (8).
- `op:'shift'`: `headline === toBinary(multiplyByShift(operands.a, operands.k))` — e.g. (6,3) → `"110000"` (48).
- `op:'xor'`: `headline === toBinary(xorAll([operands.a, operands.b]))`.
The Single-Number / popcount answers are graded via `answerEntry`/`masteryChallenge`, not the widget.

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l5-recall` | `xorAll([3,4,5])=2` | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l5-bet` | `xorAll([4,1,2,1,2])=4` | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l5-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,collapsible}` |
| `l5-win` | `isPowerOfTwo(16n)=true` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l5-explore` | `popcount`,`toBinary` | **`BitBoardBeat.tsx`** `register`+`op:'and-x-minus-1'` | `interaction.{display:'register',value,op,interactive:true,headline}` |
| `l5-model` | `multiplyByShift`,`toBinary` | **`BitBoardBeat.tsx`** `register`+`op:'shift'` | `interaction.{display:'register',op,operands:{a,k},headline}`, `interviewNote`, `comparison:true` |
| `l5-apply` | `popcount(11n)=3` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l5-transfer` | `xorAll([7,3,5,3,7])=5` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `track:'B'`, `required:false` |
| `l5-prove` | `xorAll([4,1,2,1,2])=4` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l5-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3): `isPowerOfTwo(16n)=true`, `isPowerOfTwo(5n)=false`,
`multiplyByShift(6n,3n)=48n` (8·6, then 48−6=42 in copy), `popcount(11n)=3`,
`xorAll([4n,1n,2n,1n,2n])=4n`, `xorAll([7n,3n,5n,3n,7n])=5n`.

## Definition-of-Ready checklist

| beat | verified+sourced | direct-manipulation | instant feedback + 3-level hints | a11y |
|------|:---:|:---:|:---:|:---:|
| `l5-recall` | ✓ game-theory-6 (XOR) | ✓ tap-match | ✓ | ✓ |
| `l5-bet` | ✓ S11 (loner=4) | ✓ chip | ✓ byOption | ✓ |
| `l5-primer` | ✓ (JIT) | ✓ tap-expand | n/a | ✓ |
| `l5-win` | ✓ GB1/S12 (16→true) | ✓ type-in | ✓ | ✓ |
| `l5-explore` | ✓ GB1 / S13 (x&(x−1)) | ✓ Apply → bit clears | ✓ live + hints | ✓ |
| `l5-model` | ✓ GB2 ((x<<3)−x) | ✓ shift stepper | ✓ live | ✓ |
| `l5-apply` | ✓ S13 (popcount 11) | ✓ type-in | ✓ | ✓ |
| `l5-transfer` | ✓ S11 ([7,3,5,3,7]→5) | ✓ type-in | ✓ | ✓ |
| `l5-prove` | ✓ S11 ([4,1,2,1,2]→4) | ✓ type-in | ✓ | ✓ |
| `l5-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `bitBoard`.
