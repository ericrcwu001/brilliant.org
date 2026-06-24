# Inclusive Research 4 — Motivation, Math Anxiety, Self-Efficacy & Engagement for Beginners

> One of five parallel inclusive-design research files. A coordinator will synthesize all
> five and then rewrite `docs/proposed-lessons.md`, the L1 fixture, and the PRD persona.
> **This file edits nothing else.** Lens: **affective / motivational**. Sibling lenses
> (cognitive load, prerequisite scaffolding, representation, language/UX) are covered by the
> other four agents; I defer engine/schema mechanics to the widgets agent and only sketch the
> affordances my recommendations need.

---

## 1. Lens & TL;DR

**My lens in one line:** *Will a curious, possibly math-anxious beginner with near-zero
foundation believe "this is for me, I can do this, and it's worth it" long enough to reach the
first win — and keep that belief through the hard parts?* Everything below is about the
**feeling** of the product (who it signals it's for, how it frames struggle, where confidence
is built or broken), not the math content itself.

**Top recommendations (ranked):**

1. **Rewrite the persona from an identity gate into an invitation.** The current primary user is
   "a university underclassman preparing for quant interviews [who] know[s] about resources like
   the Green Book." That sentence tells ~95% of curious humans *this product is not for you*
   before they touch it. Reframe the primary user as **a curious person who wants to actually
   understand probability by doing**, and demote quant-prep to **one well-served (optional)
   track**, not the gate. (Belonging: Walton & Cohen 2011; Steele 1997.)
2. **De-gatekeep every "Why it matters for quant" line.** Phrases like *"the dividing line
   between 'can grind a recurrence' and 'thinks like a quant'"* (L6) and *"Interviewers use it to
   see whether you can…"* (L2) are evaluation-threat and identity-sorting language. Make the
   **default** "why" curiosity-driven and **move the interview framing into an opt-in "For the
   interview" note** that preserves 100% of the depth. (Expectancy-value cost: Eccles/Wigfield;
   ARCS-Relevance: Keller.)
3. **Guarantee an early win in every lesson, and never let the first *graded* beat be the
   hardest.** L1 does this well for three beats, then cliff-drops into algebra notation at the
   first graded check. Add an intermediate confidence rung. (Mastery experiences are the #1 source
   of self-efficacy: Bandura 1977/1997.)
4. **Adopt a consistent "mistakes are information" voice in the hint ladders, and normalize the
   common wrong answer.** L1 already does this once ("Most people pick the tie") — propagate it,
   and retire punitive words ("trap," "penalty"). (Error climate: Steuer & Dresel 2013; Moser et
   al. 2011 — but see the honest caveat in §7.)
5. **Introduce notation and "expected value/average" just-in-time, in plain language, the first
   time each appears.** A near-zero learner does not arrive knowing what `E0`, "the system,"
   "substitute," or "expected wait" mean; unexplained jargon spends the exact working memory that
   anxiety is already taxing. (Ashcraft & Kirk 2001.)
