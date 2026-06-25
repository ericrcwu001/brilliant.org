import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Dialog } from './Dialog'

// Tests run in Node (no jsdom). Radix Dialog renders its content via Portal
// (ReactDOM.createPortal → document.body) which has no output in renderToString.
// Smoke tests verify the component tree is stable and props are accepted correctly.
// Full open/close + Escape-key assertions require a browser environment and are
// deferred to Wave 3 integration testing.

describe('Dialog', () => {
  it('renders without crashing when closed', () => {
    expect(() =>
      renderToString(
        <Dialog open={false} onOpenChange={() => {}} title="Test dialog">
          <p>content</p>
        </Dialog>,
      ),
    ).not.toThrow()
  })

  it('renders without crashing when open', () => {
    expect(() =>
      renderToString(
        <Dialog open={true} onOpenChange={() => {}} title="Test dialog">
          <p>content</p>
        </Dialog>,
      ),
    ).not.toThrow()
  })

  it('accepts optional description without crashing', () => {
    expect(() =>
      renderToString(
        <Dialog
          open={true}
          onOpenChange={() => {}}
          title="Title"
          description="A description"
        >
          <p>body</p>
        </Dialog>,
      ),
    ).not.toThrow()
  })
})
