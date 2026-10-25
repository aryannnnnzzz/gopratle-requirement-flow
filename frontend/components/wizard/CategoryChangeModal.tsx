"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface CategoryChangeModalProps {
  isOpen: boolean;
  targetCategoryName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CategoryChangeModal: React.FC<CategoryChangeModalProps> = ({
  isOpen,
  targetCategoryName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 id="category-modal-title" className="text-lg font-bold text-slate-100">
            Change Category?
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Switching to <strong className="text-amber-400 font-semibold">{targetCategoryName}</strong> will clear any category-specific details you previously entered for Steps 2 and 3. Are you sure you want to proceed?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20"
          >
            Yes, Change Category
          </button>
        </div>
      </div>
    </div>
  );
};
