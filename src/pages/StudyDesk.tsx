// Study Desk — the signed-in Home (docs/home-study-desk.md; docs/ui_design_system.md
// "Signed-in Home" + "Course Path (Graph Nodes)"). Pure presentational reskin of
// the card-style CoursePathPage precursor: it renders the habit panel, milestone
// seal gallery, and the graph-node course path from props alone (course,
// progressById, streak, earned, navigate) so it can be driven by the real data
// container or the /dev/home fixture harness with no Firebase.
//
// Rendering split (ADR-0001 / Q17–Q19):
//  - Laptop (>=768px): a single Konva <CourseSpine> draws the spine/dots/glyphs/
//    beam; a parallel transparent DOM-button overlay carries focus/keyboard/44px/
//    aria; the focused detail panel is beamed to the right.
//  - Mobile (<768px): responsive divergence — the focused node is a full-width DOM
//    card (with the live preview); the remaining glyph-only nodes are a compact
//    Konva rail below; tapping a rail node expands its detail inline (one at a time).

import { useEffect, useMemo, useRef, useState } from 'react'
import { m } from 'motion/react'
import { DUR, EASE } from '../motion/tokens'
import type { Course, Progress } from '../content/schema'
import type { Streak } from '../habit/streaks'
import { MILESTONE_SEQUENCE } from '../habit/milestones'
import { StreakTally } from '../habit/StreakTally'
import { MilestoneSeal } from '../habit/MilestoneSeal'
import { buildAutomaton } from '../engine/automaton'
import type { Automaton } from '../engine/types'
import { useReducedMotion } from '../lesson/useReducedMotion'
import { useElementWidth } from '../lesson/konva/useElementWidth'
import { CourseSpine, type SpineItem } from '../lesson/konva/CourseSpine'
import { LessonPreview } from '../lesson/LessonPreview'
import {
  FLAGSHIP_LESSON_ID,
  lessonPath,
  ROUTES,
  type NavigateFn,
} from './routes'
import {
  resolveNodes,
  recommendedAction,
  statusLine,
  reviewNote,
  nodeCtaLabel,
  ROADMAP_GLYPH,
  type DeskNode,
} from './studyDesk.model'

export interface StudyDeskProps {
  course: Course | null
  progressById: Record<string, Progress>
  streak: Streak
  earned: Set<string>
  /** Milestone ids earned since the last Home visit — play the one-time fade (Q11). */
  newlyEarned?: Set<string>
  displayName: string
  navigate: NavigateFn
}

// Laptop single-Stage spine geometry (px). Shared by the Konva draw + the DOM
// overlay so the two layers stay aligned.
const LAP = { top: 40, gap: 88, dotR: 20, spineX: 48, panelX: 156 }
// Mobile compact rail geometry (px).
const RAIL = { top: 26, gap: 58, dotR: 16, spineX: 30 }

// Home reveal: the desk sections rise in sequence on load (reduced-motion drops
// the slide via MotionConfig, leaving a plain fade).
const deskContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const deskItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.out } },
}

function laptopYs(n: number): number[] {
  return Array.from({ length: n }, (_, i) => LAP.top + i * LAP.gap)
}
function railYs(n: number): number[] {
  return Array.from({ length: n }, (_, i) => RAIL.top + i * RAIL.gap)
}

function useIsLaptop(): boolean {
  const [laptop, setLaptop] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window
      ? window.matchMedia('(min-width: 768px)').matches
      : true,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = () => setLaptop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return laptop
}

