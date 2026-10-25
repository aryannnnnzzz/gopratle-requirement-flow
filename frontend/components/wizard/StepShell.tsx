"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface StepShellProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const StepShell: React.FC<StepShellProps> = ({
  title,
  description,
  currentStep,
  totalSteps = 4,
  onBack,
  onNext,
  nextLabel = "Next Step",
  isNextDisabled = false,
  isLoading = false,
  children,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs font-medium text-indigo-400 mb-2">
          <span>STEP {currentStep} OF {totalSteps}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {description}
        </p>
      </div>

      {/* Form Content */}
      <div className="p-6 sm:p-8">{children}</div>

      {/* Action Footer (if onBack or onNext provided) */}
      {(onBack || onNext) && (
        <div className="px-6 py-4 sm:px-8 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          {onBack && currentStep > 1 ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-600/40 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
