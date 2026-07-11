"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Sparkles,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import {
  fetchLatestTrending,
  triggerJob,
  type TrendingProductItem,
  type JobType,
} from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { LoadingOverlay } from "@/components/loading-overlay"

const SCRAPE_STEPS = [
  "Connecting Crawlee Scrapers to Myntra & Ajio",
  "Extracting Product Listings, Images & Customer Ratings (★)",
  "Calculating Weighted Popularity Scores (Rating × log10(ReviewCount + 1))",
  "Saving Top 10 Trending Snapshots to Database",
]

const GENERAL_STEPS = [
  "Initializing AI Engine & Job Worker",
  "Processing Scraped Fashion Data",
  "Executing Deep Vision Analysis & Trend Aggregation",
  "Finalizing & Updating Snapshot Storage",
]

export default function Page() {
  const [myntraProducts, setMyntraProducts] = useState<TrendingProductItem[]>(
    []
  )
  const [ajioProducts, setAjioProducts] = useState<TrendingProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Job running state
  const [runningJob, setRunningJob] = useState<{
    job: JobType
    label: string
    step: number
  } | null>(null)

  // Status banner
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [activeTab, setActiveTab] = useState<"all" | "myntra" | "ajio">("all")

  const loadTrendingData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { myntra, ajio } = await fetchLatestTrending()
      setMyntraProducts(myntra)
      setAjioProducts(ajio)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load trending data"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTrendingData()
  }, [loadTrendingData])

  // Simulate active progress steps while job runs
  useEffect(() => {
    if (!runningJob) return

    const interval = setInterval(() => {
      setRunningJob((prev) => {
        if (!prev) return null
        const nextStep = prev.step < 3 ? prev.step + 1 : prev.step
        return { ...prev, step: nextStep }
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [runningJob])

  const handleTriggerJob = async (job: JobType, label: string) => {
    setStatusMessage(null)
    setRunningJob({ job, label, step: 0 })

    const result = await triggerJob(job, true)

    setRunningJob(null)

    if (result.success) {
      setStatusMessage({ type: "success", text: result.message })
      await loadTrendingData()
    } else {
      setStatusMessage({ type: "error", text: result.message })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Navbar with Start Scraping & Manual Job buttons */}
      <Navbar
        onTriggerJob={handleTriggerJob}
        isJobRunning={runningJob !== null}
        onRefresh={loadTrendingData}
      />

      {/* Loading Overlay when a job is active */}
      {runningJob && (
        <LoadingOverlay
          jobName={runningJob.label}
          steps={runningJob.job === "scrape" ? SCRAPE_STEPS : GENERAL_STEPS}
          activeStep={runningJob.step}
        />
      )}

      {/* Main Dashboard Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`mb-6 flex items-center justify-between rounded-2xl border p-4 backdrop-blur-md ${
              statusMessage.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/15 px-3 py-1 text-xs font-extrabold tracking-widest text-purple-300 uppercase">
                <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                LIVE POPULARITY RANKINGS
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Top 10 Trending Products
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Ranked automatically by customer rating & review volume
            </p>
          </div>

          {/* Source Filter Tabs */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setActiveTab("myntra")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "myntra"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Myntra Top 10 ({myntraProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("ajio")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "ajio"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              AJIO Top 10 ({ajioProducts.length})
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-400">
              Loading Top 10 rankings from Myntra & Ajio...
            </p>
          </div>
        ) : myntraProducts.length === 0 && ajioProducts.length === 0 ? (
          /* Empty State prompt */
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
              <ShoppingBag className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">
              No Trending Products Scraped Yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Click the{" "}
              <strong className="text-purple-300">Start Scraping</strong> button
              above to crawl Myntra & Ajio, extract ratings & review counts, and
              generate the Top 10 rankings.
            </p>
            <button
              onClick={() =>
                handleTriggerJob("scrape", "Scrape Products & Top 10")
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <Sparkles className="h-4 w-4" />
              <span>Start Scraping Now</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            {/* MYNTRA TOP 10 SECTION */}
            {(activeTab === "all" || activeTab === "myntra") && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-pink-500/30 bg-pink-500/20 text-xs font-extrabold text-pink-400">
                      MY
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Myntra Top 10 Trending
                      </h2>
                      <p className="text-xs text-slate-400">
                        Top ranked products on Myntra based on rating score
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                    Showing Top {myntraProducts.length}
                  </span>
                </div>

                {myntraProducts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                    No Myntra top 10 snapshot found yet. Click &quot;Start
                    Scraping&quot; to populate.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {myntraProducts.map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* AJIO TOP 10 SECTION */}
            {(activeTab === "all" || activeTab === "ajio") && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20 text-xs font-extrabold text-blue-400">
                      AJ
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        AJIO Top 10 Trending
                      </h2>
                      <p className="text-xs text-slate-400">
                        Top ranked products on AJIO based on rating score
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                    Showing Top {ajioProducts.length}
                  </span>
                </div>

                {ajioProducts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                    No AJIO top 10 snapshot found yet. Click &quot;Start
                    Scraping&quot; to populate.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {ajioProducts.map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
