# Concept Scorecard Summary — Markov Chains

**Catalog card** · **Markov Chains** (`course-markov-chains`) · domain **Probability** · accent **`ch3`** · status `live` · vizKey `fourNode`
> *"Where does a memoryless process settle?"*
> Chapters: ch1 The Memoryless Machine (L1–3) · ch2 Reaching States (L4–5) · ch3 The Long Run (L6–8) · ch4 Ranking & Synthesis (L9–10)

## ✅ Concept READY: 10/10 lessons + interview pack

Re-QA at `35342f6` (Dept-3 fixes for all 5 QA blockers + S1/S2 + the graded-path audit). I independently re-read the rewritten `src/lesson/beats/ChainBoardBeat.tsx` `check()` branches and the affected fixtures, re-ran `validate-fixtures` ("All fixtures valid.") and the new `ChainBoardBeat.interaction.test.tsx` (**77/77**), and confirmed the required-flag harmonization. **Every previously-red gate (5 interactivity / 6 no-leak) is now GREEN: every graded chainBoard beat requires real manipulation (initial `Check` disabled — no auto-pass) and no beat renders the value it grades or a value a later required/mastery beat grades.**

| # | lesson | title | verdict | gates |
|---|--------|-------|---------|-------|
| L1 | markov-chains-1 | The Markov Property | ✅ READY | 9/9 |
| L2 | markov-chains-2 | The Transition Matrix | ✅ READY | 9/9 — `spot-the-invalid` distinct targets; S1 `build-from-story` empty-cell build |
| L3 | markov-chains-3 | Multi-Step Transitions | ✅ READY | 9/9 — recap "next up" now → L4 |
| L4 | markov-chains-4 | Classifying States | ✅ READY | 9/9 — `transient-vs-recurrent` graded fraction input (N3 below) |
| L5 | markov-chains-5 | Hitting Times & Absorption | ✅ READY | 9/9 — required-flag harmonized |
| L6 | markov-chains-6 | The Stationary Distribution | ✅ READY | 9/9 — `read-the-share` graded input + value-less bars; `watch-it-settle` both starts |
| L7 | markov-chains-7 | Convergence | ✅ READY | 9/9 — `periodic-trap` verdict chips; `approach-pi` graded; required-flag harmonized |
| L8 | markov-chains-8 | Reversibility & Detailed Balance | ✅ READY | 9/9 — S2 balance beats grade typed π / P-only; required-flag harmonized |
| L9 | markov-chains-9 | PageRank | ✅ READY | 9/9 — `weight-by-source` node-labels-only (mastery vector no longer leaked) |
| L10 | markov-chains-10 | Markov in the Wild | ✅ READY | 9/9 — required-flag harmonized (N3 `classify-one` accepted) |

## Fix verification (independent)
- **3 hard softlocks gone:** `spot-the-invalid` (L2, distinct match-targets), `transient-vs-recurrent` (L4, typed return-probability input graded via engine-composed `returnProbability`), `periodic-trap` (L7, converge/oscillate verdict chips via `periodicVerdict`).
- **Fake-grade / leak fixed:** `read-the-share`+`approach-pi` (L6/L7, real typed share vs engine π, value-less bars), `weight-by-source` (L9, node labels only — `mastery-fourNode` vector no longer pre-displayed).
- **S1/S2 (caught by Dept-3, in lessons I'd passed):** `build-from-story` (L2, empty editable cells, Check gated on filled∧rows=1, no target leak); `balance-one-edge`/`telescope-to-pi` (L8, typed π vs `detailedBalance`, P-only render), `reversible-or-not` chips. Latent `StationaryDisplay` auto-pass fallback removed.
- **Required-flag HARMONIZED** (the prior adjudication): every lesson's only `required:false` beats are now the track-gated `track:A` primers (+ L1's `track:B` prediction); all `track:both` ungraded bets/heroes/recaps in L5/L7/L8/L10 are now `required:true` — no core beat is mislabeled "Extension."
- Regression guard `ChainBoardBeat.interaction.test.tsx` asserts initial-disabled-Check + no-leak + correct-vs-wrong for all 17 graded chainBoard beats; gates green (validate ✓, tsc ✓, vitest 1111/1111, eslint ✓).

## N3 adjudication (R/T/A classify mechanic vs period/ergodic headline)
- **`classify-one` (L10): ACCEPT.** Classifying each state recurrent/transient/absorbing is exactly how you decide absorbing-vs-ergodic (no absorbing state + all recurrent/communicating ⇒ ergodic); the "ergodic" headline is the engine-verified anchor and the mechanic fits the question. No change.
- **`ehrenfest-period` (L4): FIX — minor, non-blocking, fixture-only.** The graded control is R/T/A classification, which cannot express a *period*, yet the prompt asks "What is the period?" — a question↔mechanic mismatch. Recommended small change: reword the prompt to ask for the per-state classification (e.g. *"In the 2-ball Ehrenfest urn, classify each state — recurrent, transient, or absorbing."*), leaving "period 2" as the engine-verified headline + feedback takeaway. No renderer change. (Both lessons remain READY.)

## Interview pack
- **55 engine-verified questions: hard 15 / harder 23 / brutal 17; 8/8 Interview Pack Scorecard gates green** (reported by Interview Studio; `interviews/` byte-unchanged).

## Headline citations
GB **§5.1 p.53–57** (memorylessness, transition matrix, path-probability, classification, gambler's-ruin 4/7, dice 7/13, drunkard 1411) + **§5.2 p.58–62**; WEB for L6–L10 (stationary/convergence/reversibility/PageRank, absent from GB): Math.SE 3336273, Grinstead & Snell Ch.11, stats.libretexts 16.8, Rochester ECE440, practicaldsc, theorempath. **Every graded answer is engine-reproduced** (`markov.ts` goldens + 25 chainBoard headline cross-checks + per-lesson factcheck tests).
