import matter from "gray-matter";

export interface ParsedMarkdown {
  data: Record<string, unknown>;
  content: string;
}

export function parseMarkdown(raw: string): ParsedMarkdown {
  const { data, content } = matter(raw);
  return { data: data as Record<string, unknown>, content };
}

/**
 * 已知字段固定顺序（FR-2.3：保证回写后 git diff 稳定）。
 * coverCard 为存量别名，解析时归一到 coverImage，回写时统一写 coverImage。
 */
const KNOWN_KEY_ORDER = [
  "title",
  "slug",
  "date",
  "updatedAt",
  "category",
  "tags",
  "excerpt",
  "coverImage",
  "status",
] as const;

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  updatedAt?: string;
  /** 分类 slug（回写统一使用 slug，解析兼容名称） */
  category: string;
  tags: string[];
  excerpt: string;
  coverImage?: string;
  status: string;
}

/**
 * 构造有序 frontmatter 对象：已知字段按固定顺序，未知字段按原有顺序追加保留。
 */
export function buildOrderedFrontmatter(
  meta: PostFrontmatter,
  originalData: Record<string, unknown> = {}
): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  const source: Record<string, unknown> = {
    title: meta.title,
    slug: meta.slug,
    date: meta.date,
    updatedAt: meta.updatedAt,
    category: meta.category,
    tags: meta.tags,
    excerpt: meta.excerpt,
    coverImage: meta.coverImage,
    status: meta.status,
  };

  for (const key of KNOWN_KEY_ORDER) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      ordered[key] = value;
    } else if (key === "tags") {
      ordered.tags = [];
    }
  }

  for (const [key, value] of Object.entries(originalData)) {
    if ((KNOWN_KEY_ORDER as readonly string[]).includes(key)) continue;
    if (key === "coverCard") continue; // 归一到 coverImage，避免双字段
    ordered[key] = value;
  }

  return ordered;
}

export function serializeMarkdown(
  frontmatter: Record<string, unknown>,
  content: string
): string {
  const normalizedContent = content.startsWith("\n") ? content : `\n${content}`;
  return matter.stringify(normalizedContent, frontmatter);
}
