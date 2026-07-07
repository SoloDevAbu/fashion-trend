import { logger } from '../../../../lib/logger';
import type { ISourceCrawler, NormalizedProduct } from '../../crawler/crawler.types';
import { CrawlerFactory } from '../../crawler/crawler.factory';
import { buildConfig } from '../../crawler/crawler.config';
import { createAjioRouter } from './routes';
import { CATEGORY_URLS } from './constants';

export class AjioCrawler implements ISourceCrawler {
  readonly source = 'ajio' as const;

  async run(): Promise<NormalizedProduct[]> {
    const collected: NormalizedProduct[] = [];
    const startUrls = Object.values(CATEGORY_URLS);
    const config = buildConfig('ajio', startUrls);
    const router  = createAjioRouter(collected);
    const crawler = CrawlerFactory.create(config, router);

    try {
      await crawler.run(startUrls);
    } catch (err) {
      logger.error({ source: this.source, error: String(err) }, 'Crawler run error');
    } finally {
      await crawler.teardown();
    }

    logger.info({ source: this.source, count: collected.length }, 'AjioCrawler finished');
    return collected;
  }
}
