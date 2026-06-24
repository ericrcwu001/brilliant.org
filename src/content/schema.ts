// Content data contracts: Zod schemas + inferred types for lessons, beats,
// interactions, feedback, and the persistence documents. These mirror the
// "Data Contracts Appendix" in docs/mvp_prd.md and are validated against every
// committed fixture before use (see scripts/validate-fixtures.ts).
//
// Engine-shaped pieces (StateId, Rational, CanonicalRecurrence, Tile,
// EquationRow, SubstitutionStep) are defined here as Zod schemas; their plain
// TypeScript counterparts live in src/engine/types.ts (which must stay
// dependency-free). The cross-check test in this folder asserts the engine's
// generated recurrences equal the fixture's tile targets, catching drift.

import { z } from 'zod'

export const StateIdSchema = z
  .string()
  .regex(/^E\d+$/, 'StateId must look like E0, E1, ...')

export const RationalSchema = z.object({
  n: z.number().int(),
  d: z.number().int().positive(),
})

export const CanonicalRecurrenceSchema = z.object({
  lhs: StateIdSchema,
  constant: z.number(),
  terms: z.array(
    z.object({
      coeff: RationalSchema,
      var: StateIdSchema,
    }),
  ),
})

export const TileSchema = z.discriminatedUnion('kind', [
  z.object({ id: z.string(), kind: z.literal('state'), value: StateIdSchema }),
  z.object({
    id: z.string(),
    kind: z.literal('prob'),
    value: z.enum(['1/2', 'p', '1-p']),
  }),
  z.object({ id: z.string(), kind: z.literal('const'), value: z.number() }),
  z.object({
    id: z.string(),
    kind: z.literal('op'),
    value: z.enum(['+', '-', '=']),
  }),
])

export const EquationRowSchema = z.object({
  lhs: StateIdSchema,
  target: CanonicalRecurrenceSchema,
  graded: z.boolean(),
})

export const SubstitutionStepSchema = z.object({
  display: z.string(),
  substitute: StateIdSchema,
  resultValue: z.number().optional(),
})

const TransitionRefSchema = z.object({
  from: StateIdSchema,
  on: z.enum(['H', 'T']),
})

export const InteractionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('prediction'), options: z.array(z.string()) }),
  z.object({
    type: z.literal('patternPick'),
    patterns: z.array(z.string()),
    mode: z.enum(['single', 'compare']),
  }),
  z.object({
    type: z.literal('coinSim'),
    mode: z.enum(['free', 'guidedReplay']),
    gate: z
      .union([z.literal('near-miss'), z.object({ minFlips: z.number() })])
      .optional(),
  }),
  z.object({
    type: z.literal('stateTap'),
    transitions: z.array(TransitionRefSchema),
  }),
  z.object({
    type: z.literal('equationTiles'),
    bank: z.array(TileSchema),
    rows: z.array(EquationRowSchema),
  }),
  z.object({
    type: z.literal('slider'),
    min: z.number(),
    max: z.number(),
    step: z.number(),
  }),
  z.object({
    type: z.literal('substitution'),
    steps: z.array(SubstitutionStepSchema),
  }),
  z.object({
    type: z.literal('overlap'),
    highlight: z.array(TransitionRefSchema),
  }),
  z.object({ type: z.literal('theorySimChart') }),
  z.object({ type: z.literal('recap') }),
])

const HintTripleSchema = z.tuple([z.string(), z.string(), z.string()])

const FeedbackTripleSchema = z.object({
  correct: z.string(),
  hints: HintTripleSchema,
})

export const FeedbackSchema = z.union([
  FeedbackTripleSchema,
  z.object({ byPattern: z.record(z.string(), FeedbackTripleSchema) }),
])

export const BeatSchema = z.object({
  beatId: z.string(),
  required: z.boolean(),
  prompt: z.string(),
  interaction: InteractionSchema,
  feedback: FeedbackSchema,
  maxHintLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
})

