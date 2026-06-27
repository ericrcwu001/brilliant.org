// Capstone-interview Cloud Functions (ADR-0008). Two server-authoritative
// callables:
//
//   mintInterviewToken  auth + App-Check + daily-quota gate, draws ONE unseen
//                       question server-side, writes a pending attempt, builds
//                       LEAK-SAFE live session instructions, and mints a
//                       short-lived OpenAI Realtime ephemeral token. The standing
//                       OPENAI_API_KEY never leaves the server; only the ek_...
//                       ephemeral value is returned.
//   gradeInterview      grades the assembled transcript against the drawn
//                       question's HIDDEN answer/rubric via the Responses API
//                       (Structured Outputs, strict), then transactionally
//                       finalizes the attempt, updates the seen-set, and
//                       increments daily usage. Audio is NEVER stored.
//
// LEAK RULE (README §Leak mitigation): the live session `instructions` is echoed
// back to the browser in session.created. buildLiveInstructions is the single
// injection point and must NEVER include hidden.answer / approaches / wrongTurns
// or engineCheck.answer. Exact answers are consumed ONLY by the grader.

import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

import {
  InterviewPackSchema,
  toClientQuestion,
  type InterviewPack,
  type Question,
  type ClientQuestion,
  type Turn,
  type InterviewReport,
} from './interviewPack'
import { drawQuestion } from './interviewDraw'
import { localDateInTimezone, isValidTimezone } from './streaks'

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

const db = getFirestore()

// Caps — load-bearing, enforced server-side (README §Caps/constants).
const SESSION_CAP_SECONDS = 480 // 8 min hard per-session
const DAILY_QUOTA_SECONDS = 1800 // 30 min per user per day
const TOKEN_TTL_SECONDS = 600 // expires_after.seconds at mint (>= session cap)
const REALTIME_MODEL = 'gpt-realtime-2'
const REALTIME_VOICE = 'marin'
const GRADER_MODEL = 'gpt-5.5' // pin a snapshot for production

const FALLBACK_TZ = 'UTC'

// App Check: enforce only when deployed to the prod project, never in the
// emulator. The dev project (brilliant-org-dev) has no reCAPTCHA key
// (src/firebase/app.ts) so enforcing there would block all requests. Global App
// Check stays OFF per docs/security-audit.md F1/F3 — only this mint opts in.
const enforceAppCheck =
  process.env.GCLOUD_PROJECT === 'brilliant-org' && process.env.FUNCTIONS_EMULATOR !== 'true'

// Duplicated (not imported from ./index) to avoid a circular import — index.ts
// re-exports from this file.
function requireUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'You must be signed in.')
  return uid
}

function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0)
    throw new HttpsError('invalid-argument', `${name} is required.`)
  return value
}

// Pack loader (Phase 0 bundling: interviews/course-*.json → functions/packs/ at
// deploy time; __dirname is functions/lib/ in the compiled output, packs/ a
// sibling of lib/).
function loadPack(conceptId: string): InterviewPack {
  // conceptId is the course id and may already carry the `course-` prefix (the
  // CTAs pass `courseId`). Strip it so the filename is course-<slug>.json and
  // never the doubled course-course-*.json.
  const slug = conceptId.replace(/^course-/, '')
  const filepath = path.join(__dirname, '../packs', `course-${slug}.json`)
  let raw: string
  try {
    raw = fs.readFileSync(filepath, 'utf8')
  } catch {
    throw new HttpsError('not-found', `No interview pack for concept: ${conceptId}`)
  }
  return InterviewPackSchema.parse(JSON.parse(raw))
}

// ── LEAK-SAFE live-session instructions (the SINGLE injection point) ───────────
// Allowed: interviewerPrompt, question prompt/tier/source, METHOD-ONLY hintLadder
// (the pack's build-time NO-LEAK guard ensures rungs state method not the number),
// qualitative rubric text, followUps. Forbidden: hidden.answer / approaches /
// wrongTurns / engineCheck.answer.
// Voice-delivery layer shared across every concept pack (the pack's own
// interviewerPrompt supplies role/protocol/edge-cases/hints/scoring). Structured
// per OpenAI's Realtime prompting guide; contains NO hidden answer/rubric fields.
const VOICE_CONVERSATION_GUIDE = `# Personality and Tone
- Warm, sharp senior quant interviewer. Natural and human, never robotic.

# Language
- Speak and respond ONLY in English at all times, regardless of the language the candidate uses.
- If the candidate speaks another language, politely ask them to continue in English.

# Reasoning
- Reason silently before probing or grading. Do NOT reason aloud or reveal chain-of-thought.
- Do NOT reason on unclear audio — ask for clarification instead.

# Preambles
- If you need a beat to think, a SHORT spoken filler is fine ("Let me think about that.").

# Verbosity (you are SPEAKING out loud)
- Keep every turn to ONE or TWO sentences, then STOP and listen. Never monologue.
- Ask ONE thing at a time. Do not stack questions.

# Interruptions
- If the candidate talks while you are speaking, STOP immediately, listen, address what they said, then continue naturally. Do NOT restate your whole previous turn.

# Unclear Audio
- Only act on audio you understand with confidence. If you hear silence, a stray word, or noise rather than a real answer, do NOT respond — wait, or briefly prompt ("Take your time."). Never guess at missing words.

# Variety
- Vary your acknowledgments and phrasing across turns ("Right." "Go on." "Okay.") to avoid sounding repetitive.`

