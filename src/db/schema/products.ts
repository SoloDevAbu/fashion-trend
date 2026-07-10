import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  decimal,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id:            serial("id").primaryKey(),
    title:         text("title").notNull(),
    source:        varchar("source", { length: 50 }).notNull(),
    imageUrl:      text("image_url").notNull(),
    cloudinaryUrl: text("cloudinary_url"),
    productUrl:    text("product_url").notNull(),
    price:         decimal("price", { precision: 10, scale: 2 }),
    currency:      varchar("currency", { length: 10 }).default("INR"),
    rating:        decimal("rating", { precision: 3, scale: 1 }),
    ratingCount:   integer("rating_count"),
    isAnalyzed:    varchar("is_analyzed", { length: 5 }).default("false"),
    createdAt:     timestamp("created_at").defaultNow().notNull(),
    updatedAt:     timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx:     index("products_source_idx").on(table.source),
    isAnalyzedIdx: index("products_is_analyzed_idx").on(table.isAnalyzed),
    createdAtIdx:  index("products_created_at_idx").on(table.createdAt),
    ratingIdx:     index("products_rating_idx").on(table.rating),
  }),
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
