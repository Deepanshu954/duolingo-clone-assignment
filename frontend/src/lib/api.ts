/**
 * API client - wraps fetch with base URL and X-User-ID header.
 * Local dev uses Next.js rewrites. Production can point directly at the hosted FastAPI URL.
 */

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_BASE = configuredApiUrl ? `${configuredApiUrl}/api/v1` : "/api/v1";

interface FetchOptions extends RequestInit {
  userId?: number;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { userId = 1, ...fetchOptions } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": String(userId),
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// --- Types ---

export interface CourseData {
  id: number;
  language: string;
  code: string;
  flag_emoji: string;
}

export interface UserData {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
  hearts: number;
  streak_days: number;
  gems: number;
  active_course_id: number;
  created_at: string;
}

export interface ProfileData extends UserData {
  total_lessons_completed: number;
  current_course: string;
}

export interface LessonInfo {
  id: number;
  order: number;
  title: string;
  xp_reward: number;
}

export interface SkillProgress {
  skill_id: number;
  title: string;
  icon: string;
  completed_lessons: number;
  total_lessons: number;
  is_locked: boolean;
  first_incomplete_lesson_id: number | null;
  lessons?: LessonInfo[];
}

export interface UnitData {
  id: number;
  order: number;
  title: string;
  description: string;
  color: string;
  skills: SkillProgress[];
}

export interface PathData {
  course: string;
  flag_emoji: string;
  units: UnitData[];
}

export interface ExerciseData {
  id: number;
  order: number;
  type: "multiple_choice" | "word_bank" | "match_pairs" | "fill_blank" | "type_answer";
  prompt: string;
  target_sentence?: string;
  options?: string[] | { left: string[]; right: string[] };
  sentence_parts?: string[];
}

export interface SessionStart {
  session_id: string;
  total_exercises: number;
  current_index: number;
  exercise: ExerciseData;
}

export interface SessionStatus {
  session_id: string;
  lesson_id: number;
  current_index: number;
  total: number;
  correct: number;
  xp_earned: number;
  hearts: number;
  completed: boolean;
  exercise: ExerciseData | null;
}

export interface AnswerResult {
  is_correct: boolean;
  correct_answer: string;
  xp_earned: number;
  hearts: number;
  current_index: number;
  total: number;
  completed: boolean;
  exercise: ExerciseData | null;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  xp: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  current_user_rank: number;
}

export interface HeartRefillResult {
  hearts: number;
  gems: number;
  message: string;
}

export interface CouponResult {
  success: boolean;
  message: string;
  gems_added: number;
  new_gem_balance: number;
}

// --- API Functions ---

export const api = {
  getUser: () => apiFetch<UserData>("/user/me"),
  getProfile: () => apiFetch<ProfileData>("/profile"),
  getCourses: () => apiFetch<CourseData[]>("/courses"),
  setActiveCourse: (courseId: number) =>
    apiFetch<{ success: boolean; active_course_id: number; language: string }>("/user/active-course", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
  getPath: () => apiFetch<PathData>("/path"),
  getLeaderboard: () => apiFetch<LeaderboardData>("/leaderboard"),

  startLesson: (lessonId: number) =>
    apiFetch<SessionStart>(`/lessons/${lessonId}/start`, { method: "POST" }),

  getSession: (sessionId: string) =>
    apiFetch<SessionStatus>(`/lessons/sessions/${sessionId}`),

  submitAnswer: (sessionId: string, answer: unknown) =>
    apiFetch<AnswerResult>(`/lessons/sessions/${sessionId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  refillHearts: () =>
    apiFetch<HeartRefillResult>("/progress/hearts/refill", { method: "POST" }),

  practiceForHeart: () =>
    apiFetch<HeartRefillResult>("/progress/hearts/practice", { method: "POST" }),

  redeemCoupon: (code: string) =>
    apiFetch<CouponResult>("/shop/redeem-coupon", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  buyGems: (gems: number) =>
    apiFetch<CouponResult>("/shop/buy-gems", {
      method: "POST",
      body: JSON.stringify({ gems }),
    }),

  simulateDay: () =>
    apiFetch("/test/simulate-day-passed", { method: "POST" }),
};
