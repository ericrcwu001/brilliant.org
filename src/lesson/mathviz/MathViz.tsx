// MathViz — small, crisp, themeable inline-SVG math visualizations for the
// Ergo course journey lesson cards. Each component uses currentColor so the
// parent card can set the chapter hue via the CSS `color` property.
// 88×60 viewBox matches the mock thumbnail proportions.

import { useId } from 'react'
import type { MathVizKind } from '../../pages/studyDesk.model'

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}

// ── Coin (L0 First Heads) ────────────────────────────────────────────────────
// Single coin face with "H" — tinted with chapter hue.

function CoinViz() {
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      <circle cx="44" cy="30" r="22" fill="currentColor" opacity="0.15" />
      <circle
        cx="44"
        cy="30"
        r="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="44"
        cy="30"
        r="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.4"
      />
      <text
        x="44"
        y="37"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="20"
        fill="currentColor"
      >
        H
      </text>
    </svg>
  )
}

// ── State Machine (L1 Pattern Hitting Times) ─────────────────────────────────
// 3-node chain: ∅ → H → HH; last node double-ringed (absorbing), T self-loop on H.

function StateMachineViz({ pfx }: { pfx: string }) {
  const arrId = `${pfx}_arr`
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      <defs>
        <marker
          id={arrId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
      {/* Node ∅ */}
      <circle
        cx="14"
        cy="30"
        r="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="14"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="8"
        fill="currentColor"
      >
        ∅
      </text>
      {/* Node H */}
      <circle
        cx="44"
        cy="30"
        r="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="44"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="8"
        fill="currentColor"
      >
        H
      </text>
      {/* Node HH (absorbing — double ring) */}
      <circle
        cx="74"
        cy="30"
        r="10"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="74"
        cy="30"
        r="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        opacity="0.6"
      />
      <text
        x="74"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="7"
        fill="currentColor"
      >
        HH
      </text>
      {/* Arrow ∅ → H */}
      <line
        x1="25"
        y1="30"
        x2="33"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={`url(#${arrId})`}
      />
      <text
        x="29"
        y="26"
        textAnchor="middle"
        fontFamily="var(--font-sans, 'Inter', sans-serif)"
        fontSize="7"
        fill="currentColor"
      >
        H
      </text>
      {/* Arrow H → HH */}
      <line
        x1="55"
        y1="30"
        x2="63"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={`url(#${arrId})`}
      />
      <text
        x="59"
        y="26"
        textAnchor="middle"
        fontFamily="var(--font-sans, 'Inter', sans-serif)"
        fontSize="7"
        fill="currentColor"
      >
        H
      </text>
      {/* T self-loop on H node (T → resets to ∅) */}
      <path
        d="M36 22 Q44 10 52 22"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2 2"
        opacity="0.6"
        markerEnd={`url(#${arrId})`}
      />
      <text
        x="44"
        y="11"
        textAnchor="middle"
        fontFamily="var(--font-sans, 'Inter', sans-serif)"
        fontSize="7"
        fill="currentColor"
        opacity="0.7"
      >
        T
      </text>
    </svg>
  )
}

// ── Race Lanes (L2 Penney's Game) ────────────────────────────────────────────
// Two stacked lanes, tokens at different positions, labels HHT / THH.

function RaceLanesViz({ pfx }: { pfx: string }) {
  const clipId = `${pfx}_clip`
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="6" y="6" width="76" height="48" />
        </clipPath>
      </defs>
      {/* Lane 1: HHT */}
      <rect
        x="6"
        y="8"
        width="76"
        height="18"
        rx="9"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Lane 2: THH */}
      <rect
        x="6"
        y="34"
        width="76"
        height="18"
        rx="9"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Token lane 1 at ~40% */}
      <circle cx="36" cy="17" r="7" fill="currentColor" opacity="0.85" />
      {/* Token lane 2 at ~55% */}
      <circle cx="48" cy="43" r="7" fill="currentColor" opacity="0.55" />
      {/* Finish line */}
      <line
        x1="70"
        y1="8"
        x2="70"
        y2="26"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.5"
      />
      <line
        x1="70"
        y1="34"
        x2="70"
        y2="52"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 1.5"
        opacity="0.5"
      />
      {/* Labels */}
      <text
        x="79"
        y="21"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="7"
        fill="currentColor"
      >
        HHT
      </text>
      <text
        x="79"
        y="47"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="7"
        fill="currentColor"
      >
        THH
      </text>
    </svg>
  )
}

// ── Random Walk (L3 Gambler's Ruin) ─────────────────────────────────────────
// Two vertical absorbing walls + zig-zag walk polyline + current position dot.

function RandomWalkViz() {
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      {/* Left wall */}
      <line
        x1="8"
        y1="8"
        x2="8"
        y2="52"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Right wall */}
      <line
        x1="80"
        y1="8"
        x2="80"
        y2="52"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Zig-zag walk */}
      <polyline
        points="8,40 18,28 26,36 34,22 42,32 50,20 58,30 66,18 74,28"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {/* Current position dot */}
      <circle cx="74" cy="28" r="4.5" fill="currentColor" />
    </svg>
  )
}

