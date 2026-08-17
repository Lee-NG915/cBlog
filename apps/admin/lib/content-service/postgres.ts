import type { PostStatus } from "@cblog/core";
import {
  PostgresAdminContentStore,
  type AdminPostRow,
} from "@cblog/core/postgres";
import {
  categoryRepository,
  collectionItemRepository,
  collectionRepository,
  pgHandle,
  postRepository,
} from "@/lib/pg";
import { putObject, validateUploadBytes } from "@/lib/object-storage";
import type {
  AdminCollectionItem,
  AdminPostDetail,
  AdminPostListItem,
  ContentService,
  PostListFilter,
  SavePostPatchInput,
  UploadAssetInput,
} from "./types";

const SCAFFOLD_CONTENT = "正文从这里开始。\n";

function requireVersion(expectedVersion: number | undefined): number {
  if (typeof expectedVersion !== "number") {
    throw new Error("PostgreSQL 模式的写操作必须携带 expectedVersion");
  }
  return expectedVersion;
}

/**
 * v2 staging 实现：PostgreSQL 单一真源。
 * - 保存/状态流转要求乐观并发 expectedVersion（§6.2）；
 * - updatedAt 为审计字段，不接受 UI 覆写（与 v1 frontmatter 语义的差异记录于 Phase 3 日志）；
 * - 上传写对象存储 + assets 表，按 sha256 去重。
 */
export class PostgresContentService implements ContentService {
  readonly mode = "postgres" as const;
  private readonly store = new PostgresAdminContentStore(pgHandle());

  private async exposedCover(row: AdminPostRow): Promise<string | undefined> {
    if (row.coverExternalUrl) return row.coverExternalUrl;
    if (!row.coverAssetId) return undefined;
    return (await this.store.assetPublicUrl(row.coverAssetId)) ?? undefined;
  }

