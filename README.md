# Duolingo Web App SDE Fullstack Assignment

A full-stack Duolingo-style learning app built for the assignment brief. It recreates the core Duolingo loop: a gamified learning path, varied lesson exercises, instant feedback, XP, streaks, hearts, profile stats, leaderboard, shop, practice, and responsive UI.

## Tech Stack

- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy async ORM
- Database: SQLite with seeded course and learner data
- Auth: Simplified default learner using `X-User-ID: 1`
- Deployment target: Vercel full-stack demo, with Render backend config included for a two-service deployment

## Features

- Duolingo-style learning path with units, skill bubbles, locked/unlocked states, crowns, and progress.
- Lesson player with multiple choice, image choice, word bank, match pairs, fill-in-the-blank, and type-answer exercises.
- Immediate correct/incorrect feedback, lesson progress bar, completion screen, and out-of-hearts handling.
- Persistent learner progress: XP, streaks, hearts, gems, completed lessons, and skill unlocks.
- Seeded leaderboard and profile achievements.
- Bonus sections: multi-language course selector, letters page, practice hub, shop, quests, dark mode, and mocked Super/gem flows.
- Practice-for-hearts endpoint so learners can recover hearts without real payments.

## Architecture

```text
frontend/                     backend/
Next.js App Router            FastAPI app
React client UI      ---->    /api/v1 REST endpoints
Tailwind components           SQLAlchemy models
NEXT_PUBLIC_API_URL           SQLite database + seed data
```

Local development uses Next.js rewrites from `/api/v1/*` to `http://localhost:8000/api/v1/*`. Hosted builds can either call a separate backend using `NEXT_PUBLIC_API_URL` or use the included Vercel Python function at same-origin `/api/v1`.

## Database Schema

| Table | Purpose |
| --- | --- |
| `users` | Learner profile, XP, hearts, streak, gems, active course |
| `courses` | Seeded language courses |
| `units` | Ordered sections within a course |
| `skills` | Skill bubbles within units |
| `lessons` | Ordered lessons within skills |
| `exercises` | Prompt, type, choices, answer data for lesson questions |
| `skill_progress` | Per-user skill completion and lock state |
| `lesson_sessions` | Active/completed lesson attempts |
| `daily_xp_logs` | Daily XP records for streak logic |

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/user/me` | Current learner |
| GET | `/api/v1/profile` | Profile and stats |
| GET | `/api/v1/courses` | Seeded courses |
| POST | `/api/v1/user/active-course` | Switch active course |
| GET | `/api/v1/path` | Learning path with progress |
| GET | `/api/v1/leaderboard` | XP leaderboard |
| POST | `/api/v1/lessons/{lesson_id}/start` | Start lesson session |
| GET | `/api/v1/lessons/sessions/{session_id}` | Get lesson session |
| POST | `/api/v1/lessons/sessions/{session_id}/submit` | Submit answer |
| POST | `/api/v1/progress/hearts/refill` | Refill hearts with gems |
| POST | `/api/v1/progress/hearts/practice` | Mock practice reward for one heart |
| POST | `/api/v1/shop/redeem-coupon` | Mock coupon flow |
| POST | `/api/v1/shop/buy-gems` | Mock gem purchase |
| POST | `/api/v1/test/simulate-day-passed` | Test streak reset |

## Local Setup

### One-command setup

```bash
chmod +x launch.sh
./launch.sh --setup
./launch.sh
```

Open `http://localhost:3000`.

### Manual backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload --port 8000
```

### Manual frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend:

```env
DATABASE_URL=sqlite+aiosqlite:///./db/duolingo.db
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
CORS_ORIGIN_REGEX=https://.*\.vercel\.app
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For Vercel, set `NEXT_PUBLIC_API_URL` to the Render backend base URL, without `/api/v1`.

## Deployment

Full-stack demo on Vercel:

- Import the GitHub repository or deploy with `npx vercel --prod`.
- Use the root `vercel.json`.
- Leave `NEXT_PUBLIC_API_URL` unset to use the same-origin Vercel Python backend.
- The Vercel serverless backend stores SQLite in `/tmp`, so demo data can reset between cold starts.

Optional backend on Render:

- Use `render.yaml` from the repository root.
- The service root is `backend`.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Separate frontend on Vercel:

- Import the GitHub repository.
- Use the root `vercel.json`.
- Set `NEXT_PUBLIC_API_URL` to the Render backend URL.

Render free services and Vercel serverless functions both have ephemeral filesystems. This is acceptable for a demo, but SQLite data can reset after redeploys, spin-downs, or cold starts. For durable hosted progress, attach a paid Render persistent disk or move the database to a hosted relational store.

## Verification

Latest local checks:

```bash
backend/venv/bin/python -m pytest backend/tests -q
# 20 passed

cd frontend && npm run lint
# No ESLint warnings or errors

cd frontend && npm run build
# Production build completed successfully
```

## Assumptions and Mocked Data

- Real auth is simplified to a seeded default user because the assignment explicitly allows assuming a logged-in learner.
- Course content is seeded demo content; Spanish is the main path, with bonus languages available.
- Gems, coupons, shop purchases, Super subscription, and practice rewards are mocked.
- Speech/audio is optional and uses browser capabilities or placeholders.
- The assignment PDF itself is not part of the source submission.
