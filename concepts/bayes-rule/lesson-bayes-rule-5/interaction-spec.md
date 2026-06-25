# Interaction Spec: The Host's Clue  (lesson-bayes-rule-5)

> Department 2 (Interactive Experience / Design). Grounded in `src/content/schema.ts`, the dispatcher, and
> the reuse renderers. The frozen `bayesUpdate` type, engine, the **n-hypothesis `bars` renderer delta**
> (incl. the **zero-likelihood 0-width bar**), and validate-fixtures edits live in `../wave0-contracts.md`
> (§9). This spec maps every Dept-1 beat to a real interaction type and supplies the per-beat feedback
> ladder, a11y, and Definition-of-Ready.
>
> **Lesson-level fixture facts** (wave0 §5): `courseId:'course-bayes-rule'`, `patternOptions:["H"]`,
> `milestoneId:'bayes-rule-monty'`, `unlocks:'lesson-bayes-rule-6'`, `schemaVersion:1`. Glyph `door`, viz `dice`.
>
> **The renderer extension this lesson drives:** `explore-doors` is `bayesUpdate` `display:'bars'` with
> **n = 3 hypotheses**, one of which (the **opened door**) has likelihood `0` → posterior `0`. Per wave0
> §9, the n > 2 path renders one labeled bar per hypothesis from `bayesPosterior(priors, likelihoods)`,
> drawing the opened door as a **0-width but still-labeled** bar. Focal = `hypotheses[0]` = the **Switch**
> door, so the validator anchor `bayesPosterior(...)[0]` reads `2/3`.

