# Lesson Brief: The Scale Speaks Base-3  (lesson-binary-information-4)

## Hook  (the bet)
"Remember the counterfeit-coin teaser — **3 bags, a coin could be off by −1, 0, or +1** gram, giving
**3³ = 27** combinations? Now make it real: **12 coins, exactly one is fake — heavier OR lighter,
you don't know which** — and a balance scale. How few weighings pin down the fake *and* say whether
it's heavy or light? 6 (halving like the mice)? 4? It's **3**." A yes/no test gives one bit, but a
balance gives **three** answers — left-heavy, balanced, right-heavy. Each weighing is a **base-3
digit**, so it clears far more than a bit can. The bet ("weighing is just halving") breaks: the right
unit here is ⌈log₃·⌉, not ⌈log₂·⌉.

## Core promise (one idea)
A balance answers in **three** ways, so each weighing carries a base-3 digit (≈ log₂3 ≈ 1.58 bits).
Identifying one item among N needs about **⌈log₃N⌉** weighings — and weights chosen as **powers of 3**
({1,3,9,27}) measure every mass via balanced ternary (digits −1/0/+1).

## Display fields
- **glyphKey:** `⚖`
- **vizKey:** `dice`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (corpus): 3 bags × 3 weight-states each → how many combos? | **27** ( 3³ ) | `lesson-combinatorics-1` (l1-multadd counterfeit-coin example) | ☐ engine ☑ source |
| 12 coins, one fake (heavier **or** lighter, unknown); find it & say heavy/light. Min weighings? | **3** ( 3³=27 ≥ 2·12+1=25; GB bound (3ⁿ−3)/2 ⇒ n=3 covers 12 ) | **Green Book Ch.2 p.4–5 "Defective ball"** ("12 balls … heavier OR lighter … 3 measurements … (3ⁿ−3)/2 balls in n measurements"); Wikipedia "Balance puzzle", cut-the-knot (S9) | ☐ engine ☑ source |
| 9 coins, one heavier (direction **known**); min weighings? | **2** ( ⌈log₃9⌉=2 ) | Math Is Fun "Weighing 9 Balls" (S5); GB p.5 ("up to 3ⁿ balls" when direction known) | ☐ engine ☑ source |
| Bachet: fewest weights to measure every integer mass **1–40** on a two-pan balance (weights either pan)? | **{1, 3, 9, 27}** (powers of 3; balanced ternary) | arXiv 1010.5486 "Bachet's Problem"; MathWorld "Weighing" (S10) | ☐ engine ☑ source |
| **held-out transfer:** weights {1,3,9,27} — place to weigh a **22 g** object; which weights on which pan? | **9+27 = 36 on the far pan vs object+1+3+9? No** → 22 = 27 − 9 + 3 + 1: put **27** with the object's opposite pan, **9** on the object's pan, **3 and 1** opposite (balanced-ternary digits of 22) | same balanced-ternary method (S10), fresh mass | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts`: `weighingsForN(12,false)=3` (direction unknown,
> (3ⁿ−3)/2 ≥ N), `weighingsForN(9,true)=2` (direction known, 3ⁿ ≥ N), `bachetWeights(40)=[1,3,9,27]`,
> and balanced-ternary digits of 22 = `(1,0,−1,1)` over (27,9,3,1) → engine `balancedTernary(22)`.
> `weighing` `scale` headline = `weighingsForN(...)`; `ternary` headline = the balanced-ternary digit string.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l4-recall` | Retrieval opener (`retrievalGrid`): recall **combinatorics-1** counterfeit-coin 3³=27, then pivot to "the scale is the 3-way answer" | each weighing ↔ a base-3 digit (3 outcomes) | "weighing is binary (heavier/not)" | yes (light) | both |
| 2 | `l4-bet` | The bet (`prediction`, byOption): 12 coins, fake unknown direction — min weighings? | **3** | "halving ⇒ 6 weighings" / "4" | no | both |
| 3 | `l4-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "left / balanced / right = three answers" | a balance is a base-3 oracle, not base-2 | "a scale only says which is heavier" | no | A |
| 4 | `l4-win` | Guaranteed early win (`answerEntry`, accept `2`): 9 coins, one heavier (direction known) | ⌈log₃9⌉ = 2 (three groups of 3) | "9 coins need 3–4 weighings" — refuted | yes | both |
| 5 | `l4-explore` | Explore (`weighing` display `scale`): load pans, read the 3-way tilt, split into thirds | each weighing partitions into 3; the tilt picks the third | "you should split in half" — refuted live | no | both |
| 6 | `l4-model` | Model (`weighing` display `scale`, headline = weighings): generalize — N items, 3 outcomes ⇒ ⌈log₃·⌉; unknown direction needs (3ⁿ−3)/2 | base-3 information; why "heavy-or-light" costs the extra slack | "base-3 is just base-2 with an extra option, no big deal" — refuted (it's ⌈log₃⌉) | no | both |
| 7 | `l4-apply` | Interleave check (`answerEntry`, accept `1,3,9,27` / `27`): Bachet — which weights cover 1–40? largest? | powers of 3 + balanced ternary (digits −1/0/+1, weights on either pan) | "you need a weight per gram / only powers of 2" — refuted | yes (check) | both |
| 8 | `l4-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `27-9+3+1` / `22`): weigh 22 g with {1,3,9,27} | same balanced-ternary method, fresh mass (22 = 27−9+3+1) | "you can only *add* weights" — refuted (you may put weights with the object) | yes (B) | B |
| 9 | `l4-prove` | Mastery challenge (`masteryChallenge`, required, accept `3`): the full GB defective-ball — 12 coins, fake unknown direction | the GB headline; 3 weighings, (3ⁿ−3)/2 bound | "unknown direction is impossible in 3" — refuted | yes (required) | both |
| 10 | `l4-recap` | Recap: a balance speaks base-3; ⌈log₃·⌉ weighings; powers of 3 measure every mass | — | no | both |

