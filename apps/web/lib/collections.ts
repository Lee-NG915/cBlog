/**
 * 专栏数据适配层：元数据来自数据库，正文来自 md 文件。
 * 替代原 lib/rightCapital.ts 与 lib/addxAi.ts（展示行为等价）。
 */
import {
  calculateNoteReadingTime,
  getCollectionBySlug as coreGetCollection,
  listCollectionItems,
  listCollections as coreListCollections,
  readPostContent,
  type CollectionItemMeta,
  type CollectionMeta,
} from "@cblog/core";
import { isDraftPreviewEnabled } from "./posts";

export type { CollectionMeta } from "@cblog/core";

export interface CollectionNote {
  slug: string;
  title: string;
  order: number;
  content: string;
  excerpt: string;
  readingTime: number;
}

export function getAllCollections(): CollectionMeta[] {
  return coreListCollections();
}

export function getCollection(slug: string): CollectionMeta | null {
  return coreGetCollection(slug);
}

function isVisible(item: CollectionItemMeta): boolean {
  if (item.status === "published") return true;
  if (item.status === "draft") return isDraftPreviewEnabled();
  return false; // archived 任何环境不可见
}

function toNote(item: CollectionItemMeta): CollectionNote {
  const content = readPostContent(item.filePath);
  return {
    slug: item.slug,
    title: item.title,
    order: item.sortOrder,
    content,
    excerpt: item.excerpt,
    readingTime: calculateNoteReadingTime(content),
  };
}

export function getCollectionNotes(collectionSlug: string): CollectionNote[] {
  return listCollectionItems(collectionSlug).filter(isVisible).map(toNote);
}

export function getCollectionNote(
  collectionSlug: string,
  noteSlug: string
): CollectionNote | null {
  const item = listCollectionItems(collectionSlug).find(
    (candidate) => candidate.slug === noteSlug && isVisible(candidate)
  );
  return item ? toNote(item) : null;
}
