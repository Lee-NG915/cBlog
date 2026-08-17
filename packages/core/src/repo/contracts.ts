import type { CollectionItemEntity, PostEntity } from "../domain/content";
import type { ContentStatus } from "../domain/status";

export interface CreatePostRecordInput {
  slug: string;
  title: string;
  excerpt?: string;
  contentMarkdown: string;
  categoryId: string;
  coverAssetId?: string | null;
  tags?: string[];
  editorialDate?: string | null;
  status?: ContentStatus;
}

export interface UpdatePostRecordInput {
  expectedVersion: number;
  title?: string;
  excerpt?: string;
  contentMarkdown?: string;
  categoryId?: string;
  coverAssetId?: string | null;
  tags?: string[];
  editorialDate?: string | null;
}

export interface PostRepository {
  create(input: CreatePostRecordInput): Promise<PostEntity>;
  getById(id: string): Promise<PostEntity | null>;
  getPublishedBySlug(slug: string): Promise<PostEntity | null>;
  listPublished(): Promise<PostEntity[]>;
  update(id: string, input: UpdatePostRecordInput): Promise<PostEntity>;
  changeStatus(
    id: string,
    expectedVersion: number,
    status: ContentStatus
  ): Promise<PostEntity>;
}

export interface CreateCollectionItemRecordInput {
  collectionId: string;
  slug: string;
  title: string;
  excerpt?: string;
  contentMarkdown: string;
  sortOrder?: number;
  status?: ContentStatus;
}

export interface UpdateCollectionItemRecordInput {
  expectedVersion: number;
  title?: string;
  excerpt?: string;
  contentMarkdown?: string;
  sortOrder?: number;
}

export interface CollectionItemRepository {
  create(
    input: CreateCollectionItemRecordInput
  ): Promise<CollectionItemEntity>;
  getById(id: string): Promise<CollectionItemEntity | null>;
  getPublished(
    collectionId: string,
    slug: string
  ): Promise<CollectionItemEntity | null>;
  listPublished(collectionId: string): Promise<CollectionItemEntity[]>;
  update(
    id: string,
    input: UpdateCollectionItemRecordInput
  ): Promise<CollectionItemEntity>;
  changeStatus(
    id: string,
    expectedVersion: number,
    status: ContentStatus
  ): Promise<CollectionItemEntity>;
}
