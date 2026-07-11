import type { FastifyInstance } from "fastify";
import { runScrapeJob } from "../jobs/scrape.job";
import { runAnalyzeJob } from "../jobs/analyze.job";
import { runTrendJob } from "../jobs/trend.job";
import { runGenerateJob } from "../jobs/generate.job";
import { logger } from "../lib/logger";

export async function jobsRoute(fastify: FastifyInstance): Promise<void> {
  // POST /jobs/scrape - manually trigger scraping
  fastify.post("/jobs/scrape", async (request, reply) => {
    const isSync = (request.query as { sync?: string })?.sync === "true";
    logger.info({ sync: isSync }, "Manual scrape triggered via API");

    if (isSync) {
      try {
        await runScrapeJob();
        return reply.status(200).send({ message: "Scrape job completed successfully" });
      } catch (err) {
        logger.error({ err }, "Manual scrape failed");
        return reply.status(500).send({ error: "Scraping failed" });
      }
    }

    runScrapeJob().catch((err) =>
      logger.error({ err }, "Manual scrape failed"),
    );
    return reply.status(202).send({ message: "Scrape job started" });
  });

  // POST /jobs/analyze - manually trigger vision analysis
  fastify.post("/jobs/analyze", async (request, reply) => {
    const isSync = (request.query as { sync?: string })?.sync === "true";
    logger.info({ sync: isSync }, "Manual analyze triggered via API");

    if (isSync) {
      try {
        await runAnalyzeJob();
        return reply.status(200).send({ message: "Analyze job completed successfully" });
      } catch (err) {
        logger.error({ err }, "Manual analyze failed");
        return reply.status(500).send({ error: "Analysis failed" });
      }
    }

    runAnalyzeJob().catch((err) =>
      logger.error({ err }, "Manual analyze failed"),
    );
    return reply.status(202).send({ message: "Analyze job started" });
  });

  // POST /jobs/trend - manually trigger trend generation
  fastify.post("/jobs/trend", async (request, reply) => {
    const isSync = (request.query as { sync?: string })?.sync === "true";
    logger.info({ sync: isSync }, "Manual trend job triggered via API");

    if (isSync) {
      try {
        await runTrendJob();
        return reply.status(200).send({ message: "Trend job completed successfully" });
      } catch (err) {
        logger.error({ err }, "Manual trend job failed");
        return reply.status(500).send({ error: "Trend generation failed" });
      }
    }

    runTrendJob().catch((err) =>
      logger.error({ err }, "Manual trend job failed"),
    );
    return reply.status(202).send({ message: "Trend job started" });
  });

  // POST /jobs/generate - manually trigger design generation
  fastify.post("/jobs/generate", async (request, reply) => {
    const isSync = (request.query as { sync?: string })?.sync === "true";
    logger.info({ sync: isSync }, "Manual generate job triggered via API");

    if (isSync) {
      try {
        await runGenerateJob();
        return reply.status(200).send({ message: "Generate job completed successfully" });
      } catch (err) {
        logger.error({ err }, "Manual generate job failed");
        return reply.status(500).send({ error: "Design generation failed" });
      }
    }

    runGenerateJob().catch((err) =>
      logger.error({ err }, "Manual generate job failed"),
    );
    return reply.status(202).send({ message: "Generate job started" });
  });

  // POST /jobs/run-all - run full pipeline sequentially
  fastify.post("/jobs/run-all", async (request, reply) => {
    const isSync = (request.query as { sync?: string })?.sync === "true";
    logger.info({ sync: isSync }, "Full pipeline triggered via API");

    if (isSync) {
      try {
        await runScrapeJob();
        await runAnalyzeJob();
        await runTrendJob();
        await runGenerateJob();
        logger.info("Full pipeline completed");
        return reply.status(200).send({ message: "Full pipeline completed successfully" });
      } catch (err) {
        logger.error({ err }, "Full pipeline failed");
        return reply.status(500).send({ error: "Full pipeline execution failed" });
      }
    }

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

