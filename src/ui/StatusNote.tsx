/**
 * StatusNote — inline/margin status indicator (NOT a toast).
 *
 * FROZEN API (Wave 3 contract):
 *   <StatusNote tone="info">message</StatusNote>
 *   <StatusNote tone="offline">Saving…</StatusNote>
 *   <StatusNote tone="error">Write failed</StatusNote>
 *
 * role="status" → aria-live polite.
 * data-testid="status-note", data-tone={tone}.
 * Styled via .ui-status-note in src/styles/surfaces/ui.css.
 *
 * NOT YET CONSUMED — adoption is Wave 3 (offline/failed-write states).
 */
export function StatusNote({
  tone,
  children,
  className,
}: {
  tone?: 'info' | 'offline' | 'error'
  children: React.ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <p
      role="status"
      data-testid="status-note"
      data-tone={tone}
      className={className ? `ui-status-note ${className}` : 'ui-status-note'}
    >
      {children}
    </p>
  )
}
