/**
 * 文章数据适配层：元数据来自数据库（@cblog/core），正文来自 md 文件。
 * 对 app/components 保持与旧实现完全一致的导出 API 与行为（展示等价）。
 */
import {
  calculateReadingTime,
  listCategories,
  listPostMetas,
  readPostContent,
  type PostMeta,
} from "@cblog/core";
import {
  getPostHeadings as coreGetPostHeadings,
  markdownToHtml as coreMarkdownToHtml,
  type PostHeading,
} from "@cblog/core/markdown";

// 处理图片路径，添加 basePath
function processImagePath(imagePath: string | undefined): string | undefined {
  if (!imagePath) return undefined;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    const basePath = process.env.BASE_PATH || "";
    return basePath + imagePath;
  }

  return imagePath;
}

/** 仅开发环境（npm run dev）展示草稿；生产构建与静态导出仍只发已发布文章 */
export function isDraftPreviewEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  updatedAt?: string;
  categorySlug: string;
  category: string;
  tags: string[];
  excerpt?: string;
  content: string;
  status: "published" | "draft";
  readingTime?: number;
  coverImage?: string;
}

/** 列表展示用，不含正文，便于传给客户端组件 */
export type PostSummary = Omit<Post, "content">;

export function toPostSummary(post: Post): PostSummary {
  const { content: _content, ...summary } = post;
  return summary;
}

export interface Category {
  slug: string;
  name: string;
  count: number;
  description: string;
}

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  categories: Category[];
  tags: Array<{ name: string; count: number }>;
  readingMinutes: number;
}

export type { PostHeading };

function metaToPost(meta: PostMeta): Post {
  const content = readPostContent(meta.filePath);
  return {
    slug: meta.slug,
    title: meta.title,
    date: meta.date,
    updatedAt: meta.updatedAt,
    categorySlug: meta.categorySlug,
    category: meta.category,
    tags: meta.tags,
    excerpt: meta.excerpt,
    content,
    // archived 已在上游过滤，此处仅剩两态
    status: meta.status === "draft" ? "draft" : "published",
    readingTime: calculateReadingTime(content),
    coverImage: processImagePath(meta.coverImage),
  };
}

// 获取列表展示用文章（开发环境含草稿）
export function getAllPosts(): Post[] {
  const allPosts = getAllPostsIncludingDrafts();
  if (isDraftPreviewEnabled()) {
    return allPosts;
  }
  return allPosts.filter((post) => post.status === "published");
}

/** 全部文章（含草稿）。archived 任何环境均不出现（PRD §4 状态机）。 */
export function getAllPostsIncludingDrafts(): Post[] {
  return listPostMetas()
    .filter((meta) => meta.status !== "archived")
    .map(metaToPost);
}

// 根据分类 slug 获取文章
export function getPostsByCategory(categorySlug: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

/** 官方分类（不含"未分类"兜底），按管理端排序，供页脚等全量展示场景使用 */
export function getOfficialCategories(): Array<
  Pick<Category, "slug" | "name" | "description">
> {
  return listCategories()
    .filter((category) => category.slug !== "uncategorized")
    .map(({ slug, name, description }) => ({ slug, name, description }));
}

// 获取所有分类（带可见文章计数；未分类仅在有文章时出现）
export function getAllCategories(): Category[] {
  const allPosts = getAllPosts();
  const categoryMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const count = categoryMap.get(post.categorySlug) || 0;
    categoryMap.set(post.categorySlug, count + 1);
  });

  const rows = listCategories();
  const official = rows
    .filter((row) => row.slug !== "uncategorized")
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      count: categoryMap.get(row.slug) || 0,
    }));

  const uncategorizedRow = rows.find((row) => row.slug === "uncategorized");
  const uncategorizedCount = categoryMap.get("uncategorized") || 0;
  const customCategories =
    uncategorizedCount > 0 && uncategorizedRow
      ? [
          {
            slug: uncategorizedRow.slug,
            name: uncategorizedRow.name,
            count: uncategorizedCount,
            description: uncategorizedRow.description,
          },
        ]
      : [];

  return [...official, ...customCategories].sort((a, b) => b.count - a.count);
}

// 根据 slug 获取文章
export function getPostBySlug(slug: string): Post | null {
  const meta = listPostMetas().find(
    (item) => item.slug === slug && item.status !== "archived"
  );
  if (!meta) {
    return null;
  }

  const post = metaToPost(meta);
  if (post.status === "draft" && !isDraftPreviewEnabled()) {
    return null;
  }

  return post;
}

/**
 * 供 generateStaticParams 使用。
 * output:export 要求所有动态路由在此列出；开发环境包含草稿以便本地预览。
 */
export function getAllPostSlugs(): string[] {
  const posts = getAllPostsIncludingDrafts();
  const visible = isDraftPreviewEnabled()
    ? posts
    : posts.filter((post) => post.status === "published");

  return visible.map((post) => post.slug);
}

export function getPostStats(): PostStats {
  const allPosts = getAllPostsIncludingDrafts();
  const publishedPosts = allPosts.filter((post) => post.status === "published");
  const tagMap = new Map<string, number>();

  publishedPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return {
    total: allPosts.length,
    published: publishedPosts.length,
    draft: allPosts.length - publishedPosts.length,
    categories: getAllCategories(),
    tags: Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    readingMinutes: publishedPosts.reduce(
      (total, post) => total + (post.readingTime || 0),
      0
    ),
  };
}

export function getPostHeadings(markdown: string): PostHeading[] {
  return coreGetPostHeadings(markdown);
}

// 将 Markdown 转换为 HTML（basePath 图片路径处理在 core 渲染层完成）
export async function markdownToHtml(
  markdown: string,
  headings: PostHeading[] = coreGetPostHeadings(markdown)
): Promise<string> {
  return coreMarkdownToHtml(markdown, {
    basePath: process.env.BASE_PATH || "",
    headings,
  });
}
