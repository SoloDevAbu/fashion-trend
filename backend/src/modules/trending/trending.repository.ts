import { eq, desc } from 'drizzle-orm';
import { db, trendingProducts, products, type NewTrendingProduct, type TrendingProduct } from '../../db';

export interface EnrichedTrendingProduct extends TrendingProduct {
  title?: string;
  imageUrl?: string;
  cloudinaryUrl?: string | null;
  productUrl?: string;
  price?: string | null;
  currency?: string | null;
}

export class TrendingRepository {
  async insertMany(rows: NewTrendingProduct[]): Promise<void> {
    if (rows.length === 0) return;
    await db.insert(trendingProducts).values(rows);
  }

  async findLatestBySource(source: string, limit = 10): Promise<EnrichedTrendingProduct[]> {
    const latest = await db
      .select({ runId: trendingProducts.runId })
      .from(trendingProducts)
      .where(eq(trendingProducts.source, source))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(1);

    if (!latest[0]) return [];

    return db
      .select({
        id: trendingProducts.id,
        runId: trendingProducts.runId,
        rank: trendingProducts.rank,
        productId: trendingProducts.productId,
        source: trendingProducts.source,
        score: trendingProducts.score,
        rating: trendingProducts.rating,
        ratingCount: trendingProducts.ratingCount,
        createdAt: trendingProducts.createdAt,
        title: products.title,
        imageUrl: products.imageUrl,
        cloudinaryUrl: products.cloudinaryUrl,
        productUrl: products.productUrl,
        price: products.price,
        currency: products.currency,
      })
      .from(trendingProducts)
      .innerJoin(products, eq(trendingProducts.productId, products.id))
      .where(eq(trendingProducts.runId, latest[0].runId))
      .orderBy(trendingProducts.rank)
      .limit(limit);
  }

  async findLatestAllSources(): Promise<EnrichedTrendingProduct[]> {
    const latestRun = await db
      .select({ runId: trendingProducts.runId })
      .from(trendingProducts)
      .orderBy(desc(trendingProducts.createdAt))
      .limit(1);

    if (!latestRun[0]) return [];

    return db
      .select({
        id: trendingProducts.id,
        runId: trendingProducts.runId,
        rank: trendingProducts.rank,
        productId: trendingProducts.productId,
        source: trendingProducts.source,
        score: trendingProducts.score,
        rating: trendingProducts.rating,
        ratingCount: trendingProducts.ratingCount,
        createdAt: trendingProducts.createdAt,
        title: products.title,
        imageUrl: products.imageUrl,
        cloudinaryUrl: products.cloudinaryUrl,
        productUrl: products.productUrl,
        price: products.price,
        currency: products.currency,
      })
      .from(trendingProducts)
      .innerJoin(products, eq(trendingProducts.productId, products.id))
      .where(eq(trendingProducts.runId, latestRun[0].runId))
      .orderBy(trendingProducts.source, trendingProducts.rank);
  }
}

