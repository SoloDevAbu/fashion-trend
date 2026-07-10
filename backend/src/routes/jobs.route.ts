import type { FastifyInstance } from "fastify";
import { runScrapeJob } from "../jobs/scrape.job";
import { runAnalyzeJob } from "../jobs/analyze.job";
import { runTrendJob } from "../jobs/trend.job";
import { runGenerateJob } from "../jobs/generate.job";
import { logger } from "../lib/logger";

export async function jobsRoute(fastify: FastifyInstance): Promise<void> {
  // POST /jobs/scrape - manually trigger scraping
  fastify.post("/jobs/scrape", async (_request, reply) => {
    logger.info("Manual scrape triggered via API");
    // Run async, respond immediately
    runScrapeJob().catch((err) =>
      logger.error({ err }, "Manual scrape failed"),
    );
    return reply.status(202).send({ message: "Scrape job started" });
  });

  // POST /jobs/analyze - manually trigger vision analysis
  fastify.post("/jobs/analyze", async (_request, reply) => {
    logger.info("Manual analyze triggered via API");
    runAnalyzeJob().catch((err) =>
      logger.error({ err }, "Manual analyze failed"),
    );
    return reply.status(202).send({ message: "Analyze job started" });
  });

  // POST /jobs/trend - manually trigger trend generation
  fastify.post("/jobs/trend", async (_request, reply) => {
    logger.info("Manual trend job triggered via API");
    runTrendJob().catch((err) =>
      logger.error({ err }, "Manual trend job failed"),
    );
    return reply.status(202).send({ message: "Trend job started" });
  });

  // POST /jobs/generate - manually trigger design generation
  fastify.post("/jobs/generate", async (_request, reply) => {
    logger.info("Manual generate job triggered via API");
    runGenerateJob().catch((err) =>
      logger.error({ err }, "Manual generate job failed"),
    );
    return reply.status(202).send({ message: "Generate job started" });
  });

  // POST /jobs/run-all - run full pipeline sequentially
  fastify.post("/jobs/run-all", async (_request, reply) => {
    logger.info("Full pipeline triggered via API");
    (async () => {
      try {
        await runScrapeJob();
        await runAnalyzeJob();
        await runTrendJob();
        await runGenerateJob();
        logger.info("Full pipeline completed");
      } catch (err) {
        logger.error({ err }, "Full pipeline failed");
      }
    })();
    return reply.status(202).send({ message: "Full pipeline started" });
  });
}
