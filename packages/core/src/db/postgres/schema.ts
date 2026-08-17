import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { CONTENT_STATUSES } from "../../domain/status";

export const contentStatusEnum = pgEnum("content_status", CONTENT_STATUSES);
export const revisionEntityTypeEnum = pgEnum("revision_entity_type", [
  "post",
  "collection_item",
]);
export const publicationEntityTypeEnum = pgEnum("publication_entity_type", [
  "post",
  "category",
  "tag",
  "collection",
  "collection_item",
  "site",
]);
export const publicationOperationEnum = pgEnum("publication_operation", [
  "publish",
  "update",
  "unpublish",
  "archive",
  "delete",
]);
export const publicationStatusEnum = pgEnum("publication_status", [
  "pending",
  "delivering",
  "awaiting_deploy",
  "delivered",
  "failed",
]);
export const deploymentDriverEnum = pgEnum("deployment_driver", [
  "github-dispatch",
  "generic-build-hook",
]);
export const deploymentStatusEnum = pgEnum("deployment_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "timed_out",
]);

const auditColumns = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
};

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    objectKey: text("object_key").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: varchar("mime_type", { length: 127 }).notNull(),
    byteSize: integer("byte_size").notNull(),
    width: integer("width"),
    height: integer("height"),
    sha256: varchar("sha256", { length: 64 }).notNull(),
    publicUrl: text("public_url").notNull(),
    createdAt: auditColumns.createdAt,
  },
  (table) => ({
    objectKeyUnique: uniqueIndex("assets_object_key_unique").on(
      table.objectKey
    ),
    sha256Idx: index("assets_sha256_idx").on(table.sha256),
    byteSizeCheck: check("assets_byte_size_nonnegative", sql`${table.byteSize} >= 0`),
  })
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  version: integer("version").notNull().default(1),
  ...auditColumns,
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    contentMarkdown: text("content_markdown").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    coverAssetId: uuid("cover_asset_id").references(() => assets.id, {
      onDelete: "set null",
    }),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    editorialDate: date("editorial_date", { mode: "string" }),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "string",
    }),
    version: integer("version").notNull().default(1),
    legacySourcePath: text("legacy_source_path"),
    ...auditColumns,
  },
  (table) => ({
    slugUnique: uniqueIndex("posts_slug_unique").on(table.slug),
    statusIdx: index("posts_status_idx").on(table.status),
    publishedOrderIdx: index("posts_published_order_idx").on(
      table.status,
      table.editorialDate,
      table.createdAt
    ),
    categoryIdx: index("posts_category_idx").on(table.categoryId),
    versionCheck: check("posts_version_positive", sql`${table.version} > 0`),
  })
);

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull().unique(),
  version: integer("version").notNull().default(1),
  ...auditColumns,
});

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict" }),
    position: integer("position").notNull().default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    positionIdx: index("post_tags_position_idx").on(
      table.postId,
      table.position
    ),
  })
);

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  label: text("label").notNull().default("Collection"),
  badge: text("badge"),
  noindex: boolean("noindex").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  version: integer("version").notNull().default(1),
  ...auditColumns,
});

export const collectionItems = pgTable(
  "collection_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    contentMarkdown: text("content_markdown").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    sortOrder: integer("sort_order").notNull().default(0),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    version: integer("version").notNull().default(1),
    legacySourcePath: text("legacy_source_path"),
    ...auditColumns,
  },
  (table) => ({
    slugUnique: uniqueIndex("collection_items_collection_slug_unique").on(
      table.collectionId,
      table.slug
    ),
    statusIdx: index("collection_items_status_idx").on(table.status),
    publishedOrderIdx: index("collection_items_published_order_idx").on(
      table.collectionId,
      table.status,
      table.sortOrder
    ),
    versionCheck: check(
      "collection_items_version_positive",
      sql`${table.version} > 0`
    ),
  })
);

export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: revisionEntityTypeEnum("entity_type").notNull(),
    postId: uuid("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    collectionItemId: uuid("collection_item_id").references(
      () => collectionItems.id,
      { onDelete: "cascade" }
    ),
    version: integer("version").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    metadataSnapshot: jsonb("metadata_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: auditColumns.createdAt,
  },
  (table) => ({
    postVersionUnique: uniqueIndex("content_revisions_post_version_unique").on(
      table.postId,
      table.version
    ),
    itemVersionUnique: uniqueIndex("content_revisions_item_version_unique").on(
      table.collectionItemId,
      table.version
    ),
    ownerTypeCheck: check(
      "content_revisions_owner_type_match",
      sql`(
        (${table.entityType} = 'post' and ${table.postId} is not null and ${table.collectionItemId} is null)
        or
        (${table.entityType} = 'collection_item' and ${table.postId} is null and ${table.collectionItemId} is not null)
      )`
    ),
  })
);

export const publicationDeployments = pgTable("publication_deployments", {
  id: uuid("id").primaryKey().defaultRandom(),
  driver: deploymentDriverEnum("driver").notNull(),
  status: deploymentStatusEnum("status").notNull().default("queued"),
  externalId: text("external_id"),
  target: text("target").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }),
  finishedAt: timestamp("finished_at", {
    withTimezone: true,
    mode: "string",
  }),
  lastError: text("last_error"),
  ...auditColumns,
});

export const publicationEvents = pgTable(
  "publication_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    schemaVersion: integer("schema_version").notNull().default(1),
    entityType: publicationEntityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id"),
    operation: publicationOperationEnum("operation").notNull(),
    payloadJson: jsonb("payload_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    status: publicationStatusEnum("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", {
      withTimezone: true,
      mode: "string",
    }),
    deploymentId: uuid("deployment_id").references(
      () => publicationDeployments.id,
      { onDelete: "set null" }
    ),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastError: text("last_error"),
    createdAt: auditColumns.createdAt,
  },
  (table) => ({
    claimIdx: index("publication_events_claim_idx").on(
      table.status,
      table.nextAttemptAt,
      table.createdAt
    ),
  })
);

export const publicationDeploymentEvents = pgTable(
  "publication_deployment_events",
  {
    deploymentId: uuid("deployment_id").notNull(),
    eventId: uuid("event_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.deploymentId, table.eventId] }),
    deploymentFk: foreignKey({
      name: "pub_deployment_events_deployment_fk",
      columns: [table.deploymentId],
      foreignColumns: [publicationDeployments.id],
    }).onDelete("cascade"),
    eventFk: foreignKey({
      name: "pub_deployment_events_event_fk",
      columns: [table.eventId],
      foreignColumns: [publicationEvents.id],
    }).onDelete("cascade"),
  })
);
