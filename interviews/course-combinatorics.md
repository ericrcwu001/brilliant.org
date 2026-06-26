# Combinatorics — AI Quant Interview Pack

**DORMANT capstone asset:** committed but NOT seeded or deployed. The seed glob matches only `fixtures/course-*.json` and `fixtures/lesson-*.json`; this pack lives under `interviews/`.

- **courseId:** `course-combinatorics`
- **version:** 1
- **concept:** Combinatorics
- **greenBookAnchor:** Xinfeng Zhou, A Practical Guide to Quantitative Finance Interviews — §4.2 Combinatorial Analysis (p.33–42); §2.6 Pigeon Hole Principle (p.11–12)
- **engineModule:** `src/engine/combinatorics.ts`

## Pool summary

Total questions: **64**

| Tier | Count |
| --- | ---: |
| hard | 17 |
| harder | 36 |
| brutal | 11 |

- Templated: 52
- Free-form: 12

## Interviewer prompt

```
ROLE
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
At runtime the live "AI quant interviewer" feature substitutes the {{...}} placeholders with the drawn question record's fields (prompt, tier, source, hidden.answer/approaches/wrongTurns/hintLadder/rubric, followUps). Everything under GROUND TRUTH is injected and confidential; every word you say to the candidate must respect the no-answer-leak rule above.
```

## Generator prompt

```
ROLE
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
Never emit an unverifiable, off-canon, or duplicate question.
```

## Templates

| ID | Title | Source | Description |
| --- | --- | --- | --- |
| tmpl-sequence-count | Codes, PINs & collisions: total vs no-repeat sequences | Green Book §4.2 p.33–36 | Total m^n sequences vs no-repeat nPk(m,n) — the birthday collision complement. |
| tmpl-perm-vs-comb | Order matters or not — the ×k! gap | Green Book §4.2 p.33–34 | nPk vs nCk and the exact k! factor between ordered and unordered selections. |
| tmpl-derangement | The matching problem — nobody in the right place | Green Book §4.2 p.36 | Derangements via inclusion–exclusion; the 1/e limit. |
| tmpl-poker-hand | Named poker hand → count → probability → odds | Green Book §4.2 p.34 | Five-card hand decomposition: rank choices × suit choices × kicker; reduce over C(52,5)=2,598,960. |
| tmpl-binomial-term | Binomial coefficients, scaled terms, and the row identity | Green Book §4.2 p.33, p.36–37 | C(n,k)·c^k term coefficients; (1+c)^n row sum; symmetry C(n,k)=C(n,n−k). |
| tmpl-pigeonhole | Find the holes, then force the collision | Green Book §2.6 p.11–12 | Pigeonhole guaranteed minimum ⌈items/holes⌉ and threshold (t−1)·holes+1. |
| tmpl-dice-increasing | Roll k dice — probability strictly increasing | Green Book §4.2 p.40 | C(6,k) favorable outcomes (one increasing order per subset) over 6^k total. |
| tmpl-inclusion-exclusion | Unions, complements, and exactly-k regions | Green Book §4.2 p.33 | Two-set and three-set inclusion–exclusion; exactly-one/two coefficient derivation. |

## Questions

#### Tier: hard

### tmpl-sequence-count#m10-n4  ·  hard

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=10,n=4

**Prompt:** A 4-digit PIN is a string of 4 digits, each independently chosen from 10 possible digits. (a) How many distinct 4-digit PINs exist? (b) How many use no repeated digit? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(4).fill(10)) · nPk(10,4) → total = 10000; no-repeat = 5040; at-least-one-repeat = 4960. (verified)

#### Hidden

**Answer:** total = 10000; no-repeat = 5040; at-least-one-repeat = 4960.

**Approaches:**
- Multiplication rule: 10 choices per slot ⇒ 10^4 total; no-repeat shrinks options: 10·9·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(10,4); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (10·4=40 vs 10^4)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 10^4; no-repeat is nPk(10,4); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 10^4 and nPk(10,4) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>10)?
- If the first digit must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 10^n overflows.

### tmpl-sequence-count#m10-n5  ·  hard

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=10,n=5

**Prompt:** A 5-digit PIN is a string of 5 digits, each independently chosen from 10 possible digits. (a) How many distinct 5-digit PINs exist? (b) How many use no repeated digit? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(5).fill(10)) · nPk(10,5) → total = 100000; no-repeat = 30240; at-least-one-repeat = 69760. (verified)

#### Hidden

**Answer:** total = 100000; no-repeat = 30240; at-least-one-repeat = 69760.

**Approaches:**
- Multiplication rule: 10 choices per slot ⇒ 10^5 total; no-repeat shrinks options: 10·9·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(10,5); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (10·5=50 vs 10^5)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 10^5; no-repeat is nPk(10,5); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 10^5 and nPk(10,5) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>10)?
- If the first digit must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 10^n overflows.

### tmpl-sequence-count#m16-n4  ·  hard

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=16,n=4

**Prompt:** A hex token is a string of 4 hex digits, each independently chosen from 16 possible hex digits. (a) How many distinct hex tokens exist? (b) How many use no repeated hex digit? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(4).fill(16)) · nPk(16,4) → total = 65536; no-repeat = 43680; at-least-one-repeat = 21856. (verified)

#### Hidden

**Answer:** total = 65536; no-repeat = 43680; at-least-one-repeat = 21856.

**Approaches:**
- Multiplication rule: 16 choices per slot ⇒ 16^4 total; no-repeat shrinks options: 16·15·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(16,4); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (16·4=64 vs 16^4)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 16^4; no-repeat is nPk(16,4); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 16^4 and nPk(16,4) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>16)?
- If the first hex digit must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 16^n overflows.

### tmpl-sequence-count#m26-n4  ·  hard

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=26,n=4

**Prompt:** A 4-letter code is a string of 4 letters, each independently chosen from 26 possible letters. (a) How many distinct 4-letter codes exist? (b) How many use no repeated letter? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(4).fill(26)) · nPk(26,4) → total = 456976; no-repeat = 358800; at-least-one-repeat = 98176. (verified)

#### Hidden

**Answer:** total = 456976; no-repeat = 358800; at-least-one-repeat = 98176.

**Approaches:**
- Multiplication rule: 26 choices per slot ⇒ 26^4 total; no-repeat shrinks options: 26·25·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(26,4); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (26·4=104 vs 26^4)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 26^4; no-repeat is nPk(26,4); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 26^4 and nPk(26,4) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>26)?
- If the first letter must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 26^n overflows.

### tmpl-sequence-count#m6-n4  ·  hard

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=6,n=4

**Prompt:** A die-roll log is a string of 4 die outcomes, each independently chosen from 6 possible die outcomes. (a) How many distinct die-roll logs exist? (b) How many use no repeated die outcome? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(4).fill(6)) · nPk(6,4) → total = 1296; no-repeat = 360; at-least-one-repeat = 936. (verified)

#### Hidden

**Answer:** total = 1296; no-repeat = 360; at-least-one-repeat = 936.

**Approaches:**
- Multiplication rule: 6 choices per slot ⇒ 6^4 total; no-repeat shrinks options: 6·5·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(6,4); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (6·4=24 vs 6^4)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 6^4; no-repeat is nPk(6,4); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 6^4 and nPk(6,4) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>6)?
- If the first die outcome must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 6^n overflows.

### tmpl-perm-vs-comb#n10-k3  ·  hard

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=3,n=10

