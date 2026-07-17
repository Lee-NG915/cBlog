import fs from "fs";
import path from "path";

const notesDirectory = path.join(process.cwd(), "docs/rightCapital");

export interface RightCapitalNote {
  slug: string;
  title: string;
  order: number;
  content: string;
  excerpt: string;
  readingTime: number;
  filename: string;
}

function parseFilename(filename: string): {
  order: number;
  title: string;
  slug: string;
} {
  const stem = filename.replace(/\.md$/, "");
  const match = stem.match(/^(\d+)\.(.+)$/);

  if (match) {
    const order = Number.parseInt(match[1], 10);
    return {
      order,
      title: match[2],
      slug: String(order).padStart(2, "0"),
    };
  }

  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    order: 999,
    title: stem,
    slug: slug || "note",
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 图片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 链接
    .replace(/`([^`]+)`/g, "$1") // 行内代码
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // 加粗
    .replace(/(\*|_)(.*?)\1/g, "$2") // 斜体
    .replace(/~~(.*?)~~/g, "$1") // 删除线
    .replace(/^\s{0,3}>\s?/gm, "") // 引用标记
    .replace(/<[^>]+>/g, "") // HTML 标签
    .replace(/\s+/g, " ")
    .trim();
}

function getExcerpt(content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const plain = stripMarkdown(trimmed);
    if (!plain) {
      continue;
    }

    return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
  }

  return "";
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const cjkChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalWords = words + Math.ceil(cjkChars / 2);
  return Math.max(1, Math.ceil(totalWords / 250));
}

function readNoteFromFile(filename: string): RightCapitalNote {
  const fullPath = path.join(notesDirectory, filename);
  const content = fs.readFileSync(fullPath, "utf8");
  const { order, title, slug } = parseFilename(filename);

  return {
    slug,
    title,
    order,
    content,
    excerpt: getExcerpt(content),
    readingTime: calculateReadingTime(content),
    filename,
  };
}

export function getAllRightCapitalNotes(): RightCapitalNote[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(notesDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(readNoteFromFile)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"));
}

export function getRightCapitalNoteBySlug(slug: string): RightCapitalNote | null {
  return getAllRightCapitalNotes().find((note) => note.slug === slug) ?? null;
}

export function getAllRightCapitalSlugs(): string[] {
  return getAllRightCapitalNotes().map((note) => note.slug);
}
