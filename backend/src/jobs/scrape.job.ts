import { crawlerService } from "../modules/data-collection/index";
import { logger } from "../lib/logger";

export async function runScrapeJob(): Promise<void> {
  logger.info("=== SCRAPE JOB STARTED ===");
  const start = Date.now();

  try {
    const stats = await crawlerService.runAll();

    logger.info(
      { ...stats, durationMs: Date.now() - start },
      "=== SCRAPE JOB COMPLETED ===",
    );
  } catch (error) {
    logger.error(
      { error, durationMs: Date.now() - start },
      "=== SCRAPE JOB FAILED ===",
    );
    throw error;
  }
}
