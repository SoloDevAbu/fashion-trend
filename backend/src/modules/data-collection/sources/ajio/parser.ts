import type { NormalizedProduct, RawPageData } from '../../crawler/crawler.types';
import { BASE_URL } from './constants';

interface AjioRawItem {
  href:        string;
  imageUrl:    string;
  brand:       string;
  name:        string;
  price:       string;
  ratingValue: string;
  ratingCount: string;
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

      const price       = this.parsePrice(item.price);
      const rating      = this.parseRating(item.ratingValue);
      const ratingCount = this.parseRatingCount(item.ratingCount);

      products.push({
        externalId: this.extractExternalId(productUrl),
        title:      ([item.brand, item.name].filter(Boolean).join(' - ') || 'Product').slice(0, 500),
        source:     'ajio',
        imageUrl:   item.imageUrl,
        productUrl,
        ...(price       !== undefined ? { price }       : {}),
        ...(rating      !== undefined ? { rating }      : {}),
        ...(ratingCount !== undefined ? { ratingCount } : {}),
        currency:   'INR',
        ...(item.brand ? { brand: item.brand } : {}),
        scrapedAt:  raw.capturedAt,
      });
    }

    return products;
  }

  private parsePrice(raw: string): number | undefined {
    const text = raw.trim();
    if (!text) return undefined;

    const kMatch = text.match(/([\d.]+)k/i);
    if (kMatch) {
      const n = Math.round(parseFloat(kMatch[1]!) * 1000);
      return n > 0 ? n : undefined;
    }

    const n = parseFloat(text.replace(/[^\d.]/g, ''));
    if (isNaN(n) || n <= 0 || n < 10) return undefined;

    return n;
  }

  private parseRating(raw: string): number | undefined {
    const n = parseFloat(raw.trim());
    return isNaN(n) || n < 0 || n > 5 ? undefined : n;
  }

  private parseRatingCount(raw: string): number | undefined {
    const cleaned = raw.replace(/[|\s,]/g, '');
    if (!cleaned) return undefined;

    const kMatch = cleaned.match(/^([\d.]+)k$/i);
    if (kMatch) return Math.round(parseFloat(kMatch[1]!) * 1000);

    const n = parseInt(cleaned, 10);
    return isNaN(n) ? undefined : n;
  }

  private extractExternalId(url: string): string {
    return url.split('/').filter(Boolean).pop() ?? url;
  }
}
