'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Lock, Star, Sparkles, BookOpen, Heart, Flame, Layers, RotateCcw } from 'lucide-react';

import { CustomAlertModal, CustomAlertOptions } from '@/components/CustomAlertModal';
import { Header } from '@/components/Header';
import { RefillModal } from '@/components/RefillModal';
import { RightSidebar } from '@/components/RightSidebar';
import { Sidebar } from '@/components/Sidebar';
import { SkillPopover } from '@/components/SkillPopover';
import { api, PathData, SkillProgress, UserData } from '@/lib/api';
import { soundFX } from '@/utils/soundFX';

export default function LearnPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [path, setPath] = useState<PathData | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillProgress | null>(null);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<CustomAlertOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showAlert = (message: string, title?: string, type: CustomAlertOptions['type'] = 'info') => {
    setAlertOptions({ message, title, type });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [userData, pathData] = await Promise.all([api.getUser(), api.getPath()]);
      setUser(userData);
      setPath(pathData);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRefillConfirm = async () => {
    try {
      await api.refillHearts();
      setUser(await api.getUser());
      setIsRefillOpen(false);
      soundFX.playCorrect();
      showAlert('Your hearts are full again.', 'Hearts Refilled', 'success');
    } catch (error: unknown) {
      soundFX.playWrong();
      showAlert(error instanceof Error ? error.message : 'Failed to refill hearts', 'Refill Error', 'error');
    }
  };

  const handleStartLesson = async (lessonId: number) => {
    try {
      soundFX.playClick();
      const session = await api.startLesson(lessonId);
      router.push(`/lesson/${session.session_id}`);
    } catch (error: unknown) {
      soundFX.playWrong();
      if ((error as Error).message.includes('No hearts remaining') || (error as Error).message.includes('hearts')) {
        setSelectedSkill(null);
        setIsRefillOpen(true);
        return;
      }
      showAlert(error instanceof Error ? error.message : 'Could not start lesson', 'Lesson Error', 'error');
    }
  };

  const getCefrTier = (unitOrder: number) => {
    if (unitOrder <= 3) return { level: 'CEFR A1', title: 'Foundations & Basics', color: 'bg-emerald-500' };
    if (unitOrder <= 6) return { level: 'CEFR A2', title: 'Elementary Routine & Travel', color: 'bg-sky-500' };
    return { level: 'CEFR B1', title: 'Intermediate Expression', color: 'bg-purple-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} onRefillHearts={() => setIsRefillOpen(true)} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl">
          {/* CEFR Learning Path Hero Banner */}
          <section className="mb-8 rounded-3xl border-2 border-sky-400 bg-gradient-to-br from-[#1cb0f6] to-blue-600 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-sky-100">
                <Layers className="h-4 w-4" /> CEFR STANDARD PATHWAY
              </span>
              <span className="flex items-center gap-1 text-xs font-black text-yellow-300">
                <RotateCcw className="h-3.5 w-3.5" /> Memory Health: 96%
              </span>
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-black">{path?.course || 'Spanish'} Path</h1>
            <p className="mt-1 max-w-xl text-sm font-bold text-white/90">
              Master CEFR proficiency tiers through spaced repetition, vocabulary definitions, and interactive speech challenges.
            </p>
          </section>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#58cc02] border-t-transparent" />
            </div>
          ) : errorMessage ? (
            <div className="duo-card p-6 text-center">
              <p className="font-bold text-red-500">{errorMessage}</p>
              <button onClick={loadData} className="btn-3d btn-3d-red mt-4">
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {path?.units.map((unit, uIdx) => {
                const cefr = getCefrTier(unit.order);
                const showCefrHeader = uIdx === 0 || getCefrTier(path.units[uIdx - 1].order).level !== cefr.level;

                return (
                  <section key={unit.id} className="space-y-6">
                    {/* CEFR Level Tier Header */}
                    {showCefrHeader && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                        <span className={`rounded-xl ${cefr.color} px-3 py-1 text-xs font-black text-white uppercase tracking-wider shadow-sm`}>
                          {cefr.level}
                        </span>
                        <h3 className="text-sm font-black text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          {cefr.title}
                        </h3>
                      </div>
                    )}

                    {/* Unit Banner */}
                    <div className="rounded-3xl p-6 text-white shadow-md transition-transform hover:scale-[1.01] relative overflow-hidden" style={{ backgroundColor: unit.color }}>
                      {unit.is_premium_locked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="bg-purple-500 text-white text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                            <Lock className="h-4 w-4" /> PREMIUM REQUIRED TO UNLOCK
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase tracking-wider text-white/80">{unit.title}</span>
                        <span className="text-xs font-extrabold bg-black/20 px-2.5 py-0.5 rounded-lg">3 Skills</span>
                      </div>
                      <h2 className="text-xl font-black leading-snug">{unit.description}</h2>
                    </div>

                    {/* Winding Skill Path */}
                    <div className="relative flex flex-col items-center gap-8 py-4">
                      {unit.skills.map((skill, index) => {
                        const offsets = [0, 42, -42, 28, -28];
                        const isUnlocked = !skill.is_locked;
                        const isCompleted = skill.completed_lessons >= skill.total_lessons;

                        return (
                          <div
                            key={skill.skill_id}
                            className="relative flex flex-col items-center"
                            style={{ transform: `translateX(${offsets[index % offsets.length]}px)` }}
                          >
                            {/* Star Progress Badge */}
                            <div className="absolute -top-3 z-10 flex h-7 items-center rounded-full border-2 border-yellow-400 bg-yellow-300 px-2 text-xs font-black text-yellow-900 shadow-xs">
                              <Star className="mr-1 h-3.5 w-3.5 fill-yellow-600 stroke-yellow-700" />
                              {skill.completed_lessons}/{skill.total_lessons}
                            </div>

                            {/* Skill Bubble Button */}
                            <button
                              onClick={() => {
                                soundFX.playClick();
                                if (isUnlocked) setSelectedSkill(skill);
                              }}
                              disabled={!isUnlocked}
                              className={`relative flex h-24 w-24 items-center justify-center rounded-full border-b-8 transition cursor-pointer ${
                                isCompleted
                                  ? 'border-yellow-600 bg-yellow-400 text-white shadow-lg hover:scale-105'
                                  : isUnlocked
                                    ? 'border-[#46a302] bg-[#58cc02] text-white shadow-lg hover:scale-105'
                                    : 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                              }`}
                              aria-label={skill.title}
                            >
                              {isCompleted ? (
                                <Check className="h-12 w-12 stroke-[3]" />
                              ) : isUnlocked ? (
                                <span className="text-3xl">{skill.icon || '⭐'}</span>
                              ) : (
                                <Lock className="h-10 w-10" />
                              )}
                            </button>

                            <span className="mt-2 text-center text-sm font-black text-gray-700 dark:text-slate-200">
                              {skill.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>

        <RightSidebar user={user} />
      </div>

      <SkillPopover
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onStartLesson={handleStartLesson}
      />
      <RefillModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        onConfirmRefill={handleRefillConfirm}
        userGems={user?.gems || 0}
      />
      <CustomAlertModal
        isOpen={!!alertOptions}
        onClose={() => setAlertOptions(null)}
        options={alertOptions}
      />
    </div>
  );
}
