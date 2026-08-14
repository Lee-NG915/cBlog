import fs from "node:fs";
import { eq } from "drizzle-orm";
import { getDb, type DbHandle } from "../db/client";
import { categories, posts, postTags, tags, type PostStatus } from "../db/schema";
import { contentAbsPath } from "../paths";
import { parseMarkdown } from "../content/frontmatter";
import { compareByDateDesc } from "../utils/text";

export interface PostMeta {
  id: number;
  slug: string;
  title: string;
  date: string;
  updatedAt?: string;
  categorySlug: string;
  category: string;
  tags: string[];
  excerpt: string;
  status: PostStatus;
  coverImage?: string;
  filePath: string;
}

/** 全部文章元数据（含草稿/归档），date 降序。正文不在此层，用 readPostContent 取。 */
export function listPostMetas(handle: DbHandle = getDb()): PostMeta[] {
  const postRows = handle.db.select().from(posts).all();
  const categoryRows = handle.db.select().from(categories).all();
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));

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

  return postRows
    .map((row) => {
      const category = categoryById.get(row.categoryId);
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        date: row.date,
        updatedAt: row.updatedAt ?? undefined,
        categorySlug: category?.slug ?? "uncategorized",
        category: category?.name ?? "未分类",
        tags: tagsByPost.get(row.id) || [],
        excerpt: row.excerpt,
        status: row.status,
        coverImage: row.coverImage ?? undefined,
        filePath: row.filePath,
      } satisfies PostMeta;
    })
    .sort(compareByDateDesc);
}

/** 读取 md 正文（去除 frontmatter） */
export function readPostContent(filePath: string): string {
  const raw = fs.readFileSync(contentAbsPath(filePath), "utf8");
  return parseMarkdown(raw).content;
}

export function getPostMetaById(
  id: number,
  handle: DbHandle = getDb()
): PostMeta | null {
  return listPostMetas(handle).find((meta) => meta.id === id) ?? null;
}
