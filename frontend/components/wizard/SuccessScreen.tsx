"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, PlusCircle, Calendar, MapPin, Tag } from "lucide-react";
import { RequirementDocument } from "../../lib/api";
import { formatEventDate } from "../../lib/formatters";
import { categoryOptions } from "../../lib/schemas";

interface SuccessScreenProps {
  document: RequirementDocument;
  onPostAnother: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ document, onPostAnother }) => {
  const [copied, setCopied] = useState(false);

  const categoryMeta = categoryOptions.find((c) => c.id === document.category);

  const handleCopyId = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(document._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-center p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
        Requirement Posted Successfully
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mb-2">
        Your Requirement is Live!
      </h2>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
        Your event posting has been saved to the database and categorised for verified professionals to discover.
      </p>

      {/* Reference Card */}
      <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-5 mb-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-850">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Reference ID
            </span>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs sm:text-sm font-mono text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                {document._id}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy reference ID"
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {categoryMeta?.title || document.category}
            </span>
            <span className="text-xs text-slate-400">({categoryMeta?.badge})</span>
          </div>
        </div>

        {/* Event Quick Snapshot */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Event Name</span>
            <span className="font-semibold text-slate-200">{document.eventName}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Event Type</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              {document.eventType}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Event Date</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formatEventDate(document.startDate, document.endDate, document.dateType)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Location</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {document.location} {document.venue ? `(${document.venue})` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPostAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          Post Another Requirement
        </button>

        <Link
          href="/requirements"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-sm font-semibold rounded-xl border border-slate-700 transition-all"
        >
          View All Requirements
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
