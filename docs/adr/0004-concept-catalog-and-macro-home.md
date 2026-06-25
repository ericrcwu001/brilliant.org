# Signed-in home becomes the Concept Catalog; UI "concept" maps to Firestore `courses/{id}`

**Status:** Accepted

The product has grown beyond a single course. The signed-in `/` route previously landed
directly on the learning journey for one hardcoded course (`COURSE_ID`), and within-concept
chapters + lesson glyphs were hardcoded constants. Three converging needs drive this change:
(1) a **macro navigation layer** is required so learners can discover and switch between
concepts; (2) a **vocabulary split** is needed — the learner-facing word is *concept*, but the
codebase and Firestore already use `courses/{id}` and a rename without migration would be
costly and fragile; (3) **data-driven chapters and glyphs** are required so the lesson factory
can ship new concepts without any UI code changes.

Concretely, this decision locks five interconnected choices:

1. **Routing.** Signed-in `/` = the Concept Catalog (macro home); each concept opens at
   `/concept/:conceptId`; `/path` redirects to `/` for back-compatibility.
2. **Vocabulary.** The product/UI word is *concept*; the codebase and Firestore stay
   `courses/{id}` — no data migration, no rename of the collection.
3. **Catalog source of truth.** `getDocs('courses')` — each concept doc self-describes its
   catalog card via optional fields (`domain`, `domainOrder`, `order`, `status`, `tagline`,
   `accent`, `vizKey`, `chapters[]`). No separate catalog index document.
4. **Coming-soon stubs.** A stub course doc with `status: 'coming_soon'` and no lessons is
   listed in the catalog as a muted, non-enterable card — visible for direction-setting.
5. **Data-driven within-concept structure.** Within-concept chapters and lesson glyphs/viz
   are read from the course/lesson docs; the hardcoded `ERGO_CHAPTERS`, `LESSON_GLYPHS`, and
   `LESSON_VIZ` constants are retired.

**Layout (Layout C):** a "Continue learning" resume hero + domain-grouped horizontal carousels
(chevrons on desktop, swipe + peeking card on mobile, full keyboard / ARIA, `aria-valuenow`
rings, reduced-motion safe). Selecting a concept triggers a shared-element View Transition
(`concept-open`) that morphs the catalog card thumbnail + title into the concept page header;
chapter color carries; reduced-motion falls back to a plain fade.

Full UI spec: `docs/ui_design_system.md` § Concept Catalog / Macro Home.
Glossary: `CONTEXT.md` entries for Concept, Domain, Macro home, Per-concept path,
Coming-soon concept.

## Considered options

- **Separate `catalog` index doc** — a single Firestore document listing all concepts and
  their order. Rejected: adds a second write target every time a concept ships and drifts out
  of sync with the course docs; self-describing course docs remain the single source of truth
  at the cost of optional fields on every doc.
- **Gallery layout (A) — flat card grid, no domain grouping.** Rejected: no domain-level
  scannability; a flat list becomes hard to navigate as concept count grows and gives no
  information about how concepts relate to each other.
- **Path / roadmap layout (B) — vertical cross-concept roadmap.** Rejected: blurs concept
  boundaries; doesn't compose cleanly for independent or parallel-domain concepts; forces a
  linear framing onto what is intentionally a multi-domain catalog.
- **Hardcoded chapters + glyphs per concept (separate UI code per new concept).** Rejected:
  every factory-built concept would require a UI code change; data-driven achieves
  zero-additional-code-per-concept shipping.

## Consequences

- A new signed-in home (`ConceptCatalogPage` + `ConceptCatalog`) replaces the direct-to-
  journey entry. The per-concept learning screen moves to `/concept/:conceptId`; `/path` is
  kept as a redirect for bookmarks and back-compat.
- `ERGO_CHAPTERS`, `LESSON_GLYPHS`, and `LESSON_VIZ` constants are retired; equivalents live
  in the course doc's `chapters[]` and in the lesson nodes' `glyphKey`/`vizKey` fields.
- The lesson-factory contract (`artifacts.md`) is updated: a factory-built concept must emit
  the full catalog-card fields and chapters; it auto-registers in the macro catalog when
  seeded — zero UI code required.
- Firestore `courses` collection requires `list` permission; security rules are updated.
- `CONTEXT.md` gains: Concept, Domain, Macro home / Concept catalog, Per-concept path,
  Coming-soon concept, Beat.
- Hard to reverse: the routing change has UX and bookmark implications; the
  product-vs-persistence vocabulary split sets a naming convention across all future concepts.
