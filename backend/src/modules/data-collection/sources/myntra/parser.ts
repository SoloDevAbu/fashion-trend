import type { NormalizedProduct, RawPageData } from '../../crawler/crawler.types';
import { BASE_URL } from './constants';

interface MyntraRawItem {
  href:        string;
  imageUrl:    string;
  brand:       string;
  title:       string;
  price:       string;
  ratingValue: string;
  ratingCount: string;
}

export class MyntraParser {
  parse(raw: RawPageData): NormalizedProduct[] {
    const products: NormalizedProduct[] = [];
    const seen = new Set<string>();

    for (const item of (raw.items as unknown) as MyntraRawItem[]) {
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
        title:      ([item.brand, item.title].filter(Boolean).join(' - ') || 'Product').slice(0, 500),
        source:     'myntra',
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

    // Handle k-suffixed prices: "1.2k" → 1200, "0.44k" → 440
    const kMatch = text.match(/([\d.]+)k/i);
    if (kMatch) {
      const n = Math.round(parseFloat(kMatch[1]!) * 1000);
      return n > 0 ? n : undefined;
    }

    const n = parseFloat(text.replace(/[^\d.]/g, ''));
    if (isNaN(n) || n <= 0) return undefined;

    // Sanity check: discard suspiciously small values that are likely
    // discount percentages (e.g. "44% OFF" → 44) misidentified as prices.
    // Real INR prices are never less than ₹10.
    if (n < 10) return undefined;

    return n;
  }

  private parseRating(raw: string): number | undefined {
    const n = parseFloat(raw.trim());
    return isNaN(n) || n < 0 || n > 5 ? undefined : n;
  }

  private parseRatingCount(raw: string): number | undefined {
    // Strip separator characters: "| 1.7k" → "1.7k"
    const cleaned = raw.replace(/[|\s,]/g, '');
    if (!cleaned) return undefined;

    const kMatch = cleaned.match(/^([\d.]+)k$/i);
    if (kMatch) return Math.round(parseFloat(kMatch[1]!) * 1000);

    const n = parseInt(cleaned, 10);
    return isNaN(n) ? undefined : n;
  }

  private extractExternalId(url: string): string {
    return url.match(/\/(\d+)\/buy/)?.[1] ?? url;
  }
}
