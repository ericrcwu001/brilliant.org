# Lesson Brief: Encoding the Answer  (lesson-binary-information-6)

## Hook  (the bet)
"An array holds the numbers **0 to n with exactly one missing** — `[3, 0, 1]` (so n=3, the full set
is {0,1,2,3}). Which number is gone? You could sum and subtract… but you've just learned a sharper
move: **XOR every index 0…n with every value** — the present numbers cancel, and the survivor is the
gap. Here it's **2**." This capstone is the bet that ties the concept together: every puzzle in this
concept was really one question — *how do I encode the unknown so each test or operation extracts a
full unit of information?* Binary labels (mice), base-3 digits (the scale), and XOR parity are three
encodings of the same idea, and **2ⁿ keeps reappearing** — in binary strings, Pascal's rows, and
pattern-overlap waits.

## Core promise (one idea)
Every problem here is "choose the right **encoding** and read the information off it": **binary**
(yes/no tests, ⌈log₂N⌉), **base-3** (a balance, ⌈log₃N⌉), or **XOR parity** (cancel duplicates). The
unit underneath them all is the bit, and doubling (2ⁿ) is its signature.

## Display fields
- **glyphKey:** `Σ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (mixed corpus): match scenario → tool — {1–1000 yes/no, 12 coins on a scale, loner in a list, 2ⁿ binary strings} | **{⌈log₂1000⌉=10, base-3 3 weighings, XOR-all, 2ⁿ}** | this concept L2/L4/L5 + `lesson-combinatorics-1` (2ⁿ) | ☐ engine ☑ source |
| **Missing Number:** `[3,0,1]` (numbers 0…n, one missing); find it | **2** ( XOR of indices 0..3 and values = 2 ) | LeetCode 268 "Missing Number" (S15) | ☐ engine ☑ source |
| Missing Number on `[9,6,4,2,3,5,7,0,1]` (0…9, one missing) | **8** | LeetCode 268 (S15) | ☐ engine ☑ source |
| Which encoding distinguishes more per test — a yes/no test or a balance? (for N=27) | **balance** — ⌈log₃27⌉=3 weighings vs ⌈log₂27⌉=5 yes/no tests | this concept L3 vs L4 (base-2 vs base-3) | ☐ engine ☑ source |
| **held-out transfer:** Missing Number on `[0,1,3,4]` (0…4, one missing); find it | **2** ( XOR of indices 0..4 and values = 2 ) | same XOR index-vs-value method (S15), fresh array | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts`: `missingNumber([3,0,1])=2` (= `xorAll(values) ⊕
> xorAll(0..n)`), `missingNumber([9,6,4,2,3,5,7,0,1])=8`, `missingNumber([0,1,3,4])=2`,
> `bitsNeeded(27)=5`, `weighingsForN(27,true)=3`. (`missingNumber` is `xorAll` over indices+values.)

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l6-recall` | Retrieval opener (`retrievalGrid`, mixed interleave): match each scenario to its encoding/tool (yes/no→⌈log₂⌉, scale→base-3, loner→XOR, strings→2ⁿ) | the three encodings are one family; pick by the test's alphabet | "each puzzle is its own unrelated trick" | yes (light) | both |
| 2 | `l6-bet` | The bet (`prediction`, byOption): the missing number in `[3,0,1]` | **2** via XOR(indices)⊕XOR(values) | "must sum and subtract / scan" | no | both |
| 3 | `l6-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "match the encoding to the test's alphabet (2 vs 3 answers)" | base-2 for yes/no, base-3 for a balance, XOR for pairing | "always use binary" | no | A |
| 4 | `l6-win` | Guaranteed early win (`answerEntry`, accept `2`): missing number in tiny `[0,1,3]` (0…3) | XOR indices+values → 2 | "the missing one is just the last index" — refuted | yes | both |
| 5 | `l6-explore` | Explore (`bitBoard` display `register`): XOR the indices and values column-by-column; the gap appears | per-bit cancellation reveals the missing value | "XOR of a whole list is unpredictable" — refuted live | no | both |
| 6 | `l6-model` | Model (interleave, `retrievalGrid` or `prediction`): which encoding distinguishes 27 items in fewer tests — yes/no or a scale? | base-3 (3 weighings) beats base-2 (5 tests) — the alphabet sets the rate | "more tests is always finer" — refuted | yes (check) | both |
| 7 | `l6-spaced` | Spaced re-surfacing (`sumTiles` or `retrievalGrid`): where does **2ⁿ** show up? (binary strings, Pascal rows, Σ2^L overlap waits) | 2ⁿ is the recurring signature of doubling/information across the corpus | "powers of two were just a binary thing" — refuted | no | both |
| 8 | `l6-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `2`): missing number in `[0,1,3,4]` (0…4) | same XOR index-vs-value method, fresh array | "the method changes with array length" — refuted | yes (B) | B |
| 9 | `l6-prove` | Mastery challenge (`masteryChallenge`, required, accept `8`): Missing Number on `[9,6,4,2,3,5,7,0,1]` | XOR-all synthesis on a 10-element array → 8 | "I can't track a long list" — refuted by cancellation | yes (required) | both |
| 10 | `l6-recap` | Recap: pick the encoding (binary / base-3 / XOR); the bit is the unit; 2ⁿ is its signature | — | no | both |

> `interviewNote` lives on `l6-model`: "Strong candidates name the *encoding* first — 'a balance is
> base-3, so think ⌈log₃⌉' or 'pairs cancel under XOR.' The information lower bound (⌈log_b N⌉) is the
> yardstick interviewers use to judge whether your scheme is optimal."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"Each puzzle is its own unrelated trick"** → `l6-recall` → all three are encodings of one question: how much information per test? Pick the base from the test's alphabet.
2. **"Missing number ⇒ sum and subtract / scan"** → `l6-bet`, `l6-prove` → XOR(indices)⊕XOR(values) cancels every present number; the survivor is the gap — overflow-free, one pass.
3. **"Always use binary"** → `l6-primer`, `l6-model` → a balance (3 answers) is base-3; using binary there wastes the third outcome.
4. **"More tests is always finer information"** → `l6-model` → it's the *alphabet* that sets the rate: base-3 needs fewer tests than base-2 for the same N.
5. **"Powers of two were just a binary thing"** → `l6-spaced` → 2ⁿ recurs as binary strings (combinatorics-1), Pascal-row sums (combinatorics-3), and Σ2^L overlap waits (overlap-shortcut) — the doubling signature is everywhere.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l6-bet` (prediction): ✓ "2 (XOR index⊕value)" → "Right — present numbers cancel; 2 is the gap." · ✗ "Sum then subtract" → "Works, but XOR avoids overflow and is the bit-level twin of L5's loner trick." · ✗ "Scan for it" → "Let's test it — XOR-all finds it in one pass with no comparison."
- `l6-win` (answerEntry, accept `2`): ✓ "Yes — XOR {0,1,2,3} with {0,1,3} leaves 2." · ✗ `hints[0]` → "XOR all indices 0..3 together, then XOR in every value; equal terms cancel, leaving the missing 2."
- `l6-model` (check — which encoding for 27?): ✓ "A balance — base-3 needs ⌈log₃27⌉=3 weighings vs 5 yes/no tests." · ✗ `hints[0]` → "Compare the alphabets: 3ⁿ grows faster than 2ⁿ, so base-3 needs fewer tests."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** mixed interleave across the whole concept + combinatorics-1 → `l6-recall` (graded `retrievalGrid` matching scenario → encoding), the L6 **interleaving** node (Continuity-Report "powers of two recur" + the base-2/base-3 confusable).
- **guaranteed early win:** `l6-win` — missing number in `[0,1,3]` → **2** (`answerEntry`); a tiny instance of the mastery method.
- **mastery challenge (required, before recap):** `l6-prove` — Missing Number `[9,6,4,2,3,5,7,0,1]` → **8** (`masteryChallenge`, accept `8`); XOR synthesis at scale.
- **held-out transfer (before mastery):** `l6-transfer` — Missing Number `[0,1,3,4]` → **2** (`answerEntry`, track:'B', required:false, accept `2`); same XOR index-vs-value method, fresh array, immediately before `l6-prove`.
- **spacing/interleaving:** `l6-spaced` is the dedicated spaced-review beat re-surfacing **2ⁿ** across combinatorics-1 (strings), combinatorics-3 (Pascal rows), and overlap-shortcut (Σ2^L) — closing every Continuity-Report spaced thread; `l6-model` interleaves the base-2 vs base-3 confusable one last time.
- **gate/DoR notes:** `l6-recall` = `retrievalGrid` (first graded); `l6-primer` = ≥1 primer; `l6-bet` byOption; one `interviewNote` (`l6-model`); `l6-prove` = required `masteryChallenge` before `l6-recap`. `bitBoard`/`sumTiles` headlines cross-checked vs `binary.ts` (`missingNumber`, `bitsNeeded`, `weighingsForN`). Register lessonId in `GATED`/`MASTERY_LESSONS`.
