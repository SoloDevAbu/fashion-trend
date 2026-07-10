CREATE TABLE "trending_products" (
	"id" serial PRIMARY KEY,
	"run_id" varchar(100) NOT NULL,
	"rank" integer NOT NULL,
	"product_id" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"score" numeric(8,4) NOT NULL,
	"rating" numeric(3,1),
	"rating_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cloudinary_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rating" numeric(3,1);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rating_count" integer;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "local_image_path";--> statement-breakpoint
CREATE INDEX "products_rating_idx" ON "products" ("rating");--> statement-breakpoint
CREATE INDEX "trending_run_id_idx" ON "trending_products" ("run_id");--> statement-breakpoint
CREATE INDEX "trending_created_at_idx" ON "trending_products" ("created_at");--> statement-breakpoint
CREATE INDEX "trending_source_idx" ON "trending_products" ("source");--> statement-breakpoint
ALTER TABLE "trending_products" ADD CONSTRAINT "trending_products_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;