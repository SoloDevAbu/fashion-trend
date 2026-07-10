import { eq, desc } from 'drizzle-orm';
import { db, trendingProducts, type NewTrendingProduct, type TrendingProduct } from '../../db';

export class TrendingRepository {
  async insertMany(rows: NewTrendingProduct[]): Promise<void> {
    if (rows.length === 0) return;
    await db.insert(trendingProducts).values(rows);
  }

  async findLatestBySource(source: string, limit = 10): Promise<TrendingProduct[]> {
    const latest = await db
      .select({ runId: trendingProducts.runId })
      .from(trendingProducts)
      .where(eq(trendingProducts.source, source))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(1);

    if (!latest[0]) return [];

    return db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.runId, latest[0].runId))
      .orderBy(trendingProducts.rank);
  }

  async findLatestAllSources(): Promise<TrendingProduct[]> {
    return db
      .select()
      .from(trendingProducts)
      .orderBy(desc(trendingProducts.createdAt), trendingProducts.rank)
      .limit(20);
  }
}
