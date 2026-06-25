# Interaction Spec: Which Hypothesis?  (lesson-bayes-rule-4)

> Department 2 (Interactive Experience / Design). Grounded in the real schema (`src/content/schema.ts`),
> dispatcher (`src/lesson/beats/index.tsx`), and reuse renderers. The frozen `bayesUpdate` type, engine,
> the **n-hypothesis `bars` renderer delta** (the one new build item — see `../wave0-contracts.md` §9), and
> validate-fixtures edits live in `../wave0-contracts.md`. This spec maps every Dept-1 beat to a real
> interaction type and supplies the per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`
> (safe H/T placeholder — no Bayes beat reads the automaton), `milestoneId:'bayes-rule-nway'`,
> `unlocks:'lesson-bayes-rule-5'`, `schemaVersion:1`. Glyph `1/N`, viz `fourNode`.
>
> **The one renderer extension this lesson drives:** `explore-sources` is the first `bayesUpdate`
> `display:'bars'` beat with **n = 3 hypotheses**. Per wave0 §9, n > 2 renders one labeled bar per
> hypothesis directly from `bayesPosterior(priors, likelihoods)` (the binary drag-slider is suppressed;
> `interactive:false`). Focal = `hypotheses[0]` = the machine the lesson asks about (Machine 1).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / extend | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|----------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-update-rule` | Tap a result on the left → pick its match on the right → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | tap/drag targets ≥44px; `aria-live` status mirror (renderer built-in) | none (tap) | both |
| 2 | `open-bet` | Pick one chip → soft per-option note appears → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | chips ≥44px radio group; `aria-live` note | none | both |
| 3 | `name-n-hypotheses` | Read/expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure button ≥44px; static text | none (tap-only) | A |
| 4 | `explore-sources` | Watch **three** posterior bars renormalize from the share×rate products (slow-first) | `bayesUpdate` `display:'bars'` **n=3** | **extend (n>2)** | `display`,`hypotheses` (×3),`priors` (×3),`likelihoods` (×3),`evidence`,`interactive:false`,`posterior:"5/17"` + beat-level `hero` | three labeled bars, each ≥44px row; visually-hidden `aria-live` lists all 3 posteriors; reduced-motion → final settled bars | DOM bars, CSS width transition; slow-first per `hero.slowFirst` | both |
| 5 | `count-the-defects` | Type the exact posterior fraction → Check → hint ladder | `answerEntry` | reuse | `fields:[{id,label,accept,placeholder}]` + beat-level `interviewNote` | text input ≥44px; Enter submits; FeedbackStrip `aria-live` | none | both |
| 6 | `compute-twist` | Type P(M3) and P(M2); see they tie despite different shares → Check | `answerEntry` | reuse | `fields:[…×2]` | two labelled inputs ≥44px; `aria-live` | none | both |
| 7 | `share-vs-rate` | Match each machine's headline factor to why it loses → Check | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×3) | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `triangulate-5-17` | Reveal each of three lenses → they converge on 5/17 | `tripletReveal` | reuse | `value:'5/17'`, `lenses:[{label,body}]`, `display:'cards'` | lens cards = buttons ≥44px; `aria-live` convergence line (built-in) | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(S1 \| defective) for 3 new suppliers → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` (copy via `feedback`) | "Reveal recap" ≥44px; `aria-live`; reduced-motion → no enter animation | CSS reveal (skipped under reduced-motion) | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 4 `explore-sources`: matches the brief (`bayesUpdate` `display:'bars'` **rendering n = 3**). The
  brief's "drag output shares + defect rates" is delivered as the **non-slider n > 2 presentation** frozen
  in wave0 §9: at n > 2 the prior is fixed (`interactive:false`) and the three posterior bars are computed
  directly from `bayesPosterior(priors, likelihoods)`. The "felt" exploration is *watching the
  renormalization* (50% share → only 5/17 posterior); the numeric drilling is the graded `count-the-defects`
  / `compute-twist`. The integer-percent prior slider of the 2-hypothesis path **cannot** represent a
  3-way prior split, so suppressing it for n > 2 is required, not optional.
- Beat 6 `compute-twist`: the brief asks to "compute P(M3) = 6/17 and notice M2 = M3." Implemented as a
  **two-field `answerEntry`** (P(M3) and P(M2)) so the tie is the learner's own result, not a told fact.
