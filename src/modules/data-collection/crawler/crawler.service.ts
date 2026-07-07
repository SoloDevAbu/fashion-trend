import { logger } from '../../../lib/logger';
import type {
  ISourceCrawler,
  CrawlerResult,
  CrawlerStatistics,
  PipelineContext,
  NormalizedProduct,
  ProductSource,
} from './crawler.types';
import type { IPipeline } from '../pipelines/product.pipeline';

export class CrawlerService {
  constructor(
    private readonly crawlers: ISourceCrawler[],
    private readonly pipelines: IPipeline[],
  ) {}

  async runAll(): Promise<CrawlerStatistics> {
    const start = Date.now();

    logger.info({ sources: this.crawlers.map((c) => c.source) }, 'Data collection run started');

    // Run all source crawlers in parallel
    const settled = await Promise.allSettled(this.crawlers.map((c) => this.runOne(c)));

    const results: CrawlerResult[] = settled.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      const source = this.crawlers[i]!.source;
      logger.error({ source, error: String(r.reason) }, 'Source crawler rejected');
      return {
        source,
        products: [],
        startedAt: new Date(),
        completedAt: new Date(),
        errors: [String(r.reason)],
      };
    });

    // Run pipeline chains per source in parallel
    await Promise.allSettled(
      results
        .filter((r) => r.products.length > 0)
        .map((r) =>
          this.executePipelines({
            products:  r.products,
            runId:     `${r.source}-${Date.now()}`,
            source:    r.source,
            startedAt: r.startedAt,
          }),
        ),
    );

    const stats = this.buildStatistics(results, Date.now() - start);
    logger.info(stats, 'Data collection run completed');
    return stats;
  }

  private async runOne(crawler: ISourceCrawler): Promise<CrawlerResult> {
    const startedAt = new Date();
    const errors: string[] = [];
    let products: NormalizedProduct[] = [];

    try {
      logger.info({ source: crawler.source }, 'Starting source crawler');
      products = await crawler.run();
      logger.info({ source: crawler.source, count: products.length }, 'Source crawler finished');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(msg);
      logger.error({ source: crawler.source, error: msg }, 'Source crawler failed');
    }

    return { source: crawler.source, products, startedAt, completedAt: new Date(), errors };
  }

  // Pipelines within a source chain run sequentially (dedupe → image → product)
  private async executePipelines(ctx: PipelineContext): Promise<void> {
    for (const pipeline of this.pipelines) {
      try {
        await pipeline.execute(ctx);
      } catch (err) {
        logger.error(
          { pipeline: pipeline.name, source: ctx.source, error: String(err) },
          'Pipeline execution failed',
        );
      }
    }
  }

  private buildStatistics(results: CrawlerResult[], durationMs: number): CrawlerStatistics {
    const perSource: Partial<Record<ProductSource, { count: number; errors: number }>> = {};
    let totalProducts = 0;
    let totalErrors = 0;

    for (const r of results) {
      perSource[r.source] = { count: r.products.length, errors: r.errors.length };
      totalProducts += r.products.length;
      totalErrors   += r.errors.length;
    }

    return {
      totalSources:  results.length,
      totalProducts,
      totalErrors,
      durationMs,
      perSource,
    };
  }
}
