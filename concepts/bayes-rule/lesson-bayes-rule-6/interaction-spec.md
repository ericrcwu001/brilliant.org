# Interaction Spec: The Question Behind the Clue  (lesson-bayes-rule-6)

> Department 2 (Interactive Experience / Design). Grounded in `src/content/schema.ts`, the dispatcher, and
> the reuse renderers. The frozen `bayesUpdate` type, engine, the n-hypothesis `bars` delta, and
> validate-fixtures edits live in `../wave0-contracts.md` (§9). This spec maps every Dept-1 beat to a real
> interaction type and supplies the per-beat feedback ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-condition'`, `unlocks:'lesson-bayes-rule-7'`, `schemaVersion:1`. Glyph `1/3`, viz `twoNode`.
>
> **This lesson stays 2-hypothesis** (n = 2) and renders identically to L1–L3 — it needs **no n > 2
> rendering**. Bertrand's 3-card case is stated via `answerEntry`/`tripletReveal` (numbers, not bars).

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / extend | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|----------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-monty` | Tap left → pick match → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick 1/2 / 1/3 / 1/4 chip → per-option note → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | radio ≥44px; `aria-live` note | none | both |
| 3 | `name-the-condition` | Expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `explore-children` | Watch the prior split 1/4 become the conditioned posterior 1/3 (2 bars, fixed) | `bayesUpdate` `display:'bars'` **n=2** | reuse (direct, `interactive:false`) | `display`,`hypotheses` (×2),`priors` (×2 = [1/4,3/4]),`likelihoods` (×2 = [1,2/3]),`evidence`,`interactive:false`,`posterior:"1/3"` + beat-level `hero` | two labeled bars; visually-hidden `aria-live` mirrors both posteriors; reduced-motion → final settled bars | DOM bars, CSS width transition; slow-first per `hero.slowFirst` | both |
| 5 | `count-the-families` | Type P(both \| ≥1 boy) and P(both \| this child) → Check | `answerEntry` | reuse | `fields:[…×2]` | two inputs ≥44px; Enter; `aria-live` | none | both |
| 6 | `bertrand` | Type P(other side black \| you see black) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` + beat-level `interviewNote` | input ≥44px; Enter; `aria-live` | none | both |
| 7 | `clue-match` | Match each clue to its update → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` (×4) | tap/drag ≥44px; `aria-live` | none | both |
| 8 | `triangulate-13` | Reveal three lenses → converge on 1/3 | `tripletReveal` | reuse | `value:'1/3'`, `lenses:[{label,body}]`, `display:'cards'` | cards ≥44px; `aria-live` | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(all three boys \| ≥1 boy) for **three** children → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- **Beat 4 `explore-children`: remapped `display:'tree'`+`population:4` → `display:'bars'` (n = 2,
  `interactive:false`).** Rationale (surgical, no new renderer work):
  - The existing `tree` hero (`TreeLargeDisplay`) is a **confusion grid driven by a draggable prevalence
    slider** — a *prior* drag. But the two-children prior is **structurally fixed** at 1/4 (four equally-
    likely families), so a prevalence drag is off-target, and at `population:4` the integer-percent slider
    produces non-integer family counts at every non-multiple-of-25 (e.g. 13% → 0.52 of a family), a real
    bug surface. The brief's intended interaction is a **clue toggle**, which the renderer does not have.
  - The existing `bars` display **already** supports a non-interactive "watch it resolve" hero at n = 2
    (`interactive:false` is honored today), so this reuse needs **zero renderer change** and routes through
    the wave0 §9 direct path (posterior computed from `bayesPosterior(priors, likelihoods)`, not a slider).
    The prior bar (1/4 vs 3/4) settles to the conditioned posterior bar (**1/3** vs 2/3).
  - The 4-family enumeration the brief wanted to *show* is delivered (more durably) as the learner's own
    work in the graded `count-the-families` and the 400-family frequency lens of `triangulate-13`.
  - Net: L6 "keeps the widget at n = 2" (brief) and **renders identically** to the existing 2-hypothesis
    bars path; the only new build item concept-wide remains the n > 2 generalization (L4/L5).
- Beat 6 `bertrand`: kept as `answerEntry` (`2/3`), per the brief ("Bertrand's 3-card case is stated via
  `answerEntry`/`tripletReveal`; `bayes-rule-6` keeps the widget at n = 2"). It may *optionally* adopt the
  n = 3 bars once they exist, but this spec does not require it.
- No other remaps.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics: `hints[0]`=gentle, `hints[1]`=misconception refutation, `hints[2]`=revealed answer ("Try again"
resets). `required` graded beats that reach reveal report `needsReview`.

**1 · `recall-monty`** — `correct` + `hints[3]`
- correct: "The host's *choice* was the clue in L5; here the clue's exact *wording* is the whole update. Same lesson: name what you actually observed."
- hints: `["From L5: the evidence was which door the host opened.", "From L1: 'at least one boy' and 'the older is a boy' are different clues → different answers.", "The exact event you condition on sets the number."]`
- pairs: `"The host's clue (L5)"→"his action, constrained by his rules, is the evidence"`, `"'≥1 boy' vs 'the older is a boy' (L1)"→"different clues → different answers"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"1/2 — the other child is a 50/50 coin flip"` → `{note:"That secretly assumes you singled out one child. List {BB, BG, GB, GG}: '≥1 boy' keeps {BB, BG, GB} → BB is 1 of 3 → 1/3.", correct:false}`
- `"1/3 — list the families the clue allows"` → `{note:"Right — '≥1 boy' keeps three equally-likely families and only one is both-boys → 1/3.", correct:true}`
- `"1/4 — both boys is rare"` → `{note:"1/4 is the prior, before the clue. 'At least one boy' rules out girl-girl, lifting it to 1/3.", correct:false}`
- hints: `["No wrong guess — we'll list the families.", "The clue removes only girl-girl, not a whole child.", "{BB, BG, GB} survive → 1 of 3 → 1/3."]`

**3 · `name-the-condition`** (primer; copy = caption/aria)
- correct: "You condition on an **event** — a written-down subset of outcomes — not a vibe about 'the other child.'"
- hints: `["Write the clue as a set of families, not a feeling.", "'≥1 boy' is the subset {BB, BG, GB}; 'the older is a boy' is {BB, BG}.", "The posterior is just the focal outcome's share of the surviving subset."]`
- title: "Condition on an event, not a vibe" · body: "A clue is a **subset of the sample space**. Write the four equally-likely families {BB, BG, GB, GG}, then keep exactly the ones the clue allows. 'At least one boy' keeps {BB, BG, GB}; 'this specific child is a boy' keeps a different set. The answer is forced once you write the event down."

**4 · `explore-children`** (ungraded hero; copy = aria/caption)
- correct: "Of four equally-likely families, 'at least one boy' rules out only girl-girl — leaving three, of which one is both-boys. The bar settles at 1/3, not 1/2."
- hints: `["Watch the prior (1 of 4) become the conditioned posterior.", "The clue removes girl-girl, not a whole child.", "Both-boys is 1 of the 3 surviving families → 1/3."]`
- `hero.structuralReadout`: "Of 4 equally-likely families, 'at least one boy' keeps 3; only 1 is both-boys → 1/3."

**5 · `count-the-families`** — graded `correct` + `hints[3]`
- correct: "'At least one is a boy' keeps {BB, BG, GB} → **1/3**. 'This specific child is a boy' singles out one child → keeps {BB, BG} (or {BB, GB}) → **1/2**. One word changes which outcomes survive."
- hints: `["List {BB, BG, GB, GG} and cross out what each clue forbids.", "'≥1 boy' removes only GG (3 left). 'This child is a boy' fixes one slot to B (2 left).", "1/3 and 1/2."]`
- fields: `{id:"atleast", label:"P(both boys | at least one is a boy)", accept:["1/3"]}`, `{id:"thischild", label:"P(both boys | this specific child is a boy)", accept:["1/2"]}`

**6 · `bertrand`** — graded `correct` + `hints[3]`
- correct: "Count **faces**, not cards. Three equally-likely black faces (two on the black-black card, one on the mixed card); two of them have black on the back → **2/3**. Seeing a face is stronger evidence for the all-black card."
- hints: `["Three cards: black-black, white-white, black-mixed. You saw a black face — which faces could it be?", "There are 3 equally-likely black faces, not 2 cards. Two of those faces sit on the black-black card.", "2 of 3 → 2/3."]`
- field: `{id:"bertrand", label:"P(other side black | you see a black face)", accept:["2/3"]}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L6): "Two-children and Bertrand's-box are classic conditioning traps (interview packs `two-children`, `showcase-bertrand-box`). The discipline that defeats both: enumerate the **equally-likely atomic outcomes you actually observe** (faces, not cards; ordered families, not 'the other child') before dividing."

