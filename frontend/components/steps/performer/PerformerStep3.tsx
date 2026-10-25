"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  performerStep3Schema,
  PerformerStep3FormValues,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { IndianRupee, Wrench, Plane, CheckCircle2 } from "lucide-react";

export const PerformerStep3: React.FC = () => {
  const { details, updateDetails, nextStep, prevStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PerformerStep3FormValues>({
    resolver: zodResolver(performerStep3Schema),
    mode: "onChange",
    defaultValues: {
      budgetPerPerformance: details.budgetPerPerformance ?? 40000,
      equipmentProvidedByHost: details.equipmentProvidedByHost ?? false,
      travelAccommodationCovered: details.travelAccommodationCovered ?? true,
      technicalRequirements: details.technicalRequirements || "",
    },
  });

  const equipmentVal = watch("equipmentProvidedByHost");
  const travelVal = watch("travelAccommodationCovered");

  const onSubmit = (data: PerformerStep3FormValues) => {
    updateDetails(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Performance Budget & Logistics"
        description="Configure compensation, technical rider provisions, and hospitality coverage."
        currentStep={3}
        nextLabel="Review Requirement"
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Budget */}
          <div>
            <label
              htmlFor="budgetPerPerformance"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Budget per Performance (₹) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="budgetPerPerformance"
                type="number"
                min={0}
                step={2000}
                placeholder="e.g. 50000"
                {...register("budgetPerPerformance")}
                aria-invalid={!!errors.budgetPerPerformance}
                aria-describedby={
                  errors.budgetPerPerformance ? "budgetPerPerformance-error" : undefined
                }
                className={`w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.budgetPerPerformance
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            {errors.budgetPerPerformance && (
              <p id="budgetPerPerformance-error" className="mt-1.5 text-xs text-rose-400">
                {errors.budgetPerPerformance.message}
              </p>
            )}
          </div>

          {/* Logistics Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Equipment Toggle */}
            <div
              onClick={() => setValue("equipmentProvidedByHost", !equipmentVal)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                equipmentVal
                  ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  equipmentVal ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">
                    Host Supplies Equipment
                  </span>
                  {equipmentVal && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  PA system, mics, DJ consoles or monitors are provided at venue.
                </p>
              </div>
            </div>

            {/* Travel Toggle */}
            <div
              onClick={() => setValue("travelAccommodationCovered", !travelVal)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                travelVal
                  ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30"
                  : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div
                className={`p-2 rounded-lg mt-0.5 ${
                  travelVal ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Plane className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100">
                    Travel / Stay Covered
                  </span>
                  {travelVal && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Outstation flights, local transport and hotel room are included.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Requirements */}
          <div>
            <label
              htmlFor="technicalRequirements"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Technical Rider & Stage Specifications <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <textarea
              id="technicalRequirements"
              rows={3}
              placeholder="e.g. 2 Wireless Shure SM58 mics, Pioneer CDJ-3000 console, monitor wedges..."
              {...register("technicalRequirements")}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </StepShell>
    </form>
  );
};
