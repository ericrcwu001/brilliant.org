# Lesson Brief: Which Hypothesis?  (lesson-bayes-rule-4)

## Hook  (the bet)

"A part comes off the line **defective**. It could have been made by any of three machines: a big
old workhorse that runs half your output but almost never errs, or two smaller, faster machines that
fail a bit more often. **Which machine most likely made this bad part** — the one that makes the most
parts, or the one that fails the most?"

## Core promise (one idea)

The two-hypothesis rule is the **same rule for N**: rescale **every** hypothesis by how well it predicted
the evidence, then **renormalize by the total**. posteriorᵢ = priorᵢ·Lᵢ / Σⱼ priorⱼ·Lⱼ. The winner is
neither "most output" (prior) nor "most defective" (likelihood) alone — it's their **product**.

## Display fields

- **glyphKey:** `1/N`
- **vizKey:** `fourNode`

## Verified problems & answers  (anchor-and-source — REQUIRED)

| problem | answer | source | verified |
|---------|--------|--------|----------|
| Factory A makes 60% of output @ 2% defective, B makes 40% @ 5%. A part is defective. P(came from A)? | **3/8** | Classic factories/suppliers Bayes; GB p.37 §"Conditional Probability and Bayes' Formula" (law of total probability + Bayes); interview pack `multi-source-defect` (#10) | ☑ engine ☑ source |
| …same setup. P(came from B)? | **5/8** | interview pack `multi-source-defect` (#28); GB p.37 | ☑ engine ☑ source |
| Machines M1 (50% output, 1% defective), M2 (30%, 2%), M3 (20%, 3%). A part is defective. P(M1)? | **5/17** | interview pack `multi-source-defect` (#29); GB p.37 | ☑ engine ☑ source |
| …same setup. P(M3)? | **6/17** | interview pack `multi-source-defect` (#30); GB p.37 | ☑ engine ☑ source |
| **Mastery (transfer):** Suppliers S1 (25% of parts, 5% defective), S2 (20%, 3%), S3 (55%, 1%). A part is defective. P(S1)? | **25/48** | interview pack `multi-source-defect` (brutal #6); GB p.37 | ☑ engine ☑ source |

> Exact-rational check (reproduced by `src/engine/bayes.ts` `bayesPosterior`, **all confirmed**):
> 2-factory P(A) = (3/5·2/100)/((3/5·2/100)+(2/5·5/100)) = 6/16 = **3/8**, P(B) = **5/8**; 3-machine defect
> counts (per 10,000 parts) 50 : 60 : 60 → P(M1) = 50/170 = **5/17**, P(M3) = 60/170 = **6/17** (note M2 and
> M3 **tie** despite different shares); 3-supplier 125 : 60 : 55 (per 10,000) → P(S1) = 125/240 = **25/48**.

## Beat-by-beat plan  (Bet → Explore → Model → Prove)

| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | `recall-update-rule` | Recall L1: "rescale by likelihood, then renormalize by the total" (the early win) | retrieval bridge from L1 | "the posterior is just the likelihood" | yes (easy) | both |
| 2 | `open-bet` | Commit a gut answer to "which machine?" | sets up product = prior × likelihood | "blame the most-defective machine" | no (`byOption`) | both |
| 3 | `name-n-hypotheses` | Name "the denominator is a sum over **all** cases" (law of total probability for N) | vocabulary before the N-way sum | — (JIT primer) | no | A |
| 4 | `explore-sources` | Drag output shares + defect rates; watch **three** posterior bars renormalize | the N-way update, felt | "only one factor (share OR rate) decides" | no (hero) | both |
| 5 | `count-the-defects` | Per 10,000 parts, count each machine's defects → P(M1) = 50/170 = 5/17 | natural-frequency intuition for N | "I can compare the unnormalized products" | yes | both |
| 6 | `compute-twist` | Compute P(M3) = 6/17 and notice M2 = M3 despite different shares | product, not share or rate alone | "more output ⇒ more likely the culprit" | yes | both |
| 7 | `share-vs-rate` | Interleave L2: a big base rate (share) can outweigh a higher defect rate | base rate vs evidence, re-applied | "the rarest-defect machine is safe to ignore" | yes | both |
| 8 | `triangulate-5-17` | Three lenses (formula / 170-count frequency / odds) all give 5/17 | robustness of the N-way answer | "5/17 is an artifact of one method" | no | both |
| 9 | `mastery-challenge` | **(required, before recap)** 3 suppliers → P(S1) = 25/48 | transfer to new N, new shares/rates | "a small-share supplier can't be the likeliest" | yes | both |
| 10 | `recap` | Retrieval-first recap: priorᵢ × Lᵢ ÷ Σ | consolidate the N-way rule | — | no | both |

Notes: graded beats `required: true`, `track: both`; the JIT primer (`name-n-hypotheses`) is
`required: false`, `track: A`. `explore-sources` uses the new `bayesUpdate` type `display: 'bars'`
**rendering n = 3 hypotheses** (the one renderer extension — schema/engine/validator already support it;
focal = `hypotheses[0]` = the machine asked about) and carries the `hero` block; `count-the-defects`,
`compute-twist`, `mastery-challenge` reuse `answerEntry`/`masteryChallenge`; `share-vs-rate` reuses
`retrievalGrid`; `triangulate-5-17` reuses `tripletReveal`; opener reuses `retrievalGrid`. Put one
`interviewNote` on `count-the-defects` ("which-supplier / n-hypothesis defect is a standard Bayes
interview question — `multi-source-defect`").

## Misconceptions (Specialist)

- **"The defective part most likely came from the machine with the highest defect rate."** Fires at
  `open-bet`/`compute-twist`. Refutation (`byOption`): *"Weight the rate by output. M3 fails most (3%) but
  runs only 20% of parts; M2 (2%, 30%) ties it at 6/17. Rate alone doesn't decide — share × rate does."*
- **"…came from the machine that makes the most parts."** Fires at `open-bet`. Refutation: *"M1 makes
  half of everything but errs only 1% of the time → just 5/17, the smallest of the three. Most output ≠
  most blame."*
- **"I can compare the products without renormalizing."** Fires at `count-the-defects`. Refutation: *"The
  products 50 : 60 : 60 aren't probabilities until you divide by the total 170 — that Σ over all machines
  is the law of total probability."*
- **"A small-share source can't be the likeliest culprit."** Fires at `mastery-challenge`. Refutation:
  *"S1 is only 25% of parts but fails at 5% → 125 of 240 defects → 25/48, the largest. A high enough
  defect rate beats a bigger share."*

## Assessment + continuity (Designer + Cartographer)

- **retrieval opener:** `recall-update-rule` — recalls L1's *posterior ∝ prior × likelihood, then
  renormalize* (Continuity Report: L1 headline → L4 opener), now generalized to N hypotheses.
- **guaranteed early win:** `recall-update-rule` (graded recall of L1, not an N-way computation).
- **mastery challenge (required, before recap):** `mastery-challenge` — 3 suppliers → **25/48**; a clean
  transfer to a new N with different shares and rates.
- **spacing/interleaving:** `share-vs-rate` re-applies **L2's base-rate idea** (a big prior/share vs a
  higher likelihood/rate) in a new costume — recall, not re-teach; the N-way `bayesPosterior` machinery is
  the launch pad for **L5 (Monty Hall as a 3-hypothesis update)**; exact-fraction posteriors (3/8, 5/17,
  6/17, 25/48) continue the corpus's fraction-fluency thread (PHT 7/8, L1 2/3, L2 1024/2023).
