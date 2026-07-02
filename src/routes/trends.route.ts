import type { FastifyInstance } from "fastify";
import { TrendService } from "../modules/trends/trend.service";

const trendService = new TrendService();

export async function trendsRoute(fastify: FastifyInstance): Promise<void> {
  // GET /trends/latest
  fastify.get("/trends/latest", async (_request, reply) => {
    const snapshot = await trendService.getLatestSnapshot();
    if (!snapshot) {
      return reply
        .status(404)
        .send({ error: "No trend snapshots found. Run trend analysis first." });
    }
    return reply.send({ data: snapshot });
  });

  // GET /trends - list all snapshots
  fastify.get<{ Querystring: { limit?: string } }>(
    "/trends",
    async (request, reply) => {
      const limit = parseInt((request.query as any).limit ?? "10");
      const snapshots = await trendService.getAllSnapshots(
        isNaN(limit) ? 10 : limit,
      );
      return reply.send({ data: snapshots, meta: { count: snapshots.length } });
    },
  );

  // POST /trends/generate - manually trigger trend generation
  fastify.post("/trends/generate", async (_request, reply) => {
    try {
      const snapshot = await trendService.generateTrendSnapshot();
      return reply
        .status(201)
        .send({ data: snapshot, message: "Trend snapshot generated" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return reply.status(500).send({ error: msg });
    }
  });
}
