# Phase 0 — Infrastructure

> Part of [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md). Shared contracts: [spec index](./README.md).

**Status:** Planned — not yet built.

---

## Goal

Lay the three prerequisites that every other phase depends on: (1) hosting headers that grant microphone permission and let the browser reach `api.openai.com`, (2) the `OPENAI_API_KEY` Functions secret, and (3) a mechanism that places validated interview pack JSON inside the deployed Functions runtime at `firebase deploy` time.

---

## Scope

**In scope**

- `firebase.json` hosting header changes (`Permissions-Policy`, `connect-src`)
- `OPENAI_API_KEY` secret provisioning in both Firebase projects (out-of-band, user-run)
- Functions dependency audit (no new runtime deps in P0)
- Pack→functions bundling: predeploy copy step + runtime loading contract

**Out of scope**

- The `defineSecret` call-site and callable definitions → [Phase 1](./phase-1-cloud-functions.md)
- The Zod `InterviewPackSchema` used to parse the copied pack → [Phase 2](./phase-2-interview-pack-content.md)
- App Check enforcement implementation → [Phase 1](./phase-1-cloud-functions.md)
- All client code, WebRTC, and UI → [Phase 3](./phase-3-realtime-client.md) / [Phase 4](./phase-4-orb.md)
- Firestore rules for interview subcollections → [Phase 5](./phase-5-report-persistence-and-ctas.md)

---

## Dependencies & what this unblocks

**Depends on:** nothing — P0 is the first phase.

**Unblocks:**
- [Phase 1](./phase-1-cloud-functions.md) — needs the secret provisioned and the pack copy step in place
- [Phase 2](./phase-2-interview-pack-content.md) — needs the bundling contract defined so P2A's validated packs target the right destination
- All remaining phases depend on P0 being complete

---

## Detailed design

### 1. `firebase.json` — Hosting headers

**Scope:** `firebase.json:14-15` (the `headers` array on `source: "**"`).

These headers are only served by **Firebase Hosting** (the deployed site). The local Vite dev server (`vite`) does not apply them; `/dev/*` harnesses are unaffected.

#### (a) `Permissions-Policy` — unblock the microphone

**Current** (`firebase.json:14`):
```
"Permissions-Policy": "camera=(), microphone=(), geolocation=()"
```

