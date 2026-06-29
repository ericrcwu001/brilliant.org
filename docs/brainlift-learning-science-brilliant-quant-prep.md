# BrainLift: Learning Science for Quant Interview Prep

## Owners

- Eric Wu (eric.wu@alphaaiengineering.com)

---

## Purpose

This BrainLift defines the learning-science logic behind **Ergo**, which is a Brilliant.org clone for quant-interview prep.

- The central claim of this BrainLift is that quant-interview preparedness is durable, transferable retrieval under pressure, not just comprehension.
- Quant interviews test unlabeled method identification, reconstruction from memory, verbal reasoning, speed, calibration, and composure.
- Thus, Ergo optimizes for delayed recall, method selection, calibrated confidence, transfer to fresh surfaces, and pressure performance.

### In Scope

- Retrieval practice, spacing, interleaving, desirable difficulties, worked-example fading, transfer and analogical encoding, productive failure, feedback and metacognition, motivation, and performance psychology.
- For Ergo: lesson beats, review cards, scheduling, mastery signals, capstone interviews, motivation surfaces, and measurement.
- Spiky product principles that challenge lesson-first edtech (like Brilliant) and make the codebase accountable to durable interview performance.

### Out of Scope

- The quant content-base itself.
- General test-prep outside quant-interview conditions.

---

## Ergo Learning Model from SPOVs

- **Teach lightly --> test repeatedly.** Lessons seed schemas, but durable learning only comes from delayed retrieval after the user's initial encounter.
- **Interleave confusable methods.** The queue should make the learner choose a method before executing it; choosing what type of problem-solving method a question requires builds the learning.
- **Make mastery delayed.** Completion only gives silver. Gold requires delayed, server-graded retrieval or transfer.
- **Reward calibration** The website should surface rubric dimensions, correctness anchors, and next fixes, not ego-level verdicts.

---

## DOK 4 - Spiky Points of View

### SPOV 1 - Stop Teaching, Start Testing

- Ergo is a spaced-retrieval testing engine with lessons as on-ramps, not a lesson app with quizzes attached.
- Lesson completion is an encoding event. Retrieval is the learning event.
- Roediger & Karpicke show the core reversal: restudy can look better immediately, while testing wins at delay.
- Bjork's storage-vs-retrieval-strength framework explains the trap: smooth performance can leave weak durable access.
- Soderstrom & Bjork sharpen the measurement rule: in-session performance is not a reliable index of learning.
- Koriat, Kornell, and Bjork explain the fluency illusion: a smooth re-read feels like competence while failing to train generation.
- The quant-interview condition is transfer-appropriate cold recall: novel prompt, no solution to re-read, working memory under load, and a think-aloud derivation.

Ergo mechanisms:

- A review card exists at the graded-beat level: `users/{uid}/reviews/{lessonId}__{beatId}`.
- The card stores `dueAt`, `intervalDays`, `easeFactor`, `reps`, `lapses`, `lastResult`, `lastConfidence`, `schemaId`, `track`, and `isTransfer`.
- `submitReview({ cardId, answer, confidence? })` is server-graded. The client submits the raw answer, never authoritative pass/fail.
- The Daily Review surface should be the return loop: mixed, delayed, interleaved retrieval before more lesson consumption.
- `targetInterviewDate` should compress reviews before the deadline without letting the queue drift past the target date.
- Cold retrieval item types include `masteryChallenge`, `answerEntry`, `retrievalGrid`, and transfer cards; generation should precede worked-solution reveal.
- Mastery is not read from the teaching session. Completion gives a candidate state; delayed clean retrieval or transfer earns gold.

Supporting research:

- Roediger & Karpicke (2006): one round of testing beats repeated restudy at a 1-week delay, with the opposite pattern on an immediate test. Strong.
- Karpicke & Blunt (2011, *Science*): retrieval practice beats elaborative concept mapping on delayed inference questions; students predict the opposite. Strong.
- Cepeda et al. (2006): distributed practice beats massed practice across 250+ studies. Strong.
- Slamecka & Graf (1978): self-generated answers are retained better than read answers. Moderate-strong.
- Kapur (2008): pre-instruction attempts improve later transfer. Moderate.

