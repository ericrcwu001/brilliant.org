# Lesson Brief: Bit Tricks  (lesson-binary-information-5)

## Hook  (the bet)
"In a list, **every number appears twice except one** — `[4, 1, 2, 1, 2]`. Find the loner. You could
sort, or hash-count… but there's a one-pass, no-extra-memory trick: **XOR everything together**. The
pairs cancel (x⊕x = 0) and the survivor is the answer — here, **4**." That's the bet ("you need a
data structure"): once you treat numbers as **bits**, whole operations happen *per-bit, in parallel*.
This lesson collects the Green Book's bitwise one-liners — they all come from the same place:
`x & (x−1)` clears the lowest set bit, `<<` doubles, and **XOR** is no-carry, per-bit parity (the
same nim-sum you met in Game Theory).

## Core promise (one idea)
Bitwise operators act on **all bits at once**: `x & (x−1)` removes the lowest 1-bit (⇒ power-of-2 test
and set-bit counting), `x << k` multiplies by 2ᵏ (⇒ `(x<<3)−x = 7x`), and **XOR** is carry-free
parity, so duplicates cancel.

## Display fields
- **glyphKey:** `&`
- **vizKey:** `coin`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (corpus): nim-sum (XOR) of heaps {3, 4, 5}? | **2** ( 3⊕4⊕5 = 2 ) | `lesson-game-theory-6` (Nim; `nimSum([3,4,5])=2`) | ☐ engine ☑ source |
| Determine whether an integer x is a power of 2 (one expression) | **`(x & (x−1)) == 0`** (with x>0); ex 16 → true, 5 → false | **Green Book §7.2 p.92** ("(x & (x−1)) == 0 … identify whether the integer x is a power of 2"); LeetCode 231 (S12) | ☐ engine ☑ source |
| Multiply x by 7 without `*` | **`(x << 3) − x`** ( 8x − x = 7x ) | **Green Book §7.2 p.92** ("(x << 3) − x") | ☐ engine ☑ source |
| Count the set bits (Hamming weight) of 11 | **3** ( 11 = `1011₂`; via repeated `n & (n−1)` ) | LeetCode 191 "Number of 1 Bits" (S13) | ☐ engine ☑ source |
| **Single Number:** every element twice except one — `[4,1,2,1,2]`; find it | **4** ( XOR of all = 4 ) | LeetCode 136 "Single Number" (S11) | ☐ engine ☑ source |
| **held-out transfer:** Single Number on `[7, 3, 5, 3, 7]` — find the loner | **5** ( XOR of all = 5 ) | same XOR-cancellation method (S11), fresh array | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts`: `isPowerOfTwo(16n)=true`, `isPowerOfTwo(5n)=false`,
> `multiplyByShift(x,3) − x = 7x` (e.g. x=6 → 42), `popcount(11n)=3`, `xorAll([4,1,2,1,2])=4`,
> `xorAll([7,3,5,3,7])=5`. `bitBoard` `register` headline = `toBinary` of the operated value
> (e.g. `x&(x-1)` of 12=`1100` → 8=`1000`).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l5-recall` | Retrieval opener (`retrievalGrid`): recall **game-theory-6** nim-sum (XOR of {3,4,5}=2), then pivot: XOR is bitwise parity | XOR = per-bit, no-carry addition | "XOR is a special game rule, not a bit operation" | yes (light) | both |
| 2 | `l5-bet` | The bet (`prediction`, byOption): the lone number in `[4,1,2,1,2]` | **4** via XOR-all (pairs cancel) | "need to sort / count occurrences" | no | both |
| 3 | `l5-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "bitwise = every bit, independently, at once" | AND/OR/XOR/shift act per column of bits | "bit ops work on the whole number as one blob" | no | A |
| 4 | `l5-win` | Guaranteed early win (`answerEntry`, accept `true`): is 16 a power of 2? use `x&(x-1)` | 16=`10000`, 15=`01111`, AND = 0 ⇒ true | "you must divide by 2 repeatedly" — refuted | yes | both |
| 5 | `l5-explore` | Explore (`bitBoard` display `register`): apply `x & (x−1)` and watch the lowest 1-bit vanish | clearing the lowest set bit; repeat → popcount | "AND with x−1 is random" — refuted live | no | both |
| 6 | `l5-model` | Model (`bitBoard` display `register`, headline = toBinary): shifts double; `(x<<3)−x = 7x` | `<<k` = ×2ᵏ; combine shifts to multiply | "shifting is unrelated to multiplying" — refuted | no | both |
| 7 | `l5-apply` | Interleave check (`answerEntry`, accept `3`): set-bit count of 11 | `popcount` via repeated `n & (n−1)` (11→3) | "count bits one position at a time only" — fine, but trick is faster | yes (check) | both |
| 8 | `l5-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `5`): lone number in `[7,3,5,3,7]` | same XOR-cancellation method, fresh array | "XOR only worked on the example numbers" — refuted | yes (B) | B |
| 9 | `l5-prove` | Mastery challenge (`masteryChallenge`, required, accept `4`): Single Number on `[4,1,2,1,2]` | XOR-all; duplicates cancel, survivor remains | "you must remember which you've seen" — refuted | yes (required) | both |
| 10 | `l5-recap` | Recap: bit ops act per-bit in parallel — `x&(x-1)`, `<<`, XOR | — | no | both |

