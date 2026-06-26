// Client-side mirror of the server-enforced interview caps
// (functions/src/interview.ts). The SERVER is authoritative; the client uses
// SESSION_CAP_SECONDS for the countdown that force-stops the session as a UX
// safeguard. TOKEN_TTL_SECONDS (600) ≥ SESSION_CAP_SECONDS (480) by a 120 s
// margin so the ephemeral token never expires mid-session.
export const SESSION_CAP_SECONDS = 480
export const DAILY_QUOTA_SECONDS = 1800
export const TOKEN_TTL_SECONDS = 600
