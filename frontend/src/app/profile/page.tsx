"use client";

import { useEffect, useState } from "react";
import { User, Flame, Zap, Gem, BookOpen, Calendar, Award, Globe, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { api, ProfileData, UserData, CourseData } from "@/lib/api";
import { soundFX } from "@/utils/soundFX";

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [userData, profileData, coursesList] = await Promise.all([
        api.getUser(),
        api.getProfile(),
        api.getCourses(),
      ]);
      setUser(userData);
      setProfile(profileData);
      setCourses(coursesList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSelectCourse = async (courseId: number) => {
    if (user?.active_course_id === courseId) return;
    try {
      soundFX.playClick();
      await api.setActiveCourse(courseId);
      await loadData();
      soundFX.playCorrect();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 md:pl-64 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#58cc02] border-t-transparent" />
      </div>
    );
  }

  const joinedDate = profile ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} onCourseChange={loadData} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl space-y-8">
          {/* User Header */}
          <div className="duo-card p-6 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-5xl border-4 border-[#58cc02]">
              {profile?.avatar_url || "🧑‍🎓"}
            </div>
            <div>
              <h1 className="text-2xl font-black">{profile?.display_name}</h1>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-400">@{profile?.username}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Multi-Language Selector */}
          <div>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-sky-500" /> Active Language Course
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {courses.map((c) => {
                const isSelected = user?.active_course_id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCourse(c.id)}
                    className={`duo-card p-4 flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-sky-400 bg-sky-50 dark:bg-sky-950/40 shadow-sm"
                        : "hover:border-sky-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{c.flag_emoji}</span>
                      <span className="text-sm font-extrabold">{c.language}</span>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-sky-500 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <h2 className="text-xl font-black mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="duo-card p-4 flex items-center gap-4">
                <Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
                <div>
                  <div className="text-xl font-black text-orange-500">{profile?.streak_days}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day Streak</div>
                </div>
              </div>

              <div className="duo-card p-4 flex items-center gap-4">
                <Zap className="h-8 w-8 text-yellow-500 fill-yellow-400" />
                <div>
                  <div className="text-xl font-black text-yellow-500">{profile?.xp}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total XP</div>
                </div>
              </div>

              <div className="duo-card p-4 flex items-center gap-4">
                <Gem className="h-8 w-8 text-sky-500 fill-sky-400" />
                <div>
                  <div className="text-xl font-black text-sky-500">{profile?.gems}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gems Balance</div>
                </div>
              </div>

              <div className="duo-card p-4 flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-[#58cc02]" />
                <div>
                  <div className="text-xl font-black text-[#58cc02]">{profile?.total_lessons_completed}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lessons Done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-xl font-black mb-4">Achievements</h2>
            <div className="space-y-3">
              {[
                { title: "First Step", desc: "Complete your first lesson", icon: "🌟", unlocked: (profile?.total_lessons_completed || 0) > 0 },
                { title: "Wildfire", desc: "Reach a 3-day streak", icon: "🔥", unlocked: (profile?.streak_days || 0) >= 3 },
                { title: "Polyglot", desc: "Try learning multiple languages", icon: "🌍", unlocked: true },
                { title: "Champion", desc: "Earn 100 total XP", icon: "⚡", unlocked: (profile?.xp || 0) >= 100 },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className={`duo-card p-4 flex items-center gap-4 transition ${
                    badge.unlocked ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-extrabold text-base">{badge.title}</div>
                    <div className="text-xs font-bold text-gray-400">{badge.desc}</div>
                  </div>
                  {badge.unlocked && <Award className="h-6 w-6 text-yellow-500" />}
                </div>
              ))}
            </div>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>
    </div>
  );
}
