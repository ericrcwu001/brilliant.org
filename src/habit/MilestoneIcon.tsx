// Maps each milestone id to a bespoke inline SVG icon for the ConceptMedallion,
// falling back to the text glyph for unknown ids.

import type { ReactNode } from 'react'

const ICON_SHAPES: Record<string, ReactNode> = {
  // Two overlapping coins: back coin upper-right, front coin lower-left with
  // inner rim and center dot.
  'hh-ht-mastered': (
    <>
      <circle cx="14" cy="9" r="4.5" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="10" cy="15" r="5" stroke="currentColor" strokeWidth={1.75} />
      <circle cx="10" cy="15" r="3.2" stroke="currentColor" strokeWidth={1} />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
    </>
  ),
  // Checkered finish flag: vertical pole on the left, 2x2 checkerboard flag
  // at the top with alternating filled squares.
  'penneys-game-won': (
    <>
      <line
        x1="5"
        y1="21"
        x2="5"
        y2="5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="5"
        width="12"
        height="8"
        stroke="currentColor"
        strokeWidth={1.5}
        fill="none"
      />
      <rect x="5" y="5" width="6" height="4" fill="currentColor" />
      <rect x="11" y="9" width="6" height="4" fill="currentColor" />
      <line
        x1="11"
        y1="5"
        x2="11"
        y2="13"
        stroke="currentColor"
        strokeWidth={1}
      />
      <line
        x1="5"
        y1="9"
        x2="17"
        y2="9"
        stroke="currentColor"
        strokeWidth={1}
      />
    </>
  ),
  // Random walk between two boundary walls: left and right vertical bars, a
  // zig-zag polyline travelling left→right, endpoint dot at the right wall.
  'gamblers-ruin-solved': (
    <>
      <line
        x1="4"
        y1="6"
        x2="4"
        y2="20"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="6"
        x2="20"
        y2="20"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <polyline
        points="4,16 8,10 12,18 16,9 20,9"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="9" r="2" fill="currentColor" />
    </>
  ),
  // Three rounded squares in a row representing a sequence; the last one is
  // filled (match found) with a small check mark cut through it.
  'first-pattern-cracked': (
    <>
      <rect
        x="3"
        y="9.5"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
      />
      <rect
        x="9.5"
        y="9.5"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
      />
      <rect
        x="16"
        y="9.5"
        width="5"
        height="5"
        rx="1"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <path
        d="M17.2,12.2 L18.4,13.4 L20.8,11"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  // Three state machine nodes left→right with directed arrows; the final node
  // is filled (absorbing state).
  'state-machine-builder': (
    <>
      <circle
        cx="4.5"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
      />
      <circle cx="19.5" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M7,12 H9.5 M8,10.5 L9.5,12 L8,13.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.5,12 H17 M15.5,10.5 L17,12 L15.5,13.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  // A symmetric balance scale: base, central post, horizontal beam, and two
  // small pans hanging from the beam ends.
  'martingale-mastered': (
    <>
      <line
        x1="10"
        y1="21"
        x2="14"
        y2="21"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="21"
        x2="12"
        y2="9"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="9"
        x2="19"
        y2="9"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="9"
        x2="5.5"
        y2="15"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="15.5"
        x2="8"
        y2="15.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <line
        x1="18.5"
        y1="9"
        x2="18.5"
        y2="15"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="15.5"
        x2="21"
        y2="15.5"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </>
  ),
  // Half-progress ring: top semicircle arc (≈180°) with a check mark in the
  // center. Pairs with six-lessons-complete (full ring).
  'three-lessons-complete': (
    <>
      <path
        d="M 3,12 A 9,9 0 0,0 21,12"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9.5,12 L11.5,14 L14.5,10"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  // Capstone/course-complete: full ring with a filled 5-point star inside.
  // Pairs with three-lessons-complete (half ring).
  'six-lessons-complete': (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={2}
        fill="none"
      />
      <path
        d="M12,7 L13.18,10.38 L16.76,10.46 L13.9,12.62 L14.94,16.05 L12,14 L9.06,16.05 L10.1,12.62 L7.24,10.46 L10.82,10.38 Z"
        fill="currentColor"
      />
    </>
  ),
}

export function MilestoneIcon({ id, glyph }: { id: string; glyph?: string }) {
  const shapes = ICON_SHAPES[id]
  if (shapes == null) {
    return (
      <span className="ergo-medallion__glyph" aria-hidden="true">
        {glyph}
      </span>
    )
  }
  return (
    <svg
      className="ergo-medallion__icon"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {shapes}
    </svg>
  )
}
