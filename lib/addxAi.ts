import fs from "fs";
import path from "path";

const notesDirectory = path.join(process.cwd(), "docs/addx-ai");

/** 无数字前缀的笔记：固定顺序与 slug，便于路由稳定 */
const META_NOTES: Record<string, { order: number; title: string; slug: string }> =
  {
    "复习索引.md": { order: 0, title: "复习索引", slug: "index" },
    "面试准备总览.md": {
      order: 90,
      title: "面试准备总览",
      slug: "overview",
    },
    "company-research.md": {
      order: 91,
      title: "公司研究",
      slug: "company-research",
    },
  };

export interface AddxAiNote {
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
  const meta = META_NOTES[filename];
  if (meta) {
    return meta;
  }

  const stem = filename.replace(/\.md$/, "");
  // 01-架构重构-Monorepo-DDD / 01.标题
  const match = stem.match(/^(\d+)[-.](.+)$/);

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
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    order: 999,
    title: stem,
    slug: slug || "note",
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/<[^>]+>/g, "")
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

function readNoteFromFile(filename: string): AddxAiNote {
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

export function getAllAddxAiNotes(): AddxAiNote[] {
  if (!fs.existsSync(notesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(notesDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(readNoteFromFile)
    .sort(
      (a, b) => a.order - b.order || a.title.localeCompare(b.title, "zh-CN"),
    );
}

export function getAddxAiNoteBySlug(slug: string): AddxAiNote | null {
  return getAllAddxAiNotes().find((note) => note.slug === slug) ?? null;
}

export function getAllAddxAiSlugs(): string[] {
  return getAllAddxAiNotes().map((note) => note.slug);
}
