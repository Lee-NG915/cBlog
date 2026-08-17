import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminStorageMode,
  assertAdminEnvConsistency,
  authTestModeEnabled,
  gitPublishEnabled,
  publicContentApiEnabled,
} from "../env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Phase 3 feature flags（§4/§6 契约）", () => {
  it("默认值等于 v1 生产行为：filesystem + public off + git publish on", () => {
    vi.stubEnv("ADMIN_STORAGE", "");
    vi.stubEnv("PUBLIC_CONTENT_API_ENABLED", "");
    vi.stubEnv("GIT_PUBLISH_ENABLED", "");
    expect(adminStorageMode()).toBe("filesystem");
    expect(publicContentApiEnabled()).toBe(false);
    expect(gitPublishEnabled()).toBe(true);
  });

  it("非法取值立即失败，不静默降级（§10.2）", () => {
    vi.stubEnv("ADMIN_STORAGE", "sqlite");
    expect(() => adminStorageMode()).toThrow("ADMIN_STORAGE");
    vi.unstubAllEnvs();
    vi.stubEnv("PUBLIC_CONTENT_API_ENABLED", "maybe");
    expect(() => publicContentApiEnabled()).toThrow("PUBLIC_CONTENT_API_ENABLED");
  });

  it("postgres 模式或公开 API 开启时要求 DATABASE_URL", () => {
    vi.stubEnv("ADMIN_STORAGE", "postgres");
    vi.stubEnv("DATABASE_URL", "");
    expect(() => assertAdminEnvConsistency()).toThrow("DATABASE_URL");

    vi.stubEnv("ADMIN_STORAGE", "filesystem");
    vi.stubEnv("PUBLIC_CONTENT_API_ENABLED", "true");
    expect(() => assertAdminEnvConsistency()).toThrow("DATABASE_URL");

    vi.stubEnv("DATABASE_URL", "postgresql://x:y@127.0.0.1:5432/z");
    expect(() => assertAdminEnvConsistency()).not.toThrow();
  });

  it("测试身份仅在 AUTH_TEST_MODE=1 时启用", () => {
    vi.stubEnv("AUTH_TEST_MODE", "");
    expect(authTestModeEnabled()).toBe(false);
    vi.stubEnv("AUTH_TEST_MODE", "1");
    expect(authTestModeEnabled()).toBe(true);
    vi.stubEnv("AUTH_TEST_MODE", "true");
    expect(authTestModeEnabled()).toBe(false);
  });
});