Boundary conditions:

- Novices cannot retrieve schemas they have never encoded. Worked examples and primers stay, especially for first contact.
- Retrieval must vary surface forms. Repeating the same item builds item memory, not transfer.
- The queue should be difficult but not demoralizing; a relentless failure stream harms competence, autonomy, and pressure tolerance.

### SPOV 2 - Topics Are Hints; Method Selection Is the Interview

- A topic title is a Level-0 hint, and a chapter path can pre-solve the interview's most important decision.
- Quant interviews rarely grade "execute gambler's ruin" in a labeled setting. They grade whether the candidate recognizes that a surface story is first-step analysis, linearity, symmetry, conditioning, Markov states, threshold rules, or another deep method.
- Blocked practice makes execution feel fluent inside a known category. Interleaving trains discrimination between categories.
- Chi, Feltovich, and Glaser show the expert/novice split: experts sort by deep structure; novices sort by surface story.
- Gick, Holyoak, and Gentner show the transfer rule: one example rarely transfers; compared analogs create schema abstraction.

Ergo mechanisms:

- Every graded beat carries or is required to carry `schemaId`, a hidden method tag.
- `src/content/methods.ts` is the registry for stable method ids such as first-step analysis, symmetry, conditioning, linearity/indicators, Markov states, complementary counting, prior update, dominance/Nash, backward induction, mixed strategy, threshold rules, binary encoding, information bounds, and related concept-specific methods.
- `CONFUSABLE` is curated and symmetric. Foils are genuine method near-misses, not random same-domain shuffles.
- `WhichMethodGate` is a graded `prediction` beat. The learner first commits to a method; method selection is the graded act.
- `src/lesson/queue.ts` interleaves due cards by `schemaId` and can pull confusable-method cards forward as foils.
- Lesson-factory output must include `schemaId`; if no existing id fits, the author proposes a registry addition.
- Label-stripped practice should hide topic and chapter labels at the solving surface.

Supporting research:

- Rohrer & Taylor (2007); Rohrer, Dedrick & Stershic (2015): interleaved math practice roughly doubles delayed-test accuracy versus blocked practice, despite worse practice-phase performance. Strong.
- Rohrer (2012): the interleaving benefit is procedure selection / discrimination. Strong.
- Kornell & Bjork (2008): learners often judge blocking superior even when interleaving wins at delay. Strong.
- Chi, Feltovich & Glaser (1981): experts categorize by deep principle; novices categorize by surface features. Foundational.
- Gick & Holyoak (1983); Gentner: spontaneous transfer is weak from a single example and improves sharply when analogs are compared. Strong.

Boundary conditions:

- Interleaving helps when categories are confusable and minimally encoded. Rank novices still need a brief blocked seed for each schema.
- Foils should be deliberate. Random shuffling is weaker than pairing genuine confusions.
- The catalog can remain as scaffolding and reference, but the mastery path must be method-indexed.

### SPOV 3 - Comfort Is a False Signal

- Quant prep should live in a controlled struggle band, roughly 50-85% retrieval success.
- Desirable difficulties depress current performance while improving retention and transfer.
- Productive failure works when struggle precedes consolidation, not when learners are abandoned.
- Pressure performance requires representative practice conditions: cold prompt, time pressure, think-aloud reasoning, and limited working memory.
- Easy streaks, quick-rescue hints, and high hit rates can manufacture the fluency illusion.

Ergo mechanisms:

- `isRetrievalRep` defines the measured unit: review-surfaced problems, mastery challenges, and which-method gates. Teaching beats, primers, sims, and recaps do not count.
- `governor.ts` uses a rolling retrieval-rep window. It acts below ~50% and above ~85%, with the middle band left alone.
- The governor changes scaffolding only: faded support and hint caps. It does not change spacing, queue volume, or the existence of the reveal path.
- The hint ladder keeps help available and records need-review signals consistently.
- The capstone should surface the practice-vs-performance gap through interview accuracy, correctness anchoring, and rubric trends.
- Speed primitives such as mental math, powers of two, and common identities are the exception: they should be overlearned to automaticity.

