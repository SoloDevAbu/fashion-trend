import React from "react"
import {
  Sparkles,
  Play,
  RefreshCw,
  Eye,
  TrendingUp,
  Palette,
  Layers,
} from "lucide-react"
import type { JobType } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NavbarProps {
  onTriggerJob: (job: JobType, label: string) => void
  isJobRunning: boolean
  onRefresh: () => void
}

export function Navbar({
  onTriggerJob,
  isJobRunning,
  onRefresh,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Editorial Brand Logo */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-amber-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                FASHION PULSE
              </span>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300"
              >
                AI Discovery
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Real-time Editorial Trend Engine & Popularity Index
            </p>
          </div>
        </div>

        {/* Action Controls using Shadcn Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PRIMARY CTA */}
          <Button
            onClick={() => onTriggerJob("scrape", "Scrape Products & Top 10")}
            disabled={isJobRunning}
            size="sm"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Scraping</span>
          </Button>

          {/* Analyze Vision */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTriggerJob("analyze", "AI Vision Analysis")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border-zinc-800 bg-zinc-900/80 px-3.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            <Eye className="h-3.5 w-3.5 text-zinc-400" />
            <span>Analyze Vision</span>
          </Button>

          {/* Trend AI */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTriggerJob("trend", "Generate Trend Snapshot")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border-zinc-800 bg-zinc-900/80 px-3.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
            <span>Trend AI</span>
          </Button>

          {/* AI Designs */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTriggerJob("generate", "Generate AI Designs")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border-zinc-800 bg-zinc-900/80 px-3.5 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
          >
            <Palette className="h-3.5 w-3.5 text-zinc-400" />
            <span>AI Designs</span>
          </Button>

          {/* Full Pipeline */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onTriggerJob("run-all", "Full AI Pipeline")}
            disabled={isJobRunning}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700"
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>Full Pipeline</span>
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isJobRunning}
            title="Refresh dashboard data"
            className="h-9 w-9 rounded-xl border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