  private async toListItem(row: AdminPostRow): Promise<AdminPostListItem> {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      date: row.editorialDate ?? "",
      updatedAt: row.updatedAt,
      categorySlug: row.categorySlug,
      category: row.categoryName,
      tags: row.tags,
      excerpt: row.excerpt,
      status: row.status,
      coverImage: await this.exposedCover(row),
      version: row.version,
    };
  }

  async listPosts(filter: PostListFilter): Promise<AdminPostListItem[]> {
    let rows = await this.store.listPosts();
    if (filter.status) rows = rows.filter((row) => row.status === filter.status);
    if (filter.categorySlug) {
      rows = rows.filter((row) => row.categorySlug === filter.categorySlug);
    }
    if (filter.tag) rows = rows.filter((row) => row.tags.includes(filter.tag!));
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      rows = rows.filter(
        (row) =>
          row.title.toLowerCase().includes(keyword) ||
          row.slug.toLowerCase().includes(keyword)
      );
    }
    return Promise.all(rows.map((row) => this.toListItem(row)));
  }

  async getPost(id: string): Promise<AdminPostDetail> {
    const row = await this.store.getPostById(id);
    if (!row) throw new Error("文章不存在");
    return {
      ...(await this.toListItem(row)),
      content: row.contentMarkdown,
    };
  }

  async createPost(input: {
    title: string;
    slug: string;
    categorySlug: string;
  }): Promise<{ id: string }> {
    const category = await categoryRepository().getBySlug(input.categorySlug);
    if (!category) throw new Error(`分类不存在: ${input.categorySlug}`);
    const created = await postRepository().create({
      slug: input.slug.trim(),
      title: input.title,
      contentMarkdown: SCAFFOLD_CONTENT,
      categoryId: category.id,
      editorialDate: new Date().toISOString(),
      status: "draft",
    });
    return { id: created.id };
  }

  async savePost(id: string, patch: SavePostPatchInput): Promise<void> {
    const expectedVersion = requireVersion(patch.expectedVersion);
    const current = await this.store.getPostById(id);
    if (!current) throw new Error("文章不存在");

    let categoryId: string | undefined;
    if (patch.categorySlug && patch.categorySlug !== current.categorySlug) {
      const category = await categoryRepository().getBySlug(patch.categorySlug);
      if (!category) throw new Error(`分类不存在: ${patch.categorySlug}`);
      categoryId = category.id;
    }

    // 封面字段仅在提交值相对当前暴露值发生变化时更新，避免 asset 关联被无谓改写为外链
    let coverAssetId: string | null | undefined;
    let coverExternalUrl: string | null | undefined;
    if (patch.coverImage !== undefined) {
      const exposed = (await this.exposedCover(current)) ?? null;
      const submitted = patch.coverImage?.trim() || null;
      if (submitted !== exposed) {
        if (!submitted) {
          coverAssetId = null;
          coverExternalUrl = null;
        } else if (/^https?:\/\//i.test(submitted)) {
          const asset = await this.store.findAssetByPublicUrl(submitted);
          coverAssetId = asset?.id ?? null;
          coverExternalUrl = asset ? null : submitted;
        } else {
          throw new Error("PostgreSQL 模式封面只接受 http(s) URL（上传后填返回地址）");
        }
      }
    }

    await postRepository().update(id, {
      expectedVersion,
      title: patch.title,
      excerpt: patch.excerpt,
      contentMarkdown: patch.content,
      categoryId,
      coverAssetId,
      coverExternalUrl,
      tags: patch.tags,
      editorialDate:
        patch.date === undefined ? undefined : patch.date?.trim() || null,
    });
  }

  async setPostStatus(
    id: string,
    status: PostStatus,
    expectedVersion?: number
  ): Promise<void> {
    await postRepository().changeStatus(
      id,
      requireVersion(expectedVersion),
      status
    );
  }

  async deletePost(id: string): Promise<void> {
    await this.store.deletePostCascade(id);
  }

  async listCategories() {
    return categoryRepository().list();
  }

  async createCategory(input: {
    slug: string;
    name: string;
    description?: string;
  }) {
    return { id: await categoryRepository().create(input) };
  }

  async updateCategory(
    id: string,
    patch: { name?: string; description?: string; sortOrder?: number }
  ): Promise<void> {
    await categoryRepository().update(id, patch);
  }

  async deleteCategory(id: string): Promise<void> {
    await categoryRepository().remove(id);
  }

  async listCollections() {
    return collectionRepository().list();
  }

  private toItem(row: {
    id: string;
    collectionId: string;
    collectionSlug: string;
    slug: string;
    title: string;
    excerpt: string;
    status: PostStatus;
    sortOrder: number;
    version: number;
  }): AdminCollectionItem {
    return {
      id: row.id,
      collectionId: row.collectionId,
      collectionSlug: row.collectionSlug,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status,
      sortOrder: row.sortOrder,
      version: row.version,
    };
  }

  async getCollection(id: string) {
    const collections = await collectionRepository().list();
    const collection = collections.find((row) => row.id === id);
    if (!collection) throw new Error("专栏不存在");
    const items = await this.store.listItems(id);
    return {
      collection,
      items: items.map((row) => this.toItem(row)),
    };
  }

  async createCollection(input: {
    slug: string;
    name: string;
    description?: string;
    label?: string;
    badge?: string;
    noindex?: boolean;
  }) {
    return { id: await collectionRepository().create(input) };
  }

  async updateCollection(
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
    await collectionRepository().update(id, patch);
  }

  async deleteCollection(id: string): Promise<void> {
    await collectionRepository().remove(id);
  }

  async createCollectionItem(
    collectionId: string,
    input: { title: string; slug: string }
  ) {
    const created = await collectionItemRepository().create({
      collectionId,
      slug: input.slug.trim(),
      title: input.title,
      contentMarkdown: SCAFFOLD_CONTENT,
      status: "draft",
    });
    return { id: created.id };
  }

  async getCollectionItem(id: string) {
    const row = await this.store.getItemById(id);
    if (!row) throw new Error("专栏文档不存在");
    return { ...this.toItem(row), content: row.contentMarkdown };
  }

  async saveCollectionItem(
    id: string,
    patch: { title?: string; content?: string; expectedVersion?: number }
  ): Promise<void> {
    await collectionItemRepository().update(id, {
      expectedVersion: requireVersion(patch.expectedVersion),
      title: patch.title,
      contentMarkdown: patch.content,
    });
  }

  async setCollectionItemStatus(
    id: string,
    status: PostStatus,
    expectedVersion?: number
  ): Promise<void> {
    await collectionItemRepository().changeStatus(
      id,
      requireVersion(expectedVersion),
      status
    );
  }

  async deleteCollectionItem(id: string): Promise<void> {
    await this.store.deleteItemCascade(id);
  }

  async reorderCollectionItems(
    collectionId: string,
    orderedIds: string[]
  ): Promise<void> {
    await collectionRepository().reorderItems(collectionId, orderedIds);
  }

  async uploadAsset(input: UploadAssetInput): Promise<{ src: string }> {
    const validated = validateUploadBytes(input.bytes);
    const stored = await putObject(validated);
    const asset = await this.store.upsertAssetBySha({
      sha256: validated.sha256,
      objectKey: stored.objectKey,
      originalName: input.fileName,
      mimeType: validated.mime,
      byteSize: validated.bytes.byteLength,
      publicUrl: stored.publicUrl,
    });
    return { src: asset.publicUrl };
  }

  /** 编辑器预览：asset:// → 公开 URL 映射 */
  async assetUrlMapFor(markdown: string): Promise<Record<string, string>> {
    return this.store.assetUrlMap(markdown);
  }
}
