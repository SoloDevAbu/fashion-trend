import { PlaywrightCrawler, createPlaywrightRouter, Configuration } from 'crawlee';
import type { CrawlerConfig } from './crawler.types';

export type PlaywrightRouter = ReturnType<typeof createPlaywrightRouter>;

export class CrawlerFactory {
  static create(config: CrawlerConfig, router: PlaywrightRouter): PlaywrightCrawler {
    const crawleeConfig = new Configuration({
      storageClientOptions: { localDataDirectory: config.storageDir },
    });

    return new PlaywrightCrawler(
      {
        navigationTimeoutSecs:     config.navigationTimeoutSecs,
        requestHandlerTimeoutSecs: config.requestHandlerTimeoutSecs,
        maxRequestsPerCrawl:       config.maxRequestsPerCrawl,
        maxConcurrency:            config.maxConcurrency,
        maxRequestRetries:         config.maxRetries,
        useSessionPool:            config.useSessionPool,
        persistCookiesPerSession:  config.useSessionPool,

        launchContext: {
          launchOptions: {
            headless: config.headless,
            args: [
              '--no-sandbox',
              '--disable-dev-shm-usage',
              '--disable-blink-features=AutomationControlled',
            ],
          },
        },

        requestHandler: router,

        failedRequestHandler({ request, log }, error) {
          log.error(`Request ${request.url} failed after retries: ${error.message}`);
        },
      },
      crawleeConfig,
    );
  }
}
