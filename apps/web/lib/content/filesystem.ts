/**
 * filesystem 数据源（默认）：薄包装 lib/posts.ts / lib/collections.ts（同步 → async）。
 * 这两个模块经 @cblog/core 根入口加载 better-sqlite3，因此本模块只允许在
 * WEB_CONTENT_SOURCE ≠ "api" 时被求值（WEB-202，由 index.ts 的条件 require 保证）。
 */
import * as posts from "../posts";
import * as collections from "../collections";
import type { CollectionMeta, CollectionNote } from "../collections";
import type { Category, Post, PostStats } from "../posts";

export async function getAllPosts(): Promise<Post[]> {
  return posts.getAllPosts();
}

export async function getAllPostSlugs(): Promise<string[]> {
  return posts.getAllPostSlugs();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return posts.getPostBySlug(slug);
}

export async function getPostsByCategory(
  categorySlug: string
): Promise<Post[]> {
  return posts.getPostsByCategory(categorySlug);
}

export async function getAllCategories(): Promise<Category[]> {
  return posts.getAllCategories();
}

export async function getOfficialCategories(): Promise<
  Array<Pick<Category, "slug" | "name" | "description">>
> {
  return posts.getOfficialCategories();
}

export async function getPostStats(): Promise<PostStats> {
  return posts.getPostStats();
}

export async function getAllCollections(): Promise<CollectionMeta[]> {
  return collections.getAllCollections();
}

export async function getCollection(
  slug: string
): Promise<CollectionMeta | null> {
  return collections.getCollection(slug);
}

export async function getCollectionNotes(
  collectionSlug: string
): Promise<CollectionNote[]> {
  return collections.getCollectionNotes(collectionSlug);
}

export async function getCollectionNote(
  collectionSlug: string,
  noteSlug: string
): Promise<CollectionNote | null> {
  return collections.getCollectionNote(collectionSlug, noteSlug);
}

// 同步纯函数直接 re-export
export const getPostHeadings = posts.getPostHeadings;
export const markdownToHtml = posts.markdownToHtml;
export const docAssetBase = posts.docAssetBase;
export const isDraftPreviewEnabled = posts.isDraftPreviewEnabled;
export const toPostSummary = posts.toPostSummary;
