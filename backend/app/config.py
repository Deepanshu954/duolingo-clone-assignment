from pydantic_settings import BaseSettings
import os


DEFAULT_DATABASE_URL = (
    "sqlite+aiosqlite:////tmp/duolingo.db"
    if os.environ.get("VERCEL") == "1"
    else "sqlite+aiosqlite:///./db/duolingo.db"
)


class Settings(BaseSettings):
    """Application settings loaded from environment / .env."""

    DATABASE_URL: str = DEFAULT_DATABASE_URL
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,*"
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    DEFAULT_HEARTS: int = 5
    XP_PER_CORRECT: int = 10
    XP_BONUS_LESSON_COMPLETE: int = 10
    HEART_REFILL_GEM_COST: int = 350

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
