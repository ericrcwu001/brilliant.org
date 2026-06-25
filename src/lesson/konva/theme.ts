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
