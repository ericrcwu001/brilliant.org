# Lesson Brief: Order Statistics & Extremes  (lesson-expected-value-6)

## Hook  (the bet)
"**500 ants** stand at random spots on a 1-foot stick. Each marches left or right at 1 ft/min; when
two meet head-on they instantly reverse. How long until *every* ant has fallen off — minutes? hours?
does it even terminate cleanly?" The bet (the bouncing looks like chaos, so most guess "ages, and it's
a mess") collapses under one idea. When two ants collide and reverse, it's *identical* to them passing
through each other — just **swap their labels**. With collisions erased, each ant walks straight off,
and the last one off is simply the **farthest-traveling** of `n` random start points: the **maximum**
of `n` Uniform(0,1) draws. And `E[max] = n/(n+1)`, so for 500 ants the answer is a tidy
`500/501 ≈ 0.998` min — barely over a minute. This is the finale: order statistics turn "the biggest /
smallest of many" into a one-line expectation.

## Core promise (one idea)
For `n` IID Uniform(0,1) draws the extremes have clean expectations — `E[max] = n/(n+1)`,
`E[min] = 1/(n+1)` — and a **relabeling** trick collapses tangled "many movers" problems onto them.

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** `E[max]`
- **vizKey:** `raceLanes`

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| Retrieval (continuity): counting & **ordering** arrangements (recall, not re-derived) | ranking `n` items uses order/permutation counts (`n!`, `nPk`) | shipped `lesson-combinatorics-2` (permutations / ordering) | ☑ source (recall) |
| **The definition** (the model): extremes of `n` IID Uniform(0,1) | `E[max] = n/(n+1)`, `E[min] = 1/(n+1)` | Green Book p.50–51 §4.6 *Order Statistics — Expected value of max and min* | ☑ engine ☑ source |
| **Early win:** two IID Uniform(0,1) draws — expected larger (and smaller) | `E[max] = 2/3`, `E[min] = 1/3` | Green Book p.50–51 §4.6 (`n=2` case) | ☑ engine ☑ source |
| Interleave check (**order-stat `P` count→weight**): expected **minimum** of `n=4` IID Uniform(0,1) | `E[min] = 1/(n+1) = 1/5` | Green Book p.50–51 §4.6 (`E[min] = 1/(n+1)`) | ☑ engine ☑ source |
| **Mastery (core mechanic):** random ants — expected time for all 500 to fall off (relabel ⇒ max) | `E[time] = E[max of 500 U(0,1)] = n/(n+1) = 500/501` | Green Book p.52 §4.6 *Random ants* (relabel trick: collisions = passing through) + p.50–51 (`E[max]=n/(n+1)`) | ☑ engine ☑ source |

> Exact-rational, reproduced by `src/engine/expectation.ts` (`orderStatUniform(n) = { max: n/(n+1),
> min: 1/(n+1) }`): `2/3`, `1/3`, `1/5`, ants `500/501`. Wave-0 goldens, hand-verified here. The
> order-stat probabilities are produced by the **count→weight** tool (combinatorics interleave), and
> the relabel argument is the *finale's* payoff — a chaotic-looking system reduced to a single
> `E[max]`. No `⚠️ NEEDS-WEB-SOURCE` rows.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `ev6-recall` | Retrieval opener (`retrievalGrid`): recall combinatorics **counting / ordering** | ranking many items by position is the doorway to order statistics | "ordering is just for counting, not averaging" — it sets up `E[max]`/`E[min]` | yes (light) | both |
| 2 | `ev6-bet` | The bet (`prediction`): 500 colliding ants — time for all to fall off? | a chaotic-looking system can hide a clean answer | **"collisions make it long / intractable"** — relabeling erases them | no | both |
| 3 | `ev6-win` | Guaranteed early win (`answerEntry`): max & min of **2** Uniform(0,1) | `E[max] = 2/3`, `E[min] = 1/3` — symmetric around `1/2`, summing to `1` | **"E[max] = 1/2 (same as the average)"** — the max sits above center | yes | both |
| 4 | `ev6-explore` | Explore (`raceLanes`-style ants sim, NEW): watch ants march & bounce | toggle "swap labels on collision"; the bouncing picture becomes pass-through — last-off = farthest start | "a bounce changes who falls off when" — the *set* of fall-off times is identical | no | both |
| 5 | `ev6-model` | Model: formalize the extremes | `E[max]=n/(n+1)`, `E[min]=1/(n+1)` (GB p.50–51) from the order-stat cdf `F_max=xⁿ`, `F_min=1−(1−x)ⁿ` | **"E[max] keeps rising toward ∞ with n"** — it saturates toward `1` | no | both |
| 6 | `ev6-min` | Interleave check (`answerEntry`; **order-stat count→weight**): min of `n=4` | `E[min] = 1/(n+1) = 1/5` | **"min of 4 ≈ 1/4"** — it's `1/(n+1) = 1/5`, just below | yes (check) | both |
| 7 | `ev6-prove` | Mastery challenge (`masteryChallenge`, REQUIRED): the ants finale | relabel ⇒ last ant off = `max of n U(0,1)` ⇒ `E[time] = n/(n+1) = 500/501` | **"500 ants ⇒ ~500× longer"** — it's `≈ 1` min regardless of `n`; the max saturates at `1` | yes (required) | both |
| 8 | `ev6-recap` | Recap (concept finale): close the whole Expected Value arc | one move (list→weight→add) + two superpowers (linearity L2–L3–L5, conditioning L4) value bets you could never simulate; 1-line **variance** forward-teaser (spread → next concept) | — | no | both |

