import type { IPipeline } from './dedupe.pipeline';
import type { PipelineContext, ProductSource } from '../crawler/crawler.types';
import type { TrendingService } from '../../trending/trending.service';
import { logger } from '../../../lib/logger';

const SUPPORTED_SOURCES: ProductSource[] = ['myntra', 'ajio'];

export class TrendingPipeline implements IPipeline {
  readonly name = 'TrendingPipeline';

  constructor(private readonly trendingService: TrendingService) {}

  async execute(ctx: PipelineContext): Promise<void> {
    if (!SUPPORTED_SOURCES.includes(ctx.source)) return;

    const withRatings = ctx.products.filter(
      (p) => p.rating !== undefined && p.ratingCount !== undefined && p.ratingCount > 0 && p.dbId !== undefined,
    );

    if (withRatings.length === 0) {
      logger.info(
        { source: ctx.source },
        'TrendingPipeline: no rated products in run — falling back to DB',
      );
      // Try computing Top 10 from historically rated products already in the DB
      await this.trendingService.computeAndSaveFromDB(ctx.runId, ctx.source);
      return;
    }

    const scored = withRatings.map((p) => ({
      productId:   p.dbId!,
      productUrl:  p.productUrl,
      source:      p.source,
      rating:      p.rating!,
      ratingCount: p.ratingCount!,
      score:       p.rating! * Math.log10(p.ratingCount! + 1),
    }));

    scored.sort((a, b) => b.score - a.score);
    const top10 = scored.slice(0, 10);

    await this.trendingService.saveTop10(ctx.runId, ctx.source, top10.map((s, i) => ({
      rank:        i + 1,
      productId:   s.productId,
      source:      s.source,
      score:       s.score,
      rating:      s.rating,
      ratingCount: s.ratingCount,
    })));

    logger.info({ source: ctx.source, count: top10.length }, 'TrendingPipeline: top products saved');
  }
}
