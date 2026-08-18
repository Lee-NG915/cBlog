/**
 * 集中式 revalidation 计划：把 Content API 的领域事件映射为
 * 允许失效的 cache tags / paths。webhook route 只接受领域事件，
 * 不接受调用方直接传任意 path/tag（见 docs/deployment/01-technical-design.md §7.3）。
 *
 * cache tags 命名与 lib/content adapter 实际打标逐字一致：
 *   post:<slug> / post-index / sitemap / categories / collections
 *   collection:<slug> / collection-item:<collectionSlug>:<itemSlug>
 * （无 category:<slug> 标——adapter 无按分类的数据端点，分类页经 post-index 派生）
 */

export const REVALIDATE_SCHEMA_VERSION = 1;

export type RevalidateEvent =
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "post";
      slug: string;
      categorySlug: string;
      previousCategorySlug?: string;
      contentVersion: number;
    }
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "category";
      slug: string;
      previousSlug?: string;
      version: number;
    }
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "tag";
      name: string;
      previousName?: string;
      version: number;
    }
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "collection";
      slug: string;
      previousSlug?: string;
      version: number;
    }
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "collection_item";
      collectionSlug: string;
      slug: string;
      contentVersion: number;
    }
  | {
      schemaVersion: typeof REVALIDATE_SCHEMA_VERSION;
      entityType: "site";
      version: number;
    };

export interface RevalidationPlan {
  tags: string[];
  paths: string[];
  /** true 时由 route 额外执行 revalidatePath("/", "layout")，全站按访问懒更新 */
  layoutRefresh: boolean;
}

/** 站点现网 trailingSlash: true，页面路径一律以 "/" 结尾；/sitemap.xml 为文件路由例外 */
export function planRevalidation(event: RevalidateEvent): RevalidationPlan {
  switch (event.entityType) {
    case "post": {
      const moved =
        event.previousCategorySlug !== undefined &&
        event.previousCategorySlug !== event.categorySlug;
      // categories 标：发布/下线/移动都会改变分类计数（ISR-004），
      // 事件 schema 无 operation 区分，post 事件一律失效（§8.3）
      const tags = [`post:${event.slug}`, "post-index", "sitemap", "categories"];
      const paths = [
        `/posts/${event.slug}/`,
        "/",
        "/about/",
        "/categories/",
        `/categories/${event.categorySlug}/`,
        "/sitemap.xml",
      ];
      if (moved) {
        paths.push(`/categories/${event.previousCategorySlug}/`);
      }
      return { tags, paths, layoutRefresh: false };
    }
    case "category":
      // 导航变化：layout 懒更新；previousSlug 仅作 schema 前向兼容保留
      return {
        tags: ["categories"],
        paths: [`/categories/${event.slug}/`],
        layoutRefresh: true,
      };
    case "tag":
      return {
        tags: ["post-index"],
        paths: ["/", "/about/"],
        layoutRefresh: false,
      };
    case "collection":
      return {
        tags: ["collections", `collection:${event.slug}`],
        paths: [`/${event.slug}/`],
        layoutRefresh: true,
      };
    case "collection_item":
      return {
        tags: [
          `collection-item:${event.collectionSlug}:${event.slug}`,
          `collection:${event.collectionSlug}`,
        ],
        paths: [`/${event.collectionSlug}/${event.slug}/`, `/${event.collectionSlug}/`],
        layoutRefresh: false,
      };
    case "site":
      return {
        tags: ["post-index", "sitemap", "categories", "collections"],
        paths: [],
        layoutRefresh: true,
      };
  }
}

// ---------- parseRevalidateEvent：手写校验（apps/web 无 zod 依赖） ----------

const ENTITY_TYPES = [
  "post",
  "category",
  "tag",
  "collection",
  "collection_item",
  "site",
] as const;

/**
 * 保守 slug 规则：小写字母/数字/中文开头，后续可含连字符。
 * 另行拒绝 "/"、".."、空白，防止路径注入进 revalidatePath。
 */
// 允许大小写字母/数字/中文/连字符（存量专栏 slug 即 camelCase：rightCapital）；
// 安全目标是拒绝 `/`、`..`、空白等路径注入，不限制大小写
const SLUG_RE = /^[a-zA-Z0-9一-鿿][a-zA-Z0-9一-鿿-]*$/;
const SLUG_MAX_LENGTH = 128;

function fail(message: string): never {
  throw new Error(`invalid revalidate event: ${message}`);
}

function assertSlug(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${field} must be a non-empty string`);
  }
  const slug = value as string;
  if (slug.length > SLUG_MAX_LENGTH) {
    fail(`${field} exceeds ${SLUG_MAX_LENGTH} characters`);
  }
  if (slug.includes("/") || slug.includes("..") || /\s/.test(slug)) {
    fail(`${field} contains forbidden characters (path injection risk)`);
  }
  if (!SLUG_RE.test(slug)) {
    fail(`${field} is not a valid slug`);
  }
  return slug;
}

function assertVersion(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    fail(`${field} must be a non-negative finite number`);
  }
  return value;
}

function assertOptionalSlug(
  value: unknown,
  field: string
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return assertSlug(value, field);
}

function assertName(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${field} must be a non-empty string`);
  }
  if (value.length > 200) {
    fail(`${field} exceeds 200 characters`);
  }
  return value;
}

function assertOptionalName(
  value: unknown,
  field: string
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return assertName(value, field);
}

export function parseRevalidateEvent(body: unknown): RevalidateEvent {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    fail("body must be a JSON object");
  }
  const raw = body as Record<string, unknown>;

  if (raw.schemaVersion !== REVALIDATE_SCHEMA_VERSION) {
    fail(
      `schemaVersion must be ${REVALIDATE_SCHEMA_VERSION}, got ${JSON.stringify(
        raw.schemaVersion
      )}`
    );
  }

  if (
    typeof raw.entityType !== "string" ||
    !(ENTITY_TYPES as readonly string[]).includes(raw.entityType)
  ) {
    fail(`unknown entityType ${JSON.stringify(raw.entityType)}`);
  }
  const entityType = raw.entityType as (typeof ENTITY_TYPES)[number];

  switch (entityType) {
    case "post":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "post",
        slug: assertSlug(raw.slug, "slug"),
        categorySlug: assertSlug(raw.categorySlug, "categorySlug"),
        previousCategorySlug: assertOptionalSlug(
          raw.previousCategorySlug,
          "previousCategorySlug"
        ),
        contentVersion: assertVersion(raw.contentVersion, "contentVersion"),
      };
    case "category":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "category",
        slug: assertSlug(raw.slug, "slug"),
        previousSlug: assertOptionalSlug(raw.previousSlug, "previousSlug"),
        version: assertVersion(raw.version, "version"),
      };
    case "tag":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "tag",
        name: assertName(raw.name, "name"),
        previousName: assertOptionalName(raw.previousName, "previousName"),
        version: assertVersion(raw.version, "version"),
      };
    case "collection":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "collection",
        slug: assertSlug(raw.slug, "slug"),
        previousSlug: assertOptionalSlug(raw.previousSlug, "previousSlug"),
        version: assertVersion(raw.version, "version"),
      };
    case "collection_item":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "collection_item",
        collectionSlug: assertSlug(raw.collectionSlug, "collectionSlug"),
        slug: assertSlug(raw.slug, "slug"),
        contentVersion: assertVersion(raw.contentVersion, "contentVersion"),
      };
    case "site":
      return {
        schemaVersion: REVALIDATE_SCHEMA_VERSION,
        entityType: "site",
        version: assertVersion(raw.version, "version"),
      };
  }
}
