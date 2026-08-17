import { closePostgresDb, createPostgresDb } from "../db/postgres/client";
import { repoPath } from "../paths";
import { FileSystemMigrationAssetStore } from "../migration/assets";
import { exportMarkdownBackup } from "../migration/export";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("缺少环境变量 DATABASE_URL");
const outputDir = argument("--output");
if (!outputDir) throw new Error("content:export 必须提供 --output <空目录>");
const assetDir =
  argument("--asset-dir") ??
  (process.env.MIGRATION_ASSET_DIR?.trim() ||
    repoPath("data", "migration-assets"));

const handle = createPostgresDb(databaseUrl, { max: 2 });
try {
  const report = await exportMarkdownBackup(
    handle,
    new FileSystemMigrationAssetStore(assetDir, {
      contentDir: repoPath("content"),
      publicDir: repoPath("apps", "web", "public"),
    }),
    outputDir
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await closePostgresDb(handle);
}
