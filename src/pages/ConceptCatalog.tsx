// Concept Catalog — presentational macro-home UI (Stream B).
// Layout C: "Continue learning" resume hero + domain-shelved horizontal carousels.
// Receives all data from ConceptCatalogPage (container); renders nothing Firebase-specific.

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lesson/useReducedMotion'
import { MathViz } from '../lesson/mathviz/MathViz'
import type { MathVizKind } from './studyDesk.model'
import { WeeklyStreak } from '../habit/WeeklyStreak'
import type { Streak } from '../habit/streaks'
import { analytics } from '../analytics/events'
import { CONCEPT_OPEN_TRANSITION } from '../app/viewTransition'
import { conceptPath, interviewPath, ROUTES, type NavigateFn } from './routes'
import type { CatalogModel, ConceptCard, DomainSection } from './conceptCatalog.model'

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ConceptCatalogProps {
  model: CatalogModel
  streak: Streak
  displayName: string
  navigate: NavigateFn
  resumeInterviewDone?: boolean
}

// ── vizKey → MathVizKind mapping ──────────────────────────────────────────────

const MATH_VIZ_KINDS = new Set<string>([
  'coin',
  'stateMachine',
  'raceLanes',
  'randomWalk',
  'twoNode',
  'fourNode',
  'sum',
  'dice',
])