**Prompt:** From 10 signals you select 3. (a) If the 3 fill distinct ranked receiver slots (order matters), how many ways? (b) If they form an monitoring group (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(10,3) · nCk(10,3) · factorial(3) → ordered = 720; unordered = 120; they differ by k! = 6. (verified)

#### Hidden

**Answer:** ordered = 720; unordered = 120; they differ by k! = 6.

**Approaches:**
- nPk(10,3) for ordered; nCk(10,3) = nPk/3! for unordered
- Build a committee then count its 3! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=6 (overcounting by 6)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 3! of them into one.
3. One count is the other times 3! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 6 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the distinct ranked receiver slots are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-perm-vs-comb#n9-k4  ·  hard

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=4,n=9

**Prompt:** From 9 candidates you select 4. (a) If the 4 fill distinct executive roles (CEO/CFO/COO/CTO) (order matters), how many ways? (b) If they form an unordered team (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(9,4) · nCk(9,4) · factorial(4) → ordered = 3024; unordered = 126; they differ by k! = 24. (verified)

#### Hidden

**Answer:** ordered = 3024; unordered = 126; they differ by k! = 24.

**Approaches:**
- nPk(9,4) for ordered; nCk(9,4) = nPk/4! for unordered
- Build a committee then count its 4! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=24 (overcounting by 24)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 4! of them into one.
3. One count is the other times 4! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 24 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the distinct executive roles (CEO/CFO/COO/CTO) are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-perm-vs-comb#n8-k3  ·  hard

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=3,n=8

**Prompt:** From 8 runners you select 3. (a) If the 3 fill podium spots (gold/silver/bronze) (order matters), how many ways? (b) If they form an medal cohort (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(8,3) · nCk(8,3) · factorial(3) → ordered = 336; unordered = 56; they differ by k! = 6. (verified)

#### Hidden

**Answer:** ordered = 336; unordered = 56; they differ by k! = 6.

**Approaches:**
- nPk(8,3) for ordered; nCk(8,3) = nPk/3! for unordered
- Build a committee then count its 3! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=6 (overcounting by 6)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 3! of them into one.
3. One count is the other times 3! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 6 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the podium spots (gold/silver/bronze) are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-perm-vs-comb#n15-k4  ·  hard

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=4,n=15

**Prompt:** From 15 employees you select 4. (a) If the 4 fill ranked desk positions (by window access) (order matters), how many ways? (b) If they form an office cluster (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(15,4) · nCk(15,4) · factorial(4) → ordered = 32760; unordered = 1365; they differ by k! = 24. (verified)

#### Hidden

**Answer:** ordered = 32760; unordered = 1365; they differ by k! = 24.

**Approaches:**
- nPk(15,4) for ordered; nCk(15,4) = nPk/4! for unordered
- Build a committee then count its 4! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=24 (overcounting by 24)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 4! of them into one.
3. One count is the other times 4! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 24 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the ranked desk positions (by window access) are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-binomial-term#n10-identity  ·  hard

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:n=10,variant=identity

**Prompt:** Prove that the n=10 row of Pascal's triangle sums to 2^10 and is symmetric. State Σ_k C(10,k) as an integer and give an example mirror pair.

**Engine check:** `src/engine/combinatorics.ts` · pascalRow(10) · sum of row · nCk(10,4) · nCk(10,6) → Σ_k C(10,k) = 1024 = 2^10; the row is symmetric, e.g. C(10,4)=C(10,6)=210. (verified)

#### Hidden

**Answer:** Σ_k C(10,k) = 1024 = 2^10; the row is symmetric, e.g. C(10,4)=C(10,6)=210.

**Approaches:**
- Binomial theorem: (1+1)^10 = Σ_k C(10,k)·1^k = 2^10
- Combinatorial: each element is in or out ⇒ 2^10 subsets ⇒ 2^10 total
- Symmetry: choosing k-subset ↔ complementing to (n−k)-subset ⇒ C(n,k)=C(n,n−k)

**Wrong turns:**
- claiming the row sum is n² or n+1 or 10+1=11
- forgetting to include the empty and full subsets
- computing the sum as the number of elements, not the total of binomial coefficients

**Hint ladder:**
1. Evaluate the binomial (a+b)^10 at a=b=1 — what does each term become?
2. Alternatively, count subsets: each of the 10 elements is independently in or out.
3. For symmetry, a size-k subset is the complement of a size-(n−k) subset — they correspond 1-to-1.

**Rubric:**
- Correctness — 1024 + both proofs + a correct mirror pair
- Approach — binomial theorem evaluation and/or subset counting
- Rigor — a=b=1 substitution stated; symmetry bijection explained
- Communication — two distinct proofs given clearly
- Speed — 2^10=1024 written immediately

**Follow-ups:**
- How many subsets of an n-element set have even size? (= 2^(n−1))
- Compute Σ_k (−1)^k C(10,k) and explain why it vanishes.
- Which k gives the largest term in the n=10 row?

### tmpl-binomial-term#n12-k5-c1  ·  hard

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=1,k=5,n=12

**Prompt:** In the expansion of (a + 1·b)^12: (a) what is the coefficient of the a^7 b^5 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(12,5)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(12,5) · product(Array(5).fill(1)) · product(Array(12).fill(2)) → coefficient = C(12,5)·1^5 = 792; all coefficients sum to (1+1)^12 = 4096; C(12,5) = C(12,7) = 792. (verified)

#### Hidden

**Answer:** coefficient = C(12,5)·1^5 = 792; all coefficients sum to (1+1)^12 = 4096; C(12,5) = C(12,7) = 792.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(12,5)·1^5
- Set a=b=1: Σ coefficients = (1+1)^12 = 4096
- Symmetry: C(12,5)=C(12,7) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 1^5 (writing just C(12,5)=792)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (5 or 7) pairs with the 1·b factor

**Hint ladder:**
1. The b-power term carries the constant 1 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+1)^12.
3. Coefficient is C(12,5)·1^5; the mirror term swaps k↔7.

**Rubric:**
- Correctness — coefficient=792, sum=4096, mirror=C(12,7)=792
- Approach — binomial theorem, not manual expansion
- Rigor — 1^5 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(12,5)·1^5 directly

**Follow-ups:**
- What is the coefficient of the a^6 b^6 term (i.e. the next term)?
- Use (a+1b)^12 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(12,k)·1^k and explain why it equals (1−1)^12=0.

### tmpl-pigeonhole#items8-holes7-t3  ·  hard

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=7,items=8,t=3

**Prompt:** A dark drawer contains socks in 7 colors; you draw 8 in the dark. (a) Identify the holes (this is the whole trick). (b) Must two socks share a hole? (c) What is the largest count guaranteed in some hole? (d) How many socks would force some hole to hold at least 3?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(8,7) · pigeonholeMin(8,7) · pigeonholeMin(15,7) → holes = 7; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 15 items. (verified)

#### Hidden

**Answer:** holes = 7; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 15 items.

**Approaches:**
- Identify 7 holes (categories); 8 items vs 7 holes
- 8 > 7 ⇒ collision forced (pigeonhole)
- ⌈8/7⌉ = 2 guaranteed in one hole; invert for threshold: (t−1)·7+1 = 15

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊8/7⌋=1 instead of ⌈8/7⌉=2
- off-by-one on the threshold: 14 (not 15) forces only ≥2
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 7 categories they fall into?
2. Compare 8 items to 7 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈8/7⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 3, then add one more item.

**Rubric:**
- Correctness — holes=7, collision forced=true, guaranteed min=2, threshold=15
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 8>7 (or 8<=7) given instantly

**Follow-ups:**
- What is the minimum number of socks to guarantee some hole has at least 4?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-pigeonhole#items367-holes366-t3  ·  hard

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=366,items=367,t=3

**Prompt:** 367 people attend a gathering (no leap years; calendar has 366 days). (a) Identify the holes (this is the whole trick). (b) Must two people share a hole? (c) What is the largest count guaranteed in some hole? (d) How many people would force some hole to hold at least 3?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(367,366) · pigeonholeMin(367,366) · pigeonholeMin(733,366) → holes = 366; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 733 items. (verified)

#### Hidden

**Answer:** holes = 366; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 733 items.

**Approaches:**
- Identify 366 holes (categories); 367 items vs 366 holes
- 367 > 366 ⇒ collision forced (pigeonhole)
- ⌈367/366⌉ = 2 guaranteed in one hole; invert for threshold: (t−1)·366+1 = 733

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊367/366⌋=1 instead of ⌈367/366⌉=2
- off-by-one on the threshold: 732 (not 733) forces only ≥2
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 366 categories they fall into?
2. Compare 367 items to 366 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈367/366⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 3, then add one more item.

**Rubric:**
- Correctness — holes=366, collision forced=true, guaranteed min=2, threshold=733
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 367>366 (or 367<=366) given instantly

**Follow-ups:**
- What is the minimum number of people to guarantee some hole has at least 4?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-inclusion-exclusion#2set-a120-b90-ab30-N250  ·  hard

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:a=120,ab=30,b=90,n=250,variant=2set

**Prompt:** Of 250 students, 120 have property A, 90 have property B, and 30 have both. (a) How many have A or B? (b) How many have exactly one of the two? (c) How many have neither?

**Engine check:** `src/engine/combinatorics.ts` · unionSize(120,90,30) · inclusionExclusion([+120,+90,-30,-30]) · 250n - union → A or B = 180; exactly one = 150; neither = 70. (verified)

#### Hidden

**Answer:** A or B = 180; exactly one = 150; neither = 70.

**Approaches:**
- |A∪B| = |A|+|B|−|A∩B| = 120+90−30 = 180
- Exactly-one = |A|+|B|−2|A∩B| = 120+90−2·30 = 150
- Neither = 250 − |A∪B| = 250 − 180 = 70

**Wrong turns:**
- |A∪B|=|A|+|B|=210 (forgetting to subtract the 30 overlap)
- getting exactly-one wrong: subtracting ab once instead of twice
- confusing 'at least one' with 'exactly one'
- forgetting to use N=250 for 'neither'

**Hint ladder:**
1. Every element in both A and B is counted twice in |A|+|B| — what must you subtract?
2. |A∪B| = |A|+|B|−|A∩B|; then neither = universe − union.
3. Exactly-one means in A or B but not both: add A and B then subtract twice the overlap (−2·30).

**Rubric:**
- Correctness — union=180, exactly-one=150, neither=70
- Approach — signed inclusion–exclusion with correct signs
- Rigor — explains subtraction of ab once (union) vs twice (exactly-one)
- Communication — draws or describes the Venn diagram regions
- Speed — writes A+B−AB for the union immediately

**Follow-ups:**
- Add a third set C — what is the new union formula?
- Express 'at most one of A, B' from these pieces.
- Re-pose with set sizes derived from divisibility within 1…N.

### tmpl-inclusion-exclusion#2set-a200-b150-ab70-N400  ·  hard

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:a=200,ab=70,b=150,n=400,variant=2set

**Prompt:** Of 400 customers, 200 have property A, 150 have property B, and 70 have both. (a) How many have A or B? (b) How many have exactly one of the two? (c) How many have neither?

**Engine check:** `src/engine/combinatorics.ts` · unionSize(200,150,70) · inclusionExclusion([+200,+150,-70,-70]) · 400n - union → A or B = 280; exactly one = 210; neither = 120. (verified)

#### Hidden

**Answer:** A or B = 280; exactly one = 210; neither = 120.

**Approaches:**
- |A∪B| = |A|+|B|−|A∩B| = 200+150−70 = 280
- Exactly-one = |A|+|B|−2|A∩B| = 200+150−2·70 = 210
- Neither = 400 − |A∪B| = 400 − 280 = 120

**Wrong turns:**
- |A∪B|=|A|+|B|=350 (forgetting to subtract the 70 overlap)
- getting exactly-one wrong: subtracting ab once instead of twice
- confusing 'at least one' with 'exactly one'
- forgetting to use N=400 for 'neither'

**Hint ladder:**
1. Every element in both A and B is counted twice in |A|+|B| — what must you subtract?
2. |A∪B| = |A|+|B|−|A∩B|; then neither = universe − union.
3. Exactly-one means in A or B but not both: add A and B then subtract twice the overlap (−2·70).

**Rubric:**
- Correctness — union=280, exactly-one=210, neither=120
- Approach — signed inclusion–exclusion with correct signs
- Rigor — explains subtraction of ab once (union) vs twice (exactly-one)
- Communication — draws or describes the Venn diagram regions
- Speed — writes A+B−AB for the union immediately

**Follow-ups:**
- Add a third set C — what is the new union formula?
- Express 'at most one of A, B' from these pieces.
- Re-pose with set sizes derived from divisibility within 1…N.

### ff-socks-pair-triple  ·  hard

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** sem:58d617faab6c

**Prompt:** A dark drawer holds socks in 6 colors. (a) How many must you draw to guarantee a matching pair? (b) To guarantee a matching triple?

**Engine check:** `src/engine/combinatorics.ts` · pigeonholeMin(7,6)=2 → threshold 7 for a pair · pigeonholeMin(13,6)=3 → threshold 13 for a triple → (a) 7; (b) 13. (verified)

#### Hidden

**Answer:** (a) 7; (b) 13.

**Approaches:**
- Worst case for a pair: one sock per color = 6, then the next forces a repeat ⇒ 7
- Worst case for a triple: two socks per color = 12, then the next forces a triple ⇒ 13
- (t−1)·colors + 1 gives the threshold: (2−1)·6+1=7; (3−1)·6+1=13

**Wrong turns:**
- answering 6 (off-by-one for the pair)
- answering 12 (off-by-one for the triple)
- using socks-per-color as the hole count (wrong pigeons vs holes)
- thinking the largest pile determines the threshold (irrelevant)

**Hint ladder:**
1. What is the most socks you can hold with no matching pair? That is the worst case.
2. 6 colors ⇒ 6 singletons is the adversarial worst case; the next sock must match one.
3. For a triple, fill every color twice first (12 socks), then one more forces a triple.

**Rubric:**
- Correctness — 7 for a pair and 13 for a triple
- Approach — worst-case construction; threshold = (t−1)·colors+1
- Rigor — the +1 is explicitly justified by the adversarial argument
- Communication — names the adversary who maximizes draws before a forced repeat
- Speed — 7 and 13 stated immediately via (t−1)·k+1

**Follow-ups:**
- How many draws guarantee two different matched pairs?
- Generalize to c colors and a t-of-a-kind threshold.
- Why is the maximum pile size a decoy rather than the answer?

### ff-subsets-2n  ·  hard

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** sem:2f31bd88f98f

**Prompt:** An n-element set has how many subsets? (a) Prove the count is 2^n two ways: per-element choice, and the binomial row sum. (b) Show C(n,k)=C(n,n−k). Verify both for n=12.

**Engine check:** `src/engine/combinatorics.ts` · pascalRow(12) · row12.reduce((a,b)=>a+b,0n)=4096 · nCk(12,3)=220 · nCk(12,9)=220 → 4096 subsets for n=12; Σ_k C(12,k) = 2¹² = 4096; symmetric, e.g. C(12,3)=C(12,9)=220. (verified)

#### Hidden

**Answer:** 4096 subsets for n=12; Σ_k C(12,k) = 2¹² = 4096; symmetric, e.g. C(12,3)=C(12,9)=220.

**Approaches:**
- Per-element: each of the 12 elements is independently in or out ⇒ 2^12 = 4096
- Row sum: Σ_k C(12,k) = (1+1)^12 = 2^12 by setting a=b=1 in the binomial theorem
- Symmetry: size-k subset ↔ size-(n−k) complement ⇒ C(n,k)=C(n,n−k)

**Wrong turns:**
- n²=144 or n+1=13 thinking
- forgetting the empty and full subsets in the count
- thinking the row sum depends on how many elements are chosen

**Hint ladder:**
1. Decide independently for each element: include or exclude. How many total binary choices?
2. Alternatively, sum subsets by size: Σ_k C(12,k) — evaluate the binomial at a=b=1.
3. Symmetry: the size-k subsets pair 1-to-1 with size-(12−k) subsets via complementation.

**Rubric:**
- Correctness — 4096 + both proofs + a correct mirror pair C(12,3)=C(12,9)
- Approach — two independent proofs plus the bijection argument
- Rigor — a=b=1 substitution stated; bijection for symmetry explained
- Communication — clearly separates the two distinct proofs
- Speed — 2^12=4096 written immediately

**Follow-ups:**
- How many subsets of a 12-element set have even size? (= 2^11 = 2048)
- Compute Σ_k k·C(12,k).
- Connect the row sum to the number of heads outcomes over 12 fair coin flips.

#### Tier: harder

### tmpl-sequence-count#m26-n5  ·  harder

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=26,n=5

**Prompt:** A 5-letter code is a string of 5 letters, each independently chosen from 26 possible letters. (a) How many distinct 5-letter codes exist? (b) How many use no repeated letter? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(5).fill(26)) · nPk(26,5) → total = 11881376; no-repeat = 7893600; at-least-one-repeat = 3987776. (verified)

#### Hidden

**Answer:** total = 11881376; no-repeat = 7893600; at-least-one-repeat = 3987776.

**Approaches:**
- Multiplication rule: 26 choices per slot ⇒ 26^5 total; no-repeat shrinks options: 26·25·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(26,5); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (26·5=130 vs 26^5)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 26^5; no-repeat is nPk(26,5); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 26^5 and nPk(26,5) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>26)?
- If the first letter must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 26^n overflows.

### tmpl-sequence-count#m12-n5  ·  harder

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=12,n=5

**Prompt:** A base-12 id is a string of 5 base-12 digits, each independently chosen from 12 possible base-12 digits. (a) How many distinct base-12 ids exist? (b) How many use no repeated base-12 digit? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(5).fill(12)) · nPk(12,5) → total = 248832; no-repeat = 95040; at-least-one-repeat = 153792. (verified)

