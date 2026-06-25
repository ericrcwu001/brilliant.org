/**
 * Tooltip — wraps @radix-ui/react-tooltip.
 *
 * FROZEN API (Wave 3 contract):
 *   <Tooltip label={...} side="top" sideOffset={6}>
 *     <button>trigger</button>
 *   </Tooltip>
 *
 * data-testid="tooltip" is on the Content element.
 * Styled via .ui-tooltip in src/styles/surfaces/ui.css.
 *
 * NOT YET CONSUMED — adoption is Wave 3 (replaces .infotip CSS bubble).
 *
 * Intentionally deferred: Tabs, Popover, useNumberFieldControl
 * (no consumer exists yet).
 */
import * as RadixTooltip from '@radix-ui/react-tooltip'

export function Tooltip({
  children,
  label,
  side = 'top',
  sideOffset = 6,
}: {
  children: React.ReactNode
  label: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}): React.JSX.Element {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="ui-tooltip"
            data-testid="tooltip"
            side={side}
            sideOffset={sideOffset}
          >
            {label}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
