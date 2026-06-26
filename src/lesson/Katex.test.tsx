import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Katex } from './Katex'

// Tests run in Node (no jsdom). renderToString exercises the sync render path.
// Whether KaTeX has finished its async load by render time is timing-dependent
// (cold = visually-hidden tex fallback, warm = full KaTeX markup), so assert
// only the invariants present in both states: the role="math" wrapper and tex.

describe('Katex', () => {
  it('renders without crashing and exposes role="math" with the tex', () => {
    const html = renderToString(<Katex tex="x^2 + y^2 = r^2" />)
    expect(html).toContain('role="math"')
    expect(html).toContain('data-testid="katex"')
    expect(html).toContain('x^2 + y^2 = r^2')
  })
})
