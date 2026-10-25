"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWizardStore } from "../../store/wizardStore";
import { Stepper } from "../../components/wizard/Stepper";
import { EventBasics } from "../../components/steps/EventBasics";
import { stepConfig } from "../../lib/stepConfig";
import { categoryOptions, CategoryKey } from "../../lib/schemas";
import { ArrowLeft } from "lucide-react";

export default function PostRequirementPage() {
  const [mounted, setMounted] = useState(false);
  const { currentStep, category, prevStep } = useWizardStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const categoryMeta = categoryOptions.find((c) => c.id === category);

  const renderStep = () => {
    if (currentStep === 1) {
      return <EventBasics />;
    }

    if (!category || !stepConfig[category as CategoryKey]) {
      return <EventBasics />;
    }

    const steps = stepConfig[category as CategoryKey];

    if (currentStep === 2) {
      const Step2Component = steps[0];
      return <Step2Component />;
    }

    if (currentStep === 3) {
      const Step3Component = steps[1];
      return <Step3Component />;
    }

    // Step 4 Review placeholder for Checkpoint A
    return (
      <div className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Step 4: Review & Submit</h2>
        <p className="text-sm text-slate-400 mb-6">
          Ready to review requirement details for {categoryMeta?.title || "your event"}.
        </p>
        <button
          type="button"
          onClick={prevStep}
          className="px-5 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
        >
          Back to Step 3
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>GoPratle Requirement Flow</span>
          </div>
        </div>

        {/* Stepper Header */}
        <Stepper
          currentStep={currentStep}
          categoryLabel={categoryMeta?.title}
        />

        {/* Step Body */}
        <main>{renderStep()}</main>
      </div>
    </div>
  );
}
