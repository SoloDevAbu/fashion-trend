import type { NormalizedProduct, RawPageData } from '../../crawler/crawler.types';
import { BASE_URL } from './constants';

interface MyntraRawItem {
  href:     string;
  imageUrl: string;
  brand:    string;
  title:    string;
  price:    string;
}

export class MyntraParser {
  parse(raw: RawPageData): NormalizedProduct[] {
    const products: NormalizedProduct[] = [];
    const seen = new Set<string>();

    for (const item of raw.items as MyntraRawItem[]) {
      if (!item.href || !item.imageUrl) continue;

      const productUrl = item.href.startsWith('http')
        ? item.href
        : `${BASE_URL}${item.href}`;

      if (seen.has(productUrl)) continue;
      seen.add(productUrl);

      const price = this.parsePrice(item.price);

      products.push({
        externalId: this.extractExternalId(productUrl),
        title:      [item.brand, item.title].filter(Boolean).join(' - ') || 'Product',
        source:     'myntra',
        imageUrl:   item.imageUrl,
        productUrl,
        ...(price !== undefined ? { price } : {}),
        currency:   'INR',
        brand:      item.brand || undefined,
        scrapedAt:  raw.capturedAt,
      });
    }

    return products;
  }

  private parsePrice(raw: string): number | undefined {
    const n = parseFloat(raw.replace(/[^\d.]/g, ''));
    return isNaN(n) ? undefined : n;
  }

  private extractExternalId(url: string): string {
    return url.match(/\/(\d+)\/buy/)?.[1] ?? url;
  }
}
