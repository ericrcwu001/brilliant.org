// renderToString smoke for the Orb component — node env, no jsdom.
// In SSR, useEffect doesn't run so no WebGL/AudioContext/rAF is invoked;
// this test guards against import-time crashes and verifies the accessibility
// contract (aria-hidden on the decorative container).
import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Orb } from './Orb'

describe('Orb (smoke — renderToString)', () => {
  it('renders without throwing (reducedMotion=true)', () => {
    expect(() =>
      renderToString(<Orb remoteStream={null} isAiSpeaking={false} reducedMotion />),
    ).not.toThrow()
  })

  it('renders without throwing (no reducedMotion prop)', () => {
    expect(() =>
      renderToString(<Orb remoteStream={null} isAiSpeaking={false} />),
    ).not.toThrow()
  })

  it('container div has aria-hidden="true"', () => {
    const html = renderToString(<Orb remoteStream={null} isAiSpeaking={false} reducedMotion />)
    expect(html).toContain('aria-hidden="true"')
  })

  it('renders the .iv-orb container class', () => {
    const html = renderToString(<Orb remoteStream={null} isAiSpeaking={false} reducedMotion />)
    expect(html).toContain('iv-orb')
  })

  it('renders a <canvas> element inside the container', () => {
    const html = renderToString(<Orb remoteStream={null} isAiSpeaking={false} reducedMotion />)
    expect(html).toContain('<canvas')
  })
})
