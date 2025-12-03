import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

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

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt?: string;
  content: string;
  readingTime?: number;
  coverImage?: string;
}

export interface Category {
  name: string;
  count: number;
}

// 获取所有文章
export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        category: data.category || "未分类",
        excerpt: data.excerpt || "",
        content,
        readingTime: calculateReadingTime(content),
        coverImage: processImagePath(
          data.coverCard || data.coverImage || undefined
        ),
      } as Post;
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 根据分类获取文章
export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

// 获取所有分类
export function getAllCategories(): Category[] {
  const allPosts = getAllPosts();
  const categoryMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const count = categoryMap.get(post.category) || 0;
    categoryMap.set(post.category, count + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 根据 slug 获取文章
export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    date: data.date || "",
    category: data.category || "未分类",
    excerpt: data.excerpt || "",
    content,
    readingTime: calculateReadingTime(content),
    coverImage: processImagePath(
      data.coverCard || data.coverImage || undefined
    ),
  } as Post;
}

// 获取所有文章的 slug
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

// 将 Markdown 转换为 HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown);
  let htmlContent = result.toString();

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
