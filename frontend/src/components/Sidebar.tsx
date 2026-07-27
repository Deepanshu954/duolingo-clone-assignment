'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Trophy, ShoppingBag, User, Settings, Swords, Sparkles, Languages, MoreHorizontal } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Hide sidebar during lesson execution
  if (pathname.startsWith('/lesson/')) return null;

  const navItems = [
    { label: 'LEARN', href: '/', icon: BookOpen, color: 'text-[#58cc02]' },
    { label: 'LETTERS', href: '/letters', icon: Languages, color: 'text-sky-500' },
    { label: 'PRACTICE', href: '/practice', icon: Swords, color: 'text-purple-500' },
    { label: 'LEADERBOARDS', href: '/leaderboard', icon: Trophy, color: 'text-yellow-500' },
    { label: 'QUESTS', href: '/quests', icon: Sparkles, color: 'text-orange-500' },
    { label: 'SHOP', href: '/shop', icon: ShoppingBag, color: 'text-emerald-500' },
    { label: 'PROFILE', href: '/profile', icon: User, color: 'text-[#1cb0f6]' },
    { label: 'MORE', href: '/settings', icon: MoreHorizontal, color: 'text-gray-400' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:block z-30 transition-colors">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#58cc02] text-xl font-extrabold text-white shadow-md">
            🦉
          </div>
          <span className="text-2xl font-black text-[#58cc02] tracking-wider">duolingo</span>
        </div>

        <nav className="mt-2 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-xs font-black tracking-wider transition-all ${
                  isActive
                    ? 'border-2 border-[#84d841] bg-emerald-50 dark:bg-emerald-950/40 text-[#58cc02] shadow-xs'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#58cc02]' : item.color}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 md:hidden">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center p-1.5 text-[9px] font-extrabold ${
                  isActive ? 'text-[#58cc02]' : 'text-gray-400 dark:text-slate-500'
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