`microphone=()` is a **hard-block**: it prevents `navigator.mediaDevices.getUserMedia({ audio: true })` from resolving on _any_ origin, including the page's own origin. The interview's WebRTC connection (see [README Appendix A §2](./README.md#2-browser-webrtc-connection)) requires the mic.

**New value:**
```
camera=(), microphone=(self), geolocation=()
```

`microphone=(self)` grants mic permission only to the same origin (`brilliant-org.web.app`). Camera and geolocation remain fully blocked.

> **Verify note:** Some browsers require an explicit origin in the allowlist rather than the `self` keyword (e.g. `microphone=("https://brilliant-org.web.app")`). Confirm with DevTools → Application → Permissions Policy after a `firebase deploy --only hosting`.

#### (b) `Content-Security-Policy` — add `https://api.openai.com` to `connect-src`

**Current `connect-src`** (full value, `firebase.json:15`):
```
connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://*.run.app https://*.firebaseio.com wss://*.firebaseio.com https://www.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com
```

The browser `fetch()`-posts the raw SDP offer to `https://api.openai.com/v1/realtime/calls` (see [README Appendix A §2](./README.md#2-browser-webrtc-connection)). Without `https://api.openai.com` in `connect-src` this POST is blocked by the browser before it leaves the page.

**New `connect-src`** (append `https://api.openai.com`):
```
connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://*.run.app https://*.firebaseio.com wss://*.firebaseio.com https://www.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.openai.com
```

All other CSP directives stay unchanged. The rest of the existing header set (`HSTS`, `X-Frame-Options`, etc.) at `firebase.json:10-13` is not touched.

> **Deployment:** both changes require `firebase deploy --only hosting`; they cannot be verified locally. Use the Node v24.3.0 `firebase` alias (HANDOFF env gotchas).

---

### 2. `OPENAI_API_KEY` secret

This is an **out-of-band, user-run** step. The secret must be provisioned in both Firebase projects before `mintInterviewToken` can be deployed.

```bash
# Production project
firebase functions:secrets:set OPENAI_API_KEY --project brilliant-org

# Dev project
firebase functions:secrets:set OPENAI_API_KEY --project brilliant-org-dev
```

Use the Node v24.3.0 `firebase` alias. Newer Node breaks `firebase-tools` (HANDOFF env gotchas). Do not store the key in `.env*` files or any version-controlled file.

To verify a secret is set (without revealing its value):
```bash
firebase functions:secrets:get OPENAI_API_KEY --project brilliant-org
```

The `defineSecret('OPENAI_API_KEY')` call-site and `secrets: [OPENAI_API_KEY]` option on the callables land in **Phase 1** (`functions/src/interview.ts`). P0 only provisions the secret.

---

### 3. Dependencies

**Functions runtime — no new deps in P0.**

Both OpenAI HTTP calls in Phase 1 use the Node 22 global `fetch` (confirmed in `functions/package.json:7`: `"node": "22"`):

- `POST /v1/realtime/client_secrets` (mint ephemeral token, [README Appendix A §1](./README.md#1-ephemeral-token-mint-server-side-uses-standing-openai_api_key))
- `POST /v1/responses` (grade via Structured Outputs, [README Appendix A §6](./README.md#6-grader-separate-server-side-pass-not-realtime))

The `openai` npm SDK is a higher-level alternative, but adds a dependency for two calls with well-documented, stable shapes. Zero new deps is simpler and aligns with the existing codebase style (existing functions use bare `firebase-admin`/`firebase-functions` with no HTTP libs).

**Phase 1 will add `zod` to `functions/package.json` dependencies** to parse packs via `InterviewPackSchema.parse()` at runtime (see §4 below and [Phase 2](./phase-2-interview-pack-content.md)).

**Client — no deps in P0.** The WebGL/`ogl` decision for the Orb is deferred to [Phase 4](./phase-4-orb.md).

---

### 4. Pack→functions bundling

#### The problem

`interviews/course-*.json` lives outside `functions/`. The TypeScript compiler config (`functions/tsconfig.json:8`) sets `"rootDir": "src"` and `resolveJsonModule` is absent (defaults OFF). The Firebase deploy only uploads the `functions/` directory. The deployed Functions runtime has no path to `interviews/`.

#### Chosen approach: predeploy copy step

Add a second entry to the `predeploy` array in `firebase.json` (after the existing `tsc` compile step) that copies all `interviews/course-*.json` files into `functions/packs/` before each deploy:

```json
"predeploy": [
  "\"$RESOURCE_DIR/node_modules/.bin/tsc\" --project \"$RESOURCE_DIR\"",
  "node -e \"const f=require('fs'),p=require('path'),src=p.join('$RESOURCE_DIR','../interviews'),dst=p.join('$RESOURCE_DIR','packs');f.mkdirSync(dst,{recursive:true});f.readdirSync(src).filter(n=>n.endsWith('.json')).forEach(n=>f.cpSync(p.join(src,n),p.join(dst,n)));\""
]
```

The `functions/packs/` directory is **not** in `functions/.gitignore` (it only contains derived artifacts that are also present in `interviews/`), but it can be gitignored — the predeploy step regenerates it at deploy time from the committed source in `interviews/`. The `firebase.json:43` deploy ignore list (`node_modules`, `.git`, `*.local`) does not exclude `packs/`, so the JSON files are uploaded.

> **Tradeoff vs. `resolveJsonModule`:** enabling `resolveJsonModule: true` in `functions/tsconfig.json` and using `import packJson from '../packs/course-...'` would give a compile-time typed import, but TypeScript enforces that JSON imports are inside `rootDir: "src"` when combined with the current settings, requiring a tsconfig change that ripples to the output structure. The `fs.readFileSync` approach requires zero tsconfig change and treats JSON as data (not TypeScript source), matching the existing project style.

#### Runtime loading contract (Phase 1 implementation)

Phase 1 (`functions/src/interview.ts`) loads a pack as follows:

```ts
import * as fs from 'fs'
import * as path from 'path'
import { InterviewPackSchema } from '../../src/content/interviewPack'   // Phase 2A

// __dirname is functions/lib/ in the compiled output; packs/ is a sibling of lib/
function loadPack(courseId: string): InterviewPack {
  const raw = fs.readFileSync(
    path.join(__dirname, '../packs', `course-${courseId}.json`),
    'utf8',
  )
  return InterviewPackSchema.parse(JSON.parse(raw))
}
```

> **`InterviewPackSchema` import path:** `src/content/interviewPack.ts` is outside `functions/src/`; the functions tsconfig `rootDir: "src"` would need adjustment, OR Phase 2A places copies/re-exports of the schema inside `functions/src/`. Phase 2A owns this decision; Phase 1 documents the dependency and imports from whichever location Phase 2A chooses (likely `./interviewPack` if Phase 2A mirrors the module to `functions/src/`).

> **`@types/node`:** `import * as fs from 'fs'` and `import * as path from 'path'` require Node.js type declarations. These may be available transitively via `firebase-admin ^13.10.0` (`functions/package.json:17`), which pulls `@types/node` as a dependency. If `tsc` reports missing types for `fs`/`path`, add `"@types/node": "*"` to `functions/package.json` devDependencies.

#### Cross-phase dependency

- **Phase 2A** authors and validates packs; the copy step picks up whatever `interviews/course-*.json` files exist at deploy time.
- **Phase 1** consumes the copied packs via `loadPack(courseId)` and the Zod schema from Phase 2A.

---

### 5. App Check note

Global App Check enforcement remains **OFF** per `docs/security-audit.md` F1/F3 and `HANDOFF.md` ("App Check enforcement is intentionally OFF... monitor-then-enforce rollout"). P0 records this policy; it does not change it.

Only `mintInterviewToken` enables `enforceAppCheck`, gated to the prod project to avoid breaking the dev project (which has no reCAPTCHA key, per `src/firebase/app.ts:44` conditional init). **Phase 1 implements the per-env gate** using `process.env.GCLOUD_PROJECT === 'brilliant-org'`.

---

## Data contracts

Phase 0 has no Firestore writes. All Firestore layouts, caps/constants, and pack schema are defined in [spec index shared contracts](./README.md#shared-contracts). Phase 1 owns the first writes to the three interview subcollections.

---

## Acceptance criteria & verification

All verification steps other than the tsc compile require user-run commands (no Java locally, no emulator support here).

- [ ] **`Permissions-Policy` unblocks mic:** after `firebase deploy --only hosting`, open DevTools → Network → `/index.html` response headers; confirm `Permissions-Policy: camera=(), microphone=(self), geolocation=()`.
- [ ] **`connect-src` includes OpenAI:** same response headers inspection; confirm `https://api.openai.com` appears in `Content-Security-Policy connect-src`.
- [ ] **No CSP regressions:** open the deployed site, sign in, complete one lesson; confirm no CSP violations in the browser console.
- [ ] **Secret set in prod:** `firebase functions:secrets:get OPENAI_API_KEY --project brilliant-org` returns metadata (not the value).
- [ ] **Secret set in dev:** `firebase functions:secrets:get OPENAI_API_KEY --project brilliant-org-dev` returns metadata.
- [ ] **Predeploy copy works:** after adding the predeploy step and running `firebase deploy --only functions --project brilliant-org`, confirm `functions/packs/course-expected-value.json` exists locally after the predeploy script runs.
- [ ] **Pack readable at runtime:** once Phase 1 is deployed, calling `mintInterviewToken` should NOT return an `ENOENT` or `SyntaxError` from the pack load; any `resource-exhausted` or valid response confirms the file was found.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| `microphone=(self)` rejected by some browsers | Fall back to `microphone=("https://brilliant-org.web.app")` with the explicit origin if the `self` keyword is not recognized |
| CSP violation on existing flows after adding `https://api.openai.com` | No existing code fetches OpenAI; the addition is purely additive. Validate by signing in + completing a lesson after deploy |
| Predeploy node eval breaks in Windows shell or with paths containing spaces | Replace the one-liner with a dedicated `scripts/copy-interview-packs.js` at the repo root; reference it as `"node scripts/copy-interview-packs.js \"$RESOURCE_DIR\""` in predeploy |
| Secret leaks via logs | Phase 1 must access the key only via `OPENAI_API_KEY.value()` inside the handler and never log or return it; P0 only provisions it |
| `interviewDraw` / `InterviewPackSchema` import path between `src/` and `functions/src/` | Phase 2A owns the sharing mechanism; document the dependency contract here so both phases align |

---

## Cross-links

- [ADR-0008](../adr/0008-ai-capstone-interview-realtime-grounded.md) — the decision
- [Spec index / shared contracts](./README.md) — Firestore layout, caps, pack schema, callable I/O
- [Phase 1 — Cloud Functions](./phase-1-cloud-functions.md) — consumes the secret + pack bundle
- [Phase 2 — Interview Pack Content](./phase-2-interview-pack-content.md) — authors/validates packs that P0 copies at deploy time
- [Phase 5 — Report Persistence and CTAs](./phase-5-report-persistence-and-ctas.md) — `firestore.rules` for interview subcollections
- [Phase 6 — Guardrails and Tests](./phase-6-guardrails-and-tests.md) — integration + rules tests
