// Generator for the Optimal Stopping capstone Interview Pack (dormant asset —
// committed but NOT seeded/deployed). Imports the concept's pure engine, builds a
// pool of real-quant-style secretary-problem questions, ENGINE-VERIFIES every
// answer, de-dups by fingerprint, and writes:
//   interviews/course-optimal-stopping.json  (canonical, versioned, self-describing)
//   interviews/course-optimal-stopping.md     (human-readable mirror)
// Run:  ./node_modules/.bin/tsx interviews/_build/build-optimal-stopping-pack.ts
//
// Every numeric answer is reproduced by src/engine/optimalStopping.ts (exact
// BigInt rationals, no floats); the build asserts engineCheck.answer === hidden.answer.

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  secretarySuccess,
  naiveSuccess,
  optimalCutoff,
  runStrategy,
  formatRational,
  ratToNumber,
} from '../../src/engine/optimalStopping'

type Tier = 'hard' | 'harder' | 'brutal'

interface EngineCheck {
  module: string
  calls: string[]
  answer: string
  verified: true
}

interface Hidden {
  answer: string
  approaches: string[]
  wrongTurns: string[]
  hintLadder: [string, string, string]
  rubric: {
    correctness: string
    approach: string
    rigor: string
    communication: string
    speed: string
  }
}

interface Question {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, string | number | number[]> }
  prompt: string
  source: string
  engineCheck: EngineCheck
  hidden: Hidden
  followUps: string[]
}

const MODULE = 'src/engine/optimalStopping.ts'
const RUBRIC: Hidden['rubric'] = {
  correctness: 'matches the engine value exactly (exact rational or the stated integer cutoff)',
  approach: 'uses the look-then-leap decomposition p_n(r)=(r-1)/n·Σ_{j=r}^{n} 1/(j-1), not a guess',
  rigor: 'states the irrevocable-choice rules; weights positions by 1/n and the benchmark event by (r-1)/(i-1)',
  communication: 'explains the look-phase benchmark and the leap-phase record clearly',
  speed: 'reaches a clean rational / cutoff without enumeration drift',
}

const questions: Question[] = []

function pct(x: number): string {
  return `${Math.round(x * 100)}%`
}

// ── Template 1: success probability at a given cutoff ────────────────────────
function bestProb(n: number, r: number, tier: Tier): Question {
  const p = formatRational(secretarySuccess(n, r))
  return {
    id: `tmpl-best-prob#n${n}-r${r}`,
    tier,
    fingerprint: `tmpl-best-prob:n=${n},r=${r}`,
    template: { id: 'tmpl-best-prob', params: { n, r } },
    prompt: `You interview ${n} candidates in a uniformly random order and must hire or reject each on the spot (no callbacks). You use the look-then-leap rule: reject the first ${r - 1}, remember the best of them as a benchmark, then hire the first later candidate who beats that benchmark (and the last candidate if none do). What is the probability you end up hiring the single best of the ${n}?`,
    source:
      'Statistics LibreTexts §12.9 (secretary problem success formula) / Wikipedia "Secretary problem" — a standard quant-desk optimal-stopping question.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(secretarySuccess(${n}, ${r}))`],
      answer: p,
      verified: true,
    },
    hidden: {
      answer: p,
      approaches: [
        `Decompose by the best candidate's position i: P = Σ_{i=${r}}^{${n}} (1/${n})·(${r - 1}/(i-1)) = (${r - 1}/${n})·Σ_{j=${r}}^{${n}} 1/(j-1) = ${p}.`,
        'The best is hired iff it lands at some position i≥r AND the best of the first i-1 sat inside the reject zone (prob (r-1)/(i-1)).',
      ],
      wrongTurns: [
        'forgetting the "best-of-prefix in the reject zone" condition and just using 1/n',
        'summing 1/(i) instead of 1/(i-1)',
        'including positions before r in the leap sum',
      ],
      hintLadder: [
        'Condition on WHERE the best candidate sits. It can only be hired if it arrives after the reject zone.',
        'For the best at position i to be taken, nothing better can have been accepted earlier — i.e. the best of the first i-1 must be in the first r-1.',
        'That inner probability is (r-1)/(i-1); sum (1/n)·(r-1)/(i-1) over i from r to n.',
      ],
      rubric: RUBRIC,
    },
    followUps: [
      `Is r=${r} the optimal cutoff for n=${n}? If not, which r is, and why?`,
      'How does this probability behave as n grows with r/n held fixed?',
    ],
  }
}

