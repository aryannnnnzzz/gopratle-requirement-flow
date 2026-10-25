"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  categoryLabel?: string;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, categoryLabel }) => {
  const steps = [
    { number: 1, title: "Event Basics", short: "Basics" },
    { number: 2, title: categoryLabel ? `${categoryLabel} Specs` : "Category Specs", short: "Specs" },
    { number: 3, title: "Logistics & Budget", short: "Logistics" },
    { number: 4, title: "Review & Submit", short: "Review" },
  ];

  return (
    <nav aria-label="Progress Stepper" className="w-full mb-8">
      <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <React.Fragment key={step.number}>
              <div
                className="flex flex-col items-center group relative"
                aria-current={isCurrent ? "step" : undefined}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20"
                      : isCurrent
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 ring-4 ring-indigo-500/20"
                      : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.number}
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-medium block transition-colors ${
                      isCurrent
                        ? "text-indigo-400 font-semibold"
                        : isCompleted
                        ? "text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.short}</span>
                  </span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-6 transition-all duration-300 ${
                    currentStep > idx + 1 ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
