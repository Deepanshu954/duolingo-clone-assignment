"use client";

import React, { useState } from "react";
import { soundFX } from "@/utils/soundFX";
import { speakText } from "@/utils/speech";

interface ImageChoiceOption {
  text: string;
  icon?: string;
  hint?: string;
}

interface ImageChoiceProps {
  prompt: string;
  options: (string | ImageChoiceOption)[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
  feedback: { isCorrect: boolean; correctAnswer: string } | null;
  langCode?: string;
}

export default function ImageChoice({
  prompt,
  options,
  onAnswer,
  disabled,
  feedback,
  langCode = "es",
}: ImageChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Normalize options array into objects with icons
  const normalizedOptions: ImageChoiceOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      const iconMap: Record<string, string> = {
        "café": "☕",
        "té": "🍵",
        "un sándwich": "🥪",
        "el pan": "🍞",
        "el agua": "🥛",
        "la manzana": "🍎",
        "hola": "👋",
        "buenos días": "🌅",
        "gracias": "🙏",
        "adiós": "👋",
      };
      return {
        text: opt,
        icon: iconMap[opt.toLowerCase()] || "☕",
      };
    }
    return opt;
  });

  const handleSelect = (optText: string) => {
    if (disabled) return;
    soundFX.playClick();
    speakText(optText, langCode);
    setSelected(optText);
  };

  const getCardClass = (optText: string) => {
    let cls = "flex flex-col items-center justify-between rounded-3xl border-2 border-b-4 p-6 transition-all cursor-pointer select-none ";
    if (feedback) {
      if (optText === feedback.correctAnswer) {
        cls += "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 ";
      } else if (optText === selected && !feedback.isCorrect) {
        cls += "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-200 animate-shake ";
      } else {
        cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 opacity-40 ";
      }
    } else if (optText === selected) {
      cls += "border-[#1cb0f6] bg-sky-50 dark:bg-sky-950/50 text-[#1cb0f6] shadow-md scale-102 ";
    } else {
      cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-sky-300 hover:scale-102 ";
    }
    return cls;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Tag & Header */}
      <div className="text-center mb-4">
        <span className="inline-block rounded-full bg-purple-100 dark:bg-purple-950/60 px-3 py-1 text-xs font-black text-purple-600 dark:text-purple-300 uppercase tracking-wider mb-2">
          🔮 NEW WORD
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-slate-100">
          {prompt}
        </h2>
      </div>

      {/* 3 Vertical Image Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {normalizedOptions.map((opt, i) => (
          <div
            key={i}
            className={getCardClass(opt.text)}
            onClick={() => handleSelect(opt.text)}
          >
            {/* Graphic Icon Showcase */}
            <div className="my-4 flex h-28 w-28 items-center justify-center rounded-2xl bg-gray-50 dark:bg-slate-900/60 text-6xl shadow-inner border border-gray-100 dark:border-slate-800">
              {opt.icon || "☕"}
            </div>

            {/* Word Label + Key Badge */}
            <div className="flex w-full items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <span className="text-base font-extrabold">{opt.text}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 dark:border-slate-700 text-xs font-black text-gray-400">
                {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {selected && !feedback && (
        <div className="pt-4 flex justify-center">
          <button
            className="btn-3d btn-3d-green w-full max-w-xs py-3.5 text-base font-black"
            onClick={() => onAnswer(selected)}
          >
            CHECK
          </button>
        </div>
      )}
    </div>
  );
}
