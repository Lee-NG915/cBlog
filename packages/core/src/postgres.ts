export {
  createPostgresDb,
  closePostgresDb,
  type PostgresDbHandle,
} from "./db/postgres/client";
export { migratePostgres } from "./db/postgres/migrate";
export * as schema from "./db/postgres/schema";
export {
  PostgresPostRepository,
  PostgresCollectionItemRepository,
} from "./db/postgres/repositories";
export { buildMigrationSnapshot } from "./migration/source";
export {
  applyMigrationSnapshot,
  verifyMigrationSnapshot,
  assertConfirmedMigrationTarget,
  migrationTargetName,
} from "./migration/runner";
export {
  FileSystemMigrationAssetStore,
  type MigrationAssetStore,
} from "./migration/assets";
export { exportMarkdownBackup } from "./migration/export";
export type {
  MigrationSnapshot,
  MigrationApplyReport,
  MigrationVerifyReport,
} from "./migration/types";
export type {
  PostRepository,
  CollectionItemRepository,
  CreatePostRecordInput,
  UpdatePostRecordInput,
  CreateCollectionItemRecordInput,
  UpdateCollectionItemRecordInput,
} from "./repo/contracts";
