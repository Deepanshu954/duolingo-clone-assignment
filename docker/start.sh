#!/usr/bin/env bash
set -euo pipefail

mkdir -p /app/db

PYTHONPATH=/app/backend python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd /app/frontend
exec npm run start -- -H 0.0.0.0 -p "${PORT:-3000}"
