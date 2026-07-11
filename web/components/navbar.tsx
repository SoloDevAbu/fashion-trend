import React from "react";
import {
  Sparkles,
  Play,
  RefreshCw,
  Eye,
  TrendingUp,
  Palette,
  Layers,
} from "lucide-react";
import type { JobType } from "@/lib/api";

interface NavbarProps {
  onTriggerJob: (job: JobType, label: string) => void;
  isJobRunning: boolean;
  onRefresh: () => void;
}

export function Navbar({
  onTriggerJob,
  isJobRunning,
  onRefresh,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md shadow-purple-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                FASHION PULSE
              </span>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-300 border border-purple-500/30">
                AI DISCOVERY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time Trend Engine & Popularity Dashboard
            </p>
          </div>
        </div>

        {/* Manual Job Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY CTA: Start Scraping */}
          <button
            onClick={() => onTriggerJob("scrape", "Scrape Products & Top 10")}
            disabled={isJobRunning}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Scraping</span>
          </button>

          {/* Analyze Vision */}
          <button
            onClick={() => onTriggerJob("analyze", "AI Vision Analysis")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500/50 hover:bg-slate-800 disabled:opacity-50"
          >
            <Eye className="h-3.5 w-3.5 text-purple-400" />
            <span>Analyze Vision</span>
          </button>

          {/* Trend AI */}
          <button
            onClick={() => onTriggerJob("trend", "Generate Trend Snapshot")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500/50 hover:bg-slate-800 disabled:opacity-50"
          >
            <TrendingUp className="h-3.5 w-3.5 text-pink-400" />
            <span>Trend AI</span>
          </button>

          {/* AI Designs */}
          <button
            onClick={() => onTriggerJob("generate", "Generate AI Designs")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500/50 hover:bg-slate-800 disabled:opacity-50"
          >
            <Palette className="h-3.5 w-3.5 text-amber-400" />
            <span>AI Designs</span>
          </button>

          {/* Run Full Pipeline */}
          <button
            onClick={() => onTriggerJob("run-all", "Full AI Pipeline")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-200 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Run Full Pipeline</span>
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isJobRunning}
            title="Refresh dashboard data"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
