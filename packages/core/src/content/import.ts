import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { DbHandle } from "../db/client";
import { categories, posts, postTags, tags } from "../db/schema";
import { OFFICIAL_CATEGORY_SEEDS, UNCATEGORIZED } from "../config";
import { contentRoot } from "../paths";
import { computePostFileMeta, listMarkdownFiles } from "./scan";
import { nowIso } from "../utils/text";

/** 种子分类：官方四类 + 未分类兜底。已存在（按 slug）则不覆盖，保护管理端后续编辑。 */
export function seedCategories(handle: DbHandle): void {
  const now = nowIso();
  const existing = new Set(
    handle.db.select({ slug: categories.slug }).from(categories).all()
      .map((row) => row.slug)
  );

  OFFICIAL_CATEGORY_SEEDS.forEach((seed, index) => {
    if (existing.has(seed.slug)) return;
    handle.db
      .insert(categories)
      .values({
        slug: seed.slug,
        name: seed.name,
        description: seed.description,
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });

  if (!existing.has(UNCATEGORIZED.slug)) {
    handle.db
      .insert(categories)
      .values({
        slug: UNCATEGORIZED.slug,
        name: UNCATEGORIZED.name,
        description: UNCATEGORIZED.description,
        sortOrder: UNCATEGORIZED.sortOrder,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

interface CategoryLookup {
  bySlug: Map<string, number>;
  byName: Map<string, number>;
  uncategorizedId: number;
}

function loadCategoryLookup(handle: DbHandle): CategoryLookup {
  const rows = handle.db.select().from(categories).all();
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  const byName = new Map(rows.map((row) => [row.name, row.id]));
  const uncategorizedId = bySlug.get(UNCATEGORIZED.slug);
  if (!uncategorizedId) {
    throw new Error("缺少未分类兜底分类，请先执行 seedCategories");
  }
  return { bySlug, byName, uncategorizedId };
}

/** 复刻原 resolveCategory 优先级：frontmatter(slug或名称) → 路径首段(slug) → 未分类 */
export function resolveCategoryId(
  lookup: CategoryLookup,
  categoryRaw: string | null,
  pathCategorySlug: string
): number {
  if (categoryRaw) {
    const matched =
      lookup.bySlug.get(categoryRaw) ?? lookup.byName.get(categoryRaw);
    if (matched) return matched;
  }
  const pathMatched = lookup.bySlug.get(pathCategorySlug);
  if (pathMatched) return pathMatched;
  return lookup.uncategorizedId;
}

export interface ImportSummary {
  scanned: number;
  created: number;
  updated: number;
  unchanged: number;
  deleted: number;
  warnings: string[];
}

const POSTS_PREFIX = "posts/";

/**
 * 全量导入/对账：以文件为准 upsert（by filePath），文件消失则删除记录（FR-2.2/2.4，幂等）。
 * 仅管理 posts/ 前缀的记录；collections/ 由 collections 导入负责。
 */
export function importPosts(
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

  const postsDir = path.join(contentDir, "posts");
  const files = listMarkdownFiles(postsDir).map((rel) => POSTS_PREFIX + rel);
  summary.scanned = files.length;

  const metas = files.map((filePath) => {
    const raw = fs.readFileSync(path.join(contentDir, filePath), "utf8");
    const meta = computePostFileMeta(filePath.slice(POSTS_PREFIX.length), raw);
    return { ...meta, filePath };
  });

  // slug 冲突检查：DB 有唯一约束，提前给出可读错误
  const bySlug = new Map<string, string[]>();
  metas.forEach((meta) => {
    bySlug.set(meta.slug, [...(bySlug.get(meta.slug) || []), meta.filePath]);
  });
  const dups = [...bySlug.entries()].filter(([, paths]) => paths.length > 1);
  if (dups.length > 0) {
    throw new Error(
      "存在重复 slug，无法导入：\n" +
        dups.map(([slug, paths]) => `  ${slug}: ${paths.join(", ")}`).join("\n")
    );
  }

  const lookup = loadCategoryLookup(handle);
  const existingRows = handle.db.select().from(posts).all()
    .filter((row) => row.filePath.startsWith(POSTS_PREFIX));
  const existingByPath = new Map(existingRows.map((row) => [row.filePath, row]));
  const seenPaths = new Set<string>();
  const now = nowIso();

  const tx = handle.sqlite.transaction(() => {
    for (const meta of metas) {
      seenPaths.add(meta.filePath);
      const categoryId = resolveCategoryId(
        lookup,
        meta.categoryRaw,
        meta.pathCategorySlug
      );
      const desired = {
        slug: meta.slug,
        title: meta.title,
        excerpt: meta.excerpt,
        status: meta.status,
        categoryId,
        coverImage: meta.coverImage,
        date: meta.date,
        updatedAt: meta.updatedAt,
      };

      const existing = existingByPath.get(meta.filePath);
      let postId: number;
      if (!existing) {
        const inserted = handle.db
          .insert(posts)
          .values({ ...desired, filePath: meta.filePath, createdAt: now })
          .returning({ id: posts.id })
          .all();
        postId = inserted[0].id;
        summary.created += 1;
      } else {
        postId = existing.id;
        const changed =
          existing.slug !== desired.slug ||
          existing.title !== desired.title ||
          existing.excerpt !== desired.excerpt ||
          existing.status !== desired.status ||
          existing.categoryId !== desired.categoryId ||
          (existing.coverImage ?? null) !== (desired.coverImage ?? null) ||
          existing.date !== desired.date ||
          (existing.updatedAt ?? null) !== (desired.updatedAt ?? null);
        if (changed) {
          handle.db.update(posts).set(desired).where(eq(posts.id, postId)).run();
          summary.updated += 1;
        } else {
          summary.unchanged += 1;
        }
      }

      syncPostTags(handle, postId, meta.tags);
    }

    // 文件已删除的记录同步删除
    for (const row of existingRows) {
      if (!seenPaths.has(row.filePath)) {
        handle.db.delete(posts).where(eq(posts.id, row.id)).run();
        summary.deleted += 1;
      }
    }
  });
  tx();

  return summary;
}

export function syncPostTags(
  handle: DbHandle,
  postId: number,
  tagNames: string[]
): void {
  handle.db.delete(postTags).where(eq(postTags.postId, postId)).run();

  tagNames.forEach((name, position) => {
    let tagRow = handle.db.select().from(tags).where(eq(tags.name, name)).get();
    if (!tagRow) {
      tagRow = handle.db
        .insert(tags)
        .values({ name })
        .returning()
        .get();
    }
    handle.db
      .insert(postTags)
      .values({ postId, tagId: tagRow!.id, position })
      .run();
  });
}

export interface DriftItem {
  filePath: string;
  kind: "missing-in-db" | "missing-file" | "field-diff";
  detail: string;
}

/** 漂移检测（FR-2.5）：对比文件 frontmatter 与数据库，仅报告不修改 */
export function driftCheckPosts(
  handle: DbHandle,
  contentDir: string = contentRoot()
): DriftItem[] {
  const items: DriftItem[] = [];
  const postsDir = path.join(contentDir, "posts");
  const files = listMarkdownFiles(postsDir).map((rel) => POSTS_PREFIX + rel);
  const lookup = loadCategoryLookup(handle);

  const rows = handle.db.select().from(posts).all()
    .filter((row) => row.filePath.startsWith(POSTS_PREFIX));
  const rowsByPath = new Map(rows.map((row) => [row.filePath, row]));
  const tagRows = handle.db
    .select({
      postId: postTags.postId,
      name: tags.name,
      position: postTags.position,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .all();
  const tagsByPost = new Map<number, string[]>();
  tagRows
    .sort((a, b) => a.position - b.position)
    .forEach((row) => {
      tagsByPost.set(row.postId, [
        ...(tagsByPost.get(row.postId) || []),
        row.name,
      ]);
    });

  for (const filePath of files) {
    const raw = fs.readFileSync(path.join(contentDir, filePath), "utf8");
    const meta = computePostFileMeta(filePath.slice(POSTS_PREFIX.length), raw);
    const row = rowsByPath.get(filePath);
    if (!row) {
      items.push({
        filePath,
        kind: "missing-in-db",
        detail: "文件存在但数据库无记录，请执行 content:import",
      });
      continue;
    }

    const categoryId = resolveCategoryId(
      lookup,
      meta.categoryRaw,
      meta.pathCategorySlug
    );
    const diffs: string[] = [];
    if (row.slug !== meta.slug) diffs.push(`slug: db=${row.slug} file=${meta.slug}`);
    if (row.title !== meta.title) diffs.push("title");
    if (row.excerpt !== meta.excerpt) diffs.push("excerpt");
    if (row.status !== meta.status)
      diffs.push(`status: db=${row.status} file=${meta.status}`);
    if (row.categoryId !== categoryId) diffs.push("category");
    if ((row.coverImage ?? null) !== (meta.coverImage ?? null))
      diffs.push("coverImage");
    if (row.date !== meta.date) diffs.push("date");
    if ((row.updatedAt ?? null) !== (meta.updatedAt ?? null))
      diffs.push("updatedAt");
    const dbTags = tagsByPost.get(row.id) || [];
    if (JSON.stringify(dbTags) !== JSON.stringify(meta.tags)) diffs.push("tags");

    if (diffs.length > 0) {
      items.push({
        filePath,
        kind: "field-diff",
        detail: diffs.join(", "),
      });
    }
  }

  const filesSet = new Set(files);
  for (const row of rows) {
    if (!filesSet.has(row.filePath)) {
      items.push({
        filePath: row.filePath,
        kind: "missing-file",
        detail: "数据库有记录但文件缺失",
      });
    }
  }

  return items;
}
