import { Page } from "playwright";
import { createContext } from "../../../lib/playwright";
import { logger } from "../../../lib/logger";
import type { ProductScraper, ScrapedProduct } from "../scraper.types";

const AJIO_KURTI_URL =
  "https://www.ajio.com/s/kurtis-and-kurtas-for-women?originalquery=kurtis&query=kurtis&rows=45&start=0&pagetype=search";

const SCROLL_ITERATIONS = 6;
const SCROLL_DELAY_MS = 2500;
const TIMEOUT_MS = parseInt(process.env.SCRAPE_TIMEOUT_MS ?? "30000");

export class AjioScraper implements ProductScraper {
  readonly sourceName = "ajio";

  async scrape(): Promise<ScrapedProduct[]> {
    const context = await createContext();
    const page = await context.newPage();
    const products: ScrapedProduct[] = [];

    try {
      logger.info({ source: "ajio" }, "Starting Ajio scrape");

      await page.goto(AJIO_KURTI_URL, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT_MS,
      });
      await page.waitForTimeout(4000);

      await this.dismissModals(page);
      await this.scrollPage(page);

      // Wait for product cards to load
      await page
        .waitForSelector(".item.rilrtl-products-list__item", { timeout: 10000 })
        .catch(() => {});

      const rawProducts = await page.evaluate(() => {
        const cards = document.querySelectorAll(
          ".item.rilrtl-products-list__item",
        );
        return Array.from(cards).map((card) => {
          const anchor = card.querySelector(
            "a.rilrtl-products-list__link",
          ) as HTMLAnchorElement | null;
          const img = card.querySelector("img") as HTMLImageElement | null;
          const brandEl = card.querySelector(".brand");
          const nameEl = card.querySelector(".nameCls");
          const priceEl =
            card.querySelector(".price strong") ?? card.querySelector(".price");

          return {
            href: anchor?.href ?? "",
            imageUrl: img?.src ?? img?.getAttribute("data-src") ?? "",
            brand: brandEl?.textContent?.trim() ?? "",
            name: nameEl?.textContent?.trim() ?? "",
            price: priceEl?.textContent?.trim() ?? "",
          };
        });
      });

      for (const raw of rawProducts) {
        if (!raw.href || !raw.imageUrl) continue;

        const price = this.parsePrice(raw.price);
        products.push({
          title: [raw.brand, raw.name].filter(Boolean).join(" - ") || "Kurti",
          source: "ajio",
          imageUrl: raw.imageUrl,
          productUrl: raw.href.startsWith("http")
            ? raw.href
            : `https://www.ajio.com${raw.href}`,
          ...(price !== undefined ? { price } : {}),
          currency: "INR",
        });
      }

      logger.info(
        { source: "ajio", count: products.length },
        "Ajio scrape completed",
      );
    } catch (error) {
      logger.error({ source: "ajio", error }, "Ajio scrape failed");
    } finally {
      await context.close();
    }

    return products;
  }

  private async dismissModals(page: Page): Promise<void> {
    try {
      const closeBtn = page
        .locator('.popup-wrapper .close-btn, button[aria-label="Close"]')
        .first();
      if (await closeBtn.isVisible({ timeout: 3000 })) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // No modal
    }
  }

  private async scrollPage(page: Page): Promise<void> {
    for (let i = 0; i < SCROLL_ITERATIONS; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(SCROLL_DELAY_MS);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }

  private parsePrice(priceStr: string): number | undefined {
    const match = priceStr.replace(/[^\d.]/g, "");
    const parsed = parseFloat(match);
    return isNaN(parsed) ? undefined : parsed;
  }
}
