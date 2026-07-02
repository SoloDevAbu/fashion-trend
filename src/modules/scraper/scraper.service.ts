import path from "path";
import fs from "fs/promises";
import axios from "axios";
import { logger } from "../../lib/logger";
import { MyntraScraper } from "./sources/myntra.scraper";
import { AjioScraper } from "./sources/ajio.scraper";
import { PinterestScraper } from "./sources/pinterest.scraper";
import type {
  ProductScraper,
  ScrapedProduct,
  ScraperResult,
} from "./scraper.types";
import { ProductService } from "../products/product.service";

const STORAGE_PATH = process.env.STORAGE_PATH ?? "./storage/images";

export class ScraperService {
  private readonly scrapers: ProductScraper[];
  private readonly productService: ProductService;

  constructor() {
    this.scrapers = [
      new MyntraScraper(),
      new AjioScraper(),
      new PinterestScraper(),
    ];
    this.productService = new ProductService();
  }

  async runAll(): Promise<ScraperResult[]> {
    logger.info("Starting scrape run across all sources");
    const results: ScraperResult[] = [];

    for (const scraper of this.scrapers) {
      const result = await this.runScraper(scraper);
      results.push(result);
    }

    const totalProducts = results.reduce(
      (sum, r) => sum + r.products.length,
      0,
    );
    logger.info({ totalProducts }, "All scrapers completed");

    return results;
  }

  private async runScraper(scraper: ProductScraper): Promise<ScraperResult> {
    const errors: string[] = [];
    let products: ScrapedProduct[] = [];

    try {
      products = await scraper.scrape();

      // Save products to DB and download images
      for (const product of products) {
        try {
          const localImagePath = await this.downloadImage(
            product.imageUrl,
            product.source,
          );
          const priceStr = product.price?.toString();
          await this.productService.createProduct({
            title: product.title,
            source: product.source,
            imageUrl: product.imageUrl,
            productUrl: product.productUrl,
            localImagePath,
            currency: product.currency ?? "INR",
            ...(priceStr !== undefined ? { price: priceStr } : {}),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Failed to save product "${product.title}": ${msg}`);
          logger.warn(
            { product: product.title, error: msg },
            "Product save failed",
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Scraper error: ${msg}`);
      logger.error(
        { source: scraper.sourceName, error: msg },
        "Scraper run failed",
      );
    }

    return {
      source: scraper.sourceName,
      products,
      scrapedAt: new Date(),
      errors,
    };
  }

  private async downloadImage(
    imageUrl: string,
    source: string,
  ): Promise<string> {
    const dir = path.join(STORAGE_PATH);
    await fs.mkdir(dir, { recursive: true });

    const ext = this.getExtension(imageUrl);
    const filename = `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filePath = path.join(dir, filename);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Referer: this.getReferer(source),
      },
    });

    await fs.writeFile(filePath, response.data);
    return filePath;
  }

  private getExtension(url: string): string {
    const match = (url.split("?")[0] ?? "").match(/\.(jpg|jpeg|png|webp)$/i);
    return match ? `.${match[1]!.toLowerCase()}` : ".jpg";
  }

  private getReferer(source: string): string {
    const referers: Record<string, string> = {
      myntra: "https://www.myntra.com",
      ajio: "https://www.ajio.com",
      pinterest: "https://in.pinterest.com",
    };
    return referers[source] ?? "https://www.google.com";
  }
}
