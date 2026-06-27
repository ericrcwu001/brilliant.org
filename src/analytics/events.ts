// Firebase Analytics event wrapper (Phase 19). One typed entry point per event
// in the success-metrics taxonomy (docs/mvp_prd.md "Success Metrics and
// Instrumentation"). Every event auto-carries the uid (or an anonymous client
// id pre-auth) and a client timestamp; callers pass lessonId/beatId plus the
// event-specific params.
//
// Analytics is lazy and best-effort: it initializes only in a supported browser
// that has a measurementId, is skipped entirely in emulator/dev mode, and every
// logEvent is fire-and-forget (a failure never affects the lesson UI). This
// keeps /dev/lesson and the node test suite free of analytics/network calls.

import type { Analytics } from 'firebase/analytics'
import { app, auth, usingEmulators } from '../firebase/app'

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as
  | string
  | undefined

let analyticsPromise: Promise<Analytics | null> | null = null

function getAnalyticsInstance(): Promise<Analytics | null> {
  // Skip in emulator/dev and when there is no measurement id to send to.
  if (usingEmulators || !measurementId) return Promise.resolve(null)
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const { isSupported, getAnalytics } = await import('firebase/analytics')
      const ok = await isSupported().catch(() => false)
      return ok ? getAnalytics(app) : null
    })().catch(() => null)
  }
  return analyticsPromise
}

// Shared analytics DIMENSIONS (spec-04 §3.2 Layer 1). Resolved ONCE per session
// (not per call) so every event can be sliced by cohort/track without a new event
// taxonomy. Fail-absent: an unset dimension is OMITTED, never a guessed value.
//
//  - `cohort` enum is co-defined in README §4.5: 'treatment' | 'holdout' (the
//    control arm is named 'holdout'; there is NO 'control' literal). It is set
//    ONLY by spec-05's server-derived assignment (R12 — never from a spoofable
//    client value); undefined until spec-05 stamps it, so spec-04's A-B read
//    degrades to a single-cohort descriptive read pre-spec-05.
//  - `track` reuses the existing isQuantIntensity track value (README §4 helper);
//    set by the track context (spec-10/20). NOT re-derived here.
let sessionDimensions: { cohort?: 'treatment' | 'holdout'; track?: 'A' | 'B' } = {}

// Called once at session start as the user/cohort context becomes known. spec-05
// calls it with `cohort`; the track context calls it with `track`. Merges so each
// dimension can be set independently as it resolves.
export function setAnalyticsDimensions(d: {
  cohort?: 'treatment' | 'holdout'
  track?: 'A' | 'B'
}): void {
  sessionDimensions = { ...sessionDimensions, ...d }
}

const ANON_KEY = 'phht.anonClientId'

// A stable per-browser id for pre-auth events (taxonomy: "uid or anonymous
// client id pre-auth"). Falls back gracefully if storage is unavailable.
function anonClientId(): string {
  try {
    const existing = localStorage.getItem(ANON_KEY)
    if (existing) return existing
    const id = `anon-${crypto.randomUUID()}`
    localStorage.setItem(ANON_KEY, id)
    return id
  } catch {
    return 'anon'
  }
}

// Assembles the final event params: the auto-carried uid/client_ts, the shared
// session dimensions (undefined keys OMITTED — fail-absent), then the call params.
// Pure + exported so the omit-undefined contract is unit-testable without Firebase
// (spec-04 §5 case 8).
export function buildEventParams(
  uid: string,
  params: Record<string, unknown>,
): Record<string, unknown> {
  const dims: Record<string, unknown> = {}
  if (sessionDimensions.cohort !== undefined) dims.cohort = sessionDimensions.cohort
  if (sessionDimensions.track !== undefined) dims.track = sessionDimensions.track
  return {
    uid,
    client_ts: Date.now(),
    ...dims,
    ...params,
  }
}

async function track(
  name: string,
  params: Record<string, unknown>,
): Promise<void> {
  try {
    const analyticsInstance = await getAnalyticsInstance()
    if (!analyticsInstance) return
    const { logEvent } = await import('firebase/analytics')
    logEvent(
      analyticsInstance,
      name,
      buildEventParams(auth.currentUser?.uid ?? anonClientId(), params),
    )
  } catch {
    // Fire-and-forget: instrumentation must never break the learning flow.
  }
}

type BeatRef = { lessonId: string; beatId: string }