- No other remaps. Every other beat maps 1:1 to an existing real type.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics (`src/lesson/feedback.ts` + `FeedbackStrip.tsx`): `hints[0]`=Hint 1 (gentle), `hints[1]`=Hint 2
(the misconception refutation), `hints[2]`=Hint 3 = the **revealed answer** (label flips to "Answer"; "Try again" resets).
`required` graded beats that ever reach reveal report `needsReview`.

**1 · `recall-update-rule`** — `correct` + `hints[3]`
- correct: "Rescale each hypothesis by how well it predicted the evidence, then **renormalize**. That move doesn't care whether there are two hypotheses or twenty."
- hints: `["Warm-up from L1 — no pressure.", "Posterior isn't the likelihood; it's prior × likelihood, divided by the total.", "Rescale each by its likelihood, then divide by the sum over all of them."]`
- pairs: `"posterior ∝ prior × likelihood"→"rescale each hypothesis by how well it predicted the evidence"`, `"renormalize"→"divide by the total over all hypotheses"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"Machine 1 — it makes the most parts (half of all output)"` → `{note:"M1 makes half of everything but errs only 1% of the time → just 5/17, the smallest of the three. Most output ≠ most blame.", correct:false}`
- `"Machine 3 — it has the highest defect rate (3%)"` → `{note:"Closer — M3 ties for most likely. But not because its rate is highest: M2 (2% × 30%) ties M3 (3% × 20%) at 6/17. It's share × rate, not rate alone.", correct:false}`
- `"You can't say from share or rate alone — weigh share × rate"` → `{note:"Right instinct. Multiply each machine's share by its defect rate, then renormalize: M1 → 5/17, M2 = M3 → 6/17.", correct:true}`
- hints: `["No wrong guess — we'll weigh share × rate.", "Most output isn't most blame; highest rate isn't either.", "Per 10,000 parts: 50 : 60 : 60 defects → renormalize over 170."]`

**3 · `name-n-hypotheses`** (primer; copy = caption/aria)
- correct: "The denominator is a **sum over every hypothesis** — the law of total probability for N."
- hints: `["Two hypotheses or ten — the rule is the same.", "Each hypothesis contributes priorᵢ × Lᵢ to the total chance of the evidence.", "posteriorᵢ = priorᵢ·Lᵢ / Σⱼ priorⱼ·Lⱼ."]`
- title: "The denominator is a sum over all cases" · body: "With more than two hypotheses, the rule doesn't change — only the bookkeeping. The chance of the evidence is the **sum** of priorᵢ × Lᵢ over **every** machine (the law of total probability). Each posterior is that machine's share of the sum: posteriorᵢ = priorᵢ·Lᵢ / Σⱼ priorⱼ·Lⱼ."

**4 · `explore-sources`** (ungraded hero; copy = aria/caption)
- correct: "Machine 1 makes half the parts but only 5/17 of the defects; Machines 2 and 3 tie at 6/17. Share alone doesn't decide — share × rate does, after renormalizing."
- hints: `["Watch the prior bars (50 : 30 : 20) become posterior bars (5/17 : 6/17 : 6/17).", "The biggest prior shrinks because its defect rate is the lowest.", "Each bar = that machine's share of the 170 defects per 10,000 parts."]`
- `hero.structuralReadout`: "Per 10,000 parts: Machine 1 makes 50 defects, Machines 2 and 3 each make 60 → 50 of 170 → 5/17 for Machine 1."

