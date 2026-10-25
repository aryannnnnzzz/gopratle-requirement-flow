"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crewStep2Schema,
  CrewStep2FormValues,
  crewRolesList,
} from "../../../lib/schemas";
import { useWizardStore } from "../../../store/wizardStore";
import { StepShell } from "../../wizard/StepShell";
import { Plus, Trash2, Shield, Users } from "lucide-react";

export const CrewStep2: React.FC = () => {
  const { details, updateDetails, nextStep, prevStep } = useWizardStore();

  const initialRoles =
    details.roles && Array.isArray(details.roles) && details.roles.length > 0
      ? details.roles
      : [
          { role: "Sound", count: 2 },
          { role: "Lighting", count: 2 },
        ];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CrewStep2FormValues>({
    resolver: zodResolver(crewStep2Schema),
    mode: "onChange",
    defaultValues: {
      roles: initialRoles as any,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  const onSubmit = (data: CrewStep2FormValues) => {
    updateDetails(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StepShell
        title="Crew & Operational Roles"
        description="Specify team positions and headcount required for your event."
        currentStep={2}
        onBack={prevStep}
        onNext={handleSubmit(onSubmit)}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-200">
              Required Roles & Personnel Count <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => append({ role: "Stage", count: 1 })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Position
            </button>
          </div>

          {errors.roles?.root && (
            <p className="text-xs text-rose-400">{errors.roles.root.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => {
              const roleError = errors.roles?.[index]?.role;
              const countError = errors.roles?.[index]?.count;

              return (
                <div
                  key={field.id}
                  className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-start gap-3 transition-all hover:border-slate-750"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Role Selection */}
                    <div>
                      <label
                        htmlFor={`role-${index}`}
                        className="block text-xs font-medium text-slate-400 mb-1"
                      >
                        Role Category
                      </label>
                      <select
                        id={`role-${index}`}
                        {...register(`roles.${index}.role` as const)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      >
                        {crewRolesList.map((r) => (
                          <option key={r} value={r} className="bg-slate-900 text-slate-100">
                            {r}
                          </option>
                        ))}
                      </select>
                      {roleError && (
                        <p className="mt-1 text-xs text-rose-400">{roleError.message}</p>
                      )}
                    </div>

                    {/* Headcount */}
                    <div>
                      <label
                        htmlFor={`count-${index}`}
                        className="block text-xs font-medium text-slate-400 mb-1"
                      >
                        Personnel Headcount
                      </label>
                      <div className="relative">
                        <input
                          id={`count-${index}`}
                          type="number"
                          min={1}
                          {...register(`roles.${index}.count` as const)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <Users className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                      {countError && (
                        <p className="mt-1 text-xs text-rose-400">{countError.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      title="Remove role"
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-slate-950/30 border border-slate-800/80 rounded-xl flex items-center gap-3 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              All personnel assignments include on-site supervision and standard briefing.
            </span>
          </div>
        </div>
      </StepShell>
    </form>
  );
};
