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
import { getFirestore, FieldValue, type Firestore } from 'firebase-admin/firestore'
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
import { loadServerFlags, serverGatedOn } from './flags'
import { localDateInTimezone, isValidTimezone } from './streaks'
import {
  scoreCalibration,
  foldAttemptIntoTrend,
  isCorrect,
  MIN_CALIBRATION_N,
  type CalibrationItem,
  type CalibrationFormat,
  type CalibrationResult,
  type TrendSums,
} from './calibration'
import { compareAnswers } from './answerCheck'

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

// Lazy Firestore: getFirestore() must not run at module load (this module is
// re-exported by index.ts before its initializeApp(), which would throw "default
// app does not exist" during `firebase deploy` codebase analysis). First-call
// init guarantees the app exists.
let _db: Firestore | undefined
function db(): Firestore {
  if (!_db) _db = getFirestore()
  return _db
}

// Caps — load-bearing, enforced server-side (README §Caps/constants).
const SESSION_CAP_SECONDS = 480 // 8 min hard per-session
const DAILY_QUOTA_SECONDS = 1800 // 30 min per user per day
const TOKEN_TTL_SECONDS = 600 // expires_after.seconds at mint (>= session cap)
// Bounds on the client-supplied transcript at grade time — generous enough that a
// real <=8-min interview never trips them, but they cap grader token cost and keep
// the attempt doc under the Firestore 1 MiB limit (CWE-770).
const MAX_TRANSCRIPT_TURNS = 400
const MAX_TRANSCRIPT_CHARS = 100_000
export const REALTIME_MODEL = 'gpt-realtime-2'
export const REALTIME_VOICE = 'marin'
export const GRADER_MODEL = 'gpt-5.5' // pin a snapshot for production

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
  // Reject anything outside the legitimate course-id charset so a crafted
  // conceptId can never traverse out of packs/ (CWE-22).
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new HttpsError('invalid-argument', 'Invalid conceptId.')
  }
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

export function buildLiveInstructions(pack: InterviewPack, question: Question): string {
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
  // spec-22 / D9: track-gated difficulty floor. The quant-intensity gate sends
  // 'brutal'; Track A sends 'hard' (today's effective behaviour). A difficulty
  // KNOB, not a security boundary (§3.0): server-validated/clamped, defaults to
  // the gentle 'hard' for absent/invalid input (a stale client gets the safe
  // default). The worst a spoofing client can do is ask itself harder/easier
  // questions — it cannot leak answers, exceed quota, or change grading.
  tierFloor?: 'hard' | 'harder' | 'brutal'
}

const TIERS = ['hard', 'harder', 'brutal'] as const

