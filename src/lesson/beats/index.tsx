// Beat-view dispatcher. Each interaction type maps to a self-contained view
// that renders its interaction region, feedback strip, and sticky action bar
// via <BeatShell>. The `slider` type routes by beatId because both the
// refine-prediction and the bias-sandbox beats share it.

import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { PredictionBeat } from './PredictionBeat'
import { PatternPickBeat } from './PatternPickBeat'
import { CoinSimBeat } from './CoinSimBeat'
import { StateTapBeat } from './StateTapBeat'
import { TheorySimChartBeat } from './TheorySimChartBeat'
import { OverlapBeat } from './OverlapBeat'
import { BiasSandboxBeat } from './BiasSandboxBeat'
import { RecapBeat } from './RecapBeat'
import { SliderBeat } from './SliderBeat'
import { SubstitutionBeat } from './SubstitutionBeat'
import { EquationTilesBeat } from './EquationTilesBeat'

function ContinueStub({ beat, isLast, onAdvance }: BeatProps) {
  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
    >
      <div className="stub">
        <p className="stub__type">{beat.interaction.type}</p>
        <p className="stub__note">Interaction arrives in a later phase.</p>
      </div>
    </BeatShell>
  )
}

export function BeatView(props: BeatProps) {
  switch (props.beat.interaction.type) {
    case 'prediction':
      return <PredictionBeat {...props} />
    case 'patternPick':
      return <PatternPickBeat {...props} />
    case 'coinSim':
      return <CoinSimBeat {...props} />
    case 'stateTap':
      return <StateTapBeat {...props} />
    case 'equationTiles':
      return <EquationTilesBeat {...props} />
    case 'theorySimChart':
      return <TheorySimChartBeat {...props} />
    case 'overlap':
      return <OverlapBeat {...props} />
    case 'recap':
      return <RecapBeat {...props} />
    case 'substitution':
      return <SubstitutionBeat {...props} />
    case 'slider':
      return props.beat.beatId === 'bias-sandbox' ? (
        <BiasSandboxBeat {...props} />
      ) : (
        <SliderBeat {...props} />
      )
    default:
      return <ContinueStub {...props} />
  }
}
