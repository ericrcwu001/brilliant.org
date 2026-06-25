// Canvas palette: the Konva renderer cannot read CSS custom properties, so this
// is the single mirror of the relevant tokens in src/styles/tokens.generated.ts.
// Shared color tokens are imported from the generated file (single source of
// truth — no manual sync, no drift). Canvas-only extras (translucent washes,
// hero tokens) remain as literals here since they have no CSS counterpart.

import { TOKENS } from '../../styles/tokens.generated'

export const C = {
  // ── Shared tokens — sourced from the generated pipeline ──────────────────
  paper0: TOKENS.paper0,
  paper1: TOKENS.paper1,
  paper2: TOKENS.paper2,
  ruleFaint: TOKENS.ruleFaint,
  rule: TOKENS.rule,
  ink: TOKENS.ink,
  graphite: TOKENS.graphite,
  graphiteSoft: TOKENS.graphiteSoft,
  quill: TOKENS.quill,
  quillStrong: TOKENS.quillStrong,
  quillTint: TOKENS.quillTint,
  heads: TOKENS.heads,
  headsTint: TOKENS.headsTint,
  tails: TOKENS.tails,
  tailsTint: TOKENS.tailsTint,
  correct: TOKENS.correct,
  wrong: TOKENS.wrong,
  mark: TOKENS.mark,
  markWash: TOKENS.markWash,
  // ── Chapter hue tokens (Konva mirror of --chN / --chN-tint) ──────────────
  ch1: TOKENS.ch1,
  ch1Tint: TOKENS.ch1Tint,
  ch2: TOKENS.ch2,
  ch2Tint: TOKENS.ch2Tint,
  ch3: TOKENS.ch3,
  ch3Tint: TOKENS.ch3Tint,
  // ── Canvas-only extras — no CSS custom-property counterparts ─────────────
  // Translucent quill washes for the simulation chart's area fill + live head
  // glow (Konva needs rgba; these mirror --quill #4F46E5).
  quillFill: 'rgba(79, 70, 229, 0.16)',
  quillFillFade: 'rgba(79, 70, 229, 0)',
  quillGlow: 'rgba(79, 70, 229, 0.20)',
  // Faint ink band marking the convergence target around the theory line.
  inkBand: 'rgba(22, 26, 39, 0.05)',
  // ── Remaining-lesson hero tokens, pre-stocked (build-brief §4.4) so Wave-2
  // authors never edit this shared palette.
  //
  // L2 race lanes (A = quill indigo, B = warm amber) + their fills.
  laneA: '#4F46E5',
  laneATint: '#EEF0FE',
  laneB: '#E0982E',
  laneBTint: '#FBF0DD',
  // L2 TournamentHeatmap diverging gradient: B-favored → tie → A-favored.
  heatLo: '#E0982E',
  heatMid: '#F1F3F8',
  heatHi: '#4F46E5',
  // L3 ruin / win outcomes (semantic names distinct from correct/wrong) + fills.
  ruin: '#E5484D',
  ruinTint: '#FDECEC',
  win: '#16A36B',
  winTint: '#E4F6EE',
  // L3 walker swarm: a neutral in-flight dot (absorbed walkers take win/ruin).
  swarm: '#8A90A4',
  swarmTint: 'rgba(138, 144, 164, 0.18)',
} as const

export const edgeColor = (on: 'H' | 'T') => (on === 'H' ? C.heads : C.tails)

export const FONT_MONO =
  '"JetBrains Mono", ui-monospace, "SF Mono", Consolas, monospace'

// ── Chapter accent resolver ───────────────────────────────────────────────────
// Maps a resolved chapter hex (from chapterColor(lessonId)) to the matching
// tint and glow values. Used by Konva canvases — which cannot read CSS custom
// properties — to key chapter-specific visual elements: active node ring,
// empirical curve, live head, etc.

/** Convert a 6-digit hex color to an rgba() string. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Chapter accent table keyed by `ch1`/`ch2`/`ch3`. Each entry bundles the
 * base hex, the light tint, and a soft glow rgba. Exported so beat-layer
 * code can access it without re-deriving the values.
 */
export const CHAPTER_ACCENT = {
  ch1: { base: TOKENS.ch1, tint: TOKENS.ch1Tint, glow: 'rgba(79,70,229,0.20)' },
  ch2: { base: TOKENS.ch2, tint: TOKENS.ch2Tint, glow: 'rgba(13,148,136,0.20)' },
  ch3: { base: TOKENS.ch3, tint: TOKENS.ch3Tint, glow: 'rgba(240,88,74,0.20)' },
} as const

/**
 * Given a resolved chapter hex (e.g. `'#4F46E5'` from `chapterColor(lessonId)`),
 * return `{ base, tint, glow }` for Konva rendering. Falls back to ch1 (indigo)
 * when the hex is unrecognised, so existing callers passing no accent are stable.
 */
export function accentFor(hex: string): { base: string; tint: string; glow: string } {
  const lo = hex.toLowerCase()
  const entry = Object.values(CHAPTER_ACCENT).find((v) => v.base.toLowerCase() === lo)
  if (entry) return { base: hex, tint: entry.tint, glow: entry.glow }
  return { base: hex, tint: TOKENS.ch1Tint, glow: 'rgba(79,70,229,0.20)' }
}
