# BrainLift: Learning Science for Quant Interview Prep

## Owners

- Eric Wu (eric.wu@alphaaiengineering.com)

---

## Purpose

This BrainLift defines the scientifically best way to prepare for quant trading and HFT interviews, and translates that science into concrete product decisions for **Ergo**, my Brilliant clone. It rests on one claim: quant-interview readiness is a problem of durable retrieval, transfer, and composure under pressure — not of comprehension. Understanding a solution is overrated. The deciding variable is whether a candidate can reconstruct the right *method* for an unlabeled problem, from memory, aloud, weeks later, under stress. Ergo currently optimizes for the wrong thing. This document explains why, and what to do about it.

### In Scope

- The mechanisms that actually move delayed, transferable, under-pressure performance: retrieval practice, spacing, interleaving, desirable difficulties, worked-example fading, transfer and analogical encoding, productive failure, feedback and metacognition, motivation, and performance psychology.
- Translating each mechanism into actionable product changes for Ergo: beats, scheduling, mastery signals, the AI capstone interview, motivation surfaces, and measurement.
- SPOVs that challenge both edtech orthodoxy and Ergo's own current design.

### Out of Scope

- The quant content canon itself — the specific Green Book and Heard-on-the-Street problem set, Markov chains, EV, combinatorics. That lives in the lesson factory and interview packs, not here.
- Net-new ML/RAG infrastructure. This is a strategy and pedagogy document, not an architecture spec.
- General test-prep for non-quant domains. The spikes are tuned to the quant interview's specific demands: novel problems, think-aloud, speed, and pressure.

---

## DOK 4 — Spiky Points of View (SPOVs)

### SPOV 1 — Stop Teaching, Start Testing: the lesson is the least valuable part

Ergo should be a spaced-retrieval testing engine with lessons bolted on, not a lesson app with quizzes bolted on. Invert the daily loop so the first thing a user hits is a mixed, cold recall queue. Treat the beautifully crafted lesson as a disposable on-ramp.

The Brilliant model assumes the lesson *is* the product — that slicker explanations and smoother worked examples are where learning is manufactured, and that finishing a well-built lesson means you learned it. The implicit equation is: great encoding plus completion equals mastery.

That equation is wrong. The single most replicated result in the science of learning is that retrieval *is* the learning event, not a measurement of it. Roediger & Karpicke (2006) showed one round of testing beat repeated restudy at a one-week delay, even though the restudy group performed better immediately and predicted they would do better — a crossover that exactly describes what Ergo optimizes: in-session performance that never recurs in the real interview. Bjork's storage-vs-retrieval-strength framework and Soderstrom & Bjork's (2015) learning-vs-performance dissociation sharpen the case: conditions that make you look good now (re-reading an elegant solution) often do nothing for durable, transferable skill. Koriat's and Kornell & Bjork's work on the fluency illusion shows that the smoothness of a re-read solution is misread as competence. A quant interview is the cruelest exam of this gap: a novel problem, no solution to re-read, working memory under stress, and the candidate must generate and re-derive aloud. The training environment that transfers is the one isomorphic to that test — cold, delayed, interleaved retrieval — not a polished forward pass through a lesson.

Supporting research:
- Testing effect — Roediger & Karpicke (2006): large long-delay retention advantage for testing over restudy (~+15-20 pts at 1 week), reversed on immediate tests. *Strong.*
- Retrieval beats elaborative study on transfer — Karpicke & Blunt (2011, *Science*): retrieval practice beat concept-mapping on delayed inference questions; students predicted the opposite. *Strong.*
- Spacing — Cepeda et al. (2006), 250+ studies: distributed practice robustly beats massing. *Strong.*
- Generation effect — Slamecka & Graf (1978): self-generated answers retained better than read ones. *Moderate-strong.*
- Pretesting / productive failure — Kapur (2008): attempting before instruction improves later transfer. *Moderate.*