function buildLiveInstructions(pack: InterviewPack, question: Question): string {
  const r = question.hidden.rubric
  return [
    VOICE_CONVERSATION_GUIDE,
    '',
    pack.interviewerPrompt,
    '',
    '## Question',
    `Prompt: ${question.prompt}`,
    `Tier: ${question.tier}  |  Source: ${question.source}`,
    '',
    '## Hint progression (method steps only — do NOT state the numerical answer)',
    question.hidden.hintLadder.map((h, i) => `${i + 1}. ${h}`).join('\n'),
    '',
    '## Evaluation guidance (qualitative — do NOT state scores or answers)',
    `- Correctness: ${r.correctness}`,
    `- Approach: ${r.approach}`,
    `- Rigor: ${r.rigor}`,
    `- Communication: ${r.communication}`,
    `- Speed: ${r.speed}`,
    '',
    '## Follow-up questions (ask these after the main question)',
    question.followUps.map((f) => `- ${f}`).join('\n'),
  ].join('\n')
}

// ── mintInterviewToken ─────────────────────────────────────────────────────────
interface MintInterviewTokenInput {
  conceptId?: string
  timezone?: string
  mode?: 'voice' | 'text'
}

interface MintInterviewTokenOutput {
  clientSecret: string
  expiresAt: number
  model: string
  attemptId: string
  question: ClientQuestion
  sessionCapSeconds: number
  dailyRemainingSeconds: number
}

export const mintInterviewToken = onCall(
  { enforceAppCheck, secrets: [OPENAI_API_KEY] },
  async (request: CallableRequest<MintInterviewTokenInput>): Promise<MintInterviewTokenOutput> => {
    // 1 — auth
    const uid = requireUid(request)
    const data = request.data ?? {}
    const conceptId = requireString(data.conceptId, 'conceptId')
    const mode: 'voice' | 'text' = data.mode === 'text' ? 'text' : 'voice'

    // 2 — resolve day from timezone
    const tz = isValidTimezone(data.timezone) ? data.timezone : FALLBACK_TZ
    const day = localDateInTimezone(tz)

    // 3 — quota check (read; throw before any write)
    const usageRef = db.doc(`users/${uid}/interviewUsage/${day}`)
    const usageSnap = await usageRef.get()
    const secondsUsed = (usageSnap.data()?.secondsUsed ?? 0) as number
    const dailyRemaining = Math.max(0, DAILY_QUOTA_SECONDS - secondsUsed)
    if (secondsUsed >= DAILY_QUOTA_SECONDS) {
      throw new HttpsError('resource-exhausted', 'Daily interview quota reached. Try again tomorrow.')
    }

    // 4 — load pack
    const pack = loadPack(conceptId)

    // 5 — load seen-set
    const stateRef = db.doc(`users/${uid}/interviewState/${conceptId}`)
    const stateSnap = await stateRef.get()
    const seenQuestionIds: string[] = (stateSnap.data()?.seenQuestionIds ?? []) as string[]

    // 6 — draw next unseen question (+ its followUps) via the pure P2A module
    const draw = drawQuestion(pack, seenQuestionIds)
    if (!draw) {
      throw new HttpsError(
        'failed-precondition',
        'No interview questions remaining for this concept.',
      )
    }
    const { question } = draw

    // 7 — write pending attempt. _usageDay is a server-internal field so
    // gradeInterview can increment the correct bucket without a timezone param.
    const attemptRef = db.collection(`users/${uid}/interviews`).doc()
    const attemptId = attemptRef.id
    await attemptRef.set({
      conceptId,
      questionId: question.id,
      fingerprint: question.fingerprint,
      tier: question.tier,
      mode,
      status: 'pending',
      _usageDay: day,
      startedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    })

    // 8 — build live session instructions (LEAK-SAFE)
    const instructions = buildLiveInstructions(pack, question)

    // 9 — mint ephemeral token (the standing key never leaves the server)
    const key = OPENAI_API_KEY.value()
    const safetyId = crypto.createHash('sha256').update(uid).digest('hex').slice(0, 32)

    const mintRes = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'OpenAI-Safety-Identifier': safetyId,
      },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: TOKEN_TTL_SECONDS },
        session: {
          type: 'realtime',
          model: REALTIME_MODEL,
          instructions,
          output_modalities: ['audio'],
          // gpt-realtime-2 reasons before it speaks; 'low' keeps first-audio latency
          // tolerable for a live interview. Tune up to 'medium' if probing is shallow.
          reasoning: { effort: 'low' },
          audio: {
            input: {
              format: { type: 'audio/pcm', rate: 24000 },
              transcription: {
                model: 'gpt-realtime-whisper',
                language: 'en',
                // Bias the ASR toward the quant-interview vocabulary the candidate
                // will use. If a future model rejects `prompt`, this field is safe
                // to drop.
                prompt:
                  "Quantitative finance interview. Likely terms: expected value, variance, standard deviation, probability, conditional probability, Bayes' rule, Markov chain, combinatorics, permutations, binomial, geometric distribution, expected number of flips, hitting time.",
              },
              // server_vad gates on audio energy (semantic_vad has no threshold knob),
              // so background noise below threshold no longer interrupts the model.
              turn_detection: {
                type: 'server_vad',
                threshold: 0.7,
                prefix_padding_ms: 300,
                silence_duration_ms: 800,
                create_response: true,
                interrupt_response: true,
              },
              noise_reduction: { type: 'near_field' },
            },
            output: {
              format: { type: 'audio/pcm', rate: 24000 },
              voice: REALTIME_VOICE,
              speed: 1.0,
            },
          },
        },
      }),
    })

    if (!mintRes.ok) {
      const body = await mintRes.text()
      throw new HttpsError('internal', `OpenAI mint failed: ${mintRes.status} ${body}`)
    }

    const mintData = (await mintRes.json()) as { value: string; expires_at: number }

    // 10 — return (NEVER return the standing API key; only the ephemeral value)
    return {
      clientSecret: mintData.value,
      expiresAt: mintData.expires_at,
      model: REALTIME_MODEL,
      attemptId,
      question: toClientQuestion(question),
      sessionCapSeconds: SESSION_CAP_SECONDS,
      dailyRemainingSeconds: dailyRemaining,
    }
  },
)