function todayLocalISO(): string {
  const d = new Date()
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function stateCaption(node: DeskNode, progress: Progress | undefined): string {
  if (node.state === 'completed') return 'Completed'
  if (node.state === 'needsReview') return 'Review recommended'
  if (node.state === 'locked') return 'Locked'
  if (progress?.completionStatus === 'in_progress') return 'In progress'
  return 'Ready to start'
}

export function StudyDesk({
  course,
  progressById,
  streak,
  earned,
  newlyEarned,
  displayName,
  navigate,
}: StudyDeskProps) {
  const reducedMotion = useReducedMotion()
  const isLaptop = useIsLaptop()
  // Only L1 ships a real preview today; the engine automaton is HH (Q10).
  const previewAutomaton = useMemo(() => buildAutomaton('HH', 0.5), [])

  return (
    <div className="coursepath desk">
      <header className="appbar">
        <span className="appbar__title appbar__wordmark">
          {course?.title ?? 'Pattern Hitting Times'}
        </span>
        <div className="appbar__right">
          <button
            type="button"
            className="appbar__profile"
            onClick={() => navigate(ROUTES.profile)}
          >
            <span className="appbar__avatar" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="appbar__name">{displayName}</span>
          </button>
        </div>
      </header>

      <main className="coursepath__main desk__main">
        {!course ? (
          <DeskSkeleton />
        ) : (
          <DeskBody
            course={course}
            progressById={progressById}
            streak={streak}
            earned={earned}
            newlyEarned={newlyEarned}
            navigate={navigate}
            reducedMotion={reducedMotion}
            isLaptop={isLaptop}
            previewAutomaton={previewAutomaton}
          />
        )}
      </main>
    </div>
  )
}

function DeskBody({
  course,
  progressById,
  streak,
  earned,
  newlyEarned,
  navigate,
  reducedMotion,
  isLaptop,
  previewAutomaton,
}: {
  course: Course
  progressById: Record<string, Progress>
  streak: Streak
  earned: Set<string>
  newlyEarned: Set<string> | undefined
  navigate: NavigateFn
  reducedMotion: boolean
  isLaptop: boolean
  previewAutomaton: Automaton
}) {
  const nodes = resolveNodes(course, progressById)
  const action = recommendedAction(nodes, progressById)
  const focusedIndex = Math.max(
    0,
    nodes.findIndex((n) => n.lessonId === action.lessonId),
  )

  const status = statusLine(action, nodes)
  const note = reviewNote(action, nodes)
  const qualifiedToday = streak.lastActiveDate === todayLocalISO()
  const practiceNote =
    streak.count > 0 && !qualifiedToday
      ? 'Practice today to extend your streak.'
      : null

  const pathProps = {
    nodes,
    progressById,
    focusedIndex,
    navigate,
    reducedMotion,
    previewAutomaton,
  }

  return (
    <m.div
      className="desk-reveal"
      variants={deskContainer}
      initial="hidden"
      animate="show"
    >
      <m.div variants={deskItem}>
        <HabitPanel
          streak={streak}
          status={status}
          reviewNote={note}
          practiceNote={practiceNote}
        />
      </m.div>

      <m.div variants={deskItem}>
        <SealGallery earned={earned} newlyEarned={newlyEarned} />
      </m.div>

      <m.div variants={deskItem}>
        <p className="coursepath__section">Course</p>
        {isLaptop ? (
          <CoursePathLaptop {...pathProps} />
        ) : (
          <CoursePathMobile {...pathProps} />
        )}
      </m.div>

      {course.roadmap.length > 0 && (
        <m.div variants={deskItem}>
          <p className="coursepath__divider">On the roadmap</p>
          <ul className="roadmap">
            {course.roadmap.map((stub) => (
              <RoadmapStub
                key={stub.lessonId}
                title={stub.title}
                hook={stub.summary}
              />
            ))}
          </ul>
        </m.div>
      )}
    </m.div>
  )
}

// --- Habit panel (§2.2): streak tally + status line, no button. ---------------
function HabitPanel({
  streak,
  status,
  reviewNote,
  practiceNote,
}: {
  streak: Streak
  status: string
  reviewNote: string | null
  practiceNote: string | null
}) {
  return (
    <section className="habit" aria-label="Daily streak and next action">
      <StreakTally count={streak.count} />
      <p className="habit__status">{status}</p>
      {reviewNote && <p className="habit__note">{reviewNote}</p>}
      {practiceNote && <p className="habit__note">{practiceNote}</p>}
    </section>
  )
}

// --- Milestone seal gallery (§2.3): all 8 seals, earned + ghost, fixed order. --
function SealGallery({
  earned,
  newlyEarned,
}: {
  earned: Set<string>
  newlyEarned: Set<string> | undefined
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const detail = expanded
    ? MILESTONE_SEQUENCE.find((m) => m.id === expanded)
    : null

  return (
    <section className="seals" aria-label="Milestones">
      <p className="seals__label">Milestones</p>
      <div className="seals__shelf">
        {MILESTONE_SEQUENCE.map((m) => (
          <MilestoneSeal
            key={m.id}
            meta={m}
            earned={earned.has(m.id)}
            earning={newlyEarned?.has(m.id)}
            onClick={() => setExpanded((cur) => (cur === m.id ? null : m.id))}
            active={expanded === m.id}
          />
        ))}
      </div>
      {detail && (
        <p className="seals__detail" role="status">
          <span className="seals__detail-title">{detail.title}</span>
          {earned.has(detail.id)
            ? ' — earned.'
            : ' — locked. Complete its lesson to earn this seal.'}
        </p>
      )}
    </section>
  )
}

interface PathProps {
  nodes: DeskNode[]
  progressById: Record<string, Progress>
  focusedIndex: number
  navigate: NavigateFn
  reducedMotion: boolean
  previewAutomaton: Automaton
}

// --- Course path, laptop: single Konva spine + DOM overlay (Q17/Q18). ---------
function CoursePathLaptop({
  nodes,
  progressById,
  focusedIndex,
  navigate,
  reducedMotion,
  previewAutomaton,
}: PathProps) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  const ys = laptopYs(nodes.length)
  const height = LAP.top + (nodes.length - 1) * LAP.gap + LAP.dotR + 30
  const focusedNode = nodes[focusedIndex]

  const items: SpineItem[] = nodes.map((n) => ({
    key: n.lessonId,
    glyph: n.glyph,
    state: n.state,
    focused: n.index === focusedIndex,
  }))

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const dir = e.key === 'ArrowDown' ? 1 : -1
    const cur = btnRefs.current.findIndex((b) => b === document.activeElement)
    const start = cur < 0 ? (dir > 0 ? 0 : nodes.length - 1) : cur + dir
    const next = Math.min(Math.max(start, 0), nodes.length - 1)
    btnRefs.current[next]?.focus()
  }

  return (
    <div
      className="desk-spine"
      ref={boxRef}
      style={{ height }}
      onKeyDown={onKeyDown}
    >
      {width > 0 && (
        <CourseSpine
          width={width}
          height={height}
          spineX={LAP.spineX}
          dotRadius={LAP.dotR}
          items={items}
          ys={ys}
          beam={{ toX: LAP.panelX + 6, y: ys[focusedIndex] }}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Parallel transparent DOM-button overlay: focus / keyboard / 44px / aria. */}
      {nodes.map((n, i) => (
        <button
          key={n.lessonId}
          type="button"
          ref={(el) => {
            btnRefs.current[i] = el
          }}
          className="spine-hit"
          style={{ top: ys[i] - 22, left: LAP.spineX - 22 }}
          aria-label={nodeAria(n, i, focusedIndex, progressById[n.lessonId])}
          aria-current={i === focusedIndex ? 'true' : undefined}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive((a) => (a === i ? null : a))}
          onFocus={() => setActive(i)}
          onBlur={() => setActive((a) => (a === i ? null : a))}
          onClick={() => {
            // Available/completed nodes enter the lesson; locked nodes toggle
            // their detail (so the panel is reachable by tap, not only hover).
            if (n.state === 'locked') setActive((a) => (a === i ? null : i))
            else navigate(lessonPath(n.lessonId))
          }}
        />
      ))}

      {/* Focused detail panel, pinned open + beamed to the right of the dot. */}
      <NodeDetailCard
        className="node-panel"
        style={{ top: ys[focusedIndex] - 26, left: LAP.panelX }}
        node={focusedNode}
        progress={progressById[focusedNode.lessonId]}
        navigate={navigate}
        reducedMotion={reducedMotion}
        previewAutomaton={previewAutomaton}
        showPreview
      />

      {/* Hover/focus detail for a non-focused node (title + hook + status). */}
      {active != null && active !== focusedIndex && (
        <NodeDetailCard
          className="node-popover"
          style={{ top: ys[active] - 12, left: LAP.spineX + 40 }}
          node={nodes[active]}
          progress={progressById[nodes[active].lessonId]}
          navigate={navigate}
          reducedMotion={reducedMotion}
          previewAutomaton={previewAutomaton}
          showPreview={false}
        />
      )}
    </div>
  )
}

