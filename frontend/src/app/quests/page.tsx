"use client";

import { useEffect, useState } from "react";
import { Sparkles, Flame, Zap, BookOpen, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { api, UserData } from "@/lib/api";

export default function QuestsPage() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    api.getUser().then(setUser).catch(console.error);
  }, []);

  const quests = [
    {
      title: "Earn 50 XP",
      description: "Complete lessons to earn experience points",
      target: 50,
      current: user?.xp || 0,
      reward: "10 💎",
      icon: Zap,
      color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-950/40",
    },
    {
      title: "Complete 3 Lessons",
      description: "Finish 3 total lessons today",
      target: 3,
      current: 0,
      reward: "15 💎",
      icon: BookOpen,
      color: "text-[#58cc02] bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Keep a 3-Day Streak",
      description: "Practice 3 days in a row without missing",
      target: 3,
      current: user?.streak_days || 0,
      reward: "20 💎",
      icon: Flame,
      color: "text-orange-500 bg-orange-100 dark:bg-orange-950/40",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-400 text-white shadow-md">
              <Sparkles className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">Daily Quests</h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Complete daily challenges to earn extra bonus gems!
            </p>
          </div>

          <div className="space-y-4">
            {quests.map((quest) => {
              const Icon = quest.icon;
              const progress = Math.min(100, (quest.current / quest.target) * 100);
              const isDone = quest.current >= quest.target;

              return (
                <div key={quest.title} className="duo-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${quest.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-extrabold text-base">{quest.title}</div>
                        <div className="text-xs font-bold text-gray-400">{quest.description}</div>
                      </div>
                    </div>

                    <div className="font-black text-sm text-yellow-500">
                      {isDone ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : quest.reward}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-black text-gray-500">
                      <span>Progress</span>
                      <span>{Math.min(quest.current, quest.target)} / {quest.target}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