#### Hidden

**Answer:** total = 248832; no-repeat = 95040; at-least-one-repeat = 153792.

**Approaches:**
- Multiplication rule: 12 choices per slot ⇒ 12^5 total; no-repeat shrinks options: 12·11·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(12,5); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (12·5=60 vs 12^5)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 12^5; no-repeat is nPk(12,5); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 12^5 and nPk(12,5) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>12)?
- If the first base-12 digit must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 12^n overflows.

### tmpl-sequence-count#m4-n6  ·  harder

**Source:** Green Book §4.2 p.33–36

**Fingerprint:** tmpl-sequence-count:m=4,n=6

**Prompt:** A 6-symbol DNA string over {A,C,G,T} is a string of 6 nucleotides, each independently chosen from 4 possible nucleotides. (a) How many distinct 6-symbol DNA string over {A,C,G,T}s exist? (b) How many use no repeated nucleotide? (c) How many contain at least one repeat? Explain why (c) is the natural quantity behind a hash/birthday collision.

**Engine check:** `src/engine/combinatorics.ts` · product(Array(6).fill(4)) · nPk(4,6) → total = 4096; no-repeat = 0; at-least-one-repeat = 4096. (verified)

#### Hidden

**Answer:** total = 4096; no-repeat = 0; at-least-one-repeat = 4096.

**Approaches:**
- Multiplication rule: 4 choices per slot ⇒ 4^6 total; no-repeat shrinks options: 4·3·…
- Complement: total minus no-repeat gives ≥1-repeat in one subtraction
- no-repeat = nPk(4,6); when n>m pigeonhole forces it to 0

**Wrong turns:**
- add-not-multiply (4·6=24 vs 4^6)
- using nCk — order matters in a sequence
- computing ≥1-repeat directly via inclusion–exclusion instead of the complement shortcut
- forgetting n>m forces 0 no-repeat arrangements (pigeonhole)

**Hint ladder:**
1. How many independent choices are there, and how many options per slot?
2. No-repeat means each slot loses one option — that is an ordered selection without replacement.
3. Total is 4^6; no-repeat is nPk(4,6); the repeat count is one subtraction away.

**Rubric:**
- Correctness — all three counts exact and the collision interpretation stated
- Approach — multiplication rule for total + complement for the repeat count
- Rigor — states independence, that order matters, and the n>m edge case
- Communication — names the birthday/hash connection explicitly
- Speed — writes 4^6 and nPk(4,6) on sight without hesitation

**Follow-ups:**
- At what n does no-repeat first become impossible (n>4)?
- If the first nucleotide must differ from the last, how does the total count change?
- Give the collision probability and explain why comparing BigInt counts beats floats when 4^n overflows.

### tmpl-perm-vs-comb#n12-k5  ·  harder

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=5,n=12

**Prompt:** From 12 candidates you select 5. (a) If the 5 fill ranked interview slots (order matters), how many ways? (b) If they form an unordered shortlist (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(12,5) · nCk(12,5) · factorial(5) → ordered = 95040; unordered = 792; they differ by k! = 120. (verified)

#### Hidden

**Answer:** ordered = 95040; unordered = 792; they differ by k! = 120.

**Approaches:**
- nPk(12,5) for ordered; nCk(12,5) = nPk/5! for unordered
- Build a committee then count its 5! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=120 (overcounting by 120)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 5! of them into one.
3. One count is the other times 5! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 120 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the ranked interview slots are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-perm-vs-comb#n20-k3  ·  harder

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=3,n=20

**Prompt:** From 20 trades you select 3. (a) If the 3 fill top-3 ranked portfolio positions (order matters), how many ways? (b) If they form an unordered execution batch (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(20,3) · nCk(20,3) · factorial(3) → ordered = 6840; unordered = 1140; they differ by k! = 6. (verified)

#### Hidden

**Answer:** ordered = 6840; unordered = 1140; they differ by k! = 6.

**Approaches:**
- nPk(20,3) for ordered; nCk(20,3) = nPk/3! for unordered
- Build a committee then count its 3! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=6 (overcounting by 6)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 3! of them into one.
3. One count is the other times 3! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 6 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the top-3 ranked portfolio positions are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-perm-vs-comb#n13-k5  ·  harder

**Source:** Green Book §4.2 p.33–34

**Fingerprint:** tmpl-perm-vs-comb:k=5,n=13

**Prompt:** From 13 cards you select 5. (a) If the 5 fill ordered positional slots (order matters), how many ways? (b) If they form an unordered hand (order does not matter), how many ways? (c) By exactly what factor do (a) and (b) differ, and why?

**Engine check:** `src/engine/combinatorics.ts` · nPk(13,5) · nCk(13,5) · factorial(5) → ordered = 154440; unordered = 1287; they differ by k! = 120. (verified)

#### Hidden

**Answer:** ordered = 154440; unordered = 1287; they differ by k! = 120.

**Approaches:**
- nPk(13,5) for ordered; nCk(13,5) = nPk/5! for unordered
- Build a committee then count its 5! orderings: nPk = nCk · k!
- Ask 'does relabeling the chosen set change the outcome?' to decide order vs combination

**Wrong turns:**
- treating ordered = unordered (the classic trap)
- forgetting to divide by k!=120 (overcounting by 120)
- using (k−1)! instead of k!
- assuming the wording 'top-3' always means unordered

**Hint ladder:**
1. Does swapping two chosen people give a different outcome in this context?
2. Ranked slots distinguish orderings; an unordered group collapses all 5! of them into one.
3. One count is the other times 5! — identify which is bigger and divide or multiply accordingly.

**Rubric:**
- Correctness — both counts plus the exact multiplicative factor k!
- Approach — nPk = nCk · k! stated and justified
- Rigor — justifies whether order matters from the problem wording
- Communication — explains the k! collapse clearly
- Speed — gives 120 as the gap immediately

**Follow-ups:**
- Generalize: for choosing k of N, by what factor do ordered and unordered differ?
- If two of the ordered positional slots are interchangeable, what additional factor divides out?
- Reframe the problem so a candidate must detect that order secretly matters.

### tmpl-derangement#n5  ·  harder

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=5

**Prompt:** 5 letters are matched to 5 envelopes by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no letter hit its correct envelope? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(5) · factorial(5) · reduce(44n,120n) → all-wrong = 44; at-least-one = 76; P(all wrong) = 11/30; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 44; at-least-one = 76; P(all wrong) = 11/30; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_5 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one letter lands in the correct envelope?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-derangement#n6  ·  harder

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=6

**Prompt:** 6 gifts are matched to 6 people by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no gift hit its correct peopl? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(6) · factorial(6) · reduce(265n,720n) → all-wrong = 265; at-least-one = 455; P(all wrong) = 53/144; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 265; at-least-one = 455; P(all wrong) = 53/144; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_6 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one gift lands in the correct peopl?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-derangement#n7  ·  harder

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=7

**Prompt:** 7 hats are matched to 7 guests by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no hat hit its correct guest? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(7) · factorial(7) · reduce(1854n,5040n) → all-wrong = 1854; at-least-one = 3186; P(all wrong) = 103/280; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 1854; at-least-one = 3186; P(all wrong) = 103/280; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_7 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one hat lands in the correct guest?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-poker-hand#fourOfAKind  ·  harder

**Source:** Green Book §4.2 p.34

**Fingerprint:** tmpl-poker-hand:variant=fourOfAKind

**Prompt:** A 5-card hand is dealt from a standard 52-card deck. For four-of-a-kind: (a) count the hands from scratch, stating every factor; (b) give the exact probability; (c) give the odds against; (d) name the one decomposition pitfall most candidates hit on this hand.

**Engine check:** `src/engine/combinatorics.ts` · product([13,48]) · probabilityFromCounts(624,2598960) · reduce(2598336n,624n) → four-of-a-kind: 624 hands; P = 1/4165; odds against 4164:1. (verified)

#### Hidden

**Answer:** four-of-a-kind: 624 hands; P = 1/4165; odds against 4164:1.

**Approaches:**
- Product of independent choices (rank(s) × suit-choices × kicker): 13 × 48 = 624
- Probability = 624 ÷ C(52,5) = 624 ÷ 2,598,960; reduce
- Odds against = (total − count) : count, then reduce

**Wrong turns:**
- kicker must be one of the 48 remaining cards (not 12); 13 ranks for the quad, 48 for the kicker
- 'count IS the probability' (forgetting ÷ 2,598,960)
- assuming 'fancier-looking hand ⇒ rarer' without computing
- using C(13,2) vs 13×12 for the wrong hand (swap the symmetric/asymmetric reasoning)

**Hint ladder:**
1. What independent choices build exactly one four-of-a-kind — which ranks, which suits, which kicker?
2. Watch the kicker constraint and decide whether the two primary ranks play symmetric or asymmetric roles.
3. Multiply the factors for the count, divide by 2,598,960, reduce — the shared denominator is 4165.

**Rubric:**
- Correctness — count = 624, reduced P = 1/4165, odds = 4164:1
- Approach — clean product decomposition; every factor justified
- Rigor — kicker constraint and ordered/unordered rank decision explicitly stated
- Communication — explains the shared-4165 denominator structure
- Speed — recalls C(52,5)=2,598,960 immediately and builds product on sight

**Follow-ups:**
- Count two pairs next and compare the relative likelihoods.
- How many times more likely is two pairs than four-of-a-kind?
- Re-derive the count via a completely independent method to confirm.

### tmpl-poker-hand#fullHouse  ·  harder

**Source:** Green Book §4.2 p.34

**Fingerprint:** tmpl-poker-hand:variant=fullHouse

**Prompt:** A 5-card hand is dealt from a standard 52-card deck. For a full house: (a) count the hands from scratch, stating every factor; (b) give the exact probability; (c) give the odds against; (d) name the one decomposition pitfall most candidates hit on this hand.

**Engine check:** `src/engine/combinatorics.ts` · product([13,4,12,6]) · probabilityFromCounts(3744,2598960) · reduce(2595216n,3744n) → a full house: 3744 hands; P = 6/4165; odds against 4159:6. (verified)

#### Hidden

**Answer:** a full house: 3744 hands; P = 6/4165; odds against 4159:6.

**Approaches:**
- Product of independent choices (rank(s) × suit-choices × kicker): 13 × 4 × 12 × 6 = 3744
- Probability = 3744 ÷ C(52,5) = 3744 ÷ 2,598,960; reduce
- Odds against = (total − count) : count, then reduce

**Wrong turns:**
- triple-rank and pair-rank are DISTINCT roles ⇒ 13·12 ordered, not C(13,2); then C(4,3)=4 suits for triple, C(4,2)=6 for pair
- 'count IS the probability' (forgetting ÷ 2,598,960)
- assuming 'fancier-looking hand ⇒ rarer' without computing
- using C(13,2) vs 13×12 for the wrong hand (swap the symmetric/asymmetric reasoning)

**Hint ladder:**
1. What independent choices build exactly one a full house — which ranks, which suits, which kicker?
2. Watch the kicker constraint and decide whether the two primary ranks play symmetric or asymmetric roles.
3. Multiply the factors for the count, divide by 2,598,960, reduce — the shared denominator is 4165.

**Rubric:**
- Correctness — count = 3744, reduced P = 6/4165, odds = 4159:6
- Approach — clean product decomposition; every factor justified
- Rigor — kicker constraint and ordered/unordered rank decision explicitly stated
- Communication — explains the shared-4165 denominator structure
- Speed — recalls C(52,5)=2,598,960 immediately and builds product on sight

**Follow-ups:**
- Count two pairs next and compare the relative likelihoods.
- How many times more likely is two pairs than four-of-a-kind?
- Re-derive the count via a completely independent method to confirm.

### tmpl-poker-hand#twoPairs  ·  harder

**Source:** Green Book §4.2 p.34

**Fingerprint:** tmpl-poker-hand:variant=twoPairs

**Prompt:** A 5-card hand is dealt from a standard 52-card deck. For two pairs: (a) count the hands from scratch, stating every factor; (b) give the exact probability; (c) give the odds against; (d) name the one decomposition pitfall most candidates hit on this hand.

**Engine check:** `src/engine/combinatorics.ts` · product([78,6,6,44]) · probabilityFromCounts(123552,2598960) · reduce(2475408n,123552n) → two pairs: 123552 hands; P = 198/4165; odds against 3967:198. (verified)

#### Hidden

**Answer:** two pairs: 123552 hands; P = 198/4165; odds against 3967:198.

**Approaches:**
- Product of independent choices (rank(s) × suit-choices × kicker): 78 × 6 × 6 × 44 = 123552
- Probability = 123552 ÷ C(52,5) = 123552 ÷ 2,598,960; reduce
- Odds against = (total − count) : count, then reduce

**Wrong turns:**
- the two pair ranks are SYMMETRIC ⇒ C(13,2)=78 unordered; kicker must avoid the two chosen ranks (44 cards, not 48)
- 'count IS the probability' (forgetting ÷ 2,598,960)
- assuming 'fancier-looking hand ⇒ rarer' without computing
- using C(13,2) vs 13×12 for the wrong hand (swap the symmetric/asymmetric reasoning)

**Hint ladder:**
1. What independent choices build exactly one two pairs — which ranks, which suits, which kicker?
2. Watch the kicker constraint and decide whether the two primary ranks play symmetric or asymmetric roles.
3. Multiply the factors for the count, divide by 2,598,960, reduce — the shared denominator is 4165.

**Rubric:**
- Correctness — count = 123552, reduced P = 198/4165, odds = 3967:198
- Approach — clean product decomposition; every factor justified
- Rigor — kicker constraint and ordered/unordered rank decision explicitly stated
- Communication — explains the shared-4165 denominator structure
- Speed — recalls C(52,5)=2,598,960 immediately and builds product on sight

**Follow-ups:**
- Count one pair next and compare the relative likelihoods.
- How many times more likely is two pairs than four-of-a-kind?
- Re-derive the count via a completely independent method to confirm.

### tmpl-binomial-term#n10-k3-c2  ·  harder

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=2,k=3,n=10

**Prompt:** In the expansion of (a + 2·b)^10: (a) what is the coefficient of the a^7 b^3 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(10,3)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(10,3) · product(Array(3).fill(2)) · product(Array(10).fill(3)) → coefficient = C(10,3)·2^3 = 960; all coefficients sum to (1+2)^10 = 59049; C(10,3) = C(10,7) = 120. (verified)

#### Hidden

**Answer:** coefficient = C(10,3)·2^3 = 960; all coefficients sum to (1+2)^10 = 59049; C(10,3) = C(10,7) = 120.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(10,3)·2^3
- Set a=b=1: Σ coefficients = (1+2)^10 = 59049
- Symmetry: C(10,3)=C(10,7) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 2^3 (writing just C(10,3)=120)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (3 or 7) pairs with the 2·b factor

**Hint ladder:**
1. The b-power term carries the constant 2 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+2)^10.
3. Coefficient is C(10,3)·2^3; the mirror term swaps k↔7.

**Rubric:**
- Correctness — coefficient=960, sum=59049, mirror=C(10,7)=120
- Approach — binomial theorem, not manual expansion
- Rigor — 2^3 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(10,3)·2^3 directly

**Follow-ups:**
- What is the coefficient of the a^6 b^4 term (i.e. the next term)?
- Use (a+2b)^10 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(10,k)·2^k and explain why it equals (1−2)^10=1.

### tmpl-binomial-term#n8-k3-c10  ·  harder

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=10,k=3,n=8

**Prompt:** In the expansion of (a + 10·b)^8: (a) what is the coefficient of the a^5 b^3 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(8,3)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(8,3) · product(Array(3).fill(10)) · product(Array(8).fill(11)) → coefficient = C(8,3)·10^3 = 56000; all coefficients sum to (1+10)^8 = 214358881; C(8,3) = C(8,5) = 56. (verified)

#### Hidden

**Answer:** coefficient = C(8,3)·10^3 = 56000; all coefficients sum to (1+10)^8 = 214358881; C(8,3) = C(8,5) = 56.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(8,3)·10^3
- Set a=b=1: Σ coefficients = (1+10)^8 = 214358881
- Symmetry: C(8,3)=C(8,5) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 10^3 (writing just C(8,3)=56)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (3 or 5) pairs with the 10·b factor

**Hint ladder:**
1. The b-power term carries the constant 10 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+10)^8.
3. Coefficient is C(8,3)·10^3; the mirror term swaps k↔5.

