# Interaction Spec: Every Number Is Bits  (lesson-binary-information-1)

> Design-only. Maps each beat in `brief.md` to a committed (reuse) or Wave-0 (NEW) interaction
> type, with the direct-manipulation mechanic, instant feedback + 3-level hint ladder, and a11y.
> The two NEW types (`bitBoard`, `weighing`) are frozen in the shared **`## New interaction types`**
> section at the end of L1's spec only (single source of truth — the other lessons reference it).

## Per-beat table

| # | beatId | mechanic (manipulate → instant response → loop) | interaction type | reuse or NEW | feedback + hints (3-level ladder) | a11y | visual/motion | track |
|---|--------|------------------------------------------------|------------------|--------------|-----------------------------------|------|---------------|-------|
| 1 | `l1-recall` | Tap a left result (`n=1`,`2`,`3`,`10`), then tap/drag its match (`2`,`4`,`8`,`1024`) into the slot → slot fills + recolors; Check grades all 4 pairs at once → loop on wrong pairs | `retrievalGrid` | reuse | byPattern/triple: ✓ "n flips → 2ⁿ strings; those strings *are* the numbers 0…2ⁿ−1." · H1 "Each flip doubles the count." · H2 "1→2, 2→4, 3→8 … 10→1024." · H3 reveal the 4 pairs | tap-only (no drag required); 44px tiles; `aria-live` "Some matches need another look / All matched"; reduced-motion = instant snap (no fly) | left↔right grid, slot tint on match | both |
| 2 | `l1-bet` | Tap one chip ("6 cuts" / "3 cuts" / **"2 cuts"**) → instant per-option note; advance commits the bet | `prediction` (`byOption`) | reuse | byOption: ✓ "2 cuts" → "Right — powers of two pay every total by giving and taking back." · ✗ "6 cuts" → "Worth testing — you can take change back, so not one piece a day." · ✗ "3 cuts" → "Close: 2 cuts already give 3 pieces {1,2,4}." | radiogroup, 44px chips, `aria-checked`; no motion | chips only | both |
| 3 | `l1-primer` | Tap to expand the "a bit = is this power *in* the sum?" card (collapsible) | `primer` (`variant:'custom'`, collapsible) | reuse | n/a (never graded). Body teaches place value: each bit owns one power of 2 | tap target 44px; `aria-expanded`; static | collapse/expand only | A (required:false) |
| 4 | `l1-win` | Type the largest gold-rod piece into one field → Check normalizes against accept `["4"]` → ✓ lock green / ✗ hint ladder, Try Again clears | `answerEntry` | reuse | triple: ✓ "Exactly — pieces are 1,2,4; biggest is 4." · H1 "Which powers of two sum to 7?" · H2 "1+2+4 = 7; the largest is 4." · H3 reveal `4` | keyboard+tap input, `inputMode=numeric`, `aria-label`; Enter submits; no motion | input + suffix | both |
| 5 | `l1-explore` | `bitBoard`/`register`: tap each bit cell to toggle 0↔1 → the decimal value + the running `+power` sum recompute instantly; goal banner asks to build a target N; reuse-loop until value == n | `bitBoard` (`display:'register'`) | **NEW** | per-slot: toggling a bit shows "+8" / "−8"; `aria-live` reads "value now 40 = 32+8". No grade (explore). Hint copy via `feedback.hints`: H1 "Largest power ≤ N first." H2 "N − that power, repeat." H3 show the target pattern | each bit cell ≥44px; `aria-pressed` per bit; `aria-live` polite mirrors value+sum; reduced-motion = no flip animation, value updates instantly | row of bit cells; lowest-bit highlight; sum strip | both |
| 6 | `l1-model` | `bitBoard`/`register` (read mode): toggle any bit and watch the value change by exactly that power → demonstrates uniqueness (no two patterns share a value) | `bitBoard` (`display:'register'`) | **NEW** | `aria-live` "toggling bit 5 changed value by 32." No grade. `interviewNote` lives here. Hints unused | as above; `aria-live` per toggle | bit row; delta callout | both |
| 7 | `l1-apply` | Type 100 in binary into one field → Check vs accept `["1100100"]` (also accept spaced) → ✓/✗ ladder | `answerEntry` | reuse | triple: ✓ "100 = 64+32+4 = 1100100." · H1 "Subtract the biggest power ≤ 100 (64), repeat." · H2 "100−64=36→32, 4→4 ⇒ bits at 64,32,4." · H3 reveal `1100100` | text input, `inputMode` text (binary string), `aria-label`; no motion | input | both |
| 8 | `l1-transfer` | **Held-out transfer.** Type 43 in binary → Check vs accept `["101011"]` | `answerEntry` (`track:'B'`, `required:false`) | reuse | triple: ✓ "43 = 32+8+2+1 = 101011." · H1 "Biggest power ≤ 43 is 32." · H2 "43−32=11 → 8, 11−8=3 → 2+1." · H3 reveal `101011` | as `l1-apply` | input | B |
| 9 | `l1-prove` | **Mastery (required).** Type 1000 in binary → Check vs accept `["1111101000"]` | `masteryChallenge` (`required:true`) | reuse | triple: ✓ "1000 = 512+256+128+64+32+8 = 1111101000." · H1 "Biggest power ≤ 1000 is 512." · H2 "1000−512=488→256, 232→128, …" · H3 reveal `1111101000` | input + scenario text; `aria-label`; no motion | scenario + input | both |
| 10 | `l1-recap` | Read the closer; Continue | `recap` | reuse | n/a | static | none | both |

