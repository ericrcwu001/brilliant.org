# Mandatory onboarding survey sets a global default track; the per-concept Quick check becomes an optional override

**Status:** Accepted — **not yet built**. This records the design (resolved via a grill-me interview)
that the implementation will follow.

Moving the signed-in home to the Concept Catalog (ADR-0004) stranded the two first-run gates that
previously lived on the single course path: the **welcome screen** and the graded **Quick check**
diagnostic. A brand-new account now lands on the catalog, is never asked about its background, and
starts every concept on the renderer's default track regardless of skill. We replace those stranded
per-concept gates with one **macro onboarding**: a mandatory, four-step self-report survey shown once,
right after display-name capture and before the catalog.

Concretely this locks these choices:

1. **A mandatory first-run gate.** Onboarding runs once after `/onboarding/name`, before the catalog,
   and cannot be skipped or replayed. Completion is recorded as `onboardingCompletedAt` on the user
   doc and gates routing exactly like the display-name step (a new check in `redirectTarget`, driven by
   the already-loaded `userDoc`).
2. **Self-report drives a global default; grading refines per concept.** The survey captures
   **learning goal**, **comfort level**, **focus area**, and **pace**. Comfort level (four steps) maps
   to a **default track** (`A / A / B / B` over the binary A = scaffolded, B = lean). The existing
   graded Quick check is repositioned as an optional, skippable **Calibrate** auto-offered on first
   entry to each concept; its score overrides the default for that concept only.
3. **Two-level track model.** The global default lives on the user doc; per-concept overrides live on
   `users/{uid}/progress/{conceptId}`. Effective track = per-concept override ?? global default. This
   retires the previous single `track` hardcoded on the flagship `COURSE_ID` progress doc.
4. **Profile on the identity doc.** Raw answers (goal, comfort, focus, pace) and derived outputs
   (default track, recommended concept) plus `onboardingCompletedAt` are stored on `users/{uid}`; the
   Firestore rules update-whitelist is widened to these owner-writable, non-progression fields. Answers
   are immutable from the app — difficulty changes only via Calibrate.
5. **Recommendation surfaces on the catalog.** Focus area selects `recommendedConceptId` (first live
   concept in the chosen domain, else the flagship). For a learner with no progress the catalog's
   resume hero becomes a "start here" recommendation, and that domain's shelf floats to the top; a
   coming-soon pick shows the flagship with a "your area is coming soon" note.
6. **Welcome screen retired.** Onboarding is the first-run greeting; the optional L0 introduction
   remains a normal lesson in the flagship path. `welcomeSeenAt` and its helpers are removed.

## Considered options

- **Skippable / dismissible onboarding** (soft gate or a catalog card). Rejected: reliably setting
  every learner's default track before they reach content was the priority, and a hard gate maximizes
  completion of the comfort signal.
- **Self-report only / graded only.** Rejected: self-report alone is low-friction but imprecise for
  difficulty; graded-only (expanding the Quick check into the whole onboarding) is higher-friction and
  captures none of goal/focus/pace. The layered hybrid keeps the survey fast and reuses the existing
  graded Quick check as an opt-in refinement.
- **More than two difficulty tiers.** Rejected: every lesson's beats are authored for exactly Track
  A/B; a third tier means re-authoring the library. Comfort is a four-step input that collapses to the
  binary track.
- **Separate `users/{uid}/profile/onboarding` doc.** Rejected: the routing gate already reads the user
  doc, so a subdoc adds a read and plumbing for no real isolation benefit (these are non-progression
  preference fields).

## Consequences

- New routing gate + screen (`/onboarding/survey`); `redirectTarget` gains an onboarding-complete check
  parallel to the display-name check; a new `completeOnboarding` provider method writes the profile and
  refreshes `userDoc`.
- `track.ts` becomes concept-parameterized (drops the hardcoded `COURSE_ID`); `CoursePathPage` drops the
  welcome branch and treats the Quick check as a skippable Calibrate; `WelcomeScreen.tsx` and
  `welcomeSeenAt` are deleted.
- `firestore.rules` widens the `users/{uid}` update whitelist; a `UserDocSchema` is introduced.
- The catalog model/UI gain a recommended-start hero state and focus-area shelf ordering.
- Funnel analytics added; the Quick check gains its first instrumentation.
- Hard to reverse: the gate, the identity-doc storage shape, and the two-level track model set
  conventions across future concepts; reverting carries UX, bookmark, and data implications.
