"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  plannerStep2Schema,
  PlannerStep2FormValues,
  plannerServices,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { Users, FileText } from "lucide-react";

export const PlannerStep2: React.FC = () => {
  const { details, updateDetails, nextStep, prevStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlannerStep2FormValues>({
    resolver: zodResolver(plannerStep2Schema) as any,
    mode: "onTouched",
    values: {
      services: Array.isArray(details.services) ? details.services : [],
      guestCount: typeof details.guestCount === "number" ? details.guestCount : 100,
      theme: details.theme || "",
      notes: details.notes || "",
    },
  });

  const selectedServices = watch("services") || [];

  const toggleService = (id: string) => {
    const current = [...selectedServices];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue("services", current, { shouldValidate: true });
  };

  const onSubmit = (data: PlannerStep2FormValues) => {
    updateDetails(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Event Planning Requirements"
        description="Choose the required event services and define scope details."
        currentStep={2}
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Services Multi-Select Chips */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Services Required <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {plannerServices.map((svc) => {
                const isSelected = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={`px-3 py-2.5 rounded-xl text-left border transition-all text-xs font-semibold flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span>{svc.label}</span>
                    <span className="ml-1 text-xs">
                      {isSelected ? "✓" : "+"}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.services && (
              <p className="mt-2 text-xs text-rose-400">{errors.services.message}</p>
            )}
          </div>

          {/* Guest Count */}
          <div>
            <label
              htmlFor="guestCount"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Estimated Guest Count <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                id="guestCount"
                type="number"
                min={1}
                placeholder="e.g. 250"
                {...register("guestCount")}
                aria-invalid={!!errors.guestCount}
                aria-describedby={errors.guestCount ? "guestCount-error" : undefined}
                className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.guestCount
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.guestCount && (
              <p id="guestCount-error" className="mt-1.5 text-xs text-rose-400">
                {errors.guestCount.message}
              </p>
            )}
          </div>

          {/* Theme */}
          <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Event Theme or Concept <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <input
              id="theme"
              type="text"
              placeholder="e.g. Vintage Boho, Modern Minimalist, Traditional Royal"
              {...register("theme")}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Additional Notes & Preferences <span className="text-xs text-slate-400">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="notes"
                rows={3}
                placeholder="Describe specific coordinator expectations or special requirements..."
                {...register("notes")}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <FileText className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </StepShell>
    </form>
  );
};
