import { ScraperService } from "../modules/scraper/scraper.service";
import { logger } from "../lib/logger";

export async function runScrapeJob(): Promise<void> {
  logger.info("=== SCRAPE JOB STARTED ===");
  const start = Date.now();

  try {
    const service = new ScraperService();
    const results = await service.runAll();

    const totalProducts = results.reduce(
      (sum, r) => sum + r.products.length,
      0,
    );
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    logger.info(
      { totalProducts, totalErrors, durationMs: Date.now() - start },
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