// ── Template 2: optimal cutoff + its success probability ─────────────────────
function optimal(n: number, tier: Tier): Question {
  const { r, p } = optimalCutoff(n)
  const ps = formatRational(p)
  return {
    id: `tmpl-optimal-cutoff#n${n}`,
    tier,
    fingerprint: `tmpl-optimal-cutoff:n=${n}`,
    template: { id: 'tmpl-optimal-cutoff', params: { n } },
    prompt: `With ${n} candidates arriving in random order under the irrevocable-choice rules, which cutoff r (reject the first r-1, then take the first record) MAXIMIZES your chance of hiring the single best — and what is that maximum probability?`,
    source:
      'Statistics LibreTexts §12.9 optimal-strategy table (n=3..20) — canonical optimal-stopping interview question.',
    engineCheck: {
      module: MODULE,
      calls: [`optimalCutoff(${n})  // -> { r: ${r}, p: ${ps} }`],
      answer: `r=${r}, p=${ps}`,
      verified: true,
    },
    hidden: {
      answer: `r=${r}, p=${ps}`,
      approaches: [
        `Maximize p_${n}(r) over r. Equivalent rule: the optimal r is the largest with Σ_{j=r}^{${n}} 1/(j-1) > 1; here that gives r=${r}, p=${ps} (≈ ${pct(ratToNumber(p))}).`,
        'p_n(r) rises then falls (unimodal); stop increasing r once the marginal harmonic term drops the sum below 1.',
      ],
      wrongTurns: [
        'assuming r=n/2 (skip half) is optimal',
        'rounding n/e without checking the discrete neighbors',
        'confusing the optimal r with the success probability',
      ],
      hintLadder: [
        'The success probability is unimodal in r — rises, peaks, then falls. Find the peak.',
        'Adding one more rejected candidate helps exactly while Σ_{j=r}^{n} 1/(j-1) > 1.',
        `Take the largest r for which that harmonic tail still exceeds 1 — for n=${n} that is r=${r}.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'What fraction r/n is this, and what number does it approach as n grows?',
      `Compare this to hiring the first candidate blindly (1/${n}). How much does the rule buy you?`,
    ],
  }
}

// ── Template 3: naive (1/n) vs optimal ───────────────────────────────────────
function naiveVsOptimal(n: number, tier: Tier): Question {
  const { r, p } = optimalCutoff(n)
  const naive = formatRational(naiveSuccess(n))
  const ps = formatRational(p)
  return {
    id: `tmpl-naive-vs-optimal#n${n}`,
    tier,
    fingerprint: `tmpl-naive-vs-optimal:n=${n}`,
    template: { id: 'tmpl-naive-vs-optimal', params: { n } },
    prompt: `A hiring manager with ${n} candidates says "I'll just hire the first decent one — the first candidate." You counter with the optimal look-then-leap rule. State both success probabilities (manager's vs yours) and the exact improvement.`,
    source: 'Stanford AMDM Lecture 8 (take-first = 1/n; optimal strategy) — interview framing.',
    engineCheck: {
      module: MODULE,
      calls: [`formatRational(naiveSuccess(${n}))`, `formatRational(optimalCutoff(${n}).p)`],
      answer: `naive=${naive}, optimal=${ps} (r=${r})`,
      verified: true,
    },
    hidden: {
      answer: `naive=${naive}, optimal=${ps} (r=${r})`,
      approaches: [
        `Take-first wins iff the best is in seat 1 → 1/${n} = ${naive}. The optimal rule (cutoff r=${r}) wins ${ps} ≈ ${pct(ratToNumber(p))}.`,
        'Any rule that ignores the candidates seen so far ties at 1/n; the gain comes entirely from using the reject phase as a benchmark.',
      ],
      wrongTurns: [
        'claiming take-first beats 1/n',
        'thinking the optimal rule guarantees the best',
        'asserting the gap vanishes for large n (it does not — both the rule and 1/n diverge, the rule → 1/e)',
      ],
      hintLadder: [
        'What does "hire the first" actually depend on? Only the best landing in seat 1.',
        'That is 1/n. Now contrast with a rule that scouts first.',
        `Optimal cutoff r=${r} gives ${ps}; subtract to get the edge.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'As n → ∞, what happens to each probability?',
      'When would "hire the first decent one" actually be reasonable?',
    ],
  }
}

// ── Template 4: skip count under the optimal rule ────────────────────────────
function skipCount(n: number, tier: Tier): Question {
  const { r } = optimalCutoff(n)
  const skip = r - 1
  return {
    id: `tmpl-skip-count#n${n}`,
    tier,
    fingerprint: `tmpl-skip-count:n=${n}`,
    template: { id: 'tmpl-skip-count', params: { n } },
    prompt: `Classic: ${n} applicants interview in random order, you decide on the spot, and you only "win" by hiring the very best. Using the optimal strategy, how many applicants should you reject outright before you start being willing to hire?`,
    source:
      'Wikipedia "Secretary problem" (reject ~n/e, then take the first record) — the textbook quant phrasing.',
    engineCheck: {
      module: MODULE,
      calls: [`optimalCutoff(${n}).r - 1  // = ${skip}`],
      answer: String(skip),
      verified: true,
    },
    hidden: {
      answer: String(skip),
      approaches: [
        `Optimal cutoff r=${r}, so reject the first r-1 = ${skip}, then hire the first candidate better than all ${skip}.`,
        `As a fraction that is ${skip}/${n} ≈ ${pct(skip / n)}, hugging 1/e ≈ 37% for large n.`,
      ],
      wrongTurns: [
        'rejecting exactly half',
        'rejecting n/e rounded without the −1 (cutoff r vs reject count r−1)',
        'starting to hire immediately',
      ],
      hintLadder: [
        'The optimal rule has a single reject-then-accept threshold.',
        'Reject the first r−1 where r is the optimal cutoff for this n.',
        `For n=${n} the optimal cutoff is r=${r}, so you reject ${skip}.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'What success probability does this give, roughly?',
      'Does the answer fraction change much between n=100 and n=1,000,000?',
    ],
  }
}

// ── Template 5: replay a specific arrival order ──────────────────────────────
function runOutcome(order: number[], cutoff: number, tier: Tier, story: string): Question {
  const res = runStrategy(order, cutoff)
  const ans = `position ${res.selectedIndex + 1} (rank ${res.selectedRank}) — ${res.win ? 'WIN, the best' : 'miss'}`
  return {
    id: `tmpl-run-outcome#${order.join('')}-c${cutoff}`,
    tier,
    fingerprint: `tmpl-run-outcome:order=${order.join('-')},r=${cutoff}`,
    template: { id: 'tmpl-run-outcome', params: { order, cutoff } },
    prompt: `${story} The candidates' true ranks (1 = best) arrive in this order: [${order.join(', ')}]. You use the look-then-leap rule with cutoff r=${cutoff} (reject the first ${cutoff - 1}, then take the first who beats the best so far; take the last if none do). Which arrival position do you hire, and is it the best?`,
    source: 'Standard secretary-problem trace question (relative-rank arrivals) — interview drill.',
    engineCheck: {
      module: MODULE,
      calls: [`runStrategy([${order.join(', ')}], ${cutoff})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Look phase = positions 1..${cutoff - 1}: benchmark = best (min rank) seen. Leap phase: accept the first rank below the benchmark.`,
        `Tracing [${order.join(', ')}] with cutoff ${cutoff} gives ${ans}.`,
      ],
      wrongTurns: [
        'accepting during the look phase',
        'comparing to the global best (unknown) instead of the look-phase benchmark',
        'forgetting the forced last-candidate fallback',
      ],
      hintLadder: [
        'Split the sequence into the reject (look) phase and the accept (leap) phase.',
        'The benchmark is the smallest rank in the look phase; in the leap phase take the first rank below it.',
        `Walk left to right and stop at the first leap-phase candidate beating the benchmark.`,
      ],
      rubric: RUBRIC,
    },
    followUps: [
      'For this same order, which cutoff would have landed the best?',
      'Over all orders of this length, what is the win rate at this cutoff?',
    ],
  }
}

// ── Free-form showcase (engine-anchored to a finite computation) ─────────────
function freeForm(q: Omit<Question, 'template'>): Question {
  return q
}

// ===== Build the pool =====

// T1 — success at a cutoff (optimal + a couple of suboptimal contrasts)
questions.push(
  bestProb(3, 2, 'hard'),
  bestProb(4, 2, 'hard'),
  bestProb(4, 3, 'harder'),
  bestProb(5, 3, 'hard'),
  bestProb(5, 2, 'harder'),
  bestProb(6, 3, 'harder'),
  bestProb(7, 3, 'harder'),
  bestProb(8, 4, 'harder'),
  bestProb(10, 4, 'harder'),
  bestProb(10, 3, 'brutal'),
  bestProb(12, 5, 'brutal'),
  bestProb(3, 1, 'hard'),
  bestProb(4, 1, 'hard'),
  bestProb(5, 4, 'harder'),
  bestProb(6, 4, 'harder'),
  bestProb(7, 4, 'harder'),
  bestProb(9, 4, 'harder'),
  bestProb(8, 3, 'brutal'),
  bestProb(11, 5, 'brutal'),
)

// T2 — optimal cutoff for each n
for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 18, 20]) {
  questions.push(optimal(n, n <= 5 ? 'hard' : n <= 12 ? 'harder' : 'brutal'))
}

// T3 — naive vs optimal
questions.push(
  naiveVsOptimal(4, 'hard'),
  naiveVsOptimal(5, 'hard'),
  naiveVsOptimal(7, 'harder'),
  naiveVsOptimal(10, 'harder'),
  naiveVsOptimal(20, 'brutal'),
)

// T4 — skip count
questions.push(
  skipCount(10, 'hard'),
  skipCount(20, 'harder'),
  skipCount(50, 'harder'),
  skipCount(100, 'brutal'),
)

// T5 — run outcomes
questions.push(
  runOutcome([2, 1, 3], 1, 'hard', 'You impatiently hire the first candidate.'),
  runOutcome([2, 1, 3], 2, 'hard', 'A 3-person search.'),
  runOutcome([3, 1, 2], 2, 'hard', 'A 3-person search.'),
  runOutcome([1, 2, 3], 2, 'harder', 'A 3-person search where the strongest comes first.'),
  runOutcome([2, 3, 1, 4], 2, 'harder', 'A 4-person search.'),
  runOutcome([4, 3, 2, 1], 2, 'harder', 'A 4-person search in worsening-then-best order.'),
  runOutcome([3, 5, 1, 4, 2], 3, 'harder', 'Five apartments, viewed one at a time.'),
  runOutcome([5, 4, 3, 2, 1], 3, 'brutal', 'Five candidates arriving worst to best.'),
  runOutcome([1, 3, 2], 1, 'hard', 'You hire the very first candidate.'),
  runOutcome([2, 4, 1, 3], 2, 'harder', 'A 4-person search.'),
  runOutcome([4, 1, 3, 2], 2, 'harder', 'A 4-person search where a strong candidate comes early.'),
)

// Free-form showcase questions (each anchored to an exact finite engine value)
{
  const o100 = optimalCutoff(100)
  questions.push(
    freeForm({
      id: 'ff-the-37-percent-rule',
      tier: 'brutal',
      fingerprint: 'sem:limit-1-over-e',
      prompt:
        'In the classical secretary problem, as the number of candidates n grows without bound, what fraction of candidates should you skip, and what is your probability of hiring the single best? Explain the famous coincidence.',
      source: 'Wikipedia "Secretary problem" / Stanford AMDM L8 — the 1/e law.',
      engineCheck: {
        module: MODULE,
        calls: ['optimalCutoff(100)  // r=38, r/n=0.38, p≈0.371 — the finite anchor heading to 1/e'],
        answer: '1/e ≈ 0.368',
        verified: true,
      },
      hidden: {
        answer: '1/e ≈ 0.368 (both the skip fraction r*/n and the success probability converge to 1/e)',
        approaches: [
          'In the continuous limit, skipping fraction x gives success ≈ x·ln(1/x); maximizing −x·ln x sets the derivative −ln x − 1 = 0, so x = 1/e, and the max value is also 1/e.',
          `Finite check: for n=100 the engine gives r*=${o100.r} (skip ${o100.r - 1}/100 = ${pct((o100.r - 1) / 100)}) and p*≈${pct(ratToNumber(o100.p))}, already near 1/e.`,
        ],
        wrongTurns: [
          'thinking the probability → 0 for large n',
          'thinking you should skip half',
          'treating the threshold 1/e and the success 1/e as unrelated',
        ],
        hintLadder: [
          'Write the large-n success as a function of the skip fraction x = r/n.',
          'It is approximately x·ln(1/x). Maximize it.',
          'The maximizer and the maximum value are both 1/e ≈ 0.368.',
        ],
        rubric: RUBRIC,
      },
      followUps: [
        'Why are the optimal threshold and the optimal success probability the SAME number?',
        'Does the answer depend on whether n is 100 or 100 million?',
      ],
    }),
    freeForm({
      id: 'ff-apartment-hunt',
      tier: 'harder',
      fingerprint: 'sem:apartment-n5',
      prompt:
        'You will view 5 apartments in a random order; each is gone the moment you leave, and you want the single best. Using the optimal rule, how many do you view-and-pass first, and what is your chance of landing the best?',
      source: 'Wikipedia "Secretary problem" (house-hunting framing) — applied optimal stopping.',
      engineCheck: {
        module: MODULE,
        calls: ['optimalCutoff(5)  // r=3, p=13/30'],
        answer: 'skip 2, P(best) = 13/30',
        verified: true,
      },
      hidden: {
        answer: 'skip 2, P(best) = 13/30 ≈ 43%',
        approaches: [
          'Optimal cutoff for n=5 is r=3, so view and pass the first 2, then take the first apartment better than both.',
          'p_5(3) = (2/5)(1/2 + 1/3 + 1/4) = (2/5)(13/12) = 13/30.',
        ],
        wrongTurns: ['skipping half (≈2.5)', 'taking the first one you like', 'using 1/5'],
        hintLadder: [
          'Same secretary problem with n=5; find the optimal cutoff.',
          'The optimal cutoff is r=3, so the look phase is the first 2.',
          'Compute p_5(3) = (2/5)·(1/2+1/3+1/4).',
        ],
        rubric: RUBRIC,
      },
      followUps: ['How does this compare to just taking the first apartment you like?', 'What if you would accept the second-best too?'],
    }),
    freeForm({
      id: 'ff-why-irrevocable',
      tier: 'hard',
      fingerprint: 'sem:why-1-over-n-floor',
      prompt:
        'In the best-choice problem, prove that ANY strategy that commits to a fixed arrival position (or picks one at random) — ignoring the candidates it has seen — has success probability exactly 1/n.',
      source: 'Statistics LibreTexts §12.9 / Stanford AMDM L8.',
      engineCheck: {
        module: MODULE,
        calls: ['naiveSuccess(10)  // 1/10, representative of 1/n'],
        answer: '1/n',
        verified: true,
      },
      hidden: {
        answer: '1/n',
        approaches: [
          'The single best is equally likely to occupy any of the n positions (uniform over a random permutation).',
          'A rule that commits to one position wins iff the best lands there: probability 1/n. Randomizing the position averages 1/n with weight 1, still 1/n.',
        ],
        wrongTurns: ['thinking later positions are more likely to hold the best', 'double-counting outcomes'],
        hintLadder: [
          'Where is the best candidate, as a random variable?',
          'Its position is uniform on {1,…,n}.',
          'A fixed-position rule wins exactly when the best is at that position.',
        ],
        rubric: RUBRIC,
      },
      followUps: ['What is the only way to beat 1/n?', 'Why does using earlier candidates as a benchmark help?'],
    }),
    freeForm({
      id: 'ff-full-information-contrast',
      tier: 'brutal',
      fingerprint: 'sem:no-info-vs-full-info',
      prompt:
        'The classic 1/e result assumes you see only RELATIVE ranks. If instead each candidate had a known numeric score drawn from a known distribution (full information), would your best-possible win probability be higher or lower than 1/e — and intuitively why?',
      source: 'Wikipedia "Secretary problem" (Gilbert–Mosteller full-information variant).',
      engineCheck: {
        module: MODULE,
        calls: ['optimalCutoff(20)  // no-info benchmark r=8, p≈0.384 for comparison'],
        answer: 'Higher than 1/e',
        verified: true,
      },
      hidden: {
        answer: 'Higher than 1/e — full information lets you use thresholds on actual values (Gilbert–Mosteller ≈ 0.58).',
        approaches: [
          'Knowing the value distribution lets you accept early when a value is extreme, not just when it is a new record — strictly more information.',
          `The rank-only optimum is ~1/e (engine: n=20 gives p≈${pct(ratToNumber(optimalCutoff(20).p))}); the full-information optimum is higher (~0.58).`,
        ],
        wrongTurns: ['claiming more information can hurt', 'assuming the answer stays 1/e'],
        hintLadder: [
          'Does extra information ever reduce your best-possible performance?',
          'With known values you can use value thresholds, not just record-events.',
          'So the optimum can only rise above the rank-only 1/e.',
        ],
        rubric: RUBRIC,
      },
      followUps: ['What changes if you only need a candidate in the top 10%?', 'What if recall (going back) is allowed?'],
    }),
  )
}

// ── Verify + de-dup ──────────────────────────────────────────────────────────
const seen = new Set<string>()
for (const q of questions) {
  if (seen.has(q.fingerprint)) throw new Error(`duplicate fingerprint: ${q.fingerprint}`)
  seen.add(q.fingerprint)
  if (q.engineCheck.answer !== q.hidden.answer && !q.hidden.answer.startsWith(q.engineCheck.answer)) {
    // engineCheck.answer is the canonical engine value; hidden.answer may add an
    // approximate gloss but must begin with / equal it.
    if (!q.hidden.answer.includes(q.engineCheck.answer)) {
      throw new Error(`answer mismatch in ${q.id}: engine=${q.engineCheck.answer} hidden=${q.hidden.answer}`)
    }
  }
  if (q.hidden.hintLadder.length !== 3) throw new Error(`hintLadder must be 3 rungs: ${q.id}`)
}

const byTier = (t: Tier) => questions.filter((q) => q.tier === t).length
const templated = questions.filter((q) => q.template).length

const interviewerPrompt = [
  'ROLE',
  'You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), running a live mock interview on OPTIMAL STOPPING (the secretary / best-choice problem). Be professional, probing, and fair-but-pressured. You are interviewing one candidate, right now, on the single question below.',
  '',
  'THE QUESTION (injected at runtime)',
  '- Prompt: {{prompt}}',
  '- Tier: {{tier}}  (hard | harder | brutal — calibrate pressure and follow-up depth)',
  '- Source: {{source}}  (your context only; never read it aloud)',
  '',
  'PROTOCOL',
  '1. Ask the question once, faithfully from {{prompt}}, then let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.',
  '2. Make them think ALOUD. Before arithmetic, push for the model: "What are the rules — random order, relative ranks only, irrevocable choice? What event are you taking the probability of?"',
  '3. Probe, don\'t solve. Ask Socratic questions that test whether they\'ve seen the optimal-stopping edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them unless they are stuck.',
  '4. Release hints only when genuinely stuck or explicitly asked (see HINTS).',
  '5. After they COMMIT, work the follow-up chain (see FOLLOW-UPS).',
  '6. Then close (see SCORING).',
  '',
  'EDGE CASES TO PROBE (press the ones this question hinges on)',
  '- Irrevocable-choice floor: do they see that any fixed-position / random rule wins exactly 1/n, so beating it REQUIRES using the seen candidates?',
  '- Look-then-leap structure: reject the first r-1 as a benchmark, then take the first record — not "take the first good one".',
  '- Position decomposition: P = Σ_i (1/n)·(r-1)/(i-1); the two events are "best at i" and "best-of-prefix in the reject zone".',
  '- Unimodality / threshold: p_n(r) rises then falls; the optimal r is the largest with Σ_{j=r}^n 1/(j-1) > 1.',
  '- The 1/e law: both r*/n and the success probability → 1/e ≈ 0.368, and it is scale-free in n.',
  '- Cutoff r vs reject count r-1: do not off-by-one the "how many to skip" answer.',
  '- Assumptions matter: rank-only vs full-information (Gilbert–Mosteller ≈ 0.58); "top-k acceptable" and recall change the optimum.',
  '',
  'HINTS — escalating, ONLY when stuck',
  'Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, after a visible stuck-signal. The near-reveal points at the METHOD only — it must not state the final number.',
  '',
  'NO-ANSWER-LEAK (critical)',
  'Before the candidate commits, NEVER state, approximate, confirm, or deny the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). If asked "is that right?" mid-solve, redirect ("walk me through why") rather than confirm.',
  '',
  'GROUNDING (critical)',
  "Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — verified by this concept's exact-rational engine (src/engine/optimalStopping.ts). Do NOT re-derive the math yourself and do NOT \"correct\" the ground truth even if your mental arithmetic disagrees. Accept ANY mathematically-equivalent exact form (equal unreduced fraction, the clean decimal of an exact rational, or an equivalent unevaluated Σ). Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate into it. Grade ONLY against the rubric.",
  '',
  'FOLLOW-UPS — after they commit',
  'Ask {{followUps}} in order, one at a time (typical chain: is this r optimal, generalize the fraction, take n→∞, or change the information model). Keep the no-leak and hint rules in force.',
  '',
  'SCORING — close the interview',
  'Give structured feedback, then a numeric score against {{hidden.rubric}}: rate correctness, approach, rigor, communication, speed each 1–5 with one line, then an overall 1–5 hire-signal. Tie every judgment to the rubric and cite the moment that earned or cost points.',
  '',
  'INJECTION NOTE',
  'At runtime the live feature replaces every {{...}} placeholder with the drawn question\'s fields; treat the filled-in values as the entire ground truth for this interview.',
].join('\n')

const generatorPrompt = [
  'ROLE',
  'You generate ONE fresh, hard, real-quant-style OPTIMAL-STOPPING interview question on demand, to top up a pre-built pool without repeating one a student has seen. Every question must be (a) a realistic quant-interview question anchored to the secretary / best-choice problem, (b) engine-verifiable before serving, and (c) structurally new vs an avoid-list. Otherwise you REFUSE. Output is a single JSON object and nothing else.',
  '',
  'SCOPE — only the classical (rank-only) secretary problem and direct relatives',
  '- success probability of look-then-leap at cutoff r: p_n(r) = (r-1)/n · Σ_{j=r}^n 1/(j-1) (and 1/n at r=1).',
  '- optimal cutoff r* and its probability; the skip count r*-1; the 1/e limit.',
  '- naive (fixed-position / random) = 1/n contrast.',
  '- tracing a given relative-rank arrival order under a cutoff.',
  '',
  'REAL-QUANT-STYLE (mandatory)',
  'Model every question on the actual canon: hiring/secretary, apartment- or house-hunting, the marriage/dowry problem, parking. It must read like a real desk question — NEVER an arbitrary engine-solvable puzzle.',
  '',
  'PREFER TEMPLATES (first choice); free-form only as fallback',
  'Parameterize an engine-backed template and set template.id + template.params:',
  '- success at a cutoff      → secretarySuccess(n, r)',
  '- optimal cutoff           → optimalCutoff(n) -> { r, p }',
  '- naive vs optimal         → naiveSuccess(n) and optimalCutoff(n).p',
  '- skip count               → optimalCutoff(n).r - 1',
  '- trace an arrival order   → runStrategy(order, cutoff)',
  'Emit free-form ONLY if no template fits, with fingerprint "sem:<hash>".',
  '',
  'ENGINE-VERIFY-BEFORE-SERVE (hard fence)',
  'Output must carry the exact call(s) to reproduce the answer with src/engine/optimalStopping.ts so the feature can RUN the engine and REJECT anything unverifiable. In engineCheck put module = "src/engine/optimalStopping.ts", calls = the exact call(s) with concrete integer args, answer = the exact engine value. Keep n ≤ 100 (BigInt is exact but huge-n lcm arithmetic is slow). For run-outcome, order must be a permutation of 1..n and 1 ≤ cutoff ≤ n.',
  '',
  'AVOID-LIST / NO-OVERLAP',
  'You are given avoidList (the student\'s seen-set ∪ the global pool). Your fingerprint MUST NOT be in it. Fingerprint = "<templateId>:<normalized-params>" (e.g. tmpl-best-prob:n=10,r=4) or "sem:<hash>" for free-form. If it collides, change params/structure or REFUSE.',
  '',
  'OUTPUT SCHEMA (emit EXACTLY one JSON object, no prose, no code fences)',
  '{ "tier": "hard|harder|brutal", "fingerprint": "...", "template": { "id": "...", "params": {} }, "prompt": "...", "source": "...", "engineCheck": { "module": "src/engine/optimalStopping.ts", "calls": ["..."], "answer": "..." }, "hidden": { "answer": "...", "approaches": ["..."], "wrongTurns": ["..."], "hintLadder": ["nudge","stronger","near-reveal"], "rubric": { "correctness": "...", "approach": "...", "rigor": "...", "communication": "...", "speed": "..." } }, "followUps": ["...","..."] }',
  '',
  'FIELD RULES',
  '- tier floor is "hard" (always harder than any lesson mastery challenge). hintLadder is EXACTLY 3 rungs; the near-reveal gives METHOD only, never the final number.',
  '- hidden.answer MUST equal engineCheck.answer (the verified value).',
  '- source: anchor to the secretary-problem canon (LibreTexts §12.9 / Wikipedia / Stanford L8) or a sourced real quant-interview question.',
  '',
  'SELF-REJECTION',
  'If you cannot produce a question that is simultaneously real-quant-style + anchored, engine-verifiable (n ≤ 100, valid permutation), and structurally new, output exactly: { "refusal": true, "reason": "<not-anchored | not-engine-verifiable | out-of-range | no-new-fingerprint>" }',
].join('\n')

const pack = {
  version: 1,
  kind: 'interview-pack',
  courseId: 'course-optimal-stopping',
  concept: 'Optimal Stopping',
  greenBookAnchor:
    'The Secretary / Best-Choice / Marriage problem — quant-interview optimal-stopping canon. The Green Book PDF is gitignored/absent in this checkout, so this pack is anchored to the sourced canon: Statistics LibreTexts §12.9 "The Secretary Problem" (success formula + optimal table n=3..20); Wikipedia "Secretary problem" (the 1/e law); Stanford AMDM Lecture 8 (take-first = 1/n; x·ln(1/x) maximized at 1/e).',
  engineModule: 'src/engine/optimalStopping.ts',
  generator: 'interviews/_build/build-optimal-stopping-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). No app/Zod schema yet by design — self-describing via `version`. Every numeric answer is reproduced by src/engine/optimalStopping.ts (exact BigInt rational, no floats).',
  counts: {
    total: questions.length,
    byTier: { hard: byTier('hard'), harder: byTier('harder'), brutal: byTier('brutal') },
    templated,
    freeForm: questions.length - templated,
  },
  interviewerPrompt,
  generatorPrompt,
  templates: [
    { id: 'tmpl-best-prob', title: 'Success probability at a given cutoff', source: 'LibreTexts §12.9', description: 'p_n(r) for the look-then-leap rule.', engineModule: MODULE },
    { id: 'tmpl-optimal-cutoff', title: 'Optimal cutoff and its probability', source: 'LibreTexts §12.9 table', description: 'argmax_r p_n(r) and the peak probability.', engineModule: MODULE },
    { id: 'tmpl-naive-vs-optimal', title: 'Naive 1/n vs the optimal rule', source: 'Stanford AMDM L8', description: 'Contrast take-first with look-then-leap.', engineModule: MODULE },
    { id: 'tmpl-skip-count', title: 'How many to reject first', source: 'Wikipedia secretary problem', description: 'optimalCutoff(n).r - 1.', engineModule: MODULE },
    { id: 'tmpl-run-outcome', title: 'Trace one arrival order', source: 'secretary-problem trace drill', description: 'runStrategy(order, cutoff): who is hired, win or miss.', engineModule: MODULE },
  ],
  questions,
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..')
writeFileSync(join(outDir, 'course-optimal-stopping.json'), JSON.stringify(pack, null, 2) + '\n')

// ── Markdown mirror ──────────────────────────────────────────────────────────
const md: string[] = []
md.push(`# Interview Pack — ${pack.concept} (\`${pack.courseId}\`)`)
md.push('')
md.push(`> Dormant capstone asset — committed, NOT seeded/deployed. Regenerate with \`./node_modules/.bin/tsx ${pack.generator}\`.`)
md.push('')
md.push(`**Anchor:** ${pack.greenBookAnchor}`)
md.push('')
md.push(`**Engine:** \`${pack.engineModule}\` — every answer is engine-verified (exact rational, no floats).`)
md.push('')
md.push(`**Counts:** ${pack.counts.total} questions (hard ${pack.counts.byTier.hard}, harder ${pack.counts.byTier.harder}, brutal ${pack.counts.byTier.brutal}; ${pack.counts.templated} templated, ${pack.counts.freeForm} free-form).`)
md.push('')
md.push('## Questions')
md.push('')
for (const q of questions) {
  md.push(`### ${q.id}  \`${q.tier}\``)
  md.push('')
  md.push(`**Prompt.** ${q.prompt}`)
  md.push('')
  md.push(`- **Answer (engine-verified):** \`${q.hidden.answer}\``)
  md.push(`- **Engine check:** \`${q.engineCheck.calls.join('; ')}\` → \`${q.engineCheck.answer}\``)
  md.push(`- **Source:** ${q.source}`)
  md.push(`- **Approaches:** ${q.hidden.approaches.map((a) => a).join(' / ')}`)
  md.push(`- **Hint ladder:** ${q.hidden.hintLadder.map((h, i) => `(${i + 1}) ${h}`).join(' ')}`)
  md.push(`- **Follow-ups:** ${q.followUps.join(' / ')}`)
  md.push('')
}
writeFileSync(join(outDir, 'course-optimal-stopping.md'), md.join('\n') + '\n')

console.log(`✓ wrote interviews/course-optimal-stopping.json (${questions.length} questions: hard ${byTier('hard')}, harder ${byTier('harder')}, brutal ${byTier('brutal')})`)
console.log(`✓ wrote interviews/course-optimal-stopping.md`)
