// TEMPORARY demo-only fixture page — safe to delete after recording.

import type { InterviewReport } from '../content/interviewPack'
import type { InterviewAttempt } from '../interview/attempts'
import type { CalibrationResult } from '../progress/calibration'
import { InterviewReportView } from '../interview/InterviewReportView'
import { RubricTrend } from '../interview/RubricTrend'

const CONCEPT_ID = 'course-pattern-hitting-times'

// ── Fixture report: match variant — shows green "✓ Verified against the engine" ──

const MATCH_REPORT: InterviewReport = {
  dimensions: {
    correctness: {
      score: 5,
      evidence:
        '"The expected hitting time is 6 — I set up the first-step recurrence and solved it exactly."',
    },
    approach: {
      score: 4,
      evidence:
        '"Immediately conditioned on the first coin flip and wrote the recurrence without prompting."',
    },
    rigor: {
      score: 4,
      evidence:
        '"Named all equations, justified boundary conditions, and checked the answer by substitution."',
    },
    communication: {
      score: 5,
      evidence:
        '"Clear verbal walk-through at every step; the interviewer had no need to ask clarifying questions."',
    },
    speed: {
      score: 4,
      evidence: '"Reached the final answer in under 4 minutes with no significant dead ends."',
    },
  },
  summary:
    'Strong performance on a brutal-tier question. The first-step analysis was set up quickly and correctly, and the final answer matched the engine exactly.',
  strengths: [
    'Correct first-step recurrence set up without prompting.',
    'Clear verbal explanation throughout the derivation.',
    'Committed to "6" and verified it by substitution.',
  ],
  fixes: [
    'State boundary conditions explicitly before solving to make grading unambiguous.',
    'Speed can improve — aim for ≤3 minutes on hard-tier recurrences with practice.',
  ],
  tier: 'brutal',
  pressureNote:
    'You performed well under time pressure. Keep practising until the recurrence feels automatic.',
  correctnessAnchor: {
    applied: true,
    verdict: 'match',
    expected: '6',
    extracted: '6',
  },
}

// ── Fixture report: mismatch variant — shows red "✗ didn't match the engine" ──

const MISMATCH_REPORT: InterviewReport = {
  dimensions: {
    correctness: {
      score: 1,
      evidence:
        '"Said the answer was 5 — the engine-canonical value is 6. Small arithmetic slip in the final solve step."',
    },
    approach: {
      score: 3,
      evidence:
        '"Set up the first-step recurrence correctly; the error was computational, not conceptual."',
    },
    rigor: {
      score: 3,
      evidence:
        '"Good overall structure; the slip was in the final algebra, not the reasoning."',
    },
    communication: {
      score: 4,
      evidence:
        '"Explained the method clearly even though the final number was wrong."',
    },
    speed: {
      score: 4,
      evidence: '"Reached a final answer quickly; speed was not the limiting factor."',
    },
  },
  summary:
    'The approach was sound but an arithmetic error in the final solve step produced the wrong answer. The engine expected 6; you gave 5.',
  strengths: [
    'Correct recurrence structure set up from the start.',
    'Good verbal communication of the method.',
  ],
  fixes: [
    'Re-check arithmetic on the final solve step — substitute your answer back to verify.',
    'Slow down on the last line when committing to a number.',
  ],
  tier: 'hard',
  pressureNote:
    'A timed setting amplifies small arithmetic errors. One sanity-check step at the end prevents this.',
  correctnessAnchor: {
    applied: true,
    verdict: 'mismatch',
    expected: '6',
    extracted: '5',
  },
}

// ── Calibration fixture (n=8, slightly overconfident) ──

const CALIBRATION: CalibrationResult = {
  n: 8,
  brier: 0.14,
  meanConfidence: 0.78,
  accuracy: 0.63,
  overconfidence: 0.15,
  reliable: true,
}

// ── RubricTrend fixture: 3 graded attempts, means ~2.6 → 3.6 → 4.8 ──
// `report` is typed unknown on InterviewAttempt; the inline object is accepted.

const TREND_ATTEMPTS: InterviewAttempt[] = [
  {
    id: 'fixture-attempt-1',
    conceptId: CONCEPT_ID,
    questionId: 'q-pht-hard-001',
    fingerprint: 'fp-fixture-001',
    tier: 'hard',
    mode: 'text',
    status: 'graded',
    startedAt: 1_700_000_000_000,
    createdAt: 1_700_000_000_000,
    gradedAt: 1_700_000_600_000,
    // mean = (2+3+2+3+3)/5 = 2.6
    report: {
      dimensions: {
        correctness: { score: 2 },
        approach: { score: 3 },
        rigor: { score: 2 },
        communication: { score: 3 },
        speed: { score: 3 },
      },
    },
  },
  {
    id: 'fixture-attempt-2',
    conceptId: CONCEPT_ID,
    questionId: 'q-pht-harder-002',
    fingerprint: 'fp-fixture-002',
    tier: 'harder',
    mode: 'text',
    status: 'graded',
    startedAt: 1_701_000_000_000,
    createdAt: 1_701_000_000_000,
    gradedAt: 1_701_000_600_000,
    // mean = (3+4+3+4+4)/5 = 3.6
    report: {
      dimensions: {
        correctness: { score: 3 },
        approach: { score: 4 },
        rigor: { score: 3 },
        communication: { score: 4 },
        speed: { score: 4 },
      },
    },
  },
  {
    id: 'fixture-attempt-3',
    conceptId: CONCEPT_ID,
    questionId: 'q-pht-brutal-003',
    fingerprint: 'fp-fixture-003',
    tier: 'brutal',
    mode: 'text',
    status: 'graded',
    startedAt: 1_702_000_000_000,
    createdAt: 1_702_000_000_000,
    gradedAt: 1_702_000_600_000,
    // mean = (5+5+4+5+5)/5 = 4.8
    report: {
      dimensions: {
        correctness: { score: 5 },
        approach: { score: 5 },
        rigor: { score: 4 },
        communication: { score: 5 },
        speed: { score: 5 },
      },
    },
  },
]

export function DevReportPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
        Capstone report (fixture)
      </h1>
      <p
        style={{
          marginBottom: '2rem',
          fontSize: '0.8rem',
          opacity: 0.5,
          fontFamily: 'monospace',
        }}
      >
        /dev/report — demo only, not wired to Firebase
      </p>

      <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
        Match variant — "Verified against the engine"
      </h2>
      <InterviewReportView
        report={MATCH_REPORT}
        attemptId="fixture-attempt-match"
        conceptId={CONCEPT_ID}
        inAppAccuracy={0.85}
        showCalibration
        calibration={CALIBRATION}
        onClose={() => {}}
      />

      <hr style={{ margin: '2.5rem 0', opacity: 0.2 }} />

      <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
        Mismatch variant — "didn't match the engine"
      </h2>
      <InterviewReportView
        report={MISMATCH_REPORT}
        attemptId="fixture-attempt-mismatch"
        conceptId={CONCEPT_ID}
        onClose={() => {}}
      />

      <hr style={{ margin: '2.5rem 0', opacity: 0.2 }} />

      <h2 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
        Rubric trend (fixture)
      </h2>
      <RubricTrend attempts={TREND_ATTEMPTS} />
    </div>
  )
}

export default DevReportPage
