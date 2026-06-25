# Ergo Lesson Restyle Brief — Part 3: Celebration, Completion, Migration & Risks

> **Status:** draft (planning only — no source/CSS/fixture changes in this document).
> **Authority:** `docs/ui_design_system.md` (Ergo Design System) wins on any conflict;
> rationale in `docs/adr/0003-ergo-bright-reimagining.md`; glossary in `CONTEXT.md`.
> **Companion parts (drafted in parallel — reference, do not assume merged):**
> - `01-shell-and-chrome.md` — lesson shell + chrome (`.lesson`, `.topbar`, `.prompt`, `.region`, `.rail`, `.btn`, action bar, status notes, token/font shell migration).
> - `02-beats-and-visualizations.md` — beat components, `beats.css` / `beats-extended.css`, Konva theme, chapter-palette viz.
> - **`03-celebration-migration-and-risks.md` (this file)** — the lesson-complete celebration + recap marker, the **whole-restyle migration plan**, the **cleanup punch-list**, and the **risk register**.

This part is the capstone: it closes the loop on the one screen where "the math does the
celebrating," then sequences Parts 1+2+3 into a shippable plan with explicit
file-ownership, Definition-of-Done gates, a cleanup punch-list, and a risk register.

---

## 0. Current state (what is already done vs. pending)

Establishing the baseline so every recommendation below is anchored to the real code.

**Already shipped (Ergo):**
- **Token pipeline + fonts** are Ergo. `src/styles/tokens.generated.css` emits the Ergo set
  (`--ergo-*`, `--chN`, `--shadow-*`, `--font-display: 'Space Grotesk'`, `--font-sans: 'Inter'`)
  **and** remaps the legacy notebook names as **backward-compat aliases** to Ergo values:

```31:69:src/styles/tokens.generated.css
  --ergo-brand: #4f46e5;
  --ergo-ink: #161a27;
  --ergo-shadow-sm: 0 1px 2px rgba(22, 26, 39, 0.06), 0 1px 3px rgba(22, 26, 39, 0.04);
  --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif;
  --ink: #161a27;
  --paper-0: #f7f8fb;
  --quill: #4f46e5;
```

  **Consequence (critical for the whole plan):** the lesson surfaces (`shell.css`, `beats.css`,
  `auth-landing.css`) still *reference* notebook tokens (`--paper-0`, `--rule`, `--quill`,
  `--graphite`, `--press-deboss`), so they already render with Ergo **colors and fonts** — but
  with **notebook semantics**: a single indigo `--quill` accent everywhere, deboss/press depth,
  **no chapter hues**, the wax-seal milestone, and the tally-mark streak. The lesson is
  *half-migrated*: right pixels for fonts/base, wrong design language. This is exactly why the
  lesson VR baselines were captured yet still need re-capture (§5.2).
- **Home is Ergo.** `src/pages/StudyDesk.tsx` renders `.ergo-home` → momentum band
  (`WeeklyStreak` + `ConceptMedallion` gallery) → `CourseJourney`; CSS in
  `src/styles/surfaces/ergo-home.css` + `ergo-journey.css`. The new progress components
  (`WeeklyStreak`, `ConceptMedallion`) **have replaced** the tally + wax-seal gallery on Home.

**Pending (this brief's subject):** the **lesson interior** — shell/chrome (Part 1), beats/viz
(Part 2), and **celebration/completion + recap marker + compact streak** (Part 3), plus the
cleanup of everything the migration orphans.

**Component split today (verified by usage grep):**

| Component | Ergo? | Still used at | Disposition |
|-----------|-------|---------------|-------------|
| `WeeklyStreak` (`src/habit/WeeklyStreak.tsx`) | ✅ | `StudyDesk` momentum band | Extend with a compact variant (§1.5) |
| `ConceptMedallion` (`src/habit/ConceptMedallion.tsx`) | ✅ | `StudyDesk` gallery | Promote to the shared mastery marker (§1.2) |
| `MilestoneSeal` (`src/habit/MilestoneSeal.tsx`) | ❌ wax seal | `LessonPlayer` takeover (`earned stamped`), `RecapBeat` (`earned`) | **Retire** after §1 migrates both call sites |
| `StreakTally` (`src/habit/StreakTally.tsx`) | ❌ tally marks | `LessonPlayer` top bar (`compact`, both states) | **Retire** after §1.5 |

---

## 1. Celebration & Completion restyle

### 1.1 Design north star for this screen

From the Ergo spec (Motion → *Lesson completion celebration*; *What "Premium" Means*):

> On lesson complete: the matching concept medallion scales up with `--shadow-lg` → settles;
> a brief light-streak arc in chapter color crosses the screen (GSAP, compositor-only
> `transform`); then a quiet fade-in of the recap text. Duration `--celebrate-beat`.
> **No confetti. No colored paper bits.** … "the math does the celebrating."

Translated into hard rules for the redesign:

1. **One cinematic moment** (the medallion earn + a single chapter-hued light-streak), then quiet.
2. **The verdict is the hero.** The KaTeX result (`E[HH] = 6 > E[HT] = 4`, etc.) and the
   chapter-hued concept marker carry the celebration; effects are restrained and chapter-keyed.
3. **Compositor-only** `transform`/`opacity`; reduced-motion has a final-frame equivalent for every beat.
4. **Retire** the wax-seal ink-stamp (`seal--stamped`), the ink-bloom radial, and the tally streak.
5. **Preserve the e2e-load-bearing nodes** verbatim (§1.8).

### 1.2 Decision — one shared "concept-mastered" marker (not a restyled wax seal)

**Recommendation: introduce a single shared Ergo marker and retire `MilestoneSeal`.** Promote
`ConceptMedallion` to the canonical "concept mastered" visual used by **all three** surfaces —
Home gallery, lesson recap, and the completion takeover — with a `size` variant. This directly
serves the spec's "Premium is uniform" principle (the medallion that lights up on Home is the
same object the learner just earned) and collapses two component systems into one.

Rejected alternative — *restyle `MilestoneSeal` in place*: it keeps a second, parallel
"earned" visual whose only differences from `ConceptMedallion` would be cosmetic, guaranteeing
drift between Home and the lesson. The wax-seal API (`stamped`, `active`, `onClick`, `ghost`) is
also notebook-era and mostly unused at the live call sites.

`ConceptMedallion` is currently a fixed 44px circle:

