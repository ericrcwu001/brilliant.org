# Lesson Brief: Conditional & Total Expectation  (lesson-expected-value-4)

## Hook  (the bet)
"Roll a die and you're paid its face value — but there's a catch. Roll a **{4, 5, 6}** and you bank
it *and must roll again*, adding the next payout on top; roll a **{1, 2, 3}** and the game ends. Since
half your rolls keep the money flowing, what's a single play worth — a little over `$3.50`? `$5`?"
The bet sets up the move that finishes the concept: **condition on the first step**. Split into cases,
average within each case, then weight by how likely each case is — `E[X] = Σ E[X|case]P(case)`. Here
the "keep rolling" case loops back to the *same game*, so the equation refers to itself —
`E[X] = ½·2 + ½·(5 + E[X])` — and solving gives a clean `E[X] = 7`. You met this exact move before:
PHT's `E[HH] = 6` came from `E = 1 + ½E₁ + ½E₀`.

## Core promise (one idea)
**Average the averages over the first step** — `E[X] = Σ E[X|case]P(case)` — and when a case restarts
the game, the equation refers to itself, so you *solve* for `E[X]`.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `E[X|Y]`
- **vizKey:** `twoNode`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): PHT — expected flips to see **HH** via first-step `E = 1 + ½E₁ + ½E₀` (recall, not re-derived) | `E[HH] = 6` | shipped `lesson-pattern-hitting-times` (first-step `E[HH]=6`) | ☑ source (recall) |
| **The definition** (the model): the law of total expectation | `E[X] = Σ E[X\|case]·P(case)` | Green Book p.47 §4.5 *Conditional expectation* ("Law of total expectation") | ☑ engine ☑ source |
| **Early win:** flip a coin — heads ⇒ roll a die and keep it, tails ⇒ get `$0`. Value? | `E = ½·(7/2) + ½·0 = 7/4` | Green Book p.47 §4.5 (total expectation) + p.62 (die `7/2`) | ☑ engine ☑ source |
| Interleave check (the first-step set-up): the dice game's two cases | `P({1,2,3}) = ½, E[face] = 2`; `P({4,5,6}) = ½, E[face] = 5` then re-roll (loops to `+E[X]`) | Green Book p.48 §4.5 *Dice game* | ☑ engine ☑ source |
| **Mastery (core mechanic):** the self-referential dice game | `E[X] = ½·2 + ½·(5 + E[X]) ⟹ E[X] = 7` | Green Book p.48 §4.5 *Dice game* ("by total expectation … `E[X] = ½·2 + ½·(5 + E[X]) ⟹ E[X] = 7`") | ☑ engine ☑ source |

