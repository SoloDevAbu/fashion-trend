export type ProductSource = 'myntra' | 'ajio' | 'pinterest';

export interface NormalizedProduct {
  externalId:    string;
  title:         string;
  source:        ProductSource;
  imageUrl:      string;
  productUrl:    string;
  price?:        number;
  currency:      string;
  brand?:        string;
  category?:     string;
  imageHash?:    string;
  cloudinaryUrl?: string;
  rating?:       number;
  ratingCount?:  number;
  dbId?:         number;
  scrapedAt:     Date;
}

export interface RawPageData {
  source: ProductSource;
  pageUrl: string;
  items: Record<string, unknown>[];
  capturedAt: Date;
}

export interface ISourceCrawler {
  readonly source: ProductSource;
  run(): Promise<NormalizedProduct[]>;
}

export interface CrawlerResult {
  source: ProductSource;
  products: NormalizedProduct[];
  startedAt: Date;
  completedAt: Date;
  errors: string[];
}

export interface CrawlerStatistics {
  totalSources: number;
  totalProducts: number;
  totalErrors: number;
  durationMs: number;
  perSource: Partial<Record<ProductSource, { count: number; errors: number }>>;
}

export interface CrawlerConfig {
  source: ProductSource;
  startUrls: string[];
  maxRequestsPerCrawl: number;
  maxConcurrency: number;
  navigationTimeoutSecs: number;
  requestHandlerTimeoutSecs: number;
  maxRetries: number;
  useSessionPool: boolean;
  headless: boolean;
  storageDir: string;
}

export interface PipelineContext {
  products: NormalizedProduct[];
  runId: string;
  source: ProductSource;
  startedAt: Date;
}