// --- Course path, mobile: focused card + compact Konva rail (Q19/Q20). --------
function CoursePathMobile({
  nodes,
  progressById,
  focusedIndex,
  navigate,
  reducedMotion,
  previewAutomaton,
}: PathProps) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [selected, setSelected] = useState<string | null>(null)

  const focusedNode = nodes[focusedIndex]
  const railNodes = nodes.filter((n) => n.index !== focusedIndex)
  const ys = railYs(railNodes.length)
  const height = RAIL.top + (railNodes.length - 1) * RAIL.gap + RAIL.dotR + 18

  const items: SpineItem[] = railNodes.map((n) => ({
    key: n.lessonId,
    glyph: n.glyph,
    state: n.state,
    focused: false,
  }))
  const selectedNode = railNodes.find((n) => n.lessonId === selected) ?? null

  return (
    <div className="desk-mobile">
      <NodeDetailCard
        className="node-card node-card--focused"
        node={focusedNode}
        progress={progressById[focusedNode.lessonId]}
        navigate={navigate}
        reducedMotion={reducedMotion}
        previewAutomaton={previewAutomaton}
        showPreview
        previewMaxHeight={116}
      />

      <div className="rail" ref={boxRef} style={{ height }}>
        {width > 0 && (
          <CourseSpine
            width={width}
            height={height}
            spineX={RAIL.spineX}
            dotRadius={RAIL.dotR}
            items={items}
            ys={ys}
            reducedMotion={reducedMotion}
          />
        )}
        {railNodes.map((n, i) => (
          <button
            key={n.lessonId}
            type="button"
            className={`rail-hit${selected === n.lessonId ? ' rail-hit--on' : ''}`}
            style={{ top: ys[i] - RAIL.gap / 2, height: RAIL.gap }}
            aria-label={nodeAria(n, n.index, focusedIndex, progressById[n.lessonId])}
            aria-expanded={selected === n.lessonId}
            onClick={() =>
              setSelected((cur) => (cur === n.lessonId ? null : n.lessonId))
            }
          />
        ))}
      </div>

      {selectedNode && (
        <NodeDetailCard
          className="node-card node-card--expanded"
          node={selectedNode}
          progress={progressById[selectedNode.lessonId]}
          navigate={navigate}
          reducedMotion={reducedMotion}
          previewAutomaton={previewAutomaton}
          showPreview={false}
        />
      )}
    </div>
  )
}