App actions (Ergo):
- [Large] Invert the daily loop: open into a Retrieval Queue (mixed, interleaved across concepts) *before* any lesson. Build on the existing `selectWeakNode` / `recommendReview` in `src/progress/recommend.ts` and ship the deferred spaced-repetition hook by adding a time axis (last-seen, decay) to data already persisted. Item types: `masteryChallenge`, `answerEntry`, `retrievalGrid`, `tripletReveal`.
- [Medium] Fix the category error in `src/lesson/mastery.ts`: mastery is currently read off the same session that taught it (first-try, no hint). Require a delayed clean retrieval (>=1 day later) before "mastered" or the medallion fires. Completion does not equal mastery.
- [Medium] Make beats generation-first: gate the worked solution behind a real attempt via the hint ladder; default to a cold `answerEntry` / `masteryChallenge`; use `equationTiles` faded / `density:'split'` so re-derivation, not reading, is the path.
- [Small] Re-point the streak to count retrieval reps, not lessons completed.
- [Small] Add a cold-open pretest (one `answerEntry`) before each lesson's teaching, for test-potentiated learning.

Counterarguments and boundary conditions:
- Expertise reversal / cognitive load (Kalyuga; Sweller): for genuine first contact, worked examples beat flailing — you cannot retrieve what was never encoded. The thin on-ramp stays; inversion applies *after* first exposure.
- Context-bound retrieval does not equal transfer (Chi; Gick & Holyoak): drilling identical items builds recall of those items only. The queue must interleave by deep structure with fresh surfaces.
- Calibrate to ~40-60% retrieval success: a relentless failure-first queue can crush competence and autonomy (Deci & Ryan) and induce choking (Beilock).

*Insights feeding it: I1, I2, I9.*

---

### SPOV 2 — Topics Are a Lie; Chapters Are Pedagogical Theater

Ergo's topic catalog and tidy linear chapter path are the single biggest thing sabotaging interview readiness. Demote the "learning journey" to a reference glossary, and make a label-stripped, interleaved "which-method?" engine the home screen.

Good pedagogy, in the standard edtech view, means a clean taxonomy: one topic at a time, mastered in sequence, each chapter unlocking the next. The unit of progress is "finish the gambler's-ruin chapter."

The interview never asks you to execute gambler's ruin. It asks whether *this* is a gambler's-ruin problem — selection on an unlabeled prompt. That is a discrimination skill, and the decisive finding (Rohrer & Taylor, 2007; Rohrer, 2012) is that interleaved practice beats blocked practice on delayed math tests specifically because it trains strategy selection. A topic chapter eliminates the only skill being graded: the chapter title silently announces the method, so every problem inside is pre-solved at the level that matters. This compounds with Chi, Feltovich & Glaser (1981), who found that experts sort problems by deep structure while novices sort by surface features (coins, dice, cards). A topic catalog is an org chart of surface features — it rehearses the novice taxonomy and hands the deep principle over for free. Blocking produces better in-session performance and a smoother demo, and Kornell & Bjork (2008) found learners believe blocking works better even as interleaving wins at delay. The topic chapter optimizes the felt sense of mastery while starving the transfer the interview tests (Gick & Holyoak, 1983).

Supporting research:
- Interleaving > blocking on delayed math tests — Rohrer & Taylor (2007); Rohrer, Dedrick & Stershic (2015): delayed accuracy roughly doubled though practice-phase accuracy looked worse. *Strong.*
- Discrimination hypothesis — Rohrer (2012): the benefit is learning to *select* the procedure. *Strong.*
- Metacognitive illusion of blocking — Kornell & Bjork (2008). *Strong.*
- Experts categorize by deep structure — Chi, Feltovich & Glaser (1981). *Foundational.*
- Transfer requires compared analogs — Gick & Holyoak (1983); Gentner's analogical encoding: spontaneous transfer near floor with one example, rises sharply when two analogs are compared. *Strong.*