Supporting research:

- Bjork: desirable difficulties and storage-vs-retrieval strength. Robust framework.
- Soderstrom & Bjork (2015): acquisition performance is an unreliable, sometimes negative, index of durable learning. Strong.
- Kapur (2008); Schwartz & Martin (2004): productive failure improves later transfer when followed by consolidation. Moderate-strong.
- Kornell, Hays & Bjork (2009); Slamecka & Graf (1978): errorful generation can help later recall. Solid.
- Beilock & Carr (2005); Morris, Bransford & Franks (1977); Meichenbaum: pressure consumes working memory, and representative stress improves transfer. Strong.

Boundary conditions:

- Unguided floundering harms novices. Difficulty must pair with contrasting cases, consolidation, and reachable hints.
- Math anxiety taxes working memory and can erode competence. Arousal reappraisal and expressive-writing routines are useful pressure supports.
- The target band is not 0-20% success. The goal is desirable difficulty, not helplessness.

### SPOV 4 - Rewards Must Point at Durable Mastery

- Gamification is not inherently good; rewards must train the behavior they pay out for.
- Streaks, medallions, and verdicts become harmful when they reward immediate fluency, hint avoidance, or ego-level approval.
- Useful rewards point at delayed retrieval, transfer, productive recovery after hints, calibration accuracy, and feed-forward improvement.
- Calibration is especially important in quant prep because it is both the learning antidote to fluency and the trading skill behind bet sizing.

Ergo mechanisms:

- Hints during learning do not block gold. `computeMastered` is a gold-candidate signal, not final mastery.
- Silver is immediate. Gold is delayed and server-graded.
- Track B / interview-intensity gold can require a held-out transfer card (`isTransfer`), so "mastered" means fresh-surface success.
- Confidence capture feeds calibration scoring; correctly low confidence on hard items is a skill, not a defect.
- The capstone report should emphasize dimensions, correctness anchors, calibration delta, next-fix cards, and rubric trends.
- Person-level hire verdicts should be demoted or removed because they are weak feedback and invite overconfidence.

Supporting research:

- Kluger & DeNisi (1996): roughly one-third of feedback interventions lower performance, especially when feedback targets the self. Strong.
- Hattie & Timperley (2007): feed-forward and task/process feedback beat self-level verdicts. Strong.
- Soderstrom & Bjork (2015): performance and learning dissociate; reward the dip, not the smoothness. Strong.
- Deci (1971); Deci, Koestner & Ryan (1999): expected, performance-contingent extrinsic rewards can crowd out intrinsic motivation. Strong.
- Dunning-Kruger (1999); Bjork: low skill and fluency both inflate confidence. Moderate-strong.

Boundary conditions:

- Adherence matters. Silver and lightweight progress signals keep early progress visible.
- Rewards should be informational and competence-supportive, not controlling.
- Calibration training should not breed timidity; learners should be calibrated and decisive.

---

## Experts

