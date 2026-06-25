import { describe, it, expect } from 'vitest'
import { revealHeadline } from './gsapText'

describe('revealHeadline (reduced motion)', () => {
  it('resolves without importing gsap and sets opacity to "1"', async () => {
    // reduced: true path never touches gsap — just sets visible state immediately.
    const el = { style: { opacity: '' } } as unknown as HTMLElement
    await revealHeadline(el, { reduced: true })
    expect(el.style.opacity).toBe('1')
  })
})
