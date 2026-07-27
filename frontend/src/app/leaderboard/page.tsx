"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { api, LeaderboardData, UserData } from "@/lib/api";

export default function LeaderboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getUser(), api.getLeaderboard()])
      .then(([userData, leaderboardData]) => {
        setUser(userData);
        setData(leaderboardData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="font-black text-gray-400 dark:text-slate-500">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-yellow-950 shadow-md">
              <Trophy className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">Diamond League</h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Top learners get promoted to the next league every Sunday!
            </p>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#58cc02] border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3">
              {data?.entries.map((entry) => {
                const isCurrentUser = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between rounded-2xl border-2 p-4 font-bold transition-all ${
                      isCurrentUser
                        ? "border-[#1cb0f6] bg-sky-50 dark:bg-sky-950/40 text-[#1cb0f6] shadow-sm"
                        : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-xl">
                        {entry.avatar_url}
                      </div>
                      <div>
                        <div className="font-extrabold">{entry.display_name}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-400 font-semibold">@{entry.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-yellow-500 font-black">
                      <Zap className="h-4 w-4 fill-yellow-400" />
                      <span>{entry.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
