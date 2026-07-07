import type { NormalizedProduct, RawPageData } from '../../crawler/crawler.types';
import { BASE_URL, HIGH_RES_SEGMENT, LOW_RES_SEGMENT } from './constants';

interface PinterestRawItem {
  href:     string;
  imageUrl: string;
  altText:  string;
}

export class PinterestParser {
  parse(raw: RawPageData): NormalizedProduct[] {
    const products: NormalizedProduct[] = [];
    const seen = new Set<string>();

    for (const item of raw.items as PinterestRawItem[]) {
      if (!item.imageUrl) continue;

      const imageUrl   = item.imageUrl.includes(LOW_RES_SEGMENT)
        ? item.imageUrl.replace(LOW_RES_SEGMENT, HIGH_RES_SEGMENT)
        : item.imageUrl;

      const productUrl = item.href.startsWith('http')
        ? item.href
        : `${BASE_URL}${item.href}`;

      if (seen.has(imageUrl)) continue;
      seen.add(imageUrl);

      products.push({
        externalId: this.extractExternalId(productUrl),
        title:      item.altText || 'Kurti Design Inspiration',
        source:     'pinterest',
        imageUrl,
        productUrl,
        currency:   'INR',
        scrapedAt:  raw.capturedAt,
      });
    }

    return products;
  }

  private extractExternalId(url: string): string {
    return url.split('/').filter(Boolean).pop() ?? url;
  }
}
