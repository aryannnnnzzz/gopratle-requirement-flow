"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Tag,
  Edit2,
  AlertCircle,
  RefreshCw,
  Loader2,
  Send,
  Users,
  Music,
  Wrench,
  IndianRupee,
  Clock,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { useWizardStore } from "../../store/wizardStore";
import { CategoryKey, categoryOptions, plannerServices } from "../../lib/schemas";
import { buildRequirementPayload } from "../../lib/payload";
import { createRequirement, RequirementDocument, ApiError, ApiErrorDetail } from "../../lib/api";
import { formatCurrencyINR, formatEventDate, formatDateString } from "../../lib/formatters";

interface ReviewStepProps {
  onSuccess: (doc: RequirementDocument) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ onSuccess }) => {
  const { event, category, details, goToStep, prevStep } = useWizardStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiErrorDetail[]>([]);
  const [is503OrNetwork, setIs503OrNetwork] = useState(false);

  const categoryMeta = categoryOptions.find((c) => c.id === category);

  const getServiceLabel = (serviceId: string) => {
    return plannerServices.find((s) => s.id === serviceId)?.label || serviceId;
  };

  const getStepForFieldPath = (path: string): number => {
    if (
      path.startsWith("eventName") ||
      path.startsWith("eventType") ||
      path.startsWith("dateType") ||
      path.startsWith("startDate") ||
      path.startsWith("endDate") ||
      path.startsWith("location") ||
      path.startsWith("venue") ||
      path.startsWith("category")
    ) {
      return 1;
    }

    if (category === "planner") {
      if (path.includes("services") || path.includes("guestCount") || path.includes("theme") || path.includes("notes")) {
        return 2;
      }
      return 3;
    }

    if (category === "performer") {
      if (
        path.includes("performerType") ||
        path.includes("genre") ||
        path.includes("performanceDurationMins") ||
        path.includes("numberOfPerformers")
      ) {
        return 2;
      }
      return 3;
    }

    if (category === "crew") {
      if (path.includes("roles")) {
        return 2;
      }
      return 3;
    }

    return 1;
  };

  const handleSubmit = async () => {
    if (!category) {
      setErrorBanner("Category is missing. Please go back to Step 1 and select a category.");
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);
    setFieldErrors([]);
    setIs503OrNetwork(false);

    try {
      const payload = buildRequirementPayload(event, category as CategoryKey, details);
      const createdDoc = await createRequirement(payload);
      onSuccess(createdDoc);
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.statusCode === 503 || err.statusCode === 0) {
          setIs503OrNetwork(true);
          setErrorBanner(
            err.statusCode === 503
              ? "The database service is temporarily unavailable. Your data is safe in this session—please click Retry to submit again."
              : "Unable to reach the server. Please ensure the backend is running and click Retry."
          );
        } else {
          setErrorBanner(err.message || "Failed to submit requirement");
        }
        if (err.errors && err.errors.length > 0) {
          setFieldErrors(err.errors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceServerError =
    process.env.NODE_ENV === "development"
      ? async () => {
          setIsSubmitting(true);
          setErrorBanner(null);
          setFieldErrors([]);
          setIs503OrNetwork(false);

          try {
            // Send an intentionally invalid payload to test live backend Zod error handling
            const invalidPayload: any = {
              eventName: "A", // too short (min 3)
              eventType: "Corporate",
              dateType: "range",
              startDate: "2027-03-10",
              endDate: "2027-02-10", // endDate < startDate
              location: "", // required
              category: "planner",
              details: {
                services: [], // min 1 required
                guestCount: 0, // min 1 required
                budgetMin: 100000,
                budgetMax: 50000, // max < min
              },
            };

            await createRequirement(invalidPayload);
          } catch (err: any) {
            if (err instanceof ApiError) {
              setErrorBanner(`Backend Server Error (HTTP ${err.statusCode}): ${err.message}`);
              if (err.errors && err.errors.length > 0) {
                setFieldErrors(err.errors);
              }
            } else {
              setErrorBanner(err.message || "An unexpected error occurred during submission.");
            }
          } finally {
            setIsSubmitting(false);
          }
        }
      : undefined;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Banner on error */}
      {errorBanner && (
        <div
          role="alert"
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            is503OrNetwork
              ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
              : "bg-rose-950/40 border-rose-800/80 text-rose-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${is503OrNetwork ? "text-amber-400" : "text-rose-400"}`} />
            <div>
              <p className="font-semibold">{errorBanner}</p>
              {fieldErrors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs list-disc list-inside opacity-90">
                  {fieldErrors.map((fe, idx) => {
                    const stepNum = getStepForFieldPath(fe.path);
                    return (
                      <li key={idx} className="flex items-center gap-1.5 flex-wrap">
                        <span>
                          <strong className="font-mono text-slate-100">{fe.path}</strong>: {fe.message}
                        </span>
                        <button
                          type="button"
                          onClick={() => goToStep(stepNum)}
                          className="underline hover:text-white font-medium ml-1 cursor-pointer"
                        >
                          (Jump to Step {stepNum})
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {is503OrNetwork && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {/* Main Review Shell */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 mb-1">
              <span>STEP 4 OF 4</span>
              <span>•</span>
              <span>FINAL REVIEW</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Review & Submit Requirement
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Verify all event specifications before publishing to MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {categoryMeta?.title || "Requirement"}
            </span>
          </div>
        </div>

        {/* Sections Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Event Basics */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">1. Event Basics</h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Event Name</span>
                <span className="font-semibold text-slate-200 text-sm">{event.eventName || "—"}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Event Type</span>
                <span className="font-semibold text-slate-200">{event.eventType}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Date & Format</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatEventDate(event.startDate, event.endDate, event.dateType)}
                  <span className="text-slate-400 text-[10px]">({event.dateType})</span>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">City / Location</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.location}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Venue</span>
                <span className="font-semibold text-slate-200">{event.venue || "To be determined"}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Requirement Category</span>
                <span className="font-semibold text-indigo-300 capitalize">{categoryMeta?.title}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Category Scope & Details */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {category === "planner" && <Users className="w-4 h-4 text-indigo-400" />}
                {category === "performer" && <Music className="w-4 h-4 text-indigo-400" />}
                {category === "crew" && <Wrench className="w-4 h-4 text-indigo-400" />}
                <h3 className="text-sm font-bold text-slate-100">
                  2. {categoryMeta?.title || "Category"} Specifications
                </h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            {/* Planner Scope */}
            {category === "planner" && (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1.5">Required Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(details.services) && details.services.length > 0 ? (
                      details.services.map((svcId: string) => (
                        <span
                          key={svcId}
                          className="px-2.5 py-1 rounded-md bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 text-xs font-medium"
                        >
                          {getServiceLabel(svcId)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">None selected</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Expected Guest Count</span>
                    <span className="font-semibold text-slate-200 text-sm">
                      {details.guestCount ? `${details.guestCount} guests` : "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Event Theme / Concept</span>
                    <span className="font-semibold text-slate-200">
                      {details.theme ? details.theme : "Standard / Host to specify"}
                    </span>
                  </div>
                </div>

                {details.notes && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Special Coordinator Notes</span>
                    <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      &quot;{details.notes}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Performer Scope */}
            {category === "performer" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Act / Talent Type</span>
                  <span className="font-semibold text-slate-200 text-sm">
                    {details.performerType || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Genre / Style</span>
                  <span className="font-semibold text-slate-200">{details.genre || "—"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Set Duration</span>
                  <span className="font-semibold text-slate-200">
                    {details.performanceDurationMins || 60} mins
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Troupe Size</span>
                  <span className="font-semibold text-slate-200">
                    {details.numberOfPerformers || 1} artist(s)
                  </span>
                </div>
              </div>
            )}

            {/* Crew Scope */}
            {category === "crew" && (
              <div className="space-y-3 text-xs">
                <span className="text-slate-400 block">Requested Crew Positions</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(details.roles) && details.roles.length > 0 ? (
                    details.roles.map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-200">{r.role} Crew</span>
                        <span className="text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                          {r.count} personnel
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400">No positions specified</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Logistics, Schedule & Budget */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 transition-all">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  3. Logistics, Schedule &amp; Budget
                </h3>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
            </div>

            {/* Planner Budget */}
            {category === "planner" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Budget Bracket</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                    {formatCurrencyINR(details.budgetMin)} – {formatCurrencyINR(details.budgetMax)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Planning Deadline</span>
                  <span className="font-semibold text-slate-200">
                    {details.planningDeadline ? formatDateString(details.planningDeadline) : "Flexible / Before event"}
                  </span>
                </div>
              </div>
            )}

            {/* Performer Budget & Rider */}
            {category === "performer" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Performance Fee / Budget</span>
                    <span className="font-semibold text-emerald-400 text-sm">
                      {formatCurrencyINR(details.budgetPerPerformance)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Sound / Instruments Provided</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        details.equipmentProvidedByHost ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {details.equipmentProvidedByHost ? "Yes (Provided by Host)" : "No (Artist must bring)"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Travel & Accommodation</span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        details.travelAccommodationCovered ? "text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {details.travelAccommodationCovered ? "Covered by Host" : "Not Covered"}
                    </span>
                  </div>
                </div>

                {details.technicalRequirements && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Technical Rider & Stage Specifications</span>
                    <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      &quot;{details.technicalRequirements}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Crew Budget & Shift */}
            {category === "crew" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Shift Duration</span>
                  <span className="font-semibold text-slate-200 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {details.shiftHours || 8} hours / day
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Daily Rate per Head</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                    {formatCurrencyINR(details.dailyRate)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">On-Site Call Time</span>
                  <span className="font-semibold text-slate-200">{details.callTime || "08:00"}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Experience Level</span>
                  <span className="font-semibold text-indigo-300">{details.experienceLevel || "Intermediate"}</span>
                </div>

                {details.requiredCertifications &&
                  (Array.isArray(details.requiredCertifications)
                    ? details.requiredCertifications.length > 0
                    : Boolean(details.requiredCertifications)) && (
                    <div className="sm:col-span-2 md:col-span-4 mt-2 pt-2 border-t border-slate-850">
                      <span className="text-slate-400 block mb-1">Required Certifications</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(details.requiredCertifications)
                          ? details.requiredCertifications
                          : String(details.requiredCertifications).split(",")
                        ).map((c: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-300 text-[11px]"
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 sm:px-8 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl transition-all disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Step 3
          </button>

          <div className="flex items-center gap-4">
            {process.env.NODE_ENV === "development" && handleForceServerError && (
              <button
                type="button"
                onClick={handleForceServerError}
                disabled={isSubmitting}
                className="text-xs text-rose-400/80 hover:text-rose-300 underline font-medium cursor-pointer transition-colors"
                title="Test real backend server error mapping"
              >
                Test Server Error
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Requirement...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Requirement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
