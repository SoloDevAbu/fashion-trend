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
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
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
        {/* Status Notification Banner using Shadcn Alert */}
        {statusMessage && (
          <Alert
            className={`mb-6 border backdrop-blur-md ${
              statusMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <div>
              <AlertTitle className="font-semibold text-white">
                {statusMessage.type === "success" ? "Success" : "Notice"}
              </AlertTitle>
              <AlertDescription className="text-zinc-300">
                {statusMessage.text}
              </AlertDescription>
            </div>
            <AlertAction>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStatusMessage(null)}
                className="text-zinc-400 hover:text-white"
              >
                Dismiss
              </Button>
            </AlertAction>
          </Alert>
        )}

        {/* Top Header Section */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            {/* <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400"
              >
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                LIVE POPULARITY RANKINGS
              </Badge>
            </div> */}
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Top 10 Trending Products
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Ranked automatically by customer rating & review volume across
              fashion retailers
            </p>
          </div>

          {/* Source Filter Tabs using Shadcn Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "all" | "myntra" | "ajio")
            }
          >
            <TabsList className="border border-zinc-800 bg-zinc-900/80 p-1">
              <TabsTrigger value="all">All Sources</TabsTrigger>
              <TabsTrigger value="myntra">
                Myntra Top 10 ({myntraProducts.length})
              </TabsTrigger>
              <TabsTrigger value="ajio">
                AJIO Top 10 ({ajioProducts.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-amber-400">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-400">
              Loading Top 10 rankings from Myntra & Ajio...
            </p>
          </div>
        ) : myntraProducts.length === 0 && ajioProducts.length === 0 ? (
          /* Empty State prompt inside Shadcn Card */
          <Card className="mt-12 flex flex-col items-center justify-center border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-amber-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">
              No Trending Products Scraped Yet
            </h3>
            <p className="mt-1 max-w-md text-sm text-zinc-400">
              Click the{" "}
              <strong className="text-amber-400">Start Scraping</strong> button
              above to crawl Myntra & Ajio, extract ratings & review counts, and
              generate the Top 10 rankings.
            </p>
            <Button
              onClick={() =>
                handleTriggerJob("scrape", "Scrape Products & Top 10")
              }
              className="mt-6 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 shadow-md hover:bg-amber-400"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Start Scraping Now</span>
            </Button>
          </Card>
        ) : (
          <div className="mt-8 space-y-12">
            {/* MYNTRA TOP 10 SECTION */}
            {(activeTab === "all" || activeTab === "myntra") && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-extrabold text-white">
                      MY
                    </Badge>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Myntra Top 10 Trending
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Top ranked products on Myntra based on rating score
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300"
                  >
                    Showing Top {myntraProducts.length}
                  </Badge>
                </div>

                {myntraProducts.length === 0 ? (
                  <Card className="border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
                    No Myntra top 10 snapshot found yet. Click &quot;Start
                    Scraping&quot; to populate.
                  </Card>
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
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-extrabold text-white">
                      AJ
                    </Badge>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        AJIO Top 10 Trending
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Top ranked products on AJIO based on rating score
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300"
                  >
                    Showing Top {ajioProducts.length}
                  </Badge>
                </div>

                {ajioProducts.length === 0 ? (
                  <Card className="border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-400">
                    No AJIO top 10 snapshot found yet. Click &quot;Start
                    Scraping&quot; to populate.
                  </Card>
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
