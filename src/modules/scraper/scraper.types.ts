export interface ScrapedProduct {
  title: string;
  source: "myntra" | "ajio" | "pinterest";
  imageUrl: string;
  productUrl: string;
  price?: number;
  currency?: string;
}

export interface ProductScraper {
  readonly sourceName: string;
  scrape(): Promise<ScrapedProduct[]>;
}

export interface ScraperResult {
  source: string;
  products: ScrapedProduct[];
  scrapedAt: Date;
  errors: string[];
}
