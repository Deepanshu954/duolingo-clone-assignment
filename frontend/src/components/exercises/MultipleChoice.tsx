"use client";

import { useState } from "react";
import { soundFX } from "@/utils/soundFX";
import { VocabCard } from "@/components/VocabCard";

interface MultipleChoiceProps {
  prompt: string;
  options: any[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
  feedback: { isCorrect: boolean; correctAnswer: string } | null;
}

export default function MultipleChoice({
  prompt,
  options,
  onAnswer,
  disabled,
  feedback,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const getOptionText = (opt: any): string => (typeof opt === "string" ? opt : opt?.text || String(opt || ""));

  const handleSelect = (rawOption: any) => {
    if (disabled) return;
    soundFX.playClick();
    setSelected(getOptionText(rawOption));
  };

  const getOptionClass = (rawOption: any) => {
    const text = getOptionText(rawOption);
    let cls = "flex w-full items-center justify-between rounded-2xl border-2 border-b-4 p-4 font-extrabold text-left text-lg transition-all cursor-pointer ";
    if (feedback) {
      if (text === feedback.correctAnswer) {
        cls += "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 ";
      } else if (text === selected && !feedback.isCorrect) {
        cls += "border-red-500 bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-200 animate-shake ";
      } else {
        cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 opacity-50 ";
      }
    } else if (text === selected) {
      cls += "border-[#1cb0f6] bg-sky-50 dark:bg-sky-950/50 text-[#1cb0f6] shadow-sm ";
    } else {
      cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-sky-300 dark:hover:border-slate-700 ";
    }
    return cls;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <VocabCard prompt={prompt} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, i) => {
          const text = getOptionText(option);
          return (
            <button
              key={i}
              className={getOptionClass(option)}
              onClick={() => handleSelect(option)}
              disabled={disabled}
            >
              <span>{text}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-300 dark:border-slate-700 text-xs font-black text-gray-400">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {selected && !feedback && (
        <div className="pt-4 flex justify-center">
          <button
            className="btn-3d btn-3d-green w-full max-w-xs py-3.5 text-base font-black"
            onClick={() => onAnswer(selected)}
          >
            CHECK ANSWER
          </button>
        </div>
      )}
    </div>
  );
}
