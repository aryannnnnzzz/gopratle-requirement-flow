"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Tag,
  Users,
  Music,
  Wrench,
  PlusCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  Clock,
  Sparkles,
} from "lucide-react";
import { getRequirements, RequirementDocument, ApiError } from "../../lib/api";
import { formatCurrencyINR, formatEventDate } from "../../lib/formatters";
import { plannerServices } from "../../lib/schemas";

const categoryTabs = [
  { id: "all", label: "All Requirements", icon: Sparkles },
  { id: "planner", label: "Event Planners", icon: Users },
  { id: "performer", label: "Performers", icon: Music },
  { id: "crew", label: "Crew & Tech", icon: Wrench },
];

export default function RequirementsListPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(6);

  const [items, setItems] = useState<RequirementDocument[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (cat: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRequirements({
        category: cat,
        page: pageNum,
        limit,
      });
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to load requirements");
      } else {
        setError("Network error. Please ensure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchList(activeTab, page);
  }, [activeTab, page, fetchList]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const getServiceLabel = (serviceId: string) => {
    return plannerServices.find((s) => s.id === serviceId)?.label || serviceId;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-850">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-indigo-400 font-medium">Requirements Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Event Requirements
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Browse verified event requirements categorized by Planners, Performers, and Operational Crew.
            </p>
          </div>

          <Link
            href="/post-requirement"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Requirement
          </Link>
        </header>

        {/* Category Tabs */}
        <nav aria-label="Category Filters" className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="p-6 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Unable to load requirements</h3>
                <p className="text-xs text-rose-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchList(activeTab, page)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-900 hover:bg-rose-850 text-white border border-rose-700/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 animate-pulse flex flex-col justify-between h-72"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-slate-800 rounded-full" />
                    <div className="h-4 w-16 bg-slate-800 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-slate-800 rounded mt-2" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded" />
                  <div className="space-y-2 pt-3 border-t border-slate-850">
                    <div className="h-4 w-full bg-slate-800/60 rounded" />
                    <div className="h-4 w-4/5 bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="h-8 w-full bg-slate-800/50 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-850 rounded-2xl max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              No Requirements Found
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              There are currently no posted requirements under this category tab. Be the first to create one!
            </p>
            <Link
              href="/post-requirement"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              Post a Requirement
            </Link>
          </div>
        )}

        {/* Requirements Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const isPlanner = item.category === "planner";
              const isPerformer = item.category === "performer";
              const isCrew = item.category === "crew";

              return (
                <div
                  key={item._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category Badge & Event Type */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isPlanner
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                            : isPerformer
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isPlanner && "Event Planner"}
                        {isPerformer && "Performer"}
                        {isCrew && "Crew & Tech"}
                      </span>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.eventType}
                      </span>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-base font-bold text-slate-100 tracking-tight line-clamp-1 mb-2">
                      {item.eventName}
                    </h3>

                    {/* Meta Info: Date and Location */}
                    <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {formatEventDate(item.startDate, item.endDate, item.dateType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {item.location} {item.venue ? `• ${item.venue}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Category-Specific Details Snapshot */}
                    <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2 text-xs">
                      {isPlanner && (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Guest Count</span>
                            <span className="font-semibold text-slate-200">
                              {item.details.guestCount || "—"} guests
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-1">Services</span>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(item.details.services) &&
                                item.details.services.slice(0, 3).map((s: string) => (
                                  <span
                                    key={s}
                                    className="px-1.5 py-0.5 rounded bg-slate-850 text-slate-300 text-[10px]"
                                  >
                                    {getServiceLabel(s)}
                                  </span>
                                ))}
                              {Array.isArray(item.details.services) &&
                                item.details.services.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-850 text-slate-400 text-[10px]">
                                    +{item.details.services.length - 3} more
                                  </span>
                                )}
                            </div>
                          </div>
                        </>
                      )}

                      {isPerformer && (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Act / Talent</span>
                            <span className="font-semibold text-slate-200">
                              {item.details.performerType} ({item.details.genre})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Duration & Troupe</span>
                            <span className="font-semibold text-slate-200">
                              {item.details.performanceDurationMins}m • {item.details.numberOfPerformers} artist(s)
                            </span>
                          </div>
                        </>
                      )}

                      {isCrew && (
                        <>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Positions</span>
                            <span className="font-semibold text-slate-200">
                              {Array.isArray(item.details.roles)
                                ? item.details.roles.map((r: any) => `${r.role} (${r.count})`).join(", ")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Shift & Level</span>
                            <span className="font-semibold text-slate-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.details.shiftHours}h • {item.details.experienceLevel}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Budget / Rate */}
                  <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {isPlanner ? "Budget Range" : isPerformer ? "Performance Fee" : "Daily Rate / Head"}
                    </span>
                    <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {isPlanner &&
                        `${formatCurrencyINR(item.details.budgetMin)} - ${formatCurrencyINR(item.details.budgetMax)}`.replace(/₹/g, "")}
                      {isPerformer &&
                        formatCurrencyINR(item.details.budgetPerPerformance).replace("₹", "")}
                      {isCrew &&
                        formatCurrencyINR(item.details.dailyRate).replace("₹", "")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 pt-6 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} requirements
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="px-2 font-semibold text-slate-200">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