App actions (Ergo):
- [Large] Make a label-stripped "Mixed Floor" the home surface; demote the catalog to a reference index. Default practice draws problems across all concepts with topic and chapter titles hidden at the solving surface.
- [Medium] Add a "which-method?" gate before any solving: reuse the `prediction` beat with `byOption` refutation (or `patternPick` compare). The learner first commits to a method from a fixed menu (first-step analysis, linearity/indicators, symmetry, conditioning, states/Markov, generating functions, complementary counting). Selection becomes the graded act.
- [Medium] Re-index mastery on cross-topic discrimination: replace the "zero hints in a lesson" proxy in `src/lesson/mastery.ts` with a `retrievalGrid` + `masteryChallenge` gate that requires mapping unlabeled, confusable problems to methods.
- [Medium] Make `recommend.ts` method-indexed, not lesson-indexed: track misclassification across concepts and re-surface the weakest method with fresh, interleaved, spaced problems paired with deliberate foils.
- [Small] Tag every problem with a hidden deep-structure schema id and strip surface labels, so the engine can interleave by method and detect surface-vs-deep confusions; turn `Calibrate` into a discrimination check.

Counterarguments and boundary conditions:
- Expertise reversal / cognitive load (Kalyuga; Sweller; Cowan): rank novices cannot choose among unseen methods. Block briefly to seed each schema, then interleave.
- Interleaving helps only for confusable categories (Rohrer): pair deliberate foils, not random shuffles.
- Killing the linear journey can tank the habit loop and the demo; keep the scaffolding but re-skin it around method mastery.

*Insights feeding it: I3, I4, I10.*

---

### SPOV 3 — Comfort Is Malpractice: you should fail ~half your reps

If Ergo ever makes you feel smooth, it has already failed you. Optimal quant prep runs a deliberate struggle band (~50-85% success), front-loads productive failure, treats fluency as an alarm rather than an achievement, and makes the mock interview deliberately brutal — surfacing the practice-vs-performance gap rather than concealing it.

Mainstream edtech equates learning with high success rates, smooth progress, and confidence. Streaks and medallions reward exactly that.

In-session success is a backwards signal for quant prep. Bjork's desirable difficulties and storage-vs-retrieval-strength framework show that performance-depressing conditions (spacing, interleaving, reduced cues, retrieval) raise transfer, while easy-feeling practice inflates short-term scores and corrodes long-term retention. Soderstrom & Bjork (2015) found that acquisition performance is an unreliable — sometimes negative — proxy for learning, which means a rising streak is the wrong needle. Kapur's productive failure research shows that attempting and failing *before* instruction beats instruction-first on transfer. Quick-rescue hints and high hit-rates are performance-optimizers that manufacture the fluency illusion (Roediger & Karpicke; Koriat) that destroys candidates on novel, timed, think-aloud interviews. And because a quant interview is a performance-under-pressure event, the only way to train for it is transfer-appropriate processing (Morris, Bransford & Franks, 1977) plus stress inoculation (Meichenbaum) — representative difficulty and pressure, not comfort.

Supporting research:
- Desirable difficulties / storage-vs-retrieval — Bjork. *Robust framework.*
- Learning does not equal performance — Soderstrom & Bjork (2015). *Strong.*
- Productive failure — Kapur (2008); Schwartz & Martin (2004). *Moderate-strong.*
- Errorful generation helps later recall — Kornell, Hays & Bjork (2009); Slamecka & Graf (1978). *Solid.*
- Pressure consumes working memory; train under representative stress — Beilock & Carr (2005); Morris, Bransford & Franks (1977); Meichenbaum stress inoculation. *Strong.*

