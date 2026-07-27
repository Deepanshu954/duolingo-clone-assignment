"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, Heart, Trophy, CheckCircle2, AlertCircle } from "lucide-react";
import { api, ExerciseData, AnswerResult } from "@/lib/api";
import { soundFX } from "@/utils/soundFX";

import MultipleChoice from "@/components/exercises/MultipleChoice";
import ImageChoice from "@/components/exercises/ImageChoice";
import WordBank from "@/components/exercises/WordBank";
import MatchPairs from "@/components/exercises/MatchPairs";
import FillBlank from "@/components/exercises/FillBlank";
import TypeAnswer from "@/components/exercises/TypeAnswer";
import { CharacterSpeechHeader } from "@/components/CharacterSpeechHeader";

interface SessionState {
  sessionId: string;
  currentIndex: number;
  total: number;
  correct: number;
  xpEarned: number;
  hearts: number;
  completed: boolean;
  exercise: ExerciseData | null;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showNoHearts, setShowNoHearts] = useState(false);

  useEffect(() => {
    api
      .getSession(sessionId)
      .then((data) => {
        setSession({
          sessionId: data.session_id,
          currentIndex: data.current_index,
          total: data.total,
          correct: data.correct,
          xpEarned: data.xp_earned,
          hearts: data.hearts,
          completed: data.completed,
          exercise: data.exercise,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleAnswer = useCallback(
    async (answer: unknown) => {
      if (!session || submitting) return;
      setSubmitting(true);

      try {
        const result: AnswerResult = await api.submitAnswer(sessionId, answer);

        if (result.is_correct) {
          soundFX.playCorrect();
        } else {
          soundFX.playWrong();
        }

        setFeedback({
          isCorrect: result.is_correct,
          correctAnswer: result.correct_answer,
        });

        // Show feedback bar for 1.4s, then advance
        setTimeout(() => {
          setFeedback(null);
          setSubmitting(false);

          if (result.completed) {
            soundFX.playFinish();
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    completed: true,
                    correct: result.is_correct ? prev.correct + 1 : prev.correct,
                    xpEarned: result.xp_earned,
                    hearts: result.hearts,
                    currentIndex: result.current_index,
                  }
                : null
            );
          } else if (result.hearts <= 0) {
            setShowNoHearts(true);
            setSession((prev) => (prev ? { ...prev, hearts: 0 } : null));
          } else {
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    currentIndex: result.current_index,
                    correct: result.is_correct ? prev.correct + 1 : prev.correct,
                    xpEarned: result.xp_earned,
                    hearts: result.hearts,
                    exercise: result.exercise,
                  }
                : null
            );
          }
        }, 1400);
      } catch (e) {
        console.error(e);
        setSubmitting(false);
      }
    },
    [session, sessionId, submitting]
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-[#58cc02] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
        <p className="text-xl font-bold text-red-500">Session not found</p>
        <button className="btn-3d btn-3d-blue mt-4" onClick={() => router.push("/")}>
          Back to Learn
        </button>
      </div>
    );
  }

  // Completion Screen
  if (session.completed) {
    const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-6 text-center animate-in fade-in duration-300">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-yellow-400 text-yellow-950 shadow-xl animate-bounce">
          <Trophy className="h-14 w-14" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-yellow-500 dark:text-yellow-400">
          Lesson Complete!
        </h1>
        <p className="mt-2 text-base font-bold text-gray-500 dark:text-slate-400">
          Great job! Keep up the amazing work!
        </p>

        <div className="my-8 grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="duo-card p-4 text-center">
            <div className="text-2xl font-black text-yellow-500">+{session.xpEarned}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">XP EARNED</div>
          </div>
          <div className="duo-card p-4 text-center">
            <div className="text-2xl font-black text-emerald-500">{accuracy}%</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">ACCURACY</div>
          </div>
          <div className="duo-card p-4 text-center">
            <div className="text-2xl font-black text-[#1cb0f6]">{session.correct}/{session.total}</div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mt-1">CORRECT</div>
          </div>
        </div>

        <button
          className="btn-3d btn-3d-green w-full max-w-xs py-4 text-lg"
          onClick={() => router.push("/")}
        >
          CONTINUE
        </button>
      </div>
    );
  }

  // Out of Hearts Modal
  if (showNoHearts) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-3xl border-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500">
            <Heart className="h-10 w-10 fill-red-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-slate-100">Out of Hearts!</h2>
          <p className="mt-2 text-sm font-bold text-gray-500 dark:text-slate-400">
            You&apos;ve run out of hearts. Refill them in the shop or practice to continue learning!
          </p>

          <div className="mt-6 space-y-2">
            <button className="btn-3d btn-3d-green w-full py-3 text-sm" onClick={() => router.push("/shop")}>
              GO TO SHOP
            </button>
            <button className="btn-3d btn-3d-blue w-full py-3 text-sm" onClick={() => router.push("/practice")}>
              PRACTICE FOR HEARTS
            </button>
            <button
              className="w-full py-2.5 text-xs font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer"
              onClick={() => router.push("/")}
            >
              BACK TO LEARN
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise = session.exercise;
  if (!exercise) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-slate-900">
        <p className="font-bold text-gray-500">No exercises available</p>
      </div>
    );
  }

  const progress = session.total > 0 ? (session.currentIndex / session.total) * 100 : 0;
  const isImageChoice = exercise.type === "multiple_choice" && exercise.prompt.toLowerCase().includes("which one of these is");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-slate-100">
      {/* Top Header Bar */}
      <header className="flex items-center gap-4 px-6 py-4 max-w-4xl mx-auto w-full">
        <button
          className="rounded-xl p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition cursor-pointer"
          onClick={() => router.push("/")}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="h-3 flex-1 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 font-black text-red-500">
          <Heart className="h-6 w-6 fill-red-500" />
          <span>{session.hearts}</span>
        </div>
      </header>

      {/* Main Exercise Container */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-3xl mx-auto w-full pb-32">
        {/* Render ImageChoice for "Which one of these is..." */}
        {isImageChoice && (
          <ImageChoice
            key={exercise.id}
            prompt={exercise.prompt}
            options={exercise.options as any[]}
            onAnswer={handleAnswer}
            disabled={!!feedback || submitting}
            feedback={feedback}
          />
        )}

        {/* Standard Multiple Choice */}
        {exercise.type === "multiple_choice" && !isImageChoice && (
          <MultipleChoice
            key={exercise.id}
            prompt={exercise.prompt}
            options={exercise.options as string[]}
            onAnswer={handleAnswer}
            disabled={!!feedback || submitting}
            feedback={feedback}
          />
        )}

        {/* Word Bank with Character Speech Bubble Header */}
        {exercise.type === "word_bank" && (
          <div>
            <CharacterSpeechHeader
              prompt={exercise.prompt}
              targetSentence={exercise.target_sentence || "Hola"}
            />
            <WordBank
              key={exercise.id}
              prompt={exercise.prompt}
              sentenceParts={exercise.sentence_parts || []}
              onAnswer={(answer) => handleAnswer(answer)}
              disabled={!!feedback || submitting}
              feedback={feedback}
            />
          </div>
        )}

        {/* Match Pairs */}
        {exercise.type === "match_pairs" && (
          <MatchPairs
            key={exercise.id}
            prompt={exercise.prompt}
            options={exercise.options as { left: string[]; right: string[] }}
            onAnswer={(answer) => handleAnswer(answer)}
            disabled={!!feedback || submitting}
            feedback={feedback}
          />
        )}

        {/* Fill Blank */}
        {exercise.type === "fill_blank" && (
          <FillBlank
            key={exercise.id}
            prompt={exercise.prompt}
            targetSentence={exercise.target_sentence || "Hola ___ amigo"}
            onAnswer={(answer) => handleAnswer(answer)}
            disabled={!!feedback || submitting}
            feedback={feedback}
          />
        )}

        {/* Type Answer */}
        {exercise.type === "type_answer" && (
          <TypeAnswer
            key={exercise.id}
            prompt={exercise.prompt}
            targetSentence={exercise.target_sentence || "Hola"}
            onAnswer={(answer) => handleAnswer(answer)}
            disabled={!!feedback || submitting}
            feedback={feedback}
          />
        )}
      </main>

      {/* Bottom Sticky Action Footer (SKIP & CHECK) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="rounded-2xl border-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-xs font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            SKIP
          </button>
        </div>
      </footer>

      {/* Animated Feedback Bar */}
      {feedback && (
        <div className={`feedback-bar ${feedback.isCorrect ? "feedback-correct" : "feedback-wrong"}`}>
          <div className="flex items-center gap-3 max-w-3xl mx-auto w-full">
            {feedback.isCorrect ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
            )}
            <div>
              <div className="text-xl font-black">
                {feedback.isCorrect ? "Good job!" : "Solution:"}
              </div>
              {!feedback.isCorrect && (
                <div className="text-sm font-bold opacity-90">
                  {feedback.correctAnswer}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
