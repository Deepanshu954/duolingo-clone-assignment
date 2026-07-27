"""Lesson session routes: start, get status, submit answers."""

import json
import uuid
from datetime import date, datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    DailyXPLog, Exercise, Lesson, LessonSession, Skill, SkillProgress, User,
)
from app.schemas import (
    AnswerResult, AnswerSubmit, ExerciseOut, SessionStartOut, SessionStatusOut,
)

router = APIRouter(tags=["lessons"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _exercise_out(ex: Exercise) -> ExerciseOut:
    """Convert an Exercise model to an ExerciseOut schema (no correct_answer)."""
    return ExerciseOut(
        id=ex.id,
        order=ex.order,
        type=ex.type,
        prompt=ex.prompt,
        target_sentence=ex.target_sentence,
        options=ex.options,
        sentence_parts=ex.sentence_parts,
    )


def _validate_answer(exercise: Exercise, submitted: Any) -> bool:
    """Validate a submitted answer against the exercise's correct answer."""
    ex_type = exercise.type
    correct = exercise.correct_answer

    if ex_type == "multiple_choice":
        # submitted is the chosen option text
        return str(submitted).strip().lower() == correct.strip().lower()

    elif ex_type == "word_bank":
        # submitted is a string of joined words
        return str(submitted).strip().lower() == correct.strip().lower()

    elif ex_type == "match_pairs":
        # submitted is a dict of pairs, correct is a JSON string of pairs
        try:
            correct_pairs = json.loads(correct)
        except (json.JSONDecodeError, TypeError):
            return False
        if not isinstance(submitted, dict):
            return False
        # Normalize and compare
        norm_correct = {k.strip().lower(): v.strip().lower() for k, v in correct_pairs.items()}
        norm_submitted = {str(k).strip().lower(): str(v).strip().lower() for k, v in submitted.items()}
        return norm_correct == norm_submitted

    elif ex_type == "fill_blank":
        return str(submitted).strip().lower() == correct.strip().lower()

    elif ex_type == "type_answer":
        return str(submitted).strip().lower() == correct.strip().lower()

    return False


async def _award_xp(db: AsyncSession, user: User, xp: int) -> None:
    """Award XP to a user and update daily log + streak."""
    user.xp += xp

    # Update daily XP log
    today = date.today()
    result = await db.execute(
        select(DailyXPLog).where(
            DailyXPLog.user_id == user.id,
            DailyXPLog.date == today,
        )
    )
    daily_log = result.scalar_one_or_none()
    if daily_log:
        daily_log.xp += xp
    else:
        daily_log = DailyXPLog(user_id=user.id, date=today, xp=xp)
        db.add(daily_log)

    # Update streak
    if user.streak_last_date != today:
        if user.streak_last_date is None or (today - user.streak_last_date).days == 1:
            user.streak_days += 1
        elif (today - user.streak_last_date).days > 1:
            user.streak_days = 1
        user.streak_last_date = today


async def _check_skill_completion(db: AsyncSession, user: User, lesson: Lesson) -> None:
    """After completing a lesson, update skill progress and potentially unlock next skill."""
    # Get skill progress
    result = await db.execute(
        select(SkillProgress).where(
            SkillProgress.user_id == user.id,
            SkillProgress.skill_id == lesson.skill_id,
        )
    )
    sp = result.scalar_one_or_none()
    if sp is None:
        return

    sp.completed_lessons += 1

    # If skill is fully completed, unlock the next skill
    if sp.completed_lessons >= sp.total_lessons:
        # Find the next skill in the same unit
        skill_result = await db.execute(
            select(Skill).where(Skill.id == lesson.skill_id)
        )
        current_skill = skill_result.scalar_one_or_none()
        if current_skill is None:
            return

        # Find next skill (same unit, next order)
        next_skill_result = await db.execute(
            select(Skill).where(
                Skill.unit_id == current_skill.unit_id,
                Skill.order == current_skill.order + 1,
            )
        )
        next_skill = next_skill_result.scalar_one_or_none()

        # If no next skill in same unit, find first skill of next unit
        if next_skill is None:
            from app.models import Unit
            unit_result = await db.execute(
                select(Unit).where(Unit.id == current_skill.unit_id)
            )
            current_unit = unit_result.scalar_one_or_none()
            if current_unit:
                next_unit_result = await db.execute(
                    select(Unit).where(
                        Unit.course_id == current_unit.course_id,
                        Unit.order == current_unit.order + 1,
                    )
                )
                next_unit = next_unit_result.scalar_one_or_none()
                if next_unit:
                    next_skill_result = await db.execute(
                        select(Skill).where(
                            Skill.unit_id == next_unit.id,
                            Skill.order == 1,
                        )
                    )
                    next_skill = next_skill_result.scalar_one_or_none()

        if next_skill:
            next_progress_result = await db.execute(
                select(SkillProgress).where(
                    SkillProgress.user_id == user.id,
                    SkillProgress.skill_id == next_skill.id,
                )
            )
            next_sp = next_progress_result.scalar_one_or_none()
            if next_sp:
                next_sp.is_locked = False


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/lessons/{lesson_id}/start", response_model=SessionStartOut)
async def start_lesson(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify lesson exists
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.exercises))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Check skill is unlocked
    sp_result = await db.execute(
        select(SkillProgress).where(
            SkillProgress.user_id == user.id,
            SkillProgress.skill_id == lesson.skill_id,
        )
    )
    sp = sp_result.scalar_one_or_none()
    if sp and sp.is_locked:
        raise HTTPException(status_code=403, detail="Skill is locked")

    # Check hearts
    if user.hearts <= 0:
        raise HTTPException(status_code=403, detail="No hearts remaining")

    exercises = sorted(lesson.exercises, key=lambda e: e.order)
    if not exercises:
        raise HTTPException(status_code=400, detail="Lesson has no exercises")

    # Create session
    session = LessonSession(
        id=str(uuid.uuid4()),
        user_id=user.id,
        lesson_id=lesson_id,
        current_index=0,
        total=len(exercises),
        correct=0,
        xp_earned=0,
    )
    db.add(session)
    await db.flush()

    return SessionStartOut(
        session_id=session.id,
        total_exercises=len(exercises),
        current_index=0,
        exercise=_exercise_out(exercises[0]),
    )


@router.get("/lessons/sessions/{session_id}", response_model=SessionStatusOut)
async def get_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LessonSession).where(LessonSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    completed = session.completed_at is not None

    # Get current exercise if not completed
    exercise_out = None
    if not completed:
        ex_result = await db.execute(
            select(Exercise)
            .where(Exercise.lesson_id == session.lesson_id)
            .order_by(Exercise.order)
        )
        exercises = ex_result.scalars().all()
        if session.current_index < len(exercises):
            exercise_out = _exercise_out(exercises[session.current_index])

    return SessionStatusOut(
        session_id=session.id,
        lesson_id=session.lesson_id,
        current_index=session.current_index,
        total=session.total,
        correct=session.correct,
        xp_earned=session.xp_earned,
        hearts=user.hearts,
        completed=completed,
        exercise=exercise_out,
    )


@router.post("/lessons/sessions/{session_id}/submit", response_model=AnswerResult)
async def submit_answer(
    session_id: str,
    body: AnswerSubmit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Load session
    result = await db.execute(
        select(LessonSession).where(LessonSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.completed_at is not None:
        raise HTTPException(status_code=400, detail="Session already completed")

    if user.hearts <= 0:
        raise HTTPException(status_code=403, detail="No hearts remaining")

    # Get exercises for this lesson
    ex_result = await db.execute(
        select(Exercise)
        .where(Exercise.lesson_id == session.lesson_id)
        .order_by(Exercise.order)
    )
    exercises = ex_result.scalars().all()

    if session.current_index >= len(exercises):
        raise HTTPException(status_code=400, detail="No more exercises")

    current_exercise = exercises[session.current_index]

    # Validate answer
    is_correct = _validate_answer(current_exercise, body.answer)

    if is_correct:
        session.correct += 1
        session.xp_earned += settings.XP_PER_CORRECT
        await _award_xp(db, user, settings.XP_PER_CORRECT)
    else:
        user.hearts = max(0, user.hearts - 1)

    # Advance to next exercise
    session.current_index += 1
    completed = False

    # Check if session is complete (all exercises done or no hearts)
    if session.current_index >= len(exercises):
        prior_completion_result = await db.execute(
            select(LessonSession.id).where(
                LessonSession.user_id == user.id,
                LessonSession.lesson_id == session.lesson_id,
                LessonSession.completed_at.isnot(None),
                LessonSession.id != session.id,
            ).limit(1)
        )
        already_completed_lesson = prior_completion_result.scalar_one_or_none() is not None

        completed = True
        session.completed_at = datetime.now(timezone.utc)

        if not already_completed_lesson:
            session.xp_earned += settings.XP_BONUS_LESSON_COMPLETE
            await _award_xp(db, user, settings.XP_BONUS_LESSON_COMPLETE)

            lesson_result = await db.execute(
                select(Lesson).where(Lesson.id == session.lesson_id)
            )
            lesson = lesson_result.scalar_one_or_none()
            if lesson:
                await _check_skill_completion(db, user, lesson)

    elif user.hearts <= 0:
        # Out of hearts — session ends but not "completed"
        pass

    # Get next exercise if available
    next_exercise = None
    if not completed and session.current_index < len(exercises) and user.hearts > 0:
        next_exercise = _exercise_out(exercises[session.current_index])

    await db.flush()

    return AnswerResult(
        is_correct=is_correct,
        correct_answer=current_exercise.correct_answer,
        xp_earned=session.xp_earned,
        hearts=user.hearts,
        current_index=session.current_index,
        total=session.total,
        completed=completed,
        exercise=next_exercise,
    )
