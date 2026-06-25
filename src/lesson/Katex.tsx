// Lazy KaTeX component for typeset math results (non-interactive).
// katex + its CSS are dynamically imported as a separate chunk (kept out of the
// entry bundle), but preloaded once at module load so math is typeset before it
// is shown. The library is cached in a module singleton for synchronous re-renders.
// While loading, the raw tex is kept only as a visually-hidden a11y fallback
// (role="math" + aria-label already cover screen readers) so it never flashes.

import { memo, useEffect, useState, type ReactElement } from 'react'

interface KatexProps {
  tex: string
  displayMode?: boolean
  ariaLabel?: string
  className?: string
}

let katexLib: typeof import('katex').default | null = null

const katexReady: Promise<void> = Promise.all([
  import('katex'),
  import('katex/dist/katex.min.css'),
])
  .then(([m]) => { katexLib = m.default })
  .catch(() => { /* leave fallback in place if the chunk fails to load */ })

function renderTex(tex: string, displayMode?: boolean): string | null {
  return katexLib
    ? katexLib.renderToString(tex, { displayMode, throwOnError: false })
    : null
}

function KatexInner({ tex, displayMode, ariaLabel, className }: KatexProps): ReactElement {
  const [html, setHtml] = useState<string | null>(() => renderTex(tex, displayMode))

  useEffect(() => {
    let cancelled = false
    const apply = () => { if (!cancelled) setHtml(renderTex(tex, displayMode)) }
    if (katexLib) apply()
    else void katexReady.then(apply)
    return () => { cancelled = true }
  }, [tex, displayMode])

  return (
    <span
      role="math"
      aria-label={ariaLabel ?? tex}
      className={className}
      data-testid="katex"
      dangerouslySetInnerHTML={html != null ? { __html: html } : undefined}
    >
      {html == null ? <span className="visually-hidden">{tex}</span> : undefined}
    </span>
  )
}

export const Katex = memo(KatexInner)