```9:24:src/habit/ConceptMedallion.tsx
export function ConceptMedallion({
  meta,
  earned,
  earning = false,
  hueVar,
}: {
  meta: MilestoneMeta
  earned: boolean
  earning?: boolean
  hueVar?: string
}) {
  const hue = hueVar ?? 'ergo-brand'
  const style = {
    '--medallion-hue': `var(--${hue})`,
    '--medallion-tint': `var(--${hue}-tint)`,
  } as React.CSSProperties
```

**Proposed change** — add a `size` prop (`'sm' | 'md' | 'lg'`) driving a `--medallion-size`
custom property; default `'sm'` keeps Home byte-identical:

```tsx
// ConceptMedallion: add size variant (sm = 44 gallery, md = 56 recap, lg = 96 takeover hero)
size = 'sm',          // new prop
// ...
className={`ergo-medallion ergo-medallion--${size} ${stateClass}`}
```

```css
/* ergo-home.css (or a new shared surfaces/concept-marker.css) */
.ergo-medallion--sm { width: 44px; height: 44px; }
.ergo-medallion--md { width: 56px; height: 56px; }
.ergo-medallion--lg { width: 96px; height: 96px; box-shadow: var(--ergo-shadow-md); }
.ergo-medallion--md .ergo-medallion__glyph { font-size: 13px; }
.ergo-medallion--lg .ergo-medallion__glyph { font-size: 20px; }
```

The medallion glyphs already exist for every milestone in `MILESTONE_SEQUENCE`
(`HH≠HT`, `A≻B`, `i/N`, `✓×3`, `E[H]`, `∅→H`, `Σ2ᴸ`, `✓×6`), and the chapter-hue map already
exists in `StudyDesk` — both should be single-sourced (§1.6).

### 1.3 Completion takeover redesign (`LessonPlayer.tsx` + `LessonCelebration.tsx`)

The takeover replaces the beat entirely once `done` is true:

```359:423:src/lesson/LessonPlayer.tsx
  if (done) {
    return (
      <div className="lesson">
        <header className="topbar">
          <button
            type="button"
            className="topbar__back"
            onClick={onExit}
            disabled={!canExit}
            aria-label="Back to course path"
          >
            ←
          </button>
          <div className="topbar__center">
            <span className="topbar__title">{lesson.title}</span>
          </div>
          <StreakTally count={streak.count} compact />
        </header>

        <LessonCelebration>
          <div className="done-note">
            <p>
              Lesson complete ✓
              {mastered
                ? ' · fully mastered'
                : needsReview
                  ? ' · review recommended'
                  : ''}
              {completion?.unlockedLessonId ? ' · next lesson unlocked' : ''}
            </p>
            {completionError && (
              <p className="done-note__error" role="alert">
                We couldn't save your progress, so the next lesson may stay locked.{' '}
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    if (completedOnce.current) return
                    completedOnce.current = true
                    void submitCompletion(completedBeats)
                  }}
                >
                  Try again
                </button>
              </p>
            )}
            <MilestoneSeal meta={milestone} earned stamped />
          </div>
        </LessonCelebration>

        <footer className="actionbar">
          {canExit && (
            <button
              ref={ctaRef}
              type="button"
              className="btn btn--primary"
              onClick={onExit}
            >
              Back to course path
            </button>
          )}
        </footer>
      </div>
    )
  }
```

**Redesign (DOM structure is preserved; the seal is swapped and a light-streak is added):**

1. **Swap the marker.** Replace `<MilestoneSeal meta={milestone} earned stamped />` with the
   shared marker at hero size, chapter-hued, with the earn animation:

```tsx
<ConceptMedallion
  meta={milestone}
  earned
  earning={!reducedMotion}     // triggers the scale-0.8→1.0 + shadow flash (CSS, reduced-motion no-op)
  hueVar={chapterHueVar(lessonId)}   // §1.6 — e.g. 'ch2' for Penney's
  size="lg"
/>
```

   Keep a `"Concept mastered"` kicker above it (caption weight, `--ergo-ink-3`). If the lesson
   awarded more than one milestone (`completion?.awardedMilestones`, e.g. L1 awards three), show
   the extras as a small `size="sm"` medallion row beneath the hero — the same objects the Home
   gallery will light up. This is optional polish; the single hero medallion is the MVP.

2. **Light-streak arc (the one cinematic moment).** Add a GSAP, compositor-only chapter-color
   streak that crosses the takeover once on mount, on the `--celebrate-beat` (480ms) clock.
   Implement as a lazily-imported GSAP timeline (same pattern as `revealHeadline`/`gsapText`),
   animating `transform`/`opacity` of a single absolutely-positioned element behind the marker;
   **gate on reduced-motion** (omit entirely) and on `document.startViewTransition`-style feature
   parity is not needed here. Token: reuse `STAMP_BEAT`/`--celebrate-beat` from `src/motion/tokens.ts`.

   > Note: the spec names a `--celebrate-beat: 480ms`. The JS token mirror currently exposes
   > `STAMP_BEAT`/`STAMP_BEAT_MS` (480ms) only (`src/motion/tokens.ts`). Either alias
   > `CELEBRATE_BEAT = STAMP_BEAT` in the token mirror or add `--celebrate-beat` to the token
   > pipeline. Flagged for Part 1 (token owner) or §3 Wave C; **decision: alias in the JS mirror**
   > to avoid a token-pipeline change mid-restyle.

3. **`LessonCelebration` stays the spring wrapper** but its comment must stop referencing the seal:

