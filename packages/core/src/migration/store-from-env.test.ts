import { afterEach, describe, expect, it, vi } from "vitest";
import { FileSystemMigrationAssetStore, S3MigrationAssetStore } from "./assets";
import { createMigrationAssetStoreFromEnv } from "./store-from-env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createMigrationAssetStoreFromEnv", () => {
  const options = {
    contentDir: "/tmp/content",
    publicDir: "/tmp/public",
    assetDir: "/tmp/migration-assets",
    publicBaseUrl: "http://127.0.0.1:19000/cblog",
  };

  it("默认和 filesystem 都装配本地对象存储", () => {
    vi.stubEnv("MIGRATION_ASSET_STORE", "");
    expect(createMigrationAssetStoreFromEnv(options)).toBeInstanceOf(
      FileSystemMigrationAssetStore
    );
    vi.unstubAllEnvs();
    vi.stubEnv("MIGRATION_ASSET_STORE", "filesystem");
    expect(createMigrationAssetStoreFromEnv(options)).toBeInstanceOf(
      FileSystemMigrationAssetStore
    );
  });

  it("s3 缺凭证或公开基址不一致时立即失败", () => {
    vi.stubEnv("MIGRATION_ASSET_STORE", "s3");
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "cblog");
    vi.stubEnv("OBJECT_STORAGE_ACCESS_KEY", "minioadmin");
    vi.stubEnv("OBJECT_STORAGE_SECRET_KEY", "minioadmin");
    vi.stubEnv("OBJECT_STORAGE_PUBLIC_BASE_URL", "");
    expect(() => createMigrationAssetStoreFromEnv(options)).toThrow(
      "OBJECT_STORAGE_PUBLIC_BASE_URL"
    );

    vi.stubEnv(
      "OBJECT_STORAGE_PUBLIC_BASE_URL",
      "http://127.0.0.1:19000/other"
    );
    expect(() => createMigrationAssetStoreFromEnv(options)).toThrow(
      "OBJECT_STORAGE_PUBLIC_BASE_URL 一致"
    );
  });

  it("s3 完整配置装配 S3MigrationAssetStore", () => {
    vi.stubEnv("MIGRATION_ASSET_STORE", "s3");
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "cblog");
    vi.stubEnv("OBJECT_STORAGE_ACCESS_KEY", "minioadmin");
    vi.stubEnv("OBJECT_STORAGE_SECRET_KEY", "minioadmin");
    vi.stubEnv("OBJECT_STORAGE_PUBLIC_BASE_URL", "http://127.0.0.1:19000/cblog/");
    expect(createMigrationAssetStoreFromEnv(options)).toBeInstanceOf(
      S3MigrationAssetStore
    );
  });

  it("拒绝未知存储模式", () => {
    vi.stubEnv("MIGRATION_ASSET_STORE", "gcs");
    expect(() => createMigrationAssetStoreFromEnv(options)).toThrow(
      "filesystem|s3"
    );
  });
});
