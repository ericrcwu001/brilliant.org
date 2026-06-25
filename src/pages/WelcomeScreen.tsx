// First-run welcome (new accounts only). Shown once, right after display-name
// capture and before the course path's Quick check, to greet the learner and
// offer the optional introduction (L0, `lesson-first-heads`). "Start the
// introduction" enters L0; "Skip for now" continues to the path. The parent
// (CoursePathPage) records that the welcome was shown and handles navigation.

import { useEffect, useRef } from 'react'

export function WelcomeScreen({
  displayName,
  onStartIntro,
  onSkip,
}: {
  displayName: string
  onStartIntro: () => void
  onSkip: () => void
}) {
  const startRef = useRef<HTMLButtonElement>(null)
  // Land focus on the primary action for keyboard / screen-reader users.
  useEffect(() => {
    startRef.current?.focus()
  }, [])

  return (
    <main className="authpage">
      <div className="authcard welcome">
        <p className="authcard__eyebrow">Welcome</p>
        <h1 className="authcard__title">Welcome, {displayName}!</h1>
        <p className="authcard__sub">
          Ergo is a learn-by-doing course in probability. Want to
          start with a short, optional warm-up — flip a coin and discover why the
          first heads usually takes about two flips?
        </p>
        <p className="welcome__note">
          It’s optional. You can skip straight to the course and take the intro
          anytime from your path.
        </p>

        <div className="authactions">
          <button
            type="button"
            className="btn btn--primary"
            ref={startRef}
            onClick={onStartIntro}
          >
            Start the introduction
          </button>
          <button type="button" className="btn btn--secondary" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </div>
    </main>
  )
}
