import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const trendSnapshots = pgTable(
  "trend_snapshots",
  {
    id: serial("id").primaryKey(),
    periodLabel: text("period_label").notNull(), // e.g. "2025-01-W3"
    totalProductsAnalyzed: integer("total_products_analyzed")
      .notNull()
      .default(0),
    topColors:
      jsonb("top_colors").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topPatterns:
      jsonb("top_patterns").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topStyles:
      jsonb("top_styles").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topNeckTypes:
      jsonb("top_neck_types").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topSleeveTypes:
      jsonb("top_sleeve_types").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topEmbroidery:
      jsonb("top_embroidery").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    topOccasions:
      jsonb("top_occasions").$type<
        Array<{ value: string; count: number; percentage: number }>
      >(),
    summary: text("summary"), // Human-readable trend summary
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    periodLabelIdx: index("trend_snapshots_period_label_idx").on(
      table.periodLabel,
    ),
    createdAtIdx: index("trend_snapshots_created_at_idx").on(table.createdAt),
  }),
);

export type TrendSnapshot = typeof trendSnapshots.$inferSelect;
export type NewTrendSnapshot = typeof trendSnapshots.$inferInsert;
