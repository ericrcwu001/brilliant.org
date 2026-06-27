# spec-20 — Daily Review queue (home hero + interleaved label-stripped surface)

**Status:** Planned
**Phase:** Phase 2 (Surfaces)
**Depends-on:** [`spec-10-sr-engine-and-recommender.md`](spec-10-sr-engine-and-recommender.md) (the due-card selection + interleave in `src/lesson/queue.ts` — `loadDueQueue`/`buildQueue`/`dueCards` — and the `submitReview` write path in `functions/src/review.ts`), [`spec-13-which-method-gate.md`](spec-13-which-method-gate.md) (the `prediction`-based `<WhichMethodGate>` component that fronts each card), [`spec-02-confidence-capture.md`](spec-02-confidence-capture.md) (the `ConfidenceRating` UI mounted on the spaced-review problem for the quant-intensity gate — D6's third capture site)
**Implements:** brainlift app-action **#1** ("make a label-stripped Mixed Floor the home surface") — the *v1 slice* of it; locked decision **D8** (Daily Review queue as a hero on the existing home, catalog stays home; Mixed-Floor-as-home deferred).

> Read [`README.md`](README.md) §1 (corrected premise **#8** — home is `ConceptCatalog`, there is no Mixed Floor),
> §3 (D8, D2 the quant-intensity gate, D6 confidence capture), §4 Foundation A (the `reviews/{cardId}` shape — the
> queue's input — incl. `lastConfidence`), §4 the **`isQuantIntensity` helper** (`src/auth/track.ts` — the *only*
> way to compute the gate), §4.5 (`submitReview({cardId,result,confidence?})`), §5 collision matrix (the exact
> `src/lesson/queue.ts` names/arity and the `<WhichMethodGate>` component), §8 (R1, R4, R5, R7, R12) first. This
> spec is **surface only**: it renders what `spec-10`'s `queue.ts` selects and fronts each card with `spec-13`'s
> gate. It defines **no** scheduling maths, **no** new Firestore writes beyond calling `spec-10`'s `submitReview`,
> and **no** new persisted fields (it *passes* `confidence` through to `lastConfidence`, owned by spec-01).

---

## 1. Goal & non-goals

**Goal.** Make the spaced-review queue the recommended daily action without dethroning the catalog. Two
deliverables: (a) a **`Daily Review · N due` hero** at the top of the existing catalog home that launches the
queue (or shows an empty state when nothing is due, and a **ramp note** as the target interview date nears); and
(b) a **`DailyReviewPage`** at a new `/review` route that presents due cards one at a time, **interleaved**
(spec-10's ordering), with **surface labels (concept / lesson / method) hidden**, each card fronted by spec-13's
**which-method gate**, then the problem itself, then `submitReview` on grade. Quant-intensity-gated learners get
the harder framing; everyone gets the queue.

**Non-goals.**
- The SM-2 maths, due-selection, interleave ordering, and `submitReview` callable — all owned by **spec-10**
  (`src/lesson/queue.ts`, `functions/src/review.ts`). This spec **calls** them.
- The which-method gate component and its label-stripping mechanics — owned by **spec-13**. This spec **places**
  the gate at the front of each card.
- Authoring/grading the review problems themselves — they are the existing graded beats; this spec renders a
  single beat via the existing `LessonPlayer` beat-rendering path (see §4), it does not re-implement grading.
- The honest-mastery gold mint that a passing review can trigger — owned by **spec-11** (server-side, fired by
  `submitReview`). This surface is agnostic to it.
- **Mixed-Floor-as-home** (the full label-stripped home replacing the catalog for Track B) — explicitly
  **deferred**; documented in §11 as Phase-Next, **not built now** (D8).
- Scheduled push / cron reminders — out of scope in v1 (D14).

---

## 2. Current reality (verified)

- **Home is the `ConceptCatalog`, not a Mixed Floor.** `App.tsx:144-148` routes signed-in+onboarded `/` to
  `<ConceptCatalogPage>`. There is no queue, no `/review` route, no label-stripping anywhere. (Confirms README §1 #8.)
- **The catalog renders a single hero atop domain shelves.** `ConceptCatalog.tsx:481-507` — `<main>` contains the
  optional `ResumeHero` (`:483-492`) then the domain shelves (`:495-506`). The Daily Review hero is a **new sibling
  rendered above `ResumeHero`** inside this `<main>`. The container `ConceptCatalogPage.tsx:106-114` builds the
  model and passes props; it already subscribes to `user`/`userDoc` (`:20`) and progress (`:42`).
- **Routes are a hand-rolled SPA router** (`routes.ts:1-3`) — no react-router. Adding a route = (1) a `ROUTES`
  entry + path helper + parser in `routes.ts`, (2) allow it in the `App.tsx` guard's `known` check
  (`App.tsx:114-120`), (3) a render branch in `GuardedRoutes` (`App.tsx:155-166`). Mirror the existing
  `parseConceptId`/`conceptPath` pattern (`routes.ts:52-61`).
- **Dev harness pattern exists.** `/dev/home` → `DevHomePage.tsx` renders the presentational component against
  fixtures with a scenario switcher and a `devNavigate` no-op (`DevHomePage.tsx:86-121`); `DevRoutes.tsx:38`
  dispatches it. `/dev/*` needs no Firebase/Java (AGENTS.md). We add a `/dev/review` the same way.
- **The presentational/container split is the house idiom.** `ConceptCatalog` (pure render) vs
  `ConceptCatalogPage` (Firebase container) — `ConceptCatalogPage.tsx:1-5` documents it. We follow it:
  `DailyReview` (pure) + `DailyReviewPage` (container).
- **Track resolution.** `userDoc.defaultTrack: 'A' | 'B'` (`src/auth/userDoc.ts:29,44`) and
  `userDoc.learningGoal` (`userDoc.ts:25`) exist. **The quant-intensity gate is computed by exactly one shared
  helper — `isQuantIntensity(userDoc, conceptProgress?)` in `src/auth/track.ts`** (README §4, NEW, created
  alongside the Foundation specs). **This spec must call that helper, never re-derive the predicate from
  `defaultTrack`/`learningGoal` directly** (gate Issue #9). No new field needed (D2/D13).
  `comfortToDefaultTrack` (`onboarding.model.ts:13`) already routes A/B at onboarding. (Note: `src/auth/track.ts`
  is the README's gate helper; the existing `src/progress/track.ts` is a *different* file — per-concept track
  load/save — do not conflate them.)
- **Analytics** is a fire-and-forget `track(name, params)` map (`src/analytics/events.ts:70`); `catalogViewed`,
  `conceptSelected`, `recommendationShown`, `interviewCtaClicked` already exist (`:88-110`). We add queue events
  in the same style (§7).
- **`targetInterviewDate`** is added to `userDoc` by **spec-01** (README §4: `targetInterviewDate?: string`
  YYYY-MM-DD, client-writable). The ramp note reads it. If spec-01 has not landed, the field is simply absent and
  the ramp note is omitted (graceful — never throw; R5).
- **`needsReview` is the legacy per-lesson signal** (`studyDesk.model.ts:58-59`, `functions/src/index.ts`,
  `hintLadder.ts:52`) — permanent + asymmetric (R7). It is **lesson-level**; the queue is **card/beat-level**
  (`reviews/{cardId}`). They are different axes. This spec branches UX off the **queue** (`dueAt`), and must not
  conflate the two (see §9 R7).

---

## 3. Inputs this spec consumes (from spec-10 / spec-13 / spec-02 — exact README names/arity, not redefined)

The exact names, arity, and shapes below are **owned by spec-10/spec-13/spec-02 and frozen in README §4/§4.5/§5**.
This spec consumes them verbatim — do **not** rename or change arity. Call sites are localized to `DailyReviewPage`
and `DailyReview`.

- **`src/lesson/queue.ts`** (spec-10 — README §5 collision matrix, exact names):
  - `loadDueQueue(uid, now): Promise<QueueItem[]>` — the Firestore read: queries the `reviews` subcollection
    `where('dueAt','<=',now).orderBy('dueAt')` (single-field index — README §4 / Issue #14), lazy-imported,
    dependency-free pure core, mirroring `recommend.ts`'s `loadMaxHintLevels` idiom (`recommend.ts:19`). This is the
    surface's **one read entry point** — the hero's `N` and the page's items both come from it. `QueueItem` carries
    at least `{ cardId, lessonId, beatId, conceptId, schemaId }` (all denormalized on the card per §4 Foundation A).
  - `buildQueue(cards, order, now, { maxItems, foils }): QueueItem[]` — **pure, 4-arg** (do **not** call a 2-arg
    `buildQueue` — gate Issue #4/#12). `cards` = the user's review cards; `order` = the **prerequisite-order map**
    (R5 — so a card whose prereqs/notation aren't taught yet is never surfaced); `now` = server-ish time for due
    filtering; the options bag carries `maxItems` (cap the daily set) and `foils` (D2 — when `true`, the
    quant-intensity interleave/foil treatment). `loadDueQueue` composes `buildQueue` internally; the surface may
    also call `buildQueue` directly on fixtures in `/dev/review`.
  - `dueCards(...)` — spec-10's predicate/selector helper over cards; the surface uses it only if it needs to
    re-derive the due set from already-loaded cards (e.g. the hero count without re-reading). The hero's `N` is
    `items.length` from `loadDueQueue`.
- **The prerequisite-order map (R5 — this spec must build and pass it).** `buildQueue`'s `order` argument is the
  prereq ordering; the surface obtains it from spec-10's exported helper (the recommender's prereq/notation graph in
  `recommend.ts`) and passes it through. **The surface never fabricates or reorders items beyond what `buildQueue`
  returns** (§9 R5) — it just supplies the inputs `buildQueue` requires so the engine can honor prerequisites.
- **`foils` (D2 — this spec must pass it).** Compute `foils: isQuantIntensity(userDoc, conceptProgress?)` (the §4
  helper) and pass it in the options bag. Track A → `false` (gentle interleave); quant-intensity gate → `true`.
- **`functions/src/review.ts`** → client wrapper. The callable signature is **frozen in README §4.5**:
  `submitReview({ cardId: string; result: 'pass'|'fail'; confidence?: number })`. Called once per card on grade.
  `confidence` is the D6 third-capture value (lands in `card.lastConfidence`). **Server owns the timestamp** (R12) —
  never pass a client `now` into scheduling. There is **no** `{lessonId,beatId}` variant.
- **`src/lesson/WhichMethodGate.tsx`** (spec-13 — README §5, exact component):
  `<WhichMethodGate beat={predictionBeat} schemaId={item.schemaId} onResolved={({ correct, picked }) => …} />` —
  renders the `prediction`-based picker **with method labels stripped** and reports the learner's pick before the
  problem shows. `onResolved` receives spec-13's authoritative payload object `{ correct: boolean; picked: string }`
  (record `correct` for the rep/analytics path — it is NOT the bare pick string).
  spec-13 owns label-stripping; this spec only mounts it ahead of the problem (gate Issue #11).
- **`src/lesson/ConfidenceRating.tsx`** (spec-02 — README §4 Foundation C): the checkpoint confidence-rating UI.
  This spec **mounts it on the spaced-review problem for the quant-intensity gate** (D6 third capture site) and
  threads the captured value into `submitReview`'s `confidence`. Track A → not shown (D6 light/off).

> **R5 gate:** if `queue.ts`, `WhichMethodGate`, or `ConfidenceRating` is absent, **stop and build the dependency**
> — do not stub a fake queue, gate, or rating. The whole surface is dead without them.

---

## 4. Design

### 4.1 Route + navigation

- New route `ROUTES.review = '/review'` in `routes.ts`, with `reviewPath()` returning `'/review'` (no params — the
  queue is cross-concept). Add it to the `App.tsx` guard `known` set and a `GuardedRoutes` branch →
  `<DailyReviewPage navigate={navigate} />`.
- The hero's CTA calls `navigate(ROUTES.review)`.

### 4.2 The hero (on the existing catalog home)

A new presentational `DailyReviewHero` rendered as the **first child of `<main>`** in `ConceptCatalog.tsx`, above
`ResumeHero`. Pure: receives a small view-model and an `onStart` callback. Three states:

1. **Due (`dueCount > 0`)** — eyebrow `Daily Review`, headline `N due`, sub copy (track-aware, §6), CTA
   `Review now →` → `onStart()`.
2. **Empty (`dueCount === 0`)** — calm empty state: `Nothing due today` + a one-liner (`You're caught up — new
   reviews unlock as you learn.`). No CTA, or a muted `Browse concepts` that just scrolls to shelves. Never a
   guilt-trip (Track A) / a terse `Caught up. Come back when cards are due.` (quant gate, §6).
3. **Ramp (`dueCount > 0` AND target date near)** — same as Due plus a **ramp line** computed from
   `userDoc.targetInterviewDate` (§4.4). Hidden entirely when the date is absent or far.

The hero is **only rendered when review data has loaded** and the user has at least one review card ever (i.e.
don't show "Nothing due" to a brand-new user who has completed no lessons — show nothing, deferring to the resume
hero). View-model field `hasAnyCards: boolean` drives this.

### 4.3 The queue surface (`DailyReviewPage` + `DailyReview`)

- **Container `DailyReviewPage`** (`src/pages/DailyReviewPage.tsx`): loads due cards via `loadDueQueue(uid, now)`
  (which composes spec-10's 4-arg `buildQueue(cards, order, now, {maxItems, foils})` internally; `foils =
  isQuantIntensity(userDoc)`), loads the needed lesson/beat content (reuse the existing course/lesson loaders the
  lesson player uses — see §5 step 6), resolves the gate via `isQuantIntensity` (§4 helper), and renders
  `<DailyReview>`. Handles loading skeleton + load error + the empty redirect (if zero due, render the empty state
  inline; do **not** hard-redirect — a user may deep-link).
- **Presentational `DailyReview`** (`src/pages/DailyReview.tsx`): a stepper over `QueueItem[]`. For the **current**
  item:
  1. Render `<WhichMethodGate beat={…} schemaId={current.schemaId} onResolved={…} />` (spec-13) — labels stripped
     — and wait for `onResolved`.
  2. Then render the **problem beat** with **all surface labels hidden** (no concept title, no lesson title, no
     method name, no progress ring). Reuse the existing single-beat rendering used by `LessonPlayer` (§5 step 6) so
     grading/hints/assist behave identically to in-lesson. **For the quant-intensity gate, mount
     `<ConfidenceRating>` (spec-02) on this problem** (D6 third capture site) and hold its value in local state;
     Track A omits it entirely.
  3. On grade, capture `result: 'pass' | 'fail'` and (for the quant gate) the `confidence` from `ConfidenceRating`,
     call `submitReview({ cardId: current.cardId, result, confidence })` (the §4.5 shape; `confidence` is omitted
     for Track A → lands as `null` in `card.lastConfidence`), then advance to the next item.
  - A minimal top chrome: `Daily Review` wordmark + an **un-numbered** progress dots/`k of N` indicator (showing
    position is fine; showing *which concept* is not). A `Done` summary when the queue empties (count reviewed,
    pass rate — informational, never a verdict).
- **Label-stripping is the core invariant** (D8/#1): the queue must not leak the concept, lesson, or method of the
  current card anywhere in the DOM (including `aria-label`s and the document title). A test asserts this (§8).

### 4.4 Ramp display (interview-date anchoring, surface side)

spec-10's scheduling already **caps `dueAt`** to the target date and forces a final review into the last 3 days
(README §4 Foundation A / D4) — that is the *data* side. This spec only **displays** the consequence:

- Pure helper `rampNote(targetInterviewDate, now, dueCount): string | null` in the hero's model file
  (`src/pages/dailyReview.model.ts`). Returns `null` when no date, or when days-until > a threshold (e.g. 14).
  Otherwise a short escalating line keyed off `daysUntil`:
  - `8–14 days`: `Interview in {d} days — daily review keeps it warm.`
  - `4–7 days`: `Interview in {d} days — reviews are ramping up.`
  - `≤3 days (final-review window)`: `Final stretch — {d} day(s) to go. Clear today's queue.`
  - `0 / past`: `Interview day. One last pass.` (or omit if past — keep it forgiving for Track A).
- Pure, date-only (parse `YYYY-MM-DD` against `now`'s local date), unit-tested. No timezone cleverness beyond
  comparing calendar days; matches how streaks treat local days.

---

## 5. Step-by-step implementation

> Surgical (AGENTS.md): match the catalog's existing CSS-class style (`ergo-*` tokens, `ergo-card`), reuse the
> presentational/container split, add the minimum. All `/dev/*` checks need no Firebase (AGENTS.md).

1. **Add the route.** In `src/pages/routes.ts`: add `review: '/review'` to `ROUTES`; add
   `export function reviewPath(): string { return ROUTES.review }`. Add `devReview: '/dev/review'` to `ROUTES`.
   → **verify:** `./node_modules/.bin/eslint src/pages/routes.ts` clean; `grep -n "review" src/pages/routes.ts`
   shows both.

2. **Wire the guard + branch.** In `src/App.tsx`: add `|| path === ROUTES.review` to the `known` disjunction
   (`:114-120`); add a branch in `GuardedRoutes` after the profile branch:
   `if (path === ROUTES.review) return <DailyReviewPage navigate={navigate} />` (lazy-import `DailyReviewPage`
   alongside the other page imports).
   → **verify:** type-check passes (`./node_modules/.bin/tsc --noEmit` or the project's check); navigating to
   `/review` while signed in does not redirect to `/`.

3. **Create the hero model** `src/pages/dailyReview.model.ts` (pure, dependency-free, node-testable):
   ```ts
   export interface DailyReviewHeroModel {
     hasAnyCards: boolean
     dueCount: number
     rampNote: string | null
   }
   export function rampNote(
     targetInterviewDate: string | undefined,
     now: Date,
     dueCount: number,
   ): string | null { /* §4.4; return null when no date / far / dueCount===0 */ }
   export function buildHeroModel(
     dueCount: number,
     hasAnyCards: boolean,
     targetInterviewDate: string | undefined,
     now: Date,
   ): DailyReviewHeroModel { /* compose */ }
   ```
   → **verify:** `./node_modules/.bin/vitest run src/pages/dailyReview.model.test.ts` (written in step 9) green.

4. **Create the presentational hero** `DailyReviewHero` (co-locate in `ConceptCatalog.tsx` next to `ResumeHero`,
   or a sibling file `src/pages/DailyReviewHero.tsx` if it keeps `ConceptCatalog.tsx` tidy — match the file's
   current size; `ConceptCatalog.tsx` already holds `ResumeHero` inline, so inline is consistent). Props:
   `{ model: DailyReviewHeroModel; quantGate: boolean; onStart: () => void }`. Render the three states of §4.2.
   Use `ergo-card` + an `ergo-review-hero` class; reuse the `ergo-resume-hero__*` structural classes' spirit
   (eyebrow/title/footer/cta) so it visually rhymes with the resume hero.
   → **verify:** `/dev/review` (step 8) renders all three states via its scenario switcher.

5. **Render the hero in the catalog.** In `ConceptCatalogPage.tsx` (the container), call `loadDueQueue(user.uid,
   new Date())` to get the due items, derive `dueCount = items.length` and `hasAnyCards` (true once the user has any
   review card ever — see §4.2; spec-10 exposes a cheap existence check or the container caches it), build the hero
   view-model via `buildHeroModel(...)`, compute `quantGate = isQuantIntensity(userDoc)`, and pass `reviewHero` +
   `onStartReview = () => navigate(ROUTES.review)` + `quantGate` down. In `ConceptCatalog.tsx`, add an optional prop
   `reviewHero?: DailyReviewHeroModel` and `onStartReview?: () => void` to `ConceptCatalogProps`, and render
   `{reviewHero?.hasAnyCards && <DailyReviewHero model={reviewHero} quantGate={quantGate} onStart={onStartReview!} />}`
   as the **first child of `<main>`** (before the `model.resume` hero, `:481-483`). Thread `quantGate` in as a prop
   too — **computed in the `ConceptCatalogPage` container via `isQuantIntensity(userDoc)`** (the §4 helper; the
   container already subscribes to `userDoc` at `:20`), never via a bare `defaultTrack` check. Keep it optional so
   existing `ConceptCatalog` tests/`/dev/home` are unaffected.
   → **verify:** `./node_modules/.bin/vitest run` for any existing `ConceptCatalog`/catalog tests stays green
   (prop is optional → no breakage).

6. **Create the queue container** `src/pages/DailyReviewPage.tsx` (mirror `ConceptCatalogPage.tsx`):
   - `const { user, userDoc } = useAuth()`.
   - Load due cards: `loadDueQueue(user.uid, new Date())` (spec-10 — the exact name; it composes the 4-arg
     `buildQueue(cards, order, now, {maxItems, foils})` internally, with `foils = isQuantIntensity(userDoc)` and the
     prereq `order` map) into state; loading + error states like the catalog (`ConceptCatalogPage.tsx:84-96`).
   - Load the lesson/beat content for the due cards. **Reuse the lesson loader the player already uses** — find it
     via the lesson route: `LessonPage`/`LessonPlayer` resolve a lesson by id (the same loader behind
     `parseLessonId`). Do **not** invent a new loader. Build a `lessonId → Lesson` map for the due set.
   - Compute the gate via the shared helper: `import { isQuantIntensity } from '../auth/track'` then
     `const quantGate = isQuantIntensity(userDoc)` (**do not** inline a `defaultTrack === 'B'` check — gate Issue
     #9). `const track = userDoc?.defaultTrack ?? 'A'` is fine for *gold-gate labeling only*; all *gating* uses
     `quantGate`.
   - Render `<DailyReview items={items} lessonsById={…} track={track} quantGate={quantGate} onSubmit={submit}
     navigate={navigate} />` where
     `submit = (cardId, result, confidence?) => submitReview({ cardId, result, confidence })` (the §4.5 frozen
     shape).
   → **verify:** `grep -n "isQuantIntensity" src/pages/DailyReviewPage.tsx` shows the helper import + call and no
   bare `defaultTrack === 'B'` gating; `/review` loads (emulator or live) without console errors; with zero due
   cards it shows the inline empty state, not a crash.

7. **Create the presentational queue** `src/pages/DailyReview.tsx` (§4.3 stepper). Key points:
   - Maintain `index` state; `current = items[index]`; `phase: 'gate' | 'problem'` per item; and (quant gate only)
     a `confidence` state cleared on each `setIndex`.
   - `phase==='gate'`: `<WhichMethodGate beat={predictionBeatFor(current)} schemaId={current.schemaId}
     onResolved={({ correct, picked }) => { recordMethodPick(current, correct, picked); setPhase('problem') }} />`
     (spec-13's authoritative payload `{ correct, picked }`; spec-13 decides whether a wrong pick blocks or just
     records — this surface records `correct` for the rep/analytics path and advances).
   - `phase==='problem'`: render the single problem beat via the existing beat renderer (the component
     `LessonPlayer` uses to render one beat) with **no surface chrome**. **When `quantGate` is true, also mount
     `<ConfidenceRating value={confidence} onChange={setConfidence} />` (spec-02 — D6 third capture site)**; Track A
     does not mount it. On grade callback → `onSubmit(current.cardId, result, quantGate ? confidence : undefined)`
     → `setIndex(i+1)`, `setPhase('gate')`, clear `confidence`.
   - When `index >= items.length`: render the `Done` summary; CTA `Back to home` → `navigate(ROUTES.landing)`.
   - **Label-stripping:** do not render `current.conceptId`, lesson title, or method name; set the document title
     to a neutral `Daily Review` only.
   → **verify:** `/dev/review` walks the full gate→problem→next loop on fixtures; no concept/lesson/method text
   appears in the DOM (assert in step 9 test).

8. **Create the dev harness** `src/pages/DevReviewPage.tsx` + dispatch in `DevRoutes.tsx` (`if (path ===
   ROUTES.devReview) return <DevReviewPage />`). Mirror `DevHomePage.tsx`'s scenario switcher: scenarios
   `empty`, `due-3`, `ramp-final` (a date 2 days out), plus a `track-A` vs `quant` toggle. Feed `DailyReview` and
   `DailyReviewHero` fixture `QueueItem[]` + fixture lesson content (reuse `loadDevLesson` /
   `course-pattern-hitting-times.json` like `DevHomePage.tsx:8`). `devNavigate` is a no-op (copy `DevHomePage.tsx:86-88`).
   The `track-A` vs `quant` toggle feeds `quantGate` straight into `DailyReview`/`DailyReviewHero` (the harness sets
   it directly — `isQuantIntensity` is exercised in the container's unit test, not needed in `/dev`).
   → **verify:** open `/dev/review`, click through every scenario + the track toggle; the hero's three states and
   the queue's gate→problem→done flow all render with no Firebase; the `quant` toggle shows `<ConfidenceRating>` on
   the problem, `track-A` does not.

9. **Tests** (§8). → **verify:** all green per §10.

---

## 6. Two-track behavior

The **queue itself is for everyone** (D8). The quant-intensity gate (`isQuantIntensity(userDoc)` — the §4 shared
helper, computed once in `DailyReviewPage` and threaded down as `quantGate`) only changes **framing + intensity**,
never availability:

| Surface element | Track A (gentle, default) | Quant-intensity gate (`isQuantIntensity(userDoc)` true) |
|---|---|---|
| Hero sub-copy (due) | `Keep your skills warm — {N} ready to revisit.` | `{N} cards due. Recall cold — no peeking.` |
| Empty state | `You're all caught up. Nice work.` | `Caught up. Come back when cards are due.` (terse, no praise) |
| Label-stripping | On (it is D8's whole point), but the gate may be gentler (spec-13 decides) | On + the which-method gate is mandatory framing; brutal "name the method first" tone |
| Confidence rating on each card | **Not mounted** (D6 light/off); `submitReview` called with no `confidence` ⇒ `card.lastConfidence` stays `null` | **`<ConfidenceRating>` mounted on the spaced-review problem** (D6's third capture site); the captured value is passed as `submitReview`'s `confidence` → lands in `card.lastConfidence` (read by spec-12 calibration) |
| Ramp note | Forgiving final-stretch line; never alarmist | Same lines but the terse register; final-stretch emphasized |

The component takes `quantGate: boolean` (+ `track`) and selects copy from a small `COPY[quantGate ? 'quant' :
'gentle']` map. No behavior branches beyond copy and whether the confidence rating is passed through.

---

## 7. Data / schema changes

**None persisted by this spec.** It writes only via spec-10's `submitReview({ cardId, result, confidence? })`
(Function-owned `reviews/{cardId}`, README §4 Foundation A / §4.5 frozen signature — R4 satisfied: no client write
to progression). The optional `confidence` it passes for the quant-intensity gate (D6) is **persisted by spec-01's
callable into `card.lastConfidence`** — this spec defines no new field, it only supplies the value at the third
capture site. It reads `userDoc.targetInterviewDate` (added by spec-01, client-writable) and
`userDoc.defaultTrack`/`learningGoal` (existing, but only via `isQuantIntensity` — never re-derived inline).

**Analytics (additive, fire-and-forget — mirror `events.ts:70-110`):**
- `dailyReviewHeroShown: (p: { dueCount: number }) => track('daily_review_hero_shown', p)`
- `dailyReviewStarted: (p: { dueCount: number; quantGate: boolean }) => track('daily_review_started', p)`
- `reviewCardCompleted: (p: { result: 'pass' | 'fail' }) => track('review_card_completed', p)` — **no `conceptId`/
  `schemaId`/`lessonId`** in the payload-facing UI, but analytics may include `schemaId` (it is not user-visible);
  keep it out only if spec-13/analytics policy forbids — default: include `schemaId` for method-weakness analytics
  (Foundation B intent), it never renders.
- `dailyReviewCompleted: (p: { reviewed: number; passed: number }) => track('daily_review_completed', p)`

**Index (R4):** none added by this spec. spec-10 owns the `reviews` `dueAt` query + any composite index (README §4).

---

## 8. Tests

Unit (vitest — `./node_modules/.bin/vitest run`):

1. **`src/pages/dailyReview.model.test.ts`**
   - `rampNote`: returns `null` when `targetInterviewDate` undefined; `null` when `daysUntil > 14`; the 8–14 / 4–7
     / ≤3 / day-of strings at boundary days (13, 14, 7, 8, 3, 4, 0, -1); `null` when `dueCount === 0`.
   - `buildHeroModel`: `hasAnyCards=false` ⇒ hero suppressed regardless of count; `dueCount` passthrough; rampNote
     composition.
2. **`src/pages/DailyReview.test.tsx`** (render test)
   - The stepper advances gate→problem→next on a mocked `WhichMethodGate.onResolved` + a mocked grade callback;
     `onSubmit` is called once per card with the **`{ cardId, result, confidence }` shape** matching §4.5.
   - **Confidence pass-through (D6 — quant gate):** with `quantGate=true`, `<ConfidenceRating>` (mocked) is mounted
     on the problem; setting its value and grading calls `onSubmit(cardId, result, <thatValue>)`. With
     `quantGate=false`, `ConfidenceRating` is **not** rendered and `onSubmit` is called with `confidence` undefined.
   - **Label-stripping invariant:** given a `QueueItem` whose `conceptId='probability'`, `lessonId='lesson-…'`,
     `schemaId='symmetry'`, the rendered DOM (`container.textContent` + every `aria-label`) contains **none** of
     the concept title, lesson title, or the human method name from `METHODS[schemaId].name`. (Mock spec-13's gate
     to a no-op so its own labels don't pollute the assertion.)
   - Empty (`items=[]`) renders the empty state, not a crash; `Done` summary after the last card.
   - **No item fabrication/reorder (R5):** given a fixed `QueueItem[]`, the stepper visits them in array order and
     submits exactly those `cardId`s — the surface never synthesizes or reorders cards beyond what `buildQueue`
     returned.
3. **`DailyReviewHero`** (can live in `DailyReview.test.tsx` or its own): due / empty / ramp states render the
   right copy per `quantGate`; `onStart` fires from the due-state CTA; `hasAnyCards=false` ⇒ renders nothing.
4. **Catalog regression:** existing `ConceptCatalog` tests stay green with the new optional props omitted.

Fixture validation: `tsx scripts/validate-fixtures.ts` — unaffected (no fixture/schema change here); run to confirm
no regression.

Manual `/dev` check (no Firebase): `/dev/review` exercises hero (due/empty/ramp), the track toggle, and the
gate→problem→done loop. `/dev/home` still renders unchanged.

---

## 9. Foolproofing (which §8 README items apply)

- **R1 (recommender is dead code).** This spec does **not** "extend a live path"; it consumes spec-10's `queue.ts`
  which is itself the first live call site. We add the **surface** call site (`loadDueQueue`) — verify spec-10
  exists before building (§3 R5 gate).
- **R4 (migrations permanent / index file empty / progression writes via Functions).** This spec persists nothing
  client-side; all writes go through spec-10's `submitReview` callable. No index added here.
- **R5 (missing foundations silently degrade).** The queue needs `schemaId` (Foundation B) and a **prerequisite
  order — never surface a problem whose prerequisites aren't taught yet.** Ordering/prereq-respecting selection is
  spec-10's `buildQueue` responsibility — which is exactly why this spec **builds the prereq `order` map and passes
  it as `buildQueue`'s second argument** (`buildQueue(cards, order, now, {maxItems, foils})`), rather than calling a
  2-arg `buildQueue` that has no way to honor prereqs (gate Issue #4/#12). `buildQueue` must not emit a card for a
  beat whose notation/prereqs are untaught; **this spec renders exactly what `buildQueue` returns and adds no card
  not in it.** A test asserts the surface never fabricates or reorders items beyond spec-10's ordering. If
  `queue.ts`/`WhichMethodGate`/`ConfidenceRating` are absent, **stop** and build them (do not stub).
- **R7 (`needsReview` permanent + asymmetric; lesson-level).** The legacy lesson-level `needsReview` (drives the
  catalog's `ResumeHero` "Review →" affordance) is a **different axis** from the card-level `dueAt` queue. This
  spec branches its UX on the **queue** only and does **not** read or mutate `needsReview`; the two heroes coexist
  (Daily Review hero = card-level; Resume hero = lesson-level). Documented so a future session doesn't conflate them.
- **R12 (client timestamps spoofable).** The surface passes only `cardId` + `result` (+ optional `confidence`) to
  `submitReview`; **scheduling time is the server's `now`** inside the callable. `loadDueQueue(uid, now)` uses a
  client `now` purely to *filter for display* — it can never advance a schedule earlier than the server allows,
  because the write path recomputes server-side.

---

## 10. Definition of Done

- `routes.ts` has `review`/`devReview` + `reviewPath`; `App.tsx` guard allows `/review` and renders
  `DailyReviewPage`; `DevRoutes.tsx` dispatches `/dev/review`.
- New files: `src/pages/dailyReview.model.ts`, `src/pages/DailyReview.tsx`, `src/pages/DailyReviewPage.tsx`,
  `src/pages/DevReviewPage.tsx`; `DailyReviewHero` added (inline in `ConceptCatalog.tsx` or its own file);
  `ConceptCatalog.tsx` renders the hero above `ResumeHero` behind optional props.
- The catalog shows `Daily Review · N due` when cards are due, an empty state when none, and a ramp line near the
  target date; `Review now →` launches `/review`.
- The surface consumes spec-10's **exact** queue API: `loadDueQueue(uid, now)` + the 4-arg
  `buildQueue(cards, order, now, {maxItems, foils})` (prereq `order` map built and passed; `foils =
  isQuantIntensity(userDoc)`) — **no 2-arg `buildQueue` call** anywhere.
- The quant-intensity gate is computed **only** via `isQuantIntensity(userDoc)` from `src/auth/track.ts` (in both
  `ConceptCatalogPage` and `DailyReviewPage`) — `grep` shows no bare `defaultTrack === 'B'` gating in the new code.
- `/review` presents due cards interleaved (spec-10 order), labels stripped, each fronted by spec-13's
  `<WhichMethodGate beat schemaId onResolved/>`, calling `submitReview({ cardId, result, confidence? })` per card;
  for the quant gate, `<ConfidenceRating>` is mounted on the problem and its value flows into `confidence`
  (→ `card.lastConfidence`, D6). A `Done` summary on completion.
- Two-track copy verified on `/dev/review` (gentle vs quant); the quant path shows `ConfidenceRating`, Track A
  does not.
- Green: `./node_modules/.bin/vitest run` (new + existing); `tsx scripts/validate-fixtures.ts`;
  `./node_modules/.bin/eslint` on every touched file. Manual `/dev/review` + `/dev/home` walkthrough.

---

## 11. PHASE-NEXT (NOT built now) — Mixed-Floor-as-home (Track B)

**Deferred per D8 / brainlift #8.** This section documents the eventual full surface so a later Track-B phase can
pick it up; **do not build it in spec-20.**

The brainlift's #1 ("make a label-stripped Mixed Floor *the home surface*") goes further than the hero: for the
quant-intensity gate, the **entire home** becomes the label-stripped interleaved floor — the catalog/shelves recede
to a secondary "browse" affordance, and the first thing a Track-B learner sees is the queue, not concept cards.

Why deferred (D8): it is a large IA change, it competes with the catalog's discovery role for Track A, and it needs
the queue to be proven (enough cards, good interleave, prereq ordering) before it can be a learner's only entry
point. The hero in this spec is the **reversible v1 slice** that ships the daily-review behavior without betting the
home on it.

When taken up (Phase-Next sketch — to be its own spec):
- Gate on the quant-intensity gate via `isQuantIntensity(userDoc)` (the §4 shared helper) → `/` renders
  `<DailyReview>` full-bleed (the catalog reachable via a `Browse` link); Track A keeps the catalog home.
- The empty-floor state for Track B becomes a "pull forward tomorrow's cards / drill a weak method" affordance
  (method-weakness index from Foundation B) rather than "nothing due".
- Requires: stable card volume, the prereq-ordering guarantee (R5) hardened, and likely the difficulty governor
  (spec-21) so the floor self-levels. Reuses **all** components built here (`DailyReview`, the gate, `submitReview`)
  — this spec is deliberately structured so the Phase-Next change is a routing/IA swap, not a rebuild.
