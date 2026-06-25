import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Katex } from './Katex'

// Tests run in Node (no jsdom). renderToString exercises the sync render path.
// Dynamic imports inside useEffect don't run during server rendering, so the
// raw tex fallback is what we assert against.

describe('Katex', () => {
  it('renders without crashing and exposes role="math" with tex fallback', () => {
    const html = renderToString(<Katex tex="x^2 + y^2 = r^2" />)
    expect(html).toContain('role="math"')
    expect(html).toContain('x^2 + y^2 = r^2')
    expect(html).toContain('visually-hidden')
  })
})
