import { renderToString } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { DropdownMenu } from './DropdownMenu'

// Tests run in Node (no jsdom). Radix DropdownMenu renders its content via Portal
// when open, which has no output in renderToString (closed by default in SSR).
// The trigger child is in the React tree and is assertable.
// Full open + keyboard navigation (Enter, ArrowDown, item selection) require a
// browser environment and are deferred to Wave 3 integration testing.

const items = [
  { id: 'a', label: 'Action A', onSelect: () => {} },
  { id: 'b', label: 'Action B', onSelect: () => {} },
  { id: 'c', label: 'Disabled', onSelect: () => {}, disabled: true },
]

describe('DropdownMenu', () => {
  it('renders the trigger child', () => {
    const html = renderToString(
      <DropdownMenu trigger={<button>Open menu</button>} items={items} />,
    )
    expect(html).toContain('Open menu')
  })

  it('renders trigger with aria-haspopup from Radix', () => {
    const html = renderToString(
      <DropdownMenu trigger={<button>Menu</button>} items={items} />,
    )
    // Radix DropdownMenu.Trigger adds aria-haspopup="menu"
    expect(html).toContain('aria-haspopup="menu"')
  })

  it('renders without crashing with empty items', () => {
    expect(() =>
      renderToString(
        <DropdownMenu trigger={<button>x</button>} items={[]} />,
      ),
    ).not.toThrow()
  })
})
