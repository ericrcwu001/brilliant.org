import { LessonPlayer } from './lesson/LessonPlayer'

// Minimal dev router. Group A has no auth/landing/course path (those arrive in
// Group C); the dev-only /dev/lesson route exercises the flagship lesson from
// the local fixture.
function App() {
  if (window.location.pathname === '/dev/lesson') {
    return <LessonPlayer />
  }

  return (
    <div className="landing">
      <h1>
        Why does <code>HH</code> take longer to appear than <code>HT</code>?
      </h1>
      <p>State thinking for quant interviews.</p>
      <a href="/dev/lesson">Open the flagship lesson (dev)</a>
    </div>
  )
}

export default App
