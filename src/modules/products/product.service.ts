import { logger } from "../../lib/logger";
import { ProductRepository } from "./product.repository";
import {
  createProductSchema,
  type CreateProductInput,
  type ProductQueryInput,
} from "./product.schema";
import type { Product } from "../../db";

export class ProductService {
  private readonly repo: ProductRepository;

  constructor() {
    this.repo = new ProductRepository();
  }

  async createProduct(input: CreateProductInput): Promise<Product | null> {
    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) {
      logger.warn({ errors: parsed.error.flatten() }, "Invalid product input");
      return null;
    }

    // Skip duplicates
    const exists = await this.repo.existsByProductUrl(parsed.data.productUrl);
    if (exists) {
      logger.debug(
        { productUrl: parsed.data.productUrl },
        "Product already exists, skipping",
      );
      return null;
    }

    const product = await this.repo.insert({
      title: parsed.data.title,
      source: parsed.data.source,
      imageUrl: parsed.data.imageUrl,
      localImagePath: parsed.data.localImagePath,
      productUrl: parsed.data.productUrl,
      price: parsed.data.price,
      currency: parsed.data.currency,
    });

    logger.info(
      { productId: product.id, source: product.source },
      "Product created",
    );
    return product;
  }

  async getProducts(query: ProductQueryInput): Promise<Product[]> {
    return this.repo.findAll({
      ...(query.source !== undefined ? { source: query.source } : {}),
      ...(query.isAnalyzed !== undefined ? { isAnalyzed: query.isAnalyzed } : {}),
      limit: query.limit,
      offset: query.offset,
    });
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.repo.findById(id);
  }

  async getUnanalyzedProducts(limit = 50): Promise<Product[]> {
    return this.repo.findUnanalyzed(limit);
  }

  async markAnalyzed(id: number): Promise<void> {
    await this.repo.markAsAnalyzed(id);
  }

  async getStats(): Promise<Array<{ source: string; count: number }>> {
    return this.repo.countBySource();
  }
}