// Resolve a safe tier floor from the (untrusted) mint input (spec-22 §3.1).
// Absent/invalid → 'hard' (the gentle default — Track A, or a stale client).
// Exported so the floor-resolution logic is unit-testable without invoking the
// full callable (which needs OpenAI + Firestore).
export function resolveTierFloor(value: unknown): (typeof TIERS)[number] {
  return (TIERS as readonly string[]).includes(value as string)
    ? (value as (typeof TIERS)[number])
    : 'hard'
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
    // spec-22 §3.1: validate/clamp the client-supplied difficulty floor.
    const tierFloor = resolveTierFloor(data.tierFloor)
    // spec-05 SERVER kill switch (D17 / R14): the brutal-mock floor is a flagged
    // net-new behavior. The client gate in App.tsx is the UX default; this is the
    // AUTHORITATIVE one — clamp the floor to 'hard' server-side unless
    // config/flags.brutalMockFloor is on for this user's cohort, so flipping the kill
    // stops brutal even for a stale client. Fail CLOSED to 'hard' on any read error.
    let effectiveTierFloor = tierFloor
    if (tierFloor !== 'hard') {
      try {
        const [serverFlags, userSnap] = await Promise.all([
          loadServerFlags(),
          db().doc(`users/${uid}`).get(),
        ])
        const cohort = userSnap.get('rolloutCohort') as 'treatment' | 'holdout' | undefined
        if (!serverGatedOn('brutalMockFloor', cohort, serverFlags)) effectiveTierFloor = 'hard'
      } catch {
        effectiveTierFloor = 'hard'
      }
    }

    // 2 — resolve day from timezone
    const tz = isValidTimezone(data.timezone) ? data.timezone : FALLBACK_TZ
    const day = localDateInTimezone(tz)

    // 3 — quota check (read; throw before any write)
    const usageRef = db().doc(`users/${uid}/interviewUsage/${day}`)
    const usageSnap = await usageRef.get()
    const secondsUsed = (usageSnap.data()?.secondsUsed ?? 0) as number
    const dailyRemaining = Math.max(0, DAILY_QUOTA_SECONDS - secondsUsed)
    if (secondsUsed >= DAILY_QUOTA_SECONDS) {
      throw new HttpsError('resource-exhausted', 'Daily interview quota reached. Try again tomorrow.')
    }

    // 4 — load pack
    const pack = loadPack(conceptId)

    // 5 — load seen-set
    const stateRef = db().doc(`users/${uid}/interviewState/${conceptId}`)
    const stateSnap = await stateRef.get()
    const seenQuestionIds: string[] = (stateSnap.data()?.seenQuestionIds ?? []) as string[]

    // 6 — draw next unseen question (+ its followUps) via the pure P2A module,
    // floored to the track-gated tier (spec-22 §3.1). The brutal pool is smaller
    // (e.g. EV: 13 brutal vs 58 total), so a heavy Track-B user can exhaust
    // brutal-only sooner — fall back once to 'hard' before throwing so the mock
    // degrades gracefully (R5) instead of dead-ending on "no questions".
    let draw = drawQuestion(pack, seenQuestionIds, { tierFloor: effectiveTierFloor })
    if (!draw && effectiveTierFloor !== 'hard') {
      draw = drawQuestion(pack, seenQuestionIds, { tierFloor: 'hard' })
    }
    if (!draw) {
      throw new HttpsError(
        'failed-precondition',
        'No interview questions remaining for this concept.',
      )
    }
    const { question } = draw

    // 7 — write pending attempt. _usageDay is a server-internal field so
    // gradeInterview can increment the correct bucket without a timezone param.
    const attemptRef = db().collection(`users/${uid}/interviews`).doc()
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
      // Log upstream detail server-side; never return the raw OpenAI body to the
      // client (CWE-209).
      console.error('OpenAI mint failed', mintRes.status, await mintRes.text())
      throw new HttpsError('internal', 'Could not start the interview. Please try again.')
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
  // spec-12: the per-attempt calibration (Brier + predicted-vs-measured delta).
  // RETURNED (not only written) so spec-23's report renders from this value rather
  // than re-reading the attempt doc (README §4.5, gate Issue #10). When the attempt
  // captured no confidence (Track A), this is the all-null zero-n result.
  calibration: CalibrationResult
}

// Recompute the convenience denormals on a running-sum bucket (pooled or per-format)
// after a fold (spec-12 §3.3). Brier/overconfidence/reliable are derived from the
// sums so the client renders without dividing.
function denormSums(s: TrendSums): {
  n: number
  brierSum: number
  confidenceSum: number
  correctSum: number
  brier: number
  meanConfidence: number
  accuracy: number
  overconfidence: number
  reliable: boolean
} {
  const brier = s.brierSum / s.n
  const meanConfidence = s.confidenceSum / s.n
  const accuracy = s.correctSum / s.n
  return {
    n: s.n,
    brierSum: s.brierSum,
    confidenceSum: s.confidenceSum,
    correctSum: s.correctSum,
    brier,
    meanConfidence,
    accuracy,
    overconfidence: meanConfidence - accuracy,
    reliable: s.n >= MIN_CALIBRATION_N,
  }
}

