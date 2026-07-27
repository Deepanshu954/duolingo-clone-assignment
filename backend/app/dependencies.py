"""FastAPI dependencies."""

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User


async def get_current_user(
    x_user_id: int = Header(default=1, alias="X-User-ID"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Simplified auth: reads X-User-ID header, defaults to user 1.
    No external auth provider needed for this assignment.
    """
    result = await db.execute(select(User).where(User.id == x_user_id))
    user = result.scalar_one_or_none()
    if user is None:
        # Fallback to user 1 if the header user doesn't exist
        result = await db.execute(select(User).where(User.id == 1))
        user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