App actions (Ergo):
- [Large] Add a ~50-85% difficulty governor: raise faded density, lower `hintCapOverride`, and suppress `assist` when rolling success climbs above ~85% (in `src/lesson/beats/types.ts` knobs); ease it if success drops below ~50%.
- [Medium] Failure-first sequencing: a cold `prediction` / `answerEntry` attempt *before* the `primer` or worked example, then consolidate. This is the productive-failure pattern, not floundering.
- [Medium] Make the Capstone brutal by default and foreground the gap: show "in-app accuracy vs interview accuracy" alongside the `hireSignal` so the practice-vs-performance delta is the headline.
- [Small-Medium] Demote streaks to "reps completed in the struggle band," and add a fluency warning when a `Calibrate` check is answered suspiciously fast.
- [Small] Make `retrievalGrid` / `masteryChallenge` retrieval-first cold checks rather than post-lesson confirmations.

Counterarguments and boundary conditions:
- Unguided floundering harms novices (Kirschner, Sweller & Clark, 2006; Kalyuga): pair productive failure with contrasting cases and guaranteed consolidation (Loibl & Rummel). The band is ~50-85%, not 0-20%.
- Math anxiety taxes working memory (Ashcraft & Kirk, 2001) and erodes SDT competence: pair difficulty with arousal reappraisal (Jamieson) and a pre-interview expressive-writing worry-dump (Ramirez & Beilock, 2011).
- Speed primitives (mental math, powers of two, common identities) should be overlearned to fluency — automaticity is the exception where smoothness is the goal.

*Insights feeding it: I5, I6, I11.*

---

### SPOV 4 — Your Gamification Is Iatrogenic

Ergo's streak, completion medallions, and the Strong-No to Strong-Yes "hire signal" are not neutral motivators. They pay out for smooth, hint-free fluency that masks non-learning, and thus degrade the very mastery they advertise. The most pro-mastery move is to stop rewarding completion, streaks, and right answers, and pay instead for effortful retrieval, calibration accuracy, and verified delayed transfer.

The standard assumption is that gamification is a neutral-to-positive engagement layer — more engagement is good — and that a confidence-boosting hire signal readies a candidate.

The damage is structural. `computeMastered` in `src/lesson/mastery.ts` marks a concept "mastered" only when graded beats are first-try-correct with no hint ever shown. It literally penalizes help-seeking and rewards smoothness, which Soderstrom & Bjork (2015) identify as the treacherous proxy: desirable difficulties depress in-session performance while raising retention. Ergo's reward gradient thus points away from learning exactly when learning is happening — the desirable-difficulty dip breaks the streak and forfeits the medallion. Kluger & DeNisi (1996) found that roughly a third of feedback interventions lowered performance, concentrated where feedback targeted the self rather than the task. The hire signal is a six-point verdict-on-the-person, the canonical self-level cue that Hattie & Timperley (2007) rank as the weakest and most often harmful feedback type. Each mechanic rewards the fluency illusion (Bjork) and an ego-goal frame (Dweck) over the mastery frame a brutal interview demands. For a quant candidate specifically, a falsely reassuring signal manufactures the overconfidence the interview is built to detect.

Supporting research:
- Feedback to the self can hurt — Kluger & DeNisi (1996), meta-analysis. *Strong.*
- Feed-forward beats verdicts — Hattie & Timperley (2007). *Strong.*
- Reward the dip; performance does not equal learning — Soderstrom & Bjork (2015). *Strong.*
- Over-justification / crowding-out — Deci (1971); Deci, Koestner & Ryan (1999) meta-analysis. *Strong.*
- Overconfidence is miscalibration — Dunning-Kruger (1999); Bjork illusions of competence. *Moderate-strong.*

App actions (Ergo):
- [Small] Demote the hire-signal verdict to a calibration delta: keep the five dimensions as feed-forward "next fix" cards (`functions/src/interview.ts` / `InterviewReportView`); replace the Strong-No to Strong-Yes pill with *predicted vs measured* readiness.
- [Medium] Invert the mastery signal in `src/lesson/mastery.ts`: reward productive struggle (used a hint, then succeeded on a later cold retrieval) instead of penalizing it.
- [Large] Gate medallions on delayed transfer: a concept medallion mints only when a novel transfer problem is passed N days later, not on completion.
- [Medium] Re-base the streak on spaced return: reward a successful retrieval after a gap, and remove the reset-to-zero loss-aversion penalty in the streaks module.
- [Small] Make calibration the celebrated number: capture confidence on each `prediction`, score a Brier/calibration stat, and reward correctly-low confidence on hard items — training the trader's core skill, since bet sizing is calibration.

