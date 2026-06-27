# Lesson Factory — Binary & Information — RUN STATUS

Concept: **Binary & Information** (`course-binary-information`), fresh 6-lesson build.
Worktree: `/Users/ericwu/Developer/lf-binary-information` (branch `concept/binary-information`, off committed `main` ef47403).
AUTOSHIP_TO_PROD = **false** → build → QA → dev-smoke → STOP for explicit "ship it".

## Build contract (committed `main` baseline — NOT the dirty main checkout)
- **NO `schemaId` / `MethodId` / `src/content/methods.ts`** — none exist in committed schema. Graded beats carry no method tag.
- **NO `heldOut` field** in committed BeatSchema. Transfer beats = `track:'B' required:false answerEntry` placed before the mastery challenge.
- Pure EXACT engine, no floats (bigint / {n,d} rationals).
- Green Book read from `/Users/ericwu/Developer/brilliant.org/references/green-book.txt`; schema/code from this worktree.

## Locked Manager decisions (Stage 1 arbitration)
1. domain `Algorithms & Information`, domainOrder 2, order 0, status live.
2. course card accent `ch5`; **chapter accents ch1/ch2/ch3** (ChapterHue/Konva hex only defines ch1-ch4).
3. vizKey `sum` (reuse, no new MathViz). Per-lesson viz: L1-3,L6 `sum`; L4 `dice`; L5 `coin`.
4. NEW interaction types: `bitBoard` (display register|questions|groupTest), `weighing` (display scale|ternary). Ungraded, engine-anchored `headline`, NOT in GRADED_TYPES/HERO_TYPES.
5. Engine `src/engine/binary.ts`. Gold rod = 2 cuts → pieces 1,2,4.
6. tagline "Every number is bits — and bits are information." (47 chars).

## Lessons + chapters
- ch-binary-information-1 "Numbers as Bits" (ch1) → L1, L2
- ch-binary-information-2 "Tests as Information" (ch2) → L3, L4
- ch-binary-information-3 "Bit Tricks & Synthesis" (ch3) → L5, L6
- L1 Every Number Is Bits · L2 Bits as Information · L3 Group Testing (Poisoned Wine) · L4 The Scale Speaks Base-3 · L5 Bit Tricks · L6 Encoding the Answer

## Wave-0 wiring checklist (or gates pass vacuously / break)
- [ ] schema: add `bitBoard` + `weighing` variants to InteractionSchema; dispatcher cases in beats/index.tsx
- [ ] engine `src/engine/binary.ts` + goldens; validate-fixtures headline cross-check for the 2 new types
- [ ] add 6 lessonIds to GATED + MASTERY_LESSONS in scripts/validate-fixtures.ts
- [ ] add 6 lessons to chapters.ts LESSON_CHAPTER (ch1/ch2/ch3) — verify necessity
- [ ] course doc fixtures/course-binary-information.json (catalog fields + chapters covering all 6)

## FROZEN engine interface (src/engine/binary.ts — 42/42 goldens green)
toBinary · fromBinary · powersOfTwo(largest-first) · popcount · isPowerOfTwo · isPowerOfFour · xorAll · missingNumber · multiplyByShift · bitsNeeded(⌈log₂N⌉; 1→0) · weighingsForN(N,directionKnown) · bachetWeights · eggDrops · binaryExpansion
- GAP to add in build: `balancedTernary(n)` for L4 transfer (weigh 22 with {1,3,9,27} = 27−9+3+1).
- COPY rule: L4 uses GB5 "locate the defective" framing — weighingsForN(N,false)=(3ⁿ−3)/2 → 12→3, 13→4 (NOT the 13-coins+identify-direction variant).
- L5 mastery = S11 Single Number (XOR). S18 reverse-bits DROPPED (no reliable golden).

## Toolchain (worktree)
- node_modules + .env.dev symlinked from parent (same commit ef47403; both gitignored). All gates run via ./node_modules/.bin/* in the worktree.

## Pipeline progress
- [x] Stage 0 Preflight (nested-spawn ✅, creds ✅, OPENAI secret set on dev+prod ✅, worktree off ef47403)
- [x] Stage 1 Plan (Dept 1): concept-brief / continuity-report / source-dossier — DONE, GB anchors verified
- [x] Stage 2a Design briefs (Dept 1): 6 per-lesson brief.md, 10 beats each, gate-compliant — DONE
- [x] Engine (Dept 3): src/engine/binary.ts + 42 goldens — DONE & GREEN; interface frozen above
- [x] Course doc: fixtures/course-binary-information.json — DONE, CourseSchema-validated, chapters cover all 6
- [x] Stage 2b Design specs (Dept 2): 6 interaction-spec.md; bitBoard/weighing shapes frozen; DoR holds all 60 beats
- [x] Stage 3 Wave 0 + renderers (Dept 3): balancedTernary (47 goldens) · schema variants verbatim · dispatcher · BitBoardBeat+WeighingBeat+CSS · validate §2e/§3f active+✓ · GATED/MASTERY · chapters.ts. tsc no-new-errors; eslint clean. NOTE: validate-fixtures §7 RED until the 6 fixtures land (expected; gate not weakened, course doc untouched).
- [~] Stage 4 Build: 6 fixtures + factcheck tests — Workflow wf_f54d8e9d-c6c RUNNING (6 Sonnet authors, self-verifying)
- [x] Stage 5b Interview Pack — DONE & GREEN: interviews/course-binary-information.{json,md}, 88 Qs (hard33/harder30/brutal25), recomputeBinary added, validate-interview-packs 88/88 ✓ exit0, leak test 2/2. (Pre-existing old-pack breakage NOT present on this baseline.)
- [ ] Stage 5 QA: 6 scorecards (9 gates) — after full validate-fixtures green
- [ ] MANAGER FINAL GATE (run after fixtures land): validate-fixtures (full, incl §7) · vitest run (baseline: 57 pre-existing interviewPack.bayes fails, NOT ours) · tsc -b (no new) · eslint new files · vite build
- [ ] Stage 6 Dev smoke (brilliant-org-dev) + capped mint smoke (dev secret IS set)
- [ ] Stage 7 STOP → present everything, await "ship it"
