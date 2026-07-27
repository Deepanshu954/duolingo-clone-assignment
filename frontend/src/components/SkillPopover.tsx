'use client';

import React from 'react';
import { X, Play, BookOpen, Check, Sparkles, Pencil, Trophy } from 'lucide-react';
import { SkillProgress } from '@/lib/api';

interface SkillPopoverProps {
  skill: SkillProgress | null;
  onClose: () => void;
  onStartLesson: (lessonId: number) => void;
}

export const SkillPopover: React.FC<SkillPopoverProps> = ({ skill, onClose, onStartLesson }) => {
  if (!skill) return null;

  const lessons = skill.lessons || [];

  const getLessonCategoryBadge = (order: number) => {
    if (order === 1) return { tag: 'NEW WORDS & PHONETICS', icon: Sparkles, color: 'text-purple-500 bg-purple-100 dark:bg-purple-950/60' };
    if (order === 2) return { tag: 'SENTENCE BUILDING', icon: Pencil, color: 'text-sky-500 bg-sky-100 dark:bg-sky-950/60' };
    return { tag: 'FLUENCY CHALLENGE', icon: Trophy, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/60' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#58cc02] text-white shadow-md text-3xl">
          {skill.icon || <BookOpen className="h-8 w-8" />}
        </div>

        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-slate-100">{skill.title}</h3>
        <p className="mt-1 text-xs font-bold text-gray-400 dark:text-slate-400">
          Lesson {skill.completed_lessons} of {skill.total_lessons} Completed
        </p>

        <div className="my-6 space-y-2.5 max-h-72 overflow-y-auto">
          {lessons.map((lesson) => {
            const isCompleted = lesson.order <= skill.completed_lessons;
            const badge = getLessonCategoryBadge(lesson.order);
            const BadgeIcon = badge.icon;

            return (
              <button
                key={lesson.id}
                onClick={() => onStartLesson(lesson.id)}
                className={`flex w-full items-center justify-between rounded-2xl border-2 p-3.5 text-left font-bold transition-all cursor-pointer ${
                  isCompleted
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-200'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-[#58cc02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-black text-xs ${
                    isCompleted ? 'bg-yellow-400 text-yellow-950' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : lesson.order}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${badge.color}`}>
                        <BadgeIcon className="h-3 w-3" /> {badge.tag}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold">{lesson.title}</div>
                    <div className="text-xs font-semibold text-gray-400 dark:text-slate-400">+{lesson.xp_reward} XP</div>
                  </div>
                </div>
                <Play className="h-5 w-5 fill-current text-[#58cc02]" />
              </button>
            );
          })}

          {lessons.length === 0 && skill.first_incomplete_lesson_id && (
            <button
              onClick={() => onStartLesson(skill.first_incomplete_lesson_id!)}
              className="btn-3d btn-3d-green w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5 fill-current" />
              START LESSON (+10 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
