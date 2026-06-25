import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { Tooltip } from './Tooltip'

// Tests run in Node (no jsdom). renderToString exercises the static render path.
// Radix Tooltip Portal content is not in SSR output (it mounts to document.body
// in the browser). Assertions cover the trigger subtree, which is in-tree in SSR.
// Full interaction tests (trigger focus → tooltip visible) require a browser
// environment and are intentionally deferred to Wave 3 integration testing.

describe('Tooltip', () => {
  it('renders the trigger child without crashing', () => {
    const html = renderToString(
      <Tooltip label="Helpful tip">
        <button>hover me</button>
      </Tooltip>,
    )
    expect(html).toContain('hover me')
  })

  it('trigger has data-state="closed" from Radix in SSR', () => {
    const html = renderToString(
      <Tooltip label="tip">
        <button>btn</button>
      </Tooltip>,
    )
    expect(html).toContain('data-state="closed"')
  })

  it('accepts side and sideOffset props without crashing', () => {
    expect(() =>
      renderToString(
        <Tooltip label="tip" side="right" sideOffset={8}>
          <span>x</span>
        </Tooltip>,
      ),
    ).not.toThrow()
  })
})
