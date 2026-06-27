# Interaction Spec: Bits as Information  (lesson-binary-information-2)

> The NEW `bitBoard` / `weighing` Zod shapes are frozen once, in
> `lesson-binary-information-1/interaction-spec.md → ## New interaction types (for Wave 0)`.
> This spec references that freeze; L2 uses `bitBoard` displays `questions` and `register`.

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l2-recall` | Tap a left prompt ("N>H", "N items / H holes"), tap/drag its match ("a collision is forced", "⌈N/H⌉") → slot fills; Check grades both pairs | `retrievalGrid` | reuse | triple: ✓ "Pigeonhole: N>H forces a shared box; some box holds ⌈N/H⌉." · H1 "More items than boxes ⇒ two share one." · H2 "⌈N/H⌉ is the guaranteed busiest box." · H3 reveal pairs | tap-only, 44px, `aria-live`; reduced-motion = instant snap | left↔right grid | both |
| 2 | `l2-bet` | Tap one chip ("500" / "100" / **"10"**) → instant per-option note; advance commits | `prediction` (`byOption`) | reuse | byOption: ✓ "10" → "Right — each yes/no halves 1000: 500,250,…,1 in 10." · ✗ "500" → "Worth testing — you halve the whole range, not one number." · ✗ "100" → "Worth testing — halving reaches 1 in 10, not 100." | radiogroup, 44px chips, `aria-checked` | chips | both |
| 3 | `l2-primer` | Tap-expand "one yes/no halves the field" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (ungraded). Body: a good question rules out *half*, not one | 44px tap, `aria-expanded`; static | collapse/expand | A (required:false) |
| 4 | `l2-win` | Type the min questions for 1–100 → Check vs accept `["7"]` → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "2⁷=128 ≥ 100 ⇒ 7." · H1 "Count doublings until you pass 100." · H2 "2,4,8,…,128 — that's 7 doublings." · H3 reveal `7` | numeric input, `aria-label`, Enter submits; no motion | input | both |
| 5 | `l2-explore` | `bitBoard`/`questions`: tap **Yes/No** to each "is it > midpoint?" → the candidate range halves live and a step counter ticks; reach a single value in ⌈log₂n⌉ steps; replay | `bitBoard` (`display:'questions'`, `interactive:true`) | **NEW** | per-answer `aria-live` "range now 1–500 (1 question used)". Ungraded. Hints: H1 "Halve, don't pick one." H2 "1000→500→…→1." H3 "It takes 10." | each Yes/No ≥44px; `aria-live` polite mirrors range+count; reduced-motion = range collapses without slide animation | shrinking range bar; per-bit fill | both |
| 6 | `l2-model` | `bitBoard`/`register` (read mode): toggle k bits and watch "names 2ᵏ outcomes" — the **inverse** of L1; a side note ties 2ᵏ≥N to pigeonhole | `bitBoard` (`display:'register'`) | **NEW** | `aria-live` "k=10 bits name 1024 outcomes ≥ 1000." Ungraded. `interviewNote` here. `comparison:true` (2ⁿ-forward vs ⌈log₂N⌉-inverse) | bit cells ≥44px, `aria-pressed`, `aria-live`; reduced-motion ok | bit row + 2ᵏ readout | both |
| 7 | `l2-apply` | Type min questions for 1–1,000,000 → Check vs accept `["20"]` | `answerEntry` | reuse | triple: ✓ "2²⁰=1,048,576 > 10⁶ ⇒ 20." · H1 "It's the exponent, not the size." · H2 "How many doublings exceed a million? 2²⁰." · H3 reveal `20` | numeric input, `aria-label` | input | both |
| 8 | `l2-transfer` | **Held-out transfer.** Type min questions for 1–500 → Check vs accept `["9"]` | `answerEntry` (`track:'B'`, `required:false`) | reuse | triple: ✓ "2⁸=256<500≤512=2⁹ ⇒ 9." · H1 "Is 256 enough? No." · H2 "Need 2⁹=512 ≥ 500 ⇒ the exponent 9." · H3 reveal `9` | numeric input | input | B |
| 9 | `l2-prove` | **Mastery (required).** Type min questions for 1–1000 → Check vs accept `["10"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "⌈log₂1000⌉ = 10 (2¹⁰=1024)." · H1 "How many halvings reach 1 from 1000?" · H2 "1000→500→…→1: ten steps." · H3 reveal `10` | scenario + numeric input, `aria-label` | scenario + input | both |
| 10 | `l2-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** `l2-recall` (`retrievalGrid`) is the first graded beat (opener + early-win).
`l2-transfer` (B / required:false) immediately precedes `l2-prove` (`masteryChallenge`, required),
which immediately precedes `l2-recap`.

## New interaction types (for Wave 0)
See `lesson-binary-information-1/interaction-spec.md`. L2 uses `bitBoard` displays `questions`
(headline = `String(bitsNeeded(n))`) and `register`.

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l2-recall` | (static pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l2-bet` | (none) | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l2-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,collapsible}` |
| `l2-win` | `bitsNeeded(100n)=7` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l2-explore` | `bitsNeeded` | **`BitBoardBeat.tsx`** `questions` | `interaction.{display:'questions',n,interactive:true,headline}` |
| `l2-model` | `bitsNeeded` (inverse readout) | **`BitBoardBeat.tsx`** `register` | `interaction.{display:'register',bits,headline}`, `interviewNote`, `comparison:true` |
| `l2-apply` | `bitsNeeded(1_000_000n)=20` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l2-transfer` | `bitsNeeded(500n)=9` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `track:'B'`, `required:false` |
| `l2-prove` | `bitsNeeded(1000n)=10` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l2-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3): `bitsNeeded(100n)=7`, `bitsNeeded(1000n)=10`, `bitsNeeded(1_000_000n)=20`,
`bitsNeeded(500n)=9`. Pigeonhole recall is *referenced*, reproduced by the existing `combinatorics.ts`
(`forcesCollision`) — no new engine for the opener.

## Definition-of-Ready checklist

| beat | verified+sourced | direct-manipulation | instant feedback + 3-level hints | a11y |
|------|:---:|:---:|:---:|:---:|
| `l2-recall` | ✓ combinatorics-5 | ✓ tap-match | ✓ | ✓ |
| `l2-bet` | ✓ S4 (1000→10) | ✓ chip | ✓ byOption | ✓ |
| `l2-primer` | ✓ (JIT) | ✓ tap-expand | n/a | ✓ |
| `l2-win` | ✓ S2 (100→7) | ✓ type-in | ✓ | ✓ |
| `l2-explore` | ✓ S4 halving | ✓ Yes/No → live range | ✓ live + hints | ✓ |
| `l2-model` | ✓ inverse 2ᵏ≥N | ✓ toggle bits | ✓ live | ✓ |
| `l2-apply` | ✓ S3 (10⁶→20) | ✓ type-in | ✓ | ✓ |
| `l2-transfer` | ✓ 500→9 | ✓ type-in | ✓ | ✓ |
| `l2-prove` | ✓ S4 (1000→10) | ✓ type-in | ✓ | ✓ |
| `l2-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `bitBoard`.
