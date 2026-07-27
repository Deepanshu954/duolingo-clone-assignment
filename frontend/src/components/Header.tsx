'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Zap, Heart, Gem, Plus, Globe, Sun, Moon, Check } from 'lucide-react';
import { UserData, CourseData, api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { soundFX } from '@/utils/soundFX';

interface HeaderProps {
  user?: UserData | null;
  onRefillHearts?: () => void;
  onCourseChange?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onRefillHearts, onCourseChange }) => {
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeCourse, setActiveCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await api.getCourses();
        setCourses(list);
        if (user) {
          const matched = list.find((c) => c.id === user.active_course_id) || list[0];
          setActiveCourse(matched);
        } else if (list.length > 0) {
          setActiveCourse(list[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    void loadCourses();
  }, [user]);

  const handleSelectCourse = async (course: CourseData) => {
    setShowDropdown(false);
    if (activeCourse?.id === course.id) return;

    try {
      soundFX.playClick();
      await api.setActiveCourse(course.id);
      setActiveCourse(course);
      if (onCourseChange) {
        onCourseChange();
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 py-3 md:px-8 transition-colors">
      {/* Course Flag Selector */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 font-extrabold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
        >
          <span className="text-xl">{activeCourse ? activeCourse.flag_emoji : '🇪🇸'}</span>
          <span className="hidden text-sm md:inline">{activeCourse ? activeCourse.language : 'Spanish'}</span>
          <Globe className="h-4 w-4 text-gray-400 dark:text-slate-400" />
        </button>

        {showDropdown && (
          <div className="absolute left-0 top-12 z-50 w-52 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-xl animate-in fade-in duration-150">
            <div className="mb-2 px-2 text-xs font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Select Language
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {courses.map((c) => {
                const isSelected = activeCourse?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCourse(c)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-[#1cb0f6]'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.flag_emoji}</span>
                      <span>{c.language}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Stats Pill Indicators & Theme Toggle */}
      <div className="flex items-center gap-3 font-bold text-gray-700 dark:text-slate-200">
        {/* Light/Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all hover:scale-105 cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="h-5 w-5 fill-current" /> : <Sun className="h-5 w-5 fill-current" />}
        </button>

        {/* Streak */}
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/30 px-3 py-1 text-orange-500 transition-transform hover:scale-105">
          <Flame className="h-5 w-5 fill-orange-500 stroke-orange-600" />
          <span>{user ? user.streak_days : 0}</span>
        </div>

        {/* Total XP */}
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-yellow-200 dark:border-yellow-900/40 bg-yellow-50 dark:bg-yellow-950/30 px-3 py-1 text-yellow-500 transition-transform hover:scale-105">
          <Zap className="h-5 w-5 fill-yellow-400 stroke-yellow-500" />
          <span className="hidden sm:inline">{user ? user.xp : 0} XP</span>
          <span className="sm:hidden">{user ? user.xp : 0}</span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-sky-200 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/30 px-3 py-1 text-sky-500 transition-transform hover:scale-105">
          <Gem className="h-5 w-5 fill-sky-400 stroke-sky-500" />
          <span>{user ? user.gems : 0}</span>
        </div>

        {/* Hearts with Refill Trigger */}
        <div
          onClick={onRefillHearts}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-3 py-1 text-red-500 transition-transform hover:scale-105 active:scale-95"
          title="Click to Refill Hearts"
        >
          <Heart className="h-5 w-5 fill-red-500 stroke-red-600" />
          <span>{user ? user.hearts : 5}</span>
          {user && user.hearts < 5 && (
            <span className="ml-1 rounded-full bg-red-500 p-0.5 text-white">
              <Plus className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
