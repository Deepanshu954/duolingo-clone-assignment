'use client';

import React from 'react';
import { Crown, Flame } from 'lucide-react';
import { UserData } from '@/lib/api';
import Link from 'next/link';

interface RightSidebarProps {
  user: UserData | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ user }) => {
  return (
    <aside className="hidden lg:block w-80 px-6 py-8 space-y-6">
      {/* Super Duolingo Banner */}
      <div className="rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-white shadow-lg dark:border-yellow-900/60">
        <div className="flex items-center gap-2 font-extrabold text-xs tracking-wider uppercase">
          <Crown className="h-5 w-5 fill-yellow-200 stroke-yellow-900" /> Super Duolingo
        </div>
        <h3 className="mt-2 text-xl font-extrabold text-yellow-950">Unlimited Hearts & Perks</h3>
        <p className="mt-1 text-xs font-bold text-yellow-900/80">No ads, unlimited mistakes, and bonus XP multiplier boost!</p>
        <Link
          href="/shop"
          className="btn-3d btn-3d-yellow mt-4 flex w-full items-center justify-center py-2.5 text-xs font-extrabold rounded-2xl"
        >
          TRY SUPER FREE
        </Link>
      </div>

      {/* Quest Progress Card */}
      <div className="space-y-4 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-800">
        <div className="flex items-center justify-between font-extrabold">
          <span className="text-gray-800 dark:text-slate-100 text-sm">Daily Quests</span>
          <Link href="/quests" className="text-xs text-[#1cb0f6] hover:underline uppercase">View All</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 font-bold">
            <Flame className="h-5 w-5 fill-orange-400" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs font-extrabold text-gray-700 dark:text-slate-300">
              <span>Earn 50 XP</span>
              <span>{Math.min(user?.xp || 0, 50)} / 50</span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((user?.xp || 0) / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
