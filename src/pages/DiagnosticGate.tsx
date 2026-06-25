// Pre-concept Calibrate check (ADR-0006; was: pre-L1 Quick check). A tiny
// (~4 question) graded flow that routes the learner to Track A (scaffolded)
// or Track B (the current experience). Optional and skippable — skipping
// persists the global defaultTrack so the prompt won't re-appear for this
// concept. Pure UI + client-side scoring; the parent persists the chosen track.

import { useEffect, useState } from 'react'
import { analytics } from '../analytics/events'
import type { Track } from '../progress/track'

type Question = {
  id: string
  prompt: string
  accept: string[]
  placeholder?: string
  suffix?: string
}

// Normalize for comparison: trim, lowercase, strip whitespace. Each accepted
// form is listed explicitly (e.g. "1/2" and "0.5" don't unify).
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')

// Each question probes one L1 prerequisite (½, averaging, independence, the
// "progress resets" idea), phrased so a short typed number expresses the idea.
// Getting most right ⇒ the lean Track B; otherwise the scaffolded Track A.
const QUESTIONS: Question[] = [
  {
    id: 'half',
    prompt: 'A fair coin lands heads 1 out of how many equally likely outcomes?',
    accept: ['2'],
    placeholder: '?',
  },
  {
    id: 'avg',
    prompt: 'What is the average of 2, 4, and 6?',
    accept: ['4'],
    placeholder: '?',
  },
  {
    id: 'independence',
    prompt:
      'You just flipped four tails in a row. What percent chance does the next flip land heads?',
    accept: ['50', '50%', '1/2', '0.5'],
    placeholder: '0–100',
    suffix: '%',
  },
  {
    id: 'progress',
    prompt:
      "You're waiting for HH and just saw one H. A tail next leaves you with how many H of progress?",
    accept: ['0', 'none', 'zero'],
    placeholder: '?',
  },
]

// 3+ of 4 correct ⇒ Track B (confident); otherwise Track A (scaffolded).
const TRACK_B_THRESHOLD = 3

export function DiagnosticGate({
  conceptId,
  onDone,
  onSkip,
}: {
  conceptId: string
  onDone: (track: Track) => void
  onSkip?: () => void
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    void analytics.quickCheckOffered({ conceptId })
  }, [conceptId])

  const q = QUESTIONS[index]
  const isLast = index === QUESTIONS.length - 1
  const value = answers[q.id] ?? ''
  const filled = value.trim() !== ''

  function finish() {
    const correct = QUESTIONS.reduce((n, question) => {
      const a = norm(answers[question.id] ?? '')
      return n + (question.accept.map(norm).includes(a) ? 1 : 0)
    }, 0)
    const track: Track = correct >= TRACK_B_THRESHOLD ? 'B' : 'A'
    void analytics.quickCheckCompleted({ conceptId, track, skipped: false })
    onDone(track)
  }

  function next() {
    if (isLast) finish()
    else setIndex((i) => i + 1)
  }

  function handleSkip() {
    void analytics.quickCheckCompleted({ conceptId, track: 'A', skipped: true })
    onSkip?.()
  }

  return (
    <div className="lesson">
      <header className="topbar">
        <div className="topbar__center">
          <span className="topbar__title">Quick check</span>
        </div>
      </header>

      <section className="prompt">
        <p className="prompt__kicker">
          Question {index + 1} of {QUESTIONS.length}
        </p>
        <p className="prompt__text">{q.prompt}</p>
      </section>

      <main className="region">
        <div className="answer-entry">
          <label className="answer-entry__field">
            <span className="answer-entry__label">Your answer</span>
            <span className="answer-entry__inputwrap">
              <input
                type="text"
                className="answer-entry__input"
                aria-label={q.prompt}
                value={value}
                placeholder={q.placeholder}
                autoComplete="off"
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filled) next()
                }}
              />
              {q.suffix && (
                <span className="answer-entry__suffix">{q.suffix}</span>
              )}
            </span>
          </label>
        </div>
      </main>

      <footer className="actionbar">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!filled}
          onClick={next}
        >
          {isLast ? 'See my path' : 'Next'}
        </button>
        {onSkip && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleSkip}
          >
            Skip
          </button>
        )}
      </footer>
    </div>
  )
}