// Tier-aware rubric scaling (spec-22 / D9). The 1–5 dimension scores must be
// calibrated to the QUESTION'S tier so a brutal question is not graded on a
// hard-question yardstick. This is a fairness fix for ALL tracks, not a Track-B
// feature (README §1 row 6). The bands describe how to map performance → score
// AT THIS TIER.
const TIER_CALIBRATION: Record<'hard' | 'harder' | 'brutal', string> = {
  hard:
    'Standard interview difficulty. Grade against a solid prepared candidate: ' +
    'a correct, well-explained solution earns 5; minor gaps earn 3–4.',
  harder:
    'Above standard. The problem has an extra twist or heavier computation. ' +
    'Credit partial progress generously — reaching the right setup and a ' +
    'mostly-correct path is a 4 even if the final value has a slip. Do NOT ' +
    'penalize for the added difficulty itself.',
  brutal:
    'Top-tier / brain-teaser difficulty. Many strong candidates fail this. ' +
    'Grade on insight and method, not just the final number: identifying the ' +
    'key idea and a viable approach is already a 3–4; a complete rigorous ' +
    'solution is a 5. A blank or fundamentally wrong approach is still low, ' +
    'but do NOT deflate a genuine strong attempt because the question is hard.',
}

// JSON Schema for the grader's Structured Output (strict: every property in
// `required`, additionalProperties:false everywhere). Mirrors InterviewReport.
//
// SHARED with spec-23 (README §3.5): spec-22 ADDED `tier`/`pressureNote` (here);
// spec-23 REMOVED `hireSignal` end-to-end (D11 / ADR-0010 — the report feeds
// forward, no hire/no-hire verdict anywhere). The grader no longer emits a
// verdict; the report renders the five dimensions as next-fix cards plus the
// predicted-vs-measured calibration delta. The post-merge `required` set is
// exactly ['dimensions', 'summary', 'strengths', 'fixes', 'tier', 'pressureNote'].
export const INTERVIEW_REPORT_SCHEMA = {
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
    summary: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    fixes: { type: 'array', items: { type: 'string' } },
    // spec-22: the question's difficulty tier the score was calibrated against.
    // The model echoes it from the prompt; the server OVERWRITES it post-parse
    // from the attempt's known tier (authoritative — see gradeInterview).
    tier: { type: 'string', enum: ['hard', 'harder', 'brutal'] },
    // spec-22: a one-sentence "pressure graduation" note framing the result as
    // under-pressure retrieval, never a hire/no-hire verdict.
    pressureNote: { type: 'string' },
    // Deterministic correctness anchor (mentor feedback): the candidate's
    // explicitly stated FINAL answer, quoted verbatim, or null if they never
    // committed to a single value. Pure low-discretion extraction — the SERVER
    // decides correctness from it (compareAnswers vs engineCheck.answer), never
    // the model. Stripped from the report before persistence (folded into
    // correctnessAnchor.extracted). Null-union so strict mode allows null.
    candidateFinalAnswer: { type: ['string', 'null'] },
  },
  required: ['dimensions', 'summary', 'strengths', 'fixes', 'tier', 'pressureNote', 'candidateFinalAnswer'],
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

export function buildGraderPrompt(question: Question, transcript: Turn[]): string {
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
    '## Question difficulty tier',
    `This question is tier: ${question.tier}.`,
    TIER_CALIBRATION[question.tier],
    '',
    '## Rubric',
    `- Correctness: ${question.hidden.rubric.correctness}`,
    `- Approach: ${question.hidden.rubric.approach}`,
    `- Rigor: ${question.hidden.rubric.rigor}`,
    `- Communication: ${question.hidden.rubric.communication}`,
    `- Speed: ${question.hidden.rubric.speed}`,
    '',
    'Grade strictly against the ground truth, scaling the 1–5 scores to the ' +
      'difficulty tier above. Output JSON matching the schema.',
    'Also output `pressureNote`: ONE sentence reminding the candidate that a ' +
      'live, timed, spoken interview is harder than untimed practice, and that ' +
      'improving under-pressure retrieval (not just knowing the method) is the ' +
      'goal. Encouraging, forward-looking, never a hire/no-hire verdict.',
    'Also output `candidateFinalAnswer`: the single final numeric value the ' +
      'candidate explicitly committed to, quoted VERBATIM as they stated it ' +
      '(e.g. "1/2", "0.5", "50%", "10"). This is mechanical extraction, NOT a ' +
      'judgment — do not infer, correct, or compute it. Return null if they ' +
      'never committed to a single value, only gave a rounded approximation, or ' +
      'the question asks for multiple parts / a non-numeric answer.',
  ].join('\n')
}

