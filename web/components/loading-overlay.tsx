import React from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface LoadingOverlayProps {
  jobName: string;
  steps: string[];
  activeStep: number;
}

export function LoadingOverlay({
  jobName,
  steps,
  activeStep,
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/30 bg-slate-900/90 p-8 shadow-2xl shadow-purple-500/20">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>

          <div className="mt-4 flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI DATA COLLECTION & RANKING</span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-white">
            Running {jobName}...
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Please wait while the automated pipeline crawls and computes top trends.
          </p>

          <div className="mt-6 w-full space-y-3 text-left">
            {steps.map((step, idx) => {
              const isDone = idx < activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 ${
                    isCurrent
                      ? "border-purple-500/40 bg-purple-500/10 text-white"
                      : isDone
                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                        : "border-slate-800 bg-slate-900/40 text-slate-500"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-purple-400" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border border-slate-700" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? "text-purple-200" : ""
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
