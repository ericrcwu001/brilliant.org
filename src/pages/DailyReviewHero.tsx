// Daily Review hero (spec-20 / D8, §4.2). A pure presentational hero rendered as
// the FIRST child of the catalog's <main>, above the ResumeHero — it makes the
// spaced-review queue the recommended daily action WITHOUT dethroning the catalog
// (D8; Mixed-Floor-as-home is deferred, §11). It visually rhymes with ResumeHero
// (eyebrow / title / footer / cta) using the ergo-card + ergo-review-hero classes.
//
// Two-track copy (§6): the queue itself is for everyone; quantGate only changes
// FRAMING (a COPY[gentle|quant] map) — never availability. The two empty states
// (caught-up vs no-deck) are kept DISTINCT so "all caught up" never renders over
// an empty deck (§4.5). Reused by DailyReviewPage's inline empty state.

import type { DailyReviewHeroModel } from './dailyReview.model'

type CopyKey = 'gentle' | 'quant'

const COPY: Record<
  CopyKey,
  {
    dueSub: (n: number) => string
    caughtUpTitle: string
    caughtUpSub: string
    noDeckTitle: string
    noDeckSub: string
    buildCta: string
    startCta: string
  }
> = {
  gentle: {
    dueSub: (n) => `Keep your skills warm — ${n} ready to revisit.`,
    caughtUpTitle: 'Nothing due today',
    caughtUpSub: "You're all caught up. Nice work.",
    noDeckTitle: 'Build your review deck',
    noDeckSub: 'Turn your completed lessons into spaced reviews.',
    buildCta: 'Build deck',
    startCta: 'Review now →',
  },
  quant: {
    dueSub: (n) => `${n} cards due. Recall cold — no peeking.`,
    caughtUpTitle: 'Caught up',
    caughtUpSub: 'Come back when cards are due.',
    noDeckTitle: 'No review deck yet',
    noDeckSub: 'Build it.',
    buildCta: 'Build deck',
    startCta: 'Review now →',
  },
}

export interface DailyReviewHeroProps {
  model: DailyReviewHeroModel
  // The quant-intensity gate (README §4 helper, resolved by the container). Only
  // selects copy here — no behavior branch.
  quantGate: boolean
  onStart: () => void
  onBuildDeck?: () => void
}

export function DailyReviewHero({ model, quantGate, onStart, onBuildDeck }: DailyReviewHeroProps) {
  // `hidden` → render nothing (defer to ResumeHero, §4.2).
  if (model.state === 'hidden') return null
  const copy = COPY[quantGate ? 'quant' : 'gentle']

  // No-deck (pre-SR / pre-backfill, §4.5): the Build-your-review-deck affordance —
  // NEVER the caught-up copy. CTA triggers spec-01's lazy backfill.
  if (model.state === 'no-deck') {
    return (
      <section className="ergo-review-hero ergo-card" aria-label="Build your review deck">
        <div className="ergo-review-hero__body">
          <p className="ergo-review-hero__eyebrow">Daily Review</p>
          <h2 className="ergo-review-hero__title">{copy.noDeckTitle}</h2>
          <p className="ergo-review-hero__tagline">{copy.noDeckSub}</p>
          <div className="ergo-review-hero__footer">
            <button
              type="button"
              className="ergo-review-hero__cta"
              onClick={() => onBuildDeck?.()}
            >
              {copy.buildCta}
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Caught-up (deck exists, none due, §4.2 state 3): a calm empty state, never a
  // guilt-trip. No CTA (or a muted browse). Only renders while hasAnyCards.
  if (model.state === 'caught-up') {
    return (
      <section className="ergo-review-hero ergo-card ergo-review-hero--calm" aria-label="Reviews">
        <div className="ergo-review-hero__body">
          <p className="ergo-review-hero__eyebrow">Daily Review</p>
          <h2 className="ergo-review-hero__title">{copy.caughtUpTitle}</h2>
          <p className="ergo-review-hero__tagline">{copy.caughtUpSub}</p>
        </div>
      </section>
    )
  }

  // Due / ramp: N due + the start CTA. Ramp adds the interview-date line (§4.4).
  return (
    <section className="ergo-review-hero ergo-card" aria-label={`Daily Review: ${model.dueCount} due`}>
      <div className="ergo-review-hero__body">
        <p className="ergo-review-hero__eyebrow">Daily Review</p>
        <h2 className="ergo-review-hero__title">{model.dueCount} due</h2>
        <p className="ergo-review-hero__tagline">{copy.dueSub(model.dueCount)}</p>
        {model.state === 'ramp' && model.rampNote && (
          <p className="ergo-review-hero__note">{model.rampNote}</p>
        )}
        <div className="ergo-review-hero__footer">
          <button type="button" className="ergo-review-hero__cta" onClick={onStart}>
            {copy.startCta}
          </button>
        </div>
      </div>
    </section>
  )
}