// Shared detail card form (laptop panel / popover, mobile focused / expanded).
function NodeDetailCard({
  className,
  style,
  node,
  progress,
  navigate,
  reducedMotion,
  previewAutomaton,
  showPreview,
  previewMaxHeight,
}: {
  className: string
  style?: React.CSSProperties
  node: DeskNode
  progress: Progress | undefined
  navigate: NavigateFn
  reducedMotion: boolean
  previewAutomaton: Automaton
  showPreview: boolean
  previewMaxHeight?: number
}) {
  const cta = nodeCtaLabel(node, progress)
  const hasRealPreview = node.lessonId === FLAGSHIP_LESSON_ID && node.built

  return (
    <div className={className} style={style}>
      <div className="node-card__head">
        <span className="node-card__glyph mono" aria-hidden="true">
          {node.glyph}
        </span>
        <h2 className="node-card__title">{node.title}</h2>
      </div>
      <p className="node-card__hook">{node.hook}</p>

      {showPreview &&
        (hasRealPreview ? (
          <LessonPreview
            automaton={previewAutomaton}
            reducedMotion={reducedMotion}
            label={node.glyph}
            maxHeight={previewMaxHeight}
          />
        ) : (
          <div className="lesson-preview lesson-preview--placeholder">
            <span className="lesson-preview__glyph mono">{node.glyph}</span>
          </div>
        ))}

      <p className="node-card__state">{stateCaption(node, progress)}</p>

      {cta && (
        <button
          type="button"
          className="btn btn--primary node-card__cta"
          onClick={() => navigate(lessonPath(node.lessonId))}
        >
          {cta}
        </button>
      )}
    </div>
  )
}

function RoadmapStub({ title, hook }: { title: string; hook: string }) {
  return (
    <li className="roadmap__node">
      <span className="roadmap__dot mono" aria-hidden="true">
        {ROADMAP_GLYPH}
      </span>
      <div className="roadmap__body">
        <p className="roadmap__title">{title}</p>
        <p className="roadmap__hook">{hook}</p>
        <p className="roadmap__state">On the roadmap</p>
      </div>
    </li>
  )
}

function nodeAria(
  node: DeskNode,
  index: number,
  focusedIndex: number,
  progress: Progress | undefined,
): string {
  const n = `Lesson ${index + 1}, ${node.title}`
  if (node.state === 'locked') return `${n}, locked`
  if (index === focusedIndex) {
    const verb = nodeCtaLabel(node, progress) ?? 'Open'
    return `${verb} ${node.title}`
  }
  if (node.state === 'needsReview') return `${n}, completed, review recommended`
  if (node.state === 'completed') return `${n}, completed`
  return `Open ${node.title}`
}

// DOM skeletons during the data fetch — no canvas, no spinner (Q22).
function DeskSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Loading your study desk…</span>
      <div className="habit habit--skeleton">
        <div className="skeleton skeleton__tally" />
        <div className="skeleton skeleton__status" />
      </div>
      <div className="seals">
        <div className="seals__shelf seals__shelf--skeleton">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton__seal" />
          ))}
        </div>
      </div>
      <p className="coursepath__section">Course</p>
      <div className="desk-skeleton-path">
        <div className="skeleton skeleton__panel" />
        <div className="desk-skeleton-dots">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton skeleton__dot" />
          ))}
        </div>
      </div>
    </div>
  )
}
