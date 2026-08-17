CREATE TABLE "content_migration_runs" (
	"run_id" varchar(128) PRIMARY KEY NOT NULL,
	"source_digest" varchar(64) NOT NULL,
	"tool_version" integer DEFAULT 1 NOT NULL,
	"report_json" jsonb NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "assets_sha256_idx";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "editorial_date" SET DATA TYPE timestamp with time zone USING ("editorial_date"::timestamp AT TIME ZONE 'UTC');--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "cover_external_url" text;--> statement-breakpoint
CREATE UNIQUE INDEX "assets_sha256_unique" ON "assets" USING btree ("sha256");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_items_legacy_source_path_unique" ON "collection_items" USING btree ("legacy_source_path");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_legacy_source_path_unique" ON "posts" USING btree ("legacy_source_path");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_source_exclusive" CHECK (not ("posts"."cover_asset_id" is not null and "posts"."cover_external_url" is not null));
