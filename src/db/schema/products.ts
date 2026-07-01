import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  decimal,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    source: varchar("source", { length: 50 }).notNull(), // 'myntra' | 'ajio' | 'pinterest'
    imageUrl: text("image_url").notNull(),
    localImagePath: text("local_image_path"),
    productUrl: text("product_url").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 10 }).default("INR"),
    isAnalyzed: varchar("is_analyzed", { length: 5 }).default("false"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("products_source_idx").on(table.source),
    isAnalyzedIdx: index("products_is_analyzed_idx").on(table.isAnalyzed),
    createdAtIdx: index("products_created_at_idx").on(table.createdAt),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
