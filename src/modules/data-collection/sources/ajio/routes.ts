import { createPlaywrightRouter } from 'crawlee';
import type { Page } from 'playwright';
import type { NormalizedProduct } from '../../crawler/crawler.types';
import { AjioParser } from './parser';
import { SELECTORS } from './selectors';
import {
  SCROLL_ITERATIONS,
  SCROLL_DELAY_MS,
  PAGE_LOAD_WAIT_MS,
  MODAL_TIMEOUT_MS,
  PRODUCT_CARD_TIMEOUT_MS,
} from './constants';

const parser = new AjioParser();

export function createAjioRouter(collector: NormalizedProduct[]) {
  const router = createPlaywrightRouter();

  router.addDefaultHandler(async ({ page, log }) => {
    log.info(`Visiting: ${page.url()}`);

    await page.waitForTimeout(PAGE_LOAD_WAIT_MS);
    await dismissModals(page);
    await scrollPage(page);

    await page
      .waitForSelector(SELECTORS.productCard, { timeout: PRODUCT_CARD_TIMEOUT_MS })
      .catch(() => {});

    const rawItems = await page.evaluate((sel) => {
      const cards = document.querySelectorAll(sel.productCard);
      return Array.from(cards).map((card) => {
        const anchor = card.querySelector(sel.productLink) as HTMLAnchorElement | null;
        const img    = card.querySelector(sel.productImage) as HTMLImageElement | null;

        const imageUrl =
          img?.getAttribute('data-lazy-src') ??
          img?.getAttribute('data-src') ??
          (img?.src?.startsWith('data:') ? '' : (img?.src ?? ''));

        return {
          href:     anchor?.href ?? '',
          imageUrl,
          brand:    card.querySelector(sel.brand)?.textContent?.trim()       ?? '',
          name:     card.querySelector(sel.name)?.textContent?.trim()        ?? '',
          price:   (
            card.querySelector(sel.priceStrong) ??
            card.querySelector(sel.price)
          )?.textContent?.trim() ?? '',
        };
      });
    }, SELECTORS);

    const products = parser.parse({
      source:     'ajio',
      pageUrl:    page.url(),
      items:      rawItems,
      capturedAt: new Date(),
    });

    collector.push(...products);
    log.info(`Collected ${products.length} products`);
  });

  return router;
}

async function dismissModals(page: Page): Promise<void> {
  try {
    const btn = page.locator(SELECTORS.modalClose).first();
    if (await btn.isVisible({ timeout: MODAL_TIMEOUT_MS })) {
      await btn.click();
      await page.waitForTimeout(500);
    }
  } catch { /* no modal */ }
}

async function scrollPage(page: Page): Promise<void> {
  for (let i = 0; i < SCROLL_ITERATIONS; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
    await page.waitForTimeout(SCROLL_DELAY_MS);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