// ── Two Node (L4 States & Streaks) ───────────────────────────────────────────
// 2-node graph: node ∅ with self-loop + forward arrow to node H.

function TwoNodeViz({ pfx }: { pfx: string }) {
  const arrId = `${pfx}_arr`
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      <defs>
        <marker
          id={arrId}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
      {/* Node ∅ */}
      <circle
        cx="24"
        cy="30"
        r="12"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="9"
        fill="currentColor"
      >
        ∅
      </text>
      {/* Node H */}
      <circle
        cx="64"
        cy="30"
        r="12"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <text
        x="64"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="9"
        fill="currentColor"
      >
        H
      </text>
      {/* Forward arrow ∅ → H */}
      <line
        x1="37"
        y1="30"
        x2="51"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.5"
        markerEnd={`url(#${arrId})`}
      />
      {/* Self-loop on ∅: arc up and back */}
      <path
        d="M14 21 Q14 8 24 8 Q34 8 34 21"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="2.5 2"
        opacity="0.65"
        markerEnd={`url(#${arrId})`}
      />
    </svg>
  )
}

// ── Four Node (L5 Longer Patterns) ───────────────────────────────────────────
// 4-node chain advancing then resetting.

function FourNodeViz({ pfx }: { pfx: string }) {
  const arrId = `${pfx}_arr`
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      <defs>
        <marker
          id={arrId}
          markerWidth="5"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <path d="M0,0 L5,2.5 L0,5 Z" fill="currentColor" />
        </marker>
      </defs>
      {/* Nodes */}
      {([11, 32, 56, 77] as const).map((cx, i) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy={30}
            r={8}
            fill="currentColor"
            fillOpacity={0.12 + i * 0.04}
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </g>
      ))}
      {/* Arrows */}
      <line x1="20" y1="30" x2="23" y2="30" stroke="currentColor" strokeWidth="1.4" markerEnd={`url(#${arrId})`} />
      <line x1="41" y1="30" x2="47" y2="30" stroke="currentColor" strokeWidth="1.4" markerEnd={`url(#${arrId})`} />
      <line x1="65" y1="30" x2="68" y2="30" stroke="currentColor" strokeWidth="1.4" markerEnd={`url(#${arrId})`} />
    </svg>
  )
}

// ── Sum (L6 The Overlap Shortcut) ────────────────────────────────────────────
// Large Σ + three chips 2¹ 2² 2³ stacked diagonally.

function SumViz() {
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      {/* Large Σ */}
      <text
        x="20"
        y="42"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="30"
        fill="currentColor"
        opacity="0.5"
      >
        Σ
      </text>
      {/* Chip 2¹ */}
      <rect
        x="40"
        y="12"
        width="15"
        height="15"
        rx="4"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.8"
      />
      <text
        x="47.5"
        y="23.5"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="8"
        fill="currentColor"
        opacity="0.7"
      >
        2¹
      </text>
      {/* Chip 2² */}
      <rect
        x="56"
        y="22"
        width="15"
        height="15"
        rx="4"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="63.5"
        y="33.5"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="8"
        fill="currentColor"
        opacity="0.7"
      >
        2²
      </text>
      {/* Chip 2³ */}
      <rect
        x="70"
        y="33"
        width="15"
        height="15"
        rx="4"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x="77.5"
        y="44.5"
        textAnchor="middle"
        fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
        fontWeight="700"
        fontSize="8"
        fill="currentColor"
        opacity="0.7"
      >
        2³
      </text>
    </svg>
  )
}

// ── Dice (Roadmap: Weighted Coins & Dice) ────────────────────────────────────
// Two rounded squares with pip patterns (showing 3 and 4 pips).

function DiceViz() {
  return (
    <svg viewBox="0 0 88 60" width="88" height="60" aria-hidden="true">
      {/* Die 1 — 3 diagonal pips */}
      <rect
        x="8"
        y="8"
        width="28"
        height="28"
        rx="6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="22" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="30" cy="30" r="2.5" fill="currentColor" opacity="0.6" />
      {/* Die 2 — 4 corner pips */}
      <rect
        x="52"
        y="24"
        width="28"
        height="28"
        rx="6"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="58" cy="30" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="74" cy="30" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="58" cy="46" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="74" cy="46" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

export function MathViz({
  kind,
  className,
}: {
  kind: MathVizKind
  className?: string
}): React.JSX.Element {
  const rawId = useId()
  const pfx = sanitize(rawId)

  let viz: React.JSX.Element
  switch (kind) {
    case 'coin':
      viz = <CoinViz />
      break
    case 'stateMachine':
      viz = <StateMachineViz pfx={pfx} />
      break
    case 'raceLanes':
      viz = <RaceLanesViz pfx={pfx} />
      break
    case 'randomWalk':
      viz = <RandomWalkViz />
      break
    case 'twoNode':
      viz = <TwoNodeViz pfx={pfx} />
      break
    case 'fourNode':
      viz = <FourNodeViz pfx={pfx} />
      break
    case 'sum':
      viz = <SumViz />
      break
    case 'dice':
      viz = <DiceViz />
      break
    default: {
      const _: never = kind
      void _
      viz = <CoinViz />
    }
  }

  return (
    <span className={className} aria-hidden="true">
      {viz}
    </span>
  )
}
