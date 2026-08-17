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
  updatedAt: string;
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
