import { CrawlerService }          from './crawler/crawler.service';
import { ScrapeScheduler }         from './scheduler/scrape.scheduler';
import { MyntraCrawler }           from './sources/myntra/crawler';
import { AjioCrawler }             from './sources/ajio/crawler';
import { PinterestCrawler }        from './sources/pinterest/crawler';
import { DedupePipeline }          from './pipelines/dedupe.pipeline';
import { ImagePipeline }           from './pipelines/image.pipeline';
import { ProductPipeline }         from './pipelines/product.pipeline';
import { TrendingPipeline }        from './pipelines/trending.pipeline';
import { AxiosDownloadService }    from './storage/download.service';
import { CloudinaryImageStorage }  from './storage/cloudinary.storage';
import { ProductService }          from '../products/product.service';
import { TrendingService }         from '../trending/trending.service';

const downloader     = new AxiosDownloadService();
const imageStorage   = new CloudinaryImageStorage();
const productService = new ProductService();
const trendingService = new TrendingService();

const crawlers = [
  new MyntraCrawler(),
  new AjioCrawler(),
  new PinterestCrawler(),
];

// Pipeline order matters: dedupe → upload image → persist product → compute top-10
const pipelines = [
  new DedupePipeline(),
  new ImagePipeline(downloader, imageStorage),
  new ProductPipeline(productService),
  new TrendingPipeline(trendingService),
];

export const crawlerService  = new CrawlerService(crawlers, pipelines);
export const scrapeScheduler = new ScrapeScheduler(crawlerService);

export type { NormalizedProduct, CrawlerStatistics, ISourceCrawler } from './crawler/crawler.types';
export type { IPipeline }        from './pipelines/dedupe.pipeline';
export type { IImageStorage }    from './storage/image.storage';
export type { IDownloadService } from './storage/download.service';
