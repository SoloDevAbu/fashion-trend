import "dotenv/config";
import cron from "node-cron";
import { buildApp } from "./app";
import { logger } from "./lib/logger";
import { runScrapeJob } from "./jobs/scrape.job";
import { runAnalyzeJob } from "./jobs/analyze.job";
import { runTrendJob } from "./jobs/trend.job";
import { runGenerateJob } from "./jobs/generate.job";
import { closeBrowser } from "./lib/playwright";

const PORT = parseInt(process.env.PORT ?? "3000");
const HOST = process.env.HOST ?? "0.0.0.0";

// Cron schedules
const SCRAPE_CRON = process.env.SCRAPE_CRON ?? "0 2 * * *"; // 2 AM daily
const ANALYZE_CRON = process.env.ANALYZE_CRON ?? "0 4 * * *"; // 4 AM daily
const TREND_CRON = process.env.TREND_CRON ?? "0 6 * * *"; // 6 AM daily
const GENERATE_CRON = process.env.GENERATE_CRON ?? "0 8 * * *"; // 8 AM daily

function registerJobs(): void {
  cron.schedule(SCRAPE_CRON, async () => {
    logger.info({ schedule: SCRAPE_CRON }, "Running scheduled scrape job");
    await runScrapeJob().catch((err) =>
      logger.error({ err }, "Scheduled scrape job failed"),
    );
  });

  cron.schedule(ANALYZE_CRON, async () => {
    logger.info({ schedule: ANALYZE_CRON }, "Running scheduled analyze job");
    await runAnalyzeJob().catch((err) =>
      logger.error({ err }, "Scheduled analyze job failed"),
    );
  });

  cron.schedule(TREND_CRON, async () => {
    logger.info({ schedule: TREND_CRON }, "Running scheduled trend job");
    await runTrendJob().catch((err) =>
      logger.error({ err }, "Scheduled trend job failed"),
    );
  });

  cron.schedule(GENERATE_CRON, async () => {
    logger.info({ schedule: GENERATE_CRON }, "Running scheduled generate job");
    await runGenerateJob().catch((err) =>
      logger.error({ err }, "Scheduled generate job failed"),
    );
  });

  logger.info(
    { SCRAPE_CRON, ANALYZE_CRON, TREND_CRON, GENERATE_CRON },
    "Cron jobs registered",
  );
}

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });
    logger.info({ port: PORT, host: HOST }, "Server started");

    registerJobs();

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, "Shutting down...");
      await app.close();
      await closeBrowser();
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("uncaughtException", (err) => {
      logger.error({ err }, "Uncaught exception");
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.error({ reason }, "Unhandled rejection");
    });
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

start();
