# Artifact Templates

Copy these. Keep them concise and concrete. Every problem/number carries a citation. Model the
prose on the existing exemplar `audits/ideation/agent-1-quant-canon.md`. Each artifact is
synthesized by its owning department lead from that lead's workers' outputs.

---

## 1. Concept Brief — Dept 1 (Curriculum Architect)

`concepts/<slug>/concept-brief.md`

```markdown
# Concept: <Title>  (course-<slug>)

## Green Book anchor
- <concept> — Green Book <chapter/section>, p.<n>  (why this is legitimate to teach)

## One-line promise
<the single transferable idea the whole concept builds>

## Catalog fields  (required — auto-registers the concept in the macro home when seeded)
- **domain:** <e.g. "Probability" | "Combinatorics & Games">
- **domainOrder:** <integer — shelf position; coordinate with existing concepts>
- **order:** <integer — position within the domain>
- **status:** `live` | `coming_soon`
- **tagline:** <one-sentence learner-facing hook, ≤60 chars>
- **accent:** `ch1` | `ch2` | `ch3` | `ch4` | `ch5`  (drives card thumbnail background + CTA color)
- **vizKey:** <math-viz / thumbnail id passed to MathViz for the catalog card>
- **chapters:**

| id | label | accent | lessonIds (ordered) |
|----|-------|--------|---------------------|
| ch-<slug>-1 | <Chapter Name> | ch1 | [lesson-<slug>-1, lesson-<slug>-2] |
| ch-<slug>-2 | <Chapter Name> | ch2 | [lesson-<slug>-3] |

## Lessons (ordered)
| # | lessonId | title | one-line objective | prereqs | glyphKey | vizKey | source anchors |
|---|----------|-------|--------------------|---------|----------|--------|----------------|
| L1 | lesson-<slug>-1 | ... | ... | — | <glyph> | <viz> | GB p.<n> |
| L2 | ... | ... | ... | L1 | <glyph> | <viz> | GB p.<n>, <web source> |

## New engine(s) / widget(s) anticipated (for Wave 0)
- engine: src/engine/<topic>.ts — <what it computes>
- interaction type(s): <name> — <one-liner>

## Learning-science coverage (`learning-science.md` — concept level)
- new `methods.ts` `schemaId`s this concept needs (+ their symmetric `CONFUSABLE` neighbours), for Wave 0
- which-method gates planned (which lessons; which `CONFUSABLE` confusions they drill)
- cross-lesson interleaving / "same method, different costume" pairs (which methods recur across lessons)
- Interview Pack stance: brutal floor + tier-aware rubric + feed-forward report (§3)
```

> ⚠️ **`chapters[]` is the catalog's hard requirement for a LIVE concept.** Every built `lessonId` must
> appear in exactly one chapter's `lessonIds`. The per-concept journey renders lessons **only inside
> chapters** — if `chapters[]` is missing/incomplete it silently falls back to Pattern-Hitting-Times'
> chapters and the new concept's lessons render **invisible**. (Missing `glyphKey`/`vizKey` only degrade
> to a dot / `coin` thumbnail; missing chapters breaks the whole journey.) `accent` is the strict enum
> `ch1`–`ch5`; `vizKey` must be one of: `coin, stateMachine, raceLanes, randomWalk, twoNode, fourNode,
> sum, dice` (else the card shows a text fallback).

---

## 2. Continuity Report — Dept 1 (Corpus Cartographer)

`concepts/<slug>/continuity-report.md` — the existing-corpus overlap survey. Produced **before** the
Concept Brief is finalized; feeds the Architect (no redundant lessons) + Assessment Designer (recall).