Counterarguments and boundary conditions:
- Adherence dominates for the marginal learner: streaks demonstrably drive retention (Duolingo). For low-comfort or slow-pace users, a light early streak may beat an optimal-but-abandoned regimen. Invert later, not on day one.
- Reward contingency, not rewards outright: informational competence feedback can raise intrinsic motivation (Deci & Ryan). The goal is to invert the reward target, not eliminate rewards.
- Calibration training should not breed timidity: reward calibration and decisive commitment together, since interviews punish non-commitment as much as overconfidence.

*Insights feeding it: I7, I8.*

---

## Experts

- **Henry L. Roediger III & Jeffrey Karpicke** — Memory researchers (Washington Univ. in St. Louis / Purdue). Focus: the testing/retrieval-practice effect. The empirical bedrock of SPOV 1 — retrieval as the learning event. [Link](https://scholar.google.com/scholar?q=Roediger+Karpicke+test-enhanced+learning)
- **Robert A. Bjork & Elizabeth Ligon Bjork** — UCLA, Learning & Forgetting Lab. Focus: desirable difficulties, storage-vs-retrieval strength, learning-vs-performance. The conceptual spine of SPOVs 1, 3, 4. [Link](https://bjorklab.psych.ucla.edu/)
- **Nicholas Soderstrom** — Learning scientist. Focus: the learning-vs-performance distinction (Soderstrom & Bjork, 2015). The methodological hinge of SPOVs 1, 3, 4 — durable learning does not equal in-session performance, so judge prep at delay. [Link](https://scholar.google.com/scholar?q=Soderstrom+Bjork+2015+learning+versus+performance)
- **Doug Rohrer & Kelli Taylor** — Univ. of South Florida. Focus: interleaving and the discrimination hypothesis in math. The backbone of SPOV 2. [Link](https://scholar.google.com/scholar?q=Rohrer+Taylor+interleaving+mathematics)
- **Michelene Chi** — ASU cognitive scientist. Focus: expert/novice problem categorization; self-explanation. Grounds deep-structure recognition (SPOV 2) and self-explanation feedback. [Link](https://scholar.google.com/scholar?q=Chi+Feltovich+Glaser+1981+categorization+physics)
- **Dedre Gentner / Keith Holyoak** — Analogy and transfer researchers. Focus: analogical encoding; comparing analogs to build schemas. The transfer engine behind SPOV 2's "same method, different costume." [Link](https://scholar.google.com/scholar?q=Gick+Holyoak+1983+analogical+problem+solving)
- **John Sweller & Slava Kalyuga** — UNSW. Focus: cognitive load theory; worked examples; expertise reversal. The boundary conditions on every spike — when difficulty becomes overload. [Link](https://scholar.google.com/scholar?q=Sweller+cognitive+load+worked+examples)
- **Manu Kapur** — ETH Zürich. Focus: productive failure. Grounds the failure-first sequencing in SPOV 3. [Link](https://scholar.google.com/scholar?q=Kapur+2008+productive+failure)
- **Avraham Kluger & Angelo DeNisi / John Hattie** — Feedback researchers. Focus: when feedback helps vs hurts; feed-forward. The case against ego-level "hire signal" in SPOV 4. [Link](https://scholar.google.com/scholar?q=Kluger+DeNisi+1996+feedback+intervention)
- **Sian Beilock & Mark Ashcraft** — Performance and math-anxiety researchers. Focus: choking under pressure; anxiety's working-memory cost. The pressure-training case in SPOV 3. [Link](https://scholar.google.com/scholar?q=Beilock+Carr+choking+under+pressure)
- **Edward Deci & Richard Ryan** — Self-Determination Theory. Focus: intrinsic motivation; over-justification. The motivation critique in SPOV 4. [Link](https://selfdeterminationtheory.org/)

---

## DOK 3 — Insights

**On retrieval and the data model**
- I1. The quant interview is a delayed, cold, interleaved retrieval test under load. The highest-transfer trainer is isomorphic to that test, and a lesson-first loop optimizes a moment (in-lesson performance) that never occurs in the room.
- I2. "Completion = mastery" is the fluency illusion encoded into the data model: reading mastery off the teaching session makes the schema structurally unable to distinguish learning from performance.
- I9. Ergo already stores the only durable struggle signal (`maxHintLevelByBeat`) and a weak-node selector. It has the skeleton of a spaced scheduler and a measurement layer, and spends its craft on encoding instead. The cheapest 10x improvement is adding a time axis to data it already collects.

**On structure and transfer**
- I3. A chapter title is a permanent Level-0 hint — a built-in spoiler of the method — so a topic catalog has effectively capped every problem at maximum assistance on the exact decision the interview grades.
- I4. Because Gick & Holyoak transfer requires cross-surface comparison, Ergo's highest-leverage new beat is not a harder solver but a `retrievalGrid` of "same method, different costume" matches — turning interleaving from a scheduling trick into explicit schema abstraction.
- I10. The product currently optimizes execution fluency inside a known method, which is anti-correlated with interview readiness. It optimizes the metric the interview punishes.

**On difficulty, motivation, and calibration**
- I5. Ergo's happiest KPIs (streak length, hint-free first-try rate) are negatively diagnostic of readiness.
- I6. Productive failure and stress inoculation are one intervention applied to two layers: inoculate the concept (struggle before instruction) and the performance context (pressure before the real interview).
- I7. In quant prep specifically, the pedagogical antidote and the job skill are the same variable: calibration fixes the fluency illusion and is the trader's edge (bet sizing). The metric that heals the learning also trains the work.
- I8. The streak's stickiness and its motivational quality move in opposite directions: every increment of loss-aversion engagement is a decrement of SDT autonomy.
- I11. Since pressure and novel problems compete for the same working memory, a single brutal-mock outcome should outweigh any number of smooth in-app wins.

---

## DOK 2 — Knowledge Tree

### Category 1: Retrieval & Testing
- Source: Roediger & Karpicke (2006), *Test-Enhanced Learning.*
  - DOK 1 facts: Testing once produced higher retention than restudying at 1-week delay; restudy won on an immediate test; learners predicted restudy would win.
  - DOK 2 summary: Retrieval is a learning event, not just measurement; its benefit shows at delay, and metacognition mispredicts it. Feeds SPOV 1.
  - [Link](https://scholar.google.com/scholar?q=Roediger+Karpicke+2006+test-enhanced+learning)
- Source: Karpicke & Blunt (2011), *Science.*
  - DOK 1 facts: Retrieval practice beat elaborative concept-mapping on delayed inference (transfer) questions.
  - DOK 2 summary: Retrieval helps transfer, not just verbatim recall. Feeds SPOV 1, 2.
  - [Link](https://scholar.google.com/scholar?q=Karpicke+Blunt+2011+retrieval+practice+concept+mapping)

### Category 2: Spacing & Scheduling
- Source: Cepeda, Pashler, Vul, Wixted & Rohrer (2006) meta-analysis.
  - DOK 1 facts: 250+ studies; distributed practice beats massed; optimal gap scales with the retention interval.
  - DOK 2 summary: Spread practice over expanding intervals anchored to the target date. Feeds SPOV 1.
  - [Link](https://scholar.google.com/scholar?q=Cepeda+2006+distributed+practice+meta-analysis)

### Category 3: Interleaving & Discrimination
- Source: Rohrer & Taylor (2007); Rohrer, Dedrick & Stershic (2015).
  - DOK 1 facts: Interleaved math practice ~doubled delayed-test accuracy vs blocked, though practice-phase accuracy looked worse.
  - DOK 2 summary: Interleaving trains method selection (discrimination), the interview's core act. Feeds SPOV 2.
  - [Link](https://scholar.google.com/scholar?q=Rohrer+Taylor+2007+interleaved+practice)
- Source: Kornell & Bjork (2008).
  - DOK 1 facts: Interleaving improved inductive category learning while most learners judged blocking superior.
  - DOK 2 summary: The smooth feeling of blocking is a metacognitive illusion. Feeds SPOV 2, 3.
  - [Link](https://scholar.google.com/scholar?q=Kornell+Bjork+2008+learning+concepts+interleaving)

### Category 4: Desirable Difficulties & Learning-vs-Performance
- Source: Bjork & Bjork — desirable difficulties; storage-vs-retrieval strength.
  - DOK 1 facts: Difficulties that depress current performance (spacing, interleaving, reduced cues, retrieval) can raise long-term retention and transfer.
  - DOK 2 summary: Reward the dip, not the smoothness. Feeds SPOV 1, 3, 4.
  - [Link](https://scholar.google.com/scholar?q=Bjork+desirable+difficulties)
- Source: Soderstrom & Bjork (2015), *Learning versus Performance.*
  - DOK 1 facts: Acquisition performance is an unreliable, sometimes negative, index of durable learning.
  - DOK 2 summary: In-session accuracy is a surrogate; judge prep by delayed transfer. Feeds SPOV 1, 3.
  - [Link](https://scholar.google.com/scholar?q=Soderstrom+Bjork+2015+learning+versus+performance)

### Category 5: Worked Examples, Cognitive Load & Expertise Reversal
- Source: Sweller; Renkl & Atkinson; Kalyuga (expertise reversal).
  - DOK 1 facts: Novices learn more from worked examples than unguided solving; benefit fades and reverses as expertise grows; working memory ~4 chunks (Cowan).
  - DOK 2 summary: Scaffold by default, fade fast; the boundary condition on every spike. Feeds SPOV 1-3.
  - [Link](https://scholar.google.com/scholar?q=Kalyuga+expertise+reversal+effect)

### Category 6: Transfer, Schemas & Analogical Encoding
- Source: Chi, Feltovich & Glaser (1981).
  - DOK 1 facts: Experts categorize physics problems by deep principle; novices by surface features.
  - DOK 2 summary: Train sorting by method, not story. Feeds SPOV 2.
  - [Link](https://scholar.google.com/scholar?q=Chi+Feltovich+Glaser+1981+categorization)
- Source: Gick & Holyoak (1983); Gentner analogical encoding.
  - DOK 1 facts: Spontaneous transfer from one example is near floor; comparing two analogs raises it sharply.
  - DOK 2 summary: Teach via contrasting cases and explicit "what's the same?" Feeds SPOV 2.
  - [Link](https://scholar.google.com/scholar?q=Gick+Holyoak+1983+schema+induction)
- Source: Barnett & Ceci (2002).
  - DOK 1 facts: Far transfer is rare and must be engineered.
  - DOK 2 summary: Don't assume mastery transfers; engineer and check it. Feeds SPOV 2.
  - [Link](https://scholar.google.com/scholar?q=Barnett+Ceci+2002+taxonomy+far+transfer)

### Category 7: Productive Failure
- Source: Kapur (2008); Schwartz & Martin (2004).
  - DOK 1 facts: Attempting (and failing) before instruction improves later transfer vs instruction-first.
  - DOK 2 summary: Front-load struggle, then consolidate. Feeds SPOV 3.
  - [Link](https://scholar.google.com/scholar?q=Kapur+2008+productive+failure)

### Category 8: Feedback, Metacognition & Calibration
- Source: Kluger & DeNisi (1996); Hattie & Timperley (2007).
  - DOK 1 facts: ~1/3 of feedback interventions lowered performance, concentrated on self/ego-level feedback; effective feedback is process/feed-forward.
  - DOK 2 summary: A person-level "hire signal" is the weakest feedback type. Feeds SPOV 4.
  - [Link](https://scholar.google.com/scholar?q=Kluger+DeNisi+1996+feedback+intervention+theory)
- Source: Dunning-Kruger (1999); Bjork illusions of competence.
  - DOK 1 facts: The least skilled are the most overconfident; fluency inflates confidence.
  - DOK 2 summary: Calibration must be measured, not assumed. Feeds SPOV 4.
  - [Link](https://scholar.google.com/scholar?q=Kruger+Dunning+1999+unskilled+unaware)

### Category 9: Motivation (SDT & Rewards)
- Source: Deci (1971); Deci, Koestner & Ryan (1999); SDT.
  - DOK 1 facts: Expected, performance-contingent extrinsic rewards can undermine intrinsic motivation; autonomy, competence, and relatedness sustain effort.
  - DOK 2 summary: Loss-framed streaks and badges can crowd out intrinsic interest. Feeds SPOV 4.
  - [Link](https://scholar.google.com/scholar?q=Deci+Koestner+Ryan+1999+undermining+intrinsic+motivation)

### Category 10: Performance Under Pressure
- Source: Beilock & Carr (2005); Ashcraft & Kirk (2001); Morris/Bransford/Franks (1977); Ramirez & Beilock (2011); Jamieson.
  - DOK 1 facts: Pressure and anxiety consume working memory; performance is best under conditions matching practice; a ~10-min expressive-writing worry-dump and arousal reappraisal improve high-stakes test scores.
  - DOK 2 summary: Train under representative pressure *after* encoding; add a pre-interview routine. Feeds SPOV 3.
  - [Link](https://scholar.google.com/scholar?q=Ramirez+Beilock+2011+writing+about+testing+worries)

---

## Appendix — Consolidated App-Improvement Backlog

The actionable surface of all four spikes, deduplicated and prioritized. Effort: [S]mall / [M]edium / [L]arge.

| # | Change | Effort | Spike(s) | Anchor in code |
|---|--------|--------|----------|----------------|
| 1 | Spaced + interleaved Retrieval Queue as the default daily surface, anchored to an interview date | L | 1,2,3 | `src/progress/recommend.ts`; deferred SR hook |
| 2 | Retire completion = mastery; require delayed clean retrieval before "mastered"/medallion | M | 1,4 | `src/lesson/mastery.ts` (`computeMastered`) |
| 3 | "Which-method?" gate + hidden deep-structure schema tags; label-stripped problems | M | 2 | `prediction`/`patternPick` beats; content tags |
| 4 | Difficulty governor holding ~50-85% success (faded density, `hintCapOverride`, `assist`) | L | 3 | `src/lesson/beats/types.ts` |
| 5 | Generation-first / failure-first sequencing (cold attempt before primer/worked example) | M | 1,3 | beat ordering; hint ladder |
| 6 | Reframe hire signal to calibration delta; five dims as feed-forward fixes | S | 4 | `functions/src/interview.ts`, `InterviewReportView` |
| 7 | Capstone brutal-by-default; surface in-app-vs-interview accuracy gap; pressure graduation | M | 3 | `src/interview/*`, interview packs |
| 8 | Re-base streak on spaced return / reps-in-struggle-band; drop reset penalty | S-M | 1,3,4 | streaks module |
| 9 | Calibration capture (confidence + Brier) on graded beats; reward correctly-low confidence | M | 4 | `prediction` beat, progress schema |
| 10 | Method-indexed `recommend.ts` (resurface weakest method, not weakest lesson) | M | 2 | `src/progress/recommend.ts` |

If you do only three things: ship #1 (spaced interleaved retrieval queue), #2 (honest, delayed mastery), and #3 (which-method discrimination). Those three moves deliver spacing, interleaving, transfer, and honest mastery — the highest-leverage intersection of the four spikes.
