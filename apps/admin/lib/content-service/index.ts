import { adminStorageMode, assertAdminEnvConsistency } from "@/lib/env";
import { FilesystemContentService } from "./filesystem";
import { PostgresContentService } from "./postgres";
import type { ContentService } from "./types";

export type {
  AdminCategory,
  AdminCollection,
  AdminCollectionItem,
  AdminCollectionItemDetail,
  AdminPostDetail,
  AdminPostListItem,
  ContentService,
  PostListFilter,
  SavePostPatchInput,
} from "./types";

let cached: ContentService | null = null;

/** 按 ADMIN_STORAGE 选择实现；进程内单例，模式切换需重启（部署期语义，防半切换） */
export function contentService(): ContentService {
  if (!cached) {
    // 请求路径首次触达时做组合校验：无效 env 组合立即失败，不允许静默降级（§10.2）
    assertAdminEnvConsistency();
    cached =
      adminStorageMode() === "postgres"
        ? new PostgresContentService()
        : new FilesystemContentService();
  }
  return cached;
}

export function postgresService(): PostgresContentService | null {
  const service = contentService();
  return service.mode === "postgres"
    ? (service as PostgresContentService)
    : null;
}
