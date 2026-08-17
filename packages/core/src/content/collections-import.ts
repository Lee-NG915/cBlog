import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { DbHandle } from "../db/client";
import { collectionItems, collections } from "../db/schema";
import { LEGACY_COLLECTION_SEEDS } from "../config";
import { contentRoot } from "../paths";
import { parseMarkdown } from "./frontmatter";
import { normalizeStatus } from "./scan";
import type { DriftItem, ImportSummary } from "./import";
import { getNoteExcerpt } from "../utils/notes";
import { nowIso } from "../utils/text";

const COLLECTIONS_PREFIX = "collections/";

/** 存量专栏种子：已存在（按 slug）则不覆盖 */
export function seedCollections(handle: DbHandle): void {
  const now = nowIso();
  const existing = new Set(
    handle.db.select({ slug: collections.slug }).from(collections).all()
      .map((row) => row.slug)
  );

  LEGACY_COLLECTION_SEEDS.forEach((seed, index) => {
    if (existing.has(seed.slug)) return;
    handle.db
      .insert(collections)
      .values({
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        label: seed.label,
        badge: seed.badge,
        noindex: seed.noindex,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });
}

export interface CollectionItemFileMeta {
  filePath: string;
  collectionSlug: string;
  slug: string;
  title: string;
  sortOrder: number;
  status: "draft" | "published" | "archived";
  excerpt: string;
  content: string;
}

/** 从专栏文档 md 计算导入字段（frontmatter 为准；excerpt 派生自正文首段） */
export function computeItemFileMeta(
  relPath: string,
  raw: string
): CollectionItemFileMeta {
  const { data, content } = parseMarkdown(raw);
  const collectionSlug = relPath.split("/")[0] || "";
  const fileStem = path.posix.basename(relPath, ".md");

  const slug =
    typeof data.slug === "string" && data.slug.trim()
      ? data.slug.trim()
      : fileStem;
  const orderRaw = data.order ?? data.sortOrder;
  const sortOrder =
    typeof orderRaw === "number"
      ? orderRaw
      : Number.parseInt(String(orderRaw ?? "999"), 10) || 999;

  return {
    filePath: COLLECTIONS_PREFIX + relPath,
    collectionSlug,
    slug,
    title: (data.title as string) || fileStem,
    sortOrder,
    status: normalizeStatus(data.status),
    excerpt:
      typeof data.excerpt === "string" && data.excerpt.trim()
        ? data.excerpt.trim()
        : getNoteExcerpt(content),
    content,
  };
}

function scanCollectionFiles(contentDir: string): CollectionItemFileMeta[] {
  const collectionsDir = path.join(contentDir, "collections");
  if (!fs.existsSync(collectionsDir)) return [];

  const metas: CollectionItemFileMeta[] = [];
  for (const dir of fs.readdirSync(collectionsDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const dirPath = path.join(collectionsDir, dir.name);
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".md")) continue;
      const raw = fs.readFileSync(path.join(dirPath, file), "utf8");
      metas.push(computeItemFileMeta(`${dir.name}/${file}`, raw));
    }
  }
  return metas;
}

