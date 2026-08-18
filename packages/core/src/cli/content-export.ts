import { closePostgresDb, createPostgresDb } from "../db/postgres/client";
import { repoPath } from "../paths";
import { exportMarkdownBackup } from "../migration/export";
import { createMigrationAssetStoreFromEnv } from "../migration/store-from-env";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("缺少环境变量 DATABASE_URL");
const outputDir = argument("--output");
if (!outputDir) throw new Error("content:export 必须提供 --output <空目录>");
const contentDir = argument("--content-dir") ?? repoPath("content");
const publicDir = argument("--public-dir") ?? repoPath("apps", "web", "public");
const assetDir =
  argument("--asset-dir") ??
  (process.env.MIGRATION_ASSET_DIR?.trim() ||
    repoPath("data", "migration-assets"));
const publicBaseUrl =
  argument("--asset-base-url") ??
  (process.env.MIGRATION_ASSET_PUBLIC_BASE_URL?.trim() ||
    process.env.OBJECT_STORAGE_PUBLIC_BASE_URL?.trim() ||
    "http://127.0.0.1:3001/assets");

const handle = createPostgresDb(databaseUrl, { max: 2 });
try {
  const report = await exportMarkdownBackup(
    handle,
    createMigrationAssetStoreFromEnv({
      contentDir,
      publicDir,
      assetDir,
      publicBaseUrl,
    }),
    outputDir
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await closePostgresDb(handle);
}