> Exact-rational, reproduced by `src/engine/expectation.ts` (`totalExpectation(cases)`, with the
> self-referential dice game solved by reusing `solveLinearSystem` — the same util PHT's first-step
> equations use): coin-die `7/4`, dice game `7`. Wave-0 goldens, hand-verified here. **This is PHT's
> first-step recurrence, generalized** — recall, do not re-derive hitting times. L4 stays strictly on
> *averaging*; belief-updating is a different machine and is **forward-flagged to the future
> `concept/bayes-rule`**, not taught here. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev4-recall` | Retrieval opener (`retrievalGrid`): recall PHT **first-step `E[HH]=6`** | conditioning on the first flip **is** the law of total expectation | "the first-step trick was a one-off PHT gimmick" — it's the general law | yes (light) | both |
| 2 | `ev4-bet` | The bet (`prediction`): the re-rolling dice game — what's a play worth? | a self-restarting game still has a finite, computable value | **"infinite re-rolls ⇒ unbounded / huge value"** — the geometric decay caps it at `7` | no | both |
| 3 | `ev4-win` | Guaranteed early win (`answerEntry`): coin ⇒ die-or-nothing | `E = ½·3.5 + ½·0 = 7/4` — one clean two-case `Σ E[X\|case]P(case)` | **"average the two case-values: (3.5+0)/2"** — happens to match here, but only because `P=½`; sets the trap for unequal weights | yes | both |
| 4 | `ev4-explore` | Explore (`conditionalTree` / `caseBranch`, NEW): expand the one-step case tree | drag open each branch carrying `P(case)` and `E[X\|case]`; the root recombines them as `Σ E[X\|case]P(case)` | **"weight by the case *value*, not its probability"** — branches weight by `P(case)` | no | both |
| 5 | `ev4-model` | Model: formalize + bound the scope | law of total expectation (GB p.47); recall PHT first-step as instance #1; **forward-flag** belief-updating → future Bayes concept (a different machine) | "conditioning = updating beliefs (Bayes)" — refuted: here we *average*, not update | no | both |
| 6 | `ev4-firststep` | Interleave check (`answerEntry`): set up the self-referential branch | the `{4,5,6}` case re-rolls ⇒ its value is `5 + E[X]` (the game inside itself) | **"the re-roll case is worth just 5"** — it's `5 + E[X]`; the game continues | yes (check) | both |
| 7 | `ev4-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): solve the loop | `E[X] = ½·2 + ½·(5 + E[X]) ⟹ E[X] = 7` (solve the linear equation) | **"can't compute it — `E[X]` appears on both sides"** — that's the feature; isolate and solve | yes (required) | both |
| 8 | `ev4-recap` | Recap: retrieval-first close | "split → average within → weight by `P(case)`; if it loops, solve for it"; forward-flag Bayes | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"Average the case-values without weighting by `P(case)`"** → `ev4-win`, `ev4-explore` → Weight each case by its probability: `E[X]=Σ E[X|case]·P(case)`.
2. **"The re-roll case is worth just its face (5)"** → `ev4-firststep` → The game restarts → that case is worth `5+E[X]`.
3. **"Can't solve it — `E[X]` appears on both sides"** → `ev4-prove` → That self-reference is the trick: treat `E[X]` as the unknown and solve.
4. **"Infinite re-rolls ⇒ unbounded value"** → `ev4-bet` → Each continuation is geometrically rarer → converges to `$7`.
5. **"Conditioning = updating beliefs (Bayes)"** → `ev4-model` → Here we only *average* over cases; revising from evidence is Bayes (a different machine).
6. **"The first-step trick was a one-off PHT gimmick"** → `ev4-recall` → It's the general law of total expectation; PHT's `E[HH]=6` was its first instance.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `ev4-bet` (prediction): ✗ "A little over $3.50" → "Let's test it — re-rolling on 4–6 adds value beyond one roll, so it climbs past $3.50." · ✗ "About $5" → "Let's test it — warmer, but the re-roll bonus pushes higher. Condition on the first roll and solve." · ✓ "About $7" → "Good instinct — let's prove it by conditioning on the first roll and solving the self-referential equation." · ✗ "Unbounded" → "Let's test it — re-rolls get geometrically rarer, so the value converges to a finite number."
- `ev4-win` (answerEntry, accept `7/4`): ✗ `hints[0]` → "Heads pays the die only half the time. Weight by P(case): ½·3.5 + ½·0 = 7/4."
- `ev4-firststep` (check): ✗ `hints[0]` → "Rolling 4–6 banks 5 and restarts the game, so that case is worth 5 + E[X], not just 5."
- `ev4-prove` (mastery, accept `7`): ✗ `hints[0]` → "E[X] on both sides isn't a dead end; treat it as the unknown and solve: ½·2 + ½·(5+E[X]) = 7."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** PHT first-step `E[HH]=6` (`lesson-pattern-hitting-times`, `E=1+½E₁+½E₀`) → `ev4-recall` (graded `retrievalGrid` matching {"flips to see `HH`" → `6`}, then reveal conditioning on the first flip **was** the law of total expectation — GB p.47–48). Never re-derive hitting times.
- **guaranteed early win:** `ev4-win` — coin ⇒ die-or-nothing `E=½·(7/2)+½·0=7/4` (GB p.47 + p.62); one clean two-case `Σ E[X|case]P(case)`. Sets the "just average the case-values `(3.5+0)/2`" trap (matches only because `P=½`).
- **mastery challenge (required, before recap):** `ev4-prove` — the self-referential dice game `E[X]=½·2+½·(5+E[X]) ⟹ E[X]=7` (GB p.48), solved by isolating `E[X]`. Certifies "if a case restarts the game, the equation refers to itself → *solve* for it."
- **spacing/interleaving:** conditioning closes the loop from PHT — `ev4-recall` re-surfaces the first-step it generalizes (~3 lessons later). `ev4-firststep` sets up the self-referential branch (the `{4,5,6}` case is worth `5+E[X]`, not `5`). This is the one EV lesson whose interleave is **not** the count→weight tool (its pivot is the self-reference). Belief-updating is forward-flagged to the future `concept/bayes-rule` at `ev4-model`.
- **mastery signal:** first-try, zero-hint on `ev4-prove` certifies solving a self-referential expectation (the fixed point). `computeMastered` keys on {`ev4-recall`,`ev4-win`,`ev4-firststep`,`ev4-prove`}.
- **graded? per beat:** `ev4-recall:yes(light)`, `ev4-bet:no`, `ev4-win:yes`, `ev4-explore:no`, `ev4-model:no`, `ev4-firststep:yes(check)`, `ev4-prove:yes(required)`, `ev4-recap:no`.
- **gate/DoR notes:** `ev4-recall` = `retrievalGrid` (first graded); `ev4-prove` = `masteryChallenge` + `required` before `ev4-recap`, **`beat.pattern` unset (CRITICAL)** → even though `E=7` matches L1/L2, this is a total-expectation *fixed point*, NOT an H/T recurrence; unset keeps it off the `buildAutomaton` cross-check. Verified by `src/engine/expectation.ts` (`totalExpectation` via `solveLinearSystem` → `7`; coin-die `7/4`). Needs **≥1 `primer` + ≥1 Track-A scaffold + ≥1 `interviewNote` ("`E[X]` on both sides → isolate"; conditioning ≠ Bayes)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + `GATED` (Dept 3).
