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
import { PrimerBeat } from './PrimerBeat'
import { McqBeat } from './McqBeat'
import { RetrievalGridBeat } from './RetrievalGridBeat'
import { SumTilesBeat } from './SumTilesBeat'
import { AutocorrelationRulerBeat } from './AutocorrelationRulerBeat'
import { TripletRevealBeat } from './TripletRevealBeat'
import { RaceSimBeat } from './RaceSimBeat'
import { DominanceWheelBeat } from './DominanceWheelBeat'
import { WalkBoardBeat } from './WalkBoardBeat'
import { GamblerLedgerBeat } from './GamblerLedgerBeat'

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
    case 'primer':
      return <PrimerBeat {...props} />
    case 'mcq':
      return <McqBeat {...props} />
    case 'slider':
      return props.beat.beatId === 'bias-sandbox' ? (
        <BiasSandboxBeat {...props} />
      ) : (
        <SliderBeat {...props} />
      )
    // Shared Wave-1 widgets.
    case 'retrievalGrid':
      return <RetrievalGridBeat {...props} />
    case 'sumTiles':
      return <SumTilesBeat {...props} />
    case 'autocorrelationRuler':
      return <AutocorrelationRulerBeat {...props} />
    case 'tripletReveal':
      return <TripletRevealBeat {...props} />
    // Lesson-specific heroes (build-brief §4.4 / §6).
    case 'raceSim':
      return <RaceSimBeat {...props} />
    case 'dominanceWheel':
      return <DominanceWheelBeat {...props} />
    case 'walkBoard':
      return <WalkBoardBeat {...props} />
    case 'gamblerLedger':
      return <GamblerLedgerBeat {...props} />
    default:
      return <ContinueStub {...props} />
  }
}
