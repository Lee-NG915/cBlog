import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

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
  draft?: boolean;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Category {
  name: string;
  count: number;
}

function getAllMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith(".md")) {
      const relativePath = path.relative(postsDirectory, filePath);
      fileList.push(relativePath);
    }
  });

  return fileList;
}

function getSlugFromPath(filePath: string): string {
  const fileName = path.basename(filePath, ".md");
  return fileName;
}

function extractDateFromPath(filePath: string): string | null {
  const parts = filePath.split(path.sep);
  const yearMatch = parts.find((part) => /^\d{4}$/.test(part));
  if (!yearMatch) return null;

  const yearIndex = parts.indexOf(yearMatch);
  const monthPart = parts[yearIndex + 1];
  const dayPart = parts[yearIndex + 2];

  if (monthPart && /^\d{2}$/.test(monthPart)) {
    if (dayPart && /^\d{2}$/.test(dayPart)) {
      return `${yearMatch}-${monthPart}-${dayPart}`;
    }
    return `${yearMatch}-${monthPart}-01`;
  }

  return null;
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  const allPostsData = markdownFiles.map((relativePath) => {
    const fullPath = path.join(postsDirectory, relativePath);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const pathDate = extractDateFromPath(relativePath);
    const slug = getSlugFromPath(relativePath);

    return {
      slug,
      title: data.title || slug,
      date: data.date || pathDate || "",
      category: data.category || "未分类",
      excerpt: data.excerpt || "",
      content,
      readingTime: calculateReadingTime(content),
      coverImage: processImagePath(
        data.coverCard || data.coverImage || undefined
      ),
      draft: data.draft || false,
    } as Post;
  });

  return allPostsData
    .filter((post) => !post.draft)
    .sort((a, b) => {
      if (a.date < b.date) {
        return 1;
      } else {
        return -1;
      }
    });
}

export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

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

export function getPostBySlug(slug: string): Post | null {
  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  const matchedFile = markdownFiles.find((filePath) => {
    const fileSlug = getSlugFromPath(filePath);
    return fileSlug === slug;
  });

  if (!matchedFile) {
    return null;
  }

  const fullPath = path.join(postsDirectory, matchedFile);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const pathDate = extractDateFromPath(matchedFile);

  return {
    slug,
    title: data.title || slug,
    date: data.date || pathDate || "",
    category: data.category || "未分类",
    excerpt: data.excerpt || "",
    content,
    readingTime: calculateReadingTime(content),
    coverImage: processImagePath(
      data.coverCard || data.coverImage || undefined
    ),
    draft: data.draft || false,
  } as Post;
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const markdownFiles = getAllMarkdownFiles(postsDirectory);
  return markdownFiles.map((filePath) => getSlugFromPath(filePath));
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");
    toc.push({ id, text, level });
  }

  return toc;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  let htmlContent = result.toString();

  const basePath = process.env.BASE_PATH || "";
  if (basePath) {
    htmlContent = htmlContent.replace(
      /<img([^>]*)\ssrc="\//g,
      `<img$1 src="${basePath}/`
    );
    htmlContent = htmlContent.replace(
      /src="\/(images\/[^"]+)"/g,
      `src="${basePath}/$1"`
    );
  }

  return htmlContent;
}

function calculateReadingTime(content: string): number {
  const chineseCharCount = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWordCount = content
    .split(/\s+/)
    .filter((word) => /^[a-zA-Z]+$/.test(word)).length;
  const totalWords = chineseCharCount + englishWordCount;
  const readingTime = Math.ceil(totalWords / 250);
  return readingTime || 1;
}
