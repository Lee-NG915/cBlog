/**
 * Phase 3 feature flags 与环境变量契约（开发方案 §4 Phase 3 / §6）。
 * 生产默认：ADMIN_STORAGE=filesystem、PUBLIC_CONTENT_API_ENABLED=false、
 * GIT_PUBLISH_ENABLED=true —— 即 v1 行为完全不变；PostgreSQL 写路径仅 staging 启用。
 */

export type AdminStorageMode = "filesystem" | "postgres";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readBool(name: string, defaultValue: boolean): boolean {
  const value = readEnv(name);
  if (value === undefined) return defaultValue;
  if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
  if (["false", "0", "no"].includes(value.toLowerCase())) return false;
  throw new Error(`环境变量 ${name} 只接受 true/false，收到: ${value}`);
}

export function adminStorageMode(): AdminStorageMode {
  const value = readEnv("ADMIN_STORAGE") ?? "filesystem";
  if (value !== "filesystem" && value !== "postgres") {
    throw new Error(`ADMIN_STORAGE 只接受 filesystem|postgres，收到: ${value}`);
  }
  return value;
}

export function publicContentApiEnabled(): boolean {
  return readBool("PUBLIC_CONTENT_API_ENABLED", false);
}

export function gitPublishEnabled(): boolean {
  return readBool("GIT_PUBLISH_ENABLED", true);
}

export function contentApiReadToken(): string | undefined {
  return readEnv("CONTENT_API_READ_TOKEN");
}

export type PublicationDriver =
  | "github-dispatch"
  | "generic-build-hook"
  | "revalidation-webhook";

/** 发布驱动（§4 Phase 5）：默认 github-dispatch 保持 v1 生产行为不变 */
export function publicationDriver(): PublicationDriver {
  const value = readEnv("PUBLICATION_DRIVER") ?? "github-dispatch";
  if (
    value !== "github-dispatch" &&
    value !== "generic-build-hook" &&
    value !== "revalidation-webhook"
  ) {
    throw new Error(
      `PUBLICATION_DRIVER 只接受 github-dispatch|generic-build-hook|revalidation-webhook，收到: ${value}`
    );
  }
  return value;
}

/** 部署结果 callback 的 HMAC 签名密钥（/api/v1/internal/deployments/callback） */
export function deployCallbackSecret(): string | undefined {
  return readEnv("DEPLOY_CALLBACK_SECRET");
}

export function requireDatabaseUrl(): string {
  const url = readEnv("DATABASE_URL");
  if (!url) {
    throw new Error(
      "当前配置需要 PostgreSQL（ADMIN_STORAGE=postgres 或 PUBLIC_CONTENT_API_ENABLED=true），缺少 DATABASE_URL"
    );
  }
  return url;
}

/** 唯一允许登录的不可变 GitHub user ID（ADR-208） */
export function allowedGithubId(): string {
  const id = readEnv("ADMIN_ALLOWED_GITHUB_ID");
  if (!id) throw new Error("缺少 ADMIN_ALLOWED_GITHUB_ID（唯一允许登录的 GitHub user ID）");
  return id;
}

/**
 * 显式测试身份适配器（Phase 0 决策）：仅用于本地/CI 契约测试。
 * 任何真实部署不得设置 AUTH_TEST_MODE=1。
 */
export function authTestModeEnabled(): boolean {
  return readEnv("AUTH_TEST_MODE") === "1";
}

/**
 * 构建安全：next build 以 production 运行但不该持有运行时机密。
 * 生产缺失时返回 undefined，由 Auth.js 在处理请求时以 MissingSecret 拒绝服务（fail-closed）。
 */
export function authSecret(): string | undefined {
  const secret = readEnv("AUTH_SECRET");
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production" || authTestModeEnabled()) {
    return "cblog-dev-insecure-auth-secret";
  }
  return undefined;
}

export interface ObjectStorageConfig {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  forcePathStyle: boolean;
}

export function objectStorageConfig(): ObjectStorageConfig {
  const bucket = readEnv("OBJECT_STORAGE_BUCKET");
  const accessKeyId = readEnv("OBJECT_STORAGE_ACCESS_KEY");
  const secretAccessKey = readEnv("OBJECT_STORAGE_SECRET_KEY");
  const publicBaseUrl = readEnv("OBJECT_STORAGE_PUBLIC_BASE_URL");
  if (!bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw new Error(
      "PostgreSQL 模式上传需要 OBJECT_STORAGE_BUCKET/ACCESS_KEY/SECRET_KEY/PUBLIC_BASE_URL"
    );
  }
  return {
    endpoint: readEnv("OBJECT_STORAGE_ENDPOINT"),
    region: readEnv("OBJECT_STORAGE_REGION") ?? "us-east-1",
    bucket,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ""),
    forcePathStyle: readBool("OBJECT_STORAGE_FORCE_PATH_STYLE", true),
  };
}

/** 组合校验：无效组合立即失败，不允许静默降级（§10.2）。由 contentService() 在首个请求路径调用，构建期不执行。 */
export function assertAdminEnvConsistency(): void {
  const storage = adminStorageMode();
  if (storage === "postgres" || publicContentApiEnabled()) {
    requireDatabaseUrl();
  }
  if (process.env.NODE_ENV === "production" && !authTestModeEnabled()) {
    allowedGithubId();
    if (!authSecret()) throw new Error("生产环境缺少 AUTH_SECRET");
    // 仅生产强制：staging 契约矩阵（AUTH_TEST_MODE=1）不要求 dispatch 变量
    if (storage === "postgres" && publicationDriver() === "github-dispatch") {
      if (!readEnv("GITHUB_REPOSITORY") || !readEnv("GITHUB_DISPATCH_TOKEN")) {
        throw new Error(
          "生产 github-dispatch 模式缺少 GITHUB_REPOSITORY/GITHUB_DISPATCH_TOKEN"
        );
      }
    }
  }
}
