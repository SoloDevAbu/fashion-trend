import type { FastifyInstance } from "fastify";
import { ProductService } from "../modules/products/product.service";
import { productQuerySchema } from "../modules/products/product.schema";

const productService = new ProductService();

export async function productsRoute(fastify: FastifyInstance): Promise<void> {
  // GET /products
  fastify.get("/products", async (request, reply) => {
    const parsed = productQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({
          error: "Invalid query params",
          details: parsed.error.flatten(),
        });
    }

    const products = await productService.getProducts(parsed.data);
    const stats = await productService.getStats();

    return reply.send({
      data: products,
      meta: {
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        stats,
      },
    });
  });

  // GET /products/:id
  fastify.get<{ Params: { id: string } }>(
    "/products/:id",
    async (request, reply) => {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return reply.status(400).send({ error: "Invalid product ID" });
      }

      const product = await productService.getProductById(id);
      if (!product) {
        return reply.status(404).send({ error: "Product not found" });
      }

      return reply.send({ data: product });
    },
  );

  // GET /products/stats
  fastify.get("/products/stats", async (_request, reply) => {
    const stats = await productService.getStats();
    return reply.send({ data: stats });
  });
}
