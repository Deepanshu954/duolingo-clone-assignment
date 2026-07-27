'use client';

import React from 'react';
import { Heart, Gem, X } from 'lucide-react';

interface RefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRefill: () => void;
  userGems: number;
}

export const RefillModal: React.FC<RefillModalProps> = ({
  isOpen,
  onClose,
  onConfirmRefill,
  userGems,
}) => {
  if (!isOpen) return null;

  const cost = 350;
  const canAfford = userGems >= cost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-500">
          <Heart className="h-10 w-10 fill-red-500 animate-pulse" />
        </div>

        <h3 className="text-2xl font-extrabold text-gray-800 dark:text-slate-100">Need More Hearts?</h3>
        <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-slate-400">
          Refill your hearts to full capacity (5/5) so you can keep practicing without interruption!
        </p>

        <div className="my-6 rounded-2xl border-2 border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 p-4">
          <div className="flex items-center justify-between font-bold text-sm">
            <span className="text-gray-600 dark:text-slate-400">Cost:</span>
            <span className="flex items-center gap-1 text-sky-500 font-extrabold">
              <Gem className="h-4 w-4 fill-sky-400" /> {cost} Gems
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between font-bold text-xs">
            <span className="text-gray-500 dark:text-slate-500">Your balance:</span>
            <span className="text-gray-700 dark:text-slate-300">{userGems} Gems</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onConfirmRefill}
            disabled={!canAfford}
            className={`btn-3d flex w-full items-center justify-center gap-2 py-3.5 text-sm font-extrabold rounded-2xl ${
              canAfford
                ? 'btn-3d-green'
                : 'bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-slate-600 cursor-not-allowed border-b-4 border-gray-400'
            }`}
          >
            {canAfford ? 'REFILL HEARTS NOW' : 'NOT ENOUGH GEMS'}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-extrabold text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            NO THANKS
          </button>
        </div>
      </div>
    </div>
  );
};
