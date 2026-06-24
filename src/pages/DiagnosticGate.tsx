// Pre-L1 diagnostic pre-check (L1 §6 / §3.3). A tiny (~4 question) graded flow
// that routes the learner to Track A (scaffolded) or Track B (the current
// experience). Pure UI + client-side scoring; the parent persists the chosen
// track and proceeds. Tap-only, one question at a time, mobile-first.

import { useState } from 'react'
import type { Track } from '../progress/track'

type Question = {
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean }[]
}

// Each question probes one L1 prerequisite (½, averaging, independence, the
// "progress resets" idea). Getting most right ⇒ the lean Track B; otherwise the
// scaffolded Track A. Deliberately short and low-stakes.
const QUESTIONS: Question[] = [
  {
    id: 'half',
    prompt: 'A fair coin lands heads with probability…',
    options: [
      { id: 'a', label: '½ — 1 in 2', correct: true },
      { id: 'b', label: '⅓ — 1 in 3', correct: false },
      { id: 'c', label: 'It depends on the last flip', correct: false },
    ],
  },
  {
    id: 'avg',
    prompt: 'The average of 2, 4, and 6 is…',
    options: [
      { id: 'a', label: '4', correct: true },
      { id: 'b', label: '6', correct: false },
      { id: 'c', label: '12', correct: false },
    ],
  },
  {
    id: 'independence',
    prompt: 'You just flipped four tails in a row. The next flip is…',
    options: [
      { id: 'a', label: 'Still 50/50 — the coin has no memory', correct: true },
      { id: 'b', label: "More likely heads — it's due", correct: false },
      { id: 'c', label: "More likely tails — it's hot", correct: false },
    ],
  },
  {
    id: 'progress',
    prompt: "You're waiting for HH and just saw one H. A tail next means…",
    options: [
      { id: 'a', label: 'You start over — no progress kept', correct: true },
      { id: 'b', label: 'You still have your H', correct: false },
      { id: 'c', label: "You've matched HH", correct: false },
    ],
  },
]

// 3+ of 4 correct ⇒ Track B (confident); otherwise Track A (scaffolded).
const TRACK_B_THRESHOLD = 3

export function DiagnosticGate({ onDone }: { onDone: (track: Track) => void }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const q = QUESTIONS[index]
  const isLast = index === QUESTIONS.length - 1
  const picked = answers[q.id] ?? null

  function finish() {
    const correct = QUESTIONS.reduce((n, question) => {
      const choice = answers[question.id]
      const opt = question.options.find((o) => o.id === choice)
      return n + (opt?.correct ? 1 : 0)
    }, 0)
    onDone(correct >= TRACK_B_THRESHOLD ? 'B' : 'A')
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
        <div className="mcq" role="radiogroup" aria-label="Choose one">
          {q.options.map((opt) => {
            const on = picked === opt.id
            return (
              <button
                type="button"
                role="radio"
                aria-checked={on}
                key={opt.id}
                className={`mcq__option${on ? ' mcq__option--on' : ''}`}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </main>

      <footer className="actionbar">
        <button
          type="button"
          className="btn btn--primary"
          disabled={picked === null}
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          {isLast ? 'See my path' : 'Next'}
        </button>
      </footer>
    </div>
  )
}
