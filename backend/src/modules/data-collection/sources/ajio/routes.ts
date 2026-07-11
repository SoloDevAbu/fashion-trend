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
import { logger } from '../../../../lib/logger';

const parser = new AjioParser();

const AJIO_CDN_PATTERN = /assets[^.]*\.ajio\.com/;

export function createAjioRouter(collector: NormalizedProduct[]) {
  const router = createPlaywrightRouter();

  router.addDefaultHandler(async ({ page, log }) => {
    log.info(`Visiting: ${page.url()}`);

    const capturedImages = new Map<string, Buffer>();

    // Intercept all image requests via page.route().
    // route.fetch() sends the request THROUGH the browser (preserving Akamai
    // session cookies + TLS fingerprint), so CDN bot-detection is bypassed.
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      const resourceType = route.request().resourceType();

      if (resourceType === 'image' && AJIO_CDN_PATTERN.test(url)) {
        try {
          const response = await route.fetch();
          const body     = await response.body();
          if (body.length > 0) {
            capturedImages.set(url.split('?')[0]!, Buffer.from(body));
          }
          await route.fulfill({ response, body });
        } catch {
          await route.continue();
        }
      } else {
        await route.continue();
      }
    });

    await page.waitForTimeout(PAGE_LOAD_WAIT_MS);
    await dismissModals(page);
    await scrollPage(page);

    // Brief pause after last scroll for lazy images to complete loading
    await page.waitForTimeout(1000);

    await page.unroute('**/*');

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
          href:        anchor?.href ?? '',
          imageUrl,
          brand:       card.querySelector(sel.brand)?.textContent?.trim()        ?? '',
          name:        card.querySelector(sel.name)?.textContent?.trim()         ?? '',
          price:      (
            card.querySelector(sel.priceStrong) ??
            card.querySelector(sel.price)
          )?.textContent?.trim() ?? '',
          ratingValue: (card.querySelector(sel.ratingValue) as HTMLElement | null)?.textContent?.trim() ?? '',
          ratingCount: (card.querySelector(sel.ratingCountEl) as HTMLElement | null)?.textContent?.trim() ?? '',
        };
      });
    }, SELECTORS);

    const products = parser.parse({
      source:     'ajio',
      pageUrl:    page.url(),
      items:      rawItems,
      capturedAt: new Date(),
    });

    // Attach intercepted image buffers to their matching products
    let hits = 0;
    for (const product of products) {
      if (!product.imageUrl) continue;
      const key = product.imageUrl.split('?')[0]!;
      const buf = capturedImages.get(key);
      if (buf) {
        product.imageBuffer = buf;
        hits++;
      }
    }

    logger.info(
      { total: products.length, withBuffer: hits, cached: capturedImages.size },
      'Ajio image capture summary',
    );

    collector.push(...products);
    log.info(`Collected ${products.length} products (${hits}/${products.length} images captured)`);
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
