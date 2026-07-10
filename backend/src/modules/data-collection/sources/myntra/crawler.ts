import { logger } from '../../../../lib/logger';
import type { ISourceCrawler, NormalizedProduct } from '../../crawler/crawler.types';
import { CrawlerFactory } from '../../crawler/crawler.factory';
import { buildConfig } from '../../crawler/crawler.config';
import { createMyntraRouter } from './routes';
import { CATEGORY_URLS } from './constants';

export class MyntraCrawler implements ISourceCrawler {
  readonly source = 'myntra' as const;

  async run(): Promise<NormalizedProduct[]> {
    const collected: NormalizedProduct[] = [];
    const startUrls = Object.values(CATEGORY_URLS);
    const config = buildConfig('myntra', startUrls);
    const router  = createMyntraRouter(collected);
    const crawler = CrawlerFactory.create(config, router);

    try {
      await crawler.run(startUrls);
    } catch (err) {
      logger.error({ source: this.source, error: String(err) }, 'Crawler run error');
    } finally {
      await crawler.teardown();
    }

    logger.info({ source: this.source, count: collected.length }, 'MyntraCrawler finished');
    return collected;
  }
}
