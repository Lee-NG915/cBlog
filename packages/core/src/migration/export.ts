import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { asc, eq } from "drizzle-orm";
import { buildOrderedFrontmatter, serializeMarkdown } from "../content/frontmatter";
import type { PostgresDbHandle } from "../db/postgres/client";
import {
  assets,
  categories,
  collectionItems,
  collections,
  posts,
  postTags,
  tags,
} from "../db/postgres/schema";
import type { MigrationAssetStore } from "./assets";

function hash(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function assertEmptyOutput(outputDir: string): string {
  const root = path.resolve(outputDir);
  if (fs.existsSync(root) && fs.readdirSync(root).length > 0) {
    throw new Error(`备份输出目录必须为空: ${root}`);
  }
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function safeDocumentPath(
  root: string,
  legacySourcePath: string | null,
  fallback: string
): string {
  const relative = legacySourcePath || fallback;
  if (
    (!relative.startsWith("posts/") && !relative.startsWith("collections/")) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`非法备份文档路径: ${relative}`);
  }
  const destination = path.resolve(root, relative);
  if (!destination.startsWith(root + path.sep)) {
    throw new Error(`备份文档路径越界: ${relative}`);
  }
  return destination;
}

export interface MarkdownBackupManifest {
  schemaVersion: 1;
  exportedAt: string;
  counts: { posts: number; collectionItems: number; assets: number };
  /** createdAt/publishedAt 为审计字段：frontmatter 不承载，灾备还原依赖 manifest */
  files: Array<{
    path: string;
    sha256: string;
    entityType: "post" | "collection_item";
    slug: string;
    createdAt: string;
    publishedAt: string | null;
  }>;
  assets: Array<{ objectKey: string; sha256: string }>;
  categories: Array<{
    slug: string;
    name: string;
    description: string;
    sortOrder: number;
  }>;
  collections: Array<{
    slug: string;
    name: string;
    description: string;
    label: string;
    badge: string | null;
    noindex: boolean;
    sortOrder: number;
  }>;
}

export async function exportMarkdownBackup(
  handle: PostgresDbHandle,
  assetStore: MigrationAssetStore,
  outputDir: string
): Promise<MarkdownBackupManifest> {
  const root = assertEmptyOutput(outputDir);
  const [postRows, categoryRows, collectionRows, itemRows, assetRows, tagRows] =
    await Promise.all([
      handle.db.select().from(posts),
      handle.db.select().from(categories),
      handle.db.select().from(collections),
      handle.db.select().from(collectionItems),
      handle.db.select().from(assets),
      handle.db
        .select({ postId: postTags.postId, name: tags.name })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .orderBy(asc(postTags.position)),
    ]);
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const collectionById = new Map(collectionRows.map((row) => [row.id, row]));
  const assetById = new Map(assetRows.map((row) => [row.id, row]));
  const tagsByPost = new Map<string, string[]>();
  for (const row of tagRows) {
    tagsByPost.set(row.postId, [...(tagsByPost.get(row.postId) ?? []), row.name]);
  }
  const files: MarkdownBackupManifest["files"] = [];
  const exportedAssetKeys = new Set<string>();

  const restoreAssets = async (
    markdown: string,
    documentDestination: string
  ): Promise<string> => {
    const ids = [...new Set(markdown.match(/(?<=asset:\/\/)[0-9a-f-]{36}/gi) ?? [])];
    let restored = markdown;
    for (const id of ids) {
      const asset = assetById.get(id);
      if (!asset) throw new Error(`备份引用不存在的资产: ${id}`);
      const fileName = `${asset.sha256.slice(0, 12)}-${asset.originalName}`;
      const assetDir = path.join(path.dirname(documentDestination), "assets");
      const destination = path.join(assetDir, fileName);
      const bytes = await assetStore.read(asset.objectKey);
      if (hash(bytes) !== asset.sha256) {
        throw new Error(`备份资产 hash 不一致: ${asset.objectKey}`);
      }
      fs.mkdirSync(assetDir, { recursive: true });
      fs.writeFileSync(destination, bytes);
      restored = restored.replaceAll(`asset://${id}`, `./assets/${fileName}`);
      exportedAssetKeys.add(asset.objectKey);
    }
    return restored;
  };

  for (const post of postRows) {
    const destination = safeDocumentPath(
      root,
      post.legacySourcePath,
      `posts/${post.slug}/index.md`
    );
    let markdown = await restoreAssets(post.contentMarkdown, destination);
    let coverImage = post.coverExternalUrl ?? undefined;
    if (post.coverAssetId) {
      const asset = assetById.get(post.coverAssetId);
      if (!asset) throw new Error(`文章 ${post.slug} 封面资产不存在`);
      const fileName = `${asset.sha256.slice(0, 12)}-${asset.originalName}`;
      const assetDir = path.join(path.dirname(destination), "assets");
      const bytes = await assetStore.read(asset.objectKey);
      if (hash(bytes) !== asset.sha256) {
        throw new Error(`封面资产 hash 不一致: ${asset.objectKey}`);
      }
      fs.mkdirSync(assetDir, { recursive: true });
      fs.writeFileSync(path.join(assetDir, fileName), bytes);
      coverImage = `./assets/${fileName}`;
      exportedAssetKeys.add(asset.objectKey);
    }
    const category = categoryById.get(post.categoryId);
    if (!category) throw new Error(`文章 ${post.slug} 分类不存在`);
    const serialized = serializeMarkdown(
      buildOrderedFrontmatter({
        title: post.title,
        slug: post.slug,
        date: post.editorialDate ?? "",
        updatedAt: post.updatedAt,
        category: category.slug,
        tags: tagsByPost.get(post.id) ?? [],
        excerpt: post.excerpt,
        coverImage,
        status: post.status,
      }),
      markdown
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, serialized, "utf8");
    files.push({
      path: path.relative(root, destination).split(path.sep).join("/"),
      sha256: hash(serialized),
      entityType: "post",
      slug: post.slug,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
    });
  }

  for (const item of itemRows) {
    const collection = collectionById.get(item.collectionId);
    if (!collection) throw new Error(`专栏文档 ${item.slug} 缺少专栏`);
    const destination = safeDocumentPath(
      root,
      item.legacySourcePath,
      `collections/${collection.slug}/${item.slug}.md`
    );
    const markdown = await restoreAssets(item.contentMarkdown, destination);
    const serialized = serializeMarkdown(
      {
        title: item.title,
        slug: item.slug,
        order: item.sortOrder,
        status: item.status,
        excerpt: item.excerpt,
      },
      markdown
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, serialized, "utf8");
    files.push({
      path: path.relative(root, destination).split(path.sep).join("/"),
      sha256: hash(serialized),
      entityType: "collection_item",
      slug: item.slug,
      createdAt: item.createdAt,
      publishedAt: null,
    });
  }

  const manifest: MarkdownBackupManifest = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      posts: postRows.length,
      collectionItems: itemRows.length,
      assets: exportedAssetKeys.size,
    },
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    assets: assetRows
      .filter((asset) => exportedAssetKeys.has(asset.objectKey))
      .map((asset) => ({ objectKey: asset.objectKey, sha256: asset.sha256 }))
      .sort((a, b) => a.objectKey.localeCompare(b.objectKey)),
    categories: categoryRows
      .map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
    collections: collectionRows
      .map((collection) => ({
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        label: collection.label,
        badge: collection.badge,
        noindex: collection.noindex,
        sortOrder: collection.sortOrder,
      }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
  };
  fs.writeFileSync(
    path.join(root, "backup-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  return manifest;
}