```12:24:src/lesson/LessonCelebration.tsx
export function LessonCelebration({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return (
    <m.div
      className="celebration"
      initial={reduced ? false : { opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={SPRING_CELEBRATE}
    >
      {children}
    </m.div>
  )
}
```

   `SPRING_CELEBRATE` ("licensed bounce", `src/motion/tokens.ts`) is correct for this peak
   moment — keep it. Update the file header comment (it still says "the ink-stamp seal … is the
   sole cinematic beat") to describe the medallion earn + light-streak.

4. **Chapter-key the takeover.** Set `data-ch={chapterOf(lessonId)}` on the takeover root (or on
   `.celebration`) so the streak and any CTA inherit the chapter glow tokens already defined in
   `ergo-journey.css` (`[data-ch="ch2"] { --ch-glow: … }`). The "Back to course path" CTA may
   adopt the chapter fill (per the detail-card CTA pattern) for consistency.

5. **`.done-note` + `.celebration` CSS** (currently notebook-token, in `beats.css`):

```765:775:src/styles/surfaces/beats.css
.done-note {
  text-align: center;
  color: var(--correct-text);
  font-weight: 500;
  margin: 0 0 var(--s3);
}

/* Lesson-complete celebration (LessonCelebration.tsx): spring-in card. */
.celebration {
  position: relative;
}
```

   Re-point `--correct-text` → `--ok` (or `--ergo-ink` for the neutral line); add the
   `position: relative` streak-container styles to `.celebration`. **Keep the class names and the
   `.done-note` text node.**

### 1.4 Recap marker redesign (`RecapBeat.tsx`) + an important reachability finding

The recap renders a milestone stamp at the top of both the flagship and generic branches:

```235:242:src/lesson/beats/RecapBeat.tsx
        {props.lessonComplete && props.milestone && (
          <div
            className={`recap__stamp${reducedMotion ? '' : ' recap__stamp--press'}`}
          >
            <p className="recap__stamp-kicker">Milestone earned</p>
            <MilestoneSeal meta={props.milestone} earned />
          </div>
        )}
```

**Finding (verified by tracing the flow): the `recap__stamp` block is currently unreachable.**
`props.lessonComplete` is `done` (passed from `LessonPlayer`), and `RecapBeat` only renders while
`done === false` — the moment the learner clicks **Finish** on the last beat, `advance()` sets
`done = true` and `LessonPlayer` returns the completion takeover *instead of* `BeatView`
(`if (done) return …`, `LessonPlayer.tsx` line 359). So `lessonComplete && props.milestone` never
evaluates true inside a mounted `RecapBeat`. **The recap stamp + its `MilestoneSeal` are a dead
branch today.**

**Decision:** consolidate the "concept mastered" celebration into the **single** completion
takeover (§1.3) and **remove the unreachable `recap__stamp` branch** from both branches of
`RecapBeat` (the generic branch at ~lines 128–133 and the flagship branch at ~lines 235–242).
If product instead wants a marker visible *during* the recap reading (before Finish), that's a
behavior change requiring re-wiring (e.g. a separate `awarded` prop) — flag as **needs-confirmation**;
default is removal.

**The flagship hero "seal" pill** is a separate, *reachable* element and should be restyled, not
removed:

```289:306:src/lesson/beats/RecapBeat.tsx
            <div className="recap__hero">
              <span className="recap__seal mono">HH ≠ HT</span>
              <p className="recap__verdict">
                <Katex
                  tex={`E[\\text{${pattern}}] = ${eHH}${
```

Its CSS uses notebook `--ink`:

```461:471:src/styles/surfaces/beats.css
.recap__seal {
  display: inline-flex;
  align-items: center;
  padding: var(--s1) var(--s3);
  border: 1.5px solid var(--ink);
  border-radius: var(--r-pill);
  font-size: calc(12px * var(--fs));
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--ink);
}
```

**Restyle** `.recap__seal` to a chapter-tinted pill consistent with the medallion glyph language:
`background: var(--chN-tint)`, `border: 1.5px solid var(--chN)`, `color: var(--chN)`,
`font-family: var(--font-mono)`. Drive `--chN` from the lesson's `data-ch` (§1.6). The whole
recap reveal block (`.recap__hero/__verdict/__principle/__mech/__path/__trio/__metric/__next/__review`,
`beats.css` ~392–603) is **Part 2 scope** (beat token migration); §1.4 only claims `.recap__seal`
and the `recap__stamp` removal because they are celebration/marker concerns.

### 1.5 Compact streak in the lesson top bar

The top bar renders the tally streak compact in **both** lesson states (active and the takeover):

```455:455:src/lesson/LessonPlayer.tsx
        <StreakTally count={streak.count} compact />
```

`StreakTally` draws hand-drawn tally marks (notebook identity) and is used **only** here.

**Decision: replace it with a compact Ergo streak chip, sourced from `WeeklyStreak`.**
`WeeklyStreak` already accepts a `compact` prop but currently renders the full number + 7-dot rail
regardless (no `.ergo-streak--compact` CSS exists yet). Extend it so `compact` renders a top-bar
**chip**: the brand-indigo tabular numeral + a tiny 7-dot (or 3-dot) mini-rail (or just
`"N"` + `"day streak"`), reusing the existing `getActiveDots(count, lastActiveDate)` logic.
Single streak component = single source of truth; `StreakTally` is then retired (§4).

```css
/* ergo-home.css — define the compact chip the lesson top bar uses */
.ergo-streak--compact {
  flex-direction: row;
  align-items: center;
  gap: var(--s2);
  padding: var(--s1) var(--s3);
  border: 1px solid var(--ergo-line);
  border-radius: var(--r-pill);
}
.ergo-streak--compact .ergo-streak__number { font-size: 16px; }
.ergo-streak--compact .ergo-streak__label,
.ergo-streak--compact .ergo-streak__day-labels { display: none; }  /* keep dots only, or hide both */
```

```tsx
// LessonPlayer.tsx — both top bars
<WeeklyStreak count={streak.count} lastActiveDate={streak.lastActiveDate} compact />
```

> **`lastActiveDate` availability:** `LessonPlayer` already loads the full `Streak`
> (`loadStreak`, state `streak`), which includes `lastActiveDate`, so the prop is available with
> no plumbing change. `aria-label="${count}-day streak"` parity is preserved (`WeeklyStreak`
> already sets it).
>
> **Ownership coordination:** the `.topbar` chrome (grid, borders, the right-slot sizing) is
> **Part 1** scope (`shell.css`). The streak *component* swap is **Part 3**. They must agree on
> the right-slot width so the chip fits. There is also a possibly-dead `.streak` rule in
> `shell.css` (lines 89–99) that no component references — flag to Part 1 as an adjacent cleanup.

### 1.6 Single-source the chapter hue (lesson → `chN`)

Three surfaces now need "which chapter color is this lesson?": the completion medallion, the
light-streak, and the `.recap__seal`. The mapping already exists privately in `StudyDesk`:

```34:43:src/pages/StudyDesk.tsx
const MILESTONE_HUES: Record<string, string> = {
  'hh-ht-mastered':        'ch1',   // L1: Pattern Hitting Times (Ch1 Foundations)
  'first-pattern-cracked': 'ch1',   // L1: same chapter
  'state-machine-builder': 'ch1',   // L1: same chapter
  'penneys-game-won':      'ch2',   // L2: Penney's Game (Ch2 Racing & Walks)
  'gamblers-ruin-solved':  'ch2',   // L3: Gambler's Ruin (Ch2 Racing & Walks)
  'three-lessons-complete':'ch2',   // Mid-course milestone, Racing chapter midpoint
  'martingale-mastered':   'ch3',   // L6: Overlap Shortcut (Ch3 Mastery)
  'six-lessons-complete':  'ergo-brand', // Course completion — brand indigo
}
```

**Decision:** extract a shared `src/lesson/chapters.ts` (new, small module) exposing
`chapterOf(lessonId): 'ch1'|'ch2'|'ch3'|'ch4'` and `chapterHueVar(lessonId): string`, plus the
milestone→hue map, and consume it from `CourseJourney`, `StudyDesk`, and the
completion/recap. Authoritative lesson→chapter mapping (from `CONTEXT.md` + spec):

| Lesson | id | Chapter | Hue |
|--------|----|---------|-----|
| L0 First Heads | `lesson-first-heads` | Ch 1 Foundations | `ch1` indigo |
| L1 Pattern Hitting Times | `lesson-pattern-hitting-times` | Ch 1 Foundations | `ch1` indigo |
| L2 Penney's Game | `lesson-penneys-game` | Ch 2 Racing & Walks | `ch2` teal |
| L3 Gambler's Ruin | `lesson-gamblers-ruin` | Ch 2 Racing & Walks | `ch2` teal |
| L4 States & Streaks | `lesson-states-streaks` | Ch 3 Mastery | `ch3` coral |
| L5 Longer Patterns | `lesson-longer-patterns` | Ch 3 Mastery | `ch3` coral |
| L6 The Overlap Shortcut | `lesson-overlap-shortcut` | Ch 3 Mastery | `ch3` coral |

> If `CourseJourney` (Part 1/Home) already computes `data-ch` from course content, prefer reusing
> **its** source rather than introducing a parallel literal — confirm with the Part 1 owner to
> avoid two maps. This is a coordination point, not a blocker.

### 1.7 Reduced-motion parity (every celebration beat)

The global backstop `* { transition-duration: 0.01ms !important }` stays. Per-beat:

| Element | Full motion | Reduced-motion equivalent | Mechanism |
|---------|-------------|---------------------------|-----------|
| `LessonCelebration` card | spring-in (`SPRING_CELEBRATE`) | no transform; appears | already `initial={reduced ? false : …}` |
| Medallion earn | scale 0.8→1.0 + shadow flash | instant earned styling | CSS `@media (prefers-reduced-motion: reduce){ .ergo-medallion--earning{animation:none} }` (already present) — pass `earning={!reducedMotion}` |
| Light-streak arc | GSAP transform sweep | **omitted entirely** | branch on `useReducedMotion()` before building the timeline |
| Completion scroll-to-top | smooth | instant (`scrollTo(0,0)`) | already branched in `LessonPlayer` (lines 263–271) |
| `.recap__seal` pill | static | static | n/a |
| Compact streak chip | dot fill spring (optional) | instant fill | CSS reduced-motion no-op |

The lesson must remain **fully completable at zero motion** (the e2e reduced-motion project
proves this end-to-end).

### 1.8 Load-bearing nodes that MUST be preserved (do not rename / do not change text)

The e2e suite drives completion through these exact hooks (`e2e/helpers.ts`,
`remaining-lessons.spec.ts`, `lesson-complete.spec.ts`):

```99:99:e2e/helpers.ts
  await expect(page.locator('.done-note')).toContainText('Lesson complete')
```

- **`.done-note`** element and the substring **`"Lesson complete"`** — keep verbatim.
- **`.actionbar .btn--primary`** — the completion CTA locator (`const primaryOf = page.locator('.actionbar .btn--primary')`). Keep the `.actionbar` footer + a `.btn.btn--primary` inside it on the takeover.
- **`aria-label="Back to course path"`** on the back button is also referenced indirectly; keep it.

Everything else on the takeover/recap (`.celebration`, `.recap__seal`, the marker classes, the
streak chip) is **not** asserted by e2e and may be freely restyled/renamed — but it **is**
VR-visible, so it triggers a re-baseline (§5.2).

---

## 2. Non-home surfaces appendix — Landing + Auth (related, separately scoped)

> **Scope note:** Landing and Auth are *outside* "lessons," but the spec demands a uniform
> premium bar ("the landing, the home, and every lesson beat are held to the same bar"). They are
> currently the **last notebook-token surfaces** in the app. Treat this as a **related, separately
> scheduled task** (Wave E in §3) — not a blocker for the lesson restyle, but required before the
> app reads as fully Ergo.

**Current debt:** `src/styles/surfaces/auth-landing.css` is written entirely against notebook
tokens (`--ink`, `--graphite`, `--graphite-soft`, `--rule`, `--paper-0/1`, `--paper-shadow-2`,
`--quill`, `--quill-tint`, `--quill-strong`, `--wrong`, `--wrong-text`, `--correct-text`) and
notebook depth (bottom-rule inputs, `--press-deboss`). It renders "Ergo-ish" only via the
compat aliases.

**Landing hero (`src/pages/LandingPage.tsx` + `.hero*`, `.preview*`):**
- Migrate `.hero__title/__subtitle` to Ergo display type (already Space Grotesk via alias; drop
  `font-optical-sizing` serif-isms, keep `text-wrap: balance`, fluid `clamp`).
- The decorative `∅ → H → HH` state-machine SVG (`StateMachinePreview`) is a signature math
  object — re-skin to Ch 1 indigo: node rings + `--ch1-tint` fills, the traveling "signal" packet
  in `--ch1`/`--ergo-brand` (currently `--quill`), animating **once per `--flip-beat`** to match
  the synchronized-flip choreography, with the ambient pause rules (`useAmbient` already wired).
- CTAs already use `.btn--primary/--secondary` (shared with the lesson) — they inherit the Part 1
  button migration automatically.
- **Stale comment** in `LandingPage.tsx` ("GSAP SplitText reveal owns the **Fraunces** hero")
  must be fixed (§4.4).

**Auth (`src/pages/AuthPage.tsx` + `.authpage/.authcard/.field/.authform*`):**
- Card → Ergo surface card: `--ergo-surface`, `--shadow-md`, `--r-lg`/`--r-xl`, `1px --ergo-line`.
- Inputs → Ergo bordered inputs per spec *Inputs*: `--ergo-surface` fill, `1px --ergo-line-2`
  border, `--r-md`, focus `2px --ergo-brand` + `--ring-focus`; **error** = `--bad` border +
  `--bad-tint` background + helper in `--bad` (replace the notebook bottom-rule + `--wrong*`).
- Status/error copy → `--ok`/`--bad`.

**Shared-surface coupling (call out in the plan):** `.btn` and `.field` are shared by
`AuthPage` **and** `ProfilePage`. Migrating those token references touches ProfilePage's rendering
too — verify ProfilePage visually after the change (it has no VR baseline today; consider adding
one). This is why Auth/Landing is its own wave with its own DoD, not folded into a lesson wave.

---

## 3. The migration plan (sequenced, parallelizable, gated)

Maps to the spec's implementation phasing (Token rewrite → Home → Beats → Motion/celebration →
Polish), of which **Token rewrite + Home are already done**. What remains is the lesson interior +
cleanup + the non-home surfaces.

### 3.1 Waves & ordering

```
DONE ──▶ Wave 0  Tokens + fonts + Home (shipped)

Wave A  Lesson shell & chrome ........... Part 1   ─┐ (A unblocks the chrome that C's
Wave B  Beats & visualizations .......... Part 2   ─┤  streak chip + B's recap blocks sit in)
                                                     │  A and B may run in parallel; both
                                                     │  touch shell.css/beats.css → strict
                                                     │  file-ownership (3.2) prevents conflicts
Wave C  Celebration / completion / streak  Part 3  ─┘  depends on A (top-bar slot) + B (recap blocks)
Wave D  Cleanup & retirement ............ Part 3      depends on C (can't retire MilestoneSeal/
                                                       StreakTally until C migrates call sites)
Wave E  Landing + Auth (appendix) ....... Part 3/§2   independent; any time after Wave 0
Wave F  VR re-baseline + a11y/perf gate .. USER       last; after C+D (and E if batched)
```

**Critical path:** A → C → D → F. B parallels A and feeds C's recap-block tokens. E is fully
parallel. F is user-driven (snapshots + manual passes) and must be last.

### 3.2 Suggested file-ownership for a parallel subagent team

Editing the same CSS file from two agents is the main hazard (`shell.css`, `beats.css`). Assign
**exclusive** files/regions:

| Subagent | Wave | Owns (exclusive) | Must not touch |
|----------|------|------------------|----------------|
| **S1 — shell** | A | `shell.css`; lesson chrome JSX in `LessonPlayer.tsx` (top bar, prompt, region, action bar, status notes), `BeatShell.tsx`, `PhaseRail.tsx` | `beats.css` recap block; `home.css`; habit components |
| **S2 — beats A** | B | `beats.css` (beat blocks **except** `.done-note`/`.celebration`/`.recap__seal`), half the beat components | `shell.css`; `home.css` |
| **S3 — beats B / viz** | B | `beats-extended.css`, `src/lesson/konva/theme.ts` + Konva beats, remaining beat components | `shell.css` |
| **S4 — celebration** | C | `LessonCelebration.tsx`, the `done` block of `LessonPlayer.tsx`, `RecapBeat.tsx` (marker only), `ConceptMedallion.tsx` (+`size`), `WeeklyStreak.tsx` (+compact), new `src/lesson/chapters.ts`, `.done-note`/`.celebration`/`.recap__seal`/`.recap__stamp` rules, `.ergo-streak--compact`/`.ergo-medallion--md/--lg` in `ergo-home.css` | beat interiors; `shell.css` chrome |
| **S5 — cleanup** | D | delete orphan files; `package.json`/lock; dead `home.css` selectors; stale comments | anything still live |
| **S6 — public** | E | `LandingPage.tsx`, `AuthPage.tsx`, `auth-landing.css` | lesson files |

Coordination contracts: (1) S1 publishes the `.topbar` right-slot size before S4 finalizes the
chip; (2) S2 leaves `.done-note`/`.celebration`/`.recap__seal` to S4; (3) S4 lands before S5
retires `MilestoneSeal`/`StreakTally`.

### 3.3 Definition-of-Done gates

**Per-wave automated gate (every subagent runs before handoff):**
- `npm run build` → `tsc -b && vite build` (typecheck + production build both clean).
- `npm run lint` → `eslint .` clean (no new warnings; React Compiler/`react-hooks` happy).
- `npm test` → `vitest run` green (unit/component tests, incl. any `*.test.tsx` the wave touches).
- Targeted manual smoke at the dev routes the wave affects (`/dev/lesson`, `/dev/lesson/:id`, `/dev/home`).

**Cross-wave functional gate (after A+B+C; the user runs Playwright):**
- `npm run e2e` (`playwright test`) green across **all** projects — chromium, mobile (tap-only),
  reduced-motion — covering `smoke`, `lesson-complete`, `track-a`, `remaining-lessons`.

**Visual gate (user; after C+D, and E if batched):**
- `playwright test -c playwright.vr.config.ts --update-snapshots` to **re-baseline** the 6 VR
  snapshots (§5.2), then a clean verify run (no `--update-snapshots`) at `maxDiffPixelRatio 0.02`.

**Polish/a11y/perf gate (user; final):**
- Reduced-motion pass (§1.7); keyboard-only completion; 200% text zoom with no clipped CTA;
  `aria-label`s on rings/medallions; under-2s first interaction spot-check; bundle not regressed
  (lazy GSAP/KaTeX intact). See §5.3–§5.4.

---

## 4. Cleanup punch-list (incorporates the Phase-2 auditor findings)

Legend: **SAFE-NOW** = no live reference, delete immediately. **AFTER-C** = live only via
call sites that Wave C migrates; delete in Wave D once C lands. **CONFIRM** = verify before deleting.

### 4.1 Orphaned files to delete (verified: zero importers)

| File | Evidence | Mark | Confirmation step |
|------|----------|------|-------------------|
| `src/lesson/konva/CourseSpine.tsx` | no `import … CourseSpine` anywhere; only a comment mention in `CourseJourney.tsx` | SAFE-NOW | `rg "CourseSpine"` → only its own def + comment; also delete any `CourseSpine.test.*` if present |
| `src/lesson/LessonPreview.tsx` | no `import … LessonPreview`; replaced by `CourseJourney` | SAFE-NOW | `rg "LessonPreview"` → only its own def; then `.lesson-preview*` CSS (4.3) is dead too |

> Both are confirmed unreferenced by `rg "import.*CourseSpine|import.*LessonPreview"` → no matches.
> After deleting `LessonPreview.tsx`, also remove the `:root[data-vt='home-lesson'] .lesson-hero-source`
> coupling in `shell.css` **only if** nothing else sets `.lesson-hero-source` (CONFIRM with Part 1 —
> the home→lesson View Transition may still want a hero source on the new journey card).

### 4.2 Unused font dependencies to drop (`package.json` + `package-lock.json`)

`src/main.tsx` imports **only** Space Grotesk, Inter, JetBrains Mono. The other four are unused:

```22:28:package.json
    "@fontsource-variable/fraunces": "^5.2.9",
    "@fontsource/ibm-plex-mono": "^5.2.7",
    "@fontsource/ibm-plex-sans": "^5.2.8",
    "@fontsource/ibm-plex-serif": "^5.2.7",
    "@fontsource/inter": "^5.2.8",
    "@fontsource/jetbrains-mono": "^5.2.8",
    "@fontsource/space-grotesk": "^5.2.10",
```

| Drop | Keep | Mark |
|------|------|------|
| `@fontsource-variable/fraunces`, `@fontsource/ibm-plex-mono`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-serif` | `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk` | SAFE-NOW |

Confirmation: `rg "fontsource|fraunces|ibm-plex" src` returns no `import`/`@import` of the four;
remove the four lines from `package.json`, run `npm install` to update the lock, verify build.
**Honesty note:** these are not bundled today (never imported), so removal is **hygiene**, not a
runtime-perf win — don't claim a bundle reduction in the changelog.

### 4.3 Dead CSS in `src/styles/surfaces/home.css`

The new Ergo Home (`StudyDesk`/`CourseJourney`/`ergo-*.css`) replaced the old study-desk /
graph-node Home, leaving large dead regions. **Verified unused in any `.tsx`** unless noted.

**KEEP (still referenced — do NOT remove):**

| Selector(s) | Used by |
|-------------|---------|
| `.coursepath` (base) + its `@media` | `ProfilePage` wrapper |
| `.appbar`, `.appbar__title`, `.appbar__right`, `.appbar__back` | `ProfilePage` header |
| `.profile`, `.profile__heading`, `.profile__signout` | `ProfilePage` |
| `.lessonloading`, `.skeleton__prompt`, `.skeleton__region` (and base `.skeleton`) | `LessonPage` loading skeleton ⚠ **NOT** old-Home skeleton — keep |
| `.welcome__note` | `WelcomeScreen` |
| `.dev-switcher`, `.dev-switcher__label`, `.dev-switcher__btn`, `--btn--on` | `DevHomePage` |
| base `.streaktally`, `.streaktally__marks`, `.streaktally__label`, `.streaktally--compact`, `svg.streaktally__marks`, `.streaktally__mark--fresh` + `@keyframes tally-stroke-on` | lesson top bar (until Wave C swaps `StreakTally`) → **AFTER-C** |
| base `.seal`, `.seal__ring/__glyph/__title`, `.seal--earned`, `.seal--ghost`, `.seal--stamped` + `@keyframes stamp-press`/`ink-bloom`, `.recap__stamp*` + reduced-motion | `MilestoneSeal` in recap/takeover (until Wave C) → **AFTER-C** |

**REMOVE — SAFE-NOW (no live reference):**

| Selector(s) | Was |
|-------------|-----|
| `.appbar__profile`, `.appbar__avatar`, `.appbar__name` | old Home top-bar profile |
| `.appbar__wordmark` | old Home wordmark |
| `.coursepath__main`, `.coursepath__divider`, `.coursepath__section` | old course-path layout |
| `.habit`, `.habit .streaktally*`, `.habit__status`, `.habit__note` | old habit panel |
| `.seals`, `.seals__label`, `.seals__shelf` (+ `::-webkit-scrollbar`), `.seals__detail`, `.seals__detail-title` | old seal gallery |
| `.desk__main`, `.desk-spine`, `.spine-hit`, `.desk-mobile`, `.rail`, `.rail-hit*` | old desk + Konva spine hit-targets |
| `.node-panel`, `.node-popover`, `.node-card*`, `.node-card__optional`, `.node-card__glyph/__title/__hook/__state/__cta` | old graph-node detail cards |
| `.roadmap`, `.roadmap__node/__dot/__title/__hook/__state` | old roadmap (new journey uses `.ergo-card--roadmap`) — *not in auditor's explicit list; flagged here* |
| old Home skeleton: `.skeleton__tally`, `.skeleton__status`, `.skeleton__seal`, `.seals__shelf--skeleton`, `.desk-skeleton-path`, `.desk-skeleton-dots`, `.skeleton__dot`, `.skeleton__panel` | replaced by `.ergo-skeleton*` |
| `.lesson-preview`, `.lesson-preview--placeholder`, `.lesson-preview__static`, `.lesson-preview__glyph` | dead with `LessonPreview.tsx` (4.1) |
| entire `@media (max-width: 767px) { .desk … }` block | old desk mobile compaction |

**REMOVE — CONFIRM (MilestoneSeal API features with no live caller):**

| Selector(s) | Why CONFIRM |
|-------------|-------------|
| `.seal--button`, `.seal--button:focus-visible`, `.seal--active` | `MilestoneSeal` still *supports* `onClick`/`active`, but no live call site passes them (old gallery used them). Safe once you confirm no future caller; otherwise dies with `MilestoneSeal` in Wave D. |
| `.seal--earning` + `@keyframes seal-ink-ring`/`seal-ink-glyph` | `earning` prop unused at live call sites; dies with `MilestoneSeal` in Wave D |

**SURGICAL — the `@media (resolution >= 2dppx)` block (home.css ~793–826) is MIXED:** keep the
`.appbar`, `.recap__stamp`, `.profile__signout` lines; remove the `.habit`, `.seals__shelf`,
`.node-panel`, `.node-card`, `.node-popover`, `.node-card--focused` lines. Do **not** delete the
whole block.

> After Wave C retires `MilestoneSeal` + `StreakTally`, a follow-up pass deletes all AFTER-C rows
> above. At that point also consider retiring the **legacy token aliases** (`--paper-*`, `--quill`,
> `--rule`, `--graphite`, `--press-deboss`, …) from the Style-Dictionary source — **CONFIRM** first
> with `rg "--paper-0|--quill|--rule|--graphite|--press-deboss" src/styles` returning no surface
> references; this is a token-pipeline change and should be its own small PR.

### 4.4 Stale comments to fix (code comments only — copy is correct)

| File:line | Current | Fix |
|-----------|---------|-----|
| `src/motion/gsapText.ts:1` | "Lazy GSAP SplitText reveal helper for **Fraunces** display headlines." | "…for **Space Grotesk** display headlines." |
| `src/pages/studyDesk.model.ts:29` | "Rendered in **IBM Plex Mono** inside the node dot." | "…in **JetBrains Mono**…" (or drop the node-dot reference if `studyDesk.model` no longer feeds graph nodes — CONFIRM) |
| `src/pages/LandingPage.tsx:29–30` | "GSAP SplitText reveal owns the **Fraunces** hero" | "…owns the **Space Grotesk** hero" |
| `src/habit/milestones.ts:12` | "glyph: string // **IBM Plex Mono** seal glyph (docs/ui_design_system.md Milestones)" | "// **JetBrains Mono** medallion glyph (Ergo medallions)" |

> Out of scope but worth noting (do not edit unless asked): `HANDOFF.md`,
> `docs/build-brief-living-notebook.md`, `docs/home-study-desk.md`, and ADR-0002 reference
> Fraunces/IBM Plex/notebook — these are historical/superseded docs, intentionally left as record.
> `home.css` line 401 ("serif course wordmark — Fraunces") dies with `.appbar__wordmark` (4.3).

---

## 5. Risk register

### 5.1 e2e selector fragility (ranked)

The suite drives by class selectors + accessible names; the restyle's danger is renaming a hooked
node or changing a button label. Ranked most→least fragile:

| Risk | Hooks | Affected specs | Mitigation |
|------|-------|----------------|------------|
| **Completion assertion** | `.done-note` text `"Lesson complete"`; `.actionbar .btn--primary` | `helpers`, `lesson-complete`, `track-a`, `remaining-lessons` | §1.8 — keep node + substring + CTA verbatim |
| **Beat class selectors** (Part 2) | `.token-row`, `.eqline--build .slot`, `.tap-card`, `.numline__range`, `.balance__range`, `.overlap__tap .statechip`, `.statechip`, `.hint-note--mark`, `.answer-entry__input`, `.retgrid__slot/__palette`, `.compare__card`, `.prompt__text` | all lesson specs | Part 2 must preserve these class names while re-tokenizing; restyle ≠ rename |
| **Action-label coupling** | `getByRole('button', {name})` for `Continue`/`Check`/`Flip`/`Finish`/`Reveal recap`/`Step`/`Lock prediction`/`Now your turn`/`/Run \d+/`; radios `/Waiting for HH takes longer/`, `/near-miss resets HH/` | `helpers`, `remaining-lessons`, `smoke` | Do not change button/option **text**; restyle only |
| **VR anchors** | `.ergo-journey` (home), `section.prompt` (lessons) | `vr/surfaces` | Keep `section.prompt` + `.ergo-journey` selectors stable |
| **Marker/streak classes** | `.seal*`, `.streaktally*`, `.recap__stamp`, `.celebration`, `.recap__seal`, `.topbar` | **none asserted** | Free to restyle/rename — but VR-visible (5.2) |

### 5.2 VR re-baseline needs

Config: `playwright.vr.config.ts`, two projects (`vr-desktop` Desktop Chrome, `vr-mobile`
Pixel 5), **both `reducedMotion: 'reduce'`**, `animations: 'disabled'`, full-page,
`maxDiffPixelRatio: 0.02` (tight). Snapshots in `e2e/vr/__screenshots__/{project}/`.

**Snapshots that will drift and need `--update-snapshots`:**

| Snapshot | Project(s) | Why it drifts |
|----------|-----------|---------------|
| `dev-lesson-flagship.png` | vr-desktop, vr-mobile | Waves A+B+C restyle the flagship shell/beats/recap |
| `dev-lesson-penneys.png` | vr-desktop, vr-mobile | Waves A+B restyle L2 shell/beats |
| `dev-home.png` | vr-desktop, vr-mobile | Should be stable, but re-verify — the compact-streak/marker work and any shared `ergo-home.css` edits (medallion sizes) can nudge it |

= **6 PNGs** to re-capture (4 lesson + 2 home re-verify). Procedure (user): land A+B+C+D, run
`playwright test -c playwright.vr.config.ts --update-snapshots`, eyeball the diffs, commit the new
baselines, then a clean verify run. **Do not** re-baseline before the restyle is functionally
complete or you bake in half-migrated frames.

> The global font swap already drifted these once (the current `??` baselines were captured
> post-font-swap, pre-restyle). The restyle drifts them again — budget the re-baseline as a known,
> expected step, not a regression.

### 5.3 Reduced-motion / accessibility checklist

- [ ] Every §1.7 celebration beat has a reduced-motion equivalent; lesson completable at zero motion (reduced-motion e2e project passes).
- [ ] Medallion has `role="listitem"`/`aria-label` (gallery) and an accessible name in the takeover; light-streak is `aria-hidden`.
- [ ] Progress rings expose `aria-valuenow/min/max` + `aria-label` (carry over from journey rings).
- [ ] Compact streak chip keeps `aria-label="${count}-day streak"`.
- [ ] All targets ≥44px (medallions, CTA, back button); chapter color never the sole signal (glyph/letter/text present).
- [ ] Keyboard: focus moves to the return CTA on completion (already wired via `ctaRef`); visible `--ring-focus`.
- [ ] 200% text zoom: takeover + recap CTA not clipped.
- [ ] KaTeX verdict has an `ariaLabel` (already passed in `RecapBeat`).

### 5.4 Performance budget

- Under-2s first interaction held: **lazy-load GSAP** for the light-streak (same dynamic-import
  pattern as `gsapText`); never add GSAP to the entry bundle. KaTeX stays lazy.
- Compositor-only `transform`/`opacity` for the streak + medallion; no layout/`box-shadow`
  animation in loops (medallion earn flashes shadow once, acceptable).
- No per-frame React state during the celebration; no Firestore writes during animation
  (completion already persists on commit, not during the bounce).
- Font weight unchanged by §4.2 (those deps were never imported); the 3 live families are already loaded in `main.tsx`.
- Ambient caps: the landing state-machine signal (Wave E) must pause offscreen/idle/hidden (`useAmbient` already does this).

### 5.5 Rollback note

- **Wave isolation = rollback unit.** Land A, B, C, D, E as **separate commits/PRs**. Reverting a
  wave is then a clean `git revert` of its commit(s).
- **Global-token caveat:** because the legacy aliases are global, a *partial* rollback (e.g. revert
  C but keep A/B) is safe (C only swaps components + marker/streak CSS), but **do not** revert the
  Wave-D alias removal independently of D's CSS deletions — they're coupled. Keep alias removal in
  its own late PR (4.3 note) so it can be reverted alone.
- **Home already shipped**, so a lesson-restyle rollback does not touch Home; `StudyDesk`,
  `WeeklyStreak`, `ConceptMedallion`, `ergo-*.css` stay. The one shared edit is the
  `ConceptMedallion` `size` prop (default `'sm'` keeps Home identical) — safe.
- **Retirement ordering is the trap:** never delete `MilestoneSeal`/`StreakTally` (or their CSS)
  before Wave C migrates their call sites, or the build breaks. The DoD `tsc -b` gate catches this.

---

## 6. Consolidated execution checklist (prioritized)

> One pass, top to bottom. P0 = ship-blocking for "lessons look Ergo"; P1 = required for uniform
> premium bar + hygiene; P2 = nice-to-have polish.

**P0 — lesson interior (Waves A→B→C)**
1. [ ] **A (S1):** migrate `shell.css` + lesson chrome JSX from notebook tokens → Ergo semantic tokens + chapter hue (`data-ch` on `.lesson`); publish `.topbar` right-slot size. *(refs Part 01)*
2. [ ] **B (S2/S3):** migrate all beat components + `beats.css`/`beats-extended.css` + Konva theme to Ergo palette/type/chapter hues; **preserve all beat class selectors** (5.1). *(refs Part 02)*
3. [ ] **C (S4) — shared marker:** add `size` to `ConceptMedallion` (+`--md/--lg` CSS); create `src/lesson/chapters.ts` (`chapterOf`/`chapterHueVar`) single-sourcing the lesson→`chN` map.
4. [ ] **C (S4) — completion takeover:** swap `MilestoneSeal stamped` → `ConceptMedallion size="lg" earning hueVar=…`; add lazy GSAP chapter-color light-streak (`--celebrate-beat`, reduced-motion-omitted); chapter-key the takeover; **keep `.done-note` + "Lesson complete" + `.actionbar .btn--primary`**.
5. [ ] **C (S4) — recap:** remove the unreachable `recap__stamp`/`MilestoneSeal` branch (CONFIRM product); restyle `.recap__seal` to a chapter-tint mono pill.
6. [ ] **C (S4) — streak chip:** extend `WeeklyStreak` `compact` to a top-bar chip (+`.ergo-streak--compact` CSS); render `<WeeklyStreak compact>` in both `LessonPlayer` top bars.
7. [ ] **C — re-tokenize `.done-note`/`.celebration`** (`beats.css`): `--correct-text`→`--ok`/`--ergo-ink`; add streak container styles.

**P1 — cleanup + uniformity (Waves D, E)**
8. [ ] **D (S5):** delete `CourseSpine.tsx` + `LessonPreview.tsx` (+ tests); retire `MilestoneSeal.tsx` + `StreakTally.tsx`.
9. [ ] **D (S5):** remove SAFE-NOW dead `home.css` selectors (4.3) + AFTER-C rows (now safe) + surgical 2dppx block; remove `.lesson-preview*`.
10. [ ] **D (S5):** drop the 4 unused font deps from `package.json` + refresh lock (4.2); fix the 4 stale comments (4.4).
11. [ ] **E (S6):** migrate Landing + Auth (`auth-landing.css`, `LandingPage.tsx`, `AuthPage.tsx`) to Ergo tokens/inputs/card; re-skin the hero state machine to Ch1 + flip-beat signal; verify `ProfilePage` (shared `.btn`/`.field`).

**P1 — gates (per wave + cross-wave)**
12. [ ] Each wave: `tsc -b` + `vite build` + `eslint .` + `vitest run` clean before handoff.
13. [ ] **User:** `playwright test` green across chromium / mobile / reduced-motion after A+B+C.

**P2 — polish + final acceptance (Wave F, user)**
14. [ ] **User:** `playwright test -c playwright.vr.config.ts --update-snapshots` → re-baseline the 6 VR snapshots (5.2); clean verify run.
15. [ ] **User:** reduced-motion (5.3) + keyboard-only completion + 200% zoom + under-2s spot-check; confirm lazy GSAP/KaTeX intact (5.4).
16. [ ] (Optional, separate PR) Retire legacy token aliases from Style-Dictionary once `rg` shows no surface references (4.3 note).

---

### Appendix — quick file map (Part 3 scope)

| Concern | Files |
|---------|-------|
| Completion takeover | `src/lesson/LessonPlayer.tsx` (done block, top bar), `src/lesson/LessonCelebration.tsx` |
| Recap marker | `src/lesson/beats/RecapBeat.tsx`, `.recap__seal`/`.recap__stamp` in `beats.css` + `home.css` |
| Shared marker / streak | `src/habit/ConceptMedallion.tsx`, `src/habit/WeeklyStreak.tsx`, `src/habit/milestones.ts`, `src/styles/surfaces/ergo-home.css` |
| Chapter hue source | new `src/lesson/chapters.ts`; `src/pages/StudyDesk.tsx` (`MILESTONE_HUES`); `src/pages/CourseJourney.tsx` (`data-ch`) |
| Retire | `src/habit/MilestoneSeal.tsx`, `src/habit/StreakTally.tsx`; `.seal*`/`.streaktally*` in `home.css` |
| Cleanup | `src/styles/surfaces/home.css`, `package.json`(+lock), `src/lesson/konva/CourseSpine.tsx`, `src/lesson/LessonPreview.tsx`, stale comments (4.4) |
| Non-home | `src/pages/LandingPage.tsx`, `src/pages/AuthPage.tsx`, `src/styles/surfaces/auth-landing.css` |
| Tests/gates | `e2e/helpers.ts`, `e2e/lesson-complete.spec.ts`, `e2e/remaining-lessons.spec.ts`, `e2e/smoke.spec.ts`, `e2e/vr/surfaces.spec.ts`, `playwright.vr.config.ts` |
