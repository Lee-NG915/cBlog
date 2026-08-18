import { and, asc, desc, eq, sql } from "drizzle-orm";
import type {
  PublicCategoryDto,
  PublicCollectionDetailDto,
  PublicCollectionItemDetailDto,
  PublicCollectionItemSummaryDto,
  PublicCollectionSummaryDto,
  PublicPostDetailDto,
  PublicPostSummaryDto,
  PublicSiteDto,
  PublicSitemapDto,
} from "../../api/dto";
import type { PostgresDbHandle } from "./client";
import {
  assets,
  categories,
  collectionItems,
  collections,
  posts,
  postTags,
  tags,
} from "./schema";

/**
 * Public Content API 的只读查询层：所有查询在 SQL 层硬编码
 * status = 'published'（§11.4），draft/archived/不存在对上层同样呈现为 null。
 */
export class PostgresPublicContentReader {
  constructor(private readonly handle: PostgresDbHandle) {}

  private async resolveAssetUrls(markdown: string): Promise<string> {
    const ids = [
      ...new Set(markdown.match(/(?<=asset:\/\/)[0-9a-f-]{36}/gi) ?? []),
    ];
    if (ids.length === 0) return markdown;
    const rows = await this.handle.db
      .select({ id: assets.id, publicUrl: assets.publicUrl })
      .from(assets);
    const urlById = new Map(rows.map((row) => [row.id, row.publicUrl]));
    let resolved = markdown;
    for (const id of ids) {
      const url = urlById.get(id);
      if (!url) throw new Error(`正文引用不存在的资产: ${id}`);
      resolved = resolved.replaceAll(`asset://${id}`, url);
    }
    return resolved;
  }

  private async coverUrl(
    coverAssetId: string | null,
    coverExternalUrl: string | null
  ): Promise<string | null> {
    if (coverExternalUrl) return coverExternalUrl;
    if (!coverAssetId) return null;
    const [row] = await this.handle.db
      .select({ publicUrl: assets.publicUrl })
      .from(assets)
      .where(eq(assets.id, coverAssetId))
      .limit(1);
    return row?.publicUrl ?? null;
  }

