"""Health check router."""

from fastapi import APIRouter

from app.schemas import HealthOut

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthOut)
async def health_check():
    return HealthOut(status="ok")
