# Build Brief — "The Living Notebook" Premium-UI Overhaul (Sub-Agent Team)

**Audience.** A future *orchestrator* agent that will spin up a team of sub-agents to implement the bolder,
cinematic UI overhaul specified in `docs/ui_design_system.md` ("The Living Notebook") end-to-end — token
pipeline, display typography, tactile letterpress depth, choreographed + ambient motion, and the
full-foundational infrastructure (Style Dictionary, CSS Modules, Radix + React Aria, KaTeX) — across every
surface, without regressing the green test baseline.

**How to use this brief.** Read it top to bottom once. Then: (1) **re-verify the live working tree**
([§1](#state)) — it moves fast; (2) freeze the shared contracts in **Wave 0** ([§4](#wave0), [§5](#contracts),
[§6](#catalog)) *before* any parallel work; (3) launch the waves in dependency order ([§3](#team),
[§9](#waves)); (4) hold every sub-agent to the shared conventions ([§7](#conventions)) and the per-wave packets
([§8](#packets)); (5) gate on the verification checklist ([§10](#dod)). **Assign one owner per shared file** —
parallel writes to the same file have raced and clobbered edits in this repo before.

**Source-of-truth documents (read before building):**
- `docs/ui_design_system.md` — **the spec.** "The Living Notebook." Every wave cites a section of it.
- `docs/adr/0002-bolder-living-notebook.md` — *why* we pivoted from restraint to bolder/cinematic, the
  rejected options, and the consequences. Read it so you don't "helpfully" revert toward the old restraint.
- `docs/adr/0001-konva-course-path-spine.md` — the Home spine's Konva + DOM-overlay architecture (Wave 2
  transitions and Wave 1 depth must respect it).
- `docs/home-study-desk.md` — Home/Study-Desk layout (Q1–Q23); mobile divergence.
- `CONTEXT.md` — domain glossary (implementation-neutral; do not put design/impl terms here).
- `HANDOFF.md` — current build state + environment footguns (mirrored in the callout below).

> **⚠ The working tree is under active development — re-verify before building.** State in [§1](#state) is
> "true as of the council audit (2026-06-24)." A Motion 12.41 layer already shipped (5 "wow" moments); the
> entry bundle is a single ~477 KB-gz chunk with **no code-splitting**. `git status` + spot-read the cited
> files before assigning work.

> **🔧 Environment & footguns (these WILL bite — from `HANDOFF.md`).**
> - **Do NOT use `npm run`.** npm 11 + macOS bash 3.2 → `/bin/sh: --: invalid option`. Call binaries
>   directly: `./node_modules/.bin/{vite,tsc,vitest,eslint,playwright}` and `npx tsx scripts/…`.
> - **Never batch parallel `StrReplace` to the same file in one turn** — they race and clobber. One owner,
>   serial edits, per file.
> - **Konva mounts keep `'use no memo'`** (React Compiler) — `StateGraph`, `SimChart`, `BiasChart`,
>   `CourseSpine`, and every new Konva file.
> - **Reduced-motion is layered:** a global `* { …0.01ms !important }` rule (`app.css`) + Motion
>   `<MotionConfig reducedMotion="user">` + the project's own live-updating `src/lesson/useReducedMotion.ts`.
>   GSAP and View Transitions must branch on the same hook; do not delete the global rule.
> - **`.env.development` is gitignored and must exist** or the app white-screens (`getAuth` throws at import).
>   `/dev/lesson` + `/dev/home` bypass Firebase — use them for UI work.
> - **No Java locally** → emulators / `seed` / `test:rules` run only in the human's terminal.
> - **e2e:** `./node_modules/.bin/playwright install chromium`, start Vite manually
>   (`./node_modules/.bin/vite --port 4321 --strictPort`), then `./node_modules/.bin/playwright test`
>   (`reuseExistingServer` picks it up; the config's `webServer` uses the broken `npm run dev`). Run with
>   full permissions (sandbox redirects the browser cache). Kill stale `vite` PIDs if edits don't show.

---

## Table of contents
1. [Current state (verify against the live tree)](#state)
2. [Target & non-negotiables](#target)
3. [The sub-agent team](#team)
4. [Wave 0 — shared foundations (freeze first)](#wave0)
5. [Token, CSS & font contracts to build](#contracts)
6. [Shared primitive catalog (a11y wrappers, depth utils, motion helpers)](#catalog)
7. [Shared conventions (every agent obeys)](#conventions)
8. [Per-wave task packets](#packets)
9. [Waves & dependency graph](#waves)
10. [Definition of done & verification gates](#dod)
11. [Risks & open decisions](#risks)
12. [Provenance](#provenance)

---

<a name="state"></a>
## 1. Current state (true as of the council audit — re-verify against the live tree)

**Do not rebuild what exists.** The bespoke notebook system is substantially implemented; this overhaul
*evolves* it. The council audit (2026-06-24) found:

### 1.1 Already built / reusable
- **Plain-CSS system:** `src/styles/tokens.css` (`:root` custom props) + `src/styles/app.css` (~3,500 lines,
  BEM-ish classes). Components reference `var(--token)`; ~510 `className=` vs ~18 `style={{` (dynamic geometry
  only). Tokens largely match the (old) doc.
- **Three token sources (the central debt):** `tokens.css`, `src/lesson/konva/theme.ts`, `src/motion/tokens.ts`
  — hand-synced (live drift exists: `--mark-wash` 0.22 in CSS vs 0.30 in Konva).
- **Fonts:** self-hosted **static** IBM Plex Sans/Mono/Serif via `@fontsource/*` in `src/main.tsx`. No
  variable fonts, no `font-feature-settings`, no metric fallbacks.
- **Motion (shipped):** `motion` ^12 via `src/motion/{MotionProvider,tokens}.ts` (`LazyMotion` `domMax`,
  `MotionConfig reducedMotion="user"`). 5 "wow" moments (coins, tile hover/press + spring-snap, confetti
  celebration, desk stagger, landing hero). Reduced-motion taken seriously (hook + e2e project).
- **Konva:** `StateGraph`, `SimChart`, `BiasChart`, `CourseSpine` (imperative animation; `'use no memo'`).
- **Routing:** hand-rolled SPA router + auth guard in `src/App.tsx` (no react-router). `/dev/lesson[/:id]` +
  `/dev/home` bypass Firebase.
- **Components:** buttons/inputs/feedback/equation-tiles(tap-only)/slider(native range)/streak/seals/course-
  spine/top-bars/sticky-action-bar all built to the *old* spec.

### 1.2 NOT built — the overhaul's real work (maps to the design doc)
1. **No single token pipeline** → Style Dictionary; collapse the 3 sources. ([§4.1](#wave0), [§5](#contracts))
2. **`app.css` is monolithic** → split into CSS Modules per surface so waves get disjoint file ownership.
   ([§4.2](#wave0))
3. **No display typeface / type craft** → Fraunces variable + metric fallbacks + feature-settings + fluid
   scale. ([§4.3](#wave0), [§5](#contracts))
4. **Flat-by-default** → tactile letterpress/deboss depth tokens + device-pixel hairlines + multiply ink.
   ([§5](#contracts), Wave 1)
5. **Motion is parallel, not choreographed** → one timeline-token clock; one-shot flip "energy packet"
   (today it's a perpetual marquee); streak stroke-on (missing); equation-tile drag layer (missing). ([Wave 2](#packets))
6. **No page/state transitions** → native View Transitions for router morphs. ([Wave 2](#packets))
7. **No ambient motifs** → breathing state machine (landing/home) with caps. ([Wave 2](#packets))
8. **Confetti conflicts with identity** → replace with the wax-seal ink stamp. ([Wave 2](#packets))
9. **No GSAP** → scoped to SplitText display reveals + hero/recap timelines. ([§4.4](#wave0), [Wave 2](#packets))
10. **Native range slider + ad-hoc tooltips** → React Aria hooks + Radix primitives. ([§6](#catalog), [Wave 3](#packets))
11. **No KaTeX** → typeset final results (tiles stay Plex Mono). ([Wave 3](#packets))
12. **Missing screen states** → offline / restoring / retry / failed-write. ([Wave 3](#packets))
13. **Perf debt** → single ~477 KB chunk; `TheorySimChartBeat` writes React state per rAF frame. Code-split +
    lazy seams are a Wave-0 prerequisite (we're about to add font/GSAP/KaTeX weight). ([§4.5](#wave0))

---

<a name="target"></a>
## 2. Target & non-negotiables

**Target:** every surface (landing, auth/onboarding, Study-Desk Home, course path, every lesson beat,
recap/completion) realizes "The Living Notebook" — single-source tokens, Fraunces display tier, tactile
depth, choreographed + ambient motion on one clock, Radix/React-Aria interactive components, KaTeX results,
all screen states — with the **green baseline preserved** and **Playwright visual-regression** locking the
polish.

**Non-negotiables:**
1. **Restraint Rails (design doc §Motion).** Bolder, never gamified: ≤1 cinematic moment per screen; ambient
   motion is low-amplitude and **pauses when hidden/offscreen/idle**; semantic-only color; **no confetti**;
   no urgency timers; confident terse copy.
2. **Performance budget.** Under-2s first interaction. **Code-split routes + lazy-load GSAP / KaTeX / previews**
   (Wave 0 prerequisite); compositor-only animation; **no per-frame React state** during canvas animation;
   static grain; self-hosted **subset** variable fonts with metric fallbacks (no CLS).
3. **Reduced-motion parity.** Every signature, ambient motif, GSAP reveal, and View Transition has a
   reduced-motion equivalent (final frame / fade / instant). The reduced-motion e2e project must stay green.
4. **Do NOT break the contract surface (e2e + a11y).** Keep these selectors/behaviors:
   - The lesson-complete takeover keeps the **"Lesson complete"** text node and **`.done-note`**; only the
     confetti is replaced by the ink stamp.
   - Equation-tile **tap-to-place flow + its e2e selectors stay**; **drag is additive only**.
   - The landing **`.preview__signal`** traveling-quill motif stays (may be re-choreographed).
   - 44px hit targets; `aria-live` for canvas events; visible `:focus-visible`.
   - When migrating the slider/inputs to React Aria, **preserve test hooks** (add stable `data-testid`s if a
     selector must change, and update the e2e in the same PR).
5. **Token names are stable.** Style Dictionary must emit the **existing** `--token` names (as a superset) so
   the split CSS keeps working; new tokens are additive. No mass rename without updating every consumer +
   Konva/motion generators in the same change.
6. **No look-imposing kit.** Radix **Primitives** + React Aria **hooks** only (we own 100% of the CSS). Never
   Radix *Themes*, MUI, Chakra, shadcn, Tailwind, Tremor, Sonner, Lottie, or glassmorphism/gradient kits.
7. **Light-only.** Dark mode stays post-MVP.
8. **Surgical, contract-first, file-ownership respected.** Wave-1+ create new files or edit *their* module;
   shared-file edits route to the owning agent.

---

<a name="team"></a>
## 3. The sub-agent team

Waves in [§9](#waves); **parallel only on disjoint files**. Recommend a strong reasoning model (latest Opus,
e.g. `claude-opus-4-8-thinking-max`) for **Wave 0** (architecture) and **Wave 2** (motion choreography — the
hardest); a capable model is fine for the more mechanical Wave-1 CSS passes **after** contracts are frozen.

| Role | Count | Owns (writes) | Mandate |
|---|---|---|---|
| **Foundations engineer** | 1 (Wave 0, serial) | `style-dictionary/*` (new), generated `tokens.css` + `konva/theme.ts` + `motion/tokens.ts`, `src/styles/**` split into CSS Modules, `src/main.tsx` (fonts/providers), `src/App.tsx` (code-split + error boundaries + transition seam), `src/motion/*`, new `src/ui/*` primitive wrappers, `playwright.config.ts` + VR harness, `package.json` deps | Clear all of [§4](#wave0). **Freeze the contracts** ([§5](#contracts), [§6](#catalog)) — token names/namespaces, CSS layer order + module boundaries, the `--font-display` + timeline-clock tokens, the lazy-load seams, the reduced-motion contract, and the `src/ui/*` component APIs + `data-testid`s — so Waves 1–3 never touch shared infra. |
| **Surface stylist** | 3–4 (Wave 1, parallel) | one CSS Module + its components per surface (Landing/Auth/Onboarding · Home/Study-Desk + habit · Lesson shell + beats + feedback · shared components/tiles) | Apply depth + display type per design doc §Depth/§Typography to **its surface only**. New/owned files only. |
| **Motion choreographer** | 4–6 (Wave 2) | a disjoint motion target each (flip · tiles drag · seal/completion+streak · router transitions+spine · GSAP reveals+ambient · perf fix) | Build the choreography per design doc §Motion against the frozen clock. Shared files (e.g. `App.tsx`, `StateGraph`) have a single owner — see [§8](#packets). |
| **Component & states engineer** | 2–3 (Wave 3) | React-Aria slider/number · Radix wrapper adoption · screen-states · KaTeX + input-error | Migrate behind the frozen `src/ui/*` APIs; preserve a11y + test hooks. |
| **Integration / QA** | 1 (Wave 4, serial) | VR baselines, web-vitals, bundle report, e2e, `HANDOFF.md` | Run the full gate ([§10](#dod)); sign off VR; measure perf. |

**Coordination:** contract-first; one owner per shared file; never batch parallel `StrReplace` to one file;
each agent runs its verification subset ([§10](#dod)) and reports green/red with the VR diff for its surface.

---

<a name="wave0"></a>
## 4. Wave 0 — shared foundations (freeze before any surface work)

Owner: Foundations engineer, **serial**. Recommended internal order: **token pipeline → CSS-module split →
fonts → GSAP/KaTeX install + lazy seams → code-split + error boundaries → `src/ui/*` primitives → VR harness.**
Each item ends green on `./node_modules/.bin/tsc -b`, `eslint .`, `vitest run`, `vite build`, and the existing
`e2e`. **First action: `git status` + confirm what already landed** (a Motion layer exists; re-use it).

**4.1 Token pipeline (Style Dictionary) — single source.** Author DTCG tokens; emit three artifacts from one
source: (a) `tokens.css` custom properties (the **existing names**, plus the new display/depth/timeline tokens
from [§5](#contracts)); (b) the resolved `konva/theme.ts` values; (c) the `motion/tokens.ts` durations/eases/
springs + the master clocks. Delete the hand-sync; fix the `--mark-wash` 0.22/0.30 drift at the source. **Gate:**
generated files byte-stable across reruns; no component references a literal hex/duration.

**4.2 Split `app.css` into CSS Modules per surface (behavior-preserving).** Carve the monolith into modules so
Wave 1+ own disjoint files: `shell` (lesson shell, top bars, action bar), `beats`, `home` (study-desk),
`habit` (streak/seals), `auth-landing`, `components` (buttons/inputs/feedback/tiles/slots/tooltip), plus a
global `base` layer. Keep **class names stable** (components reference them) or migrate a component to its
module + class in the same edit. Wrap in **cascade layers** (`@layer tokens, base, surface, components,
utilities`) and register animatable custom props with **`@property`**. **Gate:** zero visual diff (this is the
pre-change VR baseline — see §4.7); `tsc/lint/build/e2e` green.

**4.3 Fonts — variable + Fraunces + no-shift fallbacks.** Self-host variable IBM Plex Sans/Mono (+ Fraunces
variable) and two static Plex Serif weights via Fontsource in `main.tsx`; **subset Fraunces** to the display
set. Add metric-adjusted fallback `@font-face`s (Capsize/Fontaine values) and the `--font-display` token.
Choose `font-display: optional` (body) / `swap` + overrides (elsewhere). **Gate:** no CLS on font swap
(measure); `--font-display` resolves to Fraunces.

**4.4 Install GSAP + KaTeX behind lazy seams.** Add `gsap` (+ `@gsap/react`, SplitText) and `katex`; expose
**lazy-loaded** helpers (`src/motion/gsapText.ts`, `src/lesson/Katex.tsx`) that no-op/await import on demand and
**branch on `useReducedMotion`**. Do not import either eagerly anywhere. **Gate:** GSAP/KaTeX are in separate
chunks; entry bundle does not grow on routes that don't use them.

**4.5 Code-split routes + error boundaries + transition seam.** In `App.tsx`, lazy-import page components
(Landing/Auth/Onboarding/StudyDesk/Lesson/Profile/Dev) with `Suspense` (notebook hairline skeletons, not
spinners); add error boundaries; and add the **View Transition seam** (a `navigate()` wrapper that calls
`document.startViewTransition` when available + reduced-motion-off). **Gate:** route chunks split (bundle
report); first-route TTI improves; `e2e` green.

**4.6 `src/ui/*` primitive wrappers (freeze the API).** Build token-dressed wrappers over Radix Primitives
(`Tooltip`, `Dialog`, `DropdownMenu`, `Popover`, `Tabs`, and an inline status — **not** a toast) and React Aria
hooks (`useSlider`, `useNumberField`) styled with `data-*`. Define their props + stable `data-testid`s. These
are consumed in Wave 3 (and replace the `.infotip` CSS tooltip). **Gate:** Storybook-less smoke render +
keyboard/focus test per primitive; APIs documented in the file headers.

**4.7 Visual-regression harness (baseline BEFORE changes).** Add a Playwright VR project that snapshots the
key surfaces at desktop + mobile, light + **reduced-motion**, off `/dev/home` and `/dev/lesson[/:id]`
(Firebase-less). Capture the **current** look as the baseline so every later wave reviews an intended diff.
**Gate:** VR runs in CI-style locally; baseline committed; the surface list documented for Wave 1–3 owners.

---

<a name="contracts"></a>
## 5. Token, CSS & font contracts to build (freeze in Wave 0)

All emitted by the pipeline ([§4.1](#wave0)); **names are the contract** — Waves 1–3 consume, never redefine.

```css
/* Display typography (design doc §Brand Voice & Typography) */
--font-display: "Fraunces", "IBM Plex Serif", Georgia, serif;   /* variable; opsz; low SOFT/WONK */
/* fluid display tiers applied via clamp() utilities, not raw sizes in components */

/* Tactile depth & letterpress (design doc §Depth, Letterpress & Texture) */
--paper-shadow-1: 0 1px 2px rgba(27,34,48,0.06);   /* alias of legacy --e1 */
--paper-shadow-2: 0 6px 16px rgba(27,34,48,0.12);  /* alias of legacy --e2 */
--paper-shadow-3: 0 16px 40px rgba(27,34,48,0.14); /* cinematic, sparingly */
--press-deboss:   inset 0 1px 2px rgba(27,34,48,0.14);
--edge-highlight: 0 1px 0 rgba(255,255,255,0.55);
--letterpress-ink: 0 1px 0 rgba(255,255,255,0.5);  /* text-shadow on pressed ink */

/* Motion timeline clock (design doc §Motion → Timeline tokens) */
--dur-micro:120ms; --dur-base:200ms; --dur-slow:360ms; --dur-tell:600ms;
--ease-out:cubic-bezier(.2,.7,.2,1); --ease-spring:cubic-bezier(.2,1.2,.3,1); --ease-inout:cubic-bezier(.5,0,.2,1);
--flip-beat:520ms;   /* coin(0) → node pulse(~80ms) → edge packet(~120ms→end) */
--stamp-beat:480ms;  /* seal press + ink bloom */
```

- **`--e1`/`--e2` remain as aliases** of `--paper-shadow-1/2` during migration.
- **Existing color/spacing/radius tokens keep their exact values** (design doc §Color & Ink, §Spacing). Tints
  may be authored in `oklch()` with hex fallback; **no new hues** (deepen via depth, not saturation).
- **CSS layers** order: `tokens, base, surface, components, utilities`. **Device-pixel hairlines** utility:
  `1px` → `0.5px` at `@media (resolution >= 2dppx)`; Konva mirrors via `pixelRatio`.
- **Motion JS mirror** (`motion/tokens.ts`) and **Konva theme** are generated from the same source and import
  the clock; the Konva imperative layer must consume `--flip-beat`/`--stamp-beat` (no magic `0.12`/`0.2`/`14`/
  `600`).

---

<a name="catalog"></a>
## 6. Shared primitive catalog (build in Wave 0, consume later)

Located under a new `src/ui/*`. Token-dressed, look-neutral, accessible. **Freeze the props/`data-testid`s.**

| Primitive | Built on | Replaces / used by | Notes |
|---|---|---|---|
| `Tooltip` | Radix Tooltip | the `.infotip` CSS bubble (tiles, placed tokens) | paper fill, hairline, `--paper-shadow-2`; respects touch (tap-open). |
| `Dialog` / `Popover` / `DropdownMenu` | Radix | profile menu, any future overflow menus | dressed via `data-*`; no SaaS chrome. |
| `Tabs` | Radix | future segmented controls | optional; only if a surface needs it. |
| `StatusNote` | plain DOM | inline/margin-note status | **NOT a toast** (no drop-shadow card); used by offline/failed-write. |
| `useSliderControl` | React Aria `useSlider` | `.numline` (SliderBeat) + bias slider | keep the number-line visuals; bespoke thumb/ticks/marker. |
| `useNumberFieldControl` | React Aria `useNumberField` | any numeric input | optional. |
| `Katex` | `katex` (lazy) | typeset results (RecapBeat/results) | `katex.renderToString` into a memoized component; **tiles stay Plex Mono**. |
| `gsapText` | GSAP SplitText (lazy) | Fraunces hero/section reveals | timeline from the clock; reduced-motion → no split, plain fade. |
| `depth` utilities | CSS | seals, tiles, buttons, cards | `.deboss`, `.letterpress`, `.paper-card`, `.hairline` (device-pixel). |
| `useAmbient` | hook | breathing motifs | pauses on `visibilitychange`, `IntersectionObserver` offscreen, and idle; off under reduced motion. |

---

<a name="conventions"></a>
## 7. Shared conventions (every agent obeys)

1. **Spec is `docs/ui_design_system.md`.** Cite the section you implement in your PR/summary. Don't drift back
   toward the old restraint (read `docs/adr/0002`).
2. **Files:** edit only your owned module/files; shared-infra changes route to Foundations; **never batch
   parallel `StrReplace` to one file.**
3. **Tokens only.** No literal hex/px/duration in components — consume `var(--token)` / the JS clock. New
   tokens are requested from Foundations, never inlined.
4. **Konva:** `'use no memo'`; palette + clock from generated theme; imperative animation, **no per-frame React
   state**; reduced-motion final frame + `aria-live`; `pixelRatio` hairlines; commit-on-interaction-end.
5. **Motion discipline:** compositor-only (`transform`/`opacity`); one cinematic moment per screen; ambient via
   `useAmbient` with caps; every motion has a reduced-motion branch.
6. **Don't break the contract surface** ([§2](#target).4): keep e2e selectors, the "Lesson complete" node,
   `.done-note`, the tile tap path, `.preview__signal`, 44px, focus rings. If a selector must change, update
   the e2e in the same change and add a stable `data-testid`.
7. **Tests with every unit:** `tsc`/`lint`; the **reduced-motion** path; and a **VR snapshot review** for any
   visual change (intended diff, signed off). Touch a tested behavior → keep/extend its e2e.
8. **Perf:** lazy-load heavy deps; keep route chunks split; subset fonts; no eager GSAP/KaTeX import; verify
   the bundle report didn't regress.
9. **Copy voice:** confident, terse, precise; align landing/recap copy to the design doc; no marketing
   exuberance, no points-juice.

---

<a name="packets"></a>
## 8. Per-wave task packets

Deps green first. Each packet's DoD = the shared gates ([§10](#dod)) + the lines below. Owners are disjoint by
file; shared files name a single owner.

### Wave 1 — Depth & Type (parallel by surface) — design doc §Depth, §Typography, §Color
> Prereq: Wave 0 done (tokens, CSS modules, fonts, VR baseline). Each owner edits **its** CSS module + its
> components only.

- **W1-A · Landing / Auth / Onboarding.** Fraunces display on the landing headline (static here; the reveal is
  Wave 2) + section moments; tactile depth on auth card + inputs; device-pixel hairlines. Files:
  `auth-landing` module, `LandingPage.tsx`, `AuthPage.tsx`, `DisplayNamePage.tsx`. **DoD:** VR diff = intended;
  no CLS; landing copy matches doc.
- **W1-B · Home / Study-Desk + habit.** Deboss the seals + habit panel + node cards; display type on section
  labels; depth on detail panels (respect ADR 0001 Konva/DOM overlay — DOM panels only). Files: `home` +
  `habit` modules, `StudyDesk.tsx`, `src/habit/{StreakTally,MilestoneSeal}.tsx`. **DoD:** spine geometry untouched;
  VR diff intended.
- **W1-C · Lesson shell + beats + feedback.** Depth on prompt/cards/feedback strip; display type on
  prompt/recap; hairlines on bars. Files: `shell` + `beats` modules, `BeatShell.tsx`, `FeedbackStrip.tsx`,
  beat views (CSS/class only — no behavior change). **DoD:** all beats render; e2e green; VR intended.
- **W1-D · Shared components + tiles (rest state).** Letterpress on buttons + equation tiles (rest) + slots;
  input error rule scaffolding (CSS only; React-Aria wiring is Wave 3); display-type utilities. Files:
  `components` module, button/tile/slot classes. **DoD:** buttons get press/deboss micro-interaction;
  tile **tap flow unchanged**; VR intended.

### Wave 2 — Motion Choreography (mostly parallel; shared files single-owned) — design doc §Motion, §Konva
> Prereq: Wave 0 clock + Wave 1 surfaces. Consume `--flip-beat`/`--stamp-beat`; every item ships a
> reduced-motion branch and a VR (reduced-motion project) check.

- **W2-A · The synchronized flip (shared flip files — single owner).** One clock drives coin spring + node
  pulse + a **one-shot edge "energy packet"** (∅→H→HH), replacing the perpetual dash marquee. Files:
  `CoinSimBeat.tsx`, `CoinStream.tsx`, `konva/StateGraph.tsx`. **DoD:** edge animates **once per flip**;
  reduced-motion = instant state; e2e `simulate` beat green; the home/landing previews read on the same cadence.
- **W2-B · Equation-tile drag layer (additive).** Lift (`--paper-shadow-2`, ~1.04, slight rotate) + press into
  slot (spring + deboss). **Tap-to-place + its e2e selectors stay**; drag is the enhancement (Konva active
  layer or DOM, commit on drag-end). Files: `EquationTilesBeat.tsx` + tile components. **DoD:** tap e2e
  unchanged; drag works mouse + reduced-motion-safe; no Firestore during drag.
- **W2-C · Seal stamp + completion + streak.** Replace confetti with the wax-seal **ink stamp** (`--stamp-beat`:
  impact + ink bloom + deboss) — **keep the "Lesson complete" node + `.done-note`**; add streak **stroke-on**
  increment. Files: `LessonCelebration.tsx`, `RecapBeat.tsx`, `src/habit/MilestoneSeal.tsx`, `src/habit/StreakTally.tsx`,
  remove the `.confetti*` CSS. **DoD:** completion e2e green; reduced-motion = fade; no colored bits.
- **W2-D · Router transitions + spine traversal (shared `App.tsx` — single owner).** Wire View Transitions
  (home↔lesson, beat↔beat) onto the Wave-0 seam; spine focus travels before entering a lesson (respect ADR
  0001). Files: `App.tsx`, `LessonPlayer.tsx`/shells, `StudyDesk.tsx`/`CourseSpine.tsx` (overlay only). **DoD:**
  transitions gated by support + reduced-motion; no a11y/focus regressions; e2e green.
- **W2-E · GSAP reveals + ambient motifs.** SplitText reveals on Fraunces headlines (landing, recap) via the
  lazy `gsapText`; breathing state-machine ambient on landing + Home focused preview via `useAmbient` (caps).
  Files: `LandingPage.tsx`, `RecapBeat.tsx`, `LessonPreview.tsx`. **DoD:** GSAP lazy-loaded; ambient pauses
  offscreen/hidden/idle; reduced-motion = static; `.preview__signal` preserved.
- **W2-F · Perf fix (no per-frame React state).** Convert `TheorySimChartBeat` rAF→`setState` sweep to an
  imperative Konva tween or ≤30fps batch. Files: `beats/TheorySimChartBeat.tsx`, `konva/SimChart.tsx`. **DoD:**
  no per-frame React commits; convergence still reads; e2e green.

### Wave 3 — Components, States & Math (parallel) — design doc §Component Specs, §Screen States, §Math
> Prereq: Wave 0 `src/ui/*`. Migrate **behind** the frozen APIs; preserve a11y + test hooks.

- **W3-A · React-Aria slider/number.** Reimplement the number-line slider + bias slider on `useSliderControl`;
  keep visuals + the `--mark` lock marker. Files: `SliderBeat.tsx`, `BiasSandboxBeat.tsx`, slider CSS. **DoD:**
  keyboard/drag/touch correct; locked-prediction marker flows to the chart; e2e (add `data-testid`s + update).
- **W3-B · Radix adoption.** Swap the `.infotip` tooltips → `ui/Tooltip`; profile menu → `ui/DropdownMenu`;
  any dialog → `ui/Dialog`. Files: consuming components + remove dead `.infotip*` CSS. **DoD:** focus/escape/ARIA
  correct; VR intended.
- **W3-C · Screen states.** Build offline banner, "Restoring your work…" prompt, inline `Retry` ghost, and
  failed-write recovery via `ui/StatusNote`. Files: `snapshot.ts`, `LessonPage.tsx`, `CoursePathPage.tsx`, app
  shell. **DoD:** each state reachable + styled to spec; writes stay non-blocking.
- **W3-D · KaTeX results + input error.** Lazy `ui/Katex` for typeset final equations (recap/results); the
  input **error rule** state (`--wrong` bottom rule + helper). Files: `RecapBeat.tsx`/results, `AuthPage.tsx` +
  field CSS. **DoD:** KaTeX lazy-chunked; tiles unchanged; error state shows field-level treatment.

### Wave 4 — Integration & QA (serial)
- VR sign-off across all surfaces (light + reduced-motion, desktop + mobile); **web-vitals** + **bundle report**
  vs the under-2s budget; full e2e (all 3 projects) + `validate` + `lint` + `build`; update `HANDOFF.md`. **DoD:**
  [§10](#dod) fully green; perf measured and within budget; VR baselines updated to the new intended look.

---

<a name="waves"></a>
## 9. Waves & dependency graph

**Wave 0 (serial):** token pipeline → CSS-module split (+ `@layer`/`@property`) → fonts (variable + Fraunces +
fallbacks) → GSAP/KaTeX install + lazy seams → route code-split + error boundaries + transition seam →
`src/ui/*` primitives → VR baseline. *Everything downstream depends on the frozen contracts.*

**Wave 1 (parallel, disjoint CSS modules):** Landing/Auth · Home/Study-Desk+habit · Lesson shell/beats ·
shared components/tiles.

**Wave 2 (parallel; shared files single-owned):** flip (A) · tiles drag (B) · seal/completion/streak (C) ·
router transitions/spine (D, owns `App.tsx`) · GSAP reveals/ambient (E) · perf fix (F). *A must land before the
home/landing previews adopt the cadence; D owns `App.tsx` alone.*

**Wave 3 (parallel):** React-Aria slider (A) · Radix adoption (B) · screen-states (C) · KaTeX+input-error (D).

**Wave 4 (serial):** integration, VR sign-off, perf, full gate, HANDOFF.

Order rationale: **Wave 0 must split `app.css` and freeze tokens first** — otherwise Wave-1 surface agents
collide on the monolith and redefine tokens. Type/depth (static) precede motion (you choreograph what exists).
Components/states ride on the Wave-0 primitives.

---

<a name="dod"></a>
## 10. Definition of done & verification gates

**Commands (call binaries directly — `npm run` is broken here):**
`./node_modules/.bin/tsc -b` · `./node_modules/.bin/eslint .` · `./node_modules/.bin/vitest run` ·
`./node_modules/.bin/vite build` · (e2e) `./node_modules/.bin/playwright install chromium` then start Vite
manually (`./node_modules/.bin/vite --port 4321 --strictPort`) and `./node_modules/.bin/playwright test` ·
`npx tsx scripts/validate-fixtures.ts`. Emulator-gated (`seed`, `test:rules`) run in the human's terminal.

**Per unit:** `tsc -b` · `eslint .` · the relevant `vitest`; **a VR snapshot review** for any visual change
(intended diff, signed off); the **reduced-motion** path exercised.

**Baseline to preserve (must stay green throughout):** **133 app + 7 functions** vitest; **42 e2e** across the
3 projects (chromium + mobile + **reduced-motion**); `validate`; `lint`; `build`. No regression in any.

**Overhaul gates (new):**
- **Single token source:** `tokens.css` + `konva/theme.ts` + `motion/tokens.ts` are **generated**; no literal
  hex/duration in components; `--mark-wash` drift gone.
- **Restraint Rails honored:** ≤1 cinematic moment/screen; ambient pauses offscreen/hidden/idle; no confetti;
  every motion has a reduced-motion branch (reduced-motion e2e green).
- **Performance:** routes code-split; GSAP/KaTeX/previews lazy-chunked; fonts subset + metric fallbacks (no
  CLS); no per-frame React state in canvas animation; **web-vitals within the under-2s first-interaction
  budget** (measured, reported).
- **Contract surface intact:** "Lesson complete" node + `.done-note` + tile tap e2e + `.preview__signal` + 44px
  + focus rings preserved; any changed selector has an updated e2e + `data-testid`.
- **VR:** baselines updated to the new intended look across all surfaces (light + reduced-motion, desktop +
  mobile).

---

<a name="risks"></a>
## 11. Risks & open decisions (escalate to the human)

1. **Scope.** This is a full-foundational overhaul (new typeface, depth language, second animation lib, token
   pipeline, component migration, CSS restructure). If time-boxed, ship **Wave 0 + Wave 1** (single-source
   tokens + depth + type) for an immediate premium lift; Waves 2–3 are independently shippable behind it.
2. **`app.css` split is the critical path + highest-risk step.** A behavior-preserving carve of ~3,500 lines is
   error-prone; the VR baseline (§4.7) must exist **before** it, and the split lands as its own reviewed change.
3. **Token rename temptation.** Do **not** rename existing tokens; emit them as a superset. A rename touches
   `app.css` + every component + both generators — out of scope unless explicitly approved.
4. **Perf vs. ambition.** Fraunces + GSAP + KaTeX + Radix + React Aria add weight against an already-large
   single chunk. Code-splitting and subsetting are prerequisites, not nice-to-haves; measure web-vitals before
   declaring done.
5. **e2e fragility on migration.** React-Aria slider + Radix tooltips/menus change DOM structure; preserve or
   re-issue stable `data-testid`s and update e2e in the same change, or expect red.
6. **Fraunces vs Newsreader** (and the `SOFT`/`WONK` settings) is a brand call — default Fraunces; flip
   `--font-display` if the human prefers classic-literary.
7. **Ambient "alive" vs "serious."** Tune amplitude/period conservatively; the human should sign off the
   landing/home ambient against the "not a game" bar.
8. **Confetti removal** changes the celebration's feel; confirm the ink-stamp lands emotionally (it keeps the
   e2e text node, so tests are safe).

---

<a name="provenance"></a>
## 12. Provenance
- Spec: `docs/ui_design_system.md` ("The Living Notebook"). Pivot rationale: `docs/adr/0002-bolder-living-notebook.md`.
- Home/spine architecture: `docs/home-study-desk.md`, `docs/adr/0001-konva-course-path-spine.md`.
- Council audit (2026-06-24): 2 codebase crawls (implementation/tokens; motion/Konva) + 2 web-research agents
  (premium libraries; references/skills) — findings folded into the design doc's gap list and this brief's §1.
- Code state read across `src/styles/{tokens,app}.css`, `src/main.tsx`, `src/App.tsx`, `src/motion/*`,
  `src/lesson/**` (incl. `konva/*`, `habit/*`, `beats/*`, `useReducedMotion.ts`, `snapshot.ts`), `src/pages/*`,
  `package.json`, `playwright.config.ts`, `e2e/*`.
- Environment footguns + green baseline: `HANDOFF.md`.
