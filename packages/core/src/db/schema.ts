import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const POST_STATUSES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    filePath: text("file_path").notNull().unique(),
    coverImage: text("cover_image"),
    date: text("date").notNull().default(""),
    updatedAt: text("updated_at"),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    statusIdx: index("idx_posts_status").on(t.status),
    categoryIdx: index("idx_posts_category").on(t.categoryId),
  })
);

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagId] }),
  })
);

export const collections = sqliteTable("collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  /** 列表页顶部的小标签文案（存量为 "Interview Notes"） */
  label: text("label").notNull().default("Collection"),
  /** 详情页徽标文案，空则回退 name */
  badge: text("badge"),
  /** 1 = noindex,nofollow 且不进 sitemap（存量专栏均为 1，保持等价） */
  noindex: integer("noindex").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const collectionItems = sqliteTable(
  "collection_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collections.id),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    status: text("status", { enum: POST_STATUSES })
      .notNull()
      .default("published"),
    sortOrder: integer("sort_order").notNull().default(0),
    filePath: text("file_path").notNull().unique(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex("uq_collection_slug").on(t.collectionId, t.slug),
  })
);
