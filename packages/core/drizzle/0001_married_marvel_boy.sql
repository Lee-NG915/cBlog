ALTER TABLE `collections` ADD `label` text DEFAULT 'Collection' NOT NULL;--> statement-breakpoint
ALTER TABLE `collections` ADD `badge` text;--> statement-breakpoint
ALTER TABLE `collections` ADD `noindex` integer DEFAULT 1 NOT NULL;