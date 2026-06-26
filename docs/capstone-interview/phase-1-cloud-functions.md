# Phase 1 — Cloud Functions

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

Implement the two server-authoritative callables (`mintInterviewToken`, `gradeInterview`) and their client wrappers. The server draws a question, enforces the daily quota, mints an ephemeral OpenAI Realtime token, and later grades the interview — all without the standing `OPENAI_API_KEY` ever reaching the browser or being logged.

---

## Scope

**In scope**

- `functions/src/interview.ts` (new) — both callables + `buildLiveInstructions` helper
- `functions/src/index.ts` (edit) — re-export the two callables
- `src/interview/functions.ts` (new) — typed client wrappers
- `zod` dep addition to `functions/package.json`
- App Check per-env gate for `mintInterviewToken`

**Out of scope**

- Pack authoring/validation → [Phase 2](./phase-2-interview-pack-content.md)
- WebRTC client hook + `InterviewPage` → [Phase 3](./phase-3-realtime-client.md)
- Orb → [Phase 4](./phase-4-orb.md)
- `firestore.rules` for interview subcollections → [Phase 5](./phase-5-report-persistence-and-ctas.md)
- Analytics events (`interview_*`) → [Phase 5](./phase-5-report-persistence-and-ctas.md)
- Guardrail hardening + unit tests → [Phase 6](./phase-6-guardrails-and-tests.md)

---

## Dependencies & what this unblocks

**Hard dependencies:**

- [Phase 0](./phase-0-infrastructure.md) — `OPENAI_API_KEY` secret provisioned; pack JSON at `functions/packs/`
- [Phase 2A](./phase-2-interview-pack-content.md) — `InterviewPackSchema`, `InterviewPack`/`Question`/`ClientQuestion` types, `interviewDraw` module available in the functions bundle path

**Unblocks:**

- [Phase 3](./phase-3-realtime-client.md) — needs `mintInterviewToken` to return a token + `ClientQuestion`
- [Phase 5](./phase-5-report-persistence-and-ctas.md) — needs `gradeInterview` to write the report

---

## Detailed design

### 3.1 `functions/src/interview.ts` (new)

New file alongside `functions/src/index.ts`, `functions/src/milestones.ts`, and `functions/src/streaks.ts`.

#### 3.1.1 Imports and top-level constants

```ts
import { onCall, HttpsError, type CallableRequest } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// Phase 2A — import from wherever P2A places the shared schema in functions/src/
import {
  InterviewPackSchema,
  type InterviewPack,
  type Question,
  type ClientQuestion,
} from './interviewPack'
import { interviewDraw } from './interviewDraw'

// Shared timezone helpers (already in the bundle via streaks.ts)
import { localDateInTimezone, isValidTimezone } from './streaks'
```

This is the **first callable file to use `defineSecret`** — an import that does not appear in `functions/src/index.ts:16-22` today.

```ts
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')

// Shared Firestore handle (mirrors index.ts pattern: const db = getFirestore())
const db = getFirestore()

// Caps — load-bearing, enforced server-side (spec index § Caps/constants)
const SESSION_CAP_SECONDS     = 480    // 8 min hard per-session
const DAILY_QUOTA_SECONDS     = 1800   // 30 min per user per day
const TOKEN_TTL_SECONDS       = 600    // expires_after.seconds at mint
const REALTIME_MODEL          = 'gpt-realtime'
const REALTIME_VOICE          = 'marin'
const GRADER_MODEL            = 'gpt-5.5'   // pin a snapshot for production

const FALLBACK_TZ = 'UTC'

// App Check: enforce only when deployed to the prod project, never in the emulator.
// Dev project (brilliant-org-dev) has no reCAPTCHA key (src/firebase/app.ts:44);
// enforcing there would block all requests.
const enforceAppCheck =
  process.env.GCLOUD_PROJECT === 'brilliant-org' &&
  process.env.FUNCTIONS_EMULATOR !== 'true'
```

