import {
  FileSystemMigrationAssetStore,
  S3MigrationAssetStore,
  type MigrationAssetStore,
} from "./assets";

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`缺少环境变量 ${name}`);
  return value;
}

export interface MigrationAssetStoreEnvOptions {
  contentDir: string;
  publicDir: string;
  assetDir: string;
  publicBaseUrl: string;
}

/**
 * 按 `MIGRATION_ASSET_STORE=filesystem|s3` 装配迁移/导出对象存储。
 * 默认 filesystem，保持本地/staging 现有行为；生产冻结迁移必须显式 s3。
 */
export function createMigrationAssetStoreFromEnv(
  options: MigrationAssetStoreEnvOptions
): MigrationAssetStore {
  const mode = process.env.MIGRATION_ASSET_STORE?.trim() || "filesystem";
  if (mode === "filesystem") {
    return new FileSystemMigrationAssetStore(options.assetDir, {
      contentDir: options.contentDir,
      publicDir: options.publicDir,
    });
  }
  if (mode !== "s3") {
    throw new Error("MIGRATION_ASSET_STORE 只接受 filesystem|s3");
  }
  const configuredPublicBaseUrl = requiredEnvironment(
    "OBJECT_STORAGE_PUBLIC_BASE_URL"
  ).replace(/\/$/, "");
  if (configuredPublicBaseUrl !== options.publicBaseUrl.replace(/\/$/, "")) {
    throw new Error(
      "S3 迁移/导出要求 MIGRATION_ASSET_PUBLIC_BASE_URL 与 OBJECT_STORAGE_PUBLIC_BASE_URL 一致"
    );
  }
  return new S3MigrationAssetStore({
    contentDir: options.contentDir,
    publicDir: options.publicDir,
    bucket: requiredEnvironment("OBJECT_STORAGE_BUCKET"),
    region: process.env.OBJECT_STORAGE_REGION?.trim() || "us-east-1",
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT?.trim() || undefined,
    accessKeyId: requiredEnvironment("OBJECT_STORAGE_ACCESS_KEY"),
    secretAccessKey: requiredEnvironment("OBJECT_STORAGE_SECRET_KEY"),
    forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE?.trim()
      ? process.env.OBJECT_STORAGE_FORCE_PATH_STYLE.trim() === "true"
      : undefined,
  });
}
