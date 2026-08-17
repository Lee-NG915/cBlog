// 路径与校验
export {
  resolveRepoRoot,
  repoPath,
  contentRoot,
  contentAbsPath,
  resolveDocumentAssetPath,
  DocumentAssetError,
  type DocumentAssetErrorCode,
  toPosixRelative,
  isValidSlug,
  assertValidSlug,
  assertValidCollectionSlug,
  assertWritablePath,
  RESERVED_ROOT_SLUGS,
} from "./paths";

// 数据库
export {
  getDb,
  createDb,
  createReadonlyDb,
  defaultDbPath,
  type DbHandle,
} from "./db/client";
export * as schema from "./db/schema";
export { POST_STATUSES, type PostStatus } from "./db/schema";
export {
  CONTENT_STATUSES,
  canTransitionContentStatus,
  assertContentStatusTransition,
  InvalidContentStatusTransitionError,
  type ContentStatus,
} from "./domain/status";
export {
  ContentNotFoundError,
  VersionConflictError,
} from "./domain/errors";
export type { PostEntity, CollectionItemEntity } from "./domain/content";
export type {
  PostRepository,
  CollectionItemRepository,
  CreatePostRecordInput,
  UpdatePostRecordInput,
  CreateCollectionItemRecordInput,
  UpdateCollectionItemRecordInput,
} from "./repo/contracts";

// 仓储（读）
export {
  listPostMetas,
  readPostContent,
  getPostMetaById,
  type PostMeta,
} from "./repo/posts";
export { listCategories, type CategoryMeta } from "./repo/categories";
export {
  listCollections,
  getCollectionBySlug,
  listCollectionItems,
  getCollectionItemById,
  type CollectionMeta,
  type CollectionItemMeta,
} from "./repo/collections";

// 仓储（写，管理端专用）
export {
  createPost,
  savePost,
  setPostStatus,
  deletePost,
  type CreatePostInput,
  type SavePostPatch,
} from "./repo/posts-write";
export {
  createCategory,
  updateCategory,
  deleteCategory,
  countPostsByCategory,
  type CreateCategoryInput,
  type UpdateCategoryPatch,
} from "./repo/categories-write";
export {
  createCollection,
  updateCollection,
  deleteCollection,
  createCollectionItem,
  saveCollectionItem,
  setCollectionItemStatus,
  deleteCollectionItem,
  reorderCollectionItems,
  type CreateCollectionInput,
  type UpdateCollectionPatch,
  type CreateCollectionItemInput,
  type SaveCollectionItemPatch,
} from "./repo/collections-write";
export {
  writeFileAtomic,
  moveToTrash,
  saveAssetFile,
  normalizeAssetName,
} from "./content/files";

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

// Content API 公开 DTO 契约（纯类型，Web/Admin 共享）
export type {
  PublicPostSummaryDto,
  PublicPostDetailDto,
  PublicCategoryDto,
  PublicCollectionSummaryDto,
  PublicCollectionDetailDto,
  PublicCollectionItemSummaryDto,
  PublicCollectionItemDetailDto,
  PublicSiteDto,
  PublicSitemapDto,
  ApiErrorBody,
} from "./api/dto";
