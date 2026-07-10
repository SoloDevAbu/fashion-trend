import { TrendService } from "../modules/trends/trend.service";
import { logger } from "../lib/logger";

export async function runTrendJob(): Promise<void> {
  logger.info("=== TREND JOB STARTED ===");
  const start = Date.now();

  try {
    const trendService = new TrendService();
    const snapshot = await trendService.generateTrendSnapshot();

    logger.info(
      {
        snapshotId: snapshot.id,
        periodLabel: snapshot.periodLabel,
        totalProducts: snapshot.totalProductsAnalyzed,
        durationMs: Date.now() - start,
      },
      "=== TREND JOB COMPLETED ===",
    );
  } catch (error) {
    logger.error(
      { error, durationMs: Date.now() - start },
      "=== TREND JOB FAILED ===",
    );
    throw error;
  }
}