// Deterministic correctness anchor (mentor feedback). Mutates the report in
// place: when the engine-canonical answer and the candidate's extracted final
// answer are BOTH clean scalars (compareAnswers !== 'na'), HARD-OVERRIDE the
// correctness row (match → 5, mismatch → 1) and record why. A 'na' verdict
// leaves the LLM correctness score untouched and only records the anchor as
// not-applied. Pure + exported so the override mapping is unit-testable without
// the firebase runtime.
export function applyCorrectnessAnchor(
  report: InterviewReport,
  engineAnswer: string,
  candidateFinalAnswer: string | null,
): void {
  const verdict = compareAnswers(engineAnswer, candidateFinalAnswer)
  if (verdict !== 'na') {
    report.dimensions.correctness.score = verdict === 'match' ? 5 : 1
    report.dimensions.correctness.evidence =
      verdict === 'match'
        ? `Final answer ${engineAnswer} verified against the engine.`
        : `Stated ${candidateFinalAnswer}; the engine answer is ${engineAnswer}.`
  }
  report.correctnessAnchor = {
    applied: verdict !== 'na',
    verdict,
    expected: engineAnswer,
    extracted: candidateFinalAnswer,
  }
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

    // Reject oversized transcripts before they reach the grader / Firestore (CWE-770).
    const transcriptChars = transcript.reduce(
      (n, t) => n + (typeof t?.text === 'string' ? t.text.length : 0),
      0,
    )
    if (transcript.length > MAX_TRANSCRIPT_TURNS || transcriptChars > MAX_TRANSCRIPT_CHARS) {
      throw new HttpsError('invalid-argument', 'Transcript is too large.')
    }

    // 2 — load + verify pending attempt (read before transaction)
    const attemptRef = db().doc(`users/${uid}/interviews/${attemptId}`)
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
      // Log upstream detail server-side; never return the raw OpenAI body to the
      // client (CWE-209).
      console.error('OpenAI grade failed', gradeRes.status, await gradeRes.text())
      throw new HttpsError('internal', 'Could not grade the interview. Please try again.')
    }

    const gradeData = (await gradeRes.json()) as { output?: unknown; output_text?: unknown }
    const reportJson = extractGradeJson(gradeData)
    if (!reportJson.trim()) throw new HttpsError('internal', 'Grader returned no usable output')
    const report = JSON.parse(reportJson) as InterviewReport
    if (
      !report.dimensions ||
      typeof report.dimensions !== 'object' ||
      !report.pressureNote
    )
      throw new HttpsError('internal', 'Grader returned an incomplete report')
    // spec-22: the tier label is SERVER-AUTHORITATIVE — overwrite the model's
    // echo with the drawn question's known tier (belt-and-suspenders; the model
    // could echo wrong). tier/pressureNote ride inside the `report` blob written
    // by the grade transaction below — no new Firestore field.
    report.tier = question.tier

    // 4a-bis — Deterministic correctness anchor (mentor feedback). The
    // `correctness` row is otherwise LLM-graded and can flatter or err. When the
    // drawn question has an engine-canonical SCALAR answer AND the candidate
    // committed to a single final value, OVERRIDE that row from a deterministic
    // compare against question.engineCheck.answer (itself reproduced from the
    // engine by src/engine/interviewPack.*.test.ts). A 'na' verdict — vector /
    // multi-part / prose answer, or no committed value — leaves the LLM score
    // untouched; under a hard override a misparse must NEVER force a wrong score.
    // The corrected score then flows into isCorrect() below, so the calibration
    // signal sharpens for free. The other four rubric rows stay LLM-graded, so a
    // brutal question's method insight is still credited in approach/rigor.
    const candidateFinalAnswer =
      (report as { candidateFinalAnswer?: string | null }).candidateFinalAnswer ?? null
    applyCorrectnessAnchor(report, question.engineCheck.answer, candidateFinalAnswer)
    // candidateFinalAnswer was a transient extraction field — folded into the
    // anchor above; drop it from the persisted/returned report.
    delete (report as { candidateFinalAnswer?: unknown }).candidateFinalAnswer

    // 4b — calibration (spec-12). Build CalibrationItem[] from the transcript:
    // each candidate turn carrying a finite spec-02 `confidence`. correct is
    // binarized from the single per-attempt correctness dimension (isCorrect;
    // D11 removed the hire verdict, so correctness is the honest signal). hard =
    // the drawn question's tier !== 'hard'.
    // Every interview item is `voice` (gate #7, §3.2a) — keeps the interview delta
    // separable from in-lesson typein/binary captures. Computed HERE (function body,
    // not inside the tx closure) so `cal` survives to the return (gate Issue #10).
    const correct = isCorrect(report.dimensions.correctness?.score ?? 0)
    const hard = question.tier !== 'hard'
    const calItems: CalibrationItem[] = transcript
      .filter((t) => t.role === 'candidate' && Number.isFinite(t.confidence))
      .map((t) => ({
        confidence: t.confidence as number,
        correct,
        hard,
        format: 'voice' as CalibrationFormat,
      }))
    const cal = scoreCalibration(calItems)

    // 5 — transaction: finalize attempt + seen-set + usage + calibration trend
    // (reads before writes).
    const stateRef = db().doc(`users/${uid}/interviewState/${conceptId}`)
    const usageRef = db().doc(`users/${uid}/interviewUsage/${usageDay}`)
    const summaryRef = db().doc(`users/${uid}/calibration/summary`)

    await db().runTransaction(async (tx) => {
      const stateSnap = await tx.get(stateRef)
      const usageSnap = await tx.get(usageRef)
      // Read the calibration trend BEFORE any write (only when this attempt has
      // confidence to fold — Track A folds nothing).
      const summarySnap = cal.n > 0 ? await tx.get(summaryRef) : null

      const seenIds: string[] = (stateSnap.data()?.seenQuestionIds ?? []) as string[]
      const prevSeconds = (usageSnap.data()?.secondsUsed ?? 0) as number
      const prevCount = (usageSnap.data()?.sessionCount ?? 0) as number
      const cappedDuration = Math.min(durationSec, SESSION_CAP_SECONDS)

      // Write 1: finalize attempt (audio is NEVER stored). The per-attempt
      // calibration block is added ONLY when cal.n > 0 (Track-A null-safe — no
      // confidence ⇒ no block, no trend fold; spec-12 §3.2).
      tx.set(
        attemptRef,
        {
          status: 'graded',
          transcript,
          report,
          durationSec: cappedDuration,
          ...(cal.n > 0 ? { calibration: cal } : {}),
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

      // Write 4 (spec-12 §3.3): fold this attempt's items into the cross-concept
      // calibration trend doc — same pure fold the Daily-Review reps use (running
      // mean == batch mean across both sources). Only when cal.n > 0; summarySnap
      // was read in the read phase above. Denormals recomputed pooled + per-format.
      if (cal.n > 0 && summarySnap) {
        const prior = (summarySnap.data() ?? {}) as {
          n?: number
          brierSum?: number
          confidenceSum?: number
          correctSum?: number
          byFormat?: Partial<Record<CalibrationFormat, TrendSums>>
        }
        const folded = foldAttemptIntoTrend(
          {
            n: prior.n ?? 0,
            brierSum: prior.brierSum ?? 0,
            confidenceSum: prior.confidenceSum ?? 0,
            correctSum: prior.correctSum ?? 0,
            byFormat: prior.byFormat,
          },
          calItems,
        )
        const byFormatDenorm: Partial<Record<CalibrationFormat, ReturnType<typeof denormSums>>> = {}
        for (const f of Object.keys(folded.byFormat) as CalibrationFormat[]) {
          byFormatDenorm[f] = denormSums(folded.byFormat[f] as TrendSums)
        }
        tx.set(
          summaryRef,
          {
            ...denormSums({
              n: folded.n,
              brierSum: folded.brierSum,
              confidenceSum: folded.confidenceSum,
              correctSum: folded.correctSum,
            }),
            byFormat: byFormatDenorm,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        )
      }
    })

    return { report, attemptId, calibration: cal }
  },
)
