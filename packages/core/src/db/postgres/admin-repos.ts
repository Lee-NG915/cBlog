import { asc, desc, eq, sql } from "drizzle-orm";
import { assertValidCollectionSlug, assertValidSlug } from "../../paths";
import type { PostgresDbHandle } from "./client";
import {
  assets,
  categories,
  collectionItems,
  collections,
  contentRevisions,
  posts,
  postTags,
  tags,
} from "./schema";

/** 与 SQLite 世代保持一致的兜底分类 slug；不可删除 */
const PROTECTED_CATEGORY_SLUG = "uncategorized";
const UNCATEGORIZED_SORT_ORDER = 999;

function nowIso(): string {
  return new Date().toISOString();
}

export interface AdminCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  postCount: number;
}

export class PostgresCategoryRepository {
  constructor(private readonly handle: PostgresDbHandle) {}

  async list(): Promise<AdminCategoryRow[]> {
    return this.handle.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        sortOrder: categories.sortOrder,
        // 显式限定表名，避免 drizzle 子查询剥离限定符（见 public-reader 同注）
        postCount: sql<number>`(
          select count(*)::int from posts p
          where p.category_id = categories.id
        )`,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  }

  async getBySlug(slug: string) {
    const [row] = await this.handle.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return row ?? null;
  }

  async create(input: {
    slug: string;
    name: string;
    description?: string;
  }): Promise<string> {
    const slug = input.slug.trim();
    const name = input.name.trim();
    assertValidSlug(slug);
    if (!name) throw new Error("分类名称不能为空");
    if (slug === PROTECTED_CATEGORY_SLUG) throw new Error("该 slug 为系统保留");

    const [existing] = await this.handle.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (existing) throw new Error(`分类 slug 已存在: ${slug}`);

    const [{ max }] = await this.handle.db
      .select({ max: sql<number | null>`max(${categories.sortOrder})` })
      .from(categories)
      .where(sql`${categories.sortOrder} < ${UNCATEGORIZED_SORT_ORDER}`);
    const now = nowIso();
    const [created] = await this.handle.db
      .insert(categories)
      .values({
        slug,
        name,
        description: input.description?.trim() ?? "",
        sortOrder: (max ?? -1) + 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: categories.id });
    return created.id;
  }

  async update(
    id: string,
    patch: { name?: string; description?: string; sortOrder?: number }
  ): Promise<void> {
    const [row] = await this.handle.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!row) throw new Error("分类不存在");
    await this.handle.db
      .update(categories)
      .set({
        name: patch.name?.trim() || row.name,
        description: patch.description ?? row.description,
        sortOrder: patch.sortOrder ?? row.sortOrder,
        updatedAt: nowIso(),
      })
      .where(eq(categories.id, id));
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.handle.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!row) throw new Error("分类不存在");
    if (row.slug === PROTECTED_CATEGORY_SLUG) {
      throw new Error("系统兜底分类不可删除");
    }
    const [{ count }] = await this.handle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(eq(posts.categoryId, id));
    if (count > 0) throw new Error(`分类下还有 ${count} 篇文章，不可删除`);
    await this.handle.db.delete(categories).where(eq(categories.id, id));
  }
}

export interface AdminCollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string | null;
  noindex: boolean;
  sortOrder: number;
  itemCount: number;
}

export class PostgresCollectionRepository {
  constructor(private readonly handle: PostgresDbHandle) {}

  async list(): Promise<AdminCollectionRow[]> {
    return this.handle.db
      .select({
        id: collections.id,
        slug: collections.slug,
        name: collections.name,
        description: collections.description,
        label: collections.label,
        badge: collections.badge,
        noindex: collections.noindex,
        sortOrder: collections.sortOrder,
        itemCount: sql<number>`(
          select count(*)::int from collection_items i
          where i.collection_id = collections.id
        )`,
      })
      .from(collections)
      .orderBy(asc(collections.sortOrder), asc(collections.createdAt));
  }

