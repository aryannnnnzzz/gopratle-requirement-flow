"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPlannerStep3Schema,
  PlannerStep3FormValues,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { IndianRupee, Calendar } from "lucide-react";

export const PlannerStep3: React.FC = () => {
  const { event, details, updateDetails, nextStep, prevStep } = useWizardStore();

  const schema = React.useMemo(
    () => createPlannerStep3Schema(event.startDate),
    [event.startDate]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlannerStep3FormValues>({
    resolver: zodResolver(schema) as any,
    mode: "onTouched",
    values: {
      budgetMin: typeof details.budgetMin === "number" ? details.budgetMin : 50000,
      budgetMax: typeof details.budgetMax === "number" ? details.budgetMax : 150000,
      planningDeadline: details.planningDeadline || "",
    },
  });

  const onSubmit = (data: PlannerStep3FormValues) => {
    updateDetails(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Planning Budget & Timeline"
        description="Specify your budget range and coordinator completion deadline."
        currentStep={3}
        nextLabel="Review Requirement"
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Budget Min & Max */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="budgetMin"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Minimum Budget (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="budgetMin"
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="e.g. 100000"
                  {...register("budgetMin")}
                  aria-invalid={!!errors.budgetMin}
                  aria-describedby={errors.budgetMin ? "budgetMin-error" : undefined}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.budgetMin
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {errors.budgetMin && (
                <p id="budgetMin-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.budgetMin.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="budgetMax"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Maximum Budget (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="budgetMax"
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="e.g. 250000"
                  {...register("budgetMax")}
                  aria-invalid={!!errors.budgetMax}
                  aria-describedby={errors.budgetMax ? "budgetMax-error" : undefined}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.budgetMax
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {errors.budgetMax && (
                <p id="budgetMax-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.budgetMax.message}
                </p>
              )}
            </div>
          </div>

          {/* Planning Deadline */}
          <div>
            <label
              htmlFor="planningDeadline"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Planning & Sign-off Deadline <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="planningDeadline"
                type="date"
                max={event.startDate || undefined}
                {...register("planningDeadline")}
                aria-invalid={!!errors.planningDeadline}
                aria-describedby={
                  errors.planningDeadline ? "planningDeadline-error" : undefined
                }
                className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                  errors.planningDeadline
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.planningDeadline ? (
              <p id="planningDeadline-error" className="mt-1.5 text-xs text-rose-400">
                {errors.planningDeadline.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Must be scheduled prior to the event start date ({event.startDate || "not set"}).
              </p>
            )}
          </div>
        </div>
      </StepShell>
    </form>
  );
};