> `interviewNote` lives on `l4-model`: "The 12-coin and Bachet-weights puzzles are classic
> quant/brain-teaser questions. The unlock is recognizing the *alphabet* of the test — a balance has
> three letters, so think base-3, just as a yes/no test thinks base-2."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"Weighing is binary (heavier / not)"** → `l4-recall`, `l4-primer` → a balance has **three** outcomes (L/balance/R); that third answer is why it beats a yes/no test.
2. **"Halving ⇒ 6 weighings for 12 coins"** → `l4-bet` → split into **thirds**, not halves: ⌈log₃·⌉, so 3 weighings.
3. **"Split in half"** → `l4-explore` → splitting into 3 equal groups matches the 3-way answer and wastes nothing.
4. **"You need a weight per gram, or only powers of 2"** → `l4-apply` → **powers of 3** with weights allowed on *either* pan (balanced ternary, digits −1/0/+1) cover 1–40 with just {1,3,9,27}.
5. **"Unknown heavy-or-light can't be done in 3"** → `l4-prove` → it can: 3³=27 ≥ 2·12+1=25 outcomes; the GB (3ⁿ−3)/2 bound covers 12.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l4-bet` (prediction): ✓ "3" → "Right — a balance is base-3, so split into thirds: 3 weighings." · ✗ "6" → "Let's test it — you're halving like the mice; a scale gives three answers, so split in thirds." · ✗ "4" → "Let's test it — 3³=27 outcomes already exceed the 25 you must distinguish."
- `l4-win` (answerEntry, accept `2`): ✓ "Exactly — three groups of 3, ⌈log₃9⌉ = 2 weighings." · ✗ `hints[0]` → "Split 9 into 3 groups of 3; the tilt picks the group. That's one weighing per base-3 digit: 2."
- `l4-apply` (answerEntry, accept `1,3,9,27`): ✓ "Yes — powers of 3; weights on either pan give every mass 1–40 (1+3+9+27=40)." · ✗ `hints[0]` → "You may place weights *with* the object (subtract). That makes base-3: 1,3,9,27."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** combinatorics-1 counterfeit-coin 3³=27 → `l4-recall` (graded `retrievalGrid`), the "dedupe → promote" of Continuity-Report overlap #3 (the teaser becomes the real lesson).
- **guaranteed early win:** `l4-win` — 9 coins (heavier) → **2** weighings (`answerEntry`); refutes "split in half."
- **mastery challenge (required, before recap):** `l4-prove` — 12 coins, unknown direction → **3** weighings (`masteryChallenge`, accept `3`); the GB defective-ball headline.
- **held-out transfer (before mastery):** `l4-transfer` — weigh **22 g** with {1,3,9,27} (`answerEntry`, track:'B', required:false, accept `22`/`27-9+3+1`); same balanced-ternary method, fresh surface, immediately before `l4-prove`.
- **spacing/interleaving:** the **base-2 (L3 mice) vs base-3 (here)** confusable is the chapter's spine; `l4-recall` re-surfaces L1's powers-and-products world in a new base. L6 forces choosing between ⌈log₂⌉ and ⌈log₃⌉.
- **gate/DoR notes:** `l4-recall` = `retrievalGrid` (first graded); `l4-primer` = ≥1 primer; `l4-bet` byOption; one `interviewNote` (`l4-model`); `l4-prove` = required `masteryChallenge` before `l4-recap`. `weighing` headline cross-checked via `weighingsForN`/`balancedTernary`. Register lessonId in `GATED`/`MASTERY_LESSONS`.