**Rubric:**
- Correctness — coefficient=56000, sum=214358881, mirror=C(8,5)=56
- Approach — binomial theorem, not manual expansion
- Rigor — 10^3 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(8,3)·10^3 directly

**Follow-ups:**
- What is the coefficient of the a^4 b^4 term (i.e. the next term)?
- Use (a+10b)^8 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(8,k)·10^k and explain why it equals (1−10)^8=43046721.

### tmpl-binomial-term#n7-k4-c3  ·  harder

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=3,k=4,n=7

**Prompt:** In the expansion of (a + 3·b)^7: (a) what is the coefficient of the a^3 b^4 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(7,4)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(7,4) · product(Array(4).fill(3)) · product(Array(7).fill(4)) → coefficient = C(7,4)·3^4 = 2835; all coefficients sum to (1+3)^7 = 16384; C(7,4) = C(7,3) = 35. (verified)

#### Hidden

**Answer:** coefficient = C(7,4)·3^4 = 2835; all coefficients sum to (1+3)^7 = 16384; C(7,4) = C(7,3) = 35.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(7,4)·3^4
- Set a=b=1: Σ coefficients = (1+3)^7 = 16384
- Symmetry: C(7,4)=C(7,3) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 3^4 (writing just C(7,4)=35)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (4 or 3) pairs with the 3·b factor

**Hint ladder:**
1. The b-power term carries the constant 3 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+3)^7.
3. Coefficient is C(7,4)·3^4; the mirror term swaps k↔3.

**Rubric:**
- Correctness — coefficient=2835, sum=16384, mirror=C(7,3)=35
- Approach — binomial theorem, not manual expansion
- Rigor — 3^4 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(7,4)·3^4 directly

**Follow-ups:**
- What is the coefficient of the a^2 b^5 term (i.e. the next term)?
- Use (a+3b)^7 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(7,k)·3^k and explain why it equals (1−3)^7=-128.

### tmpl-binomial-term#n9-k4-c2  ·  harder

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=2,k=4,n=9

**Prompt:** In the expansion of (a + 2·b)^9: (a) what is the coefficient of the a^5 b^4 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(9,4)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(9,4) · product(Array(4).fill(2)) · product(Array(9).fill(3)) → coefficient = C(9,4)·2^4 = 2016; all coefficients sum to (1+2)^9 = 19683; C(9,4) = C(9,5) = 126. (verified)

#### Hidden

**Answer:** coefficient = C(9,4)·2^4 = 2016; all coefficients sum to (1+2)^9 = 19683; C(9,4) = C(9,5) = 126.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(9,4)·2^4
- Set a=b=1: Σ coefficients = (1+2)^9 = 19683
- Symmetry: C(9,4)=C(9,5) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 2^4 (writing just C(9,4)=126)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (4 or 5) pairs with the 2·b factor

**Hint ladder:**
1. The b-power term carries the constant 2 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+2)^9.
3. Coefficient is C(9,4)·2^4; the mirror term swaps k↔5.

**Rubric:**
- Correctness — coefficient=2016, sum=19683, mirror=C(9,5)=126
- Approach — binomial theorem, not manual expansion
- Rigor — 2^4 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(9,4)·2^4 directly

**Follow-ups:**
- What is the coefficient of the a^4 b^5 term (i.e. the next term)?
- Use (a+2b)^9 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(9,k)·2^k and explain why it equals (1−2)^9=-1.

### tmpl-binomial-term#n6-k3-c5  ·  harder

**Source:** Green Book §4.2 p.33, p.36–37

**Fingerprint:** tmpl-binomial-term:c=5,k=3,n=6

**Prompt:** In the expansion of (a + 5·b)^6: (a) what is the coefficient of the a^3 b^3 term? (b) what do all the coefficients sum to, and why? (c) which other binomial coefficient equals C(6,3)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,3) · product(Array(3).fill(5)) · product(Array(6).fill(6)) → coefficient = C(6,3)·5^3 = 2500; all coefficients sum to (1+5)^6 = 46656; C(6,3) = C(6,3) = 20. (verified)

#### Hidden

**Answer:** coefficient = C(6,3)·5^3 = 2500; all coefficients sum to (1+5)^6 = 46656; C(6,3) = C(6,3) = 20.

**Approaches:**
- Binomial theorem: the a^{n-k}b^k term has coefficient C(6,3)·5^3
- Set a=b=1: Σ coefficients = (1+5)^6 = 46656
- Symmetry: C(6,3)=C(6,3) by the complement bijection

**Wrong turns:**
- freshman's dream: forgetting 5^3 (writing just C(6,3)=20)
- claiming the sum is always 2^n regardless of c
- misreading which exponent (3 or 3) pairs with the 5·b factor

**Hint ladder:**
1. The b-power term carries the constant 5 raised to a power — which power?
2. Set a=b=1 to total all coefficients: (1+5)^6.
3. Coefficient is C(6,3)·5^3; the mirror term swaps k↔3.

**Rubric:**
- Correctness — coefficient=2500, sum=46656, mirror=C(6,3)=20
- Approach — binomial theorem, not manual expansion
- Rigor — 5^3 factor handled and a=b=1 argument stated
- Communication — explains "choose k factors to contribute b" meaning
- Speed — writes C(6,3)·5^3 directly

**Follow-ups:**
- What is the coefficient of the a^2 b^4 term (i.e. the next term)?
- Use (a+5b)^6 to analyze the last two digits of a related expression.
- Evaluate Σ_k (−1)^k C(6,k)·5^k and explain why it equals (1−5)^6=4096.

### tmpl-pigeonhole#items13-holes12-t3  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=12,items=13,t=3

**Prompt:** 13 people are in a room and their birth months are examined. (a) Identify the holes (this is the whole trick). (b) Must two people share a hole? (c) What is the largest count guaranteed in some hole? (d) How many people would force some hole to hold at least 3?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(13,12) · pigeonholeMin(13,12) · pigeonholeMin(25,12) → holes = 12; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 25 items. (verified)

#### Hidden

**Answer:** holes = 12; collision forced = true; some hole holds ≥ 2; to force ≥ 3 you need 25 items.

**Approaches:**
- Identify 12 holes (categories); 13 items vs 12 holes
- 13 > 12 ⇒ collision forced (pigeonhole)
- ⌈13/12⌉ = 2 guaranteed in one hole; invert for threshold: (t−1)·12+1 = 25

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊13/12⌋=1 instead of ⌈13/12⌉=2
- off-by-one on the threshold: 24 (not 25) forces only ≥2
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 12 categories they fall into?
2. Compare 13 items to 12 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈13/12⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 3, then add one more item.

**Rubric:**
- Correctness — holes=12, collision forced=true, guaranteed min=2, threshold=25
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 13>12 (or 13<=12) given instantly

**Follow-ups:**
- What is the minimum number of people to guarantee some hole has at least 4?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-pigeonhole#items9-holes4-t4  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=4,items=9,t=4

