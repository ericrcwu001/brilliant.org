// Extensive-form game tree beat for the Game Theory concept. Renders a finite
// game tree top-down and lets the learner fold it by backward induction to
// reveal the subgame-perfect equilibrium (SPE). Ungraded — Continue is always
// enabled. Reduced-motion → fully-folded final frame on first render.

import { useState } from 'react'
import type { BeatProps } from './types'
import { BeatShell } from '../BeatShell'
import { backwardInduction, formatVector } from '../../engine/gameTheory'
import type { GameTreeNode } from '../../engine/gameTheory'
import type { GameTreeNodeData } from '../../content/schema'

// ── Helpers ──────────────────────────────────────────────────────────────────

function nodeId(path: number[]): string {
  return path.length === 0 ? 'root' : path.join('-')
}

function collectDecisionIds(
  node: GameTreeNodeData,
  path: number[] = [],
): Set<string> {
  if (node.kind === 'leaf') return new Set()
  const ids = new Set<string>([nodeId(path)])
  for (let i = 0; i < node.moves.length; i++) {
    collectDecisionIds(node.moves[i].child, [...path, i]).forEach((id) =>
      ids.add(id),
    )
  }
  return ids
}

// A decision node is ready to fold when all its direct children are either
// leaves or already-solved decision nodes.
function canFold(
  node: GameTreeNodeData,
  solvedIds: Set<string>,
  path: number[],
): boolean {
  if (node.kind !== 'decision') return false
  if (solvedIds.has(nodeId(path))) return false
  return node.moves.every((move, i) => {
    const child = move.child
    return child.kind === 'leaf' || solvedIds.has(nodeId([...path, i]))
  })
}

// ── TreeNodeView ─────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: GameTreeNodeData
  path: number[]
  solvedIds: Set<string>
  allSolved: boolean
  // Whether this subtree lies on the global SPE path (root starts true).
  onSpePath: boolean
  players: string[]
  onFold: (node: GameTreeNodeData, path: number[]) => void
}

function TreeNodeView({
  node,
  path,
  solvedIds,
  allSolved,
  onSpePath,
  players,
  onFold,
}: TreeNodeProps) {
  if (node.kind === 'leaf') {
    return (
      <div
        className={
          'gt-tree__leaf' + (onSpePath ? ' gt-tree__leaf--spe' : '')
        }
      >
        <span className="gt-tree__payoff-tag">
          ({formatVector(node.payoff)})
        </span>
      </div>
    )
  }

  const id = nodeId(path)
  const isSolved = solvedIds.has(id)
  const ready = canFold(node, solvedIds, path)
  const playerName = players[node.player] ?? `Player ${node.player + 1}`

  // For a solved node, compute the locally-optimal move label once.
  const optimalMoveLabel: string | undefined = isSolved
    ? backwardInduction(node as unknown as GameTreeNode).path[0]
    : undefined

  return (
    <div className="gt-tree__subtree">
      {isSolved ? (
        <div
          className="gt-tree__decision-node gt-tree__decision-node--solved"
          aria-label={`${playerName}: solved`}
        >
          {playerName}
        </div>
      ) : (
        <button
          type="button"
          className={
            'gt-tree__decision-node' +
            (ready
              ? ' gt-tree__decision-node--ready'
              : ' gt-tree__decision-node--waiting')
          }
          onClick={() => onFold(node, path)}
          disabled={!ready}
          aria-label={
            ready
              ? `${playerName}: tap to solve`
              : `${playerName}: solve child nodes first`
          }
        >
          {playerName}
        </button>
      )}

      <div className="gt-tree__branches">
        {node.moves.map((move, i) => {
          const isOptimal = isSolved && move.label === optimalMoveLabel
          // A branch is on the global SPE path only when this subtree is already
          // on the path, all nodes are solved, and this move is optimal here.
          const childOnSpePath = onSpePath && allSolved && isOptimal
          return (
            <div
              key={i}
              className={
                'gt-tree__branch' +
                (isOptimal ? ' gt-tree__branch--optimal' : '') +
                (childOnSpePath ? ' gt-tree__branch--spe' : '')
              }
            >
              <span className="gt-tree__move-label">{move.label}</span>
              <TreeNodeView
                node={move.child}
                path={[...path, i]}
                solvedIds={solvedIds}
                allSolved={allSolved}
                onSpePath={childOnSpePath}
                players={players}
                onFold={onFold}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── GameTreeBeat ──────────────────────────────────────────────────────────────

export function GameTreeBeat(props: BeatProps) {
  const { beat, isLast, onAdvance, reducedMotion } = props

  // Narrow the interaction BEFORE hooks; hooks must be unconditional.
  const interaction =
    beat.interaction.type === 'gameTree' ? beat.interaction : null
  const rootData = (interaction?.root ?? null) as GameTreeNodeData | null
  const players = interaction?.players ?? []

  // Reduced-motion → start with all decision nodes solved (final frame).
  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => {
    if (!rootData || !reducedMotion) return new Set<string>()
    return collectDecisionIds(rootData)
  })
  const [liveMsg, setLiveMsg] = useState('')

  if (!interaction || !rootData) return null

  const allDecisionIds = collectDecisionIds(rootData)
  const allSolved =
    allDecisionIds.size === 0 ||
    Array.from(allDecisionIds).every((id) => solvedIds.has(id))

  const spe = backwardInduction(rootData as unknown as GameTreeNode)
  const spePayoff = formatVector(spe.payoff)

  // Override the live message with the SPE announcement once fully solved.
  const displayMsg = allSolved
    ? `Subgame-perfect equilibrium: ${spePayoff}`
    : liveMsg

  function handleFold(node: GameTreeNodeData, path: number[]) {
    const result = backwardInduction(node as unknown as GameTreeNode)
    const chosenMove = result.path[0] ?? '?'
    setSolvedIds((prev) => new Set([...Array.from(prev), nodeId(path)]))
    setLiveMsg(`Chose ${chosenMove}`)
  }

  function handleSolveAll() {
    setSolvedIds(collectDecisionIds(rootData!))
  }

  return (
    <BeatShell
      primary={{
        label: isLast ? 'Finish' : 'Continue',
        enabled: true,
        onClick: onAdvance,
      }}
      secondary={
        allSolved
          ? undefined
          : { label: 'Solve from the end', onClick: handleSolveAll }
      }
    >
      <div className="gt-tree">
        <p aria-live="polite" aria-atomic="true" className="gt-tree__live">
          {displayMsg}
        </p>

        {allSolved && (
          <div className="gt-tree__spe-badge">
            {'SPE payoff: '}
            <span className="gt-tree__spe-value">{spePayoff}</span>
          </div>
        )}

        <div className="gt-tree__canvas">
          <TreeNodeView
            node={rootData}
            path={[]}
            solvedIds={solvedIds}
            allSolved={allSolved}
            onSpePath={true}
            players={players}
            onFold={handleFold}
          />
        </div>
      </div>
    </BeatShell>
  )
}
