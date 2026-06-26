#!/usr/bin/env tsx
// interviews/_build/build-expected-value-pack.ts
// Generator for interviews/course-expected-value.json
// ALL 58 answers computed via src/engine/expectation.ts — engine-verified by construction.
// Deterministic: no timestamps, no Date, no randomness. Re-running produces byte-identical JSON.

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Rational } from '../../src/engine/types'
import {
  expectedValue,
  totalExpectation,
  indicatorExpectation,
  harmonic,
  couponCollector,
  distinctAfterDraws,
  orderStatUniform,
  noodleLoops,
} from '../../src/engine/expectation'
import { ratAdd, ratSub, ratMul, reduce } from '../../src/engine/automaton'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MAX_SAFE = Number.MAX_SAFE_INTEGER
const R = (n: number, d = 1): Rational => ({ n, d })
const DIE = [1, 2, 3, 4, 5, 6].map(x => ({ x: R(x), p: R(1, 6) }))
const ENG = 'src/engine/expectation.ts'

function ratStr(r: Rational): string {
  return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`
}

function assertSafe(r: Rational, ctx: string): void {
  if (Math.abs(r.n) > MAX_SAFE || Math.abs(r.d) > MAX_SAFE)
    throw new Error(`[OVERFLOW] ${ctx}: n=${r.n} d=${r.d}`)
}

function check(r: Rational, advisory: string, ctx: string): string {
  assertSafe(r, ctx)
  const s = ratStr(r)
  if (s !== advisory)
    throw new Error(`[MISMATCH] ${ctx}: engine="${s}" advisory="${advisory}"`)
  return s
}

function semFp(topic: string, entities: string, params: string, ask: string): string {
  const sig = `${topic}|${entities}|${params}|${ask}`
  return 'sem:' + createHash('sha1').update(sig).digest('hex').slice(0, 12)
}

function tplFp(id: string, params: Record<string, string | number>): string {
  const seg = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join(',')
  return `${id}:${seg}`
}

// ── Engine computations (all answers computed here; assertions inline) ────────

// T1 — fair value (rows 3–8)
const t1r3 = check(expectedValue([1,2,3,4,5].map(x=>({x:R(x),p:R(1,10)})).concat([{x:R(6),p:R(1,2)}])), '9/2', 'T1-row3')
const t1r4 = check(expectedValue([{x:R(1),p:R(1,2)}].concat([2,3,4,5,6].map(x=>({x:R(x),p:R(1,10)})))), '5/2', 'T1-row4')
const t1r5 = check(expectedValue([{x:R(1),p:R(1,2)},{x:R(5),p:R(1,3)},{x:R(11),p:R(1,6)}]), '4', 'T1-row5')
const t1r6 = check(expectedValue([{x:R(0),p:R(1,2)},{x:R(10),p:R(1,4)},{x:R(20),p:R(1,8)},{x:R(40),p:R(1,8)}]), '10', 'T1-row6')
const t1r7 = check(expectedValue([1,2,3,4,5,6].map(k=>({x:R(k),p:R(2*k-1,36)}))), '161/36', 'T1-row7')
const t1r8 = check(expectedValue([1,2,3,4,5,6].map(k=>({x:R(k),p:R(13-2*k,36)}))), '91/36', 'T1-row8')

// T2 — linearity
const t2n4  = check(noodleLoops(4),  '176/105',    'T2-noodles-4')
const t2n5  = check(noodleLoops(5),  '563/315',    'T2-noodles-5')
const t2n7  = check(noodleLoops(7),  '88069/45045','T2-noodles-7')
const t2n8  = check(noodleLoops(8),  '91072/45045','T2-noodles-8')
const t2k4  = check(ratMul(R(4),  expectedValue(DIE)), '14', 'T2-dice-4')
const t2k6  = check(ratMul(R(6),  expectedValue(DIE)), '21', 'T2-dice-6')
const t2k10 = check(ratMul(R(10), expectedValue(DIE)), '35', 'T2-dice-10')

// T3 — indicators: first-special = reduce(D+1, A+1)
const t3fs1 = check(reduce(55, 3),   '55/3',  'T3-D54-A2')
const t3fs2 = check(reduce(53, 13),  '53/13', 'T3-D52-A12')
const t3fs3 = check(reduce(53, 9),   '53/9',  'T3-D52-A8')
const t3fs4 = check(reduce(41, 5),   '41/5',  'T3-D40-A4')
// T3 distinct
const t3d1  = check(distinctAfterDraws(6,  3), '91/36',      'T3-N6-m3')
const t3d2  = check(distinctAfterDraws(6,  4), '671/216',    'T3-N6-m4')
const t3d3  = check(distinctAfterDraws(6,  6), '31031/7776', 'T3-N6-m6')
const t3d4  = check(distinctAfterDraws(10, 3), '271/100',    'T3-N10-m3')
const t3d5  = check(distinctAfterDraws(13, 4), '7825/2197',  'T3-N13-m4')

// T4 — total expectation (rows 2,3,4,6,7,8)
const t4r2 = check(totalExpectation([{p:R(1,3),value:R(1)},{p:R(2,3),restart:{add:R(1)}}]),          '3',    'T4-row2')
const t4r3 = check(totalExpectation([{p:R(1,20),value:R(1)},{p:R(19,20),restart:{add:R(1)}}]),       '20',   'T4-row3')
const t4r4 = check(totalExpectation([{p:R(1,2),value:R(7,2)},{p:R(1,2),value:R(1)}]),               '9/4',  'T4-row4')
const t4r6 = check(totalExpectation([{p:R(1,3),value:R(3,2)},{p:R(2,3),restart:{add:R(9,2)}}]),     '21/2', 'T4-row6')
const t4r7 = check(totalExpectation([{p:R(1,2),value:R(3)},{p:R(1,2),restart:{add:R(4)}}]),         '7',    'T4-row7')
const t4r8 = check(totalExpectation([{p:R(1,2),value:R(5,2)},{p:R(1,2),restart:{add:R(13,2)}}]),    '9',    'T4-row8')

// T5 — coupon collector
const t5n5   = check(couponCollector(5),             '137/12',    'T5-N5')
const t5n7   = check(couponCollector(7),             '363/20',    'T5-N7')
const t5n8   = check(couponCollector(8),             '761/35',    'T5-N8')
const t5n10  = check(couponCollector(10),            '7381/252',  'T5-N10')
const t5n12  = check(couponCollector(12),            '86021/2310','T5-N12')
const t5j3n6   = check(ratMul(R(6),  harmonic(3)), '11', 'T5-j3-N6')
const t5j10n12 = check(ratMul(R(12), harmonic(2)), '18', 'T5-j10-N12')

// T6 — order statistics
const t6max3    = check(orderStatUniform(3).max,   '3/4',      'T6-max-3')
const t6max5    = check(orderStatUniform(5).max,   '5/6',      'T6-max-5')
const t6max10   = check(orderStatUniform(10).max,  '10/11',    'T6-max-10')
const t6min3    = check(orderStatUniform(3).min,   '1/4',      'T6-min-3')
const t6min5    = check(orderStatUniform(5).min,   '1/6',      'T6-min-5')
const t6range5  = check(ratSub(orderStatUniform(5).max,  orderStatUniform(5).min),  '2/3',  'T6-range-5')
const t6range10 = check(ratSub(orderStatUniform(10).max, orderStatUniform(10).min), '9/11', 'T6-range-10')
const t6ants100  = check(orderStatUniform(100).max,  '100/101',  'T6-ants-100')
const t6ants1000 = check(orderStatUniform(1000).max, '1000/1001','T6-ants-1000')

// FF — free-form
const ff1a = check(expectedValue(DIE), '7/2', 'FF1-fair-die')
const ff1d = check(expectedValue([1,2,3,4,5].map(x=>({x:R(x),p:R(1,10)})).concat([{x:R(6),p:R(1,2)}])), '9/2', 'FF1-loaded-die')
const TWO_DICE_PMF = [1,2,3,4,5,6,5,4,3,2,1].map((w,i)=>({x:R(i+2),p:R(w,36)}))
const ff2pmf = check(expectedValue(TWO_DICE_PMF), '7', 'FF2-pmf')
const ff2lin = check(ratMul(R(2), expectedValue(DIE)), '7', 'FF2-lin')
const ff3 = check(totalExpectation([{p:R(1,2),value:R(7,2)},{p:R(1,2),value:R(0)}]), '7/4', 'FF3')
const ff4max = check(orderStatUniform(2).max, '2/3', 'FF4-max')
const ff4min = check(orderStatUniform(2).min, '1/3', 'FF4-min')
// FF5: first ace in 52-card deck; 4 aces → (52+1)/(4+1) = 53/5
// Verify via indicator formula: 1 + 48 · indicatorExpectation(R(1,5))
const ff5alt = ratAdd(R(1), ratMul(R(48), indicatorExpectation(R(1,5))))
assertSafe(ff5alt, 'FF5-indicator-alt')
if (ratStr(ff5alt) !== '53/5') throw new Error(`FF5 indicator mismatch: ${ratStr(ff5alt)}`)
const ff5 = check(reduce(53, 5), '53/5', 'FF5')
const ff6  = check(distinctAfterDraws(6, 2), '11/6',      'FF6')
const ff7  = check(couponCollector(6),        '147/10',    'FF7')
const ff8  = check(totalExpectation([{p:R(1,6),value:R(1)},{p:R(5,6),restart:{add:R(1)}}]), '6', 'FF8')
const ff9  = check(ratSub(orderStatUniform(4).max, orderStatUniform(4).min), '3/5', 'FF9')
const ff10 = check(noodleLoops(6), '6508/3465', 'FF10')
const ff11 = check(totalExpectation([{p:R(1,2),value:R(2)},{p:R(1,2),restart:{add:R(5)}}]), '7', 'FF11')
const ff12 = check(orderStatUniform(500).max, '500/501', 'FF12')
const ff13 = check(ratMul(R(6), harmonic(2)), '9', 'FF13')
const ff14 = check(expectedValue([
  {x:R(7),p:R(2,11)},{x:R(8),p:R(2,11)},{x:R(9),p:R(2,11)},
  {x:R(10),p:R(2,11)},{x:R(11),p:R(2,11)},{x:R(12),p:R(1,11)},
]), '102/11', 'FF14')

console.log('✓ All engine computations passed (safe-integer + advisory assertions)')

// ── Verbatim prompt strings ───────────────────────────────────────────────────

const interviewerPrompt = `ROLE
You are a senior quantitative-research interviewer at a top trading desk (Jane Street / Citadel / IMC), a specialist in expectation and probability, running a live mock interview on EXPECTED VALUE. Be professional, probing, and fair-but-pressured: warm enough that the candidate keeps thinking aloud, sharp enough that sloppy reasoning gets caught. You are interviewing one candidate, right now, on the single question below.

THE QUESTION (injected at runtime)
- Prompt: {{prompt}}
- Tier: {{tier}}  (hard | harder | brutal — calibrate your pressure and follow-up depth to the tier)
- Source: {{source}}  (your context only; never read it aloud)

PROTOCOL
1. Ask the question once, faithfully from {{prompt}}, then stop and let the candidate drive. ONE question at a time — never stack asks or surface the follow-ups early.
2. Make them think ALOUD. Before any arithmetic, push for the model: "What's the random variable? What exactly are you taking the expectation of? State your assumptions." Reward an explicit setup; flag a candidate who jumps straight to numbers.
3. Probe, don't solve. Ask Socratic questions that test whether they've seen the EV edge this problem turns on (see EDGE CASES). Do NOT do the derivation for them and do NOT hand over the structure unless they are stuck.
4. Release hints only when genuinely stuck or explicitly asked (see HINTS).
5. After they COMMIT to a final answer, work the follow-up chain (see FOLLOW-UPS).
6. Then close (see SCORING).

EDGE CASES TO PROBE (the EV traps that separate strong candidates — press the ones this question actually hinges on)
- Balance point, not the label-midpoint: is E[X] the probability-weighted average Σx·P(x), or did they just average the outcome labels?
- Linearity vs product: E[X+Y]=E[X]+E[Y] needs NO independence — are they over-assuming independence to add, or conversely invoking E[XY]=E[X]E[Y] (which DOES need independence) without justifying it?
- Hidden indicator sum: is a "count" secretly 1+Σ indicators, so E[count]=1+ΣP(I_i)? Did they spot it instead of grinding a messy distribution?
- Weight by probability, not by value: when conditioning, are cases weighted by P(case) — not by the size of the payoff?
- Self-referential restart: does a case throw you back to the start (worth value + E[X]), forcing you to SOLVE the equation for E[X] rather than read it off?
- Convergent tails: does a geometric/decaying series of contributions sum to a FINITE value — and can they argue convergence instead of panicking at "infinitely many terms"?
- Order-stat saturation: for extremes of n samples, do they reach E[max]=n/(n+1), E[min]=1/(n+1), and the intuition E[max]→1 as n grows?
- Relabel / pass-through (symmetry): can they collapse the problem by symmetry or a change of label (e.g. ants-on-a-string: two ants meeting ≡ passing through) instead of tracking every case?

HINTS — escalating, ONLY when stuck
Use {{hidden.hintLadder}} = [nudge, stronger, near-reveal]. Release ONE rung at a time, in order, and only after a visible stuck-signal (a long silence, a wrong turn they cannot recover, or an explicit request). Start at the nudge. Never skip ahead, never give two rungs at once, never go past near-reveal. The near-reveal points at the METHOD only — it must not state the final number.

NO-ANSWER-LEAK (critical)
Before the candidate commits, NEVER state, approximate, confirm, deny, or "narrow down" the final answer, and NEVER reveal {{hidden.answer}}. Do not paste or paraphrase any part of the hidden record ({{hidden.answer}}, {{hidden.approaches}}, {{hidden.wrongTurns}}, {{hidden.hintLadder}}, {{hidden.rubric}}). Hints come only from the ladder, one at a time, as above. If asked "is that right?" mid-solve, redirect ("walk me through why you think so") rather than confirm.

GROUNDING (critical)
Treat {{hidden.answer}} and {{hidden.approaches}} as GROUND TRUTH — they were verified by this concept's exact-rational engine (src/engine/expectation.ts). Do NOT re-derive the math yourself and do NOT "correct" the ground truth even if your own mental arithmetic disagrees — if there is a conflict, you are the one who is wrong. Accept ANY mathematically-equivalent exact form as correct: an equal but unreduced fraction (e.g. 147/10 = 14.7), the clean decimal of an exact rational, or an equivalent unevaluated expression (e.g. 6·H₆, an equivalent Σ). Reject only forms that are genuinely not equal, or a float that merely rounds an exact rational the candidate never actually identified. Use {{hidden.wrongTurns}} to RECOGNIZE a misconception, not to lead the candidate down it. Grade ONLY against the rubric.

FOLLOW-UPS — after they commit
Once a final answer is locked, ask {{followUps}} in order, one at a time (typical chain: bias a parameter, generalize to N, change the dependence structure, or ask for the variance/intuition). Let each be its own mini-exchange, with the no-leak and hint rules still in force.

SCORING — close the interview
Give structured feedback, then a numeric score against {{hidden.rubric}}. Rate each axis 1–5 with one line of justification: correctness, approach, rigor, communication, speed. Then give an overall 1–5 (a hire-signal read, not a raw average). Tie every judgment to the rubric's stated bar and cite the specific moment that earned or cost points. Be candid and specific — fair-but-pressured to the end.

INJECTION NOTE
At runtime the live feature replaces every {{...}} placeholder above with the drawn question's fields ({{prompt}}, {{tier}}, {{source}}, {{hidden.*}}, {{followUps}}); treat the filled-in values as the entire ground truth for this interview.`

const generatorPrompt = `ROLE
You generate ONE fresh, hard, real-quant-style EXPECTED-VALUE interview question on demand, to top up a pre-built pool without ever repeating one a student has seen. Every question you emit must be (a) a realistic quant-interview question anchored to this concept's Green-Book topics, (b) engine-verifiable before it is served, and (c) structurally new versus an avoid-list. If you cannot satisfy all three, you REFUSE (see SELF-REJECTION). Output is a single JSON object and nothing else.

SCOPE — only these Green-Book Expected-Value topics
- Weighted-average / fair value of a bet: E[X]=Σx·P(x); the fair price to pay to play.
- Linearity: E[X+Y]=E[X]+E[Y], including DEPENDENT summands (independence NOT required).
- Indicator variables: E[1_A]=P(A), and the "a count is 1+Σ indicators" trick.
- Conditional / total expectation: E[X]=ΣE[X|case]·P(case), including SELF-REFERENTIAL games that restart.
- Coupon collector: N·H_N (and distinct-faces-after-m-draws).
- Order statistics / extremes: E[max]=n/(n+1), E[min]=1/(n+1); ants-on-a-string pass-through.

REAL-QUANT-STYLE (mandatory, hard fence — ADR-0005)
Model every question on the actual quant-interview canon: dice / card / coin games, coupon collection, noodles-in-a-bowl, first-ace, ants-on-a-string, fair-value-of-a-bet. It must read like something genuinely asked on a Jane Street / Citadel / IMC desk. NEVER invent an arbitrary puzzle that merely happens to be engine-solvable — real-quant-style grounding is not optional.

PREFER TEMPLATES (first choice); free-form only as a fallback
First, try to PARAMETERIZE an existing engine-backed template (set template.id + template.params), since templates are inherently verifiable. The engine-backed forms and the function each maps to:
- fair-value / weighted average  → expectedValue(pmf)
- conditional game               → totalExpectation(cases) with literal \`value\` cases
- self-referential / restart game → totalExpectation(cases) with a \`restart:{add}\` case (worth add + E[X])
- expected count via indicators  → indicatorExpectation(p) and/or expectedValue, assembling 1+Σ
- coupon collector               → couponCollector(N); distinct after m draws → distinctAfterDraws(N, m); H_N → harmonic(N)
- order statistics / ants        → orderStatUniform(n)
- connected-noodle loops         → noodleLoops(n)
Emit a free-form question ONLY if no template fits — and it STILL must pass engine verification below, with fingerprint "sem:<hash>".

ENGINE-VERIFY-BEFORE-SERVE (second hard fence — ADR-0005)
Your output MUST carry the exact data to reproduce the answer with src/engine/expectation.ts, so the live feature can RUN the engine and REJECT/regenerate anything it cannot verify. In engineCheck put: module = "src/engine/expectation.ts"; calls = the exact function call(s) with concrete integer / Rational args (Rational is {n,d}); answer = the exact value the engine returns. The engine is EXACT-RATIONAL — every graded answer must be a clean rational. Signatures + ranges:
- expectedValue(pmf: {x:Rational, p:Rational}[]) → Rational. The p's must sum to exactly 1.
- totalExpectation(cases: {p:Rational, value?:Rational, restart?:{add:Rational}}[]) → Rational. A \`restart\` case banks \`add\` and replays the SAME game (worth add + E[X]); with ≥1 restart the engine solves (1 − Σp_restart)·E = RHS. The p's must sum to 1; keep Σp_restart < 1.
- indicatorExpectation(p: Rational) → Rational.
- harmonic(n) → Rational; couponCollector(n) → n·H_n. Keep n ≤ ~12 (number-based rationals overflow beyond that).
- distinctAfterDraws(N, m) → Rational = N(1 − ((N−1)/N)^m). Keep N^m ≤ ~1e14.
- orderStatUniform(n) → {max: n/(n+1), min: 1/(n+1)}. Exact for any reasonable n.
- noodleLoops(n) → Σ 1/(2k−1). Keep n ≤ ~8. The famous "100 noodles ≈ 3.28" value is DECIMAL/ASYMPTOTIC only — never emit it as an exact-rational graded answer.
HARD RANGE RULE: keep all parameters inside the exact-rational ranges above, and NEVER emit an irrational EV as a graded answer (e.g. the continuous-uniform gap √(2/π) is not engine-representable). If the natural answer is irrational or out-of-range, switch to a parameterization whose answer is an exact rational, or REFUSE.

AVOID-LIST / NO-OVERLAP
You are given avoidList: an array of fingerprints (the student's seen-set ∪ the global pool). Your question's fingerprint MUST NOT be in avoidList. Fingerprint = "<templateId>:<normalized-params>" for a template (normalize params to a canonical order/representative so trivial re-parameterizations collide), or "sem:<hash>" for free-form (hash the structural semantics, not the wording, so reworded duplicates collide). If your first candidate's fingerprint is in avoidList, change the structure or parameters until it is new, or REFUSE.

OUTPUT SCHEMA (emit EXACTLY this one JSON object — no prose, no code fences; comments below are explanatory only)
{
  "tier": "hard | harder | brutal",
  "fingerprint": "<templateId>:<normalized-params>  |  sem:<hash>",
  "template": { "id": "<templateId>", "params": { } },
  "prompt": "the question text shown to the candidate",
  "source": "Green Book p.<n> §<x>  |  <real quant-interview source> (GB-anchored to §<x>)",
  "engineCheck": {
    "module": "src/engine/expectation.ts",
    "calls": [ "exact call(s) with concrete int/Rational args, e.g. couponCollector(6)" ],
    "answer": "<exact rational the engine returns, e.g. 147/10>"
  },
  "hidden": {
    "answer": "<exact answer; identical value to engineCheck.answer>",
    "approaches": [ "accepted solution path 1", "alternate accepted path 2" ],
    "wrongTurns": [ "common misconception 1", "common misconception 2" ],
    "hintLadder": [ "nudge", "stronger", "near-reveal" ],
    "rubric": {
      "correctness": "what a correct answer must contain",
      "approach": "what a strong method looks like",
      "rigor": "assumptions stated / convergence justified / cases weighted by P(case)",
      "communication": "clarity of the think-aloud",
      "speed": "the pace bar for this tier"
    }
  },
  "followUps": [ "first follow-up (e.g. bias it / generalize to N)", "second follow-up" ]
}

FIELD RULES
- tier: tag honestly; the floor is "hard" (always harder than any lesson's mastery challenge). "harder"/"brutal" add cross-topic synthesis or nastier parameters.
- hintLadder: EXACTLY 3 rungs, escalating nudge → stronger → near-reveal. The near-reveal points at the METHOD/structure ONLY — it must NOT state the final number or the closed form's value.
- followUps: a real chain (≥1, ideally 2–3): bias a parameter, generalize to N, change the dependence, or ask for variance/intuition.
- hidden.answer MUST equal engineCheck.answer exactly (the verified rational).
- source: anchor to the Green-Book section the topic comes from, or a sourced real quant-interview question GB-anchored to that section.

SELF-REJECTION (never serve an unverifiable or off-fence question)
If you cannot produce a question that is simultaneously (a) real-quant-style + Green-Book-anchored, (b) engine-verifiable within the exact-rational range, and (c) structurally new vs avoidList — do NOT emit a question. Instead output exactly:
{ "refusal": true, "reason": "<one line: which fence failed — not-anchored | not-engine-verifiable | out-of-range/irrational | no-new-fingerprint>" }
An honest refusal beats an unverifiable or repeated question.`

// ── Template metadata ─────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: 'tmpl-fair-value',        title: 'Fair price of a one-shot bet (weighted average)',                                       source: 'Green Book §4.4 p.44 (Table 4.2) + fair die p.62 + §4.5 p.47 (pmf by counting)', description: 'Compute E[X]=Σx·P(x) for a discrete bet; compare to the fair price to determine edge.' },
  { id: 'tmpl-linearity',         title: 'Linearity of expectation over dependent (and independent) sums',                        source: 'Green Book §4.5 p.47–48',                                                         description: 'Apply E[ΣXᵢ]=ΣE[Xᵢ] without independence; noodle-loop and k-dice variants.' },
  { id: 'tmpl-indicator',         title: 'Indicator method — turn a count into 1 + Σ E[Iᵢ]',                                     source: 'Green Book §2.7 p.31 + §4.5 p.48 + p.49–50',                                     description: 'First-special-card position and distinct-symbols count via indicator decomposition.' },
  { id: 'tmpl-total-expectation', title: 'Condition on the first step (incl. self-referential fixed points)',                     source: 'Green Book §4.5 p.47 + p.48 + p.62',                                             description: 'Total expectation with geometric waits and self-referential restart games.' },
  { id: 'tmpl-coupon-collector',  title: 'Coupon collector — a full set is a sum of ever-longer geometric waits',                 source: 'Green Book §4.5 p.49–50',                                                         description: 'N·H_N expected draws for a full set; partial-completion variant from holding j.' },
  { id: 'tmpl-order-statistics',  title: 'Extremes of n IID Uniform(0,1) — max, min, range, and the relabel trick',              source: 'Green Book §4.6 p.50–51 + p.52',                                                  description: 'E[max]=n/(n+1), E[min]=1/(n+1); ants-on-a-string via the pass-through relabeling.' },
]