  private async tagsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
    const result = new Map<string, string[]>();
    if (postIds.length === 0) return result;
    const rows = await this.handle.db
      .select({
        postId: postTags.postId,
        name: tags.name,
        position: postTags.position,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .orderBy(asc(postTags.position));
    for (const row of rows) {
      if (!postIds.includes(row.postId)) continue;
      result.set(row.postId, [...(result.get(row.postId) ?? []), row.name]);
    }
    return result;
  }

  private async publishedPostRows(categorySlug?: string) {
    const conditions = [eq(posts.status, "published" as const)];
    if (categorySlug) {
      const [category] = await this.handle.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (!category) return [];
      conditions.push(eq(posts.categoryId, category.id));
    }
    return this.handle.db
      .select()
      .from(posts)
      .where(and(...conditions))
      .orderBy(
        sql`${posts.editorialDate} desc nulls last`,
        desc(posts.createdAt)
      );
  }

  private async toSummaries(
    rows: Awaited<ReturnType<typeof this.publishedPostRows>>
  ): Promise<PublicPostSummaryDto[]> {
    const categoryRows = await this.handle.db.select().from(categories);
    const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
    const tagMap = await this.tagsForPosts(rows.map((row) => row.id));
    return Promise.all(
      rows.map(async (row) => ({
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        categorySlug: categoryById.get(row.categoryId)?.slug ?? "",
        categoryName: categoryById.get(row.categoryId)?.name ?? "",
        tags: tagMap.get(row.id) ?? [],
        editorialDate: row.editorialDate,
        readingMinutes: row.readingMinutes,
        coverUrl: await this.coverUrl(row.coverAssetId, row.coverExternalUrl),
        contentVersion: row.version,
      }))
    );
  }

  async getPosts(options?: {
    categorySlug?: string;
    limit?: number;
  }): Promise<PublicPostSummaryDto[]> {
    const rows = await this.publishedPostRows(options?.categorySlug);
    const limited =
      options?.limit && options.limit > 0 ? rows.slice(0, options.limit) : rows;
    return this.toSummaries(limited);
  }

  async getPost(slug: string): Promise<PublicPostDetailDto | null> {
    const [row] = await this.handle.db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
      .limit(1);
    if (!row) return null;
    const [summary] = await this.toSummaries([row]);
    return {
      ...summary,
      contentMarkdown: await this.resolveAssetUrls(row.contentMarkdown),
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
    };
  }

  async getCategories(): Promise<PublicCategoryDto[]> {
    const rows = await this.handle.db
      .select({
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        sortOrder: categories.sortOrder,
        // 显式限定表名：drizzle 在关联子查询中会剥离列限定符，导致自比较恒 false
        publishedCount: sql<number>`(
          select count(*)::int from posts p
          where p.category_id = categories.id
            and p.status = 'published'
        )`,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
    return rows;
  }

  private async collectionSummaries(): Promise<PublicCollectionSummaryDto[]> {
    const rows = await this.handle.db
      .select({
        slug: collections.slug,
        name: collections.name,
        description: collections.description,
        label: collections.label,
        badge: collections.badge,
        noindex: collections.noindex,
        sortOrder: collections.sortOrder,
        publishedItemCount: sql<number>`(
          select count(*)::int from collection_items i
          where i.collection_id = collections.id
            and i.status = 'published'
        )`,
      })
      .from(collections)
      .orderBy(asc(collections.sortOrder), asc(collections.createdAt));
    return rows;
  }

  async getCollections(): Promise<PublicCollectionSummaryDto[]> {
    return this.collectionSummaries();
  }

  private itemToSummary(row: {
    slug: string;
    title: string;
    excerpt: string;
    sortOrder: number;
    readingMinutes: number;
    version: number;
  }): PublicCollectionItemSummaryDto {
    return {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      sortOrder: row.sortOrder,
      readingMinutes: row.readingMinutes,
      contentVersion: row.version,
    };
  }

  async getCollection(slug: string): Promise<PublicCollectionDetailDto | null> {
    const summaries = await this.collectionSummaries();
    const summary = summaries.find((item) => item.slug === slug);
    if (!summary) return null;
    const [collection] = await this.handle.db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.slug, slug))
      .limit(1);
    const itemRows = await this.handle.db
      .select()
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, collection.id),
          eq(collectionItems.status, "published")
        )
      )
      .orderBy(asc(collectionItems.sortOrder), asc(collectionItems.title));
    return { ...summary, items: itemRows.map((row) => this.itemToSummary(row)) };
  }

  async getCollectionItem(
    collectionSlug: string,
    itemSlug: string
  ): Promise<PublicCollectionItemDetailDto | null> {
    const [collection] = await this.handle.db
      .select({ id: collections.id })
      .from(collections)
      .where(eq(collections.slug, collectionSlug))
      .limit(1);
    if (!collection) return null;
    const [row] = await this.handle.db
      .select()
      .from(collectionItems)
      .where(
        and(
          eq(collectionItems.collectionId, collection.id),
          eq(collectionItems.slug, itemSlug),
          eq(collectionItems.status, "published")
        )
      )
      .limit(1);
    if (!row) return null;
    return {
      ...this.itemToSummary(row),
      contentMarkdown: await this.resolveAssetUrls(row.contentMarkdown),
      updatedAt: row.updatedAt,
    };
  }

  async getSite(): Promise<PublicSiteDto> {
    const [categoriesDto, collectionsDto, latestPosts] = await Promise.all([
      this.getCategories(),
      this.getCollections(),
      this.getPosts({ limit: 6 }),
    ]);
    return {
      categories: categoriesDto,
      collections: collectionsDto,
      stats: {
        publishedPosts: categoriesDto.reduce(
          (total, category) => total + category.publishedCount,
          0
        ),
        categories: categoriesDto.length,
        collections: collectionsDto.length,
      },
      latestPosts,
    };
  }

  async getSitemap(): Promise<PublicSitemapDto> {
    const postRows = await this.publishedPostRows();
    const categoriesDto = await this.getCategories();
    const collectionsDto = await this.getCollections();
    const collectionsWithItems = await Promise.all(
      collectionsDto.map(async (collection) => {
        const detail = await this.getCollection(collection.slug);
        return {
          slug: collection.slug,
          noindex: collection.noindex,
          items: (detail?.items ?? []).map((item) => ({ slug: item.slug })),
        };
      })
    );
    return {
      posts: postRows.map((row) => ({
        slug: row.slug,
        editorialDate: row.editorialDate,
        updatedAt: row.updatedAt,
      })),
      categories: categoriesDto.map((category) => ({ slug: category.slug })),
      collections: collectionsWithItems,
    };
  }
}
