# Lesson Brief: The Binomial Theorem  (lesson-combinatorics-3)

## Hook  (the bet)
"Here's one row of Pascal's triangle: `1 4 6 4 1`. Add it up — and guess the next row's total
without building it." Learners reach for arithmetic and miss the pattern: the row sums are
`1, 2, 4, 8, 16, …` — **every row sums to `2ⁿ`** — the same powers-of-two they used for the
`Σ 2^(overlap)` wait-time shortcut last course. The deeper bet underneath: "are the coefficients
of `(a+b)ⁿ` random?" No — **they are exactly the `nCk` from L2.**

## Core promise (one idea)
The numbers in `(a+b)ⁿ = Σₖ C(n,k) aⁿ⁻ᵏ bᵏ` are the **combinations `nCk`** — so Pascal's triangle
*is* a table of `nCk`, each row sums to `2ⁿ` (set `a=b=1`), and it's symmetric because
`C(n,k) = C(n,n−k)`.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `(a+b)ⁿ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Coefficient of `ab` in `(a+b)²` (early win) | `2` (`= C(2,1)`; full row `1, 2, 1`) | Green Book p.33 §4.2 (Binomial theorem, stated) | ☑ engine ☑ source |
| Each cell of Pascal's triangle equals which count? | cell `(n,k) = C(n,k)` (e.g. row 4 `= 1,4,6,4,1`) | Green Book p.33 §4.2 (Combination property + Binomial theorem) | ☑ engine ☑ source |
| Sum of row `n` of Pascal's triangle | `2ⁿ` (row 4: `1+4+6+4+1 = 16 = 2⁴`) — the binomial theorem at `a=b=1`: `Σₖ C(n,k) = 2ⁿ` | Green Book p.33 §4.2 (Binomial theorem at `a=b=1`); recall bridge: `Σ 2^L` from `lesson-overlap-shortcut` | ☑ engine ☑ source |
| Symmetry of the coefficients | `C(n,k) = C(n,n−k)` (e.g. `C(5,2) = C(5,3) = 10`) | Green Book p.33 §4.2 (Combination property) | ☑ engine ☑ source |
| Why is `(1+√2)ⁿ + (1−√2)ⁿ` always an integer? (applied; the irrational `√2` terms cancel in pairs) | the odd-power `√2` terms cancel: `= 2·Σ_{k even} C(n,k) 2^{k/2}` ∈ ℤ; basis of the GB "100th digit of `(1+√2)ⁿ`" problem (digit `= 9`) | Green Book p.36–37 §4.2 ("Applying the binomial theorem for (x+y) … the 100th digit … must be 9") | ☑ engine (binomial coeffs/integer pairing) ☑ source (digit conclusion) |
| Last-two-digits of a cube via binomial expansion (mastery transfer): expand `(a+10b)³` | `a³ + 30a²b + 300ab² + 1000b³` (coeffs `1,3,3,1 = C(3,k)`); GB uses it to pin the cube's last digits | Green Book p.37 §4.2 "Cubic of integer" ("Applying the binomial theorem, we have x³ = (a+10b)³ = a³ + 30a²b + 300ab² + 1000b³") | ☑ engine ☑ source |

> Pascal cells, row sums (`2ⁿ`), symmetry, and the `(a+10b)³` coefficients are exact integers
> reproducible by `src/engine/combinatorics.ts` (`nCk`, Pascal-row builder with the `Σ row = 2ⁿ`
> and `C(n,k)=C(n,n−k)` invariants). The `(1+√2)ⁿ` *digit* conclusion is Green-Book-sourced; the
> engine independently reproduces the binomial coefficients and the integer-pairing structure
> behind it. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `l3-recall` | Retrieval opener: recall `Σ 2^L` powers-of-two from **lesson-overlap-shortcut** (+ `nCk` from L2) | `2⁰+2¹+2²+2³ = 15`; `2ⁿ` growth; `nCk` is a count | "powers of two were just a coin-wait trick" — refuted; they reappear as row sums | yes (light) | both |
| 2 | `l3-bet` | The bet (prediction hook): are `(a+b)ⁿ` coefficients structured? | row `1 4 6 4 1` sums to `16`; predict the next total | **"coefficients are random / you must multiply it all out"** | no | both |
| 3 | `l3-win` | Guaranteed early win: read one coefficient | coefficient of `ab` in `(a+b)²` is `2 = C(2,1)` | "`(a+b)² = a²+b²`" (freshman's dream) — first refutation | yes | both |
| 4 | `l3-explore` | Explore (direct manipulation): build Pascal's triangle and watch invariants | `pascalTriangle` tap-to-build: each cell `= C(n,k) =` sum of the two above; symmetry mirrors live; **row total `= 2ⁿ`** | "each row total is unpredictable" — refuted; it doubles every row | no | both |
| 5 | `l3-model` | Model: state the theorem and connect it to L2 | `(a+b)ⁿ = Σₖ C(n,k) aⁿ⁻ᵏ bᵏ`; set `a=b=1 ⇒ Σ C(n,k) = 2ⁿ`; the coefficients **are** `nCk` | "binomial coefficients ≠ combinations" — refuted (they're identical) | no | both |
| 6 | `l3-applied` | Interleave / applied: the binomial expansion makes structure appear | `(1+√2)ⁿ + (1−√2)ⁿ` ∈ ℤ — odd `√2` terms cancel in pairs (GB p.36) | **freshman's dream** again, deeper: cross terms don't vanish, they *pair off* | yes (check) | both |
| 7 | `l3-prove` | Prove / mastery challenge (required): expand to control digits | expand `(a+10b)³ = a³+30a²b+300ab²+1000b³`; use coeffs to reason about last digits (GB p.37) | "you can't get exact digits without the full number" — refuted by the expansion | yes | both |
| 8 | `l3-recap` | Recap: retrieval-first close + bridge to overlap | binomial theorem + `2ⁿ` row sum + symmetry; bridge: "counting *overlapping* sets needs subtraction → Inclusion–Exclusion (L4)" | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **Row sum `= n²` not `2ⁿ`** (powers-of-two miscount) → `l3-recall`, `l3-bet`, `l3-explore` → Each Pascal row *doubles* the last (1,2,4,8,16…`=2ⁿ`); set `a=b=1` to see `Σ C(n,k)=2ⁿ`.
2. **"Coefficients are random / must multiply it all out"** → `l3-bet`, `l3-model` → The coefficients *are* the `nCk` from L2 — Pascal's triangle is just a table of combinations.
3. **Freshman's dream `(a+b)²=a²+b²`** → `l3-win`, `l3-applied` → The cross term appears twice (`ab+ba`), so the `ab` coefficient is `2=C(2,1)`, not 0.
4. **Coefficients aren't symmetric / all 1** → `l3-explore`, `l3-prove` → `C(n,k)=C(n,n−k)` mirrors the row (1,3,3,1); inner coefficients exceed 1.
5. **"Cross terms vanish" in `(1±√2)ⁿ`** → `l3-applied` → Odd `√2` terms don't disappear — they *pair off* and cancel, leaving an integer.

**Per-option feedback** (✓ = `feedback.correct`; ✗ distractor notes → refutational `hints[0]` for `answerEntry`):
- `l3-bet` (prediction, "row 1 4 6 4 1 sums to 16; next row total?"): ✗ "25 (it's 5²)" → "That's n² thinking. Row totals double each step (1,2,4,8,16…) → next is 2⁵=32." · ✓ "32 (it doubles)" → "Yes — each row doubles: 16→32=2⁵. Setting a=b=1 makes every row sum 2ⁿ." · ✗ "Can't tell without building it" → "It's not random — every row sums to 2ⁿ, so 16 doubles to 32."
- `l3-win` (answerEntry, accept `2`): ✓ "Right — 2 = C(2,1); the cross term shows up twice, ab+ba." · ✗ `1` → "Freshman's dream — (a+b)²≠a²+b². The ab term appears twice: coefficient 2." · ✗ `0` → "The cross term doesn't vanish — expanding gives ab+ba → coefficient 2."
- `l3-applied` (check, "(1+√2)ⁿ+(1−√2)ⁿ an integer?", accept `yes`): ✓ "Right — the odd-power √2 terms pair off and cancel, leaving twice the even terms: an integer." · ✗ "No / irrational" → "The √2 terms cancel in the (+) and (−) pairs → the sum is a whole number."
- `l3-prove` (mastery, expand `(a+10b)³`; coefficient of `a²b`, accept `30`): ✓ "Exactly — 30; row 3 is 1,3,3,1 and the b carries a 10: 3·a²·(10b)=30a²b." · ✗ `3` → "C(3,1)=3 is the coefficient, but the b is 10b → 3·a²·10b = 30a²b." · ✗ `1` → "Coefficients aren't all 1 — row 3 is 1,3,3,1 → the a²b term is 3 (times the 10)."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** the `Σ2^L` powers-of-two wait-time shortcut from `lesson-overlap-shortcut` (+ `nCk` from L2) → `l3-recall` (graded `retrievalGrid`: `2⁰+2¹+2²+2³=15`, `2ⁿ` growth, "`nCk` is a count"; then reveal a Pascal row *also* sums to `2ⁿ` — the strongest cross-course bridge, closing the L1→L3 `2ⁿ` loop).
- **guaranteed early win:** `l3-win` — read one coefficient: `ab` in `(a+b)²` is `2 = C(2,1)`; a single small value, visible in the tiny expansion, and the first refutation of the freshman's dream.
- **mastery challenge (required, before recap):** `l3-prove` — expand `(a+10b)³ = a³+30a²b+300ab²+1000b³` (coeffs `1,3,3,1 = C(3,k)`, GB p.37); certifies binomial coefficients **are** the `nCk` and the expansion controls structure.
- **spacing/interleaving:** `2ⁿ` re-surfaces `l3-recall` → `l3-explore` (row total `=2ⁿ`) → `l3-model` (`a=b=1 ⇒ ΣC(n,k)=2ⁿ`), closing the ~2-lesson loop from L1; `nCk` re-surfaces as Pascal cells; `l3-applied` interleaves the **freshman's-dream** misconception deeper (`(1+√2)ⁿ+(1−√2)ⁿ∈ℤ`). *(L3's interleaving is spaced `2ⁿ` + the recurring freshman's-dream refutation, not an unlabeled type-pair like L1/L2/L4.)*
- **mastery signal:** passing `l3-prove` certifies deploying the theorem with `nCk` coefficients on a novel binomial and reasoning *from* the coefficients. `computeMastered` keys on {`l3-recall`,`l3-win`,`l3-applied`,`l3-prove`}.
- **graded? per beat:** `l3-recall:yes(light)`, `l3-bet:no`, `l3-win:yes`, `l3-explore:no`, `l3-model:no`, `l3-applied:yes(check)`, `l3-prove:yes(required)`, `l3-recap:no`.
- **gate/DoR notes (validate-fixtures + Dept 2/3 handoff):** `l3-recall` must be interaction type `retrievalGrid` (first graded beat = retrieval opener); `l3-prove` must be `masteryChallenge` + `required`, immediately before `l3-recap` (leave `beat.pattern` unset → answer verified by `src/engine/combinatorics.ts`); this lesson needs **≥1 `primer` (e.g. "what an exponent / `Σ` is") + ≥1 Track-A scaffold + ≥1 `interviewNote`** (Dept 2); register `lesson-combinatorics-1…4` in `MASTERY_LESSONS` + `GATED` in `scripts/validate-fixtures.ts` (Dept 3).
