from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment / .env."""

    DATABASE_URL: str = "sqlite+aiosqlite:///./db/duolingo.db"
    CORS_ORIGINS: str = "http://localhost:3000"
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app"
    DEFAULT_HEARTS: int = 5
    XP_PER_CORRECT: int = 10
    XP_BONUS_LESSON_COMPLETE: int = 10
    HEART_REFILL_GEM_COST: int = 350

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