  async getById(id: string) {
    const [row] = await this.handle.db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);
    return row ?? null;
  }

  async create(input: {
    slug: string;
    name: string;
    description?: string;
    label?: string;
    badge?: string | null;
    noindex?: boolean;
  }): Promise<string> {
    const slug = input.slug.trim();
    const name = input.name.trim();
    assertValidCollectionSlug(slug);
    if (!name) throw new Error("专栏名称不能为空");

    const [existing] = await this.handle.db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);
    if (existing) throw new Error(`专栏 slug 已存在: ${slug}`);

    const [{ max }] = await this.handle.db
      .select({ max: sql<number | null>`max(${collections.sortOrder})` })
      .from(collections);
    const now = nowIso();
    const [created] = await this.handle.db
      .insert(collections)
      .values({
        slug,
        name,
        description: input.description?.trim() ?? "",
        label: input.label?.trim() || "Collection",
        badge: input.badge?.trim() || null,
        noindex: input.noindex !== false,
        sortOrder: (max ?? -1) + 1,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: collections.id });
    return created.id;
  }

  async update(
    id: string,
    patch: {
      name?: string;
      description?: string;
      label?: string;
      badge?: string | null;
      noindex?: boolean;
      sortOrder?: number;
    }
  ): Promise<void> {
    const [row] = await this.handle.db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);
    if (!row) throw new Error("专栏不存在");
    await this.handle.db
      .update(collections)
      .set({
        name: patch.name?.trim() || row.name,
        description: patch.description ?? row.description,
        label: patch.label?.trim() || row.label,
        badge:
          patch.badge === undefined ? row.badge : patch.badge?.trim() || null,
        noindex: patch.noindex ?? row.noindex,
        sortOrder: patch.sortOrder ?? row.sortOrder,
        updatedAt: nowIso(),
      })
      .where(eq(collections.id, id));
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.handle.db
      .select()
      .from(collections)
      .where(eq(collections.id, id))
      .limit(1);
    if (!row) throw new Error("专栏不存在");
    const [{ count }] = await this.handle.db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, id));
    if (count > 0) throw new Error(`专栏下还有 ${count} 个文档，不可删除`);
    await this.handle.db.delete(collections).where(eq(collections.id, id));
  }

  /**
   * 拖拽排序：按传入顺序重排 sortOrder（1..n）。
   * 属元数据批量调整，不产生内容 revision；版本号递增以失效并发编辑。
   */
  async reorderItems(collectionId: string, orderedIds: string[]): Promise<void> {
    const rows = await this.handle.db
      .select({ id: collectionItems.id, sortOrder: collectionItems.sortOrder })
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId));
    const known = new Set(rows.map((row) => row.id));
    if (
      orderedIds.length !== rows.length ||
      orderedIds.some((id) => !known.has(id))
    ) {
      throw new Error("排序列表与专栏文档不匹配");
    }
    const now = nowIso();
    await this.handle.db.transaction(async (tx) => {
      for (const [index, id] of orderedIds.entries()) {
        await tx
          .update(collectionItems)
          .set({
            sortOrder: index + 1,
            version: sql`${collectionItems.version} + 1`,
            updatedAt: now,
          })
          .where(eq(collectionItems.id, id));
      }
    });
  }
}

export interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  editorialDate: string | null;
  updatedAt: string;
  coverAssetId: string | null;
  coverExternalUrl: string | null;
  version: number;
  contentMarkdown: string;
}

export interface AdminItemRow {
  id: string;
  collectionId: string;
  collectionSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "published" | "archived";
  sortOrder: number;
  version: number;
  contentMarkdown: string;
}

/**
 * Admin 后台（PostgreSQL 模式）的跨状态查询与级联删除。
 * 与 published-only 的 PublicContentReader 分离：本类允许读取 draft/archived，
 * 只能在已鉴权的 /api/v1/admin/** 路由内使用。
 */
export class PostgresAdminContentStore {
  constructor(private readonly handle: PostgresDbHandle) {}

