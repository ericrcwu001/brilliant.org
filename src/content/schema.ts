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
  // Track-A staged reveal (L1 §4.6): when true the row renders "faded" with
  // every slot but the final term pre-filled, so the learner completes only the
  // last piece. Default (absent) = a fully-empty build row (today's behavior).
  faded: z.boolean().optional(),
  // Fixture-authored note for a non-graded (e.g. absorbing) row, de-hardcoding
  // the previously HH-specific "Absorbing state…" copy.
  note: z.string().optional(),
})

// Fixture-authored copy for the equation-tiles beat, de-hardcoding the
// previously HH-specific strings (E0 explanation, legend, tooltips, per-mistake
// hints) so other patterns (L2–L6) can reuse the beat. All fields optional: the
// component falls back to its generic defaults, keeping HH behavior unchanged.
export const EquationCopySchema = z.object({
  workedExplanation: z.string().optional(),
  termTips: z.record(z.string(), z.string()).optional(),
  tokenTips: z.record(z.string(), z.string()).optional(),
  legend: z.array(z.object({ id: StateIdSchema, text: z.string() })).optional(),
  // The legend's lead line. Defaults to the HH "expected extra flips" gloss;
  // walk/probability tiles (L3) override it so the symbol gloss isn't misleading.
  legendLead: z.string().optional(),
  // Per-mistake [level-1, level-2] hint copy; overrides the generic module copy.
  mistakeHints: z.record(z.string(), z.tuple([z.string(), z.string()])).optional(),
  // Collapsed "variable" primer card shown above the build (Track A).
  primer: z.object({ title: z.string(), body: z.string() }).optional(),
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
    // Optional per-pattern near-miss preview copy (L1 interactivity upgrade,
    // cycle-1 P-1 option 3). When present each card becomes a tap target that
    // reveals its pattern's near-miss one-liner; absent => passive cards (today's
    // behavior, e.g. L5).
    previews: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    type: z.literal('coinSim'),
    mode: z.enum(['free', 'guidedReplay']),
    gate: z
      .union([z.literal('near-miss'), z.object({ minFlips: z.number() })])
      .optional(),
    // Track-A gambler's-fallacy refutation, surfaced once a run of >=3 same-face
    // flips appears (L1 §4.3). Fixture-authored; falls back to a default line.
    gamblerNote: z.string().optional(),
  }),
  z.object({
    type: z.literal('stateTap'),
    transitions: z.array(TransitionRefSchema),
  }),
  z.object({
    type: z.literal('equationTiles'),
    bank: z.array(TileSchema),
    rows: z.array(EquationRowSchema),
    copy: EquationCopySchema.optional(),
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
    type: z.literal('balanceSolve'),
    // The state whose expected wait is solved by balancing (default 'E0').
    solveState: StateIdSchema.optional(),
    // Inclusive integer domain for the adjustable candidate weight.
    min: z.number(),
    max: z.number(),
    step: z.number().optional(), // default 1
  }),
  z.object({
    type: z.literal('overlap'),
    highlight: z.array(TransitionRefSchema),
  }),
  z.object({ type: z.literal('theorySimChart') }),
  z.object({ type: z.literal('recap') }),
  // JIT primer: a tiny tap micro-interaction that names a prerequisite before it
  // bites (L1 §3.2). Never graded, never required; collapsible on Track B.
  z.object({
    type: z.literal('primer'),
    variant: z.enum([
      'half',
      'average',
      'state',
      'exponent',
      'transitivity',
      // Dual-label state-graph explainer (state-graph-explainer-brief.md): a
      // static mini-graph + annotated key that pre-teaches the graph before
      // the simulate beat (Track A only).
      'graph',
      // L3 misconception refutation (proposed §2.4): "after 3 losses you are NOT
      // due for a win." A named variant so validate-fixtures can assert L3 carries
      // it (rather than only testing structural presence).
      'gamblersFallacy',
      'custom',
    ]),
    body: z.string(),
    title: z.string().optional(),
    collapsible: z.boolean().optional(),
  }),
  // Graded type-in answer (replaces the single-select mcq). One or more short
  // free-entry fields graded against a normalized accept-list, run through the
  // hint ladder like other graded beats. Tap/keyboard-native, no motion.
  z.object({
    type: z.literal('answerEntry'),
    fields: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        accept: z.array(z.string()),
        placeholder: z.string().optional(),
        suffix: z.string().optional(),
      }),
    ),
  }),
  z.object({
    type: z.literal('masteryChallenge'),
    scenario: z.string().optional(),
    fields: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        accept: z.array(z.string()),
        placeholder: z.string().optional(),
        suffix: z.string().optional(),
      }),
    ),
  }),
  // ── Remaining-lesson widget variants (build-brief §4.4). Each maps 1:1 to a
  // new beat view in beats/index.tsx. Engine inputs that are a single pattern
  // come from the beat-level `pattern` field (below); only inputs that aren't a
  // single pattern (race pairs, walk N/p, retrieval pairs, lens copy) live here.
  //
  // L2 Penney's: two patterns race on one shared stream. `display` folds the
  // RaceTrack / OddsDial / TournamentHeatmap presentations of one race.
  z.object({
    type: z.literal('raceSim'),
    patterns: z.tuple([z.string(), z.string()]).optional(),
    trials: z.number().optional(),
    display: z.enum(['lanes', 'oddsDial', 'heatmap']).optional(),
  }),
  // L2 non-transitive cycle (the "every pattern has a beater" radial).
  z.object({
    type: z.literal('dominanceWheel'),
    patterns: z.array(z.string()).optional(),
  }),
  // L3 Gambler's Ruin walk. `display` folds the single-walker / swarm /
  // ruin-landscape / duration-histogram presentations of one walk model.
  z.object({
    type: z.literal('walkBoard'),
    n: z.number().optional(),
    p: z.number().optional(),
    start: z.number().optional(),
    interactive: z.boolean().optional(),
    display: z
      .enum(['single', 'swarm', 'landscape', 'histogram'])
      .optional(),
  }),
  // L6 martingale ledger (money-in/out converge before E[T]=Σ2^L). Pattern from
  // the beat-level `pattern` field; always fair-coin.
  z.object({ type: z.literal('gamblerLedger') }),
  // L4/L6 Σ2^L tile builder. Chips derive from the beat-level `pattern`'s
  // self-overlap lengths; running sum snaps to the closed form.
  z.object({ type: z.literal('sumTiles') }),
  // L5/L6 self-overlap ruler. Slides the beat-level `pattern` over itself; the
  // concrete 2^L total leads, binary/Conway forms relegate to the interview note.
  z.object({ type: z.literal('autocorrelationRuler') }),
  // L4/L6/opener matching grid (graded). Left↔right pairs in correct order; the
  // widget shuffles for presentation. Distinct from single-select `mcq`.
  z.object({
    type: z.literal('retrievalGrid'),
    pairs: z.array(z.object({ left: z.string(), right: z.string() })),
  }),
  // L4 tripletReveal / L6 TriangulationStrip: three lenses converging on one
  // value, predict-then-reveal. `display` picks cards (L4) vs an axis (L6).
  z.object({
    type: z.literal('tripletReveal'),
    value: z.string(),
    lenses: z.array(z.object({ label: z.string(), body: z.string() })),
    display: z.enum(['cards', 'axis']).optional(),
  }),
  // Bayesian belief update (concept-bayes-rule, Wave 0). One new type, three
  // presentation displays (the codebase convention where `raceSim` folds
  // lanes/oddsDial/heatmap and `walkBoard` folds single/swarm/...):
  //   'bars'     — drag the prior split, pick the evidence, watch the 2-hypothesis posterior bar swing.
  //   'tree'     — natural-frequency icon array / confusion split the learner partitions; posterior = highlighted ÷ total.
  //   'sequence' — apply the evidence repeatedly; the posterior climbs, snapping to the exact rational each step.
  // All inputs are exact rationals (RationalSchema). The renderer computes every
  // displayed value via src/engine/bayes.ts; `posterior` is the engine-reproducible
  // headline (validation anchor) cross-checked by scripts/validate-fixtures.ts.
  z.object({
    type: z.literal('bayesUpdate'),
    display: z.enum(['bars', 'tree', 'sequence']),
    // Hypothesis labels. bars/sequence: focal = hypotheses[0]. tree: [positive-class, negative-class].
    hypotheses: z.array(z.string()).min(2),
    // Prior over the hypotheses (aligned to `hypotheses`). bars [1/2,1/2]; tree [prevalence, 1-prevalence];
    // sequence [rare, 1-rare]. Optional in Zod; required-where-needed is enforced in validate-fixtures.
    priors: z.array(RationalSchema).optional(),
    // P(evidence | each hypothesis), aligned to `hypotheses`. bars [1, 1/2];
    // tree [sensitivity, 1-specificity]; sequence the per-observation [pH, pNotH].
    likelihoods: z.array(RationalSchema).optional(),
    // Label of the single observed evidence, e.g. "heads", "a positive test".
    evidence: z.string().optional(),
    // tree only: icon-array size (3 for the equal-likelihood head tap; 10000 for the confusion grid).
    population: z.number().int().positive().optional(),
    // sequence only: how many identical observations to fold (the k the posterior climbs to).
    steps: z.number().int().positive().optional(),
    // The learner manipulates inputs (drag/partition) vs. a passive watch.
    interactive: z.boolean().optional(),
    // Engine-reproducible headline posterior as a reduced "n/d" (or integer) string — the validation anchor.
    posterior: z.string().optional(),
  }),
])

