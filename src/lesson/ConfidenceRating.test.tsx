// Smoke + contract tests for ConfidenceRating (spec-02 / D6). NODE env, no jsdom
// — assert the static renderToString HTML + the exported CONFIDENCE_SCALE that
// spec-12 imports (so its values can never silently drift out of [0.5,1.0]).
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ConfidenceRating, CONFIDENCE_SCALE } from './ConfidenceRating'

describe('CONFIDENCE_SCALE (the contract spec-12 imports)', () => {
  it('is exactly the four buckets {0.5, 0.7, 0.85, 1.0}', () => {
    expect(CONFIDENCE_SCALE.map((b) => b.value)).toEqual([0.5, 0.7, 0.85, 1.0])
  })

  it('every value lies in [0.5, 1.0] (self-report range, never < chance floor)', () => {
    for (const b of CONFIDENCE_SCALE) {
      expect(b.value).toBeGreaterThanOrEqual(0.5)
      expect(b.value).toBeLessThanOrEqual(1.0)
    }
  })

  it('maps the top bucket label "Certain" to 1.0', () => {
    const certain = CONFIDENCE_SCALE.find((b) => b.label === 'Certain')
    expect(certain?.value).toBe(1.0)
  })
})

describe('ConfidenceRating render', () => {
  it('renders all four bucket labels', () => {
    const html = renderToString(<ConfidenceRating onSelect={() => {}} />)
    for (const b of CONFIDENCE_SCALE) {
      expect(html).toContain(b.label)
    }
  })

  it('renders the default question prompt', () => {
    const html = renderToString(<ConfidenceRating onSelect={() => {}} />)
    expect(html).toContain('How sure are you?')
  })

  it('uses the passed question prompt', () => {
    const html = renderToString(
      <ConfidenceRating onSelect={() => {}} question="How sure were you before checking?" />,
    )
    expect(html).toContain('How sure were you before checking?')
  })

  it('marks exactly the selected bucket aria-checked', () => {
    const html = renderToString(<ConfidenceRating value={0.85} onSelect={() => {}} />)
    // Exactly one radio is checked when a value is selected.
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1)
    // And it is the "Fairly sure" (0.85) bucket — the checked button carries its label.
    expect(html).toMatch(/aria-checked="true"[^>]*>Fairly sure</)
  })

  it('checks nothing when no value is selected', () => {
    const html = renderToString(<ConfidenceRating onSelect={() => {}} />)
    expect(html).not.toContain('aria-checked="true"')
  })
})
