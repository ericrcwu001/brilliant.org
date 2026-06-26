// Dev-only stub transport for the /dev/interview harness (Phase 3).
// Implements RealtimeTransport; fires synthetic events at intervals so the
// InterviewPage state machine exercises the live → grading → done path without
// any Firebase auth or OpenAI calls.
//
// IMPORTANT: never imports course-*.json pack files. Uses an inline fixture.

import type { RealtimeTransport } from './useRealtimeInterview'
import type { ClientQuestion } from './functions'

// Minimal inline ClientQuestion fixture — no pack import.
const FIXTURE_QUESTION: ClientQuestion = {
  id:          'ev-q1-stub',
  tier:        'hard',
  fingerprint: 'stub',
  prompt:      'A biased coin has P(H) = 0.6. What is the expected number of flips to get the first head?',
  source:      'stub fixture',
  engineCheck: { module: 'stub', verified: true },
  followUps:   [],
}

// Canned conversation turns emitted after the session starts.
const CANNED_TURNS: Array<{ role: 'interviewer' | 'candidate'; text: string }> = [
  { role: 'interviewer', text: FIXTURE_QUESTION.prompt },
  { role: 'candidate',   text: "Let me think… the expected number of flips to get the first head in a geometric distribution is 1/p." },
  { role: 'interviewer', text: "That's right. Can you derive why it's 1/p from first principles?" },
  { role: 'candidate',   text: "Sure. Let E be the expected flips. On the first flip: with prob p we get heads (1 flip), otherwise with prob 1-p we start over. So E = p·1 + (1-p)·(1+E), which gives E = 1/p." },
  { role: 'interviewer', text: "Excellent derivation. So for P(H) = 0.6 the answer is 1/0.6 ≈ 1.67 flips. What if we wanted at least two heads?" },
]

export const stubRealtimeTransport: RealtimeTransport = {
  async connect(
    _clientSecret: string,
    _micStream: MediaStream | null,
    onEvent: (event: Record<string, unknown>) => void,
  ) {
    // Build a silent remote MediaStream for the Orb via an AudioContext oscillator.
    let remoteStream: MediaStream | null = null
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0 // silent
      osc.connect(gain)
      const dest = ctx.createMediaStreamDestination()
      gain.connect(dest)
      osc.start()
      remoteStream = dest.stream
    } catch {
      // AudioContext unavailable in test environments — fall back to null.
    }

    // Fire session.created synchronously (triggers connecting → live).
    setTimeout(() => {
      onEvent({ type: 'session.created', session: { type: 'realtime' } })
    }, 50)

    // Emit canned turns at 800 ms intervals.
    CANNED_TURNS.forEach((turn, i) => {
      const delay = 500 + i * 800
      setTimeout(() => {
        const type =
          turn.role === 'interviewer'
            ? 'response.output_audio_transcript.done'
            : 'conversation.item.input_audio_transcription.completed'
        onEvent({ type, transcript: turn.text })

        if (turn.role === 'interviewer') {
          onEvent({ type: 'output_audio_buffer.started', response_id: `stub-${i}` })
          setTimeout(() => {
            onEvent({ type: 'output_audio_buffer.stopped', response_id: `stub-${i}` })
          }, 300)
        }
      }, delay)
    })

    return {
      remoteStream,
      sendRaw: () => { /* no-op */ },
      close: () => { /* no-op */ },
    }
  },
}

export { FIXTURE_QUESTION }