- **Henry L. Roediger III & Jeffrey Karpicke** - memory researchers focused on testing and retrieval practice. They ground SPOV 1: retrieval is the learning event. [Link](https://scholar.google.com/scholar?q=Roediger+Karpicke+test-enhanced+learning)
- **Robert A. Bjork & Elizabeth Ligon Bjork** - UCLA Learning & Forgetting Lab; desirable difficulties, storage-vs-retrieval strength, and learning-vs-performance. They are the conceptual spine of SPOVs 1, 3, and 4. [Link](https://bjorklab.psych.ucla.edu/)
- **Nicholas Soderstrom** - learning scientist focused on the learning-vs-performance distinction. His work is the methodological hinge for judging prep at delay. [Link](https://scholar.google.com/scholar?q=Soderstrom+Bjork+2015+learning+versus+performance)
- **Doug Rohrer & Kelli Taylor** - interleaving and discrimination researchers in math learning. They ground SPOV 2. [Link](https://scholar.google.com/scholar?q=Rohrer+Taylor+interleaving+mathematics)
- **Michelene Chi** - cognitive scientist focused on expert/novice categorization and self-explanation. She grounds deep-structure recognition and method sorting. [Link](https://scholar.google.com/scholar?q=Chi+Feltovich+Glaser+1981+categorization+physics)
- **Dedre Gentner / Keith Holyoak** - analogy and transfer researchers. They ground the "same method, different costume" transfer engine. [Link](https://scholar.google.com/scholar?q=Gick+Holyoak+1983+analogical+problem+solving)
- **John Sweller & Slava Kalyuga** - cognitive load and expertise-reversal researchers. They define the boundary between productive difficulty and overload. [Link](https://scholar.google.com/scholar?q=Sweller+cognitive+load+worked+examples)
- **Manu Kapur** - productive-failure researcher. He grounds failure-first sequencing followed by consolidation. [Link](https://scholar.google.com/scholar?q=Kapur+2008+productive+failure)
- **Avraham Kluger & Angelo DeNisi / John Hattie** - feedback researchers. They ground the case against ego-level hire signals and for feed-forward. [Link](https://scholar.google.com/scholar?q=Kluger+DeNisi+1996+feedback+intervention)
- **Sian Beilock & Mark Ashcraft** - pressure, choking, and math-anxiety researchers. They ground the pressure-training case. [Link](https://scholar.google.com/scholar?q=Beilock+Carr+choking+under+pressure)
- **Edward Deci & Richard Ryan** - Self-Determination Theory researchers. They ground the motivation critique of controlling rewards. [Link](https://selfdeterminationtheory.org/)

---

## DOK 3 - Insights

**Retrieval and the data model**

- I1. The quant interview is a delayed, cold, interleaved retrieval test under load; the highest-transfer trainer must be isomorphic to that test.
- I2. "Completion = mastery" is the fluency illusion encoded into product state; teaching-session performance cannot certify durable learning.
- I9. Ergo's durable struggle signal is the live high-water mark of hints and review outcomes; adding a time axis turns that signal into a scheduler and measurement layer.

**Structure and transfer**

- I3. A chapter title is a permanent Level-0 hint, because it gives away the method before the learner has to choose.
- I4. The highest-leverage transfer beat is not simply a harder solver; it is a `retrievalGrid` or which-method comparison over "same method, different costume" problems.
- I10. Execution fluency inside a known method can be anti-correlated with interview readiness, because the interview grades method selection under uncertainty.

**Difficulty, motivation, and calibration**

- I5. Smooth KPIs such as streak length and hint-free first-try rate can be negatively diagnostic of readiness.
- I6. Productive failure and stress inoculation operate at two layers: struggle before instruction for concepts, pressure before the real interview for performance.
- I7. Calibration is both pedagogy and job skill: it fixes the fluency illusion and trains trader-style bet sizing.
- I8. The streak's stickiness and motivational quality can move in opposite directions; loss-aversion engagement can reduce autonomy.
- I11. Pressure and novel problems compete for working memory, so a brutal mock outcome should outweigh many smooth in-app wins.

---

## DOK 2 - Knowledge Tree

### 1. Retrieval & Testing

- **Roediger & Karpicke (2006), *Test-Enhanced Learning*.** Testing once produced higher retention than restudying at a 1-week delay; restudy won on an immediate test; learners predicted restudy would win. Retrieval is learning, not just measurement. [Link](https://scholar.google.com/scholar?q=Roediger+Karpicke+2006+test-enhanced+learning)
- **Karpicke & Blunt (2011), *Science*.** Retrieval practice beat elaborative concept mapping on delayed inference questions. Retrieval supports transfer, not just verbatim recall. [Link](https://scholar.google.com/scholar?q=Karpicke+Blunt+2011+retrieval+practice+concept+mapping)

### 2. Spacing & Scheduling

- **Cepeda, Pashler, Vul, Wixted & Rohrer (2006).** More than 250 studies show distributed practice beats massed practice; optimal gap scales with the retention interval. Ergo should spread review over expanding intervals anchored to the target interview date. [Link](https://scholar.google.com/scholar?q=Cepeda+2006+distributed+practice+meta-analysis)

### 3. Interleaving & Discrimination

- **Rohrer & Taylor (2007); Rohrer, Dedrick & Stershic (2015).** Interleaved math practice roughly doubled delayed-test accuracy versus blocked practice, even though practice-phase accuracy looked worse. Interleaving trains method selection. [Link](https://scholar.google.com/scholar?q=Rohrer+Taylor+2007+interleaved+practice)
- **Kornell & Bjork (2008).** Interleaving improved inductive category learning while learners judged blocking superior. The smooth feeling of blocking is a metacognitive illusion. [Link](https://scholar.google.com/scholar?q=Kornell+Bjork+2008+learning+concepts+interleaving)

### 4. Desirable Difficulties & Learning-vs-Performance

- **Bjork & Bjork.** Spacing, interleaving, reduced cues, and retrieval can depress current performance while raising long-term retention and transfer. Reward the dip, not the smoothness. [Link](https://scholar.google.com/scholar?q=Bjork+desirable+difficulties)
- **Soderstrom & Bjork (2015), *Learning versus Performance*.** Acquisition performance is an unreliable, sometimes negative, index of durable learning. Judge prep by delayed transfer. [Link](https://scholar.google.com/scholar?q=Soderstrom+Bjork+2015+learning+versus+performance)

### 5. Worked Examples, Cognitive Load & Expertise Reversal

- **Sweller; Renkl & Atkinson; Kalyuga; Cowan.** Novices learn more from worked examples than unguided solving; the benefit fades or reverses as expertise grows; working memory is tightly limited. Scaffold by default, then fade fast. [Link](https://scholar.google.com/scholar?q=Kalyuga+expertise+reversal+effect)

### 6. Transfer, Schemas & Analogical Encoding

- **Chi, Feltovich & Glaser (1981).** Experts categorize problems by deep principle; novices categorize by surface features. Train sorting by method, not story. [Link](https://scholar.google.com/scholar?q=Chi+Feltovich+Glaser+1981+categorization)
- **Gick & Holyoak (1983); Gentner.** Spontaneous transfer from one example is near floor; comparing analogs raises transfer sharply. Teach "what is the same?" across surfaces. [Link](https://scholar.google.com/scholar?q=Gick+Holyoak+1983+schema+induction)
- **Barnett & Ceci (2002).** Far transfer is rare and must be engineered. Mastery must be checked on fresh surfaces. [Link](https://scholar.google.com/scholar?q=Barnett+Ceci+2002+taxonomy+far+transfer)

### 7. Productive Failure

- **Kapur (2008); Schwartz & Martin (2004).** Attempting and failing before instruction improves later transfer versus instruction-first, when followed by consolidation. Front-load struggle, then teach. [Link](https://scholar.google.com/scholar?q=Kapur+2008+productive+failure)

### 8. Feedback, Metacognition & Calibration

- **Kluger & DeNisi (1996); Hattie & Timperley (2007).** About a third of feedback interventions lowered performance, especially self-level feedback; effective feedback is task/process/feed-forward. A person-level hire signal is the weakest feedback type. [Link](https://scholar.google.com/scholar?q=Kluger+DeNisi+1996+feedback+intervention+theory)
- **Dunning-Kruger (1999); Bjork illusions of competence.** The least skilled are often most overconfident; fluency inflates confidence. Calibration must be measured, not assumed. [Link](https://scholar.google.com/scholar?q=Kruger+Dunning+1999+unskilled+unaware)

### 9. Motivation: Self-Determination Theory & Rewards

- **Deci (1971); Deci, Koestner & Ryan (1999); SDT.** Expected, performance-contingent extrinsic rewards can undermine intrinsic motivation; autonomy, competence, and relatedness sustain effort. Streaks and badges must reward learning, not loss-aversion compliance. [Link](https://scholar.google.com/scholar?q=Deci+Koestner+Ryan+1999+undermining+intrinsic+motivation)

### 10. Performance Under Pressure

- **Beilock & Carr (2005); Ashcraft & Kirk (2001); Morris, Bransford & Franks (1977); Ramirez & Beilock (2011); Jamieson.** Pressure and anxiety consume working memory; performance improves when practice matches test conditions; expressive writing and arousal reappraisal can improve high-stakes performance. Train under representative pressure after encoding. [Link](https://scholar.google.com/scholar?q=Ramirez+Beilock+2011+writing+about+testing+worries)

---

## Product Discipline

- **Spaced retrieval as the daily loop:** make the default return path a mixed Retrieval Queue across concepts, anchored to `targetInterviewDate`. It should use a real time axis (`dueAt`, interval, ease, lapses) and draw from `masteryChallenge`, `answerEntry`, `retrievalGrid`, held-out transfer cards, and other graded cold-recall beats.
- **Delayed mastery instead of completion mastery:** completion can create silver and review cards, but gold requires a delayed clean retrieval or a transfer pass. `src/lesson/mastery.ts` should stay a gold-candidate signal, while `functions/src/review.ts` and `functions/src/goldMint.ts` own authoritative gold.
- **Generation-first beats:** worked solutions and rich hints should sit behind a real attempt. Use cold `answerEntry`, `masteryChallenge`, `prediction` gates, faded `equationTiles`, and split-density derivation paths so learners reconstruct rather than read.
- **Cold-open pretesting:** each lesson benefits from an initial low-stakes retrieval attempt before instruction, because pretesting can potentiate later learning.
- **Label-stripped mixed practice:** topic and chapter labels should be hidden at the solving surface. The catalog can remain reference scaffolding, but practice should ask "which method?" before "compute."
- **Which-method gate:** method selection should be a graded act built on `prediction` with `byOption` refutation and `gate.correct`, using choices such as first-step analysis, linearity/indicators, symmetry, conditioning, states/Markov, complementary counting, prior update, backward induction, dominance/Nash, mixed strategy, and threshold rules.
- **Method-indexed recommendation:** weakness should be indexed by `schemaId`, not only by lesson. Resurface the weakest method with fresh, interleaved, spaced problems and deliberate confusable foils.
- **Deep-structure tagging:** every graded problem needs a hidden `schemaId`; if the registry lacks the right id, lesson authors add a controlled-vocabulary extension.
- **Difficulty governor:** keep retrieval success in a controlled struggle band. Tighten scaffolds when rolling success is too high, loosen hints/fades when it is too low, and never remove the reveal path.
- **Failure-first sequencing:** use cold `prediction` or `answerEntry` before primer/worked example, then consolidate. This is productive failure, not unguided floundering.
- **Pressure graduation:** capstones should be representative and difficult enough to reveal the practice-vs-performance gap, with tiered packs, correctness anchors, and rubric trends.
- **Streak and motivation discipline:** avoid rewarding lesson completion alone. Retrieval reps, spaced returns, and struggle-band effort are more learning-aligned than smooth daily completion, while adherence signals should remain competence-supportive.
- **Calibration capture:** confidence should be captured on checkpoint/review/interview moments and scored with Brier-style calibration, overconfidence, and correctly-low confidence on hard items.
- **Feed-forward capstone report:** demote person-level hire verdicts. Keep the five dimensions, correctness anchors, calibration delta, and "next fix" cards.
- **Transfer-gated medallions:** concept gold should mean delayed success on a same-method problem, preferably a fresh held-out transfer surface for interview-intensity learners.

- Protect **problem-level spaced retrieval**. The review card is the durable-learning unit.
- Protect **hidden method discrimination**. `schemaId`, `CONFUSABLE`, and which-method gates are the transfer engine.
- Protect **delayed honest mastery**. Silver can be immediate; gold must mean delayed retrieval or transfer.
- Keep the Daily Review loop prominent, interleaved, label-stripped, and anchored to target interview dates.
- Keep hints as learning scaffolds, not shame markers; use delayed success to certify mastery.
- Keep the difficulty governor bounded and scaffold-only; do not let it change spacing volume or remove the reveal path.
- Keep calibration visible: confidence, Brier-style scoring, overconfidence, and correctly-low confidence are part of quant skill.
- Keep capstone feedback feed-forward: rubric dimensions, deterministic scalar correctness where safe, calibration deltas, and trends.
- Tune SM-2 constants, difficulty thresholds, and k-of-n gold gates with retention data rather than intuition.
