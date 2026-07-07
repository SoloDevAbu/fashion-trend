import type { CrawlerConfig, ProductSource } from './crawler.types';

export const defaultCrawlerConfig: Omit<CrawlerConfig, 'source' | 'startUrls'> = {
  maxRequestsPerCrawl:       parseInt(process.env['MAX_REQUESTS_PER_CRAWL'] ?? '100'),
  maxConcurrency:            parseInt(process.env['CRAWLER_CONCURRENCY']    ?? '2'),
  navigationTimeoutSecs:     parseInt(process.env['NAV_TIMEOUT_SECS']       ?? '60'),
  requestHandlerTimeoutSecs: parseInt(process.env['HANDLER_TIMEOUT_SECS']   ?? '120'),
  maxRetries:                parseInt(process.env['MAX_RETRIES']             ?? '3'),
  useSessionPool:            process.env['USE_SESSION_POOL'] === 'true',
  headless:                  process.env['CRAWLER_HEADLESS'] !== 'false',
};

export function buildConfig(
  source: ProductSource,
  startUrls: string[],
  overrides: Partial<Omit<CrawlerConfig, 'source' | 'startUrls'>> = {},
): CrawlerConfig {
  return {
    source,
    startUrls,
    ...defaultCrawlerConfig,
    ...overrides,
  };
}