const HintTripleSchema = z.tuple([z.string(), z.string(), z.string()])

const FeedbackTripleSchema = z.object({
  correct: z.string(),
  hints: HintTripleSchema,
})

export const FeedbackSchema = z.union([
  FeedbackTripleSchema,
  z.object({ byPattern: z.record(z.string(), FeedbackTripleSchema) }),
  // Per-option refutation for an (ungraded) prediction beat (L1 §3.1): keyed by
  // the exact option string. `hints` (optional) backs the idle/caption copy.
  z.object({
    byOption: z.record(
      z.string(),
      z.object({ note: z.string(), correct: z.boolean().optional() }),
    ),
    hints: HintTripleSchema.optional(),
  }),
])

export const BeatSchema = z.object({
  beatId: z.string(),
  required: z.boolean(),
  prompt: z.string(),
  interaction: InteractionSchema,
  feedback: FeedbackSchema,
  maxHintLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  // Two-track gate (L1 §3.3). Which track renders this beat; default (absent) =
  // 'both'. Track-exclusive beats MUST be `required: false` so the Cloud
  // Function's required-beat check (which sees the full fixture) still passes.
  track: z.enum(['A', 'B', 'both']).optional(),
  // Render density for CoinSim/EquationTiles by track; default (absent) = 'merged'.
  density: z.enum(['split', 'merged']).optional(),
  // ── Remaining-lesson contract fields (build-brief §4.3/§4.4). All optional and
  // additive; flagship/L0 fixtures are unaffected.
  //
  // The active engine pattern this beat operates on (L5/L6 are multi-pattern, so
  // it can't always be patternOptions[0]). validate-fixtures cross-checks
  // equationTiles/sumTiles/ruler beats against buildAutomaton(pattern ??
  // patternOptions[0]). Engine-driven race/walk beats keep patternOptions[0] a
  // valid H/T placeholder and build their own model.
  pattern: z.string().optional(),
  // "Watch it resolve" hero (proposed §2.8): one slow paced instance before any
  // swarm; one plain structural number; reduced-motion renders the final frame.
  // validate-fixtures requires this block on HERO_TYPES interaction beats.
  hero: z
    .object({
      slowFirst: z.boolean(),
      structuralReadout: z.string(),
      reducedMotionFinalFrame: z.literal(true),
    })
    .optional(),
  // Notation-ladder ordering tags (proposed §2.2, "no symbol before its
  // referent"). validate-fixtures fails CI if an `introducesSymbol` beat is not
  // preceded by all its `groundedBy` beatIds within each track's visible
  // subsequence.
  introducesSymbol: z.string().optional(),
  groundedBy: z.array(z.string()).optional(),
  // A beat that states a contrast (proposed §2.2 rule 4): marks that it carries a
  // learner align-and-articulate tap, not a passive narration.
  comparison: z.literal(true).optional(),
  // Opt-in "For the interview" note (proposed §2.7). De-gatekept default copy +
  // this collapsed quant framing; validate-fixtures asserts one exists per lesson.
  interviewNote: z.string().optional(),
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
  // Optional on-ramp (L1 §6): available + enterable, but ungated — it never
  // locks its successor and is skipped by the recommended-action chain.
  optional: z.boolean().optional(),
  // Concept catalog display keys (Wave-0 contract; optional for back-compat).
  glyphKey: z.string().optional(),
  vizKey: z.string().optional(),
})

