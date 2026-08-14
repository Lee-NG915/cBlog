import fs from "node:fs";
import path from "node:path";
import { parseMarkdown } from "./frontmatter";
import { normalizeDate, normalizeTags } from "../utils/text";

/** 递归列出目录下全部 md 文件，返回相对 baseDir 的 POSIX 路径 */
export function listMarkdownFiles(baseDir: string): string[] {
  const acc: string[] = [];
  if (!fs.existsSync(baseDir)) return acc;

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        acc.push(path.relative(baseDir, full).split(path.sep).join("/"));
      }
    }
  };
  walk(baseDir);
  return acc;
}

/** slug 解析：frontmatter.slug > 文件名 > 所在目录名（index.md 时），与原实现一致 */
export function slugFromPath(relPath: string, slugField?: unknown): string {
  if (typeof slugField === "string" && slugField.trim()) {
    return slugField.trim();
  }

  const fileName = path.posix.basename(relPath, ".md");
  if (fileName !== "index") {
    return fileName;
  }

  return path.posix.basename(path.posix.dirname(relPath));
}

/** 旧目录结构的日期兜底：YYYY/MM(/DD) 路径段 → ISO 日期，与原实现一致 */
export function dateFromPath(relPath: string): string | null {
  const parts = relPath.split("/");
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

export interface PostFileMeta {
  filePath: string;
  slug: string;
  title: string;
  date: string;
  updatedAt: string | null;
  /** frontmatter 中的原始 category 值（slug 或名称），未填时为 null */
  categoryRaw: string | null;
  /** 路径首段（分类目录名） */
  pathCategorySlug: string;
  tags: string[];
  excerpt: string;
  status: "draft" | "published" | "archived";
  coverImage: string | null;
  content: string;
}

export function normalizeStatus(
  value: unknown
): "draft" | "published" | "archived" {
  if (value === "draft") return "draft";
  if (value === "archived") return "archived";
  return "published";
}

/** 从文章 md 文件计算全部导入字段（导入与漂移检测共用，保证口径一致） */
export function computePostFileMeta(
  relPath: string,
  raw: string
): PostFileMeta {
  const { data, content } = parseMarkdown(raw);
  const pathDate = dateFromPath(relPath);
  const categoryRaw =
    typeof data.category === "string" && data.category.trim()
      ? data.category.trim()
      : null;

  return {
    filePath: relPath,
    slug: slugFromPath(relPath, data.slug),
    title: (data.title as string) || slugFromPath(relPath, data.slug),
    date: normalizeDate(data.date) || pathDate || "",
    updatedAt: normalizeDate(data.updatedAt) || null,
    categoryRaw,
    pathCategorySlug: relPath.split("/")[0] || "",
    tags: normalizeTags(data.tags),
    excerpt: (data.excerpt as string) || "",
    status: normalizeStatus(data.status),
    coverImage:
      (data.coverCard as string) || (data.coverImage as string) || null,
    content,
  };
}