**Prompt:** You draw 9 socks from a drawer with socks in 4 colors. (a) Identify the holes (this is the whole trick). (b) Must two socks share a hole? (c) What is the largest count guaranteed in some hole? (d) How many socks would force some hole to hold at least 4?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(9,4) · pigeonholeMin(9,4) · pigeonholeMin(13,4) → holes = 4; collision forced = true; some hole holds ≥ 3; to force ≥ 4 you need 13 items. (verified)

#### Hidden

**Answer:** holes = 4; collision forced = true; some hole holds ≥ 3; to force ≥ 4 you need 13 items.

**Approaches:**
- Identify 4 holes (categories); 9 items vs 4 holes
- 9 > 4 ⇒ collision forced (pigeonhole)
- ⌈9/4⌉ = 3 guaranteed in one hole; invert for threshold: (t−1)·4+1 = 13

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊9/4⌋=2 instead of ⌈9/4⌉=3
- off-by-one on the threshold: 12 (not 13) forces only ≥3
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 4 categories they fall into?
2. Compare 9 items to 4 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈9/4⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 4, then add one more item.

**Rubric:**
- Correctness — holes=4, collision forced=true, guaranteed min=3, threshold=13
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 9>4 (or 9<=4) given instantly

**Follow-ups:**
- What is the minimum number of socks to guarantee some hole has at least 5?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-pigeonhole#items100-holes7-t16  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=7,items=100,t=16

**Prompt:** 100 people are each assigned a day of the week as their meeting day. (a) Identify the holes (this is the whole trick). (b) Must two people share a hole? (c) What is the largest count guaranteed in some hole? (d) How many people would force some hole to hold at least 16?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(100,7) · pigeonholeMin(100,7) · pigeonholeMin(106,7) → holes = 7; collision forced = true; some hole holds ≥ 15; to force ≥ 16 you need 106 items. (verified)

#### Hidden

**Answer:** holes = 7; collision forced = true; some hole holds ≥ 15; to force ≥ 16 you need 106 items.

**Approaches:**
- Identify 7 holes (categories); 100 items vs 7 holes
- 100 > 7 ⇒ collision forced (pigeonhole)
- ⌈100/7⌉ = 15 guaranteed in one hole; invert for threshold: (t−1)·7+1 = 106

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊100/7⌋=14 instead of ⌈100/7⌉=15
- off-by-one on the threshold: 105 (not 106) forces only ≥15
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 7 categories they fall into?
2. Compare 100 items to 7 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈100/7⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 16, then add one more item.

**Rubric:**
- Correctness — holes=7, collision forced=true, guaranteed min=15, threshold=106
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 100>7 (or 100<=7) given instantly

**Follow-ups:**
- What is the minimum number of people to guarantee some hole has at least 17?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-pigeonhole#items76-holes25-t5  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=25,items=76,t=5

**Prompt:** 76 ants land on a unit square divided into a 5×5 grid of 25 cells. (a) Identify the holes (this is the whole trick). (b) Must two ants share a hole? (c) What is the largest count guaranteed in some hole? (d) How many ants would force some hole to hold at least 5?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(76,25) · pigeonholeMin(76,25) · pigeonholeMin(101,25) → holes = 25; collision forced = true; some hole holds ≥ 4; to force ≥ 5 you need 101 items. (verified)

#### Hidden

**Answer:** holes = 25; collision forced = true; some hole holds ≥ 4; to force ≥ 5 you need 101 items.

**Approaches:**
- Identify 25 holes (categories); 76 items vs 25 holes
- 76 > 25 ⇒ collision forced (pigeonhole)
- ⌈76/25⌉ = 4 guaranteed in one hole; invert for threshold: (t−1)·25+1 = 101

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊76/25⌋=3 instead of ⌈76/25⌉=4
- off-by-one on the threshold: 100 (not 101) forces only ≥4
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 25 categories they fall into?
2. Compare 76 items to 25 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈76/25⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 5, then add one more item.

**Rubric:**
- Correctness — holes=25, collision forced=true, guaranteed min=4, threshold=101
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 76>25 (or 76<=25) given instantly

**Follow-ups:**
- What is the minimum number of ants to guarantee some hole has at least 6?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-pigeonhole#items500-holes26-t21  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** tmpl-pigeonhole:holes=26,items=500,t=21

**Prompt:** 500 words are recorded and their initial letters examined (26-letter alphabet). (a) Identify the holes (this is the whole trick). (b) Must two words share a hole? (c) What is the largest count guaranteed in some hole? (d) How many words would force some hole to hold at least 21?

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(500,26) · pigeonholeMin(500,26) · pigeonholeMin(521,26) → holes = 26; collision forced = true; some hole holds ≥ 20; to force ≥ 21 you need 521 items. (verified)

#### Hidden

**Answer:** holes = 26; collision forced = true; some hole holds ≥ 20; to force ≥ 21 you need 521 items.

**Approaches:**
- Identify 26 holes (categories); 500 items vs 26 holes
- 500 > 26 ⇒ collision forced (pigeonhole)
- ⌈500/26⌉ = 20 guaranteed in one hole; invert for threshold: (t−1)·26+1 = 521

**Wrong turns:**
- counting items as holes (reversed)
- using ⌊500/26⌋=19 instead of ⌈500/26⌉=20
- off-by-one on the threshold: 520 (not 521) forces only ≥20
- trying to enumerate which specific hole is fullest instead of giving the guaranteed minimum

**Hint ladder:**
1. Stop counting the obvious objects — what are the 26 categories they fall into?
2. Compare 500 items to 26 categories: if items exceed categories, a collision is unavoidable.
3. The fullest hole is forced to ⌈500/26⌉ (round up) — that settles (c); for the (d) threshold, pack every hole as full as it can be without hitting 21, then add one more item.

**Rubric:**
- Correctness — holes=26, collision forced=true, guaranteed min=20, threshold=521
- Approach — existence argument, not enumeration
- Rigor — even-spread argument for the ceiling; +1 justified for the threshold
- Communication — names the holes explicitly before computing
- Speed — verdict from 500>26 (or 500<=26) given instantly

**Follow-ups:**
- What is the minimum number of words to guarantee some hole has at least 22?
- Re-pose the problem so the holes are hidden (e.g. remainders modulo m).
- Where does the pigeonhole principle appear in the counterfeit-coin weighings problem?

### tmpl-dice-increasing#k2  ·  harder

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=2

**Prompt:** You roll 2 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,2) and not P(6,2)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,2) · product(Array(2).fill(6)) · probabilityFromCounts(15,36) → P(strictly increasing) = 5/12. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 5/12.

**Approaches:**
- Choose which 2 distinct face values appear: C(6,2) sets; each set has exactly one increasing order
- Divide by 6^2=36 equally-likely sequences
- k!=2 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,2), not P(6,2)

**Wrong turns:**
- using nPk(6,2)=30 for favorable (overcounts by 2!=2)
- 'count IS probability' (forgetting to divide by 6^k)
- confusing strictly-increasing with non-decreasing
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,2); total = 6^2; reduce the fraction.

**Rubric:**
- Correctness — 5/12 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,2); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,2)/36 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-dice-increasing#k3  ·  harder

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=3

**Prompt:** You roll 3 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,3) and not P(6,3)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,3) · product(Array(3).fill(6)) · probabilityFromCounts(20,216) → P(strictly increasing) = 5/54. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 5/54.

**Approaches:**
- Choose which 3 distinct face values appear: C(6,3) sets; each set has exactly one increasing order
- Divide by 6^3=216 equally-likely sequences
- k!=6 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,3), not P(6,3)

**Wrong turns:**
- using nPk(6,3)=120 for favorable (overcounts by 3!=6)
- 'count IS probability' (forgetting to divide by 6^k)
- confusing strictly-increasing with non-decreasing
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,3); total = 6^3; reduce the fraction.

**Rubric:**
- Correctness — 5/54 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,3); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,3)/216 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-dice-increasing#k4  ·  harder

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=4

**Prompt:** You roll 4 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,4) and not P(6,4)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,4) · product(Array(4).fill(6)) · probabilityFromCounts(15,1296) → P(strictly increasing) = 5/432. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 5/432.

**Approaches:**
- Choose which 4 distinct face values appear: C(6,4) sets; each set has exactly one increasing order
- Divide by 6^4=1296 equally-likely sequences
- k!=24 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,4), not P(6,4)

**Wrong turns:**
- using nPk(6,4)=360 for favorable (overcounts by 4!=24)
- 'count IS probability' (forgetting to divide by 6^k)
- confusing strictly-increasing with non-decreasing
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,4); total = 6^4; reduce the fraction.

**Rubric:**
- Correctness — 5/432 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,4); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,4)/1296 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-dice-increasing#k5  ·  harder

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=5

**Prompt:** You roll 5 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,5) and not P(6,5)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,5) · product(Array(5).fill(6)) · probabilityFromCounts(6,7776) → P(strictly increasing) = 1/1296. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 1/1296.

**Approaches:**
- Choose which 5 distinct face values appear: C(6,5) sets; each set has exactly one increasing order
- Divide by 6^5=7776 equally-likely sequences
- k!=120 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,5), not P(6,5)

**Wrong turns:**
- using nPk(6,5)=720 for favorable (overcounts by 5!=120)
- 'count IS probability' (forgetting to divide by 6^k)
- confusing strictly-increasing with non-decreasing
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,5); total = 6^5; reduce the fraction.

**Rubric:**
- Correctness — 1/1296 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,5); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,5)/7776 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-inclusion-exclusion#2set-a8-b6-ab3-N15  ·  harder

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:a=8,ab=3,b=6,n=15,variant=2set

**Prompt:** Of 15 traders, 8 have property A, 6 have property B, and 3 have both. (a) How many have A or B? (b) How many have exactly one of the two? (c) How many have neither?

**Engine check:** `src/engine/combinatorics.ts` · unionSize(8,6,3) · inclusionExclusion([+8,+6,-3,-3]) · 15n - union → A or B = 11; exactly one = 8; neither = 4. (verified)

#### Hidden

**Answer:** A or B = 11; exactly one = 8; neither = 4.

**Approaches:**
- |A∪B| = |A|+|B|−|A∩B| = 8+6−3 = 11
- Exactly-one = |A|+|B|−2|A∩B| = 8+6−2·3 = 8
- Neither = 15 − |A∪B| = 15 − 11 = 4

**Wrong turns:**
- |A∪B|=|A|+|B|=14 (forgetting to subtract the 3 overlap)
- getting exactly-one wrong: subtracting ab once instead of twice
- confusing 'at least one' with 'exactly one'
- forgetting to use N=15 for 'neither'

**Hint ladder:**
1. Every element in both A and B is counted twice in |A|+|B| — what must you subtract?
2. |A∪B| = |A|+|B|−|A∩B|; then neither = universe − union.
3. Exactly-one means in A or B but not both: add A and B then subtract twice the overlap (−2·3).

**Rubric:**
- Correctness — union=11, exactly-one=8, neither=4
- Approach — signed inclusion–exclusion with correct signs
- Rigor — explains subtraction of ab once (union) vs twice (exactly-one)
- Communication — draws or describes the Venn diagram regions
- Speed — writes A+B−AB for the union immediately

**Follow-ups:**
- Add a third set C — what is the new union formula?
- Express 'at most one of A, B' from these pieces.
- Re-pose with set sizes derived from divisibility within 1…N.

### tmpl-inclusion-exclusion#3set-A100-B80-C60  ·  harder

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:A=100,AB=30,ABC=10,AC=25,B=80,BC=20,C=60,N=200,variant=3set

**Prompt:** Among 200 analysts: |A|=100, |B|=80, |C|=60; pairwise |A∩B|=30, |A∩C|=25, |B∩C|=20; triple |A∩B∩C|=10. (a) How many are in at least one set? (b) How many are in none?

**Engine check:** `src/engine/combinatorics.ts` · inclusionExclusion([+100,+80,+60,-30,-25,-20,+10]) · 200n - union3 → at least one = 175; none = 25. (verified)

#### Hidden

**Answer:** at least one = 175; none = 25.

**Approaches:**
- |A∪B∪C| = (100+80+60) − (30+25+20) + 10 = 175
- Alternating-sign IE: singles + , pairs −, triple +
- None = 200 − 175 = 25

**Wrong turns:**
- |A∪B∪C|=A+B+C=240 (forgetting to subtract pairwise and add back triple)
- wrong sign on the triple term (subtracting instead of adding)
- conflating 'at least one' with 'exactly one'
- forgetting to subtract union from N for 'none'