`requireUid` and `requireString` are **not** re-declared — they already exist in `functions/src/index.ts:60-66` and `68-73`. Import them from `./index` or duplicate the two small helpers in this file (preferred: duplicate to avoid a circular import, since `index.ts` will re-export from here).

```ts
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
```

Pack loading helper (see [Phase 0 §4](./phase-0-infrastructure.md#4-packfunctions-bundling)):

```ts
function loadPack(conceptId: string): InterviewPack {
  const filename = `course-${conceptId}.json`
  const filepath = path.join(__dirname, '../packs', filename)
  let raw: string
  try {
    raw = fs.readFileSync(filepath, 'utf8')
  } catch {
    throw new HttpsError('not-found', `No interview pack for concept: ${conceptId}`)
  }
  return InterviewPackSchema.parse(JSON.parse(raw))
}
```

---

#### 3.1.2 `mintInterviewToken`

Full I/O contracts: [spec index — Callable I/O contracts](./README.md#callable-io-contracts).

```ts
export const mintInterviewToken = onCall(
  { enforceAppCheck, secrets: [OPENAI_API_KEY] },
  async (request: CallableRequest<MintInterviewTokenInput>) => {
    // Step 1 — auth
    const uid = requireUid(request)
    const data = request.data ?? {}
    const conceptId = requireString(data.conceptId, 'conceptId')
    const mode = data.mode === 'text' ? 'text' : 'voice'

    // Step 2 — resolve day from timezone
    const tz = isValidTimezone(data.timezone) ? data.timezone! : FALLBACK_TZ
    const day = localDateInTimezone(tz)            // streaks.ts:76-83

    // Step 3 — quota check (read; throw before any write)
    const usageRef  = db.doc(`users/${uid}/interviewUsage/${day}`)
    const usageSnap = await usageRef.get()
    const secondsUsed = (usageSnap.data()?.secondsUsed ?? 0) as number
    const dailyRemaining = Math.max(0, DAILY_QUOTA_SECONDS - secondsUsed)
    if (secondsUsed >= DAILY_QUOTA_SECONDS) {
      throw new HttpsError(
        'resource-exhausted',
        'Daily interview quota reached. Try again tomorrow.',
      )
    }

    // Step 4 — load pack
    const pack = loadPack(conceptId)

    // Step 5 — load seen-set
    const stateRef  = db.doc(`users/${uid}/interviewState/${conceptId}`)
    const stateSnap = await stateRef.get()
    const seenQuestionIds: string[] =
      stateSnap.data()?.seenQuestionIds ?? []

    // Step 6 — draw question via Phase 2A module
    const { question, followUps } = interviewDraw(pack, seenQuestionIds)

    // Step 7 — write pending attempt
    const attemptRef = db.collection(`users/${uid}/interviews`).doc()
    const attemptId  = attemptRef.id
    await attemptRef.set({
      conceptId,
      questionId:  question.id,
      fingerprint: question.fingerprint,
      tier:        question.tier,
      mode,
      status:      'pending',
      // _usageDay stored so gradeInterview can increment the correct bucket
      // without requiring a timezone param in GradeInterviewInput.
      _usageDay:   day,
      startedAt:   FieldValue.serverTimestamp(),
      createdAt:   FieldValue.serverTimestamp(),
    })

    // Step 8 — build live session instructions (LEAK-SAFE — see spec index leak mitigation)
    const instructions = buildLiveInstructions(pack, question)

    // Step 9 — mint ephemeral token
    const key = OPENAI_API_KEY.value()
    // OpenAI-Safety-Identifier: a stable, hashed uid bound to the token.
    const safetyId = crypto.createHash('sha256').update(uid).digest('hex').slice(0, 32)

    const mintRes = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization':              `Bearer ${key}`,
        'Content-Type':               'application/json',
        'OpenAI-Safety-Identifier':   safetyId,
      },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: TOKEN_TTL_SECONDS },
        session: {
          type:              'realtime',
          model:             REALTIME_MODEL,
          instructions,
          output_modalities: ['audio'],
          audio: {
            input: {
              format:         { type: 'audio/pcm', rate: 24000 },
              transcription:  { model: 'gpt-4o-mini-transcribe', language: 'en' },
              turn_detection: {
                type: 'semantic_vad', eagerness: 'auto',
                create_response: true, interrupt_response: true,
              },
              noise_reduction: { type: 'near_field' },
            },
            output: {
              format: { type: 'audio/pcm', rate: 24000 },
              voice:  REALTIME_VOICE,
              speed:  1.0,
            },
          },
        },
      }),
    })

    if (!mintRes.ok) {
      const body = await mintRes.text()
      throw new HttpsError('internal', `OpenAI mint failed: ${mintRes.status} ${body}`)
    }

    const mintData = await mintRes.json() as { value: string; expires_at: number }

    // Step 10 — return (NEVER return the standing API key)
    const clientQuestion = toClientQuestion(question)
    return {
      clientSecret:          mintData.value,    // ek_... ephemeral key only
      expiresAt:             mintData.expires_at,
      model:                 REALTIME_MODEL,
      attemptId,
      question:              clientQuestion,
      sessionCapSeconds:     SESSION_CAP_SECONDS,
      dailyRemainingSeconds: dailyRemaining,
    } satisfies MintInterviewTokenOutput
  },
)
```

`toClientQuestion` strips `hidden` and reduces `engineCheck` (mirrors the `toClientPack` contract from [spec index pack schema](./README.md#interview-pack-schema)):

```ts
function toClientQuestion(q: Question): ClientQuestion {
  const { hidden: _hidden, engineCheck, ...rest } = q
  return {
    ...rest,
    engineCheck: { module: engineCheck.module, verified: engineCheck.verified },
  }
}
```

---

#### 3.1.3 `gradeInterview`

Full I/O contracts: [spec index — Callable I/O contracts](./README.md#callable-io-contracts).

```ts
export const gradeInterview = onCall(
  { secrets: [OPENAI_API_KEY] },
  async (request: CallableRequest<GradeInterviewInput>) => {
    // Step 1 — auth
    const uid       = requireUid(request)
    const data      = request.data ?? {}
    const attemptId = requireString(data.attemptId, 'attemptId')
    const conceptId = requireString(data.conceptId, 'conceptId')
    const transcript: Turn[] = Array.isArray(data.transcript) ? data.transcript : []
    const durationSec = typeof data.durationSec === 'number' ? data.durationSec : 0

    // Step 2 — load + verify pending attempt (read before transaction)
    const attemptRef  = db.doc(`users/${uid}/interviews/${attemptId}`)
    const attemptSnap = await attemptRef.get()
    if (!attemptSnap.exists) {
      throw new HttpsError('not-found', 'Interview attempt not found.')
    }
    if (attemptSnap.get('status') !== 'pending') {
      throw new HttpsError('failed-precondition', 'Attempt is not pending.')
    }
    if (attemptSnap.get('conceptId') !== conceptId) {
      throw new HttpsError('invalid-argument', 'conceptId mismatch.')
    }

    const questionId  = attemptSnap.get('questionId') as string
    const usageDay    = attemptSnap.get('_usageDay') as string   // written at mint

    // Step 3 — load full pack + drawn question's hidden fields
    const pack       = loadPack(conceptId)
    const question   = pack.questions.find((q) => q.id === questionId)
    if (!question) {
      throw new HttpsError('internal', `Question ${questionId} not found in pack.`)
    }

    // Step 4 — grade via Responses API (Structured Outputs strict)
    //   The hidden.answer / approaches / rubric are consumed here ONLY — they
    //   are never written to the attempt document or returned to the client.
    const key = OPENAI_API_KEY.value()
    const graderPrompt = buildGraderPrompt(question, transcript)

    const gradeRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:     GRADER_MODEL,
        input:     graderPrompt,
        reasoning: { effort: 'medium' },
        text: {
          format: {
            type:   'json_schema',
            name:   'interview_grade',
            strict: true,
            schema: INTERVIEW_REPORT_SCHEMA,
          },
        },
      }),
    })

    if (!gradeRes.ok) {
      const body = await gradeRes.text()
      throw new HttpsError('internal', `OpenAI grade failed: ${gradeRes.status} ${body}`)
    }

    const gradeData = await gradeRes.json() as { output: Array<{ content: Array<{ text: string }> }> }
    const reportJson = gradeData.output[0]?.content[0]?.text ?? '{}'
    const report = JSON.parse(reportJson) as InterviewReport

    // Step 5 — transaction: finalize attempt + update seen-set + increment usage
    //   Reads before writes (mirrors index.ts:141-171)
    const stateRef = db.doc(`users/${uid}/interviewState/${conceptId}`)
    const usageRef = db.doc(`users/${uid}/interviewUsage/${usageDay}`)

    await db.runTransaction(async (tx) => {
      // All reads first
      const stateSnap = await tx.get(stateRef)
      const usageSnap = await tx.get(usageRef)

      const seenIds: string[] = stateSnap.data()?.seenQuestionIds ?? []
      const prevSeconds = usageSnap.data()?.secondsUsed ?? 0
      const prevCount   = usageSnap.data()?.sessionCount ?? 0

      const cappedDuration = Math.min(durationSec, SESSION_CAP_SECONDS)

      // Write 1: finalize attempt (audio is NEVER stored)
      tx.set(attemptRef, {
        status:      'graded',
        transcript,
        report,
        hireSignal:  report.hireSignal,
        durationSec: cappedDuration,
        gradedAt:    FieldValue.serverTimestamp(),
        updatedAt:   FieldValue.serverTimestamp(),
      }, { merge: true })

      // Write 2: seen-set (idempotent add — mirrors milestones.ts:46-63 pattern)
      const newSeen = Array.from(new Set([...seenIds, questionId]))
      tx.set(stateRef, {
        seenQuestionIds: newSeen,
        attemptCount:    (stateSnap.data()?.attemptCount ?? 0) + 1,
        lastAttemptAt:   FieldValue.serverTimestamp(),
      }, { merge: true })

      // Write 3: usage bucket
      tx.set(usageRef, {
        date:         usageDay,
        secondsUsed:  prevSeconds + cappedDuration,
        sessionCount: prevCount + 1,
        updatedAt:    FieldValue.serverTimestamp(),
      }, { merge: true })
    })

    return { report, attemptId } satisfies GradeInterviewOutput
  },
)
```

`buildGraderPrompt` formats the transcript + server-side rubric/answer for the grader:

```ts
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
```

**`INTERVIEW_REPORT_SCHEMA`** — concrete JSON Schema for `strict: true` (per [README Appendix A §6](./README.md#6-grader-separate-server-side-pass-not-realtime); every property in `required`, `additionalProperties: false` everywhere):

```ts
const INTERVIEW_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    dimensions: {
      type: 'object',
      properties: {
        correctness:   { $ref: '#/$defs/dim' },
        approach:      { $ref: '#/$defs/dim' },
        rigor:         { $ref: '#/$defs/dim' },
        communication: { $ref: '#/$defs/dim' },
        speed:         { $ref: '#/$defs/dim' },
      },
      required: ['correctness', 'approach', 'rigor', 'communication', 'speed'],
      additionalProperties: false,
    },
    hireSignal: {
      type: 'string',
      enum: ['Strong No', 'No', 'Lean No', 'Lean Yes', 'Yes', 'Strong Yes'],
    },
    summary:   { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    fixes:     { type: 'array', items: { type: 'string' } },
  },
  required: ['dimensions', 'hireSignal', 'summary', 'strengths', 'fixes'],
  additionalProperties: false,
  $defs: {
    dim: {
      type: 'object',
      properties: {
        score:    { type: 'integer', minimum: 1, maximum: 5 },
        evidence: { type: 'string' },
      },
      required: ['score', 'evidence'],
      additionalProperties: false,
    },
  },
} as const
```

The `$defs`/`$ref` pattern is supported by the OpenAI Responses API in strict mode.

---

#### 3.1.4 `buildLiveInstructions` — LEAK-SAFE helper

Fills the live session `instructions` field. This is the **only** place where pack content enters the Realtime session. Per [spec index — Leak mitigation](./README.md#leak-mitigation), the session echoes `instructions` back to the browser in `session.created`; the helper is therefore the single enforcement point for what the browser can see.

**Allowed:** `pack.interviewerPrompt`, question `prompt`/`tier`/`source`, method-only `hintLadder`, qualitative `rubric` text, `followUps`.

**Forbidden:** `hidden.answer`, `hidden.approaches`, `hidden.wrongTurns`, `engineCheck.answer`.

```ts
function buildLiveInstructions(pack: InterviewPack, question: Question): string {
  const r = question.hidden.rubric
  return [
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
```

The pack's build-time NO-LEAK guard (confirmed by `verify-ev-independent.ts` in HANDOFF) ensures `hintLadder` rungs are method-only and contain no evaluated numerical answers. This helper trusts that invariant and passes rungs through verbatim.

---

### 3.2 `functions/src/index.ts` (edit)

Add two re-export lines at the **bottom** of the file, after the existing `completeLesson` and `recordQualifyingAction` exports. The `initializeApp()` and `setGlobalOptions(...)` at `functions/src/index.ts:24-26` must execute before any callable from either file is registered; placing the re-export at the bottom ensures this:

```ts
// At the bottom of functions/src/index.ts:
export { mintInterviewToken, gradeInterview } from './interview'
```

No other changes to `index.ts`.

---

### 3.3 `src/interview/functions.ts` (new)

Client wrappers mirroring `src/progress/functions.ts:60-70`. Uses `getFns()` from `src/firebase/app.ts:88-102` for the lazy-loaded Functions handle. The `timezone` field is enriched client-side (same pattern as `recordQualifyingAction` enriches `timezone` in `src/progress/functions.ts:77`).

```ts
import { httpsCallable } from 'firebase/functions'
import { getFns } from '../firebase/app'

// Types mirror the README I/O contracts (spec index § Callable I/O contracts)
// Imported from src/content/interviewPack.ts (Phase 2A)
import type { ClientQuestion } from '../content/interviewPack'

export type MintInterviewTokenInput = {
  conceptId:  string
  mode?:      'voice' | 'text'
  // timezone is injected below; not part of the caller-facing type
}

export type MintInterviewTokenOutput = {
  clientSecret:          string   // ek_... ephemeral key
  expiresAt:             number   // unix seconds
  model:                 string
  attemptId:             string
  question:              ClientQuestion
  sessionCapSeconds:     number
  dailyRemainingSeconds: number
}

export type GradeInterviewInput = {
  attemptId:   string
  conceptId:   string
  transcript:  Turn[]
  durationSec: number
}

export type GradeInterviewOutput = {
  report:    InterviewReport
  attemptId: string
}

// Turn + InterviewReport types are defined in spec index § Report and turn types
// and imported from src/content/interviewPack.ts (or a co-located types file in Phase 2A)
export type { Turn, InterviewReport, HireSignal } from '../content/interviewPack'

export async function mintInterviewToken(
  input: MintInterviewTokenInput,
): Promise<MintInterviewTokenOutput> {
  // Enrich timezone client-side (server resolves the local day from it)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const functions = await getFns()
  const fn = httpsCallable<
    MintInterviewTokenInput & { timezone: string },
    MintInterviewTokenOutput
  >(functions, 'mintInterviewToken')
  const res = await fn({ ...input, timezone })
  return res.data
}

export async function gradeInterview(
  input: GradeInterviewInput,
): Promise<GradeInterviewOutput> {
  const functions = await getFns()
  const fn = httpsCallable<GradeInterviewInput, GradeInterviewOutput>(
    functions,
    'gradeInterview',
  )
  const res = await fn(input)
  return res.data
}
```

---

### 3.4 Quota, draw, and grade helpers

**Draw logic.** `interviewDraw(pack, seenQuestionIds)` is a pure function defined in [Phase 2A](./phase-2-interview-pack-content.md) at `src/content/interviewDraw.ts`. Functions bundle it via `functions/src/interviewDraw.ts` (copied or re-exported by Phase 2A). It returns `{ question: Question, followUps: string[] }` — the drawn question and its `followUps` array from the pack.

**Quota math.** At mint time, only the daily `secondsUsed >= DAILY_QUOTA_SECONDS` check is enforced; no usage is _reserved_ at mint (avoiding a TOCTOU correction at grade time for the non-gating interview). Usage is incremented at grade time by `Math.min(durationSec, SESSION_CAP_SECONDS)`. The small window where two concurrent sessions could both pass the quota check is acceptable — the interview gates nothing.

**Abandoned sessions.** If the learner closes the page after `mintInterviewToken` succeeds but never calls `gradeInterview`, the `interviews/{attemptId}` document stays `status: "pending"`. No usage is incremented; the ephemeral token expires after `TOKEN_TTL_SECONDS = 600 s`. The pending document accumulates as inert debris; it can be cleaned up by [Phase 6](./phase-6-guardrails-and-tests.md) guardrails if desired.

**`zod` dependency.** Add to `functions/package.json`:

```json
"dependencies": {
  "firebase-admin":     "^13.10.0",
  "firebase-functions": "^7.2.5",
  "zod":                "^3.23.0"
}
```

Run `npm install` inside `functions/` after editing.

---

## Data contracts

All Firestore collection paths, document schemas, constants, and `Turn`/`InterviewReport`/`HireSignal` types are in the [spec index shared contracts](./README.md#shared-contracts).

Phase 1 adds one **implementation field** not enumerated in the spec index layout: `_usageDay: string` (the `YYYY-MM-DD` resolved at mint) stored on the pending attempt document. This field is internal to the server; it is never returned to the client and is not part of the public `MintInterviewTokenOutput`.

---

## Acceptance criteria & verification

Steps marked **user-run** require the Node v24.3.0 `firebase` alias and/or an active emulator (no Java locally).

- [ ] **TypeScript compile:** `cd functions && ./node_modules/.bin/tsc` exits 0 with the new file. Run this first — it does not require the emulator or Java.
- [ ] **No secrets in return values:** code review confirms `OPENAI_API_KEY.value()` is used only inside handlers and never assigned to a variable that is returned, logged, or passed to the client.
- [ ] **Leak rule enforced:** `buildLiveInstructions` contains no reference to `question.hidden.answer`, `question.hidden.approaches`, `question.hidden.wrongTurns`, or `question.engineCheck.answer`. Verify by code inspection and [Phase 6](./phase-6-guardrails-and-tests.md) unit test.
- [ ] **Deploy (user-run):** `firebase deploy --only functions --project brilliant-org-dev` under the Node v24.3.0 alias.
- [ ] **Mint returns a token (user-run):** call `mintInterviewToken({ conceptId: 'expected-value' })` from an authenticated client. Expect `clientSecret` starts with `ek_`, `question` is a `ClientQuestion` with no `hidden` field, `attemptId` is a non-empty string.
- [ ] **Grade writes a report (user-run):** call `gradeInterview` with a synthetic `transcript`, a valid `attemptId`, and `durationSec: 60`. Expect `report.hireSignal` is one of the six `HireSignal` values; the attempt document in Firestore transitions to `status: "graded"`.
- [ ] **Quota enforced:** after exhausting the daily quota (or temporarily lowering `DAILY_QUOTA_SECONDS` to 0 in a test), `mintInterviewToken` throws `HttpsError('resource-exhausted')`.
- [ ] **App Check gate (dev project):** `mintInterviewToken` succeeds from the dev project (`brilliant-org-dev`) without App Check tokens (confirming `enforceAppCheck = false` for non-prod).

> Firestore rules for the interview subcollections are **not yet authored** in P1. Rules are written in [Phase 5](./phase-5-report-persistence-and-ctas.md). Until then, use the emulator with `singleProjectMode: true` (which bypasses rules) or temporarily allow the collections in a dev-only rule block. Do not deploy open rules to production.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| **App Check breaks dev** — `enforceAppCheck: true` in the dev project would block all requests since the client never initializes App Check there (`src/firebase/app.ts:44`). | Per-env gate: `process.env.GCLOUD_PROJECT === 'brilliant-org' && process.env.FUNCTIONS_EMULATOR !== 'true'`. Confirmed OFF for `brilliant-org-dev` and the local emulator. |
| **Secret exposure** — `OPENAI_API_KEY.value()` called in a handler and inadvertently logged or returned. | Never assign to a variable outside the `fetch` call. Never return it in any response shape. Code review + Phase 6 test asserting the return value has no field matching `/^sk-/` or `/^Bearer/`. |
| **Leak via `instructions`** — `session.created` echoes the `instructions` to the browser over the `oai-events` data channel ([README Appendix A §5](./README.md#5-hidden-instruction-leak-risk)). | `buildLiveInstructions` is the single injection point. It must never reference `hidden.answer`, `hidden.approaches`, `hidden.wrongTurns`, or `engineCheck.answer`. The pack's build-time NO-LEAK guard on `hintLadder` provides defense-in-depth. |
| **Tamperable client transcript** — client assembles and sends the `transcript` array; a motivated user can forge it. | Acceptable: the interview gates nothing (ADR-0008 §Consequences). The server tracks the drawn question via the pending attempt's `questionId`; grading always uses the correct server-side rubric regardless of what the client sends. |
| **OpenAI Responses API shape change** — `gradeData.output[0]?.content[0]?.text` may diverge if the Responses API output format changes. | Pin the model snapshot (`GRADER_MODEL`) for production. Add a [Phase 6](./phase-6-guardrails-and-tests.md) integration test that checks the shape of a real grader response. |
| **TOCTOU on daily quota** — two concurrent mint calls could both pass the quota check. | Accepted: the interview gates nothing; the worst case is a small overage. A Firestore transaction wrapping both the quota read and the attempt write could eliminate this, at the cost of a transaction read touching the usage doc at every mint. Not worth the complexity for a non-gating feature; revisit if billing becomes a concern. |
| **`interviewDraw` import path** — `src/content/interviewDraw.ts` is outside `functions/src/`; Phase 2A must decide how to share it. | Document the dependency. Phase 2A either places a copy at `functions/src/interviewDraw.ts` or adjusts `functions/tsconfig.json` to include the shared path. Phase 1 imports from `./interviewDraw` unconditionally. |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md) — the decision
- [Spec index / shared contracts](./README.md) — Firestore layout, caps, pack schema, callable I/O, report types, leak mitigation, Appendix A
- [Phase 0 — Infrastructure](./phase-0-infrastructure.md) — secret provisioning, pack copy step
- [Phase 2 — Interview Pack Content](./phase-2-interview-pack-content.md) — `InterviewPackSchema`, `interviewDraw` (hard dependency)
- [Phase 3 — Realtime Client](./phase-3-realtime-client.md) — consumes `mintInterviewToken` output; assembles transcript for `gradeInterview`
- [Phase 5 — Report Persistence and CTAs](./phase-5-report-persistence-and-ctas.md) — `firestore.rules` for `interviews/`, `interviewUsage/`, `interviewState/`
- [Phase 6 — Guardrails and Tests](./phase-6-guardrails-and-tests.md) — unit tests for quota logic, leak rule, schema validation
