# Security Audit — brilliant.org (Pattern Hitting Times)

**Date:** 2026-06-24 · **Scope:** Vite 8 + React 19 + TypeScript SPA on Firebase (Auth: email/password + Google; Firestore client SDK; Cloud Functions v2 callables; static SPA on Firebase Hosting) · **Methodology:** 3-phase — (1) web research into vibe-coded + Firebase risk patterns; (2) manual + automated codebase audit; (3) multi-model adjudication (gemini-3-flash gathered file evidence, claude-opus-4-8 reasoned/confirmed severity + CWE/OWASP, composer-2.5-fast wrote this brief).

---

## Executive Summary

The Firebase backend is unusually well-hardened for an AI-assisted codebase: owner-scoped Firestore rules with field whitelists and anti-smuggling denies, server-authoritative Cloud Functions that verify auth and re-derive all paths from the server-side uid (no IDOR), idempotent transactions, no hardcoded secrets, no eval/dangerouslySetInnerHTML, and a comprehensive `.gitignore`. The gaps are defense-in-depth and configuration hardening, not broken access control.

**Applied in this change set:** HTTP security headers on Hosting (F2) and a default-deny `storage.rules` (F5). **Intentionally deferred (ready-to-apply code documented below):** App Check enforcement on the callables (F1) + client fail-loud (F3) — `HANDOFF.md` mandates a monitor-then-enforce rollout so legitimate low-score / embedded-webview users are not blocked on the live app. Dependency advisories (F4) are unreachable / dev-only and accepted.

**Net:** 0 Critical, 0 High, 3 Medium, 3 Low, plus Info/console items.

---

## Already-Strong Controls

No change needed for the following:

- **Firestore rules** (`firestore.rules`): owner-scoped via `isOwner(uid) == request.auth.uid`; `users/{uid}` create-once with `displayName` whitelist; snapshots use `keys().hasOnly([...])` anti-smuggling; progress denies client writes to `completionStatus` / `masteryStatus` / `needsReview` / `unlocks` / `derived` / `transferAttained`; milestones and streaks are `write: if false` (Cloud Functions / Admin SDK only). No `allow ... if true` anywhere.

- **Cloud Functions** (`functions/src/index.ts`): `requireUid()` throws `'unauthenticated'`; all Firestore paths derived from the server-side uid; `completeLesson` verifies submitted beats against the seeded lesson fixture (server-authoritative) and is idempotent in a transaction; streaks compute the local day server-side from a validated IANA timezone; milestones idempotent and function-only.

- **Secrets:** only public `VITE_FIREBASE_*` client config is exposed (safe by design). `.gitignore` covers `.env*` and service-account keys. No hardcoded credentials, no `eval`, no `dangerouslySetInnerHTML`. Vite leaves source maps off in prod by default.

- **Auth sign-in errors** are non-enumerating (`src/auth/authErrors.ts` collapses `user-not-found` / `wrong-password` / `invalid-credential` to one message).

---

## Findings

Findings are ordered by severity (Medium → Low → Info).

### F1 — Cloud Function callables do not enforce App Check

| | |
|---|---|
| **Severity** | Medium |
| **Status** | RECOMMENDED — DEFERRED (not applied; do not deploy enforcement yet) |
| **CWE** | CWE-693 (Protection Mechanism Failure); secondary CWE-770/799 |
| **OWASP** | A05:2021 Security Misconfiguration (secondary A04:2021 Insecure Design) |

**Evidence:** `functions/src/index.ts:113` `export const completeLesson = onCall(` and `:203` `export const recordQualifyingAction = onCall(` — bare `onCall`, no `enforceAppCheck` anywhere in the repo.

**Exploit (app-specific):** an attacker self-registers (email/password), reads the world-readable `lessons/*` docs (rules allow read to any signed-in user) to learn each lesson's required beat ids, then calls `completeLesson` directly over HTTPS with those ids — bypassing the React UI. Server-authoritative beat checking does NOT stop this because the required beats are readable, so the attacker forges full course completion + every milestone. Looping the callables also amplifies Function invocations + Firestore cost and, with `maxInstances: 10`, can saturate instances (availability impact).