6. **Add a 20-second, opt-in "reappraisal" on-ramp** at course start ("feeling rusty is normal
   and it fades once you start; this starts from zero"). Cheap, evidence-backed anxiety relief.
   (Ramirez & Beilock 2011; Rozek et al. 2019.)
7. **Make relevance learner-generated, not imposed.** A light onboarding question ("What brings you
   here?") sets tone and lets the *learner* supply the value, which beats a designer-imposed quant
   frame — especially for low-expectancy learners. (Hulleman & Harackiewicz 2009; SDT autonomy.)
8. **Keep the depth. Preserve an explicit advanced/quant track** so none of this dumbs anything
   down — the dual-track structure (§6) is the whole point.

**The core tension I'm flagging up front (see §7):** the design system asks for a voice that is
"confident and terse… avoid generic marketing copy and exaggerated excitement" and an identity
that is "serious… not a game." My recommendations must therefore make the product *warmer and
less gatekeeping* **without** becoming bubbly or childish. Every rewrite below is deliberately
**warm-but-precise**, not cheerful.

---

## 2. Learning-science findings

Each finding has a citation and a one-line "so what for this product."

**A. Math anxiety consumes working memory — it's a real-time cognitive tax, not just a feeling.**
Ashcraft & Kirk (2001) showed high-math-anxious adults behave as if running a *dual task*:
intrusive worry competes for working memory, and errors spike specifically on the
working-memory-heavy steps (e.g., carrying). Math anxiety also drives **avoidance** of math
courses, majors, and careers; meta-analytically it correlates ~**r = −.27** with performance (Ma
1999). Anxiety is also affective/automatic — the amygdala is hyperactive in anticipation of math
even before solving (Young, Wu & Menon 2012).
→ *So what:* Unexplained notation and a "you're being evaluated" tone don't just feel bad — they
**measurably degrade** the reasoning we're trying to teach. Lowering anxiety is a performance
intervention, not a nicety.

**B. You can break the anxiety→performance link cheaply.** Ramirez & Beilock (2011, *Science*)
found a 10-minute pre-exam expressive-writing exercise eliminated "choking," especially for
habitually anxious students, by freeing working memory. Reappraisal/normalization framings extend
this and help disadvantaged students most (Rozek et al. 2019).
→ *So what:* A tiny, optional "name the nerves, then start" moment at course or lesson start is
high-leverage and on-brand if kept terse.

**C. Self-efficacy is built mostly by *mastery experiences* (your own successes).** Bandura
(1977, 1997): of the four sources — mastery experiences, vicarious experience, verbal/social
persuasion, physiological state — **mastery is by far the strongest**. Crucial nuance: efficacy
"is *not* created by easy success; it requires experience in overcoming obstacles" — and the
learner's *attribution* matters (an easy A doesn't build belief).
→ *So what:* Engineer **genuine early wins** (not fake ones), then **attribute them to the
learner** ("you proved this by hand"). This is the strongest argument that early success +
honest difficulty is the right recipe, not dumbing-down.

**D. ARCS: motivation needs Attention, Relevance, Confidence, Satisfaction.** Keller (1987, 2010).
*Confidence* = success expectations + success opportunities + crediting the learner's own effort.
*Relevance* must connect to the **learner's** goals, and over-controlling extrinsic framing can
backfire.
→ *So what:* A puzzle hook earns **Attention**; learner-chosen "why" earns **Relevance**;
early wins + faded hints earn **Confidence**; "look what you did" recaps earn **Satisfaction**.
The current product is strong on A, weak on C for novices, and forces R toward "quant."

**E. Self-Determination Theory: autonomy, competence, relatedness drive intrinsic motivation.**
Deci & Ryan (1985); Ryan & Deci (2000). Imposed goals and evaluative pressure undermine intrinsic
motivation; meaningful choice and a warm, non-controlling voice support it.
→ *So what:* Give real (low-stakes) choices, speak *with* the learner ("let's earn it"), and
don't make the only stated reason an external exam.

**F. Expectancy-Value-(Cost): people engage when they expect to succeed AND value the task more
than its cost.** Eccles et al. (1983); Wigfield & Eccles (2000); cost has effort, opportunity,
and **psychological** dimensions (fear of failure) (Barron & Hulleman 2015).
→ *So what:* Quant-evaluation framing **raises psychological cost** ("interviewers use this to see
whether you can…") and **narrows value** to one career. Lower the cost, widen the value.

**G. Utility-value works best when the learner writes it, not when it's told to them.** Hulleman &
Harackiewicz (2009, *Science*): students who connected material to *their own* lives gained
interest and grades — concentrated among **low-expectancy** students.
→ *So what:* Prefer "what does this remind *you* of?" over "this matters because quant." The
beginner who most needs relevance is the one the imposed frame helps least.

**H. Growth mindset / mistakes-as-information.** Dweck (2006); Moser et al. (2011) found
growth-mindset individuals show a larger error-positivity (Pe) brain response — more *attention*
to errors — and better post-error accuracy. "Mistakes-friendly" classroom climates raise effort
(Steuer & Dresel 2013). (Honest caveat in §7: the popular "mistakes grow your brain / synapses"
phrasing overstates this EEG result.)
→ *So what:* Frame errors as the productive part of learning and design hint ladders that treat a
wrong answer as a place to look, never a verdict.

**I. Desirable difficulties help — but only if the learner can clear them.** Bjork (1994); Bjork &
Bjork (2011, 2020): generation, spacing, interleaving, and testing improve long-term retention/
transfer, *but* "if the learner does not have the background knowledge or skills to respond…they
become **undesirable** difficulties."
→ *So what:* The course is *full* of well-chosen desirable difficulties (predict-before-solve =
generation; L5/L6 transfer = variation; L6 retrieval capstone = testing effect). For a near-zero
learner with no background, each one flips to *undesirable* unless scaffolded. Faded hints are the
right tool; the open question (§7) is calibration.

**J. Belonging & stereotype threat: signals about "who this is for" change performance.** Steele &
Aronson (1995); Steele (1997); Spencer, Steele & Quinn (1999, women in math). Walton & Cohen
(2011, *Science*): a **one-hour** belonging intervention framing adversity as *common and
transient* **halved the minority GPA gap over three years**, by changing how students *construe*
setbacks ("a stumble doesn't mean I don't belong").
→ *So what:* "For quant candidates who know the Green Book" is a belonging signal that says *people
like you belong here, people like you-the-beginner maybe don't*. Normalizing struggle ("most
people miss this at first") is a direct, evidence-based lever.

---

## 3. Diagnosis — where the current product alienates a near-zero / anxious learner

Citing exact copy from the repo.

### 3.1 The PRD persona is an identity gate (root cause)

`docs/mvp_prd.md` (Product Summary + User Persona):

> "Build a Brilliant-style learn-by-doing app for **university underclassmen preparing for quant
> interviews**." … "The primary user is a university underclassman preparing for quant interviews.
> **They know about resources like the Green Book**… they want deeper understanding of the patterns
> of thinking that help them solve unfamiliar probability questions **under interview pressure**."

Three separate exclusions in one paragraph: a **role** gate (quant candidate), a **prior-knowledge**
gate (already owns the Green Book), and a **framing** gate (the default mode is "interview
pressure" — the exact evaluative condition that taxes working memory; Beilock 2008). For a
math-anxious beginner this is a triple "not for you." Because the persona cascades into every
downstream hook, milestone name, and the landing subline, **fixing it here fixes the most things.**
The landing subline inherits it directly (`docs/ui_design_system.md`): headline *"Why does HH take
longer to appear than HT?"* (great, universal) followed by subline **"State thinking for quant
interviews."** (re-gates it immediately).

### 3.2 The proposed-lesson "Why it matters for quant" lines sort and threaten

From `docs/proposed-lessons.md`:

- **L6 Overlap Shortcut** is the worst offender: *"martingales + optional stopping + no-arbitrage
  are **the dividing line between 'can grind a recurrence' and 'thinks like a quant'**."* This
  literally tells a struggling learner which side of a line they're on — textbook stereotype/identity
  threat (Steele 1997) and maximal psychological cost (Eccles/Wigfield).
- **L2 Penney's:** *"**Interviewers use it to see whether you can** resist 'the stronger/rarer
  pattern wins' and reason about **competing absorbing states**… a clean **no-arbitrage** story."*
  Evaluation framing + three pieces of unglossed jargon in one sentence.
- **L3 Gambler's Ruin:** *"The single most-asked **Markov / first-passage** problem (**Green Book**
  Ch. 5, Mosteller, Joshi)."* Jargon + the Green-Book in-group signal again.

Note the section also has a structural-naming inconsistency to hand to the coordinator: the body
uses legacy `§L4/L5/L6` anchors for Penney's/Gambler's/Overlap, while its own course-path table
(§8) and `CONTEXT.md` use the canonical order **L1 Pattern Hitting Times → L2 Penney's → L3
Gambler's Ruin → L4 States & Streaks → L5 Longer Patterns → L6 Overlap Shortcut**. `docs/future_ideas.md`
disagrees outright (it lists **L4 Overlap Shortcut, L5 States & Streaks, L6 Longer Patterns**). Per
the brief I treat **PRD/CONTEXT as canonical** and write hooks by lesson *name* so the L-number
churn doesn't matter.

### 3.3 The proposed hooks assume the learner already succeeded at prior lessons

- **L2:** *"**You proved** HH is slower than HT (6 vs 4)."* — presumes a clean L1 success; a learner
  who struggled or skipped restarts already behind. (Compounds low self-efficacy.)
- **L6:** *"**You solved four linear systems** to get 6, 4, 8, 10. **A quant hands you HTHT and 30
  seconds.**"* — presumes the four hardest priors *and* stages a stranger-evaluator + a stopwatch.
  Time pressure + evaluation is precisely the choking condition (Beilock 2008; Ramirez & Beilock
  2011). The "casino that can't make a profit" half of the hook is genuinely great — keep it.
- **L3** is the model to copy: *"You have \$2… heads +\$1, tails −\$1… what's the chance you go
  broke first?"* Concrete, dollars, no jargon, anyone can hold it. Credit and emulate this.

### 3.4 L1 fixture: strong early scaffolding, then a notation cliff

`fixtures/lesson-pattern-hitting-times.json`. **What it does well (preserve and propagate):**

- `open-bet` hint[0]: **"There's no wrong guess yet. Commit to one so you can test it against the
  math."** — near-perfect low-stakes framing (SDT autonomy + ARCS confidence + Bandura "safe to
  try"). This is the single best line in the corpus for my lens.
- `open-bet` hint[1]: **"Most people pick the tie."** — normalizes the common error (Walton & Cohen
  belonging; mistakes-as-information). Only blemish: it calls it "the trap."
- Beats 1–3 (`open-bet`, `pattern-pick`, `simulate`) are effectively **guaranteed wins / no-stakes**
  — an excellent confidence on-ramp.
- `failure-edge` `byPattern` feedback is concrete and kind: *"a T after one H throws away all
  progress: E1 resets to E0."*

**Where it cliffs (the problem for a near-zero learner):**

- The **first graded beat** the learner hits after free play is `failure-edge` ("Where does **the
  state machine** go?"), immediately followed by `equation-tiles`:
  *"Here's the equation for **E0**, worked out. Build **E1** the same way: every flip costs 1, then
  **split by the coin**."* The jump from "flip a coin and watch" to "assemble a recurrence in
  `E0/E1` notation" is a difficulty *cliff*, not a ramp (Bjork: desirable→undesirable for the
  unprepared). `E0`, `E1`, and "split by the coin" are never defined in plain words.
- `guided-solve` is dense with un-glossed algebra verbs: prompt *"Tap through **the substitution** to
  solve **the system** for E0,"* hints *"Start from **the absorbing state** E2 = 0,"* *"**Substitute**
  E2 into E1… and **isolate** E0."* Each unfamiliar term is working-memory rent the anxious learner
  can't afford (Ashcraft & Kirk 2001).
- **"Expected value / average" is never grounded.** `refine-prediction` asks "how many flips, on
  average" and the lesson trades in "expected wait" throughout, but a near-zero learner may not know
  what an average *of a wait* even means. The concept the whole course rests on is assumed.
- Mildly punitive metaphors: equation-tiles correct calls the term **"HH's penalty"**; open-bet
  hint says **"the trap."** Minor, but it frames the math as adversarial.

Net: L1's first three beats are a textbook confidence ramp; beats 4–7 silently assume fluency. The
emotional arc dips exactly where a beginner most needs a rung.

---

## 4. Recommendations for `docs/proposed-lessons.md` (L2–L6)

**Principle: two registers, one spine.** Default copy = curiosity + plain language (serves
everyone). An opt-in **"For the interview"** note carries the quant framing, formal names, and
citations (serves the advanced learner). Nothing is removed; the gate is. Below, before→after for
the highest-impact lines. (Keep the design-system voice: warm-but-terse, not bubbly.)

### 4.1 Penney's Game (L2)

**Hook — before:**
> *"You proved HH is slower than HT (6 vs 4). So on one shared stream of flips, HT shows up first
> more often — right?"* (tie) *"Now pick any 3-flip pattern. I'll pick second and beat you 7 to 1."*

**Hook — after:**
> *"Last lesson, HH took longer than HT — 6 flips versus 4. So if we both watch the **same** coin,
> HT should win the race to show up first, right?"* (It's a dead tie — 50/50.) *"New game, then:
> you pick any 3-letter pattern you like. I'll pick mine after you, and I'll win about **7 times out
> of 8**. Want to try to beat me?"*

Why: "Last lesson" (not "You proved") forgives a shaky L1; "race to show up first" is plain; "7
times out of 8" replaces odds notation ("7 to 1"); "Want to try to beat me?" adds autonomy + a
playful, low-stakes challenge (ARCS-Attention, SDT).

**Why-it-matters — before:**
> "The canonical intuition-breaker… **Interviewers use it to see whether you can** resist 'the
> stronger/rarer pattern wins' and reason about **competing absorbing states**… a clean
> **no-arbitrage** story."

**Why-it-matters — after (default, everyone):**
> "This is one of those results that feels impossible the first time you meet it: the pattern that
> *waits longer on its own* can still *win the race* — and there's no single 'best' pattern, because
> every pattern can be beaten by another. Once you see why, you'll never trust a 'the rarer one
> wins' hunch again."

**…plus opt-in "For the interview" note (collapsed):**
> "Penney's Game (Penney 1969; Gardner 1974; Conway) is a classic trading-desk puzzle. It probes
> whether you can separate *which* event happens first from *how long* it takes, set up competing
> absorbing states, and read the second-mover edge as a no-arbitrage argument."

### 4.2 Gambler's Ruin (L3)

**Hook:** keep nearly as-is (it's the accessibility model). Optionally append one belonging beat of
warmth: *"You don't need any probability for this yet — just a guess."*

**Why-it-matters — after (default):**
> "This is the math behind a feeling you've probably had: even in a *fair* game, the player with
> less money tends to go broke first — and the tiniest edge for the house turns 'fair' into 'almost
> certain to lose.' It's why the casino always wins."

**For the interview (note):**
> "Gambler's Ruin is the most-asked first-passage / Markov-chain problem in quant interviews (Green
> Book Ch. 5; Mosteller; Joshi) — the prototype for risk-of-ruin and stop-loss/target reasoning."

### 4.3 The Overlap Shortcut (L6)

**Hook — before:**
> *"You solved four linear systems to get 6, 4, 8, 10. A quant hands you HTHT and 30 seconds.
> There's a one-line rule—let's earn it, and prove it with a casino that can't make a profit."*

**Hook — after:**
> *"By now you've worked out four of these waiting times the long way: 6, 4, 8, and 10. What if
> there were a **one-line shortcut** that gives you all four in seconds — with a genuinely fun reason
> *why* it works, involving a casino that can never turn a profit? Let's earn it together."*

Why: drops "linear systems" (→ note), removes the stranger-quant + 30-second stopwatch (the choking
trigger), keeps the shortcut tease (Attention) and the casino (a great concrete anchor), and "let's
earn it together" adds relatedness.

**Why-it-matters — before:**
> "**martingales + optional stopping + no-arbitrage** are **the dividing line between 'can grind a
> recurrence' and 'thinks like a quant'**—the same instinct behind derivatives pricing."

**Why-it-matters — after (default):**
> "The 'fair game' idea here — in a game nobody can beat, the money going in must equal the money
> coming out — is one of the most powerful tricks in all of probability. It's the same instinct used
> to price financial options."

**For the interview (note):**
> "Martingales, optional stopping, and no-arbitrage reasoning are exactly what the ABRACADABRA
> problem (Li 1980) probes. This is the move that turns grinding a recurrence into *seeing the
> structure*."

(Note: even in the opted-in version I softened "thinks like a quant" → "seeing the structure." The
sorting metaphor isn't needed even for the advanced learner; the citation and the formal names
already signal rigor.)

### 4.4 General tone fixes for L2–L6 copy

- Replace evaluator framings (*"interviewers use it to see whether you can…"*) everywhere with
  curiosity or capability framings (*"here's the thing that surprises everyone…"*).
- Gloss every formal term on first use in default copy, or relegate it to the note: "absorbing
  state," "first-passage," "Markov," "martingale," "no-arbitrage," "recurrence," "automaton."
- Keep the playful bet/challenge openers — they're strong **Attention** and they're already good.
- The milestone/seal names ("Martingale Mastered," etc.) can stay aspirational; just don't let the
  *narrative* voice sort learners. (Tradeoff in §7.)

### 4.5 The optional advanced track (concrete shape)

Reuse precedents that **already exist** in the product so this isn't new surface area:

- The PRD's **"Optional expert note"** on the overlap beat (flagship beat 9: *"for fair binary
  patterns, the expected wait equals the sum of 2^i over prefix-suffix overlap lengths…"*) is
  exactly the dual-track pattern. Generalize it into a consistent, **collapsed-by-default
  "Going deeper / For the interview"** affordance available on any beat.
- **Extension beats** (bias sandbox) and `maxHintLevel`-capped transfer beats are already
  non-blocking — the same "available, never required" muscle the advanced track needs.
- I defer the schema mechanics to the widgets/schema agents, but the minimal ask is: a beat may
  carry an optional, collapsed note with a label and body; it never gates completion and never sets
  `needsReview`.

---

## 5. Recommendations for the implemented L1 lesson (`fixtures/lesson-pattern-hitting-times.json`)

Per-beat before→after. Math is unchanged; only the *words* and the *confidence ramp* change.

### 5.1 PRD persona statement (the upstream fix)

**Before** (`docs/mvp_prd.md`, User Persona):
> "The primary user is a university underclassman preparing for quant interviews. They know about
> resources like the Green Book, but want something more interactive and hands-on than static
> problem lists. They are not trying to memorize isolated tricks. They want deeper understanding of
> the patterns of thinking that help them solve unfamiliar probability questions under interview
> pressure."

**After:**
> "The primary user is a **curious person who wants to genuinely understand probability by doing it,
> not by being told the answer** — a student, a self-teacher, a developer, or someone returning to
> math years later. **We assume no prior probability, statistics, or algebra**; the product meets
> the learner at one concrete question ('why does HH take longer to show up than HT?') and lets them
> build the reasoning with their hands. A **second, fully-served audience is the learner prepping for
> quant or technical interviews**: the same lessons carry an optional 'Going deeper' track with
> formal names (expected value, Markov chains, martingales) and interview framing. Both audiences
> share one spine — intuition first for everyone; rigor and interview context available to anyone who
> wants them, gated behind no one."

**Landing subline — before:** "State thinking for quant interviews."
**After:** "Learn probability by playing with it." (optional smaller reassurance line: "Deep enough
for quant-interview prep.") The headline stays; only the gate-y subline changes.

### 5.2 `equation-tiles` — the notation cliff

**Prompt — before:**
> "Here's the equation for E0, worked out. Build E1 the same way: every flip costs 1, then split by
> the coin."

**Prompt — after:**
> "Here's the finished equation for the **start state (E0)** — we did this one for you. Build the
> **next state (E1)** the same way: every flip you make costs **1 flip**, and then the coin sends you
> to one of two places, **half the time to each**. Tap the pieces into the slots."

(Names what `E0`/`E1` *are*, unpacks "split by the coin," matches the tap-first input path.)

**Correct — before:**
> "That's the system. The 1/2 E0 term in E1 is HH's penalty: a near-miss falls all the way back."

**After:**
> "That's the whole setup. See the **½·E0** piece in the E1 line? That's HH's catch: one wrong flip
> sends you *all the way back to the start* — which is exactly why HH takes longer."

(Drops "the system"/"penalty"; explains the term's meaning and ties it to the payoff.)

### 5.3 `guided-solve` — algebra verbs without the jargon tax

**Prompt — before:** "Tap through the substitution to solve the system for E0."
**After:** "Tap through the steps to find **E0 — the average number of flips until HH**. Each step
plugs a value we already know into the next line."

**Hints — before / after:**
- before: "Start from the absorbing state E2 = 0 and work backward."
  → after: "Start with the part you already know: once you've *seen* HH, you're done — so its wait is
  **0**. Build out from there."
- before: "Substitute E2 into E1, then E1 into E0, and isolate E0."
  → after: "Drop that **0** into the E1 line to get a number for E1. Then drop E1's number into the
  E0 line."
- before (reveal): "Solving 1/2 E0 = 3 gives E0 = 6."
  → after (reveal): "E1 works out to **4**. Put it into E0 = 1 + ½·E1 + ½·E0; the two ½·E0 pieces
  combine, and you get **E0 = 6 — about 6 flips, on average, to see HH**."

(Every number identical; "absorbing state"→"once you're done," "substitute"→"drop into,"
"isolate"→shown; restates what the answer *means*.)

### 5.4 `failure-edge` — plainer prompt (the per-pattern feedback is already good)

**Prompt — before:** "After matching one H, the next flip is the near-miss. Where does the state
machine go?"
**After:** "You've got **one H** so far. The next flip is the make-or-break moment. On the diagram,
where does your progress go?"

(Keeps the concept; "the state machine"→"the diagram," "near-miss"→"make-or-break moment,"
"progress" is personal and concrete. Leave the excellent `byPattern` correct/hints as-is.)

### 5.5 `open-bet` — small softening, keep the gold

Keep hint[0] verbatim ("There's no wrong guess yet…") — it's the model. Soften "the trap":
- before: "Most people pick the tie. Notice the trap: both patterns have length 2, but a near-miss
  doesn't cost the same."
- after: "Most people pick the tie — it's the natural guess. Here's the thing to watch: both
  patterns are length 2, but a near-miss doesn't cost the same for each."

### 5.6 `recap` — cash in the Satisfaction + attribute the win

**Correct — before:** "You modeled HH vs HT as states, built the recurrences, and proved E[HH] = 6 >
E[HT] = 4."
**After:** "Look what you just did: you turned a coin question into a little machine, built its
equations, and **proved** HH takes about 6 flips on average while HT takes 4 — **by hand**. That's the
exact method professionals use."

(ARCS-Satisfaction + Bandura attribution: success credited to the learner's own effort, "by hand,"
builds efficacy; the quant payoff becomes a *reward*, not a gate.)

### 5.7 New micro-affordances inside L1 (small, optional)

- **A just-in-time "what's an average here?" chip** the first time `refine-prediction` says "on
  average": one tap → "If you played this game many times and wrote down how many flips each time,
  the average is the typical count. We're predicting that typical count." (Grounds the concept the
  course rests on; Ashcraft — pre-load the term so it isn't rent later.)
- **Tap-to-define glyph chips** on first use of `E0`, "state," "recurrence" (one plain line each).
- **An intermediate confidence rung before the first graded beat:** an ungraded "read the diagram"
  tap on `simulate` ("after one H, a T sends you… back to start / forward — tap what you see") so the
  first *graded* check isn't the learner's first encounter with the idea. (Bandura early mastery;
  Bjork: keep the difficulty *desirable* by ensuring readiness.)

---

## 6. Cross-cutting / structural proposals

**6.1 Who is this really for now? (new positioning.)**
*"A hands-on way to actually understand probability — one surprising coin question at a time.
Friendly to total beginners, deep enough for quant-interview prep."* The curious beginner is the
**front door**; the quant prepper is a **named, fully-served room inside**, not the doorman. This
single reframing resolves most §3 issues because everything downstream inherits the persona.

**6.2 Dual track that genuinely coexists.** One spine of beats everyone completes in plain language;
math notation introduced just-in-time; an opt-in **"Going deeper / For the interview"** note per beat
carrying formal names, interview phrasing, and citations. Built on existing precedents (expert note,
Extension beats, hint caps) so it's not new surface. The advanced learner loses nothing; the beginner
is never blocked by depth they didn't ask for.

**6.3 Early-win engineering (course-wide rule).** Make the **first graded interaction of every lesson
high-success** (the `open-bet` pattern), and **never place the hardest beat first among graded
beats**. Bandura: mastery is the #1 efficacy source; the cheapest place to manufacture one is beat 1.

**6.4 Framing of struggle (voice spec).** Adopt a consistent "mistakes are where the learning is"
register: level-1 hints **normalize** ("most people put this here first — here's what to notice"),
never deliver verdicts; retire "trap"/"penalty"/"wrong"; the internal `needsReview` should surface to
the learner only as a gentle "worth a revisit," never a demerit. (Walton & Cohen normalization;
Steuer & Dresel error climate; Moser attention-to-error — with the §7 caveat on over-claiming.)

**6.5 Anxiety & belonging on-ramp (opt-in, ~20s).** At course start (or first hard lesson), one
optional line + dismiss: *"Feeling rusty with math? That's normal, and it fades fast once you start.
This course begins from zero — no formulas required to walk in."* Evidence-backed (Ramirez & Beilock
2011; Rozek 2019; Walton & Cohen 2011), cheap, and on-brand if kept terse.

**6.6 Learner-generated relevance (autonomy).** A light onboarding question — *"What brings you here?
[Just curious] [Brushing up] [Prepping for quant/tech interviews]"* — sets tone and, for the quant
choice, surfaces the "For the interview" notes by default. It does **not** hard-fork content (avoid
maintaining two lesson trees). For non-quant choices, lead with curiosity framings. (Hulleman &
Harackiewicz 2009; SDT autonomy; ARCS-Relevance.)

**6.7 Dual positioning summary.** Curiosity is the universal hook (everyone likes "that's
impossible… oh"); quant prep is the power-user payoff. Same lessons, same rigor, two doors in and one
optional deeper door throughout.

---

## 7. Tradeoffs & open questions (for the human)

1. **Warmth vs the "serious notebook, terse, no exaggerated excitement" identity.** My whole thrust
   is *warmer, less gatekeeping*. Overcorrecting into cheerful/childish copy would betray the design
   system and could *lose* the serious quant learner. I've kept every rewrite warm-but-precise, but
   the line between "welcoming" and "bubbly" is a judgment call the human must own. **Recommendation:
   adopt the de-gatekeeping changes (high confidence) and tune warmth conservatively.**
2. **"Mistakes grow your brain" is overstated — use the defensible version.** Boaler/youcubed's
   popular phrasing leans on Moser et al. (2011), which measured an EEG *error-positivity* (attention
   to errors), **not** literal synapse growth. Use "attending to and fixing mistakes is how learning
   happens," not neuro-myth. Also note growth-mindset *interventions* have small average effects
   (Sisk et al. 2018 meta-analysis) concentrated in lower-achieving / at-risk learners (Yeager et al.
   2019, *Nature*) — which actually *supports* targeting our most anxious users, but argues against
   over-promising.
3. **Depth-preservation cost.** Two registers of copy (default + "For the interview") roughly doubles
   authoring and adds UI surface. Who maintains both? Is the collapsed note worth it on *every* beat,
   or only the most jargon-heavy ones? (I'd start with the worst offenders: L2/L3/L6 "why" lines and
   L1 `guided-solve`/`equation-tiles`.)
4. **Quant branding consistency.** If the default voice de-emphasizes quant but the milestone seals
   ("Martingale Mastered"), course wordmark, and roadmap stay quant-flavored, is that an acceptable
   "curious front door, serious interior," or does it read as mixed signals? Possible follow-up:
   re-tone seal *descriptions* (not necessarily names).
5. **Onboarding friction.** Auth-first onboarding values speed; a "what brings you here?" question and
   a reappraisal line add steps. Both are skippable, but the team should confirm they don't hurt
   landing→start conversion. A/B if possible.
6. **Desirable-difficulty calibration needs real novices.** Faded hints keep transfer/prediction
   beats *desirable* (Bjork), but "where's the cliff for a true zero-foundation learner?" can only be
   answered by testing with actual beginners — which the team may not currently have in its user pool
   (the persona literally selected *against* them). **This is the biggest validity risk in the whole
   inclusive effort.**
7. **Docs ordering conflict to resolve.** `docs/future_ideas.md` orders L4 Overlap Shortcut / L5
   States & Streaks / L6 Longer Patterns, contradicting PRD/CONTEXT (L4 States & Streaks / L5 Longer
   Patterns / L6 Overlap Shortcut). I used PRD/CONTEXT as canonical; the coordinator should reconcile
   so hooks land on the right lesson.
8. **Reading level vs precision.** Plain-language glosses can drift toward imprecision ("the coin
   sends you to one of two places"). Keep the formal statement adjacent (in the note) so we don't
   trade rigor for warmth.

---

## 8. Sources

**Math anxiety & working memory**
- Ashcraft, M. H., & Kirk, E. P. (2001). The relationships among working memory, math anxiety, and
  performance. *Journal of Experimental Psychology: General, 130*(2), 224–237.
- Ashcraft, M. H., & Faust, M. W. (1994). Mathematics anxiety and mental arithmetic performance.
  *Cognition and Emotion, 8*(2), 97–125.
- Ma, X. (1999). A meta-analysis of the relationship between anxiety toward mathematics and
  achievement in mathematics. *Journal for Research in Mathematics Education, 30*(5), 520–540.
- Young, C. B., Wu, S. S., & Menon, V. (2012). The neurodevelopmental basis of math anxiety.
  *Psychological Science, 23*(5), 492–501.

**Anxiety interventions (reappraisal / expressive writing)**
- Ramirez, G., & Beilock, S. L. (2011). Writing about testing worries boosts exam performance in the
  classroom. *Science, 331*(6014), 211–213.
- Beilock, S. L. (2008). Math performance in stressful situations. *Current Directions in
  Psychological Science, 17*(5), 339–343.
- Rozek, C. S., Ramirez, G., Fine, R. D., & Beilock, S. L. (2019). Reducing socioeconomic disparities
  in the STEM pipeline through student emotion regulation. *PNAS, 116*(5), 1553–1558.

**Self-efficacy & Self-Determination Theory**
- Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. *Psychological
  Review, 84*(2), 191–215.
- Bandura, A. (1997). *Self-Efficacy: The Exercise of Control.* W. H. Freeman.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic Motivation and Self-Determination in Human Behavior.*
  Plenum.
- Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic
  motivation, social development, and well-being. *American Psychologist, 55*(1), 68–78.

**Motivational design (ARCS) & expectancy-value-cost**
- Keller, J. M. (1987). Development and use of the ARCS model of instructional design. *Journal of
  Instructional Development, 10*(3), 2–10.
- Keller, J. M. (2010). *Motivational Design for Learning and Performance: The ARCS Model Approach.*
  Springer.
- Eccles, J. S., et al. (1983). Expectancies, values, and academic behaviors. In J. T. Spence (Ed.),
  *Achievement and Achievement Motivation* (pp. 75–146). Freeman.
- Wigfield, A., & Eccles, J. S. (2000). Expectancy–value theory of achievement motivation.
  *Contemporary Educational Psychology, 25*(1), 68–81.
- Barron, K. E., & Hulleman, C. S. (2015). Expectancy-value-cost model of motivation. In *International
  Encyclopedia of the Social & Behavioral Sciences* (2nd ed.).
- Hulleman, C. S., & Harackiewicz, J. M. (2009). Promoting interest and performance in high school
  science classes. *Science, 326*(5958), 1410–1412.

**Growth mindset & error climate (with caveats)**
- Dweck, C. S. (2006). *Mindset: The New Psychology of Success.* Random House.
- Moser, J. S., Schroder, H. S., Heeter, C., Moran, T. P., & Lee, Y.-H. (2011). Mind your errors:
  Evidence for a neural mechanism linking growth mind-set to adaptive posterror adjustments.
  *Psychological Science, 22*(12), 1484–1489.
- Boaler, J. (2016). *Mathematical Mindsets.* Jossey-Bass. (youcubed "mistakes" messaging — see §7
  caveat.)
- Steuer, G., Rosentritt-Brunn, G., & Dresel, M. (2013). Dealing with errors in mathematics
  classrooms. *Contemporary Educational Psychology, 38*(3), 196–210.
- Sisk, V. F., et al. (2018). To what extent and under which circumstances are growth mind-sets
  important to academic achievement? *Psychological Science, 29*(4), 549–571.
- Yeager, D. S., et al. (2019). A national experiment reveals where a growth mindset improves
  achievement. *Nature, 573*, 364–369.

**Desirable difficulties**
- Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. In
  Metcalfe & Shimamura (Eds.), *Metacognition.* MIT Press.
- Bjork, R. A., & Bjork, E. L. (2011). Making things hard on yourself, but in a good way: Creating
  desirable difficulties to enhance learning. In *Psychology and the Real World.*
- Bjork, R. A., & Bjork, E. L. (2020). Desirable difficulties in theory and practice. *Journal of
  Applied Research in Memory and Cognition, 9*(4), 475–479.

**Belonging & stereotype threat**
- Steele, C. M., & Aronson, J. (1995). Stereotype threat and the intellectual test performance of
  African Americans. *Journal of Personality and Social Psychology, 69*(5), 797–811.
- Steele, C. M. (1997). A threat in the air: How stereotypes shape intellectual identity and
  performance. *American Psychologist, 52*(6), 613–629.
- Spencer, S. J., Steele, C. M., & Quinn, D. M. (1999). Stereotype threat and women's math
  performance. *Journal of Experimental Social Psychology, 35*(1), 4–28.
- Walton, G. M., & Cohen, G. L. (2011). A brief social-belonging intervention improves academic and
  health outcomes of minority students. *Science, 331*(6023), 1447–1451.
- Walton, G. M., & Cohen, G. L. (2007). A question of belonging: Race, social fit, and achievement.
  *Journal of Personality and Social Psychology, 92*(1), 82–96.

**Repo artifacts cited**
- `docs/mvp_prd.md` (Product Summary, User Persona, Flagship Lesson Flow, beat 9 expert note).
- `docs/proposed-lessons.md` (L2/L3/L6 Hook and "Why it matters for quant" lines; §8 course path).
- `docs/future_ideas.md` (conflicting L4–L6 order; hook lines).
- `docs/ui_design_system.md` (landing hero/subline; voice guidance).
- `CONTEXT.md` (canonical lesson order).
- `fixtures/lesson-pattern-hitting-times.json` (all beat prompts, correct copy, 3-level hint ladders).
