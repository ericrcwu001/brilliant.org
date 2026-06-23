// Beat-renderer registry keyed by interaction.type. Group A ships stub
// renderers that surface the authored content (prompt is rendered by the
// player; these show the interaction's shape) plus the Continue flow. Group B
// replaces each stub with the real interaction and instant feedback.

import type { ReactNode } from 'react'
import type { Interaction, Tile } from '../content/schema'

type Renderer<K extends Interaction['type']> = (
  interaction: Extract<Interaction, { type: K }>,
) => ReactNode

function StubFrame({ type, children }: { type: string; children?: ReactNode }) {
  return (
    <div className="stub">
      <p className="stub__type">{type}</p>
      {children}
    </div>
  )
}

function tileClass(kind: Tile['kind']) {
  return `token token--${kind}`
}

const beatRenderers: { [K in Interaction['type']]: Renderer<K> } = {
  prediction: (i) => (
    <StubFrame type="prediction">
      <div className="chips">
        {i.options.map((opt) => (
          <div className="chip" key={opt}>
            {opt}
          </div>
        ))}
      </div>
    </StubFrame>
  ),

  patternPick: (i) => (
    <StubFrame type={`pattern pick · ${i.mode}`}>
      <div className="compare">
        {i.patterns.map((p) => (
          <div className="compare__card" key={p}>
            {p}
          </div>
        ))}
      </div>
    </StubFrame>
  ),

  coinSim: (i) => (
    <StubFrame type={`coin sim · ${i.mode}`}>
      <p className="stub__note">
        State graph + coin stream (Konva) arrives in Phase 6.
        {i.gate
          ? typeof i.gate === 'string'
            ? ` Gate: ${i.gate}.`
            : ` Gate: ${i.gate.minFlips} flips.`
          : null}
      </p>
    </StubFrame>
  ),

  stateTap: (i) => (
    <StubFrame type="state tap · failure edge">
      {i.transitions.map((t) => (
        <div className={`edge edge--${t.on}`} key={`${t.from}-${t.on}`}>
          {t.from} on {t.on} → ?
        </div>
      ))}
    </StubFrame>
  ),

  equationTiles: (i) => (
    <StubFrame type="equation tiles">
      {i.rows.map((row) => (
        <div className="eqrow" key={row.lhs}>
          {row.lhs} = {row.graded ? '▢ + ▢ ▢ + ▢ ▢' : '0'}
        </div>
      ))}
      <div className="token-row" style={{ marginTop: 'var(--s3)' }}>
        {i.bank.map((tile) => (
          <span className={tileClass(tile.kind)} key={tile.id}>
            {tile.value}
          </span>
        ))}
      </div>
    </StubFrame>
  ),

  slider: (i) => (
    <StubFrame type="slider">
      <p className="stub__note mono">
        min {i.min} · max {i.max} · step {i.step}
      </p>
    </StubFrame>
  ),

  substitution: (i) => (
    <StubFrame type="substitution">
      {i.steps.map((s) => (
        <div className="eqrow" key={s.display}>
          {s.display}
          {s.resultValue !== undefined ? `  ⇒ ${s.resultValue}` : ''}
        </div>
      ))}
    </StubFrame>
  ),

  overlap: (i) => (
    <StubFrame type="overlap">
      {i.highlight.map((h) => (
        <div className={`edge edge--${h.on}`} key={`${h.from}-${h.on}`}>
          highlight {h.from} on {h.on}
        </div>
      ))}
    </StubFrame>
  ),

  theorySimChart: () => (
    <StubFrame type="theory vs simulation">
      <p className="stub__note">
        Empirical / theory / prediction chart (Konva) arrives in Phase 11.
      </p>
    </StubFrame>
  ),

  recap: () => (
    <StubFrame type="recap">
      <p className="stub__note">
        Prediction, theory, simulation, and overlap recap with milestone stamp.
      </p>
    </StubFrame>
  ),
}

export function BeatInteraction({ interaction }: { interaction: Interaction }) {
  const render = beatRenderers[interaction.type] as Renderer<Interaction['type']>
  return <>{render(interaction)}</>
}
