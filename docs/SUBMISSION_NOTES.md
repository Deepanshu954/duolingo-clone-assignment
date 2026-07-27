# Assumptions, Mocked Data, and Notes

## Assumptions

- The assignment allows a simplified authentication flow, so the app starts with a default learner identified by `X-User-ID: 1`.
- The reviewer can open the app immediately without creating an account or configuring an OAuth provider.
- Spanish is the only seeded target language because the assignment is evaluated on the learning loop rather than course-management breadth.
- SQLite remains the source of truth for this submission and is suitable for a single-user demo.
- The app is deployed as one Render web service so the frontend and backend share one public origin.

## Mocked or simplified data

- `DuoLearner` is the default learner.
- Four seeded competitor profiles populate the leaderboard.
- The course contains two units, six skills, twelve lessons, and sixty exercises.
- Exercises are hand-authored seed records covering multiple choice, word-bank translation, matching, fill blank, and typed answers.
- Shop purchases, premium access, and heart refills are UI/API demo flows backed by local gems and hearts; no payment provider is connected.
- Speech playback uses the browser Speech Synthesis API. Speech recognition is not implemented.
- The settings page exposes local UI preferences; it does not persist account settings to an external identity service.

## Reviewer demo path

1. Open `/` and select the first unlocked skill.
2. Start a lesson and complete the five exercise types.
3. Confirm XP, hearts, streak, and skill completion update.
4. Visit `/leaderboard`, `/profile`, `/quests`, `/shop`, `/practice`, and `/settings`.
5. Use the API health check at `/api/v1/health` if verifying the deployment separately.

## Tradeoffs and future work

- Real authentication should be added before multi-user production use.
- SQLite persistence should move to a managed database or a mounted persistent disk for durable deployment data.
- The `/api/v1/test/simulate-day-passed` endpoint exists for automated verification and should be protected or removed in a public production release.
- The seeded leaderboard is intentionally deterministic so every reviewer sees the same initial state.