const CourseRoadmapNodeSchema = z.object({
  lessonId: z.string(),
  title: z.string(),
  summary: z.string(),
})

// Chapter grouping within a concept (Wave-0 contract; replaces ERGO_CHAPTERS).
export const CourseChapterSchema = z.object({
  id: z.string(),
  label: z.string(),
  accent: z.string(),
  lessonIds: z.array(z.string()),
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
  // --- Concept catalog fields (all optional for backward-compat with existing docs) ---
  domain: z.string().optional(),
  domainOrder: z.number().optional(),
  order: z.number().optional(),
  status: z.enum(['live', 'coming_soon']).optional(),
  tagline: z.string().optional(),
  accent: z.enum(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']).optional(),
  vizKey: z.string().optional(),
  chapters: z.array(CourseChapterSchema).optional(),
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
      // High-water mark of the hint level ever reached per beat (L1 §3.4).
      // `hintLevelByBeat` resets to 0 on a correct submit, so this is the only
      // signal of peak struggle — the input to the per-lesson mastery signal.
      maxHintLevelByBeat: z.record(z.string(), z.number()).optional(),
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
    // Light, non-blocking per-lesson mastery signal (L1 §9): true iff the graded
    // beats were first-try-correct with no full reveal. Generalizes
    // transferAttained; never gates unlock.
    mastered: z.boolean().optional(),
  })
  .loose()

export const ProgressSchema = z.object({
  // Two-track selection from the diagnostic pre-check (L1 §3.3), written
  // client-side to users/{uid}/progress/{courseId}. Not in the rules deny-list,
  // so the client may write it; absent ⇒ default Track B in the renderer.
  track: z.enum(['A', 'B']).optional(),
  // First-run welcome screen (new accounts). Set when the learner has seen the
  // welcome — i.e. started the intro or skipped; absent ⇒ not yet welcomed. A
  // server timestamp, like the unlock/complete stamps below.
  welcomeSeenAt: z.unknown().optional(),
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
export type EquationCopy = z.infer<typeof EquationCopySchema>
export type SubstitutionStep = z.infer<typeof SubstitutionStepSchema>
export type Interaction = z.infer<typeof InteractionSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type Beat = z.infer<typeof BeatSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Course = z.infer<typeof CourseSchema>
export type CourseChapter = z.infer<typeof CourseChapterSchema>
export type CourseLessonNode = z.infer<typeof CourseLessonNodeSchema>
export type Snapshot = z.infer<typeof SnapshotSchema>
export type Progress = z.infer<typeof ProgressSchema>
export type ProgressDerived = z.infer<typeof ProgressDerivedSchema>
