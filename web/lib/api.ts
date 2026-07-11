export interface TrendingProductItem {
  id: number;
  runId: string;
  rank: number;
  productId: number;
  source: "myntra" | "ajio" | string;
  score: string;
  rating?: string | null;
  ratingCount?: number | null;
  title?: string;
  imageUrl?: string;
  cloudinaryUrl?: string | null;
  productUrl?: string;
  price?: string | null;
  currency?: string | null;
}

export interface TrendingResponse {
  data: {
    myntra?: TrendingProductItem[];
    ajio?: TrendingProductItem[];
  };
  meta?: {
    timestamp: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchLatestTrending(): Promise<{
  myntra: TrendingProductItem[];
  ajio: TrendingProductItem[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/trending/latest`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch trending products: ${res.statusText}`);
    }

    const json: TrendingResponse = await res.json();
    return {
      myntra: json.data?.myntra || [],
      ajio: json.data?.ajio || [],
    };
  } catch (error) {
    console.error("Error fetching latest trending:", error);
    return { myntra: [], ajio: [] };
  }
}

export type JobType = "scrape" | "analyze" | "trend" | "generate" | "run-all";

export async function triggerJob(
  job: JobType,
  sync = true,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${API_BASE_URL}/jobs/${job}?sync=${sync ? "true" : "false"}`;
    const res = await fetch(url, {
      method: "POST",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: json.error || `Failed to start job ${job}`,
      };
    }

    return {
      success: true,
      message: json.message || `Job ${job} finished successfully`,
    };
  } catch (error) {
    console.error(`Error triggering job ${job}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    };
  }
}
