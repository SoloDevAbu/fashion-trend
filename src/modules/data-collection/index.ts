import { CrawlerService }       from './crawler/crawler.service';
import { ScrapeScheduler }      from './scheduler/scrape.scheduler';
import { MyntraCrawler }        from './sources/myntra/crawler';
import { AjioCrawler }          from './sources/ajio/crawler';
import { PinterestCrawler }     from './sources/pinterest/crawler';
import { DedupePipeline }       from './pipelines/dedupe.pipeline';
import { ImagePipeline }        from './pipelines/image.pipeline';
import { ProductPipeline }      from './pipelines/product.pipeline';
import { AxiosDownloadService } from './storage/download.service';
import { LocalImageStorage }    from './storage/image.storage';
import { ProductService }       from '../products/product.service';

const downloader     = new AxiosDownloadService();
const imageStorage   = new LocalImageStorage();
const productService = new ProductService();

const crawlers = [
  new MyntraCrawler(),
  new AjioCrawler(),
  new PinterestCrawler(),
];

// Pipeline order matters: dedupe → image download → persist
const pipelines = [
  new DedupePipeline(),
  new ImagePipeline(downloader, imageStorage),
  new ProductPipeline(productService),
];

export const crawlerService  = new CrawlerService(crawlers, pipelines);
export const scrapeScheduler = new ScrapeScheduler(crawlerService);

export type { NormalizedProduct, CrawlerStatistics, ISourceCrawler } from './crawler/crawler.types';
export type { IPipeline }        from './pipelines/dedupe.pipeline';
export type { IImageStorage }    from './storage/image.storage';
export type { IDownloadService } from './storage/download.service';
