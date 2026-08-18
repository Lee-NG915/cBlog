/**
 * 统一异步内容接口（部署态 v2 Phase 4）：页面/组件只依赖本模块。
 *
 * 构建期按 WEB_CONTENT_SOURCE 选择实现（默认 filesystem）。条件 require 保证
 * 未被选中的实现模块不被求值——filesystem 实现会经 @cblog/core 根入口加载
 * better-sqlite3 原生模块，api 模式必须完全避开（WEB-202）。
 */
type ContentSource = typeof import("./filesystem");

const impl: ContentSource =
  process.env.WEB_CONTENT_SOURCE === "api"
    ? (require("./api") as ContentSource)
    : (require("./filesystem") as ContentSource);

export const {
  getAllPosts,
  getAllPostSlugs,
  getPostBySlug,
  getPostsByCategory,
  getAllCategories,
  getOfficialCategories,
  getPostStats,
  getPostHeadings,
  markdownToHtml,
  docAssetBase,
  isDraftPreviewEnabled,
  toPostSummary,
  getAllCollections,
  getCollection,
  getCollectionNotes,
  getCollectionNote,
} = impl;

export type {
  Post,
  PostSummary,
  Category,
  PostStats,
  PostHeading,
  CollectionMeta,
  CollectionNote,
} from "./types";
