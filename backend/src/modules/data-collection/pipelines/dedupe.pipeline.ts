import type { PipelineContext } from '../crawler/crawler.types';
import { logger } from '../../../lib/logger';

export interface IPipeline {
  readonly name: string;
  execute(ctx: PipelineContext): Promise<void>;
}

export class DedupePipeline implements IPipeline {
  readonly name = 'DedupePipeline';

  async execute(ctx: PipelineContext): Promise<void> {
    const before = ctx.products.length;
    const seen   = new Set<string>();

    ctx.products = ctx.products.filter((p) => {
      if (seen.has(p.productUrl)) return false;
      seen.add(p.productUrl);
      return true;
    });

    const removed = before - ctx.products.length;
    if (removed > 0) {
      logger.info({ source: ctx.source, removed }, 'DedupePipeline removed duplicates');
    }
  }
}
