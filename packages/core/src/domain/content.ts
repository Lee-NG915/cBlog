import type { ContentStatus } from "./status";

export interface PostEntity {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  contentHash: string;
  status: ContentStatus;
  categoryId: string;
  coverAssetId: string | null;
  coverExternalUrl: string | null;
  tags: string[];
  editorialDate: string | null;
  publishedAt: string | null;
  readingMinutes: number;
  version: number;
  createdAt: string;
  /** 作者可感的最后修改时间；无 frontmatter updatedAt 的迁移内容为 null */
  updatedAt: string | null;
}

export interface CollectionItemEntity {
  id: string;
  collectionId: string;
  slug: string;
  title: string;
  excerpt: string;
  contentMarkdown: string;
  contentHash: string;
  status: ContentStatus;
  sortOrder: number;
  readingMinutes: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}