**Order constraint:** beats 1→10 as numbered. `l1-transfer` (B-track, required:false) sits **immediately before** `l1-prove` (the spec-24 shape: B-track / required:false / before mastery, with no `heldOut` field per STATUS.md). `l1-recall` is the first graded beat (`retrievalGrid`) = the retrieval opener + early-win.

---

## New interaction types (for Wave 0)

> **THE freeze.** These two Zod variants are added to `InteractionSchema` (discriminated union on
> `type`) verbatim in Wave 0. They mirror the committed `chainBoard` / `stoppingBoard` / `payoffMatrix`
> precedent: **one type folds several `display`s**, carries an **engine-reproducible `headline`** (a
> plain string cross-checked by `validate-fixtures.ts`), is **NOT** in `GRADED_TYPES` / `HERO_TYPES` /
> `mastery.ts`, and is **Firestore-safe** (no directly-nested arrays — every 2-D structure is wrapped
> in `{ cells: [...] }` objects, exactly as `chainBoard.matrix` and `payoffMatrix.matrix` do).

### `bitBoard` — a row (or grid) of toggleable bits

```ts
// L1 register/model, L2 questions, L3 group-test, L5 bit-trick rows, L6 XOR columns.
z.object({
  type: z.literal('bitBoard'),
  display: z.enum(['register', 'questions', 'groupTest']),
  // ── register (L1 build/read a number; L5 mask/shift/XOR shown as bit rows) ──
  // Width of the bit row (number of bit positions). Default 10 (covers 0…1023, the GB 1000).
  bits: z.number().int().positive().optional(),
  // Target the learner builds toward (register/build) or the value to read (model). Decimal.
  value: z.number().int().nonnegative().optional(),
  // L5 only: the bitwise op the row demonstrates and its operand, so the renderer
  // animates the per-bit effect (clear-lowest / shift / xor). Omitted in L1.
  op: z.enum(['and-x-minus-1', 'shift', 'xor']).optional(),
  // L5 xor/shift operands as DECIMALS in an object wrapper (Firestore-safe; no bare array
  // at top level is fine, but we keep operands named for the renderer). Optional.
  operands: z.object({ a: z.number().int(), b: z.number().int().optional(), k: z.number().int().optional() }).optional(),
  // ── questions (L2 ⌈log₂N⌉ halving game) ──
  // Size of the search space 1…n; each yes/no answer fixes one bit and halves the range.
  n: z.number().int().positive().optional(),
  // ── groupTest (L3 poisoned-wine grid) ──
  // Number of items (columns), each labelled in binary; number of testers = ⌈log₂items⌉ rows.
  items: z.number().int().positive().optional(),
  // The hidden culprit index the learner recovers from the death pattern (1-based or 0-based;
  // renderer treats as the integer whose binary label lights the testers). Optional (random if absent).
  culprit: z.number().int().nonnegative().optional(),
  // The learner manipulates (toggle bits / answer yes-no / read the pattern) vs a passive watch.
  interactive: z.boolean().optional(),
  // Engine-reproducible headline anchor — a plain string, cross-checked by validate-fixtures:
  //   register  → toBinary(value)               e.g. value 1000 → "1111101000"
  //   register+op → toBinary(result)            e.g. and-x-minus-1 of 12 → "1000"; shift/xor of operands
  //   questions → String(bitsNeeded(n))         e.g. n 1000 → "10"
  //   groupTest → String(fromBinary(deathPattern)) = the recovered culprit index, e.g. "176"
  headline: z.string().optional(),
})
```

