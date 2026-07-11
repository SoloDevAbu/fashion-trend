import Fastify from "fastify";
import cors from "@fastify/cors";
import { logger } from "./lib/logger";
import { productsRoute } from "./routes/products.route";
import { trendsRoute } from "./routes/trends.route";
import { designsRoute } from "./routes/designs.route";
import { jobsRoute } from "./routes/jobs.route";
import { trendingRoute } from "./routes/trending.route";

export async function buildApp() {
  const app = Fastify({
    logger: false, // We use our own pino logger
  });

  // Plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // API info
  app.get("/", async () => ({
    name: "Fashion Trend MVP API",
    version: "1.0.0",
    endpoints: {
      products: "/products",
      trending: "/trending/latest",
      trends: "/trends/latest",
      designs: "/designs",
      jobs: "/jobs/*",
      health: "/health",
    },
  }));

  // Routes
  await app.register(productsRoute);
  await app.register(trendsRoute);
  await app.register(trendingRoute);
  await app.register(designsRoute);
  await app.register(jobsRoute);


  // Global error handler
  app.setErrorHandler(
    (error: Error & { statusCode?: number }, _request, reply) => {
      logger.error({ error }, "Unhandled route error");
      reply.status(error.statusCode ?? 500).send({
        error: error.message ?? "Internal Server Error",
      });
    },
  );

  return app;
}
