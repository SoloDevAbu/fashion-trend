import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { trendSnapshots } from "./trend-snapshots";

export const generatedDesigns = pgTable(
  "generated_designs",
  {
    id: serial("id").primaryKey(),
    trendSnapshotId: integer("trend_snapshot_id").references(
      () => trendSnapshots.id,
      {
        onDelete: "set null",
      },
    ),
    prompt: text("prompt").notNull(),
    imageUrl: text("image_url"), // URL if hosted externally
    localImagePath: text("local_image_path"), // local file path if saved
    modelUsed: text("model_used"), // e.g. "gemini-2.0-flash-preview-image-generation"
    trendInputs: jsonb("trend_inputs"), // snapshot of trend data used
    status: text("status").default("pending"), // pending | completed | failed
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    trendSnapshotIdIdx: index("generated_designs_trend_snapshot_id_idx").on(
      table.trendSnapshotId,
    ),
    statusIdx: index("generated_designs_status_idx").on(table.status),
    createdAtIdx: index("generated_designs_created_at_idx").on(table.createdAt),
  }),
);

export type GeneratedDesign = typeof generatedDesigns.$inferSelect;
export type NewGeneratedDesign = typeof generatedDesigns.$inferInsert;
