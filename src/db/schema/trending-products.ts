import {
  pgTable,
  serial,
  integer,
  varchar,
  decimal,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const trendingProducts = pgTable(
  "trending_products",
  {
    id: serial("id").primaryKey(),
    runId: varchar("run_id", { length: 100 }).notNull(),
    rank: integer("rank").notNull(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    source: varchar("source", { length: 50 }).notNull(),
    score: decimal("score", { precision: 8, scale: 4 }).notNull(),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    ratingCount: integer("rating_count"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    runIdIdx: index("trending_run_id_idx").on(t.runId),
    createdAtIdx: index("trending_created_at_idx").on(t.createdAt),
    sourceIdx: index("trending_source_idx").on(t.source),
  }),
);

export type TrendingProduct = typeof trendingProducts.$inferSelect;
export type NewTrendingProduct = typeof trendingProducts.$inferInsert;
