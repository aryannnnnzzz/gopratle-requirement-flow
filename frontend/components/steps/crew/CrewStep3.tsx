"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crewStep3Schema,
  CrewStep3FormValues,
  experienceLevels,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { Clock, IndianRupee, Award, Sparkles } from "lucide-react";

export const CrewStep3: React.FC = () => {
  const { details, updateDetails, nextStep, prevStep } = useWizardStore();

  const defaultCertString = Array.isArray(details.requiredCertifications)
    ? details.requiredCertifications.join(", ")
    : details.requiredCertifications || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CrewStep3FormValues>({
    resolver: zodResolver(crewStep3Schema),
    mode: "onChange",
    defaultValues: {
      shiftHours: details.shiftHours ?? 8,
      experienceLevel: details.experienceLevel || "Intermediate",
      dailyRate: details.dailyRate ?? 3500,
      callTime: details.callTime || "08:00",
      requiredCertifications: defaultCertString,
    },
  });

  const onSubmit = (data: CrewStep3FormValues) => {
    // Parse certifications from comma-separated string to string[]
    const certsArray = data.requiredCertifications
      ? data.requiredCertifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    updateDetails({
      shiftHours: data.shiftHours,
      experienceLevel: data.experienceLevel,
      dailyRate: data.dailyRate,
      callTime: data.callTime,
      requiredCertifications: certsArray,
    });
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Crew Shift & Compensation"
        description="Set shift duration, call time, minimum experience rating, and compensation."
        currentStep={3}
        nextLabel="Review Requirement"
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Shift Hours & Call Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="shiftHours"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Shift Duration (Hours) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="shiftHours"
                  type="number"
                  min={1}
                  max={24}
                  placeholder="e.g. 8 or 12"
                  {...register("shiftHours")}
                  aria-invalid={!!errors.shiftHours}
                  aria-describedby={errors.shiftHours ? "shiftHours-error" : undefined}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.shiftHours
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.shiftHours && (
                <p id="shiftHours-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.shiftHours.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="callTime"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Call Time (HH:mm) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="callTime"
                  type="text"
                  placeholder="e.g. 08:00 or 14:30"
                  {...register("callTime")}
                  aria-invalid={!!errors.callTime}
                  aria-describedby={errors.callTime ? "callTime-error" : undefined}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.callTime
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.callTime && (
                <p id="callTime-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.callTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Experience Level & Daily Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="experienceLevel"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Experience Level Required <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="experienceLevel"
                  {...register("experienceLevel")}
                  aria-invalid={!!errors.experienceLevel}
                  aria-describedby={
                    errors.experienceLevel ? "experienceLevel-error" : undefined
                  }
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                >
                  {experienceLevels.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-slate-900 text-slate-100">
                      {lvl}
                    </option>
                  ))}
                </select>
                <Sparkles className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.experienceLevel && (
                <p id="experienceLevel-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="dailyRate"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Daily Compensation Rate (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="dailyRate"
                  type="number"
                  min={0}
                  step={500}
                  placeholder="e.g. 5000"
                  {...register("dailyRate")}
                  aria-invalid={!!errors.dailyRate}
                  aria-describedby={errors.dailyRate ? "dailyRate-error" : undefined}
                  className={`w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.dailyRate
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
              {errors.dailyRate && (
                <p id="dailyRate-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.dailyRate.message}
                </p>
              )}
            </div>
          </div>

          {/* Required Certifications */}
          <div>
            <label
              htmlFor="requiredCertifications"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Required Certifications <span className="text-xs text-slate-400">(Optional, comma-separated)</span>
            </label>
            <div className="relative">
              <input
                id="requiredCertifications"
                type="text"
                placeholder="e.g. Rigging Level 2, OSHA 30, First Aid Certified"
                {...register("requiredCertifications")}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <Award className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>
      </StepShell>
    </form>
  );
};
