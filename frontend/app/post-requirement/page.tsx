"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWizardStore, useWizardHydrated } from "../../store/wizardStore";
import { Stepper } from "../../components/wizard/Stepper";
import { EventBasics } from "../../components/steps/EventBasics";
import { ReviewStep } from "../../components/wizard/ReviewStep";
import { SuccessScreen } from "../../components/wizard/SuccessScreen";
import { stepConfig } from "../../lib/stepConfig";
import { categoryOptions, CategoryKey } from "../../lib/schemas";
import { RequirementDocument } from "../../lib/api";
import { ArrowLeft } from "lucide-react";

export default function PostRequirementPage() {
  const hydrated = useWizardHydrated();
  // After a successful submit the store is reset (step → 1, category → ""),
  // so we only need to read currentStep / category for the wizard flow.
  const { currentStep, category } = useWizardStore();
  // submittedDoc is kept in React local state. It is populated by ReviewStep
  // AFTER the store has already been reset, so the success screen renders
  // from response data, never from stale store values.
  // If the user refreshes while on the success screen, submittedDoc is null
  // (local state is gone) → they land on a fresh Step 1, which is safe.
  const [submittedDoc, setSubmittedDoc] = useState<RequirementDocument | null>(null);

  if (!hydrated) {
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

  const handlePostAnother = () => {
    // Store is already reset (done in ReviewStep on API success).
    // Just clear the local doc so the wizard resets to Step 1.
    setSubmittedDoc(null);
  };

  const renderStep = () => {
    if (submittedDoc) {
      return (
        <SuccessScreen
          document={submittedDoc}
          onPostAnother={handlePostAnother}
        />
      );
    }

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

    // Step 4 Review & Submit
    return <ReviewStep onSuccess={(doc) => setSubmittedDoc(doc)} />;
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
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/requirements"
              className="text-slate-400 hover:text-indigo-400 font-medium transition-colors"
            >
              Browse Requirements
            </Link>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">GoPratle Requirement Flow</span>
          </div>
        </div>

        {/* Stepper Header (hidden on success) */}
        {!submittedDoc && (
          <Stepper
            currentStep={currentStep}
            categoryLabel={categoryMeta?.title}
          />
        )}

        {/* Step Body */}
        <main>{renderStep()}</main>
      </div>
    </div>
  );
}
