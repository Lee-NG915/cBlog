import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb, type DbHandle } from "../db/client";
import { categories, posts, type PostStatus } from "../db/schema";
import { assertValidSlug, contentAbsPath, contentRoot } from "../paths";
import {
  buildOrderedFrontmatter,
  parseMarkdown,
  serializeMarkdown,
} from "../content/frontmatter";
import { moveToTrash, writeFileAtomic } from "../content/files";
import { syncPostTags } from "../content/import";
import { nowIso } from "../utils/text";

export interface CreatePostInput {
  title: string;
  slug: string;
  categorySlug: string;
}

export interface SavePostPatch {
  title?: string;
  date?: string;
  updatedAt?: string | null;
  excerpt?: string;
  tags?: string[];
  coverImage?: string | null;
  categorySlug?: string;
  content?: string;
}

function getCategoryOrThrow(handle: DbHandle, slug: string) {
  const row = handle.db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();
  if (!row) throw new Error(`分类不存在: ${slug}`);
  return row;
}

function getPostOrThrow(handle: DbHandle, id: number) {
  const row = handle.db.select().from(posts).where(eq(posts.id, id)).get();
  if (!row) throw new Error(`文章不存在: id=${id}`);
  return row;
}

/** 新建文章：脚手架 content/posts/<分类>/<年份>/<slug>/index.md + 入库（FR-3.2） */
export function createPost(
  input: CreatePostInput,
  handle: DbHandle = getDb()
): number {
  const title = input.title.trim();
  const slug = input.slug.trim();
  if (!title) throw new Error("标题不能为空");
  assertValidSlug(slug);

  const existing = handle.db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .get();
  if (existing) throw new Error(`slug 已存在: ${slug}`);

  const category = getCategoryOrThrow(handle, input.categorySlug);
  const year = new Date().getFullYear();
  const filePath = `posts/${category.slug}/${year}/${slug}/index.md`;
  const absPath = contentAbsPath(filePath);
  if (fs.existsSync(absPath)) throw new Error(`文件已存在: ${filePath}`);

  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = buildOrderedFrontmatter({
    title,
    slug,
    date: today,
    category: category.slug,
    tags: [],
    excerpt: "",
    status: "draft",
  });
  writeFileAtomic(absPath, serializeMarkdown(frontmatter, "正文从这里开始。\n"));

  try {
    const now = nowIso();
    const inserted = handle.db
      .insert(posts)
      .values({
        slug,
        title,
        excerpt: "",
        status: "draft",
        categoryId: category.id,
        filePath,
        date: today,
        createdAt: now,
      })
      .returning({ id: posts.id })
      .get();
    return inserted!.id;
  } catch (error) {
    fs.rmSync(path.dirname(absPath), { recursive: true, force: true });
    throw error;
  }
}

/**
 * 保存文章（FR-2.3/FR-3.3/3.4）：
 * 组装 frontmatter+正文 → 原子写文件 → 数据库事务；数据库失败回写旧文件（§5 保存事务）。
 */
export function savePost(
  id: number,
  patch: SavePostPatch,
  handle: DbHandle = getDb()
): void {
  const row = getPostOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const oldRaw = fs.readFileSync(absPath, "utf8");
  const { data: oldData, content: oldContent } = parseMarkdown(oldRaw);

  const category = patch.categorySlug
    ? getCategoryOrThrow(handle, patch.categorySlug)
    : getCategoryOrThrow(
        handle,
        handle.db
          .select()
          .from(categories)
          .where(eq(categories.id, row.categoryId))
          .get()!.slug
      );

  const next = {
    title: (patch.title ?? row.title).trim(),
    date: patch.date ?? row.date,
    updatedAt:
      patch.updatedAt === undefined
        ? row.updatedAt ?? undefined
        : patch.updatedAt ?? undefined,
    excerpt: patch.excerpt ?? row.excerpt,
    tags: patch.tags ?? currentTags(handle, id),
    coverImage:
      patch.coverImage === undefined
        ? row.coverImage ?? undefined
        : patch.coverImage ?? undefined,
    content: patch.content ?? oldContent,
  };
  if (!next.title) throw new Error("标题不能为空");

  const frontmatter = buildOrderedFrontmatter(
    {
      title: next.title,
      slug: row.slug,
      date: next.date,
      updatedAt: next.updatedAt,
      category: category.slug,
      tags: next.tags,
      excerpt: next.excerpt,
      coverImage: next.coverImage,
      status: row.status,
    },
    oldData
  );
  writeFileAtomic(absPath, serializeMarkdown(frontmatter, next.content));

  try {
    const tx = handle.sqlite.transaction(() => {
      handle.db
        .update(posts)
        .set({
          title: next.title,
          date: next.date,
          updatedAt: next.updatedAt ?? null,
          excerpt: next.excerpt,
          coverImage: next.coverImage ?? null,
          categoryId: category.id,
        })
        .where(eq(posts.id, id))
        .run();
      syncPostTags(handle, id, next.tags);
    });
    tx();
  } catch (error) {
    writeFileAtomic(absPath, oldRaw); // 回滚文件，避免两边分叉
    throw error;
  }
}

/** 状态流转（FR-3.5）：写库 + 回写 frontmatter.status */
export function setPostStatus(
  id: number,
  status: PostStatus,
  handle: DbHandle = getDb()
): void {
  const row = getPostOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const oldRaw = fs.readFileSync(absPath, "utf8");
  const { data, content } = parseMarkdown(oldRaw);

  const frontmatter = { ...data, status };
  writeFileAtomic(absPath, serializeMarkdown(frontmatter, content));

  try {
    handle.db.update(posts).set({ status }).where(eq(posts.id, id)).run();
  } catch (error) {
    writeFileAtomic(absPath, oldRaw);
    throw error;
  }
}

/** 软删除（FR-3.6）：整个文章目录移入 content/.trash/，数据库记录删除 */
export function deletePost(id: number, handle: DbHandle = getDb()): void {
  const row = getPostOrThrow(handle, id);
  const absPath = contentAbsPath(row.filePath);
  const postDir = path.dirname(absPath);
  const trashRoot = path.join(contentRoot(), ".trash");

  handle.db.delete(posts).where(eq(posts.id, id)).run();
  moveToTrash(postDir, trashRoot);
}

function currentTags(handle: DbHandle, postId: number): string[] {
  const rows = handle.sqlite
    .prepare(
      `SELECT t.name FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id = ? ORDER BY pt.position`
    )
    .all(postId) as Array<{ name: string }>;
  return rows.map((row) => row.name);
}
