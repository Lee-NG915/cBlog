import path from "node:path";
import {
  contentAbsPath,
  countPostsByCategory,
  createCategory,
  createCollection,
  createCollectionItem,
  createPost,
  deleteCategory,
  deleteCollection,
  deleteCollectionItem,
  deletePost,
  getCollectionItemById,
  getPostMetaById,
  listCategories,
  listCollectionItems,
  listCollections,
  listPostMetas,
  readPostContent,
  reorderCollectionItems,
  saveAssetFile,
  saveCollectionItem,
  savePost,
  setCollectionItemStatus,
  setPostStatus,
  updateCategory,
  updateCollection,
  type PostStatus,
} from "@cblog/core";
import type {
  AdminCollectionItem,
  AdminPostListItem,
  ContentService,
  PostListFilter,
  SavePostPatchInput,
  UploadAssetInput,
} from "./types";

function parseNumericId(value: string): number {
  const id = Number.parseInt(value, 10);
  if (!Number.isFinite(id)) throw new Error(`非法 id: ${value}`);
  return id;
}

/** v1 既有上传扩展名白名单（含 .svg，保持生产行为完全一致） */
const ALLOWED_UPLOAD_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".avif",
]);

/** v1 生产实现：SQLite 元数据 + Markdown 文件 + frontmatter 回写（行为与既有版本一致） */
export class FilesystemContentService implements ContentService {
  readonly mode = "filesystem" as const;

  async listPosts(filter: PostListFilter): Promise<AdminPostListItem[]> {
    let metas = listPostMetas();
    if (filter.status) metas = metas.filter((meta) => meta.status === filter.status);
    if (filter.categorySlug) {
      metas = metas.filter((meta) => meta.categorySlug === filter.categorySlug);
    }
    if (filter.tag) metas = metas.filter((meta) => meta.tags.includes(filter.tag!));
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      metas = metas.filter(
        (meta) =>
          meta.title.toLowerCase().includes(keyword) ||
          meta.slug.toLowerCase().includes(keyword)
      );
    }
    return metas.map((meta) => ({ ...meta, id: String(meta.id) }));
  }

  async getPost(id: string) {
    const meta = getPostMetaById(parseNumericId(id));
    if (!meta) throw new Error("文章不存在");
    return {
      ...meta,
      id: String(meta.id),
      content: readPostContent(meta.filePath),
    };
  }

  async createPost(input: { title: string; slug: string; categorySlug: string }) {
    return { id: String(createPost(input)) };
  }

  async savePost(id: string, patch: SavePostPatchInput): Promise<void> {
    savePost(parseNumericId(id), {
      title: patch.title,
      date: patch.date,
      updatedAt: patch.updatedAt,
      excerpt: patch.excerpt,
      tags: patch.tags,
      coverImage: patch.coverImage,
      categorySlug: patch.categorySlug,
      content: patch.content,
    });
  }

  async setPostStatus(id: string, status: PostStatus): Promise<void> {
    setPostStatus(parseNumericId(id), status);
  }

  async deletePost(id: string): Promise<void> {
    deletePost(parseNumericId(id));
  }

  async listCategories() {
    const counts = countPostsByCategory();
    return listCategories().map((category) => ({
      ...category,
      id: String(category.id),
      postCount: counts.get(category.id) ?? 0,
    }));
  }

  async createCategory(input: {
    slug: string;
    name: string;
    description?: string;
  }) {
    return { id: String(createCategory(input)) };
  }

  async updateCategory(
    id: string,
    patch: { name?: string; description?: string; sortOrder?: number }
  ): Promise<void> {
    updateCategory(parseNumericId(id), patch);
  }

  async deleteCategory(id: string): Promise<void> {
    deleteCategory(parseNumericId(id));
  }

  async listCollections() {
    return listCollections().map((collection) => ({
      ...collection,
      id: String(collection.id),
      itemCount: listCollectionItems(collection.slug).length,
    }));
  }

  async getCollection(id: string) {
    const collection = listCollections().find(
      (item) => item.id === parseNumericId(id)
    );
    if (!collection) throw new Error("专栏不存在");
    return {
      collection: {
        ...collection,
        id: String(collection.id),
        itemCount: listCollectionItems(collection.slug).length,
      },
      items: listCollectionItems(collection.slug).map((item) =>
        this.toItem(item)
      ),
    };
  }

  private toItem(item: {
    id: number;
    collectionId: number;
    collectionSlug: string;
    slug: string;
    title: string;
    excerpt: string;
    status: PostStatus;
    sortOrder: number;
    filePath: string;
  }): AdminCollectionItem {
    return {
      ...item,
      id: String(item.id),
      collectionId: String(item.collectionId),
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
    return { id: String(createCollection(input)) };
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
    updateCollection(parseNumericId(id), patch);
  }

  async deleteCollection(id: string): Promise<void> {
    deleteCollection(parseNumericId(id));
  }

  async createCollectionItem(
    collectionId: string,
    input: { title: string; slug: string }
  ) {
    return {
      id: String(
        createCollectionItem({
          collectionId: parseNumericId(collectionId),
          title: input.title,
          slug: input.slug,
        })
      ),
    };
  }

  async getCollectionItem(id: string) {
    const item = getCollectionItemById(parseNumericId(id));
    if (!item) throw new Error("专栏文档不存在");
    return {
      ...this.toItem(item),
      content: readPostContent(item.filePath),
    };
  }

  async saveCollectionItem(
    id: string,
    patch: { title?: string; content?: string }
  ): Promise<void> {
    saveCollectionItem(parseNumericId(id), patch);
  }

  async setCollectionItemStatus(id: string, status: PostStatus): Promise<void> {
    setCollectionItemStatus(parseNumericId(id), status);
  }

  async deleteCollectionItem(id: string): Promise<void> {
    deleteCollectionItem(parseNumericId(id));
  }

  async reorderCollectionItems(
    collectionId: string,
    orderedIds: string[]
  ): Promise<void> {
    reorderCollectionItems(
      parseNumericId(collectionId),
      orderedIds.map(parseNumericId)
    );
  }

  async uploadAsset(input: UploadAssetInput): Promise<{ src: string }> {
    if (!input.docFilePath) throw new Error("缺少目标文档 filePath");
    const ext = path.extname(input.fileName).toLowerCase();
    if (!ALLOWED_UPLOAD_EXT.has(ext)) {
      throw new Error(`不支持的图片格式: ${ext}`);
    }
    const docDir = path.dirname(contentAbsPath(input.docFilePath));
    const { relativeSrc } = saveAssetFile(docDir, input.fileName, input.bytes);
    return { src: relativeSrc };
  }
}
