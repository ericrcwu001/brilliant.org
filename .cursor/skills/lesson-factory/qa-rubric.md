# QA: Fact-Check + Definition of Done

The Manager signs off a lesson only when **both** the two-stage fact-check **and** all **9 Scorecard
gates** are green. This rubric **extends** `docs/beat-audit-rubric.md` (the existing Bet→Explore→
Model→Prove / P1–P5 rubric) — do not invent a parallel one.

## Two-stage fact-check (hard gate — nothing ships without both)

**Stage 1 — Source (anchor-and-source).** Owner: Dept 1 Source Miner.
- The **concept** is anchored to a Green-Book concept, cited (`references/green-book.txt`,
  chapter/section/page).
- **Every problem** is either a Green-Book problem (cited) **or** a similar quant-interview question
  found by search **with its source recorded**. No invented/unsourced problems.
- The source's **stated answer** is recorded in the Lesson Brief problem table.

**Stage 2 — Math (independent reproduction).** Owner: Dept 3 Verification.
- The lesson's **engine** (`src/engine/<topic>.ts`, pure/exact/no floats) **independently computes**
  each answer and it matches the source's stated answer.
- `validate-fixtures` cross-checks the fixture's targets against the engine (extend
  `scripts/validate-fixtures.ts` for new interaction/engine types as needed).

A number is "true" only when the source states it **and** the engine reproduces it.

## The 9 Scorecard gates

| # | Gate | Owner | Pass condition |
|---|------|-------|----------------|
| 1 | **Source fidelity** | Dept 1 Source Miner | Concept anchored to GB; every problem cited+sourced (Stage 1). |
| 2 | **Math correctness** | Dept 3 Verification | Engine reproduces every answer; `validate-fixtures` green (Stage 2). |
| 3 | **Learning science / efficiency** | Dept 1 Architect | Bet→Explore→Model→Prove arc; one objective per beat; cognitive-load budget respected; concreteness-fading; no symbol before its referent. |
| 4 | **Misconceptions** | Dept 1 Misconception Spec | Each key wrong model is elicited + refuted; predictions use per-option (`byOption`) feedback. |
| 5 | **Interactivity** | Dept 2 Pedagogy-Fit + UX | Every beat is genuine direct-manipulation that embodies the idea — no text walls, no fake reveals. |
| 6 | **Assessment, mastery & continuity** | Dept 1 Assessment + Corpus Cartographer | Retrieval opener; guaranteed early win (first graded beat isn't the hardest type); required mastery challenge before the recap; spacing/interleaving present. **Continuity Report shows no redundant re-teaching vs the existing corpus (shipped + in-dev), and every conceptual overlap is turned into deliberate recall / spaced review / interleaving** (`inclusive-research-5`). |
| 7 | **Accessibility & mobile** | Dept 2 A11y | 44px tap-only paths; reduced-motion renders a final frame; `aria-live` mirrors; keyboard/screen-reader OK. |
| 8 | **Technical implementation** | Dept 3 Verify + Reviewer | `validate-fixtures` + `test` + `build` + `lint` + `e2e` all green; diff is surgical (`AGENTS.md`); uses design tokens. |
| 9 | **Inclusivity gate** | Dept 3 Verification | The mechanized `validate-fixtures` inclusivity + mastery-challenge gates pass for the new lesson (add it to the gate sets). |

## Mechanized checks (run by the Verification Engineer)

Call binaries directly — **`npm run` is broken in this repo** (npm 11 + bash 3.2). See `HANDOFF.md`.

```bash
./node_modules/.bin/tsx scripts/validate-fixtures.ts   # schema + engine cross-check + inclusivity + mastery gates
./node_modules/.bin/vitest run                         # engine goldens + unit
./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build   # type-check + production build
./node_modules/.bin/eslint .                           # lint
./node_modules/.bin/playwright test                    # e2e lesson flow
```

Plus an explicit **engine-vs-source** assertion in the engine's golden test: each answer from the
Lesson Brief problem table is reproduced by the engine at exact rational values.

## When a gate is red

- Route the failure to the **owning department**, re-run that stage, re-score.
- The Dept1↔Dept2 loop self-resolves design gates (3–7); Dept 3 fixes 2/8/9.
- Unresolvable conflict → **Manager** arbitrates; genuine scope/product question → **user**.

## Concept-level readiness

A **concept** is ready to alert the user only when **every** lesson's Scorecard reads READY. The
Manager assembles a one-screen concept summary (lesson list + each lesson's 9/9 + the headline
citations + the engine cross-check) for the Slack DM.
