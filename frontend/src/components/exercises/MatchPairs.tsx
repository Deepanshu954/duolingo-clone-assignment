"use client";

import { useState, useCallback, useMemo } from "react";
import { soundFX } from "@/utils/soundFX";
import { VocabCard } from "@/components/VocabCard";

interface MatchPairsProps {
  prompt: string;
  options: { left: string[]; right: string[] };
  onAnswer: (answer: Record<string, string>) => void;
  disabled: boolean;
  feedback: { isCorrect: boolean; correctAnswer: string } | null;
}

export default function MatchPairs({
  prompt,
  options,
  onAnswer,
  disabled,
  feedback,
}: MatchPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);

  const [shuffledRight] = useState(() => [...options.right].sort(() => Math.random() - 0.5));

  const correctPairs = useMemo(() => {
    const pairs: Record<string, string> = {};
    options.left.forEach((l, i) => {
      pairs[l] = options.right[i];
    });
    return pairs;
  }, [options.left, options.right]);

  const tryMatch = useCallback(
    (left: string, right: string) => {
      if (correctPairs[left] === right) {
        soundFX.playCorrect();
        const newMatches = { ...matches, [left]: right };
        setMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);

        if (Object.keys(newMatches).length === options.left.length) {
          setTimeout(() => onAnswer(newMatches), 400);
        }
      } else {
        soundFX.playWrong();
        setWrongPair([left, right]);
        setTimeout(() => {
          setWrongPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 600);
      }
    },
    [matches, correctPairs, options.left.length, onAnswer]
  );

  const handleLeftClick = (word: string) => {
    if (disabled || matches[word]) return;
    soundFX.playClick();
    setSelectedLeft(word);
    setWrongPair(null);

    if (selectedRight) {
      tryMatch(word, selectedRight);
    }
  };

  const handleRightClick = (word: string) => {
    if (disabled || Object.values(matches).includes(word)) return;
    soundFX.playClick();
    setSelectedRight(word);
    setWrongPair(null);

    if (selectedLeft) {
      tryMatch(selectedLeft, word);
    }
  };

  const getLeftClass = (word: string) => {
    let cls = "flex w-full items-center justify-center rounded-2xl border-2 border-b-4 p-4 font-extrabold text-center text-base transition-all cursor-pointer ";
    if (matches[word]) {
      cls += "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 opacity-60 ";
    } else if (wrongPair && wrongPair[0] === word) {
      cls += "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-shake ";
    } else if (selectedLeft === word) {
      cls += "border-[#1cb0f6] bg-sky-50 dark:bg-sky-950/50 text-[#1cb0f6] shadow-sm ";
    } else {
      cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-sky-300 ";
    }
    return cls;
  };

  const getRightClass = (word: string) => {
    let cls = "flex w-full items-center justify-center rounded-2xl border-2 border-b-4 p-4 font-extrabold text-center text-base transition-all cursor-pointer ";
    if (Object.values(matches).includes(word)) {
      cls += "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 opacity-60 ";
    } else if (wrongPair && wrongPair[1] === word) {
      cls += "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-shake ";
    } else if (selectedRight === word) {
      cls += "border-[#1cb0f6] bg-sky-50 dark:bg-sky-950/50 text-[#1cb0f6] shadow-sm ";
    } else {
      cls += "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:border-sky-300 ";
    }
    return cls;
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      <VocabCard prompt={prompt} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          {options.left.map((word) => (
            <button
              key={word}
              className={getLeftClass(word)}
              onClick={() => handleLeftClick(word)}
              disabled={disabled || !!matches[word]}
            >
              {word}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {shuffledRight.map((word) => (
            <button
              key={word}
              className={getRightClass(word)}
              onClick={() => handleRightClick(word)}
              disabled={disabled || Object.values(matches).includes(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
