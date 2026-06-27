# Interaction Spec: Group Testing (Poisoned Wine)  (lesson-binary-information-3)

> The NEW `bitBoard` / `weighing` Zod shapes are frozen in
> `lesson-binary-information-1/interaction-spec.md → ## New interaction types (for Wave 0)`.
> L3 uses `bitBoard` display `groupTest` (the poisoned-wine grid) — its headline is the recovered
> culprit index = `String(fromBinary(deathPattern))`.

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l3-recall` | Tap a left prompt (`k=1`,`2`,`3`,`10`), tap/drag its match (`2`,`4`,`8`,`1024`) → slot fills; Check grades all 4 | `retrievalGrid` | reuse | triple: ✓ "k bits ↔ 2ᵏ items — the same capacity, now for testers." · H1 "Each tester adds one bit, doubling capacity." · H2 "1→2, 2→4, 3→8, 10→1024." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 2 | `l3-bet` | Tap one chip ("10 bottles" / "100 bottles" / **"All 1000"**) → per-option note; advance commits | `prediction` (`byOption`) | reuse | byOption: ✓ "All 1000" → "Right — 10 mice label 1024; the death pattern names the culprit." · ✗ "10 bottles" → "Worth testing — each mouse covers half, not one." · ✗ "100 bottles" → "Worth testing — capacity doubles per mouse: 10 → 1024." | radiogroup, 44px chips, `aria-checked` | chips | both |
| 3 | `l3-primer` | Tap-expand "a mouse = a bit, run in parallel" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (ungraded). Body: every mouse reports one bit; all sip at once → one round | 44px tap, `aria-expanded`; static | collapse/expand | A (required:false) |
| 4 | `l3-win` | Type how many bottles 2 mice clear → Check vs accept `["4"]` → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "2 mice → labels 00,01,10,11 → 4." · H1 "Each mouse is a bit." · H2 "2 bits → 2²=4 labels." · H3 reveal `4` | numeric input, `aria-label`, Enter submits | input | both |
| 5 | `l3-explore` | `bitBoard`/`groupTest`: tap a bottle (column) to **poison** it → the mice (rows) whose bit is 1 light "dead"; read the dead/alive column to recover the index; the recovered index appears live; reuse-loop with a new bottle | `bitBoard` (`display:'groupTest'`, `interactive:true`) | **NEW** | per-tap `aria-live` "mice 1,4,5 died → pattern 0010110000 → bottle 176." Ungraded. Hints: H1 "Read the dead pattern as binary." H2 "Dead=1, alive=0, top mouse = lowest bit." H3 show the recovered index | each bottle/mouse cell ≥44px; columns labelled in binary (`aria-label`); `aria-live` mirrors pattern+index; reduced-motion = cells flip state with no animation | item-columns × tester-rows grid; lit death pattern; index readout | both |
| 6 | `l3-model` | `bitBoard`/`groupTest` (generalize): a slider/stepper for k mice shows 2ᵏ capacity and "still one round"; headline = recovered index for the shown culprit | `bitBoard` (`display:'groupTest'`) | **NEW** | `aria-live` "k=10 mice clear up to 1024 bottles in one round." Ungraded. `interviewNote` here | grid + capacity readout; `aria-live` | grid; capacity scale | both |
| 7 | `l3-apply` | Type fewest **weighings** for 9 balls (one heavier) → Check vs accept `["2"]` (the base-3 teaser that seeds L4) | `answerEntry` | reuse | triple: ✓ "A balance splits into thirds: ⌈log₃9⌉=2." · H1 "A balance has three outcomes, not two." · H2 "3 groups of 3 → 2 weighings." · H3 reveal `2` | numeric input, `aria-label`; `comparison:true` (base-2 mice vs base-3 scale) | input | both |
| 8 | `l3-transfer` | **Held-out transfer.** Type min mice for 600 bottles → Check vs accept `["10"]` | `answerEntry` (`track:'B'`, `required:false`) | reuse | triple: ✓ "2⁹=512<600≤1024=2¹⁰ ⇒ 10." · H1 "Smallest k with 2ᵏ ≥ 600." · H2 "512 is too few; need 2¹⁰." · H3 reveal `10` | numeric input | input | B |
| 9 | `l3-prove` | **Mastery (required).** Type min mice for 1000 bottles → Check vs accept `["10"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "2¹⁰=1024≥1000 ⇒ 10 mice." · H1 "One mouse per bit; how many bits label 1000?" · H2 "10 bits (1000 < 1024)." · H3 reveal `10` | scenario + numeric input, `aria-label` | scenario + input | both |
| 10 | `l3-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** `l3-recall` is the first graded beat (opener + early-win). `l3-transfer`
(B / required:false) immediately precedes `l3-prove` (`masteryChallenge`, required) → `l3-recap`.
`l3-apply` is the base-2↔base-3 interleave that seeds L4.

## New interaction types (for Wave 0)
See `lesson-binary-information-1/interaction-spec.md`. L3's `groupTest` headline must equal
`String(fromBinary(deathPatternOf(culprit, items)))` — the recovered culprit index (engine cross-check
in `validate-fixtures.ts`, mirroring §3c–3e). `deathPatternOf` builds the bit-string from `culprit`'s
binary label; the engine round-trip `fromBinary(toBinary(culprit)) === culprit` is the anchor.

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l3-recall` | (static pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l3-bet` | (none) | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l3-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,collapsible}` |
| `l3-win` | `bitsNeeded`/2ᵏ | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l3-explore` | `toBinary`,`fromBinary` | **`BitBoardBeat.tsx`** `groupTest` | `interaction.{display:'groupTest',items,culprit,interactive:true,headline}` |
| `l3-model` | `bitsNeeded`,`fromBinary` | **`BitBoardBeat.tsx`** `groupTest` | `interaction.{display:'groupTest',items,headline}`, `interviewNote` |
| `l3-apply` | `weighingsForN(9n,true)=2` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback`, `comparison:true` |
| `l3-transfer` | `bitsNeeded(600n)=10` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `track:'B'`, `required:false` |
| `l3-prove` | `bitsNeeded(1000n)=10` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l3-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3): `bitsNeeded(1000n)=10`, `bitsNeeded(600n)=10`, `toBinary(1000n)="1111101000"`,
`fromBinary("1111101000")=1000n`, `weighingsForN(9n,true)=2` (base-3 teaser, fully owned in L4).

## Definition-of-Ready checklist

| beat | verified+sourced | direct-manipulation | instant feedback + 3-level hints | a11y |
|------|:---:|:---:|:---:|:---:|
| `l3-recall` | ✓ in-concept 2ᵏ | ✓ tap-match | ✓ | ✓ |
| `l3-bet` | ✓ GB3 / S8 | ✓ chip | ✓ byOption | ✓ |
| `l3-primer` | ✓ (JIT) | ✓ tap-expand | n/a | ✓ |
| `l3-win` | ✓ 2 mice → 4 | ✓ type-in | ✓ | ✓ |
| `l3-explore` | ✓ GB3 (pattern→index) | ✓ poison + read grid | ✓ live + hints | ✓ |
| `l3-model` | ✓ GB3 generalize | ✓ k-stepper grid | ✓ live | ✓ |
| `l3-apply` | ✓ S5/S6 (9→2) | ✓ type-in | ✓ | ✓ |
| `l3-transfer` | ✓ 600→10 | ✓ type-in | ✓ | ✓ |
| `l3-prove` | ✓ GB3 (1000→10) | ✓ type-in | ✓ | ✓ |
| `l3-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `bitBoard`.
