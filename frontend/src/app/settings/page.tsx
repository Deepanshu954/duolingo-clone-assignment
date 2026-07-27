"use client";

import { useEffect, useState } from "react";
import { Settings, Volume2, Moon, User, Globe, Shield } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { useTheme } from "@/context/ThemeContext";
import { api, UserData } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    api.getUser().then(setUser).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-600 text-white shadow-md">
              <Settings className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">Settings</h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Manage your preferences and profile settings.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">Account Profile</h2>
            <div className="duo-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#1cb0f6]" />
                <div>
                  <div className="font-extrabold text-sm">Learner Identity</div>
                  <div className="text-xs text-gray-400 font-bold">Logged-in default user (ID 1)</div>
                </div>
              </div>
              <span className="text-sm font-black text-[#1cb0f6]">@{user?.username || "learner"}</span>
            </div>

            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 pt-4">App Preferences</h2>
            <div className="duo-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-extrabold text-sm">Theme Mode</div>
                  <div className="text-xs text-gray-400 font-bold">Currently using {theme} mode</div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="btn-3d btn-3d-blue py-1.5 px-3 text-xs"
              >
                TOGGLE ({theme.toUpperCase()})
              </button>
            </div>

            <div className="duo-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-[#58cc02]" />
                <div>
                  <div className="font-extrabold text-sm">Sound Effects</div>
                  <div className="text-xs text-gray-400 font-bold">Play Web Audio oscillator sounds</div>
                </div>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`btn-3d py-1.5 px-3 text-xs ${soundEnabled ? 'btn-3d-green' : 'btn-3d-red'}`}
              >
                {soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            </div>

            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 pt-4">Course Info</h2>
            <div className="duo-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-extrabold text-sm">Target Language</div>
                  <div className="text-xs text-gray-400 font-bold">Seeded Spanish Course (3 Units, 9 Skills)</div>
                </div>
              </div>
              <span className="text-xl">🇪🇸</span>
            </div>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