**Remediation (ready to apply, intentionally deferred):** add `{ enforceAppCheck: true }` to both `onCall` definitions (gen-2 callables: this is a CODE option, not a console toggle). **Deferred per `HANDOFF.md`:** App Check enforcement is intentionally OFF on the live app until console metrics confirm real users receive verified tokens — enforcing prematurely blocks legitimate low-score / embedded-webview users. **Rollout sequence:** (1) keep App Check initialized (already wired) and watch the App Check request-metrics screen in the Firebase console; (2) once ~all legitimate traffic is "verified," set `enforceAppCheck: true` on both callables (ship together with F3) AND enable Firestore enforcement in the console. This finding was therefore NOT applied in this change set.

---

### F2 — Firebase Hosting serves no security headers

| | |
|---|---|
| **Severity** | Medium |
| **Status** | FIXED in this change set |
| **CWE** | CWE-693; CWE-1021 (clickjacking); CWE-319 (missing HSTS) |
| **OWASP** | A05:2021 |

**Evidence:** `firebase.json:2-6` — hosting block has only `public` / `ignore` / `rewrites`, no `headers` array (no CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

**Exploit:** no `frame-ancestors` / X-Frame-Options ⇒ the app can be iframed and an authenticated learner clickjacked into "Continue with Google" consent or profile changes. No CSP ⇒ any future XSS sink (e.g. a learner-controlled `displayName`) or a single compromised npm dependency runs with full access to the Firebase ID token in IndexedDB, calling `completeLesson` + Firestore as the victim. No HSTS ⇒ first-visit SSL-strip.

**Remediation:** add a `headers` array to the hosting block:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` with `frame-ancestors 'none'`

See the **CSP Implementation Note** at the end of this document — the CSP allowlist must accommodate Firebase (Google sign-in, reCAPTCHA/App Check, Firestore/Functions, Analytics) and MUST be validated against a real deploy.

---

### F3 — App Check fails open (silent no-op) when the site key is missing in a prod build

| | |
|---|---|
| **Severity** | Low (Medium combined with F1) |
| **Status** | RECOMMENDED — DEFERRED (ships with F1) |
| **CWE** | CWE-636 (Failure to Fail Securely); CWE-1188 (insecure default) |
| **OWASP** | A05:2021 |

**Evidence:** `src/firebase/app.ts:49-54` — `if (!usingEmulators && appCheckSiteKey) { initializeAppCheck(...) }` silently skips App Check with no warning when `VITE_FIREBASE_APPCHECK_SITE_KEY` is absent.

**Exploit:** deploying without the key ships a production bundle with zero bot protection while operators believe App Check is active, re-enabling the F1 abuse path with no signal.

**Remediation (ready to apply, deferred with F1):** fail loud — in a non-emulator PRODUCTION build with no site key, throw at startup. Keep it gated behind `!usingEmulators` so emulator/CI/test are unaffected. This is the safety interlock for F1 (prevents shipping a keyless bundle against enforced functions), so it is deferred and shipped together with F1 when enforcement is turned on. NOT applied in this change set.

---

### F4 — Dependency advisories (npm audit)

| | |
|---|---|
| **Severity** | Low / Info (dependency hygiene) |
| **Status** | ACCEPTED / DOCUMENTED (no dependency change) |
| **CWE** | CWE-1395 (vulnerable third-party component) |
| **OWASP** | A06:2021 |

**Important framing:** the advisories are real but all are MODERATE, transitive, and dev/CLI/server-only — none ship to the browser.

Measured:

- Root `npm audit` = 9 moderate
- `npm audit --omit=dev` = 0 (100% dev-only: `firebase-tools` and dev `firebase-admin` → `gaxios` / `teeny-request` / `@google-cloud/storage` → `uuid@9.0.1` GHSA-w5hq-g745-h8pq, and `@google-cloud/pubsub` → `@opentelemetry/core` GHSA-8988-4f7v-96qf)

The functions package pulls the same uuid via `firebase-admin`'s OPTIONAL deps that the app never uses; none are reachable (the code never calls uuid v3/v5/v6 with a buffer, never uses admin Cloud Storage, never feeds attacker input to OpenTelemetry).

**Decision (corrected during the fix pass):** no version bump applied — `firebase-admin` stays at `^13.10.0`. The plan called for `firebase-admin ^14`, but investigation against the registry showed the latest `firebase-functions` is `7.2.5` (no `8.x` exists) and it requires `firebase-admin@^11 || ^12 || ^13`. Installing `firebase-admin@^14` therefore produces an **invalid, unsupported dependency tree** (`npm ls` → `ELSPROBLEMS`, `firebase-admin@14 ... invalid`) for **zero reachable-security benefit** (the advisory is unreachable in this codebase — see framing above). Do NOT run `npm audit fix --force` either — it tries to DOWNGRADE `firebase-tools` to 14.23.0 (a regression). The residual moderate advisories (`uuid` GHSA-w5hq-g745-h8pq via `gaxios`/`@google-cloud/storage`, etc.) are transitive and dev/CLI/server-only; accept them and treat `npm audit` in CI as informational. Re-bump `firebase-admin` only once a `firebase-functions` release declares support for it.

---

### F5 — Cloud Storage rules are not version-controlled / locked

| | |
|---|---|
| **Severity** | Low (context-dependent) |
| **Status** | FIXED in this change set + console verification required |
| **CWE** | CWE-1188 / CWE-732 (if default-open) |
| **OWASP** | A05:2021 |

**Evidence:** no `storage.rules` file and no `storage` block in `firebase.json`, although `VITE_FIREBASE_STORAGE_BUCKET` exists in `.env.example`. The client never imports `firebase/storage` (low current impact), but the bucket's rules live only in the console, unreviewed.

**Exploit (conditional):** if the bucket is live with a permissive default (e.g. `allow read, write: if request.auth != null`), any self-registered user reads/writes arbitrary objects (malware hosting, cost abuse).

**Remediation applied:** committed a default-deny `storage.rules` and wired `"storage": { "rules": "storage.rules" }` into `firebase.json` so the lockdown is reviewable + CI-enforceable.

**Action:** deploy it (`firebase deploy --only storage`) and verify the live bucket in the console.

---

### F6 — Dev/debug routes ship in the production bundle

| | |
|---|---|
| **Severity** | Low / Info |
| **Status** | DOCUMENTED (not changed; see caveat) |
| **CWE** | CWE-489 (active debug code) |
| **OWASP** | A05:2021 |

**Evidence:** `src/App.tsx:124-151` + `src/pages/routes.ts:17-21` — `/dev/lesson`, `/dev/lesson/:lessonId`, and `/dev/home` render bundled fixture lessons with NO auth and NO Firebase mount.

**Assessment:** NO Firestore/user-data exposure (these routes never mount Firebase). The real impact is a larger debug surface and all course content being publicly reachable without sign-in.

**Remediation (recommended, deferred):** gate these routes behind `import.meta.env.DEV` so they tree-shake out of production builds.

**Caveat:** the Playwright e2e suite uses `/dev/lesson` as its entry point — if e2e runs against a production (`vite preview`) build, DEV-gating will break it; reconcile with the e2e harness first. Left unchanged because it is outside the approved fix scope.

---

### A — Account enumeration on the sign-UP path

| | |
|---|---|
| **Severity** | Low |
| **Status** | DOCUMENTED (console mitigation) |
| **CWE** | CWE-204 |
| **OWASP** | A07:2021 |

**Evidence:** `src/auth/authErrors.ts` — `auth/email-already-in-use` → "An account already exists for that email." leaks whether an email is registered (sign-in is correctly non-enumerating).

**Mitigation:** enable Firebase Auth Email Enumeration Protection (Identity Platform returns generic errors; the message map then naturally falls back). Acceptable iff that toggle is ON.

---

### B — No per-user throttling on callables; maxInstances:10 is a self-DoS knob

| | |
|---|---|
| **Severity** | Low/Medium |
| **Status** | DOCUMENTED |
| **CWE** | CWE-770 |
| **OWASP** | A04:2021 |

Each `completeLesson` / `recordQualifyingAction` does a Firestore get + transaction with no rate limit; App Check (F1) bars bots but not authenticated-user abuse.

**Mitigation:** F1 + existing idempotency cover most of it; optionally add a per-uid token-bucket doc and right-size `maxInstances`. Acceptable for MVP once F1 lands.

---

### C — Raw Firebase uid sent to Google Analytics as an event param

| | |
|---|---|
| **Severity** | Low (privacy) |
| **Status** | DOCUMENTED |
| **CWE** | CWE-359 |
| **OWASP** | A05:2021 / privacy |

**Evidence:** `src/analytics/events.ts:61` — `track()` attaches `uid: auth.currentUser?.uid` to every event. GA policy discourages persistent user identifiers as event params.

**Mitigation:** use Analytics `setUserId()` or a salted hash instead of a raw uid in params.

---

### D — Owner-scoped writes lack value/size validation

| | |
|---|---|
| **Severity** | Info (acceptable) |
| **Status** | DOCUMENTED |

**Evidence:** `firestore.rules:45-88` — `users` create permits unvalidated `createdAt` / `lastActiveAt`; progress/snapshots allow arbitrary non-authoritative fields with no size cap. All strictly owner-scoped, so worst case a user bloats their OWN docs (minor cost) — no cross-tenant exposure.

**Optional hardening:** `is timestamp` checks + a size cap.

---

## Remediation Summary

| Finding | File(s) changed | Status |
|---------|-----------------|--------|
| **F1** | none yet (`functions/src/index.ts` ready for `enforceAppCheck: true`) | Deferred — do not enforce until App Check metrics are green (HANDOFF.md) |
| **F2** | `firebase.json` (hosting `headers`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | Fixed |
| **F3** | none yet (`src/firebase/app.ts` fail-loud ready) | Deferred — ships with F1 |
| **F4** | none (kept `firebase-admin ^13.10.0`) | Accepted — no valid bump exists (latest `firebase-functions` 7.2.5 caps admin at ^13); advisories are unreachable/dev-only |
| **F5** | `storage.rules` (default-deny) + `firebase.json` (storage block) | Fixed; console verify |
| **F6, A, B, C, D** | — | Documented, deferred / console-only |

---

## Console-Only / Out-of-Scope Follow-ups

These items cannot be code-reviewed; verify in the Firebase / Google Cloud consoles:

- **Enable App Check ENFORCEMENT for Firestore** in the Firebase console (the callable Functions side is the `enforceAppCheck` code option from F1).
- **Restrict the browser API key by HTTP referrer** in Google Cloud Console (the public `VITE_FIREBASE_API_KEY` is safe but referrer-locking limits abuse).
- **Enable Auth password policy + Email Enumeration Protection** (mitigates finding A).
- **If Playwright e2e runs against a real project** (not emulators), configure an App Check debug token for that environment, or F1 will block it.

---

## CSP Implementation Note

> **Read before deploying F2.** A naive CSP WILL break this app.

The shipped allowlist must permit:

| Concern | Directives |
|---------|------------|
| Google sign-in popup | `script-src https://apis.google.com`; `frame-src https://accounts.google.com` + the project `authDomain` `*.firebaseapp.com` |
| App Check reCAPTCHA v3 | `script-src https://www.google.com https://www.gstatic.com`; `frame-src https://www.google.com` |
| Firestore + gen-2 callable Functions | `connect-src https://*.googleapis.com https://*.cloudfunctions.net https://*.run.app`, plus `wss:` for Firestore listen |
| Analytics | `script-src https://www.googletagmanager.com`; `connect-src https://*.google-analytics.com` |
| Inline styles | `style-src` needs `'unsafe-inline'` (motion/Konva inject inline styles) |

This is the single most likely place a "fix F2" change breaks production sign-in — validate against a real deploy and watch the browser console for CSP violations.

Example skeleton (adjust to match the shipped `firebase.json`):

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' https://apis.google.com https://www.google.com https://www.gstatic.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; frame-src https://accounts.google.com https://www.google.com https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net https://*.run.app https://*.google-analytics.com wss:; frame-ancestors 'none'"
          }
        ]
      }
    ]
  }
}
```

Example callable App Check enforcement (F1):

```typescript
export const completeLesson = onCall(
  { enforceAppCheck: true, maxInstances: 10 },
  async (request) => { /* ... */ }
);
```

Example fail-loud App Check init (F3):

```typescript
if (!usingEmulators && import.meta.env.PROD && !appCheckSiteKey) {
  throw new Error(
    'VITE_FIREBASE_APPCHECK_SITE_KEY is required in production builds'
  );
}
```

---

## Residual Risk

After these fixes the code-level posture is strong; the remaining real-world risk is concentrated in console configuration (App Check enforcement toggle, API-key referrer lock, Auth protections) and validating the CSP against a live deploy. Dev/debug routes (F6) and documented low-severity items (A–D) represent acceptable MVP tradeoffs once F1–F3 and F2 are verified in production.
