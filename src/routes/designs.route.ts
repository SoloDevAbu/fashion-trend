import type { FastifyInstance } from "fastify";
import { GeneratorService } from "../modules/generator/generator.service";

const generatorService = new GeneratorService();

export async function designsRoute(fastify: FastifyInstance): Promise<void> {
  // GET /designs
  fastify.get<{ Querystring: { limit?: string; offset?: string } }>(
    "/designs",
    async (request, reply) => {
      const limit = parseInt((request.query as any).limit ?? "20");
      const offset = parseInt((request.query as any).offset ?? "0");

      const designs = await generatorService.getAllDesigns(
        isNaN(limit) ? 20 : limit,
        isNaN(offset) ? 0 : offset,
      );

      return reply.send({ data: designs, meta: { count: designs.length } });
    },
  );

  // POST /designs/generate - manually trigger design generation
  fastify.post("/designs/generate", async (_request, reply) => {
    try {
      const design = await generatorService.generateFromLatestTrend();
      return reply
        .status(201)
        .send({ data: design, message: "Design generated successfully" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      return reply.status(500).send({ error: msg });
    }
  });
}
