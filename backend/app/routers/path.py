"""Learning path router — returns the course structure with user progress."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Course, Lesson, LessonSession, Skill, SkillProgress, Unit, User
from app.schemas import PathOut, SkillProgressOut, UnitOut

router = APIRouter(tags=["path"])


@router.get("/path", response_model=PathOut)
async def get_learning_path(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Load active course with units and skills
    result = await db.execute(
        select(Course)
        .where(Course.id == user.active_course_id)
        .options(
            selectinload(Course.units)
            .selectinload(Unit.skills)
            .selectinload(Skill.lessons)
        )
    )
    course = result.scalar_one_or_none()
    if course is None:
        result = await db.execute(
            select(Course)
            .options(
                selectinload(Course.units)
                .selectinload(Unit.skills)
                .selectinload(Skill.lessons)
            )
            .limit(1)
        )
        course = result.scalar_one_or_none()
    if course is None:
        return PathOut(course="Spanish", flag_emoji="🇪🇸", units=[])

    # Load user's skill progress
    progress_result = await db.execute(
        select(SkillProgress).where(SkillProgress.user_id == user.id)
    )
    progress_map = {sp.skill_id: sp for sp in progress_result.scalars().all()}

    # Load user's completed lesson sessions to find first incomplete lesson
    completed_result = await db.execute(
        select(LessonSession.lesson_id)
        .where(
            LessonSession.user_id == user.id,
            LessonSession.completed_at.isnot(None),
        )
    )
    completed_lesson_ids = set(completed_result.scalars().all())

    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    # Check if user actually has an active premium
    has_active_premium = (
        user.is_premium
        and user.premium_until is not None
        and user.premium_until.replace(tzinfo=timezone.utc) > now
    )

    units_out = []
    for unit in sorted(course.units, key=lambda u: u.order):
        is_premium_locked = False
        if unit.order > 1 and not has_active_premium:
            is_premium_locked = True

        skills_out = []
        for skill in sorted(unit.skills, key=lambda s: s.order):
            sp = progress_map.get(skill.id)
            if has_active_premium or unit.order == 1:
                is_locked = False
            else:
                is_locked = True
                
            if is_premium_locked:
                is_locked = True
            
            completed = sp.completed_lessons if sp else 0
            total = sp.total_lessons if sp else len(skill.lessons)

            # Lessons list for popover
            from app.schemas import LessonOut
            sorted_lessons = sorted(skill.lessons, key=lambda l: l.order)
            lessons_out = [
                LessonOut(id=l.id, order=l.order, title=f"Lesson {l.order}", xp_reward=10)
                for l in sorted_lessons
            ]

            # Find the first incomplete lesson for this skill
            first_incomplete = None
            if not is_locked:
                for lesson in sorted_lessons:
                    if lesson.id not in completed_lesson_ids:
                        first_incomplete = lesson.id
                        break

            skills_out.append(SkillProgressOut(
                skill_id=skill.id,
                title=skill.title,
                icon=skill.icon,
                completed_lessons=completed,
                total_lessons=total,
                is_locked=is_locked,
                first_incomplete_lesson_id=first_incomplete,
                lessons=lessons_out,
            ))

        units_out.append(UnitOut(
            id=unit.id,
            order=unit.order,
            title=unit.title,
            description=unit.description,
            color=unit.color,
            is_premium_locked=is_premium_locked,
            skills=skills_out,
        ))

    return PathOut(
        course=course.language,
        flag_emoji=course.flag_emoji,
        units=units_out,
    )