**7 · `clue-match`** — graded `correct` + `hints[3]` (the interleave)
- correct: "Four costumes, one principle: the update is whatever the **conditioning event** forces. Even Monty (L5) is the same move."
- hints: `["Each clue is a different subset of outcomes.", "Match by what the clue keeps: ≥1 boy → 3 families; this-child → 2; a black face → 3 faces; the host's forced door → 2 of 3.", "≥1 boy → 1/3, this-child → 1/2, Bertrand → 2/3, Monty → 2/3."]`
- pairs: `"At least one is a boy"→"1/3"`, `"This specific child is a boy"→"1/2"`, `"Bertrand: you see a black face"→"2/3"`, `"Monty: the host opens a goat door"→"2/3"`

**8 · `triangulate-13`** (ungraded reveal)
- correct: "Enumeration, the conditional formula, and a 400-family frequency count all give **1/3** — not a sophistry."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 1/3."]`
- lenses: `{label:"Enumerate", body:"{BB, BG, GB, GG}; '≥1 boy' keeps {BB, BG, GB}; BB is 1 of 3"}`, `{label:"Formula", body:"P(BB | ≥1 boy) = P(BB)/P(≥1 boy) = (1/4)/(3/4) = 1/3"}`, `{label:"Frequencies", body:"Of 400 families: 100 BB, 100 BG, 100 GB, 100 GG; '≥1 boy' keeps 300; BB is 100 → 1/3"}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "Re-enumerate the **eight** three-child families; '≥1 boy' removes only GGG, leaving 7; just BBB is all boys → **1/7**. The clue's *form* is reused, but you must recount the new sample space."
- hints: `["Three children → 8 equally-likely families. Don't assume it's 1/3 again.", "'≥1 boy' removes only all-girls (GGG), leaving 7. All-boys (BBB) is one of them.", "1/7."]`
- scenario: "A family has **three** children. I tell you **at least one is a boy**." · field: `{id:"three", label:"P(all three boys | at least one is a boy)", accept:["1/7"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "The update is set by the **exact event you condition on** — write the clue as a subset of outcomes and the math is forced."
- hints: `["'At least one boy' → 1/3; 'this child is a boy' → 1/2. Same family, different clue, different answer.", "Bertrand: count faces, not cards → 2/3. Monty: the forced door → 2/3.", "Next up: which way does the conditional point — P(E|H) vs P(H|E)."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-monty | n/a (recall of L5/L1) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 1/3 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-the-condition | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-children | 1/3 ✔ engine (`bayesPosterior`, n=2) | watch 2-bar resolve ✔ | hero readout + caption ✔ | aria-live mirror + final frame ✔ |
| count-the-families | 1/3 & 1/2 (GB p.37–38) ✔ engine | type ×2 ✔ | triple ✔ | ✔ |
| bertrand | 2/3 (Bertrand's box) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| clue-match | n/a (interleave) ✔ | tap/drag match ✔ | triple ✔ | ✔ |
| triangulate-13 | 1/3 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 1/7 (GB p.37–38) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-6`): ≥1 primer ✔ (`name-the-condition`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`bertrand`); first graded beat is the `retrievalGrid` opener ✔ (`recall-monty`); no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied.
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (1/7 is a Bayes fraction, not a hitting-time).
- **bayesUpdate cross-check**: `explore-children` declares `posterior:"1/3"`; the validator recomputes `bayesPosterior(priors, likelihoods)[0]` with `priors=[1/4,3/4]`, `likelihoods=[1,2/3]` (focal = `hypotheses[0]` = Both boys) → 1/3. n = 2, the existing path — no validator change.
