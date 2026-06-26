# Lesson Brief: Linearity of Expectation  (lesson-expected-value-2)

## Hook  (the bet)
"There are **100 noodles** in a bowl. Blindfolded, you grab two loose ends at random and tie them,
again and again, until no ends are left. How many **loops** do you expect to end up with — about 50?
About 10? Just a handful?" The bet (most learners guess "lots — there are 100 noodles") sets up the
superpower: you will **never** track the tangle. Each tie is its own tiny bet on "did I just close a
loop?", and the magic of **linearity** — `E[X+Y] = E[X] + E[Y]`, true whether or not the pieces are
independent — lets you **add those tiny expectations one at a time**, even though every tie changes
what's left. The answer is a shockingly small `Σ_{k=1}^{100} 1/(2k−1) ≈ 3.28` loops.

## Core promise (one idea)
The expectation of a **sum is the sum of the expectations** — `E[X+Y] = E[X] + E[Y]`, **dependent or
not** — so you can value a hopelessly tangled bet by breaking it into easy pieces and adding.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `Σ`
- **vizKey:** `sum`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): a fair bet's expected net gain? (recall the martingale capstone, not re-derived) | `E[net] = 0` (a sum of fair bets is still fair) | shipped `lesson-overlap-shortcut` (fair-game martingale `E[net]=0`); GB p.47 §4.5 linearity | ☑ source (recall) |
| **The definition** (the model): expectation of a sum | `E[X+Y] = E[X] + E[Y]` — **"holds whether or not [the variables] are independent"** | Green Book p.47 §4.5 *Sum of random variables* | ☑ engine ☑ source |
| **Early win:** sum of two fair dice, via linearity (the "easy way" — same `7` you ground out by hand in L1) | `E[X+Y] = 7/2 + 7/2 = 7` | Green Book p.62 (single die `7/2`) + p.47 §4.5 (linearity) | ☑ engine ☑ source |
| Interleave check: connecting noodles, **n = 2** (dependent summands — ties change the pool) | `E[loops] = 1 + 1/3 = 4/3` | Green Book p.47–48 §4.5 *Connecting noodles* (`E[f(2)] = 1/3 + 1`) | ☑ engine ☑ source |
| **Mastery (core mechanic):** connecting noodles, general `n` — and **n = 3** | `E[loops] = Σ_{k=1}^{n} 1/(2k−1)`; `n=3 ⇒ 1 + 1/3 + 1/5 = 23/15` (scales to the 100-noodle bet) | Green Book p.47–48 §4.5 (`E[f(n)] = 1 + 1/3 + 1/5 + ⋯ + 1/(2n−1)`) | ☑ engine ☑ source |
| Model example (ungraded teaser → fully justified in L3): cards turned to the **first ace** | `E = 1 + 48·(1/5) = 53/5 = 10.6` (the total decomposes into a **sum** `1 + Σ X_i`) | Green Book p.48 §4.5 *Card game / first ace* | ☑ engine ☑ source |

