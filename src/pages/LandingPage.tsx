// Landing hero (Phase 13). Confident, terse copy per the Auth-First Onboarding
// spec; a small looping 3-node state-machine motif stands in for the full live
// preview wired in a later phase. Primary CTA creates an account; secondary
// signs in. Both route to /auth with the initial mode preselected.

import type { CSSProperties } from 'react'
import type { NavigateFn } from './routes'
import { ROUTES } from './routes'

export function LandingPage({ navigate }: { navigate: NavigateFn }) {
  return (
    <main className="hero">
      <div className="hero__inner">
        <h1 className="hero__title">Pattern Hitting Times</h1>
        <p className="hero__subtitle">State thinking for quant interviews.</p>

        <StateMachinePreview />

        <div className="hero__cta">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate(`${ROUTES.auth}?mode=create`)}
          >
            Create account
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate(`${ROUTES.auth}?mode=signin`)}
          >
            Sign in
          </button>
        </div>
      </div>
    </main>
  )
}

// Decorative ∅ → H → HH chain that pulses node-to-node. Marked aria-hidden; the
// animation is suppressed under prefers-reduced-motion via CSS.
function StateMachinePreview() {
  const nodes = [
    { id: 'empty', label: '\u2205' },
    { id: 'h', label: 'H' },
    { id: 'hh', label: 'HH' },
  ]
  return (
    <div className="preview" aria-hidden="true">
      <svg className="preview__svg" viewBox="0 0 320 120" role="presentation">
        <line className="preview__edge" x1="60" y1="60" x2="160" y2="60" />
        <line className="preview__edge" x1="160" y1="60" x2="260" y2="60" />
        {nodes.map((node, i) => (
          <g
            key={node.id}
            className="preview__node"
            style={{ '--i': i } as CSSProperties}
            transform={`translate(${60 + i * 100}, 60)`}
          >
            <circle className="preview__ring" r="24" />
            <text className="preview__label" dy="0.35em">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
