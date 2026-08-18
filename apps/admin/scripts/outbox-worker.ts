/**
 * Outbox worker 入口（Phase 6）：
 *   pnpm --filter @cblog/admin worker          # 常驻轮询
 *   pnpm --filter @cblog/admin worker -- --once  # 单 tick 后退出
 * 启动前按 PUBLICATION_DRIVER 校验必需环境变量，缺失即非零退出。
 */
import { publicationDriver, type PublicationDriver } from "../lib/env";
import { runWorker } from "../lib/outbox/worker";

const REQUIRED_ENV: Record<PublicationDriver, string[]> = {
  "revalidation-webhook": [
    "DATABASE_URL",
    "REVALIDATION_WEBHOOK_URL",
    "REVALIDATION_ACTIVE_KEY_ID",
    "REVALIDATION_ACTIVE_SECRET",
  ],
  "github-dispatch": [
    "DATABASE_URL",
    "GITHUB_REPOSITORY",
    "GITHUB_DISPATCH_TOKEN",
  ],
  "generic-build-hook": ["DATABASE_URL", "GENERIC_BUILD_HOOK_URL"],
};

function main(): void {
  let driver: PublicationDriver;
  try {
    driver = publicationDriver();
  } catch (error) {
    console.error(
      `outbox worker 启动失败：${error instanceof Error ? error.message : error}`
    );
    process.exit(1);
  }

  const missing = REQUIRED_ENV[driver].filter(
    (name) => !process.env[name]?.trim()
  );
  if (missing.length > 0) {
    console.error(
      `outbox worker 启动失败：PUBLICATION_DRIVER=${driver} 缺少环境变量 ${missing.join(", ")}`
    );
    process.exit(1);
  }

  const once = process.argv.includes("--once");
  runWorker({ once }).catch((error) => {
    console.error(
      `outbox worker 异常退出：${error instanceof Error ? error.stack ?? error.message : error}`
    );
    process.exit(1);
  });
}

main();
