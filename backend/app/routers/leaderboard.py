"""Leaderboard router."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LeaderboardEntry, LeaderboardOut

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard", response_model=LeaderboardOut)
async def get_leaderboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).order_by(User.xp.desc())
    )
    all_users = result.scalars().all()

    entries = []
    current_user_rank = 1
    for i, u in enumerate(all_users, start=1):
        entries.append(LeaderboardEntry(
            rank=i,
            id=u.id,
            username=u.username,
            display_name=u.display_name,
            avatar_url=u.avatar_url,
            xp=u.xp,
        ))
        if u.id == user.id:
            current_user_rank = i

    return LeaderboardOut(entries=entries, current_user_rank=current_user_rank)
