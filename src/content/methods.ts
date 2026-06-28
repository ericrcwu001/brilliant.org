// src/content/methods.ts — single source of truth for deep-structure method tags
// (README §4 Foundation B, Decision D5). A `schemaId` on a graded beat names the
// METHOD a solver applies, independent of surface story — the hidden tag the
// which-method gate (spec-13), interleaved queue + method-weakness index
// (spec-10/01), and transfer matching (spec-24) read. Extensible: adding a
// concept may add ids here via the lesson-factory registry-extension process
// (.cursor/skills/lesson-factory/departments.md).
import { z } from 'zod'

export const METHODS = {
  // ── cross-domain (shared across concepts) ───────────────────────────────
  'first-step-analysis':   { name: 'First-step analysis',     domains: ['probability', 'markov-chains', 'optimal-stopping', 'expected-value'] },
  'symmetry':              { name: 'Symmetry',                domains: ['probability', 'combinatorics', 'game-theory'] },
  'conditioning':          { name: 'Conditioning',           domains: ['probability', 'bayes-rule', 'expected-value'] },
  'linearity-indicators':  { name: 'Linearity / indicators', domains: ['expected-value', 'combinatorics'] },
  'complementary-counting':{ name: 'Complementary counting', domains: ['combinatorics', 'probability'] },
  'recursion-self-reference': { name: 'Recursion / self-reference', domains: ['expected-value', 'probability', 'optimal-stopping'] },
  // ── domain-specific ─────────────────────────────────────────────────────
  'states-markov':         { name: 'States / Markov',        domains: ['markov-chains', 'probability'] },
  'stationary-distribution': { name: 'Stationary distribution', domains: ['markov-chains'] },
  'absorbing-states':      { name: 'Absorbing states / hitting times', domains: ['markov-chains', 'probability'] },
  'prior-update':          { name: 'Prior update',           domains: ['bayes-rule'] },
  'natural-frequencies':   { name: 'Natural frequencies',    domains: ['bayes-rule'] },
  'counting-product-rule': { name: 'Product rule / counting', domains: ['combinatorics'] },
  'choose-vs-arrange':     { name: 'Combinations vs permutations', domains: ['combinatorics'] },
  'inclusion-exclusion':   { name: 'Inclusion–exclusion',    domains: ['combinatorics'] },
  'pigeonhole':            { name: 'Pigeonhole',             domains: ['combinatorics'] },
  'dominance-nash':        { name: 'Dominance / Nash',       domains: ['game-theory'] },
  'backward-induction':    { name: 'Backward induction',     domains: ['game-theory', 'optimal-stopping', 'options'] },
  'mixed-strategy':        { name: 'Mixed strategy / indifference', domains: ['game-theory'] },
  'threshold-rule':        { name: 'Threshold / secretary',  domains: ['optimal-stopping'] },
  // ── binary & information (concept-binary-information) ─────────────────────
  'binary-encoding':       { name: 'Binary / powers-of-two encoding', domains: ['binary-information'] },
  'information-bound':     { name: 'Information bound (⌈log₂N⌉)', domains: ['binary-information'] },
  'base-encoding':         { name: 'Base-b / balanced-ternary encoding', domains: ['binary-information'] },
  'bit-invariants':        { name: 'Bit manipulation / XOR invariants', domains: ['binary-information'] },
  // ── options (concept-options) ──
  'payoff-construction':       { name: 'Payoff construction',     domains: ['options'] },
  'put-call-parity':           { name: 'Put–call parity',         domains: ['options'] },
  'no-arbitrage-replication':  { name: 'No-arbitrage replication', domains: ['options'] },
  'risk-neutral-pricing':      { name: 'Risk-neutral pricing',    domains: ['options'] },
  'binomial-pricing':          { name: 'Binomial pricing',        domains: ['options'] },
  'delta-hedging':             { name: 'Delta hedging',           domains: ['options'] },
} as const

