// Onboarding survey (ADR-0006). Mandatory 4-question flow shown once, after
// display-name capture and before the catalog. The final question (pace) submits
// straight to the catalog — no summary screen. Reuses DiagnosticGate / lesson
// shell CSS classes; minimal onboarding.css adds option-button styles.

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { loadCoursesFromFirestore } from '../content/firestoreLoader'
import type { Course } from '../content/schema'
import {
  comfortToDefaultTrack,
  focusAreaOptions,
  recommendConcept,
  type LearningGoal,
  type ComfortLevel,
  type Pace,
} from './onboarding.model'
import { analytics } from '../analytics/events'
import { ROUTES, type NavigateFn } from './routes'

type Answers = {
  learningGoal?: LearningGoal
  comfortLevel?: ComfortLevel
  focusArea?: string
  pace?: Pace
}

const LEARNING_GOAL_OPTIONS: { value: LearningGoal; label: string }[] = [
  { value: 'interview', label: 'Prep for quant interviews' },
  { value: 'school', label: 'School & exams' },
  { value: 'intuition', label: 'Sharpen my intuition' },
  { value: 'curious', label: 'Just curious' },
]

const COMFORT_OPTIONS: { value: ComfortLevel; label: string }[] = [
  { value: 'new', label: 'New to quant questions' },
  { value: 'dabbled', label: "I've dabbled" },
  { value: 'comfortable', label: 'Fairly comfortable' },
  { value: 'confident', label: 'Very confident' },
]

const PACE_OPTIONS: { value: Pace; label: string }[] = [
  { value: 'casual', label: 'Casual — a little when I can' },
  { value: 'steady', label: 'Steady — a few times a week' },
  { value: 'intense', label: 'Intense — every day' },
]

export function OnboardingSurvey({ navigate }: { navigate: NavigateFn }) {
  const { completeOnboarding } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [writeError, setWriteError] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadCoursesFromFirestore()
      .then((c) => { if (!cancelled) setCourses(c) })
      .catch(() => { if (!cancelled) setCourses([]) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (step === 0) void analytics.onboardingStarted()
  }, [step])

  const focusOptions = courses ? focusAreaOptions(courses) : []

  // ── Step navigation ────────────────────────────────────────────────────────

  // Advances through the first three questions.
  function choose(
    field: 'learningGoal' | 'comfortLevel' | 'focusArea',
    value: string,
  ) {
    setAnswers((prev) => ({ ...prev, [field]: value }))
    void analytics.onboardingStepCompleted({ step: field, value })
    setStep((s) => s + 1)
  }

  // Final question (pace): record it and submit immediately — no summary screen.
  function choosePace(value: string) {
    const pace = value as Pace
    void analytics.onboardingStepCompleted({ step: 'pace', value: pace })
    const final: Answers = { ...answers, pace }
    setAnswers(final)
    void submit(final)
  }

  // Persists the profile (must succeed before leaving this gated screen) and
  // routes to the catalog. On failure, shows an inline retry.
  async function submit(final: Answers) {
    const { learningGoal, comfortLevel, focusArea, pace } = final
    if (!learningGoal || !comfortLevel || !focusArea || !pace || !courses) return
    const defaultTrack = comfortToDefaultTrack(comfortLevel)
    const recommendedConceptId = recommendConcept(courses, focusArea)

    setBusy(true)
    setWriteError(false)
    try {
      await completeOnboarding({
        learningGoal,
        comfortLevel,
        focusArea,
        pace,
        defaultTrack,
        recommendedConceptId,
      })
      void analytics.onboardingCompleted({
        learningGoal,
        comfortLevel,
        focusArea,
        pace,
        defaultTrack,
        recommendedConceptId,
      })
      navigate(ROUTES.landing, { replace: true })
    } catch {
      setWriteError(true)
      setBusy(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="lesson">
      <header className="topbar">
        <div className="topbar__center">
          <span className="topbar__title">Get started</span>
        </div>
      </header>

      {busy || writeError ? (
        <>
          <section className="prompt">
            <p className="prompt__kicker">Almost there</p>
            <p className="prompt__text">
              {writeError ? "Couldn't save your answers." : 'Setting up your path…'}
            </p>
          </section>
          {writeError && (
            <footer className="actionbar">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void submit(answers)}
              >
                Try again
              </button>
            </footer>
          )}
        </>
      ) : (
        <>
          {step === 0 && (
            <SurveyStep
              kicker="Step 1 of 4"
              question="What brings you to Ergo?"
              options={LEARNING_GOAL_OPTIONS}
              onChoose={(v) => choose('learningGoal', v)}
            />
          )}

          {step === 1 && (
            <SurveyStep
              kicker="Step 2 of 4"
              question="How comfortable are you with quant-style questions?"
              options={COMFORT_OPTIONS}
              onChoose={(v) => choose('comfortLevel', v)}
            />
          )}

          {step === 2 && (
            <SurveyStep
              kicker="Step 3 of 4"
              question="Where do you want to start?"
              options={
                focusOptions.length > 0
                  ? focusOptions.map((d) => ({ value: d, label: d }))
                  : [{ value: 'Probability', label: 'Probability' }]
              }
              onChoose={(v) => choose('focusArea', v)}
            />
          )}

          {step === 3 && (
            <SurveyStep
              kicker="Step 4 of 4"
              question="What pace suits you?"
              options={PACE_OPTIONS}
              onChoose={choosePace}
            />
          )}
        </>
      )}
    </div>
  )
}

// ── Single-select question step ───────────────────────────────────────────────

function SurveyStep({
  kicker,
  question,
  options,
  onChoose,
}: {
  kicker: string
  question: string
  options: { value: string; label: string }[]
  onChoose: (value: string) => void
}) {
  return (
    <div>
      <section className="prompt">
        <p className="prompt__kicker">{kicker}</p>
        <p className="prompt__text">{question}</p>
      </section>

      <main className="region">
        <div className="onboarding-options">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="onboarding-option"
              onClick={() => onChoose(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
