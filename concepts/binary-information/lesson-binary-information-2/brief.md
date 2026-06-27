# Lesson Brief: Bits as Information  (lesson-binary-information-2)

## Hook  (the bet)
"I'm thinking of a number from **1 to 1000**. You may ask only **yes/no** questions ('is it bigger
than 500?'). How many questions guarantee you find it — 500? 100? 32?" The pile of 1000 makes people
guess big. But the answer is a stark **10**. Each yes/no answer is **one bit**, and one bit can at
best *halve* the candidates: 1000 → 500 → 250 → … → 1 in **⌈log₂1000⌉ = 10** halvings. The bet ("lots
of possibilities ⇒ lots of questions") inverts Lesson 1: there, n bits *named* 2ⁿ numbers; here, to
tell apart N possibilities you must *spend* at least ⌈log₂N⌉ bits.

## Core promise (one idea)
One bit = one yes/no answer = one halving. To distinguish **N** possibilities you need **at least
⌈log₂N⌉ bits** — and no scheme beats it (pigeonhole: k bits give only 2ᵏ distinct answer-patterns, so
2ᵏ ≥ N is forced).

## Display fields
- **glyphKey:** `log₂`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Recall (corpus): N items into H holes — some hole must hold at least ___ ? | **⌈N/H⌉** (and N>H forces a collision) | `lesson-combinatorics-5` (pigeonhole; `pigeonholeMin`, `forcesCollision`) | ☐ engine ☑ source |
| Guess a number **1–100** with higher/lower questions; worst-case minimum? | **7** ( ⌈log₂100⌉, 2⁷=128≥100 ) | programmerinterview.com "Minimum guesses 1–100" (S2) | ☐ engine ☑ source |
| Guess a number **1–1000**; minimum questions? | **10** ( ⌈log₂1000⌉, 2¹⁰=1024 ) | Glassdoor (Meta); programmerinterview.com (S4) | ☐ engine ☑ source |
| Guess a number **1–1,000,000**; minimum questions? | **20** ( 2²⁰=1,048,576>10⁶ ) | Aaronson "Twenty Questions" (S3) | ☐ engine ☑ source |
| **held-out transfer:** guess a number **1–500**; minimum questions? | **9** ( 2⁸=256<500≤512=2⁹ ) | same ⌈log₂N⌉ method, fresh N | ☐ engine ☑ source |

> Engine-reproducible by `src/engine/binary.ts` `bitsNeeded(N)=⌈log₂N⌉` (exact, repeated doubling — no
> `Math.log`): `bitsNeeded(100)=7`, `bitsNeeded(1000)=10`, `bitsNeeded(1_000_000)=20`,
> `bitsNeeded(500)=9`. Pigeonhole recall reproduced by `combinatorics.ts` (`forcesCollision`).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l2-recall` | Retrieval opener (`retrievalGrid`): recall **combinatorics-5** pigeonhole (N items, H holes → ⌈N/H⌉ / N>H collision) | the pigeonhole "boxes" idea, ready to reuse as answer-patterns | "pigeonhole was only about socks/ants" | yes (light) | both |
| 2 | `l2-bet` | The bet (`prediction`, byOption): guess 1–1000 in how many yes/no? | the answer is **10**, not hundreds | "more possibilities ⇒ proportionally more questions" | no | both |
| 3 | `l2-primer` | JIT primer (`primer` variant `custom`, track:'A', required:false): "one bit halves the field" | each yes/no splits the candidates in two | "a question only rules out one item" | no | A |
| 4 | `l2-win` | Guaranteed early win (`answerEntry`, accept `7`): guess 1–100 | ⌈log₂100⌉ = 7 (2⁷=128≥100) | "100 needs ~50 questions" — refuted | yes | both |
| 5 | `l2-explore` | Explore (`bitBoard` display `questions`): play the halving game on 1–1000 | each answer fixes one bit; watch the range halve to a point in 10 steps | "halving is slower than this" — refuted live | no | both |
| 6 | `l2-model` | Model (`bitBoard` display `register` / `countingTree`): the **inverse** of L1 — k bits ↔ 2ᵏ outcomes | ⌈log₂N⌉ is L1's 2ⁿ run backwards; pigeonhole says 2ᵏ≥N is forced | "log₂ is just N/2" (linear) — refuted; it's the inverse of doubling | no | both |
| 7 | `l2-apply` | Interleave check (`answerEntry`, accept `20`): guess 1–1,000,000 | the bound scales by *doubling count*, not size: 20 bits | "a million needs way more than 20" — refuted | yes (check) | both |
| 8 | `l2-transfer` | **Held-out transfer** (`answerEntry`, track:'B', required:false, accept `9`): guess 1–500 | same ⌈log₂N⌉ method, fresh N (2⁸=256<500≤512) | "round 500 to 512 then it's 8" — refuted (it's the exponent, 9) | yes (B) | B |
| 9 | `l2-prove` | Mastery challenge (`masteryChallenge`, required, accept `10`): guess 1–1000 | the GB-scale headline; ⌈log₂1000⌉ = 10 | "1000 needs 1000 or 500 questions" — refuted | yes (required) | both |
| 10 | `l2-recap` | Recap: one bit = one halving; distinguishing N needs ≥⌈log₂N⌉ bits (a pigeonhole floor) | — | no | both |

> `interviewNote` lives on `l2-model`: "This ⌈log₂N⌉ floor is the 'information lower bound' interviewers
> probe with '20 questions' and 'find the fake coin' puzzles — no clever scheme beats counting answer-patterns."

## Misconceptions (Specialist)
**Inventory** (wrong model → fires at → refutation):
1. **"More possibilities ⇒ proportionally more questions" (linear)** → `l2-bet`, `l2-win` → questions grow with the *doubling count* (log), not the size: 1000 → only 10.
2. **"A question rules out just one item"** → `l2-primer`, `l2-explore` → a good yes/no *halves* the field (rules out ~half), so the field collapses geometrically.
3. **"log₂N is just N/2"** → `l2-model` → ⌈log₂N⌉ is the **inverse of 2ⁿ** (how many doublings reach N), not a single halving.
4. **"Round 500 up to 512, so 8 bits"** → `l2-transfer` → ⌈log₂500⌉ = 9: 2⁸=256 is too few, you need 2⁹=512 ≥ 500; the answer is the **exponent** 9, not the value.
5. **"Some clever scheme beats ⌈log₂N⌉"** → `l2-model` → impossible by pigeonhole: k bits produce only 2ᵏ distinct answer-patterns; if 2ᵏ<N two numbers share a pattern.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `l2-bet` (prediction): ✓ "10" → "Right — each yes/no halves 1000: 500,250,…,1 in 10 steps." · ✗ "500" → "Let's test it — you don't check one number at a time; you halve the whole range." · ✗ "100" → "Let's test it — even 100 is far too many; halving reaches 1 in 10."
- `l2-win` (answerEntry, accept `7`): ✓ "Exactly — 2⁷=128 ≥ 100, so 7 halvings suffice." · ✗ `hints[0]` → "Count doublings to pass 100: 2,4,…,128 — that's 7."
- `l2-apply` (answerEntry, accept `20`): ✓ "Yes — 2²⁰ = 1,048,576 > 1,000,000, so 20 questions." · ✗ `hints[0]` → "It's the exponent: how many doublings exceed a million? 2²⁰ does."

## Assessment + continuity (Designer + Cartographer)
- **retrieval opener:** combinatorics-5 pigeonhole → `l2-recall` (graded `retrievalGrid` matching {N>H → collision, N items/H holes → ⌈N/H⌉}), reused as the *proof* of the lower bound (2ᵏ answer-boxes). Wires Continuity-Report overlap #2 (reuse-as-recall, then invert).
- **guaranteed early win:** `l2-win` — 1–100 → **7** (`answerEntry`); small surprising answer refuting linear intuition.
- **mastery challenge (required, before recap):** `l2-prove` — 1–1000 → **10** (`masteryChallenge`, accept `10`).
- **held-out transfer (before mastery):** `l2-transfer` — 1–500 → **9** (`answerEntry`, track:'B', required:false, accept `9`); same ⌈log₂N⌉ method, fresh N, immediately before `l2-prove`.
- **spacing/interleaving:** the **2ⁿ-forward (L1) vs ⌈log₂N⌉-inverse (here)** confusable is surfaced explicitly at `l2-model` and again in L6; pigeonhole recurs as the floor's proof in L6.
- **gate/DoR notes:** `l2-recall` = `retrievalGrid` (first graded); `l2-primer` = ≥1 primer; `l2-bet` byOption; one `interviewNote` (`l2-model`); `l2-prove` = required `masteryChallenge` before `l2-recap`. Engine goldens above (Dept 3); register lessonId in `GATED`/`MASTERY_LESSONS`.
