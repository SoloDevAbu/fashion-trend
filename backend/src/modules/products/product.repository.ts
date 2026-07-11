import { eq, and, desc, sql } from "drizzle-orm";
import { db, products, type NewProduct, type Product } from "../../db";

export class ProductRepository {
  async insert(data: NewProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product!;
  }

  async insertMany(data: NewProduct[]): Promise<Product[]> {
    if (data.length === 0) return [];
    return db.insert(products).values(data).returning();
  }

  async findById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    return product;
  }

  async findAll(opts: {
    source?: string;
    isAnalyzed?: string;
    limit: number;
    offset: number;
  }): Promise<Product[]> {
    const conditions = [];
    if (opts.source)
      conditions.push(eq(products.source, opts.source as Product["source"]));
    if (opts.isAnalyzed)
      conditions.push(eq(products.isAnalyzed, opts.isAnalyzed));

    return db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt))
      .limit(opts.limit)
      .offset(opts.offset);
  }

  async findUnanalyzed(limit = 50): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(eq(products.isAnalyzed, "false"))
      .orderBy(products.createdAt)
      .limit(limit);
  }

  async markAsAnalyzed(id: number): Promise<void> {
    await db
      .update(products)
      .set({ isAnalyzed: "true", updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async countBySource(): Promise<Array<{ source: string; count: number }>> {
    const result = await db
      .select({
        source: products.source,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(products)
      .groupBy(products.source);
    return result;
  }

  async findByProductUrl(productUrl: string): Promise<Product | undefined> {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.productUrl, productUrl))
      .limit(1);
    return row;
  }

  async existsByProductUrl(productUrl: string): Promise<boolean> {
    const [row] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.productUrl, productUrl))
      .limit(1);
    return !!row;
  }

  async findTopRatedBySource(source: string, limit = 50): Promise<Product[]> {
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.source, source as Product["source"]),
          sql`${products.rating} IS NOT NULL`,
          sql`${products.ratingCount} IS NOT NULL`,
          sql`${products.ratingCount} > 0`,
        ),
      )
      .orderBy(desc(products.rating), desc(products.ratingCount))
      .limit(limit);
  }
}
