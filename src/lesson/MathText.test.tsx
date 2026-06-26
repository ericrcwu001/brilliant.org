import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { MathText, mathToPlain } from './MathText'

describe('MathText', () => {
  it('renders plain text unchanged with no katex element', () => {
    const html = renderToString(<MathText>hello world</MathText>)
    expect(html).toContain('hello world')
    expect(html).not.toContain('data-testid="katex"')
  })

  it('renders inline math and preserves surrounding words', () => {
    const html = renderToString(<MathText>{'wait \\(E=6\\) flips'}</MathText>)
    expect(html).toContain('data-testid="katex"')
    expect(html).toContain('wait')
    expect(html).toContain('flips')
  })

  it('renders display math', () => {
    const html = renderToString(<MathText>{'\\[E=6\\]'}</MathText>)
    expect(html).toContain('data-testid="katex"')
  })
})

describe('mathToPlain', () => {
  it('strips inline delimiters leaving inner tex', () => {
    expect(mathToPlain('\\(E=6\\)')).toBe('E=6')
  })
})