  private async tagsByPost(): Promise<Map<string, string[]>> {
    const rows = await this.handle.db
      .select({
        postId: postTags.postId,
        name: tags.name,
        position: postTags.position,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .orderBy(asc(postTags.position));
    const result = new Map<string, string[]>();
    for (const row of rows) {
      result.set(row.postId, [...(result.get(row.postId) ?? []), row.name]);
    }
    return result;
  }

  async listPosts(): Promise<AdminPostRow[]> {
    const [postRows, categoryRows, tagMap] = await Promise.all([
      this.handle.db
        .select()
        .from(posts)
        .orderBy(
          sql`${posts.editorialDate} desc nulls last`,
          desc(posts.createdAt)
        ),
      this.handle.db.select().from(categories),
      this.tagsByPost(),
    ]);
    const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
    return postRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status,
      categoryId: row.categoryId,
      categorySlug: categoryById.get(row.categoryId)?.slug ?? "",
      categoryName: categoryById.get(row.categoryId)?.name ?? "",
      tags: tagMap.get(row.id) ?? [],
      editorialDate: row.editorialDate,
      updatedAt: row.updatedAt,
      coverAssetId: row.coverAssetId,
      coverExternalUrl: row.coverExternalUrl,
      version: row.version,
      contentMarkdown: row.contentMarkdown,
    }));
  }

  async getPostById(id: string): Promise<AdminPostRow | null> {
    const all = await this.listPosts();
    return all.find((row) => row.id === id) ?? null;
  }

  /** 级联删除文章及其 revision/标签关联（staging 语义，Phase 6 将由 delete 事件接管） */
  async deletePostCascade(id: string): Promise<void> {
    await this.handle.db.transaction(async (tx) => {
      await tx.delete(contentRevisions).where(eq(contentRevisions.postId, id));
      await tx.delete(postTags).where(eq(postTags.postId, id));
      const deleted = await tx
        .delete(posts)
        .where(eq(posts.id, id))
        .returning({ id: posts.id });
      if (deleted.length === 0) throw new Error("文章不存在");
    });
  }

  async getItemById(id: string): Promise<AdminItemRow | null> {
    const [row] = await this.handle.db
      .select()
      .from(collectionItems)
      .where(eq(collectionItems.id, id))
      .limit(1);
    if (!row) return null;
    const [collection] = await this.handle.db
      .select({ slug: collections.slug })
      .from(collections)
      .where(eq(collections.id, row.collectionId))
      .limit(1);
    return {
      id: row.id,
      collectionId: row.collectionId,
      collectionSlug: collection?.slug ?? "",
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status,
      sortOrder: row.sortOrder,
      version: row.version,
      contentMarkdown: row.contentMarkdown,
    };
  }

  async listItems(collectionId: string): Promise<AdminItemRow[]> {
    const [collection] = await this.handle.db
      .select({ slug: collections.slug })
      .from(collections)
      .where(eq(collections.id, collectionId))
      .limit(1);
    if (!collection) throw new Error("专栏不存在");
    const rows = await this.handle.db
      .select()
      .from(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId))
      .orderBy(asc(collectionItems.sortOrder), asc(collectionItems.title));
    return rows.map((row) => ({
      id: row.id,
      collectionId: row.collectionId,
      collectionSlug: collection.slug,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status,
      sortOrder: row.sortOrder,
      version: row.version,
      contentMarkdown: row.contentMarkdown,
    }));
  }

  async deleteItemCascade(id: string): Promise<void> {
    await this.handle.db.transaction(async (tx) => {
      await tx
        .delete(contentRevisions)
        .where(eq(contentRevisions.collectionItemId, id));
      const deleted = await tx
        .delete(collectionItems)
        .where(eq(collectionItems.id, id))
        .returning({ id: collectionItems.id });
      if (deleted.length === 0) throw new Error("专栏文档不存在");
    });
  }

  /** 上传去重：sha256 唯一，已存在时直接复用既有对象记录 */
  async upsertAssetBySha(input: {
    sha256: string;
    objectKey: string;
    originalName: string;
    mimeType: string;
    byteSize: number;
    publicUrl: string;
  }): Promise<{ id: string; publicUrl: string }> {
    const [inserted] = await this.handle.db
      .insert(assets)
      .values(input)
      .onConflictDoNothing({ target: assets.sha256 })
      .returning({ id: assets.id, publicUrl: assets.publicUrl });
    if (inserted) return inserted;
    const [existing] = await this.handle.db
      .select({ id: assets.id, publicUrl: assets.publicUrl })
      .from(assets)
      .where(eq(assets.sha256, input.sha256))
      .limit(1);
    if (!existing) throw new Error("资产写入失败");
    return existing;
  }

  async findAssetByPublicUrl(
    publicUrl: string
  ): Promise<{ id: string } | null> {
    const [row] = await this.handle.db
      .select({ id: assets.id })
      .from(assets)
      .where(eq(assets.publicUrl, publicUrl))
      .limit(1);
    return row ?? null;
  }

  async assetPublicUrl(id: string): Promise<string | null> {
    const [row] = await this.handle.db
      .select({ publicUrl: assets.publicUrl })
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1);
    return row?.publicUrl ?? null;
  }

  /** 编辑器预览用：正文中 asset:// 引用到公开 URL 的映射（保存仍写 asset://） */
  async assetUrlMap(markdown: string): Promise<Record<string, string>> {
    const ids = [
      ...new Set(markdown.match(/(?<=asset:\/\/)[0-9a-f-]{36}/gi) ?? []),
    ];
    const result: Record<string, string> = {};
    for (const id of ids) {
      const url = await this.assetPublicUrl(id);
      if (url) result[id] = url;
    }
    return result;
  }
}