**5 · `count-the-defects`** — graded `correct` + `hints[3]`
- correct: "Per 10,000 parts: 50 from M1, 60 from M2, 60 from M3 — total 170. P(M1 | defective) = 50/170 = **5/17**."
- hints: `["Count defects per 10,000: M1 = 5000·1%, M2 = 3000·2%, M3 = 2000·3%.", "That's 50 : 60 : 60. The products aren't probabilities until you divide by the total 170 (the law of total probability).", "50/170 = 5/17."]`
- field: `{id:"pm1", label:"P(Machine 1 | defective)", accept:["5/17"], placeholder:"e.g. 5/17"}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L4): "Which-source / n-hypothesis defect is a standard Bayes interview question (interview pack `multi-source-defect`): weight each source's share by its defect rate, then renormalize by the law of total probability. The trap is comparing the raw products (50 : 60 : 60) without dividing by 170."

**6 · `compute-twist`** — graded `correct` + `hints[3]`
- correct: "P(M3) = 60/170 = **6/17** — and P(M2) = 60/170 = **6/17** too. M2 and M3 **tie** even though M2 runs 30% and M3 only 20%: a higher rate exactly offsets a smaller share."
- hints: `["Same 170 total. M3 = 2000·3% = 60; M2 = 3000·2% = 60.", "Both land on 60 of 170 — the products are equal, so the posteriors are equal.", "P(M3) = P(M2) = 6/17."]`
- fields: `{id:"pm3", label:"P(Machine 3 | defective)", accept:["6/17"]}`, `{id:"pm2", label:"P(Machine 2 | defective)", accept:["6/17"]}`

**7 · `share-vs-rate`** — graded `correct` + `hints[3]` (interleaves L2's base-rate idea)
- correct: "Neither the biggest share nor the highest rate wins alone — the **product** does. That's L2's base-rate lesson in a new costume."
- hints: `["Recall L2: a big prior can outweigh a strong likelihood — and vice versa.", "M1 has the most share but the lowest rate; M3 has the highest rate but the least share.", "Share × rate, then renormalize — that's the only thing that decides."]`
- pairs: `"Most output (Machine 1, 50%)"→"still only 5/17 — its defect rate is the lowest"`, `"Highest defect rate (Machine 3, 3%)"→"only 6/17 — its share is the smallest"`, `"What decides the culprit"→"share × rate, then renormalize over the total"`

**8 · `triangulate-5-17`** (ungraded reveal)
- correct: "Formula, the 170-defect count, and the odds ratio all land on **5/17** — not an artifact of one method."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 5/17."]`
- lenses: `{label:"Formula", body:"(½·1/100) / (½·1/100 + 3/10·2/100 + 2/10·3/100) = (1/200)/(17/500)"}`, `{label:"Frequencies", body:"Per 10,000 parts: 50 : 60 : 60 defects; Machine 1 is 50 of 170"}`, `{label:"Odds", body:"Machine 1 vs the rest = 50 : 120 → 50/170 = 5/17"}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "Per 10,000 parts: S1 = 2500·5% = 125, S2 = 2000·3% = 60, S3 = 5500·1% = 55 → total 240. P(S1) = 125/240 = **25/48** — the *largest*, even though S1 makes only a quarter of the parts. A high enough defect rate beats a bigger share."
- hints: `["New N, same move: weight each supplier's share by its defect rate.", "125 : 60 : 55 per 10,000 → divide by 240.", "125/240 = 25/48."]`
- scenario: "Three suppliers: **S1** makes 25% of parts at a 5% defect rate, **S2** 20% at 3%, **S3** 55% at 1%. A part arrives **defective**." · field: `{id:"ps1", label:"P(Supplier 1 | defective)", accept:["25/48"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "The two-hypothesis rule **is** the rule for N: posteriorᵢ = priorᵢ·Lᵢ / Σⱼ priorⱼ·Lⱼ. Rescale every hypothesis by how well it predicted the evidence, then renormalize by the total."
- hints: `["A defective part most likely came from neither the highest-output nor the highest-rate machine — it's the product that ranks them.", "M2 and M3 tie at 6/17 because share × rate is equal even though shares differ.", "Next up: Monty Hall — three doors, and the host's *action* is the evidence."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-update-rule | n/a (recall of L1) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 5/17 / 6/17 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-n-hypotheses | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-sources | 5/17 ✔ engine (`bayesPosterior`, n=3) | watch 3-bar renormalize ✔ | hero readout + caption ✔ | aria-live lists 3 posteriors + final frame ✔ |
| count-the-defects | 5/17 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| compute-twist | 6/17 & 6/17 ✔ engine | type ×2 ✔ | triple ✔ | ✔ |
| share-vs-rate | n/a (interleave L2) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| triangulate-5-17 | 5/17 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 25/48 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-4`): ≥1 primer ✔ (`name-n-hypotheses`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`count-the-defects`); first graded beat is the `retrievalGrid` opener ✔ (`recall-update-rule`); no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied (Bayes uses words, and the only candidate grounding `name-n-hypotheses` is track-A-only, so grounding a track:both beat would fail the gate in track B — see wave0 §6f).
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (25/48 is a Bayes fraction, not a hitting-time, so the `buildAutomaton(pattern).E0 ∈ accept` cross-check stays skipped).
- **bayesUpdate cross-check**: `explore-sources` declares `posterior:"5/17"`; the validator recomputes `bayesPosterior(priors, likelihoods)[0]` over the **n = 3** arrays (focal = `hypotheses[0]` = Machine 1) — already generic, no validator change (wave0 §9).
