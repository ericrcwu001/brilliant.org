import React from 'react'
import { renderToString } from 'react-dom/server'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useAmbient } from './useAmbient'

// Tests run in Node (no jsdom). React renderToString is used to exercise
// useState initializers — effects do not run in server rendering.

describe('useAmbient', () => {
  beforeEach(() => {
    // Simulate prefers-reduced-motion: reduce being active.
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when prefers-reduced-motion is active', () => {
    let active: boolean | null = null
    function Probe() {
      const ref = React.useRef<Element | null>(null)
      active = useAmbient(ref)
      return null
    }
    renderToString(React.createElement(Probe))
    expect(active).toBe(false)
  })
})
