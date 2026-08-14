/**
 * Markdown 渲染管道（纯函数，无 fs/env 依赖）：
 * apps/web 构建与 apps/admin 浏览器端预览共用，保证两端渲染一致（FR-3.3）。
 * 逻辑迁自原 apps/web/lib/posts.ts，行为保持不变。
 */
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

export interface PostHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

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

export interface MarkdownToHtmlOptions {
  basePath?: string;
  headings?: PostHeading[];
}

export async function markdownToHtml(
  markdown: string,
  options: MarkdownToHtmlOptions = {}
): Promise<string> {
  const headings = options.headings ?? getPostHeadings(markdown);
  const basePath = options.basePath ?? "";

  const result = await remark().use(remarkGfm).use(html).process(markdown);
  let htmlContent = result.toString();
  htmlContent = enhanceMermaidBlocks(htmlContent);
  htmlContent = addHeadingIds(htmlContent, headings);

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
    .replace(/[^a-z0-9一-鿿-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}
