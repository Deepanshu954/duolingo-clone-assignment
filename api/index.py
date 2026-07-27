"""Vercel Python function entrypoint for the FastAPI backend."""

import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"

sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:////tmp/duolingo.db")

from app.main import app  # noqa: E402
