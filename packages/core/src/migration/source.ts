import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { DbHandle } from "../db/client";
import {
  categories,
  collectionItems,
  collections,
  posts,
  postTags,
  tags,
} from "../db/schema";
import { parseMarkdown } from "../content/frontmatter";
import { calculateNoteReadingTime } from "../utils/notes";
import { calculateReadingTime } from "../utils/text";
import {
  resolveCoverAsset,
  rewriteMarkdownAssets,
  type AssetScanContext,
} from "./assets";
import type { MigrationSnapshot } from "./types";

export const PUBLISHED_AT_MIGRATION_RULE =
  "published 内容使用旧 frontmatter date 的完整时间作为可追溯近似首次发布时间；缺少 editorial_date 时保持 NULL，并在报告中显式统计";

function hash(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => compareStrings(a, b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function timestamp(value: string | null | undefined): string {
  if (!value) return "1970-01-01T00:00:00.000Z";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`无法迁移的时间值: ${value}`);
  }
  return parsed.toISOString();
}

function readMarkdownContent(contentDir: string, filePath: string): string {
  const root = path.resolve(contentDir);
  const absolutePath = path.resolve(root, filePath);
  if (!absolutePath.startsWith(root + path.sep)) {
    throw new Error(`Markdown 路径越界: ${filePath}`);
  }
  const raw = fs.readFileSync(absolutePath, "utf8");
  return parseMarkdown(raw).content;
}

export interface BuildMigrationSnapshotOptions {
  contentDir: string;
  publicDir: string;
  publicBaseUrl: string;
}

export function buildMigrationSnapshot(
  source: DbHandle,
  options: BuildMigrationSnapshotOptions
): MigrationSnapshot {
  const categoryRows = source.db.select().from(categories).all();
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const collectionRows = source.db.select().from(collections).all();
  const collectionById = new Map(collectionRows.map((row) => [row.id, row]));

  const tagRows = source.db
    .select({
      postId: postTags.postId,
      name: tags.name,
      position: postTags.position,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .all()
    .sort((a, b) => a.postId - b.postId || a.position - b.position);
  const tagsByPost = new Map<number, string[]>();
  for (const row of tagRows) {
    tagsByPost.set(row.postId, [
      ...(tagsByPost.get(row.postId) ?? []),
      row.name,
    ]);
  }

  const assetContext: AssetScanContext = {
    contentDir: options.contentDir,
    publicDir: options.publicDir,
    publicBaseUrl: options.publicBaseUrl,
    assetsByHash: new Map(),
    unresolved: [],
    remote: [],
  };

  const migratedPosts = source.db
    .select()
    .from(posts)
    .all()
    .sort((a, b) => compareStrings(a.filePath, b.filePath))
    .map((row) => {
      const category = categoryById.get(row.categoryId);
      if (!category) throw new Error(`文章 ${row.slug} 缺少分类 ${row.categoryId}`);
      const sourceContent = readMarkdownContent(options.contentDir, row.filePath);
      const rewritten = rewriteMarkdownAssets(
        row.filePath,
        sourceContent,
        assetContext
      );
      const cover = resolveCoverAsset(
        row.filePath,
        row.coverImage,
        assetContext
      );
      const editorialDate = row.date ? timestamp(row.date) : null;
      const createdAt = timestamp(row.createdAt || editorialDate);
      // updatedAt 是"作者可感的最后修改时间"：frontmatter 没有就置 NULL（不虚构导入时间），
      // 审计轨迹由 content_revisions 承担；后续 PG 写路径在每次保存时写入当时时间
      const updatedAt = row.updatedAt ? timestamp(row.updatedAt) : null;
      return {
        legacySourcePath: row.filePath,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        status: row.status,
        categorySlug: category.slug,
        tags: tagsByPost.get(row.id) ?? [],
        sourceContentHash: hash(sourceContent),
        contentMarkdown: rewritten.markdown,
        contentHash: hash(rewritten.markdown),
        editorialDate,
        publishedAt:
          row.status === "published" && editorialDate
            ? timestamp(editorialDate)
            : null,
        coverAssetId: cover.assetId,
        coverExternalUrl: cover.externalUrl,
        readingMinutes: calculateReadingTime(rewritten.markdown),
        createdAt,
        updatedAt,
      };
    });

  const migratedItems = source.db
    .select()
    .from(collectionItems)
    .all()
    .sort((a, b) => compareStrings(a.filePath, b.filePath))
    .map((row) => {
      const collection = collectionById.get(row.collectionId);
      if (!collection) {
        throw new Error(`专栏文档 ${row.slug} 缺少专栏 ${row.collectionId}`);
      }
      const sourceContent = readMarkdownContent(options.contentDir, row.filePath);
      const rewritten = rewriteMarkdownAssets(
        row.filePath,
        sourceContent,
        assetContext
      );
      return {
        legacySourcePath: row.filePath,
        collectionSlug: collection.slug,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        status: row.status,
        sortOrder: row.sortOrder,
        sourceContentHash: hash(sourceContent),
        contentMarkdown: rewritten.markdown,
        contentHash: hash(rewritten.markdown),
        readingMinutes: calculateNoteReadingTime(rewritten.markdown),
        createdAt: timestamp(row.createdAt),
        updatedAt: timestamp(row.updatedAt),
      };
    });

  const snapshotWithoutDigest = {
    schemaVersion: 1 as const,
    publishedAtRule: PUBLISHED_AT_MIGRATION_RULE,
    categories: categoryRows
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        sortOrder: row.sortOrder,
        createdAt: timestamp(row.createdAt),
        updatedAt: timestamp(row.updatedAt),
      }))
      .sort((a, b) => compareStrings(a.slug, b.slug)),
    tags: source.db
      .select({ name: tags.name })
      .from(tags)
      .all()
      .map((row) => row.name)
      .sort(compareStrings),
    posts: migratedPosts.map(({ readingMinutes: _readingMinutes, ...post }) => post),
    collections: collectionRows
      .map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        label: row.label,
        badge: row.badge,
        noindex: row.noindex === 1,
        sortOrder: row.sortOrder,
        createdAt: timestamp(row.createdAt),
        updatedAt: timestamp(row.updatedAt),
      }))
      .sort((a, b) => compareStrings(a.slug, b.slug)),
    collectionItems: migratedItems.map(
      ({ readingMinutes: _readingMinutes, ...item }) => item
    ),
    assets: [...assetContext.assetsByHash.values()].sort((a, b) =>
      compareStrings(a.sha256, b.sha256)
    ),
    unresolvedAssets: assetContext.unresolved.sort((a, b) =>
      compareStrings(`${a.documentPath}:${a.url}`, `${b.documentPath}:${b.url}`)
    ),
    remoteAssets: assetContext.remote.sort((a, b) =>
      compareStrings(`${a.documentPath}:${a.url}`, `${b.documentPath}:${b.url}`)
    ),
  };

  return {
    ...snapshotWithoutDigest,
    sourceDigest: hash(stableJson(snapshotWithoutDigest)),
  };
}
