import fs from "node:fs";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { getDb, type DbHandle } from "../db/client";
import { categories, posts } from "../db/schema";
import { assertValidSlug, contentRoot } from "../paths";
import { UNCATEGORIZED } from "../config";
import { nowIso } from "../utils/text";

export interface CreateCategoryInput {
  slug: string;
  name: string;
  description?: string;
}

/** 新建分类：入库 + 自动创建 content/posts/<slug>/ 目录（FR-4.2） */
export function createCategory(
  input: CreateCategoryInput,
  handle: DbHandle = getDb()
): number {
  const slug = input.slug.trim();
  const name = input.name.trim();
  assertValidSlug(slug);
  if (!name) throw new Error("分类名称不能为空");
  if (slug === UNCATEGORIZED.slug) throw new Error("该 slug 为系统保留");

  const existing = handle.db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();
  if (existing) throw new Error(`分类 slug 已存在: ${slug}`);

  // 排序追加在官方分类之后、未分类(999)之前
  const maxRow = handle.db
    .select({ max: sql<number>`max(sort_order)` })
    .from(categories)
    .where(sql`sort_order < ${UNCATEGORIZED.sortOrder}`)
    .get();
  const sortOrder = (maxRow?.max ?? -1) + 1;

  const now = nowIso();
  const inserted = handle.db
    .insert(categories)
    .values({
      slug,
      name,
      description: input.description?.trim() || "",
      sortOrder,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: categories.id })
    .get();

  fs.mkdirSync(path.join(contentRoot(), "posts", slug), { recursive: true });
  return inserted!.id;
}

export interface UpdateCategoryPatch {
  name?: string;
  description?: string;
  sortOrder?: number;
}

/** 编辑分类（slug 锁定，见 PRD 非目标） */
export function updateCategory(
  id: number,
  patch: UpdateCategoryPatch,
  handle: DbHandle = getDb()
): void {
  const row = handle.db.select().from(categories).where(eq(categories.id, id)).get();
  if (!row) throw new Error(`分类不存在: id=${id}`);

  handle.db
    .update(categories)
    .set({
      name: patch.name?.trim() || row.name,
      description: patch.description ?? row.description,
      sortOrder: patch.sortOrder ?? row.sortOrder,
      updatedAt: nowIso(),
    })
    .where(eq(categories.id, id))
    .run();
}

/** 删除分类：有文章禁止删除（FR-4.2）；空目录一并清理 */
export function deleteCategory(id: number, handle: DbHandle = getDb()): void {
  const row = handle.db.select().from(categories).where(eq(categories.id, id)).get();
  if (!row) throw new Error(`分类不存在: id=${id}`);
  if (row.slug === UNCATEGORIZED.slug) throw new Error("系统兜底分类不可删除");

  const count = handle.db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.categoryId, id))
    .get();
  if ((count?.count ?? 0) > 0) {
    throw new Error(`分类下还有 ${count!.count} 篇文章，不可删除`);
  }

  handle.db.delete(categories).where(eq(categories.id, id)).run();

  const dir = path.join(contentRoot(), "posts", row.slug);
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

/** 分类文章计数（管理端列表用，含全部状态） */
export function countPostsByCategory(
  handle: DbHandle = getDb()
): Map<number, number> {
  const rows = handle.db
    .select({ categoryId: posts.categoryId, count: sql<number>`count(*)` })
    .from(posts)
    .groupBy(posts.categoryId)
    .all();
  return new Map(rows.map((row) => [row.categoryId, row.count]));
}