## Misconceptions (Specialist)

**Inventory** (wrong model → fires at → refutation):
1. **"`E[max]=1/2` (same as the average)"** → `ev6-win` → The max sits above center; `E[max]=n/(n+1)`, already `2/3` at n=2.
2. **"`E[max]=1` (the top of the range)"** → `ev6-model`, `ev6-prove` → It only approaches 1 as n grows; for finite n it's `n/(n+1)<1`.
3. **"`E[max]` rises without bound as n grows"** → `ev6-model` → It saturates toward 1 (values capped at 1).
4. **"min of n ≈ 1/n"** → `ev6-min` → It's `1/(n+1)`; for n=4 that's `1/5`, just below the `1/4` guess.
5. **"Colliding ants must be tracked individually"** → `ev6-bet`, `ev6-prove` → Relabeling makes a collision identical to passing through → reduces to a plain max.
6. **"Max and min are independent"** → `ev6-explore` → They're coupled (`max ≥ min`), so not independent — though their expectations still add.

**Per-option feedback** (✓ = `feedback.correct`; ✗ → refutational `hints[0]`):
- `ev6-bet` (prediction): ✓ "About 1 minute" → "Good instinct — let's prove it: relabeling collisions as pass-throughs turns this into the max of 500 positions." · ✗ "Many minutes" → "Let's test it — collisions look slow, but relabeling erases them; the last ant just walks straight off." · ✗ "Hours / intractable" → "Let's test it — the chaos is an illusion; swapping labels reveals a barely-over-a-minute answer."
- `ev6-win` (answerEntry, accept `2/3`): ✗ `hints[0]` → "The larger of two draws beats the average. E[max]=n/(n+1)=2/3, and E[min]=1/3."
- `ev6-min` (check, accept `1/5`): ✗ `hints[0]` → "The minimum sits a bit lower than 1/4. The clean formula gives E[min]=1/(n+1)=1/5."
- `ev6-prove` (mastery, accept `500/501`): ✗ `hints[0]` → "More ants don't mean more time. Relabeling gives the max: E=n/(n+1)=500/501, about one minute."

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** combinatorics **counting / ordering** — `n!`, `nPk` (`lesson-combinatorics-2`) → `ev6-recall` (graded `retrievalGrid` matching {"arrange `n` items" → `n!`, "ordered pick `k` of `n`" → `nPk`}; ranking many items by position is the doorway to order statistics). As the concept finale, its opener retrieves across the whole arc — the longest spacing gap.
- **guaranteed early win:** `ev6-win` — max & min of **2** Uniform(0,1): `E[max]=2/3`, `E[min]=1/3` (GB p.50–51), symmetric around `1/2`, summing to 1. Refutes "`E[max]=1/2`."
- **mastery challenge (required, before recap):** `ev6-prove` — the ants finale: relabel (collisions = passing through) ⇒ last ant off `= max of n U(0,1)` ⇒ `E[time]=n/(n+1)=500/501≈0.998` min (GB p.52 + p.50–51). Certifies the relabel trick + order-stat extreme.
- **spacing/interleaving:** `ev6-min` is the **order-stat `P` count→weight** tool-interleave (min of `n=4` `=1/(n+1)=1/5`; tool-interleave 3 of 3). Concept finale: linearity (L2→L3→L5) closes here as extremes via order-stat sums; conditioning (L4) is recapped; the L1 weighted-average defn recurs a final time. Closes with a 1-line **variance** forward-teaser (spread → next concept).
- **mastery signal:** first-try, zero-hint on `ev6-prove` certifies collapsing a chaotic "many movers" system onto `E[max]` (and that `E[max]→1` saturates, so 500 ants `≈1` min). `computeMastered` keys on {`ev6-recall`,`ev6-win`,`ev6-min`,`ev6-prove`}.
- **graded? per beat:** `ev6-recall:yes(light)`, `ev6-bet:no`, `ev6-win:yes`, `ev6-explore:no`, `ev6-model:no`, `ev6-min:yes(check)`, `ev6-prove:yes(required)`, `ev6-recap:no`.
- **gate/DoR notes:** `ev6-recall` = `retrievalGrid` (first graded); `ev6-prove` = `masteryChallenge` + `required` before `ev6-recap`, **`beat.pattern` unset** → verified by `src/engine/expectation.ts` (`orderStatUniform(500).max=500/501`; `E[max of 2]=2/3`, `E[min of 4]=1/5`). Needs **≥1 `primer` + ≥1 Track-A scaffold + ≥1 `interviewNote` (the relabel/pass-through trick; `E[max]` saturates at 1)** (Dept 2). Register `lesson-expected-value-1…6` in `MASTERY_LESSONS` + `GATED` (Dept 3).