export const LessonSchema = z.object({
  lessonId: z.string(),
  courseId: z.string(),
  title: z.string(),
  patternOptions: z.array(z.string()),
  beats: z.array(BeatSchema),
  milestoneId: z.string(),
  unlocks: z.string().nullable(),
  schemaVersion: z.number(),
})

// courses/{courseId} — seeded course metadata + ordered path. `lessons` is the
// built/unlock-ordered path (a node may be `built: false` when its lesson
// fixture isn't authored yet, so it has no lessons/{lessonId} doc); `roadmap`
// is the visible-but-not-built stubs after the MVP path.
const CourseLessonNodeSchema = z.object({
  lessonId: z.string(),
  title: z.string(),
  summary: z.string(),
  milestoneId: z.string(),
  built: z.boolean(),
})

const CourseRoadmapNodeSchema = z.object({
  lessonId: z.string(),
  title: z.string(),
  summary: z.string(),
})

export const CourseSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  description: z.string(),
  persona: z.string(),
  lessons: z.array(CourseLessonNodeSchema),
  roadmap: z.array(CourseRoadmapNodeSchema),
  completionMilestoneId: z.string(),
  schemaVersion: z.number(),
})

// users/{uid}/snapshots/{lessonId} — client-written, authoritative for restore.
// `equationTiles` values are per-slot token arrays that may contain nulls for
// not-yet-filled slots, so an in-progress build round-trips exactly on restore.
export const SnapshotSchema = z.object({
  lessonId: z.string(),
  beatId: z.string(),
  pattern: z.string().nullable().optional(),
  completedBeats: z.array(z.string()),
  interactionState: z
    .object({
      equationTiles: z
        .record(z.string(), z.array(z.string().nullable()))
        .optional(),
      prediction: z.unknown().optional(),
      hintLevelByBeat: z.record(z.string(), z.number()).optional(),
    })
    .loose(),
  updatedAt: z.string(),
  schemaVersion: z.number(),
})

// users/{uid}/progress/{lessonId} — Cloud-Function-written read cache for the
// course path. Completion/mastery/unlock fields are trusted (Functions only);
// the client reads this doc to render node state. Server timestamps and the
// derived-field block are intentionally loose (Timestamps arrive as objects).
export const ProgressDerivedSchema = z
  .object({
    initialPrediction: z.union([z.string(), z.number()]).nullable().optional(),
    finalPrediction: z.number().nullable().optional(),
    empiricalMean: z.number().nullable().optional(),
    theoreticalValue: z.number().nullable().optional(),
    predictionDeltaInitial: z.number().nullable().optional(),
    simRuns: z.number().nullable().optional(),
    transferAttained: z.boolean().optional(),
  })
  .loose()

export const ProgressSchema = z.object({
  currentBeat: z.string().optional(),
  completionStatus: z.enum(['in_progress', 'completed']).optional(),
  masteryStatus: z.enum(['not_mastered', 'mastered']).optional(),
  needsReview: z.boolean().optional(),
  completedBeats: z.array(z.string()).optional(),
  attemptsByBeat: z.record(z.string(), z.number()).optional(),
  derived: ProgressDerivedSchema.optional(),
  unlocks: z.string().nullable().optional(),
  unlockedBy: z.string().optional(),
  // Firestore server timestamps deserialize to Timestamp objects, not strings.
  unlockedAt: z.unknown().optional(),
  completedAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
  schemaVersion: z.number().optional(),
})

export type CanonicalRecurrence = z.infer<typeof CanonicalRecurrenceSchema>
export type Tile = z.infer<typeof TileSchema>
export type EquationRow = z.infer<typeof EquationRowSchema>
export type SubstitutionStep = z.infer<typeof SubstitutionStepSchema>
export type Interaction = z.infer<typeof InteractionSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type Beat = z.infer<typeof BeatSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Course = z.infer<typeof CourseSchema>
export type Snapshot = z.infer<typeof SnapshotSchema>
export type Progress = z.infer<typeof ProgressSchema>
export type ProgressDerived = z.infer<typeof ProgressDerivedSchema>
