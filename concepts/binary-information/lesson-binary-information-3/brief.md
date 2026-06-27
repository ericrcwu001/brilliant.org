# Lesson Brief: Group Testing (Poisoned Wine)  (lesson-binary-information-3)

## Hook  (the bet)
"**1000 bottles** of wine, exactly **one poisoned**. The poison kills in ~18 hours and you have a
party in 20. You've got **10 lab mice** — and a test takes the full 18 hours, so you get **one round**.
How many bottles can 10 mice clear — 10? 100? Can you even do all 1000?" One mouse per bottle would
need 1000 mice; testing in sequence needs days. The bet ("one tester per item, or test in rounds")
misses it: **10 mice clear 1024 bottles in a single round.** Label each bottle with a 10-bit binary
number; mouse *i* sips from every bottle whose bit *i* is 1; the dead/alive pattern across the 10 mice
*is* the poisoned bottle's number. Each mouse answers **one bit, in parallel** — Lesson 2's halving
questions, asked all at once.

## Core promise (one idea)
Run the ⌈log₂N⌉ yes/no tests **in parallel**: give each item a binary label, assign tester *i* to bit
*i*, and read the result pattern as a number. **k testers identify the culprit among 2ᵏ items** in one
round.

## Display fields
- **glyphKey:** `🐭`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (in-concept): k bits distinguish how many items? (k = 1,2,3,10) | **2, 4, 8, 1024** | this concept L1/L2 (2ᵏ; `bitsNeeded`) | ☐ engine ☑ source |
| **Poisoned wine:** 1000 bottles, 1 poisoned, 10 mice, one 18-hour round — find it? | **Yes** — label 1–1000 in 10-bit binary, mouse *i* drinks bottles with bit *i*=1; dead/alive pattern = bottle number (10 mice cover 2¹⁰=1024) | **Green Book §7.2 p.92** ("poisonous wine … 10 mice … `1111101000` … binary search idea still applies"); Brainstellar #31 (S8) | ☐ engine ☑ source |
| 9 balls, one heavier; identify with a balance used **twice** (sequential halving-by-thirds) | **2** | Math Is Fun "Weighing 9 Balls" (S5) | ☐ engine ☑ source |
| 8 balls, one heavier; fewest balance weighings | **2** ( ⌈log₃8⌉=2 ) | suresolv (S6) | ☐ engine ☑ source |
| **held-out transfer:** you have **only 600 bottles** to test, 1 poisoned; minimum mice for one round? | **10** ( smallest k with 2ᵏ ≥ 600; 2⁹=512<600≤1024=2¹⁰ ) | same 2ᵏ≥N group-testing method, fresh N | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts`: the poisoned bottle's index = `fromBinary(pattern)`;
> mice needed = `bitsNeeded(1000)=10`, `bitsNeeded(600)=10`; bottle 1000's label `toBinary(1000)="1111101000"`.
> `bitBoard` `groupTest` headline = the recovered index (e.g. pattern `0010110000` → `fromBinary`=176).
> The 8/9-ball items are ⌈log₃·⌉ (a *base-3* preview of L4); `weighingsForN(9,true)=2`.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l3-recall` | Retrieval opener (`retrievalGrid`): recall **L1/L2** "k bits ↔ 2ᵏ items" (interleaved self-recall) | the 2ᵏ capacity, ready to apply to testers | "the L2 bound only worked for sequential questions" | yes (light) | both |
| 2 | `l3-bet` | The bet (`prediction`, byOption): 10 mice, 1000 bottles, one round | **all 1000** (10 mice → 1024) | "one mouse per bottle" / "10 mice ⇒ 10 bottles" | no | both |
| 3 | `l3-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "a mouse = a bit, run in parallel" | each mouse reports the bit "did the poison have a 1 here?" | "tests must be sequential" | no | A |
| 4 | `l3-win` | Guaranteed early win (`answerEntry`, accept `4`): how many bottles can **2 mice** clear? | 2² = 4 (label 00,01,10,11) | "2 mice ⇒ 2 bottles" — refuted | yes | both |
| 5 | `l3-explore` | Explore (`bitBoard` display `groupTest`): assign mice to bits, poison a bottle, read the survivors | the dead/alive pattern is the bottle's binary number; recover the index | "you can't tell which bottle from a pattern" — refuted live | no | both |
| 6 | `l3-model` | Model (`bitBoard` display `groupTest`, headline = index): generalize — k mice → 2ᵏ bottles, one round | parallel binary labeling = ⌈log₂N⌉ tests at once | "more bottles need more *rounds*" — refuted (one round) | no | both |
| 7 | `l3-apply` | Interleave check (`answerEntry`, accept `2`): 9 balls one heavier, fewest **weighings**? | a balance gives 3-way info → ⌈log₃9⌉=2 (a base-3 *teaser* for L4) | "weighing is the same as the binary test" — gently flagged | yes (check) | both |
| 8 | `l3-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `10`): 600 bottles, min mice? | same 2ᵏ≥N method, fresh N (2⁹=512<600) | "600 is between, so 9.x → round to 9" — refuted (need 10) | yes (B) | B |
| 9 | `l3-prove` | Mastery challenge (`masteryChallenge`, required, accept `10`): the full poisoned-wine — min mice for 1000? | the GB headline; 2¹⁰=1024≥1000 → 10 | "you need close to 1000 mice" — refuted | yes (required) | both |
| 10 | `l3-recap` | Recap: parallel binary labeling clears 2ᵏ items with k testers in one round | — | no | both |

