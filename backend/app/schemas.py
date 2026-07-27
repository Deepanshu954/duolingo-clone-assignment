"""Pydantic schemas for API request/response models."""

from datetime import date, datetime
from typing import Any, Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# User / Profile
# ---------------------------------------------------------------------------

class CourseOut(BaseModel):
    id: int
    language: str
    code: str
    flag_emoji: str

    class Config:
        from_attributes = True


class CourseSelectIn(BaseModel):
    course_id: int


class UserOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str
    xp: int
    hearts: int
    streak_days: int
    gems: int
    active_course_id: int = 1
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileOut(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str
    xp: int
    hearts: int
    streak_days: int
    gems: int
    active_course_id: int = 1
    created_at: datetime
    total_lessons_completed: int
    current_course: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Learning Path
# ---------------------------------------------------------------------------

class LessonOut(BaseModel):
    id: int
    order: int
    title: str = "Lesson"
    xp_reward: int = 10

    class Config:
        from_attributes = True


class SkillProgressOut(BaseModel):
    skill_id: int
    title: str
    icon: str
    completed_lessons: int
    total_lessons: int
    is_locked: bool
    first_incomplete_lesson_id: Optional[int] = None
    lessons: list[LessonOut] = []

    class Config:
        from_attributes = True


class UnitOut(BaseModel):
    id: int
    order: int
    title: str
    description: str
    color: str
    skills: list[SkillProgressOut]

    class Config:
        from_attributes = True


class PathOut(BaseModel):
    course: str
    flag_emoji: str
    units: list[UnitOut]


# ---------------------------------------------------------------------------
# Exercises & Lessons
# ---------------------------------------------------------------------------

class ExerciseOut(BaseModel):
    id: int
    order: int
    type: str
    prompt: str
    target_sentence: Optional[str] = None
    options: Optional[Any] = None
    sentence_parts: Optional[Any] = None
    # Note: correct_answer is NOT sent to the client

    class Config:
        from_attributes = True


class SessionStartOut(BaseModel):
    session_id: str
    total_exercises: int
    current_index: int
    exercise: ExerciseOut


class SessionStatusOut(BaseModel):
    session_id: str
    lesson_id: int
    current_index: int
    total: int
    correct: int
    xp_earned: int
    hearts: int
    completed: bool
    exercise: Optional[ExerciseOut] = None


class AnswerSubmit(BaseModel):
    answer: Any  # string, int, list, or dict depending on exercise type


class AnswerResult(BaseModel):
    is_correct: bool
    correct_answer: str
    xp_earned: int
    hearts: int
    current_index: int
    total: int
    completed: bool
    exercise: Optional[ExerciseOut] = None  # Next exercise, None if completed


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

class LeaderboardEntry(BaseModel):
    rank: int
    id: int
    username: str
    display_name: str
    avatar_url: str
    xp: int

    class Config:
        from_attributes = True


class LeaderboardOut(BaseModel):
    entries: list[LeaderboardEntry]
    current_user_rank: int


# ---------------------------------------------------------------------------
# Progress / Hearts
# ---------------------------------------------------------------------------

class HeartRefillOut(BaseModel):
    hearts: int
    gems: int
    message: str


class SimulateDayOut(BaseModel):
    streak_days: int
    streak_last_date: Optional[date] = None
    message: str


# ---------------------------------------------------------------------------
# Shop / Coupon / Gems
# ---------------------------------------------------------------------------

class CouponRedeemIn(BaseModel):
    code: str


class CouponRedeemOut(BaseModel):
    success: bool
    message: str
    gems_added: int
    new_gem_balance: int


class BuyGemsIn(BaseModel):
    gems: int


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class HealthOut(BaseModel):
    status: str