export const analytics = {
  beatViewed: (b: BeatRef) => track('beat_viewed', b),
  answerSubmitted: (
    b: BeatRef & { attemptN: number; correct: boolean; hintLevel: number },
  ) => track('answer_submitted', b),
  hintRevealed: (b: BeatRef & { hintLevel: number }) =>
    track('hint_revealed', b),
  predictionSet: (b: BeatRef & { value: number | string }) =>
    track('prediction_set', b),
  // Which-method discrimination gate pick (spec-13 / D12). Fired when the learner
  // resolves a `prediction` gate beat; `picked` is the option label, `correct` the
  // server-of-record grade (optionMethods[i] === gate.correct), `schemaId` the
  // method under test. Additive — the gate is a graded `prediction`, not a new type.
  methodGatePicked: (
    b: BeatRef & { picked: string; correct: boolean; schemaId: string },
  ) => track('method_gate_picked', b),
  simulationRun: (b: BeatRef & { n: number }) => track('simulation_run', b),
  lessonCompleted: (p: { lessonId: string; needsReview: boolean }) =>
    track('lesson_completed', p),
  // `kind` distinguishes instant silver from a delayed/transfer gold mint so the
  // gold-mint rate (spec-04 §3.1 metric 3) is computable. Optional so spec-11 (the
  // mint owner) can pass it independently; existing callers compile unchanged.
  milestoneEarned: (p: {
    lessonId: string
    milestoneId: string
    kind?: 'silver' | 'delayed_gold' | 'transfer_gold'
  }) => track('milestone_earned', p),
  streakIncremented: (p: { count: number; date: string }) =>
    track('streak_incremented', p),
  reviewRecommendedShown: (p: { lessonId: string }) =>
    track('review_recommended_shown', p),
  // Fired when a graded answer is a retrieval rep (README §4 Foundation D / spec-03).
  // Counted by the governor (spec-21)/calibration (spec-12)/dashboards; independent
  // of the streak (D10). Consumers wire the call site; this only reserves the hook.
  retrievalRep: (
    p: { lessonId: string; beatId: string; schemaId?: string; correct: boolean; source: 'lesson' | 'review' },
  ) => track('retrieval_rep', p),
  // Confidence captured on a checkpoint beat (spec-02 / D6). `value` is the
  // self-reported probability in [0.5,1.0]; quant-intensity gate only. Passive
  // signal — spec-12 scores calibration, not here.
  confidenceRated: (b: BeatRef & { value: number }) =>
    track('confidence_rated', b),
  catalogViewed: () => track('catalog_viewed', {}),
  conceptSelected: (p: { conceptId: string }) => track('concept_selected', p),
  onboardingStarted: () => track('onboarding_started', {}),
  onboardingStepCompleted: (p: { step: string; value: string }) =>
    track('onboarding_step_completed', p),
  onboardingCompleted: (p: {
    learningGoal: string
    comfortLevel: string
    focusArea: string
    pace: string
    defaultTrack: string
    recommendedConceptId: string
  }) => track('onboarding_completed', p),
  recommendationShown: (p: { recommendedConceptId: string }) =>
    track('recommendation_shown', p),
  quickCheckOffered: (p: { conceptId: string }) => track('quick_check_offered', p),
  quickCheckCompleted: (p: { conceptId: string; track: 'A' | 'B'; skipped: boolean }) =>
    track('quick_check_completed', p),

  interviewCtaClicked: (p: {
    conceptId: string
    surface: 'lesson_complete' | 'concept_page' | 'catalog_hero'
  }) => track('interview_cta_clicked', p),
  interviewStarted: (p: {
    conceptId: string
    questionId: string
    tier: 'hard' | 'harder' | 'brutal'
    mode: 'voice' | 'text'
  }) => track('interview_started', p),
  interviewConnected: (p: { conceptId: string }) =>
    track('interview_connected', p),
  interviewFallbackUsed: (p: { conceptId: string }) =>
    track('interview_fallback_used', p),
  interviewCompleted: (p: {
    conceptId: string
    questionId: string
    durationSec: number
    hireSignal: string
  }) => track('interview_completed', p),
  interviewReportViewed: (p: { conceptId: string; attemptId: string }) =>
    track('interview_report_viewed', p),
  interviewQuotaBlocked: (p: {
    conceptId: string
    reason: 'daily' | 'session'
  }) => track('interview_quota_blocked', p),
  interviewError: (p: {
    conceptId: string
    stage: 'mint' | 'connect' | 'grade'
  }) => track('interview_error', p),
}
