/**
 * 页面消费的视图类型（部署态 v2 Phase 4）。
 * 直接 re-export 自既有实现 lib/posts.ts / lib/collections.ts，保证组件零改动。
 * 全部为类型导出（编译期擦除），本文件不产生任何运行时依赖。
 */
export type {
  Post,
  PostSummary,
  Category,
  PostStats,
  PostHeading,
} from "../posts";
export type { CollectionMeta, CollectionNote } from "../collections";
