# Lesson Brief: Every Number Is Bits  (lesson-binary-information-1)

## Hook  (the bet)
"You owe a worker **1 gram of gold a day for 7 days**, but you may make only a couple of cuts in your
7-gram bar. How few cuts do you need — 6 (one a day)? 3? Surely you must hand over a fresh piece each
morning…" The instinct is "one cut per payment." But **2 cuts** suffice: pieces of **1, 2, 4** grams.
Day 1 give the 1; day 2 take it back and give the 2; day 3 give the 1 again (now 1+2=3); day 4 swap
both for the 4; … every total 1–7 is a *subset* of {1, 2, 4}. The bet ("I need a piece per day")
collapses into the lesson's engine: **every number is a unique sum of distinct powers of 2** — so a
few powers of two name *everything* up to their sum.

## Core promise (one idea)
Any non-negative integer is a **unique sum of distinct powers of 2**: `1000 = 512+256+128+64+32+8`.
Writing which powers are "in" (1) or "out" (0) is its **binary label** — `1000 = 1111101000₂`. Numbers
*are* bits.

## Display fields
- **glyphKey:** `2ⁿ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (corpus): how many distinct H/T strings of length n? (n = 1, 2, 3, 10) | **2, 4, 8, 1024** | `lesson-combinatorics-1` (l1-recall/l1-bet: "n flips → 2ⁿ strings", 2¹⁰=1024) | ☐ engine ☑ source |
| Gold rod of 7 units, pay +1/day for 7 days; fewest **cuts** and the piece sizes? | **2 cuts → pieces 1, 2, 4** (every daily total 1–7 is a subset sum) | GeeksforGeeks "Pay an employee using a gold rod of 7 units" (S1) | ☐ engine ☑ source |
| Write **1000** in binary (which powers of 2 sum to it?) | `1111101000₂` = 2⁹+2⁸+2⁷+2⁶+2⁵+2³ = 512+256+128+64+32+8 | Green Book §7.2 p.92 (poisoned-wine: "1000 = … `1111101000`") | ☐ engine ☑ source |
| Write **100** in binary | `1100100₂` = 64+32+4 | S17 (drill fact; corroborated) | ☐ engine ☑ source |
| **held-out transfer:** write **43** in binary (which powers sum to it?) | `101011₂` = 32+8+2+1 | derived from GB §7.2 representation method (same subset-of-powers method, fresh N) | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts`: `toBinary(1000n)="1111101000"`,
> `powersOfTwo(1000n)=[8,32,64,128,256,512]`, `toBinary(100n)="1100100"`, `toBinary(43n)="101011"`,
> `powersOfTwo(7n)=[1,2,4]`. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l1-recall` | Retrieval opener (`retrievalGrid`): recall **combinatorics-1** "n flips → 2ⁿ strings", then pivot: those 2ⁿ strings are the 2ⁿ *numbers* n bits can name | a length-n bit string ↔ a number in 0…2ⁿ−1 | "binary strings are just for counting, not naming numbers" | yes (light) | both |
| 2 | `l1-bet` | The bet (`prediction`, byOption): the gold-rod puzzle | the answer is **2 cuts**, set by powers of two — not 1 cut/day | "I must hand over a new piece each day" / "6 cuts" | no | both |
| 3 | `l1-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "a bit is a yes/no — is this power of 2 *in* the sum?" | place value: each bit position owns one power of 2 | "binary is a foreign code, not place value" | no | A |
| 4 | `l1-win` | Guaranteed early win (`answerEntry`, accept `4`): gold rod — what's the largest piece? | the pieces are **1, 2, 4** (powers of 2); largest = 4 | "pieces should be equal (1,1,1…)" — refuted | yes | both |
| 5 | `l1-explore` | Explore (`sumTiles`): build a target N from power-of-2 tiles | drag chips {1,2,4,8,…}; running sum snaps to N; each power used **at most once** | "I can reuse a power / need non-powers" — refuted live | no | both |
| 6 | `l1-model` | Model (`bitBoard` display `register`): toggle bits, read the number | the 0/1 pattern IS the number; uniqueness of the representation | "several bit patterns give the same number" — refuted | no | both |
| 7 | `l1-apply` | Interleave check (`answerEntry`, accept `1100100`): write 100 in binary | go number → bits (subtract largest power ≤ N, repeat) | "binary of 100 is 'the digits 1-0-0'" — refuted | yes (check) | both |
| 8 | `l1-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `101011`): write **43** in binary | same subset-of-powers method, fresh N (43 = 32+8+2+1) | "binary needs a calculator / a different rule per number" | yes (B) | B |
| 9 | `l1-prove` | Mastery challenge (`masteryChallenge`, required, accept `1111101000`): write **1000** in binary | the full method on the GB headline number | "I'll get lost past a few bits" — refuted by the place-value algorithm | yes (required) | both |
| 10 | `l1-recap` | Recap: every number = unique sum of distinct powers of 2; that's its binary label | — | no | both |

> `interviewNote` lives on `l1-model`: "Interviewers love 'is x a power of 2?' / 'how many 1-bits?' —
> all of it rests on this: a number *is* its set of powers of two. Lesson 5 turns that into one-line tricks."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"One cut/payment — I need a fresh piece each day"** → `l1-bet`, `l1-win` → 3 pieces {1,2,4} cover all 7 totals by *giving and taking back*; only 2 cuts.
2. **"Pieces should be equal"** → `l1-win` → equal pieces (1,1,1,…) need 6 cuts; **powers of two** double the reach per cut.
3. **"I can reuse a power of two"** → `l1-explore` → each power appears **at most once** (that's what makes the label unique); reuse would just be the next power up.
4. **"Binary of 100 is the digits 1-0-0"** → `l1-apply` → binary is base-2 place value (64+32+4 = `1100100`), not the decimal digits.
5. **"Several bit patterns can equal the same number"** → `l1-model` → the representation is **unique**; toggling any bit changes the value by that exact power.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l1-bet` (prediction): ✓ "2 cuts (1,2,4)" → "Right — powers of two let you make every total by giving and taking back." · ✗ "6 cuts" → "Let's test it — you don't need a piece per day; you can take change back." · ✗ "3 cuts" → "Close in spirit, but 2 cuts already give 3 pieces {1,2,4} — and that's enough."
- `l1-win` (answerEntry, accept `4`): ✓ "Exactly — the pieces are the powers 1, 2, 4; the biggest is 4." · ✗ `hints[0]` → "Think powers of two that sum to 7: 1+2+4. The largest is 4."
- `l1-apply` (answerEntry, accept `1100100`): ✓ "Yes — 100 = 64+32+4 = `1100100`." · ✗ `hints[0]` → "Subtract the biggest power of 2 ≤ 100 (that's 64), then repeat: 100−64=36→32, 4→4."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** combinatorics-1 "2ⁿ strings" → `l1-recall` (graded `retrievalGrid` matching {1 flip→2, 2→4, 3→8, 10→1024}), then **pivot**: those strings are the numbers 0…2ⁿ−1. Wires Continuity-Report overlap #1 (reuse-as-recall).
- **guaranteed early win:** `l1-win` — gold rod largest piece **4** (`answerEntry`); a tiny concrete answer that refutes "equal pieces."
- **mastery challenge (required, before recap):** `l1-prove` — write **1000** in binary (`masteryChallenge`, accept `1111101000`); the GB headline number, full method.
- **held-out transfer (before mastery):** `l1-transfer` — write **43** (`answerEntry`, track:'B', required:false, accept `101011`); same subset-of-powers method, fresh surface, placed immediately before `l1-prove`.
- **spacing/interleaving:** 2ⁿ recalled here re-surfaces in L3 (2ᵏ tests) and L5 (shift = ×2); `sumTiles` reuse interleaves the PHT/overlap Σ2^L motif (Continuity overlap "powers of two recur").
- **gate/DoR notes:** `l1-recall` = `retrievalGrid` (first graded beat); `l1-primer` satisfies ≥1 primer; `l1-bet` uses byOption; one `interviewNote` (`l1-model`); `l1-prove` = required `masteryChallenge` immediately before `l1-recap`. Register `lesson-binary-information-1` in `GATED` + `MASTERY_LESSONS`; engine goldens above (Dept 3).
