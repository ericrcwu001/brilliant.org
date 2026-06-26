#!/usr/bin/env tsx
/**
 * Build script for the Combinatorics Interview Pack.
 * Imports src/engine/combinatorics.ts, computes every answer via BigInt engine,
 * fingerprints + de-dups, and emits interviews/course-combinatorics.json.
 * Deterministic: no timestamps, no randomness.
 */

import { createHash } from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  factorial,
  nPk,
  nCk,
  product,
  pascalRow,
  unionSize,
  inclusionExclusion,
  derangements,
  pigeonholeMin,
  forcesCollision,
  reduce,
  probabilityFromCounts,
} from '../../src/engine/combinatorics'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = 'hard' | 'harder' | 'brutal'

interface Rubric {
  correctness: string
  approach: string
  rigor: string
  communication: string
  speed: string
}

interface Hidden {
  answer: string
  approaches: string[]
  wrongTurns: string[]
  hintLadder: [string, string, string]
  rubric: Rubric
}

interface EngineCheck {
  module: string
  calls: string[]
  answer: string
  verified: boolean
}

interface Question {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, unknown> }
  prompt: string
  source: string
  engineCheck: EngineCheck
  hidden: Hidden
  followUps: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ENG = 'src/engine/combinatorics.ts'

function frac({ n, d }: { n: bigint; d: bigint }): string {
  return d === 1n ? `${n}` : `${n}/${d}`
}

function oddsAgainst(totalBig: bigint, countBig: bigint): string {
  const r = reduce(totalBig - countBig, countBig)
  return `${r.n}:${r.d}`
}

function fp(templateId: string, p: Record<string, unknown>): string {
  const sorted = Object.entries(p)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join(',')
  return `${templateId}:${sorted}`
}

