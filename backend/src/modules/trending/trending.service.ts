import type { ProductSource } from '../data-collection/crawler/crawler.types';
import { TrendingRepository } from './trending.repository';
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

  constructor() {
    this.repo = new TrendingRepository();
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

  async getLatestTop10(source: string) {
    return this.repo.findLatestBySource(source);
  }

  async getLatestAll() {
    return this.repo.findLatestAllSources();
  }
}
