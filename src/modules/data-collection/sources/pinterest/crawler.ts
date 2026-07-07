import { logger } from '../../../../lib/logger';
import type { ISourceCrawler, NormalizedProduct } from '../../crawler/crawler.types';
import { CrawlerFactory } from '../../crawler/crawler.factory';
import { buildConfig } from '../../crawler/crawler.config';
import { createPinterestRouter } from './routes';
import { SEARCH_URLS } from './constants';

export class PinterestCrawler implements ISourceCrawler {
  readonly source = 'pinterest' as const;

  async run(): Promise<NormalizedProduct[]> {
    const collected: NormalizedProduct[] = [];
    const startUrls = Object.values(SEARCH_URLS);
    const config = buildConfig('pinterest', startUrls);
    const router  = createPinterestRouter(collected);
    const crawler = CrawlerFactory.create(config, router);

    try {
      await crawler.run(startUrls);
    } catch (err) {
      logger.error({ source: this.source, error: String(err) }, 'Crawler run error');
    } finally {
      await crawler.teardown();
    }

    logger.info({ source: this.source, count: collected.length }, 'PinterestCrawler finished');
    return collected;
  }
}
