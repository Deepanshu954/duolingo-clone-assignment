"use client";

import { useState } from "react";
import { soundFX } from "@/utils/soundFX";
import { VocabCard } from "@/components/VocabCard";

interface WordBankProps {
  prompt: string;
  sentenceParts: string[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
  feedback: { isCorrect: boolean; correctAnswer: string } | null;
}

export default function WordBank({
  prompt,
  sentenceParts,
  onAnswer,
  disabled,
  feedback,
}: WordBankProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords] = useState<string[]>([...sentenceParts]);

  const addWord = (word: string) => {
    if (disabled) return;
    soundFX.playClick();
    setSelectedWords([...selectedWords, word]);
  };

  const removeWord = (index: number) => {
    if (disabled) return;
    soundFX.playClick();
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
  };

  const isWordUsed = (word: string, tileIndex: number) => {
    const usedCount = selectedWords.filter((w) => w === word).length;
    const tilesBefore = availableWords
      .slice(0, tileIndex)
      .filter((w) => w === word).length;
    return tilesBefore < usedCount;
  };

  const answer = selectedWords.join(" ");

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">

      {/* Answer Area */}
      <div className="min-h-24 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40 p-4 flex flex-wrap gap-2 items-center justify-center">
        {selectedWords.length === 0 && (
          <span className="text-sm font-bold text-gray-400 dark:text-slate-500 italic">
            Tap the word tiles below to construct the answer...
          </span>
        )}
        {selectedWords.map((word, i) => (
          <button
            key={i}
            className="rounded-xl border-2 border-b-4 border-[#1488c9] bg-[#1cb0f6] px-4 py-2 text-base font-extrabold text-white shadow-xs transition hover:bg-[#35bcff] cursor-pointer"
            onClick={() => removeWord(i)}
            disabled={disabled}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Available Word Tiles */}
      <div className="flex flex-wrap gap-2.5 justify-center pt-2">
        {availableWords.map((word, i) => {
          const used = isWordUsed(word, i);
          return (
            <button
              key={i}
              className={`rounded-xl border-2 border-b-4 px-4 py-2.5 text-base font-extrabold transition cursor-pointer ${
                used
                  ? "border-gray-200 bg-gray-100 text-transparent dark:border-slate-800 dark:bg-slate-800 cursor-not-allowed opacity-30"
                  : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-sky-300 active:translate-y-0.5"
              }`}
              onClick={() => addWord(word)}
              disabled={disabled || used}
            >
              {word}
            </button>
          );
        })}
      </div>

      {selectedWords.length > 0 && !feedback && (
        <div className="pt-4 flex justify-center">
          <button
            className="btn-3d btn-3d-green w-full max-w-xs py-3.5 text-base font-black"
            onClick={() => onAnswer(answer)}
          >
            CHECK ANSWER
          </button>
        </div>
      )}
    </div>
  );
}
