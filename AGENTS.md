# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

After each response, update HANDOFF.md. This doesn't mean to make it longer, but just to update the session state.

## Cursor Cloud specific instructions

This is a single product: **Ergo**, a React 19 + Vite frontend backed by the Firebase Emulator Suite (Auth, Firestore, Functions). The local dev loop never touches real cloud resources. Standard commands live in `README.md` ("Commands" table) and `package.json` scripts — use those; only the non-obvious caveats below matter for getting it running.

Dependencies (root + `functions/`) are refreshed automatically by the startup update script, so you do not need to run `npm install` yourself.

**Required local config (`.env.development`) — gitignored, so it will not exist on a fresh checkout.** The app's auth init connects to emulators only when `VITE_USE_EMULATORS=true`; without this file the dev server tries to reach real Firebase and hangs/breaks. Create it once before running anything:

```bash
cat > .env.development <<'EOF'
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=brilliant-org.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=brilliant-org
VITE_FIREBASE_STORAGE_BUCKET=brilliant-org.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
VITE_FIREBASE_MEASUREMENT_ID=
VITE_USE_EMULATORS=true
VITE_FIREBASE_APPCHECK_SITE_KEY=
EOF
```

Values are placeholders — the Emulator Suite does not validate them. Keep `projectId=brilliant-org` (matches `.firebaserc` + `singleProjectMode`).

**Startup ordering (matters):**
1. Build Cloud Functions first: `npm run build --prefix functions`. The Functions emulator loads compiled `functions/lib/`; without this it won't register `completeLesson`/etc.
2. Start emulators: `npx firebase emulators:start` (Java is required and present; Auth :9099, Firestore :8080, Functions :5001, UI :4000, Hosting :5000). Start these **before** loading the app — auth init hangs if the page loads before emulators are reachable.
3. Seed Firestore: `npm run seed` (idempotent; the app shows "not found" if content isn't seeded).
4. Start the dev server: `npm run dev` (Vite on :5173).

**Gotchas:**
- Emulator startup prints `MetadataLookupWarning`/`gcp-metadata`/"not authenticated"/"Unable to fetch project Admin SDK configuration" noise — harmless; the emulators still come up ("All emulators ready").
- `npm run lint` currently fails on **pre-existing** errors confined to `interviews/_build/*.ts` (unused vars, `any`). Not caused by setup; `npm test` (Vitest, ~1100 tests) is green.
- Auth uses the emulator, so you can sign up with any fake email/password (no verification) when testing flows.