`headline` semantics by display (the `validate-fixtures.ts` cross-check, mirroring §3c–3e):
- `register` (no `op`): `headline === toBinary(BigInt(value))`.
- `register` + `op:'and-x-minus-1'`: `headline === toBinary(value & (value-1))` (e.g. 12→`"1000"`).
- `register` + `op:'shift'`: `headline === toBinary(multiplyByShift(operands.a, operands.k))`.
- `register` + `op:'xor'`: `headline === toBinary(xorAll([operands.a, operands.b]))`.
- `questions`: `headline === String(bitsNeeded(BigInt(n)))`.
- `groupTest`: `headline === String(fromBinary(deathPatternOf(culprit, items)))` = the culprit index.

### `weighing` — a two-pan balance the learner loads and reads (L4)

```ts
z.object({
  type: z.literal('weighing'),
  display: z.enum(['scale', 'ternary']),
  // ── scale (L4 base-3 weighing game; the 3-way tilt = a base-3 digit) ──
  // Number of items among which exactly one is the fake. Drives the weighings counter.
  items: z.number().int().positive().optional(),
  // Whether the fake's direction (heavier vs lighter) is known. Selects the bound:
  //   directionKnown → 3ⁿ ≥ N ; unknown → (3ⁿ−3)/2 ≥ N (the GB defective-ball bound).
  directionKnown: z.boolean().optional(),
  // ── ternary (L4 transfer: Bachet / balanced-ternary placement of weights) ──
  // The mass to weigh, e.g. 22. The learner places ±weights on the two pans to balance it.
  target: z.number().int().positive().optional(),
  // The weight set, as a wrapped object (Firestore-safe). Bachet → {set:[1,3,9,27]}.
  weights: z.object({ set: z.array(z.number().int().positive()) }).optional(),
  // The learner manipulates (load pans / place weights) vs a passive watch.
  interactive: z.boolean().optional(),
  // Engine-reproducible headline anchor — a plain string, cross-checked by validate-fixtures:
  //   scale   → String(weighingsForN(items, directionKnown))   e.g. (12,false) → "3"
  //   ternary → the balanced-ternary digit string of `target` over `weights.set`,
  //             joined high→low with signs, e.g. 22 over [27,9,3,1] → "+1,-1,+1,+1"  (27−9+3+1)
  headline: z.string().optional(),
})
```

`headline` semantics by display:
- `scale`: `headline === String(weighingsForN(BigInt(items), directionKnown))`.
- `ternary`: `headline === balancedTernary(target)` formatted as a signed comma-joined digit list aligned to `weights.set` high→low (engine `balancedTernary(n)` — the small Wave-0 gap flagged in STATUS / brief).

