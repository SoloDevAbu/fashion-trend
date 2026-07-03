CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"source" varchar(50) NOT NULL,
	"image_url" text NOT NULL,
	"local_image_path" text,
	"product_url" text NOT NULL,
	"price" numeric(10,2),
	"currency" varchar(10) DEFAULT 'INR',
	"is_analyzed" varchar(5) DEFAULT 'false',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_attributes" (
	"id" serial PRIMARY KEY,
	"product_id" integer NOT NULL,
	"primary_color" varchar(100),
	"secondary_color" varchar(100),
	"pattern" varchar(100),
	"style" varchar(100),
	"neck_type" varchar(100),
	"sleeve_type" varchar(100),
	"fabric" varchar(100),
	"embroidery" varchar(100),
	"occasion" varchar(100),
	"length" varchar(50),
	"raw_response" text,
	"confidence" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_snapshots" (
	"id" serial PRIMARY KEY,
	"period_label" text NOT NULL,
	"total_products_analyzed" integer DEFAULT 0 NOT NULL,
	"top_colors" jsonb,
	"top_patterns" jsonb,
	"top_styles" jsonb,
	"top_neck_types" jsonb,
	"top_sleeve_types" jsonb,
	"top_embroidery" jsonb,
	"top_occasions" jsonb,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_designs" (
	"id" serial PRIMARY KEY,
	"trend_snapshot_id" integer,
	"prompt" text NOT NULL,
	"image_url" text,
	"local_image_path" text,
	"model_used" text,
	"trend_inputs" jsonb,
	"status" text DEFAULT 'pending',
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "products_source_idx" ON "products" ("source");--> statement-breakpoint
CREATE INDEX "products_is_analyzed_idx" ON "products" ("is_analyzed");--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" ("created_at");--> statement-breakpoint
CREATE INDEX "attributes_product_id_idx" ON "product_attributes" ("product_id");--> statement-breakpoint
CREATE INDEX "attributes_primary_color_idx" ON "product_attributes" ("primary_color");--> statement-breakpoint
CREATE INDEX "attributes_style_idx" ON "product_attributes" ("style");--> statement-breakpoint
CREATE INDEX "attributes_pattern_idx" ON "product_attributes" ("pattern");--> statement-breakpoint
CREATE INDEX "trend_snapshots_period_label_idx" ON "trend_snapshots" ("period_label");--> statement-breakpoint
CREATE INDEX "trend_snapshots_created_at_idx" ON "trend_snapshots" ("created_at");--> statement-breakpoint
CREATE INDEX "generated_designs_trend_snapshot_id_idx" ON "generated_designs" ("trend_snapshot_id");--> statement-breakpoint
CREATE INDEX "generated_designs_status_idx" ON "generated_designs" ("status");--> statement-breakpoint
CREATE INDEX "generated_designs_created_at_idx" ON "generated_designs" ("created_at");--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "generated_designs" ADD CONSTRAINT "generated_designs_trend_snapshot_id_trend_snapshots_id_fkey" FOREIGN KEY ("trend_snapshot_id") REFERENCES "trend_snapshots"("id") ON DELETE SET NULL;