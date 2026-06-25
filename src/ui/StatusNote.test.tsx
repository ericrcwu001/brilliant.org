import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { StatusNote } from './StatusNote'

// Tests run in Node (no jsdom). renderToString exercises the static render path.
// StatusNote is pure DOM — all ARIA attributes are assertable in SSR output.

describe('StatusNote', () => {
  it('renders role="status" with data-testid and data-tone', () => {
    const html = renderToString(<StatusNote tone="error">Write failed</StatusNote>)
    expect(html).toContain('role="status"')
    expect(html).toContain('data-testid="status-note"')
    expect(html).toContain('data-tone="error"')
    expect(html).toContain('Write failed')
  })

  it('renders offline tone', () => {
    const html = renderToString(<StatusNote tone="offline">Saving…</StatusNote>)
    expect(html).toContain('data-tone="offline"')
  })

  it('renders info tone with extra className', () => {
    const html = renderToString(
      <StatusNote tone="info" className="custom">
        Loaded
      </StatusNote>,
    )
    expect(html).toContain('data-tone="info"')
    expect(html).toContain('ui-status-note')
    expect(html).toContain('custom')
  })

  it('renders without tone', () => {
    const html = renderToString(<StatusNote>Neutral</StatusNote>)
    expect(html).toContain('role="status"')
    expect(html).toContain('Neutral')
  })
})