> `interviewNote` lives on `l5-model`: "These exact one-liners — power-of-2 test, multiply-by-shift,
> XOR-to-find-the-loner — are direct Green Book §7.2 interview questions. They're fast *because*
> they operate on all bits at once."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"XOR is a game-specific rule"** → `l5-recall` → XOR is per-bit addition with no carry; nim-sum is just XOR on numbers.
2. **"Finding the loner needs sorting / a hash"** → `l5-bet`, `l5-prove` → XOR-all cancels every pair (x⊕x=0), leaving the unique one — one pass, no memory.
3. **"Bit ops treat the number as one blob"** → `l5-primer`, `l5-explore` → AND/OR/XOR/shift act on each bit column **independently and simultaneously**.
4. **"Power-of-2 needs repeated division"** → `l5-win` → `x & (x−1)` clears the lowest set bit; a power of 2 has exactly one, so the result is 0.
5. **"Shifting is unrelated to multiplication"** → `l5-model` → `x<<k` = x·2ᵏ, so `(x<<3)−x` = 8x−x = 7x.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l5-bet` (prediction): ✓ "4 (XOR them)" → "Right — pairs cancel under XOR; 4 survives." · ✗ "Sort first" → "Let's test it — XOR-all is one pass with no extra memory and no sorting." · ✗ "Count each" → "Let's test it — you don't need a tally; equal values XOR to 0."
- `l5-win` (answerEntry, accept `true`): ✓ "True — 16 & 15 = 0, so 16 is a power of 2." · ✗ `hints[0]` → "Compute x&(x−1): 16=`10000`, 15=`01111`; they share no 1-bit, so AND=0 ⇒ power of 2."
- `l5-apply` (answerEntry, accept `3`): ✓ "Yes — 11 = `1011`, three 1-bits." · ✗ `hints[0]` → "Repeatedly clear the lowest 1-bit with n & (n−1); the number of steps to reach 0 is the count: 3."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** game-theory-6 nim-sum (XOR) → `l5-recall` (graded `retrievalGrid` matching {nim-sum {3,4,5} → 2, XOR a⊕a → 0}), the "reuse-as-recall (interleave)" of Continuity-Report overlap #4 — GT *used* XOR; here we explain it bitwise.
- **guaranteed early win:** `l5-win` — is 16 a power of 2 → **true** via `x&(x-1)` (`answerEntry`); refutes "divide repeatedly."
- **mastery challenge (required, before recap):** `l5-prove` — Single Number `[4,1,2,1,2]` → **4** (`masteryChallenge`, accept `4`).
- **held-out transfer (before mastery):** `l5-transfer` — Single Number `[7,3,5,3,7]` → **5** (`answerEntry`, track:'B', required:false, accept `5`); same XOR method, fresh array, immediately before `l5-prove`.
- **spacing/interleaving:** internal **`x&(x-1)` AND-mask vs XOR-parity** confusable surfaced across `l5-explore`/`l5-model`; XOR re-surfaces in L6 (missing-number); shift `<<`=×2 re-surfaces the L1 powers-of-two motif.
- **gate/DoR notes:** `l5-recall` = `retrievalGrid` (first graded); `l5-primer` = ≥1 primer; `l5-bet` byOption; one `interviewNote` (`l5-model`); `l5-prove` = required `masteryChallenge` before `l5-recap`. `bitBoard` `register` headline cross-checked vs `binary.ts` (isPowerOfTwo / popcount / xorAll / multiplyByShift). Register lessonId in `GATED`/`MASTERY_LESSONS`.
