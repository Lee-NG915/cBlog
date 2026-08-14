// 路径与校验
export {
  resolveRepoRoot,
  repoPath,
  contentRoot,
  contentAbsPath,
  toPosixRelative,
  isValidSlug,
  assertValidSlug,
  assertValidCollectionSlug,
  assertWritablePath,
  RESERVED_ROOT_SLUGS,
} from "./paths";

// 数据库
export { getDb, createDb, defaultDbPath, type DbHandle } from "./db/client";
export * as schema from "./db/schema";
export { POST_STATUSES, type PostStatus } from "./db/schema";

// 仓储
export { listPostMetas, readPostContent, type PostMeta } from "./repo/posts";
export { listCategories, type CategoryMeta } from "./repo/categories";
export {
  listCollections,
  getCollectionBySlug,
  listCollectionItems,
  type CollectionMeta,
  type CollectionItemMeta,
} from "./repo/collections";

// 内容 IO
export {
  parseMarkdown,
  buildOrderedFrontmatter,
  serializeMarkdown,
  type PostFrontmatter,
} from "./content/frontmatter";
export {
  listMarkdownFiles,
  slugFromPath,
  dateFromPath,
  normalizeStatus,
  computePostFileMeta,
  type PostFileMeta,
} from "./content/scan";

// 工具
export {
  normalizeDate,
  normalizeTags,
  calculateReadingTime,
  compareByDateDesc,
  nowIso,
} from "./utils/text";
export {
  stripMarkdown,
  getNoteExcerpt,
  calculateNoteReadingTime,
  compareNotesByOrder,
} from "./utils/notes";

// 配置种子
export {
  OFFICIAL_CATEGORY_SEEDS,
  UNCATEGORIZED,
  LEGACY_COLLECTION_SEEDS,
} from "./config";