**Hint ladder:**
1. Start by adding all singles; each pairwise overlap is counted twice — what must you subtract?
2. Singles minus pairwise overlaps plus the triple; then "none" is the universe minus that sum.
3. For exactly-k regions an element in j sets is over-added — weight pairs by −2 and triple by +3 for exactly-one.

**Rubric:**
- Correctness — union=175, none=25
- Approach — three-set IE with all seven terms and correct signs
- Rigor — alternating-sign justification; triple term sign correct
- Communication — states or draws the Venn seven-region structure
- Speed — writes +singles −pairs +triple immediately

**Follow-ups:**
- Add a fourth set — what is the sign pattern now?
- Using the same data, find how many analysts are in exactly one set.
- Express 'at most one' from these pieces.

### tmpl-inclusion-exclusion#3set-A50-B40-C30  ·  harder

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:A=50,AB=12,ABC=4,AC=10,B=40,BC=8,C=30,N=100,variant=3set

**Prompt:** Among 100 quants: |A|=50, |B|=40, |C|=30; pairwise |A∩B|=12, |A∩C|=10, |B∩C|=8; triple |A∩B∩C|=4. (a) How many are in at least one set? (b) How many are in none?

**Engine check:** `src/engine/combinatorics.ts` · inclusionExclusion([+50,+40,+30,-12,-10,-8,+4]) · 100n - union3 → at least one = 94; none = 6. (verified)

#### Hidden

**Answer:** at least one = 94; none = 6.

**Approaches:**
- |A∪B∪C| = (50+40+30) − (12+10+8) + 4 = 94
- Alternating-sign IE: singles + , pairs −, triple +
- None = 100 − 94 = 6

**Wrong turns:**
- |A∪B∪C|=A+B+C=120 (forgetting to subtract pairwise and add back triple)
- wrong sign on the triple term (subtracting instead of adding)
- conflating 'at least one' with 'exactly one'
- forgetting to subtract union from N for 'none'

**Hint ladder:**
1. Start by adding all singles; each pairwise overlap is counted twice — what must you subtract?
2. Singles minus pairwise overlaps plus the triple; then "none" is the universe minus that sum.
3. For exactly-k regions an element in j sets is over-added — weight pairs by −2 and triple by +3 for exactly-one.

**Rubric:**
- Correctness — union=94, none=6
- Approach — three-set IE with all seven terms and correct signs
- Rigor — alternating-sign justification; triple term sign correct
- Communication — states or draws the Venn seven-region structure
- Speed — writes +singles −pairs +triple immediately

**Follow-ups:**
- Add a fourth set — what is the sign pattern now?
- Using the same data, find how many quants are in exactly one set.
- Express 'at most one' from these pieces.

### tmpl-inclusion-exclusion#3set-A300-B250-C200  ·  harder

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:A=300,AB=120,ABC=50,AC=100,B=250,BC=90,C=200,N=600,variant=3set

**Prompt:** Among 600 applicants: |A|=300, |B|=250, |C|=200; pairwise |A∩B|=120, |A∩C|=100, |B∩C|=90; triple |A∩B∩C|=50. (a) How many are in at least one set? (b) How many are in none?

**Engine check:** `src/engine/combinatorics.ts` · inclusionExclusion([+300,+250,+200,-120,-100,-90,+50]) · 600n - union3 → at least one = 490; none = 110. (verified)

#### Hidden

**Answer:** at least one = 490; none = 110.

**Approaches:**
- |A∪B∪C| = (300+250+200) − (120+100+90) + 50 = 490
- Alternating-sign IE: singles + , pairs −, triple +
- None = 600 − 490 = 110

**Wrong turns:**
- |A∪B∪C|=A+B+C=750 (forgetting to subtract pairwise and add back triple)
- wrong sign on the triple term (subtracting instead of adding)
- conflating 'at least one' with 'exactly one'
- forgetting to subtract union from N for 'none'

**Hint ladder:**
1. Start by adding all singles; each pairwise overlap is counted twice — what must you subtract?
2. Singles minus pairwise overlaps plus the triple; then "none" is the universe minus that sum.
3. For exactly-k regions an element in j sets is over-added — weight pairs by −2 and triple by +3 for exactly-one.

**Rubric:**
- Correctness — union=490, none=110
- Approach — three-set IE with all seven terms and correct signs
- Rigor — alternating-sign justification; triple term sign correct
- Communication — states or draws the Venn seven-region structure
- Speed — writes +singles −pairs +triple immediately

**Follow-ups:**
- Add a fourth set — what is the sign pattern now?
- Using the same data, find how many applicants are in exactly one set.
- Express 'at most one' from these pieces.

### ff-handshakes-26  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** sem:609a143ebf69

**Prompt:** At a party of 26 people, each person shakes hands with at least 1 and at most 25 others. Must two people have shaken the same number of hands? Identify the holes and prove it.

**Engine check:** `src/engine/combinatorics.ts` · forcesCollision(26,25) → Yes — 26 people into 25 possible handshake counts forces a tie. (verified)

#### Hidden

**Answer:** Yes — 26 people into 25 possible handshake counts forces a tie.

**Approaches:**
- Pigeonhole: holes = possible counts ∈ {1,…,25} = 25 values; 26 people > 25 holes ⇒ collision
- Key subtlety: counts 0 and 25 cannot simultaneously appear (if someone shook 0 hands, no one could have shaken 25), so attainable counts ⊆ {1,…,25} — exactly 25 values

**Wrong turns:**
- treating the holes as the 26 people instead of the handshake counts
- thinking 0..25 gives 26 possible values and concluding no forced tie
- trying to enumerate actual handshake configurations

**Hint ladder:**
1. The pigeons are people — what are the holes (the categories they fall into)?
2. How many distinct handshake counts are actually possible given the 1–25 constraint?
3. 26 people, 25 possible counts ⇒ items > holes by exactly 1.

**Rubric:**
- Correctness — yes, with holes = {1,…,25} identified
- Approach — pigeonhole on handshake counts, not on people
- Rigor — 0/25 mutual-exclusion argument stated
- Communication — names the holes explicitly before invoking pigeonhole
- Speed — arrives at 26>25 instantly once holes are named

**Follow-ups:**
- What if counts could be 0–25 with no mutual-exclusion constraint? Is a tie still forced?
- Generalize: for n people with counts 1…(n−1), must two always match?
- Where else do 'the holes are not the obvious objects' cause candidates to fail?

### ff-ants-force-four  ·  harder

**Source:** Green Book §2.6 p.11–12

**Fingerprint:** sem:5c3d0b1bf3c4

**Prompt:** 51 ants sit on a unit square cut into a 5×5 grid of 25 cells. (a) Some cell holds at least how many ants? (b) How many ants would force some cell to hold at least 4? (c) Why does a circular glass of radius 1/7 then cover all ants in that cell?

**Engine check:** `src/engine/combinatorics.ts` · pigeonholeMin(51,25)=3 · pigeonholeMin(76,25)=4 → (a) 3; (b) 76; (c) the 1/5-side cell has diagonal √2/5 ≈ 0.283 < glass diameter 2/7 ≈ 0.286. (verified)

#### Hidden

**Answer:** (a) 3; (b) 76; (c) the 1/5-side cell has diagonal √2/5 ≈ 0.283 < glass diameter 2/7 ≈ 0.286.

**Approaches:**
- ⌈51/25⌉ = 3 guaranteed in some cell
- Invert for ≥4: (4−1)·25+1 = 76; check pigeonholeMin(76,25)=4
- Geometry: each cell has side 1/5, diagonal √2/5 ≈ 0.2828; glass diameter 2/7 ≈ 0.2857 > 0.2828

**Wrong turns:**
- ⌊51/25⌋=2 instead of ⌈51/25⌉=3 (floor vs ceiling)
- forgetting the +1 in the inversion: (4−1)·25=75 forces only ≥3
- thinking 51 ants gives guarantee of 2 (ignoring the remainder 51−2·25=1)

**Hint ladder:**
1. 25 cells, 51 ants — spread as evenly as possible and look at what is left over.
2. For ≥4, fill every cell with 3 first (75 ants), then add one more.
3. Compare the diagonal of a 1/5-side cell to the diameter of the glass.

**Rubric:**
- Correctness — 3 guaranteed; 76 to force ≥4; geometric covering argument stated
- Approach — ceiling formula + inversion + geometry
- Rigor — even-spread + remainder argument; diagonal vs diameter compared
- Communication — connects the count to the geometry
- Speed — writes ⌈51/25⌉=3 immediately

**Follow-ups:**
- How many ants would force some cell to hold at least 5?
- As the n×n grid gets finer, at what point does the ≥3-ants guarantee fail for 51 ants?
- What is the smallest glass (radius) that still covers a 1/5-side cell?

### ff-base3-weighings  ·  harder

**Source:** Green Book §2 p.12 + §2.6 p.11–12

**Fingerprint:** sem:6c88d7a2c7d5

**Prompt:** Three independent sources each contribute a coin of weight −1, 0, or +1 gram, giving 3³ = 27 distinct weight-combinations. A single scale reading is an integer total in {−3,…,+3} — only 7 values. Can one reading always identify which combination occurred? If not, how many combinations must share some reading?

**Engine check:** `src/engine/combinatorics.ts` · product([3,3,3])=27 · forcesCollision(27,7)=true · pigeonholeMin(27,7)=4 → No — 27 combinations into 7 distinct readings forces collisions; some reading comes from ≥ ⌈27/7⌉ = 4 combinations. (verified)

#### Hidden

**Answer:** No — 27 combinations into 7 distinct readings forces collisions; some reading comes from ≥ ⌈27/7⌉ = 4 combinations.

**Approaches:**
- Multiplication rule: 3 choices per coin × 3 coins = 3³ = 27 combinations
- Possible totals: −3 to +3 = 7 distinct sum values (holes)
- Pigeonhole: 27 > 7 forces collisions; ⌈27/7⌉=4 in the fullest bucket

**Wrong turns:**
- add-not-multiply: 3+3+3=9 combinations (wrong)
- thinking one reading suffices to identify all 27 uniquely
- miscounting the sum range (e.g. forgetting negative values)

**Hint ladder:**
1. How many distinct weight-combinations are there, and how many distinct sum values are possible?
2. 27 combinations vs 7 sums — is a collision avoidable?
3. Even spread gives ⌈27/7⌉ in the most-shared reading.

**Rubric:**
- Correctness — No; ≥4 combinations share some reading
- Approach — 27 combos via multiplication rule; 7 holes; pigeonhole
- Rigor — names the holes as the 7 possible sums, not the coins
- Communication — links to base-3 encoding and disambiguation limits
- Speed — 27>7 verdict stated instantly once multiplication rule is applied

**Follow-ups:**
- How many independent scale readings would be needed to disambiguate all 27 combinations?
- Connect this to the L1 counterfeit-coin bagging problem.
- Why base-3 (ternary) rather than base-2 (binary) for coin weighings?

### ff-dice-increasing-compare  ·  harder

**Source:** Green Book §4.2 p.40

**Fingerprint:** sem:24197ca9b607

**Prompt:** Compare the probability that 3 fair dice come out strictly increasing with the same probability for 4 dice. Give both exactly and state the general rule for k dice.

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,3)=20 · product(Array(3).fill(6))=216 · probabilityFromCounts(20,216)={5,54} · nCk(6,4)=15 · product(Array(4).fill(6))=1296 · probabilityFromCounts(15,1296)={5,432} → 3 dice: 5/54; 4 dice: 5/432; general rule: C(6,k)/6^k. (verified)

#### Hidden

**Answer:** 3 dice: 5/54; 4 dice: 5/432; general rule: C(6,k)/6^k.

**Approaches:**
- Each distinct k-subset of {1,…,6} has exactly one increasing ordering ⇒ favorable = C(6,k)
- Total sequences = 6^k; probability = C(6,k)/6^k
- Comparison: 5/54 vs 5/432 — the denominator grows much faster than the numerator

**Wrong turns:**
- using nPk(6,k) for favorable (overcounts by k!)
- treating 'increasing' as a single fixed sequence rather than one order per subset
- 'count IS probability'

