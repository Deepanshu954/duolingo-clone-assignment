"""User, profile, and course selection routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, LessonSession, Course
from app.schemas import UserOut, ProfileOut, CourseOut, CourseSelectIn

router = APIRouter(tags=["user"])


@router.get("/user/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/courses", response_model=list[CourseOut])
async def get_courses(db: AsyncSession = Depends(get_db)):
    """List all available language courses."""
    result = await db.execute(select(Course).order_by(Course.id))
    return result.scalars().all()


@router.post("/user/active-course")
async def set_active_course(
    payload: CourseSelectIn,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Switch learner's active language course."""
    result = await db.execute(select(Course).where(Course.id == payload.course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    user.active_course_id = course.id
    await db.flush()

    return {
        "success": True,
        "message": f"Switched active course to {course.language} {course.flag_emoji}",
        "active_course_id": course.id,
        "language": course.language,
    }


@router.get("/profile", response_model=ProfileOut)
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Count completed lessons
    result = await db.execute(
        select(func.count())
        .select_from(LessonSession)
        .where(
            LessonSession.user_id == user.id,
            LessonSession.completed_at.isnot(None),
        )
    )
    total_lessons = result.scalar() or 0

    # Get active course
    course_result = await db.execute(select(Course).where(Course.id == user.active_course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        course_result = await db.execute(select(Course).limit(1))
        course = course_result.scalar_one_or_none()

    course_name = course.language if course else "Spanish"

    return ProfileOut(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        xp=user.xp,
        hearts=user.hearts,
        streak_days=user.streak_days,
        gems=user.gems,
        active_course_id=user.active_course_id,
        created_at=user.created_at,
        total_lessons_completed=total_lessons,
        current_course=course_name,
    )
