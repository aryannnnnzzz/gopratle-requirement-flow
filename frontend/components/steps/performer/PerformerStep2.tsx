"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  performerStep2Schema,
  PerformerStep2FormValues,
  performerTypes,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { Mic, Clock, Users, Music } from "lucide-react";

export const PerformerStep2: React.FC = () => {
  const { details, updateDetails, nextStep, prevStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PerformerStep2FormValues>({
    resolver: zodResolver(performerStep2Schema),
    mode: "onTouched",
    values: {
      performerType: details.performerType || "DJ",
      genre: details.genre || "",
      performanceDurationMins: typeof details.performanceDurationMins === "number" ? details.performanceDurationMins : 60,
      numberOfPerformers: typeof details.numberOfPerformers === "number" ? details.numberOfPerformers : 1,
    },
  });

  const onSubmit = (data: PerformerStep2FormValues) => {
    updateDetails(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Performer Specifications"
        description="Select the type of talent, genre, performance length, and troupe size."
        currentStep={2}
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          {/* Performer Type & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="performerType"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Act / Performer Type <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="performerType"
                  {...register("performerType")}
                  aria-invalid={!!errors.performerType}
                  aria-describedby={errors.performerType ? "performerType-error" : undefined}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                >
                  {performerTypes.map((t) => (
                    <option key={t} value={t} className="bg-slate-900 text-slate-100">
                      {t}
                    </option>
                  ))}
                </select>
                <Mic className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.performerType && (
                <p id="performerType-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.performerType.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="genre"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Genre / Style <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="genre"
                  type="text"
                  placeholder="e.g. Bollywood, Deep House, Sufi Rock, Stand-up"
                  {...register("genre")}
                  aria-invalid={!!errors.genre}
                  aria-describedby={errors.genre ? "genre-error" : undefined}
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.genre
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <Music className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.genre && (
                <p id="genre-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.genre.message}
                </p>
              )}
            </div>
          </div>

          {/* Duration & Troupe Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="performanceDurationMins"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Performance Duration (Minutes) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="performanceDurationMins"
                  type="number"
                  min={15}
                  step={15}
                  placeholder="e.g. 60, 90, 120"
                  {...register("performanceDurationMins")}
                  aria-invalid={!!errors.performanceDurationMins}
                  aria-describedby={
                    errors.performanceDurationMins ? "duration-error" : undefined
                  }
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.performanceDurationMins
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.performanceDurationMins && (
                <p id="duration-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.performanceDurationMins.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="numberOfPerformers"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Number of Performers <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="numberOfPerformers"
                  type="number"
                  min={1}
                  placeholder="e.g. 1 (solo) or 4 (band)"
                  {...register("numberOfPerformers")}
                  aria-invalid={!!errors.numberOfPerformers}
                  aria-describedby={
                    errors.numberOfPerformers ? "numberOfPerformers-error" : undefined
                  }
                  className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.numberOfPerformers
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {errors.numberOfPerformers && (
                <p id="numberOfPerformers-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.numberOfPerformers.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </StepShell>
    </form>
  );
};