**Hint ladder:**
1. Each set of distinct values orders increasingly exactly one way — how many such sets are there?
2. Favorable = C(6,k); total = 6^k.
3. Compute both fractions and reduce; note the 4-dice probability is much smaller.

**Rubric:**
- Correctness — 5/54 and 5/432 both exact; general formula stated
- Approach — one increasing order per k-subset → C(6,k)
- Rigor — explains why C(6,k) not P(6,k)
- Communication — compares the two values and articulates the general form
- Speed — writes 5/54 immediately for k=3

**Follow-ups:**
- What are the probabilities for k=6 and k=7? What happens at k>6?
- Generalize to an s-sided die: P(strictly increasing for k rolls) = C(s,k)/s^k.
- Is the probability for non-decreasing rolls larger or smaller than strictly increasing? (flag if unsourced)

### ff-aces-four-piles  ·  harder

**Source:** Green Book §4.2 p.42 + p.33

**Fingerprint:** sem:c3684308b6a2

**Prompt:** Four distinct aces are each dropped independently and uniformly into one of 4 distinct piles. (a) In how many ways do they land one per pile? (b) In how many ways with no restriction? (c) What is the exact probability of one-per-pile?

**Engine check:** `src/engine/combinatorics.ts` · factorial(4)=24 · product([4,4,4,4])=256 · probabilityFromCounts(24,256)={3,32} → (a) 24 = 4!; (b) 256 = 4⁴; (c) 3/32. (verified)

#### Hidden

**Answer:** (a) 24 = 4!; (b) 256 = 4⁴; (c) 3/32.

**Approaches:**
- 4! perfect matchings of 4 distinct aces to 4 distinct piles
- 4⁴ = 256 by multiplication rule (each ace independently picks a pile)
- P = 24/256 = 3/32 after reducing by GCD=8

**Wrong turns:**
- treating aces or piles as indistinct (giving C(4,1)·C(3,1)·… instead of 4!)
- add-not-multiply for unrestricted: 4+4+4+4=16 instead of 4⁴=256
- 'count IS probability'
- forgetting to reduce 24/256

**Hint ladder:**
1. One-per-pile is a perfect matching of 4 distinct objects to 4 distinct slots — how many are there?
2. Unrestricted: each of the 4 aces independently chooses 1 of 4 piles.
3. Divide the perfect-matching count (4!) by the unrestricted count (4⁴), then reduce by the GCD.

**Rubric:**
- Correctness — 24, 256, 3/32 all exact
- Approach — matching (4!) vs free assignment (4⁴); ratio reduced
- Rigor — states the independence idealization; notes aces AND piles are distinct
- Communication — distinguishes perfect-matching model from free-assignment model
- Speed — 4! and 4⁴ written immediately

**Follow-ups:**
- What if the four aces were indistinguishable (identical)?
- Generalize to n distinct items dropped into n distinct bins — P(one per bin) = n!/n^n.
- How does this connect to the derangement problem?

### ff-letters-matching  ·  harder

**Source:** Green Book §4.2 p.36

**Fingerprint:** sem:10ada16e4e91

**Prompt:** Five distinct letters go into five addressed envelopes uniformly at random. Find: (a) P(none lands in its correct envelope); (b) P(at least one is correct); (c) P(exactly one is correct).

**Engine check:** `src/engine/combinatorics.ts` · derangements(5)=44 · factorial(5)=120 · probabilityFromCounts(44,120)={11,30} · probabilityFromCounts(76,120)={19,30} · nCk(5,1)*derangements(4)=45 · probabilityFromCounts(45,120)={3,8} → (a) 11/30; (b) 19/30; (c) 3/8. (verified)

#### Hidden

**Answer:** (a) 11/30; (b) 19/30; (c) 3/8.

**Approaches:**
- D₅=44 derangements; P(none)=44/120=11/30
- P(at least one) = 1 − P(none) = 1 − 11/30 = 19/30
- Exactly-one: choose which letter is correct (C(5,1)=5), derange the other four (D₄=9) ⇒ 45/120=3/8

**Wrong turns:**
- 'count IS probability' (forgetting to divide by 5!=120)
- exactly-one = C(5,1)·4!=120 (forgetting the rest must derange)
- adding P(none) + P(exactly-one) and expecting P(at-least-one)

**Hint ladder:**
1. All-wrong is the derangement fraction D₅/5!.
2. At-least-one is 1 minus that.
3. Exactly-one: choose which letter is correct, then derange the remaining four (D₄=9, not 4!).

**Rubric:**
- Correctness — all three fractions reduced: 11/30, 19/30, 3/8
- Approach — derangements + complement + fix-one-derange-rest
- Rigor — exactly-one uses D₄ not 4!; fractions properly reduced
- Communication — states the fix-then-derange logic clearly
- Speed — recalls D₅=44 and D₄=9 immediately

**Follow-ups:**
- What is P(exactly two letters are correct)?
- Why does P(none correct) barely change from n=5 to n=10?
- Compute the expected number of correctly placed letters and explain why it equals 1 for any n.

#### Tier: brutal

### tmpl-derangement#n8  ·  brutal

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=8

**Prompt:** 8 trades are matched to 8 accounts by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no trade hit its correct account? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(8) · factorial(8) · reduce(14833n,40320n) → all-wrong = 14833; at-least-one = 25487; P(all wrong) = 2119/5760; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 14833; at-least-one = 25487; P(all wrong) = 2119/5760; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_8 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one trade lands in the correct account?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-derangement#n9  ·  brutal

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=9

**Prompt:** 9 keys are matched to 9 locks by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no key hit its correct lock? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(9) · factorial(9) · reduce(133496n,362880n) → all-wrong = 133496; at-least-one = 229384; P(all wrong) = 16687/45360; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 133496; at-least-one = 229384; P(all wrong) = 16687/45360; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_9 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one key lands in the correct lock?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-derangement#n10  ·  brutal

**Source:** Green Book §4.2 p.36

**Fingerprint:** tmpl-derangement:n=10

**Prompt:** 10 coats are matched to 10 tickets by a uniformly random permutation (e.g. Secret-Santa style). (a) In how many outcomes does no coat hit its correct ticket? (b) In how many does at least one match correctly? (c) What is the exact probability of a complete mismatch? (d) What does that probability approach as n grows large?

**Engine check:** `src/engine/combinatorics.ts` · derangements(10) · factorial(10) · reduce(1334961n,3628800n) → all-wrong = 1334961; at-least-one = 2293839; P(all wrong) = 16481/44800; limit → 1/e. (verified)

#### Hidden

**Answer:** all-wrong = 1334961; at-least-one = 2293839; P(all wrong) = 16481/44800; limit → 1/e.

**Approaches:**
- Inclusion–exclusion: D_n = n!·Σ_{k=0}^n (−1)^k/k! ≈ n!/e
- Recurrence D_n = (n−1)(D_{n−1}+D_{n−2}); D_0=1, D_1=0
- Complement for at-least-one: n! − D_n; reduce the all-wrong fraction

**Wrong turns:**
- 'count IS the probability' (forgetting to divide by n!)
- computing at-least-one as n·(n−1)! (double-counting fixed points)
- thinking P(all wrong) → 0 or → ½ instead of 1/e ≈ 0.368
- off-by-one in the IE signs (alternating series starts at +1)

**Hint ladder:**
1. What is the complement of 'at least one correct match'?
2. Inclusion–exclusion over 'fix item i in the right place' gives the alternating n!·Σ(−1)^k/k!.
3. Divide the all-wrong count by n! and reduce; the alternating series converges to e^(−1).

**Rubric:**
- Correctness — exact count + reduced fraction + limit stated as 1/e
- Approach — inclusion–exclusion or recurrence, not brute force
- Rigor — explains the alternating sign cancellation
- Communication — links the fraction to the e^(−1) limit
- Speed — recalls D_5=44 (or D_10 from the recurrence) quickly

**Follow-ups:**
- What is the probability that exactly one coat lands in the correct ticket?
- Why does P(all wrong) barely change as n increases beyond 5?
- Derive the recurrence D_n = (n−1)(D_{n−1}+D_{n−2}) combinatorially.

### tmpl-dice-increasing#k6  ·  brutal

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=6

**Prompt:** You roll 6 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,6) and not P(6,6)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,6) · product(Array(6).fill(6)) · probabilityFromCounts(1,46656) → P(strictly increasing) = 1/46656. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 1/46656.

**Approaches:**
- Choose which 6 distinct face values appear: C(6,6) sets; each set has exactly one increasing order
- Divide by 6^6=46656 equally-likely sequences
- k!=720 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,6), not P(6,6)

**Wrong turns:**
- using nPk(6,6)=720 for favorable (overcounts by 6!=720)
- 'count IS probability' (forgetting to divide by 6^k)
- confusing strictly-increasing with non-decreasing
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,6); total = 6^6; reduce the fraction.

**Rubric:**
- Correctness — 1/46656 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,6); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,6)/46656 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-dice-increasing#k7  ·  brutal

**Source:** Green Book §4.2 p.40

**Fingerprint:** tmpl-dice-increasing:k=7

**Prompt:** You roll 7 fair dice in a row. (a) What is the probability the values come out strictly increasing? (b) Why is the favorable count C(6,7) and not P(6,7)?

**Engine check:** `src/engine/combinatorics.ts` · nCk(6,7) · product(Array(7).fill(6)) · probabilityFromCounts(0,279936) → P(strictly increasing) = 0. (verified)

#### Hidden

**Answer:** P(strictly increasing) = 0.

**Approaches:**
- Choose which 7 distinct face values appear: C(6,7) sets; each set has exactly one increasing order
- Divide by 6^7=279936 equally-likely sequences
- k!=5040 orderings of a k-subset; exactly 1 is increasing ⇒ favorable = C(6,7), not P(6,7)

**Wrong turns:**
- using nPk(6,7)=0 for favorable (overcounts by 7!=5040)
- 'count IS probability' (forgetting to divide by 6^k)
- writing a nonzero probability for k=7 (impossible: only 6 distinct faces ⇒ pigeonhole forces a repeat)
- double-counting by treating different orderings of the same face-set as distinct

**Hint ladder:**
1. How many distinct subsets of face values can appear on the dice, and for each subset, how many of its orderings are strictly increasing?
2. Each k-element subset of {1,…,6} has exactly one increasing arrangement out of k! total — the k! cancels.
3. Favorable = C(6,7); total = 6^7; for k>6 you cannot choose 7 distinct faces from {1,…,6}.

**Rubric:**
- Correctness — 0 (or "0" for k>6)
- Approach — one increasing order per k-subset; C(6,k) not P(6,k)
- Rigor — explains why favorable = C(6,7); handles k>6 impossibility
- Communication — links to pigeonhole for k>6
- Speed — writes C(6,7)/279936 immediately

**Follow-ups:**
- What changes if "strictly increasing" is replaced by "non-decreasing" (ties allowed)? (flag if unsourced)
- Generalize to an s-sided die: what is the probability for k rolls out of s faces?
- What is the largest k with a nonzero probability, and why?

### tmpl-inclusion-exclusion#brutal-exactlyone  ·  brutal

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:A=100,AB=30,ABC=10,AC=25,B=80,BC=20,C=60,N=200,variant=3set-exactlyone

**Prompt:** Among 200 analysts: |A|=100, |B|=80, |C|=60; pairwise |A∩B|=30, |A∩C|=25, |B∩C|=20; |A∩B∩C|=10. How many analysts are in exactly one of the three sets? Derive the coefficient pattern from inclusion–exclusion first principles.

**Engine check:** `src/engine/combinatorics.ts` · inclusionExclusion([+A,+B,+C, -AB,-AB, -AC,-AC, -BC,-BC, +ABC,+ABC,+ABC]) → exactly one = 120. (verified)

#### Hidden

**Answer:** exactly one = 120.

**Approaches:**
- Exactly-one = Σsingles − 2·Σpairs + 3·triple = (100+80+60) − 2(30+25+20) + 3·10 = 120
- Via Venn: |A only| + |B only| + |C only| (requires computing all seven regions)
- Coefficient derivation: an element in j of the 3 sets contributes C(j,1)−2C(j,2)+3C(j,3) = 1 only if j=1