// ── Shared template rubrics / follow-ups ─────────────────────────────────────

const T1_RUBRIC  = { correctness: 'matches engine E[X] exactly', approach: 'uses Σx·P(x), not the label midpoint', rigor: 'weights stated correctly (esp. counted pmf for max/min rows)', communication: 'explains balance-point intuition', speed: 'reaches a clean fraction without enumeration drift' }
const T1_WRONG   = ['average = middle of the labels', 'mean = mode', 'average must be an attainable/rollable value', 'every outcome equally likely']
const T1_FOLLOWS = ['Now the ticket costs the fair price plus a cent — how big an edge per play is that?', 'Bias the die toward 6 — does the fair price rise or fall, and by how much?', "What's the median payout here, and why does it differ from the mean?"]

const T2_RUBRIC  = { correctness: 'matches engine value exactly', approach: 'invokes linearity without independence', rigor: "identifies each summand's expectation correctly", communication: "states the dependence-doesn't-matter point", speed: 'no attempt to build the joint pmf' }
const T2_WRONG   = ['linearity needs independence', 'the SUM rule (like the PRODUCT rule) needs independence', 'must build the joint pmf first', 'more ties ⇒ proportionally more loops']
const T2_FOLLOWS = ['If the summands WERE independent, would the answer change? (No — say why.)', 'How fast does the noodle answer grow with n? (≈ ½·ln n — derive the asymptotic.)', 'Replace fair dice with biased ones, E[die]=μ — restate the sum.']

const T3_RUBRIC  = { correctness: 'matches engine exactly', approach: 'uses indicators + linearity, not enumeration', rigor: 'justifies the per-indicator probability (gaps / miss-prob)', communication: 'explains why a count becomes a sum of P\'s', speed: 'avoids building a full position distribution' }
const T3_WRONG   = ["probability and expectation are different machines", "a count can't be an expectation", 'must build the joint pmf first', 'every outcome equally likely']
const T3_FOLLOWS = ['Generalize the first-special answer to arbitrary (D, A).', 'Distinct-symbols: what m gives expected distinct = N/2?', 'As m→∞ what does E[distinct] approach, and how fast?']

const T4_RUBRIC  = { correctness: 'matches engine fixed point exactly', approach: 'weights by P(case); recognizes the self-reference', rigor: 'sets up and correctly solves the linear equation; probabilities sum to 1', communication: 'explains why the loop converges (geometric decay)', speed: 'isolates E without expanding the infinite series' }
const T4_WRONG   = ['weight by the case VALUE not P(case)', 'the re-roll case is worth just its face', "can't solve — E[X] on both sides", 'infinite re-rolls ⇒ unbounded value', 'conditioning = Bayes updating']
const T4_FOLLOWS = ['Prove the self-referential equation converges (why the geometric tail is finite).', 'Generalize: STOP set of size t on a d-sided die, paid cumulatively — give E in terms of d, t.', 'Make the die biased toward the reroll faces — does the value rise or fall?']

const T5_RUBRIC  = { correctness: 'matches engine N·H exactly', approach: 'sum of geometric stage waits via linearity', rigor: 'per-stage success prob (N−k)/N stated correctly', communication: 'explains last-type dominance / super-linear growth', speed: 'computes H cleanly, no off-by-one in the stage count' }
const T5_WRONG   = ['a full set ≈ N boxes', 'each new type takes the same time / last type as quick as first', 'chance a box is new stays 1/N', 'double the types ⇒ double the boxes']
const T5_FOLLOWS = ['How does the full-set cost grow with N? (≈ N·ln N — derive it.)', 'What single stage contributes the most, and how much?', 'Double the number of types — does the cost double? Quantify.']

const T6_RUBRIC  = { correctness: 'matches engine fraction exactly', approach: 'order-stat CDF or gap-symmetry; relabel for ants', rigor: 'distinguishes max from min; max<1 for finite n', communication: 'explains saturation toward 1 / the relabel insight', speed: 'no integration errors; clean fraction' }
const T6_WRONG   = ['E[max]=1/2', 'E[max]=1', 'E[max] grows without bound', 'min of n ≈ 1/n', 'more ants ⇒ proportionally more time']
const T6_FOLLOWS = ['What do E[max] and E[range] approach as n→∞, and how fast?', 'For the ants, does doubling the ant count roughly double the time? (No — explain.)', 'Give E[k-th smallest] of n Uniform(0,1) in general.']

// ── Question records ──────────────────────────────────────────────────────────

type Tier = 'hard' | 'harder' | 'brutal'
interface Rubric { correctness: string; approach: string; rigor: string; communication: string; speed: string }
interface QuestionRecord {
  id: string
  tier: Tier
  fingerprint: string
  template?: { id: string; params: Record<string, unknown> }
  prompt: string
  source: string
  engineCheck: { module: string; calls: string[]; answer: string; verified: boolean }
  hidden: { answer: string; approaches: string[]; wrongTurns: string[]; hintLadder: [string, string, string]; rubric: Rubric }
  followUps: string[]
}

