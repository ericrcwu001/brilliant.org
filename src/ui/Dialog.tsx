/**
 * Dialog — thin controlled wrapper over @radix-ui/react-dialog.
 *
 * FROZEN API (Wave 3 contract):
 *   <Dialog open={open} onOpenChange={setOpen} title="Title" description="...">
 *     <p>content</p>
 *   </Dialog>
 *
 * data-testid="dialog" is on the Content element.
 * Styled via .ui-dialog-overlay + .ui-dialog in src/styles/surfaces/ui.css.
 *
 * Consumed by TheorySimChartBeat (variance explainer popup).
 */
import * as RadixDialog from '@radix-ui/react-dialog'

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-dialog-overlay" />
        <RadixDialog.Content className="ui-dialog" data-testid="dialog">
          <RadixDialog.Title>{title}</RadixDialog.Title>
          {description && (
            <RadixDialog.Description>{description}</RadixDialog.Description>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
