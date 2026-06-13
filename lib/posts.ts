import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import { getCategoryBySlug, postCategories, resolveCategory } from "./site";

// 处理图片路径，添加 basePath
function processImagePath(imagePath: string | undefined): string | undefined {
  if (!imagePath) return undefined;

  // 如果已经是完整 URL，直接返回
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // 如果路径以 / 开头，添加 basePath
  if (imagePath.startsWith("/")) {
    const basePath = process.env.BASE_PATH || "";
    return basePath + imagePath;
  }

  return imagePath;
}

const postsDirectory = path.join(process.cwd(), "content/posts");

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

export interface PostHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * 递归获取目录下所有 Markdown 文件
 * 支持新文章包结构和旧日期结构。
 */
function getAllMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归读取子目录
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      // 保存相对路径（相对于 postsDirectory）
      const relativePath = path.relative(postsDirectory, filePath);
      fileList.push(relativePath);
    }
  });

  return fileList;
}

/**
 * 从文件路径生成 slug
 * 支持 legacy 结构：2024/01/01/hello-world.md -> hello-world
 * 支持新结构：technical/2024/hello-world/index.md -> hello-world
 */
function getSlugFromPath(filePath: string, slug?: unknown): string {
  if (typeof slug === "string" && slug.trim()) {
    return slug.trim();
  }

  const fileName = path.basename(filePath, ".md");
  if (fileName !== "index") {
    return fileName;
  }

  return path.basename(path.dirname(filePath));
}

function getCategoryFromPath(
  filePath: string,
  category?: unknown
): Pick<Post, "category" | "categorySlug"> {
  if (typeof category === "string" && category.trim()) {
    const matchedCategory = resolveCategory(category.trim());
    if (matchedCategory) {
      return {
        category: matchedCategory.name,
        categorySlug: matchedCategory.slug,
      };
    }
  }

  const [categorySlug] = filePath.split(path.sep);
  const matchedCategory = getCategoryBySlug(categorySlug);
  if (matchedCategory) {
    return {
      category: matchedCategory.name,
      categorySlug: matchedCategory.slug,
    };
  }

  return {
    category: "未分类",
    categorySlug: "uncategorized",
  };
}

/**
 * 从文件路径提取日期（如果路径包含日期信息）
 * 新结构一般使用 frontmatter.date；旧结构可从路径兜底提取。
 * 例如：2024/01/01/hello-world.md -> 2024-01-01
 * 或者：2024/01/hello-world.md -> 2024-01-01（使用 01 作为日期）
 */
function extractDateFromPath(filePath: string): string | null {
  const parts = filePath.split(path.sep);
  // 查找符合 YYYY/MM/DD 或 YYYY/MM 格式的路径部分
  const yearMatch = parts.find((part) => /^\d{4}$/.test(part));
  if (!yearMatch) return null;

  const yearIndex = parts.indexOf(yearMatch);
  const monthPart = parts[yearIndex + 1];
  const dayPart = parts[yearIndex + 2];

  if (monthPart && /^\d{2}$/.test(monthPart)) {
    if (dayPart && /^\d{2}$/.test(dayPart)) {
      return `${yearMatch}-${monthPart}-${dayPart}`;
    }
    // 如果没有日期，使用 01
    return `${yearMatch}-${monthPart}-01`;
  }

  return null;
}

function normalizeDate(date: unknown): string {
  if (!date) {
    return "";
  }

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return String(date).trim();
}

function comparePostsByDateDesc(a: Post, b: Post): number {
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

// 获取列表展示用文章（开发环境含草稿）
export function getAllPosts(): Post[] {
  const allPosts = getAllPostsIncludingDrafts();
  if (isDraftPreviewEnabled()) {
    return allPosts;
  }
  return allPosts.filter((post) => post.status === "published");
}

export function getAllPostsIncludingDrafts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  return getAllMarkdownFiles(postsDirectory)
    .map((relativePath) => {
      const fullPath = path.join(postsDirectory, relativePath);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const pathDate = extractDateFromPath(relativePath);
      const slug = getSlugFromPath(relativePath, data.slug);
      const category = getCategoryFromPath(relativePath, data.category);

      return normalizePost({
        slug,
        title: data.title || slug,
        date: normalizeDate(data.date) || pathDate || "",
        updatedAt: normalizeDate(data.updatedAt) || undefined,
        ...category,
        excerpt: data.excerpt || "",
        content,
        tags: normalizeTags(data.tags),
        status: data.status === "draft" ? "draft" : "published",
        coverImage: processImagePath(
          data.coverCard || data.coverImage || undefined
        ),
      });
    })
    .sort(comparePostsByDateDesc);
}

// 根据分类 slug 获取文章
export function getPostsByCategory(categorySlug: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.categorySlug === categorySlug);
}

