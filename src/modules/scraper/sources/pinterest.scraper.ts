import { createContext } from "../../../lib/playwright";
import { logger } from "../../../lib/logger";
import type { ProductScraper, ScrapedProduct } from "../scraper.types";

const PINTEREST_SEARCH_URL =
  "https://in.pinterest.com/search/pins/?q=kurti%20designs%202025&rs=typed";

const SCROLL_ITERATIONS = 8;
const SCROLL_DELAY_MS = 2000;
const TIMEOUT_MS = parseInt(process.env.SCRAPE_TIMEOUT_MS ?? "30000");

export class PinterestScraper implements ProductScraper {
  readonly sourceName = "pinterest";

  async scrape(): Promise<ScrapedProduct[]> {
    const context = await createContext();
    const page = await context.newPage();
    const products: ScrapedProduct[] = [];

    try {
      logger.info({ source: "pinterest" }, "Starting Pinterest scrape");

      await page.goto(PINTEREST_SEARCH_URL, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT_MS,
      });
      await page.waitForTimeout(3000);

      // Pinterest requires login for some content — work with what's public
      await this.dismissModals(page);
      await this.scrollPage(page);

      const rawPins = await page.evaluate(() => {
        // Pinterest renders pins as divs with data-test-id
        const pins = document.querySelectorAll('[data-test-id="pin"]');
        return Array.from(pins).map((pin) => {
          const anchor = pin.querySelector("a") as HTMLAnchorElement | null;
          const img = pin.querySelector("img") as HTMLImageElement | null;
          const altText = img?.alt ?? "";

          // Pinterest uses high-res image URLs — upgrade if possible
          let imageUrl = img?.src ?? "";
          if (imageUrl.includes("/236x/")) {
            imageUrl = imageUrl.replace("/236x/", "/736x/");
          }

          return {
            href: anchor?.href ?? "",
            imageUrl,
            altText,
          };
        });
      });

      for (const raw of rawPins) {
        if (!raw.imageUrl) continue;

        products.push({
          title: raw.altText || "Kurti Design Inspiration",
          source: "pinterest",
          imageUrl: raw.imageUrl,
          productUrl: raw.href.startsWith("http")
            ? raw.href
            : `https://in.pinterest.com${raw.href}`,
          currency: "INR",
        });
      }

      logger.info(
        { source: "pinterest", count: products.length },
        "Pinterest scrape completed",
      );
    } catch (error) {
      logger.error({ source: "pinterest", error }, "Pinterest scrape failed");
    } finally {
      await context.close();
    }

    return products;
  }

  private async dismissModals(page: import("playwright").Page): Promise<void> {
    try {
      // Pinterest login modal
      const closeBtn = page
        .locator(
          '[data-test-id="closeup-close-button"], button[aria-label="Close"]',
        )
        .first();
      if (await closeBtn.isVisible({ timeout: 3000 })) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // No modal
    }
  }

  private async scrollPage(page: import("playwright").Page): Promise<void> {
    for (let i = 0; i < SCROLL_ITERATIONS; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(SCROLL_DELAY_MS);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}
