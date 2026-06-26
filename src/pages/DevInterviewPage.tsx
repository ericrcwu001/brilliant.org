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
    />
  )
}
