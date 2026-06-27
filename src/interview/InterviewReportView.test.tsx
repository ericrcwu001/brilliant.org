// renderToString smoke for InterviewReportView — node env, no jsdom.
// Mocks firebase/app to prevent initializeApp crashing in the test runner.
import { renderToString } from 'react-dom/server'
import { describe, it, expect, vi } from 'vitest'
import type { InterviewReport } from '../content/interviewPack'

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

import { InterviewReportView } from './InterviewReportView'

const fixtureReport: InterviewReport = {
  dimensions: {
    correctness: { score: 3, evidence: 'Mostly correct answer.' },
    approach: { score: 4, evidence: 'Good systematic approach.' },
    rigor: { score: 3, evidence: 'Reasonable justification.' },
    communication: { score: 4, evidence: 'Explained clearly.' },
    speed: { score: 3, evidence: 'On pace for the tier.' },
  },
  summary: 'Good overall performance with minor gaps.',
  strengths: ['Correct setup', 'Clear articulation'],
  fixes: ['Justify convergence', 'Define random variable explicitly'],
  tier: 'hard',
  pressureNote: 'A live timed interview is harder than untimed practice.',
}

// spec-12 CalibrationResult shape: meanConfidence .8 vs accuracy .6 → +.2 overconfident.
const overconfidentCalibration = {
  n: 1,
  brier: 0.2,
  meanConfidence: 0.8,
  accuracy: 0.6,
  overconfidence: 0.2,
  reliable: false,
}

describe('InterviewReportView (smoke — renderToString)', () => {
  it('renders without throwing', () => {
    expect(() =>
      renderToString(
        <InterviewReportView
          report={fixtureReport}
          attemptId="a1"
          conceptId="course-expected-value"
        />,
      ),
    ).not.toThrow()
  })

  it('renders all five dimension labels', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    for (const label of ['Correctness', 'Approach', 'Rigor', 'Communication', 'Speed']) {
      expect(html, `missing dimension label: ${label}`).toContain(label)
    }
  })

  it('renders NO hire-signal verdict (D11 / spec-23): no verdict text, no iv-signal class', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    expect(html).not.toContain('Lean Yes')
    expect(html).not.toContain('iv-signal')
    for (const verdict of ['Strong No', 'Lean No', 'Strong Yes']) {
      expect(html, `verdict leaked: ${verdict}`).not.toContain(verdict)
    }
  })

  it('renders the feed-forward "next fixes" framing', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    expect(html).toContain('What to work on next')
  })

  it('shows the calibration delta when showCalibration is on and a calibration is passed', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        showCalibration
        calibration={overconfidentCalibration}
      />,
    )
    expect(html).toContain('Calibration')
    expect(html).toContain('80%')
    expect(html).toContain('60%')
    expect(html).toContain('overconfidence')
  })

  it('hides the calibration delta for Track A (showCalibration false) even with a calibration prop', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        showCalibration={false}
        calibration={overconfidentCalibration}
      />,
    )
    expect(html).not.toContain('Calibration')
  })

  it('hides the calibration delta when n === 0 even with the gate on', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        showCalibration
        calibration={{ n: 0, brier: null, meanConfidence: null, accuracy: null, overconfidence: null, reliable: false }}
      />,
    )
    expect(html).not.toContain('Calibration')
  })

  it('exposes NO share/export/download affordance for the report or calibration (README §4.6)', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        showCalibration
        calibration={overconfidentCalibration}
      />,
    )
    expect(html).not.toMatch(/share|export|download/i)
  })

  it('has aria-label="Interview report"', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    expect(html).toContain('aria-label="Interview report"')
  })

  it('renders the summary text', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    expect(html).toContain('Good overall performance with minor gaps.')
  })

  it('renders strengths and fixes when present', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
      />,
    )
    expect(html).toContain('Strengths')
    expect(html).toContain('To improve')
  })

  it('renders a Done button when onClose is provided', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        onClose={() => {}}
      />,
    )
    expect(html).toContain('Done')
  })

  it('hides the gap block when inAppAccuracy is null but renders the rest', () => {
    const html = renderToString(
      <InterviewReportView
        report={fixtureReport}
        attemptId="a1"
        conceptId="course-expected-value"
        inAppAccuracy={null}
      />,
    )
    expect(html).not.toContain('Practice vs interview')
    expect(html).toContain('Correctness') // rest of the report still renders
  })

  it('renders the gap block with the tier label and pressure note when inAppAccuracy is set', () => {
    const brutalReport: InterviewReport = {
      ...fixtureReport,
      dimensions: {
        ...fixtureReport.dimensions,
        correctness: { score: 2, evidence: 'Partial.' }, // interview acc 0.4
      },
      tier: 'brutal',
      pressureNote: 'Improving under-pressure retrieval is the goal.',
    }
    const html = renderToString(
      <InterviewReportView
        report={brutalReport}
        attemptId="a1"
        conceptId="course-expected-value"
        inAppAccuracy={0.9} // gap = 0.5 ≥ threshold
      />,
    )
    expect(html).toContain('Practice vs interview')
    expect(html).toContain('brutal')
    expect(html).toContain('Improving under-pressure retrieval is the goal.')
    expect(html).toContain('In practice')
    expect(html).toContain('In the interview')
  })

  it('falls back to a static pressure note when report.pressureNote is empty', () => {
    const oldReport: InterviewReport = { ...fixtureReport, pressureNote: '' }
    const html = renderToString(
      <InterviewReportView
        report={oldReport}
        attemptId="a1"
        conceptId="course-expected-value"
        inAppAccuracy={0.9}
      />,
    )
    expect(html).toContain('under-pressure retrieval')
  })
})
