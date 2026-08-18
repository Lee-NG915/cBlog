/**
 * Content API 数据源（WEB_CONTENT_SOURCE=api，部署态 v2 Phase 4）。
 *
 * WEB-202 模块图隔离：本模块绝不 import @cblog/core 根入口（其 re-export 的
 * db/client 顶层加载 better-sqlite3 原生模块）：
 * - DTO 类型用 import type 引自根入口（编译期擦除，运行时零依赖；
 *   @cblog/core 无纯类型子路径，exports 仅 "." / "./markdown" / "./postgres"）；
 * - markdown 渲染与标题提取走 @cblog/core/markdown 子路径（纯函数，无 fs/原生依赖）；
 * - 排序比较子（compareByDateDesc / compareNotesByOrder）无纯子路径可引，
 *   在本文件内联复刻并注明来源。
 *
 * 排序/分类/兜底语义在客户端复刻（不改 admin），与 filesystem 实现的展示行为对齐。
 */
import type {
  PublicCategoryDto,
  PublicCollectionDetailDto,
  PublicCollectionItemDetailDto,
  PublicCollectionSummaryDto,
  PublicPostDetailDto,
  PublicPostSummaryDto,
  PublicSitemapDto,
} from "@cblog/core";
import {
  getPostHeadings as coreGetPostHeadings,
  markdownToHtml as coreMarkdownToHtml,
  type PostHeading,
} from "@cblog/core/markdown";
import type {
  Category,
  Post,
  PostStats,
  PostSummary,
} from "../posts";
import type { CollectionMeta, CollectionNote } from "../collections";

// ---------------------------------------------------------------------------
// fetch client（WEB-203 错误处理 + WEB-205 构建期 memo）
// ---------------------------------------------------------------------------

