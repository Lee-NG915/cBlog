import type { ContentStatus } from "../domain/status";

export interface MigrationAsset {
  id: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  sourcePath: string;
  publicUrl: string;
  referenceCount: number;
}

export interface MigrationPost {
  legacySourcePath: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ContentStatus;
  categorySlug: string;
  tags: string[];
  sourceContentHash: string;
  contentMarkdown: string;
  contentHash: string;
  editorialDate: string | null;
  publishedAt: string | null;
  coverAssetId: string | null;
  coverExternalUrl: string | null;
  createdAt: string;
  /** 无 editorial updatedAt 的迁移内容为 NULL（不填导入时间） */
  updatedAt: string | null;
}

export interface MigrationCollectionItem {
  legacySourcePath: string;
  collectionSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ContentStatus;
  sortOrder: number;
  sourceContentHash: string;
  contentMarkdown: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationCategory {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationCollection {
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string | null;
  noindex: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnresolvedAssetReference {
  documentPath: string;
  url: string;
  reason: string;
}

export interface RemoteAssetReference {
  documentPath: string;
  url: string;
  kind: "markdown" | "cover";
}

export interface MigrationSnapshot {
  schemaVersion: 1;
  sourceDigest: string;
  publishedAtRule: string;
  categories: MigrationCategory[];
  tags: string[];
  posts: MigrationPost[];
  collections: MigrationCollection[];
  collectionItems: MigrationCollectionItem[];
  assets: MigrationAsset[];
  unresolvedAssets: UnresolvedAssetReference[];
  remoteAssets: RemoteAssetReference[];
}

export interface MigrationCounts {
  categories: number;
  posts: number;
  tags: number;
  collections: number;
  collectionItems: number;
  assets: number;
  revisions: number;
}

export interface MigrationApplyReport {
  runId: string;
  sourceDigest: string;
  replayed: boolean;
  appliedAt: string;
  counts: MigrationCounts;
  statusCounts: Record<ContentStatus, number>;
  assetReferenceCount: number;
  unresolvedAssets: UnresolvedAssetReference[];
  remoteAssets: RemoteAssetReference[];
  publishedAtRule: string;
  publishedWithoutEditorialDate: number;
}

export interface MigrationDifference {
  entity: string;
  key: string;
  field: string;
  expected: unknown;
  actual: unknown;
}

export interface MigrationVerifyReport {
  sourceDigest: string;
  ok: boolean;
  counts: MigrationCounts;
  differences: MigrationDifference[];
}