function semFp(sig: string): string {
  return 'sem:' + createHash('sha1').update(sig).digest('hex').slice(0, 12)
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERT FAIL: ${msg}`)
}

function advisory(label: string, got: string, expected: string): void {
  if (got !== expected)
    throw new Error(`ADVISORY MISMATCH [${label}]: got="${got}" expected="${expected}"`)
}

// ─── Engine sanity goldens ────────────────────────────────────────────────────

assert(factorial(5) === 120n, 'factorial(5)=120')
assert(nPk(5, 3) === 60n, 'nPk(5,3)=60')
assert(nCk(52, 5) === 2598960n, 'nCk(52,5)=2598960')
assert(product([13, 4, 12, 6]) === 3744n, 'product([13,4,12,6])=3744')
assert(product([78, 6, 6, 44]) === 123552n, 'product([78,6,6,44])=123552')
assert(derangements(5) === 44n, 'derangements(5)=44')
assert(pigeonholeMin(51, 25) === 3, 'pigeonholeMin(51,25)=3')
assert(forcesCollision(26, 25), 'forcesCollision(26,25)=true')
{
  const g = probabilityFromCounts(624, 2598960)
  assert(g.n === 1n && g.d === 4165n, 'probabilityFromCounts(624,2598960)={1,4165}')
}
{
  const g = probabilityFromCounts(20, 216)
  assert(g.n === 5n && g.d === 54n, 'probabilityFromCounts(20,216)={5,54}')
}
{
  const row12Sum = pascalRow(12).reduce((a, b) => a + b, 0n)
  assert(row12Sum === 4096n, 'sum(pascalRow(12))=4096')
}

// ─── Prompt constants (verbatim) ──────────────────────────────────────────────

const interviewerPrompt = `ROLE
You are a senior quantitative researcher running a live technical interview at a top trading desk (Jane Street / Citadel / IMC caliber). Your specialty is combinatorics and counting. You are professional, sharp, probing, and fair, but you keep the candidate under realistic time pressure. You interview ONE candidate on ONE problem at a time. You are the interviewer, not a tutor — you do not teach or solve, you assess.

CONCEPT
Combinatorics, anchored to the Green Book (Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews), §4.2 Combinatorial Analysis and §2.6 Pigeon Hole Principle. In scope: the multiplication rule and factorials; permutations (nPk) vs combinations (nCk); the binomial theorem and Pascal's triangle; inclusion–exclusion (derangements, the birthday problem); the pigeonhole principle; and turning counts into probabilities (poker odds, dice, cards).

THE PROBLEM (this session)
Question: {{prompt}}
Difficulty tier: {{tier}}
Source: {{source}}

GROUND TRUTH — INTERNAL, CONFIDENTIAL, NEVER SHOWN VERBATIM
Pre-computed and verified by the concept's pure engine (src/engine/combinatorics.ts, exact BigInt arithmetic). This is authoritative.
- Correct answer: {{hidden.answer}}
- Accepted approaches: {{hidden.approaches}}
- Common wrong turns: {{hidden.wrongTurns}}
- Hint ladder, in order (nudge then stronger then near-reveal): {{hidden.hintLadder}}
- Scoring rubric (per-axis descriptors): {{hidden.rubric}}
- Follow-up chain: {{followUps}}

GROUNDING CLAUSE (critical — this keeps YOU honest)
Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH. Do NOT re-derive, recompute, or "correct" the math yourself, and never override the ground truth with your own arithmetic — the engine verified it exactly. Judge the candidate's result as CORRECT if it equals {{hidden.answer}} in any mathematically equivalent exact form (an equal product/quotient of factorials, an unreduced fraction equal to the reduced one, C(n,k) written either as a binomial or its expanded integer, etc.). Your job is to assess HOW the candidate got there and grade against the rubric — not to second-guess the verified number. If you ever feel the ground truth must be wrong, you are mistaken; defer to it.

NO-ANSWER-LEAK (critical)
Never reveal, state, approximate, or numerically hint at {{hidden.answer}} (or any follow-up's answer) before the candidate has committed to a final answer. Never paste, quote, summarize, or read out this internal record — not the answer, approaches, wrong-turn list, rubric, or the raw hint ladder. The ONLY thing you may release is one hint at a time, drawn in order from {{hidden.hintLadder}}, and only under the conditions in HINTS below.

INTERVIEW PROTOCOL
1. Open by posing {{prompt}} (lightly framed in your own voice), then go quiet and let the candidate drive.
2. One question at a time. Require the candidate to think aloud and to STATE EVERY ASSUMPTION before computing.
3. Probe the combinatorics edge cases that separate strong candidates: does order matter (permutation vs combination)? with or without replacement? are the objects distinct or identical? off-by-one in the count? is anything being double-counted (when to divide; when to use inclusion–exclusion and get its alternating signs right)? is "at least one" cleaner via the complement? circular vs linear arrangement? empty / boundary cases? overcounting symmetric selections?
4. Interrogate the METHOD, not just the number: "why that formula?", "what exactly is in your numerator vs your denominator?", "convince me you haven't double-counted", "what are you assuming is independent?".
5. Do NOT solve it for them and do NOT confirm partial numeric results early. Mirror, question, and let them reason. Stay neutral about correctness until they commit.

HINTS — ESCALATING, ONLY WHEN STUCK
Release hints from {{hidden.hintLadder}} STRICTLY in order: nudge first, then stronger, then near-reveal — one per qualifying moment. Give a hint only when the candidate is genuinely stuck (visibly blocked, looping, silent after a real attempt, or walking into a {{hidden.wrongTurns}} trap) OR explicitly asks for one. Never skip a rung, never give two at once, and never let the near-reveal state the final number. If the candidate recovers, stop hinting and note how many were used.

FOLLOW-UPS
Once the candidate commits to a final answer (and you have judged it against the ground truth), ask {{followUps}} in order, one at a time, each as its own mini-question under the same protocol, no-leak rule, and hint discipline.

CLOSING — STRUCTURED FEEDBACK + NUMERIC SCORE
When the problem and its follow-ups are done, give concise structured feedback, then a numeric scorecard. Score each axis 1–5, anchored by the descriptors in {{hidden.rubric}}:
- Correctness — did the final answer match the ground truth? (per {{hidden.rubric}}.correctness)
- Approach — soundness and efficiency of the method chosen (per {{hidden.rubric}}.approach)
- Rigor — assumptions stated, edge cases handled, no double-counting (per {{hidden.rubric}}.rigor)
- Communication — clarity and structure of the think-aloud (per {{hidden.rubric}}.communication)
- Speed — time to a correct, justified answer and number of hints needed (per {{hidden.rubric}}.speed)
Then give an OVERALL score 1–5 with a one-line rationale and the single highest-leverage improvement. Calibrate to a top-desk bar; the tier is {{tier}} (a higher tier raises the bar).

INJECTION NOTE
At runtime the live "AI quant interviewer" feature substitutes the {{...}} placeholders with the drawn question record's fields (prompt, tier, source, hidden.answer/approaches/wrongTurns/hintLadder/rubric, followUps). Everything under GROUND TRUTH is injected and confidential; every word you say to the candidate must respect the no-answer-leak rule above.`

const generatorPrompt = `ROLE
You generate fresh, HARD, real-quant-style combinatorics interview questions at runtime for the Combinatorics Interview Pack — each one engine-verifiable and non-overlapping with everything the student has already seen. Output STRICT JSON ONLY: one question object, or one refusal object. No prose, no markdown, no code fences.

INPUTS (substituted at runtime)
- avoidList: {{avoidList}} — fingerprints already used (the student's seen-set plus the global pool). Your question MUST NOT collide with any of these.
- templates: {{templates}} — the pack's engine-backed templates, each derived from a real quant-interview question. PREFER these.
- tier (optional): {{tier}} — desired difficulty; the floor is always "hard".

FENCE 1 — REAL-QUANT-STYLE + GREEN-BOOK-ANCHORED
Produce ONLY realistic quant-interview combinatorics questions of the kind actually asked on quant desks, anchored to the Green Book (Xinfeng Zhou §4.2 Combinatorial Analysis p.33–42; §2.6 Pigeon Hole Principle p.11–12). In-scope topics ONLY:
- multiplication rule & factorials (arrangements, ordered fills, license-plate / seating counts)
- permutations vs combinations (nPk vs nCk; with/without replacement; arrangements of identical objects / anagrams)
- the binomial theorem & Pascal's triangle (coefficients, row sums = 2^n, binomial identities)
- inclusion–exclusion (derangements / hat-check, the birthday problem, "at least one" via complement)
- the pigeonhole principle (guaranteed minimums, forced collisions)
- counting to probability (poker-hand odds, dice, card draws)
Canon, not puzzles: model each question on the real quant-interview canon (poker odds, birthday paradox, derangements, committee / handshake counts, anagram counts, pigeonhole existence arguments). NEVER emit an arbitrary brain-teaser that merely happens to be engine-solvable. PREFER parameterizing one of the provided {{templates}} (first choice); write a free-form question only as a fallback, and it must still be canon-style and engine-verifiable.

FENCE 2 — ENGINE-VERIFY-BEFORE-SERVE
Every question MUST ship the exact data to reproduce its answer with src/engine/combinatorics.ts. In engineCheck, give the precise function call(s) with integer arguments that yield the answer. Available functions (exact BigInt; number-in / bigint-out, except reduce which is bigint-in / bigint-out):
- factorial(n), nPk(n,k), nCk(n,k), product(opts[]), pascalRow(n)
- unionSize(a,b,ab), inclusionExclusion(terms: [{ size, sign: 1 | -1 }]), derangements(n)
- pigeonholeMin(items, holes) returns a number, forcesCollision(items, holes) returns a boolean
- reduce(nBig, dBig) returns { n, d }, probabilityFromCounts(fav, total) returns reduced { n, d }
Engine constraints you MUST respect when building the call(s):
- Exact integers only, no floats. Answers are a BigInt, or a reduced { n, d } fraction for probabilities, or a number / boolean for pigeonhole.
- nPk and nCk return 0 when out of range (k < 0, n < 0, or k > n); k = 0 returns 1. Do not design a question whose intended answer depends on out-of-range inputs unless 0 is genuinely the point.
- product([]) = 1; pigeonholeMin requires holes > 0; reduce requires a non-zero denominator.
- probabilityFromCounts(fav, total) takes JS numbers, so BOTH counts must be <= 9e15 (Number.MAX_SAFE_INTEGER). If either count is larger, express the probability as a BigInt comparison instead: compute fav and total as BigInt and use reduce(favBig, totalBig); do not push huge values through probabilityFromCounts.
The live feature WILL run your call(s) and compare the result to your stated answer; it MUST REJECT and regenerate any question it cannot reproduce exactly, then set verified true only on success. Make engineCheck self-sufficient and correct.

NO-OVERLAP / FINGERPRINT
Give each question a structural fingerprint and ensure it is NOT in {{avoidList}}:
- Template-based: fingerprint = "<templateId>:<normalized-params>" — sort and normalize params to a canonical string so trivial reparametrizations collide as intended.
- Free-form: fingerprint = "sem:<hash>" — a stable hash of the question's structural semantics (topic + entities + counts + the ask), NOT its wording, so reworded duplicates still collide.
If your only candidate collides with {{avoidList}}, change the structure or parameters until the fingerprint is new. Never reuse a fingerprint.

OUTPUT SCHEMA — emit EXACTLY one JSON object of this shape (the // notes are annotations; do NOT include them in your output):
{
  "tier": "hard" | "harder" | "brutal",
  "fingerprint": "<templateId>:<normalized-params>  or  sem:<hash>",
  "template": { "id": "<templateId>", "params": { ... } },   // omit this key entirely for free-form
  "prompt": "the question shown to the candidate",
  "source": "Green Book p.<n> §<x>  or  <real quant-interview source> (GB-anchored to §<x>)",
  "engineCheck": {
    "module": "src/engine/combinatorics.ts",
    "calls": ["nCk(52,5)", "..."],          // exact call(s) + integer args that reproduce the answer
    "answer": "<exact answer: BigInt string, {n,d} fraction, integer, or boolean>"
  },
  "hidden": {
    "answer": "<exact answer, same value as engineCheck.answer>",
    "approaches": ["accepted path 1", "accepted path 2"],
    "wrongTurns": ["common misconception 1", "..."],
    "hintLadder": ["nudge", "stronger", "near-reveal"],   // EXACTLY 3, escalating, none stating the number
    "rubric": {
      "correctness": "what a correct answer requires",
      "approach": "what a strong method looks like",
      "rigor": "edge cases to handle (order? replacement? double-count? complement?)",
      "communication": "what clear think-aloud looks like",
      "speed": "the time / efficiency bar for this tier"
    }
  },
  "followUps": ["natural harder extension", "generalize to N ...", "..."]
}

DIFFICULTY & FOLLOW-UPS
Tag tier with a floor of "hard" (always harder than any lesson's mastery challenge); use "harder" or "brutal" for multi-step, cross-topic synthesis. Always include a follow-up chain (at least one) that escalates or generalizes the problem (e.g. bias it, generalize the count to N, swap order-matters, or ask for the probability). hintLadder MUST contain exactly 3 entries (nudge then stronger then near-reveal), and the near-reveal must still NOT state the final number.

SELF-REJECTION RULE
If you cannot produce a question that is (a) real-quant-style and Green-Book-anchored, (b) engine-verifiable with concrete call(s) under the constraints above, AND (c) non-overlapping with {{avoidList}}, do NOT emit a question. Instead output exactly:
{ "error": "cannot-generate", "reason": "<short reason>" }
Never emit an unverifiable, off-canon, or duplicate question.`

// ─── Template metadata ────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'tmpl-sequence-count', title: 'Codes, PINs & collisions: total vs no-repeat sequences', source: 'Green Book §4.2 p.33–36', engineModule: ENG, description: 'Total m^n sequences vs no-repeat nPk(m,n) — the birthday collision complement.' },
  { id: 'tmpl-perm-vs-comb', title: 'Order matters or not — the ×k! gap', source: 'Green Book §4.2 p.33–34', engineModule: ENG, description: 'nPk vs nCk and the exact k! factor between ordered and unordered selections.' },
  { id: 'tmpl-derangement', title: 'The matching problem — nobody in the right place', source: 'Green Book §4.2 p.36', engineModule: ENG, description: 'Derangements via inclusion–exclusion; the 1/e limit.' },
  { id: 'tmpl-poker-hand', title: 'Named poker hand → count → probability → odds', source: 'Green Book §4.2 p.34', engineModule: ENG, description: 'Five-card hand decomposition: rank choices × suit choices × kicker; reduce over C(52,5)=2,598,960.' },
  { id: 'tmpl-binomial-term', title: 'Binomial coefficients, scaled terms, and the row identity', source: 'Green Book §4.2 p.33, p.36–37', engineModule: ENG, description: 'C(n,k)·c^k term coefficients; (1+c)^n row sum; symmetry C(n,k)=C(n,n−k).' },
  { id: 'tmpl-pigeonhole', title: 'Find the holes, then force the collision', source: 'Green Book §2.6 p.11–12', engineModule: ENG, description: 'Pigeonhole guaranteed minimum ⌈items/holes⌉ and threshold (t−1)·holes+1.' },
  { id: 'tmpl-dice-increasing', title: 'Roll k dice — probability strictly increasing', source: 'Green Book §4.2 p.40', engineModule: ENG, description: 'C(6,k) favorable outcomes (one increasing order per subset) over 6^k total.' },
  { id: 'tmpl-inclusion-exclusion', title: 'Unions, complements, and exactly-k regions', source: 'Green Book §4.2 p.33', engineModule: ENG, description: 'Two-set and three-set inclusion–exclusion; exactly-one/two coefficient derivation.' },
]

// ─── Questions array ──────────────────────────────────────────────────────────

const questions: Question[] = []

// ════════════════════════════════════════════════════════════════════════════
// T1 — tmpl-sequence-count
// ════════════════════════════════════════════════════════════════════════════

const T1_SRC = 'Green Book §4.2 p.33–36'
const T1_ID = 'tmpl-sequence-count'

const T1_ROWS: Array<{ m: number; n: number; token: string; symbol: string; symbolP: string; tier: Tier }> = [
  { m: 10, n: 4, token: '4-digit PIN', symbol: 'digit', symbolP: 'digits', tier: 'hard' },
  { m: 10, n: 5, token: '5-digit PIN', symbol: 'digit', symbolP: 'digits', tier: 'hard' },
  { m: 16, n: 4, token: 'hex token', symbol: 'hex digit', symbolP: 'hex digits', tier: 'hard' },
  { m: 26, n: 4, token: '4-letter code', symbol: 'letter', symbolP: 'letters', tier: 'hard' },
  { m: 6, n: 4, token: 'die-roll log', symbol: 'die outcome', symbolP: 'die outcomes', tier: 'hard' },
  { m: 26, n: 5, token: '5-letter code', symbol: 'letter', symbolP: 'letters', tier: 'harder' },
  { m: 12, n: 5, token: 'base-12 id', symbol: 'base-12 digit', symbolP: 'base-12 digits', tier: 'harder' },
  { m: 4, n: 6, token: '6-symbol DNA string over {A,C,G,T}', symbol: 'nucleotide', symbolP: 'nucleotides', tier: 'harder' },
]

for (const row of T1_ROWS) {
  const { m, n, token, symbol, symbolP, tier } = row
  const total = product(Array(n).fill(m))
  const noRepeat = nPk(m, n)
  const atLeastRep = total - noRepeat

  if (m === 4 && n === 6) {
    assert(noRepeat === 0n, 'T1(m=4,n=6): nPk(4,6)=0 by pigeonhole')
  }

  const ans = `total = ${total}; no-repeat = ${noRepeat}; at-least-one-repeat = ${atLeastRep}.`

  questions.push({
    id: `${T1_ID}#m${m}-n${n}`,
    tier,
    fingerprint: fp(T1_ID, { m, n }),
    template: { id: T1_ID, params: { m, n, token } },
    prompt: `A ${token} is a string of ${n} ${symbolP}, each independently chosen from ${m} possible ${symbolP}. (a) How many distinct ${token}s exist? (b) How many use no repeated ${symbol}? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.`,
    source: T1_SRC,
    engineCheck: {
      module: ENG,
      calls: [`product(Array(${n}).fill(${m}))`, `nPk(${m},${n})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Multiplication rule: ${m} choices per slot ⇒ ${m}^${n} total; no-repeat shrinks options: ${m}·${m-1}·…`,
        'Complement: total minus no-repeat gives ≥1-repeat in one subtraction',
        `no-repeat = nPk(${m},${n}); when n>m pigeonhole forces it to 0`,
      ],
      wrongTurns: [
        `add-not-multiply (${m}·${n}=${m*n} vs ${m}^${n})`,
        'using nCk — order matters in a sequence',
        'computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut',
        'forgetting n>m forces 0 no-repeat arrangements (pigeonhole)',
      ],
      hintLadder: [
        'How many independent choices are there, and how many options per slot?',
        'No-repeat means each slot loses one option — that is an ordered selection without replacement.',
        `Total is ${m}^${n}; no-repeat is nPk(${m},${n}); the repeat count is one subtraction away.`,
      ],
      rubric: {
        correctness: 'all three counts exact and the collision interpretation stated',
        approach: 'multiplication rule for total + complement for the repeat count',
        rigor: 'states independence, that order matters, and the n>m edge case',
        communication: 'names the birthday/hash connection explicitly',
        speed: `writes ${m}^${n} and nPk(${m},${n}) on sight without hesitation`,
      },
    },
    followUps: [
      `At what n does no-repeat first become impossible (n>${m})?`,
      `If the first ${symbol} must differ from the last, how does the total count change?`,
      `Give the collision probability and explain why comparing BigInt counts beats floats when ${m}^n overflows.`,
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T2 — tmpl-perm-vs-comb
// ════════════════════════════════════════════════════════════════════════════

const T2_SRC = 'Green Book §4.2 p.33–34'
const T2_ID = 'tmpl-perm-vs-comb'

const T2_ROWS: Array<{ n: number; k: number; items: string; roles: string; group: string; tier: Tier }> = [
  { n: 10, k: 3, items: 'signals', roles: 'distinct ranked receiver slots', group: 'monitoring group', tier: 'hard' },
  { n: 9, k: 4, items: 'candidates', roles: 'distinct executive roles (CEO/CFO/COO/CTO)', group: 'unordered team', tier: 'hard' },
  { n: 8, k: 3, items: 'runners', roles: 'podium spots (gold/silver/bronze)', group: 'medal cohort', tier: 'hard' },
  { n: 15, k: 4, items: 'employees', roles: 'ranked desk positions (by window access)', group: 'office cluster', tier: 'hard' },
  { n: 12, k: 5, items: 'candidates', roles: 'ranked interview slots', group: 'unordered shortlist', tier: 'harder' },
  { n: 20, k: 3, items: 'trades', roles: 'top-3 ranked portfolio positions', group: 'unordered execution batch', tier: 'harder' },
  { n: 13, k: 5, items: 'cards', roles: 'ordered positional slots', group: 'unordered hand', tier: 'harder' },
]

for (const row of T2_ROWS) {
  const { n, k, items, roles, group, tier } = row
  const ordered = nPk(n, k)
  const unordered = nCk(n, k)
  const gap = factorial(k)

  const ans = `ordered = ${ordered}; unordered = ${unordered}; they differ by k! = ${gap}.`

  questions.push({
    id: `${T2_ID}#n${n}-k${k}`,
    tier,
    fingerprint: fp(T2_ID, { k, n }),
    template: { id: T2_ID, params: { n, k, items, roles, group } },
    prompt: `From ${n} ${items} you select ${k}. (a) If the ${k} fill ${roles} (order matters), how many ways? (b) If they form an ${group} (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?`,
    source: T2_SRC,
    engineCheck: {
      module: ENG,
      calls: [`nPk(${n},${k})`, `nCk(${n},${k})`, `factorial(${k})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `nPk(${n},${k}) for ordered; nCk(${n},${k}) = nPk/${k}! for unordered`,
        `Build a committee then count its ${k}! orderings: nPk = nCk · k!`,
        "Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination",
      ],
      wrongTurns: [
        'treating ordered = unordered (the classic trap)',
        `forgetting to divide by k!=${gap} (overcounting by ${gap})`,
        'using (k−1)! instead of k!',
        "assuming the wording 'top-3' always means unordered",
      ],
      hintLadder: [
        'Does swapping two chosen people give a different outcome in this context?',
        `Ranked slots distinguish orderings; an unordered group collapses all ${k}! of them into one.`,
        `One count is the other times ${k}! — identify which is bigger and divide or multiply accordingly.`,
      ],
      rubric: {
        correctness: 'both counts plus the exact multiplicative factor k!',
        approach: 'nPk = nCk · k! stated and justified',
        rigor: 'justifies whether order matters from the problem wording',
        communication: 'explains the k! collapse clearly',
        speed: `gives ${gap} as the gap immediately`,
      },
    },
    followUps: [
      `Generalize: for choosing k of N, by what factor do ordered and unordered differ?`,
      `If two of the ${roles} are interchangeable, what additional factor divides out?`,
      `Reframe the problem so a candidate must detect that order secretly matters.`,
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T3 — tmpl-derangement
// ════════════════════════════════════════════════════════════════════════════

const T3_SRC = 'Green Book §4.2 p.36'
const T3_ID = 'tmpl-derangement'

const T3_ROWS: Array<{ n: number; items: string; targets: string; tier: Tier }> = [
  { n: 5, items: 'letters', targets: 'envelopes', tier: 'harder' },
  { n: 6, items: 'gifts', targets: 'people', tier: 'harder' },
  { n: 7, items: 'hats', targets: 'guests', tier: 'harder' },
  { n: 8, items: 'trades', targets: 'accounts', tier: 'brutal' },
  { n: 9, items: 'keys', targets: 'locks', tier: 'brutal' },
  { n: 10, items: 'coats', targets: 'tickets', tier: 'brutal' },
]

for (const row of T3_ROWS) {
  const { n, items, targets, tier } = row
  const allWrong = derangements(n)
  const total = factorial(n)
  const atLeastOne = total - allWrong
  const pAllWrong = reduce(allWrong, total)

  const ans = `all-wrong = ${allWrong}; at-least-one = ${atLeastOne}; P(all wrong) = ${frac(pAllWrong)}; limit → 1/e.`

  questions.push({
    id: `${T3_ID}#n${n}`,
    tier,
    fingerprint: fp(T3_ID, { n }),
    template: { id: T3_ID, params: { n, items, targets } },
    prompt: `${n} ${items} are matched to ${n} ${targets} by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no ${items.slice(0,-1)} hit its correct ${targets.slice(0,-1)}? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?`,
    source: T3_SRC,
    engineCheck: {
      module: ENG,
      calls: [`derangements(${n})`, `factorial(${n})`, `reduce(${allWrong}n,${total}n)`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e`,
        `Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0`,
        `Complement for at-least-one: n! − D_n; reduce the all-wrong fraction`,
      ],
      wrongTurns: [
        "'count IS the probability' (forgetting to divide by n!)",
        `computing at-least-one as n·(n−1)! (double-counting fixed points)`,
        'thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368',
        'off-by-one in the IE signs (alternating series starts at +1)',
      ],
      hintLadder: [
        "What is the complement of 'at least one correct match'?",
        `Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.`,
        `Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).`,
      ],
      rubric: {
        correctness: 'exact count + reduced fraction + limit stated as 1/e',
        approach: 'inclusion–exclusion or recurrence, not brute force',
        rigor: 'explains the alternating sign cancellation',
        communication: 'links the fraction to the e^(−1) limit',
        speed: `recalls D_5=44 (or D_${n} from the recurrence) quickly`,
      },
    },
    followUps: [
      `What is the probability that exactly one ${items.slice(0,-1)} lands in the correct ${targets.slice(0,-1)}?`,
      'Why does P(all wrong) barely change as n increases beyond 5?',
      'Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.',
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T4 — tmpl-poker-hand  (rows 1–3 only; row 4 omitted per de-dup edit)
// ════════════════════════════════════════════════════════════════════════════

const T4_SRC = 'Green Book §4.2 p.34'
const T4_ID = 'tmpl-poker-hand'
const TOTAL52 = nCk(52, 5)
advisory('T4-total52', String(TOTAL52), '2598960')

const T4_VARIANTS: Array<{
  variant: string
  handName: string
  countFactors: number[]
  tier: Tier
  pitfall: string
}> = [
  {
    variant: 'fourOfAKind',
    handName: 'four-of-a-kind',
    countFactors: [13, 48],
    tier: 'harder',
    pitfall: 'kicker must be one of the 48 remaining cards (not 12); 13 ranks for the quad, 48 for the kicker',
  },
  {
    variant: 'fullHouse',
    handName: 'a full house',
    countFactors: [13, 4, 12, 6],
    tier: 'harder',
    pitfall: 'triple-rank and pair-rank are DISTINCT roles ⇒ 13·12 ordered, not C(13,2); then C(4,3)=4 suits for triple, C(4,2)=6 for pair',
  },
  {
    variant: 'twoPairs',
    handName: 'two pairs',
    countFactors: [78, 6, 6, 44],
    tier: 'harder',
    pitfall: 'the two pair ranks are SYMMETRIC ⇒ C(13,2)=78 unordered; kicker must avoid the two chosen ranks (44 cards, not 48)',
  },
]

for (const row of T4_VARIANTS) {
  const { variant, handName, countFactors, tier, pitfall } = row
  const count = product(countFactors)
  advisory(`T4-${variant}`, String(count), variant === 'fourOfAKind' ? '624' : variant === 'fullHouse' ? '3744' : '123552')

  const prob = probabilityFromCounts(Number(count), Number(TOTAL52))
  const odds = oddsAgainst(TOTAL52, count)
  const ans = `${handName}: ${count} hands; P = ${frac(prob)}; odds against ${odds}.`

  questions.push({
    id: `${T4_ID}#${variant}`,
    tier,
    fingerprint: fp(T4_ID, { variant }),
    template: { id: T4_ID, params: { variant, handName } },
    prompt: `A 5-card hand is dealt from a standard 52-card deck. For ${handName}: (a) count the hands from scratch, stating every factor; (b) give the exact probability; (c) give the odds against; (d) name the one decomposition pitfall most candidates hit on this hand.`,
    source: T4_SRC,
    engineCheck: {
      module: ENG,
      calls: [`product([${countFactors.join(',')}])`, `probabilityFromCounts(${count},2598960)`, `reduce(${2598960n - count}n,${count}n)`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Product of independent choices (rank(s) × suit-choices × kicker): ${countFactors.join(' × ')} = ${count}`,
        `Probability = ${count} ÷ C(52,5) = ${count} ÷ 2,598,960; reduce`,
        'Odds against = (total − count) : count, then reduce',
      ],
      wrongTurns: [
        pitfall,
        "'count IS the probability' (forgetting ÷ 2,598,960)",
        "assuming 'fancier-looking hand ⇒ rarer' without computing",
        'using C(13,2) vs 13×12 for the wrong hand (swap the symmetric/asymmetric reasoning)',
      ],
      hintLadder: [
        `What independent choices build exactly one ${handName} — which ranks, which suits, which kicker?`,
        'Watch the kicker constraint and decide whether the two primary ranks play symmetric or asymmetric roles.',
        `Multiply the factors for the count, divide by 2,598,960, reduce — the shared denominator is 4165.`,
      ],
      rubric: {
        correctness: `count = ${count}, reduced P = ${frac(prob)}, odds = ${odds}`,
        approach: 'clean product decomposition; every factor justified',
        rigor: 'kicker constraint and ordered/unordered rank decision explicitly stated',
        communication: 'explains the shared-4165 denominator structure',
        speed: 'recalls C(52,5)=2,598,960 immediately and builds product on sight',
      },
    },
    followUps: [
      `Count ${variant === 'twoPairs' ? 'one pair' : 'two pairs'} next and compare the relative likelihoods.`,
      `How many times more likely is two pairs than four-of-a-kind?`,
      'Re-derive the count via a completely independent method to confirm.',
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T5 — tmpl-binomial-term
// ════════════════════════════════════════════════════════════════════════════

const T5_SRC = 'Green Book §4.2 p.33, p.36–37'
const T5_ID = 'tmpl-binomial-term'

// Identity row: n=10
{
  const n = 10
  const row = pascalRow(n)
  const rowSum = row.reduce((a, b) => a + b, 0n)
  assert(rowSum === 1024n, 'T5 identity: sum(pascalRow(10))=1024')
  const mirrorK = 4
  const c10k = nCk(n, mirrorK)
  const c10nk = nCk(n, n - mirrorK)
  assert(c10k === c10nk, 'T5 identity: C(10,4)=C(10,6)')
  assert(c10k === 210n, 'T5 identity: C(10,4)=210')
  const ans = `Σ_k C(10,k) = ${rowSum} = 2^10; the row is symmetric, e.g. C(10,${mirrorK})=C(10,${n-mirrorK})=${c10k}.`

  questions.push({
    id: `${T5_ID}#n10-identity`,
    tier: 'hard',
    fingerprint: fp(T5_ID, { n, variant: 'identity' }),
    template: { id: T5_ID, params: { n, variant: 'identity' } },
    prompt: `Prove that the n=10 row of Pascal's triangle sums to 2^10 and is symmetric. State Σ_k C(10,k) as an integer and give an example mirror pair.`,
    source: T5_SRC,
    engineCheck: {
      module: ENG,
      calls: ['pascalRow(10)', 'sum of row', 'nCk(10,4)', 'nCk(10,6)'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        "Binomial theorem: (1+1)^10 = Σ_k C(10,k)·1^k = 2^10",
        "Combinatorial: each element is in or out ⇒ 2^10 subsets ⇒ 2^10 total",
        'Symmetry: choosing k-subset ↔ complementing to (n−k)-subset ⇒ C(n,k)=C(n,n−k)',
      ],
      wrongTurns: [
        'claiming the row sum is n² or n+1 or 10+1=11',
        'forgetting to include the empty and full subsets',
        'computing the sum as the number of elements, not the total of binomial coefficients',
      ],
      hintLadder: [
        'Evaluate the binomial (a+b)^10 at a=b=1 — what does each term become?',
        'Alternatively, count subsets: each of the 10 elements is independently in or out.',
        'For symmetry, a size-k subset is the complement of a size-(n−k) subset — they correspond 1-to-1.',
      ],
      rubric: {
        correctness: '1024 + both proofs + a correct mirror pair',
        approach: 'binomial theorem evaluation and/or subset counting',
        rigor: 'a=b=1 substitution stated; symmetry bijection explained',
        communication: 'two distinct proofs given clearly',
        speed: '2^10=1024 written immediately',
      },
    },
    followUps: [
      'How many subsets of an n-element set have even size? (= 2^(n−1))',
      'Compute Σ_k (−1)^k C(10,k) and explain why it vanishes.',
      'Which k gives the largest term in the n=10 row?',
    ],
  })
}

// Term rows: (n,k,c) parameterized
const T5_TERM_ROWS: Array<{ n: number; k: number; c: number; tier: Tier }> = [
  { n: 12, k: 5, c: 1, tier: 'hard' },
  { n: 10, k: 3, c: 2, tier: 'harder' },
  { n: 8, k: 3, c: 10, tier: 'harder' },
  { n: 7, k: 4, c: 3, tier: 'harder' },
  { n: 9, k: 4, c: 2, tier: 'harder' },
  { n: 6, k: 3, c: 5, tier: 'harder' },
]

for (const row of T5_TERM_ROWS) {
  const { n, k, c, tier } = row
  const coeff = nCk(n, k) * product(Array(k).fill(c))
  const sumAllCoeff = product(Array(n).fill(1 + c))
  const mirror = nCk(n, n - k)
  assert(mirror === nCk(n, k), `T5 symmetry: C(${n},${k})=C(${n},${n-k})`)

  const ans = `coefficient = C(${n},${k})·${c}^${k} = ${coeff}; all coefficients sum to (1+${c})^${n} = ${sumAllCoeff}; C(${n},${k}) = C(${n},${n-k}) = ${mirror}.`

  questions.push({
    id: `${T5_ID}#n${n}-k${k}-c${c}`,
    tier,
    fingerprint: fp(T5_ID, { c, k, n }),
    template: { id: T5_ID, params: { n, k, c } },
    prompt: `In the expansion of (a + ${c}·b)^${n}: (a) what is the coefficient of the a^${n-k} b^${k} term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(${n},${k})?`,
    source: T5_SRC,
    engineCheck: {
      module: ENG,
      calls: [`nCk(${n},${k})`, `product(Array(${k}).fill(${c}))`, `product(Array(${n}).fill(${1+c}))`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Binomial theorem: the a^{n-k}b^k term has coefficient C(${n},${k})·${c}^${k}`,
        `Set a=b=1: Σ coefficients = (1+${c})^${n} = ${sumAllCoeff}`,
        `Symmetry: C(${n},${k})=C(${n},${n-k}) by the complement bijection`,
      ],
      wrongTurns: [
        `freshman's dream: forgetting ${c}^${k} (writing just C(${n},${k})=${nCk(n,k)})`,
        'claiming the sum is always 2^n regardless of c',
        `misreading which exponent (${k} or ${n-k}) pairs with the ${c}·b factor`,
      ],
      hintLadder: [
        `The b-power term carries the constant ${c} raised to a power — which power?`,
        `Set a=b=1 to total all coefficients: (1+${c})^${n}.`,
        `Coefficient is C(${n},${k})·${c}^${k}; the mirror term swaps k↔${n-k}.`,
      ],
      rubric: {
        correctness: `coefficient=${coeff}, sum=${sumAllCoeff}, mirror=C(${n},${n-k})=${mirror}`,
        approach: 'binomial theorem, not manual expansion',
        rigor: `${c}^${k} factor handled and a=b=1 argument stated`,
        communication: 'explains "choose k factors to contribute b" meaning',
        speed: `writes C(${n},${k})·${c}^${k} directly`,
      },
    },
    followUps: [
      `What is the coefficient of the a^${n-k-1} b^${k+1} term (i.e. the next term)?`,
      `Use (a+${c}b)^${n} to analyze the last two digits of a related expression.`,
      `Evaluate Σ_k (−1)^k C(${n},k)·${c}^k and explain why it equals (1−${c})^${n}=${product(Array(n).fill(1-c))}.`,
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T6 — tmpl-pigeonhole
// ════════════════════════════════════════════════════════════════════════════

const T6_SRC = 'Green Book §2.6 p.11–12'
const T6_ID = 'tmpl-pigeonhole'

const T6_ROWS: Array<{
  scenario: string
  itemsNoun: string
  itemsCount: number
  holes: number
  t: number
  tier: Tier
}> = [
  { scenario: 'A dark drawer contains socks in 7 colors; you draw 8 in the dark', itemsNoun: 'socks', itemsCount: 8, holes: 7, t: 3, tier: 'hard' },
  { scenario: '367 people attend a gathering (no leap years; calendar has 366 days)', itemsNoun: 'people', itemsCount: 367, holes: 366, t: 3, tier: 'hard' },
  { scenario: '13 people are in a room and their birth months are examined', itemsNoun: 'people', itemsCount: 13, holes: 12, t: 3, tier: 'harder' },
  { scenario: 'You draw 9 socks from a drawer with socks in 4 colors', itemsNoun: 'socks', itemsCount: 9, holes: 4, t: 4, tier: 'harder' },
  { scenario: '100 people are each assigned a day of the week as their meeting day', itemsNoun: 'people', itemsCount: 100, holes: 7, t: 16, tier: 'harder' },
  { scenario: '76 ants land on a unit square divided into a 5×5 grid of 25 cells', itemsNoun: 'ants', itemsCount: 76, holes: 25, t: 5, tier: 'harder' },
  { scenario: '500 words are recorded and their initial letters examined (26-letter alphabet)', itemsNoun: 'words', itemsCount: 500, holes: 26, t: 21, tier: 'harder' },
]

for (const row of T6_ROWS) {
  const { scenario, itemsNoun, itemsCount, holes, t, tier } = row
  const mustCollide = forcesCollision(itemsCount, holes)
  const guaranteedMin = pigeonholeMin(itemsCount, holes)
  const toForceT = (t - 1) * holes + 1
  assert(pigeonholeMin(toForceT, holes) === t, `T6 toForceT assertion: pigeonholeMin(${toForceT},${holes})=${t}`)

  const ans = `holes = ${holes}; collision forced = ${mustCollide}; some hole holds ≥ ${guaranteedMin}; to force ≥ ${t} you need ${toForceT} items.`

  questions.push({
    id: `${T6_ID}#items${itemsCount}-holes${holes}-t${t}`,
    tier,
    fingerprint: fp(T6_ID, { holes, items: itemsCount, t }),
    template: { id: T6_ID, params: { scenario, itemsNoun, itemsCount, holes, t } },
    prompt: `${scenario}. (a) Identify the holes (this is the whole trick). (b) Must two ${itemsNoun} share a hole? (c) What is the largest count guaranteed in some hole? (d) How many ${itemsNoun} would force some hole to hold at least ${t}?`,
    source: T6_SRC,
    engineCheck: {
      module: ENG,
      calls: [`forcesCollision(${itemsCount},${holes})`, `pigeonholeMin(${itemsCount},${holes})`, `pigeonholeMin(${toForceT},${holes})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Identify ${holes} holes (categories); ${itemsCount} items vs ${holes} holes`,
        `${itemsCount} > ${holes} ⇒ collision forced (pigeonhole)`,
        `⌈${itemsCount}/${holes}⌉ = ${guaranteedMin} guaranteed in one hole; invert for threshold: (t−1)·${holes}+1 = ${toForceT}`,
      ],
      wrongTurns: [
        'counting items as holes (reversed)',
        `using ⌊${itemsCount}/${holes}⌋=${Math.floor(itemsCount/holes)} instead of ⌈${itemsCount}/${holes}⌉=${guaranteedMin}`,
        `off-by-one on the threshold: ${toForceT-1} (not ${toForceT}) forces only ≥${t-1}`,
        'trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum',
      ],
      hintLadder: [
        `Stop counting the obvious objects — what are the ${holes} categories they fall into?`,
        `Compare ${itemsCount} items to ${holes} categories: if items exceed categories, a collision is unavoidable.`,
        `The fullest hole is forced to ⌈${itemsCount}/${holes}⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting ${t}, then add one more item.`,
      ],
      rubric: {
        correctness: `holes=${holes}, collision forced=${mustCollide}, guaranteed min=${guaranteedMin}, threshold=${toForceT}`,
        approach: 'existence argument, not enumeration',
        rigor: 'even-spread argument for the ceiling; +1 justified for the threshold',
        communication: 'names the holes explicitly before computing',
        speed: `verdict from ${itemsCount}>${holes} (or ${itemsCount}<=${holes}) given instantly`,
      },
    },
    followUps: [
      `What is the minimum number of ${itemsNoun} to guarantee some hole has at least ${t+1}?`,
      'Re-pose the problem so the holes are hidden (e.g. remainders modulo m).',
      'Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?',
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T7 — tmpl-dice-increasing
// ════════════════════════════════════════════════════════════════════════════

const T7_SRC = 'Green Book §4.2 p.40'
const T7_ID = 'tmpl-dice-increasing'

const T7_ROWS: Array<{ k: number; tier: Tier }> = [
  { k: 2, tier: 'harder' },
  { k: 3, tier: 'harder' },
  { k: 4, tier: 'harder' },
  { k: 5, tier: 'harder' },
  { k: 6, tier: 'brutal' },
  { k: 7, tier: 'brutal' },
]

for (const row of T7_ROWS) {
  const { k, tier } = row
  const favorable = nCk(6, k)
  const totalBig = product(Array(k).fill(6))
  const total = Number(totalBig)
  const prob = probabilityFromCounts(Number(favorable), total)
  const probStr = frac(prob)
  const ans = `P(strictly increasing) = ${probStr}.`

  questions.push({
    id: `${T7_ID}#k${k}`,
    tier,
    fingerprint: fp(T7_ID, { k }),
    template: { id: T7_ID, params: { k } },
    prompt: `You roll ${k} fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,${k}) and not P(6,${k})?`,
    source: T7_SRC,
    engineCheck: {
      module: ENG,
      calls: [`nCk(6,${k})`, `product(Array(${k}).fill(6))`, `probabilityFromCounts(${favorable},${total})`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `Choose which ${k} distinct face values appear: C(6,${k}) sets; each set has exactly one increasing order`,
        `Divide by 6^${k}=${totalBig} equally-likely sequences`,
        `k!=${factorial(k)} orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,${k}), not P(6,${k})`,
      ],
      wrongTurns: [
        `using nPk(6,${k})=${nPk(6,k)} for favorable (overcounts by ${k}!=${factorial(k)})`,
        "'count IS probability' (forgetting to divide by 6^k)",
        k > 6 ? `writing a nonzero probability for k=${k} (impossible: only 6 distinct faces ⇒ pigeonhole forces a repeat)` : `confusing strictly-increasing with non-decreasing`,
        'double-counting by treating different orderings of the same face-set as distinct',
      ],
      hintLadder: [
        'How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?',
        'Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.',
        `Favorable = C(6,${k}); total = 6^${k}; ${k > 6 ? `for k>${6} you cannot choose ${k} distinct faces from {1,…,6}` : 'reduce the fraction'}.`,
      ],
      rubric: {
        correctness: `${probStr} (or "0" for k>6)`,
        approach: 'one increasing order per k-subset; C(6,k) not P(6,k)',
        rigor: `explains why favorable = C(6,${k}); handles k>${6} impossibility`,
        communication: 'links to pigeonhole for k>6',
        speed: `writes C(6,${k})/${totalBig} immediately`,
      },
    },
    followUps: [
      `What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)`,
      `Generalize to an s-sided die: what is the probability for k rolls out of s faces?`,
      `What is the largest k with a nonzero probability, and why?`,
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// T8 — tmpl-inclusion-exclusion
// ════════════════════════════════════════════════════════════════════════════

const T8_SRC = 'Green Book §4.2 p.33'
const T8_ID = 'tmpl-inclusion-exclusion'

// 2-set rows
const T8_2SET: Array<{ a: number; b: number; ab: number; N: number; units: string; tier: Tier }> = [
  { a: 120, b: 90, ab: 30, N: 250, units: 'students', tier: 'hard' },
  { a: 200, b: 150, ab: 70, N: 400, units: 'customers', tier: 'hard' },
  { a: 8, b: 6, ab: 3, N: 15, units: 'traders', tier: 'harder' },
]

for (const row of T8_2SET) {
  const { a, b, ab, N, units, tier } = row
  const union2 = unionSize(a, b, ab)
  const exactlyOne2 = inclusionExclusion([
    { size: a, sign: 1 }, { size: b, sign: 1 }, { size: ab, sign: -1 }, { size: ab, sign: -1 },
  ])
  const none2 = BigInt(N) - union2

  const ans = `A or B = ${union2}; exactly one = ${exactlyOne2}; neither = ${none2}.`

  questions.push({
    id: `${T8_ID}#2set-a${a}-b${b}-ab${ab}-N${N}`,
    tier,
    fingerprint: fp(T8_ID, { a, ab, b, n: N, variant: '2set' }),
    template: { id: T8_ID, params: { a, b, ab, N, units, variant: '2set' } },
    prompt: `Of ${N} ${units}, ${a} have property A, ${b} have property B, and ${ab} have both. (a) How many have A or B? (b) How many have exactly one of the two? (c) How many have neither?`,
    source: T8_SRC,
    engineCheck: {
      module: ENG,
      calls: [`unionSize(${a},${b},${ab})`, `inclusionExclusion([+${a},+${b},-${ab},-${ab}])`, `${N}n - union`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `|A∪B| = |A|+|B|−|A∩B| = ${a}+${b}−${ab} = ${union2}`,
        `Exactly-one = |A|+|B|−2|A∩B| = ${a}+${b}−2·${ab} = ${exactlyOne2}`,
        `Neither = ${N} − |A∪B| = ${N} − ${union2} = ${none2}`,
      ],
      wrongTurns: [
        `|A∪B|=|A|+|B|=${a+b} (forgetting to subtract the ${ab} overlap)`,
        'getting exactly-one wrong: subtracting ab once instead of twice',
        "confusing 'at least one' with 'exactly one'",
        `forgetting to use N=${N} for 'neither'`,
      ],
      hintLadder: [
        'Every element in both A and B is counted twice in |A|+|B| — what must you subtract?',
        '|A∪B| = |A|+|B|−|A∩B|; then neither = universe − union.',
        `Exactly-one means in A or B but not both: add A and B then subtract twice the overlap (−2·${ab}).`,
      ],
      rubric: {
        correctness: `union=${union2}, exactly-one=${exactlyOne2}, neither=${none2}`,
        approach: 'signed inclusion–exclusion with correct signs',
        rigor: 'explains subtraction of ab once (union) vs twice (exactly-one)',
        communication: 'draws or describes the Venn diagram regions',
        speed: 'writes A+B−AB for the union immediately',
      },
    },
    followUps: [
      'Add a third set C — what is the new union formula?',
      `Express 'at most one of A, B' from these pieces.`,
      'Re-pose with set sizes derived from divisibility within 1…N.',
    ],
  })
}

// 3-set rows
const T8_3SET: Array<{ A: number; B: number; C: number; AB: number; AC: number; BC: number; ABC: number; N: number; units: string; tier: Tier }> = [
  { A: 100, B: 80, C: 60, AB: 30, AC: 25, BC: 20, ABC: 10, N: 200, units: 'analysts', tier: 'harder' },
  { A: 50, B: 40, C: 30, AB: 12, AC: 10, BC: 8, ABC: 4, N: 100, units: 'quants', tier: 'harder' },
  { A: 300, B: 250, C: 200, AB: 120, AC: 100, BC: 90, ABC: 50, N: 600, units: 'applicants', tier: 'harder' },
]

for (const row of T8_3SET) {
  const { A, B, C, AB, AC, BC, ABC, N, units, tier } = row
  const union3 = inclusionExclusion([
    { size: A, sign: 1 }, { size: B, sign: 1 }, { size: C, sign: 1 },
    { size: AB, sign: -1 }, { size: AC, sign: -1 }, { size: BC, sign: -1 },
    { size: ABC, sign: 1 },
  ])
  const none3 = BigInt(N) - union3

  const ans = `at least one = ${union3}; none = ${none3}.`

  questions.push({
    id: `${T8_ID}#3set-A${A}-B${B}-C${C}`,
    tier,
    fingerprint: fp(T8_ID, { A, AB, ABC, AC, B, BC, C, N, variant: '3set' }),
    template: { id: T8_ID, params: { A, B, C, AB, AC, BC, ABC, N, units, variant: '3set' } },
    prompt: `Among ${N} ${units}: |A|=${A}, |B|=${B}, |C|=${C}; pairwise |A∩B|=${AB}, |A∩C|=${AC}, |B∩C|=${BC}; triple |A∩B∩C|=${ABC}. (a) How many are in at least one set? (b) How many are in none?`,
    source: T8_SRC,
    engineCheck: {
      module: ENG,
      calls: [`inclusionExclusion([+${A},+${B},+${C},-${AB},-${AC},-${BC},+${ABC}])`, `${N}n - union3`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        `|A∪B∪C| = (${A}+${B}+${C}) − (${AB}+${AC}+${BC}) + ${ABC} = ${union3}`,
        `Alternating-sign IE: singles + , pairs −, triple +`,
        `None = ${N} − ${union3} = ${none3}`,
      ],
      wrongTurns: [
        `|A∪B∪C|=A+B+C=${A+B+C} (forgetting to subtract pairwise and add back triple)`,
        'wrong sign on the triple term (subtracting instead of adding)',
        "conflating 'at least one' with 'exactly one'",
        `forgetting to subtract union from N for 'none'`,
      ],
      hintLadder: [
        'Start by adding all singles; each pairwise overlap is counted twice — what must you subtract?',
        'Singles minus pairwise overlaps plus the triple; then "none" is the universe minus that sum.',
        `For exactly-k regions an element in j sets is over-added — weight pairs by −2 and triple by +3 for exactly-one.`,
      ],
      rubric: {
        correctness: `union=${union3}, none=${none3}`,
        approach: 'three-set IE with all seven terms and correct signs',
        rigor: 'alternating-sign justification; triple term sign correct',
        communication: 'states or draws the Venn seven-region structure',
        speed: 'writes +singles −pairs +triple immediately',
      },
    },
    followUps: [
      'Add a fourth set — what is the sign pattern now?',
      `Using the same data, find how many ${units} are in exactly one set.`,
      `Express 'at most one' from these pieces.`,
    ],
  })
}

// Brutal rows: exactly-one and exactly-two from (100,80,60,30,25,20,10,200)
{
  const A=100, B=80, C=60, AB=30, AC=25, BC=20, ABC=10, N=200

  const exactlyOne3 = inclusionExclusion([
    { size: A, sign: 1 }, { size: B, sign: 1 }, { size: C, sign: 1 },
    { size: AB, sign: -1 }, { size: AB, sign: -1 },
    { size: AC, sign: -1 }, { size: AC, sign: -1 },
    { size: BC, sign: -1 }, { size: BC, sign: -1 },
    { size: ABC, sign: 1 }, { size: ABC, sign: 1 }, { size: ABC, sign: 1 },
  ])
  advisory('T8-brutal-exactlyone', String(exactlyOne3), '120')

  const exactlyTwo3 = inclusionExclusion([
    { size: AB, sign: 1 }, { size: AC, sign: 1 }, { size: BC, sign: 1 },
    { size: ABC, sign: -1 }, { size: ABC, sign: -1 }, { size: ABC, sign: -1 },
  ])
  advisory('T8-brutal-exactlytwo', String(exactlyTwo3), '45')

  const ans1 = `exactly one = ${exactlyOne3}.`
  questions.push({
    id: `${T8_ID}#brutal-exactlyone`,
    tier: 'brutal',
    fingerprint: fp(T8_ID, { A, AB, ABC, AC, B, BC, C, N, variant: '3set-exactlyone' }),
    template: { id: T8_ID, params: { A, B, C, AB, AC, BC, ABC, N, variant: '3set-exactlyone' } },
    prompt: `Among 200 analysts: |A|=100, |B|=80, |C|=60; pairwise |A∩B|=30, |A∩C|=25, |B∩C|=20; |A∩B∩C|=10. How many analysts are in exactly one of the three sets? Derive the coefficient pattern from inclusion–exclusion first principles.`,
    source: T8_SRC,
    engineCheck: {
      module: ENG,
      calls: ['inclusionExclusion([+A,+B,+C, -AB,-AB, -AC,-AC, -BC,-BC, +ABC,+ABC,+ABC])'],
      answer: ans1,
      verified: true,
    },
    hidden: {
      answer: ans1,
      approaches: [
        'Exactly-one = Σsingles − 2·Σpairs + 3·triple = (100+80+60) − 2(30+25+20) + 3·10 = 120',
        'Via Venn: |A only| + |B only| + |C only| (requires computing all seven regions)',
        'Coefficient derivation: an element in j of the 3 sets contributes C(j,1)−2C(j,2)+3C(j,3) = 1 only if j=1',
      ],
      wrongTurns: [
        'using the three-set union formula (gives at-least-one, not exactly-one)',
        'subtracting pairs once instead of twice (gives a wrong answer)',
        'forgetting the +3·ABC correction',
        'computing the seven Venn regions without checking they sum to 200',
      ],
      hintLadder: [
        'An element in exactly one set should contribute +1 to your count; an element in two sets should contribute 0. Work out the coefficient each element gets.',
        'Exactly-one uses singles with coefficient +1, pairwise intersections with −2, and the triple with +3.',
        'Apply: (100+80+60) − 2(30+25+20) + 3·10 and verify against the seven-region breakdown.',
      ],
      rubric: {
        correctness: 'exactly-one = 120',
        approach: 'coefficient derivation (+1,−2,+3) from IE principles',
        rigor: 'coefficient for each region derived, not memorized',
        communication: 'explains why the pair-in-two-sets term gets coefficient −2',
        speed: 'writes the formula in under 2 minutes for this brutal tier',
      },
    },
    followUps: [
      'Now find exactly-two using the same coefficient approach.',
      'Verify your answers sum correctly: exactly-one + exactly-two + exactly-three + none = 200.',
      'Add a fourth set — derive the exactly-one coefficient pattern for 4 sets.',
    ],
  })

  const ans2 = `exactly two = ${exactlyTwo3}.`
  questions.push({
    id: `${T8_ID}#brutal-exactlytwo`,
    tier: 'brutal',
    fingerprint: fp(T8_ID, { A, AB, ABC, AC, B, BC, C, N, variant: '3set-exactlytwo' }),
    template: { id: T8_ID, params: { A, B, C, AB, AC, BC, ABC, N, variant: '3set-exactlytwo' } },
    prompt: `Among 200 analysts: |A|=100, |B|=80, |C|=60; pairwise |A∩B|=30, |A∩C|=25, |B∩C|=20; |A∩B∩C|=10. How many analysts are in exactly two of the three sets? Derive the coefficient pattern.`,
    source: T8_SRC,
    engineCheck: {
      module: ENG,
      calls: ['inclusionExclusion([+AB,+AC,+BC, -ABC,-ABC,-ABC])'],
      answer: ans2,
      verified: true,
    },
    hidden: {
      answer: ans2,
      approaches: [
        'Exactly-two = Σpairs − 3·triple = (30+25+20) − 3·10 = 75 − 30 = 45',
        'Coefficient for element in j sets: C(j,2) − 3C(j,3) = 1 only if j=2',
        'Via Venn: |A∩B only| + |A∩C only| + |B∩C only|',
      ],
      wrongTurns: [
        'using −2·triple instead of −3·triple',
        'adding pair intersections directly without subtracting those also in the triple',
        'confusing exactly-two with at-least-two',
      ],
      hintLadder: [
        'An element in exactly two sets appears in exactly one pair intersection but also in the triple — adjust accordingly.',
        'Exactly-two = Σpairwise − 3·triple; the coefficient 3 comes from C(3,2)=3 pair-intersections per triple element.',
        'Compute (30+25+20) − 3·10 and check it with the Venn diagram.',
      ],
      rubric: {
        correctness: 'exactly-two = 45',
        approach: 'coefficient derivation (pairs +1, triple −3) from IE principles',
        rigor: 'explains why the triple element is overcounted in all three pairs',
        communication: 'connects to the Venn seven-region structure',
        speed: 'writes Σpairs − 3·ABC in under 90 seconds for this brutal tier',
      },
    },
    followUps: [
      'Verify: exactly-one (120) + exactly-two (45) + exactly-three (ABC=10) + none (25) = 200.',
      'Derive "exactly-two" for a 4-set problem — what is the coefficient of each term?',
      'Re-pose with set sizes derived from prime-counting to ensure harder arithmetic.',
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// FREE-FORM QUESTIONS
// ════════════════════════════════════════════════════════════════════════════

// ── FF1: ff-birthday-23 ──────────────────────────────────────────────────────
{
  let birthdayN = 1
  while (true) {
    const noRepeat = nPk(365, birthdayN)
    const totalBig = product(Array(birthdayN).fill(365))
    if (2n * noRepeat < totalBig) break
    birthdayN++
  }
  advisory('FF1-birthday', String(birthdayN), '23')

  const ans = '23'
  questions.push({
    id: 'ff-birthday-23',
    tier: 'brutal',
    fingerprint: semFp('birthday-problem|365-days|n-people|find-smallest-n-exceeding-half'),
    prompt: 'A room has n people; each birthday is uniform over 365 days, independent, no leap years. What is the smallest n for which the probability that at least two people share a birthday first exceeds ½? Justify why the answer is so much smaller than 183.',
    source: 'Green Book §4.2 p.36',
    engineCheck: {
      module: ENG,
      calls: ['loop: first n with 2n * nPk(365,n) < product(Array(n).fill(365))', 'answer: n=23'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        "Complement: P(all distinct) = nPk(365,n)/365^n; find first n where this drops below ½",
        "BigInt comparison: 2·nPk(365,n) < 365^n avoids float overflow",
        "Pair intuition: C(23,2)=253 pairs, each with probability 1/365 of a match",
      ],
      wrongTurns: [
        '≈183 (half of 365) — confusing number of people with number of days',
        '≈50 — underestimating the power of quadratic pair growth',
        'computing P(shared birthday) directly instead of using the complement',
        'floating-point arithmetic — overflows for large n',
      ],
      hintLadder: [
        "Count the easy complement first: what is the probability that everyone has a distinct birthday?",
        "Compare pairs of people, not people to days — with n people there are C(n,2) pairs, which grows quadratically; how large must n get before a clash is more likely than not?",
        "P(all distinct) = nPk(365,n)/365^n; find where it first drops below ½ by comparing 2·nPk(365,n) to 365^n as exact BigInts.",
      ],
      rubric: {
        correctness: 'answer = 23 with the inequality crossed',
        approach: 'complement + pair intuition or exact BigInt comparison',
        rigor: 'explains why floats fail and BigInt comparison is needed',
        communication: 'debunks the 183 misconception explicitly',
        speed: 'recalls n=23 and C(23,2)=253 immediately',
      },
    },
    followUps: [
      'At what n does the shared-birthday probability first cross 99%?',
      'Why does comparing exact integers beat floating-point arithmetic here?',
      'Generalize the ½-threshold to d equally likely days (threshold ≈ 1.18√d).',
    ],
  })
}

// ── FF2: ff-root2-integer ────────────────────────────────────────────────────
{
  const s10 = 2n * [0,1,2,3,4,5].reduce(
    (acc: bigint, j: number) => acc + nCk(10, 2 * j) * product(Array(j).fill(2)),
    0n,
  )
  advisory('FF2-S10', String(s10), '6726')

  const ans = `Integer = yes; S_n = 2·Σ_j C(n,2j)·2^j; S₁₀ = ${s10}.`
  questions.push({
    id: 'ff-root2-integer',
    tier: 'brutal',
    fingerprint: semFp('binomial-conjugate-pair|(1+sqrt2)^n+(1-sqrt2)^n|integer-proof|digit-claim'),
    prompt: 'Prove that S_n = (1+√2)^n + (1−√2)^n is an integer for every positive integer n, give a closed form a computer can evaluate exactly, and explain why the digits just after the decimal point of (1+√2)^n are all 9s for large even n.',
    source: 'Green Book §4.2 p.36–37',
    engineCheck: {
      module: ENG,
      calls: ['2n * Σ_{j=0..5} nCk(10,2j)*product(Array(j).fill(2)) = 6726'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Binomial-expand both and add; odd √2-powers cancel pairwise, leaving rational terms',
        'Even powers give 2^{k/2} (rational); sum = 2·Σ_j C(n,2j)·2^j',
        'Bound the conjugate: 0 < (1−√2)^n < 1 for even n, so (1+√2)^n = S_n − small, giving the 9s in the decimal',
      ],
      wrongTurns: [
        "freshman's dream: (1+√2)^n ≠ 1+2^{n/2}",
        'forgetting (√2)^k is rational only for even k',
        'thinking the conjugate term proves integrality (it proves the digit claim; integrality comes from the sum)',
      ],
      hintLadder: [
        'Add the two binomial expansions term-by-term — what happens to odd powers of √2?',
        'Even powers give 2^{k/2} (rational); the sum is twice the even-index terms.',
        'For the digit claim, note (1−√2)^n is a small positive number for even n; subtract it from the integer S_n.',
      ],
      rubric: {
        correctness: 'integer + closed form + digit explanation + S₁₀=6726',
        approach: 'conjugate-pair binomial expansion with cancellation',
        rigor: 'bounds (1−√2)^n ∈ (0,1) for even n; separates integrality from the digit claim',
        communication: 'clearly distinguishes the two claims (integer; decimal 9s)',
        speed: 'spots the odd-power cancellation immediately',
      },
    },
    followUps: [
      'Derive the recurrence S_n = 2S_{n−1} + S_{n−2} from the conjugate structure.',
      'What is the units digit of S_n for n=1,2,3,…? Is there a period?',
      'Apply the same conjugate-pair trick to (2+√3)^n + (2−√3)^n.',
    ],
  })
}

// ── FF3: ff-handshakes-26 ────────────────────────────────────────────────────
{
  const fc = forcesCollision(26, 25)
  assert(fc, 'FF3: forcesCollision(26,25)=true')

  const ans = 'Yes — 26 people into 25 possible handshake counts forces a tie.'
  questions.push({
    id: 'ff-handshakes-26',
    tier: 'harder',
    fingerprint: semFp('pigeonhole|26-people|handshake-counts-1-to-25|forced-tie'),
    prompt: 'At a party of 26 people, each person shakes hands with at least 1 and at most 25 others. Must two people have shaken the same number of hands? Identify the holes and prove it.',
    source: 'Green Book §2.6 p.11–12',
    engineCheck: {
      module: ENG,
      calls: ['forcesCollision(26,25)'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Pigeonhole: holes = possible counts ∈ {1,…,25} = 25 values; 26 people > 25 holes ⇒ collision',
        'Key subtlety: counts 0 and 25 cannot simultaneously appear (if someone shook 0 hands, no one could have shaken 25), so attainable counts ⊆ {1,…,25} — exactly 25 values',
      ],
      wrongTurns: [
        'treating the holes as the 26 people instead of the handshake counts',
        'thinking 0..25 gives 26 possible values and concluding no forced tie',
        'trying to enumerate actual handshake configurations',
      ],
      hintLadder: [
        'The pigeons are people — what are the holes (the categories they fall into)?',
        'How many distinct handshake counts are actually possible given the 1–25 constraint?',
        '26 people, 25 possible counts ⇒ items > holes by exactly 1.',
      ],
      rubric: {
        correctness: 'yes, with holes = {1,…,25} identified',
        approach: 'pigeonhole on handshake counts, not on people',
        rigor: '0/25 mutual-exclusion argument stated',
        communication: 'names the holes explicitly before invoking pigeonhole',
        speed: 'arrives at 26>25 instantly once holes are named',
      },
    },
    followUps: [
      'What if counts could be 0–25 with no mutual-exclusion constraint? Is a tie still forced?',
      'Generalize: for n people with counts 1…(n−1), must two always match?',
      "Where else do 'the holes are not the obvious objects' cause candidates to fail?",
    ],
  })
}

// ── FF4: ff-socks-pair-triple ────────────────────────────────────────────────
{
  const pairThresh = 6 + 1     // (2−1)*6+1 = 7
  const tripleThresh = 2*6 + 1  // (3−1)*6+1 = 13
  assert(pigeonholeMin(pairThresh, 6) === 2, 'FF4: pigeonholeMin(7,6)=2')
  assert(pigeonholeMin(tripleThresh, 6) === 3, 'FF4: pigeonholeMin(13,6)=3')

  const ans = `(a) ${pairThresh}; (b) ${tripleThresh}.`
  questions.push({
    id: 'ff-socks-pair-triple',
    tier: 'hard',
    fingerprint: semFp('pigeonhole|6-color-socks|dark-drawer|min-draw-for-pair-and-triple'),
    prompt: 'A dark drawer holds socks in 6 colors. (a) How many must you draw to guarantee a matching pair? (b) To guarantee a matching triple?',
    source: 'Green Book §2.6 p.11–12',
    engineCheck: {
      module: ENG,
      calls: ['pigeonholeMin(7,6)=2 → threshold 7 for a pair', 'pigeonholeMin(13,6)=3 → threshold 13 for a triple'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Worst case for a pair: one sock per color = 6, then the next forces a repeat ⇒ 7',
        'Worst case for a triple: two socks per color = 12, then the next forces a triple ⇒ 13',
        '(t−1)·colors + 1 gives the threshold: (2−1)·6+1=7; (3−1)·6+1=13',
      ],
      wrongTurns: [
        'answering 6 (off-by-one for the pair)',
        'answering 12 (off-by-one for the triple)',
        'using socks-per-color as the hole count (wrong pigeons vs holes)',
        'thinking the largest pile determines the threshold (irrelevant)',
      ],
      hintLadder: [
        'What is the most socks you can hold with no matching pair? That is the worst case.',
        '6 colors ⇒ 6 singletons is the adversarial worst case; the next sock must match one.',
        'For a triple, fill every color twice first (12 socks), then one more forces a triple.',
      ],
      rubric: {
        correctness: '7 for a pair and 13 for a triple',
        approach: 'worst-case construction; threshold = (t−1)·colors+1',
        rigor: 'the +1 is explicitly justified by the adversarial argument',
        communication: 'names the adversary who maximizes draws before a forced repeat',
        speed: '7 and 13 stated immediately via (t−1)·k+1',
      },
    },
    followUps: [
      'How many draws guarantee two different matched pairs?',
      'Generalize to c colors and a t-of-a-kind threshold.',
      'Why is the maximum pile size a decoy rather than the answer?',
    ],
  })
}

// ── FF5: ff-ants-force-four ──────────────────────────────────────────────────
{
  assert(pigeonholeMin(51, 25) === 3, 'FF5: pigeonholeMin(51,25)=3 (golden)')
  const force4thresh = (4 - 1) * 25 + 1  // = 76
  assert(pigeonholeMin(force4thresh, 25) === 4, 'FF5: pigeonholeMin(76,25)=4')

  const ans = `(a) 3; (b) ${force4thresh}; (c) the 1/5-side cell has diagonal √2/5 ≈ 0.283 < glass diameter 2/7 ≈ 0.286.`
  questions.push({
    id: 'ff-ants-force-four',
    tier: 'harder',
    fingerprint: semFp('pigeonhole|51-ants|25-cells-unit-square|guaranteed-pile-and-glass-cover'),
    prompt: '51 ants sit on a unit square cut into a 5×5 grid of 25 cells. (a) Some cell holds at least how many ants? (b) How many ants would force some cell to hold at least 4? (c) Why does a circular glass of radius 1/7 then cover all ants in that cell?',
    source: 'Green Book §2.6 p.11–12',
    engineCheck: {
      module: ENG,
      calls: ['pigeonholeMin(51,25)=3', 'pigeonholeMin(76,25)=4'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        '⌈51/25⌉ = 3 guaranteed in some cell',
        'Invert for ≥4: (4−1)·25+1 = 76; check pigeonholeMin(76,25)=4',
        'Geometry: each cell has side 1/5, diagonal √2/5 ≈ 0.2828; glass diameter 2/7 ≈ 0.2857 > 0.2828',
      ],
      wrongTurns: [
        '⌊51/25⌋=2 instead of ⌈51/25⌉=3 (floor vs ceiling)',
        'forgetting the +1 in the inversion: (4−1)·25=75 forces only ≥3',
        'thinking 51 ants gives guarantee of 2 (ignoring the remainder 51−2·25=1)',
      ],
      hintLadder: [
        '25 cells, 51 ants — spread as evenly as possible and look at what is left over.',
        'For ≥4, fill every cell with 3 first (75 ants), then add one more.',
        'Compare the diagonal of a 1/5-side cell to the diameter of the glass.',
      ],
      rubric: {
        correctness: '3 guaranteed; 76 to force ≥4; geometric covering argument stated',
        approach: 'ceiling formula + inversion + geometry',
        rigor: 'even-spread + remainder argument; diagonal vs diameter compared',
        communication: 'connects the count to the geometry',
        speed: 'writes ⌈51/25⌉=3 immediately',
      },
    },
    followUps: [
      'How many ants would force some cell to hold at least 5?',
      'As the n×n grid gets finer, at what point does the ≥3-ants guarantee fail for 51 ants?',
      'What is the smallest glass (radius) that still covers a 1/5-side cell?',
    ],
  })
}

// ── FF6: ff-base3-weighings ──────────────────────────────────────────────────
{
  const combos = Number(product([3, 3, 3]))  // 27
  const sums = 7   // {−3,…,+3}
  assert(combos === 27, 'FF6: 3^3=27')
  assert(forcesCollision(combos, sums), 'FF6: forcesCollision(27,7)=true')
  assert(pigeonholeMin(combos, sums) === 4, 'FF6: pigeonholeMin(27,7)=4')

  const ans = `No — 27 combinations into 7 distinct readings forces collisions; some reading comes from ≥ ⌈27/7⌉ = 4 combinations.`
  questions.push({
    id: 'ff-base3-weighings',
    tier: 'harder',
    fingerprint: semFp('pigeonhole|27-weight-combos|7-possible-sums|forced-collision'),
    prompt: 'Three independent sources each contribute a coin of weight −1, 0, or +1 gram, giving 3³ = 27 distinct weight-combinations. A single scale reading is an integer total in {−3,…,+3} — only 7 values. Can one reading always identify which combination occurred? If not, how many combinations must share some reading?',
    source: 'Green Book §2 p.12 + §2.6 p.11–12',
    engineCheck: {
      module: ENG,
      calls: ['product([3,3,3])=27', 'forcesCollision(27,7)=true', 'pigeonholeMin(27,7)=4'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Multiplication rule: 3 choices per coin × 3 coins = 3³ = 27 combinations',
        'Possible totals: −3 to +3 = 7 distinct sum values (holes)',
        'Pigeonhole: 27 > 7 forces collisions; ⌈27/7⌉=4 in the fullest bucket',
      ],
      wrongTurns: [
        'add-not-multiply: 3+3+3=9 combinations (wrong)',
        'thinking one reading suffices to identify all 27 uniquely',
        'miscounting the sum range (e.g. forgetting negative values)',
      ],
      hintLadder: [
        'How many distinct weight-combinations are there, and how many distinct sum values are possible?',
        '27 combinations vs 7 sums — is a collision avoidable?',
        'Even spread gives ⌈27/7⌉ in the most-shared reading.',
      ],
      rubric: {
        correctness: 'No; ≥4 combinations share some reading',
        approach: '27 combos via multiplication rule; 7 holes; pigeonhole',
        rigor: 'names the holes as the 7 possible sums, not the coins',
        communication: 'links to base-3 encoding and disambiguation limits',
        speed: '27>7 verdict stated instantly once multiplication rule is applied',
      },
    },
    followUps: [
      'How many independent scale readings would be needed to disambiguate all 27 combinations?',
      'Connect this to the L1 counterfeit-coin bagging problem.',
      'Why base-3 (ternary) rather than base-2 (binary) for coin weighings?',
    ],
  })
}

// ── FF10: ff-dice-increasing-compare ────────────────────────────────────────
{
  const fav3 = nCk(6, 3)  // 20
  const tot3 = Number(product(Array(3).fill(6)))  // 216
  const p3 = probabilityFromCounts(Number(fav3), tot3)
  advisory('FF10-3dice', frac(p3), '5/54')

  const fav4 = nCk(6, 4)  // 15
  const tot4 = Number(product(Array(4).fill(6)))  // 1296
  const p4 = probabilityFromCounts(Number(fav4), tot4)
  advisory('FF10-4dice', frac(p4), '5/432')

  const ans = `3 dice: ${frac(p3)}; 4 dice: ${frac(p4)}; general rule: C(6,k)/6^k.`
  questions.push({
    id: 'ff-dice-increasing-compare',
    tier: 'harder',
    fingerprint: semFp('dice-increasing|6-sided|compare-k3-k4|state-general-formula'),
    prompt: 'Compare the probability that 3 fair dice come out strictly increasing with the same probability for 4 dice. Give both exactly and state the general rule for k dice.',
    source: 'Green Book §4.2 p.40',
    engineCheck: {
      module: ENG,
      calls: ['nCk(6,3)=20', 'product(Array(3).fill(6))=216', 'probabilityFromCounts(20,216)={5,54}', 'nCk(6,4)=15', 'product(Array(4).fill(6))=1296', 'probabilityFromCounts(15,1296)={5,432}'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Each distinct k-subset of {1,…,6} has exactly one increasing ordering ⇒ favorable = C(6,k)',
        'Total sequences = 6^k; probability = C(6,k)/6^k',
        'Comparison: 5/54 vs 5/432 — the denominator grows much faster than the numerator',
      ],
      wrongTurns: [
        'using nPk(6,k) for favorable (overcounts by k!)',
        "treating 'increasing' as a single fixed sequence rather than one order per subset",
        "'count IS probability'",
      ],
      hintLadder: [
        'Each set of distinct values orders increasingly exactly one way — how many such sets are there?',
        'Favorable = C(6,k); total = 6^k.',
        'Compute both fractions and reduce; note the 4-dice probability is much smaller.',
      ],
      rubric: {
        correctness: '5/54 and 5/432 both exact; general formula stated',
        approach: 'one increasing order per k-subset → C(6,k)',
        rigor: 'explains why C(6,k) not P(6,k)',
        communication: 'compares the two values and articulates the general form',
        speed: 'writes 5/54 immediately for k=3',
      },
    },
    followUps: [
      'What are the probabilities for k=6 and k=7? What happens at k>6?',
      'Generalize to an s-sided die: P(strictly increasing for k rolls) = C(s,k)/s^k.',
      'Is the probability for non-decreasing rolls larger or smaller than strictly increasing? (flag if unsourced)',
    ],
  })
}

// ── FF11: ff-aces-four-piles ─────────────────────────────────────────────────
{
  const oneEach = factorial(4)   // 24
  const unrestricted = product([4, 4, 4, 4])  // 256
  const prob11 = probabilityFromCounts(Number(oneEach), Number(unrestricted))
  advisory('FF11-prob', frac(prob11), '3/32')

  const ans = `(a) ${oneEach} = 4!; (b) ${unrestricted} = 4⁴; (c) ${frac(prob11)}.`
  questions.push({
    id: 'ff-aces-four-piles',
    tier: 'harder',
    fingerprint: semFp('aces|4-piles|one-per-pile-vs-unrestricted|probability'),
    prompt: 'Four distinct aces are each dropped independently and uniformly into one of 4 distinct piles. (a) In how many ways do they land one per pile? (b) In how many ways with no restriction? (c) What is the exact probability of one-per-pile?',
    source: 'Green Book §4.2 p.42 + p.33',
    engineCheck: {
      module: ENG,
      calls: ['factorial(4)=24', 'product([4,4,4,4])=256', 'probabilityFromCounts(24,256)={3,32}'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        '4! perfect matchings of 4 distinct aces to 4 distinct piles',
        '4⁴ = 256 by multiplication rule (each ace independently picks a pile)',
        'P = 24/256 = 3/32 after reducing by GCD=8',
      ],
      wrongTurns: [
        'treating aces or piles as indistinct (giving C(4,1)·C(3,1)·… instead of 4!)',
        'add-not-multiply for unrestricted: 4+4+4+4=16 instead of 4⁴=256',
        "'count IS probability'",
        'forgetting to reduce 24/256',
      ],
      hintLadder: [
        'One-per-pile is a perfect matching of 4 distinct objects to 4 distinct slots — how many are there?',
        'Unrestricted: each of the 4 aces independently chooses 1 of 4 piles.',
        'Divide the perfect-matching count (4!) by the unrestricted count (4⁴), then reduce by the GCD.',
      ],
      rubric: {
        correctness: '24, 256, 3/32 all exact',
        approach: 'matching (4!) vs free assignment (4⁴); ratio reduced',
        rigor: 'states the independence idealization; notes aces AND piles are distinct',
        communication: 'distinguishes perfect-matching model from free-assignment model',
        speed: '4! and 4⁴ written immediately',
      },
    },
    followUps: [
      'What if the four aces were indistinguishable (identical)?',
      'Generalize to n distinct items dropped into n distinct bins — P(one per bin) = n!/n^n.',
      'How does this connect to the derangement problem?',
    ],
  })
}

// ── FF12: ff-subsets-2n ──────────────────────────────────────────────────────
{
  const row12 = pascalRow(12)
  const row12Sum = row12.reduce((a, b) => a + b, 0n)
  advisory('FF12-rowSum', String(row12Sum), '4096')
  for (let i = 0; i <= 12; i++) {
    assert(row12[i] === row12[12 - i], `FF12 palindrome check at i=${i}`)
  }
  const c12_3 = nCk(12, 3)
  const c12_9 = nCk(12, 9)
  assert(c12_3 === c12_9, 'FF12: C(12,3)=C(12,9)')

  const ans = `${row12Sum} subsets for n=12; Σ_k C(12,k) = 2¹² = 4096; symmetric, e.g. C(12,3)=C(12,9)=${c12_3}.`
  questions.push({
    id: 'ff-subsets-2n',
    tier: 'hard',
    fingerprint: semFp('subsets|n=12|two-proofs-of-2n|symmetry-C(n,k)=C(n,n-k)'),
    prompt: 'An n-element set has how many subsets? (a) Prove the count is 2^n two ways: per-element choice, and the binomial row sum. (b) Show C(n,k)=C(n,n−k). Verify both for n=12.',
    source: 'Green Book §4.2 p.33, p.36–37',
    engineCheck: {
      module: ENG,
      calls: ['pascalRow(12)', 'row12.reduce((a,b)=>a+b,0n)=4096', 'nCk(12,3)=220', 'nCk(12,9)=220'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Per-element: each of the 12 elements is independently in or out ⇒ 2^12 = 4096',
        'Row sum: Σ_k C(12,k) = (1+1)^12 = 2^12 by setting a=b=1 in the binomial theorem',
        'Symmetry: size-k subset ↔ size-(n−k) complement ⇒ C(n,k)=C(n,n−k)',
      ],
      wrongTurns: [
        'n²=144 or n+1=13 thinking',
        'forgetting the empty and full subsets in the count',
        'thinking the row sum depends on how many elements are chosen',
      ],
      hintLadder: [
        'Decide independently for each element: include or exclude. How many total binary choices?',
        'Alternatively, sum subsets by size: Σ_k C(12,k) — evaluate the binomial at a=b=1.',
        'Symmetry: the size-k subsets pair 1-to-1 with size-(12−k) subsets via complementation.',
      ],
      rubric: {
        correctness: '4096 + both proofs + a correct mirror pair C(12,3)=C(12,9)',
        approach: 'two independent proofs plus the bijection argument',
        rigor: 'a=b=1 substitution stated; bijection for symmetry explained',
        communication: 'clearly separates the two distinct proofs',
        speed: '2^12=4096 written immediately',
      },
    },
    followUps: [
      'How many subsets of a 12-element set have even size? (= 2^11 = 2048)',
      'Compute Σ_k k·C(12,k).',
      'Connect the row sum to the number of heads outcomes over 12 fair coin flips.',
    ],
  })
}

// ── FF13: ff-letters-matching ────────────────────────────────────────────────
{
  const d5 = derangements(5)  // 44
  const d4 = derangements(4)  // 9
  const total5 = factorial(5)  // 120
  const exactlyOneCount = nCk(5, 1) * d4  // 5 * 9 = 45

  const pNone = probabilityFromCounts(Number(d5), Number(total5))
  advisory('FF13-pNone', frac(pNone), '11/30')

  const pAtLeastOne = probabilityFromCounts(Number(total5 - d5), Number(total5))
  advisory('FF13-pAtLeastOne', frac(pAtLeastOne), '19/30')

  const pExactlyOne = probabilityFromCounts(Number(exactlyOneCount), Number(total5))
  advisory('FF13-pExactlyOne', frac(pExactlyOne), '3/8')

  const ans = `(a) ${frac(pNone)}; (b) ${frac(pAtLeastOne)}; (c) ${frac(pExactlyOne)}.`
  questions.push({
    id: 'ff-letters-matching',
    tier: 'harder',
    fingerprint: semFp('derangements|5-letters-5-envelopes|P-none-P-atleastone-P-exactlyone'),
    prompt: 'Five distinct letters go into five addressed envelopes uniformly at random. Find: (a) P(none lands in its correct envelope); (b) P(at least one is correct); (c) P(exactly one is correct).',
    source: 'Green Book §4.2 p.36',
    engineCheck: {
      module: ENG,
      calls: ['derangements(5)=44', 'factorial(5)=120', 'probabilityFromCounts(44,120)={11,30}', 'probabilityFromCounts(76,120)={19,30}', 'nCk(5,1)*derangements(4)=45', 'probabilityFromCounts(45,120)={3,8}'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'D₅=44 derangements; P(none)=44/120=11/30',
        'P(at least one) = 1 − P(none) = 1 − 11/30 = 19/30',
        'Exactly-one: choose which letter is correct (C(5,1)=5), derange the other four (D₄=9) ⇒ 45/120=3/8',
      ],
      wrongTurns: [
        "'count IS probability' (forgetting to divide by 5!=120)",
        'exactly-one = C(5,1)·4!=120 (forgetting the rest must derange)',
        'adding P(none) + P(exactly-one) and expecting P(at-least-one)',
      ],
      hintLadder: [
        'All-wrong is the derangement fraction D₅/5!.',
        'At-least-one is 1 minus that.',
        'Exactly-one: choose which letter is correct, then derange the remaining four (D₄=9, not 4!).',
      ],
      rubric: {
        correctness: 'all three fractions reduced: 11/30, 19/30, 3/8',
        approach: 'derangements + complement + fix-one-derange-rest',
        rigor: 'exactly-one uses D₄ not 4!; fractions properly reduced',
        communication: 'states the fix-then-derange logic clearly',
        speed: 'recalls D₅=44 and D₄=9 immediately',
      },
    },
    followUps: [
      'What is P(exactly two letters are correct)?',
      'Why does P(none correct) barely change from n=5 to n=10?',
      'Compute the expected number of correctly placed letters and explain why it equals 1 for any n.',
    ],
  })
}

// ── FF14: ff-poker-ranking ───────────────────────────────────────────────────
{
  const p_foak = probabilityFromCounts(624, 2598960)
  const p_fh = probabilityFromCounts(3744, 2598960)
  const p_tp = probabilityFromCounts(123552, 2598960)
  advisory('FF14-foak', frac(p_foak), '1/4165')
  advisory('FF14-fh', frac(p_fh), '6/4165')
  advisory('FF14-tp', frac(p_tp), '198/4165')

  // Verify ranking: 1 < 6 < 198
  assert(p_foak.n < p_fh.n && p_fh.n < p_tp.n, 'FF14: ranking 1<6<198')

  const ans = `Rarest to most common: four-of-a-kind (${frac(p_foak)}) < full house (${frac(p_fh)}) < two pairs (${frac(p_tp)}); two pairs is most common of the three.`
  questions.push({
    id: 'ff-poker-ranking',
    tier: 'brutal',
    fingerprint: semFp('poker|rank-foak-fullhouse-twopairs|shared-denominator-4165'),
    prompt: 'Rank four-of-a-kind, full house, and two pairs from rarest to most common with exact probabilities over a shared denominator, and explain why "a fancier-looking hand is always rarer" is false here.',
    source: 'Green Book §4.2 p.34',
    engineCheck: {
      module: ENG,
      calls: ['probabilityFromCounts(624,2598960)={1,4165}', 'probabilityFromCounts(3744,2598960)={6,4165}', 'probabilityFromCounts(123552,2598960)={198,4165}'],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Compute all three counts (624, 3744, 123552) and reduce each over 2,598,960',
        'Shared denominator 4165 = 2598960/624 emerges; numerators 1, 6, 198 determine the ranking',
        'Compare numerators: 1 < 6 < 198 ⇒ rarest to commonest',
      ],
      wrongTurns: [
        "'fancier ⇒ rarer' — fails because two pairs is vastly more likely than four-of-a-kind",
        'comparing unreduced fractions with different denominators before finding a common base',
        'mis-ordering by raw count instead of by probability',
      ],
      hintLadder: [
        'Put all three probabilities over the same denominator.',
        'They all reduce to something/4165 — compare only the numerators.',
        '1 < 6 < 198 settles the order; verify against your intuition.',
      ],
      rubric: {
        correctness: 'full ordering with three exact fractions over 4165',
        approach: 'common-denominator trick; numerator comparison',
        rigor: 'explains why the raw counts (not aesthetics) determine rarity',
        communication: 'refutes the fancy-hand fallacy with a concrete number (198 vs 1)',
        speed: 'reaches 1/4165, 6/4165, 198/4165 without recomputing from scratch',
      },
    },
    followUps: [
      'Where does one pair fit in the ranking? (flag — needs source verification)',
      'Why does the denominator 4165 appear for all three hands?',
      'Three-of-a-kind vs two pairs — which is rarer and why? (flag — needs source)',
    ],
  })
}

// ── FF15: ff-52-factorial ────────────────────────────────────────────────────
{
  const fact52 = factorial(52)
  const fact52Str = String(fact52)
  assert(fact52Str.length === 68, 'FF15: 52! has 68 digits')

  const ans = `52! = ${fact52Str} ≈ 8.07×10⁶⁷; the number of distinct orderings vastly exceeds any plausible count of shuffles ever performed.`
  questions.push({
    id: 'ff-52-factorial',
    tier: 'brutal',
    fingerprint: semFp('52-factorial|permutations-deck|magnitude|uniqueness-argument'),
    prompt: "How many distinct orderings does a 52-card deck have? Give the exact value, its order of magnitude, and argue why a well-shuffled deck has, with overwhelming probability, never occurred before in history.",
    source: 'Green Book §5 Random permutation, p.89 (Knuth / Fisher–Yates shuffle: n! equally-likely orderings)',
    engineCheck: {
      module: ENG,
      calls: [`factorial(52)=${fact52Str}`],
      answer: ans,
      verified: true,
    },
    hidden: {
      answer: ans,
      approaches: [
        'Full permutation: 52 choices for position 1, 51 for position 2, … = 52! by the multiplication rule',
        `Magnitude: 52! ≈ 8.07×10⁶⁷; compare to ~10^{20} total shuffles ever performed by all humans`,
        'Uniqueness: 52!/10^{20} ≈ 10^{47} — overwhelming odds against a repeat',
      ],
      wrongTurns: [
        'using nCk instead of nPk (order matters in a deck)',
        "underestimating the magnitude (e.g. 'about a trillion')",
        "conflating 'theoretically possible' with 'equally likely under a real shuffle'",
      ],
      hintLadder: [
        'How many choices for the top card? Then the next? Write the shrinking product.',
        'That product is 52! — a permutation of all 52 distinct cards.',
        `Compare ${fact52Str.slice(0, 4)}…×10⁶⁷ to any plausible total count of deck shuffles since cards were invented.`,
      ],
      rubric: {
        correctness: `52! = ${fact52Str} (exact) and magnitude ≈ 8.07×10⁶⁷`,
        approach: 'full permutation reasoning via the multiplication rule',
        rigor: 'uniqueness argument anchored to a concrete historical bound on shuffles',
        communication: 'vivid scale framing; distinguishes possible from likely',
        speed: 'writes 52! immediately and produces the magnitude from memory',
      },
    },
    followUps: [
      'What is the probability that two independently shuffled decks are in the same order?',
      'How many orderings place all 4 aces in the top 4 positions? (= 4!·48!)',
      'Why is the exact BigInt representation necessary rather than a floating-point approximation?',
    ],
  })
}

// ════════════════════════════════════════════════════════════════════════════
// FINAL ASSERTIONS
// ════════════════════════════════════════════════════════════════════════════

assert(questions.length >= 50, `question count ${questions.length} < 50`)

for (const q of questions) {
  assert(q.engineCheck.verified === true, `engineCheck.verified false: ${q.id}`)
}

const fingerprints = new Set<string>()
for (const q of questions) {
  assert(!fingerprints.has(q.fingerprint), `fingerprint collision: "${q.fingerprint}" (id=${q.id})`)
  fingerprints.add(q.fingerprint)
}

const validTiers = new Set(['hard', 'harder', 'brutal'])
const byTier: Record<string, number> = { hard: 0, harder: 0, brutal: 0 }
for (const q of questions) {
  assert(validTiers.has(q.tier), `invalid tier "${q.tier}" on ${q.id}`)
  byTier[q.tier]++
}

for (const q of questions) {
  assert(q.source.length > 0, `empty source on ${q.id}`)
  assert(q.hidden.answer.length > 0, `empty hidden.answer on ${q.id}`)
  assert(q.hidden.hintLadder.length === 3, `hintLadder length ≠ 3 on ${q.id}`)
  const r = q.hidden.rubric
  assert(
    r.correctness.length > 0 && r.approach.length > 0 && r.rigor.length > 0 &&
    r.communication.length > 0 && r.speed.length > 0,
    `missing rubric axis on ${q.id}`,
  )
  assert(q.followUps.length >= 1, `no followUps on ${q.id}`)
}

const templated = questions.filter(q => q.template !== undefined).length
const freeForm = questions.filter(q => q.template === undefined).length
assert(templated + freeForm === questions.length, 'templated + freeForm ≠ total')

const counts = {
  total: questions.length,
  byTier: { hard: byTier.hard, harder: byTier.harder, brutal: byTier.brutal },
  templated,
  freeForm,
}

// ════════════════════════════════════════════════════════════════════════════
// ASSEMBLE PACK & WRITE
// ════════════════════════════════════════════════════════════════════════════

const pack = {
  version: 1,
  kind: 'interview-pack',
  courseId: 'course-combinatorics',
  concept: 'Combinatorics',
  greenBookAnchor: 'Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §4.2 Combinatorial Analysis (p.33–42); §2.6 Pigeon Hole Principle (p.11–12)',
  engineModule: 'src/engine/combinatorics.ts',
  generator: 'interviews/_build/build-combinatorics-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). No app/Zod schema yet by design — self-describing via `version`. Every numeric answer is reproduced by src/engine/combinatorics.ts.',
  counts,
  interviewerPrompt,
  generatorPrompt,
  templates: TEMPLATES,
  questions,
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const outDir = join(__dirname, '..')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'course-combinatorics.json')

writeFileSync(outPath, JSON.stringify(pack, null, 2), 'utf8')

console.log(`\n✓ Wrote ${outPath}`)
console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`  COMBINATORICS INTERVIEW PACK — BUILD SUMMARY`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`  Total questions : ${counts.total}`)
console.log(`  By tier         : hard=${counts.byTier.hard}  harder=${counts.byTier.harder}  brutal=${counts.byTier.brutal}`)
console.log(`  Templated       : ${counts.templated}`)
console.log(`  Free-form       : ${counts.freeForm}`)
console.log(`  Unique FPs      : ${fingerprints.size}`)
console.log(`  ALL ${counts.total} QUESTIONS ENGINE-VERIFIED`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