export type MethodId = keyof typeof METHODS
export const MethodIdSchema = z.enum(
  Object.keys(METHODS) as [MethodId, ...MethodId[]],
)

// ── CONFUSABLE — curated near-miss method pairs ──────────────────────────────
// The SINGLE SOURCE OF TRUTH for which-method *foils* (spec-13 gate distractors)
// and method-interleave decoys (spec-10). These are genuine deep-structure
// near-misses a strong solver could plausibly mistake for the correct method on
// the same surface — NOT "shares a domain". Do NOT derive foils from
// `domains ∩` (two methods sharing 'probability' are not thereby confusable; and
// two genuinely confusable methods may live in different domains). MUST be a
// SYMMETRIC relation: if A lists B, B must list A (the methods.test.ts symmetry
// case enforces this). Every key and every value MUST be a valid MethodId.
export const CONFUSABLE: Record<MethodId, MethodId[]> = {
  'first-step-analysis':   ['states-markov', 'backward-induction', 'recursion-self-reference', 'absorbing-states', 'binomial-pricing'],
  'states-markov':         ['first-step-analysis', 'absorbing-states', 'stationary-distribution'],
  'backward-induction':    ['first-step-analysis', 'threshold-rule', 'recursion-self-reference', 'dominance-nash', 'binomial-pricing'],
  'recursion-self-reference': ['first-step-analysis', 'backward-induction', 'conditioning', 'binomial-pricing'],
  'absorbing-states':      ['states-markov', 'first-step-analysis', 'stationary-distribution'],
  'stationary-distribution': ['states-markov', 'absorbing-states'],
  'symmetry':              ['complementary-counting', 'conditioning'],
  'complementary-counting':['symmetry', 'inclusion-exclusion'],
  'inclusion-exclusion':   ['complementary-counting', 'counting-product-rule'],
  'counting-product-rule': ['inclusion-exclusion', 'choose-vs-arrange'],
  'choose-vs-arrange':     ['counting-product-rule', 'pigeonhole'],
  'pigeonhole':            ['choose-vs-arrange'],
  'conditioning':          ['prior-update', 'natural-frequencies', 'recursion-self-reference', 'symmetry', 'linearity-indicators', 'risk-neutral-pricing'],
  'prior-update':          ['conditioning', 'natural-frequencies', 'risk-neutral-pricing'],
  'natural-frequencies':   ['prior-update', 'conditioning'],
  'linearity-indicators':  ['conditioning', 'risk-neutral-pricing', 'delta-hedging'],
  'dominance-nash':        ['mixed-strategy', 'backward-induction', 'no-arbitrage-replication'],
  'mixed-strategy':        ['dominance-nash'],
  'threshold-rule':        ['backward-induction'],
  // ── binary & information ─────────────────────────────────────────────────
  'binary-encoding':       ['base-encoding', 'information-bound', 'bit-invariants'],
  'information-bound':     ['binary-encoding', 'base-encoding'],
  'base-encoding':         ['binary-encoding', 'information-bound'],
  'bit-invariants':        ['binary-encoding'],
  // ── options ──
  'payoff-construction':       ['put-call-parity', 'no-arbitrage-replication'],
  'put-call-parity':           ['payoff-construction', 'no-arbitrage-replication'],
  'no-arbitrage-replication':  ['payoff-construction', 'put-call-parity', 'risk-neutral-pricing', 'delta-hedging', 'dominance-nash'],
  'risk-neutral-pricing':      ['no-arbitrage-replication', 'binomial-pricing', 'conditioning', 'linearity-indicators', 'prior-update'],
  'binomial-pricing':          ['risk-neutral-pricing', 'delta-hedging', 'backward-induction', 'first-step-analysis', 'recursion-self-reference'],
  'delta-hedging':             ['no-arbitrage-replication', 'binomial-pricing', 'linearity-indicators'],
}