> **Dispatcher:** add `case 'bitBoard': return <BitBoardBeat {...props} />` and
> `case 'weighing': return <WeighingBeat {...props} />` to `src/lesson/beats/index.tsx`.
> **Engine cross-check:** add a `bitBoard` block and a `weighing` block to `validate-fixtures.ts §3`
> exactly like the existing `chainBoard` (§3c) / `stoppingBoard` (§3d) / gameTheory (§3e) blocks.

---

## Build decomposition (for Dept 3)

| beat | frozen engine fn | renderer component | fixture fields used |
|------|------------------|--------------------|---------------------|
| `l1-recall` | (none — static pairs) | `RetrievalGridBeat` (reuse) | `interaction.pairs[]`, `feedback` |
| `l1-bet` | (none) | `PredictionBeat` (reuse) | `interaction.options[]`, `feedback.byOption` |
| `l1-primer` | (none) | `PrimerBeat` (reuse) | `interaction.{variant:'custom',body,title,collapsible}` |
| `l1-win` | (answer string) | `AnswerEntryBeat` (reuse) | `interaction.fields[{id,label,accept,suffix}]` |
| `l1-explore` | `toBinary`,`powersOfTwo` | **`BitBoardBeat.tsx`** (NEW) `register` | `interaction.{display:'register',bits,value,interactive,headline}` |
| `l1-model` | `toBinary` | **`BitBoardBeat.tsx`** `register` | `interaction.{display:'register',bits,value,headline}`, `interviewNote` |
| `l1-apply` | `toBinary(100n)="1100100"` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `feedback` |
| `l1-transfer` | `toBinary(43n)="101011"` | `AnswerEntryBeat` (reuse) | `interaction.fields`, `track:'B'`, `required:false` |
| `l1-prove` | `toBinary(1000n)="1111101000"` | `MasteryChallengeBeat` (reuse) | `interaction.{scenario,fields}`, `required:true` |
| `l1-recap` | (none) | `RecapBeat` (reuse) | `interaction.{type:'recap'}` |

Engine goldens (Dept 3, `binary.test.ts`): `toBinary(7n)`→`"111"`, `powersOfTwo(7n)`→`[1,2,4]`,
`toBinary(100n)`→`"1100100"`, `toBinary(43n)`→`"101011"`, `toBinary(1000n)`→`"1111101000"`,
`powersOfTwo(1000n)`→`[8,32,64,128,256,512]`.

---

## Definition-of-Ready checklist

| beat | verified+sourced problem | direct-manipulation mechanic | instant feedback + 3-level hints | a11y (44px / reduced-motion / aria-live) |
|------|:---:|:---:|:---:|:---:|
| `l1-recall` | ✓ combinatorics-1 (2ⁿ) | ✓ tap-match grid | ✓ ladder | ✓ |
| `l1-bet` | ✓ S1 gold rod | ✓ chip pick | ✓ byOption | ✓ |
| `l1-primer` | ✓ (JIT, ungraded) | ✓ tap-expand | n/a (ungraded) | ✓ |
| `l1-win` | ✓ S1 (largest=4) | ✓ type-in | ✓ ladder | ✓ |
| `l1-explore` | ✓ GB6 representation | ✓ toggle bits → live value | ✓ live + hints | ✓ |
| `l1-model` | ✓ GB6 uniqueness | ✓ toggle → delta | ✓ live | ✓ |
| `l1-apply` | ✓ S17 (100) | ✓ type-in | ✓ ladder | ✓ |
| `l1-transfer` | ✓ derived 43 | ✓ type-in | ✓ ladder | ✓ |
| `l1-prove` | ✓ GB6 (1000) | ✓ type-in | ✓ ladder | ✓ |
| `l1-recap` | n/a | n/a | n/a | ✓ |

**DoR holds for all 10 beats.** Zero NEW interaction types beyond `bitBoard`. (Note: brief named
`sumTiles` for `l1-explore`; committed `sumTiles` is hardwired to PHT `autocorrelation(pattern)` and
cannot build arbitrary power-of-2 targets — routed to `bitBoard register` instead, no scope change.
See L6 spec for the same flag.)
