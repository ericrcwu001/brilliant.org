// Canvas palette: the Konva renderer cannot read CSS custom properties, so this
// is the single mirror of the relevant tokens in src/styles/tokens.css. Keep
// these in sync with the design tokens (docs/ui_design_system.md "Color
// Tokens"). Components must import from here rather than inlining hex.

export const C = {
  paper0: '#FCFAF5',
  paper1: '#F6F2E9',
  paper2: '#EFEADD',
  ruleFaint: '#E7E1D2',
  rule: '#D8D1BF',
  ink: '#1B2230',
  graphite: '#4C4F59',
  graphiteSoft: '#7C7E87',
  quill: '#2E4FB0',
  quillStrong: '#233E8C',
  quillTint: '#E5EAF7',
  heads: '#C0892C',
  headsTint: '#F6EAD2',
  tails: '#2A7C88',
  tailsTint: '#DCEDEF',
  correct: '#2F8F5B',
  wrong: '#CE4A3E',
  mark: '#E8B23A',
  markWash: 'rgba(232, 178, 58, 0.30)',
  // Translucent quill washes for the simulation chart's area fill + live head
  // glow (Konva needs rgba; these mirror --quill #2E4FB0).
  quillFill: 'rgba(46, 79, 176, 0.16)',
  quillFillFade: 'rgba(46, 79, 176, 0)',
  quillGlow: 'rgba(46, 79, 176, 0.20)',
  // Faint ink band marking the convergence target around the theory line.
  inkBand: 'rgba(27, 34, 48, 0.05)',
  // ── Remaining-lesson hero tokens, pre-stocked (build-brief §4.4) so Wave-2
  // authors never edit this shared palette. Notebook-toned, drawn from the
  // existing quill / heads / tails / correct-wrong families.
  //
  // L2 race lanes (A = quill blue, B = a warm contrast) + their fills.
  laneA: '#2E4FB0',
  laneATint: '#E5EAF7',
  laneB: '#B26A2B',
  laneBTint: '#F3E6D6',
  // L2 TournamentHeatmap diverging gradient: B-favored → tie → A-favored.
  heatLo: '#B26A2B',
  heatMid: '#EFEADD',
  heatHi: '#2E4FB0',
  // L3 ruin / win outcomes (semantic names distinct from correct/wrong) + fills.
  ruin: '#CE4A3E',
  ruinTint: '#F6DEDA',
  win: '#2F8F5B',
  winTint: '#D8EFE0',
  // L3 walker swarm: a neutral in-flight dot (absorbed walkers take win/ruin).
  swarm: '#7C7E87',
  swarmTint: 'rgba(124, 126, 135, 0.18)',
} as const

export const edgeColor = (on: 'H' | 'T') => (on === 'H' ? C.heads : C.tails)

export const FONT_MONO =
  '"IBM Plex Mono", ui-monospace, "SF Mono", Consolas, monospace'
