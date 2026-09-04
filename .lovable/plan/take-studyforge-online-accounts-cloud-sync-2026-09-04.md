# Take StudyForge Online: Accounts + Cloud Sync

## Goal

Turn StudyForge from a local-only app into an online service: every user gets an account, and their decks, progress, XP, achievements, and settings follow them across devices.

## The short answer

Enable **Lovable Cloud** (built-in backend: database, authentication, file storage — no external accounts or setup). It gives us email/password plus Google sign-in and a Postgres database with row-level security, which maps cleanly onto the app's existing data model.

## What gets built

### 1. Enable Lovable Cloud
- One-click enable; generates the backend and client helpers automatically.

### 2. Authentication
- New `/auth` page: sign up / log in with email + password and Google.
- Auth gate: the app shell requires a session; unauthenticated visitors are redirected to `/auth`.
- Sign-out button in Settings.
- Keep onboarding (profile setup) as the step after first sign-up.

### 3. Database schema (one migration)
- `profiles` — display name, grade level, school, avatar emoji, focus subjects, study reason, daily goal.
- `decks` — title, subject, description, color, tags, favorite, created/last-studied (owned by user).
- `questions` — belong to a deck; type, question, answer, options, explanation, difficulty, concept, hint, tags.
- `question_state` — per-user mastery, bookmarks, notes per question.
- `sessions` — every study/quiz/arena session summary (mode, decks, counts, duration, XP).
- `quiz_results` — full answer-by-answer reports (for the report view history).
- `user_progress` — XP, streaks, achievements, concept stats (single row per user).
- `user_settings` — appearance/accessibility/quiz defaults (single row per user).
- Row-level security everywhere: users can only read/write their own rows. Full GRANTs included.

### 4. Store migration (localStorage → cloud)
- Refactor `src/store/studyforge.tsx` into a cloud-backed store: same actions (`addDeck`, `addQuestions`, `recordSession`, etc.) now read/write the database, keeping the same in-memory shape so UI components barely change.
- **First-login import**: if the browser has existing localStorage data, offer "Import my existing progress" to push it into the new account, then clear local state.
- Offline-friendly: optimistic local updates with background sync, so quizzes never stutter on a slow connection.

### 5. Wallpaper upload → cloud storage
- Move the wallpaper image from a localStorage data URL to private cloud file storage (data URLs are too large for a settings row).

### 6. Cleanup
- Settings "backup/restore/wipe" adapts: backup exports from the cloud account; wipe deletes cloud data.
- Remove the localStorage persistence path once sync is verified.

## What stays the same
- All pages, quiz engine, arena, study mode, prompt forge, animations — zero visual redesign. This is a backend/data-layer change.

## Rollout order
1. Enable Cloud + auth page + gate.
2. Schema migration.
3. Store refactor (decks/questions first, then progress/sessions/settings).
4. First-login import of local data.
5. Wallpaper to storage, cleanup, end-to-end verification.

## Optional later (not in this plan)
- Lovable AI integration to generate decks in-app (Cloud is a prerequisite).
- Shared/public decks between users, leaderboards, classes.
