import type { FastifyInstance } from "fastify";
import { TrendingService } from "../modules/trending/trending.service";

const trendingService = new TrendingService();

export async function trendingRoute(fastify: FastifyInstance): Promise<void> {
  // GET /trending/latest
  // Returns top 10 products separated by source (myntra & ajio)
  fastify.get("/trending/latest", async (request, reply) => {
    const sourceParam = (request.query as { source?: string })?.source;

    if (sourceParam) {
      const items = await trendingService.getLatestTop10(sourceParam);
      return reply.send({
        data: {
          [sourceParam]: items,
        },
      });
    }

    const [myntraTop10, ajioTop10] = await Promise.all([
      trendingService.getLatestTop10("myntra"),
      trendingService.getLatestTop10("ajio"),
    ]);

    return reply.send({
      data: {
        myntra: myntraTop10,
        ajio: ajioTop10,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });
}
