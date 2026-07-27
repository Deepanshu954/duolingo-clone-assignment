"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, async_session
from app.seed import seed_database
from app.routers import health, user, path, lessons, leaderboard, progress


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        await seed_database(session)

    yield

    await engine.dispose()


app = FastAPI(
    title="Duolingo Clone API",
    description="A Duolingo-style language learning API built with FastAPI and SQLite",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip() and o.strip() != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1")
app.include_router(path.router, prefix="/api/v1")
app.include_router(lessons.router, prefix="/api/v1")
app.include_router(leaderboard.router, prefix="/api/v1")
app.include_router(progress.router, prefix="/api/v1")
