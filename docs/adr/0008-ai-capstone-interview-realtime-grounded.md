# AI capstone interview: OpenAI Realtime (browser-direct via ephemeral token), grounded in authored packs

**Status:** Accepted — feature not yet built. Extends ADR-0005 (interview questions must be grounded + engine-verified).

The per-concept **capstone interview** (a spoken AI quant mock-interview taken once after a concept's lessons are done — see `CONTEXT.md`) is built on the **OpenAI Realtime speech-to-speech API** rather than a turn-based STT → chat → TTS pipeline. The browser connects **directly** to OpenAI using a **short-lived ephemeral token** minted by a Cloud Function; the standing `OPENAI_API_KEY` never leaves the server (a Functions secret). The interviewer is grounded in a per-concept, engine-verified **interview pack** injected as hidden ground truth (it asks from the verified bank + qualitative follow-ups only, never inventing numeric problems); **grading is a separate server-side LLM pass** over the transcript that writes the report. The interview is **optional** and does not gate the medallion or unlocks.

We chose Realtime for the natural, low-latency back-and-forth and the live audio stream that drives the orb, accepting a pricier model and a direct-to-OpenAI connection — which is otherwise unlike the rest of the app, where everything goes through `onCall` Functions and the implied voice tech was the standalone TTS model.

## Considered options

- **Turn-based TTS pipeline** (client records a clip → one Function runs STT → chat → TTS → returns text + audio). Cheaper (pennies vs. tens-of-cents-to-$1+ per session), fits the existing callable infra, and keeps the key fully server-side with no direct browser↔OpenAI link. **Rejected** for the walkie-talkie latency between turns and because it yields no live audio for a per-word-reactive orb.

## Consequences

- Hosting must allow `https://api.openai.com` in the CSP `connect-src` and flip the microphone `Permissions-Policy` (currently `microphone=()`, which hard-blocks mic).
- Cost is **per minute of audio**, so it is load-bearing — not optional — to enforce a per-user daily quota (~30 min), a per-session hard cap (~8 min), required auth, and **App Check on the mint function** (even though global App Check enforcement stays off).
- The transcript is assembled on the client and sent to the grader, so it is tamperable. Acceptable **only because the interview gates nothing**; revisit if it ever becomes a gate.
