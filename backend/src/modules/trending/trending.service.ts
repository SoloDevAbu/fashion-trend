import type { ProductSource } from '../data-collection/crawler/crawler.types';
import { TrendingRepository } from './trending.repository';
import { ProductRepository } from '../products/product.repository';
import { logger } from '../../lib/logger';

interface Top10Item {
  rank:        number;
  productId:   number;
  source:      ProductSource;
  score:       number;
  rating:      number;
  ratingCount: number;
}

export class TrendingService {
  private readonly repo: TrendingRepository;
  private readonly productRepo: ProductRepository;

  constructor() {
    this.repo = new TrendingRepository();
    this.productRepo = new ProductRepository();
  }

  async saveTop10(runId: string, source: ProductSource, items: Top10Item[]): Promise<void> {
    const rows = items.map((item) => ({
      runId,
      rank:        item.rank,
      productId:   item.productId,
      source:      item.source,
      score:       item.score.toFixed(4),
      rating:      item.rating.toFixed(1),
      ratingCount: item.ratingCount,
    }));

    await this.repo.insertMany(rows);
    logger.info({ source, runId, count: rows.length }, 'Top trending products saved');
  }

  /**
   * DB fallback: when the current scrape run has no rated products for a source,
   * compute Top 10 from all historically rated products stored in the DB.
   */
  async computeAndSaveFromDB(runId: string, source: ProductSource): Promise<void> {
    const dbProducts = await this.productRepo.findTopRatedBySource(source, 50);

    const scored = dbProducts
      .map((p) => {
        const rating      = parseFloat(p.rating ?? '0');
        const ratingCount = p.ratingCount ?? 0;
        if (!rating || ratingCount <= 0) return null;
        return {
          productId:   p.id,
          source:      source,
          rating,
          ratingCount,
          score:       rating * Math.log10(ratingCount + 1),
        };
      })
      .filter(Boolean) as {
        productId: number; source: ProductSource;
        rating: number; ratingCount: number; score: number;
      }[];

    if (scored.length === 0) {
      logger.info({ source, runId }, 'TrendingService: no rated products in DB either, skipping');
      return;
    }

    scored.sort((a, b) => b.score - a.score);
    const top10 = scored.slice(0, 10).map((s, i) => ({
      rank:        i + 1,
      productId:   s.productId,
      source:      s.source,
      score:       s.score,
      rating:      s.rating,
      ratingCount: s.ratingCount,
    }));

    await this.saveTop10(runId, source, top10);
    logger.info({ source, runId, count: top10.length }, 'TrendingService: DB fallback Top 10 saved');
  }

  async getLatestTop10(source: string) {
    return this.repo.findLatestBySource(source);
  }

  async getLatestAll() {
    return this.repo.findLatestAllSources();
  }
}