function mkQ(
  id: string, tier: Tier, fingerprint: string, prompt: string, source: string,
  template: { id: string; params: Record<string, unknown> } | undefined,
  calls: string[], answer: string,
  approaches: string[], wrongTurns: string[], hintLadder: [string,string,string],
  rubric: Rubric, followUps: string[]
): QuestionRecord {
  return { id, tier, fingerprint, ...(template ? { template } : {}), prompt, source,
    engineCheck: { module: ENG, calls, answer, verified: true },
    hidden: { answer, approaches, wrongTurns, hintLadder, rubric }, followUps }
}

const T1_SRC  = 'Green Book §4.4 p.44 (Table 4.2) + fair die p.62 + §4.5 p.47'
const T2_SRC  = 'Green Book §4.5 p.47–48'
const T3_SRC  = 'Green Book §2.7 p.31 + §4.5 p.48 + p.49–50'
const T4_SRC  = 'Green Book §4.5 p.47 + p.48 + p.62'
const T5_SRC  = 'Green Book §4.5 p.49–50'
const T6_SRC  = 'Green Book §4.6 p.50–51 + p.52'

const questions: QuestionRecord[] = [

  // ── T1 row 3: loaded die P(6)=1/2, others 1/10 each; price $4 ────────────
  mkQ('tmpl-fair-value#loaded-high6', 'hard',
    tplFp('tmpl-fair-value', { game:'loaded-die-high6', price:4 }),
    'You\'re making a market on a one-shot game: you roll a loaded 6-sided die where P(6)=1/2 and faces 1–5 each have probability 1/10. The payout X equals the face shown. A counterparty will sell you one ticket for $4. What\'s the fair value E[X], and is $4 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { loadedFace:6, loadedP:'1/2', otherP:'1/10', price:4 } },
    ['expectedValue([{x:1,p:1/10},{x:2,p:1/10},{x:3,p:1/10},{x:4,p:1/10},{x:5,p:1/10},{x:6,p:1/2}])'], t1r3,
    ['List all outcomes, weight each by P(x), sum — E[X]=1·(1/10)+2·(1/10)+3·(1/10)+4·(1/10)+5·(1/10)+6·(1/2)=9/2.', 'Balance-point reading: the heavy weight on 6 pulls the fulcrum well above the label midpoint 3.5.', 'Compare E[X]=9/2=$4.50 to price $4; the ticket is cheap — edge = $0.50 per play.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — each payout pulls on the balance point in proportion to its probability.', 'Write E[X]=Σ x·P(x): pair every payout with its weight — faces 1–5 get 1/10 each, face 6 gets 1/2.', 'Multiply each face by its probability and sum all six products; the heavy weight on 6 shifts the mean well above 3.5.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T1 row 4: loaded die P(1)=1/2, others 1/10 each; price $3 ────────────
  mkQ('tmpl-fair-value#loaded-low1', 'hard',
    tplFp('tmpl-fair-value', { game:'loaded-die-low1', price:3 }),
    'You\'re making a market on a one-shot game: you roll a loaded 6-sided die where P(1)=1/2 and faces 2–6 each have probability 1/10. The payout X equals the face shown. A counterparty will sell you one ticket for $3. What\'s the fair value E[X], and is $3 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { loadedFace:1, loadedP:'1/2', otherP:'1/10', price:3 } },
    ['expectedValue([{x:1,p:1/2},{x:2,p:1/10},{x:3,p:1/10},{x:4,p:1/10},{x:5,p:1/10},{x:6,p:1/10}])'], t1r4,
    ['List all outcomes, weight each by P(x), sum — E[X]=1·(1/2)+2·(1/10)+3·(1/10)+4·(1/10)+5·(1/10)+6·(1/10)=5/2.', 'Balance-point reading: the heavy weight on 1 drags the fulcrum well below the label midpoint 3.5.', 'Compare E[X]=5/2=$2.50 to price $3; the ticket is rich — edge is −$0.50 per play.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — each payout pulls on the balance point in proportion to its probability.', 'Write E[X]=Σ x·P(x): face 1 gets weight 1/2, faces 2–6 each get 1/10.', 'Multiply each face by its probability and sum all six products; the heavy weight on 1 shifts the mean well below 3.5.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T1 row 5: wheel $1@1/2, $5@1/3, $11@1/6; price $4 ───────────────────
  mkQ('tmpl-fair-value#wheel-3tier', 'hard',
    tplFp('tmpl-fair-value', { game:'wheel-1-5-11', price:4 }),
    'You\'re making a market on a one-shot game: you spin a three-sector wheel. The payout X has this distribution: X=$1 with prob 1/2, X=$5 with prob 1/3, X=$11 with prob 1/6. A counterparty will sell you one ticket for $4. What\'s the fair value E[X], and is $4 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { payouts:'1@1/2+5@1/3+11@1/6', price:4 } },
    ['expectedValue([{x:1,p:1/2},{x:5,p:1/3},{x:11,p:1/6}])'], t1r5,
    ['List all outcomes, weight each: 1·(1/2)+5·(1/3)+11·(1/6)=3/6+10/6+11/6=24/6=4.', 'Balance-point: the three weights balance at exactly 4 — neither cheap nor rich.', 'The midpoint of labels ($6) is irrelevant; the probability-weighted sum is what matters.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — each payout pulls on the balance point in proportion to its probability.', 'Write E[X]=Σ x·P(x): pair each of the three payouts with its probability fraction.', 'Multiply each payout by its probability (convert to sixths: 3/6, 2/6, 1/6) and sum — the label midpoint $6 is irrelevant.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T1 row 6: lottery $0@1/2,$10@1/4,$20@1/8,$40@1/8; price $10 ─────────
  mkQ('tmpl-fair-value#lottery-4tier', 'harder',
    tplFp('tmpl-fair-value', { game:'lottery-0-10-20-40', price:10 }),
    'You\'re making a market on a one-shot game: you buy a four-tier lottery ticket. The payout X has this distribution: X=$0 with prob 1/2, X=$10 with prob 1/4, X=$20 with prob 1/8, X=$40 with prob 1/8. A counterparty will sell you one ticket for $10. What\'s the fair value E[X], and is $10 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { payouts:'0@1/2+10@1/4+20@1/8+40@1/8', price:10 } },
    ['expectedValue([{x:0,p:1/2},{x:10,p:1/4},{x:20,p:1/8},{x:40,p:1/8}])'], t1r6,
    ['List all outcomes: 0·(1/2)+10·(1/4)+20·(1/8)+40·(1/8)=0+5/2+5/2+5=10. The ticket is exactly fairly priced.', 'Balance-point: the large $40 tier (1/8 weight) compensates for the heavy 50% zero-payout floor.', 'The midpoint $20 is irrelevant; the probability-weighted sum determines fair value.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — each payout pulls on the balance point in proportion to its probability.', 'Write E[X]=Σ x·P(x): pair each of the four payouts with its probability (eighths help: 4/8, 2/8, 1/8, 1/8).', 'Multiply each payout by its weight and sum; note 50% of the time X=0, which drags the mean down significantly from the label midpoint.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T1 row 7: max of two fair dice; price $5 ──────────────────────────────
  mkQ('tmpl-fair-value#max-two-d6', 'harder',
    tplFp('tmpl-fair-value', { game:'max-of-two-d6', price:5 }),
    'You\'re making a market on a one-shot game: you roll two fair dice and collect the LARGER face value. The payout X = max(D1, D2) has distribution P(X=k)=(2k−1)/36 for k=1,2,3,4,5,6. A counterparty will sell you one ticket for $5. What\'s the fair value E[X], and is $5 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { game:'max-of-two-d6', price:5 } },
    ['expectedValue([{x:k,p:(2k-1)/36} for k=1..6]) where P(max=k)=(2k-1)/36'], t1r7,
    ['Build the max pmf by counting ordered pairs: P(max=k)=(2k−1)/36; then Σk·(2k−1)/36=161/36≈4.47.', 'Balance-point: the max is biased upward (skewed right) since each realization is the larger of two draws.', 'Compare 161/36≈$4.47 to price $5: the ticket is rich — negative edge of ≈$0.53 per play.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — count how often each face k is the MAXIMUM.', 'Build the pmf: out of 36 ordered pairs, P(max=k)=(2k−1)/36 (the number of pairs where at least one die equals k and none exceeds k).', 'Once you have P(max=k) for k=1..6, compute Σk·(2k−1)/36 — the label midpoint 3.5 badly underestimates the maximum\'s mean.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T1 row 8: min of two fair dice; price $3 ──────────────────────────────
  mkQ('tmpl-fair-value#min-two-d6', 'harder',
    tplFp('tmpl-fair-value', { game:'min-of-two-d6', price:3 }),
    'You\'re making a market on a one-shot game: you roll two fair dice and collect the SMALLER face value. The payout X = min(D1, D2) has distribution P(X=k)=(13−2k)/36 for k=1,2,3,4,5,6. A counterparty will sell you one ticket for $3. What\'s the fair value E[X], and is $3 cheap, fair, or rich? Justify why E[X] isn\'t just the middle of the payout range.',
    T1_SRC,
    { id: 'tmpl-fair-value', params: { game:'min-of-two-d6', price:3 } },
    ['expectedValue([{x:k,p:(13-2k)/36} for k=1..6]) where P(min=k)=(13-2k)/36'], t1r8,
    ['Build the min pmf: P(min=k)=(13−2k)/36; then Σk·(13−2k)/36=91/36≈2.53.', 'Balance-point: the min is biased downward (skewed left) since each realization is the smaller of two draws.', 'Compare 91/36≈$2.53 to price $3: the ticket is rich — negative edge per play.'],
    T1_WRONG,
    ['An average isn\'t the midpoint of the labels — count how often each face k is the MINIMUM.', 'Build the pmf: out of 36 ordered pairs, P(min=k)=(13−2k)/36 (the pairs where at least one die shows k and neither shows less than k).', 'Once you have P(min=k) for k=1..6, compute Σk·(13−2k)/36 — the label midpoint 3.5 badly overestimates the minimum\'s mean.'],
    T1_RUBRIC, T1_FOLLOWS),

  // ── T2 noodles n=4 ────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#noodles-4', 'harder',
    tplFp('tmpl-linearity', { n:4, type:'noodles' }),
    'There are 4 loose noodles in a bowl (8 free ends). Blindfolded, you repeatedly tie two random free ends together until none remain. How many closed loops do you expect to form? Note the ties are NOT independent — each tie changes what\'s left — yet you should never track the tangle.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { n:4, type:'noodles' } },
    ['noodleLoops(4)'], t2n4,
    ['At each tie with j free ends remaining, P(closing a loop)=1/(j−1); sum over all 4 ties: 1/7+1/5+1/3+1/1=176/105.', 'Define indicator Iₖ=\'tie k closes a loop\'; E[loops]=ΣE[Iₖ] by linearity, no independence required.', 'Each contribution 1/(2k−1) for k=1..4 adds the chance a given tie closes rather than opens a new chain.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Break the total into one tiny bet per tie and add their expectations; for each tie with j free ends left, ask \'what\'s the chance THIS tie closes a loop?\'', 'Write the answer as a sum of per-tie expectations: the loop-closing chance at each of the 4 ties (odd denominators 1,3,5,7), summed together.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 noodles n=5 ────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#noodles-5', 'harder',
    tplFp('tmpl-linearity', { n:5, type:'noodles' }),
    'There are 5 loose noodles in a bowl (10 free ends). Blindfolded, you repeatedly tie two random free ends together until none remain. How many closed loops do you expect to form? Note the ties are NOT independent — each tie changes what\'s left — yet you should never track the tangle.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { n:5, type:'noodles' } },
    ['noodleLoops(5)'], t2n5,
    ['At each tie with j free ends remaining, P(closing)=1/(j−1); sum over 5 ties: 1/9+1/7+1/5+1/3+1/1=563/315.', 'Define indicator Iₖ for tie k closing; E[loops]=ΣE[Iₖ] by linearity, dependence between ties is irrelevant.', 'Σ_{k=1}^{5} 1/(2k−1) = 1+1/3+1/5+1/7+1/9 (summed in reverse tie-order).'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Break the total into one tiny bet per tie and add their expectations; for each tie with j free ends left, ask \'what\'s the chance THIS tie closes a loop?\'', 'Write the answer as a sum of per-tie expectations: the loop-closing chance at each of the 5 ties (odd denominators 1,3,5,7,9), summed together.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 noodles n=7 ────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#noodles-7', 'brutal',
    tplFp('tmpl-linearity', { n:7, type:'noodles' }),
    'There are 7 loose noodles in a bowl (14 free ends). Blindfolded, you repeatedly tie two random free ends together until none remain. How many closed loops do you expect to form? Note the ties are NOT independent — each tie changes what\'s left — yet you should never track the tangle.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { n:7, type:'noodles' } },
    ['noodleLoops(7)'], t2n7,
    ['At each tie with j free ends remaining, P(closing)=1/(j−1); sum over 7 ties: Σ_{k=1}^{7} 1/(2k−1) = 1+1/3+1/5+1/7+1/9+1/11+1/13 = 88069/45045.', 'Linearity of expectation makes this a clean sum of independent per-tie indicator expectations even though the ties are correlated.', 'LCM(1,3,5,7,9,11,13)=45045; each odd-reciprocal term contributes an exact rational.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Break the total into one tiny bet per tie and add their expectations; with j free ends left, the chance THIS tie closes a loop is 1/(j−1).', 'Write the answer as a sum of 7 per-tie expectations: the odd denominators 1,3,5,7,9,11,13 (descending tie order); the exact rational sum uses LCM=45045.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 noodles n=8 ────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#noodles-8', 'brutal',
    tplFp('tmpl-linearity', { n:8, type:'noodles' }),
    'There are 8 loose noodles in a bowl (16 free ends). Blindfolded, you repeatedly tie two random free ends together until none remain. How many closed loops do you expect to form? Note the ties are NOT independent — each tie changes what\'s left — yet you should never track the tangle.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { n:8, type:'noodles' } },
    ['noodleLoops(8)'], t2n8,
    ['Σ_{k=1}^{8} 1/(2k−1) = 1+1/3+1/5+1/7+1/9+1/11+1/13+1/15 = 91072/45045.', 'Linearity over the 8 tie-closing indicators gives the exact sum; dependence between ties is irrelevant.', 'LCM(1,3,...,15)=45045; add 1/15 to the n=7 result 88069/45045 to get 91072/45045.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Break the total into one tiny bet per tie and add their expectations; with j free ends left, the chance THIS tie closes a loop is 1/(j−1).', 'Write the answer as a sum of 8 per-tie expectations: odd denominators 1,3,5,7,9,11,13,15; using LCM=45045 gives the exact fraction.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 k=4 dice ───────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#sum-4dice', 'hard',
    tplFp('tmpl-linearity', { k:4, type:'k-dice-sum' }),
    'You roll 4 fair dice and sum them. Give the expected total in one line, and state precisely why you don\'t need the 4-dice sum distribution to do it.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { k:4, type:'k-dice-sum' } },
    ['ratMul(R(4), expectedValue(DIE))'], t2k4,
    ['E[sum of 4 dice] = E[D1]+E[D2]+E[D3]+E[D4] = 4·(7/2) = 14 by linearity.', 'Independence of the dice is not required for linearity of expectation — E[ΣXᵢ]=ΣE[Xᵢ] holds always.', 'One line: 4·(7/2)=14. No need to enumerate the 6⁴=1296 outcomes.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Each die contributes its own mean 7/2; those four means add regardless of how the dice are related.', 'Write it as 4 copies of one die\'s mean 7/2 — multiply the number of dice by 7/2 to get the total; no need to enumerate the 6⁴ joint outcomes.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 k=6 dice ───────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#sum-6dice', 'harder',
    tplFp('tmpl-linearity', { k:6, type:'k-dice-sum' }),
    'You roll 6 fair dice and sum them. Give the expected total in one line, and state precisely why you don\'t need the 6-dice sum distribution to do it.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { k:6, type:'k-dice-sum' } },
    ['ratMul(R(6), expectedValue(DIE))'], t2k6,
    ['E[sum of 6 dice] = 6·E[one die] = 6·(7/2) = 21 by linearity.', 'No independence assumption needed; E[ΣXᵢ]=ΣE[Xᵢ] holds regardless.', 'One line: 6·(7/2)=21. The 6⁶ joint distribution is irrelevant.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Each die contributes its own mean 7/2; those six means add regardless of how the dice are related.', 'Write it as 6 copies of one die\'s mean 7/2 — multiply the number of dice by 7/2 to get the total; the 6⁶ joint distribution is irrelevant.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T2 k=10 dice ──────────────────────────────────────────────────────────
  mkQ('tmpl-linearity#sum-10dice', 'harder',
    tplFp('tmpl-linearity', { k:10, type:'k-dice-sum' }),
    'You roll 10 fair dice and sum them. Give the expected total in one line, and state precisely why you don\'t need the 10-dice sum distribution to do it.',
    T2_SRC,
    { id: 'tmpl-linearity', params: { k:10, type:'k-dice-sum' } },
    ['ratMul(R(10), expectedValue(DIE))'], t2k10,
    ['E[sum of 10 dice] = 10·(7/2) = 35 by linearity.', 'No independence needed; adding ten means requires only linearity, not a joint pmf.', 'One line: 10·(7/2)=35.'],
    T2_WRONG,
    ['You never need the joint distribution — expectations of a sum add even when the parts are dependent.', 'Each die contributes its own mean 7/2; those ten means add regardless of how the dice are related.', 'Write it as 10 copies of one die\'s mean 7/2 — multiply the number of dice by 7/2 to get the total; no joint pmf required.'],
    T2_RUBRIC, T2_FOLLOWS),

  // ── T3: first-special D=54, A=2 (2 jokers) ───────────────────────────────
  mkQ('tmpl-indicator#first-D54-A2', 'harder',
    tplFp('tmpl-indicator', { A:2, D:54, type:'first-special' }),
    'Shuffle a 54-card deck (standard 52 cards + 2 Jokers) and flip cards one at a time. On average, at what position does the FIRST Joker appear? Use indicators, not a messy sum — argue from how the 2 Jokers cut the deck into equal gaps.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { D:54, A:2, description:'first-joker-in-54-card-deck' } },
    ['reduce(55, 3)'], t3fs1,
    ['2 Jokers split the 54-card deck into 3 equal gaps; the expected lead-gap length is 52/3, so E[first Joker]=1+52/3=55/3≈18.3.', 'Indicator Iᵢ=\'non-Joker i precedes all 2 Jokers\', P(Iᵢ)=1/3; E=1+52·(1/3)=55/3.', 'General formula: E[first of A specials in D-card deck]=(D+1)/(A+1)=55/3.'],
    T3_WRONG,
    ['A \'how many / how deep\' count is an expectation in disguise — attach a 0/1 indicator to each non-Joker card.', 'The 2 Jokers cut the 54-card deck into 3 equally-likely gaps; ask the expected length of the gap before the first Joker.', 'Add 1 (for the Joker itself) plus, for each of the 52 non-Jokers, its 1/3 chance of appearing before every Joker — i.e. 1+52·(1/3); the general closed form is (D+1)/(A+1).'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: first-special D=52, A=12 (face cards J/Q/K) ──────────────────────
  mkQ('tmpl-indicator#first-D52-A12', 'harder',
    tplFp('tmpl-indicator', { A:12, D:52, type:'first-special' }),
    'Shuffle a standard 52-card deck and flip cards one at a time. On average, at what position does the FIRST face card (Jack, Queen, or King) appear? Use indicators, not a messy sum — argue from how the 12 face cards cut the deck into equal gaps.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { D:52, A:12, description:'first-face-card-J-Q-K' } },
    ['reduce(53, 13)'], t3fs2,
    ['12 face cards split the 52-card deck into 13 equal gaps; expected lead-gap length=40/13, so E[first face card]=1+40/13=53/13≈4.08.', 'Indicator Iᵢ=\'non-face card i precedes all 12 face cards\', P=1/13; E=1+40·(1/13)=53/13.', 'General formula (D+1)/(A+1)=53/13.'],
    T3_WRONG,
    ['A \'how many / how deep\' count is an expectation in disguise — attach a 0/1 indicator to each non-face card.', 'The 12 face cards cut the deck into 13 equally-likely gaps; find the expected length of the gap before the first face card.', 'Add 1 (for the face card itself) plus, for each of the 40 non-face cards, its 1/13 chance of appearing before every face card — i.e. 1+40·(1/13); the general closed form is (D+1)/(A+1).'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: first-special D=52, A=8 (aces+kings) ─────────────────────────────
  mkQ('tmpl-indicator#first-D52-A8', 'harder',
    tplFp('tmpl-indicator', { A:8, D:52, type:'first-special' }),
    'Shuffle a standard 52-card deck and flip cards one at a time. On average, at what position does the FIRST ace or king appear? Use indicators, not a messy sum — argue from how the 8 special cards cut the deck into equal gaps.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { D:52, A:8, description:'first-ace-or-king' } },
    ['reduce(53, 9)'], t3fs3,
    ['8 special cards (4 aces + 4 kings) split the deck into 9 equal gaps; expected lead-gap=44/9, so E[first special]=1+44/9=53/9≈5.89.', 'Indicator Iᵢ=\'non-special i precedes all 8 specials\', P=1/9; E=1+44·(1/9)=53/9.', 'General formula: (D+1)/(A+1)=53/9.'],
    T3_WRONG,
    ['A \'how many / how deep\' count is an expectation in disguise — attach a 0/1 indicator to each of the 44 non-special cards.', 'The 8 special cards cut the 52-card deck into 9 equally-likely gaps; find the expected length of the gap before the first special.', 'Add 1 plus, for each of the 44 non-specials, its 1/9 chance of appearing before every special — i.e. 1+44·(1/9); the general closed form is (D+1)/(A+1).'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: first-special D=40, A=4 (Spanish deck, first ace) ────────────────
  mkQ('tmpl-indicator#first-D40-A4', 'harder',
    tplFp('tmpl-indicator', { A:4, D:40, type:'first-special' }),
    'Shuffle a 40-card Spanish deck and flip cards one at a time. On average, at what position does the FIRST ace appear? Use indicators, not a messy sum — argue from how the 4 aces cut the deck into equal gaps.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { D:40, A:4, description:'first-ace-spanish-deck' } },
    ['reduce(41, 5)'], t3fs4,
    ['4 aces split the 40-card deck into 5 equal gaps; expected lead-gap=36/5, so E[first ace]=1+36/5=41/5=8.2.', 'Indicator Iᵢ=\'non-ace i precedes all 4 aces\', P=1/5; E=1+36·(1/5)=41/5.', 'General formula: (D+1)/(A+1)=41/5.'],
    T3_WRONG,
    ['A \'how many / how deep\' count is an expectation in disguise — attach a 0/1 indicator to each of the 36 non-ace cards.', 'The 4 aces cut the 40-card deck into 5 equally-likely gaps; find the expected length of the gap before the first ace.', 'Add 1 (for the ace itself) plus, for each of the 36 non-aces, its 1/5 chance of appearing before every ace — i.e. 1+36·(1/5); the general closed form is (D+1)/(A+1).'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: distinct N=6, m=3 ─────────────────────────────────────────────────
  mkQ('tmpl-indicator#distinct-N6-m3', 'harder',
    tplFp('tmpl-indicator', { N:6, m:3, type:'distinct' }),
    'A machine emits one of 6 equally-likely symbols (die faces 1–6) per pull (with replacement). After 3 pulls, how many DISTINCT symbols do you expect to have seen? Set it up as a sum of \'symbol i appeared\' indicators.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { N:6, m:3, type:'distinct' } },
    ['distinctAfterDraws(6, 3)'], t3d1,
    ['Iᵢ=\'symbol i appeared at least once in 3 pulls\', P(Iᵢ)=1−(5/6)³=91/216; E[distinct]=6·(91/216)=91/36.', 'E[distinct]=N·(1−((N−1)/N)^m)=6·(1−125/216)=6·91/216=91/36.', 'Sum over the 6 indicator expectations; independence of Iᵢ\'s is NOT required — linearity handles it.'],
    T3_WRONG,
    ['A \'how many distinct\' count is an expectation in disguise — attach a 0/1 indicator to each symbol.', 'For one given symbol i, P(i appears in 3 pulls) = 1 − P(missed every pull) = 1−(5/6)³; sum this over all 6 symbols.', 'Expected distinct = 6·(1−(5/6)³), the closed form N·(1−((N−1)/N)^m); evaluate it.'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: distinct N=6, m=4 ─────────────────────────────────────────────────
  mkQ('tmpl-indicator#distinct-N6-m4', 'harder',
    tplFp('tmpl-indicator', { N:6, m:4, type:'distinct' }),
    'A machine emits one of 6 equally-likely die faces per pull (with replacement). After 4 pulls, how many DISTINCT faces do you expect to have seen? Set it up as a sum of \'face i appeared\' indicators.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { N:6, m:4, type:'distinct' } },
    ['distinctAfterDraws(6, 4)'], t3d2,
    ['P(face i seen) = 1−(5/6)⁴=671/1296; E[distinct]=6·671/1296=671/216.', 'E[distinct]=6·(1−(5/6)⁴).', 'Sum six indicator expectations; linearity removes any need for a joint distribution.'],
    T3_WRONG,
    ['A \'how many distinct\' count is an expectation in disguise — attach a 0/1 indicator to each face.', 'For one given face i, P(i appears in 4 pulls) = 1−(5/6)⁴; sum over all 6 faces.', 'Expected distinct = 6·(1−(5/6)⁴), the closed form N·(1−((N−1)/N)^m); evaluate it.'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: distinct N=6, m=6 ─────────────────────────────────────────────────
  mkQ('tmpl-indicator#distinct-N6-m6', 'brutal',
    tplFp('tmpl-indicator', { N:6, m:6, type:'distinct' }),
    'A machine emits one of 6 equally-likely die faces per pull (with replacement). After 6 pulls, how many DISTINCT faces do you expect to have seen? Set it up as a sum of \'face i appeared\' indicators.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { N:6, m:6, type:'distinct' } },
    ['distinctAfterDraws(6, 6)'], t3d3,
    ['P(face i seen) = 1−(5/6)⁶=31031/46656; E[distinct]=6·31031/46656=31031/7776.', 'E[distinct]=6·(1−(5/6)⁶).', 'Even 6 rolls of a 6-sided die leave expected distinct well below 6 (≈3.99 < 6).'],
    T3_WRONG,
    ['A \'how many distinct\' count is an expectation in disguise — attach a 0/1 indicator to each face.', 'For one given face i, P(i appears in 6 pulls) = 1−(5/6)⁶; sum over all 6 faces.', 'Expected distinct = 6·(1−(5/6)⁶); note it\'s below 6 because each face still has a (5/6)⁶ miss-probability.'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: distinct N=10, m=3 ────────────────────────────────────────────────
  mkQ('tmpl-indicator#distinct-N10-m3', 'harder',
    tplFp('tmpl-indicator', { N:10, m:3, type:'distinct' }),
    'A machine emits one of 10 equally-likely decimal digits (0–9) per pull (with replacement). After 3 pulls, how many DISTINCT digits do you expect to have seen? Set it up as a sum of \'digit i appeared\' indicators.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { N:10, m:3, type:'distinct' } },
    ['distinctAfterDraws(10, 3)'], t3d4,
    ['P(digit i seen) = 1−(9/10)³=271/1000; E[distinct]=10·271/1000=271/100.', 'E[distinct]=10·(1−(9/10)³).', 'Three pulls from 10 symbols: expected ≈2.71 distinct.'],
    T3_WRONG,
    ['A \'how many distinct\' count is an expectation in disguise — attach a 0/1 indicator to each digit.', 'For one given digit i, P(i appears in 3 pulls) = 1−(9/10)³; sum over all 10 digits.', 'Expected distinct = 10·(1−(9/10)³), the closed form N·(1−((N−1)/N)^m); evaluate it.'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T3: distinct N=13, m=4 ────────────────────────────────────────────────
  mkQ('tmpl-indicator#distinct-N13-m4', 'brutal',
    tplFp('tmpl-indicator', { N:13, m:4, type:'distinct' }),
    'Cards are drawn with replacement from an infinite deck (13 equally-likely ranks: A,2,…,K). After 4 draws, how many DISTINCT ranks do you expect to have seen? Set it up as a sum of \'rank i appeared\' indicators.',
    T3_SRC,
    { id: 'tmpl-indicator', params: { N:13, m:4, type:'distinct' } },
    ['distinctAfterDraws(13, 4)'], t3d5,
    ['P(rank i seen) = 1−(12/13)⁴=7825/28561; E[distinct]=13·7825/28561=7825/2197.', 'E[distinct]=13·(1−(12/13)⁴); note 28561=13⁴ and 2197=13³.', 'Four draws from 13 ranks: expected ≈3.56 distinct.'],
    T3_WRONG,
    ['A \'how many distinct ranks\' count is an expectation in disguise — attach a 0/1 indicator to each rank.', 'For one given rank i, P(i appears in 4 draws with replacement) = 1−(12/13)⁴; sum over all 13 ranks.', 'Expected distinct = 13·(1−(12/13)⁴), the closed form N·(1−((N−1)/N)^m); evaluate it.'],
    T3_RUBRIC, T3_FOLLOWS),

  // ── T4 row 2: geometric until first {5,6} on d6 ──────────────────────────
  mkQ('tmpl-total-expectation#geom-d6-win56', 'harder',
    tplFp('tmpl-total-expectation', { d:6, winFaces:'{5,6}', type:'geometric' }),
    'You roll a fair 6-sided die repeatedly until you first see a 5 or a 6, and you\'re paid the number of rolls it took. What\'s the expected payout? Set it up by conditioning on the first roll.',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { d:6, winFaces:'{5,6}', type:'geometric' } },
    ['totalExpectation([{p:R(1,3),value:R(1)},{p:R(2,3),restart:{add:R(1)}}])'], t4r2,
    ['Condition on first roll: win (prob 1/3) pays 1 roll; fail (prob 2/3) costs 1 roll and restarts. E = 1/3·1 + 2/3·(1+E) ⇒ E/3=1 ⇒ E=3.', 'Geometric mean: p=2/6=1/3, E=1/p=3.', 'Probabilities 1/3+2/3=1 ✓; the self-referential equation E = 1 + (2/3)·E solves in one step.'],
    T4_WRONG,
    ['Split on the first roll, average within each branch, then weight by each branch\'s probability (which must sum to 1).', 'The \'fail\' branch brings you back to the same state — so its value is 1 (this roll) plus the whole expected wait again.', 'Write E = (1/3)·1 + (2/3)·(1+E); collect the E terms on one side and solve the linear equation — equivalently E = d/s for the geometric wait.'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T4 row 3: geometric until first 1 on d20 ─────────────────────────────
  mkQ('tmpl-total-expectation#geom-d20-win1', 'harder',
    tplFp('tmpl-total-expectation', { d:20, winFaces:'{1}', type:'geometric' }),
    'You roll a fair 20-sided die repeatedly until you first see a 1, and you\'re paid the number of rolls it took. What\'s the expected payout? Set it up by conditioning on the first roll.',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { d:20, winFaces:'{1}', type:'geometric' } },
    ['totalExpectation([{p:R(1,20),value:R(1)},{p:R(19,20),restart:{add:R(1)}}])'], t4r3,
    ['Condition on first roll: win (prob 1/20) pays 1 roll; fail (prob 19/20) costs 1 and restarts. E=1/20·1+19/20·(1+E) ⇒ E/20=1 ⇒ E=20.', 'Geometric mean: p=1/20, E=1/p=20.', 'Probabilities 1/20+19/20=1 ✓; the linear equation E=20·1=20.'],
    T4_WRONG,
    ['Split on the first roll, average within each branch, then weight by each branch\'s probability (which must sum to 1).', 'The \'fail\' branch (any non-winning face) brings you back to the same state — its value is 1 + E, not just 1.', 'Write E = (1/20)·1 + (19/20)·(1+E); collect the E terms and solve the linear equation — equivalently E = d/s for the geometric wait.'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T4 row 4: coin → die-or-$1 ───────────────────────────────────────────
  mkQ('tmpl-total-expectation#coin-die-or-dollar', 'harder',
    tplFp('tmpl-total-expectation', { branches:'coin-H-die-T-dollar', type:'conditional' }),
    'Flip a fair coin. Heads → roll a fair 6-sided die and collect its face value in dollars; tails → collect $1 flat. What is the expected payout from one play? A student says "(3.50+1.00)/2=$2.25" — is that reasoning right, and when would that averaging shortcut fail?',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { branches:'coin-H-die-T-dollar', type:'conditional' } },
    ['totalExpectation([{p:R(1,2),value:R(7,2)},{p:R(1,2),value:R(1)}])'], t4r4,
    ['E = P(H)·E[die] + P(T)·$1 = 1/2·7/2 + 1/2·1 = 7/4+2/4 = 9/4.', 'The shortcut (3.5+1)/2=2.25=9/4 works here only because P(H)=P(T)=1/2; with a biased coin p≠1/2 the shortcut fails — you must weight by P(case).', 'No restart: both branches have literal payouts, so no self-referential equation arises.'],
    T4_WRONG,
    ['Average the two branch values weighted by each branch\'s probability — here both probs happen to be 1/2.', 'Each branch contributes P(branch)·E[payout|branch]; the student\'s formula is accidentally correct because P(H)=P(T)=1/2.', 'Write E = (1/2)·(7/2) + (1/2)·1 and evaluate; note the equal-weight shortcut breaks once the coin is biased (e.g. p=1/3 heads gives 1/3·(7/2)+2/3·1, no longer the simple midpoint).'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T4 row 6: self-ref d6 STOP{1,2}/REROLL{3,4,5,6} ─────────────────────
  mkQ('tmpl-total-expectation#selfref-d6-stop12', 'brutal',
    tplFp('tmpl-total-expectation', { d:6, stop:'{1,2}', reroll:'{3,4,5,6}', type:'self-ref' }),
    'Roll a fair 6-sided die. If the face is in {1, 2} the game ENDS and pays that face; if it\'s in {3, 4, 5, 6} you BANK that face and must roll again, adding the next payout on top. What\'s one play worth? Notice the \'keep rolling\' branch loops back to the same game.',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { d:6, stop:'{1,2}', reroll:'{3,4,5,6}', type:'self-ref' } },
    ['totalExpectation([{p:R(1,3),value:R(3,2)},{p:R(2,3),restart:{add:R(9,2)}}])'], t4r6,
    ['STOP{1,2}: P=1/3, mean face=3/2. REROLL{3,4,5,6}: P=2/3, mean face=9/2. E=1/3·3/2+2/3·(9/2+E) ⇒ E/3=1/2+3=7/2 ⇒ E=21/2.', 'Self-referential: the REROLL branch banks 9/2 AND is worth another play, so its contribution is 2/3·(9/2+E).', 'Solve 1/3·E=7/2: E=21/2. Probabilities 1/3+2/3=1 ✓.'],
    T4_WRONG,
    ['Split on the first roll, average within each branch, then weight by each branch\'s probability (which must sum to 1).', 'The REROLL branch doesn\'t pay just its face — it banks that face AND replays the whole game, so its value contains E.', 'Write E = (1/3)·(3/2) + (2/3)·(9/2+E); collect the E terms on one side and solve the linear equation for E.'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T4 row 7: self-ref d6 STOP odd / REROLL even ─────────────────────────
  mkQ('tmpl-total-expectation#selfref-d6-stop-odd', 'brutal',
    tplFp('tmpl-total-expectation', { d:6, stop:'odd{1,3,5}', reroll:'even{2,4,6}', type:'self-ref' }),
    'Roll a fair 6-sided die. If the face is ODD (in {1, 3, 5}) the game ENDS and pays that face; if it\'s EVEN (in {2, 4, 6}) you BANK that face and must roll again, adding the next payout on top. What\'s one play worth? Notice the \'keep rolling\' branch loops back to the same game.',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { d:6, stop:'odd{1,3,5}', reroll:'even{2,4,6}', type:'self-ref' } },
    ['totalExpectation([{p:R(1,2),value:R(3)},{p:R(1,2),restart:{add:R(4)}}])'], t4r7,
    ['STOP{1,3,5}: P=1/2, mean=3. REROLL{2,4,6}: P=1/2, mean=4. E=1/2·3+1/2·(4+E) ⇒ E/2=7/2 ⇒ E=7.', 'The REROLL branch banks 4 AND replays the game: E=3/2+2+E/2 ⇒ E/2=7/2 ⇒ E=7.', 'Probabilities 1/2+1/2=1 ✓; symmetric stop/reroll probabilities make the arithmetic clean.'],
    T4_WRONG,
    ['Split on the first roll, average within each branch, then weight by each branch\'s probability (which must sum to 1).', 'The REROLL branch doesn\'t pay just its face — it banks that face AND replays the whole game, so its value contains E.', 'Write E = (1/2)·3 + (1/2)·(4+E); collect the E terms on one side and solve the resulting linear equation for E.'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T4 row 8: self-ref d8 STOP{1-4}/REROLL{5-8} ─────────────────────────
  mkQ('tmpl-total-expectation#selfref-d8-stop1234', 'brutal',
    tplFp('tmpl-total-expectation', { d:8, stop:'{1,2,3,4}', reroll:'{5,6,7,8}', type:'self-ref' }),
    'Roll a fair 8-sided die. If the face is in {1, 2, 3, 4} the game ENDS and pays that face; if it\'s in {5, 6, 7, 8} you BANK that face and must roll again, adding the next payout on top. What\'s one play worth? Notice the \'keep rolling\' branch loops back to the same game.',
    T4_SRC,
    { id: 'tmpl-total-expectation', params: { d:8, stop:'{1,2,3,4}', reroll:'{5,6,7,8}', type:'self-ref' } },
    ['totalExpectation([{p:R(1,2),value:R(5,2)},{p:R(1,2),restart:{add:R(13,2)}}])'], t4r8,
    ['STOP{1-4}: P=1/2, mean=5/2. REROLL{5-8}: P=1/2, mean=13/2. E=1/2·5/2+1/2·(13/2+E) ⇒ E/2=9/2 ⇒ E=9.', 'The REROLL branch banks 13/2 AND replays: E=5/4+13/4+E/2 ⇒ E/2=18/4=9/2 ⇒ E=9.', 'Probabilities 1/2+1/2=1 ✓; 8-sided die adds complexity but the structure is identical.'],
    T4_WRONG,
    ['Split on the first roll, average within each branch, then weight by each branch\'s probability (which must sum to 1).', 'The REROLL branch doesn\'t pay just its face — it banks that face AND replays the whole game, so its value contains E.', 'Write E = (1/2)·(5/2) + (1/2)·(13/2+E); collect the E terms on one side and solve the resulting linear equation for E.'],
    T4_RUBRIC, T4_FOLLOWS),

  // ── T5: full set N=5 ──────────────────────────────────────────────────────
  mkQ('tmpl-coupon-collector#full-N5', 'harder',
    tplFp('tmpl-coupon-collector', { N:5, type:'full-set' }),
    'Every cereal box hides one of 5 equally-likely prizes. How many boxes do you expect to buy to complete the whole set? Explain why it\'s far more than 5 — which prize dominates the cost?',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:5, type:'full-set' } },
    ['couponCollector(5)'], t5n5,
    ['Sum of 5 geometric stage waits: 5/5+5/4+5/3+5/2+5/1=5·H₅=5·(137/60)=137/12≈11.4.', 'The final missing prize costs 5 boxes alone (p=1/5); that single stage contributes 5, more than the first stage (1 box).', '5·H₅ where H₅=1+1/2+1/3+1/4+1/5=137/60.'],
    T5_WRONG,
    ['Don\'t count one box per prize — later prizes get rarer, so each successive wait is longer.', 'When you hold k of 5, the chance the next box is new is (5−k)/5, so that stage\'s expected wait is 5/(5−k); add the stage waits.', 'Sum the stage waits 5/(5−k) for k=0..4 — i.e. 5·H₅ = 5·(1+1/2+1/3+1/4+1/5); the last prize alone costs 5 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: full set N=7 ──────────────────────────────────────────────────────
  mkQ('tmpl-coupon-collector#full-N7', 'harder',
    tplFp('tmpl-coupon-collector', { N:7, type:'full-set' }),
    'Every cereal box hides one of 7 equally-likely toys. How many boxes do you expect to buy to complete the whole set? Explain why it\'s far more than 7 — which toy dominates the cost?',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:7, type:'full-set' } },
    ['couponCollector(7)'], t5n7,
    ['7·H₇=7·(363/140)=363/20=18.15.', 'The final missing toy costs 7 boxes alone (p=1/7), dominating the collection cost.', 'H₇=1+1/2+1/3+1/4+1/5+1/6+1/7=363/140; 7·H₇=363/20.'],
    T5_WRONG,
    ['Don\'t count one box per toy — later toys get rarer, so each successive wait is longer.', 'When you hold k of 7, the chance the next box is new is (7−k)/7, so that stage\'s expected wait is 7/(7−k); add the stage waits.', 'Sum 7/(7−k) for k=0..6, i.e. 7·H₇; the last toy alone costs 7 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: full set N=8 ──────────────────────────────────────────────────────
  mkQ('tmpl-coupon-collector#full-N8', 'harder',
    tplFp('tmpl-coupon-collector', { N:8, type:'full-set' }),
    'Every cereal box hides one of 8 equally-likely prizes. How many boxes do you expect to buy to complete the whole set? Explain why it\'s far more than 8 — which prize dominates the cost?',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:8, type:'full-set' } },
    ['couponCollector(8)'], t5n8,
    ['8·H₈=8·(761/280)=761/35≈21.7.', 'The final missing prize costs 8 boxes alone (p=1/8).', 'H₈=761/280; 8·H₈=761/35.'],
    T5_WRONG,
    ['Don\'t count one box per prize — later prizes get rarer, so each successive wait is longer.', 'When you hold k of 8, the chance the next box is new is (8−k)/8, so that stage\'s expected wait is 8/(8−k); add the stage waits.', 'Sum 8/(8−k) for k=0..7, i.e. 8·H₈; the last prize alone costs 8 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: full set N=10 ─────────────────────────────────────────────────────
  mkQ('tmpl-coupon-collector#full-N10', 'brutal',
    tplFp('tmpl-coupon-collector', { N:10, type:'full-set' }),
    'Every cereal box hides one of 10 equally-likely prizes. How many boxes do you expect to buy to complete the whole set? Explain why it\'s far more than 10 — which prize dominates the cost?',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:10, type:'full-set' } },
    ['couponCollector(10)'], t5n10,
    ['10·H₁₀=10·(7381/2520)=7381/252≈29.3.', 'The final missing prize costs 10 boxes alone (p=1/10).', 'H₁₀=7381/2520; 10·H₁₀=7381/252≈29.3 — nearly three times N.'],
    T5_WRONG,
    ['Don\'t count one box per prize — later prizes get rarer, so each successive wait is longer.', 'When you hold k of 10, the chance the next box is new is (10−k)/10; that stage\'s expected wait is 10/(10−k); add the stage waits.', 'Sum 10/(10−k) for k=0..9, i.e. 10·H₁₀; the last prize alone costs 10 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: full set N=12 ─────────────────────────────────────────────────────
  mkQ('tmpl-coupon-collector#full-N12', 'brutal',
    tplFp('tmpl-coupon-collector', { N:12, type:'full-set' }),
    'Every cereal box hides one of 12 equally-likely prizes. How many boxes do you expect to buy to complete the whole set? Explain why it\'s far more than 12 — which prize dominates the cost?',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:12, type:'full-set' } },
    ['couponCollector(12)'], t5n12,
    ['12·H₁₂=86021/2310≈37.2.', 'The final missing prize costs 12 boxes alone (p=1/12).', 'H₁₂=86021/27720; 12·H₁₂=86021/2310.'],
    T5_WRONG,
    ['Don\'t count one box per prize — later prizes get rarer, so each successive wait is longer.', 'When you hold k of 12, the chance the next box is new is (12−k)/12; that stage\'s expected wait is 12/(12−k); add the stage waits.', 'Sum 12/(12−k) for k=0..11, i.e. 12·H₁₂; the last prize alone costs 12 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: from holding j=3 of N=6 ───────────────────────────────────────────
  mkQ('tmpl-coupon-collector#from-j3-N6', 'harder',
    tplFp('tmpl-coupon-collector', { N:6, j:3, type:'from-holding' }),
    'You already hold 3 of the 6 distinct toys in a cereal-box collection. How many MORE boxes do you expect to buy to finish the set? Show why these last 3 cost more than the first 3 combined did on average per toy.',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:6, j:3, type:'from-holding' } },
    ['ratMul(R(6), harmonic(3))'], t5j3n6,
    ['Only 3 stages remain (k=3,4,5 held); waits are 6/3+6/2+6/1=2+3+6=11.', '6·H₃=6·(1+1/2+1/3)=6·(11/6)=11.', 'The last-prize stage alone costs 6 boxes; those 3 final stages dominate the collection.'],
    T5_WRONG,
    ['Don\'t count one box per remaining toy — later toys get rarer, so each successive wait is longer.', 'From j=3 held, only 3 stages remain; when you hold k of 6, a new toy arrives with chance (6−k)/6, costing 6/(6−k) boxes.', 'Sum the last 3 stage waits 6/3+6/2+6/1 — equivalently 6·H₃ where H₃=1+1/2+1/3; the final prize alone costs 6 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T5: from holding j=10 of N=12 ─────────────────────────────────────────
  mkQ('tmpl-coupon-collector#from-j10-N12', 'harder',
    tplFp('tmpl-coupon-collector', { N:12, j:10, type:'from-holding' }),
    'You already hold 10 of the 12 distinct prizes in a cereal-box collection. How many MORE boxes do you expect to buy to get the final 2? Show why these last 2 cost far more than any earlier stage.',
    T5_SRC,
    { id: 'tmpl-coupon-collector', params: { N:12, j:10, type:'from-holding' } },
    ['ratMul(R(12), harmonic(2))'], t5j10n12,
    ['Only 2 stages remain; waits are 12/2+12/1=6+12=18.', '12·H₂=12·(1+1/2)=12·3/2=18.', 'The very last missing prize costs 12 boxes alone (p=1/12); two stages total 18.'],
    T5_WRONG,
    ['Don\'t count one box per remaining prize — the last prize is the costliest.', 'From j=10 held, 2 stages remain: (11th) new prize arrives with chance 2/12, costing 6 boxes; (12th) last prize arrives with chance 1/12, costing 12 boxes.', 'Sum the two remaining stage waits 12/2+12/1 — equivalently 12·H₂ where H₂=1+1/2; the final prize alone costs 12 boxes.'],
    T5_RUBRIC, T5_FOLLOWS),

  // ── T6: E[max] n=3 ────────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#max-n3', 'hard',
    tplFp('tmpl-order-statistics', { n:3, stat:'max' }),
    'You draw 3 independent Uniform(0,1) values. What\'s the expected MAXIMUM? Argue why E[max] sits ABOVE 1/2 (and that it never reaches 1 for finite n).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:3, stat:'max' } },
    ['orderStatUniform(3).max'], t6max3,
    ['F_max(x)=x³ ⇒ E[max]=∫₀¹ 3x³dx=3/4; or: 3 points cut [0,1] into 4 equal-expected gaps of 1/4 each, so max=1−1/4=3/4.', 'Symmetry: n+1=4 gaps, each of length 1/4 in expectation; max equals 1 minus the top gap.', 'E[max]=3/4>1/2 ✓; for finite n the top gap is 1/(n+1)>0, so E[max]<1.'],
    T6_WRONG,
    ['The largest of 3 draws beats the average 1/2; the smallest sits below it.', 'Use P(max≤x)=x³ for 3 independent draws; integrate the survival function (or use the 4-gap symmetry).', 'Either integrate the survival function E[max]=∫₀¹(1−xⁿ)dx or use the n+1 equal-expected gaps; both give the closed form E[max]=n/(n+1) — substitute your n to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[max] n=5 ────────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#max-n5', 'hard',
    tplFp('tmpl-order-statistics', { n:5, stat:'max' }),
    'You draw 5 independent Uniform(0,1) values. What\'s the expected MAXIMUM? Argue why E[max] sits ABOVE 1/2 (and that it never reaches 1 for finite n).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:5, stat:'max' } },
    ['orderStatUniform(5).max'], t6max5,
    ['F_max(x)=x⁵ ⇒ E[max]=5/6; or: 5 points cut [0,1] into 6 equal-expected gaps of 1/6 each, so max=1−1/6=5/6.', 'Symmetry: n+1=6 gaps, each 1/6 in expectation; max=1−1/6=5/6.', 'E[max]=5/6≈0.833>1/2; as n→∞ the max approaches 1 from below.'],
    T6_WRONG,
    ['The largest of 5 draws beats the average 1/2; the smallest sits below it.', 'Use P(max≤x)=xⁿ for the n independent draws; the survival integral or the n+1 equal-expected gaps give the closed form E[max]=n/(n+1).', 'Integrate the survival function (or use the gap symmetry) to get E[max]=n/(n+1); substitute your n and note E[max]→1 as n→∞ but stays strictly below 1 for finite n.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[max] n=10 ───────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#max-n10', 'harder',
    tplFp('tmpl-order-statistics', { n:10, stat:'max' }),
    'You draw 10 independent Uniform(0,1) values. What\'s the expected MAXIMUM? Argue why E[max] sits ABOVE 1/2 (and that it never reaches 1 for finite n).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:10, stat:'max' } },
    ['orderStatUniform(10).max'], t6max10,
    ['F_max(x)=x¹⁰ ⇒ E[max]=10/11; or: 10 points cut [0,1] into 11 equal-expected gaps of 1/11 each, so max=1−1/11=10/11.', 'Symmetry: n+1=11 gaps each 1/11; max=10/11≈0.909.', 'E[max]=10/11>1/2; for finite n=10 the top gap is still 1/11>0 so max<1.'],
    T6_WRONG,
    ['The largest of 10 draws is well above 1/2 but cannot reach 1 for finite n.', 'Use the survival-function integral or the gap symmetry: n points make n+1 equal-expected gaps, so E[max]=n/(n+1).', 'Integrate P(max≤x)=xⁿ to get E[max]=n/(n+1); substitute your n (the top gap 1/(n+1) is what keeps it below 1).'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[min] n=3 ────────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#min-n3', 'hard',
    tplFp('tmpl-order-statistics', { n:3, stat:'min' }),
    'You draw 3 independent Uniform(0,1) values. What\'s the expected MINIMUM? Argue why E[min] sits BELOW 1/2 (and that it never reaches 0 for finite n).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:3, stat:'min' } },
    ['orderStatUniform(3).min'], t6min3,
    ['F_min(x)=1−(1−x)³ ⇒ E[min]=1/4; or: 3 points cut [0,1] into 4 equal-expected gaps of 1/4, so min=1/4.', 'Symmetry: n+1=4 gaps; min equals the bottom gap = 1/4.', 'E[min]=1/4<1/2 ✓; for finite n the bottom gap is 1/(n+1)>0 so min>0.'],
    T6_WRONG,
    ['The smallest of 3 draws is below the average 1/2; but it cannot reach exactly 0 for finite n.', 'Use P(min>x)=(1−x)ⁿ; the survival integral or the n+1 equal-expected gaps give the closed form E[min]=1/(n+1).', 'Integrate E[min]=∫₀¹ P(min>x)dx=∫₀¹(1−x)ⁿdx, or take the bottom of the n+1 equal gaps; both give E[min]=1/(n+1) — substitute your n.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[min] n=5 ────────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#min-n5', 'hard',
    tplFp('tmpl-order-statistics', { n:5, stat:'min' }),
    'You draw 5 independent Uniform(0,1) values. What\'s the expected MINIMUM? Argue why E[min] sits BELOW 1/2 (and that it never reaches 0 for finite n).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:5, stat:'min' } },
    ['orderStatUniform(5).min'], t6min5,
    ['F_min(x)=1−(1−x)⁵ ⇒ E[min]=1/6; or: 5 points cut [0,1] into 6 equal-expected gaps of 1/6, so min=1/6.', 'Symmetry: n+1=6 gaps; min=1/6≈0.167.', 'E[min]=1/6→0 as n→∞ but is strictly positive for finite n.'],
    T6_WRONG,
    ['The smallest of 5 draws is well below 1/2 but cannot reach 0 for finite n.', 'Use P(min>x)=(1−x)ⁿ; the survival integral or the n+1 equal-expected gaps give the closed form E[min]=1/(n+1).', 'Integrate P(min>x)=(1−x)ⁿ, or take the bottom of the n+1 equal gaps; both give E[min]=1/(n+1) — substitute your n to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[range] n=5 ──────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#range-n5', 'harder',
    tplFp('tmpl-order-statistics', { n:5, stat:'range' }),
    'For 5 independent Uniform(0,1) draws, what\'s the expected RANGE (max − min)?',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:5, stat:'range' } },
    ['ratSub(orderStatUniform(5).max, orderStatUniform(5).min)'], t6range5,
    ['E[range]=E[max]−E[min]=5/6−1/6=4/6=2/3 by linearity (even though max and min are dependent).', 'Gap symmetry: range = 1 minus top gap minus bottom gap = 1−1/6−1/6=4/6=2/3.', 'General formula: (n−1)/(n+1)=4/6=2/3 for n=5.'],
    T6_WRONG,
    ['Range = max − min, and expectations subtract even though max and min are dependent.', 'Find E[max] and E[min] of 5 draws separately, then subtract — linearity holds for differences too.', 'Use the closed forms E[max]=n/(n+1) and E[min]=1/(n+1); their difference is the range (n−1)/(n+1) — substitute your n to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: E[range] n=10 ─────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#range-n10', 'harder',
    tplFp('tmpl-order-statistics', { n:10, stat:'range' }),
    'For 10 independent Uniform(0,1) draws, what\'s the expected RANGE (max − min)?',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:10, stat:'range' } },
    ['ratSub(orderStatUniform(10).max, orderStatUniform(10).min)'], t6range10,
    ['E[range]=E[max]−E[min]=10/11−1/11=9/11 by linearity.', 'Gap symmetry: range = 1 minus top gap minus bottom gap = 1−1/11−1/11=9/11.', 'General formula: (n−1)/(n+1)=9/11 for n=10.'],
    T6_WRONG,
    ['Range = max − min, and expectations subtract even though max and min are dependent.', 'Find E[max] and E[min] of 10 draws separately, then subtract.', 'Use the closed forms E[max]=n/(n+1) and E[min]=1/(n+1); their difference is the range (n−1)/(n+1) — substitute your n=10 to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: ants n=100 ────────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#ants-n100', 'harder',
    tplFp('tmpl-order-statistics', { n:100, stat:'ants' }),
    '100 ants sit at random (independent Uniform(0,1)) positions on a 1-foot stick, each walking left or right at 1 ft/min; colliding ants instantly reverse. Expected time until the LAST ant falls off? Use the relabeling trick (a collision is identical to passing through).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:100, stat:'ants' } },
    ['orderStatUniform(100).max'], t6ants100,
    ['Relabeling: a collision ≡ pass-through ⇒ each token walks independently rightward; last-off time = max start position = E[max of 100 Uniform(0,1)]=100/101.', 'By symmetry (all ants walk right after relabeling), the last to fall is the rightmost initial position.', 'E[max of 100 U(0,1)]=100/101≈0.99 minutes.'],
    T6_WRONG,
    ['A collision that reverses two ants is indistinguishable from them passing through — relabel identities on contact.', 'After relabeling, the "last-off" event corresponds to the rightmost initial ant position — the maximum of 100 Uniform(0,1) samples.', 'Apply the order-stat closed form E[max of n U(0,1)]=n/(n+1) with your n; note it saturates near 1 regardless of n, so substitute to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── T6: ants n=1000 ───────────────────────────────────────────────────────
  mkQ('tmpl-order-statistics#ants-n1000', 'brutal',
    tplFp('tmpl-order-statistics', { n:1000, stat:'ants' }),
    '1000 ants sit at random (independent Uniform(0,1)) positions on a 1-foot stick, each walking left or right at 1 ft/min; colliding ants instantly reverse. Expected time until the LAST ant falls off? Use the relabeling trick (a collision is identical to passing through).',
    T6_SRC,
    { id: 'tmpl-order-statistics', params: { n:1000, stat:'ants' } },
    ['orderStatUniform(1000).max'], t6ants1000,
    ['Relabeling ⇒ last-off time = E[max of 1000 U(0,1)]=1000/1001≈0.999 minutes.', 'Even 1000 ants barely move the needle from n=100; saturation is near-complete.', '1000/1001 versus 100/101: both within 0.1% of 1 minute — doubling ants does NOT double time.'],
    T6_WRONG,
    ['A collision that reverses two ants is indistinguishable from them passing through — relabel identities on contact.', 'After relabeling, the last-off time equals the maximum initial position; use E[max of n U(0,1)]=n/(n+1).', 'Apply E[max of n U(0,1)]=n/(n+1) with your n; compared to a smaller n the increase is tiny because the closed form saturates toward 1 — substitute to finish.'],
    T6_RUBRIC, T6_FOLLOWS),

  // ── FF1: fair die bet ─────────────────────────────────────────────────────
  mkQ('ff-fair-die-bet', 'hard',
    semFp('fair-value', 'fair-die+loaded-die', 'd=6', 'fair-price-and-edge'),
    'A desk offers a one-roll fair-die bet paying face value in dollars. (a) What\'s the fair price? (b) Would you pay $3.40 to play, and what\'s your edge per play? (c) The die never shows 3.5 — explain how the fair price can be a value you can\'t roll. (d) Now the die is loaded so P(6)=1/2 and the other faces are equally likely — re-price it.',
    'Green Book §4.4 p.44 + p.62',
    undefined,
    ['expectedValue(DIE)', `expectedValue([{x:1,p:1/10},…,{x:5,p:1/10},{x:6,p:1/2}])`], ff1a,
    ['Σx·P(x) over the uniform pmf: 1/6+2/6+…+6/6=21/6=7/2=$3.50; edge at $3.40 = $3.50−$3.40=$0.10 per play.', 'Balance-point: 3.5 is the fulcrum of six equal weights; it need not be an attainable roll value.', '(d) Loaded die: 1/10+2/10+3/10+4/10+5/10+6/2=15/10+3=3/2+3=9/2=$4.50.'],
    ['average = middle of the labels', 'average must be an attainable/rollable value', 'mean = mode'],
    ['The fair price is the average payout, weighted by probability — it doesn\'t have to be a face you can roll.', 'Add 1·1/6+…+6·1/6; the edge is that sum minus the ticket cost.', 'Sum face×(1/6) for all six faces; for the loaded die, give face 6 weight 1/2 and the rest 1/10 each, then re-sum.'],
    { correctness: '7/2 for (a); 9/2 for (d); $0.10 edge for (b)', approach: 'Σx·P(x)', rigor: 'edge computed vs price; unrollable mean explained', communication: 'explains balance-point and the unrollable fair price', speed: 'instant' },
    ['What ticket price makes this a fair game forever?', 'Bias the die toward 1 instead — re-price.', 'Sketch the variance — would you pay extra to cap downside?']),

  // ── FF2: two dice two ways ────────────────────────────────────────────────
  mkQ('ff-two-dice-two-ways', 'hard',
    semFp('fair-value+linearity', 'two-fair-dice', 'd=6,n=2', 'expected-sum-two-ways'),
    'Expected sum of two fair dice. Do it TWO ways: (a) the hard way, by building the full {2..12} pmf and averaging; (b) the one-line way, by linearity. Confirm they agree and explain why (b) needs no independence.',
    'Green Book p.62 + §4.5 p.47',
    undefined,
    ['expectedValue(triangular pmf {x:2..12, p:w/36} with weights 1,2,3,4,5,6,5,4,3,2,1)', 'ratMul(R(2), expectedValue(DIE))'], ff2pmf,
    ['Triangular pmf: Σx·(weight/36) with weights 1,2,3,4,5,6,5,4,3,2,1 sums to 252/36=7.', 'E[D1+D2]=E[D1]+E[D2]=7/2+7/2=7 by linearity; independence not required.', 'Both paths give 7 — linearity is strictly more efficient.'],
    ['must build the joint pmf first to use linearity', 'linearity needs independence', 'average = middle of the labels {2..12}=7 (this one is accidentally correct but for wrong reasons)'],
    ['The sum\'s average doesn\'t require its distribution.', 'Add each die\'s own average — linearity holds regardless of dependence.', 'Build the {2..12} pmf (triangular weights 1..6..1 over 36) and average for (a); for (b) just double one die\'s mean 7/2.'],
    { correctness: '7 both ways', approach: 'pmf AND linearity', rigor: 'weights correct; states why linearity needs no independence', communication: 'contrasts the hard way vs one-liner', speed: 'prefers the one-liner' },
    ['Three dice?', 'Are the two dice independent here — does it matter?', 'Sum of two dice GIVEN at least one six? (→ expected 102/11)']),

  // ── FF3: coin-die or nothing ──────────────────────────────────────────────
  mkQ('ff-coin-die-or-nothing', 'hard',
    semFp('total-expectation', 'coin+die', 'p=1/2,d=6', 'expected-payout-conditional'),
    'Flip a fair coin: heads → roll a die and keep its dollar value; tails → get nothing. What\'s one play worth? A candidate says "(3.5+0)/2". Is that reasoning right, and when would it break?',
    'Green Book §4.5 p.47 + p.62',
    undefined,
    ['totalExpectation([{p:R(1,2),value:R(7,2)},{p:R(1,2),value:R(0)}])'], ff3,
    ['E=P(H)·E[die]+P(T)·0=1/2·7/2+1/2·0=7/4.', 'The formula (3.5+0)/2 is accidentally correct because P(H)=P(T)=1/2; with a biased coin (e.g. P(H)=1/3) it would give (3.5+0)/3=7/6≠1/3·7/2=7/6 — wait, that coincidence holds too; but conceptually one should weight by probability, not split equally.', 'Correct approach: weight each branch\'s expected value by its probability.'],
    ['weight by the case VALUE not P(case)', 'conditioning = Bayes updating', 'average = simple midpoint of outcomes'],
    ['Average the two branch values, but weighted by how likely each branch is.', 'Heads pays the die only half the time; tails contributes zero.', 'Multiply each branch\'s expected payout by its probability and add: (1/2)·(7/2)+(1/2)·0 — then evaluate.'],
    { correctness: '7/4', approach: 'P(case)-weighting', rigor: 'identifies when the naive average coincides vs fails', communication: 'explains when (3.5+0)/2 breaks', speed: 'instant' },
    ['Make it heads w.p. 1/3 — recompute and watch the naive average break.', 'Tails pays $1 instead of $0.', 'Heads → roll twice and sum.']),

  // ── FF4: max and min of two uniform ──────────────────────────────────────
  mkQ('ff-max-min-two-uniform', 'hard',
    semFp('order-statistics', 'two-uniform', 'n=2', 'E-max-and-E-min'),
    'Two independent Uniform(0,1) draws. Give E[larger] and E[smaller]. Show they\'re symmetric about 1/2 and sum to 1, and explain why E[max] ≠ 1/2.',
    'Green Book §4.6 p.50–51',
    undefined,
    ['orderStatUniform(2).max', 'orderStatUniform(2).min'], ff4max,
    ['F_max(x)=x²; E[max]=∫₀¹ 2x·(1−x²)... actually E[max]=2/3; F_min(x)=1−(1−x)²; E[min]=1/3.', 'Two points cut [0,1] into 3 equal-expected gaps of 1/3; max=1−1/3=2/3, min=1/3.', 'They sum to 1 (since max+min=sum of the two draws; E[sum]=2·1/2=1); they\'re symmetric about 1/2.'],
    ['E[max]=1/2', 'E[max]=1', 'min of 2 ≈ 1/2'],
    ['The larger of two draws beats the midpoint; the smaller sits below it.', 'P(max≤x)=x² for two independent draws — integrate the survival function.', 'Use the three equal-expected gaps two points make on [0,1], or the closed forms E[max]=n/(n+1) and E[min]=1/(n+1) with n=2; the max is 1 minus the top gap and the min is the bottom gap — evaluate to finish.'],
    { correctness: '2/3 and 1/3', approach: 'order-stat CDF or three-gap symmetry', rigor: 'symmetry and sum-to-1 shown', communication: 'explains max>1/2 and the gap interpretation', speed: 'clean' },
    ['Generalize to n draws: E[max]=n/(n+1), E[min]=1/(n+1).', 'E[range]?', 'Are max and min independent? (No.)']),

  // ── FF5: first ace via indicators ─────────────────────────────────────────
  mkQ('ff-first-ace-indicators', 'harder',
    semFp('indicator', '52-card-4-aces', 'D=52,A=4', 'first-ace-position'),
    'Shuffle a standard 52-card deck and flip cards one at a time. On average, at what position does the first ace appear? Most say ~26; show the full indicator/5-equal-gaps argument that gets the true answer.',
    'Green Book §4.5 p.48 + §2.7 p.31',
    undefined,
    ['reduce(53, 5)', 'ratAdd(R(1), ratMul(R(48), indicatorExpectation(R(1,5))))'], ff5,
    ['4 aces split the deck into 5 equal gaps; expected lead-gap=48/5; E[first ace]=1+48/5=53/5=10.6.', 'Indicator Iᵢ=\'non-ace i precedes all 4 aces\', P=1/5; E=1+48·(1/5)=53/5.', 'The ~26 guess conflates "what position divides the deck in half" with "where the first ace lands."'],
    ["a count can't be an expectation", 'probability and expectation are different machines', 'first ace is at about deck-midpoint ~26'],
    ['\'How deep to the first ace\' is an expectation — attach an indicator to each non-ace.', 'The 4 aces cut the 52-card deck into 5 equally-likely gaps; find the expected length of the gap before the first ace.', 'Add 1 for the ace plus, for each of the 48 non-aces, its 1/5 chance of appearing before every ace — i.e. 1+48·(1/5); the general closed form is (D+1)/(A+1).'],
    { correctness: '53/5', approach: 'indicators + 5 gaps', rigor: 'justifies P(Iᵢ)=1/5 via symmetry', communication: 'refutes the ~26 trap', speed: 'no position-distribution build' },
    ['Expected position of the LAST ace? (By symmetry, 52−53/5+1=209/5+1 — derive it.)', 'First ace with one joker added (53 cards, 4 aces).', 'First of the two black aces only.']),

  // ── FF6: distinct after 2 rolls of d6 ────────────────────────────────────
  mkQ('ff-distinct-after-2of6', 'harder',
    semFp('indicator+distinct', 'fair-die', 'N=6,m=2', 'expected-distinct-two-rolls'),
    'Roll a fair die twice. How many distinct faces do you expect to see? A candidate says 2 — why is it less, and what\'s the exact value?',
    'Green Book §4.5 p.49–50',
    undefined,
    ['distinctAfterDraws(6, 2)'], ff6,
    ['P(face i seen in 2 rolls)=1−(5/6)²=11/36; E[distinct]=6·11/36=11/6≈1.833.', 'E[distinct]=1+P(2nd roll is new)=1+5/6=11/6 — the 2nd roll is new with chance 5/6.', 'The two rolls can repeat, so expected distinct < 2.'],
    ['distinct after 2 = 2', 'every outcome equally likely', "a count can't be an expectation"],
    ['The two rolls can collide, so expected distinct is below 2.', 'Either sum \'face i appeared\' indicators, or note the 2nd roll is new with chance 5/6.', 'Take N times the chance one given face shows in m=2 rolls — i.e. 6·(1−(5/6)²), the closed form N·(1−((N−1)/N)^m); evaluate it.'],
    { correctness: '11/6', approach: 'indicator sum or 1+5/6 decomposition', rigor: 'miss-probability (5/6)² stated correctly', communication: 'explains why < 2', speed: 'clean' },
    ['After 3 rolls? After m?', '10-sided die instead.', 'When does expected distinct first exceed N/2?']),

  // ── FF7: coupon collector 6 ───────────────────────────────────────────────
  mkQ('ff-coupon-full-6', 'harder',
    semFp('coupon-collector', 'fair-die-6-faces', 'N=6', 'expected-rolls-to-complete-set'),
    'A die is rolled until every face has appeared at least once. Expected number of rolls? Explain why it\'s ~15, not ~6, and which face drives the cost.',
    'Green Book §4.5 p.49–50',
    undefined,
    ['couponCollector(6)'], ff7,
    ['Sum of 6 geometric stage waits: 6/6+6/5+6/4+6/3+6/2+6/1=6·H₆=6·(49/20)=147/10.', 'Last face costs 6 rolls alone (p=1/6), more than the first 5 stages combined per stage.', 'H₆=1+1/2+1/3+1/4+1/5+1/6=49/20; 6·H₆=147/10=14.7.'],
    ['a full set ≈ N=6 rolls', 'each new face takes the same time', 'double the faces ⇒ double the rolls'],
    ['Later faces are rarer, so each successive wait is longer — the total is well above 6.', 'From k faces held, the next-new-face chance is (6−k)/6; add the reciprocal waits.', 'Sum the stage waits 6/(6−k) for k=0..5 — i.e. 6·(1+1/2+…+1/6)=6·H₆, the closed form N·H_N; evaluate it.'],
    { correctness: '147/10', approach: 'sum of geometric stage waits', rigor: 'stage probabilities (6−k)/6 stated correctly', communication: 'last-face dominance explained', speed: 'H₆ computed cleanly' },
    ['General N: how does it scale? (≈N·ln N.)', 'Two dice in parallel — does it halve?', 'Cost of just the final two faces?']),

  // ── FF8: rolls until first 6 ─────────────────────────────────────────────
  mkQ('ff-rolls-until-first-6', 'harder',
    semFp('total-expectation+self-ref', 'fair-die', 'd=6,target=6', 'geometric-until-first-6-derive'),
    'Roll a fair die until the first 6, counting rolls. Expected count? Derive it by conditioning on the first roll (don\'t just quote 1/p).',
    'Green Book §4.5 p.47 + p.44',
    undefined,
    ['totalExpectation([{p:R(1,6),value:R(1)},{p:R(5,6),restart:{add:R(1)}}])'], ff8,
    ['E = 1/6·1 + 5/6·(1+E) ⇒ E = 1/6 + 5/6 + 5E/6 ⇒ E/6=1 ⇒ E=6.', 'Geometric mean 1/p = 1/(1/6) = 6, confirmed by the first-step derivation.', 'The failure branch (prob 5/6) costs a roll AND restarts the same game — that\'s the self-reference.'],
    ["the re-roll case is worth just its face", "can't solve — E[X] on both sides", 'infinite re-rolls ⇒ unbounded value'],
    ['Condition on the first roll: success ends it, failure costs a roll and restarts the same wait.', 'The failure branch is worth 1+E (the whole wait again), not just 1.', 'Write E = (1/6)·1 + (5/6)·(1+E); collect the E terms and solve the linear equation — equivalently E = d/s for the geometric wait.'],
    { correctness: '6', approach: 'first-step conditioning / self-reference', rigor: 'solves the linear equation; notes geometric interpretation', communication: 'convergence argued from geometric decay', speed: 'no series expansion' },
    ['Until first {5,6}? (E=3)', 'Until two 6s in a row? (Links to pattern-hitting time.)', 'Biased die, P(6)=1/3.']),

  // ── FF9: range of 4 uniform ───────────────────────────────────────────────
  mkQ('ff-range-of-4-uniform', 'harder',
    semFp('order-statistics', 'four-uniform', 'n=4', 'expected-range'),
    'Four independent Uniform(0,1) draws. Expected RANGE (max − min)? Use the extremes, not the joint density.',
    'Green Book §4.6 p.50–51',
    undefined,
    ['ratSub(orderStatUniform(4).max, orderStatUniform(4).min)'], ff9,
    ['E[range]=E[max]−E[min]=4/5−1/5=3/5 by linearity (valid even though max and min are dependent).', 'Gap symmetry: n+1=5 gaps of 1/5; range = 1 minus top gap minus bottom gap = 1−1/5−1/5=3/5.', 'General formula: (n−1)/(n+1)=3/5 for n=4.'],
    ['linearity needs independence for differences', 'E[max]=1', 'min of n ≈ 1/n'],
    ['Range = max − min, and expectations subtract even though max and min are dependent.', 'Find E[max] and E[min] of 4 draws separately, then subtract.', 'Use the closed forms E[max]=n/(n+1) and E[min]=1/(n+1); their difference is the range (n−1)/(n+1) — substitute your n=4 to finish.'],
    { correctness: '3/5', approach: 'E[max]−E[min] via linearity', rigor: 'explicitly notes max and min are dependent yet subtraction of expectations is valid', communication: 'explains dependence-free linearity', speed: 'clean' },
    ['General n? (→ (n−1)/(n+1).)', 'n→∞ limit of the range.', 'E[2nd-largest of 4]?']),

  // ── FF10: noodles n=6, exact + asymptotic ────────────────────────────────
  mkQ('ff-noodles-6-asymptotic', 'brutal',
    semFp('linearity+noodles', 'noodles-bowl', 'n=6', 'expected-loops-exact-and-asymptotic'),
    'Six noodles in a bowl (12 free ends); tie random ends until none remain. (a) Exact expected number of loops? (b) Now there are 100 noodles — without exact arithmetic, estimate the expected loops and justify the ½·ln n growth.',
    'Green Book §4.5 p.47–48',
    undefined,
    ['noodleLoops(6)'], ff10,
    ['(a) Σ_{k=1}^{6} 1/(2k−1) = 1+1/3+1/5+1/7+1/9+1/11 = 6508/3465.', '(b) ≈ ½·ln(100)+C ≈ 3.28; the odd-reciprocal series grows like ½·ln n asymptotically.', 'Each tie independently has loop-closing chance 1/(j−1) where j is the number of free ends; dependence between ties is irrelevant by linearity.'],
    ['more noodles ⇒ proportionally more loops', 'linearity needs independence', 'must track the tangle explicitly'],
    ['Each tie independently has a small chance of closing a loop; add those chances, dependence and all.', 'With j free ends, a tie closes a loop with chance 1/(j−1); list the chances over all the ties.', 'Sum the odd-denominator chances 1/1+1/3+…+1/11 for n=6; for large n compare to ½·ln n to estimate without exact arithmetic.'],
    { correctness: '6508/3465 exact; ≈3.28 asymptotic for 100', approach: 'linearity over dependent ties', rigor: 'correct odd-denominator sum + asymptotic argument for 100-noodle growth', communication: 'explains logarithmic (not linear) growth', speed: 'doesn\'t attempt exact 100-noodle arithmetic' },
    ['Why does it grow like ½·ln n and not linearly?', 'n=8 exact (91072/45045).', 'Expected number of noodles left unlooped?']),

  // ── FF11: self-ref dice game STOP{1,2,3}/REROLL{4,5,6} ──────────────────
  mkQ('ff-self-ref-dice-game', 'brutal',
    semFp('total-expectation+self-ref', 'fair-die-stop-1-2-3', 'd=6,stop={1,2,3},reroll={4,5,6}', 'expected-value-self-ref-game'),
    'Roll a die: {1,2,3} ends the game and pays the face; {4,5,6} banks the face and forces a reroll, payouts accumulating. (a) Value of one play? (b) Prove the self-referential equation has a finite solution (the re-rolls don\'t blow up).',
    'Green Book §4.5 p.48',
    undefined,
    ['totalExpectation([{p:R(1,2),value:R(2)},{p:R(1,2),restart:{add:R(5)}}])'], ff11,
    ['STOP{1,2,3}: P=1/2, mean=2. REROLL{4,5,6}: P=1/2, mean=5. E=1/2·2+1/2·(5+E) ⇒ E/2=7/2 ⇒ E=7.', '(b) Each re-roll continues with prob 1/2; expected length = geometric(1/2) = 2 rounds — finite.', 'Solve E=1+5/2+E/2 ⇒ E/2=7/2 ⇒ E=7.'],
    ["the re-roll case is worth just its face", "can't solve — E[X] on both sides", 'infinite re-rolls ⇒ unbounded value'],
    ['Condition on the first roll and weight each half by its probability.', 'The high branch banks its face AND replays the whole game, so its value contains E.', 'Set E = 1/2·(mean of low faces) + 1/2·(mean of high faces + E), then solve for E; for finiteness, note each extra re-roll occurs with probability 1/2.'],
    { correctness: '7', approach: 'total expectation fixed point', rigor: 'solves linear equation + convergence proof (geometric decay)', communication: 'explains geometric decay prevents blow-up', speed: 'no infinite-sum expansion' },
    ['Swap the split to {1,2} stop / {3..6} reroll (answer 21/2).', '8-sided die, low half stop (answer 9).', 'What re-roll probability would make the value infinite? (p_reroll→1.)']),

  // ── FF12: ants 500 ────────────────────────────────────────────────────────
  mkQ('ff-ants-500', 'harder',
    semFp('order-statistics+ants', 'stick-500-ants', 'n=500', 'expected-time-last-ant-off'),
    '500 ants on a 1-foot stick, each walking at 1 ft/min; head-on collisions reverse both. Expected time until all have fallen off? Use relabeling and explain why 500 ants isn\'t ~500× one ant.',
    'Green Book §4.6 p.52 + p.50–51',
    undefined,
    ['orderStatUniform(500).max'], ff12,
    ['Relabeling: a collision ≡ pass-through ⇒ last-off time = max start position = E[max of 500 U(0,1)]=500/501≈0.998 minutes.', 'The max saturates near 1 for large n; adding more ants barely moves the expected time.', 'E[max of n U(0,1)]=n/(n+1); for n=500 that\'s 500/501.'],
    ['more ants ⇒ proportionally more time', 'E[max]=1', 'colliding ants must be tracked individually'],
    ['A collision that reverses two ants is indistinguishable from them passing through — swap labels.', 'After relabeling, the last ant off is the farthest-traveling start point: the maximum of the 500 positions.', 'Use E[max of n Uniform(0,1)]=n/(n+1) with n=500; note it saturates near 1 regardless of n.'],
    { correctness: '500/501', approach: 'relabeling → E[max]', rigor: 'justifies pass-through equivalence; argues saturation', communication: 'explains ~1 minute saturation — doubling ants doesn\'t double time', speed: 'no per-ant tracking' },
    ['1000 ants (1000/1001).', 'What\'s the limit as n→∞?', 'Expected time for the FIRST ant off? (E[min]=1/501.)']),

  // ── FF13: coupon collector last 2 of 6 ────────────────────────────────────
  mkQ('ff-coupon-last-2-of-6', 'harder',
    semFp('coupon-collector+from-holding', '6-toys-hold-4', 'N=6,j=4', 'additional-boxes-last-2'),
    'Collecting a 6-toy set, you already hold 4 distinct toys. Expected additional boxes to get the final 2? Show why these last two cost more than the first four combined did on average per toy.',
    'Green Book §4.5 p.49–50',
    undefined,
    ['ratMul(R(6), harmonic(2))'], ff13,
    ['Two remaining geometric waits: 6/2 (next new, p=2/6) + 6/1 (last, p=1/6) = 3+6=9.', '6·H₂=6·(1+1/2)=6·3/2=9.', 'The very last toy alone costs 6 boxes (p=1/6); the two final stages together cost 9, more than the first 4 stages\' total (147/10−9=57/10≈5.7) divided by 4 per stage.'],
    ['each new type takes the same time', 'the last type is as quick as the first', "chance a box is new stays 1/6"],
    ['Only the last two stages remain, and the very last is the slowest.', 'With 4 of 6 held, a new toy hits with chance 2/6; with 5 held, only 1/6.', 'Add the two remaining stage waits 6/(2/6·6) and 6/(1/6·6), i.e. 6/2+6/1 — equivalently 6·H₂ where H₂=1+1/2.'],
    { correctness: '9', approach: 'two geometric stage waits', rigor: 'stage probabilities 2/6 and 1/6 stated correctly', communication: 'explains tail dominance', speed: 'clean' },
    ['Last 3 of 6 (answer 11).', 'Last 2 of 12 (answer 18).', 'Full set N=6 from scratch (answer 147/10).']),

  // ── FF14: sum of two dice given at least one six ──────────────────────────
  mkQ('ff-sum-two-dice-given-six', 'brutal',
    semFp('conditional-expectation', 'two-dice', 'condition=at-least-one-six', 'expected-sum-given'),
    'Two fair dice are rolled and you\'re told at least one shows a six. What\'s the expected sum now? Build the conditional pmf over the 11 qualifying outcomes and average.',
    'Green Book §4.4 p.44 + §4.5 p.47',
    undefined,
    ['expectedValue([{x:7,p:2/11},{x:8,p:2/11},{x:9,p:2/11},{x:10,p:2/11},{x:11,p:2/11},{x:12,p:1/11}])'], ff14,
    ['11 ordered outcomes have at least one six: (6,1),(1,6),(6,2),(2,6),...,(6,6); sums 7..11 appear twice each, sum 12 once; E[sum|≥1 six]=(2·7+2·8+2·9+2·10+2·11+1·12)/11=102/11≈9.27.', 'Condition by listing: restrict to 11 qualifying pairs; each equally likely at 1/11; sum over all = 102; mean = 102/11.', 'The conditioning shrinks the sample space from 36 to 11, changing the distribution substantially.'],
    ['every outcome equally likely with or without conditioning', 'must use Bayes here — not simple restriction', '(6,6) double-counted'],
    ['The "at least one six" condition shrinks the sample space — re-weight only the qualifying outcomes.', 'There are 11 ordered outcomes with a six; each is now equally likely.', 'Build the conditional pmf over those 11 outcomes (sum 12 occurs once, sums 7–11 twice each) and take Σ x·P(x).'],
    { correctness: '102/11', approach: 'conditional pmf then EV', rigor: 'correct 11-outcome count; no (6,6) double-count', communication: 'explains sample-space restriction clearly', speed: 'no full 36-cell rebuild' },
    ['Expected sum given the dice differ.', 'Given at least one six, P(sum=12)?', 'Expected MAX of the two dice given at least one six.']),

]

// ── NO-LEAK GUARD (enforce-by-construction) ───────────────────────────────────
// Rungs 2 & 3 of every hint ladder (hintLadder[1] "stronger", hintLadder[2]
// "near-reveal") must be METHOD-ONLY: they may cite the givens and symbolic
// closed-forms, but must NOT state the final evaluated answer. The 1st rung
// (nudge) is unrestricted. Build fails loudly (with id + rung) until all clean.
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}
function hintRungLeaks(answer: string, rungText: string): boolean {
  const esc = escapeRegExp(answer)
  if (answer.includes('/')) {
    // FRACTION answer: any standalone occurrence of the exact answer fraction.
    return new RegExp(`(?<![\\d/])${esc}(?![\\d/])`).test(rungText)
  }
  // INTEGER answer: only a STATED RESULT leaks (a bare given like "6 faces" is
  // allowed; "= 6" / "⇒ 6" / "is 6" / ": 6" / a trailing "…=6"/"…: 6" is not).
  const statedResult = new RegExp(`(?:=|⇒|is\\s+|:\\s*)\\s*${esc}\\b`).test(rungText)
  const trailingResult = new RegExp(`[=:]\\s*${esc}$`).test(rungText.trim())
  return statedResult || trailingResult
}
const leakViolations: string[] = []
for (const q of questions) {
  const ans = q.engineCheck.answer
  if (hintRungLeaks(ans, q.hidden.hintLadder[1]))
    leakViolations.push(`${q.id}: hint rung 2 (stronger) states the final answer "${ans}"`)
  if (hintRungLeaks(ans, q.hidden.hintLadder[2]))
    leakViolations.push(`${q.id}: hint rung 3 (near-reveal) states the final answer "${ans}"`)
}
if (leakViolations.length > 0)
  throw new Error(
    `[NO-LEAK GUARD] ${leakViolations.length} hint rung(s) leak the final answer (rungs 2 & 3 must be METHOD-ONLY):\n  - ` +
      leakViolations.join('\n  - '),
  )
console.log(`✓ NO-LEAK guard passed: rungs 2 & 3 are method-only for all ${questions.length} questions`)

// ── Final assertions ──────────────────────────────────────────────────────────

console.log('\nRunning final assertions…')

// 1. Count >= 50
if (questions.length < 50) throw new Error(`Too few questions: ${questions.length}`)

// 2. All engineCheck.verified === true
questions.forEach(q => {
  if (!q.engineCheck.verified) throw new Error(`engineCheck.verified not true for ${q.id}`)
})

// 3. Unique fingerprints
const fps = questions.map(q => q.fingerprint)
const fpSet = new Set(fps)
if (fpSet.size !== fps.length) {
  const dups = fps.filter((f, i) => fps.indexOf(f) !== i)
  throw new Error(`Duplicate fingerprints: ${dups.join(', ')}`)
}

// 4. Valid tiers
questions.forEach(q => {
  if (!['hard','harder','brutal'].includes(q.tier))
    throw new Error(`Invalid tier "${q.tier}" for ${q.id}`)
})

// 5. Non-empty required fields
questions.forEach(q => {
  if (!q.source)           throw new Error(`Empty source for ${q.id}`)
  if (!q.hidden.answer)    throw new Error(`Empty answer for ${q.id}`)
  if (!q.prompt)           throw new Error(`Empty prompt for ${q.id}`)
  if (q.hidden.hintLadder.length !== 3) throw new Error(`hintLadder not 3 rungs for ${q.id}`)
  const r = q.hidden.rubric
  if (!r.correctness||!r.approach||!r.rigor||!r.communication||!r.speed)
    throw new Error(`Missing rubric axis for ${q.id}`)
  if (q.followUps.length < 1) throw new Error(`No followUps for ${q.id}`)
})

// 6. engineCheck.answer safe-integer already asserted during computation above
// (all computed via check() which calls assertSafe())

// Compute byTier histogram
const byTier = { hard: 0, harder: 0, brutal: 0 }
questions.forEach(q => { byTier[q.tier]++ })

// Compute templated vs freeForm
const templated = questions.filter(q => q.template).length
const freeForm  = questions.filter(q => !q.template).length

// 7. Verify counts match
const expectedTotal     = 58
const expectedTemplated = 44
const expectedFreeForm  = 14
if (questions.length   !== expectedTotal)     throw new Error(`Expected ${expectedTotal} questions, got ${questions.length}`)
if (templated          !== expectedTemplated) throw new Error(`Expected ${expectedTemplated} templated, got ${templated}`)
if (freeForm           !== expectedFreeForm)  throw new Error(`Expected ${expectedFreeForm} freeForm, got ${freeForm}`)

console.log(`  questions.length  = ${questions.length}`)
console.log(`  byTier            = ${JSON.stringify(byTier)}`)
console.log(`  templated         = ${templated}`)
console.log(`  freeForm          = ${freeForm}`)
console.log(`  ALL ${questions.length} QUESTIONS ENGINE-VERIFIED`)

// ── Assemble and emit JSON ────────────────────────────────────────────────────

const pack = {
  version: 1,
  kind: 'interview-pack',
  courseId: 'course-expected-value',
  concept: 'Expected Value',
  greenBookAnchor: 'Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §4.4–4.6 Expected value / Order statistics (p.44–52); §4.5 linearity & conditional expectation (p.47–48); §2.7 indicator variables (p.31); fair die (p.62)',
  engineModule: 'src/engine/expectation.ts',
  generator: 'interviews/_build/build-expected-value-pack.ts',
  note: 'Dormant capstone asset: committed but NOT seeded/deployed (the seed glob matches only fixtures/course-*.json | fixtures/lesson-*.json; this lives under interviews/). No app/Zod schema yet by design — self-describing via `version`. Every numeric answer is reproduced by src/engine/expectation.ts (exact rational, no floats).',
  counts: { total: questions.length, byTier, templated, freeForm },
  interviewerPrompt,
  generatorPrompt,
  templates: TEMPLATES.map(t => ({ ...t, engineModule: ENG })),
  questions,
}

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const outDir     = resolve(__dirname, '..')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'course-expected-value.json')
writeFileSync(outPath, JSON.stringify(pack, null, 2) + '\n', 'utf8')
console.log(`\nWrote ${outPath}`)
