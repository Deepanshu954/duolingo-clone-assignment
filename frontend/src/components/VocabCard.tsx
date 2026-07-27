"use client";

import React from "react";
import { Volume2, BookOpen, Sparkles, MessageSquare, Lightbulb } from "lucide-react";
import { speakText } from "@/utils/speech";

interface VocabCardProps {
  prompt: string;
  langCode?: string;
}

export const VocabCard: React.FC<VocabCardProps> = ({ prompt, langCode = "es" }) => {
  // Parse prompt text for formatted tags or raw questions
  let tag = "VOCABULARY & PRACTICE";
  let mainWord = "";
  let usageGuide = "";
  let questionText = prompt;

  if (prompt.includes("[VOCABULARY LESSON]")) {
    tag = "VOCABULARY & DEFINITION";
    const cleanPrompt = prompt.replace("📚 [VOCABULARY LESSON]", "").trim();

    // Extract word between quotes e.g. 'Hola'
    const wordMatch = cleanPrompt.match(/'([^']+)'/);
    if (wordMatch) {
      mainWord = wordMatch[1];
    }

    // Extract usage guide
    if (cleanPrompt.includes("Usage Guide:")) {
      const parts = cleanPrompt.split("Usage Guide:");
      questionText = parts[0].trim();
      usageGuide = parts[1].trim();
    } else {
      questionText = cleanPrompt;
    }
  } else if (prompt.includes("[DIALOGUE CHALLENGE]")) {
    tag = "DIALOGUE CONVERSATION";
    questionText = prompt.replace("🎭 [DIALOGUE CHALLENGE]", "").trim();
    const wordMatch = questionText.match(/'([^']+)'/);
    if (wordMatch) {
      mainWord = wordMatch[1];
    }
  } else if (prompt.includes("[SPEED RECALL]") || prompt.includes("[MASTERY]")) {
    tag = "SPEED & MASTERY RECALL";
    questionText = prompt.replace("⚡ [SPEED RECALL]", "").replace("🏆 [MASTERY]", "").trim();
  }

  const handleSpeak = () => {
    speakText(mainWord || questionText, langCode);
  };

  return (
    <div className="mb-6 rounded-3xl border-2 border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md transition-colors">
      {/* Category Tag */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 px-3 py-1 text-xs font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          <BookOpen className="h-4 w-4" /> {tag}
        </span>
        <button
          type="button"
          onClick={handleSpeak}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Listen to pronunciation"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      {/* Main Target Word Showcase */}
      {mainWord && (
        <div className="my-3 flex flex-col items-center text-center p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
          <span className="text-3xl font-black">{mainWord}</span>
          <button
            type="button"
            onClick={handleSpeak}
            className="mt-2 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black text-sky-100 hover:bg-white/30 transition-colors"
          >
            <Volume2 className="h-4 w-4" /> Listen Pronunciation
          </button>
        </div>
      )}

      {/* Question / Prompt Text */}
      <h2 className="text-xl font-black text-gray-800 dark:text-slate-100 leading-snug">
        {questionText}
      </h2>

      {/* Usage Guide / Context Tip */}
      {usageGuide && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs font-extrabold text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
          <Lightbulb className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <div>
            <span className="font-black uppercase text-[10px] tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">Usage & Context</span>
            <span>{usageGuide}</span>
          </div>
        </div>
      )}
    </div>
  );
};
