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

## Beat-by-beat plan  (Bet → Explore → Model → Prove)
| # | beatId | intent (one objective) | teaches | misconception elicited/refuted | graded? | track |
|---|--------|------------------------|---------|--------------------------------|---------|-------|
| 1 | ... | ... | ... | ... | no | A/B/both |
...

## Misconceptions (Specialist)
- <wrong model> → where it fires → refutation copy (per-option)

## Assessment + continuity (Designer + Cartographer)
- retrieval opener: <which prior headline — from the Continuity Report>
- guaranteed early win: <which beat>
- mastery challenge (required, before recap): <problem + pattern>
- spacing/interleaving: <what re-surfaces — from the Continuity Report>
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
