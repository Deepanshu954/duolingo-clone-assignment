"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Heart, RefreshCw, Zap, Headphones, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { RefillModal } from "@/components/RefillModal";
import { CustomAlertModal, CustomAlertOptions } from "@/components/CustomAlertModal";
import { api, UserData } from "@/lib/api";
import { soundFX } from "@/utils/soundFX";

export default function PracticePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [practicingMode, setPracticingMode] = useState<string | null>(null);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<CustomAlertOptions | null>(null);

  const loadUser = async () => {
    try {
      const u = await api.getUser();
      setUser(u);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const showAlert = (message: string, title?: string, type: CustomAlertOptions['type'] = 'info') => {
    setAlertOptions({ message, title, type });
  };

  const handleStartPracticeSession = async (mode: string) => {
    setPracticingMode(mode);
    soundFX.playClick();

    try {
      // Get learning path to find unlocked lesson
      const pathData = await api.getPath();
      let targetLessonId: number | null = null;

      for (const unit of pathData.units) {
        for (const skill of unit.skills) {
          if (!skill.is_locked && skill.first_incomplete_lesson_id) {
            targetLessonId = skill.first_incomplete_lesson_id;
            break;
          }
        }
        if (targetLessonId) break;
      }

      if (!targetLessonId) {
        targetLessonId = 1; // Default fallback to first lesson
      }

      const session = await api.startLesson(targetLessonId);
      router.push(`/lesson/${session.session_id}`);
    } catch (e: unknown) {
      soundFX.playWrong();
      showAlert(e instanceof Error ? e.message : "Practice session failed to start", "Practice Error", "error");
      setPracticingMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} onRefillHearts={() => setIsRefillOpen(true)} onCourseChange={loadUser} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500 text-white shadow-md">
              <Swords className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">Practice Hub</h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Sharpen your skills, restore hearts for free, and earn bonus XP!
            </p>
          </div>

          {/* Interactive Practice Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Mistakes Review */}
            <div className="duo-card p-5 flex flex-col items-center text-center hover:border-purple-400 transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-500 mb-3">
                <Swords className="h-7 w-7" />
              </div>
              <h3 className="text-base font-black">Mistakes Review</h3>
              <p className="text-xs font-extrabold text-purple-500 mt-1 mb-4">+15 XP • +1 Heart</p>
              <button
                onClick={() => handleStartPracticeSession("mistakes")}
                disabled={!!practicingMode}
                className="btn-3d btn-3d-blue w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                {practicingMode === "mistakes" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>PRACTICE <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>

            {/* Mode 2: Timed Sprint */}
            <div className="duo-card p-5 flex flex-col items-center text-center border-2 border-yellow-300 dark:border-yellow-900/60 hover:border-yellow-400 transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-950/40 text-yellow-500 mb-3">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-base font-black">Timed Sprint</h3>
              <p className="text-xs font-extrabold text-yellow-500 mt-1 mb-4">+25 XP • 60 Seconds</p>
              <button
                onClick={() => handleStartPracticeSession("sprint")}
                disabled={!!practicingMode}
                className="btn-3d btn-3d-yellow w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                {practicingMode === "sprint" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>START SPRINT <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>

            {/* Mode 3: Listening Practice */}
            <div className="duo-card p-5 flex flex-col items-center text-center hover:border-sky-400 transition-all">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-500 mb-3">
                <Headphones className="h-7 w-7" />
              </div>
              <h3 className="text-base font-black">Listening Focus</h3>
              <p className="text-xs font-extrabold text-sky-500 mt-1 mb-4">+20 XP • Audio Review</p>
              <button
                onClick={() => handleStartPracticeSession("listening")}
                disabled={!!practicingMode}
                className="btn-3d btn-3d-green w-full py-2.5 text-xs font-black flex items-center justify-center gap-1.5"
              >
                {practicingMode === "listening" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>LISTEN NOW <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>

      <RefillModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        onConfirmRefill={() => setIsRefillOpen(false)}
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
