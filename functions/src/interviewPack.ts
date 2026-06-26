// Interview-pack content layer (ADR-0008 / ADR-0005). The Zod schema for an
// engine-verified capstone-interview pack, plus the client-safe projection
// (toClientPack / toClientQuestion) that strips every hidden answer/rubric and
// the server-only prompts.
//
// House style mirrors src/content/schema.ts: exported `const ...Schema = z....`,
// `z.tuple`/`z.enum` where apt, `z.infer` types near the bottom. Firebase-free
// (only imports `zod`) so it is importable by both the browser dev-harness and
// the Cloud Functions runtime (a byte-identical copy lives at
// functions/src/interviewPack.ts — guarded by a drift test).
//
// CRITICAL (README §Leak mitigation): the full pack — `hidden`,
// `interviewerPrompt`, `generatorPrompt`, `engineCheck.answer/calls` — lives
// ONLY server-side, bundled into functions/. The production browser bundle must
// NEVER import a course-*.json pack directly; it receives a single
// ClientQuestion from mintInterviewToken. toClientPack() is for the /dev harness
// and as defence-in-depth, not the primary protection.

import { z } from 'zod'

const HintTripleSchema = z.tuple([z.string(), z.string(), z.string()])

const RubricSchema = z.object({
  correctness: z.string(),
  approach: z.string(),
  rigor: z.string(),
  communication: z.string(),
  speed: z.string(),
})

export const QuestionSchema = z.object({
  id: z.string(),
  tier: z.enum(['hard', 'harder', 'brutal']),
  fingerprint: z.string(),
  template: z
    .object({
      id: z.string(),
      params: z.record(z.string(), z.unknown()), // Zod v4: two-arg z.record
    })
    .optional(), // omitted => free-form question
  prompt: z.string(),
  source: z.string(),
  engineCheck: z.object({
    module: z.string(),
    calls: z.array(z.string()),
    answer: z.string(),
    verified: z.boolean(),
  }),
  hidden: z.object({
    answer: z.string(),
    approaches: z.array(z.string()),
    wrongTurns: z.array(z.string()),
    hintLadder: HintTripleSchema,
    rubric: RubricSchema,
  }),
  followUps: z.array(z.string()),
})

export const InterviewPackSchema = z.object({
  version: z.literal(1),
  kind: z.literal('interview-pack'),
  courseId: z.string(),
  concept: z.string(),
  greenBookAnchor: z.string(),
  engineModule: z.string(),
  generator: z.string(),
  note: z.string(),
  counts: z.object({
    total: z.number().int().nonnegative(),
    byTier: z.object({
      hard: z.number().int().nonnegative(),
      harder: z.number().int().nonnegative(),
      brutal: z.number().int().nonnegative(),
    }),
    templated: z.number().int().nonnegative(),
    freeForm: z.number().int().nonnegative(),
  }),
  interviewerPrompt: z.string(), // server-only; stripped by toClientPack()
  generatorPrompt: z.string(), // server-only; stripped by toClientPack()
  templates: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      source: z.string(),
      description: z.string(),
      engineModule: z.string(),
    }),
  ),
  questions: z.array(QuestionSchema),
})

// ClientQuestion: hidden entirely dropped; engineCheck reduced to module+verified.
export const ClientQuestionSchema = QuestionSchema.omit({ hidden: true }).extend({
  engineCheck: z.object({
    module: z.string(),
    verified: z.boolean(),
    // calls and answer intentionally absent (server-side only)
  }),
})

// z.infer types (house style: at the bottom).
export type Question = z.infer<typeof QuestionSchema>
export type InterviewPack = z.infer<typeof InterviewPackSchema>
export type ClientQuestion = z.infer<typeof ClientQuestionSchema>

// The client-safe pack: server-only prompts dropped and every question reduced
// to a ClientQuestion. Used by the /dev harness + as defence-in-depth.
export type ClientPack = Omit<
  InterviewPack,
  'interviewerPrompt' | 'generatorPrompt' | 'questions'
> & { questions: ClientQuestion[] }

// ── Interview report / transcript types (README §Report and turn types) ────────
// Plain TS types (no Zod): the grader output is validated server-side by the
// OpenAI Responses API json_schema (strict); attempts.ts has its own runtime
// validator for the Firestore read path.

export type HireSignal =
  | 'Strong No' // 0
  | 'No' // 1
  | 'Lean No' // 2
  | 'Lean Yes' // 3
  | 'Yes' // 4
  | 'Strong Yes' // 5

export interface Dim {
  score: 1 | 2 | 3 | 4 | 5
  evidence: string // short quoted transcript snippet
}

export interface InterviewReport {
  dimensions: {
    correctness: Dim
    approach: Dim
    rigor: Dim
    communication: Dim
    speed: Dim
  }
  hireSignal: HireSignal
  summary: string
  strengths: string[]
  fixes: string[]
}

export interface Turn {
  role: 'interviewer' | 'candidate'
  text: string
  ts: number // unix ms
  final: boolean
}

// ── Projections (built explicitly so no field is ever forgotten or leaked) ─────

/** Strip `hidden` and reduce `engineCheck` to module+verified (the only client view). */
export function toClientQuestion(q: Question): ClientQuestion {
  const client: ClientQuestion = {
    id: q.id,
    tier: q.tier,
    fingerprint: q.fingerprint,
    prompt: q.prompt,
    source: q.source,
    engineCheck: { module: q.engineCheck.module, verified: q.engineCheck.verified },
    followUps: q.followUps,
  }
  if (q.template) client.template = q.template
  return client
}

/** Strip server-only prompts + every question's hidden/engineCheck answer. */
export function toClientPack(pack: InterviewPack): ClientPack {
  return {
    version: pack.version,
    kind: pack.kind,
    courseId: pack.courseId,
    concept: pack.concept,
    greenBookAnchor: pack.greenBookAnchor,
    engineModule: pack.engineModule,
    generator: pack.generator,
    note: pack.note,
    counts: pack.counts,
    templates: pack.templates,
    questions: pack.questions.map(toClientQuestion),
  }
}

/** Server/build loader entry — throws (with z.prettifyError) on a non-conforming pack. */
export function parseInterviewPack(json: unknown): InterviewPack {
  const result = InterviewPackSchema.safeParse(json)
  if (!result.success) {
    throw new Error(
      `InterviewPack schema validation failed:\n${z.prettifyError(result.error)}`,
    )
  }
  return result.data
}
