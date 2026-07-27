"""SQLAlchemy ORM models for the Duolingo clone."""

import uuid
from datetime import date as py_date, datetime, timezone
from typing import Any, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(255), default="")
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hearts: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_last_date: Mapped[Optional[py_date]] = mapped_column(Date, nullable=True)
    gems: Mapped[int] = mapped_column(Integer, default=500, nullable=False)
    active_course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    active_course: Mapped["Course"] = relationship("Course")
    skill_progresses: Mapped[list["SkillProgress"]] = relationship("SkillProgress", back_populates="user")
    lesson_sessions: Mapped[list["LessonSession"]] = relationship("LessonSession", back_populates="user")
    daily_xp_logs: Mapped[list["DailyXPLog"]] = relationship("DailyXPLog", back_populates="user")


# ---------------------------------------------------------------------------
# Course structure: Course → Unit → Skill → Lesson → Exercise
# ---------------------------------------------------------------------------

class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    language: Mapped[str] = mapped_column(String(50), nullable=False)
    code: Mapped[str] = mapped_column(String(10), default="es", nullable=False)
    flag_emoji: Mapped[str] = mapped_column(String(10), default="🇪🇸")

    units: Mapped[list["Unit"]] = relationship("Unit", back_populates="course", order_by="Unit.order")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(String(255), default="")
    color: Mapped[str] = mapped_column(String(20), default="#58CC02")

    course: Mapped["Course"] = relationship("Course", back_populates="units")
    skills: Mapped[list["Skill"]] = relationship("Skill", back_populates="unit", order_by="Skill.order")


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("units.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(10), default="⭐")

    unit: Mapped["Unit"] = relationship("Unit", back_populates="skills")
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", back_populates="skill", order_by="Lesson.order")
    progresses: Mapped[list["SkillProgress"]] = relationship("SkillProgress", back_populates="skill")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)

    skill: Mapped["Skill"] = relationship("Skill", back_populates="lessons")
    exercises: Mapped[list["Exercise"]] = relationship("Exercise", back_populates="lesson", order_by="Exercise.order")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    target_sentence: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    sentence_parts: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="exercises")


# ---------------------------------------------------------------------------
# Progress tracking
# ---------------------------------------------------------------------------

class SkillProgress(Base):
    __tablename__ = "skill_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="skill_progresses")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="progresses")


class LessonSession(Base):
    __tablename__ = "lesson_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    current_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="lesson_sessions")


class DailyXPLog(Base):
    __tablename__ = "daily_xp_logs"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_date_xp"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    date: Mapped[py_date] = mapped_column(Date, default=py_date.today, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="daily_xp_logs")
