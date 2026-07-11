"use client"

import React from "react"
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface LoadingOverlayProps {
  jobName: string
  steps: string[]
  activeStep: number
}

export function LoadingOverlay({
  jobName,
  steps,
  activeStep,
}: LoadingOverlayProps) {
  return (
    <Dialog open={true}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-black/80 sm:max-w-md"
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-amber-400 shadow-md">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <Badge
            variant="outline"
            className="mt-3 border-zinc-800 bg-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            <span>AI DATA COLLECTION & RANKING</span>
          </Badge>

          <DialogTitle className="mt-3 text-xl font-bold text-white">
            Running {jobName}...
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Please wait while the automated engine processes and computes live
            trends.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 w-full space-y-2.5">
          {steps.map((step, idx) => {
            const isDone = idx < activeStep
            const isCurrent = idx === activeStep

            return (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
                  isCurrent
                    ? "border-amber-500/40 bg-amber-500/10 text-white shadow-sm"
                    : isDone
                      ? "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                      : "border-zinc-900 bg-zinc-950/40 text-zinc-600"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-400" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-400" />
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border border-zinc-800" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isCurrent
                      ? "font-semibold text-zinc-100"
                      : isDone
                        ? "text-zinc-300"
                        : ""
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
