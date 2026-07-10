import { z } from 'zod';
import type { IPipeline } from './dedupe.pipeline';
import type { PipelineContext } from '../crawler/crawler.types';
import { ProductService } from '../../products/product.service';
import { logger } from '../../../lib/logger';

const productSchema = z.object({
  externalId:    z.string().min(1),
  title:         z.string().min(1),
  source:        z.enum(['myntra', 'ajio', 'pinterest']),
  imageUrl:      z.string().url(),
  productUrl:    z.string().url(),
  price:         z.number().positive().optional(),
  currency:      z.string().default('INR'),
  cloudinaryUrl: z.string().optional(),
  rating:        z.number().min(0).max(5).optional(),
  ratingCount:   z.number().int().nonnegative().optional(),
});

export class ProductPipeline implements IPipeline {
  readonly name = 'ProductPipeline';

  constructor(private readonly productService: ProductService) {}

  async execute(ctx: PipelineContext): Promise<void> {
    logger.info({ source: ctx.source, count: ctx.products.length }, 'ProductPipeline started');

    for (const product of ctx.products) {
      const parsed = productSchema.safeParse(product);
      if (!parsed.success) {
        logger.warn({ externalId: product.externalId, errors: parsed.error.flatten() }, 'Invalid product, skipping');
        continue;
      }

      const saved = await this.productService.createProduct({
        title:         parsed.data.title,
        source:        parsed.data.source,
        imageUrl:      parsed.data.imageUrl,
        productUrl:    parsed.data.productUrl,
        cloudinaryUrl: parsed.data.cloudinaryUrl,
        price:         parsed.data.price?.toString(),
        currency:      parsed.data.currency,
        rating:        parsed.data.rating?.toString(),
        ratingCount:   parsed.data.ratingCount,
      });

      if (saved) {
        product.dbId = saved.id;
      }
    }
  }
}
