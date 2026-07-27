# Duolingo Web App SDE Fullstack Assignment

## Submission Links

- Assignment name: Duolingo Web App SDE Fullstack Assignment
- GitHub: https://github.com/Deepanshu954/duolingo-clone-assignment
- Frontend deployment: Pending Vercel deployment URL
- Backend/API deployment: Pending Render deployment URL

## What Is Included

- Next.js 14 TypeScript frontend with a Duolingo-style learning path, lesson player, profile, leaderboard, shop, quests, practice hub, letters, and dark mode.
- FastAPI backend with SQLite persistence, seeded courses/users/content, lesson sessions, progress tracking, XP, streaks, hearts, and mocked gem/shop flows.
- Simplified auth via `X-User-ID: 1`, which matches the assignment allowance for a default logged-in learner.

## Assumptions / Mocked Data / Notes

- Real authentication is intentionally not integrated. The app assumes user `1` is logged in.
- Course data is seeded and intentionally small/demo-oriented, with Spanish plus bonus language content.
- Gems, coupons, shop purchases, Super subscription, and practice rewards are mocked.
- Audio/speech features use browser capabilities or placeholders where available.
- Render free web services can host the demo, but their filesystem is ephemeral. SQLite data can reset on redeploy/spin-down unless a paid persistent disk or another persistent host is used.

## Deployment Notes

- Backend target: Render web service from `render.yaml`.
- Frontend target: Vercel from the repository root using `vercel.json`.
- Set `NEXT_PUBLIC_API_URL` in Vercel to the Render backend base URL, for example `https://duolingo-clone-assignment-api.onrender.com`.
- Add the final Vercel URL to backend `CORS_ORIGINS` on Render if needed. The backend also allows `https://*.vercel.app` via `CORS_ORIGIN_REGEX`.

## Verification

Run these before submission:

```bash
backend/venv/bin/python -m pytest backend/tests -q
cd frontend && npm run lint && npm run build
```

Latest local verification:

- Backend tests: `20 passed`
- Frontend lint: no ESLint warnings or errors
- Frontend build: production build completed successfully
