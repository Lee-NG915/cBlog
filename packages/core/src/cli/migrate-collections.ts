/**
 * 一次性迁移（FR-5.3）：docs/rightCapital、docs/addx-ai → content/collections/<slug>/
 * 为每个文件补 frontmatter（title/slug/order/status），slug 与 order 按原文件名解析
 * 逻辑计算（迁自 lib/rightCapital.ts、lib/addxAi.ts），保证 URL 完全兼容。
 * 迁移后源目录由 git rm 移除（在外层执行）。
 */
import fs from "node:fs";
import path from "node:path";
import { repoPath } from "../paths";
import { serializeMarkdown } from "../content/frontmatter";

interface ParsedName {
  order: number;
  title: string;
  slug: string;
}

/** 原 lib/addxAi.ts 的 META_NOTES 特例 */
const ADDX_META_NOTES: Record<string, ParsedName> = {
  "复习索引.md": { order: 0, title: "复习索引", slug: "index" },
  "面试准备总览.md": { order: 90, title: "面试准备总览", slug: "overview" },
  "company-research.md": {
    order: 91,
    title: "公司研究",
    slug: "company-research",
  },
};

function parseRightCapitalFilename(filename: string): ParsedName {
  const stem = filename.replace(/\.md$/, "");
  const match = stem.match(/^(\d+)\.(.+)$/);

  if (match) {
    const order = Number.parseInt(match[1], 10);
    return { order, title: match[2], slug: String(order).padStart(2, "0") };
  }

  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return { order: 999, title: stem, slug: slug || "note" };
}

function parseAddxAiFilename(filename: string): ParsedName {
  const meta = ADDX_META_NOTES[filename];
  if (meta) return meta;

  const stem = filename.replace(/\.md$/, "");
  const match = stem.match(/^(\d+)[-.](.+)$/);

  if (match) {
    const order = Number.parseInt(match[1], 10);
    return { order, title: match[2], slug: String(order).padStart(2, "0") };
  }

  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return { order: 999, title: stem, slug: slug || "note" };
}

const SOURCES = [
  {
    sourceDir: repoPath("docs", "rightCapital"),
    collectionSlug: "rightCapital",
    parse: parseRightCapitalFilename,
  },
  {
    sourceDir: repoPath("docs", "addx-ai"),
    collectionSlug: "addx-ai",
    parse: parseAddxAiFilename,
  },
];

let migrated = 0;
for (const { sourceDir, collectionSlug, parse } of SOURCES) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`跳过（源目录不存在）: ${sourceDir}`);
    continue;
  }

  const targetDir = repoPath("content", "collections", collectionSlug);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const filename of fs.readdirSync(sourceDir).sort()) {
    if (!filename.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(sourceDir, filename), "utf8");
    const { order, title, slug } = parse(filename);

    const withFrontmatter = serializeMarkdown(
      { title, slug, order, status: "published" },
      raw
    );
    fs.writeFileSync(path.join(targetDir, filename), withFrontmatter);
    migrated += 1;
    console.log(`  ${collectionSlug}/${filename} -> slug=${slug} order=${order}`);
  }
}

console.log(`迁移完成: ${migrated} 个专栏文档写入 content/collections/`);
