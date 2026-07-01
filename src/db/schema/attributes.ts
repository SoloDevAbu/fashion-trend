import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const productAttributes = pgTable(
  "product_attributes",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    primaryColor: varchar("primary_color", { length: 100 }),
    secondaryColor: varchar("secondary_color", { length: 100 }),
    pattern: varchar("pattern", { length: 100 }), // floral, geometric, solid, printed, embroidered
    style: varchar("style", { length: 100 }), // anarkali, straight, a-line, kurta, tunic
    neckType: varchar("neck_type", { length: 100 }), // round, v-neck, boat, mandarin, sweetheart
    sleeveType: varchar("sleeve_type", { length: 100 }), // sleeveless, 3/4, full, short
    fabric: varchar("fabric", { length: 100 }),
    embroidery: varchar("embroidery", { length: 100 }), // none, thread, mirror, sequin, zari
    occasion: varchar("occasion", { length: 100 }), // casual, festive, formal, party
    length: varchar("length", { length: 50 }), // short, midi, long, maxi
    rawResponse: text("raw_response"), // full Gemini JSON for debugging
    confidence: varchar("confidence", { length: 10 }), // high | medium | low
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdIdx: index("attributes_product_id_idx").on(table.productId),
    primaryColorIdx: index("attributes_primary_color_idx").on(
      table.primaryColor,
    ),
    styleIdx: index("attributes_style_idx").on(table.style),
    patternIdx: index("attributes_pattern_idx").on(table.pattern),
  }),
);

export type ProductAttribute = typeof productAttributes.$inferSelect;
export type NewProductAttribute = typeof productAttributes.$inferInsert;
