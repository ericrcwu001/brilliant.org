/**
 * DropdownMenu — thin wrapper over @radix-ui/react-dropdown-menu.
 *
 * FROZEN API (Wave 3 contract):
 *   <DropdownMenu
 *     trigger={<button>Open</button>}
 *     items={[{ id: 'a', label: 'Action', onSelect: () => {} }]}
 *   />
 *
 * data-testid="dropdown-menu" is on the Content element.
 * Styled via .ui-dropdown in src/styles/surfaces/ui.css.
 *
 * NOT YET CONSUMED — adoption is Wave 3.
 */
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'

export function DropdownMenu({
  trigger,
  items,
}: {
  trigger: React.ReactNode
  items: Array<{
    id: string
    label: React.ReactNode
    onSelect: () => void
    disabled?: boolean
  }>
}): React.JSX.Element {
  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>{trigger}</RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content className="ui-dropdown" data-testid="dropdown-menu">
          {items.map((item) => (
            <RadixDropdown.Item
              key={item.id}
              onSelect={item.onSelect}
              disabled={item.disabled}
            >
              {item.label}
            </RadixDropdown.Item>
          ))}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  )
}
