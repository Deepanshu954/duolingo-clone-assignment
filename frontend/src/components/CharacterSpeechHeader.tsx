"use client";

import React, { useState } from "react";
import { Volume2, Sparkles } from "lucide-react";
import { speakText } from "@/utils/speech";

interface CharacterSpeechHeaderProps {
  prompt: string;
  targetSentence?: string;
  langCode?: string;
  avatar?: string;
}

export const CharacterSpeechHeader: React.FC<CharacterSpeechHeaderProps> = ({
  prompt,
  targetSentence = "Hola",
  langCode = "es",
  avatar = "👩‍🦰",
}) => {
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);

  // Foreign vocabulary translation hints dictionary across all 5 languages
  const dictionary: Record<string, string> = {
    // Spanish
    hola: "hello",
    buenos: "good",
    días: "days / morning",
    gracias: "thank you",
    un: "a / an",
    café: "coffee",
    té: "tea",
    agua: "water",
    pan: "bread",
    manzana: "apple",
    hombre: "man",
    mujer: "woman",
    familia: "family",
    cuenta: "check / bill",
    mucho: "much",
    gusto: "pleasure",
    dónde: "where",
    está: "is",
    aeropuerto: "airport",
    pasaporte: "passport",
    vuelo: "flight",
    habitación: "room",
    llave: "key",
    
    // French
    bonjour: "hello / good day",
    merci: "thank you",
    "au revoir": "goodbye",
    homme: "man",
    femme: "woman",
    famille: "family",
    eau: "water",
    croissant: "croissant",
    gare: "station",
    hôtel: "hotel",
    train: "train",
    addition: "bill",
    
    // German
    hallo: "hello",
    danke: "thank you",
    tschüss: "goodbye",
    mann: "man",
    frau: "woman",
    kind: "child",
    wasser: "water",
    brot: "bread",
    apfel: "apple",
    kaffee: "coffee",
    rechnung: "bill",

    // Japanese
    konnichiwa: "hello",
    arigatou: "thank you",
    sayounara: "goodbye",
    watashi: "I / me",
    ocha: "green tea",
    gohan: "meal / rice",
    mizu: "water",
    
    // Italian
    ciao: "hello / goodbye",
    prego: "you're welcome",
    pizza: "pizza",
    gelato: "gelato / ice cream",
    conto: "bill",
    stazione: "station",
  };

  const getWordHint = (word: string): string | null => {
    const clean = word.toLowerCase().replace(/[^a-zA-Záéíóúñäöüßあ-ん]/g, "");
    return dictionary[clean] || null;
  };

  const words = targetSentence.split(" ");

  const handleSpeakSentence = () => {
    speakText(targetSentence, langCode);
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6 flex flex-col items-center text-center">
      {/* Category Tag */}
      <div className="mb-2 flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 px-3 py-1 text-xs font-black text-purple-600 dark:text-purple-300 uppercase tracking-wider">
        <Sparkles className="h-3.5 w-3.5" /> NEW WORD
      </div>

      {/* Main Prompt */}
      <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-slate-100 mb-6">
        {prompt}
      </h2>

      {/* Character + Speech Bubble Layout */}
      <div className="flex items-center gap-4 relative">
        {/* Character Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-5xl border-4 border-amber-300 dark:border-amber-700 shadow-md animate-in zoom-in duration-200">
          {avatar}
        </div>

        {/* Speech Bubble */}
        <div className="relative rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md flex items-center gap-3">
          {/* Audio Speaker Button */}
          <button
            type="button"
            onClick={handleSpeakSentence}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Listen pronunciation"
          >
            <Volume2 className="h-5 w-5" />
          </button>

          {/* Words in Target Language */}
          <div className="flex flex-wrap gap-1.5 text-xl font-black text-gray-800 dark:text-slate-100">
            {words.map((w, idx) => {
              const hint = getWordHint(w);
              return (
                <div key={idx} className="relative group">
                  <span
                    onClick={() => {
                      if (hint) setActiveHintIndex(activeHintIndex === idx ? null : idx);
                      speakText(w, langCode);
                    }}
                    onMouseEnter={() => hint && setActiveHintIndex(idx)}
                    onMouseLeave={() => setActiveHintIndex(null)}
                    className={`${
                      hint
                        ? "border-b-2 border-dashed border-sky-400 dark:border-sky-500 hover:text-sky-500 cursor-pointer transition-colors px-0.5"
                        : "px-0.5"
                    }`}
                  >
                    {w}
                  </span>

                  {/* Floating Dotted Hover Tooltip Bubble */}
                  {activeHintIndex === idx && hint && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-50 rounded-xl bg-slate-800 dark:bg-slate-700 px-3 py-1.5 text-xs font-black text-white shadow-xl whitespace-nowrap animate-in fade-in duration-150 border border-slate-600">
                      <span>{hint}</span>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
