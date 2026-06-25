// Canonical course id (mirrors docs/mvp_prd.md Data Contracts). Kept in a
// Firebase-free module so pure models and their tests can import it without
// pulling in the Firestore loader, which initializes the Firebase SDK at import.
export const COURSE_ID = 'course-pattern-hitting-times'
