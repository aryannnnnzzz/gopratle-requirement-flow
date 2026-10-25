import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-850 px-6 py-4 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            G
          </div>
          <span className="font-bold text-lg tracking-tight">GoPratle</span>
        </div>
        <Link
          href="/post-requirement"
          className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all shadow-sm"
        >
          Post a Requirement
        </Link>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/40 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Seamless 4-Step Requirement Posting Flow
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15] mb-6">
          Find Top <span className="text-indigo-400">Planners</span>,{" "}
          <span className="text-emerald-400">Performers</span> &amp;{" "}
          <span className="text-amber-400">Crew</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Post your event requirements in minutes. Our adaptive wizard tailors each step to your specific needs—from guest coordination to technical riders and crew shifts.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/post-requirement"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-base shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Post a Requirement Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/requirements"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold rounded-xl text-base border border-slate-800 transition-all"
          >
            Browse Requirements
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-850 w-full text-left">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">Adaptive Category Flow</h3>
            <p className="text-xs text-slate-400 mt-1">
              Custom-tailored field requirements for Coordinators, Artists, and Technical Staff.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">Draft Auto-Persistence</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your form state is safely cached in sessionStorage so you never lose progress.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-200">Strict Validation</h3>
            <p className="text-xs text-slate-400 mt-1">
              Instant feedback with Zod client and server validation matching exact requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 px-6 py-6 text-center text-xs text-slate-500">
        GoPratle Requirement Posting Flow • Built with Next.js, Express &amp; MongoDB
      </footer>
    </main>
  );
}
