// Client wrappers for the capstone-interview Cloud Functions (ADR-0008).
//
// Mirrors src/progress/functions.ts: lazy getFns() handle, httpsCallable, unwrap
// .data. mintInterviewToken enriches the IANA timezone client-side (the server
// resolves the local day key for the daily quota), exactly like
// recordQualifyingAction. The browser receives only an ephemeral ek_... token +
// a single ClientQuestion (no hidden answers, no standing key).

import { httpsCallable } from 'firebase/functions'
import { getFns } from '../firebase/app'
import type {
  ClientQuestion,
  Turn,
  InterviewReport,
} from '../content/interviewPack'
import type { CalibrationResult } from '../progress/calibration'

// Re-export the shared report/turn types so consumers import from one place.
export type { ClientQuestion, Turn, InterviewReport }

export type MintInterviewTokenInput = {
  conceptId: string
  mode?: 'voice' | 'text'
  // spec-22 / D9: track-gated difficulty floor. The quant-intensity gate sends
  // 'brutal'; Track A (default) sends 'hard'. Server-validated/clamped; absent
  // ⇒ 'hard'. Threaded route → page → hook → mint (it already spreads ...input).
  tierFloor?: 'hard' | 'harder' | 'brutal'
  // timezone is injected below; not part of the caller-facing type.
}

export type MintInterviewTokenOutput = {
  clientSecret: string // ek_... ephemeral key
  expiresAt: number // unix seconds
  model: string
  attemptId: string
  question: ClientQuestion
  sessionCapSeconds: number
  dailyRemainingSeconds: number
}

export type GradeInterviewInput = {
  attemptId: string
  conceptId: string
  transcript: Turn[]
  durationSec: number
}

export type GradeInterviewOutput = {
  report: InterviewReport
  attemptId: string
  // spec-12 / spec-23: the per-attempt calibration (Brier + predicted-vs-measured
  // delta), RETURNED so the report renders it without a doc subscription (README
  // §4.5). Optional: a Track-A attempt with no confidence captured returns no block.
  calibration?: CalibrationResult
}

export async function mintInterviewToken(
  input: MintInterviewTokenInput,
): Promise<MintInterviewTokenOutput> {
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
