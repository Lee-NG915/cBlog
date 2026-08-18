import { getDb, type DbHandle } from "../db/client";
import { categories } from "../db/schema";

export interface CategoryMeta {
  id: number;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

/** 全部分类，按 sortOrder（种子顺序 = 原硬编码顺序）；含 uncategorized 兜底 */
export function listCategories(handle: DbHandle = getDb()): CategoryMeta[] {
  return handle.db
    .select()
    .from(categories)
    .all()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
    }));
}
