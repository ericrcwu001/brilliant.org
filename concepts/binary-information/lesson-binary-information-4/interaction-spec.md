# Interaction Spec: The Scale Speaks Base-3  (lesson-binary-information-4)

> The NEW `weighing` Zod shape is frozen in
> `lesson-binary-information-1/interaction-spec.md → ## New interaction types (for Wave 0)`.
> L4 is the **only** lesson that uses `weighing` (displays `scale` and `ternary`). It needs the
> Wave-0 engine gap `balancedTernary(n)` (flagged in STATUS / brief) for the `ternary` headline.

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l4-recall` | Tap a left prompt ("3 bags × 3 states", "balance outcomes"), tap/drag its match ("3³ = 27", "left / balanced / right") → slot fills; Check grades pairs, then pivots: the scale is a 3-way answer | `retrievalGrid` | reuse | triple: ✓ "3³=27 combos; a balance gives 3 answers per weighing." · H1 "Each weighing has three outcomes, not two." · H2 "L / balanced / R = a base-3 digit." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 2 | `l4-bet` | Tap one chip ("6" / "4" / **"3"**) → per-option note; advance commits | `prediction` (`byOption`) | reuse | byOption: ✓ "3" → "Right — a balance is base-3, so split into thirds." · ✗ "6" → "Worth testing — you're halving like the mice; a scale gives three answers." · ✗ "4" → "Worth testing — 3³=27 already exceeds the 25 outcomes you must distinguish." | radiogroup, 44px chips, `aria-checked` | chips | both |
| 3 | `l4-primer` | Tap-expand "left / balanced / right = three answers" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (ungraded). Body: a balance is a base-3 oracle, not base-2 | 44px tap, `aria-expanded`; static | collapse/expand | A (required:false) |
| 4 | `l4-win` | Type fewest weighings for 9 coins (one heavier, direction known) → Check vs accept `["2"]` → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "Three groups of 3, ⌈log₃9⌉ = 2." · H1 "Split 9 into 3 groups; the tilt picks one." · H2 "One weighing per base-3 digit: 2." · H3 reveal `2` | numeric input, `aria-label`, Enter submits | input | both |
| 5 | `l4-explore` | `weighing`/`scale`: drag coin-groups onto the two pans → the beam tilts L / level / R instantly (the 3-way digit); a weighings counter ticks; split the suspects into thirds and the tilt picks the third; replay | `weighing` (`display:'scale'`, `interactive:true`) | **NEW** | per-weigh `aria-live` "left pan heavier → fake is in the left third (1 weighing used)." Ungraded. Hints: H1 "Split into 3 equal groups, not 2." H2 "The tilt names which third holds the fake." H3 "12 coins → 3 weighings." | drag targets (pans) ≥44px; tap fallback to assign a group to a pan; `aria-live` mirrors tilt + count; reduced-motion = beam snaps to final tilt, no swing | two-pan balance; 3-state tilt; counter | both |
| 6 | `l4-model` | `weighing`/`scale` (generalize): a stepper for N items shows ⌈log₃N⌉; a toggle "direction known?" switches the bound 3ⁿ vs (3ⁿ−3)/2; headline = `weighingsForN(N, known)` | `weighing` (`display:'scale'`) | **NEW** | `aria-live` "12 coins, direction unknown → 3 weighings ((3³−3)/2 = 12)." Ungraded. `interviewNote` here; `comparison:true` (base-2 vs base-3) | stepper + toggle ≥44px; `aria-live` | balance + bound readout | both |
| 7 | `l4-apply` | Type the Bachet weight set covering 1–40 → Check vs accept `["1,3,9,27","27"]` (largest or full set) | `answerEntry` | reuse | triple: ✓ "Powers of 3; weights on either pan give every mass 1–40 (1+3+9+27=40)." · H1 "You may place weights *with* the object (subtract)." · H2 "That makes base-3: 1,3,9,27." · H3 reveal `1,3,9,27` | text input, `aria-label` (accept comma list or `27`) | input | both |
| 8 | `l4-transfer` | **Held-out transfer.** `weighing`/`ternary` to weigh 22 g, then type the placement → Check vs accept `["22","27-9+3+1"]` | `weighing` (`display:'ternary'`, `track:'B'`, `required:false`) + a graded `answerEntry` sibling | reuse + **NEW** | triple: ✓ "22 = 27−9+3+1: put 27 opposite the object, 9 with it, 3 and 1 opposite." · H1 "You may place weights with the object." · H2 "Balanced-ternary digits of 22 over {27,9,3,1}." · H3 reveal `27-9+3+1` | `ternary` placement ≥44px drag/tap; `aria-live` "object + 9 = 27 + 3 + 1 → balanced"; numeric/text input; reduced-motion = static balanced frame | number-line / two-pan ±weights | B |
| 9 | `l4-prove` | **Mastery (required).** Type min weighings for 12 coins (fake, unknown direction) → Check vs accept `["3"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "3³=27 ≥ 2·12+1=25; (3³−3)/2=12 ⇒ 3." · H1 "Direction unknown costs slack: use the (3ⁿ−3)/2 bound." · H2 "n=3 covers 12 coins." · H3 reveal `3` | scenario + numeric input, `aria-label` | scenario + input | both |
| 10 | `l4-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** `l4-recall` (`retrievalGrid`) is the first graded beat (opener + early-win).
`l4-transfer` (B / required:false) immediately precedes `l4-prove` (`masteryChallenge`, required) →
`l4-recap`.

> **Design note for the Manager (`l4-transfer` shape):** the transfer must be a *graded* B-track beat
> per spec-24, but `weighing` is ungraded (not in `GRADED_TYPES`). I model it as a `weighing`/`ternary`
> **explore widget paired with a graded `answerEntry`** (the typed placement is what's graded). The
> first graded beat per lesson stays `retrievalGrid`, so this addition is safe. Alternative if the
> Manager prefers exactly one beat: make `l4-transfer` a plain `answerEntry` (accept `27-9+3+1`/`22`)
> and demote the `ternary` widget to the `l4-explore`/model surface. **Recommend the paired form** —
> the balanced-ternary placement is the whole point of the transfer and deserves a manipulation.

## New interaction types (for Wave 0)
See `lesson-binary-information-1/interaction-spec.md`. L4's `weighing`:
- `scale` headline = `String(weighingsForN(BigInt(items), directionKnown))` — e.g. `(12,false)→"3"`, `(9,true)→"2"`.
- `ternary` headline = `balancedTernary(target)` over `weights.set`, signed comma-joined high→low — e.g. 22 over [27,9,3,1] → `"+1,-1,+1,+1"`.
- **Engine gap:** `balancedTernary(n: bigint): {set:bigint[], digits:number[]}` (digits ∈ {−1,0,+1}) must be added to `binary.ts` in Wave 0 (Dept 3) — the only new helper beyond the frozen interface.

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l4-recall` | (static pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l4-bet` | (none) | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l4-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,collapsible}` |
| `l4-win` | `weighingsForN(9n,true)=2` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l4-explore` | `weighingsForN` | **`WeighingBeat.tsx`** `scale` | `interaction.{display:'scale',items,directionKnown,interactive:true,headline}` |
| `l4-model` | `weighingsForN` | **`WeighingBeat.tsx`** `scale` | `interaction.{display:'scale',items,directionKnown,headline}`, `interviewNote`, `comparison:true` |
| `l4-apply` | `bachetWeights(40n)=[1,3,9,27]` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l4-transfer` | `balancedTernary(22n)` (NEW), `bachetWeights` | **`WeighingBeat.tsx`** `ternary` + `AnswerEntryBeat` | `interaction.{display:'ternary',target:22,weights:{set:[1,3,9,27]},headline}`, `track:'B'`, `required:false` |
| `l4-prove` | `weighingsForN(12n,false)=3` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l4-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3): `weighingsForN(9n,true)=2`, `weighingsForN(12n,false)=3`,
`bachetWeights(40n)=[1,3,9,27]`, `balancedTernary(22n)` digits = `(+1,−1,+1,+1)` over (27,9,3,1).

## Definition-of-Ready checklist

| beat | verified+sourced | direct-manipulation | instant feedback + 3-level hints | a11y |
|------|:---:|:---:|:---:|:---:|
| `l4-recall` | ✓ combinatorics-1 (3³) | ✓ tap-match | ✓ | ✓ |
| `l4-bet` | ✓ GB5/S9 (12→3) | ✓ chip | ✓ byOption | ✓ |
| `l4-primer` | ✓ (JIT) | ✓ tap-expand | n/a | ✓ |
| `l4-win` | ✓ S5 (9→2) | ✓ type-in | ✓ | ✓ |
| `l4-explore` | ✓ GB5 (3-way split) | ✓ load pans → tilt | ✓ live + hints | ✓ |
| `l4-model` | ✓ GB5 (3ⁿ−3)/2 | ✓ stepper + toggle | ✓ live | ✓ |
| `l4-apply` | ✓ S10 Bachet | ✓ type-in | ✓ | ✓ |
| `l4-transfer` | ✓ S10 (22 g) | ✓ ternary placement + type-in | ✓ | ✓ |
| `l4-prove` | ✓ GB5 (12→3) | ✓ type-in | ✓ | ✓ |
| `l4-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `weighing` (the one open Manager
arbitration is the `l4-transfer` shape above, not a new type).