**Wrong turns:**
- using the three-set union formula (gives at-least-one, not exactly-one)
- subtracting pairs once instead of twice (gives a wrong answer)
- forgetting the +3·ABC correction
- computing the seven Venn regions without checking they sum to 200

**Hint ladder:**
1. An element in exactly one set should contribute +1 to your count; an element in two sets should contribute 0. Work out the coefficient each element gets.
2. Exactly-one uses singles with coefficient +1, pairwise intersections with −2, and the triple with +3.
3. Apply: (100+80+60) − 2(30+25+20) + 3·10 and verify against the seven-region breakdown.

**Rubric:**
- Correctness — exactly-one = 120
- Approach — coefficient derivation (+1,−2,+3) from IE principles
- Rigor — coefficient for each region derived, not memorized
- Communication — explains why the pair-in-two-sets term gets coefficient −2
- Speed — writes the formula in under 2 minutes for this brutal tier

**Follow-ups:**
- Now find exactly-two using the same coefficient approach.
- Verify your answers sum correctly: exactly-one + exactly-two + exactly-three + none = 200.
- Add a fourth set — derive the exactly-one coefficient pattern for 4 sets.

### tmpl-inclusion-exclusion#brutal-exactlytwo  ·  brutal

**Source:** Green Book §4.2 p.33

**Fingerprint:** tmpl-inclusion-exclusion:A=100,AB=30,ABC=10,AC=25,B=80,BC=20,C=60,N=200,variant=3set-exactlytwo

**Prompt:** Among 200 analysts: |A|=100, |B|=80, |C|=60; pairwise |A∩B|=30, |A∩C|=25, |B∩C|=20; |A∩B∩C|=10. How many analysts are in exactly two of the three sets? Derive the coefficient pattern.

**Engine check:** `src/engine/combinatorics.ts` · inclusionExclusion([+AB,+AC,+BC, -ABC,-ABC,-ABC]) → exactly two = 45. (verified)

#### Hidden

**Answer:** exactly two = 45.

**Approaches:**
- Exactly-two = Σpairs − 3·triple = (30+25+20) − 3·10 = 75 − 30 = 45
- Coefficient for element in j sets: C(j,2) − 3C(j,3) = 1 only if j=2
- Via Venn: |A∩B only| + |A∩C only| + |B∩C only|

**Wrong turns:**
- using −2·triple instead of −3·triple
- adding pair intersections directly without subtracting those also in the triple
- confusing exactly-two with at-least-two

**Hint ladder:**
1. An element in exactly two sets appears in exactly one pair intersection but also in the triple — adjust accordingly.
2. Exactly-two = Σpairwise − 3·triple; the coefficient 3 comes from C(3,2)=3 pair-intersections per triple element.
3. Compute (30+25+20) − 3·10 and check it with the Venn diagram.

**Rubric:**
- Correctness — exactly-two = 45
- Approach — coefficient derivation (pairs +1, triple −3) from IE principles
- Rigor — explains why the triple element is overcounted in all three pairs
- Communication — connects to the Venn seven-region structure
- Speed — writes Σpairs − 3·ABC in under 90 seconds for this brutal tier

**Follow-ups:**
- Verify: exactly-one (120) + exactly-two (45) + exactly-three (ABC=10) + none (25) = 200.
- Derive "exactly-two" for a 4-set problem — what is the coefficient of each term?
- Re-pose with set sizes derived from prime-counting to ensure harder arithmetic.

### ff-birthday-23  ·  brutal

**Source:** Green Book §4.2 p.36

**Fingerprint:** sem:9507dcd678ee

**Prompt:** A room has n people; each birthday is uniform over 365 days, independent, no leap years. What is the smallest n for which the probability that at least two people share a birthday first exceeds ½? Justify why the answer is so much smaller than 183.

**Engine check:** `src/engine/combinatorics.ts` · loop: first n with 2n * nPk(365,n) < product(Array(n).fill(365)) · answer: n=23 → 23 (verified)

#### Hidden

**Answer:** 23

**Approaches:**
- Complement: P(all distinct) = nPk(365,n)/365^n; find first n where this drops below ½
- BigInt comparison: 2·nPk(365,n) < 365^n avoids float overflow
- Pair intuition: C(23,2)=253 pairs, each with probability 1/365 of a match

**Wrong turns:**
- ≈183 (half of 365) — confusing number of people with number of days
- ≈50 — underestimating the power of quadratic pair growth
- computing P(shared birthday) directly instead of using the complement
- floating-point arithmetic — overflows for large n

**Hint ladder:**
1. Count the easy complement first: what is the probability that everyone has a distinct birthday?
2. Compare pairs of people, not people to days — with n people there are C(n,2) pairs, which grows quadratically; how large must n get before a clash is more likely than not?
3. P(all distinct) = nPk(365,n)/365^n; find where it first drops below ½ by comparing 2·nPk(365,n) to 365^n as exact BigInts.

**Rubric:**
- Correctness — answer = 23 with the inequality crossed
- Approach — complement + pair intuition or exact BigInt comparison
- Rigor — explains why floats fail and BigInt comparison is needed
- Communication — debunks the 183 misconception explicitly
- Speed — recalls n=23 and C(23,2)=253 immediately

**Follow-ups:**
- At what n does the shared-birthday probability first cross 99%?
- Why does comparing exact integers beat floating-point arithmetic here?
- Generalize the ½-threshold to d equally likely days (threshold ≈ 1.18√d).

### ff-root2-integer  ·  brutal

**Source:** Green Book §4.2 p.36–37

**Fingerprint:** sem:333fc2583a8a

**Prompt:** Prove that S_n = (1+√2)^n + (1−√2)^n is an integer for every positive integer n, give a closed form a computer can evaluate exactly, and explain why the digits just after the decimal point of (1+√2)^n are all 9s for large even n.

**Engine check:** `src/engine/combinatorics.ts` · 2n * Σ_{j=0..5} nCk(10,2j)*product(Array(j).fill(2)) = 6726 → Integer = yes; S_n = 2·Σ_j C(n,2j)·2^j; S₁₀ = 6726. (verified)

#### Hidden

**Answer:** Integer = yes; S_n = 2·Σ_j C(n,2j)·2^j; S₁₀ = 6726.

**Approaches:**
- Binomial-expand both and add; odd √2-powers cancel pairwise, leaving rational terms
- Even powers give 2^{k/2} (rational); sum = 2·Σ_j C(n,2j)·2^j
- Bound the conjugate: 0 < (1−√2)^n < 1 for even n, so (1+√2)^n = S_n − small, giving the 9s in the decimal

**Wrong turns:**
- freshman's dream: (1+√2)^n ≠ 1+2^{n/2}
- forgetting (√2)^k is rational only for even k
- thinking the conjugate term proves integrality (it proves the digit claim; integrality comes from the sum)

**Hint ladder:**
1. Add the two binomial expansions term-by-term — what happens to odd powers of √2?
2. Even powers give 2^{k/2} (rational); the sum is twice the even-index terms.
3. For the digit claim, note (1−√2)^n is a small positive number for even n; subtract it from the integer S_n.

**Rubric:**
- Correctness — integer + closed form + digit explanation + S₁₀=6726
- Approach — conjugate-pair binomial expansion with cancellation
- Rigor — bounds (1−√2)^n ∈ (0,1) for even n; separates integrality from the digit claim
- Communication — clearly distinguishes the two claims (integer; decimal 9s)
- Speed — spots the odd-power cancellation immediately

**Follow-ups:**
- Derive the recurrence S_n = 2S_{n−1} + S_{n−2} from the conjugate structure.
- What is the units digit of S_n for n=1,2,3,…? Is there a period?
- Apply the same conjugate-pair trick to (2+√3)^n + (2−√3)^n.

### ff-poker-ranking  ·  brutal

**Source:** Green Book §4.2 p.34

**Fingerprint:** sem:8878394e5d00

**Prompt:** Rank four-of-a-kind, full house, and two pairs from rarest to most common with exact probabilities over a shared denominator, and explain why "a fancier-looking hand is always rarer" is false here.

**Engine check:** `src/engine/combinatorics.ts` · probabilityFromCounts(624,2598960)={1,4165} · probabilityFromCounts(3744,2598960)={6,4165} · probabilityFromCounts(123552,2598960)={198,4165} → Rarest to most common: four-of-a-kind (1/4165) < full house (6/4165) < two pairs (198/4165); two pairs is most common of the three. (verified)

#### Hidden

**Answer:** Rarest to most common: four-of-a-kind (1/4165) < full house (6/4165) < two pairs (198/4165); two pairs is most common of the three.

**Approaches:**
- Compute all three counts (624, 3744, 123552) and reduce each over 2,598,960
- Shared denominator 4165 = 2598960/624 emerges; numerators 1, 6, 198 determine the ranking
- Compare numerators: 1 < 6 < 198 ⇒ rarest to commonest

**Wrong turns:**
- 'fancier ⇒ rarer' — fails because two pairs is vastly more likely than four-of-a-kind
- comparing unreduced fractions with different denominators before finding a common base
- mis-ordering by raw count instead of by probability

**Hint ladder:**
1. Put all three probabilities over the same denominator.
2. They all reduce to something/4165 — compare only the numerators.
3. 1 < 6 < 198 settles the order; verify against your intuition.

**Rubric:**
- Correctness — full ordering with three exact fractions over 4165
- Approach — common-denominator trick; numerator comparison
- Rigor — explains why the raw counts (not aesthetics) determine rarity
- Communication — refutes the fancy-hand fallacy with a concrete number (198 vs 1)
- Speed — reaches 1/4165, 6/4165, 198/4165 without recomputing from scratch

**Follow-ups:**
- Where does one pair fit in the ranking? (flag — needs source verification)
- Why does the denominator 4165 appear for all three hands?
- Three-of-a-kind vs two pairs — which is rarer and why? (flag — needs source)

### ff-52-factorial  ·  brutal

**Source:** Green Book §5 Random permutation, p.89 (Knuth / Fisher–Yates shuffle: n! equally-likely orderings)

**Fingerprint:** sem:4a94cedd760f

**Prompt:** How many distinct orderings does a 52-card deck have? Give the exact value, its order of magnitude, and argue why a well-shuffled deck has, with overwhelming probability, never occurred before in history.

**Engine check:** `src/engine/combinatorics.ts` · factorial(52)=80658175170943878571660636856403766975289505440883277824000000000000 → 52! = 80658175170943878571660636856403766975289505440883277824000000000000 ≈ 8.07×10⁶⁷; the number of distinct orderings vastly exceeds any plausible count of shuffles ever performed. (verified)

#### Hidden

**Answer:** 52! = 80658175170943878571660636856403766975289505440883277824000000000000 ≈ 8.07×10⁶⁷; the number of distinct orderings vastly exceeds any plausible count of shuffles ever performed.

**Approaches:**
- Full permutation: 52 choices for position 1, 51 for position 2, … = 52! by the multiplication rule
- Magnitude: 52! ≈ 8.07×10⁶⁷; compare to ~10^{20} total shuffles ever performed by all humans
- Uniqueness: 52!/10^{20} ≈ 10^{47} — overwhelming odds against a repeat

**Wrong turns:**
- using nCk instead of nPk (order matters in a deck)
- underestimating the magnitude (e.g. 'about a trillion')
- conflating 'theoretically possible' with 'equally likely under a real shuffle'

**Hint ladder:**
1. How many choices for the top card? Then the next? Write the shrinking product.
2. That product is 52! — a permutation of all 52 distinct cards.
3. Compare 8065…×10⁶⁷ to any plausible total count of deck shuffles since cards were invented.

**Rubric:**
- Correctness — 52! = 80658175170943878571660636856403766975289505440883277824000000000000 (exact) and magnitude ≈ 8.07×10⁶⁷
- Approach — full permutation reasoning via the multiplication rule
- Rigor — uniqueness argument anchored to a concrete historical bound on shuffles
- Communication — vivid scale framing; distinguishes possible from likely
- Speed — writes 52! immediately and produces the magnitude from memory

**Follow-ups:**
- What is the probability that two independently shuffled decks are in the same order?
- How many orderings place all 4 aces in the top 4 positions? (= 4!·48!)
- Why is the exact BigInt representation necessary rather than a floating-point approximation?
