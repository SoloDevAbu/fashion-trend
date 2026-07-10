import { createPlaywrightRouter } from 'crawlee';
import type { Page } from 'playwright';
import type { NormalizedProduct } from '../../crawler/crawler.types';
import { PinterestParser } from './parser';
import { SELECTORS } from './selectors';
import { SCROLL_ITERATIONS, SCROLL_DELAY_MS, PAGE_LOAD_WAIT_MS, MODAL_TIMEOUT_MS } from './constants';

const parser = new PinterestParser();

export function createPinterestRouter(collector: NormalizedProduct[]) {
  const router = createPlaywrightRouter();

  router.addDefaultHandler(async ({ page, log }) => {
    log.info(`Visiting: ${page.url()}`);

    await page.waitForTimeout(PAGE_LOAD_WAIT_MS);
    await dismissModals(page);
    await scrollPage(page);

    const rawItems = await page.evaluate((sel) => {
      const pins = document.querySelectorAll(sel.pin);
      return Array.from(pins).map((pin) => {
        const anchor = pin.querySelector(sel.pinLink) as HTMLAnchorElement | null;
        const img    = pin.querySelector(sel.pinImage) as HTMLImageElement | null;

        return {
          href:     anchor?.href ?? '',
          imageUrl: img?.src ?? '',
          altText:  img?.alt ?? '',
        };
      });
    }, SELECTORS);

    const products = parser.parse({
      source:     'pinterest',
      pageUrl:    page.url(),
      items:      rawItems,
      capturedAt: new Date(),
    });

    collector.push(...products);
    log.info(`Collected ${products.length} pins`);
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
