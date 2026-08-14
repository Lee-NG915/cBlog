import { getDb, type DbHandle } from "../db/client";
import { collectionItems, collections, type PostStatus } from "../db/schema";
import { compareNotesByOrder } from "../utils/notes";

export interface CollectionMeta {
  id: number;
  slug: string;
  name: string;
  description: string;
  label: string;
  badge: string;
  noindex: boolean;
  sortOrder: number;
}

export interface CollectionItemMeta {
  id: number;
  collectionId: number;
  collectionSlug: string;
  slug: string;
  title: string;
  excerpt: string;
  status: PostStatus;
  sortOrder: number;
  filePath: string;
}

export function listCollections(handle: DbHandle = getDb()): CollectionMeta[] {
  return handle.db
    .select()
    .from(collections)
    .all()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      label: row.label,
      badge: row.badge || row.name,
      noindex: row.noindex === 1,
      sortOrder: row.sortOrder,
    }));
}

export function getCollectionBySlug(
  slug: string,
  handle: DbHandle = getDb()
): CollectionMeta | null {
  return listCollections(handle).find((item) => item.slug === slug) ?? null;
}

/** 专栏内文档（含草稿/归档，由调用方按环境过滤），order 升序 → 标题中文序 */
export function listCollectionItems(
  collectionSlug: string,
  handle: DbHandle = getDb()
): CollectionItemMeta[] {
  const collection = getCollectionBySlug(collectionSlug, handle);
  if (!collection) return [];

  return handle.db
    .select()
    .from(collectionItems)
    .all()
    .filter((row) => row.collectionId === collection.id)
    .map((row) => ({
      id: row.id,
      collectionId: row.collectionId,
      collectionSlug: collection.slug,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      status: row.status,
      sortOrder: row.sortOrder,
      filePath: row.filePath,
    }))
    .sort(compareNotesByOrder);
}
