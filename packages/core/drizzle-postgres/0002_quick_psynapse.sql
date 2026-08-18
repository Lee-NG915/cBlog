ALTER TABLE "posts" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updated_at" DROP NOT NULL;