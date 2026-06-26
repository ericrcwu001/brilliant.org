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

  // ─── Expected Value ───

  // Weighted average: horizontal beam balanced on a triangular fulcrum; two dots of different sizes.
  'ev-fundamentals': (
    <>
      <line x1="4" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <path d="M12,11 L9.5,18 L14.5,18 Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" fill="none" />
      <circle cx="7" cy="11" r="1.5" fill="currentColor" />
      <circle cx="16" cy="11" r="2.5" fill="currentColor" />
    </>
  ),
  // E[X]+E[Y]=E[X+Y]: two short bars left, small "+" between them and a tall bar right.
  'linearity-mastered': (
    <>
      <line x1="5.5" y1="18" x2="5.5" y2="14" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="10" y1="18" x2="10" y2="12" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="12.5" y1="13" x2="14.5" y2="13" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="13.5" y1="12" x2="13.5" y2="14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="18" y1="18" x2="18" y2="8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </>
  ),
  // 0/1 indicator: rounded pill outline, knob filled right (ON=1), hollow dot left (0).
  'indicator-mastered': (
    <>
      <rect x="5" y="8.5" width="14" height="7" rx="3.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="15.5" cy="12" r="2.5" fill="currentColor" />
      <circle cx="8.5" cy="12" r="1.5" stroke="currentColor" strokeWidth={1} fill="none" />
    </>
  ),
  // Conditioning/branching: circle left; two branches to circles right (bottom one filled = selected case).
  'conditional-expectation-mastered': (
    <>
      <circle cx="5" cy="12" r="2" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <line x1="7" y1="11" x2="15" y2="7.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="7" y1="13" x2="15" y2="16.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="17" cy="17" r="2" fill="currentColor" />
    </>
  ),
  // Full set collected: three ticket rectangles in a row; the last is solid-filled.
  'coupon-collector-mastered': (
    <>
      <rect x="3" y="9" width="4.5" height="6" rx="1" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <rect x="9.5" y="9" width="4.5" height="6" rx="1" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <rect x="16" y="9" width="4.5" height="6" rx="1" fill="currentColor" />
    </>
  ),
  // Order statistics / max: four ascending bars; a small filled dot marks the tallest (the max).
  'expected-value-mastered': (
    <>
      <line x1="5" y1="18" x2="5" y2="16" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="9" y1="18" x2="9" y2="13" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="13" y1="18" x2="13" y2="10" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <line x1="17" y1="18" x2="17" y2="6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <circle cx="17" cy="6" r="1.5" fill="currentColor" />
    </>
  ),
  // Capstone: full ring with a stylized Σ (sigma) polyline inside.
  'expected-value-complete': (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
      <polyline
        points="15.5,7.5 8.5,7.5 14,12 8.5,16.5 15.5,16.5"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  // ─── Bayes' Rule ───

  // Prior → posterior: short left bar (prior), right-arrow in center, taller right bar (posterior).
  'bayes-rule-update': (
    <>
      <line x1="5" y1="18" x2="5" y2="13" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <path d="M8,13 H15 M13.5,11.5 L15,13 L13.5,14.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="19" y1="18" x2="19" y2="8" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
    </>
  ),
  // Rare base rate: large circle (population), single tiny filled dot inside (the rare event).
  'bayes-rule-base-rate': (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    </>
  ),
  // Independent evidence compounding: three stacked offset rectangles, each narrower toward the top.
  'bayes-rule-stacking': (
    <>
      <rect x="4" y="15" width="16" height="4" rx="1.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <rect x="5" y="10.5" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <rect x="6" y="6" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
    </>
  ),
  // N-way hypothesis: three vertical bars; the first is solid-filled (selected hypothesis H1).
  'bayes-rule-nway': (
    <>
      <rect x="4.5" y="8" width="4" height="8" rx="0.5" fill="currentColor" />
      <rect x="10" y="8" width="4" height="8" rx="0.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <rect x="15.5" y="8" width="4" height="8" rx="0.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
    </>
  ),
  // Three doors; the rightmost is highlighted (the host's revealed door).
  'bayes-rule-monty': (
    <>
      <rect x="3" y="7" width="4.5" height="10" rx="0.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="6.5" cy="12" r="1" fill="currentColor" />
      <rect x="9.5" y="7" width="4.5" height="10" rx="0.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="13" cy="12" r="1" fill="currentColor" />
      <rect
        x="16"
        y="7"
        width="4.5"
        height="10"
        rx="0.5"
        stroke="currentColor"
        strokeWidth={1.75}
        fill="currentColor"
        fillOpacity={0.3}
      />
    </>
  ),
  // Conditioning on a subset: large circle (whole space), smaller filled circle inside (the event A).
  'bayes-rule-condition': (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="10.5" cy="11" r="3.5" fill="currentColor" />
    </>
  ),
  // Flipping the conditional: two horizontal arrows pointing in opposite directions.
  'bayes-rule-direction': (
    <>
      <path d="M5,9 H17 M15.5,7.5 L17,9 L15.5,10.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19,15 H7 M8.5,13.5 L7,15 L8.5,16.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  // Finding the hidden base rate: magnifying glass (circle + handle) with a small dot inside the lens.
  'bayes-rule-wild': (
    <>
      <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <line x1="14" y1="14" x2="19" y2="19" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
      <circle cx="9.5" cy="9.5" r="1.5" fill="currentColor" />
    </>
  ),
  // Capstone: full ring with a right-arrow inside (the Bayesian update glyph).
  'bayes-rule-complete': (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
      <path d="M6,12 H17 M15.5,10.5 L17,12 L15.5,13.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),

  // ─── Combinatorics ───

  // Multiplication rule: binary choice tree (root → 2 branches → 4 leaves).
  'combinatorics-counting-mastered': (
    <>
      <circle cx="12" cy="4.5" r="1.5" fill="currentColor" />
      <line x1="12" y1="6" x2="7" y2="12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="12" y1="6" x2="17" y2="12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="7" y1="12" x2="4.5" y2="18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="7" y1="12" x2="9.5" y2="18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="17" y1="12" x2="14.5" y2="18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="17" y1="12" x2="19.5" y2="18" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  // Permutations vs combinations: 3 ordered dots on a line (top) above 3 dots in a bounding box (bottom).
  'combinatorics-perms-mastered': (
    <>
      <line x1="5" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx="5" cy="8" r="1.5" fill="currentColor" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="19" cy="8" r="1.5" fill="currentColor" />
      <rect x="4" y="13" width="16" height="7" rx="2" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" />
    </>
  ),
  // Pascal's triangle: 6 filled dots arranged in a 1-2-3 triangular pattern.
  'binomial-theorem-mastered': (
    <>
      <circle cx="12" cy="7" r="2" fill="currentColor" />
      <circle cx="9" cy="12" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="6" cy="17" r="2" fill="currentColor" />
      <circle cx="12" cy="17" r="2" fill="currentColor" />
      <circle cx="18" cy="17" r="2" fill="currentColor" />
    </>
  ),
  // Inclusion-exclusion: two overlapping circles (Venn diagram); small filled dot in the intersection.
  'inclusion-exclusion-mastered': (
    <>
      <circle cx="9" cy="12" r="5.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="15" cy="12" r="5.5" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  // Pigeonhole: two open-top boxes; left has 2 dots, right has 1 (more items than boxes → repeat).
  'pigeonhole-mastered': (
    <>
      <path d="M4,11 L4,17 L11,17 L11,11" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M13,11 L13,17 L20,17 L20,11" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="6.5" cy="14.5" r="1.2" fill="currentColor" />
      <circle cx="8.5" cy="14.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
    </>
  ),
  // Favorable ÷ total: circle outline with one filled quarter-sector (probability as a pie slice).
  'combinatorics-mastered': (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={1.75} fill="none" />
      <path d="M12,12 L12,4 A8,8 0 0,1 20,12 Z" fill="currentColor" />
    </>
  ),
  // Capstone: full ring with a small triangle of 3 filled dots inside (Pascal/combinatorics motif).
  'combinatorics-complete': (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} fill="none" />
      <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="14" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14" r="1.5" fill="currentColor" />
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
