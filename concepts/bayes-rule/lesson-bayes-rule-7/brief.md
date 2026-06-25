# Lesson Brief: Reading Evidence Backwards  (lesson-bayes-rule-7)

## Hook  (the bet)

"A DNA profile from the scene matches a suspect. The lab testifies the profile occurs in **1 in a
million** people. The prosecutor tells the jury: *so there's only a one-in-a-million chance he's
innocent.* The suspect was found by **searching a database** of 10,000 others. **Is the prosecutor
right — or is that a fallacy?**"

## Core promise (one idea)

**P(evidence | hypothesis) is not P(hypothesis | evidence)** — the conditional points one way. "1 in a
million **innocents** match" is not "1 in a million chance he's **innocent**." Flip it with Bayes (and
the suspect pool you forgot) and the real number is **100/101 ≈ 99%** — strong, but not one-in-a-million.

## Display fields

- **glyphKey:** `H|E`
- **vizKey:** `twoNode`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Random-match prob 1/1,000,000; suspect is 1 of **10,001** possible sources (prior 1/10001); DNA matches. P(he is the source)? | **100/101** | en.wikipedia.org/wiki/Prosecutor%27s_fallacy (cold-hit DNA); interview pack `showcase-prosecutors-fallacy` (#9) | ☑ engine ☑ source |
| Reading "P(match \| innocent) = 1/1,000,000" **as** "P(innocent \| match) = 1/1,000,000". | **the fallacy (≠)** | en.wikipedia.org/wiki/Prosecutor%27s_fallacy | ☑ source |
| Same 1/1,000,000 match, but the suspect had **independent probable cause** first (prior 1/2). P(source)? | **1,000,000/1,000,001 (≈ 1)** | en.wikipedia.org/wiki/Prosecutor%27s_fallacy (the prior is what changed); engine-verified | ☑ engine ☑ source (family) |
| Cold hit found by trawling a database; same 1/1,000,000 match; one of **1,000,001** possible sources. | **1/2** (odds-form triangulation: 1:10,000 × 1,000,000 = 100:1) | en.wikipedia.org/wiki/Prosecutor%27s_fallacy §database search / cold hit; NRC II (1996); engine-verified | ☑ engine ☑ source (family) |
| **Mastery (transfer):** the cold-database case above — state P(he is the source). | **1/2** | en.wikipedia.org/wiki/Prosecutor%27s_fallacy (database-search controversy); engine-verified | ☑ engine ☑ source (family) |

> Exact-rational check (`bayesUpdate`, **all confirmed**): cold hit pool 10,001 =
> `bayesUpdate(1/10001, 1, 1/1000000)` = **100/101** (≡ odds form: prior odds 1:10,000 × LR 1,000,000 =
> 100:1 → `oddsToProb` = 100/101); probable cause = `bayesUpdate(1/2, 1, 1/1000000)` =
> **1,000,000/1,000,001**; database pool 1,000,001 = `bayesUpdate(1/1000001, 1, 1/1000000)` = **1/2**. The
> match likelihood is identical in all three; only the **prior/pool** moves the answer — the directional
> headline (100/101) is the sourced number, the contrasts are the same cold-hit family, engine-pinned.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-base-rate` | Recall L2: "P(+ \| sick) = 99% but P(sick \| +) = 50%" — the same swap (the early win) | retrieval bridge from L2 | "an accurate test ⇒ the hypothesis is that probable" | yes (easy) | both |
| 2 | `open-bet` | Commit a chance-of-innocence to the 1-in-a-million match | surfaces the directional swap | "1 in a million he's innocent" | no (`byOption`) | both |
| 3 | `name-the-direction` | Name "P(E\|H) reads forward; P(H\|E) reads backward — different numbers" | vocabulary for the direction | — (JIT primer) | no | A |
| 4 | `explore-pool` | Drag the suspect-pool size; watch P(source \| match) slide from ~1 toward 1/2 and below | the prior/pool is the hidden lever | "the match alone fixes the answer" | no (hero) | both |
| 5 | `flip-the-conditional` | From P(match\|innocent) + the pool, compute P(innocent\|match) = 1/101 → 100/101 | flipping the conditional with Bayes | "you can't get P(H\|E) from P(E\|H)" | yes | both |
| 6 | `cold-vs-cause` | Same match, two priors: cold hit (10,001) → 100/101 vs probable cause (1/2) → ≈1 | the prior decides probative value | "the DNA match means the same thing regardless" | yes | both |
| 7 | `name-the-fallacy` | Interleave: spot the same backward read across costumes (medical L2, DNA, "P(rain\|clouds) vs P(clouds\|rain)") | one fallacy, many disguises | "this only happens with DNA" | yes | both |
| 8 | `triangulate-100-101` | Three lenses (Bayes formula / odds 1:10,000 × 1,000,000 = 100:1 / "blow the pool up ×100") → 100/101 | robustness of 100/101 | "100/101 is a rounding of one-in-a-million" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** cold hit in a **million-person** database → 1/2 | transfer: bigger search = weaker hit | "a bigger database makes the match more damning" | yes | both |
| 10 | `recap` | Retrieval-first recap: check the direction, then restore the prior | consolidate | — | no | both |

Notes: `explore-pool` reuses the `bayesUpdate` type `display: 'bars'` at **n = 2** (source vs. not-source;
the draggable prior is the suspect-pool size) and carries the `hero` block; `flip-the-conditional`,
`cold-vs-cause`, `mastery-challenge` reuse `answerEntry`/`masteryChallenge`; `name-the-fallacy` reuses
`retrievalGrid`; `triangulate-100-101` reuses `tripletReveal`; opener reuses `retrievalGrid`. Put one
`interviewNote` on `cold-vs-cause` ("the prosecutor's fallacy / cold-hit DNA is a canonical
quant/stats interview question — `showcase-prosecutors-fallacy`"). No n>2 rendering required.

## Misconceptions (Specialist)

- **"Random-match probability 1 in a million ⇒ P(innocent) = 1 in a million" (the prosecutor's
  fallacy).** Fires at `open-bet`. Refutation (`byOption`): *"That's P(match | innocent), read backward.
  With 10,000 other innocents who could each match by chance, the match isn't unique to guilt: about 1
  true match vs ~1/100 expected false matches → odds 100:1 → **100/101**, not 999,999/1,000,000."*
- **"The DNA match alone settles it."** Fires at `explore-pool`/`cold-vs-cause`. Refutation: *"A cold hit
  behaves like a low base rate (L2): the larger the pool you searched, the more coincidental matches you
  expect. The same match is near-certain with probable cause (prior 1/2 → ≈1) and a coin flip in a
  million-person trawl."*
- **"If the test is accurate, P(H|E) ≈ P(E|H)."** Fires at `flip-the-conditional`. Refutation: *"They can
  differ by orders of magnitude — 1/1,000,000 forward vs 1/101 backward. Accuracy of the evidence is not
  the probability of the hypothesis."*
- **"A bigger database makes a match more convincing."** Fires at `mastery-challenge`. Refutation: *"The
  opposite — more innocents searched means more chances for a coincidental match. Pool of 1,000,001 with a
  1/1,000,000 profile → only **1/2**."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-base-rate` — recalls **L2's** headline (one 99% test on a 1% disease →
  only 50%) reframed as the *same directional swap* P(+|sick) ≠ P(sick|+) (Continuity Report: L2 → L7
  opener), now named as the general prosecutor's fallacy.
- **guaranteed early win:** `recall-base-rate` (graded recall of L2, not the DNA computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — cold hit in a **million-person
  database → 1/2**; a transfer that reinforces "the searched pool is the hidden prior."
- **spacing/interleaving:** `explore-pool` re-applies **L2's base-rate-trap** as a draggable pool (recall,
  not re-teach); `name-the-fallacy` interleaves the medical (L2), DNA, and everyday "P(A|B) vs P(B|A)"
  costumes; the odds-form triangulation re-surfaces **L3's** prior-odds × likelihood-ratio; exact-fraction
  posteriors (100/101, 1/2) continue the corpus's fraction-fluency thread.
