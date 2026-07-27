"use client";

import { useState } from "react";
import { soundFX } from "@/utils/soundFX";
import { CharacterSpeechHeader } from "@/components/CharacterSpeechHeader";

interface TypeAnswerProps {
  prompt: string;
  targetSentence?: string;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  feedback: { isCorrect: boolean; correctAnswer: string } | null;
}

export default function TypeAnswer({
  prompt,
  targetSentence,
  onAnswer,
  disabled,
  feedback,
}: TypeAnswerProps) {
  const [value, setValue] = useState("");

  const displaySentence = targetSentence || "Hola";

  const inputClass = feedback
    ? feedback.isCorrect
      ? "w-full rounded-2xl border-2 border-b-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 p-4 text-center text-xl font-extrabold text-emerald-800 dark:text-emerald-200 outline-none"
      : "w-full rounded-2xl border-2 border-b-4 border-red-500 bg-red-50 dark:bg-red-950/60 p-4 text-center text-xl font-extrabold text-red-800 dark:text-red-200 animate-shake outline-none"
    : "w-full rounded-2xl border-2 border-b-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center text-xl font-extrabold text-gray-800 dark:text-slate-100 focus:border-[#1cb0f6] outline-none transition-all";

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Character Speech Header displaying target sentence */}
      <CharacterSpeechHeader
        prompt={prompt}
        targetSentence={displaySentence}
      />

      <div className="w-full">
        <input
          type="text"
          className={inputClass}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer..."
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              soundFX.playClick();
              onAnswer(value.trim());
            }
          }}
          autoFocus
        />
      </div>

      {value.trim() && !feedback && (
        <div className="pt-2 flex justify-center">
          <button
            className="btn-3d btn-3d-green w-full max-w-xs py-3.5 text-base font-black cursor-pointer"
            onClick={() => {
              soundFX.playClick();
              onAnswer(value.trim());
            }}
          >
            CHECK ANSWER
          </button>
        </div>
      )}
    </div>
  );
}