// ── gradeInterview ─────────────────────────────────────────────────────────────
interface GradeInterviewInput {
  attemptId?: string
  conceptId?: string
  transcript?: Turn[]
  durationSec?: number
}

interface GradeInterviewOutput {
  report: InterviewReport
  attemptId: string
}

// JSON Schema for the grader's Structured Output (strict: every property in
// `required`, additionalProperties:false everywhere). Mirrors InterviewReport.
const INTERVIEW_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    dimensions: {
      type: 'object',
      properties: {
        correctness: { $ref: '#/$defs/dim' },
        approach: { $ref: '#/$defs/dim' },
        rigor: { $ref: '#/$defs/dim' },
        communication: { $ref: '#/$defs/dim' },
        speed: { $ref: '#/$defs/dim' },
      },
      required: ['correctness', 'approach', 'rigor', 'communication', 'speed'],
      additionalProperties: false,
    },
    hireSignal: {
      type: 'string',
      enum: ['Strong No', 'No', 'Lean No', 'Lean Yes', 'Yes', 'Strong Yes'],
    },
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    fixes: { type: 'array', items: { type: 'string' } },
  },
  required: ['dimensions', 'hireSignal', 'summary', 'strengths', 'fixes'],
  additionalProperties: false,
  $defs: {
    dim: {
      type: 'object',
      properties: {
        score: { type: 'integer', minimum: 1, maximum: 5 },
        evidence: { type: 'string' },
      },
      required: ['score', 'evidence'],
      additionalProperties: false,
    },
  },
} as const

export function extractGradeJson(data: { output?: unknown; output_text?: unknown }): string {
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text
  const out = Array.isArray(data.output) ? data.output : []
  for (const item of out as Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>) {
    if (item?.type === 'message' && Array.isArray(item.content)) {
      const seg = item.content.find((c) => c?.type === 'output_text' && typeof c.text === 'string')
      if (seg?.text) return seg.text
    }
  }
  return ''
}

function buildGraderPrompt(question: Question, transcript: Turn[]): string {
  const turns = transcript.map((t) => `[${t.role}] ${t.text}`).join('\n')
  return [
    'You are a rigorous technical interview evaluator.',
    '',
    '## Interview transcript',
    turns || '(no transcript)',
    '',
    '## Ground truth (server-side only — do NOT repeat to the candidate)',
    `Question: ${question.prompt}`,
    `Correct answer: ${question.hidden.answer}`,
    `Accepted approaches: ${question.hidden.approaches.join('; ')}`,
    `Wrong turns to watch for: ${question.hidden.wrongTurns.join('; ')}`,
    '',
    '## Rubric',
    `- Correctness: ${question.hidden.rubric.correctness}`,
    `- Approach: ${question.hidden.rubric.approach}`,
    `- Rigor: ${question.hidden.rubric.rigor}`,
    `- Communication: ${question.hidden.rubric.communication}`,
    `- Speed: ${question.hidden.rubric.speed}`,
    '',
    'Grade strictly against the ground truth. Output JSON matching the schema.',
  ].join('\n')
}

