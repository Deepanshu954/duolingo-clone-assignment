# 🦉 Duolingo Clone

A full-stack Duolingo-style language learning app built with **Next.js 14** (App Router) + **FastAPI** + **SQLite**.

![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![Next.js](https://img.shields.io/badge/next.js-14-black)

---

## ✨ Features

- **Learning Path** — Winding skill-bubble layout with units, skills, and lesson progression
- **5 Exercise Types** — Multiple choice, word bank, match pairs, fill-in-the-blank, type answer
- **XP System** — Earn 10 XP per correct answer + 10 bonus for lesson completion
- **Hearts** — 5 hearts max, lose 1 per wrong answer, refill via shop or practice
- **Streaks** — Daily streak tracking with automatic reset on missed days
- **Leaderboard** — Ranked by total XP with 4 seeded users
- **Profile** — Stats overview with achievement badges
- **Shop** — Heart refill (350 gems), placeholder items
- **Quests** — Daily quest progress bars
- **Settings** — Profile edit, sound/animation toggles

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTP (X-User-ID: 1)     ┌─────────────────┐
│   Next.js 14    │ ──────────────────────────── │    FastAPI       │
│   (Port 3000)   │   /api/v1/* proxy rewrite    │   (Port 8000)   │
│                 │                               │                 │
│  • App Router   │                               │  • Async SQLAlchemy
│  • Client Comps │                               │  • SQLite DB    │
│  • CSS Design   │                               │  • Seed Data    │
│    System       │                               │  • pytest       │
└─────────────────┘                               └─────────────────┘
```

**Auth:** Simplified — `X-User-ID: 1` header (no Clerk/Firebase). Default learner seeded as user 1.

---

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Learner profiles: XP, hearts, streak, gems |
| `courses` | Language courses (seeded: Spanish 🇪🇸) |
| `units` | Course sections (Basics, Phrases, Travel) |
| `skills` | Learnable skills within units |
| `lessons` | Lessons within skills (2 per skill) |
| `exercises` | Exercise content: prompt, type, options, correct answer |
| `skill_progress` | Per-user skill completion tracking + lock state |
| `lesson_sessions` | Active/completed lesson sessions (UUID keyed) |
| `daily_xp_logs` | Per-user daily XP for streak calculation |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/user/me` | Current user data |
| GET | `/api/v1/profile` | Profile with lesson count |
| GET | `/api/v1/path` | Learning path (units → skills → progress) |
| GET | `/api/v1/leaderboard` | Users ranked by XP |
| POST | `/api/v1/lessons/{id}/start` | Start a lesson session |
| GET | `/api/v1/lessons/sessions/{id}` | Get session status + current exercise |
| POST | `/api/v1/lessons/sessions/{id}/submit` | Submit answer, get result |
| POST | `/api/v1/progress/hearts/refill` | Refill hearts (costs 350 gems) |
| POST | `/api/v1/test/simulate-day-passed` | Testing: reset streak |

---

## 🚀 Quick Start

### One-Command Launch

```bash
chmod +x launch.sh

# First time — install all dependencies:
./launch.sh --setup

# Start both backend + frontend:
./launch.sh

# Run all tests:
./launch.sh --test
```

### Manual Setup

#### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

#### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The database is auto-created and seeded on first startup.

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — the learning path loads immediately.

### Run Tests

```bash
# Backend
cd backend
source venv/bin/activate
PYTHONPATH=. python -m pytest tests -v

# Frontend
cd frontend
npm run lint
npm run build
```

---

## 🎮 Exercise Types

| Type | Description | Answer Format |
|------|-------------|---------------|
| **Multiple Choice** | Pick one of 4 options | Selected option text |
| **Word Bank** | Arrange word tiles into a sentence | Joined words string |
| **Match Pairs** | Match left↔right columns | Dict of pairs |
| **Fill Blank** | Complete a sentence with the missing word | Single word |
| **Type Answer** | Free-text translation | Full text |

---

## 🎨 Design

- **Dark theme** with Duolingo's iconic green/blue/red color palette
- **CSS-only** — no Tailwind, no CSS-in-JS
- **Self-hosted fonts** — builds work fully offline (no Google Fonts API)
- **Micro-animations** — bounce on correct, shake on wrong, pulse on XP gain
- **Responsive** — desktop sidebar + mobile bottom tab bar

---

## 📝 Assumptions & Decisions

1. **No external auth** — PDF allows simplified auth; using `X-User-ID` header
2. **SQLite** — single-file DB, no external database service needed
3. **4 seeded users** — 1 default learner + 3 bots for leaderboard variety
4. **Heart system** — 5 max, -1 per wrong, refill via shop (350 gems) or practice
5. **Skill unlock** — sequential; completing all lessons in a skill unlocks the next
6. **No real payments** — shop uses in-game gems only

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + lifespan
│   │   ├── config.py         # Settings
│   │   ├── database.py       # SQLAlchemy async engine
│   │   ├── models.py         # ORM models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── seed.py           # Demo data seeder
│   │   ├── dependencies.py   # Auth dependency
│   │   └── routers/          # API route handlers
│   ├── tests/                # pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   │   └── exercises/    # 5 exercise type components
│   │   └── lib/api.ts        # Typed API client
│   ├── package.json
│   └── next.config.js
├── .env.example
├── .gitignore
└── README.md
```
