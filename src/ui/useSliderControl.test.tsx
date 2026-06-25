import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { useSliderControl } from './useSliderControl'

// Tests run in Node (no jsdom). renderToString exercises the hook's initial state.
// React Aria is SSR-safe; refs are null but the static HTML is fully formed.
// Keyboard arrow-key assertions (ArrowRight → value change) require a browser
// environment with real focus/event dispatch and are deferred to Wave 3
// integration testing.

function SliderFixture({
  value = 50,
  min = 0,
  max = 100,
}: {
  value?: number
  min?: number
  max?: number
}) {
  const {
    groupProps,
    trackProps,
    labelProps,
    outputProps,
    thumbProps,
    inputProps,
    inputRef,
    trackRef,
    label,
    output,
  } = useSliderControl({
    value,
    onChange: () => {},
    minValue: min,
    maxValue: max,
    step: 1,
    label: 'Test slider',
  })
  return (
    <div {...groupProps}>
      <label {...labelProps}>{label}</label>
      <output {...outputProps}>{output}</output>
      <div {...trackProps} ref={trackRef}>
        <div {...thumbProps}>
          <input {...inputProps} ref={inputRef} />
        </div>
      </div>
    </div>
  )
}

describe('useSliderControl', () => {
  it('renders an input[type=range] accessible slider', () => {
    const html = renderToString(<SliderFixture value={50} />)
    expect(html).toContain('type="range"')
  })

  it('exposes aria-valuetext with the current value', () => {
    const html = renderToString(<SliderFixture value={42} />)
    expect(html).toContain('aria-valuetext="42"')
  })

  it('renders the slider group with role="group"', () => {
    const html = renderToString(<SliderFixture value={25} />)
    expect(html).toContain('role="group"')
  })

  it('outputs min and max attributes from options', () => {
    const html = renderToString(<SliderFixture value={5} min={0} max={10} />)
    expect(html).toContain('min="0"')
    expect(html).toContain('max="10"')
  })

  it('exposes percent as (value - min) / (max - min)', () => {
    // percent is internal state; test via the thumb position style React Aria applies
    const html = renderToString(<SliderFixture value={50} min={0} max={100} />)
    expect(html).toContain('left:50%')
  })
})
