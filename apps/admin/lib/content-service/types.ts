import type { PostStatus } from "@cblog/core";

/**
 * Admin Content Service 契约：filesystem（v1 生产）与 postgres（v2 staging）
 * 双实现共用；路由层只依赖本接口，不感知存储介质（ADR-201 迁移期形态）。
 *
 * id 为不透明字符串：filesystem 模式是数字自增 id，postgres 模式是 uuid。
 * version 仅 postgres 模式返回；返回了 version 的实体在写操作时必须回传
 * expectedVersion（乐观并发，§6.2）。
 */

export interface AdminPostListItem {
  id: string;
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
  filePath?: string;
  version?: number;
}

export interface AdminPostDetail extends AdminPostListItem {
  content: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  postCount: number;
}

export interface AdminCollection {
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

export interface AdminCollectionItem {
  id: string;
  collectionId: string;
  collectionSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  status: PostStatus;
  sortOrder: number;
  filePath?: string;
  version?: number;
}

export interface AdminCollectionItemDetail extends AdminCollectionItem {
  content: string;
}

export interface PostListFilter {
  status?: string;
  categorySlug?: string;
  tag?: string;
  keyword?: string;
}

export interface SavePostPatchInput {
  title?: string;
  date?: string;
  updatedAt?: string | null;
  excerpt?: string;
  tags?: string[];
  coverImage?: string | null;
  categorySlug?: string;
  content?: string;
  expectedVersion?: number;
}

export interface UploadAssetInput {
  fileName: string;
  bytes: Buffer;
  /** filesystem 模式的落盘目标（文档相对 content/ 路径）；postgres 模式忽略 */
  docFilePath?: string;
}

export interface ContentService {
  readonly mode: "filesystem" | "postgres";

  listPosts(filter: PostListFilter): Promise<AdminPostListItem[]>;
  getPost(id: string): Promise<AdminPostDetail>;
  createPost(input: {
    title: string;
    slug: string;
    categorySlug: string;
  }): Promise<{ id: string }>;
  savePost(id: string, patch: SavePostPatchInput): Promise<void>;
  setPostStatus(
    id: string,
    status: PostStatus,
    expectedVersion?: number
  ): Promise<void>;
  deletePost(id: string): Promise<void>;

  listCategories(): Promise<AdminCategory[]>;
  createCategory(input: {
    slug: string;
    name: string;
    description?: string;
  }): Promise<{ id: string }>;
  updateCategory(
    id: string,
    patch: { name?: string; description?: string; sortOrder?: number }
  ): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  listCollections(): Promise<AdminCollection[]>;
  getCollection(id: string): Promise<{
    collection: AdminCollection;
    items: AdminCollectionItem[];
  }>;
  createCollection(input: {
    slug: string;
    name: string;
    description?: string;
    label?: string;
    badge?: string;
    noindex?: boolean;
  }): Promise<{ id: string }>;
  updateCollection(
    id: string,
    patch: {
      name?: string;
      description?: string;
      label?: string;
      badge?: string | null;
      noindex?: boolean;
      sortOrder?: number;
    }
  ): Promise<void>;
  deleteCollection(id: string): Promise<void>;

  createCollectionItem(
    collectionId: string,
    input: { title: string; slug: string }
  ): Promise<{ id: string }>;
  getCollectionItem(id: string): Promise<AdminCollectionItemDetail>;
  saveCollectionItem(
    id: string,
    patch: { title?: string; content?: string; expectedVersion?: number }
  ): Promise<void>;
  setCollectionItemStatus(
    id: string,
    status: PostStatus,
    expectedVersion?: number
  ): Promise<void>;
  deleteCollectionItem(id: string): Promise<void>;
  reorderCollectionItems(
    collectionId: string,
    orderedIds: string[]
  ): Promise<void>;

  uploadAsset(input: UploadAssetInput): Promise<{ src: string }>;
}