## Per-beat table

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse / extend | exact fields used (schema.ts) | a11y | visual / motion | track |
|---|--------|----------------------------------------|------------------|----------------|-------------------------------|------|-----------------|-------|
| 1 | `recall-n-update` | Tap left → pick match → Check grades all pairs | `retrievalGrid` | reuse | `pairs:[{left,right}]` | ≥44px; `aria-live` (built-in) | none | both |
| 2 | `open-bet` | Pick stay / switch / doesn't-matter chip → per-option note → Continue | `prediction` | reuse | `options:string[]` + feedback `byOption` | radio ≥44px; `aria-live` note | none | both |
| 3 | `name-the-protocol` | Expand the JIT primer → Continue | `primer` | reuse | `variant:'custom'`, `title`, `body`, `collapsible:true` | disclosure ≥44px; static text | none (tap-only) | A |
| 4 | `explore-doors` | Watch the reveal collapse the opened door to 0 and push the switch door to 2/3 (3 bars, one at 0) | `bayesUpdate` `display:'bars'` **n=3** | **extend (n>2, 0-bar)** | `display`,`hypotheses` (×3),`priors` (×3 = [1/3,1/3,1/3]),`likelihoods` (×3 = [1,1/2,0]),`evidence`,`interactive:false`,`posterior:"2/3"` + beat-level `hero` | three labeled bars incl. a 0-width labeled "Opened door" bar; visually-hidden `aria-live` lists all 3 posteriors; reduced-motion → final settled bars | DOM bars, CSS width transition; slow-first per `hero.slowFirst` | both |
| 5 | `host-likelihood` | Type P(host opens Door 3 \| car behind Door k) for k = 1,2,3 → Check | `answerEntry` | reuse | `fields:[…×3]` | three inputs ≥44px; Enter; `aria-live` | none | both |
| 6 | `compute-23` | Type P(car behind Door 2 \| host opened Door 3) → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` + beat-level `interviewNote` | input ≥44px; Enter; `aria-live` | none | both |
| 7 | `hundred-doors` | Type P(win by switching) with 100 doors → Check | `answerEntry` | reuse | `fields:[{id,label,accept}]` | input ≥44px; `aria-live` | none | both |
| 8 | `triangulate-23` | Reveal three lenses → converge on 2/3 | `tripletReveal` | reuse | `value:'2/3'`, `lenses:[{label,body}]`, `display:'cards'` | cards ≥44px; `aria-live` | none (tap reveal) | both |
| 9 | `mastery-challenge` | Type P(switch wins) for a **random** "Monty Fall" host → Check (required, before recap) | `masteryChallenge` | reuse | `scenario`, `fields:[{id,label,accept}]` — **no `pattern`** | badge card; input ≥44px; `aria-live` | none | both |
| 10 | `recap` | Reveal the recap → principle + takeaways | `recap` | reuse | `{type:'recap'}` | ≥44px; reduced-motion safe | CSS reveal | both |

**Remaps vs. Dept-1 brief (explicit):**
- Beat 4 `explore-doors`: matches the brief (`bayesUpdate` `display:'bars'` **rendering n = 3**, including
  the **zero-likelihood opened-door bar**). Per wave0 §9, n > 2 uses the non-slider presentation
  (`interactive:false`, posteriors from `bayesPosterior`), and the opened door — `likelihood = 0` →
  `posterior = 0` — renders as a 0-width bar that **keeps its label** ("Opened door"). `hypotheses[0]` is
  the **Switch** door so the cross-check anchor reads 2/3.
- Beat 5 `host-likelihood`: the brief's "[½, 1, 0]" likelihood vector is authored door-by-door (Door 1 =
  your door → ½; Door 2 = switch door → 1; Door 3 = opened → 0) for intuition. Note this is the **same**
  set of likelihoods as `explore-doors`, re-ordered to the natural door numbering; the focal-first
  hypothesis order in `explore-doors` is [switch (L=1), your (L=½), opened (L=0)].
- No other remaps. `compute-23`/`hundred-doors`/`mastery-challenge` reuse `answerEntry`/`masteryChallenge`;
  `triangulate-23` reuses `tripletReveal`; the opener reuses `retrievalGrid`.

## Feedback + hint ladders (actual copy, drawn from Dept-1 misconceptions)

Hint ladder semantics: `hints[0]`=Hint 1 (gentle), `hints[1]`=Hint 2 (misconception refutation), `hints[2]`=Hint 3 =
revealed answer ("Try again" resets). `required` graded beats that reach reveal report `needsReview`.

**1 · `recall-n-update`** — `correct` + `hints[3]`
- correct: "Three hypotheses, same rule: rescale each by its likelihood, then renormalize. The doors will obey it."
- hints: `["From L4: the N-way update is the 2-way rule with more terms.", "Likelihood = how well each hypothesis predicted what you saw.", "Rescale each of the three doors by its likelihood, then divide by the total."]`
- pairs: `"N-hypothesis update (L4)"→"rescale each by its likelihood, then renormalize"`, `"Likelihood (L1)"→"how well a hypothesis predicted the evidence"`

**2 · `open-bet`** — `byOption` (+ fallback `hints`)
- `"Stay — switching is just superstition"` → `{note:"Your door was fixed at 1/3 before the host acted. Switching captures the leftover 2/3.", correct:false}`
- `"Doesn't matter — two doors left, so 50/50"` → `{note:"The two doors aren't symmetric. Your door kept its original 1/3; all the leftover 2/3 funnels onto the single door the host chose to leave closed.", correct:false}`
- `"Switch — it wins more often"` → `{note:"Right — switching wins 2/3 of the time. Let's see why the host's forced hand is the evidence.", correct:true}`
- hints: `["No wrong guess — we'll run the 3-door update.", "Two doors left does NOT mean 50/50 — they aren't symmetric.", "Your door stays 1/3; the leftover 2/3 funnels to the switch door."]`

**3 · `name-the-protocol`** (primer; copy = caption/aria)
- correct: "The **protocol** — the host's rules — sets the likelihood of his action. That's where the evidence lives."
- hints: `["The data isn't 'a goat appeared'; it's *which* door he opened.", "His rules constrain him: forced to open Door 3 (L=1) vs free to (L=½).", "Likelihood of the action comes from the protocol, not from chance."]`
- title: "The protocol sets the likelihood" · body: "The host isn't a coin — he follows rules. The likelihood of 'he opened Door 3' depends on those rules: when the car is behind the *other* live door he's **forced** to open Door 3 (likelihood 1); when it's behind *your* door he opens Door 3 only **half** the time (likelihood ½). The asymmetry between 1 and ½ is the evidence."

**4 · `explore-doors`** (ungraded hero; copy = aria/caption)
- correct: "The host's reveal sends the opened door to 0 and funnels its probability onto the door he left closed: switch = 2/3, your door = 1/3, opened = 0."
- hints: `["Watch all three start at 1/3, then the opened door collapses to 0.", "Your door can't gain from a reveal it didn't cause — it stays 1/3.", "All the freed-up probability lands on the one door the host avoided: 2/3."]`
- `hero.structuralReadout`: "Your door was fixed at 1/3; the host's forced hand funnels the other 2/3 onto the switch door, leaving the opened door at 0 → 2/3."

**5 · `host-likelihood`** — graded `correct` + `hints[3]`
- correct: "P(opens 3 \| car behind 1) = **1/2** (free to open 2 or 3); P(opens 3 \| car behind 2) = **1** (forced — can't open your door or the car); P(opens 3 \| car behind 3) = **0** (never reveals the car). That 1 vs ½ is the whole edge."
- hints: `["Ask: given where the car is, can the host still open Door 3?", "Car behind your door → he has a free choice (½). Car behind Door 2 → he's forced to open 3 (1). Car behind Door 3 → impossible (0).", "[½, 1, 0]."]`
- fields: `{id:"d1", label:"P(host opens Door 3 | car behind Door 1)", accept:["1/2"]}`, `{id:"d2", label:"P(host opens Door 3 | car behind Door 2)", accept:["1"]}`, `{id:"d3", label:"P(host opens Door 3 | car behind Door 3)", accept:["0"]}`

**6 · `compute-23`** — graded `correct` + `hints[3]`
- correct: "Each door's prior is 1/3. Weighted by [½, 1, 0] and renormalized: (1/3·1)/(1/3·½ + 1/3·1 + 1/3·0) = (1/3)/(1/2) = **2/3** for the switch door."
- hints: `["Numerator = prior of Door 2 × its likelihood = 1/3 · 1.", "Denominator = total chance of the reveal = 1/3·½ + 1/3·1 + 1/3·0 = 1/2.", "(1/3)/(1/2) = 2/3."]`
- field: `{id:"switch", label:"P(car behind Door 2 | host opened Door 3)", accept:["2/3"]}`
- `interviewNote` (satisfies the GATED "≥1 interviewNote" rule for L5): "Monty Hall — treating the host's *action* as evidence whose likelihood comes from his protocol — is a canonical Bayes interview question (interview pack `showcase-monty-hall`). The clean framing: your door is fixed at prior odds 1:2 against the car; the host's forced hand transfers the entire 2/3 onto the one door he avoided."

**7 · `hundred-doors`** — graded `correct` + `hints[3]`
- correct: "Your door is 1/100; the host opens 98 goats, **forced** to leave exactly one other door closed → that door holds the other **99/100**. Bigger N makes switching *more* compelling, not less."
- hints: `["Your one pick is right 1/100 of the time — that never changes.", "The host's near-total forcing funnels the remaining 99/100 onto the single door he leaves closed.", "Switch wins 99/100."]`
- field: `{id:"h100", label:"P(win by switching) with 100 doors", accept:["99/100"]}`

**8 · `triangulate-23`** (ungraded reveal)
- correct: "The likelihood table, the enumeration of car positions, and the odds funnel all give **2/3** — not a wording trick."
- hints: `["Reveal each lens.", "They are three roads to the same number.", "All three say 2/3."]`
- lenses: `{label:"Likelihoods", body:"priors 1/3 each × [½, 1, 0], renormalized → [2/3, 1/3, 0]"}`, `{label:"Enumerate", body:"Car is equally likely behind 1, 2, 3; switching wins whenever you first picked a goat — 2 of 3 times"}`, `{label:"Odds", body:"Your door 1/3 vs the rest 2/3; the host funnels the 2/3 onto one door → 2:1 → 2/3"}`

**9 · `mastery-challenge`** — graded `correct` + `hints[3]`
- correct: "If the host opens a door **at random** and it merely *happens* to show a goat, the reveal is equally likely whether the car is behind your door or the other → likelihoods [½, ½, 0] → posteriors [**1/2**, 1/2, 0]. No edge. It was never the goat; it was the host's **intent** that made switching 2/3."
- hints: `["This host doesn't avoid the car — he opens at random and got lucky.", "Now P(reveal | your door) = P(reveal | other door) = ½ — equal likelihoods → no update.", "P(switch wins) = 1/2."]`
- scenario: "Same three doors, you pick Door 1 — but this host opens a remaining door **completely at random** and it *happens* to reveal a goat behind Door 3." · field: `{id:"fall", label:"P(switch wins) when the host opened at random", accept:["1/2"]}`

**10 · `recap`** (generic generate-then-reveal; `correct`=principle, `hints`=takeaways)
- correct: "The host's **action is the evidence**, and its likelihood comes from his **rules**. Run the 3-hypothesis update and the forcing pushes the switch door to 2/3."
- hints: `["A standard host is forced (L=1) when the car is elsewhere, free (L=½) when it's yours — switch wins 2/3.", "A random host who happens to reveal a goat gives no edge — 1/2. Intent, not the goat, is the clue.", "Next up: the exact event you condition on is the whole ballgame."]`

## Definition-of-Ready (per beat)

| beatId | verified+sourced problem | concrete direct-manipulation | instant feedback + 3-level hints | a11y (44px, reduced-motion, aria-live) |
|--------|--------------------------|------------------------------|----------------------------------|----------------------------------------|
| recall-n-update | n/a (recall of L4/L1) ✔ | tap/drag match ✔ | triple ✔ | ✔ (renderer) |
| open-bet | 2/3 (brief table) ✔ | chip pick ✔ | byOption ✔ | ✔ |
| name-the-protocol | n/a (JIT primer) ✔ | tap disclosure ✔ | caption ✔ | ✔ |
| explore-doors | 2/3 ✔ engine (`bayesPosterior`, n=3, 0-bar) | watch 3-bar collapse ✔ | hero readout + caption ✔ | aria-live lists 3 posteriors + final frame ✔ |
| host-likelihood | [½, 1, 0] (GB p.40) ✔ engine | type ×3 ✔ | triple ✔ | ✔ |
| compute-23 | 2/3 ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| hundred-doors | 99/100 (Wikipedia) ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| triangulate-23 | 2/3 ✔ | reveal lenses ✔ | reveal copy ✔ | aria-live ✔ |
| mastery-challenge | 1/2 (Rosenthal "Monty Fall") ✔ engine | type fraction ✔ | triple ✔ | ✔ |
| recap | n/a ✔ | reveal ✔ | principle+takeaways ✔ | ✔ |

## Gate notes (this lesson)
- **GATED inclusivity** (after adding `lesson-bayes-rule-5`): ≥1 primer ✔ (`name-the-protocol`); every `prediction` `byOption` ✔ (`open-bet`); an `interviewNote` ✔ (`compute-23`); first graded beat is the `retrievalGrid` opener ✔ (`recall-n-update`); no `introducesSymbol` tags ⇒ notation-ladder vacuously satisfied.
- **MASTERY_LESSONS**: last beat `recap` ✔; penult `masteryChallenge` `required:true` with **no `pattern`** ✔ (1/2 is a Bayes fraction, not a hitting-time).
- **bayesUpdate cross-check**: `explore-doors` declares `posterior:"2/3"`; the validator recomputes `bayesPosterior(priors, likelihoods)[0]` over the **n = 3** arrays with `likelihoods = [1, 1/2, 0]` (focal = `hypotheses[0]` = Switch door). The zero-likelihood entry is handled by `bayesPosterior` (a `0/1` posterior) — already generic, no validator change (wave0 §9).