/** 专栏文档全量导入（以文件为准 upsert by filePath；目录不存在的专栏行自动补建） */
export function importCollections(
  handle: DbHandle,
  contentDir: string = contentRoot()
): ImportSummary {
  const summary: ImportSummary = {
    scanned: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    warnings: [],
  };

  const metas = scanCollectionFiles(contentDir);
  summary.scanned = metas.length;

  // 专栏内 slug 冲突检查
  const byKey = new Map<string, string[]>();
  metas.forEach((meta) => {
    const key = `${meta.collectionSlug}/${meta.slug}`;
    byKey.set(key, [...(byKey.get(key) || []), meta.filePath]);
  });
  const dups = [...byKey.entries()].filter(([, paths]) => paths.length > 1);
  if (dups.length > 0) {
    throw new Error(
      "专栏内存在重复 slug，无法导入：\n" +
        dups.map(([key, paths]) => `  ${key}: ${paths.join(", ")}`).join("\n")
    );
  }

  const now = nowIso();
  const collectionRows = handle.db.select().from(collections).all();
  const collectionBySlug = new Map(collectionRows.map((row) => [row.slug, row]));

  // 目录存在但库中无记录的专栏 → 补建默认行（名称=slug，管理端可再编辑）
  const dirSlugs = [...new Set(metas.map((meta) => meta.collectionSlug))];
  for (const dirSlug of dirSlugs) {
    if (!collectionBySlug.has(dirSlug)) {
      const inserted = handle.db
        .insert(collections)
        .values({
          slug: dirSlug,
          name: dirSlug,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      collectionBySlug.set(dirSlug, inserted!);
      summary.warnings.push(`专栏 ${dirSlug} 无记录，已按默认值补建`);
    }
  }

  const existingRows = handle.db.select().from(collectionItems).all();
  const existingByPath = new Map(existingRows.map((row) => [row.filePath, row]));
  const seenPaths = new Set<string>();

  const tx = handle.sqlite.transaction(() => {
    for (const meta of metas) {
      seenPaths.add(meta.filePath);
      const collection = collectionBySlug.get(meta.collectionSlug)!;
      const desired = {
        collectionId: collection.id,
        slug: meta.slug,
        title: meta.title,
        excerpt: meta.excerpt,
        status: meta.status,
        sortOrder: meta.sortOrder,
      };

      const existing = existingByPath.get(meta.filePath);
      if (!existing) {
        handle.db
          .insert(collectionItems)
          .values({ ...desired, filePath: meta.filePath, createdAt: now, updatedAt: now })
          .run();
        summary.created += 1;
      } else {
        const changed =
          existing.collectionId !== desired.collectionId ||
          existing.slug !== desired.slug ||
          existing.title !== desired.title ||
          existing.excerpt !== desired.excerpt ||
          existing.status !== desired.status ||
          existing.sortOrder !== desired.sortOrder;
        if (changed) {
          handle.db
            .update(collectionItems)
            .set({ ...desired, updatedAt: now })
            .where(eq(collectionItems.id, existing.id))
            .run();
          summary.updated += 1;
        } else {
          summary.unchanged += 1;
        }
      }
    }

    for (const row of existingRows) {
      if (!seenPaths.has(row.filePath)) {
        handle.db
          .delete(collectionItems)
          .where(eq(collectionItems.id, row.id))
          .run();
        summary.deleted += 1;
      }
    }
  });
  tx();

  return summary;
}

/** 专栏文档漂移检测（报告文件与数据库差异，不修改） */
export function driftCheckCollections(
  handle: DbHandle,
  contentDir: string = contentRoot()
): DriftItem[] {
  const items: DriftItem[] = [];
  const metas = scanCollectionFiles(contentDir);
  const metasByPath = new Map(metas.map((meta) => [meta.filePath, meta]));

  const collectionRows = handle.db.select().from(collections).all();
  const collectionById = new Map(collectionRows.map((row) => [row.id, row]));
  const rows = handle.db.select().from(collectionItems).all();
  const rowsByPath = new Map(rows.map((row) => [row.filePath, row]));

  for (const meta of metas) {
    const row = rowsByPath.get(meta.filePath);
    if (!row) {
      items.push({
        filePath: meta.filePath,
        kind: "missing-in-db",
        detail: "文件存在但数据库无记录，请执行 content:import",
      });
      continue;
    }

    const diffs: string[] = [];
    if (row.slug !== meta.slug) diffs.push("slug");
    if (row.title !== meta.title) diffs.push("title");
    if (row.excerpt !== meta.excerpt) diffs.push("excerpt");
    if (row.status !== meta.status) diffs.push("status");
    if (row.sortOrder !== meta.sortOrder) diffs.push("order");
    const rowCollection = collectionById.get(row.collectionId);
    if (rowCollection?.slug !== meta.collectionSlug) diffs.push("collection");

    if (diffs.length > 0) {
      items.push({ filePath: meta.filePath, kind: "field-diff", detail: diffs.join(", ") });
    }
  }

  for (const row of rows) {
    if (!metasByPath.has(row.filePath)) {
      items.push({
        filePath: row.filePath,
        kind: "missing-file",
        detail: "数据库有记录但文件缺失",
      });
    }
  }

  return items;
}
