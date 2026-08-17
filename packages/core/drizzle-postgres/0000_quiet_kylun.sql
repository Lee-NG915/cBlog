CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."deployment_driver" AS ENUM('github-dispatch', 'generic-build-hook');--> statement-breakpoint
CREATE TYPE "public"."deployment_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'timed_out');--> statement-breakpoint
CREATE TYPE "public"."publication_entity_type" AS ENUM('post', 'category', 'tag', 'collection', 'collection_item', 'site');--> statement-breakpoint
CREATE TYPE "public"."publication_operation" AS ENUM('publish', 'update', 'unpublish', 'archive', 'delete');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('pending', 'delivering', 'awaiting_deploy', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."revision_entity_type" AS ENUM('post', 'collection_item');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"object_key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"byte_size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"sha256" varchar(64) NOT NULL,
	"public_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_byte_size_nonnegative" CHECK ("assets"."byte_size" >= 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collection_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content_markdown" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"legacy_source_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collection_items_version_positive" CHECK ("collection_items"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"label" text DEFAULT 'Collection' NOT NULL,
	"badge" text,
	"noindex" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "revision_entity_type" NOT NULL,
	"post_id" uuid,
	"collection_item_id" uuid,
	"version" integer NOT NULL,
	"content_markdown" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"metadata_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_revisions_owner_type_match" CHECK ((
        ("content_revisions"."entity_type" = 'post' and "content_revisions"."post_id" is not null and "content_revisions"."collection_item_id" is null)
        or
        ("content_revisions"."entity_type" = 'collection_item' and "content_revisions"."post_id" is null and "content_revisions"."collection_item_id" is not null)
      ))
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content_markdown" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"category_id" uuid NOT NULL,
	"cover_asset_id" uuid,
	"reading_minutes" integer DEFAULT 1 NOT NULL,
	"editorial_date" date,
	"published_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"legacy_source_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_version_positive" CHECK ("posts"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "publication_deployment_events" (
	"deployment_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	CONSTRAINT "publication_deployment_events_deployment_id_event_id_pk" PRIMARY KEY("deployment_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "publication_deployments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver" "deployment_driver" NOT NULL,
	"status" "deployment_status" DEFAULT 'queued' NOT NULL,
	"external_id" text,
	"target" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publication_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"entity_type" "publication_entity_type" NOT NULL,
	"entity_id" uuid,
	"operation" "publication_operation" NOT NULL,
	"payload_json" jsonb NOT NULL,
	"status" "publication_status" DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"deployment_id" uuid,
	"delivered_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_collection_item_id_collection_items_id_fk" FOREIGN KEY ("collection_item_id") REFERENCES "public"."collection_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_asset_id_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_deployment_events" ADD CONSTRAINT "pub_deployment_events_deployment_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."publication_deployments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_deployment_events" ADD CONSTRAINT "pub_deployment_events_event_fk" FOREIGN KEY ("event_id") REFERENCES "public"."publication_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication_events" ADD CONSTRAINT "publication_events_deployment_id_publication_deployments_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."publication_deployments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assets_object_key_unique" ON "assets" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "assets_sha256_idx" ON "assets" USING btree ("sha256");--> statement-breakpoint
CREATE UNIQUE INDEX "collection_items_collection_slug_unique" ON "collection_items" USING btree ("collection_id","slug");--> statement-breakpoint
CREATE INDEX "collection_items_status_idx" ON "collection_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "collection_items_published_order_idx" ON "collection_items" USING btree ("collection_id","status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "content_revisions_post_version_unique" ON "content_revisions" USING btree ("post_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "content_revisions_item_version_unique" ON "content_revisions" USING btree ("collection_item_id","version");--> statement-breakpoint
CREATE INDEX "post_tags_position_idx" ON "post_tags" USING btree ("post_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_published_order_idx" ON "posts" USING btree ("status","editorial_date","created_at");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "publication_events_claim_idx" ON "publication_events" USING btree ("status","next_attempt_at","created_at");