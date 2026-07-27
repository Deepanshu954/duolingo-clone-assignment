'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface CustomAlertOptions {
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'error';
}

interface CustomAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: CustomAlertOptions | null;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ isOpen, onClose, options }) => {
  if (!isOpen || !options) return null;

  const { message, title, type = 'info' } = options;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-10 w-10 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="h-10 w-10 text-red-500" />;
      default:
        return <Info className="h-10 w-10 text-[#1cb0f6]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-2xl transition-all">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800">
          {getIcon()}
        </div>

        {title && <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100">{title}</h3>}
        <p className="mt-2 text-sm font-bold text-gray-600 dark:text-slate-300">{message}</p>

        <button
          onClick={onClose}
          className="btn-3d btn-3d-blue mt-6 w-full py-3 text-xs font-extrabold"
        >
          OKAY
        </button>
      </div>
    </div>
  );
};
