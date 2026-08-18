import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminStorageMode,
  assertAdminEnvConsistency,
  authTestModeEnabled,
  gitPublishEnabled,
  githubApiBaseUrl,
  githubDispatchEvent,
  outboxBatchWindowSeconds,
  outboxClaimTimeoutSeconds,
  outboxDeployTimeoutSeconds,
  outboxMaxAttempts,
  outboxPollIntervalMs,
  outboxRequestTimeoutMs,
  publicContentApiEnabled,
  publicationDriver,
  publicWebBaseUrl,
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

  it("PUBLICATION_DRIVER 默认 github-dispatch，非法取值立即失败", () => {
    vi.stubEnv("PUBLICATION_DRIVER", "");
    expect(publicationDriver()).toBe("github-dispatch");
    vi.stubEnv("PUBLICATION_DRIVER", "revalidation-webhook");
    expect(publicationDriver()).toBe("revalidation-webhook");
    vi.stubEnv("PUBLICATION_DRIVER", "netlify");
    expect(() => publicationDriver()).toThrow("PUBLICATION_DRIVER");
  });

  it("生产 postgres + github-dispatch 缺 dispatch 变量时失败；测试身份矩阵不强制", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_STORAGE", "postgres");
    vi.stubEnv("DATABASE_URL", "postgresql://x:y@127.0.0.1:5432/z");
    vi.stubEnv("ADMIN_ALLOWED_GITHUB_ID", "777001");
    vi.stubEnv("AUTH_SECRET", "s3cret");
    vi.stubEnv("PUBLICATION_DRIVER", "github-dispatch");
    vi.stubEnv("GITHUB_REPOSITORY", "");
    vi.stubEnv("GITHUB_DISPATCH_TOKEN", "");
    expect(() => assertAdminEnvConsistency()).toThrow("GITHUB_REPOSITORY");

    // AUTH_TEST_MODE=1 的 staging 契约矩阵不受生产强制约束（Phase 3 回归保护）
    vi.stubEnv("AUTH_TEST_MODE", "1");
    expect(() => assertAdminEnvConsistency()).not.toThrow();
    vi.stubEnv("AUTH_TEST_MODE", "");

    vi.stubEnv("GITHUB_REPOSITORY", "owner/repo");
    vi.stubEnv("GITHUB_DISPATCH_TOKEN", "tok");
    expect(() => assertAdminEnvConsistency()).not.toThrow();
  });
});

describe("Phase 6 outbox env（§4 Phase 6 契约）", () => {
  it("outbox 参数默认值", () => {
    for (const name of [
      "OUTBOX_BATCH_WINDOW_SECONDS",
      "OUTBOX_MAX_ATTEMPTS",
      "OUTBOX_POLL_INTERVAL_MS",
      "OUTBOX_CLAIM_TIMEOUT_SECONDS",
      "OUTBOX_REQUEST_TIMEOUT_MS",
      "OUTBOX_DEPLOY_TIMEOUT_SECONDS",
    ]) {
      vi.stubEnv(name, "");
    }
    expect(outboxBatchWindowSeconds()).toBe(120);
    expect(outboxMaxAttempts()).toBe(8);
    expect(outboxPollIntervalMs()).toBe(5000);
    expect(outboxClaimTimeoutSeconds()).toBe(60);
    expect(outboxRequestTimeoutMs()).toBe(15000);
    expect(outboxDeployTimeoutSeconds()).toBe(1800);
  });

  it("outbox 参数只接受正整数，非法值立即失败", () => {
    vi.stubEnv("OUTBOX_MAX_ATTEMPTS", "abc");
    expect(() => outboxMaxAttempts()).toThrow("OUTBOX_MAX_ATTEMPTS");
    vi.stubEnv("OUTBOX_MAX_ATTEMPTS", "0");
    expect(() => outboxMaxAttempts()).toThrow("OUTBOX_MAX_ATTEMPTS");
    vi.stubEnv("OUTBOX_MAX_ATTEMPTS", "3");
    expect(outboxMaxAttempts()).toBe(3);
  });

  it("GITHUB_API_BASE_URL 默认官方端点并可覆盖；dispatch event 默认值", () => {
    vi.stubEnv("GITHUB_API_BASE_URL", "");
    vi.stubEnv("GITHUB_DISPATCH_EVENT", "");
    expect(githubApiBaseUrl()).toBe("https://api.github.com");
    expect(githubDispatchEvent()).toBe("cblog-content-published");
    vi.stubEnv("GITHUB_API_BASE_URL", "http://127.0.0.1:9999/");
    expect(githubApiBaseUrl()).toBe("http://127.0.0.1:9999");
  });

  it("PUBLIC_WEB_BASE_URL 可选且去掉尾部斜杠", () => {
    vi.stubEnv("PUBLIC_WEB_BASE_URL", "");
    expect(publicWebBaseUrl()).toBeUndefined();
    vi.stubEnv("PUBLIC_WEB_BASE_URL", "https://blog.example.com/");
    expect(publicWebBaseUrl()).toBe("https://blog.example.com");
  });
});
