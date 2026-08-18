/**
 * @cblog/core/postgres：Admin 运行时安全的 PostgreSQL 子路径。
 * 只导出连接、schema、仓储与读取器；migrate 与迁移/备份工具属 CLI/测试专用，
 * 从各自源文件相对导入（barrel 引入会把迁移目录解析拖进 Next webpack 图）。
 */
export {
  createPostgresDb,
  closePostgresDb,
  type PostgresDbHandle,
} from "./db/postgres/client";
export * as schema from "./db/postgres/schema";
export {
  PostgresPostRepository,
  PostgresCollectionItemRepository,
} from "./db/postgres/repositories";
export {
  PostgresCategoryRepository,
  PostgresCollectionRepository,
  PostgresAdminContentStore,
  type AdminCategoryRow,
  type AdminCollectionRow,
  type AdminPostRow,
  type AdminItemRow,
} from "./db/postgres/admin-repos";
export { PostgresPublicContentReader } from "./db/postgres/public-reader";
export type {
  PostRepository,
  CollectionItemRepository,
  CreatePostRecordInput,
  UpdatePostRecordInput,
  CreateCollectionItemRecordInput,
  UpdateCollectionItemRecordInput,
} from "./repo/contracts";
