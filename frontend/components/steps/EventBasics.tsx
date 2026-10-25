"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  eventBasicsSchema,
  EventBasicsFormValues,
  eventTypeOptions,
  categoryOptions,
  CategoryKey,
} from "../../lib/schemas";
import { useWizardStore } from "../../store/wizardStore";
import { StepShell } from "../wizard/StepShell";
import { CategoryChangeModal } from "../wizard/CategoryChangeModal";
import { Calendar, MapPin, Tag, Users, Music, Wrench } from "lucide-react";

const categoryIcons = {
  planner: Users,
  performer: Music,
  crew: Wrench,
};

export const EventBasics: React.FC = () => {
  const { event, category, details, setEventBasics, setCategory, nextStep } =
    useWizardStore();

  const [pendingCategory, setPendingCategory] = useState<CategoryKey | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventBasicsFormValues>({
    resolver: zodResolver(eventBasicsSchema),
    mode: "onTouched",
    values: {
      eventName: event.eventName || "",
      eventType: (event.eventType as any) || "Corporate",
      dateType: event.dateType || "single",
      startDate: event.startDate || "",
      endDate: event.endDate || "",
      location: event.location || "",
      venue: event.venue || "",
      category: (category as CategoryKey) || ("" as any),
    },
  });

  const selectedDateType = watch("dateType");
  const selectedCategory = watch("category");

  const handleCategorySelect = (newCat: CategoryKey) => {
    if (newCat === selectedCategory) return;

    // If details already has populated fields from earlier steps, prompt confirmation
    const hasExistingDetails = Object.keys(details).length > 0;
    if (hasExistingDetails) {
      setPendingCategory(newCat);
    } else {
      setValue("category", newCat, { shouldValidate: true });
      setCategory(newCat, false);
    }
  };

  const confirmCategoryChange = () => {
    if (pendingCategory) {
      setValue("category", pendingCategory, { shouldValidate: true });
      setCategory(pendingCategory, true);
      setPendingCategory(null);
    }
  };

  const onSubmit = (data: EventBasicsFormValues) => {
    setEventBasics(data);
    nextStep();
  };

  // Get current date formatted for min date input (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StepShell
          title="Event Basics & Category"
          description="Tell us about the event and choose which type of professional requirement you want to post."
          currentStep={1}
          nextLabel="Continue to Specs"
          isNextDisabled={!selectedCategory}
          onNext={handleSubmit(onSubmit)}
        >
          <input type="hidden" {...register("category")} />
          <div className="space-y-6">
            {/* Event Name */}
            <div>
              <label
                htmlFor="eventName"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                Event Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Annual Gala 2027, Sharma Wedding Sangeet"
                {...register("eventName")}
                aria-invalid={!!errors.eventName}
                aria-describedby={errors.eventName ? "eventName-error" : undefined}
                className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.eventName
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              {errors.eventName && (
                <p id="eventName-error" className="mt-1.5 text-xs text-rose-400">
                  {errors.eventName.message}
                </p>
              )}
            </div>

            {/* Event Type & Date Mode Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="eventType"
                  className="block text-sm font-medium text-slate-200 mb-1.5"
                >
                  Event Type <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="eventType"
                    {...register("eventType")}
                    aria-invalid={!!errors.eventType}
                    aria-describedby={errors.eventType ? "eventType-error" : undefined}
                    className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                  >
                    {eventTypeOptions.map((opt) => (
                      <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.eventType && (
                  <p id="eventType-error" className="mt-1.5 text-xs text-rose-400">
                    {errors.eventType.message}
                  </p>
                )}
              </div>

              {/* Date Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Date Format <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setValue("dateType", "single", { shouldValidate: true })}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedDateType === "single"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Single Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("dateType", "range", { shouldValidate: true })}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedDateType === "range"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Multi-Day Range
                  </button>
                </div>
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-200 mb-1.5"
                >
                  {selectedDateType === "range" ? "Start Date" : "Event Date"}{" "}
                  <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="startDate"
                    type="date"
                    min={todayStr}
                    {...register("startDate")}
                    aria-invalid={!!errors.startDate}
                    aria-describedby={errors.startDate ? "startDate-error" : undefined}
                    className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                      errors.startDate
                        ? "border-rose-500 focus:ring-rose-500/30"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.startDate && (
                  <p id="startDate-error" className="mt-1.5 text-xs text-rose-400">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {selectedDateType === "range" && (
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-slate-200 mb-1.5"
                  >
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="endDate"
                      type="date"
                      min={watch("startDate") || todayStr}
                      {...register("endDate")}
                      aria-invalid={!!errors.endDate}
                      aria-describedby={errors.endDate ? "endDate-error" : undefined}
                      className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 focus:outline-none focus:ring-2 transition-all ${
                        errors.endDate
                          ? "border-rose-500 focus:ring-rose-500/30"
                          : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                      }`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  {errors.endDate && (
                    <p id="endDate-error" className="mt-1.5 text-xs text-rose-400">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Location & Venue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-slate-200 mb-1.5"
                >
                  City / Location <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Mumbai, Goa, Bengaluru"
                    {...register("location")}
                    aria-invalid={!!errors.location}
                    aria-describedby={errors.location ? "location-error" : undefined}
                    className={`w-full px-4 py-2.5 bg-slate-950/60 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                      errors.location
                        ? "border-rose-500 focus:ring-rose-500/30"
                        : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
                {errors.location && (
                  <p id="location-error" className="mt-1.5 text-xs text-rose-400">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="venue"
                  className="block text-sm font-medium text-slate-200 mb-1.5"
                >
                  Venue <span className="text-xs text-slate-400">(Optional)</span>
                </label>
                <input
                  id="venue"
                  type="text"
                  placeholder="e.g. Grand Hyatt, Rambagh Palace"
                  {...register("venue")}
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Category Selector Cards */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-200 mb-2.5">
                Select Requirement Category <span className="text-rose-400">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {categoryOptions.map((cat) => {
                  const Icon = categoryIcons[cat.id as CategoryKey];
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id as CategoryKey)}
                      className={`relative p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-950/50 border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/20"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {cat.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm">{cat.title}</h4>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-end">
                        <span
                          className={`text-xs font-semibold ${
                            isSelected ? "text-indigo-400" : "text-slate-500"
                          }`}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.category && (
                <p className="mt-2 text-xs text-rose-400">{errors.category.message}</p>
              )}
            </div>
          </div>
        </StepShell>
      </form>

      {/* Category Change Confirmation Modal */}
      <CategoryChangeModal
        isOpen={!!pendingCategory}
        targetCategoryName={
          categoryOptions.find((c) => c.id === pendingCategory)?.title || ""
        }
        onConfirm={confirmCategoryChange}
        onCancel={() => setPendingCategory(null)}
      />
    </>
  );
};
