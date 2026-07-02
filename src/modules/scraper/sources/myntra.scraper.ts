import { Page } from "playwright";
import { createContext } from "../../../lib/playwright";
import { logger } from "../../../lib/logger";
import type { ProductScraper, ScrapedProduct } from "../scraper.types";

const MYNTRA_KURTI_URL =
  "https://www.myntra.com/kurtis?rawQuery=kurtis&sort=popularity&f=Availability%3AIn%20Stock";

const SCROLL_ITERATIONS = 5;
const SCROLL_DELAY_MS = 2000;
const TIMEOUT_MS = parseInt(process.env.SCRAPE_TIMEOUT_MS ?? "30000");

export class MyntraScraper implements ProductScraper {
  readonly sourceName = "myntra";

  async scrape(): Promise<ScrapedProduct[]> {
    const context = await createContext();
    const page = await context.newPage();
    const products: ScrapedProduct[] = [];

    try {
      logger.info({ source: "myntra" }, "Starting Myntra scrape");

      await page.goto(MYNTRA_KURTI_URL, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT_MS,
      });
      await page.waitForTimeout(3000);

      // Handle cookie/location modals
      await this.dismissModals(page);

      // Scroll to load more products
      await this.scrollPage(page);

      // Extract product cards
      const rawProducts = await page.evaluate(() => {
        const cards = document.querySelectorAll("li.product-base");
        return Array.from(cards).map((card) => {
          const anchor = card.querySelector("a") as HTMLAnchorElement | null;
          const img = card.querySelector(
            "img.img-responsive",
          ) as HTMLImageElement | null;
          const brand = card
            .querySelector(".product-brand")
            ?.textContent?.trim();
          const title = card
            .querySelector(".product-product")
            ?.textContent?.trim();
          const price =
            card
              .querySelector(".product-discountedPrice")
              ?.textContent?.trim() ??
            card.querySelector(".product-price")?.textContent?.trim();

          return {
            href: anchor?.href ?? "",
            imageUrl: img?.src ?? img?.getAttribute("data-src") ?? "",
            brand: brand ?? "",
            title: title ?? "",
            price: price ?? "",
          };
        });
      });

      for (const raw of rawProducts) {
        if (!raw.href || !raw.imageUrl) continue;

        const price = this.parsePrice(raw.price);
        products.push({
          title: [raw.brand, raw.title].filter(Boolean).join(" - ") || "Kurti",
          source: "myntra",
          imageUrl: raw.imageUrl,
          productUrl: raw.href.startsWith("http")
            ? raw.href
            : `https://www.myntra.com${raw.href}`,
          ...(price !== undefined ? { price } : {}),
          currency: "INR",
        });
      }

      logger.info(
        { source: "myntra", count: products.length },
        "Myntra scrape completed",
      );
    } catch (error) {
      logger.error({ source: "myntra", error }, "Myntra scrape failed");
    } finally {
      await context.close();
    }

    return products;
  }

  private async dismissModals(page: Page): Promise<void> {
    try {
      // Close location modal if present
      const closeBtn = page.locator("span.myntraweb-sprite.modal-closeBtn");
      if (await closeBtn.isVisible({ timeout: 2000 })) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Modal not present, continue
    }
  }

  private async scrollPage(page: Page): Promise<void> {
    for (let i = 0; i < SCROLL_ITERATIONS; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(SCROLL_DELAY_MS);
    }
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  private parsePrice(priceStr: string): number | undefined {
    const match = priceStr.replace(/[^\d.]/g, "");
    const parsed = parseFloat(match);
    return isNaN(parsed) ? undefined : parsed;
  }
}
