// Dev harness — renders InterviewPage with a stubbed transport.
// No Firebase auth, no OpenAI calls. Navigate to /dev/interview to use.
import { InterviewPage } from './InterviewPage'
import { stubRealtimeTransport } from '../interview/stubRealtimeTransport'

export function DevInterviewPage() {
  return (
    <InterviewPage
      navigate={(to) => { window.history.pushState({}, '', to) }}
      conceptId="course-expected-value"
      _transport={stubRealtimeTransport}
      // spec-22 §3.4: preview the practice-vs-performance gap block without a real
      // course/progress load (a high in-app accuracy vs the report's correctness
      // surfaces the gap framing).
      devInAppAccuracy={0.9}
      // spec-23 §7: preview the predicted-vs-measured calibration delta (gate on)
      // without a real graded attempt — meanConfidence .8 vs accuracy .6 surfaces
      // the overconfidence sentence.
      showCalibration
      devCalibration={{
        n: 1,
        brier: 0.2,
        meanConfidence: 0.8,
        accuracy: 0.6,
        overconfidence: 0.2,
        reliable: false,
      }}
    />
  )
}
