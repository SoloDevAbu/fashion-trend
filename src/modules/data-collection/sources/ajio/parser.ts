import type { NormalizedProduct, RawPageData } from '../../crawler/crawler.types';
import { BASE_URL } from './constants';

interface AjioRawItem {
  href:     string;
  imageUrl: string;
  brand:    string;
  name:     string;
  price:    string;
}

export class AjioParser {
  parse(raw: RawPageData): NormalizedProduct[] {
    const products: NormalizedProduct[] = [];
    const seen = new Set<string>();

    for (const item of (raw.items as unknown) as AjioRawItem[]) {
      if (!item.href || !item.imageUrl) continue;

      const productUrl = item.href.startsWith('http')
        ? item.href
        : `${BASE_URL}${item.href}`;

      if (seen.has(productUrl)) continue;
      seen.add(productUrl);

      const price = this.parsePrice(item.price);

      products.push({
        externalId: this.extractExternalId(productUrl),
        title:      [item.brand, item.name].filter(Boolean).join(' - ') || 'Product',
        source:     'ajio',
        imageUrl:   item.imageUrl,
        productUrl,
        ...(price !== undefined ? { price } : {}),
        currency:   'INR',
        ...(item.brand ? { brand: item.brand } : {}),
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
    // e.g. /p/ajio/xyz-123 → 'xyz-123'
    return url.split('/').filter(Boolean).pop() ?? url;
  }
}
