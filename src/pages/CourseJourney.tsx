// CourseJourney — DOM/SVG vertical learning journey for the Ergo home screen.
// Replaces the Konva CourseSpine with a pure DOM + SVG layout: a gradient
// connector rail, chapter section labels, per-lesson cards with math-viz
// thumbnails, node progress rings, and a sticky active-lesson detail card.
//
// Agent 2 imports this from src/pages/StudyDesk.tsx (or equivalent) as:
//   import { CourseJourney } from './CourseJourney'
//
// The exported signature is fixed — do not change it.

import { Fragment, useRef, useState } from 'react'
import type { Course, Progress } from '../content/schema'
import type { NavigateFn } from './routes'
import { lessonPath } from './routes'
import { analytics } from '../analytics/events'
import {
  resolveNodes,
  resolveChapters,
  recommendedAction,
  nodeCtaLabel,
  chapterForLesson,
  vizForLesson,
  type DeskNode,
  type DeskNodeState,
  type Chapter,
} from './studyDesk.model'
import { MathViz } from '../lesson/mathviz/MathViz'

export function CourseJourney(props: {
  course: Course
  progressById: Record<string, Progress>
  navigate: NavigateFn
  reducedMotion: boolean
  /** Earned milestone ids — used to gate the capstone interview CTA. */
  earned?: Set<string>
  /** The concept's completion milestone id (course.completionMilestoneId). */
  completionMilestoneId?: string
  /** Called when learner clicks "Take capstone interview" on the detail card. */
  onInterviewCta?: (conceptId: string) => void
}): React.JSX.Element {
  const { course, progressById, navigate, reducedMotion, earned, completionMilestoneId, onInterviewCta } = props

  const nodes = resolveNodes(course, progressById)
  const chapters = resolveChapters(course)
  const action = recommendedAction(nodes, progressById)
  // The side card follows the learner's selection; it defaults to the
  // recommended lesson so the Home loads exactly as before. Clicking a card
  // re-points the side card (it no longer enters the lesson — only the side
  // card's CTA does).
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const activeId = selectedId ?? action.lessonId

  const activeNode = nodes.find((n) => n.lessonId === activeId) ?? null
  const activeChapter = activeNode ? (chapterForLesson(activeNode.lessonId, chapters) ?? null) : null
  const activeChapterIndex = activeChapter
    ? chapters.findIndex((c) => c.id === activeChapter.id)
    : -1

  // Build ordered list of navigable node IDs for keyboard navigation refs.
  const navigableIds = nodes
    .filter((n) => n.state !== 'locked')
    .map((n) => n.lessonId)

  const focusableRefs = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const dir = e.key === 'ArrowDown' ? 1 : -1
    const cur = focusableRefs.current.findIndex((b) => b === document.activeElement)
    const start = cur < 0 ? (dir > 0 ? 0 : navigableIds.length - 1) : cur + dir
    const next = Math.min(Math.max(start, 0), navigableIds.length - 1)
    focusableRefs.current[next]?.focus()
  }

  return (
    <div
      className="ergo-journey-layout"
      data-reduced={reducedMotion ? '' : undefined}
      onKeyDown={handleKeyDown}
    >
      {/* ── Left: lesson journey ─────────────────────────────── */}
      <div className="ergo-journey" aria-label="Course lessons">
        {chapters.map((chapter) => {
          const chNodes = nodes.filter((n) =>
            chapter.lessonIds.includes(n.lessonId),
          )
          if (chNodes.length === 0) return null

          const completedCount = chNodes.filter(
            (n) => n.state === 'completed' || n.state === 'needsReview',
          ).length

          return (
            <section
              key={chapter.id}
              className="ergo-chapter"
              data-ch={chapter.hueVar}
            >
              <div
                className="ergo-chapter__label"
                style={{ color: `var(--${chapter.hueVar})` }}
              >
                <span>{chapter.label.toUpperCase()}</span>
                <span className="ergo-chapter__count">
                  {completedCount}/{chNodes.length}
                </span>
              </div>

              <div className="ergo-chapter__body">
                {chNodes.map((node) => {
                  const isActive = node.lessonId === activeId
                  const progress = progressById[node.lessonId]
                  const navIdx = navigableIds.indexOf(node.lessonId)

                  return (
                    <Fragment key={node.lessonId}>
                      <LessonRow
                        node={node}
                        chapter={chapter}
                        isActive={isActive}
                        progress={progress}
                        onSelect={setSelectedId}
                        focusableRef={
                          navIdx >= 0
                            ? (el) => {
                                focusableRefs.current[navIdx] = el
                              }
                            : undefined
                        }
                      />
                      {isActive && activeNode && (
                        <div className="ergo-detail-inline">
                          <DetailCard
                            node={activeNode}
                            chapter={activeChapter}
                            chapterIndex={activeChapterIndex}
                            progress={progressById[activeNode.lessonId]}
                            navigate={navigate}
                            conceptId={course.courseId}
                            earned={earned}
                            completionMilestoneId={completionMilestoneId}
                            onInterviewCta={onInterviewCta}
                          />
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* ── Roadmap stubs ──────────────────────────────────── */}
        {course.roadmap.length > 0 && (
          <section className="ergo-chapter ergo-chapter--roadmap" data-ch="ch4">
            <div className="ergo-chapter__label" style={{ color: 'var(--ch4)' }}>
              <span>ON THE ROADMAP</span>
            </div>
            <div className="ergo-chapter__body">
              {course.roadmap.map((stub) => (
                <RoadmapRow key={stub.lessonId} stub={stub} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Right: sticky detail card ────────────────────────── */}
      {activeNode && (
        <aside className="ergo-detail-col" aria-label="Active lesson details">
          <DetailCard
            node={activeNode}
            chapter={activeChapter}
            chapterIndex={activeChapterIndex}
            progress={progressById[activeNode.lessonId]}
            navigate={navigate}
            conceptId={course.courseId}
            earned={earned}
            completionMilestoneId={completionMilestoneId}
            onInterviewCta={onInterviewCta}
          />
        </aside>
      )}
    </div>
  )
}

// ── Lesson row ───────────────────────────────────────────────────────────────

function LessonRow({
  node,
  chapter,
  isActive,
  progress,
  onSelect,
  focusableRef,
}: {
  node: DeskNode
  chapter: Chapter
  isActive: boolean
  progress: Progress | undefined
  onSelect: (lessonId: string) => void
  focusableRef: ((el: HTMLButtonElement | null) => void) | undefined
}) {
  const navigable = node.state !== 'locked'

  function handleClick() {
    if (!navigable) return
    onSelect(node.lessonId)
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const rowClass = [
    'ergo-row',
    `ergo-row--${node.state}`,
    isActive ? 'ergo-row--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cardClass = [
    'ergo-card',
    isActive ? 'ergo-card--active' : '',
    // Source element for the home→lesson shared-element view transition
    // (paired with the lesson's .prompt__text under :root[data-vt='home-lesson']).
    isActive ? 'lesson-hero-source' : '',
    node.state === 'locked' ? 'ergo-card--locked' : '',
    node.state === 'needsReview' ? 'ergo-card--review' : '',
    node.state === 'completed' ? 'ergo-card--completed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const vizColor = `var(--${chapter.hueVar})`
  const vizTint = `var(--${chapter.hueVar}-tint)`

  return (
    <div className={rowClass}>
      <div className="ergo-node-wrap">
        <NodeDot
          state={node.state}
          isActive={isActive}
          chapter={chapter}
          progress={progress}
        />
      </div>

      {navigable ? (
        <button
          type="button"
          ref={focusableRef}
          className={cardClass}
          style={
            isActive
              ? {
                  borderColor: vizColor,
                  outline: `none`,
                }
              : undefined
          }
          aria-label={cardAriaLabel(node, isActive)}
          aria-current={isActive ? 'true' : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyPress}
        >
          <CardContent
            node={node}
            vizColor={vizColor}
            vizTint={vizTint}
          />
        </button>
      ) : (
        <div
          className={cardClass}
          aria-label={cardAriaLabel(node, isActive)}
          aria-disabled="true"
        >
          <CardContent
            node={node}
            vizColor={vizColor}
            vizTint={vizTint}
          />
        </div>
      )}
    </div>
  )
}

function CardContent({
  node,
  vizColor,
  vizTint,
}: {
  node: DeskNode
  vizColor: string
  vizTint: string
}) {
  return (
    <>
      <div
        className="ergo-card__viz"
        style={{
          color: vizColor,
          background:
            node.state === 'locked' ? 'var(--ergo-surface-2)' : vizTint,
        }}
      >
        <MathViz kind={vizForLesson(node.lessonId, node.vizKey)} className="ergo-mathviz" />
      </div>

      <div className="ergo-card__meta">
        <div className="ergo-card__title">{node.title}</div>
        <div className="ergo-card__hook">{node.hook}</div>
      </div>

      <div className="ergo-card__status" aria-hidden="true">
        {node.state === 'completed' || node.state === 'needsReview' ? (
          <CompletedIcon reviewPending={node.state === 'needsReview'} />
        ) : node.state === 'locked' ? (
          <LockIcon />
        ) : null}
      </div>
    </>
  )
}

// ── Node dot with progress ring ──────────────────────────────────────────────

function NodeDot({
  state,
  isActive,
  chapter,
  progress,
}: {
  state: DeskNodeState
  isActive: boolean
  chapter: Chapter
  progress: Progress | undefined
}) {
  const chColor = `var(--${chapter.hueVar})`

  const dotClass = [
    'ergo-node__dot',
    `ergo-node__dot--${state}`,
    isActive ? 'ergo-node__dot--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  // Circumference for r=16 in a 36×36 SVG
  const r = 16
  const circ = 2 * Math.PI * r // ≈ 100.53

  // Determine arc fill based on state
  let arcOffset = circ // fully empty by default
  if (state === 'completed' || state === 'needsReview') {
    arcOffset = 0 // full ring
  } else if (
    state === 'available' &&
    progress?.completionStatus === 'in_progress'
  ) {
    arcOffset = circ * 0.6 // ~40% filled to indicate partial progress
  }

  return (
    <div
      className={dotClass}
      style={
        isActive
          ? {
              borderColor: chColor,
              boxShadow: `0 0 0 4px var(--${chapter.hueVar}-tint, rgba(79,70,229,.15))`,
            }
          : state === 'completed' || state === 'needsReview'
            ? { background: chColor }
            : state === 'available'
              ? { borderColor: chColor }
              : undefined
      }
    >
      {/* Progress ring SVG */}
      <svg
        className="ergo-node__ring"
        viewBox="0 0 36 36"
        width="36"
        height="36"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={
            state === 'completed' || state === 'needsReview'
              ? 'rgba(255,255,255,0.3)'
              : 'var(--ergo-line-2, rgba(22,26,39,.14))'
          }
          strokeWidth="2.5"
        />
        {/* Arc fill */}
        {(state === 'completed' ||
          state === 'needsReview' ||
          (state === 'available' &&
            progress?.completionStatus === 'in_progress')) && (
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={
              state === 'completed' || state === 'needsReview'
                ? 'white'
                : chColor
            }
            strokeWidth="2.5"
            strokeDasharray={`${circ.toFixed(2)} ${circ.toFixed(2)}`}
            strokeDashoffset={arcOffset.toFixed(2)}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        )}
      </svg>

      {/* Inner icon: checkmark, dot, or lock */}
      {(state === 'completed' || state === 'needsReview') ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="ergo-node__check"
        >
          <path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : state === 'locked' ? (
        <LockDotIcon />
      ) : (
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          aria-hidden="true"
          className="ergo-node__pip"
        >
          <circle
            cx="4"
            cy="4"
            r={isActive ? '3.5' : '2.5'}
            fill={isActive ? chColor : 'none'}
            stroke={chColor}
            strokeWidth={isActive ? '0' : '1.5'}
          />
        </svg>
      )}
    </div>
  )
}

// ── Roadmap row ──────────────────────────────────────────────────────────────

function RoadmapRow({
  stub,
}: {
  stub: { lessonId: string; title: string; summary: string }
}) {
  return (
    <div className="ergo-row ergo-row--roadmap">
      <div className="ergo-node-wrap ergo-node-wrap--roadmap">
        <div className="ergo-node__dot ergo-node__dot--roadmap">
          <svg
            className="ergo-node__ring"
            viewBox="0 0 36 36"
            width="36"
            height="36"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="var(--ergo-line-2, rgba(22,26,39,.14))"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
      <div
        className="ergo-card ergo-card--roadmap"
        aria-label={`${stub.title}, on the roadmap`}
        aria-disabled="true"
      >
        <div
          className="ergo-card__viz"
          style={{ color: 'var(--ch4)', background: 'var(--ergo-surface-2)' }}
        >
          <MathViz kind="dice" className="ergo-mathviz" />
        </div>
        <div className="ergo-card__meta">
          <div className="ergo-card__title ergo-card__title--roadmap">
            {stub.title}
          </div>
          <div className="ergo-card__hook">{stub.summary}</div>
        </div>
      </div>
    </div>
  )
}

// ── Detail card (active lesson) ──────────────────────────────────────────────

function DetailCard({
  node,
  chapter,
  chapterIndex,
  progress,
  navigate,
  conceptId,
  earned,
  completionMilestoneId,
  onInterviewCta,
}: {
  node: DeskNode
  chapter: Chapter | null
  chapterIndex: number
  progress: Progress | undefined
  navigate: NavigateFn
  conceptId?: string
  earned?: Set<string>
  completionMilestoneId?: string
  onInterviewCta?: (conceptId: string) => void
}) {
  const chColor = chapter ? `var(--${chapter.hueVar})` : 'var(--ergo-brand)'
  const cta = nodeCtaLabel(node, progress)
  const completionEarned = earned && completionMilestoneId
    ? earned.has(completionMilestoneId)
    : false

  const chNum = chapterIndex >= 0 ? chapterIndex + 1 : ''
  const chName = chapter?.label ?? ''

  // Progress ring geometry
  const r = 26
  const circ = 2 * Math.PI * r // ≈ 163.36

  const isCompleted =
    node.state === 'completed' || node.state === 'needsReview'
  const isInProgress = progress?.completionStatus === 'in_progress'

  let arcOffset = circ // empty by default
  let ringLabel: string | null = null
  let ringSubLabel: string | null = null

  if (isCompleted) {
    arcOffset = 0
    ringLabel = '✓'
    ringSubLabel = 'COMPLETE'
  } else if (isInProgress) {
    arcOffset = circ * 0.65 // ~35% filled — no fake number shown
    ringSubLabel = 'IN PROGRESS'
  }

  return (
    <div className="ergo-detail">
      {chNum && (
        <div
          className="ergo-detail__chapter-label"
          style={{ color: chColor }}
        >
          CHAPTER {chNum} · {chName.toUpperCase()}
        </div>
      )}

      <div className="ergo-detail__header">
        <div className="ergo-detail__title">{node.title}</div>

        {/* Progress ring */}
        <div className="ergo-ring-wrap">
          <svg
            className="ergo-ring"
            width="64"
            height="64"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="var(--ergo-line-2, rgba(22,26,39,.14))"
              strokeWidth="5"
            />
            {/* Arc */}
            {(isCompleted || isInProgress) && (
              <circle
                cx="32"
                cy="32"
                r={r}
                fill="none"
                stroke={chColor}
                strokeWidth="5"
                strokeDasharray={`${circ.toFixed(2)} ${circ.toFixed(2)}`}
                strokeDashoffset={arcOffset.toFixed(2)}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                className="ergo-ring__arc"
              />
            )}
            {ringLabel && (
              <text
                x="32"
                y="37"
                textAnchor="middle"
                fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
                fontWeight="700"
                fontSize="16"
                fill={chColor}
              >
                {ringLabel}
              </text>
            )}
          </svg>
          {ringSubLabel && (
            <span className="ergo-ring__sub">{ringSubLabel}</span>
          )}
        </div>
      </div>

      <p className="ergo-detail__desc">{node.hook}</p>

      {cta && (
        <button
          type="button"
          className="ergo-detail__cta"
          style={{ background: chColor }}
          onClick={() => navigate(lessonPath(node.lessonId))}
          aria-label={`${cta} ${node.title}`}
        >
          {cta} lesson
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {completionEarned && conceptId && (
        <button
          type="button"
          className="ergo-detail__cta ergo-detail__cta--interview"
          style={{ background: chColor }}
          onClick={() => {
            void analytics.interviewCtaClicked({
              conceptId,
              surface: 'concept_page',
            })
            onInterviewCta?.(conceptId)
          }}
          aria-label={`Take the capstone interview for ${node.title}`}
        >
          Take capstone interview
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Small icon helpers ───────────────────────────────────────────────────────

function CompletedIcon({ reviewPending }: { reviewPending: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="9"
        fill={reviewPending ? 'var(--mark-tint, #FBF0DD)' : 'var(--ok-tint, #E4F6EE)'}
      />
      <path
        d="M5.5 10.5L8.5 13.5L14.5 7"
        stroke={reviewPending ? 'var(--mark, #E0982E)' : 'var(--ok, #16A36B)'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="10" height="7" rx="1.5" fill="var(--ergo-ink-3, #8A90A4)" opacity="0.4" />
      <path
        d="M5 8V6a3 3 0 0 1 6 0v2"
        stroke="var(--ergo-ink-3, #8A90A4)"
        strokeWidth="1.4"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

function LockDotIcon() {
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden="true">
      <rect x="1.5" y="6" width="9" height="7" rx="1.5" fill="var(--ergo-ink-3, #8A90A4)" opacity="0.55" />
      <path d="M3 6V4.5a3 3 0 0 1 6 0V6" stroke="var(--ergo-ink-3, #8A90A4)" strokeWidth="1.4" fill="none" opacity="0.55" />
    </svg>
  )
}

// ── Aria label helpers ───────────────────────────────────────────────────────

function cardAriaLabel(node: DeskNode, isActive: boolean): string {
  if (node.state === 'locked') return `${node.title}, locked`
  const status =
    node.state === 'needsReview'
      ? 'completed — review recommended'
      : node.state === 'completed'
        ? 'completed'
        : 'available'
  // The card now selects (revealing the side card); the "Start/Resume" verb
  // lives on the side card's CTA, so the row only announces status + selection.
  return isActive ? `${node.title}, ${status}, selected` : `${node.title}, ${status}`
}