> Exact-rational, reproduced by `src/engine/expectation.ts` (`noodleLoops(n) = Σ 1/(2k−1)`,
> `expectedValue`): two-dice `7`, noodles `4/3` (n=2), `23/15` (n=3). Wave-0 goldens, hand-verified
> here. **The dependent-summands case (noodles) is the whole point of L2** — the ties are *not*
> independent, yet `E[X+Y]=E[X]+E[Y]` still holds. The first-ace `53/5` is shown here as a *linearity
> decomposition* only; **why** each piece `= 1/5` is the indicator argument owned by L3 (no graded
> re-teach). No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev2-recall` | Retrieval opener (`retrievalGrid`): recall the martingale **fair game `E[net]=0`** | a sum of fair bets is still fair ⇒ expectations of a sum **add** | "a long unlucky streak makes you 'due'" (gambler's-fallacy residue) | yes (light) | both |
| 2 | `ev2-bet` | The bet (`prediction`): 100 noodles tied at random — how many loops? | a tangled quantity is still a **sum of tiny bets** | **"100 noodles ⇒ ~lots of loops"** (intuition over-counts) | no | both |
| 3 | `ev2-win` | Guaranteed early win (`answerEntry`): two dice via linearity | `E[X+Y] = 3.5 + 3.5 = 7` — the L1 mastery answer, now in **one line** | **"you must rebuild the whole `{2…12}` pmf to average a sum"** — refuted | yes | both |
| 4 | `ev2-explore` | Explore (direct manipulation): tie noodle ends, watch loops form | each tie is a bet "did I close a loop?"; the running `E[loops]` climbs `1 → 4/3 → 23/15 …` | "every tie makes a new loop" — only the both-ends-of-one-noodle tie does | no | both |
| 5 | `ev2-model` | Model: formalize linearity + pre-empt the #1 error | `E[X+Y]=E[X]+E[Y]` **dependent or not** (GB p.47); first-ace decomposes as `1 + Σ X_i = 53/5` | **confusable pair: "sum of expectations" vs "expectation of a product"** — the sum needs no independence; a product does | no | both |
| 6 | `ev2-noodles` | Interleave check (`answerEntry`): noodles **n = 2** | dependent summands (ties shrink the pool) yet linearity holds ⇒ `E = 4/3` | **"can't add — the ties are dependent"** — refuted: linearity ignores dependence | yes (check) | both |
| 7 | `ev2-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): general noodles, `n=3` | `E[loops] = Σ_{k=1}^{n} 1/(2k−1)`; `n=3 ⇒ 23/15` — and it scales to the 100-noodle bet | **"more noodles ⇒ proportionally more loops"** — the harmonic-of-odds grows like `½ ln n` | yes (required) | both |
| 8 | `ev2-recap` | Recap: retrieval-first close | "break the tangle into a sum, add the easy pieces — dependence doesn't matter"; bridges to L3 (what makes each piece `1/5`?) | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"Linearity needs independence"** (THE big one) → `ev2-model`, `ev2-noodles`, `ev2-prove` → `E[X+Y]=E[X]+E[Y]` holds whether or not the summands are independent — the dependent noodle ties prove it.
2. **"The sum rule, like the product rule, needs independence"** → `ev2-model` → Only `E[XY]=E[X]E[Y]` requires independence; the sum rule never does.
3. **"You must build the joint/whole distribution first"** → `ev2-win`, `ev2-prove` → Linearity adds each part's expectation directly, skipping the joint pmf.
4. **"100 noodles ⇒ lots of loops"** → `ev2-bet` → Each tie rarely closes a loop; loops grow like `Σ1/(2k−1) ≈ ½ ln n` — a handful.
5. **"Every tie makes a new loop"** → `ev2-explore` → Only joining both ends of one piece closes a loop; most ties merely merge strands.
6. **"More noodles ⇒ proportionally more loops"** → `ev2-prove` → The harmonic-of-odds grows logarithmically.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `ev2-bet` (prediction): ✗ "About 50" → "Let's test it — that's near half the noodles; each tie rarely closes a loop, so loops stay few." · ✗ "About 10" → "Let's test it — closer, but still high; the tiny per-tie chances add to about three loops." · ✓ "Just a handful" → "Good instinct — let's prove it by adding each tie's small chance of closing a loop."
- `ev2-win` (answerEntry, accept `7`): ✗ `hints[0]` → "No need to rebuild the sum's pmf. Add each die's average: 3.5 + 3.5 = 7."
- `ev2-noodles` (check, accept `4/3`): ✗ `hints[0]` → "Dependence doesn't block linearity. Add each tie's loop-closing chance: 1 + 1/3 = 4/3."
- `ev2-prove` (mastery, accept `23/15`): ✗ `hints[0]` → "Loops don't scale with noodles. Add the odd-denominator chances: 1 + 1/3 + 1/5 = 23/15."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** fair-game `E[net]=0` (`lesson-overlap-shortcut` martingale) → `ev2-recall` (graded `retrievalGrid` matching {"a fair bet's expected net" → `0`}; a sum of fair bets is still fair ⇒ expectations of a sum **add** — GB p.47).
- **guaranteed early win:** `ev2-win` — two dice via linearity `E[X+Y]=7/2+7/2=7` (GB p.62 + p.47): the L1 mastery answer in one line; also the spaced re-surfacing of L1's hard-won `7` (1-lesson gap).
- **mastery challenge (required, before recap):** `ev2-prove` — general noodles `n=3`: `Σ_{k=1}^{n}1/(2k−1)=1+1/3+1/5=23/15` (GB p.47–48), scaling to the 100-noodle bet. Certifies linearity over **dependent** summands.
- **spacing/interleaving:** linearity introduced here is the spine spaced L2→L3 (count = Σ indicators) → L5 (full set = Σ geometric waits) → L6 (extremes via order-stat sums). The confusable pair **"expectation of a SUM (always adds) vs PRODUCT (needs independence)"** lands at `ev2-model`. `ev2-noodles` is the dependent-summands check (`n=2 → 4/3`). First-ace `53/5` shown as a linearity decomposition only (why each piece `=1/5` is owned by L3).
- **mastery signal:** first-try, zero-hint on `ev2-prove` certifies linearity ignores dependence and scales (harmonic-of-odds `~½ ln n`). `computeMastered` keys on {`ev2-recall`,`ev2-win`,`ev2-noodles`,`ev2-prove`}.
- **graded? per beat:** `ev2-recall:yes(light)`, `ev2-bet:no`, `ev2-win:yes`, `ev2-explore:no`, `ev2-model:no`, `ev2-noodles:yes(check)`, `ev2-prove:yes(required)`, `ev2-recap:no`.
- **gate/DoR notes:** `ev2-recall` = `retrievalGrid` (first graded); `ev2-prove` = `masteryChallenge` + `required` before `ev2-recap`, **`beat.pattern` unset** → verified by `src/engine/expectation.ts` (`noodleLoops`: `n=3→23/15`, `n=2→4/3`; two-dice `7`). Needs **≥1 `primer` + ≥1 Track-A scaffold + ≥1 `interviewNote` (SUM-vs-PRODUCT caveat / 100-noodle `≈3.28`)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + `GATED` (Dept 3).