// 获取所有分类
export function getAllCategories(): Category[] {
  const allPosts = getAllPosts();
  const categoryMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const count = categoryMap.get(post.categorySlug) || 0;
    categoryMap.set(post.categorySlug, count + 1);
  });

  const categories = postCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    count: categoryMap.get(category.slug) || 0,
  }));

  const uncategorizedCount = categoryMap.get("uncategorized") || 0;
  const customCategories =
    uncategorizedCount > 0
      ? [
          {
            slug: "uncategorized",
            name: "未分类",
            count: uncategorizedCount,
            description: "尚未配置到固定阅读路径的文章。",
          },
        ]
      : [];

  return [...categories, ...customCategories].sort((a, b) => b.count - a.count);
}

// 根据 slug 获取文章
export function getPostBySlug(slug: string): Post | null {
  // 递归查找匹配的文件
  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  const matchedFile = markdownFiles.find((filePath) => {
    const fullPath = path.join(postsDirectory, filePath);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    const fileSlug = getSlugFromPath(filePath, data.slug);
    return fileSlug === slug;
  });

  if (!matchedFile) {
    return null;
  }

  const fullPath = path.join(postsDirectory, matchedFile);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // 从路径提取日期作为默认值
  const pathDate = extractDateFromPath(matchedFile);
  const category = getCategoryFromPath(matchedFile, data.category);

  const post = normalizePost({
    slug,
    title: data.title || slug,
    date: normalizeDate(data.date) || pathDate || "",
    updatedAt: normalizeDate(data.updatedAt) || undefined,
    ...category,
    excerpt: data.excerpt || "",
    content,
    tags: normalizeTags(data.tags),
    status: data.status === "draft" ? "draft" : "published",
    coverImage: processImagePath(
      data.coverCard || data.coverImage || undefined
    ),
  });

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

// 将 Markdown 转换为 HTML
export function getPostHeadings(markdown: string): PostHeading[] {
  const slugCounts = new Map<string, number>();

  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
      if (!match) {
        return null;
      }

      const level = match[1].length;
      if (level !== 2 && level !== 3) {
        return null;
      }

      const text = normalizeHeadingText(match[2]);
      if (!text) {
        return null;
      }

      const baseSlug = slugifyHeading(text);
      const duplicateCount = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, duplicateCount + 1);

      return {
        id: duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount + 1}`,
        text,
        level,
      } satisfies PostHeading;
    })
    .filter((heading): heading is PostHeading => heading !== null);
}

export async function markdownToHtml(
  markdown: string,
  headings: PostHeading[] = getPostHeadings(markdown)
): Promise<string> {
  const result = await remark().use(remarkGfm).use(html).process(markdown);
  let htmlContent = result.toString();
  htmlContent = enhanceMermaidBlocks(htmlContent);
  htmlContent = addHeadingIds(htmlContent, headings);

  // 处理图片路径，添加 basePath（如果需要）
  const basePath = process.env.BASE_PATH || "";
  if (basePath) {
    // 替换所有 <img src="/... 为 <img src="{basePath}/...
    htmlContent = htmlContent.replace(
      /<img([^>]*)\ssrc="\//g,
      `<img$1 src="${basePath}/`
    );
    // 也处理 Markdown 转换后的图片标签
    htmlContent = htmlContent.replace(
      /src="\/(images\/[^"]+)"/g,
      `src="${basePath}/$1"`
    );
  }

  return htmlContent;
}

function addHeadingIds(htmlContent: string, headings: PostHeading[]): string {
  const queue = [...headings];

  return htmlContent.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, levelValue) => {
    const heading = queue.shift();
    if (!heading || heading.level !== Number(levelValue)) {
      return match;
    }

    const scrollMarginClass = heading.level === 2 ? "scroll-mt-28" : "scroll-mt-24";
    return match.replace(
      /^<h([23])>/,
      `<h$1 id="${heading.id}" class="${scrollMarginClass}">`
    );
  });
}

function enhanceMermaidBlocks(htmlContent: string): string {
  return htmlContent.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, encodedDiagram: string) => {
      const diagram = decodeHtmlEntities(encodedDiagram).trim();
      const dataMermaid = encodeURIComponent(diagram);

      return [
        '<figure class="mermaid-figure">',
        `<div role="button" tabindex="0" class="mermaid-diagram" data-mermaid="${dataMermaid}" data-title="Mermaid 图例" aria-label="展开 Mermaid 图例">`,
        '<span class="mermaid-placeholder">图例加载中...</span>',
        "</div>",
        "<figcaption>点击图例查看大图</figcaption>",
        "</figure>",
      ].join("");
    }
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_match, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    );
}

function normalizeHeadingText(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function slugifyHeading(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

// 计算阅读时间（基于中文字符数）
function calculateReadingTime(content: string): number {
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWordCount = content
    .split(/\s+/)
    .filter((word) => /^[a-zA-Z]+$/.test(word)).length;
  const totalWords = chineseCharCount + englishWordCount;
  // 假设阅读速度：中文 300 字/分钟，英文 200 词/分钟
  const readingTime = Math.ceil(totalWords / 250);
  return readingTime || 1;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(String).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePost(post: Omit<Post, "readingTime">): Post {
  return {
    ...post,
    readingTime: calculateReadingTime(post.content),
  };
}
