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

async function track(
  name: string,
  params: Record<string, unknown>,
): Promise<void> {
  try {
    const analyticsInstance = await getAnalyticsInstance()
    if (!analyticsInstance) return
    const { logEvent } = await import('firebase/analytics')
    logEvent(analyticsInstance, name, {
      uid: auth.currentUser?.uid ?? anonClientId(),
      client_ts: Date.now(),
      ...params,
    })
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
  simulationRun: (b: BeatRef & { n: number }) => track('simulation_run', b),
  lessonCompleted: (p: { lessonId: string; needsReview: boolean }) =>
    track('lesson_completed', p),
  milestoneEarned: (p: { lessonId: string; milestoneId: string }) =>
    track('milestone_earned', p),
  streakIncremented: (p: { count: number; date: string }) =>
    track('streak_incremented', p),
  reviewRecommendedShown: (p: { lessonId: string }) =>
    track('review_recommended_shown', p),
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