```markdown
# Continuity Report — concept-<slug>

## Existing corpus surveyed
- shipped (main + prod `brilliant-org`): <lessonId — 1-line concept> …
- in-dev (open `concept/*` branches + dev `brilliant-org-dev`): <lessonId — concept> …
sources: fixtures/lesson-*.json per branch; Firestore lessons/* + courses/* (dev+prod via Firebase MCP)

## Overlap analysis
| existing lesson/beat | overlapping idea | verdict | action |
|----------------------|------------------|---------|--------|
| lesson-x / beat-y | <shared concept> | reuse-as-recall | open the new lesson with a graded retrieval of it |
| lesson-z | <shared concept> | dedupe | drop the re-teach; reference/link instead |

## Active-recall plan (learning science — inclusive-research-5)
- retrieval warm-ups: <prior headline> → <new beatId>
- interleaving: <confusable pair> → <mixed beatId>
- spaced re-surfacing: <idea> recurs at <gap>
```

---

## 3. Lesson Brief — Dept 1 (synthesized)

`concepts/<slug>/<lesson>/brief.md`

```markdown
# Lesson Brief: <Title>  (lesson-<slug>-N)

## Hook  (the bet)
<the prediction/curiosity opener>

## Core promise (one idea)
<one sentence>

## Display fields  (populate the lesson node in the per-concept path; optional — sane fallbacks)
- **glyphKey:** <short node-dot glyph; free-form string, falls back to `·` — e.g. `HH`, `$`, `Σ`>
- **vizKey:** <card thumbnail; MUST be one of: coin, stateMachine, raceLanes, randomWalk, twoNode,
  fourNode, sum, dice (else falls back to `coin`)>

## Verified problems & answers  (anchor-and-source — REQUIRED)
| problem | answer | source | verified |
|---------|--------|--------|----------|
| <stmt> | <ans> | Green Book p.<n> §<x> | ☐ engine ☐ source |
| <stmt> | <ans> | <web source + url> (GB-anchored to §<x>) | ☐ engine ☐ source |
| **held-out transfer** <fresh-surface stmt> | <ans> | Green Book p.<n> §<x> / sourced quant Q | ☐ engine ☐ source |

> The **held-out transfer problem** (Track-B gold gate, spec-24) is fact-checked
> **identically** to any other problem (☐ source + ☐ engine) — its `accept` is the
> engine's exact output. Same `schemaId` (method) as the mastery challenge, a
> visibly different surface (numbers/objects/framing — never the checkpoint reworded).

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | schemaId | track |
|---|--------|------------------------|---------|--------------------------------|---------|----------|-------|
| 1 | ... | ... | ... | ... | no | — | A/B/both |
| 5 | ... | ... | ... | ... | yes | first-step-analysis | both |
| n-1 | <transfer> | held-out transfer (Track-B gold gate); `heldOut:true required:false` | ... | ... | yes | =mastery challenge's schemaId | B |
...

> **`schemaId` (Foundation B / spec-00) is REQUIRED on every graded beat** — the hidden deep-structure
> METHOD tag from `src/content/methods.ts` (`—` on ungraded beats). `validate-fixtures` enforces a valid
> registry id on every graded beat. **Registry-extension process:** if no existing `METHODS` id fits a
> graded beat, propose a new id (`id`, `name`, `domains`, plus its symmetric `CONFUSABLE` near-misses) as
> a **Wave-0 addition to `src/content/methods.ts`**, reviewed by the Dept-3 Schema/Types Specialist with
> the schema freeze. **Never put an unregistered string on a beat** — ids are persisted on review cards
> and are permanent.

## Misconceptions (Specialist)
- <wrong model> → where it fires → refutation copy (per-option)

## Assessment + continuity + learning science (Designer + Cartographer — `learning-science.md` §2)
- retrieval opener (COLD — not a primer; worked solution gated behind an attempt): <which prior headline — from the Continuity Report>
- guaranteed early win: <which beat>
- **which-method gate (spec-13 / §2.2):** <beatId> — graded `prediction.gate`, `gate.correct` = <MethodId>
  (== the beat's `schemaId`), `optionMethods` = [<correct> + distractors from `CONFUSABLE[correct]`],
  label-stripped prompt
- **confidence checkpoint (spec-02/12 / §2.4):** <which graded checkpoint(s) confidence rides on — mastery
  challenge and/or the gate>; opening bet stays an ungraded `prediction` (no `gate`)
- mastery challenge (required, before recap): <problem + pattern>
- held-out transfer (Track-B gold gate, spec-24): <fresh-surface problem, SAME schemaId as the mastery
  challenge> — authored `required:false, track:'B', heldOut:true`, placed **immediately before** the
  mastery challenge (so the `(masteryChallenge, recap)` ending invariant holds), engine-verified.
- **"same method, different costume" comparison (§2.7):** <retrievalGrid/compare beatId — two surfaces, one schemaId>
- spacing/interleaving: <what re-surfaces — from the Continuity Report; foils from `CONFUSABLE`, not random>
- **difficulty-band / assist (spec-21 / §2.6):** every capped graded beat has an `assist`/`hintCapOverride`
  path + a `density` flag; authored for ~50–85% success (never floored below ~50%)
- **feedback (§2.9):** per-option (`byOption`) refutational; feed-forward / task-level; no person-verdict
```

---

## 4. Interaction Spec — Dept 2

`concepts/<slug>/<lesson>/interaction-spec.md`

```markdown
# Interaction Spec: <Title>

| # | beatId | mechanic (manipulate → respond → loop) | interaction type | reuse or NEW | feedback + hints | a11y | visual/motion | track |
|---|--------|----------------------------------------|------------------|--------------|------------------|------|---------------|-------|
| 1 | ... | ... | prediction | reuse | byOption ... | tap 44px | — | both |
| 5 | ... | ... | <newType> | NEW | per-slot ... | aria-live | hero | A |

## New interaction types (for Wave 0)
- `<newType>` — schema shape: { ... } — renderer: <Beat>.tsx — engine dep: <topic>.ts

## Build decomposition (Technical Planner — for Dept 3)
- engine: <fn signatures + goldens>
- schema: <Zod variant>
- renderer/widget: <component + props>
- fixture: <fields used>

## Definition-of-Ready checklist (every beat)
- [ ] verified+sourced problem
- [ ] concrete interactive mechanic (real direct-manipulation)
- [ ] instant feedback + 3-level hints designed
- [ ] a11y (44px, reduced-motion, aria-live) covered
- [ ] graded beats carry a `schemaId`; capped graded beats carry an `assist`/`hintCapOverride` path + `density`

## Lesson-level learning-science checklist (`learning-science.md` §6 — must all hold)
- [ ] cold-retrieval opener; worked solution gated behind an attempt
- [ ] a which-method gate (`prediction.gate`, `correct == schemaId`, `CONFUSABLE` distractors, label-stripped)
- [ ] a held-out transfer problem (`heldOut:true track:'B' required:false`, same schemaId as the mastery challenge, fresh surface)
- [ ] ≥1 cold graded checkpoint confidence rides on; opening bet stays ungraded (no `gate`)
- [ ] a "same method, different costume" comparison; overlaps → recall, foils from `CONFUSABLE` not random
- [ ] thin worked-example on-ramp for first contact, faded fast; feed-forward, no person-verdict feedback
```

---

## 5. Implementation Brief — Dept 3 (Feature-Brief Drafter)

`concepts/<slug>/<lesson>/implementation-brief.md`

```markdown
# Implementation Brief: <Title>

## Files
- src/engine/<topic>.ts (+ <topic>.test.ts goldens)
- src/content/schema.ts — add `<newType>` variant (Wave 0)
- src/lesson/beats/<Beat>.tsx (+ src/lesson/beats/index.tsx dispatcher entry)
- src/lesson/konva/<Widget>.tsx (if canvas)
- fixtures/lesson-<slug>-N.json
- e2e/<slug>.spec.ts

## Contracts (frozen in Wave 0)
- engine: `function <name>(...): <type>`
- schema: `<newType>` = { ... }
- method tags: every graded beat in the fixture carries a `schemaId` (a valid `src/content/methods.ts`
  id; Foundation B / spec-00) — any new registry id is frozen here in Wave 0 by the Schema/Types Specialist

## Parallel split
- Coder A: engine + goldens
- Coder B: renderer + widget + fixture + dispatcher
- Test Author: unit + e2e

## Acceptance
- validate-fixtures / vitest / build / lint / e2e all green (exact binaries in `qa-rubric.md`)
- engine reproduces every answer in the Lesson Brief
```

---

## 6. QA Scorecard — QA (per lesson)

`concepts/<slug>/<lesson>/scorecard.md`. This is what the Manager surfaces to the user. Gates and
pass conditions are defined in `qa-rubric.md`.

```markdown
# Scorecard: <Title>  (lesson-<slug>-N)

| # | gate | owner | status | evidence |
|---|------|-------|--------|----------|
| 1 | Source fidelity | Dept 1 | ✅ | all problems cited (see brief table) |
| 2 | Math correctness | Dept 3 Verify | ✅ | engine reproduces 6,4,8,10; `validate` green |
| 3 | Learning science / efficiency | Dept 1 | ✅ | Bet→Explore→Model→Prove; load budget |
| 4 | Misconceptions | Dept 1 | ✅ | per-option refutations present |
| 5 | Interactivity | Dept 2 | ✅ | every beat direct-manipulation |
| 6 | Assessment / mastery / continuity | Dept 1 | ✅ | retrieval opener, early win, mastery challenge; Continuity Report: overlaps → recall, no re-teach |
| 7 | Accessibility & mobile | Dept 2 | ✅ | 44px, reduced-motion, aria-live |
| 8 | Technical implementation | Dept 3 | ✅ | validate/test/build/lint/e2e green; surgical diff |
| 9 | Inclusivity gate | Dept 3 Verify | ✅ | validate-fixtures inclusivity + mastery gates pass |

**Overall:** READY / NOT READY — <one-line>
```
