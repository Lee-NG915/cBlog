/**
 * Content API 公开 DTO 契约（Phase 3+）。
 * Web 构建/ISR 与 Admin Public API 共享此类型；只描述 published 内容，
 * 不携带 status/actor/legacy path 等内部字段（SEC-006）。
 */

export interface PublicPostSummaryDto {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  categoryName: string;
  tags: string[];
  /** 展示/排序用编辑日期（ISO），可空 */
  editorialDate: string | null;
  readingMinutes: number;
  /** 已解析的公开封面 URL（对象存储/外链），可空 */
  coverUrl: string | null;
  contentVersion: number;
}

export interface PublicPostDetailDto extends PublicPostSummaryDto {
  /** asset:// 引用已解析为公开 URL 的 Markdown 正文 */
  contentMarkdown: string;
  publishedAt: string | null;
  /** 作者可感的最后修改时间；迁移期无 frontmatter updatedAt 的内容为 null（不虚构） */
  updatedAt: string | null;
}

export interface PublicCategoryDto {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  publishedCount: number;
}

export interface PublicCollectionSummaryDto {
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string | null;
  noindex: boolean;
  sortOrder: number;
  publishedItemCount: number;
}

export interface PublicCollectionItemSummaryDto {
  slug: string;
  title: string;
  excerpt: string;
  sortOrder: number;
  readingMinutes: number;
  contentVersion: number;
}

export interface PublicCollectionItemDetailDto
  extends PublicCollectionItemSummaryDto {
  contentMarkdown: string;
  updatedAt: string;
}

export interface PublicCollectionDetailDto extends PublicCollectionSummaryDto {
  items: PublicCollectionItemSummaryDto[];
}

export interface PublicSiteDto {
  categories: PublicCategoryDto[];
  collections: PublicCollectionSummaryDto[];
  stats: {
    publishedPosts: number;
    categories: number;
    collections: number;
  };
  latestPosts: PublicPostSummaryDto[];
}

export interface PublicSitemapDto {
  posts: Array<{
    slug: string;
    editorialDate: string | null;
    updatedAt: string | null;
  }>;
  categories: Array<{ slug: string }>;
  collections: Array<{
    slug: string;
    noindex: boolean;
    items: Array<{ slug: string }>;
  }>;
}

/** 统一错误响应结构（§7） */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}