export const gradeInterview = onCall(
  { secrets: [OPENAI_API_KEY] },
  async (request: CallableRequest<GradeInterviewInput>): Promise<GradeInterviewOutput> => {
    // 1 — auth
    const uid = requireUid(request)
    const data = request.data ?? {}
    const attemptId = requireString(data.attemptId, 'attemptId')
    const conceptId = requireString(data.conceptId, 'conceptId')
    const transcript: Turn[] = Array.isArray(data.transcript) ? data.transcript : []
    const durationSec = typeof data.durationSec === 'number' ? data.durationSec : 0

    // 2 — load + verify pending attempt (read before transaction)
    const attemptRef = db.doc(`users/${uid}/interviews/${attemptId}`)
    const attemptSnap = await attemptRef.get()
    if (!attemptSnap.exists) throw new HttpsError('not-found', 'Interview attempt not found.')
    if (attemptSnap.get('status') !== 'pending')
      throw new HttpsError('failed-precondition', 'Attempt is not pending.')
    if (attemptSnap.get('conceptId') !== conceptId)
      throw new HttpsError('invalid-argument', 'conceptId mismatch.')

    const questionId = attemptSnap.get('questionId') as string
    const usageDay = attemptSnap.get('_usageDay') as string

    // 3 — load full pack + the drawn question's hidden fields
    const pack = loadPack(conceptId)
    const question = pack.questions.find((q) => q.id === questionId)
    if (!question) throw new HttpsError('internal', `Question ${questionId} not found in pack.`)

    // 4 — grade via Responses API (Structured Outputs strict). hidden.* is
    // consumed HERE ONLY — never written to the attempt or returned to the client.
    const key = OPENAI_API_KEY.value()
    const graderPrompt = buildGraderPrompt(question, transcript)

    const gradeRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GRADER_MODEL,
        input: graderPrompt,
        reasoning: { effort: 'medium' },
        text: {
          format: { type: 'json_schema', name: 'interview_grade', strict: true, schema: INTERVIEW_REPORT_SCHEMA },
        },
      }),
    })

    if (!gradeRes.ok) {
      const body = await gradeRes.text()
      throw new HttpsError('internal', `OpenAI grade failed: ${gradeRes.status} ${body}`)
    }

    const gradeData = (await gradeRes.json()) as { output?: unknown; output_text?: unknown }
    const reportJson = extractGradeJson(gradeData)
    if (!reportJson.trim()) throw new HttpsError('internal', 'Grader returned no usable output')
    const report = JSON.parse(reportJson) as InterviewReport
    if (!report.hireSignal || !report.dimensions || typeof report.dimensions !== 'object')
      throw new HttpsError('internal', 'Grader returned an incomplete report')

    // 5 — transaction: finalize attempt + seen-set + usage (reads before writes)
    const stateRef = db.doc(`users/${uid}/interviewState/${conceptId}`)
    const usageRef = db.doc(`users/${uid}/interviewUsage/${usageDay}`)

    await db.runTransaction(async (tx) => {
      const stateSnap = await tx.get(stateRef)
      const usageSnap = await tx.get(usageRef)

      const seenIds: string[] = (stateSnap.data()?.seenQuestionIds ?? []) as string[]
      const prevSeconds = (usageSnap.data()?.secondsUsed ?? 0) as number
      const prevCount = (usageSnap.data()?.sessionCount ?? 0) as number
      const cappedDuration = Math.min(durationSec, SESSION_CAP_SECONDS)

      // Write 1: finalize attempt (audio is NEVER stored)
      tx.set(
        attemptRef,
        {
          status: 'graded',
          transcript,
          report,
          hireSignal: report.hireSignal,
          durationSec: cappedDuration,
          gradedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      // Write 2: seen-set (idempotent add)
      const newSeen = Array.from(new Set([...seenIds, questionId]))
      tx.set(
        stateRef,
        {
          seenQuestionIds: newSeen,
          attemptCount: ((stateSnap.data()?.attemptCount ?? 0) as number) + 1,
          lastAttemptAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      // Write 3: usage bucket (capped)
      tx.set(
        usageRef,
        {
          date: usageDay,
          secondsUsed: prevSeconds + cappedDuration,
          sessionCount: prevCount + 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    })

    return { report, attemptId }
  },
)