> `interviewNote` lives on `l3-model`: "The poisoned-wine / lab-rats problem is a quant-interview
> staple — the trick is always 'label in binary, one tester per bit.' Lesson 4 shows what changes when
> the test has *three* outcomes."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"One mouse per bottle"** → `l3-bet` → that's 1000 mice; binary labeling makes each mouse cover *half* the bottles, so 10 suffice.
2. **"k mice ⇒ k bottles"** → `l3-win`, `l3-bet` → k mice ⇒ **2ᵏ** bottles (each mouse adds a bit, doubling capacity).
3. **"Tests must be sequential / need multiple rounds"** → `l3-primer`, `l3-model` → all mice drink at once; the *pattern* of deaths is read in one 18-hour round.
4. **"You can't recover the bottle from a death pattern"** → `l3-explore` → the pattern is literally the bottle's binary index — read it off.
5. **"A weighing is just another binary test"** → `l3-apply` → a balance has **three** outcomes (a base-3 digit), so it clears more per test — the bridge to L4.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l3-bet` (prediction): ✓ "All 1000" → "Right — 10 mice label 1024 bottles; the death pattern names the culprit." · ✗ "10 bottles" → "Let's test it — each mouse covers half the bottles, not one." · ✗ "100 bottles" → "Let's test it — capacity doubles per mouse: 10 mice reach 1024."
- `l3-win` (answerEntry, accept `4`): ✓ "Exactly — 2 mice → labels 00,01,10,11 → 4 bottles." · ✗ `hints[0]` → "Each mouse is a bit. 2 bits make 2²=4 distinct labels."
- `l3-apply` (answerEntry, accept `2`): ✓ "Yes — a balance splits into thirds, so 9 balls take ⌈log₃9⌉=2 weighings." · ✗ `hints[0]` → "A balance has three outcomes, so split into 3 groups of 3: 2 weighings."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** in-concept L1/L2 "2ᵏ items per k bits" → `l3-recall` (graded `retrievalGrid`), the spaced re-surfacing of 2ⁿ (Continuity-Report "powers of two recur") applied to parallel testers.
- **guaranteed early win:** `l3-win` — 2 mice → **4** bottles (`answerEntry`); refutes "k mice ⇒ k bottles."
- **mastery challenge (required, before recap):** `l3-prove` — 1000 bottles → **10** mice (`masteryChallenge`, accept `10`); the GB headline.
- **held-out transfer (before mastery):** `l3-transfer` — 600 bottles → **10** mice (`answerEntry`, track:'B', required:false, accept `10`); same 2ᵏ≥N method, fresh N, immediately before `l3-prove`.
- **spacing/interleaving:** `l3-apply` (9 balls → 2 weighings) is the **base-2 vs base-3** interleave that *seeds* L4 (Continuity confusable "bits vs weighings"); 2ᵏ recurs from L1/L2.
- **gate/DoR notes:** `l3-recall` = `retrievalGrid` (first graded); `l3-primer` = ≥1 primer; `l3-bet` byOption; one `interviewNote` (`l3-model`); `l3-prove` = required `masteryChallenge` before `l3-recap`. `bitBoard` `groupTest` headline must equal `fromBinary(pattern)` (engine cross-check). Register lessonId in `GATED`/`MASTERY_LESSONS` (Dept 3).
