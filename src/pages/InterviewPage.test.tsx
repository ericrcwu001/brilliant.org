// renderToString smokes for InterviewPage — node env, no jsdom.
// Mocks the realtime hook, the Orb (WebGL/AudioContext), and firebase/app
// to guard against import-time crashes in those modules.
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { UseRealtimeInterviewReturn } from '../interview/useRealtimeInterview'

vi.mock('../interview/useRealtimeInterview', () => ({
  useRealtimeInterview: vi.fn(),
}))

vi.mock('../interview/Orb', () => ({
  // Orb is decorative; return null to avoid WebGL/AudioContext in node env.
  Orb: () => null,
}))

vi.mock('../firebase/app', () => ({
  getDb: vi.fn(),
  getFns: vi.fn(),
  auth: { currentUser: null },
  usingEmulators: true,
  app: {},
}))

vi.mock('firebase/analytics', () => ({
  isSupported: vi.fn(() => Promise.resolve(false)),
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
}))

import { useRealtimeInterview } from '../interview/useRealtimeInterview'
import { InterviewPage } from './InterviewPage'

const SESSION_CAP = 480

function makeReturn(overrides: Partial<UseRealtimeInterviewReturn>): UseRealtimeInterviewReturn {
  return {
    status: 'idle',
    transcript: [],
    isAiSpeaking: false,
    userSpeaking: false,
    remoteStream: null,
    secondsLeft: SESSION_CAP,
    error: null,
    report: null,
    attemptId: null,
    start: vi.fn(),
    stop: vi.fn(),
    submitConfidence: vi.fn(),
    ...overrides,
  }
}

describe('InterviewPage (smoke — renderToString)', () => {
  beforeEach(() => {
    vi.mocked(useRealtimeInterview).mockReturnValue(makeReturn({}))
  })

  describe('status: idle', () => {
    it('renders without throwing', () => {
      expect(() =>
        renderToString(<InterviewPage navigate={() => {}} conceptId="course-expected-value" />),
      ).not.toThrow()
    })

    it('renders the .iv-ready container', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('iv-ready')
    })

    it('renders the Start interview button', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('Start interview')
    })
  })

  describe('status: live', () => {
    beforeEach(() => {
      vi.mocked(useRealtimeInterview).mockReturnValue(
        makeReturn({ status: 'live', transcript: [], secondsLeft: SESSION_CAP }),
      )
    })

    it('renders without throwing', () => {
      expect(() =>
        renderToString(<InterviewPage navigate={() => {}} conceptId="course-expected-value" />),
      ).not.toThrow()
    })

    it('renders the aria-live="polite" transcript region', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('aria-live="polite"')
    })

    it('does not render the typed-input field (voice-first)', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).not.toContain('iv-typed-input')
    })

    it('renders the countdown', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('iv-countdown')
    })

    it('renders a remote-audio element for playback', () => {
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('<audio')
    })
  })

  describe('status: grading', () => {
    it('renders the grading state', () => {
      vi.mocked(useRealtimeInterview).mockReturnValue(makeReturn({ status: 'grading' }))
      const html = renderToString(
        <InterviewPage navigate={() => {}} conceptId="course-expected-value" />,
      )
      expect(html).toContain('Grading your interview')
    })
  })
})