const API_BASE_URL = (
  process.env.CONTENT_API_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");
const READ_TOKEN = process.env.CONTENT_API_READ_TOKEN;

/**
 * 构建期 memo：key = 完整 URL，缓存 Promise（含 rejected——构建随即失败，无需重试）。
 * generateMetadata 与 Page 渲染同一 slug 命中同一 Promise，同一端点一次构建只请求一次。
 *
 * Phase 5：仅 static-export（一次性构建进程）读写 memo。runtime-isr 是长驻进程，
 * 模块级 memo 会短路 ISR——revalidateTag 后仍命中旧 Promise——必须绕过，
 * 改由 Next Data Cache（fetch revalidate/tags）+ React 请求记忆化承担去重。
 */
const requestMemo = new Map<string, Promise<unknown>>();
const useRequestMemo = process.env.WEB_RENDER_MODE !== "runtime-isr";

/**
 * Phase 5：fetch 一律携带 revalidate/tags。static-export 构建期该配置被无害忽略
 * （实测前提 2）；runtime-isr 下进入 Data Cache，供 revalidateTag 精确失效。
 * CONTENT_API_REVALIDATE_TTL 可覆盖默认 86400（仅 ISR 验证 harness 用，缩短 TTL 等待）。
 */
const CACHE_REVALIDATE_SECONDS = (() => {
  const override = Number.parseInt(
    process.env.CONTENT_API_REVALIDATE_TTL ?? "",
    10
  );
  return Number.isFinite(override) && override > 0 ? override : 86400;
})();

async function request<T>(url: string, tags: string[]): Promise<T> {
  const headers: Record<string, string> = {};
  if (READ_TOKEN) {
    headers.Authorization = `Bearer ${READ_TOKEN}`;
  }
  // 保持默认 force-cache：静态导出下 no-store 会把页面打成 dynamic 而无法导出。
  // Next Data Cache 跨构建复用响应——CI 干净检出无缓存；本地验证 WEB-203 前
  // 需先 rm -rf apps/web/.next/cache/fetch-cache（见 phase-04 日志）。
  const response = await fetch(url, {
    headers,
    next: { revalidate: CACHE_REVALIDATE_SECONDS, tags },
  });
  if (!response.ok) {
    // WEB-203：非 2xx 直接 throw（带 URL + status），让 next build 非零退出
    throw new Error(
      `[content-api] GET ${url} 失败：HTTP ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as T;
}

function fetchJson<T>(path: string, tags: string[]): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  if (useRequestMemo) {
    const cached = requestMemo.get(url);
    if (cached) {
      return cached as Promise<T>;
    }
  }
  const promise = request<T>(url, tags);
  if (useRequestMemo) {
    requestMemo.set(url, promise);
  }
  return promise;
}

/**
 * 详情端点专用：404 映射为 null（getPostBySlug 等“不存在即 null”的语义；
 * API 侧 draft/archived/不存在统一 404，API-002）。其余非 2xx 仍然 throw。
 */
async function fetchJsonOrNull<T>(
  path: string,
  tags: string[]
): Promise<T | null> {
  const url = `${API_BASE_URL}${path}`;
  if (useRequestMemo) {
    const cached = requestMemo.get(url);
    if (cached) {
      return cached as Promise<T | null>;
    }
  }
  const promise = (async (): Promise<T | null> => {
    const headers: Record<string, string> = {};
    if (READ_TOKEN) {
      headers.Authorization = `Bearer ${READ_TOKEN}`;
    }
    const response = await fetch(url, {
      headers,
      next: { revalidate: CACHE_REVALIDATE_SECONDS, tags },
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(
        `[content-api] GET ${url} 失败：HTTP ${response.status} ${response.statusText}`
      );
    }
    return (await response.json()) as T;
  })();
  if (useRequestMemo) {
    requestMemo.set(url, promise);
  }
  return promise;
}

// ---------------------------------------------------------------------------
// 排序比较子（内联复刻，WEB-202）
// ---------------------------------------------------------------------------

/**
 * 复刻 packages/core/src/utils/text.ts compareByDateDesc：
 * date 降序 → updatedAt 降序 → slug 降序。
 * 列表摘要的 updatedAt 由 /sitemap DTO 按 slug 补齐（见 listPosts），
 * 排序键与 filesystem 实现完全一致。
 */
function compareByDateDesc(
  a: { date: string; updatedAt?: string | null; slug: string },
  b: { date: string; updatedAt?: string | null; slug: string }
): number {
  const dateComparison = b.date.localeCompare(a.date);
  if (dateComparison !== 0) {
    return dateComparison;
  }

  const updatedAtComparison = (b.updatedAt || "").localeCompare(
    a.updatedAt || ""
  );
  if (updatedAtComparison !== 0) {
    return updatedAtComparison;
  }

  return b.slug.localeCompare(a.slug);
}

/**
 * 复刻 packages/core/src/utils/notes.ts compareNotesByOrder：
 * sortOrder 升序 → 标题中文序。API 返回顺序是 PG collation，与 zh-CN 序不一致，必须重排。
 */
function compareNotesByOrder(
  a: { sortOrder: number; title: string },
  b: { sortOrder: number; title: string }
): number {
  return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "zh-CN");
}

// ---------------------------------------------------------------------------
// DTO → 视图映射
// ---------------------------------------------------------------------------

/**
 * PG 序列化时间（"2026-05-19 09:11:00+00"）归一为 ISO 8601（"2026-05-19T09:11:00.000Z"）。
 * filesystem 数据源的 date/updatedAt 均为 ISO，meta 标签/JSON-LD/sitemap 逐字节比对依赖格式一致。
 */
function toIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function summaryToPost(
  dto: PublicPostSummaryDto,
  updatedAt?: string | null
): Post {
  return {
    slug: dto.slug,
    title: dto.title,
    date: toIso(dto.editorialDate) ?? "",
    // summary DTO 无 updatedAt，由 listPosts 经 /sitemap DTO 补齐；
    // 迁移期无 frontmatter updatedAt 的内容为 null（不虚构），视图层即无"更新于"
    updatedAt: toIso(updatedAt),
    categorySlug: dto.categorySlug,
    category: dto.categoryName,
    tags: dto.tags,
    excerpt: dto.excerpt,
    // 列表场景无正文需求（无消费方），避免 N 次详情请求
    content: "",
    // Public API 仅返回 published（SQL 层硬编码），draft 预览在 api 模式关闭
    status: "published",
    readingTime: dto.readingMinutes,
    coverImage: dto.coverUrl ?? undefined,
    // api 模式无本地文件路径（正文资产已由服务端解析为绝对 URL）
    filePath: "",
  };
}

function detailToPost(dto: PublicPostDetailDto): Post {
  const post = summaryToPost(dto);
  // contentMarkdown 中 asset:// 已被服务端解析为绝对 URL
  post.content = dto.contentMarkdown;
  post.updatedAt = toIso(dto.updatedAt);
  return post;
}

function summaryToCollection(dto: PublicCollectionSummaryDto): CollectionMeta {
  return {
    // core 的 CollectionMeta 含自增 id；api 模式无此概念，页面亦不消费，填 0 占位
    id: 0,
    slug: dto.slug,
    name: dto.name,
    description: dto.description,
    label: dto.label,
    // DTO badge 可空，复刻 core listCollections 的 `badge || name` 兜底
    badge: dto.badge || dto.name,
    noindex: dto.noindex,
    sortOrder: dto.sortOrder,
  };
}

function itemSummaryToNote(dto: {
  slug: string;
  title: string;
  excerpt: string;
  sortOrder: number;
  readingMinutes: number;
}): CollectionNote {
  return {
    slug: dto.slug,
    title: dto.title,
    order: dto.sortOrder,
    content: "",
    excerpt: dto.excerpt,
    readingTime: dto.readingMinutes,
  };
}

// ---------------------------------------------------------------------------
// 文章
// ---------------------------------------------------------------------------

interface PostsResponse {
  posts: PublicPostSummaryDto[];
}

interface PostResponse {
  post: PublicPostDetailDto;
}

interface SitemapResponse {
  sitemap: PublicSitemapDto;
}

async function listPosts(): Promise<Post[]> {
  const [{ posts }, { sitemap }] = await Promise.all([
    // Phase 5 tags：两个独立请求各自打标（join 关系不变）
    fetchJson<PostsResponse>("/api/v1/public/posts", ["post-index"]),
    fetchJson<SitemapResponse>("/api/v1/public/sitemap", ["sitemap"]),
  ]);
  // summary DTO 无 updatedAt：从 sitemap DTO 按 slug 补齐（同一份 memo 化响应），
  // 供排序键与"更新于"展示（sitemap lastModified、首页 JSON-LD、分类页 latestUpdate）；
  // API 返回顺序是 editorialDate desc nulls last, createdAt desc（tie-break 不同），
  // 客户端按 compareByDateDesc 复刻重排
  const updatedAtBySlug = new Map(
    sitemap.posts.map((row) => [row.slug, row.updatedAt])
  );
  return posts
    .map((dto) => summaryToPost(dto, updatedAtBySlug.get(dto.slug)))
    .sort(compareByDateDesc);
}

export async function getAllPosts(): Promise<Post[]> {
  return listPosts();
}

export async function getAllPostSlugs(): Promise<string[]> {
  return (await listPosts()).map((post) => post.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await fetchJsonOrNull<PostResponse>(
    `/api/v1/public/posts/${encodeURIComponent(slug)}`,
    [`post:${slug}`]
  );
  return data ? detailToPost(data.post) : null;
}

export async function getPostsByCategory(
  categorySlug: string
): Promise<Post[]> {
  // 与 filesystem 语义一致：从全量已发布列表过滤（同一份 memo 化的列表响应）
  return (await listPosts()).filter(
    (post) => post.categorySlug === categorySlug
  );
}

// ---------------------------------------------------------------------------
// 分类（复刻 lib/posts.ts getAllCategories / getOfficialCategories 语义）
// ---------------------------------------------------------------------------

interface CategoriesResponse {
  categories: PublicCategoryDto[];
}

async function listCategoryDtos(): Promise<PublicCategoryDto[]> {
  const { categories } = await fetchJson<CategoriesResponse>(
    "/api/v1/public/categories",
    ["categories"]
  );
  return categories;
}

export async function getAllCategories(): Promise<Category[]> {
  const rows = await listCategoryDtos();

  // 官方分类（不含 uncategorized），计数取服务端 publishedCount（published-only，
  // 与 filesystem 侧统计可见文章数等价）
  const official = rows
    .filter((row) => row.slug !== "uncategorized")
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      count: row.publishedCount,
    }));

  // uncategorized 特例：仅在有已发布文章时出现
  const uncategorizedRow = rows.find((row) => row.slug === "uncategorized");
  const customCategories =
    uncategorizedRow && uncategorizedRow.publishedCount > 0
      ? [
          {
            slug: uncategorizedRow.slug,
            name: uncategorizedRow.name,
            count: uncategorizedRow.publishedCount,
            description: uncategorizedRow.description,
          },
        ]
      : [];

  return [...official, ...customCategories].sort((a, b) => b.count - a.count);
}

export async function getOfficialCategories(): Promise<
  Array<Pick<Category, "slug" | "name" | "description">>
> {
  return (await listCategoryDtos())
    .filter((row) => row.slug !== "uncategorized")
    .map(({ slug, name, description }) => ({ slug, name, description }));
}

export async function getPostStats(): Promise<PostStats> {
  // api 模式 draft 不可见：total = published，draft = 0。
  // 注意与 filesystem 的语义分叉：filesystem 的 total 含 dev 预览 draft。
  // 公开 API 无 draft 数据源，无法复刻；当前页面只渲染 published/tags/readingMinutes，
  // 若未来有页面消费 stats.total/draft 需重新评估（K3 Phase 4 复核记录）。
  const posts = await listPosts();
  const tagMap = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return {
    total: posts.length,
    published: posts.length,
    draft: 0,
    categories: await getAllCategories(),
    tags: Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    readingMinutes: posts.reduce(
      (total, post) => total + (post.readingTime || 0),
      0
    ),
  };
}

// ---------------------------------------------------------------------------
// 专栏
// ---------------------------------------------------------------------------

interface CollectionsResponse {
  collections: PublicCollectionSummaryDto[];
}

interface CollectionResponse {
  collection: PublicCollectionDetailDto;
}

interface CollectionItemResponse {
  item: PublicCollectionItemDetailDto;
}

async function fetchCollectionDetail(
  slug: string
): Promise<PublicCollectionDetailDto | null> {
  const data = await fetchJsonOrNull<CollectionResponse>(
    `/api/v1/public/collections/${encodeURIComponent(slug)}`,
    [`collection:${slug}`]
  );
  return data ? data.collection : null;
}

export async function getAllCollections(): Promise<CollectionMeta[]> {
  const { collections } = await fetchJson<CollectionsResponse>(
    "/api/v1/public/collections",
    ["collections"]
  );
  return collections.map(summaryToCollection);
}

export async function getCollection(
  slug: string
): Promise<CollectionMeta | null> {
  const detail = await fetchCollectionDetail(slug);
  return detail ? summaryToCollection(detail) : null;
}

export async function getCollectionNotes(
  collectionSlug: string
): Promise<CollectionNote[]> {
  const detail = await fetchCollectionDetail(collectionSlug);
  if (!detail) {
    return [];
  }
  // API items 按 PG collation 排序，按 compareNotesByOrder 复刻重排（先排后映射）
  return detail.items.slice().sort(compareNotesByOrder).map(itemSummaryToNote);
}

export async function getCollectionNote(
  collectionSlug: string,
  noteSlug: string
): Promise<CollectionNote | null> {
  const data = await fetchJsonOrNull<CollectionItemResponse>(
    `/api/v1/public/collections/${encodeURIComponent(
      collectionSlug
    )}/items/${encodeURIComponent(noteSlug)}`,
    [`collection-item:${collectionSlug}:${noteSlug}`]
  );
  if (!data) {
    return null;
  }
  const note = itemSummaryToNote(data.item);
  // contentMarkdown 中 asset:// 已被服务端解析为绝对 URL
  note.content = data.item.contentMarkdown;
  return note;
}

// ---------------------------------------------------------------------------
// 渲染与工具
// ---------------------------------------------------------------------------

export function getPostHeadings(markdown: string): PostHeading[] {
  return coreGetPostHeadings(markdown);
}

/**
 * api 模式正文渲染：注入 BASE_PATH（站内 /images 等绝对路径），但不传 assetBase、
 * 不做 WebP manifest 替换——detail DTO 的 contentMarkdown 里 asset:// 已被服务端
 * 解析为对象存储绝对 URL，无随文档资产可重写（WEB-202/FR-6.3 的 api 形态）。
 * assetBase 形参仅为与 filesystem 实现对齐签名，一律忽略。
 */
export async function markdownToHtml(
  markdown: string,
  headings: PostHeading[] = coreGetPostHeadings(markdown),
  _assetBase?: string
): Promise<string> {
  const basePath = process.env.BASE_PATH || "";
  return coreMarkdownToHtml(markdown, { basePath, headings });
}

/** api 模式无随文档资产目录（资产走对象存储绝对 URL），返回空串；调用方传入后亦被 markdownToHtml 忽略 */
export function docAssetBase(_filePath: string): string {
  return "";
}

/** api 模式只读 published 内容，草稿预览恒关闭 */
export function isDraftPreviewEnabled(): boolean {
  return false;
}

/** 复刻 lib/posts.ts toPostSummary（值函数无法跨模块图复用，WEB-202） */
export function toPostSummary(post: Post): PostSummary {
  const { content: _content, filePath: _filePath, ...summary } = post;
  return summary;
}