function toMathVizKind(vizKey: string | undefined): MathVizKind | null {
  if (vizKey && MATH_VIZ_KINDS.has(vizKey)) return vizKey as MathVizKind
  return null
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({
  percent,
  accent,
  size = 40,
}: {
  percent: number
  accent: string
  size?: number
}) {
  const stroke = 4
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - percent / 100)
  const cx = size / 2
  const cy = size / 2

  return (
    <svg
      width={size}
      height={size}
      className="ergo-catalog-ring"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${percent}% complete`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--ergo-surface-2)"
        strokeWidth={stroke}
      />
      {/* Fill arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={`var(--${accent})`}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        className="ergo-ring__arc"
      />
      {/* Percentage label */}
      <text
        x={cx}
        y={cy + size * 0.13}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="700"
        fontSize={size * 0.28}
        fill="var(--ergo-ink)"
      >
        {percent}%
      </text>
    </svg>
  )
}

// ── Concept thumbnail ─────────────────────────────────────────────────────────
// MathViz if vizKey is a known kind; else a colored placeholder with initials.

function ConceptThumb({
  card,
  size = 96,
}: {
  card: ConceptCard
  size?: number
}) {
  const kind = toMathVizKind(card.vizKey)
  return (
    <div
      className="ergo-concept-thumb"
      style={{
        width: size,
        height: size,
        background: `var(--${card.accent}-tint, var(--ergo-surface-2))`,
        color: `var(--${card.accent}, var(--ergo-brand))`,
      }}
      aria-hidden="true"
    >
      {kind ? (
        <MathViz kind={kind} className="ergo-mathviz" />
      ) : (
        <span className="ergo-concept-thumb__fallback">
          {card.title.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

// ── Resume hero ───────────────────────────────────────────────────────────────

function ResumeHero({
  card,
  recommendedStart,
  focusAreaComingSoon,
  onNavigate,
  interviewDone,
  onInterview,
}: {
  card: ConceptCard
  recommendedStart?: boolean
  focusAreaComingSoon?: boolean
  onNavigate: (card: ConceptCard, heroEl: HTMLElement) => void
  interviewDone?: boolean
  onInterview?: (conceptId: string) => void
}) {
  const heroRef = useRef<HTMLElement>(null)

  const eyebrow = recommendedStart ? 'Recommended for you' : 'Continue learning'

  const masteredNeedsInterview =
    !recommendedStart && card.progress.state === 'mastered' && !interviewDone

  const ctaLabel = recommendedStart
    ? 'Start here →'
    : masteredNeedsInterview
      ? 'Take the interview →'
      : card.progress.state === 'mastered'
        ? 'Review →'
        : card.progress.state === 'in_progress'
          ? 'Continue →'
          : 'Start →'

  return (
    <section
      ref={heroRef}
      className="ergo-resume-hero ergo-card"
      data-ch={card.accent}
      aria-label={recommendedStart ? `Recommended: ${card.title}` : `Continue learning: ${card.title}`}
      style={{ background: `var(--${card.accent}-tint, var(--ergo-surface-2))` }}
    >
      {/* Thumbnail — morph source for the concept-open VT */}
      <div className="ergo-resume-hero__thumb-wrap">
        <ConceptThumb card={card} size={96} />
      </div>

      <div className="ergo-resume-hero__body">
        <p className="ergo-resume-hero__eyebrow">{eyebrow}</p>
        <h2 className="ergo-resume-hero__title">{card.title}</h2>
        {focusAreaComingSoon && (
          <p className="ergo-resume-hero__note">
            Your area is coming soon — start here meanwhile
          </p>
        )}
        <p className="ergo-resume-hero__tagline">{card.tagline}</p>

        <div className="ergo-resume-hero__footer">
          {card.progress.state !== 'not_started' && card.progress.percent > 0 && (
            <ProgressRing
              percent={card.progress.percent}
              accent={card.accent}
              size={44}
            />
          )}
          <button
            type="button"
            className="ergo-resume-hero__cta"
            style={{ background: `var(--${card.accent}, var(--ergo-brand))` }}
            onClick={() => {
              if (masteredNeedsInterview) {
                onInterview?.(card.conceptId)
                return
              }
              if (heroRef.current) onNavigate(card, heroRef.current)
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

// ── Concept card (carousel item) ──────────────────────────────────────────────

function ConceptCardItem({
  card,
  onNavigate,
}: {
  card: ConceptCard
  onNavigate: (card: ConceptCard, el: HTMLElement) => void
}) {
  const isLive = card.status === 'live'

  const ctaLabel =
    card.progress.state === 'mastered'
      ? 'Review →'
      : card.progress.state === 'in_progress'
        ? 'Continue →'
        : 'Start →'

  function activate(el: HTMLElement) {
    onNavigate(card, el)
  }

  return (
    <div
      role={isLive ? 'button' : 'group'}
      aria-label={card.title}
      aria-disabled={!isLive || undefined}
      className={`ergo-concept-card${card.status === 'coming_soon' ? ' ergo-concept-card--coming-soon' : ''}`}
      data-ch={card.accent}
      tabIndex={isLive ? 0 : -1}
      onClick={
        isLive
          ? (e) => activate(e.currentTarget as HTMLElement)
          : undefined
      }
      onKeyDown={
        isLive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                activate(e.currentTarget as HTMLElement)
              }
            }
          : undefined
      }
    >
      {/* Thumbnail — morph source for the concept-open VT (set on click, see onNavigate) */}
      <div className="ergo-concept-card__thumb-wrap">
        <ConceptThumb card={card} size={88} />
      </div>

      <div className="ergo-concept-card__body">
        <h3 className="ergo-concept-card__title">{card.title}</h3>
        <p className="ergo-concept-card__tagline">{card.tagline}</p>

        {card.status === 'coming_soon' ? (
          <span className="ergo-concept-card__pill" aria-label="Coming soon">
            Coming soon
          </span>
        ) : (
          <div className="ergo-concept-card__footer">
            {card.progress.state !== 'not_started' && card.progress.percent > 0 && (
              <ProgressRing
                percent={card.progress.percent}
                accent={card.accent}
                size={32}
              />
            )}
            <span
              className="ergo-concept-card__cta"
              style={{ color: `var(--${card.accent}, var(--ergo-brand))` }}
            >
              {ctaLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Domain shelf (horizontal carousel) ───────────────────────────────────────

function DomainShelf({
  section,
  onNavigate,
  reducedMotion,
}: {
  section: DomainSection
  onNavigate: (card: ConceptCard, el: HTMLElement) => void
  reducedMotion: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function updateChevrons() {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1)
  }, [])

  function scrollBy(dir: -1 | 1) {
    const el = trackRef.current
    if (!el) return
    const firstCard = el.querySelector<HTMLElement>('.ergo-concept-card')
    const amount = firstCard
      ? firstCard.offsetWidth + 16
      : el.clientWidth - 48
    el.scrollBy({
      left: dir * amount,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }

  function handleTrackKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const cards = Array.from(
      trackRef.current?.querySelectorAll<HTMLElement>('.ergo-concept-card') ?? [],
    )
    const focused = cards.indexOf(document.activeElement as HTMLElement)
    if (focused === -1) return
    const next = e.key === 'ArrowLeft' ? focused - 1 : focused + 1
    if (next >= 0 && next < cards.length) {
      cards[next].focus()
      cards[next].scrollIntoView({
        behavior: reducedMotion ? 'instant' : 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }

  return (
    <section className="ergo-shelf" aria-label={section.domain}>
      <div className="ergo-shelf__header">
        <h2
          className="ergo-shelf__label"
          style={{ color: `var(--${section.concepts[0]?.accent ?? 'ergo-ink-2'})` }}
        >
          {section.domain.toUpperCase()}
        </h2>
      </div>

      <div className="ergo-shelf__track-wrap">
        {/* Prev chevron — desktop only */}
        <button
          type="button"
          className="ergo-shelf__chevron ergo-shelf__chevron--prev"
          aria-label="Scroll left"
          aria-hidden={atStart ? 'true' : 'false'}
          disabled={atStart}
          onClick={() => scrollBy(-1)}
          tabIndex={-1}
        >
          ‹
        </button>

        {/* Scrollable track */}
        <div
          ref={trackRef}
          className="ergo-shelf__track"
          role="region"
          aria-label={`${section.domain} concepts`}
          onScroll={updateChevrons}
          onKeyDown={handleTrackKeyDown}
        >
          {section.concepts.map((card) => (
            <ConceptCardItem
              key={card.conceptId}
              card={card}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Next chevron — desktop only */}
        <button
          type="button"
          className="ergo-shelf__chevron ergo-shelf__chevron--next"
          aria-label="Scroll right"
          aria-hidden={atEnd ? 'true' : 'false'}
          disabled={atEnd}
          onClick={() => scrollBy(1)}
          tabIndex={-1}
        >
          ›
        </button>
      </div>
    </section>
  )
}

// ── ConceptCatalog (root) ─────────────────────────────────────────────────────

export function ConceptCatalog({
  model,
  streak,
  displayName,
  navigate,
  resumeInterviewDone,
}: ConceptCatalogProps) {
  const reducedMotion = useReducedMotion()

  // Navigate with the concept-open View Transition. Adds the CSS marker class
  // to only the clicked element immediately before startViewTransition so the
  // browser's "old" snapshot captures the view-transition-name scoped by
  // :root[data-vt='concept-open'] in shell.css. The catalog unmounts on
  // navigate so no manual removal is needed.
  function handleNavigate(card: ConceptCard, heroEl: HTMLElement) {
    heroEl.classList.add('concept-hero-source')
    void analytics.conceptSelected({ conceptId: card.conceptId })
    navigate(conceptPath(card.conceptId), { viewTransition: CONCEPT_OPEN_TRANSITION })
  }

  function handleResumeInterview(conceptId: string) {
    void analytics.interviewCtaClicked({ conceptId, surface: 'catalog_hero' })
    navigate(interviewPath(conceptId))
  }

  return (
    <div className="ergo-catalog">
      {/* Top bar: wordmark + compact streak + profile avatar */}
      <header className="ergo-topbar" aria-label="Ergo navigation">
        <span className="ergo-wordmark">Ergo</span>
        <div className="ergo-topbar__right">
          <WeeklyStreak
            count={streak.count}
            lastActiveDate={streak.lastActiveDate}
            compact
          />
          <button
            type="button"
            className="ergo-avatar"
            onClick={() => navigate(ROUTES.profile)}
            aria-label={`Profile: ${displayName}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <main aria-label="Concepts" className="ergo-catalog__main">
        {/* Resume hero */}
        {model.resume && (
          <ResumeHero
            card={model.resume}
            recommendedStart={model.recommendedStart}
            focusAreaComingSoon={model.focusAreaComingSoon}
            onNavigate={handleNavigate}
            interviewDone={resumeInterviewDone}
            onInterview={handleResumeInterview}
          />
        )}

        {/* Domain shelves */}
        {model.sections.length > 0 && (
          <div className="ergo-catalog__shelves">
            {model.sections.map((section) => (
              <DomainShelf
                key={section.domain}
                section={section}
                onNavigate={handleNavigate}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